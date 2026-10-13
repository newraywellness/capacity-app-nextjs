import { db } from './supabase'

// Replace these three adapter methods with a native SDK when that is connected.
// Purchase results never unlock content locally: Supabase remains authoritative.
async function billingAction(action) {
  const {data,error}=await db.auth.getSession()
  if(error||!data?.session?.access_token)throw new Error('Sign in to manage your membership.')
  const response=await fetch('/api/true-reverie-plus',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({action})})
  const result=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(result.message||'Membership could not be updated. Please try again.')
  if(result.url){
    const url=new URL(result.url)
    if(url.protocol!=='https:')throw new Error('The membership page could not open. Please try again.')
    window.location.assign(url.href)
  }
  return result
}
export const subscriptionAdapter={
  purchase:()=>billingAction('checkout'),
  restore:()=>billingAction('restore'),
  manage:()=>billingAction('manage'),
}
