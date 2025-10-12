# Zynk Project Deployment Guide

## Server Information
- **IP Address**: 172.17.9.106
- **Hostname**: projects1.amritanet.edu
- **Username**: amrita
- **Password**: amrita (⚠️ **CHANGE THIS DEFAULT PASSWORD**)
- **OS**: Ubuntu 24.04 LTS

## Prerequisites

### 1. Server Access
```bash
# Connect to the server
ssh amrita@172.17.9.106
# or
ssh amrita@projects1.amritanet.edu
```

### 2. Change Default Password (CRITICAL)
```bash
# Change the default password immediately
passwd
# Enter new password when prompted
```

### 3. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

## Quick Deployment

### Option 1: Automated Deployment (Recommended)
1. **Upload the deployment script to your server:**
   ```bash
   # From your local machine, copy the deploy.sh script
   scp deploy.sh amrita@172.17.9.106:/home/amrita/
   ```

2. **Make the script executable and run it:**
   ```bash
   ssh amrita@172.17.9.106
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Deployment
Follow the step-by-step manual installation below.

## Manual Deployment Steps

### 1. Install Node.js 20.x
```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install MongoDB
```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### 5. Create Project Structure
```bash
# Create project directory
sudo mkdir -p /opt/zynk
sudo chown amrita:amrita /opt/zynk

# Copy your project files
sudo cp -r /path/to/your/zynk/project/* /opt/zynk/
sudo chown -R amrita:amrita /opt/zynk
```

### 6. Install Dependencies
```bash
# Backend dependencies
cd /opt/zynk/backend
npm install --production

# Frontend dependencies and build
cd /opt/zynk/frontend
npm install
npm run build
```

### 7. Configure Environment Variables

**Backend (.env file at `/opt/zynk/backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/zynk
NODE_ENV=production
FRONTEND_URL=http://projects1.amritanet.edu
JWT_SECRET=0d8f87842f60d231e26f0def7656f764273e15ff94dfa717a08522523bb28ba81e5b93487847d4052ce4373845006fb8b77405311ea96af98e01a0747db86a97
```

**Frontend (.env file at `/opt/zynk/frontend/.env`):**
```env
REACT_APP_API_URL=http://projects1.amritanet.edu/api
```

### 8. Configure PM2
Create `/opt/zynk/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'zynk-backend',
      script: './backend/server.js',
      cwd: '/opt/zynk',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'zynk-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: '/opt/zynk/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### 9. Install Serve for Frontend
```bash
sudo npm install -g serve
```

### 10. Start Applications with PM2
```bash
cd /opt/zynk
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 11. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/zynk`:
```nginx
server {
    listen 80;
    server_name projects1.amritanet.edu;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/zynk /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 12. Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Post-Deployment Configuration

### 1. SSL Certificate (Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d projects1.amritanet.edu

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. MongoDB Security
```bash
# Enable MongoDB authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use zynk
db.createUser({
  user: "zynk_user",
  pwd: "your_app_password",
  roles: ["readWrite"]
})
```

Update your backend `.env` file:
```env
MONGO_URI=mongodb://zynk_user:your_app_password@localhost:27017/zynk
```

### 3. Set Up Automated Backups
Create `/opt/zynk/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/zynk"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db zynk --out $BACKUP_DIR/mongodb_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/zynk/backend/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make it executable and add to crontab:
```bash
chmod +x /opt/zynk/backup.sh
crontab -e
# Add: 0 2 * * * /opt/zynk/backup.sh
```

## Management Commands

### PM2 Commands
```bash
# View application status
pm2 status

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all

# Monitor applications
pm2 monit
```

### Service Management
```bash
# Check service status
sudo systemctl status mongod
sudo systemctl status nginx

# Restart services
sudo systemctl restart mongod
sudo systemctl restart nginx
```

### Log Files
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo kill -9 <PID>
   ```

2. **Permission issues:**
   ```bash
   sudo chown -R amrita:amrita /opt/zynk
   ```

3. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

4. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Health Checks
```bash
# Check if backend is responding
curl http://localhost:5000/api/health

# Check if frontend is responding
curl http://localhost:3000

# Check if Nginx is proxying correctly
curl http://projects1.amritanet.edu/api/health
```

## Security Checklist

- [ ] Changed default password for user 'amrita'
- [ ] Configured MongoDB authentication
- [ ] Set up SSL certificate
- [ ] Updated JWT_SECRET
- [ ] Configured firewall rules
- [ ] Set up automated backups
- [ ] Enabled log rotation
- [ ] Reviewed file permissions

## Monitoring

### Basic Monitoring Setup
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor memory usage
free -h
```

## Support

If you encounter any issues during deployment:

1. Check the logs: `pm2 logs`
2. Verify service status: `sudo systemctl status mongod nginx`
3. Test connectivity: `curl http://localhost:5000/api/health`
4. Review Nginx configuration: `sudo nginx -t`

## Application URLs

After successful deployment:
- **Frontend**: http://projects1.amritanet.edu
- **Backend API**: http://projects1.amritanet.edu/api
- **Health Check**: http://projects1.amritanet.edu/api/health

---

**Note**: Remember to change the default password and configure SSL certificate for production use!
