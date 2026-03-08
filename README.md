# Message Builder

Full-stack web app to generate respectful relationship messages with the framework:

Situation -> Feeling -> Request

## Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL / Supabase Postgres

## Project Structure

- `frontend/` React client
- `backend/` Express API
- `backend/sql/schema.sql` database schema

## Backend Setup

1. Copy env file:

```bash
cp backend/.env.example backend/.env
```

2. Install dependencies:

```bash
cd backend
npm install
```

3. Create database tables using `backend/sql/schema.sql`.

4. Run backend:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`.

## Frontend Setup

1. Copy env file:

```bash
cp frontend/.env.example frontend/.env
```

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Run frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `POST /generate-message`
- `POST /save-message`
- `GET /messages?email=user@example.com`
- `POST /login`
- `GET /health`

## Safety Logic

- Blocks aggressive/blaming language patterns.
- Generates neutral, respectful "I-statement" style output.
- Supports tones: `calm`, `caring`, `supportive`, `apologetic`.

## Deploy Notes

- Frontend: Vercel (set `VITE_API_BASE_URL`)
- Backend: Render/Railway (set `DATABASE_URL`, `FRONTEND_ORIGIN`)
- Database: Supabase Postgres or any Postgres provider
