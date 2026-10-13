import test from 'node:test';
import assert from 'node:assert/strict';
import { workspaceStorage } from '../app/account.js';
import { emptyDraft } from '../app/model.js';
test('failed account saves survive reload and retry; conflicts preserve the pending copy',async()=>{
  const previous={fetch:globalThis.fetch,localStorage:globalThis.localStorage,document:globalThis.document};
  const cache=new Map();let revision=0,data=null,fail=false,writes=0;
  globalThis.localStorage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)};
  globalThis.document={querySelectorAll:()=>[]};
  globalThis.fetch=async(path,options)=>{
    let status=200,result;
    if(path==='/api/me')result={user:{id:'u1',username:'sample'}};
    else if(options.method==='GET')result={data,revision};
    else {writes++;const body=JSON.parse(options.body);if(fail){status=503;result={error:'Unavailable'};}else if(body.revision!==revision){status=409;result={error:'Conflict'};}else{data=body.data;result={revision:++revision};}}
    return {ok:status===200,status,json:async()=>result};
  };
  try{
    const first=await workspaceStorage('guest',()=>{});const state={version:1,draft:emptyDraft(),goals:[],tasks:[]};
    fail=true;first.save(state);assert.equal(await first.settled(),false);
    assert.equal(JSON.parse(cache.get('guest.account.u1.save')).dirty,true);
    fail=false;const recovered=await workspaceStorage('guest',()=>{});assert.deepEqual(recovered.initial,state);
    assert.equal(await recovered.settled(),true);assert.equal(revision,1);
    recovered.save({...state,tasks:[{id:'t1',title:'pending',minutes:null,completed:false,goalId:null}]});
    revision=2;assert.equal(await recovered.settled(),false);
    const notices=[];const conflict=await workspaceStorage('guest',n=>notices.push(n));const previousWrites=writes;
    assert.equal(conflict.initial.tasks[0].title,'pending');assert.equal(await conflict.settled(),false);
    assert.equal(writes,previousWrites);assert.ok(notices.some(n=>n.includes('changed elsewhere')));
  }finally{Object.assign(globalThis,previous);}
});
