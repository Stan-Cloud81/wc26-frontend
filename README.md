# World Cup 2026 - Frontend

Mobile-optimized web frontend for the World Cup 2026 competition tracker.

## Features

- 📱 Mobile-first responsive design
- 🔐 Shared password authentication
- 🏠 Home page with user's teams and all matches
- 🏆 Live leaderboard with rankings
- 🔄 Auto-refresh every minute
- ⚡ Built with React + Vite for fast performance

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios
- CSS3 (Mobile-first)

## Usage

1. Open the app on your smartphone browser
2. Enter the shared password
3. View your teams and their matches
4. Check the leaderboard to see rankings
5. Points update automatically as matches finish

## Mobile Features

- Optimized for touch interactions
- Responsive design for all screen sizes
- Sticky navigation header
- Pull-to-refresh support (browser dependent)
- Add to home screen capability (PWA ready)
