import React, { useState } from "react";
import { Sparkles, Shield, Clock, Eye, Sliders, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";

interface ContextProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  rules: {
    event: string;
    consequence: string;
    severity: "Bajo" | "Medio" | "Crítico";
  }[];
}

const CONTEXT_PROFILES: ContextProfile[] = [
  {
    id: "planta-solar",
    name: "Planta Solar / Faena",
    icon: "☀️",
    description: "Optimizado para perímetros extensos, protección de subestaciones y tolerancia a la oscilación de seguidores solares (trackers).",
    rules: [
      { event: "Persona en zona de inversores fuera de horario laboral", consequence: "Alerta máxima. Envío inmediato de patrulla de seguridad.", severity: "Crítico" },
      { event: "Cámara pierde señal en momentos de máxima elevación de trackers", consequence: "Diagnóstico automático: Interferencia física por panel. No disparar intrusión.", severity: "Bajo" },
      { event: "Animal silvestre detectado cruzando cerco perimetral", consequence: "Alerta informativa media. Ignorar si vuelve a salir.", severity: "Medio" },
      { event: "Movimiento por sombras de paneles durante el mediodía", consequence: "Filtro dinámico de sombras activo. Clasificado como falso positivo.", severity: "Bajo" }
    ]
  },
  {
    id: "condominio",
    name: "Condominio / Comunidad",
    icon: "🏢",
    description: "Diseñado para resguardo residencial común, conserjería remota y control estricto de accesos vehiculares de madrugada.",
    rules: [
      { event: "Movimiento en hall de acceso durante el día", consequence: "Flujo peatonal normal de residentes. Tránsito registrado.", severity: "Bajo" },
      { event: "Persona detenida en portón vehicular de madrugada por más de 3 minutos", consequence: "Comportamiento inusual detectado. Notificar a guardia de turno.", severity: "Crítico" },
      { event: "Portón vehicular queda abierto de forma permanente", consequence: "Alerta de puerta abierta. Desencadenar aviso acústico en conserjería.", severity: "Medio" },
      { event: "Movimiento en zona de piscina/quincho fuera de horario habilitado", consequence: "Ingreso no autorizado. Alerta acústica local simulada.", severity: "Medio" }
    ]
  },
  {
    id: "casa-depto",
    name: "Casa / Departamento",
    icon: "🏠",
    description: "Prioridad en privacidad familiar con Privacy Shield. Excluye filmación de espacios públicos de vecinos.",
    rules: [
      { event: "Tránsito normal de residentes en living", consequence: "Ignorar. Modo Privacidad Familiar activo (No transmitir/No registrar).", severity: "Bajo" },
      { event: "Mascota detectada en patio exterior", consequence: "Notificación informativa simple al teléfono del propietario.", severity: "Bajo" },
      { event: "Persona desconocida asomándose a ventana exterior", consequence: "Alerta inmediata y encendido de foco disuasor perimetral.", severity: "Crítico" }
    ]
  },
  {
    id: "bodega",
    name: "Bodega / Centro de Logística",
    icon: "📦",
    description: "Control de inventario, detección de camiones en andenes y prevención de intrusiones en techumbre.",
    rules: [
      { event: "Presencia en andén de carga no agendado a las 02:00 AM", consequence: "Posible robo interno o descarga clandestina. Alerta crítica.", severity: "Crítico" },
      { event: "Cruce de línea IVS en escaleras de emergencia de cubierta", consequence: "Intrusión en altura. Generar aviso preventivo a central.", severity: "Crítico" },
      { event: "Presencia de roedores en pasillos de acopio", consequence: "Alerta de control sanitario. Registrar en bitácora semanal.", severity: "Bajo" }
    ]
  },
  {
    id: "oficina",
    name: "Oficina / Corporativo",
    icon: "💻",
    description: "Control de aforo, detección de permanencia sospechosa y alarmas tras horario de oficina.",
    rules: [
      { event: "Tránsito peatonal de 09:00 a 18:00 hrs", consequence: "Horario hábil. Registro de afluencia estándar.", severity: "Bajo" },
      { event: "Persona permaneciendo inmóvil en bóveda o sala TI de noche", consequence: "Intrusión de alta prioridad. Activar grabación a máxima calidad.", severity: "Crítico" }
    ]
  }
];

export default function ContextAI() {
  const [activeProfileId, setActiveProfileId] = useState("planta-solar");
  const [noiseFilters, setNoiseFilters] = useState({
    vegetation: true,
    shadows: true,
    insects: true,
    trackers: true,
    rain: false
  });

  const activeProfile = CONTEXT_PROFILES.find(p => p.id === activeProfileId) || CONTEXT_PROFILES[0];

  // Behavior learning mock states
  const mockCamerasLearning = [
    { name: "CAM-Portón Vehicular", hours: "Picos de flujo: 07:30-09:30 y 18:00-20:30.", risk: "Movimiento de 01:00 a 05:00 AM es inusual (Riesgo: Medio-Alto)" },
    { name: "CAM-Inversores Solar 3", hours: "Flujo humano esperado solo lunes a viernes 08:30-17:30.", risk: "Cualquier presencia nocturna o en fin de semana genera alarma (Riesgo: Crítico)" },
    { name: "CAM-Hall Conserjería", hours: "Movimiento continuo 24 horas.", risk: "Pérdida de señal o cámara tapada por más de 1 minuto (Riesgo: Crítico)" }
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          Fase Lab: Algoritmos Conceptuales
        </div>
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel Context AI & Behavior Baseline</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
          La inteligencia artificial de Sentinel no interpreta de igual manera un parque solar aislado que un condominio residencial. 
          <span className="text-amber-400 font-semibold"> [Simulación de Laboratorio]</span> Este módulo demuestra cómo se modela el comportamiento esperado y cómo el filtro heurístico inteligente de ruido simula la inhibición de falsas alarmas. Los porcentajes indicados corresponden a objetivos teóricos de laboratorio pendientes de calibración en terreno.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Context Profile selector */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="font-sans font-semibold text-white text-sm">Perfil de Entorno Contextual</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecciona un entorno para ver cómo cambian automáticamente las reglas de decisión de la IA de ORBI.
          </p>

          <div className="space-y-2">
            {CONTEXT_PROFILES.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setActiveProfileId(prof.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  activeProfileId === prof.id
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900/40 hover:text-white"
                }`}
              >
                <span className="text-2xl shrink-0">{prof.icon}</span>
                <div>
                  <span className="text-xs font-bold block">{prof.name}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{prof.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center column: Dynamic Context Rules */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Reglas Activas: {activeProfile.name}</h4>
            </div>

            <div className="space-y-3">
              {activeProfile.rules.map((rule, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-slate-200">{rule.event}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      rule.severity === "Crítico"
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : rule.severity === "Medio"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Acción IA: {rule.consequence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono mt-4">
            <strong>Inteligencia de Borde:</strong> El Sentinel Gateway compila estas lógicas a nivel local, previniendo disparos de alarmas redundantes hacia la administración.
          </div>
        </div>

        {/* Right column: Noise Filter and Behavior Baseline */}
        <div className="space-y-6">
          
          {/* Noise Filter (Filtro anti-falsas alarmas) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Filtro Anti-Falsas Alarmas (Lab)</h4>
            </div>
            
            <p className="text-xs text-slate-400">
              Simulación de algoritmos heurísticos diseñados para atenuar perturbaciones ambientales.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Vegetation */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-white font-bold block text-[11px]">Vegetación y Viento</span>
                  <span className="text-[10px] text-slate-500">Reducción Teórica: ~92%</span>
                </div>
                <button
                  onClick={() => setNoiseFilters(prev => ({ ...prev, vegetation: !prev.vegetation }))}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${
                    noiseFilters.vegetation ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {noiseFilters.vegetation ? "ACTIVO" : "INACTIVO"}
                </button>
              </div>

              {/* Shadows */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-white font-bold block text-[11px]">Sombras y Nubes</span>
                  <span className="text-[10px] text-slate-500">Reducción Teórica: ~95%</span>
                </div>
                <button
                  onClick={() => setNoiseFilters(prev => ({ ...prev, shadows: !prev.shadows }))}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${
                    noiseFilters.shadows ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {noiseFilters.shadows ? "ACTIVO" : "INACTIVO"}
                </button>
              </div>

              {/* Trackers */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-white font-bold block text-[11px]">Giro de Panel / Trackers</span>
                  <span className="text-[10px] text-slate-500">Reducción Teórica: ~99%</span>
                </div>
                <button
                  onClick={() => setNoiseFilters(prev => ({ ...prev, trackers: !prev.trackers }))}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${
                    noiseFilters.trackers ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {noiseFilters.trackers ? "ACTIVO" : "INACTIVO"}
                </button>
              </div>
            </div>
          </div>

          {/* Behavior Baseline (Aprendizaje de rutinas) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Behavior Baseline (Rutinas)</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Sentinel mapea rutinas horarias normales para estimar un puntaje de anomalía contextual.
            </p>

            <div className="space-y-3 font-mono text-[10px]">
              {mockCamerasLearning.map((cam, idx) => (
                <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 space-y-1">
                  <span className="font-bold text-white block">{cam.name}</span>
                  <p className="text-slate-400">• {cam.hours}</p>
                  <p className="text-emerald-400">• {cam.risk}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
