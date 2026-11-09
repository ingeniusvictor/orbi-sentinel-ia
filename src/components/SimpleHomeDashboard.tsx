import React, { useState } from "react";
import {
  Video,
  UserCheck,
  ShieldAlert,
  Wrench,
  FileText,
  Server,
  ShieldCheck,
  Shield,
  Award,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Activity,
  PhoneCall,
  Lock,
  KeyRound,
  FileVideo,
  LineChart,
  Sliders,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  Settings,
  AlertTriangle,
  CheckCircle2,
  BookMarked,
  Layers,
  Check,
  Terminal,
  LogOut
} from "lucide-react";
import { Camera, Incident } from "../types";

interface SimpleHomeDashboardProps {
  userRole: "conserje" | "admin" | "tecnico";
  setUserRole: (role: "conserje" | "admin" | "tecnico") => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  currentLine: "field" | "community";
  setCurrentLine: (line: "field" | "community") => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (advanced: boolean) => void;
  cameras: Camera[];
  incidents: Incident[];
  onAddAuditLog: (action: string, details: string) => void;
}

export default function SimpleHomeDashboard({
  userRole,
  setUserRole,
  currentTab,
  setCurrentTab,
  isDemoMode,
  toggleDemoMode,
  currentLine,
  setCurrentLine,
  isAdvancedMode,
  setIsAdvancedMode,
  cameras,
  incidents,
  onAddAuditLog,
}: SimpleHomeDashboardProps) {
  const [isAdvancedSectionExpanded, setIsAdvancedSectionExpanded] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [conserjeCalledTecnico, setConserjeCalledTecnico] = useState(false);

  // Simple stats
  const totalCams = cameras.length;
  const onlineCams = cameras.filter((c) => c.status === "Online").length;
  const offlineCams = cameras.filter((c) => c.status === "Offline").length;
  const intermitentesCams = cameras.filter((c) => c.status === "Intermitente").length;

  const handleCallTecnico = () => {
    setConserjeCalledTecnico(true);
    onAddAuditLog("Soporte Técnico Solicitado", "Conserje solicitó asistencia de terreno inmediata.");
    setTimeout(() => setConserjeCalledTecnico(false), 5000);
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportMessageSent(true);
    onAddAuditLog("Mensaje Soporte", "Se envió un reporte de problema operativo a la mesa técnica.");
    setTimeout(() => setSupportMessageSent(false), 5000);
  };

  return (
    <div className="space-y-4" id="simple-home-launcher-container">
      
      {/* HEADER ROW - Clean, high contrast & professional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-3 gap-2 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase font-mono">
            Pantalla Principal
          </h2>
          <p className="text-xs text-slate-400">
            {userRole === "conserje" 
              ? "Panel de control simplificado de un solo clic para conserjería." 
              : "Centro de control y launcher unificado ORBI Sentinel IA."}
          </p>
        </div>

        {/* Advanced Mode Selector */}
        <div className="flex items-center gap-2">
          {userRole !== "conserje" && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-[10px] font-mono">
              <span className="text-slate-500 px-1 font-bold font-sans">VISTA:</span>
              <button
                onClick={() => {
                  setIsAdvancedMode(false);
                  setIsAdvancedSectionExpanded(false);
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  !isAdvancedMode
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => {
                  setIsAdvancedMode(true);
                  setIsAdvancedSectionExpanded(true);
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  isAdvancedMode
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Avanzada
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTAINER: LEFT Launcher (Grid) & RIGHT Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: THE LAUNCHER (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {userRole === "conserje" ? (
            /* CONSERJE LAUNCHER - Maximum 4 elegant, giant buttons for low fatigue */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Ver Cámaras */}
              <button
                onClick={() => setCurrentTab("livewall")}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-emerald-500/40 p-6 rounded-xl text-left transition-all duration-200 group flex items-start gap-4 shadow-md relative overflow-hidden"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                  <Video className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    Módulo 01
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 mt-1">
                    Ver Cámaras en Vivo
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitoreo en tiempo real de los accesos perimetrales activos.
                  </p>
                </div>
              </button>

              {/* Card 2: Modo Conserje EasyView */}
              <button
                onClick={() => setCurrentTab("easyview")}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-emerald-500/40 p-6 rounded-xl text-left transition-all duration-200 group flex items-start gap-4 shadow-md relative overflow-hidden"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    Módulo 02
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 mt-1">
                    Modo Conserje (EasyView)
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interfaz simplificada de baja fatiga para registrar turnos de guardia.
                  </p>
                </div>
              </button>

              {/* Card 3: Reportar Incidente */}
              <button
                onClick={() => setCurrentTab("incidentcenter")}
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-emerald-500/40 p-6 rounded-xl text-left transition-all duration-200 group flex items-start gap-4 shadow-md relative overflow-hidden"
              >
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 shrink-0 group-hover:bg-rose-500/20 group-hover:scale-105 transition-all">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-rose-400 tracking-wider bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                    Módulo 03
                  </span>
                  <h3 className="text-base font-black text-white group-hover:text-rose-400 transition-colors flex items-center gap-1.5 mt-1">
                    Reportar Incidente
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registrar intrusiones, sospechosos o fallas técnicas del sistema.
                  </p>
                </div>
              </button>

              {/* Card 4: Soporte Técnico / Llamar Técnico */}
              <div className="bg-slate-900/90 border-2 border-slate-800 p-6 rounded-xl shadow-md flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 shrink-0">
                    <PhoneCall className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                      Módulo 04
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">Asistencia Operativa</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Llamado directo de contingencia in situ.</p>
                  </div>
                </div>

                {supportMessageSent ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-2 rounded text-xs text-emerald-400 text-center font-mono animate-fade-in">
                    ✓ Reporte enviado de forma exitosa.
                  </div>
                ) : (
                  <form onSubmit={handleSendSupportMessage} className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCallTecnico}
                        disabled={conserjeCalledTecnico}
                        className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 rounded text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        {conserjeCalledTecnico ? "Solicitando..." : "Llamar Técnico"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          ) : (
            /* ADMIN / TECNICO LAUNCHER - Elegant 2x4 visual layout centered on professional aesthetics */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="launcher-main-grid-8">
              
              {/* 1. Live Wall */}
              <button
                onClick={() => setCurrentTab("livewall")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0 group-hover:bg-emerald-500/20">
                  <Video className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 01</span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black">
                      {totalCams} Canales
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-emerald-400 flex items-center justify-between">
                    Live Wall
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Visualiza cámaras y monitoreo en tiempo real de alta definición.
                  </p>
                </div>
              </button>

              {/* 2. Modo Conserje */}
              <button
                onClick={() => setCurrentTab("easyview")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0 group-hover:bg-emerald-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 02</span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black">
                      Baja Fatiga
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-emerald-400 flex items-center justify-between">
                    Modo Conserje / EasyView
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Vista simplificada para la operación diaria y reporte rápido del personal.
                  </p>
                </div>
              </button>

              {/* 3. Incidentes */}
              <button
                onClick={() => setCurrentTab("incidentcenter")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 shrink-0 group-hover:bg-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 03</span>
                    <span className="text-[8px] font-mono text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded font-black">
                      {incidents.length} Alertas
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-rose-400 flex items-center justify-between">
                    Incidentes
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Revisa alertas, bitácora de eventos e incidentes perimetrales.
                  </p>
                </div>
              </button>

              {/* 4. Diagnóstico CCTV */}
              <button
                onClick={() => setCurrentTab("diagnostics")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0 group-hover:bg-emerald-500/20">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 04</span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black">
                      Diagnóstico OK
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-emerald-400 flex items-center justify-between">
                    Diagnóstico CCTV
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Revisa salud de cámaras, ping, latencias, gateway y red LAN.
                  </p>
                </div>
              </button>

              {/* 5. Evidencia y Reportes */}
              <button
                onClick={() => setCurrentTab("evidence")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-xl text-sky-400 shrink-0 group-hover:bg-sky-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 05</span>
                    <span className="text-[8px] font-mono text-sky-400 bg-sky-500/10 px-1 py-0.2 rounded font-black">
                      Evidencias
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-sky-400 flex items-center justify-between">
                    Evidencia y Reportes
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Genera reportes y evidencias técnicas automáticas en video sanitizado.
                  </p>
                </div>
              </button>

              {/* 6. Cámaras y Gateway */}
              <button
                onClick={() => setCurrentTab("gatewaylocal")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 shrink-0 group-hover:bg-emerald-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 06</span>
                    <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-black">
                      Edge Server
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-emerald-400 flex items-center justify-between">
                    Cámaras y Gateway
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Administra dispositivos locales, NVRs y conectividad local del hardware.
                  </p>
                </div>
              </button>

              {/* 7. Pilotos y Propuestas */}
              <button
                onClick={() => setCurrentTab("pilotintake")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-teal-500/10 border border-teal-500/25 rounded-xl text-teal-400 shrink-0 group-hover:bg-teal-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 07</span>
                    <span className="text-[8px] font-mono text-teal-400 bg-teal-500/10 px-1 py-0.2 rounded font-black">
                      3 Frentes
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-teal-400 flex items-center justify-between">
                    Pilotos y Propuestas
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Prepara pilotos, propuestas comerciales y traspasos seguros para comités.
                  </p>
                </div>
              </button>

              {/* 8. Configuración y Seguridad */}
              <button
                onClick={() => setCurrentTab("privacy")}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3.5 shadow-md hover:-translate-y-0.5"
              >
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400 shrink-0 group-hover:bg-indigo-500/20">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider">MÓDULO 08</span>
                    <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded font-black">
                      RBAC / Vault
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-wide group-hover:text-indigo-400 flex items-center justify-between">
                    Configuración y Seguridad
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all" />
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Gestiona roles de usuario, llaves del Access Vault y protección de datos.
                  </p>
                </div>
              </button>

            </div>
          )}

          {/* COLLAPSIBLE ADVANCED CENTER (For Admin / Técnico) */}
          {userRole !== "conserje" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shrink-0" id="advanced-center-launcher-accordion">
              <button
                onClick={() => setIsAdvancedSectionExpanded(!isAdvancedSectionExpanded)}
                className="w-full flex justify-between items-center px-4 py-3 bg-slate-950 hover:bg-slate-900 transition-all text-left border-b border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-white">Centro Avanzado & QA</span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    Herramientas de Demostración, Exportación y Compliance
                  </span>
                </div>
                {isAdvancedSectionExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isAdvancedSectionExpanded && (
                <div className="p-4 bg-slate-950/45 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] font-mono animate-fade-in">
                  {[
                    { label: "Release Candidate Center", id: "releasecandidate", desc: "Aceptación interna y auditoría", icon: ShieldCheck },
                    { label: "Public Showcase Center", id: "publicshowcase", desc: "Monitoreo libre de PII", icon: Sparkles },
                    { label: "Demo Deck Export", id: "demodeckexport", desc: "Reportes técnicos consolidados", icon: BookOpen },
                    { label: "External Stakeholder Binder", id: "stakeholderbinder", desc: "Carpetas técnicas de comités", icon: BookMarked },
                    { label: "Launch Media Kit", id: "mediakit", desc: "Material de prensa y comunicados", icon: FileVideo },
                    { label: "Demo Analytics", id: "demoanalytics", desc: "Simulador de telemetría de red", icon: Activity },
                    { label: "Demo Insights", id: "demoinsights", desc: "A/B testing y telemetría local", icon: LineChart },
                    { label: "A/B Presentation Lab", id: "abpresentationlab", desc: "Módulos de comparativa técnica", icon: Sliders },
                    { label: "Sentinel MVP Freeze", id: "mvpfreeze", desc: "Auditoría final del código", icon: ShieldCheck },
                    { label: "Dahua Lab Protocol", id: "dahualabprotocol", desc: "Integración Dahua PoE LAN", icon: Server },
                    { label: "Consumer Bridge", id: "consumerbridge", desc: "Simulador de alertas de consumo", icon: HelpCircle },
                    { label: "Compatibility Matrix", id: "compatibility", desc: "Matriz técnica de compatibilidad", icon: HelpCircle },
                  ].map((sub, sIdx) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => setCurrentTab(sub.id)}
                        className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded hover:border-emerald-500/25 transition-all text-left group flex items-start gap-2"
                      >
                        <SubIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h5 className="font-bold text-white text-xs truncate group-hover:text-emerald-400 transition-colors">{sub.label}</h5>
                          <p className="text-[10px] text-slate-500 truncate">{sub.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* QUICK STANDARD OPERATING PROCEDURE */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-3 shrink-0">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">Manual Rápido: Operación de Seguridad</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
              {[
                { step: "1", title: "Live Wall", desc: "Verifique flujos en tiempo real." },
                { step: "2", title: "Incidentes", desc: "Registre alertas perimetrales." },
                { step: "3", title: "Diagnósticos", desc: "Valide salud de red local." },
                { step: "4", title: "Evidencias", desc: "Exporte video sanitizado." },
                { step: "5", title: "Pilotos", desc: "Prepare el traspaso técnico." },
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-950/40 p-2.5 rounded border border-slate-850 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] font-mono font-black text-emerald-400 shrink-0">
                      {m.step}
                    </span>
                    <h5 className="font-bold text-white text-[10px] truncate">{m.title}</h5>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SYSTEM STATUS & ALERTS (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. STATUS MONITOR (Exactly 4 metrics) */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3" id="right-panel-monitor">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">Estado del Sistema</h4>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Canales CCTV</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  {onlineCams}/{totalCams} OK
                </span>
              </div>

              <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Gateway Local</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  Conectado (Demo)
                </span>
              </div>

              <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Grabador de Evidencia</span>
                <span className="font-bold text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded">
                  Nominal (Demo)
                </span>
              </div>

              <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Enlace de Red WAN</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  12 ms (Estable)
                </span>
              </div>
            </div>
          </div>

          {/* 2. RECENT ALERTS (Exactly 3 alerts) */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3" id="right-panel-recent-alerts-compact">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">Alertas Recientes</h4>
            </div>

            <div className="space-y-2">
              {[
                { title: "Cámara intermitente", type: "Prioridad Alta", time: "Hace 5m", target: "diagnostics" },
                { title: "Movimiento detectado", type: "Prioridad Media", time: "Hace 15m", target: "motioncore" },
                { title: "Privacidad activa", type: "Prioridad Info", time: "En curso", target: "privacy" },
              ].map((al, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-black uppercase tracking-wider ${
                        al.type.includes("Alta") ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        al.type.includes("Media") ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}>
                        {al.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{al.time}</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-white mt-1 truncate">{al.title}</h5>
                  </div>
                  <button
                    onClick={() => setCurrentTab(al.target)}
                    className="text-[10px] font-mono text-emerald-400 hover:underline shrink-0 font-bold"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. QUICK ACTIONS (Exactly 4 buttons) */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3" id="right-panel-quick-actions-compact">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">Accesos Rápidos</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {userRole === "conserje" ? (
                <>
                  <button
                    onClick={() => setCurrentTab("incidentcenter")}
                    className="bg-slate-950 hover:bg-slate-850 p-2 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                    <span>Nuevo Incidente</span>
                  </button>
                  <button
                    onClick={handleCallTecnico}
                    className="bg-slate-950 hover:bg-slate-850 p-2 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-4.5 h-4.5 text-amber-400" />
                    <span>Llamar Soporte</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab("livewall")}
                    className="bg-slate-950 hover:bg-slate-850 p-2 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1 col-span-2"
                  >
                    <Video className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Ver Cámaras en Vivo</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab("evidence")}
                    className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Buscar Evidencia</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab("demodeckexport")}
                    className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4.5 h-4.5 text-teal-400" />
                    <span>Exporte Técnico</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab("easyview")}
                    className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <Layers className="w-4.5 h-4.5 text-sky-400" />
                    <span>Ver Conserjería</span>
                  </button>
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded border border-slate-850 text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4.5 h-4.5 text-amber-400" />
                    <span>Manual Rápido</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 4. PRESERVED OFFICIAL CREDITS */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-2 text-[9px] leading-relaxed">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Acreditaciones & Concepto</span>
            <div className="space-y-1 text-slate-400 font-mono">
              <p>
                <strong className="text-slate-300">Dirección Creativa y Concepto:</strong><br />
                Víctor M. León / ORBI Ecosystem.
              </p>
              <p>
                <strong className="text-slate-300">Co-diseño y Arquitectura:</strong><br />
                ChatGPT / OpenAI & Google AI Studio.
              </p>
            </div>
            <p className="text-[8px] text-slate-500 font-mono border-t border-slate-800 pt-1.5">
              “Construido bajo el protocolo de validación progresiva del Ecosistema ORBI.”
            </p>
          </div>

        </div>

      </div>

      {/* Manual Rápido Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 font-sans text-slate-300 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Manual de Operación Sentinel</h4>
                <p className="text-[10px] text-slate-400">Guía estándar para personal de vigilancia y administradores</p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 px-2.5 py-1 rounded text-[10px] font-mono"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>Esta plataforma centraliza el diagnóstico perimetral y el monitoreo simplificado. Siga estos 5 pasos clave para operar eficientemente:</p>
              <ol className="list-decimal pl-4 space-y-2 font-mono text-[11px] text-slate-400">
                <li>
                  <strong className="text-white">Monitoreo General:</strong> Ingrese a <span className="text-emerald-400">Live Wall</span> para verificar las cámaras asignadas y calibrar flujos.
                </li>
                <li>
                  <strong className="text-white">Log de Incidentes:</strong> Registre eventos, intrusiones o fallas de cámara en <span className="text-emerald-400">Incident Center</span>.
                </li>
                <li>
                  <strong className="text-white">Estado Técnico:</strong> Use <span className="text-emerald-400">CCTV Diagnostics</span> para revisar enlaces intermitentes y el Gateway de simulación local.
                </li>
                <li>
                  <strong className="text-white">Soporte Operativo:</strong> Si detecta anomalías complejas, solicite asistencia usando la acción rápida de contacto de soporte.
                </li>
                <li>
                  <strong className="text-white">Aceptación Interna:</strong> Acceda al <span className="text-emerald-400">Centro Avanzado &gt; Release Candidate Center</span> para revisar los locks globales de seguridad interna.
                </li>
              </ol>
            </div>
            
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-[10px] text-slate-400 font-mono leading-normal">
              <strong>Nota de Integridad:</strong> Esta guía ayuda a operar de forma segura evitando la fatiga cognitiva del personal operativo. Mantenga el Modo Simple para operaciones del día a día.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
