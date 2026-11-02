import { Fragment, useEffect, useId, useState } from 'react';
import { fetchKraftonPubgTelemetry, PUBG_VN_SQUADS } from '../data/telemetry';
export function PubgMatchTelemetry({squadId='ces',mode='random',delayMs=900}) {
 const [view,setView]=useState({status:'IDLE',data:null,error:null}); const retryTick=0;
 useEffect(()=>{
  const controller=new AbortController();
  setView({status:'LOADING',data:null,error:null});
  fetchKraftonPubgTelemetry(squadId,{signal:controller.signal,mode,delayMs})
   .then(data=>{if(!controller.signal.aborted) setView({status:'SUCCESS',data,error:null});})
   .catch(error=>{if(error.name!=='AbortError' && !controller.signal.aborted) setView({status:'ERROR',data:null,error:error.message});});
  return ()=>controller.abort();
 },[squadId,mode,delayMs,retryTick]);
 return <section className="radar" aria-label="Squad telemetry" data-state={view.status} aria-busy={view.status==='LOADING'}>
  {view.status==='IDLE' && <p role="status">Radar idle.</p>}
  {view.status==='LOADING' && <p role="status">Loading telemetry...</p>}
  {view.status==='ERROR' && <section role="alert"><h3>Blue-Zone Link Lost</h3><p>{view.error}</p></section>}
  {view.status==='SUCCESS' && <article aria-live="polite"><h3>{view.data.name}</h3><p>{view.data.status}</p><dl className="stats">{Object.entries({Map:view.data.map,Phase:view.data.phase,Alive:view.data.alive,Kills:view.data.kills,'WWCD probability':view.data.wwcdProb}).map(([k,v])=><Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl></article>}
 </section>;
}
export function TelemetryExercise() {
 const id=useId(); const [squadId,setSquadId]=useState('ces'); const [mode,setMode]=useState('random');
 return <section><h2>PUBG Vietnam / Satellite Radar</h2><p>SIMULATION / 35% packet loss in Random mode. No official live connection.</p>
 <fieldset><legend>Track a squad</legend>{PUBG_VN_SQUADS.map(s=><button type="button" key={s.id} aria-pressed={squadId===s.id} className={squadId===s.id?'':'secondary'} onClick={()=>setSquadId(s.id)}>{s.name}</button>)}</fieldset>
 <label htmlFor={id}>Satellite test mode<select id={id} value={mode} onChange={e=>setMode(e.target.value)}><option value="random">Random (35% loss)</option><option value="success">Always succeed</option><option value="failure">Always fail</option></select></label>
 <PubgMatchTelemetry squadId={squadId} mode={mode}/></section>;
}
