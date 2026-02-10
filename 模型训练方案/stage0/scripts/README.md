<!-- stage0 脚本清单与作用概览。 -->
# scripts/

阶段零的离线脚本集合：

- `build_api_index.js`：从 `phaser.d.ts` 构建 `data/api_index/phaser_api.jsonl`
- `query_api.py`：对 API 索引做简单检索（BM25）
- `build_prompt_seeds.py`：生成 2000+ 条 Prompt 种子（JSONL）+ 覆盖率报告
- `validate_sample.py`：调用 `validator/` 的 CLI 对单条代码做端到端验证
