import React, { useEffect, useState, useRef } from "react";
import { Camera, CameraStatus } from "../types";
import { Video, RefreshCw, Maximize2, Shield, Activity, Power, Tag, Lock, Unlock, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface LiveWallProps {
  cameras: Camera[];
  isDemoMode: boolean;
  userRole?: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled?: boolean;
  recordingMode?: string;
  onAddClip?: (clip: any) => void;
  setCurrentTab?: (tab: string) => void;
}

export default function LiveWall({
  cameras,
  isDemoMode,
  userRole = "admin",
  isLabRecordingEnabled = false,
  recordingMode = "Mixed mode: substream continuo + eventos destacados",
  onAddClip,
  setCurrentTab
}: LiveWallProps) {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [filterPark, setFilterPark] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Módulo 1E: FFmpeg and Safety Config State
  const [labConfig, setLabConfig] = useState<any>({
    realConnectorsEnabled: false,
    recordingEnabled: false,
    ffmpegAdapterEnabled: false,
    ffmpegDetected: false,
    ffmpegVersion: "N/A",
    writePermissionStatus: "pending",
    mode: "mock-simulated"
  });

  const [activeCaptureState, setActiveCaptureState] = useState<{
    cameraName: string;
    duration: number;
    timeLeft: number;
    active: boolean;
  } | null>(null);

  const countdownTimerRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/lab/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLabConfig(data);
        }
      })
      .catch((err) => console.error("Error fetching lab config inside LiveWall:", err));
  }, [refreshTrigger]);

  // Handle countdown simulation when clip is capturing
  useEffect(() => {
    if (activeCaptureState && activeCaptureState.active && activeCaptureState.timeLeft > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setActiveCaptureState((prev) => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            return null; // finished
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [activeCaptureState]);

  // Filtered list of cameras to display
  const filteredCameras = cameras.filter((cam) => {
    if (filterPark === "all") return true;
    return cam.parkId === filterPark;
  });

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || null;

  // Render role-appropriate banner
  const renderLabStatusBanner = () => {
    const allFlagsActive = labConfig.realConnectorsEnabled && labConfig.recordingEnabled && labConfig.ffmpegAdapterEnabled;
    const isRealEnabled = allFlagsActive && labConfig.ffmpegDetected;

    const getDahuaLabTestState = () => {
      const activeSessionSaved = localStorage.getItem("orbi_sentinel_dahua_active_test_session");
      if (activeSessionSaved) {
        try {
          const session = JSON.parse(activeSessionSaved);
          if (session.finalStatus === "Running") {
            return "Running";
          }
        } catch (e) {}
      }
      const pastSessionsSaved = localStorage.getItem("orbi_sentinel_dahua_past_sessions");
      if (pastSessionsSaved) {
        try {
          const past = JSON.parse(pastSessionsSaved);
          if (past.length > 0) {
            const latest = past[0];
            if (latest.finalStatus === "Passed") return "Validated";
            if (latest.finalStatus === "Partial") return "Partial";
            if (latest.finalStatus === "Failed") return "Failed";
          }
        } catch (e) {}
      }
      return "Pending";
    };

    const testState = getDahuaLabTestState();

    if (userRole === "conserje") {
      let statusText = "Grabación disponible";
      let statusDesc = "El sistema de seguridad está capturando eventos en el micro-NVR de laboratorio.";
      let statusColorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      let icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;

      if (testState === "Running") {
        statusText = "Prueba técnica en curso";
        statusDesc = "Se está realizando un protocolo guiado sobre los canales de video de laboratorio en este momento.";
        statusColorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse";
        icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      } else if (testState === "Partial" || testState === "Failed") {
        statusText = "Sistema en revisión técnica";
        statusDesc = "La última calibración técnica de laboratorio concluyó con observaciones o advertencias parciales de red.";
        statusColorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";
        icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
      } else if (!allFlagsActive) {
        statusText = "Grabación no disponible";
        statusDesc = "El modo de grabación local segura no ha sido activado por el personal de ingeniería.";
        statusColorClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";
        icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      } else if (!labConfig.ffmpegDetected) {
        statusText = "Requiere revisión técnica";
        statusDesc = "No se detectó el motor FFmpeg local en el Gateway. Contactar soporte.";
        statusColorClass = "bg-rose-500/10 border-rose-500/20 text-rose-400";
        icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      }

      return (
        <div className={`p-4 rounded-xl border ${statusColorClass} flex items-start gap-3 text-xs leading-relaxed transition-all`}>
          {icon}
          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px]">{statusText}</h5>
            <p className="text-slate-300 mt-1">{statusDesc}</p>
          </div>
        </div>
      );
    }

    // Technical / Admin Banner
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Sentinel FFmpeg Recording Lab Status
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase flex items-center gap-1 ${
              testState === "Running" ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse" :
              testState === "Validated" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
              testState === "Partial" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
              testState === "Failed" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" :
              "bg-slate-850 text-slate-500 border-slate-800"
            }`}>
              Test State: {
                testState === "Running" ? "Dahua Lab Test Running" :
                testState === "Validated" ? "Validated (Passed)" :
                testState === "Partial" ? "Partial" :
                testState === "Failed" ? "Failed" :
                "Pending"
              }
            </span>
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab("dahualabprotocol")}
                className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-all"
              >
                {testState === "Running" ? "IR AL PROTOCOLO" : "VER CONFIG"}
              </button>
            )}
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              isRealEnabled ? "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
            }`}>
              Modo Activo: {isRealEnabled ? "Real Lab Capture (FFmpeg)" : "Mock Fallback Active"}
            </span>
          </div>
        </div>

        {activeCaptureState && activeCaptureState.active && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-red-400 animate-pulse font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              🔴 CAPTURA CORRIENDO: {activeCaptureState.cameraName}
            </span>
            <span className="text-slate-300 font-bold">
              Tiempo restante: <span className="text-red-400 text-sm font-black">{activeCaptureState.timeLeft}s</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">FFmpeg Binary:</span>
            <span className={`font-bold flex items-center gap-1 ${labConfig.ffmpegDetected ? "text-emerald-400" : "text-rose-400"}`}>
              {labConfig.ffmpegDetected ? "✓ DETECTADO" : "✗ MISSING / MOCK"}
              {labConfig.ffmpegVersion !== "N/A" && <span className="text-slate-500 text-[9px]">({labConfig.ffmpegVersion})</span>}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Sandbox Disk Path:</span>
            <span className="font-bold text-slate-300 truncate block" title={labConfig.storagePath}>
              orbi-sentinel-lab-recordings/
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Write Permissions:</span>
            <span className={`font-bold uppercase ${
              labConfig.writePermissionStatus === "verified" ? "text-emerald-400" :
              labConfig.writePermissionStatus === "mock" ? "text-sky-400" : "text-amber-400"
            }`}>
              {labConfig.writePermissionStatus === "verified" ? "✓ VERIFIED" : labConfig.writePermissionStatus}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Safety Flags Matrix:</span>
            <div className="flex flex-wrap gap-1 text-[8px] font-bold mt-1">
              <span className={`px-1 rounded ${labConfig.realConnectorsEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                REAL_CONNS: {labConfig.realConnectorsEnabled ? "ON" : "OFF"}
              </span>
              <span className={`px-1 rounded ${labConfig.recordingEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                REC_ENABLED: {labConfig.recordingEnabled ? "ON" : "OFF"}
              </span>
              <span className={`px-1 rounded ${labConfig.ffmpegAdapterEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}`}>
                FFMPEG_ADAPT: {labConfig.ffmpegAdapterEnabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>

        {!allFlagsActive && (
          <p className="text-[10px] text-amber-400/80 italic font-mono leading-normal bg-amber-500/5 p-2 rounded border border-amber-500/10">
            💡 Captura real deshabilitada en backend: Para realizar ingesta real desde streams RTSP de laboratorio, asegúrese de establecer ORBI_SENTINEL_LAB_REAL_CONNECTORS=true, ORBI_SENTINEL_LAB_RECORDING_ENABLED=true y ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED=true en su configuración .env y que FFmpeg esté instalado localmente.
          </p>
        )}
        {allFlagsActive && !labConfig.ffmpegDetected && (
          <p className="text-[10px] text-rose-400/80 italic font-mono leading-normal bg-rose-500/5 p-2 rounded border border-rose-500/10">
            ⚠️ Banderas de seguridad activas pero FFmpeg binary no detectado en el host local. Las capturas generarán fallbacks simulados seguros (mock buffers).
          </p>
        )}
        {isRealEnabled && (
          <p className="text-[10px] text-emerald-400/80 italic font-mono leading-normal bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
            🚀 FFmpeg Lab Capture Enabled — Las capturas manuales de 10s/15s/30s y 60s se realizarán en caliente sobre las cámaras Dahua autorizadas conectadas al switch PoE.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-white">Sentinel Live Wall</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mosaico de visualización CCTV multi-marca. Emulación de transmisión RTSP para Laboratorio Dahua.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Park Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Filtrar Recinto:</span>
            <select
              value={filterPark}
              onChange={(e) => setFilterPark(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los Recintos</option>
              <option value="dahua-lab">Laboratorio Dahua</option>
              <option value="parral">Parque Parral</option>
              <option value="alto-bella-vista">Alto Bella Vista</option>
              <option value="alhue">Parque Alhué</option>
            </select>
          </div>

          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="p-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all flex items-center gap-1 text-xs"
            title="Refrescar feeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar feeds</span>
          </button>
        </div>
      </div>

      {/* Dynamic Lab/FFmpeg status banner */}
      {renderLabStatusBanner()}

      {/* Grid of streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <CameraFeedCard
            key={camera.id}
            camera={camera}
            onClick={() => setSelectedCameraId(camera.id)}
            isSelected={selectedCameraId === camera.id}
            refreshTrigger={refreshTrigger}
            userRole={userRole}
            isLabRecordingEnabled={isLabRecordingEnabled}
            recordingMode={recordingMode}
            onAddClip={onAddClip}
            labConfig={labConfig}
            onCaptureStart={(camName, dur) => {
              setActiveCaptureState({
                cameraName: camName,
                duration: dur,
                timeLeft: dur,
                active: true
              });
            }}
          />
        ))}
      </div>

      {/* Modal / Detailed stream view */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedCamera.status === "Online" ? "bg-emerald-500" :
                  selectedCamera.status === "Offline" ? "bg-rose-500" : "bg-amber-500"
                }`}></span>
                <span className="font-bold text-white text-sm">{selectedCamera.name}</span>
                <span className="text-xs text-slate-500 font-mono">[{selectedCamera.ip}]</span>
              </div>
              <button
                onClick={() => setSelectedCameraId(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-850 hover:bg-slate-800 px-3 py-1 rounded"
              >
                Cerrar Panel
              </button>
            </div>

            <div className="aspect-video w-full bg-black relative">
              <CameraStreamCanvas camera={selectedCamera} isExpanded={true} refreshTrigger={refreshTrigger} />
            </div>

            {userRole === "conserje" ? (
              <div className="p-5 bg-slate-950/50 text-xs text-slate-300 font-mono space-y-2">
                <div className="text-emerald-400 font-bold uppercase tracking-wider mb-2">Panel Simplificado de Conserjería</div>
                <div>Canal de Video: <span className="text-white font-bold">{selectedCamera.name}</span></div>
                <div>Estado de Enlace: <span className={selectedCamera.status === "Online" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{selectedCamera.status}</span></div>
                <div>Estado de Almacenamiento: <span className="text-sky-400 font-bold">Grabación Activa en Búfer Local</span></div>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Datos del Stream</span>
                  <div className="mt-1 space-y-1 text-xs text-slate-300 font-mono">
                    <div>RTSP URL: <span className="text-slate-400 break-all">{selectedCamera.rtspUrl}</span></div>
                    <div>ONVIF Port: <span className="text-sky-400">{selectedCamera.onvifPort}</span></div>
                    <div>Resolución: <span className="text-emerald-400">{selectedCamera.resolution}</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Canal de Red PoE</span>
                  <div className="mt-1 space-y-1 text-xs text-slate-300 font-mono">
                    <div>Puerto PoE Switch: <span className="text-amber-400">Puerto {selectedCamera.poePort}</span></div>
                    <div>Último Ping: <span className={`font-bold ${selectedCamera.lastPing.includes("Timeout") ? "text-rose-400" : "text-emerald-400"}`}>{selectedCamera.lastPing}</span></div>
                    <div>Modelo de Cámara: <span className="text-slate-400">{selectedCamera.model}</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Motor de Visión IA</span>
                  <div className="mt-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>ORBI Vision Core Activo</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Analizando patrones de movimiento de personas, siluetas de vehículos de contratistas y cruces perimetrales en tiempo real.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CameraFeedCardProps {
  key?: string;
  camera: Camera;
  onClick: () => void;
  isSelected: boolean;
  refreshTrigger: number;
  userRole?: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled?: boolean;
  recordingMode?: string;
  onAddClip?: (clip: any) => void;
  labConfig?: any;
  onCaptureStart?: (cameraName: string, duration: number) => void;
}

function CameraFeedCard({
  camera,
  onClick,
  isSelected,
  refreshTrigger,
  userRole = "admin",
  isLabRecordingEnabled = false,
  recordingMode = "mixto",
  onAddClip,
  labConfig,
  onCaptureStart
}: CameraFeedCardProps) {
  // Status styling configurations
  const getStatusBadge = (cam: Camera) => {
    // 1. If Conserje role, show simplified status badges
    if (userRole === "conserje") {
      const badgesConserje: React.ReactNode[] = [];
      if (cam.privacyZone === "private") {
        badgesConserje.push(
          <span key="conserje-priv" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Cámara protegida
          </span>
        );
      } else if (cam.status === "Offline") {
        badgesConserje.push(
          <span key="conserje-off" className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Grabación no disponible
          </span>
        );
      } else if (cam.status === "Sin Acceso" || cam.status === "Sin Stream") {
        badgesConserje.push(
          <span key="conserje-tech" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider animate-pulse">
            Requiere revisión técnica
          </span>
        );
      } else if (cam.status === "Online") {
        badgesConserje.push(
          <span key="conserje-on" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Grabación disponible
          </span>
        );
      } else {
        badgesConserje.push(
          <span key="conserje-off-g" className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Grabación no disponible
          </span>
        );
      }
      return <div className="flex flex-col items-end gap-1 shrink-0">{badgesConserje}</div>;
    }

    // 2. Admin / Técnico role gets detailed badges
    const badges: React.ReactNode[] = [];

    // Privacy Zone
    if (cam.privacyZone === "private") {
      badges.push(
        <span key="privacy" className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Privacy restricted
        </span>
      );
    }

    // Health Score Badges
    if (cam.healthScore !== undefined) {
      if (cam.healthScore >= 85) {
        badges.push(
          <span key="h-high" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            ❤️ Health alta ({cam.healthScore})
          </span>
        );
      } else if (cam.healthScore >= 60) {
        badges.push(
          <span key="h-part" className="bg-amber-500/25 text-amber-300 border border-amber-500/35 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            ⚠️ Health parcial ({cam.healthScore})
          </span>
        );
      } else if (cam.healthScore >= 30) {
        badges.push(
          <span key="h-rev" className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            🔍 Requiere revisión ({cam.healthScore})
          </span>
        );
      } else {
        badges.push(
          <span key="h-off" className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider animate-pulse">
            💀 Offline ({cam.healthScore})
          </span>
        );
      }
    }

    // FFmpeg Capture Readiness badge
    const isPrivate = cam.privacyZone === "private";
    const isOnline = cam.status === "Online";

    if (isPrivate) {
      badges.push(
        <span key="cap-priv" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          🔒 Capture Blocked
        </span>
      );
    } else if (isOnline) {
      const realConnectors = labConfig?.realConnectorsEnabled;
      const recEnabled = labConfig?.recordingEnabled;
      const ffmpegAdapt = labConfig?.ffmpegAdapterEnabled;
      const isRealReady = realConnectors && recEnabled && ffmpegAdapt && labConfig?.ffmpegDetected;

      if (isRealReady && cam.realConnectorAllowed) {
        badges.push(
          <span key="cap-real" className="bg-red-500/15 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider animate-pulse">
            🔴 Capture Ready (FFmpeg)
          </span>
        );
      } else if (labConfig?.ffmpegDetected && !cam.realConnectorAllowed) {
        badges.push(
          <span key="cap-uneligible" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            🔵 Mock Only (No eligible)
          </span>
        );
      } else if (!labConfig?.ffmpegDetected) {
        badges.push(
          <span key="cap-missing" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            ⚠️ FFmpeg Missing
          </span>
        );
      } else {
        badges.push(
          <span key="cap-mock" className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            🔵 Mock Clip Only
          </span>
        );
      }
    }

    // Connector Mode & Capabilities
    if (cam.realConnectorAllowed === false) {
      badges.push(
        <span key="disabled" className="bg-slate-500/15 text-slate-400 border border-slate-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Connector disabled
        </span>
      );
    }

    // Core Connectivity Status
    if (cam.status === "Offline") {
      badges.push(
        <span key="off" className="bg-rose-500/15 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Offline
        </span>
      );
    } else if (cam.status === "Sin Acceso") {
      badges.push(
        <span key="sin-acc" className="bg-purple-500/15 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Auth required
        </span>
      );
    } else if (cam.status === "Online") {
      if (cam.isLab || cam.parkId === "dahua-lab") {
        badges.push(
          <span key="snap" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Snapshot OK
          </span>
        );
      } else {
        badges.push(
          <span key="online" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            Online
          </span>
        );
      }
    } else if (cam.status === "Pendiente Validar") {
      badges.push(
        <span key="rt-pend" className="bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Preview pending
        </span>
      );
    } else {
      badges.push(
        <span key="status" className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          {cam.status}
        </span>
      );
    }

    return (
      <div className="flex flex-col items-end gap-1 shrink-0">
        {badges}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-150 flex flex-col justify-between">
      {/* Feed Title Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-850 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide truncate max-w-[150px]" title={camera.name}>
            {camera.name}
          </h4>
          <span className="text-[10px] font-mono text-slate-500">{camera.ip}</span>
        </div>
        {getStatusBadge(camera)}
      </div>

      {/* Feed Stream Box */}
      <div className="aspect-video w-full bg-black relative overflow-hidden group">
        <CameraStreamCanvas camera={camera} isExpanded={false} refreshTrigger={refreshTrigger} />

        {/* Hover overlay with detail prompt */}
        {camera.status !== "Offline" && camera.status !== "Sin Acceso" && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150 gap-2 cursor-pointer" onClick={onClick}>
            <span className="text-xs font-mono bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              Maximizar Stream
            </span>
          </div>
        )}
      </div>

      {/* Live status indicators */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-850 text-[10px] font-mono text-slate-400 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 shrink-0">
          <Activity className="w-3 h-3 text-sky-400" />
          FPS: <span className="text-white">{camera.fps}</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">{camera.resolution}</span>

        {camera.status === "Online" && onAddClip && (
          <button
            onClick={(e) => {
              e.stopPropagation();

              if (camera.privacyZone === "private") {
                alert("❌ Bloqueado por directiva de privacidad: No se permite marcar eventos de cámaras en zonas privadas.");
                return;
              }

              // Duration of manual events is 15 seconds
              const durationSecs = 15;

              fetch("/api/lab/ffmpeg/capture-clip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cameraId: camera.id,
                  cameraName: camera.name,
                  cameraIp: camera.ip,
                  privacyZone: camera.privacyZone || "common",
                  durationSeconds: durationSecs,
                  streamProfile: "sub",
                  reason: "manual",
                  userRole: userRole,
                  realConnectorAllowed: camera.realConnectorAllowed
                })
              })
              .then((res) => res.json())
              .then((data) => {
                if (data.error && data.status === "Privacy Blocked") {
                  alert(`❌ Bloqueado por directiva de privacidad: No se permite marcar eventos de cámaras en zonas privadas.`);
                  return;
                }
                if (data.success) {
                  onAddClip(data.metadata);
                  if (onCaptureStart && data.source === "lab real") {
                    onCaptureStart(camera.name, durationSecs);
                  }
                  alert(`✓ Evento marcado con éxito (${data.status}).\nSegmento de ${data.durationSeconds}s guardado para: ${camera.name}.\nEstado: ${data.source === "lab real" ? "Grabación Real FFmpeg activa" : "Simulación Mock activa"}.`);
                } else {
                  alert(`❌ Error al capturar: ${data.error || "Desconocido"}`);
                }
              })
              .catch((err) => {
                console.error("Error capturing clip:", err);
                alert("❌ Error de comunicación con el adaptador FFmpeg local.");
              });
            }}
            className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all flex items-center gap-1 active:scale-95 shrink-0"
          >
            <Tag className="w-2.5 h-2.5" />
            <span>Marcar Evento</span>
          </button>
        )}

        <span className="text-emerald-400 font-semibold shrink-0">{camera.lastPing}</span>
      </div>
    </div>
  );
}

interface CameraStreamCanvasProps {
  camera: Camera;
  isExpanded: boolean;
  refreshTrigger: number;
}

function CameraStreamCanvas({ camera, isExpanded, refreshTrigger }: CameraStreamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;

    // Simulation parameters
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number }[] = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
      });
    }

    // Interactive tracker angle if applicable
    let angleShift = 0;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Handle offline or missing video states first
      if (camera.status === "Offline") {
        ctx.fillStyle = "#0c0a09"; // Stone 950
        ctx.fillRect(0, 0, w, h);

        // Analog Static Noise pattern
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.floor(Math.random() * 25);
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);

        // Red Offline text
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("DISPOSITIVO OFFLINE", w / 2, h / 2 - 10);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px monospace";
        ctx.fillText("PING TIMEOUT - VERIFICAR ALIMENTACIÓN PoE", w / 2, h / 2 + 15);
        return;
      }

      if (camera.status === "Sin Acceso") {
        ctx.fillStyle = "#1e1b4b"; // Indigo dark
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "#a78bfa";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("ERROR DE AUTENTICACIÓN (401)", w / 2, h / 2 - 10);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px monospace";
        ctx.fillText("CREDENCIALES NO CONFIGURADAS", w / 2, h / 2 + 10);
        ctx.fillText("CONSULTE SENTINEL ACCESS VAULT", w / 2, h / 2 + 25);
        return;
      }

      if (camera.status === "Sin Stream") {
        ctx.fillStyle = "#1e293b"; // Slate dark
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("RTSP STREAM UNAVAILABLE", w / 2, h / 2 - 10);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px monospace";
        ctx.fillText("CONEXIÓN PING EXITOSA PERO STREAM INCOMPLETO", w / 2, h / 2 + 10);
        return;
      }

      // Draw background sky & terrain
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "#0f172a"); // deep blue sky
      gradient.addColorStop(0.5, "#1e293b"); // light horizon
      gradient.addColorStop(0.55, "#065f46"); // green solar plant base
      gradient.addColorStop(1, "#022c22"); // dark ground
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Draw Sun
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "#eab308";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Draw solar panels (Trackers representation)
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#1e1b4b";

      // Rotate panels depending on simulator mode
      const isAlhue = camera.parkId === "alhue";
      const trackerRotation = isAlhue ? Math.sin(frameCount * 0.01) * 35 : 15;

      // Draw representative solar rack 1
      ctx.save();
      ctx.translate(w * 0.3, h * 0.65);
      ctx.rotate((trackerRotation * Math.PI) / 180);
      ctx.fillRect(-35, -8, 70, 16);
      ctx.strokeRect(-35, -8, 70, 16);
      ctx.fillStyle = "#3b82f6"; // Solar cells highlight
      ctx.fillRect(-30, -5, 25, 10);
      ctx.fillRect(5, -5, 25, 10);
      ctx.restore();

      // Support post
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.65);
      ctx.lineTo(w * 0.3, h * 0.85);
      ctx.strokeStyle = "#64748b";
      ctx.stroke();

      // Draw representative solar rack 2
      ctx.save();
      ctx.translate(w * 0.65, h * 0.7);
      ctx.rotate((trackerRotation * Math.PI) / 180);
      ctx.fillRect(-45, -10, 90, 20);
      ctx.strokeRect(-45, -10, 90, 20);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-40, -6, 35, 12);
      ctx.fillRect(5, -6, 35, 12);
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(w * 0.65, h * 0.7);
      ctx.lineTo(w * 0.65, h * 0.9);
      ctx.stroke();

      // Draw grass or vegetation in Parral case
      if (camera.parkId === "parral") {
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        for (let i = 0; i < w; i += 20) {
          const vegHeight = 10 + Math.sin(i * 0.05 + frameCount * 0.05) * 4;
          ctx.lineTo(i, h - vegHeight);
          ctx.lineTo(i + 10, h);
        }
        ctx.fill();
      }

      // Draw fence or wireless transmission indicators if "Intermitente"
      if (camera.status === "Intermitente") {
        // Overlay blinking interference noise lines
        if (Math.random() > 0.7) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.fillRect(0, Math.random() * h, w, 2);
        }
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(w * 0.1, h * 0.1);
        ctx.lineTo(w * 0.9, h * 0.1);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Live video scanline overlay effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
      for (let i = 0; i < h; i += 4) {
        ctx.fillRect(0, i, w, 1);
      }

      // Draw ORBI Vision Intelligent Bounding Box Simulation
      const timeFactor = frameCount * 0.015;
      const boxX = w * 0.45 + Math.sin(timeFactor) * (w * 0.15);
      const boxY = h * 0.55 + Math.cos(timeFactor * 0.7) * (h * 0.08);

      ctx.strokeStyle = "#10b981"; // Emerald tracker color
      ctx.lineWidth = 1.5;

      // Draw targeted box
      ctx.strokeRect(boxX, boxY, 40, 55);

      // Box corner design
      ctx.fillStyle = "#10b981";
      // Top left
      ctx.fillRect(boxX - 2, boxY - 2, 8, 2);
      ctx.fillRect(boxX - 2, boxY - 2, 2, 8);
      // Top right
      ctx.fillRect(boxX + 34, boxY - 2, 8, 2);
      ctx.fillRect(boxX + 40, boxY - 2, 2, 8);
      // Bottom left
      ctx.fillRect(boxX - 2, boxY + 55, 8, 2);
      ctx.fillRect(boxX - 2, boxY + 49, 2, 8);
      // Bottom right
      ctx.fillRect(boxX + 34, boxY + 55, 8, 2);
      ctx.fillRect(boxX + 40, boxY + 49, 2, 8);

      // Tag Label above the box
      ctx.fillStyle = "#10b981";
      ctx.font = "9px monospace";
      ctx.fillText("HUMANO [94%]", boxX, boxY - 6);

      // Render camera OSD (On Screen Display)
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`CAM: ${camera.name}`, 15, h - 25);
      ctx.fillText(`IP: ${camera.ip}`, 15, h - 12);

      // Current Time OSD
      const dateStr = new Date().toLocaleDateString("es-CL");
      const timeStr = new Date().toLocaleTimeString("es-CL");
      ctx.textAlign = "right";
      ctx.fillText(`${dateStr} ${timeStr}`, w - 15, h - 12);

      // AI Indicator top corner
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.fillRect(12, 12, 115, 20);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.strokeRect(12, 12, 115, 20);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "left";
      ctx.fillText("● ORBI VISION IA", 20, 25);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [camera, refreshTrigger]);

  return (
    <canvas
      ref={canvasRef}
      width={isExpanded ? 800 : 400}
      height={isExpanded ? 450 : 225}
      className="w-full h-full block object-cover font-mono"
    />
  );
}
