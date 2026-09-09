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
inView('.punch', el => animate(el, { opacity: [0, 1], y: [42, 0], rotate: [-1.5, 0] }, { duration: .55, delay: stagger(.12), easing: 'ease-out' }), { amount: .25 });

const steps = [...document.querySelectorAll('.form-step')];
const values = { name: null, batch: null, gender: null, area: null, role: null, timing: null, interest_level: null };
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
  current = next; stepCount.textContent = `0${current + 1} / 05`; bar.style.width = `${(current + 1) * 20}%`;
}
function saveInput() { const input = steps[current].querySelector('input'); if (!input) return true; if (!input.value.trim()) { status.textContent = 'A tiny clue helps us make this useful.'; input.focus(); return false; } status.textContent = ''; values[input.name] = input.value.trim(); return true; }
document.querySelectorAll('[data-field]').forEach(btn => btn.addEventListener('click', () => {
  values[btn.dataset.field] = btn.dataset.value;
  current === 4 ? submit() : move(current + 1);
}));
document.querySelectorAll('.next').forEach(btn => btn.addEventListener('click', () => { if (saveInput()) move(current + 1); }));
function inferBatch(text) { const match = text.match(/\b\d{2}[A-Za-z](?:-|\s)?\d{3,4}\b|\b\d{2}[A-Za-z]\b/i); return match ? match[0].replace(/\s/g, '') : null; }
async function submit() {
  values.batch = inferBatch(values.timing || '');
  status.textContent = 'Saving your vibe…';
  if (supabase) { const { error } = await supabase.from('carpool_interest').insert([{ ...values, timestamp: new Date().toISOString() }]); if (error) { status.textContent = 'Couldn’t save that just now. Please try again.'; return; } }
  status.textContent = '';
  document.querySelector('.join').hidden = true;
  const final = document.querySelector('#final'); final.hidden = false;
  final.scrollIntoView({ behavior: 'smooth' });
  animate('.final h2, .final-options button', { opacity: [0, 1], y: [28, 0] }, { duration: .5, delay: stagger(.12), easing: 'ease-out' });
}
document.querySelectorAll('[data-final]').forEach(btn => btn.addEventListener('click', () => { document.querySelector('.thanks').textContent = btn.dataset.final === 'Not now' ? 'Fair. We’ll keep the seat warm.' : 'You’re on the early list. See you at the gate ✦'; }));
