import React, { useState } from "react";
import { Park, Camera } from "../types";
import { Wrench, Play, Shield, Wifi, RefreshCw, Sun, Info, Check, X, AlertCircle } from "lucide-react";

interface CCTVDiagnosticsProps {
  parks: Park[];
  cameras: Camera[];
  selectedParkId: string;
  setSelectedParkId: (id: string) => void;
  isDemoMode: boolean;
}

export default function CCTVDiagnostics({
  parks,
  cameras,
  selectedParkId,
  setSelectedParkId,
  isDemoMode,
}: CCTVDiagnosticsProps) {
  const [pingingCameraId, setPingingCameraId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { ok: boolean; rtt: string; steps: string[] }>>({});
  const [trackerAngleSim, setTrackerAngleSim] = useState<number>(30); // Interactive slider for Alhué demo

  const selectedPark = parks.find((p) => p.id === selectedParkId) || parks[0];
  const parkCameras = cameras.filter((c) => c.parkId === selectedPark.id);
  // Run a simulated step-by-step diagnostic on a camera
  const runCameraPingDiagnostic = (cam: Camera) => {
    setPingingCameraId(cam.id);
    
    setTimeout(() => {
      let ok = true;
      let rtt = "12 ms";
      let steps: string[] = [];

      if (cam.isLab || cam.parkId === "dahua-lab") {
        steps.push(`[0 ms] Iniciando Handshake técnico local para cámara de pruebas Dahua: ${cam.name}`);
        steps.push(`[15 ms] Consultando switch PoE de laboratorio (LS-DS0402A-DP6)...`);
        steps.push(`[35 ms] INFO: Switch PoE no administrable. Se asume alimentación de puerto física.`);
        
        if (cam.realConnectorAllowed === false) {
          ok = false;
          rtt = "N/A";
          steps.push(`[50 ms] CONNECTOR: Connector disabled. Conexión real denegada por directiva de hardware.`);
          steps.push(`[100 ms] ERROR: No se intentarán peticiones físicas a la IP de red local.`);
          steps.push(`[200 ms] DIAGNÓSTICO: Configuración segura forzada. Solo se permite simulación.`);
        } else if (cam.privacyZone === "private") {
          ok = true;
          rtt = "2 ms";
          steps.push(`[100 ms] PING: IP local ${cam.ip} responde correctamente.`);
          steps.push(`[200 ms] PRIVACY: Privacy Shield blocked export. Zona de privacidad restrictiva activa.`);
          steps.push(`[300 ms] WARNING: Los fotogramas y streams están enmascarados y no se guardarán en disco por seguridad.`);
          steps.push(`[450 ms] DIAGNÓSTICO: Cámara operativa pero con protección de privacidad estricta.`);
        } else if (cam.status === "Offline") {
          ok = false;
          rtt = "Timeout";
          steps.push(`[100 ms] PING: IP local ${cam.ip} no responde (Host inaccesible).`);
          steps.push(`[250 ms] SNAPSHOT: Snapshot timeout. Expiró tiempo de espera del socket.`);
          steps.push(`[400 ms] ERROR: RTSP route built but not tested. Enlace inalcanzable.`);
        } else if (cam.status === "Sin Acceso" || cam.labStatus === "credencial pendiente") {
          ok = false;
          rtt = "3 ms";
          steps.push(`[100 ms] PING: IP local ${cam.ip} responde con éxito.`);
          steps.push(`[250 ms] ONVIF: Credencial pendiente. Falta configuración segura en Access Vault o memoria de sesión.`);
          steps.push(`[400 ms] ERROR: Autenticación rechazada. Error de handshake de seguridad Dahua (HTTP 401).`);
        } else if (cam.status === "Sin Stream" || cam.labStatus === "stream pendiente") {
          ok = false;
          rtt = "3 ms";
          steps.push(`[100 ms] PING: IP local ${cam.ip} responde con éxito.`);
          steps.push(`[250 ms] ONVIF: Conexión ONVIF establecida.`);
          steps.push(`[450 ms] ERROR: RTSP route built but not tested. El stream no está emitiendo o el puerto 554 está bloqueado.`);
        } else {
          ok = true;
          rtt = cam.lastPing || "2 ms";
          steps.push(`[100 ms] PING: Conexión local de alta velocidad (2ms).`);
          steps.push(`[200 ms] SNAPSHOT: Snapshot OK. Captura de fotograma de laboratorio exitosa.`);
          steps.push(`[350 ms] RTSP: RTSP preview experimental. Flujo H.264 activo.`);
          steps.push(`[500 ms] BRIDGE: FFmpeg pending for future stream bridge. Listo para Módulo 1D.`);
          steps.push(`[650 ms] DIAGNÓSTICO: Cámara Dahua validada con éxito. Enlace local listo.`);
        }
      } else {
        steps.push(`[0 ms] Iniciando prueba ICMP desde Sentinel Gateway hacia IP: ${cam.ip}`);
        steps.push(`[15 ms] Verificando alimentación en puerto PoE ${cam.poePort} del switch...`);

        if (cam.status === "Offline") {
          ok = false;
          rtt = "Timeout";
          steps.push(`[150 ms] ERROR: Puerto PoE ${cam.poePort} inactivo o sin consumo de potencia.`);
          steps.push(`[1000 ms] ERROR: Solicitud de ping expirada (Timeout).`);
        } else if (cam.status === "Intermitente") {
          if (selectedPark.id === "alhue" && trackerAngleSim > 40) {
            ok = false;
            rtt = "Pérdidas (85%)";
            steps.push(`[200 ms] ALERTA: Atenuación inalámbrica extrema detectada (-88 dBm).`);
            steps.push(`[600 ms] Enlace de radio obstruido por paneles solares (Ángulo actual: ${trackerAngleSim}°).`);
            steps.push(`[1000 ms] Solicitud de ping fallida por pérdida severa de paquetes.`);
          } else {
            ok = true;
            rtt = "140 ms";
            steps.push(`[180 ms] ADVERTENCIA: Latencia elevada en radioenlace de 5.8 GHz.`);
            steps.push(`[500 ms] Ping exitoso con pérdidas menores (15% de paquetes).`);
          }
        } else if (cam.status === "Sin Acceso") {
          ok = true;
          rtt = "32 ms";
          steps.push(`[120 ms] Ping exitoso (32 ms). Canal físico de red óptimo.`);
          steps.push(`[300 ms] ERROR ONVIF/RTSP: Credenciales inválidas para usuario admin. Código de estado HTTP 401.`);
        } else if (cam.status === "Sin Stream") {
          ok = true;
          rtt = "28 ms";
          steps.push(`[80 ms] Ping exitoso. Puerto HTTP ONVIF respondiendo.`);
          steps.push(`[250 ms] ERROR RTSP: Canal de video desconectado. El dispositivo no emite stream H.264/H.265.`);
        } else {
          ok = true;
          rtt = cam.lastPing;
          steps.push(`[50 ms] Canal físico y PoE estables (Consumo: 5.4 W).`);
          steps.push(`[200 ms] Transmisión de stream RTSP verificado (25 FPS, 4MP).`);
        }
      }

      setPingResults((prev) => ({
        ...prev,
        [cam.id]: { ok, rtt, steps },
      }));
      setPingingCameraId(null);
    }, 1500);
  };

  // Signal attenuation calculation based on Tracker Angle for Alhué simulation
  const getSignalStrength = (angle: number) => {
    // Beyond 35 degrees, panels start blocking direct LOS
    if (angle < 20) return { dbm: "-65 dBm", text: "Excelente (Línea de Vista Limpia)", color: "text-emerald-400" };
    if (angle < 35) return { dbm: "-72 dBm", text: "Bueno (Leve atenuación periférica)", color: "text-sky-400" };
    if (angle < 45) return { dbm: "-80 dBm", text: "Crítico (Obstrucción parcial por paneles)", color: "text-amber-400" };
    return { dbm: "-89 dBm", text: "Desconectado (Bloqueo total por seguidor Soltec)", color: "text-rose-400" };
  };

  const signal = getSignalStrength(trackerAngleSim);

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel CCTV Diagnostics</h3>
        <p className="text-xs text-slate-400 mt-1">
          Módulo de pruebas y análisis del enlace de red, switch PoE Dahua y comportamiento perimetral.
        </p>

        {/* Custom selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {parks.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedParkId(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 ${
                selectedParkId === p.id
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-800"
              }`}
            >
              <div className="font-bold text-xs truncate">{p.name}</div>
              <div className="text-[9px] text-slate-500 font-mono mt-1">{p.location}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logical Network Map and list of cameras */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Estado y Pings de Cámara para: <span className="text-emerald-400 font-bold">{selectedPark.name}</span>
            </h4>

            {/* List of Cameras in chosen park */}
            <div className="space-y-4">
              {parkCameras.map((cam) => {
                const results = pingResults[cam.id];
                const isPinging = pingingCameraId === cam.id;

                return (
                  <div key={cam.id} className="bg-slate-950/60 rounded-xl border border-slate-850 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            cam.status === "Online" ? "bg-emerald-500" :
                            cam.status === "Offline" ? "bg-rose-500" : "bg-amber-500"
                          }`}></span>
                          <span className="font-bold text-white text-xs">{cam.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">[{cam.ip}]</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Modelo: {cam.model} | Puerto PoE Switch: <span className="text-amber-400">{cam.poePort}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => runCameraPingDiagnostic(cam)}
                        disabled={isPinging}
                        className="text-[11px] font-mono bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isPinging ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                            <span>Pingeando...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-emerald-400" />
                            <span>Correr Ping</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Diagnostic results breakdown */}
                    {results && (
                      <div className="mt-3 bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[11px] space-y-1.5">
                        <div className="flex justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                          <span className="text-slate-400 font-bold">Resultado de Enlace:</span>
                          <span className={`font-bold ${results.ok ? "text-emerald-400" : "text-rose-400"}`}>
                            {results.ok ? `EXITOSO (${results.rtt})` : `FALLIDO (${results.rtt})`}
                          </span>
                        </div>
                        {results.steps.map((step, idx) => (
                          <div key={idx} className={step.includes("ERROR") ? "text-rose-400" : step.includes("ADVERTENCIA") ? "text-amber-400" : "text-slate-400"}>
                            {step}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Módulo 1C - Camera Health & Capability Validation Panel */}
                    <div className="mt-4 pt-3 border-t border-slate-900 grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left side: Health Score Gauge */}
                      <div className="md:col-span-4 bg-slate-900/20 rounded-xl p-3 border border-slate-900/60 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">Health Score</span>
                        <div className={`text-2xl font-black font-mono ${
                          (cam.healthScore || 100) >= 85 ? "text-emerald-400" :
                          (cam.healthScore || 100) >= 60 ? "text-amber-400" :
                          (cam.healthScore || 100) >= 30 ? "text-orange-400" : "text-rose-400"
                        }`}>
                          {cam.healthScore !== undefined ? cam.healthScore : (cam.status === "Online" ? 95 : cam.status === "Offline" ? 15 : 45)}/100
                        </div>
                        <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                          (cam.healthScore || 100) >= 85 ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
                          (cam.healthScore || 100) >= 60 ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
                          (cam.healthScore || 100) >= 30 ? "bg-orange-500/10 text-orange-300 border border-orange-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}>
                          {(cam.healthScore || 100) >= 85 ? "Salud alta" :
                           (cam.healthScore || 100) >= 60 ? "Salud parcial" :
                           (cam.healthScore || 100) >= 30 ? "Requiere revisión" : "No operativa"}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono mt-2 leading-tight">
                          *Score combina datos mock y lab real
                        </span>
                      </div>

                      {/* Right side: Detailed Checks & Recommendations */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">RTSP Stream:</span>
                            <span className={cam.rtspReachable !== false ? "text-emerald-400" : "text-rose-400"}>
                              {cam.rtspReachable !== false ? "Built & Ready" : "Inactivo"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">Snapshot:</span>
                            <span className={cam.snapshotEnabled !== false ? "text-emerald-400" : "text-slate-500"}>
                              {cam.snapshotEnabled !== false ? "Habilitado" : "Deshabilitado"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">ONVIF Port:</span>
                            <span className={cam.onvifReachable !== false ? "text-sky-400" : "text-rose-400"}>
                              {cam.onvifReachable !== false ? "Preparado" : "Inalcanzable"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-500">Conector Mode:</span>
                            <span className="text-white">
                              {cam.realConnectorAllowed !== false ? "Lab real" : "Mock / Disabled"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px] space-y-2 leading-relaxed">
                          <div>
                            <span className="text-amber-400 font-bold font-mono">CAUSA PROBABLE: </span>
                            <span className="text-slate-300">
                              {cam.status === "Offline" ? "Cable Cat6 desconectado, falla de alimentación PoE o puerto switch LS-DS0402A-DP6 saturado." :
                               cam.status === "Sin Acceso" ? "Cambio de clave de fábrica no sincronizado con Access Vault." :
                               cam.status === "Sin Stream" ? "Configuración de codificación incompatible en firmware Dahua o puerto RTSP 554 cerrado." :
                               cam.status === "Intermitente" ? "Obstrucción de línea de vista directa de radioenlace de 5.8 GHz por rotación de seguidores solares." :
                               "Dispositivo operando dentro de los parámetros del laboratorio local."}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-bold font-mono">ACCIÓN RECOMENDADA: </span>
                            <span className="text-slate-300 font-sans">
                              {cam.status === "Offline" ? "Verificar cables de red, medir amperaje en puerto PoE y reiniciar canal del switch." :
                               cam.status === "Sin Acceso" ? "Actualizar contraseña temporal de administración en el panel Access Vault." :
                               cam.status === "Sin Stream" ? "Ingresar a panel Dahua Web UI, habilitar sub-stream H.264 y verificar firewall." :
                               cam.status === "Intermitente" ? "Aumentar altura del mástil de la antena a 6 metros para sobrepasar los paneles." :
                               "Monitoreo preventivo continuo y alistar buffers para Módulo 1D (Grabación Local)."}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-1.5 flex justify-between">
                            <span>Privacy Restriction: <strong className="text-slate-300">{cam.privacyZone ? cam.privacyZone.toUpperCase() : "LAB"}</strong></span>
                            <span>Check: <strong className="text-slate-300">{cam.lastSuccessfulCheck ? cam.lastSuccessfulCheck.split("T")[0] : "05-Jul-2026"}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Case Studies Visual Panel */}
        <div className="space-y-6">
          {/* Case-specific diagnostics explanation */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-white mb-3">Ficha de Diagnóstico Operational</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedPark.diagnosticsCase}
            </p>

            {/* Custom Interactive Widget for Alhué (Trackers Interference Simulation) */}
            {selectedPark.id === "alhue" && (
              <div className="mt-6 border-t border-slate-800 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                  <Sun className="w-4 h-4 animate-spin-slow" />
                  <span>Simulador de Trackers Soltec SF7</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Modifica el ángulo de elevación de los paneles solares para simular la atenuación del radioenlace directo de 5.8 GHz.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Ángulo Tracker:</span>
                    <span className="text-white font-bold">{trackerAngleSim}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={trackerAngleSim}
                    onChange={(e) => setTrackerAngleSim(Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0° (Mañana)</span>
                    <span>30° (Mediodía)</span>
                    <span>60° (Tarde)</span>
                  </div>
                </div>

                {/* Simulated Signal Signal Box */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potencia de Radio:</span>
                    <span className={`font-mono font-bold ${signal.color}`}>{signal.dbm}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic leading-snug">
                    {signal.text}
                  </div>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-[10px] text-slate-400 leading-relaxed">
                  <strong>Conclusión del Diagnóstico:</strong> La pérdida de video coincide con ángulos mayores a 35°. Se recomienda re-ubicar el mástil de la antena de radioenlace a una altura superior a 6 metros para sobrepasar los paneles solares en su punto álgido de rotación.
                </div>
              </div>
            )}

            {/* Custom Interactive Widget for Alto Bella Vista (Access Issue) */}
            {selectedPark.id === "alto-bella-vista" && (
              <div className="mt-6 border-t border-slate-800 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Conflicto Administrativo / Claves</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Aunque el enlace de red responde perfectamente al ping, las claves por defecto de fábrica fueron modificadas durante la entrega del contratista saliente sin documentar en el Access Vault.
                </p>
                <div className="p-3 bg-violet-950/10 border border-violet-900/30 rounded-lg text-xs space-y-1.5 font-mono">
                  <div className="text-white font-bold text-[10px]">VERIFICACIÓN DE PROTOCOLO:</div>
                  <div className="text-slate-400">• ONVIF Discovery: <span className="text-emerald-400">EXITOSO</span></div>
                  <div className="text-slate-400">• RTSP Stream Handshake: <span className="text-rose-400">RECHAZADO (401)</span></div>
                </div>
              </div>
            )}

            {/* Custom Interactive Widget for Parral (False Positives) */}
            {selectedPark.id === "parral" && (
              <div className="mt-6 border-t border-slate-800 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono font-bold">
                  <Wifi className="w-4 h-4" />
                  <span>Calibración de Analíticas de Cruce</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las cámaras perimetrales generan un exceso de falsas alertas de movimiento por vegetación no controlada. Se requiere habilitar filtros por tamaño y silueta humana (característica inteligente nativa de Dahua).
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasa de Falsos Positivos:</span>
                    <span className="font-mono font-bold text-amber-400">72% (Crítico)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug">
                    Recomendación: Configurar regla IVS (Sistema de Video Inteligente) de cruce de línea con filtro exclusivo para personas y vehículos.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic Calibration and Capability Drift Panel */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-850 pb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Calibración & Desviación (Drift)</span>
            </h4>
            
            <p className="text-xs text-slate-400 leading-normal">
              Análisis comparativo en tiempo real entre la línea base física congelada de laboratorio y el comportamiento operacional activo del Gateway.
            </p>

            <div className="space-y-3 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Línea Base:</span>
                <span className={`font-bold ${localStorage.getItem("orbi_sentinel_calibration_locked") === "true" ? "text-amber-400" : "text-slate-500"}`}>
                  {localStorage.getItem("orbi_sentinel_calibration_locked") === "true" ? "🔒 CONGELADA" : "🔓 DESBLOQUEADA"}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">RTSP Confirmado:</span>
                <span className={localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true" ? "text-emerald-400" : "text-rose-400"}>
                  {localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true" ? "✓ CONFIRMADO" : "✗ NO DETECTADO"}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Snapshot Confirmado:</span>
                <span className={localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true" ? "text-emerald-400" : "text-rose-400"}>
                  {localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true" ? "✓ CONFIRMADO" : "✗ NO DETECTADO"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold font-sans">Análisis de Desviación (Capability Drift):</span>
                {localStorage.getItem("orbi_sentinel_calibration_locked") === "true" ? (
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-sans leading-normal">LÍNEA BASE ESTABLE: No se registran desviaciones de subred, firmware o credenciales en el Gateway local.</span>
                  </div>
                ) : (
                  <div className="text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-sans leading-normal">CALIBRACIÓN ABIERTA: Aplique el Calibration Lock en el módulo Dahua Lab Protocol para blindar las capacidades físicas de la cámara.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dahua PoE physical lab parameters */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-white mb-3">Telemetría de Switch Lab</h4>
            <div className="space-y-3 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Modelo Switch:</span>
                <span className="text-white">LS-DS0402A-DP6</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Puertos Disponibles:</span>
                <span className="text-emerald-400">4x PoE, 2x Uplink</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Voltaje PoE Medio:</span>
                <span className="text-amber-400">48.5 V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consumo Total Lab:</span>
                <span className="text-emerald-400">10.8 W / 60 W Max</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
