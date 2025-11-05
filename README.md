# Zynk - Social Event Platform

A comprehensive social event platform that enables users to create, manage, and participate in events while fostering community engagement through real-time communication, content sharing, and social interaction features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Login Credentials
**Test User Account:**
- **Email:** `test3626@gmail.com`
- **Password:** `pass3626`

## 📋 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Zynk
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.txt .env

# Edit .env file with your MongoDB connection string
# Update MONGO_URI with your MongoDB Atlas connection string
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup
The application uses MongoDB Atlas. Make sure your `.env` file contains:
```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/media
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Option 1: Manual Start (Recommended for Development)

#### Start Backend Server
```bash
# From backend directory
cd backend
npm start
# or for development with auto-restart
npm run dev
```
Backend will run on: `http://localhost:5000`

#### Start Frontend Server
```bash
# From frontend directory (in a new terminal)
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### Option 2: Quick Deploy Script
```bash
# From project root
./quick-deploy.sh
```

## 🔐 Authentication & Login

### Test User Account
Use these credentials to log in and explore the platform:

**Email:** `test3626@gmail.com`  
**Password:** `pass3626`

### Features Available After Login:
- ✅ Create and manage events
- ✅ Join events and manage waitlists
- ✅ Real-time chat in event rooms
- ✅ Create photo albums and memories
- ✅ Social posts and interactions
- ✅ Analytics and reporting
- ✅ User profile management

## 🎯 Key Features

### Event Management
- **Create Events:** Full event creation with details, location, and media
- **Event Discovery:** Browse and search events by category, date, location
- **Registration:** Join events with automatic waitlist management
- **Real-time Updates:** Live attendee counts and status updates

### Communication Hub
- **Event Chat:** Real-time messaging in event-specific rooms
- **Direct Messaging:** Private user-to-user communication
- **Polls & Surveys:** Interactive event engagement
- **Notifications:** Real-time system alerts

### Content Management
- **Photo Albums:** Event photo sharing and organization
- **Memories:** Rich multimedia memory creation
- **Social Posts:** Community content sharing
- **File Uploads:** Image and document management

### Analytics & Reporting
- **Event Analytics:** Attendance tracking and engagement metrics
- **User Insights:** Activity patterns and interaction analysis
- **Data Visualization:** Interactive charts and graphs
- **Export Capabilities:** PDF reports and data export

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **React Router** - Navigation and routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code quality
- **Postman** - API testing
- **Git** - Version control

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Communication
- `GET /api/communication/chat/:eventId` - Get event chat
- `POST /api/communication/message` - Send message
- `GET /api/communication/polls` - Get polls
- `POST /api/communication/polls` - Create poll

### Media & Content
- `GET /api/albums` - Get user albums
- `POST /api/albums` - Create album
- `GET /api/memories` - Get memories
- `POST /api/memories` - Create memory
- `GET /api/posts` - Get social posts
- `POST /api/posts` - Create post

## 🧪 Testing

### API Testing with Postman
1. Import the collection: `Zynk-Backend-API-Tests.postman_collection.json`
2. Start your backend server
3. Run the collection tests

### Manual Testing
1. Login with test credentials
2. Create a new event
3. Join an existing event
4. Test real-time chat
5. Create memories and albums
6. Test social features

## 🚀 Deployment

### Production Deployment
```bash
# Use the deployment script
./deploy.sh
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

## 📱 Usage Guide

### For Event Organizers
1. **Login** with your credentials
2. **Create Event** - Click "Create Event" and fill in details
3. **Manage Event** - View registrations, chat, and analytics
4. **Share Content** - Upload photos and create memories

### For Event Participants
1. **Browse Events** - Explore upcoming events
2. **Join Events** - Register for events you're interested in
3. **Engage** - Participate in event chat and polls
4. **Share** - Create memories and social posts

### For Administrators
1. **Access Admin Panel** - Navigate to `/admin`
2. **View Analytics** - Monitor platform usage and performance
3. **Manage Users** - View user activity and accounts
4. **System Health** - Monitor server performance

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 5000 is available
netstat -an | findstr :5000

# Kill process if needed
taskkill /PID <process-id> /F
```

#### Frontend Won't Start
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Database Connection Issues

**IP Whitelist Error (Most Common):**
If you see "Could not connect... IP that isn't whitelisted":
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Select your cluster → **Network Access** (or **Security** → **Network Access**)
3. Click **Add IP Address** or **Add Current IP Address**
4. For development: Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - ⚠️ **Security Note:** Only use `0.0.0.0/0` for development, not production!
5. Wait 1-2 minutes for changes to propagate
6. Restart your backend server

**To find your current IP address:**
- Windows PowerShell: `curl ifconfig.me` or visit https://whatismyipaddress.com/

**Other Database Issues:**
- Verify MongoDB Atlas connection string in `.env` file
- Check network connectivity to MongoDB Atlas
- Ensure database user has proper permissions
- **Note:** You don't need to run `mongod` locally - this project uses MongoDB Atlas (cloud database)
- **SSL/TLS Errors:** If you see `TLSV1_ALERT_INTERNAL_ERROR` or similar SSL errors:
  - The updated database configuration now handles SSL/TLS issues automatically
  - Check your firewall/antivirus isn't blocking TLS connections
  - Verify your MongoDB Atlas cluster is active and accessible

#### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check if user exists in database
- Clear browser localStorage

### Getting Help
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check network connectivity

## 📊 Performance

### System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Stable internet connection

### Performance Metrics
- **Response Time:** < 200ms for API calls
- **Concurrent Users:** Supports 1000+ users
- **Uptime:** 99.9% availability target

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - XSS and injection prevention
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API abuse prevention

## 📈 Analytics & Monitoring

### Available Metrics
- Event attendance and engagement
- User activity patterns
- Content interaction rates
- System performance metrics
- Real-time user statistics

### Accessing Analytics
1. Login as test user
2. Navigate to Analytics section
3. View interactive charts and reports
4. Export data as PDF

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test all new features

## 📞 Support

### Documentation
- `PROJECT_SUMMARY.md` - Detailed project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `POSTMAN_TESTING_GUIDE.md` - API testing guide

### Contact
For support or questions:
- Check the troubleshooting section
- Review the documentation files
- Test with the provided credentials

## 🎉 Getting Started Checklist

- [ ] Clone the repository
- [ ] Install backend dependencies (`cd backend && npm install`)
- [ ] Install frontend dependencies (`cd frontend && npm install`)
- [ ] Set up environment variables
- [ ] Start backend server (`cd backend && npm start`)
- [ ] Start frontend server (`cd frontend && npm start`)
- [ ] Open browser to `http://localhost:3000`
- [ ] Login with test credentials
- [ ] Explore the platform features

---

**Happy Event Planning with Zynk! 🎉**

*For detailed technical documentation, see `PROJECT_SUMMARY.md` and `DEPLOYMENT_GUIDE.md`*