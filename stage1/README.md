# Stage 1: SFT 冷启动

本目录包含 SFT（监督微调）冷启动阶段的所有脚本和配置。

## 快速开始

### 1. 前置检查

确保 stage0 已完成：

```bash
# 检查 API 索引
wc -l ../stage0/data/api_index/phaser_api.jsonl

# 检查 Prompt 种子库
wc -l ../stage0/data/prompt_seeds/prompt_seeds.jsonl

# 检查 validator
node ../stage0/validator/src/cli.js --help
```

### 2. 运行管线

#### 步骤 1: 构建蒸馏请求

```bash
cd scripts
python build_distill_requests.py
```

#### 步骤 2: 运行教师蒸馏（Mock 测试）

```bash
# 使用 Mock 脚本测试管线
python run_teacher_mock.py --max-items 100

# 实际蒸馏请替换为真实 API 调用
```

#### 步骤 3: 解析教师输出

```bash
python parse_teacher_outputs.py
```

#### 步骤 4: 运行 L1-L4 过滤

```bash
python run_validator_filter.py

# 跳过运行时验证（如果 HEADLESS 不稳定）
python run_validator_filter.py --skip-runtime
```

#### 步骤 5: 多样性筛选

```bash
python select_best.py
```

#### 步骤 6: 构建 SFT 数据集

```bash
python build_sft_dataset.py
```

### 3. 训练

使用 LLaMA-Factory 进行 SFT 训练：

```bash
pip install llama-factory
llamafactory-cli train configs/sft_config_example.yaml
```

## 目录结构

```
stage1/
├── configs/
│   └── sft_config_example.yaml    # LLaMA-Factory 配置
├── data/
│   ├── sft_distill/               # 蒸馏数据
│   ├── sft_official/              # 官方/开源数据
│   ├── sft_dataset/               # 最终数据集
│   └── reports/                   # 过滤报告
├── prompts/
│   └── teacher_system_prompt.txt  # 教师系统提示词
├── scripts/
│   ├── common.py                  # 公共工具
│   ├── api_bm25.py               # API 检索
│   ├── build_distill_requests.py  # 构建请求
│   ├── run_teacher_mock.py        # Mock 蒸馏
│   ├── parse_teacher_outputs.py   # 解析输出
│   ├── run_validator_filter.py    # L1-L4 过滤
│   ├── select_best.py            # L5 筛选
│   └── build_sft_dataset.py      # 构建数据集
└── README.md
```

## 数据流

```
Prompt 种子库 (2000)
    │
    ├─> 构建蒸馏请求 (build_distill_requests.py)
    │
    ├─> 教师模型蒸馏 (6000 条候选)
    │
    ├─> 解析输出 (parse_teacher_outputs.py)
    │
    ├─> L1-L4 过滤 (run_validator_filter.py)
    │
    ├─> L5 多样性筛选 (select_best.py) → ~3500 条
    │
    ├─> 整合官方数据 → ~4500 条
    │
    └─> SFT 数据集 (build_sft_dataset.py)
        ├── train.jsonl (90%)
        ├── val.jsonl (5%)
        └── test.jsonl (5%)
```

## 详细文档

参见项目根目录的 `阶段一-SFT冷启动-详细实施文档.md`。  
本目录脚本与数据流的实现细节说明见：`DETAILS.md`。
