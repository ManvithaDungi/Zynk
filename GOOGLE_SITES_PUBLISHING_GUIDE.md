# Publishing Zynk to Google Sites - Complete Guide

## ⚠️ Important Limitations

**Google Sites can only host static websites.** Your Zynk project is a full-stack application that requires:
- Backend API server (Node.js/Express)
- Database (MongoDB)
- Real-time features (Socket.io)
- Server-side processing

## 🎯 Solution: Hybrid Approach

We'll create a **hybrid solution** where:
1. **Backend** runs on your Ubuntu server (172.17.9.106)
2. **Frontend** is adapted for Google Sites
3. **API calls** connect to your external backend

## 📋 Step-by-Step Implementation

### Step 1: Prepare Your Backend Server

First, ensure your backend is running on your Ubuntu server:

```bash
# Deploy backend to your server (use the deployment scripts we created)
ssh amrita@172.17.9.106
./deploy.sh
```

Your backend will be available at: `http://projects1.amritanet.edu/api`

### Step 2: Create Google Sites-Compatible Frontend

#### 2.1 Create a Static Build Configuration

Create `frontend/public/index.html` with Google Sites compatibility:

```html
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
        window.REACT_APP_API_URL = 'http://projects1.amritanet.edu/api';
    </script>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>
```

#### 2.2 Update Environment Configuration

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=http://projects1.amritanet.edu/api
REACT_APP_SOCKET_URL=http://projects1.amritanet.edu
GENERATE_SOURCEMAP=false
```

#### 2.3 Build the Frontend

```bash
cd frontend
npm run build
```

### Step 3: Create Google Sites-Compatible Components

#### 3.1 Create a Landing Page Component

Create `frontend/src/components/GoogleSitesLanding.js`:

```jsx
import React from 'react';
import './GoogleSitesLanding.css';

const GoogleSitesLanding = () => {
  const handleLogin = () => {
    // Redirect to your full application
    window.open('http://projects1.amritanet.edu', '_blank');
  };

  return (
    <div className="google-sites-landing">
      <div className="hero-section">
        <h1>Zynk</h1>
        <h2>Social Event Platform</h2>
        <p>Connect, share, and discover events in your community</p>
        
        <div className="cta-buttons">
          <button className="primary-btn" onClick={handleLogin}>
            Launch Full Application
          </button>
          <button className="secondary-btn" onClick={() => window.open('http://projects1.amritanet.edu/api/health', '_blank')}>
            Check API Status
          </button>
        </div>
      </div>

      <div className="features-section">
        <h3>Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🎉 Event Management</h4>
            <p>Create, share, and manage events with ease</p>
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
            <h4>👥 Community</h4>
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
```

#### 3.2 Create Landing Page Styles

Create `frontend/src/components/GoogleSitesLanding.css`:

```css
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
```

### Step 4: Create Google Sites App

Create `frontend/src/GoogleSitesApp.js`:

```jsx
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
```

### Step 5: Build for Google Sites

#### 5.1 Update package.json

Add a new script to `frontend/package.json`:

```json
{
  "scripts": {
    "build:google-sites": "REACT_APP_TARGET=google-sites npm run build",
    "build": "react-scripts build"
  }
}
```

#### 5.2 Create Google Sites Build

```bash
cd frontend
npm run build
```

### Step 6: Publish to Google Sites

#### 6.1 Create Google Site

1. Go to [Google Sites](https://sites.google.com)
2. Click "Create" → "New site"
3. Choose a template or start blank
4. Name your site: "Zynk - Social Event Platform"

#### 6.2 Upload Your Build Files

1. **Download your build files** from `frontend/build/`
2. **Upload to Google Drive**:
   - Upload the entire `build` folder to Google Drive
   - Make sure it's publicly accessible

#### 6.3 Embed in Google Sites

**Option A: Embed as HTML**
1. In Google Sites, add an "Embed" element
2. Use this HTML code:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Zynk - Social Event Platform</title>
    <style>
        body { margin: 0; padding: 0; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="https://drive.google.com/file/d/YOUR_FILE_ID/preview" 
            width="100%" 
            height="100vh" 
            frameborder="0">
    </iframe>
</body>
</html>
```

**Option B: Direct Integration**
1. Copy the contents of your `build/index.html`
2. Paste into Google Sites HTML embed
3. Upload CSS and JS files to Google Drive
4. Link them in the HTML

#### 6.4 Configure CORS for Your Backend

Update your backend to allow Google Sites:

In `backend/server.js`, update CORS configuration:

```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sites.google.com",
    "https://*.googleusercontent.com",
    "https://*.googleapis.com"
  ],
  credentials: true,
}));
```

### Step 7: Alternative - Use Google Sites as Landing Page

#### 7.1 Create a Simple Landing Page

Instead of embedding the full app, create a simple landing page in Google Sites:

1. **Add Text Elements**:
   - Title: "Zynk - Social Event Platform"
   - Subtitle: "Connect, share, and discover events in your community"

2. **Add Buttons**:
   - "Launch Application" → Links to `http://projects1.amritanet.edu`
   - "API Documentation" → Links to `http://projects1.amritanet.edu/api/health`

3. **Add Images**:
   - Upload screenshots of your application
   - Add feature images

4. **Add Embed**:
   - Embed a demo video or iframe of your application

#### 7.2 Sample Google Sites Content

**Hero Section:**
```
Zynk - Social Event Platform

Connect, share, and discover events in your community

[Launch Application Button] → http://projects1.amritanet.edu
```

**Features Section:**
```
🎉 Event Management
Create, share, and manage events with ease

💬 Real-time Chat
Connect with event attendees through live chat

📸 Photo Albums
Share memories and photos from your events

👥 Community
Build and engage with your event community
```

**Demo Section:**
```
Live Demo
Experience the full application with all features:

[Embed iframe: http://projects1.amritanet.edu]
```

## 🚀 Publishing Steps Summary

### Quick Method (Recommended):

1. **Deploy backend** to your Ubuntu server using our deployment scripts
2. **Create a simple Google Sites page** with:
   - Project title and description
   - "Launch Application" button linking to your server
   - Screenshots and feature descriptions
   - Embedded demo iframe

3. **Publish the Google Site** and share the URL

### Advanced Method:

1. **Deploy backend** to your Ubuntu server
2. **Create Google Sites-compatible frontend** using the components above
3. **Build and upload** the static files
4. **Embed in Google Sites** using HTML embed
5. **Configure CORS** on your backend

## 🔗 Final URLs

- **Google Sites Landing Page**: `https://sites.google.com/view/your-site-name`
- **Full Application**: `http://projects1.amritanet.edu`
- **API Endpoint**: `http://projects1.amritanet.edu/api`

## ⚠️ Important Notes

1. **Google Sites limitations**: Cannot host dynamic content, databases, or server-side code
2. **CORS issues**: You may need to configure your backend to allow Google Sites requests
3. **HTTPS requirement**: Google Sites requires HTTPS for embedded content
4. **Performance**: Embedded iframes may have performance limitations

## 🎯 Recommended Approach

**Use Google Sites as a professional landing page** that showcases your project and provides a link to the full application hosted on your Ubuntu server. This gives you:

- Professional presentation on Google Sites
- Full functionality on your dedicated server
- Best of both worlds

Would you like me to help you implement any of these approaches?
