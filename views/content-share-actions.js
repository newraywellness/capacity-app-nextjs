import { BASE } from '../lib/theme.js'
export function ContentShareActions({ctx,source}) {
  if(!ctx.openCommunityComposer&&!ctx.openReverieFromContent)return null
  const style={flex:1,padding:'10px 8px',borderRadius:13,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontSize:11,fontWeight:700,cursor:'pointer'}
  return <div style={{display:'flex',gap:8,marginTop:10}}>
    {ctx.openReverieFromContent&&<button type="button" onClick={e=>{e.stopPropagation();ctx.openReverieFromContent(source)}} style={style}>＋ My Reverie</button>}
    {ctx.openCommunityComposer&&<button type="button" onClick={e=>{e.stopPropagation();ctx.openCommunityComposer(source)}} style={style}>Share what I tried</button>}
  </div>
}
