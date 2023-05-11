FROM node:16-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN apk update && apk add openssl-dev

COPY . .

RUN apk add bash

RUN bash

EXPOSE 3000

CMD ["bash", "run-easy.sh", "3", "8700"]