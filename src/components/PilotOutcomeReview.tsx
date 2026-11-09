import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  Copy,
  Trash2,
  Plus,
  AlertTriangle,
  Info,
  Layers,
  FileText,
  Users,
  Sliders,
  Activity,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Eye,
  Settings,
  HelpCircle,
  BookOpen,
  Wrench,
  Lock,
  Unlock,
  MessageSquare
} from "lucide-react";
import LockedView from "./LockedView";

// Interface Definitions
interface PilotOutcomeReviewProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

interface Finding {
  id: string;
  title: string;
  category: "UX" | "Operativo" | "Diagnóstico CCTV" | "Privacidad" | "Reportes" | "Incidentes" | "Conectividad" | "Demo/Presentación" | "Riesgo/Restricción" | "Comercial Responsable" | "Técnico Conceptual";
  severity: "Baja" | "Media" | "Alta";
  observedImpact: string;
  evidence: string;
  recommendation: string;
  responsible: string;
  status: "Abierto" | "En revisión" | "Convertido en mejora" | "Descartado";
}

interface FeedbackItem {
  id: string;
  audienceType: string;
  comment: string;
  theme: string;
  priority: "Baja" | "Media" | "Alta";
  suggestedAction: string;
}

interface IncidentReview {
  id: string;
  eventType: string;
  observation: string;
  operatorUnderstanding: string;
  confusingPoints: string;
  improvementsNeeded: string;
  associatedRisk: string;
  recommendation: string;
}

interface BacklogItem {
  id: string;
  title: string;
  origin: "Piloto" | "Simulación" | "Demo" | "Feedback";
  category: string;
  priority: "Baja" | "Media" | "Alta";
  effort: "Bajo" | "Medio" | "Alto";
  expectedImpact: string;
  status: "Propuesta" | "Priorizada" | "En desarrollo" | "Validada internamente" | "Descartada";
  affectedModule: string;
  associatedGuardrail: string;
}

interface IterationPlan {
  id: string;
  priorityImprovement: string;
  affectedModule: string;
  reason: string;
  riskIfIgnored: string;
  guardrailToMaintain: string;
  nextAction: string;
  status: "Planificado" | "En curso" | "Completado";
}

interface LocalHistory {
  id: string;
  date: string;
  source: string;
  pilotType: "field" | "community" | "consumer";
  siteAlias: string;
  findingsCount: number;
  backlogCount: number;
  status: string;
  genericNextStep: string;
}

export default function PilotOutcomeReview({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: PilotOutcomeReviewProps) {
  // 1. RBAC Guard - Hidden for Conserje
  if (userRole === "conserje") {
    return (
      <LockedView
        onBackToEasyView={() => setCurrentTab && setCurrentTab("easyview")}
        onSwitchRole={() => {}}
        requiredRole="Administrador o Técnico de Terreno"
      />
    );
  }

  // 2. State & Data Definitions
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showStatusDetail, setShowStatusDetail] = useState<boolean>(true);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Pilot Outcome Review QA Lock state
  const [qaLockState, setQaLockState] = useState<
    "Learning Loop Ready" | "Needs Sanitization" | "Needs Review" | "Review Blocked" | "PILOT OUTCOME LEARNING LOOP LOCKED"
  >(() => {
    const saved = localStorage.getItem("orbi_qa_lock_state");
    if (saved && ["Learning Loop Ready", "Needs Sanitization", "Needs Review", "Review Blocked", "PILOT OUTCOME LEARNING LOOP LOCKED"].includes(saved)) {
      return saved as any;
    }
    return "Learning Loop Ready";
  });

  useEffect(() => {
    localStorage.setItem("orbi_qa_lock_state", qaLockState);
  }, [qaLockState]);

  // Intake State
  const [siteAlias, setSiteAlias] = useState<string>("PILOTO-SANT-NORTE-01");
  const [pilotType, setPilotType] = useState<"field" | "community" | "consumer">("field");
  const [sourceType, setSourceType] = useState<string>("Piloto Controlado");
  const [durationDays, setDurationDays] = useState<number>(14);
  const [modulesReviewed, setModulesReviewed] = useState<string>("Live Wall, CCTV Diagnostics, Privacy Guard");
  const [observations, setObservations] = useState<string>(
    "Se realizaron pruebas conceptuales de visualización y diagnóstico de enlaces en un entorno simulado de baja potencia. Los operadores comprendieron el flujo de enmascaramiento dinámico de rostros peatonales públicos."
  );
  const [orientativeResult, setOrientativeResult] = useState<string>(
    "Adecuada asimilación de las herramientas por parte del operador de seguridad. El diagnóstico local permitió identificar intermitencias simuladas sin exponer credenciales."
  );
  const [genericNextStep, setGenericNextStep] = useState<string>(
    "Ajustar los tiempos de actualización del microcopy en reportes técnicos locales de laboratorio."
  );

  // Observations & Findings State
  const [findings, setFindings] = useState<Finding[]>([
    {
      id: "find-1",
      title: "Comprensión del estado de enmascaramiento de privacidad",
      category: "Privacidad",
      severity: "Media",
      observedImpact: "El operador dudaba de si la cámara realmente protegía la calle pública.",
      evidence: "Bitácora de retroalimentación de simulador del día 2.",
      recommendation: "Agregar un indicador visual explícito verde 'Privacy Active' en el header del stream.",
      responsible: "Equipo de UX",
      status: "Convertido en mejora"
    },
    {
      id: "find-2",
      title: "Latencia simulada en canal Dahua de laboratorio",
      category: "Conectividad",
      severity: "Baja",
      observedImpact: "Leve retraso óptico al simular caída simulada de switch PoE local.",
      evidence: "Caso de prueba de laboratorio local nro 5.",
      recommendation: "Optimizar el tamaño del búfer de retransmisión local en el receptor web.",
      responsible: "Equipo de Core",
      status: "Abierto"
    },
    {
      id: "find-3",
      title: "Duda conceptual entre modo demo y producción",
      category: "Demo/Presentación",
      severity: "Alta",
      observedImpact: "El cliente conceptual pensó que el software previene intrusiones físicas por sí mismo.",
      evidence: "Comentario registrado durante el simulacro de pitch.",
      recommendation: "Reescribir el descargo de responsabilidad comercial en el onboarding del software.",
      responsible: "Ingeniería Comercial Responsable",
      status: "En revisión"
    }
  ]);

  // Stakeholder Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: "feed-1",
      audienceType: "Operador de Conserjería Genérico",
      comment: "La interfaz de la pantalla principal simplificada es fácil de comprender y reduce el estrés operativo diario.",
      theme: "Usabilidad de la Home",
      priority: "Media",
      suggestedAction: "Mantener el diseño libre de matrices técnicas complejas para este perfil."
    },
    {
      id: "feed-2",
      audienceType: "Administrador de Seguridad Conceptual",
      comment: "El reporte diario es muy útil pero requiere descripciones que eviten compromisos contractuales automáticos.",
      theme: "Gestión Responsable",
      priority: "Alta",
      suggestedAction: "Sanitizar los campos editables y añadir notas de exclusión de garantías."
    }
  ]);

  // Incident Learning Review State
  const [incidentsReview, setIncidentsReview] = useState<IncidentReview[]>([
    {
      id: "inc-1",
      eventType: "Cámara Intermitente Simulada",
      observation: "El flujo de red se desactivó automáticamente en el simulador.",
      operatorUnderstanding: "El operador reconoció el estado offline inmediatamente mediante el color ámbar.",
      confusingPoints: "El operador pensó que la cámara se quemó físicamente.",
      improvementsNeeded: "Aclarar en el microcopy que es una desconexión lógica o caída simulada de puerto PoE.",
      associatedRisk: "Falsa alarma de daño de hardware.",
      recommendation: "Actualizar la guía de diagnóstico rápido en el Operator Help Center."
    },
    {
      id: "inc-2",
      eventType: "Privacidad Activa",
      observation: "La calle pública se representó con un recuadro negro sólido.",
      operatorUnderstanding: "Se comprendió que no hay acceso a imágenes peatonales para respetar la regulación local.",
      confusingPoints: "Preguntó si el administrador podía 'desactivar' el bloqueo para auditar.",
      improvementsNeeded: "Establecer por software que las zonas públicas tienen máscara dura inmutable.",
      associatedRisk: "Intento de vulnerar la privacidad del entorno.",
      recommendation: "Asegurar que el firmware de simulación bloquee la alteración de zonas privadas."
    }
  ]);

  // Technical Learning Review State
  const [techLatencyObserved, setTechLatencyObserved] = useState<string>("Leve retardo óptico observado de 150ms bajo Wi-Fi de pruebas locales.");
  const [techCompatibilityValid, setTechCompatibilityValid] = useState<string>("Se validaron flujos Onvif Profile S en Gateway simulado.");
  const [techGatewaySettings, setTechGatewaySettings] = useState<string>("Configuración local mediante loopback interno, sin requerir reenvío de puertos públicos.");
  const [techPrivacySegmentation, setTechPrivacySegmentation] = useState<string>("Segmentación por software a nivel de renderizado en el cliente.");

  // UX & Operator Learning State
  const [uxHomeUnderstandable, setUxHomeUnderstandable] = useState<string>("claro");
  const [uxConserjeFlow, setUxConserjeFlow] = useState<string>("claro");
  const [uxAdminReports, setUxAdminReports] = useState<string>("claro");
  const [uxTechDiagnostics, setUxTechDiagnostics] = useState<string>("necesita_mejora");
  const [uxHelpCenterUse, setUxHelpCenterUse] = useState<string>("claro");
  const [uxOnboardingUse, setUxOnboardingUse] = useState<string>("claro");
  const [uxRunbookUse, setUxRunbookUse] = useState<string>("claro");
  const [uxPracticeUse, setUxPracticeUse] = useState<string>("claro");
  const [uxOperatorNotes, setUxOperatorNotes] = useState<string>(
    "El panel técnico de diagnóstico requiere explicaciones más cortas para evitar sobrecarga cognitiva en instaladores principiantes."
  );

  // Product Improvement Backlog State
  const [backlogList, setBacklogList] = useState<BacklogItem[]>([
    {
      id: "back-1",
      title: "Microcopy aclaratorio de cámaras intermitentes",
      origin: "Feedback",
      category: "UX / Redacción",
      priority: "Media",
      effort: "Bajo",
      expectedImpact: "Evita falsos diagnósticos de falla eléctrica real.",
      status: "Priorizada",
      affectedModule: "CCTV Diagnostics",
      associatedGuardrail: "No prometer detección de fallas eléctricas físicas externas"
    },
    {
      id: "back-2",
      title: "Hard-coding de zonas de privacidad inmutables por software",
      origin: "Piloto",
      category: "Seguridad",
      priority: "Alta",
      effort: "Medio",
      expectedImpact: "Imposibilita violaciones de privacidad vial desde la UI de cualquier rol.",
      status: "En desarrollo",
      affectedModule: "Privacy Compliance Center",
      associatedGuardrail: "No almacenar transmisiones completas de peatones públicos"
    },
    {
      id: "back-3",
      title: "Incorporación de descargo comercial estático en PDF sanitizado",
      origin: "Demo",
      category: "Legal/Ética",
      priority: "Alta",
      effort: "Bajo",
      expectedImpact: "Garantiza que la exportación de reportes locales no constituya un compromiso de ROI.",
      status: "Validada internamente",
      affectedModule: "Demo Deck Export Center",
      associatedGuardrail: "No prometer ROI financiero ni eliminación total de robos"
    }
  ]);

  // Responsible Claims Review State
  const [claimsReview, setClaimsReview] = useState<{ id: string; originalClaim: string; alternativeClaim: string; verified: boolean }[]>([
    {
      id: "claim-1",
      originalClaim: "El sistema funciona en producción en cualquier condominio.",
      alternativeClaim: "Software validado estrictamente en demostración o entorno piloto acotado.",
      verified: true
    },
    {
      id: "claim-2",
      originalClaim: "Detecta el 100% de los robos y previene intrusiones.",
      alternativeClaim: "Herramienta de apoyo operacional y visualización, sin prometer detección perfecta ni prevención absoluta.",
      verified: true
    },
    {
      id: "claim-3",
      originalClaim: "Elimina las falsas alarmas de seguridad.",
      alternativeClaim: "Mitigación lógica de alertas en escenarios sintéticos sujeta a revisión humana de operador.",
      verified: true
    },
    {
      id: "claim-4",
      originalClaim: "Reemplaza al grabador NVR físico y a los guardias de turno.",
      alternativeClaim: "Apoyo operacional complementario, no reemplaza personal físico de vigilancia ni sistemas locales SCADA u O&M.",
      verified: true
    },
    {
      id: "claim-5",
      originalClaim: "Es universalmente compatible con cualquier cámara del mercado.",
      alternativeClaim: "Compatibilidad dependiente de marca, protocolo estandarizado ONVIF y acceso lógico autorizado.",
      verified: true
    },
    {
      id: "claim-6",
      originalClaim: "Garantiza un ROI de seguridad del 40% anual.",
      alternativeClaim: "Estimación conceptual interna con fines de ilustración de eficiencias operativas simuladas.",
      verified: true
    }
  ]);

  // Next Iteration Plan State
  const [iterationPlan, setIterationPlan] = useState<IterationPlan[]>([
    {
      id: "iter-1",
      priorityImprovement: "Simplificar diagnóstico de red para técnicos",
      affectedModule: "CCTV Diagnostics",
      reason: "Evitar confusiones conceptuales de red lógica durante las demostraciones.",
      riskIfIgnored: "El técnico podría dar falsas alarmas sobre estado de switches.",
      guardrailToMaintain: "No almacenar IPs reales en base de datos local.",
      nextAction: "Reescribir Tooltips informativos con lenguaje simple.",
      status: "En curso"
    },
    {
      id: "iter-2",
      priorityImprovement: "Ajustar onboarding del modo conserje",
      affectedModule: "EasyView Mode",
      reason: "Establecer expectativas realistas sobre alertas visuales.",
      riskIfIgnored: "Sobreestimación del operador respecto a la automatización.",
      guardrailToMaintain: "No prometer prevención total.",
      nextAction: "Incorporar slide obligatorio de descargo ético.",
      status: "Planificado"
    }
  ]);

  // 3. Local History Persistence (Requirement 17)
  const [historyList, setHistoryList] = useState<LocalHistory[]>(() => {
    const saved = localStorage.getItem("orbi_outcome_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default pre-populated safe list
    return [
      {
        id: "hist-1",
        date: "2026-07-28 10:30",
        source: "Simulación Sintética",
        pilotType: "field",
        siteAlias: "SIM-PARQUE-SOLAR-SANT-A",
        findingsCount: 3,
        backlogCount: 2,
        status: "Learning Loop Ready",
        genericNextStep: "Ajustar umbrales de lag en simulación"
      },
      {
        id: "hist-2",
        date: "2026-07-15 14:15",
        source: "Demo Interna",
        pilotType: "community",
        siteAlias: "PILOTO-CONDOMINIO-SANT-B",
        findingsCount: 1,
        backlogCount: 1,
        status: "Ready for Review",
        genericNextStep: "Actualizar onboarding de privacidad"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("orbi_outcome_history", JSON.stringify(historyList));
  }, [historyList]);

  // 4. Automated Outcome Scanner (Requirement 15)
  const [scannerResult, setScannerResult] = useState<{
    clean: boolean;
    violations: string[];
    suggestedPlaceholders: string[];
  }>({ clean: true, violations: [], suggestedPlaceholders: [] });

  const runScanner = () => {
    const violations: string[] = [];
    const suggestedPlaceholders: string[] = [];

    // Helper to test patterns
    const testPattern = (text: string, regex: RegExp, errorMsg: string, placeholder: string) => {
      if (regex.test(text)) {
        violations.push(errorMsg);
        suggestedPlaceholders.push(placeholder);
      }
    };

    // Concatenate all user inputs to scan
    const corpus = [
      siteAlias,
      durationDays.toString(),
      modulesReviewed,
      observations,
      orientativeResult,
      genericNextStep,
      techLatencyObserved,
      techCompatibilityValid,
      techGatewaySettings,
      techPrivacySegmentation,
      uxOperatorNotes
    ].join(" ") + 
    findings.map(f => `${f.title} ${f.observedImpact} ${f.evidence} ${f.recommendation} ${f.responsible}`).join(" ") +
    feedbackList.map(f => `${f.comment} ${f.audienceType} ${f.theme} ${f.suggestedAction}`).join(" ") +
    incidentsReview.map(i => `${i.eventType} ${i.observation} ${i.operatorUnderstanding} ${i.confusingPoints} ${i.improvementsNeeded} ${i.associatedRisk} ${i.recommendation}`).join(" ") +
    backlogList.map(b => `${b.title} ${b.expectedImpact} ${b.category} ${b.associatedGuardrail}`).join(" ") +
    iterationPlan.map(i => `${i.priorityImprovement} ${i.reason} ${i.riskIfIgnored} ${i.guardrailToMaintain} ${i.nextAction}`).join(" ");

    // A. Personal Information (PII)
    testPattern(corpus, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, "Email detectado (PII)", "[EMAIL SANITIZADO]");
    testPattern(corpus, /(\+?56\s?9?\s?\d{4}\s?\d{4})|(\+?1\s?\d{3}\s?\d{3}\s?\d{4})|(\+?34\s?\d{3}\s?\d{3}\s?\d{3})/, "Teléfono detectado (PII)", "[TELÉFONO SANITIZADO]");
    testPattern(corpus, /\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/, "RUT detectado (Identificador local chileno)", "[RUT SANITIZADO]");
    
    // B. Real Network Data
    testPattern(corpus, /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/, "Dirección IP real o de red detectada", "[IP DE RETROALIMENTACIÓN LOOPBACK]");
    testPattern(corpus, /rtsp:\/\/([a-zA-Z0-9]+:?[a-zA-Z0-9]*@)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/, "URL RTSP detectada", "[RTSP SANITIZADO]");
    testPattern(corpus, /\b(password|contraseña|pwd|passwd|key|token|auth_token)\s*=\s*[^\s]+/i, "Credenciales o tokens en texto plano", "[LLAVE_EN_ENTORNO_OCULTO]");
    
    // C. Commercial/Contractual forbidden elements
    testPattern(corpus, /(contrato|precio|cotización|cotizacion|CLP|USD|pesos|dólares|dolares|uf|facturación|facturacion)/i, "Datos de contrato, precios o facturación detectados", "[MARCO COOPERACIÓN TÉCNICA]");
    testPattern(corpus, /(calle\s+[A-Z]|[A-Z][a-z]+\s+#?\s*\d+)/, "Dirección física sospechosa", "[ENTORNO DE SIMULACIÓN ACUTADO]");
    testPattern(corpus, /(condominio\s+[A-Za-z]+|parque\s+[A-Za-z]+|edificio\s+[A-Za-z]+)/i, "Nombres de sitios o condominios reales", "[PROYECTO SIMULADO PILOTO]");

    // D. Prohibited Claims
    testPattern(corpus, /(100%\s+de\s+detección|detección\s+perfecta|detección\s+infalible|100%\s+deteccion|deteccion\s+perfecta)/i, "Promesa de detección infalible", "Detección sujeta a condiciones lumínicas y contraste local");
    testPattern(corpus, /(evita\s+robos|previene\s+robos|elimina\s+robos|cero\s+robos|elimina\s+falsas\s+alarmas)/i, "Promesa de prevención absoluta de delitos", "Apoyo visual operacional");
    testPattern(corpus, /(reemplaza\s+al\s+guardia|reemplaza\s+guardias|reemplaza\s+conserje|reemplaza\s+NVR)/i, "Promesa de reemplazo de personal de seguridad física", "Complemento de alerta operacional");
    testPattern(corpus, /(garantiza\s+ROI|ROI\s+del\s+\d+|ROI\s+garantizado)/i, "Promesa de ROI comercial garantizado", "Ilustración conceptual de eficiencias");
    testPattern(corpus, /(certificación\s+legal|evidencia\s+legal|certificado\s+oficial)/i, "Lenguaje de certificación legal o acreditación oficial", "Material técnico de apoyo para análisis interno");

    const isClean = violations.length === 0;
    setScannerResult({
      clean: isClean,
      violations,
      suggestedPlaceholders
    });
  };

  useEffect(() => {
    runScanner();
  }, [
    siteAlias,
    pilotType,
    sourceType,
    durationDays,
    modulesReviewed,
    observations,
    orientativeResult,
    genericNextStep,
    techLatencyObserved,
    techCompatibilityValid,
    techGatewaySettings,
    techPrivacySegmentation,
    findings,
    feedbackList,
    incidentsReview,
    backlogList,
    iterationPlan
  ]);

  // Overall evaluation state derived from Scanner (Requirement 3 & 5) and QA Lock state
  const isBlockedByScanner = !scannerResult.clean;
  const overallState = isBlockedByScanner
    ? "Review Blocked"
    : qaLockState;

  // Actions
  const handleAddFinding = () => {
    const newFind: Finding = {
      id: `find-${Date.now()}`,
      title: "Nuevo hallazgo de usabilidad",
      category: "UX",
      severity: "Baja",
      observedImpact: "Dificultad de lectura inicial.",
      evidence: "Simulacro interno de operador.",
      recommendation: "Aumentar el contraste del texto descriptivo.",
      responsible: "Equipo de UX",
      status: "Abierto"
    };
    setFindings([...findings, newFind]);
    onAddAuditLog("Agregar Hallazgo en Outcome Review", "Se registró un nuevo hallazgo sanitizado.");
  };

  const handleUpdateFindingStatus = (id: string, newStatus: Finding["status"]) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status: newStatus } : f));
    onAddAuditLog("Actualizar Estado de Hallazgo", `Hallazgo ${id} a ${newStatus}`);
  };

  const handleDeleteFinding = (id: string) => {
    setFindings(findings.filter(f => f.id !== id));
    onAddAuditLog("Eliminar Hallazgo", `ID: ${id}`);
  };

  const handleAddFeedback = () => {
    const newFeed: FeedbackItem = {
      id: `feed-${Date.now()}`,
      audienceType: "Operador Conceptual",
      comment: "El simulador refleja fielmente la respuesta de la interfaz ante alarmas.",
      theme: "Fidelidad del Entorno",
      priority: "Baja",
      suggestedAction: "Continuar usando escenarios sintéticos para inducción."
    };
    setFeedbackList([...feedbackList, newFeed]);
    onAddAuditLog("Agregar Feedback en Outcome Review", "Se registró feedback sintético.");
  };

  const handleAddBacklogItem = () => {
    const newBack: BacklogItem = {
      id: `back-${Date.now()}`,
      title: "Optimizar carga inicial de Live Wall",
      origin: "Simulación",
      category: "Rendimiento",
      priority: "Media",
      effort: "Medio",
      expectedImpact: "Menor latencia inicial de carga simulada de streaming.",
      status: "Propuesta",
      affectedModule: "Live Wall",
      associatedGuardrail: "No prometer latencia cero en entornos viales inestables"
    };
    setBacklogList([...backlogList, newBack]);
    onAddAuditLog("Agregar Item a Backlog de Mejoras", "Mejora agregada a lista interna.");
  };

  const handleAddIterationPlan = () => {
    const newIter: IterationPlan = {
      id: `iter-${Date.now()}`,
      priorityImprovement: "Ajustar tipografías de alerta",
      affectedModule: "Incident Center",
      reason: "Mejorar legibilidad de prioridades críticas en pantallas de menor resolución.",
      riskIfIgnored: "Bajo riesgo de demora visual.",
      guardrailToMaintain: "No prometer prevención absoluta.",
      nextAction: "Utilizar pesos semibold en etiquetas de severidad.",
      status: "Planificado"
    };
    setIterationPlan([...iterationPlan, newIter]);
    onAddAuditLog("Agregar Plan de Iteración", "Nueva acción agregada al plan.");
  };

  const handleSaveToHistory = () => {
    if (isBlockedByScanner) return;

    const newHist: LocalHistory = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      source: sourceType,
      pilotType: pilotType,
      siteAlias: siteAlias,
      findingsCount: findings.length,
      backlogCount: backlogList.length,
      status: overallState,
      genericNextStep: genericNextStep || "Revisión general continua"
    };

    setHistoryList([newHist, ...historyList]);
    onAddAuditLog("Guardar Aprendizaje en Historial", `Piloto: ${siteAlias}`);
    alert("Resultados de revisión guardados localmente con éxito en el Historial de Aprendizajes.");
  };

  const handlePurgeHistory = () => {
    if (window.confirm("¿Está seguro de que desea vaciar el historial local de aprendizajes sanitizados?")) {
      setHistoryList([]);
      localStorage.removeItem("orbi_outcome_history");
      onAddAuditLog("Purgar Historial de Aprendizajes", "Se vació el almacenamiento local.");
    }
  };

  // Generate Report content (Requirement 16)
  const reportContent = `ORBI SENTINEL IA — PILOT OUTCOME REVIEW REPORT
==================================================
Versión de Software: v0.15.2-sentinel-learning-loop-acceptance-lock
Estado de Revisión: ${overallState.toUpperCase()}
Fuente de Datos: ${sourceType} (${pilotType.toUpperCase()})
Alias Sanitizado: ${siteAlias}
Duración Evaluada: ${durationDays} días
Módulos Clave Involucrados: ${modulesReviewed}

I. OBJETIVO EVALUADO (SANTIZADO)
--------------------------------------------------
${observations}

II. HALLAZGOS Y OBSERVACIONES CLASIFICADAS
--------------------------------------------------
${findings
  .map(
    (f, idx) =>
      `${idx + 1}. [${f.category}] ${f.title} (Severidad: ${f.severity} / Estado: ${f.status})
   - Impacto observado: ${f.observedImpact}
   - Recomendación: ${f.recommendation} (Responsable: ${f.responsible})`
  )
  .join("\n\n")}

III. RETROALIMENTACIÓN DE STAKEHOLDERS (SANITIZADA)
--------------------------------------------------
${feedbackList
  .map(
    (f, idx) =>
      `- [${f.theme}] ${f.comment} (Audiencia: ${f.audienceType} / Prioridad: ${f.priority})`
  )
  .join("\n")}

IV. EVALUACIÓN TÉCNICA Y DE INCIDENTES CONCEPTUALES
--------------------------------------------------
- Eventos de incidentes revisados:
  ${incidentsReview
    .map(
      i =>
        `* Evento: ${i.eventType}
          - Observación: ${i.observation}
          - Entendimiento del operador: ${i.operatorUnderstanding}
          - Confusión evitada: ${i.confusingPoints}
          - Recomendación de producto: ${i.recommendation}`
    )
    .join("\n\n  ")}

- Latencia local simulada promedio observada: ${techLatencyObserved}
- Compatibilidad demostrada en laboratorio: ${techCompatibilityValid}
- Segmentación conceptual de privacidad: ${techPrivacySegmentation}

V. APRENDIZAJES UX Y OPERACIÓN
--------------------------------------------------
- Inicio Premium Entendible: ${uxHomeUnderstandable.toUpperCase()}
- Conserje comprende flujo simple: ${uxConserjeFlow.toUpperCase()}
- Técnico comprende diagnóstico CCTV: ${uxTechDiagnostics.toUpperCase()}
- Comentarios de usabilidad: ${uxOperatorNotes}

VI. MEJORAS PRIORIZADAS EN BACKLOG (PRODUCT IMPROVEMENT)
--------------------------------------------------
${backlogList
  .map(
    (b, idx) =>
      `${idx + 1}. [${b.affectedModule}] ${b.title} (Prioridad: ${b.priority} / Esfuerzo: ${b.effort})
   - Origen: ${b.origin} | Estado: ${b.status}
   - Guardrail de desarrollo asociado: ${b.associatedGuardrail}`
  )
  .join("\n\n")}

VII. REVISIÓN DE CLAIMS RESPONSABLES (DECLARACIONES CUMPLIDAS)
--------------------------------------------------
- Se verifica el cumplimiento de declaraciones éticas:
${claimsReview
  .map(
    c =>
      `  [${c.verified ? "SI" : "NO"}] Se evitó la declaración: "${c.originalClaim}"
       -> Reemplazada por la frase responsable: "${c.alternativeClaim}"`
  )
  .join("\n")}

VIII. PLAN DE SIGUIENTE ITERACIÓN
--------------------------------------------------
${iterationPlan
  .map(
    (i, idx) =>
      `  - Mejora: ${i.priorityImprovement} [Módulo: ${i.affectedModule}]
        * Razón: ${i.reason}
        * Siguiente acción técnica: ${i.nextAction} [Estado: ${i.status}]`
  )
  .join("\n")}

IX. LIMITACIONES Y DESCARGO DE RESPONSABILIDAD DE LA REVISIÓN
--------------------------------------------------
Este reporte resume aprendizajes internos de demo controlada, piloto acotado o simulación sintética. No representa aprobación contractual, validación legal, despliegue productivo ni resultado garantizado. No contiene datos personales (PII), credenciales lógicas reales, ni flujos IP/RTSP externos.

Generado el: ${new Date().toISOString().replace("T", " ").substring(0, 16)} UTC.`;

  const handleCopyToClipboard = () => {
    if (isBlockedByScanner) return;
    navigator.clipboard.writeText(reportContent);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    onAddAuditLog("Copiar Reporte de Outcomes", `Piloto: ${siteAlias}`);
  };

  return (
    <div className="space-y-6" id="pilot-outcome-review-root">
      
      {/* 1. HEADER TITLE SECTION WITH INTEGRATIONS BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded">
              MÓDULO 15A
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest">
              Pilot Outcome Review Center & Learning Loop
            </span>
          </div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight mt-1">
            Pilot Outcome Review Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Sistematice aprendizajes técnicos y de usabilidad obtenidos de pilotos simulados o controlados de laboratorio. 
            Vuelque hallazgos en mejoras de software inyectando retroalimentación directamente en el backlog sin almacenar información sensible.
          </p>
        </div>

        {/* INTEGRACIONES ENLACES (Requirement 18) */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mr-1.5 pl-1">
            Atajos:
          </span>
          {setCurrentTab && (
            <>
              <button
                onClick={() => {
                  setCurrentTab("customerpilotworkspace");
                  onAddAuditLog("Atajo a Workspace", "Desde Outcome Review");
                }}
                className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-emerald-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded transition-all"
              >
                Pilot Workspace &rarr;
              </button>
              <button
                onClick={() => {
                  setCurrentTab("customerpilotsimulator");
                  onAddAuditLog("Atajo a Simulator", "Desde Outcome Review");
                }}
                className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-emerald-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded transition-all"
              >
                Simulator Lab &rarr;
              </button>
              <button
                onClick={() => {
                  setCurrentTab("pilotintake");
                  onAddAuditLog("Atajo a Intake Center", "Desde Outcome Review");
                }}
                className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-emerald-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded transition-all"
              >
                Pilot Intake &rarr;
              </button>
              <button
                onClick={() => {
                  setCurrentTab("helpcenter");
                  onAddAuditLog("Atajo a Help Center", "Desde Outcome Review");
                }}
                className="px-2.5 py-1 text-[10px] font-mono text-slate-300 hover:text-emerald-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded transition-all"
              >
                Help Center &rarr;
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. AUTOMATED SAFETY BANNER & DETAILED BADGES (Requirement 3) */}
      <div className="bg-[#0b1329] border border-blue-900/40 rounded-2xl p-5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none rounded-tr-2xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none">
                POLÍTICA DE REVISIÓN INTERNA Y SANITIZACIÓN
              </p>
              <h3 className="text-xs font-bold text-slate-200 mt-1 leading-normal">
                Revisión interna de resultados — use solo aprendizajes sanitizados o escenarios sintéticos. No ingrese clientes reales, IP/RTSP, credenciales, contratos, precios, direcciones ni datos sensibles.
              </h3>
            </div>
          </div>
          <div className="shrink-0">
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
              POST-14D ACTIVE
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "Internal Review", status: true },
            { label: "Sanitized Outcomes", status: !isBlockedByScanner },
            { label: "Synthetic Data Allowed", status: true },
            { label: "No Credentials", status: !scannerResult.violations.some(v => v.includes("Credenciales")) },
            { label: "No IP/RTSP", status: !scannerResult.violations.some(v => v.includes("IP") || v.includes("RTSP")) },
            { label: "No Real Customers", status: !scannerResult.violations.some(v => v.includes("clientes") || v.includes("sitios")) },
            { label: "No Contracts", status: !scannerResult.violations.some(v => v.includes("contrato")) },
            { label: "Human Review", status: true },
            { label: "Learning Loop", status: true },
            { label: "Home Preserved", status: true }
          ].map((badge, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border tracking-tight flex items-center gap-1 ${
                badge.status
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${badge.status ? "bg-emerald-400" : "bg-rose-400"}`}></span>
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* 3. SCANNED SENSITIVE DATA WARNING BLOCK (Requirement 15) */}
      {!scannerResult.clean && (
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-4 space-y-3 animate-headShake">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-mono font-black text-rose-300 uppercase tracking-wider">
                BLOQUEO DE SEGURIDAD — DATOS PRIVADOS O CLAIMS PROHIBIDOS DETECTADOS
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                El escáner de cumplimiento ético ha detectado información que viola las directrices de privacidad de ORBI Sentinel IA. 
                Se bloquea la copia del reporte y el registro local hasta que sea corregido.
              </p>
              
              {/* List of Detected Violations */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-rose-950 mt-2 space-y-1.5 text-[10px] font-mono">
                {scannerResult.violations.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>
                      <strong className="text-rose-300">Violación:</strong> {v} 
                      <span className="text-slate-500 ml-2">| Sugerencia: Reemplazar con <code className="text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/20">{scannerResult.suggestedPlaceholders[i]}</code></span>
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-amber-400 font-mono font-bold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Acción correctiva: Revise sus campos de texto, observaciones sanitizadas, hallazgos, etc. y limpie todo correo, IP, teléfono, nombre o claim absoluto.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WORKSPACE DASHBOARD WITH VERTICAL TABS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left vertical tabs bar (Requirement 4) */}
        <div className="lg:col-span-1 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-900 space-y-1">
          <span className="text-[9px] font-mono font-black uppercase text-slate-500 tracking-widest block px-3 mb-2 pt-1">
            SECCIONES DE APRENDIZAJE
          </span>
          {[
            { id: "overview", label: "A. Outcome Overview", count: null },
            { id: "intake", label: "B. Outcome Intake", count: null },
            { id: "findings", label: "C. Observations & Findings", count: findings.length },
            { id: "feedback", label: "D. Stakeholder Feedback", count: feedbackList.length },
            { id: "incidents", label: "E. Incident Learning", count: incidentsReview.length },
            { id: "technical", label: "F. Technical Learning", count: null },
            { id: "ux", label: "G. UX & Operator Learning", count: null },
            { id: "backlog", label: "H. Improvement Backlog", count: backlogList.length },
            { id: "claims", label: "I. Responsible Claims", count: claimsReview.length },
            { id: "plan", label: "J. Next Iteration Plan", count: iterationPlan.length },
            { id: "report", label: "K. Summary Report", count: isBlockedByScanner ? "🚫" : "📄" },
            { id: "history", label: "L. Local Learning History", count: historyList.length }
          ].map(section => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  onAddAuditLog("Cambio de Pestaña Outcome Review", `Sección: ${section.id}`);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono transition-all border ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
                }`}
              >
                <span className="truncate">{section.label}</span>
                {section.count !== null && (
                  <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded font-bold ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}>
                    {section.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Pane */}
        <div className="lg:col-span-3 space-y-6">

          {/* SECTION A: OUTCOME OVERVIEW */}
          {activeSection === "overview" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>A. Outcome Overview & Calibration State</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Visión unificada y estados internos del bucle de aprendizaje.</p>
              </div>

              {/* Status Indicator Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Estado de Calibración Interna:</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      overallState === "Review Blocked"
                        ? "bg-rose-500 animate-ping"
                        : overallState === "PILOT OUTCOME LEARNING LOOP LOCKED"
                        ? "bg-emerald-500"
                        : "bg-emerald-400"
                    }`} />
                    <span className="text-lg font-mono font-black tracking-wide text-white">
                      {overallState.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal pt-1">
                    {overallState === "Review Blocked"
                      ? "La calibración está bloqueada por detección de datos sensibles o violación de políticas. Por favor sanitice el entorno de entrada."
                      : overallState === "PILOT OUTCOME LEARNING LOOP LOCKED"
                      ? "Bucle cerrado y bloqueado por control de calidad para asimilación final."
                      : "La calibración de piloto está lista para asimilación en el backlog del equipo de desarrollo core."}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Métricas Sanitizadas de Aprendizaje:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-lg font-bold text-slate-100 block">{findings.length}</span>
                      <span className="text-[9px] text-slate-400">Hallazgos</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-lg font-bold text-slate-100 block">{backlogList.length}</span>
                      <span className="text-[9px] text-slate-400">Backlog</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-lg font-bold text-emerald-400 block">{iterationPlan.length}</span>
                      <span className="text-[9px] text-emerald-400">Plan Iter.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QA LOCK Status Selector & Action Panel */}
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Panel de Control QA LOCK & Estados
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    overallState === "PILOT OUTCOME LEARNING LOOP LOCKED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                      : overallState === "Review Blocked"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}>
                    {overallState}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-mono block uppercase">Transición de Estado Manual:</label>
                    <select
                      value={qaLockState}
                      disabled={isBlockedByScanner || qaLockState === "PILOT OUTCOME LEARNING LOOP LOCKED"}
                      onChange={(e) => setQaLockState(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                    >
                      <option value="Learning Loop Ready">Learning Loop Ready</option>
                      <option value="Needs Sanitization">Needs Sanitization</option>
                      <option value="Needs Review">Needs Review</option>
                      <option value="Review Blocked">Review Blocked</option>
                    </select>
                    {isBlockedByScanner && (
                      <p className="text-[9px] text-rose-400 font-mono italic">
                        * Bloqueado por scanner: corrija los datos sensibles para desbloquear transiciones.
                      </p>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    {qaLockState !== "PILOT OUTCOME LEARNING LOOP LOCKED" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isBlockedByScanner) return;
                          setQaLockState("PILOT OUTCOME LEARNING LOOP LOCKED");
                        }}
                        disabled={isBlockedByScanner}
                        className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Bloquear Learning Loop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setQaLockState("Learning Loop Ready")}
                        className="w-full h-9 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 font-mono font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Desbloquear (Admin/Técnico)
                      </button>
                    )}
                  </div>
                </div>

                {overallState === "PILOT OUTCOME LEARNING LOOP LOCKED" && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-[11px] text-emerald-400 font-sans leading-relaxed flex items-start gap-1.5">
                      <span className="font-bold">✓ Bucle Bloqueado:</span> 
                      El estado del bucle ha sido fijado como PILOT OUTCOME LEARNING LOOP LOCKED. 
                      Todos los datos de calibración han quedado asegurados y sanitizados como backlog interno de QA del bucle de aprendizaje.
                    </p>
                  </div>
                )}
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-3.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Tipo de Revisión:</span>
                    <span className="text-white font-bold">{sourceType}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Categoría del Entorno:</span>
                    <span className="text-emerald-400 font-bold uppercase">{pilotType}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Módulos en Alcance:</span>
                    <span className="text-slate-200 text-right truncate max-w-[200px]">{modulesReviewed}</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Duración del Piloto:</span>
                    <span className="text-white font-bold">{durationDays} días</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Hallazgos Abiertos:</span>
                    <span className="text-amber-400 font-bold">
                      {findings.filter(f => f.status === "Abierto" || f.status === "En revisión").length}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Siguiente Acción:</span>
                    <span className="text-emerald-400 font-bold truncate max-w-[200px]">{genericNextStep || "Verificar plan"}</span>
                  </div>
                </div>
              </div>

              {/* Legal Warning Disclaimer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Aviso Legal Interno de Calibración</span>
                </div>
                <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                  “Este estado es interno y orientativo. No representa aprobación contractual, validación legal, autorización productiva ni resultado garantizado.”
                </p>
              </div>
            </div>
          )}

          {/* SECTION B: SANITIZED OUTCOME INTAKE */}
          {activeSection === "intake" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>B. Sanitized Outcome Intake Form</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ingrese parámetros básicos de retroalimentación de pilotos. El escáner verificará la sanitización de los campos en tiempo real.
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">Alias Sanitizado del Piloto:</label>
                  <input
                    type="text"
                    value={siteAlias}
                    onChange={(e) => setSiteAlias(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                    placeholder="e.g. PILOTO-SANT-SUR-02"
                  />
                  <span className="text-[9px] text-slate-500 block">Use identificadores lógicos artificiales, nunca el nombre real de un condominio o cliente.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">Tipo de Piloto:</label>
                  <select
                    value={pilotType}
                    onChange={(e) => setPilotType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                  >
                    <option value="field">🛰️ Field (Monitoreo e Infraestructura Extensa)</option>
                    <option value="community">🏢 Community (Copropiedades y Condominios)</option>
                    <option value="consumer">🏠 Consumer (Casas e Integraciones Domésticas)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">Fuente del Aprendizaje:</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                  >
                    <option value="Piloto Controlado">Piloto Controlado Local</option>
                    <option value="Simulación Sintética">Simulación Sintética de Laboratorio</option>
                    <option value="Demo Interna">Demostración Técnica de Gabinete</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">Duración Aproximada (Días):</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-400 block font-bold">Módulos de Software Evaluados:</label>
                  <input
                    type="text"
                    value={modulesReviewed}
                    onChange={(e) => setModulesReviewed(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                    placeholder="e.g. Live Wall, CCTV Diagnostics, Privacy Compliance"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-400 block font-bold">Objetivos de la Simulación u Observaciones Generales (Sanitizados):</label>
                  <textarea
                    rows={3}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/55 leading-relaxed font-sans"
                    placeholder="Escriba el contexto técnico general, evitando toda información personal, nombres reales o IPs de red."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-400 block font-bold">Resultados y Observaciones Orientativas de Producto (Sin Promesas de ROI):</label>
                  <textarea
                    rows={3}
                    value={orientativeResult}
                    onChange={(e) => setOrientativeResult(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/55 leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-400 block font-bold">Siguiente Paso Genérico de Desarrollo:</label>
                  <input
                    type="text"
                    value={genericNextStep}
                    onChange={(e) => setGenericNextStep(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/55"
                    placeholder="e.g. Ajustar microcopy aclaratorio"
                  />
                </div>
              </div>

              {/* Validation helper alert */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-normal space-y-1 font-mono">
                <span className="text-emerald-400 font-bold block uppercase tracking-wider">CAMPOS PROHIBIDOS:</span>
                <p>
                  El sistema bloquea activamente: Nombre de cliente, IP/RTSP, emails, teléfonos, contratos, precios o claims de prevención total de delitos.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveToHistory}
                  disabled={isBlockedByScanner}
                  className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    isBlockedByScanner
                      ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardar Aprendizaje en Historial Local</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION C: OBSERVATIONS & FINDINGS */}
          {activeSection === "findings" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>C. Observations & Product Findings</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hallazgos puntuales detectados durante pruebas que impactan la hoja de ruta.</p>
                </div>
                <button
                  onClick={handleAddFinding}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Hallazgo</span>
                </button>
              </div>

              {/* Findings List */}
              <div className="space-y-3.5">
                {findings.map((f, idx) => (
                  <div key={f.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 relative">
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-black">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            {f.category}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                            f.severity === "Alta"
                              ? "bg-rose-500/15 border-rose-500/25 text-rose-400"
                              : f.severity === "Media"
                              ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}>
                            Severidad: {f.severity}
                          </span>
                        </div>
                        <h4 className="text-xs font-mono font-bold text-slate-100 pt-1">{f.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteFinding(f.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar hallazgo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono pt-1 text-slate-300 border-t border-slate-900/60">
                      <div>
                        <span className="text-slate-500 block uppercase text-[9px] font-bold">Impacto Observado:</span>
                        <p className="mt-0.5 leading-normal">{f.observedImpact}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[9px] font-bold">Evidencia / Contexto:</span>
                        <p className="mt-0.5 leading-normal">{f.evidence}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-emerald-400/80 block uppercase text-[9px] font-bold">Recomendación de Producto:</span>
                        <p className="mt-0.5 text-slate-200 leading-normal font-sans italic">{f.recommendation}</p>
                      </div>
                    </div>

                    {/* Status & Responsibility Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-900/60 text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-slate-500 uppercase font-bold">Responsable Genérico:</span>
                        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {f.responsible}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 uppercase font-bold">Estado:</span>
                        <select
                          value={f.status}
                          onChange={(e) => handleUpdateFindingStatus(f.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="Abierto">Abierto</option>
                          <option value="En revisión">En revisión</option>
                          <option value="Convertido en mejora">Convertido en mejora</option>
                          <option value="Descartado">Descartado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: STAKEHOLDER FEEDBACK SANITIZED */}
          {activeSection === "feedback" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>D. Stakeholder Feedback (Sanitized Comments)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Voz de los usuarios e instaladores capturada de forma genérica.</p>
                </div>
                <button
                  onClick={handleAddFeedback}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Feedback</span>
                </button>
              </div>

              {/* Feedback cards grid */}
              <div className="space-y-3 font-mono text-xs">
                {feedbackList.map((f, idx) => (
                  <div key={f.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded font-black uppercase">
                          {f.audienceType}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          Tema: {f.theme}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 rounded uppercase ${
                        f.priority === "Alta" ? "text-rose-400" : "text-slate-400"
                      }`}>
                        Prioridad: {f.priority}
                      </span>
                    </div>

                    <p className="text-slate-300 italic font-sans pl-2 border-l border-emerald-500/40 py-1 leading-relaxed">
                      &ldquo;{f.comment}&rdquo;
                    </p>

                    <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/60">
                      <span className="text-emerald-400 uppercase font-black tracking-wider block text-[9px] mb-0.5">Acción Recomendada:</span>
                      <span>{f.suggestedAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION E: INCIDENT LEARNING REVIEW */}
          {activeSection === "incidents" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>E. Incident Learning Review</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Revisiones metodológicas de eventos simulados de red o falsos disparos.</p>
              </div>

              {/* Incidents Learning Accordions */}
              <div className="space-y-4">
                {incidentsReview.map((i, idx) => (
                  <div key={i.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <span className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                        #{idx + 1} EVENTO
                      </span>
                      <span className="font-bold text-slate-200 uppercase">{i.eventType}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 leading-normal">
                      <div>
                        <span className="text-slate-500 block uppercase text-[9px] font-bold">¿Qué se observó?:</span>
                        <p className="text-slate-300 mt-0.5">{i.observation}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 block uppercase text-[9px] font-bold">¿Qué entendió el operador?:</span>
                        <p className="text-slate-300 mt-0.5">{i.operatorUnderstanding}</p>
                      </div>
                      <div>
                        <span className="text-rose-400 block uppercase text-[9px] font-bold">¿Qué fue confuso?:</span>
                        <p className="text-slate-300 mt-0.5">{i.confusingPoints}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase text-[9px] font-bold">¿Qué debe mejorar?:</span>
                        <p className="text-slate-300 mt-0.5">{i.improvementsNeeded}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 block uppercase text-[9px] font-bold">Riesgo Asociado de Pitch:</span>
                        <p className="text-slate-300 mt-0.5">{i.associatedRisk}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 block uppercase text-[9px] font-bold">Recomendación de Software:</span>
                        <p className="text-emerald-300 mt-0.5 font-sans italic">{i.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION F: TECHNICAL LEARNING REVIEW */}
          {activeSection === "technical" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span>F. Technical Learning Review (Conceptual)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Validaciones lógicas de red, compatibilidad y hardware sin almacenar IPs reales.</p>
              </div>

              {/* Technical Forms Inputs */}
              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">A. Latencias Observadas en Demo / Entorno Local:</label>
                  <input
                    type="text"
                    value={techLatencyObserved}
                    onChange={(e) => setTechLatencyObserved(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">B. Compatibilidades de Dispositivos CCTV a Validar:</label>
                  <input
                    type="text"
                    value={techCompatibilityValid}
                    onChange={(e) => setTechCompatibilityValid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">C. Configuración del Gateway de Laboratorio (Observaciones):</label>
                  <textarea
                    rows={2}
                    value={techGatewaySettings}
                    onChange={(e) => setTechGatewaySettings(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">D. Privacidad y Segmentación Conceptual:</label>
                  <input
                    type="text"
                    value={techPrivacySegmentation}
                    onChange={(e) => setTechPrivacySegmentation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Warning on non-technical configs */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-2 text-[10px] text-slate-500 font-mono">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <p>
                  No registre direcciones IP públicas de subredes, claves SSH de gateways, ni RTSP reales de cámaras. ORBI Sentinel IA bloquea su guardado por seguridad.
                </p>
              </div>
            </div>
          )}

          {/* SECTION G: UX & OPERATOR LEARNING */}
          {activeSection === "ux" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>G. UX & Operator Learning Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Validación de la claridad cognitiva de los diferentes módulos del software.</p>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Pantalla Principal Premium:</span>
                  <div className="flex gap-2">
                    {["claro", "necesita_mejora", "confuso"].map(state => (
                      <button
                        key={state}
                        onClick={() => setUxHomeUnderstandable(state)}
                        className={`flex-1 py-1 rounded text-[10px] uppercase font-bold border transition-all ${
                          uxHomeUnderstandable === state
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {state.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Entendimiento Modo Conserje (EasyView):</span>
                  <div className="flex gap-2">
                    {["claro", "necesita_mejora", "confuso"].map(state => (
                      <button
                        key={state}
                        onClick={() => setUxConserjeFlow(state)}
                        className={`flex-1 py-1 rounded text-[10px] uppercase font-bold border transition-all ${
                          uxConserjeFlow === state
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {state.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Auditoría de Reportes (Admin):</span>
                  <div className="flex gap-2">
                    {["claro", "necesita_mejora", "confuso"].map(state => (
                      <button
                        key={state}
                        onClick={() => setUxAdminReports(state)}
                        className={`flex-1 py-1 rounded text-[10px] uppercase font-bold border transition-all ${
                          uxAdminReports === state
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {state.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Consola de Diagnóstico (Técnico):</span>
                  <div className="flex gap-2">
                    {["claro", "necesita_mejora", "confuso"].map(state => (
                      <button
                        key={state}
                        onClick={() => setUxTechDiagnostics(state)}
                        className={`flex-1 py-1 rounded text-[10px] uppercase font-bold border transition-all ${
                          uxTechDiagnostics === state
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        {state.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Operator general comments */}
              <div className="space-y-1.5 font-mono text-xs pt-1">
                <label className="text-slate-400 block font-bold">Observaciones Generales de Sobrecarga Cognitiva:</label>
                <textarea
                  rows={2}
                  value={uxOperatorNotes}
                  onChange={(e) => setUxOperatorNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* SECTION H: PRODUCT IMPROVEMENT BACKLOG */}
          {activeSection === "backlog" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>H. Product Improvement Backlog (Internal)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Registro interno de mejoras lógicas de software derivadas del piloto.</p>
                </div>
                <button
                  onClick={handleAddBacklogItem}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Mejora</span>
                </button>
              </div>

              {/* Backlog List */}
              <div className="space-y-3.5 text-xs font-mono">
                {backlogList.map((b, idx) => (
                  <div key={b.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                        <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                          Modulo: {b.affectedModule}
                        </span>
                        <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[9px]">
                          Origen: {b.origin}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setBacklogList(backlogList.filter(item => item.id !== b.id));
                          onAddAuditLog("Eliminar Item Backlog", `ID: ${b.id}`);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">{b.title}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] pt-1 border-t border-slate-900/60">
                      <div>
                        <span className="text-slate-500 block">PRIORIDAD:</span>
                        <select
                          value={b.priority}
                          onChange={(e) => {
                            setBacklogList(backlogList.map(item => item.id === b.id ? { ...item, priority: e.target.value as any } : item));
                          }}
                          className="bg-slate-900 text-slate-200 border border-slate-800 rounded mt-0.5 px-1.5 py-0.5"
                        >
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-500 block">ESFUERZO ESTIMADO:</span>
                        <select
                          value={b.effort}
                          onChange={(e) => {
                            setBacklogList(backlogList.map(item => item.id === b.id ? { ...item, effort: e.target.value as any } : item));
                          }}
                          className="bg-slate-900 text-slate-200 border border-slate-800 rounded mt-0.5 px-1.5 py-0.5"
                        >
                          <option value="Bajo">Bajo</option>
                          <option value="Medio">Medio</option>
                          <option value="Alto">Alto</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-500 block">ESTADO BACKLOG:</span>
                        <select
                          value={b.status}
                          onChange={(e) => {
                            setBacklogList(backlogList.map(item => item.id === b.id ? { ...item, status: e.target.value as any } : item));
                          }}
                          className="bg-slate-900 text-slate-200 border border-slate-800 rounded mt-0.5 px-1.5 py-0.5"
                        >
                          <option value="Propuesta">Propuesta</option>
                          <option value="Priorizada">Priorizada</option>
                          <option value="En desarrollo">En desarrollo</option>
                          <option value="Validada internamente">Validada internamente</option>
                          <option value="Descartada">Descartada</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/60 text-[10px] space-y-1">
                      <div>
                        <strong className="text-slate-400">Impacto Interno Esperado:</strong> {b.expectedImpact}
                      </div>
                      <div className="text-emerald-400 font-mono">
                        <strong>Guardrail de Software:</strong> {b.associatedGuardrail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION I: RESPONSIBLE CLAIMS REVIEW */}
          {activeSection === "claims" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>I. Responsible Claims Review</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Control ético comercial: Transforme afirmaciones absolutas prohibidas en declaraciones realistas complementarias.</p>
              </div>

              {/* Claims mapping list */}
              <div className="space-y-3 text-xs font-mono">
                {claimsReview.map((c, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GUARDRAIL COMERCIAL #{idx + 1}</span>
                      <button
                        onClick={() => {
                          setClaimsReview(claimsReview.map(item => item.id === c.id ? { ...item, verified: !item.verified } : item));
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border transition-all flex items-center gap-1 ${
                          c.verified
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            : "bg-amber-500/15 border-amber-500/25 text-amber-400"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{c.verified ? "Cumplido" : "Omitido"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                      <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider block mb-1">DECLARACIÓN PROHIBIDA / CLAIM ABSOLUTO:</span>
                        <p className="line-through text-slate-400">{c.originalClaim}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block mb-1">DECLARACIÓN RESPONSABLE SUSTITUTA:</span>
                        <p className="font-bold">{c.alternativeClaim}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION J: NEXT ITERATION PLAN */}
          {activeSection === "plan" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>J. Next Iteration Plan</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Definición de las próximas prioridades del Learning Loop.</p>
                </div>
                <button
                  onClick={handleAddIterationPlan}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Plan</span>
                </button>
              </div>

              {/* Plans List */}
              <div className="space-y-3 font-mono text-xs">
                {iterationPlan.map((p, idx) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500">#{idx + 1} PLAN</span>
                      <select
                        value={p.status}
                        onChange={(e) => {
                          setIterationPlan(iterationPlan.map(item => item.id === p.id ? { ...item, status: e.target.value as any } : item));
                        }}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] focus:outline-none"
                      >
                        <option value="Planificado">Planificado</option>
                        <option value="En curso">En curso</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </div>

                    <h4 className="text-xs font-bold text-white">{p.priorityImprovement}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300 leading-normal">
                      <div>
                        <strong className="text-slate-500 block text-[9px]">MÓDULO AFECTADO:</strong>
                        <span>{p.affectedModule}</span>
                      </div>
                      <div>
                        <strong className="text-slate-500 block text-[9px]">RAZÓN DE PRODUCTO:</strong>
                        <span>{p.reason}</span>
                      </div>
                      <div>
                        <strong className="text-slate-500 block text-[9px]">RIESGO DE OMISIÓN:</strong>
                        <span>{p.riskIfIgnored}</span>
                      </div>
                      <div>
                        <strong className="text-emerald-400 block text-[9px]">GUARDRAIL MANTENIDO:</strong>
                        <span>{p.guardrailToMaintain}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/65 p-2.5 rounded-lg border border-slate-850/60 text-[11px]">
                      <span className="text-emerald-400 font-bold block uppercase text-[9px] mb-0.5">Siguiente Acción Técnica Directa:</span>
                      <span>{p.nextAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION K: OUTCOME SUMMARY REPORT */}
          {activeSection === "report" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>K. Secure Outcome Summary Report</span>
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Reporte unificado sanitizado copiable libre de PII y claims comerciales absolutos.</p>
                </div>
                
                <button
                  onClick={handleCopyToClipboard}
                  disabled={isBlockedByScanner}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1 ${
                    isBlockedByScanner
                      ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md"
                  }`}
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? "Copiado!" : "Copiar Reporte"}</span>
                </button>
              </div>

              {/* Disclaimer reminder */}
              <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono leading-relaxed">
                <strong>Nota Excluyente de Responsabilidad:</strong> Este reporte resume aprendizajes internos de demo controlada, piloto acotado o simulación sintética. No representa aprobación contractual, validación legal, despliegue productivo ni resultado garantizado.
              </p>

              {/* Text report area */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-[320px] overflow-y-auto font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-normal">
                {reportContent}
              </div>
            </div>
          )}

          {/* SECTION L: LOCAL LEARNING HISTORY */}
          {activeSection === "history" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>L. Local Learning History (Purgeable)</span>
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Almacenamiento local del navegador para revisar revisiones históricas.</p>
                </div>

                <button
                  onClick={handlePurgeHistory}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Historial</span>
                </button>
              </div>

              {/* History Table */}
              {historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/45">
                  No hay registros de revisiones en el historial local. Complete el Intake y guarde uno nuevo.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/40">
                  <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-500 border-b border-slate-850 text-[10px] font-bold uppercase">
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Alias Piloto</th>
                        <th className="p-3">Fuente</th>
                        <th className="p-3">Línea</th>
                        <th className="p-3 text-center">Hallazgos</th>
                        <th className="p-3 text-center">Mejoras</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {historyList.map(h => (
                        <tr key={h.id} className="hover:bg-slate-900/40">
                          <td className="p-3 text-slate-400 whitespace-nowrap">{h.date}</td>
                          <td className="p-3 font-bold text-white">{h.siteAlias}</td>
                          <td className="p-3 text-slate-300">{h.source}</td>
                          <td className="p-3 text-emerald-400 uppercase font-black">{h.pilotType}</td>
                          <td className="p-3 text-center">{h.findingsCount}</td>
                          <td className="p-3 text-center">{h.backlogCount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                              {h.status.replace(" ", "_")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 5. INTERACTIVE INTERNAL QA CHECKLIST (Requirement 20) */}
      <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              BLOQUE 15 — ESTADO DE ACEPTACIÓN FINAL (POST-15B ACCEPTED)
            </h4>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded">
            PILOT OUTCOME LEARNING LOOP READY
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 text-[11px] font-mono">
          {[
            { label: "Pilot Outcome Review Center", status: "Locked" },
            { label: "Learning Loop QA Lock", status: "Accepted" },
            { label: "Sanitized Outcome Intake", status: "Active" },
            { label: "Observations & Findings", status: "Active" },
            { label: "Stakeholder Feedback Sanitized", status: "Active" },
            { label: "Incident Learning Review", status: "Active" },
            { label: "Technical Learning Review", status: "Active" },
            { label: "UX & Operator Learning", status: "Active" },
            { label: "Product Improvement Backlog", status: "Active" },
            { label: "Responsible Claims Review", status: "Active" },
            { label: "Next Iteration Plan", status: "Active" },
            { label: "Outcome Scanner", status: "Active" },
            { label: "Outcome Summary Report", status: "Sanitized" },
            { label: "Local Learning History", status: "Sanitized and Purgeable" },
            { label: "RBAC Controls", status: "Active" },
            { label: "Home Premium", status: "Preserved" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-300 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-900/50">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">{item.label}:</span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px] uppercase">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
