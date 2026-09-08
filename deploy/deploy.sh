#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${1:-$(pwd)/Back-end}"

cd "$APP_DIR"

if [[ ! -f .env ]]; then
    echo "Back-end/.env tapılmadı. deploy/production.env.example əsasında yaradın."
    exit 1
fi

if ! grep -q '^APP_ENV=production$' .env; then
    echo "APP_ENV production deyil; deployment dayandırıldı."
    exit 1
fi

composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan down --retry=60

restore_application() {
    php artisan up || true
}
trap restore_application EXIT

php artisan migrate --force
php artisan optimize

php artisan up
trap - EXIT

echo "Flowlist deployment tamamlandı."
