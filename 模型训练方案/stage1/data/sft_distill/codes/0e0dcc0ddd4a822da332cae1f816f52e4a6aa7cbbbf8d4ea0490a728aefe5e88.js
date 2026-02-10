class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = []; // 记录的操作序列
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.currentActionIndex = 0;
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 状态信号
    this.recordedCount = 0; // 记录的操作数量
    this.replayProgress = 0; // 回放进度百分比
    this.currentMode = 'idle'; // idle, recording, replaying
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（蓝色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x0088ff, 1);
    this.player.fillRect(-15, -15, 30, 30);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放时的影子玩家（半透明绿色方块）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0x00ff88, 0.6);
    this.replayPlayer.fillRect(-15, -15, 30, 30);
    this.replayPlayer.x = this.playerX;
    this.replayPlayer.y = this.playerY;
    this.replayPlayer.visible = false;

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'Press Arrow Keys to move\nRecording will start automatically', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(10, 120, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD键用于触发回放
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 速度调节键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 开始录制
    this.startRecording();

    this.updateUI();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.currentMode = 'recording';
    this.recordedCount = 0;

    this.instructionText.setText(
      'RECORDING... Move with Arrow Keys\nRecording will stop in 2 seconds'
    );

    // 2秒后停止录制
    this.time.delayedCall(2000, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.currentMode = 'idle';
    
    this.instructionText.setText(
      `Recording complete! ${this.recordedActions.length} actions recorded\n` +
      'Press W/A/S/D to replay\n' +
      'Press 1 (0.5x), 2 (1x), 3 (2x) to change speed'
    );
  }

  startReplay() {
    if (this.recordedActions.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.currentMode = 'replaying';
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    this.replayProgress = 0;

    // 重置回放玩家位置
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.visible = true;

    this.instructionText.setText(
      `REPLAYING at ${this.replaySpeed}x speed...\n` +
      'Press 1 (0.5x), 2 (1x), 3 (2x) to change speed'
    );
  }

  recordAction(direction, timestamp) {
    if (!this.isRecording) return;

    const relativeTime = timestamp - this.recordStartTime;
    this.recordedActions.push({
      direction: direction,
      time: relativeTime
    });
    this.recordedCount++;
  }

  update(time, delta) {
    // 处理速度调节
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.replaySpeed = 0.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.replaySpeed = 1.0;
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.replaySpeed = 2.0;
    }

    // 录制模式：控制玩家移动并记录操作
    if (this.isRecording) {
      let moved = false;
      const moveDistance = (this.playerSpeed * delta) / 1000;

      if (this.cursors.left.isDown) {
        this.player.x -= moveDistance;
        this.recordAction('left', time);
        moved = true;
      }
      if (this.cursors.right.isDown) {
        this.player.x += moveDistance;
        this.recordAction('right', time);
        moved = true;
      }
      if (this.cursors.up.isDown) {
        this.player.y -= moveDistance;
        this.recordAction('up', time);
        moved = true;
      }
      if (this.cursors.down.isDown) {
        this.player.y += moveDistance;
        this.recordAction('down', time);
        moved = true;
      }

      // 边界检测
      this.player.x = Phaser.Math.Clamp(this.player.x, 15, 785);
      this.player.y = Phaser.Math.Clamp(this.player.y, 15, 585);
    }

    // 检测WASD键触发回放
    if (!this.isReplaying && this.recordedActions.length > 0) {
      if (Phaser.Input.Keyboard.JustDown(this.wKey) ||
          Phaser.Input.Keyboard.JustDown(this.aKey) ||
          Phaser.Input.Keyboard.JustDown(this.sKey) ||
          Phaser.Input.Keyboard.JustDown(this.dKey)) {
        this.startReplay();
      }
    }

    // 回放模式：根据记录的操作移动回放玩家
    if (this.isReplaying) {
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
      const moveDistance = (this.playerSpeed * delta * this.replaySpeed) / 1000;

      // 执行当前时间点应该执行的所有操作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.time <= elapsedTime) {
          // 执行动作
          switch (action.direction) {
            case 'left':
              this.replayPlayer.x -= moveDistance;
              break;
            case 'right':
              this.replayPlayer.x += moveDistance;
              break;
            case 'up':
              this.replayPlayer.y -= moveDistance;
              break;
            case 'down':
              this.replayPlayer.y += moveDistance;
              break;
          }
          
          this.currentActionIndex++;
        } else {
          break;
        }
      }

      // 边界检测
      this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 15, 785);
      this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 15, 585);

      // 计算回放进度
      if (this.recordedActions.length > 0) {
        const lastActionTime = this.recordedActions[this.recordedActions.length - 1].time;
        this.replayProgress = Math.min(100, (elapsedTime / lastActionTime) * 100);
      }

      // 检查回放是否完成
      if (this.currentActionIndex >= this.recordedActions.length && elapsedTime > 2000) {
        this.isReplaying = false;
        this.currentMode = 'idle';
        this.replayPlayer.visible = false;
        this.replayProgress = 100;
        
        this.instructionText.setText(
          'Replay complete!\n' +
          'Press W/A/S/D to replay again\n' +
          'Press 1 (0.5x), 2 (1x), 3 (2x) to change speed'
        );
      }
    }

    this.updateUI();
  }

  updateUI() {
    // 状态文本
    let statusMsg = `Mode: ${this.currentMode.toUpperCase()}`;
    if (this.isRecording) {
      const elapsed = Math.min(2000, this.time.now - this.recordStartTime);
      statusMsg += ` | Time: ${(elapsed / 1000).toFixed(1)}s / 2.0s`;
    }
    this.statusText.setText(statusMsg);

    // 速度文本
    if (this.currentMode !== 'recording') {
      this.speedText.setText(`Replay Speed: ${this.replaySpeed}x`);
    } else {
      this.speedText.setText('');
    }

    // 统计信息
    this.statsText.setText(
      `Stats:\n` +
      `- Recorded Actions: ${this.recordedCount}\n` +
      `- Replay Progress: ${this.replayProgress.toFixed(0)}%\n` +
      `- Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `- Replay Pos: (${Math.round(this.replayPlayer.x)}, ${Math.round(this.replayPlayer.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene
};

new Phaser.Game(config);