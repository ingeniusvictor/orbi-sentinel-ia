import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Video,
  MessageSquare,
  Mail,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Share2,
  FileVideo,
  Info,
  ChevronDown,
  Globe,
  Users,
  Terminal,
  HelpCircle,
  ShieldAlert,
  Sliders,
  CheckSquare,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

interface SentinelLaunchMediaKitProps {
  userRole: "conserje" | "admin" | "tecnico";
  isDemoMode: boolean;
  onAddAuditLog?: (module: string, action: string) => void;
}

export default function SentinelLaunchMediaKit({
  userRole,
  isDemoMode,
  onAddAuditLog
}: SentinelLaunchMediaKitProps) {
  // Navigation Tabs for Sentinel Launch Media Kit
  const [activeSubTab, setActiveSubTab] = useState<"content" | "qa_lock">("content");

  // Checklist State (12 Factors of Launch Media Readiness)
  const [checklist, setChecklist] = useState({
    demoHubLocked: true,
    noRealDataVisible: true,
    productionLockedVisible: true,
    creditsVisible: true,
    guardrailsVisible: true,
    script30sReady: true,
    script60sReady: true,
    captionsReady: true,
    emailReady: true,
    stakeholderMessagesReady: true,
    landingCopyReady: true,
    responsibleClaimsChecked: true,
  });

  // Interactive QA States for the 10 Audit Fronts (Módulo 4D Requirement)
  const [qaStates, setQaStates] = useState<Record<string, "Ready" | "Needs Review" | "Blocked">>({
    safetyBanner: "Ready",
    videoScriptGen: "Ready",
    officialScript: "Ready",
    socialCaptionGen: "Ready",
    taglinesOneLiners: "Ready",
    forbiddenClaims: "Ready",
    stakeholderMessages: "Ready",
    publicDemoEmail: "Ready",
    landingPageCopy: "Ready",
    creditsCopyActions: "Ready"
  });

  // Copy success states
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  // Credits Display Mode
  const [creditsMode, setCreditsMode] = useState<"complete" | "short" | "hidden">("complete");

  // Video Script Generator Config
  const [selectedScriptDuration, setSelectedScriptDuration] = useState<"15s" | "30s" | "60s" | "90s">("30s");
  const [selectedScriptFormat, setSelectedScriptFormat] = useState<
    "short" | "tiktok" | "institutional" | "pitch" | "tech"
  >("pitch");

  // Caption Generator Config
  const [selectedPlatform, setSelectedPlatform] = useState<
    "youtube" | "linkedin" | "tiktok" | "instagram" | "whatsapp" | "website"
  >("linkedin");
  const [selectedTone, setSelectedTone] = useState<
    "professional" | "inspiring" | "technical" | "commercial" | "founder"
  >("professional");

  // Determine media readiness status considering both Checklist and QA States
  // Safety critical rules: "noRealDataVisible", "productionLockedVisible", and "responsibleClaimsChecked" are mandatory in checklist.
  // Also, if any of the 10 QA fronts is set to "Blocked", the entire media kit is locked.
  const isVitalChecklistBlocked =
    !checklist.noRealDataVisible ||
    !checklist.productionLockedVisible ||
    !checklist.responsibleClaimsChecked;

  const isAnyQAFrontBlocked = Object.values(qaStates).includes("Blocked");
  const overallBlocked = isVitalChecklistBlocked || isAnyQAFrontBlocked;

  const isAnyQAFrontNeedsReview = Object.values(qaStates).includes("Needs Review");
  const totalChecklistChecked = Object.values(checklist).filter(Boolean).length;
  const totalChecklistFactors = Object.keys(checklist).length;
  const isChecklistIncomplete = totalChecklistChecked < totalChecklistFactors;

  const overallNeedsReview = !overallBlocked && (isAnyQAFrontNeedsReview || isChecklistIncomplete);

  let mediaStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (overallBlocked) {
    mediaStatus = "Blocked";
  } else if (overallNeedsReview) {
    mediaStatus = "Needs Review";
  }

  // Map to final statuses required by prompt:
  // - Ready for Controlled Public Communication
  // - Needs Review
  // - Media Blocked
  const getOverallStatusLabel = () => {
    if (mediaStatus === "Blocked") return "Media Blocked";
    if (mediaStatus === "Needs Review") return "Needs Review";
    return "Ready for Controlled Public Communication";
  };

  // Helper to copy text to clipboard with strict block guardrail
  const handleCopyToClipboard = (text: string, id: string) => {
    if (mediaStatus === "Blocked") {
      if (onAddAuditLog) {
        onAddAuditLog("Launch Media Kit", `INTENTO RECHAZADO: Acción de copiado bloqueada para ${id} debido a vulneración de guardrails.`);
      }
      return;
    }

    navigator.clipboard.writeText(text);
    setCopyStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);

    if (onAddAuditLog) {
      onAddAuditLog("Launch Media Kit", `Copiado elemento de comunicación: ${id}`);
    }
  };

  // Toggle checklist factor
  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    if (onAddAuditLog) {
      onAddAuditLog(
        "Launch Media Kit",
        `Checklist de Prensa: ${String(key)} cambiado a ${updated[key] ? "Marcado" : "Pendiente"}`
      );
    }
  };

  // Change individual QA front state (Módulo 4D interactive auditor)
  const handleUpdateQAState = (frontKey: string, state: "Ready" | "Needs Review" | "Blocked") => {
    setQaStates((prev) => ({ ...prev, [frontKey]: state }));
    if (onAddAuditLog) {
      onAddAuditLog(
        "Launch Media Kit QA Lock",
        `Frente de auditoría '${frontKey}' cambiado a estado: ${state}`
      );
    }
  };

  // Official Credits definition
  const officialCreditsFull = `Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
Implementación asistida y optimización: Google AI Studio.`;

  const officialCreditsShort = `Creadores: Víctor M. León (ORBI Ecosystem) | Co-diseño: ChatGPT (OpenAI) | Opt: Google AI Studio.`;

  const getCreditsTextForOutput = () => {
    if (creditsMode === "complete") {
      return `\n\nCréditos Oficiales:\n${officialCreditsFull}`;
    } else if (creditsMode === "short") {
      return `\n\nCréditos: ${officialCreditsShort}`;
    }
    return "";
  };

  // --------------------------------------------------------------------------
  // AUDITED TEXTS FOR PUBLIC LAUNCH (RESPONSIBLE COMMUNICATION PASS - MÓDULO 4D)
  // --------------------------------------------------------------------------

  // Official 30s Video Script
  const official30sScript = `=========================================
ORBI SENTINEL IA - GUION OFICIAL 30 SEGUNDOS
=========================================
[00:00 - 00:05] [HOOK / PROBLEMA]
Locución: "Las cámaras están en todas partes, pero muchas veces la operación sigue siendo dispersa y requiere soporte constante para diagnosticar fallas de red."
Visual: Transición rápida por mosaico de cámaras simuladas con señales de mantenimiento.

[00:05 - 00:12] [PRESENTACIÓN]
Locución: "ORBI Sentinel IA centraliza la supervisión, diagnóstico CCTV y trazabilidad local en una experiencia simple por fuera y potente por dentro."
Visual: El logo de ORBI Sentinel IA destella con luz verde esmeralda y abre la consola unificada con dashboards fluidos.

[00:12 - 00:20] [LÍNEAS DE PRODUCTO]
Locución: "Field para operaciones solares e industriales. Community para condominios y conserjería. Consumer Lab para validar cámaras domésticas en laboratorio de forma responsable."
Visual: Tres pestañas se iluminan dinámicamente mostrando gráficos de diagnóstico PoE emulado, simulador de privacidad vecinal y bridge local de pruebas.

[00:20 - 00:26] [PRIVACIDAD & CONTROL]
Locución: "Demo controlada, sin datos reales y con privacidad por diseño."
Visual: Enmascaramiento dinámico de rostros mediante polígonos pixelados y sello de seguridad "Production Locked" activo.

[00:26 - 00:30] [CIERRE DE MARCA]
Locución: "ORBI Sentinel IA, parte del Ecosistema ORBI."
Visual: Cierre institucional con la marca Víctor M. León / ORBI Ecosystem.`;

  // Dynamic Video Script Generator Data
  const getGeneratedVideoScript = () => {
    let hook = "";
    let problem = "";
    let solution = "";
    let focus = "";
    let privacy = "";
    let closure = "";

    if (selectedScriptDuration === "15s") {
      hook = "¿Las cámaras registran pero falta claridad técnica ante fallas?";
      problem = "Sistemas CCTV inconexos e interfaces complejas demoran el diagnóstico.";
      solution = "ORBI Sentinel IA asiste con semáforos de salud CCTV en un entorno de demo controlada / piloto acotado.";
      focus = "Ofrece Field para plantas solares y Community para condominios.";
      privacy = "Demo controlada 100% sanitizada con privacidad por diseño.";
      closure = "ORBI Sentinel IA: Simple por fuera, potente por dentro.";
    } else if (selectedScriptDuration === "30s") {
      hook = "¿Busca simplificar la supervisión de enlaces perimetrales de CCTV?";
      problem = "Las plantas solares y condominios dedican demasiado tiempo a diagnosticar fallas de enlaces o switches PoE.";
      solution = "ORBI Sentinel IA simplifica el diagnóstico de switches PoE y estado de comunicación de cámaras en un solo clic.";
      focus = "Ofrece flujos de demo controlada / piloto acotado adaptados a O&M (Field) y conserjes (Community).";
      privacy = "Operación simulada responsable, sin exposición de datos reales ni IPs de clientes.";
      closure = "ORBI Sentinel IA. Diseñado por Víctor M. León, impulsado por el Ecosistema ORBI.";
    } else if (selectedScriptDuration === "60s") {
      hook = "La supervisión moderna requiere comprender la infraestructura de red, no solo ver imágenes.";
      problem = "Cuando una cámara perimetral falla en terreno, discriminar si el problema es de energía PoE o de red local toma horas de correos ineficientes.";
      solution = "ORBI Sentinel IA une el diagnóstico de hardware local con una interfaz simplificada mediante asistencia contextual con validación humana.";
      focus = "Descubre Sentinel Field para O&M con diagnósticos ping y Sentinel Community que simplifica la interacción de guardias sin sobrecargar su rutina de trabajo.";
      privacy = "Como software responsable, operamos bajo 'Production Locked' en entorno de demo controlada / piloto acotado, protegiendo la seguridad operacional.";
      closure = "Agenda tu prueba de concepto limitada de 7 a 15 días. ORBI Sentinel IA, parte del Ecosistema ORBI.";
    } else {
      // 90s
      hook = "Bienvenidos al futuro de la supervisión de eventos de riesgo y salud de CCTV multisitio.";
      problem = "En el ecosistema industrial actual, las gerencias de O&M y las administraciones sufren por lo mismo: datos fragmentados, falsas promesas comerciales y cámaras apagadas que nadie nota hasta que ocurre un incidente.";
      solution = "ORBI Sentinel IA resuelve esto mediante interfaces de asistencia contextual con validación humana. Aislamos la complejidad de los protocolos y entregamos un semáforo de salud de CCTV. Permite identificar si la falla se debe a caídas de switch PoE o problemas de latencia, ofreciendo una solución que puede complementar sistemas existentes según compatibilidad.";
      focus = "A través de nuestro Public Demo Hub, puedes alternar entre la consola técnica Field, el panel residencial Community, y el Consumer Bridge para validación de equipos residenciales.";
      privacy = "No prometemos invulnerabilidad ni detección perfecta. Creemos en los límites del software: sin falsas expectativas, con enmascaramiento por diseño y privacidad rigurosa.";
      closure = "Construye pilotos controlados de 1 a 3 cámaras perimetrales por un plazo de 7 a 15 días. Creado por Víctor M. León / ORBI Ecosystem.";
    }

    // Adjust based on format
    let intro = `GUION RECOMENDADO: [Duración: ${selectedScriptDuration}] [Formato: ${selectedScriptFormat.toUpperCase()}]`;
    let body = `

[HOOK / INTRO] (0 - 15% del tiempo)
- Narrador / Texto en pantalla: "${hook}"
- Visual sugerido: Enfoque de cámara lenta sobre un switch industrial simulado parpadeando en rojo.

[EL PROBLEMA] (15% - 40% del tiempo)
- Narrador: "${problem}"
- Visual sugerido: Dashboard que muestra logs técnicos simulados y alertas estructuradas.

[LA SOLUCIÓN SENTINEL] (40% - 70% del tiempo)
- Narrador: "${solution}"
- Visual sugerido: El usuario activa el modo unificado y el panel se torna color esmeralda con indicadores claros de diagnóstico.

[VALOR DE LÍNEA DE PRODUCTO] (70% - 85% del tiempo)
- Narrador: "${focus}"
- Visual sugerido: Vistas de Field Operations y EasyView del conserje funcionando de forma simulada y segura.

[POLÍTICA DE PRIVACIDAD & SEGURIDAD] (85% - 95% del tiempo)
- Narrador: "${privacy}"
- Visual sugerido: Cartel de "Production Locked" y polígonos de privacidad tapando rostros ficticios.

[CIERRE Y ACCIÓN RESPONSABLE] (95% - 100% del tiempo)
- Narrador: "${closure}"
- Visual sugerido: Enlaces limpios del Ecosistema ORBI y créditos oficiales visibles.`;

    return intro + body + getCreditsTextForOutput();
  };

  // Social Caption Generator Data (Audited for Responsible Claims)
  const getGeneratedCaption = () => {
    let title = "";
    let core = "";
    let lines = "";
    let safety = "";
    let hashtags = "#ORBISentinel #CCTV #SecurityTech #OM #SolarEnergy #CommunityTech #OrbiEcosystem";

    if (selectedTone === "professional") {
      title = "Presentamos ORBI Sentinel IA: Diagnóstico de Red CCTV Responsable.";
      core = "Unificamos la reportabilidad de eventos CCTV con la telemetría de comunicaciones en una interfaz simplificada. Diseñado para brindar asistencia contextual con validación humana en plantas de O&M e infraestructura residencial.";
      lines = "- Sentinel Field: Diagnóstico técnico de cámaras y switches PoE.\n- Sentinel Community: Consola de bajo estrés para conserjería y comités.\n- Consumer Lab: Validación segura de hardware doméstico en laboratorio de forma responsable.";
      safety = "Nota de Compromiso: Esta demo interactiva opera bajo el principio 'Production Locked' utilizando datos sanitizados y no recopila información operacional real de clientes.";
    } else if (selectedTone === "inspiring") {
      title = "Supervisión Inteligente: Simple por fuera, potente por dentro, responsable según el entorno donde opera. 🛰️";
      core = "La tecnología debe asistir a las personas, no abrumarlas con alertas complejas. ORBI Sentinel IA apoya la supervisión de eventos de riesgo conviviendo con la privacidad individual y la claridad de red.";
      lines = "Desde plantas industriales hasta condominios, llevamos el diagnóstico preventivo a todos los niveles mediante un piloto acotado adaptado al rol del operador.";
      safety = "Comprometidos con el desarrollo ético de software, promovemos demostraciones controladas y protegemos activamente la privacidad mediante enmascaramiento dinámico.";
    } else if (selectedTone === "technical") {
      title = "ORBI Sentinel IA v0.4.3 - Comunicación Segura en Public Demo Hub.";
      core = "Consolidamos el kernel con diagnóstico ICMP, simuladores de consumo WAN y compatibilidad de switches PoE. Ofrecemos trazabilidad local mediante hashes SHA-256 para auditoría de eventos de riesgo.";
      lines = "Capacidades validadas:\n- Evidencia técnica de laboratorio firmada localmente mediante SHA-256.\n- Medidor dinámico de jitter y packet loss perimetral.\n- Registro de auditoría protegido con control de integridad.";
      safety = "Sandboxed Environment: Toda la información técnica mostrada es simulada con propósitos didácticos y de preventa técnica.";
    } else if (selectedTone === "commercial") {
      title = "¿Cómo supervisar tus cámaras perimetrales de forma responsable? Descubre ORBI Sentinel IA.";
      core = "La inactividad de las cámaras de vigilancia afecta la continuidad. Sentinel ayuda a identificar posibles eventos a revisar mediante alertas de desconexiones y latencias, ofreciendo una solución que puede complementar sistemas existentes según compatibilidad.";
      lines = "Ofrecemos pilotos limitados y acotados a 1-3 cámaras perimetrales por un plazo de 7 a 15 días, asegurando compatibilidad técnica antes de cualquier despliegue comercial.";
      safety = "Prueba de concepto segura: Explora hoy mismo nuestra maqueta interactiva interactuando directamente en el Public Demo Hub.";
    } else {
      // founder
      title = "Desarrollo Responsable: El camino de ORBI Sentinel IA hacia la usabilidad ética.";
      core = "Cuando fundamos esta iniciativa dentro del Ecosistema ORBI, sabíamos que la supervisión de CCTV requería interfaces más humanas y transparentes. No prometemos detección perfecta, sino asistencia contextual con validación humana.";
      lines = "Hoy presentamos este kit de lanzamiento público para compartir el avance de nuestras tres líneas de valor: Field, Community y Consumer.";
      safety = "Gracias a la colaboración metodológica modular de Víctor M. León, ChatGPT e implementaciones asistidas de Google AI Studio, hoy demostramos que se puede construir software robusto y transparente.";
    }

    let captionText = `[PUBLICACIÓN RECOMENDADA PARA ${selectedPlatform.toUpperCase()}]

📢 ${title}

${core}

💼 NUESTRAS TRES LÍNEAS DE ACCIÓN:
${lines}

🔒 GUARDRAILS DE SEGURIDAD OPERATIVA:
${safety}

${hashtags}`;

    return captionText + getCreditsTextForOutput();
  };

  // Stakeholder Message Templates (Audited for Responsible Claims)
  const stakeholderTemplates = {
    om: `Hola [Nombre del Gerente],

Te escribo de ORBI Ecosystem para presentarte ORBI Sentinel IA, una plataforma diseñada para resolver la inactividad de cámaras perimetrales en plantas solares.

A diferencia de los NVR tradicionales, Sentinel diagnostica fallas de energía PoE, caídas de switch y degradación de transmisiones en una interfaz esmeralda unificada, ofreciendo una solución que puede complementar sistemas existentes según compatibilidad.

Te invito a explorar nuestra demo interactiva controlada con datos simulados y sanitizados para resguardar la seguridad de la información. Me encantaría coordinar una llamada corta de 10 minutos para mostrarte cómo un piloto acotado de 1 a 3 cámaras por 7-15 días puede entregar un valor operacional estimado y mitigar las brechas operativas en tus activos solares de forma segura. No requerimos credenciales ni accesos reales para esta validación.

Quedo atento.
Saludos cordiales,
[Tu Nombre]`,

    condominio: `Estimados miembros del Comité de Copropietarios,

Junto con saludar, nos gustaría presentarles ORBI Sentinel IA (Línea Community), una propuesta tecnológica para apoyar la supervisión de eventos de riesgo respetando la privacidad de las familias.

Nuestra consola permite al conserje operar en modo 'EasyView' de un solo toque y gestionar incidentes de bajo estrés, mientras protege los perímetros vecinales mediante enmascaramiento dinámico de rostros por polígonos locales.

Les proponemos una demostración interactiva controlada donde podrán comprobar el funcionamiento con datos ficticios sanitizados. Estamos listos para estructurar un piloto de prueba acotado sin alterar la red actual de su condominio.

Atentamente,
[Tu Nombre]`,

    residencia: `Hola [Nombre del Administrador],

Para optimizar la gestión de conserjería y CCTV de su condominio, hemos diseñado ORBI Sentinel IA. 

Ofrecemos una consola simplificada que ayuda a los guardias a supervisar de forma responsable eventos de riesgo con un solo clic, sin la fatiga mental de vigilar decenas de pantallas a la vez. Además, cuenta con un módulo de diagnóstico de red que avisa si el enlace Wi-Fi vecinal tiene problemas de latencia.

Le comparto la ficha de oratoria e invito a agendar una videollamada para interactuar con la demo simulada y analizar un piloto de prueba acotado de 1 a 3 cámaras perimetrales de 7 a 15 días.

Un saludo,
[Tu Nombre]`,

    cctv: `Estimado [Proveedor de CCTV],

Te escribo para explorar una colaboración técnica con ORBI Sentinel IA. 

Nuestra plataforma no busca competir con sus marcas de cámaras o NVRs; al contrario, actúa como una solución de software adicional que puede complementar sistemas existentes según compatibilidad. Añade valor mediante diagnóstico de hardware local (ping, switches PoE, tasa de compresión) y generación de evidencia técnica de laboratorio con firmas hash SHA-256 para incidentes perimetrales.

Podemos integrar sus equipos de prueba en nuestro laboratorio de forma segura y transparente. ¿Le interesaría conocer la matriz de compatibilidad responsable en una demo controlada?

Atentamente,
[Tu Nombre]`,

    investor: `Estimado [Socio / Inversionista],

Le presento ORBI Sentinel IA, el nuevo componente de software crítico del Ecosistema ORBI orientado a la gestión inteligente y supervisión de eventos de riesgo de CCTV industrial y residencial.

Nuestra propuesta destaca por su usabilidad extrema y arquitectura responsable. El software segmenta perfectamente las necesidades de O&M solar (Field) y comités residenciales (Community) bajo estrictas políticas de salvaguarda de datos y privacidad por diseño, evitando falsas expectativas de detección perfecta y ofreciendo asistencia contextual con validación humana.

Estamos abriendo conversaciones para demostraciones globales y pitchs técnicos de preventa en base a maquetas de alta fidelidad. Le comparto el Launch Media Kit para su revisión.

Atentamente,
Víctor M. León / ORBI Ecosystem`,

    aliado: `Estimado [Aliado Tecnológico],

Es un placer saludarle. Queremos compartirle el lanzamiento de la demo controlada de ORBI Sentinel IA.

Nuestra arquitectura une la fiabilidad de protocolos de laboratorio con capas de asistencia contextual con validación humana y reportabilidad ágil para HSE y gerencias. Estructuramos un framework que respeta la soberanía de datos locales mediante trazabilidad local, perfecto para complementar sus ofertas de valor de TI de manera segura.

Quedamos a su disposición para coordinar una sesión técnica guiada por zoom.

Saludos,
[Tu Nombre]`,

    interno: `Estimado equipo interno de ORBI Ecosystem,

Nos complace anunciar el despliegue del hito v0.4.3-sentinel-public-media-communication-lock.

Es imperativo que todas las demos públicas y videos promocionales se realicen respetando estrictamente los guardrails del Public Demo Hub:
1. Asegurar que el 'Demo Mode' esté activado.
2. No usar direcciones IP, RTSP, mapas de coordenadas o nombres de clientes reales bajo ninguna circunstancia.
3. Recordar a las audiencias que Sentinel no reemplaza a la seguridad humana, sino que actúa como una herramienta de diagnóstico, auditoría de CCTV y asistencia contextual con validación humana.

Aprovechemos el nuevo Sentinel Launch Media Kit para homogeneizar nuestra comunicación pública de manera transparente, ética y responsable.

Saludos,
Víctor M. León / Dirección General`,

    video: `[NARRACIÓN DE VIDEO COMERCIAL DE ALTA DIRECCIÓN]

"La infraestructura crítica y las comunidades residenciales demandan claridad, no falsas promesas. ORBI Sentinel IA nace bajo el alero de ORBI Ecosystem para transformar la supervisión de CCTV pasiva en un motor de diagnóstico operacional inteligente y responsable.

Con Sentinel Field, el equipo de planta controla switches PoE y latencias perimetrales. Con Sentinel Community, el conserje opera sin estrés técnico bajo enmascaramiento dinámico de privacidad. 

Simple por fuera. Potente por dentro. Responsable según el entorno donde opera. Bienvenidos a la demostración controlada de ORBI Sentinel IA."`
  };

  // Public Demo Email Template (Audited for Responsible Claims)
  const emailTemplate = `Asunto: Invitación a Demo Controlada: ORBI Sentinel IA - Gestión Inteligente de CCTV y Diagnósticos Perimetrales

Estimado/a [Nombre del Destinatario],

Es un gusto saludarle. 

Desde ORBI Ecosystem, queremos hacerle una cordial invitación a una demostración guiada de ORBI Sentinel IA, nuestra solución de software integrada para el diagnóstico y supervisión de eventos de riesgo de CCTV industrial y vecinal.

En una sesión interactiva corta de 10 a 15 minutos, podremos mostrarle en vivo:
1. El Hub de Diagnóstico Perimetral de CCTV para identificar caídas de switches PoE y pérdida de paquetes.
2. El entorno simplificado 'EasyView' diseñado para personal de guardia de baja fatiga cognitiva.
3. El simulador de privacidad por diseño con enmascaramiento dinámico vecinal.
4. Generación protegida de informes de evidencia técnica de laboratorio firmados con hashes SHA-256 (registro de auditoría protegido con control de integridad).

Aclaración de Transparencia Ética: Nuestra demostración opera estrictamente como una demo controlada / piloto acotado utilizando datos simulados sanitizados, dejando reflejado que no se exponga información confidencial ni se alteren sistemas activos en esta fase técnica preliminar. No requerimos credenciales reales de sus NVRs ni cámaras perimetrales.

¿Tendría disponibilidad para agendar una sesión en línea esta semana? Puede revisar nuestra matriz técnica en la demo adjunta.

Atentamente,
[Tu Nombre]
[Tu Cargo]
ORBI Ecosystem / Víctor M. León`;

  // Website / Landing Page Copy (Audited for Responsible Claims)
  const landingPageCopy = `==================================================================
ORBI SENTINEL IA - WEBSITE & LANDING PAGE COPY
==================================================================

[SECCIÓN 1: HERO]
-----------------
• Título Principal: ORBI Sentinel IA
• Tagline Oficial: "Simple por fuera. Potente por dentro. Responsable según el entorno donde opera."
• Subtítulo: Apoyo a la supervisión de eventos de riesgo, diagnóstico de hardware de comunicaciones y trazabilidad local de incidentes perimetrales de CCTV.
• Botón Principal CTA: Interactuar con la Demo Controlada
• Botón Secundario: Descargar Ficha Técnica de Piloto

[SECCIÓN 2: ¿QUÉ ES SENTINEL?]
------------------------------
ORBI Sentinel IA es una simulación interactiva de alta fidelidad que demuestra cómo integrar la asistencia contextual con validación humana y el diagnóstico de red local de CCTV. Creamos soluciones robustas sin falsas expectativas comerciales de prevención absoluta.

[SECCIÓN 3: NUESTRAS LÍNEAS DE PRODUCTO]
-----------------------------------------
1. SENTINEL FIELD (OPERACIÓN INDUSTRIAL):
   Optimizado para plantas solares PMGD y activos industriales remotos. Diagnostica switches PoE, analiza la salud de transmisiones IP y asiste a las auditorías rápidas de HSE en terreno.
   
2. SENTINEL COMMUNITY (SEGURIDAD VECINAL):
   Diseñado para condominios residenciales y administraciones. Ofrece la vista simplificada 'EasyView' para conserjes, resguardando la privacidad de las familias a través de enmascaramiento dinámico por polígonos locales.
   
3. CONSUMER LAB (BRIDGE DE CONSUMO):
   Puente de software experimental y responsable que demuestra la viabilidad técnica de validar dispositivos residenciales estándar (Eufy, EZVIZ) para pruebas rápidas de laboratorio de bajo costo.

[SECCIÓN 4: PRIVACIDAD POR DISEÑO Y TRANSPARENCIA]
--------------------------------------------------
Nuestra arquitectura impone límites técnicos responsables:
✔ Registro de auditoría protegido con control de integridad local de logs.
✔ Enmascaramiento geográfico para proteger áreas públicas colindantes.
✔ Sello 'Production Locked': Operación simulada segura sin exposición de red.

[SECCIÓN 5: PILOTO ACOTIADO SIN RIESGO (CALL TO ACTION)]
--------------------------------------------------------
No compre un sistema masivo a ciegas. Le proponemos validar la tecnología mediante un piloto acotado:
• Limitado a 1-3 cámaras perimetrales de prueba.
• Periodo controlado de 7 a 15 días de validación.
• Levantamiento inicial de compatibilidad de red sin costo.

[SECCIÓN 6: CRÉDITOS Y ORIGEN]
-------------------------------
ORBI Sentinel IA forma parte del Ecosistema ORBI.
• Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
• Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
• Implementación asistida y optimización: Google AI Studio.

==================================================================`;

  // Lock out view for Conserje role
  if (userRole === "conserje") {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-sans font-bold text-white uppercase tracking-wider">
            Sentinel Launch Media Kit & Script Center
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            La creación de guiones públicos, comunicados de prensa y plantillas comerciales está restringida para el rol de <strong>Conserjería / Guardia</strong>.
          </p>
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-left space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Directriz de Seguridad Operativa
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Por favor, póngase en contacto con un <strong>Administrador General</strong> o <strong>Técnico de Terreno</strong> si requiere exportar materiales de prensa, correos de preventas o guiones para videos de comités vecinales.
          </p>
        </div>
        <p className="text-[10px] font-mono text-slate-600">
          Hito Operativo: v0.4.3-sentinel-public-media-communication-lock
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Public Launch Safety Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              MÓDULO 4D • QA & COMMUNICATION LOCK
            </span>
            <h2 className="text-xl font-sans font-extrabold text-white tracking-tight uppercase">
              Sentinel Launch Media Kit
            </h2>
            <p className="text-xs text-slate-400">
              Centro de comunicación pública sanitizada — auditado para uso externo controlado sin datos reales ni promesas absolutas.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Controlled Public Demo
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              No Real Data
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
              Production Locked
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
              Privacy by Design
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
              Responsible Claims
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-900 text-slate-500 border border-slate-800 uppercase">
              ORBI Ecosystem
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Header Navigation inside Launch Media Kit */}
      <div className="flex border-b border-slate-800 gap-1 pb-px">
        <button
          onClick={() => setActiveSubTab("content")}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "content"
              ? "border-emerald-500 text-emerald-400 font-sans"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Generadores y Copiado Público</span>
        </button>
        <button
          onClick={() => setActiveSubTab("qa_lock")}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "qa_lock"
              ? "border-purple-500 text-purple-400 font-sans"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>Launch Media QA Lock</span>
          {mediaStatus === "Blocked" ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          ) : mediaStatus === "Needs Review" ? (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* 3. Render Tab content */}
      {activeSubTab === "content" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Column: Media Generators & Viewers */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section A: Official 30s Script */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    Guion Oficial de 30 Segundos
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      localStorage.setItem("ORBI_LAUNCH_MEDIA_KIT_APPROVED_CONTENT", JSON.stringify({
                        text: official30sScript,
                        timestamp: new Date().toISOString()
                      }));
                      setCopyStates(prev => ({ ...prev, "binder-sent": true }));
                      if (onAddAuditLog) onAddAuditLog("Launch Media Kit", "Se envió el guion oficial al Stakeholder Binder");
                      setTimeout(() => {
                        setCopyStates(prev => ({ ...prev, "binder-sent": false }));
                      }, 2000);
                    }}
                    disabled={mediaStatus === "Blocked"}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      mediaStatus === "Blocked"
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-850"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {copyStates["binder-sent"] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" /> ¡Enviado!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" /> Enviar al Binder
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(official30sScript, "30s-official")}
                    disabled={mediaStatus === "Blocked"}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      mediaStatus === "Blocked"
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-850"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {copyStates["30s-official"] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Guion
                      </>
                    )}
                  </button>
                </div>
              </div>

              {mediaStatus === "Blocked" ? (
                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-300">Contenido bloqueado para uso externo</p>
                    <p className="text-[11px] text-rose-400">
                      Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-72 whitespace-pre-wrap scrollbar-thin">
                  {official30sScript}
                </div>
              )}
            </div>

            {/* Section B: Dynamic Video Script Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    Generador de Guiones Técnico-Comerciales
                  </h3>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(getGeneratedVideoScript(), "dynamic-script")}
                  disabled={mediaStatus === "Blocked"}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    mediaStatus === "Blocked"
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-850"
                      : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20"
                  }`}
                >
                  {copyStates["dynamic-script"] ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Guion Generado
                    </>
                  )}
                </button>
              </div>

              {/* Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/40">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Duración del Video</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["15s", "30s", "60s", "90s"] as const).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setSelectedScriptDuration(dur);
                          if (onAddAuditLog) onAddAuditLog("Launch Media Kit", `Establecida duración video: ${dur}`);
                        }}
                        className={`py-1 text-xs font-mono font-bold rounded border transition-all ${
                          selectedScriptDuration === dur
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Formato / Enfoque</label>
                  <div className="grid grid-cols-5 gap-1 text-[10px]">
                    {[
                      { id: "short", label: "Short" },
                      { id: "tiktok", label: "Tiktok" },
                      { id: "institutional", label: "Instit" },
                      { id: "pitch", label: "Pitch" },
                      { id: "tech", label: "Tech" }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => {
                          setSelectedScriptFormat(fmt.id as any);
                          if (onAddAuditLog) onAddAuditLog("Launch Media Kit", `Establecido formato guion: ${fmt.id}`);
                        }}
                        className={`py-1 rounded font-bold border transition-all ${
                          selectedScriptFormat === fmt.id
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850"
                        }`}
                        title={fmt.label}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {mediaStatus === "Blocked" ? (
                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-300">Contenido bloqueado para uso externo</p>
                    <p className="text-[11px] text-rose-400">
                      Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap scrollbar-thin">
                  {getGeneratedVideoScript()}
                </div>
              )}
            </div>

            {/* Section C: Social Caption Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    Generador de Textos para Redes Sociales
                  </h3>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(getGeneratedCaption(), "dynamic-caption")}
                  disabled={mediaStatus === "Blocked"}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    mediaStatus === "Blocked"
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-850"
                      : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {copyStates["dynamic-caption"] ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Publicación
                    </>
                  )}
                </button>
              </div>

              {/* Plat / Tone selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/40">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Plataforma</label>
                  <div className="grid grid-cols-6 gap-1 text-[10px]">
                    {(["youtube", "linkedin", "tiktok", "instagram", "whatsapp", "website"] as const).map((plat) => (
                      <button
                        key={plat}
                        onClick={() => {
                          setSelectedPlatform(plat);
                          if (onAddAuditLog) onAddAuditLog("Launch Media Kit", `Establecida plataforma: ${plat}`);
                        }}
                        className={`py-1 font-mono font-bold rounded border transition-all truncate uppercase ${
                          selectedPlatform === plat
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850"
                        }`}
                        title={plat}
                      >
                        {plat.substring(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Tono de Comunicación</label>
                  <div className="grid grid-cols-5 gap-1 text-[10px]">
                    {[
                      { id: "professional", label: "Prof" },
                      { id: "inspiring", label: "Inspir" },
                      { id: "technical", label: "Téc" },
                      { id: "commercial", label: "Com" },
                      { id: "founder", label: "Fund" }
                    ].map((tn) => (
                      <button
                        key={tn.id}
                        onClick={() => {
                          setSelectedTone(tn.id as any);
                          if (onAddAuditLog) onAddAuditLog("Launch Media Kit", `Establecido tono caption: ${tn.id}`);
                        }}
                        className={`py-1 rounded font-bold border transition-all ${
                          selectedTone === tn.id
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850"
                        }`}
                        title={tn.label}
                      >
                        {tn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {mediaStatus === "Blocked" ? (
                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-300">Contenido bloqueado para uso externo</p>
                    <p className="text-[11px] text-rose-400">
                      Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap scrollbar-thin">
                  {getGeneratedCaption()}
                </div>
              )}
            </div>

            {/* Section D: Stakeholder Templates & Email Template & Landing Copy */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    Mensajes de Stakeholders, Email & Landing Copy
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Stakeholder Template select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider">
                      Fichas para Mensajes Directos (WhatsApp / Telegram / Slack)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: "om", label: "Gerente O&M", color: "hover:border-emerald-500/30 text-emerald-400 bg-emerald-950/10" },
                      { id: "condominio", label: "Comité Condominio", color: "hover:border-pink-500/30 text-pink-400 bg-pink-950/10" },
                      { id: "residencia", label: "Administrador", color: "hover:border-indigo-500/30 text-indigo-400 bg-indigo-950/10" },
                      { id: "cctv", label: "Proveedor CCTV", color: "hover:border-teal-500/30 text-teal-400 bg-teal-950/10" },
                      { id: "investor", label: "Socio / Inversionista", color: "hover:border-purple-500/30 text-purple-400 bg-purple-950/10" },
                      { id: "aliado", label: "Aliado Tecnológico", color: "hover:border-blue-500/30 text-blue-400 bg-blue-950/10" },
                      { id: "interno", label: "Equipo Interno", color: "hover:border-yellow-500/30 text-yellow-400 bg-yellow-950/10" },
                      { id: "video", label: "Video Alta Dirección", color: "hover:border-cyan-500/30 text-cyan-400 bg-cyan-950/10" },
                    ].map((stk) => (
                      <button
                        key={stk.id}
                        onClick={() => handleCopyToClipboard(stakeholderTemplates[stk.id as keyof typeof stakeholderTemplates] + getCreditsTextForOutput(), `stk-${stk.id}`)}
                        disabled={mediaStatus === "Blocked"}
                        className={`p-2.5 rounded-lg border border-slate-800 text-left transition-all ${stk.color} text-xs font-medium flex flex-col justify-between h-20 ${
                          mediaStatus === "Blocked" ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-850"
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Copiar Ficha</span>
                        <span className="font-bold truncate w-full text-[11px]">{stk.label}</span>
                        <div className="flex items-center justify-between w-full text-[9px] pt-1 border-t border-slate-800/60 mt-1">
                          <span className="font-mono text-slate-500 uppercase">Copy</span>
                          {copyStates[`stk-${stk.id}`] ? (
                            <span className="text-emerald-400 font-bold">¡Listo!</span>
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invitation email */}
                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider">
                      Plantilla de Correo Invitación Demo
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(emailTemplate + getCreditsTextForOutput(), "email-invite")}
                      disabled={mediaStatus === "Blocked"}
                      className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all ${
                        mediaStatus === "Blocked"
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {copyStates["email-invite"] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Email</span>
                    </button>
                  </div>
                  {mediaStatus === "Blocked" ? (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg text-xs text-rose-400 leading-normal">
                      Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                      {emailTemplate}
                    </div>
                  )}
                </div>

                {/* Website / Landing Copy */}
                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider">
                      Copy Base para Landing Page / Website
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(landingPageCopy + getCreditsTextForOutput(), "landing-copy")}
                      disabled={mediaStatus === "Blocked"}
                      className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-all ${
                        mediaStatus === "Blocked"
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {copyStates["landing-copy"] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Landing Copy</span>
                    </button>
                  </div>
                  {mediaStatus === "Blocked" ? (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg text-xs text-rose-400 leading-normal">
                      Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable.
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
                      {landingPageCopy}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Checklist, Claims & Credits */}
          <div className="lg:col-span-4 space-y-6">

            {/* Launch Media Readiness Checklist Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  Media Readiness Checklist
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {totalChecklistChecked}/{totalChecklistFactors} Factores
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verifique los frentes éticos y comunicacionales obligatorios para autorizar lanzamientos públicos seguros.
              </p>

              {/* Launch Status Badge in Sidebar Checklist */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Media Status:</span>
                  {mediaStatus === "Ready" ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/20">
                      READY FOR LAUNCH
                    </span>
                  ) : mediaStatus === "Needs Review" ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold uppercase border border-amber-500/20">
                      NEEDS AUDIT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-mono font-bold uppercase border border-rose-500/20">
                      MEDIA BLOCKED
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      mediaStatus === "Ready" ? "bg-emerald-400" : mediaStatus === "Needs Review" ? "bg-amber-400" : "bg-rose-500"
                    }`}
                    style={{ width: `${(totalChecklistChecked / totalChecklistFactors) * 100}%` }}
                  />
                </div>
              </div>

              {/* Checklist factors */}
              <div className="space-y-2">
                {[
                  { key: "noRealDataVisible", label: "Sin Datos Reales Visibles (Mandatorio)", isVital: true },
                  { key: "productionLockedVisible", label: "Sello 'Production Locked' Activo (Mandatorio)", isVital: true },
                  { key: "responsibleClaimsChecked", label: "Claims Responsables Verificados (Mandatorio)", isVital: true },
                  { key: "demoHubLocked", label: "Public Demo Hub Locked", isVital: false },
                  { key: "guardrailsVisible", label: "Guardrails de Seguridad Visibles", isVital: false },
                  { key: "creditsVisible", label: "Créditos de Creación Visibles", isVital: false },
                  { key: "script30sReady", label: "Guion 30s Oficial Listo", isVital: false },
                  { key: "script60sReady", label: "Guion 60s Técnico Listo", isVital: false },
                  { key: "captionsReady", label: "Captions de Redes Listos", isVital: false },
                  { key: "emailReady", label: "Email de Invitación Listo", isVital: false },
                  { key: "stakeholderMessagesReady", label: "Mensajes Directos Listos", isVital: false },
                  { key: "landingCopyReady", label: "Copia de Landing Page Listas", isVital: false },
                ].map((item) => {
                  const isChecked = checklist[item.key as keyof typeof checklist];
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleChecklist(item.key as any)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded text-left transition-all text-xs border ${
                        isChecked
                          ? "bg-slate-950/40 border-slate-800/80 text-slate-300"
                          : "bg-slate-900 border-transparent text-slate-500 hover:bg-slate-850"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? item.isVital
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-850 border-slate-700 text-slate-400"
                            : item.isVital
                            ? "border-rose-500/40"
                            : "border-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="truncate flex-1">{item.label}</span>
                      {item.isVital && (
                        <span className="text-[8px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 px-1 py-0.5 rounded">
                          Vital
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product One-Liners & Forbidden Claims Center */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  Claims & Taglines Center
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Tagline Principal</span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 border-l-2 border-l-emerald-400 font-sans italic text-slate-300">
                    “Simple por fuera. Potente por dentro. Responsable según el entorno donde opera.”
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Approved One-Liners</span>
                  <ul className="space-y-1.5 text-slate-400 list-disc pl-4 text-[11px] leading-relaxed">
                    <li>“ORBI Sentinel IA centraliza CCTV, incidentes y diagnóstico operacional en una experiencia segura y entendible.”</li>
                    <li>“Una plataforma para presentar, diagnosticar y estructurar pilotos CCTV sin exponer datos sensibles.”</li>
                    <li>“Field para O&M, Community para condominios y Consumer Lab para cámaras domésticas responsables.”</li>
                  </ul>
                </div>

                {/* Forbidden Claims Panel */}
                <div className="p-3.5 bg-rose-950/15 border border-rose-500/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold font-sans uppercase tracking-wider text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Frases Prohibidas en Videos/Prensa</span>
                  </div>
                  <p className="text-[10px] text-rose-300/80 leading-relaxed">
                    Bajo ninguna circunstancia use los siguientes argumentos comerciales que comprometan falsas promesas o vulneren políticas éticas:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-[10px] font-mono text-rose-300 pl-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Detecta todos los robos.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Reemplaza cualquier NVR.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Funciona con cualquier cámara.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Sistema productivo definitivo.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Evidencia judicial garantizada.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Previene todos los incidentes.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Reemplaza guardias.”</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="line-through text-rose-400/80">“Control total de cámaras cloud.”</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Credits Integration with Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  Créditos & Atribución de Marca
                </h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                ORBI Sentinel IA es propiedad intelectual del ecosistema. Modifique cómo se adjuntan los créditos en los textos copiados:
              </p>

              {/* Toggle options */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                {[
                  { id: "complete", label: "Completos" },
                  { id: "short", label: "Resumido" },
                  { id: "hidden", label: "Ocultar" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setCreditsMode(opt.id as any);
                      if (onAddAuditLog) onAddAuditLog("Launch Media Kit", `Establecido modo de créditos: ${opt.id}`);
                    }}
                    className={`py-1 rounded font-bold transition-all ${
                      creditsMode === opt.id
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Static Institutional View */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <p className="font-bold text-white uppercase tracking-wider text-[9px] font-mono text-slate-500">
                  Atribución Institucional Obligatoria
                </p>
                <div className="space-y-1.5">
                  <p>
                    <strong>Concepto, dirección creativa y universo:</strong> Víctor M. León / ORBI Ecosystem.
                  </p>
                  <p>
                    <strong>Co-diseño, arquitectura, prompts y QA:</strong> ChatGPT / OpenAI.
                  </p>
                  <p>
                    <strong>Implementación asistida y optimización:</strong> Google AI Studio.
                  </p>
                </div>
                <p className="text-[10px] italic text-emerald-400 border-t border-slate-800/85 pt-1.5 mt-1">
                  “ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.”
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* MÓDULO 4D NEW PANEL: Launch Media QA Lock Panel */
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Overall Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                  mediaStatus === "Ready"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : mediaStatus === "Needs Review"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
                }`}>
                  {mediaStatus === "Ready" ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : mediaStatus === "Needs Review" ? (
                    <Sliders className="w-8 h-8" />
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    ESTADO GENERAL DE AUDITORÍA (QA LOCK)
                  </span>
                  <h3 className={`text-xl font-sans font-extrabold tracking-tight uppercase ${
                    mediaStatus === "Ready"
                      ? "text-emerald-400"
                      : mediaStatus === "Needs Review"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}>
                    {getOverallStatusLabel()}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    {mediaStatus === "Ready"
                      ? "Validación exitosa. Todo el material público ha sido sanitizado bajo enmascaramiento por diseño, sin datos sensibles ni expectativas falsas."
                      : mediaStatus === "Needs Review"
                      ? "Existen frentes de comunicación que requieren revisión técnica o el checklist de prensa se encuentra incompleto."
                      : "¡CONEXIÓN BLOQUEADA! Contenido bloqueado para uso externo hasta restaurar los requisitos críticos de comunicación responsable."}
                  </p>
                </div>
              </div>

              {/* Lock Action Info Badge */}
              <div className={`p-4 rounded-lg border shrink-0 text-center space-y-1 w-full md:w-56 ${
                mediaStatus === "Ready"
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                  : mediaStatus === "Needs Review"
                  ? "bg-amber-500/5 border-amber-500/10 text-amber-400"
                  : "bg-rose-500/5 border-rose-500/10 text-rose-400"
              }`}>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">Acciones Externas</span>
                <span className="text-base font-bold font-mono">
                  {mediaStatus === "Ready" ? "DESBLOQUEADAS" : "BLOQUEADAS"}
                </span>
                <p className="text-[9px] text-slate-400 mt-1">
                  {mediaStatus === "Ready" 
                    ? "Copiado y exportación de textos listos" 
                    : "Copiar textos públicos inhabilitado"}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive QA Audit Matrix Grid (10 fronts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "safetyBanner",
                name: "1. Public Launch Safety Banner",
                icon: ShieldCheck,
                color: "text-emerald-400",
                rules: [
                  "Verificar que el banner esté visible encabezando el Media Kit.",
                  "Comprobar las 6 badges activas: Controlled Public Demo, No Real Data, etc.",
                  "Resguardar que no existan IPs reales ni mapas operativos reales expuestos."
                ]
              },
              {
                id: "videoScriptGen",
                name: "2. Video Script Generator",
                icon: FileVideo,
                color: "text-purple-400",
                rules: [
                  "Validar duraciones selectoras de 15s, 30s, 60s y 90s.",
                  "Comprobar formatos (Short, Tiktok, Institucional, Pitch, Técnico).",
                  "Evitar promesas absolutas sobre prevención de robos o infalibilidad técnica."
                ]
              },
              {
                id: "officialScript",
                name: "3. Official 30-Second Script",
                icon: Video,
                color: "text-emerald-400",
                rules: [
                  "Garantizar estructura de tiempos fija: [0-5s] [5-12s] [12-20s] [20-26s] [26-30s].",
                  "Debe incluir literal: 'Demo controlada, sin datos reales y con privacidad por diseño.'",
                  "Evitar nombres de clientes reales, condominios, marcas o coordenadas."
                ]
              },
              {
                id: "socialCaptionGen",
                name: "4. Social Caption Generator",
                icon: MessageSquare,
                color: "text-blue-400",
                rules: [
                  "Comprobar publicaciones para LinkedIn, YouTube, TikTok, Instagram, WhatsApp, Web.",
                  "Revisar tonos: Profesional, Inspirador, Técnico, Comercial, Fundador.",
                  "Asegurar inclusión de los guardrails éticos de 'Production Locked' en cada post."
                ]
              },
              {
                id: "taglinesOneLiners",
                name: "5. Taglines & One-Liners",
                icon: Globe,
                color: "text-teal-400",
                rules: [
                  "Verificar consistencia del Tagline Oficial del Ecosistema ORBI.",
                  "Validar que los 3 one-liners mantengan un lenguaje humilde y claro.",
                  "No prometer compatibilidad universal no certificada en laboratorios."
                ]
              },
              {
                id: "forbiddenClaims",
                name: "6. Forbidden Claims Panel",
                icon: AlertTriangle,
                color: "text-rose-400",
                rules: [
                  "Verificar que el panel de claims prohibidos esté activo y visible en color rojo.",
                  "Confirmar inhabilitación de frases: 'Detecta todos los robos', 'Reemplaza NVR', etc.",
                  "Evitar claims de validación legal o que parezcan una oferta de contrato definitiva."
                ]
              },
              {
                id: "stakeholderMessages",
                name: "7. Stakeholder Messages",
                icon: Users,
                color: "text-indigo-400",
                rules: [
                  "Comprobar cartas dirigidas para O&M, comités residenciales, CCTV, inversionistas, etc.",
                  "Garantizar propuesta estricta de piloto acotado de 1-3 cámaras y 7-15 días.",
                  "No solicitar credenciales, claves, RTSP directos ni IPs reales en mensajes."
                ]
              },
              {
                id: "publicDemoEmail",
                name: "8. Public Demo Email",
                icon: Mail,
                color: "text-amber-400",
                rules: [
                  "Validar estructura de correo: saludo, qué es, qué se mostrará, duración y próximo paso.",
                  "Comprobar mención obligatoria de 'demo simulada con fines preventivos de preventas'.",
                  "No incluir precios comerciales cerrados ni promesas contractuales definitivas."
                ]
              },
              {
                id: "landingPageCopy",
                name: "9. Landing Page Copy",
                icon: FileText,
                color: "text-cyan-400",
                rules: [
                  "Validar secciones: Hero, ¿Qué es?, Líneas de producto (Field/Community/Consumer), etc.",
                  "Explicar de forma transparente los límites técnicos del software.",
                  "Asegurar Atribución de Origen y créditos institucionales en el pie de página."
                ]
              },
              {
                id: "creditsCopyActions",
                name: "10. Credits & Copy Actions",
                icon: Sparkles,
                color: "text-yellow-400",
                rules: [
                  "Verificar toggle de créditos: completos (Víctor M. León / ChatGPT / AI Studio), resumidos u ocultos.",
                  "Garantizar bloqueo inmediato de copia si existe estado general de 'Blocked'.",
                  "Asegurar que los créditos institucionales sigan visibles en el panel de marca."
                ]
              }
            ].map((front) => {
              const FrontIcon = front.icon;
              const currentFrontStatus = qaStates[front.id];
              return (
                <div key={front.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <FrontIcon className={`w-4.5 h-4.5 ${front.color}`} />
                      <h4 className="text-xs font-sans font-extrabold text-white uppercase tracking-wider">
                        {front.name}
                      </h4>
                    </div>

                    {/* Interactive Selector Buttons */}
                    <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-mono">
                      {(["Ready", "Needs Review", "Blocked"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateQAState(front.id, st)}
                          className={`px-2 py-0.5 rounded font-bold transition-all ${
                            currentFrontStatus === st
                              ? st === "Ready"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : st === "Needs Review"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {st === "Ready" ? "Ready" : st === "Needs Review" ? "Audit" : "Block"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Rules & Status Badge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Estado Auditoría:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        currentFrontStatus === "Ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : currentFrontStatus === "Needs Review"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {currentFrontStatus === "Ready" ? "READY" : currentFrontStatus === "Needs Review" ? "NEEDS REVIEW" : "BLOCKED"}
                      </span>
                    </div>

                    <div className="space-y-1.5 p-3 bg-slate-950 rounded-lg border border-slate-800/60">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Puntos de Control Mandatorios
                      </span>
                      <ul className="space-y-1 text-[10px] text-slate-400 leading-normal list-disc pl-3">
                        {front.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Link Switch to Content Tab */}
                    <button
                      onClick={() => setActiveSubTab("content")}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-[10px] font-mono text-slate-400 hover:text-white border border-slate-800/80 transition-all group"
                    >
                      <span>Ir al visor de contenido</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
