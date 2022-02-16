# base stage
FROM node:lts-alpine as base-stage
WORKDIR /app
COPY package.json ./
# install dependencies for npm run test:unit
RUN apk --no-cache --virtual tmp add python3 make g++ && npm install && apk del tmp

# development stage
FROM base-stage as development-stage
CMD node --max-old-space-size=4096 `which npm` run serve -- --port ${APP_PORT}

# build stage
FROM base-stage as build-stage
# Any env variables will be passed as arg here to make these available at build time.
ARG NODE_ENV
ARG VUE_APP_BACKEND
ARG VUE_APP_BACKEND_AUTH_URL
ARG VUE_APP_FRONTEND
ARG VUE_APP_I18N_LOCALE
ARG VUE_APP_I18N_FALLBACK_LOCALE
ARG VUE_APP_GOOGLE_CLIENT_ID
ARG VUE_APP_BACKEND_API_CLIENT_ID
ARG VUE_APP_BACKEND_API_CLIENT_SECRET
ARG VUE_APP_BACKEND_WEBSOCKET
ARG VUE_APP_MIXPANEL_PROJECT_TOKEN
ARG VUE_APP_SENTRY_DSN
ARG VUE_APP_GOOGLE_API_KEY

# Add those arg as env variable for builder
ENV NODE_ENV $NODE_ENV
ENV VUE_APP_BACKEND $VUE_APP_BACKEND
ENV VUE_APP_BACKEND_AUTH_URL $VUE_APP_BACKEND_AUTH_URL
ENV VUE_APP_FRONTEND $VUE_APP_FRONTEND
ENV VUE_APP_I18N_LOCALE $VUE_APP_I18N_LOCALE
ENV VUE_APP_I18N_FALLBACK_LOCALE $VUE_APP_I18N_FALLBACK_LOCALE
ENV VUE_APP_GOOGLE_CLIENT_ID $VUE_APP_GOOGLE_CLIENT_ID
ENV VUE_APP_BACKEND_API_CLIENT_ID $VUE_APP_BACKEND_API_CLIENT_ID
ENV VUE_APP_BACKEND_API_CLIENT_SECRET $VUE_APP_BACKEND_API_CLIENT_SECRET
ENV VUE_APP_BACKEND_WEBSOCKET $VUE_APP_BACKEND_WEBSOCKET
ENV VUE_APP_MIXPANEL_PROJECT_TOKEN $VUE_APP_MIXPANEL_PROJECT_TOKEN
ENV VUE_APP_SENTRY_DSN $VUE_APP_SENTRY_DSN
ENV VUE_APP_GOOGLE_API_KEY $VUE_APP_GOOGLE_API_KEY

COPY . .
RUN npm run build

# production stage
# multi-stage Dockerfile inspired from: https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html
FROM nginx:1.21.4-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# need to configure nginx for using history mode:
# https://next.router.vuejs.org/guide/essentials/history-mode.html#html5-mode
# https://stackoverflow.com/a/61753597/7870587
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
