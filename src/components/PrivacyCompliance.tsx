import React, { useState } from "react";
import { Shield, EyeOff, FileText, CheckCircle, Clipboard, Lock, AlertCircle, Info } from "lucide-react";

interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
  role: string;
}

interface PrivacyComplianceProps {
  auditLogs?: AuditLog[];
  onAddAuditLog?: (action: string, details: string) => void;
  userRole?: "conserje" | "admin" | "tecnico";
}

export default function PrivacyCompliance({
  auditLogs: propAuditLogs,
  onAddAuditLog,
  userRole = "admin"
}: PrivacyComplianceProps) {
  const [privacyModeActive, setPrivacyModeActive] = useState(true);
  const [maskMinors, setMaskMinors] = useState(true);
  const [maskNeighborWindows, setMaskNeighborWindows] = useState(true);
  const [exportLoggedId, setExportLoggedId] = useState<string | null>(null);

  // Initial local mock audit log fallback
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLog[]>([
    { timestamp: "2026-07-05 10:45:12", user: "Eduardo Gómez", action: "Visualización de Canal", details: "Hall Conserjería Las Condes (En vivo)", role: "Conserje" },
    { timestamp: "2026-07-05 09:30:15", user: "Sofía Martínez", action: "Exportación de Evidencia", details: "Suceso inc-94124 en Parque Parral", role: "Administrador" },
    { timestamp: "2026-07-05 08:15:00", user: "Patricio Solar", action: "Modificación de Regla", details: "Filtro de vegetación en CAM-Inversores", role: "Técnico" },
    { timestamp: "2026-07-05 02:11:10", user: "Eduardo Gómez", action: "Verificación de Vault", details: "Intento lectura de clave Dahua LAB", role: "Conserje" }
  ]);

  const activeAuditLogs = propAuditLogs || localAuditLogs;

  const handleSimulateExport = () => {
    if (onAddAuditLog) {
      onAddAuditLog("Exportación de Evidencia", "Reporte compilado para Auditoría Externa v0.1.4 (Soporte Técnico)");
    } else {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog: AuditLog = {
        timestamp,
        user: "Soporte Técnico ORBI",
        action: "Exportación de Evidencia",
        details: "Reporte compilado para Auditoría Externa v0.1.0",
        role: "Técnico"
      };
      setLocalAuditLogs([newLog, ...localAuditLogs]);
    }
    setExportLoggedId("simulated");
    setTimeout(() => setExportLoggedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          Demo Mode: Previsualización de Privacidad
        </div>
        <h3 className="text-lg font-sans font-semibold text-white">Sentinel Privacy & Compliance (Privacidad y Normativa)</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
          Regula el cumplimiento legal en base a leyes de protección de datos personales y normativas de resguardo de infraestructuras críticas. 
          <span className="text-emerald-400 font-semibold"> [Vista Conceptual]</span> El enmascaramiento facial dinámico (Privacy Shield) y la pixelación de zonas colindantes se muestran aquí como una simulación interactiva de diseño y se validarán con flujos de video reales una vez conectado el Gateway local.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Privacy Toggles (Privacy Shield) */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <h4 className="font-sans font-semibold text-white text-sm">Privacy Shield (Enmascaramiento)</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Activa el enmascaramiento en tiempo real por software. Bloquea espacios privados, rostros de menores de edad o fachadas de vecinos.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {/* Master privacy toggle */}
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block text-[11px]">Modo de Privacidad General</span>
                <span className="text-[10px] text-slate-400">Protección de rostros activos</span>
              </div>
              <button
                onClick={() => setPrivacyModeActive(!privacyModeActive)}
                className={`px-3 py-1 text-[10px] font-bold rounded ${
                  privacyModeActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}
              >
                {privacyModeActive ? "ACTIVO" : "INACTIVO"}
              </button>
            </div>

            {/* Mask Minors */}
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block text-[11px]">Enmascarar Menores</span>
                <span className="text-[10px] text-slate-400">Protección en plazas y piscina</span>
              </div>
              <button
                onClick={() => setMaskMinors(!maskMinors)}
                className={`px-3 py-1 text-[10px] font-bold rounded ${
                  maskMinors ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}
              >
                {maskMinors ? "ACTIVO" : "INACTIVO"}
              </button>
            </div>

            {/* Mask Neighbor Windows */}
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block text-[11px]">Ocultar Ventanas Vecinas</span>
                <span className="text-[10px] text-slate-400">Enmascarar fuera de deslindes</span>
              </div>
              <button
                onClick={() => setMaskNeighborWindows(!maskNeighborWindows)}
                className={`px-3 py-1 text-[10px] font-bold rounded ${
                  maskNeighborWindows ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}
              >
                {maskNeighborWindows ? "ACTIVO" : "INACTIVO"}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-[11px] text-slate-400 leading-normal">
            <span className="font-bold text-slate-300 block mb-1">✓ Cero imágenes sensibles en Demos:</span>
            Ningún stream de demostración en ORBI Sentinel utiliza ni expondrá filmaciones reales de recintos familiares o menores. Toda la telemetría perimetral está protegida.
          </div>
        </div>

        {/* Center column: Audit Log Trail */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h4 className="font-sans font-semibold text-white text-sm">Registro de Auditoría de Accesos</h4>
              </div>

              <button
                onClick={handleSimulateExport}
                className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
              >
                Auditar Exportación
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Toda visualización en vivo, descarga de clips o cambio de claves queda auditado en el registro de auditoría protegido de Sentinel.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {activeAuditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.2 rounded border border-slate-800 font-bold">
                      {log.role}
                    </span>
                  </div>
                  <div className="text-slate-200">
                    <strong className="text-white">{log.user}</strong> hizo: <span className="text-emerald-400">{log.action}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Detalles: {log.details}</p>
                </div>
              ))}
            </div>
          </div>

          {exportLoggedId && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono font-bold text-center animate-pulse mt-4">
              ✓ Log de exportación guardado con firma segura.
            </div>
          )}
        </div>

        {/* Right column: Regulatory guidelines & Environment Separation */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-semibold text-white text-sm">Separación Legal de Entornos</h4>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-normal">
              <div className="space-y-1">
                <span className="font-bold text-white block">A. Modo Demo Lab:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Para fines de prueba, toda la telemetría e incidentes son simulados, permitiendo probar la robustez del sistema sin conectar cámaras físicas reales.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white block">B. Modo Producción con Acceso Autorizado:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Solo se activan conexiones reales con cámaras físicas previas firmas de actas de seguridad técnica por parte del cliente administrador o gerente operacional del parque solar.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white block">C. No Exposición de Claves:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  El motor AI y los generadores de reportes automáticos filtran cualquier intento de incluir tokens de autenticación o claves del Access Vault, protegiendo contra filtraciones.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-slate-400 font-mono leading-relaxed mt-4">
            <strong>Validación de Cumplimiento:</strong> Sentinel se ajusta a la legislación vigente de protección de la privacidad en espacios comunes residenciales y subestaciones eléctricas nacionales.
          </div>
        </div>

      </div>
    </div>
  );
}
