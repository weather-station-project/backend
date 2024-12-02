ARG TARGETARCH
FROM $TARGETARCH/node:lts-alpine AS builder

WORKDIR /app

COPY . .

RUN npm clean-install --ignore-scripts && \
    # npx prisma generate && \
    npm run build


ARG TARGETARCH
FROM $TARGETARCH/node:lts-alpine

WORKDIR /app

COPY --from=builder /app/dist/ .
COPY package*.json ./
# COPY --from=builder /app/db/schema.prisma ./db/

RUN npm clean-install --ignore-scripts --omit=dev # && npx prisma generate
RUN chown node:node -R /app

USER node
EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]