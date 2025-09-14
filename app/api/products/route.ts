import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { z } from "zod"
import { ObjectId } from "mongodb"

const ProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  brand: z.string().min(1),
  image: z.string().optional().default(""),
  inStock: z.boolean().default(true),
  specifications: z.record(z.string()).optional(),
  rating: z.number().min(0).max(5).optional().default(0),
  reviews: z.number().int().nonnegative().optional().default(0),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.toLowerCase() || ""
    const category = searchParams.get("category") || undefined
    const idsParam = searchParams.get("ids") || undefined

    const client = await clientPromise!
    const db = client.db(process.env.MONGODB_DB || "unicom")
    const col = db.collection("products")

    const filter: any = {}
    if (category) filter.category = category
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ]
    }
    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean)
      const objectIds = ids
        .filter((x) => ObjectId.isValid(x))
        .map((x) => new ObjectId(x))
      filter.$or = [
        ...(filter.$or || []),
        { id: { $in: ids } },
        ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
      ]
    }

    const docs = await col.find(filter).sort({ _id: -1 }).toArray()

    return NextResponse.json({ products: docs.map((d) => ({
      id: d.id ?? String(d._id),
      name: d.name,
      description: d.description ?? "",
      price: d.price ?? 0,
      category: d.category,
      image: d.image ?? "",
      inStock: d.inStock ?? true,
      specifications: d.specifications ?? {},
      brand: d.brand ?? "",
      rating: d.rating ?? 0,
      reviews: d.reviews ?? 0,
    })) })
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = ProductSchema.parse(json)

    const client = await clientPromise!
    const db = client.db(process.env.MONGODB_DB || "unicom")
    const col = db.collection("products")

    const now = new Date()
    const toInsert = {
      ...parsed,
      createdAt: now,
      updatedAt: now,
    }

    const result = await col.insertOne(toInsert)
    const id = String(result.insertedId)
    await col.updateOne({ _id: result.insertedId }, { $set: { id } })

    return NextResponse.json({ product: { id, ...parsed } })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
