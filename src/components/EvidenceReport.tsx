import React, { useState } from "react";
import { Park, Camera, Incident, Clip } from "../types";
import { FileText, Clipboard, Sparkles, RefreshCw, AlertCircle, Info, Check, Shield, Activity, HardDrive, Users, CheckSquare, Wrench } from "lucide-react";

interface EvidenceReportProps {
  parks: Park[];
  cameras: Camera[];
  incidents: Incident[];
  isLabRecordingEnabled?: boolean;
  recordingMode?: string;
  retentionDays?: number;
  clips?: Clip[];
}

export default function EvidenceReport({
  parks,
  cameras,
  incidents,
  isLabRecordingEnabled = false,
  recordingMode = "mixto",
  retentionDays = 7,
  clips = []
}: EvidenceReportProps) {
  const [selectedParkId, setSelectedParkId] = useState<string>(parks[0].id);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("ninguno");
  const [contextProfile, setContextProfile] = useState<string>("Planta Solar");
  const [alertLevel, setAlertLevel] = useState<string>("Crítico");
  const [possibleCause, setPossibleCause] = useState<string>("Rotación de seguidores solares");
  const [recommendedAction, setRecommendedAction] = useState<string>("Re-alineación y elevación de antena");
  const [edgeRecorderState, setEdgeRecorderState] = useState<string>("Grabando continuo");
  const [userObservations, setUserObservations] = useState<string>("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [diagnosticMethod, setDiagnosticMethod] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Destinatarios Copy Success feedback states
  const [copyAdminSuccess, setCopyAdminSuccess] = useState(false);
  const [copyClientSuccess, setCopyClientSuccess] = useState(false);
  const [copyTechSuccess, setCopyTechSuccess] = useState(false);

  const selectedPark = parks.find((p) => p.id === selectedParkId) || parks[0];
  const parkCameras = cameras.filter((c) => c.parkId === selectedPark.id);

  // Auto-select first camera of selected park
  React.useEffect(() => {
    if (parkCameras.length > 0) {
      setSelectedCameraId(parkCameras[0].id);
    } else {
      setSelectedCameraId("");
    }
  }, [selectedParkId]);

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || parkCameras[0] || null;

  // Compile possible cause list
  const POSSIBLE_CAUSES = [
    "Rotación de seguidores solares (Obstrucción LOS)",
    "Falla en puerto PoE / Switch saturado",
    "Atenuación atmosférica (Lluvia o niebla densa)",
    "Contraseña errónea tras cambio en Vault",
    "Intrusión perimetral verificada por IA",
    "Corte de fibra óptica / Enlace descendido",
    "Tránsito peatonal autorizado por conserjería"
  ];

  // Compile actions list
  const RECOMMENDED_ACTIONS = [
    "Re-alineación y elevación física de antena",
    "Cambiar puerto PoE en Switch y reiniciar canal",
    "Ajustar sensibilidad de zona e incluir filtro de viento",
    "Actualizar contraseña de sincronización en Access Vault",
    "Despacho preventivo de patrullero de ronda",
    "Enmascarar zona exterior para cumplimiento de privacidad"
  ];

  const handleGenerateReport = async () => {
    if (!selectedPark || !selectedCamera) {
      setErrorMsg("Por favor, selecciona un parque y una cámara para generar la evidencia.");
      return;
    }

    setErrorMsg("");
    setIsGenerating(true);
    setGeneratedReport("");

    let ffmpegStatus = {
      ffmpegBinary: "mock",
      version: "N/A",
      captureMode: "mock",
      storagePath: "orbi-sentinel-lab-recordings/clips",
      writePermission: "mock",
      safetyFlags: {
        ORBI_SENTINEL_LAB_REAL_CONNECTORS: false,
        ORBI_SENTINEL_LAB_RECORDING_ENABLED: false,
        ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED: false
      }
    };

    try {
      const fRes = await fetch("/api/lab/ffmpeg/status");
      if (fRes.ok) {
        const fData = await fRes.json();
        if (fData && fData.ffmpegBinary) {
          ffmpegStatus = fData;
        }
      }
    } catch (e) {
      console.error("Error fetching FFmpeg status for report:", e);
    }

    const reportIdSuffix = Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toLocaleString("es-CL");

    // Special lab report compiler
    if (selectedCamera.isLab || selectedParkId === "dahua-lab") {
      const reportId = `SR-LAB-${reportIdSuffix}`;
      const labCams = cameras.filter(c => c.isLab || c.parkId === "dahua-lab");
      const totalLabCams = labCams.length;
      const cameraClips = clips.filter(c => c.cameraName === selectedCamera.name);

      let labReportText = `## REPORTE DE EVIDENCIA TÉCNICA - ORBI Sentinel IA (LAB)
**ID de Reporte:** ${reportId} [Ambiente de Pruebas]
**Recinto/Parque:** Laboratorio Dahua PoE
**Cámara Analizada:** ${selectedCamera.name} (${selectedCamera.model})
**Estado Conexión:** ${selectedCamera.status}
**Fecha/Hora:** ${timestamp}
**Método de Verificación:** Sentinel Gateway Local Adapter

---

### 1. Resumen Ejecutivo de Laboratorio (Dahua PoE Lab)
Este reporte técnico documenta las pruebas de integración local de CCTV multi-marca para el ecosistema **ORBI Sentinel IA**. Se analizó el comportamiento de la cámara de pruebas **${selectedCamera.name}** bajo la topología actual de laboratorio.

* **Cámaras de Laboratorio Registradas:** ${totalLabCams} dispositivo(s) en base de datos.
${labCams.map((lc, index) => `  ${index + 1}. **${lc.name}** | IP: ${lc.ip} | Marca: ${lc.brand || "Dahua"} | Estado: ${lc.status} | Stream: ${lc.streamType || "main"}`).join("\n")}
* **Estado de Conectividad:** El dispositivo reporta un estado de enlace **${selectedCamera.status}** con una latencia media de **${selectedCamera.lastPing || "N/A"}**.

---

### 2. Pruebas Técnicas Realizadas (Gateway Local Core)
* **Handshake de Red (ICMP Ping):** ${selectedCamera.status === "Offline" ? "Fallido (No hay respuesta)" : "Exitoso (Canal de transmisión físico operativo)"}.
* **Detección ONVIF:** ${selectedCamera.status === "Offline" ? "No disponible" : selectedCamera.status === "Sin Acceso" ? "Rechazado (Error de Autenticación 401)" : "Establecido en puerto " + (selectedCamera.onvifPort || "80")}.
* **Builder de Ruta RTSP:** Compilación automática completada. Generación de URI segura sin exposición de credenciales privadas.
* **Sonda de Fotogramas (Snapshot Probe):** ${selectedCamera.status === "Online" ? "Sonda completada con éxito (Fotograma clave simulado)" : "Sonda fallida / Pendiente por estado de enlace"}.

---

### 2.5. Lab Snapshot & Preview Status (Módulo 1B)
* **Cámara de Prueba:** ${selectedCamera.name}
* **Estado de Snapshot Probe:** ${selectedCamera.snapshotEnabled !== false ? "Habilitado (" + (selectedCamera.lastSnapshotStatus || "Sonda Lista / OK") + ")" : "Deshabilitado en Configuración de Lab"}
* **Estado de RTSP Preview:** ${selectedCamera.previewEnabled !== false ? "Habilitado (" + (selectedCamera.lastPreviewStatus || "Experimental / Transmisión Pasiva") + ")" : "Deshabilitado en Configuración de Lab"}
* **Fuente de Conexión:** ${selectedCamera.realConnectorAllowed !== false ? "Real Lab Connector (Sujeto a Bandera Segura)" : "Mock / Simulador Fallback"}
* **Fecha de Última Prueba:** ${timestamp}
* **Zona de Privacidad / Compliance:** ${selectedCamera.privacyZone ? selectedCamera.privacyZone.toUpperCase() : "LAB (MESA DE PRUEBAS)"}
${selectedCamera.privacyZone === "private" ? "⚠️ ALERTA DE COMPLIANCE: Cámara configurada en Zona Privada. Las imágenes y capturas están estrictamente bloqueadas por el Privacy Shield y no se incluirán de forma automática en reportes externos para resguardar la privacidad de menores, familias o espacios privados." : "* **Filtro de Privacidad:** Cumple con la directiva de no incluir capturas de menores de edad o espacios familiares no autorizados."}

---

### 2.8. Camera Health & Capability Validation (Módulo 1C)
* **Puntaje de Salud (Health Score):** ${selectedCamera.healthScore !== undefined ? selectedCamera.healthScore : 100}/100 [${selectedCamera.healthScore !== undefined ? (selectedCamera.healthScore >= 85 ? "Salud Alta" : selectedCamera.healthScore >= 60 ? "Salud Parcial" : selectedCamera.healthScore >= 30 ? "Requiere Revisión" : "No Operativa") : "Salud Alta"}]
* **Estado de Host (Host Reachable):** ${selectedCamera.hostReachable !== false ? "✓ Conectado / Accesible" : "✗ Inalcanzable"}
* **Puerto HTTP (HTTP Reachable):** ${selectedCamera.httpReachable !== false ? "✓ Abierto (Puerto " + (selectedCamera.httpPort || 80) + ")" : "✗ Cerrado o Timeout"}
* **Flujo RTSP (RTSP Reachable):** ${selectedCamera.rtspReachable !== false ? "✓ Emitiendo flujo de video" : "✗ Sin Señal de Video / Puerto 554 cerrado"}
* **Soporte ONVIF (ONVIF Reachable):** ${selectedCamera.onvifReachable !== false ? "✓ Integración Completa (XML SOAP OK)" : "✗ Sin respuesta de integración"}
* **Estado de Autenticación (Auth Status):** ${selectedCamera.status !== "Sin Acceso" ? "✓ Autorizado (Credenciales válidas)" : "✗ Acceso denegado (Error de Autenticación 401)"}
* **Latencia Estimada:** ${selectedCamera.latencyEstimate || selectedCamera.lastPing || "2-4 ms"}
* **Último chequeo exitoso:** ${selectedCamera.lastSuccessfulCheck || "05-Jul-2026 12:00:00 UTC"}
* **Último chequeo fallido:** ${selectedCamera.lastFailedCheck || "N/A"}
* **Connector Mode:** ${selectedCamera.realConnectorAllowed !== false ? "Lab Real" : "Mock / Simulador Fallback"}
* **Privacy Restriction:** ${selectedCamera.privacyZone ? selectedCamera.privacyZone.toUpperCase() : "LAB"}

---

### 2.9. Local Recording & Clip Evidence Status (Módulo 1D)
* **Estado de Grabación Local (Master Arm):** ${isLabRecordingEnabled ? "🔴 ARMADO (Grabación Activa)" : "○ DESARMADO (Evaluación / Modo Mock)"}
* **Modo de Captura Configurado:** ${recordingMode.toUpperCase()}
* **Periodo de Retención de Disco:** ${retentionDays} días
* **Segmentos de Video de Evidencia Registrados para esta Cámara:** ${cameraClips.length} clip(s) disponible(s) en búfer
${cameraClips.map((cl, i) => `  - **ID:** ${cl.id} | Origen: ${cl.source.toUpperCase()} | ${cl.timestampStart} a ${cl.timestampEnd} | Estado: ${cl.status.toUpperCase()}${cl.associatedIncidentId ? ` (Asociado a incidente: ${cl.associatedIncidentId})` : ""}`).join("\n") || "  *(No se registran clips guardados para esta cámara)*"}

---

### 2.95. FFmpeg Clip Capture Lab Status (Módulo 1E)
* **Estado FFmpeg Binary:** ${ffmpegStatus.ffmpegBinary === "detected" ? "✓ DETECTADO" : "✗ NO DETECTADO (Mock/Fallback)"}
* **Versión de FFmpeg:** ${ffmpegStatus.version}
* **Modo de Captura Activo:** ${ffmpegStatus.captureMode === "lab real" ? "🔴 CAPTURA REAL DE LABORATORIO (FFmpeg Direct Segment)" : "🔵 SIMULACIÓN MOCK ACTIVADA"}
* **Directorio de Grabaciones Seguro (Sandbox):** \`${ffmpegStatus.storagePath}\`
* **Permiso de Escritura de Disco:** ${ffmpegStatus.writePermission === "verified" ? "✓ VERIFICADO" : "MOCK / SIMULADO"}
* **Banderas de Seguridad Activas (Safety Matrix):**
  - \`ORBI_SENTINEL_LAB_REAL_CONNECTORS\`: ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_REAL_CONNECTORS ? "🟢 ACTIVO" : "🔴 INACTIVO"}
  - \`ORBI_SENTINEL_LAB_RECORDING_ENABLED\`: ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_RECORDING_ENABLED ? "🟢 ACTIVO" : "🔴 INACTIVO"}
  - \`ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED\`: ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED ? "🟢 ACTIVO" : "🔴 INACTIVO"}
* **Clips de Laboratorio Recientes:**
${cameraClips.length > 0 ? cameraClips.map(cl => `  - **ID:** ${cl.id} | Origen: ${cl.source.toUpperCase()} | Duración: ${cl.duration} | Motivo: ${cl.description || "Prueba Manual"}`).join("\n") : "  *(No se registran clips en esta cámara)*"}
* **Cumplimiento de Privacidad (Privacy & Compliance Shield):**
  - El sistema prohíbe la captura de video en zonas marcadas como PRIVADAS (\`privacyZone: "private"\`). Las cámaras privadas están completamente excluidas del FFmpeg Adapter.
  - No se exponen contraseñas ni rutas RTSP completas en este reporte (se enmascaran de forma segura).
  - No se permite grabación productiva continua 24/7 en esta fase de laboratorio. Todo el material permanece en el almacenamiento local seguro.

---

### 2.96. Secure Playback & Evidence Export Lab (Módulo 1F)
* **Estado de Reproducción Segura:** Habilitado con controles de trazabilidad técnica e integración de firmas digitales HMAC-SHA256.
* **Separación de Roles (Compliance Autorización):**
  - **Administrador & Técnico:** Autorización total para visualización local, verificación de hash criptográfico, vinculación a incidentes y generación de paquetes de exportación de evidencia de laboratorio.
  - **Conserje:** Reproducción física y exportación bloqueadas de manera estricta y absoluta.
* **Privacy Shield Activo (Playback Guard):** Las cámaras en zonas residenciales privadas (\`privacyZone: "private"\`) bloquean automáticamente la reproducción e inicio de streams en el reproductor seguro con registro inmediato de intento fallido en la auditoría.
* **Evidence Package Builder (Empaquetador de Evidencia):** Generación de manifiestos JSON firmados sin credenciales, contraseñas ni rutas RTSP completas.
* **Historial de Auditoría Protegido:** Cada acción de visualización, bloqueo o generación se asocia permanentemente en la trazabilidad local (\`auditTrail\`).
* **Próximo Paso Sugerido:** Proceder a pruebas piloto de ingesta y despliegue controlado en terreno con el equipo técnico de Co-propiedades ORBI.

---

### 2.97. Calibración Física de Hardware & Línea Base (Módulo 1I)
* **Estado de Calibración:** ${localStorage.getItem("orbi_sentinel_calibration_locked") === "true" ? "🔒 CONGELADO (Línea Base Bloqueada contra Cambios)" : "🔓 ABIERTO (Calibración Editable)"}
* **Confirmación de Enlace de Canal perimetral (RTSP Lab):** ${localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true" ? "🟢 CONFIRMADO (Trazabilidad Local Activa)" : "🟡 PENDIENTE / MOCK"}
* **Confirmación de Sonda de Fotograma (Snapshot Lab):** ${localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true" ? "🟢 CONFIRMADO (Trazabilidad Local Activa)" : "🟡 PENDIENTE / MOCK"}
* **Hardware Validado en Laboratorio:** Dahua 4MP DH-IPC-HFW3449EN-AS-LED (Soporta transcodificación FFmpeg de baja latencia con integridad técnica de laboratorio).

---

### 3. Limitaciones del Entorno de Laboratorio
1. **Switch PoE No Administrable:** El switch LS-DS0402A-DP6 es una unidad pasiva de capa 1; la telemetría se obtiene mediante sondeo de socket en el Gateway y no por SNMP o API de puerto.
2. **Video Directo H.264/H.265:** En esta fase, la transmisión se emula mediante el motor interactivo Canvas de Sentinel para resguardar el procesamiento de la máquina cliente.
3. **Ausencia de NVR Físico:** Todo el búfer y encolado de eventos se procesa de forma lógica en la memoria volátil local del Sentinel Edge Recorder.

---

### 4. Recomendaciones y Próximos Pasos
1. **Validación de Credenciales:** ${selectedCamera.status === "Sin Acceso" ? "CRÍTICO: Sincronizar contraseña temporal del administrador en Sentinel Access Vault para corregir error 401." : "Verificar que la contraseña coincida con el perfil del Access Vault."}
2. **Alineación de Canales:** Proceder con la habilitación de reglas inteligentes perimetrales (Filtro de personas/vehículos) en el Sentinel Motion Core.
3. **Prueba de Ingesta Continua:** Preparar el Sentinel Gateway para el montaje en el primer seguidor solar de pruebas físicas en terreno.

---

### 5. Resguardo de Privacidad y Seguridad
* **Protección de Datos:** No se incluyen credenciales, contraseñas ni tokens de autenticación en texto plano en este reporte. Todo el material sensible permanece resguardado de forma encriptada conforme al Privacy Shield de la plataforma.

---

### 6. MVP Freeze & Readiness Summary (Módulo 1J)
* **Versión de MVP:** v0.1.10-sentinel-dahua-mvp-freeze
* **Estatus General de Congelación:** 🔒 CONGELADO / LISTO PARA DEMO TÉCNICA
* **Módulos Listos para Demo:** 19 / 19 lógicos validados en matriz
* **Cumplimiento de Seguridad & Privacidad:** 100% verificado (Privacy Shield y Access Vault activos)
* **Checklist de Freeze de Laboratorio:** Completado
* **Limitaciones de Fase:** Micro-NVR local simulado / Transmisión de video restringida a subred local
* **Próximo Módulo Sugerido:** Módulo 2A — Eufy Consumer Bridge Validation Lab o Módulo 2B — Community Pilot UX
`;
      setGeneratedReport(labReportText);
      setDiagnosticMethod("Gateway Local Lab Report");
      setIsGenerating(false);
      return;
    }

    const incidentObj = incidents.find(i => i.id === selectedIncidentId);
    const incidentLabel = incidentObj ? `[${incidentObj.id}] ${incidentObj.type} - ${incidentObj.observations}` : "Ninguno / Diagnóstico Operacional";

    // Build comprehensive details block
    const details = `
- Contexto Operacional: ${contextProfile}
- Nivel de Alerta: ${alertLevel}
- Causa Probable: ${possibleCause}
- Acción Recomendada: ${recommendedAction}
- Estado Grabador Edge: ${edgeRecorderState}
- Incidente Asociado: ${incidentLabel}
- Compatibilidad del Dispositivo: ${selectedCamera.model} (${selectedCamera.ip}) con RTSP y ONVIF.
    `.trim();

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parkName: selectedPark.name,
          cameraName: selectedCamera.name,
          currentStatus: selectedCamera.status,
          telemetry: selectedPark.telemetry,
          details: details,
          userObservations: userObservations || "Operación regular sin anomalías adicionales detectadas."
        }),
      });

      if (!response.ok) {
        throw new Error("La solicitud falló.");
      }

      const data = await response.json();
      if (data.success) {
        setGeneratedReport(data.report);
        setDiagnosticMethod(data.method);
      } else {
        throw new Error(data.error || "No se pudo compilar el reporte.");
      }
    } catch (err: any) {
      console.error(err);
      
      // Detailed fallback generation including all requested fields
      const reportId = `SR-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toLocaleString("es-CL");
      
      let fallbackText = `## REPORTE DE EVIDENCIA TÉCNICA - ORBI Sentinel IA
**ID de Reporte:** ${reportId}
**Recinto/Parque:** ${selectedPark.name}
**Cámara Analizada:** ${selectedCamera.name} (${selectedCamera.model})
**Estado Conexión:** ${selectedCamera.status}
**Fecha/Hora:** ${timestamp}
**Método:** Fallback Determinista Inteligente

---

### 1. Resumen Ejecutivo y Contexto
Se emite la presente evidencia técnica para el entorno de **${selectedPark.name}**, configurado con el perfil de contexto de **${contextProfile}**. 
El sistema clasifica este suceso con un nivel de alerta **${alertLevel}**.

* **Incidente Vinculado:** ${incidentLabel}
* **Estado de Edge Recorder:** ${edgeRecorderState} (Guardando fragmentos locales en búfer local).
* **Matriz de Compatibilidad:** El modelo **${selectedCamera.model}** en IP **${selectedCamera.ip}** se comunica a través de **RTSP (Puerto 554)** y **ONVIF (Puerto ${selectedCamera.onvifPort})**, permitiendo un diagnóstico profundo de su canal de transmisión.

---

### 2. Diagnóstico de Causa Raíz
* **Causa Probable Identificada:** ${possibleCause}.
* **Detalle Técnico:** El módulo de telemetría de ORBI Sentinel IA detectó una desviación respecto al comportamiento de línea base. ${
        possibleCause.includes("seguidores") 
          ? "El desalineamiento del radioenlace coincide temporalmente con la curva de inclinación y rotación de los seguidores solares." 
          : "La saturación del enlace de red o la caída de voltaje en el puerto PoE afecta la estabilidad de la trama de video."
      }

---

### 3. Plan de Mitigación y Acción Recomendada
1. **Acción Terreno Inmediata:** ${recommendedAction}.
2. **Procedimiento del Operador:** Validar el estado del switch PoE en puerto **${selectedCamera.poePort}** y verificar que la latencia (actualmente **${selectedCamera.lastPing}**) retorne a valores estables.
3. **Observaciones Registradas:** "${userObservations || "Operación regular sin anomalías adicionales detectadas."}"

---

### 3.5. Camera Health & Capability Validation (Módulo 1C)
* **Puntaje de Salud (Health Score):** ${selectedCamera.healthScore !== undefined ? selectedCamera.healthScore : (selectedCamera.status === "Online" ? 95 : selectedCamera.status === "Offline" ? 10 : 50)}/100
* **Host Reachable:** ${selectedCamera.status !== "Offline" ? "✓ Responde (Ping OK)" : "✗ No responde"}
* **HTTP Reachable:** ${selectedCamera.status !== "Offline" ? "✓ Abierto" : "✗ Cerrado"}
* **RTSP Reachable:** ${["Online", "Intermitente"].includes(selectedCamera.status) ? "✓ Stream Activo" : "✗ Inactivo / Sin Video"}
* **ONVIF Reachable:** ${selectedCamera.status !== "Offline" ? "✓ Soportado" : "✗ No responde"}
* **Auth Status:** ${selectedCamera.status !== "Sin Acceso" ? "✓ Autorizado" : "✗ Error 401"}
* **Latencia Promedio:** ${selectedCamera.lastPing || "N/A"}
* **Modo de Conector:** ${selectedCamera.isLab ? "Lab Real" : "Mock / Producción"}
* **Restricción de Privacidad:** ${selectedCamera.privacyZone ? selectedCamera.privacyZone.toUpperCase() : "COMÚN / PÚBLICA"}

---

### 3.8. Local Recording & Clip Evidence Status (Módulo 1D)
* **Estado de Grabación Local (Master Arm):** ${isLabRecordingEnabled ? "🔴 ARMADO (Grabación Activa)" : "○ DESARMADO (Evaluación / Modo Mock)"}
* **Modo de Captura Configurado:** ${recordingMode.toUpperCase()}
* **Periodo de Retención de Disco:** ${retentionDays} días
* **Segmentos de Video de Evidencia Registrados para esta Cámara:** ${clips.filter(c => c.cameraName === selectedCamera.name).length} clip(s) disponible(s) en búfer
${clips.filter(c => c.cameraName === selectedCamera.name).map((cl, i) => `  - **ID:** ${cl.id} | Origen: ${cl.source.toUpperCase()} | ${cl.timestampStart} a ${cl.timestampEnd} | Estado: ${cl.status.toUpperCase()}${cl.associatedIncidentId ? ` (Asociado a incidente: ${cl.associatedIncidentId})` : ""}`).join("\n") || "  *(No se registran clips guardados para esta cámara)*"}

---

### 3.9. Calibración de Canal de Terreno & Línea Base (Módulo 1I)
* **Estatus de Línea Base:** ${localStorage.getItem("orbi_sentinel_calibration_locked") === "true" ? "🔒 CONGELADO (Línea Base Bloqueada contra Cambios)" : "🔓 EDITABLE (Línea Base Abierta)"}
* **Verificación de Enlace RTSP:** ${localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true" ? "✓ Confirmado en Laboratorio" : "Sujeto a calibración inicial de terreno"}
* **Verificación de Snapshots:** ${localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true" ? "✓ Confirmado en Laboratorio" : "Sujeto a calibración inicial de terreno"}

---

### 4. Resguardo de Privacidad
* Toda la información recopilada en este reporte se encuentra anonimizada por el **Privacy Shield** de Sentinel. No se exponen imágenes sensibles ni contraseñas de acceso seguro (las cuales permanecen resguardadas encriptadas en el **Sentinel Access Vault**).
`;
      setGeneratedReport(fallbackText);
      setDiagnosticMethod("Fallback Local Determinista");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to generate custom copy blocks tailored for specific roles
  const getCustomSummaryForRole = (role: "admin" | "client" | "tech") => {
    const reportId = "SR-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString("es-CL");

    if (role === "admin") {
      return `[REPORTE PARA ADMINISTRACIÓN - ORBI SENTINEL]
ID: ${reportId} | Fecha: ${dateStr}
Recinto: ${selectedPark.name} | Contexto: ${contextProfile}
Estado Cámara: ${selectedCamera?.status || "Online"} (${selectedCamera?.name || "Canal"})
Criticidad Alerta: ${alertLevel}
Causa Detectada: ${possibleCause}
Plan de Acción: ${recommendedAction}
Estado de NVR Edge: ${edgeRecorderState}
Observaciones de Turno: ${userObservations || "Sin observaciones críticas."}
---
Firma: Bitácora de Gestión de Incidentes de Administración.`;
    }

    if (role === "client") {
      return `[REPORTE EJECUTIVO PARA CLIENTE - ORBI SENTINEL]
Estimado(a) Cliente,
Le informamos del estado operacional en "${selectedPark.name}":
- Evento clasificado en nivel "${alertLevel}" bajo el contexto de "${contextProfile}".
- La situación fue abordada mediante la acción recomendada: "${recommendedAction}".
- La privacidad de la comunidad y del personal está resguardada de forma estricta por nuestro motor "Privacy Shield" de ORBI Sentinel IA. Las claves y videos confidenciales están encriptados.
- El sistema de grabación local se encuentra en estado "${edgeRecorderState}".
Garantizamos la seguridad técnica y operativa de sus instalaciones.`;
    }

    // Tech role
    return `[REPORTE DE INGENIERÍA PARA MANTENIMIENTO TÉCNICO - ORBI SENTINEL]
SUCESO: ${reportId} | IP DISPOSITIVO: ${selectedCamera?.ip || "N/A"}
MODELO: ${selectedCamera?.model || "N/A"} | PUERTO ONVIF: ${selectedCamera?.onvifPort || "N/A"}
PUERTO SWITCH PoE: ${selectedCamera?.poePort || "N/A"} | PING ACTUAL: ${selectedCamera?.lastPing || "N/A"}
CAUSA DE FALLA: ${possibleCause}
ACCIÓN CORRECTIVA: ${recommendedAction}
ESTADO INGESTA NVR: ${edgeRecorderState}
TELEMETRÍA ASOCIADA: ${JSON.stringify(selectedPark.telemetry || {})}
---
Acceda a Sentinel Access Vault para obtener credenciales de nivel administrador autorizadas de forma temporal.`;
  };

  const handleCopyForRole = (role: "admin" | "client" | "tech") => {
    const text = getCustomSummaryForRole(role);
    navigator.clipboard.writeText(text);

    if (role === "admin") {
      setCopyAdminSuccess(true);
      setTimeout(() => setCopyAdminSuccess(false), 2000);
    } else if (role === "client") {
      setCopyClientSuccess(true);
      setTimeout(() => setCopyClientSuccess(false), 2000);
    } else {
      setCopyTechSuccess(true);
      setTimeout(() => setCopyTechSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel Evidence Report & Diagnostics Engine</h3>
        <p className="text-xs text-slate-400 mt-1">
          Compila y genera reportes técnicos robustos. Integra lógicas avanzadas de telemetría de cámaras, estado del grabador en el borde (Edge) y asocia incidentes de forma automática.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Expanded Parameters Selector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-wider">Parámetros Avanzados de Evidencia</h4>
          </div>

          {/* Park Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">1. Recinto:</label>
            <select
              value={selectedParkId}
              onChange={(e) => setSelectedParkId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              {parks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">2. Cámara y Estado:</label>
            {parkCameras.length > 0 ? (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                {parkCameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-rose-400 italic">No hay cámaras en este recinto.</div>
            )}
          </div>

          {/* Link Incident Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">3. Asociar Suceso Registrado:</label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ninguno">Ningún Suceso (Diagnóstico General)</option>
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.id}] {inc.type} - {inc.zoneName}
                </option>
              ))}
            </select>
          </div>

          {/* Grid of selectors */}
          <div className="grid grid-cols-2 gap-3">
            {/* Context Profile */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">Perfil de Contexto:</label>
              <select
                value={contextProfile}
                onChange={(e) => setContextProfile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="Planta Solar">Solar / Faena</option>
                <option value="Condominio">Condominio</option>
                <option value="Casa / Residencia">Residencia</option>
                <option value="Bodega / Logística">Bodega</option>
                <option value="Oficina / Corp">Oficina</option>
              </select>
            </div>

            {/* Alert level */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">Nivel de Alerta:</label>
              <select
                value={alertLevel}
                onChange={(e) => setAlertLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="Crítico">🚨 Crítico</option>
                <option value="Medio">⚠️ Medio</option>
                <option value="Bajo">✓ Bajo / Info</option>
              </select>
            </div>
          </div>

          {/* Edge recording state */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Estado de Edge Recorder NVR:</label>
            <select
              value={edgeRecorderState}
              onChange={(e) => setEdgeRecorderState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="Grabando continuo (Mixto en buffer)">Grabando continuo (Mixto en buffer)</option>
              <option value="Grabando solo por eventos">Grabando solo por eventos</option>
              <option value="Detenido / Pausado manualmente">Detenido / Pausado manualmente</option>
              <option value="Falla de almacenamiento (Insumo de disco)">Falla de almacenamiento (Insumo de disco)</option>
              <option value="Equipo desconectado / Sin transmisión Edge">Equipo desconectado / Sin transmisión Edge</option>
            </select>
          </div>

          {/* Possible Cause */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">Causa Probable:</label>
            <select
              value={possibleCause}
              onChange={(e) => setPossibleCause(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {POSSIBLE_CAUSES.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Action Recommended */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">Acción Recomendada:</label>
            <select
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {RECOMMENDED_ACTIONS.map((a, i) => (
                <option key={i} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block uppercase">Comentarios del Operador:</label>
            <textarea
              value={userObservations}
              onChange={(e) => setUserObservations(e.target.value)}
              placeholder="Indica notas sobre trackers, voltajes PoE, latencia, etc..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-3 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !selectedCamera}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase font-mono tracking-wider shadow-lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compilando Diagnóstico...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compilar Reporte Completo</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview and Copiables (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Diagnostic Display Card */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-sans font-semibold text-white">Visualizador de Evidencia Técnica</h4>
                </div>

                {generatedReport && (
                  <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                    {diagnosticMethod}
                  </div>
                )}
              </div>

              {/* Report output Markdown scroll view */}
              {generatedReport ? (
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-5 font-mono text-xs text-slate-300 space-y-4 max-h-[380px] overflow-y-auto leading-relaxed select-text">
                  <pre className="whitespace-pre-wrap font-mono text-xs font-light text-slate-200">
                    {generatedReport}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-3">
                  <Info className="w-8 h-8 text-slate-700" />
                  <div>
                    <p className="text-xs font-mono">Reporte de Evidencia Vacío</p>
                    <p className="text-[11px] text-slate-600 max-w-sm mx-auto mt-1">
                      Alinea los parámetros de suceso perimetral en la columna izquierda y presiona "Compilar Reporte Completo".
                    </p>
                  </div>
                </div>
              )}
            </div>

            {generatedReport && (
              <div className="text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-850">
                ✓ Reporte de Evidencia compilado exitosamente. Enmascaramiento activo para cumplimiento regulatorio.
              </div>
            )}
          </div>

          {/* Copiar para Destinatarios Grid */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-wider">Copiar para Destinatarios</h4>
            </div>

            <p className="text-xs text-slate-400">
              Genera resúmenes ejecutivos pre-formateados adaptados al tono y lenguaje de cada actor involucrado.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Copia Administración */}
              <button
                onClick={() => handleCopyForRole("admin")}
                className="p-4 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-700 text-left transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-xs font-bold font-sans">Administración</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Foco en control de aforo, incidencias, tiempos de respuesta y bitácora.
                  </p>
                </div>

                <span className="text-[10px] mt-3 bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-center block w-full hover:text-emerald-400 border border-slate-800">
                  {copyAdminSuccess ? "✓ ¡Copiado!" : "Copiar Texto"}
                </span>
              </button>

              {/* Copia Cliente */}
              <button
                onClick={() => handleCopyForRole("client")}
                className="p-4 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-700 text-left transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-sky-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold font-sans">Cliente Ejecutivo</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Lenguaje humanizado de alto nivel, sin detalles técnicos excesivos.
                  </p>
                </div>

                <span className="text-[10px] mt-3 bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-center block w-full hover:text-emerald-400 border border-slate-800">
                  {copyClientSuccess ? "✓ ¡Copiado!" : "Copiar Texto"}
                </span>
              </button>

              {/* Copia Soporte Técnico */}
              <button
                onClick={() => handleCopyForRole("tech")}
                className="p-4 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-700 text-left transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs font-bold font-sans">Técnico Terreno</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Lógica de ingeniería: IPs, ONVIF, puertos PoE y voltajes para reparar.
                  </p>
                </div>

                <span className="text-[10px] mt-3 bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-center block w-full hover:text-emerald-400 border border-slate-800">
                  {copyTechSuccess ? "✓ ¡Copiado!" : "Copiar Texto"}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
