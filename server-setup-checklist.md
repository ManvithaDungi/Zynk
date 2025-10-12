# Server Setup Checklist for Zynk Project

## Pre-Deployment Security (CRITICAL)

### 1. Change Default Password
```bash
# Connect to server
ssh amrita@172.17.9.106

# Change password immediately
passwd
# Enter new secure password
```

### 2. Create SSH Key Authentication (Recommended)
```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id amrita@172.17.9.106

# Test key-based login
ssh amrita@172.17.9.106
```

### 3. Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

## Deployment Options

### Option A: Automated Deployment (Recommended)
```bash
# Upload and run the deployment script
scp deploy.sh amrita@172.17.9.106:/home/amrita/
ssh amrita@172.17.9.106
chmod +x deploy.sh
./deploy.sh
```

### Option B: Quick Deployment
```bash
# Upload and run the quick deployment script
scp quick-deploy.sh amrita@172.17.9.106:/home/amrita/
ssh amrita@172.17.9.106
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Option C: Manual Deployment
Follow the detailed steps in `DEPLOYMENT_GUIDE.md`

## Post-Deployment Security

### 1. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d projects1.amritanet.edu

# Test auto-renewal
sudo certbot renew --dry-run
```

### 2. MongoDB Security
```bash
# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_admin_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use zynk
db.createUser({
  user: "zynk_user",
  pwd: "your_secure_app_password",
  roles: ["readWrite"]
})
```

### 3. Update Environment Variables
Update `/opt/zynk/backend/.env`:
```env
MONGO_URI=mongodb://zynk_user:your_secure_app_password@localhost:27017/zynk
```

### 4. Firewall Configuration
```bash
# Check current status
sudo ufw status

# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 5000  # Block direct access to backend
sudo ufw deny 3000  # Block direct access to frontend
```

## Monitoring and Maintenance

### 1. Set Up Log Rotation
```bash
# PM2 logs are already configured in the deployment script
# Check log rotation
sudo logrotate -d /etc/logrotate.d/zynk-pm2
```

### 2. Set Up Automated Backups
```bash
# The backup script is created during deployment
# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/zynk/backup.sh
```

### 3. Monitor System Resources
```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Check system status
htop
df -h
free -h
```

## Application Management

### 1. PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Monitor applications
pm2 monit

# Stop applications
pm2 stop all

# Start applications
pm2 start all
```

### 2. Service Management
```bash
# Check service status
sudo systemctl status mongod
sudo systemctl status nginx

# Restart services
sudo systemctl restart mongod
sudo systemctl restart nginx

# Check service logs
sudo journalctl -u mongod -f
sudo journalctl -u nginx -f
```

### 3. Application Updates
```bash
# Stop applications
pm2 stop all

# Update code (copy new files)
# Install new dependencies if needed
cd /opt/zynk/backend && npm install --production
cd /opt/zynk/frontend && npm install && npm run build

# Start applications
pm2 start all
```

## Health Checks

### 1. Application Health
```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend check
curl http://localhost:3000

# Through Nginx
curl http://projects1.amritanet.edu/api/health
curl http://projects1.amritanet.edu
```

### 2. Database Health
```bash
# Check MongoDB status
sudo systemctl status mongod

# Connect to MongoDB
mongosh
show dbs
use zynk
show collections
```

### 3. Network Health
```bash
# Check listening ports
sudo netstat -tulpn | grep -E ':(80|443|3000|5000)'

# Check Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

## Troubleshooting

### Common Issues and Solutions

1. **Application won't start:**
   ```bash
   pm2 logs
   sudo systemctl status mongod
   ```

2. **Database connection issues:**
   ```bash
   sudo systemctl restart mongod
   # Check MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Port conflicts:**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo kill -9 <PID>
   ```

5. **Permission issues:**
   ```bash
   sudo chown -R amrita:amrita /opt/zynk
   ```

## Security Checklist

- [ ] Changed default password for user 'amrita'
- [ ] Set up SSH key authentication
- [ ] Updated system packages
- [ ] Configured SSL certificate
- [ ] Enabled MongoDB authentication
- [ ] Updated JWT_SECRET
- [ ] Configured firewall rules
- [ ] Set up automated backups
- [ ] Enabled log rotation
- [ ] Reviewed file permissions
- [ ] Set up monitoring
- [ ] Tested all endpoints
- [ ] Documented access credentials

## Backup and Recovery

### 1. Manual Backup
```bash
# Run backup script
/opt/zynk/backup.sh

# Check backup directory
ls -la /opt/backups/zynk/
```

### 2. Restore from Backup
```bash
# Restore MongoDB
mongorestore /opt/backups/zynk/mongodb_YYYYMMDD_HHMMSS/

# Restore uploads
tar -xzf /opt/backups/zynk/uploads_YYYYMMDD_HHMMSS.tar.gz -C /opt/zynk/backend/
```

## Performance Optimization

### 1. MongoDB Optimization
```bash
# Check MongoDB performance
mongosh
db.stats()
db.zynk.stats()
```

### 2. Nginx Optimization
```bash
# Check Nginx configuration
sudo nginx -T

# Monitor Nginx performance
sudo tail -f /var/log/nginx/access.log
```

### 3. System Optimization
```bash
# Check system resources
htop
iotop
df -h
```

## Final Verification

After completing the deployment, verify:

1. **Application Access:**
   - Frontend: http://projects1.amritanet.edu
   - Backend API: http://projects1.amritanet.edu/api/health
   - SSL (if configured): https://projects1.amritanet.edu

2. **Functionality:**
   - User registration/login
   - Event creation
   - File uploads
   - Real-time chat (Socket.io)

3. **Security:**
   - SSL certificate validity
   - MongoDB authentication
   - Firewall rules
   - Password security

4. **Monitoring:**
   - Application logs
   - System resources
   - Backup status
   - SSL certificate expiry

---

**Important Notes:**
- Always test in a staging environment first
- Keep backups of configuration files
- Monitor logs regularly
- Update dependencies periodically
- Review security settings regularly
