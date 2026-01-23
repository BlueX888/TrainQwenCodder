# Stage 3：评估（实现）

本目录实现 `阶段三-评估-详细实施文档.md` 中的最小可用评估 harness：

- 固定评估集构建（`prompts_eval_300.jsonl` + `prompts_human_200.jsonl`）
- 读取模型生成结果（Pass@1 / Pass@8），抽取 plan/code
- 调用 `stage0/validator`（AST/ESLint/可选 HEADLESS），并缓存 validator 结果
- 产出评估报告：`summary.json` / `breakdown.csv` / `failures_topn.json`

> 说明：本仓库不集成真实模型推理（Base/SFT/GRPO）调用；你可以把任何模型的生成结果落成 JSONL 后交给本 harness 统计。

## 依赖

- Python 3.10+
- Node.js（用于调用 `stage0/validator`）
- 阶段零产物：
  - `stage0/data/prompt_seeds/prompt_seeds.jsonl`
  - `stage0/data/api_index/phaser_api.jsonl`
  - `stage0/validator/src/cli.js`

## 1) 构建固定评估集（示例：50 条）

```bash
python stage3/scripts/build_eval_set.py \
  --prompt-seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
  --out-eval stage3/data/eval/prompts_eval_300.jsonl \
  --out-human stage3/data/eval/prompts_human_200.jsonl \
  --eval-count 50 \
  --human-count 20 \
  --seed 42
```

## 2)（可选）生成 mock generations（便于先跑通评估闭环）

```bash
python stage3/scripts/generate_mock_generations.py \
  --prompts stage3/data/eval/prompts_eval_300.jsonl \
  --out-dir stage3/data/eval/generations/mock_model \
  --k 8 \
  --seed 2026
```

产物：

- `stage3/data/eval/generations/mock_model/gen_pass1.jsonl`
- `stage3/data/eval/generations/mock_model/gen_pass8.jsonl`

## 3) 运行评估（对单个模型）

```bash
python stage3/scripts/evaluate_generations.py \
  --prompts stage3/data/eval/prompts_eval_300.jsonl \
  --gen-pass1 stage3/data/eval/generations/mock_model/gen_pass1.jsonl \
  --gen-pass8 stage3/data/eval/generations/mock_model/gen_pass8.jsonl \
  --model-name mock_model \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --validator-cli stage0/validator/src/cli.js \
  --out-dir stage3/data/eval/reports/mock_model \
  --skip-runtime
```

主要输出：

- `stage3/data/eval/reports/mock_model/summary.json`
- `stage3/data/eval/reports/mock_model/breakdown.csv`
- `stage3/data/eval/reports/mock_model/failures_topn.json`

