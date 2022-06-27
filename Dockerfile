FROM --platform=linux/amd64 node:14-alpine as builder

RUN mkdir /frontend
WORKDIR /frontend

COPY package.json vue.config.js ./
RUN npm install

COPY src ./src
COPY public ./public

RUN npm run build

FROM --platform=linux/amd64 nginx:alpine

# Create the directories we will need
RUN mkdir -p /tmp/nginx/vue-single-page-app
RUN mkdir -p /var/log/nginx
RUN mkdir -p /var/www/html
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /frontend/dist /var/www/html
RUN chown nginx:nginx /var/www/html

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
