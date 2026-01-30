# dataset/

放置 SFT 数据集（JSONL），需要包含：

- `train.jsonl`
- `val.jsonl`（可选；不提供则训练时不做 eval）
- `test.jsonl`（可选；用于推理脚本取样）

每行样本字段与 `stage1/scripts/build_sft_dataset.py` 一致：

- `instruction`: string
- `input`: string
- `output`: string
- `metadata`: object

