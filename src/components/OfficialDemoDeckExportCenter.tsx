import React, { useState, useEffect } from "react";
import { VERSION_REGISTRY } from "../data";
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
  BookOpen,
  Printer,
  X,
  FileVideo,
  Terminal,
  FileCode,
  ClipboardList,
  AlertOctagon,
  Lock
} from "lucide-react";

interface OfficialDemoDeckExportCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function OfficialDemoDeckExportCenter({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: OfficialDemoDeckExportCenterProps) {
  // 1. Package Selectors
  const [selectedPackage, setSelectedPackage] = useState<string>("deck");
  const [selectedAudience, setSelectedAudience] = useState<string>("gerente-om");
  const [selectedContext, setSelectedContext] = useState<string>("reunion-tecnica");
  const [activeViewMode, setActiveViewMode] = useState<"presentation" | "print" | "onepager" | "brief" | "markdown" | "readiness" | "qalock">("presentation");
  
  // Custom notes that can be added to exports and must be scanned
  const [customNotes, setCustomNotes] = useState<string>(
    "Reunión de alineación de expectativas operacionales en base a la línea Sentinel Field. Pruebas de laboratorio controladas de 1 a 3 cámaras perimetrales sujetas a factibilidad física."
  );

  // Active slide in the 13-slide preview
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Success states for copies
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (key: string, textToCopy: string) => {
    if (isExportBlocked) return;
    navigator.clipboard.writeText(textToCopy);
    setCopyStates(prev => ({ ...prev, [key]: true }));
    onAddAuditLog("Exportación Controlada", `Copiado contenido del paquete: ${key}`);
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // 1B. Official Export QA Lock (10 frentes de auditoría)
  const [frontsStatus, setFrontsStatus] = useState<Record<string, "Ready" | "Needs Review" | "Blocked">>({
    safetyBanner: "Ready",
    packageSelector: "Ready",
    audienceSelector: "Ready",
    deckBuilder: "Ready",
    onePager: "Ready",
    technicalBrief: "Ready",
    pilotSummary: "Ready",
    claimsPanel: "Ready",
    exportScanner: "Ready",
    controlsReports: "Ready"
  });

  const cycleFrontStatus = (key: string) => {
    const statusCycle: ("Ready" | "Needs Review" | "Blocked")[] = ["Ready", "Needs Review", "Blocked"];
    const currentIdx = statusCycle.indexOf(frontsStatus[key]);
    const nextIdx = (currentIdx + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIdx];
    setFrontsStatus(prev => ({ ...prev, [key]: nextStatus }));
    onAddAuditLog("Auditoría Frontal QA", `Frente de auditoría '${key}' cambiado a ${nextStatus}`);
  };

  // 2. Interactive QA Checklist (16 points required)
  const [qaChecklist, setQaChecklist] = useState({
    noRealData: true,
    noCredentials: true,
    noIpRtsp: true,
    noPii: true,
    responsibleClaims: true,
    nonContractualVisible: true,
    productionLockedVisible: true,
    creditsVisible: true,
    packageSelected: true,
    audienceSelected: true,
    scannerClean: true,
    printViewSanitized: true,
    noSourceCodeExported: true,
    noInternalPromptsExported: true,
    readmeUpdated: true,
    versionRegistryUpdated: true
  });

  const toggleChecklist = (key: keyof typeof qaChecklist) => {
    const newVal = !qaChecklist[key];
    setQaChecklist(prev => ({ ...prev, [key]: newVal }));
    onAddAuditLog(
      "Auditoría Export",
      `Punto de control de exportación '${String(key)}' cambiado a ${newVal ? "Verificado" : "Pendiente"}`
    );
  };

  // 3. Sanitization Scanner Logic
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
      findings.push("Detección de número telefónico (PII)");
      suggested = suggested.replace(phoneRegex, "[TELEFONO_SANITIZADO]");
      clean = false;
    }

    // IP regex
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    if (ipRegex.test(textToScan)) {
      findings.push("Detección de dirección IP de red");
      suggested = suggested.replace(ipRegex, "[IP_SANITIZADA]");
      clean = false;
    }

    // RTSP protocol
    if (textToScan.toLowerCase().includes("rtsp://")) {
      findings.push("Detección de protocolo RTSP");
      suggested = suggested.replace(/rtsp:\/\/[^\s]+/gi, "rtsp://[RTSP_STREAM_SANITIZADO]");
      clean = false;
    }

    // Username:password credentials
    const credsRegex = /\b\w+:\w+\b/g;
    const credsMatch = textToScan.match(credsRegex);
    if (credsMatch) {
      const likelyCreds = credsMatch.filter(m => {
        const parts = m.split(':');
        if (!isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) return false;
        if (parts[0].toLowerCase().includes("slide") || parts[0].toLowerCase().includes("id")) return false;
        return true;
      });
      if (likelyCreds.length > 0) {
        findings.push(`Posible credencial usuario:clave detectada (${likelyCreds.join(", ")})`);
        clean = false;
      }
    }

    // Source code pattern
    const sourceCodeKeywords = ["function ", "const ", "import ", "class ", "public void ", "def ", "select * from"];
    const foundCode = sourceCodeKeywords.filter(keyword => textToScan.toLowerCase().includes(keyword));
    if (foundCode.length > 0) {
      findings.push(`Posible fragmento de código fuente detectado (${foundCode.join(", ")})`);
      clean = false;
    }

    // Internal prompt pattern
    const promptKeywords = ["system prompt", "agent instructions", "instrucciones del sistema", "eres un asistente"];
    const foundPrompt = promptKeywords.filter(keyword => textToScan.toLowerCase().includes(keyword));
    if (foundPrompt.length > 0) {
      findings.push(`Posible referencia a prompts internos del sistema detectada (${foundPrompt.join(", ")})`);
      clean = false;
    }

    // Password keywords
    const secretKeywords = ["password", "contraseña", "clave", "token", "key=", "secret", "coordenadas", "coordenada", "latitud", "longitud"];
    const foundKeywords = secretKeywords.filter(keyword => textToScan.toLowerCase().includes(keyword));
    if (foundKeywords.length > 0) {
      findings.push(`Posible secreto o coordenada detectado (${foundKeywords.join(", ")})`);
      clean = false;
    }

    // Forbidden Claims
    forbiddenClaimsText.forEach(claim => {
      if (textToScan.toLowerCase().includes(claim.key)) {
        findings.push(`Reclamo absoluto prohibido: "${claim.label}"`);
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

  // Update checklist item automatically if scanner is clean
  useEffect(() => {
    setQaChecklist(prev => ({ ...prev, scannerClean: scanStatus.clean }));
  }, [scanStatus.clean]);

  // 4. Critical Block Rules
  const criticalSafetyFailure = 
    !qaChecklist.noRealData || 
    !qaChecklist.noCredentials || 
    !qaChecklist.noIpRtsp || 
    !qaChecklist.noPii || 
    !qaChecklist.responsibleClaims || 
    !qaChecklist.noSourceCodeExported || 
    !qaChecklist.noInternalPromptsExported ||
    !qaChecklist.nonContractualVisible ||
    !qaChecklist.productionLockedVisible;
  const isExportBlocked = criticalSafetyFailure || !scanStatus.clean || Object.values(frontsStatus).some(status => status === "Blocked");

  // Global QA Lock Status
  const getGlobalLockStatus = () => {
    if (isExportBlocked) {
      return { status: "Export Blocked" as const, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "EXPORT BLOCKED" };
    }
    
    const anyNeedsReview = Object.values(frontsStatus).some(s => s === "Needs Review");
    const allChecked = Object.values(qaChecklist).every(Boolean);
    
    if (anyNeedsReview || !allChecked) {
      return { status: "Needs Review" as const, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "NEEDS REVIEW" };
    }
    
    return { status: "Official Export Package Locked" as const, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "OFFICIAL EXPORT PACKAGE LOCKED" };
  };

  const globalLock = getGlobalLockStatus();

  // 5. Packages Meta Information
  const packages = [
    {
      id: "onepager",
      name: "Executive One-Pager",
      audience: "Director General, Inversionistas, Alta Dirección",
      content: "Resumen gerencial de alto nivel, problemas críticos de CCTV solar/condominio, solución modular, estado de madurez, límites de software y próximos pasos técnicos.",
      exclude: "Diagramas de puerto PoE, IPs de switches, flujos RTSP de prueba, código fuente y cotizaciones fijas.",
      usage: "Presentaciones iniciales, divulgación conceptual ágil y folletos institucionales.",
      notUsage: "Formularios de contratación, compromisos contractuales de nivel de servicio (SLA) o manuales técnicos.",
      detail: "Compacto (1 página)",
      sanitation: "Sanitizado estricto"
    },
    {
      id: "deck",
      name: "Official Demo Deck",
      audience: "Gerentes de Operaciones, Comités, Proveedores de CCTV",
      content: "Presentación interactiva de 13 diapositivas cubriendo la suite completa (Field, Community, Consumer), mitigación de falsas alarmas, diseño de privacidad y alcance del piloto.",
      exclude: "Direcciones físicas de servidores de prueba, credenciales codificadas en duro o promesas de detección 100% autónoma.",
      usage: "Presentaciones comerciales virtuales o proyectadas de 15 a 30 minutos.",
      notUsage: "Documentación comercial definitiva o validación de consistencia técnica de evidencias.",
      detail: "Completo (13 Diapositivas)",
      sanitation: "Sanitizado estricto"
    },
    {
      id: "brief",
      name: "Technical Brief",
      audience: "Gerentes de TI, Ingenieros Preventa, Instaladores",
      content: "Arquitectura conceptual pasiva (Edge Gateway local), protocolos LAN simulados, flujos offline, enmascaramiento dinámico e integridad criptográfica local.",
      exclude: "Código fuente propietario, secretos criptográficos, prompts internos de IA o endpoints de APIs.",
      usage: "Reuniones de viabilidad de red privada, análisis de ciberseguridad corporativa inicial.",
      notUsage: "Planos de montaje físico final, guías de instalación SSH o accesos root.",
      detail: "Técnico Sanitizado (Intermedio)",
      sanitation: "Sanitizado estricto"
    },
    {
      id: "readiness",
      name: "Pilot Readiness Summary",
      audience: "Supervisores HSE, Jefes de Planta Solar, Comités Vecinales",
      content: "Esquema preliminar de piloto acotado (1 a 3 cámaras perimetrales autorizadas), checklist de requisitos, matriz de riesgos operacionales y handoff sanitizado.",
      exclude: "Convenios vinculantes, autorización legal automática de grabación pública o promesas de soporte inmediato.",
      usage: "Preparación de levantamiento técnico físico en terreno previo a piloto.",
      notUsage: "Contrato firmado, sustituto de inducción oficial HSE o permiso municipal.",
      detail: "Operacional (Acotado)",
      sanitation: "Sanitizado estricto"
    },
    {
      id: "followup",
      name: "Stakeholder Follow-up Pack",
      audience: "Clientes potenciales, Directores de seguridad, Administradores",
      content: "Minutas de reunión sanitizadas, checklist de pilotaje acotado, acuerdos técnicos de confidencialidad preliminar, glosario del Ecosistema ORBI.",
      exclude: "Código de automatizaciones, credenciales de administración de cámaras, flujos de video RTSP reales, cotizaciones de precios fijos.",
      usage: "Seguimiento post-reunión, soporte de alineación comercial preliminar.",
      notUsage: "Anexo contractual, firma automática de contratos o aprobación presupuestaria definitiva.",
      detail: "Intermedio (Minutas)",
      sanitation: "Sanitizado estricto"
    },
    {
      id: "fullpackage",
      name: "Full External Demo Package",
      audience: "Comité de Tecnología del Cliente, Gerencia HSE/O&M",
      content: "Compilación completa de Executive One-Pager, Official Demo Deck, Technical Brief, y Pilot Readiness Summary.",
      exclude: "Código fuente propietario, prompts internos del sistema, secretos de infraestructura profunda del Ecosistema ORBI.",
      usage: "Debida diligencia técnica integral, revisión formal de arquitectura por TI del cliente.",
      notUsage: "Instalación automática, cotizaciones cerradas, validez probatoria judicial autónoma.",
      detail: "Integral (Todos los Paquetes)",
      sanitation: "Sanitizado estricto"
    }
  ];

  const currentPackageMeta = packages.find(p => p.id === selectedPackage) || packages[1];

  // 6. Audiences Metadata
  const audiences = [
    { id: "gerente-om", name: "Gerente de O&M (Industrial)", line: "Sentinel Field", goal: "Optimización de diagnóstico pasivo de cámaras sin intervenir SCADA" },
    { id: "jefe-planta", name: "Jefe de Planta Solar", line: "Sentinel Field", goal: "Reducción de tiempos de resolución de enlaces e intermitencia por paneles" },
    { id: "supervisor-tecnico", name: "Supervisor Técnico CCTV", line: "Dahua Lab / Sentinel Gateway", goal: "Validación de compatibilidad física de firmware y protocolos Dahua" },
    { id: "proveedor-cctv", name: "Integrador / Proveedor CCTV", line: "Ecosistema Cooperativo", goal: "Suma de valor agregado analítico sobre NVRs existentes de fábrica" },
    { id: "seguridad-fisica", name: "Guardia / Seguridad Física", line: "EasyView Conserjería", goal: "Reducción del cansancio por visualización repetitiva de pantallas" },
    { id: "comite-condominio", name: "Comité de Copropietarios", line: "Sentinel Community", goal: "Seguridad perimetral residencial con resguardo del 100% de privacidad" },
    { id: "administracion-residencial", name: "Administrador de Condominio", line: "Sentinel Community", goal: "Trazabilidad de portones vehiculares abiertos e incidentes sin multas ciegas" },
    { id: "prevencionista-hse", name: "Supervisor HSE / Prevencionista", line: "Sentinel Field HSE", goal: "Monitoreo perimetral en zonas de alto riesgo respetando regulaciones" },
    { id: "socio-inversionista", name: "Socio / Inversionista Estratégico", line: "Roadmap Completo", goal: "Sustentabilidad técnica, baja fricción legal y modularidad de código" },
    { id: "aliado-tecnologico", name: "Aliado Tecnológico / Desarrollador", line: "Sentinel API", goal: "Interoperabilidad local, emulación ONVIF y microservicios locales" },
    { id: "demo-publica", name: "Prensa / Divulgación Pública", line: "Public Demo Hub", goal: "Comunicación responsable de IA local para resguardo civil y ético" }
  ];

  // Contexts Metadata
  const contexts = [
    { id: "reunion-ejecutiva", name: "Reunión Ejecutiva (Alta Dirección)", duration: "5 Minutos", focus: "Mitigación de riesgos y sustentabilidad modular" },
    { id: "reunion-tecnica", name: "Reunión de Levantamiento Técnico", duration: "15 Minutos", focus: "Compatibilidades Dahua LAN y Gateway offline" },
    { id: "comite-residencial", name: "Comité de Vecinos / Asamblea", duration: "10 Minutos", focus: "Privacy by Design y consentimiento informado" },
    { id: "om-field", name: "Comité O&M Field Solar", duration: "10 Minutos", focus: "Trazabilidad de ping de cámaras y análisis pasivo" },
    { id: "proveedor-cctv", name: "Alineación de Integradores", duration: "15 Minutos", focus: "Respeto a las garantías del fabricante y no sustitución de NVR" },
    { id: "inversionista", name: "Debida Diligencia Tecnológica", duration: "30 Minutos", focus: "Locks de madurez en MVP Freeze y ventaja offline" },
    { id: "video-publico", name: "Divulgación o Video de Marca", duration: "1 Minuto", focus: "Créditos del Ecosistema y estado simulado transparente" },
    { id: "follow-up", name: "Minuta de Seguimiento Técnico", duration: "N/A", focus: "Checklist de Pilot Intake para iniciar levantamientos" }
  ];

  // 7. Official 13-Slide Content
  const deckSlides = [
    {
      title: "Slide 1: ORBI Sentinel IA",
      subtitle: "Asistencia de Diagnóstico de CCTV Perimetral Inteligente Local",
      bullets: [
        "Plataforma de simulación de alta fidelidad para el diagnóstico operacional.",
        "Procesamiento 100% offline en el borde (Edge) mediante Sentinel Gateway.",
        "Fases iniciales focalizadas en el resguardo de la privacidad y gobernanza responsable."
      ],
      legalDisclaimer: "Controlled Demo — Sin Datos Reales — Production Locked."
    },
    {
      title: "Slide 2: El Problema de la Vigilancia Perimetral",
      subtitle: "Fragmentación Técnica y Fatiga de Operación",
      bullets: [
        "Incapacidad de auditar la salud de red y ping de cámaras de manera continua.",
        "Saturación de falsas alarmas provocadas por vegetación, viento y animales.",
        "Acceso no autorizado al stream de video por pérdida de claves de fábrica."
      ],
      legalDisclaimer: "El diagnóstico de salud se realiza de forma pasiva a nivel de Gateway local."
    },
    {
      title: "Slide 3: Solución ORBI Sentinel IA",
      subtitle: "Privacy by Design y Diagnóstico de Alta Fidelidad",
      bullets: [
        "Arquitectura modular dividida en tres familias: Field, Community y Consumer.",
        "Módulo de Privacy Compliance con enmascaramiento y borrado automático de PII.",
        "Algoritmos de asistencia supervisada que reducen la carga cognitiva del guardia."
      ],
      legalDisclaimer: "No garantiza detección absoluta de robos; asiste en la identificación de anomalías."
    },
    {
      title: "Slide 4: Líneas de Producto ORBI Sentinel IA",
      subtitle: "Enfoque Adaptativo para Cada Necesidad Perimetral",
      bullets: [
        "Sentinel Field: Diseñado para plantas fotovoltaicas (PMGD) e instalaciones industriales.",
        "Sentinel Community: Ajustado para conserjerías residenciales y administración de condominios.",
        "Consumer Lab: Puentes locales (Eufy) y almacenamiento privado de nivel doméstico."
      ],
      legalDisclaimer: "Las líneas operan de forma independiente y aislada de redes en la nube pública."
    },
    {
      title: "Slide 5: Sentinel Field - Infraestructura Industrial",
      subtitle: "Operación de CCTV Solar en Parques Fotovoltaicos",
      bullets: [
        "Identificación pasiva de intermitencias de señal por movimiento de paneles solares.",
        "Módulo de CCTV Diagnostics para mapeo de ping, FPS y latencias de switch PoE.",
        "Coordinación de pruebas técnicas preliminares limitadas de 1 a 3 cámaras perimetrales."
      ],
      legalDisclaimer: "No reemplaza sistemas SCADA principales ni altera las rondas de guardias físicos."
    },
    {
      title: "Slide 6: Sentinel Community - Convivencia Residencial",
      subtitle: "Seguridad Perimetral para Copropiedades y Condominios",
      bullets: [
        "Consola simplificada EasyView para conserjes con botones de alerta táctiles.",
        "Bitácora histórica protegida de incidentes de seguridad (Incident Center).",
        "Reglamento de privacidad y enmascaramiento dinámico de veredas públicas."
      ],
      legalDisclaimer: "No transmite transmisiones a celulares de residentes ni reemplaza la labor del conserje."
    },
    {
      title: "Slide 7: Consumer Lab - Integración Doméstica",
      subtitle: "Monitoreo Inteligente de Cámaras Locales en el Hogar",
      bullets: [
        "Eufy Consumer Bridge para redirección del stream local sin dependencias cloud.",
        "Almacenamiento de respaldo en servidores NAS 100% privados offline.",
        "Limitación de compatibilidad con APIs de terceros que expongan datos sensibles."
      ],
      legalDisclaimer: "La compatibilidad está sujeta a la habilitación manual de protocolos locales."
    },
    {
      title: "Slide 8: Seguridad y Privacidad por Defecto",
      subtitle: "Sanitización Absoluta de Datos en la Demostración",
      bullets: [
        "Completo aislamiento de red local sin conexiones salientes a Internet.",
        "Redacción estricta de direcciones IP, credenciales de administración y PII.",
        "Scanner reactivo en caliente que bloquea el portapapeles si detecta secretos."
      ],
      legalDisclaimer: "Cero datos reales en el entorno de pruebas. Toda la información presentada es simulada."
    },
    {
      title: "Slide 9: Ruta de Demostración Controlada",
      subtitle: "Flujo de Validación Tecnológica por Etapas",
      bullets: [
        "Etapa 1: Public Demo Hub para validaciones ejecutivas y del ecosistema.",
        "Etapa 2: Guided Demos para entrenar a presentadores con guiones por tiempo.",
        "Etapa 3: Pilot Intake Center para analizar la factibilidad de red de pilotos."
      ],
      legalDisclaimer: "La navegación está libre de riesgos comerciales o compromisos de instalación."
    },
    {
      title: "Slide 10: Propuesta de Piloto Controlado Responsable",
      subtitle: "Esquema Acotado y Seguro de Pruebas Físicas",
      bullets: [
        "Pruebas iniciales limitadas estrictamente de 1 a 3 cámaras perimetrales existentes.",
        "Aislamiento total del tráfico local dentro de una VLAN aislada y controlada.",
        "Alineación formal de requisitos de instalación física mediante Handoff Pack."
      ],
      legalDisclaimer: "Requiere autorización expresa y firmada del cliente antes de cualquier conexión física."
    },
    {
      title: "Slide 11: Límites Operacionales de la Tecnología",
      subtitle: "Gobernanza Ética y Control del Riesgo Comercial",
      bullets: [
        "La inteligencia artificial es un asistente de apoyo; no es infalible ni autónoma.",
        "El software no reemplaza el equipamiento de NVR del integrador ni su garantía.",
        "No se incluye validez de prueba forense sin la participación de un ministro de fe."
      ],
      legalDisclaimer: "No constituye un blindaje legal absoluto ni promete la prevención total de delitos."
    },
    {
      title: "Slide 12: Próximos Pasos Técnicos Sugeridos",
      subtitle: "Canales de Coordinación y Requisitos Formales",
      bullets: [
        "Completar el cuestionario de Pilot Intake Center para verificar factibilidad de switches.",
        "Revisión en conjunto del borrador de consentimiento de protección de datos.",
        "Agendar llamada técnica secundaria por canales externos autorizados."
      ],
      legalDisclaimer: "No representa aprobación contractual automática ni orden de compra."
    },
    {
      title: "Slide 13: Créditos Oficiales y Agradecimientos",
      subtitle: "Ecosistema de Innovación Colaborativa ORBI",
      bullets: [
        "Creador y Diseñador Principal: Víctor M. León (ORBI Ecosystem).",
        "Acompañamiento en el Diseño y Generación de Lógica: ChatGPT y OpenAI.",
        "Plataforma de Despliegue de Código y Compilación: Google AI Studio.",
        "Desarrollado bajo principios de Inteligencia Artificial Responsable."
      ],
      legalDisclaimer: "Nota Institucional: Reservados todos los derechos del material de demostración."
    }
  ];

  // 8. Markdown Export Content Generator
  const generateMarkdownOutput = () => {
    const selectedAud = audiences.find(a => a.id === selectedAudience) || audiences[0];
    const selectedCtx = contexts.find(c => c.id === selectedContext) || contexts[0];

    return `# ORBI SENTINEL IA - EXPORTACIÓN CONTROLADA SANITIZADA
---
**Estado del Paquete:** ${isExportBlocked ? "🚫 BLOQUEADO - REQUIERE REVISIÓN DE SEGURIDAD" : "✅ PREPARADO PARA EXPORTACIÓN CONTROLADA"}
**Paquete Seleccionado:** ${currentPackageMeta.name}
**Audiencia Objetivo:** ${selectedAud.name} (${selectedAud.line})
**Contexto de Presentación:** ${selectedCtx.name} (${selectedCtx.duration} - Enfoque: ${selectedCtx.focus})
**Nota de Licencia:** No contractual, demostrativo, sin datos reales, sin credenciales, sin IPs, sin RTSP, sin precios definitivos.

---
## 1. RESUMEN EJECUTIVO (Executive One-Pager)
ORBI Sentinel IA es una suite de software de asistencia inteligente local de CCTV perimetral para reducir la fatiga visual de los guardias mediante diagnóstico operacional continuo, operando 100% offline y garantizando la privacidad de los datos (Privacy by Design).

### El Problema
Los sistemas de CCTV perimetrales industriales y comunitarios sufren de enlaces inalámbricos intermitentes, cámaras desconfiguradas, fatiga del personal ante pantallas múltiples y falsas alarmas recurrentes por vegetación y viento.

### La Solución
Asistencia inteligente pasiva que monitorea la salud de red (ping, FPS), provee consolas táctiles simplificadas (EasyView), enmascara dinámicamente zonas privadas y unifica la gestión técnica de incidentes sin recurrir a la nube pública.

---
## 2. INFORMACIÓN TÉCNICA SANITIZADA (Technical Brief)
- **Topología de Red:** Puertos PoE físicos monitoreados localmente mediante Gateway en el borde, sin conectividad saliente a servidores externos.
- **Protocolos de Prueba:** Protocolo Dahua LAN adaptativo, descubrimientos ONVIF genéricos en subred local sandbox, emulación de grabación FFmpeg en memoria local.
- **Privacy Shield:** Enmascaramiento de veredas públicas mediante recortes de resolución local, borrado de metadatos de imágenes temporales y control de integridad local de la bitácora de incidentes mediante SHA-256 local.

---
## 3. RESUMEN DE PREPARACIÓN DE PILOTO (Pilot Readiness)
- **Alcance Recomendado:** Pruebas controladas limitadas estrictamente de 1 a 3 cámaras perimetrales instaladas en el sitio del cliente.
- **VLAN de Pruebas:** Aislamiento absoluto en subred física independiente provista por el integrador de CCTV del cliente.
- **Requisitos Clave:** Autorización expresa del jefe de seguridad, verificación previa de voltajes de switches PoE y conformidad ética vecinal o de HSE.

*Aviso Legal: "Este resumen es preliminar y no representa aprobación contractual, factibilidad técnica final ni autorización automática de despliegue."*

---
## 4. DIAPOSITIVAS DE PRESENTACIÓN (Official Demo Deck Summary)
${deckSlides.map((slide, idx) => `
### [Diapositiva ${idx + 1}] ${slide.title}
* ${slide.subtitle}
${slide.bullets.map(b => `  - ${b}`).join("\n")}
  *Aviso:* ${slide.legalDisclaimer}
`).join("\n")}

---
## 5. NOTAS COMPLEMENTARIAS DEL OPERADOR
"${scanStatus.clean ? customNotes : "[CONTENIDO INADECUADO DETECTADO - SANITICE EL CONTENIDO ANTES DE EXPORTAR]"}"

---
**Créditos Oficiales:** Víctor M. León / ORBI Ecosystem, ChatGPT / OpenAI, Google AI Studio.
**Fase del MVP:** ${VERSION_REGISTRY.version} - Cero transmisión cloud activa.
`;
  };

  // 9. Export Readiness Score calculation
  const getExportReadinessScore = () => {
    let score = 0;
    if (qaChecklist.noRealData) score += 10;
    if (qaChecklist.noCredentials) score += 10;
    if (qaChecklist.noIpRtsp) score += 10;
    if (qaChecklist.noPii) score += 10;
    if (qaChecklist.responsibleClaims) score += 10;
    if (qaChecklist.noSourceCodeExported) score += 10;
    if (qaChecklist.noInternalPromptsExported) score += 10;
    if (qaChecklist.nonContractualVisible) score += 5;
    if (qaChecklist.productionLockedVisible) score += 5;
    if (qaChecklist.creditsVisible) score += 5;
    if (qaChecklist.packageSelected) score += 3;
    if (qaChecklist.audienceSelected) score += 3;
    if (qaChecklist.printViewSanitized) score += 3;
    if (qaChecklist.readmeUpdated) score += 2;
    if (qaChecklist.versionRegistryUpdated) score += 4;

    // Is any front blocked?
    const hasBlockedFront = Object.values(frontsStatus).some(status => status === "Blocked");

    // Penalty for scanner findings or blocked fronts
    if (!scanStatus.clean || hasBlockedFront || criticalSafetyFailure) {
      return { score: Math.max(0, score - 50), state: "Export Blocked" as const, color: "text-rose-400" };
    }

    if (score >= 90) {
      return { score, state: "Ready for Controlled Export" as const, color: "text-emerald-400" };
    } else {
      return { score, state: "Needs Review" as const, color: "text-amber-400" };
    }
  };

  const scoreObj = getExportReadinessScore();

  // Integration buttons
  const handleSendToHandoff = () => {
    if (isExportBlocked) return;
    onAddAuditLog("Integración Handoff", `Transferido resumen de piloto sanitizado de la audiencia ${selectedAudience}`);
    alert("Integración local simulada: Resumen sanitizado de piloto transferido con éxito a Pilot Handoff Pack.");
    setCurrentTab("pilothandoff");
  };

  // Restrict Conserje
  if (userRole === "conserje") {
    return (
      <div id="deck-export-locked" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Vista Bloqueada para Conserjería</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            El <strong>Official Demo Deck Export Center</strong> contiene opciones de empaquetado técnico, diseño de briefs de ciberseguridad corporativa y estructuración de pilotos para gerencias O&M. Esta información está restringida para el rol actual.
          </p>
        </div>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-400 max-w-sm mx-auto font-mono">
          <span>Rol requerido: Administrador o Técnico de Soporte</span>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setCurrentTab("easyview")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg transition-all"
          >
            Volver a EasyView
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="official-demo-deck-export-center" className="space-y-6 animate-fade-in">
      {/* Header section with Return button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Official Demo Deck Export Center</span>
            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">
              v0.8.1
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generador de materiales de presentación externos sanitizados a partir del External Stakeholder Binder.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab("stakeholderbinder")}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg border border-slate-800 text-xs font-mono transition-all flex items-center gap-1.5"
        >
          <span>Regresar a Binder</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MÓDULO 8B: Global Certification Status Block */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3" id="block8-certification-status-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider">
                BLOQUE 8 — OFFICIAL DEMO DECK & PDF EXPORT PACK
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">Validación Interna de Sanitización y Controles de Cumplimiento Técnico</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
            BLOCK 8 ACCEPTED / CONTROLLED EXPORT READY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px] font-mono">
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Export Center</span>
            <span className="text-white font-extrabold flex items-center gap-1 mt-1">🔒 Locked</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">QA Lock</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-1">✓ Active</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Scanner</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-1">✓ Active</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Clipboard Lock</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-1">✓ Active</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Print/PDF View</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1 mt-1">✨ Sanitized</span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No Real Data</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noRealData ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noRealData ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No Credentials</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noCredentials ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noCredentials ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No IP/RTSP</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noIpRtsp ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noIpRtsp ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No PII</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noPii ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noPii ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No Source Code</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noSourceCodeExported ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noSourceCodeExported ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">No Prompts</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.noInternalPromptsExported ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.noInternalPromptsExported ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Claims Check</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.responsibleClaims ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.responsibleClaims ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Non-contractual</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.nonContractualVisible ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.nonContractualVisible ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between col-span-1">
            <span className="text-slate-500 text-[8px] uppercase font-bold">Prod Locked</span>
            <span className={`font-extrabold mt-1 ${qaChecklist.productionLockedVisible ? "text-emerald-400" : "text-rose-400"}`}>
              {qaChecklist.productionLockedVisible ? "✓ Confirmed" : "✗ Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Controlled Export Safety Banner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <strong className="text-xs text-slate-200 block uppercase tracking-wider font-mono">
              Exportación Controlada Registrada — ORBI Sentinel IA
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              "Exportación controlada — paquetes externos sanitizados, sin datos reales, sin credenciales, sin IP/RTSP, sin PII, sin precios definitivos y sin contrato automático."
            </p>
          </div>
        </div>

        {/* 9 Compliance badges */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-900/60">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            🛡️ Controlled Export
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            🟢 No Real Data
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            🔑 No Credentials
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            📡 No IP/RTSP
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            👥 No PII
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            📄 Non-Contractual
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            🔒 Production Locked
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            ⚖️ Responsible Claims
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            🌀 ORBI Ecosystem
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration & Safety */}
        <div className="lg:col-span-1 space-y-6">
          {/* Package Selector */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              1. Seleccionar Paquete de Exportación
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setSelectedPackage("onepager")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedPackage === "onepager"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-xs font-bold block">Executive One-Pager</strong>
                  <span className="text-[9px] font-mono opacity-80">1 Pág</span>
                </div>
                <span className="text-[10px] block mt-1 leading-normal text-slate-400">
                  Resumen ejecutivo conceptual para gerentes.
                </span>
              </button>

              <button
                onClick={() => setSelectedPackage("deck")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedPackage === "deck"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-xs font-bold block">Official Demo Deck</strong>
                  <span className="text-[9px] font-mono opacity-80">13 Diapos</span>
                </div>
                <span className="text-[10px] block mt-1 leading-normal text-slate-400">
                  Slide deck de 13 diapositivas interactivas.
                </span>
              </button>

              <button
                onClick={() => setSelectedPackage("brief")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedPackage === "brief"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-xs font-bold block">Technical Brief</strong>
                  <span className="text-[9px] font-mono opacity-80">Conceptual</span>
                </div>
                <span className="text-[10px] block mt-1 leading-normal text-slate-400">
                  Arquitectura pasiva y ciberseguridad offline.
                </span>
              </button>

              <button
                onClick={() => setSelectedPackage("readiness")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedPackage === "readiness"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                    : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-xs font-bold block">Pilot Readiness Summary</strong>
                  <span className="text-[9px] font-mono opacity-80">1-3 Cámaras</span>
                </div>
                <span className="text-[10px] block mt-1 leading-normal text-slate-400">
                  Esquema de piloto acotado y plan de riesgo.
                </span>
              </button>
            </div>

            {/* Package Details Box */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] space-y-1.5 text-slate-400 leading-relaxed font-sans">
              <div>
                <span className="font-bold text-slate-300">Uso Permitido:</span> {currentPackageMeta.usage}
              </div>
              <div>
                <span className="font-bold text-slate-300">Uso NO Permitido:</span> {currentPackageMeta.notUsage}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-900">
                <span>Nivel: {currentPackageMeta.detail}</span>
                <span className="text-emerald-400 uppercase font-bold">{currentPackageMeta.sanitation}</span>
              </div>
            </div>
          </div>

          {/* Audience & Context Selector */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              2. Sincronización de Audiencia y Contexto
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Perfil del Receptor (Audiencia)</label>
              <select
                value={selectedAudience}
                onChange={(e) => {
                  setSelectedAudience(e.target.value);
                  onAddAuditLog("Cambio Perfil Exportación", `Cambiado perfil de audiencia a ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/30"
              >
                {audiences.map(aud => (
                  <option key={aud.id} value={aud.id}>
                    {aud.name} ({aud.line})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Contexto de Presentación</label>
              <select
                value={selectedContext}
                onChange={(e) => {
                  setSelectedContext(e.target.value);
                  onAddAuditLog("Cambio Contexto Exportación", `Cambiado contexto de reunión a ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/30"
              >
                {contexts.map(ctx => (
                  <option key={ctx.id} value={ctx.id}>
                    {ctx.name} (Tiempos: {ctx.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Sync Warning Banner */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Sincronizado con Stakeholder Binder</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal font-sans">
                La narrativa se adaptará para enfatizar las prioridades del receptor seleccionado, mitigando objeciones predeterminadas en el External Binder.
              </p>
            </div>
          </div>

          {/* Allowed vs Forbidden Claims Panel */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                3. Matriz de Claims Responsables
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                Audited Claims
              </span>
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="space-y-1.5">
                <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[9px] font-mono">✔️ Declaraciones Permitidas:</span>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pl-2 text-slate-300 font-mono text-[9px]">
                  <div>• Demo de simulación local controlada</div>
                  <div>• Procesamiento de datos sanitizados</div>
                  <div>• Arquitectura offline Privacy by Design</div>
                  <div>• Production Locked (No producción en vivo)</div>
                  <div>• Diagnóstico y ping de CCTV pasivo</div>
                  <div>• Evidencia técnica simulada de laboratorio</div>
                  <div>• Piloto acotado sugerido de 1-3 cámaras</div>
                  <div>• Validación por personal supervisor humano</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <span className="text-rose-400 font-bold block uppercase tracking-wider text-[9px] font-mono">❌ Declaraciones Prohibidas (Blocked):</span>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pl-2 text-slate-400 font-mono text-[9px]">
                  <div>• Detección absoluta de robos 24/7</div>
                  <div>• Prevención garantizada de incidentes</div>
                  <div>• Reemplazo total de NVRs del integrador</div>
                  <div>• Reemplazo de guardias de seguridad</div>
                  <div>• Reemplazo de SCADA, O&M o HSE</div>
                  <div>• Compatibilidad universal con todo hardware</div>
                  <div>• Software de producción 100% autónomo listo</div>
                  <div>• Evidencia con validez judicial autónoma</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column - Content Canvas & View Selectors */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Mode Toolbar */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveViewMode("presentation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "presentation"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              📊 Presentation 16:9
            </button>
            <button
              onClick={() => setActiveViewMode("print")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "print"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              📄 Print View A4
            </button>
            <button
              onClick={() => setActiveViewMode("onepager")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "onepager"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              📋 Executive One-Pager
            </button>
            <button
              onClick={() => setActiveViewMode("brief")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "brief"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              🛠️ Technical Brief
            </button>
            <button
              onClick={() => setActiveViewMode("readiness")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "readiness"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              📋 Pilot Readiness
            </button>
            <button
              onClick={() => setActiveViewMode("markdown")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeViewMode === "markdown"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              📝 Markdown Output
            </button>
            <button
              onClick={() => setActiveViewMode("qalock")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                activeViewMode === "qalock"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-950 hover:bg-slate-850 text-slate-400"
              }`}
            >
              🔒 QA Lock Status
            </button>
          </div>

          {/* Active Canvas Frame */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            {/* Header of Canvas */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">
                  Preview: {activeViewMode.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">
                  Export Status:
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                  isExportBlocked
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {isExportBlocked ? "🔒 Export Blocked" : "🔓 Controlled Ready"}
                </span>
              </div>
            </div>

            {/* Canvas Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* VIEW 1: Presentation Mode */}
              {activeViewMode === "presentation" && (
                <div className="space-y-6">
                  {/* Slider Container */}
                  <div className="aspect-video bg-slate-950 rounded-lg p-6 border border-slate-850 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                          Diapositiva {activeSlide + 1} de 13
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded text-emerald-400">
                          {deckSlides[activeSlide].title.split(":")[0]}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {deckSlides[activeSlide].title.split(":")[1] || deckSlides[activeSlide].title}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-400">
                        {deckSlides[activeSlide].subtitle}
                      </p>
                    </div>

                    <div className="flex-1 py-2">
                      <ul className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
                        {deckSlides[activeSlide].bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1 select-none">▪</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-900/80 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>ORBI Sentinel IA — Preservando la Confidencialidad</span>
                      <span className="text-rose-400 font-bold">{deckSlides[activeSlide].legalDisclaimer}</span>
                    </div>
                  </div>

                  {/* Slider controls */}
                  <div className="flex justify-between items-center p-1 bg-slate-950 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                      disabled={activeSlide === 0}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs rounded transition-all font-mono"
                    >
                      ◀ Diapositiva Anterior
                    </button>
                    <span className="text-xs font-mono text-slate-400">
                      Diapositiva {activeSlide + 1} de 13
                    </span>
                    <button
                      onClick={() => setActiveSlide(prev => Math.min(12, prev + 1))}
                      disabled={activeSlide === 12}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs rounded transition-all font-mono"
                    >
                      Siguiente Diapositiva ▶
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: Print View A4 */}
              {activeViewMode === "print" && (
                <div className="bg-white text-slate-900 p-8 rounded-lg shadow-inner max-w-2xl mx-auto space-y-6 font-serif">
                  {/* Watermark/Warning header */}
                  <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                    <div>
                      <h1 className="text-lg font-bold tracking-tight text-slate-950 uppercase font-sans">
                        ORBI Sentinel IA
                      </h1>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                        Documentación de Presentación Externa Sanitizada
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-slate-200 border border-slate-300 text-slate-700 font-bold uppercase block">
                        EXCLUSIVAMENTE DEMOSTRATIVO
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono block mt-1">
                        Socio Víctor M. León
                      </span>
                    </div>
                  </div>

                  {/* Printable Warning */}
                  <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800 leading-normal font-sans">
                    <strong>AVISO DE CONFORMIDAD REGULATORIA (BLOCK 8 EXPORT):</strong> Este paquete de presentación representa una demostración de factibilidad operacional de CCTV inteligente local de ORBI Sentinel IA. Se excluye el uso de datos en caliente, accesos SCADA en producción y credenciales corporativas reales.
                  </div>

                  {/* Sections simulating A4 pages */}
                  <div className="space-y-4 text-xs leading-relaxed font-sans text-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-950 border-b border-slate-200 pb-1 font-serif text-sm">
                        I. Declaración de Misión e Identidad Responsable
                      </h4>
                      <p className="mt-1.5">
                        ORBI Sentinel IA asiste pasivamente a los operadores en la identificación de anomalías operacionales de red y ping de cámaras. Todo el procesamiento de analítica se ejecuta exclusivamente en el borde (Edge) local del cliente sin salirse a redes en la nube, garantizando el cumplimiento ético de la privacidad vecinal y reglamentos de HSE.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950 border-b border-slate-200 pb-1 font-serif text-sm">
                        II. Líneas de Negocio y Coexistencia Técnica
                      </h4>
                      <p className="mt-1.5">
                        El ecosistema se distribuye bajo estricta modularidad física:
                      </p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>Sentinel Field:</strong> Red de diagnóstico para activos industriales y subestaciones solares.</li>
                        <li><strong>Sentinel Community:</strong> Enfoque residencial con enmascaramiento dinámico para conserjería.</li>
                        <li><strong>Consumer Lab:</strong> Pruebas domésticas y soporte de grabadoras locales aisladas.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950 border-b border-slate-200 pb-1 font-serif text-sm">
                        III. Propuesta y Límites de Pilotos Autorizados
                      </h4>
                      <p className="mt-1.5">
                        Cualquier despliegue preliminar está estrictamente acotado de <strong>1 a 3 cámaras perimetrales existentes</strong>, operando en una subred VLAN sandbox del cliente. No se compromete validez judicial de evidencia forense de forma autónoma, requiriendo validación por el prevencionista o directiva local.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between text-[9px] text-slate-400 font-mono font-sans">
                    <span>Exportación ID: ORBI-EXP-08-01</span>
                    <span>No vinculante / Documento Sanitizado</span>
                  </div>
                </div>
              )}

              {/* VIEW 3: Compact One-Pager */}
              {activeViewMode === "onepager" && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 font-sans">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight">
                          Executive One-Pager: ORBI Sentinel IA
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-0.5">
                          Ecosistema Víctor M. León
                        </span>
                      </div>
                      <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase font-mono font-bold">
                        Controlled Copy
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
                      <div>
                        <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wider font-mono">¿Qué es ORBI Sentinel IA?</strong>
                        <p>Es una suite de asistencia inteligente local que ayuda a los operadores de CCTV perimetral a monitorear el estado de red y mitigar falsas alertas, operando de forma 100% offline y garantizando la privacidad de datos.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wider font-mono">El Problema</strong>
                          <p className="text-[11px]">Pérdida periódica de conectividad inalámbrica, fatiga de guardia vigilando múltiples pantallas e incidentes sin trazabilidad local confiable.</p>
                        </div>
                        <div>
                          <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wider font-mono">La Solución</strong>
                          <p className="text-[11px]">Asistencia visual adaptativa, diagnóstico pasivo de enlaces PoE e interfaces táctiles de baja fatiga mental (EasyView).</p>
                        </div>
                      </div>

                      <div>
                        <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wider font-mono">Resguardo y Limitaciones Responsables</strong>
                        <p className="text-[11px]">
                          La inteligencia artificial es un asistente supervisado por un operador humano y no sustituye guardias de seguridad, NVRs existentes, SCADA perimetral o personal HSE en terreno.
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
                        <span>Próximo Paso: Pilot Intake 1-3 Cámaras</span>
                        <span className="text-emerald-400 font-bold uppercase">Non-Contractual</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: Technical Brief */}
              {activeViewMode === "brief" && (
                <div className="space-y-4 max-w-xl mx-auto font-mono text-xs text-slate-300">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-white font-bold flex items-center gap-1">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>TECHNICAL_BRIEF.md</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 font-bold">
                        SANITISED_CONCEPTUAL
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-bold">// 1. Arquitectura de Red de Borde (Edge)</span>
                        <p className="pl-3 mt-1 leading-relaxed font-sans text-slate-300">
                          Sentinel Edge Gateway es un nodo local físico que interopera de forma pasiva con los flujos de red del switch PoE existente, extrayendo metadatos de salud y diagnóstico LAN sin transmisión de paquetes en bruto a la nube pública.
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-bold">// 2. Control de Privacidad local (Privacy Shield)</span>
                        <p className="pl-3 mt-1 leading-relaxed font-sans text-slate-300">
                          La detección local en el Gateway utiliza recortes de baja resolución para análisis operacional. Las caras de residentes, patentes públicas de veredas y áreas colindantes son enmascaradas en el origen de forma irreversible.
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] tracking-wider font-bold">// 3. Protocolos y Compatibilidades</span>
                        <p className="pl-3 mt-1 leading-relaxed font-sans text-slate-300">
                          Soporte emulado de Dahua LAN DHCP, flujos RTSP locales sandbox de prueba, descubrimientos ONVIF genéricos en puerto local y exportación de bitácoras con integridades de hash SHA-256 local.
                        </p>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400 font-sans">
                      <strong>Nota de Seguridad Corporativa:</strong> No se comparte código fuente, claves SSH reales ni prompts internos del modelo en el paquete técnico.
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 5: Markdown Export Preview */}
              {activeViewMode === "markdown" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500">
                      Editable Copiable Markdown Output
                    </span>
                    <button
                      onClick={() => handleCopy("markdown-full", generateMarkdownOutput())}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono border border-slate-700 flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copyStates["markdown-full"] ? "Copiado!" : "Copiar Todo"}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generateMarkdownOutput()}
                    className="w-full h-80 bg-slate-950 border border-slate-850 rounded-lg p-3 text-[10px] font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-slate-800 resize-none select-all"
                  />
                </div>
              )}

              {/* VIEW 6: Pilot Readiness Summary */}
              {activeViewMode === "readiness" && (
                <div className="space-y-4 max-w-xl mx-auto font-sans text-xs text-slate-300">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-white font-bold flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px]">
                        <ClipboardList className="w-4 h-4 text-emerald-400" />
                        <span>Pilot Readiness Summary</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold uppercase">
                        Sanitized Pilot Outline
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">📌 Tipo de Piloto</span>
                        <p className="font-semibold text-white">Prueba de concepto local controlada</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">📹 Alcance Recomendado</span>
                        <p className="font-semibold text-emerald-400">1 a 3 cámaras perimetrales existentes</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <strong className="text-white text-[10px] font-mono uppercase tracking-wider block">🔑 Gestión de Autorizaciones y Consentimiento</strong>
                        <p className="text-slate-300 pl-2 leading-relaxed">
                          La obtención de permisos explícitos de grabación vecinal, resguardo de datos y consentimiento informado se gestiona externamente de forma independiente por el cliente previo al inicio de pruebas.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-white text-[10px] font-mono uppercase tracking-wider block">🌐 Zonas Incluidas y Excluidas</strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 text-[11px]">
                          <div className="p-2 bg-emerald-950/20 border border-emerald-500/10 rounded">
                            <span className="text-emerald-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px] font-mono">✓ Incluido:</span>
                            <span>Acceso vehicular principal, portón peatonal y zonas de cercos colindantes ciegos dentro del recinto privado.</span>
                          </div>
                          <div className="p-2 bg-rose-950/20 border border-rose-500/10 rounded">
                            <span className="text-rose-400 font-bold block mb-0.5 uppercase tracking-wide text-[9px] font-mono">✗ Excluido:</span>
                            <span>Interior de viviendas, veredas de tránsito público general o áreas recreativas vecinales.</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-white text-[10px] font-mono uppercase tracking-wider block">🛠️ Checklist Técnico General</strong>
                        <ul className="list-disc pl-5 space-y-1 leading-relaxed text-slate-300">
                          <li>Segmentación de red local autorizada y aislamiento lógico a validar por el equipo TI/proveedor autorizado para el ruteo pasivo.</li>
                          <li>Requisitos generales de red a revisar en piloto, como alimentación estable de switch PoE.</li>
                          <li>Parámetros definidos fuera de la demo por el cliente/proveedor sin enlaces directos a nubes públicas.</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-white text-[10px] font-mono uppercase tracking-wider block">⚠️ Riesgos Principales Identificados</strong>
                        <ul className="list-disc pl-5 space-y-1 leading-relaxed text-slate-400">
                          <li>Intermitencias puntuales debido a enlaces inalámbricos PoE preexistentes degradados por viento.</li>
                          <li>Falsas alertas de oclusión debidas a vegetación perimetral no podada.</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-white text-[10px] font-mono uppercase tracking-wider block">📦 Handoff Seguro y Próximos Pasos</strong>
                        <p className="text-slate-300 pl-2 leading-relaxed">
                          Finalizadas las pruebas, el nodo físico Sentinel es desconectado, devolviendo el switch a su estado original de fábrica. El informe resultante es entregado bajo firma de no divulgación preliminar.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[10px] leading-relaxed">
                      <strong>⚠ ADVERTENCIA MANDATORIA:</strong> Este resumen es preliminar y no representa aprobación contractual, factibilidad técnica final ni autorización automática de despliegue.
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 7: Official Export QA Lock Status */}
              {activeViewMode === "qalock" && (
                <div className="space-y-5 max-w-2xl mx-auto font-sans text-xs text-slate-300">
                  {/* Lock Header Card */}
                  <div className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${globalLock.color}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>AUDIT GATEWAY LOCK STATUS</span>
                      </div>
                      <h4 className="text-base font-extrabold tracking-tight uppercase">
                        {globalLock.label}
                      </h4>
                      <p className="text-[11px] leading-relaxed opacity-90 font-sans">
                        {globalLock.status === "Official Export Package Locked" 
                          ? "Todos los frentes están auditados, sanitizados, sin datos reales y listos para exportación controlada." 
                          : globalLock.status === "Needs Review"
                          ? "Hay frentes en revisión o checklist incompleto. Se requiere verificación final."
                          : "EXPORTACIÓN BLOQUEADA: Existen violaciones críticas de seguridad o frentes marcados como bloqueados."}
                      </p>
                    </div>

                    <div className="shrink-0 px-4 py-2 bg-slate-950/60 rounded-lg border border-slate-800 text-center font-mono">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Readiness Score</span>
                      <span className="text-lg font-black block leading-none mt-1 text-white">{getExportReadinessScore().score}%</span>
                    </div>
                  </div>

                  {/* 10 Audit Fronts Grid */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        10 Frentes de Auditoría de Presentación Externa
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        Haga clic en las etiquetas de estado para ciclar (Ready ➔ Needs Review ➔ Blocked)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "safetyBanner", label: "1. Export Safety Banner", desc: "Valida banners de conformidad reguladora y 9 compliance badges obligatorios.", icon: ShieldCheck },
                        { key: "packageSelector", label: "2. Package Selector", desc: "Asegura 6 formatos seleccionables detallando audiencias y exclusión de código.", icon: Layers },
                        { key: "audienceSelector", label: "3. Audience & Context Selector", desc: "Verifica 11 audiencias y 8 contextos sin filtrado de datos confidenciales.", icon: Users },
                        { key: "deckBuilder", label: "4. Demo Deck Builder", desc: "Audita 13 diapositivas interactivas con marcas de agua de Víctor M. León.", icon: BookOpen },
                        { key: "onePager", label: "5. Executive One-Pager", desc: "Compacto sanitizado conceptual de una página para directores gerenciales.", icon: FileText },
                        { key: "technicalBrief", label: "6. Technical Brief", desc: "Resumen técnico de borde pasivo offline sin claves ni endpoints expuestos.", icon: FileCode },
                        { key: "pilotSummary", label: "7. Pilot Readiness Summary", desc: "Plan acotado de 1 a 3 cámaras perimetrales con advertencia no contractual.", icon: ClipboardList },
                        { key: "claimsPanel", label: "8. Claims Panel Matrix", desc: "Restringe reclamos absolutos prohibidos de NVR, HSE y guardia virtual.", icon: AlertOctagon },
                        { key: "exportScanner", label: "9. Export Sanitization Scanner", desc: "Escáner recursivo de PII, IP, RTSP, credenciales, prompts y código.", icon: Activity },
                        { key: "controlsReports", label: "10. Export Controls & Reports", desc: "Bloquea botones de copiado y descarga si se infringe alguna directiva.", icon: Sliders }
                      ].map((front) => {
                        const Icon = front.icon;
                        const status = frontsStatus[front.key];
                        const badgeColor = 
                          status === "Ready" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : status === "Needs Review"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold";

                        return (
                          <div key={front.key} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start gap-2.5 hover:border-slate-800 transition-all">
                            <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0 text-slate-400 mt-0.5">
                              <Icon className="w-4 h-4 text-emerald-400/80" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-white text-[11px] block truncate">{front.label}</span>
                                <button
                                  onClick={() => cycleFrontStatus(front.key)}
                                  className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider shrink-0 transition-all hover:scale-105 active:scale-95 ${badgeColor}`}
                                >
                                  {status}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal font-sans">{front.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Warning Note */}
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-500 font-sans text-center">
                    Cualquier frente en estado <strong>Blocked</strong> aplicará de forma directa e irreversible un <strong>Export Blocked</strong> completo al sistema, deshabilitando todos los controles de copia y de envío a handoff.
                  </div>
                </div>
              )}

            </div>

            {/* Footer of Canvas with Custom Notes input */}
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-850 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Agregar Minuta Personalizada para la Reunión (Notas del Presentador)
                </label>
                <span className={`text-[9px] font-mono ${scanStatus.clean ? "text-emerald-400" : "text-rose-400 font-bold"}`}>
                  {scanStatus.clean ? "✓ Scanner Limpio" : `⚠ ${scanStatus.findings.length} Hallazgos Detectados`}
                </span>
              </div>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Escriba aquí notas complementarias para el piloto o minuta de la reunión..."
                className={`w-full bg-slate-900 border text-xs rounded-lg p-2 text-slate-200 focus:outline-none ${
                  scanStatus.clean 
                    ? "border-slate-800 focus:border-emerald-500/20" 
                    : "border-rose-500/40 focus:border-rose-500/60 text-rose-300"
                }`}
              />
              
              {/* Scanner Findings Box */}
              {!scanStatus.clean && (
                <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-lg space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ALERTA DE SEGURIDAD DE SANITIZACIÓN (EXPORT BLOCK)</span>
                  </div>
                  <div className="text-[9px] text-rose-300/80 leading-normal font-sans pl-5 space-y-1">
                    {scanStatus.findings.map((f, idx) => (
                      <div key={idx}>• {f}</div>
                    ))}
                    <div className="text-[9px] text-emerald-400/90 pt-1">
                      <strong>Reemplazo Sugerido:</strong> "{scanStatus.suggestedText}"
                    </div>
                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          setCustomNotes(scanStatus.suggestedText);
                          onAddAuditLog("Sanitización Automática", "Aplicada sugerencia de reemplazo del Scanner");
                        }}
                        className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded text-[9px] border border-rose-500/30 transition-all uppercase font-bold font-mono"
                      >
                        Sanitizar Automáticamente en Caliente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 12. Export Readiness Score Widget */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>ORBI Export Readiness Score</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal max-w-2xl font-sans">
              Métrica de confianza sobre los paquetes descargados para garantizar que el material técnico y comercial externo cumple estrictamente con el resguardo ético de la marca.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-850 shrink-0">
            <div className="text-right">
              <span className={`text-base font-mono font-extrabold block leading-none ${scoreObj.color}`}>
                {scoreObj.score} / 100
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">
                {scoreObj.state}
              </span>
            </div>
            <div className={`w-2.5 h-10 rounded ${
              scoreObj.state === "Ready for Controlled Export"
                ? "bg-emerald-500"
                : scoreObj.state === "Needs Review"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`} />
          </div>
        </div>

        {/* Warning label */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-sans">
          <strong>Aviso Regulador Obligatorio:</strong> "Este score es interno y preliminar. No representa aprobación contractual, factibilidad técnica final, inversión aprobada, autorización de despliegue ni validación legal."
        </div>
      </div>

      {/* 14. Interactive Export QA Checklist (16 points required) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5" id="export-qa-checklist-container">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>4. Export QA Checklist de Validación</span>
          </h3>
          <span className="text-[9px] font-mono text-slate-400">
            {Object.values(qaChecklist).filter(Boolean).length} de 16 Verificados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          {/* Col 1 */}
          <div className="space-y-2">
            <button
              onClick={() => toggleChecklist("noRealData")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noRealData ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noRealData ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No real data</span>
            </button>

            <button
              onClick={() => toggleChecklist("noCredentials")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noCredentials ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noCredentials ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No credentials</span>
            </button>

            <button
              onClick={() => toggleChecklist("noIpRtsp")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noIpRtsp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noIpRtsp ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No IP/RTSP</span>
            </button>

            <button
              onClick={() => toggleChecklist("noPii")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noPii ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noPii ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No PII (Privacy)</span>
            </button>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <button
              onClick={() => toggleChecklist("responsibleClaims")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.responsibleClaims ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.responsibleClaims ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Responsible claims checked</span>
            </button>

            <button
              onClick={() => toggleChecklist("noSourceCodeExported")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noSourceCodeExported ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noSourceCodeExported ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No source code exported</span>
            </button>

            <button
              onClick={() => toggleChecklist("noInternalPromptsExported")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.noInternalPromptsExported ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.noInternalPromptsExported ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">No internal prompts exported</span>
            </button>

            <button
              onClick={() => toggleChecklist("nonContractualVisible")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.nonContractualVisible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.nonContractualVisible ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Non-contractual label</span>
            </button>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <button
              onClick={() => toggleChecklist("productionLockedVisible")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.productionLockedVisible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.productionLockedVisible ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Production Locked visible</span>
            </button>

            <button
              onClick={() => toggleChecklist("creditsVisible")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.creditsVisible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.creditsVisible ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Credits visible (M. León)</span>
            </button>

            <button
              onClick={() => toggleChecklist("packageSelected")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.packageSelected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.packageSelected ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Package selected</span>
            </button>

            <button
              onClick={() => toggleChecklist("audienceSelected")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.audienceSelected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.audienceSelected ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Audience selected</span>
            </button>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <button
              onClick={() => toggleChecklist("printViewSanitized")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.printViewSanitized ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.printViewSanitized ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Print view sanitized</span>
            </button>

            <div className="flex items-center gap-2 w-full text-left p-1.5 rounded opacity-80 bg-slate-950/20 border border-dashed border-slate-850">
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                scanStatus.clean ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}>
                {scanStatus.clean ? "✓" : "⚠"}
              </span>
              <span className="text-slate-400 font-sans">Scanner clean</span>
            </div>

            <button
              onClick={() => toggleChecklist("readmeUpdated")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.readmeUpdated ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.readmeUpdated ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">README updated</span>
            </button>

            <button
              onClick={() => toggleChecklist("versionRegistryUpdated")}
              className="flex items-center gap-2 w-full text-left p-1.5 rounded hover:bg-slate-850 transition-all"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[10px] ${
                qaChecklist.versionRegistryUpdated ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 border-slate-800 text-slate-600"
              }`}>
                {qaChecklist.versionRegistryUpdated ? "✓" : ""}
              </span>
              <span className="text-slate-300 font-sans">Registry updated</span>
            </button>
          </div>
        </div>
      </div>

      {/* 13. Export Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <strong className="text-xs text-white block">Acciones de Descarga Externa Autorizada</strong>
          <span className="text-[10px] text-slate-400 block">
            Acciones sujetas a validación del scanner en tiempo real.
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Copy Markdown */}
          <button
            disabled={isExportBlocked}
            onClick={() => handleCopy("markdown-full", generateMarkdownOutput())}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded text-xs transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copyStates["markdown-full"] ? "Copiado!" : "Copy Markdown"}</span>
          </button>

          {/* Copy Executive Summary */}
          <button
            disabled={isExportBlocked}
            onClick={() => handleCopy("summary", `ORBI Sentinel IA: Asistente offline de diagnóstico de CCTV local. Líneas Field/Community/Consumer. Cero datos reales, cero nube pública. Diseñado para mitigar la fatiga visual. Creador: Víctor M. León. v0.8.0`)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded text-xs transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Summary</span>
          </button>

          {/* Open Print View */}
          <button
            disabled={isExportBlocked}
            onClick={() => {
              setActiveViewMode("print");
              onAddAuditLog("Impresión Solicitada", `Abierta vista imprimible para ${selectedPackage}`);
              setTimeout(() => {
                window.print();
              }, 500);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded text-xs transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print View / PDF</span>
          </button>

          {/* Send to Pilot Handoff */}
          <button
            disabled={isExportBlocked}
            onClick={handleSendToHandoff}
            className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold rounded text-xs transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Send to Pilot Handoff</span>
          </button>

          {/* Reset Package */}
          <button
            onClick={() => {
              setSelectedPackage("deck");
              setSelectedAudience("gerente-om");
              setSelectedContext("reunion-tecnica");
              setActiveViewMode("presentation");
              setCustomNotes("Reunión de alineación de expectativas operacionales en base a la línea Sentinel Field. Pruebas de laboratorio controladas de 1 a 3 cámaras perimetrales sujetas a factibilidad física.");
              onAddAuditLog("Reinicio Export", "Restablecidos filtros de exportación a valores base");
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-300 rounded text-xs transition-all flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
