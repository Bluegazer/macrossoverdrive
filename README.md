# VF-1 Valkyrie Arcade - Sim // Macross Overdrive - Web Demo

Prototipo web de combate aéreo y mecha en 3D inspirado en *Macross: Do You Remember Love?* y *Macross VOXP*, desarrollado con **Three.js**, **HTML5 Canvas 2D**, **Web Audio API** y **WebRTC (PeerJS)**. Un proyecto hecho por fans, para fans, desde **La Bitácora del Megaroad**.

---

## Características Principales

* **Pantalla de Despliegue Orbital y Precarga Inteligente:** Menú de inicio táctico con barra de progreso de modelos 3D (`THREE.LoadingManager`) y pre-compilación de *shaders* GPU antes de entrar en combate.
* **3 Teatros de Operaciones con Caché Persistente:**
  * **01 // Isla South Ataria y Macross City:** Base aérea U.N. Spacy, **SDF-1 Macross** (`sdf1.glb`) en dique seco con colisionador compuesto (`OBB`), manzanas urbanas con alumbrado nocturno (`emissiveMap`), portaaviones en la bahía sur, océano animado y ciclo día/noche sincronizado en tiempo real (o seleccionable por franja horaria en Opciones).
  * **02 // Órbita de Saturno (`0G`):** Combate espacial con física inercial newtoniana estilo *Macross VOXP*, cinturón navegable de **3,200 asteroides** instanciados, polvo espacial envolvente y Sol con *Sunshafts* y *Lens Flare* dinámicos.
  * **03 // Macross City Interior (DYRL):** Bóveda interior del SDF-1 con avenidas, comercios de neón, auditorio con rayos láser, pantallas gigantes y ventanal hacia la batalla espacial exterior.
* **Combate 1 vs 1 Online (WebRTC P2P):**
  * **Conexión Directa sin Servidores Intermedios:** Enlace directo entre navegadores mediante **PeerJS** con código de sala corto y bloqueo automático al entrar el segundo piloto.
  * **Filtro Regional Automático:** Detecta el país del jugador (ej. `AR-XXXX`) y restringe la sala a pilotos de la misma región para garantizar el menor *ping* posible.
  * **Duelo Equilibrado:** Escenario limpio sin enemigos IA, aparición simétrica frente a frente, retícula con **nombre de piloto**, etiqueta de país y **barra de energía del rival** en tiempo real.
* **Transformación en Tiempo Real:** Transición animada fluida entre los modos **Fighter**, **Gerwalk** y **Battroid** con físicas independientes, aterrizaje seguro sobre estructuras y daño escalado por impacto a alta velocidad.
* **Sistema de Control de Tiro DYRL y Horizonte Artificial:** HUD vectorial con horizonte artificial proyectado delante de la nave, retículas hexagonales enemigas, rastreadores con corchetes a 45°, **Multi-Lock simultáneo de hasta 4 blancos** e indicadores de alerta para misiles entrantes.
* **Auto-Rastreo Táctico (Modo Battroid):** Sistema de fijación automática seleccionable para apuntar directamente al enemigo (o rival 1v1) o interceptar misiles en el aire.
* **Armamento, Evasión y Contramedidas:**
  * **Gunpod GU-11:** Trazadoras amarillas de alta velocidad con detección continua de impacto (efectivo contra enemigos, rivales y misiles entrantes).
  * **3 Perfiles de Micro-Misiles (`Tab`):** Intercambiables en vuelo entre **`LIGERO`** (salva rápida de 4), **`PESADO`** (alto impacto) y **`ESPECIAL`**, con estela de humo instanciada (`InstancedMesh`).
  * **Contramedidas Chaff / Flares (`C`) y Overshoot:** Eyección de bengalas en modo *Fighter* para desviar misiles fijados, más espoleta de proximidad evasiva con giros cerrados o reversa en *Gerwalk*.
* **Soporte Completo de Teclado y Mando (Xbox / PlayStation):** Reasignación total de controles guardada en el navegador, diagrama interactivo del control detectado y navegación por menús con gamepad.
* **Auto-Detección de Hardware (`detectHardwareProfile`):** Ajusta automáticamente *antialiasing* y resolución interna (`pixelRatio`) según la GPU y memoria del equipo para mantener **60 FPS estables** desde gráficas integradas (AMD Radeon Vega / Intel Iris) hasta GPUs dedicadas.
* **Audio Dinámico en OGG:** Motor Web Audio API con música de título y combate (`BGM`), controles de volumen independientes (`FX` / `BGM`), reproductor de prueba en Opciones, modulación de turbinas, síntesis de bengalas y alerta progresiva de misiles.

---

## Controles de Vuelo y Combate

### Navegación y Pantalla de Inicio

| Tecla | Acción |
| :--- | :--- |
| **`Enter`** | **Iniciar misión** desde la pantalla de inicio |
| **`Esc`** | **Regresar** a la pantalla de inicio durante la misión |
| **`P`** | **Pausar / Reanudar** y abrir menú de opciones rápido |
| **`M`** | **Silenciar / Activar** música de fondo (`BGM`) |
| **`H`** | **Adelantar reloj (+2 horas)** para probar el ciclo día/noche en South Ataria |
| **`Y` / `N`** | Tras ser derribado: **`Y`** reinicia la misión / **`N`** regresa a la pantalla de inicio |

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
| **`T`** *(mantener)* | **Turbo / Postcombustión** (vigilar temperatura de turbinas) |
| **`X`** | **Full Stop** (frenado total a 0%) |

### Movimiento y Rastreo en Modos Gerwalk (`G`) y Battroid (`B`)

| Tecla | Acción |
| :--- | :--- |
| **`W` / `S`** | Avanzar / Retroceder |
| **`A` / `D`** | Desplazamiento lateral (*Strafe* izquierda / derecha) |
| **`Flecha Izq` / `Der`** | Girar sobre el eje vertical |
| **`Flecha Arriba` / `Abajo`** | Ascender / Descender altitud |
| **`R`** *(mantener)* | Reversa rápida en modo **Gerwalk** |
| **`N`** | Alternar auto-rastreo en modo **Battroid** (`ENEMY` ➔ `MISSILE` ➔ `NONE`) |
| **`E`** | Ataque cuerpo a cuerpo con Gunpod (solo en modo **Battroid**) |

### Armamento y Contramedidas

| Tecla | Acción |
| :--- | :--- |
| **`Shift Izq`** *(mantener)* | Disparar ráfaga continua de **Gunpod GU-11** (efectivo contra enemigos y misiles) |
| **`Espacio`** | Lanzar salva de **Micro-Misiles Guiados** (repartidos en Multi-Lock) |
| **`Tab`** | Alternar perfil de micro-misiles (**`LIGERO`** / **`PESADO`** / **`ESPECIAL`**) |
| **`C`** | Desplegar **Chaff / Flares** (contramedidas antimisiles en modo **Fighter**) |

---

## Estructura del Proyecto

```text
macross-voxp-web/
├── index.html                  # Estructura principal, pantalla de inicio, opciones y lobby 1v1
├── three.min.js                # Motor gráfico Three.js (WebGL 2.0)
├── GLTFLoader.js               # Cargador de modelos 3D GLB
├── css/
│   └── style.css               # Estilos de la pantalla de inicio, HUD y paneles de opciones
├── fonts/                      # Tipografía Conthrax para la interfaz y el HUD
├── models/                     # Modelos 3D de la Valkyrie (vf1a.glb), SDF-1 (sdf1.glb) y Regult (regult.glb)
├── textures/                   # Texturas planetarias, sol y secuencia de sprites para explosiones
├── videos/                     # Videos ambientales para las pantallas gigantes del interior del SDF-1
├── sounds/                     # Música de fondo (BGM), efectos de sonido y turbinas en OGG
└── js/
    ├── peerjs.min.js           # Librería WebRTC P2P para salas y duelos 1 vs 1
    ├── audio.js                # Motor Web Audio API, síntesis de Chaff, volúmenes y alertas
    ├── controls.js             # Gestión y reasignación de controles de teclado y mando (Xbox / PS2)
    ├── environment.js          # Isla South Ataria, Macross City, SDF-1, nubes 3D, ciclo día/noche y caché
    ├── env_saturn.js           # Entorno orbital de Saturno, anillos, 3,200 asteroides y sol 3D
    ├── env_macross_interior.js # Entorno interior del SDF-1, avenidas, auditorio y batalla exterior
    ├── hud.js                  # Renderizado 2D del HUD, horizonte artificial, Multi-Lock y marcador 1v1
    ├── weapons.js              # Lógica de Gunpod, 3 perfiles de misiles, Chaff, humo e IA Regult
    ├── player.js               # Animaciones, propulsores, física 0G/atmosférica, daño y auto-rastreo
    ├── multiplayer.js          # Emparejamiento P2P regional, Valkyrie rival y sincronización 1 vs 1
    └── main.js                 # Precarga con LoadingManager, detección de hardware y bucle principal
```

---

## Ejecución Local

Dado que el proyecto carga modelos `.glb`, texturas y archivos de audio `.ogg` mediante `fetch`, debe ejecutarse a través de un servidor web local (por ejemplo, la extensión **Live Server** en VS Code o `python -m http.server`) y no abriendo el archivo `index.html` directamente con doble clic.
