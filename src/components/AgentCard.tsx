import React from 'react';
import {
  Brain,
  Zap,
  AlertTriangle,
  Award,
  CheckCircle2,
  Code,
  ShieldAlert,
  GitPullRequest,
  Sparkles,
  Bot,
  MessageSquare,
  Link2,
  Workflow
} from 'lucide-react';
import {
  AnalyticalAgentData,
  SolverAgentData,
  CriticAgentData,
  SynthesizerAgentData
} from '../types';

interface AgentCardProps {
  type: 'agent1' | 'agent2' | 'agent3' | 'agent4';
  data:
    | AnalyticalAgentData
    | SolverAgentData
    | CriticAgentData
    | SynthesizerAgentData;
  isActive?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ type, data }) => {
  const getAgentConfig = () => {
    switch (type) {
      case 'agent1':
        return {
          icon: <Brain className="w-5 h-5 text-amber-400" />,
          borderColor: 'border-amber-500/40 hover:border-amber-400/60',
          bgHeader: 'bg-amber-950/40 text-amber-200',
          badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          modelTag: 'Claude Code (Anthropic)',
          modelBadgeBg: 'bg-orange-950 text-orange-300 border-orange-700/60',
        };
      case 'agent2':
        return {
          icon: <Zap className="w-5 h-5 text-emerald-400" />,
          borderColor: 'border-emerald-500/40 hover:border-emerald-400/60',
          bgHeader: 'bg-emerald-950/40 text-emerald-200',
          badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          modelTag: 'GPT-4o (OpenAI)',
          modelBadgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
        };
      case 'agent3':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-cyan-400" />,
          borderColor: 'border-cyan-500/40 hover:border-cyan-400/60',
          bgHeader: 'bg-cyan-950/40 text-cyan-200',
          badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          modelTag: 'Gemini 2.5 Pro (Google)',
          modelBadgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-700/60',
        };
      case 'agent4':
        return {
          icon: <Award className="w-5 h-5 text-purple-400" />,
          borderColor: 'border-purple-500/40 hover:border-purple-400/60',
          bgHeader: 'bg-purple-950/40 text-purple-200',
          badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          modelTag: 'Gemini 3.8 / Flash (Google)',
          modelBadgeBg: 'bg-purple-950 text-purple-300 border-purple-700/60',
        };
    }
  };

  const config = getAgentConfig();

  return (
    <div
      className={`rounded-2xl border ${config.borderColor} bg-slate-900/90 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-cyan-950/20`}
    >
      {/* Header bar */}
      <div className={`p-4 border-b border-slate-800 ${config.bgHeader} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>{data.name}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono block">
              {data.role}
            </span>
          </div>
        </div>

        {/* Model Engine Badge */}
        <div className="flex flex-col items-end gap-1">
          <div
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${config.modelBadgeBg}`}
          >
            <Bot className="w-3 h-3" />
            <span>{data.model?.modelName || config.modelTag}</span>
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
            {data.confidence}% conf.
          </div>
        </div>
      </div>

      {/* Symbolic Link Badge if present */}
      {data.symbolicRuleApplied && (
        <div className="px-3.5 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-purple-300 truncate">
          <Link2 className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="text-slate-400">Enlace Simbólico Activo:</span>
          <span className="truncate">{data.symbolicRuleApplied}</span>
        </div>
      )}

      {/* Summary quote */}
      <div className="p-3.5 bg-slate-950/50 border-b border-slate-800/80">
        <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
          "{data.summary}"
        </p>
      </div>

      {/* Individual Agent Opinion Box */}
      {data.opinion && (
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-200 mb-1">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Opinión Individual del Agente:</span>
          </div>
          <p className="text-xs text-cyan-100/90 font-sans leading-relaxed">
            {data.opinion}
          </p>
        </div>
      )}

      {/* Detailed Agent Logic */}
      <div className="p-4 flex-1 space-y-3.5 text-xs">
        {type === 'agent1' && (() => {
          const a1 = data as AnalyticalAgentData;
          return (
            <>
              <div>
                <span className="font-mono text-amber-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3 h-3" /> Variables y Desglose Lógico (Claude Code):
                </span>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px] pl-2 border-l border-amber-500/30">
                  {a1.details.variables.map((v, i) => (
                    <li key={i} className="leading-snug">• {v}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-amber-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <GitPullRequest className="w-3 h-3" /> Restricciones & Dependencias:
                </span>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px] pl-2 border-l border-orange-500/30">
                  {a1.details.constraints.concat(a1.details.dependencyTree).slice(0, 4).map((c, i) => (
                    <li key={i} className="leading-snug">• {c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-mono text-slate-400 text-[10px] block mb-0.5">Veredicto Analítico Fundamental:</span>
                <p className="text-slate-200 text-[11px] font-sans">
                  {a1.details.logicalVerdict}
                </p>
              </div>
            </>
          );
        })()}

        {type === 'agent2' && (() => {
          const a2 = data as SolverAgentData;
          return (
            <>
              <div>
                <span className="font-mono text-emerald-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3" /> Enfoque Pragmático (GPT-4o):
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {a2.details.coreApproach}
                </p>
              </div>

              <div>
                <span className="font-mono text-emerald-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Pasos de Implementación Accionables:
                </span>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px] pl-2 border-l border-emerald-500/30">
                  {a2.details.actionableSteps.map((s, i) => (
                    <li key={i} className="leading-snug">• {s}</li>
                  ))}
                </ul>
              </div>

              {a2.details.codeHighlight && (
                <div>
                  <span className="font-mono text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                    <Code className="w-3 h-3 text-emerald-400" /> Solución en Código Mínimo:
                  </span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-32">
                    <code>{a2.details.codeHighlight}</code>
                  </pre>
                </div>
              )}
            </>
          );
        })()}

        {type === 'agent3' && (() => {
          const a3 = data as CriticAgentData;
          return (
            <>
              <div>
                <span className="font-mono text-cyan-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <ShieldAlert className="w-3 h-3" /> Cuestionamientos de Fragilidad (Gemini 2.5 Pro):
                </span>
                <ul className="space-y-1.5 text-slate-300 font-mono text-[11px] pl-2 border-l border-cyan-500/40">
                  {a3.details.objectionsRaised.map((obj, i) => (
                    <li key={i} className="leading-snug text-cyan-200/90">
                      ⚡ {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-mono text-rose-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3 h-3" /> Refinamientos Exigidos antes de Desplegar:
                </span>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px] pl-2 border-l border-rose-500/30">
                  {a3.details.refinementsMandated.map((ref, i) => (
                    <li key={i} className="leading-snug">• {ref}</li>
                  ))}
                </ul>
              </div>
            </>
          );
        })()}

        {type === 'agent4' && (() => {
          const a4 = data as SynthesizerAgentData;
          return (
            <>
              {/* Highlight of behavioral consensus analysis */}
              {a4.behavioralConsensusAnalysis && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-mono font-bold text-[11px]">
                    <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Análisis del Comportamiento Adecuado entre los 4 (Consenso Unificado):</span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed">
                    {a4.behavioralConsensusAnalysis}
                  </p>
                </div>
              )}

              <div>
                <span className="font-mono text-purple-400 font-semibold uppercase text-[11px] flex items-center gap-1 mb-1.5">
                  <Award className="w-3 h-3" /> Debate & Arbitraje Cruzado (Gemini 3.8 Flash):
                </span>
                <ul className="space-y-1.5 text-slate-300 font-mono text-[11px] pl-2 border-l border-purple-500/40">
                  {a4.details.debateReconciliation.map((point, i) => (
                    <li key={i} className="leading-snug">
                      ✔ {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 bg-purple-950/20 p-2.5 rounded-xl border border-purple-800/30">
                <span className="font-mono text-purple-300 font-bold text-[10px] block mb-1">
                  VEREDICTO & ESTRUCTURA DE APLICACIÓN:
                </span>
                <p className="text-slate-100 text-xs font-sans font-medium">
                  {a4.details.finalVerdict}
                </p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};
