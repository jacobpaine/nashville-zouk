This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

### First-time setup

1. Create a [Neon](https://neon.tech) database and copy the connection string.
2. Set all required environment variables in Vercel (or `.env.local` for local dev) — see `.env.example`.
3. Generate a session secret: `openssl rand -hex 32`
4. Push the schema to the database **before** deploying:
   ```bash
   npx drizzle-kit push
   ```
5. Create the first admin user by running a one-off insert against your Neon DB, or temporarily set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your env.

### Subsequent deploys

Run migrations **before** promoting a new build:

```bash
npx drizzle-kit push   # or: npx drizzle-kit migrate (if using migration files)
```

Deploying without running migrations first will cause runtime DB errors if the new code references columns or tables that don't yet exist.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
