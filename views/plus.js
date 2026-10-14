import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BASE } from '../lib/theme.js'
import { subscriptionAdapter } from '../lib/subscriptions.js'

export function PlusPanel({ctx,onClose}) {
  const [busy,setBusy]=useState(''),[message,setMessage]=useState('')
  const busyRef=useRef(false),mounted=useRef(true)
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false}},[])
  const run=async(action)=>{
    if(busyRef.current)return
    busyRef.current=true;setBusy(action);setMessage('')
    try {
      if(action!=='refresh')await subscriptionAdapter[action]()
      const active=await ctx.refreshMembership?.()
      if(mounted.current)setMessage(active?'Your True Reverie+ access is ready.':action==='restore'?'No active membership was found for this account.':action==='refresh'?'Your account access is up to date.':'Your purchase is being checked. Your access will update after confirmation.')
    } catch(e){if(mounted.current)setMessage(e.message||'Your membership could not be checked. Please try again.')}
    finally{busyRef.current=false;if(mounted.current)setBusy('')}
  }
  const member=ctx.rebuildPlus
  const target=ctx.plusTarget
  const continueRebuild=async()=>{
    if(busyRef.current)return
    busyRef.current=true;setBusy('continue');setMessage('')
    try{await ctx.continueRebuildFromPlus?.()}catch(e){if(mounted.current)setMessage(e.message||'Your Rebuild could not open. Please try again.')}
    finally{busyRef.current=false;if(mounted.current)setBusy('')}
  }
  const button={width:'100%',padding:14,borderRadius:999,border:'none',background:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',marginTop:18}
  return <div style={{padding:'30px 22px',color:BASE.cream}}>
    {onClose&&<button onClick={onClose} style={{border:'none',background:'transparent',padding:'0 0 22px',minHeight:44,fontSize:13,fontWeight:700,color:BASE.taupe}}>{target?(target.fromPreview?'‹ Back to my preview':'‹ Back to Rebuild'):'‹ Back'}</button>}
    <div style={{fontSize:11,fontWeight:800,letterSpacing:1.8,color:'#A84E7D'}}>TRUE REVERIE+</div>
    <h1 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:34,fontWeight:600,lineHeight:1.1,margin:'12px 0'}}>{target?target.title:'More room to become her.'}</h1>
    <p style={{fontSize:14,color:BASE.taupe,lineHeight:1.7}}>{target?'Unlock this Rebuild with True Reverie+, then continue into its guided experiences.':'Go deeper with guided Rebuilds and experiences you can make your own, at your own pace.'}</p>
    <div style={{padding:20,borderRadius:22,background:'linear-gradient(135deg,rgba(233,132,180,.14),rgba(168,123,209,.14))',border:`1px solid ${BASE.border}`,marginTop:22}}>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:23,fontWeight:600}}>{ctx.membershipLoading?'Checking your access…':member?'Your membership is active':target?'Your preview is saved':'A little more support, when you want it.'}</div>
      <p style={{fontSize:13,color:BASE.creamDim,lineHeight:1.6,margin:'10px 0 0'}}>{target?(member?'Your Rebuild is ready to continue. Your saved answers come with you.':'You won’t need to start over. Once your membership is confirmed, continue straight into this Rebuild.'):(member?'Your account can open every Rebuild marked True Reverie+. Your progress stays yours.':'True Reverie+ unlocks the Rebuilds marked with +. Free discoveries and your saved moments stay available.')}</p>
    </div>
    <button disabled={!!busy||ctx.membershipLoading} onClick={()=>member&&target?continueRebuild():run(member?'manage':'purchase')} style={{...button,minHeight:48,opacity:busy?.65:1}}>{busy?busy==='restore'?'Restoring…':busy==='continue'?'Opening your Rebuild…':'Opening…':member&&target?'Continue into my Rebuild':member?'Manage membership':target?'Unlock my Rebuild · True Reverie+':'Join True Reverie+'}</button>
    {member&&target&&<button disabled={!!busy} onClick={()=>run('manage')} style={{border:'none',background:'transparent',minHeight:44,fontSize:12,color:BASE.taupe,display:'block',margin:'8px auto'}}>Manage membership</button>}
    <div style={{display:'flex',justifyContent:'center',gap:18,marginTop:18}}><button disabled={!!busy} onClick={()=>run('restore')} style={{border:'none',background:'transparent',fontSize:12,color:BASE.taupe}}>Restore purchases</button><button disabled={!!busy} onClick={()=>run('refresh')} style={{border:'none',background:'transparent',fontSize:12,color:BASE.taupe}}>Check access</button></div>
    {message&&<div role="status" style={{marginTop:18,padding:13,borderRadius:14,background:BASE.surface,border:`1px solid ${BASE.border}`,fontSize:12,lineHeight:1.6,color:BASE.taupe}}>{message}</div>}
    {ctx.membershipError&&<div role="alert" style={{marginTop:14,fontSize:12,lineHeight:1.6,color:'#B9566B'}}>{ctx.membershipError}</div>}
  </div>
}
export function PlusModal({ctx,onClose}) {
  useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return ()=>{document.body.style.overflow=previous}},[])
  if(typeof document==='undefined')return null
  return createPortal(<div role="dialog" aria-modal="true" aria-label="True Reverie Plus membership" style={{position:'fixed',inset:0,zIndex:10000,overflowY:'auto',background:'#FFF4F6'}}><div style={{maxWidth:440,margin:'0 auto',paddingBottom:'env(safe-area-inset-bottom)'}}><PlusPanel ctx={ctx} onClose={onClose}/></div></div>,document.body)
}
