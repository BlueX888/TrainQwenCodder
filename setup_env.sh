#!/bin/bash
# ============================================
# TrainQwenCodder 虚拟环境一键安装脚本
# ============================================
#
# Usage:
#   bash setup_env.sh          # 默认: 创建 conda 环境 + 安装所有依赖
#   bash setup_env.sh --venv   # 使用 python venv 替代 conda
#   bash setup_env.sh --skip-torch  # 跳过 torch 安装 (已有时)
#
# 安装完成后激活环境:
#   conda activate qwen-train   (conda 模式)
#   source .venv/bin/activate    (venv 模式)
# ============================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_NAME="qwen-train"
PYTHON_VERSION="3.10"
USE_VENV=false
SKIP_TORCH=false

# 解析参数
for arg in "$@"; do
    case $arg in
        --venv)     USE_VENV=true ;;
        --skip-torch) SKIP_TORCH=true ;;
        --help|-h)
            echo "Usage: bash setup_env.sh [--venv] [--skip-torch]"
            echo "  --venv        使用 python venv 替代 conda"
            echo "  --skip-torch  跳过 PyTorch 安装"
            exit 0
            ;;
        *) echo "Unknown option: $arg"; exit 1 ;;
    esac
done

echo "============================================"
echo "  TrainQwenCodder 环境安装"
echo "============================================"
echo "项目路径:  $PROJECT_ROOT"
echo "环境方式:  $(if $USE_VENV; then echo 'venv'; else echo 'conda'; fi)"
echo "环境名称:  $ENV_NAME"
echo "============================================"
echo ""

# ============ 1. 创建 Python 虚拟环境 ============
if $USE_VENV; then
    echo "[1/4] 创建 venv 虚拟环境..."
    VENV_DIR="$PROJECT_ROOT/.venv"
    if [ -d "$VENV_DIR" ]; then
        echo "  已存在: $VENV_DIR (跳过创建)"
    else
        python3 -m venv "$VENV_DIR"
        echo "  已创建: $VENV_DIR"
    fi
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip setuptools wheel
else
    echo "[1/4] 创建 conda 虚拟环境..."
    if conda env list | grep -q "^${ENV_NAME} "; then
        echo "  已存在: $ENV_NAME (跳过创建)"
    else
        conda create -y -n "$ENV_NAME" python="$PYTHON_VERSION"
        echo "  已创建: $ENV_NAME"
    fi
    # conda activate 在脚本中需要 init
    eval "$(conda shell.bash hook)"
    conda activate "$ENV_NAME"
    pip install --upgrade pip setuptools wheel
fi

echo "  Python: $(python --version) @ $(which python)"
echo ""

# ============ 2. 安装 PyTorch ============
if $SKIP_TORCH; then
    echo "[2/4] 跳过 PyTorch 安装 (--skip-torch)"
else
    echo "[2/4] 安装 PyTorch..."
    # macOS: 默认 CPU / MPS
    # Linux: 尝试检测 CUDA
    if [[ "$(uname)" == "Darwin" ]]; then
        echo "  检测到 macOS, 安装 CPU/MPS 版本"
        pip install torch torchvision torchaudio
    else
        # Linux: 检测 CUDA 版本
        if command -v nvidia-smi &> /dev/null; then
            CUDA_VER=$(nvidia-smi | grep -oP 'CUDA Version: \K[0-9]+\.[0-9]+' || echo "")
            echo "  检测到 CUDA: $CUDA_VER"
            if [[ "$CUDA_VER" == 12.* ]]; then
                pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
            elif [[ "$CUDA_VER" == 11.* ]]; then
                pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
            else
                echo "  未知 CUDA 版本, 使用默认安装"
                pip install torch torchvision torchaudio
            fi
        else
            echo "  未检测到 GPU, 安装 CPU 版本"
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        fi
    fi
fi
echo ""

# ============ 3. 安装项目依赖 ============
echo "[3/4] 安装项目 Python 依赖..."
pip install pandas pyarrow
pip install anthropic
pip install transformers accelerate datasets
pip install wandb

# VeRL + vLLM (仅 Linux GPU 环境)
if [[ "$(uname)" == "Linux" ]] && command -v nvidia-smi &> /dev/null; then
    echo "  安装 VeRL + vLLM (GPU 训练环境)..."
    pip install verl vllm
else
    echo "  跳过 VeRL/vLLM (仅 Linux GPU 环境支持)"
    echo "  如需强制安装: pip install verl vllm"
fi
echo ""

# ============ 4. 安装 Node.js 验证器依赖 ============
echo "[4/4] 安装 Node.js 验证器依赖..."
if command -v node &> /dev/null; then
    echo "  Node.js: $(node --version)"
    VALIDATOR_DIR="$PROJECT_ROOT/stage0/validator"
    if [ -d "$VALIDATOR_DIR" ]; then
        (cd "$VALIDATOR_DIR" && npm install 2>&1 | tail -1)
        echo "  验证器依赖已安装"
    else
        echo "  WARNING: $VALIDATOR_DIR 不存在, 跳过"
    fi
else
    echo "  WARNING: Node.js 未安装, 请手动安装: https://nodejs.org/"
fi
echo ""

# ============ 完成 ============
echo "============================================"
echo "  安装完成!"
echo "============================================"
echo ""
if $USE_VENV; then
    echo "激活环境:  source .venv/bin/activate"
else
    echo "激活环境:  conda activate $ENV_NAME"
fi
echo ""
echo "验证安装:"
echo "  python -c \"import pandas; import pyarrow; import transformers; print('OK')\""
echo ""
echo "运行数据准备:"
echo "  python stage2/scripts/prepare_data.py \\"
echo "      --seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \\"
echo "      --out-dir stage2/data/grpo \\"
echo "      --eval-count 300 --seed 42"
echo "============================================"
