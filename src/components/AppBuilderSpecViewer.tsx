import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Box,
  FileJson,
  Cpu,
  Layers
} from 'lucide-react';
import { MachineReadableSpec, GeneratedFile } from '../types';

interface AppBuilderSpecViewerProps {
  spec: MachineReadableSpec;
}

export const AppBuilderSpecViewer: React.FC<AppBuilderSpecViewerProps> = ({ spec }) => {
  const [activeTab, setActiveTab] = useState<string>('json-spec');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadAll = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(spec, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${spec.appName || 'app-builder-spec'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Compile full builder prompt instructions
  const fullBuilderInstructions = `
# ESPECIFICACIÓN EJECUTIVA PARA EL PROGRAMA CREADOR DE APLICACIONES (AI STUDIO / CURSOR / CLINE)
# Generado por la Arquitectura Cognitiva Cuatri-Agente (MasterCode MCP)

## 1. MISIÓN Y PROPÓSITO DEL SISTEMA
Nombre del Proyecto: ${spec.appName}
Motor de Ejecución: ${spec.executionEngine}
Esquema de Especificación: v${spec.schemaVersion}

## 2. REGLAS ARQUITECTÓNICAS MANDATORIAS (ANCLAJE DE IDENTIDAD):
- [X] Minimalismo Técnico: Implementar soluciones directas, archivos únicos modulares y eliminar dependencias npm/pip infladas.
- [X] Prioridad Local y Privada: Transporte vía Standard Input/Output (stdio) o volúmenes locales; cero fugas a la nube no autorizadas.
- [X] Estilo Punchy y Directo: Código limpio y listo para ejecución inmediata, sin placeholders.

## 3. ARCHIVOS A GENERAR E IMPLEMENTAR:
${spec.files
  .map(
    (f, idx) => `
### Archivo ${idx + 1}: \`${f.path}\`
*Descripción*: ${f.description}

\`\`\`${f.path.endsWith('.json') ? 'json' : f.path.endsWith('.yml') || f.path.endsWith('.yaml') ? 'yaml' : f.path.endsWith('.py') ? 'python' : f.path.endsWith('.sh') ? 'bash' : 'javascript'}
${f.content}
\`\`\`
`
  )
  .join('\n')}

## 4. INSTRUCCIONES DE VERIFICACIÓN Y ARRANQUE:
1. En el directorio raíz:
   cd shared-workspace && npm install
2. Para probar el transporte stdio del servidor MCP:
   node mcp-server.js
3. Para orquestación de contenedores multi-chip:
   docker-compose -f docker-compose.multi-chip.yml up -d
`.trim();

  // Find active file or virtual tab
  const getActiveContent = () => {
    if (activeTab === 'json-spec') {
      return {
        id: 'json-spec',
        path: 'app-builder-spec.json',
        description:
          'Esquema JSON machine-readable diseñado para ser ingerido por herramientas de construcción autónoma de software.',
        content: JSON.stringify(spec, null, 2),
        lang: 'json'
      };
    }
    if (activeTab === 'builder-instructions') {
      return {
        id: 'builder-instructions',
        path: 'INSTRUCTIONS_FOR_BUILDER.md',
        description:
          'Prompt maestro formateado para pegar directamente en un agente creador de software.',
        content: fullBuilderInstructions,
        lang: 'markdown'
      };
    }

    const matched = spec.files.find((f) => f.path === activeTab);
    if (matched) {
      const isJson = matched.path.endsWith('.json');
      const isYaml = matched.path.endsWith('.yml') || matched.path.endsWith('.yaml');
      const isPython = matched.path.endsWith('.py');
      const isBash = matched.path.endsWith('.sh');
      return {
        id: matched.path,
        path: matched.path,
        description: matched.description,
        content: matched.content,
        lang: isJson ? 'json' : isYaml ? 'yaml' : isPython ? 'python' : isBash ? 'bash' : 'javascript'
      };
    }

    return {
      id: 'fallback',
      path: 'output.txt',
      description: 'Especificación',
      content: JSON.stringify(spec, null, 2),
      lang: 'json'
    };
  };

  const current = getActiveContent();

  return (
    <div className="bg-slate-900/95 border border-indigo-900/50 rounded-2xl shadow-2xl overflow-hidden space-y-0">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-indigo-800/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Instrucciones para el Programa Creador de Aplicaciones</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Formato Machine-Readable
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Especificación generada por el Agente 4 tras debatir y resolver los aportes de los Agentes 1, 2 y 3.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCopy(fullBuilderInstructions, 'all-prompt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-md transition-all"
          >
            {copiedFile === 'all-prompt' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt Maestro</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
            title="Descargar especificación completa en JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Descargar .JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2">
        <button
          onClick={() => setActiveTab('json-spec')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'json-spec'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileJson className="w-3.5 h-3.5 text-indigo-400" />
          <span>app-builder-spec.json</span>
        </button>

        <button
          onClick={() => setActiveTab('builder-instructions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'builder-instructions'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-purple-400" />
          <span>INSTRUCTIONS_FOR_BUILDER.md</span>
        </button>

        {spec.files.map((file) => (
          <button
            key={file.path}
            onClick={() => setActiveTab(file.path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all truncate max-w-[220px] ${
              activeTab === file.path
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{file.path.split('/').pop()}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Header Details */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-300 font-bold">{current.path}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px] truncate max-w-md">{current.description}</span>
        </div>

        <button
          onClick={() => handleCopy(current.content, current.id)}
          className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          {copiedFile === current.id ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copiar archivo</span>
            </>
          )}
        </button>
      </div>

      {/* Code viewer */}
      <div className="relative">
        <pre className="p-4 sm:p-5 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
          <code>{current.content}</code>
        </pre>
      </div>

      {/* Footer Instructions for Execution */}
      <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Esquema verificado: Compatible con AI Studio, Cursor, Claude Code, Cline y MCP Runner oficial.</span>
        </div>
        <div className="font-mono text-slate-500">
          Total Archivos: {spec.files.length} • Formato: UTF-8
        </div>
      </div>
    </div>
  );
};
