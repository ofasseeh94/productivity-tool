import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../server/store.js';
import { createAppServer } from '../server/http.js';
import { emptyDraft } from '../app/model.js';
test('API rejects unauthenticated/cross-origin writes and isolates accounts',async()=>{
  const store=new Store(':memory:');const server=createAppServer(store);
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
  const request=(path,method='GET',body,cookie,origin=url)=>fetch(url+path,{method,headers:{...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
  try{
    assert.equal((await request('/api/workspace')).status,401);
    assert.equal((await request('/api/register','POST',{username:'testalice',password:'sample-password-123'},null,'http://evil.example')).status,403);
    const first=await request('/api/register','POST',{username:'testalice',password:'sample-password-123'});assert.equal(first.status,200);
    const cookie=first.headers.get('set-cookie').split(';')[0];assert.ok(first.headers.get('set-cookie').includes('HttpOnly'));
    assert.equal((await (await request('/api/me','GET',null,cookie)).json()).user.username,'testalice');
    const data={version:1,draft:emptyDraft(),goals:[],tasks:[]};
    assert.equal((await request('/api/workspace','PUT',{data,revision:0},cookie)).status,200);
    assert.equal((await request('/api/workspace','PUT',{data,revision:0},cookie)).status,409);
    const second=await request('/api/register','POST',{username:'testbob',password:'sample-password-456'});
    const secondCookie=second.headers.get('set-cookie').split(';')[0];
    assert.equal((await (await request('/api/workspace','GET',null,secondCookie)).json()).data,null);
    await request('/api/logout','POST',{},cookie);assert.equal((await request('/api/workspace','GET',null,cookie)).status,401);
  }finally{await new Promise(r=>server.close(r));store.close();}
});
