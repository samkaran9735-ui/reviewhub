import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GetSmartReviews — Find the best products',
  description: 'Honest reviews, price comparison and buy now links across all stores in India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}