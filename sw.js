// Uklidni To — Service Worker
// Zvyš CACHE_VERSION při každé větší aktualizaci obsahu, aby si klienti stáhli nová data.
const CACHE_VERSION = 'v302';
const CACHE_NAME = `uklidnito-${CACHE_VERSION}`;

// Základní "app shell" — soubory nutné pro fungování appky offline.
// Uprav seznam podle skutečných souborů v repozitáři (ikony, screenshoty apod.).
const PRECACHE_URLS = [
  './',
  './index.html',
  './index-en.html',
  './caste-dotazy.html',
  './caste-dotazy-en.html',
  './clanky-o-dychani.html',
  './clanky-o-dychani-en.html',
  './doplnky.html',
  './doplnky-en.html',
  './jak-funguje-dechove-cviceni.html',
  './jak-funguje-dechove-cviceni-en.html',
  './privacy.html',
  './privacy-en.html',
  './techniky-dechu.html',
  './techniky-dechu-en.html',
  './rychla-cviceni-na-zklidneni.html',
  './rychla-cviceni-na-zklidneni-en.html',
  './manifest.json',
  './favicon-32.png',
  './favicon-16.png',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// Instalace nesmí spadnout kvůli jednomu chybějícímu souboru — cache.addAll()
// je "všechno nebo nic" a jediný 404/přesměrování v seznamu by shodil celou
// registraci service workera, což by zablokovalo i nabídku instalace PWA.
// Proto kešujeme soubory jednotlivě a chybějící jen ohlásíme do konzole.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Precache selhal pro', url, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('uklidnito-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clientsList) => {
        // Dej otevřeným tabům vědět, že běží nová verze — stránka si podle toho sama obnoví obsah.
        clientsList.forEach((client) => client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION }));
      })
  );
});

// Umožní stránce (index.html) vyžádat si okamžité převzetí kontroly novou verzí,
// pokud by z nějakého důvodu automatický skipWaiting() při instalaci nestačil.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Jen GET požadavky mají smysl kešovat.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Firebase (realtime počítadlo) a reklamy musí jít vždy na síť — nekešovat.
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebasedatabase.app') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('firebase')
  ) {
    return; // necháváme prohlížeč zpracovat normálně (network only)
  }

  // Navigace (otevření/refresh stránky): network-first s offline fallbackem na index.html.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Ostatní same-origin i cizí statické zdroje (fonty, ikony, ...) — stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          // Cache jen platné odpovědi (vyhneme se ukládání chyb/opaque odpovědí s problémy).
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
