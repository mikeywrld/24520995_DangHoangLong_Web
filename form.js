'use strict';
const form = document.querySelector('#registration');
const submitButton = document.querySelector('#submit');
const formStatus = document.querySelector('#form-status');
let state = 'idle';
let requestTimer = null;
const transitions = { idle: ['submitting'], submitting: ['success', 'error'], success: ['submitting'], error: ['submitting'] };
function setState(next, message) {
  if (!transitions[state].includes(next)) throw new Error(`Invalid transition: ${state} -> ${next}`);
  state = next; form.dataset.state = next;
  const busy = next === 'submitting';
  submitButton.disabled = busy;
  form.setAttribute('aria-busy', String(busy));
  submitButton.textContent = busy ? 'Submitting…' : 'Register interest';
  formStatus.textContent = message;
}
// Local deterministic service substitute. No network or persistent personal data.
function submitRegistration(fail) {
  return new Promise((resolve, reject) => {
    requestTimer = setTimeout(() => {
      requestTimer = null;
      if (fail) reject(new Error('Simulated service failure. Uncheck the error option and retry.'));
      else resolve();
    }, 900);
  });
}
