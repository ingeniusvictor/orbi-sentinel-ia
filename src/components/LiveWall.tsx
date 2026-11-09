import React, { useEffect, useState, useRef } from "react";
import { Camera, CameraStatus } from "../types";
import {
  Video,
  RefreshCw,
  Maximize2,
  Shield,
  Activity,
  Power,
  Tag,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  PenTool,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ScanFace,
  Car
} from "lucide-react";

interface FrigateZoneItem {
  id: string;
  name: string;
  cameraId: string;
  points: { x: number; y: number }[];
  triggerObjects: string[];
  lprEnabled: boolean;
  faceRecognitionEnabled: boolean;
  notifyLumia: boolean;
  color: string;
}

interface LiveWallProps {
  cameras: Camera[];
  isDemoMode: boolean;
  userRole?: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled?: boolean;
  recordingMode?: string;
  onAddClip?: (clip: any) => void;
  setCurrentTab?: (tab: string) => void;
}

// Algoritmo Ray-Casting de Frigate para evaluar si los pies (bottom-center) pisan el polígono
function isPointInPolygon(px: number, py: number, polygon: { x: number; y: number }[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
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

  // Módulo 17B: Estados del Editor Interactivo de Polígonos Frigate + Puente Lumia
  const [frigateZones, setFrigateZones] = useState<FrigateZoneItem[]>([]);
  const [isDrawingZone, setIsDrawingZone] = useState<boolean>(false);
  const [draftPoints, setDraftPoints] = useState<{ x: number; y: number }[]>([]);
  const [newZoneName, setNewZoneName] = useState<string>("Zona Acceso / Analítica");
  const [newZoneColor, setNewZoneColor] = useState<string>("#10b981");
  const [newZoneLpr, setNewZoneLpr] = useState<boolean>(true);
  const [newZoneFace, setNewZoneFace] = useState<boolean>(true);
  const [autoTriggerLumia, setAutoTriggerLumia] = useState<boolean>(false);
  const [lumiaVoiceOn, setLumiaVoiceOn] = useState<boolean>(true);
  const [lumiaAnalyzing, setLumiaAnalyzing] = useState<boolean>(false);
  const [lumiaLastVerdict, setLumiaLastVerdict] = useState<any>(null);
  const [centinelaAlertActive, setCentinelaAlertActive] = useState<boolean>(false);
  const modalCanvasGetterRef = useRef<(() => string | null) | null>(null);
  const lastAutoTriggerRef = useRef<number>(0);

  // Módulo 1E: FFmpeg and Safety Config State
  const [isMouseIdle, setIsMouseIdle] = useState<boolean>(false);
  const mouseTimerRef = useRef<any>(null);

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

  const fetchFrigateZones = () => {
    fetch("/api/frigate/zones")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.zones)) {
          setFrigateZones(data.zones);
        }
      })
      .catch((err) => console.error("Error cargando zonas Frigate:", err));
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseIdle(false);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = setTimeout(() => setIsMouseIdle(true), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    mouseTimerRef.current = setTimeout(() => setIsMouseIdle(true), 3000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetch("/api/lab/config")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLabConfig(data);
        }
      })
      .catch((err) => console.error("Error fetching lab config inside LiveWall:", err));

    fetchFrigateZones();
  }, [refreshTrigger]);

  // Handle countdown simulation when clip is capturing
  useEffect(() => {
    if (activeCaptureState && activeCaptureState.active && activeCaptureState.timeLeft > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setActiveCaptureState((prev) => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            return null;
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

  const speakLumiaText = (text: string) => {
    if (!lumiaVoiceOn || !text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-CL";
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  };

  // Guardar nuevo polígono dibujado con el mouse en el servidor
  const handleSavePolygonZone = async () => {
    if (!selectedCameraId || draftPoints.length < 3) {
      alert("Haz al menos 3 clics sobre el video de la cámara para cerrar un polígono válido.");
      return;
    }

    try {
      const res = await fetch("/api/frigate/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newZoneName,
          cameraId: selectedCameraId,
          points: draftPoints,
          triggerObjects: ["Persona", "Vehículo"],
          lprEnabled: newZoneLpr,
          faceRecognitionEnabled: newZoneFace,
          notifyLumia: true,
          color: newZoneColor
        })
      });
      const data = await res.json();
      if (data.success) {
        setFrigateZones(data.zones);
        setDraftPoints([]);
        setIsDrawingZone(false);
      }
    } catch (e) {
      console.error("Error guardando polígono:", e);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      const res = await fetch(`/api/frigate/zones/${zoneId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFrigateZones(data.zones);
      }
    } catch (e) {
      console.error("Error eliminando zona:", e);
    }
  };

  // Enviar snapshot del canvas actual a qwen3.5:4b-fast cuando un objeto pisa la zona
  const handleAnalyzeCameraWithLumia = async (camera: Camera, triggeredZone?: FrigateZoneItem) => {
    if (lumiaAnalyzing) return;
    setLumiaAnalyzing(true);
    try {
      const snapshotB64 = modalCanvasGetterRef.current ? modalCanvasGetterRef.current() : null;
      const res = await fetch("/api/frigate/analyze-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: triggeredZone?.id || "zone-porton-lpr",
          triggerMode: triggeredZone?.lprEnabled ? "lpr_scan" : "zone_breach",
          imageBase64: snapshotB64,
          simulatedContext: `Cámara activa: ${camera.name} (${camera.ip}). Zona poligonal activada: ${
            triggeredZone?.name || "Polígono Perimetral"
          }. LPR=${triggeredZone?.lprEnabled ? "ON" : "OFF"}, FaceID=${
            triggeredZone?.faceRecognitionEnabled ? "ON" : "OFF"
          }.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setLumiaLastVerdict(data);
        if (data.lumiaAction === "HABLAR" && data.lumiaSpeech) {
          speakLumiaText(data.lumiaSpeech);
        }

        // Modo Centinela: Auto maximize on alert
        if (data.lumiaAction === "HABLAR" || data.lumiaAction === "ALERTA" || data.licensePlate) {
           setSelectedCameraId(camera.id);
           setCentinelaAlertActive(true);
        }
      }
    } catch (err) {
      console.error("Error consultando a Lumia desde LiveWall:", err);
    } finally {
      setLumiaAnalyzing(false);
    }
  };

  const filteredCameras = cameras.filter((cam) => {
    if (filterPark === "all") return true;
    return cam.parkId === filterPark;
  });

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || null;
  const selectedCameraZones = frigateZones.filter(
    (z) => z.cameraId === selectedCameraId || (selectedCameraId === "cam-01" && z.cameraId === "lab-cam-01")
  );

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

    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Sentinel FFmpeg Recording Lab Status & Frigate Polygon Engine
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Zonas Frigate Activas: {frigateZones.length}
            </span>
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
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Editor de Zonas Frigate:</span>
            <span className="font-bold text-emerald-400 truncate block">
              ✓ Click en "Maximizar Stream" para dibujar
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px]">Cerebro Visual Lumia:</span>
            <span className="font-bold text-sky-400 uppercase">
              qwen3.5:4b-fast (100% GPU)
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className={`transition-opacity duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 ${isMouseIdle ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div>
          <h3 className="text-lg font-semibold text-white">Sentinel Live Wall & Frigate Zone Studio</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mosaico CCTV multi-marca. Haz clic en cualquier cámara para dibujar polígonos de analítica con el mouse y conectar con Lumia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
        {filteredCameras.map((camera) => {
          const camZones = frigateZones.filter(
            (z) => z.cameraId === camera.id || (camera.id === "cam-01" && z.cameraId === "lab-cam-01")
          );
          return (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              zones={camZones}
              onClick={() => {
                setSelectedCameraId(camera.id);
                setDraftPoints([]);
                setIsDrawingZone(false);
                setLumiaLastVerdict(null);
              }}
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
              onZoneBreach={(zone) => {
                  if (!selectedCameraId && !centinelaAlertActive) {
                      setSelectedCameraId(camera.id);
                      setCentinelaAlertActive(true);
                  }
              }}
            />
          );
        })}
      </div>

      {/* Modal / Detailed stream view + EDITOR INTERACTIVO DE POLÍGONOS FRIGATE CON EL MOUSE */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className={`bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full overflow-hidden my-auto shadow-2xl transition-all ${centinelaAlertActive ? "ring-4 ring-rose-500/50 animate-[pulse_2s_ease-in-out_infinite]" : ""}`}>

            {centinelaAlertActive ? (
                <div className="p-4 bg-rose-500/10 border-b border-rose-500/30 flex justify-center items-center gap-4">
                  <span className="text-rose-400 font-bold font-mono text-sm animate-pulse">⚠️ ALERTA CENTINELA DETECTADA</span>
                  <button
                    onClick={() => {
                        setCentinelaAlertActive(false);
                        setSelectedCameraId(null);
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded flex items-center gap-2 font-mono text-xs transition-all"
                  >
                     <Save className="w-4 h-4" />
                     Confirmar Alerta y Guardar Evidencia
                  </button>
                </div>
            ) : (
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedCamera.status === "Online" ? "bg-emerald-500" :
                  selectedCamera.status === "Offline" ? "bg-rose-500" : "bg-amber-500"
                }`}></span>
                <span className="font-bold text-white text-sm">{selectedCamera.name}</span>
                <span className="text-xs text-slate-500 font-mono">[{selectedCamera.ip}]</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                  {selectedCameraZones.length} Zonas Frigate
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                {userRole !== "conserje" && (
                  <>
                    <button
                      onClick={() => {
                        setIsDrawingZone(!isDrawingZone);
                        setDraftPoints([]);
                      }}
                      className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 font-bold transition-all ${
                        isDrawingZone
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {isDrawingZone ? "Dibujando con Mouse (Activo)" : "+ Trazar Zona con Mouse"}
                    </button>

                    <button
                      onClick={() => handleAnalyzeCameraWithLumia(selectedCamera, selectedCameraZones[0])}
                      disabled={lumiaAnalyzing}
                      className="px-3 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {lumiaAnalyzing ? "Analizando..." : "Consultar a Lumia (4B)"}
                    </button>

                    <button
                      onClick={() => setLumiaVoiceOn(!lumiaVoiceOn)}
                      className={`p-1.5 rounded-lg border ${
                        lumiaVoiceOn
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                      title="Activar/Silenciar voz de Lumia"
                    >
                      {lumiaVoiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setSelectedCameraId(null);
                    setIsDrawingZone(false);
                    setDraftPoints([]);
                    setCentinelaAlertActive(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs bg-slate-850 hover:bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"
                >
                  Cerrar Panel
                </button>
              </div>
            </div>
            )}

            {/* Barra de configuración rápida cuando estás dibujando con el mouse */}
            {!centinelaAlertActive && isDrawingZone && (
              <div className="p-3 bg-slate-950/95 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    🖱️ Haz clic en el video para marcar puntos ({draftPoints.length} vértices):
                  </span>
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Nombre de la zona..."
                    className="bg-slate-900 border border-slate-700 text-white px-2.5 py-1 rounded text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <select
                    value={newZoneColor}
                    onChange={(e) => setNewZoneColor(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                  >
                    <option value="#10b981">Verde (Acceso / LPR)</option>
                    <option value="#f43f5e">Rojo (Intrusión Crítica)</option>
                    <option value="#38bdf8">Azul (Centinela Lumia)</option>
                    <option value="#f59e0b">Ámbar (Advertencia Operativa)</option>
                  </select>
                  <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newZoneLpr}
                      onChange={(e) => setNewZoneLpr(e.target.checked)}
                    />
                    LPR Patentes
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newZoneFace}
                      onChange={(e) => setNewZoneFace(e.target.checked)}
                    />
                    Biometría Facial
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDraftPoints((prev) => prev.slice(0, -1))}
                    disabled={draftPoints.length === 0}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 disabled:opacity-40"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Deshacer Punto
                  </button>
                  <button
                    onClick={handleSavePolygonZone}
                    disabled={draftPoints.length < 3}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded flex items-center gap-1 disabled:opacity-40"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Guardar Polígono ({draftPoints.length})
                  </button>
                </div>
              </div>
            )}

            {/* Contenedor de Video + Lienzo Interactivo de Polígonos con el Mouse */}
            <div
              className={`aspect-video w-full bg-black relative select-none ${
                !centinelaAlertActive && isDrawingZone ? "cursor-crosshair" : ""
              }`}
              onClick={(e) => {
                if (!isDrawingZone) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Number(((e.clientX - rect.left) / rect.width).toFixed(4));
                const y = Number(((e.clientY - rect.top) / rect.height).toFixed(4));
                setDraftPoints((prev) => [...prev, { x, y }]);
              }}
            >
              <CameraStreamCanvas
                camera={selectedCamera}
                isExpanded={true}
                refreshTrigger={refreshTrigger}
                zones={selectedCameraZones}
                draftPoints={draftPoints}
                draftColor={newZoneColor}
                registerSnapshotGetter={(fn) => {
                  modalCanvasGetterRef.current = fn;
                }}
                onZoneBreach={(zone) => {
                  if (!autoTriggerLumia) return;
                  const now = Date.now();

                  // Modo Centinela: Quick auto maximize even before lumia finishes if it's a zone breach
                  if (!selectedCameraId && !centinelaAlertActive && (now - lastAutoTriggerRef.current > 18000)) {
                      setSelectedCameraId(selectedCamera?.id || "cam-01");
                      setCentinelaAlertActive(true);
                  }

                  if (now - lastAutoTriggerRef.current > 18000) {
                    lastAutoTriggerRef.current = now;
                    handleAnalyzeCameraWithLumia(selectedCamera, zone);
                  }
                }}
              />
            </div>

            {/* Respuesta de Lumia Vision si se ejecutó un análisis en este canal */}
            {!centinelaAlertActive && lumiaLastVerdict && (
              <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      VEREDICTO LUMIA ({lumiaLastVerdict.engine}):
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      lumiaLastVerdict.lumiaAction === "SILENCIO"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {lumiaLastVerdict.lumiaAction}
                    </span>
                    {lumiaLastVerdict.licensePlate && (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                        LPR: {lumiaLastVerdict.licensePlate}
                      </span>
                    )}
                    {lumiaLastVerdict.faceIdentity && (
                      <span className="px-2 py-0.5 rounded text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold">
                        ID: {lumiaLastVerdict.faceIdentity}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-[11px]">{lumiaLastVerdict.technicalSummary}</p>
                  {lumiaLastVerdict.lumiaSpeech && (
                    <p className="text-emerald-400 text-[11px] font-bold">
                      🗣️ "{lumiaLastVerdict.lumiaSpeech}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Panel inferior con datos técnicos + Lista de Zonas Poligonales de la Cámara */}
            {!centinelaAlertActive && (userRole === "conserje" ? (
              <div className="p-5 bg-slate-950/50 text-xs text-slate-300 font-mono space-y-2">
                <div className="text-emerald-400 font-bold uppercase tracking-wider mb-2">Panel Simplificado de Conserjería</div>
                <div>Canal de Video: <span className="text-white font-bold">{selectedCamera.name}</span></div>
                <div>Estado de Enlace: <span className={selectedCamera.status === "Online" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{selectedCamera.status}</span></div>
                <div>Estado de Almacenamiento: <span className="text-sky-400 font-bold">Grabación Activa en Búfer Local</span></div>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 border-t border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Datos del Stream & Red</span>
                  <div className="mt-1 space-y-1 text-xs text-slate-300 font-mono">
                    <div>RTSP URL: <span className="text-slate-400 break-all">{selectedCamera.rtspUrl}</span></div>
                    <div>Puerto PoE: <span className="text-amber-400">Puerto {selectedCamera.poePort}</span> | Ping: <span className="text-emerald-400">{selectedCamera.lastPing}</span></div>
                    <div>Resolución: <span className="text-emerald-400">{selectedCamera.resolution}</span> ({selectedCamera.model})</div>
                  </div>
                </div>

                {/* Lista de Zonas Poligonales Frigate en esta Cámara */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      Zonas Poligonales Activas ({selectedCameraZones.length})
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-1.5 max-h-28 overflow-y-auto pr-1 font-mono text-[11px]">
                    {selectedCameraZones.map((z) => (
                      <div
                        key={z.id}
                        className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                          <span className="text-slate-200 font-bold truncate" title={z.name}>{z.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {z.lprEnabled && <span className="text-[9px] text-amber-400">LPR</span>}
                          {z.faceRecognitionEnabled && <span className="text-[9px] text-sky-400">FACE</span>}
                          <button
                            onClick={() => handleDeleteZone(z.id)}
                            className="text-rose-400 hover:text-rose-300 p-0.5"
                            title="Eliminar zona"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedCameraZones.length === 0 && (
                      <p className="text-[10px] text-slate-500 italic">
                        Sin zonas en esta cámara. Usa "+ Trazar Zona con Mouse" arriba.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Disparo Automático a Lumia</span>
                  <div className="mt-2 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Auto-Disparo por Zona
                      </span>
                      <button
                        onClick={() => setAutoTriggerLumia(!autoTriggerLumia)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          autoTriggerLumia
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {autoTriggerLumia ? "ACTIVO" : "MANUAL"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Cuando los pies del objeto (`bottom_center`) cruzan tu polígono dibujado, envía el fotograma a `qwen3.5:4b-fast` y Lumia anuncia la alerta.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CameraFeedCardProps {
  key?: string;
  camera: Camera;
  zones?: FrigateZoneItem[];
  onClick: () => void;
  isSelected: boolean;
  refreshTrigger: number;
  userRole?: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled?: boolean;
  recordingMode?: string;
  onAddClip?: (clip: any) => void;
  labConfig?: any;
  onCaptureStart?: (cameraName: string, duration: number) => void;
  onZoneBreach?: (zone: FrigateZoneItem) => void;
}

function CameraFeedCard({
  camera,
  zones = [],
  onClick,
  isSelected,
  refreshTrigger,
  userRole = "admin",
  isLabRecordingEnabled = false,
  recordingMode = "mixto",
  onAddClip,
  labConfig,
  onCaptureStart,
  onZoneBreach
}: CameraFeedCardProps) {
  const getStatusBadge = (cam: Camera) => {
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

    const badges: React.ReactNode[] = [];

    if (zones.length > 0) {
      badges.push(
        <span key="frigate-z" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          ⬡ {zones.length} Zona(s) Frigate
        </span>
      );
    }

    if (cam.privacyZone === "private") {
      badges.push(
        <span key="privacy" className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
          Privacy restricted
        </span>
      );
    }

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
      } else {
        badges.push(
          <span key="cap-mock" className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
            🔵 Mock Clip Ready
          </span>
        );
      }
    }

    return (
      <div className="flex flex-col items-end gap-1 shrink-0">
        {badges}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-150 flex flex-col justify-between">
      <div className="p-3 bg-slate-950/80 border-b border-slate-850 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide truncate max-w-[150px]" title={camera.name}>
            {camera.name}
          </h4>
          <span className="text-[10px] font-mono text-slate-500">{camera.ip}</span>
        </div>
        {getStatusBadge(camera)}
      </div>

      <div className="aspect-video w-full bg-black relative overflow-hidden group">
        <CameraStreamCanvas camera={camera} isExpanded={false} refreshTrigger={refreshTrigger} zones={zones} onZoneBreach={onZoneBreach} />

        {camera.status !== "Offline" && camera.status !== "Sin Acceso" && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150 gap-2 cursor-pointer" onClick={onClick}>
            <span className="text-xs font-mono bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              Maximizar / Dibujar Zonas
            </span>
          </div>
        )}
      </div>

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
                  alert(`✓ Evento marcado con éxito (${data.status}).\nSegmento de ${data.durationSeconds}s guardado para: ${camera.name}.`);
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
  zones?: FrigateZoneItem[];
  draftPoints?: { x: number; y: number }[];
  draftColor?: string;
  registerSnapshotGetter?: (getter: () => string | null) => void;
  onZoneBreach?: (zone: FrigateZoneItem) => void;
}

function CameraStreamCanvas({
  camera,
  isExpanded,
  refreshTrigger,
  zones = [],
  draftPoints = [],
  draftColor = "#10b981",
  registerSnapshotGetter,
  onZoneBreach
}: CameraStreamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamConnecting, setStreamConnecting] = useState(false);
  const latestFrameRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (registerSnapshotGetter) {
      registerSnapshotGetter(() => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/jpeg", 0.85);
      });
    }
  }, [registerSnapshotGetter]);

  // WebSocket for Real RTSP Stream (Zero-Latency Bridge)
  useEffect(() => {
    if (camera.id !== "lab-cam-01") return; // Only process stream for the specific lab cam

    setStreamConnecting(true);
    const ws = new WebSocket(`ws://${window.location.hostname}:24678/api/ws/stream`);

    ws.onopen = () => {
      setStreamConnecting(false);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "frame_data" && payload.data) {
          const img = new Image();
          img.onload = () => {
            latestFrameRef.current = img;
          };
          img.src = payload.data;
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      setStreamConnecting(false);
    };

    ws.onclose = () => {
      setStreamConnecting(false);
    };

    return () => {
      ws.close();
      latestFrameRef.current = null;
    };
  }, [camera.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      if (camera.status === "Offline") {
        ctx.fillStyle = "#0c0a09";
        ctx.fillRect(0, 0, w, h);

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
        ctx.fillStyle = "#1e1b4b";
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
        ctx.fillStyle = "#1e293b";
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

      // If we have a real frame from WebSocket, render it. Otherwise, render mock scene.
      if (camera.id === "lab-cam-01" && latestFrameRef.current) {
        ctx.drawImage(latestFrameRef.current, 0, 0, w, h);
      } else {
        // Sky & Solar Park Terrain
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(0.5, "#1e293b");
        gradient.addColorStop(0.55, "#065f46");
        gradient.addColorStop(1, "#022c22");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Sun
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.25, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Solar Trackers
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#1e1b4b";

        const isAlhue = camera.parkId === "alhue";
        const trackerRotation = isAlhue ? Math.sin(frameCount * 0.01) * 35 : 15;

        ctx.save();
        ctx.translate(w * 0.3, h * 0.65);
        ctx.rotate((trackerRotation * Math.PI) / 180);
        ctx.fillRect(-35, -8, 70, 16);
        ctx.strokeRect(-35, -8, 70, 16);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(-30, -5, 25, 10);
        ctx.fillRect(5, -5, 25, 10);
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.65);
        ctx.lineTo(w * 0.3, h * 0.85);
        ctx.strokeStyle = "#64748b";
        ctx.stroke();

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
      }

      // Posición del sujeto y punto de anclaje inferior estilo Frigate (bottom-center)
      const timeFactor = frameCount * 0.015;
      const boxW = isExpanded ? 65 : 40;
      const boxH = isExpanded ? 90 : 55;
      const boxX = w * 0.45 + Math.sin(timeFactor) * (w * 0.22);
      const boxY = h * 0.52 + Math.cos(timeFactor * 0.7) * (h * 0.12);

      // Coordenadas normalizadas (0.0 a 1.0) de los pies del sujeto
      const footNormX = (boxX + boxW / 2) / w;
      const footNormY = (boxY + boxH) / h;

      // 1. DIBUJAR ZONAS POLIGONALES FRIGATE GUARDADAS Y VERIFICAR CRUCE
      let breachedZone: FrigateZoneItem | null = null;
      zones.forEach((zone) => {
        if (!zone.points || zone.points.length < 3) return;
        const isInside = isPointInPolygon(footNormX, footNormY, zone.points);
        if (isInside) {
          breachedZone = zone;
        }

        ctx.save();
        ctx.beginPath();
        zone.points.forEach((pt, idx) => {
          const px = pt.x * w;
          const py = pt.y * h;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        ctx.fillStyle = isInside ? "rgba(244, 63, 94, 0.28)" : `${zone.color}22`;
        ctx.fill();
        ctx.lineWidth = isInside ? 2.5 : 1.5;
        ctx.strokeStyle = isInside ? "#f43f5e" : zone.color;
        ctx.setLineDash(isInside ? [] : [5, 3]);
        ctx.stroke();

        // Etiqueta de la zona en el primer vértice
        const firstX = zone.points[0].x * w;
        const firstY = zone.points[0].y * h;
        ctx.fillStyle = isInside ? "#f43f5e" : zone.color;
        ctx.font = isExpanded ? "bold 11px monospace" : "bold 8px monospace";
        ctx.textAlign = "left";
        ctx.fillText(
          isInside ? `🚨 EN ZONA: ${zone.name.toUpperCase()}` : `⬡ ${zone.name}`,
          firstX + 4,
          Math.max(14, firstY - 6)
        );
        ctx.restore();
      });

      if (breachedZone && onZoneBreach) {
        onZoneBreach(breachedZone);
      }

      // 2. DIBUJAR POLÍGONO EN BORRADOR MIENTRAS EL USUARIO HACE CLIC CON EL MOUSE
      if (draftPoints && draftPoints.length > 0) {
        ctx.save();
        ctx.beginPath();
        draftPoints.forEach((pt, idx) => {
          const px = pt.x * w;
          const py = pt.y * h;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        if (draftPoints.length >= 3) {
          ctx.closePath();
          ctx.fillStyle = `${draftColor}33`;
          ctx.fill();
        }
        ctx.strokeStyle = draftColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        draftPoints.forEach((pt, idx) => {
          const px = pt.x * w;
          const py = pt.y * h;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = draftColor;
          ctx.font = "bold 10px monospace";
          ctx.fillText(`P${idx + 1}`, px + 6, py - 4);
        });
        ctx.restore();
      }

      // 3. DIBUJAR BOUNDING BOX DEL OBJETO Y PUNTO DE ANCLAJE INFERIOR (FRIGATE BOTTOM_CENTER)
      const activeBoxColor = breachedZone ? "#f43f5e" : "#10b981";
      ctx.strokeStyle = activeBoxColor;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Punto de anclaje inferior (pies) que activa las zonas poligonales
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(footNormX * w, footNormY * h, isExpanded ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activeBoxColor;
      ctx.font = isExpanded ? "bold 11px monospace" : "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        breachedZone ? "INTRUSIÓN EN ZONA [97%]" : "HUMANO [94%]",
        boxX,
        boxY - 6
      );

      // OSD
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`CAM: ${camera.name}`, 15, h - 25);
      ctx.fillText(`IP: ${camera.ip}`, 15, h - 12);

      const dateStr = new Date().toLocaleDateString("es-CL");
      const timeStr = new Date().toLocaleTimeString("es-CL");
      ctx.textAlign = "right";
      ctx.fillText(`${dateStr} ${timeStr}`, w - 15, h - 12);

      // Top Left Badge
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.fillRect(12, 12, 145, 20);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.strokeRect(12, 12, 145, 20);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "left";
      ctx.fillText("● ORBI FRIGATE IA", 20, 25);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [camera, refreshTrigger, zones, draftPoints, draftColor, isExpanded]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={isExpanded ? 800 : 400}
        height={isExpanded ? 450 : 225}
        className="w-full h-full block object-cover font-mono"
      />
      {streamConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
          <div className="px-4 py-2 border-2 border-emerald-900 bg-slate-900 rounded-lg text-slate-400 font-mono text-sm animate-pulse">
            Conectando al Gateway RTSP...
          </div>
        </div>
      )}
    </div>
  );
}
