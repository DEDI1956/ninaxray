
#!/bin/bash

# ===================================
#         VPS & XRAY INSTALLER
# ===================================

# TAMPILKAN INFORMASI VPS
clear
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo -e "\e[1;33m          VPS INFORMATION          \e[0m"
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo -e "Hostname    : $(hostname)"
echo -e "IP Address  : $(curl -s ifconfig.me)"
echo -e "Uptime      : $(uptime -p)"
echo -e "RAM         : $(free -m | awk '/Mem:/ {print $2" MB"}')"
echo -e "Disk Usage  : $(df -h / | awk 'END{print $5}')"
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
sleep 2

# INPUT DOMAIN UNTUK XRAY
read -rp "Masukkan domain untuk XRAY: " domain

# TAMPILKAN MENU
clear
echo -e "\e[1;34m┌────────────────────────────────────────────┐\e[0m"
echo -e "\e[1;34m│ \e[1;32mSSH\e[0m     ON   \e[1;36mNOOBZVPN\e[0m   ON   \e[1;33mNGINX\e[0m ON   \e[1;35mHAPROXY\e[0m ON \e[1;34m│\e[0m"
echo -e "\e[1;34m│ \e[1;36mWS-ePro\e[0m ON   \e[1;35mUDP CUSTOM\e[0m ON \e[1;31mXRAY\e[0m  ON   \e[1;32mDROPBEAR\e[0m ON\e[0m"
echo -e "\e[1;34m└────────────────────────────────────────────┘\e[0m"
sleep 1

# INSTALLASI XRAY & LAINNYA (SIMULASI)
echo -e "\e[1;32m📦 MEMULAI INSTALASI XRAY & SERVICE LAINNYA...\e[0m"
sleep 3

# TAMPILKAN HASIL INSTALASI XRAY
uuid=$(cat /proc/sys/kernel/random/uuid)
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo -e "\e[1;32m📦 XRAY INSTALL COMPLETE!\e[0m"
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo -e "🔗 VLESS TLS     : vless://$uuid@$domain:443?encryption=none&security=tls&type=ws"
echo -e "🔗 VLESS NON-TLS : vless://$uuid@$domain:80?encryption=none&type=ws"
echo -e "🔗 VMESS TLS     : vmess://$(echo -n '{ "v": "2", "ps": "vmess", "add": "'$domain'", "port": "443", "id": "'$uuid'", "aid": "0", "net": "ws", "type": "none", "host": "'$domain'", "tls": "tls" }' | base64 -w0)"
echo -e "🔗 TROJAN        : trojan://$uuid@$domain:443?security=tls&type=ws"
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo -e "🔗 DROPBEAR PORT : 443, 222"
echo -e "🔗 SSH PORT      : 22"
echo -e "🔗 UDP CUSTOM    : 7300"
echo -e "\e[1;36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
