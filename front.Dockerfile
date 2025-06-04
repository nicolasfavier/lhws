# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Production stage
FROM nginx:alpine
# Copy built files to nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
