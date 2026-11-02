import { useId, useRef, useState } from 'react';
import { SMART_PEOPLE, selectPeople } from '../data/people';
export function ScientistDirectory({initialData = SMART_PEOPLE}) {
 const prefix=useId(); const searchRef=useRef(null);
 const [people]=useState(()=>[...initialData]);
 const [query,setQuery]=useState(''); const [minIq,setMinIq]=useState(160); const [sortBy,setSortBy]=useState('iq-desc');
 const visible=selectPeople(people,query,minIq,sortBy);
 return <section aria-labelledby={prefix+'-title'}>
  <h2 id={prefix+'-title'}>Scientist & Pioneer Directory</h2>
  <p>Explore six pioneers. IQ scores reproduce the classroom fixture.</p>
  <form role="search" onSubmit={e=>e.preventDefault()} className="filters">
   <label htmlFor={prefix+'-query'}>Search name<input ref={searchRef} id={prefix+'-query'} type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <label htmlFor={prefix+'-iq'}>Minimum IQ<input id={prefix+'-iq'} type="number" value={minIq} onChange={e=>setMinIq(Number.isNaN(e.target.valueAsNumber)?0:e.target.valueAsNumber)}/></label>
   <label htmlFor={prefix+'-sort'}>Sort by<select id={prefix+'-sort'} value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="iq-desc">IQ: highest first</option><option value="age-asc">Age: youngest first</option></select></label>
  </form>
  <p><output role="status" aria-live="polite">Found {visible.length} pioneers</output></p>
  <ul className="people">{visible.map(p=><li key={p.id}><span><strong>{p.name}</strong><small>IQ {p.iq} / Age {p.age}</small></span></li>)}</ul>
  {!visible.length && <p>No pioneers match your filters.</p>}
 </section>;
}
