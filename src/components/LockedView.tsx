import React from "react";
import { Lock, ArrowLeft, ShieldCheck, UserCheck } from "lucide-react";

interface LockedViewProps {
  onBackToEasyView: () => void;
  onSwitchRole: (role: "conserje" | "admin" | "tecnico") => void;
  requiredRole?: string;
}

export default function LockedView({
  onBackToEasyView,
  onSwitchRole,
  requiredRole = "Administrador o Técnico de Terreno"
}: LockedViewProps) {
  return (
    <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6 my-12 backdrop-blur-md">
      <div className="relative mx-auto w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
        <Lock className="w-10 h-10 animate-pulse" id="lock-icon" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-sans font-bold text-white tracking-tight">
          🔒 Acceso Restringido — Modo Conserje Activo
        </h3>
        <p className="text-xs font-mono text-rose-400 uppercase tracking-widest">
          Requiere Nivel: {requiredRole}
        </p>
      </div>

      <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed max-w-md mx-auto space-y-2 text-left">
        <p>
          Las configuraciones avanzadas, diagnósticos de red, parámetros de enlaces de radio, telemetría PoE de switches, volcados de memoria y bovedas de claves en texto plano están **estrictamente bloqueados** para este rol operativo.
        </p>
        <p className="font-semibold text-slate-300">
          Esta restricción evita fatiga cognitiva, previene desconfiguraciones accidentales de red y resguarda la privacidad del condominio o parque solar.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={onBackToEasyView}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a EasyView</span>
        </button>

        <button
          onClick={() => onSwitchRole("admin")}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ingresar como Administrador</span>
        </button>

        <button
          onClick={() => onSwitchRole("tecnico")}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <UserCheck className="w-4 h-4" />
          <span>Ingresar como Técnico</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-500 font-mono">
        ORBI Sentinel IA • Foundation Stabilization Secure Sandbox
      </p>
    </div>
  );
}
