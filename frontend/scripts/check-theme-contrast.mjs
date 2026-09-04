#!/usr/bin/env node
// Theme contrast check for the walnut theme tokens.
// Parses frontend/src/styles/index.css (source of truth) and asserts WCAG
// contrast ratios for both :root (light) and .dark themes. No dependencies.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, "..", "src", "styles", "index.css");
const css = readFileSync(cssPath, "utf8");

function parseBlock(selector) {
  const escaped = selector.replace(".", "\\.");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`Block not found: ${selector}`);
  const tokens = {};
  for (const line of match[1].split(";")) {
    const m = line.match(/--([\w-]+)\s*:\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
    if (m) tokens[m[1]] = { h: Number(m[2]), s: Number(m[3]), l: Number(m[4]) };
  }
  return tokens;
}

function hslToRgb({ h, s, l }) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb;
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = ln - c / 2;
  return rgb.map((v) => v + m);
}

function luminance(rgb) {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const [r, g, b] = rgb.map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(tokens, nameA, nameB) {
  const a = tokens[nameA];
  const b = tokens[nameB];
  if (!a || !b) throw new Error(`Missing token: ${nameA} or ${nameB}`);
  const [l1, l2] = [luminance(hslToRgb(a)), luminance(hslToRgb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [foreground, background, minimum ratio, hard requirement?]
const ASSERTIONS = [
  ["foreground", "background", 7.0, true],
  ["card-foreground", "card", 7.0, true],
  ["muted-foreground", "background", 4.5, true],
  ["muted-foreground", "card", 4.5, true],
  ["primary", "background", 4.5, true],
  ["success", "background", 4.5, true],
  ["warning", "background", 4.5, true],
  ["destructive", "background", 4.5, true],
  ["primary-foreground", "primary", 4.5, true],
  ["destructive-foreground", "destructive", 4.5, true],
  ["primary-deep-foreground", "primary-deep", 4.5, true],
  ["ring", "background", 3.0, true],
  ["control-border", "background", 3.0, true],
  ["control-border", "card", 3.0, true],
  // Decorative divider only: recorded, never asserted. Interactive controls
  // must use control-border instead.
  ["border", "background", 0, false],
  ["border", "card", 0, false],
];

let failed = 0;
for (const [label, selector] of [["light", ":root"], ["dark", ".dark"]]) {
  const tokens = parseBlock(selector);
  console.log(`\n[${label}] ${cssPath}`);
  for (const [fg, bg, min, hard] of ASSERTIONS) {
    const ratio = contrast(tokens, fg, bg);
    if (!hard) {
      console.log(`  info  ${fg}/${bg} = ${ratio.toFixed(2)}:1 (decorative, no threshold)`);
      continue;
    }
    const ok = ratio >= min;
    if (!ok) failed += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${fg}/${bg} = ${ratio.toFixed(2)}:1 (min ${min}:1)`,
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} contrast assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll theme contrast assertions passed.");
