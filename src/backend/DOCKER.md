Docker usage

Build and run (local compose)

- Ensure `.env.development` exists under `backend/`.
- From `backend/`:

```bash
# Start Postgres + backend (development)
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker compose -f docker-compose.dev.yml logs -f backend
```

Production compose

```bash
# From backend/
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Healthchecks

- DB uses `pg_isready`.
- Backend health check hits Swagger docs URL. Adjust to `/health` if you add a dedicated health endpoint.
