# base stage
FROM node:lts-alpine as base-stage
WORKDIR /app
COPY package*.json ./
RUN npm install

# development stage
FROM base-stage as development-stage
CMD ["npm", "run", "serve"]

# build stage
FROM base-stage as build-stage
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
