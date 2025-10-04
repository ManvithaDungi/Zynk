const mongoose = require('mongoose');
const Category = require('./backend/models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/zynk');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed categories
const seedCategories = async () => {
  try {
    const categories = [
      { name: 'Conference', description: 'Professional conferences and seminars', icon: '🎤', color: '#3B82F6' },
      { name: 'Workshop', description: 'Hands-on learning workshops', icon: '🔧', color: '#10B981' },
      { name: 'Meetup', description: 'Community meetups and networking', icon: '🤝', color: '#F59E0B' },
      { name: 'Social', description: 'Social gatherings and parties', icon: '🎉', color: '#EF4444' },
      { name: 'Sports', description: 'Sports events and competitions', icon: '⚽', color: '#8B5CF6' },
      { name: 'Arts', description: 'Art exhibitions and cultural events', icon: '🎨', color: '#EC4899' },
      { name: 'Music', description: 'Concerts and music events', icon: '🎵', color: '#06B6D4' },
      { name: 'Technology', description: 'Tech talks and hackathons', icon: '💻', color: '#84CC16' },
      { name: 'Education', description: 'Educational events and courses', icon: '📚', color: '#F97316' },
      { name: 'Health & Wellness', description: 'Health and wellness events', icon: '🧘', color: '#14B8A6' }
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert new categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Display inserted categories
    insertedCategories.forEach(category => {
      console.log(`  - ${category.icon} ${category.name}: ${category.description}`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
  }
};

// Main function
const main = async () => {
  console.log('🌱 Starting category seeding...');
  await connectDB();
  await seedCategories();
  await mongoose.disconnect();
  console.log('✅ Category seeding completed');
  process.exit(0);
};

main().catch(console.error);
