import { emptyDraft, validate, makeGoal } from './model.js';
import { mountInbox } from './inbox.js';
import { mountFocus } from './focus.js';
import { mountProgress } from './progress.js';
import { mountToday } from './today.js';
import { mountGoals } from './goals.js';
import { mountBackup } from './backup.js';
import { mountGuide } from './guide.js';
import { recoverSession } from './sessions.js';
import { workspaceStorage, mountAccount } from './account.js';
const key = 'momentum.quickstart.v1';
let state = { version: 1, step: 0, draft: emptyDraft(), goals: [], selected: null, tasks: [], taskDraft: { title: '', minutes: '', goalId: '' }, view: 'quick-start' };
let errors = {};
let cleanupView = () => {};
const content = document.querySelector('#content');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function notice(message) { document.querySelector('#storage-notice').textContent = message; }
const storage=await workspaceStorage(key,notice);
try {
  const saved = storage.initial;
  if (saved?.version === 1 && saved.draft && Array.isArray(saved.goals) && saved.goals.every(g => g && typeof g.id === 'string' && g.task && typeof g.task.title === 'string')) {
    state = { ...state, ...saved, draft: { ...emptyDraft(), ...saved.draft }, step: Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= 4 ? saved.step : 0 };
    for (const name of Object.keys(state.draft)) state.draft[name] = String(state.draft[name]);
    if (state.step === 4 && !state.goals.some(g => g.id === state.selected)) state.step = 0;
  } else if (saved) notice('Your saved data could not be read. You can begin a new draft.');
} catch { notice('Browser storage is unavailable or unreadable. Keep this page open to retain your work.'); }
function persist() {
  try { return storage.save(state); }
  catch { notice('Your changes are in this tab only. Browser storage could not save them; export your goals before closing.'); return false; }
}
function field(name, label, hint, type = 'text') {
  const id = escape(name);
  return `<label for="${id}">${label}</label>${type === 'textarea' ? `<textarea id="${id}" name="${id}" maxlength="2000"` : `<input id="${id}" name="${id}" type="${type}" ${type === 'number' ? ({weeks:'min="1" max="52" step="1"',hours:'min="0.5" max="80" step="0.5"',minutes:'min="5" max="240" step="1"'}[name]) : 'maxlength="2000"'}`} aria-describedby="${id}-hint${errors[name] ? ` ${id}-error` : ''}" ${errors[name] ? 'aria-invalid="true"' : ''}${type === 'textarea' ? `>${escape(state.draft[name])}</textarea>` : ` value="${escape(state.draft[name])}">`}<p class="hint" id="${id}-hint">${hint}</p>${errors[name] ? `<p class="error" id="${id}-error">${escape(errors[name])}</p>` : ''}`;
}
const titles = ['What matters to you right now?', 'Give your ambition a shape.', 'Make the first step small.', 'A plan you can make your own.'];
const intros = ['An ambition, a project, a change you’ve been putting off. There’s no perfect answer.', 'Choose an outcome you can recognize, with time you can realistically protect.', 'Choose one concrete action within your control. You can build on it later.', 'Check that this feels realistic. Saving creates your goal and first task.'];
function render(focus = false) {
  cleanupView(); cleanupView = () => {};
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
  document.querySelector('#steps').hidden = state.view !== 'quick-start';
  if (state.view === 'account') { mountAccount(content,state,storage,escape); return; }
  if (state.view === 'result') {
    if (state.activeSession) { cleanupView = mountFocus(content, state, persist, escape, true); }
    else {
      content.innerHTML = '<div class="step-label">SAVE RESULT</div><h2>Finish an attempt, then log it.</h2><p class="intro">Start a session in Focus. When you finish, choose End and review, then save its result. Your previously saved results are in Progress.</p><button id="result-focus">Open Focus</button>';
      content.querySelector('#result-focus').addEventListener('click', () => { state.view = 'focus'; persist(); render(true); });
    }
    return;
  }
  if (state.view === 'guide') { mountGuide(content, view => { state.view = view; persist(); render(true); }); return; }
  if (state.view === 'backup') { mountBackup(content, state, persist, escape, () => { notice('Backup restored. Your previous data was offered as a download.'); render(true); }); return; }
  if (state.view === 'goals') { mountGoals(content, state, persist, escape, id => { state.taskDraft.goalId = id; state.view = 'inbox'; persist(); render(true); }); return; }
  if (state.view === 'today') { mountToday(content, state, persist, escape, view => { state.view = view; persist(); render(true); }, id => { state.focusTaskId = id; state.view = 'focus'; persist(); render(true); }); return; }
  if (state.view === 'progress') { mountProgress(content, state, persist, escape); return; }
  if (state.view === 'focus') { cleanupView = mountFocus(content, state, persist, escape); return; }
  if (state.view === 'inbox') { mountInbox(content, state, persist, escape, id => { state.focusTaskId = id; state.view = 'focus'; persist(); render(true); }); return; }
  document.querySelectorAll('#steps li').forEach((li, i) => { li.classList.toggle('active', i === Math.min(state.step, 3)); if (i === Math.min(state.step, 3)) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  if (state.step === 4) { renderGoal(); return; }
  let body;
  if (state.step === 0) body = field('aspiration', 'I’d like to…', 'Write it as it comes. We’ll make it more specific next.', 'textarea') + `<div class="examples"><button type="button" data-example="Build a consistent running habit">Run consistently</button><button type="button" data-example="Launch my personal portfolio">Build my portfolio</button><button type="button" data-example="Make time to learn a new skill">Learn something new</button></div>` + field('area', 'Life area · optional', 'Use your own category: health, learning, work, or anything meaningful.') + (state.goals.length ? '<button class="secondary" type="button" id="view-goals">View saved goals</button>' : '');
  if (state.step === 1) body = field('outcome', 'What would success look like?', 'For example: run 5 km comfortably, or publish a portfolio with three projects.', 'textarea') + `<div class="row"><div>${field('weeks', 'Time horizon · weeks', 'Choose 1–52 weeks.', 'number')}</div><div>${field('hours', 'Available time · hours / week', 'Leave room for your existing commitments.', 'number')}</div></div>`;
  if (state.step === 2) body = field('milestone', 'Your first milestone', 'A concrete result you can verify on your way to the goal.') + field('action', 'Your first action', 'Start with a verb. For example: outline the first portfolio project.') + field('minutes', 'Estimated time · minutes', 'A small beginning is enough. Choose 5–240 minutes.', 'number');
  if (state.step === 3) body = `<div class="review"><small>Original ambition · ${escape(state.draft.area || 'Personal')}</small><p>${escape(state.draft.aspiration)}</p></div><div class="review"><small>Your goal</small><p>${escape(state.draft.outcome)}</p><div class="stats"><span>${escape(state.draft.weeks)} weeks</span><span>${escape(state.draft.hours)} hours / week</span></div></div><div class="review"><small>First milestone</small><p>${escape(state.draft.milestone)}</p></div><div class="review"><small>First action · ${escape(state.draft.minutes)} minutes</small><p>${escape(state.draft.action)}</p></div><p class="hint">Your task will stay unscheduled. You decide when to begin.</p>`;
  content.innerHTML = `<form novalidate><div class="step-label">QUICK START / 0${state.step + 1}</div><h2 tabindex="-1">${titles[state.step]}</h2><p class="intro">${intros[state.step]}</p>${body}<div class="actions">${state.step > 0 ? '<button type="button" class="secondary" id="back">← Back</button>' : '<span class="hint">One goal is a good start.</span>'}<button type="submit">${state.step === 3 ? 'Save my plan' : 'Continue →'}</button></div></form>`;
  content.querySelector('form').addEventListener('input', event => { if (event.target.name) { state.draft[event.target.name] = event.target.value; persist(); } });
  content.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const allErrors = validate(state.draft);
    const names = [['aspiration'], ['outcome','weeks','hours'], ['milestone','action','minutes'], Object.keys(state.draft)][state.step];
    errors = Object.fromEntries(Object.entries(allErrors).filter(([name]) => names.includes(name)));
    if (Object.keys(errors).length) { render(); content.querySelector('[aria-invalid]')?.focus(); return; }
    if (state.step === 3) {
      const goal = makeGoal(state.draft, crypto.randomUUID(), new Date().toISOString());
      state.goals.push(goal); state.selected = goal.id; state.step = 4; state.draft = emptyDraft();
    } else state.step++;
    persist(); render(true);
  });
  content.querySelector('#back')?.addEventListener('click', () => { state.step--; errors = {}; persist(); render(true); });
  content.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => { state.draft.aspiration = button.dataset.example; persist(); render(); content.querySelector('textarea').focus(); }));
  content.querySelector('#view-goals')?.addEventListener('click', () => { state.selected = state.goals.at(-1).id; state.step = 4; persist(); render(); });
  if (focus) content.querySelector('h2').focus();
}
function renderGoal() {
  const goal = state.goals.find(g => g.id === state.selected);
  content.innerHTML = `<div class="success-icon">✓</div><div class="step-label">YOUR GOAL / READY WHEN YOU ARE</div><h2>You have a place to begin.</h2><p class="intro">A meaningful direction, and one next step. Come back whenever you’re ready.</p><div class="review"><small>${escape(goal.area)}</small><p>${escape(goal.outcome)}</p><div class="stats"><span>${escape(goal.weeks)} weeks</span><span>${escape(goal.weeklyHours)} hours / week</span></div></div><div class="review"><small>First milestone</small><p>${escape(goal.milestone)}</p></div><div class="review"><small>First action · ${goal.task.minutes == null ? 'No estimate' : escape(goal.task.minutes) + ' minutes'}</small><div class="task ${goal.task.completed ? 'done' : ''}"><input type="checkbox" id="completed" ${goal.task.completed ? 'checked' : ''}><label for="completed">${escape(goal.task.title)}</label></div></div><p class="hint">Mark the action complete when you’ve done it. Your milestone and goal remain separate.</p>${state.goals.length > 1 ? `<label for="goal-picker">Saved goals</label><select id="goal-picker">${state.goals.map(g => `<option value="${escape(g.id)}" ${g.id === goal.id ? 'selected' : ''}>${escape(g.outcome)}</option>`).join('')}</select>` : ''}<div class="actions"><button class="secondary" id="export">Export goals</button><button id="new-goal">${state.draft.aspiration ? 'Resume draft →' : 'Start another goal →'}</button></div>`;
  content.querySelector('#completed').addEventListener('change', event => { goal.task.completed = event.target.checked; persist(); renderGoal(); content.querySelector('#completed').focus(); });
  content.querySelector('#new-goal').addEventListener('click', () => { state.step = 0; errors = {}; persist(); render(true); });
  content.querySelector('#goal-picker')?.addEventListener('change', event => { state.selected = event.target.value; persist(); renderGoal(); });
  content.querySelector('#export').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, goals: state.goals }, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'momentum-goals.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
}
if (!Array.isArray(state.tasks) || !state.tasks.every(t => t && typeof t.id === 'string' && typeof t.title === 'string')) { state.tasks = []; notice('Saved inbox tasks could not be read. Your goals remain available.'); }
state.taskDraft = { title: '', minutes: '', goalId: '', ...state.taskDraft };
state.sessions = Array.isArray(state.sessions) ? state.sessions : [];
state.activeSession = state.activeSession || null;
recoverSession(state.activeSession);
if (state.activeSession) persist();
state.reviews = state.reviews && typeof state.reviews === 'object' && !Array.isArray(state.reviews) ? state.reviews : {};
state.reviewDrafts = state.reviewDrafts && typeof state.reviewDrafts === 'object' && !Array.isArray(state.reviewDrafts) ? state.reviewDrafts : {};
for (const field of ['dayPlans', 'dayDrafts', 'dayReflections', 'dayReflectionDrafts', 'goalEditDrafts']) state[field] = state[field] && typeof state[field] === 'object' && !Array.isArray(state[field]) ? state[field] : {};
if (!['quick-start', 'inbox', 'focus', 'result', 'progress', 'today', 'goals', 'backup', 'guide','account'].includes(state.view)) state.view = 'quick-start';
// Running time is unpaused wall-clock time, never a concentration measurement.
import { pauseSession } from './sessions.js';
window.addEventListener('pagehide', () => { if (state.activeSession?.status === 'running') { pauseSession(state.activeSession, Date.now(), 'Page closed or reloaded; resume when ready'); persist(); } });
setInterval(() => { if (state.activeSession?.status === 'running') { state.activeSession.lastSeenAt = Date.now(); persist(); } }, 5000);
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; persist(); render(true); }));
document.querySelector('.workspace footer').innerHTML=storage.user ? 'Local account storage · <span id="workspace-save-status">Connected</span>' : 'Browser-only mode. Account setup is optional.';
render();
