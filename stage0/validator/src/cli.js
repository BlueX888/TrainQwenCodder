#!/usr/bin/env node
// validator 入口：串联 AST/ESLint/API 索引与可选运行时检查。
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const { parseAndCheck } = require("./ast_check");
const { runEslint } = require("./eslint_check");
const { loadApiIndex } = require("./api_index");
const { runHeadless } = require("./run_headless");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const k = t.slice(2);
    const v = argv[i + 1];
    if (v == null || v.startsWith("--")) {
      args[k] = true;
    } else {
      args[k] = v;
      i++;
    }
  }
  return args;
}

function safeJsonParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const codeFile = args["code-file"];
  const apiIndexPath = args["api-index"];
  const promptJson = args["prompt-json"] || "{}";
  const timeoutMs = args["timeout-ms"] ? Number(args["timeout-ms"]) : 1500;
  const frames = args.frames ? Number(args.frames) : 60;
  const skipEslint = Boolean(args["skip-eslint"]);
  const skipRuntime = Boolean(args["skip-runtime"]);

  const result = {
    parse_ok: false,
    lint_ok: false,
    api_ok: false,
    runtime_ok: false,
    errors: [],
    warnings: [],
    api_usage: { hits: [], misses: [], must_use_hits: [], must_use_misses: [] },
    runtime: { ms: 0, crashed: false, logs: [], errors: [], signals: {} },
    signals: {},
  };

  if (!codeFile) {
    result.errors.push({ code: "missing_arg", message: "Missing --code-file" });
    process.stdout.write(JSON.stringify(result));
    return;
  }

  let code;
  try {
    code = fs.readFileSync(codeFile, "utf8");
  } catch (e) {
    result.errors.push({ code: "read_failed", message: String(e && e.message ? e.message : e) });
    process.stdout.write(JSON.stringify(result));
    return;
  }

  const promptObj = safeJsonParse(promptJson, {});
  const mustUseApis = Array.isArray(promptObj.must_use_apis) ? promptObj.must_use_apis : [];

  const astRes = parseAndCheck(code, { mustUseApis });
  result.parse_ok = Boolean(astRes.parse_ok);
  result.signals = astRes.signals || {};

  for (const e of astRes.errors || []) result.errors.push(e);
  if (Array.isArray(astRes.banned) && astRes.banned.length) {
    for (const b of astRes.banned) result.errors.push(b);
  }

  // ESLint stage
  if (skipEslint) {
    result.lint_ok = true;
  } else {
    const lint = await runEslint(code, codeFile);
    result.lint_ok = Boolean(lint.ok);
    const msgs = Array.isArray(lint.messages) ? lint.messages : [];
    for (const m of msgs) {
      const payload = {
        code: m.ruleId || "eslint",
        message: m.message || "",
        line: m.line || 0,
        column: m.column || 0,
        severity: m.severity || 0,
      };
      if (m.severity === 2) result.errors.push(payload);
      else result.warnings.push(payload);
    }
  }

  // API index stage
  let apiIndex = null;
  if (apiIndexPath) {
    apiIndex = await loadApiIndex(apiIndexPath);
    if (!apiIndex.ok) {
      result.warnings.push({ code: "api_index_missing", message: `API index not found: ${apiIndexPath}` });
    } else {
      result.warnings.push({
        code: "api_index_loaded",
        message: `API index loaded: ${apiIndex.stats.parsed} symbols`,
      });
    }
  } else {
    result.warnings.push({ code: "api_index_missing", message: "No --api-index provided" });
  }

  if (apiIndex && apiIndex.ok) {
    const hits = [];
    const misses = [];
    const seen = new Set();
    for (const c of astRes.api_candidates || []) {
      if (!c || typeof c.symbol_id !== "string") continue;
      const sid = c.symbol_id;
      if (seen.has(sid)) continue;
      seen.add(sid);
      if (apiIndex.symbolIds.has(sid)) hits.push(c);
      else misses.push(c);
    }
    result.api_usage.hits = hits;
    result.api_usage.misses = misses;
  } else {
    // Without index, only enforce must-use check (best-effort string/AST match).
    result.api_usage.hits = [];
    result.api_usage.misses = [];
  }

  // Must-use checks:
  // - If must_use item looks like a symbol id (contains '#'), require it to appear in api_usage.hits.
  // - Otherwise, require it to appear in member strings or as a raw substring.
  {
    const mustHits = [];
    const mustMisses = [];
    const memberStrings = astRes.member_strings || new Set();
    const hitIds = new Set((result.api_usage.hits || []).map((h) => h.symbol_id));
    for (const must of mustUseApis) {
      if (typeof must !== "string" || !must.trim()) continue;
      const m = must.trim();
      if (m.includes("#")) {
        if (hitIds.has(m)) mustHits.push(m);
        else mustMisses.push(m);
      } else {
        if (memberStrings.has(m) || code.includes(m)) mustHits.push(m);
        else mustMisses.push(m);
      }
    }
    result.api_usage.must_use_hits = mustHits;
    result.api_usage.must_use_misses = mustMisses;
  }

  // api_ok gate combines API existence (if index available) + must-use checks.
  if (apiIndex && apiIndex.ok) {
    result.api_ok = (result.api_usage.misses || []).length === 0 && (result.api_usage.must_use_misses || []).length === 0;
  } else {
    result.api_ok = (result.api_usage.must_use_misses || []).length === 0;
  }

  // Runtime stage (optional; best-effort)
  if (skipRuntime) {
    result.runtime_ok = true;
  } else {
    // If AST stage already found unsafe patterns, do not execute.
    const hasUnsafe = (astRes.banned || []).length > 0;
    if (hasUnsafe) {
      result.runtime_ok = false;
      result.runtime = {
        ms: 0,
        crashed: true,
        logs: [],
        errors: ["unsafe_code_skip_runtime"],
        signals: {},
      };
    } else {
      const runtime = await runHeadless({
        codeFile: path.resolve(codeFile),
        frames,
        timeoutMs,
      });
      result.runtime_ok = Boolean(runtime.ok);
      result.runtime = {
        ms: runtime.ms || 0,
        crashed: Boolean(runtime.crashed),
        logs: runtime.logs || [],
        errors: runtime.errors || [],
        signals: runtime.signals || {},
      };
      if (!result.runtime_ok && (result.runtime.errors || []).length) {
        result.warnings.push({ code: "runtime_failed", message: (result.runtime.errors || []).join(" | ") });
      }
    }
  }

  process.stdout.write(JSON.stringify(result));
}

main().catch((e) => {
  const result = {
    parse_ok: false,
    lint_ok: false,
    api_ok: false,
    runtime_ok: false,
    errors: [{ code: "validator_crash", message: String(e && e.message ? e.message : e) }],
    warnings: [],
    api_usage: { hits: [], misses: [], must_use_hits: [], must_use_misses: [] },
    runtime: { ms: 0, crashed: true, logs: [], errors: [], signals: {} },
    signals: {},
  };
  process.stdout.write(JSON.stringify(result));
  process.exitCode = 1;
});
