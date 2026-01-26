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
    const dom = new JSDOM("<!doctype html><html><body><div id=\"game\"></div></body></html>", {
      pretendToBeVisual: true,
      url: "http://localhost",
      runScripts: "outside-only",
    });
    global.window = dom.window;
    global.self = dom.window; // self === window in browsers
    global.document = dom.window.document;
    global.navigator = dom.window.navigator || { userAgent: "node" };
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
    global.WebGLRenderingContext = dom.window.WebGLRenderingContext || class {};
    global.requestAnimationFrame = dom.window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = dom.window.cancelAnimationFrame || clearTimeout;
    global.Audio = dom.window.Audio || class { play() {} pause() {} };
    global.Image = dom.window.Image;
    global.XMLHttpRequest = dom.window.XMLHttpRequest;
    global.location = dom.window.location;

    // Additional DOM classes that Phaser may need
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    global.Text = dom.window.Text;
    global.DocumentFragment = dom.window.DocumentFragment;
    global.Event = dom.window.Event;
    global.MouseEvent = dom.window.MouseEvent;
    global.KeyboardEvent = dom.window.KeyboardEvent;
    global.TouchEvent = dom.window.TouchEvent || class extends dom.window.Event {};
    global.CustomEvent = dom.window.CustomEvent;
    global.DOMParser = dom.window.DOMParser;
    global.URL = dom.window.URL;
    global.Blob = dom.window.Blob;
    global.FileReader = dom.window.FileReader;
    global.performance = dom.window.performance || { now: () => Date.now() };
    global.screen = dom.window.screen || { width: 800, height: 600, orientation: { type: "landscape-primary" } };

    // Phaser checks 'ontouchstart' in window - ensure it exists (as undefined, not missing)
    if (!("ontouchstart" in global.window)) {
      global.window.ontouchstart = undefined;
    }

    // Patch canvas support - try node-canvas first, fall back to mock
    let hasRealCanvas = false;
    try {
      const canvas = require("canvas");
      const { createCanvas, Image: CanvasImage } = canvas;
      global.Image = CanvasImage;
      if (global.HTMLCanvasElement && global.HTMLCanvasElement.prototype) {
        global.HTMLCanvasElement.prototype.getContext = function (type) {
          const w = this.width || 1;
          const h = this.height || 1;
          const ctx = createCanvas(w, h).getContext(type);
          return ctx;
        };
      }
      const origCreateElement = global.document.createElement.bind(global.document);
      global.document.createElement = function(tag) {
        if (tag === "canvas") {
          const c = createCanvas(800, 600);
          c.style = {};
          return c;
        }
        return origCreateElement(tag);
      };
      hasRealCanvas = true;
    } catch {
      // canvas not available - provide minimal mock for Phaser HEADLESS mode
      const mockContext = {
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        imageSmoothingEnabled: true,
        canvas: null,
        fillRect: () => {},
        clearRect: () => {},
        strokeRect: () => {},
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
        putImageData: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }),
        setTransform: () => {},
        resetTransform: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        transform: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        arcTo: () => {},
        quadraticCurveTo: () => {},
        bezierCurveTo: () => {},
        rect: () => {},
        ellipse: () => {},
        fill: () => {},
        stroke: () => {},
        clip: () => {},
        isPointInPath: () => false,
        measureText: (text) => ({ width: text ? text.length * 6 : 0 }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createPattern: () => ({}),
        setLineDash: () => {},
        getLineDash: () => [],
      };

      const mockWebGLContext = {
        canvas: null,
        getExtension: () => null,
        getParameter: () => null,
        getShaderPrecisionFormat: () => ({ precision: 0, rangeMin: 0, rangeMax: 0 }),
        createShader: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        getShaderParameter: () => true,
        createProgram: () => ({}),
        attachShader: () => {},
        linkProgram: () => {},
        getProgramParameter: () => true,
        useProgram: () => {},
        getAttribLocation: () => 0,
        getUniformLocation: () => ({}),
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        createTexture: () => ({}),
        bindTexture: () => {},
        texParameteri: () => {},
        texImage2D: () => {},
        uniform1i: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix4fv: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        viewport: () => {},
        clearColor: () => {},
        clear: () => {},
        enable: () => {},
        disable: () => {},
        blendFunc: () => {},
        createFramebuffer: () => ({}),
        bindFramebuffer: () => {},
        framebufferTexture2D: () => {},
        checkFramebufferStatus: () => 36053, // FRAMEBUFFER_COMPLETE
        deleteTexture: () => {},
        deleteBuffer: () => {},
        deleteFramebuffer: () => {},
        deleteProgram: () => {},
        deleteShader: () => {},
        pixelStorei: () => {},
        activeTexture: () => {},
        scissor: () => {},
        TRIANGLES: 4,
        UNSIGNED_SHORT: 5123,
        FLOAT: 5126,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_2D: 3553,
        FRAMEBUFFER: 36160,
        COLOR_ATTACHMENT0: 36064,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_MAG_FILTER: 10240,
        LINEAR: 9729,
        CLAMP_TO_EDGE: 33071,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
      };

      // Patch HTMLCanvasElement.prototype.getContext
      if (global.HTMLCanvasElement && global.HTMLCanvasElement.prototype) {
        global.HTMLCanvasElement.prototype.getContext = function (type) {
          if (type === "2d") {
            const ctx = { ...mockContext };
            ctx.canvas = this;
            return ctx;
          }
          if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") {
            const ctx = { ...mockWebGLContext };
            ctx.canvas = this;
            return ctx;
          }
          return null;
        };
      }
    }
  } catch {
    // Minimal stubs (may still fail for Phaser); keep very small.
    const minimalWindow = {
      document: null,
      navigator: { userAgent: "node" },
      location: { href: "http://localhost", protocol: "http:" },
      ontouchstart: undefined,
      requestAnimationFrame: (cb) => setTimeout(cb, 16),
      cancelAnimationFrame: clearTimeout,
      addEventListener: () => {},
      removeEventListener: () => {},
      getComputedStyle: () => ({}),
      innerWidth: 800,
      innerHeight: 600,
      devicePixelRatio: 1,
    };
    minimalWindow.document = {
      createElement: (tag) => {
        if (tag === "canvas") {
          return {
            getContext: () => ({
              fillRect: () => {},
              clearRect: () => {},
              drawImage: () => {},
              getImageData: () => ({ data: [] }),
              putImageData: () => {},
              createImageData: () => ({ data: [] }),
              setTransform: () => {},
              save: () => {},
              restore: () => {},
              scale: () => {},
              rotate: () => {},
              translate: () => {},
              transform: () => {},
              beginPath: () => {},
              closePath: () => {},
              moveTo: () => {},
              lineTo: () => {},
              arc: () => {},
              fill: () => {},
              stroke: () => {},
              clip: () => {},
              measureText: () => ({ width: 0 }),
            }),
            width: 800,
            height: 600,
            style: {},
            addEventListener: () => {},
            removeEventListener: () => {},
          };
        }
        return {
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          appendChild: () => {},
        };
      },
      body: {
        appendChild: () => {},
        removeChild: () => {},
        style: {},
      },
      documentElement: {
        style: {},
      },
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    global.window = minimalWindow;
    global.document = minimalWindow.document;
    global.navigator = minimalWindow.navigator;
    global.requestAnimationFrame = minimalWindow.requestAnimationFrame;
    global.cancelAnimationFrame = minimalWindow.cancelAnimationFrame;
    global.Audio = class { play() {} pause() {} };
    global.Image = class {};
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

  // IMPORTANT: Setup DOM environment BEFORE requiring Phaser
  // Phaser checks for browser globals at load time
  setupDomIfAvailable();

  const restoreRequire = setupRequireGuards();
  try {
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

