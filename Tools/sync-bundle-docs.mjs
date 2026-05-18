#!/usr/bin/env node
/**
 * Copies docs from the project root `docs/` directory into
 * `Shared/ScriptWidgetRuntime/Resource/Script.bundle/docs/`
 * so the iOS/macOS app ships the same documentation.
 */
import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "docs");
const bundleDocsDir = join(
  root,
  "Shared/ScriptWidgetRuntime/Resource/Script.bundle/docs"
);

const fileMap = [
  ["guide/getting-started.md", "getting-started.md"],
  ["guide/ai.md", "ai.md"],
  ["api/index.md", "api.md"],
  ["components/index.md", "components.md"],
];

for (const [src, dest] of fileMap) {
  const srcPath = join(docsDir, src);
  const destPath = join(bundleDocsDir, dest);
  copyFileSync(srcPath, destPath);
  console.log(`Copied: docs/${src} → Script.bundle/docs/${dest}`);
}
