// Simulated teaching data, not a live KRAFTON feed.
export const PUBG_VN_SQUADS = Object.freeze([
 {id:'ces',name:'Cerberus Esports',map:'Erangel',phase:'Phase 6',alive:4,kills:14,wwcdProb:'68%',status:'In Safe Zone'},
 {id:'te',name:'The Expendables',map:'Miramar',phase:'Phase 7',alive:4,kills:18,wwcdProb:'82%',status:'Holding High Ground'},
 {id:'ge',name:'Genius Esports',map:'Taego',phase:'Phase 5',alive:3,kills:9,wwcdProb:'41%',status:'Rotating Blue Zone'},
].map(Object.freeze));
export function fetchKraftonPubgTelemetry(squadId,{signal,mode='random',delayMs=900,random=Math.random}={}) {
 return new Promise((resolve,reject)=>{
  const abort=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new DOMException('Request canceled','AbortError'));};
  let timer;
  if(signal?.aborted) {abort();return;}
  signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>{
   signal?.removeEventListener('abort',abort);
   if(mode==='failure' || (mode==='random' && random()<0.35)) {reject(new Error('Satellite packet timeout'));return;}
   const squad=PUBG_VN_SQUADS.find(s=>s.id===squadId);
   if(!squad) {reject(new Error('Unknown squad'));return;}
   resolve({...squad});
  },delayMs);
 });
}
