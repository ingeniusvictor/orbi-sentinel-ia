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
  ListTodo
} from "lucide-react";

interface GuidedCommunityDemoProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
  setCurrentTab?: (tab: string) => void;
}

type DemoDuration = "3min" | "5min" | "10min";
type AudienceType = "comite" | "conserje" | "tecnico" | "vecino";

interface DemoStep {
  title: string;
  time: string;
  screen: string;
  screenLabel: string;
  keyMessage: string;
  say: string[];
  dontSay: string[];
  riskWarning: string;
}

export default function GuidedCommunityDemo({
  userRole,
  onAddAuditLog,
  setCurrentTab
}: GuidedCommunityDemoProps) {
  const [selectedDuration, setSelectedDuration] = useState<DemoDuration>("5min");
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>("comite");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic state for pre-demo checklist
  const [checklist, setChecklist] = useState({
    demoModeActive: true,
    noRealData: true,
    privacyShieldVisible: true,
    reportsSanitized: true,
    proposalPackReady: true,
    guidedDemoSelected: true,
    audienceModeCorrect: true,
    postDemoMinutaReady: true,
    nextStepDefined: true,
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
          "Configuración de Demo Checklist",
          `Marcado '${String(key)}' como ${next[key] ? "Listo" : "Pendiente"}.`
        );
      }
      return next;
    });
  };

  // Calculate readiness score
  const totalCheckItems = Object.keys(checklist).length;
  const completedCheckItems = Object.values(checklist).filter(Boolean).length;
  const readinessPercent = Math.round((completedCheckItems / totalCheckItems) * 100);

  let readinessStatus: "Ready" | "Needs Review" | "Blocked" = "Ready";
  if (readinessPercent < 50) {
    readinessStatus = "Blocked";
  } else if (readinessPercent < 100) {
    readinessStatus = "Needs Review";
  }

  // 3-Minute Demo Route
  const route3min: DemoStep[] = [
    {
      title: "El Problema de Complejidad en Conserjería",
      time: "45s",
      screen: "easyview",
      screenLabel: "Modo Conserje / EasyView",
      keyMessage: "Las consolas de seguridad tradicionales fatigan a los conserjes con tecnicismos.",
      say: [
        "En los condominios tradicionales, la conserjería maneja pantallas llenas de códigos, contraseñas expuestas y flujos pesados.",
        "Sentinel abstrae toda la complejidad y centraliza las cámaras en una interfaz simplificada de baja carga cognitiva.",
        "Esto permite que los guardias se concentren exclusivamente en vigilar el perímetro de forma intuitiva."
      ],
      dontSay: [
        "Garantizamos que este software reduce el personal de conserjería o reemplaza los guardias.",
        "Esta interfaz soluciona cualquier falla humana de atención por completo."
      ],
      riskWarning: "Evitar prometer optimizaciones de costos de personal directos. Sentinel es una herramienta de asistencia operativa, no un reemplazo de personal físico."
    },
    {
      title: "Consola Simplificada EasyView",
      time: "45s",
      screen: "easyview",
      screenLabel: "Modo Conserje / EasyView",
      keyMessage: "Operación táctil intuitiva y segura sin contraseñas de red expuestas.",
      say: [
        "Mostramos el Modo Conserje (EasyView). Como ven, no hay menús complejos de red, ni voltajes, ni cables.",
        "El conserje ve únicamente la cuadrícula, los nombres de las cámaras públicas y puede levantar incidentes en un par de toques.",
        "Incluso si el conserje hace clic accidentalmente en zonas de configuración, el sistema bloquea los accesos técnicos sensibles de forma automática."
      ],
      dontSay: [
        "Esta interfaz es compatible mágicamente con absolutamente cualquier cámara que el cliente ya tenga.",
        "Es un NVR en la nube que graba todo sin usar ancho de banda."
      ],
      riskWarning: "El conserje no tiene visibilidad técnica. Si un cliente pide ver configuraciones IP, aclare que es un rol exclusivo para administradores y técnicos de red."
    },
    {
      title: "Flujo y Reporte de Incidentes",
      time: "45s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Los incidentes generan evidencia digital con trazabilidad local protegida.",
      say: [
        "Cuando ocurre una anomalía, el conserje levanta el reporte inmediatamente en un formulario simple de baja fricción.",
        "El sistema genera una bitácora local de auditoría protegida mediante SHA-256 para la administración del condominio.",
        "Esto evita que las grabaciones o reportes de seguridad puedan ser borrados o alterados sin autorización."
      ],
      dontSay: [
        "Ofrecemos un registro inmutable en Blockchain indestructible.",
        "El sistema llama automáticamente a la policía local."
      ],
      riskWarning: "No use el término 'inmutable' a nivel comercial. Use 'trazabilidad local protegida mediante control de integridad' para evitar problemas legales de cumplimiento técnico."
    },
    {
      title: "Resguardo de Privacidad y Enmascaramiento",
      time: "45s",
      screen: "privacy",
      screenLabel: "Privacy & Compliance",
      keyMessage: "Exclusión estricta de espacios residenciales privados por diseño (Privacy Shield).",
      say: [
        "Una preocupación clave en condominios es la privacidad: que las cámaras de seguridad terminen apuntando a ventanas o terrazas residenciales.",
        "Con Sentinel, el administrador puede aplicar un enmascaramiento dinámico local para bloquear áreas deslindes y pasillos privados.",
        "Cumplimos con las normativas éticas de protección familiar, restringiendo la captura de rostros de menores o familiares."
      ],
      dontSay: [
        "Garantizamos total cumplimiento legal internacional ante cualquier juicio civil de forma automática.",
        "El software borra rostros del video original grabado de forma permanente en tiempo real en la cámara."
      ],
      riskWarning: "Aclare que el enmascaramiento de privacidad es local en el software y requiere configuración previa por parte de la administración del condominio."
    },
    {
      title: "Formulación de Piloto Acotado",
      time: "30s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Propuesta de piloto limitado de 1 a 3 cámaras públicas para demostrar viabilidad.",
      say: [
        "Para avanzar con confianza y seguridad, no pedimos contratos millonarios de inmediato.",
        "Proponemos un piloto comercial acotado a un número reducido de cámaras públicas (1 a 3 autorizadas) durante un período recomendado de 7 a 15 días (configurable según las necesidades del comité, ejemplo demo de 10 días).",
        "Esto permite que la administración y el comité verifiquen el funcionamiento local del micro-servidor Gateway sin comprometer la red interna."
      ],
      dontSay: [
        "Garantizamos que el piloto funcionará con el 100% de la red existente sin importar la calidad del cableado.",
        "Instalamos todo gratis indefinidamente."
      ],
      riskWarning: "El piloto está sujeto a un diagnóstico de red previo por parte del técnico de terreno autorizado."
    }
  ];

  // 5-Minute Demo Route
  const route5min: DemoStep[] = [
    {
      title: "Diagnóstico de Dolores en Condominios",
      time: "45s",
      screen: "dashboard",
      screenLabel: "Dashboard General",
      keyMessage: "La fatiga por falsas alertas y la complejidad técnica desgastan los comités de copropietarios.",
      say: [
        "Buenas tardes. Hoy presentamos ORBI Sentinel IA Community, diseñado especialmente para resolver los tres dolores clásicos de seguridad residencial:",
        "Primero, la fatiga cognitiva de conserjería por pantallas de CCTV sobrecargadas. Segundo, el temor a la filtración de grabaciones de vecinos en redes sociales.",
        "Y tercero, el abandono de los sistemas tradicionales de cámaras por falta de soporte y complejidad en las aplicaciones de marca."
      ],
      dontSay: [
        "Este sistema erradica el crimen del vecindario en 24 horas.",
        "Garantizamos cero falsas alarmas bajo cualquier condición climática."
      ],
      riskWarning: "No sobreprometer resultados de reducción delictual. Centrar el discurso en la eficiencia operativa de la conserjería."
    },
    {
      title: "Consola de Baja Carga Cognitiva: EasyView",
      time: "45s",
      screen: "easyview",
      screenLabel: "Modo Conserje / EasyView",
      keyMessage: "Tranquilidad operativa: el conserje opera el sistema táctil en 5 minutos de inducción.",
      say: [
        "Pasamos al Modo Conserje (EasyView). Diseñamos esta interfaz de paso rápido para guardias de turno nocturno o de alta rotación.",
        "Utiliza botones amplios, un diseño simplificado y oculta por completo direcciones IP, puertos de red o logs técnicos.",
        "El conserje puede ver las cámaras públicas y alertar a la administración con un solo toque silencioso si detecta anomalías."
      ],
      dontSay: [
        "Nuestra consola reemplaza de forma total la necesidad de un monitor físico local tradicional.",
        "Soporta flujos ilimitados de video 4K sin usar ancho de banda de internet."
      ],
      riskWarning: "Mencione de manera responsable que Sentinel procesa el video de forma 100% local en un micro-servidor Edge local, minimizando el consumo de internet."
    },
    {
      title: "Valor de Control para la Administración",
      time: "45s",
      screen: "dashboard",
      screenLabel: "Dashboard General",
      keyMessage: "El Administrador obtiene indicadores operacionales estimados sin sobrepromesas.",
      say: [
        "Para la Administración, Sentinel ofrece un panel consolidado de control. Pueden auditar cuántas cámaras están online y cuántas fallan.",
        "Mostramos métricas operacionales de diagnóstico automatizado. Esto ayuda a exigir el cumplimiento de mantención al proveedor de CCTV.",
        "Los valores mostrados representan estimaciones operacionales de laboratorio para dimensionar la eficiencia del condominio."
      ],
      dontSay: [
        "Estas cifras son un ROI financiero garantizado por contrato.",
        "Reemplazamos por completo al integrador de cámaras de terreno."
      ],
      riskWarning: "Asegúrese de recalcar que las cifras operativas presentadas corresponden a simulaciones y estimaciones lógicas basadas en un comportamiento óptimo."
    },
    {
      title: "Flujo de Incidentes y Reportes",
      time: "45s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Evidencia centralizada de incidentes en una base de datos segura y auditable.",
      say: [
        "Cuando el conserje registra un incidente, este pasa al Centro de Incidentes de la Administración.",
        "Aquí se vincula la evidencia de video extraída localmente y se genera un reporte auditable con firma técnica.",
        "Esto dota al condominio de evidencia útil para presentar a fiscalía o aseguradoras en caso de siniestros."
      ],
      dontSay: [
        "Esta evidencia tiene validez jurídica automática garantizada por ley internacional.",
        "El video se envía directamente al centro de comando de la policía."
      ],
      riskWarning: "Aclare que la validez legal del reporte depende de los protocolos de cadena de custodia que defina la administración local del edificio."
    },
    {
      title: "Privacidad Residencial Activa",
      time: "45s",
      screen: "privacy",
      screenLabel: "Privacy & Compliance",
      keyMessage: "Protección ética de la copropiedad mediante el bloqueo de zonas residenciales.",
      say: [
        "Una de las mayores preocupaciones es la invasión a la privacidad vecinal. Sentinel incorpora enmascaramiento local dinámico.",
        "El software bloquea la visualización de ventanas, patios internos o terrazas privadas de los copropietarios.",
        "Además, nos comprometemos éticamente a no realizar reconocimiento de rostros de menores ni almacenar video de pasillos privados."
      ],
      dontSay: [
        "Contamos con un escudo de privacidad invisible que bloquea el hackeo de cámaras por internet de forma absoluta.",
        "Garantizamos que ningún conserje puede grabar la pantalla con su teléfono celular."
      ],
      riskWarning: "Indique que la herramienta ayuda a prevenir filtraciones en el software, pero las buenas prácticas del personal de conserjería siguen siendo críticas."
    },
    {
      title: "Compatibilidad Responsable de Cámaras",
      time: "45s",
      screen: "compatibility",
      screenLabel: "Compatibility Matrix",
      keyMessage: "Evaluación técnica de compatibilidad según protocolos estándar RTSP/ONVIF.",
      say: [
        "Un gran error del mercado es prometer compatibilidad universal. Sentinel no lo hace: evaluamos de manera rigurosa.",
        "Clasificamos las cámaras existentes del condominio según su compatibilidad: Profesional IP (PoE) es óptima, mientras que cámaras WiFi propietarias requieren puente adicional.",
        "De esta manera, el condominio sabe exactamente qué cámaras sirven para el piloto y cuáles requieren adecuación técnica."
      ],
      dontSay: [
        "Sentinel funciona con cualquier cámara china, análoga o WiFi sin cables de forma mágica.",
        "Nuestra IA mejora la resolución física de cámaras borrosas de baja calidad."
      ],
      riskWarning: "Siempre recalque que la compatibilidad definitiva está supeditada a un diagnóstico de red y a la obtención de los accesos autorizados."
    },
    {
      title: "Constructor de Alcance Piloto",
      time: "30s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Definición conjunta de un piloto no invasivo con cámaras autorizadas del comité.",
      say: [
        "Para mitigar riesgos y validar la factibilidad técnica local, proponemos un piloto no invasivo con duración sugerida de 7 a 15 días (ejemplo de 10 días de prueba).",
        "Usamos el 'Pilot Scope Builder' para definir el alcance del piloto: qué cámaras se integrarán (ej. Portón y Acceso Peatonal) y qué zonas se excluirán expresamente.",
        "De este modo, el comité de copropietarios aprueba un alcance cerrado, seguro y con una política de retención de video baja para pruebas."
      ],
      dontSay: [
        "Este piloto no requiere hardware o que un técnico configure nada en terreno.",
        "El piloto de pruebas tiene capacidad ilimitada de procesamiento."
      ],
      riskWarning: "La instalación del piloto requiere que el condominio facilite un punto de red local y las credenciales autorizadas del NVR o cámaras de prueba."
    },
    {
      title: "Próximos Pasos de Presentación",
      time: "30s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Firma del acta de piloto técnico acotado y solicitud de inventario básico.",
      say: [
        "Los pasos sugeridos para avanzar hoy son muy sencillos y no generan compromisos financieros permanentes.",
        "Primero, la administración nos facilita un inventario básico de cámaras instaladas y accesos autorizados de red local.",
        "Segundo, coordinamos la firma de un acta simple para instalar un micro-servidor de pruebas en conserjería durante un período de prueba de 7 a 15 días (configurable, ejemplo de 10 días)."
      ],
      dontSay: [
        "Garantizamos que no habrá ninguna interrupción de video durante la prueba local.",
        "La firma de este acta compromete la compra definitiva del sistema."
      ],
      riskWarning: "No presione comercialmente con ofertas de 'último minuto' o 'precio garantizado hoy'. Mantenga un tono consultivo, técnico y respetuoso de los tiempos de comités."
    }
  ];

  // 10-Minute Demo Route
  const route10min: DemoStep[] = [
    {
      title: "Contexto, Dolores y Presentación Comercial",
      time: "1m",
      screen: "dashboard",
      screenLabel: "Dashboard General",
      keyMessage: "Presentación ejecutiva del propósito de ORBI Sentinel IA en comunidades residenciales.",
      say: [
        "Bienvenidos. Hoy realizaremos la demostración detallada de ORBI Sentinel IA Community.",
        "Este sistema es una capa complementaria de procesamiento local de inteligencia artificial que se monta sobre el CCTV existente.",
        "Su objetivo es reducir la carga mental de la conserjería mediante una interfaz limpia y asegurar que la administración cuente con evidencia trazable y blindada ante cualquier reclamo de copropietarios."
      ],
      dontSay: [
        "Eliminamos la necesidad de contratar mantenciones de cámaras de CCTV.",
        "Sustituimos el software del NVR original por completo."
      ],
      riskWarning: "Declarar de manera transparente que Sentinel complementa el NVR instalado en el condominio, no lo reemplaza para funciones de almacenamiento crudo de larga duración."
    },
    {
      title: "Estructuración Estricta de Roles de Operación",
      time: "45s",
      screen: "dashboard",
      screenLabel: "Dashboard General",
      keyMessage: "Asignación de roles diferenciados para evitar riesgos informáticos y fugas de datos.",
      say: [
        "Un aspecto crítico de la seguridad informática residencial es que los conserjes no deben tener acceso a las contraseñas del sistema ni poder modificar configuraciones.",
        "Sentinel divide la operación en tres roles claros en la barra lateral: el Conserje de turno opera de forma táctil; el Administrador audita incidentes y descarga reportes;",
        "Y el Técnico de terreno configura flujos RTSP, puertos de red local y parámetros de enmascaramiento. Esta separación protege los datos confidenciales."
      ],
      dontSay: [
        "Garantizamos inmunidad contra todo tipo de ataques cibernéticos externos.",
        "Cualquier conserje puede aprender a hackear las cámaras con este sistema."
      ],
      riskWarning: "El control de accesos depende de que no se compartan las credenciales maestras del Administrador con el personal de conserjería de turno."
    },
    {
      title: "Modo Conserje: Reducción de la Fatiga de Turno",
      time: "1m",
      screen: "easyview",
      screenLabel: "Modo Conserje / EasyView",
      keyMessage: "Pantalla intuitiva y de respuesta ágil en situaciones de crisis perimetral.",
      say: [
        "Visualicemos la consola de turno de conserjería. Al simplificar los menús, logramos una reducción notable de la fatiga mental.",
        "El conserje ve un muro de visualización fluido. No hay campos de texto técnicos ni opciones de red que puedan confundir.",
        "Si observa una anomalía, simplemente presiona el botón del incidente en pantalla. El sistema registra el evento de forma silenciosa con trazabilidad local protegida."
      ],
      dontSay: [
        "Nuestra IA detecta de forma autónoma el 100% de las intenciones delictivas antes de que ocurran.",
        "Esta consola es compatible con tabletas táctiles chinas antiguas sin navegador web moderno."
      ],
      riskWarning: "La experiencia táctil fluida requiere que la tablet o pantalla instalada en conserjería cumpla con las especificaciones mínimas de hardware recomendadas."
    },
    {
      title: "Muro de Cámaras Sentinel Live Wall",
      time: "1m",
      screen: "livewall",
      screenLabel: "Sentinel Live Wall",
      keyMessage: "Monitoreo perimetral activo con bloqueo local de flujos no autorizados.",
      say: [
        "El 'Live Wall' es la pantalla principal para monitorear múltiples flujos de video en tiempo real de forma centralizada.",
        "A diferencia de las aplicaciones tradicionales que sobrecargan la red local del edificio, Sentinel procesa los flujos localmente en el Gateway Edge.",
        "Esto garantiza que la transmisión sea estable y no se sature el canal de internet contratado por el condominio."
      ],
      dontSay: [
        "Transmitimos 32 cámaras 4K simultáneas en tiempo real en una red WiFi domiciliaria básica.",
        "El sistema graba audio y conversaciones privadas de todos los vecinos a distancia."
      ],
      riskWarning: "Aclare que el audio de las cámaras de prueba se encuentra desactivado por defecto por regulaciones éticas de privacidad residencial."
    },
    {
      title: "Centro de Gestión de Incidentes",
      time: "45s",
      screen: "incidentcenter",
      screenLabel: "Incident Center",
      keyMessage: "Trazabilidad de incidentes de seguridad reportados para su validación administrativa.",
      say: [
        "En el Centro de Incidentes, la Administración consolida todas las alertas emitidas por conserjería.",
        "Cada incidente contiene una marca de tiempo precisa, observaciones humanas del guardia y un enlace a la captura de video asociada.",
        "Esto evita que los incidentes 'desaparezcan' de la bitácora o que se omitan detalles clave para el comité."
      ],
      dontSay: [
        "El sistema genera una denuncia penal formal ante carabineros de manera autónoma.",
        "Este centro previene todo tipo de robos por sí solo."
      ],
      riskWarning: "La oportuna gestión de incidentes requiere que el administrador revise periódicamente la consola o configure alertas por correo electrónico autorizadas."
    },
    {
      title: "Privacidad y Cumplimiento de Normativa Ética",
      time: "45s",
      screen: "privacy",
      screenLabel: "Privacy & Compliance",
      keyMessage: "Enmascaramiento de deslindes y resguardo de la intimidad familiar por diseño.",
      say: [
        "Abordamos el mayor temor vecinal: que la seguridad vulnere la privacidad. Sentinel incorpora 'Privacy & Compliance'.",
        "Podemos configurar máscaras de color sólido sobre ventanas y balcones en los flujos procesados, asegurando que el conserje no tenga visibilidad de zonas íntimas.",
        "Además, el sistema de auditoría registra de manera protegida y con trazabilidad local quién visualizó qué cámara, evitando el mal uso del sistema de CCTV."
      ],
      dontSay: [
        "Este software garantiza un 100% de cumplimiento con la ley de protección de datos personales de forma retroactiva.",
        "El enmascaramiento es imposible de remover incluso con acceso de administrador maestro de red."
      ],
      riskWarning: "Aclare que las máscaras de privacidad se configuran a nivel del Gateway local de Sentinel y no alteran la grabación física del NVR de respaldo si el cliente decide mantenerlo directo."
    },
    {
      title: "Generación de Evidencia Técnica de Incidentes",
      time: "45s",
      screen: "evidence",
      screenLabel: "Evidence Report",
      keyMessage: "Exportación de clips de video protegidos con control de integridad local.",
      say: [
        "Cuando el condominio requiere aportar una prueba a la policía o a un vecino afectado, se accede a la sección 'Evidence Report'.",
        "Los clips vinculados a incidentes se guardan de forma protegida para evitar su borrado accidental por la retención estándar.",
        "Cada descarga o exportación queda registrada en la bitácora técnica de auditoría local, especificando la justificación dada por el operador."
      ],
      dontSay: [
        "Nuestras descargas de video son indestructibles y no pueden dañarse en el disco duro.",
        "Ofrecemos espacio de almacenamiento en la nube ilimitado sin costo adicional de mantención."
      ],
      riskWarning: "La capacidad de almacenamiento local de evidencia depende de las dimensiones del disco duro asignado en el micro-servidor Edge contratado."
    },
    {
      title: "Evaluación Responsable de Compatibilidad",
      time: "45s",
      screen: "compatibility",
      screenLabel: "Compatibility Matrix",
      keyMessage: "Diagnóstico exhaustivo de compatibilidad de cámaras de seguridad multimarca.",
      say: [
        "Para evitar costosas pérdidas de inversión, Sentinel cuenta con una matriz de compatibilidad rigurosa.",
        "Clasificamos las cámaras en cuatro rangos de compatibilidad: desde 'Profesional IP PoE' (óptimo con analíticas nativas)",
        "Hasta cámaras 'App propietaria' o 'RTSP pendiente' que presentan riesgos de desconexión o retardo. Esto permite asesorar al comité sobre qué equipamiento sirve realmente."
      ],
      dontSay: [
        "Hacemos compatible cualquier cámara WiFi de juguete sin cables de forma instantánea.",
        "Nuestro software actualiza físicamente el firmware de todas las cámaras antiguas."
      ],
      riskWarning: "Aclare de manera ética que la integración óptima se logra con cámaras cableadas estándar que soporten flujos de video ONVIF o RTSP abiertos."
    },
    {
      title: "Definición y Delimitación de Alcance del Piloto",
      time: "45s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Uso del Constructor de Alcance para cerrar un piloto técnico seguro de 10 días.",
      say: [
        "En la sección de Community Proposal, mostramos el 'Pilot Scope Builder'. Aquí diseñamos de manera conjunta el alcance del piloto de pruebas.",
        "Definimos la cantidad de cámaras a integrar (sugerimos de 1 a 3 autorizadas perimetrales), la duración recomendada del piloto (de 7 a 15 días, configurable bajo acuerdo del comité, ejemplo de 10 días) y qué zonas comunes se incluirán.",
        "Esto le da tranquilidad absoluta al comité de copropietarios de que el piloto es acotado, responsable y con una política de almacenamiento transitoria baja."
      ],
      dontSay: [
        "El piloto incluye analíticas avanzadas de conteo de patentes o reconocimiento facial sin cargo adicional.",
        "El micro-servidor de pruebas procesa 24 canales simultáneos de forma gratuita."
      ],
      riskWarning: "El piloto técnico se limita estrictamente a las cámaras y áreas seleccionadas y acordadas formalmente en el acta de inicio de pruebas."
    },
    {
      title: "Generación de Propuesta Ejecutiva One-Page",
      time: "45s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Formulación de propuesta comercial clara con mitigaciones declaradas de forma transparente.",
      say: [
        "El Proposal Center permite generar y copiar una propuesta ejecutiva limpia de una página en formato Markdown para compartir en WhatsApp o correo.",
        "Esta propuesta contiene declaraciones de mitigación técnica transparentes: aclara que la solución es complementaria,",
        "Que los ahorros mostrados representan estimaciones lógicas de laboratorio y que no prometemos compatibilidad universal mágica."
      ],
      dontSay: [
        "Esta propuesta representa un presupuesto financiero definitivo inalterable por el proveedor.",
        "Esta cotización asegura que no habrá cargos por adecuación de red local."
      ],
      riskWarning: "Indique que la propuesta generada es un documento base de conversación y requiere validación del técnico instalador tras el levantamiento de terreno."
    },
    {
      title: "Manejo de Objeciones del Comité de Copropietarios",
      time: "45s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Resolución de dudas frecuentes de comités sobre NVR, compatibilidad y red de manera consultiva.",
      say: [
        "Sabemos que los comités residenciales suelen tener objeciones legítimas sobre la red local o la seguridad de datos.",
        "Sentinel incluye tarjetas interactivas de manejo de objeciones. Por ejemplo, ante la pregunta: '¿Esto reemplaza el NVR existente?',",
        "Nuestra respuesta es consultiva: Sentinel es complementario de paso, añade analíticas locales y no interfiere con la grabación cruda del NVR."
      ],
      dontSay: [
        "Las objeciones de los vecinos son infundadas y no conocen de tecnología moderna.",
        "Cualquier duda de seguridad es imposible ya que nuestro sistema cuenta con estándares de seguridad militares."
      ],
      riskWarning: "Escuche siempre con respeto las dudas del comité. El manejo de objeciones responsable genera confianza, credibilidad y seriedad comercial."
    },
    {
      title: "Roadmap del Piloto y Próximos Pasos Claros",
      time: "45s",
      screen: "communityproposal",
      screenLabel: "Community Proposal",
      keyMessage: "Hoja de ruta secuencial de 9 pasos para asegurar una implantación exitosa.",
      say: [
        "Para cerrar la presentación, mostramos la hoja de ruta de 9 pasos cronológicos recomendados para el piloto residencial.",
        "Este roadmap abarca desde el diagnóstico inicial de cámaras locales hasta la entrega del reporte final de valor operativo tras concluir el período de pruebas (sugerido de 7 a 15 días).",
        "La claridad en este proceso disminuye la incertidumbre de los vecinos y viabiliza la aprobación formal en el acta del comité."
      ],
      dontSay: [
        "Instalamos todo el sistema definitivo en un solo día sin cableado de red.",
        "La finalización del piloto obliga al edificio a contratar el servicio definitivo por 12 meses."
      ],
      riskWarning: "El cumplimiento de los plazos del roadmap depende de la oportuna entrega de los accesos autorizados por parte de la administración del edificio."
    }
  ];

  // Get active route steps based on selected duration
  const getActiveSteps = (): DemoStep[] => {
    if (selectedDuration === "3min") return route3min;
    if (selectedDuration === "10min") return route10min;
    return route5min;
  };

  const steps = getActiveSteps();
  const currentStep = steps[currentStepIndex] || steps[0];

  // If steps length changed and index is out of bounds, reset index
  React.useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedDuration]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      triggerToast("🎉 ¡Ruta de Demostración completada con éxito!");
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Audience Context Injection
  const getAudienceContext = (): {
    vibe: string;
    focus: string;
    language: string;
    note: string;
  } => {
    switch (selectedAudience) {
      case "conserje":
        return {
          vibe: "Operativa de Conserjería (Cercana, Simple y de Baja Carga)",
          focus: "Demuestre la facilidad de uso de EasyView y que no se requiere ingresar contraseñas de red ni comandos.",
          language: "Lenguaje coloquial humano, sin jerga de redes o de algoritmos de inteligencia artificial.",
          note: "Haga hincapié en que Sentinel reduce el estrés visual de mirar 16 cámaras titilando y facilita levantar reportes rápidos."
        };
      case "tecnico":
        return {
          vibe: "Factibilidad Técnica (Soporte, Protocolos y Red)",
          focus: "Demuestre que Sentinel es complementario, procesa localmente en un Gateway Edge y no satura el ancho de banda del condominio.",
          language: "Lenguaje de red, mencionando protocolos RTSP/ONVIF estándar, ancho de banda y diagnóstico de latencia.",
          note: "Resalte el valor de la matriz de compatibilidad y que el sistema dota de herramientas diagnósticas que reducen las visitas de terreno."
        };
      case "vecino":
        return {
          vibe: "Vecinos & Copropietarios (Tranquilidad, Intimidad y Privacidad)",
          focus: "Enfoque en el resguardo de la intimidad familiar, bloqueo local de ventanas con Privacy Shield y protección contra filtraciones.",
          language: "Lenguaje de cuidado residencial, enfatizando la ética técnica, la protección de menores y la trazabilidad de accesos.",
          note: "Aclare enfáticamente que ninguna cámara privada o ventanas interiores de departamentos forman parte del sistema perimetral."
        };
      case "comite":
      default:
        return {
          vibe: "Administración & Comité (Ejecutiva, Comercial Responsable y Trazable)",
          focus: "Enfoque en la eficiencia del personal de guardia, la trazabilidad del registro de incidentes SHA-256 y la viabilidad del piloto sin costos millonarios.",
          language: "Lenguaje comercial estructurado, centrado en valor operacional estimado, mitigación de riesgos y hoja de ruta ordenada.",
          note: "Asegure que los números de eficiencia presentados son simulaciones lógicas de laboratorio y que se propone un piloto acotado para validar viabilidad."
        };
    }
  };

  const audience = getAudienceContext();

  // Handle auto-navigating to recommended screen
  const handleNavigateToScreen = () => {
    if (setCurrentTab) {
      setCurrentTab(currentStep.screen);
      triggerToast(`🧭 Navegando a: ${currentStep.screenLabel}`);
    } else {
      triggerToast("Opción no disponible en el entorno actual.");
    }
  };

  // Copy Follow-up template
  const copyFollowUpToClipboard = () => {
    const text = `======================================================================
PROPUESTA Y SEGUIMIENTO COMERCIAL — ORBI SENTINEL IA COMMUNITY
======================================================================
Estimado(a) Administrador(a) y Miembros del Comité de Copropietarios:

Queremos agradecer sinceramente el tiempo otorgado para realizar la demostración guiada del sistema ORBI Sentinel IA Community de ${selectedDuration === "3min" ? "3" : selectedDuration === "5min" ? "5" : "10"} minutos de duración.

Resumen de la Presentación:
- Presentamos la consola táctil simplificada de baja carga cognitiva para conserjería (Modo EasyView), diseñada para reducir la fatiga visual de los guardias.
- Exhibimos la bitácora de incidentes locales protegida mediante control de integridad, que dota al condominio de trazabilidad robusta ante siniestros.
- Demostramos el funcionamiento del "Privacy Shield", aplicando un enmascaramiento local estricto para bloquear la visualización de espacios residenciales privados, terrazas o ventanas.
- Revisamos la matriz de compatibilidad técnica, basada en estándares RTSP/ONVIF para reutilizar las cámaras útiles del condominio de manera responsable.

Alcance del Piloto Técnico Propuesto:
Para avanzar de forma segura, respetuosa y sin compromisos financieros previos, proponemos la ejecución de un piloto acotado con las siguientes condiciones base:
- Duración Sugerida: Piloto recomendado de 7 a 15 días (configurable según aprobación de la administración o comité; ejemplo de demo: 10 días).
- Alcance Limitado: Integración de 1 a 3 cámaras perimetrales autorizadas de uso público.
- Procesamiento Local: Instalación de un micro-servidor Edge en conserjería (no satura la red de internet residencial).
- Declaración de Privacidad: Exclusión total y enmascaramiento estricto de cualquier zona residencial íntima y rostros de menores.

Próximos Pasos Recomendados:
1. Levantamiento Básico: Solicitamos a la administración facilitar el inventario aproximado de cámaras existentes (modelos o tipos) y verificar si se dispone de los accesos autorizados (claves locales).
2. Firma de Acta de Pruebas: Suscribir un acta simple de inicio para la entrega del Gateway de simulación local.
3. Evaluación de Factibilidad: El técnico de terreno realizará el diagnóstico local de latencia y compatibilidad física para configurar las cámaras perimetrales seleccionadas.

*Aclaración Responsable: Las cifras y estimaciones mostradas durante la demostración representan simulaciones operacionales lógicas de laboratorio para fines de dimensionamiento operativo y no constituyen garantías comerciales de reducción de personal o ahorros financieros garantizados contratados de forma directa. La compatibilidad final está sujeta al diagnóstico físico de la red del edificio.

Quedamos atentos a sus comentarios para coordinar la visita técnica del piloto acotado.

Atentamente,
Equipo de Consultoría Tecnológica Residencial
ORBI Sentinel IA — v0.2.5-sentinel-community-guided-demo-flow
======================================================================`;

    navigator.clipboard.writeText(text);
    triggerToast("✓ Plantilla de seguimiento comercial copiada al portapapeles.");
  };

  return (
    <div id="guided-demo-container" className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Módulo 2F — Control de Demostración
              </span>
            </div>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">
              Guided Community Demo & Script Path
            </h2>
            <p className="text-xs text-slate-400">
              Ruta estructurada para presentar ORBI Sentinel IA de forma responsable, clara y ética ante comités o administradores de condominios.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">ESTADO DEL SCRIPT:</span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-full">
              v0.2.5-SENTINEL-COMMUNITY-GUIDED-DEMO-FLOW
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step List & Presentation Progress (Main Control) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Control Panel Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            
            {/* Top selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              
              {/* Duration selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Duración de la Demostración
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850">
                  <button
                    onClick={() => {
                      setSelectedDuration("3min");
                      setCurrentStepIndex(0);
                    }}
                    className={`py-1.5 rounded-md text-xs font-medium font-mono uppercase transition-all ${
                      selectedDuration === "3min"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    ⚡ 3 Min
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDuration("5min");
                      setCurrentStepIndex(0);
                    }}
                    className={`py-1.5 rounded-md text-xs font-medium font-mono uppercase transition-all ${
                      selectedDuration === "5min"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    ⭐ 5 Min
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDuration("10min");
                      setCurrentStepIndex(0);
                    }}
                    className={`py-1.5 rounded-md text-xs font-medium font-mono uppercase transition-all ${
                      selectedDuration === "10min"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    🚀 10 Min
                  </button>
                </div>
              </div>

              {/* Audience selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Audiencia de la Presentación
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-850">
                  <button
                    onClick={() => setSelectedAudience("comite")}
                    title="Administradores y comités de condominio"
                    className={`py-1.5 rounded text-[10px] font-medium transition-all ${
                      selectedAudience === "comite"
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Comité
                  </button>
                  <button
                    onClick={() => setSelectedAudience("conserje")}
                    title="Guardias de seguridad y personal de turno"
                    className={`py-1.5 rounded text-[10px] font-medium transition-all ${
                      selectedAudience === "conserje"
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Conserje
                  </button>
                  <button
                    onClick={() => setSelectedAudience("tecnico")}
                    title="Instaladores y soporte técnico de CCTV"
                    className={`py-1.5 rounded text-[10px] font-medium transition-all ${
                      selectedAudience === "tecnico"
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Técnico
                  </button>
                  <button
                    onClick={() => setSelectedAudience("vecino")}
                    title="Residentes y copropietarios de la comunidad"
                    className={`py-1.5 rounded text-[10px] font-medium transition-all ${
                      selectedAudience === "vecino"
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Vecinos
                  </button>
                </div>
              </div>

            </div>

            {/* Step Header & Navigation */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  PASO {currentStepIndex + 1} DE {steps.length} • RUTA DE {selectedDuration === "3min" ? "3" : selectedDuration === "5min" ? "5" : "10"} MINUTOS
                </span>
                <h3 className="text-base font-sans font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-emerald-400" /> {currentStep.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none border border-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 px-1">
                  {currentStepIndex + 1} / {steps.length}
                </span>
                <button
                  onClick={handleNextStep}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-slate-950 transition-all font-bold"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audience Context Alert Box */}
            <div className="p-3 bg-slate-950 border-l-2 border-slate-700 rounded-r-xl flex items-start gap-3 text-xs leading-relaxed">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-sans font-bold text-slate-200 block">
                  Enfoque para Audiencia: {audience.vibe}
                </span>
                <p className="text-slate-400 font-sans">
                  {audience.focus} <span className="text-emerald-400/90 font-medium">{audience.note}</span>
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-1">
                  <span className="text-slate-600 uppercase font-bold text-[9px]">LENGUAJE:</span>
                  <span>{audience.language}</span>
                </div>
              </div>
            </div>

            {/* Step Body (Speaker Script) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/40 border border-slate-850 rounded-xl p-5">
              
              {/* Say / Don't Say block */}
              <div className="md:col-span-8 space-y-4">
                
                {/* Qué decir */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span> Qué Decir (Talk Track)
                  </span>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900/60 text-slate-200 text-xs leading-relaxed space-y-2.5">
                    {currentStep.say.map((phrase, idx) => (
                      <p key={idx} className="relative pl-3">
                        <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-emerald-400/70"></span>
                        {phrase}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Qué NO decir */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block animate-pulse"></span> Qué Evitar Prometer
                  </span>
                  <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 text-rose-300 text-xs leading-relaxed space-y-1.5">
                    {currentStep.dontSay.map((phrase, idx) => (
                      <p key={idx} className="relative pl-4">
                        <span className="absolute left-0 top-1 text-xs text-rose-500/90">✕</span>
                        {phrase}
                      </p>
                    ))}
                  </div>
                </div>

              </div>

              {/* Metadata details on side */}
              <div className="md:col-span-4 space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-4">
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Tiempo Sugerido:</span>
                    <span className="font-mono text-slate-200 font-bold flex items-center gap-1 text-sm mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {currentStep.time}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Mensaje Clave:</span>
                    <span className="text-emerald-400/90 font-medium block mt-0.5 leading-relaxed">
                      "{currentStep.keyMessage}"
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Advertencia de Riesgo:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                      {currentStep.riskWarning}
                    </p>
                  </div>
                </div>

                {/* Link to actual screen button */}
                <div className="pt-4 border-t border-slate-900 mt-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">PANTALLA RECOMENDADA:</span>
                  <button
                    onClick={handleNavigateToScreen}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-white rounded-lg transition-all text-left group"
                  >
                    <span className="text-[11px] font-sans font-bold truncate group-hover:text-emerald-400 transition-all">
                      {currentStep.screenLabel}
                    </span>
                    <Compass className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:rotate-45 transition-all shrink-0 ml-1.5" />
                  </button>
                  <span className="text-[9px] text-slate-500 block mt-1 font-mono text-center">
                    Haz clic para abrir esta pantalla en vivo.
                  </span>
                </div>

              </div>

            </div>

            {/* Timeline Progress Indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SECUENCIA DE PASOS</span>
                <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% COMPLETADO</span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-900">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-full rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? "bg-emerald-500 flex-1"
                        : idx < currentStepIndex
                        ? "bg-emerald-800 w-3"
                        : "bg-slate-900 w-3"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Post-Demo Follow-Up Email Template */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Plantilla de Seguimiento Post-Demo
                </h3>
                <p className="text-[11px] text-slate-400">Envía esta minuta ejecutiva al comité para cerrar la firma del acta del piloto.</p>
              </div>
              <button
                onClick={copyFollowUpToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-lg text-xs font-mono font-bold transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Plantilla
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-2">
              <p className="text-emerald-400 font-bold">📋 PROPUESTA Y SEGUIMIENTO COMERCIAL — ORBI SENTINEL IA</p>
              <p className="text-slate-400">Estimado(a) Administrador(a) y Miembros del Comité:</p>
              <p>Queremos agradecer sinceramente el tiempo para realizar la demostración guiada del sistema ORBI Sentinel IA Community de {selectedDuration === "3min" ? "3" : selectedDuration === "5min" ? "5" : "10"} minutos...</p>
              <p className="text-slate-500"># Alcance del Piloto Técnico Propuesto:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-400">
                <li>Duración: Piloto recomendado de 7 a 15 días (configurable; ejemplo demo: 10 días).</li>
                <li>Alcance: Integración de 1 a 3 cámaras públicas.</li>
                <li>Procesamiento: 100% local en micro-servidor Edge.</li>
                <li>Privacidad: Enmascaramiento activo con Privacy Shield.</li>
              </ul>
              <p className="text-slate-500">*Aclaración Responsable: Las cifras operacionales mostradas representan estimaciones y simulaciones lógicas de laboratorio y no constituyen un ROI financiero auditado de forma externa.</p>
            </div>
            <p className="text-[10px] text-slate-500 font-mono text-center">
              La minuta se adapta automáticamente según el tiempo de demostración seleccionado. No contiene precios fijos ni garantías comerciales directas.
            </p>
          </div>

        </div>

        {/* Guardrails & Pre-Demo Checklist (Side Panels) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pre-Demo Checklist Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-emerald-400" /> Live Demo Checklist
              </h3>
              <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded border ${
                readinessStatus === "Ready"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : readinessStatus === "Needs Review"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {readinessStatus} ({readinessPercent}%)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Verifique estos prerrequisitos antes de iniciar la videollamada o reunión en terreno para asegurar una demostración comercialmente ética y estable.
            </p>

            <div className="space-y-2">
              {[
                { key: "demoModeActive", label: "Demo Mode Activo", desc: "Muestra datos de simulación simulados" },
                { key: "noRealData", label: "No usar datos reales", desc: "Sin IPs de producción ni credenciales expuestas" },
                { key: "privacyShieldVisible", label: "Privacy Shield visible", desc: "Enmascaramiento de balcones y privacidad listo" },
                { key: "reportsSanitized", label: "Reportes sin secretos", desc: "Video y logs limpios de datos confidenciales" },
                { key: "proposalPackReady", label: "Proposal Pack listo", desc: "Presentación y propuesta ejecutiva preparada" },
                { key: "guidedDemoSelected", label: "Guided Demo seleccionado", desc: "Rutas de 3, 5 o 10 minutos y guiones listos" },
                { key: "audienceModeCorrect", label: "Audience Mode correcto", desc: "Enfoque adaptado para la audiencia seleccionada" },
                { key: "postDemoMinutaReady", label: "Post-Demo Minuta lista", desc: "Plantilla copiable de seguimiento comercial preparada" },
                { key: "nextStepDefined", label: "Próximo paso definido", desc: "Acta física y solicitud de inventario básico" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                  className="w-full flex items-start gap-2.5 p-2 bg-slate-950/60 hover:bg-slate-950 rounded-lg text-left transition-all border border-slate-900"
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-all ${
                    checklist[item.key as keyof typeof checklist]
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "border-slate-800 bg-slate-900 text-transparent"
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-sans font-bold block leading-none transition-all ${
                      checklist[item.key as keyof typeof checklist] ? "text-slate-200" : "text-slate-500"
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Demo Guardrails Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Commercial Guardrails
            </h3>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Mantener rigurosamente estos límites éticos de venta consultiva para evitar quejas técnicas y de cumplimiento.
            </p>

            <div className="space-y-3">
              {/* No prometer */}
              <div className="space-y-1.5 p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                  ✕ NO PROMETER (LÍMITES)
                </span>
                <ul className="space-y-1 text-[10px] text-rose-300/90 list-disc pl-4 font-sans leading-relaxed">
                  <li>Compatibilidad universal con cualquier cámara o red antigua.</li>
                  <li>Funcionamiento en producción 24/7 sin licenciamiento definitivo.</li>
                  <li>Reemplazo total o descarte inmediato del NVR existente.</li>
                  <li>ROI financiero o reducción directa de guardias autorizados externamente.</li>
                  <li>Cero falsas alarmas absolutas.</li>
                  <li>Control de cámaras cloud propietarias sin accesos locales.</li>
                  <li>Uso o filmación de cámaras de espacios residenciales privados.</li>
                </ul>
              </div>

              {/* Sí afirmar */}
              <div className="space-y-1.5 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  ✓ SÍ AFIRMAR (VALOR REAL)
                </span>
                <ul className="space-y-1 text-[10px] text-emerald-300/90 list-disc pl-4 font-sans leading-relaxed">
                  <li>Consola táctil de muy baja carga cognitiva para el conserje de turno.</li>
                  <li>Privacidad residencial integrada por diseño (Privacy Shield).</li>
                  <li>Compatibilidad sujeta a modelo de cámara, protocolo y acceso local.</li>
                  <li>Piloto técnico acotado y no invasivo (sugerido de 7 a 15 días, configurable; ejemplo de demo de 10 días).</li>
                  <li>Gestión de incidentes locales para reporte administrativo.</li>
                  <li>Valor operativo estimado basado en simulaciones de laboratorio.</li>
                  <li>Disminución del uso de múltiples aplicaciones propietarias fragmentadas.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Toast Alert message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white font-sans font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
