import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';
import type { ModelProvider } from '../types.js';

/**
 * PROVIDERS — V2
 * -----------------------------------------------------------------------
 * Un provider es SOLO el canal hacia un modelo (local o cloud). No sabe
 * nada de rol, personalidad ni permisos del agente — eso vive en
 * `AgentDefinition` (src/types.ts) y en el registro central
 * (src/agents/registry.ts).
 *
 * Regla dura heredada de la sesión anterior: nunca ocultar el error real
 * detrás de un mensaje genérico tipo "(Error: modelo no disponible)".
 * Cada resultado trae `ok`, y si falla, el `error` real (mensaje +
 * endpoint + modelo).
 */

export interface ProviderQueryResult {
  ok: boolean;
  text?: string;
  error?: string;
  provider: ModelProvider;
  model: string;
  endpoint: string;
}

export interface ProviderAdapter {
  id: ModelProvider;
  isLocal: boolean; // true => se serializa/limita concurrencia (Ollama, Electron-LLM apps)
  checkHealth(): Promise<boolean>;
  listModels(): Promise<string[]>;
  query(model: string, prompt: string): Promise<ProviderQueryResult>;
}

// ---------------------------------------------------------------------------
// Ollama (local)
// ---------------------------------------------------------------------------

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

export const ollamaProvider: ProviderAdapter = {
  id: 'ollama',
  isLocal: true,
  async checkHealth() {
    try {
      const r = await fetch(`${OLLAMA_HOST}/api/tags`);
      return r.ok;
    } catch {
      return false;
    }
  },
  async listModels() {
    try {
      const r = await fetch(`${OLLAMA_HOST}/api/tags`);
      if (!r.ok) return [];
      const data = (await r.json()) as any;
      // Ollama devuelve tags completos, ej. "gemma3:4b", "llama3.2:3b"
      return data.models?.map((m: any) => m.model ?? m.name) || [];
    } catch {
      return [];
    }
  },
  async query(model, prompt) {
    const endpoint = `${OLLAMA_HOST}/api/generate`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        return {
          ok: false,
          provider: 'ollama',
          model,
          endpoint,
          error: `Ollama respondió ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ''}`,
        };
      }

      const data = (await response.json()) as any;
      return { ok: true, provider: 'ollama', model, endpoint, text: data.response ?? '' };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'ollama',
        model,
        endpoint,
        error: err?.message || String(err),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Electron-LLM apps locales (LM Studio, Jan.ai, etc.) — endpoint HTTP
// compatible con la API de OpenAI (/v1/chat/completions).
// ---------------------------------------------------------------------------

const ELECTRON_LLM_HOST = process.env.ELECTRON_LLM_HOST || 'http://localhost:1234';

export const electronLlmProvider: ProviderAdapter = {
  id: 'electron-llm',
  isLocal: true,
  async checkHealth() {
    try {
      const r = await fetch(`${ELECTRON_LLM_HOST}/v1/models`);
      return r.ok;
    } catch {
      return false;
    }
  },
  async listModels() {
    try {
      const r = await fetch(`${ELECTRON_LLM_HOST}/v1/models`);
      if (!r.ok) return [];
      const data = (await r.json()) as any;
      return data.data?.map((m: any) => m.id) || [];
    } catch {
      return [];
    }
  },
  async query(model, prompt) {
    const endpoint = `${ELECTRON_LLM_HOST}/v1/chat/completions`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        return {
          ok: false,
          provider: 'electron-llm',
          model,
          endpoint,
          error: `App local (${ELECTRON_LLM_HOST}) respondió ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ''}`,
        };
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content ?? '';
      return { ok: true, provider: 'electron-llm', model, endpoint, text };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'electron-llm',
        model,
        endpoint,
        error: err?.message || String(err),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Gemini API (cloud)
// ---------------------------------------------------------------------------

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

export const geminiProvider: ProviderAdapter = {
  id: 'gemini',
  isLocal: false,
  async checkHealth() {
    return Boolean(process.env.GEMINI_API_KEY);
  },
  async listModels() {
    // La lista de modelos Gemini se gestiona por config, no por discovery dinámico aquí.
    return ['gemini-2.5-pro', 'gemini-2.5-flash'];
  },
  async query(model, prompt) {
    const endpoint = 'gemini-api://generateContent';
    const client = getGeminiClient();
    if (!client) {
      return {
        ok: false,
        provider: 'gemini',
        model,
        endpoint,
        error: 'GEMINI_API_KEY no configurada en el entorno',
      };
    }
    try {
      const result = await client.models.generateContent({
        model,
        contents: prompt,
      });
      return { ok: true, provider: 'gemini', model, endpoint, text: result.text ?? '' };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'gemini',
        model,
        endpoint,
        error: err?.message || String(err),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// GitHub Copilot API (cloud)
// -----------------------------------------------------------------------
// Copilot expone chat completions vía un endpoint compatible OpenAI cuando
// se posee un token de Copilot (distinto del PAT normal de GitHub). El host
// es configurable porque depende de cómo el usuario haya expuesto su token
// (proxy propio, extensión, etc.) — no asumimos una URL fija de producto.
// ---------------------------------------------------------------------------

const COPILOT_ENDPOINT =
  process.env.GITHUB_COPILOT_ENDPOINT || 'https://api.githubcopilot.com/chat/completions';

export const githubCopilotProvider: ProviderAdapter = {
  id: 'github-copilot',
  isLocal: false,
  async checkHealth() {
    return Boolean(process.env.GITHUB_COPILOT_TOKEN);
  },
  async listModels() {
    return ['gpt-4o', 'gpt-4.1'];
  },
  async query(model, prompt) {
    if (!process.env.GITHUB_COPILOT_TOKEN) {
      return {
        ok: false,
        provider: 'github-copilot',
        model,
        endpoint: COPILOT_ENDPOINT,
        error: 'GITHUB_COPILOT_TOKEN no configurado en el entorno',
      };
    }
    try {
      const response = await fetch(COPILOT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GITHUB_COPILOT_TOKEN}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        return {
          ok: false,
          provider: 'github-copilot',
          model,
          endpoint: COPILOT_ENDPOINT,
          error: `Copilot API respondió ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 300)}` : ''}`,
        };
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content ?? '';
      return { ok: true, provider: 'github-copilot', model, endpoint: COPILOT_ENDPOINT, text };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'github-copilot',
        model,
        endpoint: COPILOT_ENDPOINT,
        error: err?.message || String(err),
      };
    }
  },
};

export const providerRegistry: Record<ModelProvider, ProviderAdapter | undefined> = {
  ollama: ollamaProvider,
  'electron-llm': electronLlmProvider,
  gemini: geminiProvider,
  'github-copilot': githubCopilotProvider,
  'claude-code': undefined,
  gpt: undefined,
};

export function getProvider(id: ModelProvider): ProviderAdapter | undefined {
  return providerRegistry[id];
}

// ---------------------------------------------------------------------------
// Gobierno de concurrencia: los providers locales (Ollama, apps Electron)
// comparten CPU/RAM/VRAM y deben serializarse; los cloud pueden ir en
// paralelo sin restricción del orquestador.
// ---------------------------------------------------------------------------

class LocalConcurrencyGate {
  private queue: Promise<void> = Promise.resolve();

  /** Encola `fn` para que corra en serie respecto a cualquier otra llamada local. */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    let release!: () => void;
    const wait = new Promise<void>((resolve) => (release = resolve));
    const previous = this.queue;
    this.queue = this.queue.then(() => wait);
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

const localGate = new LocalConcurrencyGate();

/**
 * Ejecuta una consulta a través del provider correcto, respetando la regla:
 * local => serializado global; cloud => sin límite del orquestador (el
 * propio provider/API impone su rate limit).
 */
export async function queryThroughProvider(
  provider: ModelProvider,
  model: string,
  prompt: string
): Promise<ProviderQueryResult> {
  const adapter = getProvider(provider);
  if (!adapter) {
    return {
      ok: false,
      provider,
      model,
      endpoint: 'n/a',
      error: `No hay provider adapter implementado para "${provider}"`,
    };
  }
  if (adapter.isLocal) {
    return localGate.run(() => adapter.query(model, prompt));
  }
  return adapter.query(model, prompt);
}
