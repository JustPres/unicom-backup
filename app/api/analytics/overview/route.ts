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

    // Get quote conversion data
    const quotesData = await db.collection('quotes').aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // Get customer data
    const customersData = await db.collection('users').aggregate([
      { $match: { role: 'customer' } },
      { $count: 'total' }
    ]).toArray()

    // Get support tickets data
    const ticketsData = await db.collection('tickets').aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    // For testing - return sample data
    console.log('Using sample data for testing')
    const sampleData = [
      {
        _id: '1',
        name: 'Sample Product 1',
        price: 100,
        quoteCount: 5,
        totalQuotedValue: 500
      },
      {
        _id: '2',
        name: 'Sample Product 2',
        price: 200,
        quoteCount: 3,
        totalQuotedValue: 600
      }
    ]
    
    console.log('Returning sample data response')
    const responseData = {
      sales: {
        daily: [],
        total: 0,
        orderCount: 0
      },
      customers: {
        total: 0,
        newThisMonth: 0
      },
      quotes: {
        byStatus: {},
        total: 0
      },
      tickets: {
        byStatus: {},
        total: 0
      },
      products: {
        mostQuoted: sampleData
      }
    }
    
    console.log('Returning sample data:', JSON.stringify(responseData, null, 2))
    return NextResponse.json(responseData)
    
    // Uncomment below to restore database query
    /*
    // Database diagnostics
    console.log('=== DATABASE DIAGNOSTICS ===')
    console.log('Database name:', db.databaseName)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))
    
    // Check if quotes collection exists
    const quotesCollection = db.collection('quotes')
    const quotesCount = await quotesCollection.estimatedDocumentCount()
    console.log(`Found ${quotesCount} documents in 'quotes' collection`)
    
    let mostQuotedProducts = [];
    
    if (quotesCount > 0) {
      // Get a sample quote to check structure
      const sampleQuote = await quotesCollection.findOne({})
      console.log('Sample quote structure:', JSON.stringify({
        _id: sampleQuote?._id,
        items: sampleQuote?.items?.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price
        }))
      }, null, 2))
      
      console.log('Running aggregation pipeline...')
      mostQuotedProducts = await quotesCollection.aggregate([
        // Unwind the items array to process each product in each quote
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            quoteCount: { $sum: 1 },
            totalQuotedValue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        { $sort: { quoteCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
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
    */

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
        byStatus: quotesData.reduce((acc, item) => ({
          ...acc,
          [item._id]: item.count
        }), {}),
        total: quotesData.reduce((sum, item) => sum + (item.count || 0), 0)
      },
      customers: {
        total: customersData[0]?.total || 0,
        newThisMonth: 0 // Would need registration date in user schema
      },
      tickets: {
        byStatus: ticketsData.reduce((acc, item) => ({
          ...acc,
          [item._id]: item.count
        }), {}),
        total: ticketsData.reduce((sum, item) => sum + (item.count || 0), 0)
      },
      products: {
        mostQuoted: [] // Using empty array as fallback
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
