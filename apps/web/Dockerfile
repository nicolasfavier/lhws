FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g bun
COPY ../.. .
RUN bun install
RUN bun run build --filter=web

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
