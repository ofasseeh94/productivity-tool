import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { parseBackup } from '../app/backup-model.js';
export function createAppServer(store) {
  const root=resolve('app'); const limits=new Map();
  return createServer(async(req,res) => {
    res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('X-Frame-Options','DENY');
    const reply=(status,data) => res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify(data));
    try {
      if (!/^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host || '')) return reply(403,{error:'Invalid host.'});
      const path=new URL(req.url,'http://'+req.headers.host).pathname;
      if (!path.startsWith('/api/')) {
        if(req.method!=='GET') return reply(405,{error:'Method not allowed.'});
        const file=resolve(root,'.'+(path==='/'?'/index.html':decodeURIComponent(path)));
        if(!file.startsWith(root+sep)) return reply(403,{error:'Invalid path.'});
        const body=await readFile(file); res.writeHead(200,{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript'}[extname(file)] || 'application/octet-stream')+'; charset=utf-8'}).end(body); return;
      }
      const token=(req.headers.cookie || '').split(';').map(c=>c.trim()).find(c=>c.startsWith('productivity_session='))?.slice(21);
      const user=store.authenticate(token);
      if(req.method==='GET') {
        if(path==='/api/me') return reply(200,{user});
        if(!user) return reply(401,{error:'Sign in first.'});
        if(path==='/api/workspace') return reply(200,store.read(user.id));
        return reply(404,{error:'Not found.'});
      }
      if(req.headers.origin!=='http://'+req.headers.host || !String(req.headers['content-type']).startsWith('application/json')) return reply(403,{error:'Invalid request origin or content type.'});
      let raw=''; for await(const chunk of req) { raw+=chunk; if(Buffer.byteLength(raw)>5000000) return reply(413,{error:'Data exceeds 5 MB.'}); }
      let body; try{body=JSON.parse(raw || '{}');}catch{return reply(400,{error:'Invalid JSON.'});}
      if(path==='/api/register' || path==='/api/login') {
        if(req.method!=='POST') return reply(405,{error:'Method not allowed.'});
        const key=req.socket.remoteAddress; const window=limits.get(key); const now=Date.now();
        const limit=window && now-window.start<60000 ? window : {start:now,count:0}; limits.set(key,limit);
        if(++limit.count>10) return reply(429,{error:'Too many attempts. Try again in a minute.'});
        const account=path==='/api/register' ? await store.register(body.username,body.password) : await store.login(body.username,body.password);
        if(!account) return reply(401,{error:'Username or password did not match.'});
        if(token) store.logout(token);
        res.setHeader('Set-Cookie','productivity_session='+store.session(account.id)+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800');
        return reply(200,{user:account});
      }
      if(!user) return reply(401,{error:'Sign in first.'});
      if(path==='/api/account' && req.method==='DELETE') {
        if(!await store.login(user.username,body.password)) return reply(401,{error:'Password did not match.'});
        store.deleteAccount(user.id);res.setHeader('Set-Cookie','productivity_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return reply(200,{ok:true});
      }
      if(path==='/api/logout' && req.method==='POST') { store.logout(token); res.setHeader('Set-Cookie','productivity_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return reply(200,{ok:true}); }
      if(path==='/api/workspace' && req.method==='PUT') {
        if(!Number.isInteger(body.revision) || body.revision<0) return reply(400,{error:'Invalid revision.'});
        const data=parseBackup(JSON.stringify(body.data)); return reply(200,{revision:store.save(user.id,data,body.revision)});
      }
      return reply(404,{error:'Not found.'});
    } catch(error) { reply(error.status || (error.code==='ENOENT'?404:400),{error:error.status===409?error.message:error.code==='ENOENT'?'Not found.':error.message}); }
  });
}
