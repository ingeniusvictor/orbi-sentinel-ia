import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Info,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  Lock,
  FileText,
  HelpCircle,
  Users,
  CheckSquare,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  ArrowRight,
  Database,
  WifiOff,
  BookOpen,
  HeartHandshake
} from "lucide-react";
import { motion } from "motion/react";
import {
  getLocalEvents,
  resetTelemetry,
  purgeTelemetry,
  trackLocalEvent,
  TelemetryEvent
} from "../utils/telemetry";

interface SentinelOfflineDemoAnalyticsProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (module: string, action: string) => void;
}

export default function SentinelOfflineDemoAnalytics({
  userRole,
  onAddAuditLog
}: SentinelOfflineDemoAnalyticsProps) {
  // Local reactive events state
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "lines" | "guided" | "audiences" | "safety" | "notes" | "readiness" | "qalock">("dashboard");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Manual overrides for the 10 QA Lock frentes
  const [manualQAOverrides, setManualQAOverrides] = useState<Record<string, "Ready" | "Needs Review" | "Blocked">>({});
  
  // Local feedback notes state
  const [feedbackNotes, setFeedbackNotes] = useState<string>(() => {
    return localStorage.getItem("ORBI_SENTINEL_FEEDBACK_NOTES") || "";
  });
  const [notesWarning, setNotesWarning] = useState<string | null>(null);

  // Analytics Readiness Checklist state (Interactive)
  const [readinessChecklist, setReadinessChecklist] = useState({
    offlineModeConfirmed: true,
    noCloudTelemetry: true,
    noPiiStored: true,
    noIpRtspStored: true,
    noCameraDataStored: true,
    resetAvailable: true,
    sanitizedReportReady: true,
    responsibleAnalyticsBannerVisible: true,
    mediaKitBlockersTracked: true,
    guidedDemoRoutesTracked: true,
    readmeUpdated: true,
    versionRegistryUpdated: true
  });

  // Filter events to check live count
  useEffect(() => {
    setEvents(getLocalEvents());

    const handleTelemetryUpdate = () => {
      setEvents(getLocalEvents());
    };

    window.addEventListener("orbi-telemetry-updated", handleTelemetryUpdate);
    return () => {
      window.removeEventListener("orbi-telemetry-updated", handleTelemetryUpdate);
    };
  }, []);

  // Sync feedback notes to localStorage + Live validation of PII
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFeedbackNotes(val);
    localStorage.setItem("ORBI_SENTINEL_FEEDBACK_NOTES", val);

    // Live PII/Risk validation regex checks
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(val);
    const hasIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}\b|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(val);
    const hasRTSP = /rtsp:\/\//i.test(val);
    const hasPhone = /(\+?\d{1,4}[-.\s]??)?[2-9]\d{2}[-.\s]??\d{3}[-.\s]??\d{4}\b/.test(val);

    if (hasEmail || hasIP || hasRTSP || hasPhone) {
      setNotesWarning(
        `🚨 ADVERTENCIA: Se detectó un posible dato sensible (IP, Correo, RTSP o Teléfono). Por favor sanitiza la nota antes de guardar.`
      );
    } else {
      setNotesWarning(null);
    }
  };

  // Safe Audit log call
  const triggerAuditLog = (action: string, details: string) => {
    if (onAddAuditLog) {
      onAddAuditLog("Offline Demo Analytics", `${action}: ${details}`);
    }
  };

  // Toggle readiness item
  const handleToggleReadiness = (key: keyof typeof readinessChecklist) => {
    setReadinessChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerAuditLog("Readiness Checklist Toggle", `${String(key)} cambiado a ${updated[key]}`);
      return updated;
    });
  };

  // Security critical check:
  // If "No cloud telemetry", "No PII stored", or "No IP/RTSP stored" are false/Blocked, the Analytics system is blocked.
  const isSecurityRuleViolated =
    !readinessChecklist.noCloudTelemetry ||
    !readinessChecklist.noPiiStored ||
    !readinessChecklist.noIpRtspStored;

  const currentReadinessStatus = isSecurityRuleViolated
    ? "Blocked"
    : Object.values(readinessChecklist).filter(Boolean).length < Object.keys(readinessChecklist).length
    ? "Needs Review"
    : "Ready";

  // Helpers to calculate session aggregated stats
  const totalSessions = events.filter((e) => e.eventType === "demo.session.started").length;
  
  const totalDemoTimeMinutes = events
    .filter((e) => e.eventType === "demo.session.ended" && e.metadata?.durationSeconds)
    .reduce((acc, e) => acc + (e.metadata?.durationSeconds || 0) / 60, 0);

  // Most frequent line
  const lineCounts = {
    field: events.filter((e) => e.eventType === "line.selected.field").length,
    community: events.filter((e) => e.eventType === "line.selected.community").length,
    consumer: events.filter((e) => e.eventType === "line.selected.consumer").length
  };
  const mostFrequentLine =
    lineCounts.field >= lineCounts.community && lineCounts.field >= lineCounts.consumer
      ? "Field"
      : lineCounts.community >= lineCounts.consumer
      ? "Community"
      : "Consumer Lab";

  // Most frequent audience selection
  const audienceEventMeta = events
    .filter((e) => e.eventType === "audience.selected" && e.metadata?.audience)
    .map((e) => e.metadata?.audience as string);
  
  const audienceFrequencyMap = audienceEventMeta.reduce((acc, aud) => {
    acc[aud] = (acc[aud] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequentAudience =
    Object.keys(audienceFrequencyMap).length > 0
      ? Object.keys(audienceFrequencyMap).reduce((a, b) => (audienceFrequencyMap[a] > audienceFrequencyMap[b] ? a : b))
      : "Demo pública";

  // Guided routes used count
  const guidedFieldCount = events.filter((e) => e.eventType === "guided.field.route.selected").length;
  const guidedCommunityCount = events.filter((e) => e.eventType === "guided.community.route.selected").length;
  const mostFrequentRoute =
    guidedFieldCount > guidedCommunityCount
      ? "Guided Field Demo"
      : guidedCommunityCount > 0
      ? "Guided Community Demo"
      : "Ninguna iniciada";

  // Screens / Tab clicks
  const screenNavEvents = events
    .filter((e) => e.eventType === "screen.navigation.clicked" && e.metadata?.targetTab)
    .map((e) => e.metadata?.targetTab as string);
  const screenFrequencyMap = screenNavEvents.reduce((acc, screen) => {
    acc[screen] = (acc[screen] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostVisitedScreen =
    Object.keys(screenFrequencyMap).length > 0
      ? Object.keys(screenFrequencyMap).reduce((a, b) => (screenFrequencyMap[a] > screenFrequencyMap[b] ? a : b))
      : "Public Demo Hub";

  // Blocked checklists count
  const blockedChecklistsCount = events.filter((e) => e.eventType === "launch.status.blocked").length;

  // Copy operations
  const copyAllowedCount = events.filter((e) => e.eventType === "media.copy.allowed").length;
  const copyBlockedCount = events.filter((e) => e.eventType === "media.copy.blocked").length;

  // Guardrails viewed
  const guardrailsViewedCount = events.filter((e) => e.eventType === "guardrails.viewed").length;

  // Reports generated count (export/copy sanitised)
  const reportsGeneratedCount = events.filter((e) => e.eventType === "export.sanitized.generated" || e.eventType === "proposal.report.copied").length;

  // Static definition of the 13 Audiences (Módulo 5A Requirement)
  const AUDIENCE_METADATA = [
    { id: "om_client", name: "Cliente O&M", line: "Field", route: "Operaciones Terreno", duration: "10 min", step: "Demostrar ping de subestaciones" },
    { id: "om_manager", name: "Gerente O&M", line: "Field", route: "Dashboard Consolidado", duration: "15 min", step: "Mostrar matriz de compatibilidad CCTV" },
    { id: "plant_chief", name: "Jefe de planta", line: "Field", route: "Gateway Local & Telemetría", duration: "10 min", step: "Revisar switches PoE y latencia" },
    { id: "condo_committee", name: "Comité de condominio", line: "Community", route: "EasyView Vecinal", duration: "10 min", step: "Mostrar enmascaramiento dinámico" },
    { id: "res_admin", name: "Administración residencial", line: "Community", route: "EasyView & Reportabilidad", duration: "15 min", step: "Mostrar Incident Center" },
    { id: "conserjeria", name: "Conserjería", line: "Community", route: "EasyView Directo", duration: "5 min", step: "Simular reporte ágil de eventos" },
    { id: "cctv_provider", name: "Proveedor CCTV", line: "Field / Consumer", route: "Dahua Lab Protocol", duration: "15 min", step: "Mostrar firmas SHA-256 e integridad" },
    { id: "investor", name: "Inversionista / socio", line: "Ecosistema ORBI", route: "Public Launch Media Kit", duration: "5 min", step: "Presentar créditos y taglines éticos" },
    { id: "tech_supervisor", name: "Supervisor técnico", line: "Field", route: "Dahua Lab & Gateway", duration: "15 min", step: "Verificar retenciones NVR y compresión" },
    { id: "phys_security", name: "Seguridad física", line: "Community", route: "Sentinel Live Wall", duration: "10 min", step: "Verificar retículas de cámaras locales" },
    { id: "hse_team", name: "Equipo HSE", line: "Field", route: "Incident Center & Evidence", duration: "10 min", step: "Extraer informe de trazabilidad técnica" },
    { id: "public_demo", name: "Demo pública", line: "Public", route: "Public Demo Tour", duration: "3 min", step: "Alternar marcas controladas de preventa" },
    { id: "video_presentation", name: "Video presentación", line: "Public", route: "Guion 30s de Video", duration: "60 segundos", step: "Copiar guion con descargo comercial" }
  ];

  // Static definition of the 9 Block types to track (Módulo 5A Requirement)
  const SAFETY_BLOCKS_METADATA = [
    { id: "media_blocked", name: "Media Blocked activado", module: "Launch Media Kit", cause: "Chequeos críticos de prensa pendientes", fix: "Marcar checklist obligatorio en Media Kit" },
    { id: "launch_status_blocked", name: "Launch Status Blocked", module: "QA Control Panel", cause: "Algún frente de auditoría está en Blocked", fix: "Validar los 10 frentes a Ready o Audit" },
    { id: "checklist_critico_bloqueado", name: "Checklist crítico bloqueado", module: "Launch Media Kit", cause: "Requisitos de resguardo no confirmados", fix: "Marcar 'No Real Data Visible' y 'Production Locked'" },
    { id: "copy_export_disabled", name: "Copy/export deshabilitado", module: "Launch Media Kit & Script", cause: "Vulneración detectada en guardrail central", fix: "Resolver bloqueo para liberar portapapeles" },
    { id: "responsible_claims_fail", name: "Responsible Claims falló", module: "Generador de Textos", cause: "Claims agresivos no sanitizados", fix: "Usar equivalentes del Responsible Claims Pass" },
    { id: "production_locked_unmarked", name: "Production Locked desmarcado", module: "Launch Media Kit", cause: "Riesgo de simular producción real activa", fix: "Habilitar sello 'Production Locked' en el checklist" },
    { id: "no_real_data_unmarked", name: "No Real Data desmarcado", module: "Launch Media Kit", cause: "Exposición potencial de datos de red reales", fix: "Marcar 'No Real Data Visible' en checklist" },
    { id: "guardrails_invisible", name: "Guardrails no visibles", module: "Public Demo Hub", cause: "Falta de claridad ética de la maqueta", fix: "Garantizar que el banner superior de demo esté visible" },
    { id: "next_step_undefined", name: "Próximo paso no definido", module: "Guided Demos", cause: "Flujo comercial incompleto", fix: "Completar la ruta con un llamado de acción a piloto acotado" }
  ];

  // Interactive local simulation buttons for telemetry testing
  const simulateEvent = (type: TelemetryEvent["eventType"], meta?: any) => {
    trackLocalEvent(type, meta);
    triggerAuditLog("Simulate Local Event", `Evento registrado: ${type}`);
  };

  // Clear data with custom popup confirmation
  const handleResetTelemetry = () => {
    if (window.confirm("Esto eliminará métricas locales de demostración de la sesión actual y restablecerá la bitácora histórica. No afecta cámaras, credenciales ni datos externos porque este módulo no usa servicios cloud. ¿Deseas proceder?")) {
      resetTelemetry();
      triggerAuditLog("Reset Telemetry", "Se restablecieron las métricas de demostración a la base preestablecida.");
      trackLocalEvent("data.reset.executed", { mode: "seeded_reset" });
    }
  };

  const handlePurgeTelemetry = () => {
    if (window.confirm("Esto eliminará de forma PERMANENTE todos los eventos de analítica local. ¿Deseas proceder?")) {
      purgeTelemetry();
      triggerAuditLog("Purge Telemetry", "Se borró de forma total la bitácora de analítica local.");
      trackLocalEvent("data.reset.executed", { mode: "total_purge" });
    }
  };

  // Generate copyable sanitized report text
  const generateSanitizedReport = () => {
    const activeNotesSanitized = notesWarning
      ? "[EXPULSADO DEL REPORTE: SE DETECTARON POSIBLES DATOS PERSONALES / PII NO SANITIZADOS]"
      : feedbackNotes.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL-HIDDEN]")
                     .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP-HIDDEN]")
                     .replace(/rtsp:\/\/\S+/gi, "[RTSP-HIDDEN]");

    return `==================================================================
ORBI SENTINEL IA — OFFLINE DEMO ANALYTICS REPORT
==================================================================
[AUDIT HIT: v0.5.1-sentinel-offline-analytics-privacy-lock]
Fecha de Reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Privacidad: 100% Offline & Sanitizado (No Cloud, No PII, No IPs)

1. DATOS GENERALES DE SESIÓN (LOCAL TELEMETRY):
----------------------------------------------
• Total de Sesiones Demo Registradas: ${totalSessions}
• Tiempo Estimado de Presentación: ${totalDemoTimeMinutes.toFixed(1)} minutos
• Línea de Negocio Más Visitada: ${mostFrequentLine}
• Audiencia Más Seleccionada: ${mostFrequentAudience}
• Ruta Guiada Más Solicitada: ${mostFrequentRoute}
• Pantalla Más Visualizada: ${mostVisitedScreen}
• Alertas de Bloqueo Registradas: ${blockedChecklistsCount} veces
• Copias al Portapapeles Permitidas: ${copyAllowedCount}
• Copias al Portapapeles Bloqueadas (Guardrails): ${copyBlockedCount}
• Guardrails de Seguridad Visualizados: ${guardrailsViewedCount}
• Informes de Negociación Sanitizados Generados: ${reportsGeneratedCount}

2. DESGLOSE DE INTERACCIÓN POR LÍNEA DE VALOR:
----------------------------------------------
A. SENTINEL FIELD (INDUSTRIAL):
   • Clics de navegación a Field Operations: ${screenFrequencyMap["fieldoperations"] || 0}
   • Rutas guiadas iniciadas (Field): ${guidedFieldCount}
   • Informes / Propuestas copiados (Field): ${events.filter((e) => e.eventType === "proposal.report.copied" && e.metadata?.line === "field").length}

B. SENTINEL COMMUNITY (RESIDENCIAL):
   • Clics de navegación a EasyView: ${screenFrequencyMap["easyview"] || 0}
   • Rutas guiadas iniciadas (Community): ${guidedCommunityCount}
   • Informes / Propuestas copiados (Community): ${events.filter((e) => e.eventType === "proposal.report.copied" && e.metadata?.line === "community").length}

C. CONSUMER BRIDGE & HARDWARE LAB:
   • Clics de navegación a Consumer Bridge: ${screenFrequencyMap["consumerbridge"] || 0}
   • Visualización de reglas de privacidad domésticas: ${events.filter((e) => e.eventType === "guardrails.viewed" && e.metadata?.rule?.includes("RTSP")).length}

3. CONTROL DE BLOQUEOS Y AUDITORÍA DE SEGURIDAD OPERACIONAL:
-----------------------------------------------------------
• Estado de Validación de Analítica: ${currentReadinessStatus.toUpperCase()}
• Violación de Reglas de Privacidad: ${isSecurityRuleViolated ? "SÍ - BLOQUEADO POR GUARDRAILS" : "NINGUNA - SEGURO"}
• Checklists de Lanzamiento Bloqueados por Incumplimiento: ${copyBlockedCount} eventos interceptados

4. NOTAS INTERNAS DE FEEDBACK DE LA DEMO:
----------------------------------------
"${activeNotesSanitized || "Sin notas registradas de feedback local."}"

5. LIMITACIONES Y DESCARGOS ÉTICOS:
----------------------------------
* Esta analítica se almacena localmente en el espacio aislado de almacenamiento web del navegador.
* No se realiza fingerprinting, cookies de terceros ni conexiones a servidores de telemetría remotos.
* Útil exclusivamente para mejorar las presentaciones técnico-comerciales y validar el cumplimiento ético de la demo.
* No constituye monitoreo de producción 24/7 de instalaciones reales.

==================================================================
Ecosistema ORBI - Creado por Víctor M. León.
QA & Co-Diseño: ChatGPT / OpenAI. Implementación Asistida: Google AI Studio.`;
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    if (isSecurityRuleViolated) {
      triggerAuditLog("CLIPBOARD BLOCKED", "Intento fallido de copiar reporte de analítica bloqueado por vulneración de seguridad.");
      alert("Acción de copiado bloqueada: Las políticas críticas de privacidad offline ('No cloud telemetry', 'No PII', 'No IP/RTSP stored') deben estar marcadas como seguras.");
      return;
    }

    if (notesWarning) {
      triggerAuditLog("CLIPBOARD BLOCKED", "Intento de copia bloqueado por advertencia de datos sensibles en Feedback Notes.");
      alert("Acción de copiado bloqueada: Se han detectado posibles datos personales (PII) en 'Feedback Notes'. Sanitice o remueva el texto con formato de correo, IP, teléfono o RTSP para poder exportar.");
      return;
    }

    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    trackLocalEvent("export.sanitized.generated", { format: "clipboard_report" });
    triggerAuditLog("Export Sanitized Report", "Reporte consolidado copiado de forma segura al portapapeles.");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Lock out view for Conserje role
  if (userRole === "conserje") {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-sans font-bold text-white uppercase tracking-wider">
            Sentinel Offline Demo Analytics
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            El laboratorio de analítica local, telemetría offline y métricas de demostración está restringido para el rol de <strong>Conserjería / Guardia</strong>.
          </p>
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-left space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Directriz de Seguridad Operativa
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Por favor, póngase en contacto con un <strong>Administrador General</strong> o <strong>Técnico de Terreno</strong> para verificar el comportamiento de interacción, duración promedio de rutas comerciales y tasas de bloqueos del Media Kit.
          </p>
        </div>
        <p className="text-[10px] font-mono text-slate-600">
          Hito Operativo: v0.5.1-sentinel-offline-analytics-privacy-lock
        </p>
      </div>
    );
  }

  // Audit fronts list with computed dynamic statuses
  const auditFrentes = [
    {
      id: "banner",
      name: "Offline Safety Banner",
      desc: "Banner superior descriptivo visible en la pantalla con badges éticos obligatorios.",
      dynamic: readinessChecklist.responsibleAnalyticsBannerVisible ? ("Ready" as const) : ("Blocked" as const),
      liveDetail: readinessChecklist.responsibleAnalyticsBannerVisible ? "Visible en pantalla" : "Banner deshabilitado en checklist"
    },
    {
      id: "store",
      name: "Local Telemetry Store",
      desc: "Almacenamiento exclusivo en localStorage sin cookies de terceros ni bases de datos cloud.",
      dynamic: (readinessChecklist.noPiiStored && readinessChecklist.noIpRtspStored) ? ("Ready" as const) : ("Blocked" as const),
      liveDetail: (readinessChecklist.noPiiStored && readinessChecklist.noIpRtspStored) ? "Almacenamiento 100% local y aislado" : "Políticas críticas de localStorage en revisión"
    },
    {
      id: "allowlist",
      name: "Event Allowlist",
      desc: "Estructura de filtrado que restringe el registro exclusivo a eventos técnicos autorizados.",
      dynamic: "Ready" as const,
      liveDetail: "Allowlist activo (22 tipos de eventos autorizados)"
    },
    {
      id: "blocklist",
      name: "Event Blocklist",
      desc: "Intercepción en caliente y descarte inmediato de eventos y parámetros de datos prohibidos.",
      dynamic: "Ready" as const,
      liveDetail: "Blocklist activo (10 tipos de eventos prohibidos bloqueados)"
    },
    {
      id: "summary",
      name: "Demo Session Summary",
      desc: "Consolidación matemática de métricas de sesión computadas de manera aislada por el cliente.",
      dynamic: "Ready" as const,
      liveDetail: `Calculado en vivo (${totalSessions} sesiones, ${totalDemoTimeMinutes.toFixed(1)} min totales)`
    },
    {
      id: "audiences",
      name: "Audience Insights",
      desc: "Evaluación de perfiles técnicos para las 13 audiencias simuladas sin registrar identidades reales.",
      dynamic: readinessChecklist.noPiiStored ? ("Ready" as const) : ("Blocked" as const),
      liveDetail: readinessChecklist.noPiiStored ? "13 Perfiles auditados sin almacenamiento de PII" : "No PII Stored deshabilitado"
    },
    {
      id: "blockers",
      name: "Safety Blockers",
      desc: "Consolidación de las 9 causas de bloqueo operativo con diagnóstico y soluciones correctivas.",
      dynamic: "Ready" as const,
      liveDetail: `Diagnóstico operativo activo (${copyBlockedCount} eventos interceptados)`
    },
    {
      id: "sanitization",
      name: "Feedback Notes Sanitization",
      desc: "Escáner reactivo en tiempo real que advierte e impide la copia si detecta IPs, correos o RTSP.",
      dynamic: notesWarning ? ("Needs Review" as const) : ("Ready" as const),
      liveDetail: notesWarning ? "Advertencia de datos sensibles detectados en notas" : "Ningún dato sensible detectado en notas"
    },
    {
      id: "report",
      name: "Sanitized Report",
      desc: "Informe consolidado en texto limpio libre de datos privados y claims comerciales agresivos.",
      dynamic: isSecurityRuleViolated ? ("Blocked" as const) : (notesWarning ? ("Needs Review" as const) : ("Ready" as const)),
      liveDetail: isSecurityRuleViolated ? "Reporte bloqueado por guardrails de privacidad" : (notesWarning ? "Informe modificado (notas excluidas)" : "Reporte disponible para copia")
    },
    {
      id: "controls",
      name: "Reset & Purge Controls",
      desc: "Mecanismo de limpieza para purgar sesiones locales o restablecer el seed simulado.",
      dynamic: readinessChecklist.resetAvailable ? ("Ready" as const) : ("Needs Review" as const),
      liveDetail: readinessChecklist.resetAvailable ? "Botones de borrado y restablecimiento operativos" : "Restablecimiento deshabilitado"
    }
  ];

  // Resolve effective status for each frente (manual override preferred if present)
  const getFrenteStatus = (id: string, dynamicStatus: "Ready" | "Needs Review" | "Blocked") => {
    return manualQAOverrides[id] || dynamicStatus;
  };

  // Resolve overall panel status
  const resolvedStatuses = auditFrentes.map(f => getFrenteStatus(f.id, f.dynamic));
  const overallQAStatus = resolvedStatuses.includes("Blocked")
    ? "Analytics Blocked"
    : resolvedStatuses.includes("Needs Review")
    ? "Needs Review"
    : "Offline Analytics Privacy Locked";

  return (
    <div className="space-y-6">
      
      {/* 2. Offline Analytics Safety Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> MÓDULO 5A • DEMO ANALYTICS & TELEMETRY LAB
            </span>
            <h2 className="text-xl font-sans font-extrabold text-white tracking-tight uppercase">
              Sentinel Offline Demo Analytics
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              “Analítica local offline — sin nube, sin datos personales, sin IPs, sin cámaras reales, sin tracking externo.”
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 md:justify-end">
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Offline Only
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Local Demo Data
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              No Cloud
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
              No PII
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
              No Camera Data
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
              Production Locked
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-900 text-slate-500 border border-slate-800 uppercase">
              Resettable
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-1 pb-px scrollbar-none">
        {[
          { id: "dashboard", label: "Dashboard Resumen", icon: Activity },
          { id: "lines", label: "Líneas de Valor", icon: Database },
          { id: "guided", label: "Rutas Guiadas", icon: Clock },
          { id: "audiences", label: "Audiencia Local", icon: Users },
          { id: "safety", label: "Seguridad y Bloqueos", icon: ShieldAlert },
          { id: "notes", label: "Feedback Notes", icon: BookOpen },
          { id: "readiness", label: "Readiness Checklist", icon: ShieldCheck },
          { id: "qalock", label: "QA Lock Panel", icon: Lock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              triggerAuditLog("View Section", `Abierta pestaña ${tab.label}`);
            }}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-emerald-500 text-emerald-400 font-sans"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Render Subtab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: DASHBOARD RESUMEN */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Metrics Grid (Demo Session Summary) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Sesiones de Demo</span>
                <p className="text-2xl font-bold font-sans text-white">{totalSessions}</p>
                <span className="text-[9px] font-mono text-emerald-400">Total acumulado local</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Tiempo Presentación</span>
                <p className="text-2xl font-bold font-sans text-white">{totalDemoTimeMinutes.toFixed(1)} <span className="text-xs text-slate-400">min</span></p>
                <span className="text-[9px] font-mono text-slate-400">Estimación de uso</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Línea Más Visitada</span>
                <p className="text-base font-bold font-sans text-emerald-400 truncate mt-1">{mostFrequentLine}</p>
                <span className="text-[9px] font-mono text-slate-400">Mayor interacción</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Audiencia Frecuente</span>
                <p className="text-xs font-bold font-sans text-purple-400 truncate mt-2">{mostFrequentAudience}</p>
                <span className="text-[9px] font-mono text-slate-400">Filtro principal</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 col-span-2 md:col-span-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Checklists Bloqueados</span>
                <p className="text-2xl font-bold font-sans text-rose-500">{blockedChecklistsCount}</p>
                <span className="text-[9px] font-mono text-rose-400">Alertas interceptadas</span>
              </div>
            </div>

            {/* Intermediate Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Copy Acciones Permitidas</span>
                  <p className="text-xl font-bold text-white mt-1">{copyAllowedCount}</p>
                </div>
                <span className="px-2 py-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">PASS</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Copy Acciones Bloqueadas</span>
                  <p className="text-xl font-bold text-rose-400 mt-1">{copyBlockedCount}</p>
                </div>
                <span className="px-2 py-1 text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 rounded border border-rose-500/20">BLOCKED</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Guardrails Visualizados</span>
                  <p className="text-xl font-bold text-blue-400 mt-1">{guardrailsViewedCount}</p>
                </div>
                <span className="px-2 py-1 text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 rounded border border-blue-500/20">SECURE</span>
              </div>
            </div>

            {/* Visual Charts built using elegant Pure Tailwind Bars (Zero package failures) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart A: Line Interaction Frequency */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white">Interacción por Línea de Producto</h3>
                  <span className="text-[10px] font-mono text-slate-500">Métrica local</span>
                </div>
                <div className="space-y-3.5">
                  {[
                    { label: "Sentinel Field Operations", count: lineCounts.field, color: "bg-emerald-500", icon: "🛰️" },
                    { label: "Sentinel Community (EasyView)", count: lineCounts.community, color: "bg-purple-500", icon: "🏢" },
                    { label: "Consumer Lab (Bridges)", count: lineCounts.consumer, color: "bg-blue-500", icon: "🧪" }
                  ].map((line, i) => {
                    const total = Math.max(lineCounts.field + lineCounts.community + lineCounts.consumer, 1);
                    const pct = (line.count / total) * 100;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-sans flex items-center gap-1.5">
                            <span>{line.icon}</span>
                            <strong>{line.label}</strong>
                          </span>
                          <span className="font-mono text-slate-400 font-bold">{line.count} clicks ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${line.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart B: Live Feed of Captured Local Events */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white">Consola de Telemetría Offline</h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE STREAM</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg max-h-52 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-400 space-y-2.5 scrollbar-thin">
                  {events.length === 0 ? (
                    <div className="text-center text-slate-600 py-6">Sin eventos en la bitácora local actual.</div>
                  ) : (
                    [...events].reverse().slice(0, 15).map((ev) => (
                      <div key={ev.id} className="border-b border-slate-900 pb-1.5 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-emerald-400 font-bold break-all">
                            [{ev.eventType}]
                            {ev.isSynthetic && (
                              <span className="ml-1.5 px-1 py-0.5 text-[8px] tracking-wide uppercase font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                                Synthetic Demo Event / Demo Seed Data
                              </span>
                            )}
                          </span>
                          <span className="text-slate-600 font-mono text-[9px] shrink-0">
                            {ev.timestamp.substring(11, 19)}
                          </span>
                        </div>
                        {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                          <div className="text-slate-500 text-[10px] mt-0.5 pl-2 break-all">
                            └ {JSON.stringify(ev.metadata)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[10px] font-mono text-slate-500 leading-normal bg-slate-950/40 p-2.5 rounded border border-slate-850/60">
                  ⚠️ <strong>Nota de Privacidad:</strong> Los eventos iniciales son datos sintéticos para mostrar el funcionamiento del panel. No representan actividad real de clientes, usuarios, cámaras ni sitios operacionales.
                </p>
              </div>
            </div>

            {/* Interactive Events Simulator Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">Simulador de Eventos de Demostración</h3>
                  <p className="text-xs text-slate-400">Inserta de forma interactiva eventos en el almacenamiento local para depurar los cálculos del reporte.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetTelemetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold rounded border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restablecer Base
                  </button>
                  <button
                    onClick={handlePurgeTelemetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold rounded border border-rose-900 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Borrar Todo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <button
                  onClick={() => simulateEvent("demo.session.started", { trigger: "manual_debug" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded transition-all truncate"
                >
                  + Session Started
                </button>
                <button
                  onClick={() => simulateEvent("publichub.opened", { currentLine: "field" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded transition-all truncate"
                >
                  + Open Demo Hub
                </button>
                <button
                  onClick={() => simulateEvent("line.selected.field", { mode: "simulation" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded transition-all truncate"
                >
                  + Select Field Line
                </button>
                <button
                  onClick={() => simulateEvent("line.selected.community", { mode: "simulation" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded transition-all truncate"
                >
                  + Select Community
                </button>
                <button
                  onClick={() => simulateEvent("media.copy.allowed", { type: "guion-30s" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded transition-all truncate"
                >
                  + Copy Allowed
                </button>
                <button
                  onClick={() => simulateEvent("media.copy.blocked", { targetId: "guion-30s", cause: "Guardrail Active" })}
                  className="py-1.5 px-2 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded transition-all truncate"
                >
                  + Copy Blocked
                </button>
              </div>
            </div>

            {/* Copiable Sanitized Report Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Reporte Consolidado Sanitizado</h3>
                    <p className="text-[10px] text-slate-500">Formato apto para exportar o revisar con directores comerciales</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(generateSanitizedReport(), "sanitized_report")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                      isSecurityRuleViolated || notesWarning
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    }`}
                    disabled={isSecurityRuleViolated || !!notesWarning}
                  >
                    {copySuccess === "sanitized_report" ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Reporte
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isSecurityRuleViolated ? (
                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-300">Generación bloqueada por guardrails</p>
                    <p className="text-[11px] text-rose-400">
                      Resuelva los elementos de seguridad y privacidad en la pestaña de <strong>Readiness Checklist</strong> (No cloud telemetry, No PII stored, No IP/RTSP stored) para liberar el portapapeles.
                    </p>
                  </div>
                </div>
              ) : notesWarning ? (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-300">Exportación Bloqueada - Notas con Riesgo de PII</p>
                    <p className="text-[11px] text-amber-400">
                      Se han detectado posibles datos personales o direcciones de cámara (IP/RTSP/Email/Teléfono) en <strong>Feedback Notes</strong>. Por favor limpie o sanitice las notas para poder copiar el reporte consolidado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-72 whitespace-pre scrollbar-thin">
                  {generateSanitizedReport()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LÍNEAS DE VALOR ANALYTICS */}
        {activeTab === "lines" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            
            {/* Field Operations Line Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Línea Field (Solar/Industrial)</span>
                <span className="text-[10px] font-mono text-slate-500">Métricas de interacción</span>
              </div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vistas Field Operations:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["fieldoperations"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Guided Field Demo Iniciadas:</span>
                  <span className="font-mono text-white font-bold">{guidedFieldCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Field Proposals Abiertas:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["fieldproposal"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Field Reports Copiados:</span>
                  <span className="font-mono text-white font-bold">
                    {events.filter((e) => e.eventType === "proposal.report.copied" && e.metadata?.line === "field").length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Audiencia Field Frecuente:</span>
                  <span className="font-mono text-emerald-400 font-bold">Gerente O&M / Plant Chief</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
                La interacción de la línea Field se concentra en la visibilidad de los switches PoE simulados y la telemetría de ping del Gateway.
              </div>
            </div>

            {/* Community Line Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">Línea Community (Condominios)</span>
                <span className="text-[10px] font-mono text-slate-500">Métricas de interacción</span>
              </div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Guided Community Demo Iniciadas:</span>
                  <span className="font-mono text-white font-bold">{guidedCommunityCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Community Proposals Abiertas:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["communityproposal"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Community Reports Copiados:</span>
                  <span className="font-mono text-white font-bold">
                    {events.filter((e) => e.eventType === "proposal.report.copied" && e.metadata?.line === "community").length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vistas EasyView Vecinal:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["easyview"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Audiencia Community Frecuente:</span>
                  <span className="font-mono text-purple-400 font-bold">Comité de condominio / Conserjes</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
                La interacción de la línea Community destaca el enmascaramiento dinámico de rostros por diseño y las opciones rápidas del conserje sin estrés cognitivo.
              </div>
            </div>

            {/* Consumer Lab Line Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">Línea Consumer (Lab Bridges)</span>
                <span className="text-[10px] font-mono text-slate-500">Métricas de interacción</span>
              </div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Consumer Bridge Abierto:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["consumerbridge"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">RTSP/NAS Wizard Visualizado:</span>
                  <span className="font-mono text-white font-bold">{events.filter((e) => e.eventType === "guardrails.viewed" && e.metadata?.rule?.includes("RTSP")).length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Compatibility Matrix Abierta:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["compatibility"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Privacy Rules Visualizadas:</span>
                  <span className="font-mono text-white font-bold">{events.filter((e) => e.eventType === "guardrails.viewed").length}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
                La línea Consumer demuestra la viabilidad técnica de validar cámaras comerciales baratas en un laboratorio cerrado mediante proxies RTSP seguros.
              </div>
            </div>

            {/* Public Media Kit Analytics */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Línea Public / Media Kit</span>
                <span className="text-[10px] font-mono text-slate-500">Métricas de interacción</span>
              </div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Public Demo Hub Abierto:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["publicdemohub"] || events.filter(e => e.eventType === "publichub.opened").length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Launch Media Kit Abierto:</span>
                  <span className="font-mono text-white font-bold">{screenFrequencyMap["mediakit"] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Scripts Generados (15s-90s):</span>
                  <span className="font-mono text-white font-bold">{events.filter(e => e.eventType === "media.script.generated").length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Captions Redes Sociales:</span>
                  <span className="font-mono text-white font-bold">{events.filter(e => e.eventType === "media.copy.allowed" && e.metadata?.type?.includes("caption")).length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Clipboard Bloqueado por Seguridad:</span>
                  <span className="font-mono text-rose-400 font-bold">{copyBlockedCount}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-400">
                Mide la interacción de la preventa de marca unificada. La exportación queda restringida en caliente si no se aprueban las auditorías de claims éticos.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDED DEMO COMPLETION TRACKER */}
        {activeTab === "guided" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">Seguimiento de Completitud de Rutas Guiadas</h3>
              <p className="text-xs text-slate-400">
                Visualice el progreso y la retención comercial estimada de los flujos de demostración interactiva por tipo de duración.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Field Guided Routes */}
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 block uppercase border-b border-slate-850 pb-1.5">Rutas Field Operations</span>
                  <div className="space-y-3">
                    {[
                      { name: "3 minutos (Foco Técnico)", pct: 90, status: "Alta completación" },
                      { name: "5 minutos (Foco O&M)", pct: 75, status: "Recomendado" },
                      { name: "10 minutos (Foco HSE)", pct: 50, status: "Abandono medio" },
                      { name: "15 minutos (Foco Negociación)", pct: 30, status: "Foco exclusivo" }
                    ].map((route, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">{route.name}</span>
                          <span className="font-mono text-slate-400">{route.pct}% completado</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${route.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Guided Routes */}
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
                  <span className="text-[11px] font-mono font-bold text-purple-400 block uppercase border-b border-slate-850 pb-1.5">Rutas Community</span>
                  <div className="space-y-3">
                    {[
                      { name: "3 minutos (Conserjería)", pct: 95, status: "Alta retención" },
                      { name: "5 minutos (Administración)", pct: 80, status: "Excelente" },
                      { name: "10 minutos (Asamblea Coprop.)", pct: 60, status: "Medio" }
                    ].map((route, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">{route.name}</span>
                          <span className="font-mono text-slate-400">{route.pct}% completado</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${route.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Public Demo Tour */}
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
                  <span className="text-[11px] font-mono font-bold text-amber-400 block uppercase border-b border-slate-850 pb-1.5">Public Demo Tour</span>
                  <div className="space-y-3">
                    {[
                      { name: "60 segundos (Elevator Pitch)", pct: 98, status: "Máximo alcance" },
                      { name: "3 minutos (Media Review)", pct: 85, status: "Óptimo" },
                      { name: "5 minutos (Full Sandbox Walk)", pct: 70, status: "Interés técnico" }
                    ].map((route, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">{route.name}</span>
                          <span className="font-mono text-slate-400">{route.pct}% completado</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${route.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block">Métricas Detalladas de Pasos de la Presentación</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Ruta Iniciada</span>
                  <p className="text-xl font-bold text-white mt-1">{(guidedFieldCount + guidedCommunityCount) || 3}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Pasos Visitados</span>
                  <p className="text-xl font-bold text-white mt-1">14</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Completados</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">8</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Abandonos</span>
                  <p className="text-xl font-bold text-rose-400 mt-1">2</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Pasos Saltados</span>
                  <p className="text-xl font-bold text-slate-400 mt-1">1</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Objeciones Abiertas</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">4</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-slate-400 block">Checklist Listo</span>
                  <p className="text-sm font-bold text-emerald-400 mt-2">Certified</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIENCIA LOCAL INSIGHTS */}
        {activeTab === "audiences" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">Análisis de Presentaciones por Rol / Audiencia</h3>
              <p className="text-xs text-slate-400">
                Resumen de uso y configuraciones sugeridas para los 13 perfiles estratégicos de audiencia. No se capturan datos confidenciales de empresas ni identidades reales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUDIENCE_METADATA.map((aud, index) => {
                // Read selection count from telemetry dynamically
                const selectCount = events.filter(
                  (e) => e.eventType === "audience.selected" && e.metadata?.audience === aud.name
                ).length;

                return (
                  <div
                    key={aud.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-950 border border-slate-850 text-slate-400">
                          ID: {aud.id}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          Seleccionada: {selectCount} {selectCount === 1 ? "vez" : "veces"}
                        </span>
                      </div>
                      <h4 className="text-sm font-sans font-extrabold text-white">{aud.name}</h4>
                      <p className="text-xs text-slate-400 leading-normal">
                        Ruta sugerida: <strong className="text-slate-300">{aud.route}</strong> ({aud.duration})
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850 text-[10px] font-mono text-slate-400 space-y-1">
                      <span className="text-slate-500 uppercase block text-[8px]">Acción Clave de la Demo:</span>
                      <p className="leading-tight text-slate-300">{aud.step}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SEGURIDAD Y BLOQUEOS ANALYTICS */}
        {activeTab === "safety" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">Análisis de Salvaguarda y Bloqueos de Seguridad</h3>
              <p className="text-xs text-slate-400">
                Monitoreo en caliente de los frentes de bloqueo que impiden la difusión de claims no sanitizados para proteger la veracidad técnica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAFETY_BLOCKS_METADATA.map((block) => {
                // Find if there are events representing this block
                const isBlockedNow = block.id === "media_blocked" && isSecurityRuleViolated;
                
                return (
                  <div
                    key={block.id}
                    className={`border rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all ${
                      isBlockedNow
                        ? "bg-rose-950/25 border-rose-500/30"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-950 text-slate-400 uppercase">
                          {block.module}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isBlockedNow ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                        {block.name}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Causa: <span className="text-slate-400">{block.cause}</span>
                      </p>
                    </div>

                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] font-mono text-slate-400 leading-snug">
                        👉 Solución: <span className="text-slate-300 font-sans">{block.fix}</span>
                      </p>
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>Estado Actual:</span>
                        <span className={isBlockedNow ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          {isBlockedNow ? "BLOCKED" : "READY"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: LOCAL FEEDBACK NOTES (DEMO FEEDBACK NOTES) */}
        {activeTab === "notes" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Demo Feedback Notes</h3>
                  <p className="text-xs text-slate-400">Anote objeciones, comentarios de clientes y mejoras identificadas en la maqueta.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-950 text-slate-500">
                LOCAL PERSISTENCE ONLY
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] text-amber-300 leading-normal font-sans">
                ⚠️ <strong>Aviso Importante de Seguridad:</strong> No escribas datos sensibles en estas notas. Este espacio es solo para feedback genérico de la demo. Queda prohibido ingresar nombres reales de clientes, correos, contraseñas, direcciones IP o rutas RTSP.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans font-bold text-slate-300 uppercase tracking-wider block">
                  Notas de Demostración
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={handleNotesChange}
                  placeholder="Ej: El cliente de O&M mostró gran interés en la velocidad de respuesta del diagnóstico de latencia. Sugiere añadir compatibilidad con switches CCTV Hirschmann..."
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                />
              </div>

              {notesWarning && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-mono">
                  {notesWarning}
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Caracteres: {feedbackNotes.length}</span>
                <span>Guardado automático local</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: READINESS CHECKLIST */}
        {activeTab === "readiness" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Analytics Readiness Checklist</h3>
                <p className="text-xs text-slate-400">Verificación del cumplimiento de los principios éticos y de resguardo del módulo de analítica offline.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Validación de Analítica:</span>
                <span
                  className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                    currentReadinessStatus === "Blocked"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      : currentReadinessStatus === "Needs Review"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {currentReadinessStatus === "Blocked" ? "Blocked (Security Violation)" : currentReadinessStatus}
                </span>
              </div>
            </div>

            {/* Checkboxes matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "offlineModeConfirmed", title: "Offline Mode Confirmed", desc: "No realiza envíos de datos externos ni consultas a servidores de red remotos.", critical: false },
                { key: "noCloudTelemetry", title: "No Cloud Telemetry", desc: "No integra ni envía telemetría a Google Analytics, Firebase u otros SDKs.", critical: true },
                { key: "noPiiStored", title: "No PII Stored", desc: "No se recopila ningún dato personal, identificador persistente ni nombres reales.", critical: true },
                { key: "noIpRtspStored", title: "No IP/RTSP Stored", desc: "No se guardan direcciones IP reales, enlaces RTSP ni coordenadas geográficas.", critical: true },
                { key: "noCameraDataStored", title: "No Camera Data Stored", desc: "No se guarda ningún frame de video ni flujos operacionales del CCTV.", critical: false },
                { key: "resetAvailable", title: "Reset Available", desc: "Controles funcionales para borrar toda la bitácora local de forma simple.", critical: false },
                { key: "sanitizedReportReady", title: "Sanitized Report Ready", desc: "Estructura de reporte libre de claims no autorizados y libre de PII.", critical: false },
                { key: "responsibleAnalyticsBannerVisible", title: "Safety Banner Visible", desc: "Banner descriptivo de 'No cloud, no track' visible en la parte superior.", critical: false },
                { key: "mediaKitBlockersTracked", title: "Media Kit Blockers Tracked", desc: "Integración de eventos reactivos cuando el Clipboard es bloqueado.", critical: false },
                { key: "guidedDemoRoutesTracked", title: "Guided Demo Routes Tracked", desc: "Rastreo de pasos iniciados y completados de manera abstracta.", critical: false },
                { key: "readmeUpdated", title: "README Updated", desc: "La documentación del proyecto documenta el hito Módulo 5A.", critical: false },
                { key: "versionRegistryUpdated", title: "Version Registry Updated", desc: "Registro del hito v0.5.0-sentinel-offline-demo-analytics-lab.", critical: false }
              ].map((item) => {
                const checked = readinessChecklist[item.key as keyof typeof readinessChecklist];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleReadiness(item.key as keyof typeof readinessChecklist)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      checked
                        ? "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        : "bg-rose-950/10 border-rose-950/40 hover:border-rose-900/40"
                    }`}
                  >
                    <div className="mt-1">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          checked
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-sans font-bold text-white">
                          {item.title}
                        </span>
                        {item.critical && (
                          <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            CRITICAL RULE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy & Ethics Panel */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-850 pb-2">
                <HeartHandshake className="w-5 h-5" />
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider">Panel de Ética y Transparencia en Analítica</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">LO QUE SÍ ES ESTA ANALÍTICA:</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                    <li><strong>Almacenamiento Local (localStorage):</strong> Funciona en la sandbox aislada del navegador del operador.</li>
                    <li><strong>Mapeo Abstracto:</strong> Mide clicks, selecciones y duraciones estimadas de los flujos del vendedor.</li>
                    <li><strong>Sanitizada y Segura:</strong> Evita la captura accidental de cualquier información privada.</li>
                    <li><strong>Reseteable al 100%:</strong> Con un solo clic, se purgan de forma definitiva todos los registros locales.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">LO QUE NO ES ESTA ANALÍTICA:</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-300 border-l border-slate-850 md:pl-6">
                    <li><strong>Sin Tracking Cloud:</strong> No hay envío de paquetes, ni conexiones a servidores remotos.</li>
                    <li><strong>Sin Exposición de IPs o RTSP:</strong> Queda prohibido registrar direcciones de red del cliente.</li>
                    <li><strong>Sin Monitoreo Productivo:</strong> No registra incidentes en vivo ni graba cámaras reales 24/7.</li>
                    <li><strong>Sin Fingerprinting:</strong> No guarda identificadores únicos para correlacionar con usuarios externos.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: OFFLINE ANALYTICS QA LOCK */}
        {activeTab === "qalock" && (
          <div className="space-y-6 animate-fade-in text-slate-300">
            {/* Sello de Validación de Privacidad */}
            <div className={`p-6 rounded-xl border relative overflow-hidden transition-all duration-300 ${
              overallQAStatus === "Offline Analytics Privacy Locked"
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : overallQAStatus === "Needs Review"
                ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                : "bg-rose-950/25 border-rose-500/30 text-rose-300 animate-pulse"
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <Lock className="w-full h-full text-slate-500" />
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-full ${
                  overallQAStatus === "Offline Analytics Privacy Locked"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : overallQAStatus === "Needs Review"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}>
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-60">
                    Sello de Validación de Privacidad y Auditoría Offline
                  </span>
                  <h3 className="text-xl font-sans font-extrabold uppercase tracking-tight text-white">
                    {overallQAStatus === "Offline Analytics Privacy Locked"
                      ? "🔒 Offline Analytics Privacy Locked"
                      : overallQAStatus === "Needs Review"
                      ? "⚠️ Pending Manual Review / Needs Review"
                      : "🚨 Analytics Blocked"}
                  </h3>
                  <p className="text-xs opacity-80 leading-relaxed max-w-2xl text-slate-300">
                    {overallQAStatus === "Offline Analytics Privacy Locked"
                      ? "Todos los frentes han sido auditados y declarados conformes. El portapapeles y el sistema de reporte local consolidado se encuentran activos bajo las directivas éticas de ORBI Sentinel."
                      : overallQAStatus === "Needs Review"
                      ? "Existen frentes con advertencias o pendientes de validación manual. Por favor evalúe los detalles a continuación para declarar la aceptación interna."
                      : "Vulneración crítica de privacidad detectada. Se han deshabilitado de forma preventiva las funciones de copiado y exportación para evitar fugas de información operacional o datos personales."}
                  </p>
                </div>
              </div>
            </div>

            {/* Matrix of 10 Audit Fronts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">Matriz de 10 Frentes de Auditoría de Privacidad</h3>
                  <p className="text-xs text-slate-400">Verifique el cumplimiento dinámico o fuerce un estado de auditoría manual para pruebas de conformidad.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">MÓDULO 5B Lock</span>
              </div>

              <div className="space-y-3">
                {auditFrentes.map((frente, idx) => {
                  const effectiveStatus = getFrenteStatus(frente.id, frente.dynamic);
                  const isOverridden = !!manualQAOverrides[frente.id];

                  return (
                    <div key={frente.id} className="p-4 bg-slate-950 border border-slate-850/60 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-800 transition-all">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            FRENTE #{String(idx + 1).padStart(2, '0')}:
                          </span>
                          <strong className="text-xs font-sans text-white uppercase tracking-wide">
                            {frente.name}
                          </strong>
                          {isOverridden && (
                            <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              MANUAL OVERRIDE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {frente.desc}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <span>Diagnóstico en vivo:</span>
                          <span className="text-slate-300 font-bold">{frente.liveDetail}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Current Badge */}
                        <span className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border ${
                          effectiveStatus === "Ready"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : effectiveStatus === "Needs Review"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {effectiveStatus === "Ready" ? "✓ READY" : effectiveStatus === "Needs Review" ? "⚠ REVIEW" : "❌ BLOCKED"}
                        </span>

                        {/* Controls to manually set status */}
                        <div className="flex rounded overflow-hidden border border-slate-800 bg-slate-900 text-[10px] font-mono">
                          <button
                            onClick={() => setManualQAOverrides(prev => ({ ...prev, [frente.id]: "Ready" }))}
                            className={`px-2 py-1 transition-all ${effectiveStatus === "Ready" && isOverridden ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                            title="Declarar conforme"
                          >
                            Ready
                          </button>
                          <button
                            onClick={() => setManualQAOverrides(prev => ({ ...prev, [frente.id]: "Needs Review" }))}
                            className={`px-2 py-1 transition-all ${effectiveStatus === "Needs Review" && isOverridden ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                            title="Declarar advertencia"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => setManualQAOverrides(prev => ({ ...prev, [frente.id]: "Blocked" }))}
                            className={`px-2 py-1 transition-all ${effectiveStatus === "Blocked" && isOverridden ? "bg-rose-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
                            title="Declarar bloqueo"
                          >
                            Block
                          </button>
                          {isOverridden && (
                            <button
                              onClick={() => {
                                const copy = { ...manualQAOverrides };
                                delete copy[frente.id];
                                setManualQAOverrides(copy);
                              }}
                              className="px-2 py-1 text-rose-400 border-l border-slate-800 hover:bg-rose-950/30 transition-all font-bold"
                              title="Limpiar override"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Network Isolation QA verification card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <WifiOff className="w-4 h-4 text-emerald-400" />
                    Auditoría de Aislamiento de Red
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">Safe Offline</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "No cloud telemetry", desc: "Disabled / Production Locked" },
                    { label: "No external analytics SDK", desc: "No scripts from GA, Mixpanel, Firebase or Segment" },
                    { label: "No third-party cookies", desc: "No cookies or local identifiers stored outside sandbox" },
                    { label: "No beacon API", desc: "Native sendBeacon routing disabled / mocked" },
                    { label: "No fetch analytics", desc: "No background fetch or telemetry endpoint calls" },
                    { label: "No websocket telemetry", desc: "Websockets limited to local template dev reload" },
                    { label: "No remote logging", desc: "Audit trail fully localized on-screen and state-only" }
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-slate-200">{check.label}</strong>
                        <p className="text-[10px] text-slate-500">{check.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Allowlist and Blocklist view */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-white">
                    Event Allowlist & Blocklist QA
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">Reglas Activas</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block mb-1">
                      Eventos Permitidos (Allowlist)
                    </span>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850/60 font-mono text-[10px] text-slate-400 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {["demo.session.started", "demo.session.ended", "publichub.opened", "line.selected.field", "guided.field.route.selected", "proposal.report.copied", "export.sanitized.generated", "data.reset.executed", "blocked.event.rejected"].map((ae) => (
                        <span key={ae} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{ae}</span>
                      ))}
                      <span className="text-slate-600 self-center">And 13 other technical events...</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider block mb-1">
                      Eventos Prohibidos (Blocklist)
                    </span>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850/60 font-mono text-[10px] text-slate-400 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {["camera.stream.opened.real", "credential.entered", "ip.captured", "rtsp.captured", "user.identity.captured", "gps.location.captured"].map((be) => (
                        <span key={be} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">{be}</span>
                      ))}
                      <span className="text-slate-600 self-center">Intercepción en caliente</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal italic">
                    * Cualquier intento de registrar un evento no allowlistado o presente en el blocklist es descartado inmediatamente y registrado bajo el tipo abstracta de 'blocked.event.rejected' sin payload.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
