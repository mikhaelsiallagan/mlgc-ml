FROM node:20

WORKDIR /usr/src/app

ENV PORT 8080
ENV HOST 0.0.0.0

COPY package*.json ./

RUN npm install --only=prod

COPY . .

EXPOSE 8080

CMD ["npm","run","start"]