import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, makeDayPlan, unfinishedPriorities } from '../app/day-model.js';
const tasks = [{ id: 'a', title: 'Write', minutes: 30, completed: false }, { id: 'b', title: 'Read', minutes: null, completed: false }];
const draft = ids => ({ priorityIds: ids, capacity: '', note: ' Leave a buffer ' });
test('local day keys handle month/year rollover', () => {
  assert.equal(dayKey(new Date(2026, 11, 31, 23), 1), '2027-01-01');
  assert.equal(dayKey(new Date(2026, 9, 13)), '2026-10-13');
});
test('explicit plans preserve snapshots and unknown estimates', () => {
  const plan = makeDayPlan(draft(['a','b','']), tasks, '2026-10-13', 'now');
  assert.equal(plan.estimatedMinutes, 30); assert.equal(plan.unknownEstimates, 1);
  tasks[0].title = 'Write revised'; assert.equal(plan.priorities[0].title, 'Write');
  assert.equal(plan.note, 'Leave a buffer');
});
test('reject duplicate, excessive, missing priorities and over-capacity plans', () => {
  for (const ids of [['a','a'], ['missing'], ['a','b','a','b']]) assert.throws(() => makeDayPlan(draft(ids), tasks, 'date', 'now'));
  assert.throws(() => makeDayPlan({ ...draft(['a']), capacity: '20' }, tasks, 'date', 'now'));
  assert.throws(() => makeDayPlan({ ...draft([]), capacity: '-1' }, tasks, 'date', 'now'));
  assert.equal(makeDayPlan({ ...draft([]), capacity: '0' }, tasks, 'date', 'now').priorities.length, 0);
});
test('unfinished work is deduplicated for review without populating new dates', () => {
  const plans = { '2026-10-11': makeDayPlan(draft(['a','b']), tasks, '2026-10-11', 'now'), '2026-10-12': makeDayPlan(draft(['a']), tasks, '2026-10-12', 'now') };
  const pending = unfinishedPriorities(plans, tasks, '2026-10-13');
  assert.deepEqual(pending.map(t => t.id), ['a','b']); assert.equal(pending[0].plannedDate, '2026-10-12');
  assert.equal(plans['2026-10-13'], undefined);
  assert.equal(unfinishedPriorities(plans, tasks.map(t => ({ ...t, completed: true })), '2026-10-13').length, 0);
});
