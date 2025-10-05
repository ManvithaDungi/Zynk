# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/zynk
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Important Notes:

1. **JWT_SECRET**: Must be at least 32 characters long in production
2. **MONGO_URI**: Update if using MongoDB Atlas or different database
3. **FRONTEND_URL**: Update for production deployment
4. **Never commit .env to version control**

