import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  ChevronRight,
  Play,
  Info,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Activity,
  FileText,
  Sliders,
  User,
  Shield,
  Wrench,
  Video,
  Lock,
  Terminal,
  ArrowRight,
  Copy,
  RotateCcw,
  Sparkles,
  BookOpen,
  LifeBuoy
} from "lucide-react";

interface OperatorOnboardingPracticeProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
  onOpenHelpDrawer?: () => void;
}

interface Exercise {
  id: string;
  title: string;
  objective: string;
  screen: string;
  screenId: string;
  steps: string[];
  observe: string;
  commonError: string;
  avoid: string;
  helpLinkName: string;
  troubleCaseId: string;
  faqLinkText: string;
}

export default function OperatorOnboardingPractice({
  userRole,
  onAddAuditLog,
  setCurrentTab,
  onOpenHelpDrawer
}: OperatorOnboardingPracticeProps) {
  // Available Routes & Active Selection
  const [selectedRole, setSelectedRole] = useState<"conserje" | "admin" | "tecnico">(
    userRole === "conserje" ? "conserje" : userRole === "tecnico" ? "tecnico" : "admin"
  );

  // Guardrails checklist states (toggleable to simulate failures/blocks!)
  const [safetyToggles, setSafetyToggles] = useState({
    onboardingPractice: true,
    localOnly: true,
    noAudio: true,
    noVideo: true,
    noBiometrics: true,
    noRealData: true,
    noIpRtsp: true,
    roleBased: true,
    internalSummary: true,
    homePreserved: true,
  });

  // Checklist labels for rendering
  const safetyLabels: Record<keyof typeof safetyToggles, string> = {
    onboardingPractice: "Onboarding Practice",
    localOnly: "Local Only",
    noAudio: "No Audio",
    noVideo: "No Video",
    noBiometrics: "No Biometrics",
    noRealData: "No Real Data",
    noIpRtsp: "No IP/RTSP",
    roleBased: "Role-Based",
    internalSummary: "Internal Summary Only",
    homePreserved: "Home Preserved",
  };

  // Onboarding tracking state
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [helpConsulted, setHelpConsulted] = useState<string[]>([]);
  const [errorsReviewed, setErrorsReviewed] = useState<string[]>([]);
  const [guardrailsAccepted, setGuardrailsAccepted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [activeHelpDrawer, setActiveHelpDrawer] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Local History State
  const [historyList, setHistoryList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("ORBI_ONBOARDING_HISTORY");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  const saveToHistory = (newState: string) => {
    const newRecord = {
      id: "onb-" + Date.now(),
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      role: selectedRole,
      route: selectedRole === "conserje" ? "Operativa Simple" : selectedRole === "admin" ? "Gestión y Pilotos" : "Diagnóstico Técnico",
      exercisesCompleted: completedExercises.length,
      state: newState,
      helpConsultedCount: helpConsulted.length,
      errorsReviewedCount: errorsReviewed.length,
    };
    const updated = [newRecord, ...historyList].slice(0, 10); // keep last 10
    setHistoryList(updated);
    localStorage.setItem("ORBI_ONBOARDING_HISTORY", JSON.stringify(updated));
    onAddAuditLog("Historial Onboarding", `Se guardó sesión de práctica para rol ${selectedRole.toUpperCase()}`);
  };

  const clearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("ORBI_ONBOARDING_HISTORY");
    onAddAuditLog("Historial Onboarding", "Historial local de onboarding eliminado correctamente.");
  };

  // Notes Scanner logic
  const scanResults = useMemo(() => {
    const findings: string[] = [];
    if (!notes) return { violated: false, findings: [] };

    // 1. Emails
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(notes)) {
      findings.push("Correo electrónico privado (PII)");
    }
    // 2. Phones
    if (/\+?\d{9,15}/.test(notes)) {
      findings.push("Número telefónico real (PII)");
    }
    // 3. IPs
    if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(notes)) {
      findings.push("Dirección IP real de red");
    }
    // 4. RTSP links
    if (/rtsp:\/\//i.test(notes)) {
      findings.push("Enlace de transmisión RTSP real");
    }
    // 5. Credentials pattern
    if (/\b(?:user|password|pass|passwd|usuario|clave|contraseña)\s*[:=]\s*\w+/i.test(notes)) {
      findings.push("Credencial o contraseña expuesta");
    }
    // 6. Tokens
    if (/\b(?:token|bearer|apikey|api_key)\s*[:=]\s*\w+/i.test(notes)) {
      findings.push("API Key o Token de seguridad");
    }
    // 7. Coordinates
    if (/\b\d{1,3}\.\d+°?\s*[NS],\s*\d{1,3}\.\d+°?\s*[EW]\b/i.test(notes) || /\d{2}\.\d{4,},\s*-?\d{2}\.\d{4,}/.test(notes)) {
      findings.push("Coordenadas geográficas físicas");
    }
    // 8. Absolute commercial / safety claims
    if (/100%\s*infalible|detección\s*infalible|prevenir\s*robos|reemplazar\s*guardias|sustituir\s*nvr|sustituir\s*scada/i.test(notes)) {
      findings.push("Declaración absoluta prohibida (Garantía infalible / Reemplazo humano)");
    }
    // 9. Contractual / pricing / legal definitive words
    if (/garantizamos\s*que|garantía\s*absoluta|certificado\s*legal|inmutable/i.test(notes)) {
      findings.push("Lenguaje legal absoluto no permitido en laboratorio");
    }
    if (/\$\d+/.test(notes)) {
      findings.push("Mención de precios contractuales o tarifas definitivas");
    }

    return {
      violated: findings.length > 0,
      findings
    };
  }, [notes]);

  // Exercises Database
  const exercises: Record<"conserje" | "admin" | "tecnico", Exercise[]> = {
    conserje: [
      {
        id: "cons-1",
        title: "1. Abrir Live Wall",
        objective: "Aprender a visualizar la cuadrícula perimetral de cámaras simuladas.",
        screen: "Live Wall",
        screenId: "livewall",
        steps: [
          "Presione el botón 'Ir a pantalla' para cargar la cuadrícula de monitoreo.",
          "Identifique los streams locales simulados que se despliegan en la grilla.",
          "Confirme el estado general 'Online' de las cámaras de laboratorio."
        ],
        observe: "Que los streams corren en un entorno cerrado sin acceso a IPs públicas reales.",
        commonError: "Creer que la simulación de video corresponde a cámaras reales de producción.",
        avoid: "Intentar configurar enlaces RTSP reales o direcciones de red públicas en el panel.",
        helpLinkName: "Guía Básica de Monitoreo",
        troubleCaseId: "no_stream_simulated",
        faqLinkText: "¿Cómo funciona el Live Wall local?"
      },
      {
        id: "cons-2",
        title: "2. Identificar una alerta",
        objective: "Reconocer las notificaciones visuales de intrusión perimetral.",
        screen: "Live Wall o Easy View",
        screenId: "livewall",
        steps: [
          "Observe el destello rojo intermitente que indica un evento analítico.",
          "Lea la descripción de la miniatura para conocer el tipo de evento (por ejemplo, Persona detectada).",
          "Recuerde que este evento es un ejercicio de entrenamiento dinámico local."
        ],
        observe: "Los badges explícitos de 'Evento Simulado' de seguridad.",
        commonError: "Pensar que se trata de una intrusión real y alertar a la policía de inmediato.",
        avoid: "Utilizar claims de efectividad absoluta de alertas (detección 100% libre de fallas).",
        helpLinkName: "Guía de Gestión de Alertas",
        troubleCaseId: "alert_delay_sim",
        faqLinkText: "¿Qué significan los eventos en la simulación?"
      },
      {
        id: "cons-3",
        title: "3. Abrir Incidentes",
        objective: "Acceder a la bitácora local de registros para visualizar incidentes anteriores.",
        screen: "Incident Center",
        screenId: "incidentcenter",
        steps: [
          "Vaya al Incident Center utilizando el botón rápido.",
          "Verifique la lista de alertas documentadas en el software."
        ],
        observe: "El enmascaramiento total de datos de red en cada registro.",
        commonError: "Esperar una base de datos en la nube conectada a agencias externas.",
        avoid: "Ingresar nombres de clientes reales, correos electrónicos o teléfonos privados en la búsqueda.",
        helpLinkName: "Manual de Incidentes",
        troubleCaseId: "empty_incident_log",
        faqLinkText: "¿Dónde se guardan los incidentes?"
      },
      {
        id: "cons-4",
        title: "4. Reportar incidente de demo",
        objective: "Crear una minuta de práctica rápida para simular el reporte de un suceso.",
        screen: "Incident Center",
        screenId: "incidentcenter",
        steps: [
          "Complete el formulario rápido de incidente seleccionando una de las cámaras de laboratorio.",
          "Escriba una breve glosa de práctica libre de datos privados."
        ],
        observe: "Que no se solicita ninguna dirección IP ni credencial de la cámara.",
        commonError: "Creer que el reporte de demo constituye evidencia judicial certificada.",
        avoid: "Escribir datos sensibles de personas o claims absolutos de culpabilidad.",
        helpLinkName: "Buenas Prácticas de Reportabilidad",
        troubleCaseId: "sanitization_fail",
        faqLinkText: "¿Cómo reportar un incidente de forma responsable?"
      },
      {
        id: "cons-5",
        title: "5. Revisar privacidad básica",
        objective: "Comprender la función pasiva de protección de datos locales.",
        screen: "Privacidad",
        screenId: "privacy",
        steps: [
          "Abra el panel de Privacidad desde la interfaz.",
          "Revise los principios del Privacy Shield que rigen el software perimetral."
        ],
        observe: "El almacenamiento local (localStorage) sin almacenar PII, credenciales, IP/RTSP ni datos sensibles.",
        commonError: "Pensar que el enmascaramiento facial del laboratorio graba biometría real de personas.",
        avoid: "Solicitar la desactivación de filtros de privacidad locales.",
        helpLinkName: "Compromiso de Privacidad",
        troubleCaseId: "privacy_filter_missing",
        faqLinkText: "¿Qué datos se almacenan en mi sesión?"
      },
      {
        id: "cons-6",
        title: "6. Avisar técnico",
        objective: "Simular el reporte de un problema de hardware de CCTV.",
        screen: "Easy View o Incidentes",
        screenId: "easyview",
        steps: [
          "Presione el botón 'Avisar Técnico' en el panel táctil de Easy View.",
          "Revise que el aviso quede asentado de forma local en la bitácora."
        ],
        observe: "La priorización del aviso técnico sin abrir puertos WAN ni enviar alertas por internet.",
        commonError: "Esperar la visita en tiempo real de un instalador físico de la marca.",
        avoid: "Proporcionar números de teléfono personales o claves de routers en las notas de soporte.",
        helpLinkName: "Canales de Asistencia",
        troubleCaseId: "tech_notify_offline",
        faqLinkText: "¿Qué hace la alerta de técnico?"
      }
    ],
    admin: [
      {
        id: "adm-1",
        title: "1. Abrir Pantalla Principal",
        objective: "Familiarizarse con el launcher unificado y la distribución de 8 tarjetas.",
        screen: "Pantalla Principal (Home)",
        screenId: "simplehome",
        steps: [
          "Retorne a la Pantalla Principal.",
          "Verifique que la portada mantenga la estética sobria sin indicadores de versión pesados en el header."
        ],
        observe: "La perfecta preservación de la interfaz Home premium de 8 tarjetas.",
        commonError: "Intentar agregar banners promocionales o tarjetas redundantes en el Home.",
        avoid: "Romper el Premium Home Acceptance Lock agregando accesos técnicos no autorizados.",
        helpLinkName: "Guía del Launcher Consola",
        troubleCaseId: "home_clutter",
        faqLinkText: "¿Por qué el Home es simple?"
      },
      {
        id: "adm-2",
        title: "2. Revisar Incidentes",
        objective: "Aprender a auditar los reportes locales generados por la guardia.",
        screen: "Incident Center",
        screenId: "incidentcenter",
        steps: [
          "Navegue al Incident Center.",
          "Examine la bitácora buscando que todo lenguaje se adecue a las guías éticas."
        ],
        observe: "El correcto enmascaramiento de IPs e identidades en los reportes de turno.",
        commonError: "Ingresar claims absolutos de robos consumados en las notas administrativas.",
        avoid: "Almacenar información personal, placas reales o credenciales ONVIF.",
        helpLinkName: "Manual de Auditoría Interna",
        troubleCaseId: "pii_leak",
        faqLinkText: "¿Qué es el enmascaramiento ético?"
      },
      {
        id: "adm-3",
        title: "3. Generar reporte sanitizado de demo",
        objective: "Practicar la exportación segura de bitácoras sin filtración de PII.",
        screen: "Evidencias / Reportes",
        screenId: "evidence",
        steps: [
          "Abra el módulo de Evidencias.",
          "Haga clic en 'Compilar Reporte' y copie el resultado en Markdown."
        ],
        observe: "Que el escáner heurístico purga automáticamente correos, IPs y RTSP.",
        commonError: "Creer que este reporte tiene validez judicial inmutable.",
        avoid: "Prometer compatibilidad universal o efectividad absoluta en el reporte exportado.",
        helpLinkName: "Guía de Exportación Sanitizada",
        troubleCaseId: "scanner_override_blocked",
        faqLinkText: "¿Cómo se sanitiza un reporte de demo?"
      },
      {
        id: "adm-4",
        title: "4. Revisar roles y permisos",
        objective: "Verificar la lógica de control de acceso basado en roles (RBAC).",
        screen: "Help Center (Roles)",
        screenId: "helpcenter",
        steps: [
          "Diríjase a la pestaña 'Guías por rol' del Centro de Ayuda.",
          "Verifique que el rol 'Conserje' no visualice paneles avanzados de diagnóstico."
        ],
        observe: "La segregación estricta que inhabilita accesos técnicos a la conserjería.",
        commonError: "Compartir claves de administración para evitar tener que cambiar de rol.",
        avoid: "Escribir la contraseña del Access Vault en una nota de ayuda.",
        helpLinkName: "Estructura de Permisos RBAC",
        troubleCaseId: "rbac_bypass",
        faqLinkText: "¿Cómo funciona la segregación de funciones?"
      },
      {
        id: "adm-5",
        title: "5. Abrir Pilot Intake",
        objective: "Aprender a estructurar propuestas comerciales acotadas para clientes.",
        screen: "Pilot Intake Center",
        screenId: "pilotintake",
        steps: [
          "Abra el Pilot Intake Center.",
          "Examine el checklist técnico de 14 puntos (incluyendo seguridad eléctrica y HSE)."
        ],
        observe: "El acotamiento mandatorio de pilotos a un máximo de 1 a 3 cámaras.",
        commonError: "Prometer despliegues masivos inmediatos de CCTV sin levantamiento previo.",
        avoid: "Afirmar que el piloto autónomo previene robos perimetrales.",
        helpLinkName: "Manual de Preventa y Pilotos",
        troubleCaseId: "pilot_excessive_scope",
        faqLinkText: "¿Por qué el piloto se acota a 1-3 cámaras?"
      },
      {
        id: "adm-6",
        title: "6. Abrir Official Demo Runbook",
        objective: "Ensayar con el runbook comercial antes de interactuar con clientes.",
        screen: "Official Demo Runbook",
        screenId: "demorunbook",
        steps: [
          "Vaya al Demo Runbook.",
          "Revise los 10 frentes de conformidad requeridos para congelar el runbook."
        ],
        observe: "Las recomendaciones dinámicas y las frases a evitar en una reunión comercial.",
        commonError: "Saltarse los guardrails de transparencia con tal de cerrar la venta.",
        avoid: "Usar terminología absoluta de certificación legal en la oratoria.",
        helpLinkName: "Manual del Runbook Oficial",
        troubleCaseId: "runbook_blocked_status",
        faqLinkText: "¿Qué es la conformidad de venta ética?"
      }
    ],
    tecnico: [
      {
        id: "tec-1",
        title: "1. Abrir Cámaras y Gateway",
        objective: "Comprender la topología local basada en el gateway de laboratorio.",
        screen: "Cámaras y Gateway",
        screenId: "gatewaylocal",
        steps: [
          "Abra el módulo Gateway Local.",
          "Verifique la conexión lógica con el PC/Notebook que actúa como nodo local."
        ],
        observe: "El confinamiento local del direccionamiento IP y puertos ONVIF.",
        commonError: "Asumir que el software requiere abrir puertos públicos en el módem de internet.",
        avoid: "Exponer credenciales reales de la cámara o contraseñas de red en caliente.",
        helpLinkName: "Instalación de Gateway Local",
        troubleCaseId: "gateway_disconnect_sim",
        faqLinkText: "¿Cómo opera el gateway local?"
      },
      {
        id: "tec-2",
        title: "2. Revisar Diagnóstico CCTV",
        objective: "Aprender a diagnosticar problemas de latencia y jitter simulados.",
        screen: "Diagnóstico CCTV",
        screenId: "diagnostics",
        steps: [
          "Abra la vista de Diagnóstico.",
          "Examine los gráficos de ping y pérdida de paquetes de los canales de CCTV."
        ],
        observe: "La fluctuación simulada y la pérdida de transmisión por factores de red.",
        commonError: "Asociar la inestabilidad de la imagen a un fallo del software de IA.",
        avoid: "Garantizar una latencia fija o estabilidad universal en redes WiFi deficientes.",
        helpLinkName: "Manual de Diagnóstico CCTV",
        troubleCaseId: "packet_loss_wifi",
        faqLinkText: "¿Cómo leer los gráficos de diagnóstico?"
      },
      {
        id: "tec-3",
        title: "3. Revisar Compatibility Matrix",
        objective: "Verificar los perfiles ONVIF soportados de forma pasiva por el software.",
        screen: "Compatibility Matrix",
        screenId: "compatibility",
        steps: [
          "Ingrese a la pestaña Compatibility Matrix.",
          "Examine las marcas certificadas de forma interna (Dahua, Hikvision, Bosch)."
        ],
        observe: "La clasificación por compatibilidad de perfiles S, G y T.",
        commonError: "Garantizar compatibilidad universal incondicional con cualquier cámara china sin marca.",
        avoid: "Ofrecer soporte incondicional para cámaras analógicas obsoletas sin codificador.",
        helpLinkName: "Guía de Compatibilidad ONVIF",
        troubleCaseId: "non_onvif_camera",
        faqLinkText: "¿Qué perfiles ONVIF son compatibles?"
      },
      {
        id: "tec-4",
        title: "4. Revisar Gateway Local",
        objective: "Familiarizarse con el almacenamiento en el disco local y los límites físicos.",
        screen: "Gateway Local",
        screenId: "gatewaylocal",
        steps: [
          "Abra el panel de Gateway Local.",
          "Inspeccione el uso de espacio en disco simulado y el tiempo de retención."
        ],
        observe: "El indicador de almacenamiento circular local de seguridad.",
        commonError: "Prometer almacenamiento infinito o inmutable en la nube sin costo adicional.",
        avoid: "Intentar configurar respaldos externos no autorizados en nubes de terceros.",
        helpLinkName: "Configuración de Retenciones",
        troubleCaseId: "disk_full_overwrite",
        faqLinkText: "¿Cómo se gestiona el disco local?"
      },
      {
        id: "tec-5",
        title: "5. Revisar Evidence Report",
        objective: "Comprobar la integridad de los clips de video guardados de forma pasiva.",
        screen: "Evidence Center (Reportes)",
        screenId: "evidence",
        steps: [
          "Acceda a la biblioteca de Evidencias.",
          "Valide los hashes SHA-256 de control de integridad de los archivos."
        ],
        observe: "Que toda firma digital es local y sirve para control técnico interno.",
        commonError: "Presentar estos hashes como prueba judicial certificada por escribano.",
        avoid: "Usar términos de acreditación forense o pericia judicial externa sin supervisión.",
        helpLinkName: "Cifrado e Integridad Local",
        troubleCaseId: "hash_mismatch",
        faqLinkText: "¿Qué es la firma SHA-256 de integridad?"
      },
      {
        id: "tec-6",
        title: "6. Revisar límites de conexión real",
        objective: "Estudiar los bloqueos de seguridad que inhabilitan la operación real descontrolada.",
        screen: "Help Center (Privacidad)",
        screenId: "helpcenter",
        steps: [
          "Abra el Centro de Ayuda > pestaña de Seguridad y Privacidad.",
          "Examine las restricciones del estado Production Locked."
        ],
        observe: "La inhabilitación absoluta de aperturas de puertos externos públicos.",
        commonError: "Buscar bypasses a los bloqueos de seguridad de red en terreno.",
        avoid: "Exponer contraseñas maestras del NVR para agilizar la puesta en marcha.",
        helpLinkName: "Políticas de Conectividad Cerrada",
        troubleCaseId: "production_locked_alert",
        faqLinkText: "¿Qué es el bloqueo de producción cerrado?"
      }
    ]
  };

  const activeExercises = exercises[selectedRole];
  const currentExercise = activeExercises[activeExerciseIndex];

  // Helper functions to check RBAC restrictions
  const isActionRestrictedForConserje = (screenId: string) => {
    if (userRole === "conserje") {
      const allowed = ["livewall", "incidentcenter", "easyview", "privacy"];
      return !allowed.includes(screenId);
    }
    return false;
  };

  // State calculations for First-Use Validation
  const validationStatus = useMemo(() => {
    // Check safety toggles
    const safetyFailure =
      !safetyToggles.noAudio ||
      !safetyToggles.noVideo ||
      !safetyToggles.noBiometrics ||
      !safetyToggles.noRealData ||
      !safetyToggles.noIpRtsp ||
      !safetyToggles.internalSummary;

    if (safetyFailure || scanResults.violated) {
      return "Onboarding Blocked";
    }

    const totalInRoute = activeExercises.length;
    const completedInRoute = activeExercises.filter(ex => completedExercises.includes(ex.id)).length;

    // Check completion criteria
    if (completedInRoute === totalInRoute && guardrailsAccepted && helpConsulted.length > 0) {
      return "Ready for Guided Use";
    }

    return "Needs More Practice";
  }, [selectedRole, completedExercises, guardrailsAccepted, helpConsulted, safetyToggles, scanResults, activeExercises]);

  // Coach Messages Generator (Reactive advice depending on actions)
  const coachMessage = useMemo(() => {
    if (scanResults.violated) {
      return {
        text: "¡ATENCIÓN! Se han detectado datos sensibles o claims absolutos en sus notas de práctica. Por favor purgue su nota para reanudar el flujo.",
        type: "danger"
      };
    }
    if (validationStatus === "Onboarding Blocked") {
      return {
        text: "Sello de resguardo inactivo. Se han vulnerado los factores de seguridad ética de la demostración. Onboarding bloqueado.",
        type: "danger"
      };
    }
    if (completedExercises.length === 0) {
      return {
        text: "Buen inicio: ya puedes revisar las cámaras. Selecciona tu ejercicio de primeros pasos para iniciar.",
        type: "info"
      };
    }
    if (completedExercises.length > 0 && completedExercises.length < activeExercises.length) {
      return {
        text: `Va muy bien, lleva ${completedExercises.length} ejercicios practicados de ${activeExercises.length}. Recuerde no ingresar credenciales reales en la demo.`,
        type: "success"
      };
    }
    if (completedExercises.length === activeExercises.length) {
      if (!guardrailsAccepted) {
        return {
          text: "Ha practicado todas las guías. Por favor, acepte los términos de privacidad al pie para registrar su práctica orientativa.",
          type: "warning"
        };
      }
      return {
        text: "Ruta completada de forma impecable. Ya puede copiar su reporte de onboarding sanitizado.",
        type: "success"
      };
    }
    return {
      text: "Explore cada pantalla y recuerde que para problemas de hardware técnico debe avisar a un perfil Técnico.",
      type: "info"
    };
  }, [completedExercises, activeExercises, guardrailsAccepted, validationStatus, scanResults]);

  // Summary Report Content
  const summaryReport = useMemo(() => {
    const passedEx = activeExercises.filter(ex => completedExercises.includes(ex.id)).map(e => e.title);
    return `===========================================================
ORBI SENTINEL IA — OPERATOR ONBOARDING SUMMARY
===========================================================
ID de Sesión: ONB-${Date.now().toString().slice(-6)}
Fecha de Práctica: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.13.4-sentinel-operator-training-suite-lock
Rol Practicado: ${selectedRole.toUpperCase()}
Ruta de Entrenamiento: ${selectedRole === "conserje" ? "Primeros pasos operativos" : selectedRole === "admin" ? "Gestión y Pilotos" : "Diagnóstico Técnico CCTV"}

[1] ESTADO DE LA VALIDACIÓN INTERNA:
- Ejercicios Completados: ${passedEx.length} de ${activeExercises.length}
- Ayuda Contextual Consultada: ${helpConsulted.length} veces
- Errores Comunes Revisados: ${errorsReviewed.length} casos
- Estado Orientativo Resultante: ${validationStatus.toUpperCase()}

[2] EJERCICIOS COMPLETADOS EN ESTA SESIÓN:
${passedEx.length > 0 ? passedEx.map(p => `✔️ ${p}`).join("\n") : "- Ninguno por el momento."}

[3] FACTORES DE COMPLIANCE ÉTICO:
- Sin Audio Grabado: SI, verificado localmente.
- Sin Video Almacenado: SI, verificado localmente.
- Sin Datos Biométricos: SI, verificado localmente.
- Sin Datos Reales (IP/RTSP): SI, verificado localmente.
- Sin Exposición de Credenciales: SI, verificado localmente.
- Sello de Preservación de Home: SI, verificado localmente.

[4] RECOMENDACIÓN DE PRÓXIMO PASO:
${
  validationStatus === "Ready for Guided Use"
    ? "✔️ Perfil listo para operar de manera guiada en el puesto de demostración local."
    : "⚠️ Se recomienda revisar los ejercicios pendientes y confirmar los límites de privacidad perimetral."
}

[5] NOTAS DE APRENDIZAJE:
${notes ? notes : "Sin anotaciones ingresadas."}

-----------------------------------------------------------
AVISO MANDATORIO DE TRANSPARENCIA:
Este resultado es interno y orientativo. No evalúa a la persona,
no representa certificación profesional, validación legal,
aprobación contractual ni autorización de despliegue en producción.
===========================================================`;
  }, [selectedRole, completedExercises, helpConsulted, errorsReviewed, validationStatus, notes, activeExercises]);

  const handleCopySummary = () => {
    if (validationStatus === "Onboarding Blocked" || scanResults.violated) {
      alert("No se permite copiar el reporte debido a un bloqueo de seguridad activo (Notas contaminadas o Sello vulnerado).");
      return;
    }
    navigator.clipboard.writeText(summaryReport);
    setCopiedSuccess(true);
    onAddAuditLog("Copiado Onboarding", `El operador exportó el resumen de Onboarding para el rol ${selectedRole.toUpperCase()}`);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const markAsPracticed = (id: string) => {
    if (!completedExercises.includes(id)) {
      const updated = [...completedExercises, id];
      setCompletedExercises(updated);
      onAddAuditLog("Onboarding Practiced", `Ejercicio completado: ${currentExercise.title}`);
      
      // Auto advance
      if (activeExerciseIndex < activeExercises.length - 1) {
        setTimeout(() => {
          setActiveExerciseIndex(prev => prev + 1);
        }, 800);
      }
    }
  };

  const handleNavigateScreen = (screenId: string) => {
    if (isActionRestrictedForConserje(screenId)) {
      alert("Su rol de Conserje tiene restringido el acceso a esta pantalla avanzada de configuración o diagnóstico.");
      onAddAuditLog("RBAC Block Onboarding", `Conserje intentó acceder de forma inapropiada a la pantalla ${screenId}`);
      return;
    }
    setCurrentTab(screenId);
    onAddAuditLog("Onboarding Navegar", `Navegación al módulo ${screenId} desde ejercicio guiado.`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SAFETY BANNER AND TOGGLEABLE BADGES */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        validationStatus === "Onboarding Blocked"
          ? "bg-rose-950/40 border-rose-900/60 text-rose-200"
          : "bg-slate-950/60 border-slate-850 text-slate-300"
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${validationStatus === "Onboarding Blocked" ? "text-rose-400 animate-pulse" : "text-emerald-400"}`} />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Sello de Validación y Salvaguardas Éticas
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                validationStatus === "Onboarding Blocked"
                  ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  : validationStatus === "Ready for Guided Use"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              }`}>
                {validationStatus}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-sans">
              “Práctica interna de primeros pasos — local, sin audio/video, sin biometría, sin datos reales, sin IP/RTSP, sin credenciales y sin evaluación personal.”
            </p>
          </div>
          
          {/* Active status representation badge */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${
              validationStatus === "Onboarding Blocked"
                ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
                : validationStatus === "Ready for Guided Use"
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/5 border-amber-500/20 text-amber-400"
            }`}>
              <span className="text-[9px] font-mono uppercase text-slate-500">Status</span>
              <span className="text-xs font-bold uppercase mt-0.5">
                {validationStatus === "Onboarding Blocked" ? "Blocked" : validationStatus === "Ready for Guided Use" ? "Ready" : "Practice"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic interactive badges row - users can toggle them to simulate violations! */}
        <div className="mt-4 pt-3 border-t border-slate-900">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2 font-bold">
            Simulador de Cumplimiento (Haga clic para simular desactivación de resguardos)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(safetyToggles) as Array<keyof typeof safetyToggles>).map((key) => {
              const active = safetyToggles[key];
              return (
                <button
                  key={key}
                  onClick={() => {
                    const nextVal = !active;
                    setSafetyToggles(prev => ({ ...prev, [key]: nextVal }));
                    onAddAuditLog("Toggle Safety Factor", `Simuló cambio de factor ${String(key)} a ${nextVal ? "Activo" : "Inactivo"}`);
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold border transition-all flex items-center gap-1 ${
                    active
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <span>{safetyLabels[key]}</span>
                  <span className="opacity-50 text-[8px] ml-0.5">[{active ? "OK" : "FAIL"}]</span>
                </button>
              );
            })}
          </div>
          {validationStatus === "Onboarding Blocked" && (
            <div className="mt-2 text-[10px] text-rose-400 font-mono flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bloqueo de seguridad activo. Se inhabilitaron las copias y reportes consolidados por no conformidad.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ROLE SELECTOR BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Seleccione su Ruta de Práctica por Rol</h4>
          <p className="text-[10px] text-slate-400">Verifique los primeros pasos operativos, de gestión o diagnóstico.</p>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-stretch sm:self-auto">
          {(["conserje", "admin", "tecnico"] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                // If conserje is selected but current userRole is conserje, that's fine.
                // If userRole is conserje and tries to practice admin or tecnico, block them!
                if (userRole === "conserje" && role !== "conserje") {
                  alert("Su rol de Conserje tiene restringido el acceso a ejercicios prácticos avanzados.");
                  return;
                }
                setSelectedRole(role);
                setActiveExerciseIndex(0);
                onAddAuditLog("Onboarding Switch Role", `Cambió de ruta de práctica a ${role.toUpperCase()}`);
              }}
              disabled={userRole === "conserje" && role !== "conserje"}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                selectedRole === role
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              {role === "conserje" ? "Conserje" : role === "admin" ? "Administrador" : "Técnico"}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC COACH WIDGET */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
        coachMessage.type === "danger"
          ? "bg-rose-500/5 border-rose-500/15 text-rose-300"
          : coachMessage.type === "warning"
          ? "bg-amber-500/5 border-amber-500/15 text-amber-300"
          : coachMessage.type === "success"
          ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-300"
          : "bg-blue-500/5 border-blue-500/15 text-blue-300"
      }`}>
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider block">Onboarding Coach Advice</span>
          <p className="text-xs font-sans leading-relaxed">{coachMessage.text}</p>
        </div>
      </div>

      {/* 4. ACTIVE EXERCISE DECK & STEP BY STEP PLAYGROUND */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl overflow-hidden">
        
        {/* Navigation tabs inside the selected route */}
        <div className="flex border-b border-slate-900 bg-slate-950/50 overflow-x-auto scrollbar-none">
          {activeExercises.map((ex, index) => {
            const isCompleted = completedExercises.includes(ex.id);
            const isActive = activeExerciseIndex === index;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveExerciseIndex(index);
                  onAddAuditLog("Select Onboarding Task", `Navegó al paso ${index + 1} de la ruta`);
                }}
                className={`px-4 py-3 text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border-b-2 ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-slate-900/50"
                    : isCompleted
                    ? "border-transparent text-slate-300 hover:bg-slate-900/30"
                    : "border-transparent text-slate-500 hover:bg-slate-900/30"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                )}
                <span>Task {index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Content container of the selected Exercise */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">{currentExercise.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                <strong className="text-slate-300">Objetivo simple:</strong> {currentExercise.objective}
              </p>
            </div>
            <div className="text-[10px] font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 self-start">
              Pantalla vinculada: <strong className="text-emerald-400 uppercase">{currentExercise.screen}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Steps & Observe Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">Pasos del Ejercicio:</span>
                <ol className="space-y-2">
                  {currentExercise.steps.map((step, idx) => (
                    <li key={idx} className="text-xs leading-relaxed flex items-start gap-2 text-slate-300">
                      <span className="font-mono text-emerald-400 shrink-0 font-bold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                        Paso {idx + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-500 block font-bold">
                  ¿Qué debe observar el usuario?
                </span>
                <p className="text-xs text-slate-300 leading-normal font-sans">
                  {currentExercise.observe}
                </p>
              </div>
            </div>

            {/* Error & Avoid Column */}
            <div className="space-y-4">
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>ERROR COMÚN Y QUÉ EVITAR</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Error habitual:</span>
                  <p className="text-xs text-slate-300 leading-normal">{currentExercise.commonError}</p>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-rose-500/10">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Qué evitar estrictamente:</span>
                  <p className="text-xs text-rose-300 leading-normal italic">{currentExercise.avoid}</p>
                </div>

                <button
                  onClick={() => {
                    if (!errorsReviewed.includes(currentExercise.id)) {
                      setErrorsReviewed(prev => [...prev, currentExercise.id]);
                      onAddAuditLog("Review Onboarding Error", `Leyó advertencia y mitigó vicio para: ${currentExercise.title}`);
                    }
                    alert("¡Excelente! Ha repasado el error común y conoce el vicio comercial que se debe evitar.");
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-200 font-mono font-bold flex items-center gap-1 mt-2 underline"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar error como revisado</span>
                </button>
              </div>
            </div>

          </div>

          {/* Action buttons footer inside the task card */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-900 bg-slate-950/20 p-4 rounded-xl">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleNavigateScreen(currentExercise.screenId)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ir a pantalla de práctica</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => markAsPracticed(currentExercise.id)}
                disabled={completedExercises.includes(currentExercise.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  completedExercises.includes(currentExercise.id)
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:scale-[1.01]"
                }`}
              >
                <Check className="w-3.5 h-3.5 font-black" />
                <span>{completedExercises.includes(currentExercise.id) ? "Completado" : "Marcar como practicado"}</span>
              </button>
            </div>

            {/* Need Help trigger linked to Troubleshooting case */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!helpConsulted.includes(currentExercise.helpLinkName)) {
                    setHelpConsulted(prev => [...prev, currentExercise.helpLinkName]);
                    onAddAuditLog("Onboarding Help Click", `Consultó artículo: ${currentExercise.helpLinkName}`);
                  }
                  setActiveHelpDrawer(currentExercise.id);
                  if (onOpenHelpDrawer) {
                    onOpenHelpDrawer();
                  }
                }}
                className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Necesito ayuda</span>
              </button>
            </div>
          </div>

          {/* Connected Contextual Help Overlay */}
          {activeHelpDrawer === currentExercise.id && (
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 relative animate-fade-in">
              <button
                onClick={() => setActiveHelpDrawer(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold font-mono uppercase">Contextual Help & Case Troubleshooting</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="font-bold block text-slate-400">📖 Artículo de Ayuda Sugerido:</span>
                  <p className="leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <strong>{currentExercise.helpLinkName}:</strong> El sistema ejecuta simulaciones en un nodo aislado para evitar toda inyección de APIs remotas. {currentExercise.faqLinkText} El flujo es pasivo y en local.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="font-bold block text-slate-400">🛠️ Falla de Diagnóstico Relacionada:</span>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    <strong className="text-rose-400">Falla: {currentExercise.troubleCaseId}</strong>
                    <p className="mt-1 leading-normal text-slate-400">
                      <strong>Mitigación:</strong> Si experimenta este inconveniente simulado, confirme que el rol es apropiado, no intente ingresar credenciales y asegúrese de que el Gateway de Laboratorio está en modo simulado. No use herramientas de red real sin autorización técnica.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => {
                    alert(`Buscando en el Centro de Ayuda: "${currentExercise.helpLinkName}"`);
                    onAddAuditLog("Help Search Sim", `Buscar en Help Center: ${currentExercise.helpLinkName}`);
                  }}
                  className="text-[10px] font-mono bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-white px-2.5 py-1 rounded border border-slate-800"
                >
                  Buscar en Help Center
                </button>
                <button
                  onClick={() => {
                    setActiveHelpDrawer(null);
                    onAddAuditLog("Help Read Success", `Cerró ayuda contextual para ${currentExercise.title}`);
                  }}
                  className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20"
                >
                  Comprendido
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 5. NOTES SCANNER INPUT */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-900 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Onboarding Notes Scanner & Sanitizer
            </h4>
            <p className="text-[10px] text-slate-400">
              Ingrese apuntes de la práctica. El escáner heurístico buscará PII, IPs, RTSP y claims absolutos en tiempo real.
            </p>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
            scanResults.violated
              ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}>
            {scanResults.violated ? "Needs Sanitization" : "Scanner: Validated (No Violations)"}
          </span>
        </div>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escriba aquí sus observaciones (ej. 'La visualización del Live Wall es fluida y el Incident Center registra incidentes en local sin problemas'). Pruebe a ingresar una IP como 192.168.1.1 o la palabra '100% infalible' para probar el escáner."
          className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 text-slate-200 text-xs font-sans rounded-xl p-3 focus:outline-none placeholder-slate-600 transition-all"
        />

        {scanResults.violated && (
          <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-lg space-y-2">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
              ⚠️ Violaciones Detectadas de Resguardo de Información:
            </span>
            <ul className="list-disc pl-4 space-y-1">
              {scanResults.findings.map((item, idx) => (
                <li key={idx} className="text-xs text-rose-300">
                  {item} &bull; <span className="opacity-70 text-[10px]">Sugerencia: Reemplace con un término neutral o un placeholder simulado (ej. "gateway local").</span>
                </li>
              ))}
            </ul>
            <div className="text-[10px] font-mono text-rose-400 pt-1">
              Las copias del reporte de onboarding y el guardado en el historial local están bloqueados hasta que limpie su nota de práctica.
            </div>
          </div>
        )}
      </div>

      {/* 6. REPORT EXPORT COMPILE PANEL */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-900 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Operator Onboarding Summary Report
            </h4>
            <p className="text-[10px] text-slate-400">
              Copie el reporte unificado sanitizado para archivarlo de forma interna.
            </p>
          </div>
          <button
            onClick={handleCopySummary}
            disabled={validationStatus === "Onboarding Blocked" || scanResults.violated}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              validationStatus === "Onboarding Blocked" || scanResults.violated
                ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                : copiedSuccess
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:scale-[1.01]"
            }`}
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Reporte copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar reporte en Markdown</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 border border-slate-900 text-[11px] text-slate-400 font-mono rounded-xl overflow-x-auto max-h-[160px] scrollbar-thin select-all">
          {summaryReport}
        </pre>

        {/* 7. MANDATORY DISCLAIMER */}
        <div className="p-3 bg-slate-950 border border-slate-900 text-slate-400 text-[10px] font-sans leading-relaxed rounded-xl italic">
          <strong>Aviso de Transparencia Obligatorio:</strong> “Este resultado es interno y orientativo. No evalúa a la persona, no representa certificación profesional, validación legal, aprobación contractual ni autorización de despliegue.”
        </div>

        {/* Guardrails acceptance checklist */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="guardrails-accept-onb"
            checked={guardrailsAccepted}
            onChange={(e) => {
              setGuardrailsAccepted(e.target.checked);
              onAddAuditLog("Onboarding Guardrails Check", `Aceptó normas de práctica de onboarding: ${e.target.checked}`);
            }}
            className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-emerald-500/25 cursor-pointer"
          />
          <label htmlFor="guardrails-accept-onb" className="text-xs text-slate-300 font-sans cursor-pointer select-none">
            Acepto que mi práctica es para fines demostrativos locales sin audio/video, sin biometría y sin claims prohibidos.
          </label>
        </div>
      </div>

      {/* 8. HISTORIAL LOCAL DE PRÁCTICA */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Onboarding History Local (Conmutador Opcional)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (validationStatus === "Onboarding Blocked" || scanResults.violated) {
                  alert("No se permite registrar en el historial local en estado de Onboarding Blocked.");
                  return;
                }
                saveToHistory(validationStatus);
                alert("Sesión de práctica guardada correctamente en el historial local del navegador.");
              }}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded text-[10px] font-mono transition-all"
            >
              Guardar Sesión
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded text-[10px] font-mono transition-all"
            >
              {showHistory ? "Ocultar Historial" : "Ver Historial Local"}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="space-y-3 pt-1 animate-fade-in">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay registros de sesiones guardadas localmente.</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                {historyList.map((item, index) => (
                  <div key={item.id} className="bg-slate-950 p-3 border border-slate-900 rounded-lg flex items-center justify-between text-xs font-mono gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">[{item.role.toUpperCase()}]</span>
                        <span className="text-slate-300">{item.route}</span>
                        <span className="text-[10px] text-slate-500">({item.date})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ejercicios: {item.exercisesCompleted} &bull; Ayudas: {item.helpConsultedCount} &bull; Errores: {item.errorsReviewedCount}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      item.state === "Ready for Guided Use"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {item.state === "Ready for Guided Use" ? "Ready" : "Practice"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button
                onClick={clearHistory}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-3 py-1 rounded text-[10px] font-mono transition-all"
              >
                Borrar Historial de Onboarding
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
