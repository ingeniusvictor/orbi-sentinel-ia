import React, { useState } from "react";
import { Camera, Park, Incident, IncidentType, IncidentStatus } from "../types";
import { AlertTriangle, Clock, MapPin, Eye, FileText, Clipboard, Check, Plus, Filter, Trash, EyeOff, Mic, Search, Loader2 } from "lucide-react";

interface IncidentCenterProps {
  parks: Park[];
  cameras: Camera[];
  incidents: Incident[];
  onAddIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
  onDeleteIncident: (id: string) => void;
  currentLine: "field" | "community";
}

export default function IncidentCenter({
  parks,
  cameras,
  incidents,
  onAddIncident,
  onUpdateStatus,
  onDeleteIncident,
  currentLine
}: IncidentCenterProps) {
  const [cameraName, setCameraName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [type, setType] = useState<IncidentType>("Persona sospechosa");
  const [status, setStatus] = useState<IncidentStatus>("Abierto");
  const [observations, setObservations] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [isProcessingLumia, setIsProcessingLumia] = useState(false);
  const [lumiaResults, setLumiaResults] = useState<Incident[] | null>(null);

  // Filter parks and cameras based on line
  const filteredParks = parks.filter(p => {
    if (currentLine === "field") {
      return ["dahua-lab", "parral", "alto-bella-vista", "alhue"].includes(p.id);
    } else {
      return ["las-condes", "portal-nunoa", "ecovista"].includes(p.id);
    }
  });

  const filteredCameras = cameras.filter(c => 
    filteredParks.some(p => p.id === c.parkId)
  );

  // Pre-fill fields on mount if they aren't set
  React.useEffect(() => {
    if (filteredCameras.length > 0 && !cameraName) {
      setCameraName(filteredCameras[0].name);
    }
    if (filteredParks.length > 0 && !zoneName) {
      setZoneName(filteredParks[0].name);
    }
  }, [filteredCameras, filteredParks]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraName || !zoneName || !observations.trim()) return;

    const newIncident: Incident = {
      id: "inc-" + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cameraName,
      zoneName,
      type,
      status,
      observations,
      snapshotMockUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80" // Security cam view mock
    };

    onAddIncident(newIncident);
    setObservations("");
  };

  const handleCopySummary = (inc: Incident) => {
    const summaryText = `[REPORTE DE INCIDENTE SENTINEL]
ID: ${inc.id}
FECHA/HORA: ${inc.timestamp}
TIPO: ${inc.type}
ESTADO: ${inc.status}
RECINTO/ZONA: ${inc.zoneName}
DISPOSITIVO: ${inc.cameraName}
OBSERVACIONES: ${inc.observations}
---
Sentinel IA Foundation Base: Reporte de Evidencia Operacional`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccessId(inc.id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  const handleLumiaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) {
      setLumiaResults(null);
      return;
    }

    setIsProcessingLumia(true);

    try {
      const res = await fetch("/api/lumia/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: semanticQuery })
      });
      const data = await res.json();
      if (data.success && data.results) {
        // Add a slight delay to simulate "processing" effect
        setTimeout(() => {
          setLumiaResults(data.results);
          setIsProcessingLumia(false);
        }, 1500);
      } else {
        setIsProcessingLumia(false);
      }
    } catch (error) {
      console.error(error);
      setIsProcessingLumia(false);
    }
  };

  const filteredIncidents = lumiaResults || incidents.filter(inc => {
    if (filterStatus === "todos") return true;
    return inc.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Intro block */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel Incident Center (Gestión de Sucesos)</h3>
        <p className="text-xs text-slate-400 mt-1">
          Registra y audita incidentes de seguridad y técnicos reportados por el personal de vigilancia o detectados automáticamente por el motor de visión contextual de <strong>ORBI Sentinel IA</strong>.
        </p>
      </div>

      {/* Lumia Semantic Search Bar */}
      <form onSubmit={handleLumiaSearch} className="bg-slate-900 border border-emerald-500/50 rounded-xl p-2 flex items-center gap-3 relative overflow-hidden">
        <div className="flex-1 flex items-center gap-3 px-2 z-10">
          <Search className="w-5 h-5 text-emerald-500" />
          <input
            type="text"
            placeholder='Ej: "camioneta roja en el portón" o "persona cerca de los inversores"'
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="w-full bg-transparent border-none text-emerald-300 font-mono text-sm focus:outline-none placeholder:text-emerald-900/50"
          />
          <Mic className="w-5 h-5 text-emerald-500 cursor-pointer hover:text-emerald-400 transition-colors" title="Búsqueda por voz (Lumia Voice)" />
        </div>

        <button
          type="submit"
          disabled={isProcessingLumia}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all z-10 whitespace-nowrap flex items-center gap-2"
        >
          {isProcessingLumia ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Procesando...
            </>
          ) : (
            "Buscar (Lumia)"
          )}
        </button>

        {/* Visual Scanning Effect */}
        {isProcessingLumia && (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        )}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register Form */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h4 className="font-sans font-semibold text-white text-sm">Registrar Nuevo Suceso</h4>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Camera association */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Cámara / Dispositivo:</label>
              <select
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                {filteredCameras.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone association */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Recinto / Zona Geográfica:</label>
              <select
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                {filteredParks.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Classification */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Tipo de Incidente:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="Persona sospechosa">👤 Persona sospechosa</option>
                <option value="Vehículo detenido">🚗 Vehículo detenido</option>
                <option value="Portón abierto">🚪 Portón abierto</option>
                <option value="Movimiento fuera de horario">🌙 Movimiento fuera de horario</option>
                <option value="Cámara sin señal">🔌 Cámara sin señal</option>
                <option value="Mascota/animal">🐕 Mascota/animal</option>
                <option value="Otro">❓ Otro suceso</option>
              </select>
            </div>

            {/* Initial Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Estado Inicial:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Abierto", "En revisión", "Cerrado"] as IncidentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-mono border font-bold transition-all ${
                      status === st
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Observations text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Observaciones del Guardia/Operador:</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Indica qué se observa en el stream, acciones tomadas y comentarios del guardia..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-3 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 text-xs uppercase font-mono tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Suceso</span>
            </button>
          </form>
        </div>

        {/* Right Column (2 cols): List of Incidents */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-850 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="font-sans font-semibold text-white">Bitácora de Incidentes del Sitio</h4>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex">
                  {["todos", "Abierto", "En revisión", "Cerrado"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2 py-1 rounded text-[9px] font-mono uppercase transition-all ${
                        filterStatus === st
                          ? "bg-slate-800 text-white font-bold"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {st === "todos" ? "Todos" : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isProcessingLumia ? (
              <div className="flex flex-col items-center justify-center text-center py-20 text-emerald-500 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <div>
                  <p className="text-sm font-mono font-bold">Lumia procesando consulta semántica...</p>
                  <p className="text-[11px] text-emerald-600/70 max-w-xs mx-auto mt-1 font-mono">
                    Traduciendo lenguaje natural a filtros vectoriales en orbi-sentinel-db.json
                  </p>
                </div>
              </div>
            ) : filteredIncidents.length > 0 ? (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 select-text">
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 bg-slate-950/70 border border-slate-850 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono font-bold">
                          {inc.id}
                        </span>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                          {inc.type}
                        </h5>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={inc.status}
                          onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                          className={`text-[9px] font-mono font-bold rounded px-2 py-1 bg-slate-900 border focus:outline-none ${
                            inc.status === "Abierto"
                              ? "text-rose-400 border-rose-900/30"
                              : inc.status === "En revisión"
                              ? "text-amber-400 border-amber-900/20"
                              : "text-emerald-400 border-emerald-900/20"
                          }`}
                        >
                          <option value="Abierto">Abierto</option>
                          <option value="En revisión">En revisión</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>

                        <button
                          onClick={() => onDeleteIncident(inc.id)}
                          className="p-1 hover:bg-rose-950/20 rounded border border-transparent hover:border-rose-900/30 text-slate-500 hover:text-rose-400 transition-all"
                          title="Eliminar registro"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/40 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Zona: <strong className="text-slate-300">{inc.zoneName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hora: <strong className="text-slate-300">{inc.timestamp}</strong></span>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cámara: <strong className="text-slate-300">{inc.cameraName}</strong></span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/90 p-3 rounded-lg border border-slate-900 leading-relaxed font-sans">
                      {inc.observations}
                    </div>

                    {/* Clip Simulado Badge / Visual Indicator */}
                    <div className="flex items-center justify-between bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Captura de Evidencia Guardada
                      </span>
                      <button
                        onClick={() => handleCopySummary(inc)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-emerald-400 text-slate-300 py-1 px-2 rounded font-mono flex items-center gap-1.5 transition-all"
                      >
                        {copySuccessId === inc.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3" />
                            <span>Copiar Resumen</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-3">
                <AlertTriangle className="w-8 h-8 text-slate-700" />
                <div>
                  <p className="text-xs font-mono">Sin registros</p>
                  <p className="text-[11px] text-slate-600 max-w-xs mx-auto mt-1">
                    No hay incidentes reportados con este filtro para {currentLine === "field" ? "los parques solares." : "las comunidades residenciales."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
