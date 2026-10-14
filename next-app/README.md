# Laboratoire L’Odyssey — Next.js

Production migration of the existing clinic website from PHP/MySQL to Next.js, Neon Postgres, and private S3-compatible object storage.

## Included features

- Responsive public website with appointments and contact forms that submit without reloading.
- Secure patient result access using a short-lived signed cookie and hashed access codes.
- Private PDF storage; result files are never exposed through a public folder.
- Public blog with image uploads and SEO metadata.
- Protected administration dashboard for appointments, messages, results, articles, and account settings.
- Rate limiting for login, patient access, and public forms.
- MySQL-to-Neon migration script for existing XAMPP data and uploaded files.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Create a Neon project and set `DATABASE_URL` to its pooled connection string.
3. Create a private Neon Object Storage bucket or another S3-compatible bucket and fill the `S3_*` variables. When these values are absent, development uploads are stored under `.data/uploads`.
4. Generate a strong `AUTH_SECRET` with at least 32 random characters.
5. Install and initialize:

```powershell
npm install
npm run db:push
npm run seed:admin
npm run dev
```

Open `http://localhost:3000`.

## Existing XAMPP data migration

Keep Apache/MySQL running long enough to read the old database, then set:

```env
MYSQL_DATABASE_URL=mysql://root:YOUR_PASSWORD@127.0.0.1:3306/borel_clinique
LEGACY_PROJECT_DIR=..
```

Run the migration only after `npm run db:push`:

```powershell
npm run migrate:mysql
```

The migration refuses to run when Neon already contains appointments, messages, results, or articles, preventing accidental duplicates. Existing PHP bcrypt hashes are supported.

## Netlify deployment

The repository root contains `netlify.toml`, which sets `next-app` as the deployment base.

1. Push the repository to GitHub.
2. In Netlify, import the repository. Netlify detects Next.js automatically.
3. Add all production variables from `.env.example` in **Site configuration → Environment variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
5. Deploy. The build command is `npm run build`.

Do not upload `.env.local`, database exports, PDF results, or access keys to GitHub.

## Production checklist

- Use a strong, unique `AUTH_SECRET` and admin password.
- Keep the object storage bucket private.
- Enable Neon backups or perform regular exports.
- Configure a custom domain and test HTTPS before sharing patient access links.
- Test one appointment, one contact message, one article, and one PDF result after deployment.
- Delete the old PHP hosting only after the migrated production site is verified.

## Commands

```powershell
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:push
npm run db:studio
npm run seed:admin
npm run migrate:mysql
```
