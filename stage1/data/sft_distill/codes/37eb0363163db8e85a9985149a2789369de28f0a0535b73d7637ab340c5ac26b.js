class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.isRecording = false;
    this.isReplaying = false;
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    this.playerX = 400;
    this.playerY = 300;
  }

  preload() {
    // 无需外部资源
  }

  create() {
    // 创建玩家角色（可拖动的绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建录制指示器（红色圆点）
    this.recordIndicator = this.add.graphics();
    this.recordIndicator.fillStyle(0xff0000, 1);
    this.recordIndicator.fillCircle(30, 30, 10);
    this.recordIndicator.setVisible(false);

    // 状态文本
    this.statusText = this.add.text(60, 20, 'Status: Idle', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 操作提示
    this.helpText = this.add.text(10, 60, 
      'Left Click & Drag: Move player\n' +
      'Space: Start 1s recording\n' +
      'Right Click: Replay\n' +
      '1/2/3: Speed 0.5x/1x/2x', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 录制的操作数量
    this.actionCountText = this.add.text(10, 550, 'Recorded: 0 actions', {
      fontSize: '16px',
      color: '#00ffff'
    });

    // 回放速度文本
    this.speedText = this.add.text(600, 20, 'Speed: 1.0x', {
      fontSize: '20px',
      color: '#ff00ff'
    });

    // 鼠标拖拽逻辑
    this.isDragging = false;
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        const distance = Phaser.Math.Distance.Between(
          pointer.x, pointer.y,
          this.player.x, this.player.y
        );
        if (distance < 30) {
          this.isDragging = true;
          if (this.isRecording) {
            this.recordAction('dragStart', pointer.x, pointer.y);
          }
        }
      } else if (pointer.rightButtonDown() && !this.isReplaying && this.recordedActions.length > 0) {
        this.startReplay();
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isDragging && !this.isReplaying) {
        this.playerX = pointer.x;
        this.playerY = pointer.y;
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        if (this.isRecording) {
          this.recordAction('move', pointer.x, pointer.y);
        }
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased()) {
        this.isDragging = false;
        if (this.isRecording) {
          this.recordAction('dragEnd', pointer.x, pointer.y);
        }
      }
    });

    // 键盘输入 - 开始录制
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      if (!this.isRecording && !this.isReplaying) {
        this.startRecording();
      }
    });

    // 速度控制键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    this.key1.on('down', () => { this.setReplaySpeed(0.5); });
    this.key2.on('down', () => { this.setReplaySpeed(1.0); });
    this.key3.on('down', () => { this.setReplaySpeed(2.0); });

    // 状态验证变量
    this.score = 0;
    this.replayCount = 0;
  }

  startRecording() {
    this.recordedActions = [];
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.recordIndicator.setVisible(true);
    this.statusText.setText('Status: Recording...');
    this.score = 0;

    // 1秒后自动停止录制
    this.time.delayedCall(1000, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recordIndicator.setVisible(false);
    this.statusText.setText('Status: Recording Complete');
    this.actionCountText.setText(`Recorded: ${this.recordedActions.length} actions`);
    this.score = this.recordedActions.length;
  }

  recordAction(type, x, y) {
    const timestamp = this.time.now - this.recordStartTime;
    this.recordedActions.push({
      type: type,
      x: x,
      y: y,
      timestamp: timestamp
    });
  }

  startReplay() {
    this.isReplaying = true;
    this.replayIndex = 0;
    this.statusText.setText('Status: Replaying...');
    this.replayCount++;

    // 重置玩家位置到第一个动作
    if (this.recordedActions.length > 0) {
      const firstAction = this.recordedActions[0];
      this.playerX = firstAction.x;
      this.playerY = firstAction.y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }

    this.replayNextAction();
  }

  replayNextAction() {
    if (this.replayIndex >= this.recordedActions.length) {
      this.stopReplay();
      return;
    }

    const currentAction = this.recordedActions[this.replayIndex];
    
    // 执行动作
    if (currentAction.type === 'move' || currentAction.type === 'dragStart' || currentAction.type === 'dragEnd') {
      this.playerX = currentAction.x;
      this.playerY = currentAction.y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }

    this.replayIndex++;

    // 计算下一个动作的延迟时间
    if (this.replayIndex < this.recordedActions.length) {
      const nextAction = this.recordedActions[this.replayIndex];
      const delay = (nextAction.timestamp - currentAction.timestamp) / this.replaySpeed;
      
      this.time.delayedCall(delay, () => {
        this.replayNextAction();
      });
    } else {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.statusText.setText('Status: Replay Complete');
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    this.speedText.setText(`Speed: ${speed.toFixed(1)}x`);
  }

  update(time, delta) {
    // 更新录制指示器闪烁效果
    if (this.isRecording) {
      const alpha = Math.sin(time / 100) * 0.5 + 0.5;
      this.recordIndicator.setAlpha(alpha);
    }

    // 回放时改变玩家颜色
    if (this.isReplaying) {
      this.player.clear();
      this.player.fillStyle(0xff00ff, 1);
      this.player.fillRect(-20, -20, 40, 40);
    } else if (!this.isDragging) {
      this.player.clear();
      this.player.fillStyle(0x00ff00, 1);
      this.player.fillRect(-20, -20, 40, 40);
    } else {
      this.player.clear();
      this.player.fillStyle(0xffff00, 1);
      this.player.fillRect(-20, -20, 40, 40);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene
};

new Phaser.Game(config);