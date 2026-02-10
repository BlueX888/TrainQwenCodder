class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.playerX = 400;
    this.playerY = 300;
    this.recordedActions = []; // 存储 {time, key, x, y}
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.recordDuration = 2500; // 2.5秒
    this.currentReplayIndex = 0;
    
    // 状态信号
    this.actionCount = 0; // 记录的操作数
    this.replayProgress = 0; // 回放进度 0-100
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.setPosition(this.playerX, this.playerY);

    // 创建轨迹记录可视化
    this.trailGraphics = this.add.graphics();
    this.trailGraphics.lineStyle(2, 0xffff00, 0.5);

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 550, 
      'WASD: Move | SPACE: Start Replay | 1/2/3: Speed 0.5x/1x/2x', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // 开始录制
    this.startRecording();

    // 速度调节
    this.keys.ONE.on('down', () => {
      this.replaySpeed = 0.5;
      this.updateStatusText();
    });

    this.keys.TWO.on('down', () => {
      this.replaySpeed = 1.0;
      this.updateStatusText();
    });

    this.keys.THREE.on('down', () => {
      this.replaySpeed = 2.0;
      this.updateStatusText();
    });

    // 空格键开始回放
    this.keys.SPACE.on('down', () => {
      if (!this.isRecording && !this.isReplaying && this.recordedActions.length > 0) {
        this.startReplay();
      }
    });

    this.updateStatusText();
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.actionCount = 0;
    this.trailGraphics.clear();

    // 2.5秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });

    this.updateStatusText();
  }

  stopRecording() {
    this.isRecording = false;
    this.updateStatusText();
  }

  startReplay() {
    this.isReplaying = true;
    this.currentReplayIndex = 0;
    this.replayStartTime = this.time.now;
    this.replayProgress = 0;

    // 重置玩家位置到初始位置
    if (this.recordedActions.length > 0) {
      const firstAction = this.recordedActions[0];
      this.playerX = firstAction.x;
      this.playerY = firstAction.y;
      this.player.setPosition(this.playerX, this.playerY);
    }

    // 清除轨迹
    this.trailGraphics.clear();
    this.trailGraphics.lineStyle(2, 0xff00ff, 0.8);

    this.updateStatusText();
  }

  recordAction(key) {
    if (!this.isRecording) return;

    const currentTime = this.time.now - this.recordStartTime;
    
    this.recordedActions.push({
      time: currentTime,
      key: key,
      x: this.playerX,
      y: this.playerY
    });

    this.actionCount++;

    // 绘制轨迹点
    this.trailGraphics.fillStyle(0xffff00, 0.6);
    this.trailGraphics.fillCircle(this.playerX, this.playerY, 3);
  }

  update(time, delta) {
    if (this.isRecording) {
      this.handleRecordingInput();
    } else if (this.isReplaying) {
      this.handleReplay();
    }

    this.updateStatusText();
  }

  handleRecordingInput() {
    const speed = 3;
    let moved = false;

    if (this.keys.W.isDown) {
      this.playerY -= speed;
      moved = true;
      this.recordAction('W');
    }
    if (this.keys.S.isDown) {
      this.playerY += speed;
      moved = true;
      this.recordAction('S');
    }
    if (this.keys.A.isDown) {
      this.playerX -= speed;
      moved = true;
      this.recordAction('A');
    }
    if (this.keys.D.isDown) {
      this.playerX += speed;
      moved = true;
      this.recordAction('D');
    }

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
    this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);

    this.player.setPosition(this.playerX, this.playerY);
  }

  handleReplay() {
    const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;

    // 处理所有应该执行的动作
    while (this.currentReplayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.currentReplayIndex];
      
      if (action.time <= elapsedTime) {
        this.playerX = action.x;
        this.playerY = action.y;
        this.player.setPosition(this.playerX, this.playerY);

        // 绘制回放轨迹
        this.trailGraphics.fillStyle(0xff00ff, 0.8);
        this.trailGraphics.fillCircle(this.playerX, this.playerY, 3);

        this.currentReplayIndex++;
      } else {
        break;
      }
    }

    // 计算回放进度
    if (this.recordedActions.length > 0) {
      const totalDuration = this.recordedActions[this.recordedActions.length - 1].time;
      this.replayProgress = Math.min(100, Math.floor((elapsedTime / totalDuration) * 100));
    }

    // 回放结束
    if (this.currentReplayIndex >= this.recordedActions.length) {
      this.isReplaying = false;
      this.replayProgress = 100;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const recordingTime = this.isRecording 
      ? Math.max(0, this.recordDuration - (this.time.now - this.recordStartTime))
      : 0;

    let status = '';
    
    if (this.isRecording) {
      status = `RECORDING... ${(recordingTime / 1000).toFixed(1)}s left`;
    } else if (this.isReplaying) {
      status = `REPLAYING... ${this.replayProgress}% (Speed: ${this.replaySpeed}x)`;
    } else {
      status = `READY TO REPLAY (Speed: ${this.replaySpeed}x)`;
    }

    this.statusText.setText([
      status,
      `Actions Recorded: ${this.actionCount}`,
      `Total Actions: ${this.recordedActions.length}`
    ]);
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