FROM node:26-alpine3.23 AS build

WORKDIR /code

COPY . /code

RUN npm install
RUN npx tsc index.ts

FROM build AS runtime

RUN mkdir logs

CMD node /code