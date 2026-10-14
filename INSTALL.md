# Установка MapNews на Ubuntu Server

## 1. Подключение к серверу

```bash
ssh root@YOUR_SERVER_IP
```

---

## 2. Обновление системы

```bash
apt update && apt upgrade -y
```

---

## 3. Установка Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # должно быть v20.x.x
```

---

## 4. Установка Git и Nginx

```bash
apt install -y git nginx
```

---

## 5. Клонирование репозитория

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/mapnews-master.git mapnews
cd mapnews
```

> Или загрузите файлы через `scp`/SFTP, если репозиторий приватный.

---

## 6. Настройка бэкенда

```bash
cd /var/www/mapnews/mapnews_server
npm install
```

Создайте файл окружения:

```bash
cp .env.example .env
nano .env
```

Заполните `.env`:

```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/news
JWT_SECRET=ваш_длинный_случайный_секрет

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx
SMTP_FROM=MapNews <your@gmail.com>
```

Сохранить: `Ctrl+O`, `Enter`, выйти: `Ctrl+X`

---

## 7. Запуск сервера через PM2

```bash
npm install -g pm2

# Запустить основной сервер
pm2 start server.js --name mapnews-server

# Запустить парсер (опционально)
pm2 start parser.js --name mapnews-parser

# Автозапуск после перезагрузки
pm2 save
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

Проверить статус:

```bash
pm2 status
pm2 logs mapnews-server
```

---

## 8. Настройка Nginx

```bash
nano /etc/nginx/sites-available/mapnews
```

Вставьте:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Фронтенд
    root /var/www/mapnews/mapnews_client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API на бэкенд
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /images/ {
        proxy_pass http://localhost:8080;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mapnews /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 9. Обновить URL API во фронтенде

Сейчас во всех клиентских файлах захардкожен `http://localhost:8080`. Если домен/IP другой — замените:

```bash
cd /var/www/mapnews/mapnews_client/src/api
sed -i 's|http://localhost:8080|https://YOUR_DOMAIN|g' auth.js news.js favorites.js weather.js
```

---

## 10. HTTPS через Let's Encrypt (если есть домен)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN
```

Сертификат обновляется автоматически.

---

## Итог

| Адрес | Что |
|---|---|
| `http://YOUR_DOMAIN/` | Фронтенд |
| `http://YOUR_DOMAIN/api/` | API бэкенда |
| Порт 8080 | Бэкенд (внутренний, через Nginx) |

```bash
pm2 status          # статус процессов
pm2 logs            # логи
systemctl status nginx   # статус nginx
```
