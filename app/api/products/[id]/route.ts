import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise!
    const db = client.db(process.env.MONGODB_DB || "unicom")
    const col = db.collection("products")
    const id = params.id
    const doc = ObjectId.isValid(id)
      ? await col.findOne({ $or: [{ id }, { _id: new ObjectId(id) }] })
      : await col.findOne({ id })
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({
      product: {
        id: doc.id ?? String(doc._id),
        name: doc.name,
        description: doc.description ?? "",
        price: doc.price ?? 0,
        category: doc.category,
        image: doc.image ?? "",
        inStock: doc.inStock ?? true,
        specifications: doc.specifications ?? {},
        brand: doc.brand ?? "",
        rating: doc.rating ?? 0,
        reviews: doc.reviews ?? 0,
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const client = await clientPromise!
    const db = client.db(process.env.MONGODB_DB || "unicom")
    const col = db.collection("products")
    const id = params.id
    const filter = ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id }
    const update: any = { ...body, updatedAt: new Date() }
    delete update._id
    const res = await col.updateOne(filter, { $set: update })
    if (res.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise!
    const db = client.db(process.env.MONGODB_DB || "unicom")
    const col = db.collection("products")
    const id = params.id
    const filter = ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id }
    const res = await col.deleteOne(filter)
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
