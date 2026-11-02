import { Fragment, useId, useState } from 'react';
import { SkillBadge } from './SkillBadge';
import styles from './DeveloperCard.module.css';
export function DeveloperCard({fullName = 'Dang Hoang Long', role = 'Student developer / PUBG enthusiast', avatarUrl = 'https://api.dicebear.com/9.x/initials/svg?seed=Dang%20Hoang%20Long', metrics = {'Student ID':'24520995', 'Framework':'React 19', 'Focus':'Semantic UI'}, skills = [{id:'react',name:'React 19',tier:'Core'},{id:'a11y',name:'Accessibility',tier:'Core'},{id:'fsm',name:'State machines',tier:'Core'}]}) {
  const heading = useId();
  const [failedUrl, setFailedUrl] = useState(null);
  const safeUrl = /^https:\/\//i.test(avatarUrl);
  const initials = fullName.split(/\s+/).filter(Boolean).map(s => s[0]).slice(-2).join('');
  return <article className={styles.card} aria-labelledby={heading}>
    <header className={styles.header}>
      {safeUrl && failedUrl !== avatarUrl ? <img src={avatarUrl} alt={fullName} width="72" height="72" onError={() => setFailedUrl(avatarUrl)} /> : <span className={styles.avatar} role="img" aria-label={fullName}>{initials}</span>}
      <hgroup><h2 id={heading}>{fullName}</h2><p>{role}</p></hgroup>
    </header>
    <dl className={styles.metrics}>{Object.entries(metrics).map(([key,value]) => <Fragment key={key}><dt>{key}</dt><dd>{value}</dd></Fragment>)}</dl>
    <ul className={styles.skills} aria-label="Engineering skills">{skills.map(skill => <li key={skill.id}><SkillBadge {...skill}/></li>)}</ul>
  </article>;
}
