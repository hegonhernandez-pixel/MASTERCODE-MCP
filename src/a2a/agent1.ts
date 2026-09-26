import { randomUUID } from "node:crypto";

import {
  Role,
  type AgentCard,
} from "@a2a-js/sdk";

import {
  AgentEvent,
  AgentExecutor,
  DefaultRequestHandler,
  ExecutionEventBus,
  InMemoryTaskStore,
  RequestContext,
} from "@a2a-js/sdk/server";

export const agent1Card: AgentCard = {
  name: "MasterCode Agent 1",
  description: "Agente A2A de pensamiento analítico.",

  supportedInterfaces: [
    {
      url: "http://localhost:3000/a2a/agent1",
      protocolBinding: "HTTP+JSON",
      tenant: "",
      protocolVersion: "1.0",
    },
  ],

  provider: {
    url: "http://localhost:3000",
    organization: "MasterCode MCP",
  },

  version: "0.1.0",

  capabilities: {
    streaming: false,
    pushNotifications: false,
    extensions: [],
  },

  securitySchemes: {},
  securityRequirements: [],

  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],

  skills: [
    {
      id: "analytical-thinking",
      name: "Pensamiento analítico",
      description: "Analiza problemas y requerimientos.",
      tags: ["analysis", "reasoning"],
      examples: ["Analiza este problema."],
      inputModes: ["text"],
      outputModes: ["text"],
      securityRequirements: [],
    },
  ],

  signatures: [],
};

class Agent1Executor implements AgentExecutor {
  async execute(
    context: RequestContext,
    eventBus: ExecutionEventBus,
  ): Promise<void> {
    const receivedText = context.userMessage.parts
      .map((part) => ("text" in part ? part.text : ""))
      .join("");

    const message = {
      kind: "message" as const,
      messageId: randomUUID(),
      role: Role.ROLE_AGENT,

      parts: [
        {
          content: {
            $case: "text" as const,
            value: `Agent 1 recibió: ${receivedText}`,
          },
          metadata: undefined,
          filename: "",
          mediaType: "",
        },
      ],

      contextId: context.contextId,
      taskId: "",
      metadata: undefined,
      extensions: [],
      referenceTaskIds: [],
    };

    eventBus.publish(AgentEvent.message(message));
    eventBus.finished();
  }

  async cancelTask(): Promise<void> {}
}

export const agent1RequestHandler = new DefaultRequestHandler(
  agent1Card,
  new InMemoryTaskStore(),
  new Agent1Executor(),
);