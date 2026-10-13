import test from 'node:test';
import assert from 'node:assert/strict';
import { periods, summarize, goalSnapshot, dailyRecords } from '../app/progress-model.js';
const session = (endedAt, extra = {}) => ({ endedAt, status: 'partial', plannedMinutes: 25, unpausedMs: 600000, pausedMs: 60000, focusedMinutes: null, ...extra });
test('periods cover calendar days, including today, with adjacent comparison boundaries', () => {
  const range = periods(new Date(2026, 9, 13, 15), 7);
  assert.equal(range.start, +new Date(2026, 9, 7));
  assert.equal(range.end, +new Date(2026, 9, 14));
  assert.equal(range.previous, +new Date(2026, 8, 30));
});
test('period summaries exclude unfinished/out-of-range sessions and retain missing focused reports', () => {
  const totals = summarize([session(100), session(200, { status: 'completed', focusedMinutes: 0 }), session(300, { status: 'review' }), session(400)], 100, 400);
  assert.equal(totals.attempts, 2); assert.equal(totals.partial, 1); assert.equal(totals.completed, 1);
  assert.equal(totals.unpausedMinutes, 20); assert.equal(totals.plannedMinutes, 50);
  assert.equal(totals.focusedMinutes, 0); assert.equal(totals.focusedReports, 1);
  assert.equal(summarize([], 0, 10).focusedReports, 0);
});
test('task completion never implies milestone achievement', () => {
  const goal = { id: 'g1', task: { completed: true } };
  const state = { goals: [goal], tasks: [{ goalId: 'g1', completed: true }, { goalId: null, completed: true }] };
  assert.deepEqual(goalSnapshot(state, goal), { total: 2, completed: 2, milestoneCompleted: false });
  goal.milestoneCompleted = true; assert.equal(goalSnapshot(state, goal).milestoneCompleted, true);
});
test('daily totals sum to period totals and place boundary attempts on the correct day', () => {
  const start = +new Date(2026, 9, 12); const boundary = +new Date(2026, 9, 13); const end = +new Date(2026, 9, 14);
  const sessions = [session(start), session(boundary), session(end)];
  const rows = dailyRecords(sessions, start, end);
  assert.deepEqual(rows.map(r => r.attempts), [1, 1]);
  assert.equal(rows.reduce((sum, r) => sum + r.unpausedMinutes, 0), summarize(sessions, start, end).unpausedMinutes);
});
