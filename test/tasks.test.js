import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTask, taskErrors, taskRows, findTask } from '../app/tasks.js';
const goals = [{ id: 'g1', outcome: 'Publish portfolio', milestone: 'Outline', task: { title: 'Write outline', minutes: 25, completed: false } }];
test('capture permits an unscheduled standalone task without invented estimate', () => {
  const task = makeTask({ title: ' Read notes ', minutes: '', goalId: '' }, goals, 't1', 'now');
  assert.equal(task.title, 'Read notes'); assert.equal(task.minutes, null); assert.equal(task.goalId, null);
  assert.equal(task.completed, false); assert.equal(task.dueDate, undefined);
});
test('reject invalid titles, estimates, and goal references', () => {
  for (const minutes of ['0', '-1', '1.5', 'abc', '1441']) assert.ok(taskErrors({ title: 'Read', minutes }, goals).minutes);
  assert.ok(taskErrors({ title: '  ' }, goals).title);
  assert.ok(taskErrors({ title: 'Read', goalId: 'missing' }, goals).goalId);
  assert.throws(() => makeTask({ title: '' }, goals, 't1', 'now'));
});
test('first actions use their original records with no duplication or goal completion', () => {
  const state = { goals: structuredClone(goals), tasks: [] };
  const rows = taskRows(state);
  assert.equal(rows.length, 1);
  findTask(state, rows[0].id).completed = true;
  assert.equal(state.goals[0].task.completed, true);
  assert.equal(state.goals[0].milestone, 'Outline');
  assert.equal(state.goals[0].outcome, 'Publish portfolio');
  assert.equal(taskRows(JSON.parse(JSON.stringify(state)))[0].completed, true);
});
test('linked tasks remain independent of first actions', () => {
  const state = { goals: structuredClone(goals), tasks: [makeTask({ title: 'Collect examples', minutes: '15', goalId: 'g1' }, goals, 't1', 'now')] };
  findTask(state, 't1').completed = true;
  assert.equal(state.goals[0].task.completed, false);
  assert.equal(taskRows(state).length, 2);
});
