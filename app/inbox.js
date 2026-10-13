import { taskErrors, makeTask, taskRows, findTask } from './tasks.js';

export function mountInbox(content, state, persist, escape) {
  let filter = 'open';
  let draft = { title: state.taskDraft?.title || '', minutes: state.taskDraft?.minutes || '', goalId: state.taskDraft?.goalId || '' };
  let editing = null;
  let errors = {};
  let message = '';
  function render(focus = false) {
    const rows = taskRows(state);
    const shown = rows.filter(task => filter === 'all' || (filter === 'done' ? task.completed : !task.completed));
    const goalOptions = state.goals.map(goal => `<option value="${escape(goal.id)}" ${draft.goalId === goal.id ? 'selected' : ''}>${escape(goal.outcome)}</option>`).join('');
    content.innerHTML = `<div class="step-label">PLANNING INBOX</div><h2 tabindex="-1">Make room for what’s next.</h2><p class="intro">Capture an action now. Decide where it fits when you’re ready.</p>
      <form id="capture-task" novalidate>
        <label for="task-title">${editing ? 'Edit task' : 'What needs doing?'}</label><textarea id="task-title" maxlength="2000" ${errors.title ? 'aria-invalid="true" aria-describedby="title-error"' : ''}>${escape(draft.title)}</textarea>${errors.title ? `<p class="error" id="title-error">${escape(errors.title)}</p>` : ''}
        <div class="row"><div><label for="task-minutes">Estimate · minutes, optional</label><input id="task-minutes" type="number" min="1" max="1440" step="1" value="${escape(draft.minutes)}" ${errors.minutes ? 'aria-invalid="true" aria-describedby="minutes-error"' : ''}>${errors.minutes ? `<p class="error" id="minutes-error">${escape(errors.minutes)}</p>` : ''}</div><div><label for="task-goal">Linked goal · optional</label><select id="task-goal" ${editing?.startsWith('first:') ? 'disabled' : ''}><option value="">Standalone task</option>${goalOptions}</select></div></div>
        <p class="hint">One action per capture. No date or calendar block is assigned.</p><div class="actions">${editing ? '<button type="button" class="secondary" id="cancel-edit">Cancel edit</button>' : '<span></span>'}<button type="submit">${editing ? 'Save changes' : 'Add task →'}</button></div>
      </form><p class="hint" role="status">${escape(message)}</p>
      <div class="inbox-toolbar"><h3>Your actions <span>${rows.filter(t => !t.completed).length} open</span></h3><label class="sr-only" for="task-filter">Filter tasks</label><select id="task-filter"><option value="open" ${filter === 'open' ? 'selected' : ''}>Open</option><option value="done" ${filter === 'done' ? 'selected' : ''}>Completed</option><option value="all" ${filter === 'all' ? 'selected' : ''}>All tasks</option></select></div>
      <div class="task-list">${shown.length ? shown.map(task => { const goal = state.goals.find(g => g.id === task.goalId); return `<article class="inbox-task ${task.completed ? 'is-done' : ''}"><div class="task"><input type="checkbox" id="check-${escape(task.id)}" data-toggle="${escape(task.id)}" ${task.completed ? 'checked' : ''}><div><label for="check-${escape(task.id)}">${escape(task.title)}</label><p class="hint">${goal ? escape(goal.outcome) : 'Standalone'} · ${task.minutes == null ? 'No estimate' : escape(task.minutes) + ' min'}${task.source === 'quick-start' ? ' · First action' : ''}</p></div></div><button class="secondary" data-edit="${escape(task.id)}" aria-label="Edit ${escape(task.title)}">Edit</button></article>`; }).join('') : `<div class="empty-inbox">${filter === 'done' ? 'Completed actions will appear here.' : filter === 'all' ? 'A clear space. Capture your first action above.' : 'No open actions. Add a task when something comes to mind.'}</div>`}</div>
      <div class="actions"><p class="hint">Task completion does not complete a goal or milestone.</p><button class="secondary" id="export-actions">Export all data</button></div>`;
    const form = content.querySelector('#capture-task');
    form.addEventListener('input', () => {
      draft = { title: content.querySelector('#task-title').value, minutes: content.querySelector('#task-minutes').value, goalId: content.querySelector('#task-goal').value };
      if (!editing) { state.taskDraft = { ...draft }; persist(); }
    });
    form.addEventListener('submit', event => {
      event.preventDefault(); errors = taskErrors(draft, state.goals);
      if (Object.keys(errors).length) { render(); content.querySelector('[aria-invalid]')?.focus(); return; }
      if (editing) {
        const task = findTask(state, editing);
        task.title = draft.title.trim(); task.minutes = draft.minutes === '' ? null : Number(draft.minutes);
        if (!editing.startsWith('first:')) task.goalId = draft.goalId || null;
        message = 'Changes saved.';
        draft = { ...state.taskDraft };
      } else {
        state.tasks.push(makeTask(draft, state.goals, crypto.randomUUID(), new Date().toISOString()));
        draft = { title: '', minutes: '', goalId: '' }; state.taskDraft = { ...draft }; message = 'Task captured.';
      }
      editing = null; persist(); render(); content.querySelector('#task-title').focus();
    });
    content.querySelector('#task-filter').addEventListener('change', event => { filter = event.target.value; render(); content.querySelector('#task-filter').focus(); });
    content.querySelectorAll('[data-toggle]').forEach(input => input.addEventListener('change', () => {
      findTask(state, input.dataset.toggle).completed = input.checked;
      message = input.checked ? 'Action completed. Goal progress is unchanged.' : 'Action reopened.';
      persist(); render(); content.querySelector('#task-filter').focus();
    }));
    content.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => {
      editing = button.dataset.edit; const row = taskRows(state).find(t => t.id === editing);
      draft = { title: row.title, minutes: row.minutes ?? '', goalId: row.goalId || '' }; errors = {}; message = '';
      render(); content.querySelector('#task-title').focus();
    }));
    content.querySelector('#cancel-edit')?.addEventListener('click', () => { editing = null; draft = { ...state.taskDraft }; errors = {}; render(); });
    content.querySelector('#export-actions').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'momentum-data.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    if (focus) content.querySelector('h2').focus();
  }
  render(true);
}
