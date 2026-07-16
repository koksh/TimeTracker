# Time Tracker

Простой проект из двух сервисов:
- `app/` — backend на Fastify
- `frontend/` — статический frontend

## Запуск через Docker Compose

```bash
docker compose up --build
```

После запуска сервисы будут доступны:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

## Порядок

- `frontend` собирается в nginx-контейнер и отдаёт `index.html`
- `backend` собирается из `app/Dockerfile` и запускается на `3000`
- `docker-compose` автоматически поднимает оба сервиса

## Остановить

```bash
dockerc ompose down
```
