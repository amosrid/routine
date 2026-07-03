# Saya catat keputusan klarifikasinya. Ini membuat SDD lebih implementable tanpa mengubah scope MVP.

# Keputusan Final Untuk MVP

# Semua fitur MVP di SDD tetap masuk.

# Eksekusi wajib bertahap per sprint kecil.

# Urutan prioritas: Auth -> Master Data -> Template -> Daily Checklist -> Score -> Streak -> Activity Logs -> Stats dasar -> Todo -> responsive polish.

# Activity log yang terkait routine item otomatis menyelesaikan checklist item dan menghitung ulang score.

# Jika ada banyak template aktif di hari yang sama, MVP memilih template aktif pertama berdasarkan created\_at ASC.

# Todo tetap MVP, tapi dikerjakan setelah core loop dan stats dasar stabil.

# Stack tetap Supabase Auth + Prisma, dengan profiles sebagai tabel public penghubung ke auth.users.

# Query server-side wajib selalu filter user\_id dari session, RLS hanya lapisan tambahan.

# All user-facing application UI must be English across all sprints. SDD/internal planning documents may remain Indonesian.

# Implikasi Teknis Penting

# Desain data sebaiknya sedikit disesuaikan dari SDD: semua tabel aplikasi reference ke profiles.id, bukan langsung ke auth.users(id). Ini akan membuat Prisma lebih nyaman dipakai dan tetap selaras dengan Supabase Auth.

# Untuk activity log, setiap create/update log yang punya daily\_routine\_item\_id harus berjalan dalam satu transaction:

# Simpan log.

# Update daily\_routine\_items.is\_completed = true.

# Set actual\_duration dari durasi log.

# Recalculate daily\_routines.score\_percentage.

# Evaluasi efek ke streak hanya pada waktu yang sudah ditentukan, bukan setiap perubahan kecil secara sembarang.

# Sprint Yang Paling Aman

# Sprint 1: Foundation + Auth

# Setup project, Supabase, Prisma, schema awal profiles, auth flow, protected routes.

# Sprint 2: Master Data

# CRUD subjects, languages, exercise types, books, validasi unik per user, status buku.

# Sprint 3: Routine Template

# CRUD template dan blocks, pemilihan hari, sort order sederhana, validasi master data.

# Sprint 4: Daily Routine Core

# Auto-generate routine hari ini, snapshot dari template, pilih template pertama by created\_at ASC, checklist, skip, score.

# Sprint 5: Lock + Streak

# Lock edit setelah 11:00 WIB server-side, streak idempotent, display streak di Home.

# Sprint 6: Activity Logs

# Study, language, exercise, book, sleep. Log terkait checklist otomatis complete dan update score.

# Sprint 7: Statistics Dasar

# Score chart sederhana, rata-rata, akumulasi durasi per kategori, sleep average dasar.

# Sprint 8: Todo + Polish

# Todo MVP, responsive layout, empty/loading/error states, final acceptance check.

# Tidak ada file yang saya buat atau ubah.
