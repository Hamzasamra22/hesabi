// نسخة الكاش: غيّر الرقم عند كل تحديث للملفات. بيانات المستخدم في localStorage ولا يلمسها هذا الملف.
const V = 'hesabi-v1';
const CORE = ['./', 'index.html', 'manifest.json', 'hesabi-icon-192.png', 'hesabi-icon-512.png', 'hesabi-maskable-512.png', 'hesabi-apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n.startsWith('hesabi-') && n !== V).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); }
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
