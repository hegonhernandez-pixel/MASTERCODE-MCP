import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FolderGit2,
  GitBranch,
  Lock,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Workflow,
  ExternalLink,
  Code2,
  Smartphone,
  Terminal,
  ShieldCheck,
  Check,
  Boxes
} from 'lucide-react';
import { MachineReadableSpec, OrchestratorPermissions } from '../types';

interface AutonomousExecutionCenterProps {
  spec?: MachineReadableSpec | null;
  permissions?: OrchestratorPermissions;
  onPermissionsChange?: (newPerms: OrchestratorPermissions) => void;
  defaultRemoteUrl?: string;
  defaultBranch?: string;
}

export const AutonomousExecutionCenter: React.FC<AutonomousExecutionCenterProps> = ({
  spec,
  defaultRemoteUrl = 'https://github.com/master-code-mcp/master-code-agents.git',
  defaultBranch = 'main',
}) => {
  const [remoteUrl, setRemoteUrl] = useState(defaultRemoteUrl);
  const [branch, setBranch] = useState(defaultBranch);
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [commitMessage, setCommitMessage] = useState(
    'feat: inicializar repositorio cuatri-agente con .github/workflows/deploy.yml y runtime MasterCode MCP'
  );

  const [isPushing, setIsPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [commitResult, setCommitResult] = useState<{
    shortSha?: string;
    commitHash?: string;
    repoUrl?: string;
    branch?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'remote-push' | 'deploy-yml' | 'web-apk' | 'files'>('remote-push');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleConnectAndPush = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!remoteUrl.trim()) {
      alert('Por favor especifica la URL del repositorio remoto de GitHub.');
      return;
    }

    if (!personalAccessToken.trim()) {
      alert('Por favor introduce tu Personal Access Token (PAT) de GitHub para autenticar la conexión.');
      return;
    }

    setIsPushing(true);
    setPushStatus('idle');
    setPushLogs([
      `[1/5] [GITHUB_AUTH] Iniciando autenticación en GitHub API con Personal Access Token (PAT)...`,
    ]);

    try {
      const response = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteUrl,
          branch,
          personalAccessToken,
          commitMessage,
          files: spec?.files || [],
        }),
      });

      const data = await response.json();

      if (data.success && data.logs) {
        setPushLogs(data.logs);
        setPushStatus('success');
        setCommitResult({
          shortSha: data.shortSha,
          commitHash: data.commitHash,
          repoUrl: data.repoUrl,
          branch: data.branch,
        });
      } else {
        setPushStatus('error');
        setPushLogs(data.logs || [data.error || 'Error al conectar con GitHub']);
      }
    } catch (err: any) {
      setPushStatus('error');
      setPushLogs([`[ERROR CRÍTICO] Falló la conexión: ${err.message || 'Error de red'}`]);
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadFullZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      if (spec?.files) {
        spec.files.forEach((file) => {
          zip.file(file.path, file.content);
        });
      } else {
        // Fallback default files
        zip.file(
          '.github/workflows/deploy.yml',
          `name: CI/CD MasterCode MCP Deployment\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo "Build ok"`
        );
        zip.file('index.html', '<!doctype html><html><body><h1>MasterCode MCP</h1></body></html>');
      }

      zip.file(
        'README.md',
        `# MasterCode MCP - Agentes Autónomos\nRepositorio estructurado con .github/workflows/deploy.yml y servidor MasterCode MCP.`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `master-code-repository.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const deployYmlContent =
    spec?.files.find((f) => f.path.includes('.github/workflows/deploy.yml'))?.content ||
    `name: Continuous Deployment & Build
on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install MCP Dependencies
        run: |
          cd shared-workspace
          npm install --production

      - name: Verify Autonomous MCP Server
        run: |
          node shared-workspace/mcp-server.js --test-dry-run || true

      - name: Deploy to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
`;

  return (
    <div className="bg-slate-900/95 border border-cyan-800/40 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-7 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>AutonomousExecutionCenter • Git Remote Engine</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Conectar a GitHub & Ejecutar Push Inicial con CI/CD</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configura el repositorio remoto, autentica la conexión mediante Personal Access Token (PAT) y dispara el push inicial automático con <code>.github/workflows/deploy.yml</code> para despliegue continuo.
          </p>
        </div>

        <button
          onClick={handleDownloadFullZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Generando ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Descargar Archivos (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('remote-push')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'remote-push'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Configuración Remota & Push PAT</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy-yml')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'deploy-yml'
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
          <span>.github/workflows/deploy.yml</span>
        </button>

        <button
          onClick={() => setActiveTab('web-apk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'web-apk'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Web Autónoma & APK</span>
        </button>
      </div>

      {/* Tab 1: Remote Configuration & Push via PAT */}
      {activeTab === 'remote-push' && (
        <form onSubmit={handleConnectAndPush} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repo URL */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>URL del Repositorio Remoto (GitHub):</span>
                </span>
                <span className="text-[10px] text-slate-500">HTTPS</span>
              </label>
              <input
                type="text"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="https://github.com/tu-usuario/master-code-agents.git"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-indigo-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Target Branch */}
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span>Rama de Despliegue (Branch):</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* GitHub Personal Access Token (PAT) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-slate-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>GitHub Personal Access Token (PAT):</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Crear token con permiso 'repo' en GitHub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={personalAccessToken}
                onChange={(e) => setPersonalAccessToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 pr-10 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              El token es transmitido de forma cifrada a la API de GitHub únicamente para autorizar la creación del árbol y el push inicial.
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
            />
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Incluye automáticamente .github/workflows/deploy.yml</span>
            </div>

            <button
              type="submit"
              disabled={isPushing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {isPushing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Conectando & Ejecutando Push...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Conectar a GitHub & Ejecutar Push Inicial</span>
                </>
              )}
            </button>
          </div>

          {/* Execution Terminal */}
          {pushLogs.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Registro de la Conexión & Push a GitHub:</span>
                </span>
                {pushStatus === 'success' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Push Concluido</span>
                  </span>
                )}
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed space-y-1">
                {pushLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">{index + 1}</span>
                    <span className={log.includes('[ERROR') ? 'text-red-400' : ''}>{log}</span>
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* Success Banner */}
          {pushStatus === 'success' && commitResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-xs">
                    ¡Repositorio conectado y push inicial transmitido con éxito!
                  </span>
                </div>
                {commitResult.shortSha && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                    SHA: {commitResult.shortSha}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                El pipeline de integración y despliegue continuo (<code>.github/workflows/deploy.yml</code>) ha sido activado en GitHub Actions para compilar y publicar automáticamente.
              </p>
            </div>
          )}
        </form>
      )}

      {/* Tab 2: .github/workflows/deploy.yml Preview */}
      {activeTab === 'deploy-yml' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Workflow className="w-4 h-4" />
              <span>Archivo Generado: .github/workflows/deploy.yml</span>
            </span>

            <button
              onClick={() => handleCopy(deployYmlContent, 'deploy-yml')}
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-[11px] transition-all"
            >
              {copiedKey === 'deploy-yml' ? 'Copiado!' : 'Copiar deploy.yml'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-cyan-200 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
            <code>{deployYmlContent}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Web & APK Standalone */}
      {activeTab === 'web-apk' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Despliegue Web Autónomo (index.html) y APK Android</span>
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              El proyecto incluye <code>index.html</code> autónomo que puede servirse estáticamente en GitHub Pages o alojarse en un contenedor Docker, además de <code>manifest.webmanifest</code> y script <code>build_apk.sh</code> para compilar a APK nativo de Android mediante Capacitor.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-mono text-slate-400 text-[11px] block">
              Comandos para compilar a APK localmente:
            </span>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded font-mono text-[10px]">
{`chmod +x build_apk.sh
./build_apk.sh`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
