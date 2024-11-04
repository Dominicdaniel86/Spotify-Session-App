FROM node:19-bullseye

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN mv dist/ node/

EXPOSE 3000

CMD ["npm", "start"]
