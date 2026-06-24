# CivicPulse 🚀

CivicPulse is an AI-powered civic issue reporting and management platform designed to bridge the gap between citizens and authorities. The platform enables users to report local issues, track their status, visualize incidents on interactive maps, and improve community engagement through transparent governance.

## 🌐 Live Demo

**Frontend Deployment:**  
https://civicpulse-klu.vercel.app

---

## ✨ Features

- 🔐 Google OAuth Authentication
- 📍 Interactive Google Maps Integration
- 📝 Report Civic Issues with Location Data
- 🤖 AI-Assisted Issue Classification
- 📊 Leaderboard & Community Engagement
- 🏛️ Authority Dashboard
- 🚨 Emergency Issue Prioritization
- 📱 Responsive Design
- 🔄 Real-Time Status Tracking
- 🗺️ Geospatial Visualization

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Google OAuth

### Backend
- Spring Boot 3
- Spring Security
- Spring Data JPA
- MySQL
- Firebase Integration

### APIs & Services
- Google Maps Platform
- Google OAuth 2.0
- Gemini AI
- Firebase

---

## 📂 Project Structure

```text
CivicPulse/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── src/
    ├── pom.xml
    └── application.properties
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/NISHANT-187/CivicPulse.git
cd CivicPulse
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

## 🔑 Environment Variables

### Frontend (.env)

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### Backend

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

---

## 🗄️ Database Configuration

MySQL Configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fsad
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
```

---

## 🎯 Key Modules

### Citizen Portal
- Issue Reporting
- Issue Tracking
- Community Voting

### Authority Portal
- Issue Management
- Status Updates
- Resolution Tracking

### AI Engine
- Issue Categorization
- Priority Assessment
- Smart Recommendations

---

## 🚀 Deployment

### Frontend
Hosted on Vercel:

https://civicpulse-klu.vercel.app

### Backend
Spring Boot deployment compatible with:

- Render
- Railway
- AWS
- Azure
- Google Cloud

---

## 👨‍💻 Team

**Nishant Kumar**  
B.Tech CSE (AI & ML)  
KL University

GitHub: https://github.com/NISHANT-187

---

## 📜 License

This project is developed for educational, hackathon, and civic innovation purposes.

© 2026 CivicPulse. All rights reserved.
