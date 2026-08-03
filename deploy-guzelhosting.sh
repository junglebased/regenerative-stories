#!/usr/bin/env bash
# Guzelhosting'e FTP deploy.
#
#   ./deploy-guzelhosting.sh                      # varsayılan: 02/index.html + 02/index_tr.html
#   ./deploy-guzelhosting.sh 02/index.html        # sadece belirtilen dosyalar
#   ./deploy-guzelhosting.sh -n                   # dry run: bağlanmaz, ne atacağını yazar
#
# Kimlik bilgileri repo kökündeki .env dosyasından okunur (.gitignore'da).
# Ortam değişkeni olarak verilirse .env'i ezer.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    -n|--dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,9p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    --) shift; break ;;
    -*) echo "Bilinmeyen seçenek: $1" >&2; exit 1 ;;
    *) break ;;
  esac
done

# .env: mevcut ortam değişkenlerini ezmesin diye sadece boş olanları doldurur.
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/.env}"
if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    key=${line%%=*}; val=${line#*=}
    [ "$key" = "$line" ] && continue
    key=$(printf '%s' "$key" | tr -d '[:space:]')
    val=${val#\"}; val=${val%\"}; val=${val#\'}; val=${val%\'}
    [ -n "${!key:-}" ] || printf -v "$key" '%s' "$val"
  done < "$ENV_FILE"
fi

: "${FTP_HOST:?FTP_HOST tanımlı değil (.env dosyasına yaz veya ortam değişkeni ver)}"
: "${FTP_USER:?FTP_USER tanımlı değil (.env dosyasına yaz veya ortam değişkeni ver)}"
: "${FTP_PASS:?FTP_PASS tanımlı değil (.env dosyasına yaz veya ortam değişkeni ver)}"
FTP_PORT="${FTP_PORT:-21}"
REMOTE_DIR="${REMOTE_DIR:-/}"

# Dosya listesi: argümanlar > LOCAL_FILE (eski kullanım) > varsayılan ikili
if [ $# -gt 0 ]; then
  FILES=("$@")
elif [ -n "${LOCAL_FILE:-}" ]; then
  FILES=("$LOCAL_FILE")
else
  FILES=("$SCRIPT_DIR/02/index.html" "$SCRIPT_DIR/02/index_tr.html")
fi

# Bağlanmadan önce hepsini doğrula: yarısı atılmış bir site kalmasın.
MISSING=0
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then echo "Dosya yok: $f" >&2; MISSING=1; fi
done
[ "$MISSING" -eq 0 ] || exit 1

echo "Hedef : $FTP_HOST:$FTP_PORT$REMOTE_DIR"
echo "Dosya : ${#FILES[@]} adet"
for f in "${FILES[@]}"; do echo "  - $f"; done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry run — bağlantı kurulmadı)"
  exit 0
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp bulunamadı. Kurmak için: brew install lftp   (Linux: apt install lftp)" >&2
  exit 1
fi

# lftp'nin kendi tırnak kuralı: çift tırnak içinde \ ve " kaçırılır.
lq() { printf '"%s"' "$(printf '%s' "$1" | sed 's/[\\"]/\\&/g')"; }

# Tek oturumda hepsi: her dosya için yeniden bağlanmak hem yavaş hem de
# guzelhosting'in eşzamanlı bağlantı limitine takılıyor.
# Şifre argv'de değil komut akışında — argv'yi makinedeki herkes `ps` ile görür.
if ! {
  echo 'set ssl:verify-certificate no'
  echo 'set dns:order "inet inet6"'
  echo 'set ftp:passive-mode true'
  echo 'set net:max-retries 3'
  echo 'set net:timeout 20'
  echo 'set cmd:fail-exit true'          # bir put patlarsa lftp sıfırdan farklı kodla çıksın
  printf 'open -u %s,%s -p %s %s\n' "$(lq "$FTP_USER")" "$(lq "$FTP_PASS")" "$FTP_PORT" "$(lq "$FTP_HOST")"
  printf 'cd %s\n' "$(lq "$REMOTE_DIR")"
  for f in "${FILES[@]}"; do
    printf 'put %s -o %s\n' "$(lq "$f")" "$(lq "$(basename "$f")")"
  done
  echo 'bye'
} | lftp; then
  echo "Deploy başarısız — hiçbir dosyanın tam yüklendiği garanti değil." >&2
  echo "Kontrol: .env'deki bilgiler, REMOTE_DIR ($REMOTE_DIR) sunucuda var mı, FTP hesabı aktif mi." >&2
  exit 1
fi

echo "Tamamlandı: ${#FILES[@]} dosya yüklendi."
