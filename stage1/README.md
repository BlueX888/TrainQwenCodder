# Stage 1（SFT 冷启动）

`stage1/` 把 `stage0/` 的三类基础设施（Prompt 种子库、Phaser3 API 索引、validator）串成一条可复现的 **SFT 冷启动数据生产线**：从任务种子出发，构建蒸馏请求 → 教师生成 `Plan + Code` → 结构化解析 → L1-L5 分层过滤与筛选 → 输出 LLaMA-Factory 可直接消费的数据集。

本阶段的重点不是“绑定某个教师模型”，而是定义一套稳定的 **输入/输出契约 + 质量门控 + 可追溯产物**，让数据生产能被重复构建、回归验证与持续迭代。

---

## 设计方案（高层）

### 1) 流水线即数据工厂（Artifacts-first）

stage1 将每一步都固化为落盘产物（默认在 `stage1/data/`）：

- `sft_distill/requests.jsonl`：蒸馏请求（包含 API 上下文注入后的 system prompt）
- `sft_distill/raw_outputs*.jsonl`：教师原始输出（字符串）
- `sft_distill/candidates*.jsonl` + `sft_distill/codes/`：解析后的候选 + 抽取出的纯代码文件（按 hash 命名）
- `sft_distill/validated*.jsonl`：调用 `stage0/validator` 的结构化验证结果（含 L1-L4 通过情况）
- `sft_distill/selected*.jsonl`：L5 多样性与质量筛选结果（每个 prompt 选 1-2 条）
- `sft_official/processed.jsonl`（可选）：官方/开源补充样本（需自行准备，供合并到最终数据集）
- `sft_dataset/{train,val,test}.jsonl`：最终 SFT 数据集（LLaMA-Factory 格式）
- `reports/*.json`：每阶段统计报告（便于验收与回归）

### 2) 教师解耦（Teacher-agnostic）

教师阶段只需要满足“输出契约”：文本里包含 `[PLAN]...[/PLAN]` 块与 ```javascript 代码块。只要产出满足该格式的 `raw_outputs.jsonl`，后续解析/过滤/构建数据集流程都不依赖具体厂商与模型。

- 教师输出格式模板：`stage1/prompts/teacher_system_prompt.txt`
- 当前仓库提供 Claude API 示例实现：`stage1/scripts/run_teacher_claude.py`

### 3) API 上下文注入（RAG-for-APIs）

为降低 API 幻觉与误用，蒸馏请求构建阶段会：

- 读取 `stage0/data/api_index/phaser_api.jsonl`
- 用 BM25 检索与任务相关的 top-k API
- 将检索结果注入到 `teacher_system_prompt.txt` 的 `{API_CONTEXT}` 占位符

对应实现：
- `stage1/scripts/api_bm25.py`（BM25 检索与格式化）
- `stage1/scripts/build_distill_requests.py`（生成 requests.jsonl）

### 4) 分层质量门控（L1-L5）

stage1 用“先硬门控、再软排序”的方式控制数据质量：

- L1（语法/规范/安全）：Babel 可解析、ESLint 通过、无危险用法、代码长度阈值
- L2（API 语义）：API 存在性 miss rate、must_use API 覆盖率
- L3（运行时，可选）：HEADLESS best-effort 运行且不崩溃（可 `--skip-runtime`）
- L4（结构与匹配度）：`new Phaser.Game`/scene 生命周期/Plan 存在/Plan-Code 一致性（含难度自适应）
- L5（质量 + 多样性）：综合质量评分 + 代码相似度去重，按 `prompt_id` 保留 1-2 条

对应实现：
- L1-L4：`stage1/scripts/run_validator_filter.py`（调用 `stage0/validator/src/cli.js`）
- L5：`stage1/scripts/select_best.py`

### 5) 可追溯与可断点（Traceable & resumable）

- 所有记录都保留 `id/prompt_id/version/prompt_meta` 等追溯字段
- 解析阶段将代码按 `sha256` 落盘到 `sft_distill/codes/`，便于复用 validator 与人工抽检
- 教师调用支持检查点（断点续跑）：`stage1/scripts/run_teacher_claude.py --checkpoint ...`
- validator 结果支持缓存（避免重复验证同一代码）：`stage1/scripts/run_validator_filter.py --cache ...`

---

## 目录结构

```text
stage1/
├─ README.md
├─ DETAILS.md
├─ 目录说明.md
├─ SFT数据集格式说明.md
├─ 使用Claude API蒸馏指南.md
├─ configs/
│  └─ sft_config_example.yaml
├─ prompts/
│  └─ teacher_system_prompt.txt
├─ scripts/
│  ├─ common.py
│  ├─ api_bm25.py
│  ├─ build_distill_requests.py
│  ├─ run_teacher_claude.py
│  ├─ test_claude_api.py
│  ├─ parse_teacher_outputs.py
│  ├─ run_validator_filter.py
│  ├─ select_best.py
│  └─ build_sft_dataset.py
└─ data/                # 运行产物（可能很大）
```

---

## 最小工作流（建议）

> `stage1/scripts/*.py` 使用 `from common import ...` 的同目录导入方式，推荐在 `stage1/scripts/` 下运行；如需在仓库根目录运行，请显式设置 `PYTHONPATH=stage1/scripts`。

### 0) 前置：stage0 产物可用

在仓库根目录执行：

```bash
wc -l stage0/data/api_index/phaser_api.jsonl
wc -l stage0/data/prompt_seeds/prompt_seeds.jsonl
node stage0/validator/src/cli.js \
  --code-file stage0/test_code.js \
  --api-index stage0/data/api_index/phaser_api.jsonl \
  --skip-runtime
```

> 若提示缺少 validator 依赖，可在 `stage0/validator/` 下执行一次 `npm i`。

### 1) 构建蒸馏请求（API 上下文注入）

```bash
cd stage1/scripts
python build_distill_requests.py --versions 3 --top-k 20
```

### 2) 教师蒸馏（示例：Claude API）

```bash
pip install anthropic
export ANTHROPIC_API_KEY='sk-ant-xxxxx'
python run_teacher_claude.py --max-items 10
```

默认输出：`stage1/data/sft_distill/raw_outputs_claude.jsonl`。

### 3) 解析教师输出为候选（Plan + Code）

```bash
python parse_teacher_outputs.py \
  --input ../data/sft_distill/raw_outputs_claude.jsonl \
  --output ../data/sft_distill/candidates_claude.jsonl
```

### 4) L1-L4 过滤（建议先跳过运行时）

```bash
python run_validator_filter.py \
  --input ../data/sft_distill/candidates_claude.jsonl \
  --output ../data/sft_distill/validated_claude.jsonl \
  --skip-runtime
```

### 5) L5 多样性筛选

```bash
python select_best.py \
  --input ../data/sft_distill/validated_claude.jsonl \
  --output ../data/sft_distill/selected_claude.jsonl
```

### 6) 构建最终 SFT 数据集（LLaMA-Factory）

```bash
python build_sft_dataset.py \
  --distill ../data/sft_distill/selected_claude.jsonl \
  --output-dir ../data/sft_dataset
```

---

## 训练对接（可选）

`build_sft_dataset.py` 输出的 `{train,val,test}.jsonl` 可按 `stage1/configs/sft_config_example.yaml` 接入 LLaMA-Factory；字段定义与注册方式见：`stage1/SFT数据集格式说明.md`。

---

## 进一步阅读

- 详细实现/参数/中间 schema：`stage1/DETAILS.md`
- 目录索引：`stage1/目录说明.md`
- Claude 蒸馏操作细节：`stage1/使用Claude API蒸馏指南.md`
- 最终数据集格式与统计：`stage1/SFT数据集格式说明.md`
