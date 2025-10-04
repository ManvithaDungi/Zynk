# Zynk Backend API Testing Guide

## 🚀 Quick Start

1. **Import the Collection**
   - Open Postman
   - Click "Import" button
   - Select `Zynk-Backend-API-Tests.postman_collection.json`
   - The collection will be imported with all endpoints

2. **Start Your Backend Server**
   - Make sure your backend server is running on `http://localhost:5000`
   - Run `npm start` in the backend directory

## 📋 Testing Order

### 1. Health Check
- **GET** `/api/health`
- Should return: `{"status": "Server is running", "timestamp": "..."}`

### 2. Authentication
- **POST** `/api/auth/login` (use existing user: `sampleuser@example.com` / `sample123`)
- This will automatically set the auth token for other requests

### 3. Test All Endpoints
Run the requests in this order for best results:

#### Events
1. Get All Events
2. Get Upcoming Events  
3. Get User Registered Events
4. Create Event (saves eventId automatically)
5. Get Event by ID
6. Register for Event
7. Unregister from Event
8. Update Event
9. Delete Event

#### Albums
1. Get User Albums
2. Get Albums by Event
3. Create Album (saves albumId automatically)
4. Get Album by ID
5. Get Album Posts
6. Update Album
7. Delete Album

#### Posts
1. Get All Posts (Feed)
2. Create Post (saves postId automatically)
3. Get Post by ID
4. Like Post
5. Unlike Post
6. Add Comment
7. Update Post
8. Delete Post

#### Users
1. Get User Profile
2. Update User Profile
3. Follow User
4. Unfollow User
5. Get User Followers
6. Get User Following
7. Get User Posts
8. Delete User

#### Search & Explore
1. Search Users and Posts
2. Get Trending Posts
3. Get Popular Users
4. Get Recommended Content

## 🔧 Collection Variables

The collection automatically manages these variables:
- `baseUrl`: `http://localhost:5000/api`
- `authToken`: Set automatically after login
- `userId`: Set automatically after login/register
- `eventId`: Set automatically after creating an event
- `albumId`: Set automatically after creating an album
- `postId`: Set automatically after creating a post

## 🎯 Test Scripts

Each request includes test scripts that:
- Automatically extract and save IDs from responses
- Set authentication tokens
- Log success/failure messages
- Check response status codes

## 📊 Expected Responses

### Success Responses
- **200**: OK (GET, PUT requests)
- **201**: Created (POST requests)
- **204**: No Content (DELETE requests)

### Error Responses
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

## 🔍 Debugging Tips

1. **Check Console**: Look at Postman console for test script logs
2. **Check Variables**: Verify collection variables are set correctly
3. **Check Headers**: Ensure Authorization header is present
4. **Check Server**: Make sure backend server is running
5. **Check Database**: Verify sample data exists

## 📝 Sample Data

The collection is configured to work with the sample data:
- **User**: `sampleuser@example.com` / `sample123`
- **Events**: 3 sample events created
- **Albums**: 3 sample albums created  
- **Posts**: 3 sample posts created

## 🚨 Common Issues

1. **401 Unauthorized**: Make sure to login first
2. **404 Not Found**: Check if the resource exists
3. **500 Internal Error**: Check server logs
4. **Connection Refused**: Make sure server is running

## 📈 Performance Testing

To test performance:
1. Use Postman Runner to run multiple requests
2. Check response times in Postman
3. Monitor server logs for errors
4. Test with different data sizes

Happy Testing! 🎉
