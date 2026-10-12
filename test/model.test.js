import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, validate, makeGoal } from '../app/model.js';
const draft = () => ({ ...emptyDraft(), aspiration: ' Build a portfolio ', outcome: 'Publish three projects', milestone: 'First case study outlined', action: 'Outline one project' });
test('rejects incomplete goals and invalid numeric values', () => {
  assert.equal(Object.keys(validate(emptyDraft())).length, 4);
  for (const value of ['NaN', '0', '53', '1.5']) assert.ok(validate({ ...draft(), weeks: value }).weeks);
  assert.ok(validate({ ...draft(), hours: '-1' }).hours);
});
test('first action must fit weekly capacity', () => {
  assert.ok(validate({ ...draft(), hours: '0.5', minutes: '60' }).minutes);
  assert.deepEqual(validate({ ...draft(), hours: '0.5', minutes: '30' }), {});
});
test('saving keeps aspiration and milestone distinct from task completion', () => {
  const goal = makeGoal(draft(), 'goal-1', '2026-10-12T12:00:00Z');
  assert.equal(goal.aspiration, 'Build a portfolio');
  assert.equal(goal.weeks, 6);
  assert.equal(goal.task.completed, false);
  goal.task.completed = true;
  assert.equal(goal.milestone, 'First case study outlined');
  assert.equal(goal.outcome, 'Publish three projects');
  assert.throws(() => makeGoal(emptyDraft(), 'bad', 'now'));
});
