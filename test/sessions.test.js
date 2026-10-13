import test from 'node:test';
import assert from 'node:assert/strict';
import { beginSession, elapsed, pauseSession, resumeSession, recoverSession, endSession, finishSession } from '../app/sessions.js';
const task = { id: 't1', title: 'Write outline', completed: false };
test('pause/resume counts only unpaused time and preserves interruption', () => {
  const s = beginSession(task, 25, 's1', 1000);
  pauseSession(s, 61000, 'Phone call');
  assert.equal(elapsed(s, 121000), 60000);
  resumeSession(s, 121000); endSession(s, 181000);
  const record = finishSession(s, 182000);
  assert.equal(record.unpausedMs, 120000);
  assert.equal(record.wallClockMs, 180000);
  assert.equal(record.pausedMs, 60000);
  assert.equal(record.focusedMinutes, null);
  assert.equal(record.pauses[0].reason, 'Phone call');
});
test('reload recovery credits only last known running interval', () => {
  const s = beginSession(task, 25, 's1', 1000); s.lastSeenAt = 11000;
  recoverSession(s); assert.equal(s.status, 'paused'); assert.equal(s.unpausedMs, 10000);
  assert.equal(elapsed(s, 1000000), 10000);
  recoverSession(s); assert.equal(s.pauses.length, 1);
});
test('partial and stopped attempts preserve notes without implying completion', () => {
  const s = beginSession(task, 25, 's1', 0); endSession(s, 60000);
  s.reflection = { outcome: 'partial', note: ' Resume at paragraph two ', focusedMinutes: '0.5' };
  const record = finishSession(s, 62000);
  assert.equal(record.note, 'Resume at paragraph two'); assert.equal(record.status, 'partial');
  assert.equal(record.focusedMinutes, 0.5); assert.equal(task.completed, false);
  s.reflection.outcome = 'stopped'; assert.equal(finishSession(s, 62000).status, 'stopped');
});
test('invalid duration and focused claims rejected; results require an ended session', () => {
  for (const min of ['', 0, 241, 1.5, 'abc']) assert.throws(() => beginSession(task, min, 's1', 0));
  assert.throws(() => beginSession({ ...task, completed: true }, 25, 's1', 0));
  const s = beginSession(task, 25, 's1', 0); assert.throws(() => finishSession(s, 1000));
  endSession(s, 60000); s.reflection.focusedMinutes = '2'; assert.throws(() => finishSession(s, 62000));
  s.reflection.focusedMinutes = '-1'; assert.throws(() => finishSession(s, 62000));
  s.reflection.focusedMinutes = '1'; assert.equal(finishSession(s, 62000).focusedMinutes, 1);
});
