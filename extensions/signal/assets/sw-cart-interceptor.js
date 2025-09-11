// Service Worker for Cart Add.js Interception
// This is an alternative approach to intercept cart/add.js requests

const CACHE_NAME = 'signal-cart-interceptor-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Signal: Service Worker installed')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Signal: Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// Fetch event - intercept cart/add.js requests
self.addEventListener('fetch', (event) => {
  if (
    event.request.url.includes('/cart/add.js') &&
    event.request.method === 'POST'
  ) {
    event.respondWith(
      (async () => {
        try {
          // Clone the request to read the body
          const reqClone = event.request.clone()
          const body = await reqClone.text()

          // Parse the JSON payload
          let payload = JSON.parse(body)

          // Check if properties are missing
          if (!payload.properties || !payload.properties.__si_exp) {
            console.log(
              'Signal: Service Worker intercepting cart/add.js - adding missing properties'
            )

            // Get user ID and experiment data from storage
            const userId = 'anonymous' // You might want to get this from storage or other means
            const experimentString = '' // You might want to get this from storage

            // Add required properties
            payload.properties = {
              ...payload.properties,
              __si_ud: userId,
              __si_exp: JSON.stringify({
                __si_ud: userId,
                __si_p: null,
                __si_d: null,
                __si_exp: experimentString
              })
            }

            console.log(
              'Signal: Service Worker modified cart payload:',
              payload
            )

            // Create new request with modified body
            const modifiedRequest = new Request(event.request.url, {
              method: 'POST',
              headers: event.request.headers,
              body: JSON.stringify(payload)
            })

            return fetch(modifiedRequest)
          }

          // If properties are already present, proceed with original request
          return fetch(event.request)
        } catch (error) {
          console.error('Signal: Service Worker interceptor error:', error)
          // Fallback to original request
          return fetch(event.request)
        }
      })()
    )
  }
})

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SIGNAL_UPDATE_USER_DATA') {
    // Handle user data updates if needed
    console.log('Signal: Service Worker received user data update:', event.data)
  }
})
