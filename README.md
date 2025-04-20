#### IIC3585-1 SECCIÓN 1 - GRUPO 1
# 🤖 Trabajo 2: Web Assembly y PWAs

| Integrantes | Mail UC |
|-|-|
| Tarek Elías Hirmas Aboid | tarek.hirmas@uc.cl |
| Sebastián Lobo Cáceres | salobo@uc.cl|
| Anita Martí Campos | asmarti@uc.cl |

> [!NOTE]
> Fecha de entrega 21-04-2025


# 🖼️ Image Processor with WebAssembly (WASM)

Aplicación web para procesamiento de imágenes usando WebAssembly (Rust) con interfaz JavaScript. Incluye funciones como escala de grises, inversión de colores y sistema de deshacer/rehacer.

![Demo Preview](demo-preview.gif)

## 📦 Estructura del Proyecto
.
├── wasmfunctions/       # Código Rust compilado a Wasm
│   ├── pkg/             # Archivos generados por wasm-pack
│   ├── src/             # Código fuente Rust
│   │   └── lib.rs       # Implementación de funciones Wasm
│   ├── Cargo.toml       # Configuración del proyecto Rust
│   └── Cargo.lock       # Versiones exactas de dependencias
├── index.html           # Interfaz principal
├── index.js             # Lógica de la aplicación
├── style.css            # Estilos CSS
├── sw.js                # Service Worker para PWA
├── manifest.json        # Configuración PWA
└── README.md            # Este archivo


## 🚀 Instalación y Uso

### Requisitos
- [Rust](https://www.rust-lang.org/tools/install)
- wasm-pack: `cargo install wasm-pack`
- Servidor web local

### Pasos
1. Clonar repositorio:
```bash
git clone [repo-url] && cd image-processor
```
2.  Compilar WASM

```bash
cd wasmfunctions && wasm-pack build --target web
```
## 🚀 Añadir nuevos filtros

1. Implementar en Rust (`lib.rs`)


```bash
#[wasm_bindgen]
pub fn nuevo_filtro(img_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    // Lógica de procesamiento
    // ...
    output.into_raw()
}
```

2. Actualizar index.js

3. Recompilar