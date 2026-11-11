import { useId, useRef, useState } from 'react';
import styles from './ScientistDirectory.module.css';
import { SMART_PEOPLE } from '../data/pubgVnSquads.js';

const SORTERS = {
  'iq-desc': (a, b) => b.iq - a.iq,
  'iq-asc': (a, b) => a.iq - b.iq,
  'age-desc': (a, b) => b.age - a.age,
  'age-asc': (a, b) => a.age - b.age,
};

/**
 * Sprint 2 – ONLY raw inputs live in state (people, query, minIq, sortBy).
 * `visible` is derived during render: 0 useEffect, 1 commit per keystroke.
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const qId = useId();
  const iqId = useId();
  const sortId = useId();
  const listRef = useRef(null);

  const [people, setPeople] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  const needle = query.trim().toLowerCase();
  const visible = people
    .filter((p) => p.name.toLowerCase().includes(needle) && p.iq >= minIq)
    .toSorted(SORTERS[sortBy]);

  const handleIq = (e) => {
    const value = e.target.valueAsNumber; // number, never the string '35'
    setMinIq(Number.isNaN(value) ? 0 : value);
  };
  const handleDelete = (id) => {
    listRef.current?.focus(); // keep keyboard focus inside the directory
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };
  const handleReset = () => {
    setPeople(initialData);
    setQuery('');
    setMinIq(160);
    setSortBy('iq-desc');
  };

  return (
    <section className={styles.panel} aria-labelledby="directory-title">
      <h2 id="directory-title">Pioneer Directory</h2>
      <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <p className="field">
          <label htmlFor={qId}>Name</label>
          <input id={qId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </p>
        <p className="field">
          <label htmlFor={iqId}>Min IQ</label>
          <input id={iqId} type="number" inputMode="numeric" value={minIq} onChange={handleIq} />
        </p>
        <p className="field">
          <label htmlFor={sortId}>Sort by</label>
          <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="iq-desc">IQ (high → low)</option>
            <option value="iq-asc">IQ (low → high)</option>
            <option value="age-desc">Age (old → young)</option>
            <option value="age-asc">Age (young → old)</option>
          </select>
        </p>
        <button type="button" className="btn" onClick={handleReset}>Reset</button>
      </form>
      <output role="status" aria-live="polite" className={styles.status}>
        Found {visible.length} pioneer{visible.length === 1 ? '' : 's'}
      </output>
      <ul ref={listRef} tabIndex={-1} className={styles.list} aria-label="Pioneers">
        {visible.map((p) => (
          <li key={p.id} className={styles.row}>
            <span>
              <strong>{p.name}</strong>
              <span className="muted"> — IQ {p.iq}, age {p.age}</span>
            </span>
            <button type="button" className="btn btn--danger" onClick={() => handleDelete(p.id)}>
              Delete<span className="visually-hidden"> {p.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
