# Spec Driven Development (SDD)
## Daily Routine Web App

> **Status**: MVP Specification  
> **Platform**: Web Application  
> **Target User**: Mahasiswa / Fresh Graduate yang ingin membangun konsistensi hidup  
> **Business Model**: Gratis  
> **Version**: 1.0.0

---

## DAFTAR ISI

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Schema](#3-database-schema)
4. [Feature Specifications](#4-feature-specifications)
5. [UI/UX Structure](#5-uiux-structure)
6. [API Endpoints](#6-api-endpoints)
7. [Business Rules Summary](#7-business-rules-summary)
8. [Development Phases](#8-development-phases)
9. [Notes for AI Developer](#9-notes-for-ai-developer)

---

## 1. PROJECT OVERVIEW

### 1.1 Vision
Aplikasi web **gratis** untuk mahasiswa dan fresh graduate yang ingin membangun konsistensi hidup melalui rutinitas harian yang terstruktur, terukur, dan memotivasi.

### 1.2 Core Problem
Banyak mahasiswa/fresh graduate ingin improve diri tetapi gagal konsisten karena:
- Tidak ada sistem personal yang cocok dengan gaya hidup mereka
- Tracking tersebar di banyak tempat (catatan, spreadsheet, app terpisah)
- Tidak ada umpan balik yang terukur (skor, streak, akumulasi progress)

### 1.3 Core Solution
Platform tracking rutinitas harian all-in-one yang:
- **Personal & fleksibel** — template rutinitas sesuai kebiasaan sendiri
- **Terukur** — skor harian, akumulasi durasi, streak konsistensi
- **Terintegrasi** — Study, Language, Exercise, Buku, Sleep, Todo dalam 1 sistem

### 1.4 Scope MVP
| Fitur | Status |
|-------|--------|
| Authentication (Register/Login) | ✅ MVP |
| Master Data (Subjects, Language, Exercise, Book) | ✅ MVP |
| Routine Template | ✅ MVP |
| Daily Routine Checklist + Score | ✅ MVP |
| Deepwork / Study Log | ✅ MVP |
| Language Learn Log | ✅ MVP |
| Exercise Log | ✅ MVP |
| Book Log | ✅ MVP |
| Sleep Tracker | ✅ MVP |
| Streak | ✅ MVP |
| To Do List | ✅ MVP |
| Statistics & Progress | ✅ MVP |
| Gamifikasi (Poin + Level per Item) | 🔜 Phase 2 |
| Morning & Night Journaling | 🔜 Phase 2 |
| AI Coach / Smart Insight | 🔜 Phase 3 |

---

## 2. TECH STACK & ARCHITECTURE

### 2.1 Stack yang Direkomendasikan

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | Next.js 14 (App Router) | Full-stack dalam 1 codebase, sangat AI-friendly untuk vibe coding |
| **Styling** | Tailwind CSS + shadcn/ui | Komponen siap pakai, clean, tidak perlu design dari nol |
| **Database** | Supabase (PostgreSQL) | Auth + DB + RLS dalam 1 platform, free tier sangat generous |
| **ORM** | Prisma | Type-safe, schema jelas, mudah di-generate oleh AI |
| **Auth** | Supabase Auth | Session management, support email/password + OAuth |
| **Hosting** | Vercel | Free tier, auto-deploy dari GitHub, edge functions |
| **State Management** | Zustand (opsional) | Ringan, simple, cukup untuk scope ini |
| **Date/Time** | date-fns atau dayjs | Handling timezone WIB (Asia/Jakarta) |

### 2.2 Project Structure

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /page.tsx                    # Home — Today's Routine
    /routine
      /templates/page.tsx        # Kelola template
      /setup/page.tsx            # Sesuaikan rutinitas hari ini (sebelum 11:00)
    /deepwork/page.tsx           # Study log & input detail
    /language/page.tsx           # Language log & input detail
    /exercise/page.tsx           # Exercise log & input detail
    /book/page.tsx               # Book log & input detail
    /sleep/page.tsx              # Sleep log
    /todo/page.tsx               # To Do List
    /stats/page.tsx              # Statistik & progress
    /settings/page.tsx           # Master data management
  /api
    /auth/...
    /subjects/...
    /languages/...
    /exercises/...
    /books/...
    /templates/...
    /routine/...
    /study-logs/...
    /language-logs/...
    /exercise-logs/...
    /book-logs/...
    /sleep-logs/...
    /todos/...
    /streak/...
    /stats/...
/components
  /ui/                           # shadcn/ui components
  /layout/
    Sidebar.tsx
    BottomNav.tsx
    Header.tsx
  /routine/
    RoutineBlock.tsx
    ScoreBar.tsx
    StreakBadge.tsx
  /forms/
    StudyLogForm.tsx
    LanguageLogForm.tsx
    ExerciseLogForm.tsx
    BookLogForm.tsx
/lib
  /supabase.ts                   # Supabase client
  /prisma.ts                     # Prisma client
  /utils.ts                      # Helper functions
  /timezone.ts                   # WIB timezone helpers
/prisma
  schema.prisma
```

### 2.3 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_LOCK_HOUR=11        # Jam lock rutinitas (default 11)
NEXT_PUBLIC_TIMEZONE=Asia/Jakarta
```

---

## 3. DATABASE SCHEMA

> **Implementasi**: Gunakan Prisma schema untuk type-safety + Supabase untuk Auth & RLS

### 3.1 Master Data Tables

#### `study_subjects`
```sql
id          UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name        VARCHAR(100) NOT NULL          -- e.g., "PHP", "Vibe Code", "Python"
created_at  TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, LOWER(name))               -- case-insensitive unique per user
```

#### `user_languages`
```sql
id          UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name        VARCHAR(100) NOT NULL          -- e.g., "Bahasa Inggris", "Mandarin"
created_at  TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, LOWER(name))
```

#### `exercise_types`
```sql
id          UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name        VARCHAR(100) NOT NULL          -- e.g., "Push Up", "Latihan Basket"
created_at  TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, LOWER(name))
```

#### `books`
```sql
id          UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
title       VARCHAR(255) NOT NULL
author      VARCHAR(255)
status      VARCHAR(20) DEFAULT 'reading'  -- ENUM: 'reading', 'completed', 'paused'
created_at  TIMESTAMPTZ DEFAULT NOW()
updated_at  TIMESTAMPTZ DEFAULT NOW()
```

---

### 3.2 Routine Template Tables

#### `routine_templates`
```sql
id           UUID     PRIMARY KEY DEFAULT gen_random_uuid()
user_id      UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name         VARCHAR(100) NOT NULL          -- e.g., "Rutinitas Weekday"
days_of_week INTEGER[] NOT NULL            -- [1,2,3,4,5]=Senin-Jumat; [0,6]=Weekend
                                           -- 0=Minggu, 1=Senin, ..., 6=Sabtu
is_active    BOOLEAN DEFAULT true
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ DEFAULT NOW()
```

#### `routine_blocks`
```sql
id               UUID    PRIMARY KEY DEFAULT gen_random_uuid()
template_id      UUID    NOT NULL REFERENCES routine_templates(id) ON DELETE CASCADE
block_type       VARCHAR(20) NOT NULL       -- ENUM: 'study', 'language', 'exercise', 'book', 'sleep', 'custom'
reference_id     UUID                       -- FK ke tabel master (subjects/languages/exercise_types/books)
reference_name   VARCHAR(255)               -- Nama denormalized (untuk custom block & sebagai fallback)
duration_minutes INTEGER NOT NULL DEFAULT 30  -- Durasi default (5–480 menit)
sort_order       INTEGER DEFAULT 0
created_at       TIMESTAMPTZ DEFAULT NOW()
```

---

### 3.3 Daily Routine Tables

#### `daily_routines`
```sql
id               UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
date             DATE    NOT NULL
template_id      UUID    REFERENCES routine_templates(id) ON DELETE SET NULL
locked_at        TIMESTAMPTZ                -- NULL = masih bisa diedit; terisi = sudah terkunci
score_percentage DECIMAL(5,2) DEFAULT 0.00  -- 0.00 - 100.00
created_at       TIMESTAMPTZ DEFAULT NOW()
updated_at       TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, date)
```

#### `daily_routine_items`
```sql
id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid()
daily_routine_id     UUID    NOT NULL REFERENCES daily_routines(id) ON DELETE CASCADE
block_type           VARCHAR(20) NOT NULL   -- sama dengan routine_blocks.block_type
reference_id         UUID                   -- FK ke master data (nullable untuk custom)
reference_name       VARCHAR(255)           -- nama yang di-snapshot dari template
duration_minutes     INTEGER NOT NULL       -- durasi default dari template
actual_duration      INTEGER                -- durasi aktual setelah selesai (bisa berbeda)
is_completed         BOOLEAN DEFAULT false
skip_reason          TEXT                   -- alasan jika tidak selesai (nullable)
sort_order           INTEGER DEFAULT 0
completed_at         TIMESTAMPTZ
created_at           TIMESTAMPTZ DEFAULT NOW()
updated_at           TIMESTAMPTZ DEFAULT NOW()
```

> **Penting**: `daily_routine_items` adalah SNAPSHOT dari `routine_blocks` pada saat generate. Perubahan template setelah generate tidak mempengaruhi items hari berjalan.

---

### 3.4 Activity Log Tables

#### `study_logs`
```sql
id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
daily_routine_item_id UUID    REFERENCES daily_routine_items(id) ON DELETE SET NULL
subject_id            UUID    REFERENCES study_subjects(id) ON DELETE SET NULL
date                  DATE    NOT NULL
duration_minutes      INTEGER NOT NULL DEFAULT 0
activity              TEXT                   -- aktivitas yang dilakukan
material              TEXT                   -- materi yang dipelajari
summary               TEXT                   -- catatan/kesimpulan (recall memory)
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

#### `language_logs`
```sql
id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
daily_routine_item_id UUID    REFERENCES daily_routine_items(id) ON DELETE SET NULL
language_id           UUID    REFERENCES user_languages(id) ON DELETE SET NULL
date                  DATE    NOT NULL
duration_minutes      INTEGER NOT NULL DEFAULT 0
material              TEXT                   -- materi / topik yang dipelajari
vocabulary            TEXT                   -- vocab baru atau catatan bahasa
notes                 TEXT
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

#### `exercise_logs`
```sql
id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
daily_routine_item_id UUID    REFERENCES daily_routine_items(id) ON DELETE SET NULL
exercise_type_id      UUID    REFERENCES exercise_types(id) ON DELETE SET NULL
date                  DATE    NOT NULL
duration_minutes      INTEGER NOT NULL DEFAULT 0
sets                  INTEGER                -- nullable, optional
reps                  INTEGER                -- nullable, optional
notes                 TEXT
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

#### `book_logs`
```sql
id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
daily_routine_item_id UUID    REFERENCES daily_routine_items(id) ON DELETE SET NULL
book_id               UUID    REFERENCES books(id) ON DELETE SET NULL
date                  DATE    NOT NULL
duration_minutes      INTEGER NOT NULL DEFAULT 0
pages_read            INTEGER                -- jumlah halaman dibaca hari ini
notes                 TEXT
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
```

#### `sleep_logs`
```sql
id               UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
date             DATE    NOT NULL               -- tanggal BANGUN (bukan tanggal tidur)
sleep_time       TIME    NOT NULL               -- jam mulai tidur
wake_time        TIME    NOT NULL               -- jam bangun
duration_minutes INTEGER                        -- dihitung otomatis di aplikasi (bukan DB computed)
notes            TEXT
created_at       TIMESTAMPTZ DEFAULT NOW()
updated_at       TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, date)
```

---

### 3.5 Supporting Tables

#### `todos`
```sql
id           UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
title        TEXT    NOT NULL
is_completed BOOLEAN DEFAULT false
due_date     DATE                           -- optional
completed_at TIMESTAMPTZ
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ DEFAULT NOW()
```

#### `user_streaks`
```sql
id                UUID    PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
current_streak    INTEGER DEFAULT 0
longest_streak    INTEGER DEFAULT 0
last_active_date  DATE                       -- tanggal terakhir skor ≥ 80%
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

---

## 4. FEATURE SPECIFICATIONS

---

### FEAT-01 | Authentication

**User Stories:**
- US-01: Sebagai user baru, saya bisa register dengan email dan password
- US-02: Sebagai user terdaftar, saya bisa login dengan email dan password
- US-03: Saya bisa logout dari aplikasi
- US-04: Session saya persisten sehingga tidak perlu login ulang setiap buka browser

**Business Rules:**
| ID | Rule |
|----|------|
| BR-01 | Email harus unik di sistem |
| BR-02 | Password minimum 8 karakter |
| BR-03 | Setelah register berhasil, redirect ke /settings untuk setup master data pertama |
| BR-04 | Setelah login, redirect ke Home (/) |
| BR-05 | Semua halaman dashboard (/*, kecuali /login dan /register) wajib authenticated |
| BR-06 | User yang sudah login yang mencoba akses /login redirect ke Home |

**Acceptance Criteria:**
- [ ] Form register: email, password, confirm password dengan validasi
- [ ] Form login: email + password
- [ ] Error message yang jelas: email sudah dipakai, password salah, password tidak cocok
- [ ] Tombol submit dengan loading state
- [ ] Protected routes redirect ke /login jika belum auth
- [ ] Logout membersihkan session dan redirect ke /login

---

### FEAT-02 | Master Data Management

> Halaman `/settings` — Data master yang dibutuhkan sebelum membuat template rutinitas

**Business Rules:**
| ID | Rule |
|----|------|
| BR-07 | Nama item master harus unik per user per kategori (case-insensitive) |
| BR-08 | Item tidak bisa dihapus jika masih digunakan di template aktif |
| BR-09 | Nama item maksimal 100 karakter |
| BR-10 | Buku dengan status 'completed' atau 'paused' tidak muncul sebagai pilihan rutinitas |

#### 2A. Study Subjects
**Acceptance Criteria:**
- [ ] Input field nama + tombol "Tambah"
- [ ] List semua subjects yang sudah ditambahkan
- [ ] Tombol hapus per item (dengan dialog konfirmasi)
- [ ] Pesan error jika nama duplikat
- [ ] Contoh placeholder: "PHP", "Python", "Vibe Code", "Laravel"

#### 2B. Languages (User Languages)
**Acceptance Criteria:**
- [ ] Sama pola dengan Study Subjects
- [ ] Contoh placeholder: "Bahasa Inggris", "Mandarin", "Jepang"

#### 2C. Exercise Types
**Acceptance Criteria:**
- [ ] Sama pola dengan Study Subjects
- [ ] Contoh placeholder: "Push Up", "Sit Up", "Latihan Basket"

#### 2D. Books
**Acceptance Criteria:**
- [ ] Form: judul (required) + penulis (optional)
- [ ] Status badge per buku: 🟢 Reading / ✅ Completed / ⏸️ Paused
- [ ] Tombol ubah status (dropdown atau toggle)
- [ ] Hanya buku berstatus 'reading' yang muncul sebagai pilihan di template
- [ ] Tombol hapus (dengan konfirmasi, pastikan tidak sedang di template aktif)

---

### FEAT-03 | Routine Template

**Halaman:** `/routine/templates`

**User Stories:**
- US-05: Saya bisa membuat template rutinitas dengan nama dan hari-hari tertentu
- US-06: Saya bisa menambahkan block kegiatan ke template (Study, Language, Exercise, Book, Sleep, Custom)
- US-07: Saya bisa mengatur urutan block dalam template
- US-08: Saya bisa mengatur durasi default setiap block
- US-09: Saya bisa mengedit dan menghapus template

**Business Rules:**
| ID | Rule |
|----|------|
| BR-11 | Template wajib memiliki nama dan minimal 1 hari aktif |
| BR-12 | Block tipe 'study' hanya bisa ditambahkan jika study_subjects sudah ada |
| BR-13 | Block tipe 'language' hanya bisa ditambahkan jika user_languages sudah ada |
| BR-14 | Block tipe 'exercise' hanya bisa ditambahkan jika exercise_types sudah ada |
| BR-15 | Block tipe 'book' hanya menampilkan buku dengan status 'reading' |
| BR-16 | Satu template bisa punya multiple block tipe yang sama (e.g., PHP + Python = 2 study blocks) |
| BR-17 | Durasi per block: minimal 5 menit, maksimal 480 menit (8 jam) |
| BR-18 | Tidak ada batasan jumlah template per user |
| BR-19 | Mengedit template tidak mempengaruhi daily_routine yang sudah di-generate |

**Acceptance Criteria:**
- [ ] Form buat template: nama + pilihan hari (toggle Senin s/d Minggu)
- [ ] Tambah block: pilih tipe → pilih item dari master data → input durasi
- [ ] Block 'custom': user isi nama sendiri + durasi (tidak butuh master data)
- [ ] Drag & drop untuk mengatur urutan block
- [ ] Tampilkan total durasi keseluruhan template
- [ ] List semua template dengan info hari aktif
- [ ] Tombol edit dan hapus template
- [ ] Konfirmasi sebelum hapus template yang masih aktif digunakan

**UI Block Form (contoh):**
```
[Tipe Kegiatan ▼]     [Pilih Item ▼]         [Durasi: 60 menit]   [Hapus]
  Study          →      PHP               →    ________________     [🗑️]
  Language       →      Bahasa Inggris    →    ________________     [🗑️]
  Exercise       →      Push Up           →    ________________     [🗑️]
  Book           →      Atomic Habits     →    ________________     [🗑️]
  Sleep          →      (tidak ada item)  →    ________________     [🗑️]
  Custom         →      (isi nama sendiri)→    ________________     [🗑️]
```

---

### FEAT-04 | Daily Routine (Core Feature)

**Halaman:** `/` (Home) dan `/routine/setup`

#### 4A. Generate Daily Routine

**Business Rules:**
| ID | Rule |
|----|------|
| BR-20 | Saat user membuka Home, sistem otomatis cek apakah `daily_routine` untuk hari ini sudah ada |
| BR-21 | Jika belum ada, sistem generate `daily_routine` + `daily_routine_items` dari template yang hari aktifnya sesuai hari ini |
| BR-22 | Jika ada lebih dari 1 template yang berlaku hari ini, ambil template pertama yang dibuat (atau user pilih manual) |
| BR-23 | Jika tidak ada template untuk hari ini, tampilkan prompt "Buat Template Rutinitas" |
| BR-24 | Daily routine yang di-generate adalah SNAPSHOT — perubahan template setelah generate tidak mengubah hari berjalan |

#### 4B. Routine Adjustment

**Halaman:** `/routine/setup` — hanya accessible sebelum 11:00 WIB

**Business Rules:**
| ID | Rule |
|----|------|
| BR-25 | Batas edit rutinitas harian: **pukul 11:00 WIB** (Asia/Jakarta timezone) |
| BR-26 | Setelah 11:00, tombol "Edit Rutinitas" tersembunyi atau disabled |
| BR-27 | Setelah 11:00, user hanya bisa mencentang block dan mengisi durasi aktual |
| BR-28 | Sebelum 11:00, user bisa menambah, hapus, dan edit block dari rutinitas hari ini |
| BR-29 | Perubahan di `/routine/setup` hanya berlaku untuk hari ini, tidak mengubah template asli |

**Acceptance Criteria:**
- [ ] Tombol "Sesuaikan Rutinitas Hari Ini" hanya tampil sebelum 11:00
- [ ] Setelah 11:00, tampilkan label "🔒 Rutinitas sudah terkunci pukul 11:00"
- [ ] Countdown timer menuju jam 11:00 (opsional, motivasi untuk segera setup)

#### 4C. Checklist & Completion

**Business Rules:**
| ID | Rule |
|----|------|
| BR-30 | Skor = (jumlah `is_completed = true`) / (total items) × 100 |
| BR-31 | Block 'sleep' dihitung selesai jika sleep_log hari itu sudah diisi |
| BR-32 | User bisa mengisi `skip_reason` (alasan tidak selesai) untuk setiap block |
| BR-33 | Streak bertambah 1 jika skor harian ≥ 80% |
| BR-34 | Streak dievaluasi saat user membuka app di hari berikutnya |
| BR-35 | Streak reset ke 0 jika ada 1 hari terlewat (tidak ada daily_routine atau skor < 80%) |
| BR-36 | Skor diupdate secara real-time setiap kali user mencentang block |

**Acceptance Criteria:**
- [ ] List semua block dengan checkbox
- [ ] Progress bar skor real-time di bagian atas (contoh: "70% — 7/10 selesai")
- [ ] Setiap block: tampil nama, tipe, durasi planned
- [ ] Color coding: ✅ hijau = selesai | ❌ merah = skip | ⬜ abu = belum
- [ ] Klik block yang belum selesai: muncul opsi "Tandai Selesai" atau "Skip + Alasan"
- [ ] Field input alasan skip (textarea, optional tapi dianjurkan)
- [ ] Streak badge di bagian atas Home

**Wireframe Home:**
```
┌─────────────────────────────────────────┐
│ 👋 Selamat pagi, [Nama]!               │
│ Selasa, 1 Juli 2025                     │
├─────────────────────────────────────────┤
│ 🔥 Streak: 12 Hari                      │
├─────────────────────────────────────────┤
│ Skor Hari Ini                           │
│ 70%  ██████████░░░░  7 dari 10 selesai  │
├─────────────────────────────────────────┤
│ Rutinitas Hari Ini                      │
│ ──────────────────────────────────────  │
│ ✅ [Custom] Wake Up                     │
│ ✅ [Exercise] Push Up       30 menit    │
│ ⬜ [Study] PHP              90 menit    │
│ ⬜ [Language] Inggris       45 menit    │
│ ⬜ [Book] Atomic Habits     30 menit    │
│ ⬜ [Sleep] Waktu Tidur                  │
│ ──────────────────────────────────────  │
│      [✏️ Sesuaikan Rutinitas]           │
│           (hanya tampil < 11:00)        │
└─────────────────────────────────────────┘
```

---

### FEAT-05 | Deepwork / Study

**Halaman:** `/deepwork`

**User Stories:**
- US-10: Saya bisa mengisi detail sesi belajar hari ini per subject
- US-11: Jika ada 2 subject hari ini, saya bisa membagi durasi ke masing-masing
- US-12: Saya bisa melihat total akumulasi jam per subject (sebagai motivasi progress)
- US-13: Saya bisa melihat riwayat catatan belajar sebelumnya (recall memory)

**Business Rules:**
| ID | Rule |
|----|------|
| BR-37 | Log study ter-link ke `daily_routine_item` jika block study ada di rutinitas hari ini |
| BR-38 | Durasi default diambil dari `daily_routine_items.duration_minutes`, bisa direvisi |
| BR-39 | Jika ada 2 study block (PHP + Python), masing-masing punya form sendiri |
| BR-40 | Durasi aktual bisa berbeda dari yang direncanakan (revisi diperbolehkan) |
| BR-41 | Total akumulasi = SUM(duration_minutes) dari seluruh study_logs per subject |
| BR-42 | Durasi akumulasi ditampilkan dalam jam + menit (e.g., 12j 30m) |

**Acceptance Criteria:**
- [ ] Tampilkan subject yang ada di rutinitas hari ini sebagai kartu terpisah
- [ ] Setiap kartu: form durasi, aktivitas, materi, summary/catatan
- [ ] Tombol "Simpan" per kartu
- [ ] Total durasi planned hari ini sebagai referensi (e.g., "Planned: 90 menit")
- [ ] Kartu akumulasi per subject: "📊 Total PHP: 12j 30m"
- [ ] Section riwayat: list 7 hari terakhir per subject (tanggal, durasi, summary singkat)
- [ ] User bisa menambah log study mandiri (tanpa harus ada di rutinitas hari itu)

---

### FEAT-06 | Language Learn

**Halaman:** `/language`

**User Stories:**
- US-14: Saya bisa mencatat apa yang dipelajari per bahasa hari ini
- US-15: Saya bisa melihat total waktu belajar per bahasa

**Business Rules:**
| ID | Rule |
|----|------|
| BR-43 | Log language ter-link ke `daily_routine_item` jika ada di rutinitas hari ini |
| BR-44 | Durasi default dari rutinitas, bisa direvisi |
| BR-45 | Total akumulasi per bahasa = SUM(duration_minutes) dari seluruh language_logs |

**Acceptance Criteria:**
- [ ] Kartu per bahasa yang ada di rutinitas hari ini
- [ ] Form: durasi, materi/topik, vocabulary (textarea), catatan
- [ ] Akumulasi per bahasa: "📊 Total Inggris: 45j 20m"
- [ ] Riwayat log 7 hari terakhir per bahasa
- [ ] User bisa tambah log mandiri (tanpa harus ada di rutinitas)

---

### FEAT-07 | Exercise

**Halaman:** `/exercise`

**User Stories:**
- US-16: Saya bisa mengisi detail latihan (sets, reps, durasi)
- US-17: Saya bisa mengisi kapan saja (tidak harus pagi), misalnya sore hari saat latihan

**Business Rules:**
| ID | Rule |
|----|------|
| BR-46 | Log exercise ter-link ke `daily_routine_item` jika ada di rutinitas hari ini |
| BR-47 | Sets dan reps bersifat optional (tidak semua latihan pakai sets/reps, misal latihan basket) |
| BR-48 | Total akumulasi per jenis latihan = SUM(duration_minutes) |

**Acceptance Criteria:**
- [ ] Kartu per jenis latihan yang ada di rutinitas hari ini
- [ ] Form: durasi, sets (optional), reps (optional), catatan
- [ ] Akumulasi per jenis: "📊 Total Push Up: 8j 20m"
- [ ] Riwayat log 7 hari terakhir
- [ ] User bisa tambah log mandiri

---

### FEAT-08 | Book

**Halaman:** `/book`

**User Stories:**
- US-18: Saya bisa mencatat berapa halaman dan berapa lama saya membaca hari ini

**Business Rules:**
| ID | Rule |
|----|------|
| BR-49 | Log book ter-link ke `daily_routine_item` jika ada di rutinitas |
| BR-50 | Pages read bersifat optional |
| BR-51 | Total akumulasi per buku = SUM(duration_minutes) |

**Acceptance Criteria:**
- [ ] Kartu per buku yang ada di rutinitas hari ini
- [ ] Form: durasi, halaman dibaca (optional), catatan
- [ ] Akumulasi per buku: "📊 Total Atomic Habits: 8j 40m"
- [ ] Riwayat log 7 hari terakhir
- [ ] User bisa tambah log mandiri

---

### FEAT-09 | Sleep Tracker

**Halaman:** `/sleep`

**User Stories:**
- US-19: Saya bisa mencatat jam tidur dan jam bangun saya secara manual
- US-20: Aplikasi otomatis menghitung durasi tidur saya

**Business Rules:**
| ID | Rule |
|----|------|
| BR-52 | Hanya 1 sleep log per hari (per tanggal bangun) |
| BR-53 | Jika `sleep_time > wake_time` (tidur lewat tengah malam): `duration = (24×60 - sleep_minutes) + wake_minutes` |
| BR-54 | Contoh: tidur 23:00 → bangun 06:00 = (24×60 - 23×60) + 6×60 = 60 + 360 = 420 menit = 7 jam ✅ |
| BR-55 | Block 'sleep' di rutinitas dianggap selesai jika sleep_log hari itu sudah diisi |

**Acceptance Criteria:**
- [ ] Time picker: jam tidur + jam bangun
- [ ] Durasi tidur otomatis muncul setelah kedua waktu diisi
- [ ] Indikator kualitas tidur sederhana: < 6 jam (kurang), 6-9 jam (baik), > 9 jam (terlalu banyak)
- [ ] Riwayat mingguan: chart atau list durasi tidur 7 hari terakhir

---

### FEAT-10 | Streak

**Business Rules:**
| ID | Rule |
|----|------|
| BR-56 | Streak dihitung dari hari-hari berturut-turut dengan skor harian ≥ 80% |
| BR-57 | Streak dievaluasi saat user membuka app — cek apakah kemarin ada daily_routine dengan skor ≥ 80% |
| BR-58 | Jika kemarin tidak ada atau skor < 80%, `current_streak` di-reset ke 0 |
| BR-59 | `longest_streak` hanya bisa bertambah, tidak pernah berkurang |
| BR-60 | Streak pertama kali diinisialisasi saat user register (current=0, longest=0) |

**Milestone Streak (untuk motivasi):**
| Streak | Label |
|--------|-------|
| 1-6 hari | 🌱 Mulai |
| 7-29 hari | 🔥 On Fire |
| 30-99 hari | ⚡ Konsisten |
| 100+ hari | 👑 Legenda |

**Acceptance Criteria:**
- [ ] Badge streak di Home: "🔥 12 Hari Streak"
- [ ] Sub-teks: "Terpanjang: 25 hari"
- [ ] Label milestone berubah sesuai range streak
- [ ] Animasi/highlight jika streak baru saja bertambah

---

### FEAT-11 | To Do List

**Halaman:** `/todo`

**User Stories:**
- US-21: Saya bisa menambah to-do secara manual
- US-22: Saya bisa mencentang to-do yang sudah selesai
- US-23: Saya bisa menghapus to-do

**Acceptance Criteria:**
- [ ] Input text + tombol "Tambah" (atau tekan Enter)
- [ ] Optional: pilih due date
- [ ] Checkbox setiap item; jika dicentang → strikethrough + pindah ke bagian "Selesai"
- [ ] Filter tab: Semua | Aktif | Selesai
- [ ] Tombol hapus per item
- [ ] Tombol "Hapus semua yang selesai" (bulk delete)

---

### FEAT-12 | Statistics & Progress

**Halaman:** `/stats`

**Acceptance Criteria:**
- [ ] **Skor Harian Chart**: Line chart skor % per hari (pilihan range: 7 / 30 / 90 hari)
- [ ] **Rata-rata Skor**: "Rata-rata minggu ini: 82%" | "Rata-rata bulan ini: 75%"
- [ ] **Akumulasi Durasi per Kategori:**
  - Study: list per subject + total jam masing-masing
  - Language: list per bahasa + total jam
  - Exercise: list per jenis + total jam
  - Book: list per buku + total jam
- [ ] **Streak History**: grafik atau heatmap kehadiran harian
- [ ] **Sleep Average**: rata-rata durasi tidur 7/30 hari

---

## 5. UI/UX STRUCTURE

### 5.1 Page Map

```
/login                    Login page
/register                 Register page

/ (Home)                  Today's Routine + Streak + Score
/routine/templates        Manage Templates (list, create, edit, delete)
/routine/setup            Adjust Today's Routine (locked after 11:00)

/deepwork                 Study Activity Log + Accumulation
/language                 Language Activity Log + Accumulation
/exercise                 Exercise Activity Log + Accumulation
/book                     Book Activity Log + Accumulation
/sleep                    Sleep Log + Weekly History

/todo                     To Do List

/stats                    Statistics & Progress Charts

/settings                 Master Data (Subjects, Languages, Exercises, Books)
```

### 5.2 Navigation Structure

**Desktop:** Sidebar kiri (collapsed by default, expand on hover/click)  
**Mobile:** Bottom Navigation Bar (5 item paling penting)

**Sidebar Items:**
```
🏠  Home
📚  Deepwork
🌐  Language
🏋️  Exercise
📖  Buku
😴  Sleep
✅  Todo
📊  Statistik
────────────
⚙️  Pengaturan
```

### 5.3 Design System

**Warna (suggestion):**
- Primary: `#6366F1` (Indigo) — energik, modern, cocok untuk produktivitas
- Success: `#10B981` (Emerald) — untuk completed, streak
- Warning: `#F59E0B` (Amber) — untuk alert, hampir locked
- Danger: `#EF4444` (Red) — untuk skip, streak break
- Background: `#0F0F0F` (Dark) atau `#FAFAFA` (Light) — beri opsi dark/light mode

**Typography:**
- Font: Inter (Google Fonts) — clean, readable
- Heading: 600-700 weight
- Body: 400 weight

**Component Library:** shadcn/ui (sudah include Card, Button, Input, Dialog, Progress, Badge, Chart)

---

## 6. API ENDPOINTS

> Semua endpoint authenticated. User hanya bisa akses data miliknya sendiri (enforced via RLS Supabase + middleware).

### Authentication
```
POST   /api/auth/register       Body: { email, password }
POST   /api/auth/login          Body: { email, password }
POST   /api/auth/logout
GET    /api/auth/session
```

### Master Data
```
GET    /api/subjects             List study subjects milik user
POST   /api/subjects             Body: { name }
DELETE /api/subjects/:id

GET    /api/languages            List user languages
POST   /api/languages            Body: { name }
DELETE /api/languages/:id

GET    /api/exercises            List exercise types
POST   /api/exercises            Body: { name }
DELETE /api/exercises/:id

GET    /api/books                List books (optional: ?status=reading)
POST   /api/books                Body: { title, author? }
PUT    /api/books/:id            Body: { title?, author?, status? }
DELETE /api/books/:id
```

### Routine Templates
```
GET    /api/templates            List semua template
POST   /api/templates            Body: { name, days_of_week }
GET    /api/templates/:id
PUT    /api/templates/:id        Body: { name?, days_of_week?, is_active? }
DELETE /api/templates/:id

POST   /api/templates/:id/blocks Body: { block_type, reference_id?, reference_name?, duration_minutes, sort_order }
PUT    /api/templates/:id/blocks/:blockId   Body: { duration_minutes?, sort_order? }
DELETE /api/templates/:id/blocks/:blockId

PUT    /api/templates/:id/blocks/reorder    Body: { blocks: [{id, sort_order}] }
```

### Daily Routine
```
GET    /api/routine/today        Generate jika belum ada, return daily_routine + items
GET    /api/routine/:date        Get routine untuk tanggal spesifik (format: YYYY-MM-DD)

POST   /api/routine/today/blocks Body: { block_type, reference_id?, reference_name?, duration_minutes }
                                 ⚠️ Error 403 jika sudah lewat 11:00

PUT    /api/routine/today/blocks/:itemId
       Body: {
         is_completed?,          // true/false
         skip_reason?,           // string
         actual_duration?,       // angka menit
         duration_minutes?       // revisi durasi planned (sebelum 11:00 saja)
       }

DELETE /api/routine/today/blocks/:itemId    ⚠️ Error 403 jika sudah lewat 11:00
```

### Activity Logs
```
GET    /api/study-logs           Query: ?date=YYYY-MM-DD&subject_id=uuid&limit=7
POST   /api/study-logs           Body: { subject_id, date, duration_minutes, activity?, material?, summary?, daily_routine_item_id? }
PUT    /api/study-logs/:id
DELETE /api/study-logs/:id

GET    /api/study-logs/accumulation   Return: [{ subject_id, subject_name, total_minutes }]

GET    /api/language-logs        Query: ?date=YYYY-MM-DD&language_id=uuid
POST   /api/language-logs        Body: { language_id, date, duration_minutes, material?, vocabulary?, notes?, daily_routine_item_id? }
PUT    /api/language-logs/:id
GET    /api/language-logs/accumulation

GET    /api/exercise-logs        Query: ?date=YYYY-MM-DD&exercise_type_id=uuid
POST   /api/exercise-logs        Body: { exercise_type_id, date, duration_minutes, sets?, reps?, notes?, daily_routine_item_id? }
PUT    /api/exercise-logs/:id
GET    /api/exercise-logs/accumulation

GET    /api/book-logs            Query: ?date=YYYY-MM-DD&book_id=uuid
POST   /api/book-logs            Body: { book_id, date, duration_minutes, pages_read?, notes?, daily_routine_item_id? }
PUT    /api/book-logs/:id
GET    /api/book-logs/accumulation

GET    /api/sleep-logs           Query: ?date=YYYY-MM-DD
POST   /api/sleep-logs           Body: { date, sleep_time, wake_time, notes? }
PUT    /api/sleep-logs/:id
GET    /api/sleep-logs/weekly    Return: last 7 days sleep data
```

### Streak & Stats
```
GET    /api/streak               Return: { current_streak, longest_streak, last_active_date }
POST   /api/streak/evaluate      Trigger evaluasi streak (dipanggil saat user buka app)

GET    /api/stats/scores         Query: ?range=7|30|90   Return: [{ date, score_percentage }]
GET    /api/stats/summary        Return: { avg_score_week, avg_score_month, total_days_tracked }
```

### Todo
```
GET    /api/todos                Query: ?status=all|active|completed
POST   /api/todos                Body: { title, due_date? }
PUT    /api/todos/:id            Body: { title?, is_completed?, due_date? }
DELETE /api/todos/:id
DELETE /api/todos/completed/all  Hapus semua yang sudah selesai
```

---

## 7. BUSINESS RULES SUMMARY

| ID | Rule | Kategori |
|----|------|----------|
| BR-01 | Email harus unik di sistem | Auth |
| BR-02 | Password minimum 8 karakter | Auth |
| BR-03 | Setelah register, redirect ke /settings | Auth |
| BR-07 | Nama master data unik per user per kategori (case-insensitive) | Master Data |
| BR-08 | Item tidak bisa dihapus jika masih di template aktif | Master Data |
| BR-10 | Buku status 'completed'/'paused' tidak muncul di pilihan rutinitas | Master Data |
| BR-11 | Template wajib ada nama + minimal 1 hari aktif | Template |
| BR-16 | Template boleh punya multiple block tipe sama | Template |
| BR-17 | Durasi block: 5–480 menit | Template |
| BR-19 | Edit template tidak mempengaruhi daily routine yang sudah jalan | Template |
| BR-20 | Daily routine di-generate otomatis jika belum ada | Daily Routine |
| BR-24 | Daily routine adalah SNAPSHOT dari template | Daily Routine |
| BR-25 | **Batas edit rutinitas harian: 11:00 WIB** | Daily Routine |
| BR-29 | Setelah 11:00, user hanya bisa checklist & isi durasi aktual | Daily Routine |
| BR-30 | Skor = completed / total × 100% | Daily Routine |
| BR-31 | Block 'sleep' = selesai jika sleep_log sudah diisi | Daily Routine |
| BR-33 | Streak +1 jika skor ≥ 80% | Streak |
| BR-34 | Streak dievaluasi saat user buka app | Streak |
| BR-35 | Streak reset ke 0 jika ada hari terlewat | Streak |
| BR-52 | 1 sleep log per hari | Sleep |
| BR-53 | Durasi sleep handle midnight crossing | Sleep |

---

## 8. DEVELOPMENT PHASES

### Phase 1 — MVP (Fokus saat ini)

**Sprint 1: Foundation**
1. Setup project Next.js + Supabase + Prisma
2. Auth: Register, Login, Logout, Protected Routes
3. Layout: Sidebar + Bottom Nav
4. Halaman Settings: CRUD Master Data (Subjects, Languages, Exercises, Books)

**Sprint 2: Routine Core**
5. Halaman Template: CRUD template + blocks
6. API generate daily routine
7. Home: tampilan checklist + score bar
8. API update block (complete/skip)
9. Streak logic + display

**Sprint 3: Activity Logs**
10. Deepwork / Study log + accumulation
11. Language Learn log + accumulation
12. Exercise log + accumulation
13. Book log + accumulation
14. Sleep log + duration calculation

**Sprint 4: Finishing MVP**
15. Todo list
16. Statistics page (chart skor + akumulasi)
17. Edit rutinitas sebelum 11:00 (lock logic)
18. Polish UI + responsive mobile

---

### Phase 2 — Gamifikasi

**Sistem Poin:**
- Poin = durasi × faktor effort per kategori
- Contoh: 1 menit Study = 2 poin | 1 menit Exercise = 1.5 poin | 1 menit Language = 2 poin | 1 menit Reading = 1.5 poin

**Level per Item (bukan level global):**
> Level = ukuran kedalaman engagement, bukan keahlian teknis

| Level | Total Durasi Akumulasi |
|-------|----------------------|
| Level 1 | 0 – 5 jam |
| Level 2 | 5 – 20 jam |
| Level 3 | 20 – 50 jam |
| Level 4 | 50 – 100 jam |
| Level 5 | 100 – 200 jam |
| Level 6+ | +100 jam per level |

Contoh tampilan: `PHP — Level 3 ⚡` | `Bahasa Inggris — Level 2 🌟`

**Fitur Phase 2 lainnya:**
- Badge/achievement (streak 7 hari, streak 30 hari, 100 jam study, dll)
- Morning & Night Journaling
- XP bar visual per item

---

### Phase 3 — Enhancement
- AI Coach (insight & motivasi harian berdasarkan data rutinitas)
- Advanced analytics & trend
- Accountability partner / share progress
- Push notification / reminder (PWA)

---

## 9. NOTES FOR AI DEVELOPER

### Urutan Implementasi yang Disarankan
```
1. schema.prisma → push ke Supabase
2. Supabase RLS policies
3. API routes (mulai dari Auth)
4. Pages + components (dari yang paling simple)
5. Testing per fitur sebelum lanjut
```

### Critical Implementation Notes

**Timezone WIB (WAJIB):**
```typescript
// lib/timezone.ts
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const WIB = 'Asia/Jakarta'

export function getNowWIB() {
  return toZonedTime(new Date(), WIB)
}

export function isBeforeLockTime(): boolean {
  const nowWIB = getNowWIB()
  const lockHour = parseInt(process.env.NEXT_PUBLIC_LOCK_HOUR || '11')
  return nowWIB.getHours() < lockHour
}
```

**Sleep Duration (midnight crossing):**
```typescript
function calculateSleepDuration(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const sleepMinutes = sh * 60 + sm
  const wakeMinutes = wh * 60 + wm

  if (wakeMinutes > sleepMinutes) {
    return wakeMinutes - sleepMinutes
  } else {
    // Midnight crossing: e.g., 23:00 → 06:00
    return (24 * 60 - sleepMinutes) + wakeMinutes
  }
}
```

**Streak Evaluation (jalankan saat app dibuka):**
```typescript
async function evaluateStreak(userId: string) {
  const yesterday = subDays(new Date(), 1)
  const yesterdayRoutine = await getRoutineByDate(userId, yesterday)

  if (!yesterdayRoutine || yesterdayRoutine.score_percentage < 80) {
    // Reset streak
    await updateStreak(userId, { current_streak: 0 })
  } else {
    // Increment streak
    await updateStreak(userId, { current_streak: streak + 1, last_active_date: today })
  }
}
```

**Score Calculation:**
```typescript
function calculateScore(items: DailyRoutineItem[]): number {
  if (items.length === 0) return 0
  const completed = items.filter(i => i.is_completed).length
  return Math.round((completed / items.length) * 100 * 100) / 100
}
```

**Snapshot Pattern (PENTING):**
```typescript
// Saat generate daily_routine, COPY data dari template, jangan hanya FK
// Ini memastikan edit template tidak mengubah hari yang sudah berjalan

async function generateDailyRoutine(userId: string, templateId: string, date: Date) {
  const template = await getTemplateWithBlocks(templateId)
  const routine = await createDailyRoutine({ userId, date, templateId })

  const items = template.blocks.map(block => ({
    daily_routine_id: routine.id,
    block_type: block.block_type,
    reference_id: block.reference_id,
    reference_name: block.reference_name,  // ← snapshot nama
    duration_minutes: block.duration_minutes,  // ← snapshot durasi
    sort_order: block.sort_order
  }))

  await createDailyRoutineItems(items)
  return routine
}
```

**Supabase RLS (Row Level Security):**
```sql
-- Contoh RLS untuk study_subjects
ALTER TABLE study_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own subjects"
ON study_subjects
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Terapkan pola yang sama untuk SEMUA tabel
```

**Accumulation Query:**
```sql
-- Total akumulasi durasi per subject
SELECT
  ss.id,
  ss.name,
  COALESCE(SUM(sl.duration_minutes), 0) as total_minutes
FROM study_subjects ss
LEFT JOIN study_logs sl ON sl.subject_id = ss.id AND sl.user_id = ss.user_id
WHERE ss.user_id = $1
GROUP BY ss.id, ss.name
ORDER BY total_minutes DESC;
```

---

*SDD ini dibuat sebagai panduan development untuk vibe coding dengan AI tools (Cursor, Claude Code, dll). Mulailah dari database schema → API → UI secara berurutan. Setiap fitur dikerjakan sampai selesai sebelum pindah ke fitur berikutnya.*
