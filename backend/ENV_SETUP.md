# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zynk?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Important Notes:

1. **JWT_SECRET**: Must be at least 32 characters long in production
2. **MONGO_URI**: 
   - For local development: `mongodb://127.0.0.1:27017/zynk`
   - For MongoDB Atlas cluster: `mongodb+srv://username:password@cluster.mongodb.net/media`
   - Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials
3. **FRONTEND_URL**: Update for production deployment
4. **Never commit .env to version control**

## MongoDB Atlas Setup:

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace the MONGO_URI in your .env file with the Atlas connection string

