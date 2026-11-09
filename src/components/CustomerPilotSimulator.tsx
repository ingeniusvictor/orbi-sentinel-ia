import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LockKeyhole,
  Unlock,
  FileText,
  Users,
  Sliders,
  AlertTriangle,
  Home,
  Play,
  Check,
  Copy,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Info,
  Calendar,
  Wifi,
  WifiOff,
  MessageSquare,
  HelpCircle,
  Activity,
  Brain,
  Layers,
  Laptop
} from "lucide-react";
import LockedView from "./LockedView";

interface CustomerPilotSimulatorProps {
  userRole: string;
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

// Interfaces
interface SyntheticProfile {
  alias: string;
  camerasCount: number;
  cameras: string[];
  events: string[];
  risk: string;
  objective: string;
  siteType: string;
  region: string;
}

interface SimulatedCamera {
  id: string;
  name: string;
  status: "OK" | "Intermitente" | "Revisar ubicación" | "Fuera de servicio";
  signal: string;
  connectivity: string;
  privacy: string;
  diagnostic: string;
}

interface SimulatedEvent {
  id: string;
  title: string;
  day: number;
  description: string;
  suggestedScreen: string;
  expectedAction: string;
  whatToAvoid: string;
  learning: string;
  risk: string;
  relatedScreenId: string;
}

interface DecisionPoint {
  id: string;
  title: string;
  consequence: string;
  recommendation: string;
  whatToAvoid: string;
  nextStep: string;
}

interface StakeholderQuestion {
  id: string;
  question: string;
  answer: string;
  supportScreen: string;
  limitToCommunicate: string;
  nextStep: string;
}

interface HistoryItem {
  date: string;
  type: string;
  alias: string;
  eventsCount: number;
  decisionsCount: number;
  state: string;
  nextStep: string;
}

export default function CustomerPilotSimulator({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: CustomerPilotSimulatorProps) {
  // 1. RBAC Guard - Locked for Conserje
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
  const [selectedType, setSelectedType] = useState<"field" | "community" | "consumer">("field");
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [customAlias, setCustomAlias] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [reviewedEvents, setReviewedEvents] = useState<string[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [isSimulationLocked, setIsSimulationLocked] = useState<boolean>(true);
  const [simulationNeedsReview, setSimulationNeedsReview] = useState<boolean>(false);
  const [showSuiteStatus, setShowSuiteStatus] = useState<boolean>(true);

  // Initialize checklist
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

  const [objectivesChecked, setObjectivesChecked] = useState<Record<string, boolean>>({
    home: true,
    adminScope: false,
    techLimits: false,
    conserjeFlow: false,
    eventsReviewed: false,
    reportGenerated: false,
    risksCommunicated: false,
    authRemembered: true,
    nextStepDefined: false
  });

  const [simulationHistory, setSimulationHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("orbi_sentinel_simulation_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Predefined Synthetic Profiles (Requirement 5)
  const syntheticProfiles: Record<"field" | "community" | "consumer", SyntheticProfile> = {
    field: {
      alias: "[SITIO FIELD SANITIZADO] Central PMGD Solaria Atacama",
      siteType: "Planta Solar Industrial / Cerco Perimetral",
      region: "[REGIÓN GENÉRICA] Zona Desértica Norte",
      camerasCount: 3,
      cameras: ["CAM-SYN-01 (Cerco Norte)", "CAM-SYN-02 (Inversores)", "CAM-SYN-03 (Acceso Vehicular)"],
      events: ["Cámara intermitente", "Movimiento perimetral simulado", "Baja iluminación", "Vista parcialmente obstruida", "Latencia de red local", "Evento animal/no amenaza"],
      risk: "Conectividad de red celular local inestable",
      objective: "Validar comprensión de Live Wall, diagnóstico térmico y reporte de eventos sanitizado sin claves."
    },
    community: {
      alias: "[COMUNIDAD SANITIZADA] Edificio Antumapu",
      siteType: "Condominio Residencial Vertical / Áreas Comunes",
      region: "[REGIÓN GENÉRICA] Zona Metropolitana Poniente",
      camerasCount: 4,
      cameras: ["CAM-SYN-01 (Acceso Peatonal)", "CAM-SYN-02 (Estacionamientos)", "CAM-SYN-03 (Conserjería)", "CAM-SYN-04 (Perímetro Posterior)"],
      events: ["Movimiento en zona común", "Alerta fuera de horario", "Privacidad residencial activa", "Cámara común sin señal", "Reporte simple solicitado", "Conserje requiere ayuda"],
      risk: "Exposición accidental de datos privados de copropietarios en reportes",
      objective: "Validar Modo Conserje (EasyView), enmascaramiento de privacidad activa y reporte simple de incidentes."
    },
    consumer: {
      alias: "[LAB CONSUMER SANITIZADO] Living Test Sandbox",
      siteType: "Espacio de Laboratorio Local / Cámara Consumer",
      region: "[REGIÓN GENÉRICA] Laboratorio de Pruebas Orbi",
      camerasCount: 2,
      cameras: ["CAM-SYN-01 (Escritorio de Pruebas)", "CAM-SYN-02 (Entrada Maqueta)"],
      events: ["Cámara WiFi intermitente", "Compatibilidad pendiente", "Evento doméstico no exportable", "Privacidad privada bloqueada", "Snapshot no disponible", "Conexión autorizada pendiente"],
      risk: "Confundir sistema smart home comercial con seguridad CCTV de grado industrial operacional",
      objective: "Validar límites de integración consumer, protocolos Dahua/Eufy simplificados y advertencia de no-producción."
    }
  };

  // Pre-load default alias when selection changes
  useEffect(() => {
    setCustomAlias(syntheticProfiles[selectedType].alias);
    setCustomNotes("");
    setReviewedEvents([]);
    setSelectedDecision(null);
    setSelectedQuestion(null);
    setActiveScreen(null);
    setCurrentDay(0);
  }, [selectedType]);

  // Simulated Camera Health Panel Data (Requirement 8)
  const simulatedCameras = useMemo<SimulatedCamera[]>(() => {
    const activeProfile = syntheticProfiles[selectedType];
    return activeProfile.cameras.map((camName, idx) => {
      let status: SimulatedCamera["status"] = "OK";
      let signal = "92% (-55 dBm)";
      let connectivity = "Excelente";
      let privacy = "Enmascaramiento pasivo";
      let diagnostic = "Lente limpio, flujo H.264 constante a 15 fps.";

      if (selectedType === "field") {
        if (idx === 0) {
          status = "Intermitente";
          signal = "41% (-83 dBm)";
          connectivity = "Señal Celular Inestable";
          diagnostic = "Pérdida de paquetes detectada. Reduzca bitrate en stream secundario.";
        } else if (idx === 2) {
          status = "Revisar ubicación";
          diagnostic = "Obstrucción de follaje simulada en el ángulo perimetral superior.";
        }
      } else if (selectedType === "community") {
        if (idx === 2) {
          privacy = "Máscara de Privacidad Activa (Estricto)";
          diagnostic = "Área residencial privada oculta por software Orbi Vision Core.";
        } else if (idx === 3) {
          status = "Fuera de servicio";
          signal = "0% (Sin señal)";
          connectivity = "Desconectado";
          diagnostic = "Falta de alimentación PoE simulada. Requiere revisión física del inyector.";
        }
      } else if (selectedType === "consumer") {
        if (idx === 0) {
          status = "Intermitente";
          signal = "60% (-74 dBm)";
          connectivity = "WiFi Doméstico 2.4GHz";
          diagnostic = "Interferencia de canal WiFi. No recomendado para misiones críticas.";
        }
      }

      return {
        id: `CAM-SYN-0${idx + 1}`,
        name: camName,
        status,
        signal,
        connectivity,
        privacy,
        diagnostic
      };
    });
  }, [selectedType]);

  // Predefined Events Deck (Requirement 7)
  const syntheticEvents = useMemo<SimulatedEvent[]>(() => {
    if (selectedType === "field") {
      return [
        {
          id: "EV-FLD-01",
          title: "Cámara intermitente",
          day: 4,
          description: "La cámara CAM-SYN-01 en el cerco perimetral norte muestra caídas intermitentes de FPS debido a la degradación de la señal del router celular en terreno.",
          suggestedScreen: "Diagnóstico de CCTV",
          expectedAction: "Analizar pérdida de paquetes, cambiar a sub-stream de menor bitrate y emitir informe de enlace celular débil.",
          whatToAvoid: "No comprometer diagnóstico real ni ordenar reemplazo definitivo del hardware sin validación técnica física.",
          learning: "Los enlaces celulares rurales sufren desvanecimiento por temperatura; el software ayuda a diagnosticar de forma orientativa.",
          risk: "Pérdida temporal de detección automatizada durante las caídas de señal.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-FLD-02",
          title: "Movimiento perimetral simulado",
          day: 6,
          description: "La analítica Orbi Vision Core detecta una silueta en el cerco exterior durante el patrullaje de prueba de la tarde.",
          suggestedScreen: "Incident Center & Live Wall",
          expectedAction: "Abrir Live Wall, activar el visor térmico conceptual, evaluar la silueta y catalogar en el diario como 'Prueba de Caminata'.",
          whatToAvoid: "Evitar prometer prevención del 100% o despacho automático de fuerzas públicas de seguridad.",
          learning: "Las pruebas de caminata calibran el umbral de detección sin comprometer la operación real.",
          risk: "Fatiga del operador si el umbral está demasiado bajo.",
          relatedScreenId: "livewall"
        },
        {
          id: "EV-FLD-03",
          title: "Baja iluminación",
          day: 8,
          description: "Puesta de sol. La visibilidad de la cámara del sector de inversores cae por debajo de 5 lux sin activación de iluminadores infrarrojos.",
          suggestedScreen: "Diagnóstico & Cámara Salud",
          expectedAction: "Verificar si el switch POE de simulación entrega suficiente potencia para iluminadores o reportar obstrucción lumínica física.",
          whatToAvoid: "No ingresar credenciales SSH/Telnet del switch real en el diagnóstico.",
          learning: "La IA perimetral requiere iluminación mínima u óptica térmica infrarroja para operar de noche.",
          risk: "Zonas ciegas nocturnas por falta de iluminación externa.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-FLD-04",
          title: "Vista parcialmente obstruida",
          day: 10,
          description: "Viento fuerte del oeste desplaza una rama perimetral que se interpone frente al lente de la cámara del acceso vehicular.",
          suggestedScreen: "Live Wall / Cámara Salud",
          expectedAction: "Registrar el incidente de obstrucción de vista en la bitácora técnica de simulación.",
          whatToAvoid: "No calificar la alerta como falla de software; es una obstrucción física pericial.",
          learning: "La IA no remueve objetos físicos; la revisión humana es indispensable para mantener el perímetro despejado.",
          risk: "Pérdida de foco en la zona crítica de acceso.",
          relatedScreenId: "livewall"
        },
        {
          id: "EV-FLD-05",
          title: "Latencia de red local",
          day: 12,
          description: "El ping simulado hacia el Gateway de campo sube a 450ms debido a congestión de la red troncal interna de la planta.",
          suggestedScreen: "Diagnóstico de Red",
          expectedAction: "Correr diagnóstico sintético de Gateway, constatar latencia y sugerir canalización prioritaria de tráfico (QoS).",
          whatToAvoid: "No cambiar parámetros del router real desde el simulador.",
          learning: "La analítica perimetral local es sensible a la latencia de red; el Gateway debe aislarse de descargas pesadas.",
          risk: "Retraso en la llegada de capturas de incidentes al Live Wall.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-FLD-06",
          title: "Evento animal / no amenaza",
          day: 14,
          description: "Un animal silvestre pequeño cruza el área del cerco norte. El sistema detecta movimiento pero descarta la amenaza por patrón de tamaño.",
          suggestedScreen: "Incident Center",
          expectedAction: "Visualizar el evento catalogado como 'No Amenaza / Descarte', validando el filtrado de ruido operacional.",
          whatToAvoid: "No prometer cero falsas alarmas absolutas. El ruido de follaje u otros factores siempre requieren revisión humana.",
          learning: "El filtrado es probabilístico; se reducen las falsas alarmas operativas pero no se eliminan al 100%.",
          risk: "Falsas detecciones esporádicas de fauna local.",
          relatedScreenId: "incidents"
        }
      ];
    } else if (selectedType === "community") {
      return [
        {
          id: "EV-COM-01",
          title: "Movimiento en zona común",
          day: 4,
          description: "Detección de silueta en el sector de estacionamientos traseros a las 02:00 AM.",
          suggestedScreen: "Incidentes / Modo Conserje",
          expectedAction: "Marcar el incidente como 'Revisión Rutinaria' y comprobar el flujo rápido de notificación simple.",
          whatToAvoid: "No usar nombres reales de residentes ni números de patentes reales del condominio.",
          learning: "El Modo Conserje optimiza la atención nocturna mostrando solo alertas de alta probabilidad.",
          risk: "Confundir un residente autorizado con un intruso si no hay confirmación visual.",
          relatedScreenId: "easyview"
        },
        {
          id: "EV-COM-02",
          title: "Alerta fuera de horario",
          day: 6,
          description: "Apertura de puerta de piscina común fuera de la ventana de horario habilitada.",
          suggestedScreen: "Live Wall",
          expectedAction: "Visualizar la cámara simulada de piscina, constatar que es mantenimiento de limpieza y marcar como descartada.",
          whatToAvoid: "No prometer validez judicial automática de la grabación sin cadena de custodia externa legal.",
          learning: "Las alertas de horario detectan desviaciones operacionales útiles para la copropiedad.",
          risk: "Falsa alerta por trabajos de mantenimiento planificados no notificados.",
          relatedScreenId: "livewall"
        },
        {
          id: "EV-COM-03",
          title: "Privacidad residencial activa",
          day: 8,
          description: "La cámara perimetral trasera colinda con las ventanas del primer piso del Block C. Se activa la máscara estricta de privacidad por software.",
          suggestedScreen: "Privacidad y Seguridad",
          expectedAction: "Comprobar el difuminado virtual en el Live Wall y validar la conformidad ética con la privacidad de los residentes.",
          whatToAvoid: "No desactivar la máscara sin la debida aprobación legal de la junta de vigilancia.",
          learning: "El resguardo de privacidad es el factor clave para evitar conflictos legales con copropietarios.",
          risk: "Zona ciega perimetral inducida deliberadamente para resguardar la privacidad residencial.",
          relatedScreenId: "privacy"
        },
        {
          id: "EV-COM-04",
          title: "Cámara común sin señal",
          day: 10,
          description: "La cámara de Conserjería (CAM-SYN-03) pierde conexión debido a una desconexión accidental del cable de red en la mesa del operador.",
          suggestedScreen: "Cámaras y Gateway Salud",
          expectedAction: "Inspeccionar el estado de desconexión en el panel, sugerir reconexión física de cable RJ45.",
          whatToAvoid: "No prometer redundancia de hardware garantizada sin contrato comercial formal.",
          learning: "Las interrupciones en conserjería suelen ser físicas; el autodiagnóstico guía al conserje de forma amigable.",
          risk: "Pérdida de la visibilidad de seguridad del propio operador de conserjería.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-COM-05",
          title: "Reporte simple solicitado",
          day: 12,
          description: "El comité de administración solicita un reporte preliminar de incidencias del fin de semana para la reunión vecinal.",
          suggestedScreen: "Reportes / Workspace",
          expectedAction: "Exportar el diario de simulación sanitizado libre de PII (sin nombres ni unidades residenciales específicas).",
          whatToAvoid: "No incluir RUTs, nombres de copropietarios ni acusaciones directas de delitos.",
          learning: "Los reportes vecinales deben ser estrictamente técnicos y referenciales para evitar litigios de difamación.",
          risk: "Filtración accidental de reportes no sanitizados a chats de vecinos.",
          relatedScreenId: "evidence"
        },
        {
          id: "EV-COM-06",
          title: "Conserje requiere ayuda",
          day: 14,
          description: "El conserje de turno nocturno reporta fatiga cognitiva ante el monitoreo de múltiples cámaras tradicionales.",
          suggestedScreen: "Centro de Ayuda / Onboarding",
          expectedAction: "Guiarlo a usar EasyView (Modo Conserje) que reduce el ruido operativo y oculta los diagnósticos técnicos profundos.",
          whatToAvoid: "No dar acceso de Administrador al conserje ni dejar contraseñas anotadas.",
          learning: "La interfaz de conserje debe ser lo más limpia posible, centrándose únicamente en el botón de confirmación externa.",
          risk: "Desconfiguración técnica accidental del Gateway por parte del operador.",
          relatedScreenId: "helpcenter"
        }
      ];
    } else {
      return [
        {
          id: "EV-CON-01",
          title: "Cámara WiFi intermitente",
          day: 4,
          description: "Cámara consumer conectada por WiFi doméstico sufre interferencia por microondas u otros routers cercanos.",
          suggestedScreen: "Diagnóstico de Enlace",
          expectedAction: "Verificar RSSI conceptual, sugerir cambio de canal de router WiFi doméstico.",
          whatToAvoid: "No prometer confiabilidad de grado industrial perimetral sobre enlaces WiFi 2.4G compartidos.",
          learning: "El WiFi hogareño no cumple con estándares de seguridad operacional para perímetros industriales críticos.",
          risk: "Pérdida de señal frecuente durante horas pico de uso doméstico.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-CON-02",
          title: "Compatibilidad pendiente",
          day: 6,
          description: "Se intenta simular un sub-stream de marca genérica de bajo costo que no implementa perfil RTSP estándar (Onvif Perfil S/G).",
          suggestedScreen: "Cámaras y Gateway",
          expectedAction: "Registrar incompatibilidad conceptual del firmware del dispositivo y recomendar marcas homologadas (Dahua/Eufy/etc).",
          whatToAvoid: "No prometer compatibilidad universal automática para cualquier cámara del mercado.",
          learning: "La compatibilidad perimetral exige flujos secundarios confiables; las cámaras de bajo costo suelen bloquear flujos RTSP locales.",
          risk: "Falta absoluta de video si la cámara bloquea flujos locales.",
          relatedScreenId: "gatewaylocal"
        },
        {
          id: "EV-CON-03",
          title: "Evento doméstico no exportable",
          day: 8,
          description: "La cámara registra una mascota jugando en el jardín. El usuario presiona exportar reporte.",
          suggestedScreen: "Reporte de Evidencia",
          expectedAction: "Omitir el evento de la bitácora técnica de seguridad, ya que no corresponde a incidentes perimetrales operacionales.",
          whatToAvoid: "No exportar grabaciones de la vida privada familiar fuera de la boveda segura.",
          learning: "Los laboratorios domésticos deben separar estrictamente los eventos familiares de los incidentes de prueba de seguridad.",
          risk: "Exposición de la privacidad del hogar por compartir reportes irrelevantes.",
          relatedScreenId: "evidence"
        },
        {
          id: "EV-CON-04",
          title: "Privacidad privada bloqueada",
          day: 10,
          description: "La cámara de pruebas enfoca parcialmente el patio del vecino colindante de forma no autorizada.",
          suggestedScreen: "Privacidad y Seguridad",
          expectedAction: "Aplicar máscara de bloqueo físico o mover físicamente el ángulo de la cámara consumer de forma inmediata.",
          whatToAvoid: "No registrar video del vecino en producción ni guardarlo en almacenamiento interno.",
          learning: "Grabar propiedad privada ajena sin consentimiento infringe normativas de privacidad locales y es causal de demandas.",
          risk: "Litigio legal por invasión de privacidad vecinal.",
          relatedScreenId: "privacy"
        },
        {
          id: "EV-CON-05",
          title: "Snapshot no disponible",
          day: 12,
          description: "La cámara consumer entra en modo ahorro de energía / batería profunda y rechaza la petición de captura instantánea.",
          suggestedScreen: "Cámara Salud / Gateway",
          expectedAction: "Configurar la cámara simulada para conexión cableada permanente y desactivar modos ECO.",
          whatToAvoid: "No prometer detección 24/7 si la cámara depende de baterías recargables sin conexión directa.",
          learning: "Las cámaras de batería entran en reposo profundo; el monitoreo perimetral activo exige energía cableada ininterrumpida.",
          risk: "Falta de detección de intrusiones durante los ciclos de reposo de la batería.",
          relatedScreenId: "diagnostics"
        },
        {
          id: "EV-CON-06",
          title: "Conexión autorizada pendiente",
          day: 14,
          description: "El propietario de la cuenta consumer de pruebas no ha aceptado el consentimiento de validación humana para el piloto local.",
          suggestedScreen: "Workspace / Acuerdo",
          expectedAction: "Validar que la simulación se encuentre en modo 'Bloqueado' hasta que se firme electrónicamente el consentimiento.",
          whatToAvoid: "No iniciar ninguna visualización sin el consentimiento ético y legal expreso firmado.",
          learning: "La autorización de acceso es el paso cero del compliance ético; nunca se asume la aprobación del cliente.",
          risk: "Despliegue ilegal sin consentimiento, riesgo de multas regulatorias.",
          relatedScreenId: "customerpilotworkspace"
        }
      ];
    }
  }, [selectedType]);

  // Current event active for the current day
  const activeEvent = useMemo(() => {
    return syntheticEvents.find(ev => ev.day === currentDay) || null;
  }, [syntheticEvents, currentDay]);

  // Simulator Decision Points (Requirement 10)
  const decisionPoints: DecisionPoint[] = [
    {
      id: "DEC-01",
      title: "¿Continuar con el alcance actual de 2 cámaras de prueba?",
      consequence: "Se mantiene el piloto controlado acotado a zonas comunes de simulación, minimizando riesgos regulatorios y de ancho de banda celular.",
      recommendation: "Es la vía más recomendada para un aprendizaje inicial seguro sin compromisos contractuales amplios.",
      whatToAvoid: "Evitar escalar el piloto a todo el condominio o planta antes de estabilizar la conexión de simulación preliminar.",
      nextStep: "Confirmar viabilidad técnica en la bitácora."
    },
    {
      id: "DEC-02",
      title: "¿Reducir cantidad de cámaras por enlaces débiles?",
      consequence: "Se libera ancho de banda del router de prueba, logrando streams más fluidos a costa de menor cobertura del perímetro secundario.",
      recommendation: "Recomendado si el RSSI en CAM-SYN-01 se mantiene por debajo de -80 dBm.",
      whatToAvoid: "No prometer detección perimetral total si se retiran cámaras de zonas críticas.",
      nextStep: "Ajustar propuesta técnica a 1 sola cámara de laboratorio."
    },
    {
      id: "DEC-03",
      title: "¿Mover evento intermitente a diagnóstico prioritario?",
      consequence: "El sistema detiene alertas molestas de caída de conexión y enfoca la atención técnica en la estabilización de red física.",
      recommendation: "Ideal para evitar fatiga cognitiva del operador de conserjería.",
      whatToAvoid: "No ignorar la caída física; reprogramar el mantenimiento local con el proveedor autorizado.",
      nextStep: "Escalar caso técnico al canal autorizado."
    },
    {
      id: "DEC-04",
      title: "¿Bloquear reporte de piloto por sospecha de datos sensibles?",
      consequence: "La herramienta inhabilita la exportación temporalmente y obliga al operador a borrar cualquier IP o correo real ingresado.",
      recommendation: "Recomendado de manera estricta para garantizar conformidad con la Ley 19.628 de protección de datos.",
      whatToAvoid: "No ignorar las advertencias del escáner dinámico.",
      nextStep: "Aplicar sanitización de notas de inmediato."
    },
    {
      id: "DEC-05",
      title: "¿Escalar problemas de conexión local al canal autorizado?",
      consequence: "Se activa la revisión comercial y técnica por el equipo oficial Orbi sin intervenir redes del recinto.",
      recommendation: "Es la decisión más responsable y segura; evita responsabilidades por desconfiguración.",
      whatToAvoid: "No manipular switches PoE ni cableados troncales del cliente sin supervisión autorizada.",
      nextStep: "Registrar solicitud de soporte formal."
    },
    {
      id: "DEC-06",
      title: "¿Solicitar confirmación externa antes de configurar?",
      consequence: "Garantiza que el comité residencial o jefe de seguridad industrial asuma la responsabilidad de las zonas de visibilidad del piloto.",
      recommendation: "Obligatorio antes de encender cualquier stream de simulación.",
      whatToAvoid: "No confiar en acuerdos verbales sin registro escrito en el binder sanitizado.",
      nextStep: "Enviar propuesta sanitizada para firma."
    },
    {
      id: "DEC-07",
      title: "¿Cerrar piloto con aprendizaje técnico suficiente?",
      consequence: "Se da por concluido el ciclo de pruebas sintéticas de 15 días, generando la bitácora de aprendizajes sin compromisos productivos permanentes.",
      recommendation: "Recomendado si todas las metas de simulación fueron revisadas.",
      whatToAvoid: "No prometer continuidad automatizada del servicio en producción real tras el término.",
      nextStep: "Descargar informe de cierre sanitizado."
    }
  ];

  // Stakeholder Question Simulator (Requirement 11)
  const stakeholderQuestions: StakeholderQuestion[] = [
    {
      id: "Q-01",
      question: "¿Esto funciona con nuestras cámaras reales?",
      answer: "Sí, de forma conceptual, siempre que soporten streams secundarios H.264 estandarizados por protocolo RTSP. Sin embargo, para este piloto controlado de ensayo operamos estrictamente con video simulado para evitar la exposición de credenciales.",
      supportScreen: "Cámaras y Gateway",
      limitToCommunicate: "La compatibilidad depende de la infraestructura física del recinto y no se garantiza de forma universal sin auditoría física pericial.",
      nextStep: "Invitar al cliente a revisar la matriz de compatibilidad teórica."
    },
    {
      id: "Q-02",
      question: "¿Puede conectarse al NVR actual?",
      answer: "La analítica Orbi toma sub-streams independientes del canal secundario para no interferir con la grabación principal del NVR residencial o industrial. El NVR sigue grabando de forma autónoma sin verse afectado.",
      supportScreen: "Gateway Local",
      limitToCommunicate: "No reemplazamos la grabación del NVR, no intervenimos la red troncal de videovigilancia existente ni garantizamos la integración física.",
      nextStep: "Recomendar instalación de Gateway independiente de simulación."
    },
    {
      id: "Q-03",
      question: "¿Detecta robos automáticamente?",
      answer: "No de forma infalible. El motor Orbi Vision Core asiste al operador detectando siluetas y anomalías operacionales de forma referencial. No reemplaza en ningún caso la decisión humana, la labor de conserjería ni la supervisión de guardias físicos autorizados.",
      supportScreen: "Incidentes",
      limitToCommunicate: "Detección probabilística orientativa. No se promete prevención total del 100%, inmunidad legal ni sustitución de vigilantes presenciales.",
      nextStep: "Recordar el principio de validación humana obligatoria."
    },
    {
      id: "Q-04",
      question: "¿Se puede usar en producción?",
      answer: "No. Esta versión es un sandbox de simulación técnica diseñado exclusivamente para demostración y evaluación de pilotos controlados. El despliegue en producción real está bloqueado contractualmente en este hito.",
      supportScreen: "Release Candidate Center",
      limitToCommunicate: "La versión actual está clasificada como 'Production Locked' para resguardo del cliente.",
      nextStep: "Revisar los sellos del Release Candidate."
    },
    {
      id: "Q-05",
      question: "¿Qué pasa con la privacidad?",
      answer: "Implementamos políticas estrictas de privacidad ética. En la demo controlada se sanitizan los datos perimetrales y se aplican máscaras de privacidad por software para ocultar áreas residenciales privadas o rostros de copropietarios.",
      supportScreen: "Privacidad y Seguridad",
      limitToCommunicate: "La privacidad residencial es obligatoria y limita la cobertura perimetral en zonas colindantes de copropiedad vertical.",
      nextStep: "Mostrar el panel de máscara de privacidad del simulador."
    },
    {
      id: "Q-06",
      question: "¿Quién autoriza el acceso a cámaras?",
      answer: "Únicamente el representante legal del recinto mediante consentimiento formal firmado. El técnico u operador de Orbi no tiene facultades para acceder de forma autónoma ni almacenar claves de acceso del condominio o planta solar.",
      supportScreen: "Workspace / Acuerdo",
      limitToCommunicate: "No se guardan credenciales, tokens ni claves de stream en la base de datos de simulación.",
      nextStep: "Comprobar el checklist de resguardo ético."
    },
    {
      id: "Q-07",
      question: "¿Qué necesita el proveedor CCTV?",
      answer: "Habilitar una sub-red física sanitizada aislada del tráfico administrativo del condominio, y entregar un usuario técnico de lectura sin privilegios de administración ni acceso a otras redes.",
      supportScreen: "Gateway Local",
      limitToCommunicate: "El cliente debe gestionar la configuración de su red y router con su proveedor CCTV externo autorizado.",
      nextStep: "Exportar el instructivo de preparación de sub-streams."
    },
    {
      id: "Q-08",
      question: "¿Qué entrega el piloto?",
      answer: "Un informe sanitizado de aprendizajes operacionales, evaluando la latencia de red, la fatiga del conserje, las alertas por sombras y el cumplimiento del checklist ético, preparando el camino para futuras evaluaciones comerciales.",
      supportScreen: "Reportes",
      limitToCommunicate: "El piloto entrega aprendizaje técnico referencial; no constituye una certificación de seguridad ni un ROI financiero garantizado por contrato.",
      nextStep: "Generar el informe unificado simulado."
    }
  ];

  // 3. Simulator Scanner Logic (Requirement 12)
  const scannerResult = useMemo(() => {
    const textsToScan = [
      customAlias,
      customNotes,
      selectedDecision ? decisionPoints.find(d => d.id === selectedDecision)?.title : "",
      selectedQuestion ? stakeholderQuestions.find(q => q.id === selectedQuestion)?.question : ""
    ].join(" ");

    const findings: string[] = [];

    // Email Check
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(textsToScan)) {
      findings.push("Correo electrónico real detectado (PII).");
    }

    // Phone Check
    const phoneMatches = textsToScan.match(/\+?[0-9]{8,15}/g);
    if (phoneMatches && phoneMatches.length > 0) {
      findings.push("Número telefónico potencialmente real detectado.");
    }

    // IP Check
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    if (ipRegex.test(textsToScan)) {
      findings.push("Dirección IP física detectada (riesgo de exposición).");
    }

    // RTSP Check
    const rtspRegex = /rtsp:\/\//i;
    if (rtspRegex.test(textsToScan)) {
      findings.push("Protocolo RTSP explícito expuesto.");
    }

    // Credentials
    const credentialsRegex = /password|passwd|contraseña|contrasena|clave\s+\w+|token|secret|key/i;
    if (credentialsRegex.test(textsToScan)) {
      findings.push("Términos de credenciales o claves privadas ingresados.");
    }

    // Coordinates
    const coordsRegex = /\b-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+\b/;
    if (coordsRegex.test(textsToScan)) {
      findings.push("Coordenadas geográficas exactas GPS detectadas.");
    }

    // Legal / Claims Absolute
    const absoluteClaimsRegex = /garantizado|garantía|certificado|certificación|acreditación|producción lista|production-ready|infalible|reemplazo definitivo|cero fallas|cero falsas alarmas|detección perfecta|prevención total|uncompromised|full compliance|cumplimiento legal|retorno asegurado|ahorro garantizado|beneficio económico confirmado|ROI garantizado|15s|24\/7/i;
    if (absoluteClaimsRegex.test(textsToScan)) {
      findings.push("Terminología de garantía comercial, reclamación absoluta o certificación legal.");
    }

    // Specific PII Names
    const piiNameRegex = /RUT|DNI|identidad|R.U.T./i;
    if (piiNameRegex.test(textsToScan)) {
      findings.push("Identificadores personales/fiscales (RUT/DNI) ingresados.");
    }

    return {
      clean: findings.length === 0,
      findings
    };
  }, [customAlias, customNotes, selectedDecision, selectedQuestion]);

  // Overall Simulator Status (Requirement 3 & Módulo 14D)
  const overallState = useMemo(() => {
    // Critical safety checks
    const criticalChecksOk = safetyChecklist.noCredentials &&
                              safetyChecklist.noIpRtsp &&
                              safetyChecklist.sanitizedDataOnly &&
                              safetyChecklist.controlledPilot; // no real customers

    if (!criticalChecksOk) {
      return "Simulation Blocked";
    }

    if (!scannerResult.clean) {
      return "Simulation Needs Sanitization";
    }

    if (isSimulationLocked) {
      return "CUSTOMER PILOT SIMULATOR LOCKED";
    }

    if (simulationNeedsReview) {
      return "Needs Review";
    }

    return "Simulator Ready";
  }, [safetyChecklist, scannerResult, isSimulationLocked, simulationNeedsReview]);

  // Update objectives checked automatically
  useEffect(() => {
    const updated = { ...objectivesChecked };
    updated.eventsReviewed = reviewedEvents.length >= 3;
    updated.risksCommunicated = reviewedEvents.includes("EV-FLD-01") || reviewedEvents.includes("EV-FLD-03") || reviewedEvents.includes("EV-COM-03") || reviewedEvents.includes("EV-CON-01") || reviewedEvents.includes("EV-CON-04");
    updated.adminScope = selectedType !== undefined;
    updated.techLimits = selectedDecision !== null;
    updated.nextStepDefined = selectedQuestion !== null;
    setObjectivesChecked(updated);
  }, [reviewedEvents, selectedDecision, selectedQuestion, selectedType]);

  // Copiable report text (Requirement 13)
  const reportContent = useMemo(() => {
    const activeProfile = syntheticProfiles[selectedType];
    const reviewedEventDetails = syntheticEvents
      .filter(ev => reviewedEvents.includes(ev.id))
      .map(ev => `- [x] Día ${ev.day}: ${ev.title} (Revisado)`)
      .join("\n") || "- Ninguno marcado como revisado aún.";

    return `===========================================================
ORBI SENTINEL IA - SYNTHETIC PILOT SIMULATION REPORT
===========================================================
Identificador de Ensayo: SIM-CPW-${Date.now().toString().slice(-6)}
Fecha de Simulación: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.14.3-sentinel-customer-pilot-simulator-lock
Estado del Simulador: ${overallState.toUpperCase()}
Frente Tecnológico Ensaye: ${selectedType.toUpperCase()}
Alias Sintético de Sitio: ${customAlias}
Tipo de Recinto: ${activeProfile.siteType}
Región de Ensayo: ${activeProfile.region}

Checklist de Seguridad de Simulación (Badges):
- No Real Data: ${safetyChecklist.sanitizedDataOnly ? "OK" : "RESTRINGIDO"}
- No Credentials: ${safetyChecklist.noCredentials ? "OK" : "RESTRINGIDO"}
- No IP/RTSP: ${safetyChecklist.noIpRtsp ? "OK" : "RESTRINGIDO"}
- No Real Customers: ${safetyChecklist.controlledPilot ? "OK" : "RESTRINGIDO"}

Objetivos de Aprendizaje Logrados:
${Object.entries(objectivesChecked)
  .map(([key, value]) => `- ${key}: ${value ? "CUMPLIDO" : "PENDIENTE"}`)
  .join("\n")}

Cámaras Sintéticas Configuradas:
${simulatedCameras.map(c => `- ${c.name}: Estado ${c.status} | Señal: ${c.signal} | Privacidad: ${c.privacy}`).join("\n")}

Eventos Sintéticos Auditados y Ensayados:
${reviewedEventDetails}

Decisión Tomada:
${selectedDecision ? `${decisionPoints.find(d => d.id === selectedDecision)?.title}\nConsecuencia: ${decisionPoints.find(d => d.id === selectedDecision)?.consequence}` : "Ninguna seleccionada en esta sesión."}

Pregunta Frecuente Practicada:
${selectedQuestion ? `Stakeholder: ${stakeholderQuestions.find(q => q.id === selectedQuestion)?.question}\nRespuesta Comunicada: ${stakeholderQuestions.find(q => q.id === selectedQuestion)?.answer}` : "Ninguna seleccionada en esta sesión."}

Límites Técnicos Comunicados al Cliente:
- No se garantiza detección perimetral al 100% ni se promete cero falsas alarmas absolutas.
- El piloto es una demostración referencial no vinculante que no sustituye a guardias ni conserjes físicos.
- No se expone ni almacena información real del recinto, credenciales, ni flujos RTSP.

Notas Adicionales del Simulador:
${customNotes || "Sin anotaciones complementarias."}

===========================================================
COMPROMISO DE CONFORMIDAD ÉTICA Y VALOR DE PILOTO CONTROLADO
ORBI-SENTINEL-CUSTOMER-PILOT-SIMULATION-v0.14.3
===========================================================
Este reporte usa escenarios sintéticos y es solo apoyo interno para preparar una demo o piloto controlado. No representa aprobación contractual, validación legal, despliegue productivo ni resultado garantizado.`;
  }, [selectedType, currentDay, customAlias, customNotes, reviewedEvents, selectedDecision, selectedQuestion, safetyChecklist, objectivesChecked, simulatedCameras, overallState]);

  // Handle Event review toggle
  const handleToggleReviewEvent = (eventId: string) => {
    setReviewedEvents(prev => {
      const isReviewed = prev.includes(eventId);
      const next = isReviewed ? prev.filter(id => id !== eventId) : [...prev, eventId];
      onAddAuditLog(
        isReviewed ? "Desmarcar Evento Sintético" : "Revisar Evento Sintético",
        `Evento: ${eventId}, Tipo: ${selectedType}`
      );
      return next;
    });
  };

  // Toggle badge click
  const toggleSafetyBadge = (badgeKey: keyof typeof safetyChecklist) => {
    setSafetyChecklist(prev => {
      const next = { ...prev, [badgeKey]: !prev[badgeKey] };
      onAddAuditLog(
        "Modificar Badge de Seguridad Simulador",
        `Badge: ${String(badgeKey)}, Estado: ${next[badgeKey]}`
      );
      return next;
    });
  };

  // Handle Save Simulation History (Requirement 14)
  const handleSaveSimulation = () => {
    if (overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization") {
      return;
    }

    const newItem: HistoryItem = {
      date: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0],
      type: selectedType,
      alias: customAlias,
      eventsCount: reviewedEvents.length,
      decisionsCount: selectedDecision ? 1 : 0,
      state: overallState,
      nextStep: selectedDecision ? decisionPoints.find(d => d.id === selectedDecision)?.nextStep || "Próximo paso genérico" : "Ajustes de simulación"
    };

    const nextHistory = [newItem, ...simulationHistory].slice(0, 10); // cap at 10 items
    setSimulationHistory(nextHistory);
    localStorage.setItem("orbi_sentinel_simulation_history", JSON.stringify(nextHistory));
    onAddAuditLog(
      "Guardar Simulación Historial Local",
      `Frente: ${selectedType}, Alias: ${customAlias}`
    );

    // Mark Report generated in objectives
    setObjectivesChecked(prev => ({ ...prev, reportGenerated: true }));
  };

  // Handle Clear Simulation History
  const handleClearHistory = () => {
    setSimulationHistory([]);
    localStorage.removeItem("orbi_sentinel_simulation_history");
    onAddAuditLog("Limpiar Historial de Simulador", "Se eliminó el registro de simulaciones locales.");
  };

  // Copy report to clipboard
  const handleCopyToClipboard = () => {
    if (overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization") {
      return;
    }
    navigator.clipboard.writeText(reportContent);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    onAddAuditLog(
      "Copiar Reporte Sintético a Portapapeles",
      `Frente simulado: ${selectedType}`
    );
  };

  // Navigate to related app screen mockup inside the simulator
  const handleOpenRelatedScreen = (screenId: string) => {
    setActiveScreen(screenId);
    onAddAuditLog(
      "Abrir Pantalla Relacionada Simulador",
      `Pantalla abierta: ${screenId}`
    );
  };

  return (
    <div className="space-y-6" id="customer-pilot-simulator-root">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
              Módulo 14C
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest">
              Laboratorio de Ensayos Sintéticos
            </span>
          </div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight mt-1">
            Customer Pilot Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Valide alcances, examine eventos simulados de terreno y entrene respuestas responsables ante stakeholders utilizando únicamente escenarios ficticios sanitizados sin exponer contraseñas ni credenciales reales.
          </p>
        </div>

         {/* Action Controls & Simulator Status */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5 shadow-md">
            <div className={`w-2.5 h-2.5 rounded-full ${
              overallState === "Simulation Blocked" ? "bg-rose-500 animate-pulse" :
              overallState === "Simulation Needs Sanitization" ? "bg-amber-500 animate-pulse" :
              overallState === "CUSTOMER PILOT SIMULATOR LOCKED" ? "bg-emerald-500 ring-4 ring-emerald-500/20" :
              overallState === "Needs Review" ? "bg-blue-500 animate-pulse" :
              "bg-cyan-500"
            }`} />
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block leading-none">Status del Simulador</span>
              <span className={`text-xs font-mono font-bold uppercase ${
                overallState === "Simulation Blocked" ? "text-rose-400 animate-pulse" :
                overallState === "Simulation Needs Sanitization" ? "text-amber-400" :
                overallState === "CUSTOMER PILOT SIMULATOR LOCKED" ? "text-emerald-400 font-extrabold" :
                overallState === "Needs Review" ? "text-blue-400" :
                "text-cyan-400"
              }`}>
                {overallState}
              </span>
            </div>
          </div>

          {setCurrentTab && (
            <button
              onClick={() => {
                setCurrentTab("customerpilotworkspace");
                onAddAuditLog("Volver al Workspace desde Simulador", "Operador presionó botón Volver.");
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* BLOQUE 14 — CUSTOMER PILOT SUITE STATUS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
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

      {/* 3. SAFETY & SANITIZATION BANNER (Requirement 3) */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none rounded-tr-2xl"></div>
        <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 animate-bounce" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">
                Simulador de piloto sintético — use solo escenarios ficticios
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No ingrese clientes reales, direcciones, IP/RTSP, credenciales, contratos, cámaras privadas ni datos sensibles. Esta herramienta opera con plantillas ficticias y datos sintéticos estructurados para resguardar la seguridad del software en el preview.
            </p>
          </div>

          {/* Interactive Badges Grid */}
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {[
              { id: "sanitizedDataOnly", label: "Synthetic Pilot", icon: Shield, critical: true },
              { id: "noRealData", label: "No Real Data", icon: ShieldCheck, critical: true, key: "sanitizedDataOnly" },
              { id: "noCredentials", label: "No Credentials", icon: Lock, critical: true },
              { id: "noIpRtsp", label: "No IP/RTSP", icon: LockKeyhole, critical: true },
              { id: "noRealContracts", label: "No Real Contracts", icon: FileText, critical: false },
              { id: "controlledPilot", label: "No Real Customers", icon: Users, critical: true },
              { id: "limitedScope", label: "Controlled Demo", icon: Sliders, critical: false },
              { id: "externalAuthRequired", label: "Human Validation", icon: AlertTriangle, critical: false },
              { id: "homePreserved", label: "Home Preserved", icon: Home, critical: false }
            ].map((badge) => {
              const stateKey = (badge.key || badge.id) as keyof typeof safetyChecklist;
              const active = safetyChecklist[stateKey];
              const BadgeIcon = badge.icon;
              return (
                <button
                  key={badge.id}
                  onClick={() => toggleSafetyBadge(stateKey)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                    active
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15"
                  }`}
                  title={`${badge.label}: Haga clic para alternar de forma segura`}
                >
                  <BadgeIcon className="w-3 h-3 shrink-0" />
                  <span>{badge.label}</span>
                  {badge.critical && <span className="text-[8px] text-rose-400 font-bold">*</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulation Blocked Alert */}
        {overallState === "Simulation Blocked" && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-300 animate-pulse text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px]">Simulation Blocked — Acción Correctiva Requerida:</p>
              <p className="mt-0.5">Se han desactivado controles de seguridad fundamentales (Badges críticos marcados con *). Active nuevamente los badges de seguridad obligatorios de la simulación para habilitar la generación de reportes y pruebas sintéticas.</p>
            </div>
          </div>
        )}

        {/* Simulation Needs Sanitization Alert */}
        {overallState === "Simulation Needs Sanitization" && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px]">Simulation Needs Sanitization — Detección Activa del Scanner:</p>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {scannerResult.findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
              <p className="mt-1 text-slate-400">Por favor remueva nombres reales, direcciones IP, correos electrónicos, flujos RTSP o términos contractuales absolutos para habilitar el reporte.</p>
            </div>
          </div>
        )}
      </div>

      {/* MAIN TWO COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PARAMETERS, SCANNER, OBJECTIVES */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SIMULATION SELECTOR & PREDEFINED PROFILE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Frentes de Simulación Sintética</span>
            </h3>

            {/* Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl">
              {(["field", "community", "consumer"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    onAddAuditLog("Cambiar Tipo de Simulación Sintética", `Tipo seleccionado: ${type}`);
                  }}
                  className={`py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide transition-all ${
                    selectedType === type
                      ? "bg-slate-900 text-emerald-400 border border-slate-850 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {type === "field" ? "🏭 Field" : type === "community" ? "🏢 Comm" : "🏠 Consumer"}
                </button>
              ))}
            </div>

            {/* Profile Summary Card */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Alias de Simulación Sanitizado:</span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 focus:ring-0 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  placeholder="Ingrese alias ficticio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Tipo de Recinto</span>
                  <span className="font-semibold text-slate-300">{syntheticProfiles[selectedType].siteType}</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-xl space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Región Asignada</span>
                  <span className="font-semibold text-slate-300">{syntheticProfiles[selectedType].region}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/30 border border-slate-850/60 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">Objetivo del Piloto:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans italic">
                  "{syntheticProfiles[selectedType].objective}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-rose-400 font-bold block uppercase tracking-wider">Límitante de Riesgo Esperado:</span>
                <p className="text-slate-300 text-[11px] font-sans leading-normal">
                  ⚠ {syntheticProfiles[selectedType].risk}
                </p>
              </div>
            </div>
          </div>

          {/* SIMULATOR LIVE SCANNER & CUSTOM NOTES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>Consola de Notas del Piloto</span>
              </h3>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                scannerResult.clean ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              }`}>
                {scannerResult.clean ? "No PII/Secrets" : "Violaciones"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Registre notas del simulador. El escáner interceptará contraseñas, IPs, correos, RTSP o terminología absoluta de garantía.
            </p>

            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-emerald-500/40 focus:ring-0 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-650"
              placeholder="Escriba comentarios para el reporte. Evite ingresar IPs o credenciales..."
            />

            {/* Test buttons to trigger scanner for showcase */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCustomNotes("Contacto comercial de prueba: soporte@orbi.cl")}
                className="px-2 py-1 bg-slate-950/60 hover:bg-slate-950 text-[9px] font-mono text-slate-400 hover:text-slate-300 border border-slate-850 rounded"
              >
                Insertar Email (PII)
              </button>
              <button
                onClick={() => setCustomNotes("Servidor de simulación local en 192.168.100.15")}
                className="px-2 py-1 bg-slate-950/60 hover:bg-slate-950 text-[9px] font-mono text-slate-400 hover:text-slate-300 border border-slate-850 rounded"
              >
                Insertar IP
              </button>
              <button
                onClick={() => setCustomNotes("El sistema ofrece detección perfecta y cero falsas alarmas operacionales.")}
                className="px-2 py-1 bg-slate-950/60 hover:bg-slate-950 text-[9px] font-mono text-slate-400 hover:text-slate-300 border border-slate-850 rounded"
              >
                Insertar Absoluto (Fallas)
              </button>
              <button
                onClick={() => setCustomNotes("")}
                className="px-2 py-1 bg-rose-950/30 hover:bg-rose-950/50 text-[9px] font-mono text-rose-400 border border-rose-900/40 rounded ml-auto"
              >
                Limpiar Notas
              </button>
            </div>
          </div>

          {/* OBJECTIVES CHECKLIST (Requirement 9) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Objetivos Internos de Aprendizaje</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { id: "home", label: "Operador entiende Home premium de 8 tarjetas" },
                { id: "adminScope", label: "Administrador entiende alcance sintético" },
                { id: "techLimits", label: "Técnico entiende límites de conectividad" },
                { id: "conserjeFlow", label: "Conserje entiende visualización simple" },
                { id: "eventsReviewed", label: "Incidentes sintéticos del piloto revisados (mínimo 3)" },
                { id: "reportGenerated", label: "Reporte de simulación sanitizado guardado" },
                { id: "risksCommunicated", label: "Riesgos locales de enlaces comunicados" },
                { id: "authRemembered", label: "Autorización externa y resguardo ético recordados" },
                { id: "nextStepDefined", label: "Próximo paso y límites con stakeholder practicados" }
              ].map((obj) => (
                <label
                  key={obj.id}
                  className="flex items-start gap-2.5 p-1.5 hover:bg-slate-950/40 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={objectivesChecked[obj.id]}
                    onChange={() => {
                      const nextVal = !objectivesChecked[obj.id];
                      setObjectivesChecked(prev => ({ ...prev, [obj.id]: nextVal }));
                      onAddAuditLog("Alternar Objetivo de Aprendizaje Simulador", `Objetivo: ${obj.id}, Seteado a: ${nextVal}`);
                    }}
                    className="mt-0.5 rounded text-emerald-500 bg-slate-950 border-slate-850 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span className={`text-[11px] leading-normal ${objectivesChecked[obj.id] ? "text-slate-400 line-through" : "text-slate-200"}`}>
                    {obj.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* CUSTOMER PILOT SIMULATOR QA LOCK & CONTROLS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>QA Lock & Controls</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider">Estado de Verificación:</span>
                
                {isSimulationLocked ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>CUSTOMER PILOT SIMULATOR LOCKED</span>
                  </div>
                ) : simulationNeedsReview ? (
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>SITUACIÓN: Needs Review</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold bg-cyan-500/10 px-2 py-1.5 rounded-lg border border-cyan-500/20">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>SITUACIÓN: Simulator Ready</span>
                  </div>
                )}
                
                <p className="text-[11px] text-slate-400 leading-normal">
                  Este panel de control permite congelar el simulador en modo seguro. El bloqueo desactiva modificaciones accidentales de parámetros para asegurar una validación interna técnica óptima.
                </p>
              </div>

              {/* Action Buttons for Admin and Técnico */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    const nextLockState = !isSimulationLocked;
                    setIsSimulationLocked(nextLockState);
                    if (nextLockState) {
                      setSimulationNeedsReview(false);
                    }
                    onAddAuditLog(
                      nextLockState ? "Activar Bloqueo de Simulador (QA Lock)" : "Desactivar Bloqueo de Simulador",
                      `Bloqueo seteado a: ${nextLockState}`
                    );
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                    isSimulationLocked
                      ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                  }`}
                >
                  {isSimulationLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>DESBLOQUEAR SIMULADOR</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>BLOQUEAR SIMULADOR (LOCK)</span>
                    </>
                  )}
                </button>

                {!isSimulationLocked && (
                  <button
                    onClick={() => {
                      const nextReviewState = !simulationNeedsReview;
                      setSimulationNeedsReview(nextReviewState);
                      onAddAuditLog(
                        "Alternar Estado Needs Review",
                        `Needs Review seteado a: ${nextReviewState}`
                      );
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                      simulationNeedsReview
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                        : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{simulationNeedsReview ? "QUITAR ESTADO REVISIÓN" : "MARCAR: NEEDS REVIEW"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* CENTER/RIGHT COLUMN: SCENARIO TIMELINE, HEALTH PANEL, EVENTS, QUESTIONS, DECISIONS */}
        <div className="lg:col-span-8 space-y-6">

          {/* TIMELINE SIMULATOR (Requirement 6) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Scenario Timeline Simulator (Piloto 15 Días)</span>
              </h3>
              <div className="flex gap-1">
                {( [0, 1, 4, 8, 12, 15] as const ).map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setCurrentDay(day);
                      onAddAuditLog("Saltar a Día de Simulación", `Día seleccionado: ${day}`);
                    }}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded ${
                      currentDay === day
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-850"
                    }`}
                  >
                    D{day}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Progress Line */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Progreso Ficticio del Piloto</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">Día {currentDay} / 15</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-950 border border-slate-850">
                <div
                  style={{ width: `${(currentDay / 15) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-300"
                ></div>
              </div>

              {/* Day Details Card */}
              <div className="mt-3 p-3.5 bg-slate-950/70 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-3 text-center md:text-left">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">Fase del Piloto</span>
                  <span className="text-sm font-bold text-white block">
                    {currentDay === 0 ? "Día 0: Preparación" :
                     currentDay === 1 ? "Día 1: Alcance" :
                     currentDay >= 2 && currentDay <= 3 ? "Día 2-3: Lab Ficticio" :
                     currentDay >= 4 && currentDay <= 7 ? "Día 4-7: Observación" :
                     currentDay >= 8 && currentDay <= 12 ? "Día 8-12: Incidentes" :
                     "Día 13-15: Cierre Técnico"}
                  </span>
                </div>

                <div className="md:col-span-6 text-xs text-slate-300 leading-relaxed font-sans">
                  {currentDay === 0 && "Se recopila la información del entorno sintético. Es el momento de calibrar la boveda de resguardo y verificar los 12 factores de autorización."}
                  {currentDay === 1 && "Se valida el perfil del sitio libre de PII con los stakeholders. Se limita la simulación a cámaras específicas de bajo espectro de riesgo."}
                  {currentDay >= 2 && currentDay <= 3 && "Configuración local ficticia de sub-streams. Se simulan topologías Dahua/Eufy de bajo ancho de banda sin passwords reales."}
                  {currentDay >= 4 && currentDay <= 7 && "Ventana de observación crítica. Comienzan las alertas simuladas en caliente para evaluar fatiga y tiempo de reacción del operador."}
                  {currentDay >= 8 && currentDay <= 12 && "Auditoría de incidentes y calibración fina. Se ensayan descartes y ajustes de máscaras de privacidad residencial por software."}
                  {currentDay >= 13 && currentDay <= 15 && "Se consolida el reporte copiable de piloto controlando los límites. El aprendizaje técnico sirve como puente para discusiones comerciales."}
                </div>

                {/* Timeline Interactive Nav */}
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (currentDay > 0) {
                        setCurrentDay(prev => prev - 1);
                        onAddAuditLog("Día Anterior Simulación", `Navegación al día ${currentDay - 1}`);
                      }
                    }}
                    disabled={currentDay === 0}
                    className="p-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950/40 border border-slate-850 text-slate-300 disabled:text-slate-600 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (currentDay < 15) {
                        setCurrentDay(prev => prev + 1);
                        onAddAuditLog("Día Siguiente Simulación", `Navegación al día ${currentDay + 1}`);
                      }
                    }}
                    disabled={currentDay === 15}
                    className="p-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950/40 border border-slate-850 text-slate-300 disabled:text-slate-600 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentDay(0);
                      setReviewedEvents([]);
                      setSelectedDecision(null);
                      setSelectedQuestion(null);
                      setActiveScreen(null);
                      onAddAuditLog("Reiniciar Simulación Completa", "Se restableció el estado del simulador.");
                    }}
                    className="p-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 text-rose-400 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-mono font-bold"
                    title="Reiniciar Simulación"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SYNTHETIC EVENT DECK (Requirement 7) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Synthetic Event Deck (Simulación Activa)</span>
            </h3>

            {activeEvent ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2.5 py-1 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl text-[9px] font-mono text-emerald-400 font-bold">
                  EVENTO DÍA {activeEvent.day}
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {activeEvent.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {activeEvent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">Acción Sugerida / Esperada</span>
                    <p className="text-slate-300 leading-normal">{activeEvent.expectedAction}</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-rose-400 font-bold block uppercase">Qué Evitar en el Acuerdo</span>
                    <p className="text-slate-300 leading-normal">{activeEvent.whatToAvoid}</p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-xs space-y-0.5">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block uppercase">Mitigación de Riesgos Clave</span>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Riesgo:</strong> {activeEvent.risk} <br />
                    <strong>Aprendizaje:</strong> {activeEvent.learning}
                  </p>
                </div>

                {/* Event Actions */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900 justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500">
                    Pantalla Recomendada: <strong className="text-slate-300">{activeEvent.suggestedScreen}</strong>
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenRelatedScreen(activeEvent.relatedScreenId)}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Ver Pantalla Diagnóstico</span>
                    </button>

                    <button
                      onClick={() => handleToggleReviewEvent(activeEvent.id)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                        reviewedEvents.includes(activeEvent.id)
                          ? "bg-slate-800 border border-slate-700 text-slate-400"
                          : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                      }`}
                    >
                      {reviewedEvents.includes(activeEvent.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Revisado ✓</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Marcar como Revisado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                <p>No hay eventos programados en caliente para el <strong>Día {currentDay}</strong> de simulación.</p>
                <p className="text-slate-600 text-[10px] mt-1">Avance la timeline a los días 4, 6, 8, 10, 12 o 14 para gatillar eventos de la plantilla.</p>
              </div>
            )}

            {/* List of all events in the deck */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Todos los Eventos de la Plantilla ({syntheticEvents.length}):</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {syntheticEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setCurrentDay(ev.day);
                      onAddAuditLog("Seleccionar Evento desde Lista", `ID Evento: ${ev.id}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      currentDay === ev.day
                        ? "bg-slate-950 border-emerald-500/40 text-white"
                        : "bg-slate-950/50 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-[10px] text-slate-500 font-mono">Día {ev.day}</span>
                      <span className={`w-2 h-2 rounded-full ${reviewedEvents.includes(ev.id) ? "bg-emerald-400" : "bg-slate-650"}`} />
                    </div>
                    <p className="font-bold text-[11px] truncate mt-1 text-slate-200">{ev.title}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{ev.suggestedScreen}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIMULATED HARDWARE & CAMERA HEALTH PANEL (Requirement 8) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Simulated Camera Health Panel (Sanitized Nodes)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulatedCameras.map((cam) => (
                <div key={cam.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 block">{cam.id}</span>
                      <span className="font-bold text-slate-200">{cam.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase ${
                      cam.status === "OK" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      cam.status === "Intermitente" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      cam.status === "Revisar ubicación" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                      "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {cam.status}
                    </span>
                  </div>

                  {/* Camera specs */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400">
                    <div className="flex gap-1">
                      <span className="text-slate-500">Señal:</span>
                      <span className="text-slate-300">{cam.signal}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-slate-500">Conexión:</span>
                      <span className="text-slate-300 truncate">{cam.connectivity}</span>
                    </div>
                  </div>

                  <div className="p-1.5 bg-slate-900 border border-slate-850 rounded-lg text-[10px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{cam.privacy}</span>
                  </div>

                  <div className="p-2 bg-slate-900/60 border border-slate-850/60 rounded-lg text-[10.5px] leading-relaxed text-slate-300">
                    <strong className="text-[9px] font-mono text-slate-500 uppercase block">Diagnóstico Técnico:</strong>
                    {cam.diagnostic}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-950/30 border border-slate-850/60 rounded-xl flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Resguardo Ético: Todas las direcciones IP locales, RTSP, passwords, MAC addresses y marcas comerciales reales de cámaras quedan completamente suprimidas.</span>
            </div>
          </div>

          {/* SIMULATED RELATED APP SCREEN SCREEN MOCKUP */}
          {activeScreen && (
            <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-400" />
                  <span>Terminal Relacionada Simulada: Orbi Sentinel [{activeScreen.toUpperCase()}]</span>
                </h4>
                <button
                  onClick={() => setActiveScreen(null)}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded border border-rose-900/20"
                >
                  Cerrar Consola de Visualización
                </button>
              </div>

              {activeScreen === "diagnostics" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10.5px] text-slate-300 space-y-3 border border-slate-850">
                  <span className="text-emerald-400 font-bold block"># orbi-sentinel-diagnostics --synthetic-run</span>
                  <div className="space-y-1">
                    <p className="text-slate-500">=== ESCANEO DE ENLACE DE RED SINTÉTICO ===</p>
                    <p>Enlace Gateway Local: <span className="text-emerald-400">CONECTADO</span></p>
                    <p>Ping Promedio: 32ms (Fluctuación ficticia: +/- 5ms)</p>
                    <p>Estado DHCP: OK (Safe IP: 192.168.X.X Sanitized)</p>
                    <p>Ancho de banda ocupado: 1.2 Mbps / 4.0 Mbps total asignado</p>
                    <p className="text-amber-400">⚠ CAM-SYN-01 packet loss: 12.5% (Señal celular inestable en zona norte)</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[10px]">
                    <p className="text-indigo-300 font-bold">Diagnóstico Recomendado:</p>
                    <p>No intervenga routers físicos. Reduzca la resolución de stream secundario en el Workspace para estabilizar el canal celular de la demo.</p>
                  </div>
                </div>
              )}

              {activeScreen === "livewall" && (
                <div className="bg-slate-950 p-4 rounded-xl space-y-3 border border-slate-850">
                  <span className="text-emerald-400 font-mono text-[10px] font-bold block">VISTA EN VIVO SIMULADA</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 aspect-video rounded-lg border border-slate-850 flex flex-col justify-between p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center">
                        <span className="text-[10px] font-mono text-emerald-400 tracking-wider font-bold animate-pulse">STREAM ACTIVO SINTÉTICO</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded self-start">CAM-SYN-01</span>
                      <span className="text-[9px] font-mono text-emerald-400 self-end">Fila: Norte - Perímetro</span>
                    </div>

                    <div className="bg-slate-900 aspect-video rounded-lg border border-slate-850 flex flex-col justify-between p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">VISTA PRIVADA RESIDENCIAL</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded self-start">CAM-SYN-02</span>
                      <span className="text-[9px] font-mono text-slate-500 bg-indigo-500/10 px-1.5 py-0.5 rounded self-end border border-indigo-500/20">MÁSCARA ACTIVA</span>
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === "easyview" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10.5px] text-slate-300 space-y-3 border border-slate-850">
                  <span className="text-emerald-400 font-bold block"># orbi-sentinel-easyview --conserje-dashboard</span>
                  <p className="text-xs text-slate-400">Visualización simplificada para personal de guardia física:</p>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                    <p className="text-white font-bold">✓ Canal de Alertas Limpio:</p>
                    <p>Alertas Activas: <span className="font-bold text-emerald-400">0</span></p>
                    <p>La fatiga cognitiva se reduce ocultando telemetrías avanzadas de switches o logs binarios de conexión Dahua.</p>
                  </div>
                </div>
              )}

              {activeScreen === "privacy" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10.5px] text-slate-300 space-y-2 border border-slate-850">
                  <span className="text-indigo-400 font-bold block">=== CONTROL DE CONFORMIDAD ÉTICA ===</span>
                  <p>Enmascaramiento de privacidad de rostros y patentes: <span className="text-emerald-400 font-bold">HABILITADO POR DEFECTO</span></p>
                  <p>Protección contra desvío de lentes a zonas privadas: <span className="text-emerald-400 font-bold">ACTIVO</span></p>
                  <p className="text-[9.5px] text-slate-500 leading-normal">Se cumple con las directrices regulatorias locales evitando recopilación no autorizada de PII en el software del Gateway.</p>
                </div>
              )}

              {activeScreen === "helpcenter" && (
                <div className="bg-slate-950 p-4 rounded-xl font-sans text-xs text-slate-300 space-y-2 border border-slate-850">
                  <span className="text-emerald-400 font-mono text-[10px] font-bold block">CENTRO DE AYUDA INTEGRADO</span>
                  <p className="font-bold text-white">Manual Rápido para Pilotos:</p>
                  <p className="text-slate-400">1. Nunca dé acceso de Administrador al conserje de turno para evitar desconfiguraciones catastróficas del Gateway.</p>
                  <p className="text-slate-400">2. Para reclamos o solicitudes de ROI financiero, recuerde que el piloto es estrictamente orientativo y referencial.</p>
                </div>
              )}

              {activeScreen === "evidence" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300 space-y-1 border border-slate-850">
                  <span className="text-emerald-400 font-bold block"># orbi-evidence-reports --generate-sanitized-log</span>
                  <p>ID_INCIDENTE: INC-9485 | Tipo: Intrusión Perimetral Ficticia | Unidad: Perímetro Sanitizado</p>
                  <p>Estado: Descarte por Operador (Patrón: Animal Silvestre)</p>
                  <p className="text-slate-500">Exclusión de PII activa. No se guardan nombres, patentes, RUT ni correos.</p>
                </div>
              )}

              {activeScreen === "gatewaylocal" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300 space-y-2 border border-slate-850">
                  <span className="text-emerald-400 font-bold block">=== TOPOLOGÍA DE ACCESO GATEWAY LOCAL ===</span>
                  <p>Protocolo de Enlace: Sub-stream Dahua/Eufy de simulación local</p>
                  <p>Puerto de visualización: 3000 (Proxy Seguro Integrado)</p>
                  <p className="text-rose-400">⚠ No se registran credenciales root, passwords de NVR ni claves admin en la base de datos.</p>
                </div>
              )}

              {activeScreen === "incidents" && (
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300 space-y-1 border border-slate-850">
                  <span className="text-emerald-400 font-bold block">=== DIARIO DE INCIDENTES EN CALIENTE ===</span>
                  <p>[02:00:15] ALERTA: Intrusión de silueta simulada en zona norte - CAM-SYN-01</p>
                  <p>[02:02:10] ACCIÓN: Verificado por Operador - Prueba de Caminata Sanitizada</p>
                  <p>[02:02:45] DIAGNÓSTICO: Bitácora guardada localmente de forma segura</p>
                </div>
              )}
            </div>
          )}

          {/* SIMULATOR DECISION POINTS (Requirement 10) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Simulator Decision Points (Ensayar Toma de Decisiones)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {decisionPoints.map((dec) => (
                <button
                  key={dec.id}
                  onClick={() => {
                    setSelectedDecision(dec.id);
                    onAddAuditLog("Toma de Decisión Simulador", `Decisión: ${dec.id}`);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedDecision === dec.id
                      ? "bg-slate-950 border-emerald-500/40 text-white"
                      : "bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[9px] font-mono text-slate-500 uppercase">{dec.id}</span>
                    {selectedDecision === dec.id && <span className="text-[10px] font-mono text-emerald-400 font-bold">Activo ✓</span>}
                  </div>
                  <p className="font-bold mt-1 text-slate-200 leading-normal">{dec.title}</p>
                </button>
              ))}
            </div>

            {/* Decision Outcomes Display */}
            {selectedDecision && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Consecuencia Sintética de la Elección:
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Decisión Seleccionada
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed font-sans">
                  {decisionPoints.find(d => d.id === selectedDecision)?.consequence}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Recomendación Responsable:</span>
                    <p className="text-slate-400 leading-normal">{decisionPoints.find(d => d.id === selectedDecision)?.recommendation}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-rose-400 font-bold uppercase">Qué Evitar Estrictamente:</span>
                    <p className="text-slate-400 leading-normal">{decisionPoints.find(d => d.id === selectedDecision)?.whatToAvoid}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">Próximo paso operativo:</span>
                  <span className="text-slate-200 font-bold">{decisionPoints.find(d => d.id === selectedDecision)?.nextStep}</span>
                </div>
              </div>
            )}
          </div>

          {/* STAKEHOLDER QUESTION SIMULATOR (Requirement 11) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Stakeholder Question Simulator (Práctica de Respuestas)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stakeholderQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q.id);
                    onAddAuditLog("Practicar Pregunta Stakeholder", `ID Pregunta: ${q.id}`);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedQuestion === q.id
                      ? "bg-slate-950 border-emerald-500/40 text-white"
                      : "bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[9px] font-mono text-slate-500 uppercase">{q.id}</span>
                    {selectedQuestion === q.id && <span className="text-[10px] font-mono text-emerald-400 font-bold">Revisada ✓</span>}
                  </div>
                  <p className="font-bold mt-1 text-slate-200 leading-normal">“{q.question}”</p>
                </button>
              ))}
            </div>

            {/* Answer Display */}
            {selectedQuestion && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    Respuesta Responsable Sugerida:
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Apoyo Visual: {stakeholderQuestions.find(q => q.id === selectedQuestion)?.supportScreen}
                  </span>
                </div>

                <p className="text-slate-200 font-sans leading-relaxed p-3 bg-slate-900/40 border border-slate-850 rounded-xl italic">
                  “{stakeholderQuestions.find(q => q.id === selectedQuestion)?.answer}”
                </p>

                <div className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-xl space-y-1 text-[11px]">
                  <span className="text-[9px] font-mono text-rose-400 font-bold block uppercase tracking-wider">Límite Crítico a Comunicar (Para Evitar Falsa Expectativa):</span>
                  <p className="text-slate-300 leading-normal">
                    {stakeholderQuestions.find(q => q.id === selectedQuestion)?.limitToCommunicate}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                  <span className="text-slate-500">Próximo paso recomendado:</span>
                  <span className="text-slate-200 font-bold">{stakeholderQuestions.find(q => q.id === selectedQuestion)?.nextStep}</span>
                </div>
              </div>
            )}
          </div>

          {/* HISTORIAL LOCAL & GENERATED REPORT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LOCAL SIMULATION HISTORY (Requirement 14) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Historial Local de Simulación</span>
                </h3>
                {simulationHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[9px] font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
              </div>

              {simulationHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl">
                  No hay simulaciones registradas en el historial local.
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                  {simulationHistory.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{item.date}</span>
                        <span className="text-emerald-400 font-bold uppercase">{item.type}</span>
                      </div>
                      <p className="text-slate-200 font-sans font-bold truncate">{item.alias}</p>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Evs: {item.eventsCount} | Decs: {item.decisionsCount}</span>
                        <span className="text-indigo-400">{item.state}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate pt-0.5 border-t border-slate-900">Next: {item.nextStep}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSaveSimulation}
                disabled={overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization"}
                className={`w-full py-2.5 text-xs font-bold rounded-xl font-mono transition-all flex items-center justify-center gap-2 ${
                  overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization"
                    ? "bg-slate-950 border border-slate-850/60 text-slate-600 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Registrar Simulación en Historial</span>
              </button>

              {setCurrentTab && (
                <button
                  onClick={() => {
                    setCurrentTab("pilotoutcomereview");
                    onAddAuditLog("Abrir Learning Loop desde Simulador", "Navegación a Pilot Outcome Review Center");
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white font-bold text-xs rounded-xl font-mono transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Enviar Aprendizaje Sintético (Outcome Review)</span>
                </button>
              )}
            </div>

            {/* SYNTHETIC PILOT REPORT SECTION (Requirement 13) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Synthetic Pilot Report (Diario Unificado)</span>
                </h3>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization"}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all flex items-center gap-1 ${
                    overallState === "Simulation Blocked" || overallState === "Simulation Needs Sanitization"
                      ? "bg-slate-950 text-slate-600 cursor-not-allowed border border-slate-850/45"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {copiedReport ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedReport ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 h-[190px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1 text-[10px] font-mono text-slate-400 leading-normal whitespace-pre-wrap">
                {reportContent}
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic">
                *Nota: Este reporte unificado es estrictamente referencial. No contiene datos reales ni compromisos comerciales y es libre de PII.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
