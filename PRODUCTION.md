# Flowlist production deployment

## Tələblər

- PHP 8.4.1 və ya daha yeni versiya
- Composer 2
- MySQL 8+
- Nginx və ya Apache
- HTTPS sertifikatı

Laravel Cloud-da application root olaraq `Back-end` seçilməlidir. Frontend və dashboard assetləri `Back-end/public` daxilindədir. Digər serverlərdə web server document root-u yalnız `Back-end/public` olmalıdır.

## Laravel Cloud

1. Repo-nu GitHub-a push edin.
2. Laravel Cloud-da yeni application yaradıb GitHub repository-ni seçin.
3. Application root sahəsinə `Back-end` yazın.
4. Environment-a MySQL database əlavə edin.
5. Cloud environment variables bölməsində ən azı bunları təyin edin:

```env
APP_NAME=Flowlist
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=Asia/Baku
APP_LOCALE=az
LOG_LEVEL=error
```

`APP_URL` üçün Laravel Cloud-un verdiyi URL-i və ya qoşduğunuz domeni istifadə edin. Database bağlantı dəyişənlərini Cloud database qoşularkən təqdim edilən dəyərlərlə saxlayın. Real `APP_KEY` dəyərini bir dəfə yaradın və sonradan dəyişməyin.

Deployment command olaraq bunu əlavə edin:

```bash
php artisan migrate --force
```

Health check yolu `/up`-dır. İlk deployment-dən sonra Cloud-un verdiyi URL-də `/`, `/dashboard` və `/up` yollarını yoxlayın.

## İlk quraşdırma

1. Repo-nu serverə klonlayın.
2. `deploy/production.env.example` faylını `Back-end/.env` kimi kopyalayın.
3. Domeni və database məlumatlarını `.env` daxilində dəyişin.
4. `Back-end` qovluğunda bu əmrləri icra edin:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan key:generate
php artisan migrate --force
php artisan optimize
```

`APP_KEY` yaradıldıqdan sonra dəyişdirilməməlidir.

## İcazələr

Web server istifadəçisinə yalnız Laravel-in yazılan qovluqlarına icazə verin:

```bash
sudo chown -R www-data:www-data Back-end/storage Back-end/bootstrap/cache
sudo chmod -R 775 Back-end/storage Back-end/bootstrap/cache
```

## Nginx və HTTPS

`deploy/nginx.conf.example` faylını server və domen yollarına uyğunlaşdırın. Konfiqurasiyanı aktiv etdikdən sonra Let's Encrypt və ya hosting paneli vasitəsilə HTTPS qoşun. `.env` daxilində `APP_URL=https://...` və `APP_DEBUG=false` saxlanmalıdır.

## Sonrakı yeniləmələr

Repo kökündən:

```bash
bash deploy/deploy.sh
```

Script asılılıqları production rejimində quraşdırır, maintenance rejimini aktivləşdirir, migration və Laravel cache optimizasiyasını icra edir.

## Admin hesabı

Qeydiyyatdan keçmiş etibarlı hesabı admin etmək üçün database-də:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Yoxlama

- `/up` HTTP 200 qaytarmalıdır.
- `/` qeydiyyat/giriş səhifəsini açmalıdır.
- Admin hesabı ilə `/dashboard` açılmalıdır.
- Server loglarında xəta olmamalıdır: `Back-end/storage/logs/laravel.log`.
