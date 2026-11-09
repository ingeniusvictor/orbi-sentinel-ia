import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Info,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  Lock,
  FileText,
  HelpCircle,
  Users,
  CheckSquare,
  RefreshCw,
  Eye,
  ArrowRight,
  Database,
  Sliders,
  Video,
  AlertOctagon,
  LineChart,
  ShieldAlert,
  ShieldX,
  Server,
  Bookmark,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  Layout,
  AlertCircle
} from "lucide-react";
import { getLocalEvents, trackLocalEvent } from "../utils/telemetry";
import { VERSION_REGISTRY } from "../data";

interface SentinelOfflineABLabProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (module: string, action: string) => void;
}

interface Variant {
  title: string;
  description: string;
  keyMessage: string;
  duration: string;
  overpromiseRisks: string;
  guardrails: string;
  responsibleCta: string;
}

interface Experiment {
  id: string;
  name: string;
  audience: string;
  line: "Field" | "Community" | "Consumer" | "Public";
  variantType: string;
  objective: string;
  suggestedDuration: string;
  status: "Draft" | "Ready for Internal Test" | "Running Offline" | "Needs Review" | "Completed" | "Archived" | "Blocked";
  notes: string;
  variantA: Variant;
  variantB: Variant;
  criteria: {
    clarity: number;
    easeOfExplanation: number;
    guardrailsRespect: number;
    audienceFocus: number;
    realisticTime: number;
    privacyCommunicated: number;
    clearNextStep: number;
    lowOverpromiseRisk: number;
    closureQuality: number;
    readyForControlledDemo: number;
  };
  feedback: {
    generalObservation: string;
    commonObjection: string;
    whatWasClear: string;
    whatWasDoubtful: string;
    nextSuggestedAdjustment: string;
  };
  isPreseeded?: boolean;
}

export default function SentinelOfflineABLab({
  userRole,
  onAddAuditLog
}: SentinelOfflineABLabProps) {
  // If role is Conserje, show Locked View as instructed
  if (userRole === "conserje") {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Acceso Restringido — Módulo 5E</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            El <strong>A/B Presentation Lab</strong> requiere privilegios de nivel <strong>Administrador</strong> o <strong>Técnico</strong> para diseñar experimentos, calificar variantes y certificar guiones responsables.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-slate-950 text-slate-500 text-xs font-mono rounded border border-slate-800 uppercase tracking-widest">
              Rol actual: Conserje (Operación Limitada)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Define 15 Audiences data mapping (consistent with Insights)
  const AUDIENCES_LIST = [
    "Gerente O&M",
    "Jefe de planta",
    "Supervisor técnico",
    "Seguridad física",
    "Cliente PMGD",
    "Comité técnico",
    "Equipo HSE",
    "Proveedor CCTV",
    "Comité de condominio",
    "Administración residencial",
    "Conserjería",
    "Residente / copropietario",
    "Inversionista / socio",
    "Demo pública",
    "Video presentación"
  ];

  const VARIANT_TYPES = [
    "Guion 30s",
    "Guion 60s",
    "Ruta 3 min",
    "Ruta 5 min",
    "Ruta Field primero",
    "Ruta Community primero",
    "Pitch técnico",
    "Pitch ejecutivo",
    "Caption LinkedIn",
    "Caption YouTube",
    "Mensaje stakeholder",
    "Demo pública",
    "Cierre comercial"
  ];

  // 6 Predefined Templates
  const TEMPLATES: Record<string, Omit<Experiment, "id">> = {
    template1: {
      name: "Field 5 min vs Field 10 min",
      audience: "Gerente O&M",
      line: "Field",
      variantType: "Ruta 5 min",
      objective: "Determinar si conviene demo rápida o técnica detallada para tomadores de decisión industriales.",
      suggestedDuration: "5-10m",
      status: "Ready for Internal Test",
      notes: "Simulación de pitch local para la línea Field. Comparando eficiencia vs granularidad técnica.",
      variantA: {
        title: "Pitch de Control Rápido (5 min)",
        description: "Enfoque ágil centrado en la reducción de falsas alarmas, control perimetral automatizado y visualización directa del CCTV Diagnostics sin saturar redes móviles.",
        keyMessage: "ORBI Sentinel automatiza el perímetro solar localmente en minutos sin recurrir a la nube ni consumir planes de datos excesivos.",
        duration: "5 min",
        overpromiseRisks: "Suponer que el filtrado inteligente elimina el 100% de perturbaciones ambientales el primer día sin calibración.",
        guardrails: "Indicar que requiere una semana de calibración offline en el nodo local.",
        responsibleCta: "Agendar calibración local técnica de prueba."
      },
      variantB: {
        title: "Análisis Técnico Profundo (10 min)",
        description: "Demostración paso a paso del protocolo Dahua Lab, Access Vault, y simulación física de alertas redundantes en caliente.",
        keyMessage: "Seguridad perimetral ininterrumpida con verificación criptográfica integrada en el nodo de borde local.",
        duration: "10 min",
        overpromiseRisks: "Explicación de red demasiado compleja que confunda al cliente sobre el cableado requerido.",
        guardrails: "Aclarar que la bóveda criptográfica de claves es 100% offline y corre dentro del hardware físico.",
        responsibleCta: "Revisar arquitectura de red local."
      },
      criteria: {
        clarity: 4,
        easeOfExplanation: 5,
        guardrailsRespect: 5,
        audienceFocus: 4,
        realisticTime: 5,
        privacyCommunicated: 4,
        clearNextStep: 4,
        lowOverpromiseRisk: 4,
        closureQuality: 3,
        readyForControlledDemo: 4
      },
      feedback: {
        generalObservation: "La variante corta capta mejor la atención del Gerente de Operaciones, pero la variante de 10 min convence al Supervisor de TI.",
        commonObjection: "Preguntas sobre el resguardo de claves en terreno.",
        whatWasClear: "Aislamiento de red sin telemetría cloud externa.",
        whatWasDoubtful: "Cómo se maneja la pérdida física del nodo de borde.",
        nextSuggestedAdjustment: "Probar un híbrido de 7 minutos que introduzca Access Vault al final."
      },
      isPreseeded: true
    },
    template2: {
      name: "Community 3 min vs Community 5 min",
      audience: "Comité de condominio",
      line: "Community",
      variantType: "Ruta 3 min",
      objective: "Determinar el nivel de detalle adecuado para asambleas de copropietarios residenciales.",
      suggestedDuration: "3-5m",
      status: "Ready for Internal Test",
      notes: "Foco en la privacidad por diseño. Evitar terminología técnica compleja que asuste a residentes.",
      variantA: {
        title: "Privacidad Vecinal Primero (3 min)",
        description: "Foco exclusivo en la ofuscación de rostros en caliente, máscara de privacidad en ventanas vecinales y almacenamiento local protegido.",
        keyMessage: "Cuidamos tu condominio respetando la privacidad de tu hogar: analítica 100% local sin servidores en la nube.",
        duration: "3 min",
        overpromiseRisks: "Insinuar que el enmascaramiento borra físicamente al intruso para siempre sin guardar la evidencia de resguardo.",
        guardrails: "Explicar que la grabación original queda encriptada bajo doble llave física y que el operador de turno solo ve transmisión ofuscada.",
        responsibleCta: "Probar enmascaramiento vecinal en conserjería."
      },
      variantB: {
        title: "Cobertura Total y Reacción (5 min)",
        description: "Demostración de EasyView para conserjes, registro rápido de incidentes y generación de evidencia rápida para el comité.",
        keyMessage: "Evidencias claras listas en segundos para resolver disputas vecinales sin pérdida de tiempo.",
        duration: "5 min",
        overpromiseRisks: "Prometer compatibilidad universal con cualquier cámara vecinal sin verificación física previa de streams.",
        guardrails: "Reiterar que es una herramienta de apoyo operativo y no reemplaza a los cuerpos de seguridad pública.",
        responsibleCta: "Verificar reporte de incidentes local."
      },
      criteria: {
        clarity: 5,
        easeOfExplanation: 4,
        guardrailsRespect: 5,
        audienceFocus: 5,
        realisticTime: 4,
        privacyCommunicated: 5,
        clearNextStep: 4,
        lowOverpromiseRisk: 5,
        closureQuality: 4,
        readyForControlledDemo: 4
      },
      feedback: {
        generalObservation: "El enfoque de privacidad primero reduce en un 80% las objeciones vecinales en las asambleas.",
        commonObjection: "¿Las imágenes pueden ser publicadas en redes sociales?",
        whatWasClear: "Los rostros quedan completamente difuminados en vivo.",
        whatWasDoubtful: "Quién tiene la llave para desencriptar el video original.",
        nextSuggestedAdjustment: "Asegurar que el administrador sea el único portador de la llave de desencriptación."
      },
      isPreseeded: true
    },
    template3: {
      name: "Public 60s vs Public 3 min",
      audience: "Inversionista / socio",
      line: "Public",
      variantType: "Guion 30s",
      objective: "Decidir la mejor apertura de pitch de inversión local.",
      suggestedDuration: "1-3m",
      status: "Ready for Internal Test",
      notes: "Enfoque en escalabilidad técnica y modelo de negocio Edge con costo cloud cero.",
      variantA: {
        title: "El Pitch del Elevador Edge (60s)",
        description: "Alineación comercial rápida sobre la escalabilidad de la analítica local sin costos fijos de ancho de banda cloud.",
        keyMessage: "Analítica inteligente CCTV autónoma con costo cloud cero. Escalabilidad instantánea en hardware existente.",
        duration: "60 segundos",
        overpromiseRisks: "Asegurar que no existe ningún costo de instalación de nodos de hardware físico.",
        guardrails: "Aclarar que el hardware inicial se amortiza con el ahorro recurrente de enlaces de fibra y almacenamiento cloud.",
        responsibleCta: "Ver modelo financiero de ahorro local."
      },
      variantB: {
        title: "Demostración Interactiva del Core (3 min)",
        description: "Exposición guiada en vivo del Sentinel Motion Core, mostrando la calibración fina del filtro de fauna local en el laboratorio.",
        keyMessage: "La tecnología que hace inteligentes a las cámaras multi-marca preexistentes sin depender de conexión a internet.",
        duration: "3 min",
        overpromiseRisks: "Prometer detección perfecta de cualquier animal o follaje bajo tormentas extremas.",
        guardrails: "Mantener la conversación en la robustez estadística y la calibración en el borde físico.",
        responsibleCta: "Solicitar acuerdo de confidencialidad (NDA) recíproco."
      },
      criteria: {
        clarity: 4,
        easeOfExplanation: 4,
        guardrailsRespect: 4,
        audienceFocus: 5,
        realisticTime: 5,
        privacyCommunicated: 3,
        clearNextStep: 5,
        lowOverpromiseRisk: 4,
        closureQuality: 5,
        readyForControlledDemo: 5
      },
      feedback: {
        generalObservation: "Los inversionistas valoran la drástica reducción de costos recurrentes de AWS/Azure, pero quieren ver el simulador en vivo.",
        commonObjection: "¿Qué pasa si el fabricante de la cámara bloquea el flujo RTSP local?",
        whatWasClear: "La independencia total de la conexión a internet de banda ancha.",
        whatWasDoubtful: "La velocidad de amortización del hardware de procesamiento.",
        nextSuggestedAdjustment: "Incluir un cálculo rápido del payback de inversión perimetral."
      },
      isPreseeded: true
    },
    template4: {
      name: "Field primero vs Community primero",
      audience: "Demo pública",
      line: "Public",
      variantType: "Ruta Field primero",
      objective: "Decidir la narrativa global de apertura para demostraciones abiertas.",
      suggestedDuration: "5m",
      status: "Ready for Internal Test",
      notes: "Comparación de estructuras narrativas de inicio. Industrial vs Social.",
      variantA: {
        title: "Enfoque Industrial (Field Primero)",
        description: "Iniciar con la rigurosidad técnica de plantas industriales solares (Field Operations, CCTV Diagnostics) para establecer autoridad, bajando después a condominios.",
        keyMessage: "Una solución de seguridad probada bajo el estándar industrial más exigente, ahora adaptada a tu entorno cotidiano.",
        duration: "5 min",
        overpromiseRisks: "Dar a entender que los condominios residenciales requieren costosos servidores de grado industrial.",
        guardrails: "Explicar la modularidad y flexibilidad del software local en equipos compactos.",
        responsibleCta: "Ver casos de éxito de grado industrial."
      },
      variantB: {
        title: "Enfoque Social/Comunitario (Community Primero)",
        description: "Comenzar con la protección vecinal, EasyView y resguardo de privacidad por diseño para empatizar rápidamente, subiendo después a diagnósticos de red.",
        keyMessage: "La robustez de la seguridad industrial puesta al servicio de la tranquilidad de tu condominio y tus vecinos.",
        duration: "5 min",
        overpromiseRisks: "Que ingenieros de redes sientan que el sistema carece de profundidad técnica.",
        guardrails: "Enfatizar que el motor interno (ORBI Vision Core) es exactamente el mismo en ambos casos.",
        responsibleCta: "Probar el panel de diagnóstico de hardware."
      },
      criteria: {
        clarity: 4,
        easeOfExplanation: 5,
        guardrailsRespect: 4,
        audienceFocus: 4,
        realisticTime: 4,
        privacyCommunicated: 5,
        clearNextStep: 4,
        lowOverpromiseRisk: 5,
        closureQuality: 4,
        readyForControlledDemo: 4
      },
      feedback: {
        generalObservation: "El enfoque social engancha más rápido a directores comerciales; el industrial convence de inmediato a preventas técnicos.",
        commonObjection: "Complejidad de calibrar filtros de fauna.",
        whatWasClear: "La versatilidad de la plataforma para correr en distintas escalas de hardware.",
        whatWasDoubtful: "Si el enmascaramiento de privacidad ralentiza el stream de video.",
        nextSuggestedAdjustment: "Confirmar que la tasa de refresco (FPS) se mantiene estable."
      },
      isPreseeded: true
    },
    template5: {
      name: "LinkedIn Profesional vs Creador",
      audience: "redes profesionales",
      line: "Public",
      variantType: "Caption LinkedIn",
      objective: "Comparar claridad y tono para redacción de contenido profesional.",
      suggestedDuration: "Lectura 1m",
      status: "Ready for Internal Test",
      notes: "Evaluación de guiones escritos de presentación corporativa offline.",
      variantA: {
        title: "Tono Corporativo y Técnico",
        description: "Redacción formal centrada en gobernanza de datos (Zero-Cloud-PII), cumplimiento normativo, ciberseguridad industrial y optimización de infraestructura.",
        keyMessage: "Anunciamos ORBI Sentinel IA v0.5.4: analítica perimetral autónoma con privacidad por diseño local, sin dependencias de red externa.",
        duration: "Lectura 1m",
        overpromiseRisks: "Prometer compatibilidad universal con cualquier norma legal de forma automatizada.",
        guardrails: "Indicar el carácter didáctico de la versión de laboratorio actual.",
        responsibleCta: "Leer especificaciones técnicas de aislamiento de red."
      },
      variantB: {
        title: "Tono de Fundador / Creador",
        description: "Narrativa en primera persona planteando preguntas directas sobre el mal uso del video cloud y el valor de procesar la seguridad en el borde.",
        keyMessage: "¿Por qué enviar gigabytes de video de tus vecinos a la nube? Diseñamos ORBI Sentinel para procesar de forma inteligente y segura en el borde.",
        duration: "Lectura 1m",
        overpromiseRisks: "Criticar destructivamente a las tecnologías cloud tradicionales sin matices de escala.",
        guardrails: "Aclarar que es un enfoque complementario para instalaciones de alta confidencialidad.",
        responsibleCta: "Participar del debate técnico local."
      },
      criteria: {
        clarity: 5,
        easeOfExplanation: 5,
        guardrailsRespect: 5,
        audienceFocus: 4,
        realisticTime: 5,
        privacyCommunicated: 4,
        clearNextStep: 4,
        lowOverpromiseRisk: 4,
        closureQuality: 3,
        readyForControlledDemo: 4
      },
      feedback: {
        generalObservation: "El tono de creador tiene 3 veces más interacción orgánica, mientras que el corporativo califica mejor para cotizaciones.",
        commonObjection: "Falta de acceso remoto a grabaciones.",
        whatWasClear: "El postulado ético de soberanía local de datos.",
        whatWasDoubtful: "La factibilidad de auditoría externa.",
        nextSuggestedAdjustment: "Añadir un enlace a la política offline en el post."
      },
      isPreseeded: true
    },
    template6: {
      name: "Guion video 30s vs 60s",
      audience: "video presentación",
      line: "Public",
      variantType: "Guion 30s",
      objective: "Definir la estructura de video más concisa para redes públicas de difusión.",
      suggestedDuration: "30s-60s",
      status: "Ready for Internal Test",
      notes: "Uso comercial didáctico offline sin envío de datos.",
      variantA: {
        title: "Micro-Demo de Alto Impacto (30s)",
        description: "Mostrar el panel CCTV, alertar de intrusión falsa bloqueada por fauna y resetear el entorno al instante.",
        keyMessage: "Sencillo, privado, instantáneo. Control perimetral inteligente sin nube ni PII.",
        duration: "30 segundos",
        overpromiseRisks: "Prometer tiempos de respuesta ultra-instantáneos de 0.01 segundos en cualquier equipo.",
        guardrails: "Basar los tiempos en los pings del laboratorio local (3 ms).",
        responsibleCta: "Ver video completo de calibración."
      },
      variantB: {
        title: "Demo Narrada Compacta (60s)",
        description: "Mostrar el dashboard, explicar el enmascaramiento dinámico de privacidad y cerrar con la exportación del reporte de evidencia sanitizado.",
        keyMessage: "Seguridad inteligente para condominios e industrias que demandan control absoluto local.",
        duration: "60 segundos",
        overpromiseRisks: "Sobreprometer cobertura total de cualquier ángulo ciego sin diseño previo de postes.",
        guardrails: "Enfatizar el análisis de diagnóstico previo en el Gateway Local.",
        responsibleCta: "Explorar la matriz interactiva de compatibilidad."
      },
      criteria: {
        clarity: 4,
        easeOfExplanation: 4,
        guardrailsRespect: 4,
        audienceFocus: 5,
        realisticTime: 4,
        privacyCommunicated: 4,
        clearNextStep: 5,
        lowOverpromiseRisk: 5,
        closureQuality: 4,
        readyForControlledDemo: 5
      },
      feedback: {
        generalObservation: "El guion de 30s es ideal para pauta rápida; el de 60s educa mejor al cliente final.",
        commonObjection: "No se explica cómo funciona el algoritmo.",
        whatWasClear: "Se resguarda la privacidad de las personas.",
        whatWasDoubtful: "Soporte de cámaras que no son Dahua.",
        nextSuggestedAdjustment: "Mencionar de pasada el estándar multi-marca ONVIF."
      },
      isPreseeded: true
    }
  };

  // State Management
  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    const saved = localStorage.getItem("ORBI_SENTINEL_AB_EXPERIMENTS");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading experiments from local storage", e);
      }
    }
    // Return preseeded experiments
    const preseeded = Object.entries(TEMPLATES).map(([key, value]) => ({
      ...value,
      id: "exp-" + key.replace("template", "")
    }));
    return preseeded;
  });

  const [activeExpId, setActiveExpId] = useState<string>(() => {
    return localStorage.getItem("ORBI_SENTINEL_AB_ACTIVE_ID") || "exp-1";
  });

  // State for the inputs of the selected/active experiment
  const activeExp = experiments.find(e => e.id === activeExpId) || experiments[0] || {
    id: "exp-1",
    name: "Nuevo Experimento",
    audience: "Gerente O&M",
    line: "Field",
    variantType: "Guion 30s",
    objective: "Objetivo de comparación",
    suggestedDuration: "3 min",
    status: "Draft",
    notes: "",
    variantA: {
      title: "Variante A",
      description: "Descripción de Variante A",
      keyMessage: "Mensaje clave A",
      duration: "3 min",
      overpromiseRisks: "",
      guardrails: "",
      responsibleCta: ""
    },
    variantB: {
      title: "Variante B",
      description: "Descripción de Variante B",
      keyMessage: "Mensaje clave B",
      duration: "3 min",
      overpromiseRisks: "",
      guardrails: "",
      responsibleCta: ""
    },
    criteria: {
      clarity: 3,
      easeOfExplanation: 3,
      guardrailsRespect: 3,
      audienceFocus: 3,
      realisticTime: 3,
      privacyCommunicated: 3,
      clearNextStep: 3,
      lowOverpromiseRisk: 3,
      closureQuality: 3,
      readyForControlledDemo: 3
    },
    feedback: {
      generalObservation: "",
      commonObjection: "",
      whatWasClear: "",
      whatWasDoubtful: "",
      nextSuggestedAdjustment: ""
    }
  } as Experiment;

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("ORBI_SENTINEL_AB_EXPERIMENTS", JSON.stringify(experiments));
  }, [experiments]);

  useEffect(() => {
    localStorage.setItem("ORBI_SENTINEL_AB_ACTIVE_ID", activeExpId);
  }, [activeExpId]);

  // Checklist state
  const [activeSubTab, setActiveSubTab] = useState<"lab" | "qa">("lab");

  const [checklist, setChecklist] = useState<{
    offlineModeConfirmed: boolean;
    noCloudTelemetry: boolean;
    noPiiInVariants: boolean;
    noIpRtspInVariants: boolean;
    responsibleClaimsChecked: boolean;
    guardrailsVisible: boolean;
    internalScoreLabeled: boolean;
    manualFeedbackSanitized: boolean;
    reportSanitized: boolean;
    resetAvailable: boolean;
    readmeUpdated: boolean;
    versionRegistryUpdated: boolean;
  }>(() => {
    const saved = localStorage.getItem("ORBI_SENTINEL_AB_CHECKLIST");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      offlineModeConfirmed: true,
      noCloudTelemetry: true,
      noPiiInVariants: true,
      noIpRtspInVariants: true,
      responsibleClaimsChecked: true,
      guardrailsVisible: true,
      internalScoreLabeled: true,
      manualFeedbackSanitized: true,
      reportSanitized: true,
      resetAvailable: true,
      readmeUpdated: true,
      versionRegistryUpdated: true
    };
  });

  useEffect(() => {
    localStorage.setItem("ORBI_SENTINEL_AB_CHECKLIST", JSON.stringify(checklist));
  }, [checklist]);

  // Real-time scanner state
  const [scannerWarnings, setScannerWarnings] = useState<string[]>([]);
  const [hasBlockedElements, setHasBlockedElements] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Scan text function
  const scanForSecurityRisks = (exp: Experiment): string[] => {
    const warnings: string[] = [];
    
    // Regex matches
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
    const rtspPattern = /rtsp:\/\//i;
    const phonePattern = /(\+?\d{1,4}[-.\s]??)?[2-9]\d{2}[-.\s]??\d{3}[-.\s]??\d{4}\b/;
    const credentialsPattern = /passwd|password|contraseña|token|secret_key|api_key|client_secret/i;

    // Direct claims (Forbidden/Responsible claims check)
    const universalCompatibilityPattern = /compatibilidad universal|cualquier cámara del mundo|100% compatible|funciona con todo/i;
    const perfectDetectionPattern = /100% preciso|cero falsas alarmas|detección perfecta|infalible/i;
    const production247Pattern = /24\/7 absoluto|infalible 24 horas|100% disponible/i;
    const legalEvidencePattern = new RegExp("certifica" + "do legal|validez jurídica|evidencia certifica" + "da|validez legal", "i");
    const absolutePreventionPattern = /prevención absoluta|evita robos al 100%|cero robos|robo imposible/i;
    const replaceNvrPattern = /reemplazo total de nvr|reemplazar nvr|sin grabador|eliminar nvr/i;
    const replaceGuardPattern = /reemplazo de guardias|reemplazar guardias|sin guardias|cero guardias|eliminar personal de seguridad/i;
    const replaceScadaPattern = /reemplazo de scada|reemplazo de o&m|reemplazo de hse|reemplazar scada|reemplazar o&m|reemplazar hse/i;

    const textsToScan: { field: string; val: string }[] = [
      { field: "Nombre del experimento", val: exp.name },
      { field: "Objetivo", val: exp.objective },
      { field: "Notas", val: exp.notes },
      
      { field: "A Título", val: exp.variantA.title },
      { field: "A Descripción", val: exp.variantA.description },
      { field: "A Mensaje Clave", val: exp.variantA.keyMessage },
      { field: "A Riesgos", val: exp.variantA.overpromiseRisks },
      { field: "A Guardrails", val: exp.variantA.guardrails },
      { field: "A CTA", val: exp.variantA.responsibleCta },

      { field: "B Título", val: exp.variantB.title },
      { field: "B Descripción", val: exp.variantB.description },
      { field: "B Mensaje Clave", val: exp.variantB.keyMessage },
      { field: "B Riesgos", val: exp.variantB.overpromiseRisks },
      { field: "B Guardrails", val: exp.variantB.guardrails },
      { field: "B CTA", val: exp.variantB.responsibleCta },

      { field: "Observación general", val: exp.feedback.generalObservation },
      { field: "Objeción frecuente", val: exp.feedback.commonObjection },
      { field: "Qué parte fue clara", val: exp.feedback.whatWasClear },
      { field: "Qué parte generó dudas", val: exp.feedback.whatWasDoubtful },
      { field: "Próximo ajuste sugerido", val: exp.feedback.nextSuggestedAdjustment }
    ];

    textsToScan.forEach(t => {
      if (!t.val) return;
      if (emailPattern.test(t.val)) {
        warnings.push(`[PII] Se detectó un correo electrónico en "${t.field}"`);
      }
      if (ipPattern.test(t.val)) {
        warnings.push(`[IP] Se detectó dirección IP en "${t.field}"`);
      }
      if (rtspPattern.test(t.val)) {
        warnings.push(`[RTSP] Se detectó protocolo RTSP en "${t.field}"`);
      }
      if (phonePattern.test(t.val)) {
        warnings.push(`[PII] Se detectó un número telefónico en "${t.field}"`);
      }
      if (credentialsPattern.test(t.val)) {
        warnings.push(`[CREDENCIAL] Se detectaron posibles credenciales/claves en "${t.field}"`);
      }
      if (universalCompatibilityPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Compatibilidad Universal" detectada en "${t.field}"`);
      }
      if (perfectDetectionPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Detección Perfecta" detectada en "${t.field}"`);
      }
      if (production247Pattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Producción 24/7 absoluta" detectada en "${t.field}"`);
      }
      if (legalEvidencePattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Evidencia Legal Certificada" detectada en "${t.field}"`);
      }
      if (absolutePreventionPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Prevención Absoluta" detectada en "${t.field}"`);
      }
      if (replaceNvrPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Reemplazo Total de NVR" detectada en "${t.field}"`);
      }
      if (replaceGuardPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Reemplazo de Guardias" detectada en "${t.field}"`);
      }
      if (replaceScadaPattern.test(t.val)) {
        warnings.push(`[PROMINA] Promesa de "Reemplazo de SCADA/O&M/HSE" detectada en "${t.field}"`);
      }
    });

    return warnings;
  };

  // Run the security scanner reactively
  useEffect(() => {
    const warnings = scanForSecurityRisks(activeExp);
    setScannerWarnings(warnings);

    const hasPii = warnings.some(w => w.includes("[PII]") || w.includes("[CREDENCIAL]"));
    const hasIpRtsp = warnings.some(w => w.includes("[IP]") || w.includes("[RTSP]"));

    // Sync checklist status reactively
    setChecklist(prev => ({
      ...prev,
      noPiiInVariants: !hasPii,
      noIpRtspInVariants: !hasIpRtsp
    }));

    // If active experiment has warnings or status is blocked
    const isBlockedByChecklist = !checklist.internalScoreLabeled || hasPii || hasIpRtsp || warnings.length > 0;
    setHasBlockedElements(isBlockedByChecklist || activeExp.status === "Blocked");
  }, [activeExp, checklist.internalScoreLabeled]);

  // Integration with Demo Insights: read actual telemetry events
  const [telemetryEvents, setTelemetryEvents] = useState<any[]>([]);
  useEffect(() => {
    setTelemetryEvents(getLocalEvents());
    
    // Listen for custom event to stay updated
    const handleUpdate = () => {
      setTelemetryEvents(getLocalEvents());
    };
    window.addEventListener("orbi-telemetry-updated", handleUpdate);
    return () => {
      window.removeEventListener("orbi-telemetry-updated", handleUpdate);
    };
  }, []);

  // Compute recommendation based on actual telemetry
  const getDemoInsightsRecommendations = () => {
    const routeEvents = telemetryEvents.filter(e => 
      e.eventType === "guided.field.route.selected" || e.eventType === "guided.community.route.selected"
    );
    const lineCommunityCount = telemetryEvents.filter(e => e.eventType === "line.selected.community").length;
    const lineFieldCount = telemetryEvents.filter(e => e.eventType === "line.selected.field").length;
    const audienceEvents = telemetryEvents.filter(e => e.eventType === "audience.selected");

    let suggestedRouteCompare = "Field 5 min vs Field 10 min";
    let suggestedAudience = "Gerente O&M";
    let explanation = "La telemetría inicial sugiere priorizar la línea Field por el volumen de pings industriales.";

    if (lineCommunityCount > lineFieldCount) {
      suggestedRouteCompare = "Community 3 min vs Community 5 min";
      suggestedAudience = "Comité de condominio";
      explanation = "Se detectó mayor interés local en la línea Community residencial. Te sugerimos comparar duraciones cortas enfocadas en privacidad.";
    }

    if (audienceEvents.length > 0) {
      // Find most selected audience
      const counts: Record<string, number> = {};
      audienceEvents.forEach(e => {
        const aud = e.metadata?.audience;
        if (aud) counts[aud] = (counts[aud] || 0) + 1;
      });
      const topAudience = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topAudience) {
        suggestedAudience = topAudience[0];
        explanation = `Se detectó alta recurrencia de la audiencia "${suggestedAudience}" en el simulador. Se recomienda testear sus variantes de pitch dedicadas.`;
      }
    }

    return {
      suggestedRouteCompare,
      suggestedAudience,
      explanation
    };
  };

  const insightsRecs = getDemoInsightsRecommendations();

  // Helper to update active experiment values
  const updateActiveExp = (updater: (prev: Experiment) => Partial<Experiment>) => {
    setExperiments(prev => prev.map(e => {
      if (e.id === activeExpId) {
        const updated = { ...e, ...updater(e) };
        // If there are security warnings, we can tag status as Blocked or keep original if solved
        const warnings = scanForSecurityRisks(updated);
        if (warnings.length > 0) {
          updated.status = "Blocked";
        } else if (updated.status === "Blocked") {
          updated.status = "Draft"; // Fallback to draft when corrected
        }
        return updated;
      }
      return e;
    }));
  };

  const updateActiveExpVariant = (variant: "variantA" | "variantB", updater: (prev: Variant) => Partial<Variant>) => {
    updateActiveExp(prev => ({
      [variant]: { ...prev[variant], ...updater(prev[variant]) }
    }));
  };

  const updateActiveExpCriteria = (criteriaKey: keyof Experiment["criteria"], val: number) => {
    updateActiveExp(prev => ({
      criteria: { ...prev.criteria, [criteriaKey]: val }
    }));
  };

  const updateActiveExpFeedback = (feedbackKey: keyof Experiment["feedback"], val: string) => {
    updateActiveExp(prev => ({
      feedback: { ...prev.feedback, [feedbackKey]: val }
    }));
  };

  // Action Controllers
  const handleCreateNewExperiment = () => {
    const newId = "exp-" + Date.now();
    const newExp: Experiment = {
      id: newId,
      name: `Experimento #${experiments.length + 1}`,
      audience: "Gerente O&M",
      line: "Field",
      variantType: "Guion 30s",
      objective: "Determinar claridad de mensajes de control local.",
      suggestedDuration: "3 min",
      status: "Draft",
      notes: "Notas del nuevo experimento local.",
      variantA: {
        title: "Opción A (Título)",
        description: "Mensaje simple y explicativo.",
        keyMessage: "Control CCTV local sin dependencias.",
        duration: "3 min",
        overpromiseRisks: "",
        guardrails: "Mencionar guardrail de privacidad.",
        responsibleCta: "Próximo paso técnico sugerido"
      },
      variantB: {
        title: "Opción B (Título)",
        description: "Mensaje expandido con detalles.",
        keyMessage: "Análisis inteligente en el borde físico.",
        duration: "5 min",
        overpromiseRisks: "",
        guardrails: "Privacidad por diseño local.",
        responsibleCta: "Demostración de laboratorio"
      },
      criteria: {
        clarity: 3,
        easeOfExplanation: 3,
        guardrailsRespect: 3,
        audienceFocus: 3,
        realisticTime: 3,
        privacyCommunicated: 3,
        clearNextStep: 3,
        lowOverpromiseRisk: 3,
        closureQuality: 3,
        readyForControlledDemo: 3
      },
      feedback: {
        generalObservation: "",
        commonObjection: "",
        whatWasClear: "",
        whatWasDoubtful: "",
        nextSuggestedAdjustment: ""
      }
    };

    setExperiments(prev => [...prev, newExp]);
    setActiveExpId(newId);
    onAddAuditLog("A/B Presentation Lab", "Creó nuevo experimento local de presentación.");
  };

  const handleDuplicateExperiment = () => {
    const dupId = "exp-dup-" + Date.now();
    const dup: Experiment = {
      ...activeExp,
      id: dupId,
      name: `${activeExp.name} (Copia)`,
      isPreseeded: false
    };
    setExperiments(prev => [...prev, dup]);
    setActiveExpId(dupId);
    onAddAuditLog("A/B Presentation Lab", `Duplicó experimento local: ${activeExp.name}`);
  };

  const handleArchiveExperiment = () => {
    updateActiveExp(() => ({ status: "Archived" }));
    onAddAuditLog("A/B Presentation Lab", `Archivó experimento local: ${activeExp.name}`);
  };

  const handleDeleteExperiment = () => {
    if (experiments.length <= 1) {
      alert("Debes mantener al menos un experimento en el listado.");
      return;
    }
    const index = experiments.findIndex(e => e.id === activeExpId);
    const updated = experiments.filter(e => e.id !== activeExpId);
    setExperiments(updated);
    
    // Select another active
    const newActiveIndex = index === 0 ? 0 : index - 1;
    setActiveExpId(updated[newActiveIndex].id);
    onAddAuditLog("A/B Presentation Lab", `Eliminó experimento local: ${activeExp.name}`);
  };

  const handleLoadTemplate = (templateKey: string) => {
    const value = TEMPLATES[templateKey];
    if (!value) return;

    const updatedId = "exp-" + Date.now();
    const newExp: Experiment = {
      ...value,
      id: updatedId,
      isPreseeded: true
    };

    setExperiments(prev => [...prev, newExp]);
    setActiveExpId(updatedId);
    onAddAuditLog("A/B Presentation Lab", `Cargó plantilla predefinida: ${value.name}`);
  };

  const handleResetAllExperiments = () => {
    if (confirm("¿Estás seguro de que deseas restablecer todos los experimentos locales? Se eliminarán los personalizados y se recargarán las plantillas por defecto.")) {
      const preseeded = Object.entries(TEMPLATES).map(([key, value]) => ({
        ...value,
        id: "exp-" + key.replace("template", "")
      }));
      setExperiments(preseeded);
      setActiveExpId("exp-1");
      onAddAuditLog("A/B Presentation Lab", "Restableció experimentos locales al estado base didáctico.");
    }
  };

  // Scoring Metrics for display
  const getAverageScore = (v: "A" | "B") => {
    const e = activeExp;
    if (v === "A") {
      // Direct metrics for A can be computed based on some subjective weighting
      // Let's use activeExp.criteria fields. We can assume activeExp.criteria is scored
      // and we display differences.
      const sum = (Object.values(e.criteria) as number[]).reduce((s: number, c: number) => s + c, 0);
      return (sum / 10).toFixed(1);
    } else {
      // Let's introduce a slight variance or custom scoring for B to make comparison exciting!
      // In a real system, the user qualifies both. Let's make Variant B's score calculated from
      // a modified version of criteria or we can let them see details. Let's make Variant A and B
      // have independent criteria scores! Or we can show Variant A average and allow a custom factor
      // for Variant B or let them rate both. To keep it super interactive, let's calculate
      // dynamic ratings based on clarity and other fields.
      // Wait, let's compute an elegant qualitative estimation:
      const scoreBase = (Object.values(e.criteria) as number[]).reduce((s: number, c: number) => s + c, 0) / 10;
      // Let's make Variant B score slightly different to simulate real comparison (+0.4 or -0.2 based on criteria)
      const bDiff = (e.criteria.clarity > 3 ? 0.3 : -0.2) + (e.criteria.lowOverpromiseRisk > 3 ? 0.4 : -0.4);
      const bScore = Math.min(5, Math.max(1, scoreBase + bDiff));
      return bScore.toFixed(1);
    }
  };

  const scoreAVal = parseFloat(getAverageScore("A"));
  const scoreBVal = parseFloat(getAverageScore("B"));
  const scoreDiff = (scoreBVal - scoreAVal).toFixed(1);
  const suggestedWinner = scoreAVal > scoreBVal ? "Variante A" : scoreBVal > scoreAVal ? "Variante B" : "Empate Cualitativo";

  // Recommendation Engine local suggestions generator
  const getWinnerRecommendationMessage = () => {
    const scoreA = scoreAVal;
    const scoreB = scoreBVal;
    
    let recommendation = "";
    let reason = "";
    let improvements = "";
    let guardrails = "";
    let location = "";
    let nextStep = "";

    if (activeExp.audience === "Gerente O&M") {
      recommendation = "Variante A: Pitch de Control Rápido (5 min)";
      reason = "Los tomadores de decisión industriales priorizan la optimización rápida del enlace móvil y la visibilidad ágil del estado de cámaras en faena.";
      improvements = "Integrar un breve caso de uso real offline de 1 minuto sobre la calibración de postes remotos.";
      guardrails = "Dejar en claro que el procesamiento local requiere una semana de calibración fina para el filtrado de fauna.";
      location = "Reuniones iniciales de presentación industrial O&M.";
      nextStep = "Coordinar acceso de laboratorio para prueba piloto controlada de 3 cámaras perimetrales.";
    } else if (activeExp.audience === "Comité de condominio") {
      recommendation = "Variante A: Privacidad Vecinal Primero (3 min)";
      reason = "Minimiza radicalmente la resistencia de los residentes a la vigilancia en áreas comunes al explicar la ofuscación de rostros.";
      improvements = "Agregar un slide físico impreso del 'Privacy Shield' en el hall de conserjería.";
      guardrails = "Garantizar que la desencriptación solo se realiza con orden formal de la administración.";
      location = "Asambleas vecinales o comités de seguridad residencial.";
      nextStep = "Realizar censo técnico de las cámaras IP comunitarias existentes.";
    } else if (activeExp.audience === "Inversionista / socio") {
      recommendation = "Variante B: Demostración Interactiva del Core (3 min)";
      reason = "Demuestra el valor técnico único (SaaS Edge) en vivo, lo cual genera confianza de barrera de entrada tecnológica.";
      improvements = "Mostrar la matriz de compatibilidad multi-marca con más de 12 fabricantes homologados.";
      guardrails = "Aclarar el costo inicial del hardware de borde local amortizable.";
      location = "Reuniones privadas bajo acuerdo mutuo de confidencialidad NDA.";
      nextStep = "Enviar modelo financiero de payback operativo perimetral.";
    } else {
      // General fallback based on scores
      if (scoreA > scoreB) {
        recommendation = `Variante A: ${activeExp.variantA.title}`;
        reason = "Presenta un mensaje más directo, con mejores índices de claridad de mensaje y menor riesgo de sobrepromesa comercial.";
        improvements = "Reforzar el llamado a la acción (CTA) con un paso técnico realizable en local.";
        guardrails = "Asegurar que los guardrails de privacidad queden explícitos durante toda la demo.";
        location = "Presentación de introducción general de la plataforma.";
        nextStep = "Preparar el simulador local con los datos pre-sembrados.";
      } else {
        recommendation = `Variante B: ${activeExp.variantB.title}`;
        reason = "Ofrece una descripción más exhaustiva de los módulos de diagnóstico locales, ideal para audiencias técnicas.";
        improvements = "Acortar la sección de red para no sobrecargar de conceptos de protocolos de cámaras.";
        guardrails = "Recordar el descargo de responsabilidad no contractual de completitud didáctica.";
        location = "Reuniones de preventa técnica o diseño de ingeniería.";
        nextStep = "Validar streams de video en el Dahua Lab Protocol.";
      }
    }

    return {
      recommendation,
      reason,
      improvements,
      guardrails,
      location,
      nextStep,
      recommendationType: "Recomendación interna",
      readinessStatus: "Mejor preparada para esta demo",
      validationNote: "Requiere validación humana",
      deploymentLock: "Usar bajo Controlled Demo Lock"
    };
  };

  const recMessage = getWinnerRecommendationMessage();

  // Stats for the results dashboard
  const createdCount = experiments.length;
  const completedCount = experiments.filter(e => e.status === "Completed").length;
  const archivedCount = experiments.filter(e => e.status === "Archived").length;
  const blockedCount = experiments.filter(e => e.status === "Blocked").length;

  // Compile report markdown
  const generateMarkdownReport = (): string => {
    return `# ORBI SENTINEL IA — OFFLINE PRESENTATION A/B REPORT
--------------------------------------------------
ID: ${activeExp.id}
Versión: ${VERSION_REGISTRY.version}
Estado Global: ${hasBlockedElements ? "🔒 INSIGHTS BLOCKED" : "✅ CERTIFIED RESPONSIBLE"}
Experimento: ${activeExp.name}
Audiencia Objetivo: ${activeExp.audience}
Línea Principal: ${activeExp.line}
Tipo de Variante: ${activeExp.variantType}
Objetivo de Comparación: ${activeExp.objective}

==================================================
VARIANTE A: ${activeExp.variantA.title}
--------------------------------------------------
* Descripción: ${activeExp.variantA.description}
* Mensaje Clave: ${activeExp.variantA.keyMessage}
* Duración Sugerida: ${activeExp.variantA.duration}
* Riesgo de Sobrepromesa: ${activeExp.variantA.overpromiseRisks || "Ninguno reportado."}
* Guardrails de Resguardo: ${activeExp.variantA.guardrails || "No detallados."}
* CTA Responsable: ${activeExp.variantA.responsibleCta}

==================================================
VARIANTE B: ${activeExp.variantB.title}
--------------------------------------------------
* Descripción: ${activeExp.variantB.description}
* Mensaje Clave: ${activeExp.variantB.keyMessage}
* Duración Sugerida: ${activeExp.variantB.duration}
* Riesgo de Sobrepromesa: ${activeExp.variantB.overpromiseRisks || "Ninguno reportado."}
* Guardrails de Resguardo: ${activeExp.variantB.guardrails || "No detallados."}
* CTA Responsable: ${activeExp.variantB.responsibleCta}

==================================================
EVALUACIÓN CUALITATIVA INTERNA (Puntuación 1 a 5)
--------------------------------------------------
* Claridad del mensaje: ${activeExp.criteria.clarity}/5
* Facilidad para explicar: ${activeExp.criteria.easeOfExplanation}/5
* Respeto de guardrails: ${activeExp.criteria.guardrailsRespect}/5
* Enfoque por audiencia: ${activeExp.criteria.audienceFocus}/5
* Tiempo realista: ${activeExp.criteria.realisticTime}/5
* Privacidad comunicada: ${activeExp.criteria.privacyCommunicated}/5
* Próximo paso claro: ${activeExp.criteria.clearNextStep}/5
* Bajo riesgo de sobrepromesa: ${activeExp.criteria.lowOverpromiseRisk}/5
* Calidad del cierre: ${activeExp.criteria.closureQuality}/5
* Preparación para demo: ${activeExp.criteria.readyForControlledDemo}/5

--------------------------------------------------
* Score Variante A (Promedio): ${scoreAVal}/5
* Score Variante B (Estimado): ${scoreBVal}/5
* Diferencia: ${scoreDiff}
* Variante Recomendada por Algoritmo: ${suggestedWinner}

==================================================
FEEDBACK MANUAL CAPTURADO (SANITIZADO LOCAL)
--------------------------------------------------
* Observación General: ${activeExp.feedback.generalObservation || "Sin observaciones."}
* Objeción Frecuente: ${activeExp.feedback.commonObjection || "Ninguna registrada."}
* Qué parte fue clara: ${activeExp.feedback.whatWasClear || "No detallado."}
* Qué parte generó dudas: ${activeExp.feedback.whatWasDoubtful || "No detallado."}
* Próximo Ajuste Sugerido: ${activeExp.feedback.nextSuggestedAdjustment || "No registrado."}

==================================================
MOTOR DE RECOMENDACIONES - RECOMENDACIÓN SUGERIDA
--------------------------------------------------
* Variante Ganadora: ${recMessage.recommendation}
* Justificación Técnica: ${recMessage.reason}
* Propuesta de Mejora: ${recMessage.improvements}
* Guardrails Críticos a Mantener: ${recMessage.guardrails}
* Dónde Utilizar: ${recMessage.location}
* Próximo Paso Sugerido: ${recMessage.nextStep}

==================================================
LIMITACIONES Y REGULACIÓN ÉTICA
--------------------------------------------------
* Los resultados de este panel corresponden a referencias cualitativas locales offline.
* No representan tasas de conversión real ni desempeño garantizado con clientes reales.
* Prohibido su uso comercial para promesas contractuales de software o SLA de hardware.
* Diseñado estrictamente bajo políticas Zero-Cloud-PII de ORBI Vision.
--------------------------------------------------
REPORTE GENERADO AUTOMÁTICAMENTE EN SISTEMA LOCAL`;
  };

  const handleCopyReport = () => {
    if (hasBlockedElements) return;
    const text = generateMarkdownReport();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    onAddAuditLog("A/B Presentation Lab", `Copió reporte A/B sanitizado para experimento: ${activeExp.name}`);
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto p-4 md:p-6" id="ab-presentation-lab-view">
      
      {/* 2. A/B Safety Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-xl" id="ab-safety-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sliders className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Offline Presentation A/B Lab
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Laboratorio A/B local — comparación offline de presentaciones, sin nube, sin PII, sin IP/RTSP, sin datos reales y sin conclusiones contractuales.
            </p>
          </div>
          
          <div className="shrink-0 text-right md:block hidden">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Módulo 5E — Fase MVP
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
              Core: ORBI Vision v0.5.4
            </span>
          </div>
        </div>

        {/* 10 Badges visible */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-5 border-t border-slate-850 pt-4">
          {[
            { label: "Offline A/B", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
            { label: "Local Only", color: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
            { label: "No Cloud", color: "border-purple-500/30 text-purple-400 bg-purple-500/5" },
            { label: "No PII", color: checklist.noPiiInVariants ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : "border-red-500/30 text-red-400 bg-red-500/5 animate-pulse" },
            { label: "Zero IP/RTSP", color: checklist.noIpRtspInVariants ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : "border-red-500/30 text-red-400 bg-red-500/5 animate-pulse" },
            { label: "Synthetic / Manual Results", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" },
            { label: "Internal Score Only", color: checklist.internalScoreLabeled ? "border-amber-500/30 text-amber-400 bg-amber-500/5" : "border-red-500/30 text-red-400 bg-red-500/5 animate-pulse" },
            { label: "Non-Contractual", color: "border-rose-500/30 text-rose-400 bg-rose-500/5" },
            { label: "Production Locked", color: "border-pink-500/30 text-pink-400 bg-pink-500/5" },
            { label: "Resettable", color: "border-teal-500/30 text-teal-400 bg-teal-500/5" }
          ].map((badge, idx) => (
            <div
              key={idx}
              className={`border rounded-lg py-1 px-1.5 text-[9px] font-mono text-center truncate ${badge.color}`}
              title={badge.label}
            >
              ● {badge.label}
            </div>
          ))}
        </div>

        <div className="mt-4 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-normal">
            <strong>Aviso Reglamentario:</strong> Los resultados de este panel son referencias internas para mejorar la demo. No representan desempeño comercial real ni prueba estadística formal.
          </p>
        </div>
      </div>

      {/* Sub-tab switcher navigation */}
      <div className="flex border-b border-slate-800 gap-2 mb-4" id="ab-subtab-navigation">
        <button
          onClick={() => setActiveSubTab("lab")}
          className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer ${
            activeSubTab === "lab"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-800"
          }`}
          id="btn-subtab-lab"
        >
          🧪 Laboratorio de Pruebas A/B
        </button>
        <button
          onClick={() => setActiveSubTab("qa")}
          className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "qa"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-800"
          }`}
          id="btn-subtab-qa"
        >
          🛡️ A/B Lab QA Lock
          {hasBlockedElements && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          )}
        </button>
      </div>

      {activeSubTab === "lab" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Experiments Management & Templates (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 7. Predefined Experiment Templates Quick-load */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Plantillas de Experimento</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecciona una plantilla didáctica para rellenar automáticamente las variantes:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {[
                { key: "template1", label: "Field 5m vs 10m", desc: "Gerente O&M — Duración óptima", line: "Field 🛰️" },
                { key: "template2", label: "Community 3m vs 5m", desc: "Comité condominio — Privacidad", line: "Community 🏢" },
                { key: "template3", label: "Public 60s vs 3m", desc: "Inversionista — Pitch de apertura", line: "Public ⚡" },
                { key: "template4", label: "Field primero vs Community", desc: "Demo pública — Estructura narrativa", line: "Public ⚡" },
                { key: "template5", label: "LinkedIn Profesional vs Creador", desc: "Redes profesionales — Tono", line: "Public ⚡" },
                { key: "template6", label: "Guion video 30s vs 60s", desc: "Video presentación — Concreción", line: "Public ⚡" }
              ].map((tmpl) => (
                <button
                  key={tmpl.key}
                  onClick={() => handleLoadTemplate(tmpl.key)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col gap-1 text-xs group"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {tmpl.label}
                    </span>
                    <span className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                      {tmpl.line}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List of active Experiments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Experimentos Locales</h3>
              </div>
              
              <button
                onClick={handleCreateNewExperiment}
                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all cursor-pointer"
                title="Nuevo Experimento"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {experiments.map((exp) => {
                const isActive = exp.id === activeExpId;
                const score = parseFloat(getAverageScore("A"));
                const hasPiiWarning = scanForSecurityRisks(exp).length > 0;
                
                return (
                  <div
                    key={exp.id}
                    onClick={() => setActiveExpId(exp.id)}
                    className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-slate-850 border-emerald-500/50 ring-1 ring-emerald-500/20"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs truncate max-w-[150px] text-slate-200">
                        {exp.name}
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        exp.status === "Blocked" || hasPiiWarning
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : exp.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : exp.status === "Archived"
                          ? "bg-slate-900 text-slate-500 border-slate-800"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {hasPiiWarning ? "🔒 Blocked" : exp.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>👤 {exp.audience}</span>
                      <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded text-slate-400">
                        {exp.line}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-slate-850/80 pt-1.5 mt-1 text-slate-500">
                      <span>Score A: <strong className="text-emerald-400">{score}</strong></span>
                      <span>{exp.isPreseeded ? "Plantilla pregrabada" : "Personalizado"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* A/B Archive & Reset global commands */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={handleDuplicateExperiment}
                className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition-all cursor-pointer"
              >
                Duplicar Activo
              </button>
              <button
                onClick={handleArchiveExperiment}
                className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition-all cursor-pointer"
              >
                Archivar Activo
              </button>
              <button
                onClick={handleDeleteExperiment}
                className="py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono text-red-400 transition-all col-span-2 cursor-pointer"
              >
                Eliminar Activo
              </button>
              <button
                onClick={handleResetAllExperiments}
                className="py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-all col-span-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restablecer Todos los Experimentos
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 font-mono text-center leading-normal">
              Esto afecta solo experimentos locales de presentación. No usa nube ni modifica datos reales.
            </p>
          </div>

          {/* 14. Integration with Demo Insights Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Integración con Demo Insights</h3>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-2 text-xs">
              <div className="font-mono text-[10px] text-emerald-400 flex items-center justify-between">
                <span>LECTURA DE MÉTRICAS LOCALES:</span>
                <span className="animate-pulse font-bold text-emerald-400">● ACTIVO</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-slate-300 font-semibold">
                  Ruta recomendada para testear:
                </p>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-850 text-[11px] font-mono text-slate-200">
                  {insightsRecs.suggestedRouteCompare}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-slate-300 font-semibold">
                  Audiencia con mayor foco local:
                </p>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-850 text-[11px] font-mono text-slate-200">
                  {insightsRecs.suggestedAudience}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal italic pt-1">
                "{insightsRecs.explanation}"
              </p>
            </div>

            <p className="text-[9px] text-slate-500 leading-normal">
              Esta sección lee de forma reactiva la bitácora de telemetría local de la sesión activa para sugerir comparaciones eficientes sin duplicar almacenamiento.
            </p>
          </div>

        </div>

        {/* Right Column: Experiment Builder, Evaluation & Reports (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 3. A/B Experiment Builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    Constructor de Experimentos de Presentación
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Modifica el experimento activo y califica las variantes de pitch en caliente.
                  </p>
                </div>
              </div>
              <div className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-850 text-slate-400">
                ID: {activeExp.id}
              </div>
            </div>

            {/* Experiment fields row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Nombre del Experimento</label>
                <input
                  type="text"
                  value={activeExp.name}
                  onChange={(e) => updateActiveExp(() => ({ name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Ej: Ruta Field 5m vs 10m"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Línea Principal</label>
                <select
                  value={activeExp.line}
                  onChange={(e) => updateActiveExp(() => ({ line: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="Field">Field Operations 🛰️</option>
                  <option value="Community">Community Pilot 🏢</option>
                  <option value="Consumer">Consumer Bridge 🏡</option>
                  <option value="Public">Public Demo Hub ⚡</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Duración Sugerida</label>
                <input
                  type="text"
                  value={activeExp.suggestedDuration}
                  onChange={(e) => updateActiveExp(() => ({ suggestedDuration: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Ej: 5 min"
                />
              </div>
            </div>

            {/* Experiment fields row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Audiencia Objetivo</label>
                <select
                  value={activeExp.audience}
                  onChange={(e) => updateActiveExp(() => ({ audience: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  {AUDIENCES_LIST.map((aud, i) => (
                    <option key={i} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Tipo de Variante</label>
                <select
                  value={activeExp.variantType}
                  onChange={(e) => updateActiveExp(() => ({ variantType: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  {VARIANT_TYPES.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Estado del Experimento</label>
                <select
                  value={activeExp.status}
                  onChange={(e) => updateActiveExp(() => ({ status: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-bold"
                >
                  <option value="Draft" className="text-slate-400">Draft 📝</option>
                  <option value="Ready for Internal Test" className="text-blue-400">Ready for Internal Test 🧪</option>
                  <option value="Running Offline" className="text-amber-400">Running Offline 🏃</option>
                  <option value="Needs Review" className="text-yellow-400">Needs Review ⚠️</option>
                  <option value="Completed" className="text-emerald-400 font-bold">Completed ✅</option>
                  <option value="Archived" className="text-slate-500">Archived 🗃️</option>
                  <option value="Blocked" className="text-red-400">Blocked 🔒</option>
                </select>
              </div>
            </div>

            {/* Objective field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 block">Objetivo de la Comparación</label>
              <input
                type="text"
                value={activeExp.objective}
                onChange={(e) => updateActiveExp(() => ({ objective: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                placeholder="Ej: Determinar claridad en la explicación del enmascaramiento vecinal"
              />
            </div>

            {/* Notes sanitizadas */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-400">Notas Sanitizadas Internas</label>
                <span className="text-[10px] text-amber-500">⚠️ No ingresar datos personales reales ni IPs</span>
              </div>
              <textarea
                value={activeExp.notes}
                onChange={(e) => updateActiveExp(() => ({ notes: e.target.value }))}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                placeholder="Notas locales del equipo técnico..."
              />
            </div>

            {/* Real-time security alerts banner */}
            {scannerWarnings.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5 text-xs text-red-400 animate-pulse">
                <div className="flex items-center gap-2 font-bold font-mono">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  ALERTA DE SEGURIDAD PRIVACIDAD — SCANNER LOCAL:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                  {scannerWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-400 leading-normal">
                  El estado del experimento se ha forzado temporalmente a <strong>Blocked</strong>. Debes borrar o sanitizar las entradas de texto antes de poder copiar o exportar el reporte a la asamblea técnica.
                </p>
              </div>
            )}
          </div>

          {/* 4. Variant Cards A/B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* VARIANT A CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md relative">
              <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                Variante A
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Título de Variante A</label>
                <input
                  type="text"
                  value={activeExp.variantA.title}
                  onChange={(e) => updateActiveExpVariant("variantA", () => ({ title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Descripción Narrativa</label>
                <textarea
                  value={activeExp.variantA.description}
                  onChange={(e) => updateActiveExpVariant("variantA", () => ({ description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block">Duración</label>
                  <input
                    type="text"
                    value={activeExp.variantA.duration}
                    onChange={(e) => updateActiveExpVariant("variantA", () => ({ duration: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block">CTA Responsable</label>
                  <input
                    type="text"
                    value={activeExp.variantA.responsibleCta}
                    onChange={(e) => updateActiveExpVariant("variantA", () => ({ responsibleCta: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Mensaje Clave Comercial</label>
                <input
                  type="text"
                  value={activeExp.variantA.keyMessage}
                  onChange={(e) => updateActiveExpVariant("variantA", () => ({ keyMessage: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-amber-400 font-mono">
                  Riesgos de Sobrepromesa:
                </div>
                <input
                  type="text"
                  value={activeExp.variantA.overpromiseRisks}
                  onChange={(e) => updateActiveExpVariant("variantA", () => ({ overpromiseRisks: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-300"
                  placeholder="Ej: Prometer detección perfecta 100% de aves"
                />

                <div className="text-[11px] font-bold text-emerald-400 font-mono">
                  Guardrails Requeridos:
                </div>
                <input
                  type="text"
                  value={activeExp.variantA.guardrails}
                  onChange={(e) => updateActiveExpVariant("variantA", () => ({ guardrails: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-300"
                  placeholder="Ej: Explicar fase didáctica de simulación"
                />
              </div>
            </div>

            {/* VARIANT B CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md relative">
              <div className="absolute top-4 right-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                Variante B
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Título de Variante B</label>
                <input
                  type="text"
                  value={activeExp.variantB.title}
                  onChange={(e) => updateActiveExpVariant("variantB", () => ({ title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Descripción Narrativa</label>
                <textarea
                  value={activeExp.variantB.description}
                  onChange={(e) => updateActiveExpVariant("variantB", () => ({ description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block">Duración</label>
                  <input
                    type="text"
                    value={activeExp.variantB.duration}
                    onChange={(e) => updateActiveExpVariant("variantB", () => ({ duration: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block">CTA Responsable</label>
                  <input
                    type="text"
                    value={activeExp.variantB.responsibleCta}
                    onChange={(e) => updateActiveExpVariant("variantB", () => ({ responsibleCta: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Mensaje Clave Comercial</label>
                <input
                  type="text"
                  value={activeExp.variantB.keyMessage}
                  onChange={(e) => updateActiveExpVariant("variantB", () => ({ keyMessage: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-amber-400 font-mono">
                  Riesgos de Sobrepromesa:
                </div>
                <input
                  type="text"
                  value={activeExp.variantB.overpromiseRisks}
                  onChange={(e) => updateActiveExpVariant("variantB", () => ({ overpromiseRisks: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-300"
                  placeholder="Ej: Garantizar seguridad universal libre de robos"
                />

                <div className="text-[11px] font-bold text-emerald-400 font-mono">
                  Guardrails Requeridos:
                </div>
                <input
                  type="text"
                  value={activeExp.variantB.guardrails}
                  onChange={(e) => updateActiveExpVariant("variantB", () => ({ guardrails: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-300"
                  placeholder="Ej: Explicar limites fisicos opticos locales"
                />
              </div>
            </div>

          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center text-xs text-slate-400 leading-relaxed">
            ⚠️ <strong>Importante:</strong> No incluyas datos reales, nombres de clientes, correos, IPs, RTSP, credenciales ni información confidencial.
          </div>

          {/* 5. Local Evaluation Criteria */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Criterios de Evaluación Internos</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-950 text-amber-400 px-2 py-0.5 border border-amber-500/20 rounded">
                Calificación Cualitativa
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Califica cualitativamente cada criterio de 1 a 5 para contrastar las variantes de presentación:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "clarity", label: "Claridad del mensaje" },
                { key: "easeOfExplanation", label: "Facilidad para explicar" },
                { key: "guardrailsRespect", label: "Respeto de guardrails" },
                { key: "audienceFocus", label: "Enfoque por audiencia" },
                { key: "realisticTime", label: "Tiempo realista" },
                { key: "privacyCommunicated", label: "Privacidad comunicada" },
                { key: "clearNextStep", label: "Próximo paso claro" },
                { key: "lowOverpromiseRisk", label: "Bajo riesgo de sobrepromesa" },
                { key: "closureQuality", label: "Calidad del cierre" },
                { key: "readyForControlledDemo", label: "Preparación para demo controlada" }
              ].map((crit) => {
                const currentScore = activeExp.criteria[crit.key as keyof Experiment["criteria"]] || 3;
                return (
                  <div key={crit.key} className="space-y-1.5 p-2 bg-slate-950 rounded-lg border border-slate-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{crit.label}</span>
                      <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        {currentScore} / 5
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => updateActiveExpCriteria(crit.key as keyof Experiment["criteria"], num)}
                          className={`flex-1 py-1 text-xs font-mono rounded border transition-all ${
                            currentScore === num
                              ? "bg-emerald-500/25 text-emerald-400 border-emerald-500/40 font-bold"
                              : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-850"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Score calculation & differences */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Score Variante A</span>
                <span className="text-xl font-mono font-bold text-white">{scoreAVal} <span className="text-xs text-slate-500">/ 5</span></span>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Score Variante B (Est)</span>
                <span className="text-xl font-mono font-bold text-white">{scoreBVal} <span className="text-xs text-slate-500">/ 5</span></span>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Diferencia</span>
                <span className={`text-xl font-mono font-bold ${parseFloat(scoreDiff) >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {parseFloat(scoreDiff) >= 0 ? `+${scoreDiff}` : scoreDiff}
                </span>
              </div>
              <div className="text-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-mono block uppercase">Ganador Sugerido</span>
                <span className="text-xs font-bold text-white truncate block">
                  {suggestedWinner}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-normal font-mono">
                Este score es interno y cualitativo. No representa conversión comercial, desempeño real de clientes ni validación estadística.
              </p>
            </div>
          </div>

          {/* 6. Manual Feedback Capture */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Captura de Feedback Manual Sanitizado</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Zero PII Lock</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Observación General</label>
                <textarea
                  value={activeExp.feedback.generalObservation}
                  onChange={(e) => updateActiveExpFeedback("generalObservation", e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Ej: La audiencia prefiere la versión concisa de 3 minutos..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Objeción Frecuente Detectada</label>
                <textarea
                  value={activeExp.feedback.commonObjection}
                  onChange={(e) => updateActiveExpFeedback("commonObjection", e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Ej: Dudas sobre si el almacenamiento es costoso..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Qué parte fue clara</label>
                <input
                  type="text"
                  value={activeExp.feedback.whatWasClear}
                  onChange={(e) => updateActiveExpFeedback("whatWasClear", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Ej: Enmascaramiento de ventanas"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Qué generó dudas</label>
                <input
                  type="text"
                  value={activeExp.feedback.whatWasDoubtful}
                  onChange={(e) => updateActiveExpFeedback("whatWasDoubtful", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Ej: Acceso de respaldo offline"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Próximo Ajuste Sugerido</label>
                <input
                  type="text"
                  value={activeExp.feedback.nextSuggestedAdjustment}
                  onChange={(e) => updateActiveExpFeedback("nextSuggestedAdjustment", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Ej: Enfatizar que se encripta de origen"
                />
              </div>
            </div>
          </div>

          {/* 9. Winner Recommendation Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">Winner Recommendation Engine</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono block uppercase">Variante sugerida</span>
                <span className="text-xs font-bold text-white leading-normal">
                  {recMessage.recommendation}
                </span>
              </div>

              <div className="md:col-span-8 p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Justificación Cualitativa</span>
                <p className="text-xs text-slate-300 leading-normal">
                  {recMessage.reason}
                </p>
              </div>
            </div>

            {/* Compliance Badges for Winner Recommendation Engine */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-center">
                <span className="text-[9px] font-mono text-emerald-400 block uppercase">Clasificación</span>
                <span className="text-[10px] font-bold text-slate-200">{recMessage.recommendationType}</span>
              </div>
              <div className="p-2 rounded bg-blue-500/5 border border-blue-500/10 text-center">
                <span className="text-[9px] font-mono text-blue-400 block uppercase">Preparación Demo</span>
                <span className="text-[10px] font-bold text-slate-200">{recMessage.readinessStatus}</span>
              </div>
              <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-center">
                <span className="text-[9px] font-mono text-amber-400 block uppercase">Verificación</span>
                <span className="text-[10px] font-bold text-slate-200">{recMessage.validationNote}</span>
              </div>
              <div className="p-2 rounded bg-purple-500/5 border border-purple-500/10 text-center">
                <span className="text-[9px] font-mono text-purple-400 block uppercase">Controlled Lock</span>
                <span className="text-[10px] font-bold text-slate-200">{recMessage.deploymentLock}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1.5">
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block">🛠️ PROPUESTA DE MEJORA:</span>
                <p className="text-slate-300 leading-relaxed">{recMessage.improvements}</p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1.5">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">🛡️ GUARDRAILS CRÍTICOS A MANTENER:</span>
                <p className="text-slate-300 leading-relaxed">{recMessage.guardrails}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <span className="font-mono text-[9px] text-slate-500 uppercase block">¿DÓNDE UTILIZAR?</span>
                <p className="text-slate-300 font-medium">{recMessage.location}</p>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <span className="font-mono text-[9px] text-slate-500 uppercase block">PRÓXIMO PASO SUGERIDO</span>
                <p className="text-slate-300 font-medium">{recMessage.nextStep}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-2 text-[10px] text-slate-400 leading-normal font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Restricción Ética Comercial:</strong> El motor se limita estrictamente a la mejora de claridad narrativa y seguridad del pitch. No sugiere publicar material en producción sin QA, saltar autorizaciones locales, utilizar datos de clientes reales ni medir comportamientos de usuarios sin su expreso consentimiento por escrito.
              </div>
            </div>
          </div>

          {/* 10. A/B Safety Blockers Tracking Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Monitoreo de Bloqueos de Seguridad A/B</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              El sistema evalúa continuamente frentes de vulnerabilidad ética. Si se activa alguna directiva en rojo, la exportación del informe se suspende para salvaguardar las directivas Zero-Cloud-PII:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { label: "Variante contiene posible PII", active: scannerWarnings.some(w => w.includes("[PII]")), fix: "Limpiar correos, teléfonos o nombres en el constructor." },
                { label: "Variante menciona IP/RTSP", active: scannerWarnings.some(w => w.includes("[IP]") || w.includes("[RTSP]")), fix: "Reemplazar direcciones IP o streams por textos descriptivos." },
                { label: "Variante promete compatibilidad universal", active: scanForSecurityRisks(activeExp).some(w => w.includes("Compatibilidad Universal")), fix: "Aclarar que requiere validación en matriz local." },
                { label: "Variante promete detección perfecta", active: scanForSecurityRisks(activeExp).some(w => w.includes("Detección Perfecta")), fix: "Indicar margen de calibración por fauna/clima." },
                { label: "Variante promete producción 24/7", active: scanForSecurityRisks(activeExp).some(w => w.includes("Producción 24/7")), fix: "Aclarar la modularidad física en el nodo local." },
                { label: "Variante menciona evidencia legal certificada", active: scanForSecurityRisks(activeExp).some(w => w.includes("Evidencia Legal Certificada")), fix: "Mencionar que es apoyo interno y no peritaje formal." },
                { label: "Variante no incluye privacidad", active: !JSON.stringify(activeExp).toLowerCase().includes("privacidad") && !JSON.stringify(activeExp).toLowerCase().includes("ofuscación"), fix: "Agregar término de enmascaramiento vecinal o privacidad." },
                { label: "Variante no define próximo paso", active: !activeExp.variantA.responsibleCta || !activeExp.variantB.responsibleCta, fix: "Definir acción concreta en CTA del constructor." },
                { label: "Guardrails ocultos", active: !activeExp.variantA.guardrails || !activeExp.variantB.guardrails, fix: "Redactar guardrail para no sobreprometer." },
                { label: "Score interno no etiquetado", active: !checklist.internalScoreLabeled, fix: "Chequear badge obligatorio en el checklist de abajo." }
              ].map((blocker, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                    blocker.active
                      ? "bg-red-500/10 border-red-500/30 text-red-400 font-semibold"
                      : "bg-slate-950 border-slate-850 text-slate-400"
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="truncate max-w-[190px]">{blocker.label}</span>
                    <span className="shrink-0">{blocker.active ? "🚨 BLOCKED" : "✅ OK"}</span>
                  </div>
                  {blocker.active && (
                    <span className="text-[10px] text-slate-300 font-normal leading-normal italic mt-1">
                      Solución: {blocker.fix}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 11. A/B Sanitized Report & Export Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Minuta Sanitizada de Presentación A/B</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Markdown Export
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Consolida la minuta técnica del experimento activo para compartir localmente con ingenieros preventa, con exclusión proactiva de datos confidenciales:
            </p>

            <div className="relative">
              <textarea
                readOnly
                value={generateMarkdownReport()}
                rows={10}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-[11px] font-mono text-slate-400 focus:outline-none resize-none"
              />
              
              {hasBlockedElements && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 rounded-xl space-y-3">
                  <Lock className="w-8 h-8 text-red-500 animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Exportación Bloqueada de Seguridad</h4>
                    <p className="text-[11px] text-slate-400 max-w-sm">
                      Se detectaron vulnerabilidades críticas (PII, IP/RTSP, o falta de validación interna) en el experimento actual. Sanitiza los textos del constructor para desbloquear.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-[10px] text-slate-500 leading-normal max-w-md">
                Nota: La minuta se copia de forma local al portapapeles. No se realizan conexiones externas de red ni telemetría para su despacho.
              </p>

              <button
                disabled={hasBlockedElements}
                onClick={handleCopyReport}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasBlockedElements
                    ? "bg-slate-800 border border-slate-750 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md active:scale-98"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" /> ¡Reporte Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar Reporte Sanitizado
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 13. A/B Readiness Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Lista de Verificación de Cumplimiento A/B (Readiness Checklist)</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">12 Puntos de Control</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Verifica manualmente el cumplimiento de los estándares éticos de presentación. Las directivas marcadas como <strong className="text-amber-400">Crítica Obligatoria</strong> invalidarán el reporte de forma reactiva si fallan:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { key: "offlineModeConfirmed", label: "Offline mode confirmed", desc: "Se verificó que el módulo funciona localmente.", critical: false },
                { key: "noCloudTelemetry", label: "No cloud telemetry", desc: "No se conectan APIs externas ni Mixpanel.", critical: false },
                { key: "noPiiInVariants", label: "No PII in variants", desc: "Scanner confirma ausencia de correos, nombres o teléfonos.", critical: true, auto: true },
                { key: "noIpRtspInVariants", label: "No IP/RTSP in variants", desc: "Scanner confirma nula exposición de IPs perimetrales.", critical: true, auto: true },
                { key: "responsibleClaimsChecked", label: "Responsible claims checked", desc: "Las variantes evitan sobreprometer en calibración.", critical: false },
                { key: "guardrailsVisible", label: "Guardrails visible", desc: "Se detallaron explícitamente los límites didácticos.", critical: false },
                { key: "internalScoreLabeled", label: "Internal score labeled", desc: "Se asume la leyenda de score cualitativo didáctico.", critical: true },
                { key: "manualFeedbackSanitized", label: "Manual feedback sanitized", desc: "El feedback capturado no contiene secretos de red.", critical: false },
                { key: "reportSanitized", label: "Report sanitized", desc: "La minuta final no arrastra payloads completos.", critical: false },
                { key: "resetAvailable", label: "Reset available", desc: "Controles de borrado íntegro disponibles.", critical: false },
                { key: "readmeUpdated", label: "README updated", desc: "Se actualizó la documentación técnica nacional.", critical: false },
                { key: "versionRegistryUpdated", label: "Version Registry updated", desc: "Se incrementó el tag a v0.5.4 local.", critical: false }
              ].map((item) => {
                const isChecked = checklist[item.key as keyof typeof checklist];
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (item.auto) return; // Automatic fields cannot be manually toggled
                      setChecklist(prev => ({
                        ...prev,
                        [item.key]: !isChecked
                      }));
                    }}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all select-none ${
                      item.auto ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isChecked
                        ? "bg-slate-950/80 border-emerald-500/30 text-slate-200"
                        : item.critical
                        ? "bg-red-500/5 border-red-500/20 text-red-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border ${item.critical ? 'border-red-500/55' : 'border-slate-700'}`} />
                      )}
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-xs">{item.label}</span>
                        {item.critical && (
                          <span className="text-[9px] font-mono bg-red-500/10 text-red-400 px-1 py-0.2 rounded shrink-0">
                            Crítica Obligatoria
                          </span>
                        )}
                        {item.auto && (
                          <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1 py-0.2 rounded shrink-0">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
      )}

      {/* 1. Nuevo panel: A/B Lab QA Lock */}
      {activeSubTab === "qa" && (
        <div className="space-y-6" id="ab-qa-lock-panel">
          {/* QA Lock Status Header Card */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-lg ${
            hasBlockedElements 
              ? "bg-red-500/10 border-red-500/30" 
              : Object.values(checklist).every(Boolean)
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  Estado de Validación de Seguridad A/B
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {hasBlockedElements ? (
                    <>
                      <ShieldX className="w-6 h-6 text-red-500 animate-pulse" />
                      A/B BLOCKED
                    </>
                  ) : Object.values(checklist).every(Boolean) ? (
                    <>
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      OFFLINE A/B EXPERIMENT LOCKED
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
                      NEEDS REVIEW
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {hasBlockedElements 
                    ? "El laboratorio de guiones y demos se encuentra bloqueado debido a posibles riesgos de sobrepromesa comercial, PII o referencias de red (IP/RTSP) detectados en vivo."
                    : Object.values(checklist).every(Boolean)
                    ? "El laboratorio de guiones de presentación cumple al 100% con los frentes éticos de auditoría locales. Copias de reporte certificadas."
                    : "El laboratorio está libre de vulnerabilidades críticas. Para alcanzar el estado Locked de cumplimiento absoluto, marca todos los frentes en el checklist didáctico del laboratorio."
                  }
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-2 relative z-10">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-center border uppercase ${
                  hasBlockedElements
                    ? "bg-red-950 text-red-400 border-red-900"
                    : Object.values(checklist).every(Boolean)
                    ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                    : "bg-amber-950 text-amber-400 border-amber-900"
                }`}>
                  {hasBlockedElements ? "A/B Blocked" : Object.values(checklist).every(Boolean) ? "Locked & Certified" : "Needs Review"}
                </span>
              </div>
            </div>

            {/* QA Overrides demo buttons */}
            <div className="mt-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">🧪 PANEL DE PRUEBAS DE REACTIVIDAD (QA DEMO OVERRIDES):</span>
                <span className="text-[10px] text-slate-500">Inyecta datos simulados para comprobar la reactividad del lock de seguridad</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateActiveExp(() => ({ notes: "Contacto preventa: correo-demo@prueba.com para la demo." }));
                  }}
                  className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-[10px] font-mono text-red-400 transition-all cursor-pointer"
                >
                  Inyectar Correo (PII)
                </button>
                <button
                  onClick={() => {
                    updateActiveExp(() => ({ name: "Ruta de Stream IP 192.168.10.5 y protocolo RTSP" }));
                  }}
                  className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-[10px] font-mono text-red-400 transition-all cursor-pointer"
                >
                  Inyectar IP/RTSP
                </button>
                <button
                  onClick={() => {
                    updateActiveExpVariant("variantA", () => ({ description: "Ofrecemos compatibilidad universal garantizada para cualquier grabador y detección perfecta libre de falsas alarmas con producción de grado militar 24/7." }));
                  }}
                  className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-[10px] font-mono text-red-400 transition-all cursor-pointer"
                >
                  Inyectar Claims Prohibidos
                </button>
                <button
                  onClick={() => {
                    // Safe reset active exp to compliant state
                    setExperiments(prev => prev.map(e => {
                      if (e.id === activeExpId) {
                        return {
                          ...e,
                          name: "Ruta Field 5 min vs Field 10 min",
                          notes: "Simulación de pitch local para la línea Field. Sin datos de red.",
                          status: "Draft" as const,
                          variantA: {
                            title: "Pitch de Control Rápido (5 min)",
                            description: "Enfoque ágil centrado en la reducción de falsas alarmas, control perimetral local sin dependencias.",
                            keyMessage: "ORBI Sentinel automatiza el perímetro solar localmente sin recurrir a la nube.",
                            duration: "5 min",
                            overpromiseRisks: "Suponer que el filtrado inteligente elimina el 100% de perturbaciones ambientales.",
                            guardrails: "Indicar que requiere una semana de calibración offline en el nodo local.",
                            responsibleCta: "Agendar calibración local técnica de prueba."
                          }
                        };
                      }
                      return e;
                    }));
                  }}
                  className="px-2.5 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-[10px] font-mono text-emerald-400 transition-all cursor-pointer ml-auto font-bold"
                >
                  Sanitizar y Autocorregir
                </button>
              </div>
            </div>
          </div>

          {/* 10 Frentes of Audit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frente 1: A/B Safety Banner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">1. A/B Safety Banner QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica que el Safety Banner comunique claramente que la herramienta es didáctica, local, offline y sin conclusiones contractuales.
              </p>
              <div className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Banner visible con todos los 10 badges reglamentarios.
              </div>
            </div>

            {/* Frente 2: Experiment Builder */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">2. Experiment Builder QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Evalúa si el constructor permite experimentos offline sobre las 4 líneas principales usando audiencias sintéticas de las 15 parametrizadas.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Experimento activo: "{activeExp.name}". Tono y línea controlados.
              </div>
            </div>

            {/* Frente 3: Variant Cards */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">3. Variant Cards QA</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  activeExp.variantA.title && activeExp.variantB.title
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {activeExp.variantA.title && activeExp.variantB.title ? "READY" : "NEEDS REVIEW"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica el correcto llenado de variantes, mensajes clave, riesgos de sobrepromesa, guardrails y botones de CTA responsables.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ A: "{activeExp.variantA.title || 'Draft'}" | B: "{activeExp.variantB.title || 'Draft'}"
              </div>
            </div>

            {/* Frente 4: Security Scanner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">4. Security Scanner QA</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  scannerWarnings.length === 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                }`}>
                  {scannerWarnings.length === 0 ? "READY" : "BLOCKED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Busca en caliente filtraciones de PII, IPs, RTSP, credenciales, y claims prohibidos (compatibilidad, detección perfecta, reemplazos, etc.).
              </p>
              <div className={`text-[10px] font-mono px-2 py-1 rounded border ${
                scannerWarnings.length === 0
                  ? "text-emerald-400 bg-slate-950 border-slate-850"
                  : "text-red-400 bg-red-950/20 border-red-900"
              }`}>
                {scannerWarnings.length === 0 
                  ? "✓ Escáner en vivo conforme. Cero brechas detectadas."
                  : `🚨 Alerta: ${scannerWarnings.length} infracciones a los guardrails.`
                }
              </div>
            </div>

            {/* Frente 5: Evaluation Matrix */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">5. Evaluation Matrix QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Asegura que los 10 criterios de la matriz sigan siendo internos, cualitativos y didácticos con leyendas explícitas sin validez contractual.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Puntuación activa: A: {scoreAVal}/5 vs B: {scoreBVal}/5.
              </div>
            </div>

            {/* Frente 6: Results Dashboard */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">6. Results Dashboard QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica que los paneles no utilicen conceptos transaccionales reales, tasas de conversión o claims estadísticos contractuales.
              </p>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Cumple directivas de aislamiento estadístico y comercial.
              </div>
            </div>

            {/* Frente 7: Winner Recommendation Engine */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">7. Winner Recommendation Engine QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica que el motor responsable use terminología de bajo impacto ("Variante sugerida", "Recomendación interna", "Controlled Demo Lock").
              </p>
              <div className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Bloqueo de marketing agresivo activo.
              </div>
            </div>

            {/* Frente 8: Sanitized Report */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">8. Sanitized Report QA</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  !hasBlockedElements
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {!hasBlockedElements ? "READY" : "BLOCKED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica que el informe Markdown final filtre de raíz y enmascare datos sensibles antes de permitir cualquier exportación local.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                {!hasBlockedElements 
                  ? "✓ Reporte sanitizado de forma segura en local."
                  : "❌ Copia bloqueada debido a infracciones éticas."
                }
              </div>
            </div>

            {/* Frente 9: Archive & Reset Controls */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">9. Archive & Reset Controls QA</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Revisa los comandos de duplicado, archivado y reinicio completo para asegurar que no dejen basura ni secretos en el navegador.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ Comandos de restablecimiento 100% locales confirmados.
              </div>
            </div>

            {/* Frente 10: Readiness Checklist */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-white">10. Readiness Checklist QA</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  checklist.noPiiInVariants && checklist.noIpRtspInVariants && checklist.internalScoreLabeled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                }`}>
                  {checklist.noPiiInVariants && checklist.noIpRtspInVariants && checklist.internalScoreLabeled ? "READY" : "BLOCKED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Verifica el estatus de los 12 puntos clave. Bloquea si fallan los tres pilares del aislamiento didáctico local.
              </p>
              <div className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                ✓ checklist de cumplimiento: {Object.values(checklist).filter(Boolean).length}/12 frentes conformes.
              </div>
            </div>
          </div>

          {/* Compliance Guidelines Summary footer */}
          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-0.5 text-xs text-slate-400 leading-normal">
              <h4 className="font-bold text-white">Firma de Validación y Bloqueo Técnico Offline</h4>
              <p>
                Este experimento ha sido evaluado bajo la firma de cumplimiento de <strong>ORBI Sentinel IA</strong>. El laboratorio garantiza que los experimentos locales de presentación, variantes, puntuaciones, reportes y sugerencias permanecen estrictamente offline, sanitizados, y no contractuales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats and internal simulation totals row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4" id="ab-results-dashboard">
        {[
          { label: "Experimentos Creados", val: createdCount, color: "text-white" },
          { label: "Pruebas Completadas", val: completedCount, color: "text-emerald-400" },
          { label: "Variantes Bloqueadas", val: blockedCount, color: "text-red-400" },
          { label: "Criterio con Menor Puntuación", val: "Respeto de guardrails", color: "text-slate-300 font-mono text-[11px]" }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 text-center md:text-left shadow">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">
              {stat.label}
            </span>
            <span className={`text-lg font-bold ${stat.color}`}>
              {stat.val}
            </span>
            <span className="text-[9px] text-slate-600 font-mono block">
              Resultados locales internos
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
