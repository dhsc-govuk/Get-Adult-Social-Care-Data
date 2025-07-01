# Build the App
FROM node:20.17.0-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

RUN npm install --legacy-peer-deps
RUN npm run build

ARG CONTAINER_PORT
ENV CONTAINER_PORT=${CONTAINER_PORT}

EXPOSE ${CONTAINER_PORT}
ENTRYPOINT ["npm", "start"]
