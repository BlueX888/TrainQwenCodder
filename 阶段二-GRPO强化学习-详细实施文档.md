# 阶段二：GRPO 强化学习（详细实施文档）

> 适用范围：`Qwen2.5-Coder-0.5B 基于 GRPO 的 Phaser3 代码生成强化训练方案` 的 **2.4 阶段二：GRPO 强化学习**  
> 本文目标：把“GRPO 训练闭环（采样→奖励→组内标准化→更新→评估）”拆成可执行的工程任务、数据结构、奖励实现细则与验收标准。

---

## 0. 本阶段产出（DoD）

阶段二结束时应具备以下可交付物（建议全部可复现构建）：

1) **GRPO 训练工程与配置**  
   - 训练入口脚本/配置（VeRL/自研均可，但需固定接口与参数）  
   - 可复现实验：版本、随机种子、Prompt 集合、奖励版本号全部记录

2) **奖励模块（可独立跑）**  
   - 输入：`prompt + (plan, code)`  
   - 输出：结构化 reward 明细（plan/code 子项、门控、归一化、最终总分）  
   - 可批处理、可缓存、可并行（CPU 侧为主）

3) **Rollout 数据与日志（可回放）**  
   - 每步训练保存：prompt、生成文本、logprobs（或可重算信息）、reward 明细、advantage  
   - 便于排查 reward hacking / 规则误杀

4) **模型产物**  
   - 最终 GRPO 模型权重 + 训练过程 checkpoint  
   - 最佳 checkpoint 的评估报告（按模块/难度/指标分层）

> 参考实现：仓库内提供了可运行的“奖励模块 + rollout 数据”最小实现，见 `stage2/README.md`。

---

## 1. 前置依赖（阶段零/一输出）

开始阶段二前，需确认：

- SFT 基础模型已产出（阶段一结束产物）  
- Prompt 集合可用：训练 prompts（建议 1500~2000）、评估 prompts（建议固定 300）  
- Phaser3 API 索引：`stage0/data/api_index/phaser_api.jsonl`  
- 验证器可用：`stage0/validator/src/cli.js`（至少 AST；ESLint/HEADLESS 逐步启用）

> 强建议：先用阶段一的验证集跑一次“只推理不训练”的 reward 统计，确认奖励分布与误杀率再开始训练。

---

## 2. 目录与数据约定（建议）

建议新增 GRPO 专用目录，做到“训练/奖励/评估”数据不混：

```text
stage2/
├─ data/
│  └─ grpo/
│     ├─ prompts_train.jsonl            # 训练 prompt（可从 prompt_seeds 采样/分层抽样得到）
│     ├─ prompts_eval.jsonl             # 固定评估 prompt（全程不变）
│     ├─ rollouts/                      # rollout 记录（按 step/时间分桶）
│     ├─ rewards/                       # reward 结果缓存（按 code_hash / prompt_id）
│     └─ reports/                       # 训练曲线、分层指标、误杀抽检
└─ configs/
   └─ grpo_config_example.yaml
```

rollout（建议 JSONL）最小字段：

```json
{
  "step": 1200,
  "prompt_id": "seed_000123",
  "group_id": 3,
  "text": "plan:\\n{...}\\ncode:\\n...",
  "plan": {...},
  "code": "...js...",
  "logprobs": null,
  "reward": {"total": 0.73, "plan": {...}, "code": {...}, "gates": {...}},
  "advantage": 0.41,
  "meta": {"temperature": 0.7, "top_p": 0.9, "max_tokens": 1800}
}
```

---

## 3. GRPO 算法实现要点（组内相对比较）

### 3.1 采样与组内标准化

对每个训练 prompt `x`：

1) 从当前策略模型 `πθ` 采样生成 `G` 个输出 `{y1..yG}`（建议 `G=8`）  
2) 计算每个输出的奖励 `ri = R(x, yi)`  
3) 组内标准化（无 critic）：

```text
μ = mean(r1..rG)
σ = std(r1..rG)
Ai = (ri - μ) / (σ + ε)
```

其中 `ε` 建议 `1e-6`，避免除零；当 `σ` 极小（组内全相同）时，可令 `Ai=0`（避免噪声更新）。

### 3.2 目标函数（带 KL 约束）

建议采用“参考模型 KL 正则”稳定训练：

```text
L(θ) = E[ Ai * log πθ(yi|x) ] - β * KL(πθ || πref)
```

实现上常用 token-level KL 近似，或直接使用框架提供的 KL penalty。

> 关键：阶段二不引入 value/critic 网络，训练开销更低，更适合 0.5B 小模型。

### 3.3 采样参数建议

为兼顾探索与稳定：

- `temperature`: 0.6 ~ 0.9（训练中可随步数退火）  
- `top_p`: 0.9 ~ 0.95  
- `max_new_tokens`: 1200~2200（按 prompt 难度动态）  
- 强制输出格式：plan + code（与阶段一一致）

---

## 4. 奖励函数实现（可落地版本）

总奖励结构（与主文档一致）：

```text
R = 0.15 * R_plan + 0.85 * R_code
```

并带门控（gates）：

- 语法错误/AST 失败：`R_code = 0`（`R_plan` 不抬分）  
- 运行时崩溃：`R_code = min(R_code, 0.2)`（或直接置 0，按迭代策略）  
- plan 缺失/不合规：仅 `R_plan = 0`，不影响 `R_code`

### 4.1 结构化计划奖励（15%）

#### 4.1.1 输入解析

从输出中抽取：

- `plan`：优先解析 JSON；失败则视为不合规  
- `code`：去掉围栏与多余文本后，保存纯 JS

#### 4.1.2 R_plan 计算（0~1）

1) **结构完整性（30%）**  
   - 必含字段：`requirements / apis / steps`  
   - `steps` 长度：easy ≥2；medium/hard ≥3  
   - 通过则给满分，否则按缺失比例线性扣分

2) **需求-API 一致性（20%）**  
   - `plan.apis` 必须能在 `data/api_index/phaser_api.jsonl` 中命中（存在性）  
   - `plan.requirements` 与 `plan.apis` 做简单关键词对齐（例如包含 input/drag/jump 等标签词）  
   - 不做复杂语义模型，先用可解释规则（便于迭代）

3) **计划-代码一致性（50%）**  
   - 正向一致性：`plan.apis` 中的关键 API 必须在代码 AST 命中（或字符串命中）  
   - 逆向一致性：代码中核心 API（可由 AST 提取 topN）应在 `plan.apis` 出现  
   - steps 映射：若 steps 提及 `preload/create/update`，代码需包含对应生命周期

> 说明：R_plan 的核心作用是“对齐与一致性”，用于抑制 reward hacking（说一套做一套）；推理阶段可关闭 plan 输出。

### 4.2 代码奖励（85%）

#### 4.2.1 统一信号来源

建议代码奖励主要由验证器输出驱动（阶段零已提供 `validator/src/cli.js`）：

- AST：结构完整性、API 命中、must-use 命中、危险用法  
- ESLint：基础规范、明显错误  
- HEADLESS：是否崩溃、是否创建 Game、运行耗时

建议训练时以 CLI 形式调用（可做进程池并行），输入 prompt 的 `must_use_apis`：

```bash
node stage0/validator/src/cli.js \
  --code-file /abs/path/to/generated.js \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --prompt-json '{"must_use_apis":["..."]}' \
  --timeout-ms 1500 \
  --frames 60
```

#### 4.2.2 R_code 分项（0~1）

按主文档权重拆分（建议实现为可配置）：

1) **功能完整性（30%）**  
   - 最小可落地版：使用 `must_use` 命中 + 生命周期信号 + 关键结构信号作为代理  
   - 加强版：为高频任务建立 AST 规则库（由 `eval_hints/tags` 映射）  

2) **API 准确率（25%）**  
   - `api_usage.misses == 0` 给满分  
   - 有 misses 则按比例扣分：`1 - min(1, misses / (hits+misses+1))`

3) **运行时正确性（20%）**  
   - `runtime_ok=true` 给满分  
   - 崩溃：按门控（cap 到 0.2 或置 0）  
   - 运行耗时可作为轻微惩罚项（防止极慢代码）

4) **代码质量（15%）**  
   - ESLint error 一票否决（或大幅扣分）  
   - warning 按数量轻扣（避免过度风格化）

5) **格式规范（10%）**  
   - 必须包含 `plan:` 与 `code:` 分段（训练期强制）  
   - code 不能包含 markdown fenced code  
   - code 必须包含 `new Phaser.Game(config)` + scene 生命周期（按难度要求）

### 4.3 Reward Hacking 防御（实现细则）

建议加入以下“可解释”防御项（可开关）：

- **长度约束**：按难度设置 `min_lines` / `max_lines`，过短视为空壳，过长视为注水  
- **有效代码行占比**：注释/空行占比过高扣分（例如有效行 < 70%）  
- **API 数量下限**：按难度设置最少 API 命中数（避免只写配置/空 Scene）  
- **相似度惩罚**：对同一 prompt 的候选做归一化 hash/相似度，过相似扣分（鼓励探索）

---

## 5. KL 散度控制（β 自适应）

建议设置目标 KL（按模型大小与数据难度调整）：

- `target_kl`: 0.05 ~ 0.15（token-level 平均）

β 更新策略（示例，可用更稳健的分段更新）：

```text
if KL > 1.5 * target_kl: β *= 1.5
elif KL < 0.5 * target_kl: β /= 1.5
β = clip(β, β_min, β_max)
```

验收目标：

- KL 训练过程中稳定在目标区间附近  
- 不出现“模式崩坏”（大量输出空壳/重复/不含 Phaser 结构）

---

## 6. 训练流程（工程实现拆解）

### 6.1 单步训练闭环（伪代码）

```text
for step in 1..T:
  sample a batch of prompts x
  for each x:
    generate G outputs y1..yG from πθ
    compute rewards r1..rG via validator + plan checks
    compute advantages A1..AG via group normalization
  update θ with GRPO objective + KL penalty
  periodically evaluate on prompts_eval
  checkpoint and write reports
```

### 6.2 并行化建议（高收益）

奖励计算/运行时验证是瓶颈，建议：

- rollout 生成（GPU）与 reward 计算（CPU/多进程）解耦  
- reward 缓存：按 `(prompt_id, code_hash, reward_version)` 缓存，避免重复跑 validator  
- HEADLESS 可做“分层启用”：训练早期只 AST/Lint；中后期逐步启用 runtime（提升信号质量）

### 6.3 关键超参建议（起步值）

仅作为起步配置，需结合算力与 reward 稳定性调参：

- `G=8`  
- `batch_prompts_per_step`: 8~32  
- `lr`: 1e-6 ~ 5e-6（RL 通常比 SFT 更小）  
- `max_grad_norm`: 1.0  
- `β_init`: 0.02 ~ 0.08（配合 target_kl 调整）  

---

## 7. 训练中评估与回归（必做）

固定评估集（建议 300 条，含 20% OOD）每 N steps 跑一次：

- Pass@1 / Pass@8（用 validator 的门控信号近似也可先跑）  
- API 命中率（miss 率）  
- HEADLESS 崩溃率  
- 结构完整率（Game/Scene/lifecycle）

要求：

- 评估集严格冻结，不参与训练  
- 指标按模块/难度分层输出（便于定位退化点）

---

## 8. 安全与隔离（执行不可信代码）

阶段二会大量执行模型生成代码，必须按“不可信”处理：

- 子进程隔离 + 超时杀进程（validator 已内置）  
- 禁止敏感模块（`fs/net/http/...`）与 `eval/new Function`  
- 建议容器化：禁网、只读文件系统、限制 CPU/内存/进程数（生产训练强烈建议）

---

## 9. 验收标准（阶段二完成条件）

在固定评估集上相对 SFT-only 基线达到：

- Pass@1 提升（目标：≥ +3~8pt，具体以基线为准）  
- API miss 率下降（目标：≥ -30% 相对下降）  
- HEADLESS 崩溃率不升反降（目标：≤ SFT-only）  
- 输出格式稳定：plan+code 合规率 ≥ 95%（训练期）

并且：

- reward 分布稳定，无明显 reward hacking（空壳/注水/重复）  
- KL 受控，无模式崩坏
