FROM php:8.4-fpm-alpine

RUN apk add --no-cache icu-dev libzip-dev \
    && docker-php-ext-install bcmath intl opcache pcntl pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
