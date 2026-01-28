/* Minimal service worker scaffold for offline caching and background sync */

const COURSE_CACHE = 'course-zips'
const APP_CACHE = 'app-static'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(['/']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/offline/')) {
    event.respondWith(
      caches.open(COURSE_CACHE).then((cache) => cache.match(event.request)).then((res) => res || fetch(event.request))
    )
    return
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'progress-sync') {
    event.waitUntil((async () => {
      // TODO: read local progress and POST to backend
    })())
  }
})
