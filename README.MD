

## Tujuan Bot:
Bot ini digunakan untuk mengelola layanan DNS dan Cloudflare Worker langsung melalui Telegram. Bot dapat:
- Login menggunakan Cloudflare API Token, Account ID, dan Zone ID
- Mengelola DNS Record (A & CNAME)
- Deploy file JavaScript dari GitHub ke Cloudflare Worker
- Upload manual file JS dan deploy sebagai Worker
- Melihat & menghapus Worker
- Logout

---

## Teknologi:
- Node.js
- Telegraf.js
- Axios (untuk HTTP ke Cloudflare API)
- Multer / stream untuk file handler
- dotenv untuk .env
- Simple file-based session (pakai JSON)

---

## Alur Bot:
1. User kirim `/start`
2. Bot tampilkan:
   - Deskripsi bot
   - Tombol `🔐 Login`
3. Setelah klik login, bot minta:
   - API Token
   - Account ID
   - Zone ID
4. Jika valid, tampil menu fitur sebagai tombol

---

## Fitur DNS Tools:
- `➕ Tambah A Record`
   - Bot minta nama domain dan IP
   - Kirim request POST ke Cloudflare
- `➕ Tambah CNAME`
   - Bot minta nama dan target
- `📃 List A Record`
   - GET semua A record
- `📃 List CNAME`
   - GET semua CNAME
- `❌ Hapus A Record`
   - Bot tampilkan list record + tombol hapus
- `❌ Hapus CNAME`

---

## Fitur Worker Tools:
- `⚡ Deploy dari GitHub`
   - User kirim link repo GitHub (public)
   - Bot clone repo, cari `.js` atau `.ts`
   - Bot minta nama Worker
   - Upload file ke Cloudflare Worker API
- `📥 Upload Manual JS`
   - User kirim file JS
   - Bot minta nama Worker
   - Bot deploy ke Worker API
- `📜 List Worker`
- `🗑️ Hapus Worker`

---

## Fitur Tambahan:
- `🚪 Logout`: menghapus semua data session user
- Validasi tiap user harus login sebelum akses fitur
- Logika error ditangani (404, 403, limit API, dll)

---

## Struktur Folder:
- `index.js` → entry point
- `handlers/` → semua fitur perintah
- `utils/cloudflare.js` → API Cloudflare
- `utils/github.js` → clone & extract file
- `data/session.json` → simpan data login user
- `.env` untuk bot token

---

## Siapkan file:
- `.env`
   - `BOT_TOKEN=xxx`
- Gunakan `axios` dan `simple-git` untuk GitHub
- Bot jalan dengan `node index.js` atau `npm start`
