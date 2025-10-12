#!/bin/bash

# Google Sites Setup Script for Zynk Project
# This script prepares your project for Google Sites publishing

set -e

echo "🚀 Setting up Zynk for Google Sites Publishing"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
DOMAIN="projects1.amritanet.edu"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

print_status "Preparing frontend for Google Sites compatibility..."

# Create Google Sites specific environment file
print_status "Creating Google Sites environment configuration..."
cat > $FRONTEND_DIR/.env.production << EOF
REACT_APP_API_URL=http://$DOMAIN/api
REACT_APP_SOCKET_URL=http://$DOMAIN
GENERATE_SOURCEMAP=false
PUBLIC_URL=.
EOF

# Create Google Sites specific public/index.html
print_status "Updating public/index.html for Google Sites..."
cat > $FRONTEND_DIR/public/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Zynk - Social Event Platform" />
    <title>Zynk - Social Event Platform</title>
    
    <!-- Google Sites compatibility -->
    <script>
        // Override base URL for API calls
        window.REACT_APP_API_URL = 'http://$DOMAIN/api';
        window.REACT_APP_SOCKET_URL = 'http://$DOMAIN';
    </script>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>
EOF

# Create Google Sites landing page component
print_status "Creating Google Sites landing page component..."
mkdir -p $FRONTEND_DIR/src/components

cat > $FRONTEND_DIR/src/components/GoogleSitesLanding.js << 'EOF'
import React from 'react';
import './GoogleSitesLanding.css';

const GoogleSitesLanding = () => {
  const handleLaunchApp = () => {
    window.open('http://projects1.amritanet.edu', '_blank');
  };

  const handleCheckAPI = () => {
    window.open('http://projects1.amritanet.edu/api/health', '_blank');
  };

  return (
    <div className="google-sites-landing">
      <div className="hero-section">
        <h1>Zynk</h1>
        <h2>Social Event Platform</h2>
        <p>Connect, share, and discover events in your community</p>
        
        <div className="cta-buttons">
          <button className="primary-btn" onClick={handleLaunchApp}>
            🚀 Launch Full Application
          </button>
          <button className="secondary-btn" onClick={handleCheckAPI}>
            🔍 Check API Status
          </button>
        </div>
      </div>

      <div className="features-section">
        <h3>Platform Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🎉 Event Management</h4>
            <p>Create, organize, and manage events with ease</p>
          </div>
          <div className="feature-card">
            <h4>💬 Real-time Chat</h4>
            <p>Connect with event attendees through live chat</p>
          </div>
          <div className="feature-card">
            <h4>📸 Photo Albums</h4>
            <p>Share memories and photos from your events</p>
          </div>
          <div className="feature-card">
            <h4>👥 Community Building</h4>
            <p>Build and engage with your event community</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>Live Demo</h3>
        <p>Experience the full application with all features:</p>
        <iframe 
          src="http://projects1.amritanet.edu" 
          width="100%" 
          height="600"
          frameBorder="0"
          title="Zynk Application Demo"
        />
      </div>
    </div>
  );
};

export default GoogleSitesLanding;
EOF

# Create CSS for Google Sites landing page
cat > $FRONTEND_DIR/src/components/GoogleSitesLanding.css << 'EOF'
.google-sites-landing {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 4rem;
  margin: 0;
  font-weight: 700;
}

.hero-section h2 {
  font-size: 1.5rem;
  margin: 10px 0 20px;
  opacity: 0.9;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.8;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.primary-btn {
  background: white;
  color: #667eea;
}

.primary-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.secondary-btn {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.secondary-btn:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.features-section {
  margin: 60px 0;
}

.features-section h3 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h4 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.demo-section {
  margin: 60px 0;
  text-align: center;
}

.demo-section h3 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.demo-section p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.demo-section iframe {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
EOF

# Create Google Sites specific App component
print_status "Creating Google Sites App component..."
cat > $FRONTEND_DIR/src/GoogleSitesApp.js << 'EOF'
import React from 'react';
import GoogleSitesLanding from './components/GoogleSitesLanding';

const GoogleSitesApp = () => {
  return (
    <div className="google-sites-app">
      <GoogleSitesLanding />
    </div>
  );
};

export default GoogleSitesApp;
EOF

# Update backend CORS for Google Sites
print_status "Updating backend CORS configuration for Google Sites..."
if [ -f "$BACKEND_DIR/server.js" ]; then
    # Create backup
    cp $BACKEND_DIR/server.js $BACKEND_DIR/server.js.backup
    
    # Update CORS configuration
    sed -i 's/origin: process.env.FRONTEND_URL || "http:\/\/localhost:3000"/origin: [\n    process.env.FRONTEND_URL || "http:\/\/localhost:3000",\n    "https:\/\/sites.google.com",\n    "https:\/\/*.googleusercontent.com",\n    "https:\/\/*.googleapis.com"\n  ]/g' $BACKEND_DIR/server.js
    
    print_success "Backend CORS configuration updated"
else
    print_warning "Backend server.js not found. Please update CORS manually."
fi

# Build the frontend for Google Sites
print_status "Building frontend for Google Sites..."
cd $FRONTEND_DIR
npm run build
cd ..

# Create Google Sites upload package
print_status "Creating Google Sites upload package..."
mkdir -p google-sites-package
cp -r $FRONTEND_DIR/build/* google-sites-package/
cp google-sites-landing.html google-sites-package/index.html

# Create upload instructions
cat > google-sites-package/README.md << EOF
# Google Sites Upload Package

## Files to Upload to Google Sites:

1. **index.html** - Main landing page (use this as your primary page)
2. **static/** - All CSS and JavaScript files
3. **favicon.ico** - Website icon

## Upload Instructions:

### Method 1: Direct HTML Upload
1. Go to Google Sites
2. Create a new site
3. Add an "Embed" element
4. Copy the contents of index.html
5. Paste into the embed element

### Method 2: File Upload
1. Upload all files to Google Drive
2. Make them publicly accessible
3. Link to them in your Google Sites page

## Important Notes:
- The main application runs on: http://$DOMAIN
- API endpoint: http://$DOMAIN/api
- This is a landing page that links to the full application
- The full application requires the backend server to be running

## Testing:
- Test the landing page: Open index.html in a browser
- Test the full app: Visit http://$DOMAIN
- Test API: Visit http://$DOMAIN/api/health
EOF

print_success "Google Sites setup completed!"
echo ""
echo "=================================================="
echo "🎉 Google Sites Package Ready!"
echo "=================================================="
echo ""
echo "📁 Files created:"
echo "  • google-sites-package/ - Upload this to Google Sites"
echo "  • google-sites-landing.html - Standalone landing page"
echo "  • Updated frontend components for Google Sites"
echo "  • Updated backend CORS configuration"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy your backend to $DOMAIN (use deploy.sh)"
echo "  2. Upload google-sites-package/ to Google Sites"
echo "  3. Test the integration"
echo ""
echo "🔗 URLs:"
echo "  • Full Application: http://$DOMAIN"
echo "  • API Health: http://$DOMAIN/api/health"
echo "  • Landing Page: google-sites-package/index.html"
echo ""
print_success "Setup completed successfully!"
