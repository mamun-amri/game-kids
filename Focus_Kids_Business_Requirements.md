# Business Requirements Document (BRD)

## 1. Nama Proyek

**Focus Kids** – Game Edukasi untuk Melatih Fokus dan Konsentrasi Anak

---

# 2. Latar Belakang

Banyak anak saat ini mudah terdistraksi oleh berbagai stimulus digital sehingga kemampuan fokus, konsentrasi, daya ingat, dan ketelitian menjadi berkurang. Dibutuhkan media pembelajaran yang menyenangkan namun tetap mampu melatih kemampuan kognitif tersebut.

Focus Kids merupakan aplikasi game edukasi yang dirancang menggunakan berbagai mini game dengan tingkat kesulitan yang meningkat secara bertahap. Setiap permainan dirancang berdasarkan aspek psikologi perkembangan anak sehingga selain menghibur juga memberikan manfaat terhadap perkembangan kemampuan fokus.

---

# 3. Tujuan

Membangun aplikasi game edukasi yang:

- Melatih fokus dan konsentrasi anak.
- Meningkatkan kemampuan observasi.
- Melatih daya ingat.
- Melatih kecepatan berpikir.
- Melatih kemampuan mengikuti instruksi.
- Memberikan laporan perkembangan kepada orang tua.

---

# 4. Target Pengguna

### Primary User

Anak usia:

- 3–5 Tahun
- 6–8 Tahun
- 9–12 Tahun

### Secondary User

Orang tua

### Tertiary User

Guru / Terapis

---

# 5. Ruang Lingkup

Aplikasi terdiri dari beberapa mini game yang memiliki ratusan level.

Setiap game memiliki:

- Level
- Reward
- Achievement
- Statistik
- Penilaian Fokus

---

# 6. Fitur Utama

## 6.1 Profil Anak

Fitur:

- Login sederhana
- Pilih avatar
- Nama anak
- Umur
- Kategori usia

---

## 6.2 Dashboard

Menampilkan:

- Level saat ini
- Total bintang
- Total badge
- Persentase fokus
- Akurasi
- Waktu bermain
- Game terakhir dimainkan

---

## 6.3 Mini Games

### Memory Match

Tujuan:

Mencari pasangan kartu.

Parameter Level

- Jumlah kartu
- Timer
- Distractor

---

### Hidden Object

Tujuan:

Mencari benda tertentu.

Parameter

- Jumlah objek
- Banyak distraksi
- Kompleksitas gambar

---

### Find Difference

Tujuan

Menemukan perbedaan.

Parameter

- Jumlah perbedaan
- Kompleksitas gambar
- Timer

---

### Simon Memory

Tujuan

Mengingat urutan warna.

Parameter

- Panjang urutan
- Kecepatan
- Variasi warna

---

### Tap Target

Tujuan

Menekan objek yang benar.

Parameter

- Jumlah objek
- Kecepatan gerak
- Distraksi

---

### Maze

Tujuan

Menemukan jalan keluar.

Parameter

- Ukuran maze
- Cabang
- Timer

---

### Pattern Recognition

Tujuan

Melanjutkan pola.

Parameter

- Kompleksitas
- Bentuk
- Warna

---

### Follow Instruction

Contoh

"Tekan warna merah"

"Tekan merah lalu hijau"

"Tekan angka genap"

"Tekan huruf vokal"

---

### Counting Game

Mengingat jumlah objek.

---

### Sound Recognition

Menebak suara.

---

# 7. Sistem Level

## Beginner

Level 1–20

---

## Easy

21–50

---

## Medium

51–100

---

## Hard

101–200

---

## Expert

201–500

---

## Genius

501–1000

---

# 8. Sistem Penilaian

Setiap permainan menghasilkan nilai:

- Akurasi
- Kecepatan
- Konsistensi
- Waktu respon

Nilai akhir:

Focus Score = (40% Akurasi + 30% Konsistensi + 20% Kecepatan + 10% Penyelesaian)

---

# 9. Reward

Reward yang tersedia:

- ⭐ Bintang
- 🏆 Trophy
- 🎖 Badge
- 🎁 Mystery Box
- Avatar Baru
- Background Baru
- Dunia Baru

---

# 10. Achievement

Contoh:

- First Win
- 10 Level Completed
- 100 Stars
- Perfect Accuracy
- No Mistake
- Fast Thinker
- Memory Master
- Focus Champion

---

# 11. Dashboard Orang Tua

Menampilkan:

- Lama bermain
- Grafik perkembangan
- Tingkat fokus
- Akurasi
- Game favorit
- Area yang perlu ditingkatkan
- Riwayat permainan

---

# 12. Notifikasi

- Daily Challenge
- Achievement Baru
- Reward Baru
- Reminder Bermain

---

# 13. Gamifikasi

Daily Reward

Streak Harian

Weekly Challenge

Monthly Challenge

Season Event

Leaderboard (Opsional)

---

# 14. Non Functional Requirement

## Performance

Loading game < 3 detik

FPS minimal 60

Offline support

Auto Save

---

## Security

Data tersimpan lokal

Cloud Sync (opsional)

Profil anak terpisah

Backup otomatis

---

## Compatibility

Android

iOS

Web

Tablet

Desktop

---

# 15. Teknologi

Frontend

- React
- Vite
- TypeScript

Game Engine

- Phaser 3

Backend

- Node.js
- Express

Database

- PostgreSQL

Authentication

- JWT (untuk akun orang tua)

Storage

- Local Storage
- Cloud Sync

---

# 16. MVP (Minimum Viable Product)

Versi pertama akan mencakup:

- Profil Anak
- Dashboard
- 5 Mini Game
- 100 Level
- Reward
- Achievement
- Statistik Fokus
- Daily Challenge

---

# 17. Roadmap

## Phase 1

- Login
- Profil
- Dashboard
- Memory Game
- Hidden Object
- Simon Says

## Phase 2

- Maze
- Pattern Recognition
- Follow Instruction
- Reward
- Achievement

## Phase 3

- Dashboard Orang Tua
- Analisis Perkembangan
- Sinkronisasi Cloud
- Event Mingguan
- AI untuk penyesuaian tingkat kesulitan

---

# 18. Kriteria Keberhasilan

Proyek dianggap berhasil apabila:

- Anak dapat memainkan game secara mandiri sesuai usia.
- Tingkat penyelesaian level lebih dari 80%.
- Dashboard mampu menampilkan perkembangan fokus secara jelas.
- Sistem dapat menghasilkan hingga 1.000 level melalui generator level tanpa perlu membuat setiap level secara manual.
- Orang tua memperoleh laporan perkembangan yang mudah dipahami dan dapat digunakan untuk memantau peningkatan kemampuan anak dari waktu ke waktu.
