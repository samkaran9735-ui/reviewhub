import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://yvpeyxovtemajxhkhqur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cGV5eG92dGVtYWp4aGtocXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDk0MzgsImV4cCI6MjA5MTM4NTQzOH0.CikGUV1nB5uOzvwAGbqytP9sopjoaaoazlbsiY-wzyA'
)