-- MongoDB Collection Setup for Posts
-- This script creates the posts collection with proper indexes

-- Create posts collection with validation
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["authorId", "createdAt"],
      properties: {
        content: {
          bsonType: "string",
          maxLength: 500,
          description: "Post content must be max 500 characters"
        },
        images: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          maxItems: 4,
          description: "Array of image URLs, max 4 images"
        },
        authorId: {
          bsonType: "objectId",
          description: "Reference to the user who created the post"
        },
        likes: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Array of user IDs who liked this post"
        },
        comments: {
          bsonType: "int",
          minimum: 0,
          description: "Number of comments on this post"
        },
        createdAt: {
          bsonType: "date",
          description: "Post creation timestamp"
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp"
        }
      }
    }
  }
});

-- Create indexes for better performance
db.posts.createIndex({ "authorId": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "likes": 1 });
db.posts.createIndex({ "authorId": 1, "createdAt": -1 });
