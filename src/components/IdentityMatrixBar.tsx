import React, { useState } from 'react';
import { UserIdentityPrinciples } from '../types';
import {
  Check,
  Shield,
  Zap,
  Sparkles,
  MessageSquareCode,
  Link2,
  BookOpen,
  Brain,
  Award,
  AlertTriangle,
  FileText,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface IdentityMatrixBarProps {
  principles: UserIdentityPrinciples;
  onChange: (principles: UserIdentityPrinciples) => void;
  isOpen: boolean;
}

export const IdentityMatrixBar: React.FC<IdentityMatrixBarProps> = ({
  principles,
  onChange,
  isOpen
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'principles' | 'story' | 'symlinks'>('story');

  if (!isOpen) return null;

  return (
    <div className="bg-slate-900/95 border-b border-cyan-900/40 p-4 sm:p-5 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>Anclaje de Identidad Cognitiva del Usuario</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Matriz de Pensamiento & Enlaces Simbólicos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Rige el comportamiento y sesgo deliberativo de los 4 agentes de forma individual y sincronizada
              </p>
            </div>
          </div>

          {/* Subtabs switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('story')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'story'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historia & Contexto Rector</span>
            </button>

            <button
              onClick={() => setActiveSubTab('symlinks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'symlinks'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Enlaces Simbólicos por Agente</span>
            </button>

            <button
              onClick={() => setActiveSubTab('principles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                activeSubTab === 'principles'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Principios Base</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Historia del Usuario & Ejemplos de Referencia */}
        {activeSubTab === 'story' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Historia del Usuario */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-cyan-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Caja de Historia del Usuario (Contexto Rector):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Modela la mentalidad</span>
                </div>
                <textarea
                  value={principles.userStory}
                  onChange={(e) =>
                    onChange({ ...principles, userStory: e.target.value })
                  }
                  rows={4}
                  className="w-full text-xs font-sans bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
                  placeholder="Introduce aquí la historia de fondo o la mentalidad rectora que los agentes deben honrar..."
                />
                <p className="text-[11px] text-slate-400 italic">
                  * La historia informa las decisiones arquitectónicas para evitar soluciones desconectadas del usuario.
                </p>
              </div>

              {/* Box 2: Ejemplos de Referencia */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ejemplos de Referencia del Usuario (Few-Shot Prompting):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Reglas de oro</span>
                </div>
                <textarea
                  value={principles.userExamples}
                  onChange={(e) =>
                    onChange({ ...principles, userExamples: e.target.value })
                  }
                  rows={4}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
                  placeholder="Ejemplos de estilo, directivas tajantes de código o reglas de decisión..."
                />
                <p className="text-[11px] text-slate-400 italic">
                  * Proporciona anclajes concretos para evitar rodeos corporativos y asegurar código conciso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Enlaces Simbólicos por Agente */}
        {activeSubTab === 'symlinks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-300 font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Enlaces Simbólicos de Sesgo Deliberativo (1 por cada Agente):</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Inyecta directivas simbólicas independientes a cada modelo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Symlink Agente 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enlace Simbólico Agente 1 (Claude Code - Analítico):</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={principles.symbolicLinks.analytical}
                  onChange={(e) =>
                    onChange({
                      ...principles,
                      symbolicLinks: {
                        ...principles.symbolicLinks,
                        analytical: e.target.value
                      }
                    })
                  }
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Symlink Agente 2 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enlace Simbólico Agente 2 (GPT-4o - Resolutor):</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={principles.symbolicLinks.solver}
                  onChange={(e) =>
                    onChange({
                      ...principles,
                      symbolicLinks: {
                        ...principles.symbolicLinks,
                        solver: e.target.value
                      }
                    })
                  }
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Symlink Agente 3 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enlace Simbólico Agente 3 (Gemini 2.5 Pro - Crítico):</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={principles.symbolicLinks.critic}
                  onChange={(e) =>
                    onChange({
                      ...principles,
                      symbolicLinks: {
                        ...principles.symbolicLinks,
                        critic: e.target.value
                      }
                    })
                  }
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Symlink Agente 4 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-purple-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Enlace Simbólico Agente 4 (Gemini 3.8 - Consenso):</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={principles.symbolicLinks.synthesizer}
                  onChange={(e) =>
                    onChange({
                      ...principles,
                      symbolicLinks: {
                        ...principles.symbolicLinks,
                        synthesizer: e.target.value
                      }
                    })
                  }
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-200 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Principios Base */}
        {activeSubTab === 'principles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Principio 1: Minimalismo Técnico */}
            <button
              type="button"
              onClick={() =>
                onChange({ ...principles, minimalism: !principles.minimalism })
              }
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                principles.minimalism
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border ${
                  principles.minimalism
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {principles.minimalism && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Minimalismo Técnico</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Soluciones simples y directas sobre sistemas sobreoptimizados o dependencias infladas.
                </p>
              </div>
            </button>

            {/* Principio 2: Infraestructura Local & Privada */}
            <button
              type="button"
              onClick={() =>
                onChange({ ...principles, localFirst: !principles.localFirst })
              }
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                principles.localFirst
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border ${
                  principles.localFirst
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {principles.localFirst && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Infraestructura Local & Privada</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Prioridad absoluta a herramientas locales (stdio, files, docker local) antes que nubes externas.
                </p>
              </div>
            </button>

            {/* Principio 3: Estilo Comunicativo Punchy */}
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...principles,
                  punchyCommunication: !principles.punchyCommunication
                })
              }
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                principles.punchyCommunication
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border ${
                  principles.punchyCommunication
                    ? 'bg-indigo-500 border-indigo-400 text-white'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {principles.punchyCommunication && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Estilo Directo & Punchy</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Mensajes lógicos, viñetas directas, sin rodeos corporativos ni explicaciones redundantes.
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
