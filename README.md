# VF-1A Valkyrie // Macross VOXP Web Demo

Prototipo web de combate aéreo y mecha en 3D inspirado en *Macross: Do You Remember Love?* y *Macross VOXP*, desarrollado con **Three.js**, **HTML5 Canvas 2D** y **Web Audio API**.

---

## Características Principales

* **Transformación en Tiempo Real:** Transición animada fluida entre los modos **Fighter**, **Gerwalk** y **Battroid** con físicas de vuelo independientes para cada configuración.
* **Sistema de Control de Tiro DYRL:** HUD vectorial con efecto *bloom* CRT, retículas hexagonales enemigas, rastreadores y **Multi-Lock simultáneo de hasta 4 blancos**.
* **Armamento y Efectos:** Cañón Gunpod GU-11 con fogonazo e iluminación dinámica, salva de 4 micro-misiles guiados con trayectoria en zigzag y estela de humo instanciada (`InstancedMesh`).
* **Gestión de Daño y Térmica:** Barra de integridad de armadura con regeneración, chispas de impacto iluminadas, secuencia de caída a tierra y control de sobrecalentamiento de turbinas (*Overheat*).
* **Audio Dinámico en OGG:** Motor de sonido de baja latencia con modulación continua de tono/velocidad de turbinas, alertas de misiles y corte limpio de ráfagas.

---

## Controles de Vuelo y Combate

### Transformación de Modos

| Tecla | Acción |
| :--- | :--- |
| **`F`** | Transformar a modo **Fighter** (caza supersónico) |
| **`G`** | Transformar a modo **Gerwalk** (vuelo estacionario VTOL) |
| **`B`** | Transformar a modo **Battroid** (mecha bípedo) |

### Movimiento en Modo Fighter (`F`)

| Tecla | Acción |
| :--- | :--- |
| **`W` / `S`** | Aumentar / Reducir empuje (*Throttle*) |
| **`A` / `D`** | Guiñada horizontal (*Yaw* izquierda / derecha) |
| **`Flecha Izq` / `Der`** | Alabeo (*Roll* izquierda / derecha) |
| **`Flecha Arriba` / `Abajo`** | Cabeceo (*Pitch* picada / elevación) |
| **`Numpad 5`** *(mantener)* | **Turbo / Postcombustión** (vigilar temperatura de turbinas) |
| **`Numpad 8`** | **Full Stop** (frenado total a 0%) |

### Movimiento en Modos Gerwalk (`G`) y Battroid (`B`)

| Tecla | Acción |
| :--- | :--- |
| **`W` / `S`** | Avanzar / Retroceder |
| **`A` / `D`** | Desplazamiento lateral (*Strafe* izquierda / derecha) |
| **`Flecha Izq` / `Der`** | Girar sobre el eje vertical |
| **`Flecha Arriba` / `Abajo`** | Ascender / Descender altitud |
| **`Numpad 0`** *(mantener)* | Reversa rápida en modo Gerwalk |
| **`E`** | Ataque cuerpo a cuerpo con Gunpod (solo en modo **Battroid**) |

### Armamento y Sistema

| Tecla | Acción |
| :--- | :--- |
| **`Shift`** *(mantener)* | Disparar ráfaga continua de **Gunpod GU-11** |
| **`Espacio`** | Lanzar salva de **4 Micro-Misiles Guiados AMM-1** (repartidos en Multi-Lock) |
| **`P`** | **Pausar / Reanudar** la simulación |
| **`Y` / `N`** | Reiniciar misión (`YES` / `NO`) tras ser derribado |

---

## Estructura del Proyecto

```text
macross-voxp-web/
├── index.html          # Estructura principal, carga de fuentes y módulos
├── three.min.js        # Motor gráfico Three.js
├── GLTFLoader.js       # Cargador de modelos 3D GLB
├── fonts/              # Tipografía Conthrax para el HUD
├── models/             # Modelo 3D animado de la Valkyrie (vf1a.glb)
├── sounds/             # Efectos de sonido y turbinas en formato OGG
└── js/
    ├── audio.js        # Motor Web Audio API y control continuo de turbina/armas
    ├── hud.js          # Renderizado 2D del HUD, retículas Multi-Lock y medidores
    ├── weapons.js      # Lógica de Gunpod, micro-misiles, humo instanciado y enemigos
    ├── player.js       # Animaciones, propulsores de plasma, física y gestión térmica
    └── main.js         # Bucle principal, controles de teclado y estado de pausa/reinicio
```

---

## Ejecución Local

Dado que el proyecto carga modelos `.glb` y archivos de audio `.ogg` mediante `fetch`, debe ejecutarse a través de un servidor web local (por ejemplo, la extensión **Live Server** en VS Code o `python -m http.server`) y no abriendo el archivo `index.html` directamente con doble clic.

