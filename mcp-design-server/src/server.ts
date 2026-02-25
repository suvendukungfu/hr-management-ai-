import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// ---------- Load Pencil design tokens ----------
const TOKENS_PATH = path.resolve(
  __dirname,
  "../../design-tokens.json"
);
const designTokens: any = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

// ---------- Helpers ----------
function resolveThemeRef(value: string): string {
  if (typeof value !== "string" || !value.startsWith("theme.")) return value;
  const keys = value.replace("theme.", "").split(".");
  let ref: any = designTokens.theme;
  for (const k of keys) ref = ref?.[k];
  return ref ?? value;
}

function resolveStyles(style: Record<string, any>): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [k, v] of Object.entries(style)) {
    resolved[k] = resolveThemeRef(v as string);
  }
  return resolved;
}

function generateReactCode(componentName: string, spec: any): string {
  const theme = designTokens.theme;

  // ---- PlannerStatusCard ----
  if (componentName === "PlannerStatusCard") {
    return `import React from "react";

interface PlannerStatusCardProps {
  label: string;
  value: string;
}

const statusColors: Record<string, string> = ${JSON.stringify(
      spec.children[1].conditionalColor,
      null,
      2
    )};

export function PlannerStatusCard({ label, value }: PlannerStatusCardProps) {
  const color = statusColors[value] || statusColors["default"];
  return (
    <div style={{
      background: "${theme.colors.panel}",
      border: "1px solid ${theme.colors.panelBorder}",
      borderRadius: ${theme.layout.cardRadius},
      padding: ${theme.layout.cardPadding},
      boxShadow: "${theme.shadow}",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
    }}>
      <div style={{ color: "${theme.colors.muted}", fontSize: "${theme.typography.small.fontSize}", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color, fontSize: "1.2rem", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}
`;
  }

  // ---- AgentControlPanel ----
  if (componentName === "AgentControlPanel") {
    const buttons = spec.sections[0].buttons;
    return `import React from "react";

interface AgentControlPanelProps {
  agents: Record<string, string>;
  logs: string[];
  onAction: (action: string) => void;
}

export function AgentControlPanel({ agents, logs, onAction }: AgentControlPanelProps) {
  return (
    <div>
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
${buttons
  .map(
    (b: any) => `        <button
          onClick={() => onAction("${b.action}")}
          style={{
            background: "transparent",
            border: "1px solid ${resolveThemeRef(b.borderColor)}",
            color: "${resolveThemeRef(b.borderColor)}",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          ${b.label}
        </button>`
  )
  .join("\n")}
      </div>

      {/* Agent Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        {Object.entries(agents).map(([name, status]) => (
          <div key={name} style={{
            background: "${theme.colors.panel}",
            border: "1px solid ${theme.colors.panelBorder}",
            borderRadius: ${theme.layout.cardRadius},
            padding: 16,
            boxShadow: "${theme.shadow}",
          }}>
            <div style={{ fontWeight: 600, color: "${theme.colors.text}", marginBottom: 8 }}>{name}</div>
            <div style={{ fontSize: "0.85rem", color: "${theme.colors.muted}" }}>{status}</div>
          </div>
        ))}
      </div>

      {/* Log Panel */}
      <div style={{
        background: "${theme.colors.panel}",
        border: "1px solid ${theme.colors.panelBorder}",
        borderRadius: ${theme.layout.cardRadius},
        padding: 16,
        boxShadow: "${theme.shadow}",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1rem", color: "${theme.colors.muted}" }}>Live Agent Logs</h3>
        <div style={{ background: "${theme.colors.bg}", padding: 16, borderRadius: 8, fontFamily: "monospace", fontSize: "0.9rem" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ color: "${theme.colors.ready}", marginBottom: 8 }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
  }

  // ---- Generic fallback ----
  return `// Auto-generated from Pencil wireframe: ${componentName}
// Design spec: ${JSON.stringify(spec, null, 2).substring(0, 500)}
import React from "react";

export function ${componentName}() {
  return (
    <div style={{
      background: "${theme.colors.panel}",
      border: "1px solid ${theme.colors.panelBorder}",
      borderRadius: ${theme.layout.cardRadius},
      padding: ${theme.layout.cardPadding},
      boxShadow: "${theme.shadow}",
    }}>
      <h3 style={{ color: "${theme.colors.text}" }}>${componentName}</h3>
      <p style={{ color: "${theme.colors.muted}" }}>${spec.description || "Component generated from design tokens."}</p>
    </div>
  );
}
`;
}

// ---------- MCP Server ----------
const server = new Server(
  {
    name: "pencil-design-to-code",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ---- Resources: expose design tokens ----
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "design://tokens",
      name: "Pencil Design Tokens",
      description:
        "Full design token export from Pencil wireframes including theme, layout, colors, and component specs.",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "design://tokens") {
    return {
      contents: [
        {
          uri: "design://tokens",
          mimeType: "application/json",
          text: JSON.stringify(designTokens, null, 2),
        },
      ],
    };
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// ---- Tools ----
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_component_design",
      description:
        "Get the exact UI design specs (padding, colors, layout, children) for a specific component from the Pencil wireframe export. Returns structured JSON that can be used to generate React code.",
      inputSchema: {
        type: "object" as const,
        properties: {
          componentName: {
            type: "string",
            description:
              "Name of the component (e.g., 'PlannerStatusCard', 'AgentControlPanel', 'PlannerGraph', 'SimulationPanel', 'CandidateProfileCard')",
          },
        },
        required: ["componentName"],
      },
    },
    {
      name: "get_theme_tokens",
      description:
        "Get the full theme/design token system from the Pencil wireframe export including colors, layout dimensions, typography, and shadows.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "generate_react_component",
      description:
        "Generate a production-ready, typed React TSX component from a Pencil wireframe design spec. Returns complete component source code ready to save to a file.",
      inputSchema: {
        type: "object" as const,
        properties: {
          componentName: {
            type: "string",
            description:
              "Name of the component to generate (e.g., 'PlannerStatusCard', 'AgentControlPanel')",
          },
        },
        required: ["componentName"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === "get_component_design") {
    const { componentName } = request.params.arguments as {
      componentName: string;
    };
    const spec = designTokens.components[componentName];
    if (!spec) {
      const available = Object.keys(designTokens.components).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Component "${componentName}" not found. Available components: ${available}`,
          },
        ],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(spec, null, 2) }],
    };
  }

  if (name === "get_theme_tokens") {
    return {
      content: [
        { type: "text", text: JSON.stringify(designTokens.theme, null, 2) },
      ],
    };
  }

  if (name === "generate_react_component") {
    const { componentName } = request.params.arguments as {
      componentName: string;
    };
    const spec = designTokens.components[componentName];
    if (!spec) {
      const available = Object.keys(designTokens.components).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Cannot generate: component "${componentName}" not found. Available: ${available}`,
          },
        ],
      };
    }
    const code = generateReactCode(componentName, spec);
    return {
      content: [{ type: "text", text: code }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ---------- Start ----------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🎨 Pencil Design-to-Code MCP Server running on stdio");
}

main().catch(console.error);
