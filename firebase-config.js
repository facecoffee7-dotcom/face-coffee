/* ============================================================
   FIREBASE CONFIG — proyecto NUEVO de Face Coffee
   ------------------------------------------------------------
   1. Ve a https://console.firebase.google.com → "Agregar proyecto"
      → nómbralo, por ejemplo, "face-coffee-web".
   2. Dentro del proyecto: ⚙ (Configuración) → "Tus apps" → ícono
      "</>" (Web) → registra la app (nombre: "face-coffee").
   3. Firebase te muestra un bloque `firebaseConfig = {...}`.
      Copia esos valores AQUÍ ABAJO, reemplazando los "TU_..." .
   4. Activa Firestore: menú lateral → "Firestore Database" →
      "Crear base de datos" → modo producción → elige región
      (la más cercana a Ecuador suele ser us-east1 o us-central1).
   5. En Firestore → pestaña "Reglas", pega esto para empezar
      (ábrelo a lectura pública y escritura solo para ti mientras
      no tengas login de admin; lo afinamos después):

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /{document=**} {
            allow read: if true;
            allow write: if true; // TODO: restringir con Firebase Auth
          }
        }
      }
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBPhl-FmmBOEuWcF02h5SF5G4oxWOWbna4",
  authDomain: "face-coffee-bfaab.firebaseapp.com",
  projectId: "face-coffee-bfaab",
  storageBucket: "face-coffee-bfaab.firebasestorage.app",
  messagingSenderId: "651317251280",
  appId: "1:651317251280:web:209383f58a55aa2425e2d5",
};

// No tocar debajo de esta línea.
window.__FIREBASE_CONFIG__ = firebaseConfig;
