# Deployment Guide

## Prerequisites

1. **Telegram Bot Token**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Get the bot token
   - Set bot commands and description

2. **Domain and SSL Certificate**
   - Domain name for your application
   - SSL certificate (Let's Encrypt recommended)

3. **Server Requirements**
   - Docker and Docker Compose
   - At least 2GB RAM
   - 20GB storage

## Environment Setup

1. **Clone the repository:**
```bash
git clone https://github.com/fusserg007/TinderMiniApp-TG.git
cd TinderMiniApp-TG
```

2. **Create environment file:**
```bash
cp env.example .env
```

3. **Configure environment variables:**
```bash
# Telegram Bot Configuration
TG_BOT_TOKEN=your_bot_token_here
TG_BOT_WEBHOOK_URL=https://yourdomain.com/api/webhook/telegram

# Security
SESSION_SECRET=your_random_session_secret_here

# Database (optional, defaults work for Docker)
MONGODB_URI=mongodb://mongodb:27017/tinder_miniapp

# Object Storage (optional, defaults work for Docker)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=tinder-photos
```

## Development Deployment

1. **Start development environment:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Install dependencies:**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Start development servers:**
```bash
# Backend
npm run dev

# Frontend (in another terminal)
cd frontend && npm run dev
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - MinIO Console: http://localhost:9001

## Production Deployment

1. **Build and start production environment:**
```bash
docker-compose up -d --build
```

2. **Configure Nginx (if using custom SSL):**
   - Place SSL certificates in `reverse-proxy/ssl/`
   - Update `reverse-proxy/nginx.conf` with your domain
   - Uncomment HTTPS server block

3. **Set up Telegram Bot Webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/api/webhook/telegram"}'
```

4. **Configure Bot Menu Button:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
     -H "Content-Type: application/json" \
     -d '{
       "menu_button": {
         "type": "web_app",
         "text": "Open TinderMiniApp",
         "web_app": {
           "url": "https://yourdomain.com"
         }
       }
     }'
```

## Monitoring and Maintenance

1. **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

2. **Database backup:**
```bash
# Create backup
docker exec mongodb mongodump --db tinder_miniapp --out /backup

# Restore backup
docker exec mongodb mongorestore --db tinder_miniapp /backup/tinder_miniapp
```

3. **Update application:**
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Security Considerations

1. **Change default passwords:**
   - MongoDB (if exposed)
   - MinIO admin credentials
   - Session secret

2. **Enable firewall:**
   - Only expose ports 80 and 443
   - Block direct access to database ports

3. **Regular updates:**
   - Keep Docker images updated
   - Monitor security advisories
   - Update dependencies regularly

4. **SSL/TLS:**
   - Use strong SSL certificates
   - Enable HSTS headers
   - Configure proper cipher suites

## Troubleshooting

### Common Issues

1. **Bot webhook not working:**
   - Check bot token
   - Verify webhook URL is accessible
   - Check SSL certificate validity

2. **Database connection errors:**
   - Verify MongoDB is running
   - Check connection string
   - Ensure network connectivity

3. **File upload issues:**
   - Check MinIO service status
   - Verify bucket exists
   - Check access credentials

4. **Frontend not loading:**
   - Check if build completed successfully
   - Verify Nginx configuration
   - Check browser console for errors

### Performance Optimization

1. **Database indexing:**
   - Ensure proper indexes on frequently queried fields
   - Monitor query performance

2. **Image optimization:**
   - Compress uploaded images
   - Use appropriate image formats
   - Implement CDN if needed

3. **Caching:**
   - Enable Nginx caching for static assets
   - Implement Redis for session storage (optional)

4. **Rate limiting:**
   - Configure appropriate rate limits
   - Monitor API usage patterns
