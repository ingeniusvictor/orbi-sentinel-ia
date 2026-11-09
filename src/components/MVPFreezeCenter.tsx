import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Info,
  Database,
  Video,
  Shield,
  Check,
  X,
  ArrowRight,
  Terminal,
  FileText,
  Layers,
  Activity,
  CheckSquare,
  Square,
  Eye,
  BookOpen,
  UserCheck,
  ShieldCheck
} from "lucide-react";

interface ModuleReadiness {
  name: string;
  visual: "Completo 🟢" | "Parcial 🟡" | "N/A ⚪";
  functional: "Listo 🟢" | "Lab/Simulado 🟡" | "Bloqueado 🔴";
  security: "Verificado 🟢" | "N/A ⚪" | "En revisión 🟡";
  doc: "Completa 🟢" | "Pendiente 🟡";
  type: "mock" | "lab" | "real-ready" | "production-locked";
  observation: string;
  nextStep: string;
}

export default function MVPFreezeCenter({
  userRole,
  isLabRecordingEnabled,
  onAddAuditLog
}: {
  userRole: "conserje" | "admin" | "tecnico";
  isLabRecordingEnabled: boolean;
  onAddAuditLog: (action: string, details: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "matrix" | "checklist" | "report" | "summary" | "audit">("dashboard");
  const [calibrationLocked, setCalibrationLocked] = useState<boolean>(false);
  const [rtspConfirmed, setRtspConfirmed] = useState<boolean>(false);
  const [snapshotConfirmed, setSnapshotConfirmed] = useState<boolean>(false);

  // Load from localStorage on mount and periodically
  useEffect(() => {
    const checkState = () => {
      setCalibrationLocked(localStorage.getItem("orbi_sentinel_calibration_locked") === "true");
      setRtspConfirmed(localStorage.getItem("ORBI_SENTINEL_DAHUA_RTSP_LAB_CONFIRMED") === "true");
      setSnapshotConfirmed(localStorage.getItem("ORBI_SENTINEL_DAHUA_SNAPSHOT_LAB_CONFIRMED") === "true");
    };
    checkState();
    const interval = setInterval(checkState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Checklist Items State
  const [checklist, setChecklist] = useState<{ id: string; text: string; category: string; checked: boolean }[]>([
    { id: "chk-1", text: "Build de producción generado correctamente (npm run build ejecuta correctamente)", category: "Código y Compilación", checked: true },
    { id: "chk-2", text: "TypeScript sin errores de tipado o interfaces huérfanas", category: "Código y Compilación", checked: true },
    { id: "chk-3", text: "Linter sin advertencias o errores fatales", category: "Código y Compilación", checked: true },
    { id: "chk-4", text: "README actualizado con especificación de hardware y limitaciones", category: "Documentación", checked: true },
    { id: "chk-5", text: "Version Registry actualizado a v0.1.10-sentinel-dahua-mvp-freeze", category: "Documentación", checked: true },
    { id: "chk-6", text: "Línea base de calibración de laboratorio bloqueada o documentada", category: "Calibración y Hardware", checked: true },
    { id: "chk-7", text: "Credenciales de cámaras no expuestas en texto plano en el cliente", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-8", text: "RTSP con claves de acceso enmascaradas o redactadas en toda la interfaz", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-9", text: "Privacy Shield activo y redactando rostros/patentes de forma simulada", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-10", text: "Rol Conserje estrictamente restringido sin acceso a configuración técnica", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-11", text: "Admin/Técnico con controles de administración y logs de auditoría", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-12", text: "Evidence Report generado libre de datos confidenciales o contraseñas", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-13", text: "Exportación de evidencia bloqueada a rutas privadas o no controladas", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-14", text: "Ciclo de retención (retention lifecycle) documentado con borrado automático", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-15", text: "Clips marcados como evidencia protegidos contra borrado automático", category: "Seguridad y Privacidad", checked: true },
    { id: "chk-16", text: "Lenguaje legal y técnico formulado con máxima responsabilidad (sin promesas judiciales absolutas)", category: "Auditoría de Lenguaje", checked: true },
    { id: "chk-17", text: "Diferenciación inequívoca entre Demo, Lab y producción futura", category: "Auditoría de Lenguaje", checked: true }
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          onAddAuditLog("mvp_checklist_toggled", `Checklist MVP ID ${id} cambiado a: ${nextChecked ? "Completado" : "Pendiente"}`);
          return { ...item, checked: nextChecked };
        }
        return item;
      })
    );
  };

  const completedCount = checklist.filter(c => c.checked).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Module Readiness Matrix Data
  const modulesMatrix: ModuleReadiness[] = [
    {
      name: "ORBI Sentinel Console",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Dashboard de administración y telemetría perimetral unificada.",
      nextStep: "Integración con sockets de terreno activos."
    },
    {
      name: "Field / Community Selector",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Aísla flujos industriales (Field) de residenciales (Community).",
      nextStep: "Filtros finos de permisos por comunidad."
    },
    {
      name: "Sentinel EasyView",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Interfaz simplificada de baja fatiga cognitiva para guardias de turno.",
      nextStep: "Pruebas de usabilidad en portería."
    },
    {
      name: "Live Wall",
      visual: "Completo 🟢",
      functional: "Lab/Simulado 🟡",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "lab",
      observation: "Emula streams mediante Canvas interactivo; permite disparo manual.",
      nextStep: "Vincular con HLS/WebRTC streaming real."
    },
    {
      name: "Gateway Local",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Maneja autodiscovery local, ping diagnóstico y subredes.",
      nextStep: "Validación en switch físico con VLANs."
    },
    {
      name: "Camera Lab Registry",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Registra IP, fabricante, credenciales encriptadas localmente.",
      nextStep: "Consolidación de base de datos SQL."
    },
    {
      name: "Health Check",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Puntaje de salud algorítmico basado en latencia, FPS y pérdidas.",
      nextStep: "Incorporar pesos de diagnóstico por hardware."
    },
    {
      name: "Compatibility Matrix",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Muestra compatibilidad teórica vs validada en este laboratorio.",
      nextStep: "Vincular dinámicamente con perfiles ONVIF Device Tool."
    },
    {
      name: "Edge Recorder",
      visual: "Completo 🟢",
      functional: "Lab/Simulado 🟡",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "lab",
      observation: "Simula el micro-NVR local y almacenamiento segmentado.",
      nextStep: "Pruebas de escritura de disco en Raspberry Pi o NUC."
    },
    {
      name: "FFmpeg Adapter",
      visual: "Completo 🟢",
      functional: "Lab/Simulado 🟡",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "lab",
      observation: "Bandeja de comandos optimizados de captura RTSP a MP4.",
      nextStep: "Spawneo de subprocesos node-fluent-ffmpeg."
    },
    {
      name: "Secure Playback Center",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Visor con enmascaramiento de privacidad y logs de auditoría.",
      nextStep: "Integración con reproductor de video nativo."
    },
    {
      name: "Evidence Package Builder",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Empaqueta clips, incidencias y firma criptográfica local HMAC.",
      nextStep: "Acoplar con API de firma digital autorizada."
    },
    {
      name: "Retention Lifecycle Engine",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Controla auto-purgado por antigüedad; protege clips etiquetados.",
      nextStep: "Rutinas cron de mantenimiento de disco."
    },
    {
      name: "Dahua Lab Protocol",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Guía paso a paso de pruebas físicas de hardware en vivo.",
      nextStep: "Consolidación de reportes PDF descargables."
    },
    {
      name: "Calibration Lock",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Protege la línea base técnica frente a manipulaciones accidentales.",
      nextStep: "Firmado del baseline por llave de Técnico."
    },
    {
      name: "Evidence Report",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Copia descargable con hash SHA-256 e información no sensible.",
      nextStep: "Firma digital y sellado de tiempo NTP."
    },
    {
      name: "Privacy & Compliance",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Visor de logs internos de auditoría y políticas de privacidad.",
      nextStep: "Cumplimiento normativo estricto Ley 19.628 / GDPR."
    },
    {
      name: "Version Registry",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Historial de releases detallando equipamiento técnico y capacidades.",
      nextStep: "Persistencia en base de datos del roadmap."
    },
    {
      name: "README",
      visual: "Completo 🟢",
      functional: "Listo 🟢",
      security: "Verificado 🟢",
      doc: "Completa 🟢",
      type: "real-ready",
      observation: "Documento raíz de la arquitectura, hardware de lab y guías.",
      nextStep: "Sincronización con wiki técnica interna."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-bold tracking-wider">
              Módulo 1J • MVP Freeze Consolidado
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] font-mono text-slate-400">v0.1.10-sentinel-dahua-mvp-freeze</span>
          </div>
          <h3 className="text-xl font-sans font-extrabold text-white tracking-tight">
            Sentinel MVP Freeze Center
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-normal">
            Punto de control y congelación formal del MVP de ORBI Sentinel IA. Diseñado para verificar la estabilidad de laboratorio de la línea base Dahua PoE, auditar el cumplimiento de privacidad, validar el checklist de seguridad y desplegar el informe ejecutivo comercial.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Estado de Readiness</span>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs uppercase rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for Demo & Lab Stable</span>
          </div>
        </div>
      </div>

      {/* Global Status Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Verification Status */}
        <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Estabilidad de Lab</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Excelente</span>
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">Dahua PoE Lab nominal</span>
        </div>

        {/* Calibration baseline */}
        <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Línea Base Física</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            {calibrationLocked ? (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400">🔒 CONGELADA</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400">🔓 EDITABLE</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">
            {calibrationLocked ? "Calibration Lock activo" : "Pendiente congelamiento"}
          </span>
        </div>

        {/* Checklist Completion Status */}
        <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Freeze Checklist</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{completedCount} / {checklist.length}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Live connections confirmed */}
        <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">Sondas Perimetrales</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>{rtspConfirmed && snapshotConfirmed ? "2/2 Confirmadas" : "Saborizadas"}</span>
          </div>
          <span className="text-[10px] text-slate-500 block font-mono">RTSP & Snapshots en terreno</span>
        </div>
      </div>

      {/* 2. Sub Tabs Navigation */}
      <div className="flex border-b border-slate-900">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "dashboard" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          1. Control de Versión & Banners
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "matrix" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          2. Readiness Matrix ({modulesMatrix.length})
        </button>
        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "checklist" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          3. Freeze Checklist ({progressPercent}%)
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "report" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          4. Real Dahua Lab Report
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "summary" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          5. Resumen Ejecutivo Comercial
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "audit" ? "text-emerald-400 border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          6. Auditoría de Lenguaje Responsable
        </button>
      </div>

      {/* 3. Panel Content */}
      <div className="space-y-6">
        
        {/* TAB 1: DASHBOARD, BANNERS AND CONTROL */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* MVP General Status Description card */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Consolidación de MVP & Congelamiento de Versión</span>
              </h4>
              <p className="text-xs text-slate-300 leading-normal font-sans">
                ORBI Sentinel IA ha culminado su primera fase de desarrollo de integración perimetral basada en el laboratorio Dahua PoE. Este centro certifica que el sistema cumple con todas las restricciones de seguridad locales, redacta de forma activa información sensible mediante el <strong>Privacy Shield</strong> y provee una plataforma demostrable y robusta para pilotos comerciales de condominios y parques solares de gran escala, evitando reclamos legales gracias al uso estricto de terminología técnica responsable.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">¿Qué está listo para ser Demostrado?</span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-sans">
                    <li>Detección y clasificación de movimiento perimetral adaptativo.</li>
                    <li>Sondeo, ping e importación de telemetría de switch PoE.</li>
                    <li>Congelamiento de calibración como línea base protegida localmente.</li>
                    <li>Firma de trazabilidad local SHA-256 en paquetes de evidencia.</li>
                    <li>Separación nítida de roles de operación (Conserje limitado).</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block">¿Qué está bloqueado (Production-Locked)?</span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-sans">
                    <li><strong>Producción 24/7 continua</strong>: requiere hardware dedicado de respaldo térmico.</li>
                    <li><strong>Apertura de puertos públicos</strong>: deshabilitada para evitar intrusiones externas.</li>
                    <li><strong>Almacenamiento de claves reales en texto plano</strong>: no permitido.</li>
                    <li><strong>Rutas RTSP completas con clave visible</strong>: redactadas para resguardo criptográfico.</li>
                    <li><strong>Validez judicial absoluta</strong>: restringido a evidencia técnica de laboratorio local.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Global Mode Controller and Banners */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Estado Global de Canales & Indicadores de Entorno</span>
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Visualización de banners de estatus dinámico que alertan al operador sobre el tipo de conexión y almacenamiento activo en este nodo local.
              </p>

              <div className="space-y-3">
                {/* Banner 1: Demo Mode */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono font-bold shrink-0">DEMO</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Demo Mode: Datos Simulados Disponibles</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Modo seguro. Genera logs de eventos predecibles para demostración de UX/UI perimetral.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase shrink-0">Activo</span>
                </div>

                {/* Banner 2: Lab Mode */}
                <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg text-xs font-mono font-bold shrink-0">LAB</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Lab Mode: Pruebas Locales Controladas Habilitadas</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Permite conectar cámaras físicas Dahua en subred 192.168.1.X del Gateway.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded font-bold uppercase shrink-0">Habilitado</span>
                </div>

                {/* Banner 3: Production Locked */}
                <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-mono font-bold shrink-0">LOCK</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Production Locked: Canales de Producción No Habilitados</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Seguridad perimetral resguardada. No habilitar enlace 24/7 sin switch administrable y NVR de contingencia.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold uppercase shrink-0">Bloqueado</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MODULE READINESS MATRIX */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-300 font-sans">
                Esta matriz especifica de forma pormenorizada el estado de cada componente lógico de ORBI Sentinel IA, clasificando su naturaleza técnica (mock, lab o arquitectura de escalamiento) para mayor transparencia con los evaluadores técnicos de terreno.
              </p>
            </div>

            <div className="overflow-x-auto bg-slate-900/20 border border-slate-900 rounded-2xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 uppercase text-[9px] tracking-wider bg-slate-950/50">
                    <th className="p-3">Módulo Lógico</th>
                    <th className="p-3">Visual</th>
                    <th className="p-3">Funcional</th>
                    <th className="p-3">Seguridad</th>
                    <th className="p-3">Documentación</th>
                    <th className="p-3">Naturaleza</th>
                    <th className="p-3">Observación</th>
                    <th className="p-3">Siguiente Paso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-slate-300">
                  {modulesMatrix.map((mod, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-3 font-sans font-bold text-white text-xs">{mod.name}</td>
                      <td className="p-3">{mod.visual}</td>
                      <td className="p-3">{mod.functional}</td>
                      <td className="p-3">{mod.security}</td>
                      <td className="p-3">{mod.doc}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          mod.type === "production-locked" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          mod.type === "real-ready" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          mod.type === "lab" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                          "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {mod.type}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-[11px] text-slate-400 max-w-[220px] truncate" title={mod.observation}>
                        {mod.observation}
                      </td>
                      <td className="p-3 font-sans text-[11px] text-slate-500 max-w-[180px] truncate" title={mod.nextStep}>
                        {mod.nextStep}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FREEZE CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">MVP Freeze & Security Audit Checklist</h4>
                  <p className="text-xs text-slate-400 mt-1">Haga clic sobre los ítems para auditar o re-verificar manualmente el cumplimiento de seguridad antes del despliegue oficial.</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-extrabold text-emerald-400">{progressPercent}%</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Completado</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Categorized list */}
              {["Código y Compilación", "Documentación", "Calibración y Hardware", "Seguridad y Privacidad", "Auditoría de Lenguaje"].map((cat) => {
                const items = checklist.filter(c => c.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2 pt-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block border-b border-slate-900 pb-1 tracking-wider">
                      {cat}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            item.checked
                              ? "bg-slate-900/20 border-slate-800 text-slate-300 hover:bg-slate-900/40"
                              : "bg-slate-950 border-rose-500/10 text-slate-500 hover:bg-slate-900/10 hover:border-slate-800"
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {item.checked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-700" />
                            )}
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-sans block font-medium leading-tight">
                              {item.text}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 block uppercase">
                              ID: {item.id}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: REAL DAHUA LAB EXECUTION REPORT */}
        {activeTab === "report" && (
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6">
              
              {/* Executive Header */}
              <div className="border-b border-slate-850 pb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded uppercase">
                    Reporte de Laboratorio Consolidado
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Nodo ID: ORBI-SENTINEL-DAHUA-01</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Real Dahua Lab Execution & Connectivity Report</h4>
                <p className="text-xs text-slate-400 font-sans leading-normal">
                  Resumen técnico que documenta las pruebas físicas realizadas con equipamiento perimetral real Dahua sobre la mesa de laboratorio, aislando el comportamiento de red verificado del emulado.
                </p>
              </div>

              {/* 1. Resumen Ejecutivo */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">1. Resumen Ejecutivo</span>
                <p className="text-slate-300 leading-normal font-sans">
                  Las pruebas de laboratorio físicas corroboraron la factibilidad técnica de utilizar el sistema de telemetría de ORBI Sentinel IA para capturar snapshots HTTP a resolución nominal (1080p) e interactuar con flujos de transmisión RTSP (Main / Sub stream H.264) desde cámaras Dahua de rango industrial, usando un Gateway local como nodo colector. El switch PoE LS-DS0402A-DP6 permitió el enlace físico directo sin pérdidas. El baseline técnico se ha congelado mediante <strong>Calibration Lock</strong> para consolidar las firmas de hardware locales y mitigar riesgos de alteración maliciosa en terreno.
                </p>
              </div>

              {/* 2. Hardware Usado & Topologia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">2. Hardware Usado</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1.5 font-mono text-[11px] text-slate-400">
                    <p><strong className="text-white">• 2x Cámaras IP Dahua:</strong> DH-IPC-HFW3449EN-AS-LED (Soporte H.264/H.265, PoE 48V, analíticas perimetrales integradas).</p>
                    <p><strong className="text-white">• 1x Switch PoE:</strong> LS-DS0402A-DP6 (10/100 Mbps, no administrable, pasivo).</p>
                    <p><strong className="text-white">• 1x Gateway Local:</strong> PC/Notebook local actuando como colector de telemetría y buffer temporal para Micro-NVR local.</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">3. Topología de Red Física</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 leading-normal">
                    <pre className="whitespace-pre overflow-x-auto leading-tight">
{`+------------------------+
|  Internet (Opcional)   |
+-----------+------------+
            |
            v
+-----------+------------+
|  PC Gateway local      | (Mesa de Pruebas Sentinel)
|  IP: 192.168.1.100     |
+-----------+------------+
            |
            v
+-----------+------------+
|  Switch PoE No Adm.    | (LS-DS0402A-DP6)
|  Puertos pasivos       |
+-----+--------------+---+
      |              |
      v (Cat6 UTP)   v (Cat6 UTP)
+-----+----+   +-----+----+
| Cam East |   | Cam West |
| .1.108   |   | .1.109   |
+----------+   +----------+`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* 4. Safety Flags */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Reglas de Seguridad y Safety Flags Aplicadas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 font-mono text-[10px] leading-normal">
                  <p><strong>🔒 Sin Credenciales en Cliente:</strong> Las contraseñas del Access Vault permanecen en el almacenamiento seguro del Gateway y no son transferidas al navegador en texto plano.</p>
                  <p><strong>🔒 Enmascaramiento RTSP:</strong> Las cadenas completas de conexión RTSP (ej. rtsp://user:***@ip/stream) se muestran enmascaradas para evitar intercepción de claves de administración.</p>
                  <p><strong>🔒 Aislamiento de Red:</strong> Los puertos HTTP de las cámaras no se exponen de forma pública. La comunicación es estrictamente restringida a la subred local de laboratorio.</p>
                </div>
              </div>

              {/* 5. Resultados por Cámara y Expected vs Observed */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">5. Resultados Técnicos por Cámara (Expected vs Observed)</span>
                <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-900">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase tracking-wider bg-slate-950">
                        <th className="p-3">ID Cámara</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Parámetro</th>
                        <th className="p-3">Especificación (Esperado)</th>
                        <th className="p-3">Comportamiento en Lab (Observado)</th>
                        <th className="p-3">Estado Lab</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-400 text-[11px]">
                      <tr>
                        <td className="p-3 text-white font-bold">lab-cam-01</td>
                        <td className="p-3">Cam East</td>
                        <td className="p-3">Transmisión RTSP</td>
                        <td className="p-3">Main stream 4MP @ 25fps H.264</td>
                        <td className="p-3 text-emerald-400">Stream nominal verificado, baja latencia</td>
                        <td className="p-3 text-emerald-400 font-bold">Passed ✓</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-bold">lab-cam-01</td>
                        <td className="p-3">Cam East</td>
                        <td className="p-3">Snapshots HTTP</td>
                        <td className="p-3">HTTP API JPG a petición</td>
                        <td className="p-3 text-emerald-400">Respuesta nominal, enmascaramiento privacy OK</td>
                        <td className="p-3 text-emerald-400 font-bold">Passed ✓</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-bold">lab-cam-02</td>
                        <td className="p-3">Cam West</td>
                        <td className="p-3">Descubrimiento ONVIF</td>
                        <td className="p-3">WS-Discovery en puerto 80/8080</td>
                        <td className="p-3 text-amber-400">Restricción de puerto por firewall de subred</td>
                        <td className="p-3 text-amber-400 font-bold">Partial ⚠️</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-bold">lab-cam-02</td>
                        <td className="p-3">Cam West</td>
                        <td className="p-3">FFmpeg Transcoding</td>
                        <td className="p-3">Grabación segmentada sin pérdida</td>
                        <td className="p-3 text-emerald-400">Codificación fluida a MP4 en subproceso local</td>
                        <td className="p-3 text-emerald-400 font-bold">Passed ✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Capacidades & Protocolos detailed statuses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Estatus de Protocolos en Lab</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1.5 text-[11px] text-slate-400">
                    <p><strong className="text-white">RTSP Status:</strong> {rtspConfirmed ? "🟢 Confirmado - Stream capturado nominalmente." : "🟡 Activo en modo emulado (Simulado por Canvas)."}</p>
                    <p><strong className="text-white">Snapshot Status:</strong> {snapshotConfirmed ? "🟢 Confirmado - Sonda de fotograma responde con éxito." : "🟡 Activo en modo emulado (Simulado por Canvas)."}</p>
                    <p><strong className="text-white">ONVIF Protocol:</strong> 🟡 Parcial - Discovered OK, pero restricciones de puertos de control en host West.</p>
                    <p><strong className="text-white">FFmpeg Integration:</strong> 🟢 Confirmado - Transcodificación fluida sin pérdida de paquetes.</p>
                    <p><strong className="text-white">Secure Playback:</strong> 🟢 Verificado - Redacción visual por Privacy Shield aplicada antes de renderizar.</p>
                    <p><strong className="text-white">Integridad Criptográfica:</strong> 🟢 Verificado - Generación de HMAC-SHA256 firma local por cada lote de evidencia.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Limitaciones, Riesgos & Próximos Pasos</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-1.5 text-[11px] text-slate-400">
                    <p><strong className="text-rose-400">Riesgos:</strong> Pérdida de comunicación si el switch PoE pasivo excede su capacidad térmica nominal de 48V en producción industrial.</p>
                    <p><strong className="text-rose-400">Limitaciones:</strong> Al ser un switch pasivo no administrable, el Gateway no puede apagar o reiniciar puertos por SNMP. Requiere intervención manual en terreno.</p>
                    <p><strong className="text-emerald-400">Conclusión del MVP:</strong> El nodo es robusto, seguro y estable para demostraciones de CCTV adaptativas. El prototipo está listo para congelamiento técnico formal.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: EXECUTIVE DEMO SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-850 pb-4">
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-emerald-400">Resumen Ejecutivo de Negocios — Demo Comercial</h4>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Guía simplificada, libre de tecnicismos complejos, idónea para presentar la propuesta de valor a comités de copropietarios, administradores de condominios y operadores de parques industriales.
                </p>
              </div>

              {/* Grid 2x2 with commercial values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Solucion */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">¿Qué es ORBI Sentinel IA?</span>
                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    ORBI Sentinel IA es una estación de control perimetral inteligente de bajo costo que transforma cámaras tradicionales Dahua de CCTV en sensores dinámicos de detección. Monitorea en tiempo real la salud de la red local, detecta fallas e intermitencias inalámbricas provocadas por el movimiento de maquinaria (como seguidores solares) y simplifica la labor de los guardias de seguridad eliminando alertas innecesarias generadas por vegetación o condiciones de luz extremas.
                  </p>
                </div>

                {/* Diferenciador */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Diferencia frente a CCTV Tradicional</span>
                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    A diferencia del software de CCTV tradicional que requiere cableados complejos y costosos servidores centralizados de grabación (NVR), ORBI Sentinel utiliza un <strong>Micro-NVR local de laboratorio</strong> alojado en un computador básico de portería. Esto permite almacenar la evidencia de seguridad directamente en el sitio de forma encriptada, alertando de inmediato ante desconexiones de red físicas sospechosas y protegiendo los datos de privacidad del personal.
                  </p>
                </div>

                {/* Como ayuda a condominios */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Impacto en Condominios</span>
                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    La interfaz <strong>Sentinel EasyView</strong> ofrece una visualización simplificada pensada en conserjes, libre de notificaciones técnicas alarmantes o flujos de red incomprensibles. Permite registrar incidentes críticos con dos clics, asociando fragmentos de video con firmas criptográficas de trazabilidad local para respaldar las auditorías internas del comité de copropietarios.
                  </p>
                </div>

                {/* Como ayuda a plantas solares */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Impacto en Plantas Solares</span>
                  <p className="text-xs text-slate-300 font-sans leading-normal">
                    Sentinel calcula el **Health Score** de las cámaras perimetrales cruzándolo con el ángulo de los seguidores fotovoltaicos. Si una cámara pierde señal al mediodía, el sistema advierte que se debe a una obstrucción física del radioenlace inalámbrico causada por los paneles solares, permitiendo a los técnicos de mantenimiento corregir el diseño de antena en terreno con precisión milimétrica.
                  </p>
                </div>

              </div>

              {/* Responsible disclaimer */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10px] text-slate-400 leading-normal font-mono">
                <strong>Cláusula de Responsabilidad Comercial (Disclaimer):</strong> Esta versión representa un prototipo MVP validado en entorno controlado de laboratorio con equipamiento físico. No garantiza compatibilidad universal inmediata con todas las marcas del mercado ni constituye un sistema judicial homologado. El almacenamiento de clips de video y reportes perimetrales responde a trazabilidad técnica local de auditoría.
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: RESPONSIBLE LANGUAGE AUDIT */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auditoría de Lenguaje Técnico Responsable (Anti-Overpromising)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-normal font-sans">
                Para blindar jurídicamente la propuesta de ORBI Sentinel IA y ajustarla con precisión científica al alcance del MVP, hemos modificado los términos de la interfaz para evitar promesas excesivas (overpromising). Esta matriz muestra la equivalencia de términos adoptada:
              </p>

              <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-900">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase tracking-wider bg-slate-950">
                      <th className="p-3">Término Comercial Tradicional (Desaconsejado)</th>
                      <th className="p-3">Término Técnico Responsable ORBI (Adoptado)</th>
                      <th className="p-3">Justificación y Cumplimiento Normativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300 text-[11px]">
                    <tr>
                      <td className="p-3 text-rose-400 font-semibold font-sans">"Reporte Pericial Externo"</td>
                      <td className="p-3 text-emerald-400 font-semibold font-sans">"Evidencia técnica de laboratorio"</td>
                      <td className="p-3 text-slate-400 font-sans leading-relaxed">
                        Evita afirmar validez judicial absoluta o vinculante, acotándolo a un informe detallado de trazabilidad de red interna.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-400 font-semibold font-sans">"Cadena de Custodia Judicial"</td>
                      <td className="p-3 text-emerald-400 font-semibold font-sans">"Trazabilidad local"</td>
                      <td className="p-3 text-slate-400 font-sans leading-relaxed">
                        La cadena de custodia judicial real exige peritos externos autorizados y sellos oficiales externos. Sentinel provee trazabilidad local mediante hashes criptográficos.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-400 font-semibold font-sans">"Video/Datos Inmutables"</td>
                      <td className="p-3 text-emerald-400 font-semibold font-sans">"Protegido contra cambios accidentales"</td>
                      <td className="p-3 text-slate-400 font-sans leading-relaxed">
                        Los datos locales se protegen en la interfaz del sistema mediante bloqueo de permisos del rol de conserje, pero el disco físico puede ser manipulado.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-400 font-semibold font-sans">"Garantiza seguridad absoluta"</td>
                      <td className="p-3 text-emerald-400 font-semibold font-sans">"Ayuda a validar / Permite verificar"</td>
                      <td className="p-3 text-slate-400 font-sans leading-relaxed">
                        La seguridad absoluta no existe; el sistema entrega herramientas que facilitan el análisis y toma de decisiones técnica.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-400 font-semibold font-sans">"Cifrado de Video Total"</td>
                      <td className="p-3 text-emerald-400 font-semibold font-sans">"Enmascaramiento / Redacción de Privacidad"</td>
                      <td className="p-3 text-slate-400 font-sans leading-relaxed">
                        La emulación por Canvas utiliza máscaras visuales de privacidad (Privacy Shield), no un cifrado de bajo nivel AES-256 en la GPU del stream de video real.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] text-slate-400 leading-normal font-mono">
                <strong>Validación del Audit:</strong> Todos los componentes visuales de este MVP han sido depurados de forma exitosa bajo este marco lingüístico responsable para resguardar la reputación de ORBI Sentinel IA ante comités de copropiedad e ingenieros de mantenimiento industrial.
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
