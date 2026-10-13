import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BASE } from '../lib/theme.js'
import { db } from '../lib/supabase'
import { loadAttachmentCatalog, resolveContentSource, sourceKey, removeCommunityPhoto } from '../lib/community-content.js'

const PEOPLE = {
  maya:{name:'Maya',handle:'@maya.lives',initial:'M',bio:'Finding little ways to make ordinary life feel like mine again.',gradient:'linear-gradient(135deg,#DDA6C4,#8E6DB2)',reverie:['slow mornings','getting dressed','easy dinners','outside more']},
  jess:{name:'Jess',handle:'@jessoutside',initial:'J',bio:'Outside, baking something, or making the house cozy.',gradient:'linear-gradient(135deg,#E1A36D,#B76F91)',reverie:['cozy home','baking','family days','fresh air']},
  nia:{name:'Nia',handle:'@nia.moves',initial:'N',bio:'Movement that makes me feel better, not punished.',gradient:'linear-gradient(135deg,#7FA89B,#8A79B6)',reverie:['strength','energy','long walks','feeling good']},
  claire:{name:'Claire',handle:'@clairemakes',initial:'C',bio:'Making things, trying things, romanticizing Tuesday.',gradient:'linear-gradient(135deg,#B77C98,#D6A778)',reverie:['making things','little luxuries','rituals','ordinary magic']},
}

const SEED_POSTS = [
  {id:'p1',user:'maya',source:{icon:'🌱',label:'Feel Like Yourself Again · Experience 12',type:'Rebuild'},caption:'Apparently getting dressed just to go get coffee actually DOES make me feel human. Tiny thing, huge difference today.',likes:37,comments:[{name:'Jess',text:'This is exactly the kind of reminder I needed today.'},{name:'Nia',text:'The tiny things count so much.'}],tags:['rebuild','self-care','coffee','glow'],image:'linear-gradient(145deg,#D9B5C8 0%,#8F6C89 48%,#5C455E 100%)'},
  {id:'p2',user:'jess',source:{icon:'🌸',label:'Apple Orchard Afternoon',type:'Bloom'},caption:'Took the kids after saving this forever. Cider, donuts, sticky hands, absolutely worth it. 🍎',likes:51,comments:[{name:'Claire',text:'Okay adding this to my weekend immediately.'}],tags:['bloom','outside','family','seasonal'],image:'linear-gradient(145deg,#D9A26C 0%,#9B6B52 50%,#65755A 100%)'},
  {id:'p3',user:'nia',source:{icon:'💪',label:'20 Minute Strength',type:'Move'},caption:'Did not want a “workout.” Wanted to feel less stuck in my body. Twenty minutes was perfect.',likes:42,comments:[{name:'Maya',text:'Love this way of looking at movement.'}],tags:['body','movement','energy'],image:'linear-gradient(145deg,#A9C1B4 0%,#6E8F85 48%,#485F60 100%)'},
  {id:'p4',user:'claire',source:{icon:'✨',label:'The Everything Shower',type:'Ritual'},caption:'Clean sheets + the entire shower production + perfume before bed. I feel like a person again 😂',likes:68,comments:[{name:'Maya',text:'The clean sheets are ESSENTIAL.'},{name:'Jess',text:'You influenced me. Doing this tonight.'}],tags:['ritual','glow','self-care'],image:'linear-gradient(145deg,#DABBD1 0%,#B98FB7 48%,#7E6B9A 100%)'},
  {id:'p5',user:'jess',source:null,caption:'Made the lemon loaf, opened the windows, and ignored the laundry for an hour. Excellent decision.',likes:29,comments:[],tags:['food','home','bloom'],image:'linear-gradient(145deg,#E6D2A0 0%,#C9B277 48%,#A28662 100%)'},
]

const ATTACHMENTS = [
  ['🌸','Bloom','bloom'],['💪','Move','move'],['🍽️','Nourish','nourish'],['🌱','Rebuild','rebuild'],['🤍','Feel Better','feel_better'],['✨','Rituals','ritual']
]

const Avatar = ({person,size=38}) => <div style={{width:size,height:size,borderRadius:'50%',background:person.photo?`url(${person.photo}) ${person.photoPosition?.x??50}% ${person.photoPosition?.y??50}%/cover no-repeat`:person.gradient,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Cormorant Garamond', serif",fontWeight:700,fontSize:size*.43,flexShrink:0,overflow:'hidden'}}>{!person.photo&&person.initial}</div>
const IconButton = ({children,onClick,active,label}) => <button type="button" aria-label={label} onClick={onClick} style={{border:'none',background:'transparent',padding:'5px 4px',fontSize:20,color:active?'#C9558E':BASE.creamDim,cursor:'pointer'}}>{children}</button>

const isVideoMedia=(type,url='')=>String(type||'').startsWith('video/')||/\.(mov|mp4|m4v|webm)(?:[?#]|$)/i.test(url)

// Never fetch/decode a feed video until the user asks to play it.
function CommunityVideo({src}) {
  const videoRef=useRef(null)
  const [active,setActive]=useState(false)
  const [failed,setFailed]=useState(false)
  useEffect(()=>{
    setActive(false);setFailed(false)
    const video=videoRef.current
    return ()=>{if(video){video.pause?.();video.removeAttribute?.('src');video.load?.()}}
  },[src])
  const play=(e)=>{
    e.stopPropagation();setFailed(false);setActive(true)
    const video=videoRef.current
    if(video){video.src=src;const attempt=video.play?.();attempt?.catch?.(()=>{/* Native controls remain available if playback is blocked. */})}
  }
  return <div onClick={e=>e.stopPropagation()} style={{width:'100%',height:'100%',position:'relative',background:'#EEE5ED'}}>
    <video ref={videoRef} src={active?src:undefined} preload="none" controls={active} playsInline onClick={e=>e.stopPropagation()} onError={()=>{setActive(false);setFailed(true)}} style={{width:'100%',height:'100%',objectFit:'contain',display:active?'block':'none'}}/>
    {!active&&<button type="button" onClick={play} style={{position:'absolute',inset:0,border:'none',background:'transparent',color:'#6B435F',fontSize:13,fontWeight:800,cursor:'pointer'}}><span style={{display:'block',fontSize:30,marginBottom:8}}>▶</span>{failed?'Video could not play · try again':'Play video'}</button>}
  </div>
}

class CommunityBoundary extends Component {
  state={failed:false,attempt:0}
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(error,info){console.error('Community render failed:',error,info)}
  render(){
    if(this.state.failed)return <div role="alert" style={{padding:'45px 24px',textAlign:'center',color:BASE.taupe,fontSize:13,lineHeight:1.6}}>Community had trouble displaying this view.<button onClick={()=>this.setState(s=>({failed:false,attempt:s.attempt+1}))} style={{display:'block',margin:'16px auto',padding:'11px 20px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D'}}>Reload Community</button></div>
    return <CommunityApp key={this.state.attempt} ctx={this.props.ctx}/>
  }
}

// Read account collections beyond Supabase's default response row limit.
async function readCommunityRows(buildQuery) {
  const rows=[]
  for(let offset=0;;offset+=1000){
    const {data,error}=await buildQuery().range(offset,offset+999)
    if(error)throw error
    rows.push(...(data||[]))
    if((data||[]).length<1000)return rows
  }
}

const mapCommunityPost=(r,userId,profiles,likeActions,loadedComments,blockedIds)=>({
  id: `real-${r.id}`,
  dbId: r.id,
  user: r.user_id === userId ? 'me' : `user-${r.user_id}`,
  person: (() => {
    const pr=(profiles||[]).find(x=>x.user_id===r.user_id)
    return {
      name: pr?.display_name || r.author_name || 'True Reverie',
      handle: pr?.handle || r.author_handle || '@truereverie',
      photo: pr?.avatar_url || r.author_avatar_url || null,
      photoPosition: pr?.avatar_position || r.author_avatar_position || {x:50,y:50},
      initial: (pr?.display_name || r.author_name || 'T')[0].toUpperCase(),
      gradient:'linear-gradient(135deg,#D86FA6,#A87BD1)',
      bio:pr?.bio||'', reverie:Array.isArray(pr?.reverie)?pr.reverie:[]
    }
  })(),
  source: r.source || null,
  caption: r.caption || '',
  likes: (likeActions || []).filter(a => String(a.post_id) === String(r.id)).length,
  comments: loadedComments.filter(c=>String(c.post_id)===String(r.id)&&!blockedIds.has(c.user_id)).map(c=>({...c,name:(profiles||[]).find(pr=>pr.user_id===c.user_id)?.display_name||c.author_name||'True Reverie',text:c.body})),
  tags: Array.isArray(r.tags) ? r.tags : ['personal'],
  image: r.media_url&&!isVideoMedia(r.media_type,r.media_url) ? `url(${r.media_url}) ${r.media_position?.x??50}% ${r.media_position?.y??50}%/cover no-repeat` : 'linear-gradient(145deg,#DDB9CB,#A989B7,#7C6B91)',
  mediaUrl: r.media_url || null,
  mediaType: r.media_type || null,
  mediaPosition: r.media_position || {x:50,y:50},
  mine: r.user_id === userId,
  real: true
})

function CommunityApp({ctx}) {
  const { firstName, setupData, user } = ctx
  const [feed,setFeed] = useState('foryou')
  const [screen,setScreen] = useState({type:'feed'})
  const [liked,setLiked] = useState([])
  const [saved,setSaved] = useState([])
  const [following,setFollowing] = useState([])
  const [realFollowing,setRealFollowing] = useState([])
  const [socialCounts,setSocialCounts] = useState({})
  const [profileTab,setProfileTab] = useState('posts')
  const [communityProfiles,setCommunityProfiles] = useState({})
  const [posts,setPosts] = useState([])
  const [feedPostIds,setFeedPostIds] = useState([])
  const [profileCollections,setProfileCollections] = useState({})
  const [profileStats,setProfileStats] = useState({})
  const collectionCacheRef = useRef({})
  const statsCacheRef = useRef({})
  const collectionGenerationRef = useRef(0)
  const hiddenIdsRef = useRef(new Set())
  const blockedIdsRef = useRef(new Set())
  const [communityReady,setCommunityReady] = useState(false)
  const [communityError,setCommunityError] = useState('')
  const [loadAttempt,setLoadAttempt] = useState(0)
  const [publishing,setPublishing] = useState(false)
  const publishingRef = useRef(false)
  const [caption,setCaption] = useState('')
  const [attachment,setAttachment] = useState(null)
  const [contentPickerType,setContentPickerType] = useState(null)
  const [attachmentCatalog,setAttachmentCatalog] = useState(null)
  const [attachmentSearch,setAttachmentSearch] = useState('')
  const [attachmentError,setAttachmentError] = useState('')
  const [attachmentAttempt,setAttachmentAttempt] = useState(0)
  const [publishError,setPublishError] = useState('')
  const [comment,setComment] = useState('')
  const [commentPost,setCommentPost] = useState(null)
  const [menuPost,setMenuPost] = useState(null)
  const [blockedAccounts,setBlockedAccounts] = useState([])
  const [blockedOpen,setBlockedOpen] = useState(false)
  const [safetyBusy,setSafetyBusy] = useState(false)
  const [safetyError,setSafetyError] = useState('')
  const [notice,setNotice] = useState('')
  const [reportPost,setReportPost] = useState(null)
  const [reportReason,setReportReason] = useState('spam')
  const [reportDetails,setReportDetails] = useState('')
  const [commentPosting,setCommentPosting] = useState(false)
  const [commentError,setCommentError] = useState('')
  const safetyBusyRef = useRef(false)
  const commentBusyRef = useRef(false)
  const commentSheetRef = useRef(null)
  const [media,setMedia] = useState(null)
  const mediaDragRef = useRef(null)
  const profileDragRef = useRef(null)
  const mediaInputRef = useRef(null)
  const profilePhotoInputRef = useRef(null)
  const [myProfile,setMyProfile] = useState({name:firstName||'Vanessa',handle:'@yourreverie',bio:'Building a life that feels like mine.',photo:null,photoPosition:{x:50,y:50},reverie:['little joys','feeling like me','home','getting outside']})
  const [profileDraft,setProfileDraft] = useState(null)



  // Load real Community content and account-backed social state together.
  useEffect(() => {
    let cancelled = false
    const loadCommunity = async () => {
      setCommunityReady(false)
      setCommunityError('')
      collectionGenerationRef.current+=1
      collectionCacheRef.current={};statsCacheRef.current={}
      setProfileCollections({});setProfileStats({})
      if (!user?.id) {
        setCommunityError('Sign in to see Community.')
        setCommunityReady(true)
        return
      }
      try {
        const [{ data: profile, error: profileError }, { data: realPosts, error: postsError }, myActionsResult, { data: likeActions, error: likeActionsError }, { data: follows, error: followsError }, { data: profiles, error: profilesError }, blocksResult, hiddenResult] = await Promise.all([
          db.from('tr_community_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          db.from('tr_community_posts').select('*').eq('status','published').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(50),
          readCommunityRows(()=>db.from('tr_community_post_actions').select('id,post_id,action,user_id').eq('user_id',user.id).order('id',{ascending:true})).then(data=>({data})),
          db.from('tr_community_post_actions').select('post_id,action,user_id').eq('action','like'),
          db.from('tr_community_follows').select('follower_id,following_id'),
          db.from('tr_community_profiles').select('*'),
          readCommunityRows(()=>db.from('tr_community_blocks').select('blocker_id,blocked_id,blocked_name').eq('blocker_id',user.id).order('blocked_id',{ascending:true})).then(data=>({data})),
          readCommunityRows(()=>db.from('tr_community_hidden_posts').select('post_id').eq('user_id',user.id).order('post_id',{ascending:true})).then(data=>({data}))
        ])
        if (cancelled) return
        const myActions=myActionsResult.data, blocks=blocksResult.data, hidden=hiddenResult.data
        const loadError = postsError || likeActionsError || followsError || profilesError || profileError
        if (loadError) throw loadError
        const blockedIds = new Set((blocks||[]).map(b=>b.blocked_id))
        const hiddenIds = new Set((hidden||[]).map(h=>String(h.post_id)))
        hiddenIdsRef.current=hiddenIds;blockedIdsRef.current=blockedIds
        const visibleRows = (realPosts||[]).filter(r=>!blockedIds.has(r.user_id)&&!hiddenIds.has(String(r.id)))
        const loadedComments = []
        if (visibleRows.length) {
          // Page comments to avoid silently dropping them at Supabase's row limit.
          for (let offset=0;;offset+=1000) {
            const {data,error}=await db.from('tr_community_comments').select('*').in('post_id',visibleRows.map(r=>r.id)).order('created_at',{ascending:true}).order('id',{ascending:true}).range(offset,offset+999)
            if (cancelled) return
            if (error) throw error
            loadedComments.push(...(data||[]))
            if ((data||[]).length<1000) break
          }
        }
        setBlockedAccounts(blocks||[])
        if (Array.isArray(profiles)) {
          const byUser = {}
          profiles.forEach(pr => { byUser[pr.user_id] = {name:pr.display_name||'True Reverie',handle:pr.handle||'@truereverie',bio:pr.bio||'',photo:pr.avatar_url||null,photoPosition:pr.avatar_position||{x:50,y:50},reverie:Array.isArray(pr.reverie)?pr.reverie:[],initial:(pr.display_name||'T')[0].toUpperCase(),gradient:'linear-gradient(135deg,#D86FA6,#A87BD1)'} })
          setCommunityProfiles(byUser)
        }
        if (profile) setMyProfile({
          name: profile.display_name || firstName || 'You',
          handle: profile.handle || '@yourreverie',
          bio: profile.bio || 'Building a life that feels like mine.',
          photo: profile.avatar_url || null,
          photoPosition: profile.avatar_position || {x:50,y:50},
          reverie: Array.isArray(profile.reverie) ? profile.reverie : []
        })
        if (!postsError && Array.isArray(realPosts)) {
          const mapped = visibleRows.map(r=>mapCommunityPost(r,user.id,profiles,likeActions,loadedComments,blockedIds))
          // Only real Supabase-backed posts belong in the live Community feed.
          // Legacy seed posts used string IDs (p1, p2, ...) and therefore could
          // only fake Like/Save in local React state; they could never persist
          // to tr_community_post_actions, whose post_id references real posts.
          setPosts(mapped)
          setFeedPostIds(mapped.map(p=>p.id))
          if (likeActionsError) console.error('Could not reload Community like counts:', likeActionsError)
          const mine = myActions || []
          setLiked(mine.filter(a => a.action === 'like').map(a => `real-${String(a.post_id)}`))
          setSaved(mine.filter(a => a.action === 'save').map(a => `real-${String(a.post_id)}`))
          setRealFollowing((follows || []).filter(f => f.follower_id === user.id).map(f => f.following_id))
          const counts = {}
          mapped.forEach(p => {
            const uid = p.mine ? user.id : p.user.replace(/^user-/, '')
            counts[uid] = counts[uid] || { followers:0, following:0, likes:0 }
            counts[uid].likes += p.likes || 0
          })
          ;(follows || []).forEach(f => {
            counts[f.following_id] = counts[f.following_id] || { followers:0, following:0, likes:0 }
            counts[f.follower_id] = counts[f.follower_id] || { followers:0, following:0, likes:0 }
            counts[f.following_id].followers += 1
            counts[f.follower_id].following += 1
          })
          setSocialCounts(counts)
        }
      } catch (e) {
        if (cancelled) return
        console.error('Could not load Community:', e)
        setCommunityError('Community could not load. Please try again.')
      } finally {
        if (!cancelled) setCommunityReady(true)
      }
    }
    loadCommunity()
    return () => { cancelled = true;collectionGenerationRef.current+=1 }
  }, [user?.id, loadAttempt])

  useEffect(()=>{
    const request=ctx.communityComposeSource
    if(!request)return
    setCaption('');setMedia(null);setAttachment(request.source||null);setPublishError('');setScreen({type:'create'})
    ctx.setCommunityComposeSource?.(null)
  },[ctx.communityComposeSource?.requestId])
  useEffect(()=>{
    if(!contentPickerType||attachmentCatalog)return
    let cancelled=false;setAttachmentError('')
    loadAttachmentCatalog().then(rows=>{if(!cancelled)setAttachmentCatalog(rows)}).catch(e=>{console.error('Could not load attachments:',e);if(!cancelled)setAttachmentError('The content library could not load. Please try again.')})
    return ()=>{cancelled=true}
  },[contentPickerType,attachmentAttempt])

  useEffect(()=>{const url=media?.url;return ()=>{if(url?.startsWith('blob:'))URL.revokeObjectURL(url)}},[media?.url])

  const interests = useMemo(()=>{
    const raw=[...(setupData?.interests||[]),...(setupData?.goals||[]),...(setupData?.desires||[])].join(' ').toLowerCase()
    return raw
  },[setupData])
  const ranked = useMemo(()=>{
    const followsPost=p=>p.real ? realFollowing.includes(p.user.replace(/^user-/,'')) : following.includes(p.user)
    const feedPosts=posts.filter(p=>feedPostIds.includes(p.id))
    if(feed==='following') return feedPosts.filter(followsPost)
    return [...feedPosts].sort((a,b)=>{
      const score=p=>p.tags.reduce((n,t)=>n+(interests.includes(t)?2:0),0)+(liked.includes(p.id)?1:0)+(followsPost(p)?.5:0)
      return score(b)-score(a)
    })
  },[posts,feedPostIds,feed,following,realFollowing,liked,interests])

  const setCollection=(key,value)=>{
    collectionCacheRef.current={...collectionCacheRef.current,[key]:value}
    setProfileCollections(c=>({...c,[key]:value}))
  }
  const invalidateCollection=(uid,tab)=>{
    const key=`${uid}:${tab}`
    const next={...collectionCacheRef.current};delete next[key];collectionCacheRef.current=next
    setProfileCollections(c=>{const updated={...c};delete updated[key];return updated})
  }
  const loadProfileCollection=async(uid,tab,append=false)=>{
    if(!uid||!communityReady)return
    const key=`${uid}:${tab}`
    const cached=collectionCacheRef.current[key]||{ids:[],offset:0,hasMore:false}
    if(cached.loading||(!append&&cached.ready))return
    const generation=collectionGenerationRef.current
    const request={...cached,loading:true,error:''}
    const current=()=>generation===collectionGenerationRef.current&&collectionCacheRef.current[key]===request
    setCollection(key,request)
    try {
      let offset=append?cached.offset:0, raw=[], visibleRows=[], hasMore=false
      // Advance past pages containing only hidden, removed, or blocked posts.
      do {
        let query=tab==='posts'
          ? db.from('tr_community_posts').select('*').eq('user_id',uid).eq('status','published').order('created_at',{ascending:false}).order('id',{ascending:false})
          : db.from('tr_community_post_actions').select('id,post_id').eq('user_id',user.id).eq('action',tab==='liked'?'like':'save').order('created_at',{ascending:false}).order('id',{ascending:false})
        const result=await query.range(offset,offset+49)
        if(!current())return
        if(result.error)throw result.error
        raw=result.data||[];offset+=raw.length;hasMore=raw.length===50
        let candidates=raw
        if(tab!=='posts'&&raw.length){
          const {data,error}=await db.from('tr_community_posts').select('*').eq('status','published').in('id',raw.map(a=>a.post_id))
          if(error)throw error
          const byId=new Map((data||[]).map(r=>[String(r.id),r]))
          candidates=raw.map(a=>byId.get(String(a.post_id))).filter(Boolean)
        }
        visibleRows=candidates.filter(r=>!hiddenIdsRef.current.has(String(r.id))&&!blockedIdsRef.current.has(r.user_id))
      } while(current()&&hasMore&&!visibleRows.length)
      if(!current())return
      let mapped=[]
      if(visibleRows.length){
        const ids=visibleRows.map(r=>r.id)
        const [pageLikes,pageComments,peopleResult]=await Promise.all([
          readCommunityRows(()=>db.from('tr_community_post_actions').select('id,post_id,action,user_id').eq('action','like').in('post_id',ids).order('id',{ascending:true})),
          readCommunityRows(()=>db.from('tr_community_comments').select('*').in('post_id',ids).order('created_at',{ascending:true}).order('id',{ascending:true})),
          db.from('tr_community_profiles').select('*').in('user_id',[...new Set(visibleRows.map(r=>r.user_id))])
        ])
        if(peopleResult.error)throw peopleResult.error
        mapped=visibleRows.filter(r=>!hiddenIdsRef.current.has(String(r.id))&&!blockedIdsRef.current.has(r.user_id)).map(r=>mapCommunityPost(r,user.id,peopleResult.data,pageLikes,pageComments,blockedIdsRef.current))
      }
      if(!current())return
      setPosts(previous=>{const byId=new Map(previous.map(p=>[p.id,p]));mapped.forEach(p=>byId.set(p.id,p));return [...byId.values()]})
      const ids=[...new Set([...(append?cached.ids:[]),...mapped.map(p=>p.id)])]
      setCollection(key,{ids,offset,hasMore,ready:true,loading:false,error:''})
    } catch(e) {
      if(!current())return
      console.error('Could not load Community collection:',e)
      setCollection(key,{...cached,loading:false,error:'These posts could not load. Please try again.'})
    }
  }
  const loadProfileCounts=async(uid,force=false)=>{
    if(!uid||!communityReady)return
    const cached=statsCacheRef.current[uid]
    if(cached?.loading||(!force&&cached?.ready))return
    const generation=collectionGenerationRef.current,request={loading:true}
    statsCacheRef.current={...statsCacheRef.current,[uid]:request}
    setProfileStats(c=>({...c,[uid]:request}))
    const current=()=>generation===collectionGenerationRef.current&&statsCacheRef.current[uid]===request
    try {
      const results=await Promise.all([
        db.from('tr_community_follows').select('id',{count:'exact',head:true}).eq('follower_id',uid),
        db.from('tr_community_follows').select('id',{count:'exact',head:true}).eq('following_id',uid),
        db.from('tr_community_post_actions').select('id,tr_community_posts!inner(user_id,status)',{count:'exact',head:true}).eq('action','like').eq('tr_community_posts.user_id',uid).eq('tr_community_posts.status','published')
      ])
      if(!current())return
      const error=results.find(r=>r.error)?.error
      if(error)throw error
      setSocialCounts(c=>({...c,[uid]:{following:results[0].count||0,followers:results[1].count||0,likes:results[2].count||0}}))
      const ready={ready:true};statsCacheRef.current={...statsCacheRef.current,[uid]:ready};setProfileStats(c=>({...c,[uid]:ready}))
    } catch(e) {
      if(!current())return
      console.error('Could not load Community profile counts:',e)
      const failed={error:true};statsCacheRef.current={...statsCacheRef.current,[uid]:failed};setProfileStats(c=>({...c,[uid]:failed}))
    }
  }
  useEffect(()=>{
    if(!communityReady||communityError||screen.type!=='profile')return
    const uid=screen.user==='me'?user?.id:screen.user?.replace(/^user-/,'')
    loadProfileCollection(uid,screen.user==='me'?profileTab:'posts')
    loadProfileCounts(uid)
  },[communityReady,communityError,screen.type,screen.user,profileTab,user?.id])

  const toggle=(setter,list,id)=>setter(list.includes(id)?list.filter(x=>x!==id):[...list,id])
  const openProfile=(key, person=null)=>{ setProfileTab('posts'); setScreen({type:'profile',user:key,person}) }
  const openPost=(p)=>{ if(!p)return; setScreen({type:'post',postId:p.id,returnTo:{screen,profileTab}}) }
  const backFromPost=()=>{
    closeComments(); setMenuPost(null)
    setProfileTab(screen.returnTo?.profileTab || 'posts')
    setScreen(screen.returnTo?.screen || {type:'feed'})
  }
  const reloadMyPostActions = async () => {
    if (!user?.id) return null
    let data,error
    try {data=await readCommunityRows(()=>db.from('tr_community_post_actions').select('id,post_id,action').eq('user_id',user.id).order('id',{ascending:true}))}catch(e){error=e}
    if (error) {
      console.error('Could not reload Community likes/saves:', error)
      return null
    }
    const rows = data || []
    setLiked(rows.filter(a => a.action === 'like').map(a => `real-${String(a.post_id)}`))
    setSaved(rows.filter(a => a.action === 'save').map(a => `real-${String(a.post_id)}`))
    return rows
  }

  const togglePostAction=async(p,action)=>{
    if(!p.real || !p.dbId || !user?.id){
      if(action==='like') toggle(setLiked,liked,p.id); else toggle(setSaved,saved,p.id)
      return
    }
    const list=action==='like'?liked:saved
    const setter=action==='like'?setLiked:setSaved
    const active=list.includes(p.id)
    setter(active?list.filter(x=>x!==p.id):[...list,p.id])

    let error = null
    if (active) {
      ;({ error } = await db
        .from('tr_community_post_actions')
        .delete()
        .eq('user_id',user.id)
        .eq('post_id',p.dbId)
        .eq('action',action))
    } else {
      // This table's Phase 7B RLS intentionally allows INSERT + DELETE for
      // the signed-in user's own actions. Do not use UPSERT here: Postgres
      // treats ON CONFLICT DO UPDATE as an UPDATE path, which requires an
      // UPDATE RLS policy that this table does not (and should not need to)
      // have. A plain INSERT matches the schema/policies exactly.
      ;({ error } = await db
        .from('tr_community_post_actions')
        .insert({user_id:user.id,post_id:p.dbId,action}))
    }

    if(error){
      setter(list)
      console.error('Could not persist Community action:',error)
      alert(`Could not ${action === 'like' ? 'like' : 'save'} this post. ${error.message || 'Please try again.'}`)
      return
    }

    // Read the account-backed state straight back from Supabase. This prevents
    // an optimistic heart/bookmark from pretending it saved when it did not.
    await reloadMyPostActions()
    invalidateCollection(user.id,action==='like'?'liked':'saved')

    if(action==='like'){
      const ownerId=p.mine?user.id:p.user.replace(/^user-/,'')
      setSocialCounts(c=>({...c,[ownerId]:{followers:c[ownerId]?.followers||0,following:c[ownerId]?.following||0,likes:Math.max(0,(c[ownerId]?.likes||0)+(active?-1:1))}}))
      setPosts(ps=>ps.map(x=>x.id===p.id?{...x,likes:Math.max(0,(x.likes||0)+(active?-1:1))}:x))
    }
  }
  const toggleRealFollow=async(targetId)=>{
    if(!user?.id||!targetId||targetId===user.id)return
    const active=realFollowing.includes(targetId)
    setRealFollowing(active?realFollowing.filter(x=>x!==targetId):[...realFollowing,targetId])
    const q=db.from('tr_community_follows')
    const {error}=active
      ? await q.delete().eq('follower_id',user.id).eq('following_id',targetId)
      : await q.insert({follower_id:user.id,following_id:targetId})
    if(error){setRealFollowing(realFollowing);console.error('Could not save follow:',error);return}
    setSocialCounts(c=>({
      ...c,
      [targetId]:{followers:Math.max(0,(c[targetId]?.followers||0)+(active?-1:1)),following:c[targetId]?.following||0,likes:c[targetId]?.likes||0},
      [user.id]:{followers:c[user.id]?.followers||0,following:Math.max(0,(c[user.id]?.following||0)+(active?-1:1)),likes:c[user.id]?.likes||0}
    }))
  }
  const closeComments=()=>{ commentSheetRef.current=null;setCommentPost(null);setComment('');setCommentError('') }
  const openComments=(id)=>{ commentSheetRef.current=id;setComment('');setCommentError('');setCommentPost(id) }
  const addComment=async(id)=>{
    const p=posts.find(x=>x.id===id)
    const body=comment.trim()
    if(!p?.dbId||!user?.id||!body||commentBusyRef.current)return
    if(body.length>2000){setCommentError('Keep your comment under 2,000 characters.');return}
    commentBusyRef.current=true;setCommentPosting(true);setCommentError('')
    try {
      const {data,error}=await db.from('tr_community_comments').insert({post_id:p.dbId,user_id:user.id,body,author_name:myProfile.name||firstName||'You'}).select('*').single()
      if(error)throw error
      setPosts(ps=>ps.map(x=>x.id===id?{...x,comments:[...x.comments,{...data,name:myProfile.name||firstName||'You',text:data.body}]}:x))
      if(commentSheetRef.current===id)setComment('')
    } catch(e) {
      console.error('Could not post comment:',e)
      if(commentSheetRef.current===id)setCommentError('Your comment did not post. Please try again.')
    } finally {commentBusyRef.current=false;setCommentPosting(false)}
  }
  const deleteComment=async(p,c)=>{
    if(c.user_id!==user?.id||commentBusyRef.current)return
    commentBusyRef.current=true;setCommentPosting(true);setCommentError('')
    try {
      const {error}=await db.from('tr_community_comments').delete().eq('id',c.id).eq('user_id',user.id)
      if(error)throw error
      setPosts(ps=>ps.map(x=>x.id===p.id?{...x,comments:x.comments.filter(v=>v.id!==c.id)}:x))
    } catch(e) {console.error('Could not delete comment:',e);if(commentSheetRef.current===p.id)setCommentError('Your comment could not be removed. Please try again.')}
    finally {commentBusyRef.current=false;setCommentPosting(false)}
  }
  const beginSafety=()=>{
    if(safetyBusyRef.current)return false
    safetyBusyRef.current=true;setSafetyBusy(true);setSafetyError('');return true
  }
  const endSafety=()=>{safetyBusyRef.current=false;setSafetyBusy(false)}
  const closeMenu=()=>{if(!safetyBusyRef.current){setMenuPost(null);setSafetyError('')}}
  const hidePost=async(p)=>{
    if(!p?.dbId||!user?.id||!beginSafety())return
    try {
      const {error}=await db.from('tr_community_hidden_posts').insert({user_id:user.id,post_id:p.dbId})
      if(error&&error.code!=='23505')throw error
      hiddenIdsRef.current.add(String(p.dbId))
      setPosts(ps=>ps.filter(x=>x.id!==p.id));setMenuPost(null)
      if(screen.type==='post')setScreen(screen.returnTo?.screen||{type:'feed'})
      setNotice('This post is hidden from your Community.')
    } catch(e) {console.error('Could not hide post:',e);setSafetyError('That post could not be hidden. Please try again.')}
    finally {endSafety()}
  }
  const blockAccount=async(p)=>{
    const target=p?.user?.replace(/^user-/,'')
    if(!user?.id||!target||p.mine||!beginSafety())return
    try {
      const name=personFor(p).name
      const {error}=await db.rpc('tr_community_block_account',{p_blocked_id:target,p_display_name:name})
      if(error)throw error
      setMenuPost(null);closeComments();setScreen({type:'feed'});setNotice(`${name} is blocked. You can unblock accounts from My Profile.`)
      // Reload server-filtered posts, comments, follows, and counts together.
      setCommunityReady(false);setLoadAttempt(n=>n+1)
    } catch(e) {console.error('Could not block account:',e);setSafetyError('That account could not be blocked. Please try again.')}
    finally {endSafety()}
  }
  const unblockAccount=async(target)=>{
    if(!user?.id||!beginSafety())return
    try {
      const {error}=await db.from('tr_community_blocks').delete().eq('blocker_id',user.id).eq('blocked_id',target)
      if(error)throw error
      setBlockedAccounts(bs=>bs.filter(b=>b.blocked_id!==target));setBlockedOpen(false);setNotice('Account unblocked. Previous follows are not restored.')
      setCommunityReady(false);setLoadAttempt(n=>n+1)
    } catch(e) {console.error('Could not unblock account:',e);setSafetyError('That account could not be unblocked. Please try again.')}
    finally {endSafety()}
  }
  const deletePost=async(p)=>{
    if(!p?.mine||!p.dbId||!user?.id||safetyBusyRef.current)return
    if(typeof window!=='undefined'&&!window.confirm('Delete this Community post? Its likes and comments will also be removed.'))return
    if(!beginSafety())return
    try {
      const {error}=await db.from('tr_community_posts').delete().eq('id',p.dbId).eq('user_id',user.id)
      if(error)throw error
      setPosts(ps=>ps.filter(x=>x.id!==p.id));setFeedPostIds(ids=>ids.filter(id=>id!==p.id));setMenuPost(null);closeComments()
      invalidateCollection(user.id,'posts');invalidateCollection(user.id,'liked');invalidateCollection(user.id,'saved')
      setScreen({type:'feed'});setNotice('Your post was deleted.')
      ctx.onCommunityPostDeleted?.(p.dbId)
      await removeCommunityPhoto(p.mediaUrl,user.id)
    } catch(e){console.error('Could not delete post:',e);setSafetyError('Your post could not be deleted. Please try again.')}
    finally{endSafety()}
  }
  const startReport=(p)=>{setMenuPost(null);setSafetyError('');setReportPost(p);setReportReason('spam');setReportDetails('')}
  const submitReport=async()=>{
    if(!reportPost?.dbId||!user?.id||!beginSafety())return
    try {
      const {error}=await db.from('tr_community_reports').insert({reporter_id:user.id,post_id:reportPost.dbId,reason:reportReason,details:reportDetails.trim()})
      if(error&&error.code!=='23505')throw error
      setReportPost(null);setNotice(error?.code==='23505'?'You have already reported this post.':'Your report was sent for review.')
    } catch(e) {console.error('Could not report post:',e);setSafetyError('Your report did not send. Please try again.')}
    finally {endSafety()}
  }
  const chooseMedia=(e)=>{
    const file=e.target.files?.[0]
    if(!file)return
    e.target.value=''
    if(file.size>50*1024*1024){setPublishError('Choose a photo or video under 50 MB.');return}
    const type=file.type||(/\.(mov|mp4|m4v|webm)$/i.test(file.name||'')?'video/'+(/\.mov$/i.test(file.name||'')?'quicktime':'mp4'):'image/jpeg')
    setPublishError('');setMedia({file,url:URL.createObjectURL(file),type,name:file.name||'Selected media',position:{x:50,y:50}})
  }
  const publish=async()=>{
    if((!caption.trim()&&!media)||!user?.id||publishingRef.current)return
    publishingRef.current=true;setPublishing(true);setPublishError('')
    try{
      const resolvedAttachment=attachment?await resolveContentSource(attachment):null
      let mediaUrl=null
      if(media?.url){
        const blob=media.file||await (await fetch(media.url)).blob()
        const ext=(media.name?.split('.').pop()||((media.type||'').startsWith('video/')?'mp4':'jpg')).toLowerCase()
        const path=`${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const up=await db.storage.from('tr-community-media').upload(path,blob,{contentType:media.type||blob.type||undefined,upsert:false})
        if(up.error) throw up.error
        mediaUrl=db.storage.from('tr-community-media').getPublicUrl(path).data.publicUrl
      }
      const source=resolvedAttachment?.source||null
      const payload={
        user_id:user.id, caption:caption.trim(), media_url:mediaUrl, media_type:media?.type||null,
        media_position:media?.position||{x:50,y:50}, source, tags:[source?.type||'personal'], status:'published',
        author_name:myProfile.name||firstName||'You', author_handle:myProfile.handle||'@yourreverie',
        author_avatar_url:myProfile.photo||null, author_avatar_position:myProfile.photoPosition||{x:50,y:50}
      }
      const {data,error}=await db.from('tr_community_posts').insert(payload).select('*').single()
      if(error) throw error
      const p={id:`real-${data.id}`,dbId:data.id,user:'me',person:{...myPerson},source,caption:data.caption||'',likes:0,comments:[],tags:['personal'],image:mediaUrl&&!isVideoMedia(media?.type,mediaUrl)?`url(${mediaUrl}) ${media?.position?.x??50}% ${media?.position?.y??50}%/cover no-repeat`:'linear-gradient(145deg,#DDB9CB,#A989B7,#7C6B91)',mediaUrl,mediaType:media?.type||null,mediaPosition:media?.position||{x:50,y:50},mine:true,real:true}
      setPosts(ps=>[p,...ps]);setFeedPostIds(ids=>[p.id,...ids]);invalidateCollection(user.id,'posts');setCaption('');setAttachment(null);setMedia(null);setScreen({type:'feed'})
    }catch(e){console.error('Could not publish Community post:',e);setPublishError(/no longer|does not link/.test(e.message||'')?e.message:'That post did not publish. Please try again.')}
    finally{publishingRef.current=false;setPublishing(false)}
  }
  const myPerson={...myProfile,initial:(myProfile.name||'Y')[0].toUpperCase(),gradient:'linear-gradient(135deg,#D86FA6,#A87BD1)'}
  const personFor=(p)=>p.person || (p.mine?myPerson:PEOPLE[p.user]) || {name:'True Reverie',handle:'@truereverie',initial:'T',gradient:'linear-gradient(135deg,#D86FA6,#A87BD1)',bio:'',reverie:[]}
  const openMyProfile=()=>{setProfileTab('posts');setScreen({type:'profile',user:'me'})}
  const startEditProfile=()=>{setProfileDraft({...myProfile,reverie:[...(myProfile.reverie||[])]});setScreen({type:'editProfile'})}
  const chooseProfilePhoto=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setProfileDraft(d=>({...d,photo:reader.result,photoPosition:{x:50,y:50}}));reader.readAsDataURL(file);e.target.value=''}

  const saveCommunityProfile=async()=>{
    if(!user?.id||!profileDraft)return
    try{
      let photo=profileDraft.photo||null
      if(photo?.startsWith('data:')){
        const blob=await (await fetch(photo)).blob()
        const path=`${user.id}/avatar-${Date.now()}.jpg`
        const up=await db.storage.from('tr-community-media').upload(path,blob,{contentType:blob.type||'image/jpeg',upsert:false})
        if(up.error) throw up.error
        photo=db.storage.from('tr-community-media').getPublicUrl(path).data.publicUrl
      }
      const next={...profileDraft,photo,handle:profileDraft.handle?.startsWith('@')?profileDraft.handle:`@${profileDraft.handle||'yourreverie'}`}
      const {error}=await db.from('tr_community_profiles').upsert({user_id:user.id,display_name:next.name,handle:next.handle,bio:next.bio,avatar_url:next.photo,avatar_position:next.photoPosition||{x:50,y:50},reverie:next.reverie||[],updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if(error) throw error
      setMyProfile(next);setScreen({type:'profile',user:'me'})
    }catch(e){console.error('Could not save Community profile:',e);alert('Your profile did not save. Please try again.')}
  }

  const Back=({label='Community'})=><div onClick={()=>setScreen({type:'feed'})} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:'pointer',marginBottom:17}}>‹ {label}</div>
  const Source=({source})=>source?<button type="button" onClick={()=>{if(sourceKey(source))ctx.openLinkedContent?.(source)}} disabled={!sourceKey(source)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 9px',borderRadius:999,background:'rgba(201,123,168,.10)',color:'#A84E7D',fontSize:10.5,fontWeight:800,marginTop:9,border:'none',textAlign:'left',cursor:sourceKey(source)?'pointer':'default',fontFamily:'inherit'}}><span>{source.icon}</span>{source.label}{sourceKey(source)&&<span>›</span>}</button>:null

  const renderPostCard=(p,detail=false)=>{const person=personFor(p);const isLike=liked.includes(p.id);return <div key={p.id} style={{background:BASE.surface,border:`1px solid ${BASE.border}`,borderRadius:22,overflow:'hidden',marginBottom:18,boxShadow:'0 8px 24px rgba(66,40,62,.055)'}}>
    <div style={{padding:'14px 15px 12px',display:'flex',alignItems:'center',gap:10}}><div onClick={()=>p.mine?openMyProfile():openProfile(p.user,p.person||null)} style={{cursor:'pointer'}}><Avatar person={person}/></div><div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:800,color:BASE.cream}}>{person.name}</div><div style={{fontSize:10.5,color:BASE.taupe}}>{person.handle}</div></div><IconButton label="Post options" onClick={()=>setMenuPost(p)}>•••</IconButton></div>
    {p.mediaUrl&&<div style={{height:detail?310:'auto',aspectRatio:detail?'auto':'3 / 2',background:p.mediaUrl&&p.mediaType?.startsWith('image/')?`url(${p.mediaUrl}) ${p.mediaPosition?.x??50}% ${p.mediaPosition?.y??50}%/cover no-repeat`:p.image,position:'relative',overflow:'hidden'}}>{isVideoMedia(p.mediaType,p.mediaUrl)&&p.mediaUrl?<CommunityVideo src={p.mediaUrl}/>:<><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,.04),rgba(45,25,42,.08))'}}/>{!p.mediaUrl&&<div style={{position:'absolute',left:16,bottom:14,color:'rgba(255,255,255,.86)',fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:13}}>photo placeholder</div>}</>}</div>}
    <div style={{padding:'12px 15px 15px'}}><div style={{display:'flex',alignItems:'center',gap:6}}><IconButton active={isLike} onClick={()=>togglePostAction(p,'like')}>{isLike?'♥':'♡'}</IconButton><span style={{fontSize:11.5,color:BASE.taupe}}>{p.likes||0}</span><IconButton onClick={()=>openComments(p.id)}>💬</IconButton><span style={{fontSize:11.5,color:BASE.taupe}}>{p.comments.length}</span><div style={{flex:1}}/><IconButton active={saved.includes(p.id)} onClick={()=>togglePostAction(p,'save')}>{saved.includes(p.id)?'🔖':'♧'}</IconButton></div>
      <Source source={p.source}/><div style={{fontSize:13,color:BASE.creamDim,lineHeight:1.55,marginTop:10}}>{p.caption}</div>{!detail&&p.comments.length>0&&<div onClick={()=>openComments(p.id)} style={{fontSize:11.5,color:BASE.taupe,marginTop:10,cursor:'pointer'}}>View {p.comments.length===1?'comment':`all ${p.comments.length} comments`}</div>}</div>
  </div>}

  function renderAttachmentPicker(){
    if(!contentPickerType||typeof document==='undefined')return null
    const search=attachmentSearch.trim().toLowerCase()
    const matches=(attachmentCatalog||[]).filter(source=>(source.type===contentPickerType||(contentPickerType==='rebuild'&&source.type==='rebuild_experience'))&&(!search||[source.label,source.programTitle].filter(Boolean).join(' ').toLowerCase().includes(search)))
    const familiar=new Set((ctx.contentInteractions||[]).map(i=>i.content_key))
    const sorted=[...matches].sort((a,b)=>Number(familiar.has(sourceKey(b)))-Number(familiar.has(sourceKey(a))))
    return createPortal(<div onClick={()=>setContentPickerType(null)} style={{position:'fixed',inset:0,zIndex:1001,background:'rgba(44,31,43,.35)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}><div role="dialog" aria-modal="true" aria-label="Choose published content" onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,maxHeight:'82dvh',overflowY:'auto',background:BASE.bg,borderRadius:'24px 24px 0 0',padding:'20px',paddingBottom:'calc(24px + env(safe-area-inset-bottom))'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,color:BASE.cream}}>What did you try?</div><button aria-label="Close content picker" onClick={()=>setContentPickerType(null)} style={{border:'none',background:'transparent',fontSize:24,color:BASE.taupe}}>×</button></div>
      <input aria-label="Search content attachments" value={attachmentSearch} onChange={e=>setAttachmentSearch(e.target.value)} placeholder="Search this collection" style={{boxSizing:'border-box',width:'100%',padding:12,borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,margin:'14px 0'}}/>
      {attachmentError?<div role="alert" style={{fontSize:12,color:BASE.taupe}}>{attachmentError}<button onClick={()=>setAttachmentAttempt(n=>n+1)} style={{margin:12}}>Try again</button></div>:!attachmentCatalog?<div role="status" style={{padding:20,fontSize:12,color:BASE.taupe}}>Opening the library…</div>:sorted.length?sorted.map(source=><button key={source.table+':'+source.contentId} onClick={()=>{setAttachment(source);setContentPickerType(null)}} style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:13,textAlign:'left',border:`1px solid ${BASE.border}`,borderRadius:16,background:BASE.surface,color:BASE.creamDim,marginBottom:9}}><span>{source.icon}</span><span style={{flex:1}}><b style={{fontSize:13}}>{source.label}</b>{source.programTitle&&<span style={{display:'block',fontSize:11,color:BASE.taupe,marginTop:3}}>{source.programTitle}</span>}{familiar.has(sourceKey(source))&&<span style={{display:'block',fontSize:10,color:'#A84E7D',marginTop:3}}>Saved or tried</span>}</span></button>):<div style={{padding:22,fontSize:12,color:BASE.taupe,textAlign:'center'}}>No published items match yet.</div>}
    </div></div>,document.body)
  }

  function renderPostMenu() {
    if(typeof document==='undefined')return null
    const sheetStyle={width:'100%',maxWidth:440,maxHeight:'85dvh',overflowY:'auto',borderRadius:'24px 24px 0 0',background:BASE.bg,padding:'18px 20px',paddingBottom:'calc(28px + env(safe-area-inset-bottom))',boxShadow:'0 -12px 40px rgba(45,25,42,.18)'}
    const actionStyle={width:'100%',padding:13,border:'none',background:'transparent',color:BASE.creamDim,fontWeight:700,textAlign:'left'}
    const cancelStyle={...actionStyle,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,textAlign:'center',marginTop:8}
    const error=safetyError?<div role="alert" style={{fontSize:12,color:'#B9566B',padding:'8px 0'}}>{safetyError}</div>:null
    const wrap=(children,onClose)=>createPortal(<div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(44,31,43,.38)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}><div role="dialog" aria-modal="true" aria-label={reportPost?'Report post':blockedOpen?'Blocked accounts':'Post options'} onClick={e=>e.stopPropagation()} style={sheetStyle}>{children}</div></div>,document.body)
    if(reportPost)return wrap(<>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,color:BASE.cream}}>Report post</div>
      <div style={{fontSize:12,color:BASE.taupe,lineHeight:1.5,margin:'8px 0 14px'}}>Let us know what needs a closer look. Reporting sends this post for review.</div>
      <label style={{fontSize:12,color:BASE.creamDim}}>Reason<select aria-label="Report reason" value={reportReason} disabled={safetyBusy} onChange={e=>setReportReason(e.target.value)} style={{width:'100%',marginTop:7,padding:12,borderRadius:12,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim}}>{[['spam','Spam'],['harassment','Harassment or bullying'],['unsafe_advice','Unsafe advice'],['other','Something else']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <textarea aria-label="Report details" value={reportDetails} disabled={safetyBusy} maxLength={2000} onChange={e=>setReportDetails(e.target.value)} placeholder="Anything else we should know? (optional)" style={{width:'100%',boxSizing:'border-box',minHeight:88,marginTop:12,padding:12,borderRadius:12,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontFamily:'inherit'}}/>
      {error}<button disabled={safetyBusy} onClick={submitReport} style={{...cancelStyle,background:'#A84E7D',color:'#fff'}}>{safetyBusy?'Sending…':'Send report'}</button><button disabled={safetyBusy} onClick={()=>{setReportPost(null);setSafetyError('')}} style={cancelStyle}>Cancel</button>
    </>,()=>{if(!safetyBusyRef.current){setReportPost(null);setSafetyError('')}})
    if(blockedOpen)return wrap(<>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,color:BASE.cream}}>Blocked accounts</div>
      {blockedAccounts.length?blockedAccounts.map(b=><div key={b.blocked_id} style={{display:'flex',alignItems:'center',gap:10,padding:'14px 0',borderBottom:`1px solid ${BASE.border}`}}><span style={{flex:1,fontSize:13,color:BASE.creamDim}}>{b.blocked_name||'Blocked account'}</span><button disabled={safetyBusy} onClick={()=>unblockAccount(b.blocked_id)} style={{...cancelStyle,width:'auto',marginTop:0,padding:'8px 12px'}}>Unblock</button></div>):<div style={{fontSize:12,color:BASE.taupe,padding:'20px 0'}}>No blocked accounts.</div>}
      {error}<button disabled={safetyBusy} onClick={()=>{setBlockedOpen(false);setSafetyError('')}} style={cancelStyle}>Done</button>
    </>,()=>{if(!safetyBusyRef.current){setBlockedOpen(false);setSafetyError('')}})
    if(!menuPost)return null
    return wrap(<>
      <div style={{width:38,height:4,borderRadius:999,background:'rgba(120,91,112,.28)',margin:'0 auto 10px'}}/>
      {menuPost.mine&&<button disabled={safetyBusy} onClick={()=>deletePost(menuPost)} style={{...actionStyle,color:'#B9566B'}}>Delete post</button>}
      {!menuPost.mine&&<><button disabled={safetyBusy} onClick={()=>hidePost(menuPost)} style={actionStyle}>Not interested in this post</button><button disabled={safetyBusy} onClick={()=>blockAccount(menuPost)} style={actionStyle}>Block this account</button><button disabled={safetyBusy} onClick={()=>startReport(menuPost)} style={{...actionStyle,color:'#B9566B'}}>Report post</button></>}
      {safetyBusy&&<div role="status" style={{fontSize:12,color:BASE.taupe,padding:'8px 0'}}>Saving…</div>}{error}<button disabled={safetyBusy} onClick={closeMenu} style={cancelStyle}>Cancel</button>
    </>,closeMenu)
  }
  const Notice=()=>notice?<div role="status" style={{padding:'11px 13px',marginBottom:14,borderRadius:14,background:BASE.surface,border:`1px solid ${BASE.border}`,fontSize:12,lineHeight:1.5,color:BASE.creamDim}}>{notice}<button aria-label="Dismiss message" onClick={()=>setNotice('')} style={{border:'none',background:'transparent',color:BASE.taupe,marginLeft:8}}>×</button></div>:null

  if (!communityReady || communityError) return <div className="fade-in" role={communityError?'alert':'status'} aria-live="polite" style={{padding:'60px 24px',textAlign:'center',color:BASE.taupe}}>
    <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:26,fontWeight:600,color:BASE.cream}}>Community</div>
    <div style={{fontSize:13,lineHeight:1.6,marginTop:12}}>{communityError || 'Gathering little moments…'}</div>
    {communityError&&user?.id&&<button type="button" onClick={()=>{setCommunityError('');setCommunityReady(false);setLoadAttempt(n=>n+1)}} style={{marginTop:18,padding:'11px 24px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontWeight:800}}>Try again</button>}
  </div>

  if(screen.type==='post') {
    const p=posts.find(x=>String(x.id)===String(screen.postId))
    if(!p){ setScreen({type:'feed'}); return null }
    const backLabel=screen.returnTo?.screen?.type==='profile'
      ? (screen.returnTo.screen.user==='me'
        ? (screen.returnTo.profileTab==='saved'?'Saved':screen.returnTo.profileTab==='liked'?'Liked':'My Profile')
        : (screen.returnTo.screen.person?.name || 'Profile'))
      : 'Community'
    return <div className="fade-in" style={{padding:'10px 18px 0'}}>
      <button type="button" onClick={backFromPost} style={{border:'none',background:'transparent',padding:0,fontFamily:'inherit',fontSize:13,fontWeight:700,color:BASE.taupe,cursor:'pointer',marginBottom:17}}>‹ {backLabel}</button>
      <Notice/>{renderPostCard(p,true)}
      <div style={{height:70}}/>
      {renderCommentsSheet()}
      {renderPostMenu()}
    </div>
  }

  if(screen.type==='create') return <div className="fade-in" style={{padding:'10px 18px 0'}}><Back/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream}}>Share something from your life</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:14.5,color:BASE.taupe,marginTop:6}}>A little moment, something you tried, or something worth passing on.</div>
    <input ref={mediaInputRef} type="file" accept="image/*,video/*" onChange={chooseMedia} style={{display:'none'}} />
    <div onClick={()=>{if(!media)mediaInputRef.current?.click()}} role="button" tabIndex={0} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&!media)mediaInputRef.current?.click()}} onPointerDown={e=>{if(!media?.type?.startsWith('image/'))return;mediaDragRef.current={x:e.clientX,y:e.clientY,start:{...(media.position||{x:50,y:50})}};e.currentTarget.setPointerCapture?.(e.pointerId)}} onPointerMove={e=>{const d=mediaDragRef.current;if(!d||!media?.type?.startsWith('image/'))return;const dx=e.clientX-d.x,dy=e.clientY-d.y;setMedia(m=>({...m,position:{x:Math.max(0,Math.min(100,d.start.x-dx*.35)),y:Math.max(0,Math.min(100,d.start.y-dy*.35))}}))}} onPointerUp={()=>{mediaDragRef.current=null}} onPointerCancel={()=>{mediaDragRef.current=null}} style={{marginTop:22,width:'100%',aspectRatio:'3 / 2',borderRadius:20,border:`1px dashed ${BASE.border}`,background:media?.type?.startsWith('image/')?`url(${media.url}) ${media.position?.x??50}% ${media.position?.y??50}%/cover no-repeat`:'linear-gradient(145deg,rgba(221,185,203,.28),rgba(169,137,183,.22))',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',color:media?.type?.startsWith('image/')?'#fff':BASE.taupe,fontSize:12,cursor:media?.type?.startsWith('image/')?'grab':'pointer',overflow:'hidden',position:'relative',touchAction:media?.type?.startsWith('image/')?'none':'auto'}}>
      {media&&isVideoMedia(media.type,media.url)?<CommunityVideo src={media.url}/>:media?.type?.startsWith('image/')?<><div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',padding:'5px 9px',borderRadius:999,background:'rgba(44,31,43,.50)',fontSize:10,fontWeight:700,pointerEvents:'none'}}>Drag to reposition</div><button onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();mediaInputRef.current?.click()}} style={{position:'absolute',right:10,bottom:10,padding:'7px 10px',borderRadius:999,border:'none',background:'rgba(44,31,43,.58)',color:'#fff',fontSize:10,fontWeight:800}}>Change</button></>:<div><div style={{fontSize:28,marginBottom:7}}>＋</div>Add photo or video</div>}
    </div>
    {media&&<div style={{display:'flex',gap:8,marginTop:10}}><button type="button" disabled={publishing} onClick={()=>mediaInputRef.current?.click()} style={{flex:1,padding:10,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:700,fontSize:11}}>Change media</button><button type="button" disabled={publishing} onClick={()=>{setMedia(null);mediaDragRef.current=null;setPublishError('')}} style={{flex:1,padding:10,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#B9566B',fontWeight:700,fontSize:11}}>Remove media</button></div>}
    <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="What do you want to remember or share?" style={{width:'100%',minHeight:105,boxSizing:'border-box',marginTop:16,borderRadius:17,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,padding:14,fontFamily:'inherit',fontSize:13,resize:'none',outline:'none'}}/>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',color:BASE.taupe,margin:'20px 0 10px'}}>Add what you did · optional</div>
    <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:5}}>{ATTACHMENTS.map(([icon,label,type])=><button key={type} onClick={()=>{setAttachmentSearch('');setContentPickerType(type)}} style={{whiteSpace:'nowrap',padding:'9px 12px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontSize:11,fontWeight:700}}>{icon} {label}</button>)}</div>
    {attachment&&<div style={{display:'flex',alignItems:'center',gap:8,marginTop:12,padding:12,borderRadius:14,background:BASE.surface,border:`1px solid ${BASE.border}`,fontSize:12,color:'#A84E7D'}}><span style={{flex:1}}>{attachment.icon} {attachment.label}</span><button aria-label="Remove attachment" onClick={()=>setAttachment(null)} style={{border:'none',background:'transparent',color:BASE.taupe,fontSize:20}}>×</button></div>}
    {renderAttachmentPicker()}
    {publishError&&<div role="alert" style={{marginTop:12,fontSize:12,color:'#B9566B',lineHeight:1.5}}>{publishError}</div>}

    <button onClick={publish} disabled={publishing||(!caption.trim()&&!media)} aria-busy={publishing} style={{width:'100%',padding:14,borderRadius:999,border:'none',background:(caption.trim()||media)?'linear-gradient(135deg,#D86FA6,#A87BD1)':'rgba(180,160,175,.35)',color:'#fff',fontWeight:800,marginTop:24,opacity:publishing ? .7 : 1}}>{publishing?'Posting…':'Post'}</button><div style={{height:60}}/></div>

  function renderCommentsSheet() {
    if (!commentPost || typeof document === 'undefined') return null
    const p = posts.find(x => x.id === commentPost)
    if (!p) return null
    return createPortal(
      <div onClick={closeComments} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(44,31,43,.30)',display:'flex',alignItems:'flex-end',justifyContent:'center',touchAction:'none'}}>
        <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,height:'62dvh',maxHeight:'680px',minHeight:'390px',borderRadius:'24px 24px 0 0',background:BASE.bg,boxShadow:'0 -12px 40px rgba(45,25,42,.18)',display:'flex',flexDirection:'column',overflow:'hidden',touchAction:'pan-y'}}>
          <div style={{position:'relative',padding:'10px 18px 12px',borderBottom:`1px solid ${BASE.border}`,flexShrink:0}}>
            <div style={{width:38,height:4,borderRadius:999,background:'rgba(120,91,112,.28)',margin:'0 auto 9px'}}/>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,textAlign:'center'}}>Comments</div>
            <button aria-label="Close comments" onClick={closeComments} style={{position:'absolute',right:13,top:15,width:32,height:32,borderRadius:'50%',border:'none',background:BASE.surface,color:BASE.creamDim,fontSize:20,lineHeight:1,cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,minHeight:0,overflowY:'auto',overscrollBehavior:'contain',WebkitOverflowScrolling:'touch',padding:'8px 18px 16px'}}>
            {p.comments.length===0?<div style={{fontSize:12.5,color:BASE.taupe,fontStyle:'italic',padding:'24px 2px'}}>Be the first to say something.</div>:p.comments.map((c,i)=><div key={c.id||i} style={{display:'flex',gap:10,padding:'12px 2px',borderBottom:`1px solid ${BASE.border}`}}><div style={{width:30,height:30,borderRadius:'50%',background:'rgba(201,123,168,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#A84E7D',flexShrink:0}}>{c.name[0]}</div><div><div style={{fontSize:11.5,fontWeight:800,color:BASE.cream}}>{c.name}</div><div style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.45,marginTop:3}}>{c.text}</div>{c.user_id===user?.id&&<button disabled={commentPosting} onClick={()=>deleteComment(p,c)} style={{border:'none',background:'transparent',padding:'6px 0 0',fontSize:10.5,color:BASE.taupe}}>Delete comment</button>}</div></div>)}
          </div>
          {commentError&&<div role="alert" style={{padding:'8px 14px',fontSize:12,color:'#B9566B'}}>{commentError}</div>}
          <div style={{display:'flex',gap:8,alignItems:'center',padding:'11px 14px',paddingBottom:'calc(11px + env(safe-area-inset-bottom))',borderTop:`1px solid ${BASE.border}`,background:BASE.bg,flexShrink:0}}>
            <input value={comment} disabled={commentPosting} maxLength={2000} onChange={e=>setComment(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addComment(p.id)}} placeholder="Add a comment…" style={{flex:1,minWidth:0,padding:'11px 13px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,outline:'none',fontSize:12.5}}/>
            <button disabled={commentPosting||!comment.trim()} aria-busy={commentPosting} onClick={()=>addComment(p.id)} style={{border:'none',background:'transparent',color:'#C9558E',fontWeight:800,padding:'10px 4px'}}>{commentPosting?'Posting…':'Post'}</button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  if(screen.type==='editProfile'&&profileDraft) return <div className="fade-in" style={{padding:'10px 18px 0'}}><div onClick={()=>setScreen({type:'profile',user:'me'})} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:'pointer',marginBottom:17}}>‹ My Profile</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream}}>Edit your Reverie</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:14.5,color:BASE.taupe,marginTop:5}}>Make this little corner feel like you.</div>
    <input ref={profilePhotoInputRef} type="file" accept="image/*" onChange={chooseProfilePhoto} style={{display:'none'}}/><div onClick={()=>profilePhotoInputRef.current?.click()} style={{display:'flex',alignItems:'center',gap:14,marginTop:24,cursor:'pointer'}}><Avatar person={{...myPerson,...profileDraft,initial:(profileDraft.name||'Y')[0].toUpperCase()}} size={68}/><div><div style={{fontSize:12,fontWeight:800,color:'#A84E7D'}}>Change profile photo</div><div style={{fontSize:10.5,color:BASE.taupe,marginTop:3}}>Choose something that feels like you.</div></div></div>{profileDraft?.photo&&<div style={{marginTop:14,display:'flex',alignItems:'center',gap:13}}><div onPointerDown={e=>{profileDragRef.current={x:e.clientX,y:e.clientY,start:{...(profileDraft.photoPosition||{x:50,y:50})}};e.currentTarget.setPointerCapture?.(e.pointerId)}} onPointerMove={e=>{const d=profileDragRef.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;setProfileDraft(v=>({...v,photoPosition:{x:Math.max(0,Math.min(100,d.start.x-dx*.5)),y:Math.max(0,Math.min(100,d.start.y-dy*.5))}}))}} onPointerUp={()=>{profileDragRef.current=null}} onPointerCancel={()=>{profileDragRef.current=null}} style={{width:116,height:116,borderRadius:'50%',background:`url(${profileDraft.photo}) ${profileDraft.photoPosition?.x??50}% ${profileDraft.photoPosition?.y??50}%/cover no-repeat`,boxShadow:'0 7px 20px rgba(66,40,62,.10)',touchAction:'none',cursor:'grab',flexShrink:0}}/><div><div style={{fontSize:11,fontWeight:800,color:BASE.creamDim}}>Adjust your photo</div><div style={{fontSize:10.5,color:BASE.taupe,lineHeight:1.45,marginTop:4}}>Drag the photo until it sits how you want inside the circle.</div></div></div>}
    {[['Name','name'],['Handle','handle']].map(([label,key])=><label key={key} style={{display:'block',marginTop:18}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1.3,textTransform:'uppercase',color:BASE.taupe,marginBottom:7}}>{label}</div><input value={profileDraft[key]} onChange={e=>setProfileDraft({...profileDraft,[key]:e.target.value})} style={{width:'100%',boxSizing:'border-box',padding:'12px 13px',borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,outline:'none'}}/></label>)}
    <label style={{display:'block',marginTop:18}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1.3,textTransform:'uppercase',color:BASE.taupe,marginBottom:7}}>A little about you</div><textarea value={profileDraft.bio} onChange={e=>setProfileDraft({...profileDraft,bio:e.target.value})} style={{width:'100%',minHeight:88,boxSizing:'border-box',padding:13,borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,outline:'none',resize:'none',fontFamily:'inherit'}}/></label>
    <label style={{display:'block',marginTop:18}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1.3,textTransform:'uppercase',color:BASE.taupe,marginBottom:7}}>My Reverie</div><input value={(profileDraft.reverie||[]).join(', ')} onChange={e=>setProfileDraft({...profileDraft,reverie:e.target.value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,6)})} placeholder="slow mornings, strength, easy dinners" style={{width:'100%',boxSizing:'border-box',padding:'12px 13px',borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,outline:'none'}}/><div style={{fontSize:10.5,color:BASE.taupe,marginTop:6}}>Separate a few things you’re loving with commas.</div></label>
    <button onClick={saveCommunityProfile} style={{width:'100%',padding:14,borderRadius:999,border:'none',background:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:'#fff',fontWeight:800,marginTop:25}}>Save profile</button><div style={{height:70}}/></div>

  if(screen.type==='profile'){
    const key=screen.user
    const isMe=key==='me'
    const realUserId=isMe?user?.id:(key?.startsWith('user-')?key.slice(5):null)
    const person=isMe?myPerson:((realUserId&&communityProfiles[realUserId])||screen.person||PEOPLE[key]||personFor(posts.find(p=>p.user===key)||{}))
    const counts=realUserId?(socialCounts[realUserId]||{followers:0,following:0,likes:0}):{followers:0,following:0,likes:0}
    const collection=profileCollections[`${realUserId}:${isMe?profileTab:'posts'}`]||{ids:[],loading:true}
    const postById=new Map(posts.map(p=>[p.id,p]))
    const visiblePosts=collection.ids.map(id=>postById.get(id)).filter(Boolean)
    const stats=profileStats[realUserId]||{loading:true}
    const follows=realUserId?realFollowing.includes(realUserId):(!isMe&&following.includes(key))
    const followClick=()=>realUserId?toggleRealFollow(realUserId):toggle(setFollowing,following,key)
    return <div className="fade-in" style={{padding:'10px 18px 0'}}><Back/><Notice/><div style={{textAlign:'center',padding:'8px 15px 12px'}}><div style={{display:'flex',justifyContent:'center'}}><Avatar person={person} size={76}/></div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream,marginTop:11}}>{person.name}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:2}}>{person.handle}</div><div style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.5,margin:'10px auto 14px',maxWidth:300}}>{person.bio}</div><button onClick={isMe?startEditProfile:followClick} style={{padding:'9px 25px',borderRadius:999,border:(isMe||follows)?`1px solid ${BASE.border}`:'none',background:(isMe||follows)?BASE.surface:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:(isMe||follows)?BASE.creamDim:'#fff',fontWeight:800,fontSize:11}}>{isMe?'Edit Profile':follows?'Following':'Follow'}</button></div>
    {isMe&&<button onClick={()=>{setSafetyError('');setBlockedOpen(true)}} style={{display:'block',margin:'0 auto 12px',border:'none',background:'transparent',fontSize:11,color:BASE.taupe}}>Blocked accounts</button>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,padding:'8px 10px 14px',textAlign:'center'}}>{[[stats.ready?counts.following:'—','Following'],[stats.ready?counts.followers:'—','Followers'],[stats.ready?counts.likes:'—','Likes']].map(([n,l])=><div key={l}><div style={{fontSize:17,fontWeight:800,color:BASE.cream}}>{n}</div><div style={{fontSize:10.5,color:BASE.taupe,marginTop:2}}>{l}</div></div>)}</div>
    {stats.error&&<button onClick={()=>loadProfileCounts(realUserId,true)} style={{display:'block',margin:'0 auto 12px',border:'none',background:'transparent',fontSize:11,color:BASE.taupe}}>Retry profile counts</button>}
    <div style={{display:'grid',gridTemplateColumns:isMe?'repeat(3,1fr)':'1fr',borderTop:`1px solid ${BASE.border}`,borderBottom:`1px solid ${BASE.border}`,margin:'0 0 22px'}}>{[['posts','▦','Posts'],...(isMe?[["liked","♡","Liked"],["saved","🔖","Saved"]]:[])].map(([k,ic,l])=><button key={k} onClick={()=>setProfileTab(k)} style={{padding:'11px 4px 9px',border:'none',borderBottom:profileTab===k?'2px solid #C9558E':'2px solid transparent',background:'transparent',color:profileTab===k?'#A84E7D':BASE.taupe,fontSize:17,cursor:'pointer'}}><div>{ic}</div><div style={{fontSize:9.5,fontWeight:800,marginTop:3}}>{l}</div></button>)}</div>
    {profileTab==='posts'&&<><div style={{margin:'4px 0 23px'}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream}}>Her Reverie</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:12.5,color:BASE.taupe,marginTop:2}}>Little things making life feel more like hers.</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:11}}>{(person.reverie||[]).map(x=><span key={x} style={{padding:'7px 10px',borderRadius:999,background:'rgba(201,123,168,.10)',border:`1px solid ${BASE.border}`,fontSize:10.5,color:'#A84E7D',fontWeight:700}}>{x}</span>)}</div></div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream}}>Lately</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:12.5,color:BASE.taupe,marginTop:2,marginBottom:12}}>A little scrapbook of what she’s been living.</div></>}
    {profileTab!=='posts'&&<div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,marginBottom:12}}>{profileTab==='liked'?'Posts you liked':'Posts you saved'}</div>}
    {collection.loading&&!visiblePosts.length&&<div role="status" style={{padding:'28px 14px',textAlign:'center',fontSize:12,color:BASE.taupe}}>Gathering your moments…</div>}
    {visiblePosts.length?visiblePosts.map((p,i)=><div key={p.id} onClick={()=>openPost(p)} style={{marginBottom:20,cursor:'pointer'}}><div style={{height:p.mediaUrl?(i%2===0?300:245):0,borderRadius:20,background:p.mediaUrl&&p.mediaType?.startsWith('image/')?`url(${p.mediaUrl}) ${p.mediaPosition?.x??50}% ${p.mediaPosition?.y??50}%/cover no-repeat`:p.image,overflow:'hidden',position:'relative',boxShadow:'0 8px 24px rgba(66,40,62,.06)'}}>{isVideoMedia(p.mediaType,p.mediaUrl)&&p.mediaUrl?<CommunityVideo src={p.mediaUrl}/>:null}</div><div onClick={e=>e.stopPropagation()}><Source source={p.source}/></div><div style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.55,marginTop:9}}>{p.caption}</div><div style={{fontSize:10.5,color:BASE.taupe,marginTop:7}}>{p.likes||0} loved this · {p.comments.length} {p.comments.length===1?'comment':'comments'}</div></div>):!collection.loading&&!collection.error&&<div style={{padding:'35px 18px',borderRadius:20,border:`1px dashed ${BASE.border}`,textAlign:'center',color:BASE.taupe,fontSize:12}}>{profileTab==='liked'?'Posts you like will collect here privately.':profileTab==='saved'?'Posts you save will collect here privately.':isMe?'Things you share with Community will collect here like a little scrapbook.':'Nothing shared here yet.'}</div>}
    {collection.error&&<div role="alert" style={{fontSize:12,color:BASE.taupe,textAlign:'center',padding:'18px 0'}}>{collection.error}<button onClick={()=>loadProfileCollection(realUserId,isMe?profileTab:'posts',collection.ids.length>0)} style={{display:'block',margin:'10px auto',padding:'10px 20px',borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontWeight:700}}>Try again</button></div>}
    {collection.hasMore&&!collection.error&&<button disabled={collection.loading} onClick={()=>loadProfileCollection(realUserId,isMe?profileTab:'posts',true)} style={{display:'block',width:'100%',padding:12,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontWeight:800,marginTop:12}}>{collection.loading?'Loading…':'Load more'}</button>}
    {renderPostMenu()}<div style={{height:70}}/></div>}


  return <div className="fade-in" style={{padding:'10px 18px 0'}}><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',paddingRight:44}}><div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:31,fontWeight:600,color:BASE.cream,lineHeight:1.1}}>Community</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:15.5,color:BASE.taupe,marginTop:6}}>Real women, actually living it.</div></div></div>
    <Notice/><div style={{display:'flex',gap:7,marginTop:18,marginBottom:18}}>{[['foryou','For You'],['following','Following']].map(([k,l])=><button key={k} onClick={()=>setFeed(k)} style={{flex:1,padding:'10px 8px',borderRadius:14,border:`1px solid ${feed===k?'#C97BA8':BASE.border}`,background:feed===k?'rgba(201,123,168,.12)':BASE.surface,color:feed===k?'#A84E7D':BASE.taupe,fontWeight:800,fontSize:11.5}}>{l}</button>)}</div>
    {feed==='foryou'&&<div style={{fontSize:11,color:BASE.taupe,lineHeight:1.5,margin:'-5px 3px 11px'}}>Your feed gets better as True Reverie learns what you save, try, love, and come back to.</div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:17}}><button onClick={()=>setScreen({type:'create'})} style={{padding:'11px 10px',borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontSize:11.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(66,40,62,.04)'}}>＋ Share something</button><button onClick={openMyProfile} style={{padding:'11px 10px',borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:'#A84E7D',fontSize:11.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 14px rgba(66,40,62,.04)'}}>♡ My Profile</button></div>
    {ranked.length?ranked.map(p=>renderPostCard(p)):<div style={{textAlign:'center',padding:'55px 24px',color:BASE.taupe}}><div style={{fontSize:25}}>✨</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,fontWeight:700,color:BASE.cream,marginTop:8}}>{feed==='following'?'Your following feed is quiet':'A little space for real life'}</div><div style={{fontSize:12,marginTop:6}}>{feed==='following'?'Follow women whose lives and ideas you want to see more of.':'No moments shared yet. Yours can be the first.'}</div></div>}
    {renderCommentsSheet()}
    {renderPostMenu()}
    <div style={{height:55}}/></div>
}

export function renderCommunity(ctx) {
  if (ctx.tab !== 'community') return null
  return <CommunityBoundary key={ctx.user?.id||'signed-out'} ctx={ctx}/>
}
