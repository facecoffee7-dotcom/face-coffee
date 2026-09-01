/* ============================================================
   FACE COFFEE — Capa de datos
   Hoy: localStorage (funciona ya, sin backend), sincronizado
   opcionalmente a Firestore por firebase-sync.js.
   ============================================================ */
(function (global) {
  const STORAGE_KEY = 'facecoffee_menu_v1';
  const SETTINGS_KEY = 'facecoffee_settings_v1';

  const uid = () => 'p_' + Math.random().toString(36).slice(2, 10);

  const DEFAULT_DATA = {
    categories: [
      { id: 'pal-frio',    name: 'Pal Frío',    icon: '🧊', order: 0, active: true },
      { id: 'pal-calor',   name: 'Pal Calor',   icon: '☕', order: 1, active: true },
      { id: 'crepas',      name: 'Crepas',      icon: '🥞', order: 2, active: true },
      { id: 'frappe',      name: 'Frappé',      icon: '🥤', order: 3, active: true },
      { id: 'milkshake',   name: 'Milkshake',   icon: '🍦', order: 4, active: true },
      { id: 'micheladas',  name: 'Micheladas',  icon: '🍺', order: 5, active: true },
      { id: 'cervezas',    name: 'Cervezas',    icon: '🍻', order: 6, active: true },
      { id: 'agua',        name: 'Agua',        icon: '💧', order: 7, active: true },
      { id: 'cocteles',    name: 'Cócteles',    icon: '🍹', order: 8, active: true },
    ],
    products: [
      { id: 'espresso',    categoryId: 'pal-calor', name: 'Espresso',   description: 'Espresso de finca, extracción corta.', price: 1.75, image: '', order: 0, active: true },
      { id: 'americano',   categoryId: 'pal-calor', name: 'Americano',  description: 'Espresso alargado con agua.',          price: 2.00, image: '', order: 1, active: true },
      { id: 'capuchino',   categoryId: 'pal-calor', name: 'Capuchino',  description: 'Espresso, leche vaporizada y espuma.', price: 2.50, image: '', order: 2, active: true },
      { id: 'mocachino',   categoryId: 'pal-calor', name: 'Mocachino',  description: 'Espresso, chocolate y leche vaporizada.', price: 2.75, image: '', order: 3, active: true },
      { id: 'iced-latte',  categoryId: 'pal-frio', name: 'Iced Latte',   description: 'Espresso, leche fría y hielo.',      price: 2.50, image: '', order: 0, active: true },
      { id: 'cold-brew',   categoryId: 'pal-frio', name: 'Cold Brew 220', description: 'Infusión en frío 18h, baja acidez, dulzor natural.', price: 3.00, image: '', order: 1, active: true },
      { id: 'crepa-durazno',  categoryId: 'crepas', name: 'Crepa Durazno',  description: 'Crepa, fresas, durazno, chantilly.', price: 2.25, image: '', order: 0, active: true },
      { id: 'crepa-arandano', categoryId: 'crepas', name: 'Crepa Arándano', description: 'Crepas, Nutella, arándanos.',        price: 2.50, image: '', order: 1, active: true },
      { id: 'crepa-kiwi',     categoryId: 'crepas', name: 'Crepa Kiwi',     description: 'Crepas, Nutella, kiwi.',             price: 2.25, image: '', order: 2, active: true },
      { id: 'frappe-vainilla',   categoryId: 'frappe', name: 'Frappé Vainilla',      description: 'Base fría batida con toque dulce y aromático de vainilla, mezclada con hielo triturado.', price: 2.75, image: '', order: 0, active: true },
      { id: 'frappe-oreo',       categoryId: 'frappe', name: 'Frappé Oreo',          description: 'Batido cremoso con trozos de galleta Oreo, mezclado con leche fría y sirope.',          price: 2.75, image: '', order: 1, active: true },
      { id: 'frappe-frutos',     categoryId: 'frappe', name: 'Frappé Frutos Rojos',  description: 'Refrescante y natural, mezcla de fresas, moras y arándanos.',                          price: 3.00, image: '', order: 2, active: true },
      { id: 'frappe-pinacolada', categoryId: 'frappe', name: 'Frappé Piña Colada',   description: 'Combinación tropical de piña y el toque cremoso del coco.',                            price: 2.75, image: '', order: 3, active: true },
      { id: 'milk-vainillacaramelo', categoryId: 'milkshake', name: 'Milkshake Vainilla con Caramelo', description: 'Helado de leche cremoso, esencia de vainilla, leche y jarabe de caramelo dulce.', price: 3.00, image: '', order: 0, active: true },
      { id: 'milk-oreo',             categoryId: 'milkshake', name: 'Milkshake Oreo',                  description: 'Helado, combinado con trozos de galleta Oreo.',                                   price: 2.75, image: '', order: 1, active: true },
      { id: 'milk-fresa',            categoryId: 'milkshake', name: 'Milkshake Fresa',                 description: 'Helado, base cremosa de leche y puré concentrado de fresa natural.',              price: 2.75, image: '', order: 2, active: true },
      { id: 'milk-chocobanana',      categoryId: 'milkshake', name: 'Milkshake Choco Banana',          description: 'Base cremosa, plátano maduro y jarabe de chocolate.',                             price: 3.00, image: '', order: 3, active: true },
      { id: 'mich-limon',    categoryId: 'micheladas', name: 'Michelada Limón',    description: 'Base de cerveza, jugo de limón, sal y escarchado clásico.',            price: 2.75, image: '', order: 0, active: true },
      { id: 'mich-pina',     categoryId: 'micheladas', name: 'Michelada Piña',     description: 'Sirop de cerveza, pulpa de piña, limón y escarchado frutal.',          price: 3.00, image: '', order: 1, active: true },
      { id: 'mich-maracuya', categoryId: 'micheladas', name: 'Michelada Maracuyá', description: 'Base de cerveza, pulpa concentrada de maracuyá, limón y sal.',        price: 3.00, image: '', order: 2, active: true },
      { id: 'mich-mango',    categoryId: 'micheladas', name: 'Michelada Mango',    description: 'Base de cerveza, pulpa de mango, jugo de limón y escarchado frutal.', price: 3.00, image: '', order: 3, active: true },
      { id: 'cerv-corona',   categoryId: 'cervezas', name: 'Corona 355ml',   description: 'Cerveza clara.',   price: 3.00, image: '', order: 0, active: true },
      { id: 'cerv-club',     categoryId: 'cervezas', name: 'Club 330ml',     description: 'Cerveza clara.',   price: 2.00, image: '', order: 1, active: true },
      { id: 'cerv-heineken', categoryId: 'cervezas', name: 'Heineken 330ml', description: 'Cerveza lager.',   price: 2.00, image: '', order: 2, active: true },
      { id: 'agua-vivant', categoryId: 'agua', name: 'Agua Vivant 600ml', description: 'Agua sin gas.', price: 0.50, image: '', order: 0, active: true },
      { id: 'sex-beach',     categoryId: 'cocteles', name: 'Sex on the Beach', description: 'Vodka, durazno, arándano, naranja.', price: 3.50, image: '', order: 0, active: true },
      { id: 'moscow-mule',   categoryId: 'cocteles', name: 'Moscow Mule',      description: 'Vodka, ginger beer, limón.',         price: 3.50, image: '', order: 1, active: true },
      { id: 'black-russian', categoryId: 'cocteles', name: 'Black Russian',    description: 'Vodka, licor de café.',              price: 3.50, image: '', order: 2, active: true },
      { id: 'cuba-libre',    categoryId: 'cocteles', name: 'Cuba Libre',       description: 'Ron, cola, limón.',                  price: 3.50, image: '', order: 3, active: true },
      { id: 'daiquiri',      categoryId: 'cocteles', name: 'Daiquiri Clásico', description: 'Ron, limón, azúcar.',                price: 3.75, image: '', order: 4, active: true },
      { id: 'paloma',        categoryId: 'cocteles', name: 'Paloma',           description: 'Tequila, toronja, limón.',           price: 4.00, image: '', order: 5, active: true },
    ],
    coupons: [],
  };

  const DEFAULT_SETTINGS = {
    whatsapp: '593963650750',
    businessName: 'Face Coffee',
    tagline: 'Café de especialidad nacido a 220 msnm',
    address: 'La Maná, Cotopaxi, Ecuador',
    hours: 'Lun–Dom · 8:00–20:00',
    instagram: '@ffacecoffee',
    couponDescription: 'Escribe tu código al momento de pagar y obtén tu descuento al instante.',
    loyaltyEnabled: true,
    loyaltyDescription: 'Por cada pedido que hagas ganas 1 sello. Junta los sellos y canjea tu recompensa.',
    loyaltyStampsGoal: 10,
    loyaltyReward: 'Un café gratis',
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { saveData(DEFAULT_DATA); return structuredClone(DEFAULT_DATA); }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.coupons)) parsed.coupons = [];
      return parsed;
    } catch (e) { console.error('FCData.loadData', e); return structuredClone(DEFAULT_DATA); }
  }
  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) { saveSettings(DEFAULT_SETTINGS); return structuredClone(DEFAULT_SETTINGS); }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) { return structuredClone(DEFAULT_SETTINGS); }
  }
  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  // ---------- Categorías ----------
  function addCategory(name, icon) {
    const data = loadData();
    const id = 'cat_' + Math.random().toString(36).slice(2, 8);
    const order = data.categories.length;
    data.categories.push({ id, name, icon: icon || '🍽️', order, active: true });
    saveData(data);
    return data;
  }
  function updateCategory(id, patch) {
    const data = loadData();
    const c = data.categories.find(c => c.id === id);
    if (c) Object.assign(c, patch);
    saveData(data);
    return data;
  }
  function deleteCategory(id) {
    const data = loadData();
    data.categories = data.categories.filter(c => c.id !== id);
    data.products = data.products.filter(p => p.categoryId !== id);
    saveData(data);
    return data;
  }
  function reorderCategories(orderedIds) {
    const data = loadData();
    orderedIds.forEach((id, i) => {
      const c = data.categories.find(c => c.id === id);
      if (c) c.order = i;
    });
    saveData(data);
    return data;
  }

  // ---------- Productos ----------
  function addProduct(categoryId, product) {
    const data = loadData();
    const id = uid();
    const order = data.products.filter(p => p.categoryId === categoryId).length;
    data.products.push({
      id, categoryId,
      name: product.name || 'Nuevo producto',
      description: product.description || '',
      price: Number(product.price) || 0,
      image: product.image || '',
      order, active: true,
    });
    saveData(data);
    return data;
  }
  function updateProduct(id, patch) {
    const data = loadData();
    const p = data.products.find(p => p.id === id);
    if (p) Object.assign(p, patch, { price: patch.price !== undefined ? Number(patch.price) : p.price });
    saveData(data);
    return data;
  }
  function deleteProduct(id) {
    const data = loadData();
    data.products = data.products.filter(p => p.id !== id);
    saveData(data);
    return data;
  }
  function reorderProductsInCategory(categoryId, orderedIds) {
    const data = loadData();
    orderedIds.forEach((id, i) => {
      const p = data.products.find(p => p.id === id);
      if (p) p.order = i;
    });
    saveData(data);
    return data;
  }
  function moveProductToCategory(productId, newCategoryId, newIndex) {
    const data = loadData();
    const p = data.products.find(p => p.id === productId);
    if (!p) return data;
    p.categoryId = newCategoryId;
    const siblings = data.products.filter(x => x.categoryId === newCategoryId && x.id !== productId)
      .sort((a, b) => a.order - b.order);
    siblings.splice(newIndex, 0, p);
    siblings.forEach((s, i) => { s.order = i; });
    saveData(data);
    return data;
  }

  // ---------- Cupones ----------
  function addCoupon(coupon) {
    const data = loadData();
    const id = 'cp_' + Math.random().toString(36).slice(2, 8);
    data.coupons.push({
      id,
      code: (coupon.code || '').trim().toUpperCase(),
      type: coupon.type === 'fixed' ? 'fixed' : 'percent', // 'percent' | 'fixed'
      value: Number(coupon.value) || 0,
      active: coupon.active !== false,
    });
    saveData(data);
    return data;
  }
  function updateCoupon(id, patch) {
    const data = loadData();
    const c = data.coupons.find(c => c.id === id);
    if (c) {
      Object.assign(c, patch);
      if (patch.code !== undefined) c.code = String(patch.code).trim().toUpperCase();
      if (patch.value !== undefined) c.value = Number(patch.value) || 0;
    }
    saveData(data);
    return data;
  }
  function deleteCoupon(id) {
    const data = loadData();
    data.coupons = data.coupons.filter(c => c.id !== id);
    saveData(data);
    return data;
  }
  function findActiveCoupon(code) {
    const data = loadData();
    const norm = (code || '').trim().toUpperCase();
    if (!norm) return null;
    return data.coupons.find(c => c.active && c.code === norm) || null;
  }

  function resetToDefaults() {
    saveData(structuredClone(DEFAULT_DATA));
    saveSettings(structuredClone(DEFAULT_SETTINGS));
    return loadData();
  }

  global.FCData = {
    loadData, saveData, loadSettings, saveSettings,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    addProduct, updateProduct, deleteProduct, reorderProductsInCategory, moveProductToCategory,
    addCoupon, updateCoupon, deleteCoupon, findActiveCoupon,
    resetToDefaults,
  };
})(window);
