# Build stage
FROM node:16-alpine as builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build

# Serve stage
FROM nginx:1.23.1-alpine as server

COPY --from=builder /app/dist /usr/share/nginx/javascript
COPY ./server/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./frontend/public /usr/share/nginx/

EXPOSE 80
