# StreamWise Backend

Node.js Express API server for StreamWise.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Add your TMDB API key to `.env`:
```
TMDB_API_KEY=your_tmdb_api_key_here
```

## Running

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:4000` by default.

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{ "ok": true }
```

### POST /lookup
Lookup movie/show information from Netflix link or title.

**Request:**
```json
{
  "input": "https://www.netflix.com/title/80192098",
  "locale": "en-US"
}
```

**Success Response:**
```json
{
  "success": true,
  "service": "netflix",
  "rating": "8.5",
  "year": "2020",
  "runtime": "120",
  "imdbId": "tt1234567"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "UNRESOLVED_NETFLIX_LINK",
  "message": "Could not resolve this Netflix link. Paste the title name instead."
}
```
