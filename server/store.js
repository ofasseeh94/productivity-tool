import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const digest = token => createHash('sha256').update(token).digest('hex');
export class Store {
  constructor(path) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS documents(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, revision INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS snapshots(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, revision INTEGER NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(user_id,revision));`);
  }
  async register(username, password) {
    username = String(username || '').trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,40}$/.test(username)) throw new Error('Choose a username of 3–40 letters, numbers, underscores, or hyphens.');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error('Use a password of 8–128 characters.');
    const salt = randomBytes(16).toString('hex');
    const hash = (await derive(password, salt, 64, { N:32768, r:8, p:1, maxmem:64*1024*1024 })).toString('hex');
    const id = randomUUID();
    try { this.db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(id,username,salt,hash); }
    catch { throw new Error('That username is unavailable.'); }
    return { id, username };
  }
  async login(username, password) {
    if (typeof password !== 'string' || password.length > 128) return null;
    const user = this.db.prepare('SELECT * FROM users WHERE username=?').get(String(username || '').trim().toLowerCase());
    const hash = await derive(password, user?.salt || 'invalid-user-salt', 64, { N:32768,r:8,p:1,maxmem:64*1024*1024 });
    if (!user || !timingSafeEqual(hash, Buffer.from(user.hash,'hex'))) return null;
    return { id:user.id, username:user.username };
  }
  session(userId, now=Date.now()) {
    this.db.prepare('DELETE FROM sessions WHERE expires < ?').run(now);
    const token = randomBytes(32).toString('hex');
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token),userId,now+7*86400000);
    return token;
  }
  authenticate(token, now=Date.now()) {
    if (!token) return null;
    return this.db.prepare('SELECT users.id,users.username FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?').get(digest(token),now) || null;
  }
  logout(token) { if (token) this.db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token)); }
  deleteAccount(userId) { this.db.prepare('DELETE FROM users WHERE id=?').run(userId); }
  read(userId) {
    const row = this.db.prepare('SELECT body,revision FROM documents WHERE user_id=?').get(userId);
    return row ? { data:JSON.parse(row.body),revision:row.revision } : {data:null,revision:0};
  }
  save(userId, data, revision) {
    const body = JSON.stringify(data); this.db.exec('BEGIN IMMEDIATE');
    try {
      const current = this.db.prepare('SELECT revision FROM documents WHERE user_id=?').get(userId)?.revision || 0;
      if (current !== revision) { const error = new Error('Data changed in another session. Reload before saving.'); error.status=409; throw error; }
      this.db.prepare('INSERT INTO documents VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET body=excluded.body,revision=excluded.revision').run(userId,body,current+1);
      this.db.prepare('INSERT INTO snapshots VALUES(?,?,?,?)').run(userId,current+1,body,Date.now());
      this.db.prepare('DELETE FROM snapshots WHERE user_id=? AND revision NOT IN (SELECT revision FROM snapshots WHERE user_id=? ORDER BY revision DESC LIMIT 20)').run(userId,userId);
      this.db.exec('COMMIT'); return current+1;
    } catch(error) { this.db.exec('ROLLBACK'); throw error; }
  }
  history(userId) { return this.db.prepare('SELECT revision,created_at FROM snapshots WHERE user_id=? ORDER BY revision DESC').all(userId); }
  snapshot(userId, revision) { const row=this.db.prepare('SELECT body FROM snapshots WHERE user_id=? AND revision=?').get(userId,revision); return row ? JSON.parse(row.body) : null; }
  close() { this.db.close(); }
}
