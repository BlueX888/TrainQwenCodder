# 阶段一：SFT 冷启动（详细实施文档）

> 适用范围：`Qwen2.5-Coder-0.5B 基于 GRPO 的 Phaser3 代码生成强化训练方案` 的 **2.3 阶段一：SFT 冷启动**  
> 本文目标：把“数据蒸馏 → 多层过滤 → 数据集定稿 → SFT 训练”拆成可执行的工程任务、数据格式与验收标准。

---

## 0. 本阶段产出（DoD）

阶段一结束时应具备以下可交付物（建议都可复现构建）：

1) **候选蒸馏数据（约 6000 条）**  
   - 来自 Prompt 种子库的蒸馏：`2000 prompts × 3 variants`（可按算力调整）  
   - 每条包含：`prompt`、`检索注入的 API context`、`teacher 输出（plan+code）`、`生成参数`、`元信息`

2) **过滤与报告（L1-L6）**  
   - 各层过滤的统计报告（通过率、误杀率抽检、常见失败原因 TopN）  
   - 可复跑：给定同一输入，输出一致（或可解释的随机差异）

3) **SFT 最终数据集（目标 ~4500 条）**  
   - 目标结构：`3500` 蒸馏精选 + `1000` 官方/开源补充（数量可按质量与覆盖调整）  
   - 统一格式：可直接喂给 SFT 框架（例如 LLaMA-Factory）

4) **SFT 产物**  
   - 训练配置文件（含超参、模板、数据路径、版本信息）  
   - 权重产物路径 + 训练日志 + 基础评估结果（Pass@1/结构完整率/API 命中等）

---

## 1. 前置依赖（阶段零输出）

开始阶段一前，需确认阶段零至少满足：

- Prompt 种子库：`stage0/data/prompt_seeds/prompt_seeds.jsonl`（≥2000）  
- Phaser3 API 索引：`stage0/data/api_index/phaser_api.jsonl`（可检索/可校验）  
- 验证器可用：`stage0/validator/src/cli.js`（至少 AST 解析可跑；ESLint/HEADLESS 按资源逐步启用）

---

## 2. 目录与数据文件约定（建议）

为保证“蒸馏/过滤/训练”串起来顺滑，建议新增以下路径（可按团队习惯调整，但要固定下来）：

```text
stage1/
├─ data/
│  ├─ sft_distill/
│  │  ├─ requests.jsonl            # 蒸馏请求（含 messages、api_context、gen 参数）
│  │  ├─ raw_outputs.jsonl         # 教师模型原始输出（未解析）
│  │  ├─ candidates.jsonl          # 解析后的候选（plan/code 拆分 + 元信息）
│  │  ├─ validated.jsonl           # validator 结果合并后的候选
│  │  └─ selected.jsonl            # 每条 prompt 的选优样本
│  ├─ sft_official/
│  │  └─ official_pairs.jsonl      # 官方/开源补充（prompt->code）
│  └─ sft_dataset/
│     ├─ train.jsonl
│     ├─ val.jsonl
│     └─ test.jsonl
└─ scripts/                        # 本阶段流水线脚本
```

训练配置建议独立目录：

```text
stage1/configs/
└─ sft_config_example.yaml
```

---

## 3. 数据蒸馏（Teacher → Candidate）

### 3.1 蒸馏输入：Prompt 规范

Prompt 以阶段零的 JSONL schema 为准（`id/difficulty/modules/task/constraints/must_use_apis/eval_hints/tags`）。

蒸馏时建议构造一个统一的“用户侧输入文本”，拼接顺序建议：

1) 任务描述：`task`  
2) 约束：`constraints`（逐条 bullet）  
3) 必用 API：`must_use_apis`（如为空则省略）  
4) 验收提示：`eval_hints`（用于引导可验证实现）  

> 原则：Prompt 要“可验证”，避免只有泛泛描述，导致后续 L4/L5 很难做功能匹配与多样性筛选。

### 3.2 API Context 注入（检索 topK）

为了让教师模型更稳定地用对 Phaser API，建议每条 Prompt 注入 `top_k=20` 左右的 API 摘要（可按 prompt 难度动态调整）。

推荐做法：

- 用 `stage1/scripts/build_distill_requests.py` 内置的 BM25 检索对 `task + constraints + eval_hints` 做检索（一次构建索引，多次 query）  
- 只注入“签名级信息”（`owner/name/signature/tags`），不要塞长篇文档  

注入格式建议（示例）：

```text
[Relevant Phaser APIs]
1) Phaser.Input.InputPlugin#on(event: string | symbol, callback: Function, context?: any): this
2) Phaser.Input.Events.POINTER_DOWN
3) Phaser.GameObjects.GameObjectFactory#text(x: number, y: number, text: string, style?: object): Phaser.GameObjects.Text
...
```

### 3.3 教师模型输出格式（强约束）

为兼容后续 GRPO 的“结构化计划奖励”，建议阶段一开始就对齐输出格式：

输出必须包含两段，顺序固定：

1) `plan:`（短 JSON，≤120 tokens；不要长推理）  
2) `code:`（纯 JS，可直接保存为 `.js` 并运行；不得夹带解释文本）

建议模板：

```text
plan:
{"requirements":[...],"apis":[...],"steps":[...],"notes":"..."}
code:
// JavaScript code here (no markdown fences)
```

要求：

- `plan.apis` 必须与代码中实际使用的关键 API 对齐（避免“说一套做一套”）  
- 禁止输出长思维链/推理过程（只允许短 plan）  
- 不依赖外部资源：优先用 `Graphics` / 程序化纹理（生成小纹理）  
- 代码需包含 Phaser Game 配置与 Scene 生命周期（至少 `preload/create`）

### 3.4 蒸馏请求与落盘（建议 schema）

建议把“请求”与“输出”都落盘（便于复现、抽检与回滚），JSONL schema 示例：

`requests.jsonl`（示例字段）：

```json
{
  "request_id":"req_000001",
  "prompt_id":"seed_000123",
  "variant":1,
  "difficulty":"easy",
  "modules":["Scene","Input"],
  "messages":[
    {"role":"system","content":"...teacher system prompt..."},
    {"role":"user","content":"...user prompt with constraints and api context..."}
  ],
  "gen":{"temperature":0.6,"top_p":0.9,"max_tokens":1800,"seed":1234},
  "meta":{"api_top_k":20,"phaser_version":"3.80.0"}
}
```

`raw_outputs.jsonl`（示例字段）：

```json
{
  "request_id":"req_000001",
  "teacher_model":"gpt-5",
  "finish_reason":"stop",
  "text":"plan:\\n{...}\\ncode:\\n...js..."
}
```

`candidates.jsonl`（解析后，示例字段）：

```json
{
  "request_id":"req_000001",
  "prompt_id":"seed_000123",
  "variant":1,
  "plan":{"requirements":[...],"apis":[...],"steps":[...]},
  "code":"...pure js...",
  "meta":{"teacher_model":"gpt-5","gen":{...},"api_context":[...]}
}
```

解析规则建议：

- 以 `plan:` 与 `code:` 分段；若缺失则标记为坏样本  
- plan JSON 解析失败：可保留为字符串，但该样本默认降级/淘汰  
- code 需做基础清洗（去除多余前后空白、去掉围栏符号等）

---

## 4. 多层质量过滤（L1-L6）

本阶段的核心是“把 6000 候选筛成可用的 3500 左右”，并保证覆盖与多样性。

### 4.1 统一输出：样本验证报告

建议对每条候选输出一个 `validation_result`（JSON），并把关键字段写入 `stage1/data/reports/`：

- `parse_ok / lint_ok / api_ok / runtime_ok`  
- `errors[] / warnings[]`  
- `api_usage.hits/misses` + `must_use_hits/must_use_misses`  
- `signals`：是否创建 Game、是否存在 preload/create 等

阶段零的 `stage0/validator/src/cli.js` 输出可作为标准结果（缺失项按 `false`/空数组处理）。

### 4.2 L1：语法与基础规范检查（门控）

目标：快速剔除明显不可用样本。

门槛建议：

- `parse_ok=true`（必须）  
- `lint_ok=true`（建议必须；资源紧张可先 `--skip-eslint`，但会放大后续噪声）  
- 禁止危险用法（`eval` / `new Function` / banned imports）一票否决

### 4.3 L2：API 语义与领域知识验证（弱校验）

目标：减少 API 幻觉与低级误用。

门槛建议：

- 若提供 `api_index`：`api_usage.misses.length == 0`（或允许极少量白名单例外）  
- `must_use_apis`：必须全部命中（`must_use_misses == []`）  

备注：

- Phaser 动态特性强：本阶段以“存在性/常见误用”弱校验为主，避免误杀  
- 需要时可加入“常见错 API 映射表”（例如把 `this.add.sprite` / `this.add.image` 与对应 Factory owner 对齐）

### 4.4 L3：运行时正确性验证（HEADLESS）

目标：剔除会崩溃/生命周期不完整的样本，并为后续 GRPO 的 runtime reward 打底。

门槛建议（可按平台调整）：

- `runtime_ok=true`（理想情况）  
- 若 HEADLESS 不稳定：先作为加分项；但至少抽样跑 10%-30% 做质量回归

建议统一运行参数：

- `--frames 60`（或按任务复杂度调整到 120）  
- `--timeout-ms 1500`（复杂样本可到 3000）  

### 4.5 L4：功能匹配度验证（可执行/可判定信号）

目标：确保“实现了需求”，不是只过语法与 API。

推荐从两条路径做（可并行逐步建设）：

1) **AST 规则匹配**（低成本、稳定）  
   - 从 `eval_hints` 提取关键词 → 映射到 AST 规则  
   - 例：包含“监听 pointerdown” → 检查 `this.input.on(Phaser.Input.Events.POINTER_DOWN, ...)` 或等价写法

2) **运行时 signals/断言**（更强、但工程量更大）  
   - 约定生成代码写入 `globalThis.__signals__`（例如 `score/health/level`）  
   - HEADLESS runner 读出并校验（例如分数变化、对象数量上限等）

> 阶段一优先保证“可判定”：宁可少覆盖一点复杂功能，也不要引入高误判率规则。

### 4.6 L5：多样性与质量综合筛选（选优）

目标：从每条 Prompt 的 3 个候选中挑选更优且更不相似的实现。

建议评分（示例）：

- 基础门控：L1-L2 必须过  
- 质量打分（用于排序）：  
  - `runtime_ok` +0.2（可选）  
  - `api_usage.hits` 数量与“模块覆盖”加分（避免只写空壳）  
  - 代码长度在合理区间（过短/过长都降分）  
- 多样性去重：  
  - 对代码做归一化（去空白/去数字常量/统一引号）后做 hash  
  - 相似度高于阈值（例如 0.9）只保留一条

### 4.7 L6：人工抽检与校准（必做）

建议抽检比例：

- 过滤前：随机 1% 看 teacher 是否遵守输出格式（plan/code 分段、无解释文本）  
- 过滤后：分层抽样 5%（按模块×难度），核查：
  - API 幻觉是否漏网  
  - 是否满足 constraints（不用外部资源、包含生命周期等）  
  - 代码是否可读、是否有明显坏味道

抽检结论要反哺：

- Prompt 写法（更可验证）  
- Teacher 提示词（减少跑偏）  
- 过滤规则（降低误杀/漏杀）

---

## 5. 官方/开源补充数据（约 1000 条）

目标：补齐覆盖面与“真实工程写法”。

建议来源（按可控性排序）：

1) Phaser 官方 examples（本地拉取固定版本）  
2) Phaser 官方 labs / snippets（如可获取）  
3) 少量高质量开源项目（需人工挑选，避免引入与训练目标无关的大工程样式）

关键要求：

- 每条补充数据也要配一个可用 Prompt（可人工写或用教师模型“反向生成 Prompt”，但最终要人工抽检）  
- 同样走 L1-L3（至少 L1-L2）过滤，保证可用

---

## 6. SFT 训练（LLaMA-Factory 参考）

### 6.1 数据集格式（推荐）

为了减少框架耦合，建议统一为 `JSONL` 的 instruction 格式（示例）：

```json
{
  "id":"sft_000001",
  "instruction":"你是 Phaser3 专家开发者。请根据需求生成代码。\\n\\n需求：...\\n约束：...\\n必用API：...\\n\\n输出格式：先 plan: 再 code:",
  "input":"",
  "output":"plan:\\n{...}\\ncode:\\n...js..."
}
```

随后由框架侧选择模板（如 Qwen chat template）进行训练。

### 6.2 训练策略建议（0.5B）

建议从 **LoRA SFT** 起步（资源需求低、迭代快），等数据稳定后再评估是否全参：

- `finetuning_type: lora`
- `max_seq_len`: 2048（若样本更长再上调）
- 学习率：`1e-4 ~ 2e-4`（LoRA 常用区间）
- epoch：2~3（先小跑，避免过拟合到格式）
- 重点关注：输出格式稳定性、Phaser 结构完整率、API 幻觉率

### 6.3 最小验收（训练后）

对固定的验证集（例如 200 条）做快速回归：

- 结构完整率（是否创建 Game + preload/create）≥ 90%  
- must-use API 命中率 ≥ 85%（随难度分层统计）  
- HEADLESS 崩溃率 ≤ 15%（若 runtime 环境稳定应更低）

---

## 7. 风险与备选方案

- **教师输出不稳定/格式飘**：强制分段标记；不合规样本直接丢弃；必要时用“修复器”（小模型/规则）只做格式修复，不改逻辑  
- **HEADLESS 环境不稳定**：阶段一先以 AST/Lint 过滤为主，runtime 作为抽检与加分项；同时用容器固化依赖  
- **功能匹配难**：优先做“可判定”的 eval_hints；逐步扩充 hint→rule 映射表  
- **数据同质化**：强制每条 Prompt 保留 1 条最优，但对相似候选施加去重；Prompt 母题做参数化扩展避免换皮  
