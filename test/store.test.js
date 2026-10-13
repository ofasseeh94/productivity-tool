import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../server/store.js';
test('registration accepts eight characters and rejects seven',async()=>{
  const s=new Store(':memory:');try{
    await assert.rejects(s.register('shortuser','abcdefg'), /8–128/);
    const user=await s.register('eightuser','abcdefgh');
    assert.equal((await s.login('eightuser','abcdefgh')).id,user.id);
  }finally{s.close();}
});
test('accounts hash passwords, isolate records and revoke/expire sessions',async () => {
  const s = new Store(':memory:');
  try {
    const a=await s.register('alice','sample-password-123'); const b=await s.register('bob','sample-password-456');
    assert.equal(s.db.prepare('SELECT hash FROM users WHERE id=?').get(a.id).hash.includes('sample'),false);
    assert.equal(await s.login('alice','wrong-password'),null);
    assert.equal((await s.login('ALICE','sample-password-123')).id,a.id);
    const token=s.session(a.id,1000); assert.equal(s.authenticate(token,2000).id,a.id); assert.equal(s.authenticate(token,1000+8*86400000),null);
    s.logout(token); assert.equal(s.authenticate(token,2000),null);
    s.save(a.id,{goals:['alice']},0); assert.equal(s.read(b.id).data,null); assert.equal(s.snapshot(b.id,1),null);
  } finally { s.close(); }
});
test('durable writes survive reopening and stale revisions cannot overwrite them',async () => {
  const folder=mkdtempSync(join(tmpdir(),'productivity-store-')); const path=join(folder,'db.sqlite'); let s=new Store(path);
  try {
    const user=await s.register('testuser','test-password-123'); s.save(user.id,{goals:['first']},0);
    assert.throws(() => s.save(user.id,{goals:['lost']},0), /another session/);
    s.save(user.id,{goals:['second']},1); assert.deepEqual(s.snapshot(user.id,1),{goals:['first']});
    s.close(); s=new Store(path); assert.equal(s.read(user.id).revision,2); assert.deepEqual(s.read(user.id).data,{goals:['second']});
    assert.equal(s.history(user.id).length,2);
  } finally { s.close(); assert.ok(folder.startsWith(join(tmpdir(),'productivity-store-'))); rmSync(folder,{recursive:true,force:true}); }
});
test('account deletion removes owned records, snapshots and sessions only',async()=>{
  const s=new Store(':memory:');try{
    const a=await s.register('deleteuser','test-password-123');const b=await s.register('keepuser','test-password-456');
    const token=s.session(a.id);s.save(a.id,{tasks:['remove']},0);s.save(b.id,{tasks:['keep']},0);
    s.deleteAccount(a.id);assert.equal(s.authenticate(token),null);assert.equal(s.read(a.id).data,null);assert.equal(s.history(a.id).length,0);
    assert.deepEqual(s.read(b.id).data,{tasks:['keep']});assert.equal(await s.login('deleteuser','test-password-123'),null);
  }finally{s.close();}
});
