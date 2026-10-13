import { parseBackup, replaceState } from './backup-model.js';
import { recoverSession } from './sessions.js';
export function mountBackup(content, state, persist, escape, restored) {
  let candidate = null;
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type:'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'momentum-backup-' + new Date().toISOString().slice(0,10) + '.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  content.innerHTML = `<div class="step-label">BACKUP & RESTORE</div><h2>Keep a copy of your work.</h2><p class="intro">Your data lives in this browser. Export a full backup before changing devices or clearing browser data.</p><button id="download-backup">Download full backup</button><p class="hint">Includes goals, tasks, focus history, plans, reflections, and drafts. Keep it somewhere private. Backups are JSON files, not encrypted.</p><h3>Inspect a backup</h3><label for="backup-file">Choose a full-data JSON file</label><input id="backup-file" type="file" accept="application/json,.json"><label for="backup-json">Or paste backup JSON</label><textarea id="backup-json" placeholder="Paste a full-data backup here"></textarea><button class="secondary" id="inspect-backup">Inspect backup</button><p id="backup-error" class="error" role="alert"></p><div id="backup-preview"></div>`;
  content.querySelector('#download-backup').addEventListener('click',download);
  const json = content.querySelector('#backup-json');
  function resetPreview() { candidate = null; content.querySelector('#backup-preview').innerHTML = ''; }
  json.addEventListener('input',resetPreview);
  content.querySelector('#backup-file').addEventListener('change',async event => {
    resetPreview(); const file = event.target.files[0]; if (!file) return;
    if (file.size > 5000000) { content.querySelector('#backup-error').textContent = 'File exceeds the 5 MB limit.'; return; }
    try { json.value = await file.text(); content.querySelector('#backup-error').textContent = 'File loaded. Inspect it before restoring.'; }
    catch { content.querySelector('#backup-error').textContent = 'Could not read this file.'; }
  });
  content.querySelector('#inspect-backup').addEventListener('click',() => {
    resetPreview();
    try {
      candidate = parseBackup(json.value); content.querySelector('#backup-error').textContent = '';
      content.querySelector('#backup-preview').innerHTML = `<div class="review"><small>Valid full-data backup</small><p>${candidate.goals.length} goals · ${candidate.tasks.length} inbox tasks · ${candidate.sessions.length} logged sessions</p><p class="hint">${Object.keys(candidate.dayPlans).length} daily plans · ${Object.keys(candidate.reviews).length} reviews · ${Object.keys(candidate.dayReflections).length} daily reflections. ${candidate.activeSession ? 'An unfinished session will restore paused or awaiting review.' : 'No unfinished session.'}</p><p class="hint">Restoring replaces this browser’s current ${state.goals.length} goals, ${state.tasks.length} tasks, and ${state.sessions.length} sessions. It does not merge data. No external calendars are changed.</p><label><input id="restore-confirm" type="checkbox" style="width:auto"> I understand this replaces current browser data.</label><button id="apply-backup">Back up current data and restore</button></div>`;
      content.querySelector('#apply-backup').addEventListener('click',() => {
        if (!content.querySelector('#restore-confirm').checked) { content.querySelector('#backup-error').textContent = 'Confirm replacement before restoring.'; return; }
        if (state.activeSession) { content.querySelector('#backup-error').textContent = 'End and save your current focus session before restoring data.'; return; }
        recoverSession(candidate.activeSession);
        // Persist the replacement before changing the live state. Keep the old state on failure.
        download();
        if (!replaceState(state, candidate, persist)) { content.querySelector('#backup-error').textContent = 'Restore failed: browser storage could not save the replacement. Your previous data remains in this tab.'; return; }
        restored();
      });
    } catch (cause) { content.querySelector('#backup-error').textContent = cause.message; }
  });
}
