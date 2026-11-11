import { useState } from 'react';
import styles from './App.module.css';
import { DeveloperCard } from './components/DeveloperCard.jsx';
import { ScientistDirectory } from './components/ScientistDirectory.jsx';
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry.jsx';
import { PUBG_VN_SQUADS } from './data/pubgVnSquads.js';
import { DrumMachine } from './homeworks/DrumMachine/DrumMachine.jsx';
import { GrandPiano88 } from './homeworks/GrandPiano88/GrandPiano88.jsx';
import { KraftonPubgVnArena } from './homeworks/KraftonPubgVnArena/KraftonPubgVnArena.jsx';

const VIEWS = [
  { id: 'hw1', label: 'HW1 Drum Kit' },
  { id: 'hw2', label: 'HW2 Piano 88' },
  { id: 'hw3', label: 'HW3 PUBG VN Arena' },
  { id: 'ex1', label: 'Ex1 Card' },
  { id: 'ex2', label: 'Ex2 Directory' },
  { id: 'ex3', label: 'Ex3 Telemetry' },
];

function TelemetryDemo() {
  const [squadId, setSquadId] = useState('te');
  return (
    <section className={styles.stack} aria-labelledby="telemetry-demo-title">
      <h2 id="telemetry-demo-title">KRAFTON PUBG VN live telemetry</h2>
      <ul className={styles.chips} aria-label="Select squad">
        {PUBG_VN_SQUADS.map((s) => (
          <li key={s.id}>
            <button type="button" className="btn" aria-pressed={squadId === s.id} onClick={() => setSquadId(s.id)}>
              {s.name}
            </button>
          </li>
        ))}
      </ul>
      <PubgMatchTelemetry squadId={squadId} pollMs={5000} />
    </section>
  );
}

export function App() {
  const [view, setView] = useState('hw1');
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={styles.header}>
        <h1>Lab 03 · Production React 19</h1>
        <nav aria-label="Lab sections">
          <ul className={styles.nav}>
            {VIEWS.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="btn"
                  aria-current={view === v.id ? 'page' : undefined}
                  aria-pressed={view === v.id}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        {view === 'hw1' && <DrumMachine />}
        {view === 'hw2' && <GrandPiano88 />}
        {view === 'hw3' && <KraftonPubgVnArena />}
        {view === 'ex1' && <DeveloperCard />}
        {view === 'ex2' && <ScientistDirectory />}
        {view === 'ex3' && <TelemetryDemo />}
      </main>
    </>
  );
}
