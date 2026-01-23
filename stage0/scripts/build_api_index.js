#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Build a lightweight Phaser3 API index from a .d.ts file.
 *
 * Goal: provide a "good enough" machine-readable index for:
 * - prompt context injection (query topK APIs)
 * - weak API existence checks in validator/reward
 *
 * This script intentionally avoids external dependencies.
 */

const fs = require("fs");
const path = require("path");

function die(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function stripComments(input) {
  let out = "";
  let i = 0;
  let inLine = false;
  let inBlock = false;
  let inString = false;
  let stringChar = "";

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += "\n";
      }
      i++;
      continue;
    }

    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i += 2;
        continue;
      }
      if (ch === "\n") out += "\n";
      i++;
      continue;
    }

    if (inString) {
      out += ch;
      if (ch === "\\") {
        if (next != null) {
          out += next;
          i += 2;
          continue;
        }
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      inLine = true;
      i += 2;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlock = true;
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

function countChars(line, ch) {
  let c = 0;
  for (let i = 0; i < line.length; i++) if (line[i] === ch) c++;
  return c;
}

function splitTopLevelComma(s) {
  const parts = [];
  let cur = "";
  let depthParen = 0;
  let depthAngle = 0;
  let depthBrack = 0;
  let depthBrace = 0;
  let inString = false;
  let stringChar = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (inString) {
      cur += ch;
      if (ch === "\\") {
        if (next != null) {
          cur += next;
          i++;
        }
        continue;
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      cur += ch;
      continue;
    }
    if (ch === "(") depthParen++;
    else if (ch === ")") depthParen = Math.max(0, depthParen - 1);
    else if (ch === "<") depthAngle++;
    else if (ch === ">") depthAngle = Math.max(0, depthAngle - 1);
    else if (ch === "[") depthBrack++;
    else if (ch === "]") depthBrack = Math.max(0, depthBrack - 1);
    else if (ch === "{") depthBrace++;
    else if (ch === "}") depthBrace = Math.max(0, depthBrace - 1);

    if (
      ch === "," &&
      depthParen === 0 &&
      depthAngle === 0 &&
      depthBrack === 0 &&
      depthBrace === 0
    ) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function splitTopLevelColon(s) {
  let depthParen = 0;
  let depthAngle = 0;
  let depthBrack = 0;
  let depthBrace = 0;
  let inString = false;
  let stringChar = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = "";
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === "(") depthParen++;
    else if (ch === ")") depthParen = Math.max(0, depthParen - 1);
    else if (ch === "<") depthAngle++;
    else if (ch === ">") depthAngle = Math.max(0, depthAngle - 1);
    else if (ch === "[") depthBrack++;
    else if (ch === "]") depthBrack = Math.max(0, depthBrack - 1);
    else if (ch === "{") depthBrace++;
    else if (ch === "}") depthBrace = Math.max(0, depthBrace - 1);

    if (
      ch === ":" &&
      depthParen === 0 &&
      depthAngle === 0 &&
      depthBrack === 0 &&
      depthBrace === 0
    ) {
      return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
    }
  }
  return [s.trim(), ""];
}

function parseParams(paramList) {
  const params = [];
  const parts = splitTopLevelComma(paramList);
  for (const p of parts) {
    if (!p) continue;
    const [lhs, rhs] = splitTopLevelColon(p);
    let namePart = lhs.trim();
    let optional = false;
    let rest = false;
    if (namePart.startsWith("...")) {
      rest = true;
      namePart = namePart.slice(3).trim();
    }
    if (namePart.endsWith("?")) {
      optional = true;
      namePart = namePart.slice(0, -1);
    }
    const name = namePart;
    const type = rhs.trim();
    params.push({ name, type, optional, rest });
  }
  return params;
}

function makeTagsFromOwner(owner) {
  const parts = owner.split(".").filter(Boolean);
  if (parts[0] === "Phaser") return parts.slice(1);
  return parts;
}

function toPosixPath(p) {
  return p.split(path.sep).join(path.posix.sep);
}

function main() {
  const args = parseArgs(process.argv);
  const dtsPath = args.dts;
  const outPath = args.out;
  const metaPath = args.meta || null;
  const phaserVersion = args["phaser-version"] || "";
  const maxRecords = args["max-records"] ? Number(args["max-records"]) : null;

  if (!dtsPath) die("Missing required arg: --dts <path/to/phaser.d.ts>");
  if (!outPath) die("Missing required arg: --out <path/to/output.jsonl>");
  if (!fs.existsSync(dtsPath)) die(`d.ts not found: ${dtsPath}`);

  const raw = fs.readFileSync(dtsPath, "utf8");
  const text = stripComments(raw);
  const lines = text.split(/\r?\n/);

  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  const outFd = fs.openSync(outPath, "w");

  /** @type {{type: string, name: string, braceDepth: number}[]} */
  const stack = [];
  /** @type {{type: string, name: string} | null} */
  let pending = null;
  let braceDepth = 0;

  const stats = {
    total: 0,
    kind: {},
  };

  function currentNamespaceFqn() {
    const parts = [];
    for (const ctx of stack) {
      if (ctx.type === "namespace") parts.push(ctx.name);
    }
    return parts.join(".");
  }

  function currentOwnerFqn() {
    const parts = [];
    for (const ctx of stack) {
      if (ctx.type === "namespace" || ctx.type === "class" || ctx.type === "interface") {
        parts.push(ctx.name);
      }
    }
    return parts.join(".");
  }

  function inTypeBody() {
    if (stack.length === 0) return false;
    const top = stack[stack.length - 1];
    return top.type === "class" || top.type === "interface";
  }

  function pushContext(type, name, lineNo, signatureLine) {
    const depthAfterOpen = braceDepth + 1;
    stack.push({ type, name, braceDepth: depthAfterOpen });

    // Record high-level symbols to make the index useful for prompts (classes/namespaces)
    if (type === "namespace" || type === "class" || type === "interface") {
      const fullName = type === "namespace" ? currentNamespaceFqn() : currentOwnerFqn();
      if (fullName.startsWith("Phaser")) {
        const owner =
          type === "namespace"
            ? fullName.split(".").slice(0, -1).join(".")
            : currentNamespaceFqn();
        const rec = {
          symbol_id: fullName,
          name,
          kind: type,
          owner,
          signature: signatureLine ? signatureLine.replace(/;\s*$/, "") : `${type} ${name}`,
          params: [],
          returns: { type: "" },
          tags: makeTagsFromOwner(fullName),
          source: {
            origin: "dts",
            version: phaserVersion,
            path: dtsPathForMeta,
            loc: { start_line: lineNo, end_line: lineNo },
          },
          doc: "",
          examples: [],
        };
        writeRecord(rec);
      }
    }
  }

  function writeRecord(rec) {
    fs.writeSync(outFd, JSON.stringify(rec) + "\n");
    stats.total++;
    stats.kind[rec.kind] = (stats.kind[rec.kind] || 0) + 1;
  }

  const reNamespace = /^\s*(?:export\s+)?(?:declare\s+)?namespace\s+([A-Za-z0-9_$]+)\s*(\{)?/;
  const reModule = /^\s*(?:export\s+)?(?:declare\s+)?module\s+([A-Za-z0-9_$]+)\s*(\{)?/;
  const reClass = /^\s*(?:export\s+)?(?:declare\s+)?class\s+([A-Za-z0-9_$]+)\b[^{]*?(\{)?/;
  const reInterface = /^\s*(?:export\s+)?(?:declare\s+)?interface\s+([A-Za-z0-9_$]+)\b[^{]*?(\{)?/;
  const reEnum = /^\s*(?:export\s+)?(?:declare\s+)?enum\s+([A-Za-z0-9_$]+)\s*(\{)?/;

  const reMethod =
    /^\s*(?:(?:public|protected|private)\s+)?(?:(?:static)\s+)?(?:(?:readonly)\s+)?([A-Za-z0-9_$]+)\??\s*(?:<[^>]+>\s*)?\(([^)]*)\)\s*(?::\s*([^;{]+))?\s*;/;
  const reProperty =
    /^\s*(?:(?:public|protected|private)\s+)?(?:(?:static)\s+)?(?:(?:readonly)\s+)?([A-Za-z0-9_$]+)\??\s*:\s*([^;{]+)\s*;/;
  const reAccessor = /^\s*(get|set)\s+([A-Za-z0-9_$]+)\s*(?:<[^>]+>\s*)?\(([^)]*)\)\s*(?::\s*([^;{]+))?\s*;/;

  const reNamespaceFunction =
    /^\s*(?:export\s+)?function\s+([A-Za-z0-9_$]+)\s*(?:<[^>]+>\s*)?\(([^)]*)\)\s*:\s*([^;{]+)\s*;/;
  const reNamespaceConst =
    /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*:\s*([^;{]+)\s*;/;

  const dtsPathForMeta = toPosixPath(path.resolve(dtsPath));
  const nowIso = new Date().toISOString();

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNo = lineIdx + 1;
    const line = lines[lineIdx];
    const trimmed = line.trim();
    if (!trimmed) {
      const open = countChars(line, "{");
      const close = countChars(line, "}");
      braceDepth = Math.max(0, braceDepth + open - close);
      while (stack.length > 0 && braceDepth < stack[stack.length - 1].braceDepth) stack.pop();
      continue;
    }

    if (maxRecords != null && stats.total >= maxRecords) break;

    // Detect new contexts (namespace/class/interface/enum/module)
    let m;
    if ((m = trimmed.match(reNamespace))) {
      const name = m[1];
      const hasOpen = Boolean(m[2]);
      if (hasOpen) pushContext("namespace", name, lineNo, trimmed);
      else pending = { type: "namespace", name };
    } else if ((m = trimmed.match(reModule))) {
      const name = m[1];
      const hasOpen = Boolean(m[2]);
      if (hasOpen) pushContext("namespace", name, lineNo, trimmed);
      else pending = { type: "namespace", name };
    } else if ((m = trimmed.match(reClass))) {
      const name = m[1];
      const hasOpen = Boolean(m[2]);
      if (hasOpen) pushContext("class", name, lineNo, trimmed);
      else pending = { type: "class", name };
    } else if ((m = trimmed.match(reInterface))) {
      const name = m[1];
      const hasOpen = Boolean(m[2]);
      if (hasOpen) pushContext("interface", name, lineNo, trimmed);
      else pending = { type: "interface", name };
    } else if ((m = trimmed.match(reEnum))) {
      const name = m[1];
      const hasOpen = Boolean(m[2]);
      if (hasOpen) pushContext("enum", name, lineNo, trimmed);
      else pending = { type: "enum", name };
    }

    const open = countChars(line, "{");
    const close = countChars(line, "}");

    // If we had a pending context and this line opens a block, assume the first '{' belongs to it.
    if (pending && open > 0) {
      pushContext(pending.type, pending.name, lineNo, trimmed);
      pending = null;
    }

    // Extract members in class/interface
    if (inTypeBody()) {
      // Skip obvious non-member lines
      if (!trimmed.startsWith("constructor") && !trimmed.startsWith("new ")) {
        let mm;
        if ((mm = trimmed.match(reAccessor))) {
          const name = mm[2];
          const params = parseParams(mm[3] || "");
          const returns = mm[1] === "get" ? (mm[4] || "").trim() : "void";
          const owner = currentOwnerFqn();
          if (owner.startsWith("Phaser.")) {
            const rec = {
              symbol_id: `${owner}.${name}`,
              name,
              kind: "property",
              owner,
              signature: trimmed.replace(/;\s*$/, ""),
              params,
              returns: { type: returns },
              tags: makeTagsFromOwner(owner),
              source: {
                origin: "dts",
                version: phaserVersion,
                path: dtsPathForMeta,
                loc: { start_line: lineNo, end_line: lineNo },
              },
              doc: "",
              examples: [],
            };
            writeRecord(rec);
          }
        } else if ((mm = trimmed.match(reMethod))) {
          const name = mm[1];
          const paramList = mm[2] || "";
          const returns = (mm[3] || "void").trim();
          const owner = currentOwnerFqn();
          if (owner.startsWith("Phaser.")) {
            const rec = {
              symbol_id: `${owner}#${name}`,
              name,
              kind: "method",
              owner,
              signature: trimmed.replace(/;\s*$/, ""),
              params: parseParams(paramList),
              returns: { type: returns },
              tags: makeTagsFromOwner(owner),
              source: {
                origin: "dts",
                version: phaserVersion,
                path: dtsPathForMeta,
                loc: { start_line: lineNo, end_line: lineNo },
              },
              doc: "",
              examples: [],
            };
            writeRecord(rec);
          }
        } else if ((mm = trimmed.match(reProperty))) {
          const name = mm[1];
          const type = (mm[2] || "").trim();
          const owner = currentOwnerFqn();
          if (owner.startsWith("Phaser.")) {
            const rec = {
              symbol_id: `${owner}.${name}`,
              name,
              kind: "property",
              owner,
              signature: trimmed.replace(/;\s*$/, ""),
              params: [],
              returns: { type },
              tags: makeTagsFromOwner(owner),
              source: {
                origin: "dts",
                version: phaserVersion,
                path: dtsPathForMeta,
                loc: { start_line: lineNo, end_line: lineNo },
              },
              doc: "",
              examples: [],
            };
            writeRecord(rec);
          }
        }
      }
    } else {
      // Extract namespace-level functions/constants (useful for enum-like constants such as Input.Events.*)
      const ns = currentNamespaceFqn();
      if (ns.startsWith("Phaser")) {
        let nn;
        if ((nn = trimmed.match(reNamespaceFunction))) {
          const name = nn[1];
          const paramList = nn[2] || "";
          const returns = (nn[3] || "void").trim();
          const owner = ns;
          const rec = {
            symbol_id: `${owner}.${name}`,
            name,
            kind: "function",
            owner,
            signature: trimmed.replace(/;\s*$/, ""),
            params: parseParams(paramList),
            returns: { type: returns },
            tags: makeTagsFromOwner(owner),
            source: {
              origin: "dts",
              version: phaserVersion,
              path: dtsPathForMeta,
              loc: { start_line: lineNo, end_line: lineNo },
            },
            doc: "",
            examples: [],
          };
          writeRecord(rec);
        } else if ((nn = trimmed.match(reNamespaceConst))) {
          const name = nn[1];
          const type = (nn[2] || "").trim();
          const owner = ns;
          const rec = {
            symbol_id: `${owner}.${name}`,
            name,
            kind: "const",
            owner,
            signature: trimmed.replace(/;\s*$/, ""),
            params: [],
            returns: { type },
            tags: makeTagsFromOwner(owner),
            source: {
              origin: "dts",
              version: phaserVersion,
              path: dtsPathForMeta,
              loc: { start_line: lineNo, end_line: lineNo },
            },
            doc: "",
            examples: [],
          };
          writeRecord(rec);
        }
      }
    }

    braceDepth = Math.max(0, braceDepth + open - close);
    while (stack.length > 0 && braceDepth < stack[stack.length - 1].braceDepth) stack.pop();
  }

  fs.closeSync(outFd);

  if (metaPath) {
    const metaDir = path.dirname(metaPath);
    fs.mkdirSync(metaDir, { recursive: true });
    fs.writeFileSync(
      metaPath,
      JSON.stringify(
        {
          phaser_version: phaserVersion,
          source_dts: dtsPathForMeta,
          build_time: nowIso,
          stats,
          notes:
            "Built via lightweight regex/state-machine parser. For higher fidelity, consider a TypeScript compiler API based builder.",
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
  }

  console.error(
    `Wrote ${stats.total} records to ${outPath}${metaPath ? ` (meta: ${metaPath})` : ""}`
  );
}

main();
