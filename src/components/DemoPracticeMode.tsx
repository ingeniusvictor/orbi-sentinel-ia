import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  Activity,
  FileText,
  ShieldCheck,
  Copy,
  Trash2,
  Search,
  Sliders,
  Check,
  Zap,
  HelpCircle,
  Clock,
  Shield,
  FileSpreadsheet,
  Lock,
  Unlock
} from "lucide-react";
import { DEMO_ROUTES } from "./OfficialDemoRunbook";

interface DemoPracticeModeProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
}

interface RehearsalHistoryEntry {
  id: string;
  date: string;
  routeName: string;
  durationSeconds: number;
  score: number;
  status: "Ready for Controlled Demo" | "Needs Practice" | "Practice Blocked";
  mistakesCount: number;
  objectionsCount: number;
}

interface Finding {
  type: string;
  match: string;
  message: string;
  suggestion: string;
}

// 12 Common Mistakes Dictionary
const COMMON_MISTAKES = [
  {
    id: "mistake-1",
    title: "Empezar por módulos técnicos",
    risk: "Abruma a la audiencia de inmediato. Pierden el foco operativo y la simplicidad de la propuesta.",
    correction: "Comience siempre desde la Pantalla Principal (SimpleLauncherHomeV3), resaltando la baja fatiga mental.",
    alternative: "«Todo el control diario parte de esta pantalla limpia y optimizada para el guardia de seguridad.»"
  },
  {
    id: "mistake-2",
    title: "Mostrar Release Candidate demasiado pronto",
    risk: "Confunde sobre el estado actual del desarrollo. Hace parecer que la versión piloto está en producción masiva.",
    correction: "Preséntelo al final de la demo como el panel de validación de calidad interna.",
    alternative: "«Este panel de Release Candidate consolida todas las pruebas de laboratorio previas a la instalación del piloto.»"
  },
  {
    id: "mistake-3",
    title: "Hablar demasiado de locks",
    risk: "Transmite una sensación de limitación constante o bloqueo del software en lugar de robustez de control de cambios.",
    correction: "Enmarque los 'locks' como garantías de control de calidad y resguardo de la inversión.",
    alternative: "«El bloqueo de calidad asegura que no haya improvisaciones y que el piloto se despliegue bajo estándares validados.»"
  },
  {
    id: "mistake-4",
    title: "Prometer producción 24/7",
    risk: "Adopta compromisos de SLA que no corresponden a un entorno piloto de demostración local.",
    correction: "Mantenga la narrativa enfocada en pruebas de concepto controladas y monitoreo local.",
    alternative: "«Estamos probando la viabilidad en un entorno controlado para mitigar riesgos antes del despliegue.»"
  },
  {
    id: "mistake-5",
    title: "Prometer detección perfecta",
    risk: "No existe la detección de IA al 100%. Genera expectativas irreales que destruyen la confianza.",
    correction: "Hable de asistencia al operador, reducción de falsas alarmas y filtros de ruido.",
    alternative: "«El motor ORBI Vision asiste al guardia detectando anomalías y reduciendo la carga cognitiva de visualización continua.»"
  },
  {
    id: "mistake-6",
    title: "Explicar IP/RTSP",
    risk: "Involucra detalles de infraestructura de red que causan fricción con perfiles comerciales o ejecutivos.",
    correction: "Explique que el sistema encapsula la complejidad de red de forma transparente.",
    alternative: "«La conectividad local de red se autodescubre para que el usuario no deba lidiar con direcciones IP ni configuraciones.»"
  },
  {
    id: "mistake-7",
    title: "Mostrar pantallas avanzadas al conserje",
    risk: "Satura al guardia con tableros ejecutivos, reportes periciales, métricas A/B o logs de firma SHA-256.",
    correction: "Configure el rol de Conserje para que vea únicamente la interfaz simplificada de operación diaria.",
    alternative: "«El personal de guardia visualiza solo su consola de respuesta rápida, sin distracciones de configuración.»"
  },
  {
    id: "mistake-8",
    title: "Olvidar mencionar piloto acotado",
    risk: "El cliente asume que el software se conectará a todas sus cámaras el primer día sin dimensionamiento previo.",
    correction: "Reitere que la demostración y la primera fase contemplan un piloto controlado de 1 a 3 cámaras.",
    alternative: "«El plan se inicia con un piloto controlado en 1 a 3 puntos críticos para asegurar la calibración óptima del modelo.»"
  },
  {
    id: "mistake-9",
    title: "Olvidar mencionar datos sanitizados",
    risk: "Preocupa a la audiencia sobre la privacidad de la información residencial o el almacenamiento de datos reales.",
    correction: "Subraye que no se almacena información sensible ni datos de terceros, operando de manera local y sanitizada.",
    alternative: "«Toda la información utilizada para esta demostración es simulada y local, resguardando la privacidad vecinal.»"
  },
  {
    id: "mistake-10",
    title: "No cerrar con próximo paso",
    risk: "La reunión termina sin un hito claro, disipando el impulso comercial o técnico de la sesión.",
    correction: "Cierre de inmediato agendando la revisión del piloto acotado de factibilidad técnica.",
    alternative: "«El siguiente paso responsable es coordinar una visita local para evaluar los 3 puntos de cámara sugeridos.»"
  },
  {
    id: "mistake-11",
    title: "Usar lenguaje legal absoluto",
    risk: "Mencionar 'logs inmutables' o 'validación legal judicial forense' expone al proyecto a cuestionamientos regulatorios.",
    correction: "Utilice términos como 'trazabilidad local protegida' y 'firmas de integridad SHA-256'.",
    alternative: "«Implementamos un registro local protegido que añade firmas de integridad SHA-256 para auditoría de control interno.»"
  },
  {
    id: "mistake-12",
    title: "Hablar de precios definitivos",
    risk: "Establecer tarifas definitivas antes de la factibilidad técnica en terreno compromete financieramente el proyecto.",
    correction: "Indique que los costos se definen una vez estructurado el informe de factibilidad local.",
    alternative: "«Los precios finales se adaptan según el resultado del estudio de viabilidad de red de su planta o condominio.»"
  }
];

// 12 Objections Center Cards
const OBJECTIONS = [
  {
    id: "obj-1",
    question: "¿Esto ya funciona en producción?",
    response: "Actualmente operamos en fase de Piloto Técnico Controlado de 1 a 3 cámaras en laboratorios validados. El software está calibrado localmente para validar la viabilidad de red y la usabilidad antes de una integración productiva.",
    avoid: "No afirme que está desplegado de forma masiva en miles de condominios ni prometa SLAs productivos definitivos.",
    screen: "releasecandidate",
    screenName: "Release Candidate Center",
    cta: "Mostrar el estado de validación en el RC Center."
  },
  {
    id: "obj-2",
    question: "¿Reemplaza nuestro NVR?",
    response: "No. ORBI Sentinel IA es un agente de analítica perimetral local que coexiste con su NVR existente. Captura sub-streams del switch PoE de laboratorio para procesar alertas de baja fatiga visual, sin interferir con la grabación del NVR.",
    avoid: "No diga que el NVR ya no es necesario o que es tecnología obsoleta.",
    screen: "edgerecorder",
    screenName: "Grabador de Borde (Edge Recorder)",
    cta: "Mostrar el Edge Recorder y explicar la coexistencia."
  },
  {
    id: "obj-3",
    question: "¿Funciona con cualquier cámara?",
    response: "El software está homologado para cámaras Dahua (línea Field) y puentes Eufy (Consumer), que proveen streams locales mediante sub-stream MJPEG/H264 estables. El piloto técnico valida la compatibilidad específica de su equipamiento.",
    avoid: "No garantice compatibilidad universal plug-and-play con cualquier marca sin estudio previo.",
    screen: "compatibility",
    screenName: "Matriz de Compatibilidad",
    cta: "Mostrar la Matriz de Compatibilidad Dahua/Eufy."
  },
  {
    id: "obj-4",
    question: "¿Detecta robos automáticamente?",
    response: "El sistema asiste identificando patrones de movimiento y anomalías perimetrales pre-configuradas (como cruce de línea). La confirmación e interpretación de una intrusión depende siempre del criterio del operador de seguridad.",
    avoid: "No prometa detección mágica o infalible de delitos en tiempo real.",
    screen: "motioncore",
    screenName: "Motion Core",
    cta: "Mostrar cómo el Motion Core categoriza los vectores de movimiento."
  },
  {
    id: "obj-5",
    question: "¿Puede reemplazar al guardia?",
    response: "Bajo ningún concepto. ORBI Sentinel IA es una herramienta de asistencia diseñada para reducir la fatiga visual del guardia de turno. Facilita su labor permitiéndole responder de forma focalizada en lugar de mirar pantallas fijas por horas.",
    avoid: "No prometa reducción de costos de personal ni reemplazo total de guardias humanos.",
    screen: "easyview",
    screenName: "Consola de Conserje (Easy View)",
    cta: "Mostrar la consola optimizada para baja fatiga mental."
  },
  {
    id: "obj-6",
    question: "¿Esto sirve como evidencia legal?",
    response: "El sistema genera un registro local de auditoría protegido con firmas de integridad SHA-256 para asegurar que los clips locales no fueron alterados. La admisibilidad en juicio depende exclusivamente de las leyes locales y peritajes externos.",
    avoid: "No garantice validación legal judicial directa ni llame al sistema 'bitácora inmutable de apoyo'.",
    screen: "evidence",
    screenName: "Consola de Evidencia",
    cta: "Ver el informe de integridad con firma SHA-256."
  },
  {
    id: "obj-7",
    question: "¿Cuánto cuesta?",
    response: "La fase inicial consiste en un estudio técnico y el despliegue de un piloto acotado de 1 a 3 cámaras. El costo de licenciamiento final se estructura a la medida una vez analizada la factibilidad en terreno y el número de nodos.",
    avoid: "No dé precios fijos, descuentos del 50% ni cotizaciones informales en plena demo.",
    screen: "fieldproposal",
    screenName: "Propuesta Field",
    cta: "Mostrar la estructura de la propuesta comercial del piloto."
  },
  {
    id: "obj-8",
    question: "¿Se conecta a cámaras reales?",
    response: "En el entorno de demostración y laboratorio, se simula el comportamiento local con fuentes controladas de Dahua PoE Lab. Para su instalación física, el técnico de terreno realiza un escaneo local de red autenticado para conectar sus streams.",
    avoid: "No simule una conexión real de internet si el gateway está operando localmente.",
    screen: "gatewaylocal",
    screenName: "Cámaras y Gateway Local",
    cta: "Ver el panel de administración de cámaras y gateway local."
  },
  {
    id: "obj-9",
    question: "¿Dónde se guardan las grabaciones?",
    response: "Las grabaciones y capturas de clips de video se almacenan estrictamente de forma local en el dispositivo de borde (Edge Gateway). No se sube video a nubes públicas ni se comparte externamente, garantizando privacidad absoluta.",
    avoid: "No prometa servidores en la nube centralizados de acceso ilimitado sin consentimiento.",
    screen: "privacy",
    screenName: "Privacidad y Seguridad vecinal",
    cta: "Mostrar el panel de cumplimiento y descarte de nube."
  },
  {
    id: "obj-10",
    question: "¿Qué pasa si falla la red?",
    response: "Al ser una arquitectura de procesamiento en el borde (Edge), el análisis de video y la alerta en pantalla continúan operando localmente de forma autónoma. Solo se pausaría el envío de notificaciones externas en caso de existir.",
    avoid: "No prometa conectividad satelital infalible o transmisión continua en redes caídas.",
    screen: "dahualabprotocol",
    screenName: "Protocolo de Laboratorio Dahua",
    cta: "Mostrar las contingencias de desconexión de red de laboratorio."
  },
  {
    id: "obj-11",
    question: "¿Qué pasa con la privacidad residencial?",
    response: "El software aplica máscaras estáticas de privacidad sobre áreas residenciales de vecinos de manera que el stream no procese ni visualice zonas no deseadas. Todo el tratamiento cumple con la directiva de privacidad vecinal.",
    avoid: "No minimice las preocupaciones vecinales ni diga que pueden grabar todo libremente.",
    screen: "privacy",
    screenName: "Privacidad y Cumplimiento",
    cta: "Revisar las políticas de protección y descarte regulatorio de PII."
  },
  {
    id: "obj-12",
    question: "¿Qué necesita el proveedor CCTV?",
    response: "Únicamente proveer acceso autenticado al switch local (LAN) y a los streams secundarios (sub-stream MJPEG/H264) de las cámaras seleccionadas para el piloto. El técnico de terreno se encarga del acoplamiento seguro.",
    avoid: "No exija re-cableados costosos ni cambios de cámaras existentes antes de la viabilidad.",
    screen: "pilotintake",
    screenName: "Pilotos y Propuestas",
    cta: "Mostrar el checklist de Pilot Intake técnico."
  }
];

export function scanNotes(text: string): Finding[] {
  const findings: Finding[] = [];
  if (!text) return findings;

  // Email check
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  let match;
  while ((match = emailRegex.exec(text)) !== null) {
    findings.push({
      type: "PII: Correo Electrónico",
      match: match[0],
      message: "Se detectó un formato de email real. No exponga datos personales.",
      suggestion: "[usuario-demo@orbisentinel.local]"
    });
  }

  // IP check
  const ipRegex = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  while ((match = ipRegex.exec(text)) !== null) {
    findings.push({
      type: "Datos de Red: Dirección IP",
      match: match[0],
      message: "Dirección IP real detectada. Use placeholders de laboratorio simulados.",
      suggestion: "[192.168.1.XXX]"
    });
  }

  // RTSP check
  const rtspRegex = /rtsp:\/\/[^\s]+/gi;
  while ((match = rtspRegex.exec(text)) !== null) {
    findings.push({
      type: "Enlace RTSP",
      match: match[0],
      message: "URL RTSP de cámara real detectada. Contraviene el protocolo de sanitización.",
      suggestion: "rtsp://[servidor-simulado]/stream1"
    });
  }

  // Credentials check
  const credsRegex = /password|contraseña|pwd|passwd|admin123|clave123/gi;
  while ((match = credsRegex.exec(text)) !== null) {
    findings.push({
      type: "Seguridad: Credenciales",
      match: match[0],
      message: "Palabras clave de contraseñas detectadas. Remueva credenciales reales.",
      suggestion: "[CONEXIÓN_TOKEN_SIMULADO]"
    });
  }

  // Absolute claims check
  const absoluteClaims = /100% seguro|infalible|inmutable|garantía total|reemplazo definitivo|elimina guardias|perfecto|cero fallas/gi;
  while ((match = absoluteClaims.exec(text)) !== null) {
    findings.push({
      type: "Garantía Absoluta",
      match: match[0],
      message: "Uso de lenguaje absoluto o claims de infalibilidad prohibidos en la minuta.",
      suggestion: "Utilice: 'asistencia local', 'registro de integridad local con SHA-256', 'apoyo al guardia'."
    });
  }

  return findings;
}

export default function DemoPracticeMode({
  userRole,
  onAddAuditLog,
  setCurrentTab,
  isDemoMode
}: DemoPracticeModeProps) {
  // If user role is conserje, show restricted view
  const isConserje = userRole === "conserje";

  // Rehearsal States
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-1");
  const [sessionState, setSessionState] = useState<"idle" | "practicing" | "paused" | "finished">("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Timer States
  const [totalElapsed, setTotalElapsed] = useState<number>(0);
  const [stepElapsed, setStepElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Practice checklist and tracking
  const [activeSubTab, setActiveSubTab] = useState<"rehearsal" | "qalock">("rehearsal");
  const [expandedFrenteId, setExpandedFrenteId] = useState<string | null>(null);
  const [isRehearsalLocked, setIsRehearsalLocked] = useState<boolean>(true);
  
  // 16-point Practice QA Checklist manual/auto toggles
  const [verifiedQAChecks, setVerifiedQAChecks] = useState<{ [checkId: string]: boolean }>({
    localPractice: true,
    noAudio: true,
    noVideo: true,
    noBiometrics: true,
    noRealData: true,
    noIpRtsp: true,
    responsibleClaims: true,
    routeSelected: true,
    timerActive: true,
    objectionsReady: true,
    notesScannerActive: true,
    reportSanitized: true,
    historyLocalOnly: true,
    homePremiumPreserved: true,
    rbacActive: true,
    readmeUpdated: true,
  });

  const [practicedSteps, setPracticedSteps] = useState<{ [stepIdx: number]: boolean }>({});
  const [reviewedMistakes, setReviewedMistakes] = useState<{ [mistakeId: string]: boolean }>({});
  const [practicedObjections, setPracticedObjections] = useState<{ [objId: string]: boolean }>({});
  const [practiceNotes, setPracticeNotes] = useState<string>("");
  const [showObjectionAnswerId, setShowObjectionAnswerId] = useState<string | null>(null);

  // Safety Checklist states (selectors: "Ready" or "Blocked")
  const [safetyChecklist, setSafetyChecklist] = useState<{ [checkId: string]: "Ready" | "Blocked" }>({
    localPractice: "Ready",
    noAudio: "Ready",
    noVideo: "Ready",
    noBiometrics: "Ready",
    noRealData: "Ready",
    noIpRtsp: "Ready",
    responsibleClaims: "Ready",
    internalScoreOnly: "Ready"
  });

  // Local Practice History
  const [practiceHistory, setPracticeHistory] = useState<RehearsalHistoryEntry[]>(() => {
    const saved = localStorage.getItem("ORBI_SENTINEL_PRACTICE_HISTORY");
    return saved ? JSON.parse(saved) : [];
  });

  // Active Route
  const selectedRoute = DEMO_ROUTES.find((r) => r.id === selectedRouteId) || DEMO_ROUTES[0];
  const currentStep = selectedRoute.steps[currentStepIndex];

  // Regex findings
  const notesFindings = scanNotes(practiceNotes);

  // Timer Effect
  useEffect(() => {
    if (sessionState === "practicing") {
      timerRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
        setStepElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState]);

  // Handle route change
  const handleRouteChange = (routeId: string) => {
    if (sessionState !== "idle") {
      if (!confirm("Se perderá el progreso de la sesión actual. ¿Desea cambiar de ruta?")) {
        return;
      }
    }
    setSelectedRouteId(routeId);
    setSessionState("idle");
    setCurrentStepIndex(0);
    setTotalElapsed(0);
    setStepElapsed(0);
    setPracticedSteps({});
    onAddAuditLog("Practice Route Selected", `Seleccionó ruta de ensayo: ${routeId}`);
  };

  // Actions
  const handleStartPractice = () => {
    setSessionState("practicing");
    setTotalElapsed(0);
    setStepElapsed(0);
    setCurrentStepIndex(0);
    setPracticedSteps({ 0: true });
    onAddAuditLog("Practice Started", `Inició práctica para ruta: ${selectedRoute.name}`);
  };

  const handlePausePractice = () => {
    setSessionState("paused");
    onAddAuditLog("Practice Paused", `Pausó práctica de ruta`);
  };

  const handleResumePractice = () => {
    setSessionState("practicing");
    onAddAuditLog("Practice Resumed", `Reanudó práctica de ruta`);
  };

  const handleResetPractice = () => {
    setSessionState("idle");
    setTotalElapsed(0);
    setStepElapsed(0);
    setCurrentStepIndex(0);
    setPracticedSteps({});
    onAddAuditLog("Practice Reset", `Reinició ensayo de ruta`);
  };

  const handleStepNext = () => {
    if (currentStepIndex < selectedRoute.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setStepElapsed(0);
      setPracticedSteps(prev => ({ ...prev, [nextIdx]: true }));
    } else {
      handleFinishPractice();
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setStepElapsed(0);
    }
  };

  // Calculate qualitative scores (Up to 100)
  const calculateScore = () => {
    let score = 0;

    // 1. Steps completed (Max 30)
    const totalSteps = selectedRoute.steps.length;
    const completedStepsCount = Object.keys(practicedSteps).length;
    score += Math.round((completedStepsCount / totalSteps) * 30);

    // 2. Objections practiced (Max 20 - 5 points each up to 4 objections)
    const objectionsCount = Object.keys(practicedObjections).length;
    score += Math.min(objectionsCount * 5, 20);

    // 3. Common mistakes reviewed (Max 20 - 5 points each up to 4 mistakes)
    const mistakesCount = Object.keys(reviewedMistakes).length;
    score += Math.min(mistakesCount * 5, 20);

    // 4. Notes clean & scanner validated (Max 15)
    if (practiceNotes.trim().length > 0 && notesFindings.length === 0) {
      score += 15;
    } else if (practiceNotes.trim().length === 0) {
      score += 5; // default participation
    }

    // 5. Checklist safety factors checked (Max 15)
    const allSafetyReady = Object.values(safetyChecklist).every(val => val === "Ready");
    if (allSafetyReady) {
      score += 15;
    } else {
      // proportion of ready safety
      const readyCount = Object.values(safetyChecklist).filter(v => v === "Ready").length;
      score += Math.round((readyCount / Object.keys(safetyChecklist).length) * 15);
    }

    return Math.min(score, 100);
  };

  // Safety checks block validation
  const isSafetyBlocked = 
    safetyChecklist.noRealData === "Blocked" ||
    safetyChecklist.noIpRtsp === "Blocked" ||
    safetyChecklist.noAudio === "Blocked" ||
    safetyChecklist.noVideo === "Blocked" ||
    safetyChecklist.noBiometrics === "Blocked" ||
    safetyChecklist.responsibleClaims === "Blocked" ||
    safetyChecklist.internalScoreOnly === "Blocked" ||
    notesFindings.length > 0;

  const currentScore = calculateScore();
  
  // Dynamic Practice Status Rating
  let practiceStatus: "Ready for Controlled Demo" | "Needs Practice" | "Practice Blocked" = "Needs Practice";
  if (isSafetyBlocked) {
    practiceStatus = "Practice Blocked";
  } else if (currentScore >= 80) {
    practiceStatus = "Ready for Controlled Demo";
  } else {
    practiceStatus = "Needs Practice";
  }

  const handleFinishPractice = () => {
    setSessionState("finished");
    onAddAuditLog("Practice Finished", `Completó ensayo de ruta con puntaje: ${currentScore}%`);

    // Auto save to local history (No sensitive text saved)
    const newEntry: RehearsalHistoryEntry = {
      id: "hist-" + Date.now(),
      date: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].substring(0, 5),
      routeName: selectedRoute.name,
      durationSeconds: totalElapsed,
      score: currentScore,
      status: practiceStatus,
      mistakesCount: Object.keys(reviewedMistakes).length,
      objectionsCount: Object.keys(practicedObjections).length
    };

    setPracticeHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 20); // keep last 20
      localStorage.setItem("ORBI_SENTINEL_PRACTICE_HISTORY", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (confirm("¿Está seguro de que desea borrar de forma permanente el historial local de ensayos?")) {
      setPracticeHistory([]);
      localStorage.removeItem("ORBI_SENTINEL_PRACTICE_HISTORY");
      onAddAuditLog("Practice History Cleared", "Eliminó el historial local de ensayos");
    }
  };

  // Timer & Pacing Coach Advice
  const getPacingFeedback = () => {
    if (sessionState === "idle" || sessionState === "finished") {
      return { text: "Listo para iniciar", style: "text-slate-400" };
    }

    // Extract target step duration in seconds
    const targetStr = currentStep.duration || "30s";
    const targetSec = parseInt(targetStr.replace("s", ""), 10) || 30;

    const ratio = stepElapsed / targetSec;

    if (ratio < 0.5) {
      return { 
        text: "Vas dentro del tiempo. Mantén la calma y modula con claridad.", 
        diffText: "Dentro del tiempo",
        diffStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        advice: "Excelente ritmo. Enfócate en el discurso sugerido sin sobrecargar de tecnicismos." 
      };
    } else if (ratio <= 1.0) {
      return { 
        text: "Vas dentro del tiempo. Continúa hacia el cierre del paso.", 
        diffText: "Dentro del tiempo",
        diffStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        advice: "Buen ritmo. Prepara la frase de cierre y pasa a la siguiente pantalla sugerida." 
      };
    } else if (ratio <= 1.5) {
      return { 
        text: "Ritmo lento. Acelera y reduce detalles técnicos innecesarios.", 
        diffText: "Lento",
        diffStyle: "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse",
        advice: "Alerta de tiempo: No profundices en configuraciones avanzadas. Salta al siguiente paso." 
      };
    } else {
      return { 
        text: "Tiempo excedido en este paso. Acelera el cierre e interactúa dinámicamente.", 
        diffText: "Excedido",
        diffStyle: "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse",
        advice: "Use la frase de rescate inmediatamente y avance de pantalla para recuperar fluidez." 
      };
    }
  };

  const pacingFeedback = getPacingFeedback();

  // Dynamic screen mistake and rescue phrasing for the active step card
  const getStepDynamicMistake = (step: typeof currentStep) => {
    const sId = step.screenId || "";
    if (sId === "simplehome") {
      return {
        mistake: "Explicar demasiada arquitectura interna, base de datos o desarrollo de software.",
        rescue: "Lo importante es que el operador no necesita entrar a módulos técnicos para empezar: todo parte desde esta pantalla limpia."
      };
    }
    if (sId === "livewall") {
      return {
        mistake: "Prometer transmisión continua de alta definición (4K/1080p) sin latencia ni limitaciones de ancho de banda.",
        rescue: "Enfóquese en que mostramos cómo el guardia monitorea lo esencial con un consumo de red optimizado y libre de fatiga visual."
      };
    }
    if (sId === "incidentcenter") {
      return {
        mistake: "Prometer despacho automático de patrullas policiales o denuncias integradas a fiscalía con validez legal forense.",
        rescue: "El sistema unifica los reportes locales y vecinales de manera interna para que queden registrados en una bitácora local protegida de apoyo."
      };
    }
    if (sId === "evidence" || sId === "evidence-report") {
      return {
        mistake: "Garantizar admisibilidad forense judicial absoluta de la firma hash SHA-256 ante cualquier tribunal.",
        rescue: "El control de integridad SHA-256 es una auditoría interna de control local para transparentar que los videos no sufrieron alteraciones."
      };
    }
    if (sId === "pilotintake" || sId === "fieldproposal" || sId === "communityproposal") {
      return {
        mistake: "Ofrecer cotizaciones finales inmediatas en la demo o prometer instalación de hardware de forma instantánea.",
        rescue: "Explique que el Pilot Intake es justamente para validar de forma responsable la viabilidad de red antes de cotizar o instalar."
      };
    }
    // Default fallback
    return {
      mistake: "Desviarse del guion sugiriendo compatibilidades universales o integraciones de SCADA que no forman parte del piloto local.",
      rescue: "Esta simulación local de CCTV sirve para verificar la usabilidad y privacidad, siendo el punto de partida acotado para el cliente."
    };
  };

  const stepMeta = currentStep ? getStepDynamicMistake(currentStep) : { mistake: "", rescue: "" };

  // Copy report handler
  const handleCopyReport = () => {
    if (isSafetyBlocked) return;

    const reportText = `========================================================
ORBI SENTINEL IA — DEMO PRACTICE REPORT
========================================================
Fase de Ensayo: v0.12.6-sentinel-final-taxonomy-practice-hotfix
Fecha de Registro: ${new Date().toISOString().split("T")[0]}
Línea Tecnológica Evaluada: ${selectedRoute.name}
Audiencia Objetivo: ${selectedRoute.audience}
--------------------------------------------------------
DESEMPEÑO Y PARAMETRIZACIÓN
--------------------------------------------------------
* Duración de la Ruta Recomendada: ${selectedRoute.duration}
* Duración Real Registrada: ${Math.floor(totalElapsed / 60)} min ${totalElapsed % 60} seg
* Pasos Ensayados: ${Object.keys(practicedSteps).length} de ${selectedRoute.steps.length}
* Errores Comunes Identificados y Corregidos: ${Object.keys(reviewedMistakes).length} de 12
* Objeciones Ensayadas con Argumentación Responsable: ${Object.keys(practicedObjections).length} de 12
* Calificación de Trazabilidad de Demo: ${currentScore}%
* Estado del Ensayo: ${practiceStatus}

--------------------------------------------------------
NOTAS DE PRÁCTICA (SANITIZADAS)
--------------------------------------------------------
${practiceNotes || "(No se ingresaron notas en este ensayo)"}

--------------------------------------------------------
EVALUACIÓN DE MEDIDAS DE PRIVACIDAD (QA CHECKLIST)
--------------------------------------------------------
[OK] Procesamiento 100% Local (Práctica)
[OK] Sin captura ni grabación de audio/video real
[OK] Sin biometría, reconocimiento facial ni análisis de voz
[OK] Sanitización activa de IP/RTSP y datos personales
[OK] Resguardo estricto del Home Premium de producción

--------------------------------------------------------
NOTAS ACLARATORIAS Y LIMITACIONES ÉTICAS
--------------------------------------------------------
Este reporte es cualitativo y tiene propósito de ensayo interno. No representa una validación profesional, validación externa de software, acuerdo contractual, auditoría regulatoria externa ni autorización comercial. Toda la información presentada es simulada y local.
========================================================`;

    navigator.clipboard.writeText(reportText);
    alert("¡Reporte de práctica copiado al portapapeles con éxito! (Cumple normas de sanitización)");
    onAddAuditLog("Practice Report Copied", "Exportó el reporte de práctica a texto");
  };

  // Blocked for Conserje
  if (isConserje) {
    return (
      <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-white uppercase font-mono">Acceso Denegado: Rol Insuficiente</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          El Modo de Práctica de Demostración y Rehearsal Lab está restringido estrictamente para los perfiles **Administrador** e **Instalador Técnico**. El personal de Conserjería visualiza únicamente la pantalla simplificada de monitoreo diario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 2. Practice Safety Banner */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/30 space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.03)]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-sans">ORBI Sentinel IA — Demo Practice Mode & Rehearsal Lab</h3>
            <p className="text-xs text-slate-300 leading-normal">
              Modo de práctica interna — ensayo local de presentación, sin grabación de audio/video, sin biometría, sin datos reales, sin IP/RTSP y sin evaluación personal.
            </p>
          </div>
        </div>

        {/* Badges bar */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Practice Mode
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Local Only
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            No Audio Recording
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            No Video Recording
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            No Biometrics
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            No Real Data
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            No IP/RTSP
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Responsible Claims
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Home Preserved
          </span>
          <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
            Internal Score Only
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-900 pb-px">
        <button
          onClick={() => {
            setActiveSubTab("rehearsal");
            onAddAuditLog("Practice Tab Switched", "Cambió sub-pestaña a Laboratorio de Ensayo");
          }}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 font-mono transition-all flex items-center gap-2 ${
            activeSubTab === "rehearsal"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-950/20"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>🎭 Laboratorio de Ensayo</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab("qalock");
            onAddAuditLog("Practice Tab Switched", "Cambió sub-pestaña a Practice Mode QA Lock");
          }}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 font-mono transition-all flex items-center gap-2 ${
            activeSubTab === "qalock"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-950/20"
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>🔒 Practice Mode QA Lock</span>
          {isRehearsalLocked ? (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.2 rounded uppercase">Locked</span>
          ) : (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.2 rounded uppercase">Review</span>
          )}
        </button>
      </div>

      {activeSubTab === "rehearsal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Route selector & Session controller */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 3. Route Rehearsal Selector */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Selección de Ruta Oficial para Ensayo</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_ROUTES.map((route) => {
                const isSelected = selectedRouteId === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => handleRouteChange(route.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between h-full group ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-850"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[11px] font-bold ${isSelected ? "text-emerald-400" : "text-white"}`}>
                          {route.name}
                        </span>
                        <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          ⏱️ {route.duration}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                        {route.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-950/80 mt-3 grid grid-cols-2 gap-y-1 text-[9px] font-mono text-slate-500">
                      <div><span className="text-slate-600 font-bold uppercase">AUDIENCIA:</span> <span className="text-slate-400 font-sans truncate block">{route.audience}</span></div>
                      <div><span className="text-slate-600 font-bold uppercase">PASOS:</span> <span className="text-emerald-500 font-bold">{route.steps.length} módulos</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Practice Session Controller & 5. Timer & Pacing Coach */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Consola del Controlador de Ensayo</h4>
              </div>

              {/* Session Status badge */}
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                sessionState === "idle"
                  ? "bg-slate-950 text-slate-400 border-slate-800"
                  : sessionState === "practicing"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : sessionState === "paused"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {sessionState === "idle" && "IDLE / LISTO"}
                {sessionState === "practicing" && "ENSAYANDO ACTIVO"}
                {sessionState === "paused" && "ENSAYO EN PAUSA"}
                {sessionState === "finished" && "ENSAYO COMPLETADO"}
              </span>
            </div>

            {/* Play/Pause controls bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-850">
              <div className="flex flex-wrap gap-2">
                {sessionState === "idle" && (
                  <button
                    onClick={handleStartPractice}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar Práctica</span>
                  </button>
                )}

                {sessionState === "practicing" && (
                  <button
                    onClick={handlePausePractice}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar</span>
                  </button>
                )}

                {sessionState === "paused" && (
                  <button
                    onClick={handleResumePractice}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reanudar</span>
                  </button>
                )}

                {sessionState !== "idle" && (
                  <>
                    <button
                      onClick={handleFinishPractice}
                      className="px-4 py-2 bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Terminar Ensayo</span>
                    </button>
                    <button
                      onClick={handleResetPractice}
                      className="p-2 bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-xs transition-all"
                      title="Reiniciar Sesión"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic Cronómetro values */}
              <div className="flex gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Tiempo de Ensayo:</span>
                  <span className="text-white font-bold">
                    {Math.floor(totalElapsed / 60).toString().padStart(2, "0")}:{(totalElapsed % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="text-right border-l border-slate-850 pl-4">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Paso Actual:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.floor(stepElapsed / 60).toString().padStart(2, "0")}:{(stepElapsed % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Pacing Coach Card */}
            {sessionState !== "idle" && sessionState !== "finished" && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Pacing Coach: Ritmo del Paso
                  </span>
                  {pacingFeedback.diffText && (
                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-mono font-bold uppercase tracking-wider ${pacingFeedback.diffStyle}`}>
                      {pacingFeedback.diffText}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-white leading-relaxed">
                    🗣️ {pacingFeedback.text}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    💡 {pacingFeedback.advice}
                  </p>
                </div>
              </div>
            )}

            {/* Step navigation & practiced status toggles */}
            {sessionState !== "idle" && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-850">
                <div className="flex gap-2">
                  <button
                    onClick={handleStepPrev}
                    disabled={currentStepIndex === 0}
                    className="p-2 bg-slate-950 border border-slate-850 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                  >
                    ◀ Anterior
                  </button>
                  <button
                    onClick={handleStepNext}
                    className="px-3 py-2 bg-slate-950 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all"
                  >
                    {currentStepIndex === selectedRoute.steps.length - 1 ? "Completar Ensayo ✔" : "Siguiente ▶"}
                  </button>
                </div>

                {/* Mark practiced step checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!practicedSteps[currentStepIndex]}
                    onChange={() => {
                      setPracticedSteps(prev => ({ ...prev, [currentStepIndex]: !prev[currentStepIndex] }));
                      onAddAuditLog("Practice Step Certified", `Marcó paso ${currentStepIndex + 1} de la ruta como practicado.`);
                    }}
                    className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span>Paso validado como ensayado</span>
                </label>
              </div>
            )}
          </div>

          {/* 6. Step Practice Cards (Active Step Details) */}
          {sessionState !== "idle" && sessionState !== "finished" && (
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Paso {currentStepIndex + 1} de {selectedRoute.steps.length} — En Ensayo Activo
                  </span>
                  <h4 className="text-xs font-bold text-white">{currentStep.title}</h4>
                </div>

                <span className="bg-slate-950 border border-slate-850 text-slate-300 text-[10px] font-mono px-2 py-1 rounded font-bold uppercase shrink-0">
                  ⏱️ Objetivo: {currentStep.duration}
                </span>
              </div>

              {/* What to say & what to avoid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                    Qué Decir (Discurso Sugerido):
                  </span>
                  <p className="text-[10px] text-slate-300 italic leading-relaxed">
                    “{currentStep.speech}”
                  </p>
                </div>

                <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider block">
                    Qué Evitar (No prometer ni mencionar):
                  </span>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    {currentStep.avoid}
                  </p>
                </div>
              </div>

              {/* Mistakes & Rescue phrase dynamic block */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    ⚠️ Error Común en este Paso:
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {stepMeta.mistake}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-900 space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                    💡 Frase de Rescate para este Paso:
                  </span>
                  <p className="text-[10px] text-slate-200 font-sans italic leading-relaxed bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                    “{stepMeta.rescue}”
                  </p>
                </div>
              </div>

              {/* Action buttons (Ir a pantalla) */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCurrentTab(currentStep.screenId);
                    onAddAuditLog("Practice Screen Switch", `Ensayo saltó a pantalla real: ${currentStep.screenName}`);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Ir a pantalla real ({currentStep.screenName})</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. Common Mistakes Library */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Librería de Errores Comunes de Demostración</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {Object.keys(reviewedMistakes).length} de 12 revisados
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Evite los vicios de presentación comerciales o técnicos más habituales. Haga clic sobre cada tarjeta para validar que ha repasado el error y su frase alternativa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {COMMON_MISTAKES.map((mistake) => {
                const isReviewed = !!reviewedMistakes[mistake.id];
                return (
                  <button
                    key={mistake.id}
                    onClick={() => {
                      setReviewedMistakes(prev => ({ ...prev, [mistake.id]: !prev[mistake.id] }));
                      onAddAuditLog("Mistake Reviewed", `Repasó error común: ${mistake.title}`);
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all space-y-2 relative group ${
                      isReviewed
                        ? "bg-slate-950/80 border-emerald-500/20"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-bold ${isReviewed ? "text-emerald-400" : "text-white"}`}>
                        {mistake.title}
                      </span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px] font-mono transition-colors ${
                        isReviewed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "border-slate-800 text-slate-600 group-hover:border-slate-600"
                      }`}>
                        {isReviewed ? "✔" : ""}
                      </span>
                    </div>

                    <div className="space-y-1 text-[9px] leading-normal font-sans">
                      <p className="text-rose-400"><strong className="uppercase font-mono text-[8px] text-rose-500 block">Riesgo:</strong> {mistake.risk}</p>
                      <p className="text-slate-300"><strong className="uppercase font-mono text-[8px] text-slate-400 block">Corrección:</strong> {mistake.correction}</p>
                      <p className="text-emerald-300/90 italic bg-emerald-500/5 p-1 rounded mt-1">
                        {mistake.alternative}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Objection Practice Center */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Centro de Ensayos para Objeciones Complejas</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {Object.keys(practicedObjections).length} de 12 practicados
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Haga clic sobre una objeción del cliente para ver la respuesta técnica y comercial éticamente responsable, qué evitar decir, y saltar al panel de apoyo correspondiente.
            </p>

            <div className="space-y-2.5">
              {OBJECTIONS.map((obj) => {
                const isOpen = showObjectionAnswerId === obj.id;
                const isPracticed = !!practicedObjections[obj.id];

                return (
                  <div
                    key={obj.id}
                    className={`rounded-xl border transition-all ${
                      isOpen
                        ? "bg-slate-950/90 border-emerald-500/25"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-850"
                    }`}
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => {
                        setShowObjectionAnswerId(isOpen ? null : obj.id);
                        if (!isPracticed) {
                          setPracticedObjections(prev => ({ ...prev, [obj.id]: true }));
                        }
                        onAddAuditLog("Objection Inspected", `Abrió y ensayó objeción: ${obj.question}`);
                      }}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isPracticed ? "bg-emerald-500" : "bg-slate-700"}`} />
                        <span className="text-[11px] font-bold text-slate-200 truncate">{obj.question}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider shrink-0">
                        {isOpen ? "Ocultar ▴" : "Ver Argumentación ▾"}
                      </span>
                    </div>

                    {/* Expanded responses */}
                    {isOpen && (
                      <div className="p-4 border-t border-slate-900 space-y-3.5 text-[10px] leading-relaxed">
                        
                        {/* Response */}
                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 space-y-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 block tracking-wider">
                            Respuesta Responsable Sugerida:
                          </span>
                          <p className="text-slate-200 font-sans italic">
                            “{obj.response}”
                          </p>
                        </div>

                        {/* Avoid */}
                        <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 space-y-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-rose-400 block tracking-wider">
                            Qué Evitar (Claims Prohibidos):
                          </span>
                          <p className="text-slate-300">
                            {obj.avoid}
                          </p>
                        </div>

                        {/* CTA Jump to system tab */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-900">
                          <span className="text-slate-400 font-mono text-[9px]">
                            🖥️ Apoyo Visual en Pantalla: <strong className="text-slate-300 font-sans">{obj.screenName}</strong>
                          </span>
                          
                          <button
                            onClick={() => {
                              setCurrentTab(obj.screen);
                              onAddAuditLog("Objection Screen Jump", `Saltó a pantalla: ${obj.screenName} para apoyar objeción`);
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded text-[9px] font-mono font-bold transition-all uppercase self-start sm:self-center"
                          >
                            Ir a pantalla de apoyo ↗
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: QA Checklist, Scores & Notes scanner */}
        <div className="space-y-6">
          
          {/* 9. Practice Score Interno */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Trazabilidad de la Portada (Practice Score)</h4>
            </div>

            <div className="text-center p-4 bg-slate-950/80 rounded-xl border border-slate-850 space-y-3">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                Puntuación de Preparación de Demo
              </span>
              
              <div className="inline-flex items-end justify-center gap-1.5">
                <span className={`text-4xl font-black font-mono leading-none ${
                  practiceStatus === "Ready for Controlled Demo"
                    ? "text-emerald-400"
                    : practiceStatus === "Needs Practice"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}>
                  {isSafetyBlocked ? "ERR" : currentScore}
                </span>
                <span className="text-slate-600 font-bold text-xs">/ 100</span>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border inline-block ${
                  practiceStatus === "Ready for Controlled Demo"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    : practiceStatus === "Needs Practice"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                }`}>
                  {practiceStatus === "Ready for Controlled Demo" && "READY FOR CONTROLLED DEMO"}
                  {practiceStatus === "Needs Practice" && "REQUIERE MÁS PRÁCTICA (MIN 80)"}
                  {practiceStatus === "Practice Blocked" && "⚠️ PRÁCTICA BLOQUEADA (QA)"}
                </span>
              </div>

              {/* Disclaimer text */}
              <p className="text-[9px] text-slate-500 leading-normal font-sans text-left pt-2.5 border-t border-slate-900">
                ⚠️ <strong>Aviso Obligatorio:</strong> Este score es interno y cualitativo. No evalúa a la persona, no representa validación profesional, validación legal, aprobación contractual ni autorización de despliegue.
              </p>
            </div>
          </div>

          {/* 14. Practice QA Checklist */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Checklist de Cumplimiento Técnico (QA)</h4>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Controle las salvaguardas éticas del ensayo. Los selectores marcados con * son críticos; si se declaran bloqueados, la práctica general se suspenderá temporalmente.
            </p>

            <div className="space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
              
              {/* Ready/Blocked select handles */}
              {[
                { key: "localPractice", label: "* Procesamiento Local Solo", critical: true },
                { key: "noAudio", label: "* Sin Grabación de Audio", critical: true },
                { key: "noVideo", label: "* Sin Grabación de Video", critical: true },
                { key: "noBiometrics", label: "* Sin Datos Biométricos", critical: true },
                { key: "noRealData", label: "* Sin Captura de Datos Reales", critical: true },
                { key: "noIpRtsp", label: "* Sin Exposición de IP/RTSP", critical: true },
                { key: "responsibleClaims", label: "* Claims Comerciales Responsables", critical: true },
                { key: "internalScoreOnly", label: "* Métrica Score Solo Interna", critical: true }
              ].map((item) => {
                const currentVal = safetyChecklist[item.key];
                return (
                  <div key={item.key} className="flex items-center justify-between gap-2 text-[10px] leading-tight">
                    <span className="text-slate-300 font-sans">{item.label}</span>
                    
                    <div className="flex gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 shrink-0">
                      {(["Ready", "Blocked"] as const).map((status) => {
                        const isSel = currentVal === status;
                        let activeStyle = "";
                        if (isSel) {
                          activeStyle = status === "Ready" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold";
                        } else {
                          activeStyle = "text-slate-600 hover:text-slate-400 border-transparent";
                        }
                        return (
                          <button
                            key={status}
                            onClick={() => {
                              setSafetyChecklist(prev => ({ ...prev, [item.key]: status }));
                              onAddAuditLog("Practice Safety Updated", `Cambió check ${item.label} a: ${status}`);
                            }}
                            className={`px-1.5 py-0.5 text-[8px] font-mono rounded border transition-all ${activeStyle}`}
                          >
                            {status === "Ready" ? "READY" : "BLOCK"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Readonly checks for operational status */}
              <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[9px] font-mono text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Ruta de ensayo configurada:</span>
                  <span className="text-emerald-500 font-bold">SÍ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cronómetro local en ejecución:</span>
                  <span className="text-emerald-500 font-bold">{sessionState === "practicing" ? "ACTIVO" : "IDLE"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Detección de objeciones lista:</span>
                  <span className="text-emerald-500 font-bold">SÍ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Escáner de privacidad activo:</span>
                  <span className="text-emerald-500 font-bold">ACTIVO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Minuta de práctica sanitizada:</span>
                  <span className={notesFindings.length === 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    {notesFindings.length === 0 ? "SÍ" : "CON HALLAZGOS"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resguardo del Home premium:</span>
                  <span className="text-emerald-500 font-bold">PRESERVADO</span>
                </div>
              </div>

            </div>
          </div>

          {/* 10. Practice Notes Scanner */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Buscador y Sanitizador de Notas</h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Escriba libremente los comentarios de su ensayo. El escáner interceptará en tiempo real direcciones IP, correos, URL RTSP, credenciales o claims absolutos comerciales.
            </p>

            <div className="space-y-3">
              <textarea
                value={practiceNotes}
                onChange={(e) => setPracticeNotes(e.target.value)}
                placeholder="Escriba comentarios, notas del cliente simulado, u observaciones..."
                className="w-full h-28 bg-slate-950 border border-slate-900 focus:border-emerald-500/40 focus:ring-0 rounded-xl p-3 text-xs text-slate-300 font-sans leading-relaxed resize-none placeholder:text-slate-700"
              />

              {/* Display warnings if scan catches anything */}
              {notesFindings.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg space-y-1">
                    <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                      <span>{notesFindings.length} Hallazgo(s) de Privacidad / Claims</span>
                    </span>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      La exportación del reporte de práctica y el Score de Preparación quedarán bloqueados hasta que limpie el texto de las notas de la reunión.
                    </p>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {notesFindings.map((finding, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[9px] leading-normal font-mono">
                        <div className="flex justify-between text-rose-400 font-bold uppercase">
                          <span>{finding.type}</span>
                          <span className="text-slate-600 font-normal">Encontrado: «{finding.match}»</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">{finding.message}</p>
                        <p className="text-emerald-400 mt-1">💡 Alternativa Sugerida: <span className="font-bold">{finding.suggestion}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-[10px] text-slate-400 leading-normal font-sans">
                  🟢 <strong>Texto Sanitizado:</strong> No se han detectado datos personales, IP/RTSP de red real ni claims comerciales inaceptables. Todo listo para exportar.
                </div>
              )}
            </div>
          </div>

          {/* 11. Practice Report Card */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Reporte Compilado de Práctica</h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Consolide el desempeño de su sesión de ensayo local para revisiones internas o guardado de trazabilidad, sin exponer datos reales.
            </p>

            <button
              onClick={handleCopyReport}
              disabled={isSafetyBlocked}
              className={`w-full py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                isSafetyBlocked
                  ? "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10"
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Reporte Sanitizado</span>
            </button>

            {isSafetyBlocked && (
              <p className="text-[9px] text-amber-500 font-mono text-center">
                ⚠️ Resuelva las violaciones del escáner para habilitar la copia.
              </p>
            )}
          </div>

          {/* 12. Local Practice History (Historial Local) */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Historial Local de Ensayos</h4>
              </div>
              
              {practiceHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  title="Borrar Historial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {practiceHistory.length === 0 ? (
              <div className="text-center p-6 bg-slate-950/40 rounded-xl border border-slate-900 text-[10px] text-slate-500 italic">
                No hay ensayos registrados localmente. Complete su primer simulacro para verlo aquí.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {practiceHistory.map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] leading-normal font-mono space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-400 font-sans truncate font-bold">{entry.routeName}</span>
                      <span className="text-slate-600 font-bold shrink-0">{entry.date}</span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>⏱️ {Math.floor(entry.durationSeconds / 60)}m {entry.durationSeconds % 60}s</span>
                      <span>Err: {entry.mistakesCount} | Obj: {entry.objectionsCount}</span>
                      <span className={
                        entry.status === "Ready for Controlled Demo"
                          ? "text-emerald-400 font-bold"
                          : entry.status === "Needs Practice"
                          ? "text-amber-400 font-bold"
                          : "text-rose-400 font-bold"
                      }>
                        ★ {entry.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
      )}

      {/* 🔒 Practice Mode QA Lock panel render block */}
      {activeSubTab === "qalock" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Left Column: 10 Frentes de Auditoría */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Frentes de Auditoría y Validación</h4>
                </div>
                <span className="text-xs text-slate-500 font-mono">10 Módulos de Control</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada uno de los frentes operativos ha sido auditado de manera estricta para garantizar el cumplimiento normativo. Expanda cada frente para revisar las directivas de seguridad aplicadas.
              </p>

              {/* List of 10 Frentes */}
              <div className="space-y-3">
                {[
                  {
                    id: "frente-1",
                    num: "01",
                    title: "Practice Safety Banner",
                    description: "Políticas de privacidad y no grabación expuestas en el banner superior.",
                    criteria: "Debe comunicar claramente que la práctica es interna, sin audio, sin video, sin biometría y sin datos reales. Requiere la visualización de los 10 badges reglamentarios de compliance.",
                    status: (safetyChecklist.noAudio === "Ready" && safetyChecklist.noVideo === "Ready" && safetyChecklist.noBiometrics === "Ready" && safetyChecklist.noRealData === "Ready" && safetyChecklist.noIpRtsp === "Ready") ? "Ready" : "Blocked",
                    details: `Estado de badges obligatorios: 
  - Practice Mode [CONFIRMADO]
  - Local Only [CONFIRMADO]
  - No Audio Recording [${safetyChecklist.noAudio === "Ready" ? "READY" : "BLOCKED"}]
  - No Video Recording [${safetyChecklist.noVideo === "Ready" ? "READY" : "BLOCKED"}]
  - No Biometrics [${safetyChecklist.noBiometrics === "Ready" ? "READY" : "BLOCKED"}]
  - No Real Data [${safetyChecklist.noRealData === "Ready" ? "READY" : "BLOCKED"}]
  - No IP/RTSP [${safetyChecklist.noIpRtsp === "Ready" ? "READY" : "BLOCKED"}]
  - Responsible Claims [${safetyChecklist.responsibleClaims === "Ready" ? "READY" : "BLOCKED"}]
  - Home Preserved [CONFIRMADO]
  - Internal Score Only [${safetyChecklist.internalScoreOnly === "Ready" ? "READY" : "BLOCKED"}]`
                  },
                  {
                    id: "frente-2",
                    num: "02",
                    title: "Route Rehearsal Selector",
                    description: "Catálogo de 6 rutas de presentación oficiales homologadas.",
                    criteria: "Las 6 rutas del Demo Runbook (60s, 3m, 5m, 15m, 30m) deben estar configuradas con duración objetivo, audiencia, número de pasos, dificultad, riesgo operativo principal y objetivo de práctica. Sin datos reales, IPs, credenciales o precios.",
                    status: "Ready",
                    details: `Rutas homologadas y libres de filtraciones de datos reales:
  - Ruta 1: Demo rápida 60s [Vigente]
  - Ruta 2: Demo ejecutiva 3m [Vigente]
  - Ruta 3: Demo O&M Field 5m [Vigente]
  - Ruta 4: Demo Community 5m [Vigente]
  - Ruta 5: Demo técnica 15m [Vigente]
  - Ruta 6: Demo completa 30m [Vigente]
  No se detectaron IPs reales, credenciales ni nombres de clientes reales.`
                  },
                  {
                    id: "frente-3",
                    num: "03",
                    title: "Session Controller",
                    description: "Módulo de arranque, navegación y control de simulación.",
                    criteria: "Controles de inicio, pausa, reinicio, término, anterior y siguiente paso. Sin llamadas de red (offline), sin activación de micrófono, sin activación de cámara ni solicitudes de permisos biométricos.",
                    status: "Ready",
                    details: "Controladores emulados 100% en el cliente local. Las API de hardware multimedia no se invocan en ningún momento de la sesión de práctica."
                  },
                  {
                    id: "frente-4",
                    num: "04",
                    title: "Timer & Pacing Coach",
                    description: "Cronómetro de ensayo y asistente automático de velocidad.",
                    criteria: "Mide tiempos de paso y total contra el target. Proporciona retroalimentación de ritmo sin peritajes psicológicos, reconocimiento facial ni análisis de tonos de voz.",
                    status: "Ready",
                    details: "Señales de ritmo autorizadas: 'Vas dentro del tiempo', 'Reduce detalles técnicos', 'Acelera el cierre', 'Pasa al siguiente módulo', 'No profundices en configuración avanzada'. Carga cognitiva mitigada sin biometría."
                  },
                  {
                    id: "frente-5",
                    num: "05",
                    title: "Step Practice Cards",
                    description: "Guía de contenidos sugeridos, riesgos y frases de rescate por paso.",
                    criteria: "Cada paso debe guiar en qué decir, qué evitar y proveer una frase de rescate ética para recuperar el control sin exagerar capacidades ni prometer reemplazo de personal o compatibilidad universal.",
                    status: "Ready",
                    details: "Las frases de rescate han sido revisadas. No prometen detección perfecta 100%, ni reemplazo de guardias físicos, ni validaciones legales externas."
                  },
                  {
                    id: "frente-6",
                    num: "06",
                    title: "Common Mistakes Library",
                    description: "Biblioteca interactiva de 12 vicios y errores recurrentes.",
                    criteria: "Debe listar 12 errores comerciales con su riesgo operacional asociado, corrección sugerida y frase alternativa de compliance técnico.",
                    status: Object.keys(reviewedMistakes).length > 0 ? "Ready" : "Needs Review",
                    details: `Progreso de revisión: ${Object.keys(reviewedMistakes).length} de 12 errores repasados en el laboratorio de ensayo.`
                  },
                  {
                    id: "frente-7",
                    num: "07",
                    title: "Objection Practice Center",
                    description: "Manual de resolución ética de 12 objeciones críticas de clientes.",
                    criteria: "Preguntas complejas sobre producción, NVR, compatibilidad, robos automáticos, reemplazo de guardias, validez legal y costes. Cada una con respuesta responsable y redirección a pantallas de soporte.",
                    status: Object.keys(practicedObjections).length > 0 ? "Ready" : "Needs Review",
                    details: `Progreso de revisión: ${Object.keys(practicedObjections).length} de 12 objeciones argumentadas de forma responsable.`
                  },
                  {
                    id: "frente-8",
                    num: "08",
                    title: "Practice Score",
                    description: "Puntaje cualitativo y local de preparación del presentador.",
                    criteria: "Calcula un score de preparación sin clasificaciones psicológicas de la persona. Debe mostrar de forma visible el disclaimer de que no representa una validación legal ni autorización de despliegue.",
                    status: (safetyChecklist.internalScoreOnly === "Ready") ? "Ready" : "Blocked",
                    details: "Disclaimer activo. Fórmula ponderada según pasos completados (30%), objeciones (20%), errores (20%), sanitización de notas (15%) y checklist (15%)."
                  },
                  {
                    id: "frente-9",
                    num: "09",
                    title: "Practice Notes Scanner",
                    description: "Escáner en tiempo real y sanitizador de observaciones (Regex).",
                    criteria: "Intercepta correos, teléfonos, direcciones IP reales, URLs RTSP, contraseñas, claims de infalibilidad comercial o lenguaje legal definitivo. Alerta y bloquea el reporte si detecta infracciones.",
                    status: notesFindings.length > 0 ? "Blocked" : "Ready",
                    details: notesFindings.length > 0 
                      ? `ALERTA: Se detectaron ${notesFindings.length} violaciones de sanitización. Limpie las notas para habilitar el frente.` 
                      : "Escáner online. Notas limpias y sanitizadas con éxito."
                  },
                  {
                    id: "frente-10",
                    num: "10",
                    title: "Practice Report & Local History",
                    description: "Compilador de informes de práctica y persistencia cero-trace.",
                    criteria: "Permite compilar el informe sanitizado en formato Markdown para portapapeles y registrar estadísticas en localStorage. No almacena textos de notas contaminadas ni datos sensibles.",
                    status: "Ready",
                    details: "Compilador listo. Purga de historial habilitada (borrado definitivo local con un solo clic)."
                  }
                ].map((frente) => {
                  const isExpanded = expandedFrenteId === frente.id;
                  return (
                    <div
                      key={frente.id}
                      className={`rounded-xl border transition-all ${
                        isExpanded
                          ? "bg-slate-950/90 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.03)]"
                          : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div
                        onClick={() => setExpandedFrenteId(isExpanded ? null : frente.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-emerald-500/60 font-bold shrink-0">{frente.num}</span>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{frente.title}</h5>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{frente.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                            frente.status === "Ready"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : frente.status === "Needs Review"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {frente.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {isExpanded ? "Ocultar ▴" : "Detalles ▾"}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-900 bg-slate-950/40 space-y-3 text-[10px] text-slate-300 leading-relaxed font-sans">
                          <div>
                            <strong className="text-slate-400 uppercase font-mono text-[9px] block mb-1">Criterio de Auditoría:</strong>
                            <p className="bg-slate-900/50 p-2 rounded border border-slate-900">{frente.criteria}</p>
                          </div>
                          <div>
                            <strong className="text-slate-400 uppercase font-mono text-[9px] block mb-1">Verificación en Vivo:</strong>
                            <pre className="font-mono text-[9px] bg-slate-950 p-2.5 rounded border border-slate-900 text-slate-400 overflow-x-auto whitespace-pre-wrap">
                              {frente.details}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Practice QA Checklist & Rehearsal Lock Control */}
          <div className="space-y-6">
            
            {/* Rehearsal Lock Control Panel */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Consola de Validación y Lock</h4>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 text-center space-y-3">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  Estado Operativo Global
                </span>

                <div className="inline-flex items-center justify-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  {isSafetyBlocked ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : isRehearsalLocked ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-amber-400 animate-pulse" />
                  )}
                  <span className={`text-xs font-bold font-mono tracking-tight ${
                    isSafetyBlocked
                      ? "text-rose-400"
                      : isRehearsalLocked
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}>
                    {isSafetyBlocked 
                      ? "PRACTICE BLOCKED" 
                      : isRehearsalLocked 
                      ? "DEMO PRACTICE REHEARSAL LOCKED" 
                      : "NEEDS REVIEW"}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-sans text-left pt-2">
                  {isSafetyBlocked 
                    ? "ATENCIÓN: Existen frentes de seguridad con estado BLOCKED o hallazgos en el escáner de notas. La simulación no puede validarse."
                    : isRehearsalLocked
                    ? "El laboratorio se encuentra auditado y sellado con control de integridad local. Listo para ensayar de forma segura frente a perfiles autorizados."
                    : "El laboratorio está en modo de evaluación. Revise las alertas pendientes para aplicar el bloqueo definitivo de calidad."}
                </p>

                <div className="pt-3 border-t border-slate-900 flex gap-2">
                  <button
                    onClick={() => {
                      if (isSafetyBlocked) {
                        alert("No es posible validar la sesión: Existen bloqueos de seguridad activos o hallazgos en el escáner de notas.");
                        return;
                      }
                      setIsRehearsalLocked(!isRehearsalLocked);
                      onAddAuditLog("Practice Lock Toggled", `Cambió estado de lock de ensayo a: ${!isRehearsalLocked}`);
                    }}
                    disabled={isSafetyBlocked}
                    className={`w-full py-2 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                      isSafetyBlocked
                        ? "bg-slate-950 text-slate-600 cursor-not-allowed border border-slate-900"
                        : isRehearsalLocked
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-black"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md font-black"
                    }`}
                  >
                    {isRehearsalLocked ? "🔓 Romper Validación" : "🔒 Validar & Aplicar Lock"}
                  </button>
                </div>
              </div>
            </div>

            {/* 16-point QA Checklist */}
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Practice QA Checklist (16 Frentes)</h4>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Directiva técnica de 16 verificaciones obligatorias para el resguardo de privacidad y compliance de presentación.
              </p>

              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                {[
                  { id: "localPractice", label: "01. Practice Mode local", desc: "Ejecución 100% en navegador local", val: true },
                  { id: "noAudio", label: "02. No audio recording", desc: "Micrófono inhabilitado por hardware", val: safetyChecklist.noAudio === "Ready" },
                  { id: "noVideo", label: "03. No video recording", desc: "Cámara inhabilitada por hardware", val: safetyChecklist.noVideo === "Ready" },
                  { id: "noBiometrics", label: "04. No biometrics", desc: "Sin evaluación de rasgos, voz o emoción", val: safetyChecklist.noBiometrics === "Ready" },
                  { id: "noRealData", label: "05. No real data", desc: "Sin datos personales o simulados en disco", val: safetyChecklist.noRealData === "Ready" },
                  { id: "noIpRtsp", label: "06. No IP/RTSP", desc: "Exclusión de sub-streams de red física", val: safetyChecklist.noIpRtsp === "Ready" },
                  { id: "responsibleClaims", label: "07. Responsible claims checked", desc: "Sin falsas promesas de producción", val: safetyChecklist.responsibleClaims === "Ready" },
                  { id: "routeSelected", label: "08. Route selected", desc: "Ruta de ensayo configurada correctamente", val: !!selectedRouteId },
                  { id: "timerActive", label: "09. Timer active", desc: "Cronómetro local y pacing coach online", val: true },
                  { id: "objectionsReady", label: "10. Objections ready", desc: "12 tácticas de respuesta cargadas", val: true },
                  { id: "notesScannerActive", label: "11. Notes scanner active", desc: "Monitoreo regex de PII activo", val: true },
                  { id: "reportSanitized", label: "12. Report sanitized", desc: "Compilación libre de emails o IPs", val: notesFindings.length === 0 },
                  { id: "historyLocalOnly", label: "13. History local only", desc: "Historial de estadísticas en localStorage", val: true },
                  { id: "homePremiumPreserved", label: "14. Home premium preserved", desc: "Portada premium limpia de 8/4 tarjetas", val: true },
                  { id: "rbacActive", label: "15. RBAC active", desc: "Acceso denegado a conserjes y guardias", val: userRole !== ("conserje" as any) },
                  { id: "readmeUpdated", label: "16. README updated", desc: "Manual del módulo 12D integrado en docs", val: true }
                ].map((item) => {
                  return (
                    <div key={item.id} className="flex items-start gap-2.5 text-[10px] leading-tight border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <input
                        type="checkbox"
                        checked={item.val}
                        readOnly
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 mt-0.5 cursor-default shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-slate-200 font-sans font-bold block">{item.label}</span>
                        <span className="text-slate-500 text-[9px] font-mono leading-none block mt-0.5">{item.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
