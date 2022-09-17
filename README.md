# Level-Up

## Prod stage
Scan a Bar Code in a Schindler elevator or visit https://level-up.app / https://www.level-up.app

## What is level up

We want to add QR code stickers in all Schindler lift worldwide. Customer can scan these and be remotely
connected to another lift user in the world for the duration of a game, or just to say Hi for 4 seconds.

Winning a game, or traveling (vertical miles) entitled you to a Ethereum LevelUp token, that can be later exchange
in Schindler partner network (coupon, loyalty point in local shop around the elevator).

# Technologies
* Javascript
* Nodejs
* HTML + CSS
* WebRTC is a free and open-source project providing web browsers and mobile applications with real-time communication via application programming interfaces.
* Amazon AWS EC2 hosting
* TensorFlow is a free and open-source software library for machine learning and artificial intelligence.
* TensorFlow based finger pose classifier for hand landmarks
* QR code reader

# Features
* Unlimited support of elevators, one QR-Code per elevator
* Sleek mobile first web gui
* Real time video feed between elevator passengers using WebRTC
* Real time on device machine learning to detect hand position
* Rock scissor paper game with anybody scanning a QR code

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

# How to for developer
`git clone https://github.com/CM2P/schindler.git`
then
```
cd backend
npm install
node server.js
```
and
```
cd web
npm install
npm run start
```

## Dev stage
https://dev.level-up.app/

## Backend
https://backend.level-up.app/

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

# Schindler API
Visit https://hack.myport.guide/ui/paas/learn/specs/open-api and
import https://hack.myport.guide/specs/openAPI/PortGatewayAPI.yaml into Postman (https://www.postman.com)

# Client API
Call endpoint with query parameter "liftId" and the id of the lift http://localhost:3000/?liftId=123 to start a Web RTC session.

# Server API
http://localhost:3000/lift?liftId=A  return te whole Lift information

# Face api AI
https://justadudewhohacks.github.io/face-api.js/docs/index.html

# QR code generator
https://www.qrcode-monkey.com/

we generate as much qrcode as lift using Lift name values. Lift name should in reality a
GLOBAL LIFT IDENTIFIER that uniquely identify an elevator worldwide.
```
https://level-up.app/?liftId=A
https://level-up.app/?liftId=B
https://level-up.app/?liftId=C
https://level-up.app/?liftId=D
```
and Schindler color rgb(220,0,0) or in Hex #DC0000

# Casper Token Level-Up

WIP


