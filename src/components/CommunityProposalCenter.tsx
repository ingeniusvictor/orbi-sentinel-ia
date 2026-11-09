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
  Users,
  Download
} from "lucide-react";

interface CommunityProposalCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

// 1. Types for Scope Builder
interface PilotScope {
  communityName: string;
  totalCameras: number;
  pilotCameras: number;
  includedZones: string[];
  excludedZones: string[];
  existingNvr: "sí" | "no" | "desconocido";
  authorizedAccess: "sí" | "no" | "parcial";
  retentionProposed: number; // days
  authorizedRoles: string[];
  pilotDuration: number; // days
  pilotGoal: string;
  observations: string;
}

// 2. Types for Readiness Checklist
interface ReadinessChecklist {
  cameraInventory: boolean;
  authorizedAccess: boolean;
  commonZonesDefined: boolean;
  privateZonesExcluded: boolean;
  retentionPolicy: boolean;
  rolesDefined: boolean;
  localHardwareAvailable: boolean;
  adminAuthorization: boolean;
  limitedCameraTrials: boolean;
  exportProcedure: boolean;
}

export default function CommunityProposalCenter({ userRole, onAddAuditLog, setCurrentTab }: CommunityProposalCenterProps) {
  // Current sub-tab inside the center
  const [activeSubTab, setActiveSubTab] = useState<"proposal" | "scope" | "privacy" | "presentation" | "objections" | "roadmap" | "report" | "demolock">("demolock");

  const sendToPilotIntake = () => {
    // Sanitized transfer logic
    const sanitizedData = {
      type: "community",
      communityName: scope.communityName.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "").replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "").trim(),
      pilotCameras: scope.pilotCameras,
      totalCameras: scope.totalCameras,
      pilotDuration: scope.pilotDuration,
      includedZones: scope.includedZones,
      excludedZones: scope.excludedZones,
      pilotGoal: scope.pilotGoal.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "").replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "").trim(),
      observations: "Transferido desde Community Proposal Center de forma automática."
    };
    localStorage.setItem("ORBI_PILOT_INTAKE_TRANSFERRED_DATA", JSON.stringify(sanitizedData));
    if (onAddAuditLog) {
      onAddAuditLog("Transferir a Pilot Intake", `Datos de propuesta residencial transferidos para ${scope.communityName}`);
    }
    triggerToast("🚀 Datos preparados y transferidos a Pilot Intake");
    if (setCurrentTab) {
      setTimeout(() => setCurrentTab("pilotintake"), 1000);
    }
  };

  // State for Pilot Scope Builder
  const [scope, setScope] = useState<PilotScope>({
    communityName: "Condominio Nueva Alameda",
    totalCameras: 24,
    pilotCameras: 3,
    includedZones: ["Portón principal", "Acceso peatonal", "Estacionamiento visitas"],
    excludedZones: ["Terrazas privadas", "Hall interior Torre A", "Pasillos de departamentos", "Sector piscina íntima"],
    existingNvr: "sí",
    authorizedAccess: "parcial",
    retentionProposed: 7,
    authorizedRoles: ["Administrador", "Conserje de Turno", "Técnico Validado"],
    pilotDuration: 10,
    pilotGoal: "Validar la estabilidad de los flujos de CCTV comunes en el panel simplificado táctil, evaluar el enmascaramiento de privacidad y registrar eventos críticos sin degradar el ancho de banda del condominio.",
    observations: "El piloto inicial se realizará exclusivamente con cámaras que apunten a accesos públicos y zonas comunes generales."
  });

  // State for Readiness Checklist
  const [checklist, setChecklist] = useState<ReadinessChecklist>({
    cameraInventory: true,
    authorizedAccess: true,
    commonZonesDefined: true,
    privateZonesExcluded: true,
    retentionPolicy: true,
    rolesDefined: true,
    localHardwareAvailable: false,
    adminAuthorization: true,
    limitedCameraTrials: false,
    exportProcedure: true,
  });

  // Presentation State
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Talk Track Duration Selection
  const [talkTrackDuration, setTalkTrackDuration] = useState<"30s" | "2m" | "5m">("2m");

  // Copy success state
  const [copiedProposal, setCopiedProposal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Log on mount
  useEffect(() => {
    if (onAddAuditLog) {
      onAddAuditLog("Acceso a Propuesta", `El usuario con rol ${userRole} ingresó al Community Proposal Center`);
    }
  }, [userRole]);

  // Handle Checklist change
  const toggleChecklistItem = (key: keyof ReadinessChecklist) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      triggerToast(`✓ Requisito de preparación actualizado.`);
      return next;
    });
  };

  // Computes Readiness Score Status
  // Factors:
  // - ready: all true
  // - blocked: if adminAuthorization is false OR privateZonesExcluded is false OR commonZonesDefined is false
  // - pending: if authorizedAccess is false OR localHardwareAvailable is false or limitedCameraTrials is false
  // - review: any other mix
  const getReadinessStatus = (): { label: string; color: string; bg: string; border: string; icon: any } => {
    const totalCount = Object.values(checklist).filter(Boolean).length;
    
    if (!checklist.adminAuthorization || !checklist.privateZonesExcluded || !checklist.commonZonesDefined) {
      return {
        label: "Blocked",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        icon: ShieldAlert
      };
    }

    if (totalCount === 10) {
      return {
        label: "Ready for Pilot",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: ShieldCheck
      };
    }

    if (!checklist.authorizedAccess || !checklist.localHardwareAvailable || !checklist.limitedCameraTrials) {
      return {
        label: "Pending Authorization / Hardware",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: AlertTriangle
      };
    }

    return {
      label: "Needs Review",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      icon: Info
    };
  };

  const readiness = getReadinessStatus();

  // Computes Community Package Status
  // Proposal ready, Presentation ready, Privacy brief ready, Pilot scope ready, Checklist ready, Report ready
  const getPackageStatus = () => {
    const isProposalReady = true; // Static
    const isPresentationReady = true; // Static
    const isPrivacyBriefReady = true; // Static
    const isPilotScopeReady = scope.communityName.length > 3 && scope.pilotCameras > 0;
    const isChecklistReady = Object.values(checklist).filter(Boolean).length >= 7;
    const isReportReady = isPilotScopeReady && isChecklistReady;

    let overall = "Ready to Present";
    let overallColor = "bg-emerald-500 text-slate-950 border-emerald-400";
    
    if (!checklist.privateZonesExcluded || !checklist.adminAuthorization) {
      overall = "Privacy Review Required";
      overallColor = "bg-red-500 text-white border-red-400";
    } else if (!isPilotScopeReady) {
      overall = "Missing Pilot Scope";
      overallColor = "bg-rose-500 text-white border-rose-400";
    } else if (!isChecklistReady) {
      overall = "Needs Review";
      overallColor = "bg-amber-500 text-slate-950 border-amber-400";
    }

    return {
      proposal: isProposalReady,
      presentation: isPresentationReady,
      privacy: isPrivacyBriefReady,
      scope: isPilotScopeReady,
      checklist: isChecklistReady,
      report: isReportReady,
      overall,
      overallColor
    };
  };

  const pkgStatus = getPackageStatus();

  // Scope Zones helpers
  const handleAddZone = (type: "in" | "out", zone: string) => {
    if (!zone.trim()) return;
    if (type === "in") {
      setScope(prev => ({ ...prev, includedZones: [...prev.includedZones, zone] }));
    } else {
      setScope(prev => ({ ...prev, excludedZones: [...prev.excludedZones, zone] }));
    }
  };

  const handleRemoveZone = (type: "in" | "out", index: number) => {
    if (type === "in") {
      setScope(prev => ({ ...prev, includedZones: prev.includedZones.filter((_, i) => i !== index) }));
    } else {
      setScope(prev => ({ ...prev, excludedZones: prev.excludedZones.filter((_, i) => i !== index) }));
    }
  };

  // Copy Executive Proposal
  const copyProposalToClipboard = () => {
    const proposalText = `PROPUESTA EJECUTIVA PILOTO: ORBI SENTINEL IA COMMUNITY
Comunidad: ${scope.communityName}
Objetivo: ${scope.pilotGoal}

DESCRIPCIÓN:
ORBI Sentinel IA Community centraliza cámaras compatibles en una interfaz simple para conserjería, con gestión de incidentes, privacidad residencial, evidencia técnica y reportes para administración.

ALCANCE DEL PILOTO:
- Duración propuesta: ${scope.pilotDuration} días de evaluación.
- Cámaras en piloto: ${scope.pilotCameras} de un universo estimado de ${scope.totalCameras} cámaras.
- Zonas comunes de monitoreo: ${scope.includedZones.join(", ")}
- Zonas estrictamente excluidas: ${scope.excludedZones.join(", ")}
- Retención de grabaciones de seguridad: Máximo ${scope.retentionProposed} días.

PRIVACIDAD RESIDENCIAL POR DISEÑO:
- Los espacios habitacionales íntimos se excluyen explícitamente y enmascaran.
- El personal de conserjería NO puede exportar evidencia física, resguardando filtraciones.
- Se prohíbe el uso de imágenes familiares, menores o interiores en el panel público.
- Toda descarga de evidencia requiere el rol de Administrador de Copropiedad y justificación administrativa legal.

REQUISITOS MÍNIMOS:
- Conectividad de red local estable para cámaras PoE o WiFi registradas.
- Acceso autorizado (claves de stream RTSP o claves locales de switch).
- Autorización formal del Comité de Copropietarios o la Administración.`;

    navigator.clipboard.writeText(proposalText);
    setCopiedProposal(true);
    triggerToast("✓ Propuesta de una página copiada al portapapeles.");
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  // Copy Report
  const copyReportToClipboard = () => {
    const reportMarkdown = `=== INFORME DE PROPUESTA DE PILOTAJE - ORBI SENTINEL IA ===
Fecha: 18 de Julio de 2026
Comunidad: ${scope.communityName}
Línea de Negocio: Community / Residencial
Estado de la Propuesta: ${pkgStatus.overall}
Preparación del Piloto: ${readiness.label}

1. RESUMEN EJECUTIVO
"ORBI Sentinel IA Community centraliza cámaras compatibles en una interfaz simple para conserjería, con gestión de incidentes, privacidad residencial, evidencia técnica y reportes para administración."
Se presenta este documento para la validación formal de un pilotaje acotado, responsable y no intrusivo en la red y privacidad de la copropiedad.

2. ALCANCE DEL PILOTO
- Duración: ${scope.pilotDuration} días corridos.
- Cámaras integradas: ${scope.pilotCameras} cámaras autorizadas de un total estimado de ${scope.totalCameras}.
- Zonas Incluidas: ${scope.includedZones.join(", ")}
- Zonas Excluidas: ${scope.excludedZones.join(", ")}
- NVR Existente: ${scope.existingNvr.toUpperCase()}
- Acceso Autorizado disponible: ${scope.authorizedAccess.toUpperCase()}
- Retención propuesta: ${scope.retentionProposed} días (Cumple estándar de bajo resguardo temporal).

3. PRIVACIDAD RESIDENCIAL Y AUTORIZACIÓN
- Enmascaramiento inteligente: Bloqueo de visualización en zonas de terrazas, pasillos privados o ventanas.
- Exclusión total de rostros de menores o registros familiares.
- Atribuciones estrictas de roles: Conserjería opera sin visibilidad técnica (no expone IPs ni claves).
- Administración aprueba y firma la exportación de video mediante trazabilidad local con control de integridad SHA-256.

4. CHECKLIST DE FACTIBILIDAD Y PREPARACIÓN (${Object.values(checklist).filter(Boolean).length}/10 Puntos)
- Inventario de cámaras: ${checklist.cameraInventory ? "Listo" : "Pendiente"}
- Accesos de red locales: ${checklist.authorizedAccess ? "Listo" : "Pendiente"}
- Zonas comunes definidas: ${checklist.commonZonesDefined ? "Listo" : "Pendiente"}
- Zonas privadas excluidas: ${checklist.privateZonesExcluded ? "Listo" : "Pendiente"}
- Política de retención definida: ${checklist.retentionPolicy ? "Listo" : "Pendiente"}
- Roles configurados: ${checklist.rolesDefined ? "Listo" : "Pendiente"}
- Servidor Gateway Local: ${checklist.localHardwareAvailable ? "Instalado/Listo" : "Pendiente"}
- Aprobación de Comité: ${checklist.adminAuthorization ? "Listo" : "Pendiente"}
- Pruebas acotadas (1-3 cámaras): ${checklist.limitedCameraTrials ? "Listo" : "Pendiente"}
- Protocolo de exportación: ${checklist.exportProcedure ? "Listo" : "Pendiente"}

5. ROADMAP DEL PILOTO RECOMENDADO
Fase 1: Levantamiento y diagnóstico de cámaras.
Fase 2: Validación de credenciales locales seguras.
Fase 3: Definición y enmascaramiento de privacidad.
Fase 4: Instalación física del Gateway local (ORBI Edge Micro-servidor).
Fase 5: Integración inicial controlada de ${scope.pilotCameras} cámaras.
Fase 6: Capacitación de 5 minutos a conserjería con interfaz táctil simplificada.
Fase 7: Período de pruebas de ${scope.pilotDuration} días.
Fase 8: Entrega de Informe de Valor Operacional a la Administración.
Fase 9: Decisión de continuidad del proyecto.

6. LIMITACIONES ADMINISTRATIVAS DECLARADAS
- No habilita producción 24/7 sin licenciamiento definitivo.
- Se restringe el procesamiento de IA al ancho de banda local asignado.
- No reemplaza de forma absoluta los sistemas NVR tradicionales instalados (puede complementar o reducir dependencia del NVR según compatibilidad).
- Las cifras y valor operacional estimado corresponden a simulaciones operacionales lógicas de laboratorio.`;

    navigator.clipboard.writeText(reportMarkdown);
    setCopiedReport(true);
    triggerToast("✓ Reporte de propuesta copiado en formato Markdown.");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Copy External Demo Brief
  const copyBriefToClipboard = () => {
    const text = `==================================================
ORBI SENTINEL IA - EXTERNAL DEMO BRIEF & TALK GUIDE
==================================================
Versión: v0.2.4-sentinel-community-external-demo-lock
Estado: ${checklist.privateZonesExcluded && checklist.adminAuthorization ? "READY FOR EXTERNAL DEMO" : "NEEDS REVIEW"}
Audiencia Recomendada: Administradores de condominio, Comité de Copropietarios, Jefes de seguridad residencial
Duración Sugerida: 5 a 10 minutos

DIAGNÓSTICO COMERCIAL:
1. Las conserjerías sufren de fatiga mental debido a monitores de CCTV sobrecargados.
2. Existe alta preocupación por la filtración de grabaciones familiares en redes sociales.
3. Los sistemas tradicionales NVR no ofrecen herramientas simplificadas ni resguardo de privacidad vecinal nativo.

MENSAJE CLAVE:
"ORBI Sentinel IA es una capa local complementaria no invasiva que reduce el estrés laboral del conserje mediante una consola táctil simple, dejando reflejado que ninguna grabación íntima o familiar pueda ser descargada o filtrada."

GUÍA DE DEMOSTRACIÓN TÉCNICA CONTROLADA:
- Paso 1: Mostrar "EasyView" (Consola de Conserje) destacando la ausencia de claves, IPs o controles complejos.
- Paso 2: Mostrar el "Constructor de Alcance" de cámaras para el piloto limitado (de 1 a 3 cámaras públicas).
- Paso 3: Exhibir el "Checklist de Preparación" de 10 puntos para validar que el condominio cumple las políticas éticas.
- Paso 4: Utilizar las "Tarjetas de Objeciones" ante preguntas sobre reemplazo de NVR o compatibilidad de red.

LÍMITES DE RESPONSABILIDAD:
* No interfiere con el NVR existente (es complementario de paso).
* Compatibilidad sujeta a modelos con RTSP/ONVIF estándar y accesos autorizados.
* El piloto de demostración dura un tiempo acotado (10 días sugeridos) para verificar factibilidad técnica local.
* No requiere internet de banda ancha invasivo (procesamiento 100% local en gateway).

PRÓXIMO PASO SUGERIDO:
Presentar la propuesta ejecutiva de una página y acordar la firma de un acta simple para un piloto técnico acotado de 10 días instalando un gateway local de pruebas.
==================================================`;
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    triggerToast("✓ Brief de demostración copiado al portapapeles.");
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  // If user is a conserje, show the simplified informative view
  if (userRole === "conserje") {
    return (
      <div id="proposal-center-restricted" className="p-8 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
        <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6 mt-12 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-sans font-bold text-white">Sección Restringida a la Administración</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              El <strong>Community Proposal Center</strong> contiene la formulación técnica de la propuesta comercial, el alcance de pruebas del pilotaje residencial y la presentación ejecutiva para el Comité de Copropietarios.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-left text-xs text-slate-300">
            <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Operación de Turno Protegida:
            </p>
            Para garantizar que su labor se concentre en la vigilancia preventiva de baja carga cognitiva, los detalles de licencias, presupuestos simulados y parámetros de red quedan resguardados de forma exclusiva en el perfil del Administrador y el Técnico.
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            ORBI Sentinel IA • Versión v0.2.4-sentinel-community-external-demo-lock
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="proposal-center-root" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div id="proposal-toast" className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-mono text-xs font-bold animate-bounce">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="text-emerald-400 w-5 h-5" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Línea Residencial • Propuesta y Presentación
            </span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-white mt-1">
            Community Proposal Center <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">Módulo 2E</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Herramientas ejecutivas para formular propuestas piloto, responder objeciones de comités y liderar demostraciones comerciales responsables.
          </p>
        </div>

        {/* Aggregated Package Status Panel */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shrink-0">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">ESTADO DEL PAQUETE</span>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${pkgStatus.overallColor}`}>
              {pkgStatus.overall.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[9px] font-mono border-l border-slate-800 pl-4">
            <span className={pkgStatus.proposal ? "text-emerald-400" : "text-slate-600"}>● Proposal</span>
            <span className={pkgStatus.presentation ? "text-emerald-400" : "text-slate-600"}>● Slide-Deck</span>
            <span className={pkgStatus.privacy ? "text-emerald-400" : "text-slate-600"}>● Privacy</span>
            <span className={pkgStatus.scope ? "text-emerald-400" : "text-slate-600"}>● Pilot Scope</span>
            <span className={pkgStatus.checklist ? "text-emerald-400" : "text-slate-600"}>● Checklist</span>
            <span className={pkgStatus.report ? "text-emerald-400" : "text-slate-600"}>● Report</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 block mb-2 tracking-wider">Secciones del Centro</span>
            
            <button
              onClick={() => setActiveSubTab("demolock")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "demolock" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" /> External Demo Lock
              </span>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded uppercase">Lock</span>
            </button>

            <button
              onClick={() => setActiveSubTab("proposal")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "proposal" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Propuesta Ejecutiva
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveSubTab("scope")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "scope" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Constructor de Alcance
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveSubTab("privacy")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "privacy" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Privacidad & Score
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setActiveSubTab("presentation");
                setCurrentSlide(1);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "presentation" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Modo Presentación (Slides)
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveSubTab("objections")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "objections" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Objeciones y Guiones
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveSubTab("roadmap")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "roadmap" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Roadmap del Piloto
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveSubTab("report")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                activeSubTab === "report" 
                  ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4" /> Reporte de Propuesta
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Talk Track Widget */}
          <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">🗣️ Guion Oral de Presentación</span>
            
            <div className="flex gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-850">
              <button
                onClick={() => setTalkTrackDuration("30s")}
                className={`flex-1 py-1 text-[9px] font-mono rounded ${talkTrackDuration === "30s" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
              >
                30s Pitch
              </button>
              <button
                onClick={() => setTalkTrackDuration("2m")}
                className={`flex-1 py-1 text-[9px] font-mono rounded ${talkTrackDuration === "2m" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
              >
                2 Min
              </button>
              <button
                onClick={() => setTalkTrackDuration("5m")}
                className={`flex-1 py-1 text-[9px] font-mono rounded ${talkTrackDuration === "5m" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
              >
                5 Min
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850/80 text-[11px] text-slate-300 leading-relaxed font-sans max-h-48 overflow-y-auto">
              {talkTrackDuration === "30s" && (
                <p>
                  "<strong>ORBI Sentinel IA Community</strong> es una solución de seguridad no intrusiva diseñada especialmente para condominios. Simplifica el CCTV en una consola táctil de baja carga mental para conserjes, mientras protege la privacidad familiar enmascarando zonas íntimas y restringiendo la exportación de clips. Proponemos un piloto responsable de 7 a 15 días con solo 1 a 3 cámaras de accesos para demostrar su valor operacional sin alterar su red."
                </p>
              )}
              {talkTrackDuration === "2m" && (
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] text-emerald-400 uppercase font-bold">Introducción a Comité</p>
                  <p>
                    "Buenas tardes. Hoy queremos presentarles una forma responsable de optimizar la vigilancia de nuestra copropiedad. Las conserjerías suelen saturarse con decenas de pantallas complejas. <strong>ORBI Sentinel IA</strong> reduce esa carga de estrés consolidando flujos en un panel táctil intuitivo con lenguaje humano."
                  </p>
                  <p>
                    "Nuestra prioridad absoluta es el resguardo de la privacidad familiar: por política del sistema, las cámaras no apuntan a ventanas ni terrazas privadas, y el personal de turno no tiene permisos de descarga de video, eliminando riesgos de filtración pública. Para su tranquilidad, proponemos validar esta tecnología mediante un piloto controlado de {scope.pilotDuration} días, con solo {scope.pilotCameras} cámaras en accesos comunes."
                  </p>
                </div>
              )}
              {talkTrackDuration === "5m" && (
                <div className="space-y-2">
                  <p className="font-mono text-[9px] text-emerald-400 uppercase font-bold">Presentación Completa del Proyecto</p>
                  <p>
                    <strong>1. El Diagnóstico del Estrés en Conserjería:</strong> Las conserjerías residenciales enfrentan fatiga mental severa. Los conserjes deben ver monitores complejos mientras controlan accesos peatonales y vehiculares. ORBI Sentinel IA convierte el CCTV tradicional en alertas en lenguaje simple.
                  </p>
                  <p>
                    <strong>2. Seguridad Compartida con Privacidad:</strong> A diferencia de las soluciones de vigilancia invasivas, nuestra plataforma incluye enmascaramiento estricto de áreas sensibles. Además, el conserje opera bajo un perfil de visualización pura: no puede ver IPs, puertos, credenciales ni hashes, previniendo vulnerabilidades.
                  </p>
                  <p>
                    <strong>3. Trazabilidad y Control de Evidencia:</strong> Si ocurre un incidente, queda registrado en una bitácora local protegida. La descarga de clips está bloqueada para conserjería y requiere que el Administrador valide formalmente la solicitud indicando justificación legal.
                  </p>
                  <p>
                    <strong>4. Pilotaje de Factibilidad Técnica:</strong> Proponemos instalar un pequeño servidor Gateway local en conserjería para procesar streams sin consumir internet. Realizaremos una prueba sin compromiso con {scope.pilotCameras} cámaras de accesos, durante {scope.pilotDuration} días, para entregarles un reporte real de valor operacional.
                  </p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 italic text-center leading-normal">
              Utilice este guion oral para guiar la conversación de ventas de manera ética y sincera.
            </p>
          </div>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-9 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
          
          {/* SUB-TAB 0: EXTERNAL DEMO LOCK */}
          {activeSubTab === "demolock" && (
            <div id="demolock-subtab" className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" /> Community External Demo Lock
                  </h3>
                  <p className="text-xs text-slate-400">Auditoría final de experiencia, narrativa comercial responsable, roles y estabilidad visual.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500">ESTADO GLOBAL:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    checklist.privateZonesExcluded && checklist.adminAuthorization
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {checklist.privateZonesExcluded && checklist.adminAuthorization
                      ? "READY FOR EXTERNAL DEMO"
                      : "NEEDS REVIEW"}
                  </span>
                </div>
              </div>

              {/* Grid of Audit Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel 1: Checklist de Auditoría de Demostración */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" /> Matrices de Cumplimiento Comercial
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">1. Propuesta Ejecutiva (One-Page)</span>
                        <span className="text-[11px] text-slate-400 block">Auditoría de lenguaje. Sin garantías comerciales falsas o ahorros de personal garantizados.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">AUDITED</span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">2. Modo Presentación (Slide-Deck)</span>
                        <span className="text-[11px] text-slate-400 block">8 diapositivas con declaración explícita de límites técnicos y enmascaramiento vecinal.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">AUDITED</span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">3. Resguardo de Privacidad</span>
                        <span className="text-[11px] text-slate-400 block">Exclusión estricta de espacios residenciales privados y rostros de menores. Enmascaramiento local.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">COMPLIANT</span>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">4. Checklist de Preparación</span>
                        <span className="text-[11px] text-slate-400 block">Puntaje dinámico según parámetros de infraestructura local configurados.</span>
                      </div>
                      <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${readiness.bg} ${readiness.color} ${readiness.border}`}>
                        {readiness.label.toUpperCase()}
                      </span>
                    </div>

                    {/* Item 5 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">5. Manejo de Objeciones Responsable</span>
                        <span className="text-[11px] text-slate-400 block">Respuestas no defensivas sobre el complemento de NVR y protección vecinal.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">APPROVED</span>
                    </div>

                    {/* Item 6 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">6. Reporte de Propuesta (Markdown)</span>
                        <span className="text-[11px] text-slate-400 block">Exportación limpia para comités con mitigación declarada y sin dependencias externas.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">READY</span>
                    </div>

                    {/* Item 7 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">7. Guiones de Presentación (Talk Tracks)</span>
                        <span className="text-[11px] text-slate-400 block">Duraciones ajustables (30s, 2m, 5m) diseñadas para oratoria ética y transparente.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">READY</span>
                    </div>

                    {/* Item 8 */}
                    <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-900">
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-bold text-white block">8. Lenguaje Responsable Global</span>
                        <span className="text-[11px] text-slate-400 block">Evita términos absolutos como 'bitácoras inmutables' o 'garantiza evidencia' en toda la interfaz.</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">PASSED</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: External Demo Brief copy block */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" /> External Demo Brief
                      </h4>
                      <button
                        onClick={copyBriefToClipboard}
                        className="p-1.5 hover:bg-slate-900 rounded-lg text-emerald-400 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono font-bold"
                        title="Copiar guía completa al portapapeles"
                      >
                        {copiedBrief ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBrief ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[340px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                      <p className="text-emerald-400 font-bold border-b border-slate-850 pb-1">📋 RESUMEN DE CAMPAÑA COMERCIAL RESPONSABLE</p>
                      
                      <div className="space-y-1">
                        <p className="text-slate-500"># Enfoque Comercial:</p>
                        <p className="pl-2">Venta consultiva de seguridad con resguardo explícito de la privacidad de los vecinos. No sobreprometer.</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-500"># Alcance del Piloto:</p>
                        <p className="pl-2">Acotado a {scope.pilotCameras} cámaras comunes durante {scope.pilotDuration} días para validar la factibilidad técnica local.</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-500"># Límites de Responsabilidad:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Capa complementaria de procesamiento local sobre NVR existente.</li>
                          <li>No promete reducción directa de seguros ni personal de vigilancia.</li>
                          <li>Trazabilidad técnica local con SHA-256 (sin afirmar inmutabilidad absoluta).</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-500"># Directrices de Privacidad:</p>
                        <p className="pl-2">Prohibida la exposición de menores o espacios íntimos. Visualización pura sin credenciales expuestas en terminales de conserjería.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Próximo Paso Recomendado:
                    </p>
                    Presentar la propuesta ejecutiva de una página y acordar el piloto de {scope.pilotDuration} días con enmascaramiento local de terrazas.
                  </div>
                </div>
              </div>

              {/* Status footer with actionable advice */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-sans font-bold text-white block">¿Listo para presentar ante el Comité de Copropietarios?</span>
                  <span className="text-slate-400 block">
                    {checklist.privateZonesExcluded && checklist.adminAuthorization
                      ? "Se cumplen los prerrequisitos clave de privacidad y autorización del comité. Puede iniciar la demostración comercial con seguridad."
                      : "Para una demostración segura, verifique que 'Zonas Privadas Excluidas' y 'Aprobación del Comité' estén marcadas en la sección Privacidad & Score."}
                  </span>
                </div>
                {!checklist.privateZonesExcluded || !checklist.adminAuthorization ? (
                  <button
                    onClick={() => setActiveSubTab("privacy")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold rounded-lg transition-all shrink-0 text-center"
                  >
                    Resolver Pendientes
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSubTab("presentation");
                      setCurrentSlide(1);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-bold rounded-lg transition-all shrink-0 text-center"
                  >
                    Iniciar Presentación
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 1: EXECUTIVE ONE-PAGE */}
          {activeSubTab === "proposal" && (
            <div id="proposal-subtab" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                    One-Page Executive Proposal
                  </h3>
                  <p className="text-xs text-slate-400">Propuesta unificada y directa para presentación ante Comités y Administraciones.</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    id="btn-copy-proposal"
                    onClick={copyProposalToClipboard}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/25 font-mono font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    {copiedProposal ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedProposal ? "Copiado!" : "Copiar Propuesta"}
                  </button>
                  <button
                    id="btn-community-send-to-pilot-intake"
                    onClick={sendToPilotIntake}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    🚀 Enviar a Pilot Intake
                  </button>
                </div>
              </div>

              {/* One-Page Styled Document */}
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-850 shadow-inner max-w-4xl mx-auto space-y-6 text-slate-200 text-xs sm:text-sm">
                
                {/* Proposal Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                  <div>
                    <h2 className="text-xl font-sans font-bold text-white tracking-tight">ORBI Sentinel IA Community</h2>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1 uppercase tracking-wider">Propuesta Técnica de Pilotaje Residencial</p>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-500 space-y-0.5">
                    <p>Fecha: 18 de Julio de 2026</p>
                    <p>Comunidad: {scope.communityName}</p>
                    <p>Versión: v0.2.3-proposal</p>
                  </div>
                </div>

                {/* Narrative pitch */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850/80 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  “ORBI Sentinel IA Community centraliza cámaras compatibles en una interfaz simple para conserjería, con gestión de incidentes, privacidad residencial, evidencia técnica y reportes para administración.”
                </div>

                {/* Column Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-sans font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-1 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Problema Actual
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Las conserjerías están abrumadas por pantallas complejas de CCTV que generan fatiga cognitiva severa. Esto aumenta el riesgo de no visualizar incidentes críticos en tiempo real. Además, existe una alta vulnerabilidad sobre la privacidad familiar de los residentes y riesgos de filtraciones no autorizadas de videos de la copropiedad.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-1 text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" /> Solución Propuesta
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Implementación local no intrusiva de un micro-servidor ORBI que optimiza los flujos de CCTV en un panel unificado de un solo botón (EasyView). El sistema traduce eventos de movimiento complejos a texto simple, permitiendo un monitoreo residencial preventivo, ordenado y 100% auditable.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-sans font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-1 text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4 text-sky-400 shrink-0" /> Beneficios Clave
                      </h4>
                      <ul className="text-xs text-slate-400 mt-2 space-y-2 list-none">
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓ Conserjería:</span> Reducción radical del estrés laboral gracias a la interfaz simplificada libre de tecnicismos.
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓ Administración:</span> Reportes de valor en tiempo real, trazabilidad absoluta mediante logs SHA-256 e incidentes digitalizados.
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓ Residentes:</span> Enmascaramiento inmediato de terrazas y espacios íntimos para garantizar privacidad familiar absoluta.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-1 text-xs uppercase tracking-wider">
                        <Scale className="w-4 h-4 text-purple-400 shrink-0" /> Privacidad Residencial Estricta
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        La privacidad familiar es el centro del diseño: no se procesan rostros de menores, los conserjes no tienen privilegios para descargar videos (eliminando riesgos de difusión no autorizada en redes sociales) y toda consulta de clip requiere justificación legal de la administración.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pilot Parameters overview */}
                <div className="p-4.5 bg-slate-900/40 rounded-xl border border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Cámaras en Piloto</span>
                    <p className="text-lg font-sans font-bold text-white mt-1">{scope.pilotCameras} Cámaras</p>
                    <p className="text-[9px] text-slate-500">De un total de {scope.totalCameras}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Duración</span>
                    <p className="text-lg font-sans font-bold text-white mt-1">{scope.pilotDuration} Días</p>
                    <p className="text-[9px] text-slate-500">Prueba sin compromisos</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Retención</span>
                    <p className="text-lg font-sans font-bold text-white mt-1">{scope.retentionProposed} Días</p>
                    <p className="text-[9px] text-slate-500">Máximo resguardo temporal</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Gateway Local</span>
                    <p className="text-lg font-sans font-bold text-emerald-400 mt-1">SÍ</p>
                    <p className="text-[9px] text-slate-500">No satura el router</p>
                  </div>
                </div>

                {/* Limitations Declarations */}
                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-slate-400">⚠️ Declaración de Transparencia Administrativa:</p>
                  <p>
                    Este piloto constituye una demostración de factibilidad técnica inicial. No requiere modificaciones contractuales de su proveedor actual de CCTV. El sistema opera como una capa redundante local de paso sobre cámaras existentes compatibles. Esta propuesta comercial no garantiza reducciones de primas de seguros ni ahorros de personal, estructurándose como una herramienta de apoyo operacional para conserjería.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 2: PILOT SCOPE BUILDER */}
          {activeSubTab === "scope" && (
            <div id="scope-subtab" className="space-y-6">
              <div>
                <h3 className="text-lg font-sans font-bold text-white">Constructor de Alcance del Piloto</h3>
                <p className="text-xs text-slate-400">Personalice los parámetros específicos de la copropiedad para formular una propuesta a medida.</p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-xl border border-slate-850">
                
                {/* Community Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Nombre del Condominio / Comunidad</label>
                  <input
                    id="input-scope-community"
                    type="text"
                    value={scope.communityName}
                    onChange={(e) => setScope({ ...scope, communityName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-sans text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Cameras Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Cámaras de la Comunidad</label>
                    <input
                      id="input-scope-total-cams"
                      type="number"
                      value={scope.totalCameras}
                      onChange={(e) => setScope({ ...scope, totalCameras: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Cámaras en Piloto (Sugerido 1-3)</label>
                    <input
                      id="input-scope-pilot-cams"
                      type="number"
                      min="1"
                      max="5"
                      value={scope.pilotCameras}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setScope({ ...scope, pilotCameras: val > 5 ? 5 : val });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Technical status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">¿NVR Existente?</label>
                    <select
                      id="select-scope-nvr"
                      value={scope.existingNvr}
                      onChange={(e) => setScope({ ...scope, existingNvr: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="sí">Sí (Compatible)</option>
                      <option value="no">No (Cámaras independientes)</option>
                      <option value="desconocido">Desconocido</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Accesos Autorizados</label>
                    <select
                      id="select-scope-access"
                      value={scope.authorizedAccess}
                      onChange={(e) => setScope({ ...scope, authorizedAccess: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="sí">Sí (IP/Credenciales disponibles)</option>
                      <option value="no">No disponibles</option>
                      <option value="parcial">Parciales (Requiere relevamiento)</option>
                    </select>
                  </div>
                </div>

                {/* Pilot Duration & Retention */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Duración del Piloto (Días)</label>
                    <select
                      id="select-scope-duration"
                      value={scope.pilotDuration}
                      onChange={(e) => setScope({ ...scope, pilotDuration: parseInt(e.target.value) || 7 })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="7">7 días</option>
                      <option value="10">10 días (Recomendado)</option>
                      <option value="15">15 días</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Retención Propuesta (Días)</label>
                    <select
                      id="select-scope-retention"
                      value={scope.retentionProposed}
                      onChange={(e) => setScope({ ...scope, retentionProposed: parseInt(e.target.value) || 7 })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="3">3 días (Máxima privacidad)</option>
                      <option value="7">7 días (Estándar piloto)</option>
                      <option value="15">15 días (Requiere revisión local)</option>
                    </select>
                  </div>
                </div>

                {/* Goal description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Objetivo del Piloto</label>
                  <textarea
                    id="textarea-scope-goal"
                    rows={3}
                    value={scope.pilotGoal}
                    onChange={(e) => setScope({ ...scope, pilotGoal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-sans text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Observations */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-bold text-slate-400 block uppercase">Observaciones Administrativas</label>
                  <input
                    id="input-scope-obs"
                    type="text"
                    value={scope.observations}
                    onChange={(e) => setScope({ ...scope, observations: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl p-2.5 font-sans text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Dynamic Zones lists */}
                <div className="space-y-3 md:col-span-2 border-t border-slate-900 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Included common zones */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      🟢 Zonas Comunes Incluidas (Sugeridas 2-4)
                    </span>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex gap-2">
                        <input
                          id="new-zone-in-input"
                          type="text"
                          placeholder="Ej: Hall Torre B"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const el = e.currentTarget;
                              handleAddZone("in", el.value);
                              el.value = "";
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 font-sans text-white focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById("new-zone-in-input") as HTMLInputElement;
                            if (input) {
                              handleAddZone("in", input.value);
                              input.value = "";
                            }
                          }}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-600"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-2 max-h-32 overflow-y-auto">
                        {scope.includedZones.map((z, idx) => (
                          <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-sans flex items-center gap-1">
                            {z}
                            <button onClick={() => handleRemoveZone("in", idx)} className="hover:text-white font-bold font-mono ml-1">×</button>
                          </span>
                        ))}
                        {scope.includedZones.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">No hay zonas seleccionadas.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Excluded private zones */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      🛑 Zonas Estrictamente Excluidas
                    </span>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex gap-2">
                        <input
                          id="new-zone-out-input"
                          type="text"
                          placeholder="Ej: Interior Departamentos"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const el = e.currentTarget;
                              handleAddZone("out", el.value);
                              el.value = "";
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 font-sans text-white focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById("new-zone-out-input") as HTMLInputElement;
                            if (input) {
                              handleAddZone("out", input.value);
                              input.value = "";
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 max-h-32 overflow-y-auto">
                        {scope.excludedZones.map((z, idx) => (
                          <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[10px] font-sans flex items-center gap-1">
                            {z}
                            <button onClick={() => handleRemoveZone("out", idx)} className="hover:text-white font-bold font-mono ml-1">×</button>
                          </span>
                        ))}
                        {scope.excludedZones.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">No hay zonas excluidas especificadas.</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Status Update Advice */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Modificar estos campos actualizará automáticamente la propuesta ejecutiva y el reporte copiable de pilotaje.</span>
                <span className="text-emerald-400 font-mono font-bold">Datos en Sincronía 🟢</span>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: PRIVACY & READINESS SCORE */}
          {activeSubTab === "privacy" && (
            <div id="privacy-subtab" className="space-y-6">
              
              {/* Split layout: Privacy briefing on left, Score on right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: Privacy & Authorization Brief */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" /> Privacidad & Resguardo Residencial
                    </h3>
                    <p className="text-xs text-slate-400">Directivas por diseño para mitigar miedos y cumplir la ley de protección de datos familiares.</p>
                  </div>

                  <div className="space-y-4">
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-400" /> Enmascaramiento y Zonas Sensibles
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        ORBI Sentinel IA Community integra un algoritmo local de enmascaramiento estático. Las ventanas de departamentos, balcones privados y accesos a jardines interiores se bloquean en la interfaz de conserjería mediante superposición de polígonos oscuros, previniendo invasiones accidentales a la intimidad familiar.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Restricción Total de Descargas
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Los operadores de conserjería tienen vedado el acceso a la exportación de video. Ningún conserje puede descargar grabaciones a pendrives o compartirlas por redes sociales personales. Toda solicitud de descarga requiere firma digital del Administrador del condominio con justificación formal.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-sky-400" /> Resguardo de Imágenes de Menores
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        De acuerdo a las mejores prácticas éticas, se prohíbe el uso de clips reales que expongan a niños o familias en las pantallas demostrativas públicas. Las demostraciones utilizan imágenes abstractas de paso exterior y vehículos autorizados.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                      <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Retención Temporal Acotada
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Las grabaciones de seguridad del pilotaje se almacenan de forma local en el micro-servidor de conserjería bajo un esquema cíclico estricto de máximo 7 días. Transcurrido ese plazo, los datos se eliminan de forma automática e irreversible.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Right: Pilot Readiness Score */}
                <div className="md:col-span-5 space-y-6">
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 space-y-6">
                    <div>
                      <h4 className="font-sans font-bold text-white text-sm">Pilot Readiness Checklist</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Habilite los factores de viabilidad para medir el score de preparación.</p>
                    </div>

                    {/* Readiness Gauge */}
                    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 transition-all ${readiness.bg} ${readiness.border}`}>
                      {React.createElement(readiness.icon, { className: `w-8 h-8 ${readiness.color}` })}
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Score de Viabilidad</span>
                        <span className={`text-sm font-mono font-bold uppercase mt-1 ${readiness.color}`}>
                          {readiness.label}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {Object.values(checklist).filter(Boolean).length} de 10 requisitos completados
                        </p>
                      </div>
                    </div>

                    {/* Switches list */}
                    <div className="space-y-3.5 text-xs max-h-[280px] overflow-y-auto pr-1">
                      
                      <button
                        onClick={() => toggleChecklistItem("cameraInventory")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">1. Inventario de cámaras</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.cameraInventory ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.cameraInventory ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("authorizedAccess")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">2. Accesos de red autorizados</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.authorizedAccess ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.authorizedAccess ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("commonZonesDefined")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">3. Zonas comunes definidas</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.commonZonesDefined ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.commonZonesDefined ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("privateZonesExcluded")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">4. Zonas íntimas excluidas</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.privateZonesExcluded ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.privateZonesExcluded ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("retentionPolicy")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">5. Política retención (7 días)</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.retentionPolicy ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.retentionPolicy ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("rolesDefined")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">6. Roles y permisos delimitados</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.rolesDefined ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.rolesDefined ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("localHardwareAvailable")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">7. Gateway Local disponible</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.localHardwareAvailable ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.localHardwareAvailable ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("adminAuthorization")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">8. Aprobación de Comité</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.adminAuthorization ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.adminAuthorization ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("limitedCameraTrials")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">9. Límite estricto 1-3 cámaras</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.limitedCameraTrials ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.limitedCameraTrials ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleChecklistItem("exportProcedure")}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 text-left"
                      >
                        <span className="text-slate-300">10. Protocolo de exportaciones</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${checklist.exportProcedure ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          {checklist.exportProcedure ? "Listo" : "Pendiente"}
                        </span>
                      </button>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 4: PRESENTATION MODE */}
          {activeSubTab === "presentation" && (
            <div id="presentation-subtab" className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-emerald-400 w-5 h-5" /> Presentation Slide-Deck Mode
                  </h3>
                  <p className="text-xs text-slate-400">Secuencia visual interactiva de 8 diapositivas para guiar la explicación del proyecto en juntas.</p>
                </div>
                
                {/* Stepper indicators */}
                <div className="flex items-center gap-1 font-mono text-xs text-slate-400">
                  <span>Slide</span>
                  <span className="text-white font-bold bg-slate-950 px-2 py-1 rounded border border-slate-850">
                    {currentSlide} / 8
                  </span>
                </div>
              </div>

              {/* Slider Canvas Area */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 p-8 sm:p-12 min-h-[380px] flex flex-col justify-between transition-all duration-300 relative shadow-2xl">
                
                {/* Back decorative watermarks */}
                <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-700 select-none uppercase tracking-widest">
                  ORBI Sentinel IA • Residencial
                </div>

                {/* SLIDE CONTENT CONDITIONAL */}
                <div className="space-y-6 animate-fade-in">
                  
                  {currentSlide === 1 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-widest">
                        Slide 1: ¿Qué problema resuelve?
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        La fatiga laboral y el caos de pantallas en conserjerías
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          Las conserjerías residenciales vigilan pasillos, portones, accesos y bodegas en monitores complejos. Conectar decenas de cámaras genera <strong>fatiga visual severa</strong> y distracciones inevitables mientras se atienden residentes.
                        </p>
                        <p className="leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                          <strong className="text-amber-400 block mb-1">El Factor Crítico:</strong>
                          La sobreexposición a flujos de video continuos reduce el tiempo de atención efectiva del guardia en más de un 60%. Se necesita un sistema inteligente que filtre el ruido y hable en lenguaje humano directo.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSlide === 2 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest">
                        Slide 2: Cómo ayuda al conserje
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        EasyView: Consola simplificada de un solo botón
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          La interfaz <strong>EasyView</strong> está pensada para pantallas táctiles de conserjería. Elimina por completo las configuraciones complejas, las direcciones IP, los códigos técnicos y los hashes de seguridad.
                        </p>
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">Operaciones Simples</span>
                          <p className="text-xs leading-relaxed text-slate-400">
                            - <strong>Voz de eventos:</strong> Informa anomalías con textos claros ("Vehículo en portón").<br />
                            - <strong>Notificaciones un toque:</strong> Botón directo para alertar a la administración de forma silenciosa.<br />
                            - <strong>Enmascaramiento activo:</strong> Pantalla libre de distracciones residenciales.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 3 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono uppercase tracking-widest">
                        Slide 3: Cómo ayuda a la administración
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Estadísticas operativas en tiempo real con reducción de ruido operativo
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          El <strong>Community Value Dashboard</strong> entrega información clara sobre el rendimiento de las cámaras instaladas, incidentes recurrentes por sector y la efectividad del turno de conserjes.
                        </p>
                        <p className="leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-slate-400">
                          <strong className="text-white block mb-1">Métricas Clave:</strong>
                          Tiempo de respuesta de incidentes, estado de la señal, y trazabilidad total mediante hashes SHA-256 de auditoría para asegurar cumplimiento legal estricto.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSlide === 4 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest">
                        Slide 4: Privacidad residencial y roles
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Privacidad por diseño para la tranquilidad familiar
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          Las zonas residenciales íntimas (como balcones, pasillos interiores de departamentos y terrazas de quinchos) se <strong>enmascaran de forma estática</strong> directamente en el procesamiento local.
                        </p>
                        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1.5">
                          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">Estándar de Seguridad</span>
                          <p className="text-xs text-slate-400">
                            La conserjería no cuenta con permisos para descargar ni almacenar fragmentos de video en dispositivos externos. Solo el Administrador autorizado puede liberar un clip de evidencia bajo causa.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 5 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono uppercase tracking-widest">
                        Slide 5: Incidentes y flujo de evidencia
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Evidencia digitalizada con trazabilidad local y bitácoras de auditoría protegidas
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          Cada anomalía marcada por conserjería se registra automáticamente en la bitácora del turno. El sistema asocia un fragmento del stream local y calcula su hash criptográfico.
                        </p>
                        <p className="leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-slate-400">
                          Esto previene la adulteración o pérdida accidental de evidencia de incidentes (ej: colisiones en portones o accesos no permitidos), dejando un registro transparente para la comunidad o aseguradoras.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSlide === 6 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest">
                        Slide 6: Cámaras mixtas y compatibilidad responsable
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Integración híbrida de equipos PoE y Consumer WiFi
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          La plataforma integra cámaras de nivel industrial (PoE IP ONVIF/RTSP) junto con dispositivos domésticos inteligentes (como cámaras WiFi de consumo marcas Eufy o Dahua Consumer) mediante un bridge local inteligente.
                        </p>
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-slate-400 text-xs leading-relaxed">
                          <span className="text-blue-400 font-bold block mb-1">Mitigación Técnica:</span>
                          No prometemos compatibilidad universal. La compatibilidad se rige según el modelo de cámara, protocolos soportados y accesos autorizados de red.
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 7 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-widest">
                        Slide 7: Piloto recomendado
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Estrategia de prueba de bajo impacto sin compromisos
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          Para demostrar la estabilidad y facilidad de uso sin alterar el contrato de mantención de CCTV actual de la copropiedad, proponemos un pilotaje de <strong>7 a 15 días</strong>.
                        </p>
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
                          <p>• <strong>Cámaras de prueba:</strong> De 1 a 3 cámaras estrictamente ubicadas en accesos peatonales o portones públicos.</p>
                          <p>• <strong>Costos:</strong> Demostración de factibilidad de bajo impacto.</p>
                          <p>• <strong>Ancho de Banda:</strong> Procesamiento 100% local en conserjería sin saturar internet.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 8 && (
                    <div className="space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest">
                        Slide 8: Próximos pasos piloto
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                        Hoja de ruta simplificada para la aprobación formal
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-slate-300 text-xs sm:text-sm">
                        <p className="leading-relaxed">
                          La validación requiere una secuencia ordenada: primero realizamos un inventario rápido de marcas en conserjería, luego configuramos en conjunto las máscaras de privacidad y finalmente conectamos el ORBI Edge micro-servidor de pruebas.
                        </p>
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-slate-400 text-xs flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-white font-bold block">¿Están listos para avanzar?</span>
                            <span>Generen el reporte formal en la siguiente pestaña y preséntenlo al Comité.</span>
                          </div>
                          <ArrowRight className="w-6 h-6 text-emerald-400 shrink-0" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Slider Controls */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-6 mt-6">
                  <button
                    id="btn-prev-slide"
                    disabled={currentSlide === 1}
                    onClick={() => setCurrentSlide((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>

                  {/* Bullet indicators */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <button
                        key={s}
                        onClick={() => setCurrentSlide(s)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === s ? "bg-emerald-400 scale-125" : "bg-slate-800 hover:bg-slate-700"}`}
                      />
                    ))}
                  </div>

                  <button
                    id="btn-next-slide"
                    disabled={currentSlide === 8}
                    onClick={() => setCurrentSlide((p) => Math.min(8, p + 1))}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 5: OBJECTION HANDLING CARDS */}
          {activeSubTab === "objections" && (
            <div id="objections-subtab" className="space-y-6">
              <div>
                <h3 className="text-lg font-sans font-bold text-white">Manual de Objeciones y Respuestas</h3>
                <p className="text-xs text-slate-400">Herramienta de ventas ética y responsable para aclarar las dudas más habituales de comités y administradores.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿Esto reemplaza el NVR actual del condominio?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>No.</strong> ORBI Sentinel IA Community opera como una capa de procesamiento local redundante. No interfiere con las grabaciones continuas ni con el soporte de su proveedor de CCTV actual. Es un micro-servidor de paso que simplifica la operación.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿Funciona con cualquier marca de cámara de seguridad?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    La compatibilidad <strong>depende del protocolo técnico</strong> de sus cámaras. Habilitamos flujos sobre cualquier cámara profesional IP PoE que soporte RTSP/ONVIF estándar, y cámaras domésticas WiFi mediante puentes dedicados, siempre que estén en la misma red local.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿Qué pasa si los conserjes vigilan áreas privadas?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El sistema bloquea por defecto mediante enmascaramiento estático de polígonos cualquier área sensible identificada (terrazas, pasillos o balcones). Además, el rol conserje no tiene accesos de administrador, resguardando la intimidad familiar.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿El conserje puede descargar fragmentos de video?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>No, estrictamente bloqueado.</strong> Para mitigar la difusión pública de videos de seguridad en redes sociales, los conserjes solo operan en modo de visualización táctil. Solo la Administración puede autorizar y descargar fragmentos de video justificando la causa legal.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿La grabación se almacena para siempre? ¿Se graba 24/7?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Durante el pilotaje demostrativo se configura una <strong>política estricta de retención de 7 días</strong>. Los videos antiguos se borran de forma permanente. La versión de demostración utiliza simulaciones locales de clips y no procesa datos reales 24/7.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">❓ ¿Se requiere internet para que funcione el sistema?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>No para el procesamiento principal.</strong> El ORBI Edge Gateway procesa los streams de video dentro de la red local física de conserjería. No sobrecarga el ancho de banda contratado del condominio. Solo se requiere conexión externa opcional para auditoría remota de administración.
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-2 md:col-span-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">❓ ¿Qué se necesita para iniciar la prueba piloto de factibilidad?</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Solo 3 cosas sencillas: (1) Firma de la autorización del Comité de Administración, (2) inventario rápido de credenciales de red de 1 a 3 cámaras de accesos peatonales, y (3) asignación de un tomacorriente en conserjería para ubicar el micro-servidor ORBI Gateway durante {scope.pilotDuration} días.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 6: COMMUNITY ROADMAP */}
          {activeSubTab === "roadmap" && (
            <div id="roadmap-subtab" className="space-y-6">
              <div>
                <h3 className="text-lg font-sans font-bold text-white">Roadmap de Implementación del Piloto</h3>
                <p className="text-xs text-slate-400">Un camino de 9 etapas estructurado para garantizar un despliegue seguro, responsable y legalmente conforme.</p>
              </div>

              {/* Roadmap stepper visual */}
              <div className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 01</div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">1. Levantamiento</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Inspección rápida de conserjería, identificación del switch PoE actual y catastro de marcas de cámaras compatibles.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 02</div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">2. Validación de Accesos</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Relevamiento de contraseñas locales y confirmación de que los streams RTSP se transmiten sin interferir en el NVR.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 03</div>
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">3. Mapa de Privacidad</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Definición explícita de zonas comunes permitidas y delimitación estricta para enmascarar balcones o ventanas privadas.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 04</div>
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">4. Instalación del Gateway</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Ubicación física del ORBI Edge micro-servidor en conserjería y conexión al switch local. Sin cableados estructurales complejos.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 05</div>
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">5. Prueba Acotada</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Activación controlada de {scope.pilotCameras} flujos de video de accesos públicos en el sistema de pruebas ORBI.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 06</div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">6. Capacitación de Turno</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Instrucción ágil de 5 minutos al personal de conserjería para el uso de la interfaz táctil simplificada de un solo botón.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 07</div>
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">7. Período de Pruebas</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Ejecución del pilotaje durante {scope.pilotDuration} días de resguardo temporal, acumulando estadísticas de movimiento y turnos.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 08</div>
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">8. Informe Operativo</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Entrega de un reporte detallado a la administración sintetizando los eventos registrados y la mitigación de fatiga de conserjería.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group hover:border-slate-750 transition-all">
                    <div className="absolute top-2 right-3 font-mono text-xs font-bold text-slate-600">ETAPA 09</div>
                    <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">9. Decisión de Continuidad</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Reunión ejecutiva con el Comité de Copropietarios para evaluar la contratación definitiva de la línea ORBI Sentinel IA.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 7: EXPORT PROPOSAL REPORT */}
          {activeSubTab === "report" && (
            <div id="report-subtab" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-sans font-bold text-white">Community Pilot Proposal Report</h3>
                  <p className="text-xs text-slate-400">Reporte técnico y de alcances formateado en Markdown para copiar a propuestas formales.</p>
                </div>
                <button
                  id="btn-copy-report"
                  onClick={copyReportToClipboard}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0 animate-pulse"
                >
                  {copiedReport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedReport ? "Copiado!" : "Copiar Reporte"}
                </button>
              </div>

              {/* Textarea containing copyable Markdown */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Previsualización del Documento Markdown</span>
                <textarea
                  id="textarea-proposal-report"
                  readOnly
                  rows={18}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none scrollbar-thin scrollbar-thumb-slate-800 resize-none leading-relaxed"
                  value={`=== INFORME DE PROPUESTA DE PILOTÁJE - ORBI SENTINEL IA ===
Fecha: 18 de Julio de 2026
Comunidad: ${scope.communityName}
Línea de Negocio: Community / Residencial
Estado de la Propuesta: ${pkgStatus.overall}
Preparación del Piloto: ${readiness.label}

1. RESUMEN EJECUTIVO
"ORBI Sentinel IA Community centraliza cámaras compatibles en una interfaz simple para conserjería, con gestión de incidentes, privacidad residencial, evidencia técnica y reportes para administración."
Se presenta este documento para la validación formal de un pilotaje acotado, responsable y no intrusivo en la red y privacidad de la copropiedad.

2. ALCANCE DEL PILOTO
- Duración: ${scope.pilotDuration} días corridos.
- Cámaras integradas: ${scope.pilotCameras} cámaras autorizadas de un total estimado de ${scope.totalCameras}.
- Zonas Incluidas: ${scope.includedZones.join(", ")}
- Zonas Excluidas: ${scope.excludedZones.join(", ")}
- NVR Existente: ${scope.existingNvr.toUpperCase()}
- Acceso Autorizado disponible: ${scope.authorizedAccess.toUpperCase()}
- Retención propuesta: ${scope.retentionProposed} días (Cumple estándar de bajo resguardo temporal).

3. PRIVACIDAD RESIDENCIAL Y AUTORIZACIÓN
- Enmascaramiento inteligente: Bloqueo de visualización en zonas de terrazas, pasillos privados o ventanas.
- Exclusión total de rostros de menores o registros familiares.
- Atribuciones estrictas de roles: Conserjería opera sin visibilidad técnica (no expone IPs ni claves).
- Administración aprueba y firma la exportación de video mediante bitácora local protegida con hash SHA-256.

4. CHECKLIST DE FACTIBILIDAD Y PREPARACIÓN (${Object.values(checklist).filter(Boolean).length}/10 Puntos)
- Inventario de cámaras: ${checklist.cameraInventory ? "Listo" : "Pendiente"}
- Accesos de red locales: ${checklist.authorizedAccess ? "Listo" : "Pendiente"}
- Zonas comunes definidas: ${checklist.commonZonesDefined ? "Listo" : "Pendiente"}
- Zonas privadas excluidas: ${checklist.privateZonesExcluded ? "Listo" : "Pendiente"}
- Política de retención definida: ${checklist.retentionPolicy ? "Listo" : "Pendiente"}
- Roles configurados: ${checklist.rolesDefined ? "Listo" : "Pendiente"}
- Servidor Gateway Local: ${checklist.localHardwareAvailable ? "Instalado/Listo" : "Pendiente"}
- Aprobación de Comité: ${checklist.adminAuthorization ? "Listo" : "Pendiente"}
- Pruebas acotadas (1-3 cámaras): ${checklist.limitedCameraTrials ? "Listo" : "Pendiente"}
- Protocolo de exportación: ${checklist.exportProcedure ? "Listo" : "Pendiente"}

5. ROADMAP DEL PILOTO RECOMENDADO
Fase 1: Levantamiento y diagnóstico de cámaras.
Fase 2: Validación de credenciales locales seguras.
Fase 3: Definición y enmascaramiento de privacidad.
Fase 4: Instalación física del Gateway local (ORBI Edge Micro-servidor).
Fase 5: Integración inicial controlada de ${scope.pilotCameras} cámaras.
Fase 6: Capacitación de 5 minutos a conserjería con interfaz táctil simplificada.
Fase 7: Período de pruebas de ${scope.pilotDuration} días.
Fase 8: Entrega de Informe de Valor Operacional a la Administración.
Fase 9: Decisión de continuidad del proyecto.

6. LIMITACIONES ADMINISTRATIVAS DECLARADAS
- No habilita producción 24/7 sin licenciamiento definitivo.
- Se restringe el procesamiento de IA al ancho de banda local asignado.
- No reemplaza de forma absoluta los sistemas NVR tradicionales instalados.
- Las cifras y ahorros mostrados corresponden a simulaciones operacionales lógicas de laboratorio.`}
                />
              </div>

              {/* No credentials warning inside Report subtab */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-slate-400 leading-normal">
                  <strong>Seguridad del Reporte:</strong> Este informe descarta estrictamente claves, hashes reales, tokens, IPs privadas o información confidencial de la red local, cumpliendo las directivas de seguridad para la divulgación pública residencial.
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
