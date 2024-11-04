# Build stage
FROM node:14 as builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build

# Serve stage
FROM nginx as server

COPY --from=builder /app/dist /usr/share/nginx/javascript
COPY ./server/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./frontend/public /usr/share/nginx/

EXPOSE 80
