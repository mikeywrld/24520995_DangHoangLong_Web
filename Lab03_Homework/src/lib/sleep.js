/** Create the DOMException every fetch()/AbortController consumer expects. */
export function abortError(message = 'Aborted') {
  return new DOMException(message, 'AbortError');
}

/**
 * Abortable sleep. Resolves after `ms`, rejects with AbortError when `signal` aborts.
 * The timer is always cleared => no leaked timeouts after Stop / unmount.
 */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(id);
      reject(abortError());
    };
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
