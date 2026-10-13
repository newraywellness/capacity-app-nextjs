import { db } from './supabase'

export const CONTENT_TYPES = {bloom:['🌸','Bloom'],move:['💪','Move'],nourish:['🍽️','Nourish'],rebuild:['🌱','Rebuild'],rebuild_experience:['🌱','Rebuild experience'],feel_better:['🤍','Feel Better'],ritual:['✨','Ritual']}
export const contentSource = (row, type=row.content_type, parent=null) => ({
  version:1, table:type==='rebuild_experience'?'tr_rebuild_experiences':'tr_content',
  contentId:String(row.id), type, icon:CONTENT_TYPES[type]?.[0]||'♡',
  label:row.title||CONTENT_TYPES[type]?.[1]||'True Reverie',
  ...(parent?{rebuildId:String(parent.id),programTitle:parent.title}:{}),
})
export const sourceFromKey = (key, type='') => {
  const value=String(key||'')
  const patterns=[[/^supabase:supabase-(.+)$/,'bloom'],[/^move:studio-(.+)$/,'move'],[/^nourish:studio-(.+)$/,'nourish'],[/^(?:program|rebuild):studio-(.+)$/,'rebuild'],[/^ritual:studio-ritual-(.+)$/,'ritual'],[/^feel_better:studio-feel-(.+)$/,'feel_better'],[/^rebuild_experience:(.+)$/,'rebuild_experience']]
  for(const [pattern,kind] of patterns){const match=value.match(pattern);if(match)return contentSource({id:match[1],title:''},kind)}
  return null
}
export const sourceKey = source => {
  const id=source?.contentId, type=source?.type
  if(!id)return null
  return type==='bloom'?`supabase:supabase-${id}`:type==='move'?`move:studio-${id}`:type==='nourish'?`nourish:studio-${id}`:type==='rebuild'?`program:studio-${id}`:type==='ritual'?`ritual:studio-ritual-${id}`:type==='feel_better'?`feel_better:studio-feel-${id}`:type==='rebuild_experience'?`rebuild_experience:${id}`:null
}
export async function allRows(build) {
  const rows=[]
  for(let offset=0;;offset+=1000){const {data,error}=await build().range(offset,offset+999);if(error)throw error;rows.push(...(data||[]));if((data||[]).length<1000)return rows}
}
export async function loadAttachmentCatalog() {
  const [content,experiences]=await Promise.all([
    allRows(()=>db.from('tr_content').select('id,title,content_type,image_url,is_premium,status').eq('status','published').in('content_type',['bloom','move','nourish','rebuild','feel_better','ritual']).order('title',{ascending:true}).order('id',{ascending:true})),
    allRows(()=>db.from('tr_rebuild_experiences').select('id,title,rebuild_id,status').eq('status','published').order('sort_order',{ascending:true}).order('id',{ascending:true}))
  ])
  const parents=new Map(content.filter(r=>r.content_type==='rebuild').map(r=>[String(r.id),r]))
  return [...content.map(r=>({...contentSource(r),image:r.image_url||null})),...experiences.filter(e=>parents.has(String(e.rebuild_id))).map(e=>contentSource(e,'rebuild_experience',parents.get(String(e.rebuild_id))))]
}
export async function resolveContentSource(source) {
  if(!sourceKey(source)||!['tr_content','tr_rebuild_experiences'].includes(source?.table))throw new Error('This post does not link to a live content item.')
  const {data:row,error}=await db.from(source.table).select('*').eq('id',source.contentId).eq('status','published').maybeSingle()
  if(error)throw error
  if(!row)throw new Error('This content is no longer available.')
  if(source.table==='tr_content'){
    if(row.content_type!==source.type||!CONTENT_TYPES[row.content_type])throw new Error('This content is no longer available.')
    const experiences=row.content_type==='rebuild'?await allRows(()=>db.from('tr_rebuild_experiences').select('*').eq('rebuild_id',row.id).eq('status','published').order('sort_order',{ascending:true}).order('id',{ascending:true})):[]
    return {row,source:contentSource(row),experiences}
  }
  const {data:parent,error:parentError}=await db.from('tr_content').select('*').eq('id',row.rebuild_id).eq('content_type','rebuild').eq('status','published').maybeSingle()
  if(parentError)throw parentError
  if(!parent)throw new Error('This Rebuild is no longer available.')
  const experiences=await allRows(()=>db.from('tr_rebuild_experiences').select('*').eq('rebuild_id',parent.id).eq('status','published').order('sort_order',{ascending:true}).order('id',{ascending:true}))
  return {row,parent,experiences,source:contentSource(row,'rebuild_experience',parent)}
}
export async function uploadCommunityPhoto(photo,userId) {
  if(!photo)return null
  // Copy only the selected photo into the public Community bucket.
  const blob=await (await fetch(photo)).blob()
  const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':blob.type==='image/heic'?'heic':'jpg'
  const path=`${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const {error}=await db.storage.from('tr-community-media').upload(path,blob,{contentType:blob.type||'image/jpeg',upsert:false})
  if(error)throw error
  return db.storage.from('tr-community-media').getPublicUrl(path).data.publicUrl
}
export async function removeCommunityPhoto(url,userId) {
  if(!url)return
  const marker='/storage/v1/object/public/tr-community-media/'
  const start=url.indexOf(marker)
  if(start<0)return
  const path=decodeURIComponent(url.slice(start+marker.length).split('?')[0])
  if(!path.startsWith(`${userId}/`))return
  const {error}=await db.storage.from('tr-community-media').remove([path])
  if(error)console.error('Community media cleanup failed:',error)
}
export async function syncReverieShare(entry,user,firstName) {
  if(!user?.id||user.id==='prototype-user')throw new Error('Sign in to share with Community.')
  const find=()=>db.from('tr_community_posts').select('*').eq('user_id',user.id).eq('scrapbook_entry_id',entry.id).maybeSingle()
  let {data:existing,error:findError}=await find();if(findError)throw findError
  if(!entry.share){
    if(existing){const {error}=await db.from('tr_community_posts').delete().eq('id',existing.id).eq('user_id',user.id);if(error)throw error;await removeCommunityPhoto(existing.media_url,user.id)}
    return null
  }
  if(existing&&existing.status!=='published')throw new Error('This shared post has been removed. It cannot be republished from your scrapbook.')
  const target=sourceFromKey(entry.contentId,entry.source)
  let source={icon:'♡',label:'From My Reverie',type:'personal',momentDate:entry.date}
  if(target){try{const resolved=await resolveContentSource(target);source={...resolved.source,momentDate:entry.date}}catch(e){if(/no longer|does not link/.test(e.message))source={...source,originalTitle:entry.title};else throw e}}
  const {data:profile,error:profileError}=await db.from('tr_community_profiles').select('*').eq('user_id',user.id).maybeSingle()
  if(profileError)throw profileError
  const mediaUrl=await uploadCommunityPhoto(entry.photo,user.id)
  const payload={user_id:user.id,scrapbook_entry_id:entry.id,caption:[entry.title,entry.note].filter(Boolean).join('\n\n'),media_url:mediaUrl,media_type:mediaUrl?'image/*':null,media_position:entry.photoPosition||{x:50,y:50},source,tags:[target?.type||'personal'],author_name:profile?.display_name||firstName||'You',author_handle:profile?.handle||'@yourreverie',author_avatar_url:profile?.avatar_url||null,author_avatar_position:profile?.avatar_position||{x:50,y:50}}
  try {
    let result=existing?await db.from('tr_community_posts').update(payload).eq('id',existing.id).eq('user_id',user.id).eq('status','published').select('*').maybeSingle():await db.from('tr_community_posts').insert({...payload,status:'published'}).select('*').single()
    if(result.error?.code==='23505'){
      const again=await find();if(again.error)throw again.error;existing=again.data
      if(!existing||existing.status!=='published')throw new Error('This shared post is no longer available.')
      result=await db.from('tr_community_posts').update(payload).eq('id',existing.id).eq('user_id',user.id).eq('status','published').select('*').maybeSingle()
    }
    if(result.error)throw result.error
    if(!result.data)throw new Error('This shared post is no longer available.')
    if(existing?.media_url&&existing.media_url!==mediaUrl)await removeCommunityPhoto(existing.media_url,user.id)
    return result.data.id
  } catch(e){
    // A network failure can have an unknown commit outcome. Keep its photo
    // until a retry can resolve the unique scrapbook post safely.
    if(e.code&&/^[0-9A-Z]{5}$/.test(e.code))await removeCommunityPhoto(mediaUrl,user.id)
    throw e
  }
}
