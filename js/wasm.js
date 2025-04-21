let WASM_MODULE = {
  initialized: false,
  grayscale: null,
  sepia: null,
  coldInverse: null,
  spectralGlow: null,
};

/**
 *
 * @description Inicializa el módulo WASM y carga el archivo WASM.
 * @returns {Promise<boolean>} - Devuelve true si la inicialización fue exitosa, false si hubo un error.
 * 
 */
export async function initializeWASM() {
  try {
    const wasmModule = await import("../wasmfunctions/pkg/wasm_filters.js");
    const wasmResponse = await fetch(
      "../wasmfunctions/pkg/wasm_filters_bg.wasm"
    );

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
    WASM_MODULE.coldInverse = wasmModule.cold_inverse;
    WASM_MODULE.spectralGlow = wasmModule.spectral_glow;

    // Set the initialized flag to true
    WASM_MODULE.initialized = true;

    console.log("WASM initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing WASM:", error);
    throw error;
  }
}

/**
 * 
 * @description Aplica un filtro WASM a los datos de pixel y devuelve nuevo Uint8ClampedArray
 * 
 */
export function applyFilter(wasmFn, imageData, width, height) {
  const result = WASM_MODULE[wasmFn](new Uint8Array(imageData.buffer), width, height);
  return new Uint8ClampedArray(result);
}
