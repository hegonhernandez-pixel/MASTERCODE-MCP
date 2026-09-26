import type { AgentDefinition, AgentDirective, AgentCapabilityPermissions } from '../types.js';
import { getProvider, queryThroughProvider } from './providers.js';
import type { ProviderQueryResult } from './providers.js';

/**
 * REGISTRO CENTRAL DE AGENTES — V2
 * -----------------------------------------------------------------------
 * Corrige el bug detectado en la sesión anterior: existían DOS fuentes de
 * verdad (el endpoint /api/agents y `localAgentsConfig`), con 5 agentes en
 * una y 4 en la otra, y un modelo inexistente ("gemma4" en vez de
 * "gemma4:26b") generando un agente fantasma con error. Esta lista es la
 * ÚNICA fuente; tanto /api/agents como la deliberación la leen de aquí.
 *
 * Poda pedida: 2-3 agentes locales "core" (el resto va a providers cloud).
 */

function defaultPermissions(): AgentCapabilityPermissions {
  return {
    filesystem: false,
    gitRepos: false,
    workflowExecution: false,
    process: false,
    docker: false,
    externalApis: false,
    mcp: false,
  };
}

function emptyPersonality(history: string) {
  return {
    history,
    instructions: '',
    attitude: '',
    style: '',
    examples: [],
  };
}

/**
 * Definición base del registro. `runtime.available` se recalcula en caliente
 * vía `refreshRegistryAvailability()` — nunca se asume estático.
 */
export const AGENT_REGISTRY: AgentDefinition[] = [
  // --- Agentes locales "core" (Ollama) ---------------------------------
  {
    id: 'agent-analytical-local',
    role: 'analytical',
    name: 'Analista Estructural (local)',
    provider: 'ollama',
    modelName: process.env.OLLAMA_MODEL_ANALYTICAL || 'llama3.2:3b',
    isLocal: true,
    personality: emptyPersonality('Analista estructural: descompone variables, restricciones y dependencias.'),
    directives: [],
    capabilities: defaultPermissions(),
    runtime: { available: false, endpoint: '' },
  },
  {
    id: 'agent-solver-local',
    role: 'solver',
    name: 'Resolutor Pragmático (local)',
    provider: 'ollama',
    modelName: process.env.OLLAMA_MODEL_SOLVER || 'gemma3:4b',
    isLocal: true,
    personality: emptyPersonality('Resolutor pragmático: prioriza la solución más simple que funcione.'),
    directives: [],
    capabilities: defaultPermissions(),
    runtime: { available: false, endpoint: '' },
  },

  // --- Agentes cloud (el resto se poda del set local, como se pidió) ---
  {
    id: 'agent-critic-gemini',
    role: 'critic',
    name: 'Cuestionador Crítico / Red Team (Gemini)',
    provider: 'gemini',
    modelName: process.env.GEMINI_MODEL_CRITIC || 'gemini-2.5-flash',
    isLocal: false,
    personality: emptyPersonality('Red team: busca objeciones, casos borde y contradicciones.'),
    directives: [],
    capabilities: defaultPermissions(),
    runtime: { available: false, endpoint: '' },
  },
  {
    id: 'agent-synthesizer-gemini',
    role: 'synthesizer',
    name: 'Sintetizador / Arquitecto (Gemini)',
    provider: 'gemini',
    modelName: process.env.GEMINI_MODEL_SYNTHESIZER || 'gemini-2.5-pro',
    isLocal: false,
    personality: emptyPersonality('Sintetizador/Arquitecto: reconcilia el debate y valida el resultado final (doble función).'),
    directives: [],
    capabilities: defaultPermissions(),
    runtime: { available: false, endpoint: '' },
  },
  {
    id: 'agent-solver-copilot',
    role: 'solver',
    name: 'Resolutor (GitHub Copilot)',
    provider: 'github-copilot',
    modelName: process.env.COPILOT_MODEL_SOLVER || 'gpt-4o',
    isLocal: false,
    personality: emptyPersonality('Resolutor orientado a código, apoyado en Copilot.'),
    directives: [],
    capabilities: defaultPermissions(),
    runtime: { available: false, endpoint: '' },
  },
];

/** Recalcula disponibilidad real de cada agente contra su provider. No oculta errores. */
export async function refreshRegistryAvailability(): Promise<AgentDefinition[]> {
  await Promise.all(
    AGENT_REGISTRY.map(async (agent) => {
      const adapter = getProvider(agent.provider);
      agent.runtime.lastCheckedAt = new Date().toISOString();

      if (!adapter) {
        agent.runtime.available = false;
        agent.runtime.lastError = `Provider "${agent.provider}" sin adapter implementado`;
        return;
      }

      try {
        const healthy = await adapter.checkHealth();
        if (!healthy) {
          agent.runtime.available = false;
          agent.runtime.lastError = `Provider "${agent.provider}" no responde (health check falló)`;
          return;
        }

        // Para providers con discovery dinámico (Ollama, Electron-LLM), confirmamos
        // que el modelo configurado realmente existe — así se evita el bug de
        // "gemma4" apuntando a un modelo que no está instalado.
        if (agent.provider === 'ollama' || agent.provider === 'electron-llm') {
          const models = await adapter.listModels();
          const found = models.some((m) => m === agent.modelName || m.startsWith(`${agent.modelName}`));
          if (!found) {
            agent.runtime.available = false;
            agent.runtime.lastError = `Modelo "${agent.modelName}" no está instalado en ${agent.provider}. Modelos disponibles: ${models.join(', ') || '(ninguno)'}`;
            return;
          }
        }

        agent.runtime.available = true;
        agent.runtime.lastError = undefined;
      } catch (err: any) {
        agent.runtime.available = false;
        agent.runtime.lastError = err?.message || String(err);
      }
    })
  );
  return AGENT_REGISTRY;
}

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function getAvailableAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.runtime.available);
}

export function getSynthesizerAgent(): AgentDefinition | undefined {
  // El Sintetizador/Arquitecto hace doble función de validador — no se
  // introduce un 5º agente nuevo para validar (confirmado por el usuario).
  return AGENT_REGISTRY.find((a) => a.role === 'synthesizer' && a.runtime.available);
}

// ---------------------------------------------------------------------------
// Directivas por agente (memoria de agente — sección 5 del doc V2)
// ---------------------------------------------------------------------------

export function addDirective(agentId: string, directive: Omit<AgentDirective, 'id' | 'addedAt'>): AgentDirective | null {
  const agent = getAgent(agentId);
  if (!agent) return null;
  const newDirective: AgentDirective = {
    ...directive,
    id: `dir-${agentId}-${Date.now()}`,
    addedAt: new Date().toISOString(),
  };
  agent.directives.push(newDirective);
  return newDirective;
}

export function toggleDirective(agentId: string, directiveId: string, active: boolean): boolean {
  const agent = getAgent(agentId);
  const directive = agent?.directives.find((d) => d.id === directiveId);
  if (!directive) return false;
  directive.active = active;
  return true;
}

/** Query directa a un agente del registro (usa el provider correcto + gate de concurrencia). */
export async function queryAgent(agentId: string, prompt: string): Promise<ProviderQueryResult> {
  const agent = getAgent(agentId);
  if (!agent) {
    return {
      ok: false,
      provider: 'ollama',
      model: 'n/a',
      endpoint: 'n/a',
      error: `Agente "${agentId}" no existe en el registro`,
    };
  }
  return queryThroughProvider(agent.provider, agent.modelName, prompt);
}
