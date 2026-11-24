// Ridiculous at First Glance, Real by the Second — entry program.
// Writes the one-sentence startup pitch to <output>/entry.txt.
// Node 22, standard library only; the pitch itself lives in LINE.txt.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;
const HERE = dirname(fileURLToPath(import.meta.url));

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function loadPitch(): string {
  const raw = readFileSync(join(HERE, "LINE.txt"), "utf-8");
  return raw.replace(/\r\n?/g, "\n").replace(/\n$/, "");
}

function validatePitch(pitch: string): void {
  const problems: string[] = [];
  if (pitch.length < 1 || pitch.length > MAX_CHARS) {
    problems.push(`length ${pitch.length} is outside 1-${MAX_CHARS} characters`);
  }
  if (pitch.trim().length === 0) problems.push("pitch is only whitespace");
  if (pitch.includes("\n") || pitch.includes("\r")) {
    problems.push("pitch must be a single line");
  }
  for (const ch of pitch) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 && ch !== "\t") {
      problems.push("pitch contains a control character");
      break;
    }
  }
  if (problems.length > 0) fail(problems.join("; "));
}

function emit(pitch: string): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, pitch, "utf-8");
  const back = readFileSync(target, "utf-8");
  if (back !== pitch) fail("read-back mismatch after writing entry.txt");
  const bytes = Buffer.byteLength(pitch, "utf-8");
  console.log(`wrote ${target} (${pitch.length} characters, ${bytes} bytes)`);
}

const pitch = loadPitch();
validatePitch(pitch);
emit(pitch);
