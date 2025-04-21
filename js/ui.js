import { applyFilter } from "./wasm.js";
import { getAllImages, saveImage } from "./db.js";

/**
 * 
 * ARCHIVO UI.JS
 * @description Este archivo contiene funciones para manejar la interfaz de usuario de la aplicación.
 * 
 */

// History
const _HIST_MAX = 20;
let history = [];
let redoStack = [];

// Canvas
const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;
const MAX_SIZE_MB = 5;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
let img = new Image();


// ----------------------------------------------------------------------
// FUNCIONES DE CARGA Y DIBUJO
// ----------------------------------------------------------------------

/**
 * 
 * @description Maneja la carga de imágenes desde el input de archivo.
 * Validando el tamaño del archivo y la carga de la imagen en el canvas.
 * Si hay una imagen previamente cargada, la elimina antes de cargar la nueva.
 * 
 */
export function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    alert(`La imagen excede el límite de ${MAX_SIZE_MB}MB`);
    upload.value = "";
    return;
  }

  if (img.src) {
    removeImage();
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      const scale = Math.min(
        MAX_CANVAS_WIDTH / img.width,
        MAX_CANVAS_HEIGHT / img.height
      );
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      saveState(canvas.toDataURL());
    };
    img.src = event.target.result;
  };
  if (file) reader.readAsDataURL(file);
}

/**
 * 
 * @description Carga una imagen desde una URL de datos y la dibuja en el canvas.
 * Si se especifica indexedDB, guarda la imagen en IndexedDB después de cargarla.
 * Si hay una imagen previamente cargada, la elimina antes de cargar la nueva.
 * 
 */
export function loadFromURL(dataUrl, indexedDB = false) {
  const temp = new Image();
  temp.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = temp.width;
    canvas.height = temp.height;
    ctx.drawImage(temp, 0, 0);
  };
  temp.src = dataUrl;
  if (indexedDB) {
    removeImage();
    img.src = dataUrl;
    saveState(dataUrl);
  }
}

export function removeImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = MAX_CANVAS_HEIGHT;
  upload.value = "";
  img = new Image();
  history = [];
  redoStack = [];
}

// ----------------------------------------------------------------------
// FUNCIÓN DE FILTROS
// ----------------------------------------------------------------------

/**
 * 
 * @description Aplica un efecto a la imagen cargada en el canvas utilizando una función WASM.
 * Si no hay imagen cargada, muestra un mensaje de error.
 * Convierte la imagen a un Uint8ClampedArray y aplica el filtro correspondiente.
 * El resultado se dibuja de nuevo en el canvas.
 * 
 */
export async function applyEffect(wasmFunction) {
  if (!img.src) {
    alert("No hay imagen cargada.");
    return;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const fn = wasmFunction;
  const data = applyFilter(fn, imageData.data, canvas.width, canvas.height);

  ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);
  saveState(canvas.toDataURL());
}

// ----------------------------------------------------------------------
// MINIATURAS DE IMÁGENES
// ----------------------------------------------------------------------

/**
 * 
 * @description Renderiza las miniaturas de las imágenes guardadas en IndexedDB.
 * Si no hay imágenes guardadas, muestra un mensaje indicando que no hay imágenes.
 * Las miniaturas son clicables y cargan la imagen correspondiente en el canvas.
 * 
 */ 
export async function renderSavedThumbs() {
  const container = document.getElementById("saved-images");
  container.innerHTML = "";
  const imgs = await getAllImages();
  if (!imgs || imgs.length === 0) {
    container.innerHTML = "<p>No hay imágenes guardadas.</p>";
    return;
  }
  imgs
    .sort((a, b) => b.id - a.id)
    .forEach((rec) => {
      const thumb = document.createElement("img");
      thumb.src = rec.dataUrl;
      thumb.alt = new Date(rec.date).toLocaleString();
      thumb.onclick = () => loadFromURL(rec.dataUrl, true);
      container.appendChild(thumb);
    });
}

// ----------------------------------------------------------------------
// FUNCIONES DE HISTORIAL
// ----------------------------------------------------------------------

/**
 * 
 * @description Guarda el estado actual del canvas en el historial.
 * Si el historial excede el tamaño máximo, elimina el primer elemento.
 * 
 * @param {string} dataUrl - La URL de datos de la imagen actual.
 * 
 */
export function saveState(dataUrl) {
  history.push(dataUrl);
  if (history.length > _HIST_MAX) history.shift();
  redoStack = [];
}

export function undo() {
  if (history.length > 1) {
    redoStack.push(history.pop());
    loadFromURL(history[history.length - 1]);
  }
}

export function redo() {
  if (redoStack.length > 0) {
    history.push(redoStack.pop());
    loadFromURL(history[history.length - 1]);
  }
}

// ----------------------------------------------------------------------
// GUARDADO EN INDEXEDDB
// ----------------------------------------------------------------------

/**
 * 
 * @description Guarda la imagen actual en IndexedDB.
 * Convierte el canvas a una URL de datos y la guarda en la base de datos.
 * Si no hay imagen cargada, muestra un mensaje de error.
 * 
 */
export const handleSaveImage = () => {
  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl || !img.src) {
    alert("No hay imagen para guardar.");
    return;
  }
  try {
    saveImage(dataUrl);
    removeImage();
  } catch (err) {
    console.error("Error guardando imagen:", err);
  }
};
