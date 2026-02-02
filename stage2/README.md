# Stage 2：GRPO 强化学习（实现：奖励模块 + Rollout 数据）

本目录提供一个**可运行的最小实现**，用于阶段二的两件事：

1) **Rollout 数据格式**（prompt → 采样 G 组输出）  
2) **奖励计算与 advantage（组内标准化）**：调用 `stage0/validator` 产出结构化 reward 明细，并按 prompt 维度计算 GRPO advantage

> 说明：本仓库**不内置**真实的“策略更新/训练器”（如 VeRL/LLaMA-Factory RL）。你可以用任意框架生成 rollout JSONL，再用本目录脚本做 reward+advantage，产出的 JSONL 可直接喂给你的训练器或用于回放分析。

## 依赖

- Python 3.9+（建议 3.10+）
- Node.js（用于调用 `stage0/validator/src/cli.js`）
- 阶段零产物：
  - `stage0/data/api_index/phaser_api.jsonl`
  - `stage0/validator/src/cli.js`

## 数据约定（rollouts.jsonl）

每行一个候选样本（同一 prompt 有 `group_size=G` 行）：

```json
{
  "step": 1200,
  "prompt_id": "seed_000123",
  "group_id": 3,
  "text": "[PLAN]...[/PLAN]\\n```javascript\\n...\\n```",
  "meta": {"temperature": 0.7, "top_p": 0.9, "max_new_tokens": 1800}
}
```

脚本会把 `text` 解析为 `plan/code`，调用 validator，追加：

- `validation`：validator 结构化输出
- `reward`：reward 明细（含 plan/code 子项与门控）
- `advantage`：按 prompt 分组的 `(r-mean)/std`

## 1) 构建 prompts_train / prompts_eval（示例：小规模）

```bash
python3 stage2/scripts/build_grpo_sets.py \
  --prompt-seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
  --out-train stage2/data/grpo/prompts_train.jsonl \
  --out-eval stage2/data/grpo/prompts_eval.jsonl \
  --train-count 50 \
  --eval-count 20 \
  --seed 42
```

## 2)（可选）生成 mock rollouts（用于先跑通闭环）

```bash
python3 stage2/scripts/generate_mock_rollouts.py \
  --prompts stage2/data/grpo/prompts_train.jsonl \
  --out stage2/data/grpo/rollouts/mock_step0001.jsonl \
  --step 1 \
  --num-prompts 8 \
  --group-size 8 \
  --seed 2026
```

## 3) 计算奖励与 advantage（推荐先跳过 runtime）

```bash
python3 stage2/scripts/score_rollouts.py \
  --prompts stage2/data/grpo/prompts_train.jsonl \
  --rollouts stage2/data/grpo/rollouts/mock_step0001.jsonl \
  --out stage2/data/grpo/rewards/mock_step0001_scored.jsonl \
  --cache stage2/data/grpo/rewards/validator_cache.jsonl \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --validator-cli stage0/validator/src/cli.js \
  --skip-runtime
```

输出示例：

- `stage2/data/grpo/rewards/mock_step0001_scored.jsonl`
- `stage2/data/grpo/reports/mock_step0001_report.json`

## 4) 接入你的“真实 GRPO 训练器”（建议做法）

1) 用你的 SFT 模型对 `prompts_train.jsonl` 采样生成 `G` 条输出（每个 prompt 一组），落成 `rollouts_*.jsonl`  
2) 运行 `score_rollouts.py` 得到带 `reward.total` + `advantage` 的 JSONL  
3) 在训练器里使用 `advantage` 做 GRPO 更新（并可用 `reward.gates/*` 做过滤或权重）

