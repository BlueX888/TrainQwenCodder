# 阶段一：SFT 冷启动（详细实施文档）

> 适用范围：`Qwen2.5-Coder-0.5B 基于 GRPO 的 Phaser3 代码生成强化训练方案` 的 **2.3 阶段一：SFT 冷启动**
> 本文目标：把"教师蒸馏 → 六层过滤 → 数据整合 → SFT 微调"拆成可执行的工程任务、数据结构与验收标准。

---

## 0. 本阶段产出（DoD）

阶段一结束时应具备以下可交付物（建议全部可复现构建）：

1) **蒸馏原始数据（~6000 条）**
   - JSONL 格式，每条包含 `prompt_id / plan / code / teacher_model / timestamp`
   - 可追溯：保留教师模型原始输出与成本记录

2) **六层过滤后的候选数据（~3500 条）**
   - 每层过滤产出独立 JSONL + 过滤报告（通过/淘汰/原因分布）
   - 最终选定数据标注过滤层级与质量分数

3) **官方/开源补充数据（~1000 条）**
   - 格式与蒸馏数据一致
   - 标注来源（official_example / github / other）

4) **SFT 数据集（~4500 条）**
   - 划分为 train/val/test（建议 90/5/5）
   - 去重完成、多样性筛选完成
   - 格式符合 LLaMA-Factory 要求

5) **SFT 模型产物**
   - 微调后的模型权重 + 训练日志
   - 在验证集上的 loss 曲线与基础指标

---

## 1. 前置依赖检查

开始阶段一前，需确认阶段零产物可用：

| 产物 | 路径 | 验收条件 |
|------|------|----------|
| Phaser3 API 索引 | `stage0/data/api_index/phaser_api.jsonl` | 11,451 条 API 记录，可通过 `query_api.py` 检索 |
| Prompt 种子库 | `stage0/data/prompt_seeds/prompt_seeds.jsonl` | 2,000 条，难度分布 40/40/20 |
| 验证器 CLI | `stage0/validator/src/cli.js` | 可输出 `parse_ok/lint_ok/api_ok/runtime_ok` |
| API 检索接口 | `stage0/scripts/query_api.py` | BM25 检索，支持中英文关键词 |

前置检查脚本：

```bash
# 检查 API 索引
wc -l stage0/data/api_index/phaser_api.jsonl  # 应输出 11451

# 检查 Prompt 种子库
wc -l stage0/data/prompt_seeds/prompt_seeds.jsonl  # 应输出 2000

# 检查验证器
node stage0/validator/src/cli.js --help  # 应无报错

# 检查 API 检索
python stage0/scripts/query_api.py \
  --index stage0/data/api_index/phaser_api.jsonl \
  --text "拖拽精灵" \
  --top-k 5 --pretty
```

---

## 2. 目录与数据约定

### 2.1 目录结构

```text
stage1/
├─ configs/
│  └─ sft_config_example.yaml          # LLaMA-Factory SFT 配置模板
├─ data/
│  ├─ sft_distill/                     # 蒸馏数据
│  │  ├─ requests.jsonl                # 教师模型请求记录
│  │  ├─ raw_outputs.jsonl             # 教师模型原始输出
│  │  ├─ candidates.jsonl              # 解析后的候选数据
│  │  ├─ validated.jsonl               # L1-L4 过滤后
│  │  ├─ selected.jsonl                # L5 多样性筛选后
│  │  ├─ codes/                        # 提取的纯代码文件（用于 validator）
│  │  └─ validator_cache.jsonl         # validator 结果缓存
│  ├─ sft_official/                    # 官方示例/开源代码
│  │  ├─ official_examples.jsonl
│  │  ├─ github_collected.jsonl
│  │  └─ processed.jsonl
│  ├─ sft_dataset/                     # 最终 SFT 数据集
│  │  ├─ train.jsonl
│  │  ├─ val.jsonl
│  │  └─ test.jsonl
│  └─ reports/                         # 过滤与构建报告
│     ├─ distill_requests_report.json
│     ├─ filter_report.json
│     ├─ selection_report.json
│     └─ sft_dataset_report.json
├─ prompts/
│  └─ teacher_system_prompt.txt        # 教师模型系统提示词
└─ scripts/
   ├─ build_distill_requests.py        # 构建蒸馏请求
   ├─ run_teacher_distill.py           # 调用教师模型（或 run_teacher_mock.py 用于测试）
   ├─ parse_teacher_outputs.py         # 解析教师输出
   ├─ run_validator_filter.py          # L1-L4 过滤
   ├─ select_best.py                   # L5 多样性筛选
   ├─ collect_official.py              # 收集官方示例
   ├─ build_sft_dataset.py             # 构建最终数据集
   ├─ api_bm25.py                      # BM25 API 检索（复用 stage0）
   └─ common.py                        # 公共工具函数
```

### 2.2 核心数据格式

**蒸馏候选数据（candidates.jsonl）**：

```json
{
  "id": "distill_000001_v1",
  "prompt_id": "seed_000001",
  "version": 1,
  "prompt": {
    "id": "seed_000001",
    "difficulty": "easy",
    "modules": ["Scene", "GameObjects"],
    "task": "让一个圆形以每秒 80 度的速度持续旋转。",
    "constraints": [...],
    "must_use_apis": ["Phaser.GameObjects.Graphics"],
    "eval_hints": [...]
  },
  "teacher_model": "claude-3-5-sonnet-20241022",
  "plan": {
    "requirements": "实现一个持续旋转的圆形",
    "apis": ["Phaser.GameObjects.Graphics", "Phaser.Scene#update"],
    "steps": ["1. 在 create 中使用 Graphics 绘制圆形", "2. 在 update 中更新旋转"]
  },
  "code": "// Phaser3 代码...",
  "raw_output": "...",
  "timestamp": "2025-01-26T12:00:00Z",
  "api_context_injected": ["Phaser.GameObjects.Graphics#fillCircle", ...]
}
```

**SFT 数据集格式（train.jsonl，符合 LLaMA-Factory）**：

```json
{
  "instruction": "你是一个 Phaser3 游戏开发专家...",
  "input": "任务描述: 让一个圆形以每秒 80 度的速度持续旋转。\n约束:\n- 使用 Phaser3\n...",
  "output": "[PLAN]\nREQ: 实现持续旋转的圆形\nAPI: ...\nSTEPS:\n1. ...\n[/PLAN]\n\n```javascript\n// 代码...\n```"
}
```

---

## 3. 数据蒸馏流程

### 3.1 教师模型选择与配置

**选定教师模型**：

| 模型 | 优点 | 用途 |
|------|------|------|
| **Claude 4.5 Sonnet（选定）** | 代码质量高、格式稳定、Phaser3 知识丰富、推理能力强 | 主力蒸馏 |
| GPT-4o | 代码能力强、响应快 | 备选 |
| DeepSeek V3 | 成本低 | 成本敏感时备选 |

**配置参数**：

```yaml
teacher_model: claude-sonnet-4-5-20250514  # Claude 4.5 Sonnet
temperature: 0.7        # 生成多样性
top_p: 0.9
max_tokens: 2500        # 足够容纳 plan + code
versions_per_prompt: 3  # 每条 Prompt 生成 3 个版本
```

### 3.2 Prompt 构造（含 API 上下文注入）

**教师系统提示词**（`prompts/teacher_system_prompt.txt`）：

```text
你是一个 Phaser3 游戏开发专家，擅长编写高质量的 Phaser3 代码。

## 输出格式要求

请严格按照以下格式输出：

[PLAN]
REQ: <一句话需求摘要>
API: <API1>, <API2>, <API3>
STEPS:
1. <步骤1>
2. <步骤2>
3. <步骤3>
[/PLAN]

```javascript
// 完整的 Phaser3 代码
const config = {
  type: Phaser.HEADLESS,  // 或 Phaser.AUTO
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

function preload() { ... }
function create() { ... }
function update() { ... }

new Phaser.Game(config);
```

## 代码规范

1. 代码必须可独立运行（包含完整的 Game 配置与 Scene）
2. 优先使用 Graphics/内置形状，避免外部图片资源
3. 必须包含 preload/create 生命周期（按需包含 update）
4. API 使用必须准确，参数类型正确
5. 代码结构清晰，适当添加注释

## 相关 API 参考

{API_CONTEXT}
```

**API 上下文注入策略**：

1. 从 Prompt 的 `task` + `must_use_apis` + `tags` 提取关键词
2. 调用 `query_api.py` 检索 top-k 相关 API（建议 k=15-25）
3. 格式化 API 信息注入系统提示

### 3.3 输出格式约定（plan + code）

**Plan 格式**（固定前缀，宽松解析）：

```text
[PLAN]
REQ: <一句话需求摘要>
API: <API1>, <API2>, <API3>
STEPS:
1. <步骤1>
2. <步骤2>
3. <步骤3>
[/PLAN]
```

**解析规则**：

- 使用正则 `\[PLAN\](.*?)\[/PLAN\]` 提取 plan 块
- REQ/API/STEPS 按行解析，容忍格式瑕疵
- 代码块：提取 ` ```javascript...``` ` 或 ` ```js...``` `，去除围栏

### 3.4 批量调用与成本控制

| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| 并发数 | 5-10 | 避免触发 rate limit |
| 重试次数 | 3 | 带指数退避 |
| 批次大小 | 100 | 每批后保存检查点 |
| 单条超时 | 60s | 防止卡死 |

**成本估算**（以 Claude 3.5 Sonnet 为例）：

- 输入：~1500 tokens/条（含系统提示 + API 上下文）
- 输出：~1200 tokens/条
- 2000 prompts × 3 versions = 6000 次调用
- 估算：~$135

---

## 4. 六层过滤管线详细设计

### 4.1 过滤管线总览

```text
6000 条候选数据
    │
    ├─> L1: 语法与基础规范检查 ────────────> 淘汰 ~5%
    │   (parse_ok + lint_ok + 无危险用法)
    │
    ├─> L2: API 语义与领域知识验证 ─────────> 淘汰 ~10%
    │   (API 存在性 + must_use 命中)
    │
    ├─> L3: 运行时正确性验证 ──────────────> 淘汰 ~15%
    │   (HEADLESS 可运行 + 不崩溃)
    │
    ├─> L4: 功能匹配度验证 ───────────────> 淘汰 ~5%
    │   (结构完整性 + plan-code 一致性)
    │
    ├─> L5: 多样性与质量综合筛选 ──────────> 淘汰 ~10%
    │   (去重 + 每 prompt 选最佳 1-2 条)
    │
    └─> L6: 人工抽检与校准 ───────────────> 微调规则
        (抽检 5% + 修正过滤规则)
        │
        └─> 最终蒸馏数据: ~3500 条
```

### 4.2 L1：语法与基础规范检查

**检查规则**：

| 检查项 | 实现方式 | 通过条件 |
|--------|----------|----------|
| 语法解析 | Babel AST | `parse_ok=true` |
| ESLint 规范 | ESLint flat config | `lint_ok=true`，无 error |
| 危险用法 | AST banned 检测 | `banned=[]`（无 eval/require(fs) 等） |
| 代码非空 | 字符串检查 | `len(code) > 100` |

**调用 validator**：

```bash
node stage0/validator/src/cli.js \
  --code-file stage1/data/sft_distill/codes/{hash}.js \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --skip-runtime
```

### 4.3 L2：API 语义与领域知识验证

**检查规则**：

| 检查项 | 实现方式 | 通过条件 |
|--------|----------|----------|
| API 存在性 | validator api_usage | `misses` 占比 ≤ 20% |
| must_use 命中 | validator must_use_hits | 命中率 ≥ 80% |
| 非 Phaser API 过多 | AST 分析 | Phaser API 占比 ≥ 50% |

**API miss 容忍策略**（软过滤）：

- `miss_rate < 0.1`：直接通过
- `0.1 <= miss_rate < 0.2`：通过，标记 warning
- `miss_rate >= 0.2`：淘汰

### 4.4 L3：运行时正确性验证

**检查规则**：

| 检查项 | 实现方式 | 通过条件 |
|--------|----------|----------|
| HEADLESS 可运行 | validator runtime | `runtime_ok=true` |
| 不崩溃 | validator runtime | `crashed=false` |
| 超时控制 | validator timeout | `ms < timeout_ms` |
| 无运行时错误 | validator runtime.errors | `errors=[]` 或仅 warning |

**调用 validator（启用 runtime）**：

```bash
node stage0/validator/src/cli.js \
  --code-file stage1/data/sft_distill/codes/{hash}.js \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --timeout-ms 2000 \
  --frames 60
```

**运行时验证策略**：启用 HEADLESS 验证（用户选定）。如果环境不稳定，可先跳过 L3，在 L5 筛选时对可运行样本加分。

### 4.5 L4：功能匹配度验证

**检查规则**：

| 检查项 | 实现方式 | 通过条件 |
|--------|----------|----------|
| 结构完整性 | validator signals | `has_new_phaser_game` + `has_scene_in_config` |
| 生命周期完整 | validator signals | `has_create=true`（easy 以上需要） |
| plan 存在 | 解析结果 | `plan is not None` |
| plan-code 一致性 | API 对照 | plan.apis 在代码中命中率 ≥ 60% |

### 4.6 L5：多样性与质量综合筛选

**筛选策略**：

1. **按 prompt_id 分组**：每个原始 Prompt 最多保留 1-2 个版本
2. **质量评分**：综合 L1-L4 结果计算分数
3. **多样性筛选**：同一 Prompt 的多个版本用代码相似度去重（阈值 0.85）
4. **难度配额**：保持 easy/medium/hard 的 40/40/20 分布

**质量评分公式**：

- L1 基础分（0.2）- ESLint warning 轻扣
- L2 API 准确率（0.25）
- L3 运行时（0.25）- 快速代码额外加分
- L4 结构与一致性（0.3）

### 4.7 L6：人工抽检与校准

**抽检流程**：

1. **抽样**：从 `selected.jsonl` 中分层抽取 5%（约 175 条）
2. **评审维度**：代码可运行性(0/1)、功能完整性(0/1/2)、代码质量(0/1/2)、Plan一致性(0/1)
3. **校准规则**：某类错误 > 10% 则调整对应层阈值；误杀率 > 5% 则放宽规则

---

## 5. 官方示例/开源代码收集

### 5.1 数据来源

| 来源 | 预计数量 | 优先级 |
|------|----------|--------|
| Phaser 官方示例 | 500-800 条 | 最高 |
| GitHub 开源项目（星标>10） | 200-500 条 | 高 |
| 社区教程代码 | 100-200 条 | 中 |

### 5.2 收集与处理

1. Clone 官方示例仓库：`git clone https://github.com/phaserjs/phaser3-examples.git`
2. 过滤有效代码文件（包含 Phaser.Game）
3. 提取元信息（分类、难度推断）
4. 转换为 SFT 格式（补充 instruction/input，从代码反推 Plan）
5. 通过 L1-L3 质量过滤

---

## 6. 数据集构建与划分

### 6.1 数据整合

```text
蒸馏数据 (selected.jsonl, ~3500 条)
    +
官方/开源数据 (processed.jsonl, ~1000 条)
    │
    ├─> 格式统一
    ├─> 全局去重（代码相似度 > 0.95 去重）
    ├─> 标签补充（难度、模块、来源）
    └─> 最终数据集 (~4500 条)
```

### 6.2 数据集划分

| 集合 | 比例 | 条数 | 用途 |
|------|------|------|------|
| train | 90% | ~4050 | 训练 |
| val | 5% | ~225 | 训练时验证 |
| test | 5% | ~225 | 最终评估 |

**分层抽样原则**：

- 按难度分层：easy/medium/hard 保持 40/40/20
- 按来源分层：蒸馏/官方/开源 各集合都有覆盖
- 按模块覆盖：核心模块（Scene/GameObjects/Input/Physics）均有样本

---

## 7. SFT 微调配置（LLaMA-Factory）

### 7.1 配置文件（`stage1/configs/sft_config_example.yaml`）

```yaml
### Model
model_name_or_path: Qwen/Qwen2.5-Coder-0.5B

### Method
stage: sft
do_train: true
finetuning_type: lora
lora_target: all
lora_rank: 64
lora_alpha: 128
lora_dropout: 0.05

### Dataset
dataset: phaser3_sft
template: qwen
cutoff_len: 2048
max_samples: 10000
overwrite_cache: true
preprocessing_num_workers: 16

### Output
output_dir: stage1/outputs/qwen_coder_0.5b_sft
logging_steps: 10
save_steps: 500
save_total_limit: 3
plot_loss: true
overwrite_output_dir: true

### Train
per_device_train_batch_size: 4
gradient_accumulation_steps: 4
learning_rate: 5.0e-5
num_train_epochs: 3.0
lr_scheduler_type: cosine
warmup_ratio: 0.1
bf16: true

### Eval
val_size: 0.05
per_device_eval_batch_size: 4
eval_strategy: steps
eval_steps: 500
```

### 7.2 训练命令

```bash
pip install llama-factory
llamafactory-cli train stage1/configs/sft_config_example.yaml
```

---

## 8. 验收标准

### 8.1 数据产出验收

| 产出 | 验收条件 |
|------|----------|
| 蒸馏原始数据 | ≥ 5500 条 |
| L1 通过率 | ≥ 90% |
| L2 通过率 | ≥ 85%（在 L1 基础上） |
| L3 通过率 | ≥ 75%（在 L2 基础上）或标记 skipped |
| L4 通过率 | ≥ 90%（在 L3 基础上） |
| 最终蒸馏数据 | ≥ 3200 条 |
| 官方/开源数据 | ≥ 800 条 |
| SFT 数据集 | ≥ 4000 条 |

### 8.2 数据质量验收

| 指标 | 验收条件 |
|------|----------|
| 人工抽检通过率 | ≥ 90%（功能分 ≥ 1） |
| Plan 存在率 | ≥ 95% |
| 代码可解析率 | 100%（L1 保证） |
| 难度分布偏差 | ≤ ±5% |

### 8.3 SFT 模型验收

| 指标 | 验收条件 |
|------|----------|
| 训练 loss | 稳定收敛，无震荡 |
| 验证 loss | 不高于训练 loss 的 1.5 倍 |
| 生成格式 | ≥ 90% 输出包含 [PLAN] 和代码 |
| 代码可解析率 | ≥ 85%（在 val 集上） |

---

## 9. 里程碑计划

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1-2 | 搭建蒸馏框架 + 教师模型对接 | `build_distill_requests.py` + 测试蒸馏 |
| Day 3-4 | 完成全量蒸馏（2000×3=6000） | `raw_outputs.jsonl` + `candidates.jsonl` |
| Day 5-6 | 实现 L1-L4 过滤管线 | `validated.jsonl` + 过滤报告 |
| Day 7 | 实现 L5 多样性筛选 | `selected.jsonl` |
| Day 8 | L6 人工抽检 + 规则校准 | 抽检报告 |
| Day 9-10 | 官方/开源数据收集与处理 | `sft_official/*.jsonl` |
| Day 11 | 数据整合 + 划分 | `sft_dataset/train/val/test.jsonl` |
| Day 12-14 | SFT 微调 + 基础评估 | 模型权重 + 训练报告 |

---

## 10. 风险与备选方案

### 10.1 蒸馏相关风险

| 风险 | 备选方案 |
|------|----------|
| 教师模型 API 不稳定 | 多模型备选（Claude → GPT-4o → DeepSeek） |
| 成本超预算 | 优先蒸馏 hard/medium，easy 可减少版本数 |
| 输出格式不稳定 | 加强 system prompt 约束 + 重试机制 |

### 10.2 过滤相关风险

| 风险 | 备选方案 |
|------|----------|
| HEADLESS 环境不稳定 | 先跳过 L3，后续迭代补充 |
| API 索引不完整 | 放宽 miss 阈值 + 人工补充高频缺失 API |
| 过滤后数据不足 | 降低阈值 + 增加官方示例比例 |

### 10.3 训练相关风险

| 风险 | 备选方案 |
|------|----------|
| 训练不收敛 | 降低 lr + 增加 warmup + 检查数据质量 |
| 过拟合 | 增加 dropout + 早停 + 数据增强 |
| 显存不足 | 降低 batch size + 使用 QLoRA |

---

## 11. 关键文件路径

实施本阶段需要关注的关键文件：

| 文件 | 用途 |
|------|------|
| `stage0/scripts/query_api.py` | API 检索接口，用于 Prompt 上下文注入 |
| `stage0/validator/src/cli.js` | 验证器入口，六层过滤管线的核心依赖 |
| `stage0/validator/src/ast_check.js` | AST 分析实现 |
| `stage0/data/prompt_seeds/prompt_seeds.jsonl` | Prompt 种子库 |
| `stage0/data/api_index/phaser_api.jsonl` | Phaser3 API 索引 |
| `stage2/scripts/reward.py` | 奖励计算参考（可复用 plan 解析逻辑） |

---

## 12. 验证方式

完成本阶段后，可通过以下方式验证：

1. **数据验证**：检查各阶段 JSONL 文件的行数和格式
2. **过滤报告**：查看 `reports/filter_report.json` 确认通过率
3. **SFT 训练**：查看 TensorBoard 确认 loss 收敛
4. **模型推理测试**：用 val 集测试生成格式和代码质量
