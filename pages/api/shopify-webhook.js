import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const order = req.body || {}

    // 1. Get the buyer's email, cleaned up (lowercase + no stray spaces)
    const rawEmail =
      order.email ||
      order.contact_email ||
      (order.customer && order.customer.email) ||
      ''
    const email = String(rawEmail).trim().toLowerCase()

    // 2. Did this order include the Library? (so we skip hoodie-only orders)
    const items = order.line_items || []
    const boughtLibrary = items.some((li) =>
      String(li.title || '').toLowerCase().includes('library')
    )

    // This shows up in your Vercel logs so we can see exactly what happened
    console.log('WEBHOOK received:', JSON.stringify({
      email,
      itemTitles: items.map((li) => li.title),
      boughtLibrary,
    }))

    if (!email) {
      console.log('WEBHOOK: order had no email, skipping')
      return res.status(200).json({ ok: true, note: 'no email' })
    }

    if (!boughtLibrary) {
      console.log('WEBHOOK: no Library item in order, skipping')
      return res.status(200).json({ ok: true, note: 'no library item' })
    }

    // 3. Flip an existing account (case-insensitive email match)
    const { data, error } = await supabase
      .from('profiles')
      .update({ has_membership: true })
      .ilike('email', email)
      .select()

    if (error) {
      console.log('WEBHOOK: supabase error:', error.message)
      return res.status(200).json({ ok: false, error: error.message })
    }

    if (data && data.length > 0) {
      console.log('WEBHOOK: GRANTED membership to', email)
      return res.status(200).json({ ok: true, granted: true })
    }

    // 4. No account yet — remember them so they unlock when they sign up
    const { error: pErr } = await supabase
      .from('pending_memberships')
      .upsert({ email }, { onConflict: 'email' })

    if (pErr) {
      console.log('WEBHOOK: pending table note:', pErr.message)
    } else {
      console.log('WEBHOOK: no account yet, saved as pending for', email)
    }

    return res.status(200).json({ ok: true, pending: true })
  } catch (err) {
    console.log('WEBHOOK: unexpected error:', err.message)
    return res.status(200).json({ ok: false, error: err.message })
  }
}
