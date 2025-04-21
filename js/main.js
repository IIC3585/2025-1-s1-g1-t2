import { initDB, clearStore } from "./db.js";
import { initializeWASM } from "./wasm.js";
import {
  handleImageUpload,
  applyEffect,
  undo,
  redo,
  removeImage,
  handleSaveImage,
} from "./ui.js";

/**
 * * @description Inicializa la base de datos IndexDB y el módulo WASM al cargar el documento.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  await initializeWASM()
});

// Event listeners
document.getElementById("upload").addEventListener("change", handleImageUpload);
document.getElementById("grayscale").addEventListener("click", () => applyEffect("grayscale"));
document.getElementById("sepia").addEventListener("click", () => applyEffect("sepia"));
document.getElementById("coldInverse").addEventListener("click", () => applyEffect("coldInverse"));
document.getElementById("spectralGlow").addEventListener("click", () => applyEffect("spectralGlow"));
document.getElementById("undo").addEventListener("click", undo);
document.getElementById("redo").addEventListener("click", redo);
document.getElementById("removeImage").addEventListener("click", removeImage);
document.getElementById("save-button").addEventListener("click", handleSaveImage);
document.getElementById("clear-images").addEventListener("click", clearStore);
