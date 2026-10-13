export async function api(path,method='GET',body) {
  const response=await fetch(path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const result=await response.json(); if(!response.ok) {const error=new Error(result.error || 'Request failed.');error.status=response.status;throw error;}return result;
}
export async function workspaceStorage(guestKey,notice) {
  let user=null,initial=null,revision=0,pending=null,busy=false,stopped=false,timer=null;
  try {user=(await api('/api/me')).user;if(user){const workspace=await api('/api/workspace');initial=workspace.data;revision=workspace.revision;}}
  catch {notice('Account service is unavailable. Browser-only mode remains available.');user=null;}
  const key=user?guestKey+'.account.'+user.id:guestKey;
  if(!initial && !user){try{initial=JSON.parse(localStorage.getItem(key) || 'null');}catch{}}
  if(user){try{
    const cached=JSON.parse(localStorage.getItem(key) || 'null');const meta=JSON.parse(localStorage.getItem(key+'.save') || 'null');
    if(cached && meta?.dirty){
      const normalized=parseBackup(JSON.stringify(cached));
      if(JSON.stringify(normalized)===JSON.stringify(initial))localStorage.setItem(key+'.save',JSON.stringify({baseRevision:revision,dirty:false}));
      else {initial=cached;pending=structuredClone(cached);if(meta.baseRevision!==revision){stopped=true;notice('Account data changed elsewhere while local changes were pending. Export this recovered browser copy before reloading or replacing data.');}}
    }
  }catch{notice('A pending browser cache could not be recovered. Server records remain available.');}}
  const status=text=>{document.querySelectorAll('#account-save-status, #workspace-save-status').forEach(e=>e.textContent=text);};
  async function flush() {
    timer=null;if(busy || stopped || !pending)return;
    busy=true;const data=pending;pending=null;
    try{revision=(await api('/api/workspace','PUT',{data,revision})).revision;try{localStorage.setItem(key+'.save',JSON.stringify({baseRevision:revision,dirty:!!pending}));}catch{}status('Saved to account');}
    catch(error){pending=pending || data;stopped=true;status('Not saved to account');notice(error.status===409?'Another session saved newer data. Export your current work, then reload; changes have not overwritten the account.':'Account save failed. Work remains in this browser. Export a backup before signing out; reload to retry.');}
    finally{busy=false;if(pending && !stopped)timer=setTimeout(flush,1000);}
  }
  if(pending && !stopped)timer=setTimeout(flush,1000);
  return {user,initial,key,get hasSaveError(){return stopped;},
    async useServerCopy(){await api('/api/workspace');pending=null;stopped=true;clearTimeout(timer);localStorage.removeItem(key);localStorage.removeItem(key+'.save');location.reload();},
    save(data){try{localStorage.setItem(key,JSON.stringify(data));if(user)localStorage.setItem(key+'.save',JSON.stringify({baseRevision:revision,dirty:true}));}catch{notice('Browser cache could not save. Keep this tab open and export a backup.');return false;}
      if(user){pending=structuredClone(data);status(stopped?'Not saved to account':'Saving to account…');if(!busy && !timer && !stopped)timer=setTimeout(flush,1000);}return true;},
    async settled(){clearTimeout(timer);timer=null;await flush();while(busy)await new Promise(r=>setTimeout(r,100));return !pending && !stopped;}
  };
}
export function mountAccount(content,state,storage,escape) {
  if(storage.user){
    content.innerHTML=`<div class="step-label">ACCOUNT</div><h2>Signed in as ${escape(storage.user.username)}</h2><p>Records are saved on this computer’s account server.</p><p class="hint">Local account storage is not cloud sync. Keep regular backups. Clearing browser data does not delete your server database.</p><p id="account-save-status" role="status">Account storage connected</p><button id="sign-out">Sign out</button><p id="account-error" class="error" role="alert"></p>`;
    content.insertAdjacentHTML('beforeend','<details><summary>Delete this local account</summary><p>This permanently removes its server records and saved revisions. Export a full backup first. Your separate browser-only workspace is retained.</p><label for="delete-password">Confirm password</label><input id="delete-password" type="password" autocomplete="current-password"><label><input id="delete-confirm" type="checkbox" style="width:auto"> I have a backup and understand account deletion is permanent.</label><button id="delete-account">Delete account and its records</button></details>');
    if(storage.hasSaveError){
      content.insertAdjacentHTML('beforeend','<div class="review"><p>Your browser copy has pending changes that were not saved to the account.</p><label><input id="discard-confirm" type="checkbox" style="width:auto"> Replace this browser copy with the saved server copy after exporting my pending work.</label><button id="resolve-save">Export pending work and load server copy</button></div>');
      content.querySelector('#resolve-save').addEventListener('click',async()=>{try{
        if(state.activeSession)throw new Error('End and log the current session first.');
        if(!content.querySelector('#discard-confirm').checked)throw new Error('Confirm replacement of the pending browser copy.');
        await api('/api/workspace');
        const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='pending-account-work.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        await storage.useServerCopy();
      }catch(e){content.querySelector('#account-error').textContent=e.message;}});
    }
    content.querySelector('#delete-account').addEventListener('click',async()=>{try{
      if(state.activeSession)throw new Error('End and save your focus session before deleting the account.');
      if(!content.querySelector('#delete-confirm').checked)throw new Error('Confirm deletion and keep a backup first.');
      if(!await storage.settled())throw new Error('Export your pending work before resolving the save error.');
      await api('/api/account','DELETE',{password:content.querySelector('#delete-password').value});
      localStorage.removeItem(storage.key);localStorage.removeItem(storage.key+'.save');location.reload();
    }catch(e){content.querySelector('#account-error').textContent=e.message;}});
    content.querySelector('#sign-out').addEventListener('click',async()=>{try{if(state.activeSession)throw new Error('End and save your focus session before signing out.');if(!await storage.settled())throw new Error('Unsaved changes remain. Export a backup and resolve the save error before signing out.');await api('/api/logout','POST',{});location.reload();}catch(e){content.querySelector('#account-error').textContent=e.message;}});return;
  }
  content.innerHTML='<div class="step-label">LOCAL ACCOUNT</div><h2>Keep your work beyond this browser.</h2><p class="intro">Create an account or sign in. Browser-only use remains available.</p><form id="account-form"><label for="username">Username</label><input id="username" autocomplete="username" required minlength="3" maxlength="40"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required minlength="12" maxlength="128"><p class="hint">Use 12 or more characters. This local version has no email verification or password-reset service.</p><label><input id="migrate-data" type="checkbox" style="width:auto"> For a new account, copy my current browser data into it.</label><div class="actions"><button type="submit">Sign in</button><button type="button" class="secondary" id="create-account">Create account</button></div></form><p id="account-error" class="error" role="alert"></p>';
  async function authenticate(register){try{
    if(state.activeSession)throw new Error('End and save your focus session before switching storage.');
    await api(register?'/api/register':'/api/login','POST',{username:content.querySelector('#username').value,password:content.querySelector('#password').value});
    if(register && content.querySelector('#migrate-data').checked){try{await api('/api/workspace','PUT',{data:state,revision:0});}catch(e){await api('/api/logout','POST',{});throw new Error('Account created, but migration failed. Browser data is unchanged. Sign in and restore a backup to retry. '+e.message);}}
    location.reload();
  }catch(e){content.querySelector('#account-error').textContent=e.message;}}
  content.querySelector('#account-form').addEventListener('submit',e=>{e.preventDefault();authenticate(false);});content.querySelector('#create-account').addEventListener('click',()=>authenticate(true));
}
import { parseBackup } from './backup-model.js';
