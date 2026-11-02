export const INITIAL_RELATIONSHIP={phase:'STRANGERS',signals:[],pendingId:null,recipient:'PARTNER',notice:'Start a conversation.'};
export function relationshipReducer(state,action) {
 switch(action.type) {
  case 'START': return state.phase==='STRANGERS'?{...state,phase:'DATING_NO_LOVE',notice:'Dating without mutual commitment.'}:state;
  case 'EFFORT': return state.phase==='DATING_NO_LOVE'?{...state,signals:[...state.signals,{id:action.id,actor:action.actor,steps:action.steps,multiplier:action.actor==='EM'?0.1:50}]}:state;
  case 'SEND': return state.phase==='DATING_NO_LOVE'?{...state,pendingId:action.id,notice:'Message sent. Waiting five seconds for a reply.'}:state;
  case 'REPLY': return state.phase==='DATING_NO_LOVE'&&state.pendingId?{...state,phase:'COMMITTED',pendingId:null,notice:'Mutual reply and commitment confirmed.'}:state;
  case 'TIMEOUT': return state.pendingId===action.id?{...state,phase:'SELF_RESPECT_EXIT',pendingId:null,notice:'No reply. Choose self-respect and exit.'}:state;
  case 'RECIPIENT': return {...state,recipient:action.value,pendingId:null,notice:'Recipient changed. Pending reply canceled.'};
  case 'EXIT': return {...state,phase:'SELF_RESPECT_EXIT',pendingId:null,notice:'Conversation ended. Pending work canceled.'};
  case 'RESET': return {...INITIAL_RELATIONSHIP,signals:[]};
  default:return state;
 }
}
export function effortScores(signals) {return signals.reduce((sum,s)=>({...sum,[s.actor]:sum[s.actor]+s.steps*s.multiplier}),{EM:0,AI_DO:0});}
export function waitForReply(signal,delayMs=5000) {
 return new Promise((resolve,reject)=>{
  let timer; const abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(new DOMException('Canceled','AbortError'));};
  if(signal.aborted) {abort();return;}
  signal.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},delayMs);
 });
}
