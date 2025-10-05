# 🌱 Database Seeding Instructions

## ⚠️ Important: MongoDB Must Be Running

Before running the seed script, make sure MongoDB is running on your system.

### Check if MongoDB is Running:

**Windows:**
```bash
# Check MongoDB service status
sc query MongoDB

# Start MongoDB service
net start MongoDB
```

**macOS/Linux:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

---

## 🚀 Run the Seed Script

Once MongoDB is confirmed running:

```bash
# From the project root directory
node seed-all-data.js
```

---

## 📦 What Gets Seeded

The script will populate your database with:

- ✅ **10 Categories** (Conference, Workshop, Meetup, Social, Sports, Arts, Music, Technology, Education, Health)
- ✅ **20 Tags** (networking, professional, beginner-friendly, etc.)
- ✅ **10 Users** (john@example.com, sarah@example.com, etc.)
- ✅ **10 Events** (React Workshop, Music Festival, Networking Mixer, etc.)
- ✅ **7 Albums** (Event albums + personal albums)
- ✅ **10 Posts/Memories** (Photos, captions, likes, comments)

---

## 🔐 Test Credentials

After seeding, you can login with any of these accounts:

| Email | Password |
|-------|----------|
| john@example.com | password123 |
| sarah@example.com | password123 |
| mike@example.com | password123 |
| lisa@example.com | password123 |
| david@example.com | password123 |
| emma@example.com | password123 |
| alex@example.com | password123 |
| maria@example.com | password123 |
| james@example.com | password123 |
| rachel@example.com | password123 |

**All users have the same password:** `password123`

---

## 🔧 Troubleshooting

### Error: "Connection timeout" or "ECONNREFUSED"
**Solution:** MongoDB is not running. Start MongoDB service (see commands above).

### Error: "Operation buffering timed out"
**Solution:** MongoDB is running but not responding. Restart MongoDB:
```bash
# Windows
net stop MongoDB
net start MongoDB

# macOS/Linux
sudo systemctl restart mongod
```

### Error: "Duplicate key error"
**Solution:** Data already exists. The script will skip clearing data if there are issues. You can manually clear the database:
```bash
# Connect to MongoDB
mongosh zynk

# Drop the database
use zynk
db.dropDatabase()

# Exit
exit

# Run seed script again
node seed-all-data.js
```

---

## 📊 Verifying the Data

After successful seeding, you can verify the data:

```bash
# Connect to MongoDB
mongosh zynk

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.events.countDocuments()
db.categories.countDocuments()
db.albums.countDocuments()
db.posts.countDocuments()

# View sample data
db.users.find().limit(3)
db.events.find().limit(3)
```

---

## 🎯 Next Steps

1. ✅ **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. ✅ **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. ✅ **Login:**
   - Go to `http://localhost:3000`
   - Use email: `john@example.com`
   - Password: `password123`

4. ✅ **Test the Forms:**
   - `/profile` - User Profile Form
   - `/feedback` - Feedback Form
   - `/admin` → "Site Settings" - Admin Settings Form
   - `/create-event` - Create Event Form
   - `/albums` - Album & Memory Forms

---

## 🎉 You're All Set!

Your database now has sample data for testing all the forms and features!

