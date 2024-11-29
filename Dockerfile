FROM node:lts-alpine AS builder
LABEL maintainer="David Leon <david.leon.m@gmail.com>"

WORKDIR /app

COPY . .

RUN npm clean-install --ignore-scripts && \
    # npx prisma generate && \
    npm run build


FROM node:lts-alpine
LABEL maintainer="David Leon <david.leon.m@gmail.com>"

WORKDIR /app

COPY --from=builder /app/dist/ .
COPY package*.json ./
# COPY --from=builder /app/db/schema.prisma ./db/

RUN npm clean-install --ignore-scripts --omit=dev # && npx prisma generate
RUN chown node:node -R /app

USER node
EXPOSE 8080

CMD ["npm", "start:prod"]