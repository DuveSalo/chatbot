FROM node:21-alpine3.18

WORKDIR /app

# Activa pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

COPY package*.json *-lock.yaml ./

RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && apk add --no-cache git \
    && pnpm install --production \
    && apk del .gyp

# Copia todo el proyecto al contenedor
COPY . .

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

CMD ["npm", "start"]
