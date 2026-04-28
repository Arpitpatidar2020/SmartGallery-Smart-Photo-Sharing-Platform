# 📸 SmartGallery - AI-Powered Photo Management

SmartGallery is a modern, full-stack MERN application designed to revolutionize photo management through AI-driven face recognition. It empowers event organizers (Admins) to effortlessly organize photo collections, while allowing participants (Users) to instantly find all photos containing their face using a secure, high-precision face-matching algorithm.

---

## 🌟 Key Features

### 🤖 AI Face Recognition
- **Smart Detection**: Automatically extracts high-dimensional face descriptors using `face-api.js`.
- **Instant Matching**: Compares user profile photos against massive group galleries in real-time.
- **My Images**: A dedicated portal where users see every photo they appear in across all joined groups.

### 📁 Advanced Organization
- **Dynamic Groups**: Create private or public collections with customizable thumbnails.
- **Nested Folders**: Organize photos within groups (e.g., "Event Highlights", "Day 1", "Day 2").
- **Bulk Operations**: One-shot uploads and bulk deletions for efficient management.
- **Personal Favorites**: Users can "heart" photos to curate their own private collection.

### 🔒 Security & Access
- **Private Galleries**: Password-protected groups ensure only authorized participants gain access.
- **Role-Based Dashboards**: Distinct, optimized experiences for Administrators and Users.
- **Secure Auth**: Powered by JWT (JSON Web Tokens) for robust session management.

### ⚡ Premium Experience
- **Responsive Design**: Flawless performance across mobile, tablet, and desktop devices.
- **Rich Aesthetics**: Sleek dark mode UI with smooth micro-animations via Framer Motion.
- **Optimized Storage**: High-performance image hosting and on-the-fly optimization via Cloudinary.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Backend** | ![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) |
| **Cloud/AI** | ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white) ![FaceAPI](https://img.shields.io/badge/Face--API.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white) |

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v16.0 or higher)
- **MongoDB** (Local or Atlas)
- **Cloudinary Account** (For image storage)
- **Gmail App Password** (For email notifications)

### ⚙️ Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/smartgallery.git
   cd smartgallery
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Create .env based on .env.example
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

---

## 🔑 Environment Variables

### Backend (`/Backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### Frontend (`/Frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_id
```

---

## 👨‍💻 Author

**Arpit Patidar**  
*Full Stack Developer & AI Enthusiast*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arpit-patidar-32205724b)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Arpitpatidar2020)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/arpit_patidar2020?igsh=MW8yaTl5Y210MDNlag==)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/arpit.patidar.7311?mibextid=ZbWKwL)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/Arpitpatidar_2020)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:arpitpatidar851@gmail.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for better photo management</p>
