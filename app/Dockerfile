FROM node

WORKDIR /zdppass-app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3800

CMD ["node", "./index"]