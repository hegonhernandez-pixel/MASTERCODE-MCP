import React from 'react';
import { ArrowRight, Brain, Zap, AlertTriangle, Award, Bot, FileCheck, Layers, Rocket } from 'lucide-react';

interface DebateTimelineProps {
  activeStep?: number;
}

export const DebateTimeline: React.FC<DebateTimelineProps> = ({ activeStep = 5 }) => {
  const steps = [
    {
      id: 1,
      name: 'Agente 1',
      model: 'Claude Code',
      sub: 'Analista Estructural',
      role: 'Pensamiento Analítico',
      icon: <Brain className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/60 bg-amber-950/40 text-amber-300'
    },
    {
      id: 2,
      name: 'Agente 2',
      model: 'GPT-4o',
      sub: 'Resolutor Pragmático',
      role: 'Resolución de Problemas',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
    },
    {
      id: 3,
      name: 'Agente 3',
      model: 'Gemini 2.5 Pro',
      sub: 'Cuestionador Crítico',
      role: 'Cuestiona el Trasflujo',
      icon: <AlertTriangle className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300'
    },
    {
      id: 4,
      name: 'Agente 4',
      model: 'Gemini 3.8',
      sub: 'Sintetizador Decisor',
      role: 'Debate de los 3 Agentes',
      icon: <Award className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/60 bg-purple-950/40 text-purple-300'
    },
    {
      id: 5,
      name: 'Ejecutor Autónomo',
      model: 'Orquestador MCP',
      sub: 'GitHub / Win / Docker / Video',
      role: 'Despliegue Implementable',
      icon: <Rocket className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300'
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4 overflow-x-auto">
      <div className="min-w-[800px] flex items-center justify-between gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex-1 p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                activeStep >= step.id
                  ? step.color
                  : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/50 shadow shrink-0">
                {step.icon}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold truncate">
                  <span>{step.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-200 border border-slate-700 font-normal">
                    {step.model}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">{step.sub}</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">{step.role}</div>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex items-center text-slate-600 px-0.5 shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
