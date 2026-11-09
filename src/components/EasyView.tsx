import React, { useState } from "react";
import { Camera, MotionEvent, Park } from "../types";
import { CheckCircle, AlertTriangle, Shield, Eye, Calendar, PlusCircle, AlertOctagon, HelpCircle, UserCheck, Image, Camera as CameraIcon } from "lucide-react";

interface EasyViewProps {
  parks: Park[];
  cameras: Camera[];
  events: MotionEvent[];
  currentLine: "field" | "community";
  onAddIncidentClick: (cameraName: string, zoneName: string) => void;
  onViewEventsClick: () => void;
}

export default function EasyView({
  parks,
  cameras,
  events,
  currentLine,
  onAddIncidentClick,
  onViewEventsClick
}: EasyViewProps) {
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [showSnapshotModal, setShowSnapshotModal] = useState<boolean>(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

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

  // Auto-select first camera
  React.useEffect(() => {
    if (filteredCameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(filteredCameras[0].id);
    }
  }, [filteredCameras, selectedCameraId]);

  const selectedCamera = filteredCameras.find(c => c.id === selectedCameraId) || filteredCameras[0] || null;

  // Compute status
  const systemOfflineCount = filteredCameras.filter(c => ["Offline", "Sin Acceso", "Sin Stream"].includes(c.status)).length;
  const systemStatus = systemOfflineCount > 0 ? "Aviso" : "Ok";

  // Translate status to simple human language
  const getSimpleStatusText = (status: string) => {
    switch (status) {
      case "Online":
        return "Grabación activa (Funcionando normal)";
      case "Offline":
        return "Cámara sin señal (Atención requerida)";
      case "Intermitente":
        return "Señal débil intermitente (El sistema está re-conectando)";
      case "Sin Acceso":
        return "Acceso bloqueado (Falta autorización o clave)";
      case "Sin Stream":
        return "Grabando localmente (Sin transmisión en vivo temporal)";
      case "Pendiente Validar":
        return "Equipo en instalación / Esperando confirmación";
      default:
        return "Estado desconocido";
    }
  };

  // Get human friendly event alerts
  const getSimpleEvents = () => {
    return events
      .filter(e => filteredParks.some(p => p.id === e.parkId))
      .slice(0, 5)
      .map(e => {
        let humanType = "Movimiento inusual";
        if (e.type === "Persona") humanType = "Persona detectada";
        if (e.type === "Vehículo") humanType = "Vehículo detectado";
        if (e.type === "Animal") humanType = "Mascota o fauna en el lugar";
        if (e.type === "Intrusión") humanType = "Traspaso de cerco de seguridad";

        return {
          ...e,
          humanType,
          humanMessage: `${humanType} en ${e.cameraName}. Registrado a las ${e.timestamp.split(" ")[1]}`
        };
      });
  };

  const simpleEvents = getSimpleEvents();

  const handleVerCamara = () => {
    if (selectedCamera) {
      setLiveToast(`✓ Enlazando transmisión para ${selectedCamera.name}...`);
      setTimeout(() => setLiveToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Modo Conserje / EasyView
          </span>
          <h2 className="text-xl font-sans font-semibold text-white mt-1">
            Control de Seguridad para Conserjes y Vigilantes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pantalla simplificada para visualizar el estado de las cámaras de {currentLine === "field" ? "los recintos técnicos" : "los condominios"} y reportar incidentes rápidamente.
          </p>
        </div>

        {/* Big Indicator Card */}
        <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 shrink-0 ${
          systemStatus === "Ok" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          {systemStatus === "Ok" ? (
            <CheckCircle className="w-6 h-6 animate-pulse" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider opacity-70">Estado del Sistema</p>
            <p className="text-sm font-bold font-sans">
              {systemStatus === "Ok" ? "✓ Todo funcionando normal" : `⚠ ${systemOfflineCount} cámara(s) con fallas`}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Live Camera & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Camera view & snapshot */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-semibold text-white">Cámaras en Transmisión</h3>
              </div>
              
              {/* Simple dropdown for selecting camera */}
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
              >
                {filteredCameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status === "Online" ? "Conectada" : "Falla"})
                  </option>
                ))}
              </select>
            </div>

            {/* Video Canvas Mirror */}
            {selectedCamera ? (
              <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-850 flex flex-col justify-between">
                
                {/* Simulated dynamic camera feedback canvas */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none">
                  {selectedCamera.status === "Online" ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="relative">
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                        </span>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">TRANSMISIÓN EN TIEMPO REAL</p>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedCamera.name} ({selectedCamera.resolution})</p>
                        <p className="text-[11px] text-emerald-400 font-mono mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                          Grabación y Protección Activa
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <AlertOctagon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-rose-400">PÉRDIDA DE SEÑAL</p>
                        <p className="text-xs text-slate-400 mt-0.5">El sistema no puede enlazar con la cámara: {selectedCamera.name}</p>
                        <p className="text-[11px] text-amber-400 font-sans mt-2 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-lg max-w-sm">
                          {getSimpleStatusText(selectedCamera.status)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Corner Details (non-tech) */}
                <div className="relative z-10 p-4 flex justify-between items-start">
                  <div className="bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-300">
                    SALA CONTROL: CHILE (GMT-4)
                  </div>
                  {selectedCamera.status === "Online" && (
                    <div className="bg-red-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold font-mono tracking-widest animate-pulse flex items-center gap-1 shadow-md">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> GRABANDO EDGE
                    </div>
                  )}
                </div>

                {/* Bottom Overlay Info (Friendly description) */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-end justify-between">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white block">{selectedCamera.name}</span>
                    <span className="text-slate-400">Ubicación física: {
                      parks.find(p => p.id === selectedCamera.parkId)?.name || "Recinto"
                    }</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Última imagen disponible
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-64 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500">
                Selecciona una cámara para ver.
              </div>
            )}
          </div>

          {/* Toast notifications */}
          {liveToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{liveToast}</span>
            </div>
          )}

          {/* Quick Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-850">
            <button
              onClick={handleVerCamara}
              className="py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-emerald-500/20 text-xs"
            >
              <CameraIcon className="w-4 h-4 shrink-0" />
              <span>Ver Cámara (Live)</span>
            </button>

            <button
              onClick={() => setShowSnapshotModal(true)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 text-xs"
            >
              <Image className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Ver Última Imagen</span>
            </button>

            <button
              onClick={() => selectedCamera && onAddIncidentClick(selectedCamera.name, parks.find(p => p.id === selectedCamera.parkId)?.name || "Sector Común")}
              className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-xs"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Marcar Incidente</span>
            </button>

            <button
              onClick={onViewEventsClick}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 text-xs"
            >
              <Calendar className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Ver Últimos Eventos</span>
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Simple Alerts List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Simple Alerts Panel */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-850 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-semibold text-white">Últimas Detecciones IA</h3>
              </div>

              {simpleEvents.length > 0 ? (
                <div className="space-y-3">
                  {simpleEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                        evt.intensity === "Crítico" 
                          ? "bg-rose-950/20 border-rose-900/30 text-rose-200" 
                          : evt.intensity === "Medio" 
                          ? "bg-amber-950/10 border-amber-900/20 text-amber-200"
                          : "bg-slate-950/50 border-slate-850 text-slate-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        {evt.intensity === "Crítico" ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                        ) : evt.intensity === "Medio" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold block">{evt.humanType}</span>
                        <p className="text-[11px] leading-snug opacity-90">{evt.description}</p>
                        <span className="text-[10px] text-slate-500 font-mono block pt-1">
                          Cámara: {evt.cameraName} | Hora: {evt.timestamp.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 font-mono text-xs">
                  Sin alertas recientes.
                </div>
              )}
            </div>

            {/* Note on protocol */}
            <div className="mt-6 p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2 text-[11px] text-slate-400 leading-normal">
              <div className="flex gap-2 items-start text-emerald-400">
                <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-bold">Protocolo Conserjería:</span>
              </div>
              <p>
                Si observas un evento fuera de horario o una cámara sin señal, presiona <strong>"Marcar Incidente"</strong>. El sistema registrará los datos de telemetría y generará una alerta segura para la administración.
              </p>
              <p className="font-semibold text-slate-300">
                “El sistema avisará a administración de forma automática.”
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* VER ÚLTIMA IMAGEN - SNAPSHOT MODAL */}
      {showSnapshotModal && selectedCamera && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
            {/* Modal header */}
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
              <div>
                <h4 className="font-sans font-bold text-white text-sm">
                  {selectedCamera.name} — Captura Estática Reciente
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ubicación: {parks.find(p => p.id === selectedCamera.parkId)?.name || "Recinto"}
                </p>
              </div>
              <button 
                onClick={() => setShowSnapshotModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
              >
                CERRAR
              </button>
            </div>

            {/* Simulated Live Snapshot frame */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center group overflow-hidden">
              {/* Fallback image background or beautiful procedural view */}
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=640&auto=format&fit=crop" 
                alt="Solar plant or common facility simulation view"
                className="w-full h-full object-cover opacity-70 filter saturate-50 contrast-125"
                referrerPolicy="no-referrer"
              />

              {/* Fake face blur overlay */}
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-16 h-20 border border-emerald-400/80 bg-emerald-950/50 backdrop-blur-xl rounded-full flex items-center justify-center text-emerald-400 text-[8px] font-mono font-bold text-center p-1">
                PRIVACY SHIELD BLUR
              </div>

              {/* Fake vehicle plate blur overlay */}
              <div className="absolute bottom-1/4 right-1/4 w-12 h-6 border border-sky-400/80 bg-sky-950/60 backdrop-blur-md rounded flex items-center justify-center text-sky-400 text-[8px] font-mono font-bold">
                BLUR
              </div>

              {/* Scanning crosshairs */}
              <div className="absolute inset-4 border border-slate-800/40 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t border-l border-emerald-400"></div>
                  <div className="w-4 h-4 border-t border-r border-emerald-400"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b border-l border-emerald-400"></div>
                  <div className="w-4 h-4 border-b border-r border-emerald-400"></div>
                </div>
              </div>

              {/* Live Overlay text (non-technical) */}
              <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
                CAPTURADO EN MEMORIA
              </div>

              {/* Lab mode warning overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-amber-500/90 text-slate-950 px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 shadow-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Modo Demo Lab: Enmascaramiento facial simulado en este prototipo.</span>
              </div>
            </div>

            {/* Modal footer notes */}
            <div className="p-4 bg-slate-950 text-slate-400 text-[11px] leading-relaxed space-y-1">
              <span className="font-bold text-slate-300 block">✓ Protección de Privacidad Activa:</span>
              <p>
                Los rostros de personas, ventanas de vecinos colindantes y patentes de vehículos han sido enmascarados de forma local mediante el Privacy Shield antes de estar disponibles para el conserje.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
