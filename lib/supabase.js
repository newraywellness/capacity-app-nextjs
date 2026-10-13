import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

const SUPABASE_KEY =
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim() ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

let client

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.'
    )
  }

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY)
  }

  return client
}

// Initialize on first use, rather than during build-time imports.
const db = new Proxy({}, {
  get(_target, property) {
    const active = getClient()
    const value = active[property]

    return typeof value === 'function'
      ? value.bind(active)
      : value
  },
})

export { SUPABASE_URL, SUPABASE_KEY, db }
