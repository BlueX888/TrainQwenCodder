class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingTime = 3000; // 3秒录制时间
    this.recordedActions = [];
    this.isRecording = true;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    
    // 可验证的状态信号
    this.totalMoves = 0;
    this.totalDistance = 0;
    this.recordingComplete = false;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = 400;
    this.player.y = 300;
    this.player.vx = 0;
    this.player.vy = 0;
    
    // 创建回放玩家（蓝色半透明方块）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0x0088ff, 0.6);
    this.replayPlayer.fillRect(-16, -16, 32, 32);
    this.replayPlayer.visible = false;
    
    // 创建背景网格（便于观察移动）
    this.createGrid();
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // 速度调节键（1-5）
    this.speedKeys = {};
    for (let i = 1; i <= 5; i++) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes['ONE'] + (i - 1);
      this.speedKeys[i] = this.input.keyboard.addKey(keyCode);
    }
    
    // 鼠标右键监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && this.recordingComplete && !this.isReplaying) {
        this.startReplay();
      }
    });
    
    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.infoText = this.add.text(10, 80, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 开始录制
    this.recordStartTime = this.time.now;
    this.lastRecordTime = this.recordStartTime;
    
    // 录制倒计时
    this.recordTimer = this.time.addEvent({
      delay: this.recordingTime,
      callback: this.onRecordingComplete,
      callbackScope: this
    });
    
    this.updateStatusText();
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  update(time, delta) {
    if (this.isRecording) {
      this.handleRecording(time, delta);
    } else if (this.isReplaying) {
      this.handleReplay(time, delta);
    }
    
    // 速度调节
    if (!this.isReplaying) {
      for (let i = 1; i <= 5; i++) {
        if (Phaser.Input.Keyboard.JustDown(this.speedKeys[i])) {
          this.replaySpeed = i * 0.5;
          this.updateStatusText();
        }
      }
    }
    
    this.updateStatusText();
  }

  handleRecording(time, delta) {
    const speed = 200;
    let vx = 0;
    let vy = 0;
    let hasInput = false;
    
    // 检测输入
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      vx = -speed;
      hasInput = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      vx = speed;
      hasInput = true;
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      vy = -speed;
      hasInput = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      vy = speed;
      hasInput = true;
    }
    
    // 归一化对角线速度
    if (vx !== 0 && vy !== 0) {
      const factor = Math.sqrt(2) / 2;
      vx *= factor;
      vy *= factor;
    }
    
    this.player.vx = vx;
    this.player.vy = vy;
    
    // 更新位置
    const oldX = this.player.x;
    const oldY = this.player.y;
    
    this.player.x += vx * delta / 1000;
    this.player.y += vy * delta / 1000;
    
    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
    
    // 计算移动距离
    const dx = this.player.x - oldX;
    const dy = this.player.y - oldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;
    
    if (hasInput) {
      this.totalMoves++;
    }
    
    // 记录动作（每帧记录）
    const currentTime = time - this.recordStartTime;
    this.recordedActions.push({
      time: currentTime,
      x: this.player.x,
      y: this.player.y,
      vx: vx,
      vy: vy,
      hasInput: hasInput
    });
  }

  onRecordingComplete() {
    this.isRecording = false;
    this.recordingComplete = true;
    console.log(`Recording complete! Total actions: ${this.recordedActions.length}`);
    console.log(`Total moves: ${this.totalMoves}, Total distance: ${this.totalDistance.toFixed(2)}`);
  }

  startReplay() {
    if (this.recordedActions.length === 0) return;
    
    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.replayIndex = 0;
    
    // 重置回放玩家到初始位置
    const firstAction = this.recordedActions[0];
    this.replayPlayer.x = firstAction.x;
    this.replayPlayer.y = firstAction.y;
    this.replayPlayer.visible = true;
    
    // 同时重置真实玩家到初始位置（可选）
    this.player.alpha = 0.3;
    
    console.log(`Starting replay at speed ${this.replaySpeed}x`);
  }

  handleReplay(time, delta) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
    
    // 找到当前时间对应的动作
    while (this.replayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.replayIndex];
      
      if (action.time <= elapsedTime) {
        // 更新回放玩家位置
        this.replayPlayer.x = action.x;
        this.replayPlayer.y = action.y;
        this.replayIndex++;
      } else {
        break;
      }
    }
    
    // 回放结束
    if (this.replayIndex >= this.recordedActions.length) {
      this.endReplay();
    }
  }

  endReplay() {
    this.isReplaying = false;
    this.replayPlayer.visible = false;
    this.player.alpha = 1.0;
    console.log('Replay complete!');
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      const remaining = Math.max(0, this.recordingTime - (this.time.now - this.recordStartTime));
      status = `🔴 RECORDING: ${(remaining / 1000).toFixed(1)}s remaining\n`;
      status += `Use WASD or Arrow Keys to move`;
    } else if (this.isReplaying) {
      const progress = (this.replayIndex / this.recordedActions.length * 100).toFixed(1);
      status = `▶️ REPLAYING: ${progress}% (${this.replaySpeed}x speed)\n`;
      status += `Press 1-5 to change speed (after replay)`;
    } else if (this.recordingComplete) {
      status = `✅ RECORDING COMPLETE\n`;
      status += `Right-click to replay | Press 1-5 to set speed (${this.replaySpeed}x)`;
    }
    
    this.statusText.setText(status);
    
    // 状态信号
    const info = `📊 STATUS SIGNALS:\n`;
    const infoLines = [
      `Total Moves: ${this.totalMoves}`,
      `Total Distance: ${this.totalDistance.toFixed(2)}px`,
      `Recorded Frames: ${this.recordedActions.length}`,
      `Recording Complete: ${this.recordingComplete}`,
      `Replay Speed: ${this.replaySpeed}x`
    ];
    
    this.infoText.setText(info + infoLines.join('\n'));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);