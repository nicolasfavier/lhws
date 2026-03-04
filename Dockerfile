# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app
RUN apt update && apt install python3 python3-pip make g++ -y
COPY . .
RUN bun install
RUN cp .env apps/server/.env
RUN bun db:generate
RUN bun db:migrate
RUN bun db:seed
RUN rm apps/server/.env

EXPOSE 3000/tcp
ENV HOSTNAME="0.0.0.0"
CMD cd apps/server && bun run src/index.ts
