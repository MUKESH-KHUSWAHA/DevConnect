<div align="center">

# 🚀 DevConnect

### A High-Performance, Animated Full-Stack Social Networking Platform for Developers

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=3b82f6&center=true&vCenter=true&width=500&lines=Connect+With+Developers+🌐;Share+Code+Snippets+💻;AI-Powered+Code+Reviews+🤖;Real-Time+Chatting+💬" alt="Typing SVG" />
</p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge&logo=vercel)](https://dev-connect-4akd.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge&logo=render)](https://devconnect-21w4.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/MUKESH-KHUSWAHA/devconnect)

<img src="https://res.cloudinary.com/ddsswptnz/image/upload/v1/devconnect/banner.png" width="100%" alt="DevConnect Banner" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"/>

---

⚡ **DevConnect** is a powerhouse ecosystem built for developers to showcase projects, analyze code using AI, communicate in real time, and discover career opportunities.

</div>

## 📌 Project Origin & Purpose
This platform was engineered as a core asset for **placement preparation**, specifically focusing on solving complex engineering challenges: **real-time bi-directional systems, secure stateless authentication, AI API orchestration, and scalable cloud asset pipelines.**

---

## 🚀 Key Animated & Technical Highlights


```

┌────────────────────────────────────────────────────────┐
│  🤖 LLaMA 3 Code Review   👉   Instant Bug Diagnostics   │
├────────────────────────────────────────────────────────┤
│  ⚡ Socket.IO Engine      👉   Live Chat & Indicators  │
├────────────────────────────────────────────────────────┤
│  🔐 Robust JWT Flow       👉   Secure Password Hashing  │
└────────────────────────────────────────────────────────┘

```

> ⚠️ **Note on Performance:** The backend is hosted on Render's free tier. The initial API handshakes may take **30–50 seconds** while the container spins up. Subsequent requests are lightning fast.

---

## 🎯 Advanced Features Matrix

### 🔐 Ironclad Authentication
*   **State Management:** Secure JWT session tracking matched with persistent context.
*   **Cryptographic Security:** Multi-round `bcrypt.js` password hashing.
*   **Route Guards:** Synchronized frontend & backend middleware route protection.

### 📸 Dynamic Feed & Code Sharing
*   **Rich Media Posts:** Full integration with GitHub metadata, live interaction links, and modular technical tags.
*   **Snippet Sandbox:** Multi-language syntax-supported code sharing.
*   **Social Interactions:** Modular, reactive architecture supporting continuous interactions (Likes, Comments, Bookmarks).

### 💬 Real-Time Chat Engine
*   **Bi-Directional Communication:** Powered by `Socket.IO` for instantaneous thread delivery.
*   **User Telemetry:** Live Online/Offline status polling and asynchronous typing indicators.
*   **UX Enhancements:** Isolated Message Requests pipeline and real-time unread badges.

### 🤖 AI-Integrated Code Inspector
*   **LLM Orchestration:** Direct integration with the **Groq API running LLaMA 3**.
*   **Diagnostic Outputs:** Automated edge-case bug detection, performance optimization algorithms, and asymptotic ($O(n)$) time-complexity evaluations.

---

## 🛠️ Tech Stack & Architecture

<div align="center">

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css) |
| **State & Networking**| ![Zustand](https://img.shields.io/badge/Zustand-443322?style=flat-square) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io) |
| **Backend Engine** | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express) |
| **Database & Cloud** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb) ![Cloudinary](https://img.shields.io/badge/Cloudinary-34495E?style=flat-square&logo=cloudinary) |

</div>

---

## 📁 System Topology

```bash
devconnect/
├── backend/                  # Monolith Express Server
│   ├── config/               # Database and API Configs
│   ├── controllers/          # Business Logic Layers
│   ├── middleware/           # Auth and File-Upload Filters
│   ├── models/               # MongoDB Document Schemas
│   └── routes/               # API Router Target Endpoints
└── frontend/                 # Client Interface SPA
    └── src/
        ├── components/       # Reusable Presentation Components
        ├── pages/            # Core Functional Views
        ├── store/            # Zustand Global State Containers
        └── utils/            # Helper Utilities and Hooks

```

---

## ⚡ Accelerated Installation Guide

### 1. Repository Clone

```bash
git clone [https://github.com/MUKESH-KHUSWAHA/devconnect.git](https://github.com/MUKESH-KHUSWAHA/devconnect.git)
cd devconnect

```

### 2. Backend Engine Initialization

```bash
cd backend
npm install

```

Configure your environment context inside a root `/backend/.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_signing_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GROQ_API_KEY=your_groq_llama3_key

```

```bash
npm run dev

```

### 3. Client Interface Setup

```bash
cd ../frontend
npm install

```

Configure your client runtime targets inside `/frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

```

```bash
npm run dev

```

Your internal development server will spin up locally at **`http://localhost:5173`**.

---

## 🔌 API Blueprint At A Glance

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register new profile securely |
| `POST` | `/api/auth/login` | Session token generation |
| `POST` | `/api/posts` | Initialize new post instance |
| `GET` | `/api/posts/feed` | Populate customized feed stream |
| `POST` | `/api/ai/review/:postId` | Run LLaMA 3 static code diagnostics |

---

## 👨‍💻 Engineering & Development

**Mukesh Kumar**


---

### Show Your Support! ⭐️

If this architecture or layout gave you inspiration, consider giving this repository a star! It assists tremendously with platform visibility.

Built with ❤️ for High-Scale Technical Placement Profiles.
