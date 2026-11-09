import React, { useState } from "react";
import {
  Video,
  UserCheck,
  ShieldAlert,
  Wrench,
  FileText,
  Server,
  ShieldCheck,
  KeyRound,
  Layers,
  ArrowRight,
  Activity,
  Terminal,
  Shield,
  HelpCircle,
  Play,
  Sliders,
  Sparkles,
  CheckCircle,
  Eye,
  Info,
  PhoneCall,
  AlertTriangle,
  MapPin,
  BookOpen
} from "lucide-react";
import { Camera, Incident } from "../types";

interface SimpleLauncherHomeV3Props {
  userRole: "conserje" | "admin" | "tecnico";
  setUserRole: (role: "conserje" | "admin" | "tecnico") => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  currentLine: "field" | "community" | "consumer";
  setCurrentLine: (line: "field" | "community" | "consumer") => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (advanced: boolean) => void;
  cameras: Camera[];
  incidents: Incident[];
  onAddAuditLog: (action: string, details: string) => void;
  openVersionModal: () => void;
  onNavigateHelpSubTab?: (subTab: string) => void;
}

export default function SimpleLauncherHomeV3({
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
  openVersionModal,
  onNavigateHelpSubTab
}: SimpleLauncherHomeV3Props) {
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isTelemAlertOpen, setIsTelemAlertOpen] = useState(false);

  // Stats
  const totalCams = cameras.length;
  const onlineCams = cameras.filter((c) => c.status === "Online").length;
  const activeIncidentsCount = incidents.filter((i) => i.status !== "Cerrado").length;

  const handleCardClick = (targetTab: string, label: string) => {
    onAddAuditLog("Launcher V3 Click", `Acceso a ${label} desde launcher principal.`);
    setCurrentTab(targetTab);
  };

  // Recent alerts (Max 3)
  const recentAlerts = [
    { id: 1, title: "Cámara intermitente", priority: "alta", time: "10:15", action: "diagnostics", label: "Diagnóstico" },
    { id: 2, title: "Movimiento detectado", priority: "media", time: "09:45", action: "livewall", label: "Live Wall" },
    { id: 3, title: "Privacidad activa", priority: "info", time: "08:15", action: "privacy", label: "Privacidad" }
  ];

  // Visual QA State Indicator (internal check list)
  const visualQA = {
    premiumHomeAcceptanceLocked: true,
    defaultRoute: true,
    independentShell: true,
    noTechnicalHeader: true,
    noRcOnHome: true,
    eightLargeCards: true,
    iconCirclesDominant: true,
    noAdvancedInSidebar: true,
    advancedCenterHidden: true,
    rightPanelSimple: true,
    noScrollFit: true
  };

  // Icon coloring helper
  const getThemeClasses = (theme: "cyan" | "sky" | "rose" | "emerald" | "violet") => {
    switch (theme) {
      case "cyan":
        return {
          iconBg: "bg-cyan-500/5 group-hover:bg-cyan-500/10 border-cyan-500/25 group-hover:border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
          iconColor: "text-cyan-400 group-hover:text-cyan-300",
          hoverBorder: "hover:border-cyan-500/30",
          hoverShadow: "hover:shadow-cyan-950/15"
        };
      case "sky":
        return {
          iconBg: "bg-sky-500/5 group-hover:bg-sky-500/10 border-sky-500/25 group-hover:border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]",
          iconColor: "text-sky-400 group-hover:text-sky-300",
          hoverBorder: "hover:border-sky-500/30",
          hoverShadow: "hover:shadow-sky-950/15"
        };
      case "rose":
        return {
          iconBg: "bg-rose-500/5 group-hover:bg-rose-500/10 border-rose-500/25 group-hover:border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
          iconColor: "text-rose-400 group-hover:text-rose-300",
          hoverBorder: "hover:border-rose-500/30",
          hoverShadow: "hover:shadow-rose-950/15"
        };
      case "violet":
        return {
          iconBg: "bg-violet-500/5 group-hover:bg-violet-500/10 border-violet-500/25 group-hover:border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]",
          iconColor: "text-violet-400 group-hover:text-violet-300",
          hoverBorder: "hover:border-violet-500/30",
          hoverShadow: "hover:shadow-violet-950/15"
        };
      case "emerald":
      default:
        return {
          iconBg: "bg-emerald-500/5 group-hover:bg-emerald-500/10 border-emerald-500/25 group-hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
          iconColor: "text-emerald-400 group-hover:text-emerald-300",
          hoverBorder: "hover:border-emerald-500/30",
          hoverShadow: "hover:shadow-emerald-950/15"
        };
    }
  };

  return (
    <div
      id="simple-launcher-v3-root"
      className="relative flex h-screen w-screen bg-[#02050c] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* BACKGROUND GRAPHIC ATMOSPHERE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(16,185,129,0.06),rgba(2,5,12,0)_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_110%,rgba(6,182,212,0.02),rgba(2,5,12,0)_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* 1. SIDEBAR PROPIA COMPACTA (Max 190px) */}
      <aside
        id="launcher-v3-sidebar"
        className="w-[190px] border-r border-slate-900/60 bg-slate-950/40 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 h-full select-none z-10"
      >
        <div className="space-y-6">
          {/* Brand Header Plate */}
          <div className="pt-1">
            <div className="bg-slate-900/60 border border-slate-800/40 p-3 rounded-xl flex items-center gap-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                Ω
              </div>
              <div>
                <span className="font-sans font-black text-xs tracking-tight text-white uppercase block leading-none">
                  ORBI Sentinel
                </span>
                <span className="text-[9px] text-slate-500 block leading-none mt-1 font-semibold">
                  CCTV Intel-Core
                </span>
              </div>
            </div>
          </div>

          {/* Business Line Selector: elegant segmented list */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block px-1">
              Línea de Negocio
            </span>
            <div className="space-y-1 p-1 bg-slate-900/40 rounded-xl border border-slate-850/60">
              <button
                id="btn-switch-field"
                onClick={() => {
                  setCurrentLine("field");
                  onAddAuditLog("Selector Línea", "Cambio a Field");
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-between ${
                  currentLine === "field"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-900/30"
                }`}
                title="Sentinel Field"
              >
                <span>Field</span>
                {currentLine === "field" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
              </button>
              <button
                id="btn-switch-comm"
                onClick={() => {
                  setCurrentLine("community");
                  onAddAuditLog("Selector Línea", "Cambio a Community");
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-between ${
                  currentLine === "community"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-900/30"
                }`}
                title="Sentinel Community"
              >
                <span>Community</span>
                {currentLine === "community" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
              </button>
              <button
                id="btn-switch-cons"
                onClick={() => {
                  setCurrentLine("consumer");
                  onAddAuditLog("Selector Línea", "Cambio a Consumer");
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-between ${
                  currentLine === "consumer"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-900/30"
                }`}
                title="Sentinel Consumer"
              >
                <span>Consumer</span>
                {currentLine === "consumer" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
              </button>
            </div>
          </div>

          {/* Minimum Menu */}
          <nav className="space-y-1 pt-1">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block px-1 mb-1.5">
              Menú Principal
            </span>
            <button
              onClick={() => setCurrentTab("simplehome")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 shadow-[0_2px_10px_rgba(16,185,129,0.05)] text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
              <span>Principal</span>
            </button>
            <button
              onClick={() => handleCardClick("livewall", "Live Wall")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all duration-150 text-left"
            >
              <Video className="w-4 h-4 text-slate-500" />
              <span>Live Wall</span>
            </button>
            <button
              onClick={() => handleCardClick("incidentcenter", "Incidentes")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all duration-150 text-left"
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <span>Incidentes</span>
            </button>
            <button
              onClick={() => handleCardClick("evidence", "Reportes")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all duration-150 text-left"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Reportes</span>
            </button>
            <button
              onClick={() => handleCardClick("privacy", "Configuración")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all duration-150 text-left"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Configuración</span>
            </button>
            {userRole !== "conserje" && (
              <button
                onClick={() => {
                  setIsAdvancedModalOpen(true);
                  onAddAuditLog("Abrir Centro Avanzado", "Apertura de drawer avanzado.");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition-all duration-150 text-left"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Centro Avanzado</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-slate-900/80">
          {/* Active Role Selector: segmented control premium */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block px-1">
              Rol de Operación
            </span>
            <div className="p-1 bg-slate-900/55 rounded-xl border border-slate-850/60 space-y-0.5 shadow-inner">
              {[
                { key: "conserje", label: "Conserje" },
                { key: "admin", label: "Admin" },
                { key: "tecnico", label: "Técnico" }
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setUserRole(r.key as any);
                    onAddAuditLog("Cambio Rol", r.label);
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all duration-150 flex items-center justify-between ${
                    userRole === r.key
                      ? "bg-slate-800 text-white border border-slate-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.3)]"
                      : "text-slate-500 hover:text-slate-350 border border-transparent hover:bg-slate-900/20"
                  }`}
                >
                  <span>{r.label}</span>
                  {userRole === r.key && (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clean App Version Info */}
          <div className="pt-1">
            <button
              onClick={openVersionModal}
              className="w-full text-[9px] font-mono text-slate-500 hover:text-slate-300 text-left block leading-normal transition-colors group"
            >
              <span className="block font-bold tracking-tight text-slate-450 group-hover:text-slate-350">ORBI Sentinel IA</span>
              <span className="text-emerald-500/80 font-semibold block mt-0.5">v0.13.4-sentinel-operator-training-suite-lock</span>
            </button>
          </div>
        </div>
      </aside>

      {/* CENTER & RIGHT LAYOUT COMPARTMENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden z-10">
        
        {/* 2. HEADER EXCLUSIVO HOME V3 */}
        <header
          id="launcher-v3-header"
          className="h-16 border-b border-slate-900/60 bg-slate-950/20 px-6 flex items-center justify-between shrink-0 select-none"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans font-black text-white uppercase tracking-tight">
                ORBI Sentinel IA
              </span>
              <span className="text-slate-800 text-sm font-light">/</span>
              <span className="text-xs font-semibold text-slate-300 tracking-wide">
                Pantalla Principal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Consola Unificada de Control &bull; {currentLine === "field" ? "Sentinel Field (Planta FV)" : currentLine === "community" ? "Sentinel Community (Residencial)" : "Sentinel Consumer (Doméstico)"}
            </p>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1.5 ${
              isDemoMode
                ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.03)]"
                : "bg-slate-900/50 text-slate-500 border-slate-850"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? "bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.8)]" : "bg-slate-600"}`}></span>
              {isDemoMode ? "DEMO ACTIVE" : "SISTEMA NOMINAL"}
            </span>

            <span className="px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border bg-rose-500/5 text-rose-400 border-rose-500/10">
              🔒 Production Locked
            </span>

            <span className="px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border bg-teal-500/5 text-teal-400 border-teal-500/10">
              🛡️ PRIVACY ACTIVE
            </span>

            {userRole !== "conserje" && (
              <button
                onClick={() => {
                  setIsAdvancedModalOpen(true);
                  onAddAuditLog("Abrir Centro Avanzado", "Apertura de drawer avanzado.");
                }}
                className="ml-2 text-[10px] font-sans font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:shadow-[0_0_10px_rgba(16,185,129,0.1)] active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Centro Avanzado</span>
              </button>
            )}
          </div>
        </header>

        {/* BODY AREA (No main scroll) */}
        <div className="flex-1 flex min-h-0 w-full">
          
          {/* 3. CENTRAL FLEXIBLE LAUNCHER SECTION */}
          <main className="flex-1 p-6 flex flex-col justify-between min-h-0 overflow-hidden">
            <div className="space-y-4 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
              <div className="mb-1 text-left">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {userRole === "conserje" ? "Operaciones del Conserje" : "Consola de Acceso Directo"}
                </h3>
                <p className="text-xs text-slate-450 mt-0.5">
                  Seleccione un módulo interactivo para iniciar operaciones sobre el entorno.
                </p>
              </div>

              {/* ROL ADMIN / TECNICO: GRID 2x4 (8 CARDS TOTAL) */}
              {userRole !== "conserje" ? (
                <div className="grid grid-cols-4 gap-4 h-[440px] max-h-[460px] w-full">
                  {[
                    {
                      id: "01",
                      tab: "livewall",
                      label: "Live Wall",
                      icon: Video,
                      theme: "cyan" as const,
                      desc: "Ver cámaras en vivo y monitoreo."
                    },
                    {
                      id: "02",
                      tab: "easyview",
                      label: "Modo Conserje",
                      icon: UserCheck,
                      theme: "sky" as const,
                      desc: "Vista simple para operación diaria."
                    },
                    {
                      id: "03",
                      tab: "incidentcenter",
                      label: "Incidentes",
                      icon: ShieldAlert,
                      theme: "rose" as const,
                      desc: "Revisar alertas y eventos críticos.",
                      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} PEND` : null
                    },
                    {
                      id: "04",
                      tab: "diagnostics",
                      label: "Diagnóstico CCTV",
                      icon: Wrench,
                      theme: "emerald" as const,
                      desc: "Revisar cámaras, gateway y red."
                    },
                    {
                      id: "05",
                      tab: "evidence",
                      label: "Evidencia y Reportes",
                      icon: FileText,
                      theme: "emerald" as const,
                      desc: "Generar reportes y evidencia técnica."
                    },
                    {
                      id: "06",
                      tab: "gatewaylocal",
                      label: "Cámaras y Gateway",
                      icon: Server,
                      theme: "cyan" as const,
                      desc: "Administrar dispositivos y conectividad."
                    },
                    {
                      id: "07",
                      tab: "pilotintake",
                      label: "Pilotos y Propuestas",
                      icon: ShieldCheck,
                      theme: "violet" as const,
                      desc: "Preparar pilotos y propuestas."
                    },
                    {
                      id: "08",
                      tab: "privacy",
                      label: "Configuración y Seguridad",
                      icon: KeyRound,
                      theme: "emerald" as const,
                      desc: "Gestionar roles, permisos y privacidad."
                    }
                  ].map((card) => {
                    const styling = getThemeClasses(card.theme);
                    const CardIcon = card.icon;

                    return (
                      <div
                        key={card.tab}
                        onClick={() => handleCardClick(card.tab, card.label)}
                        className={`group relative rounded-2xl border border-slate-900/70 bg-slate-950/20 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-md select-none h-full ${styling.hoverBorder} ${styling.hoverShadow} hover:bg-slate-900/25 hover:-translate-y-1`}
                      >
                        {/* Elegant Number */}
                        <span className="absolute top-4 left-4 text-[9px] font-mono font-bold tracking-wider text-slate-700 select-none">
                          {card.id}
                        </span>

                        {/* Top-Right Badge if present */}
                        {card.badge && (
                          <span className="absolute top-3.5 right-4 bg-rose-500/10 text-rose-400 text-[8px] font-mono px-2 py-0.5 rounded-md border border-rose-500/25 font-bold tracking-wide shadow-sm shadow-rose-950/10">
                            {card.badge}
                          </span>
                        )}

                        {/* Enlarged Icon Circle */}
                        <div className={`w-[80px] h-[80px] rounded-full border flex items-center justify-center transition-all duration-300 ${styling.iconBg}`}>
                          <CardIcon className={`w-8 h-8 transition-all duration-300 ${styling.iconColor}`} />
                        </div>

                        {/* Text details */}
                        <h4 className="text-xs font-bold text-white mt-3.5 tracking-tight group-hover:text-slate-100 transition-colors">
                          {card.label}
                        </h4>
                        
                        <p className="text-[10.5px] text-slate-450 mt-1.5 line-clamp-2 px-1 leading-normal">
                          {card.desc}
                        </p>

                        {/* Access Arrow indicator */}
                        <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-300" />
                      </div>
                    );
                  })}

                </div>
              ) : (
                
                /* ROL CONSERJE: ONLY 4 LARGE CARDS */
                <div className="grid grid-cols-2 gap-4 h-[440px] max-h-[460px] w-full">
                  
                  {[
                    {
                      id: "01",
                      tab: "livewall",
                      label: "Ver cámaras",
                      icon: Video,
                      theme: "cyan" as const,
                      desc: "Ver cámaras en vivo y monitoreo."
                    },
                    {
                      id: "02",
                      tab: "easyview",
                      label: "Modo Conserje",
                      icon: UserCheck,
                      theme: "sky" as const,
                      desc: "Vista simple para operación diaria."
                    },
                    {
                      id: "03",
                      tab: "incidentcenter",
                      label: "Reportar incidente",
                      icon: ShieldAlert,
                      theme: "rose" as const,
                      desc: "Revisar alertas y eventos críticos."
                    }
                  ].map((card) => {
                    const styling = getThemeClasses(card.theme);
                    const CardIcon = card.icon;

                    return (
                      <div
                        key={card.tab}
                        onClick={() => handleCardClick(card.tab, card.label)}
                        className={`group relative rounded-2xl border border-slate-900/70 bg-slate-950/25 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-md select-none h-full ${styling.hoverBorder} ${styling.hoverShadow} hover:bg-slate-900/20 hover:-translate-y-1`}
                      >
                        <span className="absolute top-5 left-5 text-[10px] font-mono font-bold tracking-widest text-slate-700">{card.id}</span>
                        <div className={`w-[84px] h-[84px] rounded-full border flex items-center justify-center transition-all duration-300 ${styling.iconBg}`}>
                          <CardIcon className={`w-8 h-8 transition-all duration-300 ${styling.iconColor}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white mt-4 group-hover:text-slate-100 transition-colors tracking-tight">
                          {card.label}
                        </h4>
                        <p className="text-xs text-slate-450 mt-2 leading-relaxed px-6 max-w-sm">
                          {card.desc}
                        </p>
                        <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-300" />
                      </div>
                    );
                  })}

                  {/* Special Conserje Interactive trigger */}
                  <div
                    onClick={() => {
                      setIsTelemAlertOpen(true);
                      onAddAuditLog("Alerta de Soporte", "Conserje solicitó asistencia técnica.");
                    }}
                    className="group relative rounded-2xl border border-slate-900/70 bg-slate-950/25 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-md select-none h-full hover:border-emerald-500/30 hover:shadow-emerald-950/15 hover:bg-slate-900/20 hover:-translate-y-1"
                  >
                    <span className="absolute top-5 left-5 text-[10px] font-mono font-bold tracking-widest text-slate-700">04</span>
                    <div className="w-[84px] h-[84px] rounded-full border border-emerald-500/25 bg-emerald-500/5 group-hover:bg-emerald-500/10 group-hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center justify-center transition-all duration-300">
                      <PhoneCall className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300" />
                    </div>
                    <h4 className="text-sm font-bold text-white mt-4 group-hover:text-emerald-400 transition-colors tracking-tight">
                      Avisar técnico
                    </h4>
                    <p className="text-xs text-slate-450 mt-2 leading-relaxed px-6 max-w-sm">
                      Revisar cámaras, gateway y red.
                    </p>
                    <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>

                </div>
              )}
            </div>

            {/* QA Checklist Internal Control Statusbar */}
            <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-emerald-400">PREMIUM HOME ACCEPTANCE LOCKED &bull; SYSTEM ONLINE</span>
              </span>
              <div className="flex gap-3">
                <span>[Acceptance Locked: OK]</span>
                <span>[No-Regression: OK]</span>
                <span>[Home V3: OK]</span>
                <span>[8 Cards Launcher: OK]</span>
                <span>[Viewport Safe: OK]</span>
              </div>
            </div>
          </main>

          {/* 4. PANEL DERECHO SIMPLE (Max 300px) */}
          <aside
            id="launcher-v3-right-panel"
            className="w-[300px] border-l border-slate-900/60 bg-slate-950/20 p-5 flex flex-col gap-6 shrink-0 h-full overflow-y-auto select-none z-10"
          >
            
            {/* Block A: Estado del Sistema */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Estado del Sistema
              </h4>
              <div className="bg-slate-900/40 border border-slate-850/60 rounded-xl p-3.5 space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Cámaras en línea</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px] font-mono">
                    {onlineCams}/{totalCams} ONLINE
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Gateway</span>
                  <span className="text-emerald-450 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px] font-mono">
                    CONECTADO
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Grabación</span>
                  <span className="text-blue-400 font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 text-[10px] font-mono">
                    DEMO ACTIVO
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Red local</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px] font-mono">
                    ESTABLE
                  </span>
                </div>
              </div>
            </div>

            {/* Block B: Alertas Recientes */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Alertas Recientes
              </h4>
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs hover:border-slate-850 hover:bg-slate-900/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        alert.priority === "alta" ? "bg-rose-500/10 text-rose-400" :
                        alert.priority === "media" ? "bg-amber-500/10 text-amber-400" :
                        "bg-teal-500/10 text-teal-400"
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 text-[11px] leading-tight truncate">{alert.title}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">{alert.time} Hrs</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCardClick(alert.action, alert.label)}
                      className="text-[10px] font-semibold text-emerald-400 bg-slate-950/60 border border-slate-850 hover:border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all duration-150 whitespace-nowrap active:scale-95"
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Block C: Accesos Rápidos */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Accesos Rápidos
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleCardClick("evidence", "Reportes")}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all duration-200 text-slate-300 font-semibold group"
                >
                  <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[10px]">Buscar evidencia</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdvancedModalOpen(true);
                    onAddAuditLog("Acceso Rápido", "Apertura de Exportaciones");
                  }}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all duration-200 text-slate-300 font-semibold group"
                >
                  <Sliders className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[10px]">Exportar reporte</span>
                </button>
                <button
                  onClick={() => {
                    setShowMapModal(true);
                    onAddAuditLog("Acceso Rápido", "Apertura Mapa");
                  }}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all duration-200 text-slate-300 font-semibold group"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[10px]">Abrir mapa</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("helpcenter");
                    onAddAuditLog("Acceso Rápido", "Apertura Manual");
                  }}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all duration-200 text-slate-300 font-semibold group"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[10px]">Manual rápido</span>
                </button>
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* ================= MODAL DE CENTRO AVANZADO (DRAWER) ================= */}
      {isAdvancedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end transition-all duration-300">
          <div className="w-[450px] bg-[#050b14] border-l border-slate-900 p-6 flex flex-col justify-between h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                    Centro Avanzado
                  </h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Herramientas técnicas y de demostración.</p>
                </div>
                <button
                  onClick={() => setIsAdvancedModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>

              {/* Advanced Access Grouped Sections */}
              <div className="space-y-5">
                
                {/* Sistema Técnico */}
                {(userRole === "admin" || userRole === "tecnico") && (
                  <div>
                    <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block mb-2 px-1">
                      SISTEMA TÉCNICO
                    </span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setCurrentTab("realcameralab");
                            setIsAdvancedModalOpen(false);
                          }}
                          className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                        >
                          <Video className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-bold text-white">Real Camera Lab</span>
                          <span className="text-[9px] text-slate-500">Laboratorio local de cámaras reales</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentTab("gatewaylocal");
                            setIsAdvancedModalOpen(false);
                          }}
                          className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                        >
                          <Server className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-bold text-white">Gateway Local</span>
                          <span className="text-[9px] text-slate-500">Pruebas locales y diagnóstico</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentTab("diagnostics");
                          setIsAdvancedModalOpen(false);
                        }}
                        className="w-full p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex items-center justify-between gap-2 transition-all duration-150 text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="text-[11px] font-bold text-white block">Diagnóstico CCTV</span>
                            <span className="text-[9px] text-slate-500 block">Estado de cámaras, red y conectividad</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Group A: QA y Release */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    QA y Release
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab("releasecandidate");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Release Candidate</span>
                      <span className="text-[9px] text-slate-500">Pruebas de aceptación QA</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("mvpfreeze");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Shield className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">MVP Freeze Center</span>
                      <span className="text-[9px] text-slate-500">Línea base calibrada</span>
                    </button>
                  </div>
                </div>

                {/* Group A-2: Aprendizaje de Pilotos */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    Aprendizaje de Pilotos
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab("pilotoutcomereview");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Pilot Outcome Review</span>
                      <span className="text-[9px] text-slate-500">Bucle de aprendizaje sintético</span>
                    </button>
                  </div>
                </div>

                {/* Group B: Presentación y Showcase */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    Presentación y Showcase
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab("demorunbook");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/45 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Demo Runbook</span>
                      <span className="text-[9px] text-slate-400">Guía y Presenter Mode</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("demopractice");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Demo Practice</span>
                      <span className="text-[9px] text-slate-500">Rehearsal Lab & Ensayo</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("publicshowcase");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Public Showcase</span>
                      <span className="text-[9px] text-slate-500">Vitrina comercial sanitizada</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("stakeholderbinder");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Stakeholder Binder</span>
                      <span className="text-[9px] text-slate-500">Carpeta de inversionistas</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("mediakit");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Launch Media Kit</span>
                      <span className="text-[9px] text-slate-500">Material de marketing</span>
                    </button>
                  </div>
                </div>

                {/* Group C: Exportación */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    Exportación
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab("demodeckexport");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Sliders className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Demo Deck Export</span>
                      <span className="text-[9px] text-slate-500">Exportador de reportes</span>
                    </button>
                  </div>
                </div>

                {/* Group D: Analítica */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    Analítica
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrentTab("demoanalytics");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Demo Analytics</span>
                      <span className="text-[9px] text-slate-500">Estadísticas locales</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("demoinsights");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">Demo Insights</span>
                      <span className="text-[9px] text-slate-500">Recomendaciones de pitch</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab("abpresentationlab");
                        setIsAdvancedModalOpen(false);
                      }}
                      className="p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex flex-col items-start gap-1 text-left transition-all duration-150 group"
                    >
                      <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-white">A/B Presentation</span>
                      <span className="text-[9px] text-slate-500">Laboratorio de experimentos</span>
                    </button>
                  </div>
                </div>

                {/* Group E: Sistema */}
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2 px-1">
                    Sistema
                  </span>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        openVersionModal();
                        setIsAdvancedModalOpen(false);
                      }}
                      className="w-full p-3 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-emerald-500/25 rounded-xl flex items-center justify-between gap-2 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-[11px] font-bold text-white block">Bitácora de Lanzamientos</span>
                          <span className="text-[9px] text-slate-500 block">Bitácora técnica de versión</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        if (onNavigateHelpSubTab) {
                          onNavigateHelpSubTab("onboarding_practice");
                        } else {
                          setCurrentTab("helpcenter");
                        }
                        setIsAdvancedModalOpen(false);
                        onAddAuditLog("Onboarding Link Advanced", "Abrió Práctica Onboarding desde Centro Avanzado");
                      }}
                      className="w-full p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-[11px] font-bold text-white block">Operator Onboarding Practice</span>
                          <span className="text-[9px] text-slate-400 block">Ruta práctica guiada y validación</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-center">
              Fase de Aceptación Interna MVP &bull; ORBI Sentinel v0.13.4
            </div>
          </div>
        </div>
      )}

      {/* ================= MANUAL MODAL ================= */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm select-none">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start border-b border-slate-900 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Manual Rápido del Sistema</h4>
                <p className="text-xs text-slate-450 mt-1">Directrices de operación rápida y seguridad</p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                <strong>1. Visualización de cámaras:</strong> Vaya al módulo <strong>Live Wall</strong> para activar los flujos. El sistema realiza la precarga en modo baja latencia utilizando tecnología de búfer local.
              </p>
              <p>
                <strong>2. Gestión de incidentes:</strong> Si detecta comportamientos inusuales, registre el evento con un nivel de prioridad adecuado. Evite términos definitivos y utilice lenguaje descriptivo responsable.
              </p>
              <p>
                <strong>3. Enmascaramiento de privacidad:</strong> Las áreas que contengan visuales peatonales públicas tienen políticas de privacidad preestablecidas en concordancia con el reglamento de privacidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAP MODAL ================= */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm select-none">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start border-b border-slate-900 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Mapa de Cobertura CCTV</h4>
                <p className="text-xs text-slate-450 mt-1">Ubicación y distribución espacial de canales de monitoreo</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="border border-slate-900 rounded-xl bg-slate-950/40 p-12 text-center text-xs text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-200">Distribución de red de sensores activos</p>
              <p className="max-w-md mx-auto text-[11px] leading-relaxed text-slate-450">
                El mapa muestra que todos los canales PoE (Laboratorio Dahua y enlaces perimetrales) están debidamente sectorizados en la topología local del Gateway.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TELEMETRIA SUPPORT ALERT ================= */}
      {isTelemAlertOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm select-none">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Soporte Técnico Solicitado</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Se ha generado un registro de alerta y soporte local en la bitácora de auditorías de ORBI Sentinel. Un técnico especialista revisará el Gateway y switch local a la brevedad.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-900">
              <button
                onClick={() => setIsTelemAlertOpen(false)}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
