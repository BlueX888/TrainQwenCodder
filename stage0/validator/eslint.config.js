// validator 的 ESLint 规则配置（聚焦安全与明显错误）。
/**
 * Minimal ESLint flat config for validating generated Phaser code.
 * Keep it intentionally lightweight: avoid style wars, focus on safety/obvious bugs.
 */

module.exports = [
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Phaser: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-with": "error",
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
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
            "worker_threads"
          ]
        }
      ]
    },
  },
];
