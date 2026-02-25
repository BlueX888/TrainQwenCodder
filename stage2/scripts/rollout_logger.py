"""
Rollout 日志记录器：保存每步的 rollout 数据用于调试和分析。

用法：
  1. 作为 VeRL 训练中的辅助工具记录 rollout 数据
  2. 训练后处理和分析 rollout 日志

Rollout JSONL 格式：
  - step, prompt_id, group_id
  - 模型输出文本
  - 完整奖励明细
  - advantage 值
  - 生成参数元信息
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from common import ensure_dir, append_jsonl, read_jsonl, get_data_path, get_logger

logger = get_logger(__name__)


class RolloutLogger:
    """
    记录 rollout 数据到 JSONL 文件。

    按训练步骤组织：rollouts/step_{step:06d}.jsonl
    """

    def __init__(self, output_dir: Optional[str] = None):
        self.output_dir = Path(output_dir or str(get_data_path('grpo/rollouts')))
        ensure_dir(self.output_dir)
        self.current_step = 0
        logger.info(f"RolloutLogger: output_dir={self.output_dir}")

    def log_rollout(
        self,
        step: int,
        prompt_id: str,
        group_id: int,
        text: str,
        reward_detail: dict,
        advantage: float = 0.0,
        meta: Optional[dict] = None,
    ) -> None:
        """记录单条 rollout"""
        record = {
            "step": step,
            "prompt_id": prompt_id,
            "group_id": group_id,
            "text": text[:5000],  # 截断过长输出
            "reward": reward_detail,
            "advantage": round(advantage, 6),
            "meta": meta or {},
            "timestamp": datetime.now().isoformat(),
        }

        step_file = self.output_dir / f"step_{step:06d}.jsonl"
        append_jsonl(step_file, record)

    def log_batch(
        self,
        step: int,
        prompt_ids: List[str],
        texts: List[str],
        rewards: List[dict],
        advantages: List[float],
        group_size: int = 8,
        meta: Optional[dict] = None,
    ) -> None:
        """批量记录 rollout（按 prompt 分组）"""
        for i, (pid, text, reward, adv) in enumerate(
            zip(prompt_ids, texts, rewards, advantages)
        ):
            group_id = i % group_size
            self.log_rollout(
                step=step,
                prompt_id=pid,
                group_id=group_id,
                text=text,
                reward_detail=reward,
                advantage=adv,
                meta=meta,
            )

    def log_step_summary(
        self,
        step: int,
        rewards: List[float],
        kl: Optional[float] = None,
        additional: Optional[dict] = None,
    ) -> None:
        """记录每步聚合指标"""
        n = len(rewards)
        mean = sum(rewards) / n if n > 0 else 0.0

        summary = {
            "step": step,
            "n_rollouts": n,
            "reward_mean": round(mean, 4),
            "reward_std": round(
                (sum((r - mean)**2 for r in rewards) / n)**0.5, 4
            ) if n > 1 else 0.0,
            "reward_min": round(min(rewards), 4) if rewards else 0.0,
            "reward_max": round(max(rewards), 4) if rewards else 0.0,
            "reward_zero_ratio": round(
                sum(1 for r in rewards if r == 0.0) / n, 4
            ) if n > 0 else 0.0,
            "kl": round(kl, 6) if kl is not None else None,
            "additional": additional or {},
            "timestamp": datetime.now().isoformat(),
        }

        summary_file = self.output_dir / "step_summaries.jsonl"
        append_jsonl(summary_file, summary)

    def read_step_summaries(self) -> List[dict]:
        """读取所有步骤摘要（用于分析）"""
        summary_file = self.output_dir / "step_summaries.jsonl"
        return read_jsonl(summary_file)

    def read_step_rollouts(self, step: int) -> List[dict]:
        """读取指定步骤的 rollout 数据"""
        step_file = self.output_dir / f"step_{step:06d}.jsonl"
        return read_jsonl(step_file)
