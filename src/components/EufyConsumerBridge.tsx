import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  AlertCircle,
  Info,
  Shield,
  ShieldAlert,
  Wrench,
  Video,
  Server,
  Lock,
  Unlock,
  Wifi,
  Activity,
  FileText,
  RefreshCw,
  Play,
  Database,
  Compass,
  Baby,
  Cat,
  Volume2,
  LockKeyhole,
  LockKeyholeOpen,
  Send,
  Eye,
  EyeOff
} from "lucide-react";

// Types matching the registry requirements
export interface ConsumerCamera {
  cameraId: string;
  marca: string;
  modelo: string;
  alias: string;
  ubicacion: string;
  privacyZone: "private" | "lab";
  connectionType: "wifi" | "rtsp-nas" | "app-only" | "homekit" | "cloud" | "unknown";
  rtspNasAvailable: "yes" | "no" | "pending";
  onvifExpected: "yes" | "no" | "no-promised" | "pending";
  smartHomeSupport: string; // e.g., "HomeKit/Alexa/Google"
  aiInternalCapabilities: string[]; // "person", "pet", "babyCry", "motion"
  credentialMode: "none" | "session" | "env" | "future-vault" | "mock";
  consumerBridgeStatus: "registered" | "pending" | "unsupported" | "verified";
  validationStatus: "Validated" | "Partial Support" | "Pending" | "No Support";
  notes: string;
  streamMockUrl?: string;
  rtspEndpoint?: string;
}

const DEFAULT_CONSUMER_CAMERAS: ConsumerCamera[] = [
  {
    cameraId: "eufy-c220-01",
    marca: "Eufy",
    modelo: "C220",
    alias: "Eufy C220 Estación Dormitorio",
    ubicacion: "Dormitorio Principal (Entorno Hogar)",
    privacyZone: "private",
    connectionType: "wifi",
    rtspNasAvailable: "pending",
    onvifExpected: "no-promised",
    smartHomeSupport: "Alexa / Google Assistant",
    aiInternalCapabilities: ["person", "motion"],
    credentialMode: "mock",
    consumerBridgeStatus: "pending",
    validationStatus: "Pending",
    notes: "Ubicada originalmente en entorno doméstico sensible. Clasificada con privacyZone private por defecto para evitar grabaciones no deseadas."
  },
  {
    cameraId: "eufy-e220-01",
    marca: "Eufy",
    modelo: "E220",
    alias: "Eufy E220 Control Pasillo",
    ubicacion: "Pasillo Central (Entorno Hogar)",
    privacyZone: "private",
    connectionType: "wifi",
    rtspNasAvailable: "pending",
    onvifExpected: "no-promised",
    smartHomeSupport: "Apple HomeKit / Alexa / Google",
    aiInternalCapabilities: ["person", "pet", "babyCry", "motion"],
    credentialMode: "mock",
    consumerBridgeStatus: "pending",
    validationStatus: "Pending",
    notes: "Cámara Wi-Fi consumer avanzada con Paneador 360° y detección inteligente multi-evento local en chip."
  }
];

interface EufyConsumerBridgeProps {
  userRole: "conserje" | "admin" | "tecnico";
  onAddAuditLog?: (action: string, details: string) => void;
}

export default function EufyConsumerBridge({ userRole, onAddAuditLog }: EufyConsumerBridgeProps) {
  // 1. Safety flags (simulated local environment config)
  const [consumerBridgeEnabled, setConsumerBridgeEnabled] = useState<boolean>(() => {
    return localStorage.getItem("ORBI_SENTINEL_CONSUMER_BRIDGE_ENABLED") !== "false";
  });

  // 2. Camera registry state loaded from localStorage
  const [cameras, setCameras] = useState<ConsumerCamera[]>(() => {
    const saved = localStorage.getItem("ORBI_SENTINEL_CONSUMER_CAMERAS");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CONSUMER_CAMERAS;
      }
    }
    return DEFAULT_CONSUMER_CAMERAS;
  });

  // Selected camera for detail/wizard views
  const [selectedCamId, setSelectedCamId] = useState<string>(cameras[0]?.cameraId || "");

  // 3. Wizard states
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardCamModel, setWizardCamModel] = useState<string>("C220");
  const [wizardIsAuthorized, setWizardIsAuthorized] = useState<boolean>(false);
  const [wizardNoFamilyPrivacy, setWizardNoFamilyPrivacy] = useState<boolean>(false);
  const [wizardPrivacyZoneIsLab, setWizardPrivacyZoneIsLab] = useState<boolean>(false);
  const [wizardHasNasOption, setWizardHasNasOption] = useState<string>("pending"); // "yes", "no", "pending"
  const [wizardRtspEndpoint, setWizardRtspEndpoint] = useState<string>("");
  const [wizardClassifiedOutcome, setWizardClassifiedOutcome] = useState<string>("Pending user verification");

  // 4. Manual form state for adding new camera
  const [newCamAlias, setNewCamAlias] = useState<string>("");
  const [newCamModel, setNewCamModel] = useState<"C220" | "E220">("C220");
  const [newCamUbicacion, setNewCamUbicacion] = useState<string>("");

  // 5. Simulated stream states
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [simulatedFeedStatus, setSimulatedFeedStatus] = useState<string>("idle");

  // Save cameras to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ORBI_SENTINEL_CONSUMER_CAMERAS", JSON.stringify(cameras));
    localStorage.setItem("ORBI_SENTINEL_CONSUMER_BRIDGE_ENABLED", consumerBridgeEnabled.toString());
  }, [cameras, consumerBridgeEnabled]);

  const activeCam = cameras.find(c => c.cameraId === selectedCamId) || cameras[0];

  const handleToggleSafetyFlag = () => {
    const nextState = !consumerBridgeEnabled;
    setConsumerBridgeEnabled(nextState);
    if (onAddAuditLog) {
      onAddAuditLog(
        "Configuración del Consumer Bridge",
        `Cambio de bandera de seguridad Consumer Bridge a ${nextState ? "Habilitado" : "Deshabilitado"}`
      );
    }
  };

  // Toggle privacy zone for specific camera with checklist validation
  const [privacyCheckpoints, setPrivacyCheckpoints] = useState({
    pointedToWall: false,
    noMinors: false,
    noFamily: false,
    noPrivateSpace: false,
    hasConsent: false
  });

  const handleTogglePrivacyZone = (cameraId: string) => {
    setCameras(prev => prev.map(c => {
      if (c.cameraId === cameraId) {
        if (c.privacyZone === "private") {
          // Attempting to move to lab - requires all checkboxes!
          if (
            privacyCheckpoints.pointedToWall &&
            privacyCheckpoints.noMinors &&
            privacyCheckpoints.noFamily &&
            privacyCheckpoints.noPrivateSpace &&
            privacyCheckpoints.hasConsent
          ) {
            if (onAddAuditLog) {
              onAddAuditLog(
                "Configuración de Privacidad",
                `Cámara ${c.alias} cambiada de private a LAB para pruebas de laboratorio`
              );
            }
            return { ...c, privacyZone: "lab", validationStatus: "Partial Support" };
          } else {
            alert("No se cumplen todos los criterios de privacidad doméstica obligatorios para cambiar a modo LAB.");
            return c;
          }
        } else {
          // Revert to private
          if (onAddAuditLog) {
            onAddAuditLog(
              "Configuración de Privacidad",
              `Cámara ${c.alias} restablecida a zona PRIVADA por defecto`
            );
          }
          return { ...c, privacyZone: "private", validationStatus: "Pending" };
        }
      }
      return c;
    }));

    // Reset checkpoints
    setPrivacyCheckpoints({
      pointedToWall: false,
      noMinors: false,
      noFamily: false,
      noPrivateSpace: false,
      hasConsent: false
    });
  };

  const handleRegisterNewCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamAlias || !newCamUbicacion) return;

    const newId = `eufy-${newCamModel.toLowerCase()}-${Math.floor(Math.random() * 1000)}`;
    const newCamera: ConsumerCamera = {
      cameraId: newId,
      marca: "Eufy",
      modelo: newCamModel,
      alias: newCamAlias,
      ubicacion: newCamUbicacion,
      privacyZone: "private", // Default to private
      connectionType: "wifi",
      rtspNasAvailable: "pending",
      onvifExpected: "no-promised",
      smartHomeSupport: newCamModel === "E220" ? "Apple HomeKit / Alexa / Google" : "Alexa / Google Assistant",
      aiInternalCapabilities: newCamModel === "E220" ? ["person", "pet", "babyCry", "motion"] : ["person", "motion"],
      credentialMode: "mock",
      consumerBridgeStatus: "pending",
      validationStatus: "Pending",
      notes: "Cámara residencial registrada. Forzada a privacyZone private por seguridad."
    };

    setCameras(prev => [...prev, newCamera]);
    setSelectedCamId(newId);
    setNewCamAlias("");
    setNewCamUbicacion("");

    if (onAddAuditLog) {
      onAddAuditLog(
        "Registro de Cámara WiFi",
        `Registrada nueva cámara consumer Eufy ${newCamModel} - Alias: ${newCamAlias}`
      );
    }
  };

  const handleDeleteCamera = (id: string) => {
    if (confirm("¿Está seguro de eliminar este perfil de cámara consumer de la base de datos local?")) {
      setCameras(prev => prev.filter(c => c.cameraId !== id));
      if (selectedCamId === id) {
        setSelectedCamId(cameras[0]?.cameraId || "");
      }
      if (onAddAuditLog) {
        onAddAuditLog(
          "Registro de Cámara WiFi",
          `Eliminado perfil de cámara consumer ${id}`
        );
      }
    }
  };

  // Launch simulated RTSP stream testing
  const handleStartSimulatedStream = (cam: ConsumerCamera) => {
    if (!consumerBridgeEnabled) {
      alert("Operación bloqueada: El Consumer Bridge se encuentra en estado MOCK/READINESS únicamente. Habilite el flag de seguridad.");
      return;
    }
    if (cam.privacyZone === "private") {
      alert("🔒 BLOQUEADO POR PRIVACIDAD: Las políticas de ORBI Sentinel prohíben la transmisión y visualización de cámaras residenciales en zonas privadas.");
      return;
    }
    if (cam.rtspNasAvailable !== "yes") {
      alert("Stream RTSP no confirmado. Ejecute primero el RTSP/NAS Readiness Wizard.");
      return;
    }

    setActiveStreamId(cam.cameraId);
    setSimulatedFeedStatus("connecting");
    setTimeout(() => {
      setSimulatedFeedStatus("online");
    }, 1500);
  };

  // Run readiness wizard action
  const handleWizardNext = () => {
    if (wizardStep === 1) {
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!wizardIsAuthorized || !wizardNoFamilyPrivacy) {
        alert("Debe confirmar la autorización legal y el compromiso de no capturar imágenes privadas.");
        return;
      }
      setWizardStep(3);
    } else if (wizardStep === 3) {
      // Analyze & classify RTSP route entered
      let outcome = "Pending user verification";
      let isRtspsAvailable: "yes" | "no" | "pending" = "pending";
      let connectionMode: ConsumerCamera["connectionType"] = "wifi";

      if (wizardHasNasOption === "no") {
        outcome = "App-only access (RTSP/NAS bloqueado por fabricante)";
        isRtspsAvailable = "no";
        connectionMode = "app-only";
      } else if (wizardHasNasOption === "pending") {
        outcome = "Pending user verification (No configurado en App)";
        isRtspsAvailable = "pending";
        connectionMode = "wifi";
      } else {
        // Option is YES
        if (!wizardRtspEndpoint) {
          alert("Por favor ingrese la ruta de stream RTSP provista por la app Eufy.");
          return;
        }

        // Validate format
        const route = wizardRtspEndpoint.trim().toLowerCase();
        if (route.startsWith("rtsp://")) {
          outcome = "RTSP/NAS available";
          isRtspsAvailable = "yes";
          connectionMode = "rtsp-nas";
        } else {
          alert("El endpoint ingresado debe comenzar con rtsp:// para ser validado técnicamente.");
          return;
        }
      }

      setWizardClassifiedOutcome(outcome);

      // Save to active camera profile!
      setCameras(prev => prev.map(c => {
        if (c.cameraId === activeCam.cameraId) {
          return {
            ...c,
            rtspNasAvailable: isRtspsAvailable,
            connectionType: connectionMode,
            rtspEndpoint: wizardRtspEndpoint,
            validationStatus: isRtspsAvailable === "yes" ? "Validated" : "No Support",
            consumerBridgeStatus: isRtspsAvailable === "yes" ? "verified" : "unsupported",
            notes: `Clasificación resultante del Wizard: ${outcome}.`
          };
        }
        return c;
      }));

      if (onAddAuditLog) {
        onAddAuditLog(
          "Asistente de Compatibilidad",
          `Wizard completado para ${activeCam.alias}. Resultado: ${outcome}`
        );
      }

      setWizardStep(4);
    }
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setWizardIsAuthorized(false);
    setWizardNoFamilyPrivacy(false);
    setWizardPrivacyZoneIsLab(false);
    setWizardHasNasOption("pending");
    setWizardRtspEndpoint("");
    setWizardClassifiedOutcome("Pending user verification");
  };

  return (
    <div className="space-y-6">
      {/* Header Panel with Mode Switch */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
              Consumer Bridge
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Fase 2A WiFi Bridge Lab</span>
          </div>
          <h2 className="text-xl font-sans font-bold text-white mt-1">Sentinel Eufy Consumer Bridge Lab</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Plataforma para el registro, mapeo de compatibilidad y validación controlada de flujos domésticos WiFi. Diseñado bajo políticas de privacidad estrictas para evitar el acceso o grabación de imágenes familiares.
          </p>
        </div>

        {/* Global Safety Flag Switcher */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Safety Flag Config:
            </span>
            <button
              onClick={handleToggleSafetyFlag}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                consumerBridgeEnabled
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              {consumerBridgeEnabled ? "🔌 ENABLED" : "🔒 READ-ONLY / MOCK"}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-normal font-mono max-w-[240px]">
            {consumerBridgeEnabled
              ? "Habilitado: Permite probar flujos de simulación local si la cámara está en modo LAB."
              : "Deshabilitado: Bloquea conexiones reales, forzando respuestas mock de diseño."}
          </p>
        </div>
      </div>

      {/* Main Grid: Selector & Camera Registry vs active camera details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Camera List & Registry */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-white text-sm">Consumer Registry</h3>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono text-slate-400 border border-slate-900">
                {cameras.length} Registradas
              </span>
            </div>

            {/* list of cameras */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {cameras.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-900">
                  No hay cámaras consumer registradas.
                </div>
              ) : (
                cameras.map((cam) => {
                  const isSelected = selectedCamId === cam.cameraId;
                  const isPrivate = cam.privacyZone === "private";

                  return (
                    <div
                      key={cam.cameraId}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/5 border-emerald-500/30 text-white"
                          : "bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900/20"
                      }`}
                      onClick={() => {
                        setSelectedCamId(cam.cameraId);
                        handleResetWizard();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate block">{cam.alias}</span>
                            {isPrivate ? (
                              <Lock className="w-3 h-3 text-rose-400 shrink-0" title="Zona Privada" />
                            ) : (
                              <Unlock className="w-3 h-3 text-emerald-400 shrink-0" title="Modo Lab" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {cam.marca} {cam.modelo} • {cam.ubicacion}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCamera(cam.cameraId);
                          }}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Eliminar perfil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900/60 text-[9px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded border ${
                          cam.privacyZone === "private"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          ZONE: {cam.privacyZone.toUpperCase()}
                        </span>

                        <span className={`px-1.5 py-0.2 rounded border ${
                          cam.rtspNasAvailable === "yes"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : cam.rtspNasAvailable === "no"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                          RTSP: {cam.rtspNasAvailable.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Register Form */}
            <form onSubmit={handleRegisterNewCamera} className="pt-4 border-t border-slate-850 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                + Agregar Cámara Doméstica (Eufy)
              </span>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-sans">Alias / Identificador:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Eufy C220 Comedor"
                    value={newCamAlias}
                    onChange={(e) => setNewCamAlias(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-sans">Modelo Eufy:</label>
                    <select
                      value={newCamModel}
                      onChange={(e) => setNewCamModel(e.target.value as "C220" | "E220")}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="C220">C220 (Indoor)</option>
                      <option value="E220">E220 (Indoor Pan/Tilt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-sans">Ubicación:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Living"
                      value={newCamUbicacion}
                      onChange={(e) => setNewCamUbicacion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-sans text-xs font-bold rounded py-2 hover:bg-emerald-500/25 transition-all uppercase"
                >
                  Registrar Cámara WiFi
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Center & Right Column: Wizard, Privacy Mode & Stream Tester */}
        <div className="lg:col-span-2 space-y-6">
          {activeCam ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Privacy-First Control Box */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-sans font-bold text-white text-sm">Domestic Privacy Controller</h3>
                </div>

                {activeCam.privacyZone === "private" ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 items-start">
                      <LockKeyhole className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-white text-xs font-bold font-sans uppercase">🔒 Privacy Zone: PRIVATE (Activa)</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          Esta cámara se trata como <strong>100% Privada</strong>. Todas las transmisiones de video, capturas, grabaciones locales, análisis por FFmpeg y empaquetamiento de evidencia están bloqueados de forma nativa por ORBI Sentinel.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-900 space-y-3">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase border-b border-slate-900 pb-1.5">
                        Procedimiento de Habilitación de Pruebas de Laboratorio:
                      </span>

                      <div className="space-y-2">
                        <label className="flex items-start gap-2.5 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyCheckpoints.pointedToWall}
                            onChange={(e) => setPrivacyCheckpoints(p => ({ ...p, pointedToWall: e.target.checked }))}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>He apuntado la cámara hacia una pared, objeto o escena no sensible de laboratorio.</span>
                        </label>

                        <label className="flex items-start gap-2.5 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyCheckpoints.noMinors}
                            onChange={(e) => setPrivacyCheckpoints(p => ({ ...p, noMinors: e.target.checked }))}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Confirmo que no hay presencia de menores de edad en el campo de visión.</span>
                        </label>

                        <label className="flex items-start gap-2.5 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyCheckpoints.noFamily}
                            onChange={(e) => setPrivacyCheckpoints(p => ({ ...p, noFamily: e.target.checked }))}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Confirmo que no se expondrá la privacidad familiar ni espacios íntimos reales.</span>
                        </label>

                        <label className="flex items-start gap-2.5 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyCheckpoints.noPrivateSpace}
                            onChange={(e) => setPrivacyCheckpoints(p => ({ ...p, noPrivateSpace: e.target.checked }))}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Cámara reubicada de forma provisoria a un área de validación controlada.</span>
                        </label>

                        <label className="flex items-start gap-2.5 text-[10px] text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={privacyCheckpoints.hasConsent}
                            onChange={(e) => setPrivacyCheckpoints(p => ({ ...p, hasConsent: e.target.checked }))}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Autorización expresa del propietario de la red doméstica confirmada.</span>
                        </label>
                      </div>

                      <button
                        onClick={() => handleTogglePrivacyZone(activeCam.cameraId)}
                        className="w-full mt-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-sans font-bold text-xs rounded py-1.5 transition-all uppercase"
                      >
                        🔓 Desbloquear para pruebas (Modo LAB)
                      </button>
                    </div>

                    <div className="p-3 bg-slate-950 text-[10px] text-slate-400 rounded-lg leading-relaxed border border-slate-900 font-mono">
                      ⚠️ <strong>Mensaje de Seguridad:</strong> Las cámaras Eufy del hogar se tratan como privadas por defecto. Para pruebas ORBI, apunte la cámara a una pared, objeto o escena no sensible antes de habilitar cualquier prueba visual.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex gap-3 items-start animate-pulse">
                      <LockKeyholeOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-white text-xs font-bold font-sans uppercase">🔓 Privacy Zone: LAB (Habilitada)</h4>
                        <p className="text-[10px] text-slate-300 leading-relaxed mt-1">
                          Se han verificado los compromisos de privacidad doméstica. Flujos de simulación técnica e inspección de rutas locales permitidos temporalmente.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePrivacyZone(activeCam.cameraId)}
                      className="w-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 font-sans font-bold text-xs rounded py-2 transition-all uppercase"
                    >
                      🔒 Restablecer Privacidad Estricta (Bloqueo Inmediato)
                    </button>

                    <div className="border border-slate-850 rounded-xl p-3 bg-slate-950 space-y-2">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                        Prueba de Stream Local Redactado:
                      </span>
                      {activeStreamId === activeCam.cameraId && simulatedFeedStatus === "online" ? (
                        <div className="relative aspect-video rounded bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden">
                          {/* Simulated stream video canvas */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent animate-pulse" />
                          
                          <div className="p-2 flex justify-between items-center z-10 font-mono text-[9px]">
                            <span className="bg-emerald-500 text-black px-1 rounded font-bold uppercase animate-pulse">
                              LIVE
                            </span>
                            <span className="text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
                              {activeCam.modelo} • wifi-rtsp
                            </span>
                          </div>

                          {/* Center redaction watermark */}
                          <div className="flex flex-col items-center justify-center p-3 text-center z-10">
                            <span className="text-slate-200 font-sans text-xs font-bold bg-slate-950/85 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              REDACTADO COMPROMISO DE PRIVACIDAD
                            </span>
                            <p className="text-[9px] text-slate-400 mt-1.5 font-mono max-w-[200px]">
                              Trazabilidad técnica activa. No se transmiten rostros ni espacios familiares.
                            </p>
                          </div>

                          <div className="p-2 bg-slate-950/70 border-t border-slate-850/50 flex justify-between items-center z-10 text-[8px] font-mono">
                            <span className="text-slate-400 truncate max-w-[120px]">
                              {activeCam.rtspEndpoint || "rtsp://192.168.1.XX/live"}
                            </span>
                            <span className="text-emerald-400 font-bold">SHA-256 INTEGRITY OK</span>
                          </div>
                        </div>
                      ) : activeStreamId === activeCam.cameraId && simulatedFeedStatus === "connecting" ? (
                        <div className="aspect-video rounded bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-4">
                          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                          <span className="text-[10px] text-slate-400 mt-2 font-mono">Estableciendo Handshake RTSP local...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartSimulatedStream(activeCam)}
                          disabled={activeCam.rtspNasAvailable !== "yes"}
                          className={`w-full flex items-center justify-center gap-2 rounded py-2 text-xs font-bold font-sans transition-all ${
                            activeCam.rtspNasAvailable === "yes"
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-pointer"
                              : "bg-slate-900 text-slate-500 border-slate-850 cursor-not-allowed"
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          PROBAR STREAM RTSP LOCAL
                        </button>
                      )}
                      {activeCam.rtspNasAvailable !== "yes" && (
                        <span className="text-[9px] text-slate-500 block text-center mt-1">
                          *Requiere confirmar la ruta RTSP mediante el Wizard primero.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* RTSP/NAS Readiness Wizard */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-sans font-bold text-white text-sm">RTSP/NAS Readiness Wizard</h4>
                  </div>

                  {/* Step indicators */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full flex-1 transition-all ${
                          wizardStep === step
                            ? "bg-emerald-400"
                            : wizardStep > step
                            ? "bg-slate-700"
                            : "bg-slate-850"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Wizard content */}
                  {wizardStep === 1 && (
                    <div className="space-y-3.5">
                      <h5 className="text-white text-xs font-bold">Paso 1: Confirmar Modelo y Perfil</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Usted está iniciando la validación de compatibilidad para la cámara:
                        <strong className="text-white block mt-1">{activeCam.alias} ({activeCam.marca} {activeCam.modelo})</strong>
                      </p>
                      
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-400 space-y-1.5">
                        <span className="text-slate-300 font-bold block border-b border-slate-900 pb-1 mb-1">
                          Perfil de Dispositivo Esperado:
                        </span>
                        <div>• Tipo: {activeCam.modelo === "C220" ? "Indoor WiFi consumer" : "Indoor WiFi consumer avanzada"}</div>
                        <div>• Resolución de lente: 2K QHD (2304x1296)</div>
                        <div>• Movimiento: {activeCam.modelo === "C220" ? "360° pan / 96° tilt" : "360° pan / 96° tilt inteligente"}</div>
                        <div>• Detección local: {activeCam.modelo === "C220" ? "personas y movimiento" : "personas, mascotas, llanto de bebé"}</div>
                        <div>• ONVIF: No prometido / No soportado nativo</div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-3">
                      <h5 className="text-white text-xs font-bold">Paso 2: Declaración y Consentimiento Legal</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        ORBI Sentinel requiere que confirme los alcances legales de la integración antes de habilitar la sonda de transmisión:
                      </p>

                      <div className="space-y-2.5">
                        <label className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={wizardIsAuthorized}
                            onChange={(e) => setWizardIsAuthorized(e.target.checked)}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Confirmo que esta cámara pertenece a mi hogar o cuento con la autorización explícita para pruebas.</span>
                        </label>

                        <label className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={wizardNoFamilyPrivacy}
                            onChange={(e) => setWizardNoFamilyPrivacy(e.target.checked)}
                            className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-0"
                          />
                          <span>Acepto no utilizar imágenes de familiares directos, menores de edad ni espacios privados reales para reportes.</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-3">
                      <h5 className="text-white text-xs font-bold">Paso 3: Verificación de Configuración RTSP en App</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Abra la aplicación móvil <strong>Eufy Security</strong>, ingrese a la configuración de la cámara, sección <i>"Almacenamiento Local"</i> o <i>"Almacenamiento NAS"</i> y verifique si está habilitada la opción de streaming RTSP.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">¿Muestra la App Eufy la opción de retransmitir por NAS/RTSP?</label>
                          <select
                            value={wizardHasNasOption}
                            onChange={(e) => setWizardHasNasOption(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                          >
                            <option value="pending">Seleccionar estado...</option>
                            <option value="yes">Sí, opción NAS/RTSP visible y habilitada</option>
                            <option value="no">No, la app solo ofrece almacenamiento Cloud / MicroSD</option>
                          </select>
                        </div>

                        {wizardHasNasOption === "yes" && (
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Ruta RTSP provista por la App (redactado/IP local):</label>
                            <input
                              type="text"
                              required
                              placeholder="rtsp://admin:contraseña_redactada@192.168.1.50:554/live"
                              value={wizardRtspEndpoint}
                              onChange={(e) => setWizardRtspEndpoint(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                            />
                            <span className="text-[9px] text-slate-500 block mt-1">
                              *No exponga contraseñas reales. Use máscaras si lo prefiere.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-3">
                      <h5 className="text-white text-xs font-bold">Paso 4: Clasificación Completada</h5>
                      
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="text-xs text-white font-bold font-sans">
                          ✓ DIAGNÓSTICO DE COMPATIBILIDAD CONSOLIDADO
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          La cámara ha sido clasificada técnicamente. El gateway local ha registrado las condiciones de transmisión.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5 font-mono text-[10px]">
                        <div><span className="text-slate-500">Resultado:</span> <span className="text-emerald-400 font-bold">{wizardClassifiedOutcome}</span></div>
                        <div><span className="text-slate-500">Integración ORBI:</span> <span className="text-slate-200">{activeCam.connectionType === "rtsp-nas" ? "Consumer RTSP/NAS Ready" : "Restringido por App Propietaria"}</span></div>
                        <div><span className="text-slate-500">Clave expuesta:</span> <span className="text-rose-400 font-bold">No (Claves en texto plano bloqueadas)</span></div>
                        <div><span className="text-slate-500">Estatus final:</span> <span className="text-emerald-400">{activeCam.validationStatus}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-850 flex gap-2 justify-end mt-4">
                  {wizardStep > 1 && (
                    <button
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs px-3 py-1.5 rounded hover:bg-slate-850 transition-colors"
                    >
                      Atrás
                    </button>
                  )}

                  {wizardStep < 4 ? (
                    <button
                      onClick={handleWizardNext}
                      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-xs px-4 py-1.5 rounded hover:bg-emerald-500/25 transition-colors"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={handleResetWizard}
                      className="bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs px-3 py-1.5 rounded hover:bg-slate-850 transition-colors"
                    >
                      Volver a Empezar
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Seleccione una cámara consumer de la lista para gestionar su perfil, privacidad y configuración de streaming.
            </div>
          )}
        </div>
      </div>

      {/* Consumer Compatibility Matrix (Expanded matrix section requested in Step 3) */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-sans font-bold text-white text-base">Consumer Compatibility Classification Matrix</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Actualizado con niveles de validación residenciales</span>
        </div>

        <p className="text-xs text-slate-400 leading-normal max-w-4xl">
          A continuación se despliega la matriz expandida para cámaras consumer. ORBI Sentinel IA categoriza la compatibilidad según la apertura del firmware original del fabricante, separando claramente lo que puede operar localmente de lo que requiere integración Smart Home o se encuentra cerrado por políticas Cloud del proveedor.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Marca</th>
                <th className="py-2.5 px-3">Modelo</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">WiFi</th>
                <th className="py-2.5 px-3">RTSP/NAS</th>
                <th className="py-2.5 px-3">ONVIF</th>
                <th className="py-2.5 px-3">HomeKit</th>
                <th className="py-2.5 px-3">App Propietaria</th>
                <th className="py-2.5 px-3 text-center">IA (Persona)</th>
                <th className="py-2.5 px-3 text-center">IA (Mascota)</th>
                <th className="py-2.5 px-3 text-center">IA (Llanto)</th>
                <th className="py-2.5 px-3">Pan/Tilt</th>
                <th className="py-2.5 px-3">Grabación ORBI</th>
                <th className="py-2.5 px-3">Nivel ORBI</th>
                <th className="py-2.5 px-3">Estado Validación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-slate-300 font-mono text-[11px]">
              {/* Row 1: Eufy C220 */}
              <tr className="hover:bg-slate-900/20">
                <td className="py-3 px-3 font-bold text-white">Eufy</td>
                <td className="py-3 px-3">C220</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Indoor WiFi 2K</td>
                <td className="py-3 px-3 text-emerald-400">✓ 2.4 GHz</td>
                <td className="py-3 px-3">
                  <span className="text-amber-400">Pendiente (App Eufy)</span>
                </td>
                <td className="py-3 px-3 text-rose-400">No soportado</td>
                <td className="py-3 px-3 text-rose-500">No</td>
                <td className="py-3 px-3 text-emerald-400">✓ Eufy Security</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-3 text-center text-slate-600">-</td>
                <td className="py-3 px-3 text-center text-slate-600">-</td>
                <td className="py-3 px-3 text-emerald-400">Pan/Tilt 360°</td>
                <td className="py-3 px-3 text-rose-400">Bloqueado si Private</td>
                <td className="py-3 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Consumer RTSP/NAS Ready
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">Pendiente Validar</td>
              </tr>

              {/* Row 2: Eufy E220 */}
              <tr className="hover:bg-slate-900/20">
                <td className="py-3 px-3 font-bold text-white">Eufy</td>
                <td className="py-3 px-3">E220</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Indoor WiFi 2K Pan/Tilt</td>
                <td className="py-3 px-3 text-emerald-400">✓ 2.4 GHz</td>
                <td className="py-3 px-3">
                  <span className="text-amber-400">Pendiente (App Eufy)</span>
                </td>
                <td className="py-3 px-3 text-rose-400">No soportado</td>
                <td className="py-3 px-3 text-emerald-400">✓ Soportado</td>
                <td className="py-3 px-3 text-emerald-400">✓ Eufy Security</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-3 text-emerald-400">Pan/Tilt 360°</td>
                <td className="py-3 px-3 text-rose-400">Bloqueado si Private</td>
                <td className="py-3 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Consumer Smart Home Partial
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">Pendiente Validar</td>
              </tr>

              {/* Row 3: Ring Stick Up */}
              <tr className="hover:bg-slate-900/20 text-slate-400">
                <td className="py-3 px-3 font-bold text-white">Ring</td>
                <td className="py-3 px-3">Stick Up Cam</td>
                <td className="py-3 px-3 text-slate-500 font-sans">Smart WiFi Home Cloud</td>
                <td className="py-3 px-3 text-emerald-500">✓ WiFi</td>
                <td className="py-3 px-3 text-rose-500">No disponible</td>
                <td className="py-3 px-3 text-rose-500">No</td>
                <td className="py-3 px-3 text-rose-500">No</td>
                <td className="py-3 px-3 text-emerald-500">✓ App Ring</td>
                <td className="py-3 px-3 text-center text-emerald-500 font-bold">✓</td>
                <td className="py-3 px-3 text-center text-slate-700">-</td>
                <td className="py-3 px-3 text-center text-slate-700">-</td>
                <td className="py-3 px-3 text-slate-500">Fijo</td>
                <td className="py-3 px-3 text-rose-500">Imposible (Sin RTSP)</td>
                <td className="py-3 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Cloud Locked
                  </span>
                </td>
                <td className="py-3 px-3 text-rose-400">No Soportado</td>
              </tr>

              {/* Row 4: TP-Link Tapo */}
              <tr className="hover:bg-slate-900/20">
                <td className="py-3 px-3 font-bold text-white">Tapo</td>
                <td className="py-3 px-3">C200</td>
                <td className="py-3 px-3 text-slate-400 font-sans">WiFi Smart Cam</td>
                <td className="py-3 px-3 text-emerald-400">✓ WiFi</td>
                <td className="py-3 px-3 text-emerald-400">✓ Soportado directo</td>
                <td className="py-3 px-3 text-emerald-400">✓ Básico S/T</td>
                <td className="py-3 px-3 text-rose-500">No</td>
                <td className="py-3 px-3 text-emerald-400">✓ App Tapo</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-3 text-center text-slate-600">-</td>
                <td className="py-3 px-3 text-center text-slate-600">-</td>
                <td className="py-3 px-3 text-emerald-400">Pan/Tilt</td>
                <td className="py-3 px-3 text-rose-400">Bloqueado si Private</td>
                <td className="py-3 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Consumer RTSP/NAS Ready
                  </span>
                </td>
                <td className="py-3 px-3 text-amber-400">Soporte Parcial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics Integration Overview */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-white font-sans font-bold text-sm">Consumer Diagnostics & Calibration Integration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <div className="text-amber-400 font-bold font-mono">⚠️ RTSP/NAS No Validado</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              La cámara consumer se encuentra registrada de forma conceptual. No iniciará Handshake real hasta que el operador cargue el endpoint RTSP verificado.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <div className="text-rose-400 font-bold font-mono">🔒 Privacy Shield Activo</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Si la cámara se encuentra marcada como private, el motor Edge Recorder rechazará de forma inmediata cualquier intento de grabación manual o continua.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
            <div className="text-sky-400 font-bold font-mono">📡 Dependencia de App Fabricante</div>
            <p className="text-[11px] text-slate-400 leading-normal">
              La analítica avanzada de llanto, mascotas u objetos recae sobre el procesador local del fabricante. Sentinel solo actúa como receptor del stream redundante.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Section (Requested in step 12) */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h4 className="text-white font-sans font-bold text-xs">Resumen Ejecutivo de Integración Residencial</h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-normal">
          ORBI Sentinel IA puede clasificar cámaras consumer como Eufy C220/E220, identificar si permiten integración local mediante RTSP/NAS y separar claramente lo que puede operar dentro de ORBI de lo que permanece dependiente de la app del fabricante. La prioridad del módulo es la privacidad doméstica, transparencia de compatibilidad y validación responsable.
        </p>
      </div>
    </div>
  );
}
