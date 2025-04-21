// ----- IndexedDB setup -----
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const dbName = "imagesDB";
const storeName = "imagesStore";
const dbVersion = 1;
let db;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = (e) =>
  console.error("No se pudo abrir IndexedDB:", e.target.error);
request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains(storeName)) {
    const store = db.createObjectStore(storeName, { keyPath: "id" });
    store.createIndex("byDate", "date", { unique: false });
  }
};
request.onsuccess = (e) => {
  db = e.target.result;
  displaySavedImages();
};

// función para guardar la imagen actual
function saveImage() {
  if (!canvas.width || !canvas.height)
    return alert("No hay imagen en el canvas");

  const dataUrl = canvas.toDataURL("image/png");
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const record = {
    id: Date.now(),
    date: new Date(),
    dataUrl,
  };
  store.put(record);
  tx.oncomplete = () => {
    displaySavedImages();
    alert("Imagen guardada en IndexedDB ✅");
  };
  tx.onerror = (e) => console.error("Error guardando imagen:", e.target.error);
}

// recuperar todas las imágenes
function getAllImages() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// pintar miniaturas y asociar evento de carga
async function displaySavedImages() {
  const container = document.getElementById("saved-images");
  container.innerHTML = "";
  try {
    const images = await getAllImages();
    images
      .sort((a, b) => b.id - a.id)
      .forEach((imgObj) => {
        const thumb = document.createElement("img");
        thumb.src = imgObj.dataUrl;
        thumb.title = new Date(imgObj.date).toLocaleString();
        thumb.onclick = () => loadImage(imgObj.dataUrl);
        container.appendChild(thumb);
      });
  } catch (err) {
    console.error("Error recuperando imágenes:", err);
  }
}

// cargar en canvas desde dataURL
function loadImage(dataUrl) {
  const temp = new Image();
  temp.onload = () => {
    canvas.width = temp.width;
    canvas.height = temp.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(temp, 0, 0);
    saveState();
  };
  temp.src = dataUrl;
}

// ----- Canvas setup -----

let WASM_MODULE = {
  initialized: false,
  grayscale: null,
  sepia: null,
  cold_inverse: null,
  spectral_glow: null,
};

const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const saveBtn = document.getElementById("save-button");
let img = new Image();
let history = [];
let redoStack = [];
const MAX_SIZE_MB = 5;

async function initializeWASM() {
    try {
      const wasmModule = await import('./wasmfunctions/pkg/wasm_filters.js');
      
      // Explicitly set the WASM file location
      const wasmPath = './wasmfunctions/pkg/wasm_filters_bg.wasm';
      const wasmResponse = await fetch(wasmPath);
      
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM file: ${wasmResponse.status}`);
      }
      
      const wasmBytes = await wasmResponse.arrayBuffer();
      // Pass a single object to the initialization function
      await wasmModule.default({
        wasmBinary: wasmBytes,
    });
      // Initialize the WASM functions
      WASM_MODULE.grayscale = wasmModule.grayscale;
      WASM_MODULE.sepia = wasmModule.sepia;
      WASM_MODULE.cold_inverse = wasmModule.cold_inverse;
      WASM_MODULE.spectral_glow = wasmModule.spectral_glow;
      // Set the initialized flag to true
      WASM_MODULE.initialized = true;
      
      console.log("WASM initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing WASM:", error);
      throw error;
    }
  }

saveBtn.addEventListener("click", saveImage);

function initializeApp() {
    upload.addEventListener("change", handleImageUpload);
    document.getElementById("grayscale").addEventListener("click", () => applyEffect("grayscale"));
    document.getElementById("sepia").addEventListener("click", () => applyEffect("sepia"));
    document.getElementById("coldInverse").addEventListener("click", () => applyEffect("coldInverse"));
    document.getElementById("spectralGlow").addEventListener("click", () => applyEffect("spectralGlow"));
    document.getElementById("undo").addEventListener("click", undo);
    document.getElementById("redo").addEventListener("click", redo);
    document.getElementById("removeImage").addEventListener("click", removeImage);
}

document.addEventListener("DOMContentLoaded", async () => {
  await initializeWASM().catch((error) => {
      console.error("Error inicializando WASM:", error);
  }).then(() => {
      WASM_MODULE.initialized = true;
      window.wasmInitialized = true;
  });
  initializeApp();
});

async function applyEffect(effectName) {
  if (!img) {
      alert("Primero carga una imagen");
      return;
  }
  try {
    if (!WASM_MODULE.initialized) {
        console.warn("WASM no inicializado, inicializando ahora...");
      await initializeWASM();
    }
      switch (effectName) {
          case "grayscale":
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const wasmResult = WASM_MODULE.grayscale(
                  new Uint8Array(imageData.data.buffer),
                  canvas.width,
                  canvas.height
              );
              applyImageData(new Uint8ClampedArray(wasmResult));
              break;

          case "sepia":
                  const sepiaData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const sepiaResult = WASM_MODULE.sepia(
                    new Uint8Array(sepiaData.data.buffer),
                    canvas.width,
                    canvas.height
                  );
                  applyImageData(new Uint8ClampedArray(sepiaResult));
                  break;

                case "coldInverse":
                  const coldInverseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const coldInverseResult = WASM_MODULE.cold_inverse(
                    new Uint8Array(coldInverseData.data.buffer),
                    canvas.width,
                    canvas.height
                  );
                  applyImageData(new Uint8ClampedArray(coldInverseResult));
                  break;

                case "spectralGlow":
                  const spectralGlowData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const spectralGlowResult = WASM_MODULE.spectral_glow(
                    new Uint8Array(spectralGlowData.data.buffer),
                    canvas.width,
                    canvas.height
                  );
                  applyImageData(new Uint8ClampedArray(spectralGlowResult));
                  break;

          default:
              console.warn("Efecto desconocido:", effectName);
      }
  } catch (error) {
      console.error("Error aplicando efecto:", error);
      alert(`Error: ${error.message}`);
  }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`La imagen excede el límite de ${MAX_SIZE_MB}MB`);
        upload.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        img.onload = function () {
          const scale = Math.min(MAX_CANVAS_WIDTH / img.width, MAX_CANVAS_HEIGHT / img.height);
          const newWidth = img.width * scale;
          const newHeight = img.height * scale;
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          saveState();
        };
        img.src = event.target.result;
      };
      if (file) reader.readAsDataURL(file);
}

function applyImageData(data) {
    ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);
    saveState();
}

function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 20) history.shift();
    redoStack = [];
}

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        restoreState(history[history.length - 1]);
    }
}

function redo() {
    if (redoStack.length > 0) {
        history.push(redoStack.pop());
        restoreState(history[history.length - 1]);
    }
}

function restoreState(dataUrl) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
}

