// Migration script to update existing users with email verification fields
require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

async function migrateExistingUsers() {
    const uri = process.env.MONGODB_URI
    const dbName = process.env.MONGODB_DB || 'unicom'

    if (!uri) {
        console.error('❌ MONGODB_URI not found in .env.local')
        process.exit(1)
    }

    const client = new MongoClient(uri)

    try {
        console.log('🔄 Connecting to MongoDB...')
        await client.connect()
        console.log('✅ Connected successfully')

        const db = client.db(dbName)
        const users = db.collection('users')

        // Count total users
        const totalUsers = await users.countDocuments()
        console.log(`\n📊 Found ${totalUsers} total users`)

        // Count users without email_verified field
        const unmigratedUsers = await users.countDocuments({ email_verified: { $exists: false } })
        console.log(`📊 Found ${unmigratedUsers} users to migrate`)

        if (unmigratedUsers === 0) {
            console.log('✅ All users already migrated!')
            return
        }

        // Update all existing users
        const result = await users.updateMany(
            { email_verified: { $exists: false } },
            {
                $set: {
                    email_verified: true, // Mark existing users as verified
                },
                $unset: {
                    verification_token: '',
                    verification_expires: '',
                },
            }
        )

        console.log(`\n✅ Migration completed!`)
        console.log(`   - Modified: ${result.modifiedCount} users`)
        console.log(`   - Matched: ${result.matchedCount} users`)

        // Verify migration
        const verifiedCount = await users.countDocuments({ email_verified: true })
        console.log(`\n📊 Final stats:`)
        console.log(`   - Total users: ${totalUsers}`)
        console.log(`   - Verified users: ${verifiedCount}`)
    } catch (error) {
        console.error('❌ Error during migration:', error)
        process.exit(1)
    } finally {
        await client.close()
        console.log('\n🔌 Database connection closed')
    }
}

// Run migration
migrateExistingUsers()
    .then(() => {
        console.log('\n✅ Migration script completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Migration script failed:', error)
        process.exit(1)
    })
