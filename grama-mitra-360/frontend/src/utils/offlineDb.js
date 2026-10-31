// IndexedDB: 'kv' holds the downloaded verified bundle; 'queue' holds support requests made offline (each already has user consent).
const open = () => new Promise((res, rej) => {
  const r = indexedDB.open('gm360_offline', 1);
  r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('queue', { keyPath: 'localId' }); };
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const tx = async (store, mode, fn) => {
  const db = await open();
  return new Promise((res, rej) => { const t = db.transaction(store, mode); const req = fn(t.objectStore(store)); t.oncomplete = () => res(req?.result); t.onerror = () => rej(t.error); });
};
export const saveBundle = (b) => tx('kv', 'readwrite', s => s.put(b, 'bundle'));
export const loadBundle = () => tx('kv', 'readonly', s => s.get('bundle'));
export const queueTicket = (t) => tx('queue', 'readwrite', s => s.put(t));
export const listQueue = () => tx('queue', 'readonly', s => s.getAll());
export const removeQueued = (id) => tx('queue', 'readwrite', s => s.delete(id));
