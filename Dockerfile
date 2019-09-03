FROM node:10.15.3-alpine
USER root

WORKDIR /opt/api-notifier

RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

COPY package.json package-lock.json* /opt/api-notifier/
RUN npm install --production && \
  npm uninstall -g npm

RUN apk del build-dependencies

COPY src /opt/api-notifier/src
COPY config /opt/api-notifier/config
COPY app.js /opt/api-notifier/

EXPOSE 3082
CMD node app.js