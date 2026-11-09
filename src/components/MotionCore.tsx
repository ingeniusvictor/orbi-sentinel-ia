import React, { useState, useEffect, useRef } from "react";
import { MotionEvent, Park } from "../types";
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  Filter,
  Search,
  Cpu,
  Camera,
  Volume2,
  VolumeX,
  ScanFace,
  Car,
  Sparkles,
  Play,
  Radio
} from "lucide-react";

interface MotionCoreProps {
  events: MotionEvent[];
  setEvents: React.Dispatch<React.SetStateAction<MotionEvent[]>>;
  parks: Park[];
}

export default function MotionCore({ events, setEvents, parks }: MotionCoreProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterIntensity, setFilterIntensity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados del Motor Frigate + Centinela Lumia (qwen3.5:4b-fast)
  const [selectedZoneId, setSelectedZoneId] = useState<string>("zone-porton-lpr");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lumiaSentinelActive, setLumiaSentinelActive] = useState<boolean>(false);
  const [lumiaVoiceEnabled, setLumiaVoiceEnabled] = useState<boolean>(true);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [lastLumiaResult, setLastLumiaResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleProcessEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, processed: true } : evt))
    );
  };

  const getParkName = (parkId: string) => {
    const park = parks.find((p) => p.id === parkId);
    return park ? park.name : "Laboratorio General";
  };

  // Síntesis de voz nativa para cuando Lumia decide HABLAR
  const speakLumia = (text: string) => {
    if (!lumiaVoiceEnabled || !text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-CL";
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Encender/Apagar cámara local para pruebas reales de visión con qwen3.5:4b-fast
  const toggleWebcam = async () => {
    if (webcamActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      setWebcamActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err) {
      alert("No se pudo acceder a la webcam local. Se usará el simulador de fotogramas de ORBI.");
    }
  };

  // Capturar frame real si la webcam está encendida
  const captureFrameBase64 = (): string | null => {
    if (!webcamActive || !videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  };

  // Ejecutar análisis Frigate + Qwen3.5:4b-fast
  const triggerFrigateAnalysis = async (mode: "zone_breach" | "presence_heartbeat" | "lpr_scan", customContext?: string) => {
    setIsAnalyzing(true);
    try {
      const frameB64 = captureFrameBase64();
      const res = await fetch("/api/frigate/analyze-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: mode === "presence_heartbeat" ? "zone-consola-operador" : selectedZoneId,
          triggerMode: mode,
          imageBase64: frameB64,
          simulatedContext:
            customContext ||
            (mode === "lpr_scan"
              ? "Camioneta blanca deteniéndose en el portón de acceso. Patente visible: GKJW-82. Conductor esperando apertura."
              : mode === "presence_heartbeat"
              ? "El operador Víctor está sentado frente a la laptop revisando código y telemetría con normalidad."
              : "Persona detectada ingresando al polígono perimetral de inversores solares fuera de horario.")
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastLumiaResult(data);

        // Si Lumia decide HABLAR, reproducir por voz y agregar a la bitácora de eventos
        if (data.lumiaAction === "HABLAR" && data.lumiaSpeech) {
          speakLumia(data.lumiaSpeech);
        }

        const newEvt: MotionEvent = {
          id: "evt-frigate-" + Date.now(),
          timestamp: new Date().toLocaleTimeString("es-CL"),
          parkId: "dahua-lab",
          cameraName: data.zoneName || "CAM-Frigate-Zone",
          type: data.detectedType || "Persona",
          confidence: data.confidence || 95,
          description: `${data.technicalSummary}${data.licensePlate ? ` | Patente LPR: [${data.licensePlate}]` : ""}${data.faceIdentity ? ` | ID Facial: [${data.faceIdentity}]` : ""} | Lumia: [${data.lumiaAction}]`,
          processed: data.lumiaAction === "SILENCIO",
          intensity: mode === "zone_breach" ? "Crítico" : mode === "lpr_scan" ? "Medio" : "Bajo",
          zoneName: data.zoneName,
          licensePlate: data.licensePlate,
          faceIdentity: data.faceIdentity,
          lumiaAction: data.lumiaAction,
          lumiaSpeech: data.lumiaSpeech
        };

        setEvents((prev) => [newEvt, ...prev]);
      }
    } catch (e) {
      console.error("Error en análisis Frigate/Lumia:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Watchdog periódico estilo Centinela: valida presencia cada 35 segundos
  useEffect(() => {
    if (!lumiaSentinelActive) return;
    const timer = setInterval(() => {
      triggerFrigateAnalysis("presence_heartbeat");
    }, 35000);
    return () => clearInterval(timer);
  }, [lumiaSentinelActive, webcamActive]);

  const filteredEvents = events.filter((evt) => {
    const matchesType = filterType === "all" || evt.type === filterType;
    const matchesIntensity = filterIntensity === "all" || evt.intensity === filterIntensity;
    const matchesSearch =
      evt.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesIntensity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Overview and Stats (Diseño Original Intacto) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Incidentes Pendientes</span>
            <div className="text-2xl font-bold text-white mt-1">
              {events.filter((e) => !e.processed).length}
            </div>
            <span className="text-[10px] text-amber-400 font-mono mt-1 block">Requieren Validación Técnica</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850 text-amber-400 rounded-lg">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Alertas de Intrusión</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {events.filter((e) => e.type === "Intrusión").length}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Eventos Críticos Registrados</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850 text-rose-400 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Motor Frigate + Lumia Vision</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {lastLumiaResult?.evalRateTokensSec ? `${lastLumiaResult.evalRateTokensSec} t/s` : "qwen3.5:4b-fast"}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              100% GPU GTX 1650 Ti • Zonas + LPR + Rostros
            </span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850 text-emerald-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NUEVO BLOQUE: CONSOLA FRIGATE POLYGON ZONES + PUENTE DE VISIÓN LUMIA */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                FRIGATE NVR CORE + LUMIA VISION
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                MODELO: qwen3.5:4b-fast
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono mt-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              ANALÍTICA POR ZONAS POLIGONALES, PATENTES (LPR) Y CENTINELA SILENCIOSO DE LUMIA
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={toggleWebcam}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all ${
                webcamActive
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              {webcamActive ? "Cámara Activa" : "Conectar Webcam Local"}
            </button>

            <button
              onClick={() => setLumiaSentinelActive(!lumiaSentinelActive)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all ${
                lumiaSentinelActive
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${lumiaSentinelActive ? "animate-ping" : ""}`} />
              {lumiaSentinelActive ? "Centinela 35s: ON" : "Centinela Periódico: OFF"}
            </button>

            <button
              onClick={() => setLumiaVoiceEnabled(!lumiaVoiceEnabled)}
              className={`p-1.5 rounded-lg border transition-all ${
                lumiaVoiceEnabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
              title="Activar/Silenciar voz de Lumia"
            >
              {lumiaVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Vista de Cámara + Polígono Frigate Superpuesto */}
          <div className="lg:col-span-5 relative aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${webcamActive ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!webcamActive && (
              <div className="text-center p-4 space-y-1 font-mono">
                <Eye className="w-8 h-8 text-emerald-500/40 mx-auto" />
                <span className="text-xs text-slate-300 font-bold block">VISOR POLIGONAL FRIGATE</span>
                <span className="text-[10px] text-slate-500 block">
                  Usa "Conectar Webcam Local" para analizar tu cámara real con qwen3.5:4b-fast o dispara una prueba abajo.
                </span>
              </div>
            )}

            {/* Overlay SVG del Polígono de Zona estilo Frigate */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="12,25 88,25 94,92 6,92"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="2,1"
              />
            </svg>
            <div className="absolute top-2 left-2 bg-slate-950/85 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
              ROI ACTIVA: {selectedZoneId.toUpperCase()}
            </div>
          </div>

          {/* Controles de Disparo y Veredicto de Lumia */}
          <div className="lg:col-span-7 space-y-3 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                disabled={isAnalyzing}
                onClick={() => triggerFrigateAnalysis("zone_breach")}
                className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                  <span>1. Cruce de Zona</span>
                  <ScanFace className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Dispara foto inmediata + ID Facial y alerta de voz Lumia
                </span>
              </button>

              <button
                disabled={isAnalyzing}
                onClick={() => triggerFrigateAnalysis("lpr_scan")}
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                  <span>2. Lectura LPR Chile</span>
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Extrae patente vehicular y valida acceso en portón
                </span>
              </button>

              <button
                disabled={isAnalyzing}
                onClick={() => triggerFrigateAnalysis("presence_heartbeat")}
                className="p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between text-sky-400 font-bold text-xs">
                  <span>3. Chequeo Silencioso</span>
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Valida usuario frente a PC (Lumia calla si todo es normal)
                </span>
              </button>
            </div>

            {/* Respuesta en vivo del cerebro Qwen3.5:4b-fast */}
            <div className="bg-slate-950/90 border border-slate-850 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  ÚLTIMA DECISIÓN DE LUMIA VISION ({lastLumiaResult?.engine || "Esperando evento..."})
                </span>
                {lastLumiaResult && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      lastLumiaResult.lumiaAction === "SILENCIO"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    DECISIÓN: {lastLumiaResult.lumiaAction}
                  </span>
                )}
              </div>

              {isAnalyzing ? (
                <p className="text-emerald-400 animate-pulse text-[11px]">
                  Analizando fotograma en GTX 1650 Ti con qwen3.5:4b-fast...
                </p>
              ) : lastLumiaResult ? (
                <div className="space-y-1 text-[11px]">
                  <p className="text-slate-200">{lastLumiaResult.technicalSummary}</p>
                  {lastLumiaResult.lumiaSpeech && (
                    <p className="text-emerald-400 font-bold">
                      🗣️ Lumia dice: "{lastLumiaResult.lumiaSpeech}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-slate-400">
                    {lastLumiaResult.licensePlate && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-400 font-bold">
                        PATENTE LPR: {lastLumiaResult.licensePlate}
                      </span>
                    )}
                    {lastLumiaResult.faceIdentity && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-sky-400 font-bold">
                        BIOMETRÍA: {lastLumiaResult.faceIdentity}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px]">
                  Presiona cualquiera de los 3 botones de arriba (o activa tu webcam) para probar el disparo por zona y el juicio autónomo de Lumia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Original Intacto) */}
      <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por cámara, patente o detalle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">Clasificación:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="Persona">Persona</option>
              <option value="Vehículo">Vehículo</option>
              <option value="Intrusión">Intrusión</option>
              <option value="Animal">Fauna / Animal</option>
              <option value="Movimiento General">Movimiento General</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Prioridad:</span>
            <select
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="Bajo">Bajo (Falsos Positivos)</option>
              <option value="Medio">Medio (Operaciones)</option>
              <option value="Crítico">Crítico (Intrusos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Stream List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wider">
          Bitácora de Eventos de Visión IA (Frigate + ORBI Vision Core)
        </h3>
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-5 rounded-xl border transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  evt.processed
                    ? "bg-slate-900/10 border-slate-850 opacity-60"
                    : evt.intensity === "Crítico"
                    ? "bg-rose-950/10 border-rose-900/40 shadow-md shadow-rose-950/5"
                    : "bg-slate-900/30 border-slate-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg border ${
                      evt.intensity === "Crítico"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : evt.intensity === "Medio"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{evt.cameraName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({getParkName(evt.parkId)})</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{evt.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {evt.timestamp}
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        Confianza: <span className="text-emerald-400 font-semibold">{evt.confidence}%</span>
                      </span>
                      {evt.licensePlate && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                          LPR: {evt.licensePlate}
                        </span>
                      )}
                      {evt.faceIdentity && (
                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-bold">
                          ID: {evt.faceIdentity}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          evt.intensity === "Crítico"
                            ? "bg-rose-950/30 text-rose-400 border-rose-900/20 font-bold"
                            : evt.intensity === "Medio"
                            ? "bg-amber-950/30 text-amber-400 border-amber-900/20"
                            : "bg-slate-950 text-slate-400 border-slate-800"
                        }`}
                      >
                        Prioridad {evt.intensity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0">
                  <span className="text-xs font-mono font-bold text-slate-400 mr-2">
                    {evt.type.toUpperCase()}
                  </span>
                  {evt.processed ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Procesado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleProcessEvent(evt.id)}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-all"
                    >
                      Marcar Validado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/10 border border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500 font-mono">No se encontraron eventos con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
