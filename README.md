# ORBI Sentinel IA — Foundation Expanded

> Control inteligente CCTV multi-marca perimetral, diagnóstico de comunicaciones, analítica de eventos y generación de evidencia técnica.

**Versión Actual:** `v0.16.4-sentinel-local-devserver-startup-fix`  
**Motor Interno:** ORBI Vision Core  
**Hotfix Status:** `HOTFIX 16C-DEVSERVER APPLIED / LOCAL DEV SERVER STARTUP FIX`

---

## 🚀 Líneas de Negocio Comerciales

ORBI Sentinel IA se bifurca en dos soluciones modulares que atienden demandas de seguridad y conectividad específicas:

1. **ORBI Sentinel IA Field (Sector Industrial):** Parques solares, faenas mineras, industrias y recintos técnicos aislados. Optimizado para radioenlaces de gran distancia, telemetría de switches PoE y modelado de interferencias por seguidores solares (trackers).
2. **ORBI Sentinel IA Community (Sector Residencial):** Condominios, edificios de departamentos y espacios comunes comunitarios. Enfocado en control de aforos peatonales, accesos vehiculares de madrugada, conserjería simplificada y cumplimiento riguroso de privacidad de menores.

---

## 📖 Arquitectura de Próxima Fase (RTSP / ONVIF / Local Gateway / FFmpeg)

Este documento detalla la planificación arquitectónica técnica para conectar la plataforma a cámaras de video reales en terreno utilizando el Sentinel Local Gateway, decodificación por hardware local y almacenamiento local seguro.

```
                    [ Entornos de Vigilancia LAN ]
 ┌──────────────────────────────────────────────────────────────┐
 │  Cámaras PoE Dahua (ONVIF)   ┐                               │
 │                              ├─► [ Sentinel Gateway local ]  │
 │  Cámaras WiFi Eufy (RTSP)    ┘   (Daemon FFmpeg & Micro-NVR) │
 └──────────────────────────────────────────────┬───────────────┘
                                                │  Túnel Seguro WireGuard
                                                ▼
                                      [ API ORBI Sentinel IA ]
                                      (Servicio Central en la Nube)
```

### 1. Ingesta de Video local con FFmpeg
El software de grabación local (**Sentinel Edge Recorder**) corre de forma persistente en un PC o notebook del cliente (actuando como Gateway local):
- **Daemon Ingestor:** Utiliza un subproceso nativo de **FFmpeg** configurado para leer de forma asíncrona la transmisión de video RTSP de cada canal (`rtsp://<ip>:554/live`).
- **Segmentación H.264 Copystream:** Para evitar el uso excesivo de CPU en el computador del cliente, FFmpeg no re-codifica el video; simplemente divide la transmisión en bloques de 5 o 10 minutos (`-c:v copy -f segment`), escribiéndolos directamente al almacenamiento local en formato `.mp4` o `.ts`.
- **Rotación Automática:** Un daemon monitorea el disco duro y aplica políticas de rotación de retención (3, 7, 15 o 30 días), purgando los archivos más antiguos de forma segura.

### 2. Integración de Cámaras de Consumo (Consumer Bridge - Eufy)
Las cámaras de consumo masivo (como **Eufy E220/C220** o **Tapo**) son ideales para interiores comunes o conserjerías de menor presupuesto:
- **Puente RTSP local:** Estas cámaras no transmiten a internet de forma abierta. Para integrarlas, el cliente debe habilitar la opción de **Almacenamiento NAS (RTSP Stream)** dentro de la aplicación móvil oficial de Eufy/Tapo.
- **Requisitos de LAN Común:** La cámara WiFi y el Sentinel Gateway local deben compartir el mismo segmento de red (LAN), permitiendo al daemon local FFmpeg capturar la transmisión local cifrada mediante clave estática sin depender de servidores en la nube propietarios de terceros.
- **Diferencia Técnica:** A diferencia de las cámaras **Dahua PoE industriales**, las cámaras de hogar no soportan el protocolo ONVIF para control de domos PTZ ni ofrecen métricas de consumo de potencia del Switch PoE, lo que se detalla de forma transparente en nuestra **Matriz de Compatibilidad**.

### 3. Descubrimiento ONVIF de Red
- El gateway local ejecuta escaneos periódicos usando el protocolo **WS-Discovery** enviando paquetes UDP multicast (`239.255.255.250` puerto `3702`) para descubrir automáticamente cámaras IP industriales compatibles con ONVIF Perfil S/T. Esto permite recuperar de forma remota parámetros del fabricante, marcas, y sincronizar eventos de movimiento pre-analizados en el chip del dispositivo.

---

## 🧪 Módulo 1B — RTSP Snapshot & Live Preview Lab

Esta fase habilita la captura controlada de fotogramas (snapshots) y prepara la arquitectura para visualización en vivo (previews) desde cámaras de laboratorio Dahua locales.

### 1. Diferencia de Modos Operacionales
*   **Modo Demo/Simulado (Por Defecto):** Retorna fotogramas realistas simulados generados por IA, garantizando que todo el flujo visual compile y funcione sin dependencias físicas de red. No realiza llamadas HTTP reales ni abre sockets locales.
*   **Modo Lab Real:** Si la bandera de seguridad está activa, habilita el botón técnico para solicitar capturas reales a la IP del Gateway local, con retroalimentación en caliente del estado del socket de red.
*   **Modo Producción Futuro:** Escalamiento en la nube central con túneles VPN WireGuard y balanceo de carga para decodificación perimetral paralela.

### 2. Activación de Conectores Reales (Safety Bandera)
Para proteger la integridad de la red local, los conectores físicos están aislados detrás de una bandera explícita de entorno. Para habilitarlos, agregue en su archivo `.env` local:
```env
# Habilita conectores físicos reales de red para pruebas de laboratorio local
ORBI_SENTINEL_LAB_REAL_CONNECTORS=true
```
Si la variable está ausente o en `false`, los controladores operan en modo simulado hermético (fallback mock).

### 3. Reglas de Credenciales Seguras (Access Security)
Para evitar incidentes de seguridad y fugas de datos:
*   Las contraseñas de las cámaras reales **nunca** se almacenan en texto plano en la base de datos ni se muestran en los logs de la consola.
*   En la interfaz de usuario y configuraciones, las rutas RTSP se redactan de forma obligatoria, enmascarando el password: `rtsp://admin:••••••@192.168.1.108:554/cam/realmonitor...`.
*   Se soportan modos de credenciales temporales en memoria de sesión, variables de entorno locales, y enlaces listos para el cifrado simétrico real en el **Sentinel Access Vault**.

### 4. Arquitectura de Streaming Futura (FFmpeg / WebRTC / HLS / MJPEG)
*   **FFmpeg Command Pipeline:** Preparado para orquestar subprocesos de ingesta nativos locales en Módulos 1C/1D.
*   **WebRTC / HLS:** Para navegadores modernos, se estructurará un bridge WebSocket en el Gateway para convertir el stream RTSP H.264 directo en segmentos fMP4 o WebRTC de latencia ultra-baja.
*   **Limitaciones Actuales:** Esta fase **no** implementa grabación continua real, no guarda clips de video en disco físico, ni retransmite secuencias fuera de la red local.

*Próximo Módulo Sugerido:* **Módulo 1C — Real Health Check & Camera Capability Validation**

---

## 🧪 Módulo 1E — FFmpeg Adapter & Secure Clip Segmentation Lab

Este módulo introduce la arquitectura del adaptador **FFmpeg** para captura y segmentación controlada de clips de video cortos desde cámaras RTSP de laboratorio, dando un paso crucial hacia un grabador local real y seguro.

### 1. Requisitos del Sistema (FFmpeg Environment)
*   **Detección Dinámica:** El Gateway local detecta la presencia del binario `ffmpeg` en el `PATH` del sistema de manera no invasiva (usando comandos rápidos como `ffmpeg -version`).
*   **Fallback Seguro (Mock):** Si FFmpeg no está instalado en el equipo del desarrollador, el sistema opera de forma transparente en modo simulación (mock), garantizando la continuidad operativa y la posibilidad de compilar y probar la aplicación sin requerir dependencias físicas complejas.

### 2. Safety Flags de Entorno
El grabador respeta rigurosamente las siguientes banderas de seguridad:
*   `ORBI_SENTINEL_LAB_REAL_CONNECTORS=true`: Habilita la conexión real con las cámaras locales de pruebas.
*   `ORBI_SENTINEL_LAB_RECORDING_ENABLED=true`: Habilita la lógica interna del grabador para persistencia.
*   `ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED=true`: Habilita explícitamente el disparador del comando FFmpeg local.
*   *Nota:* Si cualquiera de estas banderas está en `false`, el sistema bloqueará la llamada al comando real y revertirá automáticamente a simulación mock.

### 3. Reglas de Credenciales y Ocultación de Secretos
*   Las contraseñas de las cámaras RTSP **nunca** se graban en logs, reportes, ni se exponen en la interfaz.
*   En cualquier traza o reporte técnico, las URLs RTSP se enmascaran obligatoriamente: `rtsp://admin:••••••@IP:554/...`.

### 4. Arquitectura de Carpeta Sandbox Lab (Clip Storage Sandbox)
Los clips generados y su metadata se organizan estrictamente dentro de un directorio aislado en el host del Gateway:
```
orbi-sentinel-lab-recordings/
├── clips/         # Archivos de video MP4 cortos segmentados (max 60s)
└── metadata/      # Estructura JSON con metadata, auditoría y checksums
```
El sistema restringe la escritura exclusivamente a esta ruta para evitar vulnerabilidades de path traversal.

### 5. Reglas de Privacidad Activas (Privacy Shield)
*   Las cámaras ubicadas en zonas privadas (`privacyZone: "private"`) tienen la captura real FFmpeg **estrictamente bloqueada** por diseño en el código (retornando error seguro de Privacidad).
*   Se prohíbe la grabación de espacios de menores de edad o fachadas de vecinos.

### 6. Limitaciones de Laboratorio
*   **Sin Grabación Productiva Continua:** No se permite grabación continua 24/7 en esta fase.
*   **Duración de Clips Acotada:** Los fragmentos de captura manual están limitados a **60 segundos como máximo** (10s, 30s, 60s) para evitar llenado de disco accidental.

## 🧪 Módulo 1F — Secure Playback & Evidence Export Lab

Este módulo introduce la arquitectura segura de reproducción local, verificación de integridad, empaquetado y exportación controlada para grabaciones periciales de laboratorio.

### 1. Secure Playback Center
*   **Visualización Restringida por Rol:** El reproductor seguro bloquea de manera absoluta la visualización física al rol `Conserje`.
*   **Privacy Shield Activo:** Cualquier clip que pertenezca a una cámara en zona de privacidad (`privacyZone: "private"`) tiene su visualización y streaming bloqueados de forma inmediata por el servidor de streaming pericial local, retornando respuestas HTTP 403 con logeo automático de auditoría.
*   **Reproductor Integrado:** Diseñado con controles interactivos, visualización de metadatos del clip, enmascaramiento dinámico de IPs y watermarks de marca de agua pericial activa.

### 2. Evidence Package Builder
*   **Firma Digital Criptográfica:** El sistema calcula firmas SHA-256 sobre la cadena de metadatos del clip e incorpora una opción interactiva para validar que no haya existido manipulación física de archivos de video.
*   **Generador de Paquete Pericial:** Si el operador tiene un perfil autorizado (Admin o Técnico) y proporciona una justificación pericial válida (mínimo 5 caracteres), el backend compila un manifiesto JSON completo firmado con código único `EPK-XXXXXX`.
*   **Redacción de Datos Confidenciales:** Los paquetes exportados enmascaran u omiten contraseñas, tokens de autenticación y rutas absolutas de servidor.

### 3. Registro de Auditoría Immutable
*   Cada evento operativo se registra directamente en el archivo JSON del clip (`auditTrail`):
    - `clip.created`: Registro de segmento inicial por el FFmpeg Adapter.
    - `clip.playback.opened`: Apertura segura del stream local.
    - `clip.playback.blocked`: Intento de visualización bloqueado por Privacy Shield.
    - `clip.export.package.generated`: Empaquetado firmado de evidencia exportable.
    - `clip.associated.incident`: Vinculación pericial a incidentes del Incident Center.

### 4. Limitaciones del Entorno Lab
*   **Rutas de Video:** Las URLs reales de streaming utilizan controladores seguros de redirección que admiten solicitudes de rango HTTP (Range-requests) para optimizar el búfer en navegadores web.
*   **Separación Estricta:** No se envían archivos ni reportes a servicios en la nube externos; toda la información de auditoría se resguarda en el host del Gateway local.

---

## 🧪 Módulo 1H — Real Dahua Lab Connection Checklist & Field Test Protocol

Este módulo implementa el protocolo guiado para preparar, ejecutar y documentar la primera prueba técnica controlada con equipamiento real (cámaras Dahua DH-IPC-HFW3449EN-AS-LED, switch PoE LS-DS0402A-DP6 y PC/notebook como Sentinel Gateway).

### 1. Preparación Física (Interactive Checklist)
*   **Inspección del Hardware:** Checklist estructurado para validar la conexión de las cámaras IP en puertos PoE autorizados, alimentación de energía estable, longitud de cableado UTP Cat6 y aislamiento físico del PC local que actúa como Gateway.
*   **Asistente de Prevalidación:** Permite evaluar la factibilidad de la prueba de laboratorio antes de encender transmisores de video o disparar subprocesos concurrentes.

### 2. Diagnóstico de Red en Tiempo Real (Reachability Matrix)
*   **Sub-Second Ping Diagnostics:** Ejecuta herramientas de diagnóstico ICMP hacia las IPs configuradas de los dispositivos Dahua de laboratorio con métricas detalladas de latencia e integridad de paquetes.
*   **HTTP Discovery Portal:** Verifica que el puerto HTTP (`80`) de administración web de las cámaras esté respondiendo activamente para validar que el firmware interno de la cámara se encuentre listo para comandos remotos.

### 3. Bóveda Temporal de Credenciales (Safety Vault)
*   **Sin Texto Plano ni Hardcodeo:** Permite al operador ingresar contraseñas de manera temporal en la sesión del navegador para validar conexiones sin persistir de forma insegura contraseñas maestras reales en texto plano.
*   **Máscara de Visualización:** Todas las credenciales introducidas de forma manual se manejan mediante inputs enmascarados, respetando directivas de ciberseguridad estrictas.

### 4. Ciclo de Vida de Pruebas Guiadas (Test Session Manager)
*   **Flujo Paso a Paso:** El instalador de red es guiado secuencialmente por una suite de pruebas modulares:
    1.  *Physical Readiness Checklist* (Conectividad PoE, Potencia y Red).
    2.  *ICMP Ping Diagnosis* (Reachability & Packet Loss).
    3.  *HTTP API Check* (Acceso web para administración).
    4.  *RTSP Video Stream Emulation* (Validación de perfil principal y secundario).
    5.  *Snapshot Capture Check* (Obtención exitosa de fotograma pericial).
    6.  *ONVIF Capability Discovery* (Comprobación de perfiles S/T y PTZ).
    7.  *FFmpeg Capture Trigger* (Comando de grabación corta de evidencia de 15 segundos).
    8.  *Integrity Verification* (Sincronización del clip generado al Edge Recorder y firma criptográfica SHA-256).
    9.  *Final Report Generation* (Generación de un informe de laboratorio que resume advertencias, fallos y éxitos).
*   **Gestión de Estados:** Cada sesión se almacena localmente en el navegador permitiendo el seguimiento de estados técnicos tales como `Draft`, `Running`, `Passed` (Validated), `Partial`, `Failed`, o `Archived`.

### 5. Integración con el Mosaico Visual (Live Wall Status)
*   **Feedback Inteligente por Rol:** El estado de las pruebas técnicas en curso se comunica de forma segmentada según el rol del usuario:
    - **Personal de Ingeniería / Administrador:** Visualiza etiquetas explícitas y dinámicas en tiempo real (`Dahua Lab Test Running`, `Validated`, `Partial`, `Failed`, `Pending`) con enlaces dinámicos directos al panel del protocolo.
    - **Personal de Vigilancia / Conserje:** Para evitar confusión o alertas infundadas, visualiza un mensaje simplificado e inofensivo (`Prueba técnica en curso` o `Sistema en revisión técnica`).

---

## 🏆 Módulo 1J — Real Dahua Lab Execution Report & MVP Freeze

Este módulo representa el hito de cierre del primer MVP demostrable de **ORBI Sentinel IA**, basado en el laboratorio PoE físico controlando hardware Dahua. Consolida resultados de calibración, QA visual, auditoría, estado de submódulos y limita el entorno de producción real mediante políticas estrictas de congelación.

### 1. Estado de Congelación del MVP (MVP Freeze Center)
El sistema dispone de un **Sentinel MVP Freeze Center** para certificar la estabilidad de la compilación y auditar el nivel de preparación técnica:
*   **Module Readiness Matrix:** Evalúa de manera interactiva el estado (Visual, Funcional, Seguridad, Documentación, Tipos de TS) de los 19 módulos funcionales de la plataforma.
*   **Freeze Checklist (17 items):** Un riguroso checklist interactivo que audita la robustez del sistema, la ausencia de contraseñas reales en texto plano, la existencia de enmascaramiento dinámico de rutas RTSP, y el cumplimiento de las restricciones por rol.
*   **Reporte Ejecutivo / Comercial:** Dashboard simplificado para inversionistas y partes interesadas comerciales que traduce el éxito técnico en propuesta de valor de negocio sin jerga de desarrollo.

### 2. Definición de Estados Operativos (¿Qué es Mock, Lab y Real-Ready?)
*   **Mock (Simulación):** Datos emulados deterministas y dinámicos para visualización rápida sin dependencias físicas de hardware. Habilitado de manera predeterminada para asegurar compilación exitosa en cualquier navegador o entorno Sandbox.
*   **Lab (Laboratorio Local):** Pruebas reales directas sobre la red LAN local conectando físicamente dispositivos (Cámara Dahua PoE y PC/Notebook local como Sentinel Gateway). Requiere el encendido de banderas seguras.
*   **Real-Ready (Estructurado para Despliegues de Terreno):** Código estructurado para interactuar con APIs reales, esquemas seguros de bases de datos persistentes locales, y decodificadores nativos de hardware.
*   **Production-Locked (No Habilitada):** La plataforma bloquea de forma explícita el uso productivo continuo 24/7 de video, la apertura de puertos públicos, la exposición de contraseñas de cámaras o la emisión de dictámenes judiciales absolutos.

### 3. Hardware de Laboratorio Certificado
La línea base de calibración de esta fase ha sido probada de forma exitosa sobre la siguiente topología de red local:
*   **Cámara de Pruebas:** Dahua 4MP DH-IPC-HFW3449EN-AS-LED (Soporta transcodificación FFmpeg de baja latencia con integridad técnica).
*   **Switch PoE:** LS-DS0402A-DP6 10/100 Mbps (Unidad pasiva de capa 1; telemetría de socket local).
*   **Sentinel Gateway:** PC/Notebook local actuando como concentrador local y ejecutando el daemon de captura FFmpeg.

### 4. Safety Banderas de Seguridad Activas
Para evitar incidentes de red o llenado accidental de disco duro, el sistema valida las siguientes variables de entorno:
*   `ORBI_SENTINEL_LAB_REAL_CONNECTORS=true` (Habilita conectores reales LAN).
*   `ORBI_SENTINEL_LAB_RECORDING_ENABLED=true` (Habilita lógica interna de grabación).
*   `ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED=true` (Dispara procesos nativos de FFmpeg local).

### 5. Procedimiento Recomendado para la Demostración Técnica (Demo Flow)
1.  **Ingreso por Rol:** Iniciar sesión con perfil **Administrador** o **Técnico de Terreno** para acceder a la barra de diagnóstico superior y el menú técnico.
2.  **Calibración de Línea Base (Módulo 1I):** Dirigirse al panel *Compatibility Matrix* o *Gateway Local* para realizar las pruebas de conectividad de red y bloquear de forma segura la calibración de línea base (`orbi_sentinel_calibration_locked`).
3.  **Generación de Evidencia (Módulo 1F):** Abrir el *Incident Center* para registrar un evento, vincular un fragmento de video simulado de la cámara calibrada y descargar el reporte técnico de evidencia.
4.  **Certificación del Cierre (Módulo 1J):** Abrir el *Sentinel MVP Freeze Center* para evaluar los 19 módulos, firmar el checklist de control de seguridad y exportar el informe ejecutivo de preparación para stakeholders.

### 6. Limitaciones del MVP actual
*   La telemetría del switch PoE es lógica-perimetral debido al diseño pasivo del switch LS-DS0402A-DP6.
*   La captura real de video requiere que el PC Gateway local ejecute el daemon FFmpeg en la misma subred de las cámaras.
*   Los archivos generados se almacenan temporalmente y se rotan con un tope de 60 segundos por clip para evitar colapso de almacenamiento.

### 7. Roadmap y Próximos Módulos
*   **Módulo 2C:** Smart Motion Core Analytics (Modelos de inteligencia artificial para filtrado perimetral avanzado y minimización de falsas alarmas por viento o follaje).
*   **Módulo 2D:** Sentinel Central VPN & Remote Tunneling Secure Protocol.

---

## 🧪 Módulo 2A — Eufy Consumer Bridge Validation Lab

Este módulo expande el sistema hacia la integración segura de cámaras WiFi residenciales (Eufy C220, E220) mediante un bridge local sin depender de nubes propietarias:
*   **Asistente de Configuración (RTSP Wizard):** Un asistente interactivo paso a paso para instruir al instalador sobre cómo activar el stream local RTSP/NAS de las cámaras desde la aplicación Eufy Security oficial.
*   **Safety Flag de Activación:** Almacenamiento seguro bajo la clave `ORBI_SENTINEL_CONSUMER_BRIDGE_ENABLED=true` para auditoría y control de compilación.
*   **Diferenciación de Soporte:** Matriz de compatibilidad segmentada con niveles específicos de integración (Full local ONVIF vs. RTSP Simple WiFi).

---

## 🏢 Módulo 2B — Community Pilot UX for Condominium Demo

Este módulo introduce una experiencia de demostración interactiva diseñada específicamente para comités de administración, copropietarios, administradores y conserjería de condominios:
*   **Intercambiador Dinámico de Roles en Demo:** Permite a los stakeholders alternar de manera instantánea entre las perspectivas operativas de **Conserje / Guardia**, **Administración Residencial** y **Técnico de Terreno** para apreciar el valor del software de extremo a extremo.
*   **Sentinel EasyView (Conserjería):** Interfaz táctil ultra-simplificada con lenguaje no técnico que prioriza la visualización de cámaras de uso residencial (Accesos, Estacionamiento, Piscina) y registro directo de incidentes de comunidad en 3 clics.
*   **Centro de Administración (Comité):** Dashboard financiero e inmobiliario con gráficos comparativos de costos (Industrial vs. Comunidad) e indicadores clave de disponibilidad de cámaras.
*   **Control de Privacidad Residencial (Privacy Shield):** Permite activar máscaras visuales de privacidad para proteger de forma estricta las zonas comunes de juego infantil, ventanas y terrazas de departamentos, previniendo la exposición y almacenamiento de rostros de menores o familias.
*   **Registro de Incidentes Comunitarios:** Módulo especializado para bitácora rápida de eventos residenciales comunes (ej: mascotas sueltas en jardines, portón vehicular abierto, ruidos molestos de copropietarios, uso indebido de estacionamiento de visitas).
*   **Dashboard Técnico de Diagnóstico:** Permite al integrador o técnico de terreno analizar la calidad de señal WiFi, tasa de pérdida de paquetes de los bridges domésticos y estado de ping de cámaras de consumo de manera segregada.
*   **Folleto Comercial y Checklist de Factibilidad:** Incluye un folleto ejecutivo listo para exportar al comité de administración que resume el valor del Micro-NVR de laboratorio y un checklist dinámico de 8 puntos para certificar si el edificio cumple con los requisitos de factibilidad de ORBI Sentinel IA Community.

---

## 🔒 Módulo 2C — Community Pilot QA & Sales Demo Lock

Este módulo consolida el control de calidad final, el resguardo estricto de privacidad residencial y el bloqueo técnico para habilitar demostraciones comerciales profesionales ante comités, administradores y partes interesadas de condominios:

### 1. Panel de Control "Community Pilot QA Lock"
*   **Ready/Locked Checklist:** Panel interactivo en la parte superior que permite auditar en vivo la preparación técnica de 6 tracks críticos: *Visual Readiness*, *Roles Readiness*, *Privacidad Residencial*, *Incidentes locales*, *Reportes libres de fugas* y *Narrativa Comercial*.
*   **Cómputo Dinámico de Estado:** El estado final se actualiza en tiempo real de acuerdo a la selección de las categorías: `Ready for Community Demo` (🟢), `Needs Review` (🟡), o `Blocked` (🔴).
*   **Declaración Explícita de Limitaciones:** Expone con total transparencia las limitaciones físicas y de licenciamiento del entorno demostrativo (no activa producción 24/7, no usa datos de condominios reales, no expone rostros de menores ni interiores, y aclara que no sustituye de forma absoluta sistemas de NVR críticos sin estudios previos de ancho de banda).

### 2. Panel de Valor Operacional (Community Value Dashboard)
*   **Enfoque no Financiero:** Redefinición completa del panel de administración residencial, renombrándolo para centrarse exclusivamente en indicadores operacionales, descartando estimaciones de rentabilidad certificada para evitar malentendidos legales.
*   **Métricas Clave Unificadas:** Monitorea de forma centralizada 11 métricas operacionales obligatorias (cámaras operativas, sin señal, abiertos/cerrados, tiempo de respuesta promedio de 12 minutos, zonas enmascaradas activas, clips SHA-256 disponibles, prefactibilidad de router local y recomendaciones mitigantes).
*   **Procedimiento de Exportación Autorizada:** Implementa un simulador interactivo de descarga de video que exige justificaciones legales (ej: requerimiento de la policía) y deja registro inmutable en el historial del turno.

### 3. Validación y Separación Estricta de Atribuciones por Rol
*   **Rol Conserje (Cero Tecnologías):** El guardia de turno tiene vedado el acceso a direcciones IP, rutas RTSP, claves, hashes de integridad y configuraciones de red. Todas las visualizaciones de cámaras y reportes se traducen a un lenguaje humano no alarmista ("Cámara sin señal", "Zona protegida por privacidad"). El toggle global de privacidad queda desactivado y en modo lectura de seguridad para este rol.
*   **Rol Administrador (Nivel Ejecutivo):** Diseñado con un tono claro y ejecutivo para toma de decisiones ágiles, análisis de flujo de incidentes y autorización formal de clips de video.
*   **Rol Técnico (Diagnóstico de Red):** Accede al mapa completo de red, diagnósticos de latencia de ping, bridge de cámaras de consumo (Eufy C220/E220) y configuraciones avanzadas del Edge Recorder.

### 4. Guion Comercial de Presentación (Sales Demo Script)
*   Se incorpora un acordeón didáctico con el guion comercial paso a paso (*El Problema*, *Solución Conserjería*, *Privacidad y Seguridad* y *Próximos Pasos Piloto*), estructurado de manera responsable para guiar la fuerza de ventas.

### 5. Checklist de Factibilidad de 13 Puntos Interactivos
*   El checklist de factibilidad para pilotos se amplía a 13 puntos de inspección detallados, incluyendo estados individuales con un ciclo de clic dinámico: `🟢 Listo`, `🔴 Pendiente`, `🟡 Requiere revisión` o `⚪ No aplica`.

---

## 🏢 Módulo 2D — Community Pilot Proposal & Presentation Pack

Este módulo transforma la demostración técnica en un paquete comercial y consultivo completo, listo para presentar ante el Comité de Copropietarios y la Administración de cualquier condominio de forma responsable, ética y sin sobreprometer:

### 1. Community Proposal Center
*   **Acceso Segregado por Roles:** Mapeo de atribuciones estrictas. Visible para el Administrador y Técnico como un portal ejecutivo, mientras que el rol Conserje visualiza un mensaje informativo simplificado ("Acceso Restringido") para evitar fatiga cognitiva o filtraciones sobre la infraestructura técnica.
*   **Estado General de la Propuesta (Package Status):** Indicador visual en tiempo real que mide el nivel de completitud de la propuesta (`Ready to Present`, `Needs Review`, `Missing Pilot Scope`, `Privacy Review Required`).

### 2. One-Page Executive Proposal
*   **Formulación Concisa:** Documento ejecutivo unificado que resume en una sola pantalla el problema del estrés en conserjería, la solución técnica de un solo toque (EasyView), los beneficios segmentados para residentes, administración y conserjería, políticas de privacidad residencial, y los próximos pasos.
*   **Copiado Rápido:** Botón directo para copiar la propuesta unificada al portapapeles.

### 3. Pilot Scope Builder (Constructor de Alcance)
*   **Sincronización Dinámica:** Formulario interactivo que permite ingresar el nombre de la comunidad, total de cámaras del recinto, cámaras sugeridas en piloto (estrictamente acotado de 1 a 3 para pruebas), zonas comunes permitidas (ej: portones, accesos peatonales, perímetros) y zonas estrictamente excluidas de grabación (ej: balcones, ventanas, piscinas íntimas).
*   **Actualización Instantánea:** Al modificar el formulario, se actualiza automáticamente el documento ejecutivo y el informe formal descargable.

### 4. Privacidad Residencial y Score de Preparación (Readiness Score)
*   **Directiva Privacy Brief:** Detalla los pilares del diseño ético de ORBI Sentinel IA Community (enmascaramiento por polígonos, exclusión de menores de edad, retención limitada a un máximo de 7 días, y bloqueo de exportación para operadores de turno).
*   **Checklist de Preparación de 10 Puntos:** Permite auditar interactivamente la factibilidad técnica y administrativa. El algoritmo calcula de manera dinámica el Score de Viabilidad: `Ready for Pilot` (🟢), `Pending Authorization / Hardware` (🟡), `Needs Review` (🟡), o `Blocked` (🔴).

### 5. Modo Presentación (Interactive Slide-Deck)
*   **Diapositivas Integradas:** Carrusel interactivo de 8 slides dentro de la aplicación con controles directos, diseñado para que el equipo comercial o técnico pueda guiar una junta de copropietarios en menos de 5 minutos, explicando el valor operacional, enmascaramientos de privacidad y compatibilidad responsable (cámaras Dahua IP PoE + WiFi Consumer Eufy Bridge).

### 6. Objection Handling Cards (Preguntas y Respuestas Éticas)
*   **Manual de Respuestas Responsables:** Tarjetas interactivas de FAQ diseñadas para disipar dudas críticas con total transparencia jurídica: aclara que el sistema NO reemplaza de forma absoluta los NVR contratados, detalla que la demo de laboratorio utiliza datos de simulación lógicos, y reafirma que la conserjería tiene vedada la descarga de evidencia física para evitar difusiones ilegales en redes sociales.

### 7. Roadmap Visual de 9 Etapas
*   **Steppers Cronológicos:** Flujo paso a paso desde el levantamiento inicial de cámaras, validación de accesos, enmascaramiento de privacidad, instalación física del micro-servidor de pruebas local, capacitación rápida de 5 minutos a conserjería, hasta el informe final de resultados para la toma de decisión.

### 8. Community Proposal Report (Markdown)
*   **Informe Técnico Completo:** Caja de código lista para ser copiada a documentos formales con formato Markdown limpio. Sintetiza todo el alcance personalizado por el constructor de alcance, el estado del checklist de viabilidad de 10 puntos, y la política de privacidad, descartando de forma estricta IPs, credenciales o contraseñas de red para cumplir directivas de ciberseguridad.

### 9. Guiones de Presentación Oral (Talk Tracks)
*   **Tres Duraciones Seleccionables:** Se incorpora un selector dinámico para previsualizar guiones cortos optimizados para diferentes escenarios comerciales: *30 segundos (Elevator Pitch)*, *2 minutos (Introducción de Comité)*, y *5 minutos (Presentación Detallada de Valor Operacional)*.

---

## 🔒 Módulo 2E — Community Proposal QA & External Demo Lock

Este módulo consolida el control de calidad final, la auditoría del lenguaje comercial y de privacidad, la introducción del "External Demo Lock" y la preparación formal para demostraciones externas ante comités residenciales:

### 1. Panel de Bloqueo Comercial "External Demo Lock"
*   **Ready/Locked Checklist:** Panel interactivo que consolida la preparación de todos los frentes comerciales y técnicos en un sub-tab dedicado dentro del Proposal Center.
*   **Estado de Viabilidad Dinámico:** Mapeo automatizado del score de viabilidad para garantizar el cumplimiento de las políticas de privacidad y los permisos de comités antes de iniciar presentaciones externas.
*   **Copia de Brief de Demostración:** Botón interactivo para exportar una guía completa de oratoria ética, límites de responsabilidad y estrategia consultiva al portapapeles.

### 2. Pase de Responsabilidad Lingüística (Responsible Language Pass)
*   **Trazabilidad Protegida:** Reemplazo sistemático del concepto erróneo de "bitácoras inmutables" por "registro de auditoría con trazabilidad local protegido mediante SHA-256" para evitar falsas promesas de indestructibilidad de datos.
*   **Mitigación de Garantías:** Actualización de toda la interfaz y del informe Markdown aclarando los límites de compatibilidad técnica y declarando explícitamente el uso de "valor operacional estimado" en lugar de "ahorros garantizados".

---

## 🧭 Módulo 2F — Community Live Demo Script & Guided Presentation Flow

Este módulo proporciona una ruta de demostración en vivo guiada paso a paso para presentar ORBI Sentinel IA Community de manera responsable ante administradores, comités residenciales o copropietarios:

### 1. Panel de Demostración Guiada "Guided Community Demo"
*   **Guía paso a paso interactiva:** Un módulo centralizado en *Control General > Guided Demo* que enseña qué mostrar, qué decir, qué no decir y los tiempos de oratoria recomendados.
*   **Acciones directas de navegación:** Botón integrado "Ir a Pantalla" que permite al presentador saltar automáticamente a la pantalla correspondiente al flujo de la demo.

### 2. Selector de Duraciones Dinámicas (3, 5 y 10 minutos)
*   **Demo Rápida (3 Minutos):** 5 pasos estratégicos enfocados en el problema, la facilidad de EasyView, la marcación rápida de incidentes, el Privacy Shield y la formulación del piloto acotado.
*   **Demo Estándar (5 Minutos):** 8 pasos que expanden el dolor residencial, la visualización ejecutiva del administrador, el valor operativo estimado y la compatibilidad multimarca consultiva.
*   **Demo Extendida (10 Minutos):** 12 pasos minuciosos que recorren detalladamente los roles, el Live Wall, los reportes de evidencia técnica, las cartas de manejo de objeciones y la hoja de ruta cronológica del piloto.

### 3. Selector de Adaptación de Audiencias (Audience Mode)
*   **Comité / Administración:** Enfoque comercial ejecutivo, trazabilidad SHA-256 y valor operativo estimado libre de sobrepromesas de ahorro garantizado.
*   **Conserjería / Guardias:** Enfoque operativo cercano, eliminación de la carga mental y demostración del uso táctil sin tecnicismos ni contraseñas.
*   **Técnico / Proveedor de CCTV:** Enfoque en compatibilidad abierta, flujos locales Edge no invasivos, y matriz diagnóstica de ping/latencia.
*   **Vecinos / Copropietarios:** Enfoque prioritario en el resguardo familiar, intimidad domiciliaria y el enmascaramiento estricto de pasillos y ventanas.

### 4. Checklist de Preparación Física (Live Demo Checklist)
*   Lista interactiva con estados dinámicos (**Ready** 🟢, **Needs Review** 🟡, **Blocked** 🔴) para verificar requisitos críticos de oratoria ética y visuales limpios antes de iniciar reuniones con clientes.

### 5. Plantilla de Seguimiento Comercial (Post-Demo Minuta)
*   Caja de texto copiable que genera una minuta ejecutiva redactada con base en la duración seleccionada, ideal para enviar por WhatsApp o correo electrónico para cerrar la firma del acta del piloto sin precios cerrados ni promesas ficticias.

---

## 🛡️ Políticas de Ciberseguridad y Cumplimiento

1. **Privacidad y Privacy Shield:** En el modo de demostración y laboratorio, queda prohibido el uso de imágenes familiares, menores de edad o fachadas de vecinos. La interfaz de **Privacy & Compliance** permite enmascarar rostros y áreas deslindes fuera de los muros de la propiedad.
2. **Encriptación de Claves:** Las credenciales operativas del **Access Vault** se guardan de forma cifrada simétricamente. Los diagnósticos automatizados y reportes AI filtran activamente cualquier contraseña o token, garantizando confidencialidad.
3. **Modo Conserje (EasyView):** Diseñado con lenguaje humano y botones grandes para guardias de turno. Excluye cualquier tecnicismo (direcciones IP, puertos PoE, voltajes, logs de firmware) para evitar la fatiga cognitiva del personal de vigilancia.

---

## 🔒 POST-2F — COMMUNITY GUIDED DEMO ACCEPTANCE LOCK

El flujo de demostración guiada **Community** ha superado con éxito la auditoría técnica y comercial correspondiente al hito **POST-2F ACCEPTED / COMMUNITY GUIDED DEMO LOCKED**:

1. **Rutas de Presentación Corregidas:** Las duraciones de 3, 5 y 10 minutos adaptan con precisión el nivel de detalle técnico, los mensajes críticos y las advertencias de riesgo operativo sin sobrepromesas ni redundancias.
2. **Navegación Directa Verificada:** Los botones integrados de salto de pantalla asocian correctamente cada paso con su interfaz de visualización respectiva sin exponer credenciales ni romper estados del rol activo.
3. **Adaptación de Audiencias (Audience Mode):** Reajuste total de vocabulario según la audiencia seleccionada (Administración, Conserjería, Técnicos de CCTV y Residentes).
4. **Guardrails Comerciales Visibles:** Panel lateral con bloqueos de venta claros (no prometer compatibilidad mágica universal, reemplazos de NVR absolutos ni ROI financieros directos certificados).
5. **Alcance del Piloto Nuanciado:** Se eliminaron las referencias fijas obligatorias de "10 días", reemplazándolas y matizándolas de forma transparente con un **piloto flexible recomendado de 7 a 15 días (configurable según acuerdo con el comité/administración)**.
6. **Live Demo Checklist de 9 Items:** Reestructuración formal de la lista de verificación previa a la reunión (Demo Mode activo, No datos reales, Privacy Shield visible, Reportes sin secretos, Proposal Pack listo, Guided Demo seleccionado, Audience Mode correcto, Post-Demo Minuta lista, Próximo paso definido).
7. **Post-Demo Minuta Copiable Modulada:** Plantilla de seguimiento limpia que se actualiza en tiempo real de acuerdo a la duración elegida sin incluir precios cerrados fijos ni datos sin autorización.

---

## 🛰️ MÓDULO 3A — SENTINEL FIELD SOLAR O&M PILOT DEMO (BLOQUE 3 OPENED)

Este módulo introduce formalmente el **Bloque 3 — Sentinel Field / Solar O&M Pilot**, habilitando una experiencia Field orientada a parques solares, faenas de O&M, recintos industriales y control perimetral técnico:

### 1. Centro de Operaciones "Field Operations Center"
*   **Nueva Interfaz Visual (Field Operations Center):** Dashboard unificado en *Control General > Field Operations Center*, diseñado con una estética premium de fondo oscuro, glassmorphic, visualización rápida en terreno y responsive.
*   **Sitios Demo Ficticios:** Mapeo de plantas solares emuladas no confidenciales: *Parque FV Demo Sur*, *Parque FV Demo Centro*, y *Parque FV Demo Cordillera*, detallando capacidad, conectividad, estado CCTV, e incidentes abiertos sin exponer datos reales de clientes.
*   **Mapa Operacional por Zonas:** Desglose detallado de 14 zonas operacionales críticas (Portón principal, Camino de acceso, Cerco perimetral norte/sur, Área inversores, Centros de transformación, Sala eléctrica/control, Bodega, Patio de materiales, Línea MT/servidumbre, Estación meteorológica, Sector tracker/mesas FV, Estacionamiento técnico, Punto ciego) mostrando estados, cámaras asociadas, últimos eventos, prioridad y recomendaciones.

### 2. Experiencia de Roles Adaptada (Field EasyView vs. Admin/Técnico)
*   **Field EasyView (Rol Conserje/Guardia):** Consola operativa simplificada libre de complejidades técnicas (oculta IPs, puertos, hashes, RTSP, credenciales) mostrando únicamente estados de cámaras perimetrales, alertas pendientes, y botones interactivos rápidos para registrar incidentes en terreno y avisar al supervisor.
*   **Field Admin Dashboard (Rol Administrador):** Panel ejecutivo con métricas de salud general CCTV, riesgos perimetrales, recomendaciones O&M y un resumen del estado del sitio.
*   **Field Technical Diagnostics (Rol Técnico):** Diagnóstico avanzado que detalla latencias, pérdida de paquetes, puertos PoE, estado ONVIF/RTSP del Gateway emulado, e identificación de sombras estructurales generadas por rotación de seguidores (trackers).

### 3. Flujo de Incidentes y Context AI
*   **Workflow de Incidentes de Terreno:** Registro y gestión de anomalías críticas (Intrusión perimetral, Portón abierto, Cámara sin señal, Vista obstruida, Movimiento fuera de horario, Persona en inversores, Vehículo no identificado, Vegetación, Robo de cable/string, Enlace inestable) con cambios de estado y asignación de prioridades en tiempo real.
*   **Context AI Solar Assistant:** Clasificación emulada de patrones contextuales ordinarios de planta (paso de trackers, técnicos en mantenimiento programado, viento) vs alarmas que requieren atención (intrusión de madrugada, vehículo detenido en accesos secundarios) utilizando un lenguaje responsable.

### 4. Reportabilidad y Preparación (Evidence Report & Readiness Checklist)
*   **Field O&M Evidence Report:** Generación y copiado al portapapeles de un informe técnico en formato Markdown con SHA-256 local que recopila el estado del parque, las cámaras revisadas, los incidentes abiertos y las limitaciones legales.
*   **Field Readiness Checklist:** 16 puntos interactivos para auditorías preliminares antes del despliegue del piloto físico (permisos O&M, mapeo de red local, ubicación física del Gateway, enmascaramiento, prevenciones HSE, etc.).
*   **Matriz Comparativa de Líneas (Field vs. Community vs. Consumer):** Tarjeta descriptiva que clarifica el enfoque industrial de Field (trackers, PoE industrial, radioenlaces perimetrales) frente al residencial de Community y el doméstico de Consumer.
*   **Guardrails de Demostración Field:** Advertencias de responsabilidad explícitas (No prometer detección infalible de intrusiones, prevención absoluta de robos, reemplazo de guardias, o integración SCADA en vivo; Sí afirmar consolidación visual, asistencia a O&M y piloto preliminar seguro).

---

## 🔒 MÓDULO 3B — FIELD SOLAR O&M QA & DEMO LOCK

El módulo de demostración **Field Solar O&M** ha sido completamente auditado, estabilizado y bloqueado comercialmente bajo el hito **v0.3.1-sentinel-field-solar-om-demo-lock**:

### 1. Panel de Bloqueo de Calidad (Field Solar O&M QA Lock Center)
*   **Pestaña de Auditoría ("Field QA Lock Panel"):** Se añadió un panel centralizado e interactivo que presenta la validación formal de los 8 pilares del sistema Field (Estética Visual, Roles, Datos Ficticios, Incidentes, Reportabilidad de Lab, Diagnósticos, Lenguaje de IA Responsable y Guardrails Comerciales).
*   **Matriz de Conformidad Técnica & Ética:** Validación de cada aspecto del sistema de manera visible, garantizando transparencia técnica en presentaciones con stakeholders.

### 2. Formato Copiable de Demostración (Field Demo Brief)
*   **Caja de Documento Brief Copiable:** Bloque copiable con un solo click que contiene la síntesis ejecutiva del hito: versión, capacidades demostrables, límites de responsabilidad ética, audiencias recomendadas (O&M directores, inspectores, comités), duración sugerida (5 a 10 min) y próximos pasos de levantamiento físico.

### 3. Mitigación y Sanitización Estricta de Datos & Lenguaje
*   **Sin Datos Reales:** Confirmación de direccionamientos puramente locales (`192.168.10.x`), plantas simuladas y desconexiones de laboratorio emuladas.
*   **Alineación de Terminología Responsable:** Reemplazo sistemático de declaraciones categóricas por opciones probabilísticas preventivas:
    *   "Intrusión perimetral" cambiado a "Posible intrusión perimetral".
    *   "Robo confirmado" cambiado a "Posible evento de robo a revisar".
    *   "Cámara fallida" cambiado a "Cámara sin señal / requiere revisión".
    *   "Evidencia legal" cambiado a "Evidencia técnica de laboratorio".
*   **Enfoque no Judicial:** Los reportes de incidentes y evidencia declaran explícitamente pertenecer a bitácoras técnicas locales, descartando valor legal judicial o custodia certificada.

---

## 🔒 MÓDULO 3C — FIELD PILOT PROPOSAL & O&M PRESENTATION PACK

El módulo **Field Pilot Proposal & O&M Presentation Pack** ha sido diseñado para convertir la demo industrial Field en una propuesta comercial y operativa sólida, garantizando máxima transparencia, seguridad y delimitación de responsabilidades:

### 1. Centro de Propuestas Field (Field Proposal Center)
*   **One-Page Field Executive Proposal:** Un documento estructurado de una sola página listo para presentarse en 5 minutos ante gerencias de O&M y jefes de planta.
*   **Field Pilot Scope Builder:** Un constructor interactivo que permite parametrizar las características del parque (tipo PMGD/faena, canales existentes, número de cámaras sugeridas de 1 a 3, zonas incluidas y zonas excluidas por privacidad vecinal).
*   **Field Privacy & Authorization Brief:** Declaración explícita de principios de ciberseguridad industrial y ética (no uso de credenciales sin autorización, no exposición de IPs en reportes públicos, y no apertura de puertos).

### 2. Preparación y Mitigación de Riesgos
*   **Field Pilot Readiness Score:** Motor dinámico que calcula el nivel de preparación técnica del piloto basado en un checklist interactivo de 16 factores (permisos formales, validación HSE, coordinación de seguridad física).
*   **Modo Presentación O&M (9 Slides):** Un carrusel estructurado de 9 diapositivas integradas dentro del software para guiar la presentación de negocio (desafíos, zonas, incidentes clasificados, diagnóstico y roadmap).
*   **Tarjetas de Manejo de Objeciones (Objection Handling Cards):** Un manual dinámico interactivo con respuestas categóricas y responsables para mitigar falsas expectativas sobre prevención de robos, reemplazo de guardias o integraciones SCADA.

### 3. Reportabilidad y Trazabilidad de Negocio
*   **Field Pilot Proposal Report:** Copiado instantáneo en formato Markdown del informe de propuesta ejecutiva con todos los parámetros del Scope Builder, listo para su distribución por canales internos.
*   **Field Demo Talk Tracks:** Guiones y pautas sugeridas de discurso oral ajustables según la disponibilidad de tiempo de la audiencia (30 segundos, 2 minutos, 5 minutos o 10 minutos).
*   **Field Package Status:** Un indicador global que calcula la conformidad comercial del paquete antes de presentarse ante stakeholders reales.

---

## 🔒 MÓDULO 3D — FIELD PROPOSAL QA & EXTERNAL DEMO LOCK

El paquete de propuestas y presentación de la línea **Field** ha completado con éxito la auditoría de seguridad, lenguaje responsable y mitigación de riesgos operativos bajo el hito **v0.3.3-sentinel-field-external-demo-lock**:

### 1. Panel Consolidado (Field External Demo Lock)
*   **Pestaña Dedicada de Auditoría ("External Demo Lock"):** Añadido un noveno sub-tab interactivo dentro del **Field Proposal Center** que evalúa dinámicamente los 8 frentes de auditoría críticos para habilitar presentaciones controladas ante gerentes de O&M, jefes de planta y directores de seguridad.
*   **Frentes Evaluados Dinámicamente:** Propuesta Ejecutiva, Presentation Mode, Privacy Brief, Pilot Scope Builder, Readiness Score, Objection Cards, Proposal Report y el Responsible Language Pass. Los estados se calculan automáticamente como **Ready** 🟢, **Needs Review** 🟡 o **Blocked** 🔴.
*   **Estado Final de Auditoría:** Clasifica la reunión como `Ready for External Field Demo`, `Needs Review` o `Blocked` según el cumplimiento estricto del checklist y de los frentes técnicos.

### 2. External Field Demo Checklist (12 Factores Interactivos)
*   Integración de una lista de verificación detallada de 12 puntos obligatorios que el presentador comercial de ORBI Sentinel IA debe confirmar antes de la reunión externa (Modo Demo Activo, Sin Datos Reales, Sin IPs ni RTSP reales, Propuesta Lista, Slides Listas, Responsible Language Pass, Scope Builder configurado con un límite de 1 a 3 cámaras perimetrales, Readiness Score con más del 80% y firmas requeridas, Guardrails visibles en interfaz, Objection Cards operativas, Reporte Markdown limpio y Próximo paso definido).

### 3. Mitigación y Sanitización del Lenguaje en la Línea Field
*   **Responsible Language Pass:** Eliminación completa de promesas absolutas de detección y afirmaciones de validez legal en toda la línea Field.
*   **Sustituciones y Matices Estrictos:**
    *   *“Evidencia legal / Cadena de custodia legal”* cambiado de forma obligatoria por *“Evidencia técnica de laboratorio”* y *“Trazabilidad local”*.
    *   *“Prevención de robos”* suavizado a *“Apoya la supervisión y priorización de eventos de riesgo”*.
    *   *“Detecta intrusos”* cambiado a *“Ayuda a identificar posibles eventos a revisar”*.
    *   *“Funciona con cualquier cámara”* cambiado por *“Compatibilidad según cámara, protocolo, red y accesos autorizados”*.
*   **Transparencia de Límites:** El **Scope Builder** incluye ahora de forma visible que todo piloto requiere la validación y levantamiento técnico previo del cliente, y el **Privacy Brief** descarta explícitamente cualquier pretensión de "anonimato absoluto" en entornos de producción.

---

## 🛰️ MÓDULO 3E — FIELD LIVE DEMO SCRIPT & GUIDED O&M PRESENTATION FLOW

El sistema ahora cuenta con un presentador interactivo de demostraciones guiadas en vivo bajo el hito **v0.3.4-sentinel-field-guided-demo-flow** para conducir reuniones profesionales ante comités técnicos, gerentes de O&M y jefes de planta:

### 1. Panel Consolidado (Guided Field Demo)
*   **Pestaña de Presentación Interactiva:** Añadida una nueva vista dedicada bajo `Control General > Guided Field Demo` (visible exclusivamente para Administradores y Técnicos de Terreno) que asiste paso a paso en la narración técnica.
*   **Navegación Directa Integrada:** Cada paso del guión incluye un activador directo ("Ir a Pantalla") para cargar la vista correspondiente de la aplicación (Field Operations Center, Diagnostics, Evidence Report, etc.) agilizando la demostración.

### 2. Selectores de Duración y Audiencia
*   **Rutas de Tiempo Adaptables:** Selector interactivo para guiar la demo en 4 recorridos secuenciales:
    *   *Demo Rápida (3 min):* Visión general rápida de problemas operativos, Operations Center, Incidentes, Evidencia Técnica y propuesta acotada.
    *   *Demo Estándar (5 min):* Recorrido comercial/técnico completo de 9 pasos agregando el mapa de calor, Context AI y Diagnostics.
    *   *Demo Técnica (10 min):* Revisión exhaustiva de 12 pasos profundizando en roles, telemetría PoE, ONVIF, Readiness Score y Roadmaps.
    *   *Demo Extendida (15 min):* Presentación de 16 pasos detallando la separación de líneas de negocio (Field vs. Community vs. Consumer) y Privacy Briefs.
*   **Enfoques de Audiencia:** Adaptador dinámico que resalta conceptos clave, focos, objeciones probables y recomendaciones de cierre para 8 perfiles clave: Gerente de O&M, Jefe de Planta, Supervisor Técnico, Seguridad Física, Cliente PMGD, Comité Técnico, Equipo HSE y Proveedores de CCTV.

### 3. Seguridad y Herramientas Responsables
*   **Field Demo Guardrails:** Panel permanente con recordatorios explícitos sobre lo que se debe afirmar (asistencia operativa, trazabilidad local, pilotos acotados) y lo que está estrictamente prohibido prometer (prevención perfecta de robos, reemplazo de guardias, validez legal).
*   **Live Field Demo Checklist:** Panel auditor de 14 puntos de control técnico y ético. Si factores clave como "Sin datos reales", "Guardrails visibles" o "Próximo paso definido" se marcan como pendientes, el estado final de auditoría cambia dinámicamente a **Blocked** o **Needs Review**.
*   **Minuta de Seguimiento O&M Copiable:** Una minuta de correo perfectamente estructurada que resume los alcances lógicos, compromisos del piloto de 1-3 cámaras y resguardos éticos para copiar en un solo clic.
*   **Close Script de Campo:** Cierre sugerido para alinear expectativas de manera honesta y profesional, centrado en comprobar la viabilidad en terreno mediante pruebas controladas.

---

## 🔒 AUDITORÍA DE ACEPTACIÓN POST-3E — FIELD GUIDED DEMO LOCKED

El flujo guiado de demostración Field ha superado con éxito la auditoría de aceptación final (**POST-3E ACCEPTED / FIELD GUIDED DEMO LOCKED**). Se han verificado la integridad de las rutas narrativas, la coherencia de las recomendaciones por audiencia, la visualización rigurosa de los guardrails éticos y el comportamiento adaptativo del checklist de seguridad industrial.

### 1. Estado Actual de la Demostración Guiada de Campo
*   **Aprobación Operacional:** La consola interactiva se encuentra bloqueada en estado seguro para uso externo frente a comités técnicos y clientes industriales.
*   **Integridad de Datos:** Garantía absoluta del uso exclusivo de datos de simulación sanitizados (Parque FV Demo Centro, Parque FV Demo Sur, Parque FV Demo Cordillera), sin direcciones IP reales, credenciales activas, coordenadas geográficas sensibles ni nombres de clientes reales en pantalla.

### 2. Uso Recomendado de las Rutas Temporales
*   **Demo Rápida (3 min):** Enfocada en captar interés inicial rápido de gerencias de operaciones O&M mediante la identificación de problemas operativos remotos y la visualización directa del Operations Center, incidentes simulados de mantenimiento y la formulación rápida de un piloto acotado.
*   **Demo Estándar (5 min):** Recorrido comercial idóneo para Jefes de Planta, recorriendo las zonas críticas perimetrales, el flujo simplificado de incidentes y la asistencia lógica Context AI sin exposición de red.
*   **Demo Técnica (10 min):** Diseñada para Supervisores Técnicos e Integradores, profundizando en estados de enlace PoE, latencias de red y el uso de diagnósticos avanzados.
*   **Demo Extendida (15 min):** Dirigida a Comités Técnicos detallados y equipos HSE, integrando explicaciones de privacidad industrial, la separación de líneas de negocio (Field, Community, Consumer) y las políticas éticas del tratamiento de video.

### 3. Matriz de Audiencias Validadas
*   **Gerente de O&M:** Foco en valor operacional agregado, priorización de fallas de infraestructura, reportes rápidos y la minimización de riesgos a través de un piloto acotado de 1-3 cámaras.
*   **Jefe de Planta:** Énfasis en el estado de salud diario del sitio, zonas críticas del perímetro solar e incidentes operacionales prácticos para coordinación de turnos.
*   **Supervisor Técnico:** Discusión detallada de protocolos RTSP/ONVIF, estado del Gateway local, latencias simuladas de enlaces y telemetría PoE pasiva.
*   **Seguridad Física:** Claridad absoluta en que la solución actúa como apoyo tecnológico al monitoreo humano y no como un reemplazo de patrullaje físico o de los guardias del sitio.
*   **Cliente PMGD:** Transparencia mediante reportes de evidencia técnica y delimitación ética de las capacidades reales de la analítica.
*   **Comité Técnico:** Factibilidad de red, requisitos de hardware industrial y revisión del roadmap cronológico de implementación del piloto.
*   **Equipo HSE:** Coordinación de actividades seguras en campo, respeto a las zonas perimetrales excluidas y no sustitución de procedimientos de seguridad física.
*   **Proveedor de CCTV:** Compatibilidad de hardware preexistente, resguardo de accesos autorizados y diagnóstico mutuo de puertos de switch.

### 4. Guardrails y Limitaciones de Responsabilidad
*   **Afirmaciones Autorizadas:** La plataforma ofrece asistencia técnica local, diagnóstico del estado físico y de transmisión de las cámaras de CCTV, priorización operativa de anomalías de red y generación estructurada de evidencia técnica de laboratorio.
*   **Declaraciones Prohibidas:** Queda estrictamente prohibido afirmar o prometer detección 100% infalible de intrusiones, prevención autónoma o perfecta de robos, reemplazo de guardias físicos, sustitución de sistemas SCADA o NVR de planta, y validez legal/judicial de los informes de trazabilidad generados de forma nativa sin validación externa.

### 5. Live Field Demo Checklist & Bloqueos de Seguridad
*   **Regla de Bloqueo Crítico:** Si los puntos de control clave **"Sin datos reales"**, **"Guardrails visibles"** o **"Próximo paso definido"** se marcan como pendientes en el checklist de pre-presentación, el sistema degrada de manera automática e interactiva el estado general de la demo a **Blocked** o **Needs Review**, impidiendo su ejecución completa segura hasta que el presentador mitigue dichos factores de riesgo.

### 6. Minuta de Correo Post-Demo O&M
*   **Estructura Responsable:** Resumen formal autogenerado y copiable que consolida el problema de O&M, el alcance limitado del piloto propuesto (estrictamente acotado a 1-3 cámaras y un periodo controlado de 7-15 días) y los compromisos de validación previa de compatibilidad de red sin incluir cotizaciones definitivas de venta masiva ni comprometer despliegues permanentes sin contrato.

### 7. Próximo Módulo Sugerido
*   **Módulo 4A — Sentinel Public Demo Hub & Sanitized Launch Center:** Realizado con éxito para unificar las tres líneas de producto (Field, Community, Consumer Lab) en una consola centralizada de demostración pública.

---

## 🛰️ MÓDULO 4A — SENTINEL PUBLIC DEMO HUB & SANITIZED LAUNCH CENTER

El sistema ahora cuenta con un centro de demostración unificado, sanitizado y ejecutivo bajo el hito **v0.4.0-sentinel-public-demo-hub** para conducir presentaciones globales, pitchs comerciales, comités de inversión y revisiones con stakeholders de alto nivel:

### 1. Hub Unificado de Navegación Comercial (Public Demo Hub)
*   **Pantalla de Inicio Centralizada:** Configurada como la vista principal por defecto en `currentTab === "publicdemohub"` para dar la bienvenida al usuario con una interfaz ejecutiva pulida y de alto impacto visual.
*   **Múltiples Líneas de Producto:** Tarjetas interactivas que unifican el acceso directo a:
    *   *Sentinel Field:* Operación industrial en plantas solares y diagnósticos avanzados de cámaras y switches PoE.
    *   *Sentinel Community:* Operación residencial para condominios, comités de copropietarios y resguardo de la privacidad familiar.
    *   *Consumer Lab:* Bridge emulado para validación doméstica segura de cámaras de consumo masivo (Eufy C220/E220).
*   **Botones de Navegación Rápida:** Enlaces directos ("Launch Console") para saltar con un solo toque al Dashboard de la línea respectiva.

### 2. Matriz de Madurez Tecnológica (Readiness Matrix)
*   **Comparativa Técnica y de Negocio:** Una tabla detallada que contrasta las tres familias de producto bajo variables clave:
    *   *Público Objetivo:* O&M/HSE en Field, Administradores en Community, y Clientes de Retail en Consumer.
    *   *Tipo de Conexión:* Red industrial cableada Cat6 vs. Wi-Fi Vecinal/Mesh vs. Wi-Fi Doméstico 2.4GHz.
    *   *Privacidad de Video:* Enmascaramiento geográfico vs. Enmascaramiento por polígonos vs. Modo Privado 100% Local.
    *   *Limitaciones de Demostración:* 1-3 cámaras perimetrales por planta solar, 1-3 cámaras vecinales comunes por condominio, y 1-2 cámaras de consumo para validación técnica en laboratorio doméstico.

### 3. Recomendador de Auditorías por Audiencia (Audience Profile Recommender)
*   **Selector Inteligente:** Permite escoger entre 6 perfiles comerciales e industriales típicos (Gerente O&M, Jefe Planta Solar, Comité Copropietarios, Conserjería/Guardia, Residente/Copropietario, Supervisor HSE).
*   **Sugerencias Dinámicas:** Ofrece recomendaciones específicas adaptadas a cada perfil:
    *   *Ruta sugerida:* Guided Field Demo, Guided Community Demo, EasyView, Diagnostics, o Privacy Center.
    *   *Tiempo estimado:* 3 min, 5 min, 10 min o 15 min.
    *   *Estrategia oral (Talk Tracks):* Focos clave de valor, objeciones típicas a responder y cierre sugerido.
*   **Lanzador de Presentación:** Botones integrados para iniciar directamente la presentación guiada correspondiente a la audiencia seleccionada.

### 4. Simulador de Ruta Guiada Express
*   **Recorridos Temporales pre-configurados:** Ofrece accesos rápidos a tres velocidades de demostración global:
    *   *60s Elevator Pitch:* Foco súper rápido en problemas de monitoreo y valor directo de la interfaz EasyView de un solo toque.
    *   *3m Resumen de Valor:* Enfoque intermedio en operaciones, mapa de calor, incidentes de O&M y enmascaramiento de privacidad.
    *   *5m Demo Técnica Completa:* Inmersión profunda de extremo a extremo que incluye diagnósticos CCTV, telemetría PoE, Context AI, SHA-256 e informes de evidencia técnica.

### 5. Frente de Auditoría y Launch Checklist (12 Factores)
*   **Pre-Flight Checklist:** Una robusta lista interactiva de verificación en tiempo real que asegura que la demostración pública opera bajo estrictos estándares éticos y de seguridad de la información.
*   **Cómputo Dinámico de Estado:** El estado general del Hub de lanzamiento se actualiza dinámicamente como:
    *   `Ready for Public Demo` 🟢: Cumple con el 100% de los factores obligatorios de sanitización de datos.
    *   `Needs Audit Review` 🟡: Faltan marcar elementos opcionales o se desactiva el Modo Demo de simulación.
    *   `Blocked` 🔴: Se desmarcan factores críticos de seguridad de la información como "Production Locked" o "No Real Data Visible".

### 6. Public Demo Brief & Minutas Copiables
*   **Ficha Comercial y Técnica Unificada:** Resumen en formato Markdown de las capacidades técnicas probadas y límites comerciales estrictos de las tres líneas de producto.
*   **Minuta de Reunión Global:** Un borrador de minuta de seguimiento comercial copyable al portapapeles diseñado para enviar a stakeholders clave después del pitch, detallando los acuerdos y el alcance limitado del piloto sugerido (1-3 cámaras, red local, sin contratos definitivos de venta masiva).

### 7. Adaptación para el Rol Conserje (Conserjería Pública)
*   **Versión Simplificada:** Cuando el rol activo es "Conserje", la vista del Hub se transforma automáticamente para ocultar matrices de madurez técnica avanzada, checklists de auditoría y comandos de lanzamiento complejos.
*   **Indicador de Dirección Segura:** Presenta un mensaje claro e interactivo que les permite dirigirse directamente al entorno simplificado de bajo estrés `EasyView` o volver a su flujo ordinario de trabajo.

### 8. Próximo Módulo Sugerido
*   **Módulo 5A — Cloud Telemetry & Unified Central Alert Center:** Implementación de un colector centralizado de alertas multisitio mediante almacenamiento en base de datos Cloud robusta (como Firebase Firestore), permitiendo consolidar la salud y eventos priorizados de múltiples Gateways locales de manera centralizada.

---

## 🔒 MÓDULO 4B — PUBLIC DEMO HUB QA & CONTROLLED LAUNCH LOCK

El módulo de auditoría final y bloqueo de demostración pública controlada ha sido completamente estabilizado y validado bajo el hito **v0.4.1-sentinel-public-demo-controlled-lock**:

### 1. Panel de Control "Public Demo Hub QA Lock"
*   **10 Frentes de Auditoría Dinámicos:** Se ha integrado un panel de control interactivo que audita en tiempo real la robustez técnica, ética y comercial del sistema en los siguientes frentes:
    1.  **Hero Section:** Verificación del versionado correcto y modo demo activo.
    2.  **Product Line Cards:** Bloqueos guiados activos en Field, Community y Consumer.
    3.  **Unified Readiness Matrix:** Grilla unificada de preparación técnica sin datos confidenciales expuestos.
    4.  **Global Demo Safety Panel:** Banderas de resguardo ético y seguridad perimetral civil en vista.
    5.  **Audience Quick Start:** Herramientas de adaptabilidad de oratoria listas.
    6.  **Public Demo Tour:** Guía interactiva paso a paso para el presentador.
    7.  **Launch Checklist:** Consola interactiva de 12 factores de auditoría pre-vuelo.
    8.  **Launch Status Widget:** Estado reactivo de lanzamiento (`Blocked`, `Needs Review`, `Ready for Controlled Public Demo`).
    9.  **Public Demo Brief:** Minuta de oratoria y hoja técnica copiable al portapapeles.
    10. **Credits & Origin Panel:** Atribución transparente del universo y créditos de co-diseño técnico.

### 2. Sello de Lenguaje "Ready for Controlled Public Demo"
*   Se actualizó toda la interfaz y los flujos lógicos para referirse explícitamente a una **demostración pública controlada** con datos sanitizados, evitando comprometer capacidades sin supervisión o prometer invulnerabilidad técnica.
*   **Políticas de Enmascaramiento y Bloqueo:** El estado global de lanzamiento queda dinámicamente condicionado al checklist. Desmarcar puntos de resguardo obligatorio (Sin Datos Reales, Guardrails Visibles, Producion Locked) bloquea de forma inmediata la demo (`Blocked` / `Launch Blocked`).

### 3. Ficha de Origen & Créditos Oficiales Consolidados
*   Se incorporó un bloque inamovible de créditos en el pie del panel:
    *   **Concepto, dirección creativa y universo:** Víctor M. León / ORBI Ecosystem.
    *   **Co-diseño, arquitectura, prompts y QA:** ChatGPT / OpenAI.
    *   **Implementación asistida y optimización:** Google AI Studio.
*   **Declaración Institucional:** *“ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.”*

---

## 📢 MÓDULO 4C — SENTINEL PUBLIC LAUNCH MEDIA KIT & VIDEO SCRIPT CENTER

El centro de comunicación pública sanitizada para ORBI Sentinel IA ha sido implementado y validado bajo el hito **v0.4.2-sentinel-public-launch-media-kit**:

### 1. Centro de Prensa y Lanzamiento "Sentinel Launch Media Kit"
*   **Ubicación y Acceso:** Integrado en la barra lateral bajo la categoría **Reportes y Matriz** y con un gatillador de acceso directo ("PREPARAR CONTENIDO PÚBLICO") en la cabecera del Public Demo Hub.
*   **Seguridad de Acceso:** Disponible con interfaz completa para **Administrador** y **Técnico**. Para el rol de **Conserje / Guardia**, se despliega una vista de bloqueo informativa simplificada explicando las políticas operativas de resguardo comercial.

### 2. Public Launch Safety Banner & Badges
*   Un banner persistente encabeza el Media Kit recordando que el contenido es público, simulado y sin datos reales:
    *   `Controlled Public Demo`
    *   `No Real Data`
    *   `Production Locked`
    *   `Privacy by Design`
    *   `Responsible Claims`
    *   `ORBI Ecosystem`

### 3. Video Script Generator
*   **Configuración por Duraciones:** Soporta la producción instantánea de guiones de **15, 30, 60 y 90 segundos**.
*   **Formatos del Lanzamiento:** Adaptación técnica-oral según formato: *YouTube Short*, *TikTok / Reels*, *Presentación institucional*, *Pitch comercial* o *Demo técnica breve*.
*   Cada guion se genera dinámicamente incluyendo estructuras de hook inicial, planteamiento del problema, presentación de la solución, segmentación por líneas (Field / Community / Consumer Lab), resguardo de privacidad e invitaciones comerciales responsables.

### 4. Guion Oficial de 30 Segundos
*   Estructura inmutable con marcas de tiempo rígidas que explican el valor sin sobredimensionar la infalibilidad:
    *   `0–5 s`: Planteamiento del problema (vigilancia lenta/dispersa).
    *   `5–12 s`: Introducción de ORBI Sentinel IA (centralización y diagnóstico).
    *   `12–20 s`: Líneas Field, Community y Consumer Bridge.
    *   `20–26 s`: Declaración de privacidad y demostración con datos sanitizados.
    *   `26–30 s`: Cierre y atribución de marca del Ecosistema ORBI.

### 5. Social Caption Generator
*   Permite generar publicaciones listas para compartir en **YouTube, LinkedIn, TikTok, Instagram, WhatsApp o Sitio Web**.
*   Adaptación por tono: *Profesional, Inspirador, Técnico, Comercial responsable* o *Creador/Fundador*, inyectando hashtags y resguardos éticos preaprobados.

### 6. One-Liner & Tagline Center (Con Sello de Advertencia)
*   Presenta el tagline principal: *“Simple por fuera. Potente por dentro. Responsable según el entorno donde opera.”*
*   **Frases Prohibidas:** Panel destacado en color rojo con un listado estricto de argumentos de venta prohibidos para evitar falsas promesas técnicas (ej. *"Detecta todos los robos"*, *"Reemplaza cualquier NVR"*, *"Compatibilidad con cualquier cámara"*).

### 7. Stakeholder Message Templates & Email Template
*   Fichas copiables optimizadas para mensajería directa (WhatsApp/Telegram) orientadas a audiencias específicas: *Gerente O&M, Comité de condominio, Administración residencial, Proveedor CCTV, Inversionista/socio, Aliado tecnológico, Equipo interno ORBI, y Video público*.
*   Incluye una plantilla de correo electrónico formal de invitación para agendar demostraciones controladas y proponer pilotos acotados (1 a 3 cámaras perimetrales por un plazo de 7 a 15 días).

### 8. Launch Media Readiness Checklist (Lógica de Bloqueo Inteligente)
*   Tablero de control de 12 factores de preparación mediática.
*   **Lógica de Bloqueo Crítica:** Si los puntos vitales de resguardo de datos y claims responsables se marcan como pendientes en el checklist, el estado global de prensa cambia a `Blocked`, deshabilitando de manera inmediata las acciones de copiado y exportación de todos los textos del Media Kit para mitigar el riesgo de filtraciones de información sensible.

### 9. Integración y Atribución de Créditos Oficiales
*   Mantiene los créditos inalterados en la base del panel, ofreciendo un selector dinámico para configurar el copiado en los materiales públicos:
    1.  **Créditos Completos:** Muestra atribución de Víctor M. León, ChatGPT, y Google AI Studio.
    2.  **Créditos Resumidos:** Fila de atribución abreviada de una sola línea.
    3.  **Ocultar Créditos:** Permite omitir la firma en los bloques copiados para flujos internos netamente comerciales.

---

## 🔒 MÓDULO 4D — PUBLIC LAUNCH MEDIA KIT QA & COMMUNICATION LOCK

El hito de auditoría final del material de prensa, guiones comerciales y claims de producto ha sido validado bajo la versión **v0.4.3-sentinel-public-media-communication-lock**, aplicando salvaguardas éticas y bloqueos de seguridad en caliente:

### 1. Panel Interactivo "Launch Media QA Lock"
*   **Sección Dedicada de Auditoría:** Incorporación de una nueva pestaña de control interactivo en `Reportes y Matriz > Launch Media Kit > Launch Media QA Lock`.
*   **Matriz de 10 Frentes de Auditoría:** El panel permite a directores comerciales y de producto auditar de forma minuciosa cada frente estratégico:
    1.  *Public Launch Safety Banner:* Presencia de badges descriptivos en la cabecera.
    2.  *Video Script Generator:* Verificación de duraciones (15-90s) y formatos éticos.
    3.  *Official 30-Second Script:* Cumplimiento de marcas de tiempo y aclaración ética obligatoria.
    4.  *Social Caption Generator:* Publicaciones adaptadas sin sobreprometer producción.
    5.  *Taglines & One-Liners:* Consistencia y fidelidad técnica del tagline de marca.
    6.  *Forbidden Claims Panel:* Visibilidad del panel de advertencia comercial.
    7.  *Stakeholder Messages:* Propuestas limitadas a pilotos de prueba acotados (1-3 cámaras perimetrales por 7-15 días).
    8.  *Public Demo Email:* Invitaciones formales estructuradas sin tarifas contractuales.
    9.  *Landing Page Copy:* Copybase de sitio web transparente con atribuciones.
    10. *Credits & Copy Actions:* Atribución institucional intacta y estado del portapapeles.
*   **Estados por Frente:** Cada frente cuenta con selectores manuales en caliente con estados `Ready` (Validado), `Audit` (Necesita Revisión) y `Block` (Bloqueado).

### 2. Bloqueo Reactivo de Copiado (Clipboard Lock)
*   **Lógica de Bloqueo General:** Si cualquiera de los 10 frentes es seteado en estado `Blocked`, o si los factores vitales del checklist de prensa se marcan como pendientes, el Media Kit entra en estado crítico de **Media Blocked**.
*   **Inhabilitación del Portapapeles:** En estado `Media Blocked`, se deshabilitan de inmediato todas las acciones de copiado y exportación pública en el portapapeles, desplegando un banner rojo con el mensaje:
    *   *“Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.”*

### 3. Filtro Ético General (Responsible Communication Pass)
Se realizó una auditoría y reescritura total de todos los textos públicos generados (guiones, captions, correos, minutas, fichas) reemplazando de forma obligatoria las palabras técnicas de riesgo operacional por equivalentes responsables:
*   ❌ *"Detecta robos"* ➔  `ayuda a identificar posibles eventos a revisar`
*   ❌ *"Previene intrusiones"* ➔  `apoya la supervisión de eventos de riesgo`
*   ❌ *"Reemplaza NVR"* ➔  `puede complementar sistemas existentes según compatibilidad`
*   ❌ *"Funciona con cualquier cámara"* ➔  `compatibilidad según cámara, protocolo y accesos autorizados`
*   ❌ *"Producción lista / producción habilitada"* ➔  `demo controlada / piloto acotado`
*   ❌ *"Evidencia legal"* ➔  `evidencia técnica de laboratorio`
*   ❌ *"Cadena de custodia"* ➔  `trazabilidad local`
*   ❌ *"Bitácora inmutable"* ➔  `registro de auditoría protegido con control de integridad`
*   ❌ *"ROI garantizado"* ➔  `valor operacional estimado`
*   ❌ *"IA infalible"* ➔  `asistencia contextual con validación humana`

---

## 📊 MÓDULO 5A — SENTINEL OFFLINE DEMO ANALYTICS & TELEMETRY LAB

Se ha desarrollado e integrado un laboratorio de analítica local, ético y completamente offline, diseñado bajo el principio estricto de **Zero-Cloud-PII**, permitiendo auditar con seguridad cómo se usan las maquetas y resguardar la exactitud del pitch técnico:

### 1. Panel de Control "Sentinel Offline Demo Analytics"
*   **Sección Dedicada:** Disponible en `Reportes y Matriz > Demo Analytics` para roles de **Administrador** y **Técnico**.
*   **Restricción de Rol para Conserjería:** Si ingresa un usuario con rol de **Conserje/Guardia**, se renderiza una vista informativa de bloqueo que detalla los privilegios del laboratorio.
*   **Offline Analytics Safety Banner:** Banner superior prominente en color esmeralda que reza: *“Analítica local offline — sin nube, sin datos personales, sin IPs, sin cámaras reales, sin tracking externo.”*, acompañado de badges informativos (`Offline Only`, `No Cloud`, `No PII`, `No Camera Data`, `Production Locked`, etc.).

### 2. Local Telemetry Store & Simulación Reactiva
*   **Persistencia Local Segura:** Almacenamiento directo mediante `localStorage` para registrar interacciones sin invocar APIs por red ni cookies de terceros.
*   **Datos Pre-Sembrados (Pre-seeded Historical Data):** Inicializa el dashboard con una bitácora de eventos de las últimas 48 horas para que el panel sea interactivo y visualizable de forma inmediata, marcados explícitamente con etiquetas visuales **Synthetic Data** para evitar confusión con datos productivos.
*   **Eventos Permitidos:** Registro abstracto de interacción (`demo.session.started`, `demo.session.ended`, `publichub.opened`, clics en líneas, selección de audiencias, inicio de rutas, copias autorizadas y bloqueos detectados).
*   **Eventos Prohibidos:** Se garantiza la exclusión absoluta de IPs, credenciales, flujos RTSP reales, nombres de clientes reales, GPS, imágenes privadas, transmisiones de audio o biométricos.
*   **Consola de Telemetría:** Permite ver el stream de eventos locales en tiempo real con su marca de tiempo e información complementaria.

### 3. Métricas y Analytics Avanzados
*   **Resumen de Sesión de Demostración:** Muestra de forma sintética el número de sesiones, tiempo total estimado de demo, la línea de negocio con más interacciones, la audiencia más solicitada, conteo de alertas de bloqueo y copy acciones aprobadas/bloqueadas.
*   **Product Line Analytics:** Desglose métrico de clicks, reportes generados y rutas iniciadas para las líneas `Field`, `Community`, `Consumer Bridge`, y `Public Launch Media Kit`.
*   **Guided Demo Completion Tracker:** Indicadores abstractos de completitud para las rutas guiadas de 3m, 5m, 10m y 15m de duración, midiendo inicios, pasos visitados, abandonos y saltos de pantallas.
*   **Audience Insights Local:** Panel interactivo para analizar las sugerencias técnicas de las **13 audiencias de demostración** sin necesidad de capturar identidades reales.
*   **Safety & Blocker Analytics:** Diagnóstico detallado en caliente de las **9 causas de bloqueo operativa** (tales como Media Blocked activo, checklist inconcluso, etc.) con sus respectivas recomendaciones para habilitar la demo.
*   **Media Kit Usage Analytics:** Monitoreo del volumen de guiones por duración generados por directores comerciales, captions por plataforma, templates copiados y bloqueos reactivos del portapapeles.

### 4. Demo Feedback Notes con Live PII Validation
*   **Entrada de Comentarios Locales:** Bloque de texto para documentar objeciones y notas de feedback de demostraciones técnicas.
*   **Validador de Riesgo en Vivo (PII Warning):** Lógica integrada con expresiones regulares que detecta y alerta al operador de forma inmediata si digita accidentalmente correos, IPs, rutas RTSP o números de teléfono, solicitando su sanitización inmediata antes del guardado automático.

### 5. Reporte Sanitizado y Controles de Purga (Reset Controls)
*   **ORBI Sentinel IA — Offline Demo Analytics Report:** Generador de informe en texto limpio consolidado que recopila las métricas del laboratorio de analítica, libre de cualquier dato privado o sensible, listo para ser copiado al portapapeles.
*   **Borrado Seguro (Reset & Purge):** Botones dedicados con confirmación integrada para reiniciar la sesión actual de métricas o borrar de manera permanente toda la bitácora local.
*   **Analytics Readiness Checklist:** Matriz inteligente con **12 factores claves de conformidad offline**. Si alguna regla crítica de seguridad (`No cloud telemetry`, `No PII stored` o `No IP/RTSP stored`) es desactivada o bloqueada, se suspende en caliente la exportación del reporte de analítica y el portapapeles queda bloqueado.

---

## 🔒 MÓDULO 5B — OFFLINE ANALYTICS QA & PRIVACY LOCK

Se ha completado la auditoría final y el bloqueo de privacidad del módulo de analítica offline, asegurando que toda la recopilación local permanezca estrictamente bajo entornos controlados e impermeables:

### 1. Panel Launch Media & Analytics QA Lock Panel
*   **Sello de Validación de Privacidad (Privacy Seal):** Un header prominente y dinámico con colores reactivos que muestra el estado global de la analítica de demostración (`Offline Analytics Privacy Locked`, `Needs Review` o `Analytics Blocked`).
*   **Matriz de 10 Frentes de Auditoría de Privacidad:** Permite ver y evaluar el cumplimiento en tiempo real de cada uno de los 10 frentes operacionales:
    1.  *Offline Safety Banner:* Verificación visual de los badges y descripciones de privacidad en pantalla.
    2.  *Local Telemetry Store:* Validación del confinamiento en localStorage (Zero Cloud Database, Zero 3rd party cookies).
    3.  *Event Allowlist:* Estructura estricta de 22 tipos de eventos autorizados de navegación comercial.
    4.  *Event Blocklist:* Bloqueo reactivo de 10 tipos de eventos prohibidos (RTSP, IPs reales, datos biométricos, etc.).
    5.  *Demo Session Summary:* Cómputo matemático local de tiempos de sesión y pantallas sin cruces relacionales.
    6.  *Audience Insights:* Evaluación abstracta de las 13 perfiles comerciales sin persistir identidades.
    7.  *Safety Blockers:* Trazabilidad de las 9 causas de bloqueo pericial con diagnósticos sugeridos.
    8.  *Feedback Notes Sanitization:* Escáner proactivo y reactivo que intercepta notas con posible PII (emails, IPs, RTSP).
    9.  *Sanitized Report:* Bloqueo del reporte consolidado o exclusión en caliente del feedback de notas si se detectan advertencias.
    10. *Reset & Purge Controls:* Funcionalidades de borrado completo para limpiar localmente todos los registros acumulados.

### 2. Controles de Override Manuales (Interactive Manual Overrides)
*   La matriz dispone de selectores tácticos (`Ready`, `Review`, `Block`, `Reset`) que permiten simular estados de auditoría o forzar condiciones de vulnerabilidad para evaluar la robustez de los guardrails del sistema.

### 3. Guardrails de Bloqueo del Portapapeles (Clipboard Safe Lock)
*   Si se vulnera alguna de las políticas críticas de privacidad offline (No cloud telemetry, No PII stored, No IP/RTSP stored) o si el operador ingresa notas con riesgo de PII en el campo de texto, el botón **Copiar Reporte** se deshabilita visualmente (color grisáceo desaturado) y se disparan alertas específicas en caliente que explican los riesgos identificados.

### 4. Auditoría de Aislamiento de Red e Intercepción de Eventos Prohibidos
*   Visualización técnica integrada del aislamiento completo del frontend frente a llamadas API, beacons de red o WebSocket inyectados de manera externa.
*   Visualización de reglas en vivo para eventos autorizados (Allowlist) e interceptación en caliente de eventos prohibidos (Blocklist).

---

## 🔒 MÓDULO 5C — DEMO INSIGHTS DASHBOARD & PRESENTATION IMPROVEMENT LAB

Este módulo introduce un completo centro de inteligencia comercial local y offline para interpretar las interacciones de sesión, entregando recomendaciones accionables al operador para mejorar la calidad del pitch y de los pilotos sin usar nube, sin capturar PII y resguardando al 100% la privacidad local.

### 1. Insights Safety Banner & Synthetic disclaimer
*   **Header descriptivo:** Alerta explícitamente sobre el resguardo ético: análisis offline de demostraciones, sin nube, sin PII, sin IP/RTSP y sin datos reales de clientes.
*   **Badges de Seguridad:** Indica estados visuales claros (*Offline Insights, Local Only, Sanitized, No Cloud, No PII, No Camera Data, Synthetic Data Aware, Resettable*).
*   **Disclaimer de Datos Sembrados:** Si existen eventos con bandera `isSynthetic: true` en el almacén local, se activa un banner de advertencia preventivo de datos de simulación didáctica.

### 2. Demo Interest Summary
Mapea matemáticamente en vivo los registros de interacción locales para proveer al operador indicadores instantáneos:
*   **Línea Tecnológica Favorita / Menor Uso:** Identifica cuál de las tres líneas (*Field, Community, Consumer*) registra mayor y menor interés de navegación.
*   **Audiencia Top:** Mapea el perfil comercial más seleccionado en las maquetas.
*   **Ruta Guiada Frecuente:** Reporta cuál versión de pitch temporal ha sido más ejecutada.
*   **Módulo con Mayor / Menor Tráfico:** Contabiliza los clics de navegación para optimizar el orden del pitch de venta.
*   **Bloqueo Común / Guardrail Top:** Muestra los guardrails de privacidad que más veces se han presentado en pantalla.

### 3. Product Line Insight Cards
Tarjetas métricas optimizadas para las 4 soluciones principales:
*   **Field Operations:** Sugerencias para mitigar objeciones sobre consumo PoE y enlaces satelitales en faenas. Recomienda pilotos acotados de 1 a 3 cámaras perimetrales con enlace local LTE.
*   **Community Pilot:** Sugerencias enfocadas en la ofuscación en caliente de patentes y rostros vecinales para evitar disputas de privacidad.
*   **Consumer Bridge:** Sugerencias sobre cómo el puente local permite integrar cámaras domésticas baratas sin enviar video a la nube.
*   **Public & Media:** Sugerencias de autocontrol ético para el cumplimiento estricto de claims responsables antes de exportar material a redes.

### 4. Guided Demo Effectiveness Tracker
*   **Matriz de Tasa de Completación:** Mide detalladamente para las rutas de 3m, 5m, 10m y 15m los inicios registrados, tasa estimada de completitud, pasos comúnmente saltados por el cliente, pantallas más consultadas y objeciones principales surgidas.
*   **Recomendaciones de Pitch:** Recomienda qué rutas temporales usar según el perfil de interés inicial para maximizar la retención de atención.

### 5. Audience Recommendation Engine (Local Server)
*   **Mapeo Comercial Interactivo:** Motor de recomendaciones reactivo para perfiles críticos (*Gerente O&M, Comité de Condominio, Socio Inversor*).
*   **Asignador Automático:** Asigna dinámicamente según la audiencia la línea tecnológica recomendada, duración del pitch, pantallas prioritarias a desplegar, mensaje ético clave de la solución, objeción técnica más probable y próximo paso comercial recomendado.

### 6. Safety Blocker Recurrent Insights
*   **Trazabilidad de Bloqueos:** Consolida la frecuencia con la que los operadores activan alertas críticas de portapapeles (*Media Blocked*), publicaciones suspendidas (*Launch Status Blocked*), intercepción de eventos de red prohibidos, u advertencias de PII en notas de feedback.
*   **Directivas de Corrección:** Ofrece instrucciones inmediatas y explícitas para resolver cada tipo de bloqueo detectado localmente.

### 7. Demo Quality Score Engine
*   **Score de Preparación Interno:** Un algoritmo de puntuación ponderada (0 a 100) que califica el grado de alistamiento comercial y ético de la demo actual en base a checklists completados y ausencia de bloqueos.
*   **Estados de Readiness:** Evalúa la demo entre *Excellent Demo Readiness, Good Demo Readiness, Needs Review* o *Blocked*.
*   **Disclaimer Mandatorio:** "Este score es una métrica interna de preparación de demo. No representa desempeño comercial real, análisis regulatorio externo ni SLA productivo."

### 8. Sanitized Insights Report Generator
*   **Exportador Seguro en Un Clic:** Compila un reporte consolidado en Markdown limpio y estructurado listo para copiar en portapapeles, libre de datos privados, IPs, RTSP, credenciales, correos u nombres reales.
*   **Regla Crítica de Bloqueo (QA Lock):** El checklist de privacidad contiene tres frentes mandatorios (*No PII in insights, No IP/RTSP in insights, Demo Quality Score labeled as internal*). Si el operador desmarca o marca como **BLOCKED** cualquiera de estas tres directivas críticas en el checklist de control de privacidad, el botón **Copiar Reporte** se desactiva instantáneamente con un banner instructivo que suspende la exportación del informe.

### 9. Control de Purga (Reset & Purge Controls)
*   **Restauración de Seed Data:** Capacidad interactiva para sembrar registros históricos didácticos en localStorage para comprobar el funcionamiento de las estadísticas en el dashboard de insights.
*   **Purga Segura:** Borrado físico inmediato de toda la bitácora local actual de interacciones offline.

---

## 🔒 MÓDULO 5D — DEMO INSIGHTS QA & IMPROVEMENT LOCK

Este módulo consolida la auditoría final y el panel central de bloqueo para el Demo Insights Dashboard, implementando un control riguroso de frentes éticos-comerciales, validación de conformidad y bloqueo de seguridad preventivo en la exportación de informes para garantizar el cumplimiento de las políticas Zero-Cloud-PII de la organización.

### 1. Panel Demo Insights QA Lock
Consolida una matriz interactiva y transparente en `Reportes y Matriz > Demo Insights > QA Lock` para monitorear el cumplimiento de los **10 frentes de auditoría**:
*   **Insights Safety Banner:** Banner visible con descripción de origen local offline de analítica y los 8 badges reglamentarios (*Offline Insights, Local Only, Sanitized, No Cloud, No PII, No Camera Data, Synthetic Data Aware, Resettable*).
*   **Offline Source Verification:** Escaneo manual de 9 frentes de aislamiento de red local (Zero-Cloud, No Third-Party Cookies, No External SDK) con recomendación de mitigación en caliente.
*   **Synthetic Seed Labeling:** Indicación de datos sembrados de simulación para prevenir confusiones de origen operativo.
*   **Demo Interest Summary:** Visualización limpia de métricas agregadas libres de PII e identidades de clientes, calculando el próximo paso técnico sugerido de forma automatizada.
*   **Product Line Insight Cards:** Tarjetas métricas específicas para Field, Community, Consumer y Public/Media con etiquetas visibles que confirman la ausencia de datos operativos o grabaciones de video reales.
*   **Guided Demo Effectiveness:** Matriz que integra de forma granular las rutas guiadas por duraciones (3m, 5m, 10m, 15m) incluyendo las rutas públicas de 60s, 3m y 5m con el descargo de responsabilidad no contractual de completitud.
*   **Audience Recommendation Engine:** Motor que asocia mensajes éticos, objeciones y próximos pasos comerciales para 15 audiencias específicas sin comprometer garantías comerciales.
*   **Safety Blocker Insights:** Rastreador de recurrencia de 11 tipos de bloqueo sin retener los textos libres ni payloads de notas ingresadas de forma local.
*   **Demo Quality Score:** Algoritmo de preparación ponderada con leyenda visible de estimación interna y sensible en tiempo real al estado de bloqueo de frentes críticos de privacidad.
*   **Sanitized Insights Report:** Generador de minuta en Markdown con limitaciones de uso explícitas y bloqueo automático de portapapeles ante cualquier descalificación del checklist de control.

### 2. Control de Bloqueo de Privacidad (QA Privacy Checklist)
*   Monitoreo manual de un checklist de 11 puntos de control de privacidad y auditoría.
*   **Frentes Críticos Mandatorios:** *No PII in insights, No IP/RTSP in insights, y Demo Quality Score labeled as internal*.
*   **Lógica de Bloqueo Instantáneo:** Si el operador desmarca o asigna en estado `Blocked` cualquiera de estas tres directivas críticas o sus frentes relacionados en la matriz, el estado global cambia a **INSIGHTS BLOCKED**, inhabilitando de inmediato el botón de copiar informe de insights y desplegando un banner instructivo que suspende la exportación del reporte de simulación didáctica.

---

## 🧪 MÓDULO 5E — OFFLINE PRESENTATION A/B LAB

Este módulo implementa un laboratorio offline para comparar de forma segura variantes de presentación, guiones de video, variantes de publicaciones comerciales, rutas de demostración, subtítulos y mensajes, sin conexión a la nube, sin captura de datos personales, sin uso de cámaras reales y sin métricas comerciales contractuales.

### 1. Banner de Cumplimiento Ético-Comercial (A/B Safety Banner)
Incluye un banner superior con 8 badges de cumplimiento regulatorio y ético:
*   `Offline Only`: Garantía de ejecución sin dependencias de red externa.
*   `No Cloud`: Confirmación de aislamiento perimetral de datos.
*   `Synthetic Data`: Indicación de que todos los datos y variaciones son simulados.
*   `Safe Comparison`: Cumplimiento con las políticas de no prometer métricas contractuales.
*   `Zero PII`: No almacena nombres, teléfonos ni correos electrónicos.
*   `Zero IP/RTSP`: Sanitiza y bloquea el copiado si se detectan parámetros de hardware reales.
*   `No Real Cameras`: No recopila flujos reales.
*   `Non-Contractual`: Descargo regulatorio explícito de que el score interno no representa promesas comerciales de conversión.

### 2. Constructor de Experimentos A/B (A/B Experiment Builder)
*   **Plantillas Didácticas Incorporadas:** 6 plantillas de experimentos listas para cargar (*Industrial 3 min vs 10 min, Privacidad 3 min vs Cobertura 5 min, LinkedIn Corporativo vs Tono Creador, etc.*).
*   **Campos de Variante Personalizables:** Configuración en tiempo real del título, descripción, mensaje clave, duración estimada, riesgos de sobrepromesa, salvaguardas y llamado a la acción (CTA) para las variantes A y B.
*   **Filtros de Línea de Producto & Audiencia:** Segmentación interactiva por línea tecnológica (*Field, Community, Consumer, Public*) y perfil de audiencia para alinear de forma ética el tono de presentación.

### 3. Escáner de Seguridad en Caliente (Safety Blockers)
*   **Búsqueda Proactiva:** Monitoreo reactivo en tiempo real de los campos ingresados por el usuario para identificar e interceptar de forma automática PII (correos, teléfonos), IPs reales o enlaces RTSP activos.
*   **Bloqueo Centralizado de Copiado:** En caso de que se detecte una vulnerabilidad de datos o se desmarque algún frente mandatorio en el checklist de control, el estado cambia a **EXPERIMENT BLOCKED**, deshabilitando inmediatamente el portapapeles y mostrando instrucciones claras de sanitización.

### 4. Criterios de Evaluación y Score de Preparación
*   **10 Criterios Locales Ponderados:** Evaluación cuantitativa didáctica de 1 a 5 mediante barras deslizantes para criterios clave (*claridad, respeto de guardrails, foco en privacidad, bajo riesgo de sobrepromesa, preparación técnica*).
*   **Tablero de Resultados Comparativo:** Gráficas de barra y medidores de aguja dinámicos para calcular la variante ganadora e integrar alertas del histórico de *Demo Insights* (intercepciones previas de portapapeles o fallas de red).
*   **Recomendación en Vivo (Winner Engine):** Motor local que asocia los resultados evaluados y el perfil de la audiencia para sugerir el guion ético definitivo a emplear en reuniones comerciales.

### 5. Sanitized Report & Checklist de Control
*   **Formato Markdown Sanitizado:** Generación en un clic de una minuta en Markdown libre de PII para compartir internamente.
*   **Privacy QA Checklist de 11 Puntos:** Requiere verificar de forma manual el aislamiento, el uso responsable del lenguaje y la exclusión de datos reales de hardware para poder desbloquear las acciones de copiado al portapapeles.

---

## 🧪 MÓDULO 5F — OFFLINE A/B LAB QA & EXPERIMENT LOCK

Este módulo implementa la auditoría de seguridad final y la validación técnica del **Offline Presentation A/B Lab** mediante un tablero centralizado interactivo que evalúa 10 frentes críticos de aislamiento local, garantizando que todos los experimentos, variantes de guiones, puntuaciones, minutas y sugerencias de la presentación comercial permanezcan locales, sanitizados, no contractuales y sin fuga de información confidencial.

### 1. Tablero de Control Centralizado (A/B Lab QA Lock Panel)
Proporciona una interfaz dedicada para evaluar la preparación de los 10 frentes de auditoría:
1.  **A/B Safety Banner**: Garantiza el despliegue del descargo con los 10 badges éticos y didácticos locales.
2.  **Experiment Builder**: Verifica el aislamiento de los constructores y audiencias del laboratorio.
3.  **Variant Cards**: Evalúa el correcto llenado de mensajes clave, riesgos de sobrepromesa y guardrails.
4.  **Security Scanner**: Escaneo en caliente contra brechas de PII, IP, RTSP y claims de sobrepromesa técnica.
5.  **Evaluation Matrix**: Asegura que las evaluaciones sean didácticas, no reales y sin claims comerciales.
6.  **Results Dashboard**: Verifica la exclusión de métricas contractuales o estadísticas comerciales ficticias.
7.  **Winner Recommendation Engine**: Aplica disclamer ético y de uso limitado ("Controlled Demo Lock") al guion ganador.
8.  **Sanitized Report**: Controla el filtrado pericial del informe en Markdown final para evitar exportaciones inseguras.
9.  **Archive & Reset Controls**: Garantiza la purga absoluta y restablecimiento de datos simulados en local.
10. **Readiness Checklist**: Valida el estatus del checklist de 12 factores críticos del laboratorio.

### 2. Escáner de Claims Prohibidos en Caliente
El motor heurístico se expande con expresiones regulares estrictas para interceptar de raíz claims prohibidos en presentaciones comerciales:
*   `Prevención absoluta` de robos o fallas.
*   `Reemplazo de NVR` (el sistema es complementario, no sustituto).
*   `Reemplazo de guardias` u operadores de seguridad físicos.
*   `Reemplazo de SCADA/O&M/HSE` en entornos industriales.
*   Cualquier patrón coincidente de correos, teléfonos, credenciales o flujos RTSP reales.

### 3. Panel de Pruebas de Reactividad (QA Demo Overrides)
Permite a los ingenieros de QA y presentadores inyectar intencionalmente datos no conformes para probar los bloqueadores de seguridad reactivos:
*   **Inyectar Correo (PII)**: Coloca un email simulado en las notas del experimento, activando la alerta.
*   **Inyectar IP/RTSP**: Inserta credenciales y rutas de red activas en el título del experimento, forzando el estado **A/B BLOCKED**.
*   **Inyectar Claims Prohibidos**: Llena la descripción de la variante con promesas infalibles de detección y grado militar, gatillando el bloqueo instantáneo del portapapeles.
*   **Sanitizar y Autocorregir**: Restablece el experimento activo a un estado 100% limpio y conforme.

### 4. Lógica de Bloqueo Técnico Multicapa
El sistema bloquea dinámicamente:
1.  **Status: "Blocked"** automático del experimento ante la menor advertencia del escáner.
2.  **Clipboard Copy Lock**: El botón de copiar reporte e indicadores de portapapeles se deshabilitan si existe un estado de bloqueo activo o si se desmarcan frentes vitales en el checklist.
3.  **Redacción Proactiva**: Oculta y enmascara cualquier dato vulnerable mediante placeholders seguros.

---

### 🏆 Hito de Desarrollo Alcanzado
*   **v0.5.5-sentinel-offline-ab-experiment-lock:** Cierre y validación del Offline Presentation A/B Lab. Integración de la pestaña **A/B Lab QA Lock**, escáner de claims prohibidos en caliente, overrides de prueba de reactividad, bloqueo del portapapeles, reporte sanitizado pericial en Markdown e indicadores dinámicos de cumplimiento para auditorías de demostración éticas.
*   **v0.6.0-sentinel-pilot-intake-readiness-center:** Apertura formal del Bloque 6 con la implementación del **Pilot Intake & Deployment Readiness Center**. Un entorno completamente sanitizado y offline para estructurar levantamientos técnicos, coordinaciones operacionales, matrices de riesgo perimetral e indicadores de preparación con escáner de seguridad en caliente contra fugas de PII, IPs, RTSP y claims comerciales prohibidos.
*   **v0.6.1-sentinel-pilot-intake-deployment-lock:** Validación y auditoría final mediante el **Pilot Intake QA & Deployment Readiness Lock**. Un entorno auditado que incluye control de acceso basado en roles para evitar manipulaciones (vista bloqueada para "conserje"), frentes de auditoría interactivos de 10 pilares técnicos/legales, un checklist obligatorio ampliado a 14 puntos (incorporando seguridad eléctrica y riesgos HSE), controles de activación de seguridad en caliente (badges de Safety Banner interactivos), y restricción dura de exportación de reportes Markdown en estado de bloqueo.

---

## 🛰️ MÓDULO 6A — PILOT INTAKE & DEPLOYMENT READINESS CENTER

Este módulo abre el bloque de preparación de pilotos en terreno reales bajo un modelo de madurez estricto e independiente de servicios cloud.

### 1. Tablero de Control de Preparación (Pilot Intake Center)
Estructura de control robusta que ayuda a los ingenieros de preventa y administradores a consolidar los requisitos mandatorios antes de enviar hardware físico:
*   **Authorization Checklist:** 6 factores de verificación legal y coordinación de accesos con el cliente (Aprobación Administrativa, Coordinación O&M, Roles de Acceso, Límites Comerciales, Coordinación Física, Consentimiento Escrito).
*   **Technical Checklist:** 6 factores para relevar la infraestructura (Compatibilidad de Voltaje, Enlace Inalámbrico LAN, Ancho de Banda Local, Marcas e IPs Registradas, Espacios Íntimos Excluidos, Retención Local Validada).
*   **Pilot Scope Form:** Lector y constructor dinámico de campos como *Nombre del Sitio*, *Tipo de Planta*, *Número de Cámaras*, *Zonas Incluidas/Excluidas*, *Objetivo del Piloto* e *Instrucciones de Despliegue*.

### 2. Escáner de Sanitización en Caliente (Sanitization & PII Scanner)
Heurística en tiempo real que protege la confidencialidad de la información perimetral de los clientes:
*   **Detección de Datos Sensibles:** Utiliza expresiones regulares optimizadas para interceptar correos electrónicos, números de teléfono, direcciones IP (`192.168.x.x`), puertos de red, contraseñas y rutas RTSP (`rtsp://...`).
*   **Claims Comerciales Prohibidos:** Bloquea términos infalibles o sobredimensionados como "prevención absoluta", "cobertura 100% autónoma" o "reemplazo total de guardias/NVR".
*   **Control Reactivo de Copiado:** Si el escáner detecta alguna vulnerabilidad, bloquea de inmediato la generación de reportes e inhabilita las acciones de copiado en el portapapeles, alertando en rojo la causa exacta de la vulneración.

### 3. Matriz de Riesgo Operacional (Pilot Risk Matrix)
Un visor dinámico que mapea riesgos típicos de despliegue y sugiere mitigaciones éticas locales:
*   **Hardware No Disponible (CCTV en mantenimiento):** Severidad Alta, mitigado por un inventario físico exhaustivo previo al piloto.
*   **Bajo Ancho de Banda (LAN saturada):** Severidad Media, mitigado limitando las pruebas de stream al sub-stream de baja resolución.
*   **Riesgo de Privacidad (Cámaras apuntando a zonas íntimas):** Severidad Alta, mitigado por enmascaramiento local inmediato o rediseño físico del campo de visión de la cámara.

### 4. Integraciones y Flujo Unificado (Data Transfer Bridges)
*   **Transferencia Segura y Sanitizada:** Los módulos **Field Proposal Center** y **Community Proposal Center** han sido integrados para transferir automáticamente el alcance técnico pre-construido hacia el **Pilot Intake Center** con un solo clic. El puente limpia proactivamente cualquier PII o IP antes de depositar los datos en el almacén temporal, garantizando la consistencia y el aislamiento hermético de los datos reales.
*   **Botón Rápido desde el Hub Público:** El panel principal de demostración (Public Demo Hub) integra un acceso directo destacado para preventas y técnicos de terreno.

---

## 🛰️ MÓDULO 6B — PILOT INTAKE QA & DEPLOYMENT READINESS LOCK

Este módulo realiza la auditoría y validación final del Pilot Intake Center, garantizando un puente comercialmente responsable y técnicamente robusto antes de iniciar pruebas en terreno.

### 1. Control de Privilegios Basado en Roles (Role-Based View)
*   **Aislamiento Operativo:** El panel completo de preparación se bloquea proactivamente bajo llave local si el rol de usuario seleccionado es **Conserje de Turno** ("conserje"). Esta restricción simula políticas reales de segregación de funciones, impidiendo que personal no autorizado modifique checklists de autorización o checklists técnicos del piloto.

### 2. Tablero de Control de Frentes de Auditoría (10 Frentes Interactivos)
*   Un tablero de control que monitorea dinámicamente los 10 pilares críticos de la fase de preparación:
    1.  **Safety Banner Controls:** Resguardo ético y legal activo.
    2.  **Pilot Type Selected:** Consistencia de la línea de piloto elegida.
    3.  **Scope Verification:** Mapeo de alcance y cobertura.
    4.  **Authorization Sign-Off:** Aprobación escrita del cliente.
    5.  **Technical Checklist:** Verificación de red local e infraestructura.
    6.  **Risk Matrix Reviewed:** Mitigaciones aprobadas contra riesgos físicos.
    7.  **Sanitization Scanner:** Cero filtraciones de PII, IPs o RTSP.
    8.  **Report Consistency:** Integridad del Markdown autogenerado.
    9.  **Bridges Connectivity:** Sincronización limpia con propuestas previas.
    10. **Overall Safety Score:** Calificación de preparación ponderada.

### 3. Checklist Obligatorio de 14 Puntos (Pilot Intake QA Checklist)
*   Ampliación de los checklists operacionales con requisitos de seguridad adicionales, incluyendo:
    *   **Seguridad Eléctrica e Higiene y Seguridad (HSE):** Requisito de desconexión segura en disyuntores de tableros eléctricos, uso de escaleras dieléctricas homologadas para trabajos en altura, e inspección visual preventiva de cables perimetrales expuestos.
    *   **Privacidad e Imagen de Terceros:** Enmascaramiento preventivo de áreas comunes de descanso técnico.

### 4. Resguardos de Copiado y Clipboard en Caliente
*   **Bloqueo Reactivo Duro:** En caso de que el scanner de sanitización detecte un correo electrónico, una dirección IP, un enlace RTSP real o se desactiven badges de seguridad críticos, las acciones de copiado al portapapeles se deshabilitan por completo. El operador debe subsanar la no conformidad para liberar el reporte.

---

## 🛰️ MÓDULO 6C — PILOT HANDOFF PACK & SECURE COORDINATION BRIEF

Este módulo representa la culminación del proceso de levantamiento, actuando como un puente seguro para la coordinación y entrega de pilotos de **ORBI Sentinel IA** con clientes, comités técnicos y subcontratistas O&M, garantizando que los datos confidenciales permanezcan resguardados por canales externos seguros autorizados.

### 1. Panel de Control de Traspaso (Pilot Handoff Pack)
*   **Aislamiento Operativo Estricto:** Al igual que en el módulo de Intake, los usuarios con rol de **Conserje** ("conserje") tienen bloqueado el acceso al handoff pack completo para evitar manipulaciones de planes estratégicos o fugas de checklists críticos.
*   **Integración Fluida de Estado:** Recupera en tiempo real los datos técnicos y operacionales del piloto desde el local storage (`ORBI_SENTINEL_ACTIVE_PILOT_INTAKE_STATE`), incluyendo el nombre del sitio, tipo, número de cámaras, zonas incluidas y excluidas, permitiendo coordinar sobre bases reales sanitizadas.

### 2. Tablero de Control de Auditoría (10 Frentes del Handoff Pack)
*   Un panel interactivo que audita en tiempo real las 10 áreas clave del traspaso seguro:
    1.  **Safety Banner Controls:** Resguardo ético y legal activo.
    2.  **State Recovery:** Sincronización transparente con el levantamiento del Intake.
    3.  **Secure Brief:** Mensajería de coordinación libre de credenciales o contraseñas.
    4.  **Meeting Agenda:** Organización de minuta de alineación inicial.
    5.  **Email templates:** Formulación de correos y enlaces externos protegidos.
    6.  **Provider Checklist:** Requisitos para instaladores CCTV.
    7.  **SLA Agreement:** Matriz de deslinde y expectativas operacionales básicas.
    8.  **Risk Mitigation:** Planes de acción ante incidentes de terreno.
    9.  **Sanitization Scanner:** Cero fugas de PII, IPs o contraseñas en el brief.
    10. **Overall Readiness Score:** Nivel de cumplimiento ponderado (requiere mínimo 85% para exportación).

### 3. Escáner Heurístico en Caliente de Privacidad & Clipboard Lock
*   **Inspección en Tiempo Real:** Escanea proactivamente los campos de texto, notas, nombres e instrucciones utilizando regex sofisticados para detectar IPs reales, enlaces RTSP, teléfonos, correos y promesas absolutas de seguridad.
*   **Bloqueo de Exportación Comercial:** Deshabilita de inmediato las opciones de copiado de minutas, correos o briefs al portapapeles si se detectan fugas de privacidad o si el score final de preparación del traspaso es menor al 85%.

### 4. Minutas de Coordinación de Proveedores y Agendas de Reuniones
*   **Checklist de Proveedores de CCTV (8 Puntos):** Guías técnicas de alineación con instaladores (validación de subredes aisladas, enmascaramientos de privacidad por hardware, estabilidad del PoE, etc.).
*   **Agenda de Reunión de Alineación:** Minuta de 5 puntos clave para la mesa técnica inicial, facilitando un proceso prolijo, ordenado y 100% libre de datos confidenciales expuestos en pantalla.

---

## 🛰️ POST-6D — PILOT HANDOFF ACCEPTANCE LOCK & BLOCK 6 CLOSURE

Este hito representa el cierre definitivo y la validación de aceptación del **Bloque 6 — Pilot Intake & Deployment Readiness**. ORBI Sentinel IA se encuentra validado y bloqueado para coordinar pilotos controlados de manera responsable y de forma sanitizada.

### 1. Estado de Validación Global del Bloque 6
*   **Identificador de Versión:** `v0.6.3-sentinel-pilot-handoff-coordination-lock`
*   **Nota de Estado:** `POST-6D ACCEPTED / BLOCK 6 PILOT COORDINATION READY`
*   **Puntos de Control Verificados (Aceptados & Bloqueados):**
    1.  **Pilot Intake:** Estado *Locked* de preparación de ingreso de pilotos.
    2.  **Pilot Handoff:** Estado *Locked* de traspaso técnico sanitizado.
    3.  **Sanitization Scanner:** Activo y monitoreando en tiempo real contra PII, IPs, RTSP y claves.
    4.  **Clipboard Lock:** Bloqueo reactivo de exportación de briefs ante no conformidades.
    5.  **No Credentials:** Confirmado el almacenamiento cero de claves de cámaras o de routers.
    6.  **No IP/RTSP:** Confirmada la enmascaración obligatoria de flujos de video locales.
    7.  **No PII:** Confirmada la sanitización total de correos, teléfonos y datos personales.
    8.  **Production Locked:** Bloqueado el inicio físico automático de equipamiento.
    9.  **External Secure Channel Required:** Confirmada la obligatoriedad de usar canales corporativos de TI seguros ajenos a la demo.
    10. **Non-contractual:** Validado el alcance meramente referencial y técnico sin implicaciones de contratos automáticos ni desvíos de HSE.

---

## 💼 MÓDULO 7A — EXTERNAL STAKEHOLDER BINDER & OFFICIAL DEMO PACKAGE

Este hito representa el despliegue del **External Stakeholder Binder (Carpeta Digital para Stakeholders)** de ORBI Sentinel IA, una herramienta integral y sanitizada diseñada para reuniones comerciales con comités de seguridad, gerentes de O&M, proveedores de CCTV y socios inversionistas.

### 1. Estado de Validación Global del Bloque 7A
*   **Identificador de Versión:** `v0.7.0-sentinel-external-stakeholder-binder`
*   **Nota de Estado:** `MÓDULO 7A ACCEPTED / BLOCK 7 EXTERNAL BINDER READY`

### 2. Componentes y Funciones Principales
1.  **Audience Selector & Smart Recommender:** Adapta los mensajes clave de venta, objeciones y guiones de elevator pitch según el perfil de la reunión (Comité de Copropietarios, Gerencia O&M, CCTV Integradores, HSE Prevencionistas o Inversionistas).
2.  **Executive Overview & Product Lines:** Cuadros ejecutivos con diseño premium y deslindes claros que detallan las familias de productos (Sentinel Field, Sentinel Community, Consumer Lab) sin sobrepromesas técnicas.
3.  **Interactive Claims Audit Panel:** Matriz que contrasta declaraciones comerciales prohibidas/peligrosas (p. ej. "detección absoluta de robos 24/7") frente a reclamos realistas de valor técnico ("apoyo al diagnóstico de hardware y auditoría local").
4.  **Official Demo Navigation Hub:** Botones de acceso rápido y directo a todas las pantallas operativas del software.
5.  **Meeting Mode & Sanitized Notes Capture:** Editor de minutas integrado con un **Sanitization Scanner** reactivo en caliente que alerta al usuario si ingresa datos sensibles (IPs, RTSP, correos o teléfonos).
6.  **Follow-up Template & Shared Memory Bridge:** Generador de minutas de seguimiento en formato Markdown exportables con un solo clic, conectadas mediante memoria compartida local (`localStorage`) con el *Pilot Handoff Pack* para un traspaso fluido.
7.  **Readiness Index & QA Checklist:** Indicador de madurez del paquete (Readiness Score) condicionado por una lista de chequeo de 14 puntos que bloquea la exportación del reporte ante vulneraciones de privacidad.

### 3. Integración Inter-Modular
*   **Public Demo Hub:** Botón de acceso directo hacia el Binder integrado en la barra lateral de control rápido.
*   **Launch Media Kit:** Botón "Enviar al Binder" que exporta el guion oficial de 30 segundos directamente a la memoria de la minuta comercial.
*   **Pilot Intake:** Acceso opcional al Binder catalogado como "Reunión Previa" dentro del banner de control.
*   **Pilot Handoff:** Botón de acoplamiento rápido para importar minutas y acuerdos comerciales del Binder hacia el informe técnico final.

---

## 💼 MÓDULO 7B — EXTERNAL BINDER QA & STAKEHOLDER PRESENTATION LOCK

Este hito representa el cierre definitivo, la auditoría final y la validación del **Bloque 7 — External Stakeholder Binder & Official Demo Package**. ORBI Sentinel IA se encuentra validado y bloqueado para reuniones controladas con clientes, comités de copropietarios, gerentes de operación y mantención, proveedores e inversionistas, reduciendo exposición de datos sensibles mediante scanner local y guardrails de demo controlada.

### 1. Estado de Validación Global
*   **Identificador de Versión:** `v0.7.1-sentinel-external-binder-presentation-lock`
*   **Nota de Estado:** `MÓDULO 7B ACCEPTED / BLOCK 7 PRESENTATION LOCKED & AUDITED VALIDATED`

### 2. Los 10 Fronts de Auditoría & Conformidad Externa (QA Lock)
El sistema ejecuta una evaluación continua en caliente sobre los siguientes 10 frentes de conformidad, bloqueando reactivamente la copia del material y desactivando reportes unificados ante cualquier inconformidad:
1.  **Binder Safety Banner:** Deslinde superior explícito de no producción y 8 badges de cumplimiento visibles.
2.  **Audience Selector:** Selección y ajuste narrativo dinámico para los 13 perfiles de stakeholders (incluyendo HSE, comités, integradores y aliados).
3.  **Executive Overview:** Resumen ejecutivo técnico con enfoque en resolver fatiga visual y problemas de enlaces perimetrales sin falsas promesas.
4.  **Product Line Summary:** Aislamiento y descripción de las tres líneas de negocio (Field, Community, Consumer Lab).
5.  **Official Demo Routes:** Selección guiada con guiones de tiempo (desde 60s pitch rápido hasta 15m deep technical).
6.  **Claims Panel:** Contraste obligatorio entre afirmaciones permitidas (diagnóstico pasivo) y prohibidas (detección infalible de delitos).
7.  **Lock Status Matrix:** Validación de candados de software para todos los módulos de la serie v0.7.x.
8.  **Meeting Mode:** Planificación estructurada del tiempo, lo que se debe decir y evitar en la videollamada comercial.
9.  **Copy Pack & Follow-up:** Minuta y correos de seguimiento post-reunión completamente sanitizados.
10. **Binder Scanner & Report:** Escáner reactivo heurístico que detecta y bloquea PII (teléfonos, correos), direcciones de red (IPs, RTSP), contraseñas (user:pass), e inyecciones de claims irresponsables.

### 3. Matriz de Control de Acceso por Roles (Guardias/Conserjes)
*   **Aislamiento Comercial:** Si el usuario accede con el perfil de `Conserjería / Guardia`, el sistema bloquea automáticamente la visualización estratégica del Binder, presentando un panel informativo (LockedView) de resguardo y sugiriendo volver a la operación simplificada en tiempo real de EasyView.

### 4. Créditos Oficiales Preservados
En estricto cumplimiento del Ecosistema de co-diseño del proyecto, se ha bloqueado la persistencia de los créditos oficiales de:
*   **Concepto, dirección y universo de software:** Víctor M. León / ORBI Ecosystem.
*   **Co-diseño y QA de Fases:** ChatGPT / OpenAI (versiones v4/v5/v6).
*   **Implementación asistida y optimización:** Google AI Studio.

---

## 💼 MÓDULO 8A — OFFICIAL DEMO DECK & PDF EXPORT PACK

Este hito representa el despliegue del **Official Demo Deck Export Center (Centro de Exportación de Presentaciones Oficiales)** de ORBI Sentinel IA, una herramienta avanzada diseñada para generar paquetes externos controlados de presentación comercial y técnica.

### 1. Estado de Validación Global del Bloque 8
*   **Identificador de Versión:** `v0.8.0-sentinel-official-demo-deck-export-pack`
*   **Nota de Estado:** `MÓDULO 8A ACCEPTED / BLOCK 8 OFFICIAL DEMO DECK & PDF EXPORT PACK READY`

### 2. Componentes y Funciones Principales
1.  **Export Package Selector:** Permite empaquetar conjuntos específicos según la audiencia (Field Industrial, Community Residencial o Multilínea Integral).
2.  **Context-Aware Audience Customizer:** Filtra y sugiere tracks verbales detallados adaptados para 8 roles clave, ayudando al presentador a evitar objeciones técnicas comunes en terreno.
3.  **13-Slide Presentation Builder:** Una completa baraja de diapositivas interactivas en alta fidelidad visual que cubre el problema, diagnóstico de CCTV, incidentes, el MVP Dahua PoE Lab, el Eufy Consumer Bridge, políticas de privacidad por diseño y el plan de despliegue de pilotos de 1 a 3 cámaras.
4.  **Multi-View Mode Generator:**
    *   *Presentation Mode:* Diapositivas fluidas a pantalla completa con navegación directa mediante botones interactivos a los módulos funcionales del software.
    *   *Print View A4:* Diseño optimizado para impresión en papel o exportación limpia a PDF.
    *   *One-Pager Executive Summary:* Resumen condensado y estructurado de la propuesta técnica.
    *   *Technical Brief:* Detalle denso de ingeniería de red y de hardware Dahua/Eufy para arquitectos TI.
    *   *Markdown Export:* Copiado directo del contenido textual sanitizado en formato Markdown para correos o repositorios.
5.  **Real-Time Sanitization Scanner:** Escáner reactivo integrado en el editor de notas que bloquea la copia y la descarga del deck si se detectan fugas de PII, IPs de red de producción, URL de flujos RTSP reales, o claims de seguridad absoluta (promesas comerciales falsas).
6.  **Export Readiness Score & 14-point QA Checklist:** Validador dinámico que pondera el nivel de cumplimiento normativo y requiere el checklist completo para habilitar la descarga de la presentación comercial.
7.  **Role-Based Security:** Bloqueo absoluto de acceso para perfiles de `Conserjería / Guardia` para resguardo del material estratégico corporativo.

---

## 💼 MÓDULO 8B — OFFICIAL EXPORT QA & CONTROLLED PACKAGE LOCK

Este hito representa la auditoría y cierre técnico definitivo del **Official Demo Deck & PDF Export Pack**, estableciendo salvaguardas avanzadas para que todo el material de presentación generado de forma externa esté debidamente sanitizado, bloqueado ante datos reales y libre de cualquier vulnerabilidad de cumplimiento ético o comercial.

### 1. Estado de Validación Global del Bloque 8
*   **Identificador de Versión:** `v0.8.1-sentinel-official-export-package-lock`
*   **Nota de Estado:** `POST-8B ACCEPTED / BLOCK 8 CONTROLLED EXPORT READY`

### 2. Uso Permitido y No Permitido

| Uso Permitido | Uso No Permitido |
| :--- | :--- |
| **Material demostrativo y educativo:** Generación de diapositivas sanitizadas para alineación de expectativas en reuniones externas con gerencias y comités técnicos. | **Manuales operativos productivos:** Creación de guías paso a paso de configuración de switches, routers, firewalls corporativos o túneles VPN reales. |
| **Coordinación técnica preliminar:** Levantamiento conceptual de factibilidad en el Pilot Intake Center y transferencia segura de resúmenes limpios a Pilot Handoff. | **Anexos contractuales o cotizaciones cerradas:** Promesas de precios fijos definitivos, contratos automáticos de servicio o compromisos de soporte 24/7. |
| **Validación de arquitectura pasiva:** Documentar en el Technical Brief el funcionamiento modular offline del gateway local sin comprometer secretos del ecosistema. | **Exposición de propiedad intelectual sensible:** Exportación de código fuente propietario, prompts internos del sistema, tokens o llaves de APIs del Ecosistema ORBI. |

### 3. Regla Crítica de Bloqueo Incondicional
Para evitar que un alto nivel de completitud de campos encubra vulnerabilidades normativas, **el sistema inhabilita de manera absoluta e inmediata** todas las opciones de copiado de Markdown, resúmenes ejecutivos, vistas de impresión, exportación a PDF y traspaso seguro a *Pilot Handoff* si falla **cualquiera** de los siguientes 9 factores clave de seguridad, **incluso si el Export Readiness Score es igual o superior al 85%**:
1.  **No Real Data:** Inexistencia absoluta de lecturas reales de base de datos de producción.
2.  **No Credentials:** Ausencia total de usuarios, passwords, tokens o credenciales de CCTV.
3.  **No IP/RTSP:** Sanitización de direcciones IP de red productiva y enlaces RTSP de cámaras reales.
4.  **No PII:** Protección estricta de nombres, correos o números de teléfono de clientes.
5.  **Responsible Claims Checked:** Mitigación de reclamos comerciales falsos o promesas de infalibilidad.
6.  **No Source Code Exported:** Bloqueo ante fragmentos o palabras clave de código fuente.
7.  **No Internal Prompts Exported:** Ocultamiento total de instrucciones internas del sistema o del agente.
8.  **Non-Contractual Visible:** Inclusión mandatoria del aviso no vinculante en todos los encabezados.
9.  **Production Locked Visible:** Visualización obligatoria del estado offline de producción bloqueada.

### 4. Componentes y Funciones Validadas

#### A. Pilot Readiness View & Summary
*   **Alcance Recomendado:** Pruebas controladas limitadas estrictamente de **1 a 3 cámaras perimetrales existentes** autorizadas físicamente por el cliente.
*   **Lenguaje Conceptual:** Sustitución de cualquier direccionamiento IP o regla de firewall real por términos conceptuales aprobados:
    *   *“segmentación de red local autorizada”*
    *   *“aislamiento lógico a validar por el equipo TI/proveedor autorizado”*
    *   *“requisitos generales de red a revisar en piloto”*
    *   *“parámetros definidos fuera de la demo por el cliente/proveedor”*
*   **Trazabilidad:** Análisis preliminar de riesgos operacionales principales (vegetación no podada, enlaces inalámbricos inestables por viento) con validación humana obligatoria antes del despliegue.

#### B. Technical Brief Sanitizado
*   Explica la topología de red de borde del **Sentinel Edge Gateway** de manera conceptual.
*   Documenta las integraciones simuladas de protocolos Dahua LAN, Eufy Consumer Bridge y el resguardo de privacidad **Privacy Shield** (enmascaramiento de veredas públicas mediante recortes de resolución local).
*   Excluye estrictamente endpoints de producción, secretos de la API Gemini, o especificaciones propietarias profundas del Ecosistema ORBI.

#### C. PDF / Print View
*   Diseño limpio optimizado para exportación directa a través de la función de impresión del navegador (`Ctrl + P`).
*   **Libre de ruido de desarrollo:** Oculta dinámicamente controles internos, botones interactivos, paneles de depuración (debug), y localStorage raw data.
*   Incluye de manera obligatoria el identificador del paquete, estado de exportación controlada, aviso no contractual, y créditos institucionales oficiales.

#### D. Control de Acceso Basado en Roles (RBAC)
*   **Administrador / Técnico:** Acceso total al Export Center completo, matrices de seguridad, logs de auditoría in situ, scanner reactivo y controles de exportación.
*   **Conserje / Guardia:** Redirección automática e irreversible a un panel de vista bloqueada informativa (`LockedView`), evitando la exposición de material estratégico, briefs corporativos de red y guías de piloto.

### 5. Créditos Oficiales e Institucionales

*   **Concepto, dirección creativa y universo:**
    Víctor M. León / ORBI Ecosystem.
*   **Co-diseño, arquitectura de software, prompts y QA:**
    ChatGPT / OpenAI.
*   **Implementación asistida, refinamiento y optimización de React:**
    Google AI Studio.

> 📝 **Nota Institucional:** "ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración."

### 6. Próximo Módulo Sugerido
*   **Módulo 10A — Advanced Event Fusion & Offline Predictor:** Implementación de motores locales de predicción secuencial de fallas de enlace basados en heurísticas estables de atenuación de señal inalámbrica.

---

## 💼 MÓDULO 9A — COMPETITION / PUBLIC SHOWCASE EDITION

Este hito representa el despliegue del **Public Showcase Edition Center (Centro de Edición de Vitrina Pública)** de ORBI Sentinel IA, diseñado para concursos, hackathons, showcases, videos promocionales y demostraciones públicas completamente aisladas, sanitizadas y seguras, sin exponer propiedad intelectual sensible ni datos de red reales.

### 1. Estado de Validación Global del Bloque 9
*   **Identificador de Versión:** `v0.9.0-sentinel-public-showcase-edition`
*   **Nota de Estado:** `MÓDULO 9A ACCEPTED / BLOCK 9 PUBLIC SHOWCASE EDITION READY`

### 2. Componentes y Funciones Principales
1.  **Showcase Safety Banner:** Un banner informativo de alta visibilidad que proclama el carácter exclusivamente didáctico y simulado de la vitrina, acompañado de 11 insignias dinámicas de cumplimiento normativo (No Real Data, Sanitized, IP Protected, etc.).
2.  **Showcase Mode Selector:** Selector interactivo para adaptar la narrativa y parámetros del resguardo de IP según el tipo de vitrina externa:
    *   *Hackathon / Competition:* Enfoque en ingenio local y flujos preestablecidos.
    *   *Startup Demo Day:* Foco en propuesta de valor rápido y piloto acotado.
    *   *Corporate Open Innovation:* Enfoque de co-creación bajo acuerdos lógicos.
    *   *Investor Teaser:* Resguardo de algoritmos clave mostrando experiencia de usuario pulida.
    *   *Public Video / YouTube:* Material de difusión masiva visualmente dinámico.
    *   *LinkedIn Launch:* Hito de desarrollo y agradecimientos institucionales del Ecosistema.
    *   *Technical Jury Review:* Detalle del rigor de firmas criptográficas SHA-256 e integridad.
3.  **Public Narrative Builder:** Formulario interactivo que expone descripciones de proyecto sanitizadas para secciones clave (Texto Base, Problema, Solución, Diferenciador y Estado Actual), con botones dedicados de copiado y guardrails regulatorios explícitos.
4.  **Public Demo Scope:** Matriz comparativa interactiva que clasifica claramente las capacidades demostrables seguras frente a las prohibidas para evitar sobrepromesas comerciales.
5.  **Showcase Demo Routes:** Guías orales estructuradas paso a paso por tiempos (Ruta 60s Flash Pitch, Ruta 3m Demo Estándar, Ruta 5m Profundidad Modular y Ruta 10m Jury Review) con sugerencias de pantallas a visitar, guión verbal clave, cosas a evitar y declaraciones de cierre.
6.  **Competition Submission Pack:** Plantillas copiables de resúmenes de texto de 280 caracteres, 800 caracteres, descripciones técnicas extendidas e innovación, completamente auditados por el escáner.
7.  **Public Video Script Pack:** Guiones orales para videos promocionales de 15s, 30s, 60s y un pitch de demostración de 90s, optimizados para plataformas de difusión masiva.
8.  **IP Protection & Claims Governance:** Paneles integrados que delinean qué aspectos técnicos son revelables públicamente, cuáles requieren de forma obligatoria un NDA firmado, y qué secretos de código fuente o prompts internos jamás deben exportarse.
9.  **Public Showcase Scanner & Hot Sanitizer:** Un analizador interactivo heurístico en caliente de texto libre que detecta en tiempo real inyecciones de datos personales (PII), correos, teléfonos, direcciones IP, URLs RTSP, contraseñas, código fuente o promesas comerciales irresponsables. Incluye un botón de **Sanitización en Caliente** que sustituye instantáneamente los hallazgos por valores simulados genéricos seguros.
10. **Showcase Readiness Score & Checklist:** Un algoritmo dinámico que calcula la madurez del material de vitrina (0 a 100). Si falla cualquiera de los 8 factores de seguridad críticos (p. ej. No Real Data o No Credentials), el sistema inhabilita de manera absoluta el copiado de cualquier reporte o plantilla de texto.
11. **Public Showcase Report:** Generador automático del informe consolidado del Showcase en formato Markdown limpio, listo para copiar con un solo clic.

### 3. Integración Inter-Modular
*   **Public Demo Hub:** Botón de acceso directo hacia el Showcase Center integrado en el panel rápido.
*   **Launch Media Kit:** Sincronización bidireccional del guión público sanitizado con el generador de videos.
*   **Official Export Pack & Stakeholder Binder:** Sincronización y aprobación de fuentes sanitizadas oficiales del proyecto.

### 4. Créditos Oficiales e Institucionales Preservados
*   **Concepto, dirección creativa y universo:** Víctor M. León / ORBI Ecosystem.
*   **Co-diseño, arquitectura de software, prompts y QA:** ChatGPT / OpenAI.
*   **Implementación asistida, refinamiento y optimización de React:** Google AI Studio.

> 📝 **Nota Institucional:** "ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración."


## 🔒 POST-9B — PUBLIC SHOWCASE ACCEPTANCE LOCK & BLOCK 9 CLOSURE

Este hito representa la auditoría final de aceptación y el cierre técnico definitivo del Bloque 9 — Competition / Public Showcase Edition, validando que ORBI Sentinel IA (v0.9.1) es una vitrina pública 100% segura, aislada de datos reales, enmascarada y lista para demo days, concursos, videos, YouTube y presentaciones abiertas.

### 1. Estado de Validación Global de Cierre
*   **Identificador de Versión:** `v0.9.1-sentinel-public-showcase-release-lock`
*   **Nota de Estado:** `POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY`
*   **Readiness Score Integrado:** Algoritmo de 17 frentes de auditoría y 100 puntos de preparación que bloquea incondicionalmente la exportación del material si falla cualquier guardrail crítico (incluyendo "Production Locked" y el scanner en caliente).

### 2. Los 17 Frentes de Auditoría y Validación (QA Checklist)
El sistema audita de manera exhaustiva los siguientes puntos críticos, organizados en 10 paneles integrados dentro del Showcase Center:
1.  **Showcase Safety Banner:** Mensaje mandatorio de vitrina, 11 insignias dinámicas y visualización del estado offline "Production Locked".
2.  **Showcase Mode Selector:** Validación de 9 perfiles (incluyendo *Portfolio Showcase* y *Controlled Live Demo*) con límites claros de IP.
3.  **Public Narrative Builder:** Expansión a 10 secciones de narrativa sanitizadas integrando de manera explícita los créditos institucionales y el aviso no contractual.
4.  **Public Demo Scope:** Matriz comparativa interactiva del alcance autorizado (UI, datos simulados) vs material prohibido (código, contraseñas).
5.  **Showcase Demo Routes:** Configuración de 4 rutas cronometradas con guiones detallados y advertencias (evitar mostrar paneles de depuración).
6.  **Competition Submission Pack:** Expansión completa a 15 secciones pre-auditadas y copiables, optimizadas para formularios de postulación a hackathons.
7.  **Public Video Script Pack:** Inclusión del nuevo *Script Voiceover de 3 Minutos* (`demo_voiceover_3m`) enfocado en un recorrido cronológico de la suite modular.
8.  **IP Protection & Claims Governance:** Clasificación tricolor de IP (Verde, Amarillo, Rojo) con restricción activa de afirmaciones de prevención al 100%.
9.  **Public Showcase Scanner & Hot Sanitizer:** Escaneo dinámico con regex de emails, contraseñas, URLs RTSP, IPs, nombres de clientes y prompts.
10. **Aviso de Responsabilidad Mandatorio:** Inclusión incondicional del aviso legal de datos de laboratorio, marcas simuladas y sin validez judicial.

### 3. Integración de Control de Acceso (RBAC QA)
*   **Guardias / Conserjes:** Redirección automática a una pantalla restrictiva con diseño de seguridad y aviso de resguardo preventivo (evitando la fatiga cognitiva).
*   **Administrador / Técnico:** Acceso completo a los controles interactivos de auditoría, herramientas de sanitización y exportadores de plantillas.

### 4. Créditos Oficiales e Institucionales Preservados
*   **Concepto, dirección creativa y universo:** Víctor M. León / ORBI Ecosystem.
*   **Co-diseño, arquitectura de software, prompts y QA:** ChatGPT / OpenAI.
*   **Implementación asistida, refinamiento y optimización de React:** Google AI Studio.

> 📝 **Nota de Seguridad de la Vitrina:** "Esta edición opera con simulaciones de laboratorio deterministas de alta fidelidad. Ninguna IP, contraseña o prompt real del sistema se incluye en el material de concurso."


## 💼 MÓDULO 11A — PANTALLA PRINCIPAL SIMPLE & REENFOQUE DE NAVEGACIÓN UX

Este hito representa el despliegue del **Simple Home Dashboard (Pantalla Principal)** y la reestructuración completa de los menús laterales, optimizando la navegación de acuerdo con los roles del personal (Conserjería, Administrador y Soporte Técnico) y el nivel de complejidad requerido.

### 1. Estado de Validación Global del Módulo 11
*   **Identificador de Versión:** `v0.11.0-sentinel-simple-home-ux`
*   **Nota de Estado:** `POST-10B ACCEPTED / GLOBAL RC CONTROLLED DEMO READY + SIMPLE HOME UX`

### 2. Componentes y Beneficios Principales
1.  **Simple Home Dashboard (Pantalla Principal):**
    *   **Dashboard Unificado:** Proporciona un centro de control elegante y de alto contraste visual (con tonos oscuros y acentos esmeralda/ámbar) que resume los indicadores vitales del sistema, alertas activas y accesos directos.
    *   **Conserjería de Baja Fatiga:** Cuando se opera bajo el rol de `conserje`, se desactivan los paneles técnicos o de configuración y se habilitan tarjetas de lanzador extragrandes y de un solo clic hacia: *Live Wall*, *Modo Conserje (EasyView)* e *Incidentes*, además de un formulario de reporte rápido y llamada telefónica de soporte in situ.
    *   **Manual Operativo Integrado:** Un manual de 5 pasos en forma de micro-guía didáctica para orientar al personal en operaciones regulares perimetrales.
2.  **Dynamic Role-Based Navigation Hierarchy:**
    *   La barra de navegación lateral reconstruye dinámicamente sus grupos de menú para coincidir exactamente con los permisos del rol del usuario actual.
    *   El personal de `conserje` visualiza un menú extremadamente simple con 4 enlaces esenciales de operación diaria.
    *   Los roles de `admin` y `tecnico` acceden a un menú estructurado con 6 herramientas base, un menú de "Gestión" de red y un conmutador interactivo ("Simple" vs "Avanzado") que expande dinámicamente opciones como *Release Candidate Control Center*, *Showcase* y *Exportaciones*.
3.  **Auditoría y Validación:**
    *   La barra lateral y el panel de control principal muestran el sello de validación interna del Ecosistema ORBI con 11 insignias reactivas validadas bajo el protocolo de laboratorio.

---

## 💼 MÓDULO 11B — TRUE MAIN LAUNCHER UX & ONE-SCREEN HOME LOCK

Este hito representa la madurez definitiva de la experiencia inicial de usuario de **ORBI Sentinel IA**, logrando que el software sea simple, intuitivo y extremadamente fácil de operar por personas sin formación técnica de alto nivel, al estilo de un sistema CCTV iVMS-4200 profesional pero con la elegancia y pulcritud de la suite ORBI.

### 1. Estado de Validación Global del Módulo 11B
*   **Identificador de Versión:** `v0.11.1-sentinel-true-main-launcher-ux`
*   **Nota de Estado:** `MÓDULO 11B — TRUE MAIN LAUNCHER HOME LOCK + REENFOQUE SIMPLE UX`

### 2. Mejoras de Experiencia e Interfaz (Home Lock en una sola pantalla)
1.  **Home sin Scroll (One-Screen Layout):**
    *   Rediseño completo de la Pantalla Principal para ajustarse con precisión a resoluciones estándar de escritorio, concentrando todas las acciones críticas sin requerir scroll.
    *   Se eliminó el gran panel de cumplimiento del Release Candidate del inicio y se movió de forma segura al **Centro Avanzado** y la barra lateral de modo avanzado, manteniendo la portada limpia de tecnicismos agobiantes.
2.  **Launcher Real de 8 Tarjetas Principales (Admin/Técnico):**
    *   **Live Wall:** Monitoreo y cámaras en tiempo real de un solo clic.
    *   **Modo Conserje / EasyView:** Operación regular optimizada para baja fatiga cognitiva.
    *   **Incidentes:** Bitácora rápida de alertas perimetrales detectadas.
    *   **Diagnóstico CCTV:** Estado físico y de red de los equipos locales.
    *   **Evidencias y Reportes:** Creación de clips de video sanitizados sin datos PII.
    *   **Cámaras y Gateway:** Administración de hardware y topología LAN.
    *   **Pilotos y Propuestas:** Generación y traspaso de pilotos y propuestas comerciales.
    *   **Configuración y Seguridad:** Gestión de llaves en el Access Vault y políticas RBAC.
3.  **Home Adaptativo Ultra-Simple para Conserjes:**
    *   Cuando se activa el rol de `conserje`, la pantalla principal se reduce dinámicamente a **un máximo de 4 tarjetas grandes**: *Ver Cámaras*, *Modo Conserje (EasyView)*, *Reportar Incidente* y *Llamar / Avisar Técnico (Soporte Directo)*.
    *   Se oculta por completo toda la jerarquía técnica, matrices, configuraciones avanzadas, binders y exportadores, previniendo errores operacionales y fatiga de atención.
4.  **Header y Sidebar Reducidos de Alta Cohesión:**
    *   Se simplificó la barra superior global para mostrar un máximo de 3 badges en Modo Simple (Modo Demo, Producción Bloqueada, Privacidad Activa) y el indicador de "Sistema OK".
    *   La barra de navegación lateral en Modo Simple oculta directamente los 10+ módulos avanzados, agrupando solo las tareas cotidianas. El **Centro Avanzado** se colapsa en un acordeón expandible de un solo clic que revela el resto de módulos únicamente para administradores.
5.  **Preservación Absoluta:**
    *   Ninguna funcionalidad existente fue eliminada, conservando intactos todos los scanners regex en caliente, locks de seguridad, simuladores de telemetría y credenciales del Access Vault.

---

## 💼 MÓDULO 11E — HOME V3 APP-SHELL OVERRIDE & PIXEL-LEVEL LAUNCHER UI

Este hito representa el rediseño absoluto de la experiencia de bienvenida en **ORBI Sentinel IA**, respondiendo al rechazo del MÓDULO 11D debido al exceso de scroll, paneles informativos redundantes y el uso del AppShell técnico global en la portada. La solución fue desacoplar completamente la portada mediante un layout independiente y pulcro que emula una consola de CCTV profesional comercial.

### 1. Estado de Validación Global del Módulo 11E
*   **Identificador de Versión:** `v0.11.4-sentinel-home-v3-launcher-shell`
*   **Nota de Estado:** `MÓDULO 11E — HOME V3 APP-SHELL OVERRIDE & PIXEL-LEVEL LAUNCHER UI LOCKED`

### 2. Componentes y Beneficios Principales
1.  **AppShell Independiente (`SimpleLauncherHomeV3`):**
    *   La Pantalla Principal (`currentTab === "simplehome"`) se ha independizado por completo del layout técnico global de la barra de navegación lateral y el encabezado heredado.
    *   Posee su propio shell visual minimalista, libre de flujos de eventos extensos, estados de sincronización de bases de datos o alertas del planeador central.
2.  **Visual Launcher de 8 Tarjetas Grandes (2x4 Grid):**
    *   Disposición en un grid estricto de 2 filas por 4 columnas optimizado para monitores estándar (`1366x768`) con **cero scroll**.
    *   Cada tarjeta es de formato vertical/cuadrado con un círculo de icono protagonista de gran tamaño (`80px` de diámetro) que permite reconocer la función de un solo vistazo.
    *   Incluye flechas de navegación sutiles, estados de hover premium y una interfaz de "botón principal".
3.  **Sidebar y Header de Producto Propios:**
    *   La sidebar lateral es extremadamente compacta (`190px` máximo), provista de un conmutador rápido para líneas de negocio (`FIELD`, `COMM` y `CONS`), un selector de rol discreto y un menú mínimo.
    *   El header incluye indicadores esenciales en formato de badges limpios (`Demo Mode`, `Production Locked` y `Privacidad Activa`) y el selector para abrir el **Centro Avanzado**.
4.  **Panel Derecho Simple (Máximo 3 Bloques):**
    *   **Estado del Sistema:** Resumen con las métricas depuradas y de lenguaje común (Cámaras en línea, Gateway conectado, Grabación Demo, Red Local).
    *   **Alertas Recientes:** Lista con un máximo de 3 alarmas con botón interactivo "Ver" para acceder rápidamente a su respectivo panel.
    *   **Accesos Rápidos:** Grid de 4 botones (Buscar evidencia, Exportar reporte, Abrir mapa y Manual rápido) que disparan sus respectivas acciones.
5.  **Centro Avanzado en Drawer/Modal:**
    *   Para erradicar la sobrecarga cognitiva en la portada, todos los accesos técnicos avanzados (*Release Candidate Center*, *Public Showcase*, *Demo Deck Export*, *Stakeholder Binder*, *Launch Media Kit*, *Demo Analytics*, *Demo Insights*, *A/B Presentation*, *MVP Freeze Center*) han sido trasladados a un drawer lateral emergente.
6.  **Home Conserje V3 Simplificado:**
    *   Si se opera bajo el rol de `conserje`, la pantalla se reduce a **únicamente 4 tarjetas de gran tamaño** (*Ver Cámaras*, *Modo Conserje*, *Reportar Incidente* y *Avisar Técnico*) y un panel derecho minimalista con instrucciones, aislando por completo al usuario de configuraciones críticas o diagnósticos de red.
7.  **Auto-QA Visual:**
    *   La interfaz cuenta con validadores lógicos no intrusivos que validan que el modo launcher se ejecute con sus debidos parámetros de resguardo y privacidad.


---

## 💼 MÓDULO 11F — PREMIUM LAUNCHER UI POLISH & ENTERPRISE VISUAL REFINEMENT

Este hito representa la maduración visual y el refinamiento de nivel empresarial para la experiencia del Portal Principal de **ORBI Sentinel IA** (v0.11.5), consolidando el layout modular de la consola sin alterar su probada arquitectura funcional y de navegación. Se aplicaron rigurosos principios de diseño "anti-slop" para dotar al producto de una estética CCTV profesional, limpia y de alta confiabilidad.

### 1. Estado de Validación Global del Módulo 11F
*   **Identificador de Versión:** `v0.11.5-sentinel-premium-launcher-ui`
*   **Nota de Estado:** `MÓDULO 11F — PREMIUM LAUNCHER UI POLISH & ENTERPRISE VISUAL REFINEMENT APPROVED & LOCKED`

### 2. Mejoras Estéticas e Integraciones Visuales
1.  **Gradients & Depth (Fondo de Pantalla):**
    *   Fondo negro profundo con gradiente radial superior esmeralda (`#16a34a` al 6%) y cian (`#0891b2` al 2%) en la esquina inferior.
    *   Fina malla técnica superpuesta con opacidad ultra-baja (CSS custom masks) que imita monitores CCTV de gama alta.
2.  **Sidebar de Producto Consolidada:**
    *   Logo integrado en una tarjeta/placa de bordes finos con sutil brillo interno.
    *   Nombres de líneas de negocio completamente expandidos (**Field**, **Community**, **Consumer**), erradicando las abreviaturas informales y mejorando la legibilidad.
    *   Selector de rol interactivo diseñado como un segmented control premium de nivel comercial con indicadores de foco pulsantes y transiciones de 150ms.
3.  **Visual Launcher de 8 Tarjetas Premium (Cero Scroll):**
    *   Círculo de icono agrandado a un diámetro de `80px` con bordes de color diferenciados por categoría y glow sutil.
    *   Tipografía limpia con jerarquía semibold y descripciones en gris azulado claro limitado a un máximo de 2 líneas.
    *   Números de identificación elegantes `01-08` en el sector izquierdo y microinteracciones de elevación suave `translate-y-1` con transiciones fluidas.
4.  **Panel Derecho y Estado del Sistema Premium:**
    *   Indicadores del estado de cámaras, gateway y red local simplificados con micro-pills con bordes finos, libres de bordes rígidos.
    *   Secciones de Alertas Recientes y Accesos Rápidos pulidas con botones interactivos y hover dinámico.
5.  **Centro Avanzado en Drawer Premium:**
    *   Categorización ordenada por frentes técnicos: QA & Validación, Presentación & Showcase, Métricas y Análisis, y Sistema.
    *   Botón de cierre flotante refinado y fondo de desenfoque de capa (`backdrop-blur-md`).
6.  **Home Conserje Simplificado Polish:**
    *   El modo conserje conserva sus 4 botones de acción con la misma elegancia, libre de terminología compleja, garantizando una operación fluida para guardias y operadores.

---

## 💼 MÓDULO 11G — PREMIUM HOME ACCEPTANCE LOCK & OPERATOR USABILITY QA

Este módulo representa la **auditoría final de aceptación, usabilidad y bloqueo de regresión** de la Pantalla Principal premium de **ORBI Sentinel IA** (v0.11.6). Consolida la interfaz unificada tipo launcher CCTV simplificado para el operador de seguridad y el conserje, blindándola contra cualquier intento de sobrecarga de información técnica.

### 1. Estado de Validación Global del Módulo 11G
*   **Identificador de Versión:** `v0.11.6-sentinel-premium-home-acceptance-lock`
*   **Nota de Estado:** `MÓDULO 11G — PREMIUM HOME ACCEPTANCE LOCKED & OPERATOR USABILITY APPROVED`

### 2. Puntos Clave de la Auditoría y Ajustes de Usabilidad (Microcopy QA)
1.  **Limpieza de Microcopia en Español (Corrección de Etiquetas):**
    *   Se corrigieron etiquetas informales o traducidas de forma ambigua: `"Cámara este intermitente"` se estandarizó a `"Cámara intermitente"` en las alertas del sistema.
    *   El botón del panel derecho `"Exporte Reporte"` se corrigió a su infinitivo formal en español `"Exportar reporte"`.
    *   La abreviatura `"PROD LOCKED"` en la cabecera se mejoró a un badge premium elegante con el texto `"Production Locked"`, manteniendo la estética corporativa.
2.  **Estandarización de las 8 Tarjetas Principales (Launcher Admin/Técnico):**
    *   Se recortaron las descripciones técnicas excesivas que causaban truncamientos (`...`) en pantallas estándar. Las descripciones ahora son precisas, concisas y en una sola línea elegante:
        *   `Live Wall`: "Ver cámaras en vivo y monitoreo."
        *   `Modo Conserje`: "Vista simple para operación diaria."
        *   `Incidentes`: "Revisar alertas y eventos críticos."
        *   `Diagnóstico CCTV`: "Revisar cámaras, gateway y red."
        *   `Evidencia y Reportes`: "Generar reportes y evidencia técnica."
        *   `Cámaras y Gateway`: "Administrar dispositivos y conectividad."
        *   `Pilotos y Propuestas`: "Preparar pilotos y propuestas."
        *   `Configuración y Seguridad`: "Gestionar roles, permisos y privacidad."
3.  **Consolidación del Modo Conserje (4 Tarjetas):**
    *   Se bloquearon las 4 tarjetas principales con títulos y textos idénticos en longitud para evitar desalineamientos:
        *   `Ver cámaras`
        *   `Modo Conserje`
        *   `Reportar incidente`
        *   `Avisar técnico`
    *   Se eliminó toda referencia a enrutadores locales, configuraciones PoE o direccionamiento IP para el conserje, manteniendo la interfaz 100% enfocada en operaciones rutinarias del guardia de turno.
4.  **Refinamiento del Menú Recomendado y Sidebar:**
    *   Se expandió el Menú de Navegación Lateral para incluir de forma explícita los accesos a: **Principal**, **Live Wall**, **Incidentes**, **Reportes**, **Configuración** y **Centro Avanzado** (conmutando correctamente el estado del drawer avanzado).
    *   Se preservó el acceso rápido a los frentes técnicos (**Sentinel Field**, **Sentinel Community**, **Sentinel Consumer**) a través del switch selector con nombres formales y completos.
5.  **Grouped Drawer (Centro Avanzado Frentes Técnicos):**
    *   Las subcategorías técnicas se agruparon de manera limpia y semántica:
        *   **QA y Release**: Para gestionar *Release Candidate* y *MVP Freeze Center*.
        *   **Presentación y Showcase**: Para *Public Showcase*, *Stakeholder Binder* y *Launch Media Kit*.
        *   **Exportación**: Para *Demo Deck Export*.
        *   **Analítica**: Para *Demo Analytics*, *Demo Insights* y *A/B Presentation*.
        *   **Sistema**: Para la *Bitácora de Lanzamientos*.
    *   El Centro Avanzado se mantiene estrictamente oculto por defecto (en un drawer invisible), evitando que contamine la pureza visual de la Pantalla Principal.

### 🛡️ Reglas de Oro de No-Regresión Visual (Anti-Regression Checklist)
Para evitar que desarrollos futuros rompan la simplicidad y la elegancia lograda, se establecen los siguientes candados obligatorios:
*   **PROHIBIDO** re-introducir tarjetas de QA, Release Candidate, matrices técnicas o registros de versiones dentro de la Pantalla Principal.
*   **PROHIBIDO** agregar más de 8 tarjetas en el grid del administrador o más de 4 tarjetas en el grid del conserje.
*   **PROHIBIDO** desbordar la pantalla verticalmente; la Home V3 debe encajar perfectamente en el viewport (`h-screen overflow-hidden`) sin generar scroll vertical general.
*   **PROHIBIDO** desglosar direcciones IP, hashes SHA-256 o esquemas PoE en la vista del conserje o en las descripciones principales. Todo lo técnico reside en el Centro Avanzado en segundo plano.


## 🎥 Módulo 12A — Official Demo Runbook & Presenter Mode

Este módulo introduce un completo asistente de presentación guiada (**Official Demo Runbook**) y panel de control flotante (**Presenter Mode**) para estandarizar demostraciones comerciales de ORBI Sentinel IA de manera limpia, segura, y protegiendo el 100% de la privacidad local (sin PII, sin datos reales, sin IPs ni RTSP en reportes):

### 1. Centro del Runbook Oficial (Official Demo Runbook)
*   **Tres Rutas Oficiales Predefinidas:**
    1.  *Elevator Pitch Comercial (60 segundos):* Centrado en la propuesta de valor sin jerga técnica.
    2.  *Demo Técnica de Valor Operacional (3 minutos):* Enfocado en EasyView, la privacidad por diseño, el sistema de diagnóstico y el piloto acotado.
    3.  *Demo Extensa de Ingeniería (5 minutos):* Demostración pormenorizada de roles, diagnóstico de red, evidencia técnica SHA-256, manejo de objeciones y hoja de ruta.
*   **Guías por Paso Completas:** Cada ruta detalla la pantalla sugerida, la duración recomendada, el discurso oral sugerido ("Qué decir") y las exclusiones comerciales críticas ("Qué evitar").
*   **Navegador Directo ("Ir a Pantalla"):** Botones interactivos para que el presentador salte instantáneamente al módulo correcto sin improvisar en la barra de navegación lateral.

### 2. Panel Flotante del Presenter Mode
*   **Controlador Persistente:** Al iniciar una demostración, un panel flotante semitransparente con borde neon y animación activa se ancla en la esquina inferior derecha de la pantalla.
*   **Seguimiento del Script:** Permite al presentador leer el discurso de oratoria del paso actual, ver el cronómetro sugerido, y avanzar o retroceder de paso fácilmente.
*   **Minimizador de Espacio:** Un botón dedicado permite contraer el panel a un discreto indicador lineal en la esquina inferior, evitando la obstrucción de componentes visuales clave durante la navegación del cliente.
*   **Sincronización Total:** Funciona perfectamente tanto en la Pantalla Principal (SimpleLauncherHomeV3) como en cualquiera de los frentes específicos.

### 3. Escáner de Cumplimiento en Tiempo Real (Privacy & Compliance Regex Scanner)
*   **Monitoreo de Minuta Post-Demo:** La sección del runbook incluye un generador interactivo de minutas de acuerdo. Mientras el operador redacta los compromisos, un motor asíncrono analiza el texto utilizando expresiones regulares para buscar posibles infracciones:
    *   *Datos de Identificación (PII):* Direcciones de correo electrónico, números telefónicos de contacto.
    *   *Secretos de Red:* Direcciones IP (v4), enlaces o parámetros RTSP de cámaras.
    *   *Afirmaciones comerciales prohibidas:* Promesas de "detección perfecta", "prevención absoluta de delitos", "reemplazo total de personal" o "SCADA interactivo" que vulneren los principios de diseño ético de la plataforma.
*   **Bloqueo de Portapapeles (Clipboard Guard):** Si el escáner detecta un hallazgo de PII o promesas comerciales prohibidas, bloquea de inmediato los botones de "Copiar Minuta" y "Exportar PDF" y muestra alertas detalladas con recomendaciones de corrección.

### 4. Generador de Minutas y Reporte Markdown
*   **Exportador Pericial:** Una vez que el checklist de privacidad y cumplimiento regulatorio está validado al 100%, permite copiar un informe de propuesta técnica estructurado en formato Markdown que consolida el acuerdo, el alcance de 1 a 3 cámaras propuesto, y las limitaciones operativas declaradas.

---

## 🔒 MÓDULO 12B — PRESENTER MODE QA & OFFICIAL DEMO RUNBOOK LOCK

Este módulo implementa el control de calidad final, la auditoría del lenguaje técnico/comercial y de resguardo de privacidad vecinal, la introducción del "Runbook QA Lock" y la protección de roles de seguridad para demostraciones impecables y libres de improvisaciones.

### 1. Panel de Bloqueo de Calidad (Runbook QA Lock Center)
*   **Pestaña de Auditoría de 10 Frentes:** Se incorporó un panel interactivo centralizado en `Centro Avanzado > Presentación y Showcase > Official Demo Runbook > QA Lock` que consolida la auditoría técnica de los 10 frentes requeridos:
    1.  *Catálogo de Rutas:* Estructura lógica de las 6 rutas oficiales de demostración con objetivos y perfiles.
    2.  *Presenter Overlay:* Filtro de rol (oculto para Conserje), minimización interactiva y persistencia entre vistas.
    3.  *Guiones de Pasos:* Speech sugerido, elementos a evitar y alertas de riesgo técnico por cada paso.
    4.  *Enlaces de Pantalla Directos:* Navegación asistida y saltos fluidos a las pantallas reales sugeridas de cada paso.
    5.  *Panel de Guardrails:* Exposición clara de limitaciones y aclaración de transparencia ética.
    6.  *Checklist Pre-Demo:* Verificación de condiciones iniciales obligatorias antes de iniciar la presentación.
    7.  *Guía de Contingencias:* Protocolos de resolución rápida para imprevistos operacionales de laboratorio.
    8.  *Minuta Post-Demo:* Registro local de compromisos y próximos pasos sin almacenar datos reales.
    9.  *Escáner de Sanitización:* Análisis automático de PII, IPs, RTSP y claims absolutos en la minuta.
    10. *Seguridad RBAC y Preservación de Home:* Garantía de no-contaminación de la Portada Premium y separación de roles de seguridad.
*   **Cómputo Dinámico de Estado Final:** El estado general del runbook se actualiza en tiempo real de acuerdo a la selección de las categorías:
    -   🟢 `OFFICIAL DEMO RUNBOOK LOCKED`: Todos los frentes están en estado *Ready* y el checklist de preservación del Home está validado al 100%.
    -   🟡 `REQUIERE REVISIÓN`: Algún frente de auditoría está en estado *Needs Review* o el checklist de preservación contiene puntos pendientes.
    -   🔴 `RUNBOOK BLOQUEADO`: Algún frente crítico está en estado *Blocked* o el escáner de sanitización ha detectado violaciones activas en la minuta.

### 2. Preservación Estricta del Home Premium
*   **Control de No-Contaminación:** Para asegurar que la portada premium quede libre de elementos ruidosos o saturados, se añadió un checklist interactivo de 6 puntos obligatorios dentro de la auditoría de RBAC:
    1.  La Pantalla Principal premium (SimpleLauncherHomeV3) abre por defecto.
    2.  No aparece el Runbook por defecto en la portada.
    3.  No se agregaron tarjetas ruidosas nuevas al Home.
    4.  El Centro Avanzado sigue oculto por defecto de inicio.
    5.  El personal de Conserjería visualiza estrictamente la Home simplificada de 4 tarjetas.
    6.  No reaparecen QA Seals, matrices de compatibilidad, scanners ni reportes técnicos en la portada principal.
*   **Advertencias Proactivas:** Si cualquiera de estas condiciones se desmarca, el frente de *RBAC & Home Preservation* se degrada automáticamente a `Needs Review` y el estado del Runbook cambia de forma interactiva.

### 3. Filtro de Rol y Robustez del Presenter Mode
*   **Filtro de Rol (Conserje Vedado):** El Presenter Mode y su panel flotante quedan estrictamente restringidos y ocultos si el usuario cambia al rol de **Conserje / Guardia**, previniendo la visualización de guiones de venta o la carga de paneles ejecutivos.
*   **Navegación Fluida:** El panel flotante (expandido o minimizado) asiste al expositor con las directivas de "Qué decir" y "Qué evitar" manteniendo el rol del usuario y persistiendo su estado visual a través de todas las pantallas del sistema.

### 4. Limpieza del Lenguaje Absoluto (Terminology Pass)
*   **Registro de Auditoría Local Protegido:** Se eliminaron sistemáticamente los términos con connotaciones absolutas o de infalibilidad legal tales como "bitácora inmutable", "logs inmutables", "inalterable", "blockchain", "indestructible" de todos los scripts comerciales y operativos de la aplicación:
    -   *Incidentes Comunitarios:* Reemplazado por *"bitácora local protegida"* o *"registro local de auditoría protegido"*.
    -   *Sistemas de Evidencia:* Reconfigurados para detallar *"trazabilidad local con control de integridad mediante firmas SHA-256"*.
*   **Nota de Transparencia de Cara al Cliente:**
    > ℹ️ *Nota de Transparencia: Los registros del Presenter Mode son locales y de apoyo a la trazabilidad de la demo. No constituyen evidencia legal, validación externa ni bitácora inmutable.*


---

## 🎭 MÓDULO 12C — DEMO PRACTICE MODE & PRESENTER REHEARSAL LAB

El nuevo **Demo Practice Mode** permite ensayar presentaciones controladas de ORBI Sentinel IA antes de realizarlas frente a inversionistas o clientes. Opera como un laboratorio de simulación local, interactivo y bajo estrictas salvaguardas éticas y de privacidad.

### 1. Principios de Privacidad y Salvaguardas Éticas
*   **No grabaciones de audio/video:** El laboratorio opera 100% de manera estática y con cronómetros simulados; no captura streams del micrófono ni de la webcam.
*   **No datos biométricos:** No procesa rasgos faciales, patrones de voz, ni evalúa la identidad de la persona.
*   **No datos reales ni IP/RTSP expuestos:** Utiliza exclusivamente placeholders locales y simulaciones seguras de laboratorio.
*   **Práctica enfocada en usabilidad:** Ayuda a ensayar el ritmo de presentación, las objeciones comunes y los guardrails, en vez de emitir calificaciones psicológicas o periciales.

### 2. Estructura de Módulos Incorporados
1.  **Safety Banner (9 Salvaguardas):** Panel superior con badges dinámicos confirmando que el laboratorio cumple con las políticas de sanitización y control.
2.  **Route Rehearsal Selector:** Permite escoger una de las 6 rutas de presentación oficiales del runbook (60s, 3m, 5m, 15m, 30m).
3.  **Practice Session Controller:** Consola interactiva para iniciar, pausar, reiniciar o completar el simulacro, con botones de navegación de pasos (*Paso Anterior* y *Paso Siguiente*).
4.  **Timer & Pacing Coach:** Cronómetro de ensayo que mide el tiempo acumulado vs el objetivo. El consejero dinámico provee alertas en tiempo real (*Dentro de Tiempo*, *Lento*, *Excedido*) y sugerencias (*"Reduce detalles técnicos"*, *"Prepara el cierre"*).
5.  **Step Practice Cards:** Tarjetas que exponen el guion sugerido, los errores habituales a mitigar, y frases de rescate específicas para recuperar el hilo de la demo.
6.  **Common Mistakes Dictionary:** Catálogo interactivo de 12 vicios comunes de presentación comercial.
7.  **Objection Practice Center:** Biblioteca de 12 preguntas capciosas o difíciles, ofreciendo la respuesta ética y responsable, términos a evitar, y enlaces directos para saltar a la pantalla de apoyo de la demo.
8.  **Practice Score Interno (Trazabilidad de Portada):** Calcula un puntaje de preparación del 0 al 100% en base a los pasos validados, objeciones ensayadas, errores repasados y limpieza de notas. Clasifica el ensayo en:
    *   `Ready for Controlled Demo` (Score >= 80 y sin bloqueos de QA)
    *   `Needs Practice` (Score < 80)
    *   `Practice Blocked` (Si hay frentes de seguridad desmarcados o notas contaminadas)
9.  **Practice Notes Scanner (Hot Sanitizer):** Caja de texto con un analizador Regex en tiempo real. Alerta y bloquea la exportación del reporte si detecta emails, direcciones IP reales, enlaces RTSP de cámaras físicas, credenciales expuestas o afirmaciones comerciales absolutas (*"100% seguro"*, *"elimina guardias"*, *"infalible"*).
10. **Practice Report Compiler:** Permite copiar al portapapeles una minuta de práctica perfectamente sanitizada con toda la trazabilidad y métricas del ensayo.
11. **Local Practice History:** Historial de ensayos persistido únicamente en el navegador (`localStorage`), con opción de borrado permanente.
12. **Practice QA Checklist:** Tablero de 16 verificaciones que controla el estado operativo del laboratorio.

### 3. Preservación del Home Premium
El módulo de ensayo se acopla de forma completamente no disruptiva:
*   Se accede exclusivamente desde el panel avanzado (Módulos Avanzados) y enlaces de integración, ocultándose por completo del personal de Conserjería.
*   Respeta en un 100% el diseño, diseño táctil y estructura de 4 tarjetas de la Pantalla Principal.


---

## 🔒 POST-12E — RC CENTER LANGUAGE SANITIZATION & BLOCK MATRIX HOTFIX

Este hotfix obligatorio sanitiza el lenguaje absoluto en toda la suite de control del Release Candidate y ajusta las taxonomías operativas de los bloques para reflejar que la plataforma opera exclusivamente con validaciones de seguridad interna de QA y demostraciones controladas.

### 1. Eliminación Sistemática de Connotaciones de Validación Externa
*   **Aceptación Interna Global:** Se reemplazó el término "Acreditación Global" y "Certificación Oficial" por **"Aceptación Interna Global"** y **"Sello QA Interno"** en el panel central de Release Candidate.
*   **Frentes de Validación:** Reconfigurado "Frentes de Certificación Integrados" a **"Frentes de Validación Interna"** e "Active Sanitizer Scan: Certificado" a **"Active Sanitizer Scan: Validado"**.
*   **Disclaimers Robustos de QA:** Se reforzó que toda la métrica y los sellos de aceptación representan únicamente conformidad interna de checks de presentación para evitar cualquier sugerencia de validación legal judicial, auditoría regulatoria externa o preparación comercial productiva directa.

### 2. Actualización de Taxonomías de Bloques en la Matriz Global
Se actualizó la matriz de estado de los bloques 10, 11 y 12 para alinear el software con la oratoria ética y no absoluta de ORBI Sentinel IA:
*   **Bloque 10:** Renombrado a `BLOQUE 10 — COMPILACIÓN ESTABLE, LENGUAJE SANITIZADO & AUDITORÍA DE TEXTOS COPIABLES (RC)`.
*   **Bloque 11:** Renombrado a `BLOQUE 11 — MONITOREO DE PRIVACIDAD OPERATIVO, CONTROLES DE PII & COPIA RESTRINGIDA POR GUARDRAILS`.
*   **Bloque 12:** Renombrado a `BLOQUE 12 — OFFICIAL DEMO RUNBOOK, PRESENTER MODE & DEMO PRACTICE SUITE DE ENSAYOS INTERNOS`.

### 3. Sanitización de Textos Copiables e Informes
*   **Reportes Consolidados de QA:** Todas las plantillas de exportación Markdown (`generateGlobalReportText` y `generateShortQASealText`) filtran y sanitizan frases absolutas, declarando explícitamente ser reportes de simulación y apoyo interno de QA que no sustituyen acuerdos contractuales ni autorizaciones comerciales oficiales.
*   **Logs y Portapapeles:** Se sanitizaron los logs de copiado y las marcas de auditoría del portapapeles eliminando cualquier referencia a inmutabilidad o validez legal.
*   **Sintonización de Versión:** Toda la aplicación ha sido sincronizada a la versión de control de calidad `v0.12.5-sentinel-rc-language-taxonomy-hotfix`.


---

## 🔒 POST-12F — FINAL BLOCK TAXONOMY & PRACTICE MODE PRESERVATION HOTFIX

Este hotfix final y acotado consolida la taxonomía definitiva de los bloques 10, 11 y 12 en el Release Candidate Control Center, ratifica la preservación íntegra de `DemoPracticeMode`, y deja registro documentado del alcance de este hotfix, alineando el lenguaje responsable en toda la suite de reportes y documentación técnica del proyecto.

### 1. Corrección Final de Taxonomía de Bloques en la Matriz Global
Se han corregido los bloques finales de la matriz para reflejar de forma exacta las responsabilidades de diseño sin mezclar guardrails internos con los títulos de los bloques:
*   **Bloque 10 — Release Candidate Control Center:** Sello QA interno, control RC, locks globales y validación de demo controlada.
*   **Bloque 11 — Premium Home, Operator UX & Launcher Acceptance:** Pantalla Principal premium, Home Conserje, Centro Avanzado oculto y aceptación visual de operador.
*   **Bloque 12 — Official Demo Runbook, Presenter Mode & Practice Suite:** Runbook oficial, Presenter Mode, Presenter QA Lock, Demo Practice Mode, Practice QA Lock, rutas de demo, ensayos, guardrails y reportes sanitizados.

### 2. Verificación y Preservación de DemoPracticeMode
Se ha auditado exhaustivamente `src/components/DemoPracticeMode.tsx` para garantizar que:
*   El archivo y componente continúan exportándose correctamente sin simplificar su alcance funcional de las versiones anteriores.
*   El módulo sigue plenamente accesible para los roles calificados (**Admin** y **Técnico**) y bloqueado de forma restrictiva ante roles de **Conserje / Guardia** mediante el sistema RBAC incorporado.
*   Los cerrojos de software `Practice QA Lock` y `Presenter QA Lock` se mantienen activos y visibles.
*   Se preservan todas las herramientas de soporte (Timer & Pacing Coach, Rescue Phrasings, Objection Practice, Notes Sanitizer, local histories, etc.).

### 3. Mitigación de Expresiones Absolutas Remanentes
Se barrió el código fuente y las plantillas de compilación reemplazando frases absolutas o claims excesivos por enunciados de simulación y apoyo interno de QA:
*   Reemplazo sistemático de expresiones del tipo "garantizando que" por **"dejando reflejado que"** o **"manteniendo consistencia con"**.
*   Asegurado que ningún reporte exportable use términos de validación legal, inmutabilidad o reemplazo directo de recursos humanos.
*   Actualizado el panel de guardrails globales con etiquetas claras de autogestión y un disclaimer aclarando que el sistema opera estrictamente bajo validación interna de laboratorio cerrado.

### 4. Sincronización y Registro Oficial de Lanzamiento
*   Se actualizó el **Version Registry** global y la interfaz a la versión de control de calidad `v0.12.6-sentinel-final-taxonomy-practice-hotfix`.
*   Se ratificó la integridad del **Home Premium** con sus componentes y estructura sin alteraciones visuales regresivas.

---

## 🔒 POST-12F MICROCOPY CLEANUP APPLIED

Este hito de micro-limpieza de textos y compliance consolida la erradicación de cualquier término de carácter absoluto en la suite de control y documentación técnica:

### 1. Reemplazo de Conceptos de Rigidez e Inmutabilidad
*   Se eliminaron referencias a fijaciones estáticas de alcance, reemplazando declaraciones implícitas de inmutabilidad por enunciados de trazabilidad documentada y colaborativa: **"dejar registro documentado del alcance de este hotfix"**.

### 2. Clasificación Responsable de Compilación y Estado
*   Se removieron frases que indicaban que un entregable o build de desarrollo/demostración estaba "listo para producción".
*   Toda referencia a la correcta generación de binarios en el pipeline de desarrollo se describe ahora con precisión técnica como: **"build de producción generado correctamente"** o **"compilación de producción generada correctamente"**.
*   Se ratifica que no se emplean palabras como *"inmutable"*, *"inalterable"*, *"certificado"*, *"acreditado"*, *"legal"*, o *"producción lista"* al describir el estado del software o de las simulaciones, manteniendo total consistencia con las políticas de vocabulario de laboratorio cerrado y controlado.

### 3. Sello de Estado e Integridad
*   **POST-12F MICROCOPY CLEANUP APPLIED**
*   **DEMO PRESENTATION SUITE READY**
*   **HOME PREMIUM PRESERVED**
*   **PRACTICE MODE VERIFIED**

---

## 🏢 MÓDULO 13A — OPERATOR HELP CENTER & IN-APP TRAINING FOUNDATION

Este hito introduce un completo Centro de Ayuda y Capacitación interna en caliente dentro de ORBI Sentinel IA, garantizando que el personal de operación aprenda a utilizar el sistema de forma segura, contextualizada y respetando estrictamente las políticas de privacidad locales:

### 1. Centro de Ayuda Integrado (Operator Help Center)
*   **Rutas de Aprendizaje por Rol (RBAC):** Filtros dinámicos que muestran guías operativas especializadas para Conserjería, Administradores y Personal Técnico de Terreno.
*   **Preguntas Frecuentes (FAQs):** Respuesta a dudas operacionales frecuentes sobre cámaras Dahua/Eufy, enmascaramiento de privacidad y redes locales de demostración.
*   **Glosario Operacional:** Definición clara de acrónimos técnicos (RTSP, PoE, ONVIF, PII, HMAC) alineados con el lenguaje prudente de laboratorio.
*   **Solución de Problemas (Troubleshooting):** Casos prácticos y guías interactivas paso a paso para fallas frecuentes de enrutamiento y redes locales.

### 2. Mini-Recorridos Guiados Interactivos (Guided Tours)
*   **Flujos de Ensayo No Invasivos:** Rutas autogestionadas de hasta 5 pasos con instrucciones cortas, botones de navegación ("Volver", "Siguiente", "Finalizar") y salida rápida.
*   **Navegación en Caliente:** El asistente interactivo guía al operador redirigiéndolo en tiempo real a las pantallas correspondientes para visualizar la ubicación de los módulos en vivo.
*   **Persistencia Local:** Almacenamiento local mediante `localStorage` de los recorridos vistos sin recolección de datos personales ni PII del operador.

### 3. Ayuda Contextual Integrada (Contextual Help Drawer)
*   **Soporte de Pantalla Activa:** Un drawer deslizante desde el lateral derecho que analiza qué pantalla está visualizando el usuario y despliega la ayuda contextual específica:
    *   **Acciones Principales:** Actividades sugeridas para ejecutar correctamente.
    *   **Errores Comunes:** Lista de alertas sobre malas prácticas o claims absolutos prohibidos.
    *   **Qué Evitar / Límites:** Restricciones de privacidad y aclaraciones técnicas.
    *   **Enlaces Directos:** Botón directo para ingresar al manual completo del Help Center.

### 4. Simulación de Reportes de Capacitación (Training Report Generator)
*   **Simulador de Progreso:** Un gestor de progreso de capacitación que calcula el porcentaje de avance según los módulos completados.
*   **Compilador de Diploma/Reporte:** Permite generar un resumen de finalización en Markdown limpio, listo para copiar y registrar la capacitación sin recopilar nombres, correos o datos identificatorios reales de las personas capacitadas.


## 🔒 MÓDULO 13C — OPERATOR ONBOARDING PRACTICE & FIRST-USE VALIDATION

Este hito introduce un modo de práctica inicial interactivo y seguro para el onboarding de operadores de ORBI Sentinel IA, permitiendo aprender los flujos básicos desde el Help Center y el Centro Avanzado sin registrar datos sensibles:

### 1. Práctica de Onboarding por Rol
*   **Ejercicios Especializados:** Escenarios dinámicos diseñados para **Conserje** (registro prudente de incidentes, validación de estado local), **Administrador** (mantenimiento de bitácoras, compliance legal de reportes) y **Técnico** (diagnóstico de conectividad PoE, validación de RTSP).
*   **Feedback Interactivo en Caliente:** Permite simular acciones y obtener validación inmediata sobre las mejores prácticas éticas y técnicas recomendadas para cada rol.

### 2. Salvaguardas Éticas y de Privacidad Activas
*   **Controles de Cumplimiento:** Interruptores integrados para confirmar visualmente el respeto de privacidad ("Enmascaramiento activo", "No recolección de biometría", "Privacidad de terceros").
*   **Escáner de Datos Sensibles en Notas de Práctica:** Un motor de expresiones regulares local analiza en tiempo real las notas ingresadas por el operador para alertar e impedir el almacenamiento de PII (correos, teléfonos, nombres reales) o datos absolutos.

### 3. Registro y Compilación de Progreso Local
*   **Resumen Técnico Práctico:** El operador compila su reporte de práctica en formato Markdown copiable, reafirmando los límites técnicos de la demo y los protocolos éticos.
*   **Bitácora y Trazabilidad Local:** Almacenamiento local mediante `localStorage` de las sesiones completadas, permitiendo revisar el historial sin comprometer la Home premium ni recabar información personal.


---

## 🔒 POST-13D — FINAL ONBOARDING MICROCOPY CLEANUP & BLOCK 13 ACCEPTANCE

Este hito de micro-limpieza de textos y compliance consolida la aceptación formal del **Bloque 13** como la suite interna integrada de ayuda, capacitación y onboarding por rol para **ORBI Sentinel IA**:

### 1. Corrección y Eliminación de "Production-Readiness"
*   Toda afirmación absoluta de estar "listo para producción" o "production-ready" ha sido removida de los reportes y manuales.
*   En su lugar, los entregables se describen con precisión como: **"build de producción generado correctamente para validación interna de demo controlada"**, **"compilación de producción generada correctamente"**, o **"estado limpio de validación interna para demo controlada"**.
*   Se ratifica que no se realiza ninguna afirmación que sugiera validez legal o despliegue productivo real fuera del alcance simulado de laboratorio controlado.

### 2. Corrección de "Zero Private Telemetry" Absoluto
*   Se eliminaron expresiones absolutistas de "cero telemetría" o "sin posibilidad de fuga".
*   Las salvaguardas de privacidad de la suite de capacitación se reformularon para declarar:
    *   **"Sin incluir PII detectable, IP/RTSP, credenciales ni datos sensibles dentro del alcance del reporte sanitizado"**.
    *   **"Sin almacenar PII, credenciales, IP/RTSP ni datos sensibles en los marcadores locales previstos"**.
    *   **"Reduciendo exposición de datos sensibles mediante scanner local y guardrails de demo controlada"**.

### 3. Cierre Formal del Bloque 13
*   **Estado:** `POST-13D ACCEPTED / OPERATOR TRAINING SUITE READY`
*   **Operator Help Center:** `LOCKED / Sello QA Aceptado`
*   **Help Center QA Lock:** `ACCEPTED / Aprobado`
*   **Role-Based Help Filtering:** `ACTIVE` (Conserje, Administrador, Técnico)
*   **Contextual Help Drawer:** `ACTIVE` (Drawer de ayuda inteligente en caliente)
*   **Guided Tours:** `ACTIVE` (Mini-recorridos guiados no invasivos)
*   **Operator Onboarding Practice:** `LOCKED / Sello QA Aceptado`
*   **First-Use Validation:** `ACTIVE` (Validación orientativa inicial sin evaluación personal)
*   **Onboarding QA Lock:** `ACCEPTED / Aprobado`
*   **Home Premium:** `PRESERVED` (Estructura de 8 tarjetas comerciales intactas)
*   **Home Conserje:** `PRESERVED` (Estructura simple de 4 tarjetas intactas)
*   **RBAC:** `ACTIVE` (Aislamiento de accesos y funciones según el rol asignado)
*   **Reports Sanitized:** `ACTIVE` (Regex en caliente contra PII, IP/RTSP y credenciales)
*   **Local History Sanitized and Purgeable:** `ACTIVE` (Historial guardado únicamente en localStorage)

### 4. Sin Certificación Externa ni Evaluación Sensible
*   Se erradicó por completo el lenguaje de acreditación forense, peritaje oficial, aprobación contractual o score profesional evaluativo.
*   Todo el progreso es calificado como **resumen interno, progreso orientativo, aprendizaje asistido, práctica inicial o guía por rol** para una demostración controlada y validación humana segura.

===========================================================
COMPROMISO DE SEGURIDAD OPERATIVA Y CALIDAD AUDITADA
ORBI-SENTINEL-OPERATOR-TRAINING-SUITE-LOCKED-v0.13.4
===========================================================


## 🏢 MÓDULO 14A — CUSTOMER PILOT WORKSPACE FOUNDATION

Este hito introduce el **Customer Pilot Workspace** como una herramienta interactiva integral para el diseño, auditoría y documentación técnica de pilotos comerciales controlados:

### 1. Perfil de Sitio Sanitizado y Sandbox (Sanitized Site Profile)
*   **Aislamiento y Sanitización de Datos:** Entrada controlada que requiere alias de sitio, tipo de recinto y región genérica sin almacenar nombres reales de clientes ni direcciones geográficas.
*   **Planificación Acotada:** Estimador interactivo de cámaras de simulación y duración recomendada (ej. 15 días) para limitar el alcance operacional de los pilotos.

### 2. Factores de Autorización y Readiness Checklist
*   **12 Factores de Autorización Externa:** Lista de control de 12 puntos críticos (ej. consentimiento legal, exclusión de credenciales) con disparadores de bloqueo si se omiten elementos vitales.
*   **Conectividad de Red y Hardware:** Verificaciones de topología física de sub-streams secundarios Dahua/Eufy, evitando la exposición de contraseñas u otros datos vulnerables.

### 3. Escáner de Privacidad en Vivo y Reporte Unificado (Pilot Scanner)
*   **Protección Dinámica:** El escáner analiza en caliente notas de stakeholders y descripciones del sitio, impidiendo guardar borradores o compilar reportes si detecta IPs reales, correos, RTSP o credenciales.
*   **Reportes Markdown Copiables:** Generación instantánea de acuerdos y reportes técnicos orientativos de trabajo interno con protección de portapapeles si existen infracciones.


## 🔒 MÓDULO 14B — SUCCESS CRITERIA MICROCOPY CLEANUP & READINESS LOCK

Este hito de micro-limpieza final y aseguramiento consolida la eliminación total de promesas comerciales absolutas o términos de certificación técnica:

### 1. Corrección y Reemplazo de Falsas Alarmas
*   Se removió el texto `"Cero falsas alarmas prometidas"`.
*   Se reemplazó por: **"Ruido operacional y falsas alarmas comunicadas como limitación"** para reflejar la naturaleza orientativa de la asistencia técnica por IA sin falsas expectativas de infalibilidad.

### 2. Saneamiento de Retorno de Inversión (ROI)
*   Se eliminó la afirmación de `"Retorno de inversión (ROI) financiero directo estimado"`.
*   Se reemplazó por: **"Análisis referencial de valor operativo no vinculante"** o **"ROI referencial no vinculante, sujeto a revisión comercial externa"**, protegiendo las conversaciones comerciales de compromisos directos no autorizados.

### 3. Sello de Estado e Integridad Final
*   **Fase del MVP:** `v0.14.3-sentinel-customer-pilot-simulator-lock`
*   **Estado del Workspace:** `CUSTOMER PILOT WORKSPACE LOCKED` (Aceptado y Protegido)
*   **Estado del Simulador:** `CUSTOMER PILOT SIMULATOR LOCKED` (Aceptado y Protegido v0.14.3)
*   **Nota de Hito:** `POST-14D CUSTOMER PILOT SIMULATOR LOCKED & SHIELDED`
*   **Home Premium:** `PRESERVED` (Siete tarjetas de menú y una de bienvenida intactas)
*   **RBAC:** `ACTIVE` (Acceso filtrado de Workspace y Simulador por rol de Administrador o Técnico; bloqueado para Conserje)

---

## 🔬 MÓDULO 14C — CUSTOMER PILOT SIMULATOR & SYNTHETIC SCENARIO LAB

Este módulo introduce un completo laboratorio de ensayos de simulación para evaluar pilotos perimetrales utilizando únicamente datos sintéticos, cámaras ficticias, eventos simulados, scanner integrado y reportes sanitizados copiables sin exponer contraseñas ni IPs reales.

---

## 🔒 MÓDULO 14D — CUSTOMER PILOT SIMULATOR QA & SYNTHETIC PILOT LOCK

Hito final de aseguramiento de calidad y auditoría de microcopy para el simulador de pilotos, garantizando que el simulador funcione exclusivamente con datos sintéticos y que el rol de Conserje no tenga accesos visibles:

### 1. Bloqueo de Acceso y RBAC Estricto
*   **Privacidad por Perfil:** El simulador está bloqueado para el rol Conserje y Guardia. Los accesos del simulador están totalmente ocultos en su barra lateral y su Centro Avanzado.
*   **LockedView Integrada:** Intentos de acceso directo mediante URL forzada devuelven un cartel restrictivo explicativo con transiciones suaves.

### 2. Saneamiento de Microcopy y claims Prohibidos
*   **Vocabulario Responsable:** Se sustituyó toda referencia a certificaciones, acreditaciones, compatibilidad universal, salidas impecables y garantías de detección por expresiones tales como: "validación interna técnica", "escenario sintético", "reporte sanitizado", "compatibilidad validada dentro del alcance del módulo" y "datos sanitizados".

### 3. Panel de Control de QA Lock
*   **Estados de Verificación del Simulador:**
    *   `Simulator Ready`: Listo para pruebas controladas sintéticas.
    *   `Simulation Needs Sanitization`: Bloqueado temporalmente por detección activa de datos sensibles (IPs, correos, RTSP, RUT, claves) en el Scanner.
    *   `Needs Review`: Marcado para revisión del equipo técnico de red.
    *   `Simulation Blocked`: Bloqueado por desactivar salvaguardas éticas críticas.
    *   `CUSTOMER PILOT SIMULATOR LOCKED`: Estado de congelamiento final óptimo y auditado.

===========================================================
COMPROMISO DE CONFORMIDAD ÉTICA Y VALOR DE PILOTO CONTROLADO
ORBI-SENTINEL-CUSTOMER-PILOT-SIMULATION-v0.14.3
===========================================================


## 🏢 MÓDULO 15A — PILOT OUTCOME REVIEW & LEARNING LOOP FOUNDATION

Este hito introduce el **Pilot Outcome Review & Learning Loop** como un centro de mando para procesar de forma estructurada los aprendizajes de pilotos controlados o simulaciones sintéticas:

### 1. Ingesta Temática y Recolección Sanitizada
*   **Recolección de Hallazgos:** Captura y clasificación de hallazgos observados en terreno (latencias, retroalimentación del cliente, dudas operativas) agrupados por severidad y asignación de equipo responsable.
*   **Encuestas de Satisfacción Conceptuales:** Cuadrante para recabar impresiones cualitativas de operadores y stakeholders del cliente sin recopilar nombres reales o PII.

### 2. Conversión Automática a Backlog de Producto
*   **Mejora Continua del Core:** Un botón interactivo de conversión permite transformar hallazgos crudos y retroalimentación del simulador en elementos formales de backlog del producto (ej. "Ajustar descargo de responsabilidad comercial", "Optimizar búfer local").


## 🔒 MÓDULO 15B — PILOT OUTCOME REVIEW QA & LEARNING LOOP LOCK

Este hito consolida el congelamiento operacional y el aseguramiento del control de calidad en el ciclo de asimilación técnica de ORBI Sentinel IA:

### 1. Panel de Control de QA Lock
Fuerza un flujo de control de calidad sobre la evaluación y calibración mediante estados estandarizados:
*   `Learning Loop Ready`: Listo para procesar aprendizajes y transformarlos en backlog.
*   `Needs Sanitization`: Bloqueado temporalmente por detección activa de datos sensibles (IPs, correos, RTSP, claves) en el Scanner.
*   `Needs Review`: Marcado para revisión del equipo técnico de desarrollo.
*   `Review Blocked`: Estado de bloqueo estricto cuando existen infracciones de datos sensibles.
*   `PILOT OUTCOME LEARNING LOOP LOCKED`: Estado final de congelamiento y cierre formal del bucle de aprendizaje.

### 2. Escáner de Privacidad y Claims Integrado
*   **Inspección en Caliente:** El Scanner analiza en tiempo real todos los textos de hallazgos, encuestas, incidentes de usabilidad y planes de acción, bloqueando inmediatamente el reporte unificado y las acciones de guardado o copiado si detecta fugas de datos de red, PII o promesas comerciales de infalibilidad absoluta (como "100% operativo" o "libre de errores").

### 3. Registro e Historial Local Purgable
*   **Persistencia Segura:** Guarda los reportes locales sanitizados en `localStorage`, permitiendo realizar descargas, limpiezas y purgas completas del historial a discreción del usuario operador técnico sin contaminar la Home premium.


## 🔒 POST-15B — LEARNING LOOP FINAL MICROCOPY CLEANUP & ACCEPTANCE LOCK

Este hito representa la aceptación formal y congelamiento de calidad del **Bloque 15 — Pilot Outcome Review & Learning Loop**:

### 1. Corrección Completa de Lenguaje Absoluto
* Se removieron de forma proactiva todas las afirmaciones absolutas, reclamos exagerados de infalibilidad, o promesas de garantía técnica y comercial. Las expresiones absolutas se han reemplazado por lenguaje responsable técnico (ej. *"validación TypeScript y linter completada sin errores reportados"*).
* Toda referencia a bloqueos absolutos o promesas comerciales de prevención se reformuló como control interno de QA del bucle de aprendizaje.

### 2. Estado de Aceptación del Bloque 15
*   **Pilot Outcome Review Center:** Locked.
*   **Learning Loop QA Lock:** Accepted (PILOT OUTCOME LEARNING LOOP READY).
*   **Sanitized Outcome Intake:** Active.
*   **Observations & Findings:** Active.
*   **Stakeholder Feedback Sanitized:** Active.
*   **Incident Learning Review:** Active.
*   **Technical Learning Review:** Active.
*   **UX & Operator Learning:** Active.
*   **Product Improvement Backlog:** Active.
*   **Responsible Claims Review:** Active.
*   **Next Iteration Plan:** Active.
*   **Outcome Scanner:** Active.
*   **Outcome Summary Report:** Sanitized.
*   **Local Learning History:** Sanitized and Purgeable.
*   **RBAC Controls:** Active & Preserved (Conserjería oculto y restringido, Admin/Técnico activo).
*   **Home Premium:** Preserved fully.

Sin certificación externa, compromisos legales/judiciales o garantías absolutas de ROI, manteniendo un flujo de entrenamiento responsable, ético y transparente.

===========================================================
COMPROMISO DE SEGURIDAD OPERATIVA Y CALIDAD AUDITADA
ORBI-SENTINEL-PILOT-OUTCOME-LEARNING-LOCK-v0.15.2-accepted
===========================================================


## 🧪 MÓDULO 16A — REAL CAMERA LAB REACTIVATION & DAHUA POE CONNECTION TEST

Este hito representa la reactivación completa del laboratorio real de cámaras Dahua PoE en red local autorizada para preparar pruebas controladas físicas de hardware sin exponer credenciales ni contaminar la Home premium.

### 1. Directivas de Seguridad del Laboratorio
*   **Safety Checklist:** Un checklist interactivo requiere certificar directivas críticas (Cámaras Autorizadas Solamente, Sin Credenciales en Claro, Sin Puertos Públicos Expuestos, IP/RTSP Enmascarado) para habilitar llamadas de red local o tests. Si alguna falla, el estado del laboratorio se bloquea a `Lab Blocked`.
*   **Enmascaramiento Total de PII/RTSP:** Las IPs y credenciales de cámaras reales ingresadas se enmascaran en frontend (`192.168.x.x` y `rtsp://admin:••••••@...`), protegiendo datos confidenciales en reportes exportables y auditorías.

### 2. Conjunto de Pruebas de Conexión del Canal
*   **Test Snapshot:** Invoca `/api/lab/cameras/test-snapshot` para capturar imágenes fijas con tiempos de latencia, tasa de éxito y diagnóstico pormenorizado, con visualización segura toggleable ("Ocultar Preview").
*   **Test RTSP Connection:** Invoca `/api/lab/cameras/test-rtsp` para simular o validar el handshake RTSP sobre red local.
*   **FFmpeg Probe:** Invoca `/api/lab/ffmpeg/probe` para analizar códecs, resoluciones, tasa de FPS y latencias sanitizadas sin exponer detalles crudos.

### 3. Escáner de Notas y Reporte Técnico Sanitizado
*   **Escáner de Seguridad en Caliente:** Valida la bitácora del operador técnico buscando IPs crudas, credenciales, cadenas de URL RTSP o términos comerciales prohibidos (garantía, 100%, perfecto). Bloquea la copia del reporte si hay hallazgos activos e incorpora un botón de sanitización inmediata.
*   **Reporte Técnico Sanitizado:** Compila un informe unificado estructurado en Markdown limpio para auditorías locales de conectividad sin contaminación de la Home premium.
*   **Live Wall Lab Slot:** Muestra dos ranuras de prueba (Lab East con snapshot exitoso vs Lab West bloqueado por Unauthorized HTTP 401).

===========================================================
COMPROMISO DE SEGURIDAD OPERATIVA Y CALIDAD AUDITADA
v0.16.0-sentinel-real-camera-lab-reactivation-accepted
===========================================================


## 🧪 MÓDULO 16C-LOCAL — REAL CAMERA LAB LOCAL RUNTIME FIX

Este hito representa la corrección técnica completa para la ejecución local en tiempo real de ORBI Sentinel IA con cámaras físicas conectadas a la LAN del laboratorio técnico:

### 1. Corrección del Escáner de Evidencia (PII Scanner Correction)
*   Se modificó el comportamiento dinámico de `runEvidenceScanner` para evitar bloqueos falsos por los campos de formulario controlados `"IP Local Temporal"` y `"Contraseña Temporal"`.
*   El scanner continúa monitoreando rigurosamente las notas de bitácora del operador, reportes copiables y registros de auditoría técnicos, bloqueando la copia o exportación si se detecta alguna IP o credencial cruda sin enmascarar.

### 2. Eliminación de Credenciales Inseguras Predeterminadas
*   El estado inicial para `formPass` en el formulario del perfil runtime de sesión se estableció en `""` (string vacío) para garantizar que no se expongan ni utilicen contraseñas de demostración de forma predeterminada.

### 3. Consolidación de Rutas en Backend
*   Se eliminaron las definiciones duplicadas de los endpoints `POST /api/lab/cameras/test-snapshot` y `POST /api/lab/cameras/test-rtsp` en el servidor Express.
*   Se unificaron los controladores para soportar de manera integrada tanto las pruebas de presets simulados (`lab-cam-01`, `lab-cam-02`) actualizando el estado de la tienda en memoria (`labCamerasStore`), como las conexiones físicas de sockets reales y capturas CGI de la cámara física cuando se consulta el ID `"runtime"`.

### 4. Soporte Adicional para Gateway Health
*   Se actualizó el endpoint `/api/lab/gateway/health` para proveer de forma explícita las banderas `ffmpegAvailable: ffmpegDetected` y la propiedad `ffmpegVersion` al cliente React, asegurando una inicialización fluida de los pre-flights de diagnóstico.

===========================================================
COMPROMISO DE SEGURIDAD OPERATIVA Y CALIDAD AUDITADA
v0.16.3-sentinel-local-real-camera-runtime-fix-accepted
===========================================================


## 🧪 HOTFIX 16C-DEVSERVER — LOCAL DEV SERVER STARTUP FIX

Este hito representa la corrección técnica de arranque del servidor de desarrollo local para ORBI Sentinel IA tras la implementación de los conectores físicos reales del laboratorio de cámaras:

*   **Arranque del Servidor Reparado (Server Startup Repaired):** El servidor Express se inicia de forma limpia y confiable. El middleware de Vite se levanta correctamente y el puerto `3000` queda expuesto de inmediato.
*   **Endpoints Protegidos (Endpoints Guarded with Try/Catch):** Los controladores de los endpoints `/api/lab/gateway/health`, `/api/lab/cameras/test-snapshot`, `/api/lab/cameras/test-rtsp` y `/api/lab/ffmpeg/probe` han sido completamente blindados con bloques try-catch robustos, evitando caídas imprevistas del proceso por fallos de socket, timeouts o discrepancias de red física.
*   **Gestión Segura de FFmpeg (FFmpeg Absence Handled Safely):** Se resolvió la detección de ffprobe y ffmpeg. Si no están instalados en el sistema anfitrión, la propiedad `ffmpegAvailable` reporta `false` de forma segura, y la sonda de diagnóstico FFmpeg `/api/lab/ffmpeg/probe` responde amigablemente con JSON sanitizado en lugar de tumbar la aplicación.
*   **Sin Sondeos Automáticos al Arrancar (No Camera Probe on Startup):** El inicio de `server.ts` se realiza sin efectos secundarios. No se ejecutan pings reales, snapshots automáticos ni conexiones RTSP/FFmpeg hasta que el usuario activa de forma explícita las pruebas mediante los controles manuales de Real Camera Lab.
*   **Limpieza de Credenciales y Sanitización Dinámica:** Se integró sanitización robusta con `split().join()` en lugar de RegExp directas para enmascarar contraseñas y direcciones IP en reportes de error de forma segura.

===========================================================
ESTADO ESPERADO:
LOCAL DEV SERVER STARTUP FIX READY
REAL CAMERA LAB LOCAL RUNTIME READY
HOME PREMIUM PRESERVED
RBAC PRESERVED
v0.16.4-sentinel-local-devserver-startup-fix-accepted
===========================================================







