import React, { useState } from 'react';
import {
  Brain,
  Cpu,
  Shield,
  Workflow,
  Sparkles,
  FolderGit2,
  Lock,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Terminal,
  Boxes,
  Video,
  Globe,
  FileText,
  FileCode2,
  Key,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Send,
  Loader2,
  Radio
} from 'lucide-react';
import { DeployedAgent } from '../types';

interface AgentDeploymentCardProps {
  agent: DeployedAgent;
  onGenerateSymlink: (
    agentId: string,
    inputs: { repoAndDocker: string; personality: string; contextAndHistory: string }
  ) => Promise<string>;
}

export const AgentDeploymentCard: React.FC<AgentDeploymentCardProps> = ({
  agent,
  onGenerateSymlink,
}) => {
  // Whether the 3 interactive terminals are currently open/visible
  const [terminalsOpen, setTerminalsOpen] = useState(agent.terminalsOpen || false);

  // Terminal input states
  const [repoAndDocker, setRepoAndDocker] = useState(
    agent.terminalInputs?.repoAndDocker || agent.repositoryConfig.remoteUrl || ''
  );
  const [personality, setPersonality] = useState(
    agent.terminalInputs?.personality || agent.cognitiveArchitecture.biasDirective || ''
  );
  const [contextAndHistory, setContextAndHistory] = useState(
    agent.terminalInputs?.contextAndHistory || agent.cognitiveArchitecture.contextSummary || ''
  );

  const [isGeneratingSymlink, setIsGeneratingSymlink] = useState(false);
  const [symlinkGeneratedNotice, setSymlinkGeneratedNotice] = useState<string | null>(null);
  const [copiedSymlink, setCopiedSymlink] = useState(false);

  // Model-specific styling
  const isClaude = agent.model.engine === 'claude-code';
  const isGpt = agent.model.engine === 'gpt';
  const isGemini = agent.model.engine === 'gemini';

  const engineColorClass = isClaude
    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    : isGpt
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';

  const cardBorderClass = isClaude
    ? 'border-amber-600/30 hover:border-amber-500/50'
    : isGpt
    ? 'border-emerald-600/30 hover:border-emerald-500/50'
    : 'border-cyan-600/30 hover:border-cyan-500/50';

  const getRoleIcon = () => {
    if (agent.role.toLowerCase().includes('analít') || agent.name.includes('1')) {
      return <Brain className="w-5 h-5 text-amber-400" />;
    }
    if (agent.role.toLowerCase().includes('resolu') || agent.name.includes('2')) {
      return <Cpu className="w-5 h-5 text-emerald-400" />;
    }
    if (agent.role.toLowerCase().includes('cuestion') || agent.role.toLowerCase().includes('crític') || agent.name.includes('3')) {
      return <Shield className="w-5 h-5 text-cyan-400" />;
    }
    return <Workflow className="w-5 h-5 text-purple-400" />;
  };

  const handleCopySymlink = () => {
    navigator.clipboard.writeText(agent.cognitiveArchitecture.symbolicLink);
    setCopiedSymlink(true);
    setTimeout(() => setCopiedSymlink(false), 2000);
  };

  const handleGenerateSymlinkClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSymlink(true);
    try {
      const generatedLink = await onGenerateSymlink(agent.id, {
        repoAndDocker,
        personality,
        contextAndHistory,
      });
      // Show notice and close terminals
      setSymlinkGeneratedNotice(`Enlace generado: ${generatedLink}`);
      setTerminalsOpen(false); // Close/collapse interactive terminals as requested!
      setTimeout(() => setSymlinkGeneratedNotice(null), 4500);
    } catch (err) {
      console.error('Error generating symlink:', err);
    } finally {
      setIsGeneratingSymlink(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-slate-900/95 border ${cardBorderClass} shadow-xl p-5 sm:p-6 space-y-4 transition-all duration-200 relative overflow-hidden`}
    >
      {/* Header: Identity, Engine & Deployed Status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            {getRoleIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {agent.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE EN MCP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{agent.role}</p>
          </div>
        </div>

        {/* Model Badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${engineColorClass}`}>
          <Radio className="w-3.5 h-3.5" />
          <span>{agent.model.modelName}</span>
        </span>
      </div>

      {/* Description & Technical Implementation on MCP */}
      <div className="space-y-1.5 text-xs">
        <p className="text-slate-300 leading-relaxed">{agent.description}</p>
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-start gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <span className="leading-snug">{agent.implementation}</span>
        </div>
      </div>

      {/* Pre-configured APIs (Habilidades preconfiguradas en el repositorio) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
          Habilidades & APIs Preconfiguradas en Repositorio (Disponibles para Autonomía):
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
            <Video className="w-3 h-3 text-indigo-400" />
            <span>API Video & Media</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>API Interacción Web</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>API Lector Archivos</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <FileCode2 className="w-3 h-3 text-purple-400" />
            <span>API Conversor Archivos</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <Key className="w-3 h-3 text-amber-400" />
            <span>API Permisos & Sandbox</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
            <Boxes className="w-3 h-3 text-slate-400" />
            <span>Repo & Docker</span>
          </span>
        </div>
      </div>

      {/* Generated Symbolic Link (Visible when terminals are collapsed) */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate max-w-md">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Enlace Simbólico Activo:</span>
          <code className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 truncate">
            {agent.cognitiveArchitecture.symbolicLink}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySymlink}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
            title="Copiar enlace simbólico"
          >
            {copiedSymlink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setTerminalsOpen(!terminalsOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
          >
            <Terminal className="w-3 h-3" />
            <span>{terminalsOpen ? 'Plegar Terminales' : 'Abrir Terminales Interactivas'}</span>
            {terminalsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {symlinkGeneratedNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Enlace simbólico generado con éxito! Las terminales se han plegado automáticamente.</span>
        </div>
      )}

      {/* 3 Interactive Terminals (Repositorio/Docker, Personalidad, Contexto/Historia) */}
      {terminalsOpen && (
        <form
          onSubmit={handleGenerateSymlinkClick}
          className="rounded-xl bg-slate-950 border border-purple-500/40 p-4 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Terminales Interactivas de Configuración del Agente</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Llena los datos y pulsa "Generar Enlace Simbólico" para sintetizar
            </span>
          </div>

          {/* Terminal 1: Repositorio & Docker / URL */}
          <div className="rounded-lg bg-black border border-slate-800 p-3 space-y-1.5 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-cyan-400">
              <span className="flex items-center gap-1.5 font-bold">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>TERMINAL 1: Repositorio Remoto, Docker & URL</span>
              </span>
              <span className="text-[10px] text-slate-600">bash / git</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="text-cyan-500 font-bold select-none">mcp@agent:~$</span>
              <span className="text-slate-500 select-none">config-repo --url</span>
              <input
                type="text"
                value={repoAndDocker}
                onChange={(e) => setRepoAndDocker(e.target.value)}
                placeholder="https://github.com/usuario/repo.git o docker-compose url..."
                className="flex-1 bg-transparent text-cyan-200 focus:outline-none placeholder-slate-700"
              />
            </div>
          </div>

          {/* Terminal 2: Personalidad & Sesgo Cognitivo */}
          <div className="rounded-lg bg-black border border-slate-800 p-3 space-y-1.5 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-purple-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TERMINAL 2: Personalidad, Tono & Sesgo Cognitivo</span>
              </span>
              <span className="text-[10px] text-slate-600">persona / bias</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400 text-[11px]">
              <span className="text-purple-500 font-bold select-none mt-0.5">mcp@agent:~$</span>
              <span className="text-slate-500 select-none mt-0.5">set-personality</span>
              <textarea
                rows={2}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Directiva de razonamiento, tono analítico, crítico o resolutivo..."
                className="flex-1 bg-transparent text-purple-200 focus:outline-none placeholder-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Terminal 3: Contexto & Historia del Agente */}
          <div className="rounded-lg bg-black border border-slate-800 p-3 space-y-1.5 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-emerald-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Brain className="w-3.5 h-3.5" />
                <span>TERMINAL 3: Contexto Específico & Historia de Fondo</span>
              </span>
              <span className="text-[10px] text-slate-600">history / memory</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400 text-[11px]">
              <span className="text-emerald-500 font-bold select-none mt-0.5">mcp@agent:~$</span>
              <span className="text-slate-500 select-none mt-0.5">load-context</span>
              <textarea
                rows={2}
                value={contextAndHistory}
                onChange={(e) => setContextAndHistory(e.target.value)}
                placeholder="Historia particular del agente, restricciones de dominio, requerimientos de sistema..."
                className="flex-1 bg-transparent text-emerald-200 focus:outline-none placeholder-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Action Button: Generar Enlace Simbólico */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-slate-500">
              Al generar el enlace simbólico, las terminales se cerrarán automáticamente.
            </span>

            <button
              type="submit"
              disabled={isGeneratingSymlink}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingSymlink ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sintetizando Enlace Simbólico...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar Enlace Simbólico</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Generated Independent Opinion / Solution in Deliberation */}
      {agent.generatedOpinion && (
        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Propuesta / Idea Independiente del Agente:</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Deliberación MCP
            </span>
          </div>
          <p className="text-slate-200 leading-relaxed pl-1 italic">
            "{agent.generatedOpinion}"
          </p>
        </div>
      )}
    </div>
  );
};
