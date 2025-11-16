# Kisah Sukses Final AI Hebat

Render-ready package. Push files to repo root.

## Render + Groq setup (added automatically)
1. Copy `.env.example` to `.env` and set `GROQ_API_KEY`.
2. `npm install`
3. `npm start`

Health: GET /healthz



## Docker & CI

Build and run with Docker:

```
docker build -t kisah-sukses .
docker run -e GROQ_API_KEY=... -p 3000:3000 kisah-sukses
```

Or with docker-compose:

```
docker-compose up --build
```

GitHub Actions CI included at `.github/workflows/ci.yml` which installs dependencies and runs a smoke check.
