# Revisi Alur Aplikasi Daily Routine

Dokumen ini menyimpan pemahaman terbaru tentang alur aplikasi yang benar. Dokumen ini menjadi acuan revisi sebelum menyempurnakan kode lebih lanjut.

## Status Pemahaman

Pemahaman alur aplikasi yang benar sudah dikunci secara umum:

- Home / Today's Routine adalah pusat sistem harian.
- Template hanya pola awal, bukan detail final hari itu.
- Setiap pagi user menyesuaikan rutinitas hari ini di Home sebelum lock jam 11.00 WIB.
- Checklist item yang sudah completed akan memunculkan entry detail di halaman kategori.
- Detail/log tidak dibuat bebas sebelum aktivitas completed.
- Halaman kategori berfungsi untuk master data, pending details, history, dan akumulasi durasi.
- Journaling masuk rutinitas.
- Sleep hanya monitoring, bukan checklist rutinitas.
- Custom activity tetap tersedia.

## Prinsip Utama

### 1. Home adalah pusat harian

User setiap hari membuka Home untuk melihat dan mengatur Today's Routine.

Home memiliki tiga fungsi utama:

1. Generate rutinitas hari ini dari template.
2. Menyesuaikan item konkret untuk hari itu sebelum lock.
3. Checklist completed / not completed / skipped.

Home bukan hanya tempat melihat checklist, tetapi juga tempat daily setup ringan.

### 2. Template adalah pola kasar

Template hanya menyimpan struktur awal seperti:

- Study 180 minutes
- Exercise 30 minutes
- Book 30 minutes
- Morning Journal
- Night Journal
- Custom Activity

Template tidak harus langsung menyimpan detail final seperti PHP, Vibe Coding, Push Up, atau Atomic Habits.

Detail final dipilih setiap pagi saat daily setup.

### 3. Daily setup dilakukan sebelum jam 11.00 WIB

Setelah routine harian dibuat dari template, user bisa menyesuaikan item hari itu sebelum lock.

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

Besok user bisa memilih detail yang berbeda tanpa mengubah template utama.

### 4. Lock harian

Ada dua jenis lock:

1. Manual temporary lock dari user setelah selesai setup pagi.
2. Auto final lock setelah jam 11.00 WIB.

Setelah locked:

- Struktur rutinitas hari itu tidak bisa diubah.
- Checklist tetap bisa digunakan.
- Skip tetap bisa digunakan.
- Detail di halaman kategori tetap bisa diisi.

### 5. Checklist membuat pending detail

Alur yang benar:

```text
Daily routine item completed
-> pending detail muncul di halaman kategori
-> user mengisi detail sekarang atau nanti
```

Contoh:

User checklist:

```text
Study PHP 90 minutes -> completed
```

Maka di halaman Study muncul:

```text
PHP - 90 minutes - Needs details
```

User bisa mengisi:

- Activity
- Material
- Summary
- Notes

Detail bisa diisi pada hari yang sama atau besok jika user lupa.

### 6. Log tidak muncul sebelum checklist completed

Jika user belum checklist item sebagai completed, maka tidak ada log/detail yang perlu diisi.

Artinya, alur "create activity log bebas lalu checklist otomatis complete" bukan alur utama yang diinginkan.

Alur utama adalah:

```text
Checklist complete first
Then fill details later
```

### 7. Score dihitung dari item konkret harian

Score harus dihitung dari final daily routine items hasil setup, bukan dari block template kasar.

Contoh:

Daily routine:

```text
PHP
Vibe Coding
Push Up
Atomic Habits
Morning Journal
```

Jika 4 dari 5 item completed, maka score = 80%.

Jika template awal hanya punya "Study 180 minutes", tetapi dipecah menjadi PHP dan Vibe Coding, maka score tetap menghitung PHP dan Vibe Coding sebagai item konkret.

### 8. Halaman kategori punya empat fungsi

Halaman kategori seperti Study, Language, Exercise, Book, dan Journaling harus berfungsi sebagai:

1. Tempat menambah master data.
2. Tempat melihat pending detail dari completed routine item.
3. Tempat mengisi/edit detail aktivitas.
4. Tempat melihat akumulasi durasi dan history per item.

Contoh halaman Study:

- Tambah subject: PHP, Laravel, Vibe Coding.
- Lihat pending detail: PHP hari ini needs details.
- Isi summary belajar PHP.
- Lihat total PHP: 100h.
- Klik PHP untuk melihat history.

### 9. Master data pindah ke halaman kategori

Master data sebaiknya berada di halaman kategori masing-masing:

- Study subjects di `/deepwork`
- Languages di `/language`
- Exercise types di `/exercise`
- Books di `/book`

Settings nantinya bisa dipakai untuk:

- Profile
- Preferences
- History rutinitas
- Pengaturan aplikasi lain

### 10. Journaling masuk rutinitas

Journaling menjadi bagian dari routine checklist.

Jenis journaling:

- Morning Journal
- Night Journal

Journaling cukup completed / not completed.

Setelah completed, halaman Journaling menampilkan entry yang bisa diisi:

- Morning plan
- Reflection
- Evaluation
- Notes

### 11. Sleep hanya monitoring

Sleep tidak masuk checklist routine utama untuk sekarang.

Sleep tetap punya halaman monitoring:

- Sleep time
- Wake time
- Duration
- Notes
- History

Sleep tidak memengaruhi score rutinitas harian.

### 12. Custom activity tetap ada

Custom activity tetap bisa masuk daily routine.

Contoh:

- Dimsum
- Antar bolu
- Reset / clean up
- Shutdown

Custom activity bisa dicentang completed atau skipped.

Untuk MVP revisi, custom activity tidak wajib punya halaman detail kategori khusus.

## Gap Implementasi Saat Ini

Implementasi saat ini belum sepenuhnya sesuai dengan alur di atas.

Gap utama:

1. Activity logs sekarang masih dibuat manual dari halaman kategori.
2. Log bisa dibuat sebelum checklist completed, padahal seharusnya muncul setelah completed.
3. Home belum punya daily setup untuk memecah block template menjadi item konkret harian.
4. Template block masih terlalu langsung mengarah ke reference spesifik.
5. Master data masih berada di Settings, belum di halaman kategori masing-masing.
6. Journaling belum ada.
7. Sleep masih berpotensi diperlakukan seperti routine block, padahal harus monitoring saja.
8. Settings belum diarahkan ke fungsi baru seperti profile/preferences/history rutinitas.
9. Stats masih umum, belum fokus ke akumulasi mastery per item di halaman kategori.

## Alur Ideal Aplikasi

### A. Setup Master Data

User menambah data kategori di halaman masing-masing.

Contoh:

Study:

- PHP
- Vibe Coding
- Laravel

Exercise:

- Push Up
- Mobility
- Basketball Practice

Book:

- Atomic Habits
- Deep Work

### B. Buat Template Kasar

User membuat template seperti:

```text
Weekday Template
- Study 180 minutes
- Exercise 30 minutes
- Book 30 minutes
- Morning Journal
- Custom: Dimsum 90 minutes
- Night Journal
```

Template ini dipakai sebagai pola awal.

### C. Daily Setup di Home

Setiap pagi, sistem generate Today's Routine dari template aktif.

Sebelum lock, user menyesuaikan detail:

```text
Study 180 minutes:
- PHP 90 minutes
- Vibe Coding 90 minutes

Exercise 30 minutes:
- Push Up 15 minutes
- Mobility 15 minutes

Book 30 minutes:
- Atomic Habits 30 minutes
```

User bisa lock manual setelah selesai setup.

Jika tidak lock manual, sistem otomatis lock setelah 11.00 WIB.

### D. Checklist Harian

Sepanjang hari user checklist:

```text
PHP -> completed
Vibe Coding -> skipped, reason: tired
Push Up -> completed
Atomic Habits -> completed
Morning Journal -> completed
```

Score dihitung dari item final tersebut.

### E. Pending Detail di Halaman Kategori

Setelah item completed, halaman kategori menampilkan entry:

Study:

```text
PHP - 90 minutes - Needs details
```

Book:

```text
Atomic Habits - 30 minutes - Needs details
```

User bisa mengisi detail kapan saja.

### F. History dan Akumulasi

Setiap halaman kategori menampilkan total dan history.

Contoh Study:

```text
PHP total: 100h
Vibe Coding total: 30h
Laravel total: 12h
```

Klik item membuka history detail.

## Rencana Revisi yang Matang

Revisi harus dilakukan bertahap agar tidak merusak fitur yang sudah ada.

### Phase 1: Kunci Model Alur Baru

Tujuan:

- Menyesuaikan konsep data tanpa langsung merusak UI.

Pekerjaan:

1. Review schema saat ini.
2. Tentukan perbedaan antara:
   - Template block kasar.
   - Daily setup item konkret.
   - Completed item detail.
3. Tentukan apakah activity log table saat ini dipakai ulang atau diganti menjadi detail table berbasis completed daily item.
4. Tulis test untuk alur baru.

Acceptance:

- Ada desain schema final untuk revisi.
- Ada test yang mendefinisikan alur checklist -> pending detail.

### Phase 2: Daily Setup di Home

Tujuan:

- User bisa menyesuaikan rutinitas harian langsung di Home sebelum lock.

Pekerjaan:

1. Home menampilkan routine generated dari template.
2. Jika belum locked, user bisa split block kasar.
3. User bisa memilih subject/language/exercise/book dari master data.
4. User bisa set durasi per item.
5. User bisa add custom activity.
6. User bisa lock manual.
7. Auto lock jam 11.00 WIB tetap berlaku.

Acceptance:

- Template Study 180 minutes bisa menjadi PHP 90 + Vibe Coding 90.
- Setelah locked, struktur tidak bisa diubah.
- Checklist tetap bisa dipakai.

### Phase 3: Checklist ke Pending Detail

Tujuan:

- Completed checklist item membuat pending detail di halaman kategori.

Pekerjaan:

1. Complete item membuat atau membuka pending detail.
2. Skipped item tidak membuat pending detail.
3. Pending detail bisa diisi/edit setelahnya.
4. Detail bisa diisi besok atau hari lain.

Acceptance:

- Completed Study PHP muncul di halaman Study sebagai Needs details.
- Jika belum completed, item tidak muncul sebagai log/detail.
- Detail bisa disimpan dan status berubah menjadi Filled.

### Phase 4: Pindahkan Master Data ke Halaman Kategori

Tujuan:

- Master data lebih natural dikelola di halaman masing-masing.

Pekerjaan:

1. Study subject CRUD pindah ke `/deepwork`.
2. Language CRUD pindah ke `/language`.
3. Exercise type CRUD pindah ke `/exercise`.
4. Book CRUD pindah ke `/book`.
5. Settings dikurangi atau dialihkan ke profile/preferences/history.

Acceptance:

- User bisa menambah PHP dari halaman Study.
- PHP langsung tersedia untuk daily setup.
- Settings tidak lagi menjadi pusat utama master data kategori.

### Phase 5: Journaling

Tujuan:

- Tambah journaling sebagai bagian dari routine checklist.

Pekerjaan:

1. Tambah block type journaling jika diperlukan.
2. Tambah Morning Journal dan Night Journal item.
3. Tambah halaman `/journaling`.
4. Completed journaling item muncul sebagai entry yang bisa diisi.

Acceptance:

- Morning Journal dan Night Journal bisa dicentang.
- Halaman Journaling bisa mengisi detail pagi/malam.

### Phase 6: Sleep Monitoring

Tujuan:

- Pastikan Sleep hanya monitoring, bukan checklist score.

Pekerjaan:

1. Hapus atau nonaktifkan Sleep sebagai routine block jika masih ada.
2. Pertahankan halaman Sleep untuk input sleep/wake time.
3. Sleep tidak memengaruhi daily routine score.

Acceptance:

- Sleep tidak muncul sebagai routine checklist.
- Sleep tetap punya history monitoring.

### Phase 7: Accumulation per Category Item

Tujuan:

- Tampilkan progress mastery per item di halaman kategori.

Pekerjaan:

1. Study menampilkan total durasi per subject.
2. Language menampilkan total durasi per language.
3. Exercise menampilkan total durasi per exercise type.
4. Book menampilkan total durasi per book.
5. Klik item membuka history detail.

Acceptance:

- PHP total 100h terlihat di halaman Study.
- History PHP bisa dilihat.

### Phase 8: README dan SDD Revisi

Tujuan:

- Dokumentasi sesuai alur baru.

Pekerjaan:

1. Revisi `README.md`.
2. Jika diperlukan, tambahkan dokumen keputusan baru.
3. Tandai implementasi lama yang diganti.

Acceptance:

- README menjelaskan alur baru dengan benar.
- Tidak ada kontradiksi antara README dan aplikasi.

## Prioritas Kerja

Urutan paling aman:

1. Daily setup di Home.
2. Checklist -> pending detail.
3. Master data pindah ke halaman kategori.
4. Journaling.
5. Sleep monitoring cleanup.
6. Accumulation + history per item.
7. README final.

Alasan:

- Daily setup adalah inti masalah.
- Pending detail bergantung pada checklist item konkret.
- Master data perlu mendukung daily setup.
- Journaling dan accumulation lebih aman setelah alur utama benar.

## Hal yang Tidak Boleh Dilakukan

- Jangan membuat log bebas yang tidak berasal dari completed checklist item sebagai alur utama.
- Jangan menganggap template sebagai rutinitas final harian.
- Jangan membuat Sleep memengaruhi score.
- Jangan mengubah fitur besar tanpa test.
- Jangan menghapus data lama tanpa migration strategy.
- Jangan menebak alur jika ada bagian yang ambigu.

## Kesimpulan

Aplikasi yang diinginkan adalah sistem daily routine yang berpusat pada:

```text
Template kasar
-> Daily setup pagi
-> Lock
-> Checklist item konkret
-> Pending detail di halaman kategori
-> Detail/history/akumulasi
```

Revisi berikutnya harus mengikuti alur ini secara konsisten.
