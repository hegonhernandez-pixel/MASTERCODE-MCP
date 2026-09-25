import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  GitBranch,
  Lock,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Workflow,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { DeployedAgent } from '../types';

interface EditRepositoryModalProps {
  agent: DeployedAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRepo: (agentId: string, repoConfig: any) => Promise<void>;
  onExecutePush: (
    agentId: string,
    params: {
      remoteUrl: string;
      branch: string;
      personalAccessToken: string;
      commitMessage: string;
    }
  ) => Promise<{ success: boolean; logs: string[]; commitHash?: string; shortSha?: string }>;
}

export const EditRepositoryModal: React.FC<EditRepositoryModalProps> = ({
  agent,
  isOpen,
  onClose,
  onUpdateRepo,
  onExecutePush,
}) => {
  if (!isOpen || !agent) return null;

  const [remoteUrl, setRemoteUrl] = useState(agent.repositoryConfig.remoteUrl);
  const [branch, setBranch] = useState(agent.repositoryConfig.branch);
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [commitMessage, setCommitMessage] = useState(
    `feat: inicializar repositorio cuatri-agente para ${agent.name} con CI/CD deploy.yml`
  );

  const [isPushing, setIsPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [commitResult, setCommitResult] = useState<{ shortSha?: string; hash?: string } | null>(null);

  const handleSaveOnly = async () => {
    await onUpdateRepo(agent.id, {
      remoteUrl,
      branch,
      personalAccessToken: personalAccessToken || undefined,
    });
    onClose();
  };

  const handlePushInitial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalAccessToken.trim()) {
      alert('Por favor introduce tu Personal Access Token (PAT) de GitHub para autenticar la conexión y el push inicial.');
      return;
    }

    setIsPushing(true);
    setPushLogs(['[INICIALIZANDO] Conectando con GitHub API y verificando credenciales...']);
    setPushStatus('idle');

    try {
      const res = await onExecutePush(agent.id, {
        remoteUrl,
        branch,
        personalAccessToken,
        commitMessage,
      });

      if (res.success) {
        setPushLogs(res.logs || ['Push inicial completado exitosamente.']);
        setPushStatus('success');
        setCommitResult({ shortSha: res.shortSha, hash: res.commitHash });
      } else {
        setPushStatus('error');
        setPushLogs(res.logs || ['Error durante la conexión o el push a GitHub.']);
      }
    } catch (err: any) {
      setPushStatus('error');
      setPushLogs([`[ERROR CRÍTICO] Falló el push a GitHub: ${err.message || 'Error de red'}`]);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Configurar Repositorio Remoto & Push Inicial (PAT)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {agent.name} • {agent.model.modelName}
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

        {/* Content */}
        <form onSubmit={handlePushInitial} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Remote URL */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>URL del Repositorio Remoto de GitHub:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">HTTPS o Git</span>
            </label>
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-indigo-200 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://github.com/tu-usuario/nombre-repositorio.git"
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>Rama Objetivo (Target Branch):</span>
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="main"
              required
            />
          </div>

          {/* Personal Access Token (PAT) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-slate-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Personal Access Token (PAT) de GitHub:</span>
              </label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Generar token en GitHub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={personalAccessToken}
                onChange={(e) => setPersonalAccessToken(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Requiere permiso <strong>repo</strong> (acceso completo a repositorios privados/públicos).
            </p>
          </div>

          {/* Commit Message */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold block">
              Mensaje del Commit Inicial:
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="feat: push inicial del agente con .github/workflows/deploy.yml"
            />
          </div>

          {/* CI/CD Notice */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-cyan-300">
              <Workflow className="w-3.5 h-3.5" />
              <span>Despliegue Continuo Automático (.github/workflows/deploy.yml)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              El agente estructurará automáticamente el repositorio incluyendo <code>.github/workflows/deploy.yml</code>, el servidor MCP en <code>shared-workspace/</code>, aplicación Web autónoma y soporte APK Android.
            </p>
          </div>

          {/* Live Push Logs */}
          {pushLogs.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-mono text-slate-400 font-bold block">
                Registro de Ejecución en Tiempo Real:
              </span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-36 leading-relaxed">
                {pushLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </pre>
            </div>
          )}

          {pushStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Repositorio conectado y push inicial completado con éxito!</span>
              </div>
              {commitResult?.shortSha && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px]">
                  Commit {commitResult.shortSha}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-3 py-2 rounded-lg text-slate-400 hover:text-white font-mono text-xs hover:bg-slate-800"
            >
              Guardar sin Enviar Push
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-slate-400 hover:text-white font-mono text-xs"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isPushing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
              >
                {isPushing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando & Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Conectar & Ejecutar Push Inicial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
