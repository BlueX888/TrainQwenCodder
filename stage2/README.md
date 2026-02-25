# 阶段二：基于 VeRL 的 GRPO 强化学习

> 在阶段一 SFT 冷启动基础上，通过 GRPO（Group Relative Policy Optimization）强化学习进一步提升 Qwen2.5-Coder-0.5B 的 Phaser3 代码生成能力。

## 目录结构

```
stage2/
├── scripts/
│   ├── common.py              # 公共工具（JSONL I/O、缓存、路径）
│   ├── parse_output.py        # 解析模型输出 [PLAN] + code
│   ├── validator_pool.py      # Node.js 验证器进程池 + 缓存
│   ├── reward_phaser.py       # VeRL 自定义奖励函数
│   ├── prepare_data.py        # prompt seeds → VeRL parquet
│   ├── run_grpo.sh            # 训练启动脚本
│   ├── evaluate.py            # 固定评估集评估
│   └── rollout_logger.py      # Rollout 日志记录器
├── configs/
│   └── grpo_qwen05b.yaml      # VeRL GRPO 参考配置
└── data/grpo/
    ├── train.parquet           # 训练 prompts（~1700 条）
    ├── eval.parquet            # 评估 prompts（300 条，冻结）
    ├── rollouts/               # Rollout 日志（按 step 分桶）
    ├── rewards/                # 验证器结果缓存
    └── reports/                # 评估报告
```

## 前置依赖

- **阶段一产物**：SFT 微调后的模型 checkpoint（`model/sft_checkpoint`）
- **阶段零基础设施**：
  - Phaser3 API 索引：`stage0/data/api_index/phaser_api.jsonl`
  - Prompt 种子库：`stage0/data/prompt_seeds/prompt_seeds.jsonl`
  - 代码验证器：`stage0/validator/src/cli.js`（需 `npm install`）
- **环境**：
  - Python ≥ 3.9，PyTorch，transformers
  - VeRL：`pip install verl`（需 vLLM、Ray）
  - Node.js ≥ 16（验证器运行时）
  - pandas、pyarrow（数据转换）

## 快速开始

### 1. 准备数据

将 prompt seeds 转换为 VeRL 所需的 Parquet 格式：

```bash
python stage2/scripts/prepare_data.py \
    --seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
    --out-dir stage2/data/grpo \
    --eval-count 300 \
    --seed 42
```

产出 `train.parquet`（~1700 条）和 `eval.parquet`（300 条），按难度分层抽样。

### 2. 验证奖励函数

训练前建议先跑一次奖励分布检查：

```python
from stage2.scripts.reward_phaser import compute_score, compute_score_detailed

score = compute_score(
    data_source="phaser3_grpo",
    solution_str="[PLAN]\nREQ: ...\n[/PLAN]\n```javascript\n...\n```",
    ground_truth={"difficulty": "easy", "must_use_apis": ["Phaser.GameObjects.Graphics"]},
)
print(f"Reward: {score}")

# 查看完整明细
detail = compute_score_detailed("phaser3_grpo", solution_str, ground_truth)
```

### 3. 启动 GRPO 训练

```bash
# 基本用法（使用默认超参数）
bash stage2/scripts/run_grpo.sh

# 自定义参数
MODEL_PATH=./model/sft_checkpoint \
GROUP_SIZE=8 \
TRAIN_BATCH_SIZE=16 \
LR=3e-6 \
TOTAL_EPOCHS=15 \
bash stage2/scripts/run_grpo.sh
```

环境变量控制验证器行为：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `GRPO_VALIDATOR_WORKERS` | 8 | 验证器并行进程数 |
| `GRPO_SKIP_RUNTIME` | 1 | 跳过运行时验证（训练期建议开启） |
| `GRPO_SKIP_ESLINT` | 0 | 跳过 ESLint 检查 |

### 4. 评估模型

```bash
python stage2/scripts/evaluate.py \
    --model path/to/grpo_checkpoint \
    --eval-data stage2/data/grpo/eval.parquet \
    --passes 1,8 \
    --temperature 0.2 \
    --workers 8
```

输出 `eval_report.json`（指标汇总）和 `eval_details.jsonl`（逐条明细）。

## 奖励函数设计

总奖励：**R = 0.15 × R_plan + 0.85 × R_code − penalty**

### R_plan（15%）

| 子项 | 权重 | 说明 |
|------|------|------|
| 结构完整性 | 30% | `[PLAN]` 中含 REQ / API / STEPS |
| 需求-API 一致性 | 20% | plan.apis 在 API 索引中命中 |
| 计划-代码一致性 | 50% | plan.apis ↔ 代码 AST 命中对齐 |

### R_code（85%）

| 子项 | 权重 | 说明 |
|------|------|------|
| 功能完整性 | 30% | must_use 命中 + 生命周期信号 |
| API 准确率 | 25% | api_usage.misses == 0 → 满分 |
| 运行时正确性 | 20% | runtime_ok → 满分（skip 时给 0.5） |
| 代码质量 | 15% | ESLint error/warning 扣分 |
| 格式规范 | 10% | Phaser.Game + scene + create |

### 门控

- **parse 失败** → R_code = 0
- **runtime crash** → R_code ≤ 0.2
- **plan 缺失** → R_plan = 0

### Hacking 防御

按难度设置长度约束、有效代码行占比下限、API 命中数下限，总罚分上限 0.5。

## GRPO 关键配置

```yaml
algorithm:
  adv_estimator: grpo         # 非 PPO
  use_kl_in_reward: false     # KL 在 loss 中

actor_rollout_ref:
  actor:
    use_kl_loss: true         # GRPO 必需
    kl_loss_coef: 0.01
    lr: 3e-6
  rollout:
    n: 8                      # G=8 组采样
    temperature: 0.7

trainer:
  n_gpus_per_node: 1          # 0.5B 单卡
  total_epochs: 15
```

完整配置见 `configs/grpo_qwen05b.yaml`。

## 验收标准

在固定 300 条评估集上，相对 SFT-only 基线：

- Pass@1 提升 ≥ +3~8pt
- API miss 率相对下降 ≥ 30%
- HEADLESS 崩溃率不升反降
- plan+code 格式合规率 ≥ 95%
- reward 分布稳定，无 reward hacking
- KL 受控，无模式崩坏
