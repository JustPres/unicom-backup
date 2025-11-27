import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { searchProducts, getProductById } from "@/lib/products"
import { quotes } from "@/lib/quotes"
import { supportTickets } from "@/lib/tickets"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const searchProductsTool = {
    name: "searchProducts",
    description: "Search for products by keyword",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: "Search term",
            },
        },
        required: ["query"],
    },
}

const getProductDetailsTool = {
    name: "getProductDetails",
    description: "Get detailed product specs",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            productId: {
                type: SchemaType.STRING,
                description: "Product ID",
            },
        },
        required: ["productId"],
    },
}

const getMyQuotesTool = {
    name: "getMyQuotes",
    description: "Get user quotes",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: [],
    },
}

const getMyTicketsTool = {
    name: "getMyTickets",
    description: "Get user support tickets",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: [],
    },
}

export async function POST(req: Request) {
    try {
        const { message, history, user } = await req.json()

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
        }

        let activeTools: any[] = [searchProductsTool, getProductDetailsTool]

        if (user?.email) {
            activeTools = [searchProductsTool, getProductDetailsTool, getMyQuotesTool, getMyTicketsTool]
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: "You are a helpful assistant for Unicom. Always answer questions clearly.",
            tools: [{ functionDeclarations: activeTools }] as any,
        })

        let validHistory = history.map((msg: any) => (

            {
                role: msg.isBot ? "model" : "user",
                parts: [{ text: msg.text }],
            }))

        if (validHistory.length > 0 && validHistory[0].role === "model") {
            validHistory = validHistory.slice(1)
        }

        const chat = model.startChat({ history: validHistory })

        const result = await chat.sendMessage(message)
        const response = result.response
        const calls = response.functionCalls?.() || null

        let finalText = ""
        let productsFound: any[] = []

        if (calls && calls.length > 0) {
            const call = calls[0]
            const functionResponseParts = []

            if (call.name === "searchProducts") {
                productsFound = await searchProducts((call.args as any).query)
                functionResponseParts.push({
                    functionResponse: {
                        name: "searchProducts",
                        response: { products: productsFound },
                    },
                })
            } else if (call.name === "getProductDetails") {
                const product = await getProductById((call.args as any).productId)
                if (product) productsFound = [product]
                functionResponseParts.push({
                    functionResponse: {
                        name: "getProductDetails",
                        response: { product: product || {} },
                    },
                })
            } else if (call.name === "getMyQuotes") {
                const userQuotes = user?.email ? quotes.filter(q => q.customerEmail === user.email) : []
                functionResponseParts.push({
                    functionResponse: {
                        name: "getMyQuotes",
                        response: { quotes: userQuotes },
                    },
                })
            } else if (call.name === "getMyTickets") {
                const userTickets = user?.email ? supportTickets.filter(t => t.customerEmail === user.email) : []
                functionResponseParts.push({
                    functionResponse: {
                        name: "getMyTickets",
                        response: { tickets: userTickets },
                    },
                })
            }

            if (functionResponseParts.length > 0) {
                const finalResult = await chat.sendMessage(functionResponseParts)
                finalText = finalResult.response.text?.() || "Here's what I found."
            }
        } else {
            finalText = response.text?.() || "How can I help you today?"
        }

        return NextResponse.json({
            text: finalText,
            products: productsFound.slice(0, 3)
        })

    } catch (error) {
        console.error("Chat API Error:", error)
        return NextResponse.json(
            { text: "I'm here to help! Ask me anything about our products." },
            { status: 200 }
        )
    }
}
