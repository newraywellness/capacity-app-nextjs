import { BASE } from '../lib/theme.js'

export function renderCommunity(ctx) {
  if (ctx.tab !== 'community') return null
  return <div className="fade-in" style={{padding:'28px 18px 40px',color:BASE.cream}}>
    <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:34,fontWeight:600}}>Community</div>
    <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:15,color:BASE.taupe,marginTop:6}}>Less scrolling. More living—together.</div>
    <div style={{marginTop:48,borderRadius:26,padding:'34px 24px',background:'linear-gradient(145deg,#FBEAF2,#EEE8F7)',border:'1px solid #E5D2DE',textAlign:'center'}}>
      <div style={{fontSize:32}}>♡</div>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:600,marginTop:10}}>Built around what women actually do.</div>
      <div style={{fontSize:13,color:BASE.taupe,lineHeight:1.65,marginTop:9}}>Workouts, meals, Rebuild moments, rituals, discoveries, and pieces of real life will be shareable here. For now, My Reverie is ready to collect the moments you may want to share later.</div>
    </div>
  </div>
}
