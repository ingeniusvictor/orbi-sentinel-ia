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
  ExternalLink
} from "lucide-react";

interface PilotIntakeCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

// 1. Definition of types and options
type PilotType = "field" | "community" | "consumer" | "mixed" | "followup";

interface ScopeForm {
  pilotName: string;
  environmentType: string;
  approxCameras: number;
  proposedCameras: number;
  durationDays: number;
  existingNvr: "sí" | "no" | "desconocido";
  cameraBrands: string;
  includedZones: string;
  excludedZones: string;
  rolesInvolved: string;
  pilotGoal: string;
  observations: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  status: "Ready" | "Pending" | "Needs Review" | "Not Applicable";
  mandatory: boolean;
}

interface RiskItem {
  id: string;
  category: string;
  severity: "Alta" | "Media" | "Baja";
  probability: "Alta" | "Media" | "Baja";
  mitigation: string;
  status: "Abierto" | "Mitigado" | "En revisión";
}

interface QAItem {
  id: string;
  label: string;
  status: "Ready" | "Needs Review" | "Blocked";
  critical: boolean;
}

export default function PilotIntakeCenter({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: PilotIntakeCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<"intake" | "qalock">("intake");
  const [pilotType, setPilotType] = useState<PilotType>("field");
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ PII: boolean; details: string[] }>({ PII: false, details: [] });
  const [activeBadges, setActiveBadges] = useState<string[]>([
    "planning",
    "no_creds",
    "no_ip_rtsp",
    "no_pii",
    "no_real_cam",
    "auth_req",
    "prod_locked",
    "controlled"
  ]);

  // Load imported data from localStorage on mount (Integration with proposal centers)
  const [importedAlert, setImportedAlert] = useState<string | null>(null);

  const [form, setForm] = useState<ScopeForm>({
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
  });

  // 2. Authorization Checklist State (14 items aligned with guidelines)
  const [authChecklist, setAuthChecklist] = useState<ChecklistItem[]>([
    { id: "auth_formal", label: "Autorización gestionada por canal externo autorizado", status: "Ready", mandatory: true },
    { id: "inventario_aprobado", label: "Inventario preliminar aprobado", status: "Ready", mandatory: false },
    { id: "acceso_gestionado", label: "Acceso a cámaras/NVR gestionado fuera de la demo", status: "Ready", mandatory: true },
    { id: "zonas_incluidas", label: "Zonas comunes o técnicas definidas", status: "Ready", mandatory: true },
    { id: "zonas_excluidas", label: "Zonas privadas/excluidas definidas", status: "Ready", mandatory: true },
    { id: "roles_definidos", label: "Roles autorizados definidos", status: "Ready", mandatory: false },
    { id: "responsable_generico", label: "Responsable del piloto definido de forma genérica", status: "Ready", mandatory: true },
    { id: "procedimiento_exportacion", label: "Procedimiento de exportación acordado", status: "Pending", mandatory: false },
    { id: "retencion_preliminar", label: "Política de retención preliminar", status: "Ready", mandatory: false },
    { id: "coordinacion_seg_fisica", label: "Coordinación con seguridad física", status: "Needs Review", mandatory: false },
    { id: "coordinacion_om", label: "Coordinación con O&M o administración", status: "Ready", mandatory: true },
    { id: "revision_hse", label: "Revisión HSE si aplica", status: "Not Applicable", mandatory: false },
    { id: "consentimiento_residencial", label: "Consentimiento residencial si aplica", status: "Not Applicable", mandatory: false },
    { id: "validacion_proveedor", label: "Validación de proveedor CCTV si aplica", status: "Ready", mandatory: false }
  ]);

  // 3. Technical Checklist State (15 items aligned with guidelines)
  const [techChecklist, setTechChecklist] = useState<ChecklistItem[]>([
    { id: "camera_inv_tech", label: "Inventario de cámaras disponible", status: "Ready", mandatory: true },
    { id: "brands_tech", label: "Marcas/modelos identificados", status: "Ready", mandatory: false },
    { id: "nvr_tech", label: "NVR existente identificado", status: "Ready", mandatory: false },
    { id: "net_tech", label: "Red local identificada sin registrar IPs", status: "Ready", mandatory: true },
    { id: "gateway_tech", label: "Gateway local disponible", status: "Ready", mandatory: true },
    { id: "power_tech", label: "Alimentación local / disponibilidad eléctrica verificada por personal autorizado", status: "Ready", mandatory: false },
    { id: "space_tech", label: "Espacio físico disponible", status: "Ready", mandatory: false },
    { id: "access_tech", label: "Acceso físico controlado", status: "Ready", mandatory: false },
    { id: "bandwidth_tech", label: "Ancho de banda estimado", status: "Ready", mandatory: false },
    { id: "protocol_tech", label: "Protocolo esperado: RTSP / ONVIF / App-only / Unknown", status: "Ready", mandatory: true },
    { id: "retention_tech", label: "Retención preliminar definida", status: "Ready", mandatory: false },
    { id: "limit_tech", label: "Prueba inicial con 1 a 3 cámaras", status: "Ready", mandatory: true },
    { id: "rollback_tech", label: "Plan de reversión", status: "Pending", mandatory: false },
    { id: "contact_tech", label: "Contacto técnico autorizado gestionado fuera de la demo", status: "Ready", mandatory: true },
    { id: "window_tech", label: "Ventana de prueba definida", status: "Pending", mandatory: false }
  ]);

  // 4. Pilot Risk Matrix State (14 risks aligned with guidelines)
  const [riskMatrix, setRiskMatrix] = useState<RiskItem[]>([
    { id: "risk_auth", category: "Autorización incompleta", severity: "Alta", probability: "Baja", mitigation: "Firmar autorización antes de conectar equipos", status: "Mitigado" },
    { id: "risk_cred", category: "Credenciales no disponibles", severity: "Alta", probability: "Media", mitigation: "Solicitar por canal seguro corporativo fuera de la demo", status: "En revisión" },
    { id: "risk_app", category: "Cámaras app-only (sin RTSP)", severity: "Media", probability: "Baja", mitigation: "Verificar compatibilidad local mediante matriz ONVIF", status: "Mitigado" },
    { id: "risk_nvr", category: "NVR bloqueado por proveedor", severity: "Alta", probability: "Media", mitigation: "Acordar puerto espejo o divisor pasivo con instalador", status: "Abierto" },
    { id: "risk_net", category: "Red saturada", severity: "Media", probability: "Alta", mitigation: "Configurar sub-stream secundario de baja tasa de bits", status: "Mitigado" },
    { id: "risk_private", category: "Cámaras en zonas privadas", severity: "Alta", probability: "Baja", mitigation: "Aplicar máscara física o reorientar domo", status: "Mitigado" },
    { id: "risk_retention", category: "Retención no definida", severity: "Baja", probability: "Media", mitigation: "Establecer 7 días por defecto en almacenamiento local", status: "Mitigado" },
    { id: "risk_expectations", category: "Expectativas de producción excesivas", severity: "Alta", probability: "Media", mitigation: "Socializar Close Script e informar límites de la IA", status: "Mitigado" },
    { id: "risk_tech", category: "Falta de responsable técnico", severity: "Media", probability: "Baja", mitigation: "Identificar contraparte por canal seguro fuera de la demo", status: "Mitigado" },
    { id: "risk_hse", category: "Falta de coordinación HSE", severity: "Media", probability: "Baja", mitigation: "Inducción básica y permisos de trabajo en caliente", status: "Mitigado" },
    { id: "risk_guardrails", category: "Guardrails comerciales ignorados", severity: "Alta", probability: "Baja", mitigation: "Asegurar visibilidad del panel de límites éticos", status: "Mitigado" },
    { id: "risk_scope", category: "Alcance mayor a 3 cámaras", severity: "Alta", probability: "Baja", mitigation: "Limitar primera prueba estrictamente a 2 cámaras perimetrales", status: "Mitigado" },
    { id: "risk_sensitive_form", category: "Datos sensibles ingresados en formulario", severity: "Alta", probability: "Baja", mitigation: "Utilizar el escáner de sanitización reactivo", status: "Mitigado" },
    { id: "risk_rollback", category: "Falta de plan de reversión", severity: "Media", probability: "Media", mitigation: "Definir ventana de retiro o apagado remoto seguro", status: "Abierto" }
  ]);

  // 5. Manual QA override state for checklist standard tasks
  const [manualQAToggles, setManualQAToggles] = useState<string[]>([
    "qa_readme_upd",
    "qa_version_upd",
    "qa_bridges_san",
    "qa_scanner_act"
  ]);

  // Handle Loading Transferred Data
  useEffect(() => {
    const rawData = localStorage.getItem("ORBI_PILOT_INTAKE_TRANSFERRED_DATA");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setPilotType(parsed.type || "field");
        setForm((prev) => ({
          ...prev,
          pilotName: parsed.siteName || parsed.communityName || prev.pilotName,
          proposedCameras: Number(parsed.pilotCameras) || prev.proposedCameras,
          approxCameras: Number(parsed.totalCameras) || prev.approxCameras,
          durationDays: Number(parsed.pilotDuration) || prev.durationDays,
          includedZones: Array.isArray(parsed.includedZones) ? parsed.includedZones.join(", ") : prev.includedZones,
          excludedZones: Array.isArray(parsed.excludedZones) ? parsed.excludedZones.join(", ") : prev.excludedZones,
          pilotGoal: parsed.pilotGoal || prev.pilotGoal,
          observations: parsed.observations || prev.observations
        }));
        setImportedAlert(`Se importaron con éxito datos sanitizados desde el módulo de propuesta (${parsed.type === "field" ? "Field Proposal" : "Community Proposal"})`);
        localStorage.removeItem("ORBI_PILOT_INTAKE_TRANSFERRED_DATA");
        onAddAuditLog("Importación Sanitizada", `Se cargó piloto preliminar: ${parsed.siteName || parsed.communityName}`);
      } catch (err) {
        console.error("Error loading pilot intake transferred data:", err);
      }
    }
  }, []);

  // Adapt checklists and forms on pilot type switch
  useEffect(() => {
    if (pilotType === "field") {
      setForm((prev) => ({
        ...prev,
        environmentType: "Planta Solar PMGD / Perímetro",
        includedZones: "Portón de acceso, Sector inversores, Cerco perimetral norte",
        excludedZones: "Zonas de celdas MT, Oficinas administrativas, Terrenos vecinales sin permiso",
        rolesInvolved: "Jefe de Planta, Supervisor O&M"
      }));
      setAuthChecklist((prev) =>
        prev.map((item) => {
          if (item.id === "revision_hse") return { ...item, status: "Ready" };
          if (item.id === "consentimiento_residencial") return { ...item, status: "Not Applicable" };
          return item;
        })
      );
    } else if (pilotType === "community") {
      setForm((prev) => ({
        ...prev,
        environmentType: "Condominio / Comunidad Residencial",
        includedZones: "Acceso peatonal principal, Portón vehicular común",
        excludedZones: "Terrazas de copropietarios, Pasillos de departamentos, Sector piscinas íntimas",
        rolesInvolved: "Administración, Comité, Conserje de turno"
      }));
      setAuthChecklist((prev) =>
        prev.map((item) => {
          if (item.id === "revision_hse") return { ...item, status: "Not Applicable" };
          if (item.id === "consentimiento_residencial") return { ...item, status: "Ready" };
          return item;
        })
      );
    } else if (pilotType === "consumer") {
      setForm((prev) => ({
        ...prev,
        environmentType: "Laboratorio Experimental Doméstico",
        includedZones: "Entrada principal, Jardín delantero",
        excludedZones: "Dormitorios, Áreas de descanso internas",
        rolesInvolved: "Propietario del hogar, Instalador técnico"
      }));
      setAuthChecklist((prev) =>
        prev.map((item) => {
          if (item.id === "revision_hse") return { ...item, status: "Not Applicable" };
          if (item.id === "consentimiento_residencial") return { ...item, status: "Not Applicable" };
          if (item.id === "coordinacion_seg_fisica") return { ...item, status: "Not Applicable" };
          return item;
        })
      );
    }
  }, [pilotType]);

  // Core Sanitization Scanner Implementation (Optimized for detailed patterns)
  useEffect(() => {
    const textToScan = [
      form.pilotName,
      form.environmentType,
      form.cameraBrands,
      form.includedZones,
      form.excludedZones,
      form.rolesInvolved,
      form.pilotGoal,
      form.observations
    ].join(" ");

    const warnings: string[] = [];

    // regex for PII / Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    // regex for IPs
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    // regex for RTSP
    const rtspRegex = /rtsp:\/\/[^\s]+/gi;
    // regex for Credentials, tokens, keys
    const credsRegex = /(usuario|user|pass|password|pwd|clave|contraseña|key|token|access_token|secret)[:=][^\s]+/gi;
    // regex for Phone numbers
    const phoneRegex = /(\+?56\s?9\s?\d{8}|\+?1\s?\d{10}|\b[9876]\d{7}\b)/g;
    // regex for Coordinates (lat, long)
    const coordRegex = /\b-?\d{1,2}\.\d{4,},\s*-?\d{1,3}\.\d{4,}\b/g;
    // regex for Internal domains
    const domainRegex = /\.internal\b|\.lan\b|\bintranet\b|\bcorp\b/gi;
    // regex for Forbidden Commercial claims (SCADA, universal replacement, 100% security)
    const SCADAClaim = /reemplazo (total|completo) de SCADA/gi;
    const guardClaim = /reemplazo de guardias|reemplazo de conserjes|reemplazo de vigilantes/gi;
    const absoluteSecurity = /prevención absoluta|detección 100%|detección infalible|intrusión cero|cobertura 100%|cobertura autónoma/gi;

    if (emailRegex.test(textToScan)) {
      warnings.push("Dirección de Correo Electrónico (PII) detectada.");
    }
    if (ipRegex.test(textToScan)) {
      warnings.push("Dirección IP física/pública detectada.");
    }
    if (rtspRegex.test(textToScan)) {
      warnings.push("Enlace de transmisión de cámara RTSP detectado.");
    }
    if (credsRegex.test(textToScan)) {
      warnings.push("Credenciales lógicas o contraseñas estructuradas detectadas.");
    }
    if (phoneRegex.test(textToScan)) {
      warnings.push("Número telefónico de contacto (PII) detectado.");
    }
    if (coordRegex.test(textToScan)) {
      warnings.push("Coordenadas geográficas precisas (latitud/longitud) detectadas.");
    }
    if (domainRegex.test(textToScan)) {
      warnings.push("Dominio o subdominio de red interno sensible detectado.");
    }
    if (SCADAClaim.test(textToScan)) {
      warnings.push("Promesa prohibida de reemplazar SCADA o procesos activos de planta.");
    }
    if (guardClaim.test(textToScan)) {
      warnings.push("Promesa prohibida de reemplazar vigilantes, conserjes o guardias físicos.");
    }
    if (absoluteSecurity.test(textToScan)) {
      warnings.push("Aseveración comercial indebida de prevención absoluta o infalibilidad 100%.");
    }

    if (warnings.length > 0) {
      setScanResult({ PII: true, details: warnings });
    } else {
      setScanResult({ PII: false, details: [] });
    }
  }, [form]);

  // Compute Pilot Readiness Score
  const getReadinessScore = () => {
    // Factors:
    // 1. Authorization Checklist - formal authorization item must be "Ready"
    const isAuthFormalReady = authChecklist.find(i => i.id === "auth_formal")?.status === "Ready";
    const isExclusionsReady = authChecklist.find(i => i.id === "zonas_excluidas")?.status === "Ready";
    const isAccessReady = authChecklist.find(i => i.id === "acceso_gestionado")?.status === "Ready";

    const totalAuthChecked = authChecklist.filter(i => i.status === "Ready").length;
    const totalAuthApplicable = authChecklist.filter(i => i.status !== "Not Applicable").length;
    const authPercent = Math.round((totalAuthChecked / totalAuthApplicable) * 100);

    const totalTechChecked = techChecklist.filter(i => i.status === "Ready").length;
    const totalTechApplicable = techChecklist.filter(i => i.status !== "Not Applicable").length;
    const techPercent = Math.round((totalTechChecked / totalTechApplicable) * 100);

    const percent = Math.round((authPercent + techPercent) / 2);

    // Rule:
    // Si autorización formal, zonas excluidas o acceso autorizado están Pending/Needs Review, el piloto no puede marcarse Ready.
    if (!isAuthFormalReady || !isExclusionsReady || !isAccessReady) {
      return {
        score: percent,
        status: "Pending Authorization",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        desc: "Falta autorización formal escrita, delimitación estricta de zonas de exclusión o gestión de claves fuera del software."
      };
    }

    if (scanResult.PII) {
      return {
        score: percent,
        status: "Blocked",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        desc: "Bloqueado por detección de PII, credenciales, IPs o RTSP dentro del formulario. Requiere sanitización inmediata."
      };
    }

    if (form.proposedCameras < 1 || form.proposedCameras > 3) {
      return {
        score: percent,
        status: "Needs Review",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        desc: "El alcance supera el límite seguro sugerido para una primera fase (1 a 3 cámaras)."
      };
    }

    if (percent >= 85) {
      return {
        score: percent,
        status: "Ready for Controlled Pilot Planning",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        desc: "El piloto cumple con los rigurosos estándares operacionales y de seguridad. Listo para diseño físico fuera de la demo."
      };
    }

    return {
      score: percent,
      status: "Needs Review",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      desc: "Revisar factores pendientes de conectividad local y coordinación con personal de O&M."
    };
  };

  const scoreResult = getReadinessScore();

  // Helper to change status of checklist items
  const toggleChecklistStatus = (type: "auth" | "tech", id: string) => {
    const list = type === "auth" ? authChecklist : techChecklist;
    const setter = type === "auth" ? setAuthChecklist : setTechChecklist;
    
    setter(
      list.map((item) => {
        if (item.id === id) {
          const states: Array<"Ready" | "Pending" | "Needs Review" | "Not Applicable"> = ["Ready", "Pending", "Needs Review", "Not Applicable"];
          const nextIndex = (states.indexOf(item.status) + 1) % states.length;
          const nextStatus = states[nextIndex];
          onAddAuditLog(
            "Configurar Checklist Piloto",
            `Actualizado estado de ${item.label} en Pilot Intake hacia ${nextStatus}`
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Dynamic Audit Frentes Calculation
  const safetyBannerStatus = activeBadges.length === 8 ? "Ready" : "Blocked";
  const selectorStatus = ["field", "community", "consumer", "mixed", "followup"].includes(pilotType) ? "Ready" : "Blocked";

  let scopeFormStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (scanResult.PII) {
    scopeFormStatus = "Blocked";
  } else if (form.proposedCameras > 3 || form.proposedCameras < 1) {
    scopeFormStatus = "Needs Review";
  }

  const isAuthFormalReady = authChecklist.find(i => i.id === "auth_formal")?.status === "Ready";
  const isExclusionsReady = authChecklist.find(i => i.id === "zonas_excluidas")?.status === "Ready";
  const isAccessReady = authChecklist.find(i => i.id === "acceso_gestionado")?.status === "Ready";
  const anyAuthPending = authChecklist.some(i => i.status === "Pending" || i.status === "Needs Review");

  let authChecklistStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (!isAuthFormalReady || !isExclusionsReady || !isAccessReady) {
    authChecklistStatus = "Blocked";
  } else if (anyAuthPending) {
    authChecklistStatus = "Needs Review";
  }

  const isNetTechReady = techChecklist.find(i => i.id === "net_tech")?.status === "Ready";
  const isGatewayReady = techChecklist.find(i => i.id === "gateway_tech")?.status === "Ready";
  const isContactReady = techChecklist.find(i => i.id === "contact_tech")?.status === "Ready";
  const anyTechPending = techChecklist.some(i => i.status === "Pending" || i.status === "Needs Review");

  let techChecklistStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (!isNetTechReady || !isGatewayReady || !isContactReady) {
    techChecklistStatus = "Blocked";
  } else if (anyTechPending) {
    techChecklistStatus = "Needs Review";
  }

  const anyRiskOpen = riskMatrix.some(r => r.status === "Abierto");
  const riskMatrixStatus: "Ready" | "Needs Review" | "Blocked" = anyRiskOpen ? "Needs Review" : "Ready";

  const scoreStatus: "Ready" | "Needs Review" | "Blocked" = (scoreResult.status === "Blocked")
    ? "Blocked"
    : (scoreResult.status === "Pending Authorization" || scoreResult.status === "Needs Review")
    ? "Needs Review"
    : "Ready";

  const scannerStatus: "Ready" | "Needs Review" | "Blocked" = scanResult.PII ? "Blocked" : "Ready";

  let reportStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (scanResult.PII || scoreResult.status === "Blocked" || safetyBannerStatus === "Blocked") {
    reportStatus = "Blocked";
  } else if (scoreResult.status === "Needs Review") {
    reportStatus = "Needs Review";
  }

  const frentes = [
    { id: "banner", name: "Safety Banner", status: safetyBannerStatus, desc: "8 badges de seguridad perimetral obligatorios activos.", action: "Tener todos los badges activos en el banner superior." },
    { id: "selector", name: "Pilot Type Selector", status: selectorStatus, desc: "Modo de simulación sin datos operacionales reales.", action: "Seleccionar un tipo de entorno válido." },
    { id: "form", name: "Scope Intake Form", status: scopeFormStatus, desc: "Formulario de alcance acotado libre de credenciales o PII.", action: "Sanitizar campos de texto o reducir cámaras piloto a un rango seguro de 1-3." },
    { id: "auth", name: "Authorization Checklist", status: authChecklistStatus, desc: "Estados de autorización formal y delimitación de accesos.", action: "Establecer 'Autorización formal', 'Zonas privadas/excluidas definidas' y 'Acceso a cámaras' como 'Ready'." },
    { id: "tech", name: "Validación técnica interna del build para demo controlada (Checklist)", status: techChecklistStatus, desc: "Factores de factibilidad técnica local verificados.", action: "Establecer 'Red local', 'Gateway local' y 'Contacto técnico autorizado' como 'Ready'." },
    { id: "risk", name: "Risk Matrix", status: riskMatrixStatus, desc: "Mitigación y revisión de riesgos de despliegue.", action: "Mitigar o revisar los riesgos marcados como 'Abierto' en la matriz." },
    { id: "score", name: "Readiness Score", status: scoreStatus, desc: "Puntaje de preparación interno no contractual.", action: "Alcanzar al menos un 80% de conformidad y resolver bloqueos de PII o autorización." },
    { id: "scanner", name: "Sanitization Scanner", status: scannerStatus, desc: "Escáner en caliente de expresiones regulares para proteger datos.", action: "Sanitizar los campos de texto eliminando cualquier IP, RTSP, correo o teléfono." },
    { id: "report", name: "Sanitized Report", status: reportStatus, desc: "Reporte de entrega final listo para copiar.", action: "Resolver bloqueos y alertas críticas del escáner de sanitización." },
    { id: "bridges", name: "Inter-Module Transfer Bridges", status: "Ready" as const, desc: "Limpieza y puenteo de datos desde otros módulos.", action: "Todo nominal. Sandboxing local activado." }
  ];

  const hasBlocked = frentes.some(f => f.status === "Blocked");
  const hasNeedsReview = frentes.some(f => f.status === "Needs Review");
  const overallState = hasBlocked
    ? "Pilot Intake Blocked"
    : hasNeedsReview
    ? "Needs Review"
    : "Pilot Intake Deployment Readiness Locked";

  // Dynamic QA Checklist (14 items)
  const getDynamicQAChecklist = (): QAItem[] => {
    const isCredsFound = scanResult.details.some(d => d.includes("Credenciales") || d.includes("contraseñas"));
    const isIpRtspFound = scanResult.details.some(d => d.includes("IP") || d.includes("RTSP") || d.includes("transmisión"));
    const isPiiFound = scanResult.details.some(d => d.includes("Correo") || d.includes("telefónico") || d.includes("PII") || d.includes("geográficas"));

    const isAuthFormalReadyLocal = authChecklist.find(i => i.id === "auth_formal")?.status === "Ready";
    const isExclusionsReadyLocal = authChecklist.find(i => i.id === "zonas_excluidas")?.status === "Ready";
    const isAccessReadyLocal = authChecklist.find(i => i.id === "acceso_gestionado")?.status === "Ready";

    const isNetTechReadyLocal = techChecklist.find(i => i.id === "net_tech")?.status === "Ready";
    const isGatewayReadyLocal = techChecklist.find(i => i.id === "gateway_tech")?.status === "Ready";
    const isContactReadyLocal = techChecklist.find(i => i.id === "contact_tech")?.status === "Ready";

    const anyRiskOpenLocal = riskMatrix.some(r => r.status === "Abierto");

    return [
      { id: "qa_no_cred", label: "No credentials captured", status: isCredsFound ? "Blocked" : "Ready", critical: true },
      { id: "qa_no_ip_rtsp", label: "No IP/RTSP captured", status: isIpRtspFound ? "Blocked" : "Ready", critical: true },
      { id: "qa_no_pii", label: "No PII captured", status: isPiiFound ? "Blocked" : "Ready", critical: true },
      { id: "qa_auth_ready", label: "Authorization checklist ready", status: (isAuthFormalReadyLocal && isExclusionsReadyLocal && isAccessReadyLocal) ? "Ready" : "Blocked", critical: false },
      { id: "qa_tech_ready", label: "Technical checklist ready", status: (isNetTechReadyLocal && isGatewayReadyLocal && isContactReadyLocal) ? "Ready" : "Needs Review", critical: false },
      { id: "qa_risk_ready", label: "Risk matrix ready", status: anyRiskOpenLocal ? "Needs Review" : "Ready", critical: false },
      { id: "qa_limit_cam", label: "Scope limited to 1–3 cameras", status: (form.proposedCameras >= 1 && form.proposedCameras <= 3) ? "Ready" : "Needs Review", critical: false },
      { id: "qa_prod_locked", label: "Production Locked visible", status: activeBadges.includes("prod_locked") ? "Ready" : "Blocked", critical: false },
      { id: "qa_guardrails_vis", label: "Guardrails visible", status: (activeBadges.includes("no_creds") && activeBadges.includes("no_ip_rtsp")) ? "Ready" : "Blocked", critical: false },
      { id: "qa_scanner_act", label: "Sanitization scanner active", status: manualQAToggles.includes("qa_scanner_act") ? "Ready" : "Needs Review", critical: false },
      { id: "qa_rep_san", label: "Report sanitized", status: scanResult.PII ? "Blocked" : "Ready", critical: false },
      { id: "qa_bridges_san", label: "Transfer bridges sanitized", status: manualQAToggles.includes("qa_bridges_san") ? "Ready" : "Needs Review", critical: false },
      { id: "qa_readme_upd", label: "README updated", status: manualQAToggles.includes("qa_readme_upd") ? "Ready" : "Needs Review", critical: false },
      { id: "qa_version_upd", label: "Version Registry updated", status: manualQAToggles.includes("qa_version_upd") ? "Ready" : "Needs Review", critical: false }
    ];
  };

  const qaChecklist = getDynamicQAChecklist();

  const toggleQAStatus = (id: string) => {
    const criticals = ["qa_no_cred", "qa_no_ip_rtsp", "qa_no_pii", "qa_rep_san"];
    if (criticals.includes(id)) {
      onAddAuditLog("Acción Restringida", "No se puede forzar el control crítico de sanitización manual.");
      return;
    }
    if (manualQAToggles.includes(id)) {
      setManualQAToggles(manualQAToggles.filter(x => x !== id));
      onAddAuditLog("Auditoría QA", `Desmarcado control de auditoría: ${id}`);
    } else {
      setManualQAToggles([...manualQAToggles, id]);
      onAddAuditLog("Auditoría QA", `Marcado conforme control de auditoría: ${id}`);
    }
  };

  // Generate Intake Report Markdown
  const generateIntakeReport = () => {
    return `# ORBI SENTINEL IA — PILOT INTAKE READINESS REPORT
===================================================
*   **Versión de Tecnología:** ORBI Sentinel IA v0.6.1-sentinel-pilot-intake-deployment-lock
*   **Tipo de Piloto Seleccionado:** ${pilotType.toUpperCase()}
*   **Estado del Formulario:** ${overallState.toUpperCase()}
*   **Puntaje de Preparación Interno:** ${scoreResult.score}% Conforme

## 1. RESUMEN DE ALCANCE DEL PILOTO
*   **Nombre Interno:** ${form.pilotName}
*   **Tipo de Entorno:** ${form.environmentType}
*   **Cámaras Totales del Parque:** ${form.approxCameras} unidades aproximadas.
*   **Cámaras Solicitadas para Piloto:** ${form.proposedCameras} unidades (Límite: 1-3).
*   **Duración Estimada del Piloto:** ${form.durationDays} días de evaluación.
*   **Equipamiento NVR Existente:** ${form.existingNvr.toUpperCase()}
*   **Fabricantes Identificados:** ${form.cameraBrands}
*   **Zonas Incluidas en Piloto:** ${form.includedZones}
*   **Zonas de Exclusión Estricta:** ${form.excludedZones}
*   **Roles Involucrados:** ${form.rolesInvolved}

## 2. OBJETIVO DEL PILOTO
${form.pilotGoal}

## 3. CHECKLIST DE AUTORIZACIÓN OPERATIVA
${authChecklist
  .map(
    (item) =>
      `*   [${item.status === "Ready" ? "X" : item.status === "Not Applicable" ? "/" : " "}] ${item.label} (${item.status})`
  )
  .join("\n")}

## 4. CHECKLIST TÉCNICO NO SENSIBLE
${techChecklist
  .map(
    (item) =>
      `*   [${item.status === "Ready" ? "X" : item.status === "Not Applicable" ? "/" : " "}] ${item.label} (${item.status})`
  )
  .join("\n")}

## 5. MATRIZ DE RIESGOS PRINCIPALES
${riskMatrix
  .map(
    (item) =>
      `*   **${item.category}:** Severidad: ${item.severity} | Probabilidad: ${item.probability} | Mitigación: ${item.mitigation} | Estado: ${item.status}`
  )
  .join("\n")}

## 6. PRÓXIMOS PASOS & ROADMAP OPERATIVO (FASE 1 A 11)
1.  **Reunión inicial:** Alinear expectativas con stakeholders y repasar guardrails.
2.  **Confirmación de autorización:** Obtener firma formal física del cliente/comité.
3.  **Inventario de cámaras:** Levantar marcas, modelos y resoluciones de forma local.
4.  **Zonas incluidas/excluidas:** Establecer límites físicos exactos de enmascaramiento.
5.  **Revisión técnica de red:** Confirmar disponibilidad de un canal local estable.
6.  **Preparación de Gateway:** Habilitar el microservidor local con el ORBI Vision Core.
7.  **Prueba inicial acotada:** Conectar entre 1 y 3 cámaras de perímetros comunes.
8.  **Validación de incidentes:** Auditar reportes y falsos positivos locales.
9.  **Revisión de privacidad:** Auditar que no haya filtración de rostros o áreas privadas.
10. **Informe de resultados:** Consolidar informe ejecutivo final no vinculante.
11. **Decisión de continuidad:** Definir escalamiento o plan de reversión física.

## 7. CLÁUSULA DE RESGUARDO Y LIMITACIONES COMERCIALES
*   Este informe constituye un instrumento interno preliminar de planificación para demostraciones.
*   No representa aprobación comercial contractual, factibilidad de instalación definitiva ni validación de producción.
*   No se almacenaron credenciales corporativas, claves, planos confidenciales, IPs públicas ni enlaces RTSP reales dentro de este reporte ni en el entorno de pruebas del software.`;
  };

  const copyReportToClipboard = () => {
    if (scanResult.PII || overallState === "Pilot Intake Blocked") {
      onAddAuditLog("Intento Copiado Bloqueado", "El usuario intentó copiar el informe de preparación con warnings activos de seguridad.");
      return;
    }
    navigator.clipboard.writeText(generateIntakeReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    onAddAuditLog("Copiar Informe Pilot Intake", `Exportado informe sanitizado del piloto para ${form.pilotName}`);
  };

  if (userRole === "conserje") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-center max-w-2xl mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            Módulo Bloqueado para Personal No Autorizado
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            El <strong>Pilot Intake & Deployment Readiness Center</strong> está bloqueado bajo llave de cifrado local en esta demostración comercial. Su rol actual (<strong>Conserje de Turno</strong>) tiene privilegios restringidos para evitar la manipulación de checklists técnicos y de seguridad.
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 border-b border-slate-850 pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>ESTADO DE SEGURIDAD OPERATIVA</span>
          </div>
          <p className="text-[11px] text-slate-400">
            • <strong>Estado del Sistema:</strong> PILOT INTAKE DEPLOYMENT READINESS LOCKED
          </p>
          <p className="text-[11px] text-slate-400">
            • <strong>Cifrado de Demo:</strong> Activo (Simulación de llave SHA-256 local)
          </p>
          <p className="text-[11px] text-slate-400">
            • <strong>Acceso Técnico:</strong> Gestionado fuera de la plataforma web para proteger la red de CCTV.
          </p>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          Consulte al Administrador del Sistema o Preventa de ORBI para elevar permisos de auditoría.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pilot Intake Safety Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Centro de Preparación de Pilotos Sanitizado • Pilot Intake Center
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Auditoría y planificación de pilotos comerciales. Haga clic en los badges de resguardo para activar/desactivar controles de seguridad física.
            </p>
            {setCurrentTab && (
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => {
                    setCurrentTab("stakeholderbinder");
                    onAddAuditLog("Navegación desde Pilot Intake", "Navegando a Stakeholder Binder para reunión previa.");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded transition-all duration-150"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Usar Stakeholder Binder como Reunión Previa</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("customerpilotworkspace");
                    onAddAuditLog("Navegación desde Pilot Intake", "Abriendo Customer Pilot Workspace.");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded transition-all duration-150"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Abrir Customer Pilot Workspace</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("customerpilotsimulator");
                    onAddAuditLog("Navegación desde Pilot Intake", "Abriendo Customer Pilot Simulator para ensayar escenario sintético.");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded transition-all duration-150 animate-pulse"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Ensayar Escenario Sintético</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-end">
            {[
              { id: "planning", label: "Pilot Planning Only" },
              { id: "no_creds", label: "No Credentials" },
              { id: "no_ip_rtsp", label: "No IP/RTSP" },
              { id: "no_pii", label: "No Personal Data" },
              { id: "no_real_cam", label: "No Real Camera" },
              { id: "auth_req", label: "Auth Required" },
              { id: "prod_locked", label: "Production Locked" },
              { id: "controlled", label: "Controlled Pilot" }
            ].map((b) => {
              const active = activeBadges.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    if (active) {
                      setActiveBadges(activeBadges.filter(id => id !== b.id));
                      onAddAuditLog("Desactivar Control de Seguridad", `Desactivado badge: ${b.label}`);
                    } else {
                      setActiveBadges([...activeBadges, b.id]);
                      onAddAuditLog("Activar Control de Seguridad", `Activado badge: ${b.label}`);
                    }
                  }}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border transition-all ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-950 text-slate-500 border-slate-900 line-through opacity-50"
                  }`}
                  title="Haga clic para simular control de seguridad en la demo"
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {importedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{importedAlert}</span>
          </div>
          <button
            onClick={() => setImportedAlert(null)}
            className="text-slate-400 hover:text-white uppercase font-bold text-[10px]"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Subtab Navigation Selector */}
      <div className="flex border-b border-slate-800 gap-1">
        <button
          onClick={() => setActiveSubTab("intake")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "intake"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          📋 Configurar Piloto (Formulario y Checklists)
        </button>
        <button
          onClick={() => setActiveSubTab("qalock")}
          className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "qalock"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-450" />
          🔒 Pilot Intake QA Lock ({overallState === "Pilot Intake Deployment Readiness Locked" ? "🟢 Locked" : overallState === "Needs Review" ? "🟡 Pending Review" : "🔴 Blocked"})
        </button>
      </div>

      {activeSubTab === "intake" ? (
        <>
          {/* Selector of Pilot Type */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PASO 1: SELECCIONAR LÍNEA DE PILOTO</span>
          <h4 className="text-sm font-bold text-white mt-1">Configuración del Tipo de Entorno y Modelo Operacional</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: "field", label: "Field / Solar O&M", icon: Server, desc: "PMGDs, plantas solares, supervisores e instaladores técnicos." },
            { id: "community", label: "Community / Condominium", icon: Home, desc: "Comités residenciales, administradores y conserjes de turno." },
            { id: "consumer", label: "Consumer Lab", icon: Users, desc: "Cámaras WiFi domésticas y grabadores NAS residenciales." },
            { id: "mixed", label: "Mixed Field + Community", icon: Layers, desc: "Entornos mixtos industriales y residenciales colindantes." },
            { id: "followup", label: "Public Demo Follow-up", icon: Play, desc: "Minuta de seguimiento técnica simplificada post-reunión." }
          ].map((type) => {
            const ActiveIcon = type.icon;
            const active = pilotType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setPilotType(type.id as PilotType);
                  onAddAuditLog("Cambiar Tipo Piloto", `Cambiado entorno del intake hacia ${type.label}`);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2.5 ${
                  active
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ActiveIcon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className="text-xs truncate font-mono">{type.label}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500 font-sans block h-10 overflow-hidden line-clamp-2">
                  {type.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pilot Scope Form Section */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PASO 2: FORMULARIO DE ALCANCE</span>
              <h4 className="text-sm font-bold text-white mt-1">Pilot Scope Intake Form (No Sensible)</h4>
            </div>

            <button
              onClick={() => {
                setForm({
                  pilotName: "Piloto Operacional Centro",
                  environmentType: "Planta Solar PMGD / Perímetro",
                  approxCameras: 12,
                  proposedCameras: 2,
                  durationDays: 10,
                  existingNvr: "sí",
                  cameraBrands: "Dahua, Hikvision",
                  includedZones: "Portón de acceso, Sector inversores, Cerco perimetral norte",
                  excludedZones: "Zonas de celdas MT, Oficinas administrativas, Terrenos vecinales sin permiso",
                  rolesInvolved: "Jefe de Planta, Supervisor O&M",
                  pilotGoal: "Validar la conectividad del Gateway local de prueba y la detección de incidentes en el perímetro norte.",
                  observations: "El piloto operará con sub-streams locales sin conexión persistente a la nube pública."
                });
                onAddAuditLog("Reiniciar Formulario Piloto", "Se restableció el formulario de Pilot Intake a valores por defecto.");
              }}
              className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1 uppercase"
            >
              <RefreshCw className="w-3 h-3" />
              Limpiar
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">NOMBRE INTERNO DEL PILOTO DEMO</label>
                <input
                  type="text"
                  value={form.pilotName}
                  onChange={(e) => setForm({ ...form, pilotName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                  placeholder="ej. Piloto Parque Sur, Demo Condominio"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">TIPO DE ENTORNO</label>
                <input
                  type="text"
                  value={form.environmentType}
                  onChange={(e) => setForm({ ...form, environmentType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 col-span-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">CAMARAS PARQUE</label>
                <input
                  type="number"
                  value={form.approxCameras}
                  onChange={(e) => setForm({ ...form, approxCameras: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">CAMARAS PILOTO</label>
                <input
                  type="number"
                  value={form.proposedCameras}
                  onChange={(e) => setForm({ ...form, proposedCameras: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">DURACIÓN (DÍAS)</label>
                <input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">NVR EXISTENTE</label>
                <select
                  value={form.existingNvr}
                  onChange={(e) => setForm({ ...form, existingNvr: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs font-mono"
                >
                  <option value="sí">Sí</option>
                  <option value="no">No</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">MARCAS APROX. DE CÁMARAS</label>
                <input
                  type="text"
                  value={form.cameraBrands}
                  onChange={(e) => setForm({ ...form, cameraBrands: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                  placeholder="ej. Dahua, Axis, Hikvision"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[10px] font-bold block">ROLES AUTORIZADOS INVOLUCRADOS</label>
                <input
                  type="text"
                  value={form.rolesInvolved}
                  onChange={(e) => setForm({ ...form, rolesInvolved: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] font-bold block">ZONAS INCLUIDAS</label>
              <input
                type="text"
                value={form.includedZones}
                onChange={(e) => setForm({ ...form, includedZones: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] font-bold block">ZONAS EXCLUIDAS (ESTRICTAMENTE PRIVADAS / ADYACENTES)</label>
              <input
                type="text"
                value={form.excludedZones}
                onChange={(e) => setForm({ ...form, excludedZones: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs text-amber-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] font-bold block">OBJETIVO PRINCIPAL DEL PILOTO</label>
              <textarea
                value={form.pilotGoal}
                onChange={(e) => setForm({ ...form, pilotGoal: e.target.value })}
                className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[10px] font-bold block">OBSERVACIONES ADICIONALES SANITIZADAS</label>
              <textarea
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                className="w-full h-14 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                placeholder="No ingrese correos, claves ni credenciales aquí."
              />
            </div>
          </div>

          {/* Sanitization Scanner Alert */}
          <div className={`p-4 rounded-xl border text-xs font-mono transition-all ${
            scanResult.PII
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
          }`}>
            <div className="flex items-center gap-2.5 font-bold mb-1.5">
              {scanResult.PII ? (
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              )}
              <span>HEURISTIC SANITIZATION SCANNER: {scanResult.PII ? "WARNING DETECTED" : "Nominal"}</span>
            </div>

            {scanResult.PII ? (
              <div className="space-y-2">
                <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                  <strong>Dato Prohibido Detectado:</strong> El escáner interceptó datos no conformes en caliente que no pertenecen a la demo. El estado del piloto es <strong>NEEDS SANITIZATION</strong> y se ha bloqueado el portapapeles.
                </p>
                <div className="p-2.5 bg-slate-950 rounded border border-rose-500/20 font-mono text-[10px] text-rose-300 space-y-1">
                  {scanResult.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                <p className="text-amber-400 text-[10px] font-sans">
                  💡 <strong>Sugerencia:</strong> Reemplaza este dato por una descripción genérica, por ejemplo: <em>'red local autorizada'</em> o <em>'contacto técnico gestionado fuera de la demo'</em>.
                </p>
              </div>
            ) : (
              <p className="text-slate-400 font-sans leading-normal">
                No se detectaron correos, teléfonos, credenciales físicas, rutas RTSP o promesas comerciales prohibidas en las notas del piloto. El reporte Markdown final está sanitizado.
              </p>
            )}
          </div>
        </div>

        {/* Audit Readiness Score & Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Readiness Score Panel */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">PUNTAJE DE PREPARACIÓN</span>
              <h4 className="text-sm font-bold text-white mt-1">Pilot Readiness Score (Preliminar)</h4>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">ESTADO DEL INTAKE</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase border tracking-tight inline-block ${scoreResult.color}`}>
                  {scoreResult.status}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">CONFORMIDAD</span>
                <span className={`text-3xl font-extrabold font-mono ${
                  scoreResult.status === "Blocked" ? "text-rose-400 animate-pulse" : scoreResult.score >= 80 ? "text-emerald-400" : "text-sky-400"
                }`}>
                  {scoreResult.score}%
                </span>
              </div>
            </div>

            <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  scoreResult.status === "Blocked" ? "bg-rose-500" : scoreResult.score >= 80 ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${scoreResult.score}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans italic">
              {scoreResult.desc}
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] text-slate-500 leading-normal font-mono">
              ⚠️ <strong>Aviso Obligatorio:</strong> Este score es interno y preliminar. No representa aprobación contractual, factibilidad técnica final ni validación de producción.
            </div>
          </div>

          {/* Pilot Intake Guardrails Box */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Pilot Intake Guardrails
            </h4>

            <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed font-sans">
              <div className="p-2.5 bg-rose-500/5 rounded-lg border border-rose-500/10 space-y-1 text-slate-300">
                <span className="text-rose-400 font-bold uppercase block">✕ NO SOLICITAR EN DEMO</span>
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li>Claves / contraseñas</li>
                  <li>IPs de red reales</li>
                  <li>Enlaces RTSP activos</li>
                  <li>Rutas VPN locales</li>
                  <li>Planos o coordenadas</li>
                  <li>Clientes reales de demo</li>
                </ul>
              </div>

              <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 space-y-1 text-slate-300">
                <span className="text-emerald-400 font-bold uppercase block">✓ SÍ SOLICITAR AFUERA</span>
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li>Inventario de cámaras</li>
                  <li>Contacto de soporte</li>
                  <li>Zonas incluidas / excluidas</li>
                  <li>Canales seguros corporativos</li>
                  <li>Ventana de prueba física</li>
                  <li>Firma de conformidad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authorization Checklist Box */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-emerald-400" />
              Autorización y Factibilidad Operacional
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">14 Factores</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
            {authChecklist.map((item) => {
              let badgeColor = "bg-slate-950 text-slate-500 border-slate-900";
              if (item.status === "Ready") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (item.status === "Pending") badgeColor = "bg-slate-950 text-slate-400 border-slate-800";
              if (item.status === "Needs Review") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              if (item.status === "Not Applicable") badgeColor = "bg-slate-900 text-slate-600 border-transparent";

              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistStatus("auth", item.id)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      item.status === "Ready"
                        ? "bg-emerald-500 border-emerald-600 text-slate-950"
                        : "border-slate-800 bg-slate-900"
                    }`}>
                      {item.status === "Ready" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs truncate ${item.status === "Ready" ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[9px]">
                    {item.mandatory && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded font-bold uppercase">
                        CRÍTICO
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Technical Checklist Box */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4.5 h-4.5 text-emerald-400" />
              Validación técnica interna del build para demo controlada (Checklist)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">14 Factores</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
            {techChecklist.map((item) => {
              let badgeColor = "bg-slate-950 text-slate-500 border-slate-900";
              if (item.status === "Ready") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (item.status === "Pending") badgeColor = "bg-slate-950 text-slate-400 border-slate-800";
              if (item.status === "Needs Review") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              if (item.status === "Not Applicable") badgeColor = "bg-slate-900 text-slate-600 border-transparent";

              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistStatus("tech", item.id)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      item.status === "Ready"
                        ? "bg-emerald-500 border-emerald-600 text-slate-950"
                        : "border-slate-800 bg-slate-900"
                    }`}>
                      {item.status === "Ready" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs truncate ${item.status === "Ready" ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[9px]">
                    {item.mandatory && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded font-bold uppercase">
                        REQUERIDO
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controlled Pilot Risk Matrix */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-emerald-400" />
            Matriz de Riesgos del Piloto Controlado (Risk Matrix)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Diagnóstico responsable de 12 riesgos operacionales típicos y sus correspondientes mitigaciones sugeridas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskMatrix.map((item) => {
            const severityColors = {
              Alta: "text-rose-400 bg-rose-500/10 border-rose-500/20",
              Media: "text-amber-400 bg-amber-500/10 border-amber-500/20",
              Baja: "text-slate-400 bg-slate-800 border-slate-700"
            };

            const statusColors = {
              Abierto: "text-rose-300 bg-rose-950 border-rose-900 animate-pulse",
              Mitigado: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
              "En revisión": "text-sky-400 bg-sky-950 border-sky-900"
            };

            return (
              <div key={item.id} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">{item.category}</span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    <strong>Mitigación sugerida:</strong> {item.mitigation}
                  </p>
                </div>

                <div className="flex gap-2 text-[9px] font-mono uppercase">
                  <span className={`px-2 py-0.5 rounded border ${severityColors[item.severity]}`}>
                    Severidad: {item.severity}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-850 rounded">
                    Prob.: {item.probability}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controlled Pilot Roadmap */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-emerald-400" />
            Controlled Pilot Roadmap (11 Fases Secuenciales)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Hoja de ruta operacional para el levantamiento de un entorno de pruebas sin compromisos.</p>
        </div>

        <div className="relative pl-6 border-l border-slate-800 space-y-5">
          {[
            { step: 1, title: "Reunión Inicial y Alineamiento", desc: "Verificación del Pitch de 60s, socialización de límites del sistema y selección del tipo de piloto." },
            { step: 2, title: "Firma de Autorización Formal", desc: "Aprobación física u oficial escrita del comité o el gerente de O&M para proceder." },
            { step: 3, title: "Inventario Técnico de Cámaras", desc: "Identificar fabricantes, ópticas y ubicaciones preliminares de forma offline." },
            { step: 4, title: "Definición de Zonas Incluidas/Excluidas", desc: "Mapeo lógico riguroso. Bloquear áreas colindantes residenciales o de descanso técnico." },
            { step: 5, title: "Análisis y Revisión de Red Local", desc: "Comprobar estabilidad física de switches y enlaces perimetrales sin registrar credenciales." },
            { step: 6, title: "Instalación del Gateway Piloto", desc: "Despliegue del microservidor temporal en la red de CCTV local del cliente." },
            { step: 7, title: "Prueba Controlada (1 a 3 Cámaras)", desc: "Establecer flujos secundarios en baja resolución para calibración de telemetría." },
            { step: 8, title: "Validación de Incidentes y Reportes", desc: "Auditar la precisión de la analítica y redactar bitácoras de laboratorio con firma SHA-256 local." },
            { step: 9, title: "Auditoría de Privacidad por Diseño", desc: "Garantizar que el personal de conserjería o turnos no acceda a información sensible." },
            { step: 10, title: "Entrega de Informe de Resultados", desc: "Presentar informe Markdown sanitizado para evaluar rentabilidad y valor agregado." },
            { step: 11, title: "Decisión de Continuidad", desc: "Fijar plan de escalamiento controlado o reversión/retiro inmediato de equipos de prueba." }
          ].map((item) => (
            <div key={item.step} className="relative space-y-1">
              <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 font-mono shadow-md">
                {item.step}
              </span>
              <span className="text-xs font-bold text-white block">{item.title}</span>
              <p className="text-[11px] text-slate-400 leading-normal max-w-4xl">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pilot Intake QA Checklist & Report Export */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-6">
        <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PASO Final: AUDITORÍA QA & REPORTE SANITIZADO</span>
            <h4 className="text-sm font-bold text-white mt-1">Pilot Intake QA Lock Panel</h4>
          </div>

          <button
            id="btn-copy-intake-report"
            onClick={copyReportToClipboard}
            disabled={scanResult.PII || scoreResult.status === "Blocked"}
            className={`font-bold font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all w-full md:w-auto justify-center shadow-lg ${
              scanResult.PII || scoreResult.status === "Blocked"
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/15"
            }`}
          >
            <Copy className="w-4 h-4" />
            {copiedReport ? "¡Copiado!" : "Copiar Reporte Sanitizado"}
          </button>
        </div>

        {/* Audit Readiness QA Grid */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">CONTRALORÍA DE SEGURIDAD INTERNA (QA CHECKLIST)</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {qaChecklist.map((item) => {
              let badgeStyle = "text-slate-400 bg-slate-900 border-slate-800";
              if (item.status === "Ready") badgeStyle = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
              if (item.status === "Needs Review") badgeStyle = "text-amber-400 bg-amber-500/5 border-amber-500/20";
              if (item.status === "Blocked") badgeStyle = "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse";

              return (
                <div
                  key={item.id}
                  onClick={() => toggleQAStatus(item.id)}
                  className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col justify-between space-y-2.5 hover:border-slate-850 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">{item.label}</span>
                    <span className="text-[9px] text-slate-500 leading-snug block">
                      {item.critical ? "Frente vital obligatorio" : "Verificación estándar del laboratorio"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-mono text-[9px] uppercase font-bold">
                    <span className={item.critical ? "text-rose-400" : "text-slate-500"}>
                      {item.critical ? "Critical" : "Standard"}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${badgeStyle}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Output Preview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Vista Preliminar del Reporte de Preparación:</span>
            {scanResult.PII && (
              <span className="text-rose-400 font-bold font-mono uppercase tracking-wide">
                ⚠️ Copiado Bloqueado — Resuelva Warnings de PII
              </span>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-900/80 rounded-xl p-4 font-mono text-[10px] text-slate-400 leading-relaxed max-h-[220px] overflow-y-auto select-all whitespace-pre-wrap">
            {generateIntakeReport()}
          </div>
        </div>
      </div>
        </>
      ) : (
        /* QA Lock Tab View */
        <div className="space-y-6">
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

          {/* Status Banner */}
          {overallState === "Pilot Intake Deployment Readiness Locked" && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">ESTADO DE AUDITORÍA NOMINAL</span>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  🟢 PILOT INTAKE DEPLOYMENT READINESS LOCKED
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
                  El centro de preparación de pilotos ha aprobado el 100% de los resguardos críticos contra PII, credenciales, enlaces RTSP e IPs reales. Todos los badges del Safety Banner y los factores críticos están en orden. El reporte Markdown de preparación preliminar de piloto está listo para ser exportado.
                </p>
              </div>
            </div>
          )}

          {overallState === "Needs Review" && (
            <div className="bg-amber-500/10 border-2 border-amber-500/60 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden font-sans">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">REVISIÓN DE RESGUARDOS ACTIVA</span>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  🟡 PILOT INTAKE STATUS: NEEDS REVIEW
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
                  Se requiere la revisión de algunos frentes de auditoría. Verifique que el número de cámaras piloto esté en el rango recomendado de 1 a 3 y que todos los factores del checklist de autorización operativa se encuentren resueltos.
                </p>
              </div>
            </div>
          )}

          {overallState === "Pilot Intake Blocked" && (
            <div className="bg-rose-500/10 border-2 border-rose-500 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden font-sans">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center shrink-0 animate-bounce">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">BLOQUEO CRÍTICO DE SEGURIDAD</span>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  🔴 PILOT INTAKE STATUS: BLOCKED & UNREADABLE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
                  <strong>ACCESO Y EXPORTACIÓN DESHABILITADOS.</strong> El escáner de sanitización ha interceptado posibles datos sensibles (IPs, RTSPs, credenciales, coordenadas o correos) o se han desactivado badges críticos de seguridad en el Safety Banner. Modifique los campos del formulario antes de continuar.
                </p>
              </div>
            </div>
          )}

          {/* Grid of 10 Frentes */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">CONTRALORÍA DE FRENTES DE AUDITORÍA (10 ÁREAS CLAVE)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {frentes.map((f) => {
                let badgeStyle = "text-slate-400 bg-slate-900 border-slate-800";
                if (f.status === "Ready") badgeStyle = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
                if (f.status === "Needs Review") badgeStyle = "text-amber-400 bg-amber-500/5 border-amber-500/20";
                if (f.status === "Blocked") badgeStyle = "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse";

                return (
                  <div key={f.id} className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md hover:border-slate-850 transition-all">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">{f.name}</span>
                      <p className="text-[10px] text-slate-500 leading-snug block h-14 overflow-hidden line-clamp-3">{f.desc}</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <p className="text-[9px] text-slate-400 leading-snug font-sans"><strong className="text-slate-500 font-mono">Acción:</strong> {f.action}</p>
                      <div className="flex justify-end pt-1">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${badgeStyle}`}>
                          {f.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 14 Checkpoints list & report copy preview */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 font-sans">
            {/* 14 Checkpoints list */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Pilot Intake QA Checklist (Requirement 13)
                </h4>
                <p className="text-[10px] text-slate-500">Cumplimiento técnico y resguardos obligatorios de la demo comercial (14 puntos).</p>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {qaChecklist.map((item) => {
                  let badgeStyle = "text-slate-400 bg-slate-900 border-slate-800";
                  if (item.status === "Ready") badgeStyle = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
                  if (item.status === "Needs Review") badgeStyle = "text-amber-400 bg-amber-500/5 border-amber-500/20";
                  if (item.status === "Blocked") badgeStyle = "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse";

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleQAStatus(item.id)}
                      className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex items-center justify-between hover:border-slate-850 cursor-pointer transition-all gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-slate-300 block">{item.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {item.critical ? "⚠️ Crítico obligatorio" : "Estándar • Haga clic para alternar"}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase shrink-0 ${badgeStyle}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Markdown Report Preview & Export */}
            <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">REPORTE FINAL SANITIZADO</span>
                    <h4 className="text-sm font-bold text-white mt-0.5 font-sans">Reporte de Entrega de Piloto Listo para Uso Comercial</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {setCurrentTab && (
                      <button
                        onClick={() => {
                          const stateToSave = {
                            pilotType,
                            form,
                            overallState,
                            scoreResult: {
                              score: scoreResult.score,
                              status: scoreResult.status,
                              desc: scoreResult.desc
                            }
                          };
                          localStorage.setItem("ORBI_SENTINEL_ACTIVE_PILOT_INTAKE_STATE", JSON.stringify(stateToSave));
                          onAddAuditLog("Preparar Handoff", `Iniciando Pilot Handoff Pack para ${form.pilotName}`);
                          setCurrentTab("pilothandoff");
                        }}
                        className="font-bold font-mono text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
                        id="btn-prepare-handoff-from-intake"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                        <span>Preparar Handoff</span>
                      </button>
                    )}
                    <button
                      onClick={copyReportToClipboard}
                      disabled={scanResult.PII || overallState === "Pilot Intake Blocked"}
                      className={`font-bold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                        scanResult.PII || overallState === "Pilot Intake Blocked"
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/15"
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedReport ? "¡Copiado!" : "Copiar Reporte"}
                    </button>
                  </div>
                </div>

                {scanResult.PII && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 space-y-1 font-sans">
                    <span className="font-bold uppercase flex items-center gap-1.5 font-mono text-rose-400">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      COPIADO DESHABILITADO — SE DETECTARON SECTORES PRIVADOS O DATOS REALES:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-rose-300">
                      {scanResult.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Vista previa del Markdown sanitizado (No contiene datos reales):</span>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-400 leading-relaxed max-h-[340px] overflow-y-auto select-all whitespace-pre-wrap">
                    {generateIntakeReport()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 text-[10px] leading-relaxed text-slate-500 font-sans space-y-1">
                <span className="font-bold text-slate-400 block font-mono">🔍 NOTA DE AUDITORÍA Y PUENTES DE DATOS</span>
                <p>
                  Este puente de información limpia de forma automática cualquier residuo de IPs o credenciales importados de propuestas anteriores. El archivo Markdown contiene directrices conceptuales y roadmaps estándar para simular un levantamiento responsable frente a clientes corporativos de plantas o residencias.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
