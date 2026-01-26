"""
API BM25 检索模块

提供基于 BM25 算法的 Phaser3 API 检索功能，用于教师模型 Prompt 的上下文注入。
"""

import math
import re
from collections import Counter
from typing import Optional
from pathlib import Path

from common import read_jsonl, get_stage0_path, get_logger

logger = get_logger(__name__)


class BM25Index:
    """
    BM25 索引，用于 API 检索

    支持中英文混合查询
    """

    def __init__(
        self,
        k1: float = 1.5,
        b: float = 0.75,
        min_token_len: int = 2
    ):
        self.k1 = k1
        self.b = b
        self.min_token_len = min_token_len

        self.documents: list[dict] = []
        self.doc_tokens: list[list[str]] = []
        self.doc_lens: list[int] = []
        self.avgdl: float = 0.0
        self.df: Counter = Counter()  # document frequency
        self.idf: dict[str, float] = {}
        self.n_docs: int = 0

    def _tokenize(self, text: str) -> list[str]:
        """
        分词处理

        支持：
        - 英文按空格/驼峰/下划线分割
        - 中文按字符分割
        - 统一转小写
        """
        tokens = []

        # 分割驼峰命名 (e.g., GameObjects -> game, objects)
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        # 分割下划线/点
        text = re.sub(r'[._#]', ' ', text)
        # 移除特殊字符
        text = re.sub(r'[^\w\s\u4e00-\u9fff]', ' ', text)

        # 分词
        for word in text.lower().split():
            if len(word) >= self.min_token_len:
                tokens.append(word)

        # 中文按字符分割
        chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
        tokens.extend(chinese_chars)

        return tokens

    def _build_search_text(self, api: dict) -> str:
        """构建用于索引的文本"""
        parts = [
            api.get('name', ''),
            api.get('owner', ''),
            api.get('signature', ''),
            ' '.join(api.get('tags', [])),
            api.get('doc', '')
        ]
        return ' '.join(parts)

    def build(self, apis: list[dict]) -> None:
        """
        构建索引

        Args:
            apis: API 记录列表
        """
        self.documents = apis
        self.doc_tokens = []
        self.doc_lens = []
        self.df = Counter()

        for api in apis:
            text = self._build_search_text(api)
            tokens = self._tokenize(text)
            self.doc_tokens.append(tokens)
            self.doc_lens.append(len(tokens))
            # 计算 df（每个文档只计算一次）
            self.df.update(set(tokens))

        self.n_docs = len(apis)
        self.avgdl = sum(self.doc_lens) / self.n_docs if self.n_docs > 0 else 0

        # 计算 IDF
        for term, df in self.df.items():
            self.idf[term] = math.log((self.n_docs - df + 0.5) / (df + 0.5) + 1)

        logger.info(f"Built BM25 index with {self.n_docs} documents")

    def _score(self, query_tokens: list[str], doc_idx: int) -> float:
        """计算单个文档的 BM25 分数"""
        doc_tokens = self.doc_tokens[doc_idx]
        doc_len = self.doc_lens[doc_idx]
        tf = Counter(doc_tokens)

        score = 0.0
        for term in query_tokens:
            if term not in self.idf:
                continue
            f = tf.get(term, 0)
            numerator = f * (self.k1 + 1)
            denominator = f + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
            score += self.idf[term] * numerator / denominator

        return score

    def search(self, query: str, top_k: int = 20) -> list[dict]:
        """
        搜索 API

        Args:
            query: 查询文本
            top_k: 返回数量

        Returns:
            匹配的 API 列表，按相关性排序
        """
        if not self.documents:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # 计算所有文档的分数
        scores = []
        for i in range(self.n_docs):
            score = self._score(query_tokens, i)
            if score > 0:
                scores.append((i, score))

        # 排序并返回 top-k
        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for i, score in scores[:top_k]:
            api = self.documents[i].copy()
            api['_score'] = round(score, 4)
            results.append(api)

        return results


class APIRetriever:
    """
    API 检索器

    封装 BM25 索引，提供便捷的检索接口
    """

    def __init__(
        self,
        api_index_path: Optional[str] = None,
        lazy_load: bool = True
    ):
        """
        Args:
            api_index_path: API 索引文件路径，默认使用 stage0 的索引
            lazy_load: 是否延迟加载索引
        """
        self.api_index_path = Path(api_index_path) if api_index_path else \
            get_stage0_path('data/api_index/phaser_api.jsonl')
        self.bm25: Optional[BM25Index] = None

        if not lazy_load:
            self._load()

    def _load(self) -> None:
        """加载索引"""
        if self.bm25 is not None:
            return

        logger.info(f"Loading API index from {self.api_index_path}")
        apis = read_jsonl(self.api_index_path)
        self.bm25 = BM25Index()
        self.bm25.build(apis)

    def search(self, query: str, top_k: int = 20) -> list[dict]:
        """
        搜索 API

        Args:
            query: 查询文本（支持中英文）
            top_k: 返回数量

        Returns:
            匹配的 API 列表
        """
        self._load()
        return self.bm25.search(query, top_k)

    def search_for_prompt(
        self,
        prompt: dict,
        top_k: int = 20
    ) -> list[dict]:
        """
        根据 Prompt 搜索相关 API

        从 prompt 的 task、tags、must_use_apis 等字段提取关键词进行搜索

        Args:
            prompt: Prompt 字典
            top_k: 返回数量

        Returns:
            匹配的 API 列表
        """
        query_parts = []

        # 提取任务描述
        if 'task' in prompt:
            query_parts.append(prompt['task'])

        # 提取标签
        if 'tags' in prompt:
            query_parts.extend(prompt['tags'])

        # 提取必须使用的 API（提取名称部分）
        if 'must_use_apis' in prompt:
            for api in prompt['must_use_apis']:
                # 提取 API 名称 (e.g., "Phaser.GameObjects.Graphics" -> "Graphics")
                parts = api.replace('#', '.').split('.')
                query_parts.extend(parts)

        # 提取模块
        if 'modules' in prompt:
            query_parts.extend(prompt['modules'])

        query = ' '.join(query_parts)
        return self.search(query, top_k)

    def format_api_context(
        self,
        apis: list[dict],
        max_apis: int = 20,
        include_params: bool = True
    ) -> str:
        """
        格式化 API 列表为上下文文本

        Args:
            apis: API 列表
            max_apis: 最大 API 数量
            include_params: 是否包含参数详情

        Returns:
            格式化的 API 上下文文本
        """
        lines = []

        # 按 owner 分组
        grouped: dict[str, list[dict]] = {}
        for api in apis[:max_apis]:
            owner = api.get('owner', 'Other')
            if owner not in grouped:
                grouped[owner] = []
            grouped[owner].append(api)

        for owner, owner_apis in grouped.items():
            lines.append(f"### {owner}")
            for api in owner_apis:
                name = api.get('name', '')
                signature = api.get('signature', '')
                kind = api.get('kind', '')

                if signature:
                    lines.append(f"- `{signature}`")
                else:
                    lines.append(f"- `{name}` ({kind})")

                # 添加简短描述
                doc = api.get('doc', '')
                if doc:
                    # 只取第一句
                    first_sentence = doc.split('.')[0].strip()
                    if first_sentence and len(first_sentence) < 100:
                        lines.append(f"  - {first_sentence}")

            lines.append('')

        return '\n'.join(lines)


# 全局单例
_retriever: Optional[APIRetriever] = None


def get_retriever(api_index_path: Optional[str] = None) -> APIRetriever:
    """获取全局 API 检索器"""
    global _retriever
    if _retriever is None:
        _retriever = APIRetriever(api_index_path)
    return _retriever


def search_apis(query: str, top_k: int = 20) -> list[dict]:
    """便捷函数：搜索 API"""
    return get_retriever().search(query, top_k)


def search_apis_for_prompt(prompt: dict, top_k: int = 20) -> list[dict]:
    """便捷函数：根据 Prompt 搜索 API"""
    return get_retriever().search_for_prompt(prompt, top_k)


def format_api_context(apis: list[dict], max_apis: int = 20) -> str:
    """便捷函数：格式化 API 上下文"""
    return get_retriever().format_api_context(apis, max_apis)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='API BM25 检索工具')
    parser.add_argument('--query', '-q', type=str, help='查询文本')
    parser.add_argument('--top-k', '-k', type=int, default=10, help='返回数量')
    parser.add_argument('--index', type=str, help='API 索引路径')
    parser.add_argument('--pretty', action='store_true', help='美化输出')

    args = parser.parse_args()

    if args.query:
        retriever = APIRetriever(args.index)
        results = retriever.search(args.query, args.top_k)

        if args.pretty:
            print(f"\n找到 {len(results)} 个相关 API:\n")
            for i, api in enumerate(results, 1):
                print(f"{i}. {api.get('owner', '')}.{api.get('name', '')} (score: {api.get('_score', 0)})")
                print(f"   {api.get('signature', '')}")
                print()
        else:
            import json
            print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print("请使用 --query 参数指定查询文本")
        print("示例: python api_bm25.py --query '拖拽精灵' --top-k 10 --pretty")
