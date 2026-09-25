import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { DeployedAgent } from '../types';

interface EditCognitiveModalProps {
  agent: DeployedAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentId: string, updatedArchitecture: any) => Promise<void>;
}

export const EditCognitiveModal: React.FC<EditCognitiveModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !agent) return null;

  const [matrixOfThought, setMatrixOfThought] = useState(
    agent.cognitiveArchitecture.matrixOfThought
  );
  const [biasDirective, setBiasDirective] = useState(
    agent.cognitiveArchitecture.biasDirective
  );
  const [symbolicLink, setSymbolicLink] = useState(
    agent.cognitiveArchitecture.symbolicLink
  );
  const [decisionRules, setDecisionRules] = useState<string[]>(
    [...agent.cognitiveArchitecture.decisionRules]
  );
  const [newRule, setNewRule] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddRule = () => {
    if (newRule.trim()) {
      setDecisionRules([...decisionRules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setDecisionRules(decisionRules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSave(agent.id, {
        matrixOfThought,
        biasDirective,
        symbolicLink,
        decisionRules,
        contextSummary: agent.cognitiveArchitecture.contextSummary,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Modificar Arquitectura Cognitiva
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {agent.name} • {agent.model.modelName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Enlace Simbólico */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>Enlace Simbólico Rector (Symlink):</span>
              <span className="text-[10px] text-purple-400 font-normal">Identificador de anclaje de memoria</span>
            </label>
            <input
              type="text"
              value={symbolicLink}
              onChange={(e) => setSymbolicLink(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="symlink://identity/role/directive"
              required
            />
          </div>

          {/* Directiva de Sesgo */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>Directiva de Sesgo Deliberativo:</span>
              <span className="text-[10px] text-slate-400 font-normal">Criterio estricto de decisión del agente</span>
            </label>
            <textarea
              rows={2}
              value={biasDirective}
              onChange={(e) => setBiasDirective(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Ejemplo: Priorizar aislamiento total en Stdio local y contratos formales..."
              required
            />
          </div>

          {/* Matriz de Pensamiento */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>Matriz de Pensamiento (Lógica Fundamental):</span>
              <span className="text-[10px] text-slate-400 font-normal">Base epistemológica y de razonamiento</span>
            </label>
            <textarea
              rows={3}
              value={matrixOfThought}
              onChange={(e) => setMatrixOfThought(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Descomposición formal de primer principio..."
              required
            />
          </div>

          {/* Reglas de Decisión */}
          <div className="space-y-2">
            <label className="font-mono text-slate-300 font-bold block">
              Reglas de Decisión Inmutables ({decisionRules.length}):
            </label>
            
            <div className="space-y-1.5">
              {decisionRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <span className="text-slate-300 font-mono text-[11px] truncate">{rule}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                placeholder="Añadir nueva regla de decisión..."
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-mono text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Arquitectura cognitiva guardada en el servidor MasterCode MCP.</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-mono text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Arquitectura'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
