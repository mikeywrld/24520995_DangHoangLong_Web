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
function normalizeName(value) {
  return value.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ');
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (state === 'submitting') return;
  const nameInput = form.elements.fullName;
  nameInput.value = normalizeName(nameInput.value);
  form.elements.email.value = form.elements.email.value.trim();
  nameInput.setCustomValidity(nameInput.value.length < 2 ? 'Enter at least two visible characters.' : '');
  if (!form.reportValidity()) return;
  const name = nameInput.value;
  const fail = document.querySelector('#simulate-error').checked;
  // Acquire lock before the first await, including programmatic submissions.
  setState('submitting', 'Sending your demo registration…');
  try {
    await submitRegistration(fail);
    setState('success', `Thanks, ${name}! Your demo registration is complete. No real booking was made.`);
  } catch (error) { setState('error', error.message); }
});
form.elements.fullName.addEventListener('input', () => form.elements.fullName.setCustomValidity(''));
window.addEventListener('pagehide', () => {
  if (requestTimer !== null) {
    clearTimeout(requestTimer); requestTimer = null;
    setState('error', 'Submission interrupted. Please retry.');
  }
});
