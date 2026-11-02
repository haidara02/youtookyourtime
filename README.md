# You Took Your Time
E-commerce Platform  for the You Took Your Time clothing brand

## Stack

- **Framework:** Next.js 16 (App Router) with Payload CMS 3
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Domain:** youtookyourtime.com (via Cloudflare DNS)

## Prerequisites & Setup

- Node.js 22.23.4+ (or 24.22.1+) and pnpm — required by Payload 3.92
- MongoDB 7 installed locally (`mongod`, `mongodump`, `mongorestore`, `mongosh`)

First, install dependencies, copy environment variables, start the local database and run the development server:

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm db:start                 # local MongoDB, data in local/mongo-data (gitignored)
pnpm db:pull                  # optional: copy production data into it
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Stop the database with `pnpm db:stop`.

### Database

Local development uses its own MongoDB (`DATABASE_URL=mongodb://127.0.0.1:27017/youtookyourtime`), never production. `pnpm db:pull` replaces the local `youtookyourtime` database with a copy of production (read-only on prod; needs `PROD_DATABASE_URL` in `.env.local`). Production on Vercel uses `DATABASE_MONGODB_URI`, injected by the MongoDB Atlas integration, with `DATABASE_NAME=youtookyourtime`.

⚠️ Media is stored in Cloudflare R2, and `.env.local` points at the **production** bucket. Uploading in local dev adds real files, and **deleting a media item locally deletes the file production uses**.