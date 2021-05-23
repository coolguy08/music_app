self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open('muskan').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/main.js',
          '/main.css',
          '/manifest.json',
          '/logo512.png',
          '/favicon.ico'
          
        ]);
      })
    );
   });


   self.addEventListener('fetch', function(event) {
    console.log(event.request.url);
   
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
   });