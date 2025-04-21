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
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const saveBtn = document.getElementById("save-button");
let img = new Image();
let history = [];
let redoStack = [];
const MAX_SIZE_MB = 5;

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
    alert("El archivo excede el tamaño máximo de " + MAX_SIZE_MB + "MB.");
    upload.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      saveState();
    };
    img.src = event.target.result;
  };
  if (file) reader.readAsDataURL(file);
});

saveBtn.addEventListener("click", saveImage);

function saveState() {
  history.push(canvas.toDataURL());
  if (history.length > 50) history.shift();
  redoStack = [];
}

function restoreState(dataUrl) {
  const img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}

function undo() {
  if (history.length > 1) {
    redoStack.push(history.pop());
    restoreState(history[history.length - 1]);
  }
}

function redo() {
  if (redoStack.length > 0) {
    const state = redoStack.pop();
    history.push(state);
    restoreState(state);
  }
}

function applyEffect(effect) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (effect === "grayscale") {
      let avg = (r + g + b) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }

    if (effect === "invert") {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }
  }

  if (effect === "blur") {
    ctx.filter = "blur(2px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    saveState();
    return;
  }

  ctx.putImageData(imageData, 0, 0);
  saveState();
}

function removeImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;
  upload.value = "";
  history = [];
  redoStack = [];
}
