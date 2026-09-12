# Property Manager

A Next.js property management app (landlords, properties, units, tenants,
tickets, vendors, vacancies) backed by Postgres via Prisma, with Logto for
authentication.

## Getting Started (local dev)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a `.env`
file — see `.env.example` for the required variables (database connection,
Logto credentials, base URL, etc.) and a local Postgres instance for
`DATABASE_URL`/`DIRECT_URL` to point at.

## Deployment

This app is self-hosted via Docker, not Vercel:

- `.github/workflows/docker-publish.yml` builds the image and pushes it to
  `ghcr.io/gmanzella880/property-manager` on every push to `main`.
- A Portainer "Repository" stack (`docker-compose.yml`) runs the `web` image
  alongside a `db` (Postgres) service, with GitOps polling picking up new
  image pushes automatically.
- Required environment variables are supplied through Portainer's stack
  Environment variables UI (see `.env.example` for the full list) - none of
  them live in the repo.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
