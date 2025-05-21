//IMPORT
importScripts('js/sw-utils.js');

const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v2";
const INMUTABLE_CACHE = "inmutable-v1";


const APP_SHELL = [
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/sw-utils.js',
    '/img/favicon.ico',
    '/img/avatars/ironman.jpg',
    '/img/avatars/spiderman.jpg',
    '/img/avatars/thor.jpg',
    '/img/avatars/wolverine.jpg',
    '/img/avatars/hulk.jpg'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    '/css/animate.css',
    '/js/libs/jquery.js'
];

self.addEventListener('install', e => {
  const cacheStatic = caches.open(STATIC_CACHE)
    .then(cache => cache.addAll(APP_SHELL))
    .catch(err => console.error('STATIC_CACHE fallo:', err));

  const cacheInmutable = caches.open(INMUTABLE_CACHE)
    .then(cache => {
      const requests = APP_SHELL_INMUTABLE.map(url =>
        url.startsWith('http')
          ? new Request(url, { mode: 'no-cors' })
          : new Request(url, { mode: 'same-origin' })
      );
      return cache.addAll(requests);
    })
    .catch(err => console.error('INMUTABLE_CACHE fallo:', err));

  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});



self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        keys.forEach(key =>{
            if(key !== STATIC_CACHE && key.includes('static')){
                return caches.delete(key);
            }
            if(key !== DYNAMIC_CACHE && key.includes('dynamic')){
                return caches.delete(key);
            }
        });
    });
    e.waitUntil(respuesta);
});

self.addEventListener('fetch', e => {
    const respuestaRed = caches.match(e.request)
    .then(res => {
        if(res){
            return res;
        }else{
            return fetch(e.request).then(newResponse =>{
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newResponse);
            });
        }
    });
    e.respondWith(respuestaRed);
});