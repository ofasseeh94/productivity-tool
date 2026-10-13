import { taskRows, findTask } from './tasks.js';
import { beginSession, elapsed, pauseSession, resumeSession, endSession, finishSession } from './sessions.js';

export function mountFocus(content, state, persist, escape) {
  let error = '';
  let timer;
  const minutes = ms => (ms / 60000).toFixed(2);
  const clock = ms => { const seconds = Math.floor(ms / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
  function render() {
    clearInterval(timer);
    const session = state.activeSession;
    const tasks = taskRows(state).filter(task => !task.completed);
    let body;
    if (!session) body = tasks.length ? `<form id="start-session" novalidate><label for="focus-task">Choose an action</label><select id="focus-task">${tasks.map(task => `<option value="${escape(task.id)}" ${state.focusTaskId === task.id ? 'selected' : ''}>${escape(task.title)}</option>`).join('')}</select><label for="focus-minutes">Session length · minutes</label><input id="focus-minutes" type="number" min="1" max="240" step="1" value="${escape(Math.min(240, tasks.find(t => t.id === state.focusTaskId)?.minutes || 25))}"><p class="hint">Set a session length without changing your task estimate. You can end earlier or keep going.</p><div class="actions"><span></span><button>Start focus</button></div></form>` : '<p class="empty-inbox">Capture an open task in Planning Inbox to begin a focus session.</p>';
    else if (session.status === 'review') body = `<div class="review"><small>Session ended</small><p>${escape(session.taskTitle)}</p><div class="stats"><span>Planned: ${session.plannedMinutes} min</span><span>Unpaused: ${minutes(session.unpausedMs)} min</span></div></div><form id="log-session" novalidate><label for="session-outcome">How did this attempt go?</label><select id="session-outcome"><option value="partial" ${session.reflection.outcome === 'partial' ? 'selected' : ''}>Partially completed · leave task open</option><option value="completed" ${session.reflection.outcome === 'completed' ? 'selected' : ''}>Task completed · mark it done</option><option value="stopped" ${session.reflection.outcome === 'stopped' ? 'selected' : ''}>Stopped · leave task open</option></select><label for="resumption-note">Where did you stop? · optional</label><textarea id="resumption-note" maxlength="2000">${escape(session.reflection.note)}</textarea><label for="focused-minutes">Focused minutes · optional, your estimate</label><input id="focused-minutes" type="number" min="0" step="any" value="${escape(session.reflection.focusedMinutes)}"><p class="hint">Unpaused time is timer time, not verified concentration. Leave this blank if you’re unsure.</p><div class="actions"><span></span><button>Save session result</button></div></form>`;
    else body = `<div class="review"><small>${session.status === 'paused' ? 'Paused' : 'In progress'}</small><p>${escape(session.taskTitle)}</p><p class="focus-clock" id="focus-clock">${clock(elapsed(session, Date.now()))}</p><p class="hint">Unpaused elapsed / ${session.plannedMinutes} minutes planned</p><p id="time-reached" role="status"></p></div><p class="hint">${session.status === 'paused' ? escape(session.pauses.at(-1)?.reason || 'Paused') : 'Timer continues until you pause or end the session.'}</p><label for="pause-reason">Interruption / pause reason · optional</label><input id="pause-reason" maxlength="2000" placeholder="A call, a distraction, feeling blocked…"><div class="actions"><button class="secondary" id="pause-resume">${session.status === 'paused' ? 'Resume focus' : 'Pause focus'}</button><button id="end-session">End and review</button></div>`;
    content.innerHTML = `<div class="step-label">FOCUS & EXECUTION</div><h2 tabindex="-1">One action, your attention.</h2><p class="intro">Begin where you are. Keep partial effort and a clear place to resume.</p><p class="hint">The timer continues while this page is open, including in the background. Closing or reloading pauses it; resume when ready. No background alerts are sent.</p><p class="error" role="alert">${escape(error)}</p>${body}<h3>Session history</h3>${state.sessions.length ? state.sessions.slice().reverse().map(record => `<div class="review"><small>${escape(record.status)} · ${escape(new Date(record.startedAt).toLocaleString())}</small><p>${escape(record.taskTitle)}</p><p class="hint">Planned ${record.plannedMinutes} min · Unpaused ${minutes(record.unpausedMs)} min · Paused ${minutes(record.pausedMs)} min · Focused ${record.focusedMinutes === null ? 'not reported' : escape(record.focusedMinutes) + ' min (self-reported)'}</p>${record.note ? `<p>${escape(record.note)}</p>` : ''}${record.pauses.length ? `<details><summary>${record.pauses.length} pause(s)</summary>${record.pauses.map(p => `<p class="hint">${escape(p.reason)}</p>`).join('')}</details>` : ''}</div>`).join('') : '<p class="hint">Your recorded attempts will appear here.</p>'}`;
    content.querySelector('#start-session')?.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const task = tasks.find(t => t.id === content.querySelector('#focus-task').value);
        state.activeSession = beginSession(task, content.querySelector('#focus-minutes').value, crypto.randomUUID(), Date.now());
        error = ''; persist(); render();
      } catch (cause) { error = cause.message; render(); }
    });
    content.querySelector('#focus-task')?.addEventListener('change', event => { state.focusTaskId = event.target.value; persist(); content.querySelector('#focus-minutes').value = Math.min(240, tasks.find(t => t.id === state.focusTaskId)?.minutes || 25); });
    content.querySelector('#pause-resume')?.addEventListener('click', () => {
      if (session.status === 'running') pauseSession(session, Date.now(), content.querySelector('#pause-reason').value.trim() || 'User paused');
      else resumeSession(session, Date.now());
      persist(); render();
    });
    content.querySelector('#end-session')?.addEventListener('click', () => { endSession(session, Date.now()); persist(); render(); });
    const logForm = content.querySelector('#log-session');
    function reflection() { session.reflection = { outcome: content.querySelector('#session-outcome').value, note: content.querySelector('#resumption-note').value, focusedMinutes: content.querySelector('#focused-minutes').value }; }
    logForm?.addEventListener('input', () => { reflection(); persist(); });
    logForm?.addEventListener('submit', event => {
      event.preventDefault(); reflection();
      try {
        const record = finishSession(session, Date.now());
        if (record.status === 'completed') { const task = findTask(state, session.taskId); if (task) task.completed = true; }
        state.sessions.push(record); state.activeSession = null; error = ''; persist(); render();
      } catch (cause) { error = cause.message; render(); }
    });
    function tick() {
      if (session?.status !== 'running') return;
      const now = Date.now(); session.lastSeenAt = now; persist();
      content.querySelector('#focus-clock').textContent = clock(elapsed(session, now));
      content.querySelector('#time-reached').textContent = elapsed(session, now) >= session.plannedMinutes * 60000 ? 'Planned time reached. End and review, or continue if it helps.' : '';
    }
    if (session?.status === 'running') { tick(); timer = setInterval(tick, 1000); }
  }
  render();
  return () => clearInterval(timer);
}
