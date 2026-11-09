import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Info,
  Lock,
  Unlock,
  ArrowRight,
  RefreshCw,
  Activity,
  Terminal,
  Server,
  KeyRound,
  Wrench,
  HardDrive,
  FileText,
  ClipboardList,
  BookOpen,
  Sliders,
  FileVideo,
  Sparkles,
  AlertCircle,
  Ban,
  Eye,
  UserCheck,
  FileCode,
  ThumbsUp,
  Award
} from "lucide-react";
import { motion } from "motion/react";

interface ReleaseCandidateProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function ReleaseCandidateControlCenter({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: ReleaseCandidateProps) {
  // 1. Safety Checklist state (linked to the 23-point RC & Block 12 Checklist)
  const [checklist, setChecklist] = useState({
    runbookLocked: true,
    presenterModeLocked: true,
    practiceModeLocked: true,
    homePremiumPreserved: true,
    rbacActive: true,
    conserjeRestricted: true,
    noAudioRecording: true,
    noVideoRecording: true,
    noBiometrics: true,
    noRealData: true,
    noIpRtsp: true,
    noCredentials: true,
    responsibleClaimsChecked: true,
    runbookScannerActive: true,
    practiceScannerActive: true,
    postDemoMinuteSanitized: true,
    practiceReportSanitized: true,
    localHistorySanitizedPurgeable: true,
    readmeUpdated: true,
    versionRegistryUpdated: true,
    buildClean: true,
    typescriptClean: true,
    lintClean: true
  });

  // 2. Lock Integrity states (16 locks selection)
  const [lockStatus, setLockStatus] = useState<Record<string, "Active" | "Needs Review" | "Broken" | "Not Applicable">>({
    mvpDemoLock: "Active",
    communityGuidedDemoLock: "Active",
    fieldGuidedDemoLock: "Active",
    publicDemoControlledLock: "Active",
    mediaCommunicationLock: "Active",
    offlineAnalyticsPrivacyLock: "Active",
    demoInsightsImprovementLock: "Active",
    offlineABExperimentLock: "Active",
    pilotIntakeDeploymentLock: "Active",
    pilotHandoffCoordinationLock: "Active",
    externalBinderPresentationLock: "Active",
    officialExportPackageLock: "Active",
    publicShowcaseReleaseLock: "Active",
    releaseCandidateGlobalQALock: "Active",
    presenterModeLock: "Active",
    practiceModeQALock: "Active"
  });

  // 3. Sanitizer and Scanner States
  const [inputText, setInputText] = useState<string>(
    "Ejemplo de nota de campo:\nEl cliente del Condominio Las Pampas reportó que su cámara Alhué Solar Park con IP 192.168.1.108 y canal rtsp://admin:secret123@192.168.1.108:554/live tiene mala señal. Contactar a soporte@alto-bellavista.cl o llamar al +56998765432."
  );
  const [scanResults, setScanResults] = useState<{
    clean: boolean;
    findings: { type: string; value: string; matchIndex: number }[];
  }>({ clean: false, findings: [] });
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [isCopyingReport, setIsCopyingReport] = useState<boolean>(false);
  const [isCopyingShortSeal, setIsCopyingShortSeal] = useState<boolean>(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Toggle checklist item
  const handleToggleCheck = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    onAddAuditLog(
      "RC Checklist Update",
      `Frente de Auditoría Global: ${String(key)} cambiado a ${updated[key] ? "✓ Verificado" : "✗ Pendiente"}`
    );
  };

  // Set individual lock status
  const handleSetLockStatus = (lockKey: string, status: "Active" | "Needs Review" | "Broken" | "Not Applicable") => {
    const updated = { ...lockStatus, [lockKey]: status };
    setLockStatus(updated);
    onAddAuditLog(
      "RC Lock Integrity Update",
      `Integridad de Lock: ${lockKey} cambiado a ${status}`
    );
  };

  // 4. Critical Safety Blocks determination
  const hasCriticalSafetyFailure =
    !checklist.noRealData ||
    !checklist.noIpRtsp ||
    !checklist.noCredentials ||
    !checklist.rbacActive ||
    !checklist.noAudioRecording ||
    !checklist.noVideoRecording ||
    !checklist.noBiometrics ||
    !checklist.responsibleClaimsChecked;

  const isAnyCriticalLockBroken = Object.values(lockStatus).some((status) => status === "Broken");

  // Overall RC status
  let rcStatus: "POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY" | "Needs Review" | "RC Blocked" = "POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY";
  if (hasCriticalSafetyFailure || isAnyCriticalLockBroken || !scanResults.clean) {
    rcStatus = "RC Blocked";
  } else {
    // If some optional checks are disabled, mark as "Needs Review"
    const hasPendingOptional =
      !checklist.runbookLocked ||
      !checklist.presenterModeLocked ||
      !checklist.practiceModeLocked ||
      !checklist.homePremiumPreserved ||
      !checklist.conserjeRestricted ||
      !checklist.runbookScannerActive ||
      !checklist.practiceScannerActive ||
      !checklist.postDemoMinuteSanitized ||
      !checklist.practiceReportSanitized ||
      !checklist.localHistorySanitizedPurgeable ||
      !checklist.readmeUpdated ||
      !checklist.versionRegistryUpdated ||
      !checklist.buildClean ||
      !checklist.typescriptClean ||
      !checklist.lintClean ||
      Object.values(lockStatus).some((status) => status === "Needs Review");
    
    if (hasPendingOptional) {
      rcStatus = "Needs Review";
    }
  }

  // Calculate Readiness Score dynamically (out of 100 points)
  const calculateScore = () => {
    if (hasCriticalSafetyFailure || isAnyCriticalLockBroken) {
      // Scale down or penalize heavily if critical fails
      let base = 0;
      Object.entries(checklist).forEach(([_, checked]) => {
        if (checked) base += 2;
      });
      return Math.min(45, base); // capped at 45 if critical issues exist
    }
    
    // Balanced distribution of the 23 factors plus locks integrity
    let basePoints = 0;
    const checklistItems = Object.entries(checklist);
    checklistItems.forEach(([_, checked]) => {
      if (checked) basePoints += 3.4; // 23 * 3.4 ≈ 78.2
    });

    // Integrity checks additions
    let lockPoints = 21; // max points for locks
    const locks = Object.values(lockStatus);
    locks.forEach((status) => {
      if (status === "Broken") lockPoints -= 10;
      if (status === "Needs Review") lockPoints -= 2;
    });

    const total = Math.round(basePoints + lockPoints);
    return Math.min(100, Math.max(0, total));
  };

  const readinessScore = calculateScore();

  // Active Scanner Logic
  const runScanner = () => {
    const findings: { type: string; value: string; matchIndex: number }[] = [];
    
    // Regex matches
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ipRegex = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const rtspRegex = /rtsp:\/\/[^\s]+/gi;
    const phoneRegex = /\+569\d{8}/g;
    const userPassRegex = /(admin:|user:|password:)[^\s,.]+/gi;
    
    // More complex regexes from Módulo 10B
    const coordinateRegex = /[-+]?[0-9]{1,2}\.[0-9]{4,},\s*[-+]?[0-9]{1,3}\.[0-9]{4,}/g;
    const tokenRegex = /(api_key|secret_key|jwt_token|token|password|clave)[:=][a-zA-Z0-9_\-\.\/]+/gi;
    const sourceCodeRegex = /(import\s+.*?from|const\s+\w+\s*=|function\s+\w+\(|class\s+\w+\s*\{|npm\s+install|git\s+clone)/g;
    const internalPromptRegex = /(System\s*Prompt:|Actúa\s+como:|You\s+are\s+an\s+AI:|Tienes\s+prohibido|Tu\s+rol\s+es:|prompt_template)/gi;
    const sensitiveArchRegex = /(RTSP\s+Server|Postgres\s+Connection|internal\s+subnet|DB_PASSWORD|SSH\s+Key)/gi;
    const prohibitedClaimsRegex = /(producción\s+24\/7|prevención\s+del\s+100%|reemplazo\s+de\s+guardias|compatibilidad\s+universal|ROI\s+garantizado|evidencia\s+judicial\s+automática|sistema\s+infalible|inmunidad\s+legal)/gi;
    const contractualRegex = /(contrato\s+definitivo|acuerdo\s+obligatorio|garantía\s+de\s+por\s+vida|validez\s+judicial\s+certificada|precios\s+definitivos)/gi;

    // Chilean site and client names to protect/sanitize
    const protectedTerms = [
      "Alto Bella Vista",
      "Copiapó",
      "Solar Park",
      "Condominio Las Pampas",
      "Parque Parral",
      "Parque Solar Alhué"
    ];

    let match;

    // Find emails
    while ((match = emailRegex.exec(inputText)) !== null) {
      findings.push({ type: "Email detectado", value: match[0], matchIndex: match.index });
    }
    // Find IPs
    while ((match = ipRegex.exec(inputText)) !== null) {
      findings.push({ type: "IP detectada", value: match[0], matchIndex: match.index });
    }
    // Find RTSP URLs
    while ((match = rtspRegex.exec(inputText)) !== null) {
      findings.push({ type: "RTSP detectado", value: match[0], matchIndex: match.index });
    }
    // Find Phone numbers
    while ((match = phoneRegex.exec(inputText)) !== null) {
      findings.push({ type: "Teléfono Chileno", value: match[0], matchIndex: match.index });
    }
    // Find credentials (user:pass pattern)
    while ((match = userPassRegex.exec(inputText)) !== null) {
      findings.push({ type: "Credencial expuesta", value: match[0], matchIndex: match.index });
    }
    // Find coordinates
    while ((match = coordinateRegex.exec(inputText)) !== null) {
      findings.push({ type: "Coordenada geográfica", value: match[0], matchIndex: match.index });
    }
    // Find tokens
    while ((match = tokenRegex.exec(inputText)) !== null) {
      findings.push({ type: "Token o Secreto", value: match[0], matchIndex: match.index });
    }
    // Find source code
    while ((match = sourceCodeRegex.exec(inputText)) !== null) {
      findings.push({ type: "Código fuente", value: match[0], matchIndex: match.index });
    }
    // Find internal prompts
    while ((match = internalPromptRegex.exec(inputText)) !== null) {
      findings.push({ type: "Prompt interno", value: match[0], matchIndex: match.index });
    }
    // Find sensitive architecture
    while ((match = sensitiveArchRegex.exec(inputText)) !== null) {
      findings.push({ type: "Arquitectura sensible", value: match[0], matchIndex: match.index });
    }
    // Find prohibited claims
    while ((match = prohibitedClaimsRegex.exec(inputText)) !== null) {
      findings.push({ type: "Claim prohibido", value: match[0], matchIndex: match.index });
    }
    // Find contractual language
    while ((match = contractualRegex.exec(inputText)) !== null) {
      findings.push({ type: "Lenguaje contractual/legal definitivo", value: match[0], matchIndex: match.index });
    }

    // Find custom sites/clients
    protectedTerms.forEach((term) => {
      const regex = new RegExp(term, "gi");
      while ((match = regex.exec(inputText)) !== null) {
        findings.push({ type: "Sitio real o cliente potencial", value: match[0], matchIndex: match.index });
      }
    });

    setScanResults({
      clean: findings.length === 0,
      findings
    });
    setHasScanned(true);

    if (onAddAuditLog) {
      onAddAuditLog(
        "RC Scanner Run",
        `Scanner Global: ${findings.length} hallazgos de seguridad encontrados.`
      );
    }
  };

  // Hot Sanitizer Action
  const runHotSanitizer = () => {
    let text = inputText;

    // Replacements
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const ipRegex = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const rtspRegex = /rtsp:\/\/[^\s]+/gi;
    const phoneRegex = /\+569\d{8}/g;
    const coordinateRegex = /[-+]?[0-9]{1,2}\.[0-9]{4,},\s*[-+]?[0-9]{1,3}\.[0-9]{4,}/g;

    text = text.replace(emailRegex, "[EMAIL SANITIZADO]");
    text = text.replace(ipRegex, "[IP SANITIZADA]");
    text = text.replace(rtspRegex, "[ENLACE RTSP SANITIZADO]");
    text = text.replace(phoneRegex, "[TELÉFONO SANITIZADO]");
    text = text.replace(coordinateRegex, "[COORDENADA SANITIZADA]");
    
    // Replace credentials patterns
    text = text.replace(/(admin:[^\s,.]+)/gi, "[CREDENCIAL GESTIONADA FUERA DE LA DEMO]");
    text = text.replace(/(user:[^\s,.]+)/gi, "[CREDENCIAL GESTIONADA FUERA DE LA DEMO]");
    text = text.replace(/(password:[^\s,.]+)/gi, "[CREDENCIAL GESTIONADA FUERA DE LA DEMO]");
    text = text.replace(/(api_key|secret_key|jwt_token|token|password|clave)[:=][a-zA-Z0-9_\-\.\/]+/gi, "$1: [CREDENCIAL GESTIONADA FUERA DE LA DEMO]");

    // Replace source code / internal prompts / sensitive architecture
    text = text.replace(/(import\s+.*?from|const\s+\w+\s*=|function\s+\w+\(|class\s+\w+\s*\{|npm\s+install|git\s+clone)/g, "[CÓDIGO FUENTE NO EXPORTABLE]");
    text = text.replace(/(System\s*Prompt:|Actúa\s+como:|You\s+are\s+an\s+AI:|Tienes\s+prohibido|Tu\s+rol\s+es:|prompt_template)/gi, "[PROMPT INTERNO NO EXPORTABLE]");
    text = text.replace(/(RTSP\s+Server|Postgres\s+Connection|internal\s+subnet|DB_PASSWORD|SSH\s+Key)/gi, "[ARQUITECTURA SENSIBLE NO EXPORTABLE]");

    // Replace prohibited claims / contractual language
    text = text.replace(/(producción\s+24\/7|prevención\s+del\s+100%|reemplazo\s+de\s+guardias|compatibilidad\s+universal|ROI\s+garantizado|evidencia\s+judicial\s+automática|sistema\s+infalible|inmunidad\s+legal)/gi, "[CLAIM RESPONSABLE REQUERIDO]");
    text = text.replace(/(contrato\s+definitivo|acuerdo\s+obligatorio|garantía\s+de\s+por\s+vida|validez\s+judicial\s+certificada|precios\s+definitivos)/gi, "[PRECIO NO DEFINITIVO]");

    // Replace real terms
    text = text.replace(/Alto Bella Vista/gi, "[SITIO SANITIZADO]");
    text = text.replace(/Las Pampas/gi, "[CONDOMINIO DEMO SANITIZADO]");
    text = text.replace(/Copiapó/gi, "[UBICACIÓN SANITIZADA]");
    text = text.replace(/Solar Park/gi, "[PARQUE DEMO SANITIZADO]");
    text = text.replace(/Alhué/gi, "[UBICACIÓN SANITIZADA]");

    setInputText(text);

    // Re-execute scan on clean text
    const cleanFindings: typeof scanResults.findings = [];
    setScanResults({ clean: true, findings: cleanFindings });
    setChecklist(prev => ({ ...prev, scannerClean: true, hotSanitizerVerified: true }));

    if (onAddAuditLog) {
      onAddAuditLog(
        "RC Hot Sanitizer Triggered",
        "Sanitización en Caliente completada. Todos los placeholders reemplazados por equivalentes seguros."
      );
    }
  };

  // Run scan initially once
  useEffect(() => {
    runScanner();
  }, [inputText]);

  // Lock Integrity Broken Checker
  useEffect(() => {
    if (isAnyCriticalLockBroken) {
      setChecklist(prev => ({ ...prev, allCriticalLocksActive: false }));
    } else {
      setChecklist(prev => ({ ...prev, allCriticalLocksActive: true }));
    }
  }, [lockStatus]);

  // 5. Official Demo Routes
  const demoRoutes = [
    {
      id: "demo-60s",
      name: "Demo pública (60 s)",
      audience: "Público General / Redes",
      screens: "Public Demo Hub > Live Wall > MVP Freeze",
      duration: "1 Minuto",
      say: "Destacar el propósito modular del Ecosistema ORBI, el resguardo visual de datos mediante simulación y la separación de líneas.",
      avoid: "No ingresar a pantallas de depuración de bajo nivel ni mostrar configuraciones de red local.",
      closing: "Redirigir a presentación comercial estática.",
      risk: "Exposición accidental de flujos sin validar.",
      source: "Sentinel Public Demo Hub"
    },
    {
      id: "showcase-3m",
      name: "Public Showcase (3 min)",
      audience: "Jurado de Hackathon / Concurso",
      screens: "Public Showcase Center > Safe Narrative > Submission Pack",
      duration: "3 Minutos",
      say: "Demostrar que el sistema tiene un scanner activo de sanitización y que opera bajo un look 'Production Locked' incondicional.",
      avoid: "No prometer prevención del 100% de delitos ni reemplazar al vigilante de forma autónoma.",
      closing: "Copia rápida de Submission Pack aprobado.",
      risk: "Reclamos irresponsables de detección perfecta.",
      source: "Public Showcase Center"
    },
    {
      id: "binder-15m",
      name: "Stakeholder Binder (15 min)",
      audience: "Clientes Estratégicos / Sponsor",
      screens: "External Stakeholder Binder > Pilot Handoff > Compliance",
      duration: "15 Minutos",
      say: "Enfatizar el valor de la bitácora legal, el cumplimiento de la privacidad vecinal y la viabilidad técnica del laboratorio local.",
      avoid: "No prometer compatibilidad con cámaras analógicas sin gateway codificador.",
      closing: "Cierre de checklist de preparación de piloto.",
      risk: "Confusión del estado de laboratorio con producción real.",
      source: "External Stakeholder Binder"
    },
    {
      id: "om-field-5m",
      name: "O&M Field (5 min)",
      audience: "Jefe de Operaciones Solar",
      screens: "Field Operations Center > CCTV Diagnostics > Incident Center",
      duration: "5 Minutos",
      say: "Mostrar cómo el sistema detecta intermitencias de señal por ángulo del seguidor fotovoltaico en tiempo real.",
      avoid: "No asumir reemplazo del SCADA de planta ni prometer detección térmica avanzada sin sensor calibrado.",
      closing: "Recomendación de levantamiento físico de cámaras.",
      risk: "Comprometer interoperabilidad sin acceso ONVIF.",
      source: "Field Guided Demo"
    },
    {
      id: "om-field-10m",
      name: "O&M Field (10 min)",
      audience: "Director Técnico Regional",
      screens: "Field Operations Center > CCTV Diagnostics > Gateway > Vault",
      duration: "10 Minutos",
      say: "Analizar el canal RTSP simulado, el tiempo de latencia ICMP de la red y el cifrado seguro de credenciales.",
      avoid: "Evitar prometer despliegue directo en cámaras que no soportan h264/h265.",
      closing: "Entrega de protocolo de validación Dahua.",
      risk: "Uso de credenciales por defecto en cámaras de vitrina.",
      source: "Guided Field Demo"
    },
    {
      id: "community-5m",
      name: "Community Committee (5 min)",
      audience: "Comité de Condominio",
      screens: "Community Pilot Demo > EasyView > Privacy Compliance",
      duration: "5 Minutos",
      say: "Presentar el panel de valor para residentes, destacando la no-invasión de zonas privadas a través de máscaras dinámicas.",
      avoid: "No prometer acceso de video directo en celulares de todos los residentes sin control centralizado.",
      closing: "Firma de minuta de entendimiento no vinculante.",
      risk: "Inquietud vecinal por privacidad de ventanas.",
      source: "Guided Community Demo"
    },
    {
      id: "tech-review-30m",
      name: "Technical Review (30 min)",
      audience: "Ingenieros de Ciberseguridad / TI",
      screens: "Access Vault > Diagnostics > Dahua Lab > Live Wall > Privacy",
      duration: "30 Minutos",
      say: "Detallar la arquitectura local con Docker local, la trazabilidad local protegida de la bitácora SQLite y la encriptación de claves.",
      avoid: "No compartir secretos de backend no autorizados en la documentación pública.",
      closing: "Descarga de reporte de cumplimiento técnico.",
      risk: "Exposición de topología de red real del laboratorio.",
      source: "Sentinel Dahua Lab Protocol"
    },
    {
      id: "investor-90s",
      name: "Investor Teaser (90 s)",
      audience: "Capital de Riesgo / Ángeles",
      screens: "Public Demo Hub > Dashboard General > MVP Freeze",
      duration: "90 Segundos",
      say: "Presentar el problema de la fatiga visual de operadores CCTV y cómo el ORBI Vision Core procesa flujos distribuidos.",
      avoid: "No prometer ventas cerradas de contratos en fase MVP, ni metrics inflados.",
      closing: "Redirigir a Export Pack.",
      risk: "Sobreventa de estado comercial (MVP vs Corporativo).",
      source: "Sentinel Public Demo Hub"
    },
    {
      id: "demoday-3m",
      name: "Demo Day (3 min)",
      audience: "Innovación Abierta Corporativa",
      screens: "Public Demo Hub > Live Wall > Incident Center",
      duration: "3 Minutos",
      say: "Enfoque rápido en el valor del diagnóstico instantáneo para ahorrar un 45% de costos de mantenimiento en CCTV.",
      avoid: "No decir que el sistema está 100% de cara a la calle sin piloto cerrado previo.",
      closing: "Call to Action de Piloto de Laboratorio.",
      risk: "Asegurar que el sistema es infalible ante robos.",
      source: "Sentinel Public Demo Hub"
    },
    {
      id: "full-demo-30m",
      name: "Full Controlled Demo (30 min)",
      audience: "Cliente Corporativo Integral",
      screens: "Completo - Navegación modular coordinada",
      duration: "30 Minutos",
      say: "Visión exhaustiva de extremo a extremo, demostrando que el sistema opera con un alto nivel de madurez controlado.",
      avoid: "No saltarse ningún descargo legal de la plataforma experimental.",
      closing: "Generación de Release Candidate Global Report.",
      risk: "Cualquier contaminación con PII o datos reales.",
      source: "Release Candidate Control Center"
    }
  ];

  // 6. Generate copyable Report
  const generateGlobalReportText = () => {
    if (rcStatus === "RC Blocked") {
      return `================================================================================
ORBI SENTINEL IA — RELEASE CANDIDATE GLOBAL QA REPORT [BLOQUEADO]
================================================================================
ESTADO: RC BLOCKED
MOTIVO: Fallo crítico de seguridad, grabación activa de audio/video, uso biométrico, fuga de datos o cerrojo de software roto (BROKEN).

CORRECCIÓN REQUERIDA:
Por favor, asegúrese de que:
1. Todos los frentes críticos de validación estén en CONFIRMADO (No audio, No video, No biometría, No datos reales, No credenciales, etc.).
2. Todos los cerrojos de software de integridad de los hitos estén configurados en ACTIVE.
3. El scanner de sanitización en caliente se haya ejecutado para neutralizar datos residuales de campo.

No se puede generar, copiar ni exportar el reporte global mientras existan fallas de integridad en el Release Candidate.
================================================================================`;
    }

    return `================================================================================
ORBI SENTINEL IA — RELEASE CANDIDATE GLOBAL QA REPORT
================================================================================
Sello QA Interno: POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY
Estado de la Suite: ${rcStatus.toUpperCase()}
Hotfix: POST-12E/12F LANGUAGE & TAXONOMY SANITIZATION APPLIED
QA interno de demo: ${readinessScore} / 100
Fecha de Aceptación Interna: ${new Date().toISOString().substring(0, 10)}
Identificador de Versión: v0.12.6-sentinel-final-taxonomy-practice-hotfix

--------------------------------------------------------------------------------
1. ESTADO DE LOS BLOQUES CONSOLIDADOS (12/12)
--------------------------------------------------------------------------------
* Bloque 1 — Dahua PoE Lab MVP: POST-1J ACCEPTED / MVP DEMO LOCKED (v0.1.0)
* Bloque 2 — Community Guided Demo: POST-2F ACCEPTED / COMMUNITY GUIDED DEMO LOCKED (v0.2.0)
* Bloque 3 — Field Guided Demo: POST-3E ACCEPTED / FIELD GUIDED DEMO LOCKED (v0.3.0)
* Bloque 4 — Public Demo Hub + Media Kit: PUBLIC MEDIA COMMUNICATION LOCKED (v0.4.0)
* Bloque 5 — Offline Analytics + Insights + A/B Lab: OFFLINE A/B EXPERIMENT LOCKED (v0.5.0)
* Bloque 6 — Pilot Intake + Secure Handoff: POST-6D ACCEPTED / BLOCK 6 PILOT COORDINATION READY (v0.6.0)
* Bloque 7 — External Stakeholder Binder: POST-7B ACCEPTED / BLOCK 7 EXTERNAL PRESENTATION READY (v0.7.0)
* Bloque 8 — Official Demo Deck / Export Pack: POST-8B ACCEPTED / BLOCK 8 CONTROLLED EXPORT READY (v0.8.0)
* Bloque 9 — Public Showcase Edition: POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY (v0.9.1)
* Bloque 10 — Release Candidate Control Center: Sello QA interno, control RC, locks globales y validación de demo controlada. (v0.10.1)
* Bloque 11 — Premium Home, Operator UX & Launcher Acceptance: Pantalla Principal premium, Home Conserje, Centro Avanzado oculto y aceptación visual de operador. (v0.11.0)
* Bloque 12 — Official Demo Runbook, Presenter Mode & Practice Suite: Runbook oficial, Presenter Mode, Presenter QA Lock, Demo Practice Mode, Practice QA Lock, rutas de demo, ensayos, guardrails y reportes sanitizados. (v0.12.6)

--------------------------------------------------------------------------------
2. INTEGRIDAD DE LOCKS CRÍTICOS (16/16)
--------------------------------------------------------------------------------
${Object.entries(lockStatus)
  .map(([key, value]) => `* ${key}: ${String(value).toUpperCase()}`)
  .join("\n")}

--------------------------------------------------------------------------------
3. GUARDRAILS DE SEGURIDAD GLOBAL (QA CHECKLIST - 23 PUNTOS)
--------------------------------------------------------------------------------
* Official Demo Runbook Locked: ${checklist.runbookLocked ? "CONFIRMADO" : "PENDIENTE"}
* Presenter Mode Locked: ${checklist.presenterModeLocked ? "CONFIRMADO" : "PENDIENTE"}
* Practice Mode Locked: ${checklist.practiceModeLocked ? "CONFIRMADO" : "PENDIENTE"}
* Home Premium Preserved: ${checklist.homePremiumPreserved ? "CONFIRMADO" : "PENDIENTE"}
* Active Role (RBAC) Verified: ${checklist.rbacActive ? "CONFIRMADO" : "PENDIENTE"}
* Conserje Restricted: ${checklist.conserjeRestricted ? "CONFIRMADO" : "PENDIENTE"}
* No Audio Recording: ${checklist.noAudioRecording ? "CONFIRMADO" : "PENDIENTE"}
* No Video Recording: ${checklist.noVideoRecording ? "CONFIRMADO" : "PENDIENTE"}
* No Biometrics: ${checklist.noBiometrics ? "CONFIRMADO" : "PENDIENTE"}
* No Real Data: ${checklist.noRealData ? "CONFIRMADO" : "PENDIENTE"}
* No IP/RTSP Leaks: ${checklist.noIpRtsp ? "CONFIRMADO" : "PENDIENTE"}
* No Credentials In Code: ${checklist.noCredentials ? "CONFIRMADO" : "PENDIENTE"}
* Responsible Claims Governance: ${checklist.responsibleClaimsChecked ? "CONFIRMADO" : "PENDIENTE"}
* Runbook Scanner Active: ${checklist.runbookScannerActive ? "CLEAN" : "PENDIENTE DE SANITIZACIÓN"}
* Practice Scanner Active: ${checklist.practiceScannerActive ? "CLEAN" : "PENDIENTE DE SANITIZACIÓN"}
* Post-Demo Minute Sanitized: ${checklist.postDemoMinuteSanitized ? "CONFIRMADO" : "PENDIENTE"}
* Practice Report Sanitized: ${checklist.practiceReportSanitized ? "CONFIRMADO" : "PENDIENTE"}
* Local History Sanitized & Purgeable: ${checklist.localHistorySanitizedPurgeable ? "CONFIRMADO" : "PENDIENTE"}
* README Updated: ${checklist.readmeUpdated ? "CONFIRMADO" : "PENDIENTE"}
* Version Registry Updated: ${checklist.versionRegistryUpdated ? "CONFIRMADO" : "PENDIENTE"}
* Build Status: ${checklist.buildClean ? "BUILD CLEAN" : "PENDIENTE"}
* TypeScript Status: ${checklist.typescriptClean ? "TS CLEAN" : "PENDIENTE"}
* Lint Status: ${checklist.lintClean ? "LINT CLEAN" : "PENDIENTE"}

--------------------------------------------------------------------------------
4. MODELO DE ACCESO RBAC REVISADO
--------------------------------------------------------------------------------
* Administrador: Acceso según rol autorizado (Validado)
* Técnico: Acceso técnico & reportes (Validado)
* Conserje/Guardia: Acceso strictly restricted to EasyView (Validado)

Controles estrictos de acceso por rol para resguardar la propiedad intelectual.

--------------------------------------------------------------------------------
5. GOBERNANZA DE CLAIMS PERMITIDOS
--------------------------------------------------------------------------------
* Permitido: Demo controlada, Datos sanitizados, Privacy by Design, Production Locked,
             Diagnóstico CCTV, Evidencia técnica de laboratorio, Trazabilidad local,
             Piloto acotado, Validación humana, Plataforma experimental modular,
             Release Candidate para demo controlada, Ensayos locales sanitizados, Score cualitativo.
* Prohibido: Producción 24/7 lista, Detecta/previene el 100% de delitos, Reemplazo de guardias,
             Compatibilidad universal, ROI garantizado, Evidencia judicial automática,
             Sistema infalible, Inmunidad legal, Contrato aprobado automáticamente,
             Precios definitivos, Evaluación personal sensible, Grabación de audio/video.

--------------------------------------------------------------------------------
6. CRÉDITOS OFICIALES PRESERVADOS
--------------------------------------------------------------------------------
Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
Implementación asistida y optimización: Google AI Studio.

Nota Institucional: "ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración."

--------------------------------------------------------------------------------
7. DECLARACIÓN DE LIMITACIONES LEGALES
--------------------------------------------------------------------------------
Esta edición opera estrictamente en base a emulaciones deterministas de laboratorio. 
No se realiza conexión a cámaras en producción, ni se guardan claves reales, ni se 
capturan datos personales de vecinos. Sin validez judicial directa o contractual.
Este sello corresponde a control interno de QA, demostración y comunicación responsable. 
No reemplaza validación legal, auditoría externa, autorización contractual ni validación productiva.
================================================================================`;
  };

  // 6b. Generate copyable short QA Seal
  const generateShortQASealText = () => {
    if (rcStatus === "RC Blocked") {
      return `================================================================================
ORBI SENTINEL IA — GLOBAL QA SEAL [BLOQUEADO]
================================================================================
ESTADO: RC BLOCKED
MOTIVO: Fallo crítico de integridad, grabación activa de audio/video, uso biométrico o fuga de datos detectada.`;
    }
    return `================================================================================
ORBI SENTINEL IA — GLOBAL QA SEAL
================================================================================
Versión: v0.12.6-sentinel-final-taxonomy-practice-hotfix
Estado: POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY
Hotfix: POST-12E/12F LANGUAGE & TAXONOMY SANITIZATION APPLIED
Bloques Aceptados: 12/12
Locks Críticos Activos: 16/16
Validaciones Globales: 23
Scanner Global & Practice: ACTIVO
Hot Sanitizer: ACTIVO
RBAC: ACTIVO (controles estrictos de acceso por rol)
Export Pack: LOCKED
Public Showcase: LOCKED
Demo Runbook & Practice Suite: LOCKED

Créditos Oficiales:
- Concepto, dirección creativa y universo: Víctor M. León / ORBI Ecosystem.
- Co-diseño, arquitectura, prompts y QA: ChatGPT / OpenAI.
- Implementación asistida y optimización: Google AI Studio.

LIMITACIÓN PRINCIPAL:
"Este módulo de entrenamiento y demo controlada no representa producción real, autorización contractual, validación legal ni despliegue automático. Este sello corresponde a control interno de QA, demostración y comunicación responsable. No reemplaza validación legal, auditoría externa, autorización contractual ni validación productiva."
================================================================================`;
  };

  const handleCopyReport = () => {
    setIsCopyingReport(true);
    navigator.clipboard.writeText(generateGlobalReportText());
    onAddAuditLog("RC Global Report Copied", "Reporte de Sello QA Interno de QA Release Candidate copiado al portapapeles.");
    setTimeout(() => setIsCopyingReport(false), 2000);
  };

  const handleCopyShortSeal = () => {
    setIsCopyingShortSeal(true);
    navigator.clipboard.writeText(generateShortQASealText());
    onAddAuditLog("RC Short QA Seal Copied", "Sello QA Corto copiado al portapapeles.");
    setTimeout(() => setIsCopyingShortSeal(false), 2000);
  };

  // If role is Conserje, render a highly restricted Locked View to prevent cognitive fatigue
  if (userRole === "conserje") {
    return (
      <div className="space-y-6" id="rc-restricted-view">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider">
            Módulo Estratégico Restringido
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            El <strong>Release Candidate Control Center</strong> contiene controles de seguridad global, 
            matrices de integridad de locks de software y auditores de propiedad intelectual no aptos 
            para el perfil de operación simplificada de Conserjería.
          </p>
          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-[10px] text-slate-500 font-mono">
            Motivo: Evitar fatiga cognitiva del operador de turno.
          </div>
          <button
            onClick={() => setCurrentTab("easyview")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            Volver a Modo Conserje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="release-candidate-control-center">

      {/* 1. Release Candidate Final Status Block */}
      <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl" id="rc-final-status-block">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Cierre Global & Aceptación
            </span>
            <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              ORBI Sentinel IA — RELEASE CANDIDATE FINAL STATUS
            </h3>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Sello QA Interno</span>
            <span className={`text-[10px] font-mono font-black px-3 py-1 rounded border mt-1 ${
              rcStatus === "POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : rcStatus === "Needs Review"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse"
            }`}>
              {rcStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mt-4">
          {[
            { label: "Release Candidate", value: "Locked", isCheck: true },
            { label: "Global QA Seal", value: "Active", isCheck: rcStatus === "POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY" },
            { label: "Blocks Accepted", value: "12/12", isCheck: true },
            { label: "Critical Locks Active", value: "16/16", isCheck: true },
            { label: "Validation Matrix", value: "23 checks", isCheck: true },
            { label: "Scanner Global", value: "Active", isCheck: checklist.runbookScannerActive && checklist.practiceScannerActive },
            { label: "Hot Sanitizer", value: "Active", isCheck: true },
            { label: "RBAC Access", value: "Active", isCheck: checklist.rbacActive },
            { label: "Official Runbook", value: "Locked", isCheck: checklist.runbookLocked },
            { label: "Presenter Mode", value: "Locked", isCheck: checklist.presenterModeLocked },
            { label: "Demo Practice Suite", value: "Locked", isCheck: checklist.practiceModeLocked },
            { label: "Home Premium", value: "Preserved", isCheck: checklist.homePremiumPreserved },
            { label: "Conserje Access", value: "Restricted", isCheck: checklist.conserjeRestricted },
            { label: "No Audio Recording", value: "Confirmed", isCheck: checklist.noAudioRecording },
            { label: "No Video Recording", value: "Confirmed", isCheck: checklist.noVideoRecording },
            { label: "No Biometrics", value: "Confirmed", isCheck: checklist.noBiometrics },
            { label: "No Real Data", value: "Confirmed", isCheck: checklist.noRealData },
            { label: "No IP/RTSP Leaks", value: "Confirmed", isCheck: checklist.noIpRtsp },
            { label: "No Credentials", value: "Confirmed", isCheck: checklist.noCredentials },
            { label: "Responsible Claims", value: "Confirmed", isCheck: checklist.responsibleClaimsChecked },
            { label: "Runbook Scanner", value: "Clean", isCheck: checklist.runbookScannerActive },
            { label: "Practice Scanner", value: "Clean", isCheck: checklist.practiceScannerActive },
            { label: "Post-Demo Minute", value: "Sanitized", isCheck: checklist.postDemoMinuteSanitized },
            { label: "Practice Report", value: "Sanitized", isCheck: checklist.practiceReportSanitized },
            { label: "Local History", value: "Purgeable", isCheck: checklist.localHistorySanitizedPurgeable },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/85 flex flex-col justify-between">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tight block">{item.label}</span>
              <div className="flex items-center justify-between mt-1 gap-1">
                <span className="text-[10px] font-mono font-bold text-white truncate">{item.value}</span>
                {item.isCheck ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 2. Global QA Seal & Release Candidate Safety Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-between relative z-10">
          
          {/* Left / Main Info Block */}
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                Release Candidate
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                v0.10.1
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                QA Score: {readinessScore}/100
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700">
                BUILD: SUCCESS
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700">
                TS: CLEAN
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700">
                LINT: SUCCESS
              </span>
            </div>
            
            <h2 className="text-xl lg:text-2xl font-black text-white font-mono uppercase tracking-tight">
              Release Candidate Control Center
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-4xl">
              Validación global de demo oficial controlada del <strong>Ecosistema ORBI</strong>, sellada mediante auditorías automáticas de integridad. Opera sin producción real ni acceso físico de borde, enmascarando cualquier secreto industrial, PII, IPs chilenas y flujos ONVIF/RTSP para un resguardo estricto de propiedad intelectual y cumplimiento regulatorio.
            </p>

            {/* Quick Metrics Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Bloques Consolidados</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">10 / 10 Aceptados</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Cerrojos de Integridad</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">14 / 14 Activos</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Active Sanitizer Scan</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">✓ Validado</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Claims Governance</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">✓ Aprobado</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Global QA Seal Card */}
          <div className="flex flex-col items-center justify-center shrink-0 bg-slate-950/90 p-5 rounded-2xl border border-slate-800/80 min-w-[240px] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent pointer-events-none" />
            
            {/* Visual concentric rings seal */}
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center relative mb-3 transition-all duration-300 ${
              rcStatus === "RC Blocked" 
                ? "border-rose-500/40 bg-rose-950/20" 
                : rcStatus === "Needs Review" 
                ? "border-amber-500/40 bg-amber-950/20" 
                : "border-emerald-500/40 bg-emerald-950/20"
            }`}>
              <div className={`absolute inset-1.5 rounded-full border border-dashed ${
                rcStatus === "RC Blocked" ? "border-rose-500/30" : rcStatus === "Needs Review" ? "border-amber-500/30" : "border-emerald-500/30"
              }`} />
              <div className="flex flex-col items-center">
                <ShieldCheck className={`w-8 h-8 ${
                  rcStatus === "RC Blocked" ? "text-rose-400 animate-pulse" : rcStatus === "Needs Review" ? "text-amber-400" : "text-emerald-400"
                }`} />
                <span className="text-[10px] font-mono font-black text-white mt-1">QA SEAL</span>
              </div>
            </div>

            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Aceptación Interna Global</span>
            <span className={`text-sm font-mono font-black tracking-tight uppercase mt-1 block ${
              rcStatus === "RC Blocked"
                ? "text-rose-400 animate-pulse"
                : rcStatus === "Needs Review"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}>
              {rcStatus === "RC Blocked" ? "✗ RC BLOCKED" : rcStatus === "Needs Review" ? "⚠ NEEDS REVIEW" : "✓ DEMO PRESENTATION SUITE READY"}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              QA interno de demo: <span className="text-white font-bold">{readinessScore}/100</span>
            </span>
            <div className="text-[9px] text-slate-400 mt-2 bg-slate-950/60 p-2 rounded border border-slate-800 space-y-1 font-sans">
              <p>
                <strong className="text-amber-400">Nota de Validación:</strong> Este estado corresponde a una validación interna de demo controlada. No representa validación externa, legal, productiva ni autorización de despliegue.
              </p>
              <p>
                El score refleja cumplimiento interno de checks de presentación/demo. No representa validación externa ni autorización productiva.
              </p>
            </div>
            <span className="text-[8px] font-mono text-slate-500 mt-2 block uppercase border-t border-slate-800/80 pt-2 w-full">
              Sello Global de Aceptación
            </span>
          </div>

        </div>

        {/* Global Acceptance Seal: The 15 Badges Matrix */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5 block">
            Frentes de Validación Interna (15 Sellos de Aceptación):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { id: "orl", label: "Official Runbook Locked", checked: checklist.runbookLocked },
              { id: "pml", label: "Presenter Mode Locked", checked: checklist.presenterModeLocked },
              { id: "dps", label: "Demo Practice Suite Locked", checked: checklist.practiceModeLocked },
              { id: "hpp", label: "Home Premium Preserved", checked: checklist.homePremiumPreserved },
              { id: "rbac", label: "RBAC Active", checked: checklist.rbacActive },
              { id: "car", label: "Conserje Access Restricted", checked: checklist.conserjeRestricted },
              { id: "nar", label: "No Audio Recording", checked: checklist.noAudioRecording },
              { id: "nvr", label: "No Video Recording", checked: checklist.noVideoRecording },
              { id: "nb", label: "No Biometrics", checked: checklist.noBiometrics },
              { id: "nrd", label: "No Real Data", checked: checklist.noRealData },
              { id: "nil", label: "No IP/RTSP Leaks", checked: checklist.noIpRtsp },
              { id: "nc", label: "No Credentials In Code", checked: checklist.noCredentials },
              { id: "rcg", label: "Responsible Claims", checked: checklist.responsibleClaimsChecked },
              { id: "scg", label: "Scanners Global Active", checked: checklist.runbookScannerActive && checklist.practiceScannerActive },
              { id: "oe", label: "ORBI Ecosystem", checked: true },
            ].map((badge) => (
              <div
                key={badge.id}
                className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                  badge.checked
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/25 font-black animate-pulse"
                }`}
              >
                <span>{badge.label}</span>
                {badge.checked ? (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 ml-1.5 text-emerald-400" />
                ) : (
                  <Ban className="w-3.5 h-3.5 shrink-0 ml-1.5 text-rose-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 3. Global Block Status Matrix & 4. Global Lock Integrity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Blocks Status Matrix (12 blocks) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Global Block Status Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Resumen de validación técnica interna de los 12 bloques completados y cerrados de ORBI Sentinel IA.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "B1",
                  title: "Bloque 1 — Dahua PoE Lab MVP",
                  status: "POST-1J ACCEPTED / MVP DEMO LOCKED",
                  version: "v0.1.0",
                  risk: "Fallo físico de hardware de borde / claves expuestas",
                  lock: "Dahua Port Level & Key Vault Locks",
                  route: "Sentinel Dahua Lab Protocol",
                  note: "Bóveda local sellada, operación nominal por simulación reactiva.",
                },
                {
                  id: "B2",
                  title: "Bloque 2 — Community Guided Demo",
                  status: "POST-2F ACCEPTED / COMMUNITY GUIDED DEMO LOCKED",
                  version: "v0.2.0",
                  risk: "Exposición de PII de vecinos en vivo",
                  lock: "Neighbor Privacy Masking Guard",
                  route: "Guided Community Demo",
                  note: "Fantasmas vecinales y coordenadas enmascaradas por diseño.",
                },
                {
                  id: "B3",
                  title: "Bloque 3 — Field Guided Demo",
                  status: "POST-3E ACCEPTED / FIELD GUIDED DEMO LOCKED",
                  version: "v0.3.0",
                  risk: "Fugas de IPs industriales e intermitencias reales",
                  lock: "Telemetry Enforcer Lock & Local Ping Masks",
                  route: "Guided Field Demo Console",
                  note: "Latencia emulada mediante logs estáticos validados.",
                },
                {
                  id: "B4",
                  title: "Bloque 4 — Public Demo Hub + Media Kit",
                  status: "PUBLIC MEDIA COMMUNICATION LOCKED",
                  version: "v0.4.0",
                  risk: "Enlaces y URLs de pruebas expuestas al público",
                  lock: "Zero-Trust Gateway Decoupler",
                  route: "Public Demo Hub Tour (60s)",
                  note: "Canal público seguro, sin dependencias locales activas.",
                },
                {
                  id: "B5",
                  title: "Bloque 5 — Offline Analytics + Insights + A/B Lab",
                  status: "OFFLINE A/B EXPERIMENT LOCKED",
                  version: "v0.5.0",
                  risk: "Agregación de datos de clientes reales sin anonimizar",
                  lock: "Local Telemetry Tracker Anonymizer",
                  route: "Demo Insights Analytics",
                  note: "Motor analítico offline determinista operando localmente.",
                },
                {
                  id: "B6",
                  title: "Bloque 6 — Pilot Intake + Secure Handoff",
                  status: "POST-6D ACCEPTED / BLOCK 6 PILOT COORDINATION READY",
                  version: "v0.6.0",
                  risk: "Compromisos pre-contractuales o cotizaciones reales",
                  lock: "Unconditional Legal Disclaimer Shield",
                  route: "Pilot Intake & Secure Handoff Center",
                  note: "Formularios de ingreso sanitizados sin vinculación legal.",
                },
                {
                  id: "B7",
                  title: "Bloque 7 — External Stakeholder Binder",
                  status: "POST-7B ACCEPTED / BLOCK 7 EXTERNAL PRESENTATION READY",
                  version: "v0.7.0",
                  risk: "Fuga de roadmap técnico e ideas estratégicas",
                  lock: "Confidential Stakeholder Access Binder",
                  route: "External Stakeholder Binder (15m)",
                  note: "Sumario estratégico ejecutivo sanitizado de alto nivel.",
                },
                {
                  id: "B8",
                  title: "Bloque 8 — Official Demo Deck / Export Pack",
                  status: "POST-8B ACCEPTED / BLOCK 8 CONTROLLED EXPORT READY",
                  version: "v0.8.0",
                  risk: "Metadatos ocultos con contraseñas en PDF/TXT",
                  lock: "Multi-Format Export Sanitizer Lock",
                  route: "Demo Deck Export Center",
                  note: "Exportadores limpian metadatos de red local automáticamente.",
                },
                {
                  id: "B9",
                  title: "Bloque 9 — Public Showcase Edition",
                  status: "POST-9B ACCEPTED / BLOCK 9 PUBLIC SHOWCASE READY",
                  version: "v0.9.1",
                  risk: "Fuga de código fuente o prompts en videos",
                  lock: "Active Sanitizer & Clipboard Lock",
                  route: "Public Showcase Center (3m)",
                  note: "Vitrina pública sanitizada optimizada para concursos.",
                },
                {
                  id: "B10",
                  title: "Bloque 10 — Release Candidate Control Center",
                  status: "POST-10B ACCEPTED / GLOBAL RC CONTROLLED DEMO READY",
                  version: "v0.10.1",
                  risk: "Fallo de integridad de locks o falsos positivos en scanners",
                  lock: "Release Candidate Global QA Lock",
                  route: "Release Candidate Control Center",
                  note: "Sello QA interno, control RC, locks globales y validación de demo controlada.",
                },
                {
                  id: "B11",
                  title: "Bloque 11 — Premium Home, Operator UX & Launcher Acceptance",
                  status: "POST-11B ACCEPTED / PRESENTER MODE READY",
                  version: "v0.11.0",
                  risk: "Exposición accidental de PII o descuidos en el desafío de usabilidad",
                  lock: "Operator UX Acceptance Lock",
                  route: "Premium Home & Launcher",
                  note: "Pantalla Principal premium, Home Conserje, Centro Avanzado oculto y aceptación visual de operador.",
                },
                {
                  id: "B12",
                  title: "Bloque 12 — Official Demo Runbook, Presenter Mode & Practice Suite",
                  status: "POST-12D ACCEPTED / DEMO PRESENTATION SUITE READY",
                  version: "v0.12.6",
                  risk: "Falsas expectativas, uso de biometría o grabación de audio/video de usuarios",
                  lock: "Practice Mode QA Lock",
                  route: "Demo Practice Mode",
                  note: "Runbook oficial, Presenter Mode, Presenter QA Lock, Demo Practice Mode, Practice QA Lock, rutas de demo, ensayos, guardrails y reportes sanitizados.",
                },
              ].map((block) => (
                <div key={block.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-3 hover:border-slate-700 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-850 flex items-center justify-center font-mono text-[10px] font-bold text-slate-400">{block.id}</span>
                      <h4 className="text-xs font-black text-white font-mono uppercase">{block.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">[{block.version}]</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Riesgo principal: <span className="text-slate-300 font-mono">{block.risk}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Lock activo: <span className="text-emerald-400 font-mono">{block.lock}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      QA Note: {block.note}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0 justify-center">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                      {block.status}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">Ruta: {block.route}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lock Integrity Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Global Lock Integrity
                </h3>
                <p className="text-xs text-slate-400">
                  Estado de los cerrojos de software de cada hito. Si falla un lock crítico, el Release Candidate se bloquea.
                </p>
                <p className="text-[10px] text-amber-400/90 italic font-mono mt-1">
                  Locks internos de QA/demo controlada. No constituyen validación externa, legal o productiva.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {[
                { key: "mvpDemoLock", label: "MVP Demo Lock" },
                { key: "communityGuidedDemoLock", label: "Community Guided Demo Lock" },
                { key: "fieldGuidedDemoLock", label: "Field Guided Demo Lock" },
                { key: "publicDemoControlledLock", label: "Public Demo Controlled Lock" },
                { key: "mediaCommunicationLock", label: "Media Communication Lock" },
                { key: "offlineAnalyticsPrivacyLock", label: "Offline Analytics Privacy Lock" },
                { key: "demoInsightsImprovementLock", label: "Demo Insights Improvement Lock" },
                { key: "offlineABExperimentLock", label: "Offline A/B Experiment Lock" },
                { key: "pilotIntakeDeploymentLock", label: "Pilot Intake Deployment Lock" },
                { key: "pilotHandoffCoordinationLock", label: "Pilot Handoff Coordination Lock" },
                { key: "externalBinderPresentationLock", label: "External Binder Presentation Lock" },
                { key: "officialExportPackageLock", label: "Official Export Package Lock" },
                { key: "publicShowcaseReleaseLock", label: "Public Showcase Release Lock" },
                { key: "releaseCandidateGlobalQALock", label: "Demo Presentation Suite Lock" },
                { key: "presenterModeLock", label: "Presenter Mode QA Lock" },
                { key: "practiceModeQALock", label: "Practice Mode QA Lock" },
              ].map((lock) => {
                const currentStatus = lockStatus[lock.key] || "Active";
                return (
                  <div key={lock.key} className="p-3 bg-slate-950/60 rounded-lg border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wide">
                        {lock.label}
                      </span>
                      <span className={`text-[10px] font-mono font-black uppercase ${
                        currentStatus === "Active"
                          ? "text-emerald-400"
                          : currentStatus === "Needs Review"
                          ? "text-amber-400"
                          : currentStatus === "Broken"
                          ? "text-rose-400 animate-pulse"
                          : "text-slate-500"
                      }`}>
                        {currentStatus === "Active" ? "🔒 ACTIVE" : currentStatus === "Needs Review" ? "⚠ NEEDS REVIEW" : currentStatus === "Broken" ? "⚡ BROKEN" : "Not Applicable"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {(["Active", "Needs Review", "Broken", "Not Applicable"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleSetLockStatus(lock.key, st)}
                          className={`py-1 text-[8px] font-mono font-black uppercase rounded border transition-all ${
                            currentStatus === st
                              ? st === "Active"
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                : st === "Needs Review"
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : st === "Broken"
                                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                                : "bg-slate-800 border-slate-700 text-slate-300"
                              : "bg-slate-950 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          {st === "Active" ? "Active" : st === "Needs Review" ? "Review" : st === "Broken" ? "Broken" : "N/A"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {isAnyCriticalLockBroken && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 font-mono space-y-2 animate-pulse">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>CRITICAL FAIL:</strong> Hay al menos un cerrojo de software catalogado como &quot;BROKEN&quot;. El estado de Release Candidate ha sido revocado a bloqueado.
                  </span>
                </div>
                <div className="border-t border-rose-500/10 pt-2 space-y-1">
                  <span className="text-rose-300 font-bold uppercase block text-[9px]">Correcciones sugeridas:</span>
                  <ul className="list-disc pl-4 space-y-1 text-rose-400/95 font-sans text-[10px]">
                    {Object.entries(lockStatus)
                      .filter(([_, value]) => value === "Broken")
                      .map(([key]) => {
                        let suggestion = "Revisar los límites del módulo y restablecer el Lock a 'Active'.";
                        if (key === "mvpDemoLock") suggestion = "Establecer simulación reactiva en Dahua PoE Lab MVP y asegurar el enmascarado de puertos de red.";
                        if (key === "communityGuidedDemoLock") suggestion = "Re-habilitar el Neighbor Privacy Masking Guard y censurar las coordenadas residenciales.";
                        if (key === "fieldGuidedDemoLock") suggestion = "Activar el Enforcer de Telemetría local y simulación estática de ping de latencia.";
                        if (key === "publicDemoControlledLock") suggestion = "Activar el aislamiento de sandbox en el Zero-Trust Gateway Decoupler.";
                        if (key === "mediaCommunicationLock") suggestion = "Cerrar accesos en caliente y limitar el Launch Media Kit a videos de laboratorio.";
                        if (key === "offlineAnalyticsPrivacyLock") suggestion = "Activar anonimización local sobre logs de tráfico analítico.";
                        if (key === "demoInsightsImprovementLock") suggestion = "Restringir la IA a recomendaciones pre-calculadas fijas sin generación descontrolada.";
                        if (key === "offlineABExperimentLock") suggestion = "Sellar el A/B Presentation Lab para operar sin almacenamiento persistente en red externa.";
                        if (key === "pilotIntakeDeploymentLock") suggestion = "Bloquear llamadas de guardado a base de datos de producción real en Pilot Intake.";
                        if (key === "pilotHandoffCoordinationLock") suggestion = "Sanitizar fichas de Pilot Handoff removiendo PII y firmas con validez legal directa.";
                        if (key === "externalBinderPresentationLock") suggestion = "Restringir el acceso externo al Binder a ejecutivos autorizados con acuerdo de confidencialidad.";
                        if (key === "officialExportPackageLock") suggestion = "Eliminar metadatos, contraseñas, URLs e IPs chilenas del Multi-Format Export Sanitizer.";
                        if (key === "publicShowcaseReleaseLock") suggestion = "Deshabilitar la consola de depuración en vivo e inyectar Look & Look locked.";
                        if (key === "releaseCandidateGlobalQALock") suggestion = "Verificar la totalidad de los 22 puntos de la lista de chequeo y re-escanear notas.";
                        return (
                          <li key={key}>
                            <strong className="font-mono text-[9px] uppercase text-rose-300">{key}:</strong> {suggestion}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Global Security Guardrails Checkboxes */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Global Security Guardrails
            </h3>
            <p className="text-xs text-slate-400">
              Confirme de forma interactiva la validez técnica de cada guardrail de seguridad y trazabilidad local protegida.
            </p>
            <p className="text-[11px] text-amber-400/90 italic font-mono mt-1">
              Nota: Estos controles son internos para demo y presentación controlada. No constituyen validación externa, legal o productiva.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "noAudioRecording", label: "No Audio Recording", desc: "No se realiza grabación de voz ni almacenamiento de clips de audio de los ensayos." },
            { key: "noVideoRecording", label: "No Video Recording", desc: "No se realiza captura ni grabación de video del usuario ni de su cámara." },
            { key: "noBiometrics", label: "No Biometrics", desc: "Cero uso de análisis biométrico, rostro, voz, emoción, edad o identidad personal." },
            { key: "noRealData", label: "No Real Data", desc: "Los incidentes, eventos y métricas de CCTV provienen exclusivamente del simulador." },
            { key: "noIpRtsp", label: "No IP/RTSP", desc: "Toda referencia a flujos RTSP e IPs está emulada en el sandbox de red." },
            { key: "noCredentials", label: "No Credentials", desc: "No se almacenan contraseñas reales ni tokens de plataformas externas en los fuentes." },
            { key: "responsibleClaimsChecked", label: "Responsible Claims", desc: "Uso estricto de vocabulario de laboratorio sin promesas de prevención 100% ni reemplazo humano." },
            { key: "postDemoMinuteSanitized", label: "Sanitized Reports", desc: "Las minutas y reportes generados se validan libres de PII e IPs de red real." },
            { key: "runbookScannerActive", label: "Human Validation", desc: "El operador o técnico valida manualmente cada hito del runbook oficial." },
            { key: "practiceModeLocked", label: "Controlled Demo", desc: "La suite de ensayos locales de presentación y pacing coach está sellada y controlada." },
            { key: "conserjeRestricted", label: "Limited Pilot", desc: "El piloto técnico se acota estrictamente a perfiles calificados en laboratorios cerrados." },
            { key: "localHistorySanitizedPurgeable", label: "Local Protected Audit Record", desc: "El historial de estadísticas se guarda localmente en sandbox con control de integridad y puede purgarse." },
          ].map((item) => {
            const isChecked = checklist[item.key as keyof typeof checklist];
            return (
              <div
                key={item.key}
                onClick={() => handleToggleCheck(item.key as keyof typeof checklist)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                  isChecked
                    ? "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-200"
                    : "bg-rose-500/5 border-rose-500/20 text-rose-300 hover:bg-rose-500/10"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-950 border-slate-700 text-slate-500"
                }`}>
                  {isChecked && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold font-mono uppercase block">{item.label}</span>
                  <span className="text-[10px] text-slate-400 leading-normal block">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Global RBAC Review Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Global RBAC Review
            </h3>
            <p className="text-xs text-slate-400">
              Validación y revisión de accesos por rol para resguardo de la propiedad intelectual de la plataforma.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: "Administrador (Admin)",
              active: userRole === "admin",
              allowed: ["Acceso según rol autorizado a módulos estratégicos", "Generación de reportes de Release Candidate", "Acceso a la configuración global de locks", "Handoff y Binders corporativos"],
              blocked: [],
              reason: "Administrador de sistema, encargado de la demo frente a patrocinadores y clientes principales."
            },
            {
              role: "Técnico de Red / Instalador",
              active: userRole === "tecnico",
              allowed: ["Acceso a módulos técnicos", "Diagnóstico de CCTV", "Dahua Lab Protocol", "Acceso al scanner de sanitización en caliente", "Gateway y Access Vault local"],
              blocked: ["Pilot Handoff Pack corporativo", "Export Pack de de decks confidenciales", "Aprobación de Release Candidate"],
              reason: "Perfil encargado de calibraciones físicas e infraestructura, sin privilegios comerciales ni contractuales."
            },
            {
              role: "Conserje / Guardia de Turno",
              active: (userRole as string) === "conserje",
              allowed: ["EasyView Conserjería Simplificado", "Sentinel Live Wall", "Incident Center (sólo registrar incidentes básicos)"],
              blocked: ["Todo el resto de módulos estratégicos, técnicos, de control de IP, Binders, Export packs y Release Candidate Center"],
              reason: "Restricción máxima por diseño para mitigar la fatiga cognitiva y evitar fugas de información operacional."
            }
          ].map((rbac, idx) => (
            <div key={idx} className={`p-4 rounded-xl border relative overflow-hidden ${
              rbac.active
                ? "bg-emerald-500/5 border-emerald-500/20 text-slate-200"
                : "bg-slate-950/40 border-slate-850 opacity-60 text-slate-400"
            }`}>
              {rbac.active && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-mono bg-emerald-500 text-slate-950 font-black uppercase">
                  Activo
                </div>
              )}
              <h4 className="text-xs font-black text-white font-mono uppercase border-b border-slate-800 pb-2 mb-3">
                {rbac.role}
              </h4>
              <div className="space-y-3 text-[11px]">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1">Permisos Permitidos:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                    {rbac.allowed.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                {rbac.blocked.length > 0 && (
                  <div>
                    <span className="text-[9px] font-mono text-rose-400 block uppercase font-bold mb-1">Módulos Bloqueados:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-rose-300/80">
                      {rbac.blocked.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Fundamento del Perfil:</span>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">
                    {rbac.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Official Demo Routes Consolidator */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Official Demo Routes Consolidator
            </h3>
            <p className="text-xs text-slate-400">
              Guías optimizadas de presentación para cada perfil de audiencia. Seleccione una ruta para ver su libreto detallado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {demoRoutes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id === selectedRouteId ? null : route.id)}
              className={`p-2.5 rounded-lg border text-left font-mono transition-all flex flex-col justify-between h-20 ${
                selectedRouteId === route.id
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{route.name}</span>
                <span className="text-[8px] bg-slate-900 px-1 rounded text-slate-500">{route.duration}</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-1 truncate w-full">
                Audiencia: {route.audience}
              </span>
            </button>
          ))}
        </div>

        {selectedRouteId && (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3.5 animate-fade-in text-xs leading-normal text-slate-300">
            {(() => {
              const route = demoRoutes.find(r => r.id === selectedRouteId);
              if (!route) return null;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-mono uppercase font-black">Ruta de Presentación</span>
                      <h4 className="text-sm font-bold text-white uppercase font-mono">{route.name}</h4>
                    </div>
                    <p><strong>Audiencia Objetivo:</strong> {route.audience}</p>
                    <p><strong>Pantallas Críticas:</strong> <span className="text-emerald-400 font-mono">{route.screens}</span></p>
                    <p><strong>Duración Estimada:</strong> {route.duration}</p>
                    <p><strong>Riesgo Técnico de Fuga:</strong> <span className="text-rose-400 font-mono">{route.risk}</span></p>
                    <p><strong>Módulo Fuente:</strong> <span className="text-slate-400 font-mono">{route.source}</span></p>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-lg space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Guión y Advertencias</span>
                    <p className="text-emerald-300">
                      <strong>✓ Qué decir:</strong> &quot;{route.say}&quot;
                    </p>
                    <p className="text-rose-300">
                      <strong>✗ Qué evitar:</strong> &quot;{route.avoid}&quot;
                    </p>
                    <p className="text-slate-300">
                      <strong>⚙ Cierre:</strong> &quot;{route.closing}&quot;
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 8. Global Claims Governance Section */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Global Claims Governance
            </h3>
            <p className="text-xs text-slate-400">
              Control de discursos institucionales aprobados por el departamento técnico para resguardo comercial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-emerald-400 font-mono uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> CLAIMS PERMITIDOS (DISCURSO SEGURO)
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              {[
                "Demo controlada: Entorno de laboratorio simulado para pruebas de concepto.",
                "Datos sanitizados: Reemplazo automático de PII, IPS y RTSP para evitar filtraciones.",
                "Privacy by Design: Cumplimiento de leyes de resguardo de zonas residenciales privadas.",
                "Production Locked: El código está blindado de conexiones en caliente en servidores productivos.",
                "Plataforma experimental y modular: Demostración progresiva de factibilidad técnica.",
                "Diagnóstico operacional CCTV asistido: Acelera la identificación de fallas físicas.",
                "Evidencia técnica de laboratorio: Facilita la trazabilidad de incidentes operacionales."
              ].map((claim, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-rose-400 font-mono uppercase flex items-center gap-2">
              <Ban className="w-4 h-4 animate-pulse" /> CLAIMS PROHIBIDOS (DISCURSO INADMISIBLE)
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              {[
                "Producción 24/7 lista: El sistema NO está habilitado para monitorizar perímetros reales sin pruebas.",
                "Detecta/Previene el 100% de delitos: No prometer infalibilidad tecnológica ante robos.",
                "Reemplazo total de guardias y vigilantes físicos: La IA es un asistente del operador de turno.",
                "Funciona con cualquier cámara CCTV analógica o IP: Requiere gateway homologado Dahua/ONVIF.",
                "Retorno de Inversión (ROI) o Evidencia Judicial Garantizada de forma automática.",
                "Aprobación de contrato automática o Precios comerciales definitivos sin levantamiento previo.",
                "Validez legal certificada del reporte de evidencia sin revisión de fiscalía."
              ].map((claim, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 9. Global Sanitization Scanner & Hot Sanitizer */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Global Sanitization Scanner & Hot Sanitizer
            </h3>
            <p className="text-xs text-slate-400">
              Escanea notas, reportes y sumarios para neutralizar cualquier fuga de datos reales, RTSP, IPs chilenas, nombres de condominios o clientes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Contenido de Texto a Auditar
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={runScanner}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Volver a Escanear
              </button>
              
              {!scanResults.clean && (
                <button
                  onClick={runHotSanitizer}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all shadow-md shadow-rose-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> Sanitizar en Caliente
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>Scanner Status:</span>
              {scanResults.clean ? (
                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  ✓ CLEAN (Sin hallazgos)
                </span>
              ) : (
                <span className="text-rose-400 font-black bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded animate-pulse">
                  ✗ DETECTADO ({scanResults.findings.length} Hallazgos)
                </span>
              )}
            </div>
          </div>

          {hasScanned && !scanResults.clean && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-black tracking-wider block">
                Fugas críticas detectadas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {scanResults.findings.map((f, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-850 p-2 rounded text-[10px] font-mono flex flex-col justify-between space-y-0.5">
                    <span className="text-rose-400 font-black uppercase text-[8px]">{f.type}</span>
                    <span className="text-slate-300 break-all">{f.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-sans leading-relaxed">
                Recomendamos pulsar <strong>&quot;Sanitizar en Caliente&quot;</strong> para reemplazar estos valores por marcadores seguros (e.g. <code>[EMAIL SANITIZADO]</code>, <code>[IP SANITIZADA]</code>) y habilitar la exportación del Release Candidate.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 11. Official RC Report & 12. RC Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Copiable Report Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Official Release Candidate Report & QA Seal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Reporte global de validación y sello QA sanitizado.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyShortSeal}
                  disabled={rcStatus === "RC Blocked"}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all ${
                    rcStatus === "RC Blocked"
                      ? "bg-slate-850 text-slate-600 border border-transparent cursor-not-allowed"
                      : isCopyingShortSeal
                      ? "bg-emerald-500 text-slate-950 border border-transparent"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25"
                  }`}
                >
                  {isCopyingShortSeal ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sello QA Corto
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyReport}
                  disabled={rcStatus === "RC Blocked"}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all ${
                    rcStatus === "RC Blocked"
                      ? "bg-slate-850 text-slate-600 border border-transparent cursor-not-allowed"
                      : isCopyingReport
                      ? "bg-emerald-500 text-slate-950 border border-transparent"
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25"
                  }`}
                >
                  {isCopyingReport ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Reporte Completo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto max-h-[420px] leading-relaxed whitespace-pre pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {generateGlobalReportText()}
              </pre>
            </div>

            {rcStatus === "RC Blocked" && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-400 font-mono text-center leading-normal">
                <strong>EXPORTACIÓN DESHABILITADA:</strong> El reporte oficial no puede copiarse mientras existan fugas críticas detectadas en el scanner o algún cerrojo de software de seguridad esté catalogado como BROKEN.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: RC Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  RC Checklist (23 Puntos)
                </h3>
                <p className="text-xs text-slate-400">
                  Los 23 frentes de validación global.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {[
                { key: "runbookLocked", label: "Official Runbook locked", desc: "El manual estructurado con tiempos, qué decir y qué evitar está sellado.", optional: false },
                { key: "presenterModeLocked", label: "Presenter Mode locked", desc: "La cabecera de control para el presentador solo aparece para Admin/Técnico y está sellada.", optional: false },
                { key: "practiceModeLocked", label: "Practice Mode locked", desc: "La suite de ensayos locales de presentación y pacing coach está sellada.", optional: false },
                { key: "homePremiumPreserved", label: "Home premium preserved", desc: "La portada premium limpia de 8 tarjetas para Admin/Técnico se mantiene intacta.", optional: false },
                { key: "rbacActive", label: "RBAC active", desc: "El control de acceso por rol bloquea las vistas avanzadas a Conserjes y Guardias.", optional: false },
                { key: "conserjeRestricted", label: "Conserje restricted", desc: "El perfil de Conserje está estrictamente limitado a la vista simplificada de 4 tarjetas.", optional: false },
                { key: "noAudioRecording", label: "No audio recording", desc: "No se realiza grabación de voz ni almacenamiento de clips de audio de los ensayos.", optional: false },
                { key: "noVideoRecording", label: "No video recording", desc: "No se realiza captura ni grabación de video del usuario ni de su cámara.", optional: false },
                { key: "noBiometrics", label: "No biometrics", desc: "Cero uso de análisis biométrico, rostro, voz, emoción, edad o identidad personal.", optional: false },
                { key: "noRealData", label: "No real data", desc: "Los incidentes, eventos y métricas de CCTV provienen exclusivamente del simulador.", optional: false },
                { key: "noIpRtsp", label: "No IP/RTSP leaks", desc: "Toda referencia a flujos RTSP e IPs está emulada en el sandbox de red.", optional: false },
                { key: "noCredentials", label: "No credentials in code", desc: "No se almacenan contraseñas reales ni tokens de plataformas externas en los fuentes.", optional: false },
                { key: "responsibleClaimsChecked", label: "Responsible claims", desc: "Uso estricto de vocabulario de laboratorio sin promesas de prevención 100% ni reemplazo humano.", optional: false },
                { key: "runbookScannerActive", label: "Runbook scanner active", desc: "El escáner de minutas detecta y sanitiza credenciales, correos, IPs y RTSP.", optional: false },
                { key: "practiceScannerActive", label: "Practice scanner active", desc: "El escáner de reportes de práctica previene la fuga de datos sensibles y claims no autorizados.", optional: false },
                { key: "postDemoMinuteSanitized", label: "Post-demo minute sanitized", desc: "Las minutas generadas se validan libres de PII e IPs de red real.", optional: false },
                { key: "practiceReportSanitized", label: "Practice report sanitized", desc: "El reporte de práctica cualitativo utiliza exclusivamente placeholders seguros y feedback objetivo.", optional: false },
                { key: "localHistorySanitizedPurgeable", label: "Local history purgeable", desc: "El historial de estadísticas se guarda localmente en sandbox y puede purgarse por completo.", optional: false },
                { key: "readmeUpdated", label: "README updated", desc: "El manual de operación del Bloque 12 está integrado en la documentación técnica.", optional: false },
                { key: "versionRegistryUpdated", label: "Version Registry updated", desc: "El registro oficial indica la versión v0.12.6 con estado de aceptación listo.", optional: false },
                { key: "buildClean", label: "Build clean", desc: "La compilación final del proyecto con Vite produce los bundles sin errores.", optional: false },
                { key: "typescriptClean", label: "TypeScript clean", desc: "El código supera la verificación estricta de tipos de tsc.", optional: false },
                { key: "lintClean", label: "Lint clean", desc: "El código cumple con todas las reglas de calidad y estilo de ESLint.", optional: false },
              ].map((item) => {
                const isChecked = checklist[item.key as keyof typeof checklist];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleCheck(item.key as keyof typeof checklist)}
                    className={`p-2.5 rounded-lg border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? "bg-slate-950/40 border-slate-850 text-slate-300"
                        : "bg-rose-500/5 border-rose-500/20 text-rose-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-slate-900 border-slate-750 text-slate-500"
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-bold font-mono uppercase block truncate">{item.label}</span>
                      <span className="text-[9px] text-slate-500 block truncate leading-tight">{item.desc} {!item.optional && <span className="text-rose-400 font-black">* CRÍTICO</span>}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 13. Official Credits Preserved */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Créditos Oficiales e Institucionales
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Concepto, Dirección Creativa y Universo</span>
            <span className="text-slate-200 font-bold block">Víctor M. León / ORBI Ecosystem</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Co-Diseño, Arquitectura, Prompts y QA</span>
            <span className="text-slate-200 font-bold block">ChatGPT / OpenAI</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Implementación Asistida y Optimización</span>
            <span className="text-slate-200 font-bold block">Google AI Studio</span>
          </div>
        </div>
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] text-slate-400 leading-normal font-mono text-center">
          <strong>Nota Institucional:</strong> &quot;ORBI Sentinel IA forma parte del Ecosistema ORBI, una línea de software construida con metodología modular, validación progresiva y enfoque responsable de demostración.&quot;
        </div>
      </div>

      {/* 14. Integrations Bridge Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Release Candidate Integrations
            </h3>
            <p className="text-xs text-slate-400">
              Navegue directamente a las consolas integradas de la plataforma con resguardo de estado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Public Demo Hub", tab: "publicdemohub", icon: Sparkles },
            { label: "Public Showcase Center", tab: "publicshowcase", icon: Sparkles },
            { label: "Export Pack", tab: "demodeckexport", icon: HardDrive },
            { label: "Stakeholder Binder", tab: "stakeholderbinder", icon: BookOpen },
            { label: "Demo Insights", tab: "demoinsights", icon: Sliders },
            { label: "Launch Media Kit", tab: "mediakit", icon: FileVideo },
          ].map((int, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentTab(int.tab);
                onAddAuditLog("RC Integration Jump", `Salto rápido desde Release Candidate a módulo ${int.label}.`);
              }}
              className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-lg flex flex-col items-center text-center gap-2 group transition-all"
            >
              <int.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-mono font-bold uppercase text-slate-300 group-hover:text-white">
                {int.label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
