/* ============================================================
   FIREBASE SYNC — capa opcional sobre data.js
   ------------------------------------------------------------
   Mientras firebase-config.js tenga los valores "TU_..." de
   ejemplo, esta capa NO hace nada y el sitio sigue funcionando
   100% con localStorage, como ahora.

   En cuanto pegues tus llaves reales de un proyecto Firebase:
   - Al cargar la página, trae el menú guardado en Firestore
     (si existe) y lo copia a localStorage antes de pintar la UI.
   - Cada vez que el admin guarda un cambio (FCData.saveData /
     saveSettings), además de guardar en localStorage, lo sube
     a Firestore.
   - Escucha cambios en tiempo real: si editas el menú desde OTRO
     dispositivo, este recarga solo para reflejarlo.

   No necesitas tocar index.html ni admin.html más allá de agregar
   estas dos líneas (ver INSTALAR.md), y ellos siguen llamando a
   FCData.loadData()/saveData() exactamente igual que hoy.
   ============================================================ */
(function (global) {
  const DOC_PATH = { collection: 'facecoffee', doc: 'menu' };
  const SETTINGS_DOC = { collection: 'facecoffee', doc: 'settings' };

  function isConfigured() {
    const c = global.__FIREBASE_CONFIG__;
    return c && c.apiKey && !String(c.apiKey).startsWith('TU_');
  }

  let dbRef = null;
  let firestoreApi = null;

  async function loadSdk() {
    const [{ initializeApp }, firestore] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js'),
    ]);
    firestoreApi = firestore;
    const app = initializeApp(global.__FIREBASE_CONFIG__);
    dbRef = firestore.getFirestore(app);
  }

  async function pullFromFirestore() {
    const { doc, getDoc } = firestoreApi;
    const menuSnap = await getDoc(doc(dbRef, DOC_PATH.collection, DOC_PATH.doc));
    if (menuSnap.exists()) {
      localStorage.setItem('facecoffee_menu_v1', JSON.stringify(menuSnap.data()));
    }
    const settingsSnap = await getDoc(doc(dbRef, SETTINGS_DOC.collection, SETTINGS_DOC.doc));
    if (settingsSnap.exists()) {
      localStorage.setItem('facecoffee_settings_v1', JSON.stringify(settingsSnap.data()));
    }
  }

  function pushToFirestore(kind, data) {
    if (!dbRef) return;
    const { doc, setDoc } = firestoreApi;
    const target = kind === 'menu' ? DOC_PATH : SETTINGS_DOC;
    setDoc(doc(dbRef, target.collection, target.doc), data).catch(
      (e) => console.error('FCSync push error', e)
    );
  }

  function watchRemoteChanges() {
    const { doc, onSnapshot } = firestoreApi;
    onSnapshot(doc(dbRef, DOC_PATH.collection, DOC_PATH.doc), (snap) => {
      if (!snap.exists()) return;
      const remote = JSON.stringify(snap.data());
      const local = localStorage.getItem('facecoffee_menu_v1');
      if (remote !== local) {
        localStorage.setItem('facecoffee_menu_v1', remote);
        // Evita recargar en el mismo tab que acaba de escribir (loop).
        if (!global.__FC_JUST_SAVED__) location.reload();
      }
    });
  }

  function patchFCData() {
    const origSaveData = global.FCData.saveData;
    global.FCData.saveData = function (data) {
      origSaveData(data);
      global.__FC_JUST_SAVED__ = true;
      pushToFirestore('menu', data);
      setTimeout(() => { global.__FC_JUST_SAVED__ = false; }, 800);
    };
    const origSaveSettings = global.FCData.saveSettings;
    global.FCData.saveSettings = function (s) {
      origSaveSettings(s);
      pushToFirestore('settings', s);
    };
  }

  async function init() {
    if (!isConfigured()) return false; // sigue en modo localStorage puro
    try {
      await loadSdk();
      await pullFromFirestore();
      patchFCData();
      watchRemoteChanges();
      console.info('[Face Coffee] Sincronización con Firebase activa.');
      return true;
    } catch (e) {
      console.error('[Face Coffee] No se pudo conectar a Firebase, usando localStorage:', e);
      return false;
    }
  }

  global.FCSync = { init, isConfigured };
})(window);
