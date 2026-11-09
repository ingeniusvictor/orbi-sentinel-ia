import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Check,
  Copy,
  Sliders,
  PlusCircle,
  Wrench,
  Server,
  Activity,
  Home,
  Briefcase,
  Play,
  Users,
  BookOpen,
  Info,
  Layers,
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  FileText,
  Trash2,
  RefreshCw,
  ExternalLink,
  LockKeyhole,
  CheckSquare,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { trackLocalEvent } from "../utils/telemetry";

interface CustomerPilotWorkspaceProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

// Local draft type
interface PilotDraft {
  id: string;
  date: string;
  pilotType: "field" | "community" | "consumer";
  siteAlias: string;
  status: string;
  modulesCount: number;
  risksCount: number;
  criteriaCount: number;
  nextStep: string;
}

export default function CustomerPilotWorkspace({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: CustomerPilotWorkspaceProps) {
  // If role is Conserje, block access
  const isConserje = userRole === "conserje";

  // State definitions
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [pilotType, setPilotType] = useState<"field" | "community" | "consumer">("field");
  const [siteAlias, setSiteAlias] = useState<string>("[SITIO SANITIZADO] Parque FV Demo Centro");
  const [siteType, setSiteType] = useState<string>("Planta Solar PMGD / Perímetro");
  const [genericRegion, setGenericRegion] = useState<string>("[REGIÓN GENÉRICA] Zona Central FV");
  const [approxCameras, setApproxCameras] = useState<number>(12);
  const [proposedCameras, setProposedCameras] = useState<number>(2);
  const [durationDays, setDurationDays] = useState<number>(10);
  const [observationObjective, setObservationObjective] = useState<string>("Validar conectividad del Gateway local y detección de intrusiones en cerco norte.");
  const [sanitizedNotes, setSanitizedNotes] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "livewall", "easyview", "incidentcenter", "diagnostics", "evidence", "gatewaylocal", "helpcenter"
  ]);
  const [showSuiteStatus, setShowSuiteStatus] = useState<boolean>(true);

  // Checklist status for critical safety items (Controls the state: Pilot Blocked if any fails)
  const [safetyChecklist, setSafetyChecklist] = useState({
    noCredentials: true,
    noIpRtsp: true,
    sanitizedDataOnly: true,
    externalAuthRequired: true,
    controlledPilot: true,
    noRealContracts: true,
    humanValidation: true,
    limitedScope: true,
    homePreserved: true
  });

  // Authorization Checklist (12 items)
  const [authChecklist, setAuthChecklist] = useState([
    { id: "auth_external", label: "Autorización de uso de cámaras gestionada externamente por canales autorizados", checked: true, critical: true },
    { id: "auth_scope_approved", label: "Alcance del piloto aprobado previamente por el representante legal del cliente", checked: true, critical: true },
    { id: "auth_no_private", label: "Salvaguarda de no utilización de datos privados o sensibles de terceros", checked: true, critical: true },
    { id: "auth_no_creds_stored", label: "Exclusión explícita de credenciales de acceso reales dentro del software", checked: true, critical: true },
    { id: "auth_window_coordination", label: "Ventanas de prueba temporal coordinadas externamente por escrito", checked: true, critical: false },
    { id: "auth_privacy_reviewed", label: "Análisis preliminar de privacidad residencial completado por O&M / Administración", checked: true, critical: false },
    { id: "auth_roles_defined", label: "Roles operativos del cliente definidos y acotados al software", checked: true, critical: false },
    { id: "auth_limits_communicated", label: "Limitaciones operacionales comunicadas transparentemente a los stakeholders", checked: true, critical: true },
    { id: "auth_limited_cameras", label: "Restricción de cámaras exclusivamente a las autorizadas para el piloto (máx 4)", checked: true, critical: true },
    { id: "auth_no_cloud", label: "Exclusión de almacenamiento en la nube de imágenes identificables", checked: true, critical: true },
    { id: "auth_no_scada_interference", label: "Confirmación de no interferencia con sistemas de control productivo (SCADA)", checked: true, critical: true },
    { id: "auth_ethics_briefed", label: "Suscripción verbal de guía ética de simulación por el Lead de la Demo", checked: true, critical: false }
  ]);

  // Hardware and Connectivity Readiness
  const [hardwareChecklist, setHardwareChecklist] = useState([
    { id: "hw_auth_id", label: "Cámara autorizada identificada de forma sanitizada (ej. [CÁMARA AUTORIZADA] Cam Perímetro 1)", checked: true },
    { id: "hw_external_access", label: "Acceso autorizado confirmado externamente (sin contraseñas almacenadas en la app)", checked: true },
    { id: "hw_known_protocol", label: "Protocolo de stream local (ONVIF/RTSP) pre-identificado de forma teórica", checked: true },
    { id: "hw_local_ping", label: "Conectividad local validable (Gateway -> Cámara) sin canales cloud", checked: true },
    { id: "hw_poe_feed", label: "Fuente PoE o alimentación eléctrica validada por responsable técnico del cliente", checked: true },
    { id: "hw_segmented_network", label: "Red local de prueba segmentada y aislada para evitar conflictos de TI", checked: true },
    { id: "hw_demo_recorder", label: "Grabación local de demo habilitada en modo simulado para experimentación", checked: true },
    { id: "hw_lab_gateway", label: "Gateway local de laboratorio disponible con firmware cerrado", checked: true },
    { id: "hw_compatibility_table", label: "Ficha de compatibilidad revisada para marcas registradas (Dahua, Hikvision, Bosch)", checked: true }
  ]);

  // Stakeholders (Generic notes only)
  const [stakeholderNotes, setStakeholderNotes] = useState<string>(
    "- Administrador del Recinto: Coordinador de Autorizaciones Externas\n- Encargado CCTV: Supervisor de Redes de Prueba\n- Proveedor CCTV: Soporte Físico de Cámaras\n- Supervisor O&M: Lector de Reportes Sanitizados\n- ORBI Demo Lead: Facilitador de Guías de Aprendizaje"
  );

  // Risks & Constraints (A to J suggested)
  const [risks, setRisks] = useState([
    { id: "risk1", title: "Compatibilidad de cámara no confirmada", impact: "Media", mitigation: "Utilizar protocolo estándar ONVIF y verificar marcas recomendadas", status: "Mitigado", responsible: "Proveedor CCTV" },
    { id: "risk2", title: "Acceso autorizado pendiente de firma", impact: "Alta", mitigation: "Suspender inicio de piloto hasta contar con el documento por canal externo", status: "En revisión", responsible: "Administrador del Recinto" },
    { id: "risk3", title: "Conectividad local de red inestable", impact: "Media", mitigation: "Validar estado de switches PoE de manera previa al inicio", status: "Abierto", responsible: "TI Cliente" },
    { id: "risk4", title: "Condiciones de baja iluminación nocturna", impact: "Baja", mitigation: "Habilitar iluminadores IR integrados o luz de apoyo externa", status: "Mitigado", responsible: "Encargado CCTV" },
    { id: "risk5", title: "Cámara mal ubicada o ángulo deficiente", impact: "Media", mitigation: "Reajustar físicamente el soporte de cámara antes del encuadre definitivo", status: "Mitigado", responsible: "Proveedor CCTV" },
    { id: "risk6", title: "Riesgo de privacidad residencial por vecindario", impact: "Alta", mitigation: "Aplicar enmascaramiento por polígonos (Privacy Shield) sobre zonas públicas", status: "Mitigado", responsible: "ORBI Demo Lead" },
    { id: "risk7", title: "Expectativas erróneas de producción real", impact: "Alta", mitigation: "Explicar claramente que el software opera bajo el candado Production-Locked", status: "Mitigado", responsible: "ORBI Demo Lead" },
    { id: "risk8", title: "Expectativas de detección de intrusiones perfecta", impact: "Media", mitigation: "Establecer que la IA es una herramienta de asistencia y apoyo al operador", status: "Mitigado", responsible: "ORBI Demo Lead" },
    { id: "risk9", title: "Alcance demasiado amplio (más de 4 cámaras)", impact: "Media", mitigation: "Re-acotar el piloto estrictamente a los 1-3 puntos críticos acordados", status: "Mitigado", responsible: "ORBI Demo Lead" },
    { id: "risk10", title: "Falta de responsable técnico local del cliente", impact: "Media", mitigation: "Asignar un contacto técnico de contraparte antes de conectar el hardware", status: "Abierto", responsible: "TI Cliente" }
  ]);

  // Success Criteria
  const [successCriteria, setSuccessCriteria] = useState([
    { id: "sc1", label: "Home premium se mantiene entendible y sin fatiga para el operador", checked: true },
    { id: "sc2", label: "El operador puede abrir el Live Wall y observar streams simulados", checked: true },
    { id: "sc3", label: "Incidentes sanitizados se despliegan correctamente en la bitácora local", checked: true },
    { id: "sc4", label: "El diagnóstico de red CCTV local es comprensible y didáctico", checked: true },
    { id: "sc5", label: "Se genera reporte sanitizado en formato Markdown para descarga local", checked: true },
    { id: "sc6", label: "Los límites del software simulado son comunicados y comprendidos", checked: true },
    { id: "sc7", label: "Se definen los próximos pasos comerciales y técnicos recomendados", checked: true },
    { id: "sc8", label: "Se recibe retroalimentación valiosa del piloto para validación humana", checked: true }
  ]);

  // Local draft history state
  const [draftHistory, setDraftHistory] = useState<PilotDraft[]>(() => {
    const saved = localStorage.getItem("ORBI_SENTINEL_LOCAL_PILOT_HISTORY");
    return saved ? JSON.parse(saved) : [];
  });

  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Dynamic Regex Scanner
  const scannerStatus = useMemo(() => {
    const textsToScan = [
      siteAlias,
      siteType,
      genericRegion,
      observationObjective,
      sanitizedNotes,
      stakeholderNotes,
      ...risks.map(r => r.title + r.mitigation + r.responsible)
    ].join(" ");

    const findings: string[] = [];

    // 1. Email check
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(textsToScan)) {
      findings.push("Correo electrónico real detectado (PII).");
    }

    // 2. Phone check
    const phoneRegex = /\+?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/;
    // Basic filter to avoid scanning short numbers like simple count indices
    const phoneMatches = textsToScan.match(/\+?[0-9]{8,15}/g);
    if (phoneMatches && phoneMatches.length > 0) {
      findings.push("Número telefónico potencialmente real detectado.");
    }

    // 3. IP check (excluding safe subnetworks or loops if desired, but we check generic format)
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    if (ipRegex.test(textsToScan)) {
      findings.push("Dirección IP física detectada (riesgo de seguridad local).");
    }

    // 4. RTSP check
    const rtspRegex = /rtsp:\/\//i;
    if (rtspRegex.test(textsToScan)) {
      findings.push("Protocolo RTSP explícito expuesto.");
    }

    // 5. Credentials / Passwords
    const credentialsRegex = /password|passwd|contraseña|contrasena|clave\s+\w+|token|secret|key/i;
    if (credentialsRegex.test(textsToScan)) {
      findings.push("Términos de credenciales o claves privadas ingresados.");
    }

    // 6. Coordinates
    const coordsRegex = /\b-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+\b/;
    if (coordsRegex.test(textsToScan)) {
      findings.push("Coordenadas geográficas exactas GPS detectadas.");
    }

    // 7. Legal/Contractual Absolute Claims
    const absoluteClaimsRegex = /garantizado|garantía|certificado|certificación|acreditación|producción lista|production-ready|infalible|reemplazo definitivo|cero fallas|cero falsas alarmas|detección perfecta|prevención total|uncompromised|full compliance|cumplimiento legal|retorno asegurado|ahorro garantizado|beneficio económico confirmado|ROI garantizado|15s|24\/7/i;
    if (absoluteClaimsRegex.test(textsToScan)) {
      findings.push("Terminología de garantía comercial, reclamación absoluta o certificación legal.");
    }

    // 8. Specific PII Names
    const piiNameRegex = /RUT|DNI|identidad|R.U.T./i;
    if (piiNameRegex.test(textsToScan)) {
      findings.push("Identificadores fiscales o personales (RUT/DNI) ingresados.");
    }

    return {
      clean: findings.length === 0,
      findings
    };
  }, [siteAlias, siteType, genericRegion, observationObjective, sanitizedNotes, stakeholderNotes, risks]);

  // Overall State Evaluation
  const overallState = useMemo(() => {
    // Check critical safety badges
    const criticalBadgesOk = safetyChecklist.noCredentials &&
                              safetyChecklist.noIpRtsp &&
                              safetyChecklist.sanitizedDataOnly &&
                              safetyChecklist.externalAuthRequired;

    // Check critical authorizations in checklist
    const criticalAuthsOk = authChecklist
      .filter(item => item.critical)
      .every(item => item.checked);

    if (!criticalBadgesOk || !criticalAuthsOk) {
      return "Pilot Blocked";
    }

    if (!safetyChecklist.homePreserved) {
      return "Needs Review";
    }

    if (!scannerStatus.clean) {
      return "Needs Sanitization";
    }

    // If everything is completely checked
    const allAuthOk = authChecklist.every(item => item.checked);
    const allHwOk = hardwareChecklist.every(item => item.checked);
    const allSafetyBadgesOk = Object.values(safetyChecklist).every(v => v);

    if (allAuthOk && allHwOk && allSafetyBadgesOk && siteAlias && observationObjective) {
      return "Pilot Workspace Ready";
    }

    return "Needs Review";
  }, [safetyChecklist, authChecklist, hardwareChecklist, scannerStatus, siteAlias, observationObjective]);

  // Pilot Type Metadata mapping
  const pilotTypeData = {
    field: {
      title: "Field / Solar O&M",
      objective: "Preparación de pilotos técnicos para plantas fotovoltaicas, subestaciones eléctricas, faenas mineras o recintos de alta exigencia perimetral.",
      scope: "Uso acotado de 1 a 3 cámaras perimetrales autorizadas, integrando simuladores locales de telemetría PoE pasiva y enmascaramiento dinámico.",
      duration: "7 a 15 días corridos bajo supervisión directa.",
      cameras: "Cámaras fijas térmicas o IR para cerco perimetral exterior.",
      restrictions: "No apto para conexión directa con sistemas SCADA productivos, ni comandos de apertura remota, ni reemplazo de guardias de seguridad físicos.",
      roles: "Supervisor O&M, Ingeniero de Terreno, Representante Técnico de Clientes, Administrador.",
      risks: "Inestabilidad de enlaces de radiofrecuencia (WiFi/Ubiquiti) de contraparte, obstrucción física del campo visual.",
      nextStep: "Completar validación física y programar reunión de presentación de resultados con stakeholders autorizados."
    },
    community: {
      title: "Community / Condominium",
      objective: "Adecuación de pilotos controlados para condominios cerrados, edificios habitacionales o garitas de control residencial.",
      scope: "Focalizado en Modo Conserje (interfaz simplificada de 4 botones), activando las políticas del Privacy Shield residencial de ORBI.",
      duration: "7 a 15 días con capacitación previa del personal de turno.",
      cameras: "Cámaras de acceso vehicular y peatonal exterior, evitando captar áreas privadas residenciales.",
      restrictions: "Estrictamente prohibido captar ventanas, patios traseros o almacenar identidades de menores. No reemplaza los sistemas NVR o grabadores CCTV de base del condominio.",
      roles: "Conserje de Turno, Administrador del Edificio, Comité de Copropietarios.",
      risks: "Fatiga cognitiva del operador, falsas alarmas debidas a sombras de follaje o reflejos lumínicos.",
      nextStep: "Iniciar simulación en Modo Conserje y revisar bitácora local sanitizada al final del turno."
    },
    consumer: {
      title: "Consumer Lab",
      objective: "Laboratorio cerrado de integración parcial para cámaras inteligentes de uso comercial masivo o residencial ligero.",
      scope: "Pruebas locales controladas mediante protocolos estándar sin dependencias de servicios cloud externos del fabricante.",
      duration: "3 a 5 días de pruebas de viabilidad técnica local.",
      cameras: "Cámaras inteligentes domésticas (Dahua Consumer, Eufy, Imou o similares) autorizadas expresamente.",
      restrictions: "Sin prometer compatibilidad universal incondicional con cualquier dispositivo. No apto para almacenamiento público o retransmisión no encriptada.",
      roles: "Técnico de Terreno, Propietario Autorizado, Desarrollador.",
      risks: "Incompatibilidad de firmware según versión, pérdida eventual de conectividad por servidores cloud del fabricante.",
      nextStep: "Configurar el puente local de laboratorio y verificar la sanitización del stream en la pantalla de diagnóstico."
    }
  };

  // Generate copyable Markdown report
  const summaryReport = useMemo(() => {
    const selectedModulesText = selectedModules.map(m => `- ${m.toUpperCase()}`).join("\n");
    const activeBadgesText = Object.entries(safetyChecklist)
      .filter(([_, v]) => v)
      .map(([k]) => `- ${k.toUpperCase()}`)
      .join("\n");

    return `===========================================================
ORBI SENTINEL IA — CUSTOMER PILOT WORKSPACE REPORT
===========================================================
ID de Documento: CPW-${Date.now().toString().slice(-6)}
Fecha de Emisión: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.14.3-sentinel-customer-pilot-simulator-lock
Estado Interno del Piloto: ${overallState.toUpperCase()}
Tipo de Piloto: ${pilotTypeData[pilotType].title}

-----------------------------------------------------------
1. PERFIL DEL RECO_SITIO (SANITIZADO)
-----------------------------------------------------------
Alias de Sitio: ${siteAlias || "[SITIO SANITIZADO]"}
Tipo de Recinto: ${siteType || "[TIPO SANITIZADO]"}
Región Genérica: ${genericRegion || "[REGIONAL SANITIZADO]"}
Cámaras Aproximadas: ${approxCameras} unidades
Cámaras Propuestas para Piloto: ${proposedCameras} unidades
Duración Planificada: ${durationDays} días corridos
Objetivo General: ${observationObjective || "[OBJETIVO SANITIZADO]"}
Notas Adicionales: ${sanitizedNotes || "[SIN NOTAS ADICIONALES]"}

-----------------------------------------------------------
2. STAKEHOLDERS & ROLES AUTORIZADOS
-----------------------------------------------------------
Los contactos reales se gestionan de manera externa fuera del software.
Roles asignados para la validación interna:
${stakeholderNotes}

-----------------------------------------------------------
3. ALCANCE Y MÓDULOS DE DEMO SELECCIONADOS
-----------------------------------------------------------
${selectedModulesText}

-----------------------------------------------------------
4. DECLARACIÓN DE SEGURIDAD Y PRIVACIDAD (BADGES ACTIVOS)
-----------------------------------------------------------
${activeBadgesText}

Aviso Legal de Privacidad:
Este reporte es un documento de trabajo interno y orientativo. No representa aprobación contractual, autorización de despliegue en producción real, validación legal, certificación pericial ni peritaje forense oficial. El piloto controlado operará exclusivamente con datos de simulación sanitizados.

-----------------------------------------------------------
5. MATRIZ DE RIESGOS Y MITIGACIÓN (CAPACIDAD OPERATIVA)
-----------------------------------------------------------
${risks.map(r => `- ${r.title.toUpperCase()}:
  * Impacto: ${r.impact}
  * Mitigación: ${r.mitigation}
  * Estado de Gestión: ${r.status}
  * Responsable: ${r.responsible}`).join("\n\n")}

-----------------------------------------------------------
6. CRITERIOS DE ÉXITO ESTABLECIDOS (VALIDACIÓN HUMANA)
-----------------------------------------------------------
${successCriteria.filter(sc => sc.checked).map(sc => `- [Aceptado] ${sc.label}`).join("\n")}

-----------------------------------------------------------
7. PLAN DE TRABAJO CRONOLÓGICO SUGERIDO
-----------------------------------------------------------
- Día 0: Preparación interna del alcance sanitizado y check de seguridad.
- Día 1: Revisión y suscripción del alcance con cliente/proveedor por canal externo.
- Día 2-3: Despliegue de gateway local de laboratorio y streams de simulación.
- Día 4-10: Monitoreo operativo, aplicación de Privacy Shield y validaciones.
- Día 11-15: Reunión técnica de evaluación final y generación de reporte de cierre.

===========================================================
COMPROMISO DE NO EXPOSICIÓN DE CREDENCIALES O DATOS REALES
ORBI-SENTINEL-CUSTOMER-PILOT-WORKSPACE-v0.14.3-sentinel-customer-pilot-simulator-lock
===========================================================`;
  }, [pilotType, siteAlias, siteType, genericRegion, approxCameras, proposedCameras, durationDays, observationObjective, sanitizedNotes, selectedModules, safetyChecklist, stakeholderNotes, risks, successCriteria, overallState]);

  // Actions
  const handleSaveDraft = () => {
    if (!scannerStatus.clean) {
      trackLocalEvent("blocked.event.rejected", { findings: scannerStatus.findings.length });
      alert("Error: No se puede guardar el borrador. El scanner local ha detectado datos potencialmente sensibles (emails, IPs, RTSP, credenciales o reclamos absolutos). Por favor, sanitice los campos de texto.");
      return;
    }

    const newDraft: PilotDraft = {
      id: "draft-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      pilotType,
      siteAlias,
      status: overallState,
      modulesCount: selectedModules.length,
      risksCount: risks.length,
      criteriaCount: successCriteria.filter(sc => sc.checked).length,
      nextStep: pilotTypeData[pilotType].nextStep
    };

    const updated = [newDraft, ...draftHistory.slice(0, 19)];
    setDraftHistory(updated);
    localStorage.setItem("ORBI_SENTINEL_LOCAL_PILOT_HISTORY", JSON.stringify(updated));
    onAddAuditLog("Guardar Borrador Piloto", `Guardado borrador de piloto para ${siteAlias} (${pilotType})`);
    trackLocalEvent("export.sanitized.generated", { type: pilotType, state: overallState, category: "pilot_draft" });
    alert("Borrador de preparación de piloto guardado exitosamente de forma local.");
  };

  const handleClearHistory = () => {
    if (confirm("¿Está seguro de que desea eliminar todo el historial local de borradores de pilotos? Esta acción no se puede deshacer.")) {
      setDraftHistory([]);
      localStorage.removeItem("ORBI_SENTINEL_LOCAL_PILOT_HISTORY");
      onAddAuditLog("Borrar Historial Pilotos", "Historial de borradores locales purgado de localStorage.");
      trackLocalEvent("data.reset.executed", { scope: "pilot_history" });
    }
  };

  const handleCopyToClipboard = () => {
    if (overallState === "Pilot Blocked") {
      alert("Operación bloqueada: El piloto se encuentra en estado PILOT BLOCKED debido a la falta de badges de seguridad críticos o autorizaciones fundamentales.");
      return;
    }
    if (overallState === "Needs Sanitization") {
      alert("Operación bloqueada: El reporte contiene datos de seguridad no sanitizados. Por favor, elimine IPs, RTSP, emails o credenciales antes de exportar.");
      return;
    }

    navigator.clipboard.writeText(summaryReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
    onAddAuditLog("Exportar Reporte Piloto", `Reporte de Customer Pilot Workspace copiado al portapapeles para ${siteAlias}`);
    trackLocalEvent("proposal.report.copied", { type: pilotType, state: overallState });
  };

  // Toggle checklist item
  const toggleSafetyBadge = (key: keyof typeof safetyChecklist) => {
    setSafetyChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      trackLocalEvent(updated[key] ? "checklist.item.ready" : "checklist.item.blocked", { key, value: updated[key] });
      return updated;
    });
  };

  const toggleAuthChecklistItem = (id: string) => {
    setAuthChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
    trackLocalEvent("checklist.item.ready", { id, category: "auth_checklist" });
  };

  const toggleHwChecklistItem = (id: string) => {
    setHardwareChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
    trackLocalEvent("checklist.item.ready", { id, category: "hardware_checklist" });
  };

  const toggleSuccessCriteriaItem = (id: string) => {
    setSuccessCriteria(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleModuleSelection = (modId: string) => {
    setSelectedModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  // Switch role inside workspace to simulate Admin vs Técnico
  // Technically if Conserje tries to load it, we block.
  if (isConserje) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">🔒 Acceso Restringido</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Esta sección corresponde a la preparación de pilotos, levantamiento de requisitos de hardware, mitigación de riesgos y handoffs técnicos. Está disponible únicamente para perfiles autorizados (**Administradores y Técnicos de Terreno**).
          </p>
          {setCurrentTab && (
            <button
              onClick={() => setCurrentTab("easyview")}
              className="mt-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold transition-all border border-slate-700"
            >
              Ir a Modo Conserje
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* 1. Header with dynamic title */}
      <div className="border-b border-slate-900 bg-slate-950 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 block">
                Módulo 14A — Planificación de Demostración
              </span>
              <h2 className="text-lg font-sans font-black text-white uppercase tracking-tight">
                Customer Pilot Workspace
              </h2>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Preparación, mitigación de riesgos y diseño de pilotos locales sanitizados sin exponer datos reales de producción.
          </p>
        </div>

        {/* Quick status board and Copy Report */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block font-bold">Estado del Piloto</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                overallState === "Pilot Blocked" ? "bg-rose-500 animate-pulse" :
                overallState === "Needs Sanitization" ? "bg-amber-500 animate-pulse" :
                overallState === "Pilot Workspace Ready" ? "bg-emerald-500 animate-pulse" :
                "bg-indigo-400 animate-pulse"
              }`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                overallState === "Pilot Blocked" ? "text-rose-400" :
                overallState === "Needs Sanitization" ? "text-amber-400" :
                overallState === "Pilot Workspace Ready" ? "text-emerald-400" :
                "text-indigo-300"
              }`}>
                {overallState === "Pilot Blocked" ? "Pilot Blocked" :
                 overallState === "Needs Sanitization" ? "Needs Sanitization" :
                 overallState === "Pilot Workspace Ready" ? "Pilot Workspace Ready" :
                 "Needs Review"}
              </span>
            </div>
          </div>

          {setCurrentTab && (
            <button
              onClick={() => {
                setCurrentTab("customerpilotsimulator");
                onAddAuditLog("Navegación a Simulador desde Workspace", "Operador ingresó al Customer Pilot Simulator.");
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Simular Piloto</span>
            </button>
          )}

          {setCurrentTab && (
            <button
              onClick={() => {
                setCurrentTab("pilotoutcomereview");
                onAddAuditLog("Navegación a Outcome Review desde Workspace", "Operador ingresó al Pilot Outcome Review Center.");
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Revisar Resultados Sanitizados</span>
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <FolderPlusIcon className="w-3.5 h-3.5" />
            <span>Guardar Borrador</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            disabled={overallState === "Pilot Blocked" || overallState === "Needs Sanitization"}
            className={`px-4 py-2 text-xs font-bold rounded-xl font-mono flex items-center gap-2 transition-all ${
              overallState === "Pilot Blocked" || overallState === "Needs Sanitization"
                ? "bg-slate-900 border border-slate-800/60 text-slate-600 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-950/20"
            }`}
          >
            {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? "Copiado!" : "Exportar Reporte"}</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Safety & Sanitization Banner */}
      <div className="bg-slate-900 border-b border-slate-850/60 px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">Workspace de piloto controlado — use solo datos sanitizados</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Las autorizaciones formales, credenciales, flujos RTSP/IP reales, contratos legales y documentos sensibles deben gestionarse **únicamente fuera de la demo por canales corporativos autorizados**. Esta herramienta pre-configura el piloto con datos conceptuales simulados.
            </p>
          </div>

          {/* Interactive Badges Grid */}
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {[
              { id: "controlledPilot", label: "Controlled Pilot", icon: Shield },
              { id: "sanitizedDataOnly", label: "Sanitized Data Only", icon: ShieldCheck },
              { id: "noCredentials", label: "No Credentials", icon: Lock },
              { id: "noIpRtsp", label: "No IP/RTSP", icon: LockKeyhole },
              { id: "noRealContracts", label: "No Real Contracts", icon: FileText },
              { id: "humanValidation", label: "Human Validation", icon: Users },
              { id: "limitedScope", label: "Limited Scope", icon: Sliders },
              { id: "externalAuthRequired", label: "External Auth Required", icon: AlertTriangle },
              { id: "homePreserved", label: "Home Preserved", icon: Home }
            ].map((badge) => {
              const active = safetyChecklist[badge.id as keyof typeof safetyChecklist];
              const BadgeIcon = badge.icon;
              return (
                <button
                  key={badge.id}
                  onClick={() => toggleSafetyBadge(badge.id as keyof typeof safetyChecklist)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                  }`}
                  title={active ? `Badge ${badge.label} activo (Correcto)` : `Badge ${badge.label} desactivado (Riesgo)`}
                >
                  <BadgeIcon className="w-3 h-3" />
                  <span>{badge.label}</span>
                  <span className="text-[8px] opacity-70">({active ? "✔" : "✗"})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* QA Lock state representation panels */}
      {overallState === "Pilot Blocked" && (
        <div className="bg-rose-500/15 border-b border-rose-500/20 px-8 py-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-400 uppercase tracking-wider block text-[10px]">CUSTOMER PILOT WORKSPACE QA LOCK: PILOT BLOCKED</span>
              <span className="bg-rose-500/20 text-rose-400 text-[8px] font-mono font-black px-1.5 py-0.5 rounded border border-rose-500/30">LOCKED BLOCKED</span>
            </div>
            <p className="text-slate-300 leading-normal font-sans">
              La planificación del piloto ha sido bloqueada debido a la falta de salvaguardas de privacidad obligatorias o la omisión de autorizaciones críticas. La exportación o copiado de reportes de este espacio de trabajo está restringida hasta resolver las siguientes acciones correctivas:
            </p>
            <div className="space-y-1 mt-2">
              <span className="font-mono font-bold text-[10px] text-rose-300 block uppercase">Acciones Correctivas Requeridas para Desbloquear:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-350 font-sans">
                {!safetyChecklist.noCredentials && (
                  <li><strong>Habilitar 'No Credentials':</strong> Vuelva a activar la exclusión explícita de credenciales de acceso reales. No pida ni guarde usuarios ni contraseñas.</li>
                )}
                {!safetyChecklist.noIpRtsp && (
                  <li><strong>Habilitar 'No IP/RTSP':</strong> Reactive el resguardo de no direcciones IP reales o flujos RTSP directos para no exponer topologías internas de red.</li>
                )}
                {!safetyChecklist.sanitizedDataOnly && (
                  <li><strong>Habilitar 'Sanitized Data Only':</strong> Comprométase con el uso exclusivo de datos sanitizados libres de PII para la preparación de pilotos comerciales.</li>
                )}
                {!safetyChecklist.externalAuthRequired && (
                  <li><strong>Habilitar 'External Auth Required':</strong> Confirme que toda autorización de uso de cámaras se gestiona externamente antes de desplegar el piloto.</li>
                )}
                {authChecklist.filter(item => item.critical && !item.checked).map(item => (
                  <li key={item.id}><strong>Aprobar Autorización Crítica:</strong> Debe confirmar la autorización "{item.label}" en la sección de Authorization Checklist.</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {overallState === "Needs Review" && (
        <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-8 py-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">CUSTOMER PILOT WORKSPACE QA LOCK: NEEDS REVIEW</span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-mono font-black px-1.5 py-0.5 rounded border border-indigo-500/30">DRAFT STATE</span>
            </div>
            <p className="text-slate-300 leading-normal font-sans">
              El estado actual de planificación se encuentra en revisión interna (draft). Para lograr el estado final de aprobación segura <strong>(CUSTOMER PILOT WORKSPACE LOCKED)</strong>, complete todos los checks de conectividad física, active la totalidad de las salvaguardas (incluyendo <strong>Home Preserved</strong> que valida que el Home premium no haya sido alterado) y asegúrese de que el perfil del sitio tenga alias de sitio y objetivos claros.
            </p>
          </div>
        </div>
      )}

      {overallState === "Pilot Workspace Ready" && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">CUSTOMER PILOT WORKSPACE QA LOCK: PILOT WORKSPACE READY</span>
              <span className="bg-emerald-500 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest">CUSTOMER PILOT WORKSPACE LOCKED</span>
            </div>
            <p className="text-slate-300 leading-normal font-sans">
              La planificación del piloto controlado ha completado satisfactoriamente todas las pruebas de seguridad del escáner local en caliente, cuenta con las 12 autorizaciones externas y el hardware de simulación verificado. El espacio de trabajo se declara formalmente como **CUSTOMER PILOT WORKSPACE LOCKED (Aceptado y Protegido)** para su uso seguro con clientes.
            </p>
          </div>
        </div>
      )}

      {/* 3. Realtime Scanner Banner if issues found */}
      {!scannerStatus.clean && (
        <div className="bg-amber-500/15 border-b border-amber-500/20 px-8 py-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-400 uppercase tracking-tight block">⚠️ ESCÁNER LOCAL REACCIONANDO — DATOS NO SANITIZADOS DETECTADOS</span>
            <p className="text-slate-300 leading-normal">
              Se han detectado campos con formatos sospechosos de contener información real que infringe las políticas de privacidad cerrada. **El copiado del reporte está suspendido temporalmente hasta sanitizar los siguientes puntos:**
            </p>
            <ul className="list-disc pl-4 mt-1.5 space-y-0.5 text-slate-300 font-mono text-[10px]">
              {scannerStatus.findings.map((f, i) => (
                <li key={i} className="text-amber-300">{f}</li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Sugerencia: Use comodines sanitizados como "[CLIENTE SANITIZADO]", "[CÁMARA AUTORIZADA]" o remueva las direcciones IP o contraseñas ingresadas.
            </p>
          </div>
        </div>
      )}

      {/* 4. Main Body with Navigation Sidebar on left, forms on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Tabs List */}
        <div className="w-72 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0 select-none">
          <div className="p-4 border-b border-slate-900 bg-slate-950/40">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Planificación de Pilotos</span>
            <span className="text-[11px] text-slate-350 block mt-0.5">Secciones del Workspace</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {[
              { id: "overview", label: "A. Pilot Overview", desc: "Objetivos y estado del piloto", icon: Info },
              { id: "profile", label: "B. Sanitized Site Profile", desc: "Datos técnicos del sitio", icon: MapPin },
              { id: "stakeholders", label: "C. Stakeholders & Roles", desc: "Responsables y roles de contraparte", icon: Users },
              { id: "scope", label: "D. Scope Builder", desc: "Módulos y cámaras acotadas", icon: Sliders },
              { id: "readiness", label: "E. Hardware & Conectividad", desc: "Readiness checklist de red", icon: Server },
              { id: "auth", label: "F. Authorization Checklist", desc: "12 factores de autorización externos", icon: ShieldCheck },
              { id: "privacy", label: "G. Privacy & Data Boundaries", desc: "Restricciones de PII y vecindario", icon: LockKeyhole },
              { id: "risks", label: "H. Risks & Constraints", desc: "Mitigación de riesgos operativos", icon: AlertTriangle },
              { id: "success", label: "I. Criterios de Éxito", desc: "Métricas de validación humana", icon: CheckSquare },
              { id: "timeline", label: "J. Pilot Timeline", desc: "Plan de trabajo sugerido (15 días)", icon: Calendar },
              { id: "handoff", label: "K. Handoff Pack & Integración", desc: "Sincronización con otros centros", icon: Layers },
              { id: "report", label: "L. Pilot Summary Report", desc: "Vista y exportación del reporte final", icon: FileText }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    trackLocalEvent("screen.navigation.clicked", { targetTab: tab.id });
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                    active
                      ? "bg-indigo-500/10 border-indigo-500/20 text-white"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 mt-0.5 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                  <div>
                    <span className="text-xs font-bold block">{tab.label}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Draft History List */}
          <div className="p-3 border-t border-slate-900 bg-slate-950/20 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Borradores Locales ({draftHistory.length})</span>
              {draftHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[9px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 transition-colors uppercase"
                  title="Purga local de borradores"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Borrar</span>
                </button>
              )}
            </div>

            {draftHistory.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                No hay borradores guardados de forma local en el navegador.
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1.5 font-sans">
                {draftHistory.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-1.5 bg-slate-900/60 border border-slate-850 rounded-lg text-[10px] flex justify-between items-start"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-300 block truncate max-w-[150px]">{draft.siteAlias}</span>
                      <span className="text-slate-500 font-mono block text-[9px]">{draft.date} &bull; {draft.pilotType.toUpperCase()}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1 py-0.5 bg-indigo-500/10 text-indigo-300 rounded uppercase">
                      {draft.status === "Ready for Controlled Pilot" ? "Ready" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Panel (Form Fields and Checklists) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20 font-sans space-y-6">

          {/* SECTION A: PILOT OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">A. Pilot Overview & Tipo de Piloto</h3>
                <p className="text-xs text-slate-400">
                  Seleccione el entorno del piloto y configure los parámetros generales orientativos de la demostración.
                </p>
              </div>

              {/* BLOQUE 14 — CUSTOMER PILOT SUITE STATUS PANEL */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        BLOQUE 14 — CUSTOMER PILOT SUITE
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 block mt-0.5">
                        Estado: POST-14D ACCEPTED / CUSTOMER PILOT SUITE READY
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSuiteStatus(!showSuiteStatus)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-700 transition-all"
                  >
                    {showSuiteStatus ? "OCULTAR DETALLE 🗖" : "VER DETALLE 🗖"}
                  </button>
                </div>

                {showSuiteStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 pt-1 text-[11px] font-mono">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Customer Pilot Workspace: <span className="text-emerald-400 font-bold">Locked</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Workspace QA: <span className="text-emerald-400 font-bold">Accepted</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Customer Pilot Simulator: <span className="text-emerald-400 font-bold">Locked</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Synthetic Scenario Lab: <span className="text-emerald-400 font-bold">Accepted</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Pilot Scanner: <span className="text-emerald-400 font-bold">Active</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Simulator Scanner: <span className="text-emerald-400 font-bold">Active</span></span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>RBAC System: <span className="text-emerald-400 font-bold">Active</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Home Premium: <span className="text-emerald-400 font-bold">Preserved</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Sanitized Reports: <span className="text-emerald-400 font-bold">Active</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Local Draft History: <span className="text-emerald-400 font-bold">Purgeable</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Local Simulation History: <span className="text-emerald-400 font-bold">Purgeable</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>External Authorization: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>No Credentials Allowed: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>No IP/RTSP Allowed: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>No Real Contracts: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>No Real Customers: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Controlled Pilot: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Synthetic Pilot: <span className="text-emerald-400 font-bold">Confirmed</span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pilot Type Cards Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "field", title: "Field / Solar O&M", icon: Server, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                  { id: "community", title: "Community / Condominium", icon: Home, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
                  { id: "consumer", title: "Consumer Lab", icon: Users, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" }
                ].map((pt) => {
                  const typeSelected = pilotType === pt.id;
                  const TypeIcon = pt.icon;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => {
                        setPilotType(pt.id as "field" | "community" | "consumer");
                        // Reset defaults based on selection
                        if (pt.id === "field") {
                          setSiteAlias("[SITIO SANITIZADO] Parque FV Demo Centro");
                          setSiteType("Planta Solar PMGD / Perímetro");
                          setGenericRegion("[REGIÓN GENÉRICA] Zona Central FV");
                          setObservationObjective("Validar conectividad del Gateway local y detección de intrusiones en cerco norte.");
                        } else if (pt.id === "community") {
                          setSiteAlias("[SITIO SANITIZADO] Edificio Mirador Cordillera");
                          setSiteType("Comunidad Habitacional / Conserjería");
                          setGenericRegion("[REGIÓN GENÉRICA] Zona Oriente Urbana");
                          setObservationObjective("Validar operación en Modo Conserje, control de accesos y aplicación del Privacy Shield.");
                        } else {
                          setSiteAlias("[SITIO SANITIZADO] Casa Piloto Residencial");
                          setSiteType("Smart Home / Pruebas Cerradas");
                          setGenericRegion("[REGIÓN GENÉRICA] Laboratorio Interno");
                          setObservationObjective("Prueba controlada de compatibilidad local ONVIF de cámara consumer sin servicios en la nube.");
                        }
                        const eventName = pt.id === "field" ? "line.selected.field" : pt.id === "community" ? "line.selected.community" : "line.selected.consumer";
                        trackLocalEvent(eventName, { tab: "customerpilotworkspace", type: pt.id });
                      }}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        typeSelected
                          ? "ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-500/30 text-white"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <TypeIcon className={`w-6 h-6 mb-2 ${typeSelected ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-xs font-bold block uppercase tracking-wider">{pt.title}</span>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1">
                        {pilotTypeData[pt.id as "field" | "community" | "consumer"].title} template.
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Pilot Type Metadata Card */}
              <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Detalles de Operación para {pilotTypeData[pilotType].title}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Objetivo de la simulación:</span>
                    <p className="text-slate-200 leading-relaxed font-sans">{pilotTypeData[pilotType].objective}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Alcance Sugerido de Laboratorio:</span>
                    <p className="text-slate-200 leading-relaxed font-sans">{pilotTypeData[pilotType].scope}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Duración Recomendada:</span>
                    <p className="text-slate-200 font-mono font-bold">{pilotTypeData[pilotType].duration}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Cámaras Permitidas en Demo:</span>
                    <p className="text-slate-200 font-sans">{pilotTypeData[pilotType].cameras}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-rose-500 uppercase block font-bold">🚫 Restricciones Críticas de Seguridad:</span>
                    <p className="text-rose-300 leading-relaxed font-sans">{pilotTypeData[pilotType].restrictions}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-indigo-400 block font-bold uppercase">➡️ Próximo Paso Recomendado:</span>
                    <p className="text-indigo-300 font-sans">{pilotTypeData[pilotType].nextStep}</p>
                  </div>
                </div>
              </div>

              {/* Compliance Warning Badge */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">Aviso de Validación de Transparencia</span>
                  <p className="text-slate-400 leading-relaxed">
                    “Este estado de preparación de pilotos es estrictamente interno y orientativo. No representa aprobación contractual, autorización de despliegue, validación legal ni validación de producción real por canales autorizados.”
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION B: SANITIZED SITE PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">B. Sanitized Site Profile</h3>
                <p className="text-xs text-slate-400">
                  Describa las características del recinto utilizando únicamente marcadores de posición sanitizados. No exponga nombres de clientes reales, RUTs, direcciones físicas ni coordenadas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Alias de Sitio (Sanitizado):</label>
                  <input
                    type="text"
                    value={siteAlias}
                    onChange={(e) => setSiteAlias(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                    placeholder="Ej: [SITIO SANITIZADO] Planta FV Demo Centro"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Tipo de Recinto / Operación:</label>
                  <input
                    type="text"
                    value={siteType}
                    onChange={(e) => setSiteType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="Ej: Planta Solar PMGD / Perímetro"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Región Genérica:</label>
                  <input
                    type="text"
                    value={genericRegion}
                    onChange={(e) => setGenericRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                    placeholder="Ej: [REGIÓN GENÉRICA] Zona Central FV"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Cámaras Est.:</label>
                    <input
                      type="number"
                      value={approxCameras}
                      onChange={(e) => setApproxCameras(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Para Piloto:</label>
                    <input
                      type="number"
                      value={proposedCameras}
                      onChange={(e) => setProposedCameras(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Días Piloto:</label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Objetivo General de Observación:</label>
                <textarea
                  value={observationObjective}
                  onChange={(e) => setObservationObjective(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ej: Validar conectividad del Gateway de prueba y enmascaramiento dinámico facial..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Notas Adicionales de Sanitización (Evite nombres o IPs reales):</label>
                <textarea
                  value={sanitizedNotes}
                  onChange={(e) => setSanitizedNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="Ej: [CÁMARA AUTORIZADA] instalada en el portón perimetral. El gateway local operará en sub-stream secundario."
                />
              </div>

              {/* Secure placeholders reminder */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-white block">Sugerencia de marcadores recomendados:</span>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-1 bg-slate-850 rounded text-slate-300 border border-slate-800">[SITIO SANITIZADO]</span>
                  <span className="px-2 py-1 bg-slate-850 rounded text-slate-300 border border-slate-800">[CLIENTE SANITIZADO]</span>
                  <span className="px-2 py-1 bg-slate-850 rounded text-slate-300 border border-slate-800">[REGIÓN GENÉRICA]</span>
                  <span className="px-2 py-1 bg-slate-850 rounded text-slate-300 border border-slate-800">[CÁMARA AUTORIZADA]</span>
                  <span className="px-2 py-1 bg-slate-850 rounded text-slate-300 border border-slate-800">[CONTACTO GESTIONADO EXTERNAMENTE]</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: STAKEHOLDERS & ROLES */}
          {activeTab === "stakeholders" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">C. Stakeholders & Roles</h3>
                <p className="text-xs text-slate-400">
                  Defina los roles de contraparte involucrados en la validación técnica del piloto comercial.
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                ⚠️ **Exclusión Obligatoria de Datos de Contacto (PII):** Los contactos de personas reales, correos electrónicos corporativos, cargos con nombre propio y números telefónicos deben resguardarse y gestionarse **fuera de la demo por canales corporativos tradicionales**. Registre únicamente la descripción genérica de responsabilidades.
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Definición de Roles Genéricos del Piloto:</label>
                <textarea
                  value={stakeholderNotes}
                  onChange={(e) => setStakeholderNotes(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="Defina las responsabilidades genéricas..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Roles Genéricos Soportados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Administrador", "Encargado CCTV", "Proveedor CCTV", "Supervisor O&M", "Conserjería", "TI Cliente", "Seguridad"].map(role => (
                      <span key={role} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] border border-slate-700">{role}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Próximo paso de contraparte:</span>
                  <p className="text-slate-400">
                    Se debe asignar un representante técnico (TI Cliente) que valide externamente el direccionamiento IP de prueba antes de la conexión física del Gateway.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: SCOPE BUILDER */}
          {activeTab === "scope" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">D. Scope Builder (Alcance del Piloto)</h3>
                <p className="text-xs text-slate-400">
                  Seleccione los módulos operativos de ORBI Sentinel IA que formarán parte de la simulación de demostración de piloto comercial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: "livewall", label: "Live Wall", desc: "Muro de video continuo" },
                  { id: "easyview", label: "Modo Conserje", desc: "Operación de baja fatiga" },
                  { id: "incidentcenter", label: "Incidentes", desc: "Bitácora local de eventos" },
                  { id: "diagnostics", label: "Diagnóstico CCTV", desc: "Diagnóstico de salud de red" },
                  { id: "evidence", label: "Evidencia y Reportes", desc: "Generación de informes" },
                  { id: "gatewaylocal", label: "Cámaras y Gateway", desc: "Hardware virtual local" },
                  { id: "pilotintake", label: "Pilot Intake", desc: "Formularios de ingreso" },
                  { id: "pilothandoff", label: "Pilot Handoff", desc: "Minuta de traspaso de pilotos" },
                  { id: "privacy", label: "Privacy Shield", desc: "Mecanismo de privacidad" },
                  { id: "helpcenter", label: "Help Center", desc: "Centro de ayuda por rol" },
                  { id: "presenter", label: "Presenter Mode", desc: "Recorridos comerciales" },
                  { id: "practice", label: "Practice Mode", desc: "Laboratorio de prácticas" }
                ].map((mod) => {
                  const selected = selectedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModuleSelection(mod.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold block">{mod.label}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selected ? "border-indigo-400 bg-indigo-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-1">{mod.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scope Warnings */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-rose-400">🚫 Elementos estrictamente excluidos de la demostración:</span>
                <p className="text-slate-450 leading-relaxed">
                  No se incluye bajo ninguna circunstancia: interferencia con automatización de planta o relés SCADA, control de tableros eléctricos, configuración de contraseñas de red corporativa del cliente, ni cámaras residenciales internas o de espacios de descanso.
                </p>
              </div>
            </div>
          )}

          {/* SECTION E: HARDWARE & CONNECTIVITY READINESS */}
          {activeTab === "readiness" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">E. Hardware & Connectivity Readiness Checklist</h3>
                <p className="text-xs text-slate-400">
                  Valide el estado de factibilidad técnica física preliminar del equipamiento que simulará la conexión.
                </p>
              </div>

              <div className="space-y-2.5">
                {hardwareChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 bg-slate-900/40 border border-slate-850/80 rounded-xl cursor-pointer select-none hover:bg-slate-900/80 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleHwChecklistItem(item.id)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Info className="w-4 h-4" />
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">Restricción de Entrada de Datos Técnicos:</span>
                </div>
                <p className="text-slate-400">
                  “La conexión real, direccionamientos IP locales de contraparte, contraseñas de switches PoE y credenciales ONVIF se revisan y ejecutan de manera externa y autónoma fuera del software de demostración comercial con el cliente o proveedor técnico autorizado.”
                </p>
              </div>
            </div>
          )}

          {/* SECTION F: AUTHORIZATION CHECKLIST */}
          {activeTab === "auth" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">F. Authorization & Ethics Checklist (12 Puntos)</h3>
                <p className="text-xs text-slate-400">
                  Lista de autorizaciones formales gestionadas externamente requeridas antes de desplegar el piloto interactivo controlado.
                </p>
              </div>

              <div className="space-y-2.5">
                {authChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 bg-slate-900/40 border border-slate-850/80 rounded-xl cursor-pointer select-none hover:bg-slate-900/80 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleAuthChecklistItem(item.id)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-slate-200 block">{item.label}</span>
                        {item.critical && (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 font-mono text-[8px] font-bold uppercase rounded tracking-wider shrink-0">
                            Crítico (Bloqueante)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-white block mb-1">Efecto del Bloqueo Preventivo:</span>
                Si falta alguna de las autorizaciones formales marcadas como **Crítico (Bloqueante)**, el estado del piloto cambiará automáticamente a **Pilot Blocked** y se suspenderá la posibilidad de exportación del reporte unificado de planificación.
              </div>
            </div>
          )}

          {/* SECTION G: PRIVACY & DATA BOUNDARIES */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">G. Privacy & Data Boundaries</h3>
                <p className="text-xs text-slate-400">
                  Establezca los límites de confidencialidad y los perímetros físicos del piloto controlado.
                </p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4 text-xs leading-relaxed">
                <div className="space-y-2">
                  <span className="font-bold text-white uppercase block text-[10px] tracking-wider text-indigo-400">🛡️ Salvaguarda de Privacidad Residencial (Privacy Shield):</span>
                  <p className="text-slate-300">
                    En pilotos residenciales o de condominios, se debe pre-configurar de forma obligatoria el enmascaramiento estático facial en las cámaras de accesos perimetrales. Quedan terminantemente fuera de la demo:
                  </p>
                  <ul className="list-disc pl-5 text-slate-400 space-y-1.5">
                    <li>Pasillos interiores de departamentos, áreas comunes de recreación cerrada (piscinas, quinchos).</li>
                    <li>Cámaras con orientación directa a patios traseros o terrazas de copropietarios.</li>
                    <li>Registro o captura de imágenes identificables de menores de edad o transeúntes públicos.</li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="font-bold text-white uppercase block text-[10px] tracking-wider text-rose-400">🚫 Prohibición de Registro y Almacenamiento Absoluto:</span>
                  <p className="text-slate-300">
                    El sistema de simulación está bloqueado localmente. No se registran ni persisten en el servidor de demostración:
                  </p>
                  <ul className="list-disc pl-5 text-slate-400 space-y-1.5 font-mono text-[10px]">
                    <li>Cuentas o contraseñas activas del grabador NVR de terreno.</li>
                    <li>Cadenas completas de conexión RTSP con credenciales codificadas.</li>
                    <li>Nombres de pila de guardias, números de departamentos o patentes de vehículos de residentes.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION H: RISKS & CONSTRAINTS */}
          {activeTab === "risks" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">H. Risks & Constraints (Capacidad Operativa)</h3>
                <p className="text-xs text-slate-400">
                  Gestión inteligente y mitigación de factores que afectan la viabilidad del piloto sin sobreprometer rendimiento.
                </p>
              </div>

              {/* Risks Table Component */}
              <div className="border border-slate-850 rounded-xl overflow-hidden font-sans">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="p-3">Riesgo Identificado</th>
                      <th className="p-3">Impacto</th>
                      <th className="p-3">Mitigación Recomendada</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 bg-slate-950/40">
                    {risks.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-900/20">
                        <td className="p-3 font-bold text-slate-200">{r.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            r.impact === "Alta" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            r.impact === "Media" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-slate-800 text-slate-400"
                          }`}>
                            {r.impact}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs">{r.mitigation}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-mono text-slate-400">{r.status}</span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">{r.responsible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION I: SUCCESS CRITERIA */}
          {activeTab === "success" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">I. Success Criteria (Criterios de Éxito)</h3>
                <p className="text-xs text-slate-400">
                  Establezca criterios objetivos orientativos y de validación humana para evaluar la demostración al cierre del piloto comercial.
                </p>
              </div>

              <div className="space-y-2.5">
                {successCriteria.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 bg-slate-900/40 border border-slate-850/80 rounded-xl cursor-pointer select-none hover:bg-slate-900/80 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleSuccessCriteriaItem(item.id)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-rose-400 block uppercase text-[10px] tracking-wider">🚫 Métricas estrictamente prohibidas en el acuerdo de piloto:</span>
                <p className="text-slate-450 leading-relaxed font-sans">
                  No se permite prometer ni incluir como criterio de éxito: "Detección al 100% de intrusiones sin fallos", "Ruido operacional y falsas alarmas comunicadas como limitación", "Análisis referencial de valor operativo no vinculante", "Alineación interna de normativas nacionales", ni "Sustitución de guardias o personal físico de conserjería".
                </p>
              </div>
            </div>
          )}

          {/* SECTION J: PILOT TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">J. Pilot Timeline (Plan de Trabajo Sugerido)</h3>
                <p className="text-xs text-slate-400">
                  Línea de tiempo secuencial recomendada para la ejecución del piloto comercial controlado de 15 días.
                </p>
              </div>

              {/* Timeline Horizontal / Vertical */}
              <div className="space-y-4 relative pl-6 border-l border-slate-800">
                {[
                  { day: "Día 0", title: "Preparación Interna & Sanitización", desc: "Definición del alcance conceptual, check de autorizaciones obligatorias y verificación por el scanner local de no-contaminación de datos." },
                  { day: "Día 1", title: "Revisión con Stakeholders Autorizados", desc: "Presentación del plan acotado de simulación al cliente por canal externo tradicional y validación de las salvaguardas del Privacy Shield residencial." },
                  { day: "Día 2-3", title: "Despliegue del Gateway de Prueba", desc: "Configuración física del hardware de prueba local en sub-stream secundario sin interrumpir la grabación de los grabadores NVR de base." },
                  { day: "Día 4-10", title: "Observación Operativa & Simulaciones", desc: "Ejecución del software en Modo Conserje o Dashboard Avanzado según corresponda. Recopilación de bitácoras de incidentes simulados." },
                  { day: "Día 11-15", title: "Revisión de Resultados y Cierre", desc: "Consolidación de bitácoras y generación del reporte unificado sanitizado en formato Markdown para la descarga de stakeholders." }
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="space-y-1 bg-slate-900/30 border border-slate-850 p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-wider">{step.day}</span>
                        <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal font-sans">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION K: PILOT HANDOFF PACK */}
          {activeTab === "handoff" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">K. Pilot Handoff Pack & Integración</h3>
                <p className="text-xs text-slate-400">
                  Visualice el flujo de traspaso y sincronización segura entre los distintos sub-módulos del sistema de ayuda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Integration Nodes */}
                {[
                  { title: "Pilot Intake Center Link", desc: "Transfiere los campos del formulario inicial sanitizando en caliente IPs y PII antes de depositarlos.", status: "Guardado Seguro Activo" },
                  { title: "Field & Community Proposal Pack", desc: "Proporciona el marco comercial de base de forma teórica libre de sobrepromesas de detección.", status: "Aislado del Core Real" },
                  { title: "Official Demo Runbook", desc: "Guía interactiva paso a paso para el presentador de la demo con descargo ético de simulación.", status: "Integrado en Caliente" },
                  { title: "Operator Help Center", desc: "El centro de ayuda por rol consulta de forma local las directrices y glosario del piloto.", status: "Persistido en LocalStorage" }
                ].map((node, i) => (
                  <div key={i} className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                      {i + 1}
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-200 block">{node.title}</span>
                      <p className="text-slate-400 leading-normal font-sans">{node.desc}</p>
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded inline-block mt-1">
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety notice */}
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 leading-normal text-slate-400 font-sans">
                  <span className="font-bold text-rose-400 block uppercase text-[10px] tracking-wider">Aislamiento de Transmisión de Datos:</span>
                  El puente de integración entre módulos limpia de forma proactiva cualquier formato de PII o credencial. En caso de detectarse alguna anomalía en el scanner local, la pasarela de intercambio de datos se interrumpe preventivamente.
                </div>
              </div>
            </div>
          )}

          {/* SECTION L: PILOT SUMMARY REPORT */}
          {activeTab === "report" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">L. Pilot Summary Report</h3>
                <p className="text-xs text-slate-400">
                  Revise el reporte de planificación unificado de Customer Pilot Workspace en formato Markdown sanitizado.
                </p>
              </div>

              {/* Markdown Display */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 text-slate-350 select-text whitespace-pre">
                {summaryReport}
              </div>

              {/* Copy action controls */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Guardar Borrador en Historial</span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={overallState === "Pilot Blocked" || overallState === "Needs Sanitization"}
                  className={`px-6 py-2.5 text-xs font-bold font-mono rounded-xl flex items-center gap-2.5 transition-all ${
                    overallState === "Pilot Blocked" || overallState === "Needs Sanitization"
                      ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-950/30"
                  }`}
                >
                  {copiedReport ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReport ? "REPORTE COPIADO!" : "COPIAR REPORTE AL PORTAPAPELES"}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Minimal icons matching needs
function FolderPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}
