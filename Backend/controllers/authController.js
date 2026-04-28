const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail } = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Build user response object
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  authProvider: user.authProvider,
});

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.authProvider === 'google') {
        return res.status(400).json({ message: 'This email is linked to a Google account. Please use "Continue with Google" to sign in.' });
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, authProvider: 'local' });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Sign up first, this email is not registered' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google login. Please use "Continue with Google" to sign in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      return res.status(400).json({ message: 'Google credential or access token is required' });
    }

    let googleId, email, name, picture;

    if (credential) {
      // Verify ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      // Use access_token to fetch user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!response.ok) {
        return res.status(401).json({ message: 'Invalid Google access token' });
      }
      const payload = await response.json();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    // Check if user exists by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google account if user exists by email but not yet linked
      if (!user.googleId) {
        user.googleId = googleId;
        if (user.authProvider === 'local') {
          user.authProvider = 'google';
        }
      }
      // Update profile image if missing
      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        profileImage: picture || '',
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ message: 'Google authentication failed. Please try again.' });
    }
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
      faceDescriptor: user.faceDescriptor,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password — send OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google login. Password reset is not available.' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new one.' });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry +password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetOtp || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
