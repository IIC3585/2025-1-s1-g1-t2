#### IIC3585-1 SECCIÓN 1 - GRUPO 1
# 🤖 Trabajo 2: Web Assembly y PWAs

Esta aplicación web permite el procesamiento de imágenes utilizando WebAssembly (Rust) con una interfaz JavaScript. Ofrece funcionalidades como escala de grises, inversión de colores y un sistema de deshacer/rehacer. Además, está diseñada como una Progressive Web App (PWA), lo que permite su instalación y uso offline.


| Integrantes | Mail UC |
|-|-|
| Tarek Elías Hirmas Aboid | tarek.hirmas@uc.cl |
| Sebastián Lobo Cáceres | salobo@uc.cl|
| Anita Martí Campos | asmarti@uc.cl |

> [!NOTE]
> Fecha de entrega 21-04-2025


## 📦 Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
.
├── images/              # Imágenes PNG para PWA
├── css/                 # Carpeta para CSS
│   ├── style.css        # Estilos CSS        
├── wasmfunctions/       # Código Rust compilado a Wasm
│   ├── pkg/             # Archivos generados por wasm-pack
│   ├── src/             # Código fuente Rust
│   │   └── lib.rs       # Implementación de funciones Wasm
│   ├── Cargo.toml       # Configuración del proyecto Rust
│   └── Cargo.lock       # Versiones exactas de dependencias
├── js/                  # Código JS
│   ├── db.js            # IndexedDB CRUD operaciones
│   ├── main.js          # Inicializador JS
│   ├── ui.js            # Manejo de UI, canvas e historial
│   └── wasm.js          # Inicialización y wrappers WASM
├── index.html           # Interfaz principal
├── sw.js                # Service Worker para PWA
├── manifest.json        # Configuración PWA
└── README.md            # Este archivo
```

## Detalles del Proyecto

### Herramientas Utilizadas
- **Rust**: Para implementar las funciones de procesamiento de imágenes.
- **wasm-pack**: Para compilar el código Rust a WebAssembly.
- **JavaScript**: Para la lógica de la aplicación y la integración con WebAssembly.
- **CSS**: Para el diseño y estilos de la interfaz.
- **Service Worker**: Para gestionar el almacenamiento en caché y las funcionalidades offline.

### 🚀 PWA
La aplicación está diseñada como una Progressive Web App (PWA), lo que permite:
- **Almacenamiento en caché**: Utiliza un Service Worker (`sw.js`) para almacenar en caché los archivos estáticos esenciales, como `index.html`, `index.js`, `style.css` y los archivos generados por WebAssembly. Esto asegura que la aplicación funcione incluso sin conexión a internet.
- **Instalación**: Incluye un archivo `manifest.json` que permite instalar la aplicación en dispositivos compatibles, ofreciendo una experiencia similar a una aplicación nativa.

### 🚀 WASM

El proyecto **wasmfunctions** se encuentra escrito en **Rust** que utiliza **WebAssembly (WASM)** para aplicar filtros de imágenes de manera eficiente en aplicaciones web. Los filtros implementados incluyen efectos como escala de grises, sepia, inversión fría y brillo espectral. Este proyecto está diseñado para ser compilado a WebAssembly y utilizado en aplicaciones web para procesamiento de imágenes en el navegador.

#### ¿Qué es WebAssembly (WASM)?
WebAssembly es un formato binario que permite ejecutar código de alto rendimiento en navegadores web. Es compatible con múltiples lenguajes de programación, incluido Rust, y está diseñado para ser rápido, seguro y portable. WASM es ideal para tareas intensivas como el procesamiento de imágenes, ya que permite ejecutar código casi nativo directamente en el navegador.

#### Archivos del Proyecto
- **`src/lib.rs`**: Contiene las funciones principales que implementan los filtros de imágenes.
- **`Cargo.toml`**: Archivo de configuración de Rust que define las dependencias necesarias para el proyecto.

#### Repertorios de Compilación

Al compilar el proyecto, se generarán los siguientes directorios y archivos:

- **`target/`**: Carpeta principal donde se almacenan los archivos generados durante la compilación.
    - **`debug/`**: Contiene los archivos de compilación en modo de depuración, útiles para pruebas y desarrollo.
    - **`release/`**: Contiene los archivos de compilación optimizados para producción.
    - **`wasm32-unknown-unknown/`**: Subcarpeta específica para los binarios compilados en formato WebAssembly.

    La carpeta `target/` es creada automáticamente por `cargo` y puede ser eliminada de manera segura si deseas limpiar los archivos de compilación. Sin embargo, será regenerada en la próxima compilación.

- **`pkg/`**: Carpeta generada al usar herramientas como `wasm-pack`. Contiene los archivos necesarios para integrar el módulo WebAssembly en aplicaciones web, incluyendo el archivo `.wasm`, bindings de JavaScript y un archivo `package.json` para su uso como paquete npm.

### Funciones Implementadas

#### Filtros

##### 1. `grayscale`

Convierte una imagen a escala de grises.

###### Parámetros:

- `img_data: &[u8]` - Un arreglo de bytes que representa los datos de la imagen en formato RGBA.
- `width: u32` - El ancho de la imagen.
- `height: u32` - La altura de la imagen.

###### Valor de retorno:

- `Vec<u8>` - Un vector de bytes que representa la imagen procesada en escala de grises.

##### 2. `sepia`

Aplica un filtro de sepia a la imagen.

###### Parámetros:

- `img_data: &[u8]` - Un arreglo de bytes que representa los datos de la imagen en formato RGBA.
- `width: u32` - El ancho de la imagen.
- `height: u32` - La altura de la imagen.

###### Valor de retorno:

- `Vec<u8>` - Un vector de bytes que representa la imagen procesada con el filtro sepia.

##### 3. `cold_inverse`

Aplica un filtro de inversión fría a la imagen, ajustando los colores para un efecto frío.

###### Parámetros:

- `img_data: &[u8]` - Un arreglo de bytes que representa los datos de la imagen en formato RGBA.
- `width: u32` - El ancho de la imagen.
- `height: u32` - La altura de la imagen.

###### Valor de retorno:

- `Vec<u8>` - Un vector de bytes que representa la imagen procesada con el filtro de inversión fría.

##### 4. `spectral_glow`

Aplica un filtro de brillo espectral a la imagen, intensificando los colores y añadiendo un efecto de brillo.

###### Parámetros:

- `img_data: &[u8]` - Un arreglo de bytes que representa los datos de la imagen en formato RGBA.
- `width: u32` - El ancho de la imagen.
- `height: u32` - La altura de la imagen.

###### Valor de retorno:

- `Vec<u8>` - Un vector de bytes que representa la imagen procesada con el filtro de brillo espectral.


### Guía de Instalación y Uso

#### Instalación de Herramientas Necesarias

Para compilar y utilizar este proyecto en formato WebAssembly, sigue los pasos a continuación:

1. **Instala Rust y Cargo**  
    Descarga e instala Rust y su herramienta de línea de comandos `cargo` siguiendo las instrucciones en [rust-lang.org](https://www.rust-lang.org/).

2. **Agrega el Objetivo `wasm32-unknown-unknown`**  
    Este objetivo permite generar binarios compatibles con WebAssembly. Ejecútalo con el siguiente comando:
    ```bash
    rustup target add wasm32-unknown-unknown
    ```

3. **Instala `wasm-pack`**  
    La herramienta [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) facilita la compilación y empaquetado de proyectos WebAssembly. Instálala con:
    ```bash
    cargo install wasm-pack
    ```

#### Compilación del Proyecto

Una vez configuradas las herramientas, compila el proyecto a WebAssembly siguiendo estos pasos:

1. **Compila con `wasm-pack`**  
    Utiliza el siguiente comando para compilar y empaquetar el proyecto:
    ```bash
    wasm-pack build --target web
    ```
    Este comando realiza las siguientes acciones:
    - Compila el código Rust al formato WebAssembly.
    - Genera un paquete listo para ser utilizado en aplicaciones web, incluyendo el archivo `.wasm`, bindings de JavaScript y un archivo `package.json`.
    - Especifica el objetivo `web`, asegurando la compatibilidad con navegadores.

2. **Verifica las Dependencias**  
    Asegúrate de que las siguientes dependencias estén incluidas en tu archivo `Cargo.toml`:
    - **`wasm-bindgen`**: Permite la interoperabilidad entre Rust y JavaScript.
    - **`image`**: Proporciona estructuras y funciones para manipular imágenes.

#### Resumen de Comandos

- Agregar el objetivo WebAssembly:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- Instalar `wasm-pack`:
  ```bash
  cargo install wasm-pack
  ```
- Compilar el proyecto:
  ```bash
  wasm-pack build --target web
  ```
- Limpiar archivos de compilación:
  ```bash
  cargo clean
  ```
