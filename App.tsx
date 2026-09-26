import React, { useState, useEffect } from 'react';
import './App.css';

interface Agent {
  id: string;
  name: string;
  role: string;
  model?: { engine: string; modelName: string };
  status?: string;
}

interface DeliberationResponse {
  success: boolean;
  topic: string;
  deliberation: Record<string, string>;
  synthesis: string;
  agents: number;
  error?: string;
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [topic, setTopic] = useState('');
  const [deliberating, setDeliberating] = useState(false);
  const [result, setResult] = useState<DeliberationResponse | null>(null);

  // Carga agentes reales del servidor
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/agents');
        const data = await response.json();

        if (data.success && data.agents) {
          setAgents(data.agents);
          console.log('MASTER CODE AGENTS:', data.agents);
          setSelectedAgent(data.agents[0]);
        }
        else {
          setError(data.error || 'No se pudieron cargar los agentes');
        }
      } catch (err) {
        setError('Error conectando al servidor: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
    // Recarga cada 10 segundos
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
      const response = await fetch('http://localhost:3000/api/orchestrate-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data: DeliberationResponse = await response.json();

      if (data.success) {
        setResult(data);
        setTopic('');
      } else {
        setError(data.error || 'Error en la deliberación');
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message);
    } finally {
      setDeliberating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🤖 MasterCode MCP - Multi-Agent Deliberation</h1>
        <p>Agentes locales + APIs = Inteligencia colectiva</p>
      </header>

      {/* ESTADO DE CONEXIÓN */}
      <div className={`status-bar ${loading ? 'loading' : agents.length > 0 ? 'connected' : 'error'}`}>
        {loading ? (
          <span>⏳ Conectando a servidor...</span>
        ) : agents.length > 0 ? (
          <span>✅ {agents.length} agentes activos</span>
        ) : (
          <span>❌ Error de conexión</span>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="main-layout">
        {/* PANEL IZQUIERDO: Agentes */}
        <section className="agents-panel">
          <h2>Agentes Disponibles</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : agents.length === 0 ? (
            <p className="no-agents">No hay agentes disponibles</p>
          ) : (
            <div className="agents-grid">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-icon">
                    {agent.model?.engine === 'ollama' ? '💻' : agent.model?.engine === 'gemini' ? '🌐' : '🤖'}
                  </div>
                  <h3>{agent.name}</h3>
                  <p className="agent-role">{agent.role}</p>
                  {agent.model?.modelName && <p className="agent-model">{agent.model.modelName}</p>}
                  <span className={`status-badge ${agent.status || 'deployed'}`}>{agent.status || 'deployed'}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PANEL DERECHO: Deliberación */}
        <section className="deliberation-panel">
          <h2>Deliberación Multi-Agente</h2>

          {selectedAgent && (
            <div className="agent-detail">
              <h3>{selectedAgent.name}</h3>
              <p>{selectedAgent.role}</p>
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

            <button type="submit" disabled={deliberating || agents.length === 0} className="btn-deliberate">
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

              <div className="opinions-container">
                <h4>Opiniones de los {result.agents} Agentes:</h4>
                <div className="opinions-grid">
                  {Object.entries(result.deliberation).map(([agentId, opinion]) => {
                    const agent = agents.find((a) => a.id === agentId);
                    return (
                      <div key={agentId} className="opinion-card">
                        <h5>{agent?.name || agentId}</h5>
                        <p className="opinion-text">{opinion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="synthesis-container">
                <h4>🎯 Síntesis Final</h4>
                <p className="synthesis-text">{result.synthesis}</p>
              </div>

              <button onClick={() => setResult(null)} className="btn-clear">
                Limpiar Resultados
              </button>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>MasterCode MCP v1.0 | Agentes: Ollama (Local) + Gemini/ChatGPT (Cloud)</p>
      </footer>
    </div>
  );
}
