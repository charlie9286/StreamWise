# StreamWise

A minimal "Paste & Go" app for getting instant movie/show information from Netflix links.

## Project Structure

```
StreamWise/
├── backend/          # Node.js Express API server
└── frontend/         # React Native Expo mobile app
```

## Quick Start

### Backend

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Add your TMDB API key to `.env`:
```
TMDB_API_KEY=your_tmdb_api_key_here
```

4. Start the server:
```bash
npm run dev    # Development with auto-reload
# or
npm start      # Production
```

The API will run on `http://localhost:4000`

### Frontend

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo:
```bash
npm start
```

4. Scan QR code with Expo Go app or press `i` for iOS simulator / `a` for Android emulator

## Features

- ✅ Paste Netflix links (`/title/` or `?jbv=`) or title text
- ✅ Minimal UI showing only: **Title, Rating, Year, Runtime**
- ✅ Local history storage
- ✅ Multi-language support (English/Spanish)
- ✅ Dark/light mode
- ✅ Free-first Netflix link resolution

## API Endpoints

- `GET /health` - Health check
- `POST /lookup` - Lookup movie/show information

See `backend/README.md` for detailed API documentation.

## Tech Stack

- **Backend**: Node.js + Express + JavaScript
- **Frontend**: Expo + React Native + TypeScript
- **Data Source**: TMDB (The Movie Database)
- **Caching**: In-memory LRU cache
