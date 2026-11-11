/** @param {{ skill: { id: string, name: string, tier?: string } }} props */
export function SkillBadge({ skill: { name, tier = 'Core' } }) {
  return (
    <li>
      <strong>{name}</strong> <span className="muted">({tier})</span>
    </li>
  );
}
