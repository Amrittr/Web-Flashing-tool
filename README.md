# ⚡ ESP Web Flasher & Firmware Manager

A modern, full-stack, browser-based **ESP32 & ESP8266 Web Flashing Tool** built with React 19, TypeScript, Vite, Tailwind CSS v4, and Firebase. 

Directly flash microcontrollers from your web browser using the native **Web Serial API** — no local Python environment, command-line tools, or driver installations required!

![ESP Web Flasher](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.18-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 🌟 Key Features

### 🔌 Browser-Based Serial Flashing
- **Web Serial API Integration**: Connect directly to your ESP32, ESP32-S2/S3/C3/C6/H2, or ESP8266 via USB-to-UART.
- **Configurable Baud Rates**: Select speeds from `115200` up to `921600` baud.
- **Real-Time Terminal Console**: View real-time console logs, chip detection, MAC address verification, erase status, and flash progress percentages.
- **Custom Address Offsets**: Support multi-bin flashing (e.g. bootloader at `0x1000`, partition table at `0x8000`, app firmware at `0x10000`).

### 👤 User Portal
- **Interactive Dashboard**: Select target chip families, choose firmware builds, and configure flash offsets.
- **Flashing History**: Track past flashing sessions, status reports, timestamps, and target device info.
- **Role-Based Access Control**: Secure login & registration backed by Firebase Authentication.

### 🛡️ Admin Management Portal
- **Firmware Upload Center**: Upload `.bin` firmware binaries with release tags, target chip definitions, and detailed descriptions.
- **User Management**: View registered developers, toggle account statuses (active/disabled), and assign Administrator privileges.
- **System Activity Audit**: Live audit logs monitoring firmware deployments and system actions.

---

## 🏗️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism Dark Theme, [Lucide React Icons](https://lucide.dev/)
- **Flashing Engine**: [`esptool-js`](https://github.com/espressif/esptool-js) & Web Serial API
- **Backend & Auth**: [Firebase Authentication](https://firebase.google.com/products/auth), [Firebase Realtime Database](https://firebase.google.com/products/realtime-database), [Firebase Storage](https://firebase.google.com/products/storage)
- **Routing**: React Router v7

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- A browser supporting Web Serial API (Google Chrome, Microsoft Edge, Brave, or Opera)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Amrittr/Web-Flashing-tool.git
   cd Web-Flashing-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (use `.env.example` as a template):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 📦 Build & Production

To compile TypeScript and create an optimized production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment

### Deploying to Vercel
This repository includes a pre-configured `vercel.json` for single-page application routing.

1. Install Vercel CLI:
   ```bash
   npx vercel
   ```
2. Set your `VITE_FIREBASE_*` environment variables in Vercel settings.
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

> ⚠️ **Note**: Web Serial API requires an **HTTPS** connection (or `localhost`). Vercel automatically provisions free SSL/HTTPS certificates for your domain.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
