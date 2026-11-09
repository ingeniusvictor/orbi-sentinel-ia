import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  FileText,
  Terminal,
  Server,
  UserCheck,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ArrowLeft,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  FileDown,
  X,
  ExternalLink,
  Lock,
  Check,
  Sliders,
  FileVideo,
  Info,
  HelpCircle,
  Activity
} from "lucide-react";

// Types
export interface DemoStep {
  title: string;
  duration: string;
  screenId: string;
  screenName: string;
  speech: string;
  avoid: string;
  risk: string;
  closure: string;
}

export interface DemoRoute {
  id: string;
  name: string;
  description: string;
  duration: string;
  audience: string;
  steps: DemoStep[];
}

export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: "route-1",
    name: "Ruta 1 — Demo rápida 60 segundos",
    description: "Video corto, primer contacto inicial con clientes o presentación relámpago.",
    duration: "1 min",
    audience: "Clientes generales, prospectos rápidos",
    steps: [
      {
        title: "Pantalla Principal (Portada)",
        duration: "15s",
        screenId: "simplehome",
        screenName: "Pantalla Principal",
        speech: "Esta es la portada simplificada de ORBI Sentinel IA. Desde aquí cualquier operador puede acceder a cámaras, incidentes, diagnósticos, reportes y pilotos sin navegar por módulos técnicos.",
        avoid: "No presentar esta portada como sistema productivo 24/7 ni como reemplazo de operadores humanos.",
        risk: "Confundir la maqueta interactiva con un sistema de producción ya contratado.",
        closure: "Transicionamos de inmediato al Live Wall para ver el monitoreo de flujos."
      },
      {
        title: "Monitoreo en Vivo (Live Wall)",
        duration: "15s",
        screenId: "livewall",
        screenName: "Live Wall",
        speech: "Aquí vemos el Live Wall de baja fatiga visual. Los guardias supervisan los canales críticos con baja latencia simulada y gatillan capturas de forma manual.",
        avoid: "No prometer compatibilidad universal de cámaras ni streaming continuo RTSP directo sin gateway validado de forma interna.",
        risk: "Preguntas complejas sobre códecs H.265/H.264 o ancho de banda.",
        closure: "Pasamos a la consola para registrar anomalías detectadas en vivo."
      },
      {
        title: "Reporte de Anomalías",
        duration: "15s",
        screenId: "incidentcenter",
        screenName: "Incidentes",
        speech: "La bitácora de incidentes permite centralizar reportes vecinales y alarmas técnicas, asociando grabaciones perimetrales como evidencia digital de respaldo.",
        avoid: "No prometer envío automatizado a fuerzas policiales ni software con validez forense judicial garantizada.",
        risk: "Expectativas sobre la automatización del proceso de denuncia legal.",
        closure: "Finalizaremos mostrando cómo iniciamos un piloto controlado para el cliente."
      },
      {
        title: "Cierre con Piloto Controlado",
        duration: "15s",
        screenId: "pilotintake",
        screenName: "Pilotos y Propuestas",
        speech: "El proceso seguro de Pilot Intake nos permite evaluar la viabilidad técnica antes de cualquier instalación física, resguardando la inversión.",
        avoid: "No prometer plazos fijos de instalación inmediata ni precios finales sin análisis técnico en terreno.",
        risk: "Presión comercial para saltarse el estudio de factibilidad técnica preliminar.",
        closure: "Cierre de la demostración rápida reiterando el enfoque responsable de ORBI."
      }
    ]
  },
  {
    id: "route-2",
    name: "Ruta 2 — Demo ejecutiva 3 minutos",
    description: "Ideal para tomadores de decisión, gerencias corporativas, socios y video pitch ejecutivo.",
    duration: "3 min",
    audience: "CEOs, Gerentes de Seguridad, Inversionistas",
    steps: [
      {
        title: "Portada Premium de Operación",
        duration: "30s",
        screenId: "simplehome",
        screenName: "Pantalla Principal",
        speech: "Esta interfaz tipo launcher representa el equilibrio de ORBI: un panel libre de tecnicismos para uso diario que esconde herramientas avanzadas de diagnóstico de respaldo.",
        avoid: "Evitar terminología extremadamente técnica de redes o IP en los primeros segundos.",
        risk: "Desviar el interés comercial hacia discusiones de infraestructura física.",
        closure: "Exploremos cómo el software separa las operaciones según la naturaleza del activo."
      },
      {
        title: "Segmentación de Líneas de Operación",
        duration: "30s",
        screenId: "simplehome",
        screenName: "Líneas Field / Comm / Consumer",
        speech: "Sentinel se adapta: 'Field' para grandes plantas solares, 'Community' para condominios residenciales, y 'Consumer' para puentes de domótica personal, todo integrado.",
        avoid: "No prometer que una sola licencia cubre los tres rubros sin módulos específicos.",
        risk: "Confusión sobre la escala del licenciamiento y las capacidades del software.",
        closure: "Veamos cómo se manejan eventos reales en estas zonas."
      },
      {
        title: "Incidentes y Diagnóstico Simplificado",
        duration: "30s",
        screenId: "incidentcenter",
        screenName: "Incidentes",
        speech: "Ante cualquier anomalía detectada, el sistema unifica la alerta técnica de la cámara y la observación humana, manteniendo al equipo de guardia en constante coordinación.",
        avoid: "No sugerir que la IA reemplaza el criterio del operador de seguridad.",
        risk: "Preguntas detalladas sobre algoritmos de visión computacional patentados.",
        closure: "Analicemos cómo convertimos estos eventos en reportes formales sanitizados."
      },
      {
        title: "Evidencia Técnica y Reportes",
        duration: "30s",
        screenId: "evidence",
        screenName: "Evidencia y Reportes",
        speech: "Generamos reportes firmados con Hash SHA-256 para auditoría de integridad, asegurando que los clips de video se mantengan íntegros para el equipo supervisor.",
        avoid: "No prometer admisibilidad legal de la firma hash sin revisión de la legislación local.",
        risk: "Discusiones sobre normativas de custodia judicial de la evidencia.",
        closure: "Mostraremos las herramientas comerciales para formular propuestas personalizadas."
      },
      {
        title: "Planificación de Pilotos y Propuestas",
        duration: "30s",
        screenId: "pilotintake",
        screenName: "Pilotos y Propuestas",
        speech: "Mediante el Intake estructurado de pilotos, el cliente recibe un pre-diseño de cobertura perimetral y un plan de transiciones de CCTV ordenado y formal.",
        avoid: "No comprometer cotizaciones o descuentos definitivos en la primera sesión.",
        risk: "Tomar compromisos contractuales antes de la aprobación legal interna.",
        closure: "Concluiremos con el cierre responsable enfocado en la seguridad operativa."
      },
      {
        title: "Cierre Responsable de Demo",
        duration: "30s",
        screenId: "simplehome",
        screenName: "Pantalla Principal",
        speech: "Nuestra propuesta es mitigar riesgos operacionales mediante una transición asistida. ORBI Sentinel IA no es un reemplazo de sistemas, es un supervisor de confiabilidad.",
        avoid: "Evitar prometer prevención absoluta del delito o tasas de efectividad del 100%.",
        risk: "Que el cliente asuma que el software opera de forma autónoma sin supervisión.",
        closure: "Finalización de la presentación ejecutiva y apertura de ronda de preguntas."
      }
    ]
  },
  {
    id: "route-3",
    name: "Ruta 3 — Demo O&M Field 5 minutos",
    description: "Para Gerentes de Operaciones y Mantenimiento, jefes de planta solar e industriales.",
    duration: "5 min",
    audience: "Gerente O&M, Supervisor Técnico, Ingeniero SCADA",
    steps: [
      {
        title: "Acceso Operativo Field",
        duration: "45s",
        screenId: "simplehome",
        screenName: "Pantalla Principal (Línea Field)",
        speech: "Para activos industriales como plantas solares, la portada prioriza la conectividad de los frentes perimetrales de alta extensión, donde el monitoreo de redes es crítico.",
        avoid: "No comparar con software SCADA de control eléctrico; Sentinel es CCTV y diagnóstico de red perimetral.",
        risk: "Confundir telemetría perimetral con control de potencia de inversores.",
        closure: "Ingresemos al centro de control industrial de terreno."
      },
      {
        title: "Field Operations Center",
        duration: "60s",
        screenId: "fieldoperations",
        screenName: "Field Operations",
        speech: "Aquí controlamos múltiples subestaciones. Vemos la tasa de transferencia, estado de pings, y alertas en el enrutamiento de fibra óptica que alimenta las cámaras perimetrales.",
        avoid: "No comprometer soporte multi-marca nativo inmediato para cámaras no especificadas en la matriz.",
        risk: "Discusión técnica profunda sobre protocolos de capa de red industrial.",
        closure: "Revisemos la transmisión de video para verificar la cobertura física."
      },
      {
        title: "Cámaras Industriales (Live Wall)",
        duration: "45s",
        screenId: "livewall",
        screenName: "Live Wall (Field)",
        speech: "El Live Wall industrial permite supervisar el perímetro. En caso de corte de señal, el sistema asiste al operador indicando la última imagen capturada en memoria caché.",
        avoid: "No prometer transmisión de video en 4K fluida con conexiones de radioenlace saturadas.",
        risk: "Preguntas sobre pérdida de paquetes o ancho de banda disponible en faena.",
        closure: "Diagnostiquemos la causa de una desconexión típica en terreno."
      },
      {
        title: "Diagnóstico CCTV Integral",
        duration: "60s",
        screenId: "diagnostics",
        screenName: "Diagnóstico CCTV",
        speech: "El módulo de diagnóstico muestra la salud de switches PoE, pérdida de ping en milisegundos y latencia en el gateway. El operador identifica la falla antes de enviar cuadrillas.",
        avoid: "No garantizar reparación automática remota de hardware físico como fusibles o cables cortados.",
        risk: "Preguntas del cliente sobre integración con herramientas SNMP de terceros.",
        closure: "Consolidemos la bitácora de evidencia para informes de mantenimiento."
      },
      {
        title: "Generador de Evidencia de Fallas",
        duration: "45s",
        screenId: "evidence",
        screenName: "Evidencia y Reportes",
        speech: "Cualquier desconexión o incidente perimetral genera un registro técnico que asocia logs del ping y clips grabados, facilitando los reportes de O&M mensuales.",
        avoid: "No indicar que la evidencia exime de responsabilidad por fallas no reportadas.",
        risk: "Que el usuario asuma que el software genera reportes regulatorios gubernamentales automáticos.",
        closure: "Finalmente, evaluemos cómo se diseña el despliegue del piloto industrial."
      },
      {
        title: "Pilot Intake de Terreno",
        duration: "45s",
        screenId: "pilotintake",
        screenName: "Pilot Intake Center",
        speech: "El Pilot Intake define los frentes físicos iniciales, validando puertos libres en los switches del cliente y factibilidad de radioenlace antes de la firma del contrato.",
        avoid: "No comprometer costos de excavación, canalizaciones o postación física.",
        risk: "Asumir costos de obras civiles complementarias dentro del alcance del software.",
        closure: "Cierre seguro de la demo técnica de operaciones de mantenimiento."
      }
    ]
  },
  {
    id: "route-4",
    name: "Ruta 4 — Demo Community 5 minutos",
    description: "Enfocado en comités de administración, copropietarios y empresas de conserjería residencial.",
    duration: "5 min",
    audience: "Administradores de Condominios, Miembros de Comité, Jefes de Guardia",
    steps: [
      {
        title: "Portada Simplificada Residencial",
        duration: "45s",
        screenId: "simplehome",
        screenName: "Pantalla Principal (Community)",
        speech: "La pantalla principal residencial elimina botones técnicos complejos cuando opera un conserje, reduciendo la fatiga cognitiva y previniendo errores operacionales.",
        avoid: "No mencionar switches PoE, topologías IP o gateways locales frente a copropietarios.",
        risk: "Provocar desinterés de la junta de vecinos debido a terminología ingenieril excesiva.",
        closure: "Entremos a la vista diaria del personal de conserjería."
      },
      {
        title: "Consola de Guardia (Modo Conserje)",
        duration: "60s",
        screenId: "easyview",
        screenName: "Modo Conserje",
        speech: "Este es el Modo Conserje: botones de pánico rápidos, visor de cámaras prioritarias y un flujo limpio para reportar visitas sospechosas de forma ágil.",
        avoid: "No prometer detección de rostros con coincidencia biométrica con bases de datos policiales.",
        risk: "Dudas éticas o de privacidad vecinal respecto al uso del software.",
        closure: "Revisemos cómo registramos incidentes de forma rápida."
      },
      {
        title: "Bitácora de Incidentes Residenciales",
        duration: "45s",
        screenId: "incidentcenter",
        screenName: "Incidentes (Residencial)",
        speech: "El conserje registra reportes con un clic (por ejemplo, portón abierto). El sistema asocia el clip de la cámara correspondiente de forma interna y resguardada.",
        avoid: "No prometer resolución de disputas vecinales de forma automatizada por el software.",
        risk: "Preguntas sobre el almacenamiento de grabaciones de áreas privadas.",
        closure: "Veamos cómo aseguramos la privacidad de los residentes."
      },
      {
        title: "Privacy Shield y Cumplimiento",
        duration: "60s",
        screenId: "privacy",
        screenName: "Privacidad y Seguridad",
        speech: "La privacidad es clave: enmascaramiento dinámico de ventanas vecinas y bitácora de auditoría estricta para registrar qué guardia vio qué cámara, evitando malas prácticas.",
        avoid: "No prometer que la privacidad impide auditorías solicitadas por fiscalía de forma legal.",
        risk: "Preguntas técnicas sobre encriptación o cumplimiento estricto de la ley de protección de datos.",
        closure: "Mostraremos cómo se exporta un informe limpio para el comité de administración."
      },
      {
        title: "Reportes Mensuales de Seguridad",
        duration: "45s",
        screenId: "evidence",
        screenName: "Evidencia y Reportes",
        speech: "El administrador recibe estadísticas de eventos y clips de anomalías perimetrales ordenados por gravedad, facilitando la toma de decisiones presupuestarias.",
        avoid: "No prometer que el reporte garantiza reducción automática de la prima del seguro común.",
        risk: "Expectativas sobredimensionadas en el retorno de inversión inmediato de los gastos comunes.",
        closure: "Planifiquemos un piloto acotado para el condominio."
      },
      {
        title: "Siguiente Paso: Propuesta de Piloto",
        duration: "45s",
        screenId: "pilotintake",
        screenName: "Pilotos y Propuestas",
        speech: "El piloto residencial dura 15 días, conectando hasta 4 cámaras críticas del perímetro sin intervenir la red existente, permitiendo evaluar el software sin riesgos.",
        avoid: "No prometer piloto gratuito indefinido o instalación de cableado sin costo.",
        risk: "Discusiones sobre quién asume el costo de habilitación del gateway en conserjería.",
        closure: "Cierre seguro de la demo para comités residenciales."
      }
    ]
  },
  {
    id: "route-5",
    name: "Ruta 5 — Demo técnica 15 minutos",
    description: "Orientado a integradores de sistemas de seguridad, ingenieros de preventa y jefes de TI.",
    duration: "15 min",
    audience: "Ingenieros de TI, Integradores CCTV, Consultores Tecnológicos",
    steps: [
      {
        title: "Arquitectura General en Portada",
        duration: "60s",
        screenId: "simplehome",
        screenName: "Pantalla Principal (Admin)",
        speech: "ORBI Sentinel actúa como una capa de software agnóstica que optimiza la operación perimetral de hardware CCTV multi-marca preexistente.",
        avoid: "No presentarse como fabricante de cámaras o grabadores NVR.",
        risk: "Que el integrador vea a ORBI como competencia en lugar de un aliado de software.",
        closure: "Inspeccionemos la topología de red y administración física de dispositivos."
      },
      {
        title: "Cámaras y Gateway Local",
        duration: "120s",
        screenId: "gatewaylocal",
        screenName: "Cámaras y Gateway",
        speech: "El gateway local orquesta la conectividad. Habilitamos la detección de anomalías locales y administramos la topología PoE de los frentes asignados.",
        avoid: "No prometer soporte a marcas chinas sin protocolo ONVIF Profile S o flujos RTSP estándar.",
        risk: "Consultas de configuración sobre VLANs complejas o enrutamiento IP de capa 3.",
        closure: "Revisemos el panel de monitoreo de estado en tiempo real."
      },
      {
        title: "Diagnóstico y Conectividad PoE",
        duration: "120s",
        screenId: "diagnostics",
        screenName: "Diagnóstico CCTV",
        speech: "El módulo de diagnóstico mide latencias de ping a las IPs, consumo PoE y estabilidad de frames. Permite aislar si la falla es de red, cable o energía.",
        avoid: "No prometer auto-reparación de hardware que sufra de daño físico o sulfatación de conectores.",
        risk: "Discusiones sobre protocolos propietarios de Dahua o Hikvision.",
        closure: "Evaluemos la compatibilidad técnica del equipamiento del cliente."
      },
      {
        title: "Matriz de Compatibilidad de Protocolos",
        duration: "120s",
        screenId: "compatibility",
        screenName: "Compatibility Matrix",
        speech: "Aquí contrastamos cámaras homologadas. Verificamos soporte para Dahua RTSP, ONVIF Profile T, y marcas residenciales como Eufy mediante API local.",
        avoid: "No garantizar soporte para firmware obsoleto o descontinuado por fabricantes.",
        risk: "Preguntas sobre modelos específicos desactualizados o cámaras analógicas con encoder.",
        closure: "Revisemos la estructura de almacenamiento perimetral."
      },
      {
        title: "Grabación perimetral y NVR (Edge Recorder)",
        duration: "120s",
        screenId: "edgerecorder",
        screenName: "Edge Recorder",
        speech: "Administramos políticas de retención, calidad de stream (principal vs. secundario), audio y enmascaramiento vecinal de la evidencia local.",
        avoid: "No prometer almacenamiento en la nube ilimitado sin costo de ancho de banda y hosting.",
        risk: "Consultas de encriptación de discos y sistemas de archivos propietarios.",
        closure: "Generemos reportes con evidencia sanitizada con control de integridad."
      },
      {
        title: "Integridad de Evidencia Técnica",
        duration: "120s",
        screenId: "evidence",
        screenName: "Evidencia y Reportes",
        speech: "Para auditorías de seguridad, la evidencia se sella con metadatos de red y firma digital SHA-256, permitiendo exportar reportes técnicos íntegros.",
        avoid: "No declarar que la firma hash constituye validación pericial legal de oficio.",
        risk: "Debates legales sobre el código procesal penal local respecto a video digital.",
        closure: "Planifiquemos un piloto técnico formal."
      },
      {
        title: "Pilot Intake Center",
        duration: "120s",
        screenId: "pilotintake",
        screenName: "Pilot Intake Center",
        speech: "El Pilot Intake recopila datos del inventario del cliente de forma ordenada: switches PoE, puertos libres, marcas y modelos, perfilando la transición de CCTV.",
        avoid: "No saltarse la etapa de validación física de cableado existente.",
        risk: "Asumir la responsabilidad del estado previo de la red interna del cliente.",
        closure: "Revisemos el proceso de traspaso al equipo de instalación."
      },
      {
        title: "Pilot Handoff Pack",
        duration: "60s",
        screenId: "pilothandoff",
        screenName: "Pilot Handoff Pack",
        speech: "El Handoff Pack genera las instrucciones de instalación del gateway perimetral para el técnico de terreno, disminuyendo errores de instalación física.",
        avoid: "No prometer soporte de guardia 24/7 de forma presencial por parte del instalador de software.",
        risk: "Que el cliente confunda soporte de software con brigada de reacción presencial.",
        closure: "Cierre seguro de la demostración técnica detallada."
      },
      {
        title: "Límites Técnicos y Guardrails",
        duration: "60s",
        screenId: "simplehome",
        screenName: "Límites de Operación",
        speech: "Declaramos de forma explícita que somos un software complementario. No reemplazamos guardias humanos ni NVRs físicos de almacenamiento local.",
        avoid: "No omitir las advertencias de no-reemplazo de SCADA, NVR o brigadas de turno.",
        risk: "Reclamos posteriores de falsas expectativas en el alcance del producto.",
        closure: "Finalización de la demo técnica oficial y apertura de canal de preguntas avanzadas."
      }
    ]
  },
  {
    id: "route-6",
    name: "Ruta 6 — Demo completa 30 minutos",
    description: "Presentación oficial corporativa mayor. Recorrido exhaustivo por todos los frentes de la plataforma.",
    duration: "30 min",
    audience: "Clientes Estratégicos, Distribuidores Autorizados, Auditoría de TI Mayor",
    steps: [
      {
        title: "Bienvenida y Portada Premium",
        duration: "120s",
        screenId: "simplehome",
        screenName: "Pantalla Principal (Home V3)",
        speech: "ORBI Sentinel IA unifica la seguridad física perimetral mediante un diseño de interfaz intuitivo que simplifica la operación técnica diaria.",
        avoid: "Evitar divagar o improvisar; ceñirse estrictamente a los tiempos del runbook oficial.",
        risk: "Perder tiempo en introducciones redundantes y desfasar la agenda del cliente.",
        closure: "Iniciemos por el centro de demostración pública global."
      },
      {
        title: "Public Demo Hub",
        duration: "180s",
        screenId: "publicdemohub",
        screenName: "Public Demo Hub",
        speech: "El Public Demo Hub es el entorno controlado donde el cliente puede experimentar con escenarios preestablecidos de forma segura y sin riesgos.",
        avoid: "No simular o fingir conexiones a cámaras en vivo ajenas al entorno de demostración.",
        risk: "Que el usuario asuma que tiene acceso libre a cámaras privadas en internet.",
        closure: "Revisemos un caso de demostración guiada para frentes de terreno."
      },
      {
        title: "Field Operations Guided Demo",
        duration: "180s",
        screenId: "guidedfielddemo",
        screenName: "Field Guided Demo",
        speech: "Este simulador ilustra la operación técnica en frentes de terreno: fallas de ping, detección de movimiento perimetral y el runbook de respuesta técnica.",
        avoid: "No asegurar detección perimetral inteligente autónoma con clima extremo adverso.",
        risk: "Preguntas del cliente sobre falsos positivos por vegetación o fauna local.",
        closure: "Comparemos con una simulación enfocada en seguridad comunitaria."
      },
      {
        title: "Community Guided Demo",
        duration: "180s",
        screenId: "guideddemo",
        screenName: "Community Guided Demo",
        speech: "Aquí simulamos incidentes residenciales: robos hormiga, portones vehiculares trabados y el enmascaramiento de cámaras vecinales sensibles.",
        avoid: "No prometer intervención directa de la policía sin mediación del operador de turno.",
        risk: "Preguntas sobre regulaciones de privacidad urbana de cámaras públicas.",
        closure: "Analicemos el puente tecnológico de domótica y cámaras de consumo."
      },
      {
        title: "Consumer Bridge (Eufy Integration)",
        duration: "180s",
        screenId: "consumerbridge",
        screenName: "Consumer Bridge",
        speech: "El Consumer Bridge permite integrar de forma ágil cámaras residenciales de marcas masivas como Eufy, ampliando la cobertura de seguridad con bajo costo.",
        avoid: "No prometer compatibilidad con APIs de consumo inestables o dependientes 100% de la nube externa.",
        risk: "Cortes de señal por caídas del servicio en servidores externos de domótica.",
        closure: "Revisemos la información corporativa orientada a inversionistas."
      },
      {
        title: "Stakeholder Binder & Estrategia",
        duration: "180s",
        screenId: "stakeholderbinder",
        screenName: "Stakeholder Binder",
        speech: "Nuestra propuesta es mitigar riesgos perimetrales mediante un esquema estructurado que optimiza activos preexistentes sin costos ocultos de infraestructura.",
        avoid: "No prometer retornos de inversión exagerados o de forma inmediata en el primer mes.",
        risk: "Dudas financieras sobre la amortización del costo de licenciamiento de software.",
        closure: "Mostraremos las facilidades para exportar el material de presentación."
      },
      {
        title: "Demo Deck Export",
        duration: "180s",
        screenId: "demodeckexport",
        screenName: "Demo Deck Export Center",
        speech: "El presentador puede exportar reportes sanitizados, minutas de demostración y fichas de factibilidad para formalizar los acuerdos alcanzados de inmediato.",
        avoid: "No incluir nombres reales, correos o datos sensibles en las exportaciones comerciales.",
        risk: "Fuga accidental de datos corporativos confidenciales en documentos PDF.",
        closure: "Ingresemos el requerimiento para el estudio de factibilidad inicial."
      },
      {
        title: "Pilot Intake de Propuesta",
        duration: "180s",
        screenId: "pilotintake",
        screenName: "Pilot Intake Center",
        speech: "Con el Pilot Intake levantamos el catastro del cliente de forma ágil, preparando el terreno para el posterior traspaso técnico seguro del piloto.",
        avoid: "No prometer factibilidad técnica aprobada sin la inspección física en terreno del ingeniero de preventa.",
        risk: "Hacer ofertas vinculantes sin conocer el estado real de la red del cliente.",
        closure: "Revisemos las directrices técnicas para la instalación física."
      },
      {
        title: "Pilot Handoff & Entrega",
        duration: "180s",
        screenId: "pilothandoff",
        screenName: "Pilot Handoff Pack",
        speech: "El Handoff Pack estandariza la instalación: manual de enrutamiento, asignación de IPs estáticas y validación PoE del gateway local.",
        avoid: "No asumir que el integrador externo conoce la configuración específica sin este pack.",
        risk: "Errores de instalación física por falta de documentación clara en terreno.",
        closure: "Concluyamos la demostración mayor con los compromisos de cierre responsable."
      },
      {
        title: "Cierre de Demostración Segura",
        duration: "180s",
        screenId: "simplehome",
        screenName: "Cierre Seguro",
        speech: "ORBI Sentinel es un copiloto de confiabilidad perimetral. Validamos la tecnología mediante pilotos acotados de riesgo cero para su organización.",
        avoid: "No prometer contratos indefinidos gratuitos ni eludir las limitaciones declaradas de la plataforma.",
        risk: "Compromisos comerciales de preventa que no puedan ser respaldados técnicamente en terreno.",
        closure: "Fin del recorrido completo. Habilitación del panel de preguntas y respuestas."
      }
    ]
  }
];

interface OfficialDemoRunbookProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog: (action: string, details: string) => void;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  activePresenterDemo: { routeId: string; currentStepIndex: number } | null;
  setActivePresenterDemo: (demo: { routeId: string; currentStepIndex: number } | null) => void;
}

export default function OfficialDemoRunbook({
  userRole,
  onAddAuditLog,
  setCurrentTab,
  isDemoMode,
  toggleDemoMode,
  activePresenterDemo,
  setActivePresenterDemo
}: OfficialDemoRunbookProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-1");
  const [activeSubTab, setActiveSubTab] = useState<"runbook" | "checklist" | "contingency" | "minute" | "qalock">("runbook");

  // Pre-demo Checklist States
  const [checklist, setChecklist] = useState({
    homeVisible: true,
    correctRole: true,
    demoModeActive: true,
    productionLockedVisible: true,
    privacyActive: true,
    noRealData: true,
    noIpRtsp: true,
    noCredentials: true,
    routeSelected: true,
    timeConfirmed: false,
    closureReady: false,
    nextStepDefined: false
  });

  // Post-Demo Minute States
  const [minuteDate, setMinuteDate] = useState<string>("2026-07-30");
  const [minuteAudience, setMinuteAudience] = useState<string>("");
  const [minuteInterest, setMinuteInterest] = useState<string>("");
  const [minuteDoubts, setMinuteDoubts] = useState<string>("");
  const [minuteNextSteps, setMinuteNextSteps] = useState<string>("");
  const [minuteNotes, setMinuteNotes] = useState<string>("");

  // Scanner Results State
  const [scannerViolations, setScannerViolations] = useState<string[]>([]);
  const [isScannerClean, setIsScannerClean] = useState<boolean>(true);

  // QA Lock Audit Fronts State
  const [auditFrontStates, setAuditFrontStates] = useState<Record<string, "Ready" | "Needs Review" | "Blocked">>({
    routeCatalog: "Ready",
    presenterOverlay: "Ready",
    stepScripts: "Ready",
    directScreenLinks: "Ready",
    guardrailsPanel: "Ready",
    preDemoChecklist: "Ready",
    contingencyGuide: "Ready",
    postDemoMinute: "Ready",
    runbookScanner: "Ready",
    rbacHomePreservation: "Ready"
  });

  // Home Preservation Checklist
  const [homePreservationChecklist, setHomePreservationChecklist] = useState({
    defaultHomeUntouched: true,
    noRunbookOnHome: true,
    noNewHomeCards: true,
    advancedCenterHidden: true,
    conserjeSimpleHome: true,
    noLegacyQaReintroduced: true
  });

  // Toggle checklist helper
  const handleChecklistToggle = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if critical items fail
  // Criticals are: noRealData, noIpRtsp, noCredentials, productionLockedVisible
  const isSecurityBlocked = !checklist.noRealData || !checklist.noIpRtsp || !checklist.noCredentials || !checklist.productionLockedVisible;

  // Selected Route Data
  const selectedRoute = DEMO_ROUTES.find((r) => r.id === selectedRouteId) || DEMO_ROUTES[0];

  // Run security/PII scanner on notes and minuta fields
  useEffect(() => {
    const textToScan = `${minuteAudience} ${minuteInterest} ${minuteDoubts} ${minuteNextSteps} ${minuteNotes}`;
    const violations: string[] = [];

    // 1. IP Address IPv4 Regex
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    if (ipRegex.test(textToScan)) {
      violations.push("Dirección IP detectada (ej. 192.168.1.1). Reemplace con 'xxx.xxx.xxx.xxx' o similar.");
    }

    // 2. RTSP Links Regex
    if (/rtsp:\/\//gi.test(textToScan)) {
      violations.push("Enlace de streaming RTSP detectado. Elimine o sanitice el link.");
    }

    // 3. Emails Regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    if (emailRegex.test(textToScan)) {
      violations.push("Correo electrónico (PII) detectado. Reemplace por un rol genérico (ej. 'Administrador').");
    }

    // 4. Phone numbers (generic 7-12 digits)
    const phoneRegex = /\b\+?[0-9]{3,4}[- ]?[0-9]{3,4}[- ]?[0-9]{4}\b/g;
    if (phoneRegex.test(textToScan)) {
      violations.push("Número telefónico detectado. Sanitice la información.");
    }

    // 5. Forbidden marketing claims / pricing / contract language
    const claims = [
      { words: ["detección perfecta", "prevención total", "100% libre de delitos", "seguridad infalible"], msg: "Claim de efectividad infalible prohibido. Use 'mitigación perimetral' o 'apoyo operacional'." },
      { words: ["contrato definitivo", "validez judicial", "garantía legal", "peritaje aprobado"], msg: "Lenguaje contractual/judicial prohibido. Use 'evidencia técnica de laboratorio' o 'estudio acotado'." },
      { words: ["precio final", "cotización definitiva", "$", "USD"], msg: "Mención de precios específicos prohibida. Recomiende 'revisión comercial posterior'." }
    ];

    claims.forEach(({ words, msg }) => {
      if (words.some((w) => textToScan.toLowerCase().includes(w))) {
        violations.push(msg);
      }
    });

    setScannerViolations(violations);
    setIsScannerClean(violations.length === 0);
  }, [minuteAudience, minuteInterest, minuteDoubts, minuteNextSteps, minuteNotes]);

  // Fill in template based on selected route
  const handleAutoFillTemplate = () => {
    setMinuteAudience(selectedRoute.audience);
    setMinuteInterest("Visualizar confiabilidad perimetral de CCTV multi-marca y la interfaz de guardia simplificada.");
    setMinuteDoubts("Consultas sobre el enmascaramiento de privacidad vecinal y los tiempos de levantamiento de pilotos.");
    setMinuteNextSteps("Habilitar Pilot Intake de 4 cámaras sin costo para validación técnica en terreno.");
    setMinuteNotes(`Demostración exitosa usando la ${selectedRoute.name}. Se siguieron rigurosamente los guardrails operacionales.`);
    onAddAuditLog("Minuta Demo Autocompletada", `Se generó plantilla de minuta para ${selectedRoute.name}`);
  };

  const handleCopyMinute = () => {
    if (!isScannerClean) return;
    const formattedText = `
ORBI Sentinel IA — Minuta Post-Demo (Sanitizada)
---------------------------------------------
Fecha: ${minuteDate}
Ruta Usada: ${selectedRoute.name}
Audiencia: ${minuteAudience}
Módulos Mostrados: ${selectedRoute.steps.map((s) => s.screenName).join(", ")}
Interés Principal: ${minuteInterest}
Dudas Frecuentes: ${minuteDoubts}
Próximo Paso Sugerido: ${minuteNextSteps}
Notas del Presentador: ${minuteNotes}

Limitaciones Declaradas:
- Demostración controlada con datos simulados sanitizados.
- Se explicitó que ORBI Sentinel IA es una herramienta complementaria de apoyo operacional.
- No reemplaza guardias humanos, grabadores NVR, SCADA o brigadas de reacción de terreno.
- No se expusieron IPs, credenciales o RTSP de cámaras reales.
    `.trim();

    navigator.clipboard.writeText(formattedText);
    alert("¡Minuta sanitizada copiada al portapapeles con éxito!");
    onAddAuditLog("Minuta Copiada", `Minuta post-demo de ${selectedRoute.name} exportada.`);
  };

  const handleStartPresenterMode = () => {
    if (isSecurityBlocked) return;
    setActivePresenterDemo({
      routeId: selectedRoute.id,
      currentStepIndex: 0
    });
    // Teleport to the first screen of the route automatically
    const firstScreen = selectedRoute.steps[0].screenId;
    setCurrentTab(firstScreen);
    onAddAuditLog("Presenter Mode Iniciado", `Se activó la guía de presentación para ${selectedRoute.name}`);
  };

  if (userRole === "conserje") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 my-12" id="conserje-lock-view">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Módulo Restringido</h3>
        <p className="text-xs text-slate-400">
          El <strong>Official Demo Runbook</strong> y el <strong>Presenter Mode</strong> están disponibles estrictamente para roles de <strong>Administrador</strong> y <strong>Técnico</strong> para evitar contaminar la pantalla del guardia con elementos técnicos o de presentación.
        </p>
        <button
          onClick={() => setCurrentTab("simplehome")}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white transition-colors"
        >
          Volver a Pantalla Principal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="demo-runbook-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Official Demo Runbook</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Guía oficial para ejecutar demostraciones controladas y profesionales de ORBI Sentinel IA.
          </p>
        </div>

        {/* Presenter Status Badge */}
        <div className="flex items-center gap-3">
          {activePresenterDemo ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PRESENTER MODE ACTIVO
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              PRESENTACIÓN DETENIDA
            </div>
          )}

          {isSecurityBlocked && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-mono text-rose-400 font-bold">
              ⚠️ PRESENTER BLOQUEADO
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Content & Tabs) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-900 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-900">
            <button
              onClick={() => setActiveSubTab("runbook")}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === "runbook"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Rutas del Runbook
            </button>
            <button
              onClick={() => setActiveSubTab("checklist")}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === "checklist"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Checklist Pre-Demo
            </button>
            <button
              onClick={() => setActiveSubTab("contingency")}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === "contingency"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Guía de Contingencias
            </button>
            <button
              onClick={() => setActiveSubTab("minute")}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === "minute"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Minuta Sanitizada
            </button>
            <button
              onClick={() => setActiveSubTab("qalock")}
              className={`flex-1 py-2 text-center rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === "qalock"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              QA Lock
            </button>
          </div>

          {/* Sub-Tab 1: Runbook Routes Selection */}
          {activeSubTab === "runbook" && (
            <div className="space-y-6">
              {/* Route Selector Selector */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Seleccione Ruta Oficial de Demostración:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEMO_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-28 ${
                        selectedRouteId === route.id
                          ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-lg"
                          : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-300"
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold tracking-tight text-white line-clamp-1">{route.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{route.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-slate-900">
                        <span className="text-slate-500 font-bold uppercase">⏱️ {route.duration}</span>
                        <span className="text-slate-500 max-w-[140px] truncate">{route.audience}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pre-Presenter Launch Validation Panel */}
                <div className="pt-3 border-t border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block font-bold">
                      Ruta seleccionada: <span className="text-emerald-400">{selectedRoute.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Contiene {selectedRoute.steps.length} pasos sugeridos estructurados con script y guardrails.
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setCurrentTab("demopractice");
                      }}
                      className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Ensayar antes de presentar
                    </button>

                    <button
                      onClick={handleStartPresenterMode}
                      disabled={isSecurityBlocked}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isSecurityBlocked
                          ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Iniciar Presenter Mode
                    </button>
                  </div>
                </div>

                {isSecurityBlocked && (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5 text-[10px] text-rose-400 leading-normal">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Presenter Mode Deshabilitado:</strong> La seguridad crítica en el Checklist Pre-Demo no se ha verificado. Asegure marcar las banderas obligatorias de privacidad, datos simulados y bloqueo de producción antes de iniciar.
                    </div>
                  </div>
                )}
              </div>

              {/* Steps List Detail */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                  Pasos Estructurados de la Ruta ({selectedRoute.steps.length})
                </h3>

                <div className="space-y-3">
                  {selectedRoute.steps.map((step, idx) => (
                    <div key={idx} className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{step.title}</h4>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-0.5 block">
                              ⏱️ {step.duration} &bull; Pantalla: {step.screenName}
                            </span>
                          </div>
                        </div>

                        {/* Ir a Pantalla Direct Button */}
                        <button
                          onClick={() => {
                            setCurrentTab(step.screenId);
                            onAddAuditLog("Salto a Pantalla", `Demo saltó directamente a pantalla: ${step.screenName}`);
                          }}
                          className="px-2.5 py-1 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white rounded-lg flex items-center gap-1 transition-all"
                        >
                          Ir a pantalla
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      </div>

                      {/* Speech block */}
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-1">
                        <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                          Discurso Sugerido (Qué decir):
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          “{step.speech}”
                        </p>
                      </div>

                      {/* Avoid and Risk row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider block">
                            Qué Evitar (No prometer):
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {step.avoid}
                          </p>
                        </div>

                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg space-y-1">
                          <span className="text-[9px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                            Riesgo de Pregunta Técnico/Legal:
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {step.risk}
                          </p>
                        </div>
                      </div>

                      {/* Step Closure */}
                      <div className="text-[10px] text-slate-500 border-t border-slate-950/40 pt-2 flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-400">Cierre de Paso:</span>
                        <span>{step.closure}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Pre-Demo Checklist */}
          {activeSubTab === "checklist" && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">Auto-QA Verification & Checklist</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Antes de iniciar la presentación frente a un cliente o directorio, complete el checklist de sanitización.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setChecklist({
                        homeVisible: true,
                        correctRole: true,
                        demoModeActive: true,
                        productionLockedVisible: true,
                        privacyActive: true,
                        noRealData: true,
                        noIpRtsp: true,
                        noCredentials: true,
                        routeSelected: true,
                        timeConfirmed: true,
                        closureReady: true,
                        nextStepDefined: true
                      });
                      onAddAuditLog("Checklist Reseteado", "Pre-demo checklist completo verificado.");
                    }}
                    className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Forzar Todo OK
                  </button>
                </div>

                {/* Checklist grid split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Security Critical Group */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider block px-1">
                      🛡️ Seguridades Críticas (Obligatorias)
                    </span>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleChecklistToggle("noRealData")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.noRealData ? "bg-rose-500 border-rose-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.noRealData && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">No datos reales en pantalla</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Absoluta sanitización: nombres simulación.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("noIpRtsp")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.noIpRtsp ? "bg-rose-500 border-rose-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.noIpRtsp && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">No IP/RTSP visibles</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Direcciones IP reales bloqueadas en demo.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("noCredentials")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.noCredentials ? "bg-rose-500 border-rose-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.noCredentials && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">No credenciales visibles</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Tokens y claves cifradas/ocultas.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("productionLockedVisible")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.productionLockedVisible ? "bg-rose-500 border-rose-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.productionLockedVisible && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Badge "Production Locked" Visible</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Indica explícitamente estado sandbox.</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* General Preparedness Group */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block px-1">
                      📋 Preparación Operativa (Recomendadas)
                    </span>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleChecklistToggle("homeVisible")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.homeVisible ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.homeVisible && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Home premium visible</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Portada limpia y congelada activa.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("correctRole")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.correctRole ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.correctRole && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Rol correcto seleccionado</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Admin o Técnico para esta sesión de demo.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("demoModeActive")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.demoModeActive ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.demoModeActive && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Modo Demo / Lab Activo</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Asegura simulación nominal local.</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleChecklistToggle("timeConfirmed")}
                        className="w-full flex items-start gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-slate-800 rounded-xl text-left transition-all"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          checklist.timeConfirmed ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"
                        }`}>
                          {checklist.timeConfirmed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Tiempo disponible confirmado</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Validó duración de ruta elegida.</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secondary checklist bottom row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-950">
                  <button
                    onClick={() => handleChecklistToggle("routeSelected")}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-950/40 border border-slate-900 rounded-xl text-left text-[11px]"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      checklist.routeSelected ? "bg-emerald-500 text-slate-950 border-emerald-500" : "border-slate-700"
                    }`}>
                      {checklist.routeSelected && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className="text-slate-300">Ruta seleccionada</span>
                  </button>

                  <button
                    onClick={() => handleChecklistToggle("closureReady")}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-950/40 border border-slate-900 rounded-xl text-left text-[11px]"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      checklist.closureReady ? "bg-emerald-500 text-slate-950 border-emerald-500" : "border-slate-700"
                    }`}>
                      {checklist.closureReady && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className="text-slate-300">Cierre preparado</span>
                  </button>

                  <button
                    onClick={() => handleChecklistToggle("nextStepDefined")}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-950/40 border border-slate-900 rounded-xl text-left text-[11px]"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      checklist.nextStepDefined ? "bg-emerald-500 text-slate-950 border-emerald-500" : "border-slate-700"
                    }`}>
                      {checklist.nextStepDefined && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className="text-slate-300">Próximo paso definido</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Contingency Guide */}
          {activeSubTab === "contingency" && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Guía Rápida de Contingencias (En Vivo)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Si la demo se traba / falla</h4>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>Vuelva de inmediato a la <strong>Pantalla Principal</strong> de operación simplificada.</li>
                    <li>Navegue al <strong>Public Demo Hub</strong>, el cual contiene un set robusto de simulaciones precargadas estables.</li>
                    <li>Utilice la herramienta de <strong>Demo Deck Export</strong> en segundo plano para presentar la narrativa mediante diapositivas generadas de respaldo.</li>
                    <li>Continúe con la narrativa del runbook con calma; el software es un sandbox controlado de pre-venta.</li>
                  </ul>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Info className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Preguntas sobre Producción Real</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Respuesta oficial sugerida:</strong><br />
                    “Esta demostración interactiva opera sobre un entorno simulado de laboratorio controlado para resguardar la privacidad y la confidencialidad de frentes reales. Un despliegue productivo 24/7 requiere un estudio de factibilidad técnica física y un piloto formal autorizado.”
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Info className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Preguntas sobre Conexión de Cámaras</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Respuesta oficial sugerida:</strong><br />
                    “La integración física de cámaras en vivo se realiza de forma segura mediante credenciales ONVIF de sólo lectura, aisladas a través de redes locales independientes y nuestro gateway validado fuera del entorno de pre-venta comercial.”
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Info className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wide">Preguntas sobre Precios y Costos</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Respuesta oficial sugerida:</strong><br />
                    “Este módulo de demostración se enfoca puramente en la validación del flujo técnico y usabilidad operacional. La cotización comercial definitiva depende de la cantidad de frentes, switches PoE físicos y horas de ingeniería, y se revisa posteriormente.”
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Preguntas sobre Admisibilidad Legal de Evidencia</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Respuesta oficial sugerida:</strong><br />
                  “El hash SHA-256 es una firma técnica de laboratorio que garantiza que el archivo de video no ha sufrido manipulaciones tras ser grabado por el gateway. No reemplaza los peritajes judiciales oficiales, la cadena de custodia establecida por ley ni los procedimientos de auditoría de su propio equipo legal.”
                </p>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Post-Demo Minute (Sanitised template and live scanner) */}
          {activeSubTab === "minute" && (
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-950 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Generador de Minuta Post-Demo</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cargue y redacte la minuta de la reunión. El Runbook Scanner analizará fugas de datos y claims prohibidos en tiempo real.
                  </p>
                </div>
                <button
                  onClick={handleAutoFillTemplate}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[10px] font-mono font-bold text-emerald-400 rounded-lg flex items-center gap-1.5 transition-all self-start md:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Autocompletar Plantilla
                </button>
              </div>

              {/* Minute Form */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Fecha de Demo:</label>
                    <input
                      type="date"
                      value={minuteDate}
                      onChange={(e) => setMinuteDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Audiencia o Perfil:</label>
                    <input
                      type="text"
                      placeholder="Ej. Gerente de Seguridad y Operadores de Turno"
                      value={minuteAudience}
                      onChange={(e) => setMinuteAudience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Interés Principal Manifestado:</label>
                  <textarea
                    placeholder="Describa brevemente qué módulos despertaron mayor interés."
                    value={minuteInterest}
                    onChange={(e) => setMinuteInterest(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Dudas o Inquietudes Frecuentes:</label>
                    <textarea
                      placeholder="Ej. consultas de privacidad, enrutamiento, compatibilidad de marcas."
                      value={minuteDoubts}
                      onChange={(e) => setMinuteDoubts(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Próximo Paso Sugerido:</label>
                    <textarea
                      placeholder="Ej. coordinar Pilot Intake para 4 cámaras del perímetro este."
                      value={minuteNextSteps}
                      onChange={(e) => setMinuteNextSteps(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Notas del Presentador / Comentarios Adicionales:</label>
                  <textarea
                    placeholder="Escriba comentarios u observaciones internas de la sesión de demo."
                    value={minuteNotes}
                    onChange={(e) => setMinuteNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Runbook Scanner Real-time Validation Box */}
              <div className="mt-4 pt-4 border-t border-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    RUNBOOK SCANNER: COMPLIANCE CHECK
                  </span>
                  {isScannerClean ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                      ✅ SANITIZADO (No PII / No Claims)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono font-bold text-rose-400 uppercase animate-pulse">
                      ⚠️ VIOLACIONES DETECTADAS ({scannerViolations.length})
                    </span>
                  )}
                </div>

                {/* Scanner violation details */}
                {!isScannerClean ? (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-2.5">
                    <p className="text-[11px] text-rose-400 font-medium">
                      El scanner ha detectado elementos prohibidos o de riesgo en el texto de la minuta. Modifique los campos para habilitar la exportación/copia:
                    </p>
                    <ul className="space-y-1.5 text-[10px] text-slate-300 font-mono pl-4 list-disc">
                      {scannerViolations.map((v, i) => (
                        <li key={i} className="leading-relaxed text-rose-300/90">{v}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 font-mono leading-normal">
                    El scanner valida activamente que no se registren correos (PII), teléfonos, IPs, enlaces RTSP, ni claims de marketing definitivos (como "garantizar prevención total de delitos"). Todo limpio.
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCopyMinute}
                    disabled={!isScannerClean}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all ${
                      !isScannerClean
                        ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Minuta Sanitizada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: QA Lock & Audit Fronts */}
          {activeSubTab === "qalock" && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Panel de Bloqueo de Calidad (Runbook QA Lock)</h3>
                    <p className="text-[11px] text-slate-400">Auditoría final de los 10 frentes obligatorios para demostraciones controladas y libres de improvisación.</p>
                  </div>
                </div>

                {/* Overall Status Badge */}
                {(() => {
                  // Determine overall status
                  const hasBlocked = Object.values(auditFrontStates).some(v => v === "Blocked") || !isScannerClean;
                  const hasNeedsReview = Object.values(auditFrontStates).some(v => v === "Needs Review") || 
                                         Object.values(homePreservationChecklist).some(v => !v);
                  
                  if (hasBlocked) {
                    return (
                      <div className="bg-rose-500/10 border-2 border-rose-500/30 p-4 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                          <span>ESTADO FINAL: RUNBOOK BLOQUEADO</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Se han identificado frentes de auditoría críticos bloqueados o violaciones activas en el escáner de sanitización. Corrija los campos antes de proceder con la demostración oficial.
                        </p>
                      </div>
                    );
                  } else if (hasNeedsReview) {
                    return (
                      <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                          <HelpCircle className="w-4 h-4" />
                          <span>ESTADO FINAL: REQUIERE REVISIÓN</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Hay frentes de auditoría en revisión o checklist de preservación del Home sin certificar. Verifique que no se haya alterado el diseño de la portada premium.
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-4 rounded-xl space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                          <CheckCircle className="w-4 h-4" />
                          <span>ESTADO FINAL: OFFICIAL DEMO RUNBOOK LOCKED</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          ¡Auditoría superada de forma sobresaliente! Los 10 frentes de control y el checklist de preservación de Home están en estado óptimo. El Runbook está bloqueado y listo para presentarse.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* 10 Audit Fronts List */}
              <div className="bg-slate-900/40 rounded-2xl border border-slate-900 overflow-hidden divide-y divide-slate-900">
                {Object.entries({
                  routeCatalog: {
                    title: "1. Catálogo de Rutas",
                    desc: "Estructura lógica de las 6 rutas oficiales de demostración con objetivos y perfiles."
                  },
                  presenterOverlay: {
                    title: "2. Presenter Overlay",
                    desc: "Filtro de rol (oculto para Conserje), minimización interactiva y persistencia entre vistas."
                  },
                  stepScripts: {
                    title: "3. Guiones de Pasos",
                    desc: "Speech sugerido, elementos a evitar y alertas de riesgo técnico por cada paso."
                  },
                  directScreenLinks: {
                    title: "4. Enlaces de Pantalla Directos",
                    desc: "Navegación asistida y saltos fluidos a las pantallas reales sugeridas de cada paso."
                  },
                  guardrailsPanel: {
                    title: "5. Panel de Guardrails",
                    desc: "Exposición clara de limitaciones y aclaración de transparencia ética."
                  },
                  preDemoChecklist: {
                    title: "6. Checklist Pre-Demo",
                    desc: "Verificación de condiciones iniciales obligatorias antes de iniciar la presentación."
                  },
                  contingencyGuide: {
                    title: "7. Guía de Contingencias",
                    desc: "Protocolos de resolución rápida para imprevistos operacionales de laboratorio."
                  },
                  postDemoMinute: {
                    title: "8. Minuta Post-Demo",
                    desc: "Registro local de compromisos y próximos pasos sin almacenar datos reales."
                  },
                  runbookScanner: {
                    title: "9. Escáner de Sanitización",
                    desc: "Análisis automático de PII, IPs, RTSP y claims absolutos en la minuta."
                  },
                  rbacHomePreservation: {
                    title: "10. Seguridad RBAC y Preservación de Home",
                    desc: "Garantía de no-contaminación de la Portada Premium y separación de roles de seguridad."
                  }
                }).map(([key, label]) => {
                  const state = auditFrontStates[key];
                  
                  // Compute dynamic overrides/warnings
                  let isOverridden = false;
                  let overrideMsg = "";
                  let computedState = state;

                  if (key === "runbookScanner" && !isScannerClean) {
                    computedState = "Blocked";
                    isOverridden = true;
                    overrideMsg = "El escáner detectó violaciones de PII/claims en la minuta.";
                  } else if (key === "rbacHomePreservation" && Object.values(homePreservationChecklist).some(v => !v)) {
                    computedState = "Needs Review";
                    isOverridden = true;
                    overrideMsg = "El checklist de preservación del Home premium contiene puntos pendientes.";
                  }

                  return (
                    <div key={key} className="p-4 bg-slate-950/20 hover:bg-slate-950/40 transition-colors space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-200">{label.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{label.desc}</p>
                        </div>

                        {/* Selector Buttons */}
                        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 self-start sm:self-center">
                          {(["Ready", "Needs Review", "Blocked"] as const).map((status) => {
                            const isSelected = computedState === status;
                            
                            // Style bases
                            let activeStyle = "";
                            if (isSelected) {
                              if (status === "Ready") activeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
                              if (status === "Needs Review") activeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
                              if (status === "Blocked") activeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/30";
                            } else {
                              activeStyle = "text-slate-500 hover:text-slate-300 border border-transparent";
                            }

                            return (
                              <button
                                key={status}
                                onClick={() => {
                                  if (isOverridden && (key === "runbookScanner" || key === "rbacHomePreservation")) return;
                                  setAuditFrontStates(prev => ({ ...prev, [key]: status }));
                                  onAddAuditLog("QA Lock Cambio Estado", `Cambió frente ${label.title} a estado: ${status}`);
                                }}
                                disabled={isOverridden && (key === "runbookScanner" || key === "rbacHomePreservation")}
                                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${activeStyle} ${
                                  isOverridden && (key === "runbookScanner" || key === "rbacHomePreservation") ? "cursor-not-allowed opacity-70" : ""
                                }`}
                              >
                                {status === "Ready" ? "READY" : status === "Needs Review" ? "REVIEW" : "BLOCKED"}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display warning if overridden */}
                      {overrideMsg && (
                        <p className="text-[9px] font-mono text-amber-400 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 inline-block">
                          ⚠️ {overrideMsg}
                        </p>
                      )}

                      {/* Sub-Checklist for RBAC & Home Preservation */}
                      {key === "rbacHomePreservation" && (
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850/60 mt-2 space-y-2">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                            Checklist de No-Contaminación de Portada Premium:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { key: "defaultHomeUntouched", label: "Home premium abre por defecto" },
                              { key: "noRunbookOnHome", label: "No aparece Runbook en portada" },
                              { key: "noNewHomeCards", label: "Sin tarjetas nuevas en Home" },
                              { key: "advancedCenterHidden", label: "Centro Avanzado oculto de inicio" },
                              { key: "conserjeSimpleHome", label: "Conserje ve solo Home simplificado" },
                              { key: "noLegacyQaReintroduced", label: "Sin reintroducir QA en portada" }
                            ].map((item) => (
                              <label key={item.key} className="flex items-start gap-2 text-[10px] text-slate-300 hover:text-white cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={homePreservationChecklist[item.key as keyof typeof homePreservationChecklist]}
                                  onChange={() => {
                                    setHomePreservationChecklist(prev => {
                                      const updated = { ...prev, [item.key]: !prev[item.key as keyof typeof homePreservationChecklist] };
                                      onAddAuditLog("QA Lock Preservación Home", `Modificó checklist preservación: ${item.label}`);
                                      return updated;
                                    });
                                  }}
                                  className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3"
                                />
                                <span className="leading-tight">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Transparency Notice Disclaimer Banner */}
              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">Nota de Transparencia del Modo Presentador</h4>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Los registros del Presenter Mode son locales y de apoyo a la trazabilidad de la demo. No constituyen evidencia legal, validación externa ni bitácora inmutable.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Panel (Guardrails & Constraints) */}
        <div className="space-y-6">
          
          {/* Static Presenter Guardrails Panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
              Guardrails del Presentador
            </h3>

            {/* Split Yes/No columns */}
            <div className="space-y-4 text-xs">
              
              {/* NO PROMETER */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider block px-1">
                  ❌ No Prometer (Prohibido)
                </span>
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 space-y-2 text-[11px] text-slate-300 leading-normal">
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Detección inteligente perfecta o libre de errores.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Prevención absoluta de delitos en el perímetro.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Software productivo listo para operación 24/7.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Compatibilidad inmediata con cualquier cámara.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Reemplazo de vigilantes humanos o conserjes.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Reemplazo de NVRs, SCADA, O&M o HSE de faena.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Evidencia con validez judicial directa o ROI garantizado.</span>
                  </div>
                </div>
              </div>

              {/* SÍ DECIR */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block px-1">
                  ✔️ Sí Decir (Narrativa Permitida)
                </span>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 space-y-2 text-[11px] text-slate-300 leading-normal">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Entorno de demostración controlada y simulada.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Absoluta sanitización de datos y privacidad por diseño.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Validación humana requerida para toda anomalía perimetral.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Piloto acotado previo para certificar factibilidad de red.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Compatibilidad según cámara, protocolo y firmware homologado.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Evidencia técnica de laboratorio y apoyo operacional práctico.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Integrated Quick-Check Banner */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-3 font-mono text-[10px] text-slate-400">
            <span className="font-bold text-white uppercase block text-xs tracking-tight">
              QA Integrations Verified
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>[Release Candidate Lock]</span>
                <span className="text-emerald-400 font-bold">COMPLIANT</span>
              </div>
              <div className="flex justify-between">
                <span>[Stakeholder Binder Ref]</span>
                <span className="text-emerald-400 font-bold">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span>[Demo Deck Export Center]</span>
                <span className="text-emerald-400 font-bold">SYNCED</span>
              </div>
              <div className="flex justify-between">
                <span>[Pilot Intake/Handoff Link]</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex justify-between">
                <span>[Public Showcase Sandbox]</span>
                <span className="text-emerald-400 font-bold">ISOLATED</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-950 text-[9px] text-slate-500 leading-relaxed">
              No-Regression locks: Home premium preserved intact. Technical widgets restricted from the primary guardia view.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
