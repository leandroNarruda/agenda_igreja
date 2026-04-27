if ('serviceWorker' in navigator) {
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const isHttps = window.location.protocol === 'https:';

  if (isLocalhost || isHttps) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        setInterval(() => registration.update(), 60000);
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NEW_VERSION') {
          window.location.reload();
        }
      });
    });
  }
}
