#!/bin/bash

# Zynk Project Deployment Script for Ubuntu 24.04 LTS
# Server: projects1.amritanet.edu (172.17.9.106)
# Username: amrita

set -e  # Exit on any error

echo "🚀 Starting Zynk Project Deployment on Ubuntu 24.04 LTS"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="zynk"
PROJECT_DIR="/opt/zynk"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_SITES_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
SERVICE_USER="zynk"
DOMAIN="projects1.amritanet.edu"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 20.x (LTS)
print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js installed: $NODE_VERSION"
print_success "npm installed: $NPM_VERSION"

# Install PM2 globally for process management
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install MongoDB
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
print_status "Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create project user
print_status "Creating project user: $SERVICE_USER"
sudo useradd -r -s /bin/false -d $PROJECT_DIR $SERVICE_USER || print_warning "User $SERVICE_USER already exists"

# Create project directory
print_status "Creating project directory: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $SERVICE_USER:$SERVICE_USER $PROJECT_DIR

# Copy project files (assuming we're running from the project directory)
print_status "Copying project files..."
sudo cp -r . $PROJECT_DIR/
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_DIR

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $BACKEND_DIR
sudo -u $SERVICE_USER npm install --production

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd $FRONTEND_DIR
sudo -u $SERVICE_USER npm install
sudo -u $SERVICE_USER npm run build

# Create environment files
print_status "Creating environment configuration files..."

# Backend .env file
sudo -u $SERVICE_USER tee $BACKEND_DIR/.env > /dev/null <<EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/zynk
NODE_ENV=production
FRONTEND_URL=http://$DOMAIN
JWT_SECRET=0d8f87842f60d231e26f0def7656f764273e15ff94dfa717a08522523bb28ba81e5b93487847d4052ce4373845006fb8b77405311ea96af98e01a0747db86a97
EOF

# Frontend .env file
sudo -u $SERVICE_USER tee $FRONTEND_DIR/.env > /dev/null <<EOF
REACT_APP_API_URL=http://$DOMAIN/api
EOF

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
sudo -u $SERVICE_USER tee $PROJECT_DIR/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [
    {
      name: 'zynk-backend',
      script: './backend/server.js',
      cwd: '$PROJECT_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/zynk-backend-error.log',
      out_file: '/var/log/pm2/zynk-backend-out.log',
      log_file: '/var/log/pm2/zynk-backend.log',
      time: true
    },
    {
      name: 'zynk-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: '$FRONTEND_DIR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/zynk-frontend-error.log',
      out_file: '/var/log/pm2/zynk-frontend-out.log',
      log_file: '/var/log/pm2/zynk-frontend.log',
      time: true
    }
  ]
};
EOF

# Install serve for frontend
print_status "Installing serve for frontend..."
sudo -u $SERVICE_USER npm install -g serve

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $SERVICE_USER:$SERVICE_USER /var/log/pm2

# Start applications with PM2
print_status "Starting applications with PM2..."
cd $PROJECT_DIR
sudo -u $SERVICE_USER pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u $SERVICE_USER pm2 save

# Create PM2 startup script
sudo -u $SERVICE_USER pm2 startup systemd -u $SERVICE_USER --hp $PROJECT_DIR
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SERVICE_USER --hp $PROJECT_DIR

# Configure Nginx
print_status "Configuring Nginx reverse proxy..."

# Remove default Nginx site
sudo rm -f $NGINX_ENABLED_DIR/default

# Create Nginx configuration for Zynk
sudo tee $NGINX_SITES_DIR/zynk > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable the site
sudo ln -sf $NGINX_SITES_DIR/zynk $NGINX_ENABLED_DIR/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
print_status "Reloading Nginx..."
sudo systemctl reload nginx

# Configure firewall
print_status "Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create systemd service for PM2 (alternative to PM2 startup)
print_status "Creating systemd service for PM2..."
sudo tee /etc/systemd/system/zynk-pm2.service > /dev/null <<EOF
[Unit]
Description=PM2 process manager for Zynk
After=network.target

[Service]
Type=forking
User=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable zynk-pm2.service
sudo systemctl start zynk-pm2.service

# Create backup script
print_status "Creating backup script..."
sudo -u $SERVICE_USER tee $PROJECT_DIR/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/zynk"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup MongoDB
mongodump --db zynk --out \$BACKUP_DIR/mongodb_\$DATE

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz $PROJECT_DIR/backend/uploads

# Keep only last 7 days of backups
find \$BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x $PROJECT_DIR/backup.sh

# Create log rotation for PM2 logs
print_status "Configuring log rotation..."
sudo tee /etc/logrotate.d/zynk-pm2 > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF

# Final status check
print_status "Performing final status checks..."

# Check MongoDB
if sudo systemctl is-active --quiet mongod; then
    print_success "MongoDB is running"
else
    print_error "MongoDB is not running"
fi

# Check Nginx
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check PM2 processes
print_status "PM2 process status:"
sudo -u $SERVICE_USER pm2 status

# Check if applications are responding
print_status "Testing application endpoints..."
sleep 5

if curl -f -s http://localhost:5000/api/health > /dev/null; then
    print_success "Backend API is responding"
else
    print_warning "Backend API is not responding yet (may need a moment to start)"
fi

if curl -f -s http://localhost:3000 > /dev/null; then
    print_success "Frontend is responding"
else
    print_warning "Frontend is not responding yet (may need a moment to start)"
fi

print_success "Deployment completed!"
echo ""
echo "=================================================="
echo "🎉 Zynk Project Successfully Deployed!"
echo "=================================================="
echo ""
echo "📋 Deployment Summary:"
echo "  • Server: $DOMAIN (172.17.9.106)"
echo "  • Project Directory: $PROJECT_DIR"
echo "  • Backend: http://$DOMAIN/api"
echo "  • Frontend: http://$DOMAIN"
echo "  • MongoDB: Running locally"
echo "  • Process Manager: PM2"
echo "  • Web Server: Nginx"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs: sudo -u $SERVICE_USER pm2 logs"
echo "  • Restart apps: sudo -u $SERVICE_USER pm2 restart all"
echo "  • Check status: sudo -u $SERVICE_USER pm2 status"
echo "  • Backup data: sudo -u $SERVICE_USER $PROJECT_DIR/backup.sh"
echo ""
echo "🔒 Security Recommendations:"
echo "  1. Change the default password for user 'amrita'"
echo "  2. Set up SSL certificate (Let's Encrypt recommended)"
echo "  3. Configure MongoDB authentication"
echo "  4. Review and update JWT_SECRET"
echo "  5. Set up regular automated backups"
echo ""
echo "📚 Next Steps:"
echo "  1. Test the application at http://$DOMAIN"
echo "  2. Configure SSL certificate for HTTPS"
echo "  3. Set up monitoring and alerting"
echo "  4. Configure automated backups"
echo ""
print_success "Deployment script completed successfully!"
