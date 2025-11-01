import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import { Chatbot } from "@/components/chatbot"
import { Toaster } from "sonner"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Unicom Technologies - Electronics & IT Solutions",
  description:
    "Your trusted local provider for computer parts, accessories, and technical support services. Quality products and personalized service for consumers and businesses.",
  generator: "v0.app",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/><circle cx='12' cy='7' r='1.5'/><circle cx='12' cy='12' r='1.5'/><circle cx='12' cy='17' r='1.5'/></svg>",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Analytics />
            <Chatbot />
            <Toaster />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
