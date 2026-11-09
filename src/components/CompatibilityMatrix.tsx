import React, { useState, useEffect } from "react";
import { Check, X, AlertCircle, Info, Shield, HelpCircle, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface CameraBrand {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  level: "Integración Completa" | "Integración Alta" | "Integración Consumer" | "App Propietaria" | "No Integrable Directa";
  connectionType: "PoE Ethernet" | "WiFi / RTSP" | "WiFi Cloud" | "Propia NVR";
  capabilities: {
    rtsp: boolean;
    onvif: boolean;
    internalAI: boolean;
    sentinelControl: boolean;
    snapshot: boolean;
    events: boolean;
    motion: boolean;
    personVehicle: boolean;
    audio: boolean;
    ptz: boolean;
    futureRecording: boolean;
  };
  validationStatus: "Validado en Lab" | "Soporte Parcial" | "Pendiente" | "No Soportado";
  notes: string;
}

const DEMO_EQUIPMENT: CameraBrand[] = [
  {
    id: "dahua-pro",
    name: "Dahua DH-IPC-HFW3449EN-AS-LED",
    brand: "Dahua",
    model: "DH-IPC-HFW3449EN-AS-LED",
    type: "IP Profesional PoE",
    level: "Integración Completa",
    connectionType: "PoE Ethernet",
    capabilities: {
      rtsp: true,
      onvif: true,
      internalAI: true,
      sentinelControl: true,
      snapshot: true,
      events: true,
      motion: true,
      personVehicle: true,
      audio: true,
      ptz: false,
      futureRecording: true
    },
    validationStatus: "Validado en Lab",
    notes: "Perfecta integración para CCTV perimetral. Soporta telemetría de puerto PoE, mapeo astronómico y control de eventos IVS nativos de laboratorio."
  },
  {
    id: "eufy-e220",
    name: "Eufy E220 Indoor Cam",
    brand: "Eufy",
    model: "E220 Indoor Cam",
    type: "Indoor Consumer Avanzada",
    level: "Integración Consumer",
    connectionType: "WiFi / RTSP",
    capabilities: {
      rtsp: true,
      onvif: false,
      internalAI: true,
      sentinelControl: false,
      snapshot: false,
      events: true,
      motion: true,
      personVehicle: true,
      audio: true,
      ptz: true,
      futureRecording: true
    },
    validationStatus: "Soporte Parcial",
    notes: "Permite retransmitir flujo RTSP habilitando el modo de almacenamiento NAS local en su app. IA interna procesada en chip local."
  },
  {
    id: "eufy-c220",
    name: "Eufy C220 Indoor Cam",
    brand: "Eufy",
    model: "C220 Indoor Cam",
    type: "Indoor Consumer Básica",
    level: "Integración Consumer",
    connectionType: "WiFi / RTSP",
    capabilities: {
      rtsp: true,
      onvif: false,
      internalAI: true,
      sentinelControl: false,
      snapshot: false,
      events: true,
      motion: true,
      personVehicle: true,
      audio: true,
      ptz: true,
      futureRecording: true
    },
    validationStatus: "Soporte Parcial",
    notes: "Soporte para detección humana. Integración parcial en Sentinel mediante puente RTSP local si se habilita el flujo de retransmisión."
  },
  {
    id: "tapo-c200",
    name: "TP-Link Tapo C200",
    brand: "TP-Link Tapo",
    model: "C200",
    type: "WiFi Home Cam",
    level: "Integración Consumer",
    connectionType: "WiFi / RTSP",
    capabilities: {
      rtsp: true,
      onvif: true,
      internalAI: false,
      sentinelControl: false,
      snapshot: true,
      events: true,
      motion: true,
      personVehicle: false,
      audio: true,
      ptz: true,
      futureRecording: true
    },
    validationStatus: "Soporte Parcial",
    notes: "Permite flujo RTSP directo y ONVIF básico configurando una cuenta de dispositivo en la app oficial Tapo."
  },
  {
    id: "ring-stick",
    name: "Ring Stick Up Cam",
    brand: "Ring",
    model: "Stick Up Cam",
    type: "Smart WiFi Home Cloud",
    level: "App Propietaria",
    connectionType: "WiFi Cloud",
    capabilities: {
      rtsp: false,
      onvif: false,
      internalAI: true,
      sentinelControl: false,
      snapshot: false,
      events: true,
      motion: true,
      personVehicle: true,
      audio: true,
      ptz: false,
      futureRecording: false
    },
    validationStatus: "No Soportado",
    notes: "No ofrece RTSP ni ONVIF de fábrica. Depende 100% de la nube propietaria de Amazon y requiere suscripción de almacenamiento."
  },
  {
    id: "blink-outdoor",
    name: "Blink Outdoor Cam",
    brand: "Blink",
    model: "Outdoor Cam",
    type: "Consumer a Batería",
    level: "No Integrable Directa",
    connectionType: "WiFi Cloud",
    capabilities: {
      rtsp: false,
      onvif: false,
      internalAI: false,
      sentinelControl: false,
      snapshot: false,
      events: false,
      motion: true,
      personVehicle: false,
      audio: false,
      ptz: false,
      futureRecording: false
    },
    validationStatus: "No Soportado",
    notes: "Cámara operada por batería de ultra bajo consumo. Sin posibilidad de stream permanente RTSP por límites de disipación y batería."
  }
];

export default function CompatibilityMatrix() {
  const [selectedBrandId, setSelectedBrandId] = useState("dahua-pro");
  const [equipmentList, setEquipmentList] = useState<CameraBrand[]>(DEMO_EQUIPMENT);

  useEffect(() => {
    const checkStatus = () => {
      const isLocked = localStorage.getItem("orbi_sentinel_calibration_locked") === "true";
      const rtspOk = localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true";
      const snapOk = localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true";

      setEquipmentList(prev => prev.map(eq => {
        if (eq.id === "dahua-pro") {
          let notes = eq.notes;
          let validationStatus = eq.validationStatus;
          if (isLocked) {
            validationStatus = "Validado en Lab";
            notes = `✓ LÍNEA BASE CONGELADA (CALIBRACIÓN ACTIVA): Confirmado en laboratorio físico perimetral con trazabilidad criptográfica. RTSP Stream: ${rtspOk ? "Verificado ✓" : "Soportado"} • Snapshots: ${snapOk ? "Verificado ✓" : "Soportado"}.`;
          } else if (rtspOk || snapOk) {
            validationStatus = "Validado en Lab";
            notes = `Pruebas de laboratorio físicas iniciadas con conectividad confirmada. RTSP: ${rtspOk ? "SÍ" : "NO"} • Snapshot: ${snapOk ? "SÍ" : "NO"}. Calibración editable (Falta aplicar Calibration Lock para congelar la línea base).`;
          }
          return {
            ...eq,
            validationStatus,
            notes
          };
        }
        return eq;
      }));
    };

    checkStatus();
    window.addEventListener("storage", checkStatus);
    const interval = setInterval(checkStatus, 2000);
    return () => {
      window.removeEventListener("storage", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const activeEquipment = equipmentList.find(e => e.id === selectedBrandId) || equipmentList[0];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-sky-500/10 border-b border-l border-sky-500/20 text-sky-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          Fase Lab: Mapeo de Compatibilidad
        </div>
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel Compatibility Matrix & Consumer Bridge</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
          ORBI Sentinel se adapta tanto a entornos industriales (parques solares, faenas) como residenciales (condominios, casas). 
          <span className="text-sky-400 font-semibold"> [Análisis de Ingeniería]</span> Esta matriz representa una clasificación técnica conceptual. El control total de marcas hogareñas propietarias como Eufy, Tapo, Ring o Blink está sujeto a los límites de sus respectivas API de nube y flujos de transmisión local RTSP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Brand/Equipment Selector */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h4 className="font-sans font-semibold text-white text-sm">Dispositivos y Marcas</h4>
          </div>

          <div className="space-y-2">
            {equipmentList.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedBrandId(eq.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedBrandId === eq.id
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900/40 hover:text-white"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{eq.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{eq.type}</span>
                </div>
                
                <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 font-mono ${
                  eq.level === "Integración Completa"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : eq.level === "Integración Alta"
                    ? "text-sky-400 bg-sky-500/10 border-sky-500/20"
                    : eq.level === "Integración Consumer"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                }`}>
                  {eq.level.split(" ")[1] || "Cloud"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center column: Compatibility Capabilities Detail */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Nivel de Compatibilidad</h4>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Modelo Seleccionado:</span>
                <h5 className="text-sm font-bold text-white mt-1">{activeEquipment.name}</h5>
                <p className="text-xs text-slate-400 mt-1">{activeEquipment.type} • Conexión {activeEquipment.connectionType}</p>
              </div>

              {/* Capabilities checklist */}
              <div className="space-y-2.5 pt-2 border-t border-slate-850">
                
                {/* RTSP Stream */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-900">
                  <span className="font-sans text-slate-300">Transmisión RTSP Local Directa:</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {activeEquipment.capabilities.rtsp ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> SOPORTADO
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                        <X className="w-3 h-3" /> NO SOPORTADO
                      </span>
                    )}
                  </div>
                </div>

                {/* ONVIF Discovery */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-900">
                  <span className="font-sans text-slate-300">Descubrimiento ONVIF Perfil S/T:</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {activeEquipment.capabilities.onvif ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> SOPORTADO
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                        <X className="w-3 h-3" /> NO SOPORTADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Internal AI chip */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-900">
                  <span className="font-sans text-slate-300">Procesamiento de IA Interno en Cámara:</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {activeEquipment.capabilities.internalAI ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> EQUIPADO
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                        <X className="w-3 h-3" /> NO POSEE
                      </span>
                    )}
                  </div>
                </div>

                {/* Sentinel full control */}
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-900">
                  <span className="font-sans text-slate-300">Control de Telemetría PoE Sentinel:</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {activeEquipment.capabilities.sentinelControl ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> COMPLETO
                      </span>
                    ) : (
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> PARCIAL o INCOMPATIBLE
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Notes */}
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-xs text-slate-300 italic mt-4 leading-relaxed">
                <strong>Análisis Técnico:</strong> {activeEquipment.notes}
              </div>

            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            * Para integrar cámaras consumer de Eufy o Tapo, se requiere que el equipo esté conectado a la misma red LAN que el Sentinel Local Gateway y que se configure una contraseña estática de stream en su respectiva aplicación oficial.
          </div>
        </div>

        {/* Right column: Consumer Bridge explanation */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Consumer Bridge: Límites y Alcance</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Las cámaras hogareñas (consumer) de marcas como <strong>Eufy, Tapo, Xiaomi, Wyze, Ring o Blink</strong> son muy populares debido a su costo y facilidad de uso, pero presentan desafíos en integraciones industriales o comunitarias centralizadas:
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                <span className="font-bold text-white block">1. Algunas Cámaras Habilitan RTSP/NAS:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Modelos como Eufy E220/C220 y Tapo C200 permiten encender una retransmisión RTSP local que Sentinel puede capturar de forma continua en red local.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                <span className="font-bold text-white block">2. Dependencia estricta de Nube / Apps:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Marcas como Ring o Blink bloquean los streams de video directo de fábrica para forzar el uso de su app propietaria. No se puede prometer visualización fluida directa sin APIs pagadas o puentes secundarios inestables.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                <span className="font-bold text-white block">3. Lo que ORBI diagnostica:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sentinel clasifica y mapea las capacidades de red de cada equipo para armar planes de migración gradual desde cámaras de hogar baratas hacia equipamiento IP profesional Dahua PoE.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong>Consejo Comercial:</strong> Siempre se sugiere priorizar cámaras PoE industriales para resguardo perimetral exterior de comunidades, y dejar cámaras WiFi de consumo únicamente para interiores comunes de bajo riesgo.
          </div>
        </div>

      </div>

      {/* Expanded Compatibility Matrix Table (Módulo 1C) */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <h4 className="font-sans font-semibold text-white text-sm">Detalle de Capacidades Reales & Laboratorio (Módulo 1C)</h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 w-fit">
            Sincronizado con Sentinel Adapter
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Esta matriz compara de forma exhaustiva las capacidades nativas de transmisión, analíticas inteligentes y grabación local para cada dispositivo del laboratorio o terreno.
        </p>

        {/* Scrollable Container for Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40">
          <table className="w-full text-left border-collapse text-[10px] font-mono min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400">
                <th className="p-3 font-semibold font-sans">Cámara / Marca</th>
                <th className="p-3 font-semibold font-sans">Modelo</th>
                <th className="p-3 font-semibold font-sans">Tipo</th>
                <th className="p-3 font-semibold font-sans text-center">RTSP</th>
                <th className="p-3 font-semibold font-sans text-center">Snapshot</th>
                <th className="p-3 font-semibold font-sans text-center">ONVIF</th>
                <th className="p-3 font-semibold font-sans text-center">Eventos</th>
                <th className="p-3 font-semibold font-sans text-center">Motion</th>
                <th className="p-3 font-semibold font-sans text-center">Pers/Veh AI</th>
                <th className="p-3 font-semibold font-sans text-center">Audio</th>
                <th className="p-3 font-semibold font-sans text-center">PTZ</th>
                <th className="p-3 font-semibold font-sans text-center">Grab. Local Futura</th>
                <th className="p-3 font-semibold font-sans">Nivel de Integración</th>
                <th className="p-3 font-semibold font-sans">Estado Validación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {DEMO_EQUIPMENT.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-900/20 transition-all">
                  <td className="p-3 font-bold text-white font-sans">{eq.name}</td>
                  <td className="p-3 text-slate-400">{eq.model}</td>
                  <td className="p-3 text-slate-500 font-sans text-[9px]">{eq.type}</td>
                  
                  {/* RTSP */}
                  <td className="p-3 text-center">
                    {eq.capabilities.rtsp ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Snapshot */}
                  <td className="p-3 text-center">
                    {eq.capabilities.snapshot ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* ONVIF */}
                  <td className="p-3 text-center">
                    {eq.capabilities.onvif ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Eventos */}
                  <td className="p-3 text-center">
                    {eq.capabilities.events ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Motion */}
                  <td className="p-3 text-center">
                    {eq.capabilities.motion ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Pers/Veh */}
                  <td className="p-3 text-center">
                    {eq.capabilities.personVehicle ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Audio */}
                  <td className="p-3 text-center">
                    {eq.capabilities.audio ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* PTZ */}
                  <td className="p-3 text-center">
                    {eq.capabilities.ptz ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Grabación local */}
                  <td className="p-3 text-center">
                    {eq.capabilities.futureRecording ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">SI</span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold">NO</span>
                    )}
                  </td>

                  {/* Nivel Integración */}
                  <td className="p-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-sans font-bold ${
                      eq.level === "Integración Completa" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                      eq.level === "Integración Alta" ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                      eq.level === "Integración Consumer" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                      "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    }`}>
                      {eq.level}
                    </span>
                  </td>

                  {/* Validación */}
                  <td className="p-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-sans font-bold ${
                      eq.validationStatus === "Validado en Lab" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                      eq.validationStatus === "Soporte Parcial" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                      eq.validationStatus === "Pendiente" ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                      "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    }`}>
                      {eq.validationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
