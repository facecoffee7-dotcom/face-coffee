/* ============================================================
   FIREBASE AUTH — login del panel admin. Solo lo carga admin.html
   (index.html NO lo necesita, así el sitio público no descarga
   peso extra por esto). El SDK de Auth se importa recién cuando
   se usa, no al cargar la página.
   ============================================================ */
(function (global) {
  let authApi = null;
  let authInst = null;

  async function ensure() {
    if (authInst) return { authApi, authInst };
    const core = await global.FCCore.core();
    if (!core) return null;
    authApi = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js');
    authInst = authApi.getAuth(core.app);
    return { authApi, authInst };
  }

  async function login(email, password) {
    const a = await ensure();
    if (!a) throw new Error('Firebase no está configurado.');
    return a.authApi.signInWithEmailAndPassword(a.authInst, email, password);
  }

  async function logout() {
    const a = await ensure();
    if (!a) return;
    return a.authApi.signOut(a.authInst);
  }

  // cb(user | null) — se llama al iniciar y cada vez que cambia la sesión
  function onAuthChange(cb) {
    ensure().then((a) => {
      if (!a) { cb(null); return; }
      a.authApi.onAuthStateChanged(a.authInst, (user) => cb(user));
    }).catch((e) => { console.error('FCAuth.onAuthChange', e); cb(null); });
  }

  global.FCAuth = { login, logout, onAuthChange };
})(window);
