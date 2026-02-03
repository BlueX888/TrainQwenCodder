"""
按 requests.jsonl 顺序重排 raw_outputs JSONL

默认原地重写并生成备份文件。
"""

import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List

from common import read_jsonl, iter_jsonl, get_data_path, get_logger

logger = get_logger(__name__)


def reorder_outputs_by_requests(
    requests_path: str,
    output_path: str,
    out_path: Optional[str] = None,
    keep: str = "first",
    drop_extra: bool = False
) -> Dict:
    """
    按 requests.jsonl 中的 id 顺序重排输出 JSONL。

    Args:
        requests_path: 请求文件路径
        output_path: 输出文件路径
        out_path: 目标输出路径（None 表示原地重写并备份）
        keep: 重复 id 策略（first/last）
        drop_extra: 是否丢弃不在 requests 中的输出

    Returns:
        统计信息字典
    """
    src_output = Path(output_path)
    if not src_output.exists():
        raise FileNotFoundError(f"Output file not found: {output_path}")

    requests = read_jsonl(requests_path)
    request_ids: List[str] = []

    for i, req in enumerate(requests):
        req_id = req.get("id")
        if not req_id:
            req_id = f"req_{i}"
        request_ids.append(req_id)

    request_id_set = set(request_ids)

    outputs_map: Dict[str, dict] = {}
    extras: List[dict] = []
    duplicates = 0
    missing_id_outputs = 0
    total_outputs = 0

    for obj in iter_jsonl(output_path):
        if not isinstance(obj, dict):
            continue
        total_outputs += 1
        obj_id = obj.get("id")
        if not obj_id:
            missing_id_outputs += 1
            if not drop_extra:
                extras.append(obj)
            continue
        if obj_id not in request_id_set:
            if not drop_extra:
                extras.append(obj)
            continue

        if keep == "first":
            if obj_id in outputs_map:
                duplicates += 1
                continue
            outputs_map[obj_id] = obj
        else:
            if obj_id in outputs_map:
                duplicates += 1
            outputs_map[obj_id] = obj

    missing_outputs = 0
    written = 0

    target_path = out_path
    backup_path = ""
    tmp_path = ""

    if target_path is None:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        backup_path = str(src_output) + f".bak-{ts}"
        tmp_path = str(src_output) + f".tmp-{ts}"
        target_path = tmp_path

    Path(target_path).parent.mkdir(parents=True, exist_ok=True)

    with open(target_path, "w", encoding="utf-8") as fout:
        for req_id in request_ids:
            obj = outputs_map.get(req_id)
            if obj is None:
                missing_outputs += 1
                continue
            fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
            written += 1

        if not drop_extra and extras:
            for obj in extras:
                fout.write(json.dumps(obj, ensure_ascii=False) + "\n")
                written += 1

    if out_path is None:
        src_output.replace(backup_path)
        Path(tmp_path).replace(output_path)

    return {
        "requests": len(request_ids),
        "total_outputs": total_outputs,
        "written": written,
        "missing_outputs": missing_outputs,
        "duplicates": duplicates,
        "missing_id_outputs": missing_id_outputs,
        "extras_appended": 0 if drop_extra else len(extras),
        "backup_path": backup_path,
        "output_path": output_path if out_path is None else out_path
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="按 requests.jsonl 顺序重排输出 JSONL")
    parser.add_argument(
        "--requests", "-r",
        type=str,
        default=str(get_data_path("sft_distill/requests.jsonl")),
        help="请求文件路径"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=str(get_data_path("sft_distill/raw_outputs_claude.jsonl")),
        help="输出文件路径"
    )
    parser.add_argument(
        "--out",
        type=str,
        default=None,
        help="重排后的输出路径（不指定则原地重写并备份）"
    )
    parser.add_argument(
        "--keep",
        type=str,
        choices=["first", "last"],
        default="first",
        help="重复 id 保留策略"
    )
    parser.add_argument(
        "--drop-extra",
        action="store_true",
        help="丢弃不在 requests 中的输出"
    )

    args = parser.parse_args()

    stats = reorder_outputs_by_requests(
        requests_path=args.requests,
        output_path=args.output,
        out_path=args.out,
        keep=args.keep,
        drop_extra=args.drop_extra
    )

    logger.info("Reorder done: " + ", ".join(f"{k}={v}" for k, v in stats.items()))
    print("完成重排：")
    for k, v in stats.items():
        print(f"  - {k}: {v}")


if __name__ == "__main__":
    main()
