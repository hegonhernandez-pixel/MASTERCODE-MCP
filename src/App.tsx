import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IdentityMatrixBar } from './components/IdentityMatrixBar';
import { AgentDeploymentCard } from './components/AgentDeploymentCard';
import { ProblemConsultationCenter } from './components/ProblemConsultationCenter';
import { CreateAgentModal } from './components/CreateAgentModal';
import { AutonomousExecutionCenter } from './components/AutonomousExecutionCenter';
import { GeminiChatbotDrawer } from './components/GeminiChatbotDrawer';
import { DEFAULT_USER_PRINCIPLES, PROBLEM_PRESETS } from './data/presets';
import {
  DeployedAgent,
  UserIdentityPrinciples,
  CognitiveOrchestrationResult,
} from './types';
import {
  Boxes,
  FolderGit2,
  Workflow,
  Sparkles,
  Server,
  PlusCircle,
  RefreshCw,
  Terminal,
  CheckCircle2,
  Layers,
  HelpCircle,
  Play,
  Bot
} from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState<DeployedAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(true);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [principles, setPrinciples] = useState<UserIdentityPrinciples>(DEFAULT_USER_PRINCIPLES);

  // Problem consultation & solution state
  const [topic, setTopic] = useState<string>(PROBLEM_PRESETS[0].topic);
  const [context, setContext] = useState<string>(PROBLEM_PRESETS[0].context);
  const [solutionLoading, setSolutionLoading] = useState<boolean>(false);
  const [orchestrationResult, setOrchestrationResult] = useState<CognitiveOrchestrationResult | null>(null);

  // Active view tab: 'deliberation' | 'agents' | 'git-push'
  const [activeTab, setActiveTab] = useState<'deliberation' | 'agents' | 'git-push'>('deliberation');

  // Modals & Chatbot state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch deployed agents from server on load
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.agents && Array.isArray(data.agents)) {
        setAgents(data.agents);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasGeminiKey === 'boolean') {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch(() => setHasGeminiKey(false));

    fetchAgents();
  }, []);

  // Generate Solution Engine
  const handleGenerateSolution = async () => {
    if (!topic.trim()) return;
    setSolutionLoading(true);

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          context,
          principles,
        }),
      });

      const data = await response.json();
      if (data && data.agent1_analytical) {
        setOrchestrationResult(data as CognitiveOrchestrationResult);

        // Update agents' generated opinions in state
        setAgents((prev) =>
          prev.map((a, idx) => {
            if (idx === 0) return { ...a, generatedOpinion: data.agent1_analytical.opinion };
            if (idx === 1) return { ...a, generatedOpinion: data.agent2_solver.opinion };
            if (idx === 2) return { ...a, generatedOpinion: data.agent3_critic.opinion };
            if (idx === 3) return { ...a, generatedOpinion: data.agent4_synthesizer.opinion };
            return a;
          })
        );

        showNotification('¡Solución generada con éxito! Cada agente ha expuesto su propuesta y el orquestador ha dictado la síntesis.');
      }
    } catch (err) {
      console.error('Error generating solution:', err);
      showNotification('Error al orquestar la solución en el servidor', 'error');
    } finally {
      setSolutionLoading(false);
    }
  };

  // Generate Symbolic Link and Collapse Terminals for an Agent
  const handleGenerateSymlink = async (
    agentId: string,
    inputs: { repoAndDocker: string; personality: string; contextAndHistory: string }
  ) => {
    const res = await fetch(`/api/agents/${agentId}/symlink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    });

    const data = await res.json();
    if (data.success && data.symbolicLink) {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? {
                ...a,
                cognitiveArchitecture: {
                  ...a.cognitiveArchitecture,
                  symbolicLink: data.symbolicLink,
                },
                terminalInputs: inputs,
                terminalsOpen: false, // Collapsed!
              }
            : a
        )
      );

      showNotification(`Enlace simbólico '${data.symbolicLink}' generado. Menú de terminales plegado.`);
      return data.symbolicLink;
    } else {
      throw new Error(data.error || 'Error al generar enlace simbólico');
    }
  };

  // Create new Agent
  const handleCreateAgent = async (agentData: any) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    });
    const data = await res.json();
    if (data.success && data.agent) {
      setAgents((prev) => [...prev, data.agent]);
      showNotification(`Nuevo agente '${data.agent.name}' desplegado con éxito en el servidor MCP.`);
    } else {
      throw new Error(data.error || 'Error al desplegar agente');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        hasGeminiKey={hasGeminiKey}
        onOpenCreateAgent={() => setIsCreateOpen(true)}
        onToggleMatrix={() => setShowMatrix(!showMatrix)}
        onOpenChat={() => setIsChatOpen(true)}
        showMatrix={showMatrix}
        totalAgents={agents.length}
      />

      {/* Anclaje de Identidad Cognitiva Bar */}
      <IdentityMatrixBar
        principles={principles}
        onChange={setPrinciples}
        isOpen={showMatrix}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed top-18 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border font-mono text-xs ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs: Consulta & Deliberación | Agentes Desplegados | Repositorio Remoto & Push */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('deliberation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all ${
                activeTab === 'deliberation'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400 stroke-none" />
              <span>Consultar Problema & Generar Solución</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all ${
                activeTab === 'agents'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-purple-400" />
              <span>Agentes Desplegados & Terminales ({agents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('git-push')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all ${
                activeTab === 'git-push'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Repositorio Remoto & CI/CD PAT</span>
            </button>

            {/* Quick Chatbot Trigger Tab */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium font-mono transition-all bg-gradient-to-r from-purple-950/80 to-indigo-950/80 text-purple-300 border border-purple-800/60 hover:border-purple-600/80 hover:text-white"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>Chatbot Gemini Supervisor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Servidor MasterCode MCP Activo (Stdio)</span>
          </div>
        </div>

        {/* TAB 1: Consultar Problema & Generar Solución (Primary Flow) */}
        {activeTab === 'deliberation' && (
          <div className="space-y-6">
            <ProblemConsultationCenter
              topic={topic}
              context={context}
              onTopicChange={setTopic}
              onContextChange={setContext}
              onGenerateSolution={handleGenerateSolution}
              loading={solutionLoading}
              result={orchestrationResult}
            />

            {/* Also show the 4 deployed agent cards below for quick inspection */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  <span>Agentes Desplegados en el Servidor MasterCode MCP:</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Haz click en "Abrir Terminales" en cualquier agente para modificar su Docker/URL, Personalidad o Historia y generar su Enlace Simbólico.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {agents.map((agent) => (
                  <AgentDeploymentCard
                    key={agent.id}
                    agent={agent}
                    onGenerateSymlink={handleGenerateSymlink}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Agentes Desplegados & Terminales Interactivas */}
        {activeTab === 'agents' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Configuración de Personalidad, Historia y Repositorio por Agente
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cada agente cuenta con 3 terminales interactivas (Repositorio/Docker, Personalidad y Contexto). Al completarlas y presionar <strong>"Generar Enlace Simbólico"</strong>, el menú se pliega automáticamente para mantener limpia la consola.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Agregar Agente</span>
              </button>
            </div>

            {loadingAgents ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
                <RefreshCw className="w-7 h-7 text-cyan-400 mx-auto animate-spin mb-3" />
                <p className="text-xs text-slate-300 font-mono">
                  Cargando agentes activos en el servidor MasterCode MCP...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {agents.map((agent) => (
                  <AgentDeploymentCard
                    key={agent.id}
                    agent={agent}
                    onGenerateSymlink={handleGenerateSymlink}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Repositorio Remoto & Conexión PAT (AutonomousExecutionCenter) */}
        {activeTab === 'git-push' && (
          <AutonomousExecutionCenter
            spec={orchestrationResult?.machine_readable_spec}
            defaultRemoteUrl={agents[0]?.repositoryConfig.remoteUrl}
            defaultBranch={agents[0]?.repositoryConfig.branch}
          />
        )}
      </main>

      {/* Floating Gemini Chatbot Trigger Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 hover:from-purple-600 hover:to-cyan-500 text-white shadow-2xl shadow-purple-950/60 hover:scale-105 transition-all flex items-center gap-2.5 font-mono text-xs font-bold border border-cyan-400/40 cursor-pointer"
        title="Abrir Chatbot Gemini Supervisor"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-cyan-200" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <span className="font-semibold tracking-wide">Chatbot Gemini MCP</span>
      </button>

      {/* Gemini Chatbot Drawer (Interactive Supervisor) */}
      <GeminiChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onRefreshAgents={(updated) => {
          if (updated && Array.isArray(updated)) {
            setAgents(updated);
          } else {
            fetchAgents();
          }
        }}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOrchestrationResult={(res) => {
          if (res) {
            setOrchestrationResult(res);
            setAgents((prev) =>
              prev.map((a, idx) => {
                if (idx === 0) return { ...a, generatedOpinion: res.agent1_analytical.opinion };
                if (idx === 1) return { ...a, generatedOpinion: res.agent2_solver.opinion };
                if (idx === 2) return { ...a, generatedOpinion: res.agent3_critic.opinion };
                if (idx === 3) return { ...a, generatedOpinion: res.agent4_synthesizer.opinion };
                return a;
              })
            );
            showNotification('¡Servidor ejecutado por Chatbot Gemini! Solución actualizada y lista para exportar.');
          }
        }}
        activeAgentsCount={agents.length}
      />

      {/* Modal: Desplegar Nuevo Agente */}
      <CreateAgentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAgentCreated={handleCreateAgent}
      />
    </div>
  );
}
