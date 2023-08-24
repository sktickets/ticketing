FROM node:alpine

ARG NPM_TOKEN

WORKDIR /app

COPY package.json .

RUN printf "@sktickets:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=$NPM_TOKEN" > .npmrc && \
    npm install --only=prod && \
    rm -f .npmrc

COPY . .

CMD ["npm", "start"]
