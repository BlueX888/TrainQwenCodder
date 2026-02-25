# 使用 Claude API 进行教师蒸馏指南

## 快速开始

### 1. 安装依赖

```bash
pip install anthropic
```

### 2. 获取 API Key

访问 [Anthropic Console](https://console.anthropic.com/) 获取 API Key。

### 3. 设置 API Key

**方法 1：环境变量（推荐）**

```bash
export ANTHROPIC_API_KEY='sk-ant-xxxxx'
```

**方法 2：命令行参数**

```bash
python scripts/run_teacher_claude.py --api-key sk-ant-xxxxx
```

### 4. 测试运行（10 条）

```bash
cd stage1/scripts
python run_teacher_claude.py --max-items 10
```

### 5. 完整运行（6000 条）

```bash
python run_teacher_claude.py
```

## 完整流程

```bash
# 1. 安装依赖
pip install anthropic

# 2. 设置 API Key
export ANTHROPIC_API_KEY='sk-ant-xxxxx'

# 3. 测试运行（10 条）
cd stage1/scripts
python run_teacher_claude.py --max-items 10

# 4. 检查输出
wc -l ../data/sft_distill/raw_outputs_claude.jsonl
head -1 ../data/sft_distill/raw_outputs_claude.jsonl | jq .

# 5. 如果测试通过，运行完整蒸馏
python run_teacher_claude.py --concurrency 8 --rate-limit-delay 0.5

# 6. 后续步骤保持不变
python parse_teacher_outputs.py --input ../data/sft_distill/raw_outputs_claude.jsonl
python run_validator_filter.py --workers 100
python select_best.py
python build_sft_dataset.py
```

## 下一步

完成 Claude API 蒸馏后，继续执行：

```bash
# 解析输出
python parse_teacher_outputs.py --input ../data/sft_distill/raw_outputs_claude.jsonl

# 后续步骤保持不变
python run_validator_filter.py
python select_best.py
python build_sft_dataset.py
```
