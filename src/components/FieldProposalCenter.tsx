import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Video,
  FileText,
  Building,
  CheckSquare,
  PlusCircle,
  Activity,
  Sparkles,
  Clock,
  Lock,
  AlertTriangle,
  Info,
  Layers,
  Printer,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Wrench,
  BookOpen,
  Scale,
  Copy,
  Check,
  HelpCircle,
  Sliders,
  Calendar,
  MapPin,
  ArrowRight,
  Server,
  TrendingUp,
  FileSpreadsheet,
  Compass
} from "lucide-react";

interface FieldProposalCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

// 1. Types for Scope Builder
interface PilotScope {
  siteName: string;
  siteType: "PMGD" | "Parque FV Industrial" | "Faena Minera / Industrial" | "Recinto Técnico Perimetral";
  totalCameras: number;
  pilotCameras: number;
  includedZones: string[];
  excludedZones: string[];
  existingNvr: "sí" | "no" | "desconocido";
  authorizedAccess: "sí" | "no" | "parcial";
  gatewayLocalAvailable: "sí" | "no" | "pendiente";
  pilotDuration: number; // days (7 to 15)
  retentionProposed: number; // days
  authorizedRoles: string[];
  pilotGoal: string;
  observations: string;
}

// 2. Types for Readiness Checklist
interface ReadinessChecklist {
  clientAuthorization: boolean;
  cameraInventory: boolean;
  brandModelsIdentified: boolean;
  authorizedAccess: boolean;
  localNetworkIdentified: boolean;
  gatewayLocalAvailable: boolean;
  criticalZonesDefined: boolean;
  excludedZonesDefined: boolean;
  retentionPolicyDefined: boolean;
  rolesDefined: boolean;
  coordinationOm: boolean;
  coordinationPhysicalSecurity: boolean;
  hseReviewDone: boolean;
  exportProcedureDefined: boolean;
  limitedCameraTrial: boolean;
  resultsReportDefined: boolean;
}

export default function FieldProposalCenter({ userRole, onAddAuditLog, setCurrentTab }: FieldProposalCenterProps) {
  // Navigation sub-tabs inside Field Proposal Center
  const [activeSubTab, setActiveSubTab] = useState<
    "proposal" | "scope" | "privacy" | "presentation" | "objections" | "roadmap" | "report" | "status" | "demolock"
  >("proposal");

  const sendToPilotIntake = () => {
    // Sanitized transfer logic
    const sanitizedData = {
      type: "field",
      siteName: scope.siteName.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "").replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "").trim(),
      pilotCameras: scope.pilotCameras,
      totalCameras: scope.totalCameras,
      pilotDuration: scope.pilotDuration,
      includedZones: scope.includedZones,
      excludedZones: scope.excludedZones,
      pilotGoal: scope.pilotGoal.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "").replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "").trim(),
      observations: "Transferido desde Field Proposal Center de forma automática."
    };
    localStorage.setItem("ORBI_PILOT_INTAKE_TRANSFERRED_DATA", JSON.stringify(sanitizedData));
    if (onAddAuditLog) {
      onAddAuditLog("Transferir a Pilot Intake", `Datos de propuesta de terreno transferidos para ${scope.siteName}`);
    }
    triggerToast("🚀 Datos preparados y transferidos a Pilot Intake");
    if (setCurrentTab) {
      setTimeout(() => setCurrentTab("pilotintake"), 1000);
    }
  };

  // State for Pilot Scope Builder
  const [scope, setScope] = useState<PilotScope>({
    siteName: "Parque FV Demo Centro",
    siteType: "PMGD",
    totalCameras: 12,
    pilotCameras: 2,
    includedZones: ["Portón principal", "Camino de acceso", "Cerco perimetral norte"],
    excludedZones: ["Espacios públicos adyacentes", "Áreas administrativas internas sin autorización", "Líneas de alta tensión sin aprobación"],
    existingNvr: "sí",
    authorizedAccess: "parcial",
    gatewayLocalAvailable: "pendiente",
    pilotDuration: 10,
    retentionProposed: 7,
    authorizedRoles: ["Supervisor O&M", "Jefe de Planta", "Técnico de Terreno"],
    pilotGoal: "Validar el flujo de supervisión CCTV industrial, evaluar el diagnóstico de enlace Gateway y probar la clasificación de eventos de terreno sin alterar la red operativa de la planta.",
    observations: "El piloto se realizará exclusivamente con cámaras perimetrales autorizadas para resguardar la privacidad de áreas colindantes."
  });

  // State for Readiness Checklist (16 items)
  const [checklist, setChecklist] = useState<ReadinessChecklist>({
    clientAuthorization: true,
    cameraInventory: true,
    brandModelsIdentified: true,
    authorizedAccess: false,
    localNetworkIdentified: true,
    gatewayLocalAvailable: false,
    criticalZonesDefined: true,
    excludedZonesDefined: true,
    retentionPolicyDefined: true,
    rolesDefined: true,
    coordinationOm: true,
    coordinationPhysicalSecurity: false,
    hseReviewDone: true,
    exportProcedureDefined: true,
    limitedCameraTrial: false,
    resultsReportDefined: false
  });

  // State for Field External Demo Checklist (12 items)
  const [demoChecklist, setDemoChecklist] = useState({
    demoModeActive: true,
    noRealData: true,
    noIpsRtspCredentials: true,
    fieldProposalReady: true,
    presentationModeReady: true,
    responsibleLanguagePass: true,
    scopeBuilderConfigured: true,
    readinessScoreReviewed: true,
    guardrailsVisible: true,
    objectionCardsReady: true,
    proposalReportReady: true,
    nextStepDefined: true
  });

  // Presentation State (Slides 1 to 9)
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Talk Track Duration Selection
  const [talkTrackDuration, setTalkTrackDuration] = useState<"30s" | "2m" | "5m" | "10m">("2m");

  // Accordion state for objections
  const [expandedObjection, setExpandedObjection] = useState<number | null>(null);

  // Clipboard copy feedback
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Log access on mount
  useEffect(() => {
    if (onAddAuditLog) {
      onAddAuditLog(
        "Acceso a Propuesta Field",
        `Usuario con rol ${userRole} ingresó al módulo Field Proposal Center`
      );
    }
  }, [userRole]);

  // Toggle checklist status
  const toggleChecklistItem = (key: keyof ReadinessChecklist) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      triggerToast(`Requisito de preparación actualizado.`);
      if (onAddAuditLog) {
        onAddAuditLog("Modificar Checklist Field", `Actualizado estado del factor: ${key}`);
      }
      return next;
    });
  };

  // Computes Readiness Score & Status
  const getReadinessStatus = (): { label: string; percent: number; color: string; bg: string; border: string; icon: any } => {
    const totalItems = Object.keys(checklist).length;
    const checkedItems = Object.values(checklist).filter(Boolean).length;
    const percent = Math.round((checkedItems / totalItems) * 100);

    if (!checklist.clientAuthorization) {
      return {
        label: "Pending Authorization",
        percent,
        color: "text-amber-400",
        bg: "bg-amber-950/20",
        border: "border-amber-500/30",
        icon: AlertTriangle
      };
    }

    if (!checklist.authorizedAccess || !checklist.gatewayLocalAvailable || !checklist.criticalZonesDefined) {
      return {
        label: "Needs Review",
        percent,
        color: "text-blue-400",
        bg: "bg-blue-950/20",
        border: "border-blue-500/30",
        icon: Info
      };
    }

    if (percent >= 80) {
      return {
        label: "Ready for Field Pilot",
        percent,
        color: "text-emerald-400",
        bg: "bg-emerald-950/20",
        border: "border-emerald-500/30",
        icon: ShieldCheck
      };
    }

    return {
      label: "Needs Review",
      percent,
      color: "text-slate-400",
      bg: "bg-slate-900",
      border: "border-slate-800",
      icon: HelpCircle
    };
  };

  const readiness = getReadinessStatus();

  // Global Package Status
  const getPackageStatus = (): { label: string; color: string; bg: string; border: string } => {
    if (!checklist.clientAuthorization) {
      return {
        label: "Authorization Required",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
      };
    }
    if (scope.pilotCameras < 1 || scope.pilotCameras > 3) {
      return {
        label: "Missing Pilot Scope",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
      };
    }
    if (readiness.percent < 50) {
      return {
        label: "Needs Review",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
      };
    }
    return {
      label: "Ready to Present",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    };
  };

  const packageStatus = getPackageStatus();

  // Objection Handling Cards data
  const OBJECTIONS = [
    {
      q: "¿Esto reemplaza el NVR o grabador físico actual de la planta?",
      a: "No. ORBI Sentinel IA no busca reemplazar tu NVR o grabador local, sino complementarlo. Opera como una capa inteligente que lee flujos secundarios de video autorizados (vía protocolo RTSP u ONVIF) para procesar diagnósticos y clasificar incidentes, dejando intacta la grabación robusta original de tu infraestructura CCTV."
    },
    {
      q: "¿La inteligencia artificial detecta robos automáticamente con un 100% de precisión?",
      a: "No de forma autónoma absoluta. La inteligencia artificial actúa como un asistente contextual y clasificador de apoyo que prioriza anomalías técnicas (como sombras de trackers o pérdidas de señal) y posibles movimientos perimetrales. Toda alarma debe ser validada por un supervisor humano; no prometemos prevención absoluta de robos ni infalibilidad de la analítica."
    },
    {
      q: "¿Puede el sistema evitar intrusiones físicamente?",
      a: "No. ORBI Sentinel IA centraliza alertas y optimiza la visibilidad técnica de la planta, pero no reemplaza las barreras físicas, la iluminación de seguridad ni las patrullas. Apoya la supervisión O&M y facilita la toma de acciones, pero la detención o disuasión recae en los equipos de seguridad física correspondientes."
    },
    {
      q: "¿Funciona con absolutamente cualquier marca de cámara del parque?",
      a: "El grado de compatibilidad depende de la existencia de accesos autorizados, el soporte de protocolos abiertos estándar (como RTSP, ONVIF o SDK nativos habilitados) y el ancho de banda disponible. No podemos garantizar compatibilidad universal sin realizar un inventario preliminar de red en la fase inicial del piloto."
    },
    {
      q: "¿Se conecta directamente al sistema SCADA del parque solar?",
      a: "En esta fase de demostración y piloto acotado, no. ORBI opera en una red independiente de diagnóstico visual y control operativo perimetral para resguardar la seguridad cibernética de la planta solar. No interactúa directamente con los controles activos de potencia o inversores SCADA."
    },
    {
      q: "¿Esto permite reemplazar a los guardias de seguridad o conserjes?",
      a: "Rotundamente no. El sistema está diseñado para potenciar la labor de los guardias (reduciendo la fatiga visual mediante vistas simplificadas como EasyView) y asistir a los equipos técnicos con alertas priorizadas. Reemplazar personal de vigilancia física expone la planta a riesgos severos fuera de nuestra responsabilidad."
    },
    {
      q: "¿Se puede activar el software para producción crítica las 24 horas, los 7 días de la semana de inmediato?",
      a: "No. El hito actual corresponde a un ambiente de demostración estable y un piloto controlado con 1 a 3 cámaras. Para el paso a un ambiente productivo continuo 24/7, se requiere realizar el análisis técnico de red local, validar la instalación del Gateway local físico y formalizar la documentación de retención de datos con el cliente."
    },
    {
      q: "¿Qué pasa si no contamos con las contraseñas o claves de las cámaras?",
      a: "ORBI Sentinel IA respeta estrictamente los protocolos de ciberseguridad industrial. Sin autorizaciones de acceso ni credenciales entregadas explícitamente por el cliente o el integrador oficial, el sistema no forzará ni vulnerará la red. Es un requisito obligatorio para iniciar el piloto."
    },
    {
      q: "¿Qué elementos mínimos de hardware y conectividad se requieren para un piloto?",
      a: "Se requiere un Gateway local compatible (un micro-servidor o mini-PC industrial que ejecute ORBI localmente en la red de las cámaras), un switch con puertos PoE disponibles, acceso a la subred de CCTV y un canal de comunicación ascendente básico (un enlace móvil 4G o radioenlace perimetral estable)."
    },
    {
      q: "¿La bitácora de incidentes y los reportes de evidencia tienen validez legal ante tribunales?",
      a: "No. Los informes generados constituyen 'evidencia técnica de laboratorio' local para auditorías operacionales internas del parque y control de calidad O&M. No garantizamos validez legal certificada, custodia judicial de pruebas ni cumplimiento normativo criminal formal."
    }
  ];

  // Presentation slides definition
  const SLIDES = [
    {
      title: "Slide 1: Pérdida Operacional en CCTV de Campo",
      desc: "El desafío técnico e industrial en plantas solares y perímetros.",
      bullets: [
        "Distancias geográficas extensas y entornos hostiles (polvo, calor, viento).",
        "Alta fatiga de operadores vigilando múltiples cámaras simultáneas.",
        "Falsas alarmas recurrentes provocadas por vegetación, viento o animales.",
        "Dificultad técnica para detectar cámaras caídas o enlaces degradados a tiempo.",
        "Ausencia de un registro estructurado y ordenado de anomalías de terreno."
      ]
    },
    {
      title: "Slide 2: La Solución: Centralización Visual Field Operations",
      desc: "Una consola visual unificada diseñada exclusivamente para operaciones en terreno.",
      bullets: [
        "Estética premium oscura de baja fatiga ocular para operadores en turnos largos.",
        "Estructuración de vistas basada en roles específicos para evitar sobrecarga cognitiva.",
        "Mapeo ágil del estado de conectividad y salud del equipamiento en terreno.",
        "Diferenciación clara de la línea Field frente a Community (residencial) y Consumer (doméstica).",
        "Alineamiento con prácticas industriales de seguridad operativa y O&M."
      ]
    },
    {
      title: "Slide 3: Control y Mapeo de Zonas Críticas",
      desc: "Distribución visual del parque solar o recinto industrial en 14 áreas estándar.",
      bullets: [
        "Mapeo de accesos críticos: Portón principal, camino de acceso e ingresos técnicos.",
        "Supervisión del perímetro: Cerco perimetral norte, sur, y puntos ciegos.",
        "Monitoreo de generación: Sectores de trackers, inversores y centros de transformación.",
        "Protección de activos valiosos: Bodegas, patios de materiales y sala de control.",
        "Cada zona reporta su estado actual, cámaras activas, último evento y acción recomendada."
      ]
    },
    {
      title: "Slide 4: Gestión Inteligente de Incidentes",
      desc: "Un flujo estructurado para registrar, evaluar y escalar anomalías de campo.",
      bullets: [
        "Bitácora operativa con 5 estados: Abierto, En revisión, Escalado, Técnico y Cerrado.",
        "Clasificación estricta de prioridades: Informativo, Revisión, Alto y Crítico.",
        "Lenguaje prudente y no absoluto: se reportan 'Posibles eventos' para resguardo de responsabilidad.",
        "Vinculación directa de cada incidente a una zona específica y cámara asociada.",
        "Asignación clara de acciones inmediatas recomendadas para el operador de turno."
      ]
    },
    {
      title: "Slide 5: Diagnóstico Técnico CCTV Lab",
      desc: "Supervisión técnica de la infraestructura de red sin exponer secretos públicos.",
      bullets: [
        "Emulación de latencias de Gateway y tasas de pérdida de paquetes en tiempo real.",
        "Mapeo simulado de puertos PoE para verificar alimentación eléctrica remota.",
        "Indicadores técnicos ONVIF / RTSP para certificar la estabilidad de los flujos.",
        "Diagnósticos específicos para plantas solares: detección de sombras inducidas por trackers.",
        "Todo etiquetado responsablemente como simulador técnico de laboratorio."
      ]
    },
    {
      title: "Slide 6: Reporte de Evidencia de Laboratorio",
      desc: "Generación de minutas técnicas en formato Markdown transparente.",
      bullets: [
        "Recopilación limpia del estado del parque, incidentes del turno y salud de cámaras.",
        "Soporte de control de integridad mediante hashes SHA-256 locales emulados.",
        "Declaración explícita de limitaciones comerciales y confidencialidad.",
        "Sin inclusión de contraseñas, IPs públicas, tokens o planos confidenciales del cliente.",
        "Fácil copiado al portapapeles para distribución interna segura."
      ]
    },
    {
      title: "Slide 7: Guardrails y Límites Responsables",
      desc: "Definición estricta de compromisos de negocio para evitar expectativas irreales.",
      bullets: [
        "No prometer detección 100% infalible de intrusiones en perímetros.",
        "No afirmar prevención absoluta de robos ni reemplazo del personal de seguridad física.",
        "No prometer compatibilidad universal de cámaras sin auditoría previa.",
        "No asegurar validez judicial ni cadena de custodia formal (solo trazabilidad local).",
        "Establecer que el sistema es un copiloto de apoyo O&M, no un SCADA de potencia."
      ]
    },
    {
      title: "Slide 8: Propuesta de Piloto Acotado",
      desc: "La mejor ruta para probar la tecnología de forma segura y mitigar riesgos.",
      bullets: [
        "Instalación temporal de un Gateway de pruebas en la subred de CCTV autorizada.",
        "Selección inicial de 1 a 3 cámaras perimetrales clave de la planta solar.",
        "Duración sugerida acotada entre 7 y 15 días continuos de validación operacional.",
        "Definición explícita de zonas excluidas (espacios privados o sensibles sin aprobación).",
        "Acompañamiento técnico y entrega de informe final de resultados para decisión de continuidad."
      ]
    },
    {
      title: "Slide 9: Roadmap de Implementación (11 Fases)",
      desc: "Secuencia ordenada desde el levantamiento comercial hasta el cierre técnico.",
      bullets: [
        "Fases 1-3: Reunión inicial, inventario de marcas/modelos y validación de accesos autorizados.",
        "Fases 4-5: Definición formal de zonas críticas incluidas y zonas colindantes excluidas.",
        "Fases 6-8: Despliegue del Gateway piloto local, conexión a 1-3 cámaras y breve inducción.",
        "Fases 9-11: Registro operacional de incidentes, informe técnico final y decisión de escalamiento.",
        "Garantiza un proceso prolijo, ordenado y alineado con las normativas HSE del cliente."
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < SLIDES.length ? prev + 1 : 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : SLIDES.length));
  };

  // Talk Tracks text based on duration selection
  const getTalkTrackText = (): string => {
    switch (talkTrackDuration) {
      case "30s":
        return "«ORBI Sentinel IA Field es un copiloto visual y técnico de diagnóstico diseñado para optimizar las operaciones de O&M en plantas solares y recintos industriales. Centraliza la supervisión de hasta 14 zonas críticas, automatiza el diagnóstico de salud de las cámaras (como puertos PoE y latencias) y permite gestionar incidentes perimetrales con lenguaje prudente y evidencia técnica local. Proponemos un piloto inicial sin riesgo de 7 a 15 días con solo 1 a 3 cámaras autorizadas para demostrar el valor operacional en terreno de forma ágil y responsable.»";
      case "2m":
        return "«Para directores de O&M y jefes de planta, la pérdida de visibilidad y las falsas alarmas perimetrales representan sobrecostos operativos. ORBI Sentinel IA Field unifica el monitoreo mediante un panel de control perimetral optimizado y de baja fatiga visual. Nuestro sistema gestiona anomalías de terreno asociándolas a zonas específicas bajo un flujo de incidentes controlado y con recomendaciones inmediatas. Técnicamente, emula diagnósticos de red como latencia, pérdidas de paquetes y fallas por obstrucciones físicas o sombras de trackers. Resguardamos estrictamente la ciberseguridad al operar de forma local y restringida. Proponemos iniciar con un piloto controlado de 10 días, utilizando de 1 a 3 cámaras de perímetros generales ya autorizadas. No reemplazamos a los guardias ni prometemos prevención absoluta, sino que dotamos a la operación de visibilidad técnica y bitácoras estructuradas de laboratorio con control SHA-256 local.»";
      case "5m":
        return "«Estimados directores y comités técnicos de O&M:\n\nPresentamos el Paquete de Demostración y Piloto de ORBI Sentinel IA Field. La seguridad perimetral y operativa de los parques solares PMGD suele sufrir de dos extremos: o la fatiga visual de los guardias provoca que se ignoren intrusiones reales, o la cantidad de falsas alarmas por viento y vegetación satura los canales de alerta.\n\nNuestra propuesta se basa en cuatro pilares operativos:\n1. El Field Operations Center: que organiza la planta en 14 zonas operacionales lógicas para canalizar los eventos.\n2. La experiencia adaptada de roles: con el modo simplificado 'EasyView' para personal de guardia —libre de datos técnicos complejos—, un panel ejecutivo de gestión para O&M y una consola detallada con diagnósticos de red y sombras de seguidores para instaladores.\n3. Gestión ordenada de bitácoras: donde cada evento se clasifica con lenguaje prudente (e.g., 'Posible intrusión perimetral' en lugar de confirmaciones absolutas de delito) para proteger al operador de falsas conclusiones.\n4. El O&M Evidence Report: que genera informes técnicos transparentes listos para ser distribuidos con hashes SHA-256 de integridad interna local.\n\nPara garantizar la seguridad de su red, ORBI opera bajo estricto principio de ciberseguridad industrial: no abrimos puertos públicos, no forzamos credenciales y la demo opera exclusivamente con datos simulados en parques demo (Sur, Centro, Cordillera). Los invitamos a ejecutar un piloto acotado de 7 a 15 días en una zona no crítica, conectando un Gateway local de prueba a un máximo de 3 cámaras autorizadas para validar la estabilidad y la reducción de falsas alarmas en terreno de forma completamente segura.»";
      case "10m":
        return "«Propuesta Integral de Demostración Industrial — ORBI Sentinel IA Field\n\n1. Introducción y Desafío de Terreno (0-2 min):\nLas instalaciones industriales alejadas, los campos fotovoltaicos y las subestaciones sufren de degradación de enlaces inalámbricos y pérdidas recurrentes de alimentación PoE. Además, las soluciones de CCTV residenciales o genéricas inundan a los jefes de planta con alertas irrelevantes. ORBI Sentinel IA Field ha sido diseñado bajo estándares de robustez técnica de laboratorio para resolver estos desafíos operacionales de O&M.\n\n2. Consola Unificada y Distribución en Zonas (2-4 min):\nNuestra consola organiza el parque en 14 zonas perimetrales y técnicas, desde el portón de ingreso hasta el sector de trackers. Esto permite correlacionar de inmediato cualquier alteración con la cámara exacta involucrada. El operador de terreno dispone de una interfaz oscura glassmorphic diseñada para turnos nocturnos, reduciendo drásticamente la fatiga ocular.\n\n3. Roles Operativos y Protección de Datos (4-6 min):\nEl sistema restringe la información avanzada mediante roles. Mientras que un guardia visualiza únicamente alertas de acción inmediata con botones simplificados en 'EasyView', un supervisor de O&M accede a analíticas de salud visual y reportes de incidentes. Por último, el técnico especializado dispone de herramientas de diagnóstico de Gateway local, análisis de pérdida de paquetes y alertas de obstrucciones físicas causadas por el paso de los paneles solares seguidores.\n\n4. Criterio de Privacidad, Ciberseguridad y No Exposición (6-8 min):\nDe acuerdo con nuestros estrictos compromisos éticos, ORBI no almacena contraseñas visibles, enmascara las IPs y RTSP en reportes públicos, y requiere autorización escrita para cualquier despliegue. Los reportes emitidos constituyen evidencia de laboratorio técnico y local para optimizar el mantenimiento, nunca herramientas judiciales de validación de delitos. No pretendemos sustituir la seguridad física ni los grabadores NVR.\n\n5. Alcance Recomendado para el Piloto (8-10 min):\nLa mejor manera de evaluar la factibilidad es nuestro plan de piloto acotado de 10 días:\n- Despliegue temporal de 1 Gateway de prueba local en la red CCTV de la planta.\n- Asociación de 1 a 3 cámaras perimetrales comunes autorizadas.\n- Levantamiento con nuestro checklist interactivo de 16 factores de preparación (permisos, subred, marcas, política de retención, HSE).\n- Generación de informe final de viabilidad.\n\nEste proceso garantiza la máxima transparencia comercial, evitando sobreprometer capacidades y validando el retorno operacional de forma controlada y segura.»";
    }
  };

  // Generate Executive Proposal Text
  const generateProposalMarkdown = () => {
    return `# PROPUESTA EJECUTIVA: PILOTO ORBI SENTINEL IA FIELD
===================================================
*   **Nombre del Proyecto:** Piloto Operacional ORBI Sentinel IA Field
*   **Sitio de Evaluación:** ${scope.siteName} (${scope.siteType})
*   **Fecha de Emisión:** 2026-07-20
*   **Versión de Tecnología:** v0.3.2-sentinel-field-proposal-pack
*   **Estado del Paquete:** ${packageStatus.label}

## 1. RESUMEN EJECUTIVO
ORBI Sentinel IA Field centraliza supervisión visual, diagnóstico CCTV, gestión de incidentes y evidencia técnica de laboratorio para apoyar operaciones O&M en recintos solares e industriales, usando cámaras autorizadas y datos controlados. Nuestro enfoque elimina la complejidad técnica innecesaria en la operación diaria y provee herramientas de diagnóstico rápido para técnicos de mantenimiento.

## 2. PROBLEMA OPERACIONAL
- Distancias geográficas extensas en recintos industriales complejas de vigilar físicamente.
- Alta tasa de falsas alarmas visuales (malezas, viento, animales de campo).
- Fallas de conectividad no detectadas a tiempo en cámaras perimetrales críticas.
- Fatiga visual severa en operadores encargados de múltiples pantallas de CCTV.
- Dificultad para documentar con rigor técnico incidencias y anomalías de red en terreno.

## 3. SOLUCIÓN PROPUESTA & BENEFICIOS O&M
- **Visualización Optimizada:** Consola unificada de fondo oscuro con mapeo ágil en 14 zonas operacionales.
- **EasyView para Guardias:** Pantalla operativa simplificada que oculta IPs, puertos y credenciales para enfocarse solo en alertas y botones de acción rápida.
- **Diagnostics Lab:** Herramientas técnicas para medir latencias simuladas, puertos PoE activos e identificar sombras inducidas por trackers.
- **Evidence Report:** Generador de reportes de anomalías técnicos locales en formato Markdown con SHA-256 local para trazabilidad y control de calidad.

## 4. ALCANCE ACOTO DEL PILOTO SUGERIDO
- **Cámaras en Prueba:** ${scope.pilotCameras} cámara(s) autorizada(s) (Límite sugerido: 1 a 3 cámaras).
- **Zonas Incluidas:** ${scope.includedZones.join(", ")}.
- **Zonas Excluidas:** ${scope.excludedZones.join(", ")}.
- **Duración del Piloto:** ${scope.pilotDuration} días de evaluación controlada (Límite: 7 a 15 días).
- **Retención de Video Proclive:** ${scope.retentionProposed} días en almacenamiento local.
- **Uso de Gateway Local:** ${scope.gatewayLocalAvailable === "sí" ? "Gateway de Pruebas Disponible" : "Pendiente de Despliegue Local"}.

## 5. PRIVACIDAD, SEGURIDAD & AUTORIZACIÓN
- **Principio de Consentimiento:** No se interactúa con cámaras o grabadores NVR sin autorización firmada explícita.
- **Ciberseguridad:** No se abren puertos públicos ni se configuran accesos expuestos.
- **Protección de Datos:** Las direcciones IP y rutas RTSP se mantienen locales y enmascaradas.
- **Límites de Evidencia:** El material generado constituye evidencia técnica de laboratorio interno, no validación legal o judicial externa.

## 6. PRÓXIMOS PASOS (ROADMAP SUGERIDO)
1. Firma de autorización formal de piloto acotado.
2. Levantamiento técnico de marcas/modelos del inventario de cámaras.
3. Validación de accesos autorizados locales.
4. Despliegue del Gateway piloto y pruebas técnicas con 1-3 cámaras comunes.
5. Cierre técnico de piloto y entrega de informe de resultados operacionales.

----------------------------------------------------------------------
*Nota Responsable: Este documento representa una propuesta técnica preliminar para un piloto piloto controlado. No constituye un contrato de servicios definitivo ni un software con garantía judicial o SCADA real.*`;
  };

  const copyProposalToClipboard = () => {
    navigator.clipboard.writeText(generateProposalMarkdown());
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
    triggerToast("¡Propuesta copiada al portapapeles!");
    if (onAddAuditLog) {
      onAddAuditLog("Copiar Propuesta Field", `Exportada propuesta ejecutiva para el sitio ${scope.siteName}`);
    }
  };

  // Generate External Demo Brief Text
  const generateExternalBriefText = () => {
    return `### ORBI SENTINEL IA — FIELD EXTERNAL DEMO BRIEF
==================================================
*   **Hito Técnico:** v0.3.2-sentinel-field-proposal-pack
*   **Estado de Entrega:** PROPOSAL & PRESENTATION READY
*   **Audiencias Recomendadas:**
    - Gerentes de Operaciones & Mantenimiento (O&M)
    - Jefes de Planta Solar o Parque Industrial
    - Supervisores Técnicos e Instaladores de Telecomunicaciones
    - Directores de Seguridad Física Industrial
    - Clientes Propietarios de PMGD (Pequeños Medios de Generación Distribuida)
    - Miembros de Comités Técnicos de Infraestructura
*   **Duración Sugerida:**
    - 2 min: Elevator pitch para supervisores de turno.
    - 5 min: Presentación ejecutiva de valor O&M y reducción de fatiga.
    - 10 min: Demo profunda incluyendo diagnóstico técnico PoE y simulación de sombras de trackers.
*   **Qué se puede demostrar activamente:**
    - Constructor de alcance de piloto parametrizable en tiempo real (Scope Builder).
    - El Readiness Score interactivo que evalúa 16 factores críticos antes de instalar.
    - El visor secuencial de slides del Modo Presentación con 9 láminas de negocio.
    - Tarjetas interactivas de objeciones para responder con criterio ético y comercial.
    - Hoja de ruta interactiva con 11 fases de despliegue industrial.
    - Reporte de propuesta estructurado y copiable en Markdown con advertencias de límites.
    - Guión de Talk Tracks ajustable según la disponibilidad de tiempo de la audiencia.
*   **Qué NO se debe prometer (Límites de Seguridad):**
    - NO asegurar detección 100% infalible de intrusiones en perímetros extensos.
    - NO prometer prevención absoluta de robos de cable, cobre o insumos solares.
    - NO vender el software como un sustituto de guardias de seguridad o de personal técnico.
    - NO prometer integración directa interactiva con sistemas de control activo SCADA de inversores.
    - NO afirmar validez legal o cadena de custodia judicial para bitácoras técnicas de laboratorio.
*   **Próximo Paso Sugerido:** Realizar levantamiento inicial de red local y probar Gateway piloto con 1 a 3 cámaras autorizadas.`;
  };

  const copyBriefToClipboard = () => {
    navigator.clipboard.writeText(generateExternalBriefText());
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
    triggerToast("¡Brief externo copiado!");
    if (onAddAuditLog) {
      onAddAuditLog("Exportar External Brief", "Copiado Field External Demo Brief al portapapeles");
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-8 text-slate-100 min-h-[600px] relative">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/30 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
            MÓDULO 3C • PROPUESTA & PRESENTACIÓN
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-2 flex items-center gap-2.5">
            <Building className="w-6 h-6 text-emerald-400" />
            Field Proposal & O&M Presentation Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formulación técnica, constructores de alcance, readiness checklists y secuencias ejecutivas de apoyo a demostraciones Field.
          </p>
        </div>

        {/* Global Status Badge */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">ESTADO DEL PAQUETE</span>
            <span className={`text-xs font-bold ${packageStatus.color} uppercase`}>
              {packageStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs (A to I) */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-900 pb-4">
        {[
          { id: "proposal", label: "Propuesta de una Página", icon: FileText },
          { id: "scope", label: "Scope Builder de Piloto", icon: Sliders },
          { id: "privacy", label: "Privacidad y Autorización", icon: Shield },
          { id: "presentation", label: "Modo Presentación (Slides)", icon: Compass },
          { id: "objections", label: "Manejo de Objeciones", icon: HelpCircle },
          { id: "roadmap", label: "Roadmap del Piloto", icon: Calendar },
          { id: "report", label: "Reporte Markdown", icon: FileSpreadsheet },
          { id: "status", label: "Estado del Paquete & Brief", icon: ShieldCheck },
          { id: "demolock", label: "External Demo Lock", icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (onAddAuditLog) {
                  onAddAuditLog("Cambiar Subpestaña Propuesta", `Navegación interna hacia ${tab.label}`);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                active
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- SUBTAB CONTENT --- */}

      {/* SUBTAB 1: ONE-PAGE EXECUTIVE PROPOSAL */}
      {activeSubTab === "proposal" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-4 gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  One-Page Field Executive Proposal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Propuesta de alto nivel técnica y comercial lista para toma de decisiones rápida.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={copyProposalToClipboard}
                  className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/25 font-bold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all w-full md:w-auto justify-center shadow-lg"
                >
                  <Copy className="w-4 h-4" />
                  {copiedProposal ? "¡Copiada!" : "Copiar Propuesta"}
                </button>
                <button
                  onClick={sendToPilotIntake}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all w-full md:w-auto justify-center shadow-lg shadow-emerald-500/10"
                  id="btn-field-send-to-pilot-intake"
                >
                  🚀 Enviar a Pilot Intake
                </button>
              </div>
            </div>

            {/* Simulated Printed Document Page */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 font-mono text-xs text-slate-300 space-y-6 leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
              <div className="border-b border-slate-900 pb-4 text-center">
                <span className="text-lg font-bold text-white uppercase block">ORBI SENTINEL IA — FIELD</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">PROPUESTA DE PILOTO OPERACIONAL EN TERRENO</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] border-b border-slate-900 pb-4">
                <div>
                  <span className="text-slate-500 block">SITIO EVALUADO:</span>
                  <span className="text-slate-200 font-bold block">{scope.siteName} ({scope.siteType})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CÁMARAS PILOTO SUGERIDAS:</span>
                  <span className="text-emerald-400 font-bold block">{scope.pilotCameras} de {scope.totalCameras} existentes (Cámaras autorizadas)</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block">1. INTRODUCCIÓN & BENEFICIO O&M</span>
                <p>
                  “ORBI Sentinel IA Field centraliza supervisión visual, diagnóstico CCTV, gestión de incidentes y evidencia técnica de laboratorio para apoyar operaciones O&M en recintos solares e industriales, usando cámaras autorizadas y datos controlados.” Permite a gerentes y jefes de planta estructurar bitácoras claras, mitigar fatigas de guardias mediante EasyView y auditar latencias de enlace técnico.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block">2. ALCANCE OPERATIVO DEL PILOTO</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li><strong>Zonas Incluidas:</strong> {scope.includedZones.join(", ")}</li>
                  <li><strong>Zonas Excluidas:</strong> {scope.excludedZones.join(", ")}</li>
                  <li><strong>Duración Estimada:</strong> {scope.pilotDuration} días hábiles de pruebas controladas.</li>
                  <li><strong>Hardware Piloto:</strong> 1 Gateway local de prueba provisional conectado a red de CCTV.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block">3. COMPROMISOS CLAVE DE PRIVACIDAD & SEGURIDAD</span>
                <p>
                  No se almacenan contraseñas de cámaras de forma visible, no se abren puertos públicos en la subred industrial y todas las direcciones de red (IP/RTSP) permanecen confidenciales y redactadas en reportes públicos. El sistema requiere autorización formal escrita y coordinación directa con el departamento de seguridad física y O&M local.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-900 pt-4">
                <span className="text-white font-bold block">4. LIMITACIONES DE RESPONSABILIDAD COMERCIAL (GUARDRAILS)</span>
                <p className="text-slate-400 text-[10px]">
                  El software es un sistema de soporte y diagnóstico de CCTV local. No promete prevención de robos, detección de intrusos infalible, validez judicial certificada de bitácoras, reemplazo de guardias físicos ni automatización de sistemas SCADA de inversores.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PILOT SCOPE BUILDER */}
      {activeSubTab === "scope" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form Controls */}
            <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Constructor de Alcance del Piloto (Scope Builder)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Define los parámetros físicos, de red y operativos del piloto de demostración de manera responsable.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Site Name & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">NOMBRE DEL SITIO DEMO</label>
                    <input
                      type="text"
                      value={scope.siteName}
                      onChange={(e) => setScope({ ...scope, siteName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">TIPO DE SITIO INDUSTRIAL</label>
                    <select
                      value={scope.siteType}
                      onChange={(e) => setScope({ ...scope, siteType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    >
                      <option value="PMGD">PMGD (Pequeño Medio Generación)</option>
                      <option value="Parque FV Industrial">Parque FV Industrial Grande</option>
                      <option value="Faena Minera / Industrial">Faena Minera / Industrial</option>
                      <option value="Recinto Técnico Perimetral">Recinto Técnico Perimetral</option>
                    </select>
                  </div>
                </div>

                {/* Cameras count & pilot cameras */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">NÚMERO DE CÁMARAS EXISTENTES</label>
                    <input
                      type="number"
                      value={scope.totalCameras}
                      onChange={(e) => setScope({ ...scope, totalCameras: Math.max(1, parseInt(e.target.value) || 12) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 font-mono text-[10px]">CÁMARAS A PROBAR (PILOTO)</label>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">RECOMENDADO: 1 a 3</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={scope.pilotCameras}
                      onChange={(e) => {
                        const val = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                        setScope({ ...scope, pilotCameras: val });
                        if (val > 3) {
                          triggerToast("Límite responsable: Se aconseja un piloto inicial de un máximo de 3 cámaras.");
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Zones Included / Excluded (Checklist simulated with tags) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-mono text-[10px]">ZONAS INCLUIDAS EN PILOTO</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1 max-h-[110px] overflow-y-auto">
                      {["Portón principal", "Camino de acceso", "Cerco perimetral norte", "Bodega", "Área inversores", "Centros de transformación"].map((z) => {
                        const isInc = scope.includedZones.includes(z);
                        return (
                          <button
                            key={z}
                            type="button"
                            onClick={() => {
                              const next = isInc
                                ? scope.includedZones.filter((x) => x !== z)
                                : [...scope.includedZones, z];
                              setScope({ ...scope, includedZones: next });
                            }}
                            className={`flex items-center gap-1.5 w-full text-left text-[11px] p-1 rounded transition-all ${
                              isInc ? "text-emerald-400 font-bold" : "text-slate-500"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isInc ? "bg-emerald-400" : "bg-slate-800"}`}></span>
                            {z}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-mono text-[10px]">ZONAS EXCLUIDAS (PRIVACIDAD)</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1 max-h-[110px] overflow-y-auto font-mono text-[10px]">
                      {["Espacios públicos adyacentes", "Áreas administrativas internas sin autorización", "Líneas de alta tensión sin aprobación", "Estacionamientos residenciales vecinos"].map((z) => {
                        const isExc = scope.excludedZones.includes(z);
                        return (
                          <button
                            key={z}
                            type="button"
                            onClick={() => {
                              const next = isExc
                                ? scope.excludedZones.filter((x) => x !== z)
                                : [...scope.excludedZones, z];
                              setScope({ ...scope, excludedZones: next });
                            }}
                            className={`flex items-center gap-1.5 w-full text-left p-1 rounded transition-all ${
                              isExc ? "text-amber-400 font-bold" : "text-slate-500"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isExc ? "bg-amber-400" : "bg-slate-800"}`}></span>
                            {z}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Duration & Retention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 font-mono text-[10px]">DURACIÓN DEL PILOTO (DÍAS)</label>
                      <span className="text-[9px] text-amber-400 font-mono">RECOMENDADO: 7 a 15 d</span>
                    </div>
                    <input
                      type="number"
                      min="7"
                      max="15"
                      value={scope.pilotDuration}
                      onChange={(e) => setScope({ ...scope, pilotDuration: Math.min(15, Math.max(7, parseInt(e.target.value) || 7)) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">RETENCIÓN DE DATOS (DÍAS)</label>
                    <input
                      type="number"
                      value={scope.retentionProposed}
                      onChange={(e) => setScope({ ...scope, retentionProposed: Math.max(1, parseInt(e.target.value) || 7) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                </div>

                {/* NVR, Access, Gateway dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">¿EXISTE NVR LOCAL?</label>
                    <select
                      value={scope.existingNvr}
                      onChange={(e) => setScope({ ...scope, existingNvr: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="sí">Sí</option>
                      <option value="no">No</option>
                      <option value="desconocido">Desconocido</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">ACCESO AUTORIZADO</label>
                    <select
                      value={scope.authorizedAccess}
                      onChange={(e) => setScope({ ...scope, authorizedAccess: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="sí">Sí (Completo)</option>
                      <option value="parcial">Parcial (En trámite)</option>
                      <option value="no">No (Restringido)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-mono text-[10px]">GATEWAY DISPONIBLE</label>
                    <select
                      value={scope.gatewayLocalAvailable}
                      onChange={(e) => setScope({ ...scope, gatewayLocalAvailable: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="sí">Sí (Listo)</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="no">No disponible</option>
                    </select>
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px]">OBJETIVOS ESPECÍFICOS DEL PILOTO</label>
                  <textarea
                    value={scope.pilotGoal}
                    onChange={(e) => setScope({ ...scope, pilotGoal: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 leading-normal"
                  />
                </div>
              </div>
            </div>

            {/* Live Scope Summary Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Alcance Consolidado</h4>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instalación:</span>
                    <span className="text-white font-bold">{scope.siteName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo de Sitio:</span>
                    <span className="text-white font-mono">{scope.siteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canales Piloto:</span>
                    <span className="text-emerald-400 font-bold font-mono">{scope.pilotCameras} cámara(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duración:</span>
                    <span className="text-amber-400 font-mono">{scope.pilotDuration} días de prueba</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Almacenamiento local:</span>
                    <span className="text-slate-200 font-mono">{scope.retentionProposed} días de retención</span>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-1.5">
                    <span className="text-slate-400 font-mono text-[10px] block">ÁREAS DE TRABAJO INCLUIDAS:</span>
                    <div className="flex flex-wrap gap-1">
                      {scope.includedZones.map((z) => (
                        <span key={z} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                          {z}
                        </span>
                      ))}
                      {scope.includedZones.length === 0 && <span className="text-slate-500 text-[10px]">Ninguna seleccionada</span>}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-1.5">
                    <span className="text-slate-400 font-mono text-[10px] block">LÍMITES DE EXCLUSIÓN (PRIVACIDAD):</span>
                    <div className="flex flex-wrap gap-1">
                      {scope.excludedZones.map((z) => (
                        <span key={z} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                          {z}
                        </span>
                      ))}
                      {scope.excludedZones.length === 0 && <span className="text-slate-500 text-[10px]">Ninguno configurado</span>}
                    </div>
                  </div>

                  {/* Operational Security Check */}
                  <div className="border-t border-slate-800 pt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-normal flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Compromiso Responsable:</span>
                      El piloto se acotará estrictamente a cámaras que apunten a accesos autorizados y perímetros generales de forma ética y legal. <strong className="text-emerald-400">El alcance real del piloto debe validarse con autorización formal del cliente y levantamiento técnico previo.</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PRIVACY & AUTHORIZATION BRIEF */}
      {activeSubTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Criterios de Privacidad, Seguridad y Autorizaciones
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Lineamientos formales para operar bajo autorización estricta del cliente y regulaciones industriales.</p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              “ORBI Sentinel IA Field está diseñado para operar bajo autorización explícita del cliente, resguardando credenciales, rutas de conexión, datos operacionales y evidencia técnica mediante roles, redacción de secretos y trazabilidad local.” <strong className="text-emerald-400">Los datos utilizados corresponden a escenarios de demostración ficticios y sanitizados para evitar cualquier exposición de información operacional real, descartando cualquier aserción de anonimato absoluto.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Solo Cámaras Autorizadas</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bajo ninguna circunstancia se forzará la lectura de flujos de video sin el consentimiento firmado de los administradores técnicos o directores de la planta.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Server className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Sin Puertos Públicos Abiertos</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El Gateway local procesa las imágenes internamente de forma aislada. Evita la exposición de contraseñas de red o direccionamiento interno público.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Privacidad y Exclusiones</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Se definen zonas de enmascaramiento y de exclusión perimetral obligatorias para evitar registrar espacios de propiedad privada colindantes o sensibles.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Redacción de IPs y RTSP</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las bitácoras de incidentes y reportes públicos omiten credenciales, subredes exactas y direcciones IP completas para evitar brechas de seguridad física.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Evidencia de Laboratorio</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Los informes generados representan minutas técnicas locales orientadas a auditorías de O&M y control de calidad. No sustituyen peritajes criminales oficiales.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Coordinación Operacional</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cualquier prueba piloto física debe coordinarse previamente con los encargados de O&M, el personal contratista de seguridad física y supervisores HSE.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PRESENTATION SLIDES MODE */}
      {activeSubTab === "presentation" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Presentación Ejecutiva O&M (Slides de Soporte)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Láminas visuales claras enfocadas en valor operativo, limites del piloto y roadmap de levantamiento.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 bg-slate-950 border border-slate-800 py-1 rounded">
                  {currentSlide} / {SLIDES.length}
                </span>
                <button
                  onClick={nextSlide}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Viewer Visual */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden min-h-[340px] flex flex-col justify-between">
              {/* Slide Background Subtle Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono text-emerald-500 tracking-widest font-bold block uppercase border-b border-slate-900 pb-2">
                  ORBI SENTINEL IA FIELD — SLIDE DE RESPONSABILIDAD COMERCIAL
                </span>
                
                <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {SLIDES[currentSlide - 1].title}
                </h4>
                <p className="text-xs text-slate-400 italic">
                  {SLIDES[currentSlide - 1].desc}
                </p>

                {/* Bullet list with staggered custom indicators */}
                <div className="space-y-2.5 mt-4">
                  {SLIDES[currentSlide - 1].bullets.map((bullet, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Navigation inside Card */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-6 text-[10px] font-mono text-slate-500">
                <span>© 2026 ORBI Sentinel IA — Confidencialidad y Ética Industrial</span>
                <span className="text-emerald-400 font-bold">LÍNEA INDUSTRIAL FIELD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: OBJECTION HANDLING CARDS */}
      {activeSubTab === "objections" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                Manejo Ético de Objeciones (Objection Handling Cards)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Respuestas directas y responsables diseñadas para mitigar falsas expectativas en reuniones técnicas con clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OBJECTIONS.map((item, idx) => {
                const isExpanded = expandedObjection === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-slate-950 border rounded-xl transition-all duration-200 overflow-hidden ${
                      isExpanded ? "border-emerald-500/30 bg-slate-950/90" : "border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedObjection(isExpanded ? null : idx)}
                      className="w-full text-left p-4 flex justify-between items-start gap-3"
                    >
                      <span className="text-xs font-bold text-slate-200 leading-normal">{item.q}</span>
                      <span className="text-emerald-400 shrink-0 text-xs font-mono font-bold">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-900 pt-3 text-[11px] text-slate-400 leading-relaxed space-y-2 bg-slate-950/40">
                        <p>{item.a}</p>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold w-fit block uppercase">
                          Lineamiento de Ventas Responsable
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: FIELD PILOT ROADMAP */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Hoja de Ruta del Piloto Field (Roadmap de 11 Fases)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Procedimiento secuencial ordenado para la validación preliminar en terreno sin riesgos.</p>
            </div>

            {/* Interactive Timeline Visual */}
            <div className="relative border-l-2 border-slate-900 ml-3 md:ml-4 space-y-6 py-2">
              {[
                { phase: 1, title: "Reunión Inicial & Alineamiento", desc: "Coordinación con el cliente, jefatura de planta y directores de O&M para definir el alcance básico." },
                { phase: 2, title: "Inventario Técnico de Cámaras", desc: "Mapeo exhaustivo de marcas, modelos, resoluciones y condiciones de red de la planta solar." },
                { phase: 3, title: "Validación de Accesos Autorizados", desc: "Firma formal de consentimiento y levantamiento de claves RTSP/ONVIF del CCTV local." },
                { phase: 4, title: "Definición de Zonas Críticas", desc: "Selección de accesos, bodegas de material o áreas eléctricas a supervisar por ORBI." },
                { phase: 5, title: "Definición de Zonas Excluidas", desc: "Enmascaramiento de perímetros externos y espacios públicos colindantes para resguardo de la privacidad." },
                { phase: 6, title: "Instalación del Gateway Local Piloto", desc: "Despliegue provisional de micro-servidor de pruebas en la subred industrial CCTV del cliente." },
                { phase: 7, title: "Prueba Acotada con 1-3 Cámaras", desc: "Conexión estable a flujos autorizados sin interferir en la grabación robusta original de la planta." },
                { phase: 8, title: "Capacitación a Operadores de Turno", desc: "Breve inducción al personal de seguridad física para el uso de la consola simplificada EasyView." },
                { phase: 9, title: "Revisión de Incidentes & Diagnósticos", desc: "Seguimiento de bitácoras, validación técnica de latencias y detección de sombras estructurales." },
                { phase: 10, title: "Informe Final de Resultados de Lab", desc: "Consolidación de estadísticas, porcentaje de falsas alarmas filtradas y reporte SHA-256 local." },
                { phase: 11, title: "Decisión de Continuidad", desc: "Análisis conjunto para decidir el paso hacia un ambiente productivo regular o fin de pruebas." }
              ].map((step) => (
                <div key={step.phase} className="relative pl-6 md:pl-8">
                  {/* Phase Marker */}
                  <div className="absolute -left-[9px] top-1.5 h-4.5 w-4.5 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center font-mono text-[9px] font-bold text-emerald-400">
                    {step.phase}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: REPORT MARKDOWN */}
      {activeSubTab === "report" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-4 gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Field Pilot Proposal Report
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Informe técnico en formato Markdown copiable conteniendo toda la formulación de alcance piloto.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateProposalMarkdown());
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2000);
                  triggerToast("Reporte copiado al portapapeles");
                  if (onAddAuditLog) {
                    onAddAuditLog("Copiar Reporte Propuesta Field", `Reporte de propuesta copiado para ${scope.siteName}`);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all w-full md:w-auto justify-center shadow-lg"
              >
                <Copy className="w-4 h-4" />
                {copiedReport ? "¡Copiado!" : "Copiar Reporte"}
              </button>
            </div>

            {/* Markdown Display Visual */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 font-mono text-[11px] text-slate-300 space-y-3 max-h-[480px] overflow-y-auto leading-relaxed select-all">
              {generateProposalMarkdown()}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: PACKAGE STATUS & BRIEF */}
      {activeSubTab === "status" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Panel (checklist checklist elements) */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 pb-2">Factores de Preparación e Integridad</h3>
              
              {/* Checklist list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "clientAuthorization", label: "Autorización de Cliente" },
                  { key: "cameraInventory", label: "Inventario de Cámaras" },
                  { key: "brandModelsIdentified", label: "Marcas/Modelos Identificados" },
                  { key: "authorizedAccess", label: "Acceso Autorizado a Cámaras" },
                  { key: "localNetworkIdentified", label: "Red Local Identificada" },
                  { key: "gatewayLocalAvailable", label: "Gateway Local Disponible" },
                  { key: "criticalZonesDefined", label: "Zonas Críticas Definidas" },
                  { key: "excludedZonesDefined", label: "Zonas Excluidas Definidas" },
                  { key: "retentionPolicyDefined", label: "Política de Retención Definida" },
                  { key: "rolesDefined", label: "Roles Definidos" },
                  { key: "coordinationOm", label: "Coordinación con O&M" },
                  { key: "coordinationPhysicalSecurity", label: "Coordinación Seguridad Física" },
                  { key: "hseReviewDone", label: "Revisión HSE Efectuada" },
                  { key: "exportProcedureDefined", label: "Procedimiento de Exportación" },
                  { key: "limitedCameraTrial", label: "Prueba 1-3 Cámaras Acotada" },
                  { key: "resultsReportDefined", label: "Informe de Resultados Listo" }
                ].map((item) => {
                  const val = checklist[item.key as keyof ReadinessChecklist];
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleChecklistItem(item.key as any)}
                      className="flex items-center gap-2.5 p-2 bg-slate-950 hover:bg-slate-900 rounded-lg text-left text-xs transition-all border border-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        readOnly
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                      />
                      <span className={val ? "text-slate-300 font-bold" : "text-slate-500 line-through"}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Progress bar visual */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Puntaje de Preparación Técnica:</span>
                  <span className={`font-mono font-bold ${readiness.color}`}>{readiness.percent}% Conforme</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${readiness.percent}%` }}
                  ></div>
                </div>
                <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono mt-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Requiere un mínimo de 80% y autorización formal firmada para la viabilidad técnica del piloto.</span>
                </div>
              </div>
            </div>

            {/* External Brief Visual Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Field External Brief</h3>
                <button
                  onClick={copyBriefToClipboard}
                  className="text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedBrief ? "¡Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-400 space-y-2 max-h-[380px] overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                {generateExternalBriefText()}
              </div>
            </div>
          </div>

          {/* Talk Tracks Adaptation Section */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Guión y Talk Tracks para Demostración Field
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Ajusta el guión de voz recomendado de acuerdo con el tiempo disponible de tu interlocutor.</p>
              </div>
              
              {/* Duration selector */}
              <div className="flex gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full md:w-auto shrink-0">
                {(["30s", "2m", "5m", "10m"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setTalkTrackDuration(d);
                      if (onAddAuditLog) {
                        onAddAuditLog("Ajustar Duración Guión", `Cambiado guión Field a ${d}`);
                      }
                    }}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all uppercase ${
                      talkTrackDuration === d
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 text-xs italic text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {getTalkTrackText()}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: FIELD EXTERNAL DEMO LOCK */}
      {activeSubTab === "demolock" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
            {/* Header of Demo Lock */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Field External Demo Lock & QA Panel
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Consola de auditoría final para habilitar presentaciones controladas ante gerentes de O&M, comités PMGD y directores de seguridad.
                </p>
              </div>

              {/* Final Calculated Status Lock Badge */}
              {(() => {
                // Calculate states of the 8 frentes
                const frentes = {
                  propuesta: demoChecklist.fieldProposalReady ? "Ready" : "Needs Review",
                  presentation: demoChecklist.presentationModeReady ? "Ready" : "Needs Review",
                  privacy: (demoChecklist.noIpsRtspCredentials && demoChecklist.noRealData) ? "Ready" : "Blocked",
                  scope: (scope.pilotCameras >= 1 && scope.pilotCameras <= 3 && scope.pilotDuration >= 7 && scope.pilotDuration <= 15) ? "Ready" : "Needs Review",
                  readiness: readiness.label === "Ready for Field Pilot" ? "Ready" : (readiness.label === "Pending Authorization" ? "Blocked" : "Needs Review"),
                  objections: demoChecklist.objectionCardsReady ? "Ready" : "Needs Review",
                  report: demoChecklist.proposalReportReady ? "Ready" : "Needs Review",
                  language: demoChecklist.responsibleLanguagePass ? "Ready" : "Needs Review"
                };

                const hasBlocked = Object.values(frentes).includes("Blocked") || !demoChecklist.demoModeActive || !demoChecklist.noRealData || !demoChecklist.noIpsRtspCredentials;
                const hasNeedsReview = Object.values(frentes).includes("Needs Review") || Object.values(demoChecklist).includes(false);

                let finalStatus = "Ready for External Field Demo";
                let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                let iconColor = "text-emerald-400";

                if (hasBlocked) {
                  finalStatus = "Blocked";
                  badgeColor = "text-red-400 bg-red-500/10 border-red-500/30";
                  iconColor = "text-red-400";
                } else if (hasNeedsReview) {
                  finalStatus = "Needs Review";
                  badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
                  iconColor = "text-amber-400";
                }

                return (
                  <div className={`flex items-center gap-3 border rounded-xl p-3.5 ${badgeColor} max-w-md w-full md:w-auto shrink-0 shadow-lg`}>
                    <Shield className={`w-6 h-6 ${iconColor} shrink-0`} />
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider block opacity-70">ESTADO FINAL DE AUDITORÍA</span>
                      <span className="text-sm font-bold block uppercase">{finalStatus}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Introduction and context */}
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Este módulo de aseguramiento de calidad (QA) evalúa de manera continua si la propuesta comercial, la presentación interactiva, el constructor de alcances y el lenguaje oral del equipo de ventas están alineados con los estrictos principios de seguridad física y ciberseguridad industrial de <strong className="text-white">ORBI Sentinel IA</strong>.
            </p>

            {/* The 8 Frentes de Auditoría Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Los 8 Frentes de Auditoría de Campo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const frentes = [
                    {
                      id: "propuesta",
                      name: "Propuesta Ejecutiva Field",
                      status: demoChecklist.fieldProposalReady ? "Ready" : "Needs Review",
                      desc: "El documento de una página incluye problema, alcances y parámetros HSE.",
                    },
                    {
                      id: "presentation",
                      name: "Presentation Mode Field",
                      status: demoChecklist.presentationModeReady ? "Ready" : "Needs Review",
                      desc: "La secuencia de 9 diapositivas operacionales está auditada y lista.",
                    },
                    {
                      id: "privacy",
                      name: "Privacy & Authorization Brief",
                      status: (demoChecklist.noIpsRtspCredentials && demoChecklist.noRealData) ? "Ready" : "Blocked",
                      desc: "Asegura no abrir puertos públicos, enmascarar RTSP y requerir firmas.",
                    },
                    {
                      id: "scope",
                      name: "Pilot Scope Builder",
                      status: (scope.pilotCameras >= 1 && scope.pilotCameras <= 3 && scope.pilotDuration >= 7 && scope.pilotDuration <= 15) ? "Ready" : "Needs Review",
                      desc: "Propuesta de piloto acotada a un rango de 1-3 cámaras y de 7-15 días.",
                    },
                    {
                      id: "readiness",
                      name: "Readiness Score",
                      status: readiness.label === "Ready for Field Pilot" ? "Ready" : (readiness.label === "Pending Authorization" ? "Blocked" : "Needs Review"),
                      desc: `Requiere mínimo 80% (Actual: ${readiness.percent}%). Bloqueado si falta autorización.`,
                    },
                    {
                      id: "objections",
                      name: "Objection Cards",
                      status: demoChecklist.objectionCardsReady ? "Ready" : "Needs Review",
                      desc: "Las tarjetas de objeciones delimitan responsabilidades y NVRs.",
                    },
                    {
                      id: "report",
                      name: "Proposal Report",
                      status: demoChecklist.proposalReportReady ? "Ready" : "Needs Review",
                      desc: "Genera reporte Markdown sanitizado libre de credenciales o IPs reales.",
                    },
                    {
                      id: "language",
                      name: "Responsible Language Pass",
                      status: demoChecklist.responsibleLanguagePass ? "Ready" : "Needs Review",
                      desc: "Audita discursos y guiones para descartar prevenciones absolutas.",
                    }
                  ];

                  return frentes.map((f) => {
                    let badgeColor = "text-slate-400 bg-slate-900 border-slate-800";
                    if (f.status === "Ready") badgeColor = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20";
                    if (f.status === "Needs Review") badgeColor = "text-amber-400 bg-amber-500/5 border-amber-500/20";
                    if (f.status === "Blocked") badgeColor = "text-red-400 bg-red-500/5 border-red-500/20";

                    return (
                      <div key={f.id} className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-200 block">{f.name}</span>
                          <span className="text-[10px] text-slate-400 leading-normal block">{f.desc}</span>
                        </div>
                        <div className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded w-fit ${badgeColor}`}>
                          {f.status}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Pre-presentation External Checklist Section (12 factors) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  External Field Demo Checklist (Requisitos previos para demostración externa)
                </h4>
                <button
                  onClick={() => {
                    setDemoChecklist({
                      demoModeActive: true,
                      noRealData: true,
                      noIpsRtspCredentials: true,
                      fieldProposalReady: true,
                      presentationModeReady: true,
                      responsibleLanguagePass: true,
                      scopeBuilderConfigured: true,
                      readinessScoreReviewed: true,
                      guardrailsVisible: true,
                      objectionCardsReady: true,
                      proposalReportReady: true,
                      nextStepDefined: true
                    });
                    triggerToast("Checklist de demo externa restaurado.");
                  }}
                  className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 uppercase"
                >
                  Restablecer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: "demoModeActive", label: "Modo Demo Activo", tooltip: "Garantiza que no hay enlaces de red en vivo ni contraseñas activas en pantalla." },
                  { key: "noRealData", label: "Sin Datos Reales", tooltip: "Todo dato es inventado: se usan nombres genéricos de parques demo (Sur, Centro, Cordillera)." },
                  { key: "noIpsRtspCredentials", label: "Sin Exposición de IPs ni RTSP", tooltip: "La información de subredes e IP de las cámaras se mantiene oculta o enmascarada." },
                  { key: "fieldProposalReady", label: "Field Proposal Listo", tooltip: "El documento de una página está completo y describe la propuesta piloto." },
                  { key: "presentationModeReady", label: "Presentation Mode Listo", tooltip: "Las 9 diapositivas internas de negocio están preparadas para presentarse." },
                  { key: "responsibleLanguagePass", label: "Responsible Language Pass Listo", tooltip: "No se asumen detecciones perfectas ni prevenciones de robos garantizadas." },
                  { key: "scopeBuilderConfigured", label: "Scope Builder Configurado", tooltip: "El constructor se ha limitado a proponer un piloto acotado responsable de 1-3 cámaras." },
                  { key: "readinessScoreReviewed", label: "Readiness Score Revisado", tooltip: "Se ha completado el checklist de preparación técnica con el cliente." },
                  { key: "guardrailsVisible", label: "Guardrails Visibles en Interfaz", tooltip: "Los límites del alcance del software se exponen claramente ante el cliente." },
                  { key: "objectionCardsReady", label: "Objection Cards Listas", tooltip: "Las tarjetas interactivas de manejo de objeciones comerciales están operativas." },
                  { key: "proposalReportReady", label: "Proposal Report Listo", tooltip: "El reporte en Markdown para copiar y pegar está completamente sanitizado." },
                  { key: "nextStepDefined", label: "Próximo Paso Definido", tooltip: "Próximo paso claro: levantamiento inicial de red local y Gateway piloto." }
                ].map((item) => {
                  const val = demoChecklist[item.key as keyof typeof demoChecklist];
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setDemoChecklist((prev) => ({
                          ...prev,
                          [item.key]: !val
                        }));
                        triggerToast("Checklist de demo externa actualizado.");
                      }}
                      className="flex items-start gap-3 p-3 bg-slate-950 hover:bg-slate-900 rounded-xl text-left text-xs transition-all border border-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        readOnly
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer h-4 w-4 shrink-0 mt-0.5"
                      />
                      <div>
                        <span className={`block ${val ? "text-slate-200 font-bold" : "text-slate-500 line-through"}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-normal block mt-1">{item.tooltip}</span>
                      </div>
                    </button>
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
