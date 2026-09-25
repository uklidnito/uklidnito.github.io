// Uklidni To — Service Worker
// Zvyš CACHE_VERSION při každé větší aktualizaci obsahu, aby si klienti stáhli nová data.
const CACHE_VERSION = 'v331';
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

// Cizí zdroje, které má smysl kešovat (neměnné soubory potřebné i offline).
// Všechno ostatní cizí (GoatCounter, reCAPTCHA, Firebase API, Gumroad…) jde vždy
// rovnou na síť - kešování by jen zbytečně plnilo úložiště a mohlo vracet stará data.
function isCacheableCrossOrigin(url) {
  return url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Jen GET požadavky mají smysl kešovat.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin && !isCacheableCrossOrigin(url)) {
    return; // necháváme prohlížeč zpracovat normálně (network only)
  }

  // Navigace (otevření/refresh stránky): network-first s offline fallbackem.
  // Klíč bez ?parametrů (utm, fbclid…), ať se jedna stránka neukládá mnohokrát.
  if (req.mode === 'navigate') {
    const pageKey = url.origin + url.pathname;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(pageKey, resClone));
          }
          return res;
        })
        .catch(() =>
          caches.match(pageKey).then((cached) =>
            cached || caches.match(/-en(\.html)?$/.test(url.pathname) ? './index-en.html' : './index.html')
          )
        )
    );
    return;
  }

  // Ostatní statické zdroje (ikony, fonty, Firebase SDK…) — stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          // Cache jen platné odpovědi. CSS z Google Fonts přichází jako "opaque"
          // (bez stavového kódu) - to jediné bereme i tak, ať fonty fungují offline.
          const ok = res && (res.status === 200 || (res.type === 'opaque' && url.hostname === 'fonts.googleapis.com'));
          if (ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached || Response.error());

      return cached || fetchPromise;
    })
  );
});
