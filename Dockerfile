FROM node:10.13-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn link

CMD [ "hackernews", "--posts", "20"]