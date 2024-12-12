Coming soon...


Command for Mac devices:
```
rm -rf ./db/migrations && \
colima stop && \
colima start && \
docker run --name database -ePOSTGRES_PASSWORD=123456 -p "5432:5432" --rm -d postgres:17-alpine && \
export DATABASE_CONNECTION_STRING="postgresql://postgres:123456@localhost:5432/postgres" && \
npm i && \
npx prisma generate && \
npx prisma migrate dev && \
npx prisma db seed
```