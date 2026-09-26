# LearnX — Developer Learning Platform

> **Learn • Connect • Build** — A next-generation platform empowering Students, Educators, Freelancers, and Project Distributors with interactive courses, real-time collaboration, verifiable certificates, and project grants.

---

## 🌟 Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript, Socket.IO (Real-time events), Multer
- **Database & ODM**: MongoDB Atlas, Mongoose
- **Authentication**: JWT (Access + Refresh tokens), Bcrypt password hashing, Google OAuth, GitHub OAuth, 6-Digit Email OTP verification
- **Email Delivery**: Resend API
- **Cloud Storage**: Cloudinary (Media, attachments, profile photos, course assets)
- **AI Engine**: Groq API

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your service credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Required / Optional |
|---|---|---|
| `PORT` | Web server port (Default: `3000`) | Optional |
| `MONGODB_URI` | MongoDB Atlas connection string | Recommended |
| `JWT_SECRET` | Secret key for signing access tokens | Required |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Required |
| `RESEND_API_KEY` | Resend API key for OTP verification & emails | Optional (Fallback to console) |
| `EMAIL_FROM` | Sender address (e.g. `onboarding@resend.dev`) | Optional |
| `GMAIL_USER` | Gmail account used to send notification emails | Optional |
| `GMAIL_APP_PASSWORD` | Gmail App Password for `GMAIL_USER` | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional (Local fallback available) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | Optional |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URI | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Optional |
| `GITHUB_CALLBACK_URL` | GitHub OAuth redirect URI | Optional |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant | Optional |

---

## 🎯 Role-Based Capabilities

### 🎓 Students
- Explore courses, enroll in paths, stream lessons, and mark modules completed.
- Generate and download tamper-proof, QR-verified certificates with Canvas/PDF rendering.
- Create multi-media feed posts (images, code snippets, documents).
- Join communities, vote, comment, and engage in real-time discussion.
- Apply to open capstone challenges, submit GitHub & live demo links, and track CI reviews.
- Book 1:1 mentorship slots with verified engineers.

### 👨‍🏫 Course Educators
- Build and publish full curricula with multi-module lessons, video streams, and resources.
- Set course difficulty, categories, and preview toggles. All courses are free.
- Track student enrollments and award certificates of mastery.

### 💼 Freelancers & Mentors
- Publish customizable service offerings, delivery timelines, and hourly rates.
- Host developer workshops and interactive sessions.
- Open mentorship time slots and accept student session requests.

### 🏢 Project Distributors
- Publish real-world capstone challenges, hackathons, and industrial grants.
- Receive student GitHub & live demo submissions.
- Review submissions, trigger automated CI scoring, and provide feedback.

---

## 🛡️ Security & Integrity

- **Password Protection**: Salted Bcrypt (10 rounds).
- **OTP Verification**: Single-use 6-digit random code hashed in database with 10-minute automatic TTL index and 60-second resend cooldown.
- **Route Authorization**: Strict middleware enforcing authenticated tokens and role permissions (`STUDENT`, `EDUCATOR`, `FREELANCER`, `DISTRIBUTOR`).
- **Rate Limiting**: Protection against brute-force attempts on authentication endpoints.
- **Data Persistence**: MongoDB persistence across server restarts and browser reloads, with memory store fallback for offline dev mode.