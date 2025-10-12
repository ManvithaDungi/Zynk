# Zynk - Social Event Platform
## Project Architecture & Module Diagram

```
Zynk - Social Event Platform
│
├── 🔐 Authentication & User Management
│   ├── Login/Registration
│   │   └── User Auth Form ─► users, sessions
│   └── Profile Management
│       └── Profile Update Form ─► users, avatars
│
├── 🎉 Event Management
│   ├── Event Creation
│   │   └── Create Event Form ─► events, categories, tags
│   ├── Event Details
│   │   ├── Event Info Form ─► events, locations
│   │   ├── Event Waitlist Form ─► waitlist_entries, events, users
│   │   └── Event Share Form ─► events, social_shares
│   └── Event Interaction
│       ├── Event Feedback Form ─► reviews, events, users
│       └── Report Issue Form ─► feedback, events, users
│
├── 💬 Communication Hub
│   ├── Real-time Chat
│   │   ├── General Chat Form ─► chat_messages, users
│   │   └── Event Chat Form ─► chat_messages, events, users
│   ├── Direct Messaging
│   │   └── Message Form ─► messages, users
│   ├── Polls & Surveys
│   │   └── Poll Creation Form ─► polls, poll_options, users
│   └── User Management
│       └── User Management Form ─► users, permissions
│
├── 📸 Content Management
│   ├── Photo Albums
│   │   ├── Album Creation Form ─► albums, events
│   │   └── Photo Upload Form ─► albums, images, events
│   ├── Memories
│   │   ├── Memory Creation Form ─► memories, events, users
│   │   └── Memory Viewer Form ─► memories, comments
│   └── Posts & Social
│       └── Post Creation Form ─► posts, users, events
│
├── 📊 Analytics & Reporting
│   ├── Event Analytics
│   │   └── Analytics Filter Form ─► analytics_filters, events
│   ├── Bulk Operations
│   │   └── Bulk Categorize Form ─► bulk_categorize, categories, events
│   └── Privacy Management
│       └── Privacy Settings Form ─► privacy_manager, users, content
│
├── 🔍 Discovery & Search
│   ├── Event Search
│   │   └── Search Form ─► events, categories, tags
│   ├── User Discovery
│   │   └── User Search Form ─► users, profiles
│   └── Content Exploration
│       └── Explore Form ─► posts, events, albums
│
└── ⚙️ System Administration
    ├── Admin Dashboard
    │   └── Admin Settings Form ─► admin_settings, system_config
    ├── Feedback Management
    │   └── Feedback Form ─► feedback, users, issues
    └── Contact & Support
        └── Contact Form ─► contact_messages, support_tickets
```

## Database Tables & Relationships

### Core Tables
- **users** - User accounts, profiles, authentication
- **events** - Event information, scheduling, details
- **categories** - Event categorization system
- **tags** - Event tagging and labeling

### Communication Tables
- **chat_messages** - Real-time chat messages
- **messages** - Direct messaging between users
- **polls** - Polls and surveys
- **poll_options** - Poll answer options
- **waitlist_entries** - Event waitlist management

### Content Tables
- **albums** - Photo albums and galleries
- **memories** - Event memories and stories
- **posts** - Social posts and content
- **reviews** - Event reviews and ratings

### Management Tables
- **privacy_manager** - Privacy settings and controls
- **analytics_filters** - Analytics and reporting filters
- **bulk_categorize** - Bulk operation records
- **feedback** - User feedback and issues
- **admin_settings** - System configuration

### Relationship Tables
- **user_follows** - User following relationships
- **event_participants** - Event attendance tracking
- **album_photos** - Photo-album relationships
- **memory_comments** - Memory comment system

## API Endpoints Structure

### Authentication Routes (`/api/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout
- GET `/profile` - Get user profile
- PUT `/profile` - Update user profile

### Event Routes (`/api/events`)
- GET `/` - Get all events
- POST `/` - Create new event
- GET `/:id` - Get event details
- PUT `/:id` - Update event
- DELETE `/:id` - Delete event
- POST `/:id/join` - Join event
- POST `/:id/leave` - Leave event

### Communication Routes (`/api/communication`)
- GET `/messages` - Get chat messages
- POST `/messages` - Send message
- GET `/polls` - Get polls
- POST `/polls` - Create poll
- POST `/polls/:id/vote` - Vote on poll

### Content Routes (`/api/albums`, `/api/memories`, `/api/posts`)
- GET `/` - Get content
- POST `/` - Create content
- PUT `/:id` - Update content
- DELETE `/:id` - Delete content
- POST `/:id/like` - Like content
- POST `/:id/comment` - Comment on content

### Analytics Routes (`/api/analytics`)
- GET `/filters` - Get analytics filters
- POST `/filters` - Create filter
- GET `/reports` - Generate reports
- POST `/bulk-categorize` - Bulk categorize

## Real-time Features (Socket.io)

### Event-based Communication
- `join-event` - Join event chat room
- `leave-event` - Leave event chat room
- `send-message` - Send real-time message
- `typing` - Typing indicators
- `new-message` - Broadcast new messages
- `user-typing` - User typing status

### System Events
- `user-connected` - User online status
- `user-disconnected` - User offline status
- `event-update` - Event information updates
- `notification` - System notifications

## Technology Stack Summary

### Frontend
- **React 19** - UI Framework
- **Radix UI** - Component Library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Infrastructure
- **Ubuntu 24.04** - Server OS
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **MongoDB** - Database server

## Key Features

### 🎯 Core Features
- ✅ User Authentication & Authorization
- ✅ Event Creation & Management
- ✅ Real-time Chat & Messaging
- ✅ Photo Albums & Media Sharing
- ✅ Event Memories & Stories
- ✅ Polls & Surveys
- ✅ User Profiles & Social Features

### 🔧 Advanced Features
- ✅ Analytics & Reporting
- ✅ Privacy Controls
- ✅ Bulk Operations
- ✅ Search & Discovery
- ✅ Admin Dashboard
- ✅ Feedback System
- ✅ Export & PDF Generation

### 📱 Modern Features
- ✅ Responsive Design
- ✅ Real-time Updates
- ✅ Progressive Web App
- ✅ File Upload & Management
- ✅ Notification System
- ✅ Social Sharing
- ✅ Mobile Optimization
