import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Video,
  Eye,
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
  UserCheck,
  Wrench,
  BookOpen,
  Scale,
  LogOut,
  Sliders,
  HelpCircle
} from "lucide-react";
import { Incident, IncidentType, IncidentStatus } from "../types";

interface CommunityPilotDemoProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
}

interface DemoCamera {
  id: string;
  name: string;
  zone: string;
  type: "Profesional IP PoE" | "Consumer WiFi" | "App propietaria" | "RTSP/NAS pendiente";
  status: "Online" | "Offline" | "Intermitente" | "Protegida" | "Privada Bloqueada";
  privacyZone: "public" | "common" | "private" | "lab";
  lastImage: string;
  alert?: string;
  ipMock?: string;
}

export default function CommunityPilotDemo({ userRole: globalRole, onAddAuditLog }: CommunityPilotDemoProps) {
  // Simulator role state
  const [activeRole, setActiveRole] = useState<"conserje" | "admin" | "tecnico">(globalRole);

  // Sync with globalRole if it changes externally
  React.useEffect(() => {
    setActiveRole(globalRole);
  }, [globalRole]);

  // States
  const [privacyShieldActive, setPrivacyShieldActive] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [selectedIncidentForExport, setSelectedIncidentForExport] = useState<string | null>(null);
  const [exportJustification, setExportJustification] = useState<string>("");
  
  // QA Panel State
  const [showQAPanel, setShowQAPanel] = useState<boolean>(true);
  
  // QA Lock Tracks
  const [qaVisualReady, setQaVisualReady] = useState<"ready" | "review" | "blocked">("ready");
  const [qaRolesReady, setQaRolesReady] = useState<"ready" | "review" | "blocked">("ready");
  const [qaPrivacyReady, setQaPrivacyReady] = useState<"ready" | "review" | "blocked">("ready");
  const [qaIncidentReady, setQaIncidentReady] = useState<"ready" | "review" | "blocked">("ready");
  const [qaReportsReady, setQaReportsReady] = useState<"ready" | "review" | "blocked">("ready");
  const [qaCommercialReady, setQaCommercialReady] = useState<"ready" | "review" | "blocked">("ready");

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Demo residential cameras (Condominio Nueva Alameda)
  const [demoCameras, setDemoCameras] = useState<DemoCamera[]>([
    {
      id: "CAM-PORTON-01",
      name: "CAM-PORTON-01",
      zone: "Portón principal",
      type: "Profesional IP PoE",
      status: "Online",
      privacyZone: "public",
      ipMock: "192.168.10.101",
      lastImage: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-PEATONAL-02",
      name: "CAM-PEATONAL-02",
      zone: "Acceso peatonal",
      type: "Profesional IP PoE",
      status: "Online",
      privacyZone: "public",
      ipMock: "192.168.10.102",
      lastImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-CONSERJERIA-03",
      name: "CAM-CONSERJERIA-03",
      zone: "Conserjería",
      type: "Consumer WiFi",
      status: "Online",
      privacyZone: "common",
      ipMock: "192.168.10.121",
      lastImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-HALL-A-04",
      name: "CAM-HALL-A-04",
      zone: "Hall Torre A",
      type: "Consumer WiFi",
      status: "Protegida",
      privacyZone: "private",
      ipMock: "192.168.10.122",
      lastImage: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-HALL-B-05",
      name: "CAM-HALL-B-05",
      zone: "Hall Torre B",
      type: "Consumer WiFi",
      status: "Online",
      privacyZone: "private",
      ipMock: "192.168.10.123",
      lastImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-EST-01",
      name: "CAM-EST-01",
      zone: "Estacionamiento -1",
      type: "Profesional IP PoE",
      status: "Online",
      privacyZone: "common",
      ipMock: "192.168.10.103",
      lastImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-EST-VISITAS-02",
      name: "CAM-EST-VISITAS-02",
      zone: "Estacionamiento visitas",
      type: "App propietaria",
      status: "Online",
      privacyZone: "common",
      ipMock: "192.168.10.130",
      lastImage: "https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-QUINCHO-01",
      name: "CAM-QUINCHO-01",
      zone: "Quincho",
      type: "App propietaria",
      status: "Protegida",
      privacyZone: "private",
      ipMock: "192.168.10.131",
      lastImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-PISCINA-01",
      name: "CAM-PISCINA-01",
      zone: "Piscina",
      type: "RTSP/NAS pendiente",
      status: "Online",
      privacyZone: "common",
      ipMock: "192.168.10.140",
      lastImage: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-BODEGA-01",
      name: "CAM-BODEGA-01",
      zone: "Bodega común",
      type: "Profesional IP PoE",
      status: "Intermitente",
      privacyZone: "common",
      alert: "Falla de conectividad intermitente",
      ipMock: "192.168.10.104",
      lastImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-SALA-ELECTRICA-01",
      name: "CAM-SALA-ELECTRICA-01",
      zone: "Sala eléctrica",
      type: "Profesional IP PoE",
      status: "Online",
      privacyZone: "common",
      ipMock: "192.168.10.105",
      lastImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "CAM-PERIMETRO-01",
      name: "CAM-PERIMETRO-01",
      zone: "Perímetro exterior",
      type: "Profesional IP PoE",
      status: "Online",
      privacyZone: "public",
      ipMock: "192.168.10.106",
      lastImage: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  // Active Live Wall filter
  const [activeWallFilter, setActiveWallFilter] = useState<"all" | "accesos" | "comunes" | "alertas" | "privacidad">("all");

  // Dynamic incident log for Condominio Nueva Alameda
  const [communityIncidents, setCommunityIncidents] = useState<Incident[]>([
    {
      id: "INC-CO-101",
      timestamp: "2026-07-18 03:14:22",
      cameraName: "CAM-PORTON-01",
      zoneName: "Portón principal",
      type: "Vehículo detenido",
      status: "Abierto",
      observations: "Vehículo sospechoso sin placa patente delantera estacionado bloqueando la salida de emergencia de conserjería."
    },
    {
      id: "INC-CO-102",
      timestamp: "2026-07-17 22:45:10",
      cameraName: "CAM-QUINCHO-01",
      zoneName: "Quincho",
      type: "Movimiento fuera de horario",
      status: "En revisión",
      observations: "Luces encendidas y música alta detectada en sector quinchos después del horario de cierre reglamentario (22:00 hrs)."
    },
    {
      id: "INC-CO-103",
      timestamp: "2026-07-17 14:20:05",
      cameraName: "CAM-BODEGA-01",
      zoneName: "Bodega común",
      type: "Cámara sin señal",
      status: "Cerrado",
      observations: "Flicker y pérdida temporal de video. Conector RJ-45 suelto en switch secundario de laboratorio. Reajustado por técnico."
    }
  ]);

  // Manual incident form state
  const [newIncidentCam, setNewIncidentCam] = useState<string>("CAM-PORTON-01");
  const [newIncidentType, setNewIncidentType] = useState<IncidentType>("Vehículo detenido");
  const [newIncidentObs, setNewIncidentObs] = useState<string>("");

  // Checklist Interactive State
  const [checklistItems, setChecklistItems] = useState([
    { text: "Autorización de administración/comité aprobada", status: "Listo" },
    { text: "Inventario de cámaras existentes realizado", status: "Listo" },
    { text: "Marcas/modelos de cámaras identificados (Mixtas Dahua + Eufy)", status: "Listo" },
    { text: "Topología de red y NVR existente relevada", status: "Requiere revisión" },
    { text: "Accesos de red local autorizados (IPs fijas/claves)", status: "Listo" },
    { text: "Zonas de monitoreo común claramente definidas", status: "Listo" },
    { text: "Zonas privadas excluidas explícitamente (Balcones, terrazas)", status: "Listo" },
    { text: "Política de retención definida (máximo 7 días para pilotos)", status: "Listo" },
    { text: "Atribuciones de roles en conserjería configuradas", status: "Listo" },
    { text: "Conserjes capacitados en interfaz táctil de un solo botón", status: "Pendiente" },
    { text: "Reglas de exportación limitadas por privacidad residencial", status: "Listo" },
    { text: "Prueba inicial con 1 a 3 cámaras autorizadas", status: "Pendiente" },
    { text: "Revisión legal/administrativa del reglamento de copropiedad", status: "No aplica" }
  ]);

  const cycleChecklistStatus = (index: number) => {
    const updated = [...checklistItems];
    const current = updated[index].status;
    let next: string = "Pendiente";
    if (current === "Pendiente") next = "Listo";
    else if (current === "Listo") next = "Requiere revisión";
    else if (current === "Requiere revisión") next = "No aplica";
    else next = "Pendiente";

    updated[index].status = next;
    setChecklistItems(updated);
    triggerToast(`✓ Checklist actualizado: "${updated[index].text}" cambiado a ${next}`);
  };

  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCamObj = demoCameras.find(c => c.name === newIncidentCam);
    const newInc: Incident = {
      id: `INC-CO-${100 + communityIncidents.length + 1}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      cameraName: newIncidentCam,
      zoneName: selectedCamObj?.zone || "Zona Desconocida",
      type: newIncidentType,
      status: "Abierto",
      observations: newIncidentObs || "Incidente registrado."
    };

    setCommunityIncidents([newInc, ...communityIncidents]);
    setShowIncidentModal(false);
    setNewIncidentObs("");

    if (onAddAuditLog) {
      onAddAuditLog(
        "Reporte de Incidente Residencial",
        `Marcado incidente de tipo ${newIncidentType} en ${newIncidentCam} (${selectedCamObj?.zone})`
      );
    }

    triggerToast(`✓ Incidente registrado con éxito: ${newInc.id}. Administración podrá revisar.`);
  };

  const handleQuickIncident = (camId: string) => {
    const cam = demoCameras.find(c => c.id === camId);
    if (!cam) return;
    setNewIncidentCam(cam.name);
    setNewIncidentType("Persona sospechosa");
    setShowIncidentModal(true);
  };

  const handleTogglePrivacyZoneGlobal = () => {
    if (activeRole === "conserje") {
      triggerToast("⚠ Atribución denegada: Los filtros de privacidad residencial solo pueden ser alterados por el Administrador autorizado.");
      return;
    }

    const nextState = !privacyShieldActive;
    setPrivacyShieldActive(nextState);

    // Toggle camera states based on privacy settings
    setDemoCameras(prev =>
      prev.map(c => {
        if (c.privacyZone === "private") {
          return {
            ...c,
            status: nextState ? "Protegida" : "Online"
          };
        }
        return c;
      })
    );

    if (onAddAuditLog) {
      onAddAuditLog(
        "Configuración de Privacidad",
        `Filtro de privacidad residencial ${nextState ? "Habilitado" : "Deshabilitado"} globalmente por administrador`
      );
    }

    triggerToast(`Filtros de Privacidad Residencial ${nextState ? "Habilitados" : "Deshabilitados"}`);
  };

  const handleNotifyAdmin = () => {
    if (onAddAuditLog) {
      onAddAuditLog(
        "Notificación de Conserjería",
        "Guardia de turno envió aviso prioritario de actividad sospechosa a la administración"
      );
    }
    triggerToast("⚡ Notificación prioritaria enviada a la Administración del Condominio.");
  };

  const handleRequestExport = (incidentId: string) => {
    setSelectedIncidentForExport(incidentId);
    setExportJustification("");
    setShowExportModal(true);
  };

  const handleConfirmExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportJustification.trim()) {
      triggerToast("❌ Debe indicar una justificación administrativa para autorizar la exportación.");
      return;
    }

    if (onAddAuditLog) {
      onAddAuditLog(
        "Exportación de Evidencia Autorizada",
        `Administrador autorizó descarga de clip para ${selectedIncidentForExport}. Justificación: ${exportJustification}`
      );
    }

    setShowExportModal(false);
    triggerToast(`✓ Exportación del clip para ${selectedIncidentForExport} autorizada. Trazabilidad guardada en log.`);
  };

  // Compute aggregate QA Lock Status
  const getOverallQAStatus = () => {
    const tracks = [qaVisualReady, qaRolesReady, qaPrivacyReady, qaIncidentReady, qaReportsReady, qaCommercialReady];
    if (tracks.includes("blocked")) return { label: "Blocked", color: "bg-red-500 text-white border-red-400", icon: ShieldAlert };
    if (tracks.includes("review")) return { label: "Needs Review", color: "bg-amber-500 text-slate-950 border-amber-400", icon: AlertTriangle };
    return { label: "Ready for Community Demo", color: "bg-emerald-500 text-slate-950 border-emerald-400", icon: ShieldCheck };
  };

  const overallQA = getOverallQAStatus();

  // Filter cameras on Live Wall based on active filter tab
  const filteredLiveWallCams = demoCameras.filter(c => {
    if (activeWallFilter === "all") return true;
    if (activeWallFilter === "accesos") return ["CAM-PORTON-01", "CAM-PEATONAL-02", "CAM-PERIMETRO-01"].includes(c.id);
    if (activeWallFilter === "comunes") return ["CAM-CONSERJERIA-03", "CAM-EST-01", "CAM-EST-VISITAS-02", "CAM-PISCINA-01", "CAM-SALA-ELECTRICA-01"].includes(c.id);
    if (activeWallFilter === "alertas") return c.status === "Intermitente" || c.alert;
    if (activeWallFilter === "privacidad") return c.privacyZone === "private" || c.status === "Protegida";
    return true;
  });

  return (
    <div id="community-pilot-demo-root" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-slate-800">
      
      {/* Toast Notification */}
      {showNotification && (
        <div id="demo-toast-popup" className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-500 text-slate-950 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="text-xs font-mono font-bold">{showNotification}</span>
        </div>
      )}

      {/* Header Panel */}
      <div id="demo-header-container" className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Building className="text-emerald-400 w-5 h-5" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Fase de Demostración y Validación Responsable
            </span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-white mt-1">
            ORBI Sentinel IA Community <span className="text-amber-400 text-sm font-mono font-bold ml-2">v0.2.2-sentinel-community-demo-lock</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma centralizada para condominios residenciales, optimizada con protección estricta de privacidad familiar y facilidad de uso táctil.
          </p>
        </div>

        {/* Buttons: Demo Script & QA Lock toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-qa-panel-toggle"
            onClick={() => setShowQAPanel(!showQAPanel)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
              showQAPanel 
                ? "bg-slate-800 border-slate-700 text-white" 
                : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4" />
            {showQAPanel ? "Ocultar QA Lock" : "Ver QA Lock"}
          </button>

          {/* Demo Role Switcher inside the screen */}
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 shrink-0 space-y-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block text-center">
              Simulador de Vista por Rol
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                id="role-switch-conserje"
                onClick={() => {
                  setActiveRole("conserje");
                  triggerToast("✓ Simulación: Rol Conserje (Simplificado, sin datos técnicos)");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeRole === "conserje"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Conserje
              </button>
              <button
                id="role-switch-admin"
                onClick={() => {
                  setActiveRole("admin");
                  triggerToast("✓ Simulación: Rol Administrador (Dashboard de Valor y Reportes)");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeRole === "admin"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Admin
              </button>
              <button
                id="role-switch-tecnico"
                onClick={() => {
                  setActiveRole("tecnico");
                  triggerToast("✓ Simulación: Rol Técnico (Compatibilidad y Gateway)");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeRole === "tecnico"
                    ? "bg-blue-500 text-slate-950"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Técnico
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. COMMUNITY PILOT QA LOCK PANEL (NEW) */}
      {showQAPanel && (
        <div id="community-pilot-qa-lock-card" className="bg-slate-900/30 border border-amber-500/30 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-white flex items-center gap-2">
                  Community Pilot QA Lock
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Audit Shield</span>
                </h3>
                <p className="text-xs text-slate-400">Validación de estabilidad, seguridad y mitigación de falsas promesas en entorno residencial.</p>
              </div>
            </div>

            {/* Overall QA State Banner */}
            <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 transition-all ${overallQA.color}`}>
              {React.createElement(overallQA.icon, { className: "w-4 h-4 animate-pulse" })}
              <span>ESTADO GLOBAL: {overallQA.label.toUpperCase()}</span>
            </div>
          </div>

          {/* Core Tracks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Visual Readiness</span>
              <select
                id="select-qa-visual"
                value={qaVisualReady}
                onChange={(e) => setQaVisualReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Carga de tarjetas sin parpadeos, adaptabilidad móvil.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">2. Roles Readiness</span>
              <select
                id="select-qa-roles"
                value={qaRolesReady}
                onChange={(e) => setQaRolesReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Conserje restringido sin IPs ni hashes.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">3. Privacidad</span>
              <select
                id="select-qa-privacy"
                value={qaPrivacyReady}
                onChange={(e) => setQaPrivacyReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Zonas sensibles bloqueadas y leyendas de menores activas.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">4. Incidentes</span>
              <select
                id="select-qa-incident"
                value={qaIncidentReady}
                onChange={(e) => setQaIncidentReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Registro local e interactivo con logs de auditoría.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">5. Reportes QA</span>
              <select
                id="select-qa-reports"
                value={qaReportsReady}
                onChange={(e) => setQaReportsReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Exclusión total de contraseñas, tokens y datos reales.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">6. Narrativa</span>
              <select
                id="select-qa-narrative"
                value={qaCommercialReady}
                onChange={(e) => setQaCommercialReady(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded p-1 font-mono text-slate-300"
              >
                <option value="ready">🟢 Ready</option>
                <option value="review">🟡 Needs Review</option>
                <option value="blocked">🔴 Blocked</option>
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">Mitigación estricta de promesas exageradas de NVR.</p>
            </div>
          </div>

          {/* Current Limitations & Non-commercial Declarations */}
          <div className="p-4.5 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
              ⚠️ Declaración Estricta de Limitaciones de la Versión Demo
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-300 leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-white">• No activa producción 24/7</p>
                <p className="text-slate-400">La aplicación es un prototipo local y de laboratorio para demostración comercial controlada.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">• Sin datos residenciales reales</p>
                <p className="text-slate-400">Toda la información y cámaras corresponden al entorno ficticio de laboratorio "Condominio Nueva Alameda".</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">• Privacidad de imágenes de menores</p>
                <p className="text-slate-400">Se prohíbe el uso de imágenes familiares, menores o zonas íntimas. Se utilizan renders espaciales abstractos.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">• Compatibilidad condicionada</p>
                <p className="text-slate-400">No se promete compatibilidad universal. Depende de especificaciones técnicas ONVIF/RTSP aprobadas.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">• No reemplaza NVR al 100%</p>
                <p className="text-slate-400">Se presenta como micro-servidor de paso local redundante. No sustituye equipamientos de seguridad total.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white">• Cifras no garantizadas</p>
                <p className="text-slate-400">Los datos de valor operativo se exponen como simulaciones lógicas y conceptuales, no auditorías certificadas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Main sections based on active simulated Role */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* VIEW 1: CONSERJE (Community EasyView) */}
        {activeRole === "conserje" && (
          <div id="conserje-easyview-container" className="xl:col-span-8 space-y-6">
            <div className="bg-slate-900/20 border border-amber-500/20 rounded-2xl p-6 space-y-6">
              
              {/* EasyView Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-white">Consola de Vigilancia Simplificada (EasyView)</h3>
                    <p className="text-xs text-slate-400">Operación básica adaptada para el personal de turno. Lenguaje libre de jerga técnica.</p>
                  </div>
                </div>

                {/* Status indicator - strictly no IPs or ports */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold font-mono">SISTEMA EN LÍNEA</span>
                </div>
              </div>

              {/* Warning on top of Conserje Panel */}
              <div className="p-3 bg-purple-950/15 border border-purple-500/20 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>ORBI Sentinel IA Community:</strong> Zonas privadas enmascaradas por políticas estrictas de resguardo familiar.</span>
              </div>

              {/* Six Large Indicator Statuses */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Estado General</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Funcionando normal</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Alertas</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Cámara sin señal (Bodega)</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Inteligencia</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Movimiento inusual detectado</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Cierres de Portón</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Cerrado correctamente</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Historial de Turno</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Incidente registrado</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <Building className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Privacidad</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">Zona protegida por privacidad</p>
                  </div>
                </div>
              </div>

              {/* Big Buttons for Easy Operation */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                  Acciones Rápidas de Conserjería
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    id="btn-conserje-ver-cams"
                    onClick={() => {
                      setActiveWallFilter("all");
                      triggerToast("Filtrando mural para ver todas las áreas autorizadas");
                    }}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left transition-all group hover:bg-slate-850"
                  >
                    <div className="flex justify-between items-center">
                      <Video className="w-5 h-5 text-emerald-400" />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 mt-3">Ver cámaras autorizadas</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Acceso instantáneo a transmisiones de seguridad comunes</p>
                  </button>

                  <button
                    id="btn-conserje-incident"
                    onClick={() => {
                      setNewIncidentCam("CAM-PORTON-01");
                      setShowIncidentModal(true);
                    }}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl text-left transition-all group hover:bg-slate-850"
                  >
                    <div className="flex justify-between items-center">
                      <PlusCircle className="w-5 h-5 text-amber-400" />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 mt-3">Marcar incidente</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Registra anomalías en la bitácora de la administración</p>
                  </button>

                  <button
                    id="btn-conserje-alertas"
                    onClick={() => {
                      setActiveWallFilter("alertas");
                      triggerToast("Visualizando cámaras en estado intermitente");
                    }}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-xl text-left transition-all group hover:bg-slate-850"
                  >
                    <div className="flex justify-between items-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 mt-3">Ver últimos eventos</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Filtro de anomalías inusuales en áreas comunes</p>
                  </button>

                  <button
                    id="btn-conserje-notify"
                    onClick={handleNotifyAdmin}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-red-500/30 rounded-xl text-left transition-all group hover:bg-slate-850"
                  >
                    <div className="flex justify-between items-center">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 mt-3">Notificar administración</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Envía un aviso de apoyo de un solo toque</p>
                  </button>

                  {/* READ ONLY PRIVACY INDICATOR FOR CONSERJE */}
                  <div className="p-4 bg-slate-950/80 border border-purple-500/25 rounded-xl text-left transition-all select-none relative">
                    <div className="flex justify-between items-center">
                      <Lock className="w-5 h-5 text-purple-400 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Protegido</span>
                    </div>
                    <p className="text-xs font-bold text-purple-200 mt-3">Máscaras de Privacidad</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Filtros activos. Modificación restringida al Administrador.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: ADMINISTRADOR / COMITÉ (Community Value Dashboard) */}
        {activeRole === "admin" && (
          <div id="admin-valuedashboard-container" className="xl:col-span-8 space-y-6">
            <div className="bg-slate-900/20 border border-emerald-500/20 rounded-2xl p-6 space-y-6">
              
              {/* Admin Center Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-white">Community Value Dashboard</h3>
                    <p className="text-xs text-slate-400">Panel de Valor Operacional y Resguardo Comunitario</p>
                  </div>
                </div>

                <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 text-slate-400">
                  Condominio Demo: <span className="text-white font-bold">Nueva Alameda</span>
                </div>
              </div>

              {/* Conceptual Indicator Disclaimer */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-slate-300 text-xs leading-relaxed flex gap-3">
                <Scale className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-400 font-bold block mb-1">Estimación Conceptual de Valor Operacional:</span>
                  Este panel resume el rendimiento simulado para respaldar las presentaciones ante comités y juntas de copropietarios. <strong>No constituye una auditoría financiera certificada ni promete retorno de inversión (ROI) garantizado.</strong> Las métricas simulan optimización de ancho de banda y tiempos de respuesta.
                </div>
              </div>

              {/* 11 Mandatory Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cámaras Operativas</p>
                  <p className="text-xl font-sans font-bold text-emerald-400 mt-1">10 / 12</p>
                  <p className="text-[10px] text-slate-400 mt-1">Streams estables PoE/WiFi</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cámaras Sin Señal</p>
                  <p className="text-xl font-sans font-bold text-red-400 mt-1">1 Offline</p>
                  <p className="text-[10px] text-amber-400 mt-1">1 Intermitente (Bodega)</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Incidentes Turno</p>
                  <p className="text-xl font-sans font-bold text-amber-400 mt-1">
                    {communityIncidents.filter(i => i.status === "Abierto").length} Abiertos
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1">1 Cerrado satisfactorio</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Tiempo de Respuesta</p>
                  <p className="text-xl font-sans font-bold text-sky-400 mt-1">~12 Mins</p>
                  <p className="text-[10px] text-slate-400 mt-1">Promedio de registro</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Estado Privacidad</p>
                  <p className="text-xl font-sans font-bold text-purple-400 mt-1">2 Zonas Activas</p>
                  <p className="text-[10px] text-purple-300 mt-1">Quinchos y Hall A enmascarados</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Clips / Evidencia</p>
                  <p className="text-xl font-sans font-bold text-teal-400 mt-1">2 Almacenados</p>
                  <p className="text-[10px] text-slate-400 mt-1">Integridad SHA-256 local</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Retención Configurada</p>
                  <p className="text-xl font-sans font-bold text-indigo-400 mt-1">7 Días Estrictos</p>
                  <p className="text-[10px] text-slate-500 mt-1">Auto-eliminación de seguridad</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Factibilidad Técnica</p>
                  <p className="text-xl font-sans font-bold text-emerald-400 mt-1">92% OK</p>
                  <p className="text-[10px] text-slate-400 mt-1">Carga agregada &lt; 15 Mbps</p>
                </div>
              </div>

              {/* Operating Risks, Recommendations, and Conceptual Savings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Recommendations and Risks */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    ⚠️ Riesgos Operativos y Recomendaciones Técnicas
                  </span>
                  <div className="text-xs space-y-2.5 text-slate-300">
                    <div>
                      <span className="text-red-400 font-bold mr-1">[Riesgo]</span>
                      <span><strong>Saturación de Ancho de Banda:</strong> Configurar las cámaras de consumo WiFi en resolución 4K puede degradar la conectividad del router de conserjería.</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold mr-1">[Riesgo]</span>
                      <span><strong>Pérdida de Cobertura Doméstica:</strong> Cámaras WiFi alejadas de los puntos de acceso (ej: bodegas en subterráneo -1) muestran cortes de señal intermitentes.</span>
                    </div>
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-emerald-400 font-bold mr-1">[Recomendación]</span>
                      <span>Implementar el Micro-NVR con cableado estructurado en bodega y mantener un límite estricto de 7 días de resguardo temporal de seguridad.</span>
                    </div>
                  </div>
                </div>

                {/* Conceptual Savings / Benefits Estimation */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    📊 Estimación Conceptual de Optimización
                  </span>
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-400 leading-relaxed">
                      El uso de un servidor local micro-NVR con enmascaramiento inteligente busca reducir la necesidad inmediata de costosas ampliaciones de almacenamiento y almacenamiento en la nube privada.
                    </p>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[11px]">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Eficiencia de Ancho de Banda:</span>
                        <span className="text-emerald-400 font-bold">+45% (Simulado)</span>
                      </div>
                      <div className="flex justify-between font-mono mt-1">
                        <span className="text-slate-400">Reducción de Alertas Falsas:</span>
                        <span className="text-emerald-400 font-bold">~35% (Estimación)</span>
                      </div>
                      <p className="text-[9px] text-slate-500 italic mt-2">
                        *Cifras simuladas conceptualmente con fines ilustrativos de laboratorio.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Authorized Export Section for Admin */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  📂 Gestión y Solicitud de Exportación Autorizada de Evidencia
                </span>
                <p className="text-xs text-slate-400 leading-normal">
                  Por estrictas directivas de privacidad residencial, la descarga física de clips de video de áreas de copropietarios requiere la firma digital y una justificación legal registrada.
                </p>
                <div className="space-y-2">
                  {communityIncidents.map(inc => (
                    <div key={inc.id} className="bg-slate-900 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-850 text-xs">
                      <div>
                        <span className="font-mono text-emerald-400 font-bold mr-2">{inc.id}</span>
                        <span className="text-slate-300 font-bold">{inc.type}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Cámara: {inc.cameraName} | Zona: {inc.zoneName}</p>
                      </div>
                      <button
                        id={`btn-request-export-${inc.id}`}
                        onClick={() => handleRequestExport(inc.id)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0"
                      >
                        Solicitar Exportación Autorizada
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: TÉCNICO (Soporte y Compatibilidad Residencial) */}
        {activeRole === "tecnico" && (
          <div id="tecnico-layer-container" className="xl:col-span-8 space-y-6">
            <div className="bg-slate-900/20 border border-blue-500/20 rounded-2xl p-6 space-y-6">
              
              {/* Technical Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-white">Soporte Técnico y Diagnóstico de Red (Gateway local)</h3>
                    <p className="text-xs text-slate-400">Verificación de conectividad, mapeo de IPs locales y ancho de banda de bridges residenciales.</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest">
                  Capa de Diagnóstico
                </div>
              </div>

              {/* IP Mapping & Technical Parameters (Only Visible for Technical) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                  Mapeo de Redes Internas (Cámara PoE vs WiFi Consumer Bridge)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 text-[10px] uppercase font-bold bg-slate-950/40">
                        <th className="py-2.5 px-3">Equipo</th>
                        <th className="py-2.5 px-3">Tipo / Protocolo</th>
                        <th className="py-2.5 px-3">IP Ficticia</th>
                        <th className="py-2.5 px-3">WiFi RSSI / Ping</th>
                        <th className="py-2.5 px-3">Pérdida Paquetes</th>
                        <th className="py-2.5 px-3">Filtro de Privacidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {demoCameras.map(c => (
                        <tr key={c.id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-white">{c.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{c.type}</td>
                          <td className="py-2.5 px-3 text-slate-400">{c.ipMock || "Sin asignar"}</td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {c.type === "Consumer WiFi" ? "📶 -58 dBm (Fuerte) / 22ms" : "🔌 PoE / 4ms"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {c.status === "Intermitente" ? (
                              <span className="text-amber-400 font-bold">12.5% loss (Revisar)</span>
                            ) : "0.0% loss"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.privacyZone === "private" ? "bg-purple-500/15 text-purple-400" : "bg-slate-800 text-slate-400"
                            }`}>
                              {c.privacyZone === "private" ? "Estricto" : "Áreas Comunes"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical Limitations and WiFi warning */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Compatibilidad Limitada de Cámaras de Consumo WiFi</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  El bridge local de laboratorio para cámaras Eufy (C220/E220) se monta como un intermediario RTSP-to-NVR local. No se promete compatibilidad universal con cualquier cámara doméstica barata que no admita almacenamiento local NAS o flujo RTSP oficial habilitado en la aplicación de origen. El ancho de banda del router de conserjería debe ser auditado formalmente para evitar interferencias de red en el edificio.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Right Column: Comparative card (Section 10) & Context AI */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Card Comparison: Field vs Consumer vs Community (Section 10) */}
          <div id="narrative-comparison-card" className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Diferenciación de Línea de Negocios
            </span>
            <h3 className="text-sm font-sans font-bold text-white">Líneas de Operación Sentinel</h3>
            
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                <span className="text-xs font-bold font-sans text-emerald-400 flex items-center gap-1">
                  🛰️ Sentinel Field (Industrial)
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Diseñado para parques solares y terrenos de gran escala. Monitoreo perimetral estricto, radioenlaces inalámbricos a gran distancia (5.8 GHz), seguimiento de inclinación de trackers mecánicos, control PoE industrial y generación de informes técnicos para ingenieros O&M.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                <span className="text-xs font-bold font-sans text-sky-400 flex items-center gap-1">
                  🏠 Sentinel Consumer (Doméstico)
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Cámaras inteligentes para hogares (Eufy C220/E220). Integración parcial mediante streaming RTSP/NAS de apoyo local. Foco en la privacidad doméstica simplificada del grupo familiar.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                <span className="text-xs font-bold font-sans text-amber-400 flex items-center gap-1">
                  🏢 Sentinel Community (Condominios)
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Optimizado para condominios y edificios habitacionales. Enfoque en resguardo residencial, facilidad extrema para conserjes táctiles de turno, bitácora rápida de incidentes cotidianos (mascotas, portón) y bloqueos rígidos de áreas privadas.
                </p>
              </div>
            </div>
          </div>

          {/* Context AI Residential */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Context AI Residencial
            </span>
            <h3 className="text-sm font-sans font-bold text-white">Análisis de Eventos de Convivencia</h3>
            
            <div className="space-y-3 text-[11px]">
              <div>
                <p className="font-bold text-slate-300 uppercase text-[9px] font-mono mb-1">Eventos Diarios Normales</p>
                <div className="space-y-1.5 text-slate-400">
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Entrada regular de residentes en accesos comunes.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>Recepción o retiro de encomiendas frente al guardia.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <p className="font-bold text-slate-300 uppercase text-[9px] font-mono mb-1">Advertencias y Anomalías Residenciales</p>
                <div className="space-y-1.5 text-slate-400">
                  <div className="flex items-start gap-1">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span><strong>Movimiento inusual:</strong> Persona inmóvil junto a portón principal de madrugada.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>Uso indebido o ruidos en piscina fuera de horario autorizado.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>Portón abierto por más de 3 minutos (Alerta de vulnerabilidad física).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 8: COMMUNITY LIVE WALL */}
      <div id="community-live-wall-section" className="bg-slate-900/10 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-sans font-bold text-white">Mural de Transmisiones (Community Live Wall)</h3>
              <p className="text-xs text-slate-400">Visualización de flujos autorizados con filtro de privacidad residencial integrado.</p>
            </div>
          </div>

          {/* Wall Filters */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              id="wall-filter-all"
              onClick={() => setActiveWallFilter("all")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeWallFilter === "all" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Ver Todas
            </button>
            <button
              id="wall-filter-accesos"
              onClick={() => setActiveWallFilter("accesos")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeWallFilter === "accesos" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Accesos
            </button>
            <button
              id="wall-filter-comunes"
              onClick={() => setActiveWallFilter("comunes")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeWallFilter === "comunes" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Áreas Comunes
            </button>
            <button
              id="wall-filter-alertas"
              onClick={() => setActiveWallFilter("alertas")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeWallFilter === "alertas" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Alertas ({demoCameras.filter(c => c.status === "Intermitente" || c.alert).length})
            </button>
            <button
              id="wall-filter-privacidad"
              onClick={() => setActiveWallFilter("privacidad")}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                activeWallFilter === "privacidad" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Zonas Privadas ({demoCameras.filter(c => c.privacyZone === "private").length})
            </button>
          </div>
        </div>

        {/* Live Wall Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredLiveWallCams.map(c => {
            const isProtected = c.status === "Protegida" || (privacyShieldActive && c.privacyZone === "private");
            return (
              <div key={c.id} className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden relative group">
                
                {/* Simulated Feed */}
                <div className="aspect-video w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  {isProtected ? (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none z-10">
                      <Lock className="w-8 h-8 text-purple-400 animate-pulse mb-1.5" />
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                        ZONA PRIVADA PROTEGIDA
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Captura y transmisiones no exportables</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={c.lastImage}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_95%,rgba(0,0,0,0.35)_95%)] bg-[length:100%_4px] pointer-events-none" />
                    </>
                  )}

                  {/* Overlay Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="bg-slate-950/85 backdrop-blur-sm text-[9px] font-mono font-bold text-slate-200 px-1.5 py-0.5 rounded border border-slate-800">
                      {c.name}
                    </span>
                    <span className="bg-slate-950/85 backdrop-blur-sm text-[8px] font-mono text-slate-400 px-1 py-0.5 rounded">
                      {c.zone}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {c.privacyZone === "private" && (
                      <span className="bg-purple-500/20 backdrop-blur-sm text-purple-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                        PRIVADO
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-sm ${
                      c.status === "Online" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      c.status === "Intermitente" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" :
                      "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {/* REC indicator */}
                  {c.status === "Online" && !isProtected && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-950/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-400 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      REC
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-2.5 bg-slate-950 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {activeRole === "tecnico" ? (c.ipMock || "192.168.10.x") : "Monitoreo Autorizado"}
                  </span>
                  
                  <button
                    id={`btn-livewall-incident-${c.id}`}
                    onClick={() => handleQuickIncident(c.id)}
                    className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 px-2.5 py-1 rounded text-[9px] font-mono font-bold border border-slate-800 transition-colors text-slate-300 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Incidente
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: COMMUNITY INCIDENT WORKFLOW */}
      <div id="community-incidents-section" className="bg-slate-900/10 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-sans font-bold text-white">Flujo de Incidentes y Evidencias</h3>
              <p className="text-xs text-slate-400">Bitácora de registro, firmas de resguardo local e histórico para auditorías de copropietarios.</p>
            </div>
          </div>

          <button
            id="btn-register-incident-main"
            onClick={() => {
              setNewIncidentCam("CAM-PORTON-01");
              setShowIncidentModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Registrar Nuevo Incidente
          </button>
        </div>

        {/* Incident List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityIncidents.map(i => (
            <div key={i.id} className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-3 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {i.id}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    i.status === "Abierto" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                    i.status === "En revisión" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {i.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200">{i.type}</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{i.timestamp}</p>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-[11px] text-slate-300 leading-relaxed min-h-[50px]">
                  {i.observations}
                </div>
              </div>

              {/* Technical / Admin Metadata Layer */}
              <div className="pt-3 border-t border-slate-900 mt-2 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Cámara: <strong className="text-white">{i.cameraName}</strong></span>
                  <span>Área: <strong className="text-white">{i.zoneName}</strong></span>
                </div>

                {activeRole !== "conserje" ? (
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-850 space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase block">
                      Evidencias y Firmas Locales (Admin / Técnico)
                    </span>
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span>Verificación SHA-256:</span>
                      <span className="text-emerald-400 font-bold">Verificado OK</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span>Plazo de Retención:</span>
                      <span className="text-sky-400">7 Días de Seguridad</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-1 text-center text-[9px] font-mono text-slate-500 uppercase bg-slate-900/20 rounded">
                    ✓ Incidente registrado. Administración podrá revisarlo
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: COMMUNITY PRIVACY CENTER */}
      <div id="community-privacy-section" className="bg-slate-900/10 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-sans font-bold text-white">Centro de Privacidad Residencial (Privacy Shield)</h3>
              <p className="text-xs text-slate-400">Normas y protocolos estrictos para resguardo de la convivencia y vida familiar vecinal.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Block (7 cols): Policies */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  Política de Captura
                </span>
                <span className="text-xs font-bold text-slate-100 block">Zonas Vecinales Protegidas</span>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Las áreas clasificadas como zonas privadas (ventanas de vecinos, interiores o sectores de descanso quinchos) se restringen de forma rígida ante conserjes para salvaguardar la intimidad.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  Seguridad Forense
                </span>
                <span className="text-xs font-bold text-slate-100 block">Acceso Restringido a Evidencia</span>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  El personal de conserjería no posee facultades para descargar o reproducir clips grabados. Toda exportación requiere la validación explícita del administrador del condominio.
                </p>
              </div>
            </div>

            {/* Core Privacy Directives */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Directivas Estrictas de Privacidad Vecinal
              </span>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold shrink-0">■</span>
                  <span>“Las cámaras residenciales se tratan con enmascaramiento local estricto para zonas sensibles.”</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold shrink-0">■</span>
                  <span>“Conserjería no puede exportar ni reproducir clips técnicos, limitando el riesgo de filtraciones.”</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold shrink-0">■</span>
                  <span>“Toda revisión de evidencia de incidentes requiere el rol de administrador debidamente logueado.”</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold shrink-0">■</span>
                  <span>“Las zonas privadas bloquean de raíz cualquier captura de imágenes, reproducción e informes en vivo.”</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Block (5 cols): Demo Guarantee & Warnings */}
          <div className="md:col-span-5 bg-purple-950/10 border border-purple-500/20 rounded-xl p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
              Garantía de Privacidad Residencial por Diseño
            </span>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-100">Política de No Exposición de Menores</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para proteger estrictamente a las familias de los copropietarios, <strong>está estrictamente prohibido utilizar imágenes o videos reales de menores de edad, grupos familiares o interiores de viviendas en esta demostración comercial.</strong>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Todas las visualizaciones emplean renders estructurales de laboratorio y material genérico libre de rostros humanos.
                </p>
                <div className="bg-slate-900/50 p-2.5 rounded border border-purple-500/10 text-[10px] text-slate-400">
                  "Esta demo no utiliza datos reales del condominio."<br />
                  "Las zonas privadas no deben ser capturadas ni exportadas."<br />
                  "ORBI Sentinel IA Community prioriza la privacidad residencial desde el diseño."
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. COMMUNITY SALES DEMO SCRIPT (NEW) */}
      <div id="community-sales-demo-script-section" className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" /> Guion Comercial de Presentación (Sales Demo Script)
        </span>
        <h3 className="text-base font-sans font-bold text-white">¿Cómo presentar esta demo comercial de manera responsable?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <p className="font-bold text-white uppercase text-[9px] font-mono text-amber-400">1. El Problema Común</p>
            <p className="text-slate-400 leading-relaxed">
              Muchos edificios tienen sistemas complejos donde los conserjes se pierden en interfaces saturadas con claves expuestas, o apps propietarias separadas para cada cámara WiFi residencial de los copropietarios.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <p className="font-bold text-white uppercase text-[9px] font-mono text-amber-400">2. Solución Conserjería</p>
            <p className="text-slate-400 leading-relaxed">
              ORBI Sentinel IA unifica la visualización con un botón táctil de incidentes y un panel adaptado "EasyView" sin jerga de puertos ni IPs, ayudando al guardia de turno a actuar rápido sin sobrecargar su rutina diaria.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <p className="font-bold text-white uppercase text-[9px] font-mono text-amber-400">3. Privacidad y Seguridad</p>
            <p className="text-slate-400 leading-relaxed">
              El administrador posee la llave para autorizar exportaciones de evidencia firmada SHA-256 para carabineros, mientras que las cámaras sobre balcones e interiores se bloquean estrictamente con máscaras visuales de privacidad.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <p className="font-bold text-white uppercase text-[9px] font-mono text-amber-400">4. Próximos Pasos Piloto</p>
            <p className="text-slate-400 leading-relaxed">
              No prometemos compatibilidad universal mágica. Proponemos un checklist inicial de 13 puntos de factibilidad de red y marcas para implementar un piloto controlado de 3 cámaras antes de cualquier inversión formal.
            </p>
          </div>
        </div>
      </div>

      {/* SECTIONS 10 & 11: PILOT REPORT & READY CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION 10: PILOT REPORT (Community Pilot Demo Report) */}
        <div id="community-pilot-report-container" className="lg:col-span-7 bg-slate-900/10 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-bold text-white">Community Pilot Demo Report (Imprimible)</h3>
            </div>
            <button
              id="btn-print-report"
              onClick={() => {
                triggerToast("✓ Preparando cola de impresión para Reporte Comercial...");
                window.print();
              }}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[10px] font-mono font-bold"
              title="Imprimir o Exportar PDF"
            >
              <Printer className="w-3.5 h-3.5" /> PDF / Imprimir
            </button>
          </div>

          {/* Printable Report Layout */}
          <div className="bg-slate-950 rounded-xl border border-slate-900 p-6 space-y-6 text-xs text-slate-300 font-mono printable-report">
            <div className="text-center space-y-1.5 pb-4 border-b border-slate-900">
              <h4 className="text-sm font-bold text-white font-sans">INFORME DE FACTIBILIDAD Y PROPUESTA DE PILOTO</h4>
              <p className="text-[10px] text-slate-400">ORBI Sentinel IA Community - Condominio Ficticio Nueva Alameda</p>
              <p className="text-[9px] text-slate-500">Santiago, Chile | Demo Controlada No Conectada a Producción</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-900 pb-4">
              <div>
                <span className="text-slate-500 uppercase font-bold block mb-1">Comunidad Solicitante:</span>
                <span className="text-white">Condominio Nueva Alameda</span>
                <span className="text-slate-400 block mt-0.5">Levantamiento de 12 cámaras</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold block mb-1">Fase de Integración:</span>
                <span className="text-amber-400 font-bold">Prototipo de Demostración Controlada</span>
                <span className="text-slate-400 block mt-0.5">Máscara de Privacidad de Co-propiedades</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Cámaras de Seguridad Relevadas en Demo</span>
              <div className="grid grid-cols-1 gap-1.5 text-[9px]">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>- CAM-PORTON-01 (Acceso de Vehículos):</span>
                  <span className="text-emerald-400 font-bold">Online | PoE Profesional</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>- CAM-PEATONAL-02 (Puerta Entrada):</span>
                  <span className="text-emerald-400 font-bold">Online | PoE Profesional</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>- CAM-CONSERJERIA-03 (Conserje de Turno):</span>
                  <span className="text-emerald-400 font-bold">Online | WiFi Consumer</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>- CAM-QUINCHO-01 (Quincho Común):</span>
                  <span className="text-purple-400 font-bold">ZONA ENMASCARADA - PRIVACIDAD VECINAL</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>- CAM-BODEGA-01 (Bodega Subterránea):</span>
                  <span className="text-amber-400 font-bold">Intermitencia Temporal Detectada</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Resumen Operacional de Turno</span>
              <div className="text-[10px] space-y-1.5">
                {communityIncidents.map(inc => (
                  <div key={inc.id} className="bg-slate-900 p-2 rounded">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-white">{inc.id} - {inc.type}</span>
                      <span className="text-amber-400">{inc.status}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-normal">{inc.observations}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Restricciones y Declaraciones de Seguridad</span>
              <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                1. No se exponen credenciales de red, contraseñas de cámaras ni tokens RTSP/ONVIF en este reporte.<br />
                2. Toda descarga autorizada de clips de video de la comunidad requiere justificación formal registrada.<br />
                3. Se implementa con una retención estricta de 7 días, previniendo la acumulación indebida de imágenes residenciales.
              </p>
            </div>

            <div className="text-center pt-4 border-t border-slate-900 text-[10px] text-slate-500">
              ORBI Sentinel IA Community Pilot System | Copia Comercial de Demostración
            </div>
          </div>
        </div>

        {/* SECTION 11: PILOT READINESS CHECKLIST (NEW INTERACTIVE STATES) */}
        <div id="community-pilot-checklist-container" className="lg:col-span-5 bg-slate-900/10 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-bold text-white">Checklist de Factibilidad del Piloto</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Requisitos de preparación de red y autorizaciones del edificio. Haga clic para alternar estado.</p>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item, idx) => {
              let statusColor = "bg-slate-900 text-slate-500 border-slate-800";
              let statusLabel = item.status;
              if (item.status === "Listo") {
                statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                statusLabel = "🟢 Listo";
              } else if (item.status === "Pendiente") {
                statusColor = "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";
                statusLabel = "🔴 Pendiente";
              } else if (item.status === "Requiere revisión") {
                statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                statusLabel = "🟡 Revisar";
              } else {
                statusColor = "bg-slate-950 text-slate-500 border-slate-850";
                statusLabel = "⚪ No Aplica";
              }

              return (
                <div
                  id={`checklist-item-${idx}`}
                  key={idx}
                  onClick={() => cycleChecklistStatus(idx)}
                  className="flex items-start justify-between gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-900 hover:border-slate-800 cursor-pointer select-none transition-all"
                >
                  <span className="text-xs text-slate-200 pr-2">
                    {item.text}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MANUALLY CONTROLLED INCIDENT MODAL */}
      {showIncidentModal && (
        <div id="incident-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="incident-modal-content" className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-sans font-bold text-white">Marcar Incidente Residencial</h3>
              </div>
              <button
                id="btn-close-incident-modal"
                onClick={() => setShowIncidentModal(false)}
                className="text-slate-400 hover:text-white font-mono text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterIncident} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Asociar Cámara / Zona
                </label>
                <select
                  id="select-incident-camera"
                  value={newIncidentCam}
                  onChange={(e) => setNewIncidentCam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  {demoCameras.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} - {c.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Tipo de Incidente
                </label>
                <select
                  id="select-incident-type"
                  value={newIncidentType}
                  onChange={(e) => setNewIncidentType(e.target.value as IncidentType)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="Persona sospechosa">Persona sospechosa</option>
                  <option value="Vehículo detenido">Vehículo detenido</option>
                  <option value="Portón abierto">Portón abierto</option>
                  <option value="Movimiento fuera de horario">Movimiento fuera de horario</option>
                  <option value="Ruido/conflicto">Ruido/conflicto</option>
                  <option value="Mascota suelta">Mascota suelta</option>
                  <option value="Cámara sin señal">Cámara sin señal</option>
                  <option value="Acceso no reconocido">Acceso no reconocido</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Observaciones / Descripción del Guardia
                </label>
                <textarea
                  id="textarea-incident-obs"
                  required
                  placeholder="Detalles del suceso observado redactados de manera no alarmista..."
                  value={newIncidentObs}
                  onChange={(e) => setNewIncidentObs(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="btn-cancel-incident-modal"
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="flex-1 py-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-incident-modal"
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  Registrar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTHORIZED EXPORT MODAL FOR ADMINISTRATOR */}
      {showExportModal && (
        <div id="export-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="export-modal-content" className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-sans font-bold text-white">Solicitar Exportación de Evidencia</h3>
              </div>
              <button
                id="btn-close-export-modal"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white font-mono text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmExport} className="p-5 space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-1">
                <p className="text-slate-400 font-bold font-mono">ID de Incidente Asociado:</p>
                <p className="text-emerald-400 font-bold font-mono">{selectedIncidentForExport}</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Este trámite quedará auditado con el RUT/Clave del administrador en la bitácora local protegida.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Justificación Legal / Administrativa de la Copropiedad
                </label>
                <textarea
                  id="textarea-export-justification"
                  required
                  placeholder="Ej: Solicitado formalmente por Carabineros de Chile según denuncia N° 1241-2026..."
                  value={exportJustification}
                  onChange={(e) => setExportJustification(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  id="btn-cancel-export-modal"
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-export-modal"
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  Autorizar Descarga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
