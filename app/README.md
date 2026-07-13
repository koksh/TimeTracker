# Time Tracker — Backend (app)

Кратко
- Fastify приложение с OpenAPI/Swagger (доступно по `/docs`).
- Рекомендуется запускать через Docker для совместимости.

Локальный запуск (без Docker)

1. Установите зависимости и соберите:

```bash
cd app
npm install
npm run build
```

2. Запустить production-сборку:

```bash
npm run start:prod
```

Для разработки (hot reload):

```bash
npm install
npm run dev
```

Docker (рекомендуется)

Сборка образа (большая совместимость):
- На Apple Silicon / M1/M2 обычно полезно явно указать платформу `linux/amd64` для совместимости с другими машинами.

```bash
cd app
docker build --platform=linux/amd64 -t time-tracker-backend:latest .
```

Запуск контейнера:

```bash
docker run --name time-tracker-backend -d -p 3000:3000 --restart unless-stopped time-tracker-backend:latest
```

Проверка логов и статуса:

```bash
docker ps --filter name=time-tracker-backend
docker logs -f time-tracker-backend
```

Остановка и удаление контейнера:

```bash
docker stop time-tracker-backend
docker rm time-tracker-backend
```

Дополнительно

- Порт по умолчанию: `3000` (из Dockerfile). Если нужно другой порт — пробросьте его при запуске контейнера (`-p 8080:3000`) или измените в коде `server.ts`.
- Для CI/CD: соберите образ в CI и публикуйте в Docker registry (Docker Hub, GitHub Container Registry и т.д.). Для максимальной совместимости указывайте `--platform` и используйте multi-arch сборку (`docker buildx`).

Советы по отладке

- Если сборка TypeScript падает в Docker, собирайте локно и запускайте `npm run build` чтобы увидеть детали. Частая ошибка — использование переменных, объявленных в блоке `try` и используемых в `catch` (это уже исправлено в этом репозитории).
- Для просмотра OpenAPI UI откройте `http://localhost:3000/docs` после запуска.

Если хочешь, добавлю `docker-compose.yml` для локальной разработки с возможностью включать/отключать сервисы (Postgres, redis и т.д.).