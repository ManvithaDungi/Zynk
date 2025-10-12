#!/bin/bash

# Quick Deployment Script for Zynk Project
# This is a simplified version for quick setup

set -e

echo "🚀 Quick Zynk Deployment Script"
echo "================================"

# Configuration
DOMAIN="projects1.amritanet.edu"
PROJECT_DIR="/opt/zynk"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Update system
print_status "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start services
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2 serve

# Create project directory
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Copy project files (run from project directory)
print_status "Copying project files..."
cp -r . $PROJECT_DIR/

# Install dependencies
print_status "Installing dependencies..."
cd $PROJECT_DIR/backend
npm install --production

cd $PROJECT_DIR/frontend
npm install
npm run build

# Create environment files
print_status "Creating environment files..."

# Backend .env
cat > $PROJECT_DIR/backend/.env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/zynk
NODE_ENV=production
FRONTEND_URL=http://$DOMAIN
JWT_SECRET=0d8f87842f60d231e26f0def7656f764273e15ff94dfa717a08522523bb28ba81e5b93487847d4052ce4373845006fb8b77405311ea96af98e01a0747db86a97
EOF

# Frontend .env
cat > $PROJECT_DIR/frontend/.env << EOF
REACT_APP_API_URL=http://$DOMAIN/api
EOF

# Create PM2 ecosystem
cat > $PROJECT_DIR/ecosystem.config.js << EOF
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
      }
    },
    {
      name: 'zynk-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: '$PROJECT_DIR/frontend',
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
EOF

# Start applications
print_status "Starting applications..."
cd $PROJECT_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/zynk > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

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
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/zynk /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_success "Quick deployment completed!"
echo ""
echo "🎉 Your Zynk application is now running at:"
echo "   Frontend: http://$DOMAIN"
echo "   Backend: http://$DOMAIN/api"
echo ""
echo "📋 Management commands:"
echo "   pm2 status    - Check application status"
echo "   pm2 logs      - View logs"
echo "   pm2 restart all - Restart applications"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Change the default password"
echo "   2. Set up SSL certificate"
echo "   3. Configure MongoDB authentication"
