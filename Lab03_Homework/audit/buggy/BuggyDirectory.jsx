import { useEffect, useState } from 'react';

// AI FAILURE #02 – "Filter this list by name"
// Typical LLM output: duplicate state synced with useEffect => render, effect, render again.
export function BuggyDirectory({ people }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(people);
  useEffect(() => {
    setFiltered(people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())));
  }, [people, query]);
  return (
    <section>
      <label>Name <input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </section>
  );
}
