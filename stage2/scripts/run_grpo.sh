#!/bin/bash
# VeRL GRPO Training for Qwen2.5-Coder-0.5B on Phaser3 code generation.
#
# 前置条件:
#   - VeRL 已安装: pip install verl
#   - SFT 模型路径: $MODEL_PATH
#   - 数据已准备: stage2/data/grpo/{train,eval}.parquet
#   - Node.js + stage0/validator 依赖已安装
#
# Usage:
#   bash stage2/scripts/run_grpo.sh [ADDITIONAL_OVERRIDES...]

set -euo pipefail

# ============ 路径 ============
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STAGE2_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$STAGE2_ROOT/.." && pwd)"

# 模型路径：阶段一 SFT 微调后的 Qwen2.5-Coder-0.5B
MODEL_PATH="${MODEL_PATH:-$PROJECT_ROOT/model/sft_checkpoint}"

# 数据路径
TRAIN_DATA="${TRAIN_DATA:-$STAGE2_ROOT/data/grpo/train.parquet}"
EVAL_DATA="${EVAL_DATA:-$STAGE2_ROOT/data/grpo/eval.parquet}"

# 奖励函数路径
REWARD_FN_PATH="${REWARD_FN_PATH:-$STAGE2_ROOT/scripts/reward_phaser.py}"
REWARD_FN_NAME="${REWARD_FN_NAME:-compute_score}"

# ============ 验证器环境 ============
export GRPO_VALIDATOR_WORKERS="${GRPO_VALIDATOR_WORKERS:-8}"
export GRPO_SKIP_RUNTIME="${GRPO_SKIP_RUNTIME:-1}"
export GRPO_SKIP_ESLINT="${GRPO_SKIP_ESLINT:-0}"

# 确保 Node.js 验证器依赖可用
export NODE_PATH="$PROJECT_ROOT/stage0/validator/node_modules:$PROJECT_ROOT/stage0/node_modules"

# 将 stage2/scripts 加入 PYTHONPATH（奖励函数的模块导入）
export PYTHONPATH="${PYTHONPATH:-}:$STAGE2_ROOT/scripts"

# ============ 训练超参数 ============
# 组大小 G=8：每个 prompt 生成 8 个响应
GROUP_SIZE="${GROUP_SIZE:-8}"

# 批大小：每步训练的 prompt 数量
TRAIN_BATCH_SIZE="${TRAIN_BATCH_SIZE:-16}"

# 学习率
LR="${LR:-3e-6}"

# KL 设置
KL_LOSS_COEF="${KL_LOSS_COEF:-0.01}"
KL_LOSS_TYPE="${KL_LOSS_TYPE:-low_var_kl}"

# 生成设置
MAX_PROMPT_LENGTH="${MAX_PROMPT_LENGTH:-512}"
MAX_RESPONSE_LENGTH="${MAX_RESPONSE_LENGTH:-2048}"

# 训练时长
TOTAL_EPOCHS="${TOTAL_EPOCHS:-15}"
SAVE_FREQ="${SAVE_FREQ:-10}"
TEST_FREQ="${TEST_FREQ:-5}"

# GPU 配置（0.5B 单卡）
N_GPUS="${N_GPUS:-1}"

# ============ 前置检查 ============
echo "=== GRPO Training Configuration ==="
echo "Model:       $MODEL_PATH"
echo "Train data:  $TRAIN_DATA"
echo "Eval data:   $EVAL_DATA"
echo "Reward fn:   $REWARD_FN_PATH::$REWARD_FN_NAME"
echo "Group size:  $GROUP_SIZE"
echo "Batch size:  $TRAIN_BATCH_SIZE"
echo "LR:          $LR"
echo "KL coef:     $KL_LOSS_COEF"
echo "GPUs:        $N_GPUS"
echo "Epochs:      $TOTAL_EPOCHS"
echo "Validator:   workers=$GRPO_VALIDATOR_WORKERS, skip_runtime=$GRPO_SKIP_RUNTIME, skip_eslint=$GRPO_SKIP_ESLINT"
echo "==================================="

# 检查关键文件存在
for f in "$MODEL_PATH" "$TRAIN_DATA" "$EVAL_DATA" "$REWARD_FN_PATH"; do
    if [ ! -e "$f" ]; then
        echo "ERROR: Required path not found: $f"
        exit 1
    fi
done

# 检查 Node.js 和验证器可用
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js."
    exit 1
fi

VALIDATOR_CLI="$PROJECT_ROOT/stage0/validator/src/cli.js"
if [ ! -f "$VALIDATOR_CLI" ]; then
    echo "ERROR: Validator CLI not found: $VALIDATOR_CLI"
    exit 1
fi

# ============ 启动 VeRL GRPO 训练 ============
echo ""
echo "Starting VeRL GRPO training..."
echo ""

PYTHONUNBUFFERED=1 python3 -m verl.trainer.main_ppo \
    algorithm.adv_estimator=grpo \
    \
    data.train_files="$TRAIN_DATA" \
    data.val_files="$EVAL_DATA" \
    data.train_batch_size=$TRAIN_BATCH_SIZE \
    data.max_prompt_length=$MAX_PROMPT_LENGTH \
    data.max_response_length=$MAX_RESPONSE_LENGTH \
    data.filter_overlong_prompts=True \
    data.truncation=error \
    data.shuffle=True \
    \
    actor_rollout_ref.model.path="$MODEL_PATH" \
    actor_rollout_ref.model.use_remove_padding=True \
    actor_rollout_ref.model.enable_gradient_checkpointing=True \
    \
    actor_rollout_ref.actor.optim.lr=$LR \
    actor_rollout_ref.actor.ppo_mini_batch_size=$((TRAIN_BATCH_SIZE * GROUP_SIZE)) \
    actor_rollout_ref.actor.ppo_micro_batch_size_per_gpu=8 \
    actor_rollout_ref.actor.ppo_epochs=1 \
    actor_rollout_ref.actor.clip_ratio=0.2 \
    actor_rollout_ref.actor.use_kl_loss=True \
    actor_rollout_ref.actor.kl_loss_coef=$KL_LOSS_COEF \
    actor_rollout_ref.actor.kl_loss_type=$KL_LOSS_TYPE \
    actor_rollout_ref.actor.entropy_coeff=0.0 \
    actor_rollout_ref.actor.loss_agg_mode=token-mean \
    actor_rollout_ref.actor.fsdp_config.param_offload=False \
    actor_rollout_ref.actor.fsdp_config.optimizer_offload=False \
    \
    actor_rollout_ref.rollout.name=vllm \
    actor_rollout_ref.rollout.n=$GROUP_SIZE \
    actor_rollout_ref.rollout.tensor_model_parallel_size=1 \
    actor_rollout_ref.rollout.gpu_memory_utilization=0.85 \
    actor_rollout_ref.rollout.temperature=0.7 \
    actor_rollout_ref.rollout.top_p=0.9 \
    actor_rollout_ref.rollout.load_format=safetensors \
    actor_rollout_ref.rollout.log_prob_micro_batch_size_per_gpu=8 \
    \
    actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu=8 \
    actor_rollout_ref.ref.fsdp_config.param_offload=True \
    \
    algorithm.use_kl_in_reward=False \
    \
    custom_reward_function.path="$REWARD_FN_PATH" \
    custom_reward_function.name="$REWARD_FN_NAME" \
    \
    trainer.critic_warmup=0 \
    trainer.logger='["console","wandb"]' \
    trainer.project_name=phaser3_grpo \
    trainer.experiment_name=qwen05b_grpo_v1 \
    trainer.n_gpus_per_node=$N_GPUS \
    trainer.nnodes=1 \
    trainer.save_freq=$SAVE_FREQ \
    trainer.test_freq=$TEST_FREQ \
    trainer.total_epochs=$TOTAL_EPOCHS \
    trainer.resume_mode=auto \
    trainer.save_total_limit=5 \
    trainer.val_before_train=True \
    \
    "$@"
