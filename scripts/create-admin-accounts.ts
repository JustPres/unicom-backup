import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Admin accounts to create
const adminAccounts = [
  {
    name: 'Admin One',
    email: 'admin1@unicom.com',
    password: 'Admin@123',
    role: 'admin' as const,
  },
  {
    name: 'Admin Two',
    email: 'admin2@unicom.com',
    password: 'Admin@123',
    role: 'admin' as const,
  },
  {
    name: 'Admin Three',
    email: 'admin3@unicom.com',
    password: 'Admin@123',
    role: 'admin' as const,
  },
];

async function createAdminAccounts() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB || 'unicom');
    const users = db.collection('users');

    for (const account of adminAccounts) {
      try {
        console.log(`Processing account: ${account.email}`);
        // Check if user already exists
        const existingUser = await users.findOne({ email: account.email });
        
        if (existingUser) {
          console.log(`User ${account.email} already exists. Skipping...`);
          continue;
        }

        // Hash password
        console.log(`Hashing password for ${account.email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(account.password, salt);

        // Create user
        console.log(`Creating account for ${account.email}...`);
        await users.insertOne({
          id: randomUUID(),
          name: account.name,
          email: account.email,
          password_hash: hashedPassword,
          role: account.role,
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log(`✅ Successfully created admin account for ${account.email}`);
      } catch (error) {
        console.error(`❌ Error processing ${account.email}:`, error);
      }
    }

    console.log('\nAdmin account creation process completed');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
console.log('Starting admin account creation...');
createAdminAccounts()
  .then(() => console.log('Script finished'))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
