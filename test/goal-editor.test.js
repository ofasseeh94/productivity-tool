import test from 'node:test';
import assert from 'node:assert/strict';
import { goalDraft, goalEditErrors, saveGoalEdit } from '../app/goal-editor.js';
const goal = () => ({ id:'g1', aspiration:'Original dream', outcome:'Publish portfolio', area:'Work', weeks:6, weeklyHours:3, milestone:'Outline first project', milestoneCompleted:true, task:{ title:'Write outline', completed:false }, createdAt:'original' });
test('saved edits preserve original ambition, task identity and previous definition', () => {
  const g = goal(); const task = g.task;
  assert.equal(saveGoalEdit(g, { ...goalDraft(g), outcome:'Publish two projects', hours:'2' }, 'now'), true);
  assert.equal(g.aspiration, 'Original dream'); assert.equal(g.task, task); assert.equal(g.createdAt,'original');
  assert.equal(g.revisions[0].previous.outcome,'Publish portfolio'); assert.equal(g.weeklyHours,2);
});
test('milestone wording changes require fresh achievement verification', () => {
  const g = goal(); saveGoalEdit(g,{ ...goalDraft(g), milestone:'Publish first project' },'now');
  assert.equal(g.milestoneCompleted,false); assert.equal(g.revisions[0].previous.milestoneCompleted,true);
});
test('goal completion and reopening do not change task completion', () => {
  const g = goal(); saveGoalEdit(g,{ ...goalDraft(g), status:'completed' },'now');
  assert.equal(g.status,'completed'); assert.equal(g.task.completed,false);
  saveGoalEdit(g,{ ...goalDraft(g), status:'active' },'later'); assert.equal(g.status,'active'); assert.equal(g.revisions.length,2);
});
test('invalid edits rejected and unchanged saves do not create history', () => {
  const g = goal(); assert.equal(saveGoalEdit(g,goalDraft(g),'now'),false); assert.equal(g.revisions,undefined);
  assert.ok(goalEditErrors({ ...goalDraft(g), weeks:'0', hours:'abc', outcome:' ' }).weeks);
  assert.throws(() => saveGoalEdit(g,{ ...goalDraft(g), status:'inferred' },'now'));
  assert.equal(g.outcome,'Publish portfolio');
});
