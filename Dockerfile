FROM node:12-buster-slim

WORKDIR /home

ADD package.json package-lock.json vue.config.js ./

RUN npm i

COPY src ./src
COPY public ./public

ARG BASE_URL='/'

RUN npm run build

CMD ["npm", "run", "dev"]
