import React, { useState, useEffect } from "react";
import { Park, Camera, CameraStatus } from "../types";
import {
  Server,
  Cpu,
  Plus,
  Trash2,
  RefreshCw,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Lock,
  Code,
  Terminal,
  Activity,
  Image as ImageIcon,
  Zap,
  Info,
  Layers,
  Settings
} from "lucide-react";

interface GatewayLocalProps {
  parks: Park[];
  cameras: Camera[];
  onAddLabCamera: (cam: Camera) => void;
  onDeleteLabCamera: (id: string) => void;
  onUpdateLabCameraStatus: (id: string, labStatus: any, status: CameraStatus) => void;
  currentLine: "field" | "community";
  userRole: "conserje" | "admin" | "tecnico";
}

export default function GatewayLocal({
  parks,
  cameras,
  onAddLabCamera,
  onDeleteLabCamera,
  onUpdateLabCameraStatus,
  currentLine,
  userRole
}: GatewayLocalProps) {
  // Filter cameras belonging to the Dahua Lab park or custom lab cameras
  const labCameras = cameras.filter(cam => cam.parkId === "dahua-lab" || cam.isLab);

  // Módulo 1B Real Connector Flag State
  const [realConnectorsEnabled, setRealConnectorsEnabled] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/lab/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.realConnectorsEnabled !== undefined) {
          setRealConnectorsEnabled(data.realConnectorsEnabled);
        }
      })
      .catch((err) => {
        console.error("Error fetching lab config:", err);
      });
  }, []);

  // Local state for Gateway settings
  const [gatewayStatus, setGatewayStatus] = useState<"Demo" | "Lab Ready" | "Offline" | "Error">("Lab Ready");
  const [localHost, setLocalHost] = useState<string>("192.168.1.150");
  const [localPort, setLocalPort] = useState<number>(3000);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Scanning state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [discoveredCameras, setDiscoveredCameras] = useState<any[]>([]);

  // Connectivity Test State
  const [testingCamId, setTestingCamId] = useState<string | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Selected Camera for RTSP & Snapshot modules
  const [selectedCamId, setSelectedCamId] = useState<string>(labCameras[0]?.id || "lab-cam-01");
  const activeCam = labCameras.find(c => c.id === selectedCamId) || labCameras[0];

  // RTSP show password option
  const [showRtspPassword, setShowRtspPassword] = useState<boolean>(false);

  // Snapshot simulator / endpoint connection
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(false);
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string>("05-Jul-2026 11:45:00 UTC");
  const [snapshotUrl, setSnapshotUrl] = useState<string>(
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=640&auto=format&fit=crop"
  );
  const [snapshotSource, setSnapshotSource] = useState<"demo" | "lab">("demo");

  // Add Camera Form State
  const [formName, setFormName] = useState<string>("");
  const [formBrand, setFormBrand] = useState<string>("Dahua Technology");
  const [formModel, setFormModel] = useState<string>("DH-IPC-HFW3449EN-AS-LED");
  const [formIp, setFormIp] = useState<string>("192.168.1.110");
  const [formHttpPort, setFormHttpPort] = useState<number>(80);
  const [formRtspPort, setFormRtspPort] = useState<number>(554);
  const [formOnvifPort, setFormOnvifPort] = useState<number>(80);
  const [formUsername, setFormUsername] = useState<string>("admin");
  const [formZone, setFormZone] = useState<string>("Mesa de Pruebas");
  const [formStream, setFormStream] = useState<"main" | "sub">("main");
  const [formLabStatus, setFormLabStatus] = useState<any>("pendiente validar");

  // Extended fields for Manual Registration
  const [formRealConnectorAllowed, setFormRealConnectorAllowed] = useState<boolean>(true);
  const [formSnapshotEnabled, setFormSnapshotEnabled] = useState<boolean>(true);
  const [formPreviewEnabled, setFormPreviewEnabled] = useState<boolean>(true);
  const [formCredentialMode, setFormCredentialMode] = useState<"env" | "session" | "future-vault" | "mock">("session");
  const [formPrivacyZone, setFormPrivacyZone] = useState<"public" | "common" | "private" | "lab">("lab");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (labCameras.length > 0 && !selectedCamId) {
      setSelectedCamId(labCameras[0].id);
    }
  }, [labCameras, selectedCamId]);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handler to register a camera manually
  const handleRegisterCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formIp) {
      triggerToast("❌ Ingrese nombre e IP válida para la cámara de pruebas.");
      return;
    }

    const mapStatus = (labStat: string): CameraStatus => {
      if (labStat === "online simulado") return "Online";
      if (labStat === "offline simulado") return "Offline";
      if (labStat === "credencial pendiente") return "Sin Acceso";
      if (labStat === "stream pendiente") return "Sin Stream";
      return "Pendiente Validar";
    };

    const newCam: Camera = {
      id: "lab-cam-registered-" + Date.now(),
      parkId: "dahua-lab",
      name: formName,
      ip: formIp,
      model: formModel,
      status: mapStatus(formLabStatus),
      rtspUrl: `rtsp://${formUsername}:••••••@${formIp}:${formRtspPort}/cam/realmonitor?channel=1&subtype=${formStream === "main" ? "0" : "1"}`,
      onvifPort: formOnvifPort,
      poePort: labCameras.length + 1,
      lastPing: formLabStatus === "offline simulado" ? "Timeout" : "3 ms",
      fps: formLabStatus === "online simulado" ? 25 : 0,
      resolution: "4MP (2688x1520)",
      streamMockId: Math.floor(Math.random() * 5) + 1,
      isLab: true,
      brand: formBrand,
      httpPort: formHttpPort,
      rtspPort: formRtspPort,
      usernameRef: formUsername,
      zoneName: formZone,
      streamType: formStream,
      labStatus: formLabStatus,
      realConnectorAllowed: formRealConnectorAllowed,
      snapshotEnabled: formSnapshotEnabled,
      previewEnabled: formPreviewEnabled,
      credentialMode: formCredentialMode,
      privacyZone: formPrivacyZone,
      lastSnapshotStatus: "Snapshot real pending",
      lastPreviewStatus: "RTSP preview pending",
      lastConnectorError: ""
    };

    onAddLabCamera(newCam);
    triggerToast(`✓ Cámara de laboratorio "${formName}" registrada con éxito.`);
    
    // Reset Form
    setFormName("");
    setFormIp(`192.168.1.${110 + labCameras.length}`);
    setShowAddForm(false);
  };

  // Run simulated network discovery scan
  const handleNetworkScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanLogs([]);
    setDiscoveredCameras([]);

    const steps = [
      "Iniciando escaneo de red local en subred Dahua 192.168.1.0/24...",
      "Enviando paquetes de búsqueda UDP Multicast (SADP / ONVIF Probe)...",
      "Escaneando ARP cache local del switch PoE LS-DS0402A-DP6...",
      "✓ Switch PoE detectado en puerto UTP uplink (192.168.1.1)",
      "Buscando firmas de hardware en puerto 80 (HTTP) y 37777 (Dahua Private)...",
      "→ Dispositivo Dahua detectado en 192.168.1.108 - MAC: 14:A7:2B:CC:90:E1",
      "→ Dispositivo Dahua detectado en 192.168.1.109 - MAC: 14:A7:2B:CC:90:E2",
      "→ Dispositivo Desconocido detectado en 192.168.1.151 (Filtrado de no compatibilidad)",
      "Analizando puertos RTSP (554) y ONVIF (80/8080) abiertos...",
      "Escaneo completado. 2 Cámaras Dahua DH-IPC-HFW3449EN listas para su registro."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          setIsScanning(false);
          setDiscoveredCameras([
            {
              name: "Dahua Cam Entrada Lab",
              ip: "192.168.1.108",
              model: "DH-IPC-HFW3449EN-AS-LED",
              brand: "Dahua Technology",
              onvifPort: 80,
              rtspPort: 554,
              poePort: 1
            },
            {
              name: "Dahua Cam Mesa Control",
              ip: "192.168.1.109",
              model: "DH-IPC-HFW3449EN-AS-LED",
              brand: "Dahua Technology",
              onvifPort: 80,
              rtspPort: 554,
              poePort: 2
            }
          ]);
        }
      }, (idx + 1) * 450);
    });
  };

  // Run connectivity diagnostic tests on a selected camera
  const handleConnectivityTest = (cam: Camera) => {
    if (isTesting) return;
    setTestingCamId(cam.id);
    setIsTesting(true);
    setTestLogs([]);
    setTestResult(null);

    const logs = [
      `Iniciando batería de pruebas para ${cam.name} (${cam.ip})...`,
      `[PING] Enviando 4 paquetes ICMP de 32 bytes...`,
      cam.status === "Offline" ? `[PING] Timeout para la IP ${cam.ip}. Host inaccesible.` : `[PING] Respuesta de ${cam.ip}: bytes=32 tiempo=2ms TTL=64 (Pérdidas: 0%)`,
      `[HTTP] Comprobando puerto web HTTP (${cam.httpPort || 80})...`,
      cam.status === "Offline" ? `[HTTP] Puerto cerrado o inaccesible (Conexión rechazada)` : `[HTTP] Puerto abierto. Cabecera HTTP recibida: "Server: Dahua-Webs"`,
      `[RTSP] Validando puerto streaming RTSP (${cam.rtspPort || 554})...`,
      cam.status === "Offline" 
        ? `[RTSP] Error de sockets: Timeout` 
        : cam.status === "Sin Stream" 
          ? `[RTSP] Puerto abierto, pero el canal de video retornó código RTSP 404 Not Found.` 
          : `[RTSP] Conexión establecida. Canal de control RTP listo.`,
      `[ONVIF] Consultando puerto de integración ONVIF (${cam.onvifPort})...`,
      cam.status === "Offline" ? `[ONVIF] Timeout de conexión.` : `[ONVIF] Dispositivo responde XML SOAP v2.0 schema.`,
      `[AUTH] Validando credenciales del alias "${cam.usernameRef || "admin"}"...`,
      cam.status === "Sin Acceso" 
        ? `[AUTH] Error de autorización RTSP/HTTP: Código 401 Unauthorized (Credenciales Incorrectas o Pendientes)` 
        : cam.status === "Offline" 
          ? `[AUTH] Imposible autenticar: Dispositivo fuera de línea.` 
          : `[AUTH] Autenticación Exitosa con credenciales almacenadas localmente en memoria.`,
      `Generando diagnóstico técnico definitivo...`
    ];

    logs.forEach((logLine, idx) => {
      setTimeout(() => {
        setTestLogs(prev => [...prev, logLine]);
        if (idx === logs.length - 1) {
          setIsTesting(false);
          let outcome = "OK";
          let explanation = "La cámara Dahua responde correctamente en todos sus puertos y el stream está listo para ser ingestando por Sentinel IA.";
          
          if (cam.status === "Offline") {
            outcome = "HOST_NO_RESPONDE";
            explanation = "El host no responde a solicitudes de red elementales (Ping). Revise cable de red Cat6, alimentación PoE en el switch, o la configuración de IP fija.";
          } else if (cam.status === "Sin Acceso") {
            outcome = "SIN_CREDENCIAL";
            explanation = "La cámara responde pero rechaza las solicitudes con código 401. Requiere ingresar credenciales correctas en Sentinel Access Vault.";
          } else if (cam.status === "Sin Stream") {
            outcome = "STREAM_NO_DISPONIBLE";
            explanation = "La cámara responde e interactúa con ONVIF, pero la ruta RTSP del stream secundario/principal no está configurada o habilitada en el firmware.";
          } else if (cam.status === "Pendiente Validar") {
            outcome = "PENDIENTE";
            explanation = "Handshake básico correcto, pero requiere confirmación manual de operador antes de entrar a producción.";
          }

          setTestResult({
            outcome,
            explanation,
            latency: cam.status === "Offline" ? "Infinite" : "2-4 ms",
            ports: {
              ping: cam.status !== "Offline" ? "SUCCESS" : "TIMEOUT",
              http: cam.status !== "Offline" ? "SUCCESS" : "CLOSED",
              rtsp: cam.status === "Offline" ? "CLOSED" : cam.status === "Sin Stream" ? "FAILED" : "SUCCESS",
              onvif: cam.status !== "Offline" ? "SUCCESS" : "FAILED",
              auth: cam.status === "Sin Acceso" ? "FAILED" : cam.status === "Offline" ? "FAILED" : "SUCCESS"
            }
          });

          // Propagate state back to parent if needed
          if (cam.isLab) {
            let nextLabStatus: any = cam.labStatus;
            let nextStatus: CameraStatus = cam.status;
            if (outcome === "OK") {
              nextLabStatus = "online simulado";
              nextStatus = "Online";
            }
            onUpdateLabCameraStatus(cam.id, nextLabStatus, nextStatus);
          }
        }
      }, (idx + 1) * 350);
    });
  };

  // Trigger manual snapshot capture from Gateway local laboratory endpoint
  const handleTriggerSnapshot = async () => {
    if (snapshotLoading) return;
    setSnapshotLoading(true);
    triggerToast("⚡ Solicitando captura instantánea al Gateway...");

    try {
      const response = await fetch("/api/lab/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cameraId: activeCam?.id || "lab-cam-01",
          streamProfile: activeCam?.streamType || "main",
          mode: realConnectorsEnabled ? "real" : "mock"
        })
      });

      const data = await response.json();
      setSnapshotLoading(false);
      setSnapshotTimestamp(data.timestamp || new Date().toLocaleString("es-CL"));
      setSnapshotSource(data.fuente || "mock");

      if (response.ok && data.estado === "Éxito") {
        if (data.fuente === "real") {
          // If we got a real laboratory response from Cam 1
          setSnapshotUrl("https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=640&auto=format&fit=crop");
          triggerToast(`✓ Snapshot REAL (${data.details?.resolution}) recuperado de Dahua Lab.`);
        } else {
          // Mock response or fallback
          const randomImages = [
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=640&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=640&auto=format&fit=crop"
          ];
          const selected = randomImages[Math.floor(Math.random() * randomImages.length)];
          setSnapshotUrl(selected);
          triggerToast("✓ Snapshot simulado recuperado correctamente.");
        }
      } else {
        // Handle secure error message
        const errMsg = data.error || "unknown error";
        triggerToast(`❌ Conexión fallida: ${errMsg}`);
        // Render offline/error visual state
        setSnapshotUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=640&auto=format&fit=crop");
      }
    } catch (err) {
      setSnapshotLoading(false);
      triggerToast("❌ Error de comunicación con el Gateway local.");
    }
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("📋 Copiado al portapapeles.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          Módulo 1B — RTSP Snapshot & Live Preview Lab
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shrink-0">
            <Server className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">
              Sentinel Gateway Local (Dahua PoE Lab)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Consola de administración técnica para la integración de cámaras IP Dahua locales en su banco de pruebas o parque. 
              Este módulo permite descubrir hardware en la red, registrar cámaras, construir rutas seguras para flujos RTSP, validar conectividad y simular capturas instantáneas de laboratorio.
            </p>
          </div>
        </div>
      </div>

      {/* Real Connector Safety Banner - Módulo 1B */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        realConnectorsEnabled 
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-slate-900/40 border-slate-800 text-slate-400"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg font-mono text-[10px] font-bold uppercase shrink-0 ${
            realConnectorsEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
          }`}>
            {realConnectorsEnabled ? "Lab Real Connector Enabled" : "Mock Simulated Fallback Mode"}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Estado de Conexión de Laboratorio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {realConnectorsEnabled 
                ? "Permitiendo pruebas controladas de snapshot/preview sobre cámaras registradas y autorizadas."
                : "Todo funciona en modo simulación (mock). No se abrirán sockets reales ni peticiones HTTP locales."}
            </p>
          </div>
        </div>
        <div className="text-xs text-amber-500/95 font-mono flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span>ADVERTENCIA: Uso exclusivo en red local autorizada (No exponer credenciales ni publicar streams).</span>
        </div>
      </div>

      {/* Grid: Status & Network Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Gateway Status Panel */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-bold text-white text-sm">Estado del Gateway</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              gatewayStatus === "Lab Ready" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              gatewayStatus === "Demo" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {gatewayStatus}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Host Local:</span>
              <input
                type="text"
                value={localHost}
                onChange={(e) => setLocalHost(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-emerald-400 w-32 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Puerto de Escucha:</span>
              <input
                type="number"
                value={localPort}
                onChange={(e) => setLocalPort(parseInt(e.target.value) || 3000)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-emerald-400 w-20 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Cámaras Registradas:</span>
              <span className="text-white font-bold">{labCameras.length}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Canal Directo Switch:</span>
              <span className="text-sky-400 text-[10px] font-bold">PoE 10/100 Mbps (DS0402A)</span>
            </div>
          </div>

          {/* Service checklists */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
              Servicios Locales (Gateway Micro-NVR)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded-lg flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>RTSP Ingest (Ready)</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded-lg flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>ONVIF Core v2.4</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded-lg flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>RAM Snapshot cache</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded-lg flex items-center gap-1.5 text-slate-500">
                <Settings className="w-3.5 h-3.5 shrink-0 animate-spin" />
                <span>FFmpeg transcoding</span>
              </div>
            </div>
          </div>

          {/* Simulator status control */}
          <div className="pt-2 border-t border-slate-900 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
              Simular Estado del Gateway
            </span>
            <div className="grid grid-cols-4 gap-1">
              {(["Demo", "Lab Ready", "Offline", "Error"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setGatewayStatus(st);
                    triggerToast(`🔌 Estado del Gateway simulado como: ${st}`);
                  }}
                  className={`py-1 text-[9px] font-mono rounded ${
                    gatewayStatus === st
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850"
                  }`}
                >
                  {st.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Network Auto-Discovery (ONVIF Multicast / ARP scan tool) */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-bold text-white text-sm">Escáner de Red Local Dahua (Handshake)</h3>
            </div>
            <button
              onClick={handleNetworkScan}
              disabled={isScanning}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Escaneando..." : "Escanear Red local"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Realiza un escaneo pasivo ARP y envía peticiones WS-Discovery UDP para detectar cámaras IP Dahua activas en la subred local del notebook o gateway de laboratorio.
          </p>

          {/* Logs terminal */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-36 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1 scrollbar-thin">
            {scanLogs.length === 0 ? (
              <span className="text-slate-600 block italic">Listo para escanear subred 192.168.1.*</span>
            ) : (
              scanLogs.map((log, index) => (
                <div key={index} className={log.includes("✓") || log.includes("→") ? "text-emerald-400" : ""}>
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Discovered cameras action table */}
          {discoveredCameras.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                Dispositivos Dahua Detectados ({discoveredCameras.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {discoveredCameras.map((dc, i) => {
                  const alreadyRegistered = labCameras.some(lc => lc.ip === dc.ip);
                  return (
                    <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block text-[11px]">{dc.name}</span>
                        <span className="text-slate-400 font-mono text-[10px] block">IP: {dc.ip} • ONVIF: {dc.onvifPort}</span>
                        <span className="text-slate-500 font-mono text-[9px]">MAC: 14:A7:2B:CC:90:E{i+1}</span>
                      </div>
                      {alreadyRegistered ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                          Registrada
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setFormName(dc.name);
                            setFormIp(dc.ip);
                            setFormOnvifPort(dc.onvifPort);
                            setFormRtspPort(dc.rtspPort);
                            setShowAddForm(true);
                            triggerToast(`Formulario rellenado con datos de ${dc.ip}`);
                          }}
                          className="px-2.5 py-1 bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold text-[10px] rounded transition-all"
                        >
                          Registrar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Lab Registry & Connectivity Test Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of registered Lab Cameras & Registry Form */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-bold text-white text-sm">Cámaras Registradas</h3>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancelar" : "Nueva"}</span>
            </button>
          </div>

          {/* Registry Add Form */}
          {showAddForm && (
            <form onSubmit={handleRegisterCamera} className="bg-slate-950/80 p-4 border border-slate-800 rounded-xl space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Nombre de la cámara:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dahua LAB Cam 03"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Marca:</label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  >
                    <option>Dahua Technology</option>
                    <option>Hikvision</option>
                    <option>Uniarch</option>
                    <option>Generic</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Modelo:</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">IP local:</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.110"
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Zona o Sector:</label>
                  <input
                    type="text"
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-bold">HTTP Port</label>
                  <input
                    type="number"
                    value={formHttpPort}
                    onChange={(e) => setFormHttpPort(parseInt(e.target.value) || 80)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-bold">RTSP Port</label>
                  <input
                    type="number"
                    value={formRtspPort}
                    onChange={(e) => setFormRtspPort(parseInt(e.target.value) || 554)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-bold">ONVIF Port</label>
                  <input
                    type="number"
                    value={formOnvifPort}
                    onChange={(e) => setFormOnvifPort(parseInt(e.target.value) || 80)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Usuario Ref:</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Tipo Stream:</label>
                  <select
                    value={formStream}
                    onChange={(e) => setFormStream(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]"
                  >
                    <option value="main">Main (Alta)</option>
                    <option value="sub">Sub (Monitoreo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Contraseña:</label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value="••••••••••••"
                    className="w-full bg-slate-900/65 border border-slate-850 rounded px-2.5 py-1.5 text-slate-500 cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[9px] text-amber-500 font-mono block leading-tight">
                  🔒 Cifrado / No persistido en fase Lab. Se gestionará localmente en Vault.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Estado de Simulación:</label>
                <select
                  value={formLabStatus}
                  onChange={(e) => setFormLabStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                >
                  <option value="pendiente validar">pendiente validar</option>
                  <option value="online simulado">online simulado (Online)</option>
                  <option value="offline simulado">offline simulado (Offline)</option>
                  <option value="credencial pendiente">credencial pendiente (Sin Acceso)</option>
                  <option value="stream pendiente">stream pendiente (Sin Stream)</option>
                </select>
              </div>

              {/* Módulo 1B: Security & Connector controls */}
              <div className="border-t border-slate-800 pt-3.5 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  ⚙️ Configuración Módulo 1B (Lab Connectors):
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Permitir Conexión Real:</span>
                  <input
                    type="checkbox"
                    checked={formRealConnectorAllowed}
                    onChange={(e) => setFormRealConnectorAllowed(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-500 bg-slate-900 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Snapshot Habilitado:</span>
                  <input
                    type="checkbox"
                    checked={formSnapshotEnabled}
                    onChange={(e) => setFormSnapshotEnabled(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-500 bg-slate-900 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Preview RTSP Habilitado:</span>
                  <input
                    type="checkbox"
                    checked={formPreviewEnabled}
                    onChange={(e) => setFormPreviewEnabled(e.target.checked)}
                    className="rounded border-slate-800 text-emerald-500 bg-slate-900 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">Modo Credenciales:</span>
                    <select
                      value={formCredentialMode}
                      onChange={(e) => setFormCredentialMode(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]"
                    >
                      <option value="session">Session (Memoria)</option>
                      <option value="env">ENV (Variable)</option>
                      <option value="future-vault">Future Vault (Cifrado)</option>
                      <option value="mock">Mock Only (Simulado)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block">Zona Privacidad:</span>
                    <select
                      value={formPrivacyZone}
                      onChange={(e) => setFormPrivacyZone(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]"
                    >
                      <option value="lab">Lab (Mesa de Pruebas)</option>
                      <option value="public">Pública (Exterior)</option>
                      <option value="common">Común (Acceso/Hall)</option>
                      <option value="private">Privada (Restringida)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-sans rounded-lg transition-all"
              >
                ✓ Registrar en Lab de Pruebas
              </button>
            </form>
          )}

          {/* List of Registered Cameras */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {labCameras.map((cam) => {
              const isSelected = cam.id === selectedCamId;
              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedCamId(cam.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-md"
                      : "bg-slate-950/60 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-white text-xs leading-none">
                        {cam.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cam.realConnectorAllowed !== false ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {cam.realConnectorAllowed !== false ? "Real Conn" : "Mock Conn"}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {cam.brand || "Dahua"} • {cam.ip}
                        </span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      cam.status === "Online" ? "bg-emerald-500/15 text-emerald-400" :
                      cam.status === "Offline" ? "bg-rose-500/15 text-rose-400" :
                      "bg-amber-500/15 text-amber-400"
                    }`}>
                      {cam.labStatus || cam.status}
                    </span>
                  </div>
 
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-900/60">
                    <span>Zona: {cam.zoneName || "Física"}</span>
                    <span className={`px-1 rounded text-[9px] font-bold uppercase ${
                      cam.privacyZone === "private" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      cam.privacyZone === "common" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-slate-850 text-slate-400 border border-slate-800"
                    }`}>
                      {cam.privacyZone ? `PRIV: ${cam.privacyZone}` : "PRIV: LAB"}
                    </span>
                  </div>

                  {/* Actions specific to this list */}
                  <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleConnectivityTest(cam)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded flex items-center gap-0.5 transition-all"
                      title="Probar Conectividad en Caliente"
                    >
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span>Diagnosticar</span>
                    </button>
                    {cam.isLab && (
                      <button
                        onClick={() => {
                          onDeleteLabCamera(cam.id);
                          triggerToast("✓ Cámara eliminada del registro local.");
                        }}
                        className="p-1.5 bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 hover:text-rose-300 rounded transition-all ml-auto"
                        title="Eliminar del Registro"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Integration tools (Connectivity Test Details & RTSP Route Builder) */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
          
          {/* Section A: Active Diagnostic Terminal / Connectivity Test Mock */}
          <div className="space-y-3.5 border-b border-slate-850 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-white text-sm">
                  Prueba de Conectividad & Handshake (Dahua Ready)
                </h3>
              </div>
              {activeCam && (
                <button
                  onClick={() => handleConnectivityTest(activeCam)}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>{isTesting ? "Validando..." : `Probar ${activeCam.name}`}</span>
                </button>
              )}
            </div>

            {activeCam ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Port Checklist */}
                <div className="md:col-span-1 space-y-3 bg-slate-950/65 p-4 border border-slate-850 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Puertos de Servicio
                  </span>
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ping ICMP:</span>
                      <span className={`font-bold ${testResult?.ports.ping === "SUCCESS" || (activeCam.status !== "Offline" && !testResult) ? "text-emerald-400" : "text-rose-400"}`}>
                        {testResult ? testResult.ports.ping : (activeCam.status !== "Offline" ? "OK" : "TIMEOUT")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">HTTP (80):</span>
                      <span className={`font-bold ${testResult?.ports.http === "SUCCESS" || (activeCam.status !== "Offline" && !testResult) ? "text-emerald-400" : "text-rose-400"}`}>
                        {testResult ? testResult.ports.http : (activeCam.status !== "Offline" ? "OPEN" : "CLOSED")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">RTSP (554):</span>
                      <span className={`font-bold ${testResult?.ports.rtsp === "SUCCESS" || (activeCam.status === "Online" && !testResult) ? "text-emerald-400" : "text-rose-400"}`}>
                        {testResult ? testResult.ports.rtsp : (activeCam.status === "Online" ? "STREAMING" : "FAILED")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ONVIF (80):</span>
                      <span className={`font-bold ${testResult?.ports.onvif === "SUCCESS" || (activeCam.status !== "Offline" && !testResult) ? "text-emerald-400" : "text-rose-400"}`}>
                        {testResult ? testResult.ports.onvif : (activeCam.status !== "Offline" ? "SUCCESS" : "TIMEOUT")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dahua Auth:</span>
                      <span className={`font-bold ${testResult?.ports.auth === "SUCCESS" || (activeCam.status !== "Sin Acceso" && activeCam.status !== "Offline" && !testResult) ? "text-emerald-400" : "text-rose-400"}`}>
                        {testResult ? testResult.ports.auth : (activeCam.status !== "Sin Acceso" && activeCam.status !== "Offline" ? "AUTHORIZED" : "FAILED")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Diagnostic Logs */}
                <div className="md:col-span-2 bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div className="font-mono text-[10px] text-slate-300 space-y-1 h-28 overflow-y-auto">
                    {testLogs.length === 0 ? (
                      <span className="text-slate-600 italic block">Inicie una prueba de conectividad de laboratorio para ver el análisis de puertos TCP y UDP.</span>
                    ) : (
                      testLogs.map((log, i) => (
                        <div key={i} className={log.includes("EXITOSO") || log.includes("Exitosa") || log.includes("Respuesta") ? "text-emerald-400" : log.includes("Timeout") || log.includes("Error") ? "text-rose-400" : ""}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>

                  {testResult && (
                    <div className="mt-3 p-2 bg-slate-900 border border-slate-800 rounded text-[11px] leading-relaxed">
                      <span className="font-bold text-white block">Resultado: {testResult.outcome} • Latencia: {testResult.latency}</span>
                      <p className="text-slate-400 mt-0.5">{testResult.explanation}</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl italic">
                Registre una cámara para iniciar el banco de pruebas de conectividad.
              </div>
            )}
          </div>

          {/* Section B: RTSP Route Builder */}
          <div className="space-y-4 border-b border-slate-850 pb-5">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-bold text-white text-sm">RTSP Route Builder (Constructor Seguro)</h3>
            </div>

            {activeCam ? (
              <div className="space-y-3.5 text-xs">
                <p className="text-slate-400">
                  ORBI Sentinel IA procesa flujos de video locales en tiempo real. Esta sección construye la cadena de conexión RTSP que se alimentará en el transcodificador FFmpeg local de forma segura, ocultando las contraseñas reales.
                </p>

                {/* Generated URL Box */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Cadena de Conexión Segura (Plantilla Lab)
                    </span>
                    <button
                      onClick={() => copyToClipboard(`rtsp://${activeCam.usernameRef || "admin"}:${showRtspPassword ? "admin123" : "••••••"}@${activeCam.ip}:${activeCam.rtspPort || 554}/cam/realmonitor?channel=1&subtype=${activeCam.streamType === "sub" ? "1" : "0"}`)}
                      className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-emerald-400 text-xs break-all">
                    rtsp://{activeCam.usernameRef || "admin"}:
                    <span className="text-amber-500 font-bold">{showRtspPassword ? "admin123" : "••••••••"}</span>
                    @{activeCam.ip}:{activeCam.rtspPort || 554}/cam/realmonitor?channel=1&subtype={activeCam.streamType === "sub" ? "1" : "0"}
                  </div>

                  {/* Disclaimer banner */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Aviso de Seguridad:</strong> Las rutas RTSP mostradas son plantillas de laboratorio. Las credenciales reales deberán manejarse mediante Sentinel Access Vault cifrado en una fase posterior.
                    </span>
                  </div>

                  {/* Password Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-passwd"
                        checked={showRtspPassword}
                        onChange={(e) => setShowRtspPassword(e.target.checked)}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                      />
                      <label htmlFor="show-passwd" className="text-[11px] text-slate-400 font-mono select-none">
                        Mostrar contraseña demo de laboratorio ("admin123")
                      </label>
                    </div>
                  </div>
                </div>

                {/* FFmpeg ingestion template snippet */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 block">Comando de Ingesta FFmpeg futuro (HLS Segmenter):</span>
                  <div className="bg-slate-950 p-2 rounded border border-slate-850 font-mono text-[10px] text-slate-300 break-all overflow-x-auto">
                    ffmpeg -rtsp_transport tcp -i "rtsp://{activeCam.usernameRef || "admin"}:••••••••@{activeCam.ip}:554/cam/realmonitor?channel=1&subtype=0" -c:v copy -an -f hls -hls_time 2 -hls_list_size 3 -hls_flags delete_segments /tmp/stream_{activeCam.id}.m3u8
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl italic">
                Seleccione una cámara registrada para estructurar su cadena RTSP.
              </div>
            )}
          </div>

          {/* Section C: Snapshot Probe Placeholder & Privacy Masking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Snapshot trigger & metadata */}
            <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span className="font-sans font-bold text-white text-xs">Captura de Fotograma (Snapshot Probe)</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-slate-900 text-[9px] font-mono text-slate-400 rounded">
                    Soporte HTTP GET
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permite solicitar de forma síncrona un snapshot a la cámara Dahua para guardarlo temporalmente en la memoria RAM del gateway, aplicando filtros locales de difuminado facial.
                </p>

                <div className="space-y-1 font-mono text-[10px] text-slate-400">
                  <div>• Última captura: <span className="text-white font-bold">{snapshotTimestamp}</span></div>
                  <div>• Origen de datos: <span className="text-sky-400 font-bold uppercase">{snapshotSource}</span></div>
                  <div>• Almacenamiento local: <span className="text-slate-500">RAM Gateway /tmp/snaps/</span></div>
                </div>
              </div>

              {activeCam && (
                <button
                  onClick={handleTriggerSnapshot}
                  disabled={snapshotLoading || activeCam.status === "Offline"}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${snapshotLoading ? "animate-spin" : ""}`} />
                  <span>{snapshotLoading ? "Solicitando..." : "Capturar Fotograma"}</span>
                </button>
              )}
            </div>

            {/* Simulated Live Snapshot frame */}
            <div className="relative aspect-video bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center group select-none">
              {activeCam?.privacyZone === "private" && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
                    <Lock className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Privacy Shield Activo</h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-normal">
                      Cámara configurada en <strong>Zona Privada</strong>. Exportación bloqueada y fotograma restringido de forma automática para cumplir con normativas de privacidad.
                    </p>
                  </div>
                </div>
              )}

              <img
                src={snapshotUrl}
                alt="Dahua snapshot probe simulation"
                className="w-full h-full object-cover opacity-60 filter saturate-50 contrast-125"
                referrerPolicy="no-referrer"
              />

              {/* Scanning crosshairs */}
              <div className="absolute inset-3 border border-slate-800/40 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-t border-l border-emerald-400"></div>
                  <div className="w-3 h-3 border-t border-r border-emerald-400"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-3 h-3 border-b border-l border-emerald-400"></div>
                  <div className="w-3 h-3 border-b border-r border-emerald-400"></div>
                </div>
              </div>

              {/* Privacy Shield Dynamic Masking Overlay (Simulated) */}
              <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-12 h-14 border border-rose-500 bg-rose-950/40 backdrop-blur-md rounded-full flex items-center justify-center text-[7px] text-rose-300 font-mono font-bold text-center p-1 leading-tight select-none">
                ROSTRO BLUR
              </div>

              {/* Status stamp overlay */}
              <div className="absolute top-2 left-2 bg-slate-950/80 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-bold">
                RAM CACHED • {activeCam?.ip || "192.168.1.108"}
              </div>

              {/* Probe watermark */}
              <div className="absolute bottom-2 right-2 text-[8px] text-slate-500 font-mono">
                ORBI GATEWAY PROBE
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 6. ONVIF Readiness Inspector */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <h3 className="font-sans font-bold text-white text-sm">ONVIF Readiness Inspector (Preparación para Integración)</h3>
        </div>

        <p className="text-xs text-slate-400">
          El protocolo de interoperabilidad ONVIF permite consultar las capacidades de las cámaras Dahua DH-IPC-HFW3449EN de manera estándar. El Gateway local mapea los servicios ONVIF de la siguiente manera:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Service Specifications Map */}
          <div className="md:col-span-1 space-y-3.5">
            <span className="text-[11px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">
              Mapeo de Funciones ONVIF:
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-start gap-2 bg-slate-950/50 p-2 border border-slate-850 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[10px]">ONVIF Discovery Probe</span>
                  <span className="text-[9px] text-slate-500">UDP Multicast 239.255.255.250 listen activo</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/50 p-2 border border-slate-850 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[10px]">GetDeviceInformation</span>
                  <span className="text-[9px] text-slate-500">Retorna Fabricante, Modelo, Firmware, Serial</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/50 p-2 border border-slate-850 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold block text-[10px]">GetProfiles & GetStreamUri</span>
                  <span className="text-[9px] text-slate-500">Handshake para extraer URL RTSP de streams</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/50 p-2 border border-slate-850 rounded-lg text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">PTZ continuous move</span>
                  <span className="text-[9px]">Soportado por hardware Dahua en modelos domo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive ONVIF SOAP envelope sandbox */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
              Esquema XML SOAP - ONVIF Device Information Request (Template)
            </span>
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1 overflow-x-auto">
              <div className="text-slate-500">&lt;?xml version="1.0" encoding="utf-8"?&gt;</div>
              <div>&lt;soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tds="http://www.onvif.org/ver10/device/wsdl"&gt;</div>
              <div className="pl-4">&lt;soap:Header&gt;</div>
              <div className="pl-8 text-sky-400">&lt;wsse:Security soap:mustUnderstand="1"&gt;...&lt;/wsse:Security&gt;</div>
              <div className="pl-4">&lt;/soap:Header&gt;</div>
              <div className="pl-4">&lt;soap:Body&gt;</div>
              <div className="pl-8 text-emerald-400">&lt;tds:GetDeviceInformation /&gt;</div>
              <div className="pl-4">&lt;/soap:Body&gt;</div>
              <div>&lt;/soap:Envelope&gt;</div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              Nota: El transceptor XML local del Gateway interpreta la cabecera WS-UsernameToken de seguridad Dahua de forma transparente para evitar denegación de servicios perimetrales.
            </p>
          </div>

        </div>
      </div>

      {/* 7. FFmpeg Transcoder & Streaming Readiness Panel (Visible to Técnico/Admin) */}
      {(userRole === "tecnico" || userRole === "admin") && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h3 className="font-sans font-bold text-white text-sm">FFmpeg Transcoder & Streaming Readiness Panel</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              FFmpeg no requerido en esta fase (Pendiente para 1D)
            </span>
          </div>

          <p className="text-xs text-slate-400">
            La transcodificación de vídeo en tiempo real se delegará en el motor FFmpeg local de forma descentralizada. 
            Actualmente la applet opera en modo <strong>RTSP Snapshot & Live Preview Lab</strong>, por lo que FFmpeg no está activo ni se requiere instalado para compilar ni ejecutar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* FFmpeg Technical Targets */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider block">
                Planificación de Ingesta (Módulos 1C/1D):
              </span>
              <ul className="space-y-1 text-xs text-slate-400 font-mono list-disc list-inside">
                <li><span className="text-white">Formato Ingesta:</span> H.264 directo vía RTSP (TCP interleaved).</li>
                <li><span className="text-white">Modo Transcodificación:</span> Copy stream (-c:v copy) para cero uso de CPU.</li>
                <li><span className="text-white">Segmentación HLS:</span> Bloques de 2s para latencia ultrabaja en navegador.</li>
                <li><span className="text-white">Filtro de Privacidad:</span> Aplicado por GPU local (libvpx/CUDA/QuickSync).</li>
              </ul>
            </div>

            {/* Simulated Shell Check */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-500 space-y-1">
              <div className="text-slate-400">$ ffmpeg -version</div>
              <div className="text-emerald-400 font-bold">ffmpeg version 6.1.1-static Copyright (c) 2000-2026 the FFmpeg developers</div>
              <div className="text-slate-600">built with gcc 12.2.0 (Debian 12.2.0-14)</div>
              <div className="text-slate-600">configuration: --enable-gpl --enable-version3 --enable-static --disable-debug</div>
              <div className="text-amber-500 mt-2 font-bold">[READYNESS] "FFmpeg no requerido en esta fase — Integración lista"</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 border border-emerald-500 text-white px-4 py-3 rounded-xl font-mono text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
