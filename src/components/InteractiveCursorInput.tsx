import React, { useRef, useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  CornerDownLeft,
  Scissors,
  Copy,
  Plus,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileCode,
  Tag
} from 'lucide-react';

interface InteractiveCursorInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  sublabel?: string;
}

const QUICK_TOKENS = [
  { label: '+ [MCP_STDIO]', text: ' [Protocolo: MCP Oficial vía transporte Stdio sin puertos expuestos] ' },
  { label: '+ [GITHUB_REPO]', text: ' [Exportar a Repositorio GitHub con GitHub Actions CI/CD] ' },
  { label: '+ [WINDOWS_EXE]', text: ' [Generar lanzador ejecutable para Windows run_windows.bat] ' },
  { label: '+ [DOCKER_COMPOSE]', text: ' [Orquestar en Docker Compose Multi-Chip aislado] ' },
  { label: '+ [VIDEO_PIPELINE]', text: ' [Generar conector de video, audio TTS y subtitulos .SRT sincronizados] ' },
  { label: '+ [SANDBOX_LOCK]', text: ' [Validar fs.realpath contra escapes de symlink y limite de 2MB] ' },
];

export const InteractiveCursorInput: React.FC<InteractiveCursorInputProps> = ({
  value,
  onChange,
  placeholder = 'Escribe o inserta requerimientos aquí...',
  rows = 4,
  label = 'Instrucción o Problema a Resolver:',
  sublabel = 'Haz clic en cualquier punto para posicionar el cursor o inserta tokens con 1 clic'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1, index: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const index = textarea.selectionStart || 0;
    const textBefore = textarea.value.substring(0, index);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col, index });
  };

  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;

    const newValue =
      value.substring(0, start) + textToInsert + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = start + textToInsert.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        updateCursorPosition();
      }
    }, 10);
  };

  const moveCursor = (delta: number) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const newPos = Math.max(
      0,
      Math.min(value.length, (textarea.selectionStart || 0) + delta)
    );
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
    updateCursorPosition();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-2">
      {/* Label and Cursor HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-mono font-medium text-slate-200 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
        </label>

        {/* Cursor Position HUD */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
            <span
              className={`inline-block w-1.5 h-3 rounded-sm ${
                isFocused ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="text-cyan-300">Cursor:</span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">{value.length} car.</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Mover cursor a la izquierda"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => moveCursor(1)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Mover cursor a la derecha"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
              title="Copiar texto actual"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Frame */}
      <div
        className={`relative rounded-xl border bg-slate-950 transition-all ${
          isFocused
            ? 'border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            updateCursorPosition();
          }}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          onFocus={() => {
            setIsFocused(true);
            updateCursorPosition();
          }}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className="w-full bg-transparent p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans leading-relaxed resize-y"
          placeholder={placeholder}
        />

        {/* Bottom Quick Insertion Tokens Bar */}
        <div className="bg-slate-900/80 border-t border-slate-800/80 px-3 py-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-cyan-400" />
            <span>Insertar en cursor:</span>
          </span>

          {QUICK_TOKENS.map((token, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertAtCursor(token.text)}
              className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 border border-slate-700/60 text-[10px] font-mono text-slate-300 transition-all"
            >
              {token.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>{sublabel}</span>
      </div>
    </div>
  );
};
