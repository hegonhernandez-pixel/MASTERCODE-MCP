import type { AgentDefinition, DeliberationState, DeliberationStepLog, DeliberationStepName } from '../types.js';
import { getAvailableAgents, getSynthesizerAgent, queryAgent } from './registry.js';

/**
 * ORQUESTACIÓN DE DELIBERACIÓN — V2, sección 3
 * -----------------------------------------------------------------------
 * 1. Generación independiente (cada agente propone sin ver a los demás)
 * 2. Intercambio y discusión
 * 3. Revisión individual (adopta/implementa lo mejor de las demás)
 * 4. Resolución con análisis prospectivo (implicaciones + correcciones anticipadas)
 * 5. Segunda ronda de revisión cruzada
 * 6. Validación — a cargo del Sintetizador/Arquitecto (doble función, sin agente nuevo)
 * 7. Entrega del resultado
 *
 * Cada paso queda como un `DeliberationStepLog` explícito y loggeable. Los
 * errores reales de cada agente se conservan (nunca se colapsan a un
 * mensaje genérico) — si un agente falla, su output queda vacío y su
 * `error` real queda registrado; el resto de la deliberación continúa.
 */

const STEP_ORDER: DeliberationStepName[] = [
  'independent-generation',
  'exchange-discussion',
  'individual-review',
  'resolution-prospective',
  'cross-review',
  'validation',
  'delivery',
];

function newLog(step: DeliberationStepName, stepIndex: number, agentId: string): DeliberationStepLog {
  return { step, stepIndex, agentId, startedAt: new Date().toISOString() };
}

async function runStepForAgent(
  agent: AgentDefinition,
  step: DeliberationStepName,
  stepIndex: number,
  prompt: string,
  state: DeliberationState
): Promise<string | undefined> {
  const log = newLog(step, stepIndex, agent.id);
  state.steps.push(log);

  const result = await queryAgent(agent.id, prompt);
  log.finishedAt = new Date().toISOString();

  if (!result.ok) {
    log.error = result.error;
    return undefined;
  }

  log.output = result.text;
  return result.text;
}

export async function runDeliberation(topic: string): Promise<DeliberationState> {
  const state: DeliberationState = {
    topic,
    startedAt: new Date().toISOString(),
    steps: [],
  };

  const agents = getAvailableAgents();
  if (agents.length === 0) {
    state.finishedAt = new Date().toISOString();
    state.finalResult = '(Sin agentes disponibles — revisa /api/agents para ver el estado y el error real de cada uno)';
    return state;
  }

  // --- Paso 1: generación independiente ---------------------------------
  const step1Prompt = `Tema: "${topic}"\n\nDa tu propuesta inicial, directa y breve (máx. 120 palabras), sin ver la de otros agentes.`;
  const proposals = new Map<string, string>();
  await Promise.all(
    agents.map(async (agent) => {
      const out = await runStepForAgent(agent, 'independent-generation', 1, step1Prompt, state);
      if (out) proposals.set(agent.id, out);
    })
  );

  // --- Paso 2: intercambio y discusión -----------------------------------
  const allProposalsText = [...proposals.entries()]
    .map(([id, text]) => `- ${agents.find((a) => a.id === id)?.name || id}: ${text}`)
    .join('\n');
  const step2Prompt = `Tema: "${topic}"\n\nPropuestas de todos los agentes:\n${allProposalsText}\n\nComenta brevemente qué te parece de las otras propuestas (máx. 100 palabras).`;
  const discussion = new Map<string, string>();
  await Promise.all(
    agents.map(async (agent) => {
      const out = await runStepForAgent(agent, 'exchange-discussion', 2, step2Prompt, state);
      if (out) discussion.set(agent.id, out);
    })
  );

  // --- Paso 3: revisión individual (adopta lo mejor de las demás) -------
  const discussionText = [...discussion.entries()]
    .map(([id, text]) => `- ${agents.find((a) => a.id === id)?.name || id}: ${text}`)
    .join('\n');
  const step3Prompt = `Tema: "${topic}"\n\nDiscusión:\n${discussionText}\n\nRevisa tu propuesta original adoptando lo mejor de las demás. Da tu versión revisada (máx. 120 palabras).`;
  const revisions = new Map<string, string>();
  await Promise.all(
    agents.map(async (agent) => {
      const out = await runStepForAgent(agent, 'individual-review', 3, step3Prompt, state);
      if (out) revisions.set(agent.id, out);
    })
  );

  // --- Paso 4: resolución con análisis prospectivo -----------------------
  const revisionsText = [...revisions.entries()]
    .map(([id, text]) => `- ${agents.find((a) => a.id === id)?.name || id}: ${text}`)
    .join('\n');
  const step4Prompt = `Tema: "${topic}"\n\nVersiones revisadas:\n${revisionsText}\n\nPropón una resolución concreta, señalando implicaciones futuras y correcciones que anticipas necesarias (máx. 150 palabras).`;
  const resolutions = new Map<string, string>();
  await Promise.all(
    agents.map(async (agent) => {
      const out = await runStepForAgent(agent, 'resolution-prospective', 4, step4Prompt, state);
      if (out) resolutions.set(agent.id, out);
    })
  );

  // --- Paso 5: segunda ronda de revisión cruzada --------------------------
  const resolutionsText = [...resolutions.entries()]
    .map(([id, text]) => `- ${agents.find((a) => a.id === id)?.name || id}: ${text}`)
    .join('\n');
  const step5Prompt = `Tema: "${topic}"\n\nResoluciones propuestas:\n${resolutionsText}\n\nRevisión cruzada final: ¿qué ajustarías? Sé directo (máx. 100 palabras).`;
  const crossReview = new Map<string, string>();
  await Promise.all(
    agents.map(async (agent) => {
      const out = await runStepForAgent(agent, 'cross-review', 5, step5Prompt, state);
      if (out) crossReview.set(agent.id, out);
    })
  );

  // --- Paso 6: validación — Sintetizador/Arquitecto (doble función) ------
  const synthesizer = getSynthesizerAgent();
  state.synthesizerAgentId = synthesizer?.id;
  const crossReviewText = [...crossReview.entries()]
    .map(([id, text]) => `- ${agents.find((a) => a.id === id)?.name || id}: ${text}`)
    .join('\n');
  const step6Prompt = `Tema: "${topic}"\n\nRevisión cruzada final de todos los agentes:\n${crossReviewText}\n\nComo Sintetizador/Arquitecto, valida y reconcilia todo en un resultado único, directo, sin rodeos (máx. 200 palabras).`;

  let finalResult: string | undefined;
  if (synthesizer) {
    finalResult = await runStepForAgent(synthesizer, 'validation', 6, step6Prompt, state);
  } else {
    const log = newLog('validation', 6, 'n/a');
    log.finishedAt = new Date().toISOString();
    log.error = 'No hay agente Sintetizador/Arquitecto disponible para validar';
    state.steps.push(log);
  }

  // --- Paso 7: entrega -----------------------------------------------------
  const deliveryLog = newLog('delivery', 7, synthesizer?.id || 'n/a');
  deliveryLog.finishedAt = new Date().toISOString();
  deliveryLog.output = finalResult || '(Sin resultado de validación — ver error en el paso 6)';
  state.steps.push(deliveryLog);

  state.finalResult = finalResult;
  state.finishedAt = new Date().toISOString();
  return state;
}
