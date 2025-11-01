import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdminAccounts() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Checking admin accounts in the database...');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'unicom');
    const users = db.collection('users');
    
    // Find all admin users
    const adminUsers = await users.find({ role: 'admin' }).toArray();
    
    if (adminUsers.length === 0) {
      console.log('ℹ️ No admin users found in the database');
    } else {
      console.log(`\n👥 Found ${adminUsers.length} admin accounts:`);
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.created_at || 'Unknown'}`);
      });
    }
    
    // Check if we can find the specific admin accounts we created
    const emails = ['admin1@unicom.com', 'admin2@unicom.com', 'admin3@unicom.com'];
    console.log('\n🔍 Checking for specific admin accounts...');
    
    for (const email of emails) {
      const user = await users.findOne({ email });
      if (user) {
        console.log(`✅ Found: ${email} (${user.role})`);
        console.log(`   Password hash: ${user.password_hash ? '✅ Exists' : '❌ Missing'}`);
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking admin accounts:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the check
checkAdminAccounts()
  .then(() => console.log('\n✨ Check completed'))
  .catch(console.error);
