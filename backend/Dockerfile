FROM node:19-bullseye
RUN apt-get update && apt-get install -y netcat

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY scripts/ ./scripts
RUN chmod +x ./scripts/wait-for-it.sh

COPY . .
RUN npm run build
RUN mv dist/ node/

EXPOSE 3000

ENTRYPOINT [ "./scripts/wait-for-it.sh", "mariadb", "3306", "npm", "start" ]
