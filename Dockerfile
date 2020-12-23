FROM node:current-alpine as build

COPY ./app /app/

COPY ./package.json ./webpack.config.js ./tsconfig.json /.prettierrc.json /.prettierignore /

RUN npm install && npm run build

FROM nginxinc/nginx-unprivileged:1.18-alpine

COPY --from=build ./app/dist /app/dist/