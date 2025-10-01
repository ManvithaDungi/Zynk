-- MongoDB Collection Setup for Users
-- This script creates the users collection with proper indexes

-- Create users collection with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password", "createdAt"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30,
          description: "Username must be 3-30 characters"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "Password must be at least 6 characters"
        },
        avatar: {
          bsonType: ["string", "null"],
          description: "Avatar URL or null"
        },
        bio: {
          bsonType: "string",
          maxLength: 500,
          description: "Bio must be max 500 characters"
        },
        followers: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Array of user IDs who follow this user"
        },
        following: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Array of user IDs this user follows"
        },
        postsCount: {
          bsonType: "int",
          minimum: 0,
          description: "Number of posts by this user"
        },
        isVerified: {
          bsonType: "bool",
          description: "Whether the user is verified"
        },
        isPrivate: {
          bsonType: "bool",
          description: "Whether the user profile is private"
        },
        createdAt: {
          bsonType: "date",
          description: "User creation timestamp"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        lastLogin: {
          bsonType: ["date", "null"],
          description: "Last login timestamp"
        }
      }
    }
  }
});

-- Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "followers": 1 });
db.users.createIndex({ "following": 1 });
