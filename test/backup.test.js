import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackup, replaceState } from '../app/backup-model.js';
import { emptyDraft, makeGoal } from '../app/model.js';
import { beginSession, recoverSession } from '../app/sessions.js';
const backup = () => ({version:1,draft:emptyDraft(),goals:[makeGoal({...emptyDraft(),aspiration:'Learn',outcome:'Read a book',milestone:'Read chapter one',action:'Open book'},'g1','now')],tasks:[],sessions:[]});
test('full backups round-trip and older units receive safe defaults',() => {
  const result = parseBackup(JSON.stringify(backup())); assert.equal(result.goals[0].task.title,'Open book');
  assert.deepEqual(result.dayPlans,{}); assert.equal(result.view,'today'); assert.equal(result.activeSession,null);
});
test('reject malformed, unsupported and goal-only backups',() => {
  for(const raw of ['bad','{}',JSON.stringify({version:1,goals:[]}),JSON.stringify({...backup(),version:2})]) assert.throws(() => parseBackup(raw));
});
test('reject duplicates, broken references, and invalid nested plans',() => {
  const data=backup(); data.goals.push(structuredClone(data.goals[0])); assert.throws(() => parseBackup(JSON.stringify(data)));
  assert.throws(() => parseBackup(JSON.stringify({...backup(),tasks:[{id:'t1',title:'Read',completed:false,minutes:null,goalId:'missing'}]})));
  assert.throws(() => parseBackup(JSON.stringify({...backup(),dayPlans:{'2026-10-13':{priorities:null}}})));
});
test('preserve reflected history and reject reserved map keys',() => {
  const data=backup(); data.dayReflections={'2026-10-13':{text:'Useful day',savedAt:'now'}};
  assert.equal(parseBackup(JSON.stringify(data)).dayReflections['2026-10-13'].text,'Useful day');
  const raw=JSON.stringify({...backup(),reviews:{constructor:{}}}); assert.throws(() => parseBackup(raw));
});
test('unfinished session survives import and is recovered paused, missing drafts rejected',() => {
  const data=backup(); data.activeSession=beginSession({id:'first:g1',title:'Open book',completed:false},25,'s1',1000); data.activeSession.lastSeenAt=11000;
  const parsed=parseBackup(JSON.stringify(data)); recoverSession(parsed.activeSession);
  assert.equal(parsed.activeSession.status,'paused'); assert.equal(parsed.activeSession.unpausedMs,10000);
  assert.throws(() => parseBackup(JSON.stringify({...backup(),draft:{}})));
});
test('failed persistence rolls replacement back including removed fields',() => {
  const state={goals:[{id:'original'}],extra:'keep'};
  assert.equal(replaceState(state,{goals:[]},() => false),false);
  assert.deepEqual(state,{goals:[{id:'original'}],extra:'keep'});
  assert.equal(replaceState(state,{goals:[]},() => true),true);
  assert.deepEqual(state,{goals:[]});
});
