import { renderSavedThumbs } from "./ui.js";

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const DB_NAME = "imagesDB";
const STORE_NAME = "imagesStore";
const DB_VERSION = 1;
let db;


/**
 * 
 * @description Inicializa la base de datos IndexedDB y crea el almacén de objetos si no existe.
 * En onsuccess, se resuelve la promesa con la base de datos y se llama a renderSavedThumbs.
 * @returns {Promise<IDBDatabase>} La base de datos IndexedDB inicializada.
 * @throws {DOMException} Si ocurre un error al abrir la base de datos.
 * 
 */
export function initDB(){
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("byDate", "date", { unique: false });
        };

        request.onsuccess = (e) => { db = e.target.result; resolve(db); renderSavedThumbs(); };
        request.onerror = (e) => reject(e.target.error);
    })
}

/**
 * 
 * @description Crea una transacción de lectura/escritura en el almacén de objetos y guarda la imagen en IndexedDB.
 * Se empaqueta la imagen en un objeto con un ID único, una fecha y la URL de datos.
 * 
 * @param {string} dataURL - La URL de datos de la imagen a guardar.
 * 
 */
export function saveImage( dataURL ) {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const record = {
        id: Date.now(),
        date: new Date(),
        dataUrl: dataURL,
    };
    store.put(record);
    tx.oncomplete = () => {
        renderSavedThumbs();
        alert("Imagen guardada en IndexedDB ✅");
      };
    tx.onerror = (e) => console.error("Error guardando imagen:", e.target.error);
}

/**
 * 
 * @description Recupera todas las imágenes guardadas en IndexedDB.
 * Crea una transacción de solo lectura y obtiene todas las imágenes del almacén de objetos.
 *
 */
export function getAllImages() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Se creo, pero se optó por borrar todos los datos
// export function deleteImage(id) {
//     const tx = db.transaction(STORE_NAME, "readwrite");
//     const store = tx.objectStore(STORE_NAME);
//     const req = store.delete(id);
//     return req.onsuccess;
// }

/**
 * 
 * @description Borra el almacenamiento de IndexedDB.
 * Se crea una transacción de lectura/escritura y se llama a clear() en el almacén de objetos.
 * Es necesario confirmar la acción antes de proceder.
 */
export function clearStore() {
    if (!confirm("¿Estás seguro de que quieres borrar el almacenamiento?")) return;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => {
        renderSavedThumbs();
        alert("Almacenamiento borrado ✅");
    };
    req.onerror = (e) => console.error("Error borrando almacenamiento:", e.target.error);
}
