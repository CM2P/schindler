# Level-Up

https://level-up.app
https://www.level-up.app

# Schindler challenge

A passenger's journey goes beyond the elevator trip, there is much more than going up & down. It's about moving from A
to B in a seamless flow without any obstacles. Join us on our journey in elevating passenger experience to the next
level.

We want you to interact with a Schindler digital elevator simulator using our brand new API's to create an application
that can enrich the passenger experience. We are interested in any solution that can seamlessly guide the user or
facilitate the journey to its destination in any kind. You are free to consider a passenger's whole journey that starts
way before entering a building or just focus on giving an awesome experience during the elevator ride. The challenge is
to bring value by socializing, providing information, creating excitement or simply by entertaining via gamification. We
are eager to see how your creativity will elevate the passenger experience to the next level and will encourage people
to interact in different ways with our products!

Visit hack.schindler.com (to be published soon) for further details.

# Install developer
git clone https://github.com/CM2P/schindler.git
npm install
node server.js

# Runtime
get an AWS server with ubuntu 22.04 LTS

```
sudo su -
apt-get install nginx
apt-get install certbot
vi /etc/nginx/sites-enabled/levelup
```
and add
```
server {
    server_name level-up.app www.level-up.app;
    access_log off;
    error_log  /home/levelup.error error;
    listen 80 ssl;

    location / {
    proxy_pass http://127.0.0.1:3000;
    }
}

server {
    if ($host = level-up.app) {
    return 301 https://$host$request_uri;
    } # managed by Certbot
    server_name level-up.app www.level-up.app;
    return 404; # managed by Certbot
}
```

# get a valid certificate
```
sudo apt-get remove certbot
sudo snap install core; sudo snap refresh core
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```
FYi this will modify the nginx file like

```
server {
server_name level-up.app www.level-up.app;
access_log off;
error_log  /home/levelup.error error;

    location / {
    proxy_pass http://127.0.0.1:3000;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/level-up.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/level-up.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.level-up.app) {
    return 301 https://$host$request_uri;
    } # managed by Certbot
    if ($host = level-up.app) {
    return 301 https://$host$request_uri;
    } # managed by Certbot
    server_name level-up.app www.level-up.app;
    return 404; # managed by Certbot


}
server {
    if ($host = level-up.app) {
    return 301 https://$host$request_uri;
    } # managed by Certbot
    server_name level-up.app www.level-up.app;
    listen 80;
    return 404; # managed by Certbot
}
```

The Certbot packages on your system come with a cron job or systemd timer that will
renew your certificates automatically before they expire.


# Client
Call endpoint with query parameter "liftId" and the id of the lift http://localhost:3000/?liftId=123

# Face api AI
https://justadudewhohacks.github.io/face-api.js/docs/index.html

# QR code generator
https://www.qrcode-monkey.com/
