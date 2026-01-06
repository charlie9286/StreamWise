# StreamWise Frontend

React Native mobile app built with Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create assets (see `assets/README.md`)

3. Start the development server:
```bash
npm start
```

## Running

- **iOS Simulator**: Press `i` in the Expo CLI
- **Android Emulator**: Press `a` in the Expo CLI
- **Physical Device**: Scan QR code with Expo Go app

## Configuration

Update `src/config.ts` to change the API base URL:
- For physical devices, use your computer's local IP (e.g., `http://192.168.1.100:4000`)
- For simulators, `http://localhost:4000` works

## Features

- ✅ Paste Netflix links or title text
- ✅ Minimal UI showing only title, rating, year, runtime
- ✅ Local history storage
- ✅ Multi-language support (English/Spanish)
- ✅ Dark/light mode
- ✅ No expo-font dependencies (uses emoji icons)
