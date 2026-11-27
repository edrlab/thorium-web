#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const PLUGIN_FILES = [
  "src/components/Plugins/helpers/createDefaultPlugin.ts",
  "src/components/Plugins/helpers/createAudioDefaultPlugin.ts",
];

const INSTALL_COMMAND_FILES = [
  "README.md",
  "docs/packages/ReadMe.md",
];

const bump = (version, type) => {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${ major + 1 }.0.0`;
  if (type === "minor") return `${ major }.${ minor + 1 }.0`;
  if (type === "patch") return `${ major }.${ minor }.${ patch + 1 }`;
  throw new Error(`Unknown increment type: "${ type }". Use patch, minor, or major.`);
};

const type = process.argv[2];
if (!type) {
  console.error("Usage: node scripts/increment.mjs <patch|minor|major>");
  process.exit(1);
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const oldVersion = pkg.version;
const newVersion = bump(oldVersion, type);

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`package.json: ${oldVersion} → ${newVersion}`);

for (const relPath of PLUGIN_FILES) {
  const filePath = path.join(root, relPath);
  const content = fs.readFileSync(filePath, "utf-8");
  const updated = content.replace(
    /(\bversion:\s*")[^"]+(")/,
    `$1${ newVersion }$2`
  );
  if (updated === content) {
    console.warn(`  No version string found in ${ relPath }`);
  } else {
    fs.writeFileSync(filePath, updated);
    console.log(`  ${ relPath }: updated to ${ newVersion }`);
  }
}

// Quoted, as cmd.exe drops an unquoted ^
const peerSpecs = Object.entries(pkg.peerDependencies ?? {}).map(([name, range]) => `"${ name }@${ range }"`);
const installCommand = ["npm install @edrlab/thorium-web", ...peerSpecs].join(" ");

for (const relPath of INSTALL_COMMAND_FILES) {
  const filePath = path.join(root, relPath);
  const content = fs.readFileSync(filePath, "utf-8");
  const updated = content.replace(/^npm install @edrlab\/thorium-web\b.*$/gm, installCommand);
  if (updated === content) {
    console.log(`  ${ relPath }: install command already up to date`);
  } else {
    fs.writeFileSync(filePath, updated);
    console.log(`  ${ relPath }: install command updated`);
  }
}
