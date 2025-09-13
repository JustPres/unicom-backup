import { MongoClient, type MongoClientOptions } from "mongodb"
import { attachDatabasePool } from "@vercel/functions"

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  appName: "unicom-catalog",
}

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
      _mongoClient?: MongoClient
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClient = client
      globalWithMongo._mongoClientPromise = client.connect()
      attachDatabasePool(client)
    }
    clientPromise = globalWithMongo._mongoClientPromise!
  } else {
    client = new MongoClient(uri, options)
    attachDatabasePool(client)
    clientPromise = client.connect()
  }
}

export default clientPromise

