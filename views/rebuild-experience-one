import {useEffect,useRef,useState} from 'react'
import {useRebuildWorkspace} from './rebuild-activity-player.js'
import {eligibleCards,makeId,photoStyle,summarizeScope} from '../lib/rebuild-activities.js'
import {contentSource} from '../lib/community-content.js'

export function RebuildExperienceOne(props){
 const workshop=props.blocks?.find(b=>b.id==='two-workshops')
 if(!workshop)return <RebuildEditorialExperience {...props}/>
 const start=props.blocks.find(b=>b.id==='two-start'),keeps=props.blocks.find(b=>b.id==='two-keeps')
 const blocks=[{...start,id:'one-discover'},{...workshop,id:'one-evening'},{...keeps,id:'one-result'}]
 return <RebuildEditorialExperience {...props} blocks={blocks} experienceNumber={2} directWorkshops focusSourceScope={start?.sourceKey}/>
}

// Shared editorial presentation for the first two experiences. Content stays in Studio.
function RebuildEditorialExperience({ctx={},blocks=[],programId,experienceId,scope,cover,experienceNumber,experienceCount=12,directWorkshops=false,focusSourceScope,previewMode=false,onBack,onFinish,startAtBeginning=false}){
 const w=useRebuildWorkspace(ctx.user?.id,programId,previewMode)
 const [moving,setMoving]=useState(false)
 const frameRef=useRef(null),deckRef=useRef(null),contentRef=useRef(null),slideTimer=useRef(null),motionLock=useRef(false)
 const [welcome,setWelcome]=useState(true),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[own,setOwn]=useState(''),[adding,setAdding]=useState(false),[direction,setDirection]=useState(1)
 const suppressCardClick=useRef(0),gestureHandlers=useRef(null),slotTriggers=useRef({}),sheetRef=useRef(null),lastEditing=useRef(null),legacyWorkshopMigrated=useRef(false)
 const [editing,setEditing]=useState(null),[word,setWord]=useState(''),[color,setColor]=useState('#B286A0')
 const guard=useRef(false),pointer=useRef(null),order=useRef({key:'',ids:[]}),initialized=useRef(false)
 const {state,change,flush}=w
 const isTwo=blocks.some(b=>b.id==='two-sort'),sortBlock=blocks.find(b=>b.id==='two-sort'),sortAnswer=state[`${scope}:two-sort`]||{}
 const studioJourney=!isTwo&&blocks.some(b=>b.id==='one-evening'&&(b.cards||[]).some(c=>c.studio))
 const journeyFocusBlock=blocks.find(b=>b.id==='one-discover'),journeyFocusAnswer=state[`${scope}:one-discover`]||(focusSourceScope?state[`${focusSourceScope}:one-discover`]:null)||{}
 const journeyFocusIds=journeyFocusAnswer.selected||Object.entries(journeyFocusAnswer.decisions||{}).filter(([,label])=>label===journeyFocusBlock?.labels?.[0]).map(([id])=>id)
 const journeyFocusPool=[...(journeyFocusBlock?.cards||[]),...(journeyFocusAnswer.cardSnapshot||[]),...(journeyFocusAnswer.own||[])]
 const journeyFocuses=journeyFocusIds.map(id=>journeyFocusPool.find(c=>c.id===id)).filter(Boolean),journeyTags=[...new Set(journeyFocuses.flatMap(c=>c.tags||[]))]
 const releaseOnly=isTwo&&sortAnswer.releaseOnly
 const opening=blocks.find(b=>b.id==='one-discover')?.presentation?.opening
 const active=blocks.map((b,i)=>({b,i})).filter(({b})=>studioJourney?(directWorkshops?['one-evening','one-result']:['one-discover','one-evening','one-result']).includes(b.id):(!releaseOnly||!['two-ingredient','two-version','two-mood'].includes(b.id))&&(!b.showWhenKey||!b.showWhenTags?.length||(state[`memory:${b.showWhenKey}`]?.tags||[]).some(t=>b.showWhenTags.includes(t)))).map(({i})=>i)
 const requested=Math.max(0,Math.min(blocks.length-1,Number(state[`cursor:${scope}`])||0))
 const index=active.includes(requested)?requested:studioJourney?blocks.findIndex(b=>b.id==='one-evening'):(active.find(i=>i>requested)??active[0]??0),position=active.indexOf(index),block=blocks[index],key=`${scope}:${block?.id}`,value=state[key]||{},p=block?.presentation||{}
 const atWelcome=!!opening&&welcome
 useEffect(()=>{
  if(w.loading||!w.ready||initialized.current)return
  initialized.current=true
  if(directWorkshops&&!state[`${scope}:one-evening`]&&Object.keys(state).some(k=>k.startsWith(`${scope}:two-`))){change(`cursor:${scope}`,blocks.findIndex(b=>b.id==='one-evening'));setWelcome(true)}else if(startAtBeginning){
   change(`cursor:${scope}`,0)
   for(const item of blocks){
    const saved=state[`${scope}:${item.id}`]
    if(saved||item.id==='one-discover')change(`${scope}:${item.id}`,{...(saved||{}),deckIndex:0,sortIndex:0,slotIndex:0,slotPages:{},...(item.id==='two-sort'?{view:'browse'}:{})})
   }
   setWelcome(!!opening)
  }else if(Object.keys(state).some(k=>k.startsWith(`${scope}:`))||Number(state[`cursor:${scope}`])>0)setWelcome(false)
 },[w.loading,state])
 useEffect(()=>{setOwn('');setAdding(false);setMessage('');setEditing(null);setWord('');contentRef.current?.scrollTo?.({top:0,behavior:'auto'});contentRef.current?.focus?.({preventScroll:true})},[key,welcome,value.eveningView])
 useEffect(()=>()=>{clearTimeout(slideTimer.current)},[])
 useEffect(()=>{
  if(previewMode||typeof window==='undefined'||!window.visualViewport)return
  const viewport=window.visualViewport
  const resize=()=>{frameRef.current?.style.setProperty('--e1-viewport',`${viewport.height}px`);frameRef.current?.style.setProperty('--e1-viewport-top',`${viewport.offsetTop}px`)}
  resize();viewport.addEventListener('resize',resize);viewport.addEventListener('scroll',resize)
  return ()=>{viewport.removeEventListener('resize',resize);viewport.removeEventListener('scroll',resize)}
 },[previewMode,w.loading])

 const focusBlock=block?.id==='one-confirm'?blocks.find(b=>b.id==='one-discover'):null,focusAnswer=focusBlock?state[`${scope}:${focusBlock.id}`]||{}:{}
 const focusIds=focusAnswer.selected||Object.entries(focusAnswer.decisions||{}).filter(([,label])=>label===focusBlock?.labels?.[0]).map(([id])=>id)
 const focusTags=[...(focusBlock?.cards||[]),...(focusAnswer.cardSnapshot||[]),...(focusAnswer.own||[])].filter(c=>focusIds.includes(c.id)).flatMap(c=>c.tags||[])
 const memoryTags=focusBlock&&focusIds.length?focusTags:block?.matchKey?(state[`memory:${block.matchKey}`]?.tags||[]):Object.entries(state).filter(([k])=>k.startsWith('memory:')&&k!==`memory:${block?.rememberAs}`).flatMap(([,v])=>v.tags||[])
 const editCard=(c,answer=value)=>{const edit=answer.edits?.[c.id]||{};return {...c,title:edit.title?.trim()||c.title,body:typeof edit.body==='string'?edit.body:c.body}}
 const source=block?.sourceKey
 const earlier=[]
 if(block?.id==='two-sort'&&block.showEarlier&&source){
  for(const sourceId of ['one-discover','one-curiosity','one-surprise']){
   const answer=state[`${source}:${sourceId}`]||{},ids=answer.selected||Object.entries(answer.decisions||{}).filter(([,label])=>label==='Keep').map(([id])=>id)
   for(const id of ids){const c=[...(answer.cardSnapshot||[]),...(answer.own||[])].find(c=>c.id===id);if(c)earlier.push({...c,...(answer.edits?.[id]||{}),id:`earlier-${source}-${sourceId}-${id}`})}
  }
 }
 const retained=block?.type==='sort'?(value.cardSnapshot||[]).filter(c=>Object.hasOwn(value.assignments||{},c.id)&&!(block.cards||[]).some(x=>x.id===c.id)&&!(value.own||[]).some(x=>x.id===c.id)&&!earlier.some(x=>x.id===c.id)):[]
 const allCards=[...earlier,...(block?.cards||[]),...retained,...(value.own||[])].map(c=>editCard(c))
 const availableCards=eligibleCards(allCards,memoryTags,state['memory:preferences']?.tags||[])
 const unmatchedConfirmation=block?.id==='one-confirm'&&!availableCards.some(c=>(c.tags||[]).some(t=>memoryTags.includes(t)))
 let cards=availableCards.filter(c=>unmatchedConfirmation||!block?.onlyMatched||(c.tags||[]).some(t=>memoryTags.includes(t))||(value.own||[]).some(x=>x.id===c.id))
 if(w.ready){if(order.current.key!==key)order.current={key,ids:cards.map(c=>c.id)};for(const c of cards)if(!order.current.ids.includes(c.id))order.current.ids.push(c.id);cards.sort((a,b)=>order.current.ids.indexOf(a.id)-order.current.ids.indexOf(b.id))}
 const slotIndex=Math.max(0,Math.min((block?.slots?.length||1)-1,Number(value.slotIndex)||0)),slot=block?.slots?.[slotIndex]
 const richEvening=block?.id==='one-evening'&&((block.cards||[]).some(c=>['film','make','explore'].includes(c.category))||eveningKept(block,value).length>0),eveningCategory=block?.focusedJourney?'for-you':value.eveningCategory||(studioJourney?'for-you':'film')
 const eveningActive=richEvening?((block.cards||[]).find(c=>c.id===value.eveningOpenId)||(value.ideaSnapshot||[]).find(c=>c.id===value.eveningOpenId)):null
 const recommendations=eveningRecommendations(availableCards,journeyTags)
 const deck=richEvening?(eveningCategory==='for-you'?recommendations:cards.filter(c=>c.category===eveningCategory)):block?.type==='builder'?eligibleCards(slot?.options||[],memoryTags,state['memory:preferences']?.tags||[]):cards
 const cardIndex=Math.max(0,Math.min(deck.length-1,Number(richEvening?value.eveningPages?.[eveningCategory]:block?.type==='builder'?value.slotPages?.[slot?.id]:(value.deckIndex??value.sortIndex))||0)),card=deck[cardIndex]
 const selected=richEvening?(value.keptIds||[]).includes(card?.id):block?.type==='sort'?value.assignments?.[card?.id]===block.buckets?.[0]:block?.type==='choices'?value.decisions?.[card?.id]===block.labels?.[0]:block?.type==='builder'?value.slots?.[slot?.id]===card?.title:(value.selected||[]).includes(card?.id)
 const rejected=block?.type==='sort'?value.assignments?.[card?.id]===block.buckets?.[1]:block?.type==='choices'?value.decisions?.[card?.id]===block.labels?.[2]:(value.passed||[]).includes(card?.id)
 const positive=block?.type==='choices'?(block.labels?.[0]||'Keep'):null,negative=block?.labels?.[2]||'Pass'
 const set=patch=>{
  const next={...value,...patch,cardSnapshot:cards};if(block.type==='result'&&workshop)next.sourceWorkshopId=workshop.id;change(key,next)
  for(const field of ['name','note'])if(Object.prototype.hasOwnProperty.call(patch,field)){
   const resultBlock=blocks.find(b=>b.type==='result')
   if(block.type==='result'&&workshop)change(`${scope}:${workshop.id}`,{...(state[`${scope}:${workshop.id}`]||{}),[field]:patch[field]})
   else if(resultBlock&&['one-evening','one-curiosity','one-surprise'].includes(block.id))change(`${scope}:${resultBlock.id}`,{...(state[`${scope}:${resultBlock.id}`]||{}),[field]:patch[field],sourceWorkshopId:block.id})
  }

  if(block.rememberAs){const ids=next.selected||Object.entries(next.decisions||{}).filter(([,v])=>v===positive).map(([id])=>id),kept=[...(block.cards||[]),...(next.own||[])].filter(c=>ids.includes(c.id));change(`memory:${block.rememberAs}`,{ids,tags:[...new Set(kept.flatMap(c=>c.tags||[]))],titles:kept.map(c=>c.title)})}
 }
 const resetDrag=()=>{const node=deckRef.current;node?.removeAttribute('data-dragging');node?.removeAttribute('data-departing');node?.style.removeProperty('--drag-x');node?.style.removeProperty('--drag-turn')}
 const browse=delta=>{
  if(guard.current||motionLock.current||!deck.length)return
  const next=Math.max(0,Math.min(deck.length-1,cardIndex+delta))
  if(next===cardIndex){resetDrag();return}
  motionLock.current=true;setMoving(true);setDirection(delta)
  const node=deckRef.current
  node?.removeAttribute('data-reset');node?.removeAttribute('data-dragging');node?.setAttribute('data-departing','true')
  node?.style.setProperty('--drag-x',`${delta>0?-115:115}%`)
  node?.style.setProperty('--drag-turn',`${delta>0?-7:7}deg`)
  const reduce=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  slideTimer.current=setTimeout(()=>{
   node?.setAttribute('data-reset','true');resetDrag()
   if(richEvening)set({eveningPages:{...(value.eveningPages||{}),[eveningCategory]:next}});else if(block.type==='builder')set({slotPages:{...(value.slotPages||{}),[slot.id]:next}});else set({deckIndex:next})
   motionLock.current=false;setMoving(false)
  },reduce?0:180)
 }

 const assign=bucket=>{
  if(!card||guard.current||motionLock.current)return
  const previous=value.assignments?.[card.id]||'',assignments={...(value.assignments||{})}
  if(previous===bucket)delete assignments[card.id];else assignments[card.id]=bucket
  set({assignments,undo:{id:card.id,previous},releaseOnly:false})
 }
 const undoSort=()=>{if(!value.undo||guard.current||motionLock.current)return;const assignments={...(value.assignments||{})};if(value.undo.previous)assignments[value.undo.id]=value.undo.previous;else delete assignments[value.undo.id];set({assignments,deckIndex:cards.findIndex(c=>c.id===value.undo.id),undo:null,releaseOnly:false})}
 const keepEvening=idea=>{
  if(!idea||guard.current||motionLock.current)return
  const keptIds=value.keptIds||[],exists=keptIds.includes(idea.id),ids=exists?keptIds.filter(id=>id!==idea.id):[...keptIds,idea.id]
  set({keptIds:ids,ideaSnapshot:[...(value.ideaSnapshot||[]).filter(c=>c.id!==idea.id),idea]})
 }
 const openEvening=(idea,e={})=>{
  if(!idea||guard.current||motionLock.current||(e.detail!==undefined&&e.detail!==0&&Date.now()<suppressCardClick.current))return
  set({eveningOpenId:idea.id,eveningView:e.edit&&value.creations?.[idea.id]?'make':'detail'});contentRef.current?.scrollTo?.({top:0,behavior:'auto'})
 }
 const decide=keep=>{
  if(!card||guard.current||motionLock.current)return
  if(richEvening){keepEvening(card);return}
  if(block.type==='sort'){assign(block.buckets?.[keep?0:1]);return}
  if(block.type==='builder'){const slots={...(value.slots||{})};if(selected)delete slots[slot.id];else slots[slot.id]=card.title;set({slots});return}
  if(block.type==='choices'){let decisions={...(value.decisions||{})};if(keep&&Number(block.maxChoices)===1)for(const id of Object.keys(decisions))if(decisions[id]===positive)delete decisions[id];const label=keep?positive:negative;decisions[card.id]=(keep?selected:rejected)?'':label;set({decisions});return}
  let chosen=value.selected||[],passed=value.passed||[]
  if(keep){chosen=selected?chosen.filter(id=>id!==card.id):[...chosen,card.id];passed=passed.filter(id=>id!==card.id)}else {chosen=chosen.filter(id=>id!==card.id);passed=rejected?passed.filter(id=>id!==card.id):[...passed,card.id]}
  set({selected:chosen,passed})
 }
 const addOwn=()=>{if(guard.current||motionLock.current)return;const title=own.trim();if(!title)return;if(block.type==='builder')set({slots:{...(value.slots||{}),[slot.id]:title}});else {const c={id:makeId(),title,tags:[]};set({own:[...(value.own||[]),c],deckIndex:cards.length,...(block.type==='sort'?{assignments:{...(value.assignments||{}),[c.id]:block.buckets?.[0]},releaseOnly:false}:block.type==='choices'?{decisions:{...(Number(block.maxChoices)===1?{}:value.decisions||{}),[c.id]:positive}}:{selected:[...(value.selected||[]),c.id]})})}setOwn('');setAdding(false)}
 const chosenCards=(item,answer=state[`${scope}:${item.id}`]||{})=>{
  const pool=[...(item.cards||[]),...(answer.cardSnapshot||[]),...(answer.own||[])]
  const ids=answer.selected||Object.entries(answer.decisions||{}).filter(([,label])=>label===item.labels?.[0]).map(([id])=>id)
  return ids.map(id=>pool.find(c=>c.id===id)).filter(Boolean).map(c=>editCard(c,answer))
 }
 const sortCards=()=>{
  const answer=state[`${scope}:two-sort`]||{},pool=[...(sortBlock?.cards||[]),...(answer.cardSnapshot||[]),...(answer.own||[])]
  return Object.keys(answer.assignments||{}).map(id=>pool.find(c=>c.id===id)).filter(Boolean).map(c=>editCard(c,answer))
 }
 const focused=sortCards().find(c=>c.id===sortAnswer.focusId)
 const versionBlock=blocks.find(b=>b.id==='two-version'),versionAnswer=state[`${scope}:two-version`]||{},formSlot=versionBlock?.slots?.[1],formTitle=versionAnswer.slots?.[formSlot?.id]||''
 const creationKind=twoCreationKind(formTitle)
 const openFocus=async id=>{if(guard.current||motionLock.current)return;guard.current=true;setBusy(true);try{change(`${scope}:two-sort`,{...sortAnswer,focusId:id,releaseOnly:false,view:'collection'});if(!await flush())return;await depart();change(`cursor:${scope}`,blocks.findIndex(b=>b.id==='two-ingredient'));await flush()}finally{guard.current=false;setBusy(false)}}
 const journeyItems=answer=>[...(journeyFocuses.length?[{id:'one-discover',title:'What I wanted to make room for',items:journeyFocuses.map(c=>c.title)}]:[]),...eveningRows(blocks.find(b=>b.id==='one-evening'),answer)]
 const personalItems=()=>studioJourney?journeyItems(state[`${scope}:one-evening`]||{}):isTwo?twoPersonalItems(blocks,state,scope,sortCards(),releaseOnly):summarizeScope(blocks.filter((_,i)=>active.includes(i)),state,scope).flatMap(row=>{
  const item=blocks.find(b=>b.id===row.id),answer=item?state[`${scope}:${item.id}`]||{}:{}
  if(item?.type==='choices')return [{...row,items:chosenCards(item).map(c=>c.title)}]
  if(item?.id==='one-evening'&&(item.cards||[]).some(c=>c.category))return [row]
  if(item?.type!=='collection')return [row]
  const kept=chosenCards(item),first=kept.find(c=>c.id===answer.firstInterestId),picked=kept.find(c=>c.id===answer.picked)
  const items=[...(answer.name?[answer.name]:[]),...kept.map(c=>c.body?`${c.title}: ${c.body}`:c.title),...(first?[`First to explore: ${first.title}`]:[]),...(picked?[`My draw: ${picked.title}`]:[]),...(answer.note?[answer.note]:[])]
  const boards=kept.flatMap(c=>{const board=answer.boards?.[c.id]||{};const details=[...(board.words||[]),...(board.colors?.length?[`Colors: ${board.colors.join(', ')}`]:[])];return details.length?[{id:`${item.id}:board:${c.id}`,title:c.title,items:details,photo:c.photo||''}]:[]})
  return [{...row,items},...boards]
 }).concat(active.some(i=>blocks[i]?.id==='one-evening')?eveningRows(blocks.find(b=>b.id==='one-evening'),state[`${scope}:one-evening`]||{}):[])

 const workshop=blocks.find((b,i)=>active.includes(i)&&['one-evening','one-curiosity','one-surprise'].includes(b.id))
 const workshopValue=workshop?state[`${scope}:${workshop.id}`]||{}:{}
 const workshopCards=workshop?chosenCards(workshop):[]
 const workshopSlots=(workshop?.slots||[]).filter(s=>workshopValue.slots?.[s.id])
 useEffect(()=>{
  if(w.loading||!w.ready||legacyWorkshopMigrated.current)return
  legacyWorkshopMigrated.current=true
  const resultBlock=blocks.find(b=>b.type==='result'),resultKey=`${scope}:${resultBlock?.id}`,savedResult=state[resultKey]
  if(workshop&&savedResult&&!savedResult.sourceWorkshopId){
   const savedWorkshop=state[`${scope}:${workshop.id}`]||{}
   change(`${scope}:${workshop.id}`,{...savedWorkshop,...(!savedWorkshop.name&&savedResult.name?{name:savedResult.name}:{}),...(!savedWorkshop.note&&savedResult.note?{note:savedResult.note}:{})})
   change(resultKey,{...savedResult,sourceWorkshopId:workshop.id})
  }
 },[w.loading,state])
 const activateWorkshop=target=>{
  const targetBlock=blocks[target],resultBlock=blocks.find(b=>b.type==='result')
  if(!targetBlock||!resultBlock||!['one-evening','one-curiosity','one-surprise'].includes(targetBlock.id))return
  const saved=state[`${scope}:${targetBlock.id}`]||{},resultKey=`${scope}:${resultBlock.id}`
  change(resultKey,{...(state[resultKey]||{}),name:saved.name||'',note:saved.note||'',sourceWorkshopId:targetBlock.id})
 }
 const focusCount=block?.type==='choices'?Object.values(value.decisions||{}).filter(v=>v===positive).length:(value.selected||[]).length

 const eveningBlock=blocks.find(b=>b.id==='one-evening'),eveningAnswer=state[`${scope}:one-evening`]||{}
 const creationItems=personalItems().filter(r=>['one-evening','one-curiosity','one-surprise'].includes(r.id))
 const result=()=>({title:studioJourney?(workshopValue.name||'A little room for me'):workshopValue.name||value.name||(isTwo?versionAnswer.name:'')||(workshop?.presentation?.title||workshop?.title||block?.resultTitle||block?.title||'').replace(/\n/g,' '),layout:value.layout||'mixed',scope,experienceId,private:false,items:personalItems(),updatedAt:new Date().toISOString()})
 const isEvening=block?.id==='one-evening',isVersion=block?.id==='two-version',isCanvas=isEvening||isVersion,isSort=block?.id==='two-sort',isCuriosity=block?.id==='one-curiosity',isSurprise=block?.id==='one-surprise'
 const kept=isCuriosity||isSurprise?chosenCards(block):[]
 const activeInterest=kept.find(c=>c.id===value.activeInterestId)
 const picked=kept.find(c=>c.id===value.picked)
 const collectionView=(isCuriosity&&['collection','explore'].includes(value.view))||(isSort&&value.view==='collection')
 const drawView=isSurprise&&['draw','reshape'].includes(value.view)&&!!picked
 const setBoard=patch=>{if(!activeInterest)return;set({boards:{...(value.boards||{}),[activeInterest.id]:{...(value.boards?.[activeInterest.id]||{}),...patch}}})}
 const drawSurprise=()=>{
  if(guard.current||motionLock.current||!kept.length)return
  const remaining=kept.filter(c=>!(value.drawn||[]).includes(c.id)),pool=remaining.length?remaining:kept
  const choice=pool[Math.floor(Math.random()*pool.length)]
  set({picked:choice.id,drawn:remaining.length?[...(value.drawn||[]),choice.id]:[choice.id],drawCount:(Number(value.drawCount)||0)+1,view:'draw'})
 }
 const remixEvening=()=>{
  if(guard.current||motionLock.current)return
  const slots={...(value.slots||{})}
  for(const ingredient of block.slots||[]){const options=eligibleCards(ingredient.options||[],memoryTags,state['memory:preferences']?.tags||[]),different=options.filter(c=>c.title!==slots[ingredient.id]),pool=different.length?different:options;if(pool.length)slots[ingredient.id]=pool[Math.floor(Math.random()*pool.length)].title}
  set({slots})
 }
 const openIngredient=(ingredient,i)=>{if(guard.current||motionLock.current)return;set({slotIndex:i});setOwn('');setAdding(false);setEditing(ingredient.id)}
 const closeIngredient=async()=>{
  if(guard.current||motionLock.current)return
  guard.current=true;setBusy(true)
  try{if(!await flush())return;setEditing(null)}finally{guard.current=false;setBusy(false)}
 }
 const depart=async(backwards=false)=>{
  const node=contentRef.current
  if(!node?.animate||typeof window==='undefined'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return
  try{await node.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${backwards?16:-16}px)`}],{duration:130,easing:'ease-in',fill:'forwards'}).finished}catch(e){}
 }
 const next=async(finishAfterSave=false)=>{
  if(editing!==null)return
  if(guard.current||motionLock.current)return;guard.current=true;setBusy(true);setMessage('')
  try{
   if(atWelcome){await depart();setWelcome(false);setDirection(1);return}
   if(block.id==='one-discover'&&!Object.values(value.decisions||{}).some(x=>x===positive)){setMessage('Bring back one possibility to give your experience a focus.');return}
   if(block.id==='one-direction'&&!Object.values(value.decisions||{}).some(x=>x===positive)){setMessage('Choose a workshop to open it.');return}
   if(richEvening){
    const view=value.eveningView||'browse'
    if(view==='browse'){set({eveningView:'kept'});contentRef.current?.scrollTo?.({top:0,behavior:'auto'});return}
    if(view==='detail'&&eveningActive){
     if(eveningActive.category==='film'){set({keptIds:[...new Set([...(value.keptIds||[]),eveningActive.id])],ideaSnapshot:[...(value.ideaSnapshot||[]).filter(c=>c.id!==eveningActive.id),eveningActive],eveningView:'kept'});await flush();return}
     set({eveningView:'make',creations:{...(value.creations||{}),[eveningActive.id]:eveningCreation(eveningActive,value)}});contentRef.current?.scrollTo?.({top:0,behavior:'auto'});return
    }
    if(view==='make'&&eveningActive&&eveningActive.format==='blueprint'&&eveningCreation(eveningActive,value).phase!=='revealed'){if(eveningCreation(eveningActive,value).phase==='exposing'||!eveningCreation(eveningActive,value).design.objects.length)return;set({creations:{...(value.creations||{}),[eveningActive.id]:{...eveningCreation(eveningActive,value),phase:'exposing'}}});await flush();return}
    if(view==='make'&&eveningActive){
     const savedEvening={...value,keptIds:[...new Set([...(value.keptIds||[]),eveningActive.id])],ideaSnapshot:[...(value.ideaSnapshot||[]).filter(c=>c.id!==eveningActive.id),eveningActive],creations:{...(value.creations||{}),[eveningActive.id]:{...eveningCreation(eveningActive,value),savedAt:new Date().toISOString(),...(eveningActive.format==='mystery'?{puzzleRevealed:true}:{})}}}
     set(savedEvening);if(!await flush())return
     if(studioJourney&&finishAfterSave===true){change(`result:${scope}`,{...result(),items:journeyItems(savedEvening)});if(!await flush())return;const ok=await onFinish?.();if(ok===false)setMessage('Your creation is saved. Please try continuing again.');return}
     set({...savedEvening,eveningView:'kept'});await flush();return
    }
    if(!eveningKept(block,value).length&&!Object.values(value.slots||{}).some(Boolean)){set({eveningView:'browse'});return}
    if(studioJourney){change(`result:${scope}`,result());if(!await flush())return;const ok=await onFinish?.();if(ok===false)setMessage('Your experience could not finish. Please try again.');return}
   }
   if(isSort){
    if(!collectionView){set({view:'collection'});return}
    const available=sortCards().filter(c=>[block.buckets?.[0],block.buckets?.[2]].includes(value.assignments?.[c.id])),focus=available.find(c=>c.id===value.focusId)||available[0]
    set({focusId:focus?.id||'',releaseOnly:!focus})
    if(!await flush())return
    await depart();change(`cursor:${scope}`,blocks.findIndex(b=>b.id===(focus?'two-ingredient':'two-result')));await flush();return
   }
   if(isCuriosity&&kept.length&&!collectionView){set({view:'collection'});return}
   if(isSurprise&&kept.length&&!drawView){const remaining=kept.filter(c=>!(value.drawn||[]).includes(c.id)),pool=remaining.length?remaining:kept,choice=pool[Math.floor(Math.random()*pool.length)];set({picked:choice.id,drawn:remaining.length?[...(value.drawn||[]),choice.id]:[choice.id],drawCount:(Number(value.drawCount)||0)+1,view:'draw'});return}
   if(block.type==='result')change(`result:${scope}`,result())
   if(!await flush())return
   if(block.type==='builder'&&!isCanvas&&slotIndex<(block.slots?.length||0)-1){await depart();set({slotIndex:slotIndex+1});setDirection(1);return}
   if(position===active.length-1){const ok=await onFinish?.();if(ok===false)setMessage('Your experience could not finish. Please try again.');return}
   await depart();if(studioJourney&&block.id==='one-discover'){const target=blocks.find(b=>b.id==='one-evening'),saved=state[`${scope}:one-evening`]||{};change(`${scope}:one-evening`,{...saved,eveningView:'browse',eveningCategory:'for-you',eveningPages:{...(saved.eveningPages||{}),'for-you':0}});activateWorkshop(blocks.indexOf(target))}else if(block.id==='one-direction')activateWorkshop(active[position+1]);change(`cursor:${scope}`,active[position+1]);await flush();setDirection(1)
  }catch(e){setMessage('Your work is still here. Please try again.')}finally{guard.current=false;setBusy(false)}
 }
 const back=async()=>{if(editing!==null){await closeIngredient();return}if(guard.current||motionLock.current)return;guard.current=true;setBusy(true);try{if(!await flush())return;if(atWelcome){onBack?.();return}if(richEvening&&value.eveningView&&value.eveningView!=='browse'){set({eveningView:value.eveningView==='make'?'detail':'browse'});contentRef.current?.scrollTo?.({top:0,behavior:'auto'});return}if(collectionView){set({view:value.view==='explore'?'collection':'browse'});return}if(drawView){set({view:value.view==='reshape'?'draw':'browse'});return}if(block.type==='builder'&&!isCanvas&&slotIndex>0){await depart(true);set({slotIndex:slotIndex-1});setDirection(-1);return}if(position>0){await depart(true);change(`cursor:${scope}`,active[position-1]);await flush();setDirection(-1)}else if(opening){await depart(true);setWelcome(true);setDirection(-1);} else onBack?.()}finally{guard.current=false;setBusy(false)}}
 const pause=async()=>{if(guard.current||motionLock.current)return;guard.current=true;setBusy(true);try{if(await flush())onBack?.()}finally{guard.current=false;setBusy(false)}}
 const scrapbook=async()=>{change(`result:${scope}`,result());if(!await flush())return;const r=result();ctx.openReverieFromContent?.(contentSource({id:experienceId,title:r.title},'rebuild_experience',{id:programId,title:''}),{title:r.title,note:r.items.map(i=>`${i.title}\n${i.items.join('\n')}`).join('\n\n'),photo:cover?.photo||null})}
 const tapCard=async(e={})=>{
  if(guard.current||motionLock.current||!card||(e.detail!==0&&Date.now()<suppressCardClick.current))return
  decide(true)
  if(selected||block.id!=='one-direction')return
  const target=blocks.findIndex((b,i)=>i>index&&b.showWhenKey===block.rememberAs&&(b.showWhenTags||[]).some(t=>(card.tags||[]).includes(t)))
  if(target<0)return
  guard.current=true;setBusy(true);setMessage('')
  try{if(!await flush())return;await depart();activateWorkshop(target);change(`cursor:${scope}`,target);await flush();setDirection(1)}
  catch(e){setMessage('Your work is still here. Please try again.')}
  finally{guard.current=false;setBusy(false)}
 }
 const touchStart=e=>{
  if(e.pointerType==='touch')return
  if(motionLock.current||guard.current||e.isPrimary===false||e.button>0||e.target.closest?.('button:not(.e1-card-select),input,textarea,select,a'))return
  suppressCardClick.current=0
  deckRef.current?.removeAttribute('data-reset')
  const captureTarget=e.pointerType==='native-touch'?null:(e.target.closest?.('.e1-card-select')||e.currentTarget)
  pointer.current={x:e.clientX,y:e.clientY,id:e.pointerId,horizontal:false,input:e.pointerType,captureTarget}
  if(captureTarget)try{captureTarget.setPointerCapture?.(e.pointerId)}catch(e){}
 }
 const touchMove=e=>{
  if(e.pointerType==='touch')return
  const start=pointer.current
  if(!start||start.id!==e.pointerId)return
  const dx=e.clientX-start.x,dy=e.clientY-start.y
  if(Math.abs(dx)>8||Math.abs(dy)>8)suppressCardClick.current=Date.now()+600
  if(!start.horizontal){
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){pointer.current=null;return}
   if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy)*1.3)return
   start.horizontal=true
  }
  if(e.cancelable)e.preventDefault()
  const edge=dx>0?cardIndex===0:cardIndex>=deck.length-1
  deckRef.current?.setAttribute('data-dragging','true')
  deckRef.current?.style.setProperty('--drag-x',`${dx*(edge ? .18 : .88)}px`)
  deckRef.current?.style.setProperty('--drag-turn',`${Math.max(-7,Math.min(7,dx/32))}deg`)
 }
 const touchEnd=e=>{
  if(e.pointerType==='touch')return
  const start=pointer.current;pointer.current=null
  if(!start||start.id!==e.pointerId)return
  const dx=e.clientX-start.x,dy=e.clientY-start.y
  if(Math.abs(dx)>8||Math.abs(dy)>8)suppressCardClick.current=Date.now()+600
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3)browse(dx<0?1:-1)
  else resetDrag()
 }
 const cancelDrag=()=>{suppressCardClick.current=Date.now()+600;pointer.current=null;resetDrag()}
 const lostCapture=e=>{
  const start=pointer.current
  if(!start||start.input==='native-touch'||e.pointerType==='touch'||e.pointerId!==start.id||e.target!==start.captureTarget)return
  if(start.captureTarget?.hasPointerCapture?.(start.id))return
  cancelDrag()
 }
 // Touch listeners stay on the deck itself, including inside the conversation preview's shadow root.
 // Their non-passive move handler claims only horizontal gestures; vertical reading remains native.
 gestureHandlers.current={start:touchStart,move:touchMove,end:touchEnd,cancel:cancelDrag}
 useEffect(()=>{
  const node=deckRef.current
  if(!node?.addEventListener)return
  const point=e=>Array.from(e.changedTouches||[]).find(t=>!pointer.current||t.identifier===pointer.current.id)
  const event=(e,t)=>({clientX:t.clientX,clientY:t.clientY,pointerId:t.identifier,pointerType:'native-touch',isPrimary:true,button:0,target:e.target,currentTarget:node,cancelable:e.cancelable,preventDefault:()=>e.preventDefault()})
  const start=e=>{if(e.touches.length!==1){gestureHandlers.current.cancel();return}const t=e.touches[0];gestureHandlers.current.start(event(e,t))}
  const move=e=>{if(e.touches.length!==1){gestureHandlers.current.cancel();return}const t=point(e);if(t)gestureHandlers.current.move(event(e,t))}
  const end=e=>{const t=point(e);if(t)gestureHandlers.current.end(event(e,t))}
  const cancel=()=>gestureHandlers.current.cancel()
  node.addEventListener('touchstart',start,{passive:true})
  node.addEventListener('touchmove',move,{passive:false})
  node.addEventListener('touchend',end,{passive:true})
  node.addEventListener('touchcancel',cancel,{passive:true})
  return ()=>{node.removeEventListener('touchstart',start);node.removeEventListener('touchmove',move);node.removeEventListener('touchend',end);node.removeEventListener('touchcancel',cancel)}
 },[key,atWelcome,slotIndex,w.loading,editing,collectionView,drawView,value.eveningCategory,value.eveningView])

 useEffect(()=>{if(editing!==null)sheetRef.current?.querySelector?.('button')?.focus?.({preventScroll:true});else if(lastEditing.current)slotTriggers.current[lastEditing.current]?.focus?.({preventScroll:true});lastEditing.current=editing},[editing])

 if(w.loading)return <section ref={frameRef} className={`tr-e1 ${previewMode?'e1-preview':''}`}><Style/><header className="e1-top"><button type="button" className="e1-text-button" onClick={onBack}>‹ Rebuild</button></header><div className="e1-loading" role="status"><PetalMark/><p>Opening your experience…</p><div className="e1-loading-paper" aria-hidden="true"><i/><i/><i/></div></div></section>
 if(!w.ready&&!previewMode)return <section ref={frameRef} className="tr-e1"><Style/><header className="e1-top"><button type="button" className="e1-text-button" onClick={onBack}>‹ Rebuild</button></header><div className="e1-loading" role="alert"><p>{w.error}</p><button onClick={w.retry}>Try again</button></div></section>
 if(!block)return <p>No screens have been added to this experience yet.</p>
 const hero=cover?.photo?cover:(blocks.find(b=>b.id==='one-discover')?.photo?blocks.find(b=>b.id==='one-discover'):null)
 const title=richEvening?(value.eveningView==='kept'?(value.name||(block.focusedJourney?'A little more me.':studioJourney?'Yours to keep.':'Your evening, so far.')):['detail','make'].includes(value.eveningView)&&eveningActive?(value.eveningView==='make'&&eveningActive.format==='blueprint'?'Make a botanical print':eveningActive.title):(studioJourney?(block.journeyTitle||'Somewhere to begin.'):block.eveningTitle||p.title||block.title)):studioJourney&&block.type==='result'?'Look what you made.':block.id==='two-mood'&&creationKind!=='mood'?(formTitle||block.title):(p.title??block.title),body=richEvening?(!value.eveningView||value.eveningView==='browse'?(studioJourney?'':block.eveningIntro||''):''):block.id==='two-mood'&&creationKind!=='mood'?'':(p.body??block.body),quote=block.quoteKey?state[block.quoteKey]?.text:null
 const kind=richEvening?'evening':atWelcome?'hero':block.type==='lesson'?'reading':block.type==='builder'?'create':block.type==='result'?'finish':block.id==='one-direction'?'discover':block.id==='one-curiosity'?'curiosity':block.id==='one-surprise'?'surprise':'cards'
 const phase=atWelcome?'True Reverie':block.type==='sort'?'Make it yours':block.type==='collage'?'Create':block.type==='lesson'?'Learn':block.type==='result'?'Keep':block.type==='builder'?'Create':block.id==='one-confirm'?'Make it yours':'Discover'
 const label=atWelcome?opening.button:richEvening?(value.eveningView==='detail'?(eveningActive?.category==='film'?'Keep this film':'Start designing'):value.eveningView==='make'?(eveningActive?.format==='blueprint'&&eveningCreation(eveningActive,value).phase!=='revealed'?(eveningCreation(eveningActive,value).phase==='exposing'?'Developing…':'Expose my print'):(studioJourney?'Save & continue':'Keep my creation')):value.eveningView==='kept'?(eveningKept(block,value).length||Object.values(value.slots||{}).some(Boolean)?(studioJourney?'Keep & finish':'Keep my evening'):'Find an idea'):`${studioJourney?'My creations':'My evening'} · ${eveningKept(block,value).length}`):studioJourney&&block.id==='one-discover'?'Find a place to begin':isSort?(collectionView?(sortCards().some(c=>[block.buckets?.[0],block.buckets?.[2]].includes(value.assignments?.[c.id]))?'Make a new version':'Keep this collection'):'See my collection'):block.id==='two-learn'?(block.continueLabel||"Let's sort it out"):isVersion?'Create my version':block.id==='two-mood'?'Keep my version':atWelcome?opening.button:isCuriosity&&kept.length&&!collectionView?'Open my collection':isSurprise&&kept.length&&!drawView?'Draw from my collection':block.type==='builder'&&!isCanvas&&slotIndex<(block.slots?.length||0)-1?'Next ingredient':(p.button||block.continueLabel||(position===active.length-1?'Keep and finish':'Continue'))
 const pickerContent=<>
     {card?<div ref={deckRef} data-photo={block.id==='one-direction'&&!!(card?.photo||hero?.photo)} className="e1-deck" aria-label="Swipeable ideas" role="region" aria-roledescription="carousel" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();browse(1)}if(e.key==='ArrowLeft'){e.preventDefault();browse(-1)}}} onPointerDown={touchStart} onPointerMove={touchMove} onPointerUp={touchEnd} onPointerCancel={e=>{if(e?.pointerType!=='touch')cancelDrag()}} onLostPointerCapture={lostCapture} style={{touchAction:'pan-y'}}>
      <div className="e1-card-motion"><article aria-live="polite" data-kept={selected} className={`e1-paper ${block.id==='one-direction'?'e1-arched':''} ${block.id==='one-direction'&&(card.photo||hero?.photo)?'e1-illustrated':''}`} key={card.id}>
       {block.id==='one-direction'&&(card.photo||hero?.photo)&&<div className="e1-workshop-photo"><img draggable={false} src={card.photo||hero.photo} alt="" style={photoStyle(card.photo?card:hero)}/></div>}
       <span className="e1-card-number" aria-hidden="true">{String(cardIndex+1).padStart(2,'0')}</span><PetalMark/>
       {card.photo&&block.id!=='one-direction'&&<div className="e1-card-photo"><img draggable={false} src={card.photo} alt={card.alt||''} style={photoStyle(card)}/></div>}<h2>{card.title}</h2>{card.body&&<p>{card.body}</p>}
       <button type="button" className="e1-card-select" aria-label={`${selected?'Remove':block.id==='one-direction'?'Open':'Keep'} ${card.title}`} aria-pressed={selected} disabled={busy||moving} onClick={tapCard}/>
      </article></div>
      <div className="e1-browse"><button type="button" disabled={cardIndex===0||busy||moving} aria-label="Previous card" onClick={()=>browse(-1)}>‹</button><span className="e1-browse-caption">{block.type==='sort'&&value.assignments?.[card.id]?value.assignments[card.id]:selected?'✓ Kept':'Swipe'} · {cardIndex+1} / {deck.length}</span><button type="button" disabled={cardIndex>=deck.length-1||busy||moving} aria-label="Next card" onClick={()=>browse(1)}>›</button></div>
     </div>:<p className="e1-copy">Add something of your own to begin.</p>}
     {!!card&&<div className="e1-decisions"><button type="button" disabled={busy||moving} aria-pressed={selected} onClick={()=>decide(true)}>{p.keepLabel||(block.id==='one-discover'?'Bring back':block.type==='builder'?'Choose this':block.type==='sort'?block.buckets?.[0]:block.id==='two-ingredient'?'Keep this part':block.type==='choices'?'Explore this':block.labels?.[0]||'Keep')}</button>{block.type!=='builder'&&<button type="button" disabled={busy||moving} aria-pressed={rejected} onClick={()=>decide(false)}>{p.passLabel||(block.type==='sort'?block.buckets?.[1]:block.id==='two-ingredient'?'Skip this part':'Leave behind')}</button>}</div>}
     {isSort&&<><div className="e2-sort-tools">{block.buckets?.[2]&&<button type="button" className="e1-text-button" aria-pressed={value.assignments?.[card?.id]===block.buckets[2]} disabled={busy||moving} onClick={()=>assign(block.buckets[2])}>Not sure</button>}<button type="button" className="e1-text-button" disabled={!value.undo||busy||moving} onClick={undoSort}>Undo</button>{card&&<button type="button" className="e1-text-button" onClick={()=>set({editCard:!value.editCard})} aria-expanded={!!value.editCard}>Edit card</button>}</div>{value.editCard&&card&&<label className="e2-card-edit">Your words<input aria-label="Edit this idea" maxLength={160} value={value.edits?.[card.id]?.title??card.title} onChange={e=>set({edits:{...(value.edits||{}),[card.id]:{...(value.edits?.[card.id]||{}),title:e.target.value}}})}/></label>}</>}
     {block.type==='builder'&&value.slots?.[slot?.id]&&<p className="e1-chosen"><span aria-hidden="true">✓</span> {value.slots[slot.id]}</p>}
     {(block.allowOwn||(block.type==='builder'&&block.shuffle))&&<div className="e1-own"><span className="e1-selection-count" role="status">{block.type==='builder'||block.type==='collection'?'':focusCount?`${focusCount} ${focusCount===1?'idea':'ideas'} kept`:''}</span>{block.allowOwn&&<button type="button" className="e1-text-button" aria-expanded={adding} disabled={busy||moving} onClick={()=>setAdding(!adding)}>＋ Add my own</button>}{block.type==='builder'&&block.shuffle&&<button type="button" className="e1-text-button" disabled={busy||moving} aria-label="Surprise me with this ingredient" onClick={()=>{const pool=eligibleCards(slot?.options||[],memoryTags,state['memory:preferences']?.tags||[]);if(pool.length)set({slots:{...(value.slots||{}),[slot.id]:pool[Math.floor(Math.random()*pool.length)].title}})}}>Surprise me</button>}{adding&&<div className="e1-own-form"><input autoFocus aria-label="My own words" value={own} onChange={e=>setOwn(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addOwn()}}} placeholder="Something that feels like you…"/><button type="button" onClick={addOwn} disabled={!own.trim()}>Add</button></div>}</div>}
     {block.id==='one-discover'&&focusCount>0&&<details className="e1-optional"><summary>My focuses · {focusCount}</summary>{chosenCards(block).map(c=><p key={c.id}>{c.title}</p>)}</details>}
     {block.type==='collection'&&(value.selected||[]).length>0&&<details className="e1-optional"><summary>{block.id==='one-confirm'?'My choices':'My collection'} · {value.selected.length}</summary>{cards.filter(c=>value.selected.includes(c.id)).map(c=><p key={c.id}>{c.title}</p>)}</details>}
     {!isSurprise&&block.shuffle&&block.type==='collection'&&(value.selected||[]).length>0&&<div className="e1-surprise"><button type="button" onClick={()=>{const kept=cards.filter(c=>value.selected.includes(c.id)),undrawn=kept.filter(c=>!(value.drawn||[]).includes(c.id)),pool=undrawn.length?undrawn:kept;if(!pool.length)return;const picked=pool[Math.floor(Math.random()*pool.length)];set({picked:picked.id,drawn:undrawn.length?[...(value.drawn||[]),picked.id]:[picked.id]})}}>Surprise me</button>{value.picked&&<p>{cards.find(c=>c.id===value.picked)?.title}</p>}</div>}

 </>
 return <section ref={frameRef} aria-label={isTwo||experienceNumber===2?"Experience 2":"Experience 1"} className={`tr-e1 e1-${kind} ${previewMode?'e1-preview':''} ${!atWelcome&&block.id==='one-discover'?'e1-focus':''}`}>
  <Style/>
  {atWelcome&&hero&&<div className="e1-hero-photo"><img src={hero.photo} alt="" style={photoStyle(hero)}/></div>}
  <header className="e1-top" inert={editing!==null?'':undefined}>
   <button type="button" className="e1-text-button" disabled={busy||moving} onClick={back}>‹ {atWelcome?'Rebuild':'Back'}</button>
   <span className="e1-phase">{studioJourney||isTwo?(atWelcome&&(experienceNumber||1)===1?`${experienceCount} experiences`:`Experience ${experienceNumber||(isTwo?2:1)} of ${experienceCount}`):phase}<span className="e1-sr-only">{!atWelcome?`, screen ${position+1} of ${active.length}`:''}</span></span>
   <button type="button" className="e1-text-button e1-header-pause" aria-label={previewMode?'Close preview':'Save and pause'} disabled={busy||moving} onClick={pause}>{previewMode?'Close':'Pause'}</button>
  </header>
  {!atWelcome&&<div className="e1-progress" aria-hidden="true"><span style={{width:`${((position+1)/active.length)*100}%`}}/></div>}
  <main ref={contentRef} inert={editing!==null?'':undefined} tabIndex={-1} className={`e1-content e1-direction-${direction}`} key={`${atWelcome?'opening':key}:${isCanvas?'canvas':slotIndex}`}>
   {atWelcome?<><p className="e1-eyebrow">{opening.eyebrow||'Make room for you'}</p><h1><EditorialTitle text={opening.title}/></h1>{opening.body&&<p className="e1-copy">{opening.body}</p>}</>:<>
    {(p.eyebrow||block.type==='builder')&&<p className="e1-eyebrow">{isCanvas?p.eyebrow:block.type==='builder'?title.replace(/\n/g,' '):p.eyebrow}</p>}
    <h1 className={block.id==='one-discover'?'e1-focus-title':''}><EditorialTitle text={block.type==='builder'&&!isCanvas?slot?.title:title}/></h1>
    {body&&<p className="e1-copy">{body}</p>}
    {isTwo&&focused&&['two-ingredient','two-version','two-mood'].includes(block.id)&&<p className="e2-focus-context">{focused.title}</p>}
    {block.photo&&block.type!=='result'&&!isCanvas&&<figure className="e1-stage-photo"><img src={block.photo} alt={block.alt||''} style={photoStyle(block)}/>{block.caption&&<figcaption>{block.caption}</figcaption>}</figure>}
    {quote&&<blockquote><small>In your words</small>{quote}</blockquote>}
    {block.type==='lesson'&&block.body&&block.body!==body&&<div className="e1-reading-text">{block.body.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>}
    {['choices','collection','builder','sort'].includes(block.type)&&<div className="e1-interaction">
     {richEvening?<EveningWorkshop block={block} value={value} set={set} card={card} deck={deck} cardIndex={cardIndex} deckRef={deckRef} events={{onPointerDown:touchStart,onPointerMove:touchMove,onPointerUp:touchEnd,onPointerCancel:e=>{if(e?.pointerType!=='touch')cancelDrag()},onLostPointerCapture:lostCapture}} browse={browse} keep={keepEvening} open={openEvening} start={next} journey={studioJourney} saveToReverie={ctx.openReverieFromContent?scrapbook:undefined} focuses={journeyFocuses} recommendations={recommendations} disabled={busy||moving}/>:isCanvas?<>
      <SceneCanvas block={block} answer={value} photo={block.photo?block:hero} onEdit={openIngredient} triggers={slotTriggers} disabled={busy||moving}/>
      <div className="e1-workshop-tools">{isEvening&&<button type="button" className="e1-text-button" disabled={busy||moving} onClick={remixEvening}>Remix my evening</button>}<details><summary>Name it</summary><input aria-label={isVersion?'Name your new version':'Name your evening'} maxLength={100} value={value.name||''} placeholder="A name of your own" onChange={e=>set({name:e.target.value})}/></details></div>
     </>:isSort&&collectionView?<TwoSortCollection block={block} cards={sortCards()} answer={value} open={openFocus} browse={id=>set({view:'browse',deckIndex:cards.findIndex(c=>c.id===id)})}/>:collectionView?<>
      <CollectionWorkshop cards={kept} value={value} set={set} active={activeInterest} board={activeInterest?value.boards?.[activeInterest.id]||{}:{}} setBoard={setBoard} word={word} setWord={setWord} color={color} setColor={setColor} photo={hero}/>
     </>:drawView?<>
      <SurpriseWorkshop card={picked} value={value} set={set} draw={drawSurprise}/>
     </>:pickerContent}
    </div>}
    {block.type==='collage'&&<TwoCreation block={block} value={value} set={set} kind={creationKind} formTitle={formTitle} versionName={versionAnswer.name} word={word} setWord={setWord}/> }
    {block.type==='result'&&<>
     {isTwo?<TwoResult items={personalItems()} blocks={blocks} state={state} scope={scope}/>:<article className={`e1-keepsake ${workshop?.type==='builder'?'e1-scene-keepsake':workshop?.id==='one-surprise'?'e1-surprise-keepsake':'e1-collection-keepsake'}`}>
      {hero&&<div className="e1-keepsake-photo"><img src={hero.photo} alt="" style={photoStyle(hero)}/></div>}
      <div className="e1-keepsake-inner">
       <div className="e1-keepsake-label"><small>{workshop?.presentation?.eyebrow||'Made around what you chose'}</small><PetalMark/></div>
       <h2><EditorialTitle text={workshopValue.name||value.name||(isTwo?versionAnswer.name:'')||(workshop?.presentation?.title||workshop?.title||block.resultTitle)}/></h2>
       {workshop?.id==='one-evening'&&eveningKept(workshop,workshopValue).length>0?<EveningResult block={workshop} answer={workshopValue}/>:workshop?.type==='builder'?<dl className="e1-scene">{workshopSlots.map((s,i)=><div key={s.id} className={i===0?'e1-scene-feeling':''}><dt>{s.title}</dt><dd>{workshopValue.slots[s.id]}</dd></div>)}</dl>:<div className="e1-keepsake-collection">{workshopCards.map((c,i)=><div key={c.id}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{c.title}</p></div>)}</div>}
       {!workshopSlots.length&&!workshopCards.length&&!(workshop?.id==='one-evening'&&(workshop.cards||[]).some(c=>c.category))&&<div className="e1-keepsake-collection">{(creationItems.length?creationItems:personalItems().slice(0,1)).flatMap(r=>r.items).map((item,i)=><p key={i}>{item}</p>)}</div>}
       {workshop?.id==='one-curiosity'&&<InterestResult cards={workshopCards} answer={workshopValue} photo={hero}/>}
       {workshop?.id==='one-surprise'&&workshopCards.find(c=>c.id===workshopValue.picked)&&<div className="e1-draw-result"><small>Your draw</small><h3>{workshopCards.find(c=>c.id===workshopValue.picked).title}</h3><p>{workshopCards.find(c=>c.id===workshopValue.picked).body}</p></div>}
       {value.note&&<blockquote>{value.note}</blockquote>}
      </div>
     </article>}
     {!isTwo&&!studioJourney&&<details className="e1-optional"><summary>My focus & choices</summary>{personalItems().map(r=><div key={r.id}><h3>{r.title}</h3>{r.items.map((t,i)=><p key={i}>{t}</p>)}</div>)}</details>}
     <details className="e1-optional"><summary>Name it or add a note</summary><input aria-label="Creation title" placeholder={block.resultTitle||'My creation'} value={value.name||''} onChange={e=>set({name:e.target.value})}/><textarea aria-label="Creation note" value={value.note||''} onChange={e=>set({note:e.target.value})} placeholder="Something to remember…"/></details>
     {studioJourney&&<button type="button" className="e1-text-button" onClick={back}>‹ Back to my creations</button>}
     {block.keepsake!==false&&ctx.openReverieFromContent&&<button type="button" className="e1-text-button" onClick={scrapbook}>Add to My Reverie</button>}
    </>}
   </>}
   {message&&<p className="e1-notice" role="status">{message}</p>}
   {w.error&&<div className="e1-notice" role="alert"><p>{w.error}</p><button type="button" onClick={w.retry}>Try saving again</button></div>}
  </main>
  {isCanvas&&editing!==null&&<div className="e1-sheet-layer"><button type="button" className="e1-sheet-shade" aria-label="Close ingredient picker" onClick={closeIngredient}/><section ref={sheetRef} className="e1-picker-sheet" role="dialog" aria-modal="true" aria-label={`Choose ${slot?.title}`} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeIngredient()}if(e.key==='Tab'){const nodes=Array.from(e.currentTarget.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]'));if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&e.target===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&e.target===last){e.preventDefault();first.focus()}}}}><header><h2>{slot?.title}</h2><button type="button" onClick={closeIngredient} disabled={busy||moving}>Done</button></header><div className="e1-sheet-body">{pickerContent}{w.error&&<div className="e1-notice" role="alert"><p>{w.error}</p><button type="button" onClick={w.retry}>Try saving again</button></div>}</div></section></div>}
  {!(richEvening&&value.eveningView==='make'&&block.focusedJourney&&['outfit','invitation'].includes(eveningActive?.format)&&eveningCreation(eveningActive,value).studioMode!=='create')&&!(richEvening&&value.eveningView==='detail'&&eveningActive?.studio&&eveningActive.category!=='film')&&<footer className="e1-footer" inert={editing!==null?'':undefined}><button type="button" className="e1-primary" disabled={busy||moving||(richEvening&&value.eveningView==='make'&&eveningActive?.format==='mystery'&&!eveningCreation(eveningActive,value).puzzleRevealed)||(richEvening&&value.eveningView==='make'&&eveningActive?.format==='blueprint'&&(eveningCreation(eveningActive,value).phase==='exposing'||(value.eveningView==='make'&&eveningCreation(eveningActive,value).phase!=='revealed'&&!eveningCreation(eveningActive,value).design.objects.length)))} aria-busy={busy} onClick={()=>next(studioJourney&&value.eveningView==='make')}>{busy&&block.type==='result'?'Saving…':label}<span aria-hidden="true" className={busy?'e1-button-spinner':undefined}>{busy?'':'→'}</span></button>{!previewMode&&w.status&&<span className="e1-save-state e1-sr-only" role="status">{w.status}</span>}</footer>}
 </section>
}

function SceneCanvas({block,answer,photo,onEdit,triggers,disabled}){
 const slots=block.slots||[]
 return <article className="e1-scene-canvas" aria-label={block.id==='two-version'?"Your new-version canvas":"Your evening canvas"}>
  {slots[0]&&<div className="e1-canvas-cover">
   {photo?.photo&&<img src={photo.photo} alt="" style={photoStyle(photo)}/>}
   <button type="button" ref={el=>{triggers.current[slots[0].id]=el}} aria-label={`Edit ${slots[0].title}`} disabled={disabled} onClick={()=>onEdit(slots[0],0)}><small>{slots[0].title}</small><strong>{answer.slots?.[slots[0].id]||(block.id==='two-version'?'Choose…':'Choose your feeling')}</strong><span aria-hidden="true">↗</span></button>
  </div>}
  <div className="e1-canvas-ingredients">{slots.slice(1).map((slot,i)=><button type="button" key={slot.id} ref={el=>{triggers.current[slot.id]=el}} aria-label={`Edit ${slot.title}`} disabled={disabled} onClick={()=>onEdit(slot,i+1)}><small>{slot.title}</small><span>{answer.slots?.[slot.id]||'Choose…'}</span><b aria-hidden="true">＋</b></button>)}</div>
 </article>
}

function MoodCard({card,board={},photo}){
 const image=card.photo?card:null
 return <article className="e1-mood-card" aria-label={`Mood card for ${card.title}`}>
  {image?.photo&&<div className="e1-mood-photo"><img src={image.photo} alt="" style={photoStyle(image)}/></div>}
  <div className="e1-mood-words">{board.words?.length?board.words.map((word,i)=><span key={i}>{word}</span>):<span>{card.title}</span>}</div>
  {!!board.colors?.length&&<div className="e1-mood-colors" aria-label="Your chosen colors">{board.colors.map((color,i)=><span key={i} style={{backgroundColor:color}} aria-label={color}/>)}</div>}
 </article>
}

function CollectionWorkshop({cards,value,set,active,board,setBoard,word,setWord,color,setColor,photo}){
 if(value.view==='explore'&&active)return <div className="e1-interest-workbench">
  <div className="e1-workshop-tools"><button type="button" className="e1-text-button" onClick={()=>set({view:'collection'})}>‹ My collection</button><button type="button" className="e1-text-button" aria-pressed={value.firstInterestId===active.id} onClick={()=>set({firstInterestId:value.firstInterestId===active.id?'':active.id})}>{value.firstInterestId===active.id?'✓ Explore first':'Explore this first'}</button></div>
  <h2>{active.title}</h2>{active.body&&<p className="e1-interest-intro">{active.body}</p>}
  <MoodCard card={active} board={board} photo={photo}/>
  <div className="e1-board-editor">
   <label htmlFor="e1-interest-word">A word or detail to keep</label><div className="e1-inline-form"><input id="e1-interest-word" aria-label="Word for my mood card" maxLength={45} value={word} onChange={e=>setWord(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const clean=word.trim();if(clean&&(board.words||[]).length<6&&!(board.words||[]).includes(clean)){setBoard({words:[...(board.words||[]),clean]});setWord('')}}}} placeholder="In your own words…"/><button type="button" disabled={!word.trim()||(board.words||[]).length>=6} onClick={()=>{const clean=word.trim();if(!(board.words||[]).includes(clean))setBoard({words:[...(board.words||[]),clean]});setWord('')}}>Add</button></div>
   {!!board.words?.length&&<div className="e1-word-chips">{board.words.map((word,i)=><button type="button" key={i} aria-label={`Remove word ${word}`} onClick={()=>setBoard({words:board.words.filter((_,j)=>j!==i)})}>{word} <span aria-hidden="true">×</span></button>)}</div>}
   <label className="e1-color-label">Choose a color <input type="color" aria-label="Choose a mood-card color" value={color} onChange={e=>setColor(e.target.value)}/><button type="button" disabled={(board.colors||[]).length>=5} onClick={()=>{const normalized=color.toLowerCase();if(/^#[0-9a-f]{6}$/i.test(normalized)&&!(board.colors||[]).some(c=>c.toLowerCase()===normalized))setBoard({colors:[...(board.colors||[]),normalized]})}}>Add color</button></label>
   {!!board.colors?.length&&<div className="e1-color-chips">{board.colors.map((color,i)=><button type="button" key={i} aria-label={`Remove color ${color}`} onClick={()=>setBoard({colors:board.colors.filter((_,j)=>j!==i)})}><span style={{backgroundColor:color}}/>{color}<span aria-hidden="true">×</span></button>)}</div>}
  </div>
  {/^https:\/\//i.test(active.link||'')&&<a className="e1-resource" href={active.link} target="_blank" rel="noopener noreferrer">Open the curated resource ↗</a>}
 </div>
 return <div className="e1-collection-workbench">
  <label className="e1-creation-name"><span>Name your collection</span><input aria-label="Name your interest collection" maxLength={100} value={value.name||''} placeholder="A name of your own" onChange={e=>set({name:e.target.value})}/></label>
  <div className="e1-interest-grid">{cards.map(c=><div className="e1-interest-tile" key={c.id}>
   <button type="button" className="e1-interest-open" aria-label={`Explore ${c.title}`} onClick={()=>{setWord('');set({activeInterestId:c.id,view:'explore'})}}>{c.photo&&<div className="e1-interest-photo"><img src={c.photo} alt={c.alt||''} style={photoStyle(c)}/></div>}<span>{c.title}</span><small>{value.firstInterestId===c.id?'✓ Exploring first':'Open & make it yours ↗'}</small></button>
   <button type="button" className="e1-interest-remove" aria-label={`Remove ${c.title} from my collection`} onClick={()=>set({selected:(value.selected||[]).filter(id=>id!==c.id),firstInterestId:value.firstInterestId===c.id?'':value.firstInterestId})}>×</button>
  </div>)}</div>
  <button type="button" className="e1-text-button" onClick={()=>set({view:'browse'})}>＋ Add interests</button>
 </div>
}

function InterestResult({cards,answer,photo}){
 const first=cards.find(c=>c.id===answer.firstInterestId)
 return <div className="e1-interest-result">{first&&<p><small>First to explore</small><strong>{first.title}</strong></p>}{cards.filter(c=>{const board=answer.boards?.[c.id];return board?.words?.length||board?.colors?.length}).map(c=><div key={c.id}><small>{c.title}</small><MoodCard card={c} board={answer.boards[c.id]} photo={photo}/></div>)}</div>
}

function SurpriseWorkshop({card,value,set,draw}){
 const edit=value.edits?.[card.id]||{},patch=change=>set({edits:{...(value.edits||{}),[card.id]:{...edit,...change}}})
 if(value.view==='reshape')return <div className="e1-surprise-editor">
  <p className="e1-interest-intro">Keep the part you like. Change the rest.</p>
  <label>Your title<input aria-label="My version title" maxLength={120} value={edit.title??card.title} onChange={e=>patch({title:e.target.value})}/></label>
  <label>Your version<textarea aria-label="My version details" maxLength={700} value={edit.body??card.body??''} onChange={e=>patch({body:e.target.value})}/></label>
  <button type="button" className="e1-soft-action" onClick={()=>set({view:'draw'})}>Keep my version</button>
 </div>
 return <div className="e1-draw-workbench">
  <div className="e1-drawn-card" key={`${card.id}:${value.drawCount||0}`}><PetalMark/><small>From your own collection</small><h2>{card.title}</h2>{card.body&&<p>{card.body}</p>}</div>
  <div className="e1-draw-actions"><button type="button" className="e1-soft-action" onClick={()=>set({view:'reshape'})}>Make it mine</button><button type="button" className="e1-soft-action" onClick={draw}>Draw another</button></div>
  <div className="e1-workshop-tools"><button type="button" className="e1-text-button" onClick={()=>set({view:'browse'})}>‹ My collection</button><details><summary>Name it</summary><input aria-label="Name your surprise collection" maxLength={100} value={value.name||''} placeholder="A name of your own" onChange={e=>set({name:e.target.value})}/></details></div>
 </div>
}

// Tool selection uses the authored version label. Unrecognized/custom forms retain an open writing canvas.
function twoCreationKind(title=''){
 if(/outfit/i.test(title))return 'outfit'
 if(/mood|three words/i.test(title)||!title)return 'mood'
 if(/project/i.test(title))return 'project'
 if(/topic|conversation/i.test(title))return 'topics'
 if(/curiosity|collection/i.test(title))return 'collection'
 return 'own'
}
function twoPersonalItems(blocks,state,scope,cards,releaseOnly){
 const sorted=state[`${scope}:two-sort`]||{},sort=blocks.find(b=>b.id==='two-sort'),rows=[]
 for(const [i,bucket] of (sort?.buckets||[]).entries()){
  const items=cards.filter(c=>sorted.assignments?.[c.id]===bucket).map(c=>c.title)
  if(items.length)rows.push({id:`two-sort:${i}`,title:bucket,items,photo:''})
 }
 const resultAnswer=state[`${scope}:two-result`]||{};if(resultAnswer.note)rows.push({id:'two-note',title:'In your words',items:[resultAnswer.note],photo:''})
 if(releaseOnly)return rows
 const ingredient=blocks.find(b=>b.id==='two-ingredient'),answer=state[`${scope}:two-ingredient`]||{},ingredientCards=[...(ingredient?.cards||[]),...(answer.own||[])]
 const ingredients=Object.entries(answer.decisions||{}).filter(([,v])=>v===ingredient?.labels?.[0]).map(([id])=>ingredientCards.find(c=>c.id===id)?.title).filter(Boolean)
 if(ingredients.length)rows.push({id:'two-ingredient',title:ingredient.title,items:ingredients,photo:ingredient.photo||''})
 const version=blocks.find(b=>b.id==='two-version'),versionAnswer=state[`${scope}:two-version`]||{},values=(version?.slots||[]).filter(s=>versionAnswer.slots?.[s.id]).map(s=>`${s.title}: ${versionAnswer.slots[s.id]}`),focus=cards.find(c=>c.id===sorted.focusId)
 if(focus||values.length)rows.push({id:'two-version',title:versionAnswer.name||version?.title||'My version',items:[...(focus?[focus.title]:[]),...values],photo:version?.photo||''})
 const board=state[`${scope}:two-mood`]||{},boardBlock=blocks.find(b=>b.id==='two-mood'),pool=[...(boardBlock?.cards||[]),...(board.cardSnapshot||[]),...(board.own||[])],form=versionAnswer.slots?.[version?.slots?.[1]?.id]||'',kind=twoCreationKind(form)
 const layers=(board.layers||[]).map(l=>({layer:l,card:pool.find(c=>c.id===l.cardId)})).filter(x=>x.card)
 if(kind==='mood'&&(layers.length||board.color))rows.push({id:'two-mood',title:board.name||boardBlock?.title||'My mood card',items:[...layers.map(({layer,card})=>`${card.title} (${Math.round(layer.x)}%, ${Math.round(layer.y)}%)`),...(board.color?[`Board color: ${board.color}`]:[])],photo:boardBlock?.photo||''})
 if(kind!=='mood'){
  const fields=board.versions?.[kind]||{},items=Object.values(fields).filter(x=>typeof x==='string'&&x.trim())
  if(items.length)rows.push({id:'two-mood',title:board.name||form||boardBlock?.title,items,photo:boardBlock?.photo||''})
 }
 return rows
}
function TwoSortCollection({block,cards,answer,open,browse}){
 return <div className="e2-sorted" aria-label="Your sorted collection">{(block.buckets||[]).map((bucket,i)=>{
  const items=cards.filter(c=>answer.assignments?.[c.id]===bucket)
  if(!items.length)return null
  return <section key={bucket}><h2>{bucket}<small>{items.length}</small></h2>{items.map(c=><div className="e2-sorted-row" key={c.id}><button type="button" aria-label={`${i===1?'Change':'Explore'} ${c.title}`} onClick={()=>i===1?browse(c.id):open(c.id)}>{c.title}<span aria-hidden="true">{i===1?'↶':'↗'}</span></button>{i!==1&&<button type="button" aria-label={`Change sorting for ${c.title}`} onClick={()=>browse(c.id)}>Change</button>}</div>)}</section>
 })}<button type="button" className="e1-text-button" onClick={()=>browse()}>‹ Keep sorting</button></div>
}
function TwoCreation({block,value,set,kind,formTitle,versionName,word,setWord,readOnly=false}){
 const cards=[...(block.cards||[]),...(value.own||[])],layers=value.layers||[],fields=value.versions?.[kind]||{}
 const drag=useRef(null),boardRef=useRef(null)
 const active=layers.find(l=>l.id===value.activeLayerId)
 const updateLayer=(id,patch)=>set({layers:layers.map(l=>l.id===id?{...l,...patch}:l)})
 const toggleWord=c=>{const found=layers.find(l=>l.cardId===c.id);if(found){set({layers:layers.filter(l=>l.cardId!==c.id),activeLayerId:''});return}if(layers.length>=6)return;const layer={id:makeId(),cardId:c.id,x:6+(layers.length%2)*45,y:15+Math.floor(layers.length/2)*25,size:43,rotation:0};set({layers:[...layers,layer],activeLayerId:layer.id})}
 const addWord=()=>{if(!word.trim()||layers.length>=6)return;const c={id:makeId(),title:word.trim(),tags:[]},layer={id:makeId(),cardId:c.id,x:6+(layers.length%2)*45,y:15+Math.floor(layers.length/2)*25,size:43,rotation:0};set({own:[...(value.own||[]),c],layers:[...layers,layer],activeLayerId:layer.id});setWord('')}
 const begin=(e,l)=>{if(readOnly||e.button>0)return;const rect=boardRef.current?.getBoundingClientRect?.();if(!rect)return;e.currentTarget.setPointerCapture?.(e.pointerId);drag.current={id:l.id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,left:l.x,top:l.y,width:rect.width,height:rect.height};set({activeLayerId:l.id})}
 const move=e=>{const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;if(e.cancelable)e.preventDefault();const layer=layers.find(l=>l.id===d.id);if(!layer)return;updateLayer(d.id,{x:Math.max(0,Math.min(100-(layer.size||43),d.left+(e.clientX-d.x)/d.width*100)),y:Math.max(0,Math.min(75,d.top+(e.clientY-d.y)/d.height*100))})}
 const end=e=>{if(drag.current?.pointerId===e.pointerId)drag.current=null}
 const changeField=(id,text)=>set({versions:{...(value.versions||{}),[kind]:{...fields,[id]:text}}})
 if(kind!=='mood'){
  const labels=kind==='outfit'?['Base','Layer','Detail']:kind==='project'?['My project','The part I would enjoy','What I want to make']:kind==='topics'?['One conversation','Another thread','Something I am curious about']:kind==='collection'?['A first curiosity','Something else to explore','A question to follow']:['The part I want to keep','My version']
  return <div className={`e2-writing-canvas e2-${kind}`} aria-label="Your personal version"><div className="e2-canvas-title"><small>{versionName||formTitle}</small><PetalMark/></div>{labels.map((label,i)=><label key={label}>{label}{readOnly?<p>{fields[`field${i}`]||'—'}</p>:<textarea aria-label={label} maxLength={400} rows={2} value={fields[`field${i}`]||''} onChange={e=>changeField(`field${i}`,e.target.value)}/>}</label>)}</div>
 }
 return <div className="e2-mood-workshop">
  <div ref={boardRef} className="e2-mood-canvas" aria-label="Your editable mood board" style={{backgroundColor:value.color||'#E8DCE4'}}>
   {block.photo&&<img className="e2-board-photo" src={block.photo} alt={block.alt||''} style={photoStyle(block)}/>}
   {!layers.length&&<span className="e2-board-empty">＋</span>}
   {layers.map(l=>{const c=cards.find(c=>c.id===l.cardId)||(value.cardSnapshot||[]).find(c=>c.id===l.cardId);if(!c)return null;return <button type="button" key={l.id} className="e2-word-layer" disabled={readOnly} aria-label={`Move ${c.title}`} aria-pressed={!readOnly&&l.id===value.activeLayerId} onClick={()=>!readOnly&&set({activeLayerId:l.id})} onPointerDown={e=>begin(e,l)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} style={{left:`${Math.max(0,Math.min(100-(l.size||43),l.x))}%`,top:`${Math.max(0,Math.min(75,l.y))}%`,width:`${l.size||43}%`,transform:`rotate(${l.rotation||0}deg)`}}>{c.photo?<img src={c.photo} alt={c.alt||c.title} style={photoStyle(c)}/>:c.title}</button>})}
  </div>
  {!readOnly&&<>
   {active&&<div className="e2-layer-tools" aria-label="Arrange selected word"><button type="button" aria-label="Move word left" onClick={()=>updateLayer(active.id,{x:Math.max(0,active.x-5)})}>←</button><button type="button" aria-label="Move word up" onClick={()=>updateLayer(active.id,{y:Math.max(0,active.y-5)})}>↑</button><button type="button" aria-label="Move word down" onClick={()=>updateLayer(active.id,{y:Math.min(75,active.y+5)})}>↓</button><button type="button" aria-label="Move word right" onClick={()=>updateLayer(active.id,{x:Math.min(100-(active.size||43),active.x+5)})}>→</button><button type="button" aria-label="Remove selected word" onClick={()=>set({layers:layers.filter(l=>l.id!==active.id),activeLayerId:''})}>×</button></div>}
   <div className="e2-word-bank" aria-label="Words to add">{cards.map(c=><button type="button" key={c.id} aria-pressed={layers.some(l=>l.cardId===c.id)} disabled={layers.length>=6&&!layers.some(l=>l.cardId===c.id)} onClick={()=>toggleWord(c)}>{c.title}</button>)}</div>
   <div className="e1-inline-form"><input aria-label="My own mood word" maxLength={45} value={word} onChange={e=>setWord(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addWord()}}} placeholder="A word of your own"/><button type="button" onClick={addWord} disabled={!word.trim()||layers.length>=6}>Add</button></div>
   <label className="e2-board-color">Board color<input aria-label="Mood board color" type="color" value={value.color||'#E8DCE4'} onChange={e=>set({color:e.target.value})}/></label>
  </>}
 </div>
}
function TwoResult({items,blocks,state,scope}){
 const block=blocks.find(b=>b.id==='two-mood'),value=state[`${scope}:two-mood`]||{},versionBlock=blocks.find(b=>b.id==='two-version'),version=state[`${scope}:two-version`]||{},kind=twoCreationKind(version.slots?.[versionBlock?.slots?.[1]?.id]||'')
 return <div className="e2-result">{items.map(row=><section key={row.id}><h2>{row.title}</h2>{row.id==='two-mood'?<TwoCreation block={block} value={value} kind={kind} formTitle={version.slots?.[versionBlock?.slots?.[1]?.id]} versionName={version.name} readOnly/>:row.items.map((t,i)=><p key={i}>{t}</p>)}</section>)}</div>
}

function eveningRecommendations(cards,tags){
 const creative=tags.some(t=>['expression','play','curiosity','capability'].includes(t)),score=c=>{const shared=(c.tags||[]).filter(t=>tags.includes(t)).length;return shared*10+(shared&&creative&&c.studio?1:0)}
 return cards.map((c,i)=>({c,i,score:score(c)})).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.c)
}
function eveningInk(hex=''){const h=String(hex).replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return '#30212c';const lum=rgb=>rgb.map(x=>{x=x/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0),l=lum([0,2,4].map(i=>parseInt(h.slice(i,i+2),16))),dark=(l+.05)/(lum([48,33,44])+.05),light=(lum([255,249,235])+.05)/(l+.05);return dark>=4.5?'#30212c':light>=4.5?'#fff9eb':l>.179?'#000000':'#ffffff'}
function eveningDefault(card){return {fields:Object.fromEntries((card.studio?.fields||[]).map(f=>[f.id,f.starter||''])),palette:0,elements:[...(card.studio?.elements||[])],design:studioInitial(card),phase:'compose'}}
function eveningKept(block,answer={}){return (answer.keptIds||[]).map(id=>(block.cards||[]).find(c=>c.id===id)||(answer.ideaSnapshot||[]).find(c=>c.id===id)).filter(Boolean)}
function eveningCreation(card,answer={}){const base=eveningDefault(card),saved=answer.creations?.[card.id]||{},design={...base.design,...saved.design};if(card.format==='blueprint'&&!saved.design&&saved.elements)design.objects=design.objects.filter(o=>saved.elements.includes(o.label));return {...base,...saved,paletteColors:saved.paletteColors||card.studio?.palettes?.[saved.palette??base.palette]?.colors,fields:{...base.fields,...saved.fields},...(['outfit','invitation'].includes(card.format)&&!saved.studioMode&&saved.savedAt?{studioMode:'create'}:{}),design}}
function eveningRows(block,answer){
 return eveningKept(block,answer).map(c=>{const creation=eveningCreation(c,answer),made=answer.creations?.[c.id];return {id:`one-evening:${c.id}`,title:c.title,photo:c.photo||'',...(made?{creation:{...creation,format:c.format},sourceCard:c}:{}),items:made?[...(c.studio?.fields||[]).map(f=>`${f.label}: ${creation.fields[f.id]||''}`),...(creation.customColors?['My own color story']:c.studio?.palettes?.[creation.palette]?[`Palette: ${c.studio.palettes[creation.palette].name}`]:[]),...(creation.menu||[]).map(m=>`${m.name}: ${m.description}`),...(creation.wantMore?[`More of: ${creation.feelingSnapshot||c.studio?.feeling||c.title}`,...(creation.nextStep?[`A possibility: ${creation.nextStep}`]:[])]:[]),...(c.format==='mystery'&&creation.puzzleRevealed?[(creation.puzzleSnapshot||c.studio?.cases?.find(p=>p.id===creation.puzzleCaseId)||c.studio?.puzzle)?.solution||'']:[]),...(c.format==='blueprint'?[`Digital composition: ${(creation.design?.objects||[]).map(o=>o.label).join(', ')}`]:[])]:[c.subtitle||c.body,...(c.guide?[c.guide]:[]),...(c.link?[c.link]:[])]}})
}
function EveningArtwork({card,creation,readOnly=false}){
 const format=card.format||'book',data=creation||eveningDefault(card),fields=data.fields||{},palette=card.studio?.palettes?.[data.palette]||card.studio?.palettes?.[0],colors=palette?.colors||['#e9d9df','#49323f','#b286a0']
 const style={'--night-ink':eveningInk(colors[0]),'--night-base':colors[0],'--night-tone':colors[1],'--night-detail':colors[2]}
 if(['outfit','invitation','mystery'].includes(format)&&!card.photo||creation&&data.design?.version===2)return <DesignedArtwork card={card} data={data} readOnly/>
 if(card.photo&&!creation)return <div className="night-photo"><img draggable={false} src={card.photo} alt={card.alt||''} style={photoStyle(card)}/></div>
 return <div className={`night-art night-art-${format}`} style={style} aria-label={`${card.title}${creation?' · your creation':''}`}>
  {format==='cafe'?<div className="night-menu"><small>OPEN LATE · STAY A LITTLE</small><strong>{fields.name}</strong><i>the evening menu</i><hr/><p>{fields.drink}</p><p>{fields.plate}</p><hr/><em>{fields.ritual}</em></div>:format==='book'?<div className="night-book"><small>A BOOK FROM YOUR IMAGINARY SHELF</small><strong>{fields.name}</strong><div className="night-book-motif" aria-hidden="true"><i/><i/><i/></div><i>{fields.line}</i><span>{fields.by}</span></div>:format==='postcard'?<div className="night-postcard"><small>A SMALL DISPATCH</small><strong>{fields.name}</strong><div className="night-stamp" aria-hidden="true">TR</div><p>{fields.message}</p><i>To: {fields.to}</i></div>:format==='blueprint'?<div className="night-blueprint"><div className="night-botanical" aria-hidden="true">{(data.elements||[]).includes(card.studio?.elements?.[0])&&<div className="night-fern">{Array.from({length:9},(_,i)=><i key={i} style={{'--leaf':i}}/>)}</div>}{(data.elements||[]).includes(card.studio?.elements?.[1])&&<div className="night-moon"/>}{(data.elements||[]).includes(card.studio?.elements?.[2])&&<div className="night-sprig">{Array.from({length:5},(_,i)=><i key={i} style={{'--leaf':i}}/>)}</div>}</div><strong>{creation?fields.name:'Make a botanical print'}</strong><small>{creation?'DIGITAL BLUE PRINT':'ARRANGE · REVEAL · KEEP'}</small></div>:<div className={`night-room ${format==='garden'?'night-garden':''}`}><div className="night-room-picture" aria-hidden="true"><div className="night-window"><i/><i/></div><div className="night-seat"/><div className="night-table"/><div className="night-vase"><i/><i/><i/></div></div><div className="night-room-label"><strong>{fields.name}</strong><i>{fields.detail}</i></div></div>}
 </div>
}
function EveningWorkshop({block,value,set,card,deck,cardIndex,deckRef,events,browse,keep,open,start,journey=false,saveToReverie,focuses=[],recommendations=[],disabled}){
 const categories=[...(journey?[['for-you','For you']]:[]),...([['film','Movie night'],['make','Make something'],['explore','Explore']].filter(([id])=>(block.cards||[]).some(c=>c.category===id)))],category=block.focusedJourney?'for-you':value.eveningCategory||(journey?'for-you':'film'),view=value.eveningView||'browse',kept=eveningKept(block,value),active=(block.cards||[]).find(c=>c.id===value.eveningOpenId)||(value.ideaSnapshot||[]).find(c=>c.id===value.eveningOpenId)
 const creation=active?eveningCreation(active,value):null
 const updateCreation=patch=>set({creations:{...(value.creations||{}),[active.id]:{...creation,...patch}}})
 const setField=(id,text)=>updateCreation({fields:{...creation.fields,[id]:text}})
 const remix=()=>{const fields={...creation.fields};for(const f of active.studio?.fields||[]){const options=[f.starter,...(f.ideas||[])].filter(x=>x&&x!==fields[f.id]);if(options.length)fields[f.id]=options[Math.floor(Math.random()*options.length)]}updateCreation({fields,undoFields:{...creation.fields}})}
 if(view==='kept')return <div className="night-kept" aria-label="Your evening discoveries">{kept.length?kept.map(c=><article key={c.id} className="night-kept-card">{value.creations?.[c.id]?<EveningArtwork card={c} creation={eveningCreation(c,value)} readOnly/>:c.photo?<div className="night-kept-photo"><img src={c.photo} alt="" style={photoStyle(c)}/></div>:<EveningArtwork card={c}/>}<div><small>{c.category==='film'?'YOUR FILM':value.creations?.[c.id]?(value.creations[c.id].savedAt?'SAVED IN YOUR REBUILD':'MADE BY YOU'):'A DISCOVERY TO KEEP'}</small><h2>{value.creations?.[c.id]?.fields?.name||c.title}</h2>{value.creations?.[c.id]?.wantMore&&<p className="e2-kept-intention">More of: {value.creations[c.id].feelingSnapshot||c.studio?.feeling}{value.creations[c.id].nextStep&&<small>{value.creations[c.id].nextStep}</small>}</p>}<div className="night-kept-actions"><button type="button" className="e1-text-button" aria-label={`Open and edit ${c.title}`} onClick={()=>open(c,{edit:true})}>Open & edit</button><button type="button" className="e1-text-button" aria-label={`Remove ${c.title} from my evening`} onClick={()=>keep(c)}>Remove</button></div></div></article>):<p className="e1-copy">Nothing kept yet. Open an idea that catches your attention.</p>}{!journey&&Object.values(value.slots||{}).some(Boolean)&&<details className="e1-optional"><summary>Your earlier evening draft</summary>{(block.slots||[]).filter(slot=>value.slots?.[slot.id]).map(slot=><p key={slot.id}>{slot.title}: {value.slots[slot.id]}</p>)}</details>}<button type="button" className="e1-text-button" disabled={disabled} onClick={()=>set({eveningView:'browse'})}>＋ Keep exploring</button>{journey&&kept.length>0&&saveToReverie&&<button type="button" className="e1-text-button" disabled={disabled} onClick={saveToReverie}>Add to My Reverie</button>}{!journey&&<details className="e1-optional"><summary>Name your evening</summary><input aria-label="Name your evening" value={value.name||''} maxLength={100} placeholder="An evening of my own" onChange={e=>set({name:e.target.value})}/></details>}</div>
 if((view==='detail'||view==='make')&&active){
  if(view==='make')return <CreativeStudio key={active.id} card={active} creation={creation} onChange={updateCreation} onSave={journey?()=>start(false):undefined} onContinue={journey?()=>start(true):undefined} disabled={disabled}/>
  return <div className="night-detail"><EveningArtwork card={active}/><p className="night-description">{active.body}</p>{(active.learn||[]).map((part,i)=><section className="night-learning" key={i}><small>{String(i+1).padStart(2,'0')}</small><h2>{part.title}</h2><p>{part.body}</p></section>)}{active.guide&&<section className="night-learning"><h2>Make an evening of it.</h2><p>{active.guide}</p></section>}{/^https:\/\//i.test(active.link||'')&&<a className="night-resource" href={active.link} target="_blank" rel="noopener noreferrer">{active.category==='film'?'Film details & viewing links':'Explore the museum source'} <span aria-hidden="true">↗</span></a>}{active.category==='film'&&<p className="night-link-note">Opens the official film page. Viewing may require a separate service or rental.</p>}{active.category!=='film'&&active.studio&&<button type="button" className="e1-primary night-start-designing" disabled={disabled} onClick={start}>Start designing<span aria-hidden="true">→</span></button>}<button type="button" className="e1-text-button" aria-pressed={kept.some(c=>c.id===active.id)} onClick={()=>keep(active)}>{kept.some(c=>c.id===active.id)?'✓ Kept · tap to remove':'Keep this idea for later'}</button></div>
 }
 const matchingFocus=card?focuses.find(f=>(f.tags||[]).some(t=>(card.tags||[]).includes(t))):null
 const surprise=()=>{const choices=recommendations.filter(c=>c.studio),unused=choices.filter(c=>!(value.surprisedIds||[]).includes(c.id)),pool=unused.length?unused:choices;if(!pool.length)return;const pick=pool[Math.floor(Math.random()*pool.length)];set({surprisedIds:[...(unused.length?value.surprisedIds||[]:[]),pick.id],eveningOpenId:pick.id,eveningView:'detail'})}
 return <div className="night-library">{!block.focusedJourney&&<nav className="night-categories" aria-label="Explore your evening">{categories.map(([id,title])=><button type="button" key={id} disabled={disabled} aria-pressed={category===id} onClick={()=>set({eveningCategory:id,eveningView:'browse'})}>{title}</button>)}</nav>}
 {journey&&<div className="night-personal-invitation">{matchingFocus?<><small>BECAUSE YOU CHOSE</small><p>“{matchingFocus.title}”</p></>:<p>Follow something that catches your attention.</p>}<button type="button" className="e1-text-button" disabled={disabled||!recommendations.length} onClick={surprise}>Surprise me ↗</button></div>}
 {card?<div ref={deckRef} className="e1-deck night-deck" role="region" aria-label="Swipeable ideas" aria-roledescription="carousel" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();browse(1)}if(e.key==='ArrowLeft'){e.preventDefault();browse(-1)}}} {...events} style={{touchAction:'pan-y'}}><div className="e1-card-motion"><article className={`night-discovery night-${category}`} key={card.id}>
  <EveningArtwork card={card}/><div className="night-card-copy"><small>{card.category==='film'?'TONIGHT’S LITTLE CINEMA':card.category==='make'?'MAKE IT RIGHT HERE':'FOLLOW SOMETHING INTERESTING'}</small><h2>{card.title}</h2><p>{card.subtitle}</p><span className="night-open-label">{card.category==='film'?'Meet your film':card.category==='make'?'Open the studio':'Take a look'} <b aria-hidden="true">↗</b></span></div>
  <button type="button" className="e1-card-select" aria-label={`Open ${card.title}`} disabled={disabled} onClick={e=>open(card,e)}/><button type="button" className="night-card-keep" aria-label={`${kept.some(c=>c.id===card.id)?'Remove':'Keep'} ${card.title}`} aria-pressed={kept.some(c=>c.id===card.id)} disabled={disabled} onClick={()=>keep(card)}>{kept.some(c=>c.id===card.id)?'✓':'♡'}</button>
 </article></div><div className="night-browse"><button type="button" aria-label="Previous card" disabled={cardIndex===0||disabled} onClick={()=>browse(-1)}>‹</button><span>Swipe · {cardIndex+1} / {deck.length}</span><button type="button" aria-label="Next card" disabled={cardIndex===deck.length-1||disabled} onClick={()=>browse(1)}>›</button></div></div>:<p className="e1-copy">No ideas published in this section yet.</p>}
 </div>
}
function EveningResult({block,answer}){return <div className="night-result">{eveningKept(block,answer).map(c=><article className="night-result-card" key={c.id}>{answer.creations?.[c.id]?<EveningArtwork card={c} creation={eveningCreation(c,answer)} readOnly/>:<><EveningArtwork card={c}/><div className="night-result-copy"><small>{c.category==='film'?'YOUR FILM':'YOUR DISCOVERY'}</small><h3>{c.title}</h3><p>{c.subtitle}</p>{c.guide&&<p>{c.guide}</p>}</div></>}</article>)}</div>}

function studioObject(p,id){const n=(v,f)=>Number.isFinite(Number(v))?Number(v):f,w=Math.max(10,Math.min(55,n(p.w,20))),h=Math.max(10,Math.min(85,n(p.h,35)));return {...p,id,pieceId:p.id,w,h,x:Math.max(w/2,Math.min(100-w/2,n(p.x,50))),y:Math.max(h/2,Math.min(100-h/2,n(p.y,50))),rotation:Math.max(-180,Math.min(180,n(p.rotation,0)))}}
function studioInitial(card){
 return {version:2,objects:(card.studio?.canvas?.pieces||[]).filter(p=>p.initial!==false).map((p,i)=>studioObject(p,`initial-${p.id||i}`)),awning:'stripe',scene:'coast',font:'serif',layout:'center',ornament:'petals',side:'front'}
}
function studioColors(card,data){const p=card.studio?.palettes?.[data.palette]||card.studio?.palettes?.[0];return data.customColors||data.paletteColors||p?.colors||['#ecd7dc','#49323f','#b67d91']}
function studioVars(card,data){const colors=studioColors(card,data);return {'--studio-base':colors[0],'--studio-tone':colors[1],'--studio-detail':colors[2],'--studio-ink':eveningInk(colors[0]),...(card.format==='blueprint'?{'--studio-print-blue':card.studio?.palettes?.length?colors[0]:'#173e72','--studio-print-ink':card.studio?.palettes?.length?eveningInk(colors[0]):'#fff8de'}:{})}}
function StudioText({id,children,onEdit,className=''}){return onEdit?<button type="button" className={`studio-text ${className}`} aria-label={`Edit ${id} on canvas`} onClick={()=>onEdit(id)}>{children||'…'}</button>:<span className={`studio-text ${className}`}>{children||'…'}</span>}
function StudioShape({shape,photo}){
 const [failed,setFailed]=useState(null)
 if(photo&&failed!==photo)return <img className="studio-clothing-photo" src={photo} alt="" draggable={false} onError={()=>setFailed(photo)}/>
 if(['blouse','trousers','skirt','jacket','dress','shoe','tote'].includes(shape))return <span className={`studio-garment studio-garment-${shape}`}><i/><b/></span>
 if(shape==='fern')return <span className="studio-fern">{Array.from({length:9},(_,i)=><i key={i} style={{'--n':i}}/>)}</span>
 if(shape==='sprig'||shape==='eucalyptus')return <span className={`studio-sprig ${shape==='eucalyptus'?'studio-eucalyptus':''}`}>{Array.from({length:5},(_,i)=><i key={i} style={{'--n':i}}/>)}</span>
 if(shape==='ginkgo')return <span className="studio-ginkgo"><i/></span>
 if(shape==='daisy')return <span className="studio-daisy">{Array.from({length:8},(_,i)=><i key={i} style={{'--petal':i}}/>)}<b/></span>
 if(shape==='flower')return <span className="studio-flower"><i/><i/><i/></span>
 if(shape==='plant'||shape==='tree')return <span className={`studio-plant ${shape==='tree'?'studio-tree':''}`}><i/><i/><i/><i/><b/></span>
 return <span className={`studio-shape studio-${['table','chair','lamp','books','moon','leaf','bench','fountain','stamp'].includes(shape)?shape:'leaf'}`}><i/><i/><i/>{shape==='stamp'&&<small>TR</small>}</span>
}
function StudioCanvas({card,data,onChange,onSelect,children,readOnly=false}){
 const ref=useRef(null),drag=useRef(null),latest=useRef({data,onChange}),suppress=useRef(false);latest.current={data,onChange}
 const objects=data.design?.objects||[],format=card.format,locked=readOnly||data.phase==='exposing',selected=data.selectedObject
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n)),bound=(o,x,y)=>({x:clamp(x,o.w/2,100-o.w/2),y:clamp(y,o.h/2,100-o.h/2)})
 const start=(e,o)=>{
  if(locked||e.button>0||e.isPrimary===false)return
  const rect=ref.current?.getBoundingClientRect?.();if(!rect?.width||!rect.height)return
  suppress.current=false;drag.current={id:o.id,pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY,original:o,next:o,rect,node:e.currentTarget}
  e.currentTarget.setPointerCapture?.(e.pointerId)
 }
 const move=e=>{const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;const dx=e.clientX-d.clientX,dy=e.clientY-d.clientY;if(Math.abs(dx)+Math.abs(dy)>5)suppress.current=true;if(e.cancelable)e.preventDefault();d.next={...d.original,...bound(d.original,d.original.x+dx/d.rect.width*100,d.original.y+dy/d.rect.height*100)};d.node.style.setProperty('left',`${d.next.x}%`);d.node.style.setProperty('top',`${d.next.y}%`)}
 const reset=d=>{d.node.style.setProperty('left',`${d.original.x}%`);d.node.style.setProperty('top',`${d.original.y}%`)}
 const end=e=>{const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;drag.current=null;const now=latest.current.data;if(suppress.current){latest.current.onChange?.({design:{...now.design,objects:(now.design?.objects||[]).map(o=>o.id===d.id?d.next:o)}});onSelect?.(d.id,true)};try{d.node.releasePointerCapture?.(e.pointerId)}catch(e){}}
 const cancel=e=>{const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;drag.current=null;reset(d)}
 const lost=e=>{const d=drag.current;if(!d||e.pointerId!==d.pointerId||e.target!==d.node||d.node.hasPointerCapture?.(e.pointerId))return;cancel(e)}
 const keyboard=(e,o)=>{const steps={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};if(!steps[e.key]||locked)return;e.preventDefault();const [dx,dy]=steps[e.key];onChange?.({design:{...data.design,objects:objects.map(x=>x.id===o.id?{...x,...bound(x,x.x+dx,x.y+dy)}:x)}})}
 return <div ref={ref} className={`studio-canvas studio-canvas-${format} ${format==='blueprint'?`studio-print-${readOnly?'revealed':data.phase||'compose'}`:''} ${data.preview?'studio-previewing':''}`} role="group" aria-label={format==='blueprint'?'Botanical composition canvas':`Your ${format==='room'?'room':format} design canvas`} style={studioVars(card,data)}>
  {format==='cafe'&&<div className="studio-cafe-shell" aria-hidden="true"><div className={`studio-awning studio-awning-${data.design?.awning||'stripe'}`}/><div className="studio-cafe-door"/><div className="studio-cafe-window"/></div>}
  {format==='room'&&<div className="studio-room-shell" aria-hidden="true"><div className="studio-arched-window"/><div className="studio-room-rug"/></div>}
  {format==='garden'&&<div className="studio-garden-shell" aria-hidden="true"><div className="studio-garden-door"/><div className="studio-garden-path"/></div>}
  {children}
  {objects.map((o,i)=>{const style={'--piece-rotation':`${o.rotation||0}deg`,left:`${o.x}%`,top:`${o.y}%`,width:`${o.w}%`,height:`${o.h}%`,transform:`translate(-50%,-50%) rotate(${o.rotation||0}deg)`,zIndex:i+2};return locked?<span key={o.id} className="studio-object" style={style} aria-label={o.label}><StudioShape shape={o.shape} photo={o.photo||(card.studio?.canvas?.pieces||[]).find(p=>p.id===o.pieceId)?.photo}/></span>:<button type="button" key={o.id} className="studio-object" aria-label={`Arrange ${o.label}`} aria-pressed={selected===o.id} onPointerDown={e=>start(e,o)} onPointerMove={move} onPointerUp={end} onPointerCancel={cancel} onLostPointerCapture={lost} onClick={e=>{if(e?.detail>0&&suppress.current)return;onSelect?.(o.id)}} onKeyDown={e=>keyboard(e,o)} style={style}><StudioShape shape={o.shape} photo={o.photo||(card.studio?.canvas?.pieces||[]).find(p=>p.id===o.pieceId)?.photo}/></button>})}
  {format==='blueprint'&&data.phase==='exposing'&&!readOnly&&<div className="studio-exposure" aria-hidden="true"/>}
 </div>
}
function StudioMenu({card,data,onChange,onRemove}){
 const fields=data.fields||{}
 const edit=(id,value)=>onChange?.({fields:{...data.fields,[id]:value}})
 const menuField=(id,className)=>onChange?<textarea className={`studio-menu-input ${className}`} aria-label={(card.studio?.fields||[]).find(f=>f.id===id)?.label||id} rows={id==='ritual'?3:2} maxLength={id==='ritual'?600:150} value={fields[id]||''} placeholder={(card.studio?.fields||[]).find(f=>f.id===id)?.label||id} onChange={e=>edit(id,e.target.value)}/>:fields[id]?<span className={`studio-text ${className}`}>{fields[id]}</span>:null
 const editItem=(id,patch)=>onChange?.({menu:(data.menu||[]).map(item=>item.id===id?{...item,...patch}:item)})
 return <div className="studio-menu" style={studioVars(card,data)}><small>THE HOUSE MENU</small>{onChange&&<p className="studio-menu-edit-hint">Make it yours. Tap any words to edit.</p>}{menuField('name','studio-menu-name')}<div className="studio-menu-rule"/>{['drink','plate'].map(id=><div key={id}>{menuField(id,'studio-menu-item')}</div>)}{(data.menu||[]).map((item,i)=><div key={item.id} className="studio-menu-added">{onChange?<><input className="studio-menu-input studio-menu-item" aria-label={`Menu item ${i+1} name`} maxLength={150} value={item.name} onChange={e=>editItem(item.id,{name:e.target.value})}/><textarea className="studio-menu-input studio-menu-description" aria-label={`Menu item ${i+1} description`} maxLength={400} rows={2} value={item.description} onChange={e=>editItem(item.id,{description:e.target.value})}/></>:<><strong>{item.name}</strong><p>{item.description}</p></>}{onRemove&&<button type="button" aria-label={`Remove ${item.name} from menu`} onClick={()=>onRemove(item.id)}>×</button>}</div>)}<div className="studio-menu-rule"/>{menuField('ritual','studio-menu-ritual')}</div>
}
function DesignedArtwork({card,data,onChange,onSelect,onField,readOnly=false}){
 const format=card.format,design=data.design||{},fields=data.fields||{},vars=studioVars(card,data)
 if(format==='cafe')return <div className="studio-artwork studio-cafe-art" style={vars}><StudioCanvas card={card} data={data} onChange={onChange} onSelect={onSelect} readOnly={readOnly||!!data.preview}><div className="studio-cafe-sign"><StudioText id="name" onEdit={onField}>{fields.name}</StudioText></div></StudioCanvas>{(readOnly||data.preview)&&<StudioMenu card={card} data={data} onChange={!readOnly?onChange:undefined} onRemove={!readOnly&&onChange?id=>onChange({menu:(data.menu||[]).filter(item=>item.id!==id)}):undefined}/>}</div>
 if(format==='invitation')return <div className="studio-artwork studio-invitation" style={vars}><small>AN INVITATION FROM ME</small><StudioText id="name" onEdit={onField} className="studio-invitation-title">{fields.name}</StudioText><div className="studio-invitation-flower" aria-hidden="true">✳</div><StudioText id="plan" onEdit={onField} className="studio-invitation-plan">{fields.plan}</StudioText><StudioText id="message" onEdit={onField} className="studio-invitation-message">{fields.message}</StudioText><StudioText id="by" onEdit={onField} className="studio-invitation-by">{fields.by}</StudioText></div>
 if(format==='mystery')return <div className="studio-artwork studio-case-art"><small>A LITTLE CASE FILE</small><div className="studio-case-cup" aria-hidden="true"><i/><b/></div><h2>{fields.name}</h2><p>{data.puzzleRevealed?(data.puzzleSnapshot||card.studio?.puzzle)?.solution:card.subtitle||''}</p></div>
 if(format==='blueprint')return <div className="studio-artwork studio-print-art" style={vars}><StudioCanvas card={card} data={data} onChange={onChange} onSelect={onSelect} readOnly={readOnly}/><div className="studio-art-caption"><StudioText id="name" onEdit={onField}>{fields.name}</StudioText><small>{data.phase==='exposing'&&!readOnly?'Developing your digital print…':readOnly?'DIGITAL BOTANICAL PRINT':'YOUR PRINT TITLE · TAP TO EDIT'}</small></div></div>
 if(format==='book')return <div className={`studio-artwork studio-cover studio-type-${design.font||'serif'} studio-cover-${design.layout||'center'}`} style={vars}><small>FROM YOUR IMAGINARY BOOKSHELF</small><StudioText id="name" onEdit={onField} className="studio-cover-title">{fields.name}</StudioText>{design.ornament!=null&&design.ornament!=='none'&&<div className={`studio-cover-mark studio-mark-${design.ornament||'petals'}`} aria-hidden="true"><i/><i/><i/></div>}<StudioText id="line" onEdit={onField} className="studio-cover-line">{fields.line}</StudioText><StudioText id="by" onEdit={onField} className="studio-cover-by">{fields.by}</StudioText></div>
 if(format==='postcard')return <div className={`studio-artwork studio-postcard studio-postcard-${readOnly?'front':design.side||'front'}`} style={vars}>{!readOnly&&design.side==='back'?<StudioCanvas card={card} data={data} onChange={onChange} onSelect={onSelect} readOnly={readOnly}><div className="studio-postcard-back-copy"><StudioText id="message" onEdit={onField}>{fields.message}</StudioText><StudioText id="to" onEdit={onField} className="studio-postcard-to">{fields.to}</StudioText></div></StudioCanvas>:<><div className={`studio-postcard-landscape studio-landscape-${design.scene||'coast'}`} aria-hidden="true"><i/><i/><i/><b/></div><div className="studio-postcard-front-copy"><small>A SMALL DISPATCH FROM</small><StudioText id="name" onEdit={onField}>{fields.name}</StudioText></div></>}{readOnly&&<div className="studio-postcard-letter"><p>{fields.message}</p><i>To: {fields.to}</i></div>}</div>
 return <div className="studio-artwork studio-scene-art" style={vars}><StudioCanvas card={card} data={data} onChange={onChange} onSelect={onSelect} readOnly={readOnly}/><div className="studio-art-caption"><StudioText id="name" onEdit={onField}>{fields.name}</StudioText><StudioText id="detail" onEdit={onField} className="studio-art-detail">{fields.detail}</StudioText></div></div>
}
function StudioOptionDeck({items,index=0,onIndex,onChoose,selected,media,label,disabled=false}){
 const ref=useRef(null),gesture=useRef(null),suppress=useRef(false),latest=useRef(null)
 const i=Math.max(0,Math.min(items.length-1,index)),item=items[i]
 latest.current={i,items,onIndex,disabled}
 const turn=delta=>{const now=latest.current;if(now.disabled)return;now.onIndex(Math.max(0,Math.min(now.items.length-1,now.i+delta)))}
 const begin=e=>{if(disabled||e.isPrimary===false||e.button>0)return;suppress.current=false;gesture.current={x:e.clientX,y:e.clientY,id:e.pointerId}}
 const move=e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.2){g.horizontal=true;if(e.cancelable)e.preventDefault()}}
 const end=e=>{const g=gesture.current;gesture.current=null;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){suppress.current=true;turn(dx<0?1:-1)}}
 const handlers=useRef({});handlers.current={begin,move,end}
 useEffect(()=>{const node=ref.current;if(!node?.addEventListener)return;const convert=(e,t)=>({clientX:t.clientX,clientY:t.clientY,pointerId:t.identifier,cancelable:e.cancelable,preventDefault:()=>e.preventDefault()});const start=e=>{if(e.touches.length!==1){gesture.current=null;return}handlers.current.begin(convert(e,e.touches[0]))};const motion=e=>{if(e.touches.length!==1){gesture.current=null;return}handlers.current.move(convert(e,e.touches[0]))};const finish=e=>{const t=Array.from(e.changedTouches||[]).find(t=>t.identifier===gesture.current?.id);if(t)handlers.current.end(convert(e,t))};const cancel=()=>{gesture.current=null;suppress.current=true};node.addEventListener('touchstart',start,{passive:true});node.addEventListener('touchmove',motion,{passive:false});node.addEventListener('touchend',finish);node.addEventListener('touchcancel',cancel);return()=>{node.removeEventListener('touchstart',start);node.removeEventListener('touchmove',motion);node.removeEventListener('touchend',finish);node.removeEventListener('touchcancel',cancel)}},[])
 if(!item)return null
 return <div className="e2-option-gallery"><div ref={ref} className="e2-option-deck" role="region" aria-label={label} aria-roledescription="carousel" style={{touchAction:'pan-y'}} onPointerDown={e=>{if(e.pointerType!=='touch')begin(e)}} onPointerMove={e=>{if(e.pointerType!=='touch')move(e)}} onPointerUp={e=>{if(e.pointerType!=='touch')end(e)}} onPointerCancel={()=>{gesture.current=null;suppress.current=true}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}}}><article key={item.id} className="e2-direction-card">{media?.(item)}<div className="e2-direction-copy"><h2>{item.title}</h2><p>{item.subtitle}</p>{item.body&&<p className="e2-direction-story">{item.body}</p>}</div><button type="button" className="e2-direction-hit" aria-label={`Try ${item.title}`} aria-pressed={selected===item.id} disabled={disabled} onClick={e=>{if(e?.detail!==0&&suppress.current)return;onChoose(item)}}/></article></div><div className="e2-direction-navigation"><button type="button" aria-label={`Previous ${label}`} disabled={disabled||i===0} onClick={()=>turn(-1)}>‹</button><span>Swipe · {i+1} / {items.length}</span><button type="button" aria-label={`Next ${label}`} disabled={disabled||i===items.length-1} onClick={()=>turn(1)}>›</button></div><button type="button" className="studio-action" disabled={disabled} onClick={()=>onChoose(item)}>{selected===item.id?'Undo this direction':label==='Styled looks'?'Try this look':'Make this invitation'}</button></div>
}

function CreativeStudio({card,creation,onChange,onSave,onContinue,disabled=false}){
 const current=useRef(creation),history=useRef([]),future=useRef([]),fieldRef=useRef(null)
 const [pane,setPaneState]=useState(creation.panel||'design'),[fieldId,setFieldState]=useState(creation.editField||'name')
 const setFieldId=id=>{setFieldState(id);const value={...current.current,editField:id};current.current=value;onChange(value)}
 const draftDrink=creation.drinkDraft?.parts||{},drinkName=creation.drinkDraft?.name||''
 const setPane=next=>{setPaneState(next);const value={...current.current,panel:next};current.current=value;onChange(value)}
 const setDraftDrink=parts=>{const value={...current.current,drinkDraft:{...(current.current.drinkDraft||{}),parts}};current.current=value;onChange(value)}
 const setDrinkName=name=>{const value={...current.current,drinkDraft:{...(current.current.drinkDraft||{}),name}};current.current=value;onChange(value)}
 const [historyTick,setHistoryTick]=useState(0);current.current=creation
 const copy=v=>JSON.parse(JSON.stringify(v)),commit=(patch,record=true)=>{if(disabled)return;const next={...current.current,...patch};if(record){history.current.push(copy(current.current));if(history.current.length>30)history.current.shift();future.current=[];setHistoryTick(n=>n+1)}current.current=next;onChange(next)}
 const undo=()=>{if(!history.current.length)return;future.current.push(copy(current.current));const previous=history.current.pop();current.current=previous;onChange(previous);setHistoryTick(n=>n+1)}
 const redo=()=>{if(!future.current.length)return;history.current.push(copy(current.current));const next=future.current.pop();current.current=next;onChange(next);setHistoryTick(n=>n+1)}
 const select=(id,force=false)=>{commit({selectedObject:!force&&current.current.selectedObject===id?null:id},false);setPane('arrange')}
 const editField=id=>{commit({preview:false},false);setFieldId(id);setPane('text')}
 const active=(creation.design?.objects||[]).find(o=>o.id===creation.selectedObject),format=card.format,locked=creation.phase==='exposing'
 const field=(card.studio?.fields||[]).find(f=>f.id===fieldId)||(card.studio?.fields||[])[0]
 const patchDesign=patch=>commit({design:{...creation.design,...patch}})
 const chooseStyle=(key,value)=>{const current=creation.design?.[key],previous=creation.stylePrevious?.[key];commit({design:{...creation.design,[key]:current===value?(previous??null):value},stylePrevious:{...creation.stylePrevious,[key]:current===value?null:current}})}
 const updateObject=patch=>{if(!active||locked)return;patchDesign({objects:creation.design.objects.map(o=>o.id===active.id?{...o,...patch}:o)})}
 const move=(dx,dy)=>updateObject({x:Math.max(active.w/2,Math.min(100-active.w/2,active.x+dx)),y:Math.max(active.h/2,Math.min(100-active.h/2,active.y+dy))})
 const resize=w=>{const ratio=active.h/active.w,h=Math.min(85,w*ratio);updateObject({w,h,x:Math.max(w/2,Math.min(100-w/2,active.x)),y:Math.max(h/2,Math.min(100-h/2,active.y))})}
 const addPiece=piece=>{if(locked)return;const existing=(creation.design?.objects||[]).filter(o=>o.pieceId===piece.id).at(-1);if(existing){commit({design:{...creation.design,objects:creation.design.objects.filter(o=>o.id!==existing.id)},selectedObject:creation.selectedObject===existing.id?null:creation.selectedObject});return}if((creation.design?.objects||[]).length>=12)return;const object=studioObject(piece,makeId());commit({design:{...creation.design,objects:[...(creation.design?.objects||[]),object]},selectedObject:object.id});setPane('arrange')}
 const duplicate=()=>{if(!active||creation.design.objects.length>=12)return;const object={...active,id:makeId(),x:Math.max(active.w/2,Math.min(100-active.w/2,active.x+5)),y:Math.max(active.h/2,Math.min(100-active.h/2,active.y+5))};commit({design:{...creation.design,objects:[...creation.design.objects,object]},selectedObject:object.id})}
 const reorder=delta=>{if(!active)return;const a=[...creation.design.objects],i=a.findIndex(o=>o.id===active.id),j=Math.max(0,Math.min(a.length-1,i+delta));[a[i],a[j]]=[a[j],a[i]];patchDesign({objects:a})}
 useEffect(()=>{if(['text','message'].includes(pane)){fieldRef.current?.scrollIntoView?.({block:'nearest',behavior:'smooth'});fieldRef.current?.focus?.()}},[pane,fieldId])
 useEffect(()=>{if(format!=='blueprint'||creation.phase!=='exposing')return;const reduce=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const timer=setTimeout(()=>{const next={...current.current,phase:'revealed',selectedObject:null};current.current=next;onChange(next)},reduce?0:850);return()=>clearTimeout(timer)},[format,creation.phase])
 const colors=studioColors(card,creation),palettes=card.studio?.palettes||[]
 const choosePalette=i=>{const active=creation.palette===i&&!creation.customColors;const before={palette:creation.palette,paletteColors:creation.paletteColors||null,customColors:creation.customColors||null};commit(active?{...(creation.palettePrevious||{palette:null,paletteColors:null,customColors:null}),palettePrevious:null}:{palette:i,customColors:null,paletteColors:[...palettes[i].colors],palettePrevious:before})}
 const paletteControls=<>{format==='outfit'&&<p className="studio-hint">Choose the backdrop. The clothes keep their natural fabric colors.</p>}<div className="night-palettes" aria-label="Color stories">{palettes.map((p,i)=><button type="button" key={i} disabled={locked} aria-label={p.name} aria-pressed={creation.palette===i&&!creation.customColors} onClick={()=>choosePalette(i)}><span aria-hidden="true">{p.colors.map((color,j)=><i key={j} style={{backgroundColor:color}}/>)}</span><small>{p.name}</small></button>)}</div>{format!=='blueprint'&&<div className="studio-own-colors">{colors.map((c,i)=><label key={i}>{(format==='outfit'?['Paper','Ink','Accent']:['Main','Structure','Detail'])[i]}<input type="color" aria-label={`Your ${['main','structure','detail'][i]} color`} value={c} onChange={e=>commit({customColors:colors.map((v,j)=>j===i?e.target.value:v)})}/></label>)}</div>}</>
 const panes=format==='invitation'?[['design','Colors'],['text','Words']]:format==='book'?[['design','Cover'],['text','Words']]:format==='postcard'?[['design','Front'],['message','Message'],['arrange','Stamp']]:format==='cafe'?[['design','Place'],['menu','Menu'],['text','Details']]:[['design',format==='blueprint'?'Compose':'Design'],['arrange','Arrange'],['text','Words']]
 const renderText=()=>field&&<div className="studio-field-editor"><label>{field.label}{field.id==='message'||field.id==='ritual'?<textarea ref={fieldRef} aria-label={field.label} maxLength={600} rows={4} value={creation.fields?.[field.id]||''} onChange={e=>commit({fields:{...creation.fields,[field.id]:e.target.value}})}/>:<input ref={fieldRef} aria-label={field.label} maxLength={150} value={creation.fields?.[field.id]||''} onChange={e=>commit({fields:{...creation.fields,[field.id]:e.target.value}})}/>}</label><div className="night-suggestions">{[field.starter,...(field.ideas||[])].filter(Boolean).map((text,i)=><button type="button" key={i} aria-pressed={creation.fields?.[field.id]===text} onClick={()=>commit({fields:{...creation.fields,[field.id]:creation.fields?.[field.id]===text?'':text}})}>{text}</button>)}</div><div className="studio-field-tabs" aria-label="Choose text to edit">{(card.studio?.fields||[]).map(f=><button type="button" key={f.id} aria-pressed={field.id===f.id} onClick={()=>setFieldId(f.id)}>{f.label}</button>)}</div></div>
 const addDrink=()=>{const parts=card.studio?.menuParts||[],chosen=parts.map(p=>draftDrink[p.id]).filter(Boolean);if((!chosen.length&&!drinkName.trim())||(creation.menu||[]).length>=6)return;const name=drinkName.trim()||chosen.slice(0,2).reverse().join(' ');commit({menu:[...(creation.menu||[]),{id:makeId(),name,description:chosen.join(' · ')}]});setDrinkName('');setDraftDrink({})}
 const directions=format==='outfit'?card.studio?.looks:format==='invitation'?card.studio?.connections:null,discover=directions?.length&&creation.studioMode!=='create'
 const applyDirection=item=>{
  if(creation.directionId===item.id){commit({...creation.directionBefore,directionId:null,directionBefore:null,studioMode:'discover'});return}
  const before={fields:copy(creation.fields),design:copy(creation.design),palette:creation.palette,paletteColors:creation.paletteColors||null,customColors:creation.customColors||null,directionId:creation.directionId||null}
  const patch=format==='outfit'?{fields:{...creation.fields,name:item.title,detail:item.note},palette:null,paletteColors:item.colors,customColors:null,design:{...creation.design,objects:(card.studio?.canvas?.pieces||[]).filter(p=>(item.pieces||[]).includes(p.id)).map(p=>studioObject(p,makeId()))},styleNote:item.note}:{fields:{...creation.fields,name:item.name||item.title,plan:item.plan,message:item.message,by:item.detail},connectionNote:item.note}
  commit({...patch,directionBefore:before,directionId:item.id,studioMode:'create',selectedObject:null})
 }
 const reflection=card.studio?.feeling&&<section className="e2-life-bridge"><small>COME BACK TO YOU</small><h3>{card.studio.feeling}</h3><button type="button" className="e2-more-button" aria-pressed={!!creation.wantMore} disabled={disabled} onClick={()=>commit({wantMore:!creation.wantMore,nextStep:creation.wantMore?null:creation.nextStep,feelingSnapshot:card.studio.feeling})}>{creation.wantMore?'✓ I want more of this':'I want more of this in my life'}</button>{creation.wantMore&&<><p>If you want to bring it a little closer:</p><div className="night-suggestions">{(card.studio.bridge||[]).map(text=><button type="button" key={text} aria-pressed={creation.nextStep===text} disabled={disabled} onClick={()=>commit({nextStep:creation.nextStep===text?null:text})}>{text}</button>)}</div><small className="e2-bridge-optional">Optional. You can keep this just as it is.</small></>}</section>
 const saveActions=onContinue&&(format!=='blueprint'||creation.phase==='revealed')&&<>{reflection}<div className="studio-save-actions"><button type="button" className="studio-action" disabled={disabled||locked||format==='blueprint'&&creation.phase!=='revealed'} onClick={onContinue}>Save & continue<span aria-hidden="true"> →</span></button><button type="button" className="e1-text-button" disabled={disabled||locked||format==='blueprint'&&creation.phase!=='revealed'} onClick={onSave}>Save & keep exploring</button></div></>
 const directionNav=directions?.length&&<nav className="studio-panes" aria-label="Workshop mode"><button type="button" aria-pressed={!!discover} disabled={disabled} onClick={()=>commit({studioMode:'discover'},false)}>{format==='outfit'?'Explore looks':'Find your kind of company'}</button><button type="button" aria-pressed={!discover} disabled={disabled} onClick={()=>commit({studioMode:'create'},false)}>{format==='outfit'?'My look':'My invitation'}</button></nav>
 if(discover)return <div className="night-workbench e2-inspired-studio" aria-label={format==='outfit'?'Your style workshop':'Your connection workshop'}>{directionNav}<p className="studio-hint">{format==='outfit'?'Swipe through specific looks. Try one, then change it into your own version.':'Find the kind of company you would enjoy. Then make the invitation sound like you.'}</p><StudioOptionDeck label={format==='outfit'?'Styled looks':'Connection ideas'} items={directions} index={creation.directionPage||0} onIndex={directionPage=>commit({directionPage},false)} onChoose={applyDirection} selected={creation.directionId} disabled={disabled} media={item=>format==='outfit'?<div className="studio-artwork e2-style-preview"><StudioCanvas card={card} data={{...creation,paletteColors:item.colors,customColors:null,design:{...creation.design,objects:(card.studio?.canvas?.pieces||[]).filter(p=>(item.pieces||[]).includes(p.id)).map(p=>studioObject(p,p.id))}}} readOnly/></div>:<div className="e2-company-illustration" aria-hidden="true"><div className="e2-tabletop"/><div className="e2-company-cup e2-cup-one"/><div className="e2-company-cup e2-cup-two"/><div className="e2-company-note">{item.note}</div></div>}/></div>

 if(format==='mystery'){
  const cases=card.studio?.cases||[],puzzle=creation.puzzleSnapshot||cases.find(c=>c.id===creation.puzzleCaseId)||(creation.puzzleChoice&&!creation.puzzleCaseId?card.studio?.puzzle:cases[0])||card.studio?.puzzle||{},chosen=(puzzle.options||[]).find(o=>o.id===creation.puzzleChoice)
  return <div className="night-workbench studio-mystery" aria-label="Your mystery workshop">{cases.length>1&&<div className="studio-case-picker" aria-label="Choose a story">{cases.map(c=><button type="button" key={c.id} aria-pressed={puzzle.id===c.id} disabled={disabled} onClick={()=>commit({fields:{...creation.fields,name:c.title},puzzleCaseId:c.id,puzzleSnapshot:copy(c),puzzleChoice:null,puzzleRevealed:false})}>{c.title}</button>)}</div>}<small className="studio-case-label">{puzzle.title||'THE CASE'}</small><h2>{puzzle.question}</h2><p>{puzzle.story}</p><ol className="studio-clues">{(puzzle.clues||[]).map((clue,i)=><li key={i}>{clue}</li>)}</ol><p className="studio-hint">Follow the clues. Who would you choose?</p><div className="studio-suspects">{(puzzle.options||[]).map(o=><button type="button" key={o.id} aria-pressed={creation.puzzleChoice===o.id} disabled={disabled} onClick={()=>commit({fields:{...creation.fields,name:puzzle.title||creation.fields?.name},puzzleChoice:creation.puzzleChoice===o.id?null:o.id,puzzleCaseId:puzzle.id||null,puzzleSnapshot:copy(puzzle),puzzleRevealed:false})}>{o.title}</button>)}</div>{chosen&&<div className="studio-case-feedback" role="status"><h3>{chosen.id===puzzle.answer?'The clues fit.':'A detail to notice.'}</h3><p>{chosen.feedback}</p><button type="button" className="e1-text-button" disabled={disabled} onClick={()=>commit({puzzleRevealed:!creation.puzzleRevealed})}>{creation.puzzleRevealed?'Hide the explanation':'See how the clues fit'}</button>{creation.puzzleRevealed&&<p>{puzzle.solution}</p>}</div>}{creation.puzzleRevealed&&saveActions}</div>
 }

 if(format==='blueprint')return <div className="night-workbench studio-workbench studio-botanical" aria-label="Your botanical print studio">{saveActions}
  <p className="studio-botanical-intro">Arrange leaves and flowers. Reveal them as pale silhouettes on deep blue.</p>
  {creation.phase!=='revealed'&&<>
   <div className="studio-piece-tray" aria-label="Choose print shapes">{(card.studio?.canvas?.pieces||[]).map(p=>{const present=creation.design.objects.some(o=>o.pieceId===p.id);return <button type="button" key={p.id} disabled={locked||creation.design.objects.length>=12&&!present} aria-pressed={present} aria-label={`${present?'Remove':'Add'} ${p.label}`} onClick={()=>addPiece(p)}><span><StudioShape shape={p.shape} photo={p.photo}/></span><small>{p.label}</small></button>})}</div>
  <p className="studio-hint">Tap a shape to add or remove it. Drag on the paper to arrange.</p></>}
  <div className="studio-history"><button type="button" disabled={!history.current.length||locked} onClick={undo}>Undo</button><button type="button" disabled={!future.current.length||locked} onClick={redo}>Redo</button>{creation.phase==='revealed'&&<button type="button" className="studio-preview-button" onClick={()=>commit({phase:'compose'})}>Adjust composition</button>}<span className="studio-print-state" role="status">{locked?'Revealing…':creation.phase==='revealed'?'Your print is ready':'Arrange your shapes'}</span></div>
  <DesignedArtwork card={card} data={creation} onChange={commit} onSelect={select} onField={()=>{fieldRef.current?.focus?.();fieldRef.current?.scrollIntoView?.({block:'nearest',behavior:'smooth'})}} readOnly={creation.phase==='revealed'}/>
  {creation.phase!=='revealed'&&<div className="studio-botanical-tools" inert={locked?'':undefined}>


   {!creation.design.objects.length&&<p className="studio-hint" role="status">Add a shape to begin your print.</p>}
   {active&&<section className="studio-print-adjustments" aria-label="Adjust selected shape"><p className="studio-selected-label">{active.label}<button type="button" className="e1-text-button" aria-label="Deselect shape" onClick={()=>select(active.id)}>Done</button></p><div className="studio-position-tools">{[['←',-3,0,'left'],['↑',0,-3,'up'],['↓',0,3,'down'],['→',3,0,'right']].map(([label,dx,dy,name])=><button type="button" key={name} disabled={locked} aria-label={`Move selected piece ${name}`} onClick={()=>move(dx,dy)}>{label}</button>)}</div><label className="studio-slider">Size<input type="range" aria-label="Selected piece size" min="10" max="55" value={active.w} disabled={locked} onChange={e=>resize(Number(e.target.value))}/></label><label className="studio-slider">Rotate<input type="range" aria-label="Selected piece rotation" min="-180" max="180" step="5" value={active.rotation||0} disabled={locked} onChange={e=>updateObject({rotation:Number(e.target.value)})}/></label><div className="studio-object-actions"><button type="button" disabled={locked} onClick={()=>reorder(-1)}>Back</button><button type="button" disabled={locked} onClick={()=>reorder(1)}>Forward</button><button type="button" disabled={locked||creation.design.objects.length>=12} onClick={duplicate}>Duplicate</button><button type="button" disabled={locked} onClick={()=>commit({design:{...creation.design,objects:creation.design.objects.filter(o=>o.id!==active.id)},selectedObject:null})}>Remove piece</button></div></section>}
   {!locked&&creation.design.objects.length>0&&<p className="studio-hint">Ready? Tap “Expose my print” below to reveal the blue.</p>}
  </div>}
  {!!palettes.length&&<fieldset className="studio-print-colors" disabled={locked}><legend>Choose your blue</legend>{paletteControls}</fieldset>}
  <label className="studio-print-name">Name your print<input ref={fieldRef} aria-label={card.studio?.fields?.find(f=>f.id==='name')?.label||'Print title'} maxLength={150} disabled={locked} value={creation.fields?.name||''} onChange={e=>commit({fields:{...creation.fields,name:e.target.value}})}/></label>
  {creation.phase==='revealed'&&<p className="studio-hint" role="status">Your digital print is ready. Keep it below, or adjust the composition and expose it again.</p>}
 </div>
 return <div className={`night-workbench studio-workbench ${locked?'studio-is-exposing':''}`} aria-label="Your creative studio">{directionNav}{!directions?.length&&saveActions}
  <div className="studio-history"><button type="button" disabled={!history.current.length||locked} onClick={undo}>Undo</button><button type="button" disabled={!future.current.length||locked} onClick={redo}>Redo</button>{format==='cafe'&&<button type="button" className="studio-preview-button" onClick={()=>commit({preview:!creation.preview},false)}>{creation.preview?'Back to my studio':'Open my café'}</button>}{format==='blueprint'&&creation.phase==='revealed'&&<button type="button" className="studio-preview-button" onClick={()=>commit({phase:'compose'})}>Adjust composition</button>}</div>
  <DesignedArtwork card={card} data={creation} onChange={commit} onSelect={select} onField={editField} readOnly={format==='blueprint'&&creation.phase==='revealed'}/>
  {!creation.preview&&!locked&&!(format==='blueprint'&&creation.phase==='revealed')&&<p className="studio-hint">{format==='book'?'Tap the lettering to edit your cover.':format==='postcard'?'Design the front, then turn to your message.':format==='invitation'?'Tap the invitation to edit its words.':'Drag to arrange · tap a piece for more controls.'}</p>}
  {!creation.preview&&!(format==='blueprint'&&creation.phase==='revealed')&&<><nav className="studio-panes" aria-label="Creative tools">{panes.map(([id,label])=><button type="button" key={id} disabled={locked} aria-pressed={pane===id} onClick={()=>{setPane(id);if(format==='postcard'&&id==='message')setFieldId('message');if(format==='postcard')patchDesign({side:id==='design'?'front':'back'})}}>{label}</button>)}</nav><div className="studio-tool-panel" inert={locked?'':undefined}>
   {pane==='text'?renderText():pane==='menu'?<><StudioMenu card={card} data={creation} onChange={commit} onRemove={id=>commit({menu:(creation.menu||[]).filter(x=>x.id!==id)})}/><section className="studio-drink-builder" aria-label="Invent a signature drink"><h3>Invent a signature drink</h3>{(card.studio?.menuParts||[]).map(p=><div className="studio-menu-part" key={p.id}><small>{p.label}</small><div className="night-suggestions">{(p.options||[]).map(option=><button type="button" key={option} aria-pressed={draftDrink[p.id]===option} onClick={()=>setDraftDrink({...draftDrink,[p.id]:draftDrink[p.id]===option?null:option})}>{option}</button>)}</div></div>)}<label>Name your drink<input aria-label="Signature drink name" maxLength={80} value={drinkName} onChange={e=>setDrinkName(e.target.value)} placeholder="Or keep the name we make"/></label><button type="button" className="studio-action" disabled={(creation.menu||[]).length>=6||(!drinkName.trim()&&!Object.values(draftDrink).some(Boolean))} onClick={addDrink}>Add to my menu</button></section><button type="button" className="e1-text-button" onClick={()=>editField('ritual')}>Give the café a house tradition</button></>:pane==='message'?<>{renderText()}<button type="button" className="e1-text-button" onClick={()=>{setPane('arrange');patchDesign({side:'back'})}}>Arrange the postage stamp ↗</button></>:pane==='arrange'?<>
    {active?<><p className="studio-selected-label">{active.label}</p><div className="studio-position-tools">{[['←',-3,0,'left'],['↑',0,-3,'up'],['↓',0,3,'down'],['→',3,0,'right']].map(([label,dx,dy,name])=><button type="button" key={name} aria-label={`Move selected piece ${name}`} onClick={()=>move(dx,dy)}>{label}</button>)}</div><label className="studio-slider">Size<input type="range" aria-label="Selected piece size" min="10" max="55" value={active.w} onChange={e=>resize(Number(e.target.value))}/></label><label className="studio-slider">Rotate<input type="range" aria-label="Selected piece rotation" min="-180" max="180" step="5" value={active.rotation||0} onChange={e=>updateObject({rotation:Number(e.target.value)})}/></label><div className="studio-object-actions"><button type="button" onClick={()=>reorder(-1)}>Back</button><button type="button" onClick={()=>reorder(1)}>Forward</button><button type="button" disabled={creation.design.objects.length>=12} onClick={duplicate}>Duplicate</button><button type="button" onClick={()=>{commit({design:{...creation.design,objects:creation.design.objects.filter(o=>o.id!==active.id)},selectedObject:null})}}>Remove piece</button></div></>:<p className="studio-hint">Tap a piece on the canvas to move, resize or rotate it.</p>}
    {(card.studio?.canvas?.pieces||[]).length>0&&<div className="studio-piece-tray" aria-label="Add a piece">{card.studio.canvas.pieces.map(p=><button type="button" key={p.id} disabled={creation.design.objects.length>=12&&!creation.design.objects.some(o=>o.pieceId===p.id)} aria-pressed={creation.design.objects.some(o=>o.pieceId===p.id)} aria-label={`${creation.design.objects.some(o=>o.pieceId===p.id)?'Remove':'Add'} ${p.label}`} onClick={()=>addPiece(p)}><span><StudioShape shape={p.shape} photo={p.photo}/></span><small>{p.label}</small></button>)}</div>}
   </>:<>
    {format==='blueprint'?<><p className="studio-hint">Place your specimens. Drag to arrange them, then expose your digital print.</p><div className="studio-piece-tray" aria-label="Add a piece">{(card.studio?.canvas?.pieces||[]).map(p=><button type="button" key={p.id} disabled={creation.design.objects.length>=12&&!creation.design.objects.some(o=>o.pieceId===p.id)} aria-pressed={creation.design.objects.some(o=>o.pieceId===p.id)} aria-label={`${creation.design.objects.some(o=>o.pieceId===p.id)?'Remove':'Add'} ${p.label}`} onClick={()=>addPiece(p)}><span><StudioShape shape={p.shape} photo={p.photo}/></span><small>{p.label}</small></button>)}</div></>:<>{paletteControls}{format==='cafe'&&<div className="studio-choice-row" aria-label="Awning style">{[['stripe','Stripes'],['solid','Solid'],['scallop','Scalloped']].map(([id,label])=><button type="button" key={id} aria-pressed={creation.design.awning===id} onClick={()=>chooseStyle('awning',id)}>{label}</button>)}</div>}{format==='book'&&<><div className="studio-choice-row" aria-label="Cover type style">{[['serif','Editorial'],['italic','Romantic'],['sans','Modern']].map(([id,label])=><button type="button" key={id} aria-pressed={creation.design.font===id} onClick={()=>chooseStyle('font',id)}>{label}</button>)}</div><div className="studio-choice-row" aria-label="Cover layout">{[['center','Centered'],['top','Top aligned'],['frame','Framed']].map(([id,label])=><button type="button" key={id} aria-pressed={creation.design.layout===id} onClick={()=>chooseStyle('layout',id)}>{label}</button>)}</div><div className="studio-choice-row" aria-label="Cover ornament">{[['petals','Petals'],['arch','An arch'],['none','Type only']].map(([id,label])=><button type="button" key={id} aria-pressed={creation.design.ornament===id} onClick={()=>chooseStyle('ornament',id)}>{label}</button>)}</div></>}{format==='postcard'&&<div className="studio-choice-row" aria-label="Postcard scene">{[['coast','Coast'],['mountains','Mountains'],['city','City']].map(([id,label])=><button type="button" key={id} aria-pressed={creation.design.scene===id} onClick={()=>chooseStyle('scene',id)}>{label}</button>)}</div>}{['cafe','room','garden','outfit'].includes(format)&&<div className="studio-piece-tray" aria-label="Add a piece">{(card.studio?.canvas?.pieces||[]).map(p=><button type="button" key={p.id} disabled={creation.design.objects.length>=12&&!creation.design.objects.some(o=>o.pieceId===p.id)} aria-pressed={creation.design.objects.some(o=>o.pieceId===p.id)} aria-label={`${creation.design.objects.some(o=>o.pieceId===p.id)?'Remove':'Add'} ${p.label}`} onClick={()=>addPiece(p)}><span><StudioShape shape={p.shape} photo={p.photo}/></span><small>{p.label}</small></button>)}</div>}</>}
   </>}
  </div></>}
  {directions?.length&&saveActions}
  {creation.preview&&<p className="studio-hint">Tap the menu to change its words. Return to your studio to add something new.</p>}
  {format==='blueprint'&&creation.phase==='revealed'&&<p className="studio-hint" role="status">Your digital print is ready. Keep it below, or adjust the composition and expose it again.</p>}
 </div>
}

function EditorialTitle({text=''}){
 const lines=String(text).split('\n')
 if(lines.length<2)return <>{text}</>
 return <>{lines.slice(0,-1).join('\n')}{'\n'}<em>{lines[lines.length-1]}</em></>
}
function PetalMark(){return <span className="e1-petal" aria-hidden="true"><i/><i/><i/><i/></span>}

export function RebuildExperienceOneCompletion({title,cover,onBack,onReopen,onContinue,previewMode=false}){
 return <section className={`tr-e1 e1-complete ${previewMode?'e1-preview':''}`} aria-label="Experience complete">
  <Style/>
  <header className="e1-top"><button type="button" className="e1-text-button" onClick={onBack}>‹ My Rebuild</button><span>Saved</span></header>
  <main className="e1-content">
   <div className="e1-complete-mark"><PetalMark/></div>
   <h1><EditorialTitle text={'Yours to\ncome back to.'}/></h1>
   <p className="e1-copy">Everything you made is saved.</p>
   <article className="e1-complete-card">
    {cover?.photo&&<div className="e1-complete-photo"><img src={cover.photo} alt="" style={photoStyle(cover)}/></div>}
    <div><small>Experience complete</small><h2>{title}</h2></div>
   </article>
  </main>
  <footer className="e1-footer">
   <button type="button" className="e1-primary" onClick={onContinue||onReopen}>{onContinue?'Continue my Rebuild':'Reopen this experience'}<span aria-hidden="true">→</span></button>
   {onContinue&&<button type="button" className="e1-reopen" onClick={onReopen}>Reopen this experience</button>}
  </footer>
 </section>
}

function Style(){return <style>{`
.tr-e1{
 --e1-ink:#30212c;--e1-muted:#654858;--e1-paper:#fff9f4;--e1-plum:#55354d;
 color:var(--e1-ink);background:var(--e1-paper);font-family:'Nunito Sans',-apple-system,sans-serif;
 position:fixed;z-index:40;height:calc(100vh - 84px);top:var(--e1-viewport-top,0px);height:calc(var(--e1-viewport,100dvh) - 84px);bottom:auto;left:50%;width:100%;max-width:440px;transform:translateX(-50%);
 display:flex;flex-direction:column;min-height:0;isolation:isolate;overflow:hidden;container-type:inline-size;
}
.tr-e1.e1-preview{position:relative;inset:auto;transform:none;max-width:440px;width:100%;height:720px;height:min(760px,calc(100svh - 32px));min-height:420px;margin:0 auto;border-radius:24px}
.tr-e1 *{box-sizing:border-box}
.tr-e1 :is(h1,h2,h3,p,span,small,dt,dd){color:var(--e1-ink);overflow-wrap:anywhere}
.tr-e1 :is(button,input,textarea){font:inherit;letter-spacing:normal}
.tr-e1 button{min-height:46px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.tr-e1 button:disabled{opacity:.4;cursor:default}
.tr-e1 button:focus-visible,.tr-e1 [tabindex]:focus-visible,.tr-e1 :is(input,textarea):focus-visible{outline:2px solid #88607c;outline-offset:3px}
.tr-e1 button:active:not(:disabled){transform:scale(.97)}
.tr-e1 .e1-text-button{border:0;background:transparent;color:var(--e1-muted);padding:10px 0;font-size:14px;line-height:1.4;text-align:left}
.tr-e1 .e1-top{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 68px 6px 24px;padding-top:max(8px,env(safe-area-inset-top));position:relative;z-index:2}
.tr-e1.e1-preview .e1-top{padding-right:24px}
.tr-e1 .e1-top>span{font-size:14px;color:var(--e1-muted);white-space:nowrap}
.tr-e1 .e1-header-pause{padding:10px 6px}
.tr-e1 .e1-progress{height:2px;background:#e4d6df;margin:0 26px;flex-shrink:0;overflow:hidden}
.tr-e1 .e1-progress>span{display:block;height:100%;background:#96748b;transition:width .45s ease}
.tr-e1 .e1-content{display:flex;flex-direction:column;position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;padding:24px 28px 22px;outline:none;scroll-padding:18px}
.tr-e1 .e1-content>*{flex-shrink:0}
.tr-e1 em{color:inherit;font-weight:400;font-style:italic}
.tr-e1 h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(36px,10cqi,44px);font-weight:500;line-height:1.05;letter-spacing:-.6px;white-space:pre-line;margin:0;text-wrap:balance}
.tr-e1 h1.e1-focus-title{font-size:clamp(29px,8.4cqi,35px);line-height:1.09;max-width:19ch}
.tr-e1 .e1-copy{font-size:16px;line-height:1.6;margin:16px 0 0;white-space:pre-line;max-width:31ch;color:var(--e1-muted)}
.tr-e1 .e1-eyebrow{font-size:14px;letter-spacing:.7px;line-height:1.5;color:var(--e1-muted);margin:0 0 14px}
.tr-e1 .e1-footer{flex-shrink:0;position:relative;z-index:2;padding:12px 26px 16px;background:inherit;border-top:1px solid #55354d0b}
.tr-e1 .e1-primary{display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;min-height:54px;border:0;border-radius:17px;background:var(--e1-plum);color:#fff;font-size:16px;font-weight:600;line-height:1.4;padding:14px 20px;box-shadow:0 5px 15px #55354d14;transition:transform .18s ease,background .18s ease}
.tr-e1 .e1-primary>span{font-size:24px;line-height:1;color:inherit;flex-shrink:0}
.tr-e1 .e1-button-spinner{display:block;width:20px;height:20px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:e1-spin .75s linear infinite}
@keyframes e1-spin{to{transform:rotate(360deg)}}
.tr-e1 .e1-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
/* The opening is a photograph-led invitation; copy always has its own dark field. */
.tr-e1.e1-hero{background:#503f51;color:#fff}
.tr-e1 .e1-hero-photo{position:absolute;inset:0;z-index:-2;background:#503f51;overflow:hidden}
.tr-e1 .e1-hero-photo img{width:100%;height:100%;object-fit:cover;animation:e1-photo-reveal 1.1s cubic-bezier(.22,1,.36,1) both}
.tr-e1.e1-hero:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#211622be 0%,#21162220 28%,#21162278 48%,#211622f2 83%,#211622fa)}
.tr-e1.e1-hero .e1-content{display:flex;flex-direction:column;justify-content:flex-start;padding-top:100px;padding-bottom:22px}
.tr-e1.e1-hero .e1-eyebrow{margin-top:auto}
.tr-e1.e1-hero h1{font-size:clamp(48px,14cqi,61px);line-height:.97;max-width:9ch;text-shadow:0 2px 14px #21162244}
.tr-e1.e1-hero :is(h1,p,span,em,.e1-text-button){color:#fff}
.tr-e1.e1-hero .e1-copy{max-width:28ch;line-height:1.6;margin-top:18px}
.tr-e1.e1-hero .e1-footer{background:transparent;border:0}
.tr-e1.e1-hero .e1-primary{background:#fff9f4;color:#30212c;box-shadow:none}
.tr-e1.e1-hero .e1-primary span{color:#30212c}
.tr-e1 .e1-stage-photo{margin:20px 0;border-radius:22px;overflow:hidden;background:#e8dde4}
.tr-e1 .e1-stage-photo img{display:block;height:170px!important;object-fit:cover}
.tr-e1 .e1-stage-photo figcaption{position:relative;padding:12px 16px;background:#fff9f4;color:#654858;font-size:14px;line-height:1.5}
/* The lesson reads like a quiet editorial spread rather than another card. */
.tr-e1.e1-reading{background:radial-gradient(ellipse at 95% 25%,#e9d9e6 0%,transparent 60%),#fff9f0}
.tr-e1.e1-reading .e1-content{padding-top:42px}
.tr-e1.e1-reading h1{font-size:clamp(40px,12cqi,52px);max-width:11ch}
.tr-e1.e1-reading .e1-copy{border-left:2px solid #b58eaa;padding-left:18px;margin-top:26px;max-width:29ch;font-size:18px;line-height:1.65}
.tr-e1 .e1-reading-art{height:108px;position:relative;margin:24px 0 16px;display:flex;align-items:center;justify-content:center}.tr-e1 .e1-reading-art .e1-petal{width:90px;height:90px;color:#92718a;opacity:.65;animation:e1-bloom .85s ease both}
.tr-e1 blockquote{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;line-height:1.3;margin:22px 0;padding-left:17px;border-left:2px solid #b994ac;color:#55354d}
.tr-e1 blockquote small{display:block;font-family:'Nunito Sans',sans-serif;font-size:14px;line-height:1.5;margin-bottom:8px;color:#654858}
/* The deck stays tactile. Only the paper moves; the controls keep their positions. */
.tr-e1.e1-cards{background:#f8eff2}
.tr-e1 .e1-deck{position:relative;margin:24px 2px 14px;user-select:none;-webkit-user-select:none}
.tr-e1 .e1-deck:before,.tr-e1 .e1-deck:after{content:'';position:absolute;inset:6px -4px 4px 5px;transform:rotate(2.2deg);border-radius:22px;background:#e3d3df;z-index:-1;pointer-events:none}
.tr-e1 .e1-deck:after{inset:9px 2px 1px -3px;transform:rotate(-1.4deg);background:#eee2e9;z-index:-2}
.tr-e1 .e1-paper{position:relative;isolation:isolate;background:#fffdf8;border:1px solid #71516712;border-radius:22px;min-height:205px;padding:60px 26px 27px;box-shadow:0 10px 28px #4931430a;animation:e1-card-in .32s cubic-bezier(.22,1,.36,1) both}
.tr-e1 .e1-direction--1 .e1-paper{animation-name:e1-card-in-back}
.tr-e1 .e1-card-select{position:absolute;inset:0;z-index:3;width:100%;height:100%;padding:0;border:0;border-radius:inherit;background:transparent;cursor:pointer;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.tr-e1 .e1-card-select:focus-visible{outline-offset:-4px}
.tr-e1 .e1-paper[data-kept=true]{box-shadow:inset 0 0 0 2px #718563,0 10px 28px #4931430a}
.tr-e1 .e1-reading-text{margin-top:22px}
.tr-e1 .e1-reading-text p{font-size:16px;line-height:1.7;color:#49323f;margin:0 0 18px;white-space:pre-line}
.tr-e1 .e1-card-motion{transform:translate3d(var(--drag-x,0),0,0) rotate(var(--drag-turn,0deg));transition:transform .28s cubic-bezier(.22,1,.36,1),opacity .18s ease;will-change:transform}
.tr-e1 .e1-deck[data-dragging] .e1-card-motion,.tr-e1 .e1-deck[data-reset] .e1-card-motion{transition:none}
.tr-e1 .e1-deck[data-departing] .e1-card-motion{transition:transform .18s ease-in,opacity .18s ease-in;opacity:.1}
.tr-e1 .e1-card-photo{height:155px;overflow:hidden;border-radius:13px;margin:20px 0 18px}
.tr-e1 .e1-paper img{display:block;width:100%;height:155px!important;object-fit:cover;border-radius:13px;margin:0;pointer-events:none}
.tr-e1 .e1-card-number{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
.tr-e1 .e1-paper h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(29px,8.5cqi,35px);font-weight:500;line-height:1.12;letter-spacing:-.3px;margin:0;text-wrap:balance}
.tr-e1 .e1-paper p{font-size:16px;line-height:1.6;margin:14px 0 0;color:var(--e1-muted)}
.tr-e1 .e1-browse{position:absolute;z-index:5;top:8px;left:9px;right:9px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.tr-e1 .e1-browse button{width:46px;min-width:46px;background:transparent;border:0;color:#654858;font-size:26px;border-radius:50%}
.tr-e1 .e1-browse span:not(.e1-sr-only){font-size:14px;line-height:1.4;color:#654858}
.tr-e1 .e1-decisions{display:flex;gap:10px;margin-top:19px}
.tr-e1 .e1-decisions button{flex:1;background:transparent;border:1px solid #baa2b3;border-radius:15px;padding:12px 9px;color:#47303e;font-size:15px;line-height:1.4;transition:background .2s,border-color .2s,transform .18s}
.tr-e1 .e1-decisions button:first-child{background:#fffdf8}
.tr-e1 .e1-decisions button[aria-pressed=true]{background:#55354d;border-color:#55354d;color:#fff;box-shadow:0 4px 12px #55354d15}
.tr-e1 .e1-own{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px;margin-top:8px;min-height:46px}
.tr-e1 .e1-selection-count{font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .e1-own-form{display:flex;flex-basis:100%;gap:8px;padding-top:4px}
.tr-e1 :is(input,textarea){font-size:16px;line-height:1.6;padding:12px 14px;border:1px solid #baa2b3;border-radius:13px;background:#fffcf9;color:#30212c;max-width:100%;width:100%;min-width:0}
.tr-e1 :is(input,textarea)::placeholder{color:#755769;opacity:1}
.tr-e1 textarea{margin-top:12px;min-height:100px;resize:vertical}
.tr-e1 .e1-own-form button,.tr-e1 .e1-notice button{border:1px solid #baa2b3;border-radius:13px;background:#fff9f4;color:#47303e;padding:8px 13px;font-size:15px}
.tr-e1 .e1-optional{margin:18px 0 0;border-top:1px solid #d5c2ce;color:#55354d}
.tr-e1 summary{font-size:15px;line-height:1.5;min-height:46px;padding:13px 0;cursor:pointer}
.tr-e1 .e1-optional p{font-size:16px;line-height:1.65;white-space:pre-line;margin:12px 0}
.tr-e1 .e1-optional h3{font-size:16px;line-height:1.6;margin-top:16px}
/* Choose a workshop, then enter a warmer making space. */
.tr-e1.e1-discover{background:#eeedf5}
.tr-e1.e1-discover .e1-content{padding-top:32px}
.tr-e1 .e1-arched{border-radius:110px 110px 22px 22px;padding-top:66px;text-align:center;background:linear-gradient(150deg,#fffdf6,#ece0ea);min-height:230px;display:flex;flex-direction:column;justify-content:flex-end}
.tr-e1.e1-create{background:#faf1e6}
.tr-e1 .e1-ingredients{display:flex;gap:8px;margin:24px 0 0;padding-bottom:5px}
.tr-e1 .e1-ingredients>span{flex:1;font-size:14px;line-height:1.35;color:#654858;border-bottom:2px solid #d5c5cc;padding-bottom:10px}
.tr-e1 .e1-ingredients>span>span{display:block;margin-bottom:4px;font-size:14px;color:inherit}
.tr-e1 .e1-ingredients>span[aria-current=step]{border-color:#55354d;color:#30212c;font-weight:700}
.tr-e1 .e1-ingredients .is-chosen{border-color:#96748b}
.tr-e1 .e1-chosen{font-size:15px;line-height:1.5;margin:16px 0 0;color:#55354d}
.tr-e1.e1-curiosity{background:#edf1eb}
.tr-e1.e1-curiosity .e1-paper{border-radius:5px 26px 26px 5px;border-left:4px solid #a5b39c;background:#fffdf6}
.tr-e1.e1-surprise{background:#f2ecf5}
.tr-e1.e1-surprise .e1-paper{background:linear-gradient(140deg,#fffaf3,#fff7fc);border-radius:25px 25px 5px 25px}
.tr-e1 .e1-surprise{padding:22px;margin-top:20px;background:#e7daec;border-radius:22px;text-align:center}
.tr-e1 .e1-surprise button{border:0;border-radius:14px;background:#55354d;color:#fff;font-size:15px;padding:12px 22px}
.tr-e1 .e1-surprise p{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.2;margin:20px 0 0;animation:e1-keepsake-reveal .45s ease both}
/* The result is a personal object, with separate compositions for scenes and collections. */
.tr-e1.e1-finish{background:#edf0e9}
.tr-e1.e1-finish .e1-content{padding-top:28px}
.tr-e1 .e1-keepsake{padding:0;background:#fffdf6;border:1px solid #a6b19d40;border-radius:4px 4px 22px 4px;margin-top:24px;box-shadow:0 14px 35px #455a3d10;overflow:hidden;animation:e1-keepsake-reveal .6s cubic-bezier(.22,1,.36,1) both}
.tr-e1 .e1-keepsake-photo{height:128px;overflow:hidden;background:#e5ddd8}
.tr-e1 .e1-keepsake-photo img{display:block;width:100%;height:100%!important;object-fit:cover}
.tr-e1 .e1-keepsake-inner{padding:24px}
.tr-e1 .e1-keepsake small{display:block;font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .e1-keepsake h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.1;font-weight:500;white-space:pre-line;margin:12px 0 0;text-wrap:balance}
.tr-e1 .e1-scene{margin:26px 0 0}
.tr-e1 .e1-scene>div{border-top:1px solid #ddd5c9;padding:18px 0}
.tr-e1 .e1-scene>div:last-child{padding-bottom:0}
.tr-e1 .e1-scene dt{font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .e1-scene dd{font-size:18px;line-height:1.5;margin:6px 0 0;color:#30212c}
.tr-e1 .e1-scene-feeling dd{font-family:'Cormorant Garamond',Georgia,serif;font-size:38px;line-height:1.1;font-style:italic}
.tr-e1 .e1-keepsake-collection{display:grid;gap:0;margin-top:22px}
.tr-e1 .e1-keepsake-collection>div{display:grid;grid-template-columns:24px 1fr;align-items:start;gap:12px;padding:18px 0;border-top:1px solid #ddd5c9}
.tr-e1 .e1-keepsake-collection>div:last-child{padding-bottom:0}
.tr-e1 .e1-keepsake-collection span{font-size:14px;line-height:1.6;color:#654858}
.tr-e1 .e1-keepsake-collection p{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;line-height:1.2;margin:0;color:#30212c}
.tr-e1 .e1-surprise-keepsake .e1-keepsake-collection{gap:12px}
.tr-e1 .e1-surprise-keepsake .e1-keepsake-collection>div{background:#f1e8f0;padding:18px;border:0;border-radius:3px 18px 3px 18px;grid-template-columns:1fr}
.tr-e1 .e1-keepsake blockquote{font-size:24px;margin-bottom:0}
.tr-e1 .e1-loading{padding:72px 30px;color:#30212c;font-size:17px;line-height:1.6}
.tr-e1 .e1-loading>.e1-petal{width:42px;height:42px;margin-bottom:14px}
.tr-e1 .e1-loading-paper{padding:26px;background:#f0e5ec;border-radius:22px;margin-top:30px}
.tr-e1 .e1-loading-paper i{display:block;height:12px;margin-top:12px;background:#dfccd9;border-radius:6px;width:85%}
.tr-e1 .e1-loading-paper i:nth-child(2){width:65%}
.tr-e1 .e1-loading-paper i:nth-child(3){width:45%}
.tr-e1 .e1-loading button{background:#55354d;color:#fff;border:0;border-radius:14px;padding:12px 20px}
.tr-e1 .e1-notice{padding:14px 16px;border-radius:14px;background:#fff9f4;border:1px solid #b99aaa;color:#47303e;font-size:16px;line-height:1.6;margin-top:20px}
.tr-e1 .e1-notice p{font-size:16px;line-height:1.6;margin:0 0 12px}
.tr-e1.e1-focus .e1-eyebrow{display:none}
.tr-e1.e1-focus .e1-paper{min-height:164px;padding-top:56px;padding-bottom:25px}
.tr-e1.e1-focus .e1-paper p{display:none}
.tr-e1.e1-focus .e1-deck{margin-top:22px}
@keyframes e1-photo-reveal{from{opacity:.3;filter:blur(3px)}to{opacity:1;filter:none}}
@keyframes e1-page-forward{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@keyframes e1-page-back{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@keyframes e1-reading-reveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes e1-card-in{from{opacity:.2;transform:translate3d(48px,0,0) rotate(3deg)}to{opacity:1;transform:translate3d(0,0,0) rotate(0)}}
@keyframes e1-card-in-back{from{opacity:.2;transform:translate3d(-48px,0,0) rotate(-3deg)}to{opacity:1;transform:translate3d(0,0,0) rotate(0)}}
@keyframes e1-keepsake-reveal{from{opacity:0;transform:translateY(20px) rotate(-2deg) scale(.97)}to{opacity:1;transform:none}}
@keyframes e1-bloom{from{opacity:0;transform:rotate(-30deg) scale(.65)}to{opacity:1;transform:none}}
.tr-e1 .e1-content{animation:e1-page-forward .32s cubic-bezier(.22,1,.36,1) both}
.tr-e1 .e1-content.e1-direction--1{animation-name:e1-page-back}
.tr-e1.e1-reading .e1-content{animation:e1-reading-reveal .6s ease both}
.tr-e1.e1-hero .e1-content{animation:e1-reading-reveal .7s ease both}
.tr-e1.e1-create .e1-ingredients{animation:e1-reading-reveal .45s ease both}
/* Rebuild's visual signature: a small botanical mark, layered paper and expressive type. */
.tr-e1 .e1-interaction{display:flex;flex-direction:column;justify-content:center;flex:1 0 auto}
.tr-e1 .e1-phase{letter-spacing:.3px}
.tr-e1 .e1-petal{position:relative;display:inline-block;width:28px;height:28px;color:#87627d;flex-shrink:0;pointer-events:none}
.tr-e1 .e1-petal i{position:absolute;left:25%;top:0;width:50%;height:50%;border:1px solid currentColor;border-radius:60% 60% 8% 60%;transform-origin:50% 100%}
.tr-e1 .e1-petal i:nth-child(2){transform:rotate(90deg)}
.tr-e1 .e1-petal i:nth-child(3){transform:rotate(180deg)}
.tr-e1 .e1-petal i:nth-child(4){transform:rotate(270deg)}
.tr-e1 .e1-paper>.e1-petal{position:absolute;bottom:20px;right:20px;opacity:.18;width:58px;height:58px;z-index:-1}
.tr-e1 .e1-paper h2{max-width:17ch}
.tr-e1 .e1-arched h2{margin-left:auto;margin-right:auto}
.tr-e1 .e1-keepsake-label{display:flex;justify-content:space-between;gap:12px;align-items:center}
.tr-e1 .e1-keepsake-label .e1-petal{width:26px;height:26px;color:#6c7d62}
.tr-e1.e1-reading .e1-content{justify-content:flex-start}
.tr-e1.e1-reading .e1-content:before,.tr-e1.e1-reading .e1-content:after{content:'';flex:1 0 0;min-height:0}
.tr-e1.e1-reading .e1-content>.e1-eyebrow{color:#67445b}
.tr-e1.e1-reading h1 em{color:#67445b}
.tr-e1.e1-reading .e1-copy{border:0;padding:0;max-width:28ch;line-height:1.65}
.tr-e1.e1-reading .e1-optional{margin-top:4px}
.tr-e1.e1-discover .e1-content>.e1-eyebrow,.tr-e1.e1-discover .e1-content>.e1-copy{display:none}
.tr-e1 .e1-workshop-photo{position:absolute;inset:0;z-index:-2;overflow:hidden;border-radius:inherit;background:#55354d}
.tr-e1 .e1-workshop-photo img{height:100%!important;width:100%;border-radius:0;object-fit:cover}
.tr-e1 .e1-illustrated:after{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,#241926b3,#24192640 20%,#241926bc 58%,#241926fa)}
.tr-e1 .e1-illustrated :is(h2,p,span){color:#fffdf8}
.tr-e1 .e1-illustrated h2{font-size:34px;line-height:1.06;max-width:13ch}
.tr-e1 .e1-illustrated p{font-size:16px;line-height:1.5;max-width:26ch;margin:14px auto 0}
.tr-e1 .e1-illustrated>.e1-petal{display:none}
.tr-e1 .e1-deck[data-photo=true] .e1-browse :is(button,span){color:#fffdf8}
.tr-e1.e1-create .e1-content>.e1-eyebrow{max-width:28ch;line-height:1.5}
.tr-e1.e1-create .e1-ingredients{margin-top:20px;gap:8px}
.tr-e1.e1-create .e1-paper{background:#fffdf5;box-shadow:0 12px 30px #704c3d0b;border-radius:4px 26px 4px 26px;min-height:174px}
.tr-e1 .e1-chosen{display:flex;align-items:center;gap:9px;background:#e9e7d8;padding:12px 15px;border-radius:12px;line-height:1.4}
.tr-e1 .e1-chosen>span{color:inherit}
.tr-e1 .e1-own{margin-top:6px}
.tr-e1.e1-finish .e1-content>.e1-eyebrow{display:none}
.tr-e1 .e1-collection-keepsake .e1-keepsake-collection{grid-template-columns:1fr 1fr;gap:12px}
.tr-e1 .e1-collection-keepsake .e1-keepsake-collection>div{display:flex;flex-direction:column;gap:10px;border:0;padding:18px 14px;background:#edf0e6;border-radius:3px 18px 3px 18px;min-width:0}
.tr-e1 .e1-collection-keepsake .e1-keepsake-collection>div:nth-child(even){background:#f2e9e9;border-radius:18px 3px 18px 3px}
.tr-e1 .e1-collection-keepsake .e1-keepsake-collection>div:only-child{grid-column:1/-1}
.tr-e1 .e1-collection-keepsake .e1-keepsake-collection p{font-size:25px;line-height:1.12}
.tr-e1 .e1-surprise-keepsake .e1-keepsake-collection>div{position:relative;background:#f1e8f0;box-shadow:0 4px 15px #55354d08;border:1px solid #c8b7c640}
.tr-e1 .e1-surprise-keepsake .e1-keepsake-collection>div:nth-child(even){background:#f6ece4}
.tr-e1.e1-complete{background:radial-gradient(ellipse at 80% 15%,#e5e9dd 0%,transparent 55%),#f4f3ea}
.tr-e1.e1-complete .e1-content{justify-content:flex-start;padding-top:18px}
.tr-e1 .e1-complete-mark{margin-top:auto;margin-bottom:22px}
.tr-e1 .e1-complete-mark .e1-petal{width:52px;height:52px;color:#718063}
.tr-e1.e1-complete h1{font-size:clamp(38px,11cqi,48px);max-width:13ch}
.tr-e1.e1-complete .e1-copy{margin-top:16px}
.tr-e1 .e1-complete-card{display:flex;align-items:center;gap:18px;padding:16px;background:#fffdf6;border-radius:4px 22px 4px 22px;border:1px solid #b0b99f40;margin-top:30px;margin-bottom:auto}
.tr-e1 .e1-complete-photo{flex-shrink:0;width:76px;height:96px;overflow:hidden;border-radius:3px}
.tr-e1 .e1-complete-card small{display:block;font-size:14px;line-height:1.4;color:#654858}
.tr-e1 .e1-complete-card h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;line-height:1.1;font-weight:500;margin:9px 0 0;color:#30212c}
.tr-e1 .e1-reopen{display:block;width:100%;border:0;background:transparent;min-height:46px;margin-top:8px;font-size:15px;color:#55354d}
/* Keep content available at large text sizes and on short screens; only the middle scrolls. */
@media(max-width:360px){.tr-e1 .e1-content{padding:20px 22px}.tr-e1 .e1-top{padding-left:18px;padding-right:64px;gap:4px}.tr-e1 .e1-top>span{font-size:14px}.tr-e1 .e1-footer{padding:10px 20px 14px}.tr-e1 h1{font-size:36px}.tr-e1 h1.e1-focus-title{font-size:29px}.tr-e1 .e1-paper{padding-left:20px;padding-right:20px}.tr-e1 .e1-ingredients{gap:6px}}
@media(max-height:700px){.tr-e1 .e1-content{padding-top:18px;padding-bottom:16px}.tr-e1.e1-reading .e1-content{padding-top:24px}.tr-e1 .e1-deck{margin-top:18px}.tr-e1.e1-hero .e1-content{padding-top:60px}.tr-e1.e1-hero h1{font-size:49px}.tr-e1 .e1-footer{padding-top:10px;padding-bottom:12px}.tr-e1 .e1-paper{min-height:156px}.tr-e1.e1-focus .e1-paper{min-height:156px}}
/* Hands-on workshops: one living creation instead of a sequence of ingredient questions. */
.tr-e1.e1-create h1{font-size:38px;line-height:1.03}
.tr-e1.e1-create .e1-eyebrow{margin-bottom:12px}
.tr-e1 .e1-scene-canvas{overflow:hidden;border:1px solid #cdbbb94d;border-radius:5px 26px 5px 26px;background:#fffdf5;box-shadow:0 14px 32px #6f4a3b0f;margin:20px 0 0}
.tr-e1 .e1-canvas-cover{height:144px;position:relative;isolation:isolate;overflow:hidden;background:#553d50}
.tr-e1 .e1-canvas-cover>img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover}
.tr-e1 .e1-canvas-cover:after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(100deg,#211622df,#2116227a)}
.tr-e1 .e1-canvas-cover>button{display:flex;flex-direction:column;justify-content:center;gap:8px;position:relative;background:transparent;border:0;color:#fffaf4;width:100%;height:100%;padding:20px 26px;text-align:left}
.tr-e1 .e1-canvas-cover :is(small,strong,span){color:#fffaf4}
.tr-e1 .e1-canvas-cover small{font-size:14px;line-height:1.4}
.tr-e1 .e1-canvas-cover strong{font-family:'Cormorant Garamond',Georgia,serif;font-size:38px;line-height:1.05;font-weight:500;max-width:12ch}
.tr-e1 .e1-canvas-cover button>span{position:absolute;right:22px;bottom:20px;font-size:24px}
.tr-e1 .e1-canvas-ingredients>button{display:grid;grid-template-columns:1fr 26px;gap:4px 16px;width:100%;text-align:left;min-height:64px;padding:12px 22px;background:transparent;border:0;border-top:1px solid #ded0cc;color:#30212c}
.tr-e1 .e1-canvas-ingredients small{font-size:14px;line-height:1.4;color:#654858}
.tr-e1 .e1-canvas-ingredients span{font-size:16px;line-height:1.45;grid-column:1}
.tr-e1 .e1-canvas-ingredients b{font-size:22px;font-weight:400;grid-column:2;grid-row:1/3;align-self:center;color:#654858}
.tr-e1 .e1-workshop-tools{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-top:12px}
.tr-e1 .e1-workshop-tools details{max-width:56%;min-width:0;text-align:right}
.tr-e1 .e1-workshop-tools summary{padding:10px 0;font-size:14px;color:#654858}
.tr-e1 .e1-workshop-tools input{margin-top:6px;text-align:left}
.tr-e1 .e1-sheet-layer{position:absolute;inset:0;z-index:12;display:flex;align-items:flex-end}
.tr-e1 .e1-sheet-shade{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:0;background:#21162266;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.tr-e1 .e1-sheet-shade:active{transform:none}
.tr-e1 .e1-picker-sheet{position:relative;z-index:1;background:#fff9f1;border-radius:28px 28px 0 0;width:100%;max-height:88%;min-height:0;display:flex;flex-direction:column;box-shadow:0 -10px 32px #30212c15;animation:e1-reading-reveal .25s ease both}
.tr-e1 .e1-picker-sheet>header{padding:18px 24px 10px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-shrink:0}
.tr-e1 .e1-picker-sheet h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.1;font-weight:500;margin:0}
.tr-e1 .e1-picker-sheet>header>button{min-width:72px;padding:10px 16px;border:0;border-radius:14px;background:#55354d;color:#fff;font-size:15px}
.tr-e1 .e1-sheet-body{padding:0 26px 22px;overflow-y:auto;min-height:0;overscroll-behavior:contain;scrollbar-width:thin}
.tr-e1 .e1-picker-sheet .e1-deck{margin-top:14px}
.tr-e1 .e1-picker-sheet .e1-paper{min-height:142px;padding-top:56px;padding-bottom:22px}
.tr-e1 .e1-picker-sheet .e1-paper h2{font-size:32px}
.tr-e1 .e1-creation-name{display:block;margin:20px 0 22px}
.tr-e1 .e1-creation-name>span{display:block;font-size:14px;color:#654858;margin-bottom:8px}
.tr-e1 .e1-creation-name input{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.2;padding:11px 0;border:0;border-bottom:1px solid #aab49f;border-radius:0;background:transparent;color:#30212c}
.tr-e1 .e1-interest-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 12px}
.tr-e1 .e1-interest-tile{position:relative;min-width:0;background:#fffdf6;border:1px solid #aab49f40;border-radius:3px 22px 3px 22px;overflow:hidden}
.tr-e1 .e1-interest-tile:nth-child(even){background:#f3e8e9;border-radius:22px 3px 22px 3px}
.tr-e1 .e1-interest-tile:only-child{grid-column:1/-1}
.tr-e1 .e1-interest-open{display:block;width:100%;height:100%;text-align:left;background:transparent;border:0;padding:34px 16px 20px;min-height:148px}
.tr-e1 .e1-interest-open>span{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;line-height:1.08;padding-right:8px}
.tr-e1 .e1-interest-open small{display:block;font-size:14px;line-height:1.4;color:#654858;margin-top:17px}
.tr-e1 .e1-interest-photo{height:100px;overflow:hidden;border-radius:8px;margin-bottom:14px}
.tr-e1 .e1-interest-photo img{width:100%;height:100%;object-fit:cover}
.tr-e1 .e1-interest-remove{position:absolute;right:4px;top:2px;width:40px;min-height:40px;background:transparent;border:0;border-radius:50%;color:#654858;font-size:22px}
.tr-e1 .e1-interest-workbench>h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:33px;font-weight:500;line-height:1.1;margin:18px 0 0}
.tr-e1 .e1-interest-intro{font-size:16px;line-height:1.65;white-space:pre-line;color:#49323f;margin:16px 0 0}
.tr-e1 .e1-interest-workbench .e1-workshop-tools{align-items:center;gap:8px}
.tr-e1 .e1-interest-workbench .e1-workshop-tools>button{font-size:14px;max-width:52%}
.tr-e1 .e1-mood-card{background:#fffdf5;border:1px solid #bdc6b24d;box-shadow:0 12px 26px #455a3d0c;border-radius:4px 20px 4px 20px;overflow:hidden;margin:22px 0 0}
.tr-e1 .e1-mood-photo{height:130px;overflow:hidden}
.tr-e1 .e1-mood-photo img{width:100%;height:100%;object-fit:cover}
.tr-e1 .e1-mood-words{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px;padding:32px 22px;min-height:125px}
.tr-e1 .e1-mood-words>span{font-family:'Cormorant Garamond',Georgia,serif;font-size:31px;line-height:1.1;text-align:center}
.tr-e1 .e1-mood-words>span:nth-child(even){font-style:italic}
.tr-e1 .e1-mood-colors{display:flex;height:36px}
.tr-e1 .e1-mood-colors>span{flex:1;min-width:0}
.tr-e1 .e1-board-editor{margin-top:24px}
.tr-e1 .e1-board-editor>label{display:block;font-size:14px;line-height:1.5;color:#654858;margin-bottom:8px}
.tr-e1 .e1-inline-form{display:flex;gap:8px}
.tr-e1 .e1-inline-form>button,.tr-e1 .e1-color-label>button{font-size:15px;background:#55354d;color:#fff;border:0;border-radius:13px;padding:10px 15px}
.tr-e1 .e1-word-chips,.tr-e1 .e1-color-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.tr-e1 .e1-word-chips button,.tr-e1 .e1-color-chips button{display:flex;align-items:center;gap:10px;background:#fffdf5;color:#30212c;border:1px solid #bdc6b2;border-radius:13px;padding:9px 12px;font-size:14px;line-height:1.4}
.tr-e1 .e1-word-chips span{color:#654858}
.tr-e1 .e1-color-label{display:flex!important;gap:10px;align-items:center;flex-wrap:wrap;margin-top:20px}
.tr-e1 .e1-color-label input[type=color]{width:46px;height:46px;padding:4px;flex-shrink:0;border-radius:12px}
.tr-e1 .e1-color-chips button>span:first-child{width:20px;height:20px;border-radius:50%;border:1px solid #65485840}
.tr-e1 .e1-resource{display:inline-flex;align-items:center;min-height:46px;font-size:15px;color:#55354d;margin-top:18px}
.tr-e1 .e1-interest-result{margin-top:24px}
.tr-e1 .e1-interest-result>p{padding-top:18px;border-top:1px solid #ddd5c9}
.tr-e1 .e1-interest-result strong{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.15;margin-top:8px}
.tr-e1 .e1-interest-result>div{margin-top:20px}
.tr-e1 .e1-interest-result .e1-mood-card{margin-top:12px;box-shadow:none}
.tr-e1 .e1-drawn-card{background:linear-gradient(145deg,#fffdf5,#eee2ee);border:1px solid #c8b7c666;border-radius:5px 28px 5px 28px;padding:28px 25px;margin:24px 0 0;box-shadow:0 14px 28px #55354d0e;animation:e1-keepsake-reveal .5s ease both}
.tr-e1 .e1-drawn-card>.e1-petal{width:38px;height:38px;margin-bottom:24px}
.tr-e1 .e1-drawn-card>small{display:block;font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .e1-drawn-card h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:35px;font-weight:500;line-height:1.1;margin:18px 0 0}
.tr-e1 .e1-drawn-card p{font-size:16px;line-height:1.6;white-space:pre-line;margin:18px 0 0;color:#49323f}
.tr-e1 .e1-draw-actions{display:flex;gap:10px;margin-top:18px}
.tr-e1 .e1-soft-action{border:1px solid #b8a1b1;border-radius:14px;background:#fff9f5;color:#49323f;min-height:48px;padding:12px 16px;font-size:15px;line-height:1.4}
.tr-e1 .e1-draw-actions>.e1-soft-action{flex:1}
.tr-e1 .e1-surprise-editor{margin-top:12px}
.tr-e1 .e1-surprise-editor>label{display:block;font-size:14px;line-height:1.5;color:#654858;margin-top:22px}
.tr-e1 .e1-surprise-editor :is(input,textarea){margin-top:8px}
.tr-e1 .e1-surprise-editor textarea{min-height:165px}
.tr-e1 .e1-surprise-editor>.e1-soft-action{margin-top:18px;width:100%}
.tr-e1 .e1-draw-result{padding:20px;background:#f2e8f0;border-radius:4px 18px 4px 18px;margin-top:22px}
.tr-e1 .e1-draw-result>h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;font-weight:500;line-height:1.15;margin:12px 0 0}
.tr-e1 .e1-draw-result>p{font-size:16px;line-height:1.6;margin:14px 0 0}
@media(max-width:360px){.tr-e1.e1-create h1{font-size:34px}.tr-e1 .e1-canvas-cover{height:132px}.tr-e1 .e1-canvas-ingredients>button{padding:11px 18px}.tr-e1 .e1-sheet-body{padding-left:22px;padding-right:22px}.tr-e1 .e1-interest-open{padding-left:14px;padding-right:14px}.tr-e1 .e1-interest-open>span{font-size:26px}}

.tr-e1 .e2-focus-context{border-left:2px solid #9a788f;padding:4px 0 4px 14px;font-size:16px;line-height:1.5;color:#55354d;margin:20px 0 0}
.tr-e1 .e2-sort-tools{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.tr-e1 .e2-sort-tools button[aria-pressed=true]{color:#55354d;text-decoration:underline;text-underline-offset:5px}
.tr-e1 .e2-card-edit{display:block;font-size:14px;color:#654858;margin:8px 0 12px}
.tr-e1 .e2-card-edit input{margin-top:8px}
.tr-e1 .e2-sorted{margin:24px 0 0}
.tr-e1 .e2-sorted>section{margin-bottom:26px}
.tr-e1 .e2-sorted h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.1;font-weight:500;margin:0 0 10px;display:flex;align-items:center;gap:12px}
.tr-e1 .e2-sorted h2 small{font-family:'Nunito Sans',sans-serif;font-size:14px;color:#654858}
.tr-e1 .e2-sorted-row{display:flex;gap:8px;border-top:1px solid #d8c7d2}
.tr-e1 .e2-sorted-row>button:first-child{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.2;background:transparent;border:0;padding:18px 0;text-align:left;flex:1;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#30212c}
.tr-e1 .e2-sorted-row>button:first-child span{font-family:'Nunito Sans',sans-serif;font-size:18px;color:#654858}
.tr-e1 .e2-sorted-row>button+button{font-size:14px;line-height:1.4;border:0;background:transparent;color:#654858}
.tr-e1 .e2-mood-workshop{margin:24px 0 0}
.tr-e1 .e2-mood-canvas{height:252px;position:relative;isolation:isolate;overflow:hidden;border-radius:4px 25px 4px 25px;box-shadow:0 12px 26px #4931430d}
.tr-e1 .e2-board-photo{position:absolute;inset:0;z-index:-1;width:100%;height:100%;object-fit:cover}
.tr-e1 .e2-board-empty{display:flex;align-items:center;justify-content:center;height:100%;font-size:40px;color:#55354d;background:#fff9f4cc}
.tr-e1 .e2-word-layer{position:absolute;background:#fffaf4;color:#30212c;border:0;border-radius:3px 14px 3px 14px;font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.15;min-height:52px;max-height:25%;overflow:auto;padding:12px 8px;max-width:100%;touch-action:none;box-shadow:0 4px 12px #30212c12;user-select:none;-webkit-user-select:none}
.tr-e1 .e2-word-layer[aria-pressed=true]{box-shadow:inset 0 0 0 2px #88607c,0 4px 12px #30212c12}
.tr-e1 .e2-word-layer:disabled{opacity:1}
.tr-e1 .e2-word-layer img{height:65px!important;display:block}
.tr-e1 .e2-layer-tools{display:flex;gap:6px;justify-content:center;margin-top:10px}
.tr-e1 .e2-layer-tools button{flex:1;border:1px solid #c9b6c4;background:#fffaf4;color:#49323f;border-radius:12px;font-size:20px;line-height:1}
.tr-e1 .e2-word-bank{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0 18px}
.tr-e1 .e2-word-bank button{background:#fffaf4;color:#49323f;border:1px solid #baa2b3;border-radius:14px;font-size:15px;padding:10px 14px;line-height:1.4}
.tr-e1 .e2-word-bank button[aria-pressed=true]{background:#55354d;color:#fff;border-color:#55354d}
.tr-e1 .e2-board-color{display:flex;align-items:center;justify-content:space-between;font-size:14px;color:#654858;margin-top:16px;gap:16px}
.tr-e1 .e2-board-color input{width:50px;height:46px;padding:4px;border-radius:12px}
.tr-e1 .e2-writing-canvas{margin-top:24px;border-radius:4px 24px 4px 24px;background:#fffdf5;box-shadow:0 10px 28px #4931430a;border:1px solid #d8c7d2;padding:22px}
.tr-e1 .e2-canvas-title{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #d8c7d2;padding-bottom:18px}
.tr-e1 .e2-canvas-title small{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.15;font-style:italic}
.tr-e1 .e2-canvas-title .e1-petal{width:30px;height:30px;flex-shrink:0}
.tr-e1 .e2-writing-canvas>label{display:block;font-size:14px;line-height:1.5;margin-top:20px;color:#654858}
.tr-e1 .e2-writing-canvas textarea{margin-top:8px;background:transparent;border:0;border-bottom:1px solid #d8c7d2;border-radius:0;padding:8px 0;min-height:56px;resize:vertical}
.tr-e1 .e2-writing-canvas>label>p{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.25;margin:8px 0;white-space:pre-wrap}
.tr-e1 .e2-result{margin:24px 0 0}
.tr-e1 .e2-result>section{border-top:1px solid #d8c7d2;padding-top:22px;margin-bottom:26px}
.tr-e1 .e2-result h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;line-height:1.15;font-weight:500;margin:0 0 14px}
.tr-e1 .e2-result section>p{font-size:16px;line-height:1.65;margin:10px 0;color:#49323f;white-space:pre-wrap}
.tr-e1 .e2-result .e2-mood-workshop{margin-top:0}
.tr-e1[aria-label="Experience 2"].e1-reading h1{max-width:13ch;font-size:44px}
.tr-e1[aria-label="Experience 2"].e1-reading .e1-copy{font-size:17px;line-height:1.65;max-width:none;padding-left:16px;margin-top:24px}
.tr-e1[aria-label="Experience 2"].e1-create h1{font-size:38px}
@media(max-width:360px){.tr-e1 .e2-word-layer{font-size:22px}.tr-e1 .e2-sorted-row>button:first-child{font-size:23px}.tr-e1[aria-label="Experience 2"].e1-reading h1{font-size:39px}}

/* A small editorial discovery studio, using published ideas and personal creations. */
.tr-e1.e1-evening{background:#f7f0e7}
.tr-e1.e1-evening h1{font-size:38px;line-height:1.04;max-width:15ch}
.tr-e1.e1-evening .e1-content{padding:20px 24px 22px}
.tr-e1 .night-categories{display:flex;gap:5px;padding:5px;background:#e8dfdb;border-radius:15px;margin:22px 0 20px}
.tr-e1 .night-categories button{flex:1;min-width:0;font-size:14px;line-height:1.25;color:#654858;border:0;background:transparent;padding:10px 5px;border-radius:11px;transition:background .2s,box-shadow .2s}
.tr-e1 .night-categories button[aria-pressed=true]{background:#fffaf4;color:#30212c;box-shadow:0 2px 7px #49323f12}
.tr-e1 .night-deck{margin:0 0 4px;position:relative}
.tr-e1 .night-deck:before,.tr-e1 .night-deck:after{display:none}
.tr-e1 .night-discovery{background:#fffdf8;border:1px solid #7c5c4820;border-radius:5px 25px 5px 25px;overflow:hidden;position:relative;box-shadow:0 12px 26px #49323f0c;animation:e1-card-in .32s cubic-bezier(.22,1,.36,1) both}
.tr-e1 .e1-direction--1 .night-discovery{animation-name:e1-card-in-back}
.tr-e1 .night-photo{height:174px;overflow:hidden;background:#d7c7ba}
.tr-e1 .night-photo img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
.tr-e1 .night-card-copy{padding:19px 22px 20px}
.tr-e1 .night-card-copy>small{font-size:11px;line-height:1.4;letter-spacing:1px;color:#654858;display:block;padding-right:22px}
.tr-e1 .night-card-copy h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:31px;line-height:1.07;font-weight:500;margin:10px 0 0;letter-spacing:-.2px;max-width:15ch}
.tr-e1 .night-card-copy p{font-size:15px;line-height:1.45;color:#654858;margin:10px 0 0}
.tr-e1 .night-card-keep{position:absolute;right:12px;top:12px;z-index:5;width:46px;border:1px solid #fff9f455;border-radius:50%;background:#fffaf4f5;color:#49323f;font-size:25px;line-height:1;box-shadow:0 2px 8px #30212c12}
.tr-e1 .night-card-keep[aria-pressed=true]{background:#49323f;color:#fffaf4;border-color:#49323f}
.tr-e1 .night-open-label{display:flex;align-items:center;justify-content:space-between;font-size:14px;color:#55354d;margin-top:20px}
.tr-e1 .night-open-label b{font-weight:400;font-size:21px;line-height:1}
.tr-e1 .night-browse{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}
.tr-e1 .night-browse button{width:46px;border:0;border-radius:50%;background:transparent;color:#654858;font-size:26px}
.tr-e1 .night-browse span{font-size:14px;line-height:1.4;color:#654858}
.tr-e1 .night-detail,.tr-e1 .night-workbench,.tr-e1 .night-kept{margin-top:24px;animation:e1-reading-reveal .3s ease both}
.tr-e1 .night-detail>.night-photo{height:210px;border-radius:5px 24px 5px 24px}
.tr-e1 .night-personal-invitation{margin:16px 0 8px;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:16px;align-items:center}
.tr-e1 .night-personal-invitation>small{font-size:11px;letter-spacing:1.2px;line-height:1.5;color:#654858}
.tr-e1 .night-personal-invitation>p{font-size:16px;line-height:1.5;color:#49323f;margin:5px 0 0;grid-column:1}
.tr-e1 .night-personal-invitation .e1-text-button{margin:0;grid-column:2;grid-row:1 / span 2;max-width:90px}
.tr-e1 .night-start-designing{margin:24px 0 12px}
.tr-e1 .night-description{font-size:17px;line-height:1.65;color:#49323f;margin:24px 0 26px}
.tr-e1 .night-learning{position:relative;border-top:1px solid #d5c7be;padding:21px 0 0;margin:24px 0}
.tr-e1 .night-learning>small{font-size:12px;color:#765a6d;display:block;margin-bottom:12px}
.tr-e1 .night-learning h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;line-height:1.12;font-weight:500;margin:0}
.tr-e1 .night-learning p{font-size:16px;line-height:1.65;color:#49323f;margin:14px 0 0}
.tr-e1 .night-resource{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:48px;font-size:15px;line-height:1.45;color:#55354d;text-decoration:none;border-bottom:1px solid #bda4b5;margin-top:22px;padding-bottom:8px}
.tr-e1 .night-link-note{font-size:13px;line-height:1.55;color:#654858;margin:12px 0 8px}
.tr-e1 .night-art{background:var(--night-base);color:var(--night-ink,#30212c);overflow:hidden;position:relative;border-radius:4px 23px 4px 23px;isolation:isolate}
.tr-e1 .night-art :is(strong,small,p,i,em,span){color:var(--night-ink,#30212c)}
.tr-e1 .night-discovery .night-art{height:174px;border-radius:0}
.tr-e1 .night-discovery .night-art>div{transform:scale(.66);transform-origin:top left;width:151.5%;min-height:264px}
.tr-e1 .night-menu{padding:28px 26px 30px;text-align:center;border:9px double #fff9f48c;min-height:300px}
.tr-e1 .night-menu>small{display:block;font-size:10px;line-height:1.4;letter-spacing:2px}
.tr-e1 .night-menu strong{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:43px;line-height:1;letter-spacing:-.5px;font-weight:500;margin:18px auto 10px;max-width:13ch}
.tr-e1 .night-menu>i{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;line-height:1.1}
.tr-e1 .night-menu hr{border:0;border-top:1px solid currentColor;opacity:.3;width:52%;margin:22px auto}
.tr-e1 .night-menu p{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.15;margin:12px auto;max-width:20ch}
.tr-e1 .night-menu>em{display:block;font-family:'Nunito Sans',sans-serif;font-size:13px;line-height:1.6;font-style:normal;max-width:28ch;margin:0 auto}
.tr-e1 .night-book{padding:25px 26px 24px;min-height:350px;border-left:10px solid #30212c19;display:flex;flex-direction:column;text-align:center;align-items:center}
.tr-e1 .night-book>small{font-size:10px;line-height:1.5;letter-spacing:1.3px}
.tr-e1 .night-book>strong{font-family:'Cormorant Garamond',Georgia,serif;font-size:44px;line-height:.98;font-weight:500;max-width:12ch;margin:30px auto 0}
.tr-e1 .night-book>i{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;line-height:1.2;max-width:21ch}
.tr-e1 .night-book>span{font-size:12px;line-height:1.5;margin-top:24px}
.tr-e1 .night-book-motif{display:flex;justify-content:center;align-items:center;gap:5px;height:78px;margin:12px 0}
.tr-e1 .night-book-motif>i{display:block;width:20px;height:51px;background:var(--night-detail);border-radius:90% 0 90% 0;transform:rotate(-28deg)}
.tr-e1 .night-book-motif>i:nth-child(2){transform:rotate(0deg);height:58px}
.tr-e1 .night-book-motif>i:last-child{transform:rotate(28deg)}
.tr-e1 .night-postcard{padding:30px 25px;min-height:320px;background:repeating-linear-gradient(0deg,transparent,transparent 30px,#49323f09 30px,#49323f09 31px)}
.tr-e1 .night-postcard>small{font-size:11px;line-height:1.4;letter-spacing:1.4px;max-width:70%;display:block}
.tr-e1 .night-postcard strong{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:33px;line-height:1.08;font-weight:500;margin:25px 0 20px;max-width:12ch}
.tr-e1 .night-postcard p{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;line-height:1.5;white-space:pre-wrap;margin:0 0 22px}
.tr-e1 .night-postcard>i{font-size:14px;line-height:1.5}
.tr-e1 .night-stamp{position:absolute;right:23px;top:24px;border:3px dotted currentColor;width:40px;height:48px;display:grid;place-items:center;font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;opacity:.65}
.tr-e1 .night-remix-tools{display:flex;align-items:center;justify-content:space-between;gap:15px}
.tr-e1 .night-palettes{display:flex;gap:10px;margin:20px 0}
.tr-e1 .night-palettes>button{border:1px solid transparent;background:transparent;padding:6px 4px;color:#49323f;flex:1;min-width:0;border-radius:12px;display:flex;flex-direction:column;gap:9px;align-items:center}
.tr-e1 .night-palettes>button[aria-pressed=true]{border-color:#a9899d;background:#fffaf4}
.tr-e1 .night-palettes>button>span{display:flex;overflow:hidden;border-radius:9px;width:100%;height:28px;border:1px solid #49323f20}
.tr-e1 .night-palettes i{display:block;flex:1}
.tr-e1 .night-palettes small{font-size:12px;line-height:1.4;color:#49323f;text-align:center}
.tr-e1 .night-editors>details{border-bottom:1px solid #d7c6cd;padding:15px 0}
.tr-e1 .night-editors summary{list-style:none;cursor:pointer;min-height:48px}
.tr-e1 .night-editors summary::-webkit-details-marker{display:none}
.tr-e1 .night-editors summary>small{font-size:13px;line-height:1.5;color:#654858}
.tr-e1 .night-editors summary>span{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.2;display:flex;justify-content:space-between;gap:16px;margin-top:7px}
.tr-e1 .night-editors summary b{font-family:'Nunito Sans',sans-serif;font-size:18px;font-weight:400;color:#765a6d;flex-shrink:0}
.tr-e1 .night-editors :is(input,textarea){margin-top:16px}
.tr-e1 .night-suggestions{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 6px}
.tr-e1 .night-suggestions button{min-height:44px;border:1px solid #cab3c1;background:#fffaf4;color:#49323f;border-radius:12px;font-size:14px;line-height:1.4;text-align:left;padding:9px 12px}
.tr-e1 .night-suggestions button[aria-pressed=true]{border-color:#55354d;background:#eee0e8}
.tr-e1 .night-kept-card{overflow:hidden;border:1px solid #7c5c4820;background:#fffdf8;border-radius:4px 24px 4px 24px;margin-bottom:22px}
.tr-e1 .night-kept-photo{height:150px;overflow:hidden}
.tr-e1 .night-kept-card>div:last-child{padding:20px 22px 10px}
.tr-e1 .night-kept-card small{font-size:11px;letter-spacing:1px;line-height:1.5;color:#654858}
.tr-e1 .night-kept-card h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;line-height:1.1;font-weight:500;margin:10px 0 0}
.tr-e1 .night-kept-actions{display:flex;justify-content:space-between;gap:16px;margin-top:8px}
.tr-e1 .night-kept-card>.night-art{border-radius:0;max-height:235px}
.tr-e1 .night-kept-card>.night-art>div{transform:scale(.8);transform-origin:top left;width:125%;min-height:294px}
.tr-e1 .night-result-card{overflow:hidden;border-radius:4px 20px 4px 20px;background:#fffaf4;border:1px solid #d5c7be;margin-top:22px}
.tr-e1 .night-result-card>.night-art{border-radius:0}
.tr-e1 .night-result-card .night-photo{height:148px}
.tr-e1 .night-result-copy{padding:20px}
.tr-e1 .night-result-copy>small{font-size:12px;color:#654858}
.tr-e1 .night-result-copy h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.1;font-weight:500;margin:12px 0}
.tr-e1 .night-result-copy p{font-size:15px;line-height:1.6;color:#49323f;margin:12px 0 0}
.tr-e1 .night-blueprint{min-height:320px;padding:20px 24px;background:#193f73;position:relative;color:#fff9eb}
.tr-e1 .night-blueprint :is(strong,small){color:#fff9eb}
.tr-e1 .night-blueprint>strong{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.15;font-weight:500;max-width:19ch;margin-top:8px}
.tr-e1 .night-blueprint>small{font-size:10px;letter-spacing:1.6px;line-height:1.5;display:block;margin-top:12px}
.tr-e1 .night-botanical{height:195px;position:relative;overflow:hidden}
.tr-e1 .night-fern{position:absolute;width:130px;height:170px;left:20px;top:12px;transform:rotate(-20deg);border-left:2px solid #fff9ebe6}
.tr-e1 .night-fern i{position:absolute;top:calc(var(--leaf)*15px);left:0;width:calc(24px + var(--leaf)*4px);height:13px;background:#fff9ebed;border-radius:0 100% 0 100%;transform-origin:left;transform:rotate(-28deg)}
.tr-e1 .night-fern i:after{content:'';position:absolute;inset:0;background:inherit;border-radius:100% 0 100% 0;transform:rotate(160deg);transform-origin:left}
.tr-e1 .night-moon{position:absolute;right:20px;top:8px;width:55px;height:55px;border-radius:50%;background:#fff9ebdf}
.tr-e1 .night-sprig{position:absolute;right:52px;bottom:0;width:2px;height:115px;background:#fff9ebdc;transform:rotate(20deg)}
.tr-e1 .night-sprig i{position:absolute;top:calc(var(--leaf)*20px);width:35px;height:18px;border-radius:0 100% 0 100%;background:#fff9ebdc;left:0;transform:rotate(-28deg)}
.tr-e1 .night-sprig i:nth-child(even){left:auto;right:0;transform:rotate(28deg);border-radius:100% 0 100% 0}
.tr-e1 .night-elements{display:flex;gap:8px;margin:20px 0}
.tr-e1 .night-elements button{flex:1;border:1px solid #b9a4b4;border-radius:13px;background:#fffaf4;color:#49323f;padding:10px;font-size:14px;line-height:1.4}
.tr-e1 .night-elements button[aria-pressed=true]{background:#55354d;border-color:#55354d;color:#fff}
.tr-e1 .night-room{min-height:310px;overflow:hidden}
.tr-e1 .night-room-picture{position:relative;height:220px;background:var(--night-base);border-bottom:9px solid var(--night-detail);box-shadow:inset 18px 0 0 #49323f08,inset -18px 0 0 #49323f08}
.tr-e1 .night-window{position:absolute;left:calc(50% - 39px);top:20px;width:78px;height:114px;border:6px solid var(--night-tone);border-radius:42px 42px 0 0;background:#fff9ebcf;overflow:hidden}
.tr-e1 .night-window:before,.tr-e1 .night-window:after{content:'';position:absolute;background:var(--night-tone)}
.tr-e1 .night-window:before{height:100%;width:3px;left:50%;top:0}.tr-e1 .night-window:after{height:3px;width:100%;top:54%;left:0}
.tr-e1 .night-seat{position:absolute;left:30px;bottom:15px;width:92px;height:52px;border-radius:20px 20px 7px 7px;background:var(--night-detail);box-shadow:inset 0 -16px 0 #49323f12}
.tr-e1 .night-seat:after{content:'';position:absolute;left:10px;right:10px;bottom:-12px;height:12px;border-left:4px solid var(--night-tone);border-right:4px solid var(--night-tone)}
.tr-e1 .night-table{position:absolute;right:33px;bottom:8px;width:67px;height:50px;border-top:8px solid var(--night-tone);border-left:5px solid var(--night-tone);border-right:5px solid var(--night-tone);border-radius:4px 4px 0 0}
.tr-e1 .night-vase{position:absolute;right:57px;bottom:62px;width:20px;height:26px;border-radius:2px 2px 9px 9px;background:var(--night-detail)}
.tr-e1 .night-vase i{position:absolute;bottom:23px;left:9px;width:2px;height:36px;background:var(--night-tone);transform:rotate(-20deg)}
.tr-e1 .night-vase i:nth-child(2){transform:rotate(10deg);height:42px}.tr-e1 .night-vase i:nth-child(3){transform:rotate(35deg);height:32px}
.tr-e1 .night-vase i:after{content:'';position:absolute;top:0;left:-5px;width:13px;height:13px;border-radius:50%;background:var(--night-detail)}
.tr-e1 .night-room-label{padding:20px 24px 25px;border-top:1px solid #49323f12}
.tr-e1 .night-room-label strong{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.1;font-weight:500;display:block}
.tr-e1 .night-room-label i{font-size:14px;line-height:1.5;font-style:normal;display:block;margin-top:10px}
.tr-e1 .night-garden .night-room-picture{background:linear-gradient(0deg,var(--night-detail) 18%,var(--night-base) 18%);border-bottom-color:var(--night-tone)}
.tr-e1 .night-garden .night-window{left:35px;top:24px;height:165px;width:82px;border-radius:45px 45px 0 0;border-width:7px;background:var(--night-tone);box-shadow:0 0 0 12px #fff9eb29}
.tr-e1 .night-garden .night-window:before{width:6px;height:6px;border-radius:50%;left:75%;top:65%;background:var(--night-base)}
.tr-e1 .night-garden .night-window:after{display:none}
.tr-e1 .night-garden .night-seat{left:auto;right:24px;bottom:25px;width:85px;height:16px;border-radius:4px;background:var(--night-tone);box-shadow:none}
.tr-e1 .night-garden .night-table{right:46px;bottom:58px;width:30px;height:38px;border:0;border-radius:0 0 15px 15px;background:var(--night-detail)}
.tr-e1 .night-garden .night-vase{right:55px;bottom:96px;background:transparent}
@media(max-width:360px){.tr-e1.e1-evening .e1-content{padding-left:20px;padding-right:20px}.tr-e1.e1-evening h1{font-size:34px}.tr-e1 .night-card-copy{padding:18px}.tr-e1 .night-card-copy h2{font-size:29px}.tr-e1 .night-remix-tools{display:flex;align-items:center;justify-content:space-between;gap:15px}
.tr-e1 .night-palettes{gap:5px}.tr-e1 .night-categories button{font-size:13px}}

.tr-e1 .studio-botanical{margin-top:6px}
.tr-e1 .studio-botanical-intro{font-size:16px;line-height:1.6;color:#49323f;margin:0 0 14px}
.tr-e1 .studio-botanical .studio-canvas-blueprint{height:250px}
.tr-e1 .studio-print-state{font-size:12px;line-height:1.4;color:#654858;margin-left:auto;text-align:right;max-width:35%}
.tr-e1 .studio-botanical .studio-history{flex-wrap:wrap;gap:4px}
.tr-e1 .studio-botanical .studio-history .studio-preview-button{margin-left:0;max-width:none}
.tr-e1 .studio-botanical .studio-piece-tray{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;margin:12px 0;padding:0;gap:7px}
.tr-e1 .studio-botanical .studio-piece-tray>button{padding:10px 5px;min-width:0}
.tr-e1 .studio-botanical .studio-piece-tray>button>span{width:30px;height:33px;margin-bottom:7px}
.tr-e1 .studio-botanical .studio-art-caption>.studio-text{font-size:24px;line-height:1.15}
.tr-e1 .studio-print-adjustments{padding:12px 0;border-top:1px solid #d6c6cf}
.tr-e1 .studio-print-adjustments .studio-selected-label{display:flex;align-items:center;justify-content:space-between;margin:0}
.tr-e1 .studio-print-colors{border:0;padding:0;margin:20px 0 0;min-width:0}
.tr-e1 .studio-print-colors>legend{font-size:14px;line-height:1.5;color:#654858;margin-bottom:10px}
.tr-e1 .studio-print-colors .night-palettes{margin:0}
.tr-e1 .studio-print-name{display:block;color:#654858;font-size:14px;line-height:1.5;margin:18px 0 0}
.tr-e1 .studio-print-name>input{display:block;width:100%;margin-top:7px;font-size:16px}


.tr-e1 .e2-option-gallery{margin-top:18px}
.tr-e1 .e2-direction-card{position:relative;overflow:hidden;border-radius:5px 28px 5px 28px;background:#f3ede3;box-shadow:0 10px 24px #3e30300c;animation:e2-direction-enter .24s ease-out}
.tr-e1 .e2-direction-hit{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;border-radius:inherit;z-index:3}
.tr-e1 .e2-direction-hit[aria-pressed=true]{box-shadow:inset 0 0 0 3px #52634f}
.tr-e1 .e2-direction-copy{padding:18px 22px 22px;color:#30282e}
.tr-e1 .e2-direction-copy h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.08;margin:0 0 10px;font-weight:500}
.tr-e1 .e2-direction-copy p{font-size:16px;line-height:1.55;margin:0;color:#403740}
.tr-e1 .e2-direction-copy .e2-direction-story{margin-top:10px;font-size:14px;color:#51464c}
.tr-e1 .e2-style-preview{border-radius:0;box-shadow:none;margin:0;aspect-ratio:1.25}
.tr-e1 .e2-style-preview .studio-canvas{height:260px}
.tr-e1 .e2-direction-navigation{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0;color:#51464c;font-size:13px}
.tr-e1 .e2-direction-navigation button{background:#fff9f4;border:1px solid #cfc3c4;border-radius:50%;width:44px;height:44px;font-size:25px;color:#382c38}
.tr-e1 .e2-direction-navigation button:disabled{opacity:.35}
.tr-e1 .e2-company-illustration{height:230px;position:relative;background:#d9e0d5;overflow:hidden;isolation:isolate}
.tr-e1 .e2-tabletop{position:absolute;left:-10%;top:20%;width:120%;height:125%;background:#bb8c68;border-radius:50%;transform:rotate(-12deg)}
.tr-e1 .e2-company-cup{position:absolute;top:27%;left:17%;width:64px;height:64px;border:8px solid #f6efe0;border-radius:50%;background:#76513d;box-shadow:0 5px 0 7px #eadfcf,0 12px 12px #463f3930}
.tr-e1 .e2-company-cup:after{content:'';position:absolute;left:49px;top:15px;width:17px;height:22px;border:6px solid #f6efe0;border-radius:8px;z-index:-1}
.tr-e1 .e2-cup-two{left:auto;right:17%;top:50%;transform:scale(.8)}
.tr-e1 .e2-company-note{position:absolute;top:57%;left:12%;width:49%;padding:15px;background:#fff8e9;color:#3e3438;font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;line-height:1.15;transform:rotate(-7deg);box-shadow:0 4px 10px #453a3220}
.tr-e1 .e2-kept-intention{font-size:15px;line-height:1.5;color:#403740;margin:12px 0}
.tr-e1 .e2-kept-intention small{display:block;margin-top:5px;font-size:13px;color:#53434e;letter-spacing:0}
.tr-e1 .e2-life-bridge{padding:24px 0 12px;margin-top:20px;border-top:1px solid #d6c9cb;color:#392d36}
.tr-e1 .e2-life-bridge>small{font-size:11px;letter-spacing:1.4px;color:#53434e}
.tr-e1 .e2-life-bridge h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.18;margin:10px 0 16px}
.tr-e1 .e2-life-bridge p{font-size:15px;line-height:1.5;margin:18px 0 8px}
.tr-e1 .e2-more-button{font-size:15px;line-height:1.4;padding:13px 17px;min-height:48px;background:#f0e5e8;border:1px solid #bca7b1;border-radius:20px;color:#392d36}
.tr-e1 .e2-more-button[aria-pressed=true]{background:#485b4a;border-color:#485b4a;color:#fffdf8}
.tr-e1 .e2-life-bridge .e2-bridge-optional{display:block;font-size:12px;letter-spacing:0;margin-top:10px}
.tr-e1 .studio-case-picker{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
.tr-e1 .studio-case-picker button{flex:1;min-width:120px;min-height:46px;padding:10px 14px;border:1px solid #bcaeb7;border-radius:18px;background:#fff9f4;color:#41313d;font-size:14px;line-height:1.35}
.tr-e1 .studio-case-picker button[aria-pressed=true]{background:#485b4a;color:#fffdf8;border-color:#485b4a}
@keyframes e2-direction-enter{from{transform:translateX(8px)}to{transform:translateX(0)}}
@media(prefers-reduced-motion:reduce){.tr-e1 .e2-direction-card{animation:none}}

.tr-e1 .studio-save-actions{position:sticky;top:0;z-index:8;background:#fff9f4;padding:8px 0 4px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.tr-e1 .studio-save-actions>.studio-action{margin:0;flex:1;min-width:140px;width:auto}
.tr-e1 .studio-save-actions>.e1-text-button{font-size:13px;line-height:1.4;padding:10px 8px;flex:1;min-width:120px}
.tr-e1 .studio-canvas-outfit{height:330px;background:radial-gradient(ellipse at 70% 30%,#ffffff60,transparent 70%),var(--studio-base)}
.tr-e1 .studio-canvas-outfit .studio-object{color:var(--studio-tone)}

.tr-e1 .studio-clothing-photo{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;filter:drop-shadow(0 4px 3px #30212c16)}
.tr-e1 .studio-piece-tray .studio-clothing-photo{max-width:none;max-height:none;filter:none}
.tr-e1 .studio-object:has(.studio-clothing-photo){background:transparent}

.tr-e1 .studio-garment{position:absolute;inset:0;background:currentColor;filter:drop-shadow(2px 5px 3px #30212c18)}
.tr-e1 .studio-garment-blouse,.tr-e1 .studio-garment-jacket{clip-path:polygon(30% 0,42% 9%,58% 9%,70% 0,100% 22%,87% 47%,74% 36%,78% 100%,22% 100%,26% 36%,13% 47%,0 22%);border-radius:15%}
.tr-e1 .studio-garment-blouse:after{content:'';position:absolute;top:16%;bottom:5%;left:49%;width:2px;background:#fffaf450}
.tr-e1 .studio-garment-jacket:after{content:'';position:absolute;inset:0;clip-path:polygon(35% 0,50% 42%,65% 0,55% 100%,45% 100%);background:var(--studio-base)}
.tr-e1 .studio-garment-trousers{clip-path:polygon(8% 0,92% 0,100% 100%,57% 100%,50% 32%,43% 100%,0 100%);background:var(--studio-detail)}
.tr-e1 .studio-garment-skirt{clip-path:polygon(25% 0,75% 0,100% 100%,0 100%);background:repeating-linear-gradient(90deg,var(--studio-detail) 0,var(--studio-detail) 12%,var(--studio-tone) 14%,var(--studio-detail) 16%)}
.tr-e1 .studio-garment-dress{clip-path:polygon(30% 0,44% 9%,56% 9%,70% 0,79% 23%,66% 43%,100% 100%,0 100%,34% 43%,21% 23%)}
.tr-e1 .studio-garment-shoe{border-radius:20% 70% 25% 20%;transform:rotate(-12deg);background:var(--studio-detail);box-shadow:inset 0 -5px 0 #30212c25}
.tr-e1 .studio-garment-tote{inset:20% 5% 0;border-radius:8% 8% 20% 20%;background:var(--studio-detail)}
.tr-e1 .studio-garment-tote:before{content:'';position:absolute;left:24%;right:24%;top:-25%;height:40%;border:5px solid var(--studio-detail);border-radius:50%;background:transparent}
.tr-e1 .studio-invitation{padding:30px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px;background:var(--studio-base);color:var(--studio-ink)}
.tr-e1 .studio-invitation>small{font-size:11px;letter-spacing:1.6px;line-height:1.5}
.tr-e1 .studio-invitation .studio-invitation-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;line-height:1.08;text-align:center}
.tr-e1 .studio-invitation-flower{font-size:43px;color:var(--studio-tone);line-height:1}
.tr-e1 .studio-invitation .studio-invitation-plan{font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;line-height:1.2;text-align:center}
.tr-e1 .studio-invitation-message{font-size:16px;line-height:1.65;text-align:center}
.tr-e1 .studio-invitation-by{font-size:14px;font-style:italic;line-height:1.5;text-align:center}
.tr-e1 .studio-case-art{padding:30px 25px;background:#e9e3d8;color:#30212c;text-align:center}
.tr-e1 .studio-case-art>small,.tr-e1 .studio-case-label{font-size:11px;letter-spacing:1.6px;color:#654858;line-height:1.5}
.tr-e1 .studio-case-cup{position:relative;width:110px;height:83px;margin:28px auto;color:#79584b}
.tr-e1 .studio-case-cup>i{position:absolute;left:10px;top:8px;width:72px;height:55px;border:5px solid currentColor;background:#fff9eb;border-radius:4px 4px 28px 28px}
.tr-e1 .studio-case-cup>i:after{content:"";position:absolute;left:63px;top:5px;width:22px;height:26px;border:5px solid currentColor;border-left:0;border-radius:0 20px 20px 0}
.tr-e1 .studio-case-cup>b{position:absolute;left:0;right:7px;bottom:6px;height:8px;border-radius:50%;background:currentColor;opacity:.5}
.tr-e1 .studio-case-art>h2,.tr-e1 .studio-mystery>h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:33px;line-height:1.12;margin:12px 0 16px}
.tr-e1 .studio-case-art>p,.tr-e1 .studio-mystery>p,.tr-e1 .studio-case-feedback>p{font-size:16px;line-height:1.65;color:#49323f}
.tr-e1 .studio-clues{padding:0;list-style:none;counter-reset:clue;margin:24px 0}
.tr-e1 .studio-clues>li{counter-increment:clue;padding:14px 0 14px 37px;position:relative;border-top:1px solid #d6c6cf;font-size:16px;line-height:1.55;color:#49323f}
.tr-e1 .studio-clues>li:before{content:counter(clue,decimal-leading-zero);position:absolute;left:0;top:16px;font-size:12px;color:#654858}
.tr-e1 .studio-suspects{display:flex;gap:8px;margin:16px 0}
.tr-e1 .studio-suspects>button{flex:1;background:#fffaf4;border:1px solid #baa2b3;border-radius:14px;padding:13px 7px;font-size:16px;color:#49323f}
.tr-e1 .studio-suspects>button[aria-pressed=true]{background:#55354d;color:#fff;border-color:#55354d}
.tr-e1 .studio-case-feedback{padding:18px 0;border-top:1px solid #d6c6cf;margin-top:20px}
.tr-e1 .studio-case-feedback>h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;line-height:1.2;color:#49323f;margin:0 0 10px}

.tr-e1 .studio-workbench{margin-top:20px}
.tr-e1 .studio-history{display:flex;align-items:center;gap:6px;margin-bottom:14px}
.tr-e1 .studio-history button{font-size:14px;line-height:1.3;border:0;border-radius:12px;background:transparent;padding:9px 10px;color:#654858}
.tr-e1 .studio-history .studio-preview-button{margin-left:auto;background:#fffaf4;border:1px solid #c9b6c2;color:#49323f;max-width:58%}
.tr-e1 .studio-artwork{overflow:hidden;border-radius:4px 23px 4px 23px;background:var(--studio-base);color:var(--studio-ink);position:relative;box-shadow:0 12px 25px #49323f0c}
.tr-e1 .studio-artwork :is(span,strong,small,p,i,em,b){color:var(--studio-ink)}
.tr-e1 .studio-text{display:block;font:inherit;line-height:inherit;color:inherit;text-align:inherit;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;background:transparent;border:0;padding:0;min-height:0}
.tr-e1 button.studio-text{min-height:44px;text-decoration:underline;text-decoration-color:currentColor;text-decoration-thickness:1px;text-underline-offset:5px;text-decoration-style:dotted}
.tr-e1 .studio-canvas{position:relative;width:100%;height:255px;overflow:hidden;isolation:isolate;touch-action:pan-y;background:var(--studio-base);color:var(--studio-tone)}
.tr-e1 .studio-object{position:absolute;display:block;padding:0;border:0;background:transparent;border-radius:10px;min-height:0;min-width:0;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:default}
.tr-e1 button.studio-object{min-height:44px;min-width:44px;touch-action:none;cursor:grab}
.tr-e1 .studio-object[aria-pressed=true]{outline:1px dashed #55354d;outline-offset:4px;background:#fffaf425}
.tr-e1 .studio-object:focus-visible{outline:2px solid #55354d;outline-offset:5px}
.tr-e1 .studio-object:active:not(:disabled){transform:translate(-50%,-50%) rotate(var(--piece-rotation,0deg));cursor:grabbing}
.tr-e1 .studio-canvas-blueprint .studio-object[aria-pressed=true]{outline-color:currentColor}
.tr-e1 .studio-canvas-blueprint{height:300px;background:#ede8d7;color:#4c6655;transition:background .8s ease,color .8s ease}
.tr-e1 .studio-print-revealed,.tr-e1 .studio-print-exposing{background:var(--studio-print-blue,#173e72);color:var(--studio-print-ink,#fff8de)}
.tr-e1 .studio-print-exposing .studio-object{animation:studio-specimen-reveal .85s ease both}
.tr-e1 .studio-print-art .studio-art-caption{background:var(--studio-print-blue,#173e72)}
.tr-e1 .studio-print-art .studio-art-caption :is(.studio-text,small){color:var(--studio-print-ink,#fff8de)}
.tr-e1 .studio-canvas .studio-object *{color:inherit}
.tr-e1 .studio-exposure{position:absolute;inset:-30%;z-index:50;background:linear-gradient(110deg,transparent 25%,#fff8de88 48%,transparent 68%);pointer-events:none;animation:studio-light-pass .85s ease-in-out both}
@keyframes studio-light-pass{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes studio-specimen-reveal{from{opacity:.55;filter:blur(1px)}to{opacity:1;filter:blur(0)}}
.tr-e1 .studio-previewing .studio-awning{animation:studio-cafe-open .45s ease both;transform-origin:top}
@keyframes studio-cafe-open{from{transform:scaleY(.45);opacity:.65}to{transform:scaleY(1);opacity:1}}
.tr-e1 .studio-cafe-shell{position:absolute;inset:0;background:linear-gradient(0deg,var(--studio-detail) 15%,var(--studio-base) 15%);box-shadow:inset 17px 0 0 #49323f06,inset -17px 0 0 #49323f06}
.tr-e1 .studio-awning{position:absolute;top:27%;left:7%;width:86%;height:23%;border-radius:2px 2px 13px 13px;background:var(--studio-tone);z-index:1;box-shadow:0 6px 0 #49323f15}
.tr-e1 .studio-awning-stripe{background:repeating-linear-gradient(90deg,var(--studio-tone) 0,var(--studio-tone) 10%,var(--studio-base) 10%,var(--studio-base) 20%)}
.tr-e1 .studio-awning-scallop{background:radial-gradient(circle at 10px 100%,transparent 10px,var(--studio-tone) 11px) 0 100%/20px 100%}
.tr-e1 .studio-cafe-door{position:absolute;left:12%;top:43%;width:23%;height:43%;border:5px solid var(--studio-tone);background:#fffaf45c;border-radius:36px 36px 0 0}
.tr-e1 .studio-cafe-door:after{content:'';position:absolute;left:67%;top:60%;width:5px;height:5px;border-radius:50%;background:var(--studio-tone)}
.tr-e1 .studio-cafe-window{position:absolute;right:12%;top:45%;width:43%;height:32%;border:5px solid var(--studio-tone);background:linear-gradient(145deg,#fffaf4c9,#fffaf43d);border-radius:2px}
.tr-e1 .studio-cafe-window:after{content:'';position:absolute;left:50%;top:0;width:3px;height:100%;background:var(--studio-tone)}
.tr-e1 .studio-cafe-sign{position:absolute;z-index:20;left:10%;right:10%;top:6%;font-family:'Cormorant Garamond',Georgia,serif;font-size:29px;line-height:1.05;text-align:center;color:var(--studio-ink)}
.tr-e1 .studio-cafe-sign .studio-text{margin:auto;max-height:55px;overflow:auto}
.tr-e1 .studio-menu{animation:e1-reading-reveal .3s ease both;padding:28px 22px;text-align:center;background:var(--studio-base);color:var(--studio-ink)}
.tr-e1 .studio-menu :is(strong,small,p,.studio-text){color:var(--studio-ink)}
.tr-e1 .studio-menu>small{font-size:11px;letter-spacing:1.7px;line-height:1.5}
.tr-e1 .studio-menu .studio-menu-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:33px;line-height:1.08;margin:15px auto;max-width:15ch;text-align:center}
.tr-e1 .studio-menu .studio-menu-input{display:block;box-sizing:border-box;width:100%;min-width:0;max-width:100%;resize:vertical;font:inherit;color:var(--studio-ink);background:transparent;text-align:center;border:0;border-bottom:1px dashed currentColor;border-radius:0;padding:8px 4px;min-height:44px;opacity:1}
.tr-e1 .studio-menu .studio-menu-input::placeholder{color:var(--studio-ink);opacity:.7}
.tr-e1 .studio-menu .studio-menu-edit-hint{font-size:13px;line-height:1.5;margin:8px auto 16px;color:var(--studio-ink)}
.tr-e1 .studio-menu .studio-menu-description{font-size:16px;line-height:1.5}
.tr-e1 .studio-drink-builder>h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;line-height:1.2;color:#382337;margin:0 0 14px}
.tr-e1 .studio-menu-rule{height:1px;background:currentColor;opacity:.25;width:50%;margin:20px auto}
.tr-e1 .studio-menu .studio-menu-item{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.2;text-align:center;margin:12px auto}
.tr-e1 .studio-menu .studio-menu-ritual{font-size:14px;line-height:1.6;text-align:center;margin:auto;max-width:29ch}
.tr-e1 .studio-menu-added{position:relative;margin:20px auto;max-width:27ch;padding-right:20px}
.tr-e1 .studio-menu-added strong{font-family:'Cormorant Garamond',Georgia,serif;font-size:25px;line-height:1.15;font-weight:500}
.tr-e1 .studio-menu-added p{font-size:13px;line-height:1.5;margin:7px 0 0}
.tr-e1 .studio-menu-added>button{position:absolute;right:-12px;top:0;width:36px;min-height:44px;border:0;background:transparent;color:var(--studio-ink);font-size:23px}
.tr-e1 .studio-art-caption{padding:18px 22px 22px;border-top:1px solid #49323f15;color:var(--studio-ink)}
.tr-e1 .studio-art-caption>.studio-text{font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;line-height:1.13}
.tr-e1 .studio-art-caption .studio-art-detail{font-family:'Nunito Sans',sans-serif;font-size:14px;line-height:1.6;margin-top:9px}
.tr-e1 .studio-art-caption>small{font-size:10px;letter-spacing:1.5px;line-height:1.6;margin-top:13px;display:block}
.tr-e1 .studio-panes{display:flex;gap:5px;margin:20px 0 0;padding:4px;border-radius:14px;background:#e7dedb}
.tr-e1 .studio-panes>button{flex:1;border:0;border-radius:11px;color:#654858;background:transparent;font-size:14px;line-height:1.4;padding:10px 8px}
.tr-e1 .studio-panes>button[aria-pressed=true]{background:#fffaf4;color:#30212c;box-shadow:0 2px 5px #49323f0b}
.tr-e1 .studio-tool-panel{padding-top:8px}
.tr-e1 .studio-choice-row{display:flex;gap:7px;flex-wrap:wrap;margin:15px 0}
.tr-e1 .studio-choice-row>button{flex:1;min-width:74px;border:1px solid #bda5b5;border-radius:12px;color:#49323f;background:#fffaf4;font-size:14px;line-height:1.4;padding:10px 9px}
.tr-e1 .studio-choice-row>button[aria-pressed=true]{color:#fffaf4;background:#55354d;border-color:#55354d}
.tr-e1 .studio-own-colors{display:flex;gap:14px;margin:15px 0 22px}
.tr-e1 .studio-own-colors>label{display:flex;align-items:center;gap:6px;flex:1;min-width:0;font-size:12px;line-height:1.3;color:#654858}
.tr-e1 .studio-own-colors input[type=color]{width:42px;height:44px;padding:4px;border-radius:10px;flex-shrink:0}
.tr-e1 .studio-piece-tray{display:flex;overflow-x:auto;gap:8px;margin:18px -4px 5px;padding:4px;scroll-snap-type:x proximity;overscroll-behavior-x:contain}
.tr-e1 .studio-piece-tray>button{flex:0 0 88px;scroll-snap-align:start;border:1px solid #ccb8c4;background:#fffaf4;border-radius:13px;color:#49323f;padding:12px 8px;text-align:center}
.tr-e1 .studio-piece-tray>button[aria-pressed=true]{border-color:#55354d;background:#eee0e8}
.tr-e1 .studio-piece-tray>button>span{position:relative;display:block;width:37px;height:40px;margin:0 auto 9px;color:#6b7860}
.tr-e1 .studio-piece-tray small{font-size:12px;line-height:1.35;color:#49323f;display:block}
.tr-e1 .studio-position-tools{display:flex;gap:8px;margin:14px 0 18px}
.tr-e1 .studio-position-tools button{flex:1;border:1px solid #baa2b3;border-radius:12px;background:#fffaf4;color:#49323f;font-size:23px}
.tr-e1 .studio-selected-label{font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;line-height:1.15;color:#49323f;margin:14px 0}
.tr-e1 .studio-slider{display:flex;align-items:center;gap:18px;font-size:14px;color:#654858;margin:16px 0;min-height:44px}
.tr-e1 .studio-slider input{flex:1;min-width:0;accent-color:#73536a;margin:0;padding:0;border:0;background:transparent;min-height:44px}
.tr-e1 .studio-object-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}
.tr-e1 .studio-object-actions button{flex:1;min-width:70px;border:1px solid #baa2b3;background:#fffaf4;color:#49323f;border-radius:12px;font-size:13px;line-height:1.4;padding:9px 8px}
.tr-e1 .studio-hint{font-size:14px;line-height:1.6;color:#654858;margin:17px 0}
.tr-e1 .studio-field-editor{margin-top:14px}
.tr-e1 .studio-field-editor>label,.tr-e1 .studio-drink-builder>label{display:block;font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .studio-field-editor :is(input,textarea){margin-top:9px}
.tr-e1 .studio-field-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:22px 0 5px;padding-top:17px;border-top:1px solid #d6c6cf}
.tr-e1 .studio-field-tabs button{border:0;border-radius:12px;background:#ebe0e6;color:#55354d;font-size:13px;line-height:1.4;padding:9px 12px}
.tr-e1 .studio-field-tabs button[aria-pressed=true]{background:#55354d;color:#fffaf4}
.tr-e1 .studio-drink-builder{padding:18px 0;margin-top:18px;border-top:1px solid #d6c6cf}
.tr-e1 .studio-drink-builder summary{font-size:15px;line-height:1.5;color:#55354d;min-height:44px}
.tr-e1 .studio-menu-part{margin:20px 0}
.tr-e1 .studio-menu-part>small{font-size:14px;line-height:1.5;color:#654858}
.tr-e1 .studio-drink-builder input{margin-top:8px}
.tr-e1 .studio-action{display:block;width:100%;margin-top:16px;border:0;border-radius:14px;background:#55354d;color:#fffaf4;padding:13px 18px;font-size:15px}
.tr-e1 .studio-is-exposing .studio-history{visibility:hidden}
/* Reusable movable art primitives. All labels and supplied pieces are Studio content. */
.tr-e1 .studio-shape{display:block;position:absolute;inset:0;color:inherit}
.tr-e1 .studio-shape>i,.tr-e1 .studio-plant>i{display:block;position:absolute}
.tr-e1 .studio-ginkgo{position:absolute;inset:0;color:inherit}
.tr-e1 .studio-ginkgo:before{content:'';position:absolute;left:48%;top:40%;width:4%;height:60%;background:currentColor;transform:rotate(8deg);transform-origin:bottom}
.tr-e1 .studio-ginkgo>i{position:absolute;left:0;top:0;width:100%;height:70%;background:currentColor;clip-path:polygon(50% 100%,3% 38%,0 22%,15% 6%,35% 0,50% 12%,65% 0,85% 6%,100% 22%,97% 38%)}
.tr-e1 .studio-sprig.studio-eucalyptus>i{width:28px;height:14px;border-radius:50%;top:calc(3% + var(--n)*18%);transform:rotate(-20deg)}
.tr-e1 .studio-sprig.studio-eucalyptus>i:nth-child(even){left:auto;right:0;transform:rotate(20deg)}
.tr-e1 .studio-daisy{position:absolute;inset:0;color:inherit}
.tr-e1 .studio-daisy:before{content:'';position:absolute;left:49%;top:30%;height:70%;width:3%;background:currentColor;transform:rotate(-8deg)}
.tr-e1 .studio-daisy>i{position:absolute;left:43%;top:5%;width:14%;height:24%;border-radius:50%;background:currentColor;transform:rotate(calc(var(--petal)*45deg));transform-origin:50% 100%}
.tr-e1 .studio-daisy>b{position:absolute;left:42%;top:20%;width:16%;height:16%;background:currentColor;border-radius:50%}
.tr-e1 .studio-table{border-top:8px solid currentColor;border-left:5px solid currentColor;border-right:5px solid currentColor;border-radius:5px 5px 0 0}
.tr-e1 .studio-table:after{content:'';position:absolute;left:44%;top:0;width:12%;height:100%;background:currentColor;opacity:.3}
.tr-e1 .studio-chair{background:currentColor;border-radius:40% 40% 8px 8px;box-shadow:inset 0 -17px 0 #fffaf425}
.tr-e1 .studio-chair:after{content:'';position:absolute;left:12%;right:12%;bottom:-12%;height:13%;border-left:4px solid currentColor;border-right:4px solid currentColor}
.tr-e1 .studio-lamp:before{content:'';position:absolute;left:49%;top:0;width:2px;height:55%;background:currentColor}
.tr-e1 .studio-lamp:after{content:'';position:absolute;left:5%;right:5%;bottom:7%;height:42%;background:currentColor;clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);border-radius:4px}
.tr-e1 .studio-books{background:repeating-linear-gradient(0deg,currentColor 0,currentColor 22%,transparent 22%,transparent 32%);border-radius:2px;transform:rotate(-5deg)}
.tr-e1 .studio-moon{border-radius:50%;background:currentColor}
.tr-e1 .studio-leaf{background:currentColor;border-radius:0 100% 0 100%;transform:rotate(-25deg)}
.tr-e1 .studio-leaf:after{content:'';position:absolute;left:49%;top:5%;width:1px;height:90%;background:#fffaf460;transform:rotate(-35deg)}
.tr-e1 .studio-bench{border-top:8px solid currentColor;border-left:4px solid currentColor;border-right:4px solid currentColor;border-radius:5px 5px 0 0;box-shadow:0 -13px 0 -4px currentColor}
.tr-e1 .studio-fountain:before{content:'';position:absolute;left:10%;right:10%;top:30%;height:30%;border-radius:0 0 50% 50%;background:currentColor}
.tr-e1 .studio-fountain:after{content:'';position:absolute;left:44%;top:0;bottom:0;width:12%;border-radius:5px;background:currentColor}
.tr-e1 .studio-fountain i:first-child{left:34%;right:34%;bottom:0;height:7%;background:currentColor;border-radius:50%}
.tr-e1 .studio-stamp{background:var(--studio-base);border:4px dotted var(--studio-tone);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #fffaf4}
.tr-e1 .studio-stamp>small{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;line-height:1;color:var(--studio-tone)}
.tr-e1 .studio-fern{position:absolute;inset:0;left:49%;border-left:2px solid currentColor}
.tr-e1 .studio-fern>i{position:absolute;left:0;top:calc(var(--n)*10%);width:calc(13% + var(--n)*3.5%);height:7%;background:currentColor;border-radius:0 100% 0 100%;transform:rotate(-32deg);transform-origin:left}
.tr-e1 .studio-fern>i:after{content:'';position:absolute;inset:0;background:currentColor;transform:rotate(160deg);transform-origin:left;border-radius:100% 0 100% 0}
.tr-e1 .studio-sprig{position:absolute;left:49%;top:0;bottom:0;width:2px;background:currentColor}
.tr-e1 .studio-sprig>i{position:absolute;left:0;top:calc(var(--n)*18%);width:31px;height:14px;max-height:22%;border-radius:0 100% 0 100%;background:currentColor;transform:rotate(-30deg)}
.tr-e1 .studio-sprig>i:nth-child(even){left:auto;right:0;border-radius:100% 0 100% 0;transform:rotate(30deg)}
.tr-e1 .studio-flower{position:absolute;inset:0}
.tr-e1 .studio-flower:before{content:'';position:absolute;left:49%;top:30%;height:70%;width:2px;background:currentColor}
.tr-e1 .studio-flower>i{left:17%;top:0;width:36%;height:32%;border-radius:55%;background:currentColor;transform:rotate(-25deg)}
.tr-e1 .studio-flower>i:nth-child(2){left:45%;transform:rotate(25deg)}
.tr-e1 .studio-flower>i:nth-child(3){left:31%;top:15%;width:35%;height:24%;transform:none}
.tr-e1 .studio-plant{display:block;position:absolute;inset:0;left:49%;width:2px;background:currentColor}
.tr-e1 .studio-plant>i{left:0;top:14%;width:30px;height:16px;background:currentColor;border-radius:0 100% 0 100%;transform:rotate(-28deg);transform-origin:left}
.tr-e1 .studio-plant>i:nth-child(2){top:40%;left:auto;right:0;transform:rotate(28deg);border-radius:100% 0 100% 0;transform-origin:right}
.tr-e1 .studio-plant>i:nth-child(3){top:0;left:auto;right:0;transform:rotate(30deg);border-radius:100% 0 100% 0;transform-origin:right}
.tr-e1 .studio-plant>i:nth-child(4){top:54%}
.tr-e1 .studio-plant>b{position:absolute;left:-17px;bottom:0;width:36px;height:28%;background:currentColor;border-radius:3px 3px 12px 12px}
.tr-e1 .studio-tree>i{width:47px;height:37px;border-radius:50%;transform:none}
.tr-e1 .studio-tree>i:nth-child(2){transform:none;top:20%}.tr-e1 .studio-tree>i:nth-child(3){transform:none}.tr-e1 .studio-tree>b{height:12%;border-radius:1px}
.tr-e1 .studio-room-shell{position:absolute;inset:0;background:linear-gradient(0deg,var(--studio-detail) 14%,var(--studio-base) 14%)}
.tr-e1 .studio-arched-window{position:absolute;left:34%;top:8%;width:30%;height:60%;border:6px solid var(--studio-tone);border-radius:50px 50px 0 0;background:linear-gradient(145deg,#fffaf4db,#fffaf44d)}
.tr-e1 .studio-arched-window:before,.tr-e1 .studio-arched-window:after{content:'';position:absolute;background:var(--studio-tone)}
.tr-e1 .studio-arched-window:before{left:49%;top:0;width:3px;height:100%}.tr-e1 .studio-arched-window:after{top:54%;left:0;width:100%;height:3px}
.tr-e1 .studio-room-rug{position:absolute;left:12%;right:12%;bottom:2%;height:14%;border-radius:50%;background:#fffaf455}
.tr-e1 .studio-garden-shell{position:absolute;inset:0;background:radial-gradient(ellipse at 85% 45%,var(--studio-detail) 0%,transparent 65%),var(--studio-base)}
.tr-e1 .studio-garden-door{position:absolute;left:16%;top:8%;height:75%;width:31%;border:7px solid var(--studio-tone);border-radius:60px 60px 0 0;background:var(--studio-tone);box-shadow:0 0 0 11px #fffaf429}
.tr-e1 .studio-garden-door:after{content:'';position:absolute;left:74%;top:66%;width:6px;height:6px;border-radius:50%;background:var(--studio-base)}
.tr-e1 .studio-garden-path{position:absolute;left:19%;bottom:-35%;width:42%;height:54%;background:#fffaf455;transform:rotate(-12deg);border-radius:50% 50% 0 0}
.tr-e1 .studio-cover{display:flex;flex-direction:column;align-items:center;text-align:center;min-height:355px;padding:28px 25px;background:var(--studio-base);color:var(--studio-ink);border-left:8px solid #30212c16}
.tr-e1 .studio-cover>small{font-size:10px;line-height:1.5;letter-spacing:1.4px}
.tr-e1 .studio-cover-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:43px;line-height:1;letter-spacing:-.5px;margin:27px auto 8px;max-width:13ch}
.tr-e1 .studio-cover-line{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;line-height:1.25;font-style:italic;max-width:23ch;margin:4px auto 20px}
.tr-e1 .studio-cover-by{font-size:13px;line-height:1.5;margin:auto auto 0;max-width:26ch}
.tr-e1 .studio-type-italic .studio-cover-title{font-style:italic}
.tr-e1 .studio-type-sans .studio-cover-title{font-family:'Nunito Sans',sans-serif;font-size:33px;line-height:1.1;letter-spacing:-1px}
.tr-e1 .studio-cover-top{align-items:flex-start;text-align:left}.tr-e1 .studio-cover-top .studio-text{margin-left:0}
.tr-e1 .studio-cover-frame:after{content:'';position:absolute;inset:12px;border:1px solid currentColor;opacity:.35;pointer-events:none;border-radius:2px 15px 2px 15px}
.tr-e1 .studio-cover-mark{display:flex;align-items:center;justify-content:center;gap:5px;height:70px;margin:9px 0 16px}
.tr-e1 .studio-cover-mark>i{width:18px;height:49px;border-radius:90% 0 90% 0;background:var(--studio-detail);transform:rotate(-25deg)}
.tr-e1 .studio-cover-mark>i:nth-child(2){transform:none;height:58px}.tr-e1 .studio-cover-mark>i:last-child{transform:rotate(25deg)}
.tr-e1 .studio-mark-arch{width:88px;height:70px;border:14px solid var(--studio-detail);border-bottom:0;border-radius:60px 60px 0 0}.tr-e1 .studio-mark-arch>i{display:none}
.tr-e1 .studio-postcard{background:var(--studio-base);color:var(--studio-ink)}
.tr-e1 .studio-postcard-landscape{height:250px;position:relative;overflow:hidden;background:var(--studio-base)}
.tr-e1 .studio-postcard-landscape>i{position:absolute;left:-20%;right:-20%;bottom:-25%;height:75%;border-radius:50%;background:var(--studio-tone);opacity:.9;transform:rotate(-8deg)}
.tr-e1 .studio-postcard-landscape>i:nth-child(2){bottom:-47%;left:13%;background:var(--studio-detail);transform:rotate(13deg);opacity:1}
.tr-e1 .studio-postcard-landscape>i:nth-child(3){height:2px;left:8%;right:12%;bottom:38%;transform:none;opacity:.3;background:#fffaf4}
.tr-e1 .studio-postcard-landscape>b{position:absolute;width:46px;height:46px;border-radius:50%;right:20%;top:15%;background:var(--studio-detail)}
.tr-e1 .studio-landscape-mountains>i{border-radius:2px;transform:rotate(45deg);left:-7%;width:65%;height:80%;bottom:-25%;right:auto}.tr-e1 .studio-landscape-mountains>i:nth-child(2){left:47%;transform:rotate(45deg);bottom:-35%}
.tr-e1 .studio-landscape-city>i{width:28%;left:10%;right:auto;height:55%;bottom:0;border-radius:38px 38px 0 0;transform:none}.tr-e1 .studio-landscape-city>i:nth-child(2){left:45%;bottom:0;height:70%;transform:none}.tr-e1 .studio-landscape-city>i:nth-child(3){left:77%;width:20%;height:42%;bottom:0;opacity:.6;border-radius:5px;transform:none;background:var(--studio-tone)}
.tr-e1 .studio-postcard-front-copy{padding:22px;text-align:center}.tr-e1 .studio-postcard-front-copy>small{font-size:10px;letter-spacing:1.4px;line-height:1.5}.tr-e1 .studio-postcard-front-copy>.studio-text{font-family:'Cormorant Garamond',Georgia,serif;font-size:31px;line-height:1.12;margin:14px auto 0}
.tr-e1 .studio-canvas-postcard{height:330px;background:repeating-linear-gradient(0deg,transparent 0,transparent 29px,#49323f0a 29px,#49323f0a 30px),var(--studio-base)}
.tr-e1 .studio-postcard-back-copy{position:absolute;inset:85px 24px 25px;z-index:1;overflow:auto}
.tr-e1 .studio-postcard-back-copy>.studio-text{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;line-height:1.4;max-width:100%}
.tr-e1 .studio-postcard-back-copy .studio-postcard-to{font-family:'Nunito Sans',sans-serif;font-size:14px;line-height:1.5;margin-top:18px}
.tr-e1 .studio-postcard-letter{padding:22px;background:var(--studio-base);border-top:1px solid #49323f20}.tr-e1 .studio-postcard-letter>p{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;line-height:1.4;margin:0 0 18px;white-space:pre-wrap}.tr-e1 .studio-postcard-letter>i{font-size:14px;line-height:1.5}
.tr-e1 .night-kept-card>.studio-artwork{max-height:250px;overflow:hidden;border-radius:0}.tr-e1 .night-result-card>.studio-artwork{border-radius:0;box-shadow:none}
@media(max-width:360px){.tr-e1 .studio-canvas{height:235px}.tr-e1 .studio-canvas-blueprint{height:280px}.tr-e1 .studio-cafe-sign{font-size:25px}.tr-e1 .studio-own-colors{gap:7px}.tr-e1 .studio-own-colors>label{flex-direction:column}.tr-e1 .studio-cover-title{font-size:38px}.tr-e1 .studio-type-sans .studio-cover-title{font-size:30px}}

@media(prefers-reduced-motion:reduce){.tr-e1 *{animation:none!important;transition:none!important;scroll-behavior:auto!important}.tr-e1 .e1-deck[data-dragging] .e1-card-motion{transform:none!important}}
`}</style>}

export const RebuildExperienceTwo=RebuildExperienceOne
