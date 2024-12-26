FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY src ./src
COPY app.js ./

RUN npm install

EXPOSE 3030

CMD ["node", "app.js"]