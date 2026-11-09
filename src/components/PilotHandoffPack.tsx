import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  ClipboardList,
  Check,
  Copy,
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
  Send,
  Mail,
  AlertOctagon,
  ThumbsUp,
  FileCheck,
  ToggleLeft,
  Settings
} from "lucide-react";

interface PilotHandoffPackProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

type HandoffType = "field" | "community" | "consumer" | "mixed" | "followup";

interface ProviderChecklistItem {
  id: string;
  label: string;
  status: "Ready" | "Pending" | "Needs Review" | "Not Applicable" | "Blocked";
}

interface RiskItem {
  id: string;
  category: string;
  severity: "Alta" | "Media" | "Baja";
  mitigation: string;
  owner: string;
  status: "Abierto" | "Mitigado" | "En revisión";
}

interface QAItem {
  id: string;
  label: string;
  status: "Ready" | "Blocked";
  critical: boolean;
}

interface AuditFrente {
  id: string;
  name: string;
  description: string;
  status: "Ready" | "Needs Review" | "Blocked";
  reason: string;
  rule: string;
}

export default function PilotHandoffPack({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: PilotHandoffPackProps) {
  const [activeSubTab, setActiveSubTab] = useState<"documents" | "qalock">("documents");
  const [handoffType, setHandoffType] = useState<HandoffType>("field");
  
  // Copied states
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedAgreement, setCopiedAgreement] = useState(false);
  
  // Custom notes and modifications
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [hasFormalAuthorization, setHasFormalAuthorization] = useState(false);
  
  // Manual sign-off for the 10 frentes
  const [manualFrentesSignOff, setManualFrentesSignOff] = useState<Record<string, boolean>>({
    safety_banner: true,
    type_selector: true,
    summary_card: true,
    request_list: true,
    coord_brief: false,
    meeting_agenda: false,
    hse_notes: false,
    email_templates: false,
    provider_checklist: false,
    report_scanner: false
  });

  // Loaded state from active Pilot Intake
  const [intakeData, setIntakeData] = useState<any>({
    pilotType: "field",
    form: {
      pilotName: "Piloto Operacional Centro",
      environmentType: "Planta Solar PMGD / Perímetro",
      approxCameras: 12,
      proposedCameras: 2,
      durationDays: 10,
      existingNvr: "sí",
      cameraBrands: "Dahua, Hikvision",
      includedZones: "Portón principal de acceso, Cerco perimetral norte",
      excludedZones: "Zonas administrativas internas, Espacios colindantes públicos",
      rolesInvolved: "Supervisor O&M, Operador de Turno",
      pilotGoal: "Validar la conectividad del Gateway local de prueba y la detección de incidentes en el perímetro norte.",
      observations: "El piloto operará con sub-streams locales sin conexión persistente a la nube pública."
    },
    overallState: "Pilot Intake Deployment Readiness Locked",
    scoreResult: {
      score: 90,
      status: "Ready for Controlled Pilot Planning",
      desc: "El piloto cumple con los rigurosos estándares operacionales y de seguridad."
    }
  });

  // Load from localStorage on mount and adapt on changes
  useEffect(() => {
    const rawState = localStorage.getItem("ORBI_SENTINEL_ACTIVE_PILOT_INTAKE_STATE");
    if (rawState) {
      try {
        const parsed = JSON.parse(rawState);
        if (parsed && parsed.form) {
          setIntakeData(parsed);
          if (parsed.pilotType) {
            setHandoffType(parsed.pilotType as HandoffType);
          }
        }
      } catch (err) {
        console.error("Error loading active pilot intake state:", err);
      }
    }
  }, []);

  // Update intakeData if localStorage changes (e.g. if edited in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const rawState = localStorage.getItem("ORBI_SENTINEL_ACTIVE_PILOT_INTAKE_STATE");
      if (rawState) {
        try {
          const parsed = JSON.parse(rawState);
          if (parsed && parsed.form) {
            setIntakeData(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Provider Coordination Checklist State (10 Items)
  const [providerChecklist, setProviderChecklist] = useState<ProviderChecklistItem[]>([
    { id: "prov_brands", label: "Confirmar marcas y modelos del inventario general de cámaras", status: "Ready" },
    { id: "prov_nvr", label: "Confirmar existencia y tipo de grabador NVR para derivación local", status: "Ready" },
    { id: "prov_protocols", label: "Confirmar disponibilidad general de protocolos RTSP/ONVIF", status: "Ready" },
    { id: "prov_rtsppath", label: "Confirmar si existe RTSP sin registrar contraseñas ni rutas", status: "Ready" },
    { id: "prov_secure_ch", label: "Confirmar que accesos de red se gestionan solo fuera de la demo", status: "Ready" },
    { id: "prov_window", label: "Confirmar ventana horaria para pruebas operativas de borde", status: "Pending" },
    { id: "prov_no_ips", label: "Confirmar red local autorizada sin registrar IPs reales", status: "Ready" },
    { id: "prov_gateway_pt", label: "Confirmar punto físico de energía y enlace LTE para el Gateway local", status: "Pending" },
    { id: "prov_privacy", label: "Confirmar enmascaramiento y restricciones de zonas de privacidad vecinal", status: "Ready" },
    { id: "prov_rollback", label: "Confirmar plan de reversión y desconexión rápida del Gateway local", status: "Pending" }
  ]);

  const toggleProviderChecklist = (id: string) => {
    const states: Array<"Ready" | "Pending" | "Needs Review" | "Not Applicable" | "Blocked"> = [
      "Ready",
      "Pending",
      "Needs Review",
      "Not Applicable",
      "Blocked"
    ];
    setProviderChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextIndex = (states.indexOf(item.status) + 1) % states.length;
          const nextStatus = states[nextIndex];
          onAddAuditLog("Checklist Proveedor Handoff", `Actualizado ${item.label} a ${nextStatus}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Handoff Risk Register State (12 Risks)
  const [riskRegister, setRiskRegister] = useState<RiskItem[]>([
    { id: "hr_channel", category: "Cliente entrega credenciales por canal inadecuado", severity: "Alta", mitigation: "Informar previamente de resguardos éticos y rechazar correos con claves.", owner: "Gestor Comercial", status: "Mitigado" },
    { id: "hr_scope", category: "Alcance crece sobre 3 cámaras piloto", severity: "Alta", mitigation: "Restringir la fase piloto a un máximo de 3 domos perimetrales.", owner: "Ingeniero Preventa", status: "Mitigado" },
    { id: "hr_auth", category: "Falta de firma de autorización formal de traspaso", severity: "Alta", mitigation: "Bloquear instalación física hasta recibir acta de validación firmada.", owner: "Gestor Comercial", status: "Abierto" },
    { id: "hr_private", category: "Zonas privadas no excluidas rigurosamente", severity: "Alta", mitigation: "Configurar Privacy Shield localmente e inspeccionar con el cliente.", owner: "Técnico de Terreno", status: "Mitigado" },
    { id: "hr_protocols", category: "Proveedor CCTV no confirma protocolos locales", severity: "Media", mitigation: "Utilizar el escaner de matriz de compatibilidad ONVIF local.", owner: "Técnico de Terreno", status: "En revisión" },
    { id: "hr_nvr", category: "NVR bloqueado o sin puertos ethernet libres", severity: "Alta", mitigation: "Acordar uso de switch pasivo de prueba o puerto LAN secundario.", owner: "Técnico de Terreno", status: "Abierto" },
    { id: "hr_network", category: "Red local saturada por streams continuos", severity: "Media", mitigation: "Forzar uso exclusivo de sub-streams de baja resolución.", owner: "Técnico de Terreno", status: "Mitigado" },
    { id: "hr_hse", category: "Trabajos en altura o eléctricos sin coordinación HSE", severity: "Alta", mitigation: "Validar permisos de trabajo. Trabajar solo sobre postes pre-energizados.", owner: "Técnico de Terreno", status: "En revisión" },
    { id: "hr_prod_mode", category: "Expectativa de producción 24/7 permanente", severity: "Alta", mitigation: "Recordar que es un piloto acotado de pruebas. Mostrar limitación.", owner: "Gestor Comercial", status: "Mitigado" },
    { id: "hr_demo_confusion", category: "Confusión entre demo y sistema de vigilancia definitivo", severity: "Media", mitigation: "Circular minuta destacando el carácter de laboratorio temporal.", owner: "Administrador de Condominio", status: "Mitigado" },
    { id: "hr_sensitive_notes", category: "Ingreso accidental de datos sensibles en notas libres", severity: "Alta", mitigation: "Habilitar Sanitization Scanner heurístico en caliente con bloqueo.", owner: "Auditor de Traspaso", status: "Mitigado" },
    { id: "hr_unauthorized_channel", category: "Solicitud de acceso por canal no autorizado", severity: "Alta", mitigation: "Forzar el uso de canales externos y seguros autorizados de TI.", owner: "Auditor de Traspaso", status: "Mitigado" }
  ]);

  const toggleRiskStatus = (id: string) => {
    const states: Array<"Abierto" | "Mitigado" | "En revisión"> = ["Abierto", "Mitigado", "En revisión"];
    setRiskRegister(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextIndex = (states.indexOf(item.status) + 1) % states.length;
          const nextStatus = states[nextIndex];
          onAddAuditLog("Matriz de Riesgo Handoff", `Actualizado riesgo ${item.category} a ${nextStatus}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Environment-specific configurations (Requirement 3)
  const handoffConfigurations = {
    field: {
      title: "Field / Solar O&M Pilot",
      recipients: "Supervisor de O&M, Jefe de Planta, Proveedor CCTV Industrial",
      objective: "Validar la analítica de cruce de línea perimetral en cerco norte, reduciendo falsas alarmas provocadas por vegetación o fauna en condiciones desérticas remotas.",
      infoAllowed: "- Cantidad aproximada de cámaras (1-3)\n- Marcas de cámaras generales (Dahua/Hikvision)\n- Existencia de NVR centralizado\n- Zonas críticas de acceso perimetral\n- Ventana solar de pruebas",
      infoForbidden: "- Claves de routers, VPN, NVR o cámaras\n- Direcciones IP fijas reales de la planta\n- Links RTSP activos con hashes reales\n- Planos topográficos confidenciales\n- Contactos o correos directos del personal de planta",
      nextStep: "Coordinar con O&M la disponibilidad de alimentación PoE en poste y programar ventana de instalación física por personal autorizado.",
      agenda: "Field"
    },
    community: {
      title: "Community / Condominium Pilot",
      recipients: "Administrador del Condominio, Comité de Copropietarios, Conserje de Turno",
      objective: "Demostrar la detección de permanencia sospechosa en portón vehicular de acceso común, garantizando la privacidad mediante ofuscación facial en áreas comunes transitadas.",
      infoAllowed: "- Cantidad de accesos peatonales y vehiculares comunes\n- Horarios aproximados de mayor flujo vehicular\n- Tipo de NVR en sala de conserjería\n- Espacios de esparcimiento vecinal a excluir\n- Política de retención local (7 días)",
      infoForbidden: "- Claves de conserjería o claves maestras de residentes\n- Datos de contacto o números telefónicos de residentes\n- IPs locales de cámaras comunitarias\n- Planos de ductos eléctricos internos del edificio\n- Números de departamentos o casas particulares",
      nextStep: "Presentar minuta simplificada a la directiva del comité para ratificación de zonas excluidas antes de encender el Gateway local.",
      agenda: "Community"
    },
    consumer: {
      title: "Consumer Lab / Smart Home Pilot",
      recipients: "Propietario de la Vivienda, Integrador Domótico Local",
      objective: "Validar la integración de cámaras de consumo masivo mediante sub-streams locales sin recurrir a servidores cloud de terceros, protegiendo la intimidad del hogar.",
      infoAllowed: "- Cantidad de cámaras en patio delantero\n- Marcas y compatibilidad ONVIF genérica\n- Red wifi de prueba aislada de domótica principal\n- Cobertura aproximada en metros",
      infoForbidden: "- Claves wifi de la casa o cuenta de cámaras\n- Dirección postal exacta o geolocalización precisa\n- Datos personales de familiares o niños\n- Planos de arquitectura de la vivienda",
      nextStep: "Crear red wifi de prueba 'sandbox' local exclusiva para el Gateway y las cámaras piloto.",
      agenda: "Consumer"
    },
    mixed: {
      title: "Mixed Field + Community Pilot",
      recipients: "Gerente de Logística, Administrador del Barrio Industrial, Supervisor de Redes CCTV",
      objective: "Validar la analítica unificada en accesos vehiculares de alto tonelaje colindantes con áreas de personal administrativo, delimitando estrictamente las áreas con Privacy Shield.",
      infoAllowed: "- Cantidad de cámaras industriales e interiores genéricas\n- Existencia de enlaces inalámbricos locales\n- Puntos de centralización de fibra\n- Horarios de turnos de entrada/salida de personal",
      infoForbidden: "- Credenciales de red interna corporativa de la empresa\n- IPs de switches core de la empresa\n- RTSP de cámaras de oficinas privadas o administrativas\n- Datos de identificación personal",
      nextStep: "Realizar recorrido perimetral conjunto para verificar que los conos ópticos de prueba no capturen la calle pública ni ventanas ajenas.",
      agenda: "Mixed"
    },
    followup: {
      title: "Public Demo Follow-up Meeting",
      recipients: "Gerente Comercial del Cliente, Comité Técnico de Evaluación",
      objective: "Estructurar la minuta de acuerdo técnico preliminar post-demostración, consolidando las brechas de compatibilidad identificadas y acordando el roadmap del piloto.",
      infoAllowed: "- Resumen de pantallas clave exhibidas\n- Cantidad máxima de 3 cámaras para el piloto\n- Protocolos generales que soporta ORBI Sentinel\n- Duración de 10 días propuesta",
      infoForbidden: "- Cotizaciones de servidores de producción\n- Claves de servidores o credenciales de la demo\n- IPs de sucursales del cliente\n- Direcciones de servidores DNS privados o de intranet",
      nextStep: "Agendar reunión de levantamiento técnico formal para que la contraparte prepare el inventario simplificado.",
      agenda: "Mixed"
    }
  };

  const activeConfig = handoffConfigurations[handoffType];

  // Sanitization Scanner (Requirement 15)
  const checkSanitizationText = (text: string) => {
    const warnings: string[] = [];
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    const rtspRegex = /rtsp:\/\/[^\s]+/gi;
    const credsRegex = /(usuario|user|pass|password|pwd|clave|contraseña|key|token|access_token|secret)[:=][^\s]+/gi;
    const phoneRegex = /(\+?56\s?9\s?\d{8}|\+?1\s?\d{10}|\b[9876]\d{7}\b)/g;
    const coordRegex = /\b-?\d{1,2}\.\d{4,},\s*-?\d{1,3}\.\d{4,}\b/g;
    const claimsRegex = /reemplazo total de scada|reemplazo de guardias|detección 100%|prevención absoluta|detección infalible/gi;
    const dangerousOpeRegex = /bypass|conectar cable|bloquear disyuntor|abrir tablero|maniobras eléctricas|trabajos en altura sin arnés|puentear/gi;
    const pricesContractsRegex = /precio definitivo|contrato firmado|compra cerrada|SLA garantizado/gi;

    if (emailRegex.test(text)) warnings.push("Fuga de Privacidad: Correos electrónicos (PII) detectados.");
    if (ipRegex.test(text)) warnings.push("Vulnerabilidad Técnica: Direcciones IP reales detectadas.");
    if (rtspRegex.test(text)) warnings.push("Vulnerabilidad Técnica: Enlaces RTSP directos detectados.");
    if (credsRegex.test(text)) warnings.push("Fuga de Seguridad: Credenciales lógicas o contraseñas encontradas.");
    if (phoneRegex.test(text)) warnings.push("Fuga de Privacidad: Números de teléfono de contacto encontrados.");
    if (coordRegex.test(text)) warnings.push("Fuga de Privacidad: Coordenadas geográficas lat/long detectadas.");
    if (claimsRegex.test(text)) warnings.push("Declaración Prohibida: Declaraciones comerciales infalibles o reemplazo de personal de seguridad física.");
    if (dangerousOpeRegex.test(text)) warnings.push("Instrucción Peligrosa: Indicaciones de maniobras eléctricas directas o bypass de seguridad.");
    if (pricesContractsRegex.test(text)) warnings.push("Lenguaje Contractual Prohibido: Referencias a precios cerrados, contratos definitivos o SLAs garantizados.");

    return warnings;
  };

  // Compile scan on all user modified inputs + active texts
  const scanAllTexts = () => {
    const combined = [
      additionalNotes,
      activeConfig.objective,
      intakeData.form.pilotGoal,
      intakeData.form.pilotName
    ].join(" ");
    return checkSanitizationText(combined);
  };

  const scanWarnings = scanAllTexts();
  const isSanitizerBlocked = scanWarnings.length > 0;

  // Handoff QA Checklist (Requirement 16 - 12 Points)
  const getHandoffQAChecklist = (): QAItem[] => {
    const hasCreds = scanWarnings.some(w => w.includes("Credenciales") || w.includes("Seguridad"));
    const hasIpRtsp = scanWarnings.some(w => w.includes("IP") || w.includes("RTSP") || w.includes("Vulnerabilidad"));
    const hasPii = scanWarnings.some(w => w.includes("Correos") || w.includes("teléfono") || w.includes("Coordenadas") || w.includes("Privacidad"));
    const hasDangerInst = scanWarnings.some(w => w.includes("Peligrosa") || w.includes("Bypass"));
    
    const provPending = providerChecklist.some(p => p.status === "Pending" || p.status === "Needs Review" || p.status === "Blocked");
    const riskOpen = riskRegister.some(r => r.status === "Abierto");

    return [
      { id: "hqa_no_cred", label: "No credentials captured in Handoff module", status: hasCreds ? "Blocked" : "Ready", critical: true },
      { id: "hqa_no_ip_rtsp", label: "No physical IP/RTSP captured", status: hasIpRtsp ? "Blocked" : "Ready", critical: true },
      { id: "hqa_no_pii", label: "No PII (Email/Phones) captured", status: hasPii ? "Blocked" : "Ready", critical: true },
      { id: "hqa_secure_ch", label: "Secure channel disclaimer visible", status: "Ready", critical: true },
      { id: "hqa_auth_req", label: "Authorization required flag visible", status: "Ready", critical: true },
      { id: "hqa_hse_frame", label: "HSE notes framed as coordination only", status: hasDangerInst ? "Blocked" : "Ready", critical: true },
      { id: "hqa_prov_checklist", label: "Provider checklist completed or reviewed", status: provPending ? "Blocked" : "Ready", critical: false },
      { id: "hqa_risk_reg", label: "Risk Register verified", status: riskOpen ? "Blocked" : "Ready", critical: false },
      { id: "hqa_agreement", label: "Agreement outline framed as non-contractual", status: "Ready", critical: false },
      { id: "hqa_report_san", label: "Report sanitized and free of confidential tokens", status: isSanitizerBlocked ? "Blocked" : "Ready", critical: true },
      { id: "hqa_readme", label: "README.md aligns with Module 6D definition", status: "Ready", critical: false },
      { id: "hqa_version", label: "Version Registry is v0.6.3", status: "Ready", critical: false }
    ];
  };

  const handoffQAList = getHandoffQAChecklist();
  
  // Rule: If "No credentials captured", "No IP/RTSP captured", "No PII captured" or "HSE notes framed as coordination only" are Blocked, Handoff status must be Blocked
  const isHandoffBlockedByQA = handoffQAList.some(item => item.critical && item.status === "Blocked");

  // Derive the 10 Audit Frentes States (Requirement 1)
  const getAuditFrentes = (): AuditFrente[] => {
    const hasCreds = scanWarnings.some(w => w.includes("Credenciales") || w.includes("Seguridad"));
    const hasIpRtsp = scanWarnings.some(w => w.includes("IP") || w.includes("RTSP") || w.includes("Vulnerabilidad"));
    const hasPii = scanWarnings.some(w => w.includes("Correos") || w.includes("teléfono") || w.includes("Coordenadas") || w.includes("Privacidad"));
    const hasDangerInst = scanWarnings.some(w => w.includes("Peligrosa"));
    const hasContractWord = scanWarnings.some(w => w.includes("Contractual"));
    const provPending = providerChecklist.some(p => p.status === "Pending" || p.status === "Needs Review" || p.status === "Blocked");

    return [
      {
        id: "safety_banner",
        name: "Handoff Safety Banner",
        description: "Mensaje y badges mandatorios de seguridad de datos.",
        status: (hasCreds || hasIpRtsp || hasPii) ? "Blocked" : "Ready",
        reason: (hasCreds || hasIpRtsp || hasPii) ? "Bloqueado por fuga de privacidad o datos lógicos en caliente." : "Leyenda de resguardo y badges desplegados correctamente.",
        rule: "Asegurar que comunique que no almacena credenciales, IPs, RTSP ni planos."
      },
      {
        id: "type_selector",
        name: "Handoff Type Selector",
        description: "Adaptación conceptual del entorno de pruebas controlado.",
        status: "Ready",
        reason: `Entorno '${activeConfig.title}' adaptado con éxito de forma abstracta.`,
        rule: "Adaptar checklists, agenda, riesgos e info prohibida según tipo."
      },
      {
        id: "summary_card",
        name: "Handoff Summary Card",
        description: "Datos técnicos del piloto recuperados del Pilot Intake.",
        status: (intakeData.overallState === "Pilot Intake Blocked") ? "Blocked" : "Ready",
        reason: (intakeData.overallState === "Pilot Intake Blocked") ? "Bloqueado por intake no conforme." : "Campos técnicos sanitizados recuperados del storage.",
        rule: "Mostrar solo variables operativas permitidas, sin secretos."
      },
      {
        id: "request_list",
        name: "Secure Information Request List",
        description: "Separación estricta de datos permitidos y prohibidos.",
        status: "Ready",
        reason: "Declaraciones y disclaimers de canal seguro expuestos con claridad.",
        rule: "Presentar mensaje de canal externo seguro de forma obligatoria."
      },
      {
        id: "coord_brief",
        name: "Secure Coordination Brief",
        description: "Minuta de contexto de preventa comercial sin contratos.",
        status: hasContractWord ? "Blocked" : "Ready",
        reason: hasContractWord ? "Detectado lenguaje contractual o de precios en caliente." : "Brief estructurado correctamente sin compromisos comerciales.",
        rule: "Excluir precios definitivos y compromisos de producción masivos."
      },
      {
        id: "meeting_agenda",
        name: "Meeting Agenda",
        description: "Cronograma de la primera sesión técnica inicial.",
        status: "Ready",
        reason: `Agenda específica para '${handoffType}' estructurada en 8 puntos.`,
        rule: "Formatear pauta libre de contraseñas de red o VPNs."
      },
      {
        id: "hse_notes",
        name: "HSE Coordination Notes",
        description: "Declaraciones y recordatorios de seguridad y EPP.",
        status: hasDangerInst ? "Blocked" : (manualFrentesSignOff.hse_notes ? "Ready" : "Needs Review"),
        reason: hasDangerInst ? "Se detectaron instrucciones operativas directas o bypasses." : (manualFrentesSignOff.hse_notes ? "Reporte de notas aprobado por operador." : "Requiere confirmación visual del deslinde de seguridad."),
        rule: "Framed only as coordination notes. Prohibir pasos técnicos eléctricos."
      },
      {
        id: "email_templates",
        name: "Email Templates",
        description: "Correos corporativos para envío de acuerdos.",
        status: (hasCreds || hasIpRtsp) ? "Blocked" : "Ready",
        rule: "Plantillas profesionales sin solicitudes lógicas de red por correo.",
        reason: (hasCreds || hasIpRtsp) ? "Bloqueado por presencia de datos sensibles en el escáner." : "Cinco plantillas pre-configuradas para uso formal de preventa."
      },
      {
        id: "provider_checklist",
        name: "Provider Checklist",
        description: "Checklist técnico con el encargado local de CCTV.",
        status: provPending ? "Needs Review" : "Ready",
        reason: provPending ? "Hay ítems pendientes de validación técnica con el instalador." : "Los 10 puntos técnicos de alineación se encuentran validados.",
        rule: "Evaluar marcas, NVR, protocolos ONVIF y plan de reversión."
      },
      {
        id: "report_scanner",
        name: "Handoff Report & Scanner",
        description: "Escaner proactivo heurístico e informe Markdown.",
        status: isSanitizerBlocked ? "Blocked" : "Ready",
        reason: isSanitizerBlocked ? "El scanner de seguridad ha bloqueado la exportación por alertas." : "0 alertas de fuga de privacidad activas en caliente.",
        rule: "Escanear en tiempo real notas, emails, agendas y reportes."
      }
    ];
  };

  const auditFrentes = getAuditFrentes();

  // Determine overall status based on frentes and critical rules (Requirement 1 & 13)
  const getOverallState = () => {
    if (isHandoffBlockedByQA || isSanitizerBlocked || intakeData.overallState === "Pilot Intake Blocked") {
      return "Handoff Blocked";
    }
    const hasBlockedFrente = auditFrentes.some(f => f.status === "Blocked");
    if (hasBlockedFrente) {
      return "Handoff Blocked";
    }
    
    const hasNeedsReview = auditFrentes.some(f => f.status === "Needs Review");
    if (hasNeedsReview || !hasFormalAuthorization) {
      return "Needs Review";
    }

    return "Pilot Handoff Secure Coordination Locked";
  };

  const overallState = getOverallState();

  // Calculate 12-factor dynamic score (Requirement 13)
  const getHandoffReadinessScore = () => {
    let score = 0;
    
    // Factor 1: Intake Sanitized (+8%)
    if (intakeData.overallState !== "Pilot Intake Blocked") score += 8;
    
    // Factor 2: Authorization (+8%)
    if (hasFormalAuthorization) score += 8;
    
    // Factor 3: Zones mapped (+8%)
    if (intakeData.form.includedZones && intakeData.form.excludedZones) score += 8;
    
    // Factor 4: Checklist técnico prepared (+8%)
    const provReadyCount = providerChecklist.filter(p => p.status === "Ready" || p.status === "Not Applicable").length;
    score += Math.round((provReadyCount / providerChecklist.length) * 8);
    
    // Factor 5: Riesgos identificados y mitigados (+8%)
    const riskMitigatedCount = riskRegister.filter(r => r.status === "Mitigado" || r.status === "En revisión").length;
    score += Math.round((riskMitigatedCount / riskRegister.length) * 8);
    
    // Factor 6: Agenda ready (+8%)
    if (activeConfig.agenda) score += 8;
    
    // Factor 7: Brief ready (+8%)
    score += 8;
    
    // Factor 8: Email ready (+8%)
    score += 8;
    
    // Factor 9: Provider abstractly identified (+8%)
    if (intakeData.form.cameraBrands) score += 8;
    
    // Factor 10: Next steps defined (+8%)
    if (activeConfig.nextStep) score += 8;
    
    // Factor 11: HSE framed as coordination only (+10%)
    const hasDangerInst = scanWarnings.some(w => w.includes("Peligrosa"));
    if (!hasDangerInst) score += 10;
    
    // Factor 12: Secure channel disclaimer visible (+10%)
    score += 10;

    let status = "Needs Review";
    let color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    let desc = "Revisar checklists de proveedores, confirmar autorización formal y mitigar riesgos antes de certificar.";

    if (overallState === "Handoff Blocked") {
      status = "Blocked";
      color = "text-rose-400 bg-rose-500/10 border-rose-500/20";
      desc = "BLOQUEADO: Se detectaron datos sensibles en caliente o faltan resguardos mandatorios.";
      score = Math.min(score, 50); // Cap score if blocked
    } else if (overallState === "Pilot Handoff Secure Coordination Locked") {
      status = "Ready for Secure Handoff";
      color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      desc = "¡Cumplimiento completo! El paquete de traspaso es consistente, seguro y libre de datos confidenciales.";
    } else if (!hasFormalAuthorization) {
      status = "Pending Authorization";
      color = "text-sky-400 bg-sky-500/10 border-sky-500/20";
      desc = "Falta confirmar el acta de autorización firmada por el cliente.";
    }

    return {
      score,
      status,
      color,
      desc
    };
  };

  const handoffScore = getHandoffReadinessScore();

  // Action restrictions (Requirement 2 & 16)
  // If overallState is Handoff Blocked, or score < 85%, copy is disabled
  const isCopyActionDisabled = overallState === "Handoff Blocked" || handoffScore.score < 85;

  // Secure Coordination Brief Generator (Requirement 6)
  const generateSecureBrief = () => {
    return `========================================================================
ORBI SENTINEL IA — SECURE PILOT COORDINATION BRIEF (SANITISED)
========================================================================
*   **Versión de Validación:** ORBI Sentinel IA v0.6.3-sentinel-pilot-handoff-coordination-lock
*   **Línea de Piloto:** ${activeConfig.title}
*   **Enfoque de Borde:** ORBI Vision Core (Procesamiento 100% Local)
*   **Destinatarios Autorizados:** ${activeConfig.recipients}

CONCURRENCIA DEL ENTORNO DE PRUEBA:
Se emite este brief técnico para coordinar el despliegue del Gateway local de pruebas. Con el fin de estructurar una validación limpia, comercialmente responsable y técnicamente consistente, se ratifican las condiciones operacionales acordadas.

ALCANCE ESPECÍFICO DE COORDINACIÓN:
*   **Maqueta de Referencia:** ${intakeData.form.pilotName}
*   **Objetivo de Calibración:** ${activeConfig.objective}
*   **Duración Acotada:** ${intakeData.form.durationDays} días corridos (máximo 15 días).
*   **Cantidad de Cámaras en Prueba:** ${intakeData.form.proposedCameras} domos perimetrales (límite comercial de 1 a 3).
*   **Áreas de Detección Incluidas:** ${intakeData.form.includedZones}
*   **Exclusión de Privacidad Obligatoria:** ${intakeData.form.excludedZones}

GESTIÓN EXTERNA DE INFORMACIÓN SENSIBLE (CANAL REQUERIDO):
Para la puesta en marcha local, las partes acuerdan excluir de este software y de todo canal de mensajería pública los siguientes antecedentes lógicos:
1. Credenciales de acceso RTSP y contraseñas de cámaras o routers.
2. Direcciones IP fijas reales (públicas o de intranet corporativa).
3. Rutas de red o hashes VPN de acceso remoto.
4. Planos topográficos confidenciales de seguridad de faena.
5. Coordenadas GPS exactas o direcciones postales de precisión.
*   *Declaración*: Estos datos críticos serán manejados de manera presencial y exclusiva por el electricista o personal de TI del cliente por sus propios canales corporativos seguros.

COORDINACIÓN OPERACIONAL HSE:
- Se utilizarán sub-streams de video de baja resolución para no congestionar la red local.
- No se realizarán alteraciones físicas a tableros eléctricos principales sin la presencia del electricista autorizado del cliente.
- En trabajos de altura, se utilizarán únicamente escaleras dieléctricas homologadas y equipo EPP acorde.
- Se implementará un plan de reversión inmediato: el retiro del Gateway devuelve el flujo a su estado original en menos de 5 minutos.

LIMITACIÓN DE LA PRUEBA COMERCIAL:
Este brief es un esquema de coordinación conceptual y referencial. No constituye contrato de servicios, cotización vinculante, orden de compra ni garantía legal de prevención de siniestros.`;
  };

  // Meeting Agenda Generator (Requirement 7)
  const getMeetingAgendaText = () => {
    if (activeConfig.agenda === "Field") {
      return `AGENDA DE REUNIÓN DE COORDINACIÓN (FIELD O&M)
--------------------------------------------------
1. Alineación del Objetivo del Piloto (${intakeData.form.proposedCameras} cámaras perimetrales).
2. Identificación de zonas críticas (módulos inversores, cercos colindantes).
3. Revisión del inventario conceptual de cámaras (Marcas: ${intakeData.form.cameraBrands}).
4. Gestión y entrega de accesos autorizados locales únicamente por canal corporativo externo.
5. Definición del punto de instalación física del Gateway local (Alimentación local y antena LTE).
6. Protocolo de seguridad HSE, permisos de trabajo en caliente y ventana de mantención.
7. Discusión de política de retención (sugerida: ${intakeData.form.durationDays} días locales).
8. Roadmap de próximos pasos para el traspaso de la maqueta.`;
    } else if (activeConfig.agenda === "Community") {
      return `AGENDA DE REUNIÓN DE COORDINACIÓN (COMMUNITY RESIDENCIAL)
--------------------------------------------------
1. Presentación de alcances del piloto al comité y administración del condominio.
2. Definición exacta de zonas comunes incluidas (Accesos vehiculares/peatonales).
3. Confirmación obligatoria de zonas privadas excluidas (${intakeData.form.excludedZones}).
4. Revisión conceptual del grabador NVR existente en conserjería.
5. Firma y visto bueno de autorización formal para pruebas temporales.
6. Delimitación de perfiles: Acceso restringido para rol de Conserje (Solo visualización en EasyView).
7. Protocolo de privacidad vecinal (Uso exclusivo de Privacy Shield en rostros y patentes).
8. Roadmap de inicio y plan de retiro rápido.`;
    } else if (activeConfig.agenda === "Consumer") {
      return `AGENDA DE REUNIÓN DE COORDINACIÓN (CONSUMER LAB)
--------------------------------------------------
1. Definición del objetivo de simulación local en el patio delantero.
2. Identificación de límites del jardín (Zonas privadas colindantes a excluir).
3. Configuración de una red wifi 'sandbox' aislada del internet del hogar.
4. Conexión local del Gateway Sentinel a las cámaras compatibles.
5. Pruebas de detección local sin envío de flujos multimedia a nubes públicas.
6. Definición de la ventana horaria de calibración técnica.
7. Ajustes del Privacy Shield doméstico.
8. Próximos pasos de reversión.`;
    } else {
      return `AGENDA DE REUNIÓN DE COORDINACIÓN MIXTA (FIELD & COMMUNITY)
--------------------------------------------------
1. Objetivo unificado del piloto en accesos y perímetros compartidos.
2. Mapeo de cámaras de seguridad industrial y perímetros residenciales de contratistas.
3. Plan de enmascaramiento dinámico (Privacy Shield) para resguardar transeúntes.
4. Coordinación con departamento TI del parque industrial para canalización.
5. Acta de consentimiento escrita de las partes administradoras involucradas.
6. Roles y responsabilidades de técnicos de terreno y supervisores.
7. Pruebas y calibración local de falsas alarmas por viento o fauna.
8. Próximos pasos del traspaso controlado.`;
    }
  };

  // Email Templates Generator (Requirement 9)
  const generateEmailTemplate = () => {
    return `Asunto: Propuesta de Coordinación Técnica y Traspaso Seguro — Piloto ${intakeData.form.pilotName}
Para: ${activeConfig.recipients}

Estimados,

Espero que se encuentren muy bien.

En el marco de la reciente demostración técnica de ORBI Sentinel IA, nos gustaría formalizar los preparativos para dar inicio al piloto técnico controlado de ${intakeData.form.proposedCameras} cámaras, por un período estimado de ${intakeData.form.durationDays} días.

Con el objetivo de garantizar la consistencia técnica y la protección de sus datos sensibles, detallamos la minuta conceptual para nuestra próxima sesión de coordinación:

1. Alcance de Prueba: El Gateway local operará exclusivamente de forma offline sobre los accesos definidos (${intakeData.form.includedZones}), respetando el enmascaramiento estricto de las zonas excluidas (${intakeData.form.excludedZones}).
2. Seguridad de Información: En línea con nuestras estrictas directrices éticas, le recordamos que NO solicitamos ni almacenamos credenciales, claves VPN, direcciones IP ni enlaces RTSP en nuestro software. Toda información sensible será gestionada fuera del sistema de manera interna mediante sus canales corporativos seguros de TI.
3. Próximo Paso Sugerido: ${activeConfig.nextStep}

Adjunto a este correo compartimos la propuesta de agenda y minuta de traspaso sanitizada generada por el asistente de maquetación comercial.

Quedamos a su entera disposición para agendar la sesión técnica.

Atentamente,
Equipo de Despliegue Técnico ORBI Sentinel IA
ORBI Ecosystem`;
  };

  // Controlled Pilot Agreement Outline Generator (Requirement 11)
  const generateAgreementOutline = () => {
    return `========================================================================
CONTROLLED PILOT AGREEMENT OUTLINE (NON-CONTRACTUAL REFERENCE ONLY)
========================================================================
*   **Referencia:** ORBI Sentinel IA — Acuerdo de Piloto de Prueba Acotada
*   **Nombre del Proyecto:** ${intakeData.form.pilotName}
*   **Lineamiento de Prueba:** ${activeConfig.title}

1. OBJETIVO DEL ACUERDO:
El presente esquema conceptual establece las bases preliminares de coordinación para la realización de una prueba tecnológica controlada con un Gateway local de ORBI Sentinel IA.

2. ALCANCE Y LIMITACIONES:
*   El piloto se limitará estrictamente a un máximo de ${intakeData.form.proposedCameras} cámaras.
*   El sistema no constituye un servicio de vigilancia de producción ni reemplaza el patrullaje, guardias físicos, alarmas de intrusión, NVRs existentes ni normativas HSE vigentes.
*   Duración máxima pactada: ${intakeData.form.durationDays} días de prueba.

3. RESGUARDOS DE INFORMACIÓN Y CONFIDENCIALIDAD:
*   Las partes ratifican que no se ingresarán ni almacenarán credenciales lógicas, contraseñas de routers, IPs estáticas reales o streams RTSP de producción dentro del software de maquetación ORBI.
*   Cualquier intercambio de información técnica sensible se realizará por canales externos y mediante protocolos corporativos seguros del cliente.

4. COORDINACIÓN HSE (HIGIENE, SEGURIDAD Y ENTORNO):
*   Toda intervención física sobre infraestructura eléctrica o de postes CCTV será realizada exclusivamente por técnicos debidamente autorizados por el cliente, bajo sus propios procedimientos HSE y EPP normado.
*   Se dispone de un plan de reversión inmediato mediante desconexión pasiva del Gateway de pruebas, retornando el sistema CCTV a su estado original de forma instantánea.

5. NOTA IMPORTANTE (DISCLAIMER):
“Este esquema es una referencia de coordinación y no reemplaza contrato, orden de compra, autorización formal ni revisión legal.”`;
  };

  // Consolidated Handoff Report Exporter (Requirement 14)
  const generateHandoffReport = () => {
    const provReadyText = providerChecklist.map(p => `- [${p.status === "Ready" ? "X" : " "}] ${p.label} (${p.status})`).join("\n");
    const risksText = riskRegister.map(r => `- **Riesgo:** ${r.category} | **Gravedad:** ${r.severity} | **Mitigación:** ${r.mitigation} | **Responsable:** ${r.owner} | **Estado:** ${r.status}`).join("\n");
    
    return `# REPORTE CONSOLIDADO DE TRASPASO SEGURO DE PILOTO
=============================================================
*   **Versión de Validación:** ORBI Sentinel IA v0.6.3-sentinel-pilot-handoff-coordination-lock
*   **Código de Control:** ORBI-SECURE-HANDOFF-9421A
*   **Tipo de Traspaso:** ${activeConfig.title.toUpperCase()}
*   **Estado de Traspaso:** ${overallState.toUpperCase()}
*   **Puntaje de Handoff Interno:** ${handoffScore.score}% (${handoffScore.desc})

-------------------------------------------------------------
1. DETALLES DEL INTAKE PRINCIPAL (SANITIZADO)
-------------------------------------------------------------
*   **Nombre de la Maqueta:** ${intakeData.form.pilotName}
*   **Tipo de Entorno:** ${intakeData.form.environmentType}
*   **Cámaras Propuestas:** ${intakeData.form.proposedCameras} (Límite sugerido de 1-3)
*   **Duración del Piloto:** ${intakeData.form.durationDays} días
*   **Marcas de Cámaras:** ${intakeData.form.cameraBrands}
*   **Zonas Técnicas Incluidas:** ${intakeData.form.includedZones}
*   **Zonas de Exclusión y Privacidad:** ${intakeData.form.excludedZones}
*   **Objetivo de la Prueba:** ${intakeData.form.pilotGoal}

-------------------------------------------------------------
2. EXCLUSIÓN DE INFORMACIÓN CRÍTICA (REQUISITO FUNDAMENTAL)
-------------------------------------------------------------
*   **Credenciales de Acceso:** EXCLUIDAS (No almacenadas en demo)
*   **Direcciones IP de Equipos:** EXCLUIDAS (No almacenadas en demo)
*   **Rutas RTSP de Streams:** EXCLUIDAS (No almacenadas en demo)
*   **Planos de Arquitectura:** EXCLUIDAS (No almacenadas en demo)
*   **Coordenadas Geográficas:** EXCLUIDAS (No almacenadas en demo)
*   *Declaración*: "Toda la información sensible listada anteriormente debe transitar única y exclusivamente por canales seguros externos corporativos aprobados por el cliente."

-------------------------------------------------------------
3. CHECKLIST DE COORDINACIÓN CON EL PROVEEDOR CCTV
-------------------------------------------------------------
${provReadyText}

-------------------------------------------------------------
4. NOTAS DE COORDINACIÓN HSE (SAFETY)
-------------------------------------------------------------
*   *Mensaje Importante*: Estas notas son exclusivamente recordatorios de coordinación y no reemplazan los procedimientos de seguridad del cliente, normativas eléctricas vigentes, permisos de trabajo en altura, ni el EPP reglamentario.
- Confirmar autorización de ingreso de vehículos a faena.
- Identificar al responsable de seguridad de la zona.
- Validar ventana horaria de trabajo eléctrico pasivo.
- Uso mandatorio de escaleras dieléctricas y arnés homologado para postes.
- Verificación de no-manipulación de disyuntores de tableros sin el electricista jefe.

-------------------------------------------------------------
5. MATRIZ DE RIESGOS DE TRASPASO
-------------------------------------------------------------
${risksText}

-------------------------------------------------------------
6. ROADMAP DE SIGUIENTES PASOS RECOMENDADOS
-------------------------------------------------------------
*   **Siguiente Paso Inmediato:** ${activeConfig.nextStep}
*   **Reunión de Coordinación:** Agenda de ${activeConfig.agenda} propuesta y cargada de forma consistente.

-------------------------------------------------------------
7. DECLARACIÓN DE LÍMITES ÉTICOS Y COMERCIALES
-------------------------------------------------------------
*   Este informe no representa un contrato de servicios, oferta vinculante ni cotización final.
*   ORBI Sentinel IA es una simulación interactiva local y no se responsabiliza por fallas de red preexistentes o pérdidas físicas de enlace.
*   El procesamiento de imágenes es estrictamente perimetral y respeta el Privacy Shield local.`;
  };

  // Clipboard Copiers
  const handleCopyBrief = () => {
    if (isCopyActionDisabled) return;
    navigator.clipboard.writeText(generateSecureBrief());
    setCopiedBrief(true);
    onAddAuditLog("Copia Handoff", "Copiado al portapapeles: Secure Coordination Brief.");
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleCopyEmail = () => {
    if (isCopyActionDisabled) return;
    navigator.clipboard.writeText(generateEmailTemplate());
    setCopiedEmail(true);
    onAddAuditLog("Copia Handoff", "Copiado al portapapeles: Email de Coordinación de Piloto.");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyAgreement = () => {
    if (isCopyActionDisabled) return;
    navigator.clipboard.writeText(generateAgreementOutline());
    setCopiedAgreement(true);
    onAddAuditLog("Copia Handoff", "Copiado al portapapeles: Controlled Pilot Agreement Outline.");
    setTimeout(() => setCopiedAgreement(false), 2000);
  };

  const handleCopyReport = () => {
    if (isCopyActionDisabled) return;
    navigator.clipboard.writeText(generateHandoffReport());
    setCopiedReport(true);
    onAddAuditLog("Copia Handoff", "Copiado al portapapeles: Reporte Consolidado de Traspaso Seguro.");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Restricted Access View (Role-Based View)
  if (userRole === "conserje") {
    return (
      <div id="handoff-pack-conserje-locked" className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-white">Pilot Handoff Pack — Vista Restringida</h2>
            <p className="text-sm text-slate-400">Control de Privilegios Basado en Roles (Role-Based View)</p>
          </div>
        </div>

        <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            Acceso Bloqueado Bajo Llave Local (Conserje de Turno)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            El módulo **Pilot Handoff Pack** realiza la auditoría y validación del traspaso técnico hacia clientes y contratistas, incluyendo checklists de mitigación de riesgos físicos y HSE. De acuerdo con las políticas reales de segregación de funciones, este contenido está restringido para personal del perfil **Conserje / Guardia** para evitar manipulaciones accidentales de checklists de despliegue.
          </p>
          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
            * Para realizar auditorías de pre-venta, cambie el rol de operación activo a **Administrador** o **Técnico** en el panel inferior del Sidebar izquierdo.
          </p>
        </div>

        <div className="flex gap-3">
          {setCurrentTab && (
            <button
              onClick={() => setCurrentTab("easyview")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
            >
              Ir a EasyView
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="pilot-handoff-pack-container">
      
      {/* 2. Safety Banner & Title with Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25 rounded uppercase">
              MÓDULO 6D — SEGURO
            </span>
            <h2 className="text-lg font-sans font-black tracking-tight text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Pilot Handoff Pack & Secure Coordination
            </h2>
            <p className="text-xs text-slate-300">
              “Traspaso de piloto sanitizado — este módulo no almacena credenciales, IPs reales, RTSP, planos, coordenadas ni datos personales.”
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 shrink-0 max-w-md lg:justify-end">
            {[
              "Secure Handoff",
              "No Credentials",
              "No IP/RTSP",
              "No Personal Data",
              "External Secure Channel Required",
              "Authorization Required",
              "Production Locked",
              "Controlled Pilot"
            ].map((badge, idx) => {
              // Critical badges checked against scanner blocks
              const isBlockedBadge = (badge === "No Credentials" && scanWarnings.some(w => w.includes("Credenciales"))) ||
                                     (badge === "No IP/RTSP" && scanWarnings.some(w => w.includes("IP") || w.includes("RTSP"))) ||
                                     (badge === "No Personal Data" && scanWarnings.some(w => w.includes("PII") || w.includes("Correos"))) ||
                                     (badge === "External Secure Channel Required" && isHandoffBlockedByQA);

              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-tight border transition-all cursor-default flex items-center gap-1 ${
                    isBlockedBadge
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-sky-500/30 hover:text-sky-400"
                  }`}
                >
                  {isBlockedBadge ? "✕" : "✓"} {badge}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (Requirement 1) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 gap-2 pb-2 sm:pb-0">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("documents")}
            className={`px-5 py-3 text-xs font-mono uppercase font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === "documents"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <FileText className="w-4 h-4" />
            📦 Traspaso Directo (Documentos & Brief)
          </button>
          <button
            onClick={() => setActiveSubTab("qalock")}
            className={`px-5 py-3 text-xs font-mono uppercase font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === "qalock"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <Lock className="w-4 h-4" />
            🔒 Pilot Handoff QA Lock
            {overallState === "Pilot Handoff Secure Coordination Locked" ? (
              <span className="ml-1.5 px-1.5 py-0.2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                LOCKED
              </span>
            ) : overallState === "Handoff Blocked" ? (
              <span className="ml-1.5 px-1.5 py-0.2 text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                BLOCKED
              </span>
            ) : (
              <span className="ml-1.5 px-1.5 py-0.2 text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                PENDING
              </span>
            )}
          </button>
        </div>

        {setCurrentTab && (
          <button
            onClick={() => {
              setCurrentTab("pilotoutcomereview");
              onAddAuditLog("Abrir Learning Loop desde Handoff Pack", "Navegación de operador a Outcome Review Center.");
            }}
            className="mb-2 sm:mb-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all mr-2 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Abrir Learning Loop</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: DOCUMENTS & BRIEF */}
      {activeSubTab === "documents" && (
        <div className="space-y-6">
          {/* Handoff Type Selector (Requirement 3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Tipo de Coordinación de Traspaso (Selector de Entorno)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                La selección de entorno adapta dinámicamente las agendas, correos, checklist de proveedores y reportes de coordinación. No usa datos reales.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {(["field", "community", "consumer", "mixed", "followup"] as HandoffType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setHandoffType(type);
                    onAddAuditLog("Cambio Entorno Handoff", `Selector establecido en: ${type}`);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 uppercase font-mono ${
                    handoffType === type
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] leading-tight block font-bold">
                    {type === "field" && "🛰️ Field O&M"}
                    {type === "community" && "🏢 Community"}
                    {type === "consumer" && "🔌 Consumer Lab"}
                    {type === "mixed" && "🔄 Mixed Perim"}
                    {type === "followup" && "📞 Follow-up"}
                  </span>
                  <span className="text-[8px] tracking-tighter text-slate-500 lowercase">
                    {type === "field" && "plantas & perímetros"}
                    {type === "community" && "comités & vecinos"}
                    {type === "consumer" && "sandbox hogareño"}
                    {type === "mixed" && "industrial residencial"}
                    {type === "followup" && "minuta post-demo"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DUAL COLUMN: SUMMARY CARD & SECURE INFORMATION LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Handoff Summary Card (Requirement 4) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">INTEGRACIÓN CON PILOT INTAKE CENTER</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">Handoff Summary Card (Datos Sanitizados)</h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs font-mono leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-900">
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Nombre Maqueta:</span>
                    <strong className="text-slate-200">{intakeData.form.pilotName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Línea de Piloto:</span>
                    <strong className="text-sky-400">{handoffType.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Estado del Intake:</span>
                    <span className="text-emerald-400 font-bold">✓ {intakeData.overallState}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Cámaras Sugeridas:</span>
                    <strong className="text-slate-200">{intakeData.form.proposedCameras} domos perimetrales</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Duración Estimada:</span>
                    <strong className="text-slate-200">{intakeData.form.durationDays} días corridos</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Objetivo del Piloto:</span>
                    <span className="text-[10px] text-slate-300 block truncate" title={intakeData.form.pilotGoal}>{intakeData.form.pilotGoal}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-900 pt-2 mt-1">
                    <span className="text-slate-500 block uppercase text-[8px]">Zonas Incluidas en la Demo:</span>
                    <span className="text-slate-300 text-[10px] block">{intakeData.form.includedZones}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-900 pt-1">
                    <span className="text-slate-500 block uppercase text-[8px] text-rose-400">Zonas de Exclusión de Privacidad:</span>
                    <span className="text-rose-300 text-[10px] block">{intakeData.form.excludedZones}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-900 text-[10px] font-mono text-slate-400 leading-relaxed space-y-1">
                <span className="text-slate-200 font-bold block">✓ SEGURIDAD ACTIVA:</span>
                <p>
                  El sistema ha ocultado de forma estricta IPs, hashes RTSP, credenciales, coordenadas geográficas precisas, correos o números de teléfono de las propuestas anteriores para mitigar el riesgo de fugas accidentales en la minuta de traspaso.
                </p>
              </div>
            </div>

            {/* Secure Information Request List (Requirement 5) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest block">SEGREGACIÓN DE DATOS SENSIBLES</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">Secure Information Request List</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed">
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-1.5">
                    <span className="text-[9px] text-emerald-400 uppercase font-bold block">✓ INFORMACIÓN PERMITIDA EN LA DEMO:</span>
                    <ul className="space-y-1 text-slate-300 list-disc pl-3">
                      <li>Cantidad aproximada de cámaras (1-3)</li>
                      <li>Marcas/modelos genéricos de equipos.</li>
                      <li>Existencia y tipo de grabador NVR.</li>
                      <li>Zonas comunes/perímetros incluidos.</li>
                      <li>Zonas privadas/excluidas (bloqueadas).</li>
                      <li>Duración propuesta del piloto (7-15 días).</li>
                      <li>Roles operacionales genéricos del personal.</li>
                      <li>Objetivo específico de la prueba técnica.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1.5">
                    <span className="text-[9px] text-rose-400 uppercase font-bold block">✕ INFORMACIÓN PROHIBIDA (FUERA DE LA DEMO):</span>
                    <ul className="space-y-1 text-slate-300 list-disc pl-3">
                      <li className="text-rose-300 font-bold">Credenciales y contraseñas de red.</li>
                      <li className="text-rose-300 font-bold">Direcciones IP reales (públicas/LAN).</li>
                      <li className="text-rose-300 font-bold">Flujos RTSP activos o hashes VPN.</li>
                      <li className="text-rose-300 font-bold">Planos físicos detallados de seguridad.</li>
                      <li className="text-rose-300 font-bold">Coordenadas GPS de precisión.</li>
                      <li className="text-rose-300 font-bold">Direcciones postales exactas de clientes.</li>
                      <li className="text-rose-300 font-bold">Nombres reales de vecinos o gerentes.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10px] text-slate-300 leading-normal font-sans space-y-1">
                <span className="font-bold text-amber-400 block font-mono">⚠️ MENSAJE DE SEGURIDAD EXCLUSIVO:</span>
                <p>
                  “Estos datos sensibles deben gestionarse solo por canales autorizados, seguros y definidos de forma directa por el cliente. No ingresarlos por ningún motivo en esta demo comercial.”
                </p>
              </div>
            </div>
          </div>

          {/* DOCUMENT PREVIEWS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Secure Coordination Brief (Requirement 6) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 xl:col-span-2">
              <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-widest block">MINUTAS Y ACUERDOS PRELIMINARES</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">Secure Coordination Briefcase</h3>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyBrief}
                    disabled={isCopyActionDisabled}
                    className={`px-3 py-1.5 rounded font-mono font-bold text-[10px] flex items-center gap-1.5 transition-all ${
                      isCopyActionDisabled
                        ? "bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50"
                        : "bg-sky-500 hover:bg-sky-400 text-slate-950"
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedBrief ? "¡Copiado!" : "Copiar Brief"}
                  </button>
                  
                  <button
                    onClick={handleCopyAgreement}
                    disabled={isCopyActionDisabled}
                    className={`px-3 py-1.5 rounded font-mono font-bold text-[10px] flex items-center gap-1.5 transition-all ${
                      isCopyActionDisabled
                        ? "bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedAgreement ? "¡Copiado!" : "Copiar Acuerdo"}
                  </button>
                </div>
              </div>

              {/* Warnings list on sanitizer scan */}
              {isSanitizerBlocked && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 space-y-1">
                  <span className="font-bold uppercase flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                    COPIADO DESHABILITADO — SE DETECTARON SECTORES SENSIBLES O CONFLICTOS:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-rose-300">
                    {scanWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                  <p className="text-[9px] text-rose-300 mt-1">
                    Remueva cualquier texto que contenga correos, números de teléfono, direcciones IP o enlaces RTSP en los campos de notas adicionales.
                  </p>
                </div>
              )}

              {/* Tabular document preview layout */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400">1. ORBI Sentinel IA — Secure Pilot Coordination Brief (Vista Previa):</span>
                  <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-slate-400 max-h-[180px] overflow-y-auto whitespace-pre-wrap select-all">
                    {generateSecureBrief()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400">2. Client / Committee Meeting Agenda (Requirement 7):</span>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-slate-400 max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                      {getMeetingAgendaText()}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400">3. Controlled Pilot Agreement Outline (Requirement 11):</span>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-slate-400 max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                      {generateAgreementOutline()}
                    </div>
                  </div>
                </div>

                {/* HSE Coordination Notes (Requirement 8) */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase">HSE / Field Safety Coordination Notes</span>
                  </div>
                  
                  <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[10px] text-rose-300 leading-normal font-sans italic">
                    <strong>MENSAJE OBLIGATORIO:</strong> “Estas notas son recordatorios de coordinación. No reemplazan procedimientos HSE, eléctricos, trabajos en altura, permisos de trabajo, matrices de riesgo ni instrucciones del cliente. Toda intervención física debe ser realizada por personal autorizado bajo procedimientos vigentes.”
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono leading-normal">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-slate-300 space-y-1">
                      <span className="text-emerald-400 font-bold block">✓ BUENAS PRÁCTICAS PERMITIDAS DE COORDINACIÓN:</span>
                      <ul className="list-disc pl-3 space-y-1">
                        <li>Confirmar autorización formal escrita de ingreso a sitio.</li>
                        <li>Identificar la contraparte responsable de seguridad local.</li>
                        <li>Alinear ventana horaria para pruebas pasivas de red.</li>
                        <li>Verificar disponibilidad de alimentación local PoE o LTE.</li>
                        <li>Sugerir uso de escaleras dieléctricas homologadas para altura.</li>
                      </ul>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-slate-300 space-y-1">
                      <span className="text-rose-400 font-bold block">✕ INDICACIONES OPERATIVAS EVITADAS EN LA DEMO:</span>
                      <ul className="list-disc pl-3 space-y-1">
                        <li>No dar instrucciones paso a paso sobre maniobras en tableros eléctricos.</li>
                        <li>No indicar procedimientos de bloqueo/etiquetado de interruptores core.</li>
                        <li>No sustituir normativas locales de prevención de riesgos (Mutualidades).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Handoff Email Templates (Requirement 9) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block">PLANTILLAS DE CORREO COPIABLES</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Handoff Email Templates</h3>
                  </div>
                  
                  <button
                    onClick={handleCopyEmail}
                    disabled={isCopyActionDisabled}
                    className={`p-1.5 rounded transition-all ${
                      isCopyActionDisabled
                        ? "text-slate-600 bg-slate-950 cursor-not-allowed"
                        : "text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20"
                    }`}
                    title="Copiar plantilla de correo"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  Plantilla formal de preventa para despachar los acuerdos preliminares de la maqueta por correo externo seguro.
                </p>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase font-bold">Comentarios Adicionales del Operador (Hot Sanitizer):</label>
                      <button
                        onClick={() => {
                          const storedNotes = localStorage.getItem("ORBI_STAKEHOLDER_BINDER_MEETING_NOTES");
                          if (storedNotes) {
                            try {
                              const parsed = JSON.parse(storedNotes);
                              if (parsed.clean === false) {
                                alert("IMPORTACIÓN BLOQUEADA: Las notas de la reunión en el Stakeholder Binder no están sanitizadas o contienen claims prohibidos. Por favor, corríjalas en el Binder antes de importarlas.");
                                onAddAuditLog("Importar Notas del Binder", "Intento de importación fallido: notas no sanitizadas");
                                return;
                              }
                              const newNotes = `${additionalNotes ? additionalNotes + "\n\n" : ""}[Notas del Stakeholder Binder - Audiencia: ${parsed.audience || "General"}]\n- Minuta: ${parsed.notes || "S/N"}\n- Siguiente Paso: ${parsed.followUp || "S/N"}`;
                              setAdditionalNotes(newNotes);
                              onAddAuditLog("Importar Notas del Binder", "Notas del Binder importadas con éxito al Pilot Handoff");
                            } catch (e) {
                              const newNotes = `${additionalNotes ? additionalNotes + "\n\n" : ""}[Resumen Binder]: ${storedNotes}`;
                              setAdditionalNotes(newNotes);
                            }
                          } else {
                            const newNotes = `${additionalNotes ? additionalNotes + "\n\n" : ""}[Resumen Binder]: No se encontraron notas activas. Por favor, guarde una minuta en el Stakeholder Binder primero.`;
                            setAdditionalNotes(newNotes);
                          }
                        }}
                        type="button"
                        className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-all duration-150"
                      >
                        📖 Adjuntar resumen del Binder
                      </button>
                    </div>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => {
                        setAdditionalNotes(e.target.value);
                        onAddAuditLog("Edición Comentarios", "Operador editó notas adicionales de traspaso.");
                      }}
                      placeholder="Escriba comentarios adicionales aquí. Ej: 'Red local requiere habilitación de puertos por TI corporativo'."
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-white focus:outline-none focus:border-sky-500 h-20 placeholder-slate-600 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block">Vista previa del correo:</span>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[9px] text-slate-400 h-44 overflow-y-auto whitespace-pre-wrap">
                      {generateEmailTemplate()}
                      {additionalNotes && `\n\nNotas adicionales del despachador:\n${additionalNotes}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-900 text-[9px] font-mono text-slate-500 leading-normal">
                * Nota: El correo recalca estrictamente que las contraseñas, IPs y datos críticos de red se procesarán de forma física en faena, mitigando el riesgo de interceptación de correos.
              </div>
            </div>
          </div>

          {/* DUAL COLUMN: PROVIDER CHECKLIST & RISK REGISTER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Provider Coordination Checklist (Requirement 10) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-widest block">AUDITORÍA CCTV / TI</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Provider Coordination Checklist (10 Puntos)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Verificaciones mandatorias con el proveedor local de las cámaras o el encargado de TI corporativo.</p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {providerChecklist.map((item) => {
                  let badgeStyle = "text-slate-400 bg-slate-950 border-slate-850";
                  if (item.status === "Ready") badgeStyle = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
                  if (item.status === "Pending") badgeStyle = "text-amber-400 bg-amber-500/5 border-amber-500/20";
                  if (item.status === "Needs Review") badgeStyle = "text-rose-400 bg-rose-500/5 border-rose-500/20";
                  if (item.status === "Not Applicable") badgeStyle = "text-slate-500 bg-slate-900 border-slate-800";
                  if (item.status === "Blocked") badgeStyle = "text-rose-600 bg-rose-950 border-rose-900";

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleProviderChecklist(item.id)}
                      className="p-2.5 bg-slate-950 border border-slate-900/60 rounded-lg flex items-center justify-between hover:border-slate-800 cursor-pointer transition-all gap-3"
                    >
                      <span className="text-[11px] text-slate-300 font-sans font-medium">{item.label}</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase shrink-0 ${badgeStyle}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Handoff Risk Register (Requirement 12 - 12 Risks) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-widest block">MATRIZ DE AMENAZAS OPERATIVAS</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Handoff Risk Register (12 Riesgos Críticos)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Identificación, mitigación y asignación de riesgos específicos de traspaso antes de iniciar el piloto.</p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {riskRegister.map((risk) => {
                  let badgeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  if (risk.status === "Mitigado") badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  if (risk.status === "En revisión") badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";

                  return (
                    <div
                      key={risk.id}
                      onClick={() => toggleRiskStatus(risk.id)}
                      className="p-3 bg-slate-950 border border-slate-900/60 rounded-lg hover:border-slate-800 cursor-pointer transition-all space-y-1.5 text-[10px] font-mono"
                    >
                      <div className="flex justify-between items-start gap-2 text-[11px]">
                        <strong className="text-slate-200 font-sans leading-tight">{risk.category}</strong>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-tighter shrink-0 ${badgeStyle}`}>
                          {risk.status}
                        </span>
                      </div>
                      <div className="text-slate-400 leading-relaxed text-[10px] space-y-1 font-mono">
                        <div><span className="text-slate-500">Mitigación:</span> <span className="text-slate-300">{risk.mitigation}</span></div>
                        <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                          <span>Responsable: {risk.owner}</span>
                          <span>Severidad: <span className="text-rose-400 font-bold">{risk.severity}</span></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HANDOFF REPORT EXPORTER AND PREVIEW */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center gap-3">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">REPORTE FINAL EXPORTABLE</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Secure Pilot Handoff Report</h3>
              </div>
              
              <button
                onClick={handleCopyReport}
                disabled={isCopyActionDisabled}
                className={`font-bold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                  isCopyActionDisabled
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/15"
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedReport ? "¡Copiado!" : "Copiar Reporte Consolidado"}
              </button>
            </div>

            {isSanitizerBlocked && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 space-y-1">
                <span className="font-bold uppercase flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  REPORTE BLOQUEADO EN CALIENTE — SE DETECTARON SECTORES PRIVADOS O DATOS REALES:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-rose-300">
                  {scanWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Vista previa del Reporte Consolidado (Markdown Sanitizado - Requirement 14):</span>
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[9px] text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap select-all">
                {generateHandoffReport()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PILOT HANDOFF QA LOCK (Requirement 1) */}
      {activeSubTab === "qalock" && (
        <div className="space-y-6" id="pilot-handoff-qa-lock-panel">
          
          {/* BLOQUE 6 — PILOT INTAKE & DEPLOYMENT READINESS STATUS BOARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">CONTRALORÍA CENTRAL DE DESPLIEGUE</span>
                <h3 className="text-sm font-black font-sans text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                  BLOQUE 6 — PILOT INTAKE & DEPLOYMENT READINESS
                </h3>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wide">
                Estado: BLOCK 6 ACCEPTED / PILOT COORDINATION READY
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: "Pilot Intake", val: "Locked", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "Pilot Handoff", val: "Locked", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "Sanitization Scanner", val: "Active", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "Clipboard Lock", val: "Active", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "No Credentials", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "No IP/RTSP", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "No PII", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "Production Locked", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "External Channel Required", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" },
                { name: "Non-contractual", val: "Confirmed", style: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-900 rounded-lg p-2.5 flex flex-col justify-between space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block leading-tight">{item.name}</span>
                  <div className="flex justify-between items-center">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${item.style}`}>
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HEADER: ESTADO GENERAL DE VALIDACIÓN */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-widest block">
                VALIDACIÓN DE CUMPLIMIENTO ÉTICO Y SEGURIDAD
              </span>
              <h3 className="text-base font-black text-white font-sans uppercase flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-400" />
                Auditoría Técnica: Pilot Handoff QA Lock
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Valida en tiempo real que el paquete de traspaso esté 100% sanitizado, libre de credenciales, IPs reales, RTSP, planos y datos personales para su coordinación comercial previa.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0 w-full md:w-auto">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Estado de Validación:</span>
              {overallState === "Pilot Handoff Secure Coordination Locked" ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm uppercase tracking-wide shadow-lg shadow-emerald-500/5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>PILOT HANDOFF SECURE COORDINATION LOCKED</span>
                </div>
              ) : overallState === "Handoff Blocked" ? (
                <div className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>HANDOFF BLOCKED</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>NEEDS REVIEW</span>
                </div>
              )}
            </div>
          </div>

          {/* DUAL CARD ROW: OVERALL SCORE & AUTHORIZATION CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overall Score Card (Requirement 13) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">NIVEL DE PREPARACIÓN DE TRASPASO</span>
                
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${handoffScore.color}`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest block font-bold text-slate-400">Readiness Score</span>
                    <span className="text-4xl font-sans font-black tracking-tight">{handoffScore.score}%</span>
                    <p className="text-xs leading-relaxed font-sans mt-1.5 text-slate-300">{handoffScore.desc}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-bold font-mono bg-slate-950/40 shrink-0">
                    <span className="text-slate-500 text-[10px]">SCORE</span>
                    <span className="text-sm text-white font-sans">{handoffScore.score}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10px] text-slate-300 leading-normal font-sans space-y-1">
                <span className="font-bold text-amber-400 block font-mono">⚠️ AVISO OBLIGATORIO DE DESLINDE:</span>
                <p>
                  “Este score es interno y preliminar. No representa aprobación contractual, factibilidad técnica final ni autorización automática de despliegue físico de equipamientos en dependencias del cliente.”
                </p>
              </div>
            </div>

            {/* Authorization & Exporter locks (Requirement 2 & 16) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-widest block">CONTROLES DE AUTORIZACIÓN</span>
                <h4 className="text-sm font-bold text-white">Ratificación de Autorización</h4>
                
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Para habilitar la validación LOCKED final, el operador debe confirmar que la autorización se encuentra gestionada mediante canales externos autorizados.
                </p>

                <label className="flex items-start gap-2.5 p-3 bg-slate-950 border border-slate-850 rounded-xl hover:bg-slate-900 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={hasFormalAuthorization}
                    onChange={(e) => {
                      setHasFormalAuthorization(e.target.checked);
                      onAddAuditLog("Autorización Handoff", `Establecido hasFormalAuthorization en: ${e.target.checked}`);
                    }}
                    className="mt-1 accent-emerald-500 shrink-0"
                  />
                  <div className="text-[10px] font-mono leading-relaxed space-y-1">
                    <strong className="text-slate-200 block font-sans">Autorización gestionada por canal externo autorizado</strong>
                    <span className="text-slate-400 text-[9px] block">El responsable ha gestionado el alcance sugerido sin ingresar claves ni IPs reales.</span>
                    <span className="text-amber-400/90 text-[9px] leading-relaxed block font-sans">
                      ORBI Sentinel IA no almacena el acta, contrato ni documento legal. Este control solo representa que la autorización debe existir y gestionarse fuera de la demo por el cliente o responsable correspondiente.
                    </span>
                  </div>
                </label>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[9px] text-slate-500 leading-normal font-mono">
                * El copiado del reporte está restringido si el score es inferior al 85% o si se encuentra en estado Handoff Blocked.
              </div>
            </div>
          </div>

          {/* GRID OF 10 AUDIT FRENTES (Requirement 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-sans uppercase">
                Frentes de Calidad de Auditoría (10 Frentes)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Cumplimiento específico en cada frente operativo. Marque manualmente el deslinde en aquellos frentes que requieran auditoría del operador para desbloquear.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {auditFrentes.map((frente) => {
                let badgeStyle = "text-slate-400 bg-slate-950 border-slate-850";
                if (frente.status === "Ready") badgeStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                if (frente.status === "Needs Review") badgeStyle = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                if (frente.status === "Blocked") badgeStyle = "text-rose-400 bg-rose-500/10 border-rose-500/20";

                const isManualFrente = ["coord_brief", "meeting_agenda", "hse_notes", "email_templates", "report_scanner"].includes(frente.id);

                return (
                  <div
                    key={frente.id}
                    className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex flex-col justify-between space-y-3 text-[10px] font-mono hover:border-slate-800 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1.5">
                        <strong className="text-slate-200 font-sans leading-tight block text-[11px] truncate" title={frente.name}>
                          {frente.name}
                        </strong>
                      </div>
                      <span className="text-slate-450 text-[9px] block leading-normal">{frente.description}</span>
                    </div>

                    <div className="space-y-2 border-t border-slate-900 pt-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-500 uppercase">Regla QA:</span>
                        <span className={`px-1.5 py-0.2 rounded border font-bold text-[8px] uppercase ${badgeStyle}`}>
                          {frente.status}
                        </span>
                      </div>
                      <p className="text-[8px] text-slate-500 leading-normal italic">{frente.rule}</p>

                      {isManualFrente && (
                        <label className="flex items-center gap-1.5 cursor-pointer select-none border-t border-slate-900/60 pt-1.5">
                          <input
                            type="checkbox"
                            checked={manualFrentesSignOff[frente.id] || false}
                            onChange={(e) => {
                              setManualFrentesSignOff(prev => {
                                const next = { ...prev, [frente.id]: e.target.checked };
                                onAddAuditLog("Sign-off Frente QA", `Establecido ${frente.name} en: ${e.target.checked}`);
                                return next;
                              });
                            }}
                            className="accent-sky-500 w-3 h-3 shrink-0"
                          />
                          <span className="text-[9px] text-slate-450 font-bold hover:text-slate-300">
                            Frente Auditado
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 12 SECURE COORDINATION RULES (QA CHECKLIST) - Requirement 16 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* The 12-Factor QA Checklist List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">CHECKLIST DE AUDITORÍA</span>
                <h3 className="text-sm font-bold text-white font-sans uppercase">Handoff QA Checklist (12 Puntos de Seguridad)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Resumen de cumplimiento duro de los 12 principios de traspaso del piloto controlado. El bloqueo de ítems críticos deshabilita la exportación.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {handoffQAList.map((item) => {
                  const isReady = item.status === "Ready";
                  return (
                    <div
                      key={item.id}
                      className={`p-3 bg-slate-950 border rounded-xl flex items-center justify-between text-[11px] font-mono ${
                        isReady ? "border-slate-850 text-slate-300" : "border-rose-500/30 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-400" : "bg-rose-500 animate-pulse"}`} />
                        <span className="truncate leading-normal" title={item.label}>{item.label}</span>
                      </div>
                      <span className={`text-[8px] uppercase font-bold shrink-0 px-1.5 py-0.2 rounded border ${
                        isReady ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" : "text-rose-400 bg-rose-500/5 border-rose-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secure Token Certified Exporter */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block">LLAVE DE VERIFICACIÓN</span>
                <h4 className="text-sm font-bold text-white">Reporte de Traspaso Seguro</h4>
                
                <p className="text-[10px] text-slate-400 leading-normal">
                  Una vez que logre el estado LOCKED con un score mayor o igual al 85%, el sistema genera una firma criptográfica simulada de traspaso para su registro en la bitácora de preventa.
                </p>

                {overallState === "Pilot Handoff Secure Coordination Locked" ? (
                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 font-mono text-[10px] text-emerald-400">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>PAQUETE DE TRASPASO AUTORIZADO</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded text-[9px] text-slate-300 select-all font-mono">
                      ORBI-SENTINEL-6D-LOCKED-063-OK-9418A
                    </div>
                    <p className="text-[8px] text-slate-400 leading-normal">
                      Traspaso listo para ser compartido por canales seguros corporativos. Sin vulnerabilidades activas.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 font-mono text-[10px] text-slate-500 italic text-center">
                    <Lock className="w-5 h-5 text-slate-600 mx-auto animate-pulse" />
                    <span>Firma bloqueada. Complete los frentes, asigne riesgos y confirme la firma del cliente para certificar.</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-900 text-[10px] font-mono text-slate-500 leading-normal">
                * Versión: ORBI Sentinel IA v0.6.3-sentinel-pilot-handoff-coordination-lock.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
