class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.recordDuration = 3000; // 3秒
    this.isRecording = false;
    this.isReplaying = false;
    this.replaySpeed = 1.0;
    this.replayStartTime = 0;
    this.currentActionIndex = 0;
    
    // 状态信号
    this.recordCount = 0;
    this.replayCount = 0;
    this.totalActionsRecorded = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = width / 2;
    this.player.y = height / 2;
    this.playerSpeed = 200;

    // 创建录制指示器
    this.recordIndicator = this.add.graphics();
    this.recordIndicator.fillStyle(0xff0000, 1);
    this.recordIndicator.fillCircle(30, 30, 10);
    this.recordIndicator.setVisible(false);

    // 创建回放指示器
    this.replayIndicator = this.add.graphics();
    this.replayIndicator.fillStyle(0x0000ff, 1);
    this.replayIndicator.fillCircle(30, 30, 10);
    this.replayIndicator.setVisible(false);

    // 创建UI文本
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, height - 120, 
      'Press SPACE to start recording (3s)\n' +
      'Arrow Keys: Move player\n' +
      'W/A/S/D: Start replay\n' +
      '1-5: Replay speed (0.5x, 1x, 1.5x, 2x, 3x)', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // WASD键用于触发回放
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 速度调整键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.key5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);

    // 监听空格键开始录制
    this.spaceKey.on('down', () => {
      if (!this.isRecording && !this.isReplaying) {
        this.startRecording();
      }
    });

    // 监听WASD键开始回放
    const replayKeys = [this.wKey, this.aKey, this.sKey, this.dKey];
    replayKeys.forEach(key => {
      key.on('down', () => {
        if (!this.isRecording && !this.isReplaying && this.recordedActions.length > 0) {
          this.startReplay();
        }
      });
    });

    // 监听速度调整键
    this.key1.on('down', () => this.setReplaySpeed(0.5));
    this.key2.on('down', () => this.setReplaySpeed(1.0));
    this.key3.on('down', () => this.setReplaySpeed(1.5));
    this.key4.on('down', () => this.setReplaySpeed(2.0));
    this.key5.on('down', () => this.setReplaySpeed(3.0));

    this.updateStatusText();
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.recordIndicator.setVisible(true);
    this.recordCount++;

    console.log('Recording started...');

    // 3秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recordIndicator.setVisible(false);
    this.totalActionsRecorded = this.recordedActions.length;
    
    console.log(`Recording stopped. Total actions: ${this.totalActionsRecorded}`);
    this.updateStatusText();
  }

  startReplay() {
    if (this.recordedActions.length === 0) return;

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    this.replayIndicator.setVisible(true);
    this.replayCount++;

    // 重置玩家位置到录制开始时的位置
    const firstAction = this.recordedActions[0];
    if (firstAction) {
      this.player.x = firstAction.playerX;
      this.player.y = firstAction.playerY;
    }

    console.log(`Replay started at ${this.replaySpeed}x speed`);
    this.updateStatusText();
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayIndicator.setVisible(false);
    
    console.log('Replay finished');
    this.updateStatusText();
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    console.log(`Replay speed set to ${speed}x`);
    this.updateStatusText();
  }

  recordAction(keyState) {
    if (!this.isRecording) return;

    const timestamp = this.time.now - this.recordStartTime;
    this.recordedActions.push({
      timestamp: timestamp,
      left: keyState.left,
      right: keyState.right,
      up: keyState.up,
      down: keyState.down,
      playerX: this.player.x,
      playerY: this.player.y
    });
  }

  update(time, delta) {
    if (this.isRecording) {
      // 录制模式：玩家可以控制移动
      this.handlePlayerMovement(delta);
      
      // 记录当前按键状态
      const keyState = {
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown
      };

      // 只在有按键按下时记录
      if (keyState.left || keyState.right || keyState.up || keyState.down) {
        this.recordAction(keyState);
      }

      // 更新录制进度
      const elapsed = time - this.recordStartTime;
      const remaining = Math.max(0, (this.recordDuration - elapsed) / 1000);
      this.updateStatusText(remaining);

    } else if (this.isReplaying) {
      // 回放模式：根据录制的操作移动玩家
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

      // 执行所有应该在当前时间点执行的动作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.timestamp <= elapsedTime) {
          // 应用录制的移动
          this.applyRecordedMovement(action, delta);
          this.currentActionIndex++;
        } else {
          break;
        }
      }

      // 检查回放是否结束
      if (this.currentActionIndex >= this.recordedActions.length) {
        this.stopReplay();
      } else {
        const progress = (this.currentActionIndex / this.recordedActions.length * 100).toFixed(1);
        this.updateStatusText(null, progress);
      }

    } else {
      // 空闲模式：玩家可以自由移动
      this.handlePlayerMovement(delta);
      this.updateStatusText();
    }
  }

  handlePlayerMovement(delta) {
    const speed = this.playerSpeed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, this.cameras.main.width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, this.cameras.main.height - 16);
  }

  applyRecordedMovement(action, delta) {
    const speed = this.playerSpeed * (delta / 1000);

    if (action.left) {
      this.player.x -= speed;
    }
    if (action.right) {
      this.player.x += speed;
    }
    if (action.up) {
      this.player.y -= speed;
    }
    if (action.down) {
      this.player.y += speed;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, this.cameras.main.width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, this.cameras.main.height - 16);
  }

  updateStatusText(recordTimeRemaining = null, replayProgress = null) {
    let status = `Status: `;
    
    if (this.isRecording) {
      status += `RECORDING (${recordTimeRemaining?.toFixed(1)}s remaining)`;
    } else if (this.isReplaying) {
      status += `REPLAYING (${replayProgress}% - ${this.replaySpeed}x speed)`;
    } else {
      status += `IDLE`;
    }

    status += `\nRecord Count: ${this.recordCount}`;
    status += `\nReplay Count: ${this.replayCount}`;
    status += `\nActions Recorded: ${this.totalActionsRecorded}`;
    status += `\nReplay Speed: ${this.replaySpeed}x`;
    status += `\nPlayer Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`;

    this.statusText.setText(status);
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