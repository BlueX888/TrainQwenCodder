# SFT 冷启动数据集格式说明

## 数据集概览

- **总样本数**: 3,290 条
- **训练集**: 2,964 条 (90.1%)
- **验证集**: 163 条 (5.0%)
- **测试集**: 163 条 (5.0%)

## 文件格式

**JSONL** (JSON Lines): 每行一个 JSON 对象

```
train.jsonl    # 训练数据
val.jsonl      # 验证数据
test.jsonl     # 测试数据
```

## 数据结构

每条样本包含 4 个字段：

### 1. instruction (系统指令)
- **类型**: String
- **作用**: 定义模型角色和输出格式
- **内容**: 固定的系统提示词

```json
"instruction": "你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。\n\n输出格式要求：\n1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤\n2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）\n3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期"
```

### 2. input (用户输入)
- **类型**: String
- **作用**: 任务描述 + 约束条件
- **结构**:
  - 任务描述
  - 难度等级 (easy/medium/hard)
  - 约束条件
  - 必须使用的 API

```json
"input": "任务: 实现点击生成圆形\n\n难度: 基础\n\n约束:\n- 使用 Phaser3\n- 不得依赖外部资源\n- 必须包含 preload/create 生命周期\n\n必须使用的 API:\n- Phaser.Input.Events.POINTER_DOWN\n- Phaser.GameObjects.Graphics"
```

### 3. output (期望输出)
- **类型**: String
- **作用**: 模型应生成的完整响应
- **结构**:
  1. `[PLAN]` 块：需求/API/步骤
  2. JavaScript 代码块（完整可运行）

```json
"output": "[PLAN]\nREQ: 实现点击生成圆形\nAPI: Phaser.Game, Phaser.Scene, Phaser.Input, Phaser.GameObjects.Graphics\nSTEPS:\n1. 配置 Phaser Game 和 Scene\n2. 监听点击事件\n3. 在点击位置生成圆形\n[/PLAN]\n\n```javascript\nconst config = {\n  type: Phaser.HEADLESS,\n  width: 800,\n  height: 600,\n  scene: { create }\n};\n\nfunction create() {\n  this.input.on('pointerdown', (pointer) => {\n    const graphics = this.add.graphics();\n    graphics.fillStyle(0xff0000, 1);\n    graphics.fillCircle(pointer.x, pointer.y, 20);\n  });\n}\n\nnew Phaser.Game(config);\n```"
```

### 4. metadata (元数据)
- **类型**: Object
- **作用**: 追溯和质量控制

```json
"metadata": {
  "id": "distill_seed_000123_v1",       // 唯一标识
  "prompt_id": "seed_000123",           // 原始 Prompt ID
  "source": "distill",                  // 数据来源
  "difficulty": "easy",                 // 难度
  "modules": ["Scene", "Input"],        // 涉及模块
  "quality_score": 0.75                 // 质量评分 (0-1)
}
```

## 数据特征统计

| 指标 | 训练集 | 验证集 | 测试集 |
|------|--------|--------|--------|
| **样本数** | 2,964 | 163 | 163 |
| **平均代码长度** | 948 字符 | 954 字符 | 937 字符 |
| **代码长度范围** | 624-1218 | 628-1218 | 625-1218 |
| **平均质量评分** | 0.566 | 0.566 | 0.566 |
| **涵盖模块数** | 8 | 7 | 8 |

### 难度分布

- **基础 (easy)**: 1,393 条 (42.3%)
- **中等 (medium)**: 1,388 条 (42.2%)
- **困难 (hard)**: 509 条 (15.5%)

### 模块覆盖

完整覆盖 Phaser3 核心模块：
- Scene (场景生命周期)
- GameObjects (游戏对象)
- Input (输入处理)
- Physics (物理引擎)
- Animations (动画系统)
- Camera (相机系统)
- Particles (粒子效果)
- Tilemap (瓦片地图)

## LLaMA-Factory 使用方法

### 1. 注册数据集

编辑 LLaMA-Factory 的 `data/dataset_info.json`:

```json
{
  "phaser3_sft": {
    "file_name": "/path/to/TrainQwenCodder/stage1/data/sft_dataset/train.jsonl",
    "columns": {
      "prompt": "instruction",
      "query": "input",
      "response": "output"
    }
  }
}
```

### 2. 配置训练参数

使用 `stage1/configs/sft_config_example.yaml`:

```yaml
model_name_or_path: Qwen/Qwen2.5-Coder-0.5B
dataset: phaser3_sft
template: default
output_dir: ./outputs/phaser3_sft

# 训练参数
per_device_train_batch_size: 4
gradient_accumulation_steps: 4
learning_rate: 5.0e-5
num_train_epochs: 3
```

### 3. 启动训练

```bash
llamafactory-cli train stage1/configs/sft_config_example.yaml
```

## 数据质量保证

每条样本经过 5 层过滤：

1. **L1 (语法/规范)**: 74.7% 通过率
   - ESLint 语法检查
   - 代码长度验证
   - 基础安全检查

2. **L2 (API 语义)**: API 调用正确性验证
   - API 存在性检查
   - 参数数量验证
   - must_use API 覆盖

3. **L3 (运行时)**: 可执行性验证
   - HEADLESS 模式运行
   - 无崩溃检查
   - 超时控制

4. **L4 (结构)**: 94.97% 通过率
   - Scene 生命周期完整性
   - Phaser.Game 配置正确性
   - Plan-Code 一致性

5. **L5 (多样性)**: 77.4% 通过率
   - 代码相似度去重
   - 质量评分排序
   - 每个 Prompt 保留最佳版本

## 示例样本

### 基础难度样本

**任务**: 创建一个缩放动画效果：让粉色星形在 1.5 秒内完成一次缩放，然后循环。

**代码长度**: 640 字符  
**质量评分**: 0.57

### 中等难度样本

**任务**: 实现黄色角色冲刺：按方向键进行短距离冲刺，冲刺速度为 360*3，冷却 0.5 秒。

**代码长度**: 973 字符  
**质量评分**: 0.57

### 困难难度样本

**任务**: 每关难度递增：第 1 关 5 个粉色敌人，每关增加 2 个，共 5 关，显示当前关卡和敌人数。

**代码长度**: 1213 字符  
**质量评分**: 0.56

## 数据流向图

```
Prompt 种子库 (2000)
  ↓
构建蒸馏请求 (6000)
  ↓
教师模型蒸馏 (6100)
  ↓
解析 Plan + Code (6100)
  ↓
L1-L4 过滤 (4251)
  ↓
L5 多样性筛选 (3290)
  ↓
最终数据集
  ├─ train.jsonl (2964)
  ├─ val.jsonl (163)
  └─ test.jsonl (163)
```

## 注意事项

1. **编码格式**: UTF-8
2. **换行符**: Unix 格式 (LF)
3. **JSON 转义**: 代码中的换行符已正确转义为 `\n`
4. **质量阈值**: 所有样本质量评分 > 0.5
5. **去重策略**: 代码相似度 < 0.85

## 扩展建议

如需扩展数据集：

1. 添加更多 Prompt 种子（增加任务多样性）
2. 使用真实教师模型（替换 Mock 蒸馏）
3. 补充官方示例数据（增强基础能力）
4. 调整难度比例（根据训练效果）
5. 增加特定模块样本（针对性强化）

---

**生成时间**: 2026-01-27  
**数据版本**: v1.0  
**项目**: Qwen2.5-Coder-0.5B Phaser3 代码生成强化训练
