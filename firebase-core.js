/* ============================================================
   FIREBASE CORE — inicializa Firebase UNA sola vez y lo comparte
   entre firebase-sync.js, firebase-orders.js y firebase-auth.js.
   No bloquea nada: solo se conecta a la red cuando algo llama a
   FCCore.core(); index.html/admin.html pintan con localStorage
   primero y esto llega después, en segundo plano.

   CAMBIO: Firestore usa por defecto una conexión "streaming"
   (WebChannel) que muchos antivirus con inspección de tráfico
   cifrado (Kaspersky, ESET, etc.) o redes corporativas cortan,
   aunque el resto de internet funcione bien — el síntoma es
   "Failed to get document because the client is offline" con
   internet normal. Forzamos long-polling (peticiones HTTPS
   normales repetidas) en vez de streaming: es un poco más lento
   pero evita ese bloqueo casi siempre. Afecta tanto al admin
   como a clientes que abran index.html detrás de un antivirus
   parecido.
   ============================================================ */
(function (global) {
  function isConfigured() {
    const c = global.__FIREBASE_CONFIG__;
    return !!(c && c.apiKey && !String(c.apiKey).startsWith('TU_'));
  }

  let corePromise = null;
  function core() {
    if (!isConfigured()) return Promise.resolve(null);
    if (!corePromise) {
      corePromise = (async () => {
        const [{ initializeApp }, firestoreApi] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js'),
        ]);
        const app = initializeApp(global.__FIREBASE_CONFIG__);
        const db = firestoreApi.initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
          useFetchStreams: false,
        });
        return { app, db, firestoreApi };
      })();
    }
    return corePromise;
  }

  global.FCCore = { isConfigured, core };
})(window);
