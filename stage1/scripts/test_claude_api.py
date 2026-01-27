"""
快速测试 Claude API 集成

用于验证 API Key、模型调用、输出格式等是否正常。
"""

import os
import sys

try:
    from anthropic import Anthropic
except ImportError:
    print("❌ 错误：未安装 anthropic 库")
    print("请运行：pip install anthropic")
    sys.exit(1)

from common import get_stage1_root


def test_api_connection():
    """测试 API 连接"""
    print("=" * 60)
    print("测试 Claude API 集成")
    print("=" * 60)

    # 检查 API Key
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ 错误：未设置 ANTHROPIC_API_KEY 环境变量")
        print("\n请运行：")
        print("  export ANTHROPIC_API_KEY='sk-ant-xxxxx'")
        return False

    print(f"✓ API Key: {api_key[:20]}...")

    # 初始化客户端
    try:
        client = Anthropic(api_key=api_key)
        print("✓ 客户端初始化成功")
    except Exception as e:
        print(f"❌ 客户端初始化失败: {e}")
        return False

    # 测试简单调用
    print("\n测试 API 调用...")
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": "说一句话测试 API"
                }
            ]
        )
        output = response.content[0].text
        print(f"✓ API 调用成功")
        print(f"  响应: {output[:100]}")
    except Exception as e:
        print(f"❌ API 调用失败: {e}")
        return False

    # 测试 Phaser 代码生成
    print("\n测试 Phaser 代码生成...")

    # 读取系统提示词
    prompt_path = get_stage1_root() / "prompts" / "teacher_system_prompt.txt"
    with open(prompt_path, 'r', encoding='utf-8') as f:
        system_prompt = f.read()

    system_prompt = system_prompt.replace("{API_CONTEXT}", "（测试模式，无 API 上下文）")

    user_message = """请实现以下 Phaser3 游戏功能：

## 任务描述
创建一个简单的旋转方块

## 难度等级
easy

## 涉及模块
Graphics, Transform

## 约束条件
- 使用 HEADLESS 模式
- 使用 Graphics 绘制

请按照规定格式输出 [PLAN] 和完整的 JavaScript 代码。"""

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            temperature=0.7,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )
        output = response.content[0].text
        print(f"✓ Phaser 代码生成成功")

        # 检查输出格式
        has_plan = '[PLAN]' in output and '[/PLAN]' in output
        has_code = '```javascript' in output or '```js' in output
        has_phaser = 'Phaser' in output
        has_game = 'new Phaser.Game' in output

        print(f"\n格式检查:")
        print(f"  {'✓' if has_plan else '✗'} 包含 [PLAN] 块")
        print(f"  {'✓' if has_code else '✗'} 包含代码块")
        print(f"  {'✓' if has_phaser else '✗'} 包含 Phaser 引用")
        print(f"  {'✓' if has_game else '✗'} 包含 Game 实例化")

        if has_plan and has_code and has_phaser and has_game:
            print(f"\n✓ 所有检查通过！")
            print(f"\n生成的代码预览:")
            print("=" * 60)
            print(output[:500] + "..." if len(output) > 500 else output)
            print("=" * 60)
            return True
        else:
            print(f"\n⚠️ 部分检查未通过，请查看输出")
            print(f"\n完整输出:")
            print("=" * 60)
            print(output)
            print("=" * 60)
            return False

    except Exception as e:
        print(f"❌ Phaser 代码生成失败: {e}")
        return False


def main():
    success = test_api_connection()

    print("\n" + "=" * 60)
    if success:
        print("✓ 所有测试通过！可以开始使用 Claude API 蒸馏。")
        print("\n下一步:")
        print("  python run_teacher_claude.py --max-items 10")
    else:
        print("✗ 测试失败，请检查上述错误信息")
    print("=" * 60)

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
