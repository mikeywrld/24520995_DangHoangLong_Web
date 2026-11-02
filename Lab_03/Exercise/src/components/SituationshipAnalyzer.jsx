import { useEffect, useId, useReducer, useState } from 'react';
import { INITIAL_RELATIONSHIP, relationshipReducer, effortScores, waitForReply } from '../data/relationship';
export function SituationshipAnalyzer({replyDelayMs=5000}) {
 const [state,dispatch]=useReducer(relationshipReducer,INITIAL_RELATIONSHIP);
 const [steps,setSteps]=useState(100); const id=useId(); const score=effortScores(state.signals);
 const isDating=state.phase==='DATING_NO_LOVE'; const redFlag=isDating && score.EM<score.AI_DO;
 useEffect(()=>{
  if(!state.pendingId) return;
  const controller=new AbortController(); const pendingId=state.pendingId;
  waitForReply(controller.signal,replyDelayMs).then(()=>{if(!controller.signal.aborted)dispatch({type:'TIMEOUT',id:pendingId});}).catch(error=>{if(error.name!=='AbortError')console.error(error);});
  return ()=>controller.abort();
 },[state.pendingId,replyDelayMs]);
 return <section><h2>Bonus / Situationship Analyzer</h2><p>A deterministic relationship model with an abortable five-second reply timer.</p>
 <p className="phase">{state.phase}</p>
 <label htmlFor={id+'-steps'}>My effort steps<input id={id+'-steps'} type="number" min="0" value={steps} onChange={e=>setSteps(Number.isFinite(e.target.valueAsNumber)?Math.max(0,e.target.valueAsNumber):0)}/></label>
 <label htmlFor={id+'-recipient'}>Message recipient<select id={id+'-recipient'} value={state.recipient} onChange={e=>dispatch({type:'RECIPIENT',value:e.target.value})}><option value="PARTNER">Partner</option><option value="AI_DO">Someone else (Ai Do)</option></select></label>
 <p><output role="status" aria-live="polite">{redFlag?'Red flag: asymmetric effort. ':''}{state.notice} My impact: {score.EM.toFixed(1)} / Rival impact: {score.AI_DO.toFixed(1)}.</output></p>
 <menu className="actions">
 <li><button type="button" disabled={state.phase!=='STRANGERS'} onClick={()=>dispatch({type:'START'})}>Start dating</button></li>
 <li><button type="button" disabled={!isDating} onClick={()=>dispatch({type:'EFFORT',id:crypto.randomUUID(),actor:'EM',steps})}>Log my effort</button></li>
 <li><button type="button" disabled={!isDating} onClick={()=>dispatch({type:'EFFORT',id:crypto.randomUUID(),actor:'AI_DO',steps:1})}>Log rival effort</button></li>
 <li><button type="button" disabled={!isDating||!!state.pendingId} onClick={()=>dispatch({type:'SEND',id:crypto.randomUUID()})}>Send message</button></li>
 <li><button type="button" disabled={!state.pendingId} onClick={()=>dispatch({type:'REPLY'})}>Confirm mutual reply</button></li>
 <li><button type="button" disabled={state.phase==='SELF_RESPECT_EXIT'} onClick={()=>dispatch({type:'EXIT'})}>Stop & exit</button></li>
 <li><button type="button" className="secondary" onClick={()=>dispatch({type:'RESET'})}>Reset relationship</button></li></menu>
 <details><summary>Immutable interaction log ({state.signals.length})</summary><ol>{state.signals.map(s=><li key={s.id}>{s.actor}: {s.steps} x {s.multiplier}</li>)}</ol></details>
 </section>;
}
