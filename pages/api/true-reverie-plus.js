import { createClient } from '@supabase/supabase-js'

// Provider connection point. A trusted billing bridge handles the real provider
// and owns the complete purchase/cancellation/expiry lifecycle.
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='POST')return res.status(405).json({message:'Method not allowed.'})
  const action=req.body?.action
  if(!['checkout','restore','manage'].includes(action))return res.status(400).json({message:'Unknown membership action.'})
  const token=String(req.headers.authorization||'').match(/^Bearer (.+)$/i)?.[1]
  if(!token)return res.status(401).json({message:'Sign in to manage your membership.'})
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key)return res.status(503).json({message:'Membership is temporarily unavailable.'})
  try {
    const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
    const {data,error}=await admin.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({message:'Please sign in again to manage your membership.'})
    const endpoint=process.env.TR_PLUS_BILLING_API_URL,secret=process.env.TR_PLUS_BILLING_API_SECRET
    if(!endpoint||!secret)return res.status(503).json({message:'Subscriptions are not available yet. Your free access is unchanged.'})
    if(new URL(endpoint).protocol!=='https:')return res.status(503).json({message:'Membership is temporarily unavailable.'})
    const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({action,userId:data.user.id,email:data.user.email||null,returnUrl:process.env.TR_PLUS_RETURN_URL||null}),signal:AbortSignal.timeout(15000)})
    if(!response.ok)return res.status(502).json({message:'Your membership could not be updated. Please try again.'})
    const result=await response.json()
    if(action==='restore'){
      if(typeof result.has_membership!=='boolean')return res.status(502).json({message:'Your purchase could not be verified yet.'})
      const {error:updateError}=await admin.from('profiles').update({has_membership:result.has_membership}).eq('id',data.user.id).select('id').single()
      if(updateError)throw updateError
      return res.status(200).json({ok:true})
    }
    if(!result.url||new URL(result.url).protocol!=='https:')return res.status(502).json({message:'The membership page could not open. Please try again.'})
    return res.status(200).json({url:result.url})
  } catch(e){console.error('True Reverie+ action failed:',e);return res.status(502).json({message:'Membership could not be updated. Please try again.'})}
}
