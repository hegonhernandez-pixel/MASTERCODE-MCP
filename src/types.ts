export interface AgentBiasRule {
  targetRole: string; // 'analytical' | 'solver' | 'critic' | 'synthesizer'
  biasDirective: string;
  symbolicLink: string;
  active: boolean;
}

export interface AgentCognitiveArchitecture {
  matrixOfThought: string;
  biasDirective: string;
  symbolicLink: string;
  decisionRules: string[];
  contextSummary?: string;
}

export interface AgentRepositoryConfig {
  remoteUrl: string;
  branch: string;
  tokenConfigured: boolean;
  hasDeployYml: boolean;
  lastSyncStatus: 'synced' | 'pending' | 'unconfigured' | 'error';
  lastPushTimestamp?: string;
  commitHash?: string;
}

export interface AgentEnabledApis {
  videoGenerationApi: boolean;
  webInteractionApi: boolean;
  fileReaderApi: boolean;
  fileConverterApi: boolean;
  filePermissionApi: boolean;
  repoDockerApi: boolean;
}

export interface DeployedAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  implementation: string;
  status: 'deployed' | 'idle' | 'executing';
  model: AgentModelConfig;
  cognitiveArchitecture: AgentCognitiveArchitecture;
  repositoryConfig: AgentRepositoryConfig;
  enabledApis: AgentEnabledApis;
  // Interactive terminal states & inputs
  terminalsOpen?: boolean;
  terminalInputs?: {
    repoAndDocker: string;
    personality: string;
    contextAndHistory: string;
  };
  generatedOpinion?: string;
  metrics?: {
    invocations: number;
    uptime: string;
    lastAction: string;
  };
}

export interface UserIdentityPrinciples {
  minimalism: boolean;
  localFirst: boolean;
  punchyCommunication: boolean;
  userStory: string; // Caja de historia personal / contexto rector
  userExamples: string; // Ejemplos de referencia
  symbolicLinks: {
    analytical: string;
    solver: string;
    critic: string;
    synthesizer: string;
  };
}

export type ModelProvider = 'claude-code' | 'gpt' | 'gemini';

export interface AgentModelConfig {
  engine: ModelProvider;
  modelName: string;
  badge: string;
  providerIcon: string;
}

export interface AnalyticalAgentData {
  name: string;
  role: string;
  avatar: string;
  badge: string;
  confidence: number;
  model: AgentModelConfig;
  summary: string;
  opinion: string; // Opinión individual del agente
  symbolicRuleApplied?: string;
  details: {
    variables: string[];
    constraints: string[];
    dependencyTree: string[];
    logicalVerdict: string;
  };
}

export interface SolverAgentData {
  name: string;
  role: string;
  avatar: string;
  badge: string;
  confidence: number;
  model: AgentModelConfig;
  summary: string;
  opinion: string; // Opinión individual del agente
  symbolicRuleApplied?: string;
  details: {
    coreApproach: string;
    minimalismScore: string;
    actionableSteps: string[];
    codeHighlight: string;
  };
}

export interface CriticAgentData {
  name: string;
  role: string;
  avatar: string;
  badge: string;
  confidence: number;
  model: AgentModelConfig;
  summary: string;
  opinion: string; // Opinión individual del agente
  symbolicRuleApplied?: string;
  details: {
    objectionsRaised: string[];
    refinementsMandated: string[];
  };
}

export interface SynthesizerAgentData {
  name: string;
  role: string;
  avatar: string;
  badge: string;
  confidence: number;
  model: AgentModelConfig;
  summary: string;
  opinion: string; // Opinión individual del agente
  symbolicRuleApplied?: string;
  behavioralConsensusAnalysis: string; // Análisis del comportamiento adecuado entre los 4 para llegar a una sola conclusión
  details: {
    debateReconciliation: string[];
    finalVerdict: string;
  };
}

export interface GeneratedFile {
  path: string;
  description: string;
  content: string;
  category: 'mcp' | 'docker' | 'github' | 'windows' | 'video' | 'spec' | 'web-apk';
}

export interface MachineReadableSpec {
  schemaVersion: string;
  generatedFor: string;
  appName: string;
  executionEngine: string;
  philosophy: {
    minimalism: boolean;
    localFirst: boolean;
    punchyCommunication: boolean;
    fewShotAnchor?: string;
    userStorySummary?: string;
  };
  files: GeneratedFile[];
}

export interface OrchestratorPermissions {
  fileSystemWrite: boolean;
  gitRepoSync: boolean;
  dockerRun: boolean;
  windowsExecutable: boolean;
  videoPipeline: boolean;
  externalWebhooks: boolean;
  githubActionsDeploy: boolean;
  webOrApkDeploy: boolean;
}

export interface CognitiveOrchestrationResult {
  success: boolean;
  source: string;
  topic: string;
  warning?: string;
  agent1_analytical: AnalyticalAgentData;
  agent2_solver: SolverAgentData;
  agent3_critic: CriticAgentData;
  agent4_synthesizer: SynthesizerAgentData;
  machine_readable_spec: MachineReadableSpec;
}

export interface ProblemPreset {
  id: string;
  title: string;
  shortDesc: string;
  tag: string;
  topic: string;
  context: string;
  targetCategory?: string;
}
