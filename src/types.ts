export type CameraStatus =
  | "Online"
  | "Offline"
  | "Intermitente"
  | "Sin Acceso"
  | "Sin Stream"
  | "Pendiente Validar";

export interface Telemetry {
  poeSwitchStatus: string;
  wirelessLinkSignal: string; // e.g. "-65 dBm (Excelente)", "PÃ©rdida por rotaciÃ³n"
  trackerAngle: string; // e.g. "+45Â°", "-12Â°"
  poeVoltage: string; // e.g. "48.2 V"
  pingStatus: string; // e.g. "4 ms (0% pÃ©rdidas)"
}

export interface Park {
  id: string;
  name: string;
  location: string;
  capacity: string;
  trackerModel: string;
  description: string;
  cctvVendor: string;
  diagnosticsCase: string;
  telemetry: Telemetry;
}

export interface Camera {
  id: string;
  parkId: string;
  name: string;
  ip: string;
  model: string;
  status: CameraStatus;
  rtspUrl: string;
  onvifPort: number;
  poePort: number;
  lastPing: string;
  fps: number;
  resolution: string;
  streamMockId: number; // For rendering simulated live video canvas
  isLab?: boolean;
  brand?: string;
  httpPort?: number;
  rtspPort?: number;
  usernameRef?: string;
  zoneName?: string;
  streamType?: "main" | "sub";
  labStatus?: "pendiente validar" | "online simulado" | "offline simulado" | "credencial pendiente" | "stream pendiente";
  realConnectorAllowed?: boolean;
  snapshotEnabled?: boolean;
  previewEnabled?: boolean;
  credentialMode?: "env" | "session" | "future-vault" | "mock";
  lastSnapshotStatus?: string;
  lastPreviewStatus?: string;
  lastConnectorError?: string;
  privacyZone?: "public" | "common" | "private" | "lab";
  healthScore?: number;
  healthStatus?: "Healthy" | "Partial" | "Offline" | "Auth Required" | "Stream Pending" | "Snapshot Pending" | "ONVIF Pending" | "Connector Disabled" | "Privacy Restricted" | "Unknown";
  lastSuccessfulCheck?: string;
  lastFailedCheck?: string;
  hostReachable?: boolean;
  httpReachable?: boolean;
  rtspReachable?: boolean;
  onvifReachable?: boolean;
  authStatus?: "OK" | "Unauthorized" | "Pending";
  latencyEstimate?: string;
}

export interface Credential {
  id: string;
  target: string; // "Cámara 01", "Switch PoE", "NVR principal"
  parkId: string;
  username: string;
  passwordMasked: string;
  status: "Cifrado" | "Pendiente" | "Verificado";
  lastUpdated: string;
  notes: string;
}

export interface MotionEvent {
  id: string;
  timestamp: string;
  parkId: string;
  cameraName: string;
  type: "Persona" | "Vehículo" | "Intrusión" | "Animal" | "Movimiento General";
  confidence: number;
  description: string;
  processed: boolean;
  intensity: "Bajo" | "Medio" | "Crítico";
  zoneName?: string;
  licensePlate?: string | null;
  faceIdentity?: string | null;
  lumiaAction?: string;
  lumiaSpeech?: string;
}

export interface VersionRegistry {
  version: string;
  codename: string;
  releaseDate: string;
  equipment: string[];
  capabilities: string[];
  statusNote?: string;
}

export type IncidentType =
  | "Persona sospechosa"
  | "Vehículo detenido"
  | "Portón abierto"
  | "Movimiento fuera de horario"
  | "Cámara sin señal"
  | "Mascota/animal"
  | "Otro";

export type IncidentStatus = "Abierto" | "En revisión" | "Cerrado";

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  actorRole: string;
  actorAlias: string;
  clipId: string;
  incidentId?: string;
  action: string;
  result: "success" | "blocked" | "failed" | "warning";
  reason: string;
  source: "mock" | "lab real";
}

export interface Clip {
  id: string;
  cameraName: string;
  cameraIp?: string;
  timestampStart: string;
  timestampEnd: string;
  duration: string;
  sizeEstimate: string; // e.g. "185 MB"
  source: "mock" | "lab real pending" | "lab real";
  type: "continuo" | "evento" | "snapshot" | "incidente";
  status: "disponible" | "protegido" | "expirado" | "bloqueado por privacidad" | "pendiente" | "eliminado_simulado";
  associatedIncidentId?: string;
  description?: string;
  privacyZone?: string;
  
  // MÃ³dulo 1G Lifecycle Extensions
  lifecycleState?: 
    | "Temporary Clip"
    | "Incident Linked"
    | "Protected Evidence"
    | "Export Package Generated"
    | "Expired"
    | "Pending Deletion"
    | "Deletion Blocked"
    | "Privacy Locked"
    | "Missing File"
    | "Integrity Pending"
    | "Integrity Verified";
  retentionPolicy?: "1_day" | "3_days" | "7_days" | "15_days" | "30_days" | "manual" | "protected";
  protectedEvidence?: boolean;
  deletionBlocked?: boolean;
  sha256?: string;
  integrityStatus?: "pending" | "verified" | "failed";
  exportStatus?: "locked" | "approved" | "exported";
  packageId?: string;
  exportTimestamp?: string;
  exportActorRole?: string;
  ageDays?: number;
  remainingDays?: number; // positive number or negative if expired
  auditTrail?: AuditEvent[];
}

export interface Incident {
  id: string;
  timestamp: string;
  cameraName: string;
  zoneName: string;
  type: IncidentType;
  status: IncidentStatus;
  observations: string;
  snapshotMockUrl?: string;
}

// === MÓDULO 17A: FRIGATE ENGINE & LUMIA VISION EXTENSIONS ===
export interface FrigatePoint {
  x: number; // Normalizado 0.0 a 1.0
  y: number; // Normalizado 0.0 a 1.0
}

export interface FrigateZone {
  id: string;
  name: string;
  cameraId: string;
  points: FrigatePoint[];
  triggerObjects: ("Persona" | "Vehículo" | "Animal")[];
  inertiaFrames: number;
  loiteringThresholdSec: number;
  lprEnabled: boolean;
  faceRecognitionEnabled: boolean;
  notifyLumia: boolean;
  color: string;
}

export interface LumiaVisionAnalysis {
  timestamp: string;
  zoneId: string;
  zoneName: string;
  detectedType: "Persona" | "Vehículo" | "Intrusión" | "Animal" | "Movimiento General";
  confidence: number;
  licensePlate?: string | null;
  faceIdentity?: string | null;
  lumiaAction: "HABLAR" | "SILENCIO";
  lumiaSpeech: string;
  technicalSummary: string;
  modelUsed: string;
  evalRateTokensSec?: number;
}
