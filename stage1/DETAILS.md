# Stage 1（SFT 冷启动）——stage1/ 目录详细解释文档

`stage1/` 负责把 `stage0/` 产出的 **Prompt 种子库 + Phaser3 API 索引 + validator** 串成一条可复现的 **SFT 冷启动数据生产线**：

1) 从 2000 条 Prompt 种子构建蒸馏请求（默认每条 3 版本 → ~6000 请求）  
2) 调用教师模型生成 `Plan + Code`（本仓库提供 Mock 版）  
3) 解析教师输出为结构化候选（Plan/Code/元数据）  
4) 调用 `stage0/validator` 做 L1-L4 过滤（静态 + 可选运行时）  
5) L5 多样性与质量综合筛选（每个 prompt 保留 1-2 条）  
6) 合并官方/开源补充数据（可选）并构建 LLaMA-Factory 可用的 `train/val/test` 数据集

> 阶段一方法论与验收标准见根目录：`../阶段一-SFT冷启动-详细实施文档.md`。本文聚焦解释 **stage1 现有脚本/目录的“输入-处理-输出”与实际运行方式**。

---

## 1. 目录结构与职责

```text
stage1/
├─ README.md
├─ DETAILS.md                    # 本文（新增）
├─ configs/
│  └─ sft_config_example.yaml    # LLaMA-Factory 的 SFT 配置样例
├─ data/
│  ├─ sft_distill/               # 蒸馏相关中间产物（requests/raw/candidates/validated/selected/codes/cache）
│  ├─ sft_official/              # 官方/开源补充数据（可选，需自行准备 processed.jsonl）
│  ├─ sft_dataset/               # 最终训练数据集（train/val/test）
│  └─ reports/                   # 各阶段统计报告
├─ prompts/
│  └─ teacher_system_prompt.txt  # 教师系统提示词（含 {API_CONTEXT} 注入位）
└─ scripts/
   ├─ common.py                  # 工具：路径/JSONL/缓存/检查点/去重/进度条/报告
   ├─ api_bm25.py                # BM25 API 检索（读取 stage0 API index）
   ├─ build_distill_requests.py  # 从 prompt_seeds 构建请求（注入 API 上下文）
   ├─ run_teacher_mock.py        # 教师蒸馏 Mock（生成 raw_outputs.jsonl）
   ├─ parse_teacher_outputs.py   # 解析教师输出 → candidates + 抽取代码文件
   ├─ run_validator_filter.py    # L1-L4：调用 stage0/validator 过滤
   ├─ select_best.py             # L5：质量评分 + 多样性筛选
   └─ build_sft_dataset.py       # 构建最终 SFT 数据集（LLaMA-Factory 格式）
```

---

## 2. 运行前置与约定

### 2.1 stage0 依赖（必须）

stage1 默认直接引用 stage0 的产物路径（在脚本里通过 `get_stage0_path(...)` 计算）：

- `stage0/data/api_index/phaser_api.jsonl`（BM25 检索 + API 存在性校验）
- `stage0/data/prompt_seeds/prompt_seeds.jsonl`（构建蒸馏请求）
- `stage0/validator/src/cli.js`（L1-L4 过滤）

建议先做一次最小检查（在仓库根目录执行）：

```bash
wc -l stage0/data/api_index/phaser_api.jsonl
wc -l stage0/data/prompt_seeds/prompt_seeds.jsonl
node stage0/validator/src/cli.js --help
```

### 2.2 Python 运行位置（重要）

`stage1/scripts/*.py` 使用 `from common import ...` 的“同目录导入”方式，**推荐在 `stage1/scripts/` 下运行**：

```bash
cd stage1/scripts
python build_distill_requests.py
```

如果你必须在仓库根目录运行，请显式加 `PYTHONPATH`：

```bash
PYTHONPATH=stage1/scripts python stage1/scripts/build_distill_requests.py
```

### 2.3 HEADLESS 运行时（可选）

`run_validator_filter.py` 会调用 `stage0/validator`，其运行时验证（L3）在 Node 环境下可能依赖可选包（如 `jsdom/canvas`）并受平台影响。

- 先建议跑通静态链路：`--skip-runtime`
- 稳定后再开启 L3：不带 `--skip-runtime`

---

## 3. 端到端数据流（默认路径）

下面是 stage1 这套最小管线的默认数据流（脚本默认输出都在 `stage1/data/` 下）：

```text
stage0/data/prompt_seeds/prompt_seeds.jsonl
  └─(build_distill_requests.py)→ stage1/data/sft_distill/requests.jsonl
        └─(run_teacher_mock.py 或真实教师)→ stage1/data/sft_distill/raw_outputs.jsonl
              └─(parse_teacher_outputs.py)→ stage1/data/sft_distill/candidates.jsonl
                    └─(run_validator_filter.py)→ stage1/data/sft_distill/validated.jsonl
                          └─(select_best.py)→ stage1/data/sft_distill/selected.jsonl
                                └─(build_sft_dataset.py)→ stage1/data/sft_dataset/{train,val,test}.jsonl
```

同时会生成报告：

- `stage1/data/reports/distill_requests_report.json`
- `stage1/data/reports/parse_report.json`
- `stage1/data/reports/filter_report.json`
- `stage1/data/reports/selection_report.json`
- `stage1/data/reports/sft_dataset_report.json`

---

## 4. 中间数据格式（JSONL）

> JSONL：每行一个 JSON 对象。便于流式处理、并行和断点续跑。

### 4.1 requests.jsonl（蒸馏请求）

由 `scripts/build_distill_requests.py` 生成，字段要点：

- `id`: `distill_<seed_id>_v<version>`
- `prompt_id`: 原种子 id（如 `seed_000123`）
- `version`: 同一 prompt 的第几次蒸馏（用于多样性）
- `system_prompt`: 教师系统提示词（包含注入后的 `{API_CONTEXT}`）
- `user_prompt`: 从 seed 格式化后的用户提示词（任务/约束/must_use/eval_hints）
- `prompt_meta`: 原 seed 对象（全量拷贝，便于追溯）
- `api_context_injected`: 注入的 API `symbol_id` 列表

### 4.2 raw_outputs.jsonl（教师原始输出）

由“教师蒸馏”阶段生成。本仓库用 `scripts/run_teacher_mock.py` 生成 Mock 数据；真实教师时你需要保证输出 schema 至少包含：

- `id / prompt_id / version / prompt_meta`
- `raw_output`（字符串，包含 `[PLAN]...[/PLAN]` + ```javascript 代码块）
- `teacher_model`（标识来源）
- `timestamp`（可选）

> `scripts/parse_teacher_outputs.py` 会优先读取 `raw_output`，否则回退读取 `output` 字段。

### 4.3 candidates.jsonl（解析后的候选）

由 `scripts/parse_teacher_outputs.py` 生成，每条包含：

- `plan`: `{requirements, apis, steps, raw}`（解析自 `[PLAN]` 块）
- `code`: 解析出的 JavaScript 代码字符串（不含围栏）
- `parse_errors / parse_warnings`: 解析失败原因统计口径
- `validation_issues`: **基础规则**检查（不调用 validator），例如缺少 `new Phaser.Game` / 缺少 `create` 等
- `code_hash / code_path`: 抽取出的代码文件（默认写入 `stage1/data/sft_distill/codes/<sha256>.js`）

### 4.4 validated.jsonl（L1-L4 过滤结果）

由 `scripts/run_validator_filter.py` 生成，核心新增字段：

- `validator_result`: `stage0/validator/src/cli.js` 的原始 JSON 输出
- `l1_passed / l2_passed / l3_passed / l4_passed`: 分层通过情况
- `filter_issues`: 失败/警告原因列表
- `from_cache`: 是否命中缓存（`validator_cache.jsonl`）

### 4.5 selected.jsonl（L5 多样性筛选）

由 `scripts/select_best.py` 生成：

- 在 `validated.jsonl` 基础上新增 `quality_score`（0-1）与 `selected=true`
- 默认每个 `prompt_id` 最多保留 2 条，并按代码相似度去重

### 4.6 train/val/test（最终 SFT 数据集）

由 `scripts/build_sft_dataset.py` 生成，输出为 LLaMA-Factory 可直接消费的 JSONL：

```json
{
  "instruction": "...系统指令...",
  "input": "...任务/难度/约束/must_use...",
  "output": "[PLAN]...[/PLAN]\\n\\n```javascript\\n...code...\\n```",
  "metadata": { "prompt_id": "...", "source": "distill|official", "difficulty": "...", ... }
}
```

---

## 5. 脚本逐个解释（输入 / 关键逻辑 / 输出）

### 5.1 `scripts/api_bm25.py`：API 检索与上下文格式化

用途：为教师系统提示词注入“相关 API 参考”，降低幻觉与 API 误用率。

要点：
- 默认读取 `stage0/data/api_index/phaser_api.jsonl`
- BM25 tokenization 支持中英文混合：英文拆驼峰/下划线/点号，中文按字符
- `search_for_prompt(prompt)` 会综合 `task/tags/must_use_apis/modules` 生成 query
- `format_api_context()` 会按 `owner` 分组，输出类似：

```text
### Phaser.Input.InputPlugin
- `on(event: string, fn: Function, context?: any): this`
- `keyboard: Phaser.Input.Keyboard.KeyboardPlugin`
```

### 5.2 `scripts/build_distill_requests.py`：构建蒸馏请求

输入：
- `--prompts`：默认 `stage0/data/prompt_seeds/prompt_seeds.jsonl`
- `--api-index`：默认 `stage0/data/api_index/phaser_api.jsonl`

关键逻辑：
- 读取 `prompts/teacher_system_prompt.txt`
- 检索 top-k API（默认 20）并替换 `{API_CONTEXT}`
- 将 seed 渲染成 `user_prompt`（任务/约束/must_use/eval_hints）
- 每个 seed 生成 `--versions` 个版本（默认 3）

输出：
- `stage1/data/sft_distill/requests.jsonl`
- `stage1/data/reports/distill_requests_report.json`

推荐跑法：

```bash
cd stage1/scripts
python build_distill_requests.py --versions 3 --top-k 20
```

### 5.3 `scripts/run_teacher_mock.py`：教师蒸馏（Mock）

用途：在没有接入真实教师模型前，先验证“请求→解析→过滤→筛选→数据集构建”的链路。

输入：
- `--requests`：默认 `data/sft_distill/requests.jsonl`
- `--max-items`：只处理前 N 条（用于快速测试）
- `--checkpoint`：断点续跑（保存已处理 request id）

输出：
- `stage1/data/sft_distill/raw_outputs.jsonl`

> 若替换为真实教师蒸馏，你只需要保证输出字段里有 `raw_output`（含 `[PLAN]` 与 ```javascript 代码围栏），并保留 `prompt_id/version/prompt_meta` 以便追溯。

### 5.4 `scripts/parse_teacher_outputs.py`：解析教师输出

输入：
- `--input`：默认 `data/sft_distill/raw_outputs.jsonl`

关键逻辑：
- `parse_plan()`：解析 `[PLAN]...[/PLAN]`（或 fallback 到 ```plan 围栏）
- `parse_code()`：优先提取 ```javascript 围栏；其次尝试截取 `[/PLAN]` 后内容；再其次做“包含 Phaser 的大段文本”回退
- `validate_code()`：非常轻量的规则检查（非 validator），主要用于统计与快速剔除明显坏样本
- 抽取 `code` 并写入 `codes/<sha256>.js`（后续 validator 复用）

输出：
- `stage1/data/sft_distill/candidates.jsonl`
- `stage1/data/reports/parse_report.json`

### 5.5 `scripts/run_validator_filter.py`：L1-L4 过滤（调用 stage0/validator）

输入：
- `--input`：默认 `data/sft_distill/candidates.jsonl`
- `--skip-runtime`：跳过 L3（HEADLESS）运行时验证
- `--cache`：默认 `data/sft_distill/validator_cache.jsonl`（避免重复跑 validator）

过滤层定义（以脚本实现为准）：

- L1（语法/规范/安全基础）
  - `parse_ok`（Babel 可解析）
  - `lint_ok`（ESLint 通过）
  - 代码长度 > 100
- L2（API 语义与 must-use）
  - API misses 占比 < 20%（≥0.2 直接失败；0.1-0.2 记 warning）
  - must_use 命中率 ≥ 80%
- L3（运行时）
  - `runtime_ok` 为真且 `runtime.crashed` 为假
  - 可用 `--skip-runtime` 跳过（会记 `l3_skipped`）
- L4（结构/一致性）
  - `signals.has_new_phaser_game`、`signals.has_create` 等结构信号
  - hard 难度更倾向要求 `preload`
  - 要求 `plan` 存在；并做 plan-API 与代码命中一致性（低一致性是 warning）

输出：
- `stage1/data/sft_distill/validated.jsonl`
- `stage1/data/reports/filter_report.json`

注意事项：
- validator 的运行时（L3）对环境更敏感；先 `--skip-runtime` 跑通全链路更稳。
- `stage0/validator` 的输出以 `errors/warnings/signals/api_usage/runtime` 为主；如果你扩展 validator 输出字段，记得同步这里的过滤逻辑。

### 5.6 `scripts/select_best.py`：L5 多样性与质量筛选

输入：
- `--input`：默认 `data/sft_distill/validated.jsonl`

关键逻辑：
- 先按 `prompt_id` 分组
- 为每个候选计算 `quality_score`（融合 L1-L4 + API 准确率 + 运行耗时等）
- 用 `difflib.SequenceMatcher` 比较“规范化后的代码”相似度，默认阈值 `0.85`
- 每个 prompt 最多保留 `--max-per-prompt` 条（默认 2）
- `--allow-partial` 可放宽为只要求 L1+L4

输出：
- `stage1/data/sft_distill/selected.jsonl`
- `stage1/data/reports/selection_report.json`

### 5.7 `scripts/build_sft_dataset.py`：构建最终 SFT 数据集

输入：
- `--distill`：默认 `data/sft_distill/selected.jsonl`
- `--official`：默认 `data/sft_official/processed.jsonl`（可选存在，不存在会跳过）

关键逻辑：
- 将每条候选转换为 LLaMA-Factory 兼容字段：`instruction/input/output`
- 全局去重：对提取出的代码做 `normalize_code()` 后计算哈希（同哈希视为重复）
- 分层划分：按 `difficulty + source` 分层，保证 train/val/test 分布更稳定

输出：
- `stage1/data/sft_dataset/train.jsonl`
- `stage1/data/sft_dataset/val.jsonl`
- `stage1/data/sft_dataset/test.jsonl`
- `stage1/data/reports/sft_dataset_report.json`

---

## 6. 一键跑通（建议先用小样本）

```bash
cd stage1/scripts

# 1) 生成 6000 条蒸馏请求（2000 seeds * 3 versions）
python build_distill_requests.py

# 2) Mock 教师输出：先跑 100 条快速验证
python run_teacher_mock.py --max-items 100

# 3) 解析 Plan/Code 并抽取代码文件
python parse_teacher_outputs.py

# 4) L1-L4：先跳过运行时更稳定
python run_validator_filter.py --skip-runtime

# 5) L5：多样性筛选（每个 prompt 最多 2 条）
python select_best.py --allow-partial

# 6) 构建 SFT 数据集
python build_sft_dataset.py
```

---

## 7. 训练对接（LLaMA-Factory）

配置样例在 `configs/sft_config_example.yaml`，关键点：

- `dataset`: 需要在 LLaMA-Factory 的 `data/dataset_info.json` 注册，或改用绝对路径
- `output_dir`: 默认写到 `stage1/outputs/...`

示例：

```bash
pip install llama-factory
llamafactory-cli train stage1/configs/sft_config_example.yaml
```

---

## 8. 常见问题（FAQ）

### Q1：跑脚本时报 `ModuleNotFoundError: common`？

在 `stage1/scripts/` 下运行，或加 `PYTHONPATH=stage1/scripts`。

### Q2：validator 报缺依赖（@babel/parser / eslint / phaser / jsdom/canvas）？

先在 `stage0/validator/` 安装依赖：

```bash
cd stage0/validator
npm i
```

运行时依赖（`jsdom/canvas`）属于可选，建议先 `--skip-runtime`。

### Q3：parse_report 里 plan/code 解析失败很多？

通常是教师输出格式不稳定。确保教师输出严格包含：

- `[PLAN] ... [/PLAN]`
- ```javascript 围栏包裹的完整代码

并尽量包含 `preload/create` 与 `new Phaser.Game(...)`。

### Q4：为什么 API misses 很高？

常见原因：
- `stage0` 的 API 索引与教师生成时的 Phaser 版本不一致
- 生成代码大量使用动态链路/别名，AST 无法映射到 `symbol_id`
- `this.*` 的调用链映射表覆盖不够（在 `stage0/validator/src/ast_check.js` 扩展）

