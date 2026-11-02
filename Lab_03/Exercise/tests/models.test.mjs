import test from 'node:test';
import assert from 'node:assert/strict';
import { SMART_PEOPLE, selectPeople } from '../src/data/people.js';
import { fetchKraftonPubgTelemetry as fetchData } from '../src/data/telemetry.js';
import { INITIAL_RELATIONSHIP as initial, relationshipReducer as reduce, effortScores, waitForReply } from '../src/data/relationship.js';
test('trimmed case-insensitive search and numeric threshold',()=>{
 assert.deepEqual(selectPeople(SMART_PEOPLE,' EINSTEIN ',200,'iq-desc').map(p=>p.id),['sp-2']);
 assert.equal(selectPeople(SMART_PEOPLE,'',211,'iq-desc').length,0);
});
test('IQ and age sorting preserve source order and stable IDs',()=>{
 const before=JSON.stringify(SMART_PEOPLE);
 assert.equal(selectPeople(SMART_PEOPLE,'',0,'age-asc')[0].name,'William Sidis');
 assert.equal(selectPeople(SMART_PEOPLE,'',0,'iq-desc')[0].name,'Johann Goethe');
 assert.equal(JSON.stringify(SMART_PEOPLE),before);assert.equal(new Set(SMART_PEOPLE.map(p=>p.id)).size,6);
});
test('telemetry resolves complete fixture',async()=>{assert.equal((await fetchData('te',{mode:'success',delayMs:1})).kills,18);});
test('packet-loss boundary is below 0.35',async()=>{
 await assert.rejects(fetchData('ces',{delayMs:1,random:()=>0.349}),/timeout/);
 assert.equal((await fetchData('ces',{delayMs:1,random:()=>0.35})).id,'ces');
});
test('failure, retry success and unknown squad',async()=>{
 await assert.rejects(fetchData('ces',{mode:'failure',delayMs:1}),/timeout/);
 assert.equal((await fetchData('ces',{mode:'success',delayMs:1})).id,'ces');
 await assert.rejects(fetchData('unknown',{mode:'success',delayMs:1}),/Unknown/);
});
test('abort cancels stale request and latest squad wins',async()=>{
 const c=new AbortController();const old=fetchData('ces',{signal:c.signal,mode:'success',delayMs:30});
 const check=assert.rejects(old,{name:'AbortError'});c.abort();await check;
 assert.equal((await fetchData('ge',{mode:'success',delayMs:1})).id,'ge');
});
test('already-aborted telemetry rejects',async()=>{
 const c=new AbortController();c.abort();await assert.rejects(fetchData('ces',{signal:c.signal}),{name:'AbortError'});
});
test('FSM commitment requires a pending message',()=>{
 assert.equal(reduce(initial,{type:'REPLY'}),initial);
 let s=reduce(initial,{type:'START'});s=reduce(s,{type:'SEND',id:'msg1'});s=reduce(s,{type:'REPLY'});
 assert.equal(s.phase,'COMMITTED');assert.equal(s.pendingId,null);assert.equal(reduce(s,{type:'START'}),s);
});
test('immutable log derives 100 x 0.1 versus 1 x 50',()=>{
 const s=reduce(initial,{type:'START'});const next=reduce(s,{type:'EFFORT',id:'1',actor:'EM',steps:100});
 const last=reduce(next,{type:'EFFORT',id:'2',actor:'AI_DO',steps:1});
 assert.equal(s.signals.length,0);assert.equal(next.signals.length,1);assert.deepEqual(effortScores(last.signals),{EM:10,AI_DO:50});
});
test('stale timeout ignored after switch, reply and reset',()=>{
 const s=reduce(reduce(initial,{type:'START'}),{type:'SEND',id:'old'});
 for(const action of [{type:'RECIPIENT',value:'AI_DO'},{type:'REPLY'},{type:'RESET'}]) {
  const next=reduce(s,action);assert.equal(reduce(next,{type:'TIMEOUT',id:'old'}),next);
 }
 assert.equal(reduce(s,{type:'TIMEOUT',id:'old'}).phase,'SELF_RESPECT_EXIT');
});
test('reply wait aborts and normal wait completes',async()=>{
 const c=new AbortController();const p=waitForReply(c.signal,30);const check=assert.rejects(p,{name:'AbortError'});c.abort();await check;
 await waitForReply(new AbortController().signal,1);
});
