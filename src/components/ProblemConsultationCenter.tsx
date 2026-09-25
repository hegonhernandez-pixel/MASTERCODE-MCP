import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Loader2,
  FileCode2,
  Download,
  Copy,
  Check,
  Brain,
  Cpu,
  Shield,
  Workflow,
  CheckCircle2,
  Terminal,
  HelpCircle,
  FolderGit2,
  Boxes
} from 'lucide-react';
import { ProblemPreset, CognitiveOrchestrationResult } from '../types';
import { PROBLEM_PRESETS } from '../data/presets';

interface ProblemConsultationCenterProps {
  topic: string;
  context: string;
  onTopicChange: (t: string) => void;
  onContextChange: (c: string) => void;
  onGenerateSolution: () => Promise<void>;
  loading: boolean;
  result: CognitiveOrchestrationResult | null;
}

export const ProblemConsultationCenter: React.FC<ProblemConsultationCenterProps> = ({
  topic,
  context,
  onTopicChange,
  onContextChange,
  onGenerateSolution,
  loading,
  result,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('os-architecture');
  const [activeOutputTab, setActiveOutputTab] = useState<'screen-text' | 'json' | 'deploy-yml'>('screen-text');
  const [copiedJson, setCopiedJson] = useState(false);

  const handleSelectPreset = (preset: ProblemPreset) => {
    setSelectedPresetId(preset.id);
    onTopicChange(preset.topic);
    onContextChange(preset.context);
  };

  const getFullSolutionJson = () => {
    if (!result) return '';
    return JSON.stringify(result, null, 2);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(getFullSolutionJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = getFullSolutionJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result?.machine_readable_spec.appName || 'solution'}-spec.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/95 border border-cyan-800/40 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-6">
      {/* Consultation Input Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Terminal className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Consultar Problema, Pregunta o Describir Aplicación a Desarrollar
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Los 4 agentes generarán su solución de forma independiente y debatirán hasta el consenso
          </span>
        </div>

        {/* Presets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-slate-500 shrink-0">Ejemplos:</span>
          {PROBLEM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1 rounded-lg border shrink-0 transition-all cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Escribe el problema a consultar (Ej. Diseñar y construir un Sistema Operativo moderno y ligero...)"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 leading-relaxed shadow-inner"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] font-mono text-slate-500">
              Presiona para que los agentes expongan su idea en el servidor MCP y el orquestador genere la solución.
            </div>

            <button
              onClick={() => onGenerateSolution()}
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deliberando Solución en Servidor MCP...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                  <span>⚡ Empezar a Generar Solución</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* When Solution is Available: Display Deliberation & Solution */}
      {result && (
        <div className="pt-4 border-t border-slate-800 space-y-6 animate-fade-in">
          {/* Section: Ideas Expuestas de Forma Independiente por los 4 Agentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold font-mono text-purple-300 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>Ideas y Soluciones Expuestas de Forma Independiente por Cada Agente:</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                4 Modelos Heterogéneos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Agente 1 (Claude Code) */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agente 1 (Claude Code): Pensamiento Analítico</span>
                  </span>
                  <span className="text-slate-500">Repositorios & Contratos</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  "{result.agent1_analytical.opinion}"
                </p>
              </div>

              {/* Agente 2 (GPT-4o) */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Agente 2 (GPT-4o): Resolutor Pragmático</span>
                  </span>
                  <span className="text-slate-500">Distribuciones Base</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  "{result.agent2_solver.opinion}"
                </p>
              </div>

              {/* Agente 3 (Gemini 2.5 Pro) */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Agente 3 (Gemini 2.5 Pro): Cuestionador Crítico</span>
                  </span>
                  <span className="text-slate-500">From-Scratch & Seguridad</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  "{result.agent3_critic.opinion}"
                </p>
              </div>

              {/* Agente 4 (Gemini 3.8 Flash) */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5 text-purple-400" />
                    <span>Agente 4 (Gemini 3.8 Flash): Orquestador & Síntesis</span>
                  </span>
                  <span className="text-slate-500">Consenso Unificado</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  "{result.agent4_synthesizer.opinion}"
                </p>
              </div>
            </div>
          </div>

          {/* Section: Solución Definitiva Desplegada en Pantalla o JSON */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveOutputTab('screen-text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeOutputTab === 'screen-text'
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Solución en Pantalla (Texto & Arquitectura)
                </button>

                <button
                  onClick={() => setActiveOutputTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeOutputTab === 'json'
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formato JSON Estructurado (app-solution-spec.json)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition-colors"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copiado' : 'Copiar JSON'}</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-[11px] shadow transition-colors"
                >
                  <Download className="w-3 h-3 stroke-[2.5]" />
                  <span>Descargar Archivo JSON</span>
                </button>
              </div>
            </div>

            {/* View 1: Screen Text & Analysis */}
            {activeOutputTab === 'screen-text' && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Solución Orquestada para: {result.machine_readable_spec.appName}</span>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-slate-400 font-bold block uppercase text-[11px]">
                    Análisis del Comportamiento Adecuado entre los 4 Agentes:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {result.agent4_synthesizer.behavioralConsensusAnalysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <span className="font-mono text-emerald-400 font-bold block text-[11px]">
                      Pasos de Implementación Accionables:
                    </span>
                    <ul className="space-y-1 pl-1 text-slate-300">
                      {result.agent2_solver.details.actionableSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-mono select-none">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-mono text-purple-400 font-bold block text-[11px]">
                      Reconciliación y Veredicto Final:
                    </span>
                    <ul className="space-y-1 pl-1 text-slate-300">
                      {result.agent4_synthesizer.details.debateReconciliation.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-mono select-none">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Structured JSON Viewer */}
            {activeOutputTab === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>app-solution-spec.json • Especificación lista para programas de creación de aplicaciones</span>
                  <span>{getFullSolutionJson().length} bytes</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-purple-200 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
                  <code>{getFullSolutionJson()}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
