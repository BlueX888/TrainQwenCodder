# Stage 1：SFT 冷启动（实现）

本目录实现 `阶段一-SFT冷启动-详细实施文档.md` 中的最小可用流水线：

- 生成蒸馏请求（带 API 检索注入）
- 解析教师输出（plan/code 分段）
- 调用 `stage0/validator` 做过滤（AST/ESLint/可选 HEADLESS）
- 挑选每条 prompt 的最佳样本并构建 SFT 数据集

## 依赖

- Python 3.10+
- Node.js（用于调用 `stage0/validator`）
- 已完成阶段零产物：
  - `stage0/data/prompt_seeds/prompt_seeds.jsonl`
  - `stage0/data/api_index/phaser_api.jsonl`

## 1) 生成蒸馏请求

```bash
python stage1/scripts/build_distill_requests.py \
  --prompt-seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --out stage1/data/sft_distill/requests.jsonl \
  --variants 3 \
  --top-k 20
```

## 2)（可选）用 mock teacher 产出 raw_outputs

```bash
python stage1/scripts/run_teacher_mock.py \
  --requests stage1/data/sft_distill/requests.jsonl \
  --out stage1/data/sft_distill/raw_outputs.jsonl
```

## 3) 解析 raw_outputs → candidates

```bash
python stage1/scripts/parse_teacher_outputs.py \
  --requests stage1/data/sft_distill/requests.jsonl \
  --raw-outputs stage1/data/sft_distill/raw_outputs.jsonl \
  --out stage1/data/sft_distill/candidates.jsonl
```

## 4) 运行 validator 过滤

```bash
python stage1/scripts/run_validator_filter.py \
  --candidates stage1/data/sft_distill/candidates.jsonl \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --validator-cli stage0/validator/src/cli.js \
  --out stage1/data/sft_distill/validated.jsonl \
  --skip-runtime
```

## 5) 选优并构建 SFT 数据集

```bash
python stage1/scripts/select_best.py \
  --validated stage1/data/sft_distill/validated.jsonl \
  --out stage1/data/sft_distill/selected.jsonl

python stage1/scripts/build_sft_dataset.py \
  --selected stage1/data/sft_distill/selected.jsonl \
  --out-dir stage1/data/sft_dataset \
  --seed 42
```

