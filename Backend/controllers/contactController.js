// @desc    Submit contact form
// @route   POST /api/contact
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // In production, you might save to DB or send an email
    // For now, just log and respond
    console.log(`📧 Contact Form: ${name} (${email}) - ${message}`);

    res.json({ message: 'Thank you for reaching out! We will get back to you soon.' });
  } catch (error) {
    next(error);
  }
};
