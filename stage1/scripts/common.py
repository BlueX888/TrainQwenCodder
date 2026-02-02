"""
Stage1 公共工具函数模块

提供 JSONL 读写、路径处理、日志配置等通用功能。
"""

import json
import os
import hashlib
import logging
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Union
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def get_logger(name: str) -> logging.Logger:
    """获取命名的 logger"""
    return logging.getLogger(name)


# ============ 路径工具 ============

def get_project_root() -> Path:
    """获取项目根目录"""
    return Path(__file__).parent.parent.parent


def get_stage1_root() -> Path:
    """获取 stage1 根目录"""
    return Path(__file__).parent.parent


def ensure_dir(path: Union[str, Path]) -> Path:
    """确保目录存在，如果不存在则创建"""
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_stage0_path(subpath: str) -> Path:
    """获取 stage0 下的路径"""
    return get_project_root() / "stage0" / subpath


def get_data_path(subpath: str) -> Path:
    """获取 stage1/data 下的路径"""
    return get_stage1_root() / "data" / subpath


def get_reports_path(filename: str) -> Path:
    """获取报告文件路径"""
    return ensure_dir(get_data_path("reports")) / filename


# ============ JSONL 读写 ============

def read_jsonl(path: Union[str, Path]) -> List[dict]:
    """
    读取 JSONL 文件为列表

    Args:
        path: JSONL 文件路径

    Returns:
        解析后的字典列表
    """
    path = Path(path)
    if not path.exists():
        return []

    items = []
    with open(path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                items.append(json.loads(line))
            except json.JSONDecodeError as e:
                logging.warning(f"JSON decode error at line {line_num} in {path}: {e}")
    return items


def iter_jsonl(path: Union[str, Path]) -> Iterator[dict]:
    """
    流式迭代 JSONL 文件

    Args:
        path: JSONL 文件路径

    Yields:
        解析后的字典
    """
    path = Path(path)
    if not path.exists():
        return

    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    continue


def write_jsonl(path: Union[str, Path], items: List[dict], mode: str = 'w') -> int:
    """
    写入 JSONL 文件

    Args:
        path: 输出文件路径
        items: 要写入的字典列表
        mode: 写入模式，'w' 覆盖，'a' 追加

    Returns:
        写入的条目数
    """
    path = Path(path)
    ensure_dir(path.parent)

    with open(path, mode, encoding='utf-8') as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    return len(items)


def append_jsonl(path: Union[str, Path], item: dict) -> None:
    """追加单条记录到 JSONL 文件"""
    path = Path(path)
    ensure_dir(path.parent)

    with open(path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')


def read_json(path: Union[str, Path]) -> dict:
    """读取 JSON 文件"""
    path = Path(path)
    if not path.exists():
        return {}

    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json(path: Union[str, Path], data: Any, indent: int = 2) -> None:
    """写入 JSON 文件"""
    path = Path(path)
    ensure_dir(path.parent)

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)


# ============ 哈希与缓存 ============

def compute_hash(content: str) -> str:
    """计算内容的 SHA256 哈希值"""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def compute_short_hash(content: str, length: int = 8) -> str:
    """计算短哈希值"""
    return compute_hash(content)[:length]


class JsonlCache:
    """
    基于 JSONL 的简单缓存

    用于缓存 validator 结果等，避免重复计算
    """

    def __init__(self, cache_path: Union[str, Path], key_field: str = 'key'):
        self.cache_path = Path(cache_path)
        self.key_field = key_field
        self._cache: Dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        """从文件加载缓存"""
        if self.cache_path.exists():
            for item in iter_jsonl(self.cache_path):
                key = item.get(self.key_field)
                if key:
                    self._cache[key] = item

    def get(self, key: str) -> Optional[dict]:
        """获取缓存项"""
        return self._cache.get(key)

    def set(self, key: str, value: dict) -> None:
        """设置缓存项"""
        value[self.key_field] = key
        self._cache[key] = value
        append_jsonl(self.cache_path, value)

    def has(self, key: str) -> bool:
        """检查是否存在缓存"""
        return key in self._cache

    def __len__(self) -> int:
        return len(self._cache)

    def __bool__(self) -> bool:
        # Treat an initialized cache as truthy even when empty.
        # This keeps "if cache:" patterns working as intended.
        return True


# ============ 检查点 ============

class Checkpoint:
    """
    检查点管理器

    用于长时间运行任务的断点续传
    """

    def __init__(self, checkpoint_path: Union[str, Path]):
        self.checkpoint_path = Path(checkpoint_path)
        self.processed: set[str] = set()
        self._load()

    def _load(self) -> None:
        """加载检查点"""
        if self.checkpoint_path.exists():
            data = read_json(self.checkpoint_path)
            self.processed = set(data.get('processed', []))

    def save(self) -> None:
        """保存检查点"""
        write_json(self.checkpoint_path, {
            'processed': list(self.processed),
            'count': len(self.processed),
            'updated_at': datetime.now().isoformat()
        })

    def mark_done(self, item_id: str) -> None:
        """标记某项已完成"""
        self.processed.add(item_id)

    def is_done(self, item_id: str) -> bool:
        """检查某项是否已完成"""
        return item_id in self.processed

    def __len__(self) -> int:
        return len(self.processed)


# ============ 文本处理 ============

def normalize_code(code: str) -> str:
    """
    规范化代码用于相似度比较

    - 移除注释
    - 移除多余空白
    - 统一换行符
    """
    import re

    # 移除单行注释
    code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
    # 移除多行注释
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    # 统一空白
    code = re.sub(r'\s+', ' ', code)
    # 移除首尾空白
    code = code.strip()

    return code


def count_code_lines(code: str) -> dict:
    """
    统计代码行数

    Returns:
        {
            'total': 总行数,
            'code': 代码行数,
            'comment': 注释行数,
            'blank': 空行数
        }
    """
    lines = code.split('\n')
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())

    # 简单的注释检测
    comment = 0
    in_block_comment = False
    for line in lines:
        line = line.strip()
        if in_block_comment:
            comment += 1
            if '*/' in line:
                in_block_comment = False
        elif line.startswith('//'):
            comment += 1
        elif line.startswith('/*'):
            comment += 1
            if '*/' not in line:
                in_block_comment = True

    code_lines = total - blank - comment

    return {
        'total': total,
        'code': max(0, code_lines),
        'comment': comment,
        'blank': blank
    }


# ============ 报告工具 ============

def generate_report_summary(
    name: str,
    total: int,
    passed: int,
    details: Optional[dict] = None
) -> dict:
    """
    生成标准格式的报告摘要
    """
    return {
        'name': name,
        'timestamp': datetime.now().isoformat(),
        'total': total,
        'passed': passed,
        'failed': total - passed,
        'pass_rate': round(passed / total * 100, 2) if total > 0 else 0,
        'details': details or {}
    }


# ============ 命令行辅助 ============

def print_progress(current: int, total: int, prefix: str = '', suffix: str = '') -> None:
    """打印进度条"""
    percent = current / total * 100 if total > 0 else 0
    bar_length = 40
    filled = int(bar_length * current / total) if total > 0 else 0
    bar = '=' * filled + '-' * (bar_length - filled)
    print(f'\r{prefix} [{bar}] {percent:.1f}% ({current}/{total}) {suffix}', end='', flush=True)
    if current >= total:
        print()


if __name__ == '__main__':
    # 测试
    print(f"Project root: {get_project_root()}")
    print(f"Stage1 root: {get_stage1_root()}")
    print(f"Stage0 API index: {get_stage0_path('data/api_index/phaser_api.jsonl')}")
