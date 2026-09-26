# 🚀 DEPLOYMENT AGENTES LOCALES - MasterCode MCP

## Estado Actual
```
✅ Ollama corriendo en localhost:11434
✅ Modelos descargados:
   - deepseek-coder (7.7 GB)
   - mistral (⏳ descargando)
   - llama3.2 (descargado)
   - gemma4 (descargado)
   - gemma3 (descargado)
✅ Server.ts esperando integración
```

---

## PASO 1: Descarga el archivo `local-agents.ts`

Colócalo en:
```
C:\proyects\mastercode-mcp\src\local\
```

Si la carpeta no existe, créala:
```powershell
mkdir C:\proyects\mastercode-mcp\src\local
```

---

## PASO 2: Actualiza `server.ts` (IMPORTANTE)

**Añade esta línea al inicio:**

```typescript
import localAgents from './src/local/local-agents.js';
```

**Reemplaza el endpoint `/api/agents` (línea ~1560):**

```typescript
// ENDPOINT: List all deployed agents on MasterCode MCP Server
app.get('/api/agents', async (_req: Request, res: Response) => {
  // Verifica si Ollama está activo
  const ollamaHealth = await localAgents.checkOllamaHealth();
  
  if (ollamaHealth) {
    // Devuelve agentes LOCALES (reales)
    const availableModels = await localAgents.getAvailableModels();
    
    const localAgentsList = localAgents.localAgentsConfig
      .filter(agent => availableModels.includes(agent.model + ':latest'))
      .map(agent => ({
        id: agent.id,
        name: agent.name,
        role: `Local: ${agent.model}`,
        model: { engine: 'ollama', modelName: agent.model },
        status: 'deployed',
        implementation: `Ejecutando en Ollama @ ${process.env.OLLAMA_HOST || 'localhost:11434'}`,
      }));

    res.json({
      success: true,
      server: 'MasterCode MCP Server v1.0.1 (LOCAL AGENTS)',
      transport: 'Ollama + HTTP',
      totalDeployed: localAgentsList.length,
      agents: localAgentsList,
    });
  } else {
    // Fallback: fake agents (si Ollama no está corriendo)
    res.json({
      success: false,
      error: 'Ollama no está activo en ' + (process.env.OLLAMA_HOST || 'localhost:11434'),
      fallback: 'Inicia Ollama: Start-Process "C:\\Users\\Admin\\AppData\\Local\\Programs\\Ollama\\ollama app.exe"',
    });
  }
});
```

---

## PASO 3: Agregar endpoint `/api/orchestrate-local`

**Copia esto DESPUÉS del endpoint `/api/agents`:**

```typescript
// ENDPOINT: Deliberación multi-agente LOCAL
app.post('/api/orchestrate-local', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Campo "topic" requerido' });
      return;
    }

    console.log(`\n🎯 Iniciando deliberación local sobre: "${topic}"`);

    // Ejecuta los 5 agentes
    const deliberation = await localAgents.deliberateMultiAgent(topic);

    // Sintetiza opiniones
    const synthesis = await localAgents.synthesizeOpinions(
      topic,
      deliberation.deliberation
    );

    res.json({
      success: true,
      topic,
      deliberation: deliberation.deliberation,
      synthesis,
      activeAgents: deliberation.activeAgents,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Error en orquestación local',
      message: err.message,
    });
  }
});
```

---

## PASO 4: Actualiza `.env`

Añade esta línea:
```
OLLAMA_HOST=http://localhost:11434
```

Tu `.env` debe quedar así:
```env
GEMINI_API_KEY=tu_key_aqui
PORT=3000
NODE_ENV=development
OLLAMA_HOST=http://localhost:11434
```

---

## PASO 5: Reinicia el servidor

```powershell
# Detén el servidor actual (Ctrl+C si está corriendo)

# Reinicia
cd C:\proyects\mastercode-mcp
npm run dev
```

**Deberías ver:**
```
✅ Conectando a Ollama @ http://localhost:11434
✅ Modelos disponibles: deepseek-coder, mistral, llama3.2, gemma4, gemma3
✅ [MasterCode MCP] Multi-Model Server running on http://0.0.0.0:3000
```

---

## PASO 6: Prueba los endpoints nuevos

### Test 1: Ver agentes locales reales
```powershell
curl http://localhost:3000/api/agents
```

Deberías ver JSON con los 5 agentes REALES (no fake data).

### Test 2: Deliberación multi-agente
```powershell
$body = @{
  topic = "¿Cuál es la mejor arquitectura para un servidor local?"
} | ConvertTo-Json

curl -Method POST `
  -Uri http://localhost:3000/api/orchestrate-local `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

Espera 2-5 minutos (los 5 modelos piensan en paralelo).

Deberías recibir:
```json
{
  "success": true,
  "topic": "...",
  "deliberation": {
    "agent-1-local": "Deepseek opinion...",
    "agent-2-local": "Mistral opinion...",
    ...
  },
  "synthesis": "Conclusión final..."
}
```

---

## 🚨 Posibles Errores

| Error | Solución |
|-------|----------|
| `Ollama no está activo` | Ejecuta: `Start-Process "C:\Users\Admin\AppData\Local\Programs\Ollama\ollama app.exe"` |
| `Cannot find module 'node-fetch'` | Corre: `npm install node-fetch` |
| `Model not found: mistral` | Descarga: `C:\Users\Admin\AppData\Local\Programs\Ollama\ollama.exe pull mistral` |
| `Timeout 30s` | Modelo lento - agrega más tiempo de espera en queryOllamaModel |

---

## ✅ Checklist Final

- [ ] `local-agents.ts` descargado y colocado en `src/local/`
- [ ] `server.ts` actualizado con los 2 endpoints
- [ ] `.env` tiene `OLLAMA_HOST`
- [ ] Ollama está corriendo (visible en system tray)
- [ ] `npm run dev` arranca sin errores
- [ ] `/api/agents` devuelve 5 agentes reales (no fake)
- [ ] `/api/orchestrate-local` delibera y sintetiza

¡Listo para conectar React UI! 🎉
