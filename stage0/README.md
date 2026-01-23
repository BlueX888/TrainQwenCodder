# TrainQwenCodder（Phaser3 代码能力训练）

当前仓库为“阶段零：基础设施准备”的最小可用实现，核心目标是提供：

- Phaser3 API 索引（用于 Prompt 注入与 API 校验）
- Prompt 种子库生成（≥2000 条 JSONL）
- 代码验证器（ESLint + Babel AST + 可选 HEADLESS 运行）

## 快速开始（阶段零）

1) 构建 Phaser3 API 索引（需要本机可访问 `phaser.d.ts`）

```bash
node scripts/build_api_index.js \
  --dts node_modules/phaser/types/phaser.d.ts \
  --out data/api_index/phaser_api.jsonl \
  --meta data/api_index/meta.json \
  --phaser-version <LOCKED_VERSION>
```

2) 生成 Prompt 种子库（默认 2000 条）

```bash
python scripts/build_prompt_seeds.py
```

3) 安装并运行 validator（可选 runtime/ESLint）

```bash
cd validator
npm i
node src/cli.js --code-file /abs/path/to/generated.js --api-index ../data/api_index/phaser_api.jsonl --skip-runtime
```

更多细节见：`阶段零-基础设施准备-详细实施文档.md`。

