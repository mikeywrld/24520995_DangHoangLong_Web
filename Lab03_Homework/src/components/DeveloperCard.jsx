import { Fragment, useState } from 'react';
import styles from './DeveloperCard.module.css';
import { SkillBadge } from './SkillBadge.jsx';

const METRIC_LABELS = { commits: 'Commits', vdomNodes: 'VDOM nodes', a11yScore: 'A11y score' };

function initialsOf(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

/**
 * Sprint 1 – zero <div>: <article> > <header> + <dl> + <ul>
 * @param {{ fullName?: string, role?: string, avatarUrl?: string,
 *   metrics?: Record<string, number>, skills?: Array<{id:string,name:string,tier?:string}> }} props
 */
export function DeveloperCard({
  fullName = 'Mikey',
  role = 'Student Engineer • UIT S3T',
  avatarUrl = '', // HTTPS only; empty => initials fallback (no network request)
  metrics = { commits: 12, vdomNodes: 0, a11yScore: 100 },
  skills = [
    { id: 'sk-1', name: 'React 19 Fiber', tier: 'Core' },
    { id: 'sk-2', name: 'Web Audio API', tier: 'Awareness' },
  ],
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = avatarUrl.startsWith('https://') && !imageFailed;

  return (
    <article className={styles.card} aria-labelledby="dev-heading">
      <header className={styles.header}>
        {showImage ? (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt=""
            width="64"
            height="64"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.avatar} aria-hidden="true">{initialsOf(fullName)}</span>
        )}
        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p className="muted">{role}</p>
        </hgroup>
      </header>
      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([k, v]) => (
          <Fragment key={k}>
            <dt>{METRIC_LABELS[k] ?? k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
      </dl>
      <ul className={styles.skills} aria-label="Engineered skills">
        {skills.map((s) => <SkillBadge key={s.id} skill={s} />)}
      </ul>
    </article>
  );
}
