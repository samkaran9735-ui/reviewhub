import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await supabase.from('products').select('id, created_at')

  const productUrls = (products || []).map(p => ({
    url: `https://getsmartreviews.in/product/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://getsmartreviews.in',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://getsmartreviews.in/browse',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://getsmartreviews.in/compare',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://getsmartreviews.in/submit-review',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productUrls,
  ]
}