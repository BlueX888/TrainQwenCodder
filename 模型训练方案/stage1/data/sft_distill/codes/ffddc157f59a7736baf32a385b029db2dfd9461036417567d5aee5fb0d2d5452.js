class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量（可验证）
    this.recordingState = 'idle'; // idle, recording, recorded, replaying
    this.recordedFrames = [];
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.playerX = 400;
    this.playerY = 300;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家角色（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建录制指示器
    const recGraphics = this.add.graphics();
    recGraphics.fillStyle(0xff0000, 1);
    recGraphics.fillCircle(0, 0, 10);
    recGraphics.generateTexture('recIndicator', 20, 20);
    recGraphics.destroy();
    
    this.recIndicator = this.add.sprite(50, 50, 'recIndicator');
    this.recIndicator.setVisible(false);

    // 创建UI文本
    this.statusText = this.add.text(20, 20, 'Press SPACE to start recording (3s)', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(20, 60, 'Arrow Keys: Move\nW/A/S/D: Replay\n1/2/3: Speed (0.5x/1x/2x)', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.debugText = this.add.text(20, 550, '', {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 录制计时器
    this.recordTimer = null;
    this.recordDuration = 3000; // 3秒

    // 移动速度
    this.moveSpeed = 200;
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText(
      `State: ${this.recordingState} | Frames: ${this.recordedFrames.length} | ` +
      `Speed: ${this.replaySpeed}x | Replay: ${this.replayIndex}/${this.recordedFrames.length}`
    );

    // 处理速度调节
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.replaySpeed = 0.5;
      this.statusText.setText('Replay speed: 0.5x');
    }
    if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.replaySpeed = 1.0;
      this.statusText.setText('Replay speed: 1.0x');
    }
    if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.replaySpeed = 2.0;
      this.statusText.setText('Replay speed: 2.0x');
    }

    // 状态机处理
    switch (this.recordingState) {
      case 'idle':
        this.handleIdleState();
        break;
      case 'recording':
        this.handleRecordingState(time, delta);
        break;
      case 'recorded':
        this.handleRecordedState();
        break;
      case 'replaying':
        this.handleReplayingState(time);
        break;
    }
  }

  handleIdleState() {
    // 按空格键开始录制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startRecording();
    }
  }

  startRecording() {
    this.recordingState = 'recording';
    this.recordedFrames = [];
    this.recordStartTime = this.time.now;
    this.recIndicator.setVisible(true);
    
    // 重置玩家位置
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    
    this.statusText.setText('RECORDING... (3s)');
    
    // 设置3秒计时器
    if (this.recordTimer) {
      this.recordTimer.remove();
    }
    
    this.recordTimer = this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.recordingState = 'recorded';
    this.recIndicator.setVisible(false);
    this.statusText.setText(
      `Recording complete! ${this.recordedFrames.length} frames\n` +
      `Press W/A/S/D to replay | SPACE to re-record`
    );
  }

  handleRecordingState(time, delta) {
    // 记录当前输入状态
    const currentTime = time - this.recordStartTime;
    const inputState = {
      time: currentTime,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      x: this.playerX,
      y: this.playerY
    };

    // 处理玩家移动
    const velocity = this.moveSpeed * (delta / 1000);
    
    if (this.cursors.left.isDown) {
      this.playerX -= velocity;
    }
    if (this.cursors.right.isDown) {
      this.playerX += velocity;
    }
    if (this.cursors.up.isDown) {
      this.playerY -= velocity;
    }
    if (this.cursors.down.isDown) {
      this.playerY += velocity;
    }

    // 边界检测
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
    
    this.player.setPosition(this.playerX, this.playerY);

    // 记录帧
    this.recordedFrames.push(inputState);

    // 更新录制进度
    const elapsed = time - this.recordStartTime;
    const remaining = Math.max(0, (this.recordDuration - elapsed) / 1000);
    this.statusText.setText(`RECORDING... ${remaining.toFixed(1)}s`);
  }

  handleRecordedState() {
    // 按WASD任意键开始回放
    if (Phaser.Input.Keyboard.JustDown(this.wKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        Phaser.Input.Keyboard.JustDown(this.sKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey)) {
      this.startReplay();
    }
    
    // 按空格重新录制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.recordingState = 'idle';
      this.statusText.setText('Press SPACE to start recording (3s)');
    }
  }

  startReplay() {
    if (this.recordedFrames.length === 0) {
      return;
    }

    this.recordingState = 'replaying';
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 重置玩家到起始位置
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    
    this.statusText.setText(`REPLAYING at ${this.replaySpeed}x speed...`);
  }

  handleReplayingState(time) {
    if (this.recordedFrames.length === 0) {
      this.recordingState = 'recorded';
      return;
    }

    // 计算当前应该播放的帧（考虑速度）
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
    
    // 找到对应时间的帧
    while (this.replayIndex < this.recordedFrames.length) {
      const frame = this.recordedFrames[this.replayIndex];
      
      if (frame.time > elapsedTime) {
        break;
      }
      
      // 应用该帧的位置
      this.playerX = frame.x;
      this.playerY = frame.y;
      this.player.setPosition(this.playerX, this.playerY);
      
      this.replayIndex++;
    }

    // 回放完成
    if (this.replayIndex >= this.recordedFrames.length) {
      this.recordingState = 'recorded';
      this.statusText.setText(
        'Replay complete!\n' +
        'Press W/A/S/D to replay again | SPACE to re-record'
      );
    } else {
      // 显示回放进度
      const progress = (this.replayIndex / this.recordedFrames.length * 100).toFixed(0);
      this.statusText.setText(
        `REPLAYING at ${this.replaySpeed}x speed... ${progress}%`
      );
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