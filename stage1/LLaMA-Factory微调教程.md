# 使用 LLaMA-Factory 微调 Qwen2.5-Coder-0.5B 教程

本教程将指导您使用 LLaMA-Factory 框架，基于 31 条测试数据集微调 Qwen2.5-Coder-0.5B 模型，使其学会生成 Phaser3 游戏代码。

> **⚠️ 重要说明**：本教程使用 **31 条测试数据集**（train: 29, val: 1, test: 1），仅用于**验证训练流程**。完整训练请使用 3000+ 条的完整数据集。

---

## 目录

- [一、环境准备](#一环境准备)
- [二、数据集准备](#二数据集准备)
- [三、配置训练参数](#三配置训练参数)
- [四、执行训练](#四执行训练)
- [五、模型推理测试](#五模型推理测试)
- [六、进阶使用](#六进阶使用)
- [七、常见问题](#七常见问题)
- [附录](#附录)

---

## 一、环境准备

### 1.1 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| **Python** | 3.10+ | 3.10 / 3.11 |
| **CUDA** | 11.8+ (GPU) | 12.1+ |
| **内存** | 8GB RAM | 16GB+ RAM |
| **磁盘** | 10GB | 20GB+ |
| **GPU** | 可选 (CPU可训练) | RTX 3060+ / V100+ |

### 1.2 安装 LLaMA-Factory

#### 方法一：使用 pip 安装（推荐）

```bash
# 创建虚拟环境（推荐）
conda create -n llama_factory python=3.10
conda activate llama_factory

# 或使用 venv
python -m venv llama_factory_env
source llama_factory_env/bin/activate  # Linux/Mac
# llama_factory_env\Scripts\activate  # Windows

# 安装 LLaMA-Factory
pip install llama factory
```

#### 方法二：从源码安装（开发或最新功能）

```bash
# 克隆仓库
git clone https://github.com/hiyouga/LLaMA-Factory.git
cd LLaMA-Factory

# 安装依赖
pip install -e ".[torch,metrics]"

# GPU 版本（如果有 CUDA）
pip install -e ".[torch-cu121,metrics]"  # CUDA 12.1
# 或
pip install -e ".[torch-cu118,metrics]"  # CUDA 11.8
```

### 1.3 验证安装

```bash
# 检查 LLaMA-Factory 版本
llamafactory-cli version

# 预期输出类似：
# LLaMA-Factory version: 0.x.x

# 检查关键依赖
python -c "import transformers, datasets, torch; print(f'transformers: {transformers.__version__}, datasets: {datasets.__version__}, torch: {torch.__version__}')"

# 预期输出类似：
# transformers: 4.42.0, datasets: 2.19.0, torch: 2.3.0

# 检查 GPU 可用性（如果有 GPU）
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}, Device count: {torch.cuda.device_count()}')"

# 预期输出类似：
# CUDA available: True, Device count: 1
```

如果所有命令都正常执行，说明环境搭建成功！

---

## 二、数据集准备

### 2.1 测试数据集概览

本教程使用的测试数据集位于：

```
stage1/data/sft_dataset_test/
├── train.jsonl    # 29 条训练样本
├── val.jsonl      # 1 条验证样本
└── test.jsonl     # 1 条测试样本
```

**数据集特点**：
- **总样本数**: 31 条
- **任务类型**: Phaser3 游戏代码生成
- **输出格式**: [PLAN] + JavaScript 代码
- **质量评分**: 0.64-0.71 (经过 5 层过滤)
- **难度**: 主要为 easy 级别

**重要提示**：
- ✅ 适合：验证训练流程是否正常
- ❌ 不适合：获得高质量生产模型（数据量太少）
- ⚠️ 必然过拟合：这是正常现象，说明模型在学习

### 2.2 数据集格式

每条样本包含 4 个字段：

```json
{
  "instruction": "你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。\n\n输出格式要求：\n1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤\n2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）\n3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期",

  "input": "任务: 使用 WASD 键控制一个方块移动，速度为 240 像素/秒。\n\n难度: 基础\n\n约束:\n- 使用 Phaser3\n- 不得依赖外部资源\n- 必须包含 preload/create 生命周期\n\n必须使用的 API:\n- Phaser.Input.Keyboard.KeyCodes\n- Phaser.GameObjects.Graphics",

  "output": "[PLAN]\nREQ: 使用 WASD 键控制方块以 240 像素/秒的速度移动\nAPI: this.add.graphics(), this.input.keyboard.addKey(), Phaser.Input.Keyboard.KeyCodes\nSTEPS:\n1. 创建 Graphics 对象并绘制方块纹理\n2. 使用 addKey 绑定 WASD 四个按键\n3. 在 update 中检测按键状态并更新位置\n[/PLAN]\n\n```javascript\nconst config = {\n  type: Phaser.AUTO,\n  width: 800,\n  height: 600,\n  scene: { preload, create, update }\n};\n\nlet player;\nconst SPEED = 240;\n\nfunction preload() {\n  const graphics = this.add.graphics();\n  graphics.fillStyle(0x00ff00, 1);\n  graphics.fillRect(0, 0, 50, 50);\n  graphics.generateTexture('playerBox', 50, 50);\n  graphics.destroy();\n}\n\nfunction create() {\n  player = this.add.sprite(400, 300, 'playerBox');\n  this.keys = this.input.keyboard.addKeys('W,A,S,D');\n}\n\nfunction update(time, delta) {\n  const moveDistance = SPEED * (delta / 1000);\n  if (this.keys.W.isDown) player.y -= moveDistance;\n  if (this.keys.S.isDown) player.y += moveDistance;\n  if (this.keys.A.isDown) player.x -= moveDistance;\n  if (this.keys.D.isDown) player.x += moveDistance;\n}\n\nnew Phaser.Game(config);\n```",

  "metadata": {
    "id": "distill_seed_000004_v1",
    "prompt_id": "seed_000004",
    "source": "distill",
    "difficulty": "easy",
    "modules": ["Scene", "GameObjects", "Input"],
    "quality_score": 0.64
  }
}
```

### 2.3 数据集注册方法

LLaMA-Factory 支持两种数据集加载方式：

#### 方法一：直接路径（推荐用于测试）

在配置文件中直接指定数据集目录：

```yaml
dataset_dir: /Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset_test
```

**优点**：
- ✅ 无需修改 LLaMA-Factory 代码
- ✅ 灵活切换不同数据集
- ✅ 适合测试和实验

#### 方法二：注册到 dataset_info.json（用于生产）

编辑 LLaMA-Factory 的 `data/dataset_info.json`：

```json
{
  "phaser3_sft_test": {
    "file_name": "/Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset_test/train.jsonl",
    "columns": {
      "prompt": "instruction",
      "query": "input",
      "response": "output"
    }
  }
}
```

然后在配置文件中引用：

```yaml
dataset: phaser3_sft_test
```

**优点**：
- ✅ 便于管理多个数据集
- ✅ 配置文件更简洁
- ✅ 适合生产环境

**本教程使用方法一**（直接路径）。

---

## 三、配置训练参数

### 3.1 创建测试配置文件

测试配置文件已创建：`stage1/configs/sft_config_test.yaml`

查看配置文件：

```bash
cat stage1/configs/sft_config_test.yaml
```

### 3.2 关键参数说明

#### 模型参数

```yaml
model_name_or_path: Qwen/Qwen2.5-Coder-0.5B
```
- 使用 Qwen2.5-Coder-0.5B 作为基础模型
- 首次运行会自动从 Hugging Face 下载（约 1GB）
- 也可使用 ModelScope: `--model_hub modelscope`

#### LoRA 参数

```yaml
finetuning_type: lora
lora_rank: 32          # LoRA 秩（参数量）
lora_alpha: 64         # 缩放因子（alpha/rank = 2.0）
lora_dropout: 0.1      # Dropout 比例
```

**针对小数据集的优化**：
- `lora_rank: 32` ← 从 64 降低（减少参数，防止过拟合）
- `lora_dropout: 0.1` ← 从 0.05 增加（更强的正则化）

#### 训练超参数

```yaml
per_device_train_batch_size: 2       # 每设备批量大小
gradient_accumulation_steps: 2       # 梯度累积步数
# 有效 batch size = 2 × 2 = 4

learning_rate: 3.0e-5                # 学习率
num_train_epochs: 5                  # 训练轮数
lr_scheduler_type: cosine            # 学习率调度器
warmup_steps: 10                     # 预热步数
```

**针对小数据集的优化**：
- `batch_size: 2` ← 从 4 降低（适配小数据集）
- `learning_rate: 3.0e-5` ← 从 5.0e-5 降低（更稳定）
- `num_train_epochs: 5` ← 从 3 增加（数据少需要更多轮次）
- `warmup_steps: 10` ← 固定步数（小数据集不适合比例）

#### 数据集配置

```yaml
dataset_dir: /Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset_test
template: qwen                       # 使用 Qwen 的 prompt 模板
cutoff_len: 2048                     # 最大序列长度
val_size: 0.0                        # 使用独立的 val.jsonl
```

#### 输出配置

```yaml
output_dir: stage1/outputs/qwen_coder_0.5b_sft_test
logging_steps: 5                     # 每 5 步记录日志
save_steps: 50                       # 每 50 步保存检查点
eval_steps: 20                       # 每 20 步评估一次
```

### 3.3 小数据集特殊配置

为什么要针对小数据集调整参数？

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **过拟合** | 数据太少，模型容易记住训练集 | ↑ dropout, ↓ rank, ↓ lr, ↑ epochs |
| **训练不稳定** | 小批量导致梯度波动大 | ↓ lr, 固定 warmup 步数 |
| **评估不准** | 验证集只有 1 条样本 | 使用 train loss 作为主要指标 |

---

## 四、执行训练

### 4.1 预训练检查

在开始训练前，先进行几项检查：

#### 检查 1：验证数据集加载

```bash
cd /Users/admin/Desktop/TrainQwenCodder/stage1

# 检查数据集文件是否存在
ls -lh data/sft_dataset_test/

# 预期输出：
# train.jsonl (97KB, 29 条)
# val.jsonl (2.9KB, 1 条)
# test.jsonl (2.5KB, 1 条)

# 查看样本数量
wc -l data/sft_dataset_test/*.jsonl

# 预期输出：
#   29 data/sft_dataset_test/train.jsonl
#    1 data/sft_dataset_test/val.jsonl
#    1 data/sft_dataset_test/test.jsonl
```

#### 检查 2：验证配置文件

```bash
# 检查配置文件语法
python -c "import yaml; yaml.safe_load(open('configs/sft_config_test.yaml'))"

# 无输出表示语法正确
# 如有错误会显示具体行号
```

#### 检查 3：测试数据加载（可选）

```bash
# 使用 LLaMA-Factory 的数据预览功能
llamafactory-cli data-preview \
  --dataset_dir data/sft_dataset_test \
  --template qwen \
  --max_samples 2

# 预期输出：显示前 2 条样本的格式化内容
```

### 4.2 启动训练

确认检查通过后，开始训练：

#### 方法一：使用 CLI（推荐）

```bash
cd /Users/admin/Desktop/TrainQwenCodder/stage1

# 启动训练
llamafactory-cli train configs/sft_config_test.yaml

# 如果使用 ModelScope（中国大陆用户）
llamafactory-cli train configs/sft_config_test.yaml \
  --model_hub modelscope
```

#### 方法二：使用 Python API

创建训练脚本 `train.py`：

```python
from llamafactory.train import run_exp

def main():
    # 训练参数
    args = dict(
        stage="sft",
        do_train=True,
        model_name_or_path="Qwen/Qwen2.5-Coder-0.5B",
        dataset_dir="/Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset_test",
        template="qwen",
        finetuning_type="lora",
        lora_target="all",
        lora_rank=32,
        lora_alpha=64,
        output_dir="stage1/outputs/qwen_coder_0.5b_sft_test",
        per_device_train_batch_size=2,
        gradient_accumulation_steps=2,
        learning_rate=3.0e-5,
        num_train_epochs=5,
        logging_steps=5,
        save_steps=50,
        bf16=True,
    )

    run_exp(args)

if __name__ == "__main__":
    main()
```

运行：

```bash
python train.py
```

### 4.3 监控训练过程

#### 查看实时日志

训练开始后会看到类似输出：

```
[INFO] Loading model from Qwen/Qwen2.5-Coder-0.5B...
[INFO] Loading dataset from data/sft_dataset_test...
[INFO] Found 29 training samples, 1 validation samples
[INFO] Starting training...

{'loss': 2.3456, 'learning_rate': 1.5e-5, 'epoch': 0.17}  # Step 5
{'loss': 2.1234, 'learning_rate': 2.8e-5, 'epoch': 0.34}  # Step 10
{'loss': 1.8901, 'learning_rate': 3.0e-5, 'epoch': 0.52}  # Step 15
...
{'eval_loss': 1.5678, 'epoch': 1.0}                        # Epoch 1 完成
```

**关键指标**：
- `loss`: 训练损失（期望逐步下降）
- `eval_loss`: 验证损失（参考意义有限，因为只有 1 条样本）
- `learning_rate`: 当前学习率
- `epoch`: 当前训练轮次

#### 使用 TensorBoard 可视化（可选）

```bash
# 启动 TensorBoard
tensorboard --logdir=stage1/outputs/qwen_coder_0.5b_sft_test

# 在浏览器打开：http://localhost:6006
```

可以看到：
- Loss 曲线
- Learning rate 变化
- 梯度统计
- 训练速度

#### 查看检查点

训练过程中会定期保存检查点：

```bash
ls -lh stage1/outputs/qwen_coder_0.5b_sft_test/

# 预期文件结构：
# checkpoint-50/          # Step 50 的检查点
# checkpoint-100/         # Step 100 的检查点
# trainer_log.jsonl       # 训练日志
# training_args.bin       # 训练参数
```

### 4.4 预期训练时间

根据硬件配置，训练时间大致如下：

| 硬件配置 | 预期时间 | 备注 |
|---------|---------|------|
| **CPU (8核)** | ~1-2 小时 | 可用但较慢 |
| **RTX 3060 (12GB)** | ~15-20 分钟 | 推荐 |
| **RTX 4090 (24GB)** | ~8-10 分钟 | 快速 |
| **V100 (32GB)** | ~10-15 分钟 | 云端推荐 |
| **A100 (40GB)** | ~5-8 分钟 | 最快 |

**完整训练（5 epochs）大约需要**：
- **总步数**: 29 samples × 5 epochs / 4 (effective batch) ≈ 36 steps
- **评估次数**: 36 / 20 = 2 次
- **检查点**: 0 个（步数未达到 50）

---

## 五、模型推理测试

训练完成后，测试微调后的模型是否能生成正确的 Phaser3 代码。

### 5.1 加载微调模型

#### 方法一：使用 LLaMA-Factory CLI（推荐）

```bash
# 启动交互式 CLI
llamafactory-cli chat \
  --model_name_or_path Qwen/Qwen2.5-Coder-0.5B \
  --adapter_name_or_path stage1/outputs/qwen_coder_0.5b_sft_test \
  --template qwen

# 进入交互模式后，输入测试 prompt
```

#### 方法二：使用 Python API

创建推理脚本 `inference.py`：

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch

def load_model(base_model_path, adapter_path):
    """加载 base 模型和 LoRA adapter"""

    # 加载 tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        base_model_path,
        trust_remote_code=True
    )

    # 加载 base 模型
    model = AutoModelForCausalLM.from_pretrained(
        base_model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True
    )

    # 加载 LoRA adapter
    model = PeftModel.from_pretrained(model, adapter_path)
    model = model.merge_and_unload()  # 合并 LoRA 权重

    return tokenizer, model

def generate_code(tokenizer, model, prompt, max_length=2048):
    """生成 Phaser3 代码"""

    # 构建完整 prompt（包含 instruction）
    instruction = """你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。

输出格式要求：
1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤
2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）
3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期"""

    full_prompt = f"{instruction}\n\n{prompt}"

    # Tokenize
    inputs = tokenizer(full_prompt, return_tensors="pt").to(model.device)

    # 生成
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    # 解码
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # 移除 prompt 部分，只返回生成的内容
    response = generated_text[len(full_prompt):].strip()

    return response

# 主函数
if __name__ == "__main__":
    # 加载模型
    print("Loading model...")
    tokenizer, model = load_model(
        base_model_path="Qwen/Qwen2.5-Coder-0.5B",
        adapter_path="stage1/outputs/qwen_coder_0.5b_sft_test"
    )
    print("Model loaded successfully!\n")

    # 测试 prompt
    test_prompt = """任务: 创建一个红色圆形，点击后变成蓝色。

难度: 基础

约束:
- 使用 Phaser3
- 不得依赖外部资源
- 必须包含 preload/create 生命周期

必须使用的 API:
- Phaser.GameObjects.Graphics
- Phaser.Input.Events.POINTER_DOWN"""

    # 生成代码
    print("Generating code...\n")
    response = generate_code(tokenizer, model, test_prompt)

    print("=" * 60)
    print("Generated Output:")
    print("=" * 60)
    print(response)
```

运行推理：

```bash
python inference.py
```

### 5.2 测试代码生成

#### 测试 Prompt 1：基础交互

```
任务: 创建一个红色圆形，点击后变成蓝色。

难度: 基础

约束:
- 使用 Phaser3
- 不得依赖外部资源
- 必须包含 preload/create 生命周期

必须使用的 API:
- Phaser.GameObjects.Graphics
- Phaser.Input.Events.POINTER_DOWN
```

**期望输出**：
- ✅ 包含 `[PLAN]...[/PLAN]` 块
- ✅ 包含完整的 JavaScript 代码
- ✅ 代码包含 `preload`, `create`, `new Phaser.Game`
- ✅ 使用了 Graphics 和事件监听

#### 测试 Prompt 2：键盘控制

```
任务: 使用方向键控制一个绿色方块移动。

难度: 基础

约束:
- 使用 Phaser3
- 不得依赖外部资源
- 必须包含 preload/create/update 生命周期

必须使用的 API:
- Phaser.Input.Keyboard.createCursorKeys
- Phaser.GameObjects.Graphics
```

**期望输出**：
- ✅ 包含 `update` 方法
- ✅ 使用 `createCursorKeys()`
- ✅ 在 update 中检测按键状态

#### 测试 Prompt 3：动画效果

```
任务: 创建一个圆形，以每秒 90 度的速度持续旋转。

难度: 基础

约束:
- 使用 Phaser3
- 不得依赖外部资源
- 必须包含 preload/create/update 生命周期

必须使用的 API:
- Phaser.GameObjects.Graphics
- Phaser.Math.DegToRad
```

**期望输出**：
- ✅ 在 update 中更新 rotation
- ✅ 使用 `delta` 时间实现平滑旋转
- ✅ 使用 `DegToRad` 转换角度

### 5.3 对比微调前后

#### Base 模型 (微调前)

**问题**：
- ❌ 可能不输出 [PLAN] 格式
- ❌ 代码结构可能不完整
- ❌ 可能包含错误的 API 调用
- ❌ 格式不规范

#### Fine-tuned 模型 (微调后)

**改进**：
- ✅ 稳定输出 [PLAN] 格式
- ✅ 代码结构完整（preload/create/update）
- ✅ API 使用正确
- ✅ 符合 Phaser3 规范

**评估标准**：

| 维度 | 权重 | 检查点 |
|------|------|--------|
| **格式正确** | 30% | [PLAN] 块 + ```javascript 代码块 |
| **结构完整** | 25% | preload/create/(update) + new Phaser.Game |
| **API 正确** | 25% | 使用了 must_use_apis |
| **代码可运行** | 20% | 语法正确，逻辑合理 |

---

## 六、进阶使用

### 6.1 使用完整数据集

测试流程验证通过后，切换到完整数据集：

#### 步骤 1：生成完整数据集

```bash
cd /Users/admin/Desktop/TrainQwenCodder/stage1/scripts

# 生成 6000 条蒸馏请求（如果还没有）
python build_distill_requests.py

# 使用 Claude API 生成数据（~$95, 3-4 小时）
python run_teacher_claude.py

# 解析输出
python parse_teacher_outputs.py

# L1-L4 验证
python run_validator_filter.py

# L5 多样性筛选
python select_best.py

# 构建最终数据集
python build_sft_dataset.py
```

预期生成：
- `train.jsonl`: ~2964 条
- `val.jsonl`: ~163 条
- `test.jsonl`: ~163 条

#### 步骤 2：修改配置文件

复制并修改配置：

```bash
cp configs/sft_config_test.yaml configs/sft_config_full.yaml
```

修改 `sft_config_full.yaml`：

```yaml
### Dataset
dataset_dir: /Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset  # 改为完整数据集

### LoRA Parameters (恢复为原始值)
lora_rank: 64          # 从 32 增加到 64
lora_alpha: 128        # 从 64 增加到 128
lora_dropout: 0.05     # 从 0.1 降低到 0.05

### Train (恢复为原始值)
per_device_train_batch_size: 4      # 从 2 增加到 4
gradient_accumulation_steps: 4      # 从 2 增加到 4
learning_rate: 5.0e-5                # 从 3.0e-5 增加到 5.0e-5
num_train_epochs: 3                  # 从 5 降低到 3
warmup_ratio: 0.1                    # 使用比例而非固定步数

### Output
output_dir: stage1/outputs/qwen_coder_0.5b_sft_full
logging_steps: 10
save_steps: 500
eval_steps: 500
```

#### 步骤 3：启动完整训练

```bash
llamafactory-cli train configs/sft_config_full.yaml
```

**预期训练时间**：
- GPU (单卡): ~2-3 小时
- GPU (多卡): ~1-1.5 小时

### 6.2 超参数调优

如果模型效果不理想，可以尝试调整以下参数：

#### Learning Rate

```yaml
learning_rate: 5.0e-5   # 默认值

# 如果训练不稳定（loss 波动大）
learning_rate: 3.0e-5   # 降低

# 如果收敛太慢
learning_rate: 8.0e-5   # 提高（谨慎）
```

#### LoRA Rank

```yaml
lora_rank: 64           # 默认值

# 如果过拟合
lora_rank: 32           # 降低参数量

# 如果欠拟合
lora_rank: 128          # 增加表达能力
```

#### Batch Size

```yaml
per_device_train_batch_size: 4
gradient_accumulation_steps: 4
# 有效 batch size = 16

# GPU 内存不足
per_device_train_batch_size: 2
gradient_accumulation_steps: 8
# 保持有效 batch size = 16

# GPU 内存充足
per_device_train_batch_size: 8
gradient_accumulation_steps: 2
# 有效 batch size = 16，训练更快
```

#### Epochs

```yaml
num_train_epochs: 3     # 默认值

# 如果欠拟合
num_train_epochs: 5

# 如果过拟合
num_train_epochs: 2
```

### 6.3 多 GPU 训练

如果有多张 GPU，可以使用 DeepSpeed 或 DDP 加速训练。

#### 方法一：使用 DeepSpeed（推荐）

创建 DeepSpeed 配置 `ds_config_zero2.json`：

```json
{
  "train_batch_size": "auto",
  "train_micro_batch_size_per_gpu": "auto",
  "gradient_accumulation_steps": "auto",
  "gradient_clipping": 1.0,
  "zero_optimization": {
    "stage": 2,
    "allgather_partitions": true,
    "allgather_bucket_size": 5e8,
    "reduce_scatter": true,
    "reduce_bucket_size": 5e8,
    "overlap_comm": false,
    "contiguous_gradients": true
  },
  "fp16": {
    "enabled": false
  },
  "bf16": {
    "enabled": true
  }
}
```

修改训练配置：

```yaml
# 在 sft_config_full.yaml 中添加
deepspeed: configs/ds_config_zero2.json
```

启动训练：

```bash
# 自动检测所有 GPU
llamafactory-cli train configs/sft_config_full.yaml

# 或指定 GPU 数量
CUDA_VISIBLE_DEVICES=0,1,2,3 llamafactory-cli train configs/sft_config_full.yaml
```

#### 方法二：使用 DDP（简单）

```bash
# 使用 torchrun（PyTorch 内置）
torchrun --nproc_per_node=4 \
  -m llamafactory.train configs/sft_config_full.yaml
```

**性能对比**：

| GPU 数量 | 单卡 | 2 卡 (DDP) | 4 卡 (DeepSpeed) |
|---------|------|------------|------------------|
| 训练时间 | 2.5h | 1.3h (1.9x) | 0.7h (3.6x) |
| 显存占用 | 12GB | 12GB × 2 | 8GB × 4 |

---

## 七、常见问题

### 7.1 安装问题

#### Q1: `llamafactory-cli: command not found`

**原因**: LLaMA-Factory 未正确安装或不在 PATH 中

**解决方案**:

```bash
# 检查安装
pip show llama-factory

# 如果未安装
pip install llama-factory

# 如果安装了但找不到命令
which llamafactory-cli

# 确保 Python 的 bin 目录在 PATH 中
export PATH="$HOME/.local/bin:$PATH"  # Linux/Mac
# 或
export PATH="$HOME/anaconda3/bin:$PATH"
```

#### Q2: CUDA 版本不匹配

**错误信息**:
```
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

**原因**: PyTorch 的 CUDA 版本与系统 CUDA 不匹配

**解决方案**:

```bash
# 检查系统 CUDA 版本
nvidia-smi

# 重新安装匹配的 PyTorch
pip uninstall torch torchvision torchaudio

# CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### Q3: Transformers 版本冲突

**错误信息**:
```
ImportError: cannot import name 'XXX' from 'transformers'
```

**解决方案**:

```bash
# 安装推荐版本
pip install transformers==4.42.0 datasets==2.19.0 accelerate==0.30.0

# 或使用最新版本
pip install --upgrade transformers datasets accelerate
```

### 7.2 训练问题

#### Q1: CUDA Out of Memory (OOM)

**错误信息**:
```
RuntimeError: CUDA out of memory. Tried to allocate XXX MiB
```

**解决方案**:

1. **降低 batch size**:
```yaml
per_device_train_batch_size: 1  # 从 2 降到 1
```

2. **使用梯度检查点**:
```yaml
gradient_checkpointing: true
```

3. **使用量化**:
```yaml
quantization_bit: 4
quantization_method: bitsandbytes
```

4. **使用 DeepSpeed ZeRO**:
```yaml
deepspeed: configs/ds_config_zero3.json  # Stage 3 更省显存
```

5. **使用 CPU offload**:
```yaml
# 在 DeepSpeed 配置中添加
"zero_optimization": {
  "stage": 3,
  "offload_optimizer": {
    "device": "cpu"
  },
  "offload_param": {
    "device": "cpu"
  }
}
```

#### Q2: Loss 不下降或训练不收敛

**症状**: Loss 停留在高位（如 2.5+）或波动剧烈

**可能原因**:
1. Learning rate 太高
2. Batch size 太小
3. Warmup 不足
4. 数据质量问题

**解决方案**:

1. **降低 learning rate**:
```yaml
learning_rate: 3.0e-5  # 从 5.0e-5 降低
```

2. **增加 batch size**:
```yaml
per_device_train_batch_size: 4
gradient_accumulation_steps: 8
# 有效 batch size = 32
```

3. **增加 warmup**:
```yaml
warmup_ratio: 0.2  # 从 0.1 增加到 0.2
```

4. **检查数据质量**:
```bash
# 查看样本
head -5 data/sft_dataset_test/train.jsonl | python -m json.tool
```

#### Q3: 过拟合（Train Loss 很低但 Val Loss 很高）

**症状**: Train loss < 0.5，但 val loss > 1.5

**解决方案**:

1. **增加 dropout**:
```yaml
lora_dropout: 0.1  # 从 0.05 增加
```

2. **降低 LoRA rank**:
```yaml
lora_rank: 32  # 从 64 降低
```

3. **减少 epochs**:
```yaml
num_train_epochs: 2  # 从 3 降低
```

4. **使用更多数据**（最根本的解决方案）

#### Q4: 训练速度太慢

**解决方案**:

1. **使用 bf16/fp16**:
```yaml
bf16: true  # 如果 GPU 支持（Ampere 及以上）
# 或
fp16: true  # 旧版 GPU
```

2. **增加 batch size**:
```yaml
per_device_train_batch_size: 8  # 如果显存允许
```

3. **减少 logging**:
```yaml
logging_steps: 50  # 从 5 增加
```

4. **使用多 GPU**（见 6.3 节）

5. **使用 Flash Attention**:
```bash
pip install flash-attn --no-build-isolation
```

```yaml
use_flash_attention: true
```

### 7.3 推理问题

#### Q1: 模型加载失败

**错误信息**:
```
OSError: Unable to load weights from pytorch model file
```

**解决方案**:

```bash
# 检查检查点目录
ls -lh stage1/outputs/qwen_coder_0.5b_sft_test/

# 应该包含：
# adapter_config.json
# adapter_model.bin (或 adapter_model.safetensors)

# 如果缺失，训练可能未完成，使用最新的检查点
ls -lh stage1/outputs/qwen_coder_0.5b_sft_test/checkpoint-*/
```

#### Q2: 生成质量很差

**症状**:
- 不输出 [PLAN]
- 代码不完整
- 语法错误

**可能原因**:
1. 训练数据太少（31 条）→ 使用完整数据集
2. 训练不足 → 增加 epochs
3. 推理参数不当

**解决方案**:

1. **调整生成参数**:
```python
outputs = model.generate(
    **inputs,
    max_length=2048,        # 确保足够长
    temperature=0.7,        # 降低到 0.5-0.7（更确定）
    top_p=0.9,              # 或使用 top_k=50
    do_sample=True,         # 启用采样
    num_beams=1,            # Beam search（可选，更慢但更好）
    repetition_penalty=1.1  # 防止重复
)
```

2. **检查 prompt 格式**:
```python
# 确保包含 instruction
full_prompt = f"{instruction}\n\n{user_input}"
```

3. **使用完整数据集训练**（见 6.1 节）

#### Q3: 推理速度太慢

**解决方案**:

1. **使用量化**:
```python
model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    load_in_4bit=True,      # 4-bit 量化
    device_map="auto"
)
```

2. **使用 Flash Attention**:
```python
model = AutoModelForCausalLM.from_pretrained(
    base_model_path,
    attn_implementation="flash_attention_2"
)
```

3. **批量推理**:
```python
# 一次处理多个 prompt
inputs = tokenizer(prompts, return_tensors="pt", padding=True)
outputs = model.generate(**inputs, ...)
```

---

## 附录

### A. 完整配置文件示例

**sft_config_test.yaml**（测试配置）:

```yaml
# LLaMA-Factory SFT 测试配置文件
model_name_or_path: Qwen/Qwen2.5-Coder-0.5B

### Method
stage: sft
do_train: true
finetuning_type: lora
lora_target: all
lora_rank: 32
lora_alpha: 64
lora_dropout: 0.1

### Dataset
dataset_dir: /Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset_test
template: qwen
cutoff_len: 2048
overwrite_cache: true
preprocessing_num_workers: 4

### Output
output_dir: stage1/outputs/qwen_coder_0.5b_sft_test
logging_steps: 5
save_steps: 50
save_total_limit: 2
plot_loss: true
overwrite_output_dir: true

### Train
per_device_train_batch_size: 2
gradient_accumulation_steps: 2
learning_rate: 3.0e-5
num_train_epochs: 5
lr_scheduler_type: cosine
warmup_steps: 10
bf16: true
ddp_timeout: 180000000

### Eval
val_size: 0.0
per_device_eval_batch_size: 1
eval_strategy: steps
eval_steps: 20
```

**sft_config_full.yaml**（完整配置）:

```yaml
# LLaMA-Factory SFT 完整配置文件
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
dataset_dir: /Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_dataset
template: qwen
cutoff_len: 2048
max_samples: 10000
overwrite_cache: true
preprocessing_num_workers: 16

### Output
output_dir: stage1/outputs/qwen_coder_0.5b_sft_full
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
ddp_timeout: 180000000

### Eval
val_size: 0.05
per_device_eval_batch_size: 4
eval_strategy: steps
eval_steps: 500
```

### B. 数据集字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| **instruction** | String | ✅ | 系统指令，定义模型角色和输出格式 |
| **input** | String | ✅ | 用户输入，包含任务描述和约束 |
| **output** | String | ✅ | 期望输出，包含 [PLAN] 和代码 |
| **metadata** | Object | ❌ | 元数据，用于追溯和质量控制 |

**metadata 子字段**:

| 子字段 | 类型 | 说明 |
|--------|------|------|
| `id` | String | 唯一标识符 |
| `prompt_id` | String | 原始 Prompt ID |
| `source` | String | 数据来源（distill/official） |
| `difficulty` | String | 难度（easy/medium/hard） |
| `modules` | Array | 涉及的 Phaser3 模块 |
| `quality_score` | Float | 质量评分（0-1） |

### C. 参考资源

#### LLaMA-Factory

- **GitHub**: https://github.com/hiyouga/LLaMA-Factory
- **文档**: https://github.com/hiyouga/LLaMA-Factory/wiki
- **中文教程**: https://github.com/hiyouga/LLaMA-Factory/blob/main/README_zh.md

#### Qwen 模型

- **模型卡片**: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- **官方文档**: https://qwen.readthedocs.io/
- **GitHub**: https://github.com/QwenLM/Qwen

#### Phaser3

- **官方文档**: https://photonstorm.github.io/phaser3-docs/
- **API 参考**: https://newdocs.phaser.io/docs/3.80.0
- **示例**: https://phaser.io/examples

#### LoRA 微调

- **论文**: [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- **PEFT 库**: https://github.com/huggingface/peft
- **教程**: https://huggingface.co/docs/peft/index

---

## 总结

恭喜！您已经完成了使用 LLaMA-Factory 微调 Qwen2.5-Coder-0.5B 模型的完整流程。

**您学到了**：
1. ✅ 安装和配置 LLaMA-Factory 环境
2. ✅ 准备和注册训练数据集
3. ✅ 配置针对小数据集优化的训练参数
4. ✅ 启动和监控训练过程
5. ✅ 加载和测试微调后的模型
6. ✅ 切换到完整数据集进行生产级训练
7. ✅ 排查常见问题

**下一步建议**：
1. 使用完整数据集（3000+ 条）训练模型
2. 在实际 Phaser3 项目中测试模型
3. 根据反馈迭代优化训练数据
4. 探索更大的模型（如 Qwen2.5-Coder-7B）

**需要帮助？**
- 查看 [常见问题](#七常见问题) 章节
- 参考 [LLaMA-Factory 文档](https://github.com/hiyouga/LLaMA-Factory/wiki)
- 在项目 GitHub 提 Issue

---

**文档版本**: v1.0
**创建日期**: 2026-01-27
**适用范围**: Qwen2.5-Coder-0.5B + LLaMA-Factory
**数据集**: 31 条测试数据集 / 3000+ 条完整数据集
