FROM php:8.2-fpm

# tools + libs (Debian-based)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libicu-dev libzip-dev libpng-dev libonig-dev libxml2-dev zlib1g-dev libssl-dev pkg-config libcurl4-openssl-dev \
    autoconf g++ make ca-certificates \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb \
 && docker-php-ext-install pdo_mysql zip intl bcmath opcache \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
