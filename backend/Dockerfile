FROM node:19-bullseye
RUN apt-get update && apt-get install -y netcat

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN mv dist/ node/

RUN chmod +x /usr/src/app/scripts/wait-for-it.sh

EXPOSE 3000

CMD ["npm", "start"]
