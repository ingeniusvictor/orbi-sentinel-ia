export interface RoleGuide {
  role: "conserje" | "admin" | "tecnico";
  title: string;
  description: string;
  topics: {
    title: string;
    description: string;
    steps: string[];
    warning?: string;
  }[];
}

export interface ScreenHelp {
  id: string;
  name: string;
  description: string;
  targetUser: string;
  actions: string[];
  commonErrors: string[];
  whatToAvoid: string;
  targetTab: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: "operacion" | "tecnico" | "seguridad" | "demo";
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface TroubleshootingCase {
  id: string;
  title: string;
  cause: string;
  steps: string[];
  whatNotToKeep: string;
  whenToNotifyTech: string;
}

export interface TourStep {
  step: number;
  title: string;
  content: string;
}

export interface GuidedTour {
  id: string;
  name: string;
  role: "conserje" | "admin" | "tecnico" | "all";
  description: string;
  steps: TourStep[];
}

export const ROLE_GUIDES: RoleGuide[] = [
  {
    role: "conserje",
    title: "Guía de Operación Conserje / Guardia",
    description: "Manual ultra simple para operar el sistema en el día a día sin ingresar a configuraciones avanzadas.",
    topics: [
      {
        title: "Visualización de Cámaras",
        description: "Cómo ver los canales de CCTV activos para vigilar los perímetros asignados.",
        steps: [
          "Acceda al módulo 'Live Wall' desde la Pantalla Principal.",
          "Verifique la señal de video simulado en la cuadrícula.",
          "Observe que los estados se reporten como estables en la interfaz gráfica.",
          "Si un recuadro de video no responde, registre el caso en la bitácora."
        ]
      },
      {
        title: "Operación de Modo Conserje (Easy View)",
        description: "Uso del panel de control de baja fatiga cognitiva diseñado para turnos de noche o alta carga operativa.",
        steps: [
          "Seleccione 'Modo Conserje' desde el menú o el launcher principal.",
          "Visualice las alertas recientes mostradas en tarjetas grandes de alta visibilidad.",
          "Utilice los filtros rápidos por nivel de prioridad para simplificar la vista.",
          "Marque incidentes detectados de forma manual utilizando el formulario simplificado."
        ]
      },
      {
        title: "Revisión de Alertas Recientes",
        description: "Cómo interpretar las notificaciones del sistema ante posibles incidentes perimetrales.",
        steps: [
          "Observe las notificaciones de cruces de línea o actividad en zonas restringidas.",
          "Haga clic en la alerta para ver los detalles descriptivos del evento.",
          "Valide manualmente si la alerta requiere atención o corresponde a una actividad normal autorizada.",
          "Recuerde: Toda alerta requiere validación humana por parte de un operador calificado."
        ]
      },
      {
        title: "Registro y Reporte de Incidentes",
        description: "Pasos seguros para ingresar eventos detectados a la bitácora operacional.",
        steps: [
          "Haga clic en 'Registrar Incidente' o abra el 'Incident Center'.",
          "Describa los hechos usando términos objetivos y descriptivos (ej. 'Presencia de bulto', no 'Delincuente robando').",
          "Asocie la cámara perimetral correspondiente donde ocurrió la observación.",
          "Guarde el registro para que quede consolidado en el historial local."
        ],
        warning: "Prohibido usar vocabulario comercial exagerado, promesas de reducción de guardias o afirmaciones contractuales."
      },
      {
        title: "Notificación al Equipo Técnico",
        description: "Qué hacer cuando se detecta un comportamiento irregular de red o hardware.",
        steps: [
          "Abra el panel de Ayuda Contextual o use el botón de reportar técnico.",
          "Describa el síntoma visualizado en la pantalla (ej. 'Cámara desconectada en Live Wall').",
          "No intente abrir gabinetes eléctricos, realizar recableados físicos ni alterar configuraciones de switches.",
          "Espere la asistencia presencial o remota del instalador autorizado."
        ]
      },
      {
        title: "Qué No Tocar en el Sistema",
        description: "Directrices de protección para evitar desconfiguraciones accidentales en el puesto de control.",
        steps: [
          "No intente acceder al 'Centro Avanzado' de configuración técnica profunda.",
          "No modifique direcciones IP, puertos de red ni credenciales del sistema de grabación.",
          "Evite conectar dispositivos USB personales al nodo de cómputo del sistema.",
          "No desactive las políticas locales de enmascaramiento y privacidad residencial."
        ]
      },
      {
        title: "Protocolo ante Fallas de Cámaras",
        description: "Pasos operacionales en caso de pérdida temporal de señal de video en una cámara.",
        steps: [
          "Verifique si la intermitencia se debe a una simulación de laboratorio activa en el panel de control.",
          "Registre el suceso en la bitácora diaria indicando hora y zona afectada.",
          "Si la pérdida de video persiste, avise al Técnico de turno mediante los canales internos.",
          "Mantenga vigilancia activa visual/manual en la zona mediante rondas físicas."
        ]
      },
      {
        title: "Salvaguarda de Privacidad Residencial",
        description: "Cumplimiento ético del enmascaramiento de datos personales en áreas de copropiedad.",
        steps: [
          "Respete las zonas negras de enmascaramiento configuradas sobre balcones o ventanas privadas.",
          "No intente saltarse los filtros locales de enmascaramiento peatonal público.",
          "Recuerde que los clips exportados tienen difuminación automática para resguardar la privacidad.",
          "Toda manipulación de imágenes debe ajustarse estrictamente a la normativa de protección de datos."
        ]
      }
    ]
  },
  {
    role: "admin",
    title: "Guía de Administrador del Sistema",
    description: "Instrucciones de gestión, exportación de reportes sanitizados, administración de pilotos y runbook de demostraciones.",
    topics: [
      {
        title: "Control de la Pantalla Principal",
        description: "Supervisión global de las métricas de rendimiento y salud del sistema de demostración.",
        steps: [
          "Visualice el estado general de cámaras conectadas y eventos detectados en la jornada.",
          "Alterne entre la visualización simplificada de conserje y el entorno analítico avanzado.",
          "Revise la bitácora de auditoría interna de accesos y cambios de rol.",
          "Habilite o deshabilite el Modo Demo para alimentar visualizadores con datos simulados seguros."
        ]
      },
      {
        title: "Gestión de Incidentes y Bitácora",
        description: "Auditoría, clasificación y cierre de registros ingresados por el personal de vigilancia.",
        steps: [
          "Abra la sección de Incidentes desde el menú lateral.",
          "Filtre los incidentes por prioridad o estado de atención.",
          "Complemente los registros agregando observaciones administrativas o notas aclaratorias.",
          "Asegúrese de que no se incluyan datos sensibles de residentes en las observaciones."
        ]
      },
      {
        title: "Evidencias y Exportación de Reportes",
        description: "Cómo consolidar resúmenes operacionales para comités de administración y directivos.",
        steps: [
          "Navegue al módulo de 'Reportes' o 'Exportaciones'.",
          "Seleccione las cámaras o rangos temporales que desea exportar.",
          "Ejecute el escáner de lenguaje ético para verificar la conformidad de políticas comerciales responsables.",
          "Genere el reporte sanitizado en formato Markdown o portapapeles local."
        ],
        warning: "Los reportes generados son de uso interno de laboratorio y simulación comercial. No tienen validez jurídica judicial automática ni reemplazan peritajes forenses oficiales."
      },
      {
        title: "Modelos de Roles y Permisos (RBAC)",
        description: "Comportamiento del control de acceso basado en roles dentro de la plataforma.",
        steps: [
          "Identifique los tres niveles de acceso: Conserje (monitoreo), Admin (gestión) y Técnico (configuración).",
          "Compruebe las restricciones de visibilidad aplicadas a las vistas sensibles de ingeniería.",
          "Utilice el selector de rol en el panel inferior para comprobar la experiencia del operador conserje.",
          "Asegúrese de que el personal de conserjería opere bajo su propia interfaz acotada para evitar errores."
        ]
      },
      {
        title: "Gestión de Pilotos y Propuestas de Campo",
        description: "Cómo utilizar las herramientas de preventa técnica de forma comercialmente responsable.",
        steps: [
          "Ingrese al 'Pilot Intake Center' o 'Propuestas'.",
          "Defina la cantidad de canales de video requeridos y el tipo de entorno de simulación.",
          "Configure las objeciones frecuentes y las respuestas éticas autorizadas corporativamente.",
          "Revise que el disclaimer de preventa aparezca activo en el pie de página de la propuesta."
        ]
      },
      {
        title: "Runbook de Demo y Presentaciones Comerciales",
        description: "Protocolo para desplegar presentaciones exitosas ante inversionistas y clientes sin infringir políticas.",
        steps: [
          "Abra el 'Official Demo Runbook' desde la sección de Módulos Avanzados.",
          "Seleccione la ruta recomendada según el perfil del cliente (Ej: Copropietarios o Técnico de Red).",
          "Active el 'Presenter Mode' para guiar paso a paso la explicación con apoyos textuales.",
          "Marque obligatoriamente el checklist de seguridad previo para desbloquear las opciones de exportación."
        ]
      },
      {
        title: "Minutas Sanitizadas y Cierre Técnico",
        description: "Generación de documentos de conformidad de pruebas comerciales libres de secretos de negocio.",
        steps: [
          "Verifique que toda métrica expresada esté basada en simulaciones de laboratorio validadas.",
          "Excluya cualquier mención a flujos IP reales, credenciales administrativas o mapas de red privada.",
          "Exporte la minuta en formato limpio utilizando el generador del Offline Presentation Lab.",
          "Firme digitalmente el cierre del piloto con el sello de conformidad interna."
        ]
      },
      {
        title: "Uso del Centro Avanzado para Administradores",
        description: "Monitoreo del cumplimiento ético y configuraciones de guardrails desde la suite central de QA.",
        steps: [
          "Abra el 'Release Candidate Control Center' o 'MVP Freeze Center'.",
          "Audite el cumplimiento de los pilares de seguridad del software (frentes de privacidad y aislamiento).",
          "Habilite el sello 'Production Locked' para evitar simulaciones engañosas de producción activa.",
          "Verifique la bitácora interna para validar que los simuladores operan en un entorno aislado."
        ]
      }
    ]
  },
  {
    role: "tecnico",
    title: "Guía de Técnico de Terreno / Instalador",
    description: "Directrices de diagnóstico de red CCTV, compatibilidad de hardware, parámetros de Edge Recording y topología de red simulada.",
    topics: [
      {
        title: "Diagnóstico CCTV y Cámaras IP",
        description: "Herramientas de evaluación de latencia, fluctuaciones de red e integridad de flujos simulados.",
        steps: [
          "Abra el módulo de 'Diagnóstico CCTV' desde la barra lateral.",
          "Analice la matriz de ping simulado de los canales de video perimetral.",
          "Identifique canales con estado intermitente causados por simulaciones de atenuación de red.",
          "Revise la latencia promedio en milisegundos para validar la capacidad del búfer local."
        ]
      },
      {
        title: "Topología de Gateway y Conexión Local",
        description: "Estructura lógica de interconexión con grabadores locales sin salida externa a la nube.",
        steps: [
          "Acceda a 'Cámaras y Gateway' o 'Gateway Local'.",
          "Revise la topología de red simulada de un gateway ONVIF de lectura.",
          "Compruebe que el aislamiento del puerto de red mantenga los flujos de video locales en el switch.",
          "No configure gateways hacia el internet abierto sin canales VPN validados."
        ]
      },
      {
        title: "Matriz de Compatibilidad de Hardware",
        description: "Especificaciones recomendadas de cámaras perimetrales de laboratorio para transcodificación FFmpeg.",
        steps: [
          "Abra 'Compatibility Matrix' para evaluar marcas de cámaras (Dahua, Hikvision, Axis, Eufy).",
          "Identifique perfiles de video compatibles (H.264, H.265, MJPEG) soportados por el descodificador local.",
          "Revise los límites lógicos de fotogramas por segundo (FPS) óptimos para el Edge Recorder.",
          "No asuma compatibilidad de streaming RTSP directo sin la validación previa del gateway local de simulación."
        ]
      },
      {
        title: "Configuración del Edge Recorder Local",
        description: "Parámetros de retención de video, rotación de archivos y límites de consumo de disco duro.",
        steps: [
          "Abra 'Edge Recorder' desde el menú de Sistema.",
          "Configure el ciclo de retención (ej. 7 días) que rige la eliminación automática de grabaciones.",
          "Ajuste los intervalos de segmentación de archivos de video para optimizar la reconstrucción de clips.",
          "Active el enmascaramiento estático de áreas sensibles de forma directa sobre el codificador."
        ]
      },
      {
        title: "Consumer Bridge y Cámaras Residenciales",
        description: "Integración de simulación con hardware doméstico inalámbrico en un entorno de laboratorio.",
        steps: [
          "Acceda a 'Eufy Consumer Bridge' para revisar integraciones inalámbricas de baja latencia.",
          "Revise el estado de batería simulado y la tasa de refresco del búfer de video local.",
          "Compruebe las limitaciones de las redes Wi-Fi residenciales de 2.4GHz en condominios.",
          "Asegúrese de documentar las pérdidas de paquetes comunes en ambientes con alta saturación espectral."
        ]
      },
      {
        title: "Límites Técnicos del Software de Simulación",
        description: "Recordatorio obligatorio sobre el alcance operacional de la suite de preventa comercial.",
        steps: [
          "El software está diseñado para operar en entornos locales de simulación de laboratorio con grabadores físicos.",
          "No configure direcciones IP públicas reales ni intente integrar flujos RTSP residenciales sin cifrar en internet.",
          "No ingrese credenciales maestras de NVR de clientes ni contraseñas de red corporativa.",
          "Los simuladores de hardware no representan un sistema de control SCADA ni reemplazan auditorías de seguridad HSE."
        ],
        warning: "No abrir gabinetes de CCTV activos sin desconectar la alimentación de energía eléctrica. Respete los protocolos de prevención de riesgos HSE del recinto."
      }
    ]
  }
];

export const SCREEN_HELP: ScreenHelp[] = [
  {
    id: "simplehome",
    name: "Pantalla Principal",
    description: "Launcher ejecutivo y panel de control principal del sistema ORBI Sentinel IA.",
    targetUser: "Conserje, Administrador, Técnico",
    actions: ["Navegar a módulos", "Cambiar de rol", "Modificar Modo Demo", "Ver bitácora de auditoría"],
    commonErrors: ["Confundir el Modo Demo con flujos reales activos de producción", "Intentar acceder a tarjetas avanzadas con rol de Conserje"],
    whatToAvoid: "No agregar nuevas tarjetas permanentes en la portada que rompan la aceptación visual.",
    targetTab: "simplehome"
  },
  {
    id: "livewall",
    name: "Live Wall",
    description: "Cuadrícula de visualización de canales de video perimetral en tiempo real simulado.",
    targetUser: "Conserje, Administrador, Técnico",
    actions: ["Ver transmisiones", "Simular captura de clips", "Ver estado de cámaras"],
    commonErrors: ["Asumir transmisión en vivo sin revisar el estado de conexión del gateway local"],
    whatToAvoid: "No ingresar flujos IP/RTSP públicos desprotegidos ni contraseñas de red en caliente.",
    targetTab: "livewall"
  },
  {
    id: "easyview",
    name: "Modo Conserje (Easy View)",
    description: "Pantalla simplificada de baja fatiga cognitiva con controles táctiles grandes para vigilantes de turno.",
    targetUser: "Conserje de Seguridad",
    actions: ["Visualizar alertas grandes", "Registrar incidente rápido", "Activar modo nocturno de baja fatiga"],
    commonErrors: ["Buscar opciones de configuración avanzada de red dentro de la interfaz simple"],
    whatToAvoid: "Evitar alarmismo innecesario; use la bitácora para catalogar hechos lógicos del entorno.",
    targetTab: "easyview"
  },
  {
    id: "incidentcenter",
    name: "Incident Center",
    description: "Bitácora operativa para registrar, filtrar e inspeccionar incidentes de seguridad detectados.",
    targetUser: "Conserje, Administrador",
    actions: ["Filtrar incidentes", "Registrar observaciones de eventos", "Asociar cámaras de respaldo"],
    commonErrors: ["Usar nombres reales de personas o datos sensibles PII en los campos de texto"],
    whatToAvoid: "No prometer prevención del 100% de delitos ni utilizar terminología contractual definitiva.",
    targetTab: "incidentcenter"
  },
  {
    id: "diagnostics",
    name: "Diagnóstico CCTV",
    description: "Panel de control técnico para evaluar el ping, latencia y fluctuaciones de las cámaras de red.",
    targetUser: "Técnico de Red / Administrador",
    actions: ["Analizar latencia de ping", "Verificar atenuación de señal", "Inspeccionar logs de red simulados"],
    commonErrors: ["Asumir falla de hardware cuando se encuentra activa una simulación de atenuación"],
    whatToAvoid: "No intentar abrir tableros eléctricos físicos del cliente sin supervisión autorizada.",
    targetTab: "diagnostics"
  },
  {
    id: "evidence",
    name: "Evidencia y Reportes",
    description: "Consolidador de reportes técnicos periciales sanitizados de laboratorio listos para exportar.",
    targetUser: "Administrador, Técnico de Red",
    actions: ["Generar reporte Markdown", "Ejecutar auditoría de lenguaje", "Copiar reporte sanitizado"],
    commonErrors: ["Exportar información comercial con terminología de validez legal judicial externa"],
    whatToAvoid: "No incluir nombres, IPs reales, credenciales, ni compromisos de ahorros de personal.",
    targetTab: "evidence"
  },
  {
    id: "gatewaylocal",
    name: "Cámaras y Gateway",
    description: "Administración lógica del gateway local simulado para capturar flujos ONVIF.",
    targetUser: "Técnico de Red / Administrador",
    actions: ["Simular registro de cámaras", "Verificar topología local", "Auditar puertos de red simulados"],
    commonErrors: ["Intentar conectar cámaras residenciales sin el puente local de laboratorio habilitado"],
    whatToAvoid: "No configurar flujos directos que expongan puertos RTSP desprotegidos al internet abierto.",
    targetTab: "gatewaylocal"
  },
  {
    id: "pilotintake",
    name: "Pilotos y Propuestas",
    description: "Centro de preventa para estructurar propuestas de pilotos acotados para nuevos clientes.",
    targetUser: "Administrador, Técnico",
    actions: ["Configurar frentes de preventa", "Editar respuestas a objeciones", "Generar propuesta técnica"],
    commonErrors: ["Prometer plazos de implementación indefinidos o alcance comercial de producción total"],
    whatToAvoid: "No omitir el disclaimer legal de preventa y simulación de laboratorio en ningún informe.",
    targetTab: "pilotintake"
  },
  {
    id: "privacy",
    name: "Configuración y Seguridad",
    description: "Módulo de cumplimiento ético, control de accesos basados en roles (RBAC) y privacidad de datos.",
    targetUser: "Administrador",
    actions: ["Revisar logs de auditoría", "Monitorear cumplimiento de privacidad", "Simular enmascaramiento"],
    commonErrors: ["Desactivar logs de auditoría durante la simulación de demostraciones"],
    whatToAvoid: "No registrar contraseñas ni tokens reales en el historial de logs del sistema.",
    targetTab: "privacy"
  },
  {
    id: "releasecandidate",
    name: "Release Candidate Control Center",
    description: "Tablero de aseguramiento de calidad (QA) y validación de frentes éticos de ingeniería.",
    targetUser: "Administrador, Técnico de Red",
    actions: ["Verificar matriz de cumplimiento", "Validar mitigaciones legales", "Activar sello de bloqueo"],
    commonErrors: ["Saltarse las validaciones obligatorias antes de proceder con el traspaso a preventa"],
    whatToAvoid: "No simular producción activa autónoma de forma engañosa sin pruebas en terreno.",
    targetTab: "releasecandidate"
  },
  {
    id: "demorunbook",
    name: "Official Demo Runbook",
    description: "Guía interactiva paso a paso para realizar presentaciones comerciales exitosas y seguras.",
    targetUser: "Administrador",
    actions: ["Iniciar ruta de demo", "Controlar Presenter Mode", "Marcar checklist previo obligado"],
    commonErrors: ["Iniciar una presentación con clientes sin validar los guardrails previos de privacidad"],
    whatToAvoid: "No desactivar los carteles informativos obligatorios de simulación frente al cliente.",
    targetTab: "demorunbook"
  },
  {
    id: "demopractice",
    name: "Demo Practice Mode",
    description: "Entorno de entrenamiento interactivo para ensayar respuestas ante objeciones éticas del cliente.",
    targetUser: "Administrador, Conserje, Técnico",
    actions: ["Seleccionar caso de estudio", "Simular respuesta a objeciones", "Obtener feedback de compliance"],
    commonErrors: ["Utilizar argumentos agresivos o promesas falsas de reducción de costos fijos"],
    whatToAvoid: "No modificar las respuestas preestablecidas para introducir promesas comerciales sin respaldo técnico.",
    targetTab: "demopractice"
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "operacion",
    question: "¿Este sistema funciona con cámaras reales?",
    answer: "El software está diseñado para operar en un entorno simulado de laboratorio o en pilotos acotados utilizando flujos de lectura ONVIF locales. No está habilitado para conectarse directamente a redes de producción sin un gateway local validado y aislamiento de seguridad de red."
  },
  {
    category: "tecnico",
    question: "¿Qué requisitos necesita una cámara física para conectarse?",
    answer: "Requiere soporte del protocolo ONVIF (Perfil S), codificación estándar H.264 o MJPEG, direccionamiento IP estático local dentro del switch de laboratorio y credenciales de solo lectura preconfiguradas. No se requiere salida a internet."
  },
  {
    category: "seguridad",
    question: "¿Dónde se guardan las grabaciones y clips de video?",
    answer: "Todas las simulaciones de grabación y archivos periciales se almacenan exclusivamente de manera local en el disco duro asignado al Edge Recorder del nodo. No se realiza transferencia a repositorios en la nube, manteniendo consistencia con una política de resguardo de Privacidad Local."
  },
  {
    category: "demo",
    question: "¿Puedo usar datos reales de clientes en las demostraciones?",
    answer: "No. Está estrictamente prohibido cargar nombres, patentes, direcciones, IPs públicas o flujos RTSP reales de clientes en el entorno de preventa. Utilice siempre los perfiles de datos simulados y sanitizados provistos por el sistema."
  },
  {
    category: "operacion",
    question: "¿Qué opciones de visualización tiene asignadas el Conserje?",
    answer: "El rol Conserje dispone de una interfaz simplificada de baja fatiga cognitiva (Easy View, Live Wall y bitácora de Incidentes). No tiene acceso a configuraciones avanzadas, diagnósticos profundos de red, ni herramientas de preventa comercial."
  },
  {
    category: "tecnico",
    question: "¿Qué herramientas de diagnóstico visualiza el Técnico?",
    answer: "El instalador técnico tiene acceso según rol autorizado al panel de Diagnóstico CCTV (ping, latencia, atenuación simulada), matriz de compatibilidad de hardware, parámetros del Edge Recorder, Gateway local y los puentes de consumo residencial."
  },
  {
    category: "seguridad",
    question: "¿Qué es un reporte sanitizado pericial?",
    answer: "Es un documento consolidado localmente que contiene la bitácora técnica de eventos detectados, libre de secretos de red, IPs o nombres reales. Sirve para reportar novedades técnicas al comité administrativo del cliente con total transparencia."
  },
  {
    category: "operacion",
    question: "¿Este sistema reemplaza al grabador NVR tradicional?",
    answer: "No. El Edge Recorder es una herramienta de apoyo analítico local para demostración y simulación comercial. No reemplaza el sistema de grabación ininterrumpida NVR comercial del cliente ni la infraestructura física SCADA de seguridad."
  },
  {
    category: "operacion",
    question: "¿El uso de inteligencia artificial reemplaza al guardia de seguridad?",
    answer: "No. El sistema actúa exclusivamente como un asistente analítico local de apoyo cognitivo. La validación humana, la toma de decisiones críticas de seguridad y los procedimientos de reacción física son responsabilidad exclusiva del personal humano de vigilancia."
  },
  {
    category: "seguridad",
    question: "¿Los reportes exportados sirven como evidencia legal en tribunales?",
    answer: "No. Las grabaciones y reportes de simulación representan evidencias técnicas de laboratorio de uso interno operacional. No constituyen informes forenses inmutables de validez jurídica directa ni reemplazan los peritajes de organismos policiales autorizados."
  },
  {
    category: "demo",
    question: "¿Cómo preparo y practico una demo comercial de forma segura?",
    answer: "Utilice el módulo 'Official Demo Runbook' para elegir el flujo de presentación adecuado. Luego, ingrese al 'Demo Practice Mode' para practicar el manejo ético de objeciones comerciales y verificar el checklist de privacidad previo."
  },
  {
    category: "seguridad",
    question: "¿Qué pasa si se pierde la conexión de red local?",
    answer: "El sistema activa alertas locales visuales informando el estado sin conexión de forma instantánea. Al restablecerse el enlace físico, las cámaras reconectan automáticamente utilizando el protocolo de autorecuperación del gateway."
  }
];

export const GLOSSARY: GlossaryItem[] = [
  { term: "Cámara", definition: "Dispositivo físico de captura de video perimetral con direccionamiento IP local en red aislada." },
  { term: "Live Wall", definition: "Cuadrícula interactiva de video simulado de baja latencia para el monitoreo de operadores." },
  { term: "Incidente", definition: "Actividad u observación registrada de forma manual u analítica en la bitácora para trazabilidad técnica." },
  { term: "Evidencia técnica", definition: "Archivos locales de video o logs operacionales sanitizados utilizados para auditorías internas." },
  { term: "Reporte sanitizado", definition: "Documento exportable en formato Markdown que no expone datos sensibles PII de personas ni claves de red." },
  { term: "Gateway", definition: "Componente de red local encargado de capturar y retransmitir de forma segura flujos de video ONVIF." },
  { term: "Edge Recorder", definition: "Grabador de almacenamiento perimetral local con ciclos de borrado automático por retención." },
  { term: "Diagnóstico CCTV", definition: "Suite de pruebas analíticas de conectividad de red, latencia de ping y fluctuación de canales de video." },
  { term: "Privacy Shield", definition: "Módulo encargado de difuminar áreas sensibles residenciales y anonimizar peatones de forma obligatoria." },
  { term: "Centro Avanzado", definition: "Entorno completo de configuración técnica, auditorías éticas de código y control del Release Candidate." },
  { term: "Demo controlada", definition: "Presentación comercial guiada basada exclusivamente en simulaciones realistas de laboratorio cerrado." },
  { term: "Piloto acotado", definition: "Prueba técnica temporal en terreno, confinada a un número reducido de canales y con supervisión directa." },
  { term: "Validación humana", definition: "Directriz obligatoria que establece que toda decisión operativa final debe ser ejecutada por un operador calificado." },
  { term: "Datos sensibles", definition: "Información protegida (PII, contraseñas, IPs, RTSP) que debe permanecer fuera de las vistas y reportes públicos." },
  { term: "IP/RTSP", definition: "Dirección de red y protocolo de transmisión de video que no deben exponerse al exterior por razones de seguridad." },
  { term: "Credenciales", definition: "Nombres de usuario y contraseñas de red que deben ser de lectura y mantenerse locales en el gateway simulado." },
  { term: "RBAC", definition: "Control de acceso basado en roles que restringe funciones según el perfil de Conserje, Admin o Técnico." },
  { term: "Conserje", definition: "Rol de operador diario enfocado en el monitoreo perimetral, alertas directas y registro de novedades simples." },
  { term: "Admin", definition: "Rol de gestión y preventa con permisos para auditar reportes, coordinar pilotos y dirigir demostraciones." },
  { term: "Técnico", definition: "Rol de ingeniería responsable del diagnóstico de red, topología local, parámetros de grabación y compatibilidad de hardware." },
  { term: "Avisar técnico", definition: "Acción de reportar de forma segura intermitencias en la señal de video sin manipular de manera directa tableros ni cableados eléctricos." },
  { term: "Demo Mode", definition: "Entorno simulado controlado de demostración y entrenamiento para capacitar operadores libres de riesgos de red." },
  { term: "Production Locked", definition: "Sello de bloqueo preventivo que indica que la aplicación opera localmente bajo un entorno aislado de simulación segura." },
  { term: "Privacidad", definition: "Salvaguarda y enmascaramiento de zonas residenciales privadas para proteger la intimidad y evitar el almacenamiento de datos sensibles perimetrales." },
  { term: "Reporte", definition: "Resumen operativo en formato Markdown para documentar las novedades observadas de forma transparente y prudente." },
  { term: "Modo Conserje", definition: "Pantalla optimizada de baja fatiga cognitiva con controles simplificados para turnos de vigilancia de baja carga." }
];

export const TROUBLESHOOTING_CASES: TroubleshootingCase[] = [
  {
    id: "no_cams",
    title: "No se visualiza la señal de video en Live Wall",
    cause: "El canal de video simulado o el gateway de simulación se encuentra desactivado en el panel de control.",
    steps: [
      "Verifique si el interruptor general del 'Modo Demo' se encuentra encendido en el panel inferior.",
      "Abra el módulo de 'Diagnóstico CCTV' y compruebe si la cámara responde al ping de simulación.",
      "Asegúrese de que el rol activo cuenta con los permisos necesarios para iniciar flujos de video.",
      "No intente realizar reinicios de hardware físico ni desconectar cables del nodo de cómputo."
    ],
    whatNotToKeep: "No introduzca credenciales reales de cámaras IP públicas ni intente saltar el aislamiento de red.",
    whenToNotifyTech: "Avisar al Técnico si la latencia promedio supera los 1500 ms de forma persistente fuera del modo de atenuación."
  },
  {
    id: "cam_intermittent",
    title: "Cámara perimetral aparece con señal intermitente",
    cause: "Efecto activo de simulación de atenuación por mal clima, interferencia Wi-Fi o congestión en el switch LAN.",
    steps: [
      "Revise si el panel inferior indica 'Modo Demo Activo' simulando intermitencias (ej. Alhué trackers).",
      "Consulte la tasa de pérdida de paquetes en el diagnóstico del canal afectado.",
      "Espere a que el ciclo de simulación de congestión finalice de manera automática en el laboratorio.",
      "No mueva de posición las antenas de transmisión ni intente abrir cajas de empalme eléctrico."
    ],
    whatNotToKeep: "No modifique la configuración de calidad del flujo principal a valores que saturen la red de simulación.",
    whenToNotifyTech: "Consulte al Técnico de turno si el estado de desconexión completa excede los 5 minutos seguidos."
  },
  {
    id: "no_advanced",
    title: "No puedo acceder al Centro Avanzado",
    cause: "El rol de operación asignado actualmente es 'Conserje de Seguridad', el cual tiene bloqueo de acceso por diseño (RBAC).",
    steps: [
      "Observe si en la esquina inferior izquierda se encuentra seleccionado el rol de 'Conserje'.",
      "Solicite al Administrador el cambio de rol en la interfaz de control si requiere realizar labores técnicas.",
      "Confirme que la bandera de 'Modo Avanzado' no esté desactivada en los controles del panel principal.",
      "No intente utilizar inyecciones de código ni alterar las variables locales del navegador para forzar el acceso."
    ],
    whatNotToKeep: "No comparta ni registre contraseñas de simulación en notas físicas adhesivas en el puesto de control.",
    whenToNotifyTech: "Avisar al Administrador si el selector de roles de demostración no responde al hacer clic en los perfiles correspondientes."
  },
  {
    id: "no_export",
    title: "No se habilita la exportación de reportes",
    cause: "El sistema detectó términos de carácter absoluto en el texto de observaciones, o el checklist obligatorio pre-demo no está completo.",
    steps: [
      "Revise que el texto no contenga palabras restringidas por el escáner (ej: 'seguridad 100%', 'evidencia legal', 'reporte oficial').",
      "Edite la bitácora utilizando descripciones sanitizadas orientadas puramente a observaciones de laboratorio.",
      "Abra el 'Official Demo Runbook' o 'Release Candidate Control Center' y complete todos los checks requeridos.",
      "Verifique que el estado actual del panel de QA no se muestre como 'Production Locked' sin auditar."
    ],
    whatNotToKeep: "No intente saltar el analizador de microcopias copiando textos prohibidos con caracteres especiales.",
    whenToNotifyTech: "Notifique al Administrador si persisten los bloqueos de exportación tras sanitizar por completo los registros."
  },
  {
    id: "scanner_blocked",
    title: "El scanner de microcopias bloqueó mi texto",
    cause: "Se ingresaron términos que contienen reclamos comerciales absolutos, promesas de reducción de guardias o datos con estructura de PII/IP.",
    steps: [
      "Identifique la palabra o frase resaltada por el analizador en la sección de reportes.",
      "Reemplace los términos de garantía por lenguaje prudente (ej: 'reporte interno de capacitación' en lugar de 'registro de entrenamiento').",
      "Evite incluir direcciones de red IP, claves de acceso o correos electrónicos reales de residentes.",
      "Vuelva a presionar 'Escanear' para validar la sanitización de la nota."
    ],
    whatNotToKeep: "No intente burlar el escáner alternando mayúsculas/minúsculas ni agregando caracteres especiales.",
    whenToNotifyTech: "Avisar al Administrador si el texto ha sido sanitizado por completo y el scanner mantiene un bloqueo injustificado."
  },
  {
    id: "no_presenter",
    title: "No puedo iniciar el Presenter Mode",
    cause: "El checklist de seguridad previo obligatorio para demostraciones no está completo en su totalidad.",
    steps: [
      "Vaya al módulo 'Official Demo Runbook' desde la barra lateral.",
      "Desplácese hasta la sección superior del checklist previo obligatorio.",
      "Marque y complete cada una de las 10 banderas de mitigación de frentes locales.",
      "Observe cómo el botón del Presenter Mode se desbloquea de inmediato."
    ],
    whatNotToKeep: "No intente iniciar la proyección comercial de la pantalla sin realizar la revisión de las 10 salvaguardas.",
    whenToNotifyTech: "Informe al Administrador si el checklist está completo pero el botón de inicio continúa inhabilitado."
  },
  {
    id: "no_practice",
    title: "No puedo iniciar el Practice Mode",
    cause: "El sistema se encuentra bloqueado debido a frentes con alertas críticas no resueltas o falta de selección de un caso de estudio.",
    steps: [
      "Compruebe que no tiene frentes con estado 'BLOCKED' en el checklist de mitigación de la suite de insights.",
      "Asegúrese de haber seleccionado un escenario o rol habilitado para la simulación de capacitación.",
      "Verifique que el indicador general no muestre advertencias del simulador."
    ],
    whatNotToKeep: "No intente simular respuestas agresivas ni saltar las pautas de compliance ético y prudencia.",
    whenToNotifyTech: "Consulte al Administrador si el Practice Mode no responde en ningún caso de estudio."
  },
  {
    id: "conserje_no_tech",
    title: "Estoy en rol Conserje y no veo opciones técnicas",
    cause: "Por diseño estricto de accesos (RBAC), el perfil de Conserje tiene inhabilitadas las vistas técnicas, de preventa y configuraciones avanzadas.",
    steps: [
      "Observe que en el panel inferior del sistema se encuentra activo el rol 'Conserje'.",
      "Recuerde que como Conserje tiene una interfaz simplificada (4 tarjetas) para evitar errores involuntarios en el puesto.",
      "Si requiere realizar una demostración o diagnóstico de red simulado, cambie temporalmente de rol en el selector del panel inferior."
    ],
    whatNotToKeep: "No intente alterar las rutas web del navegador para forzar el acceso a paneles restringidos.",
    whenToNotifyTech: "Notifique al Administrador si al cambiar de rol del panel inferior, la interfaz no actualiza los módulos correspondientes."
  },
  {
    id: "system_demo_mode",
    title: "El sistema está fijado en Demo Mode",
    cause: "Estado por defecto para mantener el entrenamiento libre de riesgos de red, sin conexión externa y sin exponer datos reales.",
    steps: [
      "Verifique el indicador 'Demo Mode: Activo' en el panel de control inferior.",
      "Recuerde que en este modo los flujos de video y las bitácoras operan con simuladores realistas de laboratorio.",
      "Esto le permite practicar y capacitarse con total tranquilidad sin alterar la operación real."
    ],
    whatNotToKeep: "No ingrese contraseñas, patentes ni nombres de personas reales en los campos de simulación.",
    whenToNotifyTech: "Consulte al instalador técnico autorizado si se requiere la transición a un piloto acotado con cámaras de lectura locales."
  },
  {
    id: "production_locked_alert",
    title: "Aparece el estado Production Locked",
    cause: "El sistema ha congelado los flujos reales de producción para forzar el entorno seguro y controlado de demostración.",
    steps: [
      "Observe el candado de seguridad 'Production Locked' visible en el Centro Avanzado.",
      "Este estado previene que se expongan datos sensibles o canales RTSP de clientes reales durante la capacitación.",
      "Valide que el indicador de cumplimiento ético se mantenga en estado 'LOCKED' o 'READY'."
    ],
    whatNotToKeep: "No intente forzar la conexión a servidores externos de producción sin la debida autorización.",
    whenToNotifyTech: "Avisar al Administrador si el candado de seguridad genera interrupciones en las pruebas de laboratorio autorizadas."
  }
];

export const GUIDED_TOURS: GuidedTour[] = [
  {
    id: "tour_conserje",
    name: "Primer Uso Conserje",
    role: "conserje",
    description: "Recorrido rápido por las herramientas cotidianas de vigilancia perimetral.",
    steps: [
      { step: 1, title: "Bienvenido, Operador", content: "Esta es la interfaz de simulación de ORBI Sentinel IA. Diseñada especialmente para apoyar la toma de decisiones en su turno diario sin abrumar visualmente." },
      { step: 2, title: "Modo Conserje Activo", content: "La pestaña 'Modo Conserje' o 'Easy View' le ofrece una pantalla optimizada de baja fatiga cognitiva. Aquí visualizará alertas en tarjetas grandes y de alto contraste." },
      { step: 3, title: "Live Wall", content: "Ingrese al 'Live Wall' para supervisar visualmente todos los canales de video. Recuerde que el flujo es local y cuenta con enmascaramiento automático de privacidad." },
      { step: 4, title: "Bitácora de Incidentes", content: "Si detecta actividad irregular, registre el suceso en la bitácora de Incidentes de forma simple. Sea descriptivo y evite vocablos legales absolutos." },
      { step: 5, title: "Soporte Técnico", content: "Si experimenta fallas operativas de red, no manipule cables. Registre la anomalía y solicite asistencia técnica mediante los canales locales." }
    ]
  },
  {
    id: "tour_admin",
    name: "Primer Uso Administrador",
    role: "admin",
    description: "Recorrido por la gestión administrativa, preventa de pilotos y runbook de demostración comercial.",
    steps: [
      { step: 1, title: "Panel de Gestión", content: "Bienvenido al rol de Administrador. Desde aquí podrá supervisar métricas de conformidad técnica, generar reportes comerciales sanitizados y coordinar propuestas de pilotos." },
      { step: 2, title: "Runbook Oficial de Demostraciones", content: "El módulo 'Official Demo Runbook' es su mejor aliado en reuniones comerciales. Siga las rutas sugeridas para clientes y despliegue el Presenter Mode paso a paso." },
      { step: 3, title: "Checklist de Privacidad", content: "Previo a cualquier demostración, es obligatorio completar el Checklist Pre-Demo. Esto garantiza que no se expongan datos PII y activa las funciones de exportación." },
      { step: 4, title: "Reportes Sanitizados", content: "En 'Evidencia y Reportes' puede compilar informes periciales locales en formato Markdown. El software escanea automáticamente el lenguaje para mitigar reclamos engañosos." },
      { step: 5, title: "Centro Avanzado y QA", content: "Audite el cumplimiento de estándares éticos del software y frentes legales de mitigación en el 'Release Candidate Control Center' y el 'MVP Freeze Center'." }
    ]
  },
  {
    id: "tour_tecnico",
    name: "Primer Uso Técnico",
    role: "tecnico",
    description: "Inspección de diagnóstico CCTV, gateway de red simulado y compatibilidad de hardware.",
    steps: [
      { step: 1, title: "Herramientas de Red", content: "Bienvenido al perfil de Técnico de Terreno. Este entorno expone herramientas detalladas para verificar la salud de los canales de video y la latencia LAN." },
      { step: 2, title: "Diagnóstico CCTV", content: "El módulo 'Diagnóstico' le permite realizar pruebas de ping interactivo y medir fluctuaciones de velocidad simuladas en cada punto de montaje perimetral." },
      { step: 3, title: "Cámaras y Gateway Local", content: "Audite la topología local del gateway ONVIF de lectura. Recuerde que la conexión debe ser segura y completamente confinada al switch físico de simulación." },
      { step: 4, title: "Edge Recorder Parameters", content: "Ajuste el ciclo de retención local de video, la rotación de grabaciones temporales por días y configure las exclusiones de codificador estático." },
      { step: 5, title: "Matriz de Compatibilidad", content: "Consulte 'Compatibility Matrix' para validar qué cámaras residenciales o industriales de laboratorio (H.264/H.265) cuentan con transcodificación FFmpeg verificada." }
    ]
  },
  {
    id: "tour_alerta",
    name: "Cómo Revisar una Alerta",
    role: "all",
    description: "Protocolo guiado ante una alarma perimetral analítica.",
    steps: [
      { step: 1, title: "Notificación de Alerta", content: "El sistema notifica visualmente un evento detectado en un canal de video perimetral. Una señal acústica u óptica se activa en la pantalla principal." },
      { step: 2, title: "Validación en Live Wall", content: "Navegue inmediatamente al Live Wall o presione el acceso directo para desplegar la cámara que gatilló el evento." },
      { step: 3, title: "Comprobación del Entorno", content: "Inspeccione visualmente si la alerta responde a un suceso real del entorno (ej. cruce peatonal de laboratorio) o a una atenuación de red." },
      { step: 4, title: "Registro Objetivo", content: "Si la alerta requiere reporte, registre la novedad en la bitácora diaria indicando hora, cámara y observaciones concretas." },
      { step: 5, title: "Validación Humana", content: "Cierre el flujo de alarma marcándolo como validado. El sistema requiere confirmación humana activa del operador para restablecer el estado." }
    ]
  },
  {
    id: "tour_reporte",
    name: "Cómo Generar un Reporte",
    role: "admin",
    description: "Flujo paso a paso para exportar un informe pericial sanitizado.",
    steps: [
      { step: 1, title: "Selección de Registros", content: "Abra la pestaña 'Evidencia y Reportes' y seleccione los incidentes u observaciones de simulación que compondrán el informe." },
      { step: 2, title: "Ejecutar Escáner de Lenguaje", content: "Haga clic en 'Escanear Reporte'. El analizador comprobará la microcopia para eliminar términos peligrosos o comerciales absolutos." },
      { step: 3, title: "Verificación de Privacidad", content: "El sistema confirma que no se incluyen direcciones IP de switches, credenciales maestras de NVR, nombres reales de residentes ni correos." },
      { step: 4, title: "Generar Markdown", content: "Haga clic en 'Exportar Reporte Sanitizado' para renderizar el documento final en formato Markdown estructurado." },
      { step: 5, title: "Copiado Seguro", content: "Use el botón 'Copiar al Portapapeles' para resguardar la información localmente. El archivo no contiene telemetría externa adjunta." }
    ]
  },
  {
    id: "tour_prep_demo",
    name: "Cómo Preparar una Demo",
    role: "admin",
    description: "Asegurar la conformidad de frentes de seguridad antes de presentar el sistema.",
    steps: [
      { step: 1, title: "Ingreso a Runbook", content: "Abra el 'Official Demo Runbook' desde la barra lateral. Este consolidado le guiará por las rutas recomendadas para clientes técnicos o residenciales." },
      { step: 2, title: "Configurar Entorno de Red", content: "Establezca si utilizará datos de demostración ('Modo Demo: Activo') o si se conectará a las cámaras físicas PoE del laboratorio local." },
      { step: 3, title: "Checklist Pre-Demo", content: "Verifique exhaustivamente las 10 banderas de seguridad del Checklist Pre-Demo (privacidad, límites, disclaimers, etc.)." },
      { step: 4, title: "Habilitar Presenter Mode", content: "Active la visualización del panel de apoyo de Presenter Mode. Le proporcionará notas del guión, guías de diálogo y alertas en tiempo real durante la reunión." },
      { step: 5, title: "Validación Final", content: "Asegúrese de que el indicador global marque 'Demo Ready' y proceda a abrir la Pantalla Principal para iniciar la presentación." }
    ]
  },
  {
    id: "tour_practicar",
    name: "Cómo Practicar una Demo",
    role: "admin",
    description: "Ensayar respuestas comerciales y técnicas responsables.",
    steps: [
      { step: 1, title: "Modo Práctica", content: "Abra el 'Demo Practice Mode' desde la barra lateral de opciones avanzadas." },
      { step: 2, title: "Selección de Objeción", content: "Elija un escenario de objeción crítica formulada por clientes reales (ej: reemplazo de personal, validez judicial de clips)." },
      { step: 3, title: "Comprobar Respuestas Autorizadas", content: "Analice la respuesta comercial éticamente estructurada, la corrección de cumplimiento y lo que se debe evitar a toda costa." },
      { step: 4, title: "Evaluar Límites Técnicos", content: "Repase los argumentos de laboratorio y aislamiento técnico para responder con precisión ante consultas complejas de redes." },
      { step: 5, title: "Registro de Nivel de Cumplimiento", content: "Verifique su puntaje de compliance interno. Esto le preparará para responder de forma responsable en las demostraciones de terreno." }
    ]
  },
  {
    id: "tour_diagnostico_cctv",
    name: "Cómo Revisar Diagnóstico CCTV",
    role: "tecnico",
    description: "Pasos detallados para evaluar la conectividad de los nodos perimetrales.",
    steps: [
      { step: 1, title: "Ingreso a Suite de Diagnóstico", content: "Acceda a la pestaña 'Diagnóstico' o 'Diagnóstico CCTV' desde la barra lateral avanzada." },
      { step: 2, title: "Selección del Parque de Cámaras", content: "Filtre las cámaras según la zona o parque de simulación activo (ej: Dahua Lab o Las Condes)." },
      { step: 3, title: "Prueba de Ping", content: "Observe los tiempos de respuesta de ping simulados. Un estado verde indica respuesta rápida, amarillo atenuación y rojo desconexión." },
      { step: 4, title: "Análisis de Fluctuación", content: "Analice los gráficos de velocidad de transmisión en Kbps y la estabilidad del descodificador FFmpeg local." },
      { step: 5, title: "Registro de Corrección", content: "Si se detecta intermitencia real, registre las notas de diagnóstico técnico en la bitácora de mantenimiento y avise al Administrador." }
    ]
  }
];
