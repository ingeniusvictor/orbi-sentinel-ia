import React, { useState } from "react";
import { MotionEvent, Park } from "../types";
import { ShieldAlert, CheckCircle, Clock, Eye, AlertTriangle, Filter, Search } from "lucide-react";

interface MotionCoreProps {
  events: MotionEvent[];
  setEvents: React.Dispatch<React.SetStateAction<MotionEvent[]>>;
  parks: Park[];
}

export default function MotionCore({ events, setEvents, parks }: MotionCoreProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterIntensity, setFilterIntensity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleProcessEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, processed: true } : evt))
    );
  };

  const getParkName = (parkId: string) => {
    const park = parks.find((p) => p.id === parkId);
    return park ? park.name : "Laboratorio General";
  };

  // Filter events based on selections
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
      {/* Overview and Stats */}
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
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Confianza Promedio IA</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">92.4%</div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Motor: ORBI Vision Core</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850 text-emerald-400 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/20 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por cámara o detalle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          {/* Filter Type */}
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

          {/* Filter Intensity */}
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
        <h3 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wider">Bitácora de Eventos de Visión IA</h3>
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
                {/* Event Primary info */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg border ${
                    evt.intensity === "Crítico"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : evt.intensity === "Medio"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}>
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
                      <span className={`px-2 py-0.5 rounded border ${
                        evt.intensity === "Crítico"
                          ? "bg-rose-950/30 text-rose-400 border-rose-900/20 font-bold"
                          : evt.intensity === "Medio"
                          ? "bg-amber-950/30 text-amber-400 border-amber-900/20"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}>
                        Prioridad {evt.intensity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
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
