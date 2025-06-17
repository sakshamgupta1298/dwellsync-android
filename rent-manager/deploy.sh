#!/bin/bash

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y python3 python3-pip python3-venv nginx

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx configuration
cat > /etc/nginx/sites-available/rent-manager << 'EOL'
server {
    listen 80;
    server_name liveinsync.in;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/rent-manager /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup SSL with Certbot
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d liveinsync.in --non-interactive --agree-tos --email your-email@example.com

# Restart Nginx again after SSL setup
systemctl restart nginx

echo "Deployment completed successfully!" 