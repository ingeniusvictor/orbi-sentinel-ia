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
  ArrowRight,
  Database,
  Sliders,
  Video,
  AlertOctagon,
  LineChart,
  ShieldAlert,
  ShieldX,
  Server,
  Globe,
  LockKeyhole,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import { getLocalEvents, resetTelemetry, purgeTelemetry, trackLocalEvent, TelemetryEvent } from "../utils/telemetry";
import { VERSION_REGISTRY } from "../data";

interface SentinelDemoInsightsProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (module: string, action: string) => void;
  onBackToEasyView?: () => void;
  onSwitchRole?: (role: "conserje" | "admin" | "tecnico") => void;
}

// 15 Audiences data mapping for Audience Recommendation Engine
const AUDIENCES_DATA = [
  {
    id: "om-manager",
    name: "Gerente O&M",
    line: "Field Operations 🛰️",
    duration: "5 a 10 Minutos",
    screens: "Field Operations Center, Evidence Report, Proposal Center",
    message: "Optimización remota de rondas perimetrales y trazabilidad de evidencia local sin sobrecargar el enlace satelital satélite/LTE.",
    objection: "Pérdida temporal de enlace o latencia satelital en faenas críticas remotas.",
    nextStep: "Planificar piloto acotado de 1 a 3 cámaras perimetrales con almacenamiento híbrido local."
  },
  {
    id: "plant-head",
    name: "Jefe de planta",
    line: "Field Operations 🛰️",
    duration: "5 Minutos",
    screens: "CCTV Diagnostics, Gateway Local, Live Wall",
    message: "Monitoreo del estado físico de enlaces de cámaras y detección automatizada de cortes de energía o descalibración.",
    objection: "Polvo y calor extremo degradando el sensor óptico en el perímetro.",
    nextStep: "Inspección técnica local de los postes para validar factibilidad de canalización PoE."
  },
  {
    id: "tech-supervisor",
    name: "Supervisor técnico",
    line: "Field Operations 🛰️",
    duration: "10 Minutos",
    screens: "Dahua Lab Protocol, Baseline Freezer, Gateway Local",
    message: "Integración ágil multi-marca mediante el protocolo local Dahua sin alterar configuraciones de red preexistentes.",
    objection: "Compatibilidad con grabadores NVR analógicos antiguos.",
    nextStep: "Prueba de compatibilidad de ping y stream HTTP en laboratorio antes del piloto."
  },
  {
    id: "physical-security",
    name: "Seguridad física",
    line: "Field Operations 🛰️",
    duration: "5 Minutos",
    screens: "Motion Core, Live Wall, Incident Center",
    message: "Reducción drástica de falsas alarmas provocadas por fauna o vegetación mediante filtros inteligentes locales.",
    objection: "Capacidad de detección en condiciones de neblina o nula visibilidad nocturna.",
    nextStep: "Ajuste fino de zonas de exclusión de movimiento en el nodo de borde local."
  },
  {
    id: "pmgd-client",
    name: "Cliente PMGD",
    line: "Field Operations 🛰️",
    duration: "5 Minutos",
    screens: "Evidence Report, Proposal Center, Gateway Local",
    message: "Cumplimiento normativo y resguardo de pólizas de seguro mediante bitácoras locales protegidas de intrusiones.",
    objection: "Alto consumo eléctrico de los nodos de procesamiento perimetral.",
    nextStep: "Estudio de factibilidad para energizar los nodos de borde mediante kits solares dedicados."
  },
  {
    id: "tech-committee",
    name: "Comité técnico",
    line: "Field Operations 🛰️",
    duration: "15 Minutos",
    screens: "Access Vault, Diagnostics, Live Wall",
    message: "Resguardo criptográfico de claves locales e interceptación en caliente de comandos de red no autorizados.",
    objection: "Almacenamiento de credenciales de fabricante expuestas ante accesos físicos.",
    nextStep: "Auditoría local del sellado físico de la bóveda (Access Vault) en terreno."
  },
  {
    id: "hse-team",
    name: "Equipo HSE",
    line: "Field Operations 🛰️",
    duration: "5 Minutos",
    screens: "Incident Center, Live Wall, Motion Core",
    message: "Detección temprana de intrusos en zonas de alto peligro eléctrico o industrial resguardando la integridad física.",
    objection: "Uso de datos para persecución laboral o control de productividad de operarios.",
    nextStep: "Activar ofuscación automática local de rostros (Privacy Shield) de los trabajadores."
  },
  {
    id: "cctv-vendor",
    name: "Proveedor CCTV",
    line: "Field Operations 🛰️",
    duration: "10 Minutos",
    screens: "Compatibility Matrix, EasyView, Gateway Local",
    message: "Amplio soporte multi-marca que permite revalorizar cámaras baratas mediante analíticas avanzadas sin cambiar de hardware.",
    objection: "Bloqueos de firmware propietario por parte de marcas principales.",
    nextStep: "Validación de compatibilidad directa usando el asistente local de la matriz."
  },
  {
    id: "condo-board",
    name: "Comité de condominio",
    line: "Community Pilot 🏢",
    duration: "3 a 5 Minutos",
    screens: "EasyView Resident Panel, Incident Center, Proposal Center",
    message: "Seguridad proactiva vecinal minimizando disputas legales mediante la ofuscación en caliente de rostros públicos.",
    objection: "Costo de implementación inicial y cobros de mantenimiento mensual para la comunidad.",
    nextStep: "Censo técnico de cámaras vecinales comunitarias existentes para integración sin costo de reemplazo."
  },
  {
    id: "res-admin",
    name: "Administración residencial",
    line: "Community Pilot 🏢",
    duration: "5 Minutos",
    screens: "Privacy Compliance, Incident Center, EasyView",
    message: "Cumplimiento estricto de leyes de protección de datos al mantener el video estrictamente de forma local sin envío a nubes externas.",
    objection: "Responsabilidad legal ante la pérdida física de grabaciones locales por robo del nodo.",
    nextStep: "Redacción de protocolo de privacidad vecinal transparentando las políticas Zero-Cloud."
  },
  {
    id: "conserje-profile",
    name: "Conserjería",
    line: "Community Pilot 🏢",
    duration: "3 Minutos",
    screens: "EasyView, Live Wall, Incident Center",
    message: "Panel simplificado de control de accesos de alta visibilidad para reacción inmediata de conserjes sin complejidades.",
    objection: "Capacitación compleja o interfaces difíciles de entender por turnos nocturnos.",
    nextStep: "Entrega de manual instructivo rápido de 10 minutos para operación del panel EasyView."
  },
  {
    id: "resident-profile",
    name: "Residente / copropietario",
    line: "Community Pilot 🏢",
    duration: "3 Minutos",
    screens: "EasyView Resident Panel, Privacy Compliance",
    message: "Visualización vecinal transparente y segura que garantiza la nula grabación de ventanas o patios privados de vecinos.",
    objection: "Sensación de vigilancia invasiva ('Gran Hermano') en áreas recreacionales del condominio.",
    nextStep: "Definición conjunta de horarios de enmascaramiento estricto de áreas comunes."
  },
  {
    id: "investor-profile",
    name: "Inversionista / socio",
    line: "Public Demo Hub ⚡",
    duration: "5 Minutos",
    screens: "Overview Metrics, Launch Media Kit, Compatibility Matrix",
    message: "Modelo de negocio SaaS Edge de alta escalabilidad técnica recurrente con costo cero de ancho de banda cloud.",
    objection: "Fuerte competencia comercial de gigantes multinacionales de alarmas residenciales.",
    nextStep: "Reunión de debida diligencia de arquitectura de software local bajo acuerdo NDA recíproco."
  },
  {
    id: "public-demo",
    name: "Demo pública",
    line: "Public Demo Hub ⚡",
    duration: "60 s",
    screens: "Launch Media Kit, EasyView, Compatibility Matrix",
    message: "Presentación ejecutiva centrada en la facilidad de uso y la arquitectura ética de privacidad por diseño local.",
    objection: "Dificultad de explicar de forma sencilla el funcionamiento del hardware sin conexión a internet.",
    nextStep: "Generación de guion de video comercial sanitizado de 30 segundos en un solo clic."
  },
  {
    id: "video-pres",
    name: "Video presentación",
    line: "Public Demo Hub ⚡",
    duration: "3 Minutos",
    screens: "MVP Freeze Center, Edge Recorder, Context AI",
    message: "Presentación audiovisual interactiva destacando el diagnóstico de red, grabaciones locales y resguardo de claves.",
    objection: "Falta de interactividad real al tratarse de un formato pregrabado.",
    nextStep: "Exportar el reporte técnico sanitizado Markdown como minuta de soporte del video."
  }
];

// 11 Recurrent Safety Blockers list for detailed analytics
const SAFETY_BLOCKERS_METRICS = [
  { key: "media-blocked", name: "Media Blocked", module: "Launch Media Kit", risk: "Alto - Intento de copia de material sin validar frentes éticos de prensa", fix: "Asegurar que todas las marcas críticas del checklist de prensa estén validadas.", baseFreq: 3 },
  { key: "launch-blocked", name: "Launch Status Blocked", module: "Media Kit / Public Hub", risk: "Crítico - Publicación comercial suspendida por controles de auditoría", fix: "Revisar los términos técnicos prohibidos antes de forzar el copiado comercial.", baseFreq: 2 },
  { key: "analytics-blocked", name: "Analytics Blocked", module: "Demo Analytics", risk: "Medio - Intento de activar telemetría externa o cookies de seguimiento", fix: "Ninguna acción necesaria: el Privacy Lock mantiene la telemetría estrictamente en local.", baseFreq: 0 },
  { key: "insights-blocked", name: "Insights Blocked", module: "Demo Insights QA", risk: "Crítico - Exportación de reporte suspendida por frentes críticos de privacidad desmarcados", fix: "Restaurar las marcas Ready para PII, IP/RTSP y Labeled as internal en el checklist de control.", baseFreq: 0 },
  { key: "responsible-failed", name: "Responsible Claims fallido", module: "Public Demo Hub", risk: "Medio - Uso de claims exagerados detectado en el script o un-liner", fix: "Ajustar claims a lenguaje responsable (ej: usar 'mitigar riesgos' en vez de 'eliminar robos').", baseFreq: 1 },
  { key: "no-real-data-failed", name: "No Real Data desmarcado", module: "Diagnostics", risk: "Crítico - Riesgo de fugas de video o parámetros de cámaras operacionales de clientes", fix: "Confirmar que la simulación de cámaras Dahua perimetrales esté activa en modo Demo.", baseFreq: 0 },
  { key: "production-locked-failed", name: "Production Locked desmarcado", module: "EasyView", risk: "Alto - Intento de manipular claves del grabador local NVR fuera del protocolo", fix: "Activar la protección restrictiva del Production Lock en el panel de control.", baseFreq: 0 },
  { key: "guardrails-invisible", name: "Guardrails invisibles", module: "Motion Core", risk: "Medio - Pérdida de visibilidad de las capas éticas de enmascaramiento de rostros", fix: "Forzar recarga del mosaico de video con los filtros de pixelado activos.", baseFreq: 1 },
  { key: "next-step-undefined", name: "Próximo paso no definido", module: "Proposal Center", risk: "Medio - Propuesta comercial generada sin hoja de ruta técnica o límites de piloto", fix: "Definir duración y cantidad de cámaras perimetrales (máximo 3) en el configurador.", baseFreq: 1 },
  { key: "feedback-pii-warning", name: "Feedback Notes con PII warning", module: "Demo Analytics / Notes", risk: "Crítico - Ingreso de nombres de personas, correos reales o RTSP en notas de comentarios", fix: "El validador de texto sanitizó los datos personales. Se sugiere borrar notas sensibles.", baseFreq: 2 },
  { key: "copy-export-blocked", name: "Copy/export bloqueado", module: "Evidence Report", risk: "Alto - Intento de exportación de registros de auditoría sin hash HMAC validado", fix: "Verificar la firma local del Gateway y regenerar el reporte de evidencia local.", baseFreq: 0 }
];

export default function SentinelDemoInsights({
  userRole,
  onAddAuditLog,
  onBackToEasyView,
  onSwitchRole
}: SentinelDemoInsightsProps) {
  // Navigation sub-tabs inside SentinelDemoInsights component (Módulo 5D Suggestion)
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "qalock">("dashboard");

  // Local state for telemetry events
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeAudience, setActiveAudience] = useState<string>("om-manager");

  // Filter query for the 15 audiences search
  const [audienceSearch, setAudienceSearch] = useState<string>("");

  // Section 1: 10 Audit Frentes Interactive States
  const [auditFrentes, setAuditFrentes] = useState({
    safetyBanner: "Ready" as "Ready" | "Needs Review" | "Blocked",
    offlineSource: "Ready" as "Ready" | "Needs Review" | "Blocked",
    syntheticSeed: "Ready" as "Ready" | "Needs Review" | "Blocked",
    interestSummary: "Ready" as "Ready" | "Needs Review" | "Blocked",
    productLineCards: "Ready" as "Ready" | "Needs Review" | "Blocked",
    demoEffectiveness: "Ready" as "Ready" | "Needs Review" | "Blocked",
    audienceEngine: "Ready" as "Ready" | "Needs Review" | "Blocked",
    safetyBlockers: "Ready" as "Ready" | "Needs Review" | "Blocked",
    qualityScore: "Ready" as "Ready" | "Needs Review" | "Blocked",
    sanitizedReport: "Ready" as "Ready" | "Needs Review" | "Blocked"
  });

  // Section 14: 11-point Insights Privacy QA Checklist States
  const [qaChecklist, setQaChecklist] = useState({
    offlineSourceConfirmed: "Ready" as "Ready" | "Needs Review" | "Blocked",
    syntheticSeedLabeled: "Ready" as "Ready" | "Needs Review" | "Blocked",
    noPiiInInsights: "Ready" as "Ready" | "Needs Review" | "Blocked", // CRITICAL
    noIpRtspInInsights: "Ready" as "Ready" | "Needs Review" | "Blocked", // CRITICAL
    noFeedbackTextExported: "Ready" as "Ready" | "Needs Review" | "Blocked",
    safetyBlockersSummarized: "Ready" as "Ready" | "Needs Review" | "Blocked",
    demoQualityScoreLabeled: "Ready" as "Ready" | "Needs Review" | "Blocked", // CRITICAL
    sanitizedReportReady: "Ready" as "Ready" | "Needs Review" | "Blocked",
    resetAwarenessReady: "Ready" as "Ready" | "Needs Review" | "Blocked",
    readmeUpdated: "Ready" as "Ready" | "Needs Review" | "Blocked",
    versionRegistryUpdated: "Ready" as "Ready" | "Needs Review" | "Blocked"
  });

  // Load events and subscribe to updates
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

  const handleResetData = () => {
    if (window.confirm("¿Restaurar los datos de simulación sintéticos pre-sembrados?")) {
      resetTelemetry();
      if (onAddAuditLog) {
        onAddAuditLog("Demo Insights", "Restauró datos pre-sembrados de telemetría local");
      }
    }
  };

  const handlePurgeData = () => {
    if (window.confirm("¿Está seguro de que desea purgar TODOS los registros locales? Esto desactivará los indicadores del dashboard.")) {
      purgeTelemetry();
      if (onAddAuditLog) {
        onAddAuditLog("Demo Insights", "Purgó todos los datos locales de telemetría");
      }
    }
  };

  // Calculations & Aggregations
  const totalSessions = events.filter(e => e.eventType === "demo.session.started").length;
  const hasSynthetic = events.some(e => e.isSynthetic);

  // Line counts
  const fieldLineCount = events.filter(e => e.eventType === "line.selected.field").length;
  const communityLineCount = events.filter(e => e.eventType === "line.selected.community").length;
  const consumerLineCount = events.filter(e => e.eventType === "line.selected.consumer").length;

  let mostVisitedLine = "Field Operations 🛰️";
  let leastVisitedLine = "Consumer Bridge 🔌";
  const linesMap = [
    { name: "Field Operations 🛰️", count: fieldLineCount },
    { name: "Community Pilot 🏢", count: communityLineCount },
    { name: "Consumer Bridge 🔌", count: consumerLineCount }
  ];
  linesMap.sort((a, b) => b.count - a.count);
  if (events.length > 0) {
    mostVisitedLine = linesMap[0].name;
    leastVisitedLine = linesMap[2].name;
  }

  // Audiences counts
  const audienceEvents = events.filter(e => e.eventType === "audience.selected");
  const audienceCounts: Record<string, number> = {};
  audienceEvents.forEach(e => {
    const aud = e.metadata?.audience || "Desconocida";
    audienceCounts[aud] = (audienceCounts[aud] || 0) + 1;
  });
  let mostSelectedAudience = "Gerente O&M";
  let maxAudCount = 0;
  Object.entries(audienceCounts).forEach(([aud, count]) => {
    if (count > maxAudCount) {
      maxAudCount = count;
      mostSelectedAudience = aud;
    }
  });

  // Routes count
  const routeEvents = events.filter(e => ["guided.field.route.selected", "guided.community.route.selected"].includes(e.eventType));
  const routeCounts: Record<string, number> = {};
  routeEvents.forEach(e => {
    const route = e.metadata?.routeId || e.metadata?.durationEstimate || "General 5 min";
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });
  let mostUsedRoute = "Field Operations 5m (solar-om)";
  let maxRouteCount = 0;
  Object.entries(routeCounts).forEach(([route, count]) => {
    if (count > maxRouteCount) {
      maxRouteCount = count;
      mostUsedRoute = route === "solar-om" ? "Field Operations 5m (solar-om)" : route === "condominio-3m" ? "Community 3m (condominio-3m)" : route;
    }
  });

  // Modules count
  const moduleEvents = events.filter(e => e.eventType === "screen.navigation.clicked");
  const moduleCounts: Record<string, number> = {};
  moduleEvents.forEach(e => {
    const tab = e.metadata?.targetTab || "Desconocido";
    moduleCounts[tab] = (moduleCounts[tab] || 0) + 1;
  });
  let mostVisitedModule = "Public Demo Hub";
  let leastVisitedModule = "Dahua Lab Protocol";
  let maxModCount = -1;
  let minModCount = Infinity;
  Object.entries(moduleCounts).forEach(([tab, count]) => {
    if (count > maxModCount) {
      maxModCount = count;
      mostVisitedModule = tab;
    }
    if (count < minModCount) {
      minModCount = count;
      leastVisitedModule = tab;
    }
  });

  // Safety Blockers count from events + simulated baseline
  const mediaBlockedCount = events.filter(e => e.eventType === "media.copy.blocked").length + 3;
  const launchBlockedCount = events.filter(e => e.eventType === "launch.status.blocked").length + 2;
  const rejectedEventCount = events.filter(e => e.eventType === "blocked.event.rejected").length;
  const totalSafetyAlerts = mediaBlockedCount + launchBlockedCount + rejectedEventCount;

  let mostFrequentBlocker = "Media Blocked (Clipboard Copy)";
  if (launchBlockedCount > mediaBlockedCount) {
    mostFrequentBlocker = "Launch Status Blocked";
  } else if (rejectedEventCount > mediaBlockedCount) {
    mostFrequentBlocker = "Prohibited Telemetry Rejected";
  }

  // Copy Actions
  const copyAllowedCount = events.filter(e => e.eventType === "media.copy.allowed").length + 6;
  const proposalCopiedCount = events.filter(e => e.eventType === "proposal.report.copied").length + 2;
  const totalCopyActions = copyAllowedCount + proposalCopiedCount;

  // Guardrails count
  const guardrailEvents = events.filter(e => e.eventType === "guardrails.viewed");
  const guardrailCounts: Record<string, number> = {};
  guardrailEvents.forEach(e => {
    const rule = e.metadata?.rule || "General Guardrail";
    guardrailCounts[rule] = (guardrailCounts[rule] || 0) + 1;
  });
  let mostViewedGuardrail = "Privacy By Design - Pixelation";
  let maxGuardrailCount = 0;
  Object.entries(guardrailCounts).forEach(([rule, count]) => {
    if (count > maxGuardrailCount) {
      maxGuardrailCount = count;
      mostViewedGuardrail = rule;
    }
  });

  // Calculate most frequent next action dynamically
  let mostFrequentNextAction = "Mejorar guion comercial.";
  if (mostVisitedLine.includes("Field")) {
    mostFrequentNextAction = "Preparar piloto Field.";
  } else if (mostVisitedLine.includes("Community")) {
    mostFrequentNextAction = "Preparar piloto Community.";
  }

  // Rule: If "No PII in insights", "No IP/RTSP in insights" or "Demo Quality Score labeled as internal" are Blocked:
  // The overall Insights Status MUST be Blocked and coping reports must be disabled!
  const getOverallInsightsStatus = () => {
    // Check critical checklist items
    if (
      qaChecklist.noPiiInInsights === "Blocked" ||
      qaChecklist.noIpRtspInInsights === "Blocked" ||
      qaChecklist.demoQualityScoreLabeled === "Blocked"
    ) {
      return "Blocked";
    }

    // Check critical frentes of audit
    if (
      auditFrentes.offlineSource === "Blocked" ||
      auditFrentes.qualityScore === "Blocked" ||
      auditFrentes.sanitizedReport === "Blocked"
    ) {
      return "Blocked";
    }

    // Check any other block
    const allChecklist = Object.values(qaChecklist);
    const allFrentes = Object.values(auditFrentes);
    if (allChecklist.includes("Blocked") || allFrentes.includes("Blocked")) {
      return "Blocked";
    }

    if (allChecklist.includes("Needs Review") || allFrentes.includes("Needs Review")) {
      return "Needs Review";
    }

    return "Ready";
  };

  const overallQAStatus = getOverallInsightsStatus();

  // Dynamic Demo Quality Score calculation based on active checks & events
  const calculateDemoQualityScore = () => {
    if (events.length === 0 && !hasSynthetic) {
      return { score: 0, text: "Blocked", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" };
    }

    // If overall QA Status is Blocked, force Score to 0 or state as Blocked
    if (overallQAStatus === "Blocked") {
      return { score: 0, text: "Blocked", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" };
    }

    let score = 100;

    // Deduct for active blockers or warnings from checklist/frentes
    const reviewCount = Object.values(qaChecklist).filter(v => v === "Needs Review").length +
                       Object.values(auditFrentes).filter(v => v === "Needs Review").length;
    score -= (reviewCount * 7);

    // Deduct for simulated telemetry safety alert counts
    score -= (mediaBlockedCount * 3);
    score -= (launchBlockedCount * 4);

    score = Math.max(0, Math.min(100, score));

    let text = "Excellent Demo Readiness";
    let color = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";

    if (score < 40) {
      text = "Blocked";
      color = "text-rose-400 border-rose-500/20 bg-rose-500/5";
    } else if (score < 65) {
      text = "Needs Review";
      color = "text-amber-400 border-amber-500/20 bg-amber-500/5";
    } else if (score < 85) {
      text = "Good Demo Readiness";
      color = "text-sky-400 border-sky-500/20 bg-sky-500/5";
    }

    return { score, text, color };
  };

  const { score: qualityScore, text: scoreText, color: scoreColor } = calculateDemoQualityScore();

  // Generate Sanitized Insights Report (Section 12)
  const generateSanitizedReport = () => {
    const dateStr = new Date().toLocaleDateString("es-CL", { timeZone: "America/Santiago" });
    const complianceDisplay = overallQAStatus === "Ready" ? "DEMO INSIGHTS IMPROVEMENT LOCKED" : overallQAStatus === "Needs Review" ? "NEEDS REVIEW" : "INSIGHTS BLOCKED";

    return `======================================================================
              ORBI SENTINEL IA - DEMO INSIGHTS REPORT
======================================================================
Fecha Generación: ${dateStr}
Hito Técnico: v0.5.3-sentinel-demo-insights-improvement-lock
Estado Auditoría de Privacidad: ${complianceDisplay}
Demo Quality Score Interno: ${qualityScore}/100 (${scoreText})
Fuente de Origen: Analítica Local del Navegador (Zero-Cloud-PII)
Inclusión de Datos Sintéticos: ${hasSynthetic ? "Sí (Sembrado de Demostración Didáctica)" : "No (Sólamente datos creados en sesión)"}

------------------------ PATRONES DE INTERÉS ------------------------
Línea Tecnológica más Interactiva: ${mostVisitedLine}
Línea Tecnológica con Menos Flujo: ${leastVisitedLine}
Perfil de Audiencia Predominante: ${mostSelectedAudience}
Ruta Guiada de Demostración Preferida: ${mostUsedRoute}
Módulo con Mayor Tráfico de Clicks: ${mostVisitedModule}
Módulo con Menor Tráfico de Clicks: ${leastVisitedModule}

------------------------- SEGURIDAD Y PRIVACIDAD --------------------
Alertas de Bloqueo Interceptadas: ${totalSafetyAlerts} veces
- Bloqueo de Portapapeles (Media Blocked): ${mediaBlockedCount}
- Lanzamiento Suspendido (Launch Check): ${launchBlockedCount}
- Eventos Prohibidos Descartados: ${rejectedEventCount}
Último Guardrail de Privacidad Inspeccionado: ${mostViewedGuardrail}

------------------------- ACCIONES COMERCIALES ----------------------
Eventos de Copiado / Exportación Exitosos: ${totalCopyActions}
- Reportes de Propuesta Técnica Copiados: ${proposalCopiedCount}
- Guiones de Marketing / Prensa Copiados: ${copyAllowedCount}

------------------------ ACCIONES RECOMENDADAS ----------------------
1. Para el perfil "${mostSelectedAudience}", sugerimos priorizar la línea "${mostVisitedLine}".
2. Atender bloqueo más frecuente: "${mostFrequentBlocker}" mediante la corrección de claims éticos.
3. Asegurar la mantención estricta del aislamiento de red local (Zero-Cloud-PII).
4. Próxima acción prioritaria de operador: ${mostFrequentNextAction}
5. Requisito Handoff: ${(() => {
  const rawState = typeof window !== "undefined" ? localStorage.getItem("ORBI_SENTINEL_ACTIVE_PILOT_INTAKE_STATE") : null;
  if (rawState) {
    try {
      const parsed = JSON.parse(rawState);
      if (parsed && parsed.overallState && parsed.overallState.includes("Locked")) {
        return "¡Pilot Intake Listo! Proceder con el traspaso seguro desde el módulo Pilot Handoff Pack.";
      }
    } catch (e) {}
  }
  return "Pilot Intake pendiente. Asegurar la sanitización y completar el checklist de Pilot Intake para desbloquear el Pilot Handoff Pack.";
})()}

------------------------ LIMITACIONES DE USO -----------------------
* Este informe es 100% sintético, educativo y simulado localmente.
* No contiene Direcciones IP, flujos RTSP, credenciales, correos ni PII.
* Prohibida su venta, asignación comercial de SLA o uso contractual.
* El Score de Readiness es una estimación interna no certificada legalmente.
======================================================================`;
  };

  const handleCopyToClipboard = () => {
    if (overallQAStatus === "Blocked") return;

    navigator.clipboard.writeText(generateSanitizedReport());
    setCopySuccess(true);
    if (onAddAuditLog) {
      onAddAuditLog("Demo Insights", "Copió al portapapeles el reporte de insights sanitizado");
    }
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Interactive Checklist toggles
  const toggleChecklistItem = (key: keyof typeof qaChecklist) => {
    setQaChecklist(prev => {
      const current = prev[key];
      const next = current === "Ready" ? "Needs Review" : current === "Needs Review" ? "Blocked" : "Ready";
      return { ...prev, [key]: next };
    });
  };

  const toggleAuditFrente = (key: keyof typeof auditFrentes) => {
    setAuditFrentes(prev => {
      const current = prev[key];
      const next = current === "Ready" ? "Needs Review" : current === "Needs Review" ? "Blocked" : "Ready";
      return { ...prev, [key]: next };
    });
  };

  // Filtered list of 15 audiences based on query search
  const filteredAudiences = AUDIENCES_DATA.filter(aud =>
    aud.name.toLowerCase().includes(audienceSearch.toLowerCase()) ||
    aud.line.toLowerCase().includes(audienceSearch.toLowerCase())
  );

  const isEmpty = events.length === 0 && !hasSynthetic;

  return (
    <div className="space-y-6" id="demo-insights-dashboard">
      
      {/* HEADER SECTION WITH NAVIGATION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-sans font-black tracking-tight text-white uppercase">
              ORBI Sentinel IA • Demo Insights Hub
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Módulo 5D • Auditoría final local y bloqueo de frentes de analítica comercial y preparación de maquetas offline.
          </p>
        </div>

        {/* RESET & PURGE CONTROLS */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold transition-all"
            title="Restaurar simulación de eventos sintéticos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Seed Data</span>
          </button>
          
          <button
            onClick={handlePurgeData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono font-bold transition-all"
            title="Borrar logs acumulados en localStorage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purga y Reseteo</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-900">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`flex-1 py-2.5 rounded-md text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "dashboard"
              ? "bg-slate-900 text-emerald-400 border border-slate-850 shadow-md"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>📊 Demo Insights Dashboard</span>
        </button>
        <button
          onClick={() => setActiveSubTab("qalock")}
          className={`flex-1 py-2.5 rounded-md text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "qalock"
              ? "bg-slate-900 text-emerald-400 border border-slate-850 shadow-md"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>🔒 Demo Insights QA Lock</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD & ANALYTICS VIEW */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* INSIGHTS SAFETY BANNER & DISCLAIMER (Section 2) */}
          <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Insights locales — análisis offline de demostraciones, sin nube, sin PII, sin IP/RTSP y sin datos reales de clientes.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Este panel procesa métricas agregadas de clics de sesión local para orientar al presentador de ORBI Sentinel IA, sin emitir paquetes de red a servidores externos.
                  </p>
                </div>
              </div>
            </div>

            {/* OBLIGATORY BADGES */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-850/60">
              {[
                { text: "Offline Insights", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "Local Only", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "Sanitized", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "No Cloud", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "No PII", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "No Camera Data", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { text: "Synthetic Data Aware", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                { text: "Resettable", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
              ].map((b, idx) => (
                <span key={idx} className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${b.color}`}>
                  {b.text}
                </span>
              ))}
            </div>

            {/* SEED DATA DISCLAIMER (Section 2) */}
            {hasSynthetic && (
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-[10px] text-amber-300 font-medium">
                  <strong>Aviso de Datos Sembrados:</strong> Este panel puede incluir seed data sintético para demostración. No representa actividad real de clientes, usuarios ni sitios operacionales.
                </p>
              </div>
            )}
          </div>

          {isEmpty ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">No hay analítica local disponible</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  El almacenamiento de telemetría local de ORBI Sentinel está vacío. Para simular datos de aprendizaje, use el botón para restaurar seed data didáctica.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-600 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restaurar Seed Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* DUAL STAT ROW: INTERNAL SCORE & COMPREHENSIVE INTERESTS SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DEMO QUALITY SCORE CARD (Section 10) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Indicador Interno
                    </span>
                    <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                      Demo Quality Score
                    </h3>
                    {/* MANDATORY score notice (Section 10) */}
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                      “Este score es una métrica interna de preparación de demo. No representa desempeño comercial real, cumplimiento legal, SLA productivo ni resultado contractual.”
                    </p>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="text-slate-800"
                          strokeWidth="6"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className={qualityScore >= 85 ? "text-emerald-500" : qualityScore >= 65 ? "text-sky-500" : qualityScore >= 40 ? "text-amber-500" : "text-rose-500"}
                          strokeWidth="6"
                          strokeDasharray={213.6}
                          strokeDashoffset={213.6 - (213.6 * qualityScore) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-xl font-mono font-black text-white">
                        {qualityScore}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${scoreColor}`}>
                        {scoreText}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {qualityScore >= 85
                          ? "Cumplimiento normativo y resguardo de privacidad sobresalientes."
                          : qualityScore >= 65
                          ? "Aceptable. Verifique que no queden frentes técnicos pendientes."
                          : "Revisión crítica requerida de inmediato por frentes bloqueados."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] text-slate-500 leading-normal font-mono">
                    * Ponderación: Checklists (40%), Guardrails (30%), Bajo nivel de bloqueos (30%).
                  </div>
                </div>

                {/* DEMO INTEREST SUMMARY GRID (Section 4) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                        Demo Interest Summary
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Indicadores de flujo de uso agregados libres de PII de clientes</p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-400 text-[9px] font-mono rounded border border-slate-800">
                      Métricas locales de demo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Línea más visitada", value: mostVisitedLine.split(" ")[0], desc: mostVisitedLine },
                      { label: "Línea menor uso", value: leastVisitedLine.split(" ")[0], desc: leastVisitedLine },
                      { label: "Audiencia más seleccionada", value: mostSelectedAudience.substring(0, 14) + (mostSelectedAudience.length > 14 ? ".." : ""), desc: mostSelectedAudience },
                      { label: "Ruta guiada más usada", value: mostUsedRoute.substring(0, 14) + "..", desc: mostUsedRoute },
                      { label: "Módulo más visitado", value: mostVisitedModule.substring(0, 14) + (mostVisitedModule.length > 14 ? ".." : ""), desc: mostVisitedModule },
                      { label: "Bloqueo más frecuente", value: mostFrequentBlocker.substring(0, 14) + "..", desc: mostFrequentBlocker },
                      { label: "Guardrail más visto", value: mostViewedGuardrail.substring(0, 14) + "..", desc: mostViewedGuardrail },
                      { label: "Próximo paso más frecuente", value: mostFrequentNextAction.substring(0, 14) + "..", desc: mostFrequentNextAction }
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex flex-col justify-between hover:border-slate-800 transition-all">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">{item.label}</span>
                        <strong className="text-xs font-sans text-white uppercase block mt-1.5 tracking-tight truncate">{item.value}</strong>
                        <span className="text-[8px] font-mono text-slate-400 mt-1 block truncate" title={item.desc}>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* PRODUCT LINE INSIGHT CARDS (Section 5) */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-sans font-bold uppercase text-slate-300 tracking-wider">
                  Análisis Técnico por Línea de Negocio (Product Line Insights)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* FIELD */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-sans font-black text-white uppercase">🛰️ FIELD OPERATIONS</span>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400">
                          {fieldLineCount} Clics
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Sugerencias basadas en uso local para mitigar objeciones de consumo de energía solar y anchos de banda LTE perimetrales.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-850/60 pt-2.5">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] text-emerald-400 leading-normal font-mono font-bold">
                        ✓ Confirmado: Sin datos reales de parques perimetrales.
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        <strong>Recomendación:</strong> Sugerir pilotos acotados de 1 a 3 cámaras perimetrales con enlace local LTE.
                      </p>
                    </div>
                  </div>

                  {/* COMMUNITY */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-sans font-black text-white uppercase">🏢 COMMUNITY PILOT</span>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-sky-500/10 text-sky-400">
                          {communityLineCount} Clics
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Recomendaciones enfocadas en el resguardo estricto y la ofuscación en caliente de patentes y rostros vecinales.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-850/60 pt-2.5">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] text-emerald-400 leading-normal font-mono font-bold">
                        ✓ Confirmado: Sin datos residenciales de personas.
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        <strong>Recomendación:</strong> Enfocar la presentación en el panel EasyView simplificado y enmascaramiento vecinal.
                      </p>
                    </div>
                  </div>

                  {/* CONSUMER */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-sans font-black text-white uppercase">🔌 CONSUMER BRIDGE</span>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-amber-500/10 text-amber-400">
                          {consumerLineCount} Clics
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Sugerencias de integración de cámaras baratas mediante el puente local sin transferir flujos multimedia a la nube.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-850/60 pt-2.5">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] text-emerald-400 leading-normal font-mono font-bold">
                        ✓ Confirmado: Sin cámaras reales ni video real.
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        <strong>Recomendación:</strong> Explicar cómo el sandbox local de ORBI resguarda la privacidad de transmisiones domésticas.
                      </p>
                    </div>
                  </div>

                  {/* PUBLIC / MEDIA KIT */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-sans font-black text-white uppercase">⚡ PUBLIC & MEDIA</span>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-rose-500/10 text-rose-400">
                          {copyAllowedCount} Copias
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Control ético de afirmaciones de prensa, mitigando la tentación de realizar promesas de desempeño técnico.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-850/60 pt-2.5">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] text-emerald-400 leading-normal font-mono font-bold">
                        ✓ Confirmado: Scripts cargados por categorías abstractas.
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        <strong>Recomendación:</strong> Forzar la inclusión de créditos institucionales para garantizarClaims responsables.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* GUIDED DEMO EFFECTIVENESS TABLE (Section 6) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2.5">
                  <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                    Guided Demo Effectiveness Tracker
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Análisis granular de completitud local para optimizar el ritmo del pitch presencial.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 font-mono text-[10px] uppercase">
                        <th className="py-2 px-3">Ruta de Demostración</th>
                        <th className="py-2 px-3 text-center">Inicios Locales</th>
                        <th className="py-2 px-3 text-center">Tasa de Completación</th>
                        <th className="py-2 px-3">Pasos Saltados</th>
                        <th className="py-2 px-3">Pantallas Abiertas</th>
                        <th className="py-2 px-3">Objeciones Principales</th>
                        <th className="py-2 px-3">Recomendación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 text-slate-300 font-mono text-[11px]">
                      {[
                        // Field Routes
                        { name: "Field - 3 min (Apertura)", count: events.filter(e => e.eventType === "guided.field.route.selected" && e.metadata?.durationEstimate === "3m").length + 2, rate: "92%", skipped: "Bóveda local", views: "Overview, Live Wall", obj: "Falsas alarmas", rec: "Excelente enganche. Use en llamadas iniciales." },
                        { name: "Field - 5 min (Estándar)", count: events.filter(e => e.eventType === "guided.field.route.selected" && e.metadata?.durationEstimate === "5m").length + 4, rate: "84%", skipped: "Puertos / CJS", views: "Diagnostics, Gateway", obj: "Estabilidad LTE", rec: "Foco principal para ingenieros perimetrales." },
                        { name: "Field - 10 min (Profunda)", count: events.filter(e => e.eventType === "guided.field.route.selected" && e.metadata?.durationEstimate === "10m").length + 1, rate: "65%", skipped: "Checklists", views: "Evidence, Access Vault", obj: "Compatibilidad marcas", rec: "Adecuado para supervisores técnicos." },
                        { name: "Field - 15 min (Técnica)", count: events.filter(e => e.eventType === "guided.field.route.selected" && e.metadata?.durationEstimate === "15m").length, rate: "40%", skipped: "Términos prohibidos", views: "Baseline Freezer, Logs", obj: "Soporte Dahua", rec: "Nivel técnico muy alto. Reducir duración de ser posible." },
                        // Community Routes
                        { name: "Community - 3 min (Vecinal)", count: events.filter(e => e.eventType === "guided.community.route.selected" && e.metadata?.durationEstimate === "3m").length + 3, rate: "89%", skipped: "Frecuencias", views: "EasyView Resident, Shield", obj: "Privacidad", rec: "Excelente retención de atención con vecinos." },
                        { name: "Community - 5 min (Comité)", count: events.filter(e => e.eventType === "guided.community.route.selected" && e.metadata?.durationEstimate === "5m").length + 1, rate: "76%", skipped: "Gateway ping", views: "Incident, Compliance", obj: "Costos de mantención", rec: "Nivel recomendado para directivas de condominios." },
                        { name: "Community - 10 min (Asamblea)", count: events.filter(e => e.eventType === "guided.community.route.selected" && e.metadata?.durationEstimate === "10m").length, rate: "48%", skipped: "Parámetros Dahua", views: "Proposal Center, Logs", obj: "Garantía", rec: "Tasa de abandono alta. Prefiera formato de 5 min." },
                        // Public Routes
                        { name: "Public Pitch - 60 s (Elevator)", count: 5, rate: "95%", skipped: "Detalles técnicos", views: "Public Hub Overview", obj: "Claims", rec: "Ruta comercial flash ideal para ferias de seguridad." },
                        { name: "Public Pitch - 3 min", count: 3, rate: "88%", skipped: "Bóveda / Claves", views: "Launch Media Kit", obj: "Uso de marcas", rec: "Explicar claims éticos de forma rápida y concisa." },
                        { name: "Public Pitch - 5 min", count: 1, rate: "70%", skipped: "Ruta de streams", views: "Proposal Copier, Hub", obj: "Propuesta comercial", rec: "Adecuado para llamadas con socios e inversores." }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-2.5 px-3 text-slate-200 font-sans font-bold">{row.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-400">{row.count}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{row.rate}</td>
                          <td className="py-2.5 px-3 text-slate-500">{row.skipped}</td>
                          <td className="py-2.5 px-3 text-sky-400">{row.views}</td>
                          <td className="py-2.5 px-3 text-rose-400">{row.obj}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] leading-relaxed">{row.rec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MANDATORY completeness disclaimer (Section 6) */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850/60 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 font-sans leading-normal">
                    <strong>Aclaración Obligatoria:</strong> “La completitud es una métrica local de demo, no una medición contractual ni desempeño real de ventas.”
                  </p>
                </div>
              </div>

              {/* AUDIENCE RECOMMENDATION ENGINE (Section 7) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                      Audience Recommendation Engine (Local Server)
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Asociación dinámica de mensajes éticos y recomendaciones técnicas para los 15 perfiles de audiencia.</p>
                  </div>

                  {/* Search Input for 15 audiences */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar audiencia..."
                      value={audienceSearch}
                      onChange={(e) => setAudienceSearch(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-52"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left list - 15 Audiences Scrollable Block */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-1 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-1 bg-slate-950 border border-slate-850 rounded-lg shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block px-2 py-1.5 font-bold border-b border-slate-850">
                      Perfiles de Audiencia ({filteredAudiences.length}):
                    </span>
                    {filteredAudiences.map((aud) => (
                      <button
                        key={aud.id}
                        onClick={() => setActiveAudience(aud.id)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded text-xs transition-all text-left uppercase font-bold ${
                          activeAudience === aud.id
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{aud.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 lowercase">
                          {aud.line.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                    {filteredAudiences.length === 0 && (
                      <p className="p-4 text-xs text-slate-500 font-mono text-center">Ninguna coincidencia.</p>
                    )}
                  </div>

                  {/* Right Panel - Active Audience Recommendation Details */}
                  <div className="flex-1 p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
                    {(() => {
                      const data = AUDIENCES_DATA.find(a => a.id === activeAudience) || AUDIENCES_DATA[0];
                      return (
                        <div className="space-y-4 text-xs font-sans">
                          <div className="flex justify-between items-start border-b border-slate-850 pb-2.5">
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-emerald-400" />
                                {data.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Sugerencias técnicas offline de presentación</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold rounded border border-emerald-500/20 uppercase shrink-0">
                              No Garantizado Comercial
                            </span>
                          </div>

                          {/* Dynamic items details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Línea de Tecnología Sugerida:</span>
                              <strong className="text-white block uppercase bg-slate-900 px-2 py-1 rounded border border-slate-850">{data.line}</strong>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Duración Recomendada de Pitch:</span>
                              <strong className="text-white block uppercase bg-slate-900 px-2 py-1 rounded border border-slate-850">{data.duration}</strong>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Pantallas Prioritarias a Desplegar:</span>
                              <strong className="text-sky-300 block bg-slate-900 px-2 py-1.5 rounded border border-slate-850">{data.screens}</strong>
                            </div>
                          </div>

                          <div className="space-y-3 pt-1">
                            <div className="p-3.5 bg-emerald-950/10 border border-emerald-500/10 rounded-lg space-y-1">
                              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Mensaje Clave del Pitch Ético:</span>
                              <p className="text-slate-300 text-xs leading-normal">
                                {data.message}
                              </p>
                            </div>

                            <div className="p-3.5 bg-rose-950/10 border border-rose-500/10 rounded-lg space-y-1">
                              <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider block">Objeción Técnica más Probable:</span>
                              <p className="text-slate-300 text-xs leading-normal font-sans italic">
                                "{data.objection}"
                              </p>
                            </div>

                            <div className="p-3.5 bg-blue-950/15 border border-blue-500/15 rounded-lg space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <ArrowRight className="w-4 h-4 text-blue-400" />
                                <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">Próximo Paso Técnico Sugerido:</span>
                              </div>
                              <p className="text-slate-200 text-xs font-bold leading-normal">
                                {data.nextStep}
                              </p>
                            </div>
                          </div>

                          {/* Safety limits on recommendation engine */}
                          <div className="p-2.5 bg-slate-900 rounded border border-slate-850 text-[10px] text-slate-500 leading-normal font-mono">
                            * Reglas éticas: Sin nombres de personas o empresas reales. La recomendación no constituye garantía comercial ni cierre forzado de venta.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* DUAL COLUMN: SAFETY BLOCKER RECURRENT INSIGHTS & MEDIA KIT OPTIMIZATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SAFETY BLOCKER INSIGHTS (Section 8) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Safety Blocker Recurrent Insights
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bitácora agregada de interceptaciones locales por resguardos y guardrails éticos.</p>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans italic leading-normal bg-slate-950 p-2.5 rounded border border-slate-850">
                    * Verificación: Frecuencia de rechazos de telemetría o interrupciones en portapapeles. No se almacenan payloads de notas sensibles de operadores.
                  </p>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850 pr-1">
                    {SAFETY_BLOCKERS_METRICS.map((block) => {
                      // Dynamically calculate based on events + simulated base
                      let displayCount = block.baseFreq;
                      if (block.key === "media-blocked") displayCount = mediaBlockedCount;
                      if (block.key === "launch-blocked") displayCount = launchBlockedCount;
                      if (block.key === "feedback-pii-warning") displayCount = events.filter(e => e.eventType === "blocked.event.rejected" && e.metadata?.originalType?.includes("notes")).length + 2;

                      return (
                        <div key={block.key} className="p-3 bg-slate-950 border border-slate-850/60 hover:border-slate-800 rounded-lg space-y-2 transition-all">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <strong className="text-slate-200 uppercase">{block.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${displayCount > 0 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-900 text-slate-500"}`}>
                              {displayCount} Registrados
                            </span>
                          </div>
                          <div className="text-[10px] font-mono space-y-1 text-slate-400">
                            <div><span className="text-slate-500">Módulo Afectado:</span> <span className="text-slate-300">{block.module}</span></div>
                            <div><span className="text-slate-500">Nivel de Riesgo:</span> <span className="text-rose-400 font-bold">{block.risk}</span></div>
                            <div className="p-2 bg-slate-900 rounded border border-slate-850 text-slate-300 mt-1.5 font-sans">
                              <strong>Instrucción de Corrección:</strong> {block.fix}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MEDIA KIT IMPROVEMENT INSIGHTS (Section 9) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-emerald-400" />
                        Media Kit Optimization Insights
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Trazabilidad abstracta de duraciones y formatos preferidos para mejorar el guion de lanzamiento.</p>
                    </div>

                    {/* Horizontal bars representation for categories only */}
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-3 font-mono text-[11px]">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Duraciones de Video & Formatos más Usados:</span>
                      
                      {[
                        { label: "Video Pitch Comercial (30s)", count: events.filter(e => e.eventType === "media.script.generated" && e.metadata?.duration === "30s").length + 6, total: 12 },
                        { label: "Video Técnico Profundo (90s)", count: events.filter(e => e.eventType === "media.script.generated" && e.metadata?.duration === "90s").length + 2, total: 12 },
                        { label: "Plataforma LinkedIn Social", count: events.filter(e => e.metadata?.type?.includes("linkedin")).length + 8, total: 12 },
                        { label: "Email / Minutas Sanitizadas", count: events.filter(e => e.metadata?.type?.includes("email")).length + 3, total: 12 },
                        { label: "Mensajes Stakeholders Generados", count: 7, total: 12 },
                        { label: "Email Template Copiado", count: proposalCopiedCount + 3, total: 12 },
                        { label: "Landing / Website Copy Copiada", count: 4, total: 12 },
                        { label: "Créditos Completos Incluidos", count: 5, total: 12 },
                        { label: "Créditos Ocultos / Simplificados", count: 2, total: 12 },
                        { label: "Acciones de Copia Bloqueadas", count: mediaBlockedCount, total: 12 }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{bar.label}</span>
                            <span>{bar.count} Veces</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, (bar.count / bar.total) * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-sans mt-3.5">
                    <strong>Regla de Privacidad de Prensa:</strong> El sistema resguarda al 100% el contenido de notas personalizadas. Solo se registran contadores abstractos de la acción de copia y la longitud del mensaje.
                  </div>
                </div>

              </div>

              {/* RECOMMENDED OPERATOR NEXT ACTIONS (Section 11) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                    Recommended Operator Next Actions
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Acciones permitidas y sugeridas de conformidad con las políticas éticas locales de ORBI.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Valid/Sugerido list */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">✓ Acciones Permitidas & Sugeridas:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Mejorar guion.", desc: "Refinar el pitch para enfocarse en resguardo local Zero-Cloud." },
                        { label: "Preparar video.", desc: "Crear clips promocionales cortos con enmascaramiento activo." },
                        { label: "Preparar presentación.", desc: "Diseñar diapositivas didácticas limitadas a 1-3 cámaras." },
                        { label: "Preparar piloto Field.", desc: "Configurar kit solar perimetral perimetral LTE de prueba." },
                        { label: "Preparar piloto Community.", desc: "Instalar ofuscación local en condominios." },
                        { label: "Revisar claims.", desc: "Verificar claims éticos sin sobrepromesas técnicas." },
                        { label: "Revisar privacidad.", desc: "Validar que la analítica local se mantenga aislada." },
                        { label: "Revisar feedback notes.", desc: "Confirmar que no queden correos reales de clientes." },
                        { label: "Borrar analytics locales.", desc: "Purgar bitácora temporal del navegador de manera segura." },
                        { label: "Exportar reporte sanitizado.", desc: "Descargar minuta consolidada libre de datos privados." }
                      ].map((act, i) => (
                        <div key={i} className="p-2.5 bg-slate-950 border border-slate-850/60 rounded-lg flex items-start gap-2 hover:border-slate-800 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <strong className="text-[11px] text-slate-200 font-sans block">{act.label}</strong>
                            <p className="text-[9px] text-slate-500 leading-normal font-mono">{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prohibited/Prohibidas list */}
                  <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl space-y-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block font-bold flex items-center gap-1.5">
                        <ShieldX className="w-4 h-4" />
                        ❌ Prácticas Estrictamente Prohibidas:
                      </span>
                      <p className="text-[10px] text-rose-300 mt-1">
                        Las siguientes acciones representan vulneraciones graves a los principios de privacidad local de ORBI y se encuentran bloqueadas por arquitectura:
                      </p>
                    </div>

                    <div className="space-y-2 font-mono text-[10px]">
                      {[
                        { act: "Activar cloud telemetry.", risk: "Riesgo: Envío no autorizado de trazas de uso a servidores externos." },
                        { act: "Solicitar credenciales por mensaje.", risk: "Riesgo: Almacenamiento de contraseñas de fabricante en texto plano." },
                        { act: "Usar datos reales en demo.", risk: "Riesgo: Exposición accidental de direcciones de cámaras de clientes en producción." },
                        { act: "Saltar autorización del cliente.", risk: "Riesgo: Integración de flujos de video sin firma de consentimiento mutuo." },
                        { act: "Publicar sin Controlled Demo Lock.", risk: "Riesgo: Distribución de materiales de venta con claims exagerados de seguridad." }
                      ].map((pro, i) => (
                        <div key={i} className="p-2 bg-slate-950 border border-rose-500/15 rounded flex flex-col justify-between">
                          <strong className="text-rose-400 text-[10px] uppercase block">{pro.act}</strong>
                          <span className="text-[8px] text-slate-500 mt-0.5">{pro.risk}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-rose-500/5 rounded border border-rose-500/10 text-[9px] text-rose-300 leading-relaxed text-center">
                      🛡️ El nodo local de ORBI Sentinel IA bloquea de manera proactiva cualquier intento de activar estas prácticas durante las simulaciones.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: DEMO INSIGHTS QA LOCK VIEW (Section 1) */}
      {activeSubTab === "qalock" && (
        <div className="space-y-6">
          
          {/* GLOBAL STATE DISPLAY */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                Estado Global de Conformidad de Insights
              </span>
              <div className="flex items-center gap-2">
                {overallQAStatus === "Ready" ? (
                  <h2 className="text-lg font-sans font-black text-emerald-400 tracking-tight">
                    DEMO INSIGHTS IMPROVEMENT LOCKED
                  </h2>
                ) : overallQAStatus === "Needs Review" ? (
                  <h2 className="text-lg font-sans font-black text-amber-400 tracking-tight">
                    NEEDS REVIEW
                  </h2>
                ) : (
                  <h2 className="text-lg font-sans font-black text-rose-400 tracking-tight">
                    INSIGHTS BLOCKED
                  </h2>
                )}
                <span className="text-slate-500 text-xs font-mono">v0.5.3</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                {overallQAStatus === "Ready"
                  ? "Se ha completado satisfactoriamente la auditoría de privacidad local. Todos los frentes del laboratorio se encuentran validados como seguros y no contractuales."
                  : overallQAStatus === "Needs Review"
                  ? "Auditoría en progreso. Algunos frentes de inteligencia de pitch se encuentran marcados en proceso de revisión por parte del operador."
                  : "BLOQUEADO: Se han detectado frentes críticos de privacidad marcados como Blocked. Se desactiva la capacidad de copiar y exportar informes."}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-850 rounded-lg w-full md:w-44 text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Estado de Bloqueo</span>
              {overallQAStatus === "Ready" ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-black uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SECURE LOCKED</span>
                </div>
              ) : overallQAStatus === "Needs Review" ? (
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-black uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span>REVIEW REQUIRED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs font-black uppercase bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
                  <ShieldX className="w-4 h-4 animate-bounce" />
                  <span>SYSTEM BLOCKED</span>
                </div>
              )}
            </div>
          </div>

          {/* DUAL GRID: 10 AUDIT FRENTES & 11-POINT CHECKLIST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 10 FRENTES DE AUDITORÍA (Section 1) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                    Tablero de Auditoría de 10 Frentes
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Haga clic en las tarjetas de frentes para alternar su estado manual de validación.</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-950 text-[9px] text-slate-500 font-mono border border-slate-850 rounded">
                  Frentes Locales
                </span>
              </div>

              <div className="space-y-2.5 max-h-[580px] overflow-y-auto scrollbar-thin pr-1">
                {[
                  { key: "safetyBanner", label: "Insights Safety Banner", desc: "Verificación de visualización del banner descriptivo con los 8 badges éticos obligatorios." },
                  { key: "offlineSource", label: "Offline Source Verification", desc: "Validación del aislamiento total de la telemetría local sin analytics SDK externos.", isCritical: true },
                  { key: "syntheticSeed", label: "Synthetic Seed Labeling", desc: "Etiquetado explícito que previene confundir datos sembrados simulados con comportamiento real." },
                  { key: "interestSummary", label: "Demo Interest Summary", desc: "Confirmación de visualización de métricas agregadas sin nombres de clientes." },
                  { key: "productLineCards", label: "Product Line Insight Cards", desc: "Validación de tarjetas métricas específicas para Field, Community, Consumer y Public sin PII." },
                  { key: "demoEffectiveness", label: "Guided Demo Effectiveness", desc: "Validación de matriz de completitud temporal con el descargo ético mandatorio." },
                  { key: "audienceEngine", label: "Audience Recommendation Engine", desc: "Verificación del recomendador de pitch comercial por audiencias de forma no garantizada." },
                  { key: "safetyBlockers", label: "Safety Blocker Insights", desc: "Análisis recurrente de bloqueos sin retener payloads confidenciales de red." },
                  { key: "qualityScore", label: "Demo Quality Score", desc: "Validación de la ponderación con disclaimer de indicador interno no contractual.", isCritical: true },
                  { key: "sanitizedReport", label: "Sanitized Insights Report", desc: "Compilación de reporte copiable en Markdown libre de IPs, RTSP o credenciales.", isCritical: true }
                ].map((frente) => {
                  const currentStatus = auditFrentes[frente.key as keyof typeof auditFrentes];
                  return (
                    <div
                      key={frente.key}
                      onClick={() => toggleAuditFrente(frente.key as keyof typeof auditFrentes)}
                      className="p-3 bg-slate-950 border border-slate-850/60 hover:border-slate-800 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[11px] font-sans text-slate-200 uppercase tracking-wide">
                            {frente.label}
                          </strong>
                          {frente.isCritical && (
                            <span className="px-1 py-0.2 text-[7px] font-mono font-bold bg-rose-500/15 text-rose-400 rounded border border-rose-500/25">
                              CRÍTICO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{frente.desc}</p>
                      </div>

                      <div className="shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          currentStatus === "Ready"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : currentStatus === "Needs Review"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {currentStatus === "Ready" ? "✓ READY" : currentStatus === "Needs Review" ? "⚠ REVIEW" : "❌ BLOCKED"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 11-POINT QA CHECKLIST (Section 14) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Insights Privacy QA Checklist (11 Puntos)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Evaluación individual de resguardos éticos de privacidad del laboratorio.</p>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal italic bg-slate-950 p-2.5 rounded border border-slate-850">
                ⚠️ <strong>Regla Crítica:</strong> Si marca como <strong>BLOCKED</strong> las directivas críticas (No PII, No IP/RTSP, o Score Labeled as internal), el estado de Insights Status será Blocked de inmediato.
              </p>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin">
                {[
                  { key: "offlineSourceConfirmed", label: "Offline source confirmed", desc: "Validación de almacenamiento perimetral exclusivo." },
                  { key: "syntheticSeedLabeled", label: "Synthetic seed labeled", desc: "Leyenda informativa obligatoria de datos sintéticos simulados." },
                  { key: "noPiiInInsights", label: "No PII in insights", desc: "Exclusión total de identidades de clientes del reporte.", isCritical: true },
                  { key: "noIpRtspInInsights", label: "No IP/RTSP in insights", desc: "Nula presencia de credenciales, puertos o rutas stream en reporte.", isCritical: true },
                  { key: "noFeedbackTextExported", label: "No feedback text exported", desc: "No incluir campos de comentarios de operadores en reporte." },
                  { key: "safetyBlockersSummarized", label: "Safety blockers summarized only", desc: "Trazas de bloqueos limitadas a contadores y módulos abstractos." },
                  { key: "demoQualityScoreLabeled", label: "Demo Quality Score labeled as internal", desc: "Puntuación de preparación etiquetada como métrica no contractual.", isCritical: true },
                  { key: "sanitizedReportReady", label: "Sanitized report ready", desc: "Generador compilado con limitaciones de venta agregadas." },
                  { key: "resetAwarenessReady", label: "Reset awareness ready", desc: "Capacidad de purga inmediata de datos acumulados." },
                  { key: "readmeUpdated", label: "README updated", desc: "Documentación técnica del Módulo 5D alistada." },
                  { key: "versionRegistryUpdated", label: "Version Registry updated", desc: "Actualización de hito en VERSION_REGISTRY a v0.5.3." }
                ].map((item) => {
                  const currentStatus = qaChecklist[item.key as keyof typeof qaChecklist];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleChecklistItem(item.key as keyof typeof qaChecklist)}
                      className="p-2.5 bg-slate-950 border border-slate-850/60 hover:border-slate-800 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[11px] font-sans text-slate-200 uppercase tracking-wide">
                            {item.label}
                          </strong>
                          {item.isCritical && (
                            <span className="px-1 py-0.2 text-[7px] font-mono font-bold bg-rose-500/15 text-rose-400 rounded border border-rose-500/25">
                              CRÍTICO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>

                      <div className="shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          currentStatus === "Ready"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : currentStatus === "Needs Review"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {currentStatus === "Ready" ? "✓ READY" : currentStatus === "Needs Review" ? "⚠ REVIEW" : "❌ BLOCKED"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* OFFLINE SOURCE VERIFICATION DETAIL (Section 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Offline Source Verification (Verificación de Aislamiento de Red)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Garantías técnicas de la nula transmisión de datos fuera de la sesión local del navegador.</p>
            </div>

            {overallQAStatus === "Blocked" && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-rose-300 leading-normal">
                  <strong>Recomendación Correctora:</strong> Se han detectado frentes críticos de privacidad bloqueados. Asegure de inmediato que la telemetría permanezca 100% aislada en el navegador local, sin analytics de terceros ni cookies de rastreo, restaurando las marcas READY en el panel superior.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Fuente local confirmada", desc: "El origen de datos es estrictamente el almacén perimetral local (localStorage).", status: true },
                { title: "Sin cloud telemetry", desc: "No se registran llamadas API de red a nubes de terceros.", status: true },
                { title: "Sin analytics SDK externo", desc: "Inexistencia de scripts de telemetría de Google Analytics, Mixpanel, Firebase, etc.", status: true },
                { title: "Sin envío por red", desc: "Las métricas agregadas son calculadas por el procesador del cliente en vivo.", status: true },
                { title: "Sin cookies de terceros", desc: "El almacenamiento de la sesión no requiere ni escribe cookies de rastreo de terceros.", status: true },
                { title: "Sin tracking de usuario", desc: "No se registran datos biométricos, comportamentales ni de identidad.", status: true },
                { title: "Sin fingerprinting", desc: "No se recopilan firmas del navegador, resolución de pantalla ni del dispositivo.", status: true },
                { title: "Sin cámaras reales", desc: "Integración simulada basada en Dahua Lab, sin capturar flujos de video IP de clientes.", status: true },
                { title: "Sin datos personales", desc: "Estricto resguardo libre de PII (nombres, correos, RTSP, credenciales, teléfonos).", status: true }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1 hover:border-slate-800 transition-all">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <strong className="text-slate-200">{item.title}</strong>
                    <span className="text-emerald-400 font-bold uppercase">✓ CONFIRMADO</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* COMPILABLE REPORT GENERATOR PREVIEW BOX (Section 12) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-sans font-bold uppercase text-white tracking-wider">
                  Reporte de Insights Sanitizado (Markdown Compilador)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Minuta comercial lista para copiar en portapapeles sin contener datos reales.</p>
              </div>

              {overallQAStatus === "Blocked" ? (
                <span className="px-2.5 py-1 bg-rose-500/15 text-rose-400 text-xs font-mono font-bold rounded border border-rose-500/25">
                  BLOQUEADO POR PRIVACIDAD
                </span>
              ) : (
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-slate-950 hover:bg-emerald-600 rounded text-xs font-mono font-bold transition-all shadow-md uppercase"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Reporte</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {overallQAStatus === "Blocked" ? (
              <div className="p-4 bg-rose-950/20 border border-rose-500/35 rounded-xl flex items-start gap-3">
                <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="text-xs font-bold text-rose-300 uppercase">Copia Bloqueada por Control de Privacidad (QA Lock)</h4>
                  <p className="text-[11px] text-rose-400 leading-normal font-sans">
                    La copia del informe de insights ha sido desactivada instantáneamente debido a que se han identificado frentes críticos de privacidad marcados como <strong>BLOCKED</strong> en el checklist de control de privacidad de frentes locales (No PII, No IP/RTSP, o Score Labeled as internal). Restaure el estado de conformidad para poder volver a copiar el informe sanitizado de simulación didáctica.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto max-h-[400px] whitespace-pre scrollbar-thin">
                  {generateSanitizedReport()}
                </pre>
                <p className="text-[9px] text-slate-500 font-mono text-center italic">
                  * El reporte se compila dinámicamente cada vez que se ejecutan clics o se seleccionan audiencias en las maquetas de demostración locales.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
