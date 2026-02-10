<!-- validator 使用说明与运行方式。 -->
# validator/

用于对“模型生成的 Phaser3 代码”做静态/运行时验证并输出结构化 JSON。

## 安装

```bash
cd validator
npm i
```

> 运行时（HEADLESS）在 Node 环境可能需要额外依赖：`jsdom` / `canvas`（已放在 `optionalDependencies`）。

## 使用

```bash
node src/cli.js \
  --code-file /abs/path/to/generated.js \
  --api-index ../data/api_index/phaser_api.jsonl \
  --prompt-json '{"must_use_apis":["Phaser.Input.Events.POINTER_DOWN"]}' \
  --timeout-ms 1500 \
  --frames 60
```

常用开关：

- `--skip-eslint`：跳过 ESLint
- `--skip-runtime`：跳过运行时（HEADLESS）
