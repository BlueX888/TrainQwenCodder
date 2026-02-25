// AST 解析与结构信号/危险用法/API 候选提取。
function requireOptional(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

const babelParser = requireOptional("@babel/parser");
const traverseMod = requireOptional("@babel/traverse");
const traverse = traverseMod ? traverseMod.default || traverseMod : null;

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

const THIS_CHAIN_OWNER_MAP = {
  "this.add": "Phaser.GameObjects.GameObjectFactory",
  "this.make": "Phaser.GameObjects.GameObjectCreator",
  "this.physics.add": "Phaser.Physics.Arcade.Factory",
  "this.physics.world": "Phaser.Physics.Arcade.World",
  "this.input": "Phaser.Input.InputPlugin",
  "this.input.keyboard": "Phaser.Input.Keyboard.KeyboardPlugin",
  "this.input.mouse": "Phaser.Input.Mouse.MousePlugin",
  "this.input.touch": "Phaser.Input.Touch.TouchPlugin",
  "this.anims": "Phaser.Animations.AnimationManager",
  "this.tweens": "Phaser.Tweens.TweenManager",
  "this.cameras.main": "Phaser.Cameras.Scene2D.Camera",
  "this.time": "Phaser.Time.TimePlugin",
  "this.sound": "Phaser.Sound.BaseSoundManager",
};

const THIS_CHAIN_KEYS_DESC = Object.keys(THIS_CHAIN_OWNER_MAP).sort((a, b) => {
  const al = a.split(".").length;
  const bl = b.split(".").length;
  return bl - al;
});

const EVENT_EMITTER_METHODS = new Set([
  "on",
  "once",
  "off",
  "emit",
  "addListener",
  "removeListener",
  "removeAllListeners",
  "listenerCount",
  "listeners",
]);

function memberExprToParts(node) {
  const parts = [];
  let cur = node;
  while (cur) {
    if (cur.type === "MemberExpression") {
      if (cur.computed) return null;
      const prop = cur.property;
      if (!prop || prop.type !== "Identifier") return null;
      parts.unshift(prop.name);
      cur = cur.object;
      continue;
    }
    if (cur.type === "Identifier") {
      parts.unshift(cur.name);
      break;
    }
    if (cur.type === "ThisExpression") {
      parts.unshift("this");
      break;
    }
    return null;
  }
  return parts.length ? parts : null;
}

function partsToString(parts) {
  return parts.join(".");
}

function locToObj(loc) {
  if (!loc) return null;
  return {
    start: { line: loc.start.line, column: loc.start.column },
    end: { line: loc.end.line, column: loc.end.column },
  };
}

function mapThisCallToSymbolId(parts) {
  const chain = partsToString(parts);
  for (const base of THIS_CHAIN_KEYS_DESC) {
    const baseParts = base.split(".");
    if (parts.length <= baseParts.length) continue;
    const head = parts.slice(0, baseParts.length).join(".");
    if (head !== base) continue;
    const owner = THIS_CHAIN_OWNER_MAP[base];
    const name = parts[baseParts.length];
    if (!name) return null;
    // Many Phaser objects are EventEmitter; their event methods may be inherited and
    // not declared on the concrete type. Map to EventEmitter to reduce false API misses.
    if (EVENT_EMITTER_METHODS.has(name)) {
      return `Phaser.Events.EventEmitter#${name}`;
    }
    return `${owner}#${name}`;
  }
  return null;
}

function isAllCapsToken(s) {
  return /^[A-Z0-9_]+$/.test(s);
}

function parseAndCheck(code, options) {
  const mustUseApis = Array.isArray(options?.mustUseApis) ? options.mustUseApis : [];

  const res = {
    parse_ok: false,
    errors: [],
    warnings: [],
    signals: {
      has_new_phaser_game: false,
      has_scene_in_config: false,
      has_preload: false,
      has_create: false,
      has_update: false,
    },
    member_strings: new Set(),
    api_candidates: [],
    banned: [],
    must_use_hits: [],
    must_use_misses: [],
  };

  if (!babelParser || !traverse) {
    res.errors.push({
      code: "missing_deps",
      message: "Missing validator deps. Please install: @babel/parser @babel/traverse",
    });
    return res;
  }

  let ast;
  try {
    ast = babelParser.parse(code, {
      sourceType: "unambiguous",
      allowReturnOutsideFunction: true,
      errorRecovery: false,
      plugins: [
        "typescript",
        "jsx",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        "objectRestSpread",
        "topLevelAwait",
        "optionalChaining",
        "nullishCoalescingOperator",
      ],
    });
  } catch (e) {
    res.errors.push({
      code: "parse_error",
      message: String(e && e.message ? e.message : e),
    });
    return res;
  }

  res.parse_ok = true;

  function objectHasSceneProp(objExpr) {
    if (!objExpr || objExpr.type !== "ObjectExpression") return false;
    for (const prop of objExpr.properties || []) {
      if (prop.type !== "ObjectProperty" || prop.computed) continue;
      const key = prop.key;
      if (key && key.type === "Identifier" && key.name === "scene") return true;
      if (key && key.type === "StringLiteral" && key.value === "scene") return true;
    }
    return false;
  }

  function recordCandidate(symbolId, raw, loc) {
    if (!symbolId || typeof symbolId !== "string") return;
    res.api_candidates.push({ symbol_id: symbolId, raw, loc: locToObj(loc) });
  }

  traverse(ast, {
    MemberExpression(path) {
      const parts = memberExprToParts(path.node);
      if (!parts) return;
      const s = partsToString(parts);
      res.member_strings.add(s);

      // Likely constant usage like Phaser.Input.Events.GAMEOBJECT_DRAG
      if (parts[0] === "Phaser" && parts.length >= 3 && isAllCapsToken(parts[parts.length - 1])) {
        recordCandidate(s, s, path.node.loc);
      }
    },
    NewExpression(path) {
      const callee = path.node.callee;
      if (callee && callee.type === "MemberExpression") {
        const parts = memberExprToParts(callee);
        if (parts && parts[0] === "Phaser") {
          const s = partsToString(parts);
          // class existence check (e.g., Phaser.Game)
          recordCandidate(s, `new ${s}`, path.node.loc);

          if (s === "Phaser.Game") {
            res.signals.has_new_phaser_game = true;
            const arg0 = path.node.arguments && path.node.arguments[0];
            if (objectHasSceneProp(arg0)) {
              res.signals.has_scene_in_config = true;
            } else if (arg0 && arg0.type === "Identifier") {
              // Handle common pattern: const config = {...}; new Phaser.Game(config)
              const binding = path.scope && path.scope.getBinding ? path.scope.getBinding(arg0.name) : null;
              const bPath = binding && binding.path ? binding.path : null;
              const bNode = bPath && bPath.node ? bPath.node : null;
              if (bNode && bNode.type === "VariableDeclarator") {
                if (objectHasSceneProp(bNode.init)) {
                  res.signals.has_scene_in_config = true;
                }
              }
            }
          }
        }
      }

      // new Function(...)
      if (callee && callee.type === "Identifier" && callee.name === "Function") {
        res.banned.push({ code: "new_function", message: "new Function is banned", loc: locToObj(path.node.loc) });
      }
    },
    CallExpression(path) {
      const callee = path.node.callee;

      // require("fs") / import("fs")
      if (callee && callee.type === "Identifier" && callee.name === "require") {
        const arg0 = path.node.arguments && path.node.arguments[0];
        if (arg0 && arg0.type === "StringLiteral" && BANNED_MODULES.has(arg0.value)) {
          res.banned.push({
            code: "banned_require",
            message: `require('${arg0.value}') is banned`,
            loc: locToObj(path.node.loc),
          });
        }
      }

      if (callee && callee.type === "Import") {
        const arg0 = path.node.arguments && path.node.arguments[0];
        if (arg0 && arg0.type === "StringLiteral" && BANNED_MODULES.has(arg0.value)) {
          res.banned.push({
            code: "banned_import",
            message: `import('${arg0.value}') is banned`,
            loc: locToObj(path.node.loc),
          });
        }
      }

      // eval(...)
      if (callee && callee.type === "Identifier" && callee.name === "eval") {
        res.banned.push({ code: "eval", message: "eval is banned", loc: locToObj(path.node.loc) });
      }

      // Candidate API calls
      if (callee && callee.type === "MemberExpression") {
        const parts = memberExprToParts(callee);
        if (parts && parts.length >= 2) {
          if (parts[0] === "Phaser") {
            // Treat as namespace function or const-like access; prefer the full chain.
            recordCandidate(partsToString(parts), partsToString(parts), path.node.loc);
          } else if (parts[0] === "this") {
            const symbolId = mapThisCallToSymbolId(parts);
            if (symbolId) recordCandidate(symbolId, partsToString(parts), path.node.loc);
          }
        }
      }
    },
    ImportDeclaration(path) {
      const src = path.node.source && path.node.source.value;
      if (typeof src === "string" && BANNED_MODULES.has(src)) {
        res.banned.push({
          code: "banned_import_decl",
          message: `import from '${src}' is banned`,
          loc: locToObj(path.node.loc),
        });
      }
    },
    ClassMethod(path) {
      const key = path.node.key;
      if (key && key.type === "Identifier") {
        if (key.name === "preload") res.signals.has_preload = true;
        if (key.name === "create") res.signals.has_create = true;
        if (key.name === "update") res.signals.has_update = true;
      }
    },
    ObjectMethod(path) {
      const key = path.node.key;
      if (key && key.type === "Identifier") {
        if (key.name === "preload") res.signals.has_preload = true;
        if (key.name === "create") res.signals.has_create = true;
        if (key.name === "update") res.signals.has_update = true;
      }
    },
    ObjectProperty(path) {
      const key = path.node.key;
      if (path.node.computed) return;
      if (key && key.type === "Identifier") {
        if (key.name === "preload") res.signals.has_preload = true;
        if (key.name === "create") res.signals.has_create = true;
        if (key.name === "update") res.signals.has_update = true;
      }
    },
  });

  // Must-use APIs (best-effort)
  const codeText = code || "";
  for (const must of mustUseApis) {
    if (typeof must !== "string" || !must.trim()) continue;
    const m = must.trim();
    if (res.member_strings.has(m) || codeText.includes(m)) res.must_use_hits.push(m);
    else res.must_use_misses.push(m);
  }

  return res;
}

module.exports = { parseAndCheck };
