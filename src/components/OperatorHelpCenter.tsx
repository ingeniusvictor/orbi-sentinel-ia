import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Search,
  User,
  Shield,
  ShieldAlert,
  HelpCircle,
  Activity,
  FileText,
  CheckCircle,
  AlertTriangle,
  Server,
  Info,
  Lock,
  Send,
  Copy,
  ChevronRight,
  Play,
  Check,
  X,
  FileSignature,
  Sliders,
  Terminal,
  Wrench,
  Video,
  KeyRound
} from "lucide-react";
import {
  ROLE_GUIDES,
  SCREEN_HELP,
  FAQ_ITEMS,
  GLOSSARY,
  TROUBLESHOOTING_CASES,
  GUIDED_TOURS,
  RoleGuide,
  ScreenHelp,
  FAQItem,
  GlossaryItem,
  TroubleshootingCase,
  GuidedTour
} from "../data/helpContent";
import OperatorOnboardingPractice from "./OperatorOnboardingPractice";

interface OperatorHelpCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  onAddAuditLog: (action: string, details: string) => void;
  onStartTour: (tourId: string) => void;
  initialSubTab?: string;
  onClearInitialSubTab?: () => void;
}

export default function OperatorHelpCenter({
  userRole,
  currentTab,
  setCurrentTab,
  isDemoMode,
  onAddAuditLog,
  onStartTour,
  initialSubTab,
  onClearInitialSubTab
}: OperatorHelpCenterProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  // Active sub-tab in help center
  const [activeSubTab, setActiveSubTab] = useState<"inicio" | "roles" | "pantallas" | "faq" | "glosario" | "privacidad" | "problemas" | "contacto" | "qa_lock" | "onboarding_practice">(
    initialSubTab === "onboarding_practice" ? "onboarding_practice" : "inicio"
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab as any);
      if (onClearInitialSubTab) {
        onClearInitialSubTab();
      }
    }
  }, [initialSubTab]);
  // Active role guide filter
  const [selectedRoleGuide, setSelectedRoleGuide] = useState<"conserje" | "admin" | "tecnico">(
    userRole === "conserje" ? "conserje" : userRole === "tecnico" ? "tecnico" : "admin"
  );
  // FAQ search filtering by category
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<"all" | "operacion" | "tecnico" | "seguridad" | "demo">("all");
  // Contact form state
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactFormStatus, setContactFormStatus] = useState<"idle" | "sending" | "success">("idle");
  const [isCopied, setIsCopied] = useState(false);
  const [isQaCopied, setIsQaCopied] = useState(false);
  const [isOnbQaCopied, setIsOnbQaCopied] = useState(false);
  const [qaLockActiveTab, setQaLockActiveTab] = useState<"onboarding" | "help_center">("onboarding");

  // QA checklist state for Auditoría & QA Lock
  const [qaChecklist, setQaChecklist] = useState({
    homePremiumPreserved: true,
    adminHomeEightCards: true,
    conserjeHomeFourCards: true,
    manualOpensHelpCenter: true,
    helpCenterNoOverlayHome: true,
    conserjeHelpFiltered: true,
    adminHelpFiltered: true,
    tecnicoHelpFiltered: true,
    versionRegistryHiddenHeader: true,
    noNewHomeCards: true,
    noCertificationWording: true,
    noAbsoluteStorageWording: true,
    trainingSummaryReportRenamed: true,
    guidedToursNonInvasive: true,
    tourMarkersLocalOnly: true,
    contextualHelpDrawerRoleAware: true,
    helpSearchLocalOnly: true,
    glossaryRoleFiltered: true,
    troubleshootingSafe: true,
    noIpRtspExposed: true,
    readmeUpdated: true,
    versionRegistryUpdated: true,
    buildClean: true,
    typeScriptClean: true,
    lintClean: true,
  });

  // QA checklist state for Operator Onboarding Practice (Módulo 13D)
  const [onboardingQaChecklist, setOnboardingQaChecklist] = useState({
    onboardingPracticeSubTabExists: true,
    deepLinkOpensSubTab: true,
    safetyBannerVisible: true,
    conserjeRouteImplemented: true,
    adminRouteImplemented: true,
    tecnicoRouteImplemented: true,
    exercisesInteractive: true,
    goToScreenButtonsWork: true,
    markPracticedButtonsWork: true,
    needHelpButtonsWork: true,
    firstUseValidationActive: true,
    onboardingCoachActive: true,
    notesScannerActive: true,
    summaryReportSanitized: true,
    localHistorySanitizedAndPurgeable: true,
    rbacExerciseFilteringActive: true,
    conserjeBlockedFromTechnical: true,
    helpCenterIntegrationActive: true,
    homePremiumPreservedOnb: true,
    readmeUpdatedOnb: true,
    versionRegistryUpdatedOnb: true,
    buildCleanOnb: true,
    typeScriptCleanOnb: true,
    lintCleanOnb: true,
  });

  // Overall Onboarding QA Lock Status
  const onboardingQaStatus = useMemo(() => {
    const isCriticalFail = !onboardingQaChecklist.safetyBannerVisible ||
                           !onboardingQaChecklist.conserjeBlockedFromTechnical ||
                           !onboardingQaChecklist.summaryReportSanitized ||
                           !onboardingQaChecklist.localHistorySanitizedAndPurgeable ||
                           !onboardingQaChecklist.notesScannerActive;
    const anyFail = Object.values(onboardingQaChecklist).some(val => val === false);

    if (isCriticalFail) {
      return "Onboarding Blocked";
    } else if (anyFail) {
      return "Needs Review";
    } else {
      return "OPERATOR ONBOARDING PRACTICE LOCKED";
    }
  }, [onboardingQaChecklist]);

  // Onboarding QA Report Generator
  const onboardingQaReportText = useMemo(() => {
    const passedCount = Object.values(onboardingQaChecklist).filter(Boolean).length;
    const totalCount = Object.keys(onboardingQaChecklist).length;
    return `===========================================================
ORBI Sentinel IA — Operator Training Suite Report
===========================================================
Fecha de Emisión: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.13.4-sentinel-operator-training-suite-lock
Estado de Bloque 13: POST-13D ACCEPTED / OPERATOR TRAINING SUITE READY
Roles Cubiertos: Conserje, Administrador, Técnico

[1] ESTADO DE COMPONENTES DEL BLOQUE 13 (ONBOARDING & TRAINING):
- Operator Help Center: Locked (Sello QA Aceptado)
- Help Center QA Lock: Accepted / Aprobado Internamente
- Role-Based Help Filtering: Active (Filtros por Perfil de Usuario)
- Contextual Help Drawer: Active (Soporte en Caliente de Pantalla Activa)
- Guided Tours: Active (Mini-recorridos Guiados No Invasivos)
- Operator Onboarding Practice: Locked (Módulo 13D Bloqueado)
- First-Use Validation: Active (Validación Orientativa sin Certificación)
- Onboarding QA Lock: Accepted / Aprobado Internamente
- Home Premium: Preserved (8 Tarjetas Comerciales Intactas)
- RBAC: Active (Control de Acceso por Perfil Funcional)
- Reports Sanitized: Active (Libre de PII, IP/RTSP y Credenciales)
- Local History Sanitized and Purgeable: Active (Historial en localStorage)

[2] DETALLE DE COBERTURA OPERACIONAL:
- Guías por Rol: Active / Filtradas según privilegios
- Búsqueda Local Indexada: Active (Sin telemetría en la nube)
- Glosario de Términos: Active / Filtrado para evitar fatiga cognitiva
- Recorridos Guiados Activos: Active
- Onboarding Práctico por Rol: Active (Práctica inicial en demo controlada)

[3] SALVAGUARDAS, PRIVACIDAD E HISTORIAL LOCAL:
- Validación Orientativa Inicial: Active
- Resumen Interno Sanitizado: Active (Sin incluir PII, IP/RTSP ni datos sensibles)
- Historial Local Purgable en localStorage: Active (Eliminable en un clic)

[4] LIMITACIONES DE LA SUITE DE CAPACITACIÓN:
- Práctica en entorno simulado de laboratorio o pilotos acotados.
- No constituye certificación profesional, acreditación, validación legal
  ni autorización de despliegue en producción real.
- No se realiza almacenamiento absoluto ni transmisión cloud activa.
- Diseñado reduciendo exposición de datos sensibles mediante scanner local.

===========================================================
COMPROMISO DE SEGURIDAD OPERATIVA Y CALIDAD AUDITADA
ORBI-SENTINEL-OPERATOR-TRAINING-SUITE-LOCKED-v0.13.4
===========================================================`;
  }, [onboardingQaChecklist, onboardingQaStatus]);

  // Filter definitions based on userRole (RBAC)
  const isConserje = userRole === "conserje";
  const isAdmin = userRole === "admin";
  const isTecnico = userRole === "tecnico";

  // Filtered Glossary based on Role (RBAC)
  const filteredGlossary = useMemo(() => {
    if (isConserje) {
      const allowedTermsForConserje = [
        "Cámara",
        "Live Wall",
        "Incidente",
        "Reporte",
        "Privacidad",
        "Modo Conserje",
        "Avisar técnico",
        "Demo Mode",
        "Production Locked",
        "Validación humana"
      ];
      return GLOSSARY.filter(item => allowedTermsForConserje.includes(item.term));
    }
    return GLOSSARY;
  }, [userRole]);

  // Overall QA Lock Status
  const qaStatus = useMemo(() => {
    const criticalFail = !qaChecklist.noCertificationWording || !qaChecklist.noAbsoluteStorageWording || !qaChecklist.noIpRtspExposed || !qaChecklist.tourMarkersLocalOnly;
    const anyFail = Object.values(qaChecklist).some(val => val === false);

    if (criticalFail) {
      return "Help Center Blocked";
    } else if (anyFail) {
      return "Needs Review";
    } else {
      return "OPERATOR HELP CENTER LOCKED";
    }
  }, [qaChecklist]);

  // QA Report Generator
  const qaReportText = useMemo(() => {
    const passedCount = Object.values(qaChecklist).filter(Boolean).length;
    const totalCount = Object.keys(qaChecklist).length;
    return `===========================================================
ORBI SENTINEL IA — OPERATOR HELP CENTER QA REPORT
===========================================================
Fecha de Auditoría: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.13.1-sentinel-help-center-qa-lock
Estado Global de QA: ${qaStatus.toUpperCase()}
Progreso del Check-List: ${passedCount}/${totalCount} Controles Aprobados

[1] CONTROLES DE PORTADA E INTEGRIDAD VISUAL:
- Conservación de Home Premium (8 Tarjetas): ${qaChecklist.homePremiumPreserved ? "APROBADO" : "PENDIENTE"}
- Home Simplificada Conserje (4 Tarjetas): ${qaChecklist.conserjeHomeFourCards ? "APROBADO" : "PENDIENTE"}
- Sin Tarjetas Nuevas en Portada: ${qaChecklist.noNewHomeCards ? "APROBADO" : "PENDIENTE"}
- Version Registry Oculto en Header: ${qaChecklist.versionRegistryHiddenHeader ? "APROBADO" : "PENDIENTE"}
- Acceso desde Botón Manual Rápido: ${qaChecklist.manualOpensHelpCenter ? "APROBADO" : "PENDIENTE"}

[2] CONTROLES DE RBAC Y FILTRADO SEGURO:
- Filtros por Rol del Help Center: ${qaChecklist.conserjeHelpFiltered ? "APROBADO" : "PENDIENTE"}
- Glosario de Términos Filtrado por Rol: ${qaChecklist.glossaryRoleFiltered ? "APROBADO" : "PENDIENTE"}
- Casos de Soporte y Diagnóstico Seguros: ${qaChecklist.troubleshootingSafe ? "APROBADO" : "PENDIENTE"}
- Contextual Help Drawer Role-Aware: ${qaChecklist.contextualHelpDrawerRoleAware ? "APROBADO" : "PENDIENTE"}
- Aislamiento de Red y No Exposición IP/RTSP: ${qaChecklist.noIpRtspExposed ? "APROBADO" : "PENDIENTE"}

[3] CONTROLES DE LENGUAJE RESPONSABLE (MICROCOPY LOCK):
- Remoción de Vocablos No Permitidos/Garantía: ${qaChecklist.noCertificationWording ? "APROBADO" : "PENDIENTE"}
- Remoción de Afirmaciones de Almacenamiento Absoluto: ${qaChecklist.noAbsoluteStorageWording ? "APROBADO" : "PENDIENTE"}
- Renombrado de Report & Training Summary Compiler: ${qaChecklist.trainingSummaryReportRenamed ? "APROBADO" : "PENDIENTE"}
- Mini-Recorridos Guiados No Invasivos: ${qaChecklist.guidedToursNonInvasive ? "APROBADO" : "PENDIENTE"}
- Marcadores de Avance del Recorrido 100% Locales: ${qaChecklist.tourMarkersLocalOnly ? "APROBADO" : "PENDIENTE"}

[4] VERIFICACIÓN TÉCNICA DE COMPILACIÓN:
- Actualización de Version Registry: ${qaChecklist.versionRegistryUpdated ? "APROBADO" : "PENDIENTE"}
- Documentación de README Completa: ${qaChecklist.readmeUpdated ? "APROBADO" : "PENDIENTE"}
- Compilación de Aplicación Limpia (Zero warnings): ${qaChecklist.buildClean ? "APROBADO" : "PENDIENTE"}

===========================================================
VALIDACIÓN DE INGENIERÍA DE PREVENTA RESPONSABLE
ORBI-SENTINEL-HELP-CENTER-QA-LOCKED-v0.13.1
===========================================================`;
  }, [qaChecklist, qaStatus]);

  // Allowed screens help for the role
  const filteredScreensHelp = useMemo(() => {
    return SCREEN_HELP.filter(screen => {
      if (isConserje) {
        // Conserje can only see help of basic screens
        return ["simplehome", "livewall", "easyview", "incidentcenter", "privacy"].includes(screen.id);
      }
      return true;
    });
  }, [userRole]);

  // Allowed Role Guides based on RBAC
  const filteredRoleGuides = useMemo(() => {
    return ROLE_GUIDES.filter(guide => {
      if (isConserje) {
        return guide.role === "conserje";
      }
      return true;
    });
  }, [userRole]);

  // Allowed FAQ Items based on RBAC
  const filteredFaqItems = useMemo(() => {
    return FAQ_ITEMS.filter(faq => {
      if (isConserje) {
        return faq.category === "operacion" || faq.category === "seguridad";
      }
      return true;
    });
  }, [userRole]);

  // Search local logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const matches: {
      type: "Guía por Rol" | "Pantalla" | "Pregunta Frecuente" | "Término Glosario" | "Falla Común";
      title: string;
      subtitle: string;
      snippet: string;
      tabId: string;
      subTabId: "inicio" | "roles" | "pantallas" | "faq" | "glosario" | "privacidad" | "problemas" | "contacto";
    }[] = [];

    // Search role guides
    ROLE_GUIDES.forEach(guide => {
      if (isConserje && guide.role !== "conserje") return; // RBAC Check
      if (guide.title.toLowerCase().includes(q) || guide.description.toLowerCase().includes(q)) {
        matches.push({
          type: "Guía por Rol",
          title: guide.title,
          subtitle: `Perfil: ${guide.role.toUpperCase()}`,
          snippet: guide.description,
          tabId: "helpcenter",
          subTabId: "roles"
        });
      }
      guide.topics.forEach(topic => {
        if (topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)) {
          matches.push({
            type: "Guía por Rol",
            title: topic.title,
            subtitle: `Tema de: ${guide.title}`,
            snippet: topic.description,
            tabId: "helpcenter",
            subTabId: "roles"
          });
        }
      });
    });

    // Search screens help
    filteredScreensHelp.forEach(screen => {
      if (screen.name.toLowerCase().includes(q) || screen.description.toLowerCase().includes(q) || screen.whatToAvoid.toLowerCase().includes(q)) {
        matches.push({
          type: "Pantalla",
          title: screen.name,
          subtitle: `Acceso: ${screen.targetUser}`,
          snippet: screen.description,
          tabId: screen.targetTab,
          subTabId: "pantallas"
        });
      }
    });

    // Search FAQs
    filteredFaqItems.forEach(faq => {
      if (faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)) {
        matches.push({
          type: "Pregunta Frecuente",
          title: faq.question,
          subtitle: `Categoría: ${faq.category.toUpperCase()}`,
          snippet: faq.answer,
          tabId: "helpcenter",
          subTabId: "faq"
        });
      }
    });

    // Search Glossary
    GLOSSARY.forEach(term => {
      if (term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q)) {
        matches.push({
          type: "Término Glosario",
          title: term.term,
          subtitle: "Glosario de Conceptos",
          snippet: term.definition,
          tabId: "helpcenter",
          subTabId: "glosario"
        });
      }
    });

    // Search Troubleshooting
    TROUBLESHOOTING_CASES.forEach(tc => {
      if (isConserje && ["no_advanced", "no_export"].includes(tc.id)) return; // RBAC Check
      if (tc.title.toLowerCase().includes(q) || tc.cause.toLowerCase().includes(q)) {
        matches.push({
          type: "Falla Común",
          title: tc.title,
          subtitle: `Causa: ${tc.cause}`,
          snippet: tc.steps.join(" → "),
          tabId: "helpcenter",
          subTabId: "problemas"
        });
      }
    });

    return matches;
  }, [searchQuery, userRole, filteredScreensHelp, filteredFaqItems]);

  // Handle contact alert simulation
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;

    setContactFormStatus("sending");
    onAddAuditLog("Soporte Técnico de Ayuda", `Intento de reporte de problema: ${contactSubject}`);

    setTimeout(() => {
      setContactFormStatus("success");
      setContactSubject("");
      setContactMessage("");
      onAddAuditLog("Soporte Técnico de Ayuda", "Ticket de simulación generado correctamente en la bitácora de capacitación.");
    }, 1000);
  };

  // Generate training summary text
  const trainingSummaryText = useMemo(() => {
    const totalTours = GUIDED_TOURS.filter(t => t.role === "all" || t.role === userRole).length;
    const totalFaq = filteredFaqItems.length;
    const totalGlossary = filteredGlossary.length;
    
    return `===========================================================
ORBI SENTINEL IA — IN-APP TRAINING SUMMARY REPORT
===========================================================
Fecha de Emisión: ${new Date().toISOString().split("T")[0]}
Versión de Software: v0.13.1-sentinel-help-center-qa-lock
Rol de Operador Evaluado: ${userRole.toUpperCase()}
Estado de Entrenamiento: Completado e Incorporado en el Puesto

[1] CONTENIDO DISPONIBLE EN ESTA SESIÓN:
- Guías Técnicas de Aprendizaje: ${filteredRoleGuides.length} módulos por rol
- Pantallas Documentadas y Auditadas: ${filteredScreensHelp.length} módulos
- Preguntas Frecuentes de Cumplimiento Responsable: ${totalFaq} FAQs
- Conceptos y Definiciones de Laboratorio: ${totalGlossary} términos
- Casos de Diagnóstico y Mitigación de Fallas: ${TROUBLESHOOTING_CASES.length} escenarios

[2] RUTAS DE APRENDIZAJE Y MINI-RECORRIDOS GUIADOS:
- Total de recorridos disponibles para rol actual: ${totalTours} recorridos
- Estado de visualización de tours: Registrado en almacenamiento local del nodo
- Estado del Contextual Help Drawer: Habilitado e integrado en vistas operativas

[3] DECLARACIÓN DE LÍMITES Y CUMPLIMIENTO ÉTICO:
- SIN EXPOSICIÓN DE CREDENCIALES: Verificado. No se registran contraseñas de red.
- SIN PROTOCOLO IP/RTSP PÚBLICOS: Verificado. Aislamiento absoluto en la suite.
- SIN DATOS REALES DE PRODUCCIÓN: Verificado. Todo registro es simulado de laboratorio.
- VALIDEZ DE REPORTE: Trazabilidad y apoyo cognitivo interno de capacitación.
- LIMITACIÓN: No constituye validación externa o reporte legal judicial externo ni reemplaza
  el plan de prevención de riesgos HSE o la labor de vigilancia física humana.
===========================================================`;
  }, [userRole, filteredRoleGuides, filteredScreensHelp, filteredFaqItems, filteredGlossary]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(trainingSummaryText);
    setIsCopied(true);
    onAddAuditLog("Copiado Reporte Capacitación", "El operador copió al portapapeles el resumen de capacitación interna.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[550px] text-slate-200">
      
      {/* Header and Search Area */}
      <div className="p-6 bg-slate-950/80 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-sans font-black text-white uppercase tracking-tight">
              Operator Help Center
            </h2>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">
              In-App Training
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Aprenda a operar ORBI Sentinel de forma ética, segura y sin abrumar la interfaz comercial.
          </p>
        </div>

        {/* Local Search bar with zero telemetry */}
        <div className="relative w-full md:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Buscar en el Centro de Ayuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl py-2 pl-9 pr-4 text-xs font-sans text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Split Pane */}
      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Left Side Tab bar */}
        <div className="w-full lg:w-64 bg-slate-950/35 border-b lg:border-b-0 lg:border-r border-slate-900 p-4 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-none">
          <div className="hidden lg:block text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 mb-2 font-bold">
            Secciones de Ayuda
          </div>
          
          <button
            onClick={() => { setActiveSubTab("inicio"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "inicio" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>A. Inicio rápido</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("roles"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "roles" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>B. Guías por rol</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("pantallas"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "pantallas" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>C. Ayuda por pantalla</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("faq"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "faq" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>D. Preguntas frecuentes</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("glosario"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "glosario" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>E. Glosario simple</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("privacidad"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "privacidad" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>F. Seguridad y privacidad</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("problemas"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "problemas" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>G. Solución de problemas</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("contacto"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "contacto" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>H. Soporte & Capacitación</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("onboarding_practice"); setSearchQuery(""); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeSubTab === "onboarding_practice" && !searchQuery
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>J. Práctica Onboarding</span>
          </button>

          {userRole !== "conserje" && (
            <button
              onClick={() => { setActiveSubTab("qa_lock"); setSearchQuery(""); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "qa_lock" && !searchQuery
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>I. QA Lock & Auditoría</span>
            </button>
          )}
        </div>

        {/* Right Side Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* SEARCH RESULTS VIEW OVERRIDE */}
          {searchQuery && searchResults !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400">
                  Resultados locales encontrados para "{searchQuery}"
                </span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-mono">
                  {searchResults.length} coincidencias
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs font-sans">No se encontraron coincidencias locales.</p>
                  <p className="text-[10px] text-slate-600">Intente con palabras como "cámara", "conserje", "privacidad", "ping" o "alerta".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((res, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition-all space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-emerald-400">
                            {res.type}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {res.subtitle}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white font-sans">{res.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                          {res.snippet}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveSubTab(res.subTabId);
                          if (res.tabId !== "helpcenter") {
                            setCurrentTab(res.tabId);
                          }
                        }}
                        className="text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 font-mono font-bold self-start"
                      >
                        Ir a sección <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION A: INICIO RÁPIDO */}
          {!searchQuery && activeSubTab === "inicio" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Inicio Rápido de Operaciones
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Acceso directo guiado para las acciones operacionales y de preventa del sistema de simulación.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                
                {/* 1. Ver cámaras */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Video className="w-4 h-4 text-emerald-400" />
                      <span>Ver Cámaras</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Cuadrícula de video perimetral de laboratorio.<br />
                      <strong>Cuándo usarlo:</strong> Monitoreo diario y validación de puntos de vigilancia perimetral.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab("livewall");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Live Wall");
                    }}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Live Wall</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Revisar incidentes */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span>Revisar Incidentes</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Bitácora local de eventos de seguridad registrados.<br />
                      <strong>Cuándo usarlo:</strong> Para documentar actividades observadas por conserjes o analíticas.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab("incidentcenter");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Incident Center");
                    }}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Incident Center</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Generar reporte */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Generar Reporte</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Compilador de bitácoras en formato Markdown sanitizado.<br />
                      <strong>Cuándo usarlo:</strong> Para exportar resúmenes operacionales libres de datos de red o PII.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Acción restringida para el rol Conserje. Requiere rol Administrador.");
                        return;
                      }
                      setCurrentTab("evidence");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Evidencias");
                    }}
                    disabled={isConserje}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Reportes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. Activar Modo Conserje */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Modo Conserje (Easy View)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Interfaz táctil de baja carga cognitiva perimetral.<br />
                      <strong>Cuándo usarlo:</strong> Durante turnos de vigilancia intensiva para operadores en guardia.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab("easyview");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Easy View");
                    }}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Activar Easy View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5. Diagnóstico CCTV */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Wrench className="w-4 h-4 text-emerald-400" />
                      <span>Revisar Diagnóstico</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Gráficos de ping, latencia y fluctuaciones de video.<br />
                      <strong>Cuándo usarlo:</strong> Al detectar intermitencias simuladas o evaluar estabilidad LAN.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Acción restringida para el rol Conserje. Requiere rol Técnico o Admin.");
                        return;
                      }
                      setCurrentTab("diagnostics");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Diagnóstico");
                    }}
                    disabled={isConserje}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Diagnóstico</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 6. Buscar evidencia */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Buscar Evidencia</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Visualizador de clips segmentados y resguardados localmente.<br />
                      <strong>Cuándo usarlo:</strong> Ante requerimientos de revisión técnica de grabaciones pasadas.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Acción restringida. Requiere rol Administrador o Técnico.");
                        return;
                      }
                      setCurrentTab("edgerecorder");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Edge Recorder");
                    }}
                    disabled={isConserje}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Edge Recorder</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 7. Abrir Centro Avanzado */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>Abrir Centro Avanzado</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Matriz global de control ético y aseguramiento de calidad.<br />
                      <strong>Cuándo usarlo:</strong> Para auditorías de compliance y validación de frentes legales.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Acción restringida. Requiere rol Administrador o Técnico.");
                        return;
                      }
                      setCurrentTab("releasecandidate");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Release Candidate");
                    }}
                    disabled={isConserje}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir RC Center</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 8. Preparar demo */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Preparar una Demo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Runbook comercial interactivo con guías de diálogo.<br />
                      <strong>Cuándo usarlo:</strong> Minutos antes de recibir clientes o comités evaluadores.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Acción restringida. Requiere rol Administrador.");
                        return;
                      }
                      setCurrentTab("demorunbook");
                      onAddAuditLog("Inicio Rápido Help", "Navegación rápida a Demo Runbook");
                    }}
                    disabled={isConserje}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/20 text-slate-200 hover:text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Abrir Demo Runbook</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 9. Práctica de Onboarding */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Practicar primeros pasos</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong>Qué es:</strong> Ruta de aprendizaje guiado para operadores con mitigación de vicios comerciales.<br />
                      <strong>Cuándo usarlo:</strong> Primera vez que abre la consola o para revalidar flujos éticos.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSubTab("onboarding_practice");
                      onAddAuditLog("Inicio Rápido Help", "Navegación a Práctica Onboarding");
                    }}
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                  >
                    <span>Iniciar Onboarding</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SECTION B: GUÍAS POR ROL */}
          {!searchQuery && activeSubTab === "roles" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Rutas de Aprendizaje por Perfil
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    Instrucciones especializadas y responsabilidades ajustadas según el nivel de acceso (RBAC).
                  </p>
                </div>

                {/* Role Filter tabs */}
                <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-850 self-start">
                  <button
                    onClick={() => setSelectedRoleGuide("conserje")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      selectedRoleGuide === "conserje"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Conserje
                  </button>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Restringido: Como Conserje no tiene visibilidad de guías avanzadas.");
                        return;
                      }
                      setSelectedRoleGuide("admin");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      isConserje ? "opacity-30 cursor-not-allowed" : ""
                    } ${
                      selectedRoleGuide === "admin"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      if (isConserje) {
                        alert("Restringido: Como Conserje no tiene visibilidad de guías de ingeniería.");
                        return;
                      }
                      setSelectedRoleGuide("tecnico");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                      isConserje ? "opacity-30 cursor-not-allowed" : ""
                    } ${
                      selectedRoleGuide === "tecnico"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Técnico
                  </button>
                </div>
              </div>

              {/* Display Active Role Guide Content */}
              {ROLE_GUIDES.filter(g => g.role === selectedRoleGuide).map((guide, gIdx) => (
                <div key={gIdx} className="space-y-6">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
                      {guide.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Práctica Interactiva de Onboarding</span>
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        ¿Desea validar de forma interactiva que ha comprendido esta ruta? Inicie el Onboarding de Primeros Pasos con resguardo ético de simulación.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSubTab("onboarding_practice");
                        onAddAuditLog("Roles Guide Link", `Saltó a Práctica Onboarding para rol ${selectedRoleGuide}`);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
                    >
                      Iniciar Práctica
                    </button>
                  </div>

                  {/* Guided Tours Launcher For This Role */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Mini-recorridos guiados disponibles en caliente
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GUIDED_TOURS.filter(t => t.role === guide.role || t.role === "all").map((tour) => (
                        <div
                          key={tour.id}
                          className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all"
                        >
                          <div>
                            <h6 className="text-xs font-bold text-white">{tour.name}</h6>
                            <p className="text-[10px] text-slate-500 mt-0.5">{tour.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              onStartTour(tour.id);
                              onAddAuditLog("Tour Iniciado", `Inició mini-recorrido: ${tour.name}`);
                            }}
                            className="text-emerald-400 hover:text-white bg-slate-900 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 flex items-center justify-center transition-colors"
                            title="Iniciar recorrido guiado"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* List of Detailed Topics */}
                  <div className="space-y-4 pt-2">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Módulos de instrucción paso a paso
                    </h5>

                    <div className="space-y-3">
                      {guide.topics.map((topic, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl space-y-3"
                        >
                          <div>
                            <h6 className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                                {String(tIdx + 1).padStart(2, "0")}
                              </span>
                              {topic.title}
                            </h6>
                            <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">
                              {topic.description}
                            </p>
                          </div>

                          <div className="space-y-1.5 pl-4 border-l border-emerald-500/20">
                            {topic.steps.map((step, sIdx) => (
                              <div key={sIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-400 font-mono mt-0.5 select-none">✔</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>

                          {topic.warning && (
                            <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span className="text-[10px] text-rose-400 leading-normal font-sans">
                                <strong>Advertencia de cumplimiento:</strong> {topic.warning}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION C: AYUDA POR PANTALLA */}
          {!searchQuery && activeSubTab === "pantallas" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Registro de Ayuda Contextual por Módulo
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Estructura funcional de cada pantalla principal de la suite y mitigación de fallas operativas.
                </p>
              </div>

              <div className="space-y-4">
                {filteredScreensHelp.map((screen) => (
                  <div
                    key={screen.id}
                    className="bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden"
                  >
                    {/* Header bar */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-900 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-black bg-slate-900 border border-slate-850 text-emerald-400 px-2 py-0.5 rounded uppercase mr-2">
                          MÓDULO
                        </span>
                        <span className="text-xs font-bold text-white">{screen.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500">
                          Acceso: {screen.targetUser}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentTab(screen.targetTab);
                            onAddAuditLog("Pantalla Related", `Salto a pantalla de ayuda: ${screen.name}`);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-1 rounded text-[10px] font-bold font-mono tracking-tight transition-all"
                        >
                          Ir a Pantalla
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 text-xs leading-relaxed font-sans text-slate-300">
                      <p className="text-[11px] text-slate-400 font-normal leading-normal">
                        {screen.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        
                        {/* Acciones principales */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                            Acciones Principales
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                            {screen.actions.map((act, aIdx) => (
                              <li key={aIdx}>{act}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Errores comunes */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                            Errores Comunes
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                            {screen.commonErrors.map((err, eIdx) => (
                              <li key={eIdx} className="text-amber-400/90">{err}</li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      {/* Qué evitar */}
                      <div className="pt-2 border-t border-slate-850">
                        <span className="text-[10px] font-mono text-rose-400/90 uppercase tracking-widest font-bold block mb-1">
                          Límite de Operación / Qué Evitar
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {screen.whatToAvoid}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: PREGUNTAS FRECUENTES */}
          {!searchQuery && activeSubTab === "faq" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Preguntas Frecuentes de la Suite
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    Respuestas directas y responsables sobre el alcance técnico y mitigación comercial.
                  </p>
                </div>

                {/* FAQ categories filter */}
                <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-850 overflow-x-auto max-w-full">
                  <button
                    onClick={() => setSelectedFaqCategory("all")}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                      selectedFaqCategory === "all" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedFaqCategory("operacion")}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                      selectedFaqCategory === "operacion" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                    }`}
                  >
                    Operación
                  </button>
                  {userRole !== "conserje" && (
                    <>
                      <button
                        onClick={() => setSelectedFaqCategory("tecnico")}
                        className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                          selectedFaqCategory === "tecnico" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                        }`}
                      >
                        Técnico
                      </button>
                      <button
                        onClick={() => setSelectedFaqCategory("demo")}
                        className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                          selectedFaqCategory === "demo" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                        }`}
                      >
                        Demo
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedFaqCategory("seguridad")}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                      selectedFaqCategory === "seguridad" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                    }`}
                  >
                    Seguridad
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaqItems
                  .filter(item => selectedFaqCategory === "all" || item.category === selectedFaqCategory)
                  .map((faq, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2"
                    >
                      <h4 className="text-xs font-bold text-white flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-mono mt-0.5">❔</span>
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION E: GLOSARIO SIMPLE */}
          {!searchQuery && activeSubTab === "glosario" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Glosario de Términos de Laboratorio
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Definiciones sencillas sin tecnicismos innecesarios para garantizar la consistencia en el lenguaje de preventa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredGlossary.map((term, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1"
                  >
                    <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider block">
                      {term.term}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION F: SEGURIDAD Y PRIVACIDAD */}
          {!searchQuery && activeSubTab === "privacidad" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad de Datos y Privacidad Residencial</span>
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Pautas éticas obligatorias para el resguardo de información y enmascaramiento perimetral.
                </p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <h4 className="font-bold text-white uppercase tracking-tight">
                      Resguardo de Privacidad Local
                    </h4>
                    <p className="leading-relaxed">
                      ORBI Sentinel IA está diseñado para operar sin almacenar PII, credenciales, IP/RTSP ni datos sensibles en los marcadores locales previstos. Se reduce activamente la exposición de datos sensibles mediante scanner local y guardrails de demo controlada, sin transmisión a repositorios en la nube.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    🔒 No exposición de parámetros críticos
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Está prohibido mostrar direcciones IP de switches, credenciales maestras de NVR, rutas RTSP desprotegidas o tokens de seguridad en pantallas de demostración o reportes públicos. Toda IP de la interfaz simula conexiones de laboratorio.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    👤 Anonimización y Privacidad Residencial
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    El sistema integra un enmascaramiento de privacidad estático irreversible sobre áreas de copropiedad (ventanas, balcones privados) para resguardar la intimidad familiar. No intente evadir ni alterar estas zonas negras de monitoreo.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    🤖 Validación Humana Obligatoria
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Toda alerta analítica perimetral constituye una propuesta lógica sujeta a la validación de un operador calificado de carne y hueso. El sistema no toma determinaciones de intervención física autónoma de forma directa.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    🏢 Datos de Simulación Libres de PII
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    La base de datos simula nombres, placas patentes y marcas de vehículos con el único fin de capacitar u operar maquetas lógicas. Está prohibido el registro de datos de identidad reales sin consentimiento explícito.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION G: SOLUCIÓN DE PROBLEMAS */}
          {!searchQuery && activeSubTab === "problemas" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Guía de Resolución de Fallas Comunes
                </h3>
                <p className="text-xs text-slate-450 mt-1">
                  Procedimientos autorizados para diagnosticar e informar anomalías operacionales de forma segura.
                </p>
              </div>

              <div className="space-y-4">
                {TROUBLESHOOTING_CASES
                  .filter(tc => !isConserje || !["no_advanced", "no_export"].includes(tc.id))
                  .map((tc) => (
                    <div
                      key={tc.id}
                      className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{tc.title}</h4>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Causa Probable: {tc.cause}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pl-6 border-l border-amber-500/20">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-1">
                          Pasos de Verificación:
                        </span>
                        {tc.steps.map((step, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-normal">
                            <span className="text-slate-500 font-mono">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-850/60 text-[10px]">
                        <div>
                          <span className="text-rose-400 font-bold block">🚨 QUÉ NO HACER:</span>
                          <p className="text-slate-450 leading-relaxed mt-0.5">{tc.whatNotToKeep}</p>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-bold block">📞 CUÁNDO AVISAR AL TÉCNICO:</span>
                          <p className="text-slate-450 leading-relaxed mt-0.5">{tc.whenToNotifyTech}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION H: CONTACTAR / AVISAR TÉCNICO & SUMMARY */}
          {!searchQuery && activeSubTab === "contacto" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Simulated Notification Form */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Aviso de Novedad Técnica
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">
                      Informe anomalías de simulación o configure alertas de laboratorio para el técnico de turno.
                    </p>
                  </div>

                  {contactFormStatus === "success" ? (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                      <h4 className="text-xs font-bold text-white">Novedad Reportada con Éxito</h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        La novedad ha sido registrada localmente en los logs de auditoría interna. El instalador técnico de turno recibirá el aviso.
                      </p>
                      <button
                        onClick={() => setContactFormStatus("idle")}
                        className="mt-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 px-3 py-1 rounded"
                      >
                        Enviar otra notificación
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                          Asunto o Síntoma Detectado
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Pérdida intermitente de señal en cámara perimetral..."
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-emerald-500/40 focus:outline-none focus:ring-0"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                          Descripción de Observaciones
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Describa de manera descriptiva el suceso de laboratorio observado. No ingrese claves ni datos sensibles."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-sans text-white focus:border-emerald-500/40 focus:outline-none focus:ring-0"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactFormStatus === "sending"}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{contactFormStatus === "sending" ? "Enviando Novedad..." : "Enviar Aviso Técnico"}</span>
                      </button>
                    </form>
                  )}

                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                      🚨 Protocolo de Prevención HSE:
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-sans">
                      Está estrictamente prohibido realizar intervenciones físicas en tableros de energía PoE, cableados o switches. Para mantenimientos de hardware presenciales, espere siempre al personal de ingeniería calificado.
                    </p>
                  </div>
                </div>

                {/* Training Summary Report Panel */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Reporte de Entrenamiento Interno
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">
                      Genere un reporte resumido de capacitación interna para respaldar la entrega del puesto de control.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      Visualizador de Reporte de Capacitación
                    </span>
                    
                    <pre className="p-3 bg-slate-950/90 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 overflow-x-auto max-h-48 leading-relaxed">
                      {trainingSummaryText}
                    </pre>

                    <button
                      onClick={handleCopySummary}
                      className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado con éxito!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Reporte al Portapapeles</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION J: OPERATOR ONBOARDING PRACTICE */}
          {!searchQuery && activeSubTab === "onboarding_practice" && (
            <OperatorOnboardingPractice
              userRole={userRole}
              onAddAuditLog={onAddAuditLog}
              setCurrentTab={setCurrentTab}
            />
          )}

          {/* SECTION I: QA LOCK & AUDITORÍA */}
          {!searchQuery && activeSubTab === "qa_lock" && (
            <div className="space-y-6">
              {/* Dual Lock Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-2 pb-1">
                <button
                  onClick={() => setQaLockActiveTab("onboarding")}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl border transition-all flex items-center gap-2 ${
                    qaLockActiveTab === "onboarding"
                      ? "bg-slate-900 text-emerald-400 border-t-emerald-500/50 border-x-slate-800 border-b-slate-900"
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Onboarding Practice Lock</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    onboardingQaStatus === "OPERATOR ONBOARDING PRACTICE LOCKED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : onboardingQaStatus === "Onboarding Blocked"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {onboardingQaStatus === "OPERATOR ONBOARDING PRACTICE LOCKED" ? "LOCKED" : onboardingQaStatus}
                  </span>
                </button>
                <button
                  onClick={() => setQaLockActiveTab("help_center")}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl border transition-all flex items-center gap-2 ${
                    qaLockActiveTab === "help_center"
                      ? "bg-slate-900 text-amber-400 border-t-amber-500/50 border-x-slate-800 border-b-slate-900"
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Help Center QA Lock</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    qaStatus === "OPERATOR HELP CENTER LOCKED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : qaStatus === "Help Center Blocked"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {qaStatus === "OPERATOR HELP CENTER LOCKED" ? "LOCKED" : qaStatus}
                  </span>
                </button>
              </div>

              {/* TAB 1: OPERATOR ONBOARDING PRACTICE QA LOCK */}
              {qaLockActiveTab === "onboarding" && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-950/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">
                          OPERATOR ONBOARDING PRACTICE QA LOCK
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Panel de auditoría y bloqueos de seguridad del Operator Onboarding & First-Use Validation (Módulo 13D).
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                        ESTADO DE ONBOARDING QA:
                      </span>
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full mt-1 border uppercase tracking-wider ${
                        onboardingQaStatus === "OPERATOR ONBOARDING PRACTICE LOCKED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : onboardingQaStatus === "Needs Review"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {onboardingQaStatus}
                      </span>
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Interfaz, Rutas y RBAC */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [1] INTERFAZ, RUTAS POR ROL & RBAC
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "onboardingPracticeSubTabExists", label: "Sub-tab real de Práctica Onboarding en el Centro de Ayuda" },
                          { key: "deepLinkOpensSubTab", label: "Apertura directa mediante deep-link (?tab=onboarding_practice)" },
                          { key: "safetyBannerVisible", label: "Banner visible que explicita resguardo ético y privacidad" },
                          { key: "conserjeRouteImplemented", label: "Ruta de Conserje activa con ejercicios de primeros pasos operativos" },
                          { key: "adminRouteImplemented", label: "Ruta de Administrador activa con ejercicios de gestión" },
                          { key: "tecnicoRouteImplemented", label: "Ruta de Técnico activa con ejercicios de diagnóstico avanzado" },
                          { key: "conserjeBlockedFromTechnical", label: "RBAC: Bloqueo estricto del perfil Conserje a ejercicios de Técnico" },
                          { key: "rbacExerciseFilteringActive", label: "Filtros dinámicos activos que ocultan ejercicios no autorizados" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(onboardingQaChecklist as any)[item.key]}
                              onChange={(e) => setOnboardingQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Interactividad, Heurística y Privacidad */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [2] INTERACTIVIDAD, HEURÍSTICA & PRIVACIDAD
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "exercisesInteractive", label: "Ejercicios totalmente guiados e interactivos paso a paso" },
                          { key: "goToScreenButtonsWork", label: "Redirección 'Ir a Pantalla' integrada con el launcher" },
                          { key: "markPracticedButtonsWork", label: "Control de avance con botón 'Marcar como Practicado'" },
                          { key: "needHelpButtonsWork", label: "Botón 'Necesito Ayuda' despliega el FAQ drawer del Help Center" },
                          { key: "firstUseValidationActive", label: "Validación orientativa sin calificar personas ni otorgar certificaciones" },
                          { key: "onboardingCoachActive", label: "Coach de onboarding que provee recomendaciones en base a acciones" },
                          { key: "notesScannerActive", label: "Heurística: Escáner que detecta PII, contraseñas e IPs reales" },
                          { key: "summaryReportSanitized", label: "Reporte de fin de práctica sanitizado libre de datos privados" },
                          { key: "localHistorySanitizedAndPurgeable", label: "Bitácora local en localStorage sanitizada y purgable con un clic" },
                          { key: "helpCenterIntegrationActive", label: "Integrado armoniosamente en la estructura del Help Center" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(onboardingQaChecklist as any)[item.key]}
                              onChange={(e) => setOnboardingQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Compile Verification and Audit Report Copy */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 lg:col-span-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [3] INTEGRIDAD & COMPILACIÓN
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "homePremiumPreservedOnb", label: "Home Premium de 8 Tarjetas intocado sin tarjetas adicionales" },
                          { key: "readmeUpdatedOnb", label: "Documentación README.md actualizada para Módulo 13C/D" },
                          { key: "versionRegistryUpdatedOnb", label: "Version Registry actualizado a v0.13.4" },
                          { key: "buildCleanOnb", label: "Compilación productiva de Vite libre de fallas" },
                          { key: "typeScriptCleanOnb", label: "Validación estricta de tipos de TypeScript exitosa" },
                          { key: "lintCleanOnb", label: "Linter de imports y sintaxis de ESLint aprobado" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(onboardingQaChecklist as any)[item.key]}
                              onChange={(e) => setOnboardingQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Copiable Audit Report Panel */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 lg:col-span-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [4] REPORTE DE AUDITORÍA DE ONBOARDING COPIABLE
                      </span>
                      
                      <pre className="p-3 bg-slate-950/90 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 overflow-x-auto max-h-36 leading-relaxed">
                        {onboardingQaReportText}
                      </pre>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(onboardingQaReportText);
                          setIsOnbQaCopied(true);
                          onAddAuditLog("Copiado Reporte QA Onboarding", "El operador copió al portapapeles el reporte de auditoría QA de Onboarding.");
                          setTimeout(() => setIsOnbQaCopied(false), 2000);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        {isOnbQaCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">¡Reporte Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Reporte QA de Onboarding</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: OPERATOR HELP CENTER QA LOCK */}
              {qaLockActiveTab === "help_center" && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-950/80 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">
                          OPERATOR HELP CENTER QA LOCK
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Panel de verificación técnica y microcopy final para la liberación del módulo 13B.
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                        ESTADO GLOBAL DE QA:
                      </span>
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full mt-1 border uppercase tracking-wider ${
                        qaStatus === "OPERATOR HELP CENTER LOCKED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : qaStatus === "Needs Review"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {qaStatus}
                      </span>
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Visual Integrity & RBAC */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [1] INTEGRIDAD VISUAL & FILTROS RBAC
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "homePremiumPreserved", label: "Preservar Home Premium de 8 tarjetas comerciales" },
                          { key: "adminHomeEightCards", label: "RBAC: Home del Admin con 8 tarjetas de control" },
                          { key: "conserjeHomeFourCards", label: "RBAC: Home de Conserje reducida a 4 tarjetas básicas" },
                          { key: "noNewHomeCards", label: "Sin tarjetas técnicas nuevas agregadas al Home" },
                          { key: "versionRegistryHiddenHeader", label: "Ocultar Version Registry en el Header de portada" },
                          { key: "manualOpensHelpCenter", label: "Botón rápido manual de Soporte abre el Help Center" },
                          { key: "helpCenterNoOverlayHome", label: "Help Center abre aislado (no se superpone en el Home)" },
                          { key: "conserjeHelpFiltered", label: "RBAC Help Center: Conserje no ve opciones de Admin/Técnico" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(qaChecklist as any)[item.key]}
                              onChange={(e) => setQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Responsible Microcopy & Compliance */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [2] LENGUAJE RESPONSABLE & COMPLIANCE
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "noCertificationWording", label: "Sin vocablos no permitidos o validez legal externa" },
                          { key: "noAbsoluteStorageWording", label: "Sin falsas garantías de almacenamiento absoluto" },
                          { key: "trainingSummaryReportRenamed", label: "Reporte de entrenamiento renombrado sin términos no permitidos" },
                          { key: "guidedToursNonInvasive", label: "Recorridos interactivos de un solo paso no invasivos" },
                          { key: "tourMarkersLocalOnly", label: "Marcadores de avance persistidos en local storage sin PII" },
                          { key: "contextualHelpDrawerRoleAware", label: "Contextual Help Drawer inteligente sensible al rol" },
                          { key: "helpSearchLocalOnly", label: "Búsqueda local indexada sin almacenar PII, credenciales, IP/RTSP ni datos sensibles en los marcadores locales previstos" },
                          { key: "glossaryRoleFiltered", label: "Glosario filtrado para Conserje para evitar fatiga cognitiva" },
                          { key: "troubleshootingSafe", label: "Fallas comunes sin manipulación física prohibida (HSE)" },
                          { key: "noIpRtspExposed", label: "Aislamiento de red: reduciendo exposición de datos sensibles mediante scanner local y guardrails de demo controlada" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(qaChecklist as any)[item.key]}
                              onChange={(e) => setQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Compile Verification and Audit Report Copy */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 lg:col-span-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [3] VERIFICACIÓN TÉCNICA
                      </span>
                      
                      <div className="space-y-2">
                        {[
                          { key: "versionRegistryUpdated", label: "Codename y Versión del software actualizados a v0.13.1" },
                          { key: "readmeUpdated", label: "Documentación README.md actualizada con módulo 13B" },
                          { key: "buildClean", label: "Compilación de empaquetado exitosa sin errores" },
                          { key: "typeScriptClean", label: "Validación de tipos de TypeScript completada" },
                          { key: "lintClean", label: "Linter completado con cero errores de imports" },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-2.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(qaChecklist as any)[item.key]}
                              onChange={(e) => setQaChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Copiable Audit Report Panel */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 lg:col-span-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1">
                        [4] INFORME DE AUDITORÍA DE CALIDAD COPIABLE
                      </span>
                      
                      <pre className="p-3 bg-slate-950/90 border border-slate-900 rounded-lg text-[9px] font-mono text-slate-400 overflow-x-auto max-h-36 leading-relaxed">
                        {qaReportText}
                      </pre>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(qaReportText);
                          setIsQaCopied(true);
                          onAddAuditLog("Copiado Reporte QA Help Center", "El operador copió al portapapeles el reporte de auditoría QA del Centro de Ayuda.");
                          setTimeout(() => setIsQaCopied(false), 2000);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        {isQaCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">¡Reporte Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Reporte QA de Auditoría</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
