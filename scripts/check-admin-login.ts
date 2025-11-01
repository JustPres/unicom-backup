import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkAdminLogin() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'unicom');
    const users = db.collection('users');
    
    // Check admin1@unicom.com
    const email = 'admin1@unicom.com';
    const password = 'Admin@123';
    
    console.log(`\n🔍 Checking account: ${email}`);
    const user = await users.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found in database');
    console.log(`🔑 Password hash: ${user.password_hash ? '✅ Exists' : '❌ Missing'}`);
    console.log(`👤 Role: ${user.role}`);
    
    // Test password verification
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      console.log(`🔐 Password verification: ${isMatch ? '✅ Success' : '❌ Failed'}`);
      
      if (!isMatch) {
        console.log('\n⚠️  Possible issues:');
        console.log('1. The password in the script does not match the hashed password');
        console.log('2. The password was not hashed correctly during account creation');
        console.log('3. The password was changed or corrupted');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the check
console.log('🔍 Starting admin login check...');
checkAdminLogin().catch(console.error);
