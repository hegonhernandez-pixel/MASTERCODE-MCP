import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Brain,
  Cpu,
  Shield,
  Workflow,
  Sparkles,
  FolderGit2,
  Lock,
  Radio,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ModelProvider } from '../types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agentData: any) => Promise<void>;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [modelEngine, setModelEngine] = useState<ModelProvider>('gemini');
  const [description, setDescription] = useState('');
  const [matrixOfThought, setMatrixOfThought] = useState('');
  const [biasDirective, setBiasDirective] = useState('');
  const [symbolicLink, setSymbolicLink] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [personalAccessToken, setPersonalAccessToken] = useState('');

  // Enabled APIs
  const [apis, setApis] = useState({
    videoGenerationApi: true,
    webInteractionApi: true,
    fileReaderApi: true,
    fileConverterApi: true,
    filePermissionApi: true,
    repoDockerApi: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('Por favor indica al menos el nombre y rol del agente.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAgentCreated({
        name,
        role,
        modelEngine,
        description,
        matrixOfThought: matrixOfThought || 'Análisis sistemático de datos y coherencia con la arquitectura del sistema.',
        biasDirective: biasDirective || 'Enfoque estricto en la especialidad cognitiva asignada.',
        symbolicLink: symbolicLink || `symlink://identity/agent/${name.toLowerCase().replace(/\s+/g, '-')}`,
        decisionRules: [
          'Mantener coherencia deliberativa con el servidor MasterCode MCP',
          'Operar exclusivamente mediante las APIs y herramientas habilitadas'
        ],
        remoteUrl: remoteUrl || `https://github.com/master-code-mcp/${name.toLowerCase().replace(/\s+/g, '-')}.git`,
        branch,
        personalAccessToken,
        enabledApis: apis,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al desplegar agente en el servidor MCP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Desplegar Nuevo Agente en Servidor MasterCode MCP
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Asigna modelo, arquitectura cognitiva, repositorio y APIs habilitadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs">
              {error}
            </div>
          )}

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold block">
                Nombre del Agente:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Agente 5: Optimizador de Latencia"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold block">
                Rol Cognitivo:
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ej. Benchmark & Optimización de Rendimiento"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Model Engine Selector */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold block">
              Motor de Modelo de IA (Heterogéneo):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setModelEngine('claude-code')}
                className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                  modelEngine === 'claude-code'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="font-bold">Claude Code</div>
                <div className="text-[10px] text-slate-500">Anthropic Claude 3.7 / Opus</div>
              </button>

              <button
                type="button"
                onClick={() => setModelEngine('gpt')}
                className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                  modelEngine === 'gpt'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="font-bold">GPT</div>
                <div className="text-[10px] text-slate-500">OpenAI GPT-4o Enterprise</div>
              </button>

              <button
                type="button"
                onClick={() => setModelEngine('gemini')}
                className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                  modelEngine === 'gemini'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="font-bold">Gemini</div>
                <div className="text-[10px] text-slate-500">Google Gemini 3.8 / 2.5</div>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold block">
              Descripción del Agente e Implementación:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica la misión del agente y su funcionamiento dentro del servidor MCP..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Cognitive Architecture Details */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="font-mono text-purple-300 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Arquitectura Cognitiva Inicial</span>
            </span>

            <div className="space-y-2">
              <div>
                <label className="font-mono text-slate-400 text-[11px] block mb-1">
                  Enlace Simbólico Rector (Symlink):
                </label>
                <input
                  type="text"
                  value={symbolicLink}
                  onChange={(e) => setSymbolicLink(e.target.value)}
                  placeholder="symlink://identity/role/directive"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-cyan-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 text-[11px] block mb-1">
                  Directiva de Sesgo Deliberativo:
                </label>
                <input
                  type="text"
                  value={biasDirective}
                  onChange={(e) => setBiasDirective(e.target.value)}
                  placeholder="Criterio específico para sesgar las decisiones de este agente..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Remote Repository & GitHub PAT */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="font-mono text-indigo-300 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Configuración de Repositorio Remoto</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-mono text-slate-400 text-[11px] block mb-1">
                  URL Repositorio Remoto:
                </label>
                <input
                  type="text"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="https://github.com/usuario/repo.git"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 text-[11px] block mb-1">
                  GitHub Personal Access Token (PAT):
                </label>
                <input
                  type="password"
                  value={personalAccessToken}
                  onChange={(e) => setPersonalAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Enabled Implementation APIs */}
          <div className="space-y-2">
            <label className="font-mono text-slate-300 font-bold block">
              Capacidades de Implementación (APIs Habilitadas en MCP):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.videoGenerationApi}
                  onChange={(e) => setApis({ ...apis, videoGenerationApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">API Video & Media</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.webInteractionApi}
                  onChange={(e) => setApis({ ...apis, webInteractionApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">API Interacción Web</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.fileReaderApi}
                  onChange={(e) => setApis({ ...apis, fileReaderApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">API Lector Archivos</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.fileConverterApi}
                  onChange={(e) => setApis({ ...apis, fileConverterApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">API Conversor Archivos</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.filePermissionApi}
                  onChange={(e) => setApis({ ...apis, filePermissionApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">API Permisos Archivos</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={apis.repoDockerApi}
                  onChange={(e) => setApis({ ...apis, repoDockerApi: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="font-mono text-[11px]">Repo & Docker API</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-mono text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Desplegando en Servidor...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Desplegar Agente en Servidor MCP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
