#!/bin/sh
set -e

sed -i "s/__PORT__/${PORT:-8080}/" /etc/nginx/http.d/default.conf

php artisan config:cache
php artisan route:cache
php artisan migrate --force

# The product artwork lives on the container disk, so the seed recreates it on every start
php artisan db:seed --force

chown -R www-data:www-data storage bootstrap/cache public/images

exec supervisord -c /etc/supervisord.conf
