# base stage
FROM node:lts-alpine as base-stage
WORKDIR /app
COPY package*.json ./
RUN npm install

# development stage
FROM base-stage as development-stage
CMD npm run serve -- --port ${APP_PORT}

# build stage
FROM base-stage as build-stage
# Any env variables will be passed as arg here to make these available at build time.
ARG VUE_APP_BACKEND
ARG VUE_APP_BACKEND_AUTH_URL
ARG VUE_APP_FRONTEND
ARG VUE_APP_I18N_LOCALE
ARG VUE_APP_I18N_FALLBACK_LOCALE
ARG VUE_APP_GOOGLE_CLIENT_ID
ARG VUE_APP_BACKEND_API_CLIENT_ID
ARG VUE_APP_BACKEND_API_CLIENT_SECRET
ARG VUE_APP_BACKEND_WEBSOCKET
ARG VUE_APP_CUBEJS_API_URL

# Add those arg as env variable for builder
ENV VUE_APP_BACKEND $VUE_APP_BACKEND
ENV VUE_APP_BACKEND_AUTH_URL $VUE_APP_BACKEND_AUTH_URL
ENV VUE_APP_FRONTEND $VUE_APP_FRONTEND
ENV VUE_APP_I18N_LOCALE $VUE_APP_I18N_LOCALE
ENV VUE_APP_I18N_FALLBACK_LOCALE $VUE_APP_I18N_FALLBACK_LOCALE
ENV VUE_APP_GOOGLE_CLIENT_ID $VUE_APP_GOOGLE_CLIENT_ID
ENV VUE_APP_BACKEND_API_CLIENT_ID $VUE_APP_BACKEND_API_CLIENT_ID
ENV VUE_APP_BACKEND_API_CLIENT_SECRET $VUE_APP_BACKEND_API_CLIENT_SECRET
ENV VUE_APP_BACKEND_WEBSOCKET $VUE_APP_BACKEND_WEBSOCKET
ENV VUE_APP_CUBEJS_API_URL $VUE_APP_CUBEJS_API_URL

COPY . .
RUN npm run build

# production stage
# multi-stage Dockerfile inspired from: https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
