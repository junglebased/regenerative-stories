#!/usr/bin/env bash
set -euo pipefail
: "${FTP_HOST:?FTP_HOST tanımlı değil}"
: "${FTP_USER:?FTP_USER tanımlı değil}"
: "${FTP_PASS:?FTP_PASS tanımlı değil}"
FTP_PORT="${FTP_PORT:-21}"
REMOTE_DIR="${REMOTE_DIR:-/}"
LOCAL_FILE="${LOCAL_FILE:-./index.html}"
if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp bulunamadı. Kurmak için: brew install lftp"
  exit 1
fi
echo "Deploy ediliyor: $LOCAL_FILE -> $FTP_HOST:$REMOTE_DIR"
lftp -u "$FTP_USER","$FTP_PASS" -p "$FTP_PORT" "$FTP_HOST" <<EOF
set ssl:verify-certificate no
set dns:order "inet inet6"
cd $REMOTE_DIR
put $LOCAL_FILE
bye
EOF
echo "Tamamlandı."
