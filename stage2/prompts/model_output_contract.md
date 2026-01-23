# 模型输出契约（GRPO 训练期）

训练期要求模型输出固定结构，便于奖励计算与一致性约束：

```text
plan:
{"requirements":[...],"apis":[...],"steps":[...],"notes":"..."}
code:
// JavaScript code here (no markdown fences)
```

约束：

- `plan` 必须是 JSON 对象，字段至少包含 `requirements/apis/steps`
- `plan.apis` 尽量使用可在 `stage0/data/api_index/phaser_api.jsonl` 命中的 API 标识（推荐 `Phaser.Namespace.Class#method` 或常量 `Phaser.*.*`）
- `code` 必须是纯 JS 源码，不得包含 ``` 围栏

