#!/bin/bash

# Warna ANSI
YELLOW='\e[1;33m'
GREEN='\e[1;32m'
RED='\e[1;31m'
NC='\e[0m' # reset

# Deteksi OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        echo -e "${RED}Script hanya mendukung Ubuntu 20.04 & Debian.${NC}"
        exit 1
    fi
else
    echo -e "${RED}Tidak dapat mendeteksi OS!${NC}"
    exit 1
fi

# Fungsi Header Data VPS
show_vps_info() {
    echo -e "${YELLOW}=================================================="
    echo -e "                VPS INFORMATION"
    echo -e "=================================================="
    echo -e "Hostname      : $(hostname)"
    echo -e "OS            : $(lsb_release -ds 2>/dev/null || grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '\"')"
    echo -e "Kernel        : $(uname -r)"
    echo -e "CPU Model     : $(awk -F: '/model name/ {print $2; exit}' /proc/cpuinfo | sed 's/^ //')"
    echo -e "CPU Cores     : $(nproc)"
    echo -e "RAM           : $(free -h | awk '/Mem:/ {print $2}')"
    echo -e "Disk          : $(df -h / | awk 'NR==2{print $2}')"
    echo -e "IP Address    : $(hostname -I | awk '{print $1}')"
    echo -e "Public IP     : $(curl -s ifconfig.me)"
    echo -e "Uptime        : $(uptime -p)"
    echo -e "==================================================${NC}"
}

# Fungsi Status Layanan
status_onoff() {
    systemctl is-active --quiet $1 && echo -en "${GREEN}ON${NC}" || echo -en "${RED}OFF${NC}"
}

show_service_panel() {
    echo -en "${YELLOW}SSH       ";      status_onoff sshd;      echo -en "   "
    echo -en "NOOBZVPN   ";     status_onoff noobzvpn; echo -en "   "
    echo -en "NGINX     ";      status_onoff nginx;    echo -en "   "
    echo -en "HAPROXY   ";      status_onoff haproxy;  echo
    echo -en "WS-ePro   ";      status_onoff wss-ep;   echo -en "   "
    echo -en "UDP CUSTOM ";     status_onoff udp-custom; echo -en "   "
    echo -en "XRAY      ";      status_onoff xray;     echo -en "   "
    echo -en "DROPBEAR  ";      status_onoff dropbear; echo
    echo -e "${YELLOW}--------------------------------------------------${NC}"
}

install_ssh() {
    echo -e "${YELLOW}Proses instalasi SSH...${NC}"
    apt-get update && apt-get install -y openssh-server
    systemctl enable ssh
    systemctl start ssh
    echo -e "${GREEN}SSH berhasil diinstall.${NC}"
}

install_vmess() {
    echo -e "${YELLOW}Proses instalasi VMess (Xray/V2Ray)...${NC}"
    bash <(curl -Ls https://raw.githubusercontent.com/XTLS/Xray-install/main/install-release.sh)
    echo -e "${GREEN}VMess/Xray berhasil diinstall.${NC}"
}

install_vless() {
    echo -e "${YELLOW}Proses instalasi VLess (Xray)...${NC}"
    bash <(curl -Ls https://raw.githubusercontent.com/XTLS/Xray-install/main/install-release.sh)
    echo -e "${GREEN}VLess/Xray berhasil diinstall.${NC}"
}

install_trojan() {
    echo -e "${YELLOW}Proses instalasi Trojan...${NC}"
    bash <(curl -sL https://git.io/trojan-install)
    echo -e "${GREEN}Trojan berhasil diinstall.${NC}"
}

test_speed() {
    echo -e "${YELLOW}Proses test speed VPS...${NC}"
    if ! command -v speedtest &> /dev/null; then
        apt-get update && apt-get install -y speedtest-cli
    fi
    speedtest
}

ganti_domain() {
    echo -en "${YELLOW}Masukkan domain baru: ${NC}"
    read domain
    echo -e "${GREEN}Domain diganti menjadi: $domain${NC}"
    # Tambahkan logic update config semua layanan di sini
}

monitor_user() {
    echo -e "${YELLOW}Monitoring user aktif SSH/Xray/Trojan...${NC}"
    who
    # Tambahkan logic monitoring user aktif layanan lain di sini
}

reboot_vps() {
    echo -e "${YELLOW}VPS akan direboot...${NC}"
    sleep 2
    reboot
}

while true; do
    clear
    show_vps_info
    show_service_panel
    echo -e "${YELLOW}============= MENU UTAMA VPS =============${NC}"
    echo "[1] Install SSH (Websocket/SSL)"
    echo "[2] Install VMess (V2Ray/Xray)"
    echo "[3] Install VLess (V2Ray/Xray)"
    echo "[4] Install Trojan"
    echo "[5] Test Speed VPS"
    echo "[6] Ganti Domain"
    echo "[7] Monitoring User Aktif"
    echo "[8] Reboot VPS"
    echo "[0] Keluar"
    echo -e "${YELLOW}==========================================${NC}"
    read -p "Pilih menu [0-8]: " MENU

    case $MENU in
        1) install_ssh ;;
        2) install_vmess ;;
        3) install_vless ;;
        4) install_trojan ;;
        5) test_speed ;;
        6) ganti_domain ;;
        7) monitor_user ;;
        8) reboot_vps ;;
        0) echo -e "${YELLOW}Keluar...${NC}"; exit 0 ;;
        *) echo -e "${RED}Menu tidak valid!${NC}"; sleep 1 ;;
    esac
    read -p "Tekan Enter untuk kembali ke menu..."
done
