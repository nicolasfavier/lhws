# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app
RUN apt update && apt install python3 python3-pip make g++ -y
COPY . .
RUN bun install
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN DATABASEURL="${DATABASE_URL}" bun db:generate
RUN DATABASEURL="${DATABASE_URL}" bun db:migrate
RUN DATABASEURL="${DATABASE_URL}" bun db:seed

EXPOSE 3000/tcp
ENV HOSTNAME="0.0.0.0"
CMD cd apps/server && bun run src/index.ts
