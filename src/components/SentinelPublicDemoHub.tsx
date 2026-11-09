import React, { useState } from "react";
import {
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Cpu,
  Layers,
  Compass,
  Eye,
  Users,
  Home,
  Briefcase,
  Play,
  Copy,
  Check,
  ExternalLink,
  Info,
  UserCheck,
  Terminal,
  ShieldAlert,
  Server,
  KeyRound,
  Wrench,
  HardDrive,
  FileText,
  ClipboardList,
  PlusCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  Award,
  ShieldCheck,
  Building
} from "lucide-react";
import { motion } from "motion/react";

interface PublicDemoHubProps {
  userRole: "conserje" | "admin" | "tecnico";
  setUserRole: (role: "conserje" | "admin" | "tecnico") => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentLine: "field" | "community";
  setCurrentLine: (line: "field" | "community") => void;
  isDemoMode: boolean;
  toggleDemoMode?: () => void;
  onAddAuditLog?: (action: string, details: string) => void;
}

export default function SentinelPublicDemoHub({
  userRole,
  setUserRole,
  currentTab,
  setCurrentTab,
  currentLine,
  setCurrentLine,
  isDemoMode,
  toggleDemoMode,
  onAddAuditLog
}: PublicDemoHubProps) {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedMinuta, setCopiedMinuta] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<string>("demo-publica");
  const [activeTour, setActiveTour] = useState<"60s" | "3m" | "5m">("60s");
  const [tourStep, setTourStep] = useState<number>(0);

  // Launch Checklist State
  const [checklist, setChecklist] = useState({
    demoModeActive: true,
    productionLockedVisible: true,
    noRealDataVisible: true,
    publicDemoHubReady: true,
    fieldReady: true,
    communityReady: true,
    consumerLabExplained: true,
    privacyShieldVisible: true,
    guardrailsVisible: true,
    creditsVisible: true,
    publicDemoBriefReady: true,
    nextStepDefined: true
  });

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    if (onAddAuditLog) {
      onAddAuditLog(
        "Frente de Auditoría",
        `Checklist Demo Pública: ${String(key)} cambiado a ${updated[key] ? "Marcado" : "Pendiente"}`
      );
    }
  };

  const handleSelectAudience = (aud: string) => {
    setSelectedAudience(aud);
    if (onAddAuditLog) {
      onAddAuditLog("Cambio de Audiencia", `Hub de Demostración: Selección de audiencia cambiada a ${aud}`);
    }
  };

  const handleSelectTour = (tour: "60s" | "3m" | "5m") => {
    setActiveTour(tour);
    setTourStep(0);
    if (onAddAuditLog) {
      onAddAuditLog("Selección de Tour", `Hub de Demostración: Tour guiado seleccionado (${tour})`);
    }
  };

  // Determine Launch Status dynamically
  // If "noRealDataVisible", "productionLockedVisible", or "guardrailsVisible" are unchecked, status is "Blocked"
  const isBlocked = !checklist.noRealDataVisible || !checklist.productionLockedVisible || !checklist.guardrailsVisible;
  const isNeedsReview =
    !checklist.demoModeActive ||
    !checklist.publicDemoHubReady ||
    !checklist.fieldReady ||
    !checklist.communityReady ||
    !checklist.consumerLabExplained ||
    !checklist.privacyShieldVisible ||
    !checklist.creditsVisible ||
    !checklist.publicDemoBriefReady ||
    !checklist.nextStepDefined;

  let launchStatus: string = "ready-controlled";
  if (isBlocked) {
    launchStatus = "blocked";
  } else if (isNeedsReview) {
    launchStatus = "needs-review";
  } else {
    launchStatus = "ready-controlled";
  }

  // Define 10 fronts of audit for the QA Lock Panel
  const qaFronts = [
    { name: "Hero Section", status: (!checklist.demoModeActive || !checklist.productionLockedVisible) ? "Needs Review" : "Ready" },
    { name: "Product Line Cards", status: (!checklist.fieldReady || !checklist.communityReady) ? "Needs Review" : "Ready" },
    { name: "Unified Readiness Matrix", status: !checklist.publicDemoHubReady ? "Needs Review" : "Ready" },
    { name: "Global Demo Safety Panel", status: !checklist.guardrailsVisible ? "Blocked" : "Ready" },
    { name: "Audience Quick Start", status: !checklist.nextStepDefined ? "Needs Review" : "Ready" },
    { name: "Public Demo Tour", status: (!checklist.publicDemoHubReady || !checklist.nextStepDefined) ? "Needs Review" : "Ready" },
    { name: "Launch Checklist", status: isBlocked ? "Blocked" : (isNeedsReview ? "Needs Review" : "Ready") },
    { name: "Launch Status Widget", status: isBlocked ? "Blocked" : (isNeedsReview ? "Needs Review" : "Ready") },
    { name: "Public Demo Brief", status: !checklist.publicDemoBriefReady ? "Needs Review" : "Ready" },
    { name: "Credits & Origin Panel", status: !checklist.creditsVisible ? "Needs Review" : "Ready" }
  ];

  let finalQALockStatus = "Ready for Controlled Public Demo";
  if (isBlocked) {
    finalQALockStatus = "Blocked";
  } else if (isNeedsReview) {
    finalQALockStatus = "Needs Review";
  }

  // Navigation Bridge
  const handleNavigate = (tab: string, line?: "field" | "community") => {
    if (line) {
      setCurrentLine(line);
    }
    setCurrentTab(tab);
    if (onAddAuditLog) {
      onAddAuditLog("Navegación Directa", `Accedió a pantalla ${tab} desde Sentinel Public Demo Hub.`);
    }
  };

  // Audiences Data
  const audiences = [
    { id: "demo-publica", label: "Demo Pública", icon: Users },
    { id: "video-presentacion", label: "Video Presentación", icon: Play },
    { id: "cliente-om", label: "Cliente O&M", icon: Briefcase },
    { id: "jefe-planta", label: "Jefe de Planta", icon: Cpu },
    { id: "comite-condominio", label: "Comité Condominio", icon: Home },
    { id: "administracion-residencial", label: "Admin Residencial", icon: ShieldCheck },
    { id: "conserjería-seg", label: "Conserjería", icon: UserCheck },
    { id: "proveedor-cctv", label: "Proveedor CCTV", icon: Wrench },
    { id: "inversionista-socio", label: "Inversionista / Socio", icon: Award }
  ];

  const getAudienceContent = () => {
    switch (selectedAudience) {
      case "cliente-om":
        return {
          line: "Línea Field (Parques Solares e Infraestructura)",
          demo: "Guided Field Demo (Ruta de 5 o 10 Minutos)",
          duration: "5 - 10 Minutos",
          screens: [
            { label: "Field Operations Center", tab: "fieldoperations", line: "field" as const },
            { label: "CCTV Diagnostics", tab: "diagnostics", line: "field" as const },
            { label: "Technical Evidence", tab: "evidence", line: "field" as const },
            { label: "Guided Field Demo Console", tab: "guidedfielddemo", line: "field" as const }
          ],
          avoid: "No prometer prevención absoluta de robos, detección de intrusión 100% infalible, ni compatibilidad universal inmediata con cámaras dañadas o sin contraseñas.",
          nextStep: "Proponer un piloto técnico acotado y autorizado de 1 a 3 cámaras durante 10-15 días para auditar la compatibilidad física y la viabilidad del enlace local."
        };
      case "jefe-planta":
        return {
          line: "Línea Field (Mantenimiento e Incidentes de Operación)",
          demo: "Operations Center & Diagnóstico Rápido",
          duration: "5 Minutos",
          screens: [
            { label: "Field Operations Center", tab: "fieldoperations", line: "field" as const },
            { label: "Incident Center", tab: "incidentcenter", line: "field" as const },
            { label: "Telemetry & Live Wall", tab: "livewall", line: "field" as const }
          ],
          avoid: "No prometer reemplazo de los operarios de planta, del SCADA ni de los procedimientos estándar de seguridad física o higiene y salud laboral.",
          nextStep: "Agendar levantamiento técnico conjunto de las marcas y modelos de las cámaras del perímetro solar."
        };
      case "comite-condominio":
        return {
          line: "Línea Community (Seguridad Residencial Colaborativa)",
          demo: "Guided Community Demo & Privacy Shield",
          duration: "3 - 5 Minutos",
          screens: [
            { label: "Community Value Dashboard", tab: "communitypilot", line: "community" as const },
            { label: "EasyView Conserjería", tab: "easyview", line: "community" as const },
            { label: "Privacy Compliance Shield", tab: "privacy", line: "community" as const },
            { label: "Guided Community Demo", tab: "guideddemo", line: "community" as const }
          ],
          avoid: "No prometer acceso público irrestricto de vecinos a videos de áreas privadas, reemplazo total de los conserjes o guardias, ni validez judicial automática.",
          nextStep: "Presentar propuesta para aprobación del comité e iniciar el inventario físico de las cámaras de acceso y perímetros comunes."
        };
      case "administracion-residencial":
        return {
          line: "Línea Community (Control de Incidentes y Trazabilidad)",
          demo: "EasyView & Reporte de Evidencia",
          duration: "5 Minutos",
          screens: [
            { label: "Community Value Dashboard", tab: "communitypilot", line: "community" as const },
            { label: "Incident Center", tab: "incidentcenter", line: "community" as const },
            { label: "Evidence Report Creator", tab: "evidence", line: "community" as const }
          ],
          avoid: "No prometer almacenamiento ilimitado de video de alta calidad sin considerar restricciones físicas del disco local ni prometer automatización legal.",
          nextStep: "Alinear expectativas del alcance de incidentes reportados y verificar el cumplimiento de normativas de privacidad del condominio."
        };
      case "conserjería-seg":
        return {
          line: "Línea Community / Field (Entorno Simplificado de Operación)",
          demo: "EasyView Mode & Live Wall",
          duration: "3 Minutos",
          screens: [
            { label: "EasyView Conserjería", tab: "easyview", line: "community" as const },
            { label: "Sentinel Live Wall", tab: "livewall", line: "community" as const }
          ],
          avoid: "No prometer automatización que elimine su rol. La herramienta sirve para asistirlos, reduciendo la fatiga visual de vigilar decenas de cámaras simultáneas.",
          nextStep: "Realizar una inducción rápida de 3 pasos de cómo marcar incidentes de forma sencilla usando un clic."
        };
      case "proveedor-cctv":
        return {
          line: "Infraestructura Técnica (Compatibilidad y Protocolos)",
          demo: "CCTV Diagnostics, Gateway & Access Vault",
          duration: "10 - 15 Minutos",
          screens: [
            { label: "CCTV Diagnostics", tab: "diagnostics", line: "field" as const },
            { label: "Access Vault", tab: "accessvault", line: "field" as const },
            { label: "Dahua Lab Protocol", tab: "dahualabprotocol", line: "field" as const },
            { label: "Compatibility Matrix", tab: "compatibility", line: "field" as const }
          ],
          avoid: "No prometer compatibilidad con cámaras analógicas coaxiales sin Gateway codificador ni prometer saltarse el ingreso manual de credenciales autorizadas en la bóveda.",
          nextStep: "Validar protocolos RTSP/ONVIF de las cámaras instaladas en terreno y coordinar pruebas de ping de red local."
        };
      case "inversionista-socio":
        return {
          line: "Estrategia Global (Modularidad, Trazabilidad y Escalabilidad)",
          demo: "Sentinel MVP Freeze & Public Demo Hub",
          duration: "5 Minutos",
          screens: [
            { label: "Public Demo Hub", tab: "publicdemohub", line: "field" as const },
            { label: "Sentinel MVP Freeze Center", tab: "mvpfreeze", line: "field" as const },
            { label: "Field & Community Proposal Packs", tab: "fieldproposal", line: "field" as const }
          ],
          avoid: "No presentar el software como un producto de consumo masivo sin soporte o como una solución de inteligencia artificial que no requiere hardware de borde.",
          nextStep: "Presentar el plan de despliegue progresivo, el Roadmap de desarrollo técnico y la arquitectura modular del ORBI Vision Core."
        };
      case "video-presentacion":
        return {
          line: "Multilínea (Resumen Comercial y Técnico de 60s)",
          demo: "Public Demo Hub Tour (60 Segundos)",
          duration: "1 Minuto",
          screens: [
            { label: "Public Demo Hub", tab: "publicdemohub", line: "field" as const },
            { label: "Sentinel Live Wall", tab: "livewall", line: "field" as const },
            { label: "MVP Freeze Center", tab: "mvpfreeze", line: "field" as const }
          ],
          avoid: "Evitar entrar a detalles técnicos complejos (IPs, RTSP, telemetría PoE) en los primeros 30 segundos. Enfocarse en la interfaz visual y la separación de líneas.",
          nextStep: "Mantener el cursor en zonas limpias, destacando que es un entorno simulado de alta fidelidad para resguardo del cliente."
        };
      case "demo-publica":
      default:
        return {
          line: "Presentación General (Visión Global del Ecosistema)",
          demo: "Sentinel Public Demo Hub Completo",
          duration: "3 - 5 Minutos",
          screens: [
            { label: "Public Demo Hub", tab: "publicdemohub", line: "field" as const },
            { label: "Field Operations Center", tab: "fieldoperations", line: "field" as const },
            { label: "Community Value Dashboard", tab: "communitypilot", line: "community" as const },
            { label: "Consumer Bridge Lab", tab: "consumerbridge", line: "field" as const }
          ],
          avoid: "Evitar prometer detección automática mágica. Enfatizar la validación humana obligatoria y la seguridad por diseño.",
          nextStep: "Seleccionar la línea específica según el interés del stakeholder y navegar usando los botones de acceso directo."
        };
    }
  };

  const selectedAudienceData = getAudienceContent();

  // Tours Data
  const tours = {
    "60s": [
      {
        title: "1. ¿Qué es ORBI Sentinel IA?",
        desc: "Plataforma inteligente que asiste a operadores en el control CCTV, diagnóstico físico de cámaras e incidentes. Proporciona una interfaz unificada y trazable.",
        target: "publicdemohub",
        line: "field" as const,
        note: "Presenta el Hero Section del Hub y explica el propósito de ORBI Sentinel IA."
      },
      {
        title: "2. Tres Líneas Especializadas",
        desc: "Existen tres enfoques responsables: Field para grandes plantas, Community para condominios de alta privacidad y Consumer como puente experimental doméstico.",
        target: "publicdemohub",
        line: "field" as const,
        note: "Muestra las tres tarjetas principales que dividen la navegación comercial y técnica."
      },
      {
        title: "3. Privacidad y Seguridad de Datos",
        desc: "Para resguardar a los clientes, la demo opera en modo seguro con datos simulados y trazabilidad local de auditoría. Ningún dato sensible es expuesto públicamente.",
        target: "privacy",
        line: "field" as const,
        note: "Navega a la pantalla de Privacy & Compliance para mostrar las políticas éticas y de enmascaramiento."
      },
      {
        title: "4. Demo Lista para Pilotos Reales",
        desc: "Concluye explicando que la plataforma está lista para correr pruebas controladas autorizadas con 1 a 3 cámaras físicas, garantizando un enfoque prudente.",
        target: "fieldproposal",
        line: "field" as const,
        note: "Muestra la pantalla de propuesta comercial de campo para fijar el siguiente paso práctico."
      }
    ],
    "3m": [
      {
        title: "1. El Problema de O&M en CCTV",
        desc: "Las cámaras de seguridad se caen por cortes de energía, desalineaciones de seguidores solares, o fallas de red, y los operadores no se enteran hasta que ocurre un siniestro.",
        target: "dashboard",
        line: "field" as const,
        note: "Muestra el Dashboard General de telemetría y diagnóstico para ilustrar el control preventivo."
      },
      {
        title: "2. Línea Field: Operations Center",
        desc: "El centro de control perimetral unifica el estado físico y técnico de cada cámara con mapas de calor y priorización inteligente de alertas locales.",
        target: "fieldoperations",
        line: "field" as const,
        note: "Dirígete a Field Operations Center. Explica las zonas críticas simuladas (Alhué, Alto Bella Vista, Parral)."
      },
      {
        title: "3. Línea Community: Conserjería",
        desc: "EasyView entrega una interfaz ultra-simplificada para conserjes que evita la sobrecarga cognitiva, ocultando parámetros IP pero manteniendo la captura rápida de incidentes.",
        target: "easyview",
        line: "community" as const,
        note: "Navega a EasyView. Destaca el diseño de botones grandes para el guardia de turno."
      },
      {
        title: "4. Sentinel Consumer: El Puente WiFi",
        desc: "Consumer Bridge permite integrar de manera responsable cámaras WiFi del hogar (como Eufy C220) usando estándares locales RTSP sin depender de nubes externas.",
        target: "consumerbridge",
        line: "field" as const,
        note: "Abre Consumer Bridge para ilustrar el alcance de integración inteligente doméstica."
      },
      {
        title: "5. Laboratorio de Evidencia Técnica",
        desc: "Cada vez que se marca un incidente, el sistema genera automáticamente un paquete de evidencia local sellado que certifica los detalles técnicos del video capturado.",
        target: "evidence",
        line: "field" as const,
        note: "Navega a Evidence Report y muestra la lista de clips generados con sus huellas lógicas."
      },
      {
        title: "6. Cierre con Piloto Controlado",
        desc: "Evitamos prometer automatizaciones perfectas de seguridad. Proponemos un piloto limitado de 1 a 3 cámaras para certificar compatibilidad de red local antes de contratar.",
        target: "fieldproposal",
        line: "field" as const,
        note: "Cierra la presentación mostrando la minuta de propuesta estructurada lista para enviar."
      }
    ],
    "5m": [
      {
        title: "1. Visión Holística del Ecosistema",
        desc: "ORBI Sentinel IA es la suite inteligente unificada para CCTV. A través del Public Demo Hub, el presentador puede adaptar el guión a 8 perfiles técnicos y de negocios.",
        target: "publicdemohub",
        line: "field" as const,
        note: "Muestra el selector de audiencias y el estado global de readiness en el hub."
      },
      {
        title: "2. Demostración de Campo Guiada",
        desc: "Para reuniones industriales, disponemos de una consola de presentación que asiste al expositor con notas de voz, objeciones típicas y advertencias de seguridad.",
        target: "guidedfielddemo",
        line: "field" as const,
        note: "Dirígete a Guided Field Demo para detallar el flujo metodológico paso a paso ante comités técnicos."
      },
      {
        title: "3. Demostración Residencial Guiada",
        desc: "Para administraciones de condominios, el flujo asiste en explicar el valor agregado diario de conserjería, el Privacy Shield y el cumplimiento de leyes de protección de datos.",
        target: "guideddemo",
        line: "community" as const,
        note: "Navega a Guided Community Demo para mostrar el flujo adaptado a asambleas de copropietarios."
      },
      {
        title: "4. El Laboratorio Dahua PoE real",
        desc: "El Dahua PoE Lab MVP demuestra el control en tiempo real de un switch real PoE simulado de laboratorio, leyendo latencias ONVIF, pings y reinicios de cámara remotos.",
        target: "dahualabprotocol",
        line: "field" as const,
        note: "Abre Sentinel Dahua Lab Protocol para evidenciar la profundidad técnica de la solución."
      },
      {
        title: "5. Resguardo de Privacidad por Diseño",
        desc: "El Privacy Compliance Shield enmascara rostros, restringe vistas según rol y asegura que el personal operativo no tenga accesos a flujos íntimos o no autorizados.",
        target: "privacy",
        line: "community" as const,
        note: "Explica las zonas excluidas y la lógica de encriptación local."
      },
      {
        title: "6. Matriz de Compatibilidad y Readiness",
        desc: "Nuestra matriz de compatibilidad detalla con precisión científica qué protocolos y marcas soportamos, evitando especulaciones o falsas expectativas comerciales.",
        target: "compatibility",
        line: "field" as const,
        note: "Navega a la pantalla Compatibility Matrix para exhibir el nivel de rigor del software."
      },
      {
        title: "7. Próximos Pasos Responsables",
        desc: "Fijamos un plan claro de levantamiento técnico de red, encuesta de seguridad física, y un piloto acotado de 1-3 cámaras. Es la única forma segura de avanzar en O&M industrial.",
        target: "fieldproposal",
        line: "field" as const,
        note: "Presenta el Scope Builder de la propuesta comercial para estructurar el plan de validación."
      }
    ]
  };

  const activeTourSteps = tours[activeTour];
  const currentTourStepData = activeTourSteps[tourStep] || activeTourSteps[0];

  const handleNextTourStep = () => {
    if (tourStep < activeTourSteps.length - 1) {
      setTourStep(tourStep + 1);
    }
  };

  const handlePrevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  // Unified Readiness Matrix Data
  const matrixRows = [
    { name: "Dahua PoE Lab MVP", visual: "Ready", roles: "Ready", privacy: "Lab", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Eufy Consumer Bridge", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Lab", reports: "Lab", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Community Demo", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Community Proposal", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Community Guided Demo", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Demo Locked" },
    { name: "Field Operations", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Field Proposal", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Field Guided Demo", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Demo Locked" },
    { name: "Evidence Reports", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Privacy Shield", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Role-Based Access", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" },
    { name: "Public Demo Safety", visual: "Ready", roles: "Ready", privacy: "Ready", security: "Ready", reports: "Ready", navigation: "Ready", respLang: "Ready", demoReady: "Ready" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ready":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready</span>;
      case "Lab":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Lab</span>;
      case "Demo Locked":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Locked</span>;
      case "Needs Review":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Review</span>;
      case "Production Locked":
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Prod Lock</span>;
    }
  };

  // Markdown brief of public demo to copy
  const publicBriefText = `=========================================
ORBI SENTINEL IA - PUBLIC DEMO BRIEF
=========================================
Versión: v0.4.1-sentinel-public-demo-controlled-lock
Estado Global: PUBLIC DEMO HUB CONTROLLED LOCKED
Metodología: Control modular de CCTV, Trazabilidad local y Diagnóstico perimetral.

LÍNEAS DISPONIBLES EN DEMO:
1. SENTINEL FIELD: Diseñada para O&M e infraestructuras industriales. Unifica la telemetría de red, pings y estados físicos. Cuenta con un flujo guiado de demostración y propuesta acotada de 1-3 cámaras.
2. SENTINEL COMMUNITY: Especializada para condominios y conserjerías. Enfoque de alta privacidad (Privacy Shield), visualización simplificada (EasyView) y reportes de incidentes residenciales.
3. SENTINEL CONSUMER: Conector doméstico experimental para cámaras WiFi locales (Eufy C220/E220) mediante protocolos locales RTSP, con matriz de compatibilidad rigurosa.

MEDIDAS DE SEGURIDAD OPERACIONAL Y ÉTICA (DEMO MODE):
* Uso exclusivo de datos simulados y sanitizados (sin IPs reales, coordenadas de plantas, credenciales activas, ni nombres de clientes).
* No se conecta a cámaras físicas externas sin autorización explícita.
* No sustituye el patrullaje de guardias físicos, ni sistemas SCADA, ni NVRs.
* Se descarta de forma categórica prometer prevención perfecta de robos o detección de intrusiones 100% infalible.

PROPUESTA METODOLÓGICA DE CIERRE:
Alinear siempre al cliente para iniciar mediante un piloto técnico controlado de 1 a 3 cámaras durante un periodo de 7-15 días, validando compatibilidad de red y utilidad antes de cualquier contratación formal.

CRÉDITOS OFICIALES:
* Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
* Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
* Implementación asistida y optimización: Google AI Studio.
=========================================`;

  const copyBriefToClipboard = () => {
    navigator.clipboard.writeText(publicBriefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
    if (onAddAuditLog) {
      onAddAuditLog("Copia de Documento", "Copiado al portapapeles: ORBI Sentinel IA - Public Demo Brief.");
    }
  };

  // Follow up meeting minutes
  const followUpMinuta = `Asunto: Minuta de Demostración Técnica y Siguientes Pasos - ORBI Sentinel IA (Piloto Acotado)

Estimado equipo de Operaciones y Mantenimiento,

Agradecemos sinceramente el espacio brindado para la demostración técnica de ORBI Sentinel IA (Versión ${isDemoMode ? "Simulada/Demo Mode" : "Estándar"}). De acuerdo con lo conversado, resumimos a continuación los puntos clave y acuerdos alcanzados para resguardo de ambas partes:

1. Alcance Técnico de la Demostración:
* Se exhibieron las capacidades de visualización perimetral unificada, el panel de diagnóstico de CCTV y el módulo de generación automatizada de evidencia técnica con sellado de integridad SHA-256 local.
* Se enfatizó que toda simulación se realiza con datos de laboratorio y que la herramienta actúa estrictamente como apoyo operacional y diagnóstico, sin reemplazar el rol de los guardias físicos, sistemas NVR preexistentes ni SCADA de planta.

2. Próximo Paso Definido (Piloto Técnico Acotado):
* Acordamos iniciar la validación de compatibilidad mediante un piloto acotado de 1 a 3 cámaras específicas en sus instalaciones durante un periodo controlado de 10 a 15 días.
* No se establecen compromisos comerciales permanentes ni cotizaciones definitivas hasta concluir este periodo de prueba y validar de mutuo acuerdo la viabilidad de la red local.

3. Compromisos Técnicos Previos:
* El cliente facilitará un listado simple de las marcas, modelos y protocolos (RTSP/ONVIF) de las cámaras a integrar en el piloto.
* No se solicitarán contraseñas de producción ni accesos críticos de red. Toda configuración se realizará localmente bajo su supervisión técnica y autorización formal.

Agradecemos su confianza y profesionalismo en esta etapa de evaluación tecnológica.

Atentamente,

ORBI Ecosystem / Equipo Técnico de Despliegue
Asistido por ORBI Sentinel IA`;

  const copyMinutaToClipboard = () => {
    navigator.clipboard.writeText(followUpMinuta);
    setCopiedMinuta(true);
    setTimeout(() => setCopiedMinuta(false), 2000);
    if (onAddAuditLog) {
      onAddAuditLog("Copia de Documento", "Copiado al portapapeles: Minuta de Seguimiento O&M Post-Demo.");
    }
  };

  // If the user role is "conserje", show a simplified dashboard
  if (userRole === "conserje") {
    return (
      <div id="public-demo-hub-conserje" className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-white">ORBI Sentinel IA — Public Demo Hub</h2>
            <p className="text-sm text-slate-400">Acceso simplificado de seguridad para Conserjería</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Info className="w-4 h-4" />
            Control de Acceso de Guardia Activo
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Como usuario con rol de **Conserje / Guardia**, tu interfaz de operaciones diaria está optimizada en el panel **EasyView**. El Public Demo Hub está reservado principalmente para administradores del sistema y técnicos de terreno para realizar presentaciones comerciales o auditorías de red.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-950/40 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Línea Community Residencial</h3>
            </div>
            <p className="text-xs text-slate-400">
              Accede a la interfaz simplificada para conserjes de condominios, visualización rápida de cámaras y gestión de incidentes comunes.
            </p>
            <button
              id="btn-goto-easyview-community"
              onClick={() => handleNavigate("easyview", "community")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
            >
              Ir a EasyView Community
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-slate-950/40 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Línea Field Industrial</h3>
            </div>
            <p className="text-xs text-slate-400">
              Accede al centro de operaciones simplificado para instalaciones industriales y parques solares en terreno.
            </p>
            <button
              id="btn-goto-easyview-field"
              onClick={() => handleNavigate("easyview", "field")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
            >
              Ir a EasyView Field
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>Versión: v0.6.0-sentinel-pilot-intake-readiness-center</span>
          <div className="flex gap-2">
            <button
              id="btn-switch-to-admin-from-conserje"
              onClick={() => {
                setUserRole("admin");
                if (onAddAuditLog) onAddAuditLog("Cambio de Rol", "Cambió rol de Conserje a Administrador.");
              }}
              className="text-emerald-400 hover:underline"
            >
              Cambiar a Admin
            </button>
            <span>|</span>
            <button
              id="btn-switch-to-tecnico-from-conserje"
              onClick={() => {
                setUserRole("tecnico");
                if (onAddAuditLog) onAddAuditLog("Cambio de Rol", "Cambió rol de Conserje a Técnico.");
              }}
              className="text-emerald-400 hover:underline"
            >
              Cambiar a Técnico
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="sentinel-public-demo-hub" className="space-y-6">
      {/* 2. Hero Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/20">
                Módulo 6A
              </span>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                v0.6.0-sentinel-pilot-intake-readiness-center
              </span>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 rounded-md border border-purple-500/20 animate-pulse">
                PILOT INTAKE & READY CENTER
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-sans font-bold text-white tracking-tight">
              ORBI Sentinel <span className="text-emerald-400">IA</span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Plataforma inteligente de control CCTV, diagnóstico operacional, incidentes y evidencia técnica para entornos Field, Community y Consumer.
            </p>
            <p className="text-sm font-sans italic text-emerald-400/90 font-medium">
              “Simple por fuera. Potente por dentro. Responsable según el entorno donde opera.”
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800 max-w-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              ESTADO DEL HUB DE LANZAMIENTO
            </span>
            {launchStatus === "ready-controlled" && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Ready for Controlled Public Demo
              </div>
            )}
            {launchStatus === "ready-private" && (
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-mono uppercase bg-blue-500/10 p-2 rounded border border-blue-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Ready for Stakeholder Demo
              </div>
            )}
            {launchStatus === "needs-review" && (
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                Needs Audit Review
              </div>
            )}
            {launchStatus === "blocked" && (
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase bg-rose-500/10 p-2 rounded border border-rose-500/20">
                <Lock className="w-4 h-4 animate-bounce" />
                LAUNCH BLOCKED
              </div>
            )}
            <p className="text-[10px] text-slate-400 leading-normal">
              {launchStatus === "blocked" 
                ? "Crítico: Falta marcar puntos mandatorios en el Launch Checklist (Sin datos reales, Guardrails visibles, etc.)"
                : launchStatus === "needs-review"
                ? "Advertencia: Algunos frentes de demostración opcionales se encuentran pendientes de revisión."
                : "Aprobado: El flujo completo de demostración se encuentra auditado y listo para demostración pública controlada con datos sanitizados."}
            </p>
            <button
              onClick={() => setCurrentTab("mediakit")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-100 bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/20 rounded hover:border-emerald-500/45 transition-all duration-150"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>PREPARAR CONTENIDO PÚBLICO</span>
            </button>
            <button
              onClick={() => setCurrentTab("pilotintake")}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded hover:border-emerald-500/40 transition-all duration-150"
              id="btn-goto-pilot-intake-from-hub"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>🚀 PREPARAR PILOT INTAKE</span>
            </button>
            <button
              onClick={() => setCurrentTab("pilothandoff")}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 rounded hover:border-sky-450/40 transition-all duration-150"
              id="btn-goto-pilot-handoff-from-hub"
            >
              <FileText className="w-3 h-3 text-sky-400" />
              <span>📦 PREPARAR HANDOFF PACK</span>
            </button>
            <button
              onClick={() => setCurrentTab("stakeholderbinder")}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded hover:border-amber-450/40 transition-all duration-150"
              id="btn-goto-stakeholder-binder-from-hub"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>📖 ABRIR STAKEHOLDER BINDER</span>
            </button>
            <button
              onClick={() => setCurrentTab("demodeckexport")}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 rounded hover:border-teal-450/40 transition-all duration-150"
              id="btn-goto-demodeckexport-from-hub"
            >
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>📊 ABRIR DEMO DECK EXPORT</span>
            </button>
            <button
              onClick={() => setCurrentTab("publicshowcase")}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold text-pink-400 bg-pink-500/10 hover:bg-pink-500/15 border border-pink-500/20 rounded hover:border-pink-450/40 transition-all duration-150"
              id="btn-goto-publicshowcase-from-hub"
            >
              <Award className="w-3 h-3 text-pink-400" />
              <span>🏆 ABRIR PUBLIC SHOWCASE</span>
            </button>
          </div>
        </div>

        {/* 2. Badges Row */}
        <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-slate-800/80">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Demo Mode Active
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ● Production Locked
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ● No Real Data
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
            ● Privacy by Design
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
            ● Field Ready
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
            ● Community Ready
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ● Consumer Lab
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            ● Evidence Lab Ready
          </span>
        </div>

        <div className="mt-4 p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/10 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-300">
            <strong>Garantía de Seguridad:</strong> Esta demo utiliza datos ficticios/sanitizados y no se conecta a cámaras reales sin autorización explícita.
          </p>
        </div>
      </div>

      {/* 2B. Public Demo Hub QA Lock Panel */}
      <div id="qa-lock-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Public Demo Hub QA Lock</h3>
              <p className="text-xs text-slate-400">Verificación y bloqueo inteligente de la experiencia del demostrador de ORBI Sentinel IA.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Estado Global QA:</span>
            {isBlocked ? (
              <span className="px-3 py-1 text-xs font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-md">
                Blocked
              </span>
            ) : isNeedsReview ? (
              <span className="px-3 py-1 text-xs font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-md">
                Needs Review
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-md animate-pulse">
                Ready for Controlled Public Demo
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {qaFronts.map((front) => {
            const isReady = front.status === "Ready";
            const isBlockedFront = front.status === "Blocked";
            return (
              <div 
                key={front.name} 
                className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                  isBlockedFront 
                    ? "bg-rose-950/10 border-rose-900/30 text-rose-300"
                    : isReady
                    ? "bg-slate-950/40 border-slate-800 text-slate-200"
                    : "bg-amber-950/5 border-amber-900/20 text-amber-300"
                }`}
              >
                <span className="text-[11px] font-medium leading-tight">{front.name}</span>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isBlockedFront ? "bg-rose-500" : isReady ? "bg-emerald-400" : "bg-amber-400"
                  }`} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                    {front.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Product Line Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SENTINEL FIELD CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Server className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">LÍNEA OPERATIVA</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                FIELD GUIDED DEMO LOCKED
              </span>
            </div>

            <h3 className="text-lg font-sans font-bold text-white">Sentinel Field</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diseñado para O&M de parques solares, subestaciones eléctricas e infraestructuras críticas perimetrales con diagnóstico profundo de switches PoE y ONVIF.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Frentes de Demostración:</div>
              <div className="flex flex-wrap gap-1">
                {["Operations Center", "Zonas Críticas", "Incident Workflow", "Technical Diagnostics", "Evidence Report", "Guided Field Demo", "Proposal Pack"].map((item) => (
                  <span key={item} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              id="btn-open-field-ops"
              onClick={() => handleNavigate("fieldoperations", "field")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-white border border-slate-800 transition-all"
            >
              <span>Abrir Field Operations</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              id="btn-open-guided-field-demo"
              onClick={() => handleNavigate("guidedfielddemo", "field")}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold text-slate-950 transition-all"
            >
              <span>Abrir Guided Field Demo</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-open-field-proposal"
              onClick={() => handleNavigate("fieldproposal", "field")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400 border border-slate-800 transition-all"
            >
              <span>Abrir Field Proposal Pack</span>
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SENTINEL COMMUNITY CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">LÍNEA RESIDENCIAL</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase">
                COMMUNITY GUIDED DEMO LOCKED
              </span>
            </div>

            <h3 className="text-lg font-sans font-bold text-white">Sentinel Community</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solución inteligente para condominios residenciales, enfocada en simplificar el rol de conserjería, respetando estrictas normativas éticas de privacidad.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Frentes de Demostración:</div>
              <div className="flex flex-wrap gap-1">
                {["EasyView Mode", "Value Dashboard", "Privacy Shield", "Incident Workflow", "Guided Community Demo", "Proposal Pack"].map((item) => (
                  <span key={item} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              id="btn-open-community-demo"
              onClick={() => handleNavigate("communitypilot", "community")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-white border border-slate-800 transition-all"
            >
              <span>Abrir Community Pilot</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              id="btn-open-guided-community-demo"
              onClick={() => handleNavigate("guideddemo", "community")}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold text-slate-950 transition-all"
            >
              <span>Abrir Guided Community Demo</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-open-community-proposal"
              onClick={() => handleNavigate("communityproposal", "community")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400 border border-slate-800 transition-all"
            >
              <span>Abrir Community Proposal</span>
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SENTINEL CONSUMER CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Cpu className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">LÍNEA DOMÉSTICA</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                CONSUMER BRIDGE LAB
              </span>
            </div>

            <h3 className="text-lg font-sans font-bold text-white">Sentinel Consumer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Módulo puente para integrar cámaras WiFi domésticas (como Eufy C220/E220) respetando la privacidad del hogar sin depender de flujos en la nube comercial.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Frentes de Demostración:</div>
              <div className="flex flex-wrap gap-1">
                {["Consumer Bridge Lab", "RTSP/NAS Readiness", "Domestic Privacy Lab", "Compatibility Matrix"].map((item) => (
                  <span key={item} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              id="btn-open-consumer-bridge"
              onClick={() => handleNavigate("consumerbridge")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-white border border-slate-800 transition-all"
            >
              <span>Abrir Consumer Bridge</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              id="btn-open-compat-matrix"
              onClick={() => handleNavigate("compatibility")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-white border border-slate-800 transition-all"
            >
              <span>Abrir Compatibility Matrix</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-open-privacy-shield"
              onClick={() => handleNavigate("privacy")}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400 border border-slate-800 transition-all"
            >
              <span>Abrir Privacy & Compliance</span>
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Unified Readiness Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-bold text-white">Matriz Unificada de Readiness y Calidad de Demo</h3>
            <p className="text-xs text-slate-400">
              Evaluación interactiva y rigurosa de cada frente tecnológico, asegurando que la demo cumple con los requisitos de simulación y restricciones de producción.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 inline-block"></span> Ready</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/50 inline-block"></span> Lab</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-500/50 inline-block"></span> Demo Locked</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/50 inline-block"></span> Prod Locked</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="p-3">Componente / Frente</th>
                <th className="p-3 text-center">Visual</th>
                <th className="p-3 text-center">Roles</th>
                <th className="p-3 text-center">Privacy</th>
                <th className="p-3 text-center">Security</th>
                <th className="p-3 text-center">Reports</th>
                <th className="p-3 text-center">Navigation</th>
                <th className="p-3 text-center">Resp. Lang</th>
                <th className="p-3 text-center">Demo Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {matrixRows.map((row) => (
                <tr key={row.name} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 font-medium text-slate-200">{row.name}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.visual)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.roles)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.privacy)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.security)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.reports)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.navigation)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.respLang)}</td>
                  <td className="p-3 text-center">{getStatusBadge(row.demoReady)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Global Demo Mode Safety Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-sans font-bold text-white">¿Qué NO se debe prometer jamás? (Guardrails Éticos)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Nuestros compromisos de responsabilidad comercial exigen delimitar explícitamente el alcance de la inteligencia artificial:
          </p>
          <ul className="space-y-2 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Detección perfecta de intrusiones:</strong> Ninguna analítica está libre de falsos positivos o negativos debido a condiciones climáticas extremas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Prevención absoluta de robos:</strong> El sistema actúa como diagnóstico y alerta preventiva, no detiene físicamente acciones delictivas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Reemplazo de personal humano:</strong> No reemplaza la necesidad de vigilantes físicos, supervisores de planta ni equipos de HSE en terreno.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Sustitución de SCADA o NVR de planta:</strong> El software lee diagnósticos de manera pasiva y genera valor adicional, no suplanta la base industrial.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Validez judicial de informes:</strong> La evidencia técnica de laboratorio es para uso operacional interno, no constituye prueba pericial certificada.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Compatibilidad universal inmediata:</strong> Depende críticamente del estado físico del hardware de red, puertos de switch y claves del cliente.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-sans font-bold text-white">¿Qué SÍ demuestra la plataforma?</h3>
          </div>
          <p className="text-xs text-slate-400">
            ORBI Sentinel IA es una suite potente y honesta que entrega valor tangible inmediato en:
          </p>
          <ul className="space-y-2 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Navegación unificada multisitio:</strong> Control consolidado de múltiples plantas o condominios con filtros lógicos por línea de negocio.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Diagnóstico pasivo de CCTV:</strong> Identificación proactiva de cámaras intermitentes, fallas de stream, o pérdidas de tensión PoE de forma local.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Asistencia operacional por roles:</strong> Interfaces adaptadas según las necesidades del Administrador, Técnico o Conserje.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Paquetes de Evidencia Técnica:</strong> Resguardo inmediato de fragmentos de video asociados a incidentes con firmas lógicas SHA-256.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Políticas de Privacidad por Diseño:</strong> Máscaras dinámicas y exclusión de zonas residenciales íntimas para garantizar cumplimiento ético.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Metodología de Piloto Acotado:</strong> Enfoque seguro de 1 a 3 cámaras físicas para eliminar la especulación tecnológica.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 6. Audience Quick Start */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-sans font-bold text-white">Selector de Audiencia para Presentaciones Controladas (Audience Selector)</h3>
          <p className="text-xs text-slate-400">
            Haz clic en tu tipo de audiencia para adaptar de forma automática los enfoques narrativos, duraciones estimadas, pantallas a mostrar y objeciones críticas.
          </p>
        </div>

        {/* Audience Grid Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {audiences.map((aud) => {
            const AudIcon = aud.icon;
            const isSel = selectedAudience === aud.id;
            return (
              <button
                id={`btn-aud-${aud.id}`}
                key={aud.id}
                onClick={() => handleSelectAudience(aud.id)}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSel
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <AudIcon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] tracking-tight leading-tight block truncate w-full">{aud.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Audience Result Panel */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase text-slate-400">Enfoque de Audiencia Recomendado:</span>
              <span className="text-xs text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {audiences.find((a) => a.id === selectedAudience)?.label || "Público"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>Duración Estimada:</span>
              <span className="text-emerald-400 font-bold">{selectedAudienceData.duration}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">LÍNEA OPERACIONAL RECOMENDADA:</span>
                <span className="text-slate-200 font-medium">{selectedAudienceData.line}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">DEMO CONSEJERA SUGERIDA:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedAudienceData.demo}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-rose-500 block">✕ EVITAR PROMETER / GUARDRAIL DE SEGURIDAD:</span>
                <p className="text-slate-300 leading-relaxed bg-rose-500/5 p-2 rounded border border-rose-500/10">
                  {selectedAudienceData.avoid}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5">PANTALLAS CLAVE PARA ACCESO DIRECTO:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAudienceData.screens.map((scr) => (
                    <button
                      id={`btn-goto-${scr.tab}`}
                      key={scr.tab}
                      onClick={() => handleNavigate(scr.tab, scr.line)}
                      className="inline-flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left text-slate-200 hover:text-white transition-all w-full"
                    >
                      <span className="truncate pr-1 font-mono text-[10px]">{scr.label}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">✓ PRÓXIMO PASO SUGERIDO (ACORDAR EN REUNIÓN):</span>
                <p className="text-slate-300 leading-relaxed bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10">
                  {selectedAudienceData.nextStep}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Public Demo Tour */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-bold text-white">Guiones Interactivos de Presentación (Public Demo Tour)</h3>
            <p className="text-xs text-slate-400">
              Usa estos guiones secuenciales paso a paso para realizar presentaciones impecables con tiempos estrictamente controlados.
            </p>
          </div>

          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 gap-1 shrink-0">
            <button
              id="btn-tour-60s"
              onClick={() => handleSelectTour("60s")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                activeTour === "60s" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱ 60s pitch
            </button>
            <button
              id="btn-tour-3m"
              onClick={() => handleSelectTour("3m")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                activeTour === "3m" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱ 3 min tour
            </button>
            <button
              id="btn-tour-5m"
              onClick={() => handleSelectTour("5m")}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                activeTour === "5m" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱ 5 min deep
            </button>
          </div>
        </div>

        {/* Interactive Tour Card */}
        <div className="p-5 bg-slate-950 rounded-lg border border-slate-800 space-y-4 relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
              Paso {tourStep + 1} de {activeTourSteps.length}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Guión Guiado Activo</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-bold text-white">{currentTourStepData.title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentTourStepData.desc}
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs text-slate-400 italic flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>Indicación para el Presentador:</strong> {currentTourStepData.note}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              id={`btn-tour-nav-to-${currentTourStepData.target}`}
              onClick={() => handleNavigate(currentTourStepData.target, currentTourStepData.line)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4" />
              Ir a Pantalla: {currentTourStepData.target.toUpperCase()}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-tour-prev"
                disabled={tourStep === 0}
                onClick={handlePrevTourStep}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-300"
              >
                Anterior
              </button>
              <button
                id="btn-tour-next"
                disabled={tourStep === activeTourSteps.length - 1}
                onClick={handleNextTourStep}
                className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Credits & Origin Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 md:col-span-2 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-sans font-bold text-white">Créditos de Creación & Diseño de Universo</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ORBI Sentinel IA es una simulación de software interactiva de alta fidelidad, enmarcada dentro del Ecosistema Tecnológico de ORBI. Diseñada bajo la metodología de validación progresiva y enfoque responsable de demostración.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Concepto y Universo:</span>
                <span className="text-slate-200 font-bold block">Víctor M. León</span>
                <span className="text-[10px] text-emerald-400 font-mono">ORBI Ecosystem</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Co-diseño y QA:</span>
                <span className="text-slate-200 font-bold block">ChatGPT</span>
                <span className="text-[10px] text-emerald-400 font-mono">OpenAI LLM Engine</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Implementación y Opt:</span>
                <span className="text-slate-200 font-bold block">Google AI Studio</span>
                <span className="text-[10px] text-emerald-400 font-mono">Build Workspace Agent</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 leading-normal space-y-1">
            <p><strong>Créditos Oficiales:</strong></p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
              <li><strong>Concepto, dirección creativa y universo:</strong> Víctor M. León / ORBI Ecosystem.</li>
              <li><strong>Co-diseño, arquitectura, prompts y QA:</strong> ChatGPT / OpenAI.</li>
              <li><strong>Implementación asistida y optimización:</strong> Google AI Studio.</li>
            </ul>
            <p className="mt-2 text-[10px] font-sans italic text-emerald-400">
              “ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.”
            </p>
          </div>
        </div>

        {/* Launch Status Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block">LAUNCH STATUS WIDGET</span>
            
            {launchStatus === "ready-controlled" && (
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready for Controlled Public Demo
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El sistema ha pasado satisfactoriamente los 12 puntos clave de la auditoría. Los guardrails de no prometer infalibilidad están activos, no hay exposición de datos de clientes reales y el lenguaje responsable ha sido bloqueado en el motor de render.
                </p>
              </div>
            )}

            {launchStatus === "needs-review" && (
              <div className="space-y-2">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  Needs Review
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Falta completar algunos puntos secundarios en el Launch Checklist. La presentación puede realizarse frente a stakeholders cercanos, pero se recomienda completar el checklist antes de una demostración masiva.
                </p>
              </div>
            )}

            {launchStatus === "blocked" && (
              <div className="space-y-2">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  <Lock className="w-4 h-4 animate-bounce" />
                  LAUNCH BLOCKED
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold text-rose-300">
                  CRÍTICO: No se puede proceder con presentaciones externas debido a frentes mandatorios de seguridad que no han sido debidamente marcados en la lista de chequeo de la consola.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">
              Integridad: SHA-256 Validated
            </div>
          </div>
        </div>
      </div>

      {/* 9. Public Demo Brief & 10. Launch Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Checklist Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ClipboardList className="w-5 h-5" />
            <h3 className="text-base font-sans font-bold text-white">Consola de Auditoría Pre-Presentación (Launch Checklist)</h3>
          </div>
          <p className="text-xs text-slate-400">
            Completa estos puntos de control antes de encender un proyector o compartir pantalla en Teams/Zoom. Tres de ellos son <strong>mandatarios (M)</strong> para evitar el bloqueo del estado de la demo.
          </p>

          <div className="space-y-2">
            {[
              { key: "demoModeActive" as const, label: "Modo Demo de Simulación Activo", type: "Recomendado" },
              { key: "productionLockedVisible" as const, label: "Aviso 'Production Locked' Visado en Pantalla", type: "MANDATORIO" },
              { key: "noRealDataVisible" as const, label: "Garantía de Cero Datos de Clientes en Pantalla", type: "MANDATORIO" },
              { key: "publicDemoHubReady" as const, label: "Sentinel Public Demo Hub Totalmente Cargado", type: "Recomendado" },
              { key: "fieldReady" as const, label: "Módulo Field Operaciones Listo", type: "Recomendado" },
              { key: "communityReady" as const, label: "Módulo Community Conserjería Listo", type: "Recomendado" },
              { key: "consumerLabExplained" as const, label: "Explicación del Eufy Consumer Bridge Preparada", type: "Recomendado" },
              { key: "privacyShieldVisible" as const, label: "Políticas del Privacy Shield Validadas", type: "Recomendado" },
              { key: "guardrailsVisible" as const, label: "Panel de Guardrails y Limitaciones Visible en Reunión", type: "MANDATORIO" },
              { key: "creditsVisible" as const, label: "Panel de Créditos Oficiales Listado", type: "Recomendado" },
              { key: "publicDemoBriefReady" as const, label: "Public Demo Brief de Correo Copiado e Impreso", type: "Recomendado" },
              { key: "nextStepDefined" as const, label: "Próximo Paso de Piloto Acotado en Terreno Definido", type: "Recomendado" }
            ].map((item) => {
              const checked = checklist[item.key];
              const isMandatory = item.type === "MANDATORIO";
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleChecklist(item.key)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    checked
                      ? "bg-slate-950/60 border-slate-800 text-slate-200"
                      : isMandatory
                      ? "bg-rose-950/10 border-rose-900/30 text-rose-300"
                      : "bg-slate-950/30 border-slate-900 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                      checked
                        ? "bg-emerald-500 border-emerald-600 text-slate-950"
                        : "border-slate-700"
                    }`}>
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    isMandatory
                      ? checked
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {item.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Demo Brief Document Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-sans font-bold text-white">ORBI Sentinel IA — Public Demo Brief</h3>
              </div>
              <button
                id="btn-copy-brief"
                onClick={copyBriefToClipboard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded transition-all"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBrief ? "Copiado!" : "Copiar Brief"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copia este resumen comercial y de seguridad homologado para compartir con stakeholders, socios o enviar como documento adjunto antes de un pitch.
            </p>

            <textarea
              id="txt-public-brief"
              readOnly
              value={publicBriefText}
              className="w-full h-44 p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 focus:outline-none focus:border-slate-700 scrollbar-thin"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <ClipboardList className="w-5 h-5" />
                <h3 className="text-base font-sans font-bold text-white">Minuta de Seguimiento O&M (Post-Demo)</h3>
              </div>
              <button
                id="btn-copy-minuta"
                onClick={copyMinutaToClipboard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded transition-all"
              >
                {copiedMinuta ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMinuta ? "Copiado!" : "Copiar Minuta"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Minuta de correo perfectamente estructurada para enviar después de una reunión con gerentes O&M. Delimita el piloto acotado de 1-3 cámaras y resguarda la responsabilidad técnica.
            </p>

            <textarea
              id="txt-followup-minuta"
              readOnly
              value={followUpMinuta}
              className="w-full h-40 p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 focus:outline-none focus:border-slate-700 scrollbar-thin"
            />
          </div>
        </div>
      </div>

      {/* Close Script of Field Demo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Info className="w-5 h-5" />
          <h3 className="text-base font-sans font-bold text-white">Guión de Cierre de Campo (Close Script) — Protección de Expectativas</h3>
        </div>
        <p className="text-xs text-slate-400">
          Usa este discurso oficial durante los últimos 30 segundos de tu demostración para establecer expectativas claras, profesionales y respetuosas de la ingeniería de borde real:
        </p>

        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed relative">
          <span className="absolute top-2 right-2 text-[10px] font-mono font-bold uppercase text-slate-600">Discurso de Cierre Autorizado</span>
          <p className="font-sans italic">
            “Lo que proponemos no es reemplazar la operación existente, sino ejecutar un piloto acotado y autorizado con 1 a 3 cámaras para validar compatibilidad, utilidad operacional, diagnóstico CCTV y calidad de reportes. Con ese resultado, el cliente puede decidir responsablemente si conviene avanzar a una etapa mayor.”
          </p>
        </div>
      </div>
    </div>
  );
}
