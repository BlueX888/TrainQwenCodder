// 加载 API 索引 JSONL，构建 symbol_id 的集合用于命中/缺失判定。
const fs = require("fs");
const readline = require("readline");

async function loadApiIndex(indexPath) {
  const symbolIds = new Set();
  const stats = { total_lines: 0, parsed: 0, skipped: 0 };

  if (!indexPath || !fs.existsSync(indexPath)) {
    return { ok: false, symbolIds, stats, error: "api_index_not_found" };
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(indexPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    stats.total_lines++;
    const s = line.trim();
    if (!s) continue;
    try {
      const obj = JSON.parse(s);
      if (obj && typeof obj.symbol_id === "string" && obj.symbol_id) {
        symbolIds.add(obj.symbol_id);
        stats.parsed++;
      } else {
        stats.skipped++;
      }
    } catch {
      stats.skipped++;
    }
  }

  return { ok: true, symbolIds, stats, error: null };
}

module.exports = { loadApiIndex };
