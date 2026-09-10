// Prevent mobile browsers from restoring a previous deep scroll position on load.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const resetInitialScroll = () => window.scrollTo(0, 0);
resetInitialScroll();
window.addEventListener('pageshow', resetInitialScroll, { once: true });

import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm';
const SUBMISSION_URL = 'https://script.google.com/macros/s/AKfycbwJ8dC0hASvprAda_0qFH6RSHImd3GgZ1v7q6SpbsIn2dbUSJmp9XdZWzA5WeN25E2A3w/exec';

const heading = document.querySelector('[data-split]');
heading.innerHTML = heading.innerHTML.split(/(<br\s*\/?\s*>|<span>.*?<\/span>)/gi).map(part => {
  if (!part || /^<br/i.test(part)) return part;
  if (/^<span/i.test(part)) return `<span class="word"><i>${part.replace(/<\/?span>/g, '')}</i></span>`;
  return part.split(/(\s+)/).map(word => /\s/.test(word) ? word : `<span class="word"><i>${word}</i></span>`).join('');
}).join('');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.querySelectorAll('.word > i').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
} else {
  animate('.word > i', { y: ['110%', '0%'], opacity: [0, 1] }, { duration: .7, delay: stagger(.055), easing: [0.22, 1, 0.36, 1] });
  inView('.commute-notes', el => animate(el.querySelectorAll('.receipt'), { opacity: [0, 1], y: [18, 0] }, { duration: .55, delay: stagger(.16), easing: 'ease-out' }), { amount: .4 });
}

const steps = [...document.querySelectorAll('.form-step')];
const values = { name: null, batch: null, gender: null, area: null, role: null, timing: null, whatsapp: null, interest: null, paymentWillingness: null };
let current = 0;
const stepCount = document.querySelector('#step-count');
const bar = document.querySelector('#progress-bar');
const status = document.querySelector('#form-status');
const formCues = [...document.querySelectorAll('.form-cue-desktop, .form-cue-mobile')];
const joinSection = document.querySelector('#join');
if (formCues.length && joinSection && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => formCues.forEach(cue => cue.classList.toggle('is-hidden', entry.isIntersecting)), { threshold: .2 }).observe(joinSection);
}
function move(next) {
  const old = steps[current]; const incoming = steps[next];
  animate(old, { opacity: [1, 0], x: [0, -24] }, { duration: .18 }).finished.then(() => {
    old.classList.remove('active'); incoming.classList.add('active');
    animate(incoming, { opacity: [0, 1], x: [26, 0] }, { duration: .32, easing: 'ease-out' });
  });
  current = next; stepCount.textContent = `${current + 1} of ${steps.length}`; bar.style.width = `${((current + 1) / steps.length) * 100}%`;
}
function saveInput() {
  const input = steps[current].querySelector('input');
  if (!input) return true;
  const value = input.value.trim();
  if (!value && input.name !== 'whatsapp') { status.textContent = 'A small detail helps us understand the route.'; input.focus(); return false; }
  if (input.name === 'batch' && !/^(?:\d{2}[A-Za-z](?:[-\s]?\d{3,4})?|\d{4})$/.test(value)) {
    status.textContent = 'Use a batch like 25L, 25L-0757, or your four-digit batch year.';
    input.focus();
    return false;
  }
  status.textContent = '';
  values[input.name] = value || null;
  return true;
}
document.querySelectorAll('.next').forEach(btn => btn.addEventListener('click', () => { if (saveInput()) current === steps.length - 1 ? showFinal() : move(current + 1); }));
function inferBatch(text) { const match = text.match(/\b\d{2}[A-Za-z](?:-|\s)?\d{3,4}\b|\b\d{2}[A-Za-z]\b/i); return match ? match[0].replace(/\s/g, '') : null; }
function showFinal() {
  status.textContent = '';
  document.querySelector('.join').hidden = true;
  const final = document.querySelector('#final'); final.hidden = false;
  final.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  final.focus({ preventScroll: true });
  if (!reduceMotion) animate('.final h2, .final-options button', { opacity: [0, 1], y: [16, 0] }, { duration: .45, delay: stagger(.1), easing: 'ease-out' });
}
document.querySelectorAll('[data-field]').forEach(btn => btn.addEventListener('click', () => {
  values[btn.dataset.field] = btn.dataset.value;
  if (current === steps.length - 1) showFinal(); else move(current + 1);
}));
document.querySelectorAll('[data-final]').forEach(btn => btn.addEventListener('click', async () => {
  values.interest = btn.dataset.final;
  const thanks = document.querySelector('.thanks');
  thanks.textContent = 'Sending your response…';
  try {
    await fetch(SUBMISSION_URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(values) });
    thanks.textContent = btn.dataset.final === 'Not now' ? 'Fair enough. The idea will be here when the timing is right.' : 'Thank you. We will let you know when the next step is ready.';
  } catch (error) {
    thanks.textContent = 'That did not save just now. Please try again.';
  }
}));
