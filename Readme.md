# Flowlist

Flowlist istifadəçilərin gündəlik task-larını idarə etməsi üçün hazırlanmış full-stack Todo tətbiqidir.

## İmkanlar

- Qeydiyyat və giriş
- Token əsaslı autentifikasiya
- Yeni task əlavə etmək
- Task-u redaktə etmək və silmək
- Task-u tamamlanmış/aktiv olaraq dəyişmək
- İstifadəçinin yalnız öz task-larını görməsi və idarə etməsi
- Mobilə uyğun istifadəçi interfeysi
- Admin dashboard interfeysi

## Texnologiyalar

- Front-end: HTML, CSS, JavaScript
- Back-end: Laravel 13, PHP
- Database: MySQL
- Authentication: Laravel Sanctum

## Layihə quruluşu

~~~text
Todo App/
├── Back-end/
│   ├── public/                # CSS və JavaScript assetləri
│   │   └── dashboard/         # Admin panel assetləri
│   ├── resources/views/       # İstifadəçi və admin Blade səhifələri
│   └── routes/                # Web və API route-ları
├── deploy/                    # Production konfiqurasiya nümunələri
├── PRODUCTION.md
└── Readme.md
~~~

## Quraşdırma

### 1. Back-end

Back-end qovluğunda .env faylını yaradın və MySQL bağlantısını yazın:

~~~env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flowlist
DB_USERNAME=root
DB_PASSWORD=
~~~

Sonra terminalda:

~~~powershell
cd Back-end
composer install
php artisan key:generate
php artisan migrate
php artisan serve
~~~

API standart olaraq bu ünvanda açılır:

~~~text
http://127.0.0.1:8000
~~~

### 2. Tətbiqi açmaq

Frontend və dashboard Laravel tərəfindən təqdim olunur. Əlavə Live Server lazım deyil:

~~~text
http://127.0.0.1:8000
http://127.0.0.1:8000/dashboard
~~~

Frontend API-yə eyni domen daxilində `/api` yolu ilə qoşulur.

## API endpoint-ləri

| Metod | Endpoint | Təsvir |
| --- | --- | --- |
| POST | /api/register | Yeni istifadəçi qeydiyyatı |
| POST | /api/login | İstifadəçi girişi |
| POST | /api/logout | İstifadəçi çıxışı |
| GET | /api/todos | Giriş edən istifadəçinin task-ları |
| POST | /api/todos | Yeni task yaratmaq |
| GET | /api/todos/{id} | Bir task-ı göstərmək |
| PUT/PATCH | /api/todos/{id} | Task-u yeniləmək |
| DELETE | /api/todos/{id} | Task-u silmək |

Todo endpoint-ləri Bearer token tələb edir.

## Təhlükəsizlik

- Şifrələr Laravel tərəfindən hash olunaraq saxlanılır.
- Todo endpoint-ləri auth:sanctum ilə qorunur.
- İstifadəçi yalnız öz task-larını görə, yeniləyə və silə bilər.

## İş axını

1. İstifadəçi qeydiyyatdan keçir və ya daxil olur.
2. Laravel giriş tokeni qaytarır.
3. Front-end tokeni saxlayır və Todo sorğularında göndərir.
4. Task məlumatları MySQL-də saxlanılır.
