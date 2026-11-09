import React, { useState } from "react";
import { Credential, Park } from "../types";
import { KeyRound, ShieldAlert, CheckCircle, Search, Clipboard, Lock, Eye, EyeOff, FileKey } from "lucide-react";

interface AccessVaultProps {
  credentials: Credential[];
  parks: Park[];
  isDemoMode: boolean;
}

export default function AccessVault({ credentials, parks, isDemoMode }: AccessVaultProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [unveiledId, setUnveiledId] = useState<string | null>(null);

  // Filtered credentials list
  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || cred.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getParkName = (parkId: string) => {
    const park = parks.find((p) => p.id === parkId);
    return park ? park.name : "Laboratorio General";
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleUnveil = (id: string) => {
    if (unveiledId === id) {
      setUnveiledId(null);
    } else {
      setUnveiledId(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Security Banner */}
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest rounded-bl-xl">
          Fase Lab: Bóveda de Simulación
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-sans font-semibold text-white">Sentinel Access Vault (Resguardo de Credenciales)</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
                <strong>Simulador Seguro:</strong> Esta consola representa visualmente la bóveda de claves locales. Las contraseñas de cámaras mostradas son valores de laboratorio de demostración. 
                <span className="text-emerald-400"> No se implementa almacenamiento en la nube ni cifrado real AES-256 en producción en esta compilación preliminar.</span>
              </p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-850 flex items-center gap-2 select-none">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 font-bold">VISTA SANDBOX PROTOTIPO</span>
          </div>
        </div>
      </div>

      {/* Control Actions & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/20 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por equipo, usuario o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Estado Auditoría:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Ver Todos</option>
            <option value="Verificado">Verificado (Seguro)</option>
            <option value="Pendiente">Pendiente Auditoría</option>
          </select>
        </div>
      </div>

      {/* Credentials Table / List */}
      <div className="bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Equipo / Target</th>
                <th className="py-3.5 px-5">Parque Solar</th>
                <th className="py-3.5 px-5">Usuario RTSP</th>
                <th className="py-3.5 px-5">Clave de Enlace</th>
                <th className="py-3.5 px-5">Auditoría</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCredentials.length > 0 ? (
                filteredCredentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-950 border border-slate-800 rounded text-slate-400">
                          <FileKey className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{cred.target}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Última Auditoría: {cred.lastUpdated}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-sans">
                      {getParkName(cred.parkId)}
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-mono font-semibold">
                      {cred.username}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded border ${
                          cred.status === "Verificado"
                            ? "bg-slate-950 text-slate-400 border-slate-800"
                            : "bg-rose-950/20 text-rose-400 border-rose-900/30"
                        }`}>
                          {unveiledId === cred.id
                            ? (cred.parkId === "dahua-lab" ? "dahua_poe_2026" : "orbi_sentinel_pwd_99")
                            : cred.passwordMasked}
                        </span>
                        <button
                          onClick={() => toggleUnveil(cred.id)}
                          className="text-slate-500 hover:text-white transition-colors p-1"
                          title="Revelar temporalmente"
                        >
                          {unveiledId === cred.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                        cred.status === "Verificado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cred.status === "Verificado" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
                        {cred.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleCopy(cred.id, cred.username)}
                        className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 font-mono text-[10px] transition-all inline-flex items-center gap-1 mr-2 border border-transparent hover:border-slate-800"
                        title="Copiar usuario"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>User</span>
                      </button>

                      <button
                        onClick={() => handleCopy(cred.id, cred.parkId === "dahua-lab" ? "dahua_poe_2026" : "orbi_sentinel_pwd_99")}
                        className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 font-mono text-[10px] transition-all inline-flex items-center gap-1 border border-transparent hover:border-slate-800"
                        title="Copiar clave temporal"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>{copiedId === cred.id ? "Copiado!" : "Pass"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                    Ninguna credencial coincide con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Mock */}
      <div className="p-5 bg-slate-900/20 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400 space-y-2">
        <div className="text-white font-semibold text-xs mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          REGISTRO DE ACCESOS Y AUDITORÍA DE CLAVES (SENTINEL VAULT LOGS)
        </div>
        <div>[2026-07-05 10:12:05] - <span className="text-emerald-400">SUCCESS:</span> Verificación de clave para Dahua LAB Cam East [192.168.1.108] - Estado: Conexión RTSP exitosa.</div>
        <div>[2026-07-05 09:14:12] - <span className="text-amber-400">WARNING:</span> Intento de streaming fallido en Alto Bella Vista. Código 401 (Credenciales desactualizadas).</div>
        <div>[2026-07-05 08:00:00] - <span className="text-slate-300">INFO:</span> Auditoría automática diaria completada. 5/7 credenciales encriptadas correctamente.</div>
      </div>
    </div>
  );
}
