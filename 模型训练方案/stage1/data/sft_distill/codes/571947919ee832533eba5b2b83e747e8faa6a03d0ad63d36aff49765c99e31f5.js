class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    
    // 状态变量
    this.recordingDuration = 1500; // 1.5秒
    this.isRecording = false;
    this.isPlaying = false;
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.playbackSpeed = 1; // 回放速度倍数
    this.playbackIndex = 0;
    
    // 可验证的状态信号
    this.totalRecordings = 0;
    this.totalPlaybacks = 0;
    this.clickCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家对象（跟随鼠标的圆形）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 15);
    this.player.x = 400;
    this.player.y = 300;

    // 创建回放对象（用于回放时显示）
    this.playbackPlayer = this.add.graphics();
    this.playbackPlayer.fillStyle(0xff6b6b, 0.7);
    this.playbackPlayer.fillCircle(0, 0, 15);
    this.playbackPlayer.visible = false;

    // 创建点击效果容器
    this.clickEffects = this.add.group();

    // UI文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 60, 
      '移动鼠标和点击进行操作\n右键开始回放 | 空格键切换速度', {
      fontSize: '16px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(20, 550, '', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 速度指示器
    this.speedText = this.add.text(700, 20, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 输入监听
    this.setupInputListeners();

    // 开始录制
    this.startRecording();

    // 更新UI
    this.updateUI();
  }

  setupInputListeners() {
    // 鼠标移动
    this.input.on('pointermove', (pointer) => {
      if (!this.isPlaying) {
        this.player.x = pointer.x;
        this.player.y = pointer.y;
      }

      // 录制移动操作
      if (this.isRecording) {
        const elapsed = this.time.now - this.recordStartTime;
        if (elapsed <= this.recordingDuration) {
          this.recordedActions.push({
            type: 'move',
            x: pointer.x,
            y: pointer.y,
            time: elapsed
          });
        }
      }
    });

    // 鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        // 右键：开始回放
        if (!this.isPlaying && this.recordedActions.length > 0) {
          this.startPlayback();
        }
      } else {
        // 左键：记录点击
        if (!this.isPlaying) {
          this.clickCount++;
          this.createClickEffect(pointer.x, pointer.y);

          if (this.isRecording) {
            const elapsed = this.time.now - this.recordStartTime;
            if (elapsed <= this.recordingDuration) {
              this.recordedActions.push({
                type: 'click',
                x: pointer.x,
                y: pointer.y,
                time: elapsed
              });
            }
          }
        }
      }
    });

    // 空格键：切换回放速度
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.playbackSpeed === 1) {
        this.playbackSpeed = 2;
      } else if (this.playbackSpeed === 2) {
        this.playbackSpeed = 0.5;
      } else {
        this.playbackSpeed = 1;
      }
      this.updateUI();
    });
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.clickCount = 0;

    // 1.5秒后停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      this.stopRecording();
    });

    this.updateUI();
  }

  stopRecording() {
    this.isRecording = false;
    this.totalRecordings++;
    
    // 优化录制数据（减少冗余的移动记录）
    this.recordedActions = this.optimizeRecording(this.recordedActions);
    
    this.updateUI();
  }

  optimizeRecording(actions) {
    // 只保留每50ms的移动记录，减少数据量
    const optimized = [];
    let lastMoveTime = -100;

    for (const action of actions) {
      if (action.type === 'click') {
        optimized.push(action);
      } else if (action.type === 'move') {
        if (action.time - lastMoveTime >= 50) {
          optimized.push(action);
          lastMoveTime = action.time;
        }
      }
    }

    return optimized;
  }

  startPlayback() {
    if (this.recordedActions.length === 0) return;

    this.isPlaying = true;
    this.playbackIndex = 0;
    this.totalPlaybacks++;

    // 显示回放对象
    this.playbackPlayer.visible = true;
    this.playbackPlayer.x = this.recordedActions[0].x;
    this.playbackPlayer.y = this.recordedActions[0].y;

    // 隐藏实时玩家
    this.player.alpha = 0.3;

    this.updateUI();
    this.playNextAction();
  }

  playNextAction() {
    if (!this.isPlaying || this.playbackIndex >= this.recordedActions.length) {
      this.stopPlayback();
      return;
    }

    const currentAction = this.recordedActions[this.playbackIndex];
    const nextAction = this.recordedActions[this.playbackIndex + 1];

    // 执行当前动作
    if (currentAction.type === 'move') {
      this.playbackPlayer.x = currentAction.x;
      this.playbackPlayer.y = currentAction.y;
    } else if (currentAction.type === 'click') {
      this.createClickEffect(currentAction.x, currentAction.y, true);
    }

    // 计算下一个动作的延迟时间
    if (nextAction) {
      const delay = (nextAction.time - currentAction.time) / this.playbackSpeed;
      this.time.delayedCall(delay, () => {
        this.playbackIndex++;
        this.playNextAction();
      });
    } else {
      // 最后一个动作
      this.playbackIndex++;
      this.time.delayedCall(500, () => {
        this.stopPlayback();
      });
    }
  }

  stopPlayback() {
    this.isPlaying = false;
    this.playbackPlayer.visible = false;
    this.player.alpha = 1;
    
    // 自动开始新的录制
    this.time.delayedCall(500, () => {
      this.startRecording();
    });

    this.updateUI();
  }

  createClickEffect(x, y, isPlayback = false) {
    const effect = this.add.graphics();
    const color = isPlayback ? 0xff6b6b : 0xffff00;
    effect.lineStyle(3, color, 1);
    effect.strokeCircle(0, 0, 10);
    effect.x = x;
    effect.y = y;

    this.clickEffects.add(effect);

    // 动画效果
    this.tweens.add({
      targets: effect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  updateUI() {
    // 状态文本
    let status = '';
    if (this.isRecording) {
      const elapsed = Math.min(this.time.now - this.recordStartTime, this.recordingDuration);
      const remaining = ((this.recordingDuration - elapsed) / 1000).toFixed(1);
      status = `🔴 录制中... ${remaining}s`;
    } else if (this.isPlaying) {
      const progress = ((this.playbackIndex / this.recordedActions.length) * 100).toFixed(0);
      status = `▶️ 回放中... ${progress}%`;
    } else {
      status = `⏸️ 就绪 (${this.recordedActions.length} 个动作已录制)`;
    }
    this.statusText.setText(status);

    // 统计文本
    this.statsText.setText(
      `录制次数: ${this.totalRecordings} | 回放次数: ${this.totalPlaybacks} | 点击次数: ${this.clickCount}`
    );

    // 速度文本
    this.speedText.setText(`速度: ${this.playbackSpeed}x`);
  }

  update(time, delta) {
    this.updateUI();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordPlaybackScene
};

new Phaser.Game(config);