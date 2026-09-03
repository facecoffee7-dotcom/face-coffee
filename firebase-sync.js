/* ============================================================
   FIREBASE SYNC — capa opcional sobre data.js
   ------------------------------------------------------------
   CAMBIO CLAVE vs. la versión anterior: init() ya NO se debe
   esperar (await) antes de pintar la pantalla. Se llama
   "en paralelo" con el primer render (que usa lo que ya haya en
   localStorage) y, cuando Firestore responde, dispara el evento
   'fc-remote-ready' en window con { changed, online } para que
   la página se actualice solo si de verdad llegó algo nuevo.
   Esto es lo que arregla la demora de carga, sobre todo en
   celular: ya no hay pantalla en blanco esperando la red.
   ============================================================ *//* ============================================================
   FIREBASE SYNC — capa opcional sobre data.js
   ------------------------------------------------------------
   CAMBIO CLAVE vs. la versión anterior: init() ya NO se debe
   esperar (await) antes de pintar la pantalla. Se llama
   "en paralelo" con el primer render (que usa lo que ya haya en
   localStorage) y, cuando Firestore responde, dispara el evento
   'fc-remote-ready' en window con { changed, online } para que
   la página se actualice solo si de verdad llegó algo nuevo.
   Esto es lo que arregla la demora de carga, sobre todo en
   celular: ya no hay pantalla en blanco esperando la red.
   ============================================================ */
(function (global) {
  const DOC_PATH = { collection: 'facecoffee', doc: 'menu' };
  const SETTINGS_DOC = { collection: 'facecoffee', doc: 'settings' };

  async function pullFromFirestore(db, api) {
    const { doc, getDoc } = api;
    const [menuSnap, settingsSnap] = await Promise.all([
      getDoc(doc(db, DOC_PATH.collection, DOC_PATH.doc)),
      getDoc(doc(db, SETTINGS_DOC.collection, SETTINGS_DOC.doc)),
    ]);
    let changed = false;
    // Si justo se guardó algo local mientras esta lectura estaba en camino,
    // no la dejamos pisar ese guardado recién hecho.
    if (global.__FC_JUST_SAVED__) return false;
    if (menuSnap.exists()) {
      const remote = JSON.stringify(menuSnap.data());
      if (remote !== localStorage.getItem('facecoffee_menu_v1')) {
        localStorage.setItem('facecoffee_menu_v1', remote);
        changed = true;
      }
    }
    if (settingsSnap.exists()) {
      const remote = JSON.stringify(settingsSnap.data());
      if (remote !== localStorage.getItem('facecoffee_settings_v1')) {
        localStorage.setItem('facecoffee_settings_v1', remote);
        changed = true;
      }
    }
    return changed;
  }

  function pushToFirestore(db, api, kind, data) {
    const { doc, setDoc } = api;
    const target = kind === 'menu' ? DOC_PATH : SETTINGS_DOC;
    setDoc(doc(db, target.collection, target.doc), data).catch(
      (e) => console.error('FCSync push error', e)
    );
  }

  function watchRemoteChanges(db, api) {
    const { doc, onSnapshot } = api;
    onSnapshot(doc(db, DOC_PATH.collection, DOC_PATH.doc), (snap) => {
      if (!snap.exists()) return;
      const remote = JSON.stringify(snap.data());
      const local = localStorage.getItem('facecoffee_menu_v1');
      if (remote !== local) {
        localStorage.setItem('facecoffee_menu_v1', remote);
        if (!global.__FC_JUST_SAVED__) {
          global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: true, online: true } }));
        }
      }
    });
  }

  function patchFCData(db, api) {
    const origSaveData = global.FCData.saveData;
    global.FCData.saveData = function (data) {
      origSaveData(data);
      global.__FC_JUST_SAVED__ = true;
      pushToFirestore(db, api, 'menu', data);
      setTimeout(() => { global.__FC_JUST_SAVED__ = false; }, 800);
    };
    const origSaveSettings = global.FCData.saveSettings;
    global.FCData.saveSettings = function (s) {
      origSaveSettings(s);
      pushToFirestore(db, api, 'settings', s);
    };
  }

  // Fire-and-forget: la página que llama a esto NO debe hacerle await.
  async function init() {
    if (!global.FCCore || !global.FCCore.isConfigured()) {
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: false, online: false } }));
      return false;
    }
    try {
      const { db, firestoreApi: api } = await global.FCCore.core();
      // Activamos el parche ANTES de traer los datos: así, cualquier
      // guardado que hagas mientras la lectura inicial todavía está en
      // camino ya se sube a Firestore de inmediato, en vez de quedarse
      // solo en este navegador y luego ser pisado por la lectura vieja.
      patchFCData(db, api);
      const changed = await pullFromFirestore(db, api);
      watchRemoteChanges(db, api);
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed, online: true } }));
      console.info('[Face Coffee] Sincronización con Firebase activa.');
      return true;
    } catch (e) {
      console.error('[Face Coffee] No se pudo conectar a Firebase, usando localStorage:', e);
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: false, online: false } }));
      return false;
    }
  }

  global.FCSync = { init, isConfigured: () => !!(global.FCCore && global.FCCore.isConfigured()) };
})(window);

(function (global) {
  const DOC_PATH = { collection: 'facecoffee', doc: 'menu' };
  const SETTINGS_DOC = { collection: 'facecoffee', doc: 'settings' };

  async function pullFromFirestore(db, api) {
    const { doc, getDoc } = api;
    const [menuSnap, settingsSnap] = await Promise.all([
      getDoc(doc(db, DOC_PATH.collection, DOC_PATH.doc)),
      getDoc(doc(db, SETTINGS_DOC.collection, SETTINGS_DOC.doc)),
    ]);
    let changed = false;
    // Si justo se guardó algo local mientras esta lectura estaba en camino,
    // no la dejamos pisar ese guardado recién hecho.
    if (global.__FC_JUST_SAVED__) return false;
    if (menuSnap.exists()) {
      const remote = JSON.stringify(menuSnap.data());
      if (remote !== localStorage.getItem('facecoffee_menu_v1')) {
        localStorage.setItem('facecoffee_menu_v1', remote);
        changed = true;
      }
    }
    if (settingsSnap.exists()) {
      const remote = JSON.stringify(settingsSnap.data());
      if (remote !== localStorage.getItem('facecoffee_settings_v1')) {
        localStorage.setItem('facecoffee_settings_v1', remote);
        changed = true;
      }
    }
    return changed;
  }

  function pushToFirestore(db, api, kind, data) {
    const { doc, setDoc } = api;
    const target = kind === 'menu' ? DOC_PATH : SETTINGS_DOC;
    setDoc(doc(db, target.collection, target.doc), data).catch(
      (e) => console.error('FCSync push error', e)
    );
  }

  function watchRemoteChanges(db, api) {
    const { doc, onSnapshot } = api;
    onSnapshot(doc(db, DOC_PATH.collection, DOC_PATH.doc), (snap) => {
      if (!snap.exists()) return;
      const remote = JSON.stringify(snap.data());
      const local = localStorage.getItem('facecoffee_menu_v1');
      if (remote !== local) {
        localStorage.setItem('facecoffee_menu_v1', remote);
        if (!global.__FC_JUST_SAVED__) {
          global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: true, online: true } }));
        }
      }
    });
  }

  function patchFCData(db, api) {
    const origSaveData = global.FCData.saveData;
    global.FCData.saveData = function (data) {
      origSaveData(data);
      global.__FC_JUST_SAVED__ = true;
      pushToFirestore(db, api, 'menu', data);
      setTimeout(() => { global.__FC_JUST_SAVED__ = false; }, 800);
    };
    const origSaveSettings = global.FCData.saveSettings;
    global.FCData.saveSettings = function (s) {
      origSaveSettings(s);
      pushToFirestore(db, api, 'settings', s);
    };
  }

  // Fire-and-forget: la página que llama a esto NO debe hacerle await.
  async function init() {
    if (!global.FCCore || !global.FCCore.isConfigured()) {
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: false, online: false } }));
      return false;
    }
    try {
      const { db, firestoreApi: api } = await global.FCCore.core();
      // Activamos el parche ANTES de traer los datos: así, cualquier
      // guardado que hagas mientras la lectura inicial todavía está en
      // camino ya se sube a Firestore de inmediato, en vez de quedarse
      // solo en este navegador y luego ser pisado por la lectura vieja.
      patchFCData(db, api);
      const changed = await pullFromFirestore(db, api);
      watchRemoteChanges(db, api);
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed, online: true } }));
      console.info('[Face Coffee] Sincronización con Firebase activa.');
      return true;
    } catch (e) {
      console.error('[Face Coffee] No se pudo conectar a Firebase, usando localStorage:', e);
      global.dispatchEvent(new CustomEvent('fc-remote-ready', { detail: { changed: false, online: false } }));
      return false;
    }
  }

  global.FCSync = { init, isConfigured: () => !!(global.FCCore && global.FCCore.isConfigured()) };
})(window);
