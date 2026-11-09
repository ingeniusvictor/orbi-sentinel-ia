import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Play,
  Briefcase,
  Cpu,
  Home,
  UserCheck,
  Wrench,
  Award,
  Compass,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Info,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Activity,
  LineChart,
  BookOpen
} from "lucide-react";

interface ExternalStakeholderBinderProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function ExternalStakeholderBinder({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: ExternalStakeholderBinderProps) {
  // 1. Core State
  const [selectedAudience, setSelectedAudience] = useState<string>("gerente-om");
  const [selectedRoute, setSelectedRoute] = useState<string>("field-5");
  const [meetingMode, setMeetingMode] = useState<string>("negocios-30");
  const [customNotes, setCustomNotes] = useState<string>(
    "Reunión introductoria de exploración para validar alcances sin ingresar datos reales ni conectar flujos locales."
  );
  
  // Success states for copies
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Media Kit Integration text loaded from localstorage if available, otherwise default
  const [mediaKitContent, setMediaKitContent] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("ORBI_LAUNCH_MEDIA_KIT_APPROVED_CONTENT");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.text) {
          setMediaKitContent(parsed.text);
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  // 2. QA Checklist State (14 detailed checkpoints aligned with Módulo 7A)
  const [qaChecklist, setQaChecklist] = useState({
    noRealData: true,
    noCredentials: true,
    noIpRtsp: true,
    noPii: true,
    responsibleClaims: true,
    productionLockedVisible: true,
    creditsVisible: true,
    audienceSelected: true,
    meetingModeSelected: true,
    followUpSanitized: true,
    copyPackSanitized: true,
    nextStepDefined: true,
    readmeUpdated: true,
    versionRegistryUpdated: true
  });

  const handleToggleQA = (key: keyof typeof qaChecklist) => {
    const newVal = !qaChecklist[key];
    setQaChecklist(prev => ({ ...prev, [key]: newVal }));
    onAddAuditLog(
      "Auditoría Binder",
      `Punto de control '${String(key)}' cambiado a ${newVal ? "Verificado" : "Pendiente"}`
    );
  };

  // 3. Sanitization Scanner Real-time logic with Módulo 7B forbidden claims list
  const [scanStatus, setScanStatus] = useState<{
    clean: boolean;
    findings: string[];
    suggestedText: string;
  }>({ clean: true, findings: [], suggestedText: "" });

  const forbiddenClaimsText = [
    { key: "detecta todos los robos", label: "Detección absoluta de robos / Detecta todos los robos", replace: "apoyo al diagnóstico de anomalías perimetrales" },
    { key: "previene todos los incidentes", label: "Previene todos los incidentes", replace: "apoya la trazabilidad técnica de incidentes" },
    { key: "reemplaza cualquier nvr", label: "Reemplaza cualquier NVR / grabador", replace: "interopera con NVRs compatibles en red local" },
    { key: "reemplaza guardias", label: "Reemplazo de guardias de seguridad", replace: "asistente visual para el personal de vigilancia" },
    { key: "reemplaza scada", label: "Reemplazo de SCADA / O&M / HSE", replace: "asistencia de diagnóstico pasivo para O&M" },
    { key: "reemplaza o&m", label: "Reemplazo de SCADA / O&M / HSE", replace: "asistencia de diagnóstico pasivo para O&M" },
    { key: "reemplaza hse", label: "Reemplazo de SCADA / O&M / HSE", replace: "asistencia de diagnóstico pasivo para O&M" },
    { key: "funciona con cualquier cámara", label: "Compatibilidad universal con cualquier cámara", replace: "compatibilidad sujeta a verificación de protocolos" },
    { key: "producción 24/7", label: "Producción activa 24/7", replace: "demostración controlada bajo llave segura" },
    { key: "evidencia judicial garantizada", label: "Garantía de validez de evidencia judicial", replace: "generación de informe técnico preliminar" },
    { key: "roi garantizado", label: "Garantía de retorno de inversión (ROI)", replace: "estudio de factibilidad operacional de pilotos" },
    { key: "sistema autónomo infalible", label: "Sistema autónomo infalible", replace: "asistencia supervisada por un operador humano" },
    { key: "detección absoluta", label: "Detección absoluta de robos 24/7", replace: "monitoreo secundario de salud de red" },
    { key: "blindaje legal", label: "Término absoluto: blindaje legal", replace: "gobernanza responsable" },
    { key: "inmunidad legal", label: "Término absoluto: inmunidad legal", replace: "control de riesgo comunicacional" },
    { key: "blindaje absoluto", label: "Término absoluto: blindaje absoluto", replace: "control de riesgo legal" },
    { key: "validación legal absoluta", label: "Término absoluto: validación legal absoluta", replace: "material externo sanitizado" },
    { key: "garantía legal absoluta", label: "Término absoluto: garantía legal absoluta", replace: "coordinación técnica de expectativas" }
  ];

  const performSanitizationScan = (textToScan: string) => {
    const findings: string[] = [];
    let clean = true;
    let suggested = textToScan;

    // Email regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
    if (emailRegex.test(textToScan)) {
      findings.push("Detección de correo electrónico (PII)");
      suggested = suggested.replace(emailRegex, "[EMAIL_SANITIZADO]");
      clean = false;
    }

    // Phone regex
    const phoneRegex = /(\+?56\s?9\s?[0-9]{4}\s?[0-9]{4}|[0-9]{8,11})/g;
    if (phoneRegex.test(textToScan)) {
      findings.push("Detección de número telefónico o patrón numérico (PII)");
      suggested = suggested.replace(phoneRegex, "[TELEFONO_SANITIZADO]");
      clean = false;
    }

    // IP regex
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    if (ipRegex.test(textToScan)) {
      findings.push("Detección de dirección IP de red local o pública");
      suggested = suggested.replace(ipRegex, "[IP_SANITIZADA]");
      clean = false;
    }

    // RTSP protocol or links
    if (textToScan.toLowerCase().includes("rtsp://")) {
      findings.push("Detección de prefijo de protocolo RTSP");
      suggested = suggested.replace(/rtsp:\/\/[^\s]+/gi, "rtsp://[RTSP_STREAM_SANITIZADO]");
      clean = false;
    }

    // Sensitive URL patterns
    const sensitiveUrlRegex = /(https?:\/\/(?:192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|admin|root)[^\s]*)/gi;
    if (sensitiveUrlRegex.test(textToScan)) {
      findings.push("Detección de URL interna de cámara o router local");
      suggested = suggested.replace(sensitiveUrlRegex, "[URL_INTERNA_SANITIZADA]");
      clean = false;
    }

    // User:Pass or SSH formats
    const userPassRegex = /\b([a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)@/g;
    if (userPassRegex.test(textToScan)) {
      findings.push("Detección de formato usuario:contraseña de red (Credenciales)");
      suggested = suggested.replace(userPassRegex, "[CREDENCIALES_SANITIZADAS]@");
      clean = false;
    }

    // Password / Token keywords
    const secretKeywords = ["password", "contraseña", "clave", "token", "key=", "secret", "coordenadas", "coordenada", "latitud", "longitud"];
    const foundKeywords = secretKeywords.filter(keyword => textToScan.toLowerCase().includes(keyword));
    if (foundKeywords.length > 0) {
      findings.push(`Detección de posible secreto técnico o coordenada (${foundKeywords.join(", ")})`);
      clean = false;
    }

    // Forbidden Claims
    forbiddenClaimsText.forEach(claim => {
      if (textToScan.toLowerCase().includes(claim.key)) {
        findings.push(`Reclamo prohibido detectado: "${claim.label}"`);
        const regex = new RegExp(claim.key, "gi");
        suggested = suggested.replace(regex, claim.replace);
        clean = false;
      }
    });

    setScanStatus({ clean, findings, suggestedText: suggested });
  };

  useEffect(() => {
    performSanitizationScan(customNotes);
  }, [customNotes]);

  // Dynamic 10 frentes de auditoría for the External Binder QA Lock
  const getFrenteStatus = (frenteId: string): "Ready" | "Needs Review" | "Blocked" => {
    switch (frenteId) {
      case "banner":
        return (qaChecklist.noRealData && qaChecklist.noCredentials && qaChecklist.noIpRtsp) ? "Ready" : "Blocked";
      case "audience":
        return selectedAudience ? "Ready" : "Needs Review";
      case "overview":
        return qaChecklist.productionLockedVisible ? "Ready" : "Needs Review";
      case "product_line":
        return qaChecklist.versionRegistryUpdated ? "Ready" : "Needs Review";
      case "routes":
        return selectedRoute ? "Ready" : "Needs Review";
      case "claims":
        if (!qaChecklist.responsibleClaims) return "Blocked";
        const hasForbiddenInNotes = forbiddenClaimsText.some(claim => customNotes.toLowerCase().includes(claim.key));
        return hasForbiddenInNotes ? "Blocked" : "Ready";
      case "matrix":
        return (qaChecklist.readmeUpdated && qaChecklist.versionRegistryUpdated) ? "Ready" : "Needs Review";
      case "meeting":
        return meetingMode ? "Ready" : "Needs Review";
      case "copy_pack":
        return (scanStatus.clean && qaChecklist.copyPackSanitized) ? "Ready" : "Blocked";
      case "scanner_report":
        return (scanStatus.clean && qaChecklist.followUpSanitized) ? "Ready" : "Needs Review";
      default:
        return "Needs Review";
    }
  };

  const frentes = [
    { id: "banner", label: "Binder Safety Banner", desc: "Verificación de deslinde superior y ausencia de datos en vivo" },
    { id: "audience", label: "Audience Selector", desc: "Selección de perfil adaptable para adecuar narrativa" },
    { id: "overview", label: "Executive Overview", desc: "Explicación objetiva y límites de no-sobrepromesa" },
    { id: "product_line", label: "Product Line Summary", desc: "Resguardo del estado modular Field/Community/Consumer" },
    { id: "routes", label: "Official Demo Routes", desc: "Orientación segura de tiempos y pantallas por audiencia" },
    { id: "claims", label: "Claims Panel", desc: "Contraste estricto entre claims permitidos y prohibidos" },
    { id: "matrix", label: "Lock Status Matrix", desc: "Sincronización del estado de bloqueo físico del software" },
    { id: "meeting", label: "Meeting Mode", desc: "Guía de conducta y tiempos estructurados de presentación" },
    { id: "copy_pack", label: "Copy Pack & Follow-up", desc: "Material copiable y plantilla post-reunión sanitizada" },
    { id: "scanner_report", label: "Binder Scanner & Report", desc: "Escáner reactivo en caliente y reporte unificado" }
  ];

  // 4. Readiness Score Matrix Calculation (aligned with 10 frentes)
  const calculateReadinessScore = () => {
    const frentesStatuses = frentes.map(f => getFrenteStatus(f.id));
    const hasBlocked = frentesStatuses.some(s => s === "Blocked") || !scanStatus.clean;
    const hasNeedsReview = frentesStatuses.some(s => s === "Needs Review");

    const checkedCount = Object.values(qaChecklist).filter(Boolean).length;
    const totalCount = Object.keys(qaChecklist).length;
    const percentage = Math.round((checkedCount / totalCount) * 100);

    let status: "External Binder Stakeholder Presentation Locked" | "Needs Review" | "Binder Blocked" = "Needs Review";
    let desc = "Se requiere verificar la totalidad de los frentes regulatorios antes de entablar una reunión oficial.";
    let score = percentage;

    if (hasBlocked) {
      status = "Binder Blocked";
      desc = "El binder contiene puntos críticos de seguridad bloqueados o detectados por el escáner de sanitización.";
      score = percentage > 40 ? 40 : percentage; // cap score under blockage
    } else if (!hasNeedsReview) {
      status = "External Binder Stakeholder Presentation Locked";
      desc = "El material de presentación externa se encuentra sanitizado, auditado y listo para desplegarse de forma segura.";
      score = 100;
    } else {
      status = "Needs Review";
      desc = "Algunos frentes requieren revisión. Complete el checklist final de 14 puntos para liberar la presentación.";
    }

    return { score, status, desc };
  };

  const readiness = calculateReadinessScore();

  // 5. Audiences Data - 13 fully sanitizied adaptive profiles with probable objections
  const audiences = [
    {
      id: "ceo-inversionista",
      name: "Director General (CEO) / Inversionista (Estratégico / Alta dirección)",
      icon: Award,
      mainMsg: "Sustentabilidad y escalabilidad modular del software mediante gestión de riesgos mitigados.",
      line: "ORBI Sentinel IA Roadmap",
      route: "Ruta Ejecutiva — Ruta de 5 Minutos",
      duration: "5 Minutos",
      toShow: "Locks de validación en MVP Freeze Center, modularidad y enfoque offline.",
      toAvoid: "Evitar promesas irresponsables de producción inmediata o contratos automáticos.",
      nextStep: "Firmar acuerdo técnico preliminar no vinculante de intenciones.",
      objection: "Dudas sobre la escalabilidad ante sistemas heredados de gran tamaño."
    },
    {
      id: "gerente-om",
      name: "Gerente de Operaciones y Mantenimiento (O&M) (Planta Solar / Industrial)",
      icon: Briefcase,
      mainMsg: "Evidencia de diagnóstico pasivo para reducir fallas en terreno sin intervenir disyuntores.",
      line: "Sentinel Field (Infraestructura)",
      route: "Guided Field Demo — Ruta de 5 Minutos",
      duration: "5 Minutos",
      toShow: "CCTV Diagnostics, bitácoras de ping PoE simuladas y exportación de reportes sanitizados.",
      toAvoid: "No prometer monitoreo de cuadrillas en vivo o reemplazo de SCADA principal.",
      nextStep: "Piloto acotado de 1 a 3 cámaras perimetrales con autorización previa fuera de la demo.",
      objection: "Duda sobre si la IA requiere calibración física compleja en terreno."
    },
    {
      id: "proveedor-cctv",
      name: "Integrador de Sistemas de Seguridad / Proveedor de CCTV (Frente técnico)",
      icon: Layers,
      mainMsg: "Arquitectura cooperativa como valor agregado y soporte al canal cerrado de televisión.",
      line: "Sentinel Field / Community Integration",
      route: "Ruta de 5 Minutos Técnica",
      duration: "5 Minutos",
      toShow: "Matriz de compatibilidad física de marcas, flujos RTSP simulados y control de salud.",
      toAvoid: "No prometer que reemplaza los NVR del integrador ni altera garantías del fabricante.",
      nextStep: "Reunión de interoperabilidad técnica para configurar pasarela de red sandbox.",
      objection: "Temor a que el software anule contratos preexistentes de mantenimiento."
    },
    {
      id: "administracion-condominio",
      name: "Administrador de Condominio / Directiva (Residencial)",
      icon: Users,
      mainMsg: "Trazabilidad de anomalías comunes (portones vehiculares abiertos, perímetro) en copropiedad.",
      line: "Sentinel Community (Gestión)",
      route: "Guided Community Demo — Ruta de 5 Minutos",
      duration: "5 Minutos",
      toShow: "Módulo de Incident Center, registro de bitácora no modificable y reportes.",
      toAvoid: "No prometer validez judicial autónoma sin firma de ministro de fe ni reemplazo del conserje.",
      nextStep: "Alinear el inventario preliminar de cámaras perimetrales del condominio.",
      objection: "Preocupación por costos de mantenimiento del gateway local."
    },
    {
      id: "comite-seguridad",
      name: "Comité de Seguridad / Copropietarios (Residencial)",
      icon: Home,
      mainMsg: "Seguridad perimetral residencial con resguardo estricto de la privacidad de vecinos.",
      line: "Sentinel Community (Condominios)",
      route: "Guided Community Demo — Ruta de 5 Minutos",
      duration: "5 Minutos",
      toShow: "Privacy Compliance Shield, EasyView para conserjes y enmascaramiento dinámico.",
      toAvoid: "No prometer visualización de cámaras en celulares de residentes ni televigilancia municipal.",
      nextStep: "Presentar el reglamento de uso de zonas de privacidad al comité.",
      objection: "Temor a que la directiva use las cámaras para vigilar la vida privada de vecinos."
    },
    {
      id: "supervisor-hse",
      name: "Supervisor de Terreno HSE / Prevencionista de Riesgos (Industrial)",
      icon: Shield,
      mainMsg: "Trazabilidad de seguridad ocupacional y prevención de incidentes en zonas perimetrales riesgosas.",
      line: "Sentinel Field (HSE & Compliance)",
      route: "Guided Field Demo — Ruta de 5 Minutos",
      duration: "5 Minutos",
      toShow: "Marcación de zonas rojas perimetrales, controles simulados y bitácoras de incidentes.",
      toAvoid: "No prometer monitoreo de signos vitales ni reemplazo de prevencionistas físicos.",
      nextStep: "Taller técnico de análisis de riesgos perimetrales e inducción EPP.",
      objection: "Duda sobre resistencia del hardware exterior ante ambientes extremos."
    },
    {
      id: "gerente-ti",
      name: "Gerente de TI y Ciberseguridad (Corporate / Redes)",
      icon: Cpu,
      mainMsg: "Ciberseguridad y aislamiento de red local mediante procesamiento offline en el borde.",
      line: "Sentinel API Framework",
      route: "Ruta de 10 Minutos Técnica",
      duration: "10 Minutos",
      toShow: "Aislamiento del Sentinel Gateway, simulación de tráfico pasivo Dahua LAN y base offline.",
      toAvoid: "No prometer integración directa con intranets corporativas sin permisos previos de TI.",
      nextStep: "Revisar compatibilidad y seguridad del sandbox de pruebas locales.",
      objection: "Temor a la introducción de vulnerabilidades por conexiones no deseadas."
    },
    {
      id: "ingeniero-preventa",
      name: "Ingeniero Preventa / Diseñador de Proyectos (Canal técnico interno)",
      icon: Compass,
      mainMsg: "Estructuración ágil y diseño técnico consistente utilizando la matriz de compatibilidad.",
      line: "ORBI Sentinel Tooling",
      route: "Ruta de 10 Minutos Completa",
      duration: "10 Minutos",
      toShow: "Dahua Lab Protocol, compatibilidad ONVIF genérica y variables de Baseline.",
      toAvoid: "No garantizar compatibilidad universal con cualquier cámara antigua sin transcodificador.",
      nextStep: "Modelar la propuesta técnica sanitizada para la próxima reunión de alineación.",
      objection: "Dudas sobre la velocidad de configuración de múltiples sub-streams locales."
    },
    {
      id: "conserje-turno",
      name: "Conserje de Turno / Guardia de Seguridad (Operación en caliente)",
      icon: UserCheck,
      mainMsg: "Asistencia visual simplificada para reducir el agotamiento de vigilar pantallas múltiples.",
      line: "Sentinel Community (Conserjería)",
      route: "EasyView Conserjería — Ruta de 3 Minutos",
      duration: "3 Minutos",
      toShow: "EasyView modo táctil, marcación manual rápida de incidentes y muro fluido.",
      toAvoid: "Evitar prometer automatización autónoma total de la respuesta de seguridad.",
      nextStep: "Inducción rápida mediante un simulacro interactivo de incidentes comunes.",
      objection: "Temor a que la tecnología complique su labor en situaciones de estrés."
    },
    {
      id: "comprador-compras",
      name: "Comprador de Compras Corporativas (Procurement / Abastecimiento)",
      icon: Briefcase,
      mainMsg: "Transparencia comercial y mitigación de riesgos con precios diferidos sujetos a piloto.",
      line: "ORBI Proposal Center",
      route: "Ruta de 5 Minutos Comercial",
      duration: "5 Minutos",
      toShow: "Propuestas dinámicas estimadas, límites comerciales explícitos y exclusión de SLAs.",
      toAvoid: "No prometer cotizaciones fijas de producción ni contratos de provisión automática.",
      nextStep: "Establecer la estructura de hitos operacionales previos para factibilidad.",
      objection: "Presión por obtener precios definitivos cerrados en fase de demostración."
    },
    {
      id: "aliado-negocio",
      name: "Aliado de Negocio / Socio Estratégico (Ecosystem)",
      icon: Award,
      mainMsg: "Interoperabilidad abierta y co-diseño modular como pilares de crecimiento conjunto.",
      line: "ORBI Ecosystem Synergy",
      route: "Ruta de 5 Minutos Estratégica",
      duration: "5 Minutos",
      toShow: "Límites responsables de la demo, credits oficiales Víctor M. León y licencias de prueba.",
      toAvoid: "No declarar compromisos de exclusividad territorial sin contratos formales externos.",
      nextStep: "Coordinar firma de carta de entendimiento recíproco.",
      objection: "Incertidumbre sobre el roadmap definitivo de integraciones de hardware."
    },
    {
      id: "representante-comunidad",
      name: "Representante de Comunidad Vecinal (Social)",
      icon: Users,
      mainMsg: "Prevención perimetral pacífica y resguardo de la convivencia social mediante enmascaramiento.",
      line: "Sentinel Community (Impacto Social)",
      route: "Ruta de 3 Minutos de Convivencia",
      duration: "3 Minutos",
      toShow: "Filtro dinámico Privacy Compliance, enmascaramiento de veredas públicas y deslinde.",
      toAvoid: "No sugerir que se vigilan patios interiores de vecinos o se detectan rostros públicos.",
      nextStep: "Reunión informativa con la asamblea vecinal sobre alcances éticos.",
      objection: "Suspicacia ante posible uso del sistema para control social intrusivo."
    },
    {
      id: "cliente-domestico",
      name: "Cliente Final Doméstico / Smart Home Enthusiast (Consumer)",
      icon: Home,
      mainMsg: "Monitoreo perimetral inteligente doméstico con almacenamiento NAS 100% privado offline.",
      line: "Sentinel Consumer Lab",
      route: "Eufy Consumer Bridge — Ruta de 3 Minutos",
      duration: "3 Minutos",
      toShow: "Eufy Consumer Bridge, diagnóstico local y almacenamiento sin suscripción cloud.",
      toAvoid: "No prometer compatibilidad con domótica cloud propietaria que requiera tokens de terceros.",
      nextStep: "Configurar red wifi aislada de prueba para las cámaras del hogar.",
      objection: "Dudas sobre si requiere comprar un servidor de nivel industrial."
    }
  ];

  const activeAudience = audiences.find(aud => aud.id === selectedAudience) || audiences[0];

  // Live save to localStorage for memory bridge integration (Pilot Handoff & Pilot Intake)
  useEffect(() => {
    if (scanStatus.clean) {
      localStorage.setItem("ORBI_STAKEHOLDER_BINDER_MEETING_NOTES", JSON.stringify({
        audience: activeAudience.name,
        notes: customNotes,
        followUp: activeAudience.nextStep,
        clean: true
      }));
    } else {
      localStorage.setItem("ORBI_STAKEHOLDER_BINDER_MEETING_NOTES", JSON.stringify({
        audience: activeAudience.name,
        notes: "BLOQUEADO - Notas contienen datos sensibles o claims prohibidos sin sanitizar.",
        followUp: activeAudience.nextStep,
        clean: false
      }));
    }
  }, [customNotes, scanStatus.clean, activeAudience]);

  // 6. Official Demo Routes
  const demoRoutes = [
    { id: "public-60s", name: "Public Demo (60s Pitch)", aud: "Público General / Redes", screen: "Public Demo Hub", msg: "Explicar el concepto modular en 1 minuto", risk: "No simplificar en exceso los límites de privacidad.", next: "Enviar Launch Media Kit" },
    { id: "public-3m", name: "Public Demo (3 Min Tour)", aud: "Clientes Potenciales", screen: "Public Demo Hub + Dashboard", msg: "Demostrar flujos simulados de incidentes", risk: "Asegurar que entiendan que es simulación.", next: "Agendar reunión ejecutiva" },
    { id: "public-5m", name: "Public Demo (5 Min Deep)", aud: "Interesados Técnicos", screen: "Public Demo Hub + CCTV Diagnostics", msg: "Demostración de diagnóstico profundo", risk: "No prometer instalación en terreno inmediata.", next: "Completar Pilot Intake preliminar" },
    
    { id: "field-3", name: "Field Route (3 Min Operations)", aud: "Jefe de Planta / Operador", screen: "Field Operations Center + Incident Center", msg: "Validación rápida de incidentes operacionales", risk: "No sugerir reemplazo de personal de planta.", next: "Levantamiento de marcas de CCTV" },
    { id: "field-5", name: "Field Route (5 Min Diagnosis)", aud: "Gerente O&M / Supervisor", screen: "Field Operations + CCTV Diagnostics + Reports", msg: "Diagnóstico profundo de switches PoE perimetrales", risk: "No sugerir intervención directa de cableado eléctrico.", next: "Firmar autorización para inspección externa" },
    { id: "field-10", name: "Field Route (10 Min Validation)", aud: "Proveedor CCTV / Supervisor", screen: "Field Operations + Gateway + Dahua Protocol", msg: "Inspección técnica de interoperabilidad LAN", risk: "No prometer soporte de firmware descontinuado.", next: "Coordinar sandbox técnico en laboratorio" },
    { id: "field-15", name: "Field Route (15 Min Deep Technical)", aud: "Socio / Integrador Complejo", screen: "Todo el flujo Field + MVP Freeze Center", msg: "Auditoría exhaustiva de arquitectura offline", risk: "No revelar secretos de propiedad intelectual.", next: "Formalizar acuerdo de confidencialidad NDA" },
    
    { id: "community-3", name: "Community Route (3 Min Fast)", aud: "Comité de Condominio / Copropietarios", screen: "Community Pilot + EasyView Conserjería", msg: "Reducción de fatiga visual del conserje", risk: "No prometer conexión a alarmas policiales.", next: "Presentar circular explicativa a vecinos" },
    { id: "community-5", name: "Community Route (5 Min Privacy)", aud: "Comité + Administrador", screen: "Community Pilot + Privacy Shield + Evidence", msg: "Privacidad por diseño con enmascaramiento de áreas", risk: "No prometer almacenamiento infinito de video local.", next: "Establecer protocolo de acceso a grabaciones" },
    { id: "community-10", name: "Community Route (10 Min Full)", aud: "Administrador / Guardia Supervisor", screen: "Community Pilot + EasyView + Incident + Proposal", msg: "Trazabilidad comunitaria de portones y perímetros", risk: "No prometer automatización legal de multas.", next: "Lanzar Pilot Intake de condominio" },
    
    { id: "video-15s", name: "Video (15s Intro)", aud: "Social Media / Pitch Rápido", screen: "Public Demo Hub Quick View", msg: "Captar interés visual con UI elegante", risk: "No sobreprometer alcances con textos rápidos.", next: "Dirigir a la Demo Pública interactiva" },
    { id: "video-30s", name: "Video (30s Feature)", aud: "Inversionistas / Partners", screen: "Visual Transition EasyView + Live Wall", msg: "Mostrar el valor de la asistencia visual", risk: "Mantener marcas de 'Simulado' bien visibles.", next: "Compartir página web del proyecto" },
    { id: "video-60s", name: "Video (60s Pitch Completo)", aud: "Socio Comercial", screen: "Product Line Cards + Privacy Shield", msg: "Explicar las tres líneas de producto", risk: "No prometer cobertura de producción autónoma.", next: "Agendar videollamada de aclaración técnica" },
    { id: "video-90s", name: "Video (90s Demo Guiada)", aud: "Público Corporativo", screen: "Recorrido rápido por todas las pantallas", msg: "Visión holística del Ecosistema ORBI Sentinel IA", risk: "No omitir créditos oficiales ni descargo legal.", next: "Establecer canal de contacto corporativo" }
  ];

  const activeRouteData = demoRoutes.find(r => r.id === selectedRoute) || demoRoutes[0];

  // 7. Approved Claims vs Forbidden Claims
  const approvedClaims = [
    "Demostración controlada bajo datos sanitizados.",
    "Privacidad por diseño: enmascaramiento estricto de PII.",
    "Production Locked: estado de bloqueo físico activo para seguridad.",
    "Apoyo operacional y reducción de fatiga cognitiva del operario.",
    "Diagnóstico rápido de estado de enlace de cámaras (CCTV Diagnostics).",
    "Bitácoras de incidentes locales para evidencia de laboratorio.",
    "Trazabilidad local fuera de la nube corporativa.",
    "Pilotos acotados y seguros de 1 a 3 cámaras autorizadas.",
    "Validación y supervisión humana obligatoria en todo momento.",
    "Coordinación estrecha con personal técnico calificado del cliente."
  ];

  const forbiddenClaims = [
    "No afirma detectar el 100% de los robos o intrusiones perimetrales.",
    "No previene incidentes físicos de forma autónoma.",
    "No reemplaza los grabadores NVR existentes del recinto.",
    "No sustituye a los guardias de seguridad física ni sus rondas.",
    "No reemplaza los sistemas SCADA industriales ni normativas HSE.",
    "No promete compatibilidad inmediata con cualquier cámara sin análisis.",
    "No tiene producción 24/7 lista para conectarse de forma autónoma.",
    "No garantiza la validez de las bitácoras como evidencia penal directa.",
    "No promete un retorno de inversión (ROI) financiero automático.",
    "No promueve el desvío de procedimientos de seguridad física del cliente."
  ];

  // 8. Lock Status Matrix
  const lockMatrix = [
    { name: "Dahua PoE Lab MVP", status: "Locked", desc: "Protocolo físico emulado en laboratorio" },
    { name: "Community Guided Demo", status: "Locked", desc: "Rutas residenciales preconfiguradas" },
    { name: "Field Guided Demo", status: "Locked", desc: "Rutas perimetrales solares listas" },
    { name: "Public Demo Hub", status: "Controlled Locked", desc: "Guiones de tiempo y advertencias activas" },
    { name: "Media Kit", status: "Communication Locked", desc: "Textos de divulgación pre-aprobados" },
    { name: "Offline Analytics", status: "Privacy Locked", desc: "Cálculos matemáticos sin capturar PII" },
    { name: "Demo Insights", status: "Improvement Locked", desc: "Recomendaciones lógicas de mitigación" },
    { name: "A/B Lab", status: "Experiment Locked", desc: "Prueba offline de variantes visuales" },
    { name: "Pilot Intake", status: "Deployment Readiness Locked", desc: "Inspección de 14 puntos de despliegue" },
    { name: "Pilot Handoff", status: "Secure Coordination Locked", desc: "Handoff técnico y sanitizado de pilotos" },
    { name: "External Binder", status: "Stakeholder Presentation Locked", desc: "Este módulo de auditoría de presentación externa validado" }
  ];

  // 9. Meeting Mode Suggestion Logic
  const meetingModes = [
    {
      id: "rapida-15",
      name: "Reunión Rápida de 15 Minutos",
      order: "Public Demo Hub (3m) ➔ EasyView (3m) ➔ Privacy Compliance (3m) ➔ Cierre y Próximo Paso (6m)",
      time: "3m Demo Hub / 3m EasyView / 3m Privacidad / 6m Preguntas",
      toSay: "ORBI Sentinel es un asistente inteligente local enfocado en reducir la fatiga de pantallas, respetando la privacidad.",
      toAvoid: "Evitar demostraciones de configuraciones de red complejas o detalles de switches Dahua.",
      close: "Sugerir el envío de la minuta ejecutiva sanitizada y agendar llamada técnica de seguimiento."
    },
    {
      id: "tecnica-30",
      name: "Reunión Técnica de 30 Minutos",
      order: "Gateway Local (5m) ➔ CCTV Diagnostics (5m) ➔ Dahua Protocol (10m) ➔ Pilot Intake (5m) ➔ Q&A (5m)",
      time: "5m Gateway / 5m Diagnóstico / 10m Protocolo / 5m Intake / 5m Q&A",
      toSay: "La arquitectura local simula un gateway local que descubre cámaras Dahua PoE LAN de forma pasiva y sanitizada.",
      toAvoid: "No ingresar credenciales SSH/Telnet reales ni prometer compatibilidad con APIs cerradas.",
      close: "Alinear el checklist de Pilot Intake y entregar el Handoff Pack en blanco para su revisión."
    },
    {
      id: "negocios-30",
      name: "Reunión de Negocios de 30 Minutos",
      order: "Executive Summary (5m) ➔ Product Line Cards (10m) ➔ Approved Claims (5m) ➔ Pilot Proposal (5m) ➔ Cierre (5m)",
      time: "5m Resumen / 10m Líneas / 5m Límites / 5m Propuesta / 5m Cierre",
      toSay: "ORBI Sentinel IA ayuda a los clientes a valorizar su CCTV mediante diagnóstico operacional y resguardo de privacidad.",
      toAvoid: "No dar precios definitivos ni prometer contratos automáticos. Todo se gestiona fuera de la demo.",
      close: "Agendar taller de levantamiento técnico mediante canales de comunicación autorizados externos."
    },
    {
      id: "comite-copropietarios",
      name: "Comité de Copropietarios (Condominio / Vecinos)",
      order: "Community Pilot (5m) ➔ Privacy Compliance (10m) ➔ EasyView (5m) ➔ Copropietarios Consent (5m) ➔ Q&A (5m)",
      time: "5m Dashboard / 10m Privacidad / 5m Conserjería / 5m Consentimiento / 5m Preguntas",
      toSay: "Nuestra prioridad absoluta es la privacidad de su hogar. Ningún vecino tiene acceso directo al video, todo se procesa localmente.",
      toAvoid: "Evitar prometer prevención de todo tipo de delitos o disputas vecinales.",
      close: "Entregar el modelo de consentimiento de protección de datos personales para la junta directiva."
    },
    {
      id: "comite-om",
      name: "Comité Técnico O&M (Industrial / HSE)",
      order: "Field Operations (5m) ➔ CCTV Diagnostics (10m) ➔ Incident Center (5m) ➔ Pilot Readiness (5m) ➔ Cierre (5m)",
      time: "5m Operaciones / 10m Diagnóstico / 5m Incidentes / 5m Readiness / 5m Cierre",
      toSay: "El software ayuda a reducir los tiempos de inspección en terreno al identificar anomalías de comunicación de la cámara.",
      toAvoid: "No sugerir la apertura física de tableros eléctricos ni intervenciones a sistemas SCADA.",
      close: "Coordinar visita de personal técnico calificado bajo normas HSE estrictas del cliente."
    },
    {
      id: "demo-completa",
      name: "Demo Comercial Completa (Pitch 45 minutos)",
      order: "Executive Summary (5m) ➔ Product Line Cards (10m) ➔ Full Demonstration of Field, Community & Consumer (20m) ➔ Q&A & Next Steps (10m)",
      time: "5m Resumen / 10m Líneas / 20m Demo Completa / 10m Cierre",
      toSay: "ORBI Sentinel IA es una suite integral que cubre tres líneas de producto con un enfoque 100% responsable y offline.",
      toAvoid: "Evitar promesas irresponsables de producción inmediata o contratos automáticos.",
      close: "Iniciar el proceso formal de Pilot Intake a través de los canales seguros de TI."
    },
    {
      id: "lab-cerrado",
      name: "Simulación de Laboratorio Cerrado (Taller técnico de 60 minutos)",
      order: "Dahua PoE Lab (15m) ➔ Eufy Consumer Bridge (15m) ➔ Gateway Configuration (15m) ➔ Sanitization Scanner Validation (15m)",
      time: "15m Dahua Lab / 15m Consumer Lab / 15m Gateway / 15m Scanner",
      toSay: "Esta simulación interactiva local demuestra la viabilidad de la integración física de CCTV de forma completamente segura.",
      toAvoid: "No utilizar IPs reales de producción de clientes ni compartir claves SSH.",
      close: "Registrar las bitácoras de pruebas técnicas preliminares de laboratorio en local."
    }
  ];

  const activeMeetingMode = meetingModes.find(m => m.id === meetingMode) || meetingModes[0];

  // 10. Copy Pack Data
  const getCopyPack = (key: string) => {
    switch (key) {
      case "exec":
        return `[ORBI SENTINEL IA v0.7.0] EXECUTIVE SUMMARY
--------------------------------------------------
ORBI Sentinel IA centraliza demostraciones de CCTV inteligente, incidentes, diagnóstico operacional, evidencia técnica de laboratorio y preparación de pilotos controlados para entornos Field, Community y Consumer. Funciona estrictamente bajo datos simulados/sanitizados, privacidad por diseño y límites responsables, sin almacenar credenciales, IPs de producción ni RTSP.`;
      
      case "field":
        return `[ORBI SENTINEL FIELD SUMMARY]
--------------------------------------------------
Diseñado para la supervisión y O&M de parques solares e infraestructura perimetral. Permite el monitoreo simplificado de estado de enlace de cámaras, registro de incidentes técnicos en terreno, bitácoras PoE de Dahua Protocol LAN y generación de reportes de evidencia. Operación máxima sugerida para pilotos: 1 a 3 cámaras bajo autorización formal del responsable fuera de la demo.`;

      case "community":
        return `[ORBI SENTINEL COMMUNITY SUMMARY]
--------------------------------------------------
Solución residencial para condominios enfocada en simplificar el rol de conserjería mediante vistas intuitivas (EasyView), disminuyendo la fatiga visual de vigilancia perimetral. Cuenta con resguardo ético de privacidad (Privacy Compliance Shield) que enmascara las zonas privadas y protege la identidad de copropietarios.`;

      case "consumer":
        return `[ORBI SENTINEL CONSUMER LAB SUMMARY]
--------------------------------------------------
Módulo de prueba de interoperabilidad de cámaras domésticas (como Eufy C220/E220) para almacenamiento en disco local NAS o transmisión RTSP controlada de laboratorio. Promueve la privacidad doméstica por defecto, evitando la transmisión de video a servidores externos ajenos a la instalación física de seguridad.`;

      case "limits":
        return `[ORBI SENTINEL RESPONSIBLE LIMITS]
--------------------------------------------------
LÍMITES RESPONSABLES DE OPERACIÓN:
- No detecta de forma infalible todos los robos ni intrusiones.
- No reemplaza guardias de seguridad, rondas físicas ni conserjería.
- No sustituye procedimientos HSE de O&M de plantas ni sistemas SCADA.
- No almacena contraseñas de red, claves SSH ni IPs de producción.
- No genera compromisos contractuales automáticos. Todo piloto requiere una coordinación física mediante canales externos de comunicación autorizados.`;

      case "pilot":
        return `[ORBI SENTINEL PILOT NEXT STEPS]
--------------------------------------------------
PRÓXIMOS PASOS RECOMENDADOS PARA PILOTOS CONTROLADOS:
1. Validar el inventario de cámaras y compatibilidad física mediante canales de TI autorizados.
2. Gestionar la Autorización Formal Documentada fuera de la demo mediante el cliente o responsable.
3. Configurar un entorno local cerrado de prueba (1 a 3 cámaras máximo).
4. No compartir credenciales, claves ni flujos de video reales por canales no seguros.`;

      case "credits":
        return `[ORBI SENTINEL IA — OFFICIAL CREDITS]
--------------------------------------------------
- Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
- Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
- Implementación asistida y optimización: Google AI Studio.
- Nota: ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.`;

      case "followup":
        return `ASUNTO: Minuta de Presentación y Próximos Pasos — ORBI Sentinel IA

Estimados Stakeholders,

Agradecemos su participación en la demostración interactiva de ORBI Sentinel IA. 
A continuación se detalla el resumen de lo expuesto para su revisión:

- Línea sugerida: ${activeAudience.line}
- Audiencia principal: ${activeAudience.name}
- Enfoque de reunión: ${activeMeetingMode.name}
- Mensaje clave: "${activeAudience.mainMsg}"
- Alcance sugerido para piloto: 1 a 3 cámaras perimetrales seleccionadas.

LÍMITES Y CONDICIONES DEL ENTORNO:
- Toda validación de credenciales, IPs de red local, flujos RTSP y protocolos físicos se coordina estrictamente fuera de la demo interactiva mediante canales formales de TI autorizados.
- ORBI Sentinel IA opera bajo un estado de 'Production Locked' y no almacena claves ni datos reales de clientes.
- Esta minuta es de carácter estrictamente informativo, técnico y preliminar. No representa la firma de un contrato automático ni validez jurídica definitiva.

Próximo paso acordado: "${activeAudience.nextStep}"

Atentamente,
Equipo de Operación de ORBI Sentinel IA
Ecosistema Tecnológico ORBI`;

      default:
        return "";
    }
  };

  const handleCopyText = (key: string) => {
    // Check if copy is disabled due to blocked status
    if (readiness.status === "Binder Blocked") {
      onAddAuditLog("Copia Bloqueada", `Intento de copiar pack '${key}' bloqueado debido a estado general: ${readiness.status}.`);
      alert(`La copia de información está deshabilitada porque el estado de seguridad general es ${readiness.status}. Por favor, verifique el QA Checklist.`);
      return;
    }

    const textToCopy = getCopyPack(key);
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    onAddAuditLog("Copiado de Brief", `Se copió al portapapeles el texto sanitizado: '${key}'`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // 11. Create Official Binder Report (Markdown/Text format)
  const getFullBinderReport = () => {
    return `==================================================================
ORBI SENTINEL IA — EXTERNAL STAKEHOLDER BINDER REPORT
==================================================================
Versión de Software: v0.7.1-sentinel-external-binder-presentation-lock
Estado de Validación: ${readiness.status}
Score de Readiness: ${readiness.score}%
Fecha de Generación: 2026-07-21 (Entorno Validado)
------------------------------------------------------------------

1. DETALLES DE AUDIENCIA SELECCIONADA
- Audiencia: ${activeAudience.name}
- Línea recomendada: ${activeAudience.line}
- Ruta sugerida: ${activeAudience.route} (${activeAudience.duration})
- Mensaje Principal: "${activeAudience.mainMsg}"
- Material a Mostrar: ${activeAudience.toShow}
- Evitar Conversar: ${activeAudience.toAvoid}
- Próximo Paso Sugerido: "${activeAudience.nextStep}"

2. MODO DE REUNIÓN DEFINIDO
- Tipo de Reunión: ${activeMeetingMode.name}
- Orden de Pantallas: ${activeMeetingMode.order}
- Distribución de Tiempo: ${activeMeetingMode.time}
- Lo que se Debe Decir: "${activeMeetingMode.toSay}"
- Lo que se Debe Evitar: "${activeMeetingMode.toAvoid}"
- Cierre Recomendado: "${activeMeetingMode.close}"

3. MATRIZ DE LOCKS DE VALIDACIÓN
${lockMatrix.map(l => `- [🔒 ${l.status}] ${l.name}: ${l.desc}`).join("\n")}

4. CLAIMS Y DECLARACIONES RESPONSABLES
 claims permitidos:
${approvedClaims.map(c => `  [✓] ${c}`).join("\n")}

 claims prohibidos (evitados en demo):
${forbiddenClaims.map(c => `  [✗] ${c}`).join("\n")}

5. NOTAS ADICIONALES SANITIZADAS
"${customNotes}"

6. CRÉDITOS OFICIALES
Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
Implementación asistida y optimización: Google AI Studio.

AVISO LEGAL IMPORTANTE:
Este reporte es preliminar, interno y no contractual. No representa viabilidad técnica definitiva, inversión aprobada ni reemplazo de sistemas de seguridad vigentes (NVR, guardias, SCADA, HSE). Toda coordinación se realiza mediante canales corporativos formales fuera de este entorno simulado.`;
  };

  const handleCopyFullReport = () => {
    if (readiness.status === "Binder Blocked") {
      alert(`No se puede generar ni copiar el reporte completo en estado: ${readiness.status}.`);
      return;
    }
    navigator.clipboard.writeText(getFullBinderReport());
    onAddAuditLog("Copiado Reporte Completo", "Se exportó el reporte unificado del External Stakeholder Binder.");
    setCopiedKey("full-report");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (userRole === "conserje") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-5 my-8" id="binder-conserje-locked">
        <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-black text-white uppercase tracking-tight">Acceso Restringido — Vista Informativa</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          El <strong>External Stakeholder Binder</strong> contiene material estratégico, matrices de conformidad y frentes de auditoría comercial reservados para Roles de Administración y Supervisión Técnica. Su perfil actual (Conserjería / Guardia) está limitado a la operación técnica en tiempo real de EasyView.
        </p>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-left space-y-2">
          <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">ESTADO DE PROTECCIÓN CONSERJERÍA:</span>
          <span className="text-xs font-mono text-slate-300 block">● External Binder Status: STAKEHOLDER PRESENTATION LOCKED</span>
          <span className="text-xs font-mono text-slate-300 block">● No Real Data, No Credentials, No IP/RTSP, No Contracts.</span>
        </div>
        <button
          onClick={() => setCurrentTab("publicdemohub")}
          className="mt-2 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold rounded-lg transition-all"
        >
          Volver al Demo Hub Público
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="external-stakeholder-binder-main">
      
      {/* 1. BINDER SAFETY BANNER */}
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
              Auditoría Externa de QA
            </span>
            <h2 className="text-xl font-black font-sans text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              External Stakeholder Binder & Presentation Matrix
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              <strong>Binder externo sanitizado:</strong> material de presentación controlada, sin datos reales, sin credenciales, sin IP/RTSP, sin contrato automático y sin producción habilitada. Diseñado para alinear expectativas con comités, gerentes de O&M, supervisores, integradores de CCTV y aliados comerciales de forma responsable.
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col items-end gap-1.5 font-mono">
            <span className="text-[10px] text-slate-500">MÓDULO 7A</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              Ready for Pitch
            </span>
            <button
              onClick={() => setCurrentTab("demodeckexport")}
              className="mt-2 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center gap-1 shrink-0 uppercase"
            >
              <span>Generar Demo Deck ➔</span>
            </button>
          </div>
        </div>

        {/* Safety Badges */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-800/80 mt-4">
          {[
            { label: "Controlled External Binder", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
            { label: "No Real Data", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
            { label: "No Credentials", bg: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
            { label: "No IP/RTSP", bg: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
            { label: "Non-Contractual", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold" },
            { label: "Production Locked", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold" },
            { label: "Responsible Claims", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
            { label: "ORBI Ecosystem", bg: "bg-slate-800 text-slate-300 border-slate-700" }
          ].map((badge, idx) => (
            <span key={idx} className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${badge.bg}`}>
              ● {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2. READINESS SCORE & MAIN OVERVIEW PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EXECUTIVE BINDER OVERVIEW */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PRESENTACIÓN GENERAL</span>
            <h3 className="text-base font-bold text-white">ORBI Sentinel IA — External Demo Binder</h3>
            
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              “ORBI Sentinel IA centraliza demostraciones de CCTV inteligente, incidentes, diagnóstico operacional, evidencia técnica de laboratorio y preparación de pilotos controlados para entornos Field, Community y Consumer, siempre bajo datos sanitizados, privacidad por diseño y límites responsables.”
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">¿Qué problema resuelve?</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Reduce la fatiga cognitiva del operario / conserje mediante asistencia visual inteligente y provee diagnóstico de red pasivo rápido (CCTV Diagnostics) para aislar caídas de enlace antes de movilizar recursos.
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">¿Qué se requiere para demostración?</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Solamente el entorno simulado y controlado del applet. No se requiere conexión a cámaras vivas, contraseñas de producción, ni IPs de infraestructura física. Todo el software corre offline de forma segura.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono italic">
              * Nota: Los pilotos se limitan a un rango sugerido de 1 a 3 cámaras perimetrales.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTab("publicdemohub")}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Volver al Demo Hub</span>
              </button>
              <button
                onClick={() => setCurrentTab("pilotintake")}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
              >
                <span>Ir a Pilot Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* READINESS SCORE PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">MATRIZ DE CONFORMIDAD</span>
            <h3 className="text-base font-bold text-white">External Binder Readiness</h3>

            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" 
                    className={readiness.status === "Binder Blocked" ? "text-rose-500" : "text-emerald-400"} 
                    fill="transparent" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * readiness.score) / 100} 
                  />
                </svg>
                <span className="absolute text-sm font-mono font-black text-white">{readiness.score}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Resultado de Auditoría:</span>
                <span className={`text-[11px] font-mono font-bold uppercase block leading-tight ${
                  readiness.status === "Binder Blocked" ? "text-rose-400" : "text-emerald-400"
                }`}>
                  {readiness.status}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {readiness.desc}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-amber-400 leading-normal font-sans">
              <strong>Aviso obligatorio:</strong> Este score es interno y preliminar. No representa aprobación contractual, factibilidad técnica final, inversión aprobada ni autorización de despliegue físico.
            </div>
          </div>
        </div>
      </div>

      {/* 3. STAKEHOLDER AUDIENCE SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stakeholder Audience Selector</h3>
            <p className="text-xs text-slate-400">Selecciona el perfil de tu audiencia para adaptar los mensajes comerciales, sugerencias de ruta y límites de la demostración.</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-bold shrink-0">
            Adaptabilidad Dinámica
          </span>
        </div>

        {/* Audience Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            const isSelected = selectedAudience === aud.id;
            return (
              <button
                key={aud.id}
                onClick={() => {
                  setSelectedAudience(aud.id);
                  onAddAuditLog("Selector Audiencia", `Binder: Cambiado a audiencia ${aud.name}`);
                }}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between gap-2.5 transition-all ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400 animate-ping" : "bg-transparent"}`} />
                </div>
                <span className="font-mono text-[10px] font-bold leading-tight truncate">{aud.name}</span>
              </button>
            );
          })}
        </div>

        {/* Customized Audience Info Card */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                AUDIENCIA ACTIVA: {activeAudience.name.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Mensaje Principal Recomendado:</span>
              <p className="text-sm font-sans font-medium text-white leading-relaxed">
                "{activeAudience.mainMsg}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Línea de Negocio Sugerida:</span>
                <span className="text-xs font-mono font-bold text-emerald-400 block">{activeAudience.line}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Ruta Oficial Recomendada:</span>
                <span className="text-xs font-mono font-bold text-sky-400 block">{activeAudience.route} ({activeAudience.duration})</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">✓ MATERIAL DE PRESENTACIÓN RECOMENDADO:</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeAudience.toShow}</p>
            </div>
          </div>

          <div className="space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-rose-400 font-bold block uppercase">⚠ EVITAR CONVERSAR / CLAIMS PROHIBIDOS:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-rose-500/5 p-2 rounded border border-rose-500/10">
                  {activeAudience.toAvoid}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">→ PRÓXIMO PASO SUGERIDO EN REUNIÓN:</span>
                <p className="text-[11px] text-slate-200 font-sans leading-relaxed font-semibold bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                  {activeAudience.nextStep}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic">
              * Nota: Asegurar que el interlocutor firme el acta formal fuera de la demostración.
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRODUCT LINE SUMMARY & LOCK MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PRODUCT LINE SUMMARY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">LÍNEAS DE PRODUCTO OFICIALES</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Line Summary</h3>

          <div className="space-y-3.5">
            {/* Sentinel Field */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-xs text-white">Sentinel Field</strong>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                    FIELD GUIDED DEMO LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Orientado a plantas industriales y parques solares (O&M, CCTV perimetral). Incluye el diagnóstico de interruptores Dahua PoE, simulación de cortes de enlace y bitácora técnica. Rango de piloto de 1 a 3 cámaras perimetrales autorizadas.
                </p>
              </div>
              <button 
                onClick={() => handleNavigateToTab("guidedfielddemo", "field")}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-[10px] rounded border border-slate-800 transition-all shrink-0 inline-flex items-center gap-1"
              >
                <span>Ver Demo Field</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Sentinel Community */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <strong className="text-xs text-white">Sentinel Community</strong>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold uppercase">
                    COMMUNITY GUIDED DEMO LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Orientado a condominios residenciales (Conserjería y Administración). Disminuye la fatiga mediante la interfaz simplificada EasyView e incorpora el resguardo estricto del Privacy Compliance Shield para zonas privadas.
                </p>
              </div>
              <button 
                onClick={() => handleNavigateToTab("guideddemo", "community")}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-[10px] rounded border border-slate-800 transition-all shrink-0 inline-flex items-center gap-1"
              >
                <span>Ver Demo Community</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Consumer Lab */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <strong className="text-xs text-white">Consumer Lab</strong>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase">
                    CONSUMER BRIDGE LAB
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Pruebas locales con cámaras domésticas (Eufy C220/E220) para transmisión RTSP controlada y almacenamiento en red local NAS, priorizando la privacidad del hogar por sobre las nubes públicas.
                </p>
              </div>
              <button 
                onClick={() => handleNavigateToTab("consumerbridge", "community")}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-[10px] rounded border border-slate-800 transition-all shrink-0 inline-flex items-center gap-1"
              >
                <span>Ver Consumer Bridge</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Launch Media Kit */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <strong className="text-xs text-white">Launch Media Kit</strong>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase">
                    COMMUNICATION LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Acceso unificado al material de prensa pre-aprobado y kit de comunicación institucional sanitizado para divulgación externa responsable de ORBI Sentinel IA.
                </p>
              </div>
              <button 
                onClick={() => handleNavigateToTab("launchmediakit")}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-[10px] rounded border border-slate-800 transition-all shrink-0 inline-flex items-center gap-1"
              >
                <span>Ver Media Kit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pilot Intake */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <strong className="text-xs text-white">Pilot Intake Form</strong>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                    DEPLOYMENT READINESS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Formulario de 14 puntos críticos de factibilidad y requisitos operacionales antes de entablar un piloto cerrado (de 1 a 3 cámaras).
                </p>
              </div>
              <button 
                onClick={() => handleNavigateToTab("pilotintake")}
                className="self-end sm:self-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-[10px] rounded border border-slate-800 transition-all shrink-0 inline-flex items-center gap-1"
              >
                <span>Ir a Pilot Intake</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* LOCK STATUS MATRIX */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">MATRIZ DE LOCKS OFICIALES</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lock Status Matrix</h3>

          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-[11px] font-mono">
            {lockMatrix.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <span className="text-slate-200 font-bold block truncate">{item.name}</span>
                  <span className="text-slate-500 text-[9px] block leading-tight">{item.desc}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MEETING MODE & OFFICIAL DEMO ROUTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MEETING MODE SELECTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">MODALIDAD DE REUNIÓN</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Meeting Mode</h3>
            </div>
            <Sliders className="w-4.5 h-4.5 text-emerald-400" />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Seleccione el tipo de reunión:</span>
              <select
                value={meetingMode}
                onChange={(e) => {
                  setMeetingMode(e.target.value);
                  onAddAuditLog("Modo Reunión", `Binder: Modo cambiado a ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40"
              >
                {meetingModes.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Meeting Advice */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">⚙ ORDEN DE PANTALLAS RECOMENDADO:</span>
                <p className="text-slate-200 font-mono leading-relaxed bg-slate-900 p-2 rounded border border-slate-800">
                  {activeMeetingMode.order}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Distribución de Tiempos:</span>
                  <span className="text-[11px] font-mono text-slate-300 block">{activeMeetingMode.time}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Cierre Sugerido:</span>
                  <span className="text-[11px] font-sans text-slate-300 block leading-tight">{activeMeetingMode.close}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400/90 font-bold block uppercase">✓ QUÉ DECIR (PERMITIDO):</span>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans italic">"{activeMeetingMode.toSay}"</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-rose-400/90 font-bold block uppercase">✗ QUÉ EVITAR (PROHIBIDO):</span>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans italic">"{activeMeetingMode.toAvoid}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL DEMO ROUTES PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">RUTAS INTERACTIVAS DE DEMO</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official Demo Routes Panel</h3>
            </div>
            <Compass className="w-4.5 h-4.5 text-sky-400" />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Seleccione la Ruta de Presentación:</span>
              <select
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  onAddAuditLog("Ruta de Demo", `Binder: Ruta de demo cambiada a ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/40"
              >
                <optgroup label="Demostración Pública (Public Demo)">
                  <option value="public-60s">Public Demo (60 Segundos Pitch)</option>
                  <option value="public-3m">Public Demo (3 Minutos Tour)</option>
                  <option value="public-5m">Public Demo (5 Minutos Deep)</option>
                </optgroup>
                <optgroup label="Línea Operativa (Field Route)">
                  <option value="field-3">Field Route (3 Minutos de Operación)</option>
                  <option value="field-5">Field Route (5 Minutos de Diagnóstico)</option>
                  <option value="field-10">Field Route (10 Minutos de Validación)</option>
                  <option value="field-15">Field Route (15 Minutos Técnico Completo)</option>
                </optgroup>
                <optgroup label="Línea Residencial (Community Route)">
                  <option value="community-3">Community Route (3 Minutos Inicial)</option>
                  <option value="community-5">Community Route (5 Minutos de Privacidad)</option>
                  <option value="community-10">Community Route (10 Minutos Completo)</option>
                </optgroup>
                <optgroup label="Grabación de Videos (Video Production)">
                  <option value="video-15s">Video (15 Segundos Intro)</option>
                  <option value="video-30s">Video (30 Segundos Funcional)</option>
                  <option value="video-60s">Video (60 Segundos Pitch Líneas)</option>
                  <option value="video-90s">Video (90 Segundos Recorrido)</option>
                </optgroup>
              </select>
            </div>

            {/* Dynamic Route Info Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Audiencia Sugerida:</span>
                  <strong className="text-slate-200 text-xs">{activeRouteData.aud}</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Pantalla Clave:</span>
                  <strong className="text-sky-400 text-xs font-mono">{activeRouteData.screen}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">✓ OBJETIVO Y MENSAJE CLAVE:</span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {activeRouteData.msg}
                </p>
              </div>

              <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-0.5">
                <span className="text-[9px] font-mono text-rose-400 font-bold uppercase block">⚠ RIESGO DE SOBREPROMESA:</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {activeRouteData.risk}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">Paso de acción recomendado:</span>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wide">
                  ➔ {activeRouteData.next}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. APPROVED CLAIMS VS FORBIDDEN CLAIMS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved claims */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">NARRATIVAS DE PRESENTACIÓN PERMITIDAS</span>
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5" />
            Approved Claims
          </h3>

          <div className="space-y-2 text-xs">
            {approvedClaims.map((claim, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2 bg-slate-950 rounded-lg border border-slate-850">
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold mt-0.5">
                  ✓
                </span>
                <span className="text-slate-300 font-sans leading-relaxed">{claim}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Forbidden claims */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">LIMITACIONES COMERCIALES STRICTU SENSU</span>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5" />
            Forbidden Claims (Prohibidos / Evitados)
          </h3>

          <div className="space-y-2 text-xs">
            {forbiddenClaims.map((claim, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2 bg-slate-950 rounded-lg border border-slate-850">
                <span className="w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold mt-0.5">
                  ✗
                </span>
                <span className="text-slate-300 font-sans leading-relaxed">{claim}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. MEETING FOLLOW-UP & SANITIZATION SCANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERACTIVE SANITIZATION SCANNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">MONITOR DE PRIVACIDAD</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Binder Sanitization Scanner</h3>
              </div>
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Notas y Observaciones de la Reunión (Live Scan):</span>
              <textarea
                value={customNotes}
                onChange={(e) => {
                  setCustomNotes(e.target.value);
                }}
                placeholder="Escribe comentarios de la reunión..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-28 focus:outline-none focus:border-emerald-500/40 resize-none font-sans"
              />
            </div>

            {/* Scan output Widget */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Estado del Escáner de Sanitización:</span>
              {scanStatus.clean ? (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Estado: CLEAN / Sanitizado
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    Estado: NEEDS SANITIZATION
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] text-rose-300 font-mono">
                    {scanStatus.findings.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setCustomNotes(scanStatus.suggestedText);
                      onAddAuditLog("Sanitización Forzada", "Se aplicó el auto-reemplazo del escáner en el Binder.");
                    }}
                    className="w-full py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/20 text-[10px] font-mono font-bold rounded uppercase transition-all"
                  >
                    Aplicar Auto-Sanitizado Sugerido
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-400 font-mono leading-normal">
            <strong>Escáner perimetral:</strong> Busca automáticamente correos, números, IPs locales, credenciales de router, RTSP y claims desmedidos para prevenir cualquier fuga en reuniones.
          </div>
        </div>

        {/* BINDER COPY PACK & FOLLOW-UP */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PAQUETE DE TEXTOS APROBADOS COPIABLES</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Binder Copy Pack</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Col Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Resúmenes por Línea:</span>
              
              {[
                { id: "exec", label: "Executive Summary", desc: "Pitch corto del software en formato corporativo" },
                { id: "field", label: "Field Line Summary", desc: "Resumen técnico de O&M perimetral" },
                { id: "community", label: "Community Line Summary", desc: "Resumen residencial y Privacy Shield" },
                { id: "consumer", label: "Consumer Lab Summary", desc: "Integración local doméstica WiFi" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCopyText(item.id)}
                  className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/20 transition-all flex justify-between items-start gap-3"
                >
                  <div className="space-y-0.5">
                    <strong className="text-xs text-slate-200 block">{item.label}</strong>
                    <span className="text-[9.5px] text-slate-400 block leading-tight">{item.desc}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                    {copiedKey === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Col Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Minutas, Límites y Seguros:</span>

              {[
                { id: "limits", label: "Responsible Limits Summary", desc: "Declaración estricta de no-infalibilidad" },
                { id: "pilot", label: "Pilot Next Steps Summary", desc: "Próximos pasos de 1 a 3 cámaras perimetrales" },
                { id: "credits", label: "Official Credits Summary", desc: "Créditos oficiales de creación y universo" },
                { id: "followup", label: "Meeting Follow-up Template", desc: "Plantilla formal de minuta post-reunión" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCopyText(item.id)}
                  className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/20 transition-all flex justify-between items-start gap-3"
                >
                  <div className="space-y-0.5">
                    <strong className="text-xs text-slate-200 block">{item.label}</strong>
                    <span className="text-[9.5px] text-slate-400 block leading-tight">{item.desc}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                    {copiedKey === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Integrated Media Kit Text */}
          {mediaKitContent && (
            <div className="mt-4 p-3.5 bg-sky-950/20 border border-sky-500/20 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">CONTENIDO ENVIADO DESDE LAUNCH MEDIA KIT</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mediaKitContent);
                    setCopiedKey("mediakit-shared");
                    onAddAuditLog("Copiado Media Kit Integrado", "Se copió el brief compartido de Media Kit.");
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 shrink-0"
                >
                  {copiedKey === "mediakit-shared" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-sans italic leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
                "{mediaKitContent}"
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">
              * Nota: Todos los textos copiables se encuentran estrictamente sanitizados.
            </span>
            <button
              onClick={handleCopyFullReport}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1.5"
            >
              {copiedKey === "full-report" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Reporte Copiado</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generar & Copiar Reporte Completo Binder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 8. BINDER QA CHECKLIST & AUDITOR BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* QA CHECKLIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">AUDITORÍA FINAL DEL PRESENTADOR</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">External Binder QA Checklist</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { id: "noRealData", label: "No Real Data", desc: "No se exponen nombres ni datos reales de clientes" },
              { id: "noCredentials", label: "No Credentials", desc: "No se almacenan contraseñas de cámaras o routers" },
              { id: "noIpRtsp", label: "No IP/RTSP", desc: "No se exponen direcciones de red ni flujos vivos" },
              { id: "noPii", label: "No PII", desc: "Emails y teléfonos sanitizados en todos los packs" },
              { id: "responsibleClaims", label: "Responsible Claims Checked", desc: "No se promete infalibilidad ni reemplazos directos de guardias" },
              { id: "productionLockedVisible", label: "Production Locked Visible", desc: "El badge de producción bloqueada está visible" },
              { id: "creditsVisible", label: "Official Credits Visible", desc: "Los créditos del Ecosistema ORBI están presentados" },
              { id: "audienceSelected", label: "Audience Selected", desc: "Se ha seleccionado la audiencia de la reunión" },
              { id: "meetingModeSelected", label: "Meeting Mode Selected", desc: "Se ha adaptado la orden de pantallas y tiempos" },
              { id: "followUpSanitized", label: "Follow-up Sanitized", desc: "La minuta post-reunión está limpia de secretos" },
              { id: "copyPackSanitized", label: "Copy Pack Sanitized", desc: "El paquete de copias no contiene lenguaje contractual" },
              { id: "nextStepDefined", label: "Next Step Defined", desc: "Se guía estrictamente hacia el Pilot Intake" },
              { id: "readmeUpdated", label: "README Updated", desc: "Bitácora técnica documentada en el repositorio" },
              { id: "versionRegistryUpdated", label: "Version Registry Updated", desc: "Registro de versión v0.7.0 homologado" }
            ].map((item) => {
              const checked = qaChecklist[item.id as keyof typeof qaChecklist];
              const isCritical = ["noRealData", "noCredentials", "noIpRtsp", "responsibleClaims"].includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleQA(item.id as keyof typeof qaChecklist)}
                    className="mt-1 accent-emerald-500 shrink-0"
                  />
                  <div className="space-y-0.5 leading-tight text-[11px]">
                    <span className="text-slate-200 block font-bold">
                      {item.label} {isCritical && <span className="text-rose-400 font-mono text-[9px] uppercase font-black shrink-0">[CRÍTICO]</span>}
                    </span>
                    <span className="text-slate-500 text-[10px] block">{item.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* OFFICIAL CREDITS PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">CRÉDITOS DE LA PLATAFORMA</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-emerald-400" />
              Official Credits Panel
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Concepto, Dirección y Universo:</span>
                <strong className="text-slate-200 block">Víctor M. León / ORBI Ecosystem</strong>
              </div>
              
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Co-diseño y QA de Fases:</span>
                <strong className="text-slate-200 block">ChatGPT / OpenAI (v4/v5/v6)</strong>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Implementación & Optimización:</span>
                <strong className="text-slate-200 block">Google AI Studio</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60">
            <p className="text-[10px] font-sans leading-normal italic text-slate-400">
              “ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.”
            </p>
          </div>
        </div>
      </div>

      {/* 9. EXTERNAL BINDER QA LOCK BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" id="binder-qa-lock-board">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">MATRIZ DE VALIDACIÓN MÓDULO 7B</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              External Binder QA Lock
            </h3>
            <p className="text-xs text-slate-400">
              Auditoría en tiempo real sobre los 10 frentes regulatorios de la presentación externa. El estado final se bloquea automáticamente si falla alguna validación crítica.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 font-mono">
            <span className="text-[9px] text-slate-500">VERSION RESUMIDA</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
              v0.7.1-presentation-lock
            </span>
          </div>
        </div>

        {/* Global Presentation Status Banner */}
        {readiness.status === "External Binder Stakeholder Presentation Locked" && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3.5" id="qa-lock-status-locked">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">ESTADO FINAL DE VALIDACIÓN:</span>
              <strong className="text-sm text-white uppercase tracking-tight block">
                External Binder Stakeholder Presentation Locked 🔒
              </strong>
              <p className="text-[11px] text-slate-300">
                Todos los frentes regulatorios están conformes y sanitizados. El material está validado para reuniones comerciales y comités ejecutivos oficiales.
              </p>
            </div>
          </div>
        )}

        {readiness.status === "Needs Review" && (
          <div className="bg-amber-500/10 border-2 border-amber-500/60 rounded-xl p-4 flex items-center gap-3.5" id="qa-lock-status-review">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">ESTADO FINAL DE VALIDACIÓN:</span>
              <strong className="text-sm text-white uppercase tracking-tight block">
                Needs Review (Revisión de Cumplimiento Requerida) ⚠️
              </strong>
              <p className="text-[11px] text-slate-300">
                Se requiere marcar la totalidad de los frentes regulatorios en el QA Checklist e ingresar notas libres de información sensible para validar la presentación.
              </p>
            </div>
          </div>
        )}

        {readiness.status === "Binder Blocked" && (
          <div className="bg-rose-500/10 border-2 border-rose-500 rounded-xl p-4 flex items-center gap-3.5" id="qa-lock-status-blocked">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider block">ESTADO FINAL DE VALIDACIÓN:</span>
              <strong className="text-sm text-white uppercase tracking-tight block">
                Binder Blocked (Presentación Bloqueada) 🚫
              </strong>
              <p className="text-[11px] text-slate-300">
                Frente crítico inhabilitado o filtración de datos/claims prohibidos detectados en notas. Las funciones de copia y exportación de reportes están suspendidas temporalmente.
              </p>
            </div>
          </div>
        )}

        {/* 10 Audit Fronts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {frentes.map((frente) => {
            const status = getFrenteStatus(frente.id);
            const badgeClass =
              status === "Ready"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : status === "Needs Review"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20";

            return (
              <div
                key={frente.id}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-800 transition-all gap-4"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {frente.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {frente.desc}
                  </span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border shrink-0 ${badgeClass}`}>
                  ● {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );

  // Helper inside component to navigate tabs
  function handleNavigateToTab(tabId: string, line?: "field" | "community") {
    onAddAuditLog("Navegación Binder", `Navegando a la pestaña ${tabId} desde Stakeholder Binder.`);
    setCurrentTab(tabId);
  }
}
