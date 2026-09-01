/* ============================================================
   FIREBASE ORDERS — pedidos (para Cocina/Caja) y sellos de
   fidelidad. Usa FCCore (mismo proyecto/app que firebase-sync).
   Si Firebase no está configurado, todas las funciones devuelven
   valores "vacíos" sin romper nada (el sitio sigue funcionando
   solo con WhatsApp, como antes).
   ============================================================ */
(function (global) {
  const ORDERS_COL = 'orders';
  const LOYALTY_COL = 'loyalty';

  async function getCore() {
    if (!global.FCCore || !global.FCCore.isConfigured()) return null;
    return global.FCCore.core();
  }

  // order: { items:[{id,name,qty,price}], subtotal, discount, couponCode, total, phone }
  async function createOrder(order) {
    const core = await getCore();
    if (!core) return null;
    const { db, firestoreApi: f } = core;
    const ref = await f.addDoc(f.collection(db, ORDERS_COL), {
      ...order,
      status: 'pendiente',
      createdAt: Date.now(),
    });
    return ref.id;
  }

  // cb(orders[]) — se llama cada vez que cambian los pedidos (tiempo real)
  function listenOrders(cb) {
    getCore().then((core) => {
      if (!core) { cb([]); return; }
      const { db, firestoreApi: f } = core;
      const q = f.query(f.collection(db, ORDERS_COL), f.orderBy('createdAt', 'desc'));
      f.onSnapshot(q, (snap) => {
        const orders = [];
        snap.forEach((d) => orders.push({ id: d.id, ...d.data() }));
        cb(orders);
      }, (err) => { console.error('FCOrders.listenOrders', err); cb([]); });
    });
  }

  async function updateOrderStatus(id, status) {
    const core = await getCore();
    if (!core) return;
    const { db, firestoreApi: f } = core;
    await f.updateDoc(f.doc(db, ORDERS_COL, id), { status });
  }

  async function getStamps(phone) {
    const core = await getCore();
    if (!core || !phone) return 0;
    const { db, firestoreApi: f } = core;
    const snap = await f.getDoc(f.doc(db, LOYALTY_COL, phone));
    return snap.exists() ? (snap.data().stamps || 0) : 0;
  }

  async function addStamp(phone) {
    const core = await getCore();
    if (!core || !phone) return 0;
    const { db, firestoreApi: f } = core;
    const ref = f.doc(db, LOYALTY_COL, phone);
    const snap = await f.getDoc(ref);
    const next = (snap.exists() ? (snap.data().stamps || 0) : 0) + 1;
    await f.setDoc(ref, { phone, stamps: next, updatedAt: Date.now() });
    return next;
  }

  async function setStamps(phone, stamps) {
    const core = await getCore();
    if (!core || !phone) return;
    const { db, firestoreApi: f } = core;
    await f.setDoc(f.doc(db, LOYALTY_COL, phone), { phone, stamps: Number(stamps) || 0, updatedAt: Date.now() });
  }

  global.FCOrders = { createOrder, listenOrders, updateOrderStatus, getStamps, addStamp, setStamps };
})(window);
