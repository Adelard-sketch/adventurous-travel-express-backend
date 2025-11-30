const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adventurous-travel');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');
    
    // Count documents in each collection
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`📊 ${col.name}: ${count} documents`);
      
      // Show sample document
      if (count > 0) {
        const sample = await db.collection(col.name).findOne();
        console.log(`   Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...\n');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
