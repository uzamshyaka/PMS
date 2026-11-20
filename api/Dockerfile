FROM php:8.4-cli

# gd (JPEG/PNG/WebP) re-encodes uploaded vehicle photos.
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libjpeg62-turbo-dev libwebp-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql zip gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --prefer-dist

COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8000

# Migrations are never run automatically; see README.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
