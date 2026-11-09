import React, { useState } from "react";
import {
  Compass,
  Clock,
  UserCheck,
  Building,
  HelpCircle,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  Info,
  ListTodo,
  FileSpreadsheet,
  Calendar,
  Lock,
  ArrowRight,
  Send,
  User,
  Wrench,
  Activity
} from "lucide-react";

interface GuidedFieldDemoProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

type DemoDuration = "3min" | "5min" | "10min" | "15min";
type AudienceType = "gerente_om" | "jefe_planta" | "supervisor_tecnico" | "seguridad_fisica" | "cliente_pmgd" | "comite_tecnico" | "hse" | "proveedor_cctv";

interface DemoStep {
  title: string;
  time: string;
  screen: string;
  screenLabel: string;
  keyMessage: string;
  say: string[];
  dontSay: string[];
  riskWarning: string;
  probableObjection: string;
}

export default function GuidedFieldDemo({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: GuidedFieldDemoProps) {
  const [selectedDuration, setSelectedDuration] = useState<DemoDuration>("5min");
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>("gerente_om");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pre-demo Live Field Checklist
  const [checklist, setChecklist] = useState({
    demoModeActive: true,
    lineFieldActive: true,
    noRealData: true,
    noIpsRtspCredentialsReal: true,
    fieldOperationsReady: true,
    fieldProposalReady: true,
    presentationModeReady: true,
    audienceModeCorrect: true,
    guardrailsVisible: true,
    objectionCardsReady: true,
    proposalReportReady: true,
    scopeBuilderConfigured: true,
    readinessScoreReviewed: true,
    nextStepDefined: true
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (onAddAuditLog) {
        onAddAuditLog(
          "Configuración de Live Field Demo Checklist",
          `Marcado '${String(key)}' como ${next[key] ? "Listo" : "Pendiente"}.`
        );
      }
      return next;
    });
    triggerToast("Checklist de demo de campo actualizado.");
  };

  // Calculate readiness status based on prompt rules:
  // Regla: Si "noRealData", "guardrailsVisible" o "nextStepDefined" están en false (Blocked), la demo no puede marcarse Ready (se bloquea).
  const isCriticalBlocked = !checklist.noRealData || !checklist.guardrailsVisible || !checklist.nextStepDefined;
  const totalItems = Object.keys(checklist).length;
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const percent = Math.round((completedItems / totalItems) * 100);

  let finalStatus: "Ready for Guided Field Demo" | "Needs Review" | "Blocked" = "Ready for Guided Field Demo";
  if (isCriticalBlocked) {
    finalStatus = "Blocked";
  } else if (percent < 100) {
    finalStatus = "Needs Review";
  }

  // --- STEPS DEFINITION ---

  // Route 3 min: Captar interés rápido
  const route3min: DemoStep[] = [
    {
      title: "1. Problema Operacional en CCTV Solar",
      time: "40s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Los sitios solares O&M tienen cámaras aisladas, puntos ciegos, falsas alertas constantes y diagnósticos complejos.",
      say: [
        "En parques solares, O&M lidia con cámaras distribuidas en kilómetros, enlaces de radio inestables y maleza que satura de alarmas falsas.",
        "ORBI Sentinel IA Field consolida la visibilidad operativa y ayuda a priorizar los eventos perimetrales críticos bajo autorización formal del cliente.",
        "Esto dota al equipo de terreno de un copiloto técnico sin requerir servidores corporativos de alta latencia."
      ],
      dontSay: [
        "Garantizamos que este software elimina por completo el personal de patrullaje físico en el parque solar.",
        "Detecta el 100% de intrusiones sin importar el clima."
      ],
      riskWarning: "Evitar prometer prevención absoluta de robos de paneles o cables. Centrar en la priorización operativa.",
      probableObjection: "¿Esto reemplaza la central de monitoreo existente? No, es un copiloto técnico local."
    },
    {
      title: "2. Consola de Campo: Field Operations Center",
      time: "40s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Visualización centralizada de zonas críticas y estados simulados de cámaras.",
      say: [
        "Mostramos el Field Operations Center. Diseñado para que los técnicos o supervisores tengan un mapa operativo de cámaras limpias y sanitizadas.",
        "Vemos indicadores del estado de la red del parque: zonas perimetrales como Cerco Norte, Subestación y Oficinas O&M.",
        "El sistema enmascara credenciales e IPs reales, mostrando datos simulados de laboratorio para resguardo cibernético."
      ],
      dontSay: [
        "Nuestras cámaras de la demo corresponden a la red real en vivo sin enmascaramiento de puertos.",
        "Esta pantalla está conectada a la base de datos de producción corporativa."
      ],
      riskWarning: "Recordar que la visualización utiliza datos simulados sanitizados para resguardar la ciberseguridad industrial.",
      probableObjection: "¿Cómo se conectan las cámaras? Mediante un Gateway Edge local que consume flujos RTSP autorizados."
    },
    {
      title: "3. Incidentes en Terreno",
      time: "40s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Registro de anomalías como vistas obstruidas, cámaras sin señal o posibles intrusiones perimetrales.",
      say: [
        "El Centro de Incidentes recopila anomalías operacionales de CCTV como suciedad en lentes, obstrucción o pérdida de señal.",
        "Cuando un evento ocurre, el supervisor registra la anomalía perimetral de forma estructurada para coordinar con mantenimiento.",
        "El sistema genera una firma de trazabilidad local para mantener un historial auditable."
      ],
      dontSay: [
        "Este reporte tiene validez legal inmediata en tribunales de justicia y cuenta como peritaje oficial auditado.",
        "Llama automáticamente a la policía local."
      ],
      riskWarning: "Defina claramente que los reportes son evidencia técnica de laboratorio y trazabilidad local para O&M, no peritajes judiciales formalizados.",
      probableObjection: "¿Las alertas son en tiempo real? Sí, procesadas de manera local en el micro-servidor Edge."
    },
    {
      title: "4. Evidencia Técnica Local",
      time: "40s",
      screen: "evidence",
      screenLabel: "Evidence Report",
      keyMessage: "Generación de informes de evidencia para trazabilidad local de mantenimiento.",
      say: [
        "Para responder ante fallas de hardware, el sistema permite generar un Reporte de Evidencia de forma rápida.",
        "Mostramos detalles técnicos relevantes: hora estimada, cámara afectada, clips locales de prueba y diagnóstico de enlace.",
        "Esto previene demoras en la respuesta física, facilitando el trabajo del proveedor de mantenimiento CCTV."
      ],
      dontSay: [
        "El sistema almacena grabaciones en la nube de forma ilimitada y gratuita de por vida.",
        "Este reporte reemplaza los informes HSE oficiales."
      ],
      riskWarning: "Recalcar que el almacenamiento es local en el micro-servidor Edge con políticas de retención acotadas de 7 a 15 días.",
      probableObjection: "¿Qué pasa si se corta la fibra del parque? El sistema opera de manera local en el Edge, guardando la evidencia en el SSD local."
    },
    {
      title: "5. Piloto Acotado",
      time: "40s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Habilitación de un piloto seguro y limitado para comprobar viabilidad técnica.",
      say: [
        "Para comprobar la viabilidad operativa sin entorpecer la operación, proponemos un piloto técnico de 1 a 3 cámaras perimetrales autorizadas.",
        "La prueba tiene una duración acotada (por ejemplo, de 7 a 15 días) para auditar falsas alarmas, latencias y compatibilidad local.",
        "Esto minimiza riesgos y permite al cliente evaluar la herramienta en terreno de manera segura y responsable."
      ],
      dontSay: [
        "Este piloto incluye la integración de todas las 50 cámaras del parque sin costo alguno.",
        "Aseguramos producción activa 24/7 de manera inmediata."
      ],
      riskWarning: "La propuesta piloto requiere autorización formal y un levantamiento técnico de red previo.",
      probableObjection: "¿Se requiere cambiar las cámaras? No, aprovechamos las cámaras IP existentes compatibles con RTSP/ONVIF."
    }
  ];

  // Route 5 min: Presentación estándar para gerente O&M
  const route5min: DemoStep[] = [
    {
      title: "1. Problema Operacional en CCTV de Campo",
      time: "40s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "CCTV disperso, cámaras descalibradas y alertas constantes por viento y fauna en el perímetro solar.",
      say: [
        "Gerentes de O&M lidian con pérdidas de visibilidad en áreas remotas de parques solares y falsas alarmas que saturan al personal.",
        "ORBI Sentinel IA Field actúa como un copiloto de visibilidad que centraliza estados y prioriza anomalías perimetrales críticas.",
        "Se presenta como un apoyo técnico local, operando bajo estricta autorización del cliente."
      ],
      dontSay: [
        "Nuestra IA elimina la necesidad de sistemas SCADA o de guardias presenciales en la planta.",
        "Ofrece un 100% de eficacia en la prevención de robos de cobre."
      ],
      riskWarning: "No utilizar palabras absolutas de detección. Enfocar el valor en la visibilidad agregada.",
      probableObjection: "¿Sustituye nuestro sistema SCADA actual? No, es complementario para el área de CCTV y monitoreo perimetral."
    },
    {
      title: "2. Consola de Campo: Field Operations",
      time: "40s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Consola unificada que representa el estado de zonas del parque con datos de demostración.",
      say: [
        "Aquí observamos el Field Operations Center, donde se mapea el estado perimetral simplificado.",
        "A diferencia de los sistemas tradicionales, no abrumamos con datos de red crudos en la primera vista.",
        "La información mostrada utiliza nombres genéricos y datos simulados para proteger la privacidad operacional."
      ],
      dontSay: [
        "Estamos exponiendo las coordenadas GPS y direcciones IP reales de las cámaras del cliente en esta demostración.",
        "Cualquier persona en internet puede ver esta red de cámaras en vivo."
      ],
      riskWarning: "Garantizar que no se muestran direcciones de red reales ni credenciales sensibles.",
      probableObjection: "¿Es seguro ante hackeos? Sí, utiliza enmascaramiento y corre localmente sin abrir puertos públicos."
    },
    {
      title: "3. Mapa de Zonas Críticas",
      time: "40s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Segmentación lógica en zonas perimetrales de alto interés como subestaciones y cercos.",
      say: [
        "El sistema organiza las cámaras del parque en zonas críticas: Cerco Norte, Subestación, Oficinas y Acceso Principal.",
        "Si una cámara pierde señal o presenta una obstrucción, el mapa lo indica de forma intuitiva.",
        "Esto evita que el técnico de turno tenga que revisar manualmente decenas de pantallas en busca de fallas."
      ],
      dontSay: [
        "El mapa tiene un radar satelital que rastrea intrusos automáticamente en todo momento.",
        "Reemplaza el sistema de alarmas perimetrales físicas."
      ],
      riskWarning: "Mencionar que el mapa es una representación lógica simplificada y no un software GIS de precisión militar.",
      probableObjection: "¿Podemos añadir nuevas zonas? Sí, es adaptable a la topología de cada parque mediante configuración técnica."
    },
    {
      title: "4. Flujo de Incidentes y Priorización",
      time: "40s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Los incidentes de mantenimiento y CCTV se reportan y priorizan de forma local.",
      say: [
        "Cuando el sistema o un operador detecta una anomalía (como vista obstruida o cámara descalibrada), se genera un incidente.",
        "Este incidente tiene trazabilidad local y permite adjuntar bitácoras técnicas rápidas para mantenimiento.",
        "De este modo, se minimiza el tiempo fuera de servicio del sistema de seguridad CCTV."
      ],
      dontSay: [
        "El sistema tiene validez jurídica certificada para juicios penales.",
        "Llama automáticamente a los carabineros o policía de la zona."
      ],
      riskWarning: "El sistema no reemplaza los canales formales de denuncia legal ni HSE del parque.",
      probableObjection: "¿Qué pasa si se borra el log? El sistema utiliza una base local protegida para evitar modificaciones no autorizadas."
    },
    {
      title: "5. Context AI & Asistencia Contextual",
      time: "40s",
      screen: "contextai",
      screenLabel: "Context AI & Baseline",
      keyMessage: "Uso de asistencia contextual inteligente para redactar diagnósticos técnicos iniciales de forma segura.",
      say: [
        "Sentinel incorpora Context AI como una herramienta de apoyo para el operador de campo.",
        "Ayuda a estructurar análisis iniciales sobre problemas de red, maleza u obstrucción de visión.",
        "Toda información procesada se realiza de manera segura, sin transmitir datos confidenciales a APIs públicas externas."
      ],
      dontSay: [
        "Nuestra IA toma decisiones autónomas de seguridad sin supervisión humana.",
        "La IA puede predecir con exactitud cuándo ocurrirá el próximo robo."
      ],
      riskWarning: "La asistencia de IA requiere siempre de la validación humana de un técnico de terreno calificado.",
      probableObjection: "¿Funciona sin internet? Sí, la asistencia se apoya en modelos locales y plantillas lógicas precargadas."
    },
    {
      title: "6. Diagnósticos Técnicos Simplificados",
      time: "40s",
      screen: "diagnostics",
      screenLabel: "CCTV Diagnostics",
      keyMessage: "Monitoreo del enlace local, latencia simulada y estados PoE de cámaras de campo.",
      say: [
        "El módulo de CCTV Diagnostics permite a los supervisores auditar la salud de la red de cámaras.",
        "Mostramos estados lógicos de puertos, latencias y consumo PoE estimado para resolver fallas antes de ir a terreno.",
        "Se resguardan los parámetros reales, protegiendo direcciones de subredes internas."
      ],
      dontSay: [
        "El sistema permite hackear switches de terceros de manera remota.",
        "Muestra contraseñas de red en texto plano en la pantalla."
      ],
      riskWarning: "Aclarar que los diagnósticos son herramientas de monitoreo pasivo, no un software de intrusión en red.",
      probableObjection: "¿Cómo detecta la pérdida de señal? Mediante pings lógicos rápidos y análisis de flujo RTSP."
    },
    {
      title: "7. Evidence Report & Trazabilidad Local",
      time: "30s",
      screen: "evidence",
      screenLabel: "Evidence Report",
      keyMessage: "Compilación de fallas y anomalías para reportar a proveedores de CCTV.",
      say: [
        "El Evidence Report actúa como la bitácora técnica oficial de la jornada de seguridad.",
        "Permite documentar fallas de hardware, cámaras desalineadas o anomalías en cercos.",
        "Este reporte técnico sirve para coordinar con el integrador o proveedor del servicio de CCTV."
      ],
      dontSay: [
        "Garantizamos cadena de custodia judicial certificada internacionalmente de manera nativa.",
        "Los reportes se transmiten automáticamente a las fiscalías correspondientes."
      ],
      riskWarning: "Recalcar el carácter técnico de laboratorio del reporte, libre de validez judicial inmediata.",
      probableObjection: "¿Los informes se exportan? Sí, en formatos amigables y Markdown sanitizado."
    },
    {
      title: "8. Pilot Scope Builder",
      time: "30s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Definición conjunta de un piloto no invasivo con un rango recomendado de 1-3 cámaras y 7-15 días.",
      say: [
        "El Pilot Scope Builder nos permite configurar una prueba inicial muy acotada y segura.",
        "Definimos de 1 a 3 cámaras perimetrales autorizadas para el piloto, con una duración limitada de 7 a 15 días.",
        "De este modo, se minimizan los riesgos de red y se valida la factibilidad técnica en terreno."
      ],
      dontSay: [
        "El piloto de prueba soporta 100 cámaras conectadas sin levantamiento de red.",
        "Podemos activar un piloto por 6 meses de forma gratuita sin contrato."
      ],
      riskWarning: "Toda propuesta comercial piloto requiere la autorización y validación del cliente antes de comenzar.",
      probableObjection: "¿Qué pasa al finalizar el piloto? Se entrega un reporte técnico y se evalúa de común acuerdo el paso a producción."
    },
    {
      title: "9. Próximos Pasos Responsables",
      time: "30s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Levantamiento de red inicial, validación técnica y autorización explícita.",
      say: [
        "Para cerrar, el próximo paso es coordinar una reunión técnica para el levantamiento de la subred local del parque.",
        "Esto requiere la autorización explícita y formal de la gerencia de O&M o de seguridad física.",
        "Con esto, aseguramos una instalación responsable que cumple con los estándares HSE del sitio."
      ],
      dontSay: [
        "Mañana mismo vendremos a pinchar su red de cámaras sin avisar.",
        "La instalación no requiere de su personal técnico."
      ],
      riskWarning: "La coordinación previa con el equipo de TI/Ciberseguridad y HSE del parque es obligatoria.",
      probableObjection: "¿Cuánto tarda el levantamiento? Generalmente 1 jornada técnica en terreno de mutuo acuerdo."
    }
  ];

  // Route 10 min: Reunión técnica O&M con mayor profundidad
  const route10min: DemoStep[] = [
    {
      title: "1. Contexto O&M y Problema de Visibilidad",
      time: "50s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Dificultad de vigilar perímetros remotos y la saturación por alertas de viento o fauna.",
      say: [
        "Bienvenidos. En parques solares O&M, la visibilidad de CCTV es compleja debido a distancias de kilómetros.",
        "Los sistemas tradicionales saturan a los operadores con alertas falsas generadas por maleza o fauna.",
        "ORBI Sentinel IA Field ofrece un copiloto de CCTV local que prioriza posibles anomalías perimetrales de forma responsable."
      ],
      dontSay: ["Aseguramos la erradicación del 100% de los incidentes de intrusión de forma autónoma."],
      riskWarning: "Establezca expectativas realistas. La plataforma ayuda a priorizar, no reemplaza la vigilancia humana.",
      probableObjection: "¿Cómo maneja la maleza? Mediante calibración lógica local de zonas de detección."
    },
    {
      title: "2. Roles de Seguridad: Guardia, Administrador y Técnico",
      time: "50s",
      screen: "easyview",
      screenLabel: "Modo Conserje / EasyView",
      keyMessage: "Seguridad y separación de perfiles por diseño para mitigar riesgos cibernéticos y operativos.",
      say: [
        "El sistema separa estrictamente los accesos operativos: el rol Guardia (CCTV básico y reportes de baja carga).",
        "Los roles de Administrador y Técnico de Terreno cuentan con paneles avanzados de diagnóstico, bovedas y redacción de secretos.",
        "Esto reduce la fatiga cognitiva del guardia de turno y previene fallas de configuración accidentales."
      ],
      dontSay: ["Cualquier operador puede acceder a las credenciales en texto plano de las cámaras."],
      riskWarning: "El rol conserje/guardia no posee acceso a herramientas técnicas avanzadas por ciberseguridad.",
      probableObjection: "¿Cómo se cambian los roles? Mediante el selector de perfiles integrado en la barra lateral de la demostración."
    },
    {
      title: "3. Consola de Campo: Field Operations",
      time: "50s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Mapeo lógico perimetral consolidado para supervisores técnicos.",
      say: [
        "Observamos el Field Operations Center. Aquí el supervisor cuenta con un mapa de cámaras perimetrales.",
        "Permite visualizar de manera rápida qué cámaras están transmitiendo y cuáles presentan anomalías de señal.",
        "Los datos son ficticios y sanitizados, resguardando la ciberseguridad de la infraestructura crítica."
      ],
      dontSay: ["Esta demostración muestra cámaras reales en vivo de parques solares en producción activa."],
      riskWarning: "Evite mostrar nombres de parques o IPs reales del cliente durante la demo.",
      probableObjection: "¿Qué cámaras son compatibles? Cualquier cámara que provea transmisión RTSP sobre la red local compatible."
    },
    {
      title: "4. Mapa Operacional de Zonas",
      time: "50s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Segmentación del parque en áreas perimetrales críticas como cerco norte, subestaciones y accesos.",
      say: [
        "La planta solar se segmenta en zonas críticas de monitoreo para agilizar la revisión del operador.",
        "Si una zona perimetral presenta un evento o una falla de enlace, el sistema alerta visualmente.",
        "Esto focaliza la atención en anomalías específicas en lugar de vigilar decenas de monitores estáticos."
      ],
      dontSay: ["El sistema detecta objetos invisibles o personas ocultas detrás de obstáculos densos."],
      riskWarning: "La cobertura física real depende de la correcta instalación y campo de visión de cada cámara.",
      probableObjection: "¿Se pueden definir zonas ciegas? Sí, se configuran exclusiones locales en la interfaz."
    },
    {
      title: "5. Cámaras Field Demo",
      time: "50s",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Representación sanitizada de canales de video y estados lógicos de enlace.",
      say: [
        "En esta demostración de campo, las cámaras representan canales típicos: Cam Cerco Norte, Cam Subestación y Cam Oficinas O&M.",
        "Analizamos el estado lógico del enlace. Si hay pérdida de frames, el sistema lo indica de manera oportuna.",
        "Esto asiste al equipo de O&M en el diagnóstico temprano del CCTV perimetral."
      ],
      dontSay: ["Nuestra IA mejora digitalmente lentes sucios o cámaras con resoluciones inferiores a VGA de forma mágica."],
      riskWarning: "Un mantenimiento físico regular de los lentes de las cámaras sigue siendo indispensable.",
      probableObjection: "¿Soporta cámaras térmicas? Sí, siempre que entreguen un flujo estándar RTSP en la red."
    },
    {
      title: "6. Incident Workflow",
      time: "50s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Registro y clasificación de anomalías perimetrales para mantenimiento.",
      say: [
        "El Incident Center recopila eventos para revisión técnica de O&M, evitando alertamiento desordenado.",
        "Se registran anomalías como cámaras descalibradas, malezas que obstruyen la visión u otros problemas de mantenimiento.",
        "Cada anomalía se documenta de forma estructurada para facilitar la asignación a técnicos de terreno."
      ],
      dontSay: ["Este flujo reemplaza de forma legal los libros de novedades físicos exigidos por OS10 u organismos reguladores."],
      riskWarning: "Aclarar que el software es un registro digital de asistencia interna, no una bitácora legal certificada.",
      probableObjection: "¿Cómo se asocian las capturas? El sistema vincula la captura lógica tomada en el momento de la anomalía."
    },
    {
      title: "7. Context AI & Clasificación Preliminar",
      time: "50s",
      screen: "contextai",
      screenLabel: "Context AI & Baseline",
      keyMessage: "Asistencia contextual inteligente para agilizar el diagnóstico operativo inicial.",
      say: [
        "Utilizamos Context AI como un asistente para redactar resúmenes lógicos preliminares de fallas.",
        "La herramienta sugiere categorizaciones y posibles causas como maleza crecida u obstrucciones de lente.",
        "Este análisis es un copiloto técnico y siempre requiere la validación humana de un profesional."
      ],
      dontSay: ["La IA tiene criterio legal para dictaminar culpabilidades en incidentes de seguridad."],
      riskWarning: "La asistencia contextual es sugerida de laboratorio y no reemplaza el criterio experto humano.",
      probableObjection: "¿Requiere enviar videos a internet? No, el asistente se basa en metadatos y lógica local segura."
    },
    {
      title: "8. Diagnostics: Gateway, PoE, RTSP, ONVIF y Latencia",
      time: "50s",
      screen: "diagnostics",
      screenLabel: "CCTV Diagnostics",
      keyMessage: "Auditoría en tiempo real de latencia simulada, puertos de switches y flujos RTSP.",
      say: [
        "El panel de diagnósticos avanzados de CCTV permite evaluar latencias simuladas y el estado PoE de puertos del switch.",
        "Ayuda a resolver problemas de red local comunes en campo, como pérdidas de señal por atenuación de fibra o enlaces de radio.",
        "Las subredes y datos reales se ocultan mediante redacción de secretos para resguardo cibernético."
      ],
      dontSay: ["Garantizamos compatibilidad universal con cualquier cámara de CCTV sin realizar pruebas técnicas previas."],
      riskWarning: "Toda integración requiere validar previamente la red local y los accesos del Gateway Edge local.",
      probableObjection: "¿Soporta ONVIF? Sí, permite el descubrimiento de cámaras compatibles bajo autorización formal."
    },
    {
      title: "9. Evidence Report & Trazabilidad",
      time: "50s",
      screen: "evidence",
      screenLabel: "Evidence Report",
      keyMessage: "Generación de reportes de evidencia técnica de laboratorio para mantenimiento.",
      say: [
        "El Evidence Report consolida la información técnica recolectada ante una anomalía de CCTV.",
        "Ofrece trazabilidad local protegida de clips y bitácoras para coordinar reparaciones con el proveedor.",
        "Aseguramos que el reporte sea una evidencia técnica de laboratorio útil, descartando validez judicial automática."
      ],
      dontSay: ["Este documento cuenta con cadena de custodia certificada por ley para juicios penales inmediatos."],
      riskWarning: "Defina claramente los límites del reporte técnico ante directores de ciberseguridad o legales.",
      probableObjection: "¿Cómo se exporta? En formato Markdown sanitizado de fácil copia para minutas de O&M."
    },
    {
      title: "10. Readiness Checklist",
      time: "50s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Evaluación de preparación técnica antes de proponer un piloto en terreno.",
      say: [
        "Para garantizar un piloto exitoso, revisamos el checklist de Readiness Score en el Field Proposal Center.",
        "Evaluamos si contamos con la autorización firmada del cliente, disponibilidad del Gateway local y zonas críticas definidas.",
        "Si no cumplimos con los mínimos de seguridad de red, el sistema bloquea preventivamente el inicio del piloto."
      ],
      dontSay: ["Iniciamos el piloto de inmediato sin verificar el estado de la red local o accesos de seguridad."],
      riskWarning: "El score requiere un mínimo de 80% y contar con autorización formal explícita para desbloquear el estado comercial.",
      probableObjection: "¿Qué pasa si da bajo? El técnico debe resolver las brechas de red o documentación con el cliente antes de proponer el piloto."
    },
    {
      title: "11. Objection Cards",
      time: "50s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Manejo interactivo de objeciones comerciales y técnicas para mitigar expectativas irreales.",
      say: [
        "Revisamos las tarjetas de Manejo de Objeciones, diseñadas para responder dudas frecuentes de gerentes de planta.",
        "Abordamos temas como el ancho de banda, la compatibilidad con NVRs y las malezas del parque solar.",
        "Esto alinea expectativas, aclarando que el sistema es un copiloto O&M de apoyo y no un reemplazo físico total."
      ],
      dontSay: ["No tenemos ninguna limitación técnica; nuestro software es perfecto e infalible bajo cualquier escenario."],
      riskWarning: "Use las objeciones para delimitar responsabilidades de manera honesta y profesional.",
      probableObjection: "¿Cómo manejan el viento? Mediante filtrado de movimiento de alta frecuencia para descartar oscilaciones naturales."
    },
    {
      title: "12. Roadmap de Piloto Comercial",
      time: "50s",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Cronograma claro de implementación no invasiva en fases de 7 a 15 días.",
      say: [
        "El Roadmap del Piloto define las fases: instalación del Gateway Edge, calibración lógica, pruebas y reporte de resultados.",
        "Proponemos una duración acotada y responsable de 7 a 15 días para demostrar la utilidad operacional.",
        "Esto culmina en un informe técnico de viabilidad para que el cliente decida responsablemente el paso a producción."
      ],
      dontSay: ["Dejamos el hardware instalado de por vida sin costo adicional de forma permanente."],
      riskWarning: "Toda fase de instalación requiere coordinación previa con el supervisor de HSE del parque solar.",
      probableObjection: "¿Qué hardware se instala? Un micro-servidor Edge local seguro e industrial, sin conexión a internet si se requiere."
    }
  ];

  // Route 15 min: Presentación extendida completa para comités técnicos
  const route15min: DemoStep[] = [
    {
      title: "1. Introducción al Problema Operacional de CCTV Solar",
      time: "1min",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Las plantas solares abarcan hectáreas con CCTV aislado y alto índice de falsas alarmas que fatigan operadores.",
      say: [
        "Estimado comité técnico. Hoy presentamos una solución de visibilidad perimetral y diagnóstico de CCTV para la línea Field.",
        "Los parques solares de O&M sufren fallas constantes de enlaces inalámbricos y maleza que obstruye el perímetro de seguridad.",
        "Sentinel IA Field actúa como copiloto de apoyo O&M, centralizando estados y priorizando eventos bajo estricta autorización del cliente."
      ],
      dontSay: ["Prometemos una detección 100% infalible ante cualquier intruso o prevención absoluta de robos de cables."],
      riskWarning: "Evite sobrepromesas comerciales. Enfoque el discurso en asistencia operacional, visibilidad y diagnósticos CCTV.",
      probableObjection: "¿Funciona de noche? Sí, la capacidad depende de los iluminadores infrarrojos o cámaras térmicas instaladas en el parque."
    },
    {
      title: "2. Separación de Líneas: Field, Community y Consumer",
      time: "1min",
      screen: "consumerbridge",
      screenLabel: "Consumer Bridge",
      keyMessage: "Especialización por segmento de negocio: la línea Field es para entornos industriales críticos, no residenciales.",
      say: [
        "Sentinel se estructura en tres líneas bien definidas: Field (entornos industriales críticos y parques solares).",
        "Community (seguridad residencial y condominios) y Consumer (integración para hogares mediante puentes de consumo como Eufy).",
        "La línea Field cumple con estrictos estándares de ciberseguridad industrial y redacción de secretos para no exponer credenciales."
      ],
      dontSay: ["La línea Consumer de hogar tiene los mismos requisitos y niveles de redundancia de fibra que un parque solar."],
      riskWarning: "Mantenga la conversación enfocada en la línea Field. Muestre la tarjeta comparativa de Consumer solo como referencia de especialización.",
      probableObjection: "¿Podemos mezclar cámaras residenciales en el parque solar? No, la línea Field exige cámaras IP industriales por ciberseguridad."
    },
    {
      title: "3. Consola de Campo: Field Operations",
      time: "1min",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Dashboard principal con mapa de zonas críticas y estados de red simulados de laboratorio.",
      say: [
        "Aquí visualizamos el Field Operations Center, la consola central para el operador de turno del parque solar.",
        "El mapa simplificado muestra de forma limpia las cámaras organizadas por áreas de interés operacional.",
        "No exponemos direcciones de red reales ni claves de acceso en pantalla, aplicando estrictas pautas de sanitización."
      ],
      dontSay: ["Esta pantalla transmite video real sin enmascaramiento desde la red del parque solar en este momento."],
      riskWarning: "Verifique que el modo demo esté activo para garantizar que no se expongan IPs ni RTSP reales.",
      probableObjection: "¿Cómo se integra con nuestro NVR? Se conecta en paralelo al switch de distribución, consumiendo flujos RTSP autorizados."
    },
    {
      title: "4. Estado por Zonas Críticas",
      time: "1min",
      screen: "fieldoperations",
      screenLabel: "Field Operations Center",
      keyMessage: "Focalización en áreas sensibles como subestaciones de potencia, transformadores y perímetros generales.",
      say: [
        "El software agrupa las cámaras lógicamente en zonas perimetrales críticas como Cerco Norte, Subestación y Oficinas.",
        "Esto permite monitorear de manera rápida la salud del CCTV en áreas vulnerables del parque solar.",
        "El sistema es un copiloto de visibilidad y no reemplaza los protocolos HSE ni SCADA de la planta."
      ],
      dontSay: ["Esta consola controla directamente los interruptores de potencia o equipos de media tensión de la subestación."],
      riskWarning: "La plataforma es estrictamente para CCTV y analítica operativa, no es un sistema de control SCADA industrial.",
      probableObjection: "¿Qué pasa si se pierde la cámara de la subestación? El sistema alerta de inmediato mediante diagnóstico de latencia simulada."
    },
    {
      title: "5. Cámaras sin Señal y Vistas Obstruidas",
      time: "1min",
      screen: "diagnostics",
      screenLabel: "CCTV Diagnostics",
      keyMessage: "Detección rápida de cámaras desalineadas, lentes sucios o pérdidas lógicas de transmisión.",
      say: [
        "En parques solares, es común que la maleza crezca y obstruya el lente de una cámara, o que el viento la desalinee.",
        "Nuestras herramientas de diagnóstico identifican lógicamente estas pérdidas de calidad y fallas de transmisión.",
        "Esto evita que las fallas queden ocultas durante días, permitiendo programar mantenimientos preventivos a tiempo."
      ],
      dontSay: ["Nuestra IA remueve la maleza o limpia los lentes sucios de manera digital y remota."],
      riskWarning: "La calibración inicial y la limpieza física en terreno siguen siendo indispensables para el rendimiento de la IA.",
      probableObjection: "¿Detecta vandalismo? Sí, la pérdida abrupta de señal o el cambio radical de escena se registran como anomalías."
    },
    {
      title: "6. Simulación de Posible Intrusión Perimetral",
      time: "1min",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Flujo de alerta y clasificación preliminar de posibles anomalías para revisión humana.",
      say: [
        "Cuando ocurre un posible evento perimetral de interés, este ingresa al Incident Center de forma estructurada.",
        "El sistema genera una ficha de incidente local para que el supervisor documente y asigne tareas de verificación.",
        "Toda información de la demo corresponde a escenarios ficticios sanitizados de laboratorio para proteger la ciberseguridad local."
      ],
      dontSay: ["Nuestra IA confirma robos con un 100% de validez judicial inmediata sin validación de guardias de turno."],
      riskWarning: "Toda alerta generada por la IA debe ser verificada y validada físicamente por un operador humano calificado.",
      probableObjection: "¿Envía correos electrónicos? Sí, se pueden configurar notificaciones técnicas de incidentes bajo aprobación."
    },
    {
      title: "7. Context AI Responsable",
      time: "1min",
      screen: "contextai",
      screenLabel: "Context AI & Baseline",
      keyMessage: "Asistencia contextual inteligente para estructurar diagnósticos técnicos sin exponer datos en internet.",
      say: [
        "El supervisor utiliza Context AI para redactar un análisis técnico inicial del incidente de CCTV.",
        "Esto ayuda a responder con rapidez y estandarizar la documentación operacional entre distintos turnos de guardia.",
        "Garantizamos que el procesamiento se realiza bajo estrictas políticas de privacidad, descartando envío de datos sensibles."
      ],
      dontSay: ["La IA tiene autorización automática para dictaminar culpas contractuales en pérdidas de activos."],
      riskWarning: "La asistencia contextual es sugerida y el criterio experto humano es la última palabra.",
      probableObjection: "¿Cómo se alimenta la IA? Utiliza metadatos técnicos locales, códigos de error de red y plantillas de diagnóstico predefinidas."
    },
    {
      title: "8. Diagnóstico Técnico CCTV & Enlaces de Radio",
      time: "1min",
      screen: "diagnostics",
      screenLabel: "CCTV Diagnostics",
      keyMessage: "Mapeo lógico de puertos de switch PoE, latencia simulada y estado de enlaces de radio del parque.",
      say: [
        "El módulo de diagnóstico audita la red local de cámaras mediante pings de latencia simulada y estados lógicos PoE.",
        "Ayuda a discernir si un fallo es de la cámara física, de la alimentación del switch o del enlace de radiofrecuencia local.",
        "La información sensible de la red está enmascarada para resguardar la ciberseguridad industrial."
      ],
      dontSay: ["Ofrecemos control industrial de firmware o mapeo de puertos públicos no autorizados en la red del cliente."],
      riskWarning: "La herramienta realiza un monitoreo pasivo seguro que no altera el tráfico de red de producción.",
      probableObjection: "¿Soporta switches industriales Moxa o Cisco? Sí, es agnóstico y lee estados lógicos mediante protocolos estándar autorizados."
    },
    {
      title: "9. Evidence Report y Trazabilidad Local",
      time: "1min",
      screen: "evidence",
      screenLabel: "Evidence Report",
      keyMessage: "Compilación de reportes técnicos de laboratorio firmados localmente mediante control de integridad.",
      say: [
        "El Evidence Report unifica el análisis de la anomalía: metadatos, diagnóstico, clips simulados y firmas de trazabilidad.",
        "Sirve como evidencia técnica de laboratorio para auditar los SLA de mantención del proveedor de CCTV.",
        "Descartamos explícitamente cualquier validez judicial certificada de manera automática sin peritaje externo formal."
      ],
      dontSay: ["Nuestros reportes de video se firman en blockchain para validez judicial internacional inmediata."],
      riskWarning: "Aclarar que los reportes documentan eventos internos y no constituyen pruebas judiciales certificadas por sí solos.",
      probableObjection: "¿Los reportes son editables? Permiten agregar notas lógicas del supervisor, manteniendo la trazabilidad original protegida."
    },
    {
      title: "10. Privacy & Authorization Brief",
      time: "1min",
      screen: "privacy",
      screenLabel: "Privacy & Compliance",
      keyMessage: "Política responsable de datos: sin datos reales, sin IPs ni RTSP en pantalla, descartando anonimato absoluto.",
      say: [
        "El Brief de Privacidad establece que el sistema opera exclusivamente bajo autorización del cliente y de forma ética.",
        "Mantenemos enmascaramiento local de zonas de no interés perimetral para proteger la privacidad de áreas públicas aledañas.",
        "Aclaramos de manera transparente que se descarta cualquier aserción de anonimato absoluto en entornos de producción."
      ],
      dontSay: ["Garantizamos anonimato absoluto e inviolable de cualquier rostro procesado en producción activa."],
      riskWarning: "Toda analítica cumple regulaciones éticas locales y está acotada al perímetro industrial autorizado.",
      probableObjection: "¿Se guardan rostros? No, la línea Field prioriza objetos de gran tamaño y anomalías de CCTV, no reconocimiento facial."
    },
    {
      title: "11. Pilot Scope Builder",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Constructor interactivo de alcances para configurar un piloto seguro de 1 a 3 cámaras y de 7 a 15 días.",
      say: [
        "Utilizamos el Pilot Scope Builder para dimensionar el alcance inicial del piloto de terreno.",
        "Para una prueba controlada y segura, configuramos un alcance de 1 a 3 cámaras y una duración de 7 a 15 días.",
        "Este alcance acotado y responsable permite evaluar el comportamiento de la IA en condiciones climáticas reales de campo."
      ],
      dontSay: ["Aseguramos que el piloto puede conectarse a toda la infraestructura crítica de la red de energía sin inspección de seguridad."],
      riskWarning: "Toda propuesta comercial está supeditada a un diagnóstico de red previo por parte de personal autorizado.",
      probableObjection: "¿Cuánto dura la instalación del piloto? Generalmente se realiza en un par de horas en coordinación con O&M."
    },
    {
      title: "12. Readiness Score & Checklist Técnico",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Auditoría de factibilidad técnica: requiere mínimo 80% y firmas autorizadas de O&M, seguridad y HSE.",
      say: [
        "El Readiness Score evalúa de manera estricta si el parque solar está preparado técnicamente para el piloto.",
        "Se revisa la disponibilidad del Gateway local, el acceso a switches y la definición de zonas críticas del cerco.",
        "Si faltan firmas autorizadas o el score es inferior al 80%, el sistema bloquea preventivamente el avance comercial."
      ],
      dontSay: ["Saltamos las firmas de seguridad o la autorización del encargado de ciberseguridad industrial del parque."],
      riskWarning: "La autorización formal firmada del cliente y la validación de zonas críticas son requisitos de bloqueo absoluto.",
      probableObjection: "¿Qué pasa si la red local del parque es deficiente? El score lo indicará, y se deberá subsanar antes del piloto."
    },
    {
      title: "13. Objection Cards",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Respuestas técnicas y honestas ante objeciones frecuentes de ciberseguridad y mantenimiento.",
      say: [
        "Revisamos el Manejo de Objeciones, donde resolvemos las dudas críticas de los departamentos de TI y O&M.",
        "Explicamos de forma transparente cómo opera el Gateway local de manera segura en paralelo a la red operativa.",
        "De este modo, se mitigan expectativas irreales y se asegura una relación de largo plazo con el cliente."
      ],
      dontSay: ["Nuestra IA es mágica, infalible y no posee ninguna limitación técnica en entornos reales."],
      riskWarning: "La honestidad técnica y comercial es la base para lograr un piloto perimetral seguro y coordinado.",
      probableObjection: "¿La IA se confunde con la maleza alta? El sistema requiere calibrar áreas de exclusión lógica para evitar falsas alertas por vegetación."
    },
    {
      title: "14. Field Pilot Roadmap",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Cronograma de 4 etapas: levantamiento de red, instalación del Gateway local, calibración de IA y reporte final.",
      say: [
        "El cronograma propuesto para el piloto se divide en etapas claras: Día 1 (levantamiento y conexión física del Gateway).",
        "Días 2-3 (calibración lógica de cercos), Días 4-8 (monitoreo en paralelo) y Día 9-10 (generación de reporte de viabilidad).",
        "Este plan no invasivo asegura cumplir con los estrictos parámetros HSE exigidos en plantas de energía."
      ],
      dontSay: ["La instalación se realizará de noche sin coordinar con el supervisor de seguridad física de la planta."],
      riskWarning: "Todo técnico en terreno debe portar sus elementos de protección personal (EPP) y contar con validación HSE vigente.",
      probableObjection: "¿Qué pasa al final del piloto? Se entrega un reporte ejecutivo formal con métricas de asertividad local."
    },
    {
      title: "15. Field Proposal Report",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Generación de propuesta ejecutiva en formato Markdown, libre de credenciales reales e IPs.",
      say: [
        "El Field Proposal Center nos permite exportar la propuesta comercial y el alcance del piloto en un reporte Markdown limpio.",
        "Este informe se puede copiar directamente y contiene el resumen ejecutivo, alcances, roadmap e indicadores de preparación.",
        "Se omiten por diseño credenciales y puertos reales para resguardar la ciberseguridad del parque solar."
      ],
      dontSay: ["Este reporte contiene las contraseñas reales SSH y RTSP de las cámaras del parque solar."],
      riskWarning: "Verifique que la propuesta exportada esté sanitizada y no contenga datos confidenciales de la planta.",
      probableObjection: "¿Se puede personalizar el reporte? Sí, el Markdown se puede copiar y adaptar a las plantillas del cliente."
    },
    {
      title: "16. Cierre Técnico de la Demo y Próximos Pasos",
      time: "1min",
      screen: "fieldproposal",
      screenLabel: "Field Proposal Center",
      keyMessage: "Cierre comercial responsable orientado a habilitar un piloto acotado de 1-3 cámaras.",
      say: [
        "Para concluir. No proponemos reemplazar su operación actual de seguridad física ni sus grabadores NVR existentes.",
        "Proponemos ejecutar un piloto acotado de 1 a 3 cámaras perimetrales autorizadas para validar la utilidad en terreno y calidad del diagnóstico.",
        "Con los resultados técnicos en la mano, ustedes podrán decidir con total confianza si conviene escalar la solución."
      ],
      dontSay: ["Su central de seguridad es obsoleta y deben cambiar todas sus cámaras de inmediato por las nuestras."],
      riskWarning: "La honestidad en el cierre previene malentendidos y asienta una colaboración comercial confiable.",
      probableObjection: "¿Qué requerimos para iniciar? Únicamente firmar el acta de autorización de piloto y agendar el levantamiento técnico."
    }
  ];

  const getActiveRoute = (): DemoStep[] => {
    switch (selectedDuration) {
      case "3min":
        return route3min;
      case "10min":
        return route10min;
      case "15min":
        return route15min;
      case "5min":
      default:
        return route5min;
    }
  };

  const steps = getActiveRoute();
  const currentStep = steps[currentStepIndex] || steps[0] || {
    title: "Intro",
    time: "1m",
    screen: "fieldoperations",
    screenLabel: "Operations",
    keyMessage: "Context",
    say: [],
    dontSay: [],
    riskWarning: "",
    probableObjection: ""
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      triggerToast("¡Ruta de presentación completada de forma responsable!");
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleNavigate = (screen: string) => {
    if (setCurrentTab) {
      setCurrentTab(screen);
      if (onAddAuditLog) {
        onAddAuditLog(
          "Navegación Guiada Demo Field",
          `Navegado a la pantalla '${screen}' durante el paso '${currentStep.title}'.`
        );
      }
      triggerToast(`Navegando a ${currentStep.screenLabel}...`);
    } else {
      triggerToast("Navegación no disponible en este contexto.");
    }
  };

  // --- AUDIENCE ADAPTER ---
  const audienceInfo = {
    gerente_om: {
      label: "Gerente de O&M",
      focus: "Valor operacional directo, disponibilidad de hardware, reportes de mantenimiento, piloto no invasivo.",
      keywords: "Eficiencia, SLA de cámaras, disponibilidad técnica de O&M, minimización de falsas alarmas perimetrales.",
      objection: "Temor a que la IA consuma recursos del servidor SCADA o requiera cambios costosos de cableado en terreno.",
      close: "Proponer el piloto de 1-3 cámaras para auditar de forma objetiva la visibilidad sin alterar la infraestructura."
    },
    jefe_planta: {
      label: "Jefe de Planta",
      focus: "Estado diario del cerco perimetral, visualización simplificada por zonas, coordinación ágil de incidentes.",
      keywords: "Trazabilidad local, alertas rápidas de cámaras fuera de señal, maleza en cerco perimetral, turnos de guardia.",
      objection: "Saturación de correos o alertas falsas por viento fuerte en el cerco perimetral durante la noche.",
      close: "Demostrar cómo se configuran las exclusiones lógicas de maleza para reducir el alertamiento innecesario."
    },
    supervisor_tecnico: {
      label: "Supervisor Técnico",
      focus: "Latencias de enlace de radio, telemetría PoE de switches, estados RTSP/ONVIF de cámaras de campo.",
      keywords: "Diagnóstico técnico de CCTV, direccionamiento lógico enmascarado, ping de latencia simulada, Gateway local.",
      objection: "Pérdida de paquetes en tramos de fibra óptica largos o incompatibilidad con switches Moxa de subestaciones.",
      close: "Revisar el panel de CCTV Diagnostics y proponer una auditoría pasiva de red local sin riesgo operacional."
    },
    seguridad_fisica: {
      label: "Seguridad Física",
      focus: "Apoyo al monitoreo nocturno, priorización visual de alertas perimetrales, no reemplazo de personal humano.",
      keywords: "Herramienta copiloto, bitácora del Incident Center, resguardo de privacidad de pasillos públicos, guardias.",
      objection: "Rechazo del personal de seguridad por creer que el software busca automatizar y eliminar sus empleos.",
      close: "Enfatizar firmemente que el sistema es un copiloto táctico que potencia al guardia, no un reemplazo de personal."
    },
    cliente_pmgd: {
      label: "Cliente PMGD",
      focus: "Transparencia operacional, evidencia técnica documentada, limitaciones de alcance responsables, cumplimiento ético.",
      keywords: "Evidencia técnica de laboratorio, trazabilidad protegida mediante SHA-256, sin IPs reales, privacidad activa.",
      objection: "Filtración de videos operacionales del parque en redes sociales o violaciones normativas de privacidad.",
      close: "Exponer el Privacy & Authorization Brief y explicar la redacción de secretos y enmascaramiento de deslindes."
    },
    comite_tecnico: {
      label: "Comité Técnico",
      focus: "Factibilidad de red, requisitos de instalación segura del Gateway local, mitigación de riesgos de ciberseguridad.",
      keywords: "Gateway local seguro en paralelo, monitoreo pasivo, cumplimiento HSE, Roadmap acotado de 4 etapas.",
      objection: "Apertura de puertos públicos en internet o vulneración del perímetro cibernético crítico de la planta solar.",
      close: "Garantizar que el micro-servidor Edge corre 100% local, sin abrir puertos entrantes y con redacción de claves."
    },
    hse: {
      label: "Equipo HSE",
      focus: "Seguridad y salud en el trabajo, delimitación estricta de áreas de riesgo, no reemplazo de protocolos de seguridad.",
      keywords: "Zonas excluidas de radiación, elementos de protección personal (EPP), cero interferencia con SCADA de potencia.",
      objection: "Técnicos que instalan hardware sin inducción HSE previa o en zonas eléctricas de alta tensión sin autorización.",
      close: "Explicar el protocolo de instalación segura en coordinación con el prevencionista del parque."
    },
    proveedor_cctv: {
      label: "Proveedor CCTV / Integrador",
      focus: "Compatibilidad técnica de cámaras existentes, no invasión, diagnóstico previo de red, Gateway local.",
      keywords: "Protocolos RTSP, soporte ONVIF estándar, switch PoE local, validación de enlaces, trabajo coordinado.",
      objection: "Temor a ser culpados por las cámaras deficientes del condominio o parque solar, o incompatibilidad de hardware.",
      close: "Mostrar cómo el software ayuda a diagnosticar fallas de enlace, facilitando su trabajo de mantenimiento físico."
    }
  };

  // --- POST-DEMO FOLLOW-UP MINUTA TEMPLATE ---
  const followUpTemplate = `Estimado Equipo de O&M,

Agradecemos sinceramente su tiempo durante la demostración en vivo de ORBI Sentinel IA Field para su planta solar. 

A continuación, resumimos los puntos clave y los acuerdos responsables alcanzados:

1. Objetivos del Piloto Acotado:
   - Validar la factibilidad técnica y la compatibilidad lógica de la red de CCTV perimetral existente.
   - Evaluar la priorización operacional de eventos y el alertamiento temprano de anomalías.
   - Comprobar las herramientas de diagnóstico local de CCTV y generación de informes de evidencia.

2. Alcance Propuesto (Pilot Scope Builder):
   - Integración de un piloto limitado a un rango responsable de 1 a 3 cámaras perimetrales autorizadas.
   - Duración acotada de prueba de 7 a 15 días (ejemplo de 10 días).
   - Exclusión explícita de zonas que no correspondan al cerco perimetral autorizado o que comprometan la privacidad residencial de deslindes.

3. Privacidad y Seguridad (Privacy Brief):
   - El sistema opera 100% de forma local mediante un micro-servidor Edge seguro.
   - No se realiza apertura de puertos públicos en internet ni exposición de credenciales SSH/RTSP.
   - Se descarta cualquier aserción de anonimato absoluto en entornos de producción, resguardando la trazabilidad local con firmas SHA-256 de laboratorio.
   - El sistema actúa exclusivamente como un copiloto de visibilidad y no reemplaza el SCADA de potencia, los guardias físicos ni los grabadores NVR.

4. Próximos Pasos Técnicos Requeridos:
   - Firma del Acta de Autorización Expresa para Piloto Técnico de Campo.
   - Agendamiento de 1 jornada técnica para el levantamiento de subred local, inventario de cámaras y accesos autorizados.
   - Coordinación con el supervisor de HSE del parque para cumplir los estándares de seguridad industrial.

Quedamos a su disposición para coordinar el inicio de este levantamiento preventivo y responsable.

Atentamente,
Equipo ORBI Sentinel IA Field
🛰️ Field Operations & O&M Security Copilot`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(followUpTemplate);
    triggerToast("¡Minuta de seguimiento O&M copiada al portapapeles!");
    if (onAddAuditLog) {
      onAddAuditLog(
        "Copia de Minuta de Seguimiento",
        "Se copió la plantilla de minuta de seguimiento post-demo O&M sanitizada."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold font-sans text-white tracking-tight">Guided Field Demo</h2>
            </div>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Consola de presentación guiada y Talk Tracks en tiempo real para la línea industrial <strong>ORBI Sentinel IA Field</strong>. Diseñada para mantener un discurso comercial/técnico ordenado, ético y sin sobrepromesas ante gerentes de O&M, comités y directores de ciberseguridad.
            </p>
          </div>

          {/* Combined Quality Assurance Badge */}
          {(() => {
            let statusText = "Ready for Guided Field Demo";
            let badgeClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            let iconClass = "text-emerald-400";

            if (isCriticalBlocked) {
              statusText = "Blocked";
              badgeClass = "text-red-400 bg-red-500/10 border-red-500/20";
              iconClass = "text-red-400";
            } else if (percent < 100) {
              statusText = "Needs Review";
              badgeClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
              iconClass = "text-amber-400";
            }

            return (
              <div className={`flex items-center gap-3 border rounded-xl p-3 shrink-0 shadow-md ${badgeClass}`}>
                <ShieldCheck className={`w-5 h-5 ${iconClass} shrink-0`} />
                <div className="text-left">
                  <span className="text-[9px] font-mono uppercase tracking-wider block opacity-70">AUDITORÍA DE DEMO LIVE</span>
                  <span className="text-xs font-bold uppercase block">{statusText}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Control Panel: Durations & Audiences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              1. Duración de la Reunión
            </h3>
            <p className="text-[10px] text-slate-500">Adapta el número de pasos y el foco según el tiempo asignado.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "3min", label: "3 Minutos", desc: "Demo Rápida" },
              { id: "5min", label: "5 Minutos", desc: "Demo Estándar" },
              { id: "10min", label: "10 Minutos", desc: "Demo Técnica" },
              { id: "15min", label: "15 Minutos", desc: "Demo Extendida" }
            ].map((dur) => (
              <button
                key={dur.id}
                onClick={() => {
                  setSelectedDuration(dur.id as DemoDuration);
                  setCurrentStepIndex(0);
                  triggerToast(`Ruta cambiada a demo de ${dur.label}.`);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedDuration === dur.id
                    ? "bg-emerald-500/15 border-emerald-500/40 text-white"
                    : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <span className="text-xs font-bold block">{dur.label}</span>
                <span className="text-[9px] font-mono block text-slate-500 mt-0.5">{dur.desc}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                2. Audiencia Objetivo
              </h3>
              <p className="text-[10px] text-slate-500">Adapta el lenguaje comercial, los beneficios y maneja objeciones.</p>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
              {Object.entries(audienceInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedAudience(key as AudienceType);
                    triggerToast(`Foco de audiencia cambiado a: ${info.label}`);
                  }}
                  className={`px-3 py-2 text-left rounded-lg text-xs border transition-all ${
                    selectedAudience === key
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                      : "bg-slate-950/50 border-slate-900 text-slate-400 hover:text-slate-300 hover:bg-slate-900/30"
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Adaptive Audience Brief Box */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Enfoque de Audiencia: {audienceInfo[selectedAudience].label}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Filtro Activo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">FOCO PRINCIPAL</span>
                <p className="text-slate-200 leading-relaxed font-sans">{audienceInfo[selectedAudience].focus}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">CONCEPTOS CLAVE</span>
                <p className="text-emerald-300 leading-relaxed font-mono text-[11px]">{audienceInfo[selectedAudience].keywords}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-slate-800/60 pt-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-rose-400 uppercase block">OBJECIÓN PROBABLE</span>
                <p className="text-slate-300 leading-relaxed font-sans">{audienceInfo[selectedAudience].objection}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase block">CIERRE RECOMENDADO</span>
                <p className="text-slate-300 leading-relaxed font-sans">{audienceInfo[selectedAudience].close}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-400 leading-normal">
            <strong>Consejo Comercial:</strong> Al presentar ante un <strong>{audienceInfo[selectedAudience].label}</strong>, adapte su vocabulario. No prometa detecciones absolutas de robos perimetrales. Enfoque en la eficiencia operacional del CCTV.
          </div>
        </div>
      </div>

      {/* Main Stepper Navigation */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">PASO {currentStepIndex + 1} DE {steps.length} • DEMO DE {selectedDuration.toUpperCase()}</span>
            <h3 className="text-base font-bold text-white font-sans">{currentStep.title}</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-900 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30 disabled:hover:bg-emerald-500/10 transition-all text-xs font-bold font-mono uppercase"
            >
              Siguiente Paso
            </button>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Talk Tracks & Speaker Notes */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  ¿QUÉ DECIR? (Guión Sugerido de Campo)
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Tiempo: {currentStep.time}</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 font-sans leading-relaxed">
                {currentStep.say.map((phrase, idx) => (
                  <p key={idx} className="relative pl-4 border-l border-emerald-500/20">
                    <span className="absolute left-0 top-0 text-emerald-400 font-bold">“</span>
                    {phrase}
                    <span className="text-emerald-400 font-bold">”</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Avoid promising / What NOT to say */}
            <div className="bg-rose-950/10 border border-rose-500/10 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                ¿QUÉ NO DECIR? (Evitar sobrepromesas / Riesgos de Responsabilidad)
              </span>

              <ul className="space-y-1.5 text-xs text-slate-400 list-disc pl-4 font-sans leading-relaxed">
                {currentStep.dontSay.map((phrase, idx) => (
                  <li key={idx}>
                    <span className="text-rose-300 font-bold font-mono">No decir:</span> {phrase}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Panel & Navigation Trigger */}
          <div className="lg:col-span-4 space-y-4">
            {/* Direct Navigation Card */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-4 text-center">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Pantalla recomendada para este paso</span>
                <span className="text-xs font-bold font-sans text-slate-200 block border border-slate-800 rounded-lg py-1.5 bg-slate-900/40">
                  🛰️ {currentStep.screenLabel}
                </span>
              </div>

              <button
                onClick={() => handleNavigate(currentStep.screen)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md font-sans uppercase tracking-wider"
              >
                <span>Ir a Pantalla</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[9px] text-slate-500 leading-normal font-mono">
                Al presionar, se cargará la vista recomendada en la barra lateral izquierda, manteniendo esta consola interactiva activa.
              </p>
            </div>

            {/* Mitigación de riesgos y objeciones de paso */}
            <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-2.5">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block">RIESGO DE SOBREPROCESO / LÍMITES</span>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{currentStep.riskWarning}</p>
              </div>

              <div className="border-t border-slate-900 pt-2.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">OBJECIÓN PROBABLE DEL PASO</span>
                <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed">"{currentStep.probableObjection}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar indicator */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Field Demo Guardrails panel (Permanent reminder) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          Field Demo Guardrails & Responsible Alignment Panel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="bg-rose-950/5 border border-rose-500/10 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">🚫 NO PROMETER EN LA REUNIÓN:</span>
            <ul className="space-y-1.5 text-slate-400 pl-4 list-disc font-sans">
              <li><strong className="text-rose-400">Detección perfecta:</strong> Evitar prometer un 100% de detección perimetral libre de fallas de visibilidad.</li>
              <li><strong className="text-rose-400">Prevención absoluta:</strong> No asegurar la detención o disuasión mágica de delitos o robos de cobre.</li>
              <li><strong className="text-rose-400">Producción 24/7 inmediata:</strong> El software requiere validación humana y calibración local inicial en terreno.</li>
              <li><strong className="text-rose-400">Reemplazo total:</strong> No pretender reemplazar la seguridad física, NVRs, SCADA, O&M o protocolos HSE.</li>
              <li><strong className="text-rose-400">Evidencia legal certificada:</strong> El reporte es evidencia técnica de laboratorio local, no un peritaje oficial.</li>
              <li><strong className="text-rose-400">Compatibilidad universal:</strong> La compatibilidad está supeditada a subredes, ONVIF y accesos autorizados.</li>
            </ul>
          </div>

          <div className="bg-emerald-950/5 border border-emerald-500/10 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">🟢 SÍ AFIRMAR Y DEFENDER EN LA REUNIÓN:</span>
            <ul className="space-y-1.5 text-slate-400 pl-4 list-disc font-sans">
              <li><strong className="text-emerald-400">Apoyo operacional:</strong> Es un copiloto que centraliza visibilidad y prioriza anomalías perimetrales.</li>
              <li><strong className="text-emerald-400">Diagnóstico de CCTV:</strong> Identifica latencias simuladas, obstrucción de lentes o desalineamientos de cámaras.</li>
              <li><strong className="text-emerald-400">Trazabilidad local:</strong> Mantiene una bitácora protegida para auditorías internas de O&M.</li>
              <li><strong className="text-emerald-400">Piloto acotado:</strong> Propuesta responsable de 1 a 3 cámaras durante un período de 7 a 15 días.</li>
              <li><strong className="text-emerald-400">Coordinación humana:</strong> Requiere validación del operador y coordinación con el supervisor HSE de planta.</li>
              <li><strong className="text-emerald-400">Ciberseguridad pasiva:</strong> Opera de forma pasiva en red local sin abrir puertos de red públicos.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pre-Presentation Audit checklist */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-emerald-400" />
              Live Field Demo Pre-Presentation Audit Checklist
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Garantiza el cumplimiento ético y la seguridad técnica de la demostración antes de proyectar la pantalla ante stakeholders reales.
            </p>
          </div>

          <button
            onClick={() => {
              setChecklist({
                demoModeActive: true,
                lineFieldActive: true,
                noRealData: true,
                noIpsRtspCredentialsReal: true,
                fieldOperationsReady: true,
                fieldProposalReady: true,
                presentationModeReady: true,
                audienceModeCorrect: true,
                guardrailsVisible: true,
                objectionCardsReady: true,
                proposalReportReady: true,
                scopeBuilderConfigured: true,
                readinessScoreReviewed: true,
                nextStepDefined: true
              });
              triggerToast("Checklist restaurado.");
            }}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold uppercase"
          >
            Restablecer checklist
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: "demoModeActive", label: "Modo Demo Activo", tooltip: "Evita enlaces directos a cámaras reales sin enmascaramiento." },
            { key: "lineFieldActive", label: "Línea Field Activa", tooltip: "Asegura estar en el flujo operacional de parques solares de la demo." },
            { key: "noRealData", label: "Sin Datos Reales (CRÍTICO)", tooltip: "Dato simulado y nombres ficticios. No usar datos de clientes reales." },
            { key: "noIpsRtspCredentialsReal", label: "Sin IPs ni RTSP Reales", tooltip: "Asegura que no se expongan contraseñas o subredes de ciberseguridad industrial." },
            { key: "fieldOperationsReady", label: "Field Operations Center Preparado", tooltip: "El mapa y listado de cámaras de terreno están listos para proyectarse." },
            { key: "fieldProposalReady", label: "Field Proposal Listo", tooltip: "La propuesta ejecutiva de una página está completa." },
            { key: "presentationModeReady", label: "Presentation Mode Listo", tooltip: "La secuencia de 9 slides de la propuesta está configurada." },
            { key: "audienceModeCorrect", label: "Audience Mode Correcto", tooltip: "Se ha seleccionado la audiencia correcta para enfocar los Talk Tracks." },
            { key: "guardrailsVisible", label: "Guardrails Visibles (CRÍTICO)", tooltip: "Los límites del alcance del software se exponen visiblemente." },
            { key: "objectionCardsReady", label: "Objection Cards Listas", tooltip: "Las tarjetas de objeciones están revisadas para mitigar falsas expectativas." },
            { key: "proposalReportReady", label: "Proposal Report Copiable", tooltip: "El reporte en Markdown para entregar está sanitizado." },
            { key: "scopeBuilderConfigured", label: "Scope Builder Configurado", tooltip: "El constructor se acota a un piloto de 1-3 cámaras autorizadas." },
            { key: "readinessScoreReviewed", label: "Readiness Score Revisado", tooltip: "Se ha evaluado la preparación técnica y física del parque solar." },
            { key: "nextStepDefined", label: "Próximo Paso Definido (CRÍTICO)", tooltip: "Se tiene claro que el próximo paso es el levantamiento local de red y autorización." }
          ].map((item) => {
            const val = checklist[item.key as keyof typeof checklist];
            const isCritical = ["noRealData", "guardrailsVisible", "nextStepDefined"].includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                className="flex items-start gap-3 p-3 bg-slate-950/60 hover:bg-slate-900/60 rounded-xl text-left text-xs transition-all border border-slate-900"
              >
                <input
                  type="checkbox"
                  checked={val}
                  readOnly
                  className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer h-4 w-4 shrink-0 mt-0.5"
                />
                <div>
                  <span className={`block ${val ? "text-slate-200 font-bold" : "text-slate-500 line-through"}`}>
                    {item.label} {isCritical && <span className="text-[10px] font-mono text-red-400 font-bold ml-1 uppercase">(Crítico)</span>}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-normal block mt-1">{item.tooltip}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-Demo O&M Follow-up template */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Post-Demo O&M Follow-Up Template & Minuta
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              Plantilla de correo de seguimiento comercial y técnica, libre de precios definitivos o compromisos de producción forzada.
            </p>
          </div>

          <button
            onClick={handleCopyTemplate}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-800 rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            Copiar Minuta
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5">
          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {followUpTemplate}
          </pre>
        </div>
      </div>

      {/* Field Demo Close Script Panel */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 space-y-3">
        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
          Field Demo Close Script (Guión del Presentador para Cierre Responsable)
        </span>
        <blockquote className="text-sm text-slate-300 italic font-sans leading-relaxed pl-4 border-l-2 border-emerald-500/30">
          “Lo que proponemos no es reemplazar la operación existente, sino ejecutar un piloto acotado y autorizado con 1 a 3 cámaras para validar compatibilidad, utilidad operacional, diagnóstico CCTV y calidad de reportes. Con ese resultado, el cliente puede decidir responsablemente si conviene avanzar a una etapa mayor.”
        </blockquote>
      </div>
    </div>
  );
}
