const path = require("path");
const { execFile } = require("child_process");

function runHeadless({ codeFile, frames, timeoutMs }) {
  return new Promise((resolve) => {
    const start = Date.now();
    const childPath = path.join(__dirname, "runtime_child.js");
    execFile(
      process.execPath,
      [childPath, "--code-file", codeFile, "--frames", String(frames || 60)],
      { timeout: timeoutMs || 1500, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        const ms = Date.now() - start;
        if (stderr && String(stderr).trim()) {
          // keep stderr as runtime logs (not fatal)
        }
        if (err) {
          const timedOut = err.killed || String(err.message || "").toLowerCase().includes("timed out");
          resolve({
            ok: false,
            ms,
            crashed: true,
            logs: stderr ? [String(stderr)] : [],
            errors: [
              timedOut ? "runtime_timeout" : "runtime_exec_error",
              String(err && err.message ? err.message : err),
            ],
          });
          return;
        }
        const out = String(stdout || "").trim();
        if (!out) {
          resolve({ ok: false, ms, crashed: true, logs: stderr ? [String(stderr)] : [], errors: ["empty_runtime_output"] });
          return;
        }
        try {
          const obj = JSON.parse(out);
          resolve({
            ok: Boolean(obj.ok),
            ms: obj.ms != null ? obj.ms : ms,
            crashed: Boolean(obj.crashed),
            logs: Array.isArray(obj.logs) ? obj.logs : [],
            errors: Array.isArray(obj.errors) ? obj.errors : [],
            signals: obj.signals || {},
          });
        } catch (e) {
          resolve({
            ok: false,
            ms,
            crashed: true,
            logs: stderr ? [String(stderr)] : [],
            errors: ["runtime_output_not_json", String(e && e.message ? e.message : e), out.slice(0, 2000)],
          });
        }
      }
    );
  });
}

module.exports = { runHeadless };

