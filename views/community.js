import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BASE } from '../lib/theme.js'

const PEOPLE = {
  maya:{name:'Maya',handle:'@maya.lives',initial:'M',bio:'Finding little ways to make ordinary life feel like mine again.',gradient:'linear-gradient(135deg,#DDA6C4,#8E6DB2)'},
  jess:{name:'Jess',handle:'@jessoutside',initial:'J',bio:'Outside, baking something, or making the house cozy.',gradient:'linear-gradient(135deg,#E1A36D,#B76F91)'},
  nia:{name:'Nia',handle:'@nia.moves',initial:'N',bio:'Movement that makes me feel better, not punished.',gradient:'linear-gradient(135deg,#7FA89B,#8A79B6)'},
  claire:{name:'Claire',handle:'@clairemakes',initial:'C',bio:'Making things, trying things, romanticizing Tuesday.',gradient:'linear-gradient(135deg,#B77C98,#D6A778)'},
}

const SEED_POSTS = [
  {id:'p1',user:'maya',source:{icon:'🌱',label:'Feel Like Yourself Again · Experience 12',type:'Rebuild'},caption:'Apparently getting dressed just to go get coffee actually DOES make me feel human. Tiny thing, huge difference today.',likes:37,comments:[{name:'Jess',text:'This is exactly the kind of reminder I needed today.'},{name:'Nia',text:'The tiny things count so much.'}],tags:['rebuild','self-care','coffee','glow'],image:'linear-gradient(145deg,#D9B5C8 0%,#8F6C89 48%,#5C455E 100%)'},
  {id:'p2',user:'jess',source:{icon:'🌸',label:'Apple Orchard Afternoon',type:'Bloom'},caption:'Took the kids after saving this forever. Cider, donuts, sticky hands, absolutely worth it. 🍎',likes:51,comments:[{name:'Claire',text:'Okay adding this to my weekend immediately.'}],tags:['bloom','outside','family','seasonal'],image:'linear-gradient(145deg,#D9A26C 0%,#9B6B52 50%,#65755A 100%)'},
  {id:'p3',user:'nia',source:{icon:'💪',label:'20 Minute Strength',type:'Move'},caption:'Did not want a “workout.” Wanted to feel less stuck in my body. Twenty minutes was perfect.',likes:42,comments:[{name:'Maya',text:'Love this way of looking at movement.'}],tags:['body','movement','energy'],image:'linear-gradient(145deg,#A9C1B4 0%,#6E8F85 48%,#485F60 100%)'},
  {id:'p4',user:'claire',source:{icon:'✨',label:'The Everything Shower',type:'Ritual'},caption:'Clean sheets + the entire shower production + perfume before bed. I feel like a person again 😂',likes:68,comments:[{name:'Maya',text:'The clean sheets are ESSENTIAL.'},{name:'Jess',text:'You influenced me. Doing this tonight.'}],tags:['ritual','glow','self-care'],image:'linear-gradient(145deg,#DABBD1 0%,#B98FB7 48%,#7E6B9A 100%)'},
  {id:'p5',user:'jess',source:null,caption:'Made the lemon loaf, opened the windows, and ignored the laundry for an hour. Excellent decision.',likes:29,comments:[],tags:['food','home','bloom'],image:'linear-gradient(145deg,#E6D2A0 0%,#C9B277 48%,#A28662 100%)'},
]

const ATTACHMENTS = [
  ['🌸','Bloom discovery'],['🌱','Rebuild experience'],['✨','Ritual'],['💪','Movement'],['🍽️','Recipe or meal']
]

const Avatar = ({person,size=38}) => <div style={{width:size,height:size,borderRadius:'50%',background:person.gradient,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Cormorant Garamond', serif",fontWeight:700,fontSize:size*.43,flexShrink:0}}>{person.initial}</div>
const IconButton = ({children,onClick,active}) => <button onClick={onClick} style={{border:'none',background:'transparent',padding:'5px 4px',fontSize:20,color:active?'#C9558E':BASE.creamDim,cursor:'pointer'}}>{children}</button>

function CommunityApp({ctx}) {
  const { firstName, setupData } = ctx
  const [feed,setFeed] = useState('foryou')
  const [screen,setScreen] = useState({type:'feed'})
  const [liked,setLiked] = useState([])
  const [saved,setSaved] = useState([])
  const [following,setFollowing] = useState(['maya','jess'])
  const [posts,setPosts] = useState(SEED_POSTS)
  const [caption,setCaption] = useState('')
  const [attachment,setAttachment] = useState(null)
  const [comment,setComment] = useState('')
  const [commentPost,setCommentPost] = useState(null)
  const [menuPost,setMenuPost] = useState(null)

  const interests = useMemo(()=>{
    const raw=[...(setupData?.interests||[]),...(setupData?.goals||[]),...(setupData?.desires||[])].join(' ').toLowerCase()
    return raw
  },[setupData])
  const ranked = useMemo(()=>{
    if(feed==='following') return posts.filter(p=>following.includes(p.user))
    return [...posts].sort((a,b)=>{
      const score=p=>p.tags.reduce((n,t)=>n+(interests.includes(t)?2:0),0)+(liked.includes(p.id)?1:0)+(following.includes(p.user)?.5:0)
      return score(b)-score(a)
    })
  },[posts,feed,following,liked,interests])

  const toggle=(setter,list,id)=>setter(list.includes(id)?list.filter(x=>x!==id):[...list,id])
  const openProfile=(key)=>setScreen({type:'profile',user:key})
  const openComments=(id)=>{ setComment(''); setCommentPost(id) }
  const addComment=(id)=>{if(!comment.trim())return;setPosts(posts.map(p=>p.id===id?{...p,comments:[...p.comments,{name:firstName||'You',text:comment.trim()}]}:p));setComment('')}
  const publish=()=>{if(!caption.trim())return;const id='mine-'+Date.now();setPosts([{id,user:'me',source:attachment?{icon:attachment[0],label:attachment[1],type:attachment[1]}:null,caption:caption.trim(),likes:0,comments:[],tags:['personal'],image:'linear-gradient(145deg,#DDB9CB,#A989B7,#7C6B91)',mine:true},...posts]);setCaption('');setAttachment(null);setScreen({type:'feed'})}
  const personFor=(p)=>p.mine?{name:firstName||'You',handle:'@yourreverie',initial:(firstName||'Y')[0].toUpperCase(),bio:'Building a life that feels like mine.',gradient:'linear-gradient(135deg,#D86FA6,#A87BD1)'}:PEOPLE[p.user]

  const Back=({label='Community'})=><div onClick={()=>setScreen({type:'feed'})} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:'pointer',marginBottom:17}}>‹ {label}</div>
  const Source=({source})=>source?<div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 9px',borderRadius:999,background:'rgba(201,123,168,.10)',color:'#A84E7D',fontSize:10.5,fontWeight:800,marginTop:9}}><span>{source.icon}</span>{source.label}</div>:null

  const PostCard=({p,detail=false})=>{const person=personFor(p);const isLike=liked.includes(p.id);return <div style={{background:BASE.surface,border:`1px solid ${BASE.border}`,borderRadius:22,overflow:'hidden',marginBottom:18,boxShadow:'0 8px 24px rgba(66,40,62,.055)'}}>
    <div style={{padding:'14px 15px 12px',display:'flex',alignItems:'center',gap:10}}><div onClick={()=>!p.mine&&openProfile(p.user)} style={{cursor:p.mine?'default':'pointer'}}><Avatar person={person}/></div><div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:800,color:BASE.cream}}>{person.name}</div><div style={{fontSize:10.5,color:BASE.taupe}}>{person.handle}</div></div><IconButton onClick={()=>setMenuPost(p)}>•••</IconButton></div>
    <div style={{height:detail?310:270,background:p.image,position:'relative'}}><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,.04),rgba(45,25,42,.08))'}}/><div style={{position:'absolute',left:16,bottom:14,color:'rgba(255,255,255,.86)',fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:13}}>photo placeholder</div></div>
    <div style={{padding:'12px 15px 15px'}}><div style={{display:'flex',alignItems:'center',gap:6}}><IconButton active={isLike} onClick={()=>toggle(setLiked,liked,p.id)}>{isLike?'♥':'♡'}</IconButton><span style={{fontSize:11.5,color:BASE.taupe}}>{p.likes+(isLike?1:0)}</span><IconButton onClick={()=>openComments(p.id)}>💬</IconButton><span style={{fontSize:11.5,color:BASE.taupe}}>{p.comments.length}</span><div style={{flex:1}}/><IconButton active={saved.includes(p.id)} onClick={()=>toggle(setSaved,saved,p.id)}>{saved.includes(p.id)?'♥':'♡'}</IconButton></div>
      <Source source={p.source}/><div style={{fontSize:13,color:BASE.creamDim,lineHeight:1.55,marginTop:10}}>{p.caption}</div>{!detail&&p.comments.length>0&&<div onClick={()=>openComments(p.id)} style={{fontSize:11.5,color:BASE.taupe,marginTop:10,cursor:'pointer'}}>View {p.comments.length===1?'comment':`all ${p.comments.length} comments`}</div>}</div>
  </div>}

  if(screen.type==='create') return <div className="fade-in" style={{padding:'10px 18px 0'}}><Back/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream}}>Share something from your life</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:14.5,color:BASE.taupe,marginTop:6}}>A little moment, something you tried, or something worth passing on.</div>
    <div style={{marginTop:22,height:190,borderRadius:20,border:`1px dashed ${BASE.border}`,background:'linear-gradient(145deg,rgba(221,185,203,.28),rgba(169,137,183,.22))',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',color:BASE.taupe,fontSize:12}}><div><div style={{fontSize:28,marginBottom:7}}>＋</div>Add photo or video</div></div>
    <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What do you want to remember or share?" style={{width:'100%',minHeight:105,boxSizing:'border-box',marginTop:16,borderRadius:17,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,padding:14,fontFamily:'inherit',fontSize:13,resize:'none',outline:'none'}}/>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',color:BASE.taupe,margin:'20px 0 10px'}}>Add what you did · optional</div><div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:5}}>{ATTACHMENTS.map(a=><button key={a[1]} onClick={()=>setAttachment(attachment?.[1]===a[1]?null:a)} style={{whiteSpace:'nowrap',padding:'9px 12px',borderRadius:999,border:`1px solid ${attachment?.[1]===a[1]?'#C97BA8':BASE.border}`,background:attachment?.[1]===a[1]?'rgba(201,123,168,.12)':BASE.surface,color:attachment?.[1]===a[1]?'#A84E7D':BASE.creamDim,fontSize:11,fontWeight:700}}>{a[0]} {a[1]}</button>)}</div>
    <button onClick={publish} style={{width:'100%',padding:14,borderRadius:999,border:'none',background:caption.trim()?'linear-gradient(135deg,#D86FA6,#A87BD1)':'rgba(180,160,175,.35)',color:'#fff',fontWeight:800,marginTop:24}}>Post</button><div style={{height:60}}/></div>

  const CommentsSheet = () => {
    if (!commentPost || typeof document === 'undefined') return null
    const p = posts.find(x => x.id === commentPost)
    if (!p) return null
    return createPortal(
      <div onClick={()=>{setCommentPost(null);setComment('')}} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(44,31,43,.30)',display:'flex',alignItems:'flex-end',justifyContent:'center',touchAction:'none'}}>
        <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,height:'62dvh',maxHeight:'680px',minHeight:'390px',borderRadius:'24px 24px 0 0',background:BASE.bg,boxShadow:'0 -12px 40px rgba(45,25,42,.18)',display:'flex',flexDirection:'column',overflow:'hidden',touchAction:'pan-y'}}>
          <div style={{position:'relative',padding:'10px 18px 12px',borderBottom:`1px solid ${BASE.border}`,flexShrink:0}}>
            <div style={{width:38,height:4,borderRadius:999,background:'rgba(120,91,112,.28)',margin:'0 auto 9px'}}/>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,textAlign:'center'}}>Comments</div>
            <button aria-label="Close comments" onClick={()=>{setCommentPost(null);setComment('')}} style={{position:'absolute',right:13,top:15,width:32,height:32,borderRadius:'50%',border:'none',background:BASE.surface,color:BASE.creamDim,fontSize:20,lineHeight:1,cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',WebkitOverflowScrolling:'touch',padding:'8px 18px 16px'}}>
            {p.comments.length===0?<div style={{fontSize:12.5,color:BASE.taupe,fontStyle:'italic',padding:'24px 2px'}}>Be the first to say something.</div>:p.comments.map((c,i)=><div key={i} style={{display:'flex',gap:10,padding:'12px 2px',borderBottom:`1px solid ${BASE.border}`}}><div style={{width:30,height:30,borderRadius:'50%',background:'rgba(201,123,168,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#A84E7D',flexShrink:0}}>{c.name[0]}</div><div><div style={{fontSize:11.5,fontWeight:800,color:BASE.cream}}>{c.name}</div><div style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.45,marginTop:3}}>{c.text}</div></div></div>)}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',padding:'11px 14px',paddingBottom:'calc(11px + env(safe-area-inset-bottom))',borderTop:`1px solid ${BASE.border}`,background:BASE.bg,flexShrink:0}}>
            <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addComment(p.id)}} placeholder="Add a comment…" style={{flex:1,minWidth:0,padding:'11px 13px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,outline:'none',fontSize:12.5}}/>
            <button onClick={()=>addComment(p.id)} style={{border:'none',background:'transparent',color:'#C9558E',fontWeight:800,padding:'10px 4px'}}>Post</button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  if(screen.type==='profile'){const key=screen.user;const person=PEOPLE[key];const mine=posts.filter(p=>p.user===key);const follows=following.includes(key);return <div className="fade-in" style={{padding:'10px 18px 0'}}><Back/><div style={{textAlign:'center',padding:'8px 15px 22px'}}><div style={{display:'flex',justifyContent:'center'}}><Avatar person={person} size={72}/></div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream,marginTop:11}}>{person.name}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:2}}>{person.handle}</div><div style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.5,margin:'10px auto 14px',maxWidth:290}}>{person.bio}</div><button onClick={()=>toggle(setFollowing,following,key)} style={{padding:'9px 24px',borderRadius:999,border:follows?`1px solid ${BASE.border}`:'none',background:follows?BASE.surface:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:follows?BASE.creamDim:'#fff',fontWeight:800,fontSize:11}}>{follows?'Following':'Follow'}</button></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>{mine.map(p=><div key={p.id} style={{aspectRatio:'1/1',background:p.image,cursor:'pointer'}}/>)}</div><div style={{height:70}}/></div>}

  return <div className="fade-in" style={{padding:'10px 18px 0'}}><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',paddingRight:44}}><div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:31,fontWeight:600,color:BASE.cream,lineHeight:1.1}}>Community</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:15.5,color:BASE.taupe,marginTop:6}}>Real women, actually living it.</div></div></div>
    <div style={{display:'flex',gap:7,marginTop:18,marginBottom:18}}>{[['foryou','For You'],['following','Following']].map(([k,l])=><button key={k} onClick={()=>setFeed(k)} style={{flex:1,padding:'10px 8px',borderRadius:14,border:`1px solid ${feed===k?'#C97BA8':BASE.border}`,background:feed===k?'rgba(201,123,168,.12)':BASE.surface,color:feed===k?'#A84E7D':BASE.taupe,fontWeight:800,fontSize:11.5}}>{l}</button>)}</div>
    {feed==='foryou'&&<div style={{fontSize:11,color:BASE.taupe,lineHeight:1.5,margin:'-5px 3px 15px'}}>Your feed gets better as True Reverie learns what you save, try, love, and come back to.</div>}
    {ranked.length?ranked.map(p=><PostCard key={p.id} p={p}/>):<div style={{textAlign:'center',padding:'55px 24px',color:BASE.taupe}}><div style={{fontSize:25}}>✨</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,fontWeight:700,color:BASE.cream,marginTop:8}}>Your following feed is quiet</div><div style={{fontSize:12,marginTop:6}}>Follow women whose lives and ideas you want to see more of.</div></div>}
    <button onClick={()=>setScreen({type:'create'})} style={{position:'fixed',right:'max(22px, calc((100vw - 440px)/2 + 22px))',bottom:92,width:54,height:54,borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:'#fff',fontSize:28,lineHeight:1,boxShadow:'0 8px 24px rgba(86,48,82,.24)',zIndex:50}}>+</button>
    <CommentsSheet/>
    {menuPost&&<div onClick={()=>setMenuPost(null)} style={{position:'fixed',inset:0,zIndex:120,background:'rgba(44,31,43,.38)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}><div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,borderRadius:'24px 24px 0 0',background:BASE.bg,padding:'18px 20px 28px'}}><button style={{width:'100%',padding:13,border:'none',background:'transparent',color:BASE.creamDim,fontWeight:700,textAlign:'left'}}>Not interested in posts like this</button><button style={{width:'100%',padding:13,border:'none',background:'transparent',color:BASE.creamDim,fontWeight:700,textAlign:'left'}}>Block this account</button><button style={{width:'100%',padding:13,border:'none',background:'transparent',color:'#B9566B',fontWeight:700,textAlign:'left'}}>Report post</button><button onClick={()=>setMenuPost(null)} style={{width:'100%',padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:8}}>Cancel</button></div></div>}
    <div style={{height:55}}/></div>
}

export function renderCommunity(ctx) {
  if (ctx.tab !== 'community') return null
  return <CommunityApp ctx={ctx}/>
}
