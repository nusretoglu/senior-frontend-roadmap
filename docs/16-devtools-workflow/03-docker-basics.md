# Docker Basics

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar uchun eng ko'p tarqalgan bahona: "Mening kompyuterimda ishlayotgan edi!". Haqiqatan ham, Node.js ning 18-versiyasi o'rnatilgan Windows da ishlaydigan kod, Node.js 14-versiyasi o'rnatilgan Ubuntu serverda xato berib qulashi oddiy hol. Docker aynan mana shu "environment" (muhit) muammosini yechadi. U sizning kodingizni o'zining shaxsiy Node.js, shaxsiy kutubxonalari bilan bitta qutiga (Konteynerga) joylaydi. Bu qutini qayerda ochsangiz ham, bir xil ishlaydi.

> [!NOTE]
> **Real-hayot analogiyasi: "Dengiz Konteynerlari"**  
> Oldinlari kemada yuk tashilganda har bir yuk (mashina, qopdagi un, televizor) turlicha joylanardi, portda ularni tushirish soatlab vaqt olar edi (Virtual Mashinalar).  
> Hozirda hamma narsa standart o'lchamdagi Temir Konteynerga joylanadi (Docker). Kema (Server) ichida nima borligi bilan qiziqmaydi, shunchaki standart konteynerni ko'taradi va joyiga qo'yadi. Istalgan kema istalgan standart konteynerni tashiydi.

Docker - bu konteynerizatsiya platformasi bo'lib, applicationlarni barcha dependency'lari bilan birga portable container'larga package qilish imkonini beradi. "It works on my machine" muammosini hal qiladi va development, testing va production environment'lar o'rtasida consistency ta'minlaydi.
## Container vs Virtual Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                Virtual Machine vs Container                      │
├───────────────────────────────┬─────────────────────────────────┤
│       Virtual Machine         │           Container              │
├───────────────────────────────┼─────────────────────────────────┤
│                               │                                  │
│   ┌─────┐ ┌─────┐ ┌─────┐    │    ┌─────┐ ┌─────┐ ┌─────┐     │
│   │App A│ │App B│ │App C│    │    │App A│ │App B│ │App C│     │
│   └──┬──┘ └──┬──┘ └──┬──┘    │    └──┬──┘ └──┬──┘ └──┬──┘     │
│   ┌──┴──┐ ┌──┴──┐ ┌──┴──┐    │    ┌──┴──────┴──────┴──┐       │
│   │Bins/│ │Bins/│ │Bins/│    │    │    Bins/Libs       │       │
│   │Libs │ │Libs │ │Libs │    │    └────────┬──────────┘       │
│   └──┬──┘ └──┬──┘ └──┬──┘    │             │                   │
│   ┌──┴──┐ ┌──┴──┐ ┌──┴──┐    │    ┌────────┴──────────┐       │
│   │Guest│ │Guest│ │Guest│    │    │   Docker Engine    │       │
│   │ OS  │ │ OS  │ │ OS  │    │    └────────┬──────────┘       │
│   └──┬──┘ └──┬──┘ └──┬──┘    │             │                   │
│   ┌──┴──────┴──────┴──┐      │    ┌────────┴──────────┐       │
│   │    Hypervisor     │      │    │     Host OS        │       │
│   └────────┬──────────┘      │    └────────┬──────────┘       │
│   ┌────────┴──────────┐      │    ┌────────┴──────────┐       │
│   │     Host OS       │      │    │    Hardware        │       │
│   └────────┬──────────┘      │    └───────────────────┘       │
│   ┌────────┴──────────┐      │                                  │
│   │    Hardware       │      │                                  │
│   └───────────────────┘      │                                  │
│                               │                                  │
│   Heavy (~GB), Slow start     │   Light (~MB), Fast start       │
│                               │                                  │
└───────────────────────────────┴─────────────────────────────────┘
```

| Xususiyat | Virtual Machine | Container |
|-----------|-----------------|-----------|
| Size | GBs | MBs |
| Start time | Minutes | Seconds |
| OS | Full OS per VM | Shared kernel |
| Isolation | Complete | Process-level |
| Resource usage | Heavy | Light |
| Portability | Less portable | Highly portable |

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      Docker Client                       │    │
│  │  docker build | docker pull | docker run                │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │ REST API                            │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      Docker Daemon                       │    │
│  │                       (dockerd)                          │    │
│  └────┬────────────────────┬──────────────────────┬────────┘    │
│       │                    │                      │              │
│       ▼                    ▼                      ▼              │
│  ┌─────────┐         ┌──────────┐          ┌──────────┐         │
│  │ Images  │         │Containers│          │ Networks │         │
│  └─────────┘         └──────────┘          └──────────┘         │
│       │                    │                      │              │
│       │                    │                      │              │
│  ┌────┴────────────────────┴──────────────────────┴────┐        │
│  │                   Docker Registry                    │        │
│  │            (Docker Hub, GitHub Container)            │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Asosiy Komponentlar

1. **Docker Client** - CLI orqali Docker daemon bilan gaplashadi
2. **Docker Daemon (dockerd)** - Images, containers, networks, volumes boshqaradi
3. **Docker Registry** - Images saqlanadigan joy (Docker Hub, GitHub Container Registry)
4. **Docker Objects**:
   - **Image** - read-only template (application + dependencies)
   - **Container** - image'dan yaratilgan runnable instance
   - **Volume** - persistent data storage
   - **Network** - container'lar orasidagi aloqa

## Asosiy Docker Commands

### Image Operations

```bash
# Image qidirish
docker search nginx

# Image pull qilish
docker pull nginx:latest
docker pull node:20-alpine

# Local images ro'yxati
docker images
docker image ls

# Image ma'lumotlari
docker inspect nginx:latest

# Image o'chirish
docker rmi nginx:latest
docker image prune  # dangling images
docker image prune -a  # barcha unused images
```

### Container Operations

```bash
# Container yaratish va run qilish
docker run nginx
docker run -d nginx                    # detached mode
docker run -d -p 8080:80 nginx        # port mapping
docker run -d --name webserver nginx  # named container
docker run -it node:20-alpine sh      # interactive shell

# Running containers
docker ps
docker ps -a  # barcha containers (stopped ham)

# Container boshqarish
docker start container_name
docker stop container_name
docker restart container_name
docker pause container_name
docker unpause container_name

# Container ichiga kirish
docker exec -it container_name sh
docker exec -it container_name bash

# Logs
docker logs container_name
docker logs -f container_name         # follow
docker logs --tail 100 container_name

# Container stats
docker stats
docker top container_name

# Container o'chirish
docker rm container_name
docker rm -f container_name           # force
docker container prune                # stopped containers
```

### Full Command Example

```bash
# Node.js development container
docker run -d \
  --name my-node-app \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  -e NODE_ENV=development \
  node:20-alpine \
  npm run dev

# Options explained:
# -d            : detached mode
# --name        : container nomi
# -p 3000:3000  : host:container port mapping
# -v $(pwd):/app: current directory → /app volume mount
# -w /app       : working directory
# -e NODE_ENV   : environment variable
# node:20-alpine: image
# npm run dev   : command
```

## Dockerfile

### Basic Structure

```dockerfile
# Base image
FROM node:20-alpine

# Maintainer info
LABEL maintainer="dev@example.com"
LABEL version="1.0"

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Default command
CMD ["node", "server.js"]
```

### Dockerfile Instructions

```dockerfile
# FROM - base image
FROM ubuntu:22.04
FROM node:20-alpine AS builder  # named stage

# RUN - build-time commands
RUN apt-get update && apt-get install -y \
    curl \
    git \
  && rm -rf /var/lib/apt/lists/*  # cleanup

# COPY vs ADD
COPY package*.json ./           # local files only
ADD https://example.com/file .  # URL, tar extraction
COPY --from=builder /app/dist ./dist  # multi-stage copy

# WORKDIR - set working directory
WORKDIR /app

# ENV - environment variables
ENV NODE_ENV=production \
    PORT=3000

# ARG - build-time arguments
ARG VERSION=1.0
RUN echo "Building version: $VERSION"

# EXPOSE - document ports (doesn't publish)
EXPOSE 3000
EXPOSE 80/tcp
EXPOSE 53/udp

# USER - run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# VOLUME - persistent data
VOLUME ["/data"]

# CMD vs ENTRYPOINT
CMD ["npm", "start"]              # default command (can be overridden)
ENTRYPOINT ["node"]               # always run (CMD becomes arguments)
CMD ["server.js"]                 # default argument for ENTRYPOINT

# HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Multi-stage Build

```dockerfile
# ========== BUILD STAGE ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# ========== PRODUCTION STAGE ==========
FROM node:20-alpine AS production

WORKDIR /app

# Security: non-root user
RUN addgroup -S app && adduser -S app -G app

# Production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R app:app /app
USER app

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Frontend (Vue/React) Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;
    }
}
```

## Docker Compose

### Basic docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8080
    depends_on:
      - backend
    networks:
      - app-network

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    volumes:
      - ./backend:/app
      - /app/node_modules
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### Docker Compose Commands

```bash
# Start services
docker compose up
docker compose up -d              # detached
docker compose up --build         # rebuild images
docker compose up frontend backend # specific services

# Stop services
docker compose down
docker compose down -v            # remove volumes
docker compose down --rmi all     # remove images too

# Service management
docker compose start
docker compose stop
docker compose restart
docker compose pause
docker compose unpause

# View status
docker compose ps
docker compose logs
docker compose logs -f backend    # follow specific service
docker compose top

# Execute commands
docker compose exec backend sh
docker compose exec db psql -U user -d mydb

# Scaling
docker compose up -d --scale backend=3

# Build
docker compose build
docker compose build --no-cache
docker compose pull               # pull latest images
```

### Development vs Production

```yaml
# docker-compose.yml (base)
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=${NODE_ENV:-development}

# docker-compose.override.yml (development - auto-loaded)
version: '3.8'

services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev
    environment:
      - DEBUG=*

# docker-compose.prod.yml (production)
version: '3.8'

services:
  backend:
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

```bash
# Development (auto-loads override)
docker compose up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Image Optimization

### Layer Caching

```dockerfile
# Bad - cache busts on any file change
COPY . .
RUN npm ci

# Good - dependencies cached separately
COPY package*.json ./
RUN npm ci
COPY . .
```

### .dockerignore

```dockerignore
# Git
.git
.gitignore

# Dependencies
node_modules
vendor

# Build artifacts
dist
build
*.log

# Development
.env
.env.local
*.md
docker-compose*.yml
Dockerfile*

# IDE
.vscode
.idea
*.swp

# Test
coverage
.nyc_output
```

### Size Optimization

```dockerfile
# 1. Use alpine images
FROM node:20-alpine  # ~50MB vs ~350MB

# 2. Multi-stage builds (see above)

# 3. Combine RUN commands
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# 4. Remove unnecessary files
RUN npm ci --only=production \
    && npm cache clean --force

# 5. Use specific tags (not latest)
FROM node:20.10.0-alpine3.18
```

### Security Best Practices

```dockerfile
# 1. Run as non-root
RUN addgroup -S app && adduser -S app -G app
USER app

# 2. Scan for vulnerabilities
# docker scout cves myimage:latest

# 3. Use official images
FROM node:20-alpine  # official

# 4. Pin versions
FROM node:20.10.0-alpine3.18

# 5. Don't expose secrets
# Use build args for build-time secrets
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc \
    && npm ci \
    && rm .npmrc

# 6. Read-only filesystem
# docker run --read-only myimage

# 7. Limit capabilities
# docker run --cap-drop ALL --cap-add NET_BIND_SERVICE myimage
```

## Volumes va Networking

### Volume Types

```bash
# Named volume
docker volume create mydata
docker run -v mydata:/app/data myimage

# Bind mount
docker run -v $(pwd)/data:/app/data myimage

# tmpfs (memory)
docker run --tmpfs /app/temp myimage
```

```yaml
# docker-compose.yml
volumes:
  # Named volume
  db-data:
    driver: local

  # External volume (created outside compose)
  external-data:
    external: true

services:
  db:
    volumes:
      - db-data:/var/lib/postgresql/data  # named
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # bind
      - type: tmpfs  # tmpfs
        target: /tmp
```

### Networking

```yaml
networks:
  # Default bridge network
  frontend-net:
    driver: bridge

  # Internal only (no internet)
  backend-net:
    driver: bridge
    internal: true

  # External network
  proxy-net:
    external: true

services:
  frontend:
    networks:
      - frontend-net
      - proxy-net

  backend:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net
```

```bash
# Network commands
docker network ls
docker network create mynetwork
docker network inspect mynetwork
docker network connect mynetwork container_name
docker network disconnect mynetwork container_name
```

## Development Environment

### Local Development Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: development  # multi-stage target
    ports:
      - "3000:3000"
      - "9229:9229"  # debugger
    volumes:
      - .:/app
      - /app/node_modules  # prevent overwrite
    environment:
      - NODE_ENV=development
      - DEBUG=app:*
    command: npm run dev

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    volumes:
      - postgres-dev:/var/lib/postgresql/data

volumes:
  postgres-dev:
```

### Debugging in Docker

```dockerfile
# Development stage with debugging
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose debug port
EXPOSE 3000 9229

CMD ["node", "--inspect=0.0.0.0:9229", "server.js"]
```

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "restart": true
    }
  ]
}
```

### Hot Reload with Docker

```yaml
services:
  frontend:
    build: ./frontend
    volumes:
      - ./frontend/src:/app/src  # only source files
    environment:
      - CHOKIDAR_USEPOLLING=true  # for Windows/Mac
      - WATCHPACK_POLLING=true
    command: npm run dev
```

## Real-World Workflow

### Complete Project Structure

```
project/
├── docker-compose.yml
├── docker-compose.override.yml    # dev overrides
├── docker-compose.prod.yml        # production
├── .env.example
├── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── backend/
│   ├── Dockerfile
│   └── ...
└── infra/
    ├── nginx/
    │   └── nginx.conf
    └── scripts/
        └── init-db.sh
```

### CI/CD with Docker

```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ github.sha }}
```

### Production Checklist

```dockerfile
# Production-ready Dockerfile checklist
# ✅ Multi-stage build
# ✅ Non-root user
# ✅ Health check
# ✅ Proper signal handling
# ✅ Minimal image size
# ✅ Security scanning
# ✅ No secrets in image
# ✅ Proper logging

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Production deps only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy build
COPY --from=builder --chown=app:app /app/dist ./dist

USER app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# Proper signal handling with tini
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/server.js"]
```

## Interview Savollari

### 1. Docker image va container farqi nima?

**Javob:**
- **Image** - read-only template. Application, dependencies, configuration'ni o'z ichiga oladi. Blueprint yoki class kabi.
- **Container** - image'dan yaratilgan runnable instance. Image'ning "jonli" versiyasi. Object yoki instance kabi.

```bash
# Image - template
docker pull nginx:latest

# Container - running instance
docker run -d nginx:latest  # yangi container
docker run -d nginx:latest  # yana bir container (boshqa)
```

Bir image'dan ko'plab container yaratish mumkin.

### 2. Dockerfile'da CMD va ENTRYPOINT farqi?

**Javob:**

- **CMD** - default command. `docker run` da override qilinishi mumkin
- **ENTRYPOINT** - har doim ishlaydigan command. CMD argument sifatida qo'shiladi

```dockerfile
# Faqat CMD
CMD ["npm", "start"]
# docker run myimage npm test  # override bo'ladi

# Faqat ENTRYPOINT
ENTRYPOINT ["node"]
# docker run myimage server.js  # node server.js bo'ladi

# Ikkalasi
ENTRYPOINT ["node"]
CMD ["server.js"]
# docker run myimage  # node server.js
# docker run myimage app.js  # node app.js (CMD override)
```

### 3. Docker layer caching qanday ishlaydi?

**Javob:**
Docker har bir instruction'ni alohida layer sifatida cache qiladi. Agar instruction yoki undan oldingi layer o'zgarmasa, cache ishlatiladi.

```dockerfile
# Bad - har qanday fayl o'zgarsa cache buziladi
COPY . .
RUN npm ci

# Good - dependencies alohida cache'lanadi
COPY package*.json ./
RUN npm ci
COPY . .
```

Cache buzilish sabablari:
- Dockerfile instruction o'zgarishi
- COPY/ADD qilinayotgan fayl o'zgarishi
- ARG qiymati o'zgarishi
- Parent image o'zgarishi

### 4. Docker volume va bind mount farqi?

**Javob:**

| | Volume | Bind Mount |
|---|---|---|
| Location | Docker boshqaradi (`/var/lib/docker/volumes/`) | Host filesystem |
| Portability | Yuqori | Past (host-specific) |
| Performance | Optimized | Host FS performance |
| Backup | Docker CLI bilan | Manual |
| Use case | Production data | Development, configs |

```bash
# Volume
docker run -v myvolume:/app/data myimage

# Bind mount
docker run -v $(pwd)/data:/app/data myimage
```

### 5. Multi-stage build nima va nima uchun kerak?

**Javob:**
Multi-stage build - bitta Dockerfile'da bir necha FROM instruction ishlatish. Build tools va dependencies faqat build stage'da, final image minimal bo'ladi.

```dockerfile
# Build stage - full toolchain
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Production stage - minimal
FROM node:20-alpine
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

Foydalari:
- Image size kichik (GBs → MBs)
- Attack surface kam
- Build secrets final image'da yo'q
- Tezroq pull va deploy

## Tips & Tricks

### 1. Useful Docker Aliases

```bash
# ~/.bashrc yoki ~/.zshrc
alias d='docker'
alias dc='docker compose'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias drm='docker rm $(docker ps -aq)'
alias drmi='docker rmi $(docker images -q)'
alias dprune='docker system prune -af'

# Container ichiga kirish
dexec() { docker exec -it $1 ${2:-sh}; }

# Logs ko'rish
dlogs() { docker logs -f $1; }
```

### 2. Quick Debugging

```bash
# Container ichidagi processlar
docker top container_name

# Real-time stats
docker stats

# Container inspect
docker inspect container_name | jq '.[0].NetworkSettings'

# File system ko'rish (stopped container ham)
docker cp container_name:/app/logs ./logs

# Interactive shell
docker run --rm -it image_name sh
```

### 3. Cleanup Commands

```bash
# Barcha stopped containers
docker container prune

# Dangling images
docker image prune

# Unused volumes
docker volume prune

# Hamma narsani tozalash (ehtiyot bo'ling!)
docker system prune -a --volumes

# Specific age
docker image prune -a --filter "until=24h"
```

### 4. Security Scanning

```bash
# Docker Scout (built-in)
docker scout cves myimage:latest
docker scout quickview myimage:latest

# Trivy
trivy image myimage:latest

# Snyk
snyk container test myimage:latest
```

### 5. Performance Tips

```bash
# BuildKit enable (faster builds)
export DOCKER_BUILDKIT=1

# Parallel builds in compose
docker compose build --parallel

# Build cache export/import
docker build --cache-from myimage:latest -t myimage:new .

# Resource limits
docker run --memory=512m --cpus=0.5 myimage
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Multi-stage builds ishlatish:** Node.js ilovasini build qilsangiz, `node_modules` va TypeScript source kodlari sizga Production'da umuman kerak emas (Faqat `dist` va production dependency'lar yetarli). Multi-stage build (birinchi bosqichda build qilib, ikkinchi toza konteynerga faqat natijani nusxalash) orqali 1 GB lik Docker Image ni 50 MB gacha qisqartirishingiz mumkin. Bu pullik server resurslarini tejaydi.
2. **Konteyner ichida `root` foydalanuvchi bo'lmang:** Docker default holatda root huquqlarida ishlaydi. Agar xaker sizning dasturingiz orqali konteynerga kirsa, u hamma narsani qila oladi. Har doim Dockerfile da `USER node` kabi root bo'lmagan foydalanuvchiga o'ting (Security).
3. **.dockerignore ishlatish:** `.gitignore` kabi `.dockerignore` ham juda muhim. Agar `node_modules` yoki `.git` papkalarini konteyner ichiga tasodifan ko'chirib yuborsangiz (masalan `COPY . .`), Image hajmi dahshatli darajada shishib ketadi va build jarayoni sekinlashadi.

---

## Xulosa

| Tushuncha | Nima u? | Hayotiy Analogiya |
|-----------|---------|-------------------|
| **Image** | Konteynerni yaratish uchun o'zgarmas Shablon (Chizmalar). | Kek pishirish uchun retsept. |
| **Container** | Image asosida yaratilgan, ishlab turgan jonli dastur. | Retsept bo'yicha pishirilgan tayyor Kek (Uni yeyish mumkin). |
| **Dockerfile** | Image ni qanday yasashni o'rgatadigan qadam-ba-qadam yo'riqnoma. | Tarkibiy qismlar: "Un qo'shing", "Shakar qo'shing", "Pechka 180°C ga qo'ying". |
| **Volume** | Konteyner o'chirilsa ham ma'lumotlar saqlanib qoladigan qattiq disk (Xotira). | Fleshka: Kompyuterni (Konteynerni) o'chirsangiz ham fayllaringiz qoladi. |
| **Docker Compose** | Bir nechta konteynerlarni (Masalan: Node.js + MongoDB + Redis) bir marta bitta buyruq bilan ishga tushiruvchi orkestrator (dirijyor). | Restoran: Ofitsiant, Oshpaz va Kassirni bir vaqtda ishga tushirish qoidasi. |

Docker zamonaviy dasturiy ta'minot ishlab chiqarishning asosiy qismi. U ilovani muhiti bilan birga paketlash (Containerization), jamoaviy ishlashni osonlashtirish va xavfsizlik (Isolation) kabi eng muhim backend vazifalarini bajaradi. Docker bilimi CI/CD, Kubernetes, va Cloud Deployment (AWS, DigitalOcean) uchun fundamental asos hisoblanadi.
