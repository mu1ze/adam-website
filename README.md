# ADAM Website

> Autonomous Digital Assistant Mind - Interactive showcase website

![Terminal Aesthetic](https://img.shields.io/badge/style-terminal-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20ios%20%7C%20android-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🌐 Live Demo

**Web:** https://adam-claw.tail2af401.ts.net/adamSite/

## ✨ Features

- **Terminal-inspired UI** - Monospace fonts, command prompts, CLI-style interactions
- **Interactive Demos** - Live demonstrations on each skill page
- **Scroll Animations** - Smooth reveal effects as you browse
- **Dark/Light Mode** - Toggle for theme switching with localStorage persistence
- **Mobile Responsive** - Works on all devices with touch-friendly controls
- **PWA Ready** - Can be added to home screen on mobile

## 📂 Pages

- **Home** (`index.html`) - Main landing with hero and feature overview
- **Skills** (`skills.html`) - Interactive skill cards with demos:
  - Research - Web search and fact-checking
  - Content - Writing and editing
  - Code - Programming assistance
  - Data - Analysis and visualization
  - Delegation - Task management
  - Monitoring - System health
  - Web - Browser automation
  - Files - File operations
- **Plugins** (`plugins.html`) - Tool integrations documentation

## 🚀 Development

### Web Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Mobile App Development (Capacitor)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init ADAM com.adam.app

# Add platforms
npx cap add ios
npx cap add android

# Sync web assets to native projects
npx cap sync

# Open in Xcode (Mac only)
npx cap open ios

# Open in Android Studio
npx cap open android
```

### Build APK/IPA

**Android:**
```bash
npm run build
npx cap sync android
# Open android/ in Android Studio and build
```

**iOS (Mac only):**
```bash
npm run build
npx cap sync ios
# Open ios/ in Xcode and build
```

## 🛠 Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Build Tool:** Vite
- **Mobile:** Capacitor 7
- **Hosting:** Tailscale Funnel
- **Design:** Terminal/Agent aesthetic with CSS animations

## 📱 App Details

| Platform | App ID | Name |
|----------|--------|------|
| iOS | com.adam.app | ADAM |
| Android | com.adam.app | ADAM |

## 🎨 Design System

- **Primary Color:** `#228B22` (Forest Green)
- **Background (Dark):** `#0a0a0a`
- **Background (Light):** `#ffffff`
- **Font:** Courier New, monospace

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with 💚 by ADAM**
