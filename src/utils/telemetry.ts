export interface TelemetryEvent {
  id: string;
  timestamp: string;
  eventType:
    | "demo.session.started"
    | "demo.session.ended"
    | "publichub.opened"
    | "line.selected.field"
    | "line.selected.community"
    | "line.selected.consumer"
    | "guided.field.route.selected"
    | "guided.community.route.selected"
    | "audience.selected"
    | "screen.navigation.clicked"
    | "proposal.report.copied"
    | "media.script.generated"
    | "media.copy.allowed"
    | "media.copy.blocked"
    | "checklist.item.ready"
    | "checklist.item.blocked"
    | "launch.status.ready"
    | "launch.status.blocked"
    | "guardrails.viewed"
    | "export.sanitized.generated"
    | "data.reset.executed"
    | "blocked.event.rejected";
  metadata?: Record<string, any>;
  isSynthetic?: boolean;
}

// Strict allowlist and blocklist defined as per Módulo 5B specification
export const ALLOWED_EVENTS = [
  "demo.session.started",
  "demo.session.ended",
  "publichub.opened",
  "line.selected.field",
  "line.selected.community",
  "line.selected.consumer",
  "guided.field.route.selected",
  "guided.community.route.selected",
  "audience.selected",
  "screen.navigation.clicked",
  "proposal.report.copied",
  "media.script.generated",
  "media.copy.allowed",
  "media.copy.blocked",
  "checklist.item.ready",
  "checklist.item.blocked",
  "launch.status.ready",
  "launch.status.blocked",
  "guardrails.viewed",
  "export.sanitized.generated",
  "data.reset.executed",
  "blocked.event.rejected"
];

export const PROHIBITED_EVENTS = [
  "camera.stream.opened.real",
  "credential.entered",
  "ip.captured",
  "rtsp.captured",
  "user.identity.captured",
  "client.name.real",
  "gps.location.captured",
  "private.image.captured",
  "audio.captured",
  "biometric.data.captured"
];

// Pre-seeded sanitised offline telemetry data to simulate realistic usage history
const PRE_SEEDED_EVENTS: TelemetryEvent[] = [
  {
    id: "ev-01",
    timestamp: "2026-07-19T09:15:00Z",
    eventType: "demo.session.started",
    metadata: { version: "v0.4.3", environment: "local_sandbox" },
    isSynthetic: true
  },
  {
    id: "ev-02",
    timestamp: "2026-07-19T09:16:12Z",
    eventType: "publichub.opened",
    metadata: { tab: "publicdemohub", line: "field" },
    isSynthetic: true
  },
  {
    id: "ev-03",
    timestamp: "2026-07-19T09:18:24Z",
    eventType: "audience.selected",
    metadata: { audience: "Gerente O&M", line: "field" },
    isSynthetic: true
  },
  {
    id: "ev-04",
    timestamp: "2026-07-19T09:19:00Z",
    eventType: "guided.field.route.selected",
    metadata: { durationEstimate: "5m", routeId: "solar-om" },
    isSynthetic: true
  },
  {
    id: "ev-05",
    timestamp: "2026-07-19T09:24:10Z",
    eventType: "screen.navigation.clicked",
    metadata: { targetTab: "fieldoperations" },
    isSynthetic: true
  },
  {
    id: "ev-06",
    timestamp: "2026-07-19T09:25:30Z",
    eventType: "proposal.report.copied",
    metadata: { line: "field", scope: "1-3 cameras perimetrales" },
    isSynthetic: true
  },
  {
    id: "ev-07",
    timestamp: "2026-07-19T09:30:15Z",
    eventType: "demo.session.ended",
    metadata: { durationSeconds: 915 },
    isSynthetic: true
  },
  {
    id: "ev-08",
    timestamp: "2026-07-19T14:02:00Z",
    eventType: "demo.session.started",
    metadata: { version: "v0.4.3" },
    isSynthetic: true
  },
  {
    id: "ev-09",
    timestamp: "2026-07-19T14:03:10Z",
    eventType: "publichub.opened",
    metadata: { tab: "publicdemohub" },
    isSynthetic: true
  },
  {
    id: "ev-10",
    timestamp: "2026-07-19T14:03:55Z",
    eventType: "line.selected.community",
    metadata: { source: "sidebar_selector" },
    isSynthetic: true
  },
  {
    id: "ev-11",
    timestamp: "2026-07-19T14:04:15Z",
    eventType: "audience.selected",
    metadata: { audience: "Comité de condominio", line: "community" },
    isSynthetic: true
  },
  {
    id: "ev-12",
    timestamp: "2026-07-19T14:05:00Z",
    eventType: "guided.community.route.selected",
    metadata: { durationEstimate: "3m", routeId: "condominio-3m" },
    isSynthetic: true
  },
  {
    id: "ev-13",
    timestamp: "2026-07-19T14:08:45Z",
    eventType: "screen.navigation.clicked",
    metadata: { targetTab: "communitypilot" },
    isSynthetic: true
  },
  {
    id: "ev-14",
    timestamp: "2026-07-19T14:10:12Z",
    eventType: "guardrails.viewed",
    metadata: { rule: "Privacy By Design - Pixelation" },
    isSynthetic: true
  },
  {
    id: "ev-15",
    timestamp: "2026-07-19T14:12:30Z",
    eventType: "screen.navigation.clicked",
    metadata: { targetTab: "mediakit" },
    isSynthetic: true
  },
  {
    id: "ev-16",
    timestamp: "2026-07-19T14:13:20Z",
    eventType: "media.script.generated",
    metadata: { duration: "30s", format: "pitch" },
    isSynthetic: true
  },
  {
    id: "ev-17",
    timestamp: "2026-07-19T14:14:05Z",
    eventType: "media.copy.allowed",
    metadata: { type: "guion-comercial-30s" },
    isSynthetic: true
  },
  {
    id: "ev-18",
    timestamp: "2026-07-19T14:16:10Z",
    eventType: "checklist.item.blocked",
    metadata: { key: "noRealDataVisible", value: false },
    isSynthetic: true
  },
  {
    id: "ev-19",
    timestamp: "2026-07-19T14:16:11Z",
    eventType: "launch.status.blocked",
    metadata: { reason: "checklist_incomplete" },
    isSynthetic: true
  },
  {
    id: "ev-20",
    timestamp: "2026-07-19T14:16:18Z",
    eventType: "media.copy.blocked",
    metadata: { targetId: "stakeholder-om", cause: "Media Blocked activated" },
    isSynthetic: true
  },
  {
    id: "ev-21",
    timestamp: "2026-07-19T14:18:40Z",
    eventType: "checklist.item.ready",
    metadata: { key: "noRealDataVisible", value: true },
    isSynthetic: true
  },
  {
    id: "ev-22",
    timestamp: "2026-07-19T14:18:45Z",
    eventType: "launch.status.ready",
    metadata: { state: "validated_responsible" },
    isSynthetic: true
  },
  {
    id: "ev-23",
    timestamp: "2026-07-19T14:19:02Z",
    eventType: "media.copy.allowed",
    metadata: { type: "stakeholder-om" },
    isSynthetic: true
  },
  {
    id: "ev-24",
    timestamp: "2026-07-19T14:22:15Z",
    eventType: "demo.session.ended",
    metadata: { durationSeconds: 1215 },
    isSynthetic: true
  },
  {
    id: "ev-25",
    timestamp: "2026-07-20T08:30:00Z",
    eventType: "demo.session.started",
    metadata: { version: "v0.4.3" },
    isSynthetic: true
  },
  {
    id: "ev-26",
    timestamp: "2026-07-20T08:31:05Z",
    eventType: "line.selected.consumer",
    metadata: { source: "sidebar" },
    isSynthetic: true
  },
  {
    id: "ev-27",
    timestamp: "2026-07-20T08:33:12Z",
    eventType: "screen.navigation.clicked",
    metadata: { targetTab: "consumerbridge" },
    isSynthetic: true
  },
  {
    id: "ev-28",
    timestamp: "2026-07-20T08:35:40Z",
    eventType: "guardrails.viewed",
    metadata: { rule: "RTSP Validation Sandboxed" },
    isSynthetic: true
  },
  {
    id: "ev-29",
    timestamp: "2026-07-20T08:42:15Z",
    eventType: "demo.session.ended",
    metadata: { durationSeconds: 735 },
    isSynthetic: true
  },
  {
    id: "ev-30",
    timestamp: "2026-07-20T11:20:00Z",
    eventType: "demo.session.started",
    metadata: { version: "v0.4.3" },
    isSynthetic: true
  },
  {
    id: "ev-31",
    timestamp: "2026-07-20T11:21:10Z",
    eventType: "publichub.opened",
    metadata: { tab: "publicdemohub" },
    isSynthetic: true
  },
  {
    id: "ev-32",
    timestamp: "2026-07-20T11:23:45Z",
    eventType: "audience.selected",
    metadata: { audience: "Inversionista / socio", line: "field" },
    isSynthetic: true
  },
  {
    id: "ev-33",
    timestamp: "2026-07-20T11:24:30Z",
    eventType: "screen.navigation.clicked",
    metadata: { targetTab: "mediakit" },
    isSynthetic: true
  },
  {
    id: "ev-34",
    timestamp: "2026-07-20T11:26:00Z",
    eventType: "media.script.generated",
    metadata: { duration: "90s", format: "tech" },
    isSynthetic: true
  },
  {
    id: "ev-35",
    timestamp: "2026-07-20T11:26:50Z",
    eventType: "media.copy.allowed",
    metadata: { type: "guion-comercial-90s" },
    isSynthetic: true
  },
  {
    id: "ev-36",
    timestamp: "2026-07-20T11:32:15Z",
    eventType: "demo.session.ended",
    metadata: { durationSeconds: 735 },
    isSynthetic: true
  }
];

const LOCAL_STORAGE_KEY = "ORBI_SENTINEL_LOCAL_TELEMETRY";

export function getLocalEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Seed initial data so that dashboard is immediately interesting and functional
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(PRE_SEEDED_EVENTS));
      return PRE_SEEDED_EVENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local telemetry events", err);
    return PRE_SEEDED_EVENTS;
  }
}

export function saveLocalEvents(events: TelemetryEvent[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save local telemetry events", err);
  }
}

export function trackLocalEvent(
  eventType: TelemetryEvent["eventType"],
  metadata?: Record<string, any>
): void {
  try {
    const events = getLocalEvents();
    
    // Check if event is prohibited or not in allowlist
    const isProhibited = PROHIBITED_EVENTS.includes(eventType as string);
    const isAllowed = ALLOWED_EVENTS.includes(eventType as string);

    if (isProhibited || !isAllowed) {
      const rejectedEvent: TelemetryEvent = {
        id: "ev-" + Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        eventType: "blocked.event.rejected",
        metadata: {
          originalType: eventType,
          reason: "Event blocked by strict privacy audit lock policies",
          sanitizedAt: new Date().toISOString()
        }
      };
      events.push(rejectedEvent);
      saveLocalEvents(events);
      window.dispatchEvent(new CustomEvent("orbi-telemetry-updated"));
      return;
    }

    // Sanitize metadata to satisfy Local Storage QA:
    // No debe almacenar: IPs, RTSP, Credenciales, Tokens, Emails, Teléfonos, Nombres reales...
    const sanitizedMetadata: Record<string, any> = {};
    if (metadata) {
      const forbiddenKeys = [
        "ip", "rtsp", "credential", "password", "token", "email", "phone", 
        "name", "real", "gps", "location", "coordinate", "camera", "image", "audio", "biometric"
      ];
      
      for (const [key, val] of Object.entries(metadata)) {
        const isForbiddenKey = forbiddenKeys.some(fk => key.toLowerCase().includes(fk));
        if (isForbiddenKey) {
          sanitizedMetadata[key] = "[SANITIZED_SENSITIVE_KEY_BLOCKED]";
          continue;
        }

        if (typeof val === "string") {
          // PII regex patterns
          const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(val);
          const hasIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(val);
          const hasRTSP = /rtsp:\/\//i.test(val);
          const hasPhone = /(\+?\d{1,4}[-.\s]??)?[2-9]\d{2}[-.\s]??\d{3}[-.\s]??\d{4}\b/.test(val);
          
          if (hasEmail || hasIP || hasRTSP || hasPhone) {
            sanitizedMetadata[key] = "[SANITIZED_PII_BLOCKED]";
          } else {
            sanitizedMetadata[key] = val;
          }
        } else {
          sanitizedMetadata[key] = val;
        }
      }
    }

    const newEvent: TelemetryEvent = {
      id: "ev-" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      eventType,
      metadata: sanitizedMetadata
    };
    events.push(newEvent);
    saveLocalEvents(events);
    
    // Dispatch a custom window event so open dashboards can update reactively
    window.dispatchEvent(new CustomEvent("orbi-telemetry-updated"));
  } catch (err) {
    console.error("Failed to track local telemetry event", err);
  }
}

export function resetTelemetry(): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(PRE_SEEDED_EVENTS));
    window.dispatchEvent(new CustomEvent("orbi-telemetry-updated"));
  } catch (err) {
    console.error("Failed to reset telemetry", err);
  }
}

export function purgeTelemetry(): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("orbi-telemetry-updated"));
  } catch (err) {
    console.error("Failed to purge telemetry", err);
  }
}
