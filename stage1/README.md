# Stage1 - SFT 冷启动数据构建

本目录负责教师蒸馏数据的构建、解析、质量过滤、样本选择与最终 SFT 数据集划分，并提供评测集输入与本地推理脚本。

## 目录与文件说明
- README.md: 本说明文档。
- Claude API蒸馏指南.md: Claude API 蒸馏的快速开始与完整流程。
- prompts/: 教师模型的提示词模板目录。
  - teacher_system_prompt.txt: 教师系统提示词模板，包含 `{API_CONTEXT}` 占位符。
- scripts/: 数据流水线与工具脚本。
  - api_bm25.py: Phaser API 的 BM25 检索与上下文拼接工具（供蒸馏请求构建）。
  - build_distill_requests.py: 从 stage0 的 prompt seeds 生成蒸馏请求，并注入 API 上下文。
  - run_teacher_claude.py: 调用 Claude API 执行教师蒸馏（支持断点续跑/并发/去重）。
  - parse_teacher_outputs.py: 解析教师输出，抽取 [PLAN] 与代码，生成候选样本与代码文件。
  - run_validator_filter.py: 调用 stage0 validator 做 L1/L4 过滤，输出验证结果与缓存。
  - select_best.py: L5 质量+多样性筛选，每个 prompt 选 1-2 个最佳样本。
  - build_sft_dataset.py: 转换为 SFT 格式，去重并划分 train/val/test。
  - infer_transformers.py: 使用 HuggingFace Transformers 对评测集做推理生成。
  - common.py: 路径、JSONL 读写、哈希、报告、进度条等公共工具。
  - __pycache__/: Python 缓存目录（可忽略）。
- data/: 产物与中间数据。
  - sft_distill/: 蒸馏与筛选的中间产物。
    - requests.jsonl: 蒸馏请求（system/user prompt + API 上下文注入信息）。
    - raw_outputs_claude.jsonl: Claude 教师输出的原始文本。
    - checkpoint_claude.json: Claude 蒸馏断点续跑检查点。
    - candidates.jsonl: 解析后的候选样本（plan/code/解析错误等）。
    - codes/: 按 code hash 保存的单条代码文件（给 validator 使用）。
    - validator_cache.jsonl: validator 结果缓存（避免重复验证）。
    - validated.jsonl: L1/L4 过滤后的候选（含 validator 结果）。
    - selected.jsonl: L5 多样性+质量筛选后的最终蒸馏样本。
    - sft_from_raw.jsonl: 直接从 raw 输出转换的 SFT 样本（历史/备用产物，非主流程）。
  - sft_dataset/: 最终 SFT 数据集（LLaMA-Factory 兼容格式）。
    - train.jsonl: 训练集。
    - val.jsonl: 验证集。
    - test.jsonl: 测试集。
  - eval/: 评测集输入。
    - prompts_eval.jsonl: 模型自动评测用 prompts（IID/OOD 混合）。
    - prompts_human.jsonl: 人工评测用 prompts。
    - reports/eval_set_build_report.json: 评测集构建统计与来源记录。
  - reports/: 各步骤的统计报告（JSON）。
    - distill_requests_report.json: 构建蒸馏请求统计。
    - parse_report.json: 解析教师输出的统计与错误分布。
    - filter_report.json: L1/L4 过滤统计与问题分布。
    - selection_report.json: L5 筛选统计（每 prompt 选中数/相似度阈值等）。
    - sft_dataset_report.json: SFT 数据集构建统计（划分比例与分布）。
- .DS_Store: macOS 目录元数据，可忽略。

## 流程关系（数据流）
1) 构建蒸馏请求  
`stage0/data/prompt_seeds/prompt_seeds.jsonl` + `stage0/data/api_index/phaser_api.jsonl`  
→ `scripts/build_distill_requests.py`  
→ `data/sft_distill/requests.jsonl` + `data/reports/distill_requests_report.json`

2) 教师蒸馏（Claude）  
`data/sft_distill/requests.jsonl` + `prompts/teacher_system_prompt.txt`  
→ `scripts/run_teacher_claude.py`  
→ `data/sft_distill/raw_outputs_claude.jsonl` + `data/sft_distill/checkpoint_claude.json`

3) 解析教师输出  
`data/sft_distill/raw_outputs_claude.jsonl`  
→ `scripts/parse_teacher_outputs.py`  
→ `data/sft_distill/candidates.jsonl` + `data/sft_distill/codes/` + `data/reports/parse_report.json`

4) L1/L4 质量过滤  
`data/sft_distill/candidates.jsonl` + `stage0/validator`  
→ `scripts/run_validator_filter.py`  
→ `data/sft_distill/validated.jsonl` + `data/sft_distill/validator_cache.jsonl` + `data/reports/filter_report.json`

5) L5 选择（质量 + 多样性）  
`data/sft_distill/validated.jsonl`  
→ `scripts/select_best.py`  
→ `data/sft_distill/selected.jsonl` + `data/reports/selection_report.json`

6) 构建最终 SFT 数据集  
`data/sft_distill/selected.jsonl` (+ 可选 `data/sft_official/processed.jsonl`)  
→ `scripts/build_sft_dataset.py`  
→ `data/sft_dataset/{train,val,test}.jsonl` + `data/reports/sft_dataset_report.json`

7) 评测集与推理（可选）  
评测集通常基于 `requests.jsonl` 与 `sft_dataset/train.jsonl` 构建，输出到 `data/eval/`  
→ `scripts/infer_transformers.py` 用于对 `data/eval/prompts_eval.jsonl` 进行本地模型推理生成。

## 外部依赖（来自 stage0）
- `stage0/data/prompt_seeds/prompt_seeds.jsonl`: 蒸馏请求的 prompt 种子。
- `stage0/data/api_index/phaser_api.jsonl`: API 检索索引。
- `stage0/validator/src/cli.js`: validator CLI，用于 L1/L4 过滤。
