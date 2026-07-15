FROM node:22-alpine AS builder
WORKDIR /app

# Принимаем build args
ARG NEXT_PUBLIC_API_BASE_URL
ARG PORT=3101

# Устанавливаем переменные окружения ДО сборки
# Это важно, так как Next.js встраивает NEXT_PUBLIC_* во время сборки
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV PORT=${PORT}
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

# Принимаем PORT для runtime
ARG PORT=3101
ENV PORT=${PORT}
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE ${PORT}

# Next.js автоматически использует переменную окружения PORT
CMD ["npm", "start"]
