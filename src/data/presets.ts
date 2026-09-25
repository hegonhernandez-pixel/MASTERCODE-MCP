import { ProblemPreset, UserIdentityPrinciples } from '../types';

export const PROBLEM_PRESETS: ProblemPreset[] = [
  {
    id: 'os-architecture',
    title: 'Diseño y Construcción de un Sistema Operativo / Arquitectura OS',
    shortDesc: 'Debate de los 4 agentes: repositorios base vs distribuciones preconfiguradas vs construir de cero',
    tag: 'OS & Arquitectura',
    topic: 'Diseñar y construir un Sistema Operativo moderno y ligero. ¿Conviene resolverlo estructurando repositorios base modulares, usando distribuciones preconfiguradas, o construyendo todo desde cero (from-scratch)?',
    context: `Escenario del problema:
- Agente 1 (Claude Code): Aportará una solución mediante arquitectura de repositorios modulares y contratos de kernel.
- Agente 2 (GPT-4o): Informará sobre distribuciones preconfiguradas (Alpine minimal, Linux from Scratch base) y empaquetado ágil.
- Agente 3 (Gemini 2.5 Pro): Cuestionará todo, argumentando que las distribuciones preconfiguradas traen bloatware y brechas de seguridad, proponiendo construir de cero.
- Agente 4 (Gemini 3.8 Flash): Debatirá las 3 posturas, alcanzará el consenso y propondrá la arquitectura definitiva del sistema operativo, generando la solución en pantalla y formato JSON con CI/CD deploy.yml y Docker.`
  },
  {
    id: 'mcp-multi-chip',
    title: 'Orquestación MCP Multi-Chip con Docker',
    shortDesc: 'Servidor MCP oficial stdio + workspace compartido + 4 agentes en Docker',
    tag: 'MCP & Docker',
    topic: 'Implementar un servidor MCP oficial con transporte Stdio y un Docker Compose Multi-Chip que orqueste 4 agentes de desarrollo autónomo sobre un workspace compartido local.',
    context: `Decisions: Se utiliza el SDK oficial de MCP (@modelcontextprotocol/sdk). Configuración autónoma para habilitar transporte vía Standard Input/Output (stdio), ideal para orquestaciones basadas en Docker.
Carpeta requerida: shared-workspace con package.json (@modelcontextprotocol/sdk v1.0.1+), mcp-server.js con tool read_workspace_file y sandbox estricto de ruta.
Necesidad: Docker Compose Multi-Chip que una el servidor MCP con los 4 agentes y garantice permisos de lectura/escritura en el workspace compartido.`
  },
  {
    id: 'hybrid-vertex-psc',
    title: 'Conector Híbrido Vertex PSC + Claude + Gemini',
    shortDesc: 'Conectividad privada PSC a googleapis con Claude Opus y Gemini 3.1 Pro',
    tag: 'Vertex AI & PSC',
    topic: 'Crear una solución de orquestación en Python que use Private Service Connect (PSC) para consultar Claude Opus 4.6 y Gemini 3.1 Pro en Vertex AI de forma privada, con interfaz Rich terminal animada (Star-Me) y servidor HTTP local.',
    context: `Detalles del entorno:
- Red VPC custom (anthropic-net) con endpoint PSC (192.168.255.230) conectado a bundle 'all-apis'.
- DNS privado para googleapis.com hacia la IP de PSC con CNAME comodín *.googleapis.com.
- SDKs: google-genai, anthropic[vertex], rich.
- Script estrella: star-me.py con animación de nave espacial, consulta en cascada y servidor HTTP local en puerto 8080.`
  },
  {
    id: 'web-apk-standalone',
    title: 'Aplicación Web Autónoma & PWA / APK Móvil',
    shortDesc: 'Despliegue como HTML estático autónomo con Service Worker y manifiesto APK Capacitor',
    tag: 'Web & APK',
    topic: 'Construir la aplicación para que funcione como un sitio web HTML autónomo desplegable en GitHub Pages / Vercel o empaquetable como APK móvil (Android) mediante Capacitor/Cordova.',
    context: `Requerimiento: Generar index.html independiente, manifest.webmanifest, capacitor.config.json y script de compilación para APK/Web, además del workflow continuo .github/workflows/deploy.yml.`
  },
  {
    id: 'local-first-minimalism',
    title: 'Arquitectura Local-First de Máximo Minimalismo',
    shortDesc: 'Solución directa, privada y sin sobreingeniería para procesamiento de tareas',
    tag: 'Local Minimalist',
    topic: 'Diseñar un sistema local de procesamiento de tareas y documentos que priorice herramientas locales sobre la nube, con cero dependencias pesadas y máxima simplicidad de mantenimiento.',
    context: `Matriz de principios:
- Minimalismo técnico: Soluciones simples y directas sobre sistemas sobreoptimizados o complejos.
- Infraestructura: Prioridad absoluta a herramientas y dependencias locales y privadas antes que soluciones en la nube.
- Estilo comunicativo: Mensajes punchy, directos, lógicos, sin rodeos corporativos.`
  }
];

export const DEFAULT_USER_PRINCIPLES: UserIdentityPrinciples = {
  minimalism: true,
  localFirst: true,
  punchyCommunication: true,
  userStory: `Historia del Desarrollador:
"Soy un ingeniero de software que construye herramientas de producción ágiles. He visto demasiados proyectos fracasar por sobreingeniería, microservicios innecesarios y costos astronómicos en la nube. Por eso desarrollo con un enfoque austero pero contundente: código autónomo, privacidad absoluta en disco local, interfaces limpias y despliegues sin fricción hacia la web o ejecutables nativos."`,
  userExamples: `[Ejemplos de Referencia del Usuario]
- "Si una función de 20 líneas en Node nativo resuelve el problema, rechaza paquetes npm de 5MB."
- "Los datos de trabajo viven en el disco local compartido (shared-workspace), nunca en endpoints externos no autorizados."
- "Sin rodeos: si el diseño tiene una falla de concurrencia o de symlinks, dilo en 1 frase y aplica el fix de inmediato."`,
  symbolicLinks: {
    analytical: "symlink://identity/memory/strict-structural-decomposition -> 'Auditar contratos de datos sin asumir dependencias externas; rigor matemático.'",
    solver: "symlink://identity/skills/pragmatic-minimalist-builder -> 'Priorizar código modular ejecutable en un solo paso; nada de boilerplate estéril.'",
    critic: "symlink://identity/audit/relentless-red-team -> 'Cuestionar implacablemente cada supuesto de seguridad, symlinks y posibles cuellos de botella.'",
    synthesizer: "symlink://identity/executive/decisive-consensus-engine -> 'Reconciliar las tensiones de los 3 agentes y dictaminar el camino unificado de producción.'"
  }
};
