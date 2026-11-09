import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import LiveWall from "./components/LiveWall";
import AccessVault from "./components/AccessVault";
import MotionCore from "./components/MotionCore";
import CCTVDiagnostics from "./components/CCTVDiagnostics";
import EvidenceReport from "./components/EvidenceReport";

// Expanded modules
import EasyView from "./components/EasyView";
import IncidentCenter from "./components/IncidentCenter";
import EdgeRecorder from "./components/EdgeRecorder";
import ContextAI from "./components/ContextAI";
import CompatibilityMatrix from "./components/CompatibilityMatrix";
import PrivacyCompliance from "./components/PrivacyCompliance";
import LockedView from "./components/LockedView";
import GatewayLocal from "./components/GatewayLocal";
import DahuaLabProtocol from "./components/DahuaLabProtocol";
import MVPFreezeCenter from "./components/MVPFreezeCenter";
import EufyConsumerBridge from "./components/EufyConsumerBridge";
import CommunityPilotDemo from "./components/CommunityPilotDemo";
import CommunityProposalCenter from "./components/CommunityProposalCenter";
import FieldProposalCenter from "./components/FieldProposalCenter";
import PilotIntakeCenter from "./components/PilotIntakeCenter";
import CustomerPilotWorkspace from "./components/CustomerPilotWorkspace";
import PilotOutcomeReview from "./components/PilotOutcomeReview";
import GuidedCommunityDemo from "./components/GuidedCommunityDemo";
import FieldOperationsCenter from "./components/FieldOperationsCenter";
import GuidedFieldDemo from "./components/GuidedFieldDemo";
import SentinelPublicDemoHub from "./components/SentinelPublicDemoHub";
import SentinelLaunchMediaKit from "./components/SentinelLaunchMediaKit";
import SentinelOfflineDemoAnalytics from "./components/SentinelOfflineDemoAnalytics";
import SentinelDemoInsights from "./components/SentinelDemoInsights";
import SentinelOfflineABLab from "./components/SentinelOfflineABLab";
import PilotHandoffPack from "./components/PilotHandoffPack";
import ExternalStakeholderBinder from "./components/ExternalStakeholderBinder";
import OfficialDemoDeckExportCenter from "./components/OfficialDemoDeckExportCenter";
import PublicShowcaseCenter from "./components/PublicShowcaseCenter";
import ReleaseCandidateControlCenter from "./components/ReleaseCandidateControlCenter";
import SimpleHomeDashboard from "./components/SimpleHomeDashboard";
import SimpleLauncherHomeV2 from "./components/SimpleLauncherHomeV2";
import SimpleLauncherHomeV3 from "./components/SimpleLauncherHomeV3";
import OfficialDemoRunbook, { DEMO_ROUTES } from "./components/OfficialDemoRunbook";
import DemoPracticeMode from "./components/DemoPracticeMode";
import { trackLocalEvent } from "./utils/telemetry";
import OperatorHelpCenter from "./components/OperatorHelpCenter";
import CustomerPilotSimulator from "./components/CustomerPilotSimulator";
import RealCameraLab from "./components/RealCameraLab";
import { SCREEN_HELP, GUIDED_TOURS } from "./data/helpContent";

import {
  INITIAL_PARKS,
  INITIAL_CAMERAS,
  INITIAL_CREDENTIALS,
  INITIAL_EVENTS,
  VERSION_REGISTRY
} from "./data";
import { Camera, MotionEvent, CameraStatus, Incident, IncidentStatus, Clip } from "./types";
import { Shield, Server, Terminal, ExternalLink, HelpCircle, Info, X, ChevronRight } from "lucide-react";

export default function App() {
  const [userRole, setUserRole] = useState<"conserje" | "admin" | "tecnico">("admin");
  const [currentTab, setCurrentTab] = useState<string>("simplehome");
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [currentLine, setCurrentLine] = useState<"field" | "community" | "consumer">("field");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [selectedParkId, setSelectedParkId] = useState<string>("dahua-lab");
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [events, setEvents] = useState<MotionEvent[]>(INITIAL_EVENTS);
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [initialHelpSubTab, setInitialHelpSubTab] = useState<string | undefined>(undefined);

  // Módulo 12A: Presenter Mode states
  const [activePresenterDemo, setActivePresenterDemo] = useState<{ routeId: string; currentStepIndex: number } | null>(null);
  const [isPresenterPanelCollapsed, setIsPresenterPanelCollapsed] = useState<boolean>(false);

  // Módulo 13A: Guided Tour & Contextual Help states
  const [activeTour, setActiveTour] = useState<{ id: string; stepIndex: number } | null>(null);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState<boolean>(false);

  // Módulo 5A: Reactive local telemetry tracking of user sessions
  useEffect(() => {
    trackLocalEvent("demo.session.started", { version: VERSION_REGISTRY.version, initialTab: currentTab });
    return () => {
      trackLocalEvent("demo.session.ended", { durationSeconds: 45 });
    };
  }, []);

  useEffect(() => {
    trackLocalEvent("screen.navigation.clicked", { targetTab: currentTab });
    if (currentTab === "publicdemohub") {
      trackLocalEvent("publichub.opened");
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentLine === "field") {
      trackLocalEvent("line.selected.field", { source: "switch" });
    } else if (currentLine === "community") {
      trackLocalEvent("line.selected.community", { source: "switch" });
    } else if (currentLine === "consumer") {
      trackLocalEvent("line.selected.consumer", { source: "switch" });
    }
  }, [currentLine]);

  // Módulo 1D Local Recording States
  const [isLabRecordingEnabled, setIsLabRecordingEnabled] = useState<boolean>(() => {
    return localStorage.getItem("ORBI_SENTINEL_LAB_RECORDING_ENABLED") === "true";
  });
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [recordingMode, setRecordingMode] = useState<string>("Mixed mode: substream continuo + eventos destacados");
  const [segmentationMinutes, setSegmentationMinutes] = useState<number>(5);
  const [streamQuality, setStreamQuality] = useState<"main" | "sub">("sub");
  const [audioRecordingEnabled, setAudioRecordingEnabled] = useState<boolean>(false);
  const [privacyLockActive, setPrivacyLockActive] = useState<boolean>(true);

  const [clips, setClips] = useState<Clip[]>([
    {
      id: "clip-1",
      cameraName: "Dahua LAB Cam East",
      cameraIp: "192.168.1.108",
      timestampStart: "2026-07-05 10:30:00",
      timestampEnd: "2026-07-05 10:35:00",
      duration: "05:00",
      sizeEstimate: "185 MB",
      source: "lab real pending",
      type: "evento",
      status: "disponible",
      description: "Movimiento de calibración detectado en área de laboratorio.",
      privacyZone: "lab"
    },
    {
      id: "clip-2",
      cameraName: "Conserjería - Hall Central",
      cameraIp: "192.168.1.50",
      timestampStart: "2026-07-05 10:15:32",
      timestampEnd: "2026-07-05 10:17:47",
      duration: "02:15",
      sizeEstimate: "82 MB",
      source: "mock",
      type: "incidente",
      status: "protegido",
      associatedIncidentId: "inc-101",
      description: "Evidencia protegida vinculada a incidente inc-101 (Persona sospechosa).",
      privacyZone: "common"
    },
    {
      id: "clip-3",
      cameraName: "Acceso Vehicular Portón",
      cameraIp: "192.168.1.52",
      timestampStart: "2026-07-05 09:45:10",
      timestampEnd: "2026-07-05 09:55:10",
      duration: "10:00",
      sizeEstimate: "370 MB",
      source: "mock",
      type: "continuo",
      status: "disponible",
      description: "Grabación continua programada de flujo vehicular.",
      privacyZone: "public"
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { timestamp: "2026-07-05 10:45:12", user: "Eduardo Gómez", action: "Visualización de Canal", details: "Hall Conserjería Las Condes (En vivo)", role: "Conserje" },
    { timestamp: "2026-07-05 09:30:15", user: "Sofía Martínez", action: "Exportación de Evidencia", details: "Suceso inc-94124 en Parque Parral", role: "Administrador" },
    { timestamp: "2026-07-05 08:15:00", user: "Patricio Solar", action: "Modificación de Regla", details: "Filtro de vegetación en CAM-Inversores", role: "Técnico" },
    { timestamp: "2026-07-05 02:11:10", user: "Eduardo Gómez", action: "Verificación de Vault", details: "Intento lectura de clave Dahua LAB", role: "Conserje" }
  ]);

  const handleAddAuditLog = (action: string, details: string) => {
    const userMap = {
      conserje: "Eduardo Gómez",
      admin: "Sofía Martínez",
      tecnico: "Patricio Solar"
    };
    const roleMap = {
      conserje: "Conserje",
      admin: "Administrador",
      tecnico: "Técnico"
    };
    const newLog = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: userMap[userRole] || "Usuario",
      action,
      details,
      role: roleMap[userRole] || "Operador"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleToggleLabRecordingEnabled = (enabled: boolean) => {
    setIsLabRecordingEnabled(enabled);
    localStorage.setItem("ORBI_SENTINEL_LAB_RECORDING_ENABLED", enabled ? "true" : "false");
    handleAddAuditLog(
      enabled ? "Intento de grabación" : "Configuración del NVR",
      enabled ? "Habilitó la bandera de grabación de laboratorio real" : "Deshabilitó la grabación de laboratorio"
    );
  };

  // Prefilled variables for easy incident logging
  const [prefilledIncident, setPrefilledIncident] = useState<{ camera: string; zone: string } | null>(null);

  // Manage Incidents State
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "inc-101",
      timestamp: "2026-07-05 10:15:32",
      cameraName: "Conserjería - Hall Central",
      zoneName: "Condominio Las Condes",
      type: "Persona sospechosa",
      status: "Abierto",
      observations: "Persona merodeando en el hall central de conserjería consultando datos de residentes de forma evasiva. El guardia de turno procedió a realizar control de acceso manual.",
      snapshotMockUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "inc-102",
      timestamp: "2026-07-05 09:30:11",
      cameraName: "Alhué Torre Comunicaciones",
      zoneName: "Parque Solar Alhué",
      type: "Cámara sin señal",
      status: "En revisión",
      observations: "Pérdida de señal de video durante período de máxima rotación de los seguidores fotovoltaicos. Se sospecha obstrucción física del domo con los paneles solares.",
      snapshotMockUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "inc-103",
      timestamp: "2026-07-05 08:05:40",
      cameraName: "Acceso Vehicular Portón",
      zoneName: "Condominio Las Condes",
      type: "Portón abierto",
      status: "Cerrado",
      observations: "Portón vehicular quedó abierto de forma permanente tras salida de camión de aseo municipal. Se procedió a cerrar mediante interruptor manual en conserjería.",
      snapshotMockUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  // Trigger dynamic camera state updates based on Demo Mode
  useEffect(() => {
    if (!isDemoMode) {
      // Nominal Production state: set all non-lab cameras to nominal online state
      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.parkId === "dahua-lab") return cam;
          return {
            ...cam,
            status: "Online" as CameraStatus,
            lastPing: "3 ms",
            fps: 25,
          };
        })
      );
    } else {
      // Restore initial simulation states (Alhué intermitente, Bella Vista sin acceso, etc.)
      setCameras(INITIAL_CAMERAS);
    }
  }, [isDemoMode]);

  // Reactive business line filters
  const filteredParks = INITIAL_PARKS.filter((p) => {
    if (currentLine === "field") {
      return ["dahua-lab", "parral", "alto-bella-vista", "alhue"].includes(p.id);
    } else if (currentLine === "community") {
      return ["las-condes", "portal-nunoa", "ecovista"].includes(p.id);
    } else {
      // consumer - show Dahua Lab + Las Condes to provide a blended consumer set
      return ["dahua-lab", "las-condes", "ecovista"];
    }
  });

  const filteredCameras = cameras.filter((c) =>
    filteredParks.some((p) => p.id === c.parkId)
  );

  const filteredCredentials = INITIAL_CREDENTIALS.filter((cr) =>
    filteredParks.some((p) => p.id === cr.parkId)
  );

  const filteredEvents = events.filter((e) =>
    filteredParks.some((p) => p.id === e.parkId)
  );

  const filteredIncidents = incidents.filter((inc) =>
    filteredParks.some((p) => p.name === inc.zoneName)
  );

  // System general alert status
  const systemStatus = filteredCameras.some((c) => c.status === "Offline" || c.status === "Intermitente")
    ? ("Alerta" as const)
    : ("Normal" as const);

  // Incidents handlers
  const handleAddIncident = (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev]);
    handleAddAuditLog("Registro de Incidente", `Se reportó suceso de tipo: ${newInc.type} en ${newInc.zoneName}.`);

    // Create clip mock associated with time window (e.g. 30s before and 60s after current incident)
    const nowSecs = new Date();
    const startSecs = new Date(nowSecs.getTime() - 30 * 1000);
    const endSecs = new Date(nowSecs.getTime() + 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const matchedCam = cameras.find(c => c.name === newInc.cameraName);
    const privacy = matchedCam?.privacyZone || "lab";

    const newClip: Clip = {
      id: "clip-" + Date.now(),
      cameraName: newInc.cameraName,
      cameraIp: matchedCam?.ip || "192.168.1.100",
      timestampStart: `${formatDate(startSecs)} ${formatTime(startSecs)}`,
      timestampEnd: `${formatDate(endSecs)} ${formatTime(endSecs)}`,
      duration: "01:30",
      sizeEstimate: "65 MB",
      source: isLabRecordingEnabled && matchedCam?.realConnectorAllowed ? "lab real" : "mock",
      type: "incidente",
      status: "protegido", // Protected as evidence
      associatedIncidentId: newInc.id,
      description: `Evidencia vinculada a incidente: ${newInc.type}.`,
      privacyZone: privacy
    };

    setClips((prev) => [newClip, ...prev]);
    handleAddAuditLog("Intento de grabación", `Autocaptura de clip de evidencia generada para ${newInc.cameraName}.`);
  };

  const handleAddClip = (clip: Clip) => {
    setClips((prev) => [clip, ...prev]);
  };

  const handleUpdateClipStatus = (id: string, status: Clip["status"]) => {
    setClips((prev) =>
      prev.map((clip) => {
        if (clip.id === id) {
          const prevStatus = clip.status;
          if (prevStatus !== status) {
            handleAddAuditLog(
              status === "protegido" ? "Clip marcado como evidencia" : "Configuración del NVR",
              `Cambiado estado de clip ${clip.id} de '${prevStatus}' a '${status}'.`
            );
          }
          return { ...clip, status };
        }
        return clip;
      })
    );
  };

  const handleAssociateIncident = (id: string, incidentId: string) => {
    setClips((prev) =>
      prev.map((clip) => {
        if (clip.id === id) {
          const matchedInc = incidents.find(i => i.id === incidentId);
          handleAddAuditLog(
            "Clip marcado como evidencia",
            `Asociado clip ${clip.id} a incidente ${incidentId} (${matchedInc?.type || "Otro"}).`
          );
          return {
            ...clip,
            associatedIncidentId: incidentId,
            status: "protegido",
            description: `Evidencia vinculada a incidente ${incidentId}: ${matchedInc?.type || "Otro"}.`
          };
        }
        return clip;
      })
    );
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  };

  // Switch to EasyView incident log callback
  const handleEasyViewIncidentClick = (camera: string, zone: string) => {
    setPrefilledIncident({ camera, zone });
    setCurrentTab("incidentcenter");
  };

  // Lab camera handlers
  const handleAddLabCamera = (newCam: Camera) => {
    setCameras((prev) => [...prev, newCam]);
  };

  const handleDeleteLabCamera = (id: string) => {
    setCameras((prev) => prev.filter((cam) => cam.id !== id));
  };

  const handleUpdateLabCameraStatus = (id: string, labStatus: any, status: CameraStatus) => {
    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, labStatus, status } : cam
      )
    );
  };

  const renderPresenterOverlay = () => {
    if (userRole === "conserje") {
      return null;
    }
    if (!activePresenterDemo) return null;
    const route = DEMO_ROUTES.find(r => r.id === activePresenterDemo.routeId);
    if (!route) return null;
    const currentStepIndex = activePresenterDemo.currentStepIndex;
    const step = route.steps[currentStepIndex];
    if (!step) return null;

    const handleNext = () => {
      if (currentStepIndex < route.steps.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setActivePresenterDemo({ ...activePresenterDemo, currentStepIndex: nextIndex });
        setCurrentTab(route.steps[nextIndex].screenId);
        handleAddAuditLog("Presenter Paso Siguiente", `Navegó a paso ${nextIndex + 1}: ${route.steps[nextIndex].title}`);
      }
    };

    const handlePrev = () => {
      if (currentStepIndex > 0) {
        const prevIndex = currentStepIndex - 1;
        setActivePresenterDemo({ ...activePresenterDemo, currentStepIndex: prevIndex });
        setCurrentTab(route.steps[prevIndex].screenId);
        handleAddAuditLog("Presenter Paso Anterior", `Navegó a paso ${prevIndex + 1}: ${route.steps[prevIndex].title}`);
      }
    };

    const handleFinish = () => {
      setActivePresenterDemo(null);
      setCurrentTab("demorunbook");
      handleAddAuditLog("Presenter Finalizado", `Demo finalizada para ruta: ${route.name}`);
    };

    if (isPresenterPanelCollapsed) {
      return (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 shadow-2xl text-xs font-mono text-white animate-fade-in" id="presenter-collapsed-bar">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-400">PRESENTER ACTIVO</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-bold">Paso {currentStepIndex + 1}/{route.steps.length}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <button
              onClick={() => {
                setCurrentTab(step.screenId);
                handleAddAuditLog("Salto de Pantalla", `Demo saltó a pantalla: ${step.screenName}`);
              }}
              title="Ir a Pantalla Sugerida"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold transition-all"
            >
              Ir a pantalla
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === route.steps.length - 1}
              className="bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-[10px] font-bold transition-all"
            >
              Sig
            </button>
            <button
              onClick={() => setIsPresenterPanelCollapsed(false)}
              className="text-slate-400 hover:text-white px-1 text-[10px] font-bold"
              title="Expandir Panel"
            >
              🗖 Expandir
            </button>
            <button
              onClick={handleFinish}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-[10px] font-bold transition-all"
              title="Finalizar Demo"
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/30 rounded-2xl shadow-2xl p-4 space-y-3 animate-fade-in text-slate-100" id="presenter-floating-card">
        {/* Presenter Panel Top bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Presenter Mode: {route.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPresenterPanelCollapsed(true)}
              className="text-slate-400 hover:text-white text-[10px] bg-slate-950/40 hover:bg-slate-950/80 px-2 py-1 rounded font-mono"
              title="Minimizar panel"
            >
              🗕 Minimizar
            </button>
            <button
              onClick={handleFinish}
              className="text-rose-400 hover:text-rose-300 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded font-bold"
              title="Finalizar Presentación"
            >
              ✖ Finalizar
            </button>
          </div>
        </div>

        {/* Step Info */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>PASO {currentStepIndex + 1} DE {route.steps.length}</span>
            <span className="text-emerald-400 font-bold">⏱️ TIE: {step.duration}</span>
          </div>
          <h4 className="text-xs font-bold text-white">{step.title}</h4>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500 font-bold uppercase">Sugerido:</span>
            <span className="bg-slate-950 border border-slate-850 text-slate-300 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">
              {step.screenName}
            </span>
          </div>
        </div>

        {/* Speech / What to say */}
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
          <span className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
            Discurso sugerido (Qué decir):
          </span>
          <p className="text-[10px] text-slate-300 italic leading-relaxed">
            “{step.speech}”
          </p>
        </div>

        {/* What to avoid */}
        <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1">
          <span className="text-[9px] font-mono uppercase font-bold text-rose-400 tracking-wider block">
            Qué Evitar (No prometer):
          </span>
          <p className="text-[10px] text-slate-400 leading-normal">
            {step.avoid}
          </p>
        </div>

        {/* Presenter Mode Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-850 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all text-slate-300"
            >
              ◀ Ant
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === route.steps.length - 1}
              className="p-1.5 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-850 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all text-slate-300"
            >
              Sig ▶
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentTab(step.screenId);
              handleAddAuditLog("Salto de Pantalla", `Demo saltó a pantalla: ${step.screenName}`);
            }}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-lg"
          >
            Ir a pantalla
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Módulo 13A: Guided Tour & Contextual Help logic
  const handleStartTour = (tourId: string) => {
    setActiveTour({ id: tourId, stepIndex: 0 });
    const screenId = getTourStepScreen(tourId, 0);
    if (screenId) {
      setCurrentTab(screenId);
    }
    handleAddAuditLog("Mini-recorrido iniciado", `Inició el recorrido: ${tourId}`);
  };

  const getTourStepScreen = (tourId: string, stepIndex: number): string | null => {
    if (tourId === "tour_conserje") {
      const screens = ["simplehome", "easyview", "livewall", "incidentcenter", "simplehome"];
      return screens[stepIndex] || null;
    }
    if (tourId === "tour_admin") {
      const screens = ["simplehome", "demorunbook", "demorunbook", "evidence", "releasecandidate"];
      return screens[stepIndex] || null;
    }
    if (tourId === "tour_tecnico") {
      const screens = ["simplehome", "diagnostics", "gatewaylocal", "edgerecorder", "compatibility"];
      return screens[stepIndex] || null;
    }
    if (tourId === "tour_alerta") {
      const screens = ["simplehome", "livewall", "livewall", "incidentcenter", "easyview"];
      return screens[stepIndex] || null;
    }
    if (tourId === "tour_reporte") {
      return "evidence";
    }
    if (tourId === "tour_prep_demo") {
      const screens = ["demorunbook", "demorunbook", "demorunbook", "demorunbook", "simplehome"];
      return screens[stepIndex] || null;
    }
    if (tourId === "tour_practicar") {
      return "demopractice";
    }
    if (tourId === "tour_diagnostico_cctv") {
      return "diagnostics";
    }
    return null;
  };

  const renderTourWidget = () => {
    if (!activeTour) return null;

    const tour = GUIDED_TOURS.find((t) => t.id === activeTour.id);
    if (!tour) return null;

    const step = tour.steps[activeTour.stepIndex];
    if (!step) return null;

    const isLastStep = activeTour.stepIndex === tour.steps.length - 1;

    const handleNext = () => {
      if (isLastStep) {
        handleFinishTour();
      } else {
        const nextIndex = activeTour.stepIndex + 1;
        setActiveTour({ id: activeTour.id, stepIndex: nextIndex });
        const screenId = getTourStepScreen(tour.id, nextIndex);
        if (screenId) {
          setCurrentTab(screenId);
        }
      }
    };

    const handlePrev = () => {
      if (activeTour.stepIndex > 0) {
        const prevIndex = activeTour.stepIndex - 1;
        setActiveTour({ id: activeTour.id, stepIndex: prevIndex });
        const screenId = getTourStepScreen(tour.id, prevIndex);
        if (screenId) {
          setCurrentTab(screenId);
        }
      }
    };

    const handleFinishTour = () => {
      localStorage.setItem(`ORBI_SENTINEL_TOUR_SEEN_${tour.id}`, "true");
      setActiveTour(null);
      setCurrentTab("helpcenter");
      handleAddAuditLog("Mini-recorrido finalizado", `Completó el recorrido: ${tour.name}`);
    };

    const handleExitTour = () => {
      setActiveTour(null);
      handleAddAuditLog("Mini-recorrido cancelado", `Salió del recorrido: ${tour.name}`);
    };

    return (
      <div className="fixed bottom-6 right-6 z-[60] max-w-sm w-full bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-4 space-y-3.5 animate-fade-in text-slate-100 font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Guía Interactiva
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Paso {activeTour.stepIndex + 1} de {tour.steps.length}
          </span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white font-sans">{step.title}</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
            {step.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <button
            onClick={handleExitTour}
            className="text-[10px] font-mono font-bold text-slate-400 hover:text-white transition-all"
          >
            Salir
          </button>
          
          <div className="flex gap-1.5">
            {activeTour.stepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300 transition-all"
              >
                Volver
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded text-[10px] font-bold transition-all"
            >
              {isLastStep ? "Finalizar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHelpDrawer = () => {
    if (!isHelpDrawerOpen) return null;

    const help = SCREEN_HELP.find((sh) => sh.id === currentTab);

    return (
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-200 animate-slide-in font-sans">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-white">
              Ayuda Contextual
            </h4>
          </div>
          <button
            onClick={() => setIsHelpDrawerOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {help ? (
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold bg-slate-950 border border-slate-850 text-emerald-400 px-2 py-0.5 rounded uppercase">
                  Pantalla Activa
                </span>
                <h5 className="text-sm font-bold text-white mt-1.5">{help.name}</h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {help.description}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  Acciones Principales
                </span>
                <ul className="space-y-1 pl-1.5">
                  {help.actions.map((act, idx) => (
                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono select-none mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  Errores Comunes
                </span>
                <ul className="space-y-1 pl-1.5">
                  {help.commonErrors.map((err, idx) => (
                    <li key={idx} className="text-[11px] text-amber-400 flex items-start gap-1.5 font-sans leading-relaxed">
                      <span className="text-amber-500 font-mono select-none mt-0.5">⚠</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold block mb-1">
                  Qué Evitar / Límite
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {help.whatToAvoid}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-850 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
                  Enlaces Relacionados
                </span>
                <button
                  onClick={() => {
                    setIsHelpDrawerOpen(false);
                    setCurrentTab("helpcenter");
                  }}
                  className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-xl transition-all flex items-center justify-between text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  <span>Abrir Manual Completo</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 space-y-2">
              <Info className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-xs">No hay ayuda específica preconfigurada para esta pestaña.</p>
              <button
                onClick={() => {
                  setIsHelpDrawerOpen(false);
                  setCurrentTab("helpcenter");
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Abrir Operator Help Center
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>Estación: {userRole.toUpperCase()}</span>
          <span>ORBI Sentinel v0.15.2</span>
        </div>
      </div>
    );
  };

  if (currentTab === "simplehome" || currentTab === "simplehomev3") {
    return (
      <>
        <SimpleLauncherHomeV3
          userRole={userRole}
          setUserRole={setUserRole}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isDemoMode={isDemoMode}
          toggleDemoMode={() => setIsDemoMode((prev) => !prev)}
          currentLine={currentLine}
          setCurrentLine={currentLine}
          isAdvancedMode={isAdvancedMode}
          setIsAdvancedMode={setIsAdvancedMode}
          cameras={cameras}
          incidents={incidents}
          onAddAuditLog={handleAddAuditLog}
          openVersionModal={() => setShowVersionModal(true)}
          onNavigateHelpSubTab={(subTab: string) => {
            setInitialHelpSubTab(subTab);
            setCurrentTab("helpcenter");
          }}
        />
        {renderPresenterOverlay()}
        {renderTourWidget()}
        {renderHelpDrawer()}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        versionRegistry={VERSION_REGISTRY}
        systemStatus={systemStatus}
        isDemoMode={isDemoMode}
        toggleDemoMode={() => setIsDemoMode((prev) => !prev)}
        currentLine={currentLine}
        setCurrentLine={(line) => {
          setCurrentLine(line);
          // Auto-update default selected park to first one of the active line to avoid stale views
          if (line === "field") {
            setSelectedParkId("dahua-lab");
          } else {
            setSelectedParkId("las-condes");
          }
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        isAdvancedMode={isAdvancedMode}
        setIsAdvancedMode={setIsAdvancedMode}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-sans font-black text-white uppercase tracking-tight">
              ORBI Sentinel IA
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Estación de Control: {currentLine === "field" ? "SENTINEL FIELD" : "SENTINEL COMMUNITY"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Version Registry & AI Core - Hidden on Home Simple mode to prevent technical clutter */}
            {(isAdvancedMode || currentTab !== "simplehome") && (
              <>
                <button
                  onClick={() => setIsHelpDrawerOpen(true)}
                  className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ayuda</span>
                </button>

                <button
                  onClick={() => setShowVersionModal(true)}
                  className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 transition-all"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Version Registry</span>
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    ORBI Vision Core Activo
                  </span>
                </div>
              </>
            )}

            {/* Current Active Role */}
            <div className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider">
              ROL: {userRole === "conserje" ? "CONSERJE" : userRole === "admin" ? "ADMIN" : "TÉCNICO"}
            </div>
          </div>
        </header>

        {/* Global Environment & Lab Banners */}
        {currentTab !== "simplehome" && (
          <div className="bg-slate-950 border-b border-slate-900/60 px-8 py-2 flex flex-wrap items-center gap-2 shrink-0">
            {userRole === "conserje" ? (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-sans">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                <span>Modo Conserje Activo: Entorno perimetral monitoreado de baja fatiga cognitiva.</span>
              </div>
            ) : !isAdvancedMode ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="text-slate-500 uppercase tracking-wider mr-1 text-[9px] font-bold">Estado del Sistema:</span>
                
                {/* Demo Mode */}
                <span className={`px-2 py-0.5 rounded border ${
                  isDemoMode 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold" 
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  {isDemoMode ? "🟢 Modo Demo" : "⚪ Modo Demo: Inactivo"}
                </span>

                {/* Production Locked */}
                <span className="px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold">
                  🔒 Producción Bloqueada
                </span>

                {/* Privacidad Activa */}
                <span className="px-2 py-0.5 rounded border bg-teal-500/10 text-teal-400 border-teal-500/20 font-bold">
                  🛡️ Privacidad Activa
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="text-slate-500 uppercase tracking-wider mr-1 text-[9px] font-bold">Estado del Nodo (Avanzado):</span>
                
                {/* Demo Mode */}
                <span className={`px-2 py-0.5 rounded border ${
                  isDemoMode 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  {isDemoMode ? "🟢 Demo Mode: Datos Simulados" : "⚪ Demo Mode: Inactivo"}
                </span>

                {/* Lab Mode */}
                <span className="px-2 py-0.5 rounded border bg-sky-500/10 text-sky-400 border-sky-500/20">
                  🔵 Lab Mode: Pruebas Locales Habilitadas
                </span>

                {/* Production Locked */}
                <span className="px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold">
                  🔒 Production Locked: No Habilitada
                </span>

                {/* Recording State */}
                <span className={`px-2 py-0.5 rounded border ${
                  isLabRecordingEnabled 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold" 
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  {isLabRecordingEnabled ? "🔴 Recording: Habilitado (Lab)" : "⚪ Recording: Deshabilitado"}
                </span>

                {/* FFmpeg state */}
                <span className={`px-2 py-0.5 rounded border ${
                  isLabRecordingEnabled 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  ⚡ FFmpeg Adapter: {isLabRecordingEnabled ? "Active" : "Idle"}
                </span>

                {/* Real connectors */}
                <span className="px-2 py-0.5 rounded border bg-teal-500/10 text-teal-400 border-teal-500/20">
                  🔌 Real Connectors Enabled (Dahua LAN Only)
                </span>

                {/* Destructive actions */}
                <span className="px-2 py-0.5 rounded border bg-slate-900 text-slate-500 border-slate-800">
                  ❌ Delete Locked (No destructivo)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Scrollable View Content */}
        <div className={`flex-1 overflow-y-auto max-w-7xl w-full mx-auto ${
          currentTab === "simplehome" ? "p-4 xl:p-6 space-y-3.5" : "p-8 space-y-6"
        }`}>
          {/* Active view routing */}
          {userRole === "conserje" && ["dashboard", "motioncore", "contextai", "accessvault", "diagnostics", "edgerecorder", "evidence", "compatibility", "privacy", "gatewaylocal", "dahualabprotocol", "realcameralab", "mvpfreeze", "consumerbridge", "communityproposal", "fieldproposal", "guideddemo", "guidedfielddemo", "demoanalytics", "demoinsights", "stakeholderbinder", "demodeckexport", "publicshowcase", "releasecandidate", "demorunbook", "customerpilotsimulator", "customerpilotworkspace", "pilotoutcomereview"].includes(currentTab) ? (
            <LockedView
              onBackToEasyView={() => setCurrentTab("easyview")}
              onSwitchRole={setUserRole}
              requiredRole={["diagnostics", "accessvault", "gatewaylocal", "dahualabprotocol", "realcameralab", "consumerbridge"].includes(currentTab) ? "Técnico de Terreno" : "Administrador"}
            />
          ) : (
            <>
              {currentTab === "simplehome" && (
                <SimpleLauncherHomeV2
                  userRole={userRole}
                  setUserRole={setUserRole}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  isDemoMode={isDemoMode}
                  toggleDemoMode={() => setIsDemoMode((prev) => !prev)}
                  currentLine={currentLine}
                  setCurrentLine={setCurrentLine}
                  isAdvancedMode={isAdvancedMode}
                  setIsAdvancedMode={setIsAdvancedMode}
                  cameras={cameras}
                  incidents={incidents}
                  onAddAuditLog={handleAddAuditLog}
                  openVersionModal={() => setShowVersionModal(true)}
                />
              )}

              {currentTab === "publicdemohub" && (
                <SentinelPublicDemoHub
                  userRole={userRole}
                  setUserRole={setUserRole}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  currentLine={currentLine}
                  setCurrentLine={setCurrentLine}
                  isDemoMode={isDemoMode}
                  toggleDemoMode={() => setIsDemoMode((prev) => !prev)}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "gatewaylocal" && (
                <GatewayLocal
                  parks={filteredParks}
                  cameras={cameras}
                  onAddLabCamera={handleAddLabCamera}
                  onDeleteLabCamera={handleDeleteLabCamera}
                  onUpdateLabCameraStatus={handleUpdateLabCameraStatus}
                  currentLine={currentLine}
                  userRole={userRole}
                />
              )}

              {currentTab === "dashboard" && (
                <DashboardOverview
                  parks={filteredParks}
                  cameras={filteredCameras}
                  credentials={filteredCredentials}
                  events={filteredEvents}
                  setCurrentTab={setCurrentTab}
                  setSelectedParkId={setSelectedParkId}
                  isDemoMode={isDemoMode}
                />
              )}

              {currentTab === "easyview" && (
                <EasyView
                  parks={filteredParks}
                  cameras={filteredCameras}
                  events={filteredEvents}
                  currentLine={currentLine}
                  onAddIncidentClick={handleEasyViewIncidentClick}
                  onViewEventsClick={() => setCurrentTab("motioncore")}
                />
              )}

              {currentTab === "livewall" && (
                <LiveWall
                  cameras={filteredCameras}
                  isDemoMode={isDemoMode}
                  userRole={userRole}
                  isLabRecordingEnabled={isLabRecordingEnabled}
                  recordingMode={recordingMode}
                  onAddClip={handleAddClip}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "accessvault" && (
                <AccessVault
                  credentials={filteredCredentials}
                  parks={filteredParks}
                  isDemoMode={isDemoMode}
                />
              )}

              {currentTab === "motioncore" && (
                <MotionCore
                  events={filteredEvents}
                  setEvents={setEvents}
                  parks={filteredParks}
                />
              )}

              {currentTab === "diagnostics" && (
                <CCTVDiagnostics
                  parks={filteredParks}
                  cameras={filteredCameras}
                  selectedParkId={selectedParkId}
                  setSelectedParkId={setSelectedParkId}
                  isDemoMode={isDemoMode}
                />
              )}

              {currentTab === "edgerecorder" && (
                <EdgeRecorder
                  parks={filteredParks}
                  cameras={filteredCameras}
                  currentLine={currentLine}
                  userRole={userRole}
                  isLabRecordingEnabled={isLabRecordingEnabled}
                  setIsLabRecordingEnabled={handleToggleLabRecordingEnabled}
                  retentionDays={retentionDays}
                  setRetentionDays={setRetentionDays}
                  recordingMode={recordingMode}
                  setRecordingMode={setRecordingMode}
                  segmentationMinutes={segmentationMinutes}
                  setSegmentationMinutes={setSegmentationMinutes}
                  streamQuality={streamQuality}
                  setStreamQuality={setStreamQuality}
                  audioRecordingEnabled={audioRecordingEnabled}
                  setAudioRecordingEnabled={setAudioRecordingEnabled}
                  privacyLockActive={privacyLockActive}
                  setPrivacyLockActive={setPrivacyLockActive}
                  clips={clips}
                  onAddClip={handleAddClip}
                  onUpdateClipStatus={handleUpdateClipStatus}
                  onAssociateIncident={handleAssociateIncident}
                  incidents={incidents}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "contextai" && (
                <ContextAI />
              )}

              {currentTab === "incidentcenter" && (
                <IncidentCenter
                  parks={filteredParks}
                  cameras={filteredCameras}
                  incidents={incidents}
                  onAddIncident={handleAddIncident}
                  onUpdateStatus={handleUpdateIncidentStatus}
                  onDeleteIncident={handleDeleteIncident}
                  currentLine={currentLine}
                />
              )}

              {currentTab === "evidence" && (
                <EvidenceReport
                  parks={filteredParks}
                  cameras={filteredCameras}
                  incidents={incidents}
                  isLabRecordingEnabled={isLabRecordingEnabled}
                  recordingMode={recordingMode}
                  retentionDays={retentionDays}
                  clips={clips}
                />
              )}

              {currentTab === "compatibility" && (
                <CompatibilityMatrix />
              )}

              {currentTab === "privacy" && (
                <PrivacyCompliance
                  auditLogs={auditLogs}
                  onAddAuditLog={handleAddAuditLog}
                  userRole={userRole}
                />
              )}

              {currentTab === "dahualabprotocol" && (
                <DahuaLabProtocol
                  cameras={cameras}
                  userRole={userRole}
                  isLabRecordingEnabled={isLabRecordingEnabled}
                  clips={clips}
                  onAddClip={handleAddClip}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "realcameralab" && (
                <RealCameraLab
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  onSwitchRole={setUserRole}
                  onBackToEasyView={() => setCurrentTab("easyview")}
                />
              )}

              {currentTab === "mvpfreeze" && (
                <MVPFreezeCenter
                  userRole={userRole}
                  isLabRecordingEnabled={isLabRecordingEnabled}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "consumerbridge" && (
                <EufyConsumerBridge
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "communitypilot" && (
                <CommunityPilotDemo
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "communityproposal" && (
                <CommunityProposalCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "fieldproposal" && (
                <FieldProposalCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "pilotintake" && (
                <PilotIntakeCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "customerpilotworkspace" && (
                <CustomerPilotWorkspace
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "customerpilotsimulator" && (
                <CustomerPilotSimulator
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "pilotoutcomereview" && (
                <PilotOutcomeReview
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "pilothandoff" && (
                <PilotHandoffPack
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "guideddemo" && (
                <GuidedCommunityDemo
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "fieldoperations" && (
                <FieldOperationsCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "guidedfielddemo" && (
                <GuidedFieldDemo
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "mediakit" && (
                <SentinelLaunchMediaKit
                  userRole={userRole}
                  isDemoMode={isDemoMode}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "demoanalytics" && (
                <SentinelOfflineDemoAnalytics
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "demoinsights" && (
                <SentinelDemoInsights
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  onBackToEasyView={() => setCurrentTab("easyview")}
                  onSwitchRole={(role) => setUserRole(role)}
                />
              )}

              {currentTab === "abpresentationlab" && (
                <SentinelOfflineABLab
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {currentTab === "stakeholderbinder" && (
                <ExternalStakeholderBinder
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "demodeckexport" && (
                <OfficialDemoDeckExportCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "publicshowcase" && (
                <PublicShowcaseCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "releasecandidate" && (
                <ReleaseCandidateControlCenter
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "demorunbook" && (
                <OfficialDemoRunbook
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                  isDemoMode={isDemoMode}
                  toggleDemoMode={() => setIsDemoMode((prev) => !prev)}
                  activePresenterDemo={activePresenterDemo}
                  setActivePresenterDemo={setActivePresenterDemo}
                />
              )}

              {currentTab === "demopractice" && (
                <DemoPracticeMode
                  userRole={userRole}
                  onAddAuditLog={handleAddAuditLog}
                  setCurrentTab={setCurrentTab}
                  isDemoMode={isDemoMode}
                />
              )}

              {currentTab === "helpcenter" && (
                <OperatorHelpCenter
                  userRole={userRole}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  isDemoMode={isDemoMode}
                  onAddAuditLog={handleAddAuditLog}
                  onStartTour={handleStartTour}
                  initialSubTab={initialHelpSubTab}
                  onClearInitialSubTab={() => setInitialHelpSubTab(undefined)}
                />
              )}
            </>
          )}
        </div>
        {renderPresenterOverlay()}
        {renderTourWidget()}
        {renderHelpDrawer()}
      </main>

      {/* Version Registry Release Information Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">ORBI Sentinel IA — Version Registry</h4>
                <p className="text-xs text-slate-400 mt-1">Bitácora de lanzamiento {VERSION_REGISTRY.version}</p>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-850 hover:bg-slate-800 px-2.5 py-1 rounded"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div>
                <span className="font-mono text-slate-500 block uppercase tracking-wider text-[10px]">Codename:</span>
                <span className="font-bold text-emerald-400">{VERSION_REGISTRY.codename}</span>
              </div>
              {VERSION_REGISTRY.statusNote && (
                <div>
                  <span className="font-mono text-slate-500 block uppercase tracking-wider text-[10px]">Estado de Validación:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block mt-0.5">{VERSION_REGISTRY.statusNote}</span>
                </div>
              )}
              <div>
                <span className="font-mono text-slate-500 block uppercase tracking-wider text-[10px]">Fecha de Lanzamiento:</span>
                <span className="font-mono text-slate-200">{VERSION_REGISTRY.releaseDate}</span>
              </div>
              <div>
                <span className="font-mono text-slate-500 block uppercase tracking-wider text-[10px] mb-1">Equipamiento de Operación:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 font-mono text-[11px]">
                  {VERSION_REGISTRY.equipment.map((eq, i) => (
                    <li key={i}>{eq}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-mono text-slate-500 block uppercase tracking-wider text-[10px] mb-1">Funcionalidades Sentinel Foundation Expanded:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {VERSION_REGISTRY.capabilities.map((cap, i) => (
                    <li key={i}>{cap}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] text-slate-400 leading-normal font-mono">
              <strong>Nota de Fase MVP / Lab:</strong> El gateway de simulación local actúa como puente emulado de red para canales RTSP y descubrimientos ONVIF. Próximas fases habilitarán flujos de video reales mediante túnel de red VPN seguro.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
