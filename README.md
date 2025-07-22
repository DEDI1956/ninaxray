# Cloudflare Management Bot

Bot Telegram untuk mengelola layanan DNS dan Cloudflare Worker.

## Fitur

- Login dengan Cloudflare API Token, Account ID, dan Zone ID
- Kelola DNS Records (A & CNAME)
- Deploy Worker dari GitHub
- Upload dan deploy Worker manual
- Lihat dan hapus Worker
- Logout

## Instalasi

1.  Clone repository ini
2.  Install dependensi: `npm install`
3.  Buat file `.env` dan isi dengan `BOT_TOKEN` Anda.
4.  Jalankan bot: `npm start`

## Struktur Folder

- `index.js`: Entry point aplikasi
- `handlers/`: Handler untuk setiap perintah dan aksi
- `utils/`: Utilitas untuk Cloudflare API dan GitHub
- `data/`: Penyimpanan sesi pengguna
- `.env`: Konfigurasi environment variables
