📦 NinaXRAY - All-in-One XRAY Auto Installer

NinaXRAY adalah skrip otomatis untuk menginstal berbagai layanan penting di VPS Anda, termasuk XRAY (VLESS, VMESS, TROJAN), SSH, Dropbear, NGINX, dan lainnya dengan antarmuka menu yang menarik dan berwarna.


---

✨ Fitur Utama

Menampilkan informasi VPS (IP, RAM, Uptime, dll)

Instalasi otomatis:

XRAY (VLESS TLS & NON-TLS, VMESS, TROJAN)

SSH, Dropbear

NGINX, HAPROXY

NOOBZVPN, UDP CUSTOM, WS-ePro


Menampilkan hasil konfigurasi dalam format siap pakai

Antarmuka menu warna-warni dan mudah dibaca

Dukungan domain custom



---

🚀 Cara Menggunakan

1. Upload ke VPS kamu:

wget https://raw.githubusercontent.com/DEDI1956/ninaxray/main/xray-installer.sh
chmod +x xray-installer.sh
./xray-installer.sh

2. Ikuti instruksi untuk memasukkan domain.

Skrip akan secara otomatis menginstal layanan dan menampilkan hasil akhir seperti:

📦 XRAY INSTALL COMPLETE!
🔗 VLESS TLS     : vless://UUID@domain:443?...
🔗 VLESS NON-TLS : vless://UUID@domain:80?...
🔗 VMESS TLS     : vmess://base64...
🔗 TROJAN        : trojan://...
🔗 DROPBEAR PORT : 443, 222
🔗 SSH PORT      : 22
🔗 UDP CUSTOM    : 7300


---

🧠 Informasi Tambahan

Dibuat oleh: Dedi (DEDI1956)

Cocok untuk Ubuntu VPS

Pastikan domain yang digunakan sudah terhubung dengan IP VPS



---

🛠️ Kontribusi

Pull request terbuka untuk:

Penambahan fitur baru

Perbaikan bug

Optimasi kode dan dokumentasi



---

📜 Lisensi

Skrip ini open-source dan bebas digunakan dengan mencantumkan kredit kepada pembuat.


---

> "Otomatisasi itu kekuatan. Satu skrip, semua beres!" 💡



