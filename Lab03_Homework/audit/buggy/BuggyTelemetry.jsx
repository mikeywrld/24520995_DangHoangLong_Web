import { useEffect, useState } from 'react';

// AI FAILURE #03 – "Fetch telemetry when the squad changes"
// Typical LLM output: no AbortController / no ignore flag => out-of-order responses overwrite newer ones.
export function BuggyTelemetry({ squadId, fetchSquad }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchSquad(squadId).then(setData);
  }, [squadId, fetchSquad]);
  return <p>{data ? data.name : 'loading'}</p>;
}
