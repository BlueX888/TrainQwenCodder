# Stage 2：GRPO 强化学习（实现）

本目录实现 `阶段二-GRPO强化学习-详细实施文档.md` 中“奖励模块 + rollout 数据”部分的最小可用版本：

- 训练/评估 prompt 集构建（从 `stage0/data/prompt_seeds` 分层抽样）
- Reward 计算（plan 15% + code 85%，含门控/gates）
- GRPO 组内标准化计算 advantage（μ/σ）
- Rollout JSONL 落盘（可回放）

> 说明：真正的策略更新（GRPO 优化、KL 约束）需要对接 RL 框架（例如 VeRL）。本目录提供可直接复用的 reward/rollout 接口与数据结构，便于后续接入。

## 依赖

- Python 3.10+
- Node.js（用于调用 `stage0/validator`）
- 阶段零产物：
  - `stage0/data/api_index/phaser_api.jsonl`
  - `stage0/data/prompt_seeds/prompt_seeds.jsonl`
  - `stage0/validator/src/cli.js`

## 1) 构建 prompts_train / prompts_eval

```bash
python stage2/scripts/build_grpo_prompts.py \
  --prompt-seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
  --out-train stage2/data/grpo/prompts_train.jsonl \
  --out-eval stage2/data/grpo/prompts_eval.jsonl \
  --train-count 200 \
  --eval-count 50 \
  --seed 42
```

## 2)（可选）生成 mock 输出（每条 prompt 生成 G=8 个）

```bash
python stage2/scripts/generate_mock_outputs.py \
  --prompts stage2/data/grpo/prompts_train.jsonl \
  --out stage2/data/grpo/mock_outputs.jsonl \
  --group-size 8 \
  --seed 2025
```

## 3) 计算 reward + advantage 并落盘 rollouts

```bash
python stage2/scripts/build_rollouts.py \
  --prompts stage2/data/grpo/prompts_train.jsonl \
  --outputs stage2/data/grpo/mock_outputs.jsonl \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --validator-cli stage0/validator/src/cli.js \
  --out stage2/data/grpo/rollouts/rollouts.jsonl \
  --group-size 8 \
  --skip-runtime
```

## 4) 统计报告

```bash
python stage2/scripts/report_rollouts.py \
  --rollouts stage2/data/grpo/rollouts/rollouts.jsonl
```

## 5) β 自适应（KL 控制）

```bash
python stage2/scripts/kl_beta_controller.py --beta 0.05 --kl 0.12 --target-kl 0.1
```
