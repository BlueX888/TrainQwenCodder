/* eslint-disable no-console */

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const Module = require("module");

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

const BANNED_MODULES = new Set([
  "child_process",
  "cluster",
  "crypto",
  "dgram",
  "dns",
  "fs",
  "http",
  "https",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "stream",
  "tls",
  "url",
  "vm",
  "worker_threads",
]);

function setupRequireGuards() {
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (typeof request === "string" && BANNED_MODULES.has(request)) {
      throw new Error(`BANNED_MODULE:${request}`);
    }
    return originalLoad.apply(this, arguments);
  };
  return () => {
    Module._load = originalLoad;
  };
}

function setupDomIfAvailable() {
  // Best-effort: Phaser in Node often needs DOM/canvas. Keep optional.
  try {
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      pretendToBeVisual: true,
      url: "http://localhost",
    });
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = { userAgent: "node" };
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;

    // Patch canvas support if node-canvas is available.
    try {
      const canvas = require("canvas");
      const { createCanvas, Image } = canvas;
      global.Image = Image;
      if (global.HTMLCanvasElement && global.HTMLCanvasElement.prototype) {
        global.HTMLCanvasElement.prototype.getContext = function (type) {
          const w = this.width || 1;
          const h = this.height || 1;
          return createCanvas(w, h).getContext(type);
        };
      }
    } catch {
      // ignore
    }
  } catch {
    // Minimal stubs (may still fail for Phaser); keep very small.
    global.window = global;
    global.document = {
      createElement: () => ({
        getContext: () => null,
      }),
    };
    global.navigator = { userAgent: "node" };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const codeFile = args["code-file"];
  const frames = args.frames ? Number(args.frames) : 60;
  const runMs = Math.min(2000, Math.max(50, Math.floor(frames * 16)));

  const result = { ok: false, crashed: false, ms: 0, logs: [], errors: [], signals: {} };
  const t0 = Date.now();

  if (!codeFile) {
    result.crashed = true;
    result.errors.push("missing_code_file");
    result.ms = Date.now() - t0;
    process.stdout.write(JSON.stringify(result));
    return;
  }

  let code;
  try {
    code = fs.readFileSync(codeFile, "utf8");
  } catch (e) {
    result.crashed = true;
    result.errors.push("read_code_failed", String(e && e.message ? e.message : e));
    result.ms = Date.now() - t0;
    process.stdout.write(JSON.stringify(result));
    return;
  }

  const restoreRequire = setupRequireGuards();
  try {
    setupDomIfAvailable();

    let Phaser;
    try {
      Phaser = require("phaser");
    } catch (e) {
      result.crashed = true;
      result.errors.push("missing_phaser", String(e && e.message ? e.message : e));
      result.ms = Date.now() - t0;
      process.stdout.write(JSON.stringify(result));
      return;
    }

    global.Phaser = Phaser;

    let capturedGame = null;
    try {
      const OriginalGame = Phaser.Game;
      class CapturingGame extends OriginalGame {
        constructor(config) {
          super(config);
          capturedGame = this;
        }
      }
      Phaser.Game = CapturingGame;
      // Preserve a few expected static fields (best-effort).
      Object.assign(Phaser.Game, OriginalGame);
    } catch {
      // ignore; still try to run
    }

    const sandbox = {
      Phaser,
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      window: global.window || global,
      document: global.document || {},
    };
    sandbox.globalThis = sandbox;

    try {
      vm.runInNewContext(code, sandbox, {
        filename: path.basename(codeFile),
        timeout: 500,
      });
    } catch (e) {
      result.crashed = true;
      result.errors.push("runtime_eval_failed", String(e && e.message ? e.message : e));
      result.ms = Date.now() - t0;
      process.stdout.write(JSON.stringify(result));
      return;
    }

    await new Promise((r) => setTimeout(r, runMs));

    result.signals.game_created = Boolean(capturedGame);
    if (capturedGame && typeof capturedGame.destroy === "function") {
      try {
        capturedGame.destroy(true);
      } catch {
        // ignore
      }
    }

    result.ok = Boolean(capturedGame);
    result.ms = Date.now() - t0;
    process.stdout.write(JSON.stringify(result));
  } finally {
    restoreRequire();
  }
}

main().catch((e) => {
  const result = {
    ok: false,
    crashed: true,
    ms: 0,
    logs: [],
    errors: ["runtime_child_crash", String(e && e.message ? e.message : e)],
    signals: {},
  };
  process.stdout.write(JSON.stringify(result));
});

