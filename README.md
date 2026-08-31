# Momen Kita

Virtual wedding photobooth dan guest book digital berbasis browser, dibuat mobile-first dengan Next.js, TypeScript, Tailwind CSS, PostgreSQL, dan Prisma.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

## Installation

```bash
npm install
cp .env.example .env
```

Isi `DATABASE_URL`, `SESSION_SECRET`, dan `NEXT_PUBLIC_APP_URL` di `.env`.

## Database setup

```bash
npm run db:generate
npm run db:migrate -- --name init
ADMIN_EMAIL=admin@momenkita.id ADMIN_PASSWORD='password-kuat' npm run db:seed
```

Jangan gunakan password seed bawaan di production. File upload pada phase berikutnya akan memakai abstraction storage sehingga dapat dipindahkan dari local storage ke S3/MinIO.

## Development

```bash
npm run dev
```

Buka `http://localhost:3000`, lalu masuk ke `/admin/login`. Setiap event memiliki kode tamu 6 karakter dan QR di detail admin; keduanya membuka URL publik `/event/[slug]`. Tamu juga dapat membuka event dari form kode atau scanner QR di beranda.

## Production

```bash
npm run lint
npm run build
npm start
```

Deploy pada platform yang mendukung Next.js dan PostgreSQL. Set environment variables melalui secret manager platform, bukan di-commit ke repository.

### Railway

1. Buat project Railway dari repository ini dan tambahkan PostgreSQL.
2. Set environment variables berikut pada service aplikasi:
   - `DATABASE_URL`: connection string PostgreSQL Railway.
   - `DIRECT_URL`: connection string direct PostgreSQL (gunakan nilai `DATABASE_URL` jika Railway hanya menyediakan satu URL).
   - `SESSION_SECRET`: random secret panjang yang tidak dibagikan.
   - `NEXT_PUBLIC_APP_URL`: domain public service Railway, misalnya `https://nama-service.up.railway.app`.
   - `STORAGE_DIR`: `/app/storage/uploads`.
3. Tambahkan Railway Volume pada service aplikasi dengan mount path `/app/storage`. File foto, video, dan voice note disimpan di volume tersebut agar tidak hilang saat deploy ulang.
4. Railway akan memakai `railway.toml`: build menjalankan `prisma generate` dan `next build`, lalu service dijalankan dengan `next start` pada `PORT` yang diberikan Railway.
5. Jalankan migrasi dari Railway Shell bila database baru:

```bash
npm run db:migrate:deploy
```

Buat user admin setelah database siap, dengan `ADMIN_EMAIL` dan `ADMIN_PASSWORD` yang aman:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='password-kuat' npm run db:seed
```

## Phase 1 yang selesai

- Fondasi Next.js App Router + TypeScript + Tailwind
- Prisma schema PostgreSQL untuk User, AdminSession, Event, Template, GuestSession, Photo, Video, dan Message
- Admin login dengan password hashing bcrypt dan cookie session httpOnly
- Dashboard statistik dari database
- CRUD create/list event dengan validasi Zod
- Halaman event guest original yang siap menjadi entry point photobooth
