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

export async function getDb() {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB || "unicom-catalog")
}

export async function getUsersCollection() {
  const db = await getDb()
  return db.collection("users")
}

export async function getProductsCollection() {
  const db = await getDb()
  return db.collection("products")
}

export async function getQuotesCollection() {
  const db = await getDb()
  return db.collection("quotes")
}

export async function getTicketsCollection() {
  const db = await getDb()
  return db.collection("tickets")
}
