/**
 * DEPRECADO (V2) — este archivo ya no se usa.
 *
 * Reemplazado por, para no repetir la doble fuente de verdad detectada
 * la sesión pasada (este archivo vs. el endpoint /api/agents, con
 * "gemma4" apuntando a un modelo que no existía):
 *   - Registro central de agentes: src/agents/registry.ts
 *   - Providers (Ollama, Electron-LLM, Gemini, Copilot): src/agents/providers.ts
 *   - Orquestación de 7 pasos: src/agents/orchestration.ts
 *   - Directivas (compresión de contexto, etc.): src/agents/directives.ts
 *
 * Se deja este archivo solo como referencia histórica; no se importa
 * desde ningún lado. Puede borrarse con seguridad.
 */
export {};
