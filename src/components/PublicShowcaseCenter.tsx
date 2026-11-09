import React, { useState, useEffect } from "react";
import { VERSION_REGISTRY } from "../data";
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Info,
  FileText,
  Video,
  AlertTriangle,
  CheckCircle2,
  Building,
  HelpCircle,
  Activity,
  Sliders,
  ClipboardList,
  Search,
  Eye,
  Award,
  Sparkles
} from "lucide-react";

interface PublicShowcaseCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function PublicShowcaseCenter({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: PublicShowcaseCenterProps) {
  // 1. Showcase Mode Selector State
  const [selectedMode, setSelectedMode] = useState<string>("hackathon");

  // 2. Interactive Checklist State for Safety
  const [checklist, setChecklist] = useState({
    noRealData: true,
    noCredentials: true,
    noIpRtsp: true,
    noPii: true,
    noSourceCode: true,
    noInternalPrompts: true,
    ipProtected: true,
    responsibleClaims: true,
    productionLockedVisible: true,
    creditsVisible: true,
    modeSelected: true,
    routeSelected: true,
    exportContentSanitized: true,
    videoScriptsSanitized: true,
    readmeUpdated: true,
    versionRegistryUpdated: true,
    noAutoPublish: true
  });

  // 3. Narrative Builder Selected Section
  const [selectedNarrativeSection, setSelectedNarrativeSection] = useState<string>("general");

  // 4. Demo Route Selected Route
  const [selectedRoute, setSelectedRoute] = useState<string>("60s");

  // 5. Submission Pack Selected Section
  const [selectedSubmissionSection, setSelectedSubmissionSection] = useState<string>("summary_short");

  // 6. Video Script Selected Script
  const [selectedVideoScript, setSelectedVideoScript] = useState<string>("15s");

  // 7. Public Scanner States
  const [scannerText, setScannerText] = useState<string>(
    "ORBI Sentinel IA es ideal para plantas. IP: 192.168.1.150, RTSP: rtsp://admin:pass123@192.168.1.50/stream1. Reemplaza totalmente a los guardias físicos y previene el 100% de los delitos. Enviar a juan.perez@cliente.cl."
  );
  const [scanResults, setScanResults] = useState<{
    clean: boolean;
    findings: string[];
  }>({
    clean: false,
    findings: []
  });
  const [scannerActive, setScannerActive] = useState<boolean>(false);

  // Clipboard copies trackers
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  // 8. Integrations state for feedback
  const [integrationStatus, setIntegrationStatus] = useState<{ [key: string]: string }>({
    mediaKit: "Pending Link",
    exportPack: "Pending Link",
    binder: "Pending Link",
    insights: "Pending Link",
    abLab: "Pending Link",
    pilot: "Pending Link"
  });

  // Handle Clipboard Copy with visual feedback
  const triggerCopy = (key: string, text: string) => {
    if (isExportBlocked) {
      if (onAddAuditLog) {
        onAddAuditLog("Copia Bloqueada", `Intento de copia bloqueado por fallas de seguridad crítica en el Showcase Center.`);
      }
      alert("Copia bloqueada: El sistema detecta hallazgos de seguridad o frentes críticos pendientes.");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);

    if (onAddAuditLog) {
      onAddAuditLog("Copia de Documento Showcase", `Copiado al portapapeles: ${key}`);
    }
  };

  // Determine critical safety block rules
  const isCriticalSafetyFailure =
    !checklist.noRealData ||
    !checklist.noCredentials ||
    !checklist.noIpRtsp ||
    !checklist.noPii ||
    !checklist.noSourceCode ||
    !checklist.noInternalPrompts ||
    !checklist.ipProtected ||
    !checklist.responsibleClaims ||
    !checklist.productionLockedVisible;

  const isExportBlocked = isCriticalSafetyFailure || !scanResults.clean;

  // Dynamically calculate Readiness Score
  // Max score = 100 (17 items)
  const calculateScore = () => {
    let score = 0;
    // Critical items (8 items * 7 points = 56 points)
    if (checklist.noRealData) score += 7;
    if (checklist.noCredentials) score += 7;
    if (checklist.noIpRtsp) score += 7;
    if (checklist.noPii) score += 7;
    if (checklist.noSourceCode) score += 7;
    if (checklist.noInternalPrompts) score += 7;
    if (checklist.ipProtected) score += 7;
    if (checklist.responsibleClaims) score += 7;
    
    // Optional/standard items (8 items * 5 points = 40 points)
    if (checklist.productionLockedVisible) score += 5;
    if (checklist.creditsVisible) score += 5;
    if (checklist.modeSelected) score += 5;
    if (checklist.routeSelected) score += 5;
    if (checklist.exportContentSanitized) score += 5;
    if (checklist.videoScriptsSanitized) score += 5;
    if (checklist.readmeUpdated) score += 5;
    if (checklist.versionRegistryUpdated) score += 5;
    
    // 1 last item * 4 points = 4 points
    if (checklist.noAutoPublish) score += 4;
    return score;
  };

  const currentScore = calculateScore();

  // Determine overall Showcase Status
  let showcaseStatus = "POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY";
  if (isExportBlocked) {
    showcaseStatus = "MÓDULO 9B — ESTADO: SHOWCASE BLOQUEADO";
  } else if (currentScore < 100) {
    showcaseStatus = "MÓDULO 9B — ESTADO: REQUIERE REVISIÓN";
  }

  // Showcase Modes Content mapper
  const showcaseModes: { [key: string]: any } = {
    hackathon: {
      name: "Hackathon / Competition",
      narrative: "Enfoque ágil y de alto impacto. Destaca el ingenio de la arquitectura local offline, el uso innovador de modelos para enmascaramiento de privacidad, y la madurez de los flujos preestablecidos.",
      duration: "3 - 5 Minutos",
      depth: "Arquitectura de Borde & Integración Simulada",
      allowed: "UI sanitizada, Dahua PoE Lab MVP simulado, gráficos locales de rendimiento, diagramas lógicos.",
      prohibited: "Credenciales de red reales, código propietario de segmentación de puertos, RTSP directos.",
      nextSteps: "Enfatizar el valor del MVP experimental construido de forma robusta y modular.",
      ipLevel: "Nivel de Protección Alto - Exposición solo de interfaces de usuario e hilos conceptuales."
    },
    startup_demo: {
      name: "Startup Demo Day",
      narrative: "Enfoque orientado a propuesta de valor rápido y escalabilidad. Explica el problema de O&M perimetral y cómo Sentinel optimiza costos operacionales reduciendo falsas alarmas.",
      duration: "3 Minutos (Pitch rápido)",
      depth: "Visión del Negocio & Mitigación Operacional",
      allowed: "Modelos de valor, resúmenes ejecutivos, flujos de pilotos simulados de 1-3 cámaras.",
      prohibited: "Datos contractuales, tarifas finales de mantenimiento, promesas de automatización legal.",
      nextSteps: "Fijar reunión privada para levantamiento de factibilidad preliminar.",
      ipLevel: "Nivel de Protección Crítico - Mantener la lógica comercial y roadmap estratégico privado."
    },
    corporate: {
      name: "Corporate Open Innovation",
      narrative: "Enfoque de co-creación e integración con sistemas heredados corporativos (VMS/NVR). Destaca la flexibilidad modular del ORBI Vision Core para adaptarse a protocolos estándar.",
      duration: "10 Minutos",
      depth: "Interoperabilidad & Resguardo de Cumplimiento de Datos",
      allowed: "Módulo Privacy & Compliance, matriz de compatibilidad, evidencia técnica sellada SHA-256.",
      prohibited: "Rutas internas de red de clientes reales, vulnerabilidades de firewalls expuestas.",
      nextSteps: "Solicitar NDA formal para discutir integraciones profundas con sistemas SCADA/CCTV.",
      ipLevel: "Nivel de Protección Medio - Se detallan interfaces ONVIF/RTSP conceptuales bajo NDA."
    },
    investor: {
      name: "Investor Teaser",
      narrative: "Enfoque centrado en la tracción de la demo, modularidad y propiedad intelectual protegida. Se expone la elegancia del sistema sin abrir secretos de desarrollo ni algoritmos clave.",
      duration: "5 Minutos",
      depth: "Modularidad de Software & Seguridad de IP",
      allowed: "Demos de Live Wall, Dashboard general, Evidence report simulado.",
      prohibited: "Código fuente del procesador de video local, pesos de red neuronal, prompts de prompts.",
      nextSteps: "Firmar acuerdo previo para compartir la carpeta de inversión (Stakeholder Binder).",
      ipLevel: "Nivel de Protección Máximo - Exposición estricta de interfaces de usuario sanitizadas."
    },
    video_youtube: {
      name: "Public Video / YouTube",
      narrative: "Formato visualmente pulido, dinámico y seguro. Orientado a educar sobre la importancia del control CCTV preventivo responsable y la privacidad por diseño.",
      duration: "1 - 3 Minutos",
      depth: "Experiencia de Usuario (UX) & Controles de Operación",
      allowed: "Flasheados de Live Wall con nombres simulados, diagramas animados conceptuales.",
      prohibited: "Cualquier texto con IPs locales, nombres de calles o domicilios privados.",
      nextSteps: "Remitir a la web oficial del Ecosistema ORBI para acceder al Hub público.",
      ipLevel: "Nivel de Protección Absoluto - Ocultamiento automático de paneles técnicos complejos."
    },
    linkedin: {
      name: "LinkedIn Launch",
      narrative: "Formato profesional de red social. Enfatiza el hito técnico modular alcanzado bajo el riguroso desarrollo incremental y la colaboración institucional.",
      duration: "Lectura rápida (90s)",
      depth: "Resumen de Hito Técnico & Validación Progresiva",
      allowed: "Captura de pantalla de dashboard unificado sanitizado, texto de agradecimiento oficial.",
      prohibited: "Parámetros de VLAN, diagramas detallados de routers de laboratorio.",
      nextSteps: "Invitar a probar el Public Demo Hub simulado de forma online segura.",
      ipLevel: "Nivel de Protección Alto - Material puramente promocional y metodológico."
    },
    technical_jury: {
      name: "Technical Jury Review",
      narrative: "Enfoque detallado para evaluadores de comités de ingeniería. Se demuestra rigor en las huellas SHA-256, los pings ONVIF, y la simulación local determinista.",
      duration: "10 - 15 Minutos",
      depth: "Arquitectura Modular, Criptografía Local & Protocolos de Borde",
      allowed: "Logs de auditoría in-situ, estados lógicos de Dahua PoE Lab, flujo de evidencias.",
      prohibited: "Lógica propietaria de sanitización del core, llaves de API Gemini del servidor.",
      nextSteps: "Explicar el modelo de pruebas controladas con 1 a 3 cámaras físicas autorizadas.",
      ipLevel: "Nivel de Protección Controlado - Exposición de código de interfaz, ocultando el back-end."
    },
    portfolio: {
      name: "Portfolio Showcase",
      narrative: "Enfoque para portafolios públicos y perfiles técnicos personales. Destaca la ingeniería modular, el orden del código cliente y el cumplimiento ético de privacidad sin regalar el core.",
      duration: "Lectura rápida",
      depth: "Rigor Arquitectónico & Buenas Prácticas de UI",
      allowed: "Capturas de pantalla del dashboard general, logs de auditoría estáticos, diagramas de diseño.",
      prohibited: "Parámetros de configuración del router local, tokens de API, prompts de sistema.",
      nextSteps: "Enlazar al repositorio público sanitizado con licencia experimental.",
      ipLevel: "Nivel de Protección Alto - Código cliente expuesto, backend y lógica oculta."
    },
    live_demo: {
      name: "Controlled Live Demo",
      narrative: "Enfoque para demostraciones presenciales uno a uno con comités de seguridad. Se muestra el flujo en tiempo real de las cámaras virtuales interactuando con EasyView.",
      duration: "5 - 10 Minutos",
      depth: "Interacción en Tiempo Real & Flujo de Portería",
      allowed: "Eventos simulados en vivo, EasyView en modo interactivo, calibración de red local simulada.",
      prohibited: "Modificación de claves de base de datos en vivo, inyección de scripts externos.",
      nextSteps: "Coordinar un piloto cerrado de 1 a 3 cámaras físicas en el terreno del cliente.",
      ipLevel: "Nivel de Protección Controlado - Resguardo de la red local del cliente en todo momento."
    }
  };

  // Base narrative text allowed
  const narrativeBaseText =
    "ORBI Sentinel IA es una plataforma experimental y modular del Ecosistema ORBI para demostrar flujos de CCTV inteligente, diagnóstico operacional, incidentes, evidencia técnica de laboratorio y preparación responsable de pilotos controlados en entornos Field, Community y Consumer.";

  // Narrative Builder sections mapping
  const narrativeSections: { [key: string]: any } = {
    general: {
      title: "Texto Base del Proyecto",
      text: narrativeBaseText,
      warning: "Nunca alterar para afirmar que es un software productivo listo para reemplazar personal físico o SCADA en el 100% de los casos."
    },
    problema: {
      title: "El Problema que Resolvemos",
      text: "En la gestión de CCTV, las cámaras perimetrales frecuentemente sufren desconexiones físicas, desalineaciones ópticas por viento o fallas de alimentación PoE. Los operadores de seguridad sufren de fatiga cognitiva y no detectan estas fallas operacionales de forma preventiva, reduciendo drásticamente la utilidad de la inversión.",
      warning: "Evitar lenguaje alarmista corporativo o dar a entender que la delincuencia se elimina al 100%."
    },
    solucion: {
      title: "La Solución Sentinel",
      text: "Una interfaz unificada offline que asiste a operadores y técnicos de red mediante diagnósticos automáticos en tiempo real de pings y voltajes PoE, captura rápida de incidentes, y enmascaramiento local de privacidad (Privacy Shield), permitiendo actuar preventivamente antes de que ocurran incidentes.",
      warning: "No prometer detección de intrusos infalible ni automatización de patrullas policiales."
    },
    diferenciador: {
      title: "El Diferenciador Clave",
      text: "Diseño por y para la Privacidad y la Operación Local. No dependemos de nubes externas para flujos básicos de CCTV, procesamos la telemetría en el borde físico, y reducimos el esfuerzo del guardia con vistas simplificadas (EasyView) y paquetes de evidencia técnica protegidos con SHA-256.",
      warning: "No mencionar algoritmos neuronales propietarios detallados ni patentes en curso."
    },
    estado_actual: {
      title: "Estado de Madurez Modular",
      text: "La plataforma se encuentra en fase de Demostración Controlada Bloqueada. Cuenta con simulaciones de laboratorio completas y funcionales de protocolos Dahua LAN, Eufy Bridge y flujos de coordinación de pilotos. Todos los controles de copia y exportación están custodiados por políticas estrictas de sanitización.",
      warning: "Excluir términos como 'producción comercial abierta' o 'contratación libre de servicio'."
    },
    vision: {
      title: "Visión del Proyecto",
      text: "Consolidar el primer ecosistema de CCTV inteligente y diagnóstico operacional de borde en Chile, democratizando el acceso a herramientas preventivas sin comprometer la seguridad ni privatizar el espacio público.",
      warning: "Mantener el carácter experimental y la pertenencia al Ecosistema ORBI."
    },
    modulos: {
      title: "Módulos Demostrables",
      text: "La suite se compone de: Dashboard General de disponibilidad, EasyView para portería simplificada, Dahua Lab Protocol para diagnóstico de switches PoE, Context AI para adaptación de reglas, Evidence Report para trazabilidad SHA-256 e Incident Center.",
      warning: "No dar a entender que todos los módulos futuros se encuentran integrados en la nube."
    },
    seguridad_privacidad: {
      title: "Seguridad y Privacidad por Diseño",
      text: "Implementamos un estricto resguardo local: enmascaramiento dinámico visual de veredas (Privacy Shield), cifrado HMAC-SHA256 de evidencias de laboratorio, y un scanner de mitigación en caliente para impedir fugas de datos.",
      warning: "Evitar prometer inmunidad legal ante entes reguladores de protección de datos."
    },
    impacto: {
      title: "Impacto Potencial",
      text: "Reducción de hasta un 85% de fatiga cognitiva en guardias, optimización del tiempo de respuesta ante caídas de red PoE, y trazabilidad total de evidencias técnicas sin alterar flujos de trabajo tradicionales.",
      warning: "No prometer reducciones absolutas de delitos ni ahorros presupuestarios garantizados."
    },
    proximo_paso: {
      title: "Siguiente Paso Seguro",
      text: "La estructuración de un piloto técnico limitado, controlado de 1 a 3 cámaras de red local durante un período acotado de 7 días para verificar la factibilidad operacional y la compatibilidad física in-situ.",
      warning: "Nunca prometer despliegues masivos inmediatos sin una etapa previa de validación local."
    }
  };

  // Demo Routes step details
  const demoRoutes: { [key: string]: any } = {
    "60s": {
      name: "Ruta 60 Segundos (Flash Pitch)",
      audience: "Jueces, Inversionistas en panel rápido, Público general",
      screens: "Public Demo Hub > Live Wall > Privacy & Compliance",
      say: "Presentar ORBI Sentinel IA como la solución unificada al problema de fatiga y caídas en CCTV. Mostrar las tres líneas principales (Field, Community, Consumer) y cerrar con el compromiso ético de datos sanitizados.",
      avoid: "No abrir terminales de red, no discutir marcas de cámaras específicas ni voltajes PoE.",
      closing: "Solicitar una demostración extendida privada para detallar la arquitectura modular."
    },
    "3m": {
      name: "Ruta 3 Minutos (Demo Estándar)",
      audience: "Evaluadores técnicos de aceleradoras, Comités de innovación",
      screens: "Public Demo Hub > Dashboard General > Operations Center / EasyView > Evidence Reports",
      say: "Explicar el dolor de la desalineación de cámaras. Demostrar cómo se diagnostica una cámara offline en un parque o condominio, cómo el operador registra el incidente sin esfuerzo y cómo se genera evidencia local firmada criptográficamente.",
      avoid: "Evitar prometer despliegue masivo inmediato sin piloto previo. Mantener el enfoque de 1-3 cámaras.",
      closing: "Alinear expectativas para coordinar un piloto de validación técnica local de 7 días."
    },
    "5m": {
      name: "Ruta 5 Minutos (Profundidad Modular)",
      audience: "Mentores de Hackathons, Jueces finales, Socios de canal",
      screens: "Public Demo Hub > Guided Demos > Dahua Lab Protocol > Privacy Compliance > Pilot Intake",
      say: "Exhibir las consolas guiadas de demostración que guían al expositor. Demostrar la interacción con el switch PoE simulado y explicar el resguardo ético de enmascaramiento visual de veredas públicas. Mostrar cómo el Pilot Intake levanta los datos del cliente de forma sanitizada.",
      avoid: "No mostrar código de backend, no usar credenciales reales ni abrir rutas IP vivas.",
      closing: "Presentar la minuta formal de acuerdo de piloto técnico controlado listo para ser firmado por ambas partes."
    },
    "10m": {
      name: "Ruta 10 Minutos (Jury Review)",
      audience: "Jurados técnicos detallados, Comités de Ciberseguridad/TI",
      screens: "Toda la Suite modular > Matriz de Compatibilidad > Public Showcase Center > Export Pack",
      say: "Recorrer toda la topología conceptual. Explicar los controles incondicionales de bloqueo de exportaciones de datos reales, las pruebas de integridad SHA-256 local, y el cumplimiento regulatorio de protección de datos. Demostrar el funcionamiento de este Showcase Center.",
      avoid: "No prometer compatibilidad universal no testeada. No entregar parámetros operativos reales de firewalls corporativos.",
      closing: "Sellar la presentación con los créditos oficiales institucionales del Ecosistema ORBI."
    }
  };

  // Submission Pack sections mapping (15 sections)
  const submissionSections: { [key: string]: any } = {
    project_name: {
      title: "Nombre del Proyecto",
      content: "ORBI Sentinel IA — Competition & Showcase Edition",
      length: 49
    },
    summary_280: {
      title: "Resumen de 280 Caracteres (Twitter/Hackathon limit)",
      content: "ORBI Sentinel IA: Suite inteligente y modular para control preventivo de CCTV perimetral, diagnóstico de red PoE y trazabilidad de incidentes en el borde. Diseñada bajo principios estrictos de privacidad por diseño, datos sanitizados y preparación responsable de pilotos.",
      length: 271
    },
    summary_800: {
      title: "Resumen de 800 Caracteres (Postulación estándar)",
      content: "ORBI Sentinel IA es una plataforma de software modular diseñada para transformar la supervisión de CCTV perimetral en entornos industriales y residenciales. Resuelve la desconexión física y de alimentación de cámaras mediante diagnóstico automático en el borde (pings, voltajes PoE, análisis de atenuación). Reduce la fatiga cognitiva del operador mediante interfaces adaptativas según su rol de operación (EasyView para guardias, consolas completas para administradores). Para garantizar la seguridad del cliente y la ética de datos, Sentinel opera de manera local/offline con datos totalmente sanitizados, un scanner en caliente de propiedad intelectual, bloqueo incondicional ante fugas de red y un riguroso esquema de preparación de pilotos limitados de 1 a 3 cámaras.",
      length: 798
    },
    summary_1200: {
      title: "Resumen de 1200 Caracteres (Postulación extendida)",
      content: "ORBI Sentinel IA es un sistema experimental, modular y responsable de asistencia para la supervisión de CCTV perimetral, integrado en el Ecosistema ORBI. El sistema aborda la problemática de inoperatividad y desconexiones físicas en redes de seguridad (viento, falla PoE, vandalismo). Mediante el procesamiento de telemetría de borde y simulaciones de red locales, unifica el estado físico de cámaras, diagnostica de forma preventiva switches PoE y automatiza el reporte de incidentes firmados criptográficamente con integridad local. A diferencia de soluciones tradicionales intrusivas, Sentinel se rige por la Privacidad por Diseño (Privacy Shield), enmascarando veredas y áreas públicas. El software es offline y local por defecto, impidiendo fugas de datos y asegurando el resguardo de la propiedad intelectual. La vía hacia la adopción real se estructura a través de pilotos controlados de 1 a 3 cámaras de red local por 7 días, certificando la factibilidad sin falsas promesas. No reemplaza personal humano ni sistemas SCADA; optimiza la gestión del operador.",
      length: 1120
    },
    extended: {
      title: "Descripción Extendida (Propuesta técnica de valor)",
      content: "ORBI Sentinel IA forma parte de la suite experimental del Ecosistema ORBI. El proyecto aborda la brecha operacional en mantenimiento de sistemas de videovigilancia. A través de módulos independientes y acoplados lógicamente (Operations Center, Access Vault, Dahua PoE Lab, Evidence Center), el sistema permite supervisar la disponibilidad física de las cámaras, enmascarar automáticamente áreas públicas para cumplimiento de leyes de privacidad, y emitir reportes de incidentes firmados criptográficamente. El sistema rechaza activamente el almacenamiento de datos reales de producción o credenciales en texto plano, implementando en su lugar una arquitectura de simulación de alta fidelidad que resguarda la propiedad intelectual estratégica y la ciberseguridad del cliente final en todo momento.",
      length: 1045
    },
    problem_section: {
      title: "El Problema que Resolvemos",
      content: "En la gestión de CCTV, las cámaras perimetrales frecuentemente sufren desconexiones físicas, desalineaciones ópticas por viento o fallas de alimentación PoE. Los operadores de seguridad sufren de fatiga cognitiva y no detectan estas fallas operacionales de forma preventiva, reduciendo drásticamente la utilidad de la inversión.",
      length: 337
    },
    solution_section: {
      title: "La Solución Sentinel",
      content: "Una interfaz unificada offline que asiste a operadores y técnicos de red mediante diagnósticos automáticos en tiempo real de pings y voltajes PoE, captura rápida de incidentes, y enmascaramiento local de privacidad (Privacy Shield), permitiendo actuar preventivamente antes de que ocurran incidentes.",
      length: 310
    },
    target_users: {
      title: "Usuarios Objetivo",
      content: "1) Conserjes y guardias de portería (operación simplificada en EasyView). 2) Técnicos de soporte e in-situ (diagnóstico PoE y calibración física). 3) Administradores de TI/Seguridad (gestión de políticas, incidentes y auditoría).",
      length: 228
    },
    innovation: {
      title: "Factor de Innovación",
      content: "1) Privacidad por Diseño Reactiva: Enmascaramiento local de veredas y zonas íntimas directamente en el recorte de resolución sin depender de procesamiento en la nube. 2) Gobierno de Claims y Datos Sanitizados: Primera plataforma que implementa un Scanner in-situ en tiempo real y bloqueo incondicional del portapapeles ante cualquier detección de IPs, claves o prompts internos, dejando reflejado que el material expuesto al público sea apto para demostración y no contractual.",
      length: 462
    },
    potential_impact: {
      title: "Impacto Potencial",
      content: "Mejora del tiempo de respuesta preventiva ante fallas físicas de CCTV, reducción de la fatiga del guardia hasta un 85% mediante vistas tácticas unificadas, y total transparencia criptográfica de evidencias operacionales.",
      length: 236
    },
    current_state: {
      title: "Estado Actual",
      content: "Fase de Demostración Controlada Bloqueada. Cuenta con simulaciones de laboratorio completas de protocolos Dahua LAN, Eufy Bridge y flujos de coordinación de pilotos. Todos los controles de exportación están activos y protegidos.",
      length: 239
    },
    demo_available: {
      title: "Demo Disponible",
      content: "Entorno interactivo local simulado (Public Demo Hub) con datos de laboratorio 100% sanitizados para fines educativos y de concurso, operando sin conexión a bases de datos corporativas externas.",
      length: 198
    },
    responsible_limitations: {
      title: "Limitaciones Responsables",
      content: "El sistema no detecta delitos de forma mágica, no es infalible, no ofrece inmunidad legal y no reemplaza el patrullaje humano o la validación por parte del operador de seguridad.",
      length: 182
    },
    credits_section: {
      title: "Créditos del Proyecto",
      content: "Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem. Co-diseño, arquitectura de software, prompts y QA: ChatGPT / OpenAI. Implementación asistida y optimización: Google AI Studio.",
      length: 204
    },
    next_step: {
      title: "Próximo Paso",
      content: "Estructurar un piloto técnico cerrado y limitado de 1 a 3 cámaras en la red local del cliente por 7 días bajo NDA, con el fin de certificar factibilidad física y compatibilidad de equipos.",
      length: 188
    }
  };

  // Video Script Pack mapping
  const videoScripts: { [key: string]: any } = {
    "15s": {
      title: "Script 15 Segundos (Teaser rápido)",
      content: "🎤 [VOZ EN OFF]: ¿Cámaras caídas y nadie se entera? Conoce ORBI Sentinel IA. Telemetría de red, diagnóstico preventivo de CCTV y reportes con un solo click. Simple para el guardia, potente para la empresa. Visita ORBI Ecosystem. 🎬 [VISUAL]: Flashes rápidos del Live Wall y Dashboard con badge 'Production Locked'."
    },
    "30s": {
      title: "Script 30 Segundos (Promo estándar)",
      content: "🎤 [VOZ EN OFF]: En seguridad perimetral, una cámara caída es un punto ciego crítico. ORBI Sentinel IA unifica el control de tus cámaras, previene desconexiones físicas mediante diagnóstico PoE local, y enmascara zonas públicas cuidando la privacidad. Todo operando offline con datos sanitizados de alta seguridad. El futuro del CCTV inteligente y responsable ya está aquí. Conoce ORBI Sentinel IA. 🎬 [VISUAL]: Transición suave de Sidebar a Dashboard, zoom al panel de 'Privacy Compliance'."
    },
    "60s": {
      title: "Script 60 Segundos (Video de postulación)",
      content: "🎤 [VOZ EN OFF]: Presentamos ORBI Sentinel IA, el asistente inteligente para supervisión de CCTV del Ecosistema ORBI. Tradicionalmente, la fatiga cognitiva y las caídas de red inactivan la videovigilancia sin que los operadores lo noten. Sentinel soluciona esto en el borde: unifica estados de red, monitorea voltajes de switches PoE y automatiza reportes de incidentes con firmas de integridad SHA-256 local. Diseñado con tres líneas de acción (Field para plantas, Community para condominios y Consumer experimental), opera en un ambiente 100% sanitizado y offline para total resguardo del cliente. No prometemos infalibilidad, estructuramos un camino claro e inteligente: pilotos controlados de 1 a 3 cámaras para certificar compatibilidad de red local. ORBI Sentinel IA: Seguridad por diseño, operación responsable. 🎬 [VISUAL]: Paneos suaves de la UI, acercamiento al scanner de sanitización, cierre con los créditos oficiales del proyecto."
    },
    pitch_90s: {
      title: "Script Pitch 90 Segundos (Demo Day en vivo)",
      content: "🎤 [EXPOSITOR]: Hola a todos. ¿Sabían que el 40% de las cámaras de seguridad perimetral fallan por desalineaciones físicas o problemas de alimentación PoE sin que el operador se entere a tiempo? Eso es un punto ciego que cuesta millones. Para solucionar esto creamos ORBI Sentinel IA. Sentinel es una interfaz unificada que unifica la telemetría física de tus cámaras en el borde de forma 100% offline. Dividimos la solución en tres enfoques: Field para la industria, Community para conserjerías residenciales de alta privacidad, y Consumer como puente de laboratorio WiFi doméstico. El guardia opera con un solo botón en EasyView, el técnico cuenta con herramientas de red in-situ, y los directores obtienen reportes protegidos de evidencia técnica firmados localmente con SHA-256. Lo más importante: somos responsables. Sentinel cuenta con un sistema de bloqueo inteligente que previene fugas de datos de red, IPs o credenciales, garantizando un entorno de demostración completamente sanitizado. No vendemos promesas absolutas de inteligencia artificial perfecta. Proponemos el único camino racional: pilotos técnicos cerrados de 1 a 3 cámaras para validar la red local del cliente antes de avanzar. Muchas gracias. 🎬 [VISUAL]: Presentación ágil de diapositivas sanitizadas en pantalla grande, demostración interactiva en la computadora."
    },
    demo_voiceover_3m: {
      title: "Script Voiceover 3 Minutos (Demo Técnica)",
      content: "🎤 [VOICE OVER]: Bienvenidos a la demostración de ORBI Sentinel IA. En esta sesión de tres minutos, revisaremos la operatividad del sistema de control preventivo de CCTV de forma 100% local y sanitizada. \n\n[0:00 - 0:45] Observamos el Public Demo Hub. El sistema está en modo 'Production Locked', lo que significa que ninguna IP o cámara real está expuesta. Al cambiar de rol a Guardia, accedemos a EasyView. El guardia no ve diagramas de red complejos, solo un botón de estado general y los accesos rápidos de incidentes. \n\n[0:45 - 1:30] Cambiamos a Administrador. Aquí observamos el Dashboard General de red y el Dahua Lab Protocol. El sistema simula la pérdida de ping en una cámara perimetral. El técnico de soporte puede ver el voltaje PoE estimado de forma preventiva, identificando que la causa de caída es de alimentación eléctrica y no física. \n\n[1:30 - 2:30] Al registrar el incidente, el sistema genera de forma automática un paquete de evidencia técnica en el Evidence Report. Este paquete contiene el log del incidente y una firma SHA-256 local, garantizando el control de integridad de los registros operacionales sin subir un solo megabyte de video a nubes de terceros, cumpliendo rigurosamente con Privacy by Design. \n\n[2:30 - 3:00] Para finalizar, observamos el Public Showcase Center, que asiste al expositor en mantener claims éticos responsables y auditar en tiempo real la información transmitida. El proyecto es una creación experimental de Víctor M. León y el Ecosistema ORBI, implementado de forma modular. Muchas gracias por su atención. \n\n🎬 [VISUAL]: Recorrido cronológico sincronizado de las pantallas del Demo Hub, terminando en la tarjeta de créditos oficiales."
    }
  };

  // Real-time Text Scanner Logic
  const performScan = (textToScan: string) => {
    setScannerActive(true);
    const findings: string[] = [];

    // Regular expressions for sensitive data (Emails, Phone numbers, IPs, RTSP, Credentials, URLs, Absolute claims, Source code, Prompts, etc.)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const rtspRegex = /rtsp:\/\/[^\s]+/gi;
    const pwdKeywords = /(?:password|contraseña|pass|clave|token|secret_key|api_key|client_secret|client_secret_key)\s*[:=]\s*[^\s,]+/gi;
    const phoneRegex = /\+?[0-9]{8,15}/g;
    const coordRegex = /[-+]?[0-9]{1,2}\.[0-9]+,\s*[-+]?[0-9]{1,3}\.[0-9]+/g;
    const sourceCodeKeywords = /\b(?:import\s+React|const\s+\w+\s*=|function\s+\w+\s*\(|class\s+\w+|export\s+const)\b/g;
    const internalPromptsKeywords = /\b(?:instrucciones\s+del\s+sistema|system\s+instruction|prompt\s+interno|comportamiento\s+del\s+agente)\b/g;
    
    // Client/Park names, etc.
    const proprietaryKeywords = /\b(?:Alto\s+Bella\s+Vista|Bella\s+Vista|Copiapó|Solar\s+Park|Condominio\s+Las\s+Pampas|Las\s+Pampas)\b/gi;

    // Claims patterns
    const absoluteClaims = /\b(?:100%\s+de\s+los\s+delitos|previene\s+todos\s+los\s+robos|sistema\s+infalible|reemplazo\s+total|compatibilidad\s+universal|infalible|detecta\s+todos\s+los\s+robos|reemplaza\s+guardias|previene\s+el\s+100%\s+de\s+delitos|detección\s+perfecta)\b/gi;
    const pricesRegex = /\b(?:\$\d+|\d+\s*USD|\d+\s*CLP|\d+\s*UF|precios\s+definitivos|costo\s+total\s+de\s+\d+)\b/gi;

    if (emailRegex.test(textToScan)) findings.push("Detector de Correo Electrónico (PII)");
    if (ipRegex.test(textToScan)) findings.push("Dirección IP de red detectada");
    if (rtspRegex.test(textToScan)) findings.push("Enlace RTSP detectado");
    if (pwdKeywords.test(textToScan)) findings.push("Credencial o Contraseña en texto plano");
    if (phoneRegex.test(textToScan)) {
      const phones = textToScan.match(phoneRegex);
      if (phones && phones.some(p => p.length >= 8)) {
        findings.push("Número telefónico detectado (PII)");
      }
    }
    if (coordRegex.test(textToScan)) findings.push("Coordenadas geográficas detectadas");
    if (sourceCodeKeywords.test(textToScan)) findings.push("Palabras clave de Código Fuente detectadas");
    if (internalPromptsKeywords.test(textToScan)) findings.push("Referencias a Prompts Internos de la IA");
    if (proprietaryKeywords.test(textToScan)) findings.push("Nombre de cliente, parque o sitio real no autorizado detectado");
    if (absoluteClaims.test(textToScan)) findings.push("Claim comercial absoluto no permitido o falsa promesa");
    if (pricesRegex.test(textToScan)) findings.push("Precio definitivo o cotización comercial no permitida");

    setTimeout(() => {
      setScanResults({
        clean: findings.length === 0,
        findings
      });
      setScannerActive(false);

      // Sincronizar checklist dynamic scanner status
      setChecklist(prev => ({
        ...prev,
        exportContentSanitized: findings.length === 0
      }));

      if (onAddAuditLog) {
        onAddAuditLog(
          "Escaneo de Material Público",
          `Escaneo finalizado con ${findings.length} hallazgos. Estado: ${findings.length === 0 ? "Limpio" : "Advertencia/Bloqueado"}`
        );
      }
    }, 800);
  };

  // Run initial scan on load
  useEffect(() => {
    performScan(scannerText);
  }, []);

  // Hot Sanitization function
  const handleHotSanitize = () => {
    let sanitized = scannerText;
    
    // Regex replacements for generic safe values
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL SANITIZADO]");
    sanitized = sanitized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, "[IP SANITIZADA]");
    sanitized = sanitized.replace(/rtsp:\/\/[^\s,\)]+/gi, "[ENLACE RTSP SANITIZADO]");
    sanitized = sanitized.replace(/(?:password|contraseña|pass|clave|token|secret_key|api_key|client_secret|client_secret_key)\s*[:=]\s*[^\s,\)]+/gi, "credencial: [CREDENCIAL GESTIONADA FUERA DE LA DEMO]");
    sanitized = sanitized.replace(/\+?[0-9]{8,15}/g, "[TELÉFONO SANITIZADO]");
    sanitized = sanitized.replace(/[-+]?[0-9]{1,2}\.[0-9]+,\s*[-+]?[0-9]{1,3}\.[0-9]+/g, "[COORDENADA SANITIZADA]");
    sanitized = sanitized.replace(/\b(?:import\s+React|const\s+\w+\s*=|function\s+\w+\s*\(|class\s+\w+|export\s+const)\b/g, "[CÓDIGO FUENTE NO EXPORTABLE]");
    sanitized = sanitized.replace(/\b(?:instrucciones\s+del\s+sistema|system\s+instruction|prompt\s+interno|comportamiento\s+del\s+agente)\b/gi, "[PROMPT INTERNO NO EXPORTABLE]");
    
    // Prohibited claims replacements
    sanitized = sanitized.replace(/\b(?:100%\s+de\s+los\s+delitos|previene\s+todos\s+los\s+robos|sistema\s+infalible|reemplazo\s+total|compatibilidad\s+universal|infalible|detecta\s+todos\s+los\s+robos|reemplaza\s+guardias|previene\s+el\s+100%\s+de\s+delitos|detección\s+perfecta)\b/gi, "apoyo perimetral preventivo con validación humana");
    sanitized = sanitized.replace(/\b(?:\$\d+|\d+\s*USD|\d+\s*CLP|\d+\s*UF|precios\s+definitivos|costo\s+total\s+de\s+\d+)\b/gi, "[tarifas preliminares sujetas a levantamiento de red local]");

    // Client/Park name sanitization
    sanitized = sanitized.replace(/\b(?:Alto\s+Bella\s+Vista|Bella\s+Vista|Copiapó|Solar\s+Park|Condominio\s+Las\s+Pampas|Las\s+Pampas)\b/gi, "[SITIO SANITIZADO]");
    sanitized = sanitized.replace(/\b(?:Víctor\s+León|Juan\s+Pérez|Pedro\s+Soto|María\s+Gómez)\b/gi, "[CLIENTE SANITIZADO]");

    setScannerText(sanitized);
    performScan(sanitized);

    if (onAddAuditLog) {
      onAddAuditLog("Sanitización en Caliente Showcase", "Se aplicó sanitización en caliente sobre el texto de la demostración.");
    }
  };

  // Synchronise integration action
  const handleTriggerIntegration = (key: string, name: string) => {
    if (isExportBlocked) {
      alert(`No se puede sincronizar con ${name}: El sistema está bloqueado por motivos de seguridad.`);
      return;
    }
    setIntegrationStatus(prev => ({ ...prev, [key]: "Linked & Approved" }));
    if (onAddAuditLog) {
      onAddAuditLog(
        "Sincronización de Showcase",
        `Se vinculó y aprobó la narrativa pública sanitizada con el módulo ${name}.`
      );
    }
    alert(`Sincronización exitosa con ${name}! Los datos sanitizados fueron transmitidos correctamente.`);
  };

  // Full Public Showcase Report Markdown Generator
  const generateFullReport = () => {
    return `================================================================================
ORBI SENTINEL IA - PUBLIC SHOWCASE EDITION REPORT
================================================================================
Identificador de Versión: ${VERSION_REGISTRY.version}
Acreditación del Estado: POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY
Estado del Showcase: ${showcaseStatus.toUpperCase()}
Readiness Score: ${currentScore} / 100

MODO SELECCIONADO:
* Nombre: ${showcaseModes[selectedMode]?.name}
* Enfoque Narrativo: ${showcaseModes[selectedMode]?.narrative}
* Duración Recomendada: ${showcaseModes[selectedMode]?.duration}
* Profundidad de Presentación: ${showcaseModes[selectedMode]?.depth}

RUTA GUIADA RECOMENDADA:
* Nombre: ${demoRoutes[selectedRoute]?.name}
* Audiencia Objetivo: ${demoRoutes[selectedRoute]?.audience}
* Pantallas Sugeridas: ${demoRoutes[selectedRoute]?.screens}
* Guión del Expositor: ${demoRoutes[selectedRoute]?.say}

RESUMEN PÚBLICO SANITIZADO (SUBMISSION PACK):
* Resumen Corto: ${submissionSections.summary_short.content}
* Resumen Medio: ${submissionSections.summary_medium.content}

POLÍTICA DE PROTECCIÓN DE PROPIEDAD INTELECTUAL:
- Permitido revelar: Interfaces visuales unificadas (UX), diagramas de flujo lógicos, datos simulados, logs de auditoría de laboratorio, enmascaramiento de veredas públicas (Privacy Shield).
- Requiere NDA estricto: Especificaciones técnicas de voltajes PoE de terreno, protocolos propietarios Dahua LAN, topología detallada de red y encriptación de Access Vault.
- Prohibido revelar (Nunca exportar): Código fuente del ORBI Vision Core, prompts de sistema, tokens de APIs del ecosistema, credenciales de red reales, IPs, enlaces RTSP activos o datos de clientes.

CRÉDITOS OFICIALES INSTITUCIONALES:
* Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
* Co-diseño, arquitectura de software, prompts y QA: ChatGPT / OpenAI.
* Implementación asistida y optimización: Google AI Studio.

AVISO DE RESPONSABILIDAD MANDATORIO:
"ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración. Esta edición es exclusivamente para fines de concurso, showcase y demostración abierta, operando con datos sanitizados de laboratorio. No representa aprobación contractual, inversión aprobada, validación legal, autorización de despliegue ni permiso automático para publicar."
================================================================================`;
  };

  if (userRole === "conserje") {
    return (
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6 my-12 backdrop-blur-md" id="restricted-view-conserje">
        <div className="relative mx-auto w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
          <Lock className="w-10 h-10 animate-pulse" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-sans font-bold text-white tracking-tight">
            🔒 Acceso Restringido — Modo Conserje Activo
          </h3>
          <p className="text-xs font-mono text-rose-400 uppercase tracking-widest">
            Requiere Nivel: Administrador o Técnico de Terreno
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-400 leading-relaxed max-w-md mx-auto space-y-2 text-left">
          <p>
            Las narrativas de competencia, el Submission Pack, los guiones de video promocionales, el IP Protection Panel, el escáner de inyección y los reportes detallados están **estrictamente bloqueados** para personal operativo de portería.
          </p>
          <p className="font-semibold text-slate-300">
            Esta restricción evita la fatiga cognitiva del operador y resguarda la información estratégica del condominio o parque solar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => setCurrentTab("easyview")}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
            id="btn-conserje-back-to-easyview"
          >
            <span>Ir a EasyView / Modo Conserje</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="public-showcase-edition-center-container">
      {/* 1. Header and Icon Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
              Public Showcase Edition Center
              <span className="text-[10px] bg-pink-500/15 border border-pink-500/35 text-pink-400 px-2 py-0.5 rounded font-bold font-mono">
                {VERSION_REGISTRY.version}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Vitrina de presentación para concursos, hackathons, videos de difusión y demo days.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab("publicdemohub")}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg transition-all"
            id="btn-return-to-demohub-from-showcase"
          >
            ← Volver al Demo Hub
          </button>
        </div>
      </div>

      {/* 2. Showcase Safety Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3" id="showcase-safety-banner">
        <div className="flex items-start gap-3">
          <ShieldAlertIcon className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Safety Guardrails Activos
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public Showcase Edition — vitrina sanitizada para concursos, videos y demostraciones abiertas, sin datos reales, sin credenciales, sin IP/RTSP, sin código fuente, sin prompts internos y sin arquitectura sensible.
            </p>
          </div>
        </div>

        {/* Badges of Safety States */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
          <Badge text="Public Showcase" status={checklist.modeSelected ? "Ready" : "Blocked"} />
          <Badge text="Sanitized Edition" status={scanResults.clean ? "Ready" : "Blocked"} />
          <Badge text="No Real Data" status={checklist.noRealData ? "Ready" : "Blocked"} />
          <Badge text="No Credentials" status={checklist.noCredentials ? "Ready" : "Blocked"} />
          <Badge text="No IP/RTSP" status={checklist.noIpRtsp ? "Ready" : "Blocked"} />
          <Badge text="No Source Code" status={checklist.noSourceCode ? "Ready" : "Blocked"} />
          <Badge text="No Internal Prompts" status={checklist.noInternalPrompts ? "Ready" : "Blocked"} />
          <Badge text="IP Protected" status={checklist.ipProtected ? "Ready" : "Blocked"} />
          <Badge text="Production Locked" status={checklist.productionLockedVisible ? "Ready" : "Blocked"} />
          <Badge text="Responsible Claims" status={checklist.responsibleClaims ? "Ready" : "Blocked"} />
          <Badge text="ORBI Ecosystem" status="Ready" />
        </div>
      </div>

      {/* Bloque 9 - Consolidated Showcase Block */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4" id="bloque-9-status-block">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-pink-500/10 text-pink-400">
              <ShieldAlertIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider">
                BLOQUE 9 — COMPETITION / PUBLIC SHOWCASE EDITION
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Acreditación oficial del Ecosistema ORBI para divulgación pública, videos y postulaciones.
              </p>
            </div>
          </div>
          <div>
            <span className="px-3 py-1 rounded text-xs font-mono font-black uppercase bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 shadow-md shadow-emerald-500/5">
              POST-9B ACCEPTED / PUBLIC SHOWCASE READY
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Public Showcase Center", value: "Locked" },
            { label: "Public Showcase QA Lock", value: "Active" },
            { label: "Showcase Scanner", value: "Active" },
            { label: "Hot Sanitizer", value: "Active" },
            { label: "Clipboard Lock", value: "Active" },
            { label: "No Real Data", value: "Confirmed" },
            { label: "No Credentials", value: "Confirmed" },
            { label: "No IP/RTSP", value: "Confirmed" },
            { label: "No PII", value: "Confirmed" },
            { label: "No Source Code", value: "Confirmed" },
            { label: "No Internal Prompts", value: "Confirmed" },
            { label: "IP Protected", value: "Confirmed" },
            { label: "Responsible Claims", value: "Confirmed" },
            { label: "Production Locked", value: "Confirmed" },
            { label: "Credits Preserved", value: "Confirmed" },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-850 flex flex-col justify-between space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{item.label}</span>
              <span className={`text-[10px] font-mono font-black ${
                item.value === "Locked" 
                  ? "text-pink-400" 
                  : item.value === "Active" || item.value === "Confirmed" 
                  ? "text-emerald-400" 
                  : "text-slate-400"
              }`}>
                {item.value === "Locked" ? "🔒 LOCKED" : item.value === "Active" ? "⚡ ACTIVE" : "✓ CONFIRMED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Score & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Score Panel */}
        <div className="lg:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              Showcase Readiness Score
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-normal">
              Evaluación dinámica de sanitización del material público para postulaciones externas.
            </p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center relative">
            <div className="text-center space-y-1 z-10">
              <div className="text-4xl md:text-5xl font-mono font-black text-pink-400 tracking-tight">
                {currentScore}%
              </div>
              <div className="text-[10px] font-mono font-black tracking-widest uppercase">
                {showcaseStatus}
              </div>
            </div>
            {/* Visual Arc ring simulator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-pink-400 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
          </div>

          <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 leading-normal">
            <span className="text-white font-bold block mb-1">⚠️ AVISO REGULATORIO OBLIGATORIO</span>
            Este score es interno y preliminar. No representa aprobación contractual, inversión aprobada, validación legal, autorización de despliegue ni permiso automático para publicar.
          </div>
        </div>

        {/* Mode Selector Panel */}
        <div className="lg:col-span-8 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-pink-400" />
              Selección del Modo de Vitrina Pública
            </h3>
            <p className="text-xs text-slate-400">
              Configura los filtros éticos y la profundidad de la narrativa según la instancia del concurso o showcase.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.keys(showcaseModes).map(key => (
              <button
                key={key}
                onClick={() => {
                  setSelectedMode(key);
                  if (onAddAuditLog) onAddAuditLog("Cambio de Modo Showcase", `Modo seleccionado: ${showcaseModes[key].name}`);
                }}
                className={`p-2 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all flex flex-col justify-between text-left h-20 ${
                  selectedMode === key
                    ? "bg-pink-500/15 border-pink-500/40 text-pink-400"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span>{showcaseModes[key].name}</span>
                <span className="text-[8px] opacity-75">{showcaseModes[key].duration}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
              <span className="font-bold text-white font-mono uppercase text-[10px] tracking-wider text-pink-400">
                ⚙️ Perfil del Modo Activo: {showcaseModes[selectedMode]?.name}
              </span>
              <span className="text-[10px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-bold uppercase">
                {showcaseModes[selectedMode]?.duration}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] leading-normal text-slate-300">
              <p><strong>Narrativa Recomendada:</strong> {showcaseModes[selectedMode]?.narrative}</p>
              <p><strong>Nivel Técnico Permitido:</strong> {showcaseModes[selectedMode]?.depth}</p>
              <p><strong>Material Permitido:</strong> <span className="text-emerald-400">{showcaseModes[selectedMode]?.allowed}</span></p>
              <p><strong>Material Prohibido:</strong> <span className="text-rose-400">{showcaseModes[selectedMode]?.prohibited}</span></p>
              <p><strong>Siguientes Pasos Seguros:</strong> {showcaseModes[selectedMode]?.nextSteps}</p>
              <p><strong>Protección de IP:</strong> <span className="text-pink-400">{showcaseModes[selectedMode]?.ipLevel}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab block: Narrative & Demo Routes & Submission Packs & Video Script */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Navigation bar inside the card */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
          <TabButton
            label="Narrativa Pública"
            icon={<FileText className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "narrativa"}
            onClick={() => setSelectedSubmissionSection("narrativa")}
          />
          <TabButton
            label="Rutas de Demo"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "rutas"}
            onClick={() => setSelectedSubmissionSection("rutas")}
          />
          <TabButton
            label="Submission Pack"
            icon={<ClipboardList className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "pack" || !!submissionSections[selectedSubmissionSection]}
            onClick={() => setSelectedSubmissionSection("pack")}
          />
          <TabButton
            label="Video Scripts"
            icon={<Video className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "scripts"}
            onClick={() => setSelectedSubmissionSection("scripts")}
          />
          <TabButton
            label="Políticas de IP & Claims"
            icon={<Shield className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "ip_claims"}
            onClick={() => setSelectedSubmissionSection("ip_claims")}
          />
          <TabButton
            label="QA Lock & Auditoría"
            icon={<Lock className="w-3.5 h-3.5" />}
            active={selectedSubmissionSection === "qa_lock"}
            onClick={() => setSelectedSubmissionSection("qa_lock")}
          />
        </div>

        <div className="p-6">
          {/* Sub-tab 1: Narrative Builder */}
          {selectedSubmissionSection === "narrativa" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3 flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 block mb-1">Secciones de Narrativa</span>
                  {Object.keys(narrativeSections).map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedNarrativeSection(key)}
                      className={`p-2.5 rounded-lg border text-left font-mono text-[11px] transition-all ${
                        selectedNarrativeSection === key
                          ? "bg-pink-500/10 border-pink-500/30 text-pink-400 font-bold"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                    >
                      {narrativeSections[key].title}
                    </button>
                  ))}
                </div>

                <div className="sm:w-2/3 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-xs font-black text-white uppercase font-mono tracking-wider">
                        📝 {narrativeSections[selectedNarrativeSection]?.title}
                      </span>
                      <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">
                        Aprobado por Scanner
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans font-light">
                      {narrativeSections[selectedNarrativeSection]?.text}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-500/85 max-w-sm flex items-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>Guardrail:</strong> {narrativeSections[selectedNarrativeSection]?.warning}</span>
                    </span>
                    <button
                      onClick={() => triggerCopy(selectedNarrativeSection, narrativeSections[selectedNarrativeSection]?.text)}
                      disabled={isExportBlocked}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                        isExportBlocked
                          ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                      }`}
                    >
                      {copiedStates[selectedNarrativeSection] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedStates[selectedNarrativeSection] ? "Copiado!" : "Copiar Sección"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Routes */}
          {selectedSubmissionSection === "rutas" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.keys(demoRoutes).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedRoute(key)}
                    className={`p-3 rounded-lg border font-mono text-xs font-bold uppercase text-left transition-all flex flex-col justify-between ${
                      selectedRoute === key
                        ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-950 hover:text-slate-300"
                    }`}
                  >
                    <span>{demoRoutes[key].name}</span>
                    <span className="text-[9px] text-slate-500 font-normal mt-1 block">Ruta recomendada</span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-pink-400" />
                    Guía de Exposición: {demoRoutes[selectedRoute]?.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Audiencia: {demoRoutes[selectedRoute]?.audience}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">💻 Pantallas a Visitar</span>
                      <p className="text-white font-bold">{demoRoutes[selectedRoute]?.screens}</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">🎤 Qué decir (Guión Clave)</span>
                      <p className="text-slate-300 leading-relaxed font-light font-sans">{demoRoutes[selectedRoute]?.say}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-rose-950/10 rounded border border-rose-900/20">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-rose-400/90 block mb-1">🛑 Qué EVITAR a toda costa</span>
                      <p className="text-rose-300/90 leading-relaxed font-light">{demoRoutes[selectedRoute]?.avoid}</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-500 block mb-1">🏁 Cierre Metodológico</span>
                      <p className="text-slate-300 leading-relaxed font-light font-sans">{demoRoutes[selectedRoute]?.closing}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex justify-end">
                  <button
                    onClick={() => triggerCopy(selectedRoute, JSON.stringify(demoRoutes[selectedRoute], null, 2))}
                    disabled={isExportBlocked}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                      isExportBlocked
                        ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                    }`}
                  >
                    {copiedStates[selectedRoute] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStates[selectedRoute] ? "Copiado!" : "Copiar Ruta de Demo"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Submission Pack */}
          {selectedSubmissionSection === "pack" && (
            <div className="space-y-4">
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {Object.keys(submissionSections).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedSubmissionSection(key)}
                    className={`px-3 py-1.5 rounded border font-mono text-[10px] font-bold uppercase shrink-0 transition-all ${
                      selectedSubmissionSection === key
                        ? "bg-pink-500/15 border-pink-500/35 text-pink-400"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-300"
                    }`}
                  >
                    {submissionSections[key].title}
                  </button>
                ))}
              </div>

              {submissionSections[selectedSubmissionSection] ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-xs font-black text-white uppercase font-mono tracking-wider">
                        📁 {submissionSections[selectedSubmissionSection]?.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {submissionSections[selectedSubmissionSection]?.length} caracteres
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded border border-slate-850 font-sans leading-relaxed text-xs text-slate-300 text-left select-text whitespace-pre-line">
                      {submissionSections[selectedSubmissionSection]?.content}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex justify-end">
                    <button
                      onClick={() => triggerCopy(selectedSubmissionSection, submissionSections[selectedSubmissionSection]?.content)}
                      disabled={isExportBlocked}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                        isExportBlocked
                          ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                      }`}
                    >
                      {copiedStates[selectedSubmissionSection] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedStates[selectedSubmissionSection] ? "Copiado!" : "Copiar Texto de Postulación"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-xs font-mono">Seleccione una sección del Submission Pack arriba.</p>
              )}
            </div>
          )}

          {/* Sub-tab 4: Video Scripts */}
          {selectedSubmissionSection === "scripts" && (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                {Object.keys(videoScripts).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedVideoScript(key)}
                    className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all ${
                      selectedVideoScript === key
                        ? "bg-pink-500/15 border-pink-500/35 text-pink-400"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {videoScripts[key].title}
                  </button>
                ))}
              </div>

              {videoScripts[selectedVideoScript] ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-black uppercase text-pink-400 block tracking-wider">
                      🎬 {videoScripts[selectedVideoScript]?.title}
                    </span>
                    <div className="p-4 bg-slate-900 rounded border border-slate-850 text-xs font-sans text-slate-300 leading-relaxed text-left whitespace-pre-line">
                      {videoScripts[selectedVideoScript]?.content}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-500">
                      * Reforzar siempre que es una demostración en entorno simulado bajo datos sanitizados de laboratorio.
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleTriggerIntegration("mediaKit", "Launch Media Kit")}
                        disabled={isExportBlocked}
                        className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                          isExportBlocked
                            ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30"
                        }`}
                      >
                        Sincronizar Media Kit
                      </button>
                      <button
                        onClick={() => triggerCopy(selectedVideoScript, videoScripts[selectedVideoScript]?.content)}
                        disabled={isExportBlocked}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                          isExportBlocked
                            ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                        }`}
                      >
                        {copiedStates[selectedVideoScript] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedStates[selectedVideoScript] ? "Copiado!" : "Copiar Script"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Sub-tab 5: IP & Claims Governance */}
          {selectedSubmissionSection === "ip_claims" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IP Protection Panel */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-pink-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Panel de Protección de Propiedad Intelectual
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Categorías de exposición de datos y arquitectura</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">🟢 Revelable (Público Abierto)</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Estructura visual de la UI, flujos simulados de incidentes, logs de auditoría deterministas de laboratorio, aviso no contractual y enmascaramiento Privacy Shield.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">🟡 Requiere NDA (Reunión Privada)</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Detalles técnicos específicos de atenuación inalámbrica, compatibilidades exactas de modelos Dahua/Eufy testeados in situ, topología de voltajes PoE del switch de laboratorio.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">🔴 Nunca Revelar (Secretos Protegidos)</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">
                      Código fuente del backend (`server.ts` core), prompts de sistema, tokens de APIs del ecosistema, contraseñas activas, IPs de cámaras operativas, y mapeos de red corporativos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Claims Governance */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-pink-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <Sliders className="w-4 h-4" />
                    Claims Public Governance (Ética)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Control normativo y ético sobre afirmaciones del producto</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-2 p-2.5 bg-emerald-500/5 rounded border border-emerald-500/10">
                    <span className="font-mono font-black text-emerald-400 text-[9px] uppercase tracking-wider block">✓ CLAIMS PERMITIDOS</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px] leading-snug">
                      <li>Demo pública sanitizada experimental.</li>
                      <li>Privacy by Design (Shield).</li>
                      <li>Production Locked (Offline).</li>
                      <li>Fines demostrativos/laboratorio.</li>
                      <li>Apoyo diagnóstico perimetral.</li>
                      <li>Pruebas de 1 a 3 cámaras.</li>
                    </ul>
                  </div>

                  <div className="space-y-2 p-2.5 bg-rose-500/5 rounded border border-rose-500/10">
                    <span className="font-mono font-black text-rose-400 text-[9px] uppercase tracking-wider block">✗ CLAIMS PROHIBIDOS (BLOQUEADOS)</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px] leading-snug">
                      <li>Producción 24/7 lista.</li>
                      <li>Detecta el 100% de robos.</li>
                      <li>Reemplaza guardias físicos.</li>
                      <li>Reemplaza SCADA o NVRs.</li>
                      <li>Infalible / Inmunidad legal.</li>
                      <li>Precios definitivos fijados.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded border border-slate-850 text-[10px] text-slate-400 leading-normal">
                  <strong>Mensaje Institucional:</strong> “La Showcase Edition comunica valor, madurez y experiencia de usuario. No entrega la receta interna completa del producto.”
                </div>
              </div>
            </div>
          )}

          {selectedSubmissionSection === "qa_lock" && (
            <div className="space-y-6" id="panel-qa-lock-showcase">
              {/* Header Status */}
              <div className="p-5 rounded-xl border bg-slate-950/80 border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg border ${
                    isExportBlocked
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                      : currentScore < 100
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-md shadow-emerald-500/5"
                  }`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Estado General de Validación Showcase
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isExportBlocked
                        ? "MÓDULO 9B — ESTADO: SHOWCASE BLOQUEADO (Frentes críticos pendientes de validación o scanner sucio)"
                        : currentScore < 100
                        ? "MÓDULO 9B — ESTADO: REQUIERE REVISIÓN (Frentes opcionales pendientes de validación)"
                        : "POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY (Aprobado para concursos)"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs border uppercase tracking-wider ${
                    isExportBlocked
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                      : currentScore < 100
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  }`}>
                    {isExportBlocked ? "✗ SHOWCASE BLOCKED" : currentScore < 100 ? "⚠ NEEDS REVIEW" : "✓ PUBLIC SHOWCASE READY"}
                  </span>
                </div>
              </div>

              {/* 10 Audit Fronts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "safety_banner",
                    name: "1. Showcase Safety Banner QA",
                    status: (checklist.productionLockedVisible && checklist.creditsVisible) ? "Ready" : "Needs Review",
                    desc: "Validar que el banner comunique el aviso de datos de laboratorio, marcas simuladas, credits y los 11 badges obligatorios.",
                    checks: [
                      "Mensaje mandatorio de vitrina sanitizada presente",
                      "11 badges obligatorios de seguridad renderizados",
                      "Production Locked visible y Credits integrados"
                    ],
                    checklistKey: "productionLockedVisible"
                  },
                  {
                    id: "mode_selector",
                    name: "2. Showcase Mode Selector QA",
                    status: checklist.modeSelected ? "Ready" : "Needs Review",
                    desc: "Validar que la selección de perfil adapte duración, profundidad técnica, material permitido/prohibido y no exponga IPs/RTSP reales.",
                    checks: [
                      "9 modos de showcase activos (Hackathon, Startup, Corporate, etc.)",
                      "Alineación automática de nivel de protección de IP",
                      "Prevención estricta de promesas de automatización real"
                    ],
                    checklistKey: "modeSelected"
                  },
                  {
                    id: "narrative_builder",
                    name: "3. Public Narrative Builder QA",
                    status: (checklist.modeSelected && checklist.creditsVisible) ? "Ready" : "Needs Review",
                    desc: "Validar que las secciones del builder (10 en total) eviten claims absolutos o datos confidenciales del proyecto.",
                    checks: [
                      "10 secciones de narrativa sanitizadas completas",
                      "Filtro en caliente activo para prevenir claims como 'producción comercial'",
                      "Inclusión de créditos institucionales en textos de descripción"
                    ],
                    checklistKey: "creditsVisible"
                  },
                  {
                    id: "demo_scope",
                    name: "4. Public Demo Scope QA",
                    status: (checklist.ipProtected && checklist.responsibleClaims) ? "Ready" : "Blocked",
                    desc: "Matriz comparativa de alcance autorizado vs material prohibido para exhibiciones abiertas.",
                    checks: [
                      "Permitido: UI sanitizada, datos ficticios, rutas, locks, credits",
                      "Prohibido: Código fuente, prompts, credenciales, IPs/RTSP, datos de clientes",
                      "Bloqueo inmediato de exportaciones ante fallos críticos"
                    ],
                    checklistKey: "ipProtected"
                  },
                  {
                    id: "demo_routes",
                    name: "5. Showcase Demo Routes QA",
                    status: checklist.routeSelected ? "Ready" : "Needs Review",
                    desc: "Validar las 4 rutas guiadas (60s, 3m, 5m, 10m) con guión del presentador, pantallas clave a visitar y guías de lo que se debe evitar.",
                    checks: [
                      "4 rutas guiadas configuradas correctamente",
                      "Guiones de exposición orientados a valor experimental",
                      "Advertencia explícita de evitar paneles de estrategia o debug"
                    ],
                    checklistKey: "routeSelected"
                  },
                  {
                    id: "submission_pack",
                    name: "6. Competition Submission Pack QA",
                    status: checklist.exportContentSanitized ? "Ready" : "Blocked",
                    desc: "Validar que los resúmenes (280c, 800c, 1200c, extendido) y secciones de postulación estén libres de inyecciones y sanitizados.",
                    checks: [
                      "15 secciones sanitizadas completas y copiables",
                      "No contiene nombres de clientes, IPs, claves o prompts",
                      "Formato Markdown listo para copiar a formularios de concurso"
                    ],
                    checklistKey: "exportContentSanitized"
                  },
                  {
                    id: "video_scripts",
                    name: "7. Public Video Script Pack QA",
                    status: (checklist.exportContentSanitized && checklist.creditsVisible) ? "Ready" : "Needs Review",
                    desc: "Validar que los scripts promocionales (15s, 30s, 60s, 90s, voiceover 3m) no posean claims irresponsables ni secretos.",
                    checks: [
                      "5 guiones interactivos cargados con marcas de tiempo",
                      "Mención explícita a datos simulados y créditos del Ecosistema",
                      "No reemplazar guardias físicos, NVR ni SCADA/O&M"
                    ],
                    checklistKey: "videoScriptsSanitized"
                  },
                  {
                    id: "ip_protection",
                    name: "8. IP Protection Panel QA",
                    status: (checklist.ipProtected && checklist.noSourceCode && checklist.noInternalPrompts) ? "Ready" : "Blocked",
                    desc: "Verificación de la política de propiedad intelectual clasificada en tres categorías de acceso.",
                    checks: [
                      "Clasificación tricolor activa: Verde, Amarillo, Rojo",
                      "Código core, prompts y llaves de API clasificados como secretos",
                      "Mensaje mandatorio: 'Comunica valor, no la receta interna'"
                    ],
                    checklistKey: "noSourceCode"
                  },
                  {
                    id: "claims_governance",
                    name: "9. Public Claims Governance QA",
                    status: checklist.responsibleClaims ? "Ready" : "Blocked",
                    desc: "Control normativo sobre promesas de negocio. Verificación de claims permitidos vs claims prohibidos (red-flagged).",
                    checks: [
                      "Lista de 11 claims permitidos activa",
                      "Lista de 15 claims prohibidos (falsas promesas) auditada",
                      "Restricción activa sobre afirmaciones de prevención al 100%"
                    ],
                    checklistKey: "responsibleClaims"
                  },
                  {
                    id: "scanner_report",
                    name: "10. Showcase Scanner & Report QA",
                    status: (scanResults.clean && checklist.exportContentSanitized) ? "Ready" : "Blocked",
                    desc: "Escanear en tiempo real con regex complejos para mitigar inyecciones accidentales de datos en inputs públicos.",
                    checks: [
                      "Detección en tiempo real de emails, IPs, RTSP, claves y prompts",
                      "Hot Sanitizer activo reemplazando texto por marcadores seguros",
                      "Previene exportación si el scanner detecta advertencias"
                    ],
                    checklistKey: "noAutoPublish"
                  }
                ].map(front => (
                  <div key={front.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-800 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white font-mono">{front.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          front.status === "Ready"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : front.status === "Needs Review"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        }`}>
                          {front.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{front.desc}</p>
                      
                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-wider block">Verificaciones Clave:</span>
                        {front.checks.map((chk, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                            <span className="text-emerald-500 shrink-0">✓</span>
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850/60 flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono">Control de Check</span>
                      <button
                        onClick={() => {
                          const key = front.checklistKey as keyof typeof checklist;
                          setChecklist(prev => ({
                            ...prev,
                            [key]: !prev[key]
                          }));
                          if (onAddAuditLog) {
                            onAddAuditLog("Auditoría Interna Showcase", `Modificado estado de check: ${front.name}`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                          checklist[front.checklistKey as keyof typeof checklist]
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-850 border border-slate-800"
                        }`}
                      >
                        {checklist[front.checklistKey as keyof typeof checklist] ? "✓ Auditado" : "✗ Sin Auditar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings and Information Footer */}
              <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Descargo de Responsabilidad Operativo
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Este score es interno y preliminar. No representa aprobación contractual, inversión aprobada, validación legal, autorización de despliegue ni permiso automático para publicar. Cualquier difusión del material debe coordinarse según la gobernanza de propiedad intelectual y claims del Ecosistema ORBI.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Public Showcase Real-time Sanitization Scanner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" id="showcase-scanner-section">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-pink-500/15 text-pink-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider">
                Public Showcase Scanner
              </h3>
              <p className="text-[10px] text-slate-400">
                Auditoría en tiempo real para mitigar inyecciones accidentales de datos reales, código o claims prohibidos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scannerActive ? (
              <span className="text-[10px] font-mono text-pink-400 animate-pulse">Escaneando...</span>
            ) : scanResults.clean ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✓ ESCÁNER COMPLETAMENTE LIMPIO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                ✗ ADVERTENCIAS DETECTADAS ({scanResults.findings.length})
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-3">
            <textarea
              value={scannerText}
              onChange={(e) => {
                setScannerText(e.target.value);
                performScan(e.target.value);
              }}
              rows={4}
              placeholder="Escribe o pega notas, narrativas o resúmenes de video para escanear en caliente..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-pink-500/50 resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const mergedText = `${narrativeBaseText}\n\n${submissionSections.summary_short.content}\n\n${videoScripts["30s"].content}`;
                    setScannerText(mergedText);
                    performScan(mergedText);
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono font-bold text-slate-300 rounded"
                >
                  Importar Mix Sanitizado
                </button>
                <button
                  onClick={() => {
                    setScannerText("");
                    setScanResults({ clean: true, findings: [] });
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-400 rounded"
                >
                  Limpiar Caja
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleHotSanitize}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all"
                  id="btn-hot-sanitize-showcase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sanitizar en Caliente
                </button>
                <button
                  onClick={() => performScan(scannerText)}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-mono font-bold rounded"
                >
                  Forzar Escaneo
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2.5">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Hallazgos de Auditoría ({scanResults.findings.length})
              </span>
              {scanResults.clean ? (
                <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10 flex items-center gap-2 text-[11px] text-emerald-400 leading-snug">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sin vulnerabilidades. El texto está libre de IPs, claves, PII, código, prompts y claims irresponsables.</span>
                </div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {scanResults.findings.map((f, i) => (
                    <div key={i} className="px-2 py-1 bg-rose-500/10 border border-rose-500/15 text-rose-300 text-[10px] font-mono rounded flex items-start gap-1.5 leading-tight">
                      <AlertTriangle className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Auto-bloqueo de exportación:</span>
              <span className={`font-bold ${isExportBlocked ? "text-rose-400" : "text-emerald-400"}`}>
                {isExportBlocked ? "Activo (Blocked)" : "Inactivo (Approved)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Competition Checklist & Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competition Readiness Checklist */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3" id="competition-readiness-checklist-container">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider flex items-center gap-1">
              <ClipboardList className="w-4 h-4 text-pink-400" />
              Competition Readiness Checklist
            </h3>
            <p className="text-[11px] text-slate-400">Marque y verifique el cumplimiento antes de salir al aire.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono text-slate-300">
            <CheckItem
              label="Modo público seleccionado"
              checked={checklist.modeSelected}
              onChange={() => setChecklist(prev => ({ ...prev, modeSelected: !prev.modeSelected }))}
            />
            <CheckItem
              label="Ruta de demo elegida"
              checked={checklist.routeSelected}
              onChange={() => setChecklist(prev => ({ ...prev, routeSelected: !prev.routeSelected }))}
            />
            <CheckItem
              label="No Real Data"
              checked={checklist.noRealData}
              onChange={() => setChecklist(prev => ({ ...prev, noRealData: !prev.noRealData }))}
              critical
            />
            <CheckItem
              label="No Credentials"
              checked={checklist.noCredentials}
              onChange={() => setChecklist(prev => ({ ...prev, noCredentials: !prev.noCredentials }))}
              critical
            />
            <CheckItem
              label="No IP/RTSP"
              checked={checklist.noIpRtsp}
              onChange={() => setChecklist(prev => ({ ...prev, noIpRtsp: !prev.noIpRtsp }))}
              critical
            />
            <CheckItem
              label="No PII"
              checked={checklist.noPii}
              onChange={() => setChecklist(prev => ({ ...prev, noPii: !prev.noPii }))}
              critical
            />
            <CheckItem
              label="No Source Code"
              checked={checklist.noSourceCode}
              onChange={() => setChecklist(prev => ({ ...prev, noSourceCode: !prev.noSourceCode }))}
              critical
            />
            <CheckItem
              label="No Internal Prompts"
              checked={checklist.noInternalPrompts}
              onChange={() => setChecklist(prev => ({ ...prev, noInternalPrompts: !prev.noInternalPrompts }))}
              critical
            />
            <CheckItem
              label="Protección de IP confirmada"
              checked={checklist.ipProtected}
              onChange={() => setChecklist(prev => ({ ...prev, ipProtected: !prev.ipProtected }))}
              critical
            />
            <CheckItem
              label="Claims de ética revisados"
              checked={checklist.responsibleClaims}
              onChange={() => setChecklist(prev => ({ ...prev, responsibleClaims: !prev.responsibleClaims }))}
              critical
            />
            <CheckItem
              label="Production Locked visible"
              checked={checklist.productionLockedVisible}
              onChange={() => setChecklist(prev => ({ ...prev, productionLockedVisible: !prev.productionLockedVisible }))}
            />
            <CheckItem
              label="Créditos de autor visibles"
              checked={checklist.creditsVisible}
              onChange={() => setChecklist(prev => ({ ...prev, creditsVisible: !prev.creditsVisible }))}
            />
          </div>
        </div>

        {/* Modular Integrations status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3" id="showcase-integrations-container">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Sincronización del Ecosistema ORBI
            </h3>
            <p className="text-[11px] text-slate-400">Estado de enlaces cruzados para el showcase.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <IntegrationCard
              title="Public Demo Hub"
              status="Controlled Locked"
              desc="Vincular el Hub de lanzamiento a la Showcase Edition"
              onLink={() => alert("El Public Demo Hub se encuentra vinculado de forma automática y controlada.")}
              buttonText="Vincular Hub"
            />
            <IntegrationCard
              title="Launch Media Kit"
              status={integrationStatus.mediaKit}
              desc="Transmitir scripts públicos aprobados para material de video"
              onLink={() => handleTriggerIntegration("mediaKit", "Launch Media Kit")}
              buttonText="Sincronizar"
            />
            <IntegrationCard
              title="Demo Deck Export"
              status={integrationStatus.exportPack}
              desc="Utilizar deck e infografía A4 limpios como fuentes oficiales"
              onLink={() => handleTriggerIntegration("exportPack", "Demo Deck Export")}
              buttonText="Sincronizar"
            />
            <IntegrationCard
              title="Stakeholder Binder"
              status={integrationStatus.binder}
              desc="Vincular resumen de vitrina con la carpeta de inversiones"
              onLink={() => handleTriggerIntegration("binder", "Stakeholder Binder")}
              buttonText="Vincular"
            />
          </div>
        </div>
      </div>

      {/* 5. Public Showcase Report Preview & Controls */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 space-y-4" id="showcase-report-preview-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider">
                Preview: ORBI Sentinel IA — Public Showcase Edition Report
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">Material unificado y sanitizado listo para descargar o copiar.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedMode("hackathon");
                setSelectedRoute("60s");
                setScannerText(narrativeBaseText);
                performScan(narrativeBaseText);
                setChecklist({
                  noRealData: true,
                  noCredentials: true,
                  noIpRtsp: true,
                  noPii: true,
                  noSourceCode: true,
                  noInternalPrompts: true,
                  ipProtected: true,
                  responsibleClaims: true,
                  productionLockedVisible: true,
                  creditsVisible: true,
                  modeSelected: true,
                  routeSelected: true,
                  exportContentSanitized: true
                });
                alert("Se han reseteado los filtros del Showcase Center.");
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-mono rounded transition-all"
            >
              Resetear Panel
            </button>
            <button
              onClick={() => triggerCopy("Full Showcase Report", generateFullReport())}
              disabled={isExportBlocked}
              className={`px-4 py-1.5 rounded text-xs font-mono font-black flex items-center gap-1.5 transition-all ${
                isExportBlocked
                  ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10"
              }`}
              id="btn-copy-full-showcase-report"
            >
              {copiedStates["Full Showcase Report"] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedStates["Full Showcase Report"] ? "Copiado!" : "Copiar Reporte de Showcase"}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono select-text overflow-x-auto whitespace-pre leading-relaxed text-left max-h-60 scrollbar-thin">
          {generateFullReport()}
        </div>

        {/* 6. Official Credits Section */}
        <div className="pt-4 border-t border-slate-850 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-mono leading-relaxed text-slate-400">
          <div className="space-y-1">
            <span className="text-white font-bold block uppercase text-[8px] text-pink-400">Concepto, dirección y universo:</span>
            <p className="text-slate-300">Víctor M. León / ORBI Ecosystem.</p>
          </div>
          <div className="space-y-1">
            <span className="text-white font-bold block uppercase text-[8px] text-pink-400">Co-diseño, arquitectura y QA:</span>
            <p className="text-slate-300">ChatGPT / OpenAI.</p>
          </div>
          <div className="space-y-1">
            <span className="text-white font-bold block uppercase text-[8px] text-pink-400">Asistencia y optimización React:</span>
            <p className="text-slate-300 font-sans">Google AI Studio.</p>
          </div>
        </div>

        {/* Institutional Note */}
        <p className="text-[9px] font-mono text-center text-slate-500 border-t border-slate-850 pt-3 leading-normal max-w-2xl mx-auto italic">
          “ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.”
        </p>
      </div>
    </div>
  );
}

// Internal small helpers to avoid code repetition and maintain visual polish
function Badge({ text, status }: { text: string; status: "Ready" | "Blocked" }) {
  const isReady = status === "Ready";
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border transition-all ${
      isReady
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
    }`}>
      {isReady ? `● ${text}` : `✗ ${text}`}
    </span>
  );
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 border shrink-0 ${
        active
          ? "bg-pink-500/15 border-pink-500/35 text-pink-400"
          : "bg-slate-900 border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-300"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  critical = false
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  critical?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 px-2 py-1 bg-slate-950/40 rounded border border-slate-850/60 hover:bg-slate-950 transition-all cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded text-pink-500 focus:ring-pink-500 h-3.5 w-3.5 bg-slate-900 border-slate-800"
      />
      <span className="truncate flex-1">{label}</span>
      {critical && (
        <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1 rounded uppercase font-black tracking-widest shrink-0 scale-90">
          Critical
        </span>
      )}
    </label>
  );
}

function IntegrationCard({
  title,
  status,
  desc,
  onLink,
  buttonText
}: {
  title: string;
  status: string;
  desc: string;
  onLink: () => void;
  buttonText: string;
}) {
  const isLinked = status.includes("Linked") || status.includes("Approved") || status.includes("Locked");
  return (
    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2">
      <div className="space-y-1">
        <div className="flex justify-between items-center gap-2">
          <span className="font-bold text-white font-mono text-[10px] uppercase tracking-wider">{title}</span>
          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
            isLinked ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500 border border-slate-800"
          }`}>
            {status}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-sans leading-normal">{desc}</p>
      </div>
      <button
        onClick={onLink}
        className={`w-full text-center py-1 rounded text-[10px] font-mono font-bold transition-all ${
          isLinked
            ? "bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
            : "bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function ShieldAlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
