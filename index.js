
let WASM_MODULE = {
  initialized: false,
  grayscale: null
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
let img = new Image();
let history = [];
let redoStack = [];
const MAX_SIZE_MB = 5;

async function initializeWASM() {
    try {
      const wasmModule = await import('./wasmfunctions/pkg/wasm_grayscale.js');
      
      // Explicitly set the WASM file location
      const wasmPath = './wasmfunctions/pkg/wasm_grayscale_bg.wasm';
      const wasmResponse = await fetch(wasmPath);
      
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM file: ${wasmResponse.status}`);
      }
      
      const wasmBytes = await wasmResponse.arrayBuffer();
      // Pass a single object to the initialization function
      await wasmModule.default({
        wasmBinary: wasmBytes,
    });
      console.log("WASM module loaded successfully");
      // Initialize the WASM functions
      console.log("WASM :load module", wasmModule);
      WASM_MODULE.grayscale = wasmModule.grayscale;
      WASM_MODULE.initialized = true;
      
      console.log("WASM initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing WASM:", error);
      throw error;
    }
  }

function initializeApp() {
    upload.addEventListener("change", handleImageUpload);
    document.getElementById("grayscale").addEventListener("click", () => applyEffect("grayscale"));
    document.getElementById("invert").addEventListener("click", () => applyEffect("invert"));
    document.getElementById("blur").addEventListener("click", () => applyEffect("blur"));
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
      switch (effectName) {
          case "grayscale":
              if (!WASM_MODULE.initialized) {
                    console.warn("WASM no inicializado, inicializando ahora...");
                  await initializeWASM();
              }
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const wasmResult = WASM_MODULE.grayscale(
                  new Uint8Array(imageData.data.buffer),
                  canvas.width,
                  canvas.height
              );
              applyImageData(new Uint8ClampedArray(wasmResult));
              break;

          case "invert":
              applyJavaScriptEffect(invertPixels);
              break;

          case "blur":
              applyBlurEffect();
              break;

          default:
              console.warn("Efecto desconocido:", effectName);
      }
  } catch (error) {
      console.error("Error aplicando efecto:", error);
      alert(`Error: ${error.message}`);
  }
}

function invertPixels(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];     // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
  }
  return imageData;
}

function applyJavaScriptEffect(effectFunction) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const modifiedData = effectFunction(imageData);
  ctx.putImageData(modifiedData, 0, 0);
  saveState();
}

function applyBlurEffect() {
  ctx.filter = "blur(5px)";
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";
  saveState();
}


// ============= Funciones auxiliares =============
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`La imagen excede el límite de ${MAX_SIZE_MB}MB`);
        upload.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        img.onload = () => {
            resizeCanvasToImage();
            ctx.drawImage(img, 0, 0);
            saveState();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function resizeCanvasToImage() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.6;
    let ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
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

function removeImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 800;
    canvas.height = 600;
    upload.value = "";
    history = [];
    redoStack = [];
}