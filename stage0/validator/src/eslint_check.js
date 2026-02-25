// 运行 ESLint 规则，对生成代码做轻量安全/错误检查。
const path = require("path");

function requireOptional(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

async function runEslint(code, filePath) {
  const eslintMod = requireOptional("eslint");
  if (!eslintMod || !eslintMod.ESLint) {
    return {
      ok: false,
      error_count: 1,
      warning_count: 0,
      messages: [
        {
          ruleId: "missing_deps",
          message: "Missing validator dep: eslint (run `npm i` inside validator/)",
        },
      ],
    };
  }

  const { ESLint } = eslintMod;
  const validatorRoot = path.resolve(__dirname, "..");
  const configPath = path.join(validatorRoot, "eslint.config.js");

  try {
    const eslint = new ESLint({
      cwd: validatorRoot,
      overrideConfigFile: configPath,
    });
    // NOTE: ESLint flat config can ignore files outside cwd ("outside of base path").
    // We lint the provided code string and force a virtual file path under validatorRoot.
    const virtualPath = path.join(validatorRoot, "__generated__.js");
    const results = await eslint.lintText(code, { filePath: virtualPath });
    const errorCount = results.reduce((s, r) => s + (r.errorCount || 0), 0);
    const warningCount = results.reduce((s, r) => s + (r.warningCount || 0), 0);
    const messages = [];
    for (const r of results) {
      for (const m of r.messages || []) {
        messages.push({
          ruleId: m.ruleId || "",
          message: m.message || "",
          severity: m.severity || 0,
          line: m.line || 0,
          column: m.column || 0,
        });
      }
    }
    return { ok: errorCount === 0, error_count: errorCount, warning_count: warningCount, messages };
  } catch (e) {
    return {
      ok: false,
      error_count: 1,
      warning_count: 0,
      messages: [
        {
          ruleId: "eslint_failed",
          message: String(e && e.message ? e.message : e),
        },
      ],
    };
  }
}

module.exports = { runEslint };
