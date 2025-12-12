/**
 * Seed script to populate the database with sample data
 * Run: node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Sweet } = require('./models');

const sampleSweets = [
  {
    name: 'Belgian Dark Chocolate',
    category: 'chocolate',
    price: 250,
    quantity: 50,
    description: 'Rich and smooth dark chocolate imported from Belgium'
  },
  {
    name: 'Assorted Gummy Bears',
    category: 'candy',
    price: 80,
    quantity: 100,
    description: 'Colorful fruity gummy bears in multiple flavors'
  },
  {
    name: 'Red Velvet Cake Slice',
    category: 'cake',
    price: 150,
    quantity: 20,
    description: 'Classic red velvet with cream cheese frosting'
  },
  {
    name: 'Chocolate Chip Cookies',
    category: 'cookie',
    price: 120,
    quantity: 40,
    description: 'Fresh baked cookies with premium chocolate chips'
  },
  {
    name: 'Vanilla Ice Cream Tub',
    category: 'ice-cream',
    price: 200,
    quantity: 30,
    description: 'Creamy vanilla ice cream made with real vanilla beans'
  },
  {
    name: 'Butter Croissant',
    category: 'pastry',
    price: 90,
    quantity: 25,
    description: 'Flaky French croissant with rich butter layers'
  },
  {
    name: 'Gulab Jamun',
    category: 'traditional',
    price: 60,
    quantity: 80,
    description: 'Soft milk dumplings soaked in rose-flavored sugar syrup'
  },
  {
    name: 'Kaju Katli',
    category: 'traditional',
    price: 350,
    quantity: 40,
    description: 'Premium cashew fudge with silver foil'
  },
  {
    name: 'Rainbow Lollipop',
    category: 'candy',
    price: 30,
    quantity: 150,
    description: 'Giant swirly lollipop with rainbow colors'
  },
  {
    name: 'Strawberry Cheesecake',
    category: 'cake',
    price: 180,
    quantity: 15,
    description: 'Creamy cheesecake topped with fresh strawberries'
  },
  {
    name: 'Mango Ice Cream',
    category: 'ice-cream',
    price: 180,
    quantity: 25,
    description: 'Refreshing mango ice cream made with Alphonso mangoes'
  },
  {
    name: 'Chocolate Truffle Box',
    category: 'chocolate',
    price: 400,
    quantity: 20,
    description: 'Assorted chocolate truffles in a gift box'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Sweet.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👤 Created admin user (username: admin, password: admin123)');

    // Create regular user
    const regularUser = new User({
      username: 'user',
      password: 'user123',
      role: 'user'
    });
    await regularUser.save();
    console.log('👤 Created regular user (username: user, password: user123)');

    // Create sweets
    await Sweet.insertMany(sampleSweets);
    console.log(`🍬 Created ${sampleSweets.length} sample sweets`);

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   User:  username=user, password=user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
