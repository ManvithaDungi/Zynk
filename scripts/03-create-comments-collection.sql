-- MongoDB Collection Setup for Comments
-- This script creates the comments collection with proper indexes

-- Create comments collection with validation
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["content", "postId", "authorId", "createdAt"],
      properties: {
        content: {
          bsonType: "string",
          minLength: 1,
          maxLength: 500,
          description: "Comment content must be 1-500 characters"
        },
        postId: {
          bsonType: "objectId",
          description: "Reference to the post this comment belongs to"
        },
        authorId: {
          bsonType: "objectId",
          description: "Reference to the user who created the comment"
        },
        likes: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Array of user IDs who liked this comment"
        },
        createdAt: {
          bsonType: "date",
          description: "Comment creation timestamp"
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
db.comments.createIndex({ "postId": 1 });
db.comments.createIndex({ "authorId": 1 });
db.comments.createIndex({ "createdAt": -1 });
db.comments.createIndex({ "postId": 1, "createdAt": -1 });
db.comments.createIndex({ "likes": 1 });
