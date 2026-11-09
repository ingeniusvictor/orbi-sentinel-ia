import React, { useState, useEffect, useRef } from "react";
import { Camera, Park, Clip, Incident } from "../types";
import {
  Server,
  Database,
  Clock,
  HardDrive,
  Play,
  Shield,
  RefreshCw,
  AlertTriangle,
  FileVideo,
  Video,
  Download,
  ToggleLeft,
  ToggleRight,
  Search,
  Lock,
  Unlock,
  CheckCircle,
  Tag,
  Trash2,
  Plus,
  Info,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

interface EdgeRecorderProps {
  parks: Park[];
  cameras: Camera[];
  currentLine: "field" | "community";
  userRole?: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled: boolean;
  setIsLabRecordingEnabled: (enabled: boolean) => void;
  retentionDays: number;
  setRetentionDays: (days: number) => void;
  recordingMode: string;
  setRecordingMode: (mode: string) => void;
  segmentationMinutes: number;
  setSegmentationMinutes: (mins: number) => void;
  streamQuality: "principal" | "secundario";
  setStreamQuality: (quality: "principal" | "secundario") => void;
  audioRecordingEnabled: boolean;
  setAudioRecordingEnabled: (enabled: boolean) => void;
  privacyLockActive: boolean;
  setPrivacyLockActive: (active: boolean) => void;
  clips: Clip[];
  onAddClip: (clip: Clip) => void;
  onUpdateClipStatus: (clipId: string, status: "disponible" | "protegido" | "expirado" | "bloqueado por privacidad" | "pendiente") => void;
  onAssociateIncident: (clipId: string, incidentId: string) => void;
  incidents: Incident[];
  onAddAuditLog: (action: string, details: string) => void;
}

export default function EdgeRecorder({
  parks,
  cameras,
  currentLine,
  userRole = "admin",
  isLabRecordingEnabled,
  setIsLabRecordingEnabled,
  retentionDays,
  setRetentionDays,
  recordingMode,
  setRecordingMode,
  segmentationMinutes,
  setSegmentationMinutes,
  streamQuality,
  setStreamQuality,
  audioRecordingEnabled,
  setAudioRecordingEnabled,
  privacyLockActive,
  setPrivacyLockActive,
  clips,
  onAddClip,
  onUpdateClipStatus,
  onAssociateIncident,
  incidents,
  onAddAuditLog
}: EdgeRecorderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<"all" | "lab real" | "mock">("all");
  const [filterType, setFilterType] = useState<"all" | "continuo" | "evento">("all");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Association state for clips
  const [selectedClipToAssociate, setSelectedClipToAssociate] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");

  // Playback Center State Variables
  const [selectedPlaybackClip, setSelectedPlaybackClip] = useState<Clip | null>(null);
  const [playbackMetadata, setPlaybackMetadata] = useState<any | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityVerificationResult, setIntegrityVerificationResult] = useState<string | null>(null);
  const [exportJustification, setExportJustification] = useState("");
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState<any | null>(null);
  const [activePlaybackTab, setActivePlaybackTab] = useState<"metadata" | "associate" | "export" | "audit">("metadata");

  // Database / Local Disk Clips State Synchronizer
  const [dbClips, setDbClips] = useState<Clip[]>([]);
  const [rotationResult, setRotationResult] = useState<any | null>(null);

  const fetchDbClips = () => {
    fetch("/api/lab/ffmpeg/clips")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.clips) {
          setDbClips(data.clips);
        }
      })
      .catch((err) => console.error("Error loading clips from DB:", err));
  };

  useEffect(() => {
    fetchDbClips();
  }, [clips]); // fetch whenever props clips list changes or on mount

  // Merge static default clips with local disk/database clips dynamically
  const mergedClips = [...clips];
  dbClips.forEach((dbClip) => {
    if (!mergedClips.some((c) => c.id === dbClip.id)) {
      mergedClips.push(dbClip);
    } else {
      // update any fields that might have changed on disk (like status, associatedIncidentId)
      const index = mergedClips.findIndex((c) => c.id === dbClip.id);
      mergedClips[index] = { ...mergedClips[index], ...dbClip };
    }
  });

  // Load metadata and trigger audit logs whenever a clip is selected for secure playback
  useEffect(() => {
    if (selectedPlaybackClip) {
      setPlaybackError(null);
      setPlaybackMetadata(null);
      setIntegrityVerificationResult(null);
      setGeneratedPackage(null);
      setExportJustification("");
      setActivePlaybackTab("metadata");

      fetch(`/api/lab/clips/${selectedPlaybackClip.id}/metadata`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((d) => { throw new Error(d.error || "Error al cargar metadatos") });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.metadata) {
            setPlaybackMetadata(data.metadata);
            
            // Trigger playback opened event in backend audit log for that clip
            if (userRole !== "conserje" && selectedPlaybackClip.privacyZone !== "private") {
              fetch(`/api/lab/clips/${selectedPlaybackClip.id}/stream?role=${userRole}`).catch(e => console.error(e));
            }
          }
        })
        .catch((err) => {
          console.error("Error loading clip metadata:", err);
          // If metadata is missing or error occurs, fall back to our local clip information
          setPlaybackMetadata({
            ...selectedPlaybackClip,
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            integrityStatus: "verified",
            exportStatus: "locked",
            auditTrail: [
              {
                eventId: "evt-local-fallback",
                timestamp: selectedPlaybackClip.timestampStart,
                actorRole: "sistema",
                actorAlias: "ORBI Sentinel Core (Fallback)",
                action: "clip.created",
                clipId: selectedPlaybackClip.id,
                result: "success",
                reason: "Registro local simulado",
                source: selectedPlaybackClip.source
              }
            ]
          });
        });
    }
  }, [selectedPlaybackClip, userRole]);

  // FFmpeg Lab State
  const [ffmpegStatus, setFfmpegStatus] = useState<any>({
    ffmpegBinary: "loading",
    version: "N/A",
    captureMode: "loading",
    storagePath: "orbi-sentinel-lab-recordings/clips",
    writePermission: "loading",
    safetyFlags: {
      ORBI_SENTINEL_LAB_REAL_CONNECTORS: false,
      ORBI_SENTINEL_LAB_RECORDING_ENABLED: false,
      ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED: false
    }
  });

  const [selectedCaptureCameraId, setSelectedCaptureCameraId] = useState<string>("");
  const [captureDuration, setCaptureDuration] = useState<number>(10);
  const [captureQuality, setCaptureQuality] = useState<"principal" | "secundario">("secundario");
  const [captureReason, setCaptureReason] = useState<string>("test");
  const [activeCaptureCountdown, setActiveCaptureCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureStatusText, setCaptureStatusText] = useState<string>("");

  const captureTimerRef = useRef<any>(null);

  const fetchFfmpegStatus = () => {
    fetch("/api/lab/ffmpeg/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ffmpegBinary) {
          setFfmpegStatus(data);
        }
      })
      .catch((err) => console.error("[EdgeRecorder] Error fetching FFmpeg status:", err));
  };

  useEffect(() => {
    fetchFfmpegStatus();
  }, []);

  // Countdown clock simulation
  useEffect(() => {
    if (isCapturing && activeCaptureCountdown !== null && activeCaptureCountdown > 0) {
      captureTimerRef.current = setTimeout(() => {
        setActiveCaptureCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            setIsCapturing(false);
            setCaptureStatusText("✓ Captura finalizada con éxito.");
            fetchFfmpegStatus(); // Refresh status/clips!
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    };
  }, [isCapturing, activeCaptureCountdown]);

  // Filter parks based on active business line
  const filteredParks = parks.filter((p) => {
    if (currentLine === "field") {
      return ["dahua-lab", "parral", "alto-bella-vista", "alhue"].includes(p.id);
    } else {
      return ["las-condes", "portal-nunoa", "ecovista"].includes(p.id);
    }
  });

  const filteredCameras = cameras.filter((c) =>
    filteredParks.some((p) => p.id === c.parkId)
  );

  const onlineCameras = filteredCameras.filter((c) => c.status === "Online");

  // Auto-select first online or eligible camera for test capture dropdown
  useEffect(() => {
    if (!selectedCaptureCameraId && filteredCameras.length > 0) {
      const firstOnline = filteredCameras.find(c => c.status === "Online" && c.privacyZone !== "private");
      if (firstOnline) {
        setSelectedCaptureCameraId(firstOnline.id);
      } else {
        setSelectedCaptureCameraId(filteredCameras[0].id);
      }
    }
  }, [filteredCameras, selectedCaptureCameraId]);

  // Dynamic Storage Calculation Model
  // Assumes a camera consumes:
  // - Principal Stream: 25 GB/day (continuous)
  // - Secundario Stream: 5 GB/day (continuous)
  // - Event multiplier: 0.25 (since it only records on interest)
  // - Mixed multiplier: 0.5 (low rate continuous + event)
  // - Audio: adds 5% (+5%)
  const getCameraDailyGb = () => {
    const baseGb = streamQuality === "principal" ? 25 : 5;
    let modeMultiplier = 0.5;
    if (recordingMode === "continuo") modeMultiplier = 1.0;
    if (recordingMode === "evento") modeMultiplier = 0.25;
    const audioMultiplier = audioRecordingEnabled ? 1.05 : 1.0;

    return baseGb * modeMultiplier * audioMultiplier;
  };

  const dailyGbPerCamera = getCameraDailyGb();
  const calculatedDailyGbTotal = onlineCameras.length * dailyGbPerCamera;
  const totalEstimatedGb = calculatedDailyGbTotal * retentionDays;
  const totalEstimatedTb = totalEstimatedGb / 1024;

  // Local PC/Notebook Simulation storage bounds
  const diskTotalTb = 2.0; // 2TB standard host disk limit
  const diskUsedTb = Math.min(1.85, 0.4 + totalEstimatedTb); // Simulated current base + dynamic estimate
  const diskFreeTb = Math.max(0.15, diskTotalTb - diskUsedTb);
  const diskPercentage = Math.min(100, Math.round((diskUsedTb / diskTotalTb) * 100));

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onAddAuditLog(
        "refresh_recorder",
        `Sincronización manual de búferes locales con el sistema central. Ejecutado por ${userRole}.`
      );
    }, 1200);
  };

  const handleGenerateMockClip = () => {
    const randomCam = (filteredCameras[Math.floor(Math.random() * filteredCameras.length)] || {
      id: "mock-rand",
      name: "Dahua LAB Cam East",
      ip: "192.168.1.108",
      status: "Online",
      brand: "Dahua",
      model: "Dahua Dome",
      resolution: "1080p",
      fps: 30,
      poePort: 1,
      lastPing: "2ms",
      privacyZone: "common",
      realConnectorAllowed: false
    }) as Camera;

    const isArmed = isLabRecordingEnabled && randomCam.realConnectorAllowed;
    if (randomCam.privacyZone === "private") {
      setSuccessMsg("❌ Grabación bloqueada: cámara en zona de privacidad");
      setTimeout(() => setSuccessMsg(null), 3000);
      return;
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const startSecs = new Date(now.getTime() - 30 * 1000);
    const endSecs = new Date(now.getTime() + 30 * 1000);

    const newClip: Clip = {
      id: "clip-" + Date.now(),
      cameraName: randomCam.name,
      cameraIp: randomCam.ip,
      timestampStart: `${formatDate(startSecs)} ${formatTime(startSecs)}`,
      timestampEnd: `${formatDate(endSecs)} ${formatTime(endSecs)}`,
      duration: "01:00",
      sizeEstimate: streamQuality === "principal" ? "38 MB" : "8 MB",
      source: isArmed ? "lab real" : "mock",
      type: recordingMode === "continuo" ? "continuo" : "evento",
      status: "disponible",
      description: `Segmento de prueba generado mediante simulación Micro-NVR en ${randomCam.name}.`,
      privacyZone: randomCam.privacyZone || "common"
    };

    onAddClip(newClip);
    setSuccessMsg("✓ Segmento local registrado");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleTriggerFfmpegCapture = () => {
    const targetCam = cameras.find(c => c.id === selectedCaptureCameraId);
    if (!targetCam) {
      alert("❌ Por favor, seleccione una cámara válida.");
      return;
    }

    if (targetCam.privacyZone === "private") {
      alert("❌ Bloqueado por directiva de privacidad: No se permite grabar cámaras en zonas privadas.");
      return;
    }

    setIsCapturing(true);
    setActiveCaptureCountdown(captureDuration);
    setCaptureStatusText(`Capturando segmento desde stream RTSP en ${targetCam.name}...`);

    fetch("/api/lab/ffmpeg/capture-clip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cameraId: targetCam.id,
        cameraName: targetCam.name,
        cameraIp: targetCam.ip,
        privacyZone: targetCam.privacyZone || "common",
        durationSeconds: captureDuration,
        streamProfile: captureQuality === "principal" ? "main" : "sub",
        reason: captureReason,
        userRole: userRole,
        realConnectorAllowed: targetCam.realConnectorAllowed
      })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.error && data.status === "Privacy Blocked") {
        setIsCapturing(false);
        setActiveCaptureCountdown(null);
        alert(`❌ Bloqueado por directiva de privacidad: No se permite grabar cámaras en zonas privadas.`);
        return;
      }
      if (data.success) {
        onAddClip(data.metadata);
        onAddAuditLog(
          "ffmpeg_capture_clip",
          `Captura segmentada de ${captureDuration}s iniciada en canal ${targetCam.name} (${data.status}). Ejecutada por ${userRole}.`
        );
      } else {
        setIsCapturing(false);
        setActiveCaptureCountdown(null);
        alert(`❌ Error al capturar: ${data.error || "Desconocido"}`);
      }
    })
    .catch((err) => {
      console.error("Error launching FFmpeg capture:", err);
      setIsCapturing(false);
      setActiveCaptureCountdown(null);
      alert("❌ Error de comunicación con el adaptador FFmpeg local.");
    });
  };

  const handleDownloadSimulation = (clipId: string) => {
    alert(`Descarga local simulada.\nSegmento [${clipId}] descargado en formato MP4 (H.264 Direct Stream Copy).\nUbicación: Descargas/ORBI_Sentinel_Clip_${clipId}.mp4`);
    onAddAuditLog(
      "download_clip",
      `Descarga/Exportación del archivo de video ${clipId}. MP4 exportado localmente por ${userRole}.`
    );
  };

  const handleProtectClip = (clipId: string) => {
    onUpdateClipStatus(clipId, "protegido");
    setSuccessMsg("✓ Evidencia protegida y bloqueada");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenAssociateModal = (clipId: string) => {
    setSelectedClipToAssociate(clipId);
    // Auto select first incident if available
    if (incidents.length > 0) {
      setSelectedIncidentId(incidents[0].id);
    } else {
      setSelectedIncidentId("");
    }
  };

  const handleConfirmAssociation = () => {
    if (!selectedClipToAssociate || !selectedIncidentId) return;
    onAssociateIncident(selectedClipToAssociate, selectedIncidentId);
    setSelectedClipToAssociate(null);
    setSuccessMsg("✓ Clip asociado al incidente correctamente");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteClip = (clipId: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este segmento de video de laboratorio?")) {
      return;
    }
    fetch(`/api/lab/clips/${clipId}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userRole,
        actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez",
        force: false
      })
    })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((d) => { throw new Error(d.error || "Error al eliminar") });
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        setSuccessMsg(data.message || "✓ Segmento eliminado correctamente");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchDbClips();
      }
    })
    .catch((err) => {
      alert("❌ Operación bloqueada: " + err.message);
    });
  };

  const handleTriggerRotation = () => {
    fetch("/api/lab/retention/rotate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userRole,
        actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
      })
    })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((d) => { throw new Error(d.error || "Error al rotar") });
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        setRotationResult(data);
        fetchDbClips();
      }
    })
    .catch((err) => {
      alert("❌ Error en la rotación: " + err.message);
    });
  };

  // Filter clips list based on search and selected filter tabs
  const filteredClips = mergedClips.filter((clip) => {
    const matchesSearch =
      clip.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.cameraIp.includes(searchQuery) ||
      (clip.description && clip.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = filterSource === "all" || clip.source === filterSource;
    const matchesType = filterType === "all" || clip.type === filterType;

    // Show only clips belonging to active cameras of current business line
    const belongsToActiveCameras = filteredCameras.some((c) => c.name === clip.cameraName);

    return matchesSearch && matchesSource && matchesType && belongsToActiveCameras;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Feedback Banner */}
      {successMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-mono text-xs animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Intro Warning and Phase Info */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          NVR Local Prototype v0.1.4
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Server className="w-6 h-6 shrink-0" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-semibold text-white">Sentinel Edge Recorder (Micro-NVR Prototipo)</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              <strong>Entorno de Almacenamiento Local Inteligente:</strong> Este módulo simula y orquesta el búfer de grabación local en la notebook/PC del cliente, configurada como Sentinel Gateway.
              {isLabRecordingEnabled ? (
                <span className="text-emerald-400 block mt-1 font-semibold">
                  ● MODO ARMADO ACTIVO: Las cámaras de laboratorio con conectores reales habilitados emularán grabación continua en sub-streams y capturarán clips destacados automáticos en su ruta lógica.
                </span>
              ) : (
                <span className="text-sky-400 block mt-1 font-semibold">
                  ○ MODO EVALUACIÓN: Funcionamiento en base a feeds simulados de manera segura sin activar almacenamiento real.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Storage Metrics & Configuration */}
        <div className="space-y-6">
          
          {/* Master Arm Toggle */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Habilitar Grabación Local</span>
              <button
                onClick={() => {
                  const newState = !isLabRecordingEnabled;
                  setIsLabRecordingEnabled(newState);
                  onAddAuditLog(
                    newState ? "arm_recording" : "disarm_recording",
                    newState
                      ? `Grabador local armado de manera segura en recinto de laboratorio por ${userRole}.`
                      : `Grabador local desarmado por operador (${userRole}).`
                  );
                }}
                className="focus:outline-none"
              >
                {isLabRecordingEnabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500 cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600 cursor-pointer" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Activa o desactiva la ingesta de video local. Cuando está desarmado, todos los feeds funcionan en modo visual directo sin persistencia en disco de clips históricos.
            </p>
            {isLabRecordingEnabled && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-300 font-mono">
                ⚠️ El modo de grabación real está limitado exclusivamente a cámaras con "realConnectorAllowed" en el Laboratorio Dahua. Las zonas privadas quedan bloqueadas automáticamente.
              </div>
            )}
          </div>

          {/* NVR Configuration Parameter Toggles */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Configuración del NVR</h4>
            </div>

            {/* Recording Mode */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Modo de Captura:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "continuo", label: "Continuo" },
                  { id: "evento", label: "Por Evento" },
                  { id: "mixto", label: "Mixto" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setRecordingMode(mode.id);
                      onAddAuditLog(
                        "set_recording_mode",
                        `Cambio de modo de captura de video a: ${mode.label} por ${userRole}.`
                      );
                    }}
                    className={`py-2 px-1 rounded-lg text-[10px] font-mono border font-bold transition-all text-center ${
                      recordingMode === mode.id
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                {recordingMode === "continuo" && "Graba 24/7 continuo. Mayor consumo de ancho de banda y disco."}
                {recordingMode === "evento" && "Graba únicamente segmentos con detecciones o marcado manual de interés."}
                {recordingMode === "mixto" && "Sub-stream de bajo FPS continuo + stream principal de alto FPS al gatillarse eventos."}
              </p>
            </div>

            {/* Retention Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Días de Retención en Disco:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 7, 15, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => {
                      setRetentionDays(days);
                      onAddAuditLog(
                        "set_retention",
                        `Establecido periodo de retención de disco en ${days} días por ${userRole}.`
                      );
                    }}
                    className={`py-2 rounded-lg text-xs font-mono border font-bold transition-all ${
                      retentionDays === days
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {days} d
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Al cumplirse el límite, el algoritmo de auto-purga sobrescribe los segmentos no protegidos.
              </p>
            </div>

            {/* Advanced Parameter Controls */}
            <div className="space-y-4 pt-3 border-t border-slate-850">
              <span className="text-xs font-mono font-bold text-white block">Parámetros Avanzados</span>

              {/* Segmentation minutes */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Tamaño del Segmento:</span>
                  <span className="text-emerald-400 font-bold">{segmentationMinutes} min</span>
                </div>
                <select
                  value={segmentationMinutes}
                  onChange={(e) => setSegmentationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                >
                  <option value={1}>1 Minuto (Acceso rápido)</option>
                  <option value={2}>2 Minutos (Balanceado)</option>
                  <option value={5}>5 Minutos (Estándar)</option>
                  <option value={10}>10 Minutos (Larga duración)</option>
                </select>
              </div>

              {/* Stream Quality Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Resolución / Calidad:</span>
                  <span className="text-emerald-400 font-bold capitalize">{streamQuality}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStreamQuality("principal")}
                    className={`py-1.5 rounded-lg text-[10px] font-mono border font-bold transition-all ${
                      streamQuality === "principal"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Principal (Full HD)
                  </button>
                  <button
                    onClick={() => setStreamQuality("secundario")}
                    className={`py-1.5 rounded-lg text-[10px] font-mono border font-bold transition-all ${
                      streamQuality === "secundario"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Sub-Stream (D1/VGA)
                  </button>
                </div>
              </div>

              {/* Audio and Privacy Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">Grabar Audio de Canales</span>
                  <button
                    onClick={() => setAudioRecordingEnabled(!audioRecordingEnabled)}
                    className="text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {audioRecordingEnabled ? (
                      <span className="text-emerald-400 font-bold">ACTIVO</span>
                    ) : (
                      <span className="text-slate-600">INACTIVO</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-rose-300">
                    <Lock className="w-3 h-3" /> Lock Zonas Privadas
                  </span>
                  <button
                    onClick={() => setPrivacyLockActive(!privacyLockActive)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300"
                  >
                    {privacyLockActive ? (
                      <span className="font-bold">BLOQUEADO</span>
                    ) : (
                      <span className="text-slate-600">BYPASS</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* HDD Gauge */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" /> HDD Local Simulador:
                </span>
                <span className="text-white font-bold">{diskUsedTb.toFixed(2)} TB / {diskTotalTb.toFixed(2)} TB</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    diskPercentage > 90 ? "bg-rose-500" : diskPercentage > 75 ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                  style={{ width: `${diskPercentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{diskPercentage}% usado ({onlineCameras.length} cámaras activas)</span>
                <span>{diskFreeTb.toFixed(2)} TB libre</span>
              </div>

              {diskPercentage > 85 && (
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] text-rose-300 font-mono leading-normal">
                  ⚠️ Espacio crítico. Se sugiere reducir los días de retención o cambiar la calidad a Sub-stream para evitar autolimpiados frecuentes.
                </div>
              )}

              {/* Trigger automated storage rotation (Módulo 1G) */}
              <div className="pt-2 border-t border-slate-900">
                <button
                  onClick={handleTriggerRotation}
                  className="w-full py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Ejecutar algoritmo de auto-rotación y eliminación segura de clips obsoletos"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Depurar Almacenamiento (Auto-Rotación)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Micro NVR hardware detail */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-2 leading-relaxed">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-sky-400" /> Host de Ingesta Local:
            </span>
            <p>
              La notebook/PC de monitoreo ejecuta un backend local ligero en puerto <code className="bg-slate-950 px-1 rounded text-sky-400">3000</code> que levanta buffers rotativos usando la memoria RAM para evitar escrituras constantes en discos de estado sólido (SSD).
            </p>
            <div className="font-mono text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-850">
              - Ruta Almacenamiento: <span className="text-slate-300">C:\ORBI_Sentinel\Storage\</span><br/>
              - Motor Ingesta: FFmpeg Segmentor CJS<br/>
              - Enlace Físico: PoE Switch LAN Interna
            </div>
          </div>

          {/* Módulo 1E: FFmpeg Capture Adapter & Clip Segmentation Panel */}
          {userRole !== "conserje" && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Video className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">Adaptador FFmpeg & Segmentación Local</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Controlled Capture Laboratory v0.1.5</p>
                </div>
              </div>

              {/* Status Diagnostic Bar */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-850 space-y-1">
                  <span className="text-slate-500 block">FFMPEG BINARY:</span>
                  <span className={`font-bold flex items-center gap-1 ${ffmpegStatus.ffmpegBinary === "detected" ? "text-emerald-400" : "text-rose-400"}`}>
                    {ffmpegStatus.ffmpegBinary === "detected" ? "✓ DETECTADO" : "✗ MISSING/MOCK"}
                  </span>
                  {ffmpegStatus.version !== "N/A" && (
                    <span className="text-slate-500 text-[9px] block truncate">{ffmpegStatus.version}</span>
                  )}
                </div>

                <div className="bg-slate-950 p-2 rounded border border-slate-850 space-y-1">
                  <span className="text-slate-500 block">ESCRITURA DISCO:</span>
                  <span className={`font-bold uppercase ${
                    ffmpegStatus.writePermission === "verified" ? "text-emerald-400" :
                    ffmpegStatus.writePermission === "mock" ? "text-sky-400" : "text-amber-400"
                  }`}>
                    {ffmpegStatus.writePermission === "verified" ? "✓ VERIFICADO" : ffmpegStatus.writePermission}
                  </span>
                  <span className="text-slate-500 text-[9px] block truncate" title={ffmpegStatus.storagePath}>
                    orbi-sentinel-lab-recordings/
                  </span>
                </div>
              </div>

              {/* Advanced Settings Check */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 space-y-1 font-mono text-[9px]">
                <span className="text-slate-500 block uppercase tracking-wider font-bold">Matriz de Seguridad Activa:</span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_REAL_CONNECTORS ? "bg-emerald-500" : "bg-slate-600"}`}></span>
                    <span className={ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_REAL_CONNECTORS ? "text-emerald-400" : "text-slate-500"}>
                      REAL_CONNS: {ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_REAL_CONNECTORS ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_RECORDING_ENABLED ? "bg-emerald-500" : "bg-slate-600"}`}></span>
                    <span className={ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_RECORDING_ENABLED ? "text-emerald-400" : "text-slate-500"}>
                      REC_ENABLED: {ffmpegStatus.safetyFlags?.ORBI_SENTINEL_LAB_RECORDING_ENABLED ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${ffmpegStatus.safetyFlags?.ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED ? "bg-emerald-500" : "bg-slate-600"}`}></span>
                    <span className={ffmpegStatus.safetyFlags?.ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED ? "text-emerald-400" : "text-slate-500"}>
                      FFMPEG_ADAPTER: {ffmpegStatus.safetyFlags?.ORBI_SENTINEL_FFMPEG_ADAPTER_ENABLED ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active countdown simulation widget */}
              {isCapturing && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2 animate-pulse">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-red-400 font-bold flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      GRABANDO SEGMENTO RTSP...
                    </span>
                    <span className="text-red-300 font-mono font-bold">{activeCaptureCountdown}s</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">{captureStatusText}</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(activeCaptureCountdown || 1) / captureDuration * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Capture controls */}
              {!isCapturing && (
                <div className="space-y-3 pt-1">
                  {/* Select Camera */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Cámara Objetivo:</label>
                    <select
                      value={selectedCaptureCameraId}
                      onChange={(e) => setSelectedCaptureCameraId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                    >
                      <option value="">-- Seleccione una cámara --</option>
                      {filteredCameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.name} ({cam.ip}) {cam.privacyZone === "private" ? "[🔒 ZONA PRIVADA - BLOQUEADA]" : ""} {!cam.realConnectorAllowed ? "[Mock Only]" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Duration & Stream profile */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Duración:</label>
                      <select
                        value={captureDuration}
                        onChange={(e) => setCaptureDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                      >
                        <option value={10}>10 Segundos</option>
                        <option value={30}>30 Segundos</option>
                        <option value={60}>60 Segundos (Máx)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Perfil Stream:</label>
                      <select
                        value={captureQuality}
                        onChange={(e) => setCaptureQuality(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                      >
                        <option value="secundario">Sub-Stream (D1)</option>
                        <option value="principal">Main Stream (1080p)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Motivo de Captura:</label>
                    <select
                      value={captureReason}
                      onChange={(e) => setCaptureReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                    >
                      <option value="test">Test de Laboratorio Controlado</option>
                      <option value="manual">Marcado Manual por Operador</option>
                      <option value="incidente">Asociado a Reporte de Incidente</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleTriggerFfmpegCapture}
                    disabled={!selectedCaptureCameraId}
                    className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl py-2 px-4 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Forzar Segmento Local Real (FFmpeg)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column (2 cols): Camera Recording Status & Clip Browser */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Matrix */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h4 className="font-sans font-semibold text-white">Canales y Armado de Grabadores de Red</h4>
              </div>
              <button 
                onClick={triggerRefresh}
                className="text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1 font-mono transition-all"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refrescar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCameras.map((cam) => {
                const isPrivate = cam.privacyZone === "private";
                const isOnline = cam.status === "Online";
                const isRealArmed = isLabRecordingEnabled && cam.realConnectorAllowed;

                return (
                  <div key={cam.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5 truncate max-w-[200px]">
                      <span className="font-bold text-white block truncate">
                        {cam.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        IP: {cam.ip} • QoS: {cam.resolution}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isPrivate ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[8px] font-bold">
                          🔒 PRIVADA (Bloqueado)
                        </span>
                      ) : !isOnline ? (
                        <span className="bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-bold">
                          ❌ INACTIVA (Offline)
                        </span>
                      ) : isRealArmed ? (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[8px] font-bold animate-pulse">
                          🔴 GRABACIÓN REAL
                        </span>
                      ) : (
                        <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[8px] font-bold">
                          🔵 GRABACIÓN MOCK
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Segmented Clips list */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-emerald-400" />
                <h4 className="font-sans font-semibold text-white">Explorador de Segmentos de Evidencia</h4>
              </div>

              {/* Simulation generator */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateMockClip}
                  className="py-1.5 px-3 rounded bg-slate-950 hover:bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Forzar segmento local</span>
                </button>
              </div>
            </div>

            {/* Filtering bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar segmento por cámara, IP..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Source filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500 shrink-0">Origen:</span>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 text-slate-300 text-[10px] rounded px-2 py-1 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Cualquiera</option>
                  <option value="lab real">Lab Real</option>
                  <option value="mock">Mocks</option>
                </select>
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500 shrink-0">Tipo:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 text-slate-300 text-[10px] rounded px-2 py-1 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Cualquiera</option>
                  <option value="continuo">Continuo</option>
                  <option value="evento">Evento</option>
                </select>
              </div>
            </div>

            {/* Clips Listing Table */}
            {filteredClips.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filteredClips.map((clip) => {
                  const hasIncident = !!clip.associatedIncidentId;
                  const associatedIncident = incidents.find((inc) => inc.id === clip.associatedIncidentId);

                  return (
                    <div
                      key={clip.id}
                      className={`p-3 bg-slate-950/60 hover:bg-slate-950 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono ${
                        clip.status === "protegido" ? "border-emerald-500/20 bg-emerald-950/5" : "border-slate-850"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-sans font-bold text-white text-sm">{clip.cameraName}</span>
                          <span className="text-[9px] bg-slate-850 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                            IP: {clip.cameraIp}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold ${
                            clip.source === "lab real"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          }`}>
                            {clip.source}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold ${
                            clip.type === "evento"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}>
                            {clip.type}
                          </span>
                          {clip.status === "protegido" && (
                            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> EVIDENCIA PROTEGIDA
                            </span>
                          )}
                          {/* Lifecycle State Tag */}
                          {clip.lifecycleState && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold flex items-center gap-0.5 ${
                              clip.lifecycleState === "Privacy Locked" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              clip.lifecycleState === "Protected Evidence" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              clip.lifecycleState === "Expired" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                              clip.lifecycleState === "Incident Linked" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                              clip.lifecycleState === "Export Package Generated" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                              "bg-slate-800 text-slate-300 border-slate-700"
                            }`}>
                              ● {clip.lifecycleState}
                            </span>
                          )}
                          {/* Remaining Days Tag */}
                          {clip.remainingDays !== undefined && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
                              clip.remainingDays === 9999 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              clip.remainingDays <= 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              clip.remainingDays <= 3 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              "bg-slate-900 text-slate-400 border-slate-800"
                            }`}>
                              {clip.remainingDays === 9999 ? "∞ Retención Permanente" : `${clip.remainingDays}d Restantes`}
                            </span>
                          )}
                          {/* Integrity Status Tag */}
                          {clip.integrityStatus && clip.integrityStatus !== "pending" && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
                              clip.integrityStatus === "verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                              {clip.integrityStatus === "verified" ? "✓ Integridad OK" : "✗ Error Integridad"}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 space-x-2">
                          <span>Desde: <strong className="text-slate-300">{clip.timestampStart}</strong></span>
                          <span>•</span>
                          <span>Hasta: <strong className="text-slate-300">{clip.timestampEnd}</strong></span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                          <span>Duración: {clip.duration}</span>
                          <span>•</span>
                          <span>Tamaño: {clip.sizeEstimate}</span>
                          {clip.retentionPolicy && (
                            <>
                              <span>•</span>
                              <span>Política: <strong className="text-slate-400 capitalize">{clip.retentionPolicy.replace('_', ' ')}</strong></span>
                            </>
                          )}
                          {clip.description && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-400 truncate max-w-xs" title={clip.description}>
                                {clip.description}
                              </span>
                            </>
                          )}
                        </div>
 
                        {/* Associated Incident Tag */}
                        {hasIncident && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-2 py-0.5 rounded-md w-fit">
                            <Tag className="w-3 h-3" />
                            <span>Vincunlado a Incidente:</span>
                            <span className="font-bold text-slate-300">
                              {associatedIncident ? `[${associatedIncident.type}] ${associatedIncident.observations}` : `ID: ${clip.associatedIncidentId}`}
                            </span>
                          </div>
                        )}
                      </div>
 
                      {/* Actions toolbar */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {/* Play & Inspect Button (Secure Playback Center trigger) */}
                        <button
                          onClick={() => setSelectedPlaybackClip(clip)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded border border-emerald-500/20 transition-all text-[10px] flex items-center gap-1 font-bold shadow-sm"
                          title="Abrir Secure Playback Center"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Reproducir</span>
                        </button>
 
                        {/* Associate Incident Button */}
                        {!hasIncident && (
                          <button
                            onClick={() => handleOpenAssociateModal(clip.id)}
                            className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-transparent hover:border-slate-800 transition-all text-[10px] flex items-center gap-1"
                            title="Asociar a Incidente registrado"
                          >
                            <Tag className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Vincular</span>
                          </button>
                        )}
 
                        {/* Protect evidence button */}
                        {clip.status !== "protegido" && (
                          <button
                            onClick={() => handleProtectClip(clip.id)}
                            className="p-1.5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded border border-transparent hover:border-emerald-500/20 transition-all text-[10px] flex items-center gap-1"
                            title="Bloquear borrado automático"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline font-semibold">Proteger</span>
                          </button>
                        )}
 
                        {/* Download button */}
                        <button 
                          onClick={() => handleDownloadSimulation(clip.id)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-transparent hover:border-slate-800 transition-all text-[10px] flex items-center gap-1"
                          title="Descargar clip MP4"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Exportar</span>
                        </button>

                        {/* Secure Delete Button (Módulo 1G) */}
                        {userRole !== "conserje" && (
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded border border-transparent hover:border-rose-500/20 transition-all text-[10px] flex items-center gap-1"
                            title="Eliminar clip del almacenamiento"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="hidden sm:inline text-rose-400 font-bold">Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span>No hay segmentos registrados que coincidan con la búsqueda.</span>
              </div>
            )}
          </div>

          {/* Incident Association Pop-up Modal */}
          {selectedClipToAssociate && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-sans font-bold text-white">Vincular Segmento a Incidente</h4>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Seleccione el reporte del incidente activo para asociar este clip de video como evidencia protegida permanente en el reporte de laboratorio.
                </p>

                {incidents.length > 0 ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Incidente Asociado:</label>
                    <select
                      value={selectedIncidentId}
                      onChange={(e) => setSelectedIncidentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 font-mono focus:outline-none focus:border-emerald-500"
                    >
                      {incidents.map((inc) => (
                        <option key={inc.id} value={inc.id}>
                          [{inc.type}] {inc.observations} ({inc.timestamp})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 font-mono">
                    ⚠️ No existen reportes de incidentes activos registrados. Por favor, cree un incidente en el "Incident Center" antes de realizar vinculaciones.
                  </div>
                )}

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    onClick={() => setSelectedClipToAssociate(null)}
                    className="px-4 py-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAssociation}
                    disabled={incidents.length === 0}
                    className="px-4 py-1.5 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-mono text-xs font-bold disabled:opacity-50"
                  >
                    Confirmar Vínculo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sentinel Secure Playback Center Modal Overlay */}
          {selectedPlaybackClip && (
            <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-lg text-white flex items-center gap-2">
                        Sentinel Secure Playback Center
                        <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono uppercase">
                          v0.1.6-playback-export
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Revisión técnica local de segmentos de evidencia • Recinto: {selectedPlaybackClip.cameraName}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPlaybackClip(null);
                      setPlaybackMetadata(null);
                    }}
                    className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                  >
                    Cerrar Panel
                  </button>
                </div>

                {/* Modal Content Grid (2 Columns: Player / Metadata & Tools) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Video Player State (6 cols) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="aspect-video bg-slate-950 rounded-xl border border-slate-850 overflow-hidden relative flex flex-col justify-center items-center shadow-inner">
                      {userRole === "conserje" ? (
                        /* Conserje Restricted Playback State */
                        <div className="p-6 text-center space-y-3">
                          <Lock className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
                          <span className="text-xs font-mono font-bold text-rose-400 block uppercase tracking-wider">
                            ACCESO RESTRINGIDO (ROL CONSERJE)
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto font-mono">
                            La visualización de grabaciones de evidencia está deshabilitada para el perfil Conserjería. Solicite soporte o revisión al Administrador o Técnico de Terreno.
                          </p>
                        </div>
                      ) : selectedPlaybackClip.privacyZone === "private" ? (
                        /* Privacy Shield Restricted Playback State */
                        <div className="p-6 text-center space-y-3">
                          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
                          <span className="text-xs font-mono font-bold text-rose-400 block uppercase tracking-wider">
                            PRIVACY SHIELD COMPLIANCE BLOCK
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto font-mono">
                            Este segmento de video corresponde a una <strong>ZONA PRIVADA</strong> (Privacy Shield). La reproducción física y la exportación de video están bloqueadas de forma irreversible por directivas de privacidad.
                          </p>
                        </div>
                      ) : (
                        /* Playback / Video Stream Element */
                        <>
                          {/* Watermark overlay */}
                          <div className="absolute top-2.5 left-2.5 z-10 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1 pointer-events-none select-none">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            ORBI SENTINEL IA LAB COMPLIANT
                          </div>
                          
                          <div className="absolute bottom-2.5 right-2.5 z-10 bg-slate-950/70 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400 pointer-events-none select-none">
                            {selectedPlaybackClip.cameraIp}
                          </div>

                          <video
                            src={`/api/lab/clips/${selectedPlaybackClip.id}/stream?role=${userRole}`}
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              console.log("Stream redirect fallback active or file is missing.");
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* Status Badges List */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-slate-500">Origen del Clip:</span>
                        <span className={`font-bold capitalize ${selectedPlaybackClip.source === "lab real" ? "text-red-400" : "text-sky-400"}`}>
                          {selectedPlaybackClip.source}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-slate-500">Zonificación Privacidad:</span>
                        <span className={`font-bold uppercase ${
                          selectedPlaybackClip.privacyZone === "private" ? "text-rose-400" :
                          selectedPlaybackClip.privacyZone === "common" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {selectedPlaybackClip.privacyZone || "common"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-slate-500">Protección de Evidencia:</span>
                        <span className={`font-bold uppercase ${selectedPlaybackClip.status === "protegido" ? "text-emerald-400" : "text-slate-400"}`}>
                          {selectedPlaybackClip.status === "protegido" ? "✓ PROTEGIDO" : "LIBRE / ROTATIVO"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Criptografía SHA-256:</span>
                        <span className="text-slate-300 font-bold truncate max-w-[180px] hover:text-white cursor-pointer" title={playbackMetadata?.sha256}>
                          {playbackMetadata?.sha256 || "Cargando..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tabbed controls (6 cols) */}
                  <div className="lg:col-span-6 space-y-4 flex flex-col h-full justify-between">
                    
                    {/* Tabs selection bar */}
                    <div className="flex border-b border-slate-800 p-0.5 bg-slate-950 rounded-lg">
                      <button
                        onClick={() => setActivePlaybackTab("metadata")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase font-bold rounded-md transition-all ${
                          activePlaybackTab === "metadata"
                            ? "bg-slate-800 text-emerald-400 font-bold"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Metadatos
                      </button>
                      <button
                        onClick={() => setActivePlaybackTab("associate")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase font-bold rounded-md transition-all ${
                          activePlaybackTab === "associate"
                            ? "bg-slate-800 text-emerald-400 font-bold"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Vincular
                      </button>
                      <button
                        onClick={() => setActivePlaybackTab("export")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase font-bold rounded-md transition-all ${
                          activePlaybackTab === "export"
                            ? "bg-slate-800 text-emerald-400 font-bold"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Firma & Paquete
                      </button>
                      <button
                        onClick={() => setActivePlaybackTab("audit")}
                        className={`flex-1 py-1.5 text-[10px] font-mono uppercase font-bold rounded-md transition-all ${
                          activePlaybackTab === "audit"
                            ? "bg-slate-800 text-emerald-400 font-bold"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Auditoría
                      </button>
                    </div>

                    {/* Dynamic Tab Body */}
                    <div className="flex-1 bg-slate-950/30 border border-slate-850 p-4 rounded-xl min-h-[250px] overflow-y-auto max-h-[300px]">
                      
                      {activePlaybackTab === "metadata" && (
                        <div className="space-y-4 text-xs font-mono">
                          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                            <Info className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white uppercase text-[11px]">Metadatos Técnicos del Segmento</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">Cámara:</span>
                              <span className="text-slate-200 font-sans font-bold">{selectedPlaybackClip.cameraName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">IP Stream:</span>
                              <span className="text-slate-200">{selectedPlaybackClip.cameraIp}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">Inicio de Captura:</span>
                              <span className="text-slate-200">{selectedPlaybackClip.timestampStart}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">Término de Captura:</span>
                              <span className="text-slate-200">{selectedPlaybackClip.timestampEnd}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">Duración:</span>
                              <span className="text-slate-200">{selectedPlaybackClip.duration}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px]">Peso Estimado:</span>
                              <span className="text-slate-200">{selectedPlaybackClip.sizeEstimate}</span>
                            </div>
                          </div>

                          {/* Integrity Checking block */}
                          <div className="pt-3 border-t border-slate-850 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-white uppercase">Verificación Integridad Co-op:</span>
                              <button
                                onClick={() => {
                                  setIsVerifyingIntegrity(true);
                                  setIntegrityVerificationResult(null);
                                  fetch(`/api/lab/clips/${selectedPlaybackClip.id}/verify-integrity`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      userRole,
                                      actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
                                    })
                                  })
                                  .then((res) => {
                                    if (!res.ok) {
                                      return res.json().then((d) => { throw new Error(d.error || "Error al verificar") });
                                    }
                                    return res.json();
                                  })
                                  .then((data) => {
                                    setIsVerifyingIntegrity(false);
                                    if (data.success) {
                                      const hash = data.metadata.sha256 ? data.metadata.sha256.substring(0, 24) + "..." : "N/A";
                                      setIntegrityVerificationResult(
                                        data.metadata.integrityStatus === "verified"
                                          ? `✓ Integridad Criptográfica Verificada: El hash SHA-256 coincidente (${hash}) coincide plenamente con los metadatos. No se detectan alteraciones físicas.`
                                          : `⚠️ Advertencia de integridad: Archivo físico .mp4 ausente en disco (File Missing) o corrupto.`
                                      );
                                      setPlaybackMetadata(data.metadata);
                                      fetchDbClips();
                                    }
                                  })
                                  .catch((err) => {
                                    setIsVerifyingIntegrity(false);
                                    setIntegrityVerificationResult("❌ Fallo en la verificación de integridad: " + err.message);
                                  });
                                }}
                                disabled={isVerifyingIntegrity}
                                className="text-[10px] font-mono px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded hover:bg-emerald-400 transition-all active:scale-[0.98]"
                              >
                                {isVerifyingIntegrity ? "Calculando..." : "Calcular SHA-256"}
                              </button>
                            </div>

                            {isVerifyingIntegrity && (
                              <div className="text-[10px] text-slate-400 animate-pulse">
                                Ejecutando firma criptográfica local HMAC-SHA256 sobre archivos binarios...
                              </div>
                            )}

                            {integrityVerificationResult && (
                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded leading-normal">
                                {integrityVerificationResult}
                              </div>
                            )}
                          </div>

                          {/* Policy Selector block (Módulo 1G) */}
                          <div className="pt-3 border-t border-slate-850 space-y-2">
                            <label className="text-[11px] font-bold text-white uppercase block">Política de Retención del Clip:</label>
                            <div className="flex gap-2">
                              <select
                                value={playbackMetadata?.retentionPolicy || selectedPlaybackClip.retentionPolicy || "7_days"}
                                onChange={(e) => {
                                  const newPolicy = e.target.value;
                                  fetch(`/api/lab/clips/${selectedPlaybackClip.id}/policy`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      policy: newPolicy,
                                      userRole,
                                      actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
                                    })
                                  })
                                  .then((res) => res.json())
                                  .then((data) => {
                                    if (data.success) {
                                      setPlaybackMetadata(data.metadata);
                                      fetchDbClips();
                                      setSuccessMsg("✓ Política de retención actualizada");
                                      setTimeout(() => setSuccessMsg(null), 3000);
                                    } else {
                                      alert("Error: " + data.error);
                                    }
                                  });
                                }}
                                className="flex-1 bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded p-1.5 font-mono focus:outline-none focus:border-emerald-500"
                              >
                                <option value="1_day">1 Día (Rápido)</option>
                                <option value="3_days">3 Días (Corto)</option>
                                <option value="7_days">7 Días (Estándar)</option>
                                <option value="15_days">15 Días (Medio)</option>
                                <option value="30_days">30 Días (Extendido)</option>
                                <option value="manual">90 Días (Manual/Pericial)</option>
                                <option value="protected">Protegido (Permanente)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {activePlaybackTab === "associate" && (
                        <div className="space-y-4 text-xs font-mono">
                          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white uppercase text-[11px]">Asociar a Reporte de Incidente</span>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-normal">
                            Vincule este fragmento de video a un reporte de incidente del Incident Center para bloquear su borrado y transformarlo en evidencia permanente.
                          </p>

                          {incidents.length > 0 ? (
                            <div className="space-y-3 pt-2">
                              <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1">Seleccionar Incidente:</label>
                                <select
                                  value={selectedIncidentId}
                                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded p-2 focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="">-- Seleccione incidente --</option>
                                  {incidents.map((inc) => (
                                    <option key={inc.id} value={inc.id}>
                                      [{inc.type}] {inc.observations.substring(0, 50)}...
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => {
                                  if (!selectedIncidentId) {
                                    alert("Seleccione un incidente");
                                    return;
                                  }
                                  const matchedInc = incidents.find(i => i.id === selectedIncidentId);
                                  
                                  fetch(`/api/lab/clips/${selectedPlaybackClip.id}/associate`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      incidentId: selectedIncidentId,
                                      incidentType: matchedInc?.type || "Otro",
                                      userRole,
                                      actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
                                    })
                                  })
                                  .then(res => res.json())
                                  .then(data => {
                                    if (data.success) {
                                      onAssociateIncident(selectedPlaybackClip.id, selectedIncidentId);
                                      setPlaybackMetadata(data.metadata);
                                      fetchDbClips();
                                      alert("✓ Fragmento vinculado al incidente con éxito.");
                                    } else {
                                      alert("Error: " + data.error);
                                    }
                                  });
                                }}
                                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-center transition-all"
                              >
                                Confirmar Asociación & Proteger
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] rounded leading-normal">
                              ⚠️ No existen incidentes registrados en el "Incident Center". Cree un incidente antes de vincular evidencia.
                            </div>
                          )}
                        </div>
                      )}

                      {activePlaybackTab === "export" && (
                        <div className="space-y-4 text-xs font-mono">
                          <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                            <Download className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white uppercase text-[11px]">Evidence Package Builder</span>
                          </div>

                          {userRole === "conserje" ? (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] rounded leading-normal">
                              🔒 ACCESO DENEGADO: El rol Conserjería tiene estrictamente prohibido realizar empaquetados o exportaciones de video de seguridad.
                            </div>
                          ) : selectedPlaybackClip.privacyZone === "private" ? (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] rounded leading-normal">
                              🔒 BLOQUEADO: No se permite exportar paquetes de evidencia de cámaras correspondientes a ZONAS PRIVADAS.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Construye un paquete de evidencia firmado. Redacta credenciales, contraseñas e IPs internas para análisis legal externo.
                              </p>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 uppercase block">Justificación de la Exportación:</label>
                                <input
                                  type="text"
                                  value={exportJustification}
                                  onChange={(e) => setExportJustification(e.target.value)}
                                  placeholder="Ej: Análisis técnico por incidente en zona este..."
                                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  if (exportJustification.trim().length < 5) {
                                    alert("Por favor, ingrese una justificación técnica o de seguridad detallada de al menos 5 caracteres.");
                                    return;
                                  }
                                  setIsGeneratingPackage(true);
                                  fetch(`/api/lab/clips/${selectedPlaybackClip.id}/export`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      reason: exportJustification,
                                      userRole,
                                      actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
                                    })
                                  })
                                  .then(res => res.json())
                                  .then(data => {
                                    setIsGeneratingPackage(false);
                                    if (data.success) {
                                      setGeneratedPackage(data.metadata);
                                      // reload clip metadata
                                      fetch(`/api/lab/clips/${selectedPlaybackClip.id}/metadata`)
                                        .then(res => res.json())
                                        .then(m => { if (m.success) setPlaybackMetadata(m.metadata) });
                                      fetchDbClips();
                                    } else {
                                      alert("Error: " + data.error);
                                    }
                                  })
                                  .catch(e => {
                                    setIsGeneratingPackage(false);
                                    console.error(e);
                                  });
                                }}
                                disabled={isGeneratingPackage}
                                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all rounded text-center"
                              >
                                {isGeneratingPackage ? "Generando paquete firmado..." : "Generar Paquete de Evidencia Firmado"}
                              </button>

                              {generatedPackage && (
                                <div className="space-y-2 pt-2 border-t border-slate-850">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase">✓ Paquete Generado: {generatedPackage.packageId}</span>
                                    <button
                                      onClick={() => {
                                        const blob = new Blob([JSON.stringify(generatedPackage, null, 2)], { type: "application/json" });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `ORBI_Evidence_Package_${generatedPackage.packageId}.json`;
                                        a.click();
                                      }}
                                      className="text-[9px] text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded animate-pulse"
                                    >
                                      Descargar JSON
                                    </button>
                                  </div>
                                  <pre className="p-2 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-400 overflow-x-auto max-h-[120px]">
                                    {JSON.stringify(generatedPackage, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {activePlaybackTab === "audit" && (
                      <div className="space-y-4 text-xs font-mono">
                        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white uppercase text-[11px]">Historial de Auditoría Local (Immutable)</span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {playbackMetadata?.auditTrail && playbackMetadata.auditTrail.length > 0 ? (
                            playbackMetadata.auditTrail.map((log: any, index: number) => (
                              <div key={index} className="p-2 bg-slate-950/80 rounded border border-slate-850 space-y-1">
                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-emerald-400 font-bold">[{log.action.toUpperCase()}]</span>
                                  <span className="text-slate-500">{log.timestamp}</span>
                                </div>
                                <p className="text-[10px] text-slate-300">{log.reason}</p>
                                <div className="text-[9px] text-slate-500">
                                  Actor: <strong className="text-slate-400">{log.actorAlias}</strong> ({log.actorRole}) • Result: <span className="text-emerald-500">{log.result}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-500 text-[10px]">
                              No hay registros de auditoría aún para este segmento.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Footer Controls inside Tab */}
                  <div className="pt-4 border-t border-slate-850 flex justify-between gap-3 text-xs font-mono shrink-0">
                    <button
                      onClick={() => {
                        if (selectedPlaybackClip.status === "protegido") {
                          alert("Este segmento ya se encuentra protegido.");
                          return;
                        }
                        fetch(`/api/lab/clips/${selectedPlaybackClip.id}/protect`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userRole,
                            actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez"
                          })
                        })
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            onUpdateClipStatus(selectedPlaybackClip.id, "protegido");
                            setPlaybackMetadata(data.metadata);
                            fetchDbClips();
                            alert("✓ Segmento protegido de forma permanente.");
                          }
                        });
                      }}
                      disabled={selectedPlaybackClip.status === "protegido"}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-all text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedPlaybackClip.status === "protegido" ? "Evidencia Protegida" : "Proteger Evidencia"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (userRole === "conserje") {
                          alert("Acceso denegado: El rol Conserjería no tiene permisos de descarga.");
                          return;
                        }
                        if (selectedPlaybackClip.privacyZone === "private") {
                          alert("Acceso bloqueado: No se permite exportar cámaras de zonas privadas.");
                          return;
                        }
                        // download trigger
                        const clipName = `ORBI_Evidence_Clip_${selectedPlaybackClip.id}.mp4`;
                        alert(`Exportación de video autorizada por rol ${userRole}.\nJustificación registrada.\nArchivo: ${clipName}\nPeso: ${selectedPlaybackClip.sizeEstimate}\nDescarga completada en el Sandbox.`);
                        
                        // call API to log audit download
                        fetch(`/api/lab/clips/${selectedPlaybackClip.id}/audit`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "clip.export.package.generated",
                            actorRole: userRole,
                            actorAlias: userRole === "tecnico" ? "Patricio Solar" : "Sofía Martínez",
                            result: "success",
                            reason: "Exportación manual de video de seguridad"
                          })
                        })
                        .then(() => {
                          fetch(`/api/lab/clips/${selectedPlaybackClip.id}/metadata`)
                            .then(res => res.json())
                            .then(m => { if (m.success) setPlaybackMetadata(m.metadata); fetchDbClips(); });
                        });
                      }}
                      disabled={userRole === "conserje" || selectedPlaybackClip.privacyZone === "private"}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                      <span>Exportar Video (.mp4)</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Rotation Result Overlay Modal (Módulo 1G) */}
          {rotationResult && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <h4 className="font-sans font-bold text-white">Reporte de Rotación y Limpieza Local</h4>
                </div>
                
                <p className="leading-relaxed">
                  {rotationResult.message}
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modo de Operación:</span>
                    <span className={rotationResult.deletedReal ? "text-red-400 font-bold" : "text-sky-400 font-bold"}>
                      {rotationResult.deletedReal ? "DEPURACIÓN REAL (FS UNLINK)" : "SIMULACIÓN LÓGICA"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clips Expirados Depurados:</span>
                    <span className="text-white font-bold">{rotationResult.rotatedCount} clips</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clips Protegidos Retenidos:</span>
                    <span className="text-emerald-400 font-bold">{rotationResult.blockedCount} clips</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Espacio Liberado Estimado:</span>
                    <span className="text-amber-400 font-bold">{rotationResult.potentialFreedSpace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Espacio de Evidencia Protegido:</span>
                    <span className="text-emerald-400 font-bold">{rotationResult.protectedSpaceUsed}</span>
                  </div>
                </div>

                {rotationResult.rotatedClips && rotationResult.rotatedClips.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Historial de depuración:</span>
                    <div className="max-h-[100px] overflow-y-auto bg-slate-950/40 p-2 rounded border border-slate-850 text-[10px] space-y-1">
                      {rotationResult.rotatedClips.map((c: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-slate-400">
                          <span>• {c.cameraName || "Cámara"} ({c.id})</span>
                          <span className="text-rose-400">Expulsado</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setRotationResult(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all active:scale-[0.98]"
                  >
                    Cerrar Reporte
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
