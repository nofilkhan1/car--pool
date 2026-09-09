import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// Add your public Supabase project values here before launch. These are safe browser-side values.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = SUPABASE_URL.startsWith('https://') ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const heading = document.querySelector('[data-split]');
heading.innerHTML = heading.innerHTML.split(/(<br\s*\/?\s*>|<span>.*?<\/span>)/gi).map(part => {
  if (!part || /^<br/i.test(part)) return part;
  if (/^<span/i.test(part)) return `<span class="word"><i>${part.replace(/<\/?span>/g, '')}</i></span>`;
  return part.split(/(\s+)/).map(word => /\s/.test(word) ? word : `<span class="word"><i>${word}</i></span>`).join('');
}).join('');
animate('.word > i', { y: ['110%', '0%'], opacity: [0, 1] }, { duration: .7, delay: stagger(.055), easing: [0.22, 1, 0.36, 1] });
inView('.commute-notes', el => animate(el.querySelectorAll('.receipt'), { opacity: [0, 1], y: [18, 0] }, { duration: .55, delay: stagger(.16), easing: 'ease-out' }), { amount: .4 });

const steps = [...document.querySelectorAll('.form-step')];
const values = { name: null, batch: null, gender: null, area: null, role: null, timing: null, whatsapp: null, interest_level: null };
let current = 0;
const stepCount = document.querySelector('#step-count');
const bar = document.querySelector('#progress-bar');
const status = document.querySelector('#form-status');
function move(next) {
  const old = steps[current]; const incoming = steps[next];
  animate(old, { opacity: [1, 0], x: [0, -24] }, { duration: .18 }).finished.then(() => {
    old.classList.remove('active'); incoming.classList.add('active');
    animate(incoming, { opacity: [0, 1], x: [26, 0] }, { duration: .32, easing: 'ease-out' });
  });
  current = next; stepCount.textContent = `${current + 1} of 5`; bar.style.width = `${(current + 1) * 20}%`;
}
function saveInput() { const input = steps[current].querySelector('input'); if (!input) return true; if (!input.value.trim() && input.name !== 'whatsapp') { status.textContent = 'A small detail helps us understand the route.'; input.focus(); return false; } status.textContent = ''; values[input.name] = input.value.trim() || null; return true; }
document.querySelectorAll('[data-field]').forEach(btn => btn.addEventListener('click', () => {
  values[btn.dataset.field] = btn.dataset.value;
  move(current + 1);
}));
document.querySelectorAll('.next').forEach(btn => btn.addEventListener('click', () => { if (saveInput()) current === 4 ? showFinal() : move(current + 1); }));
function inferBatch(text) { const match = text.match(/\b\d{2}[A-Za-z](?:-|\s)?\d{3,4}\b|\b\d{2}[A-Za-z]\b/i); return match ? match[0].replace(/\s/g, '') : null; }
function showFinal() {
  values.batch = inferBatch(values.timing || '');
  status.textContent = '';
  document.querySelector('.join').hidden = true;
  const final = document.querySelector('#final'); final.hidden = false;
  final.scrollIntoView({ behavior: 'smooth' });
  animate('.final h2, .final-options button', { opacity: [0, 1], y: [16, 0] }, { duration: .45, delay: stagger(.1), easing: 'ease-out' });
}
document.querySelectorAll('[data-final]').forEach(btn => btn.addEventListener('click', async () => { values.interest_level = btn.dataset.final; const thanks = document.querySelector('.thanks'); thanks.textContent = 'Saving your response…'; if (supabase) { const { error } = await supabase.from('carpool_interest').insert([{ ...values, timestamp: new Date().toISOString() }]); if (error) { thanks.textContent = 'That did not save just now. Please try again.'; return; } } thanks.textContent = btn.dataset.final === 'Not now' ? 'Fair enough. The idea will be here when the timing is right.' : 'Thank you. We will let you know when the next step is ready.'; }));
