# 🧠 Focus Kids

Game edukasi untuk melatih fokus dan konsentrasi anak (berdasarkan BRD `Focus_Kids_Business_Requirements.md`).

**Stack:** React + Vite + TypeScript · Phaser 3 · Node.js + Express · PostgreSQL · JWT

## ✨ Fitur (MVP)

- **Profil Anak** — buat profil, pilih avatar, umur & kategori usia (3–5 / 6–8 / 9–12)
- **Dashboard Anak** — total bintang, badge, akurasi, persentase fokus, waktu bermain, game terakhir, kemajuan per game, streak harian, kotak misteri
- **6 Mini Game** (Phaser 3):
  - Memory Match, Hidden Object, Find Difference, Simon Memory, Tap Target, Counting
- **1000 Level** dihasilkan otomatis oleh level generator (Beginner → Easy → Medium → Hard → Expert → Genius)
- **Focus Score** = 40% Akurasi + 30% Konsistensi + 20% Kecepatan + 10% Penyelesaian (BRD §8)
- **Reward** — bintang, trophy, badge, kotak misteri, avatar baru, background baru, dunia baru
- **Achievement** — 13 lencana otomatis (First Win, Memory Master, Focus Champion, dst.)
- **Daily Challenge** — tantangan harian acak + hadiah kotak misteri
- **Dashboard Orang Tua** — JWT login, waktu bermain, grafik perkembangan, tingkat fokus, akurasi, game favorit, area yang perlu ditingkatkan, riwayat permainan, lencana
- **Offline-first** — semua data anak tersimpan lokal (localStorage), sinkronisasi cloud ke server PostgreSQL
- **Gamifikasi** — streak harian, milestone bintang, mystery box

## 🚀 Cara Menjalankan

### 0. Prasyarat
- Node.js ≥ 18
- PostgreSQL 16 binaries di `/usr/lib/postgresql/16/bin` (untuk kluster lokal; tidak perlu server berjalan)

### 1. Install dependensi
```bash
cd focus-kids
npm install
```

### 2. Inisialisasi database lokal (port 5433, tanpa password/sudo)
```bash
npm run db:init     # initdb kluster lokal + buat database + apply schema & seed
```

### 3. Jalankan server & client
```bash
npm run dev
```
- Client: **http://localhost:5173**
- Server API: **http://localhost:4000**

### Perintah berguna lainnya
```bash
npm run db:start    # nyalakan kluster postgres lokal
npm run db:stop     # matikan kluster postgres lokal
npm run db:migrate  # apply ulang schema + seed
npm run build       # build production (server + client)
```

> **Opsional:** pakai PostgreSQL eksternal dengan set `DATABASE_URL` di `server/.env`.
> Server membaca `DATABASE_URL`, `PORT`, `JWT_SECRET`, `CLIENT_ORIGIN`.

## 🗂️ Struktur Proyek

```
focus-kids/
├── client/                 # React + Vite + TS + Phaser 3
│   └── src/
│       ├── pages/          # Home, Dashboard, GameList, LevelSelect, Play, Rewards, Achievements, ParentPage
│       ├── games/          # 6 scene Phaser + core (BaseGameScene, createGame, sceneUtils)
│       ├── context/        # AppContext (state global + recordSession)
│       ├── lib/            # levelGen, focusScore, achievements, rewards, storage, sync, api, stats, tiers
│       └── components/     # GameShell, Modal, StarRating, Charts, Toasts, Layout
└── server/                 # Express + TypeScript + pg
    ├── db/                 # schema.sql + seed.sql
    ├── scripts/            # db-cluster.mjs (init/start/stop), migrate.mjs
    └── src/                # index, config, db, middleware/auth, routes (auth, children, parent, meta)
```

## 🎮 Skema Level (BRD §7)

| Tier | Level |
|------|-------|
| 🌱 Beginner | 1–20 |
| 🍀 Easy | 21–50 |
| ⭐ Medium | 51–100 |
| 🔥 Hard | 101–200 |
| 🚀 Expert | 201–500 |
| 🧠 Genius | 501–1000 |

Setiap level dibuka setelah level sebelumnya selesai. Konfigurasi tiap level (jumlah kartu, timer, distraktor, dll.) dihasilkan deterministik dari seed `(game, level)` di `client/src/lib/levelGen.ts`.

## ✅ Kriteria Keberhasilan (BRD §18)

- Anak dapat bermain mandiri sesuai umur ✓
- Tingkat penyelesaian level > 80% (sistem level + result modal) ✓
- Dashboard menampilkan perkembangan fokus (anak & orang tua) ✓
- 1.000 level dari generator tanpa pembuatan manual ✓
- Laporan orang tua mudah dipahami & memantau perkembangan ✓
