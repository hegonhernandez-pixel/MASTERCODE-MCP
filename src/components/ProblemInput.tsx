import React, { useState } from 'react';
import { Play, Sparkles, FileCode2, BookOpen, RotateCcw, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { PROBLEM_PRESETS } from '../data/presets';
import { ProblemPreset } from '../types';
import { InteractiveCursorInput } from './InteractiveCursorInput';

interface ProblemInputProps {
  topic: string;
  context: string;
  onTopicChange: (val: string) => void;
  onContextChange: (val: string) => void;
  onExecute: () => void;
  loading: boolean;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({
  topic,
  context,
  onTopicChange,
  onContextChange,
  onExecute,
  loading
}) => {
  const [showContext, setShowContext] = useState(false);

  const handleSelectPreset = (preset: ProblemPreset) => {
    onTopicChange(preset.topic);
    onContextChange(preset.context);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-950/50 space-y-5">
      {/* Preset pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Casos Preconfigurados (4 Modelos Heterogéneos & MCP Oficial)</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Haz clic para precargar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PROBLEM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {preset.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.shortDesc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main input with interactive Cursor */}
      <InteractiveCursorInput
        value={topic}
        onChange={onTopicChange}
        rows={3}
        label="Pregunta, Requerimiento o Desafío de Software:"
        sublabel="Inserta los requerimientos. El cursor interactivo te permite posicionar y agregar directivas con un clic."
        placeholder="Ej: Implementar un servidor MCP con transporte Stdio, compatible con Docker y con un ejecutable para Windows..."
      />

      {/* Context collapser with interactive Cursor */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowContext(!showContext)}
          className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1"
        >
          <span className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contexto Técnico Adicional, Archivos Previos o Variables ({context ? 'Activo' : 'Opcional'})</span>
          </span>
          {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showContext && (
          <div className="mt-3">
            <InteractiveCursorInput
              value={context}
              onChange={onContextChange}
              rows={4}
              label="Contexto Técnico o Código Fuente Base:"
              sublabel="Pega aquí código, archivos de configuración, endpoints de APIs o especificaciones previas."
              placeholder="Pega aquí snippets de código, variables de entorno o restricciones adicionales..."
            />
          </div>
        )}
      </div>

      {/* Model Attribution Bar & Execution Trigger */}
      <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
            A1: Claude Code
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            A2: GPT-4o
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            A3: Gemini 2.5 Pro
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
            A4: Gemini 3.8
          </span>
        </div>

        <button
          onClick={onExecute}
          disabled={loading || !topic.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 text-white font-medium text-xs font-mono shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-white" />
              <span>Deliberando 4 Modelos Heterogéneos...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Ejecutar Flujo de 4 Agentes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
