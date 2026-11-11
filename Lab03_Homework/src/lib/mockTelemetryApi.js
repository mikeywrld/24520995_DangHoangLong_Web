import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js';
import { abortError, sleep } from './sleep.js';

/**
 * Mock KRAFTON PUBG VN telemetry endpoint.
 * - honours AbortSignal (rejects with AbortError, clears its timer)
 * - simulates `packetLoss` (default 35%) with an error the UI must show in role="alert"
 */
export async function fetchKraftonPubgTelemetry(
  squadId,
  { signal, packetLoss = 0.35, latencyMs = 900, random = Math.random } = {},
) {
  if (signal?.aborted) throw abortError();
  await sleep(latencyMs, signal);
  if (random() < packetLoss) {
    throw new Error('Packet timeout – satellite link unstable');
  }
  const squad = PUBG_VN_SQUADS.find((s) => s.id === squadId);
  if (!squad) throw new Error(`Unknown squad "${squadId}"`);
  return { ...squad };
}
