import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { startOfDay, subDays } from 'date-fns'

export async function GET() {
  console.log('Analytics overview endpoint hit')
  try {
    const db = await getDb()
    console.log('Database connection successful')
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
    console.log('Fetching data from', thirtyDaysAgo, 'to', now)

    // Get sales data
    console.log('Querying orders collection...')
    const ordersCount = await db.collection('orders').countDocuments()
    console.log(`Orders collection has ${ordersCount} documents`)
    const salesData = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()
    console.log(`Sales data: ${JSON.stringify(salesData)}`)

    // Get quote conversion data
    console.log('Querying quotes collection...')
    const quotesCount = await db.collection('quotes').countDocuments()
    console.log(`Quotes collection has ${quotesCount} documents`)
    const quotesData = await db.collection('quotes').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    console.log(`Quotes data: ${JSON.stringify(quotesData)}`)

    // Get quote trends over time (for Overview chart)
    const quoteTrends = await db.collection('quotes').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()
    console.log(`Quote trends: ${JSON.stringify(quoteTrends)}`)

    // Get customer data
    console.log('Querying users collection...')
    const usersCount = await db.collection('users').countDocuments()
    console.log(`Users collection has ${usersCount} documents`)
    const customersData = await db.collection('users').aggregate([
      { $match: { role: 'customer' } },
      { $count: 'total' }
    ]).toArray()
    console.log(`Customers data: ${JSON.stringify(customersData)}`)

    // Get customer registration trends over time
    const customerTrends = await db.collection('users').aggregate([
      {
        $match: {
          role: 'customer',
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()
    console.log(`Customer trends: ${JSON.stringify(customerTrends)}`)

    // Get support tickets data
    console.log('Querying tickets collection...')
    const ticketsCount = await db.collection('tickets').countDocuments()
    console.log(`Tickets collection has ${ticketsCount} documents`)
    const ticketsData = await db.collection('tickets').aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    console.log(`Tickets data: ${JSON.stringify(ticketsData)}`)

    // Get ticket creation trends over time
    const ticketTrends = await db.collection('tickets').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()
    console.log(`Ticket trends: ${JSON.stringify(ticketTrends)}`)

    // Database diagnostics
    console.log('=== DATABASE DIAGNOSTICS ===')
    console.log('Database name:', db.databaseName)

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))

    // Check if quotes collection exists
    const quotesCollection = db.collection('quotes')
    const quotesCollectionCount = await quotesCollection.estimatedDocumentCount()
    console.log(`Found ${quotesCollectionCount} documents in 'quotes' collection`)

    let mostQuotedProducts: any[] = [];

    if (quotesCollectionCount > 0) {
      // Get a sample quote to check structure
      const sampleQuote = await quotesCollection.findOne({})
      console.log('Sample quote structure:', JSON.stringify({
        _id: sampleQuote?._id,
        hasItems: !!sampleQuote?.items,
        itemsIsArray: Array.isArray(sampleQuote?.items),
        itemsLength: sampleQuote?.items?.length,
        firstItem: sampleQuote?.items?.[0],
        allItemKeys: sampleQuote?.items?.[0] ? Object.keys(sampleQuote.items[0]) : []
      }, null, 2))

      console.log('Running aggregation pipeline...')
      mostQuotedProducts = await quotesCollection.aggregate([
        // Unwind the items array to process each product in each quote
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            quoteCount: { $sum: 1 },
            totalQuotedValue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } }
          }
        },
        { $sort: { quoteCount: -1 } },
        { $limit: 5 },
        // Convert productId string to ObjectId for the lookup
        {
          $addFields: {
            productObjectId: { $toObjectId: "$_id" }
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "productObjectId",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: "$product._id",
            name: "$product.name",
            price: "$product.price",
            quoteCount: 1,
            totalQuotedValue: 1
          }
        }
      ]).toArray()

      console.log('Most quoted products from database:', {
        count: mostQuotedProducts?.length || 0,
        sample: mostQuotedProducts?.slice(0, 2) // Show first 2 items if available
      })
    } else {
      console.log('No quotes found in the database')
    }

    return NextResponse.json({
      sales: {
        daily: salesData.map(item => ({
          date: item._id,
          total: item.total,
          count: item.count
        })),
        total: salesData.reduce((sum, item) => sum + (item.total || 0), 0),
        orderCount: salesData.reduce((sum, item) => sum + (item.count || 0), 0)
      },
      quotes: {
        daily: quoteTrends.map(item => ({
          date: item._id,
          count: item.count,
          total: item.total
        })),
        byStatus: quotesData.reduce((acc, item) => ({
          ...acc,
          [item._id]: item.count
        }), {}),
        total: quotesData.reduce((sum, item) => sum + (item.count || 0), 0)
      },
      customers: {
        daily: customerTrends.map(item => ({
          date: item._id,
          count: item.count
        })),
        total: customersData[0]?.total || 0,
        newThisMonth: 0 // Would need registration date in user schema
      },
      tickets: {
        daily: ticketTrends.map(item => ({
          date: item._id,
          count: item.count
        })),
        byStatus: ticketsData.reduce((acc, item) => ({
          ...acc,
          [item._id]: item.count
        }), {}),
        total: ticketsData.reduce((sum, item) => sum + (item.count || 0), 0)
      },
      products: {
        mostQuoted: mostQuotedProducts
      }
    })
  } catch (error) {
    console.error('Error in analytics overview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    )
  }
}
