FROM node:18-alpine

RUN apk add --no-cache tzdata
RUN cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime
WORKDIR /usr/src/app
COPY . .
RUN apk add --update nano
RUN rm -rf .env
COPY .env_docker .env
RUN npm install pm2 -g
# Start app with pm2
# pm2 start --name "main-app" npm -- run water-usage:debug
RUN npm install