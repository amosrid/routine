# Daily Routine App

Daily Routine App adalah aplikasi habit tracker harian yang berpusat pada checklist rutinitas konkret. Alur utama aplikasi sekarang mengikuti revisi:

```text
Template kasar -> Daily setup pagi -> Lock -> Checklist item konkret -> Pending detail -> Detail/history/akumulasi
```

Prinsip paling penting: **Checklist complete first, detail later**. Detail belajar, bahasa, olahraga, membaca, dan journaling tidak dibuat bebas sebagai alur utama. Detail muncul setelah item rutinitas dicentang completed.

## Tujuan Aplikasi

Aplikasi ini membantu user:

- Membuat pola rutinitas harian dari template kasar.
- Menyesuaikan aktivitas konkret setiap pagi sebelum lock jam 11:00 WIB.
- Mencentang completed, skip, atau undo item rutinitas harian.
- Menghitung score dari item konkret harian.
- Mengisi detail aktivitas setelah item completed.
- Melihat history dan akumulasi durasi per kategori.
- Memantau sleep secara terpisah dari checklist rutinitas.

## Core Loop

1. User menambah master data di halaman kategori masing-masing.
2. User membuat routine template kasar.
3. Home membuat Today's Routine dari template aktif.
4. User melakukan daily setup pagi di Home.
5. User lock setup manual atau sistem auto lock setelah 11:00 WIB.
6. User checklist item konkret sepanjang hari.
7. Completed item muncul sebagai pending detail di halaman kategori.
8. User mengisi atau mengedit detail kapan saja.
9. Halaman kategori menampilkan history dan total durasi per item.

## Tech Stack

- Framework: Next.js 14 App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- ORM: Prisma
- Test Runner: Vitest

## Bahasa UI

Semua user-facing UI aplikasi menggunakan Bahasa Inggris.

Dokumen internal seperti `README.md`, `sdd.md`, `revisiapp.md`, dan `IMPLEMENTATION_DECISIONS.md` boleh memakai Bahasa Indonesia untuk planning dan pembahasan.

## Fitur Utama

### 1. Authentication

Fungsi:

- Register, login, logout.
- Menjaga session login.
- Melindungi dashboard route.
- Menyimpan profile user di tabel `profiles`.
- Dashboard menyapa user memakai nama jika tersedia.

Halaman:

- `/login`
- `/register`
- `/register/check-email`

### 2. Master Data per Kategori

Master data berada di halaman kategori masing-masing:

- Study subjects: `/deepwork`
- Languages: `/language`
- Exercise types: `/exercise`
- Books: `/book`

Fungsi:

- User menambah item seperti PHP, Vibe Coding, English, Push Up, Atomic Habits.
- Item tersebut langsung tersedia untuk daily setup di Home.
- Book memiliki status Reading, Completed, Paused.
- Daily setup Book hanya memakai book berstatus Reading.

Settings tidak lagi menjadi pusat master data kategori. `/settings` dipakai untuk profile dan preferences.

### 3. Routine Template

Template adalah pola kasar, bukan rutinitas final hari itu.

Contoh template:

```text
Study 180 minutes
Exercise 30 minutes
Book 30 minutes
Morning Journal
Custom: Dimsum 90 minutes
Night Journal
```

Block type yang bisa dibuat:

- Study
- Language
- Exercise
- Book
- Morning Journal
- Night Journal
- Custom

Sleep tidak bisa dibuat sebagai routine block baru karena Sleep hanya monitoring.

Halaman:

- `/routine/templates`

### 4. Daily Setup di Home

Home adalah pusat sistem harian.

Fungsi Home:

- Generate Today's Routine dari template aktif sesuai weekday WIB.
- Menampilkan daily setup sebelum lock.
- Memecah block kasar menjadi item konkret.
- Menambah custom activity.
- Manual lock setup.
- Checklist completed, skipped, undo.
- Menampilkan score.

Contoh:

Template:

```text
Study 180 minutes
Exercise 30 minutes
Book 30 minutes
```

Daily setup hari ini:

```text
Study PHP 90 minutes
Study Vibe Coding 90 minutes
Exercise Push Up 15 minutes
Exercise Mobility 15 minutes
Book Atomic Habits 30 minutes
```

### 5. Lock Harian

Ada dua lock:

- Manual lock dari user setelah selesai setup pagi.
- Auto lock setelah 11:00 WIB.

Setelah locked:

- Struktur daily routine hari itu tidak bisa diubah.
- Checklist tetap bisa digunakan.
- Skip tetap bisa digunakan.
- Detail kategori tetap bisa diisi atau diedit.

### 6. Checklist dan Score

Score dihitung dari item konkret harian yang scorable.

Formula:

```text
completed items / total scorable items x 100
```

Catatan:

- Setup placeholder dari template kasar tidak dihitung.
- Sleep tidak dihitung.
- Skipped item dihitung sebagai tidak completed.
- Custom activity tetap bisa completed atau skipped.

### 7. Pending Detail

Alur detail:

```text
Completed checklist item -> pending detail di halaman kategori -> user isi/edit detail
```

Jika item belum completed, tidak ada detail yang muncul.

Halaman detail kategori:

- `/deepwork`: Study details, study subjects, total duration, history.
- `/language`: Language details, language list, total duration, history.
- `/exercise`: Exercise details, exercise types, total duration, history.
- `/book`: Book details, books, total duration, history.
- `/journaling`: Morning/Night Journal details dan history.

Detail bisa diisi pada hari yang sama atau hari berikutnya jika user lupa.

### 8. Journaling

Journaling masuk rutinitas checklist.

Jenis:

- Morning Journal
- Night Journal

Setelah item journaling dicentang completed di Home, halaman `/journaling` menampilkan pending detail.

Field detail:

- Plans
- Reflection
- Notes

### 9. Sleep Monitoring

Sleep hanya monitoring.

Sleep tidak masuk checklist routine utama dan tidak memengaruhi score.

Halaman `/sleep` menyimpan:

- Wake Date
- Sleep Time
- Wake Time
- Duration otomatis
- Notes
- History

### 10. Todo

Todo adalah tugas kecil di luar routine score.

Halaman:

- `/todo`

### 11. Statistics

Statistics tetap menampilkan ringkasan umum:

- Average Score
- Daily Scores
- Durasi Study, Language, Exercise, Book
- Average Sleep

Akumulasi mastery per item utama ditampilkan langsung di halaman kategori masing-masing.

Halaman:

- `/stats`

## Data Penting

Tabel utama:

- `profiles`
- `study_subjects`
- `user_languages`
- `exercise_types`
- `books`
- `routine_templates`
- `routine_blocks`
- `daily_routines`
- `daily_routine_items`
- `study_logs`
- `language_logs`
- `exercise_logs`
- `book_logs`
- `journal_logs`
- `sleep_logs`
- `todo_items`

## Keamanan Data User

Prinsip:

- Semua data aplikasi memiliki `user_id` atau terhubung ke data milik user.
- Query server-side wajib filter berdasarkan user login.
- Detail kategori hanya bisa dibuat dari completed routine item milik user.
- Master data yang dipakai daily setup wajib milik user login.
- RLS tetap menjadi lapisan perlindungan tambahan.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_LOCK_HOUR=11
NEXT_PUBLIC_TIMEZONE=Asia/Jakarta
```

## Cara Menjalankan Project

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Run development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Cara Test dan Validasi

```bash
npm run test:run
npx prisma validate
npm run build
```

## Struktur Halaman

```text
/login
/register
/register/check-email
/
/settings
/routine/templates
/deepwork
/language
/exercise
/book
/journaling
/sleep
/todo
/stats
```

## Status Revisi

README ini mengikuti `revisiapp.md`. Jika ada perubahan alur, update `revisiapp.md` dulu lalu sinkronkan implementasi dan README.
