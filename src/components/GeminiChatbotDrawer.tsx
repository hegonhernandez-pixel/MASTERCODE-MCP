import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Zap,
  FolderGit2,
  FileCode2,
  Download,
  PlusCircle,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Terminal,
  ExternalLink,
  Code2,
  ShieldCheck,
  Play
} from 'lucide-react';
import { CognitiveOrchestrationResult, DeployedAgent } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  actionTaken?: string;
  actionDetails?: any;
  orchestrationResult?: CognitiveOrchestrationResult | null;
}

interface GeminiChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAgents: (updatedAgents?: DeployedAgent[]) => void;
  onNavigateToTab: (tab: 'deliberation' | 'agents' | 'git-push') => void;
  onOrchestrationResult?: (result: CognitiveOrchestrationResult) => void;
  activeAgentsCount?: number;
}

export const GeminiChatbotDrawer: React.FC<GeminiChatbotDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshAgents,
  onNavigateToTab,
  onOrchestrationResult,
  activeAgentsCount = 4,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy el **Chatbot Supervisor de MasterCode MCP** impulsado por **Gemini** (Gemini 3.8 Flash).\n\nEstoy conectado directamente al servidor MasterCode MCP para realizar las tareas que requieras:\n\n• **Modificar la personalidad o directivas** de los agentes (por ejemplo: hacerlos menos conservadores, pedirles que expliquen a fondo cada contrato técnico o añadir directivas personalizadas).\n• **Desplegar nuevos agentes** dentro del servidor con sus propias arquitecturas cognitivas.\n• **Correr el servidor MCP** para resolver tu problema o construir tu aplicación con el debate de los 4 agentes.\n• **Darte las opciones disponibles** para exportar el resultado: en archivo JSON, en repositorio GitHub con CI/CD automático, o en aplicación Web/APK.\n\n¿Qué directiva o tarea deseas enviarle a los agentes?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Direct download of JSON solution file
  const handleDownloadSpecJson = (specData: any, filename = 'app-solution-spec.json') => {
    const jsonStr = JSON.stringify(specData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText ?? input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'He recibido tu directiva y actualizado el servidor MasterCode MCP.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTaken: data.performedAction,
        actionDetails: data.actionDetails,
        orchestrationResult: data.orchestrationResult,
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If agents updated, refresh app state
      if (data.agents && Array.isArray(data.agents)) {
        onRefreshAgents(data.agents);
      } else if (data.performedAction) {
        onRefreshAgents();
      }

      // If orchestration was run, push result to App state
      if (data.orchestrationResult && onOrchestrationResult) {
        onOrchestrationResult(data.orchestrationResult);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `[Error de comunicación]: No pude contactar con el endpoint de Gemini MCP: ${err.message || 'Error desconocido'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-slate-950/98 backdrop-blur-xl border-l border-cyan-500/40 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Chatbot Gemini Supervisor</span>
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Controlador MCP • {activeAgentsCount} Agentes Conectados</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cerrar Chatbot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono scrollbar-thin">
        <span className="text-slate-500 shrink-0 font-medium">Directivas rápidas:</span>
        
        <button
          onClick={() =>
            handleSend(
              'Modifica las directivas de los 4 agentes para que no sean tan conservadores en sus respuestas y expliquen con mayor detalle cada decisión técnica.'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800/50 shrink-0 transition-all cursor-pointer flex items-center gap-1"
        >
          <span>💡 Menos conservadores & explicar mejor</span>
        </button>

        <button
          onClick={() =>
            handleSend(
              'Corre el servidor MCP para diseñar y construir un Sistema Operativo moderno y ligero, y dame las opciones disponibles.'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 shrink-0 transition-all cursor-pointer flex items-center gap-1"
        >
          <span>🚀 Correr Servidor: Sistema Operativo</span>
        </button>

        <button
          onClick={() =>
            handleSend(
              'Despliega un nuevo agente en el servidor MasterCode MCP con rol de Optimizador y Auditor de Rendimiento.'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 shrink-0 transition-all cursor-pointer flex items-center gap-1"
        >
          <span>➕ Desplegar Agente 5</span>
        </button>

        <button
          onClick={() =>
            handleSend(
              '¿Cuáles son las opciones disponibles para exportar y desplegar la solución del servidor?'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 shrink-0 transition-all cursor-pointer flex items-center gap-1"
        >
          <span>📋 Ver opciones disponibles</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-4 space-y-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-medium ml-auto shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action Banner with Interactive Action Buttons */}
              {(msg.actionTaken || msg.orchestrationResult) && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acción Servidor MCP: {msg.actionTaken || 'Ejecución completada'}</span>
                  </div>

                  {/* Options Available Box */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Opciones que tienes disponibles:
                    </span>

                    <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                      {/* Option 1: Download JSON Spec */}
                      <button
                        onClick={() =>
                          handleDownloadSpecJson(
                            msg.orchestrationResult || msg.actionDetails || { timestamp: new Date().toISOString() },
                            `${msg.actionDetails?.appName || 'solution'}-spec.json`
                          )
                        }
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-700/50 transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>1. Descargar Solución en Archivo JSON</span>
                        </span>
                        <span className="text-[9px] text-cyan-400 font-bold">.json</span>
                      </button>

                      {/* Option 2: Go to GitHub Push PAT Tab */}
                      <button
                        onClick={() => {
                          onNavigateToTab('git-push');
                          onClose();
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/50 transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>2. Subir a Repositorio GitHub con deploy.yml</span>
                        </span>
                        <span className="text-[9px] text-indigo-400 font-bold">PAT CI/CD ➔</span>
                      </button>

                      {/* Option 3: Inspect Deliberation on Screen */}
                      <button
                        onClick={() => {
                          onNavigateToTab('deliberation');
                          onClose();
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-700/50 transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                          <span>3. Ver Debate de los 4 Agentes en Pantalla</span>
                        </span>
                        <span className="text-[9px] text-purple-400 font-bold">Consenso ➔</span>
                      </button>

                      {/* Option 4: Inspect Agents & Directives */}
                      <button
                        onClick={() => {
                          onNavigateToTab('agents');
                          onClose();
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span>4. Ver Terminales y Directivas Modificadas</span>
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold">Consola ➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <span className={`text-[9px] font-mono block ${msg.role === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Gemini está interactuando con el Servidor MasterCode MCP...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pide a Gemini modificar directivas, desplegar agente o correr servidor..."
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            title="Enviar directiva a Gemini"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
