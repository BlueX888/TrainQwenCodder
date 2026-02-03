class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = []; // 存储操作序列
    this.recordStartTime = 0;
    this.recordDuration = 1000; // 1秒录制时长
    this.isRecording = false;
    this.isReplaying = false;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayStartTime = 0;
    this.replayIndex = 0;
    this.actionCount = 0; // 可验证状态
    this.totalReplays = 0; // 可验证状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家小球（使用Graphics生成纹理）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setInteractive({ draggable: true });

    // 创建回放时的幽灵小球
    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0xff00ff, 0.5);
    ghostGraphics.fillCircle(20, 20, 20);
    ghostGraphics.generateTexture('ghost', 40, 40);
    ghostGraphics.destroy();

    this.ghost = this.add.sprite(width / 2, height / 2, 'ghost');
    this.ghost.setAlpha(0);

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, height - 100, 
      '拖动绿球操作\n右键开始回放\n1-5键调节回放速度', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 输入事件监听
    this.input.on('dragstart', this.onDragStart, this);
    this.input.on('drag', this.onDrag, this);
    this.input.on('dragend', this.onDragEnd, this);
    
    // 右键监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });

    // 键盘速度调节
    this.input.keyboard.on('keydown-ONE', () => this.setReplaySpeed(0.5));
    this.input.keyboard.on('keydown-TWO', () => this.setReplaySpeed(1.0));
    this.input.keyboard.on('keydown-THREE', () => this.setReplaySpeed(2.0));
    this.input.keyboard.on('keydown-FOUR', () => this.setReplaySpeed(3.0));
    this.input.keyboard.on('keydown-FIVE', () => this.setReplaySpeed(5.0));

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.isRecording = true;
    this.isReplaying = false;
    this.actionCount = 0;
    this.player.setAlpha(1);
    this.ghost.setAlpha(0);
  }

  recordAction(type, data) {
    if (!this.isRecording) return;

    const elapsed = this.time.now - this.recordStartTime;
    
    if (elapsed <= this.recordDuration) {
      this.recordedActions.push({
        time: elapsed,
        type: type,
        data: { ...data }
      });
      this.actionCount++;
    } else if (this.recordedActions.length > 0) {
      // 录制结束，自动停止
      this.isRecording = false;
    }
  }

  onDragStart(pointer, gameObject) {
    this.recordAction('dragstart', {
      x: gameObject.x,
      y: gameObject.y
    });
  }

  onDrag(pointer, gameObject, dragX, dragY) {
    if (!this.isReplaying) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    }

    this.recordAction('drag', {
      x: dragX,
      y: dragY
    });
  }

  onDragEnd(pointer, gameObject) {
    this.recordAction('dragend', {
      x: gameObject.x,
      y: gameObject.y
    });
  }

  startReplay() {
    if (this.recordedActions.length === 0) return;
    if (this.isReplaying) return;

    this.isReplaying = true;
    this.isRecording = false;
    this.replayStartTime = this.time.now;
    this.replayIndex = 0;
    this.totalReplays++;

    // 重置幽灵位置到第一个动作
    if (this.recordedActions.length > 0) {
      const firstAction = this.recordedActions[0];
      this.ghost.setPosition(firstAction.data.x, firstAction.data.y);
      this.ghost.setAlpha(0.7);
    }

    this.player.setAlpha(0.3);
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
  }

  update(time, delta) {
    // 更新状态文本
    let status = '';
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      const remaining = Math.max(0, this.recordDuration - elapsed);
      status = `录制中... 剩余: ${(remaining / 1000).toFixed(2)}s`;
    } else if (this.isReplaying) {
      status = `回放中 (速度: ${this.replaySpeed}x)`;
    } else {
      status = '等待操作...';
    }

    this.statusText.setText([
      status,
      `操作数: ${this.actionCount}`,
      `回放次数: ${this.totalReplays}`,
      `录制操作: ${this.recordedActions.length}`
    ]);

    // 回放逻辑
    if (this.isReplaying && this.recordedActions.length > 0) {
      const elapsed = (time - this.replayStartTime) * this.replaySpeed;

      // 执行所有应该执行的动作
      while (this.replayIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.replayIndex];
        
        if (action.time <= elapsed) {
          // 执行动作
          if (action.type === 'drag' || action.type === 'dragstart' || action.type === 'dragend') {
            this.ghost.setPosition(action.data.x, action.data.y);
          }
          this.replayIndex++;
        } else {
          break;
        }
      }

      // 回放结束
      if (this.replayIndex >= this.recordedActions.length) {
        this.tweens.add({
          targets: this.ghost,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.isReplaying = false;
            this.player.setAlpha(1);
            this.startRecording(); // 重新开始录制
          }
        });
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);