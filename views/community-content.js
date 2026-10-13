import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BASE } from '../lib/theme.js'
import { resolveContentSource, sourceKey } from '../lib/community-content.js'
import { renderBloom } from './bloom.js'
import { renderTrain } from './train.js'
import { renderNourish } from './nourish.js'
import { renderRebuild } from './rebuild.js'

export function CommunityContentView({ctx,source,onClose,backLabel='Community'}) {
  const [target,setTarget]=useState(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0)
  const [local,setLocal]=useState({})
  useEffect(()=>{
    let cancelled=false;setTarget(null);setError('')
    resolveContentSource(source).then(result=>{
      if(cancelled)return
      setTarget(result)
      const program=result.parent||result.row
      setLocal({rebuildActiveProgram:['rebuild','rebuild_experience'].includes(result.source.type)?`studio-${program.id}`:null,rebuildDynamicExpId:result.source.type==='rebuild_experience'?result.row.id:null,rebuildView:result.source.type==='rebuild_experience'?'dynamic-exp':'dynamic-intro',rebuildCapPick:null,rebuildStartWarning:null})
    }).catch(e=>{if(!cancelled)setError(e.message||'This content could not load.')})
    return ()=>{cancelled=true}
  },[source.table,source.contentId,source.type,attempt])
  useEffect(()=>{
    if(typeof document==='undefined')return
    const previous=document.body.style.overflow;document.body.style.overflow='hidden'
    return ()=>{document.body.style.overflow=previous}
  },[])
  if(typeof document==='undefined')return null
  const type=target?.source.type||source.type
  const backgrounds={bloom:'#F4F8FB',move:'#FFF6EF',nourish:'#FFFBEF',rebuild:'#FFF4F6',rebuild_experience:'#FFF4F6',feel_better:'#FFF4F6',ritual:'#FFF4F6'}
  const setField=key=>value=>setLocal(previous=>({...previous,[key]:typeof value==='function'?value(previous[key]):value}))
  let body=null
  if(target){
    const {row,parent,experiences}=target
    const locked=!!(row.is_premium||parent?.is_premium)&&!ctx.rebuildPlus
    const linked={...ctx,...local,communityContentId:String(row.id),communityContentType:type,
      bloomArticle:null,bloomCard:null,bloomPillar:null,bloomSearchOpen:false,feedMoodFilter:null,feedTimeFilter:null,feedRotation:0,
      moveCategory:null,moveMood:null,moveTime:null,moveSearch:'',
      nourishView:'today',planView:null,mealFilter:null,mealType:null,
      rebuildCurrent:ctx.rebuildCurrent||[],rebuildSaved:ctx.rebuildSaved||[],rebuildProgressRows:ctx.rebuildProgressRows||[],
      setRebuildActiveProgram:value=>{if(value===null){onClose();return}setField('rebuildActiveProgram')(value)},
      setRebuildView:setField('rebuildView'),setRebuildDynamicExpId:setField('rebuildDynamicExpId'),setRebuildCapPick:setField('rebuildCapPick'),setRebuildStartWarning:setField('rebuildStartWarning'),
    }
    if(locked)body=<div style={{padding:'24px 22px'}}><div style={{fontSize:11,fontWeight:800,color:'#A84E7D'}}>True Reverie +</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,color:BASE.cream,marginTop:10}}>{row.title}</div><p style={{fontSize:13,color:BASE.taupe,lineHeight:1.6}}>This experience is part of True Reverie +.</p></div>
    else if(type==='bloom')body=renderBloom({...linked,tab:'bloom',supabaseBloomRows:[row]})
    else if(type==='move')body=renderTrain({...linked,tab:'body',bodyView:'gym',supabaseMoveRows:[row]})
    else if(type==='nourish')body=renderNourish({...linked,tab:'body',bodyView:'nourish',supabaseNourishRows:[row],savedFoods:ctx.isSavedBloom?.(sourceKey(target.source))?[{id:'nr:'+row.title}]:[],toggleFavorite:()=>ctx.toggleSaveBloom?.(sourceKey(target.source),{contentType:'nourish',title:row.title,image:row.image_url||null})})
    else body=renderRebuild({...linked,tab:'rebuild',supabaseRebuildRows:parent?[parent]:(type==='rebuild'?[row]:[]),supabaseRebuildExperiences:experiences,supabaseFeelBetterRows:type==='feel_better'?[row]:[],supabaseRitualRows:type==='ritual'?[row]:[]})
  }
  return createPortal(<div role="dialog" aria-modal="true" aria-label="Linked True Reverie content" style={{position:'fixed',inset:0,zIndex:150,overflowY:'auto',overscrollBehavior:'contain',background:backgrounds[type]||BASE.bg}}><div style={{maxWidth:440,margin:'0 auto',paddingBottom:'calc(24px + env(safe-area-inset-bottom))'}}>
    <div style={{position:'sticky',top:0,zIndex:2,padding:'16px 18px',background:backgrounds[type]||BASE.bg,borderBottom:`1px solid ${BASE.border}`}}><button type="button" onClick={onClose} style={{border:'none',background:'transparent',color:BASE.taupe,fontSize:13,fontWeight:700}}>‹ Back to {backLabel}</button></div>
    {!target&&!error&&<div role="status" style={{padding:35,textAlign:'center',fontSize:13,color:BASE.taupe}}>Opening this discovery…</div>}
    {error&&<div role="alert" style={{padding:30,textAlign:'center',color:BASE.taupe,fontSize:13,lineHeight:1.6}}>{error}<button onClick={()=>setAttempt(n=>n+1)} style={{display:'block',margin:'16px auto',padding:'10px 20px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D'}}>Try again</button></div>}
    {body}
  </div></div>,document.body)
}
