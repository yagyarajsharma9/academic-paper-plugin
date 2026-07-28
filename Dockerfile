FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /plugin

COPY package*.json ./
RUN npm install --production

COPY src/ ./src/
COPY templates/ ./templates/
COPY action.yml ./action.yml

ENTRYPOINT ["node", "src/main.js"]