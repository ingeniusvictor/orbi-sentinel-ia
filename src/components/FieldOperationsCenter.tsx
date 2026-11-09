import React, { useState } from "react";
import {
  Sun,
  Activity,
  Video,
  ShieldAlert,
  Wrench,
  FileText,
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Lock,
  User,
  Copy,
  Check,
  Layers,
  Wifi,
  Tv,
  Cpu,
  ListTodo,
  Radio,
  TrendingUp,
  MapPin,
  Eye,
  EyeOff,
  CornerDownRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  ExternalLink
} from "lucide-react";

interface FieldOperationsCenterProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
}

// 2. Fictional, non-confidential Field Demo Sites
interface FieldSite {
  id: string;
  name: string;
  type: string;
  capacity: string;
  connectivity: "Excelente" | "Intermitente" | "Crítico";
  cctvStatus: "Completo" | "Degradado" | "Alerta";
  activeIncidents: number;
  privacyMasksActive: boolean;
  evidenceAvailable: number;
  riskLevel: "Bajo" | "Medio" | "Alto";
  description: string;
}

const FIELD_SITES: FieldSite[] = [
  {
    id: "site-sur",
    name: "Parque FV Demo Sur",
    type: "PMGD Industrial Demo",
    capacity: "3.2 MWp",
    connectivity: "Excelente",
    cctvStatus: "Completo",
    activeIncidents: 1,
    privacyMasksActive: true,
    evidenceAvailable: 2,
    riskLevel: "Bajo",
    description: "Planta fotovoltaica ubicada en la zona sur con relieve llano y baja densidad de vegetación perimetral."
  },
  {
    id: "site-centro",
    name: "Parque FV Demo Centro",
    type: "Planta Solar Industrial Demo",
    capacity: "9.6 MWp",
    connectivity: "Intermitente",
    cctvStatus: "Degradado",
    activeIncidents: 3,
    privacyMasksActive: true,
    evidenceAvailable: 4,
    riskLevel: "Medio",
    description: "Complejo de paneles con topología de seguidores automáticos y cruce de caminos públicos rurales."
  },
  {
    id: "site-cordillera",
    name: "Parque FV Demo Cordillera",
    type: "PMGD Alta Montaña Demo",
    capacity: "4.8 MWp",
    connectivity: "Crítico",
    cctvStatus: "Alerta",
    activeIncidents: 2,
    privacyMasksActive: false,
    evidenceAvailable: 1,
    riskLevel: "Alto",
    description: "Instalación fotovoltaica con alta exposición a vientos fuertes y sombra estructural temporal por cerros."
  }
];

// 3. Operational Map Zones
interface MapZone {
  id: string;
  name: string;
  status: "Normal" | "Revisión" | "Alerta" | "Punto Ciego";
  camerasCount: number;
  lastEvent: string;
  priority: "Informativo" | "Revisión" | "Alto" | "Crítico";
  recommendedAction: string;
  evidenceAvailable: boolean;
}

const INITIAL_ZONES: MapZone[] = [
  { id: "zone-gate", name: "Portón principal", status: "Normal", camerasCount: 2, lastEvent: "Acceso vehicular autorizado", priority: "Informativo", recommendedAction: "Ninguna", evidenceAvailable: true },
  { id: "zone-access", name: "Camino de acceso", status: "Normal", camerasCount: 1, lastEvent: "Ronda programada limpia", priority: "Informativo", recommendedAction: "Ninguna", evidenceAvailable: false },
  { id: "zone-perim-n", name: "Cerco perimetral norte", status: "Revisión", camerasCount: 2, lastEvent: "Movimiento de maleza detectado", priority: "Revisión", recommendedAction: "Verificar enmascaramiento por viento", evidenceAvailable: true },
  { id: "zone-perim-s", name: "Cerco perimetral sur", status: "Alerta", camerasCount: 2, lastEvent: "Posible intrusión perimetral simulada", priority: "Crítico", recommendedAction: "Efectuar patrullaje táctico en zona sur", evidenceAvailable: true },
  { id: "zone-inverters", name: "Área inversores", status: "Normal", camerasCount: 1, lastEvent: "Lectura normal de temperatura", priority: "Informativo", recommendedAction: "Ninguna", evidenceAvailable: false },
  { id: "zone-ct", name: "Centros de transformación", status: "Revisión", camerasCount: 1, lastEvent: "Cámara reporta imagen con sombra", priority: "Revisión", recommendedAction: "Limpieza periódica del lente", evidenceAvailable: false },
  { id: "zone-control", name: "Sala eléctrica / control", status: "Normal", camerasCount: 1, lastEvent: "Puerta cerrada correctamente", priority: "Informativo", recommendedAction: "Mantener acceso restringido", evidenceAvailable: true },
  { id: "zone-warehouse", name: "Bodega", status: "Normal", camerasCount: 1, lastEvent: "Sin movimientos fuera de horario", priority: "Informativo", recommendedAction: "Monitoreo nocturno estricto", evidenceAvailable: false },
  { id: "zone-materials", name: "Patio de materiales", status: "Normal", camerasCount: 1, lastEvent: "Inspección visual conforme", priority: "Informativo", recommendedAction: "Ninguna", evidenceAvailable: false },
  { id: "zone-mt", name: "Línea MT / servidumbre", status: "Revisión", camerasCount: 1, lastEvent: "Faena agrícola cercana", priority: "Revisión", recommendedAction: "Inspección de servidumbre", evidenceAvailable: false },
  { id: "zone-meteo", name: "Estación meteorológica", status: "Normal", camerasCount: 0, lastEvent: "Sin cobertura directa", priority: "Informativo", recommendedAction: "No requiere", evidenceAvailable: false },
  { id: "zone-trackers", name: "Sector tracker / mesas FV", status: "Revisión", camerasCount: 1, lastEvent: "Paso de seguidor bloquea cámara", priority: "Revisión", recommendedAction: "Ajustar ángulo de cámara perimetral", evidenceAvailable: true },
  { id: "zone-parking", name: "Estacionamiento técnico", status: "Normal", camerasCount: 1, lastEvent: "Salida de camioneta técnica", priority: "Informativo", recommendedAction: "Ninguna", evidenceAvailable: false },
  { id: "zone-blind", name: "Punto ciego / zona sin cobertura", status: "Punto Ciego", camerasCount: 0, lastEvent: "Sin cámara asociada", priority: "Alto", recommendedAction: "Evaluar instalación de nueva cámara fija", evidenceAvailable: false }
];

// 4. Cameras Field Demo
interface FieldCamera {
  id: string;
  name: string;
  type: string;
  ip: string;
  status: "Operativa" | "Sin señal" | "Intermitente" | "Vista obstruida" | "Credencial pendiente" | "RTSP validado" | "ONVIF pendiente" | "Grabación lab disponible" | "Privacy restricted";
  poePort: string;
  linkQuality: "Excelente" | "Estable" | "Malo" | "Desconectado";
  latency: string;
  obstructionReason?: string;
  rtspUrl: string;
}

const INITIAL_FIELD_CAMERAS: FieldCamera[] = [
  { id: "CAM-GATE-01", name: "CAM-GATE-01", type: "PTZ Industrial", ip: "192.168.10.11", status: "Operativa", poePort: "Port 1", linkQuality: "Excelente", latency: "12 ms", rtspUrl: "rtsp://192.168.10.11:554/live/main" },
  { id: "CAM-ACCESS-02", name: "CAM-ACCESS-02", type: "Dahua PoE Fija", ip: "192.168.10.12", status: "RTSP validado", poePort: "Port 2", linkQuality: "Estable", latency: "18 ms", rtspUrl: "rtsp://192.168.10.12:554/cam/real" },
  { id: "CAM-PERIM-N-03", name: "CAM-PERIM-N-03", type: "Cámara fija perimetral", ip: "192.168.10.13", status: "Intermitente", poePort: "Port 3", linkQuality: "Malo", latency: "145 ms", rtspUrl: "rtsp://192.168.10.13:554/live" },
  { id: "CAM-PERIM-S-04", name: "CAM-PERIM-S-04", type: "Cámara fija perimetral", ip: "192.168.10.14", status: "Grabación lab disponible", poePort: "Port 4", linkQuality: "Excelente", latency: "11 ms", rtspUrl: "rtsp://192.168.10.14:554/stream1" },
  { id: "CAM-INVERTER-05", name: "CAM-INVERTER-05", type: "IP industrial RTSP", ip: "192.168.10.15", status: "Operativa", poePort: "Port 5", linkQuality: "Estable", latency: "22 ms", rtspUrl: "rtsp://192.168.10.15:554/channel1" },
  { id: "CAM-CT-06", name: "CAM-CT-06", type: "Dahua PoE Fija", ip: "192.168.10.16", status: "ONVIF pendiente", poePort: "Port 6", linkQuality: "Estable", latency: "25 ms", rtspUrl: "rtsp://192.168.10.16:554/video" },
  { id: "CAM-CONTROL-07", name: "CAM-CONTROL-07", type: "Dahua PoE Fija", ip: "192.168.10.17", status: "Privacy restricted", poePort: "Port 7", linkQuality: "Excelente", latency: "10 ms", rtspUrl: "rtsp://192.168.10.17:554/private" },
  { id: "CAM-WAREHOUSE-08", name: "CAM-WAREHOUSE-08", type: "IP industrial RTSP", ip: "192.168.10.18", status: "Credencial pendiente", poePort: "Port 8", linkQuality: "Estable", latency: "20 ms", rtspUrl: "rtsp://192.168.10.18:554/live" },
  { id: "CAM-MT-LINE-09", name: "CAM-MT-LINE-09", type: "Cámara fija perimetral", ip: "192.168.10.19", status: "Operativa", poePort: "Port 9", linkQuality: "Excelente", latency: "15 ms", rtspUrl: "rtsp://192.168.10.19:554/main" },
  { id: "CAM-TRACKER-10", name: "CAM-TRACKER-10", type: "PTZ Industrial", ip: "192.168.10.20", status: "Vista obstruida", poePort: "Port 10", linkQuality: "Estable", latency: "19 ms", obstructionReason: "Seguidor solar bloquea visual en ángulo +45°", rtspUrl: "rtsp://192.168.10.20:554/ptz" },
  { id: "CAM-BLINDSPOT-11", name: "CAM-BLINDSPOT-11", type: "Cámara fija perimetral", ip: "192.168.10.21", status: "Sin señal", poePort: "Port 11", linkQuality: "Desconectado", latency: "999 ms", rtspUrl: "rtsp://192.168.10.21:554/none" },
  { id: "CAM-MOBILE-12", name: "CAM-MOBILE-12", type: "Cámara WiFi consumer", ip: "192.168.10.99", status: "Intermitente", poePort: "Wifi-Link", linkQuality: "Malo", latency: "280 ms", rtspUrl: "rtsp://192.168.10.99:554/wifi" }
];

// 8. Field Incident Workflow
interface FieldIncident {
  id: string;
  type: string;
  zone: string;
  camera: string;
  timestamp: string;
  observations: string;
  evidenceId?: string;
  priority: "Informativo" | "Revisión" | "Alto" | "Crítico";
  status: "Abierto" | "En revisión" | "Escalado a supervisor" | "Requiere técnico" | "Cerrado" | "Falso positivo";
  responsibleRole: "Administrador" | "Técnico" | "Conserje";
}

const INITIAL_FIELD_INCIDENTS: FieldIncident[] = [
  {
    id: "f-inc-1",
    type: "Posible intrusión perimetral",
    zone: "Cerco perimetral sur",
    camera: "CAM-PERIM-S-04",
    timestamp: "2026-07-20 11:30:15",
    observations: "Persona merodeando cerca de la servidumbre sur del parque. Posible evento a revisar pre-registrado en simulación.",
    evidenceId: "f-clip-s4",
    priority: "Crítico",
    status: "Escalado a supervisor",
    responsibleRole: "Administrador"
  },
  {
    id: "f-inc-2",
    type: "Portón abierto",
    zone: "Portón principal",
    camera: "CAM-GATE-01",
    timestamp: "2026-07-20 09:12:44",
    observations: "Alerta de portón principal abierto por más de 15 minutos fuera del horario de descarga.",
    evidenceId: "f-clip-g1",
    priority: "Alto",
    status: "Abierto",
    responsibleRole: "Conserje"
  },
  {
    id: "f-inc-3",
    type: "Cámara sin señal / requiere revisión",
    zone: "Punto ciego / zona sin cobertura",
    camera: "CAM-BLINDSPOT-11",
    timestamp: "2026-07-20 04:00:00",
    observations: "Pérdida absoluta de ping y señal de video. Se requiere reemplazo o revisión de fusible PoE.",
    priority: "Alto",
    status: "Requiere técnico",
    responsibleRole: "Técnico"
  },
  {
    id: "f-inc-4",
    type: "Vista obstruida / requiere revisión",
    zone: "Sector tracker / mesas FV",
    camera: "CAM-TRACKER-10",
    timestamp: "2026-07-20 14:15:22",
    observations: "Panel solar en rotación obstruye el 40% de la visual del cerco. Requiere recalibración física.",
    priority: "Revisión",
    status: "En revisión",
    responsibleRole: "Técnico"
  }
];

// 9. Field Context AI Rules
interface ContextRule {
  id: string;
  eventType: string;
  description: string;
  classification: "Normal" | "Informativo" | "Revisión" | "Alerta" | "Crítico";
  logicDescription: string;
}

const CONTEXT_RULES: ContextRule[] = [
  { id: "cr-1", eventType: "Técnico ingresando en horario laboral", description: "Personal O&M registrado en bitácora ingresando a inversores.", classification: "Normal", logicDescription: "Coincide con rango de mantenimiento 08:00 a 18:00 y autorización previa." },
  { id: "cr-2", eventType: "Vehículo autorizado en camino principal", description: "Camioneta técnica transita por el camino de acceso interno.", classification: "Normal", logicDescription: "Filtro de patente coincide con contratista aprobado de O&M." },
  { id: "cr-3", eventType: "Movimiento por viento/vegetación", description: "Maleza oscilando en cerco perimetral norte.", classification: "Informativo", logicDescription: "Sentinel Filter ignora oscilaciones repetitivas de baja amplitud." },
  { id: "cr-4", eventType: "Movimiento de tracker", description: "Rotación automática de las mesas fotovoltaicas.", classification: "Informativo", logicDescription: "Detección descartada al cotejar con el plan de seguimiento astronómico." },
  { id: "cr-5", eventType: "Persona en perímetro fuera de horario", description: "Humano detectado a las 02:30 AM en zona de servidumbre.", classification: "Crítico", logicDescription: "Disparador inmediato de alerta visual y registro prioritario en Vault." },
  { id: "cr-6", eventType: "Vehículo detenido cerca de portón", description: "Auto estacionado de noche en zona de ingreso secundario.", classification: "Alerta", logicDescription: "Detención prolongada (>5 min) sin autorización en área crítica." },
  { id: "cr-7", eventType: "Movimiento en bodega fuera de horario", description: "Apertura o movimiento detectado en bodega a las 23:00.", classification: "Crítico", logicDescription: "Zona de repuestos críticos. Requiere validación inmediata por conserjería." },
  { id: "cr-8", eventType: "Vista bloqueada por tracker", description: "La visual perimetral queda obstruida por un panel fotovoltaico.", classification: "Revisión", logicDescription: "Inteligencia de contexto identifica bloqueo de visión por objeto estructural." },
  { id: "cr-9", eventType: "Cámara crítica sin señal", description: "CAM-BLINDSPOT-11 pierde conexión IP con switch PoE.", classification: "Alerta", logicDescription: "Señalización de caída de enlace físico o corte de energía eléctrica local." }
];

// 11. Field Readiness Checklist Items
interface ChecklistItem {
  id: string;
  task: string;
  category: "Legal" | "Técnico" | "Operativo";
  status: "Listo" | "Pendiente" | "Requiere revisión" | "No aplica";
  desc: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: "fc-1", task: "Autorización escrita del cliente O&M", category: "Legal", status: "Listo", desc: "Permiso formal para auditoría e integración transitoria de cámaras." },
  { id: "fc-2", task: "Inventario de cámaras instaladas", category: "Técnico", status: "Listo", desc: "Listado completo con marcas, modelos y resoluciones aproximadas." },
  { id: "fc-3", task: "Identificación de marcas y protocolos", category: "Técnico", status: "Listo", desc: "Confirmación de compatibilidad RTSP, ONVIF y PoE local." },
  { id: "fc-4", task: "Acceso autorizado a NVR / Cámaras", category: "Legal", status: "Listo", desc: "Claves de lectura temporales para el Access Vault sin privilegios de escritura." },
  { id: "fc-5", task: "Mapeo de la red local del parque", category: "Técnico", status: "Requiere revisión", desc: "Identificación de direccionamiento IP y switches perimetrales." },
  { id: "fc-6", task: "Ubicación física para Gateway local", category: "Operativo", status: "Pendiente", desc: "Espacio en rack con alimentación y enlace de red en sala de control." },
  { id: "fc-7", task: "Zonas críticas de seguridad definidas", category: "Operativo", status: "Listo", desc: "Identificación de cerco sensible, inversores y bodega." },
  { id: "fc-8", task: "Zonas privadas y deslindes excluidas", category: "Legal", status: "Listo", desc: "Configuración de enmascaramiento para predios vecinos y caminos públicos." },
  { id: "fc-9", task: "Definición de política de retención", category: "Legal", status: "Listo", desc: "Configuración inicial de retención baja (3 a 7 días) para el piloto." },
  { id: "fc-10", task: "Roles y usuarios del piloto asignados", category: "Operativo", status: "Listo", desc: "Asignación de credenciales para administradores de planta y guardias." },
  { id: "fc-11", task: "Procedimiento de exportación de evidencia", category: "Operativo", status: "Listo", desc: "Protocolo de descarga local de clips firmado por SHA-256." },
  { id: "fc-12", task: "Coordinación con equipo de seguridad física", category: "Operativo", status: "Requiere revisión", desc: "Sincronización con la empresa de guardias y protocolos de reacción." },
  { id: "fc-13", task: "Alineación con operaciones O&M", category: "Operativo", status: "Listo", desc: "Coordinación para no generar alertas por mantenimiento programado." },
  { id: "fc-14", task: "Revisión de seguridad HSE / Prevención", category: "Legal", status: "Listo", desc: "Inducción básica de ingreso y riesgos eléctricos del parque." },
  { id: "fc-15", task: "Prueba limitada de 1 a 3 cámaras", category: "Técnico", status: "Listo", desc: "Configuración restringida para validar enlace IP sin saturar radioenlaces." },
  { id: "fc-16", task: "Informe final de resultados piloto", category: "Operativo", status: "Pendiente", desc: "Estructuración de reporte de valor operativo para comité directivo." }
];

export default function FieldOperationsCenter({
  userRole,
  onAddAuditLog
}: FieldOperationsCenterProps) {
  // Navigation tabs inside the Field Center
  const [activeSubTab, setActiveSubTab] = useState<"panel" | "diagnostics" | "incidents" | "context" | "report" | "checklist" | "qalock">("panel");
  
  // Selected site
  const [selectedSiteId, setSelectedSiteId] = useState<string>("site-centro");
  const selectedSite = FIELD_SITES.find((s) => s.id === selectedSiteId) || FIELD_SITES[1];

  // Dynamic state for simulation
  const [zones, setZones] = useState<MapZone[]>(INITIAL_ZONES);
  const [cameras, setCameras] = useState<FieldCamera[]>(INITIAL_FIELD_CAMERAS);
  const [incidents, setIncidents] = useState<FieldIncident[]>(INITIAL_FIELD_INCIDENTS);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  // New incident inputs
  const [newIncidentType, setNewIncidentType] = useState<string>("Intrusión perimetral");
  const [newIncidentZone, setNewIncidentZone] = useState<string>("Cerco perimetral norte");
  const [newIncidentCam, setNewIncidentCam] = useState<string>("CAM-PERIM-N-03");
  const [newIncidentObs, setNewIncidentObs] = useState<string>("");
  const [newIncidentPriority, setNewIncidentPriority] = useState<"Informativo" | "Revisión" | "Alto" | "Crítico">("Alto");
  const [isAddingIncident, setIsAddingIncident] = useState<boolean>(false);

  // Clipboard copies
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);

  // Toggle checklist status
  const toggleChecklistStatus = (id: string) => {
    const nextStatusMap: Record<ChecklistItem["status"], ChecklistItem["status"]> = {
      "Listo": "Pendiente",
      "Pendiente": "Requiere revisión",
      "Requiere revisión": "No aplica",
      "No aplica": "Listo"
    };

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = nextStatusMap[item.status];
          if (onAddAuditLog) {
            onAddAuditLog(
              "Readiness Checklist Field",
              `Cambiado estado de '${item.task}' a ${updated}`
            );
          }
          return { ...item, status: updated };
        }
        return item;
      })
    );
  };

  // Add Incident Handler
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: FieldIncident = {
      id: "f-inc-" + Date.now(),
      type: newIncidentType,
      zone: newIncidentZone,
      camera: newIncidentCam,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      observations: newIncidentObs || `Reporte manual de incidente de tipo ${newIncidentType} en ${newIncidentZone}.`,
      priority: newIncidentPriority,
      status: "Abierto",
      responsibleRole: userRole === "conserje" ? "Conserje" : userRole === "tecnico" ? "Técnico" : "Administrador"
    };

    setIncidents((prev) => [newInc, ...prev]);

    // Update zone status accordingly
    setZones((prev) =>
      prev.map((z) => {
        if (z.name === newIncidentZone) {
          return {
            ...z,
            status: newIncidentPriority === "Crítico" || newIncidentPriority === "Alto" ? "Alerta" : "Revisión",
            lastEvent: `Reportado manual: ${newIncidentType}`
          };
        }
        return z;
      })
    );

    if (onAddAuditLog) {
      onAddAuditLog("Incidente Field Registrado", `Se reportó manual '${newIncidentType}' en ${newIncidentZone}`);
    }

    setNewIncidentObs("");
    setIsAddingIncident(false);
  };

  // Change incident status
  const updateIncidentStatus = (id: string, newStatus: FieldIncident["status"]) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          if (onAddAuditLog) {
            onAddAuditLog("Workflow Incidente Field", `Cambiado estado de incidente ${id} a '${newStatus}'`);
          }
          return { ...inc, status: newStatus };
        }
        return inc;
      })
    );
  };

  // Generate O&M Report Markdown text
  const generateOMReportText = () => {
    return `# FIELD O&M EVIDENCE REPORT - ORBI SENTINEL IA
Fecha de Reporte: ${new Date().toISOString().substring(0, 10)}
Sitio de Demostración: ${selectedSite.name} (${selectedSite.type})
Capacidad de Planta: ${selectedSite.capacity}
Estado CCTV Global: ${selectedSite.cctvStatus}
Riesgo Operacional: ${selectedSite.riskLevel}

## 1. Resumen de Cámaras Evaluadas
Total de Cámaras: ${cameras.length}
- Operativas / Validadas: ${cameras.filter(c => c.status === "Operativa" || c.status === "RTSP validado" || c.status === "Grabación lab disponible").length}
- Con Detalle Técnico: ${cameras.filter(c => c.status !== "Operativa" && c.status !== "RTSP validado" && c.status !== "Grabación lab disponible").length}

## 2. Bitácora de Incidentes del Piloto
${incidents.map((inc, i) => `${i+1}. [${inc.priority}] ${inc.type} en ${inc.zone} (${inc.status}) - Obs: ${inc.observations}`).join("\n")}

## 3. Matriz de Contexto AI Simulada
Análisis de patrones en tiempo de O&M fotovoltaico:
- Eventos normales catalogados de forma local para evitar fatiga de alertas.
- Identificación de sombras estructurales de seguidores (trackers).
- Filtro perimetral avanzado contra interferencias meteorológicas.

## 4. Limitaciones y Declaraciones de Responsabilidad (Guardrails)
- Este reporte constituye una demostración técnica local de laboratorio.
- No reemplaza los sistemas SCADA de la planta FV ni los servicios de guardia física existentes.
- La compatibilidad del sistema está sujeta a la conexión local autorizada de las cámaras y los enlaces de radiofrecuencia perimetrales.
- El análisis de datos no constituye una cadena de custodia judicial certificada ni garantiza cero intrusiones.

Atentamente,
Área de Operación & Mantenimiento - ORBI Sentinel IA`;
  };

  const copyToClipboard = () => {
    const text = generateOMReportText();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    if (onAddAuditLog) {
      onAddAuditLog("Exportar Reporte Field", `Copiado Reporte O&M de '${selectedSite.name}' al portapapeles`);
    }
  };

  const generateDemoBriefText = () => {
    return `### ORBI SENTINEL IA — FIELD DEMO BRIEF
=========================================
*   **Versión:** v0.3.1-sentinel-field-solar-om-demo-lock
*   **Estado de la Demo:** FIELD DEMO LOCKED (Audited & Stable)
*   **Qué se puede mostrar:**
    1. Centro de Operaciones "Field Operations Center" interactivo de fondo oscuro.
    2. Mapa Operacional de 14 zonas mostrando estados, cámaras y recomendaciones de terreno.
    3. Experiencia de Roles Adaptada: Field EasyView (Guarda) vs Dashboard Ejecutivo (Admin) vs Technical Diagnostics (Técnico).
    4. Workflow de Gestión de Incidentes con 5 estados para registrar y escalar anomalías.
    5. Motor Context AI Solar: clasificación inteligente de patrones (viento, maleza, paso de trackers).
    6. Field O&M Evidence Report copiable con control de integridad local emulado SHA-256.
    7. Field Readiness Checklist interactivo con 16 puntos para la auditoría previa al piloto.
*   **Qué NO se debe prometer (Límites de Seguridad):**
    - NO prometer detección 100% perfecta de intrusiones en toda circunstancia.
    - NO prometer prevención absoluta de robos de cable o equipamiento.
    - NO prometer sustitución del personal de seguridad física o de los operadores de O&M.
    - NO prometer integración SCADA interactiva de control de potencia en tiempo real.
    - NO afirmar validez legal o judicial certificada sobre las bitácoras generadas.
*   **Audiencia Recomendada:** Gerentes de Operación & Mantenimiento (O&M), Jefes de Planta, Supervisores Técnicos, Comités de Seguridad Industrial y Propietarios de PMGD.
*   **Duración Recomendada de la Presentación:** 5 a 10 minutos enfocados en valor operacional.
*   **Próximo Paso Sugerido:** Auditoría de terreno con el Checklist interactivo de 16 puntos y despliegue del Gateway local piloto con 1-3 cámaras.`;
  };

  const copyBriefToClipboard = () => {
    const text = generateDemoBriefText();
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
    if (onAddAuditLog) {
      onAddAuditLog("Exportar Demo Brief", "Copiado Field Demo Brief al portapapeles");
    }
  };

  // --- RENDERING VIEWS BASED ON ROL ---

  // A. CONSERJE / GUARDIA SIMPLIFIED MODE (EASYVIEW FIELD)
  if (userRole === "conserje") {
    return (
      <div id="field-operations-conserje" className="space-y-6">
        {/* Banner header for Simple Field Conserje */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Sentinel Field Active</span>
            </div>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">Consola de Vigilancia de Terreno (O&M)</h2>
            <p className="text-xs text-slate-400">Panel simplificado libre de tecnicismos para operadores y guardias de turno del parque solar.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {FIELD_SITES.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Overview and Status for Guard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Estado del Sitio</span>
              <span className="text-sm font-bold text-emerald-400">Normal (Monitoreado)</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Alertas del Día</span>
              <span className="text-sm font-bold text-slate-200">
                {incidents.filter((i) => i.status !== "Cerrado").length} Pendientes de Revisión
              </span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/80 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Cámaras Críticas</span>
              <span className="text-sm font-bold text-slate-200">
                {cameras.filter(c => c.name.includes("GATE") || c.name.includes("PERIM")).length} Perimetrales Activas
              </span>
            </div>
          </div>
        </div>

        {/* 2. Critical Cameras View for Guard */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Estado de Cámaras del Parque</h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Excluye detalles de red / IPs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {cameras.map((cam) => {
              const isCrit = cam.status === "Sin señal" || cam.status === "Vista obstruida" || cam.status === "Intermitente";
              return (
                <div key={cam.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{cam.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cam.type}</p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Estado Reportado</span>
                    <span className={`text-[11px] font-bold ${isCrit ? "text-amber-400" : "text-slate-300"}`}>
                      {cam.status === "Sin señal" ? "🔴 Cámara sin señal" :
                       cam.status === "Vista obstruida" ? "🟡 Vista obstruida" :
                       cam.status === "Intermitente" ? "🟡 Enlace inestable" : "🟢 Operativa"}
                    </span>
                    {cam.obstructionReason && (
                      <p className="text-[9px] text-slate-500 leading-tight italic mt-1 bg-slate-900 p-1.5 rounded">
                        {cam.obstructionReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Action Buttons & Quick Incident Logger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Últimos Eventos & Alertas Recientes</h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {incidents.map((inc) => (
                <div key={inc.id} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        inc.priority === "Crítico" ? "bg-rose-500/15 text-rose-400" :
                        inc.priority === "Alto" ? "bg-amber-500/15 text-amber-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {inc.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{inc.timestamp}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200">{inc.type} en {inc.zone}</p>
                    <p className="text-[11px] text-slate-400 leading-normal">{inc.observations}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 block">
                      {inc.status}
                    </span>
                    {inc.status !== "Cerrado" && (
                      <button
                        onClick={() => updateIncidentStatus(inc.id, "Cerrado")}
                        className="text-[9px] text-emerald-400 hover:underline block w-full text-right"
                      >
                        Marcar Resuelto
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Marcar Incidente Operacional</h3>
            
            {!isAddingIncident ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  ¿Visualiza alguna anomalía, vehículo extraño, animal dentro de la planta o cámara fallando? Regístrela de inmediato para notificar a los supervisores de O&M.
                </p>
                <button
                  onClick={() => setIsAddingIncident(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Abrir Formulario de Reporte
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateIncident} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Anomalía Detectada</label>
                  <select
                    value={newIncidentType}
                    onChange={(e) => setNewIncidentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Intrusión perimetral">Intrusión perimetral</option>
                    <option value="Portón abierto">Portón abierto</option>
                    <option value="Cámara sin señal">Cámara sin señal</option>
                    <option value="Vista obstruida">Vista obstruida</option>
                    <option value="Vehículo no identificado">Vehículo no identificado</option>
                    <option value="Animal dentro del parque">Animal dentro del parque</option>
                    <option value="Otro">Otro Incidente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Zona de la Planta</label>
                  <select
                    value={newIncidentZone}
                    onChange={(e) => setNewIncidentZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Observación rápida</label>
                  <textarea
                    value={newIncidentObs}
                    onChange={(e) => setNewIncidentObs(e.target.value)}
                    placeholder="Escriba detalles breves del suceso..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none resize-none h-16"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingIncident(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    Enviar Alerta
                  </button>
                </div>
              </form>
            )}

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  if (onAddAuditLog) onAddAuditLog("Guard Notification", "Notificado supervisor de turno vía radio-frecuencia simulada");
                  alert("Notificación enviada a supervisores de O&M (Simulado).");
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 py-2 rounded-lg text-xs border border-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Avisar a Supervisor Directo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // B. ADMINISTRATOR & TECHNICAL VIEW (COMPLETE DASHBOARD)
  return (
    <div id="field-operations-center-admin" className="space-y-6">
      {/* 1. Header with Site Selector and Brand Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border border-amber-500/20">
              MÓDULO 3A — Sentinel Field / Solar O&M Pilot
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
              ACTIVE DEMO
            </span>
          </div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Sentinel Field Operations Center</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Supervisión visual inteligente, bitácora de incidentes y evidencia diagnóstica para plantas solares, subestaciones eléctricas y operaciones perimetrales complejas.
          </p>
        </div>

        {/* Site select */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-mono">LÍNEA SELECCIONADA</span>
            <span className="text-xs font-bold text-slate-300 uppercase">Parque Demo Solar</span>
          </div>
          <div className="border-l border-slate-800 h-8 mx-1"></div>
          <select
            value={selectedSiteId}
            onChange={(e) => {
              setSelectedSiteId(e.target.value);
              if (onAddAuditLog) onAddAuditLog("Cambio de Sitio Field", `Visualizando '${FIELD_SITES.find(s => s.id === e.target.value)?.name}'`);
            }}
            className="bg-transparent text-xs text-emerald-400 font-bold focus:outline-none cursor-pointer"
          >
            {FIELD_SITES.map((site) => (
              <option key={site.id} value={site.id} className="bg-slate-900 text-slate-200">
                {site.name} ({site.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Site Information Banner Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block uppercase">Descripción del Recinto</span>
          <p className="text-xs text-slate-300 leading-normal">{selectedSite.description}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block uppercase">Información Técnica</span>
          <div className="text-xs space-y-0.5 font-mono text-slate-400">
            <div>Tipo: <span className="text-slate-200">{selectedSite.type}</span></div>
            <div>Potencia: <span className="text-slate-200">{selectedSite.capacity}</span></div>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block uppercase">Riesgo & Conectividad</span>
          <div className="text-xs space-y-0.5 font-mono">
            <div>Riesgo O&M: <span className={`font-bold ${
              selectedSite.riskLevel === "Alto" ? "text-rose-400" : selectedSite.riskLevel === "Medio" ? "text-amber-400" : "text-emerald-400"
            }`}>{selectedSite.riskLevel}</span></div>
            <div>Conectividad: <span className={`font-bold ${
              selectedSite.connectivity === "Excelente" ? "text-emerald-400" : selectedSite.connectivity === "Intermitente" ? "text-amber-400" : "text-rose-400"
            }`}>{selectedSite.connectivity}</span></div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Menu Inside Field Component */}
      <div className="border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 -mb-px">
          {[
            { id: "panel", label: "Panel Operacional (Mapa & Zonas)", icon: Layers },
            { id: "diagnostics", label: "Diagnóstico Técnico", icon: Wrench },
            { id: "incidents", label: "WorkFlow de Incidentes", icon: ShieldAlert },
            { id: "context", label: "Context AI Solar", icon: Zap },
            { id: "report", label: "O&M Evidence Report", icon: FileText },
            { id: "checklist", label: "Readiness & Comparativa", icon: ListTodo },
            { id: "qalock", label: "Field QA Lock Panel", icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  if (onAddAuditLog) onAddAuditLog("Navegación Field", `Abierta sección: ${tab.label}`);
                }}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold font-mono uppercase transition-all ${
                  active
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/[0.02]"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-500 font-mono py-1">
          Visualizando como: <span className="text-emerald-400 font-bold uppercase">{userRole}</span>
        </div>
      </div>

      {/* 3. Render Sub-Tabs Content */}

      {/* SUB-TAB A: PANEL OPERACIONAL (MAPA & ZONAS) */}
      {activeSubTab === "panel" && (
        <div className="space-y-6">
          {/* Admin Executive Summary Bar */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-3">Field Admin Dashboard Executive Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Cámaras Registradas</span>
                <span className="text-lg font-bold text-white font-mono">{cameras.length} Cámaras</span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">
                  {cameras.filter(c => c.status === "Operativa" || c.status === "RTSP validado").length} validadas operacionales
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Incidentes Activos</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {incidents.filter(i => i.status !== "Cerrado").length} Abiertos
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">
                  {incidents.filter(i => i.priority === "Crítico" && i.status !== "Cerrado").length} de nivel crítico
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Zonas en Alerta</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {zones.filter(z => z.status === "Alerta" || z.status === "Punto Ciego").length} Zonas
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">
                  Revisión sugerida en perímetro
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Evidencia Protegida</span>
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {selectedSite.evidenceAvailable} Paquetes
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-none">
                  Con bitácora SHA-256 local
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal mt-4 bg-slate-950 p-3 rounded border border-slate-900 font-mono">
              <strong>Estado Operacional Estimado:</strong> El sitio demo presenta {cameras.length} cámaras registradas, {cameras.filter(c => c.status === "Operativa" || c.status === "RTSP validado").length} operativas, {cameras.filter(c => c.status === "Intermitente").length} con intermitencia y {cameras.filter(c => c.status === "Vista obstruida").length} con vista obstruida. Existen {incidents.filter(i => i.status !== "Cerrado").length} incidentes abiertos relacionados con perímetro, portón y cámara sin señal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Map Zone list */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Mapa de Zonas Operacionales del Parque</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Distribución técnica de seguridad y O&M fotovoltaico.</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {zones.length} Sectores Mapeados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[480px] overflow-y-auto pr-2">
                {zones.map((zone) => {
                  return (
                    <div
                      key={zone.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3.5 transition-all ${
                        zone.status === "Alerta"
                          ? "bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/40"
                          : zone.status === "Revisión"
                          ? "bg-amber-500/[0.02] border-amber-500/20 hover:border-amber-500/40"
                          : zone.status === "Punto Ciego"
                          ? "bg-purple-500/[0.02] border-purple-500/20 hover:border-purple-500/40"
                          : "bg-slate-950 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">SECTOR</span>
                          <h4 className="text-xs font-bold text-slate-200">{zone.name}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          zone.status === "Alerta" ? "bg-rose-500/15 text-rose-400" :
                          zone.status === "Revisión" ? "bg-amber-500/15 text-amber-400" :
                          zone.status === "Punto Ciego" ? "bg-purple-500/15 text-purple-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {zone.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>Cámaras asociadas:</span>
                          <span className="font-bold text-slate-200">{zone.camerasCount} {zone.camerasCount === 1 ? "Cámara" : "Cámaras"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>Último Evento:</span>
                          <span className="text-slate-300 truncate max-w-[150px] font-mono text-[9px]">{zone.lastEvent}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="italic truncate max-w-[170px]">Acción: {zone.recommendedAction}</span>
                        {zone.evidenceAvailable && (
                          <span className="flex items-center gap-1 text-[9px] text-sky-400 font-mono">
                            <FileText className="w-3 h-3" /> Evidencia
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Camera list preview */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800/60 pb-3">
                <h3 className="text-sm font-bold text-white">Cámaras Registradas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Inventario O&M y estado de señal.</p>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {cameras.map((cam) => {
                  const isError = cam.status === "Sin señal" || cam.status === "Vista obstruida" || cam.status === "Intermitente";
                  return (
                    <div key={cam.id} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{cam.name}</span>
                          <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-1 rounded uppercase font-mono">{cam.poePort}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{cam.ip}</p>
                        <p className="text-[10px] text-slate-500 leading-normal">{cam.type}</p>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold block ${
                          cam.status === "Operativa" || cam.status === "RTSP validado" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          cam.status === "Sin señal" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {cam.status}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono">Lat: {cam.latency}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB B: DIAGNÓSTICO TÉCNICO */}
      {activeSubTab === "diagnostics" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Field Technical Diagnostics Dashboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Estado avanzado del Gateway, switches PoE perimetrales y protocolos de conexión.</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Gateway: Active Demo Mode
              </span>
            </div>

            {/* Simulated gateway metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Latencia Gateway Promedio</span>
                <span className="text-xl font-bold font-mono text-emerald-400">14.8 ms</span>
                <p className="text-[9px] text-slate-500">Bajo retardo local</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Pérdida de Paquetes</span>
                <span className="text-xl font-bold font-mono text-amber-400">0.25%</span>
                <p className="text-[9px] text-slate-500">Mínima interferencia de radioenlace</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Estado FFmpeg Lab Stream</span>
                <span className="text-xl font-bold font-mono text-emerald-400">Validado (H.264)</span>
                <p className="text-[9px] text-slate-500">FFmpeg decodificando</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Cámaras con Alertas PoE</span>
                <span className="text-xl font-bold font-mono text-rose-400">1 Alerta</span>
                <p className="text-[9px] text-slate-500">Puerto 11 de switch perimetral</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Diagnostic Matrix Table */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Matriz de Diagnósticos y Errores Técnicos</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono text-[9px]">
                      <th className="py-2.5 px-3">Cámara</th>
                      <th className="py-2.5 px-3">Estado RTSP / ONVIF</th>
                      <th className="py-2.5 px-3">Enlace PoE</th>
                      <th className="py-2.5 px-3">Diagnóstico / Recomendación Técnica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {cameras.map((c) => {
                      return (
                        <tr key={c.id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-200 block">{c.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">{c.ip}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[10px]">
                            {c.status === "Sin señal" ? (
                              <span className="text-rose-400">RTSP Fallido</span>
                            ) : c.status === "ONVIF pendiente" ? (
                              <span className="text-amber-400">ONVIF Pendiente</span>
                            ) : c.status === "Credencial pendiente" ? (
                              <span className="text-amber-400">Vault Blocked</span>
                            ) : (
                              <span className="text-emerald-400">RTSP Activo</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                            {c.poePort}
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              {c.status === "Sin señal" ? (
                                <p className="text-rose-400 font-bold">Cámara offline. Switch perimetral reporta puerto desactivado.</p>
                              ) : c.status === "Credencial pendiente" ? (
                                <p className="text-amber-400">Falta contraseña autorizada. Agregar credencial en Sentinel Access Vault.</p>
                              ) : c.status === "Vista obstruida" ? (
                                <p className="text-amber-400">Bloqueo estructural temporal por seguidor solar. Ajustar ángulo.</p>
                              ) : c.status === "ONVIF pendiente" ? (
                                <p className="text-slate-400">ONVIF pendiente. Módulo de telemetría de PTZ requiere habilitar puerto 80.</p>
                              ) : (
                                <p className="text-slate-400">Flujo estable. Enlace perimetral con latencia nominal.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side: Technical Recommendations Summary */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Recomendaciones y Alarmas Críticas</h3>
              
              <div className="space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase font-mono">CAM-BLINDSPOT-11 Desconectada</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Se detecta pérdida física del enlace IP en la subestación. Revise la alimentación del inyector PoE y la integridad del cable de cobre perimetral.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase font-mono">Sombra tracker en CAM-TRACKER-10</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    La cámara perimetral norte queda obstruida recurrentemente cuando los trackers fotovoltaicos rotan a más de +40 grados. Se recomienda reubicar el domo a una altura superior de 4 metros.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Server className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase font-mono">Modo de Demostración Local</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Todos los enlaces RTSP y ONVIF de este módulo están emulados de forma controlada localmente en base a las limitaciones de red simulada de plantas solares remotas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB C: WORKFLOW DE INCIDENTES */}
      {activeSubTab === "incidents" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Field Incident Workflow Manager</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control, escalamiento y resolución de incidencias O&M en parques fotovoltaicos.</p>
            </div>
            
            <button
              onClick={() => setIsAddingIncident(!isAddingIncident)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 font-mono uppercase"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {isAddingIncident ? "Cerrar Formulario" : "Registrar Anomalía"}
            </button>
          </div>

          {/* Form to add incident if toggled */}
          {isAddingIncident && (
            <form onSubmit={handleCreateIncident} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Tipo de Incidente</label>
                <select
                  value={newIncidentType}
                  onChange={(e) => setNewIncidentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Intrusión perimetral">Intrusión perimetral</option>
                  <option value="Portón abierto">Portón abierto</option>
                  <option value="Cámara sin señal">Cámara sin señal</option>
                  <option value="Vista obstruida">Vista obstruida</option>
                  <option value="Movimiento fuera de horario">Movimiento fuera de horario</option>
                  <option value="Persona en zona inversores">Persona en zona inversores</option>
                  <option value="Vehículo no identificado">Vehículo no identificado</option>
                  <option value="Bodega / patio de materiales">Bodega / patio de materiales</option>
                  <option value="Línea MT / servidumbre">Línea MT / servidumbre</option>
                  <option value="Vegetación invadiendo visual">Vegetación invadiendo visual</option>
                  <option value="Animal dentro del parque">Animal dentro del parque</option>
                  <option value="Posible robo de cable/string">Posible robo de cable/string</option>
                  <option value="Enlace de comunicaciones inestable">Enlace de comunicaciones inestable</option>
                  <option value="Otro">Otro Incidente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Zona Afectada</label>
                <select
                  value={newIncidentZone}
                  onChange={(e) => setNewIncidentZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Cámara de Origen</label>
                <select
                  value={newIncidentCam}
                  onChange={(e) => setNewIncidentCam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Prioridad</label>
                <select
                  value={newIncidentPriority}
                  onChange={(e) => setNewIncidentPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Informativo">Informativo</option>
                  <option value="Revisión">Revisión</option>
                  <option value="Alto">Alto</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Observaciones Detalladas</label>
                <input
                  type="text"
                  value={newIncidentObs}
                  onChange={(e) => setNewIncidentObs(e.target.value)}
                  placeholder="Detalle anomalía en terreno (por ejemplo, 'Vehículo sospechoso detenido en la servidumbre exterior')..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2 rounded-lg text-xs font-bold transition-all uppercase font-mono"
                >
                  Registrar Incidente
                </button>
              </div>
            </form>
          )}

          {/* Incident List */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Bitácora de Incidentes Abiertos y en Curso</h3>
            
            <div className="space-y-3">
              {incidents.map((inc) => {
                return (
                  <div key={inc.id} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          inc.priority === "Crítico" ? "bg-rose-500/15 text-rose-400" :
                          inc.priority === "Alto" ? "bg-amber-500/15 text-amber-400" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {inc.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{inc.timestamp}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                          ID: {inc.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">
                        {inc.type} <span className="text-slate-500 font-normal">en</span> {inc.zone}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{inc.observations}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                        <div>Cámara: <span className="text-slate-300">{inc.camera}</span></div>
                        <div>Rol Responsable: <span className="text-slate-300">{inc.responsibleRole}</span></div>
                        {inc.evidenceId && (
                          <div className="text-sky-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Evidencia {inc.evidenceId} asociada
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 block font-mono">CERRAR / MODIFICAR ESTADO</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["Abierto", "En revisión", "Escalado a supervisor", "Requiere técnico", "Cerrado", "Falso positivo"].map((st) => {
                          const active = inc.status === st;
                          return (
                            <button
                              key={st}
                              onClick={() => updateIncidentStatus(inc.id, st as any)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                                active
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent"
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB D: CONTEXT AI SOLAR */}
      {activeSubTab === "context" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Context AI Solar O&M Intelligence Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El motor contextual de ORBI Sentinel IA filtra falsas alertas por vegetación, viento y movimiento predecible de los seguidores fotovoltaicos (trackers), concentrando la atención únicamente en anomalías operacionales de alto valor de seguridad.
            </p>
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10px] text-slate-400 leading-normal font-mono">
              <strong>Nota de Responsabilidad:</strong> Módulo en modo simulación de reglas de terreno para la demostración del piloto. No constituye IA productiva activa certificada de forma remota 24/7 sin hardware Gateway local físico.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">Eventos Filtrados como Normal / Informativo</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Sucesos ordinarios de la planta descartados automáticamente para evitar la saturación mental del operador.
              </p>

              <div className="space-y-3">
                {CONTEXT_RULES.filter(r => r.classification === "Normal" || r.classification === "Informativo").map((rule) => {
                  return (
                    <div key={rule.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-xs font-bold text-slate-200">{rule.eventType}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{rule.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono italic">Regla: {rule.logicDescription}</p>
                      </div>
                      <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 shrink-0 h-fit uppercase font-mono">
                        {rule.classification}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold">Alertas que Requieren Revisión o Escalado</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Anomalías perimetrales o de red identificadas localmente por el Gateway que disparan notificaciones prioritarias.
              </p>

              <div className="space-y-3">
                {CONTEXT_RULES.filter(r => r.classification !== "Normal" && r.classification !== "Informativo").map((rule) => {
                  const isCrit = rule.classification === "Crítico";
                  return (
                    <div key={rule.id} className={`p-3.5 rounded-xl border flex justify-between gap-4 ${
                      isCrit ? "bg-rose-500/[0.01] border-rose-500/20" : "bg-amber-500/[0.01] border-amber-500/20"
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isCrit ? "bg-rose-500 animate-pulse" : "bg-amber-500"}`}></span>
                          <span className="text-xs font-bold text-slate-200">{rule.eventType}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{rule.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono italic">Regla: {rule.logicDescription}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded shrink-0 h-fit uppercase font-mono ${
                        isCrit ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {rule.classification}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB E: O&M EVIDENCE REPORT */}
      {activeSubTab === "report" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Field O&M Evidence Report Builder</h3>
                <p className="text-xs text-slate-400 mt-0.5">Generación rápida de minutas y estados de video técnicos para comités y gerencias de O&M.</p>
              </div>

              <button
                onClick={copyToClipboard}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 font-mono uppercase shrink-0"
              >
                {copiedReport ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedReport ? "¡Copiado!" : "Copiar Reporte Markdown"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">No expone datos sensibles</span>
                <p className="text-xs text-slate-300">Todas las IPs reales, contraseñas de red y tokens de conexión quedan debidamente anonimizados.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Trazabilidad Local Estricta</span>
                <p className="text-xs text-slate-300">Cada evento e incidente de la bitácora contiene referencias horarias exactas de la simulación.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Demo no productiva</span>
                <p className="text-xs text-slate-300">Señaliza formalmente que este reporte es para validación preliminar de un piloto.</p>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Vista Previa del Reporte de Evidencia O&M</h3>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Formato Plano / Markdown</span>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-all">
              {generateOMReportText()}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB F: CHECKLIST & COMPARATIVA */}
      {activeSubTab === "checklist" && (
        <div className="space-y-6">
          {/* Narrative card comparative */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">ORBI Sentinel IA — Matriz Comparativa de Líneas de Producto</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Entienda cómo se diferencia el enfoque técnico, operacional y de privacidad en cada una de nuestras tres líneas comerciales principales:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Sun className="w-4 h-4" />
                  <span className="text-xs uppercase font-mono tracking-wider">Field Operations Center</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Orientado a parques solares, subestaciones y grandes áreas industriales. Enfoque en latencia de radioenlaces perimetrales, obstrucción física por trackers fotovoltaicos e integración de telemetría CCTV local.
                </p>
                <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-mono">
                  <li>PMGD y parques industriales</li>
                  <li>Dahua PoE & IP RTSP Industrial</li>
                  <li>Evidencia de fallos O&M local</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs uppercase font-mono tracking-wider">Community Pilot Center</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Orientado a condominios residenciales, copropietarios y administración urbana. Enfoque en la privacidad total de residentes (balcones, ventanas) y la reducción drástica de la carga cognitiva de conserjería.
                </p>
                <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-mono">
                  <li>Copie de minutas de comité</li>
                  <li>Privacy Shield por software</li>
                  <li>Fácil uso táctil para guardias</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-sky-500/20 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Tv className="w-4 h-4" />
                  <span className="text-xs uppercase font-mono tracking-wider">Consumer Bridge Lab</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Orientado a cámaras domésticas WiFi, pequeñas oficinas y entornos de prueba. Integración parcial de dispositivos WiFi del cliente (como Eufy C220/E220) para monitoreo secundario de baja criticidad.
                </p>
                <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-mono">
                  <li>Eufy Indoor WiFi (C220/E220)</li>
                  <li>Integración transitoria NAS</li>
                  <li>No recomendado para perímetro</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Pilot Readiness Checklist */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">Field Readiness Pilot Checklist</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Puntos críticos que se deben auditar antes de lanzar el piloto físico en planta solar.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Haz clic para cambiar estado</span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {checklist.map((item) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklistStatus(item.id)}
                      className="w-full text-left bg-slate-950 p-3 rounded-xl border border-slate-900 hover:border-slate-800 flex justify-between items-start gap-3 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{item.category}</span>
                          <span className="text-xs font-bold text-slate-200">{item.task}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 uppercase tracking-wider ${
                        item.status === "Listo" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        item.status === "Pendiente" ? "bg-slate-900 text-slate-500 border border-slate-800" :
                        item.status === "Requiere revisión" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commercial Guardrails Warnings */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">Field Demo Commercial Guardrails</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directrices éticas y políticas de seguridad para presentar el sistema ORBI Sentinel IA Field ante clientes sin incurrir en falsas expectativas comerciales:
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block">❌ QUÉ NO SE DEBE PROMETER:</span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-normal">
                    <li><strong className="text-slate-300">Detección perfecta de intrusos:</strong> La IA comete fallos si el enlace IP es inestable o la iluminación nocturna es deficiente.</li>
                    <li><strong className="text-slate-300">Prevención absoluta de robos:</strong> El sistema advierte el peligro, pero la reacción física final depende de los guardias o de las fuerzas de seguridad locales.</li>
                    <li><strong className="text-slate-300">Producción remota 24/7 sin hardware:</strong> Se requiere imperativamente instalar el Gateway físico en la red local para operar.</li>
                    <li><strong className="text-slate-300">Sustitución de guardias físicos u O&M:</strong> ORBI es una herramienta de asistencia visual y automatización de bitácoras, no un reemplazo laboral.</li>
                    <li><strong className="text-slate-300">Integración SCADA de planta real:</strong> Solo mostramos un canal visual secundario no invasivo, sin acceso a control de potencia ni comandos de reconexión eléctrica.</li>
                    <li><strong className="text-slate-300">Validez judicial de evidencia:</strong> Los clips generados por este piloto actúan como reporte técnico de operaciones, no constituyen cadena de custodia peritada judicialmente.</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">🟢 LO QUE SÍ AFIRMAMOS CON SEGURIDAD:</span>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-normal">
                    <li><strong className="text-slate-300">Centralización visual de cámaras:</strong> Unifica flujos RTSP/ONVIF multimarca en una misma consola local en sala de control.</li>
                    <li><strong className="text-slate-300">Gestión estructurada de incidentes:</strong> Permite registrar fallas de CCTV y alarmas perimetrales con clasificación y prioridades de O&M.</li>
                    <li><strong className="text-slate-300">Filtro contextual de alarmas:</strong> Minimiza alertas por rotación de seguidores o maleza mediante reglas locales simples.</li>
                    <li><strong className="text-slate-300">Piloto acotado de validación técnica:</strong> Posibilidad de probar el Gateway con 1 a 3 cámaras públicas perimetrales autorizadas de forma segura.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB G: FIELD SOLAR O&M QA LOCK */}
      {activeSubTab === "qalock" && (
        <div className="space-y-6">
          {/* Header of QA Lock */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Field Solar O&M QA Lock Center</h3>
                <p className="text-xs text-slate-400 mt-0.5">Auditoría final de aceptación visual, funcional, narrativa y operacional del Módulo Field.</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                DEMO STATUS: LOCKED & SECURE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Este panel consolida la validación de conformidad ética y técnica exigida por los guardrails comerciales de ORBI. Confirma que la demostración a stakeholders industriales y clientes de O&M se ejecute de manera responsable, utilizando estrictamente datos simulados y advirtiendo las limitaciones del sistema frente a eventos de terreno.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Checklist Matrix */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 pb-2">Matriz de Conformidad Técnica & Ética</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">1. Estado Visual Conforme</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Interfaz unificada bajo estética premium oscura, glassmorphic y optimizada para visualización rápida en terreno por operadores.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 2 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">2. Separación de Roles</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Filtro estricto: Conserje ve alertas simples (EasyView) libre de tecnicismos; Admin ve métricas O&M; Técnico ve latencias y puertos PoE.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 3 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">3. Datos 100% Ficticios</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Plantas solares Sur, Centro y Cordillera. Sin nombres de clientes, planos, IPs públicas, RTSP reales, coordenadas ni secretos de red expuestos.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 4 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">4. Incident Workflow QA</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bitácora con 5 estados operativos. Eliminadas afirmaciones absolutas (e.g. "Robo confirmado" es ahora "Posible evento de robo a revisar").
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 5 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">5. Reporte de Evidencia de Lab</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Markdown exportable con control SHA-256 local, declarando formalmente ser evidencia de laboratorio no judicial para validar el piloto técnico.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 6 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">6. Diagnósticos con Etiquetas de Lab</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Detección simulada de pérdidas de paquetes, puertos PoE, bloqueos estructurales por seguidores solares y estados ONVIF/RTSP.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 7 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">7. Lenguaje de IA Responsable</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Context AI clasifica sucesos normales (trackers, viento) vs sospechosos preliminares, siempre exigiendo la obligatoria validación humana final.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>

                {/* 8 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-200">8. Guardrails de Demostración</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Rechazo de afirmaciones de infalibilidad, producción 24/7 sin hardware local, reemplazo de guardias o compatibilidad universal sin red.
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    🟢 AUDITADO / CONFORME
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 flex items-center gap-4 mt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">ESTADO DE EVALUACIÓN LOCAL</span>
                  <span className="text-sm font-bold text-emerald-400 uppercase">🔒 Ready for Field Demo (Aprobado)</span>
                  <p className="text-xs text-slate-400 mt-0.5">El Módulo Field cumple al 100% con los criterios de seguridad industrial y comercial para presentaciones.</p>
                </div>
              </div>
            </div>

            {/* Right: Field Demo Brief */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Field Demo Brief Copiable</h3>
                <button
                  onClick={copyBriefToClipboard}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1.5 uppercase"
                >
                  {copiedBrief ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBrief ? "¡Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 space-y-3 max-h-[460px] overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                {generateDemoBriefText()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
