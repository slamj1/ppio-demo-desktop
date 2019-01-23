import session from 'electron'

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        'script-src "self" https://www.google-analytics.com https://www.googletagmanager.com; object-src "self"',
      ],
    },
  })
})
