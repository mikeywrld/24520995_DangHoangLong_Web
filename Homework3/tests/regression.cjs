// Run with Playwright installed and Homework3 served at localhost:5500/Homework3/.
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || undefined,args:['--no-sandbox','--disable-gpu']});
 const page = await browser.newPage();
 await page.goto('http://localhost:5500/Homework3/');
 const result = await page.evaluate(async () => {
  let faultyRemaining = 10000;
  faultyRemaining -= 1000;
  const drift = faultyRemaining === 9000 && Countdown.remaining(10000, 8000) === 2000;
  let faultyCalls = 0;
  async function faultySubmit() { faultyCalls++; await Promise.resolve(); }
  await Promise.all([faultySubmit(), faultySubmit()]);
  let safeCalls = 0; let busy = false;
  async function safeSubmit() { if (busy) return; busy = true; safeCalls++; await Promise.resolve(); busy = false; }
  await Promise.all([safeSubmit(), safeSubmit()]);
  const unsafe = document.createElement('span');
  const safe = document.createElement('span');
  const probe = '<img data-probe="audit">';
  unsafe.innerHTML = probe; // Intentional isolated negative control, never production rendering.
  safe.textContent = probe;
  return { drift, duplicate: faultyCalls === 2 && safeCalls === 1,
   injection: unsafe.querySelectorAll('img').length === 1 && safe.querySelectorAll('img').length === 0 };
 });
 console.log(result);await browser.close();
 if(!Object.values(result).every(Boolean)) process.exit(1);
})().catch(error=>{console.error(error);process.exit(1)});
