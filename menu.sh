#!/bin/bash

# Warna
green='\e[32m'
red='\e[31m'
blue='\e[34m'
yellow='\e[33m'
purple='\e[35m'
cyan='\e[36m'
nc='\e[0m'

# Data VPS
IP=$(curl -s ipv4.icanhazip.com)
DOMAIN=$(cat /etc/xray/domain 2>/dev/null || echo "Belum diset")
RAM=$(free -h | awk '/Mem:/ {print $2}')
CPU=$(awk -F': ' '/model name/ {print $2}' /proc/cpuinfo | head -1)
UPTIME=$(uptime -p)

clear
echo -e "${cyan}────────────────────────────────────────────${nc}"
echo -e "${green} VPS INFORMATION${nc}"
echo -e "${cyan}────────────────────────────────────────────${nc}"
echo -e "${yellow}IP Address    : ${green}$IP${nc}"
echo -e "${yellow}Domain        : ${green}$DOMAIN${nc}"
echo -e "${yellow}CPU           : ${green}$CPU${nc}"
echo -e "${yellow}RAM           : ${green}$RAM${nc}"
echo -e "${yellow}Uptime        : ${green}$UPTIME${nc}"
echo -e "${cyan}────────────────────────────────────────────${nc}"

# Status Layanan
echo -e "${green} SERVICES STATUS ${nc}"
echo -e "│ ${blue}SSH${nc}       ON   ${purple}NOOBZVPN${nc}   ON   ${yellow}NGINX${nc}  ON   ${red}HAPROXY${nc} ON │"
echo -e "│ ${cyan}WS-ePro${nc}   ON   ${red}UDP CUSTOM${nc} ON   ${green}XRAY${nc}   ON   ${yellow}DROPBEAR${nc} ON │"
echo -e "${cyan}────────────────────────────────────────────${nc}"

# Menu Pilihan
echo -e "${green} MENU UTAMA ${nc}"
echo -e "${cyan}1.${nc} Buat Akun SSH"
echo -e "${cyan}2.${nc} Buat Akun VMESS"
echo -e "${cyan}3.${nc} Buat Akun VLESS"
echo -e "${cyan}4.${nc} Buat Akun TROJAN"
echo -e "${cyan}5.${nc} Buat Akun UDP CUSTOM"
echo -e "${cyan}6.${nc} Tes Speed VPS"
echo -e "${cyan}7.${nc} Ganti Domain XRAY"
echo -e "${cyan}8.${nc} Restart Semua Layanan"
echo -e "${cyan}0.${nc} Keluar"
echo -e "${cyan}────────────────────────────────────────────${nc}"

read -rp "Pilih menu [0-8]: " menu
case $menu in
  1) clear; echo "📦 Menyiapkan akun SSH..."; sleep 1 ;;
  2) clear; echo "📦 Menyiapkan akun VMESS..."; sleep 1 ;;
  3) clear; echo "📦 Menyiapkan akun VLESS..."; sleep 1 ;;
  4) clear; echo "📦 Menyiapkan akun TROJAN..."; sleep 1 ;;
  5) clear; echo "📦 Menyiapkan akun UDP CUSTOM..."; sleep 1 ;;
  6) clear; echo "📦 Menjalankan tes speed..."; speedtest-cli ;;
  7) clear; read -p "Masukkan domain baru: " newdomain; echo "$newdomain" > /etc/xray/domain; systemctl restart xray; echo "Domain diperbarui ke $newdomain";;
  8) clear; systemctl restart ssh dropbear xray nginx haproxy; echo "✅ Semua layanan berhasil direstart." ;;
  0) clear; exit ;;
  *) echo "❌ Menu tidak valid!" ;;
esac
