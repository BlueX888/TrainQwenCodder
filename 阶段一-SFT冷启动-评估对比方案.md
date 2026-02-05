# 阶段一：SFT 冷启动评估对比方案（Base vs SFT）

适用范围：`Qwen2.5-Coder-0.5B-Instruct` 使用 `stage1/data/sft_distill/sft_from_raw.jsonl` 进行 Phaser3 代码生成 SFT 后，与原始模型（Base）进行对比评估。目标：在**可复现、可分层分析、可回放样本**的框架下，量化 SFT 冷启动收益与潜在退化点。

------

## 0. 评估目标与问题

**核心问题**：SFT 冷启动是否显著提升 Phaser3 代码生成质量？

需要回答：

1. 通过率（Pass@k）是否提升？
2. Phaser3 结构骨架是否更完整？
3. API 命中率（尤其 must-use）是否提高？

------

## 1. 评估对象

- **Base**：Qwen2.5-Coder-0.5B-Instruct 原始模型
- **SFT**：使用 `stage1/data/sft_distill/sft_from_raw.jsonl` 监督微调后的模型（冷启动版本）

仅比较这两个模型；不包含 GRPO 或其他后续阶段。

------

## 2. 评估集设计（避免泄漏）

### 2.1 评估集来源

建议优先从已有 prompt 元数据构建（避免引用 teacher 输出）：

- `stage1/data/sft_distill/requests.jsonl`（包含 system_prompt/user_prompt/prompt_meta）

### 2.2 去重与划分策略

**强烈建议按** `**prompt_id**` **划分**，保证评估集与训练 prompt 不重叠。

- SFT 使用了所有 `prompt_id`：

- 追加一份“**新构造的 OOD Prompt 集**”（手工或程序化生成）
- 在报告中**标注为 OOD-only**，避免误读为泛化成绩

### 2.3 规模与分层建议

- IID-TEST：200 条（模块 × 难度分层）
- OOD-TEST：50–100 条
- 难度比例建议：easy/medium/hard = 4/4/2
- 模块覆盖：Scene / GameObjects / Input / Physics / Animations / Tilemap / Camera / Particles

------

## 3. 评估协议（确保公平）

### 3.1 统一推理设置（必须一致）

对 Base 与 SFT **完全一致的解码设置**：

- `temperature/top_p/max_new_tokens` 固定
- `seed` 固定（Pass@8 使用固定 seed 列表）
- **system prompt 与 API context 注入一致**（建议直接使用 `requests.jsonl` 的 `system_prompt`）
- 输出格式要求：必须包含 `[PLAN]...[/PLAN]` + ```javascript 代码块

### 3.2 输出抽取与规范化

- 仅做格式切分：`PLAN` 与 `code` 的抽取
- 禁止对内容进行语义改写（避免人为“修复”）

------

## 4. 评估指标（自动 + 人工）

### 4.1 核心指标（自动）

1. **Pass@1 / Pass@8**

- `pass = parse_ok && api_ok && structure_ok && (runtime_ok 可选)`

1. **API 命中率**

- `must_use` 命中率
- API miss 率（AST 对照 API index）

1. **结构完整率**

- 是否包含 Phaser.Game 配置
- 是否包含 `config.scene`
- 是否包含 `preload/create`（按难度可要求 update）

1. **格式合规率**

- `[PLAN]` 是否存在
- 代码块是否为 ```javascript
- 代码可 AST parse

1. **运行时稳定性（可选）**

- HEADLESS 运行是否崩溃
- 运行耗时 p50/p90（性能退化监控）

### 4.2 次级指标（可选）

- 平均输出长度（token 数）
- `eval_hints` 覆盖率（如“update 中旋转/监听 pointerdown”）
- ESLint 错误率

### 4.3 人工评估（抽样）

- 抽样 50–100 条（盲评）
- 维度：可读性、需求满足度、可运行性、API 使用正确性
- 评分 1–5，计算 κ 一致性

------

## 5. 评估流程（建议）

1. **构建评估集**（冻结）

- 输出：`prompts_eval.jsonl`

1. **生成结果**

- Base：`gen_base_pass1.jsonl` / `gen_base_pass8.jsonl`
- SFT：`gen_sft_pass1.jsonl` / `gen_sft_pass8.jsonl`

1. **自动评估**

- 调用 validator（AST/ESLint/HEADLESS）
- 生成 summary/breakdown/failures

1. **人工评估抽样**
2. **报告输出与结论**

注：可直接复用 `stage3/` 中的评估 harness（如 `stage3/scripts/evaluate_generations.py`），仅替换输入/输出路径。

------

## 6. 报告结构模板（建议）

### 6.1 总体对比表

| **Metric**         | **Base** | **SFT** | **Δ** |
| ------------------ | -------- | ------- | ----- |
| Pass@1             |          |         |       |
| Pass@8             |          |         |       |
| must_use 命中率    |          |         |       |
| structure_rate     |          |         |       |
| format_rate        |          |         |       |
| runtime_crash_rate |          |         |       |

### 6.2 分层对比（模块/难度/OOD）

- 模块维度：Scene / Input / Physics / …
- 难度维度：easy / medium / hard
- OOD vs IID

### 6.3 失败类型 TopN

- parse_error
- missing_must_use_api
- structure_incomplete
- runtime_crash
- lint_error

### 6.4 典型样例

- 3 条 Base 失败 / SFT 成功
- 3 条 SFT 失败 / Base 成功（定位退化）

------

## 7. 交付物（DoD）

1. 冻结评估集：`prompts_eval.jsonl`
2. 生成结果：Base/SFT Pass@1 & Pass@8
3. 自动评估报告：summary/breakdown/failures
4. 人工评估结果与结论段落

------

## 8. 风险与注意事项

- **数据泄漏**：若评估集与训练集 prompt_id 重叠，必须标注“非泛化”结果
- **解码不一致**：不同温度/seed 会导致对比失真
- **格式偏差**：若 SFT 强化了固定输出格式，需单独报告 format_rate，避免“格式提升掩盖功能缺陷”
- **运行时环境波动**：HEADLESS 不稳定时先降级为非门控指标

------

## 9. 决策规则（建议）

- 只有当 **Pass@1/Pass@8 + must_use 命中率** 同时显著提升时，才判定 SFT “成功冷启动”
- 若 Pass@k 提升但 runtime_crash_rate 上升，需优先排查运行时稳定性
- 若 format_rate 提升但结构完整率下降，判定为“格式过拟合”

------

如需，我可以基于当前仓库结构直接生成评估集与报告模板，并补充实际命令与产物路径。
