# TrainQwenCodder（stage0：Phaser3 代码能力训练 / 基础设施准备）

`stage0/` 是“阶段零：基础设施准备”的**最小可用实现（MVP）**，目标是把后续 SFT/GRPO/评估所依赖的底座工程化、可复现：

- **Phaser3 API 索引**：从 `phaser.d.ts` 提取并落成 `JSONL`，用于 Prompt 注入/弱校验
- **Prompt 种子库（≥2000）**：结构化 JSONL，覆盖 Phaser 主要模块与难度分布
- **代码验证器**：静态（Babel AST + ESLint）+ 可选运行时（HEADLESS / Node 环境 best-effort）

> 概念/验收标准的全量说明见仓库根目录：`../阶段零-基础设施准备-详细实施文档.md`。本文专注解释 `stage0/` 里**有哪些东西、各自怎么跑、产物长什么样**。

---

## 目录结构与职责

```text
stage0/
├─ README.md
├─ package.json                 # Phaser 依赖（用于拿到 types/phaser.d.ts）
├─ data/                        # 产物（可重复生成）
│  ├─ api_index/                # API 索引 JSONL + meta
│  ├─ prompt_seeds/             # Prompt 种子 JSONL
│  └─ reports/                  # 覆盖率/统计报告
├─ scripts/                     # 离线脚本：构建索引/种子/检索/端到端验证
│  ├─ build_api_index.js
│  ├─ query_api.py
│  ├─ build_prompt_seeds.py
│  └─ validate_sample.py
├─ validator/                   # Node 工程：ESLint + AST + HEADLESS runner
│  ├─ package.json
│  ├─ eslint.config.js
│  └─ src/
│     ├─ cli.js
│     ├─ ast_check.js
│     ├─ eslint_check.js
│     ├─ api_index.js
│     ├─ run_headless.js
│     └─ runtime_child.js
└─ test_code.js                 # 示例 Phaser 代码（用于本地快速验证）
```

---

## 环境要求与版本约定

- Node.js：建议 `>= 18`
- Python：建议 `>= 3.10`
- Phaser：**建议锁定一个版本，并让“API 索引构建”和“validator 运行时”尽量一致**，否则会出现“索引里没有/运行时报错”的假阴性。

> 本仓库里 `package.json` 和 `validator/package.json` 的 Phaser 版本可能不一致；如果要严肃用于过滤/奖励，建议统一版本并重新构建索引。

---

## 典型工作流（从零到端到端验证）

以下命令默认在 `stage0/` 目录执行。

### 1) 构建 Phaser3 API 索引（JSONL）

用途：
- 给 Prompt 注入提供“可检索的 API 列表”
- 给 validator 提供“API 是否存在”的弱校验（存在性为主，不做严格类型推导）

命令：

```bash
# 如果本目录下还没有 phaser（缺少 node_modules/phaser/types/phaser.d.ts），先执行：
# npm i
#
node scripts/build_api_index.js \
  --dts node_modules/phaser/types/phaser.d.ts \
  --out data/api_index/phaser_api.jsonl \
  --meta data/api_index/meta.json \
  --phaser-version <LOCKED_VERSION>
```

产物：
- `data/api_index/phaser_api.jsonl`：一行一个 API 记录（JSON）
- `data/api_index/meta.json`：构建时间、源 d.ts 路径、统计信息等

索引记录（简化示意）：

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

`symbol_id` 约定（validator 会按这个规则匹配）：
- 方法：`<owner>#<name>`（例：`Phaser.Scene#add`、`Phaser.GameObjects.Sprite#setTexture`）
- 属性/常量/函数：`<owner>.<name>`（例：`Phaser.Input.Events.POINTER_DOWN`）
- 命名空间/类/接口也会落索引（用于 Prompt 注入的“高层锚点”）

实现说明（脚本内部做了什么）：
- `scripts/build_api_index.js` 用轻量的正则 + 大括号深度栈解析 `phaser.d.ts`
- 会记录：namespace/class/interface 的“顶层符号”，以及 class/interface 内的 method/property，和 namespace 下的 function/const
- 这是 **“够用优先”** 的解析器：不处理复杂语法的所有边界（重载合并、JSDoc 等），后续想提升精度可换成 TypeScript Compiler API

### 2) 检索 API（用于 Prompt 注入或人工查看）

`scripts/query_api.py` 对 JSONL 做 BM25 检索（内置少量中文关键词到英文 token 的扩展）。

```bash
python scripts/query_api.py \
  --index data/api_index/phaser_api.jsonl \
  --text "实现一个带重力与跳跃的角色控制" \
  --top-k 20 \
  --pretty
```

输出为 JSON 数组（包含 `symbol_id/owner/name/signature/score` 等）。

### 3) 生成 Prompt 种子库（JSONL）

用途：
- 给 SFT 冷启动提供结构化任务（也可进一步渲染成对话样式数据）
- 给 GRPO 提供“must-use API / eval hints / 约束”的结构化监督信号

默认生成 2000 条，并输出统计报告：

```bash
python scripts/build_prompt_seeds.py
```

可选参数（常用）：

```bash
python scripts/build_prompt_seeds.py \
  --count 2000 \
  --seed 42 \
  --out data/prompt_seeds/prompt_seeds.jsonl \
  --report-json data/reports/prompt_seeds_report.json \
  --coverage-csv data/reports/prompt_coverage.csv
```

种子条目 schema（与根文档保持一致）：
- `id`：`seed_000001` 格式
- `difficulty`：`easy|medium|hard`
- `modules`：覆盖模块（如 Scene/Input/Physics…）
- `task`：自然语言任务描述
- `constraints`：硬约束（可用于 prompt 拼接/过滤）
- `must_use_apis`：必须出现的 API（用于奖励/验证）
- `eval_hints`：可验证点提示（用于评估/自动打分）
- `tags`：标签（用于采样、分桶、分析）

### 4) 端到端验证一段代码（推荐从 `test_code.js` 开始）

**方式 A：直接调用 validator（Node）**

```bash
cd validator
npm i
node src/cli.js \
  --code-file ../test_code.js \
  --api-index ../data/api_index/phaser_api.jsonl \
  --skip-runtime
```

**方式 B：用 Python 包一层（输出更易读的 pretty JSON）**

```bash
python scripts/validate_sample.py \
  --code-file test_code.js \
  --api-index data/api_index/phaser_api.jsonl \
  --skip-runtime
```

> `--skip-runtime` 建议在本地环境未装 `jsdom/canvas` 时先开着；等静态链路跑通后再尝试运行时。

---

## validator 详解（validator/）

`validator` 输出一个结构化 JSON（便于后续作为过滤/奖励/评估输入），主流程在 `validator/src/cli.js`：

1) **AST 解析与安全检查**（`validator/src/ast_check.js`）
   - Babel 解析 JS/TS（best-effort）
   - 收集“结构信号”：是否 `new Phaser.Game(...)`、config 是否含 `scene`、是否出现 `preload/create/update`
   - 收集 API 候选：
     - `Phaser.*` 形式的成员链（尤其是 `Phaser.Input.Events.*` 常量）
     - `this.*` 的调用链（用映射表把 `this.add.*`、`this.physics.add.*` 等归一到具体 owner 类型）
   - 拦截危险用法：`eval/new Function`、以及对 `fs/http/net/...` 等 Node 内置模块的 `require/import`

2) **ESLint**（`validator/src/eslint_check.js` + `validator/eslint.config.js`）
   - 重点是“安全/明显错误”，不做风格争论
   - 通过 `lintText` 对输入字符串 lint，并使用虚拟路径规避 flat config 的 basePath 限制

3) **API 存在性校验**（`validator/src/api_index.js`）
   - 只加载 JSONL 的 `symbol_id` 集合（Set）
   - 将 AST 候选 `symbol_id` 与索引对比，得到 hits/misses

4) **must-use 校验**
   - `prompt-json` 里可传 `{"must_use_apis":[...]}`（或用上游种子库字段）
   - 如果 must-use 项含 `#`，按 `symbol_id` 严格命中；否则退化为字符串包含/成员链命中（best-effort）

5) **可选运行时（HEADLESS）**（`validator/src/run_headless.js` + `validator/src/runtime_child.js`）
   - 子进程执行：设置超时与 buffer 上限，避免“卡死/爆输出”
   - `runtime_child.js` 会：
     - best-effort 注入 DOM（优先 `jsdom`，可选 `canvas`；没有就降级 stub）
     - 通过 `Module._load` 拦截 `require()`，禁止加载危险模块
     - `vm.runInNewContext` 执行用户代码，并 monkey-patch `Phaser.Game` 捕获是否创建了 game
     - 运行约 `frames * 16ms` 后销毁 game（best-effort），返回 `{ok, crashed, ms, signals}`

### validator 输出字段（摘要）

- `parse_ok / lint_ok / api_ok / runtime_ok`：各阶段是否通过
- `errors / warnings`：结构化消息数组（带 ruleId/位置等）
- `api_usage.hits / api_usage.misses`：命中的/未命中的 `symbol_id`
- `api_usage.must_use_hits / api_usage.must_use_misses`：must-use 的命中情况
- `runtime`：运行时结果（用 `--skip-runtime` 可跳过）
- `signals`：静态结构信号（后续可用于奖励 shaping）

---

## 常见问题（FAQ）

### Q1：为什么 API 校验会有误报/漏报？

这是“弱校验”设计的结果：Phaser 动态特性强、而我们只做了 `symbol_id` 级别的存在性对比。

建议：
- 统一 Phaser 版本并重建索引
- 扩展 `validator/src/ast_check.js` 的 `THIS_CHAIN_OWNER_MAP`（覆盖更多 `this.xxx` 链）
- 后续再逐步增强：参数个数检查、部分类型/重载处理等

### Q2：运行时（HEADLESS）跑不起来怎么办？

先确认你只是在做基础设施验证：
- 本阶段可以只依赖静态链路（AST + ESLint + API index），`--skip-runtime` 不影响后续阶段接入

如果确实需要运行时：
- 尝试在 `validator/` 安装可选依赖：`npm i jsdom canvas`（不同平台可能需要额外系统依赖）
- 缩短 `--timeout-ms` / `--frames`，减少卡住风险

---

## 进一步阅读

- 总体设计与验收标准：`../阶段零-基础设施准备-详细实施文档.md`
- `stage0/` 实现细节说明：`DETAILS.md`
- `scripts/` 说明：`scripts/README.md`
- `validator/` 说明：`validator/README.md`
