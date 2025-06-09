Hi#!/bin/bash

# ===== WARNA =====
YELLOW='\e[1;33m'
GREEN='\e[1;32m'
RED='\e[1;31m'
NC='\e[0m' # reset

# ===== PATH & VAR =====
CONFIG="/etc/xray/config.json"
DOMAIN_FILE="/etc/xray/domain"
PORT_FILE="/etc/xray/port"
LOG="/var/log/xray/access.log"

domain=$(cat $DOMAIN_FILE 2>/dev/null || echo "yourdomain.com")
port=$(cat $PORT_FILE 2>/dev/null || echo "443")

# ===== CEK jq =====
if ! command -v jq &>/dev/null; then
  echo -e "${RED}jq belum terinstall. Jalankan: apt install jq -y${NC}"
  exit 1
fi

# ===== HEADER VPS INFO =====
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

# ===== STATUS LAYANAN =====
status_onoff() {
    systemctl is-active --quiet $1 && echo -en "${GREEN}ON${NC}" || echo -en "${RED}OFF${NC}"
}

show_service_panel() {
    echo -en "${YELLOW}SSH       ";      status_onoff sshd;      echo -en "   "
    echo -en "XRAY     ";      status_onoff xray;     echo -en "   "
    echo -en "NGINX     ";      status_onoff nginx;    echo -en "   "
    echo -en "DROPBEAR  ";      status_onoff dropbear; echo
    echo -e "${YELLOW}--------------------------------------------------${NC}"
}

# ====== FUNGSI XRAY PANEL ======

gen_uuid() { cat /proc/sys/kernel/random/uuid; }
expdate() { date -d "+${1:-30} days" +"%Y-%m-%d"; }

add_user() {
  proto="$1"
  echo -e "${YELLOW}Tambah user $proto${NC}"
  read -p "Username: " user
  uuid=$(gen_uuid)
  exp=$(expdate)
  case $proto in
    vmess)
      jq --arg user "$user" --arg uuid "$uuid" --arg exp "$exp" \
        '(.inbounds[] | select(.protocol == "vmess") | .settings.clients) += [{"id":$uuid,"alterId":0,"email":$user,"exp":$exp}]' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      link="vmess://$(echo -n "{\"v\":\"2\",\"ps\":\"$user\",\"add\":\"$domain\",\"port\":\"$port\",\"id\":\"$uuid\",\"aid\":\"0\",\"net\":\"ws\",\"type\":\"none\",\"host\":\"$domain\",\"path\":\"/xray\",\"tls\":\"tls\"}" | base64 -w 0)"
      echo -e "\n${GREEN}Link VMess:\n$link${NC}"
      ;;
    vless)
      jq --arg user "$user" --arg uuid "$uuid" --arg exp "$exp" \
        '(.inbounds[] | select(.protocol == "vless") | .settings.clients) += [{"id":$uuid,"email":$user,"exp":$exp}]' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      link="vless://$uuid@$domain:$port?encryption=none&security=tls&type=ws&host=$domain&path=%2Fxray#$user"
      echo -e "\n${GREEN}Link VLess:\n$link${NC}"
      ;;
    trojan)
      jq --arg user "$user" --arg uuid "$uuid" --arg exp "$exp" \
        '(.inbounds[] | select(.protocol == "trojan") | .settings.clients) += [{"password":$uuid,"email":$user,"exp":$exp}]' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      link="trojan://$uuid@$domain:$port?type=ws&sni=$domain&host=$domain&path=%2Fxray#$user"
      echo -e "\n${GREEN}Link Trojan:\n$link${NC}"
      ;;
  esac
  systemctl restart xray
  echo -e "${GREEN}User $user ($proto) berhasil ditambah (exp: $exp).${NC}"
}

del_user() {
  proto="$1"
  echo -e "${YELLOW}Hapus user $proto${NC}"
  read -p "Username: " user
  case $proto in
    vmess)
      jq --arg user "$user" '(.inbounds[] | select(.protocol == "vmess") | .settings.clients) |= map(select(.email != $user))' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      ;;
    vless)
      jq --arg user "$user" '(.inbounds[] | select(.protocol == "vless") | .settings.clients) |= map(select(.email != $user))' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      ;;
    trojan)
      jq --arg user "$user" '(.inbounds[] | select(.protocol == "trojan") | .settings.clients) |= map(select(.email != $user))' \
        $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
      ;;
  esac
  systemctl restart xray
  echo -e "${GREEN}User $user ($proto) dihapus.${NC}"
}

list_user() {
  proto="$1"
  echo -e "${YELLOW}Daftar user $proto:${NC}"
  case $proto in
    vmess)
      jq -r '.inbounds[] | select(.protocol=="vmess") | .settings.clients[] | "\(.email)\tUUID: \(.id)\tExp: \(.exp)"' $CONFIG
      ;;
    vless)
      jq -r '.inbounds[] | select(.protocol=="vless") | .settings.clients[] | "\(.email)\tUUID: \(.id)\tExp: \(.exp)"' $CONFIG
      ;;
    trojan)
      jq -r '.inbounds[] | select(.protocol=="trojan") | .settings.clients[] | "\(.email)\tPass: \(.password)\tExp: \(.exp)"' $CONFIG
      ;;
  esac
}

monitor_user() {
  echo -e "${YELLOW}Monitoring user aktif (XRAY, dari log):${NC}"
  if [[ ! -f $LOG ]]; then echo "Log tidak ditemukan."; return; fi
  grep -oP 'email: \K\S+' $LOG | sort | uniq -c | sort -nr
}

ganti_domain() {
  echo -en "${YELLOW}Masukkan domain baru: ${NC}"
  read newdomain
  echo "$newdomain" > $DOMAIN_FILE
  domain=$newdomain
  # Update add/host/sni di config.json
  jq --arg d "$domain" '
    (.inbounds[] | select(.protocol=="vmess")).streamSettings.wsSettings.headers.Host = $d |
    (.inbounds[] | select(.protocol=="vless")).streamSettings.wsSettings.headers.Host = $d |
    (.inbounds[] | select(.protocol=="trojan")).streamSettings.wsSettings.headers.Host = $d
  ' $CONFIG > /tmp/config.json && mv /tmp/config.json $CONFIG
  systemctl restart xray
  echo -e "${GREEN}Domain diganti menjadi: $domain dan config diupdate.${NC}"
}

test_speed() {
  echo -e "${YELLOW}Speedtest VPS:${NC}"
  if ! command -v speedtest &> /dev/null; then apt install -y speedtest-cli; fi
  speedtest
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
    echo -e "${YELLOW}============= MENU UTAMA XRAY VPS =============${NC}"
    echo "[1]  Tambah user VMess"
    echo "[2]  Hapus user VMess"
    echo "[3]  List user VMess"
    echo "[4]  Tambah user VLess"
    echo "[5]  Hapus user VLess"
    echo "[6]  List user VLess"
    echo "[7]  Tambah user Trojan"
    echo "[8]  Hapus user Trojan"
    echo "[9]  List user Trojan"
    echo "[10] Monitoring user aktif"
    echo "[11] Ganti domain"
    echo "[12] Test speed VPS"
    echo "[13] Reboot VPS"
    echo "[0]  Keluar"
    echo -e "${YELLOW}==============================================${NC}"
    read -p "Pilih menu [0-13]: " menu
    case $menu in
        1) add_user vmess ;;
        2) del_user vmess ;;
        3) list_user vmess ;;
        4) add_user vless ;;
        5) del_user vless ;;
        6) list_user vless ;;
        7) add_user trojan ;;
        8) del_user trojan ;;
        9) list_user trojan ;;
        10) monitor_user ;;
        11) ganti_domain ;;
        12) test_speed ;;
        13) reboot_vps ;;
        0) echo -e "${YELLOW}Keluar...${NC}"; exit 0 ;;
        *) echo -e "${RED}Menu tidak valid!${NC}"; sleep 1 ;;
    esac
    read -p "Tekan Enter untuk kembali ke menu..."
done
