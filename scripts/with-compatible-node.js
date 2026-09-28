#!/usr/bin/env node
"use strict";
/**
 * jsdom (pulled in by isomorphic-dompurify for server-side blog HTML
 * sanitization — see src/lib/blog/rich-content.ts) declares a hard Node
 * engine requirement: ^22.22.2 || ^24.15.0 || >=26.0.0. Running it on any
 * other Node version throws a cryptic runtime error deep inside Next's
 * dev/build server the first time anything imports rich-content.ts
 * ("webidl.util.markAsUncloneable is not a function") — nothing to do
 * with the app's code, purely a Node-version mismatch.
 *
 * This wrapper checks the Node that `npm run dev|build|start` actually
 * launched under. If it's incompatible, it searches common install
 * locations (Homebrew, nvm, Volta, fnm) for a Node version that *does*
 * satisfy the range and re-execs the real Next.js CLI under that binary
 * instead — so `npm run dev` keeps working regardless of which Node
 * happens to be first on PATH in a given terminal. If nothing compatible
 * is found on disk, it fails fast with an actionable message instead of
 * letting the app crash later with the confusing jsdom/webidl error.
 */
const { spawnSync, execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const REQUIRED_RANGES = [
  { min: [22, 22, 2], max: [22, Infinity, Infinity] },
  { min: [24, 15, 0], max: [24, Infinity, Infinity] },
  { min: [26, 0, 0], max: [Infinity, Infinity, Infinity] },
];

function parseVersion(v) {
  return v.replace(/^v/, "").trim().split(".").map((n) => parseInt(n, 10));
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function satisfies(versionString) {
  const v = parseVersion(versionString);
  return REQUIRED_RANGES.some(
    (r) => compareVersions(v, r.min) >= 0 && compareVersions(v, r.max) <= 0
  );
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function candidateNodeBinaries() {
  const candidates = new Set();
  const home = os.homedir();

  // Homebrew, Apple Silicon and Intel prefixes, any node@NN formula.
  for (const prefix of ["/opt/homebrew/opt", "/usr/local/opt"]) {
    for (const entry of safeReaddir(prefix)) {
      if (/^node(@\d+)?$/.test(entry)) {
        candidates.add(path.join(prefix, entry, "bin", "node"));
      }
    }
  }

  // nvm.
  const nvmDir = path.join(home, ".nvm", "versions", "node");
  for (const entry of safeReaddir(nvmDir)) {
    candidates.add(path.join(nvmDir, entry, "bin", "node"));
  }

  // Volta.
  const voltaDir = path.join(home, ".volta", "tools", "image", "node");
  for (const entry of safeReaddir(voltaDir)) {
    candidates.add(path.join(voltaDir, entry, "bin", "node"));
  }

  // fnm.
  const fnmDir = path.join(home, ".fnm", "node-versions");
  for (const entry of safeReaddir(fnmDir)) {
    candidates.add(path.join(fnmDir, entry, "installation", "bin", "node"));
  }

  return Array.from(candidates).filter((p) => fs.existsSync(p));
}

function versionOf(binary) {
  try {
    return execFileSync(binary, ["-v"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function main() {
  const forwarded = process.argv.slice(2); // e.g. ["dev"] or ["dev", "-p", "3001"]
  let nodeBinary = process.execPath;

  if (!satisfies(process.version)) {
    const compatible = candidateNodeBinaries()
      .map((bin) => ({ bin, version: versionOf(bin) }))
      .filter((c) => c.version && satisfies(c.version))
      .sort((a, b) => compareVersions(parseVersion(b.version), parseVersion(a.version)));

    if (compatible.length > 0) {
      nodeBinary = compatible[0].bin;
      console.log(
        `[with-compatible-node] Active Node ${process.version} can't run jsdom ` +
          `(needs ^22.22.2 || ^24.15.0 || >=26.0.0). Relaunching under ${nodeBinary} ` +
          `(${compatible[0].version}) instead.`
      );
    } else {
      console.error(
        `\n[with-compatible-node] Active Node is ${process.version}, but this project ` +
          `needs ^22.22.2 || ^24.15.0 || >=26.0.0 (jsdom's requirement, via isomorphic-dompurify).\n` +
          `No compatible Node install was found automatically on this machine.\n\n` +
          `Install one, then try again:\n` +
          `  brew install node@22\n\n` +
          `(nvm and Volta installs are also auto-detected if you have either instead.)\n`
      );
      process.exit(1);
    }
  }

  const nextBin = path.join(__dirname, "..", "node_modules", ".bin", "next");
  const result = spawnSync(nodeBinary, [nextBin, ...forwarded], { stdio: "inherit" });
  process.exit(result.status === null ? 1 : result.status);
}

main();
