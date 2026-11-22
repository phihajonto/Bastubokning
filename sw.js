// Bastubokning service worker: visar pushnotiser och öppnar appen när man trycker på en.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { body: e.data && e.data.text() }; }
  const title = data.title || "Bastubokning";
  const body = data.body || "Något har hänt i bastukalendern.";
  // Visa alltid en notis: iPhone stänger tyst av notiser för appar som tar emot push utan att visa något.
  e.waitUntil(
    self.registration.showNotification(title, { body, tag: data.tag || "bastu" })
      .catch(() => self.registration.showNotification(title, { body }))
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    // Other apps can share the site; only focus a window that belongs to this app.
    for (const c of list) if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
    return self.clients.openWindow("./");
  }));
});
