class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = [];
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0; // 可调节的回放速度
    this.replayStartTime = 0;
    this.currentActionIndex = 0;
    
    // 状态信号变量
    this.recordedDuration = 0;
    this.replayProgress = 0;
    this.totalActionsRecorded = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建回放时的玩家纹理（绿色方块）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0x2ecc71, 1);
    replayGraphics.fillRect(0, 0, 40, 40);
    replayGraphics.generateTexture('replayPlayer', 40, 40);
    replayGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.playerSpeed = 200;

    // 创建回放精灵（初始隐藏）
    this.replayPlayer = this.add.sprite(400, 300, 'replayPlayer');
    this.replayPlayer.setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 鼠标点击事件（开始回放）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isRecording && !this.isReplaying && this.recordedActions.length > 0) {
        this.startReplay();
      }
    });

    // 速度调节按键（数字键 1-5）
    this.input.keyboard.on('keydown-ONE', () => this.setReplaySpeed(0.5));
    this.input.keyboard.on('keydown-TWO', () => this.setReplaySpeed(1.0));
    this.input.keyboard.on('keydown-THREE', () => this.setReplaySpeed(1.5));
    this.input.keyboard.on('keydown-FOUR', () => this.setReplaySpeed(2.0));
    this.input.keyboard.on('keydown-FIVE', () => this.setReplaySpeed(3.0));

    // UI 文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'Use WASD/Arrows to move\nRecording starts automatically for 2.5s\nLeft Click to replay\nPress 1-5 to change replay speed', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(10, 140, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(10, 180, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.recordedActions = [];
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.totalActionsRecorded = 0;
    
    // 记录初始位置
    this.recordedActions.push({
      time: 0,
      type: 'position',
      x: this.player.x,
      y: this.player.y
    });

    // 2.5 秒后停止录制
    this.time.delayedCall(2500, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recordedDuration = this.time.now - this.recordStartTime;
    this.totalActionsRecorded = this.recordedActions.length;
  }

  startReplay() {
    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    this.replayProgress = 0;

    // 重置回放玩家位置
    if (this.recordedActions.length > 0) {
      const firstAction = this.recordedActions[0];
      this.replayPlayer.setPosition(firstAction.x, firstAction.y);
      this.replayPlayer.setVisible(true);
    }

    // 隐藏原玩家
    this.player.setAlpha(0.3);
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.setVisible(false);
    this.player.setAlpha(1.0);
    this.replayProgress = 100;
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
  }

  recordAction(type, data) {
    if (!this.isRecording) return;

    const elapsed = this.time.now - this.recordStartTime;
    this.recordedActions.push({
      time: elapsed,
      type: type,
      ...data
    });
  }

  update(time, delta) {
    // 更新玩家移动（仅在非回放时）
    if (!this.isReplaying) {
      const prevX = this.player.x;
      const prevY = this.player.y;

      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        this.player.x -= this.playerSpeed * delta / 1000;
      }
      if (this.cursors.right.isDown || this.wasd.D.isDown) {
        this.player.x += this.playerSpeed * delta / 1000;
      }
      if (this.cursors.up.isDown || this.wasd.W.isDown) {
        this.player.y -= this.playerSpeed * delta / 1000;
      }
      if (this.cursors.down.isDown || this.wasd.S.isDown) {
        this.player.y += this.playerSpeed * delta / 1000;
      }

      // 边界检测
      this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
      this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

      // 记录移动
      if (this.isRecording && (prevX !== this.player.x || prevY !== this.player.y)) {
        this.recordAction('move', {
          x: this.player.x,
          y: this.player.y
        });
      }
    }

    // 回放逻辑
    if (this.isReplaying) {
      const replayElapsed = (time - this.replayStartTime) * this.replaySpeed;
      
      // 查找并应用当前时间点的所有操作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.time <= replayElapsed) {
          if (action.type === 'position' || action.type === 'move') {
            this.replayPlayer.setPosition(action.x, action.y);
          }
          this.currentActionIndex++;
        } else {
          break;
        }
      }

      // 计算回放进度
      if (this.recordedDuration > 0) {
        this.replayProgress = Math.min(100, (replayElapsed / this.recordedDuration) * 100);
      }

      // 回放结束
      if (this.currentActionIndex >= this.recordedActions.length) {
        this.stopReplay();
      }
    }

    // 更新 UI
    this.updateUI();
  }

  updateUI() {
    let status = '';
    if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, 2500 - elapsed);
      status = `🔴 RECORDING... (${(remaining / 1000).toFixed(1)}s remaining)`;
    } else if (this.isReplaying) {
      status = `▶️ REPLAYING (${this.replayProgress.toFixed(0)}%)`;
    } else if (this.recordedActions.length > 0) {
      status = `⏸️ READY TO REPLAY (Click to start)`;
    } else {
      status = `⏹️ IDLE`;
    }

    this.statusText.setText(status);
    this.speedText.setText(`Replay Speed: ${this.replaySpeed}x (Press 1-5 to change)`);
    
    this.statsText.setText(
      `Stats:\n` +
      `Actions Recorded: ${this.totalActionsRecorded}\n` +
      `Duration: ${(this.recordedDuration / 1000).toFixed(2)}s\n` +
      `Replay Progress: ${this.replayProgress.toFixed(0)}%`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: RecordReplayScene
};

new Phaser.Game(config);