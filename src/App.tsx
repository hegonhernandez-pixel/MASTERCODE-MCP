import React, { useState, useEffect } from 'react';
import './App.css';

// ---------------------------------------------------------------------------
// Tipos alineados con src/types.ts y las respuestas de server.ts (V2)
// ---------------------------------------------------------------------------

interface AgentDirective {
  id: string;
  kind: string;
  description: string;
  active: boolean;
  addedAt: string;
}

interface Agent {
  id: string;
  name: string;
  role: 'analytical' | 'solver' | 'critic' | 'synthesizer';
  provider: string;
  model: string;
  isLocal: boolean;
  available: boolean;
  lastError?: string;
  lastCheckedAt?: string;
  directives: AgentDirective[];
}

interface AgentsResponse {
  success: boolean;
  totalRegistered: number;
  totalAvailable: number;
  agents: Agent[];
  error?: string;
}

type DeliberationStepName =
  | 'independent-generation'
  | 'exchange-discussion'
  | 'individual-review'
  | 'resolution-prospective'
  | 'cross-review'
  | 'validation'
  | 'delivery';

interface DeliberationStepLog {
  step: DeliberationStepName;
  stepIndex: number;
  agentId: string;
  startedAt: string;
  finishedAt?: string;
  output?: string;
  error?: string;
}

interface DeliberationState {
  topic: string;
  startedAt: string;
  finishedAt?: string;
  steps: DeliberationStepLog[];
  synthesizerAgentId?: string;
  finalResult?: string;
}

interface OrchestrateResponse {
  success: boolean;
  topic: string;
  deliberationState: DeliberationState;
  finalResult?: string;
  synthesizerAgentId?: string;
  error?: string;
  message?: string;
}

const STEP_LABELS: Record<DeliberationStepName, string> = {
  'independent-generation': '1. Generación independiente',
  'exchange-discussion': '2. Intercambio y discusión',
  'individual-review': '3. Revisión individual',
  'resolution-prospective': '4. Resolución + análisis prospectivo',
  'cross-review': '5. Revisión cruzada',
  validation: '6. Validación (Sintetizador/Arquitecto)',
  delivery: '7. Entrega',
};

const PROVIDER_ICON: Record<string, string> = {
  ollama: '💻',
  'electron-llm': '🖥️',
  gemini: '🌐',
  'github-copilot': '🐙',
  'claude-code': '🤖',
  gpt: '🤖',
};

const API_BASE = 'http://localhost:3000';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [topic, setTopic] = useState('');
  const [deliberating, setDeliberating] = useState(false);
  const [result, setResult] = useState<OrchestrateResponse | null>(null);
  const [directiveBusyId, setDirectiveBusyId] = useState<string | null>(null);

  const loadAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/agents`);
      const data: AgentsResponse = await response.json();

      if (data.success && data.agents) {
        setAgents(data.agents);
        setTotalRegistered(data.totalRegistered);
        setSelectedAgent((prev) => data.agents.find((a) => a.id === prev?.id) || data.agents[0] || null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Error conectando al servidor: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeliberate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Por favor ingresa un tema');
      return;
    }

    setDeliberating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/orchestrate-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data: OrchestrateResponse = await response.json();

      if (data.success) {
        setResult(data);
        setTopic('');
      } else {
        setError(data.error || data.message || 'Error en la deliberación');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    } finally {
      setDeliberating(false);
    }
  };

  const toggleCompressionDirective = async (agent: Agent) => {
    setDirectiveBusyId(agent.id);
    try {
      const existing = agent.directives.find((d) => d.kind === 'context-compression');

      if (existing) {
        await fetch(`${API_BASE}/api/agents/${agent.id}/directives/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: !existing.active }),
        });
      } else {
        await fetch(`${API_BASE}/api/agents/${agent.id}/directives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'context-compression',
            description:
              'Comprime periódicamente el contexto a markdown para bajar RAM y tokens por request.',
          }),
        });
      }
      await loadAgents();
    } catch (err) {
      setError('Error actualizando directiva: ' + (err as Error).message);
    } finally {
      setDirectiveBusyId(null);
    }
  };

  // Agrupa los pasos de la deliberación en curso por número de paso, para
  // pintar la línea de tiempo de los 7 pasos con todos los agentes por paso.
  const stepsGrouped = result
    ? result.deliberationState.steps.reduce<Record<number, DeliberationStepLog[]>>((acc, log) => {
        (acc[log.stepIndex] ||= []).push(log);
        return acc;
      }, {})
    : {};

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🤖 MasterCode MCP - Multi-Agent Deliberation</h1>
        <p>Registro central de agentes (V2) — Ollama/Electron-LLM locales + Gemini/Copilot cloud</p>
      </header>

      <div className={`status-bar ${loading ? 'loading' : agents.some((a) => a.available) ? 'connected' : 'error'}`}>
        {loading ? (
          <span>⏳ Conectando a servidor...</span>
        ) : (
          <span>
            ✅ {agents.filter((a) => a.available).length} / {totalRegistered} agentes disponibles
          </span>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="main-layout">
        {/* PANEL IZQUIERDO: Agentes */}
        <section className="agents-panel">
          <h2>Registro de Agentes</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : agents.length === 0 ? (
            <p className="no-agents">No hay agentes registrados</p>
          ) : (
            <div className="agents-grid">
              {agents.map((agent) => {
                const compression = agent.directives.find((d) => d.kind === 'context-compression');
                return (
                  <div
                    key={agent.id}
                    className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''} ${
                      agent.available ? '' : 'agent-card-unavailable'
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="agent-icon">{PROVIDER_ICON[agent.provider] || '🤖'}</div>
                    <h3>{agent.name}</h3>
                    <p className="agent-role">{agent.role}</p>
                    <p className="agent-model">
                      {agent.provider} · {agent.model}
                    </p>
                    <span className={`status-badge ${agent.available ? 'deployed' : 'error'}`}>
                      {agent.available ? 'disponible' : 'no disponible'}
                    </span>
                    {!agent.available && agent.lastError && (
                      <p className="agent-error" title={agent.lastError}>
                        {agent.lastError}
                      </p>
                    )}
                    <button
                      type="button"
                      className={`btn-directive ${compression?.active ? 'btn-directive-active' : ''}`}
                      disabled={directiveBusyId === agent.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompressionDirective(agent);
                      }}
                    >
                      {compression?.active
                        ? '🗜️ Compresión de contexto: ON'
                        : compression
                        ? '🗜️ Compresión de contexto: OFF'
                        : '+ Compresión de contexto'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PANEL DERECHO: Deliberación */}
        <section className="deliberation-panel">
          <h2>Deliberación Multi-Agente (7 pasos)</h2>

          {selectedAgent && (
            <div className="agent-detail">
              <h3>{selectedAgent.name}</h3>
              <p>
                {selectedAgent.role} — {selectedAgent.provider}/{selectedAgent.model}
              </p>
              {selectedAgent.directives.length > 0 && (
                <ul className="directive-list">
                  {selectedAgent.directives.map((d) => (
                    <li key={d.id}>
                      {d.active ? '🟢' : '⚪'} {d.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleDeliberate} className="deliberation-form">
            <div className="form-group">
              <label htmlFor="topic">Tema o Pregunta:</label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: ¿Cuál es la mejor arquitectura para un servidor local?"
                rows={4}
                disabled={deliberating}
              />
            </div>

            <button
              type="submit"
              disabled={deliberating || agents.filter((a) => a.available).length === 0}
              className="btn-deliberate"
            >
              {deliberating ? '⏳ Deliberando...' : '🚀 Iniciar Deliberación'}
            </button>
          </form>

          {/* RESULTADOS */}
          {result && (
            <div className="results-section">
              <h3>Resultados de Deliberación</h3>

              <div className="topic-result">
                <strong>Tema:</strong> {result.topic}
              </div>

              <div className="steps-timeline">
                {Object.entries(stepsGrouped)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([stepIndex, logs]) => (
                    <div key={stepIndex} className="step-block">
                      <h4>{STEP_LABELS[logs[0].step]}</h4>
                      <div className="opinions-grid">
                        {logs.map((log) => {
                          const agent = agents.find((a) => a.id === log.agentId);
                          return (
                            <div key={`${log.step}-${log.agentId}`} className="opinion-card">
                              <h5>{agent?.name || log.agentId}</h5>
                              {log.error ? (
                                <p className="agent-error">{log.error}</p>
                              ) : (
                                <p className="opinion-text">{log.output}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="synthesis-container">
                <h4>🎯 Resultado Final (Sintetizador/Arquitecto)</h4>
                <p className="synthesis-text">
                  {result.finalResult || '(Sin resultado — revisa el paso de validación arriba)'}
                </p>
              </div>

              <button onClick={() => setResult(null)} className="btn-clear">
                Limpiar Resultados
              </button>
            </div>
          )}
        </section>
      </div>

      <footer className="app-footer">
        <p>MasterCode MCP v2 | Registro central: {totalRegistered} agentes | Ollama/Electron-LLM (local) + Gemini/Copilot (cloud)</p>
      </footer>
    </div>
  );
}
