import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mission Control | PropertyOps AI",
  description: "Real-time monitoring and management for PropertyOps AI agents",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Skip to content link for keyboard accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        
        {children}
      </body>
    </html>
  )
}
