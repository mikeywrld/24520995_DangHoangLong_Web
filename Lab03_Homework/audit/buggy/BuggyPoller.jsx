import { useEffect, useState } from 'react';

// AI FAILURE #01 – "Add 3s auto-refresh to PubgMatchTelemetry"
// Typical LLM output: setInterval inside useEffect with [] deps and no cleanup.
export function BuggyPoller({ squadId, fetchSquad }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    setInterval(() => { fetchSquad(squadId).then(setData); }, 3000); // stale closure + leaked interval
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <p>{data?.name ?? 'loading'}</p>;
}
