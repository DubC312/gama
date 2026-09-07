const CACHE_NAME='gamer-mathe-v3';
const FILES=['./','./index.html','./cards.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);

  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }

  if(u.origin===location.origin && u.pathname.endsWith('/cards.json')){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(r=>{
        const copy=r.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  if(u.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});