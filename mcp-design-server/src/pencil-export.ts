#!/usr/bin/env node
/**
 * pencil-export.ts
 * 
 * CLI tool to export Pencil wireframe design tokens into the MCP-compatible
 * design-tokens.json format. Also can generate React components from designs.
 *
 * Usage:
 *   npx tsx src/pencil-export.ts list                    — list available components
 *   npx tsx src/pencil-export.ts inspect <ComponentName> — show design spec for a component
 *   npx tsx src/pencil-export.ts generate <ComponentName> [--out <path>] — generate TSX
 *   npx tsx src/pencil-export.ts theme                   — dump theme tokens
 */
import * as fs from "fs";
import * as path from "path";

const TOKENS_PATH = path.resolve(
  __dirname,
  "../design-tokens.json"
);

const tokens: any = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

function resolveThemeRef(value: string): string {
  if (typeof value !== "string" || !value.startsWith("theme.")) return value;
  const keys = value.replace("theme.", "").split(".");
  let ref: any = tokens.theme;
  for (const k of keys) ref = ref?.[k];
  return ref ?? value;
}

// ---- Commands ----
const [, , command, ...args] = process.argv;

switch (command) {
  case "list": {
    console.log("\n🎨 Available Pencil Components:\n");
    for (const [name, spec] of Object.entries(tokens.components) as any) {
      console.log(`  • ${name} — ${spec.description}`);
    }
    console.log(`\n  Total: ${Object.keys(tokens.components).length} components\n`);
    break;
  }

  case "inspect": {
    const componentName = args[0];
    if (!componentName) {
      console.error("Usage: pencil-export inspect <ComponentName>");
      process.exit(1);
    }
    const spec = tokens.components[componentName];
    if (!spec) {
      console.error(`Component "${componentName}" not found.`);
      console.error(`Available: ${Object.keys(tokens.components).join(", ")}`);
      process.exit(1);
    }
    console.log(`\n📋 Design Spec for: ${componentName}\n`);
    console.log(JSON.stringify(spec, null, 2));
    break;
  }

  case "generate": {
    const componentName = args[0];
    if (!componentName) {
      console.error("Usage: pencil-export generate <ComponentName> [--out <path>]");
      process.exit(1);
    }
    const spec = tokens.components[componentName];
    if (!spec) {
      console.error(`Component "${componentName}" not found.`);
      process.exit(1);
    }

    // Generate code inline (simplified version)
    const theme = tokens.theme;
    const code = `// Auto-generated from Pencil wireframe: ${componentName}
// Source: ${tokens.meta.source}
// Exported: ${new Date().toISOString()}
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
      <p style={{ color: "${theme.colors.muted}" }}>${spec.description}</p>
    </div>
  );
}
`;

    const outIdx = args.indexOf("--out");
    if (outIdx !== -1 && args[outIdx + 1]) {
      const outPath = args[outIdx + 1];
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, code, "utf8");
      console.log(`✅ Generated ${componentName} → ${outPath}`);
    } else {
      console.log(code);
    }
    break;
  }

  case "theme": {
    console.log("\n🎨 Pencil Theme Tokens:\n");
    console.log(JSON.stringify(tokens.theme, null, 2));
    break;
  }

  default: {
    console.log(`
🎨 Pencil Design-to-Code CLI

Commands:
  list                              List available Pencil components
  inspect <ComponentName>           Show design spec for a component
  generate <ComponentName> [--out]  Generate React TSX from design spec
  theme                             Dump theme tokens

Examples:
  npx tsx src/pencil-export.ts list
  npx tsx src/pencil-export.ts inspect PlannerStatusCard
  npx tsx src/pencil-export.ts generate PlannerStatusCard --out ../frontend/src/components/PlannerStatusCard.tsx
  npx tsx src/pencil-export.ts theme
`);
  }
}
