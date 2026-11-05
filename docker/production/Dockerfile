# Single container for the API: Nginx, PHP-FPM and the scheduler. Build from the repository root.
FROM php:8.4-fpm-alpine

RUN apk add --no-cache icu-dev libzip-dev nginx supervisor \
    && docker-php-ext-install bcmath intl opcache pcntl pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/ ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader \
    && rm /usr/bin/composer \
    && mkdir -p public/images/products \
    && chown -R www-data:www-data storage bootstrap/cache public/images

COPY docker/production/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/production/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/production/supervisord.conf /etc/supervisord.conf
COPY docker/production/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
