class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 3000; // 3秒录制时间
    this.recordings = []; // 存储录制的操作
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.currentReplayIndex = 0;
    this.playerX = 400;
    this.playerY = 300;
    this.playerVelocity = 200; // 像素/秒
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建玩家方块（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(this.playerX, this.playerY, 'player');

    // 创建回放幽灵（半透明）
    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0x0088ff, 0.5);
    ghostGraphics.fillRect(-20, -20, 40, 40);
    ghostGraphics.generateTexture('ghost', 40, 40);
    ghostGraphics.destroy();

    this.ghost = this.add.sprite(this.playerX, this.playerY, 'ghost');
    this.ghost.setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE
    });

    // 鼠标输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isRecording && !this.isReplaying && this.recordings.length > 0) {
        this.startReplay();
      }
    });

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'WASD: Move | 1/2/3: Speed (0.5x/1x/2x) | Left Click: Replay', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.recordingTimerText = this.add.text(10, 90, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示录制数据统计
    this.statsText = this.add.text(10, 130, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始录制
    this.startRecording();

    // 速度调节
    this.input.keyboard.on('keydown-ONE', () => {
      this.replaySpeed = 0.5;
      this.updateStatus();
    });

    this.input.keyboard.on('keydown-TWO', () => {
      this.replaySpeed = 1.0;
      this.updateStatus();
    });

    this.input.keyboard.on('keydown-THREE', () => {
      this.replaySpeed = 2.0;
      this.updateStatus();
    });

    this.updateStatus();
  }

  startRecording() {
    this.isRecording = true;
    this.recordings = [];
    this.recordStartTime = this.time.now;
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    this.player.setAlpha(1);
    this.ghost.setVisible(false);

    // 3秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });

    this.updateStatus();
  }

  stopRecording() {
    this.isRecording = false;
    this.updateStatus();
  }

  startReplay() {
    if (this.recordings.length === 0) return;

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentReplayIndex = 0;

    // 重置玩家位置到录制起点
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    this.player.setAlpha(0.3); // 降低透明度

    // 显示回放幽灵
    this.ghost.setPosition(this.playerX, this.playerY);
    this.ghost.setVisible(true);

    this.updateStatus();
  }

  recordInput() {
    const timestamp = this.time.now - this.recordStartTime;
    const inputState = {
      time: timestamp,
      w: this.cursors.W.isDown,
      a: this.cursors.A.isDown,
      s: this.cursors.S.isDown,
      d: this.cursors.D.isDown
    };
    this.recordings.push(inputState);
  }

  updateStatus() {
    let status = '';
    if (this.isRecording) {
      status = 'STATUS: RECORDING';
    } else if (this.isReplaying) {
      status = `STATUS: REPLAYING (Speed: ${this.replaySpeed}x)`;
    } else if (this.recordings.length > 0) {
      status = `STATUS: READY TO REPLAY (Speed: ${this.replaySpeed}x)`;
    } else {
      status = 'STATUS: IDLE';
    }
    this.statusText.setText(status);

    if (this.recordings.length > 0) {
      this.statsText.setText(`Recorded Frames: ${this.recordings.length}`);
    } else {
      this.statsText.setText('');
    }
  }

  update(time, delta) {
    // 录制阶段
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      const remaining = Math.max(0, this.recordDuration - elapsed);
      this.recordingTimerText.setText(`Recording: ${(remaining / 1000).toFixed(2)}s`);

      // 记录输入
      this.recordInput();

      // 处理玩家移动
      let vx = 0;
      let vy = 0;

      if (this.cursors.W.isDown) vy -= 1;
      if (this.cursors.S.isDown) vy += 1;
      if (this.cursors.A.isDown) vx -= 1;
      if (this.cursors.D.isDown) vx += 1;

      // 归一化对角线移动
      if (vx !== 0 && vy !== 0) {
        vx *= 0.707;
        vy *= 0.707;
      }

      this.playerX += vx * this.playerVelocity * (delta / 1000);
      this.playerY += vy * this.playerVelocity * (delta / 1000);

      // 边界限制
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
      this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

      this.player.setPosition(this.playerX, this.playerY);
    } else {
      this.recordingTimerText.setText('');
    }

    // 回放阶段
    if (this.isReplaying) {
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

      // 查找当前应该应用的输入状态
      while (this.currentReplayIndex < this.recordings.length) {
        const record = this.recordings[this.currentReplayIndex];
        if (record.time <= elapsedTime) {
          // 应用这个输入状态
          let vx = 0;
          let vy = 0;

          if (record.w) vy -= 1;
          if (record.s) vy += 1;
          if (record.a) vx -= 1;
          if (record.d) vx += 1;

          // 归一化
          if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
          }

          // 计算时间差（考虑回放速度）
          const timeDelta = delta / 1000;
          this.playerX += vx * this.playerVelocity * timeDelta;
          this.playerY += vy * this.playerVelocity * timeDelta;

          // 边界限制
          this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
          this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

          this.ghost.setPosition(this.playerX, this.playerY);

          this.currentReplayIndex++;
        } else {
          break;
        }
      }

      // 回放结束
      if (elapsedTime >= this.recordDuration) {
        this.isReplaying = false;
        this.ghost.setVisible(false);
        this.player.setAlpha(1);
        this.updateStatus();
      }
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