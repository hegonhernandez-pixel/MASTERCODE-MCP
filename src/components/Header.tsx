import React from 'react';
import { Cpu, Terminal, ShieldCheck, Layers, Sparkles, PlusCircle, Radio, GitBranch, Bot } from 'lucide-react';

interface HeaderProps {
  hasGeminiKey: boolean;
  onOpenCreateAgent: () => void;
  onToggleMatrix: () => void;
  onOpenChat: () => void;
  showMatrix: boolean;
  totalAgents: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasGeminiKey,
  onOpenCreateAgent,
  onToggleMatrix,
  onOpenChat,
  showMatrix,
  totalAgents,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Server Info */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-500/20 text-white font-mono font-bold text-lg">
            <Layers className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>MasterCode MCP Server</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ONLINE • Stdio</span>
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span className="text-cyan-400">@modelcontextprotocol/sdk v1.0.1</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{totalAgents} Agentes Desplegados con APIs Activas</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Gemini Chatbot Supervisor Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/50 shadow-md shadow-purple-950/30 text-xs font-mono font-semibold transition-all cursor-pointer ring-1 ring-purple-500/30"
            title="Abrir Chatbot Gemini Supervisor para control del Servidor MCP"
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            <span>Chatbot Gemini (Supervisor)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Identity Matrix Toggle */}
          <button
            onClick={onToggleMatrix}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              showMatrix
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/80 ring-1 ring-cyan-400/40'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
            title="Abrir Caja de Historia y Enlaces Simbólicos para el Comportamiento y Sesgo Deliberativo"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Anclaje de Identidad Cognitiva</span>
          </button>

          {/* Add New Agent Button */}
          <button
            onClick={onOpenCreateAgent}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Agregar Nuevo Agente</span>
          </button>
        </div>
      </div>
    </header>
  );
};
