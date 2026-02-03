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

## 模型选择

| 模型 | 质量 | 速度 | 成本/请求 | 总成本(6000条) |
|------|------|------|-----------|---------------|
| **claude-3-5-sonnet-20241022** | ⭐⭐⭐⭐ | 快 | ~$0.015 | ~$90 |
| **claude-3-5-sonnet-20250122** | ⭐⭐⭐⭐⭐ | 快 | ~$0.015 | ~$90 |
| **claude-opus-4-20250514** | ⭐⭐⭐⭐⭐ | 中 | ~$0.075 | ~$450 |
| **claude-3-7-sonnet-20250219** | ⭐⭐⭐⭐⭐ | 中 | ~$0.030 | ~$180 |

**推荐选择**：`claude-3-5-sonnet-20241022`（性价比最高）

### 使用不同模型

```bash
# 使用最新 Sonnet（质量更好）
python run_teacher_claude.py --model claude-3-5-sonnet-20250122

# 使用 Opus 4（最高质量，但很贵）
python run_teacher_claude.py --model claude-opus-4-20250514
```

## 高级用法

### 断点续传

脚本自动支持断点续传。如果中途中断（Ctrl+C、网络错误等），再次运行会从断点继续：

```bash
python run_teacher_claude.py  # 自动从检查点恢复
```

### 自定义速率限制

避免触发 API 速率限制，可调整请求间隔：

```bash
# 每 2 秒发送一个请求（更保守）
python run_teacher_claude.py --rate-limit-delay 2.0

# 每 0.5 秒发送一个请求（更激进，可能触发限制）
python run_teacher_claude.py --rate-limit-delay 0.5
```

### 批量处理特定范围

```bash
# 处理前 1000 条
python run_teacher_claude.py --max-items 1000

# 处理前 100 条（快速测试）
python run_teacher_claude.py --max-items 100
```

### 自定义输出路径

```bash
python run_teacher_claude.py \
  --requests ../data/sft_distill/requests.jsonl \
  --output ../data/sft_distill/raw_outputs_sonnet.jsonl \
  --checkpoint ../data/sft_distill/checkpoint_sonnet.json
```

## 成本估算

### 输入输出 Token 估算

- **输入**：系统提示 + API 上下文 + 用户消息 ≈ 2000-3000 tokens
- **输出**：PLAN + 完整代码 ≈ 1500-2500 tokens

### Sonnet 3.5 成本计算

- 输入：$3 / 1M tokens → $0.009 每次请求
- 输出：$15 / 1M tokens → $0.03 每次请求
- **总计**：约 $0.015 每次请求

### 6000 条请求总成本

- Sonnet 3.5：**$90** (推荐)
- Sonnet 3.7：**$180**
- Opus 4：**$450**

## 预估时间

- 速率限制：1 请求/秒（默认）
- API 响应时间：2-5 秒/请求
- **6000 条总时间**：3-4 小时

可以通过调整 `--rate-limit-delay` 加快速度，但要注意速率限制。

## 故障处理

### 错误 1：Rate Limit Exceeded

```
RateLimitError: Rate limit reached
```

**解决方案**：
- 脚本会自动重试，等待 60 秒后继续
- 增加 `--rate-limit-delay` 参数

### 错误 2：API Key 无效

```
错误：未提供 API Key
```

**解决方案**：
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

### 错误 3：网络超时

**解决方案**：
- 脚本会自动重试 3 次
- 使用断点续传功能恢复

### 错误 4：输出格式不符合要求

**解决方案**：
- 检查 `parse_teacher_outputs.py` 的解析逻辑
- 查看 `raw_outputs_claude.jsonl` 中的实际输出
- 必要时调整系统提示词

## 质量对比

### Mock vs Claude API

| 特性 | Mock | Claude API |
|------|------|------------|
| 代码行数 | 20-40 行 | 60-150 行 |
| 代码复杂度 | 简单 | 复杂 |
| 循环使用 | ✗ | ✓ |
| 事件监听 | 基础 | 完整 |
| 碰撞检测 | 基础 | 完整 |
| Tween 动画 | ✗ | ✓ |
| 计时器 | ✗ | ✓ |
| 游戏逻辑 | 简单 | 完整 |
| 成本 | $0 | ~$90 |
| 时间 | 1 分钟 | 3-4 小时 |

### 预期代码质量提升

使用 Claude API 后，预期：
- **代码行数**：从平均 28 行提升到 80+ 行
- **函数数量**：从平均 2.6 个提升到 5+ 个
- **游戏机制**：包含完整的游戏循环、碰撞、动画、计时器等

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
python run_teacher_claude.py

# 6. 后续步骤保持不变
python parse_teacher_outputs.py --input ../data/sft_distill/raw_outputs_claude.jsonl
python run_validator_filter.py --workers 50
python select_best.py
python build_sft_dataset.py
```

## 监控进度

### 实时查看输出文件

```bash
# 查看已生成数量
wc -l ../data/sft_distill/raw_outputs_claude.jsonl

# 实时跟踪（另开终端）
tail -f ../data/sft_distill/raw_outputs_claude.jsonl

# 查看检查点
cat ../data/sft_distill/checkpoint_claude.json | jq .
```

### 检查生成质量

```bash
# 随机查看一条
shuf -n 1 ../data/sft_distill/raw_outputs_claude.jsonl | jq .raw_output -r
```

## 常见问题

### Q1: 可以同时运行多个实例加速吗？

A: 可以，但需要注意：
1. 使用不同的 `--checkpoint` 文件
2. 手动分割 `requests.jsonl`
3. 注意 API 速率限制（共享同一个 API Key）

### Q2: 中断后如何恢复？

A: 直接重新运行相同命令，脚本会自动从检查点恢复。

### Q3: 如何验证 API 调用是否成功？

A: 检查输出文件：
```bash
# 查看最新生成的条目
tail -1 ../data/sft_distill/raw_outputs_claude.jsonl | jq .
```

### Q4: 可以混合使用不同模型吗？

A: 可以，使用不同的输出文件：
```bash
# 用 Sonnet 生成 5000 条
python run_teacher_claude.py --max-items 5000 --output ../data/sft_distill/raw_outputs_sonnet.jsonl

# 用 Opus 生成 1000 条高质量数据
python run_teacher_claude.py --max-items 1000 --output ../data/sft_distill/raw_outputs_opus.jsonl --model claude-opus-4-20250514

# 后续合并
cat ../data/sft_distill/raw_outputs_*.jsonl > ../data/sft_distill/raw_outputs_combined.jsonl
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

生成的数据集质量将显著提升！
