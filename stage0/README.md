# Stage 0（基础设施准备）

`stage0/` 是整个训练工程的“地基层”：把后续阶段（SFT/GRPO/评估）会反复依赖的能力，提前固化为**可复现的离线产物**与**稳定的验证信号**。

本阶段的设计目标不是“把 Phaser3 全部跑起来”，而是用更低的工程成本，提供训练数据生产线所需的三类基础设施：

1) **Phaser3 API 索引（JSONL）**：从 `phaser.d.ts` 提取结构化记录，用于 Prompt 注入与 API 存在性弱校验  
2) **Prompt 种子库（JSONL，默认 2000）**：覆盖核心模块与难度分布，作为蒸馏/SFT/评估的标准化任务输入  
3) **代码验证器（validator）**：静态（Babel AST + ESLint + API index）+ 可选运行时（HEADLESS best-effort），输出结构化 JSON

更完整的实现细节见：`DETAILS.md` 与仓库根目录 `阶段零-基础设施准备-详细实施文档.md`。

---

## 设计方案（高层）

### 1) 产物优先（Artifacts-first）

stage0 的核心交付物全部落在 `stage0/data/` 与 `stage0/validator/`：

- `data/api_index/phaser_api.jsonl`：API 索引（下游用于检索 + validator 命中/缺失对比）
- `data/api_index/meta.json`：索引元信息（版本、构建时间、统计）
- `data/prompt_seeds/prompt_seeds.jsonl`：结构化 Prompt 种子库
- `data/reports/*`：种子库覆盖率/统计报告（便于验收与回归）
- `validator/src/cli.js`：验证器入口（stage1/2/3 直接调用）

这些产物的共同要求是：**schema 固定、可重复构建、可离线消费**。

### 2) 契约驱动（Contract-first）

API 索引与 validator 之间通过 `symbol_id` 建立“弱一致性契约”：

- 方法：`<owner>#<name>`，例如 `Phaser.GameObjects.Sprite#setTexture`
- 属性/常量/namespace 函数：`<owner>.<name>`，例如 `Phaser.Input.Events.POINTER_DOWN`
- namespace/class/interface 本身也会入库（用于 Prompt 注入的高层锚点），例如 `Phaser.Actions`

validator 的 AST 提取会尽量把代码中的访问路径映射为同一套 `symbol_id`，然后用 `Set(symbol_id)` 做存在性对比：命中（hits）与缺失（misses）都会作为结构化信号输出给下游过滤/奖励逻辑。

### 3) 低依赖、够用优先（Best-effort）

- `scripts/build_api_index.js` 不依赖 TypeScript Compiler API，而采用**注释剥离 + brace depth 栈 + 正则**的轻量解析：牺牲“100% 类型保真”，换取“可维护、可复现、够用”的索引。
- Prompt 种子生成用**模板 + 参数化维度 + 随机种子**，用 `--seed` 固定随机性，确保同配置下输出可复现。
- validator 的运行时链路是“可选层”：在 Node 里用 `jsdom/canvas`（可选依赖）做 best-effort DOM/canvas 注入，并通过子进程 + 超时限制降低卡死风险；默认更推荐先跑静态链路。

### 4) 版本一致性（Version-lock）

为降低“索引里有/运行时没”或“运行时能跑/索引缺失”的噪声，建议锁定 Phaser 版本，并尽量保持：

- `stage0/package.json`（用于拿到 `phaser.d.ts`）
- `stage0/validator/package.json`（运行时验证时 `require('phaser')`）

与 `data/api_index/meta.json` 中记录的 `phaser_version` 一致。

---

## 目录结构

```text
stage0/
├─ README.md
├─ DETAILS.md
├─ package.json
├─ data/
│  ├─ api_index/        # Phaser API 索引 + meta
│  ├─ prompt_seeds/     # Prompt 种子库
│  └─ reports/          # 覆盖率与统计报告
├─ scripts/             # 离线脚本（构建索引/种子/检索/单样本验证）
├─ validator/           # Node 验证器（AST/ESLint/可选运行时）
└─ test_code.js         # 示例 Phaser 代码（用于快速验证）
```

---

## 快速开始（端到端最小工作流）

以下命令默认在 `stage0/` 目录执行。

### 1) 安装 Phaser（拿到 `phaser.d.ts`）

如果 `node_modules/phaser/types/phaser.d.ts` 不存在：

```bash
npm i
```

### 2) 构建 API 索引

```bash
node scripts/build_api_index.js \
  --dts node_modules/phaser/types/phaser.d.ts \
  --out data/api_index/phaser_api.jsonl \
  --meta data/api_index/meta.json \
  --phaser-version <LOCKED_VERSION>
```

> `LOCKED_VERSION` 建议与当前安装的 Phaser 版本一致，可用 `node -p "require('phaser/package.json').version"` 查看。

### 3) 生成 Prompt 种子库（默认 2000）

```bash
python scripts/build_prompt_seeds.py
```

### 4) 安装并运行 validator（建议先跳过运行时）

```bash
cd validator
npm i
node src/cli.js \
  --code-file ../test_code.js \
  --api-index ../data/api_index/phaser_api.jsonl \
  --skip-runtime
```

或用 Python 包一层（便于集成到后续管线）：

```bash
python scripts/validate_sample.py --code-file test_code.js --skip-runtime
```

---

## 与后续阶段的关系

stage1/（SFT 冷启动）会直接消费本阶段产物：

- Prompt 种子库：`data/prompt_seeds/prompt_seeds.jsonl`
- API 索引：`data/api_index/phaser_api.jsonl`
- 验证器：`validator/src/cli.js`

因此 stage0 最重要的工程目标是：**产物稳定、schema 固定、可重复构建**。

---

## 进一步阅读

- 实现细节与数据格式：`DETAILS.md`
- scripts 概览：`scripts/README.md`
- validator 概览：`validator/README.md`
