FROM node:18-alpine

WORKDIR /usr/src/app
COPY . .
RUN apt-get -y update
RUN apt-get -y install vim nano
RUN rm -rf .env
COPY .env_docker .env
RUN npm install pm2 -g
# Start app with pm2
# pm2 start --name "main-app" npm -- run water-usage:debug
RUN npm install