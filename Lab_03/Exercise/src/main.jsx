import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DeveloperCard } from './components/DeveloperCard';
import { ScientistDirectory } from './components/ScientistDirectory';
import { TelemetryExercise } from './components/PubgMatchTelemetry';
import { SituationshipAnalyzer } from './components/SituationshipAnalyzer';
import './style.css';
const tabs=['Exercise 1','Exercise 2','Exercise 3','Bonus FSM'];
function App() {
 const [active,setActive]=useState(0);
 return <><a className="skip" href="#content">Skip to content</a><header className="masthead"><p className="eyebrow">UIT / WEB APPLICATION DEVELOPMENT</p><h1>Production React Lab</h1><p>03 / Semantic UI, derived state & resilient lifecycles</p><p>Dang Hoang Long / 24520995</p></header>
 <main id="content"><nav aria-label="Exercise navigation">{tabs.map((t,i)=><button type="button" key={t} aria-pressed={active===i} className={active===i?'':'secondary'} onClick={()=>setActive(i)}>{t}</button>)}</nav>
 <p className="eyebrow">LAB 03 / {tabs[active].toUpperCase()}</p>
 {active===0&&<DeveloperCard/>}{active===1&&<ScientistDirectory/>}{active===2&&<TelemetryExercise/>}{active===3&&<SituationshipAnalyzer/>}
 </main><footer>React 19 / Vite / Engineering verification included</footer></>;
}
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);
