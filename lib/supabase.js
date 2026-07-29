import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://gidezdugmwtemohkkeyr.supabase.co"

const SUPABASE_KEY = "sb_publishable_bmt_uXzHvBlMTBpvkkRJPA_VpsEfPnp"

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

export { SUPABASE_URL, SUPABASE_KEY, db }
