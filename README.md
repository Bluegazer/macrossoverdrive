# VF-1 Valkyrie Arcade - Sim // Macross Overdrive - Web Demo

Prototipo web de combate aéreo, espacial y mecha en 3D inspirado en *Macross: Do You Remember Love?* y *Macross VOXP* (Bothtec), desarrollado con **Three.js**, **HTML5 Canvas 2D** y **Web Audio API**.

---

## Características Principales

* **Tres Escenarios Seleccionables desde el Despliegue Orbital:**
  * **01 // Isla South Ataria (`MAPA_1`):** Base aérea U.N. Spacy, Macross City con alumbrado nocturno, portaaviones en la bahía sur, nubes 3D volumétricas y el **SDF-1 Macross** (`sdf1.glb`) en su dique seco con colisionador compuesto ajustado al casco.
  * **02 // Órbita de Saturno (`MAPA_2`):** Combate espacial en **gravedad cero (`0G`) con física inercial newtoniana estilo *Macross VOXP*** (deriva libre sin rozamiento, desacople de orientación y trayectoria en *Fighter*, *strafe* orbital en *Gerwalk* y flotación 3D en *Battroid*), anillos planetarios ecuatoriales, cinturón de asteroides navegables con colisión y polvo espacial envolvente.
  * **03 // Macross City Interior DYRL (`MAPA_3`):** Bóveda interna del SDF-1 Macross con avenida central iluminada, cubiertas superiores, comercios con neones, parques urbanos, puentes peatonales, auditorio con espectáculo láser, pantallas gigantes de video y ventanales hacia la batalla espacial exterior.
* **Control de Horario y Ciclo Día/Noche:** Sincronizado automáticamente con el reloj local (`Date`) o seleccionable por franja horaria (*Real*, *Mañana*, *Mediodía*, *Tarde*, *Noche*), además de adelanto manual de `+2 horas` en tiempo real.
* **Transformación en Tiempo Real:** Transición fluida entre **Fighter**, **Gerwalk** y **Battroid** con físicas diferenciadas, impulsos direccionales en *Battroid* y retroceso rápido táctico en *Gerwalk*.
* **Sistema de Control de Tiro DYRL y Contramedidas:**
  * **HUD Vectorial 2D:** Retículas hexagonales enemigas, rastreadores **Multi-Lock simultáneo de hasta 4 blancos**, indicadores de alerta para misiles entrantes y panel de telemetría/propulsión.
  * **Gunpod GU-11 con Detección Continua:** Proyectiles de alta velocidad con *motion blur* y detección por segmento para interceptar tanto unidades **Regult** (`regult.glb`) terrestres/aéreas como misiles enemigos en vuelo.
  * **3 Perfiles de Micro-Misiles:** Modos seleccionables **`LIGERO`** (salva de 4), **`PESADO`** (ojiva de alto impacto) y **`ESPECIAL`** (4 misiles pesados) con trayectoria en zigzag y estela de humo instanciada (`InstancedMesh`).
  * **Evasión Estilo *Macross VOXP* y Bengala/Chaff:** Los misiles enemigos cuentan con espoleta de proximidad y rebase (*overshoot*), pudiendo evadirse mediante velocidad, giros cerrados, retroceso rápido en *Gerwalk* (`R`) o desplegando señuelos **Chaff/Flares** (`C`) en modo *Fighter*.
* **Soporte Completo de Teclado y Gamepad (Xbox / PS2):** Menú de opciones con detección automática de mando, diagrama interactivo de botones, reasignación personalizable guardada en `localStorage` y detección de conflictos.
* **Audio Dinámico en OGG y Síntesis Web Audio:** Música de título y combate (`BGM`), reproductor de prueba de pistas, controles independientes de volumen (`SFX` / `BGM`), modulación continua de turbinas y alerta progresiva de misiles.

---

## Controles de Vuelo y Combate

### Navegación y Sistemas

| Tecla | Mando (Xbox / PS) | Acción |
| :--- | :--- | :--- |
| **`Enter`** | **`Start / Inicio`** | **Iniciar misión** desde la pantalla de despliegue |
| **`Esc`** | — | **Regresar** al menú principal durante la misión |
| **`P`** | **`Start / Inicio`** | **Pausar / Reanudar** y abrir menú de opciones |
| **`M`** | — | **Silenciar / Activar** música de fondo (`BGM`) |
| **`H`** | — | **Adelantar reloj (+2 horas)** en Isla South Ataria |
| **`Y` / `N`** | **`A (×)` / `B (○)`** | Tras ser derribado: reiniciar misión o volver al menú |

### Transformación de Modos

| Tecla | Mando (Xbox / PS) | Acción |
| :--- | :--- | :--- |
| **`F`** | **`Cruceta ← / →`** | Transformar a modo **Fighter** (caza supersónico) |
| **`G`** | **`Cruceta ← / →`** | Transformar a modo **Gerwalk** (VTOL / empuje vectorial) |
| **`B`** | **`Cruceta ← / →`** | Transformar a modo **Battroid** (mecha bípedo) |

### Movimiento en Modo Fighter (`F`)

| Tecla | Mando (Xbox / PS) | Acción |
| :--- | :--- | :--- |
| **`W` / `S`** | **`Cruceta ↑ / ↓`** | Aumentar / Reducir empuje (*Throttle*) |
| **`A` / `D`** | **`LB` / `RB`** *(giro)* | Guiñada horizontal (*Yaw* izquierda / derecha) |
| **`Flecha Izq` / `Der`** | **`Stick Izq. ← / →`** | Alabeo (*Roll* izquierda / derecha) |
| **`Flecha Arriba` / `Abajo`** | **`Stick Izq. ↑ / ↓`** | Cabeceo (*Pitch* picada / elevación) |
| **`T`** *(mantener)* | **`RT` / `R2`** *(mantener)* | **Turbo / Postcombustión** (vigilar temperatura de turbinas) |
| **`X`** | *(Asignable)* | **Full Stop** (frenado total a 0%) |

### Movimiento y Rastreo en Modos Gerwalk (`G`) y Battroid (`B`)

| Tecla | Mando (Xbox / PS) | Acción |
| :--- | :--- | :--- |
| **`W` / `S`** | **`Cruceta ↑ / ↓`** | Avanzar / Retroceder |
| **`A` / `D`** | **`LB` / `RB`** | Desplazamiento lateral (*Strafe* izquierda / derecha) |
| **`Flecha Izq` / `Der`** | **`Stick Izq. / Der. ← / →`** | Girar sobre el eje vertical |
| **`Flecha Arriba` / `Abajo`** | **`Stick Der. ↑ / ↓`** | Ascender / Descender altitud (`0G` en Órbita de Saturno) |
| **`R`** *(mantener)* | **`LT` / `L2`** *(mantener)* | **Reversa rápida en Gerwalk** (rompe el seguimiento de misiles cercanos) |
| **`T`** *(pulsar en Battroid)* | **`RT` / `R2`** | **Impulso direccional con Verniers** en modo **Battroid** |
| **`N`** | **`A / ×`** *(mantener)* | Alternar / Fijar auto-rastreo en modo **Battroid** (`ENEMY` ➔ `MISSILE` ➔ `NONE`) |
| **`E`** | **`Y / △`** | Ataque cuerpo a cuerpo con Gunpod (solo en modo **Battroid**) |

### Armamento y Contramedidas

| Tecla | Mando (Xbox / PS) | Acción |
| :--- | :--- | :--- |
| **`Shift Izq`** *(mantener)* | **`X / □`** *(mantener)* | Disparar ráfaga continua de **Gunpod GU-11** |
| **`Espacio`** | **`B / ○`** | Lanzar salva de **Micro-Misiles** (repartidos en Multi-Lock) |
| — | **`Select / Back`** | Cambiar perfil de misiles (**`LIGERO`** / **`PESADO`** / **`ESPECIAL`**) |
| **`C`** | **`R3`** | Desplegar **Chaff / Flares** (señuelos antimisiles en modo **Fighter**) |

---

## Estructura del Proyecto

```text
macross-voxp-web/
├── index.html              # Estructura principal, pantalla de despliegue, opciones y carga de módulos
├── three.min.js            # Motor gráfico Three.js (WebGL 2.0)
├── GLTFLoader.js           # Cargador de modelos 3D GLB
├── css/
│   └── style.css           # Estilos de la interfaz, selector de mapas, opciones y HUD
├── fonts/                  # Tipografía Conthrax para la interfaz y el HUD
├── models/                 # Modelos 3D: Valkyrie (vf1a.glb), SDF-1 (sdf1.glb) y Regult (regult.glb)
├── textures/               # Sprites de explosiones, mapa de Saturno y anillos (saturn.webp, saturn_rings.webp)
├── videos/                 # Videos para las pantallas gigantes del interior del SDF-1 (dyrl1-3.mp4)
├── sounds/                 # Música de fondo (BGM), efectos de sonido y turbinas en OGG
└── js/
    ├── audio.js            # Motor Web Audio API, síntesis de Chaff, control de volumen y alertas
    ├── controls.js         # Gestión y reasignación de controles de teclado y gamepad (Xbox / PS2)
    ├── environment.js      # Isla South Ataria, Macross City, SDF-1, ciclo día/noche y colisiones
    ├── env_saturn.js       # Órbita de Saturno, anillos planetarios, asteroides y polvo espacial 0G
    ├── env_interior.js     # Interior del SDF-1 Macross (DYRL), auditorio láser, pantallas y ventanal
    ├── hud.js              # Renderizado 2D del HUD, retículas Multi-Lock, marcadores y paneles
    ├── weapons.js          # Gunpod continuo, perfiles de misiles, Chaff, humo instanciado e IA Regult
    ├── player.js           # Animaciones, propulsores, física atmosférica/0G, térmica y auto-rastreo
    └── main.js             # Bucle principal, cámara orbital de inicio, selector de mapas y estados
```

---

## Ejecución Local

Dado que el proyecto carga modelos `.glb`, texturas `.webp`, videos `.mp4` y archivos de audio `.ogg` mediante `fetch`, debe ejecutarse a través de un servidor web local (por ejemplo, la extensión **Live Server** en VS Code o `python -m http.server`) y no abriendo el archivo `index.html` directamente con doble clic.
