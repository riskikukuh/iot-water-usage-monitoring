FROM node:18-alpine

WORKDIR /usr/src/app
COPY . .
RUN rm -rf .env
COPY .env_docker .env
RUN npm install