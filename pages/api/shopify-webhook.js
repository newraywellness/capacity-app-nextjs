import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const config={api:{bodyParser:false}}

// Retained for existing Library purchases, not used as the new subscription API.
export default async function handler(req,res) {
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  const secret=process.env.SHOPIFY_WEBHOOK_SECRET
  if(!secret)return res.status(503).json({error:'Webhook not configured'})
  try {
    const chunks=[];let size=0
    for await(const chunk of req){size+=chunk.length;if(size>2*1024*1024)return res.status(413).json({error:'Payload too large'});chunks.push(Buffer.from(chunk))}
    const raw=Buffer.concat(chunks)
    const signature=Buffer.from(String(req.headers['x-shopify-hmac-sha256']||''),'base64')
    const expected=createHmac('sha256',secret).update(raw).digest()
    if(signature.length!==expected.length||!timingSafeEqual(signature,expected))return res.status(401).json({error:'Invalid signature'})
    let order
    try{order=JSON.parse(raw.toString('utf8'))}catch(e){return res.status(400).json({error:'Invalid payload'})}
    if(order.financial_status!=='paid')return res.status(200).json({ok:true,ignored:true})
    const email=String(order.email||order.contact_email||order.customer?.email||'').trim().toLowerCase()
    const boughtLibrary=Array.isArray(order.line_items)&&order.line_items.some(item=>String(item.title||'').toLowerCase().includes('library'))
    if(!email||!boughtLibrary)return res.status(200).json({ok:true,ignored:true})
    const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
    const key=process.env.SUPABASE_SERVICE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
    if(!url||!key)return res.status(503).json({error:'Webhook not configured'})
    const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
    const literal=email.replace(/[\\%_]/g,c=>'\\'+c)
    const {data,error}=await admin.from('profiles').update({has_membership:true}).ilike('email',literal).select('id')
    if(error)throw error
    if(data?.length)return res.status(200).json({ok:true,granted:true})
    const pending=await admin.from('pending_memberships').upsert({email},{onConflict:'email'})
    if(pending.error)throw pending.error
    return res.status(200).json({ok:true,pending:true})
  } catch(e){console.error('Verified Shopify webhook failed:',e);return res.status(500).json({error:'Webhook processing failed'})}
}
