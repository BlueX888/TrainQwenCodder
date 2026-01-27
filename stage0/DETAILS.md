# Stage 0（基础设施准备）——stage0/ 目录详细解释文档

`stage0/` 是整个训练工程的“地基层”，目标是把后续阶段（SFT/GRPO/评估）依赖的三件事做成**可复现的离线产物**：

1) **Phaser3 API 索引（JSONL）**：从 `phaser.d.ts` 提取结构化记录，用于 Prompt 注入与 API 弱校验  
2) **Prompt 种子库（JSONL，≥2000）**：覆盖 Phaser3 核心模块与难度分布，为蒸馏/SFT/评估提供标准化任务输入  
3) **代码验证器（validator）**：静态（Babel AST + ESLint + API index）+ 可选运行时（HEADLESS best-effort），输出结构化 JSON

> 阶段零的“方法论、验收标准、推荐 schema”见根目录：`../阶段零-基础设施准备-详细实施文档.md`。本文聚焦解释 **stage0 当前实现**：文件组织、脚本行为、数据格式与常见坑位。

---

## 1. 目录结构与职责

```text
stage0/
├─ README.md                     # 快速开始 + 高层说明
├─ DETAILS.md                    # 本文（新增）
├─ package.json                  # phaser 依赖（用于拿到 node_modules/phaser/types/phaser.d.ts）
├─ data/                         # 可重复生成的产物
│  ├─ api_index/
│  │  ├─ phaser_api.jsonl        # Phaser API 索引（JSONL）
│  │  └─ meta.json               # 索引元信息（版本/统计/构建时间）
│  ├─ prompt_seeds/
│  │  └─ prompt_seeds.jsonl      # Prompt 种子库（JSONL）
│  └─ reports/
│     ├─ prompt_seeds_report.json# 种子库统计摘要
│     └─ prompt_coverage.csv     # 模块/难度覆盖率表
├─ scripts/                      # 离线脚本
│  ├─ build_api_index.js         # 从 phaser.d.ts 构建 api_index
│  ├─ query_api.py               # API 索引 BM25 检索
│  ├─ build_prompt_seeds.py      # 生成 prompt_seeds + 报告
│  ├─ validate_sample.py         # 调用 validator 做单样本端到端验证
│  └─ README.md
├─ validator/                    # Node 工程：ESLint + AST + HEADLESS runner
│  ├─ README.md
│  ├─ package.json
│  ├─ eslint.config.js
│  └─ src/
│     ├─ cli.js                  # validator 入口，串联 AST/ESLint/API/Runtime
│     ├─ ast_check.js            # AST 解析/安全规则/API 候选提取/结构信号
│     ├─ eslint_check.js         # eslint.lintText 包装
│     ├─ api_index.js            # 加载 api_index 的 symbol_id 集合
│     ├─ run_headless.js         # 子进程执行 runtime_child.js
│     └─ runtime_child.js        # vm 沙箱 + DOM/canvas stub + Phaser.HEADLESS
└─ test_code.js                  # 示例 Phaser 代码（用于快速验证）
```

---

## 2. 环境要求与版本一致性

- Node.js：建议 `>= 18`（validator 依赖 ESLint v9 / Babel）
- Python：建议 `>= 3.10`（用于脚本与后续训练编排）
- Phaser：建议锁定一个版本，且让：
  - `stage0/package.json`（用于生成 `phaser.d.ts`）  
  - `stage0/validator/package.json`（用于运行时验证时 require('phaser')）  
  尽量一致，否则可能出现“索引里有/运行时没”或“运行时能跑/索引缺失”的噪声。

---

## 3. 端到端最小工作流（建议）

以下命令默认在 `stage0/` 目录执行。

### 3.1 安装依赖（拿到 phaser.d.ts）

如果 `node_modules/phaser/types/phaser.d.ts` 不存在：

```bash
npm i
```

### 3.2 构建 API 索引（JSONL）

```bash
node scripts/build_api_index.js \
  --dts node_modules/phaser/types/phaser.d.ts \
  --out data/api_index/phaser_api.jsonl \
  --meta data/api_index/meta.json \
  --phaser-version <LOCKED_VERSION>
```

输出：
- `data/api_index/phaser_api.jsonl`
- `data/api_index/meta.json`

### 3.3 检索 API（给 Prompt 注入用）

```bash
python scripts/query_api.py \
  --index data/api_index/phaser_api.jsonl \
  --text "拖拽一个图形并在松手后回弹" \
  --top-k 20 \
  --pretty
```

### 3.4 生成 Prompt 种子库（JSONL，默认 2000）

```bash
python scripts/build_prompt_seeds.py \
  --count 2000 \
  --seed 42 \
  --out data/prompt_seeds/prompt_seeds.jsonl \
  --report-json data/reports/prompt_seeds_report.json \
  --coverage-csv data/reports/prompt_coverage.csv
```

### 3.5 用 validator 验证一段代码（建议先跳过运行时）

安装 validator 依赖：

```bash
cd validator
npm i
```

验证（静态链路）：

```bash
node src/cli.js \
  --code-file ../test_code.js \
  --api-index ../data/api_index/phaser_api.jsonl \
  --skip-runtime
```

或用 Python 包一层（pretty 输出）：

```bash
python scripts/validate_sample.py --code-file test_code.js --skip-runtime
```

---

## 4. 产物与数据格式（JSONL/JSON/CSV）

### 4.1 API 索引：`data/api_index/phaser_api.jsonl`

每行一个对象（简化字段示意）：

```json
{
  "symbol_id": "Phaser.GameObjects.Sprite#setTexture",
  "kind": "method",
  "owner": "Phaser.GameObjects.Sprite",
  "name": "setTexture",
  "signature": "setTexture(key: string, frame?: string | number): this",
  "params": [{"name":"key","type":"string","optional":false,"rest":false}],
  "returns": {"type":"this"},
  "tags": ["GameObjects","Sprite"],
  "source": {"origin":"dts","version":"3.90.0","path":".../phaser.d.ts","loc":{"start_line":123,"end_line":123}}
}
```

`symbol_id` 约定（validator 按此规则做存在性对比）：

- **方法**：`<owner>#<name>`  
  例：`Phaser.GameObjects.Sprite#setTexture`
- **属性/常量/namespace 函数**：`<owner>.<name>`  
  例：`Phaser.Input.Events.POINTER_DOWN`
- **namespace/class/interface** 本身也会写入索引（用于 Prompt 注入的“高层锚点”）

配套 meta：
- `data/api_index/meta.json`：包含 `phaser_version/source_dts/build_time/stats` 等统计信息。

### 4.2 Prompt 种子：`data/prompt_seeds/prompt_seeds.jsonl`

每行一个结构化任务：

```json
{
  "id": "seed_000123",
  "difficulty": "easy",
  "modules": ["Scene", "Input"],
  "task": "实现一个可拖拽的方块，拖拽时改变颜色，松手回到初始位置。",
  "constraints": ["使用 Phaser3", "必须包含 preload/create 生命周期", "..."],
  "must_use_apis": ["Phaser.Input.Events.GAMEOBJECT_DRAG", "Phaser.GameObjects.Graphics"],
  "eval_hints": ["应启用交互并监听拖拽事件", "..."],
  "tags": ["drag", "graphics", "input"],
  "notes": ""
}
```

配套报告：
- `data/reports/prompt_seeds_report.json`：总数、难度分布、模块分布  
- `data/reports/prompt_coverage.csv`：按模块统计 `easy/medium/hard/total`

---

## 5. scripts/：离线脚本实现说明

> 脚本集合概览见 `scripts/README.md`；这里补充“实现口径”和“与 validator 的契约”。

### 5.1 `scripts/build_api_index.js`：从 `phaser.d.ts` 构建索引

核心思路：
- 不依赖 TypeScript Compiler API，而是用 **注释剥离 + 大括号深度栈 + 正则** 做“够用优先”的结构提取。

会写入索引的内容（best-effort）：
- `namespace/module`：作为 `kind=namespace`
- `class/interface`：作为 `kind=class|interface`
- `class/interface` 内的 `method/property/get/set`
- `namespace` 下的 `function/const`（适配类似 `Phaser.Input.Events.*` 的常量）

重要参数：
- `--dts`：`phaser.d.ts` 路径
- `--out`：输出 JSONL 路径
- `--meta`：输出 meta.json 路径（可选）
- `--phaser-version`：写入 meta 便于后续一致性检查
- `--max-records`：截断输出（用于调试）

已知限制（设计上接受）：
- 不做重载合并/完整类型推导/JSDoc 抽取
- 极复杂的类型声明/多行签名可能漏解析
- 目标是“高性价比 Prompt 注入 + API 存在性弱校验”，不是 100% 完整的类型系统

### 5.2 `scripts/query_api.py`：BM25 检索（用于 Prompt 注入）

特点：
- 把 `symbol_id/owner/name/signature/kind/tags` 拼接成可检索文本
- 支持中英混合：含少量中文关键词 → 英文 token 的扩展（如“拖拽/粒子/摄像机”等）
- 输出默认为 JSON（可 `--pretty` 美化）

适用场景：
- 给教师系统提示词注入 top-k API
- 人工检索验证：某类能力该用哪些 API

### 5.3 `scripts/build_prompt_seeds.py`：生成种子任务 + 覆盖率报告

主要机制：
- 预置大量模板（按 `easy/medium/hard` 分桶）
- 用参数化维度（颜色/形状/速度/重力等）填充，控制多样性与可验证性
- 通过 `--seed` 固定随机性，保证可复现

输出文件：
- `data/prompt_seeds/prompt_seeds.jsonl`
- `data/reports/prompt_seeds_report.json`
- `data/reports/prompt_coverage.csv`

### 5.4 `scripts/validate_sample.py`：调用 validator 的 Python 包装

用途：
- 把 `validator/src/cli.js` 的 JSON 输出做一次 parse + pretty print
- 便于在 Python 管线里作为子步骤嵌入（stage1 就是这么做的）

---

## 6. validator/：验证器实现说明

validator 的目标不是“写一个完整 Phaser 运行环境”，而是为训练/过滤提供**足够稳定的结构化信号**：

- 静态：语法、危险用法、must-use、API 存在性、结构完整性（preload/create/new Phaser.Game）
- 运行时（可选）：HEADLESS best-effort，主要信号是“是否成功创建 game”

### 6.1 `validator/src/cli.js`：总入口与输出结构

输入参数（常用）：
- `--code-file <path>`：待验证 JS 文件
- `--api-index <path>`：API 索引 JSONL（可选，但强烈建议提供）
- `--prompt-json '{"must_use_apis":[...]}'`：must-use 约束（可选）
- `--skip-eslint` / `--skip-runtime`
- `--timeout-ms` / `--frames`：运行时控制

输出（单个 JSON）关键字段：
- `parse_ok / lint_ok / api_ok / runtime_ok`
- `errors / warnings`
- `api_usage.hits / api_usage.misses`
- `api_usage.must_use_hits / api_usage.must_use_misses`
- `runtime`（ms/crashed/logs/errors/signals）
- `signals`（结构信号，如 `has_new_phaser_game/has_preload/has_create/...`）

### 6.2 `validator/src/ast_check.js`：AST 解析、危险用法与 API 候选提取

主要能力：
- Babel parse（支持 TS/JSX 等常见插件）
- 拦截危险用法：
  - `eval/new Function`
  - `require/import` 禁止加载 Node 敏感内置模块（`fs/http/net/...`）
- 结构信号检测：
  - 是否 `new Phaser.Game(...)`
  - config 是否包含 `scene`
  - 是否出现 `preload/create/update`
- API 候选提取：
  - `Phaser.*` 成员链（尤其是全大写常量的访问）
  - `this.*` 调用链：通过 `THIS_CHAIN_OWNER_MAP` 将 `this.add.xxx`、`this.physics.add.xxx` 等映射到具体 owner，再按 `<owner>#<method>` 生成 `symbol_id`
  - EventEmitter 方法做了“降噪映射”（如 `on/once/off/...` 统一映射到 `Phaser.Events.EventEmitter#on` 等），减少 API index 缺失导致的误杀

> 扩展点：如果你发现大量 `this.xxx` 调用被当成 miss，可优先扩展 `THIS_CHAIN_OWNER_MAP`。

### 6.3 `validator/eslint.config.js` + `validator/src/eslint_check.js`

定位：
- 避免风格争论，只抓“明显错误/危险模式”：`no-undef/no-eval/no-new-func/no-restricted-imports/...`
- 通过 `lintText` 在虚拟路径上 lint，规避 flat config 的 basePath 限制。

### 6.4 `validator/src/api_index.js`：加载索引的 symbol_id 集合

实现很轻：
- 逐行读取 JSONL
- 只把 `symbol_id` 放入 `Set`（用于存在性对比）

### 6.5 运行时（可选）：`run_headless.js` + `runtime_child.js`

设计目的：提供一个“尽量安全、尽量不崩”的 best-effort 运行环境。

关键机制：
- 子进程执行（`execFile`），限制超时与输出 buffer，避免卡死
- `runtime_child.js` 中：
  - best-effort 注入 DOM（优先 `jsdom`，可选 `canvas`；否则降级 stub）
  - 拦截 `Module._load`，禁止 `require('fs')` 等敏感模块
  - `vm.runInNewContext` 执行用户代码（带 `timeout`）
  - monkey-patch `Phaser.Game` 捕获是否成功创建 game（`result.ok = game_created`）

已知限制：
- Phaser 在 Node/HEADLESS 下仍可能因环境差异失败；因此运行时验证是“可选层”
- 本阶段通常以静态链路为主，运行时更多是加分项/过滤补充

---

## 7. stage0 与后续阶段的接口关系

stage1/（SFT 冷启动）直接消费 stage0 的三类产物：

- `data/prompt_seeds/prompt_seeds.jsonl`：作为蒸馏输入任务池
- `data/api_index/phaser_api.jsonl`：作为教师 prompt 的 API 上下文注入来源
- `validator/`：作为蒸馏候选的 L1-L4 过滤与奖励信号来源

因此 stage0 最重要的工程目标是：**产物稳定、schema 固定、可重复构建**。

---

## 8. 常见问题（FAQ）

### Q1：`build_api_index.js` 找不到 `phaser.d.ts`？

确保在 `stage0/` 执行过 `npm i`，并确认文件存在：

`node_modules/phaser/types/phaser.d.ts`

### Q2：API 命中率很低（misses 很多）？

常见原因：
- Phaser 版本不一致（索引 vs 生成代码/validator 运行时）
- 生成代码大量使用别名/解构，AST 无法还原到 `symbol_id`
- `this.*` 调用链映射不全（扩展 `validator/src/ast_check.js`）

### Q3：运行时（HEADLESS）失败怎么办？

建议先：
- 使用 `--skip-runtime` 跑通静态链路

确实要跑运行时：
- 在 `stage0/validator/` 尝试安装可选依赖：`npm i jsdom canvas`（不同平台可能需要额外系统依赖）
- 缩短 `--timeout-ms`、减少 `--frames`，降低卡住风险

---

## 9. 进一步阅读

- 快速开始与命令汇总：`README.md`
- scripts 概览：`scripts/README.md`
- validator 概览：`validator/README.md`
- 阶段零全量设计：`../阶段零-基础设施准备-详细实施文档.md`

