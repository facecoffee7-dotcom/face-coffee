# Pasos para activar login, cocina, caja, cupón y fidelidad

Todo el código ya está listo en los archivos. Faltan 4 pasos en la
**consola de Firebase** (console.firebase.google.com), una sola vez.

⚠️ **Antes que nada**: confirma que el proyecto que usas ahora mismo en la
consola es `face-coffee-bfaab` (el que está en `firebase-config.js`). Si
usas otro proyecto, avísame para actualizar las credenciales.

## 1. Activar el login (Authentication)
1. En tu proyecto → menú lateral → **Authentication** → **Get started**.
2. Pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
3. Pestaña **Users** → **Add user** → escribe el correo y la contraseña
   con la que vas a entrar al admin (ej. `admin@facecoffee.com`).
   Esa es la cuenta que usarás para entrar desde cualquier dispositivo.

## 2. Activar Storage (para las fotos de productos)
1. Menú lateral → **Storage** → **Get started** → acepta las opciones
   por defecto (modo producción, misma región que Firestore).

## 3. Reglas de Firestore
Firestore → pestaña **Reglas** → reemplaza todo por esto → **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /facecoffee/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /loyalty/{phone} {
      allow read, write: if true;
    }
  }
}
```

Esto significa: cualquiera puede **ver** el menú y **crear** un pedido
(necesario para que index.html funcione sin login), pero solo alguien
que inició sesión (el admin) puede **editar** el menú o **ver/gestionar**
los pedidos de la cocina y la caja.

> Nota sobre `loyalty`: por ahora lectura/escritura son públicas para
> que el sitio pueda sumar sellos sin pedir login al cliente. Es un
> punto razonable para empezar; asegurarlo del todo requeriría una
> Cloud Function, que ya necesita el plan de pago (Blaze) de Firebase.

## 4. Reglas de Storage
Storage → pestaña **Reglas** → reemplaza por esto → **Publicar**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Listo
Después de esos 4 pasos:
- `admin.html` te va a pedir correo y contraseña (los que creaste en el paso 1).
- Arrastrar una foto en el modal de producto la sube a Storage automáticamente.
- Cada pedido hecho desde `index.html` aparece en la pestaña **Cocina** en tiempo real.
- La pestaña **Caja** suma automáticamente el total de hoy y de cada mes.

Si `firebase-config.js` sigue con los valores `TU_...` de ejemplo, o si
no completas estos pasos, el sitio sigue funcionando igual que antes
(menú + WhatsApp), solo que sin login, sin cocina/caja y sin subir fotos.
