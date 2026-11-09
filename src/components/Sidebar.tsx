import React from "react";
import {
  LayoutDashboard,
  Video,
  KeyRound,
  ShieldAlert,
  Wrench,
  FileText,
  Terminal,
  Server,
  UserCheck,
  PlusCircle,
  HardDrive,
  Sparkles,
  HelpCircle,
  Shield,
  Lock,
  User,
  ShieldCheck,
  ClipboardList,
  Compass,
  Building,
  FileVideo,
  Activity,
  LineChart,
  Sliders,
  BookOpen,
  Layers
} from "lucide-react";
import { VersionRegistry } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  versionRegistry: VersionRegistry;
  systemStatus: "Normal" | "Mantenimiento" | "Alerta";
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  currentLine: "field" | "community" | "consumer";
  setCurrentLine: (line: "field" | "community" | "consumer") => void;
  userRole: "conserje" | "admin" | "tecnico";
  setUserRole: (role: "conserje" | "admin" | "tecnico") => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (advanced: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  versionRegistry,
  systemStatus,
  isDemoMode,
  toggleDemoMode,
  currentLine,
  setCurrentLine,
  userRole,
  setUserRole,
  isAdvancedMode,
  setIsAdvancedMode,
}: SidebarProps) {
  
  // Dynamically build menu groups based on role and simple/advanced mode
  const menuGroups = [];

  if (userRole === "conserje") {
    menuGroups.push({
      title: "Principal",
      items: [
        { id: "simplehome", label: "Pantalla Principal", icon: LayoutDashboard },
        { id: "livewall", label: "Live Wall", icon: Video },
        { id: "easyview", label: "Modo Conserje", icon: UserCheck },
        { id: "incidentcenter", label: "Incidentes", icon: ShieldAlert },
        { id: "helpcenter", label: "Centro de Ayuda", icon: BookOpen },
      ]
    });
  } else if (!isAdvancedMode) {
    // Modo Simple (Sidebar Mínima)
    menuGroups.push({
      title: "Principal",
      items: [
        { id: "simplehome", label: "Pantalla Principal", icon: LayoutDashboard },
        { id: "livewall", label: "Live Wall", icon: Video },
        { id: "easyview", label: "Modo Conserje", icon: UserCheck },
        { id: "incidentcenter", label: "Incidentes", icon: ShieldAlert },
        { id: "helpcenter", label: "Centro de Ayuda", icon: BookOpen },
      ]
    });

    menuGroups.push({
      title: "Sistema",
      items: [
        { id: "toggle_advanced", label: "Centro Avanzado", icon: Layers },
      ]
    });
  } else {
    // Modo Avanzado (Completo)
    menuGroups.push({
      title: "Principal",
      items: [
        { id: "simplehome", label: "Pantalla Principal", icon: LayoutDashboard },
        { id: "livewall", label: "Live Wall", icon: Video },
        { id: "easyview", label: "Modo Conserje", icon: UserCheck },
        { id: "incidentcenter", label: "Incidentes", icon: ShieldAlert },
        { id: "diagnostics", label: "Diagnóstico", icon: Wrench },
        { id: "evidence", label: "Reportes", icon: FileText },
        { id: "helpcenter", label: "Centro de Ayuda", icon: BookOpen },
      ]
    });

    menuGroups.push({
      title: "Gestión",
      items: [
        { id: "gatewaylocal", label: "Cámaras y Gateway", icon: Server },
        { id: "pilotintake", label: "Pilotos y Propuestas", icon: ShieldCheck },
        { id: "customerpilotworkspace", label: "Customer Pilot Workspace", icon: ClipboardList },
        { id: "privacy", label: "Privacidad y Seguridad", icon: Shield },
      ]
    });

    menuGroups.push({
      title: "Módulos Avanzados",
      items: [
        { id: "customerpilotsimulator", label: "Customer Pilot Simulator", icon: Activity },
        { id: "pilotoutcomereview", label: "Pilot Outcome Review", icon: LineChart },
        { id: "realcameralab", label: "Real Camera Lab", icon: FileVideo },
        { id: "demodeckexport", label: "Exportaciones", icon: FileText },
        { id: "publicshowcase", label: "Showcase", icon: Sparkles },
        { id: "releasecandidate", label: "Release Candidate", icon: ShieldCheck },
        { id: "demopractice", label: "Demo Practice", icon: Activity },
      ]
    });

    menuGroups.push({
      title: "Sistema",
      items: [
        { id: "toggle_advanced", label: "Modo Avanzado: Activo", icon: Layers },
        { id: "accessvault", label: "Configuración", icon: KeyRound },
      ]
    });
  }

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-100 flex-shrink-0 select-none overflow-hidden">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl tracking-wider shrink-0">
            Ω
          </div>
          <div>
            <h1 className="font-sans font-bold text-base tracking-tight leading-none text-white">
              ORBI Sentinel <span className="text-emerald-400">IA</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
              Control inteligente de entornos
            </p>
          </div>
        </div>

        {/* Business Line Selector */}
        <div className="mt-4 grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setCurrentLine("field");
              setCurrentTab("simplehome");
            }}
            className={`py-1.5 rounded-md text-[9px] font-mono font-bold uppercase transition-all ${
              currentLine === "field"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            🛰️ Field
          </button>
          <button
            onClick={() => {
              setCurrentLine("community");
              setCurrentTab("simplehome");
            }}
            className={`py-1.5 rounded-md text-[9px] font-mono font-bold uppercase transition-all ${
              currentLine === "community"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            🏢 Comm
          </button>
          <button
            onClick={() => {
              setCurrentLine("consumer");
              setCurrentTab("simplehome");
            }}
            className={`py-1.5 rounded-md text-[9px] font-mono font-bold uppercase transition-all ${
              currentLine === "consumer"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            🏠 Cons
          </button>
        </div>
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-800">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 mb-1 font-bold">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isLocked = userRole === "conserje" && !["simplehome", "easyview", "livewall", "incidentcenter", "communitypilot", "fieldoperations", "publicdemohub"].includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "toggle_advanced") {
                      setIsAdvancedMode(!isAdvancedMode);
                      setCurrentTab("simplehome");
                    } else {
                      setCurrentTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 text-xs font-medium ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-300 hover:bg-slate-900/60 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isLocked && (
                    <Lock className="w-3 h-3 text-slate-600 shrink-0" title="Restringido para Conserjes" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Demo Controller & Version Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80 shrink-0 space-y-3.5">
        
        {/* Dynamic Role Selector */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block px-1">
            Rol de Operación Activo
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setUserRole("conserje");
                setCurrentTab("simplehome");
              }}
              title="Conserje de Seguridad"
              className={`py-1 rounded text-[9px] font-mono font-bold transition-all ${
                userRole === "conserje"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Conserje
            </button>
            <button
              onClick={() => setUserRole("admin")}
              title="Administrador del Sistema"
              className={`py-1 rounded text-[9px] font-mono font-bold transition-all ${
                userRole === "admin"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setUserRole("tecnico")}
              title="Técnico de Red / Instalador"
              className={`py-1 rounded text-[9px] font-mono font-bold transition-all ${
                userRole === "tecnico"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Técnico
            </button>
          </div>
        </div>

        {/* Lab/Demo Mode Switcher */}
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono font-medium text-slate-300">Modo Demo / Lab</span>
            </div>
            <button
              onClick={toggleDemoMode}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
            {isDemoMode
              ? "Simulando intermitencias reales (Alhué trackers, Alto Bella Vista sin clave)."
              : "Estado por defecto (Dahua PoE Lab funcionando con normalidad)."}
          </p>
        </div>

        {/* Version Badge */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            Core: ORBI Vision
          </span>
          <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
            {versionRegistry.version}
          </span>
        </div>
      </div>
    </aside>
  );
}
