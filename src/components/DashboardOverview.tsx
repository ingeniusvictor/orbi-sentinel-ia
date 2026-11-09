import React from "react";
import {
  Server,
  Video,
  ShieldAlert,
  KeyRound,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sun,
  Radio
} from "lucide-react";
import { Park, Camera, Credential, MotionEvent } from "../types";

interface DashboardOverviewProps {
  parks: Park[];
  cameras: Camera[];
  credentials: Credential[];
  events: MotionEvent[];
  setCurrentTab: (tab: string) => void;
  setSelectedParkId: (id: string) => void;
  isDemoMode: boolean;
}

export default function DashboardOverview({
  parks,
  cameras,
  credentials,
  events,
  setCurrentTab,
  setSelectedParkId,
  isDemoMode,
}: DashboardOverviewProps) {
  // Compute dashboard metrics
  const totalParks = parks.length;
  const onlineCameras = cameras.filter((c) => c.status === "Online").length;
  const totalCameras = cameras.length;
  const pendingCredentials = credentials.filter((cr) => cr.status === "Pendiente").length;
  const unprocessedEvents = events.filter((e) => !e.processed).length;
  const criticalAlerts = events.filter((e) => e.intensity === "Crítico" && !e.processed).length;

  const handleDiagnosePark = (parkId: string) => {
    setSelectedParkId(parkId);
    setCurrentTab("diagnostics");
  };

  return (
    <div className="space-y-6">
      {/* Upper Welcome and Overview Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-sans font-semibold text-white tracking-tight">
            ORBI Sentinel IA — Consola de Control
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visualización perimetral inteligente, telemetría PoE y diagnóstico astrofotovoltaico en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Modo Operacional:</span>
          <span className={`px-3 py-1 rounded-full font-bold border ${
            isDemoMode
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {isDemoMode ? "🔬 SIMULACIÓN DEMO LAB" : "🟢 ESTADO NOMINAL"}
          </span>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Parques Solares */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Recintos / Parques</span>
            <div className="text-2xl font-bold text-white mt-1">{totalParks}</div>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Monitoreo Perimetral</span>
          </div>
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-slate-400">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Metric 2: Cámaras Online */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Cámaras Activas</span>
            <div className="text-2xl font-bold text-white mt-1">
              {onlineCameras} <span className="text-sm font-normal text-slate-500">/ {totalCameras}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round((onlineCameras / totalCameras) * 100)}% de disponibilidad
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-slate-400">
            <Video className="w-5 h-5 text-sky-400" />
          </div>
        </div>

        {/* Metric 3: Alertas de Movimiento */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Eventos Críticos</span>
            <div className="text-2xl font-bold text-white mt-1">
              {criticalAlerts} <span className="text-xs font-normal text-slate-500">pendientes</span>
            </div>
            <span className={`text-[10px] font-mono mt-1 block ${criticalAlerts > 0 ? "text-rose-400 font-semibold" : "text-emerald-400"}`}>
              {criticalAlerts > 0 ? "⚠️ Acción requerida urgente" : "✓ Cerco perimetral seguro"}
            </span>
          </div>
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-slate-400">
            <ShieldAlert className={`w-5 h-5 ${criticalAlerts > 0 ? "text-rose-400 animate-bounce" : "text-emerald-400"}`} />
          </div>
        </div>

        {/* Metric 4: Access Vault */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Vault Credenciales</span>
            <div className="text-2xl font-bold text-white mt-1">{credentials.length}</div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {pendingCredentials} pendientes por auditar
            </span>
          </div>
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg text-slate-400">
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Lab Blueprint Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Dahua PoE Lab Blueprint */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-semibold text-white">
                Esquema de Red de Laboratorio: Dahua PoE Lab v0.1
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/20">
              Lab Activo
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/60 font-mono text-xs text-slate-300 relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>SIM LOCAL GATEWAY</span>
            </div>

            {/* Visual network nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 items-center relative z-10">
              {/* Camera 1 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col items-center text-center">
                <Video className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="font-bold text-white">LAB Cam East (01)</span>
                <span className="text-[10px] text-slate-400 mt-1">192.168.1.108</span>
                <span className="text-[10px] text-emerald-400 mt-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  Online - Port 1 (PoE)
                </span>
              </div>

              {/* Central PoE Switch */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/80 flex flex-col items-center text-center shadow-lg relative">
                <div className="absolute top-1 left-2 text-[8px] text-slate-500">SWITCH PoE</div>
                <Activity className="w-10 h-10 text-amber-400 mb-1 animate-pulse" />
                <span className="font-bold text-white">LS-DS0402A-DP6</span>
                <span className="text-[10px] text-slate-400 mt-1">10/100 Mbps Max</span>
                <div className="grid grid-cols-4 gap-1 mt-2 w-full px-2">
                  <div className="bg-emerald-500 text-[8px] text-white py-0.5 rounded text-center">P1</div>
                  <div className="bg-emerald-500 text-[8px] text-white py-0.5 rounded text-center">P2</div>
                  <div className="bg-slate-800 text-[8px] text-slate-500 py-0.5 rounded text-center">P3</div>
                  <div className="bg-slate-800 text-[8px] text-slate-500 py-0.5 rounded text-center">P4</div>
                </div>
              </div>

              {/* Camera 2 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col items-center text-center">
                <Video className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="font-bold text-white">LAB Cam West (02)</span>
                <span className="text-[10px] text-slate-400 mt-1">192.168.1.109</span>
                <span className="text-[10px] text-emerald-400 mt-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  Online - Port 2 (PoE)
                </span>
              </div>
            </div>

            {/* Connection Lines description */}
            <div className="border-t border-slate-800 mt-4 pt-3 text-[10px] text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>• DH-IPC-HFW3449EN-AS-LED Power Consum:</span>
                <span className="text-amber-400">5.4 W por puerto (Normativo)</span>
              </div>
              <div className="flex justify-between">
                <span>• Sentinel Local Host / PC Monitor Gateway:</span>
                <span className="text-emerald-400">192.168.1.100 (Listo para ruteo RTSP)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
            <p className="text-xs text-slate-300">
              ¿Quieres simular o verificar el estado de conexión de este laboratorio? Accede al panel de CCTV Diagnostics.
            </p>
            <button
              onClick={() => handleDiagnosePark("dahua-lab")}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-150 shrink-0"
            >
              Probar Ping de Lab
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 3: Active Park Summaries */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-semibold text-white mb-3">Casos de Diagnóstico Activos</h3>
            <p className="text-xs text-slate-400 mb-4">
              Resumen de anomalías operacionales documentadas en los parques solares en producción.
            </p>

            <div className="space-y-3">
              {/* Case 1: Alhué */}
              <div
                onClick={() => handleDiagnosePark("alhue")}
                className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-amber-500/40 cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Parque Solar Alhué</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">
                    Intermitente
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Conflicto: Elevación de Trackers</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Señal de Enlace: -84 dBm</span>
                </div>
              </div>

              {/* Case 2: Alto Bella Vista */}
              <div
                onClick={() => handleDiagnosePark("alto-bella-vista")}
                className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-amber-500/40 cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Alto Bella Vista</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                    Sin Acceso
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Documentación de clave incompleta</span>
                </div>
              </div>

              {/* Case 3: Parral */}
              <div
                onClick={() => handleDiagnosePark("parral")}
                className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-emerald-500/40 cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Parque Solar Parral</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Acceso Parcial
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Detección de Movimiento no validada</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setCurrentTab("diagnostics")}
              className="w-full text-center text-xs text-emerald-400 hover:text-white font-mono hover:underline py-1"
            >
              Ver mapas lógicos e interferencia IA &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Camera Status Explanations Legend */}
      <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
        <h3 className="font-sans font-semibold text-white mb-3">Matriz de Estados de Cámaras Sentinel</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto mb-1 animate-pulse"></div>
            <span className="text-xs font-bold text-white block">Online</span>
            <span className="text-[9px] text-slate-400">Transmisión nominal continua.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mx-auto mb-1"></div>
            <span className="text-xs font-bold text-white block">Offline</span>
            <span className="text-[9px] text-slate-400">Sin respuesta a ping o PoE apagado.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mx-auto mb-1 animate-ping"></div>
            <span className="text-xs font-bold text-white block">Intermitente</span>
            <span className="text-[9px] text-slate-400">Pérdida de paquetes o sombra por paneles.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 mx-auto mb-1"></div>
            <span className="text-xs font-bold text-white block">Sin Acceso</span>
            <span className="text-[9px] text-slate-400">Falta clave autorizada o vencida.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mx-auto mb-1"></div>
            <span className="text-xs font-bold text-white block">Sin Stream</span>
            <span className="text-[9px] text-slate-400">Dispositivo pingable, puerto RTSP bloqueado.</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-600 mx-auto mb-1"></div>
            <span className="text-xs font-bold text-white block">Pendiente Validar</span>
            <span className="text-[9px] text-slate-400">Equipo en terreno sin confirmación de red.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
