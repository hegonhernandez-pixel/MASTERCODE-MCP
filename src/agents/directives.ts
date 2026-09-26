/**
 * DIRECTIVAS OPERATIVAS — V2, sección 5
 * -----------------------------------------------------------------------
 * No son sobre tono (eso es AgentPersonality.examples), son sobre CÓMO
 * OPERA el agente. Primera directiva concreta: comprimir el chat/contexto
 * actual a markdown de forma periódica, para bajar RAM retenida por el
 * proceso y tokens enviados al modelo en cada request — conservando
 * decisiones tomadas y hechos confirmados, no solo acortando por acortar.
 */

export interface HistoryTurn {
  role: 'user' | 'agent';
  agentId?: string;
  content: string;
  timestamp: string;
}

const DECISION_MARKERS = [
  'confirmado',
  'confirma',
  'decidido',
  'se acuerda',
  'queda acordado',
  'acordado',
  'regla:',
  'decisión:',
];

function looksLikeDecisionOrFact(line: string): boolean {
  const lower = line.toLowerCase();
  return DECISION_MARKERS.some((marker) => lower.includes(marker));
}

/**
 * Comprime una lista de turnos a un resumen markdown compacto.
 * Heurística: conserva íntegras las líneas que parecen decisiones/hechos
 * confirmados; el resto lo reduce a una línea por turno (primeras ~160
 * chars). No es un resumen "bonito" generado por modelo a propósito: es
 * determinista y barato, para no gastar otra llamada a un modelo solo
 * para comprimir contexto.
 */
export function compressContextToMarkdown(turns: HistoryTurn[]): string {
  if (turns.length === 0) return '';

  const decisions: string[] = [];
  const timeline: string[] = [];

  for (const turn of turns) {
    const who = turn.role === 'user' ? 'Usuario' : turn.agentId || 'Agente';
    const lines = turn.content.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (looksLikeDecisionOrFact(line)) {
        decisions.push(`- **${who}** (${turn.timestamp}): ${line}`);
      }
    }

    const firstLine = lines[0] || '(vacío)';
    const trimmed = firstLine.length > 160 ? `${firstLine.slice(0, 160)}…` : firstLine;
    timeline.push(`- **${who}**: ${trimmed}`);
  }

  const parts: string[] = ['# Contexto comprimido'];

  if (decisions.length > 0) {
    parts.push('## Decisiones y hechos confirmados', decisions.join('\n'));
  }

  parts.push('## Línea de tiempo (resumida)', timeline.join('\n'));

  return parts.join('\n\n');
}

/** Config por defecto de la directiva, lista para agregarse vía registry.addDirective(). */
export const CONTEXT_COMPRESSION_DIRECTIVE_TEMPLATE = {
  kind: 'context-compression',
  description:
    'Comprime periódicamente el chat/contexto actual a markdown para reducir RAM y tokens por request, conservando decisiones y hechos confirmados.',
  active: true,
  config: { triggerEveryNTurns: 20 },
};
