import { goalDraft, goalEditErrors, saveGoalEdit } from './goal-editor.js';
import { goalSnapshot } from './progress-model.js';

export function mountGoals(content, state, persist, escape, addTask) {
  let selected = state.goals.find(g => g.id === state.selected)?.id || state.goals[0]?.id;
  let editing = false; let errors = {}; let message = '';
  function render() {
    if (!state.goals.length) { content.innerHTML = '<div class="step-label">GOALS</div><h2>Your ambitions, made tangible.</h2><p class="empty-inbox">Create your first goal in Quick Start. Your saved goals will appear here.</p>'; return; }
    const goal = state.goals.find(g => g.id === selected);
    const draft = state.goalEditDrafts[selected] || goalDraft(goal);
    const snapshot = goalSnapshot(state, goal);
    const field = (name, label, type = 'text') => `<label for="goal-${name}">${label}</label>${type === 'textarea' ? `<textarea id="goal-${name}" maxlength="2000">${escape(draft[name])}</textarea>` : `<input id="goal-${name}" type="${type}" value="${escape(draft[name])}" ${type === 'number' ? name === 'weeks' ? 'min="1" max="52" step="1"' : 'min="0.5" max="80" step="0.5"' : 'maxlength="2000"'}>`}${errors[name] ? `<p class="error">${escape(errors[name])}</p>` : ''}`;
    content.innerHTML = `<div class="step-label">GOAL MANAGEMENT</div><h2>Your direction can evolve.</h2><p class="intro">Refine your commitments deliberately. Keep the original ambition and a record of what changed.</p><label for="managed-goal">Choose a goal</label><select id="managed-goal">${state.goals.map(g => `<option value="${escape(g.id)}" ${g.id === selected ? 'selected' : ''}>${escape(g.outcome)}${g.status === 'completed' ? ' (completed)' : ''}</option>`).join('')}</select><div class="review"><small>Original ambition</small><p>${escape(goal.aspiration)}</p></div>
      ${editing ? `<form id="edit-goal" novalidate>${field('outcome','Goal outcome','textarea')}${field('area','Life area · optional')}<div class="row"><div>${field('weeks','Horizon · weeks','number')}</div><div>${field('hours','Available effort · hours / week','number')}</div></div>${field('milestone','Milestone','textarea')}<label for="goal-status">Goal outcome status</label><select id="goal-status"><option value="active" ${draft.status === 'active' ? 'selected' : ''}>Active · still working toward it</option><option value="completed" ${draft.status === 'completed' ? 'selected' : ''}>Completed · I confirm the outcome is achieved</option></select><p class="hint">Changing the milestone definition resets its achieved checkbox for fresh verification. Changing goal status does not complete or reopen tasks. This horizon is a planning duration, not an automatically assigned deadline.</p><p class="hint">No tasks, calendar blocks, or sessions will be rewritten.</p><div class="actions"><button type="button" class="secondary" id="cancel-goal">Cancel and discard edits</button><button>Save goal changes</button></div></form>` : `<div class="review"><small>${escape(goal.area)} · ${goal.status === 'completed' ? 'Outcome confirmed completed' : 'Active goal'}</small><p>${escape(goal.outcome)}</p><p class="hint">${goal.weeks} weeks · ${goal.weeklyHours} hours / week</p></div><div class="review"><small>Milestone · ${goal.milestoneCompleted ? 'achieved' : 'not yet confirmed'}</small><p>${escape(goal.milestone)}</p></div><p class="hint">${snapshot.completed} of ${snapshot.total} linked tasks currently complete. Task completion does not establish the goal outcome.</p><div class="actions"><button class="secondary" id="edit-goal-button">Edit goal</button><button id="add-linked-task">Add linked task</button></div>`}
      <p class="hint" role="status" id="goal-message">${escape(message || (editing && state.goalEditDrafts[selected] ? 'Draft restored. Save to apply changes.' : ''))}</p><h3>Definition history</h3>${goal.revisions?.length ? goal.revisions.slice().reverse().map(revision => `<div class="review"><small>Before changes on ${escape(new Date(revision.changedAt).toLocaleString())}</small><p>${escape(revision.previous.outcome)}</p><p class="hint">${escape(revision.previous.area)} · ${escape(revision.previous.weeks)} weeks · ${escape(revision.previous.hours)} hours / week · ${escape(revision.previous.status)}</p><p>Milestone: ${escape(revision.previous.milestone)}</p><p class="hint">Previously ${revision.previous.milestoneCompleted ? 'confirmed achieved' : 'unconfirmed'}.</p></div>`).join('') : '<p class="hint">Your previous goal definitions will appear here after a saved change.</p>'}`;
    content.querySelector('#managed-goal').addEventListener('change', event => { selected = event.target.value; state.selected = selected; editing = false; errors = {}; message = ''; persist(); render(); });
    for (const name of Object.keys(errors)) {
      const input = content.querySelector('#goal-' + name);
      if (input) { input.setAttribute('aria-invalid', 'true'); const error = input.nextElementSibling; if (error?.classList.contains('error')) { error.id = 'goal-error-' + name; error.setAttribute('role', 'alert'); input.setAttribute('aria-describedby', error.id); } }
    }
    content.querySelector('#edit-goal-button')?.addEventListener('click', () => { editing = true; message = ''; render(); content.querySelector('#goal-outcome').focus(); });
    content.querySelector('#add-linked-task')?.addEventListener('click', () => addTask(goal.id));
    function readDraft() { return Object.fromEntries(['outcome','area','weeks','hours','milestone','status'].map(name => [name, content.querySelector('#goal-' + name).value])); }
    content.querySelector('#edit-goal')?.addEventListener('input', () => { state.goalEditDrafts[selected] = readDraft(); persist(); content.querySelector('#goal-message').textContent = 'Draft saved. Goal definition remains unchanged until you save.'; });
    content.querySelector('#edit-goal')?.addEventListener('submit', event => {
      event.preventDefault(); const next = readDraft(); errors = goalEditErrors(next);
      state.goalEditDrafts[selected] = next;
      if (Object.keys(errors).length) { render(); content.querySelector('[aria-invalid]')?.focus(); return; }
      const changed = saveGoalEdit(goal, next, new Date().toISOString()); delete state.goalEditDrafts[selected];
      editing = false; message = persist() ? changed ? 'Goal changes saved.' : 'No definition changes to save.' : 'Goal changes retained in this tab only.'; render();
    });
    content.querySelector('#cancel-goal')?.addEventListener('click', () => { delete state.goalEditDrafts[selected]; editing = false; errors = {}; message = 'Edits discarded. Saved goal retained.'; persist(); render(); });
  }
  render();
}
