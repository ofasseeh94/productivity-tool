import { periods, summarize, goalSnapshot, dailyRecords } from './progress-model.js';
import { taskRows } from './tasks.js';

export function mountProgress(content, state, persist, escape) {
  let days = 7;
  const number = value => Number(value).toFixed(1);
  const date = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  function render() {
    const range = periods(Date.now(), days);
    const current = summarize(state.sessions, range.start, range.end);
    const previous = summarize(state.sessions, range.previous, range.start);
    const daily = dailyRecords(state.sessions, range.start, range.end);
    const tasks = taskRows(state);
    const reviewKey = String(range.start) + ':' + days;
    const review = state.reviews[reviewKey] || { text: '' };
    const metric = (label, value, hint) => `<div class="review"><small>${label}</small><p>${value}</p><p class="hint">${hint}</p></div>`;
    const compare = (value, old) => old === 0 ? (value === 0 ? 'No activity in either period.' : 'Previous period has no logged activity; no percentage comparison.') : `${number(value - old)} min change from ${number(old)} min previously.`;
    content.innerHTML = `<div class="step-label">PROGRESS & REVIEW</div><h2 tabindex="-1">See what actually happened.</h2><p class="intro">Review attempts, effort, and results separately. Partial work remains part of your history.</p>
      <label for="progress-period">Review period</label><select id="progress-period"><option value="7" ${days === 7 ? 'selected' : ''}>Last 7 calendar days</option><option value="28" ${days === 28 ? 'selected' : ''}>Last 28 calendar days</option></select><p class="hint">${escape(date(range.start))} – ${escape(date(range.end - 1))}, including today, in this browser’s timezone. Compared with ${escape(date(range.previous))} – ${escape(date(range.start - 1))}. Attempts are assigned to the day they ended.</p>
      ${state.activeSession ? '<p class="hint">An active or unlogged session is excluded until its result is saved.</p>' : ''}
      <div class="row">${metric('Logged attempts', current.attempts, `${current.completed} completed · ${current.partial} partial · ${current.stopped} stopped`)}${metric('Unpaused timer time', number(current.unpausedMinutes) + ' min', compare(current.unpausedMinutes, previous.unpausedMinutes))}</div>
      <div class="row">${metric('Planned session time', number(current.plannedMinutes) + ' min', 'Sum of intended durations of these logged attempts; not calendar capacity.')}${metric('Self-reported focused time', current.focusedReports ? number(current.focusedMinutes) + ' min' : 'Not reported', `${current.focusedReports} of ${current.attempts} attempts supplied focused time. Unreported time is unknown.`)}</div>
      <p class="hint">Paused time: ${number(current.pausedMinutes)} min. Timer time is not verified concentration, and repeated attempts are not unique completed tasks.</p>
      <h3>Daily effort</h3>${current.attempts ? `<div class="table-scroll"><table class="progress-table"><caption>Logged attempts and minutes by session end date</caption><thead><tr><th scope="col">Day</th><th scope="col">Attempts</th><th scope="col">Planned min</th><th scope="col">Unpaused min</th></tr></thead><tbody>${daily.map(day => `<tr><th scope="row">${escape(date(day.date))}</th><td>${day.attempts}</td><td>${number(day.plannedMinutes)}</td><td>${number(day.unpausedMinutes)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-inbox">No logged sessions in this period. Save a focus-session result to begin your history.</p>'}
      <h3>Current task status</h3><p class="hint">${tasks.filter(t => t.completed).length} of ${tasks.length} tasks currently marked complete. This is a current snapshot across all dates, not a completion count for the selected period.</p>
      <h3>Goals and milestones</h3>${state.goals.length ? state.goals.map(goal => { const snapshot = goalSnapshot(state, goal); return `<div class="review"><small>${escape(goal.area)}</small><p>${escape(goal.outcome)}</p><p class="hint">${snapshot.completed} of ${snapshot.total} linked tasks currently complete. Goal outcome is not automatically measured.</p><div class="task"><input type="checkbox" id="milestone-${escape(goal.id)}" data-milestone="${escape(goal.id)}" ${snapshot.milestoneCompleted ? 'checked' : ''}><label for="milestone-${escape(goal.id)}">Milestone achieved: ${escape(goal.milestone)}</label></div><p class="hint">Mark this only when you can verify the result. You can reopen it.</p></div>`; }).join('') : '<p class="hint">Create a goal in Quick Start to review its milestone here.</p>'}
      <h3>Review and adjust</h3><form id="review-form"><label for="review-note">What helped, and what will you change next?</label><textarea id="review-note" maxlength="2000">${escape(review.text)}</textarea><p class="hint">This reflection belongs to the selected rolling period. It does not change tasks or schedule work.</p><div class="actions"><p class="hint" id="review-status" role="status">${review.savedAt ? 'Last saved ' + escape(new Date(review.savedAt).toLocaleString()) : 'Not saved yet'}</p><button>Save review</button></div></form>`;
    content.querySelector('#progress-period').addEventListener('change', event => { days = Number(event.target.value); render(); content.querySelector('#progress-period').focus(); });
    content.querySelectorAll('[data-milestone]').forEach(input => input.addEventListener('change', () => {
      const goal = state.goals.find(g => g.id === input.dataset.milestone);
      goal.milestoneCompleted = input.checked; goal.milestoneUpdatedAt = new Date().toISOString(); persist();
    }));
    content.querySelector('#review-note').addEventListener('input', event => {
      state.reviewDrafts[reviewKey] = event.target.value; persist(); content.querySelector('#review-status').textContent = 'Draft saved in this browser';
    });
    if (Object.hasOwn(state.reviewDrafts, reviewKey)) { content.querySelector('#review-note').value = state.reviewDrafts[reviewKey]; content.querySelector('#review-status').textContent = 'Draft restored in this browser'; }
    content.querySelector('#review-form').addEventListener('submit', event => {
      event.preventDefault(); const text = content.querySelector('#review-note').value.trim();
      state.reviews[reviewKey] = { text, start: range.start, end: range.end, days, savedAt: new Date().toISOString() };
      delete state.reviewDrafts[reviewKey]; const saved = persist();
      content.querySelector('#review-status').textContent = saved ? 'Review saved' : 'Review kept in this tab; browser storage unavailable';
      showHistory();
    });
    const history = document.createElement('section'); content.append(history);
    function showHistory() {
      history.innerHTML = `<h3>Saved reviews</h3>${Object.values(state.reviews).sort((a, b) => b.start - a.start).map(item => `<div class="review"><small>${escape(date(item.start))} – ${escape(date(item.end - 1))}</small><p>${escape(item.text || 'No reflection entered.')}</p></div>`).join('') || '<p class="hint">Saved reflections will remain here as the review window moves forward.</p>'}`;
    }
    showHistory();
  }
  render();
}
