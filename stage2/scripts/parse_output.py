"""
解析模型输出：提取 [PLAN] 块和 JavaScript 代码块。

模型输出格式（与 SFT 训练一致）：
  [PLAN]
  REQ: ...
  API: ...
  STEPS:
  1. ...
  [/PLAN]

  ```javascript
  ...
  ```
"""

import re
from typing import Optional, List
from dataclasses import dataclass, field


@dataclass
class ParsedPlan:
    """从 [PLAN] 块中提取的结构化计划"""
    raw: str = ""
    requirements: str = ""
    apis: List[str] = field(default_factory=list)
    steps: List[str] = field(default_factory=list)
    is_valid: bool = False


@dataclass
class ParsedOutput:
    """模型输出解析结果"""
    plan: Optional[ParsedPlan] = None
    code: str = ""
    has_plan: bool = False
    has_code: bool = False
    raw_text: str = ""


# 正则模式
PLAN_PATTERN = re.compile(
    r'\[PLAN\](.*?)\[/PLAN\]',
    re.DOTALL
)

CODE_BLOCK_PATTERN = re.compile(
    r'```(?:javascript|js)?\s*\n(.*?)```',
    re.DOTALL
)


def parse_plan_block(plan_text: str) -> ParsedPlan:
    """
    解析 [PLAN]...[/PLAN] 内容。

    格式（来自 SFT 训练数据）：
      REQ: <需求摘要>
      API: <逗号分隔的 API 列表>
      STEPS:
      1. <步骤>
      2. <步骤>
    """
    plan = ParsedPlan(raw=plan_text.strip())

    lines = plan_text.strip().split('\n')
    current_section = None
    steps_buffer = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if stripped.startswith('REQ:'):
            plan.requirements = stripped[4:].strip()
            current_section = 'req'
        elif stripped.startswith('API:'):
            api_str = stripped[4:].strip()
            plan.apis = [a.strip() for a in api_str.split(',') if a.strip()]
            current_section = 'api'
        elif stripped.startswith('STEPS:'):
            current_section = 'steps'
        elif current_section == 'steps':
            step = re.sub(r'^\d+\.\s*', '', stripped)
            if step:
                steps_buffer.append(step)

    plan.steps = steps_buffer
    plan.is_valid = bool(plan.requirements or plan.apis or plan.steps)
    return plan


def parse_model_output(text: str) -> ParsedOutput:
    """
    解析完整模型输出，提取 plan 和 code。

    Args:
        text: 原始模型输出（VeRL 的 solution_str）

    Returns:
        ParsedOutput
    """
    result = ParsedOutput(raw_text=text)

    if not text or not text.strip():
        return result

    # 提取 plan
    plan_match = PLAN_PATTERN.search(text)
    if plan_match:
        plan_content = plan_match.group(1)
        result.plan = parse_plan_block(plan_content)
        result.has_plan = result.plan.is_valid

    # 提取代码（优先围栏块）
    code_match = CODE_BLOCK_PATTERN.search(text)
    if code_match:
        result.code = code_match.group(1).strip()
        result.has_code = bool(result.code)
    elif plan_match:
        # 回退：取 [/PLAN] 之后的文本
        after_plan = text[plan_match.end():].strip()
        after_plan = re.sub(r'^```(?:javascript|js)?\s*\n?', '', after_plan)
        after_plan = re.sub(r'\n?```\s*$', '', after_plan)
        if after_plan and len(after_plan) > 50:
            result.code = after_plan.strip()
            result.has_code = True
    else:
        # 无 plan 标记时，尝试直接提取代码块
        # 可能是格式不规范的输出
        all_text = text.strip()
        if all_text.startswith('```'):
            all_text = re.sub(r'^```(?:javascript|js)?\s*\n?', '', all_text)
            all_text = re.sub(r'\n?```\s*$', '', all_text)
        if all_text and len(all_text) > 50:
            result.code = all_text.strip()
            result.has_code = True

    return result


def extract_code_only(text: str) -> str:
    """快速提取代码部分，失败返回空字符串"""
    parsed = parse_model_output(text)
    return parsed.code
