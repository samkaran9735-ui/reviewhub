import type { Metadata } from 'next'
import './globals.css'
import HelpWidget from './components/HelpWidget'

export const metadata: Metadata = {
  title: 'GetSmartReviews — Honest Product Reviews & Price Comparison India',
  description: 'Find the best products with honest reviews, price comparison across Flipkart, Amazon, Meesho and more. Smart buying decisions for Indian shoppers.',
  keywords: 'product reviews india, price comparison, flipkart, amazon, best products, honest reviews',
  openGraph: {
    title: 'GetSmartReviews — Honest Product Reviews India',
    description: 'Find the best products with honest reviews and price comparison across all Indian stores.',
    url: 'https://getsmartreviews.in',
    siteName: 'GetSmartReviews',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetSmartReviews — Honest Product Reviews India',
    description: 'Find the best products with honest reviews and price comparison across all Indian stores.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://getsmartreviews.in',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <HelpWidget />
      </body>
    </html>
  )
}