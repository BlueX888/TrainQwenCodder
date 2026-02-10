class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordingStartTime = 0;
    this.recordingDuration = 4000; // 4秒
    this.playbackSpeed = 1.0; // 回放速度
    
    // 操作记录
    this.actionLog = [];
    this.replayIndex = 0;
    this.replayStartTime = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 验证变量
    this.totalDistance = 0;
    this.actionCount = 0;
  }
  
  preload() {
    // 不需要加载外部资源
  }
  
  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
    
    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建录制指示器（红点）
    const recordGraphics = this.add.graphics();
    recordGraphics.fillStyle(0xff0000, 1);
    recordGraphics.fillCircle(0, 0, 8);
    recordGraphics.generateTexture('recordDot', 16, 16);
    recordGraphics.destroy();
    
    this.recordIndicator = this.add.sprite(50, 50, 'recordDot');
    this.recordIndicator.setVisible(false);
    
    // 创建回放指示器（蓝色三角形）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0x0000ff, 1);
    replayGraphics.fillTriangle(0, 0, 16, 8, 0, 16);
    replayGraphics.generateTexture('replayIcon', 16, 16);
    replayGraphics.destroy();
    
    this.replayIndicator = this.add.sprite(50, 50, 'replayIcon');
    this.replayIndicator.setVisible(false);
    
    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 550, 
      'Arrow Keys: Move | SPACE: Start Recording/Replay\n' +
      '1: 0.5x Speed | 2: 1x Speed | 3: 2x Speed | R: Reset',
      {
        fontSize: '14px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 3 }
      }
    );
    
    this.statsText = this.add.text(600, 10, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 按键事件
    this.spaceKey.on('down', () => this.handleSpacePress());
    this.key1.on('down', () => this.setPlaybackSpeed(0.5));
    this.key2.on('down', () => this.setPlaybackSpeed(1.0));
    this.key3.on('down', () => this.setPlaybackSpeed(2.0));
    this.keyR.on('down', () => this.resetGame());
    
    this.updateUI();
  }
  
  handleSpacePress() {
    if (this.isReplaying) {
      return; // 回放中不响应
    }
    
    if (!this.isRecording && this.actionLog.length === 0) {
      // 开始录制
      this.startRecording();
    } else if (this.isRecording) {
      // 停止录制，准备回放
      this.stopRecording();
    } else if (this.actionLog.length > 0) {
      // 开始回放
      this.startReplay();
    }
  }
  
  startRecording() {
    this.isRecording = true;
    this.recordingStartTime = this.time.now;
    this.actionLog = [];
    this.actionCount = 0;
    this.totalDistance = 0;
    
    // 记录初始位置
    this.actionLog.push({
      time: 0,
      x: this.player.x,
      y: this.player.y,
      keys: { left: false, right: false, up: false, down: false }
    });
    
    this.recordIndicator.setVisible(true);
    
    // 4秒后自动停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      if (this.isRecording) {
        this.stopRecording();
      }
    });
  }
  
  stopRecording() {
    this.isRecording = false;
    this.recordIndicator.setVisible(false);
  }
  
  startReplay() {
    if (this.actionLog.length === 0) return;
    
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 重置玩家到初始位置
    if (this.actionLog.length > 0) {
      this.player.x = this.actionLog[0].x;
      this.player.y = this.actionLog[0].y;
    }
    
    this.replayIndicator.setVisible(true);
  }
  
  stopReplay() {
    this.isReplaying = false;
    this.replayIndicator.setVisible(false);
  }
  
  setPlaybackSpeed(speed) {
    this.playbackSpeed = speed;
    this.updateUI();
  }
  
  resetGame() {
    this.isRecording = false;
    this.isReplaying = false;
    this.actionLog = [];
    this.replayIndex = 0;
    this.player.x = 400;
    this.player.y = 300;
    this.totalDistance = 0;
    this.actionCount = 0;
    this.recordIndicator.setVisible(false);
    this.replayIndicator.setVisible(false);
    this.updateUI();
  }
  
  update(time, delta) {
    const deltaSeconds = delta / 1000;
    
    if (this.isRecording) {
      this.handleRecording(time, deltaSeconds);
    } else if (this.isReplaying) {
      this.handleReplay(time, deltaSeconds);
    }
    
    this.updateUI();
  }
  
  handleRecording(time, deltaSeconds) {
    const elapsed = time - this.recordingStartTime;
    
    if (elapsed > this.recordingDuration) {
      this.stopRecording();
      return;
    }
    
    // 记录当前按键状态
    const currentKeys = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    };
    
    // 移动玩家
    const oldX = this.player.x;
    const oldY = this.player.y;
    
    if (currentKeys.left) {
      this.player.x -= this.playerSpeed * deltaSeconds;
    }
    if (currentKeys.right) {
      this.player.x += this.playerSpeed * deltaSeconds;
    }
    if (currentKeys.up) {
      this.player.y -= this.playerSpeed * deltaSeconds;
    }
    if (currentKeys.down) {
      this.player.y += this.playerSpeed * deltaSeconds;
    }
    
    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
    
    // 计算移动距离
    const dx = this.player.x - oldX;
    const dy = this.player.y - oldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;
    
    // 记录动作
    if (currentKeys.left || currentKeys.right || currentKeys.up || currentKeys.down) {
      this.actionCount++;
    }
    
    // 记录当前帧
    this.actionLog.push({
      time: elapsed,
      x: this.player.x,
      y: this.player.y,
      keys: currentKeys
    });
  }
  
  handleReplay(time, deltaSeconds) {
    const elapsed = (time - this.replayStartTime) * this.playbackSpeed;
    
    // 找到当前应该回放的动作
    while (this.replayIndex < this.actionLog.length - 1 && 
           this.actionLog[this.replayIndex + 1].time <= elapsed) {
      this.replayIndex++;
    }
    
    if (this.replayIndex >= this.actionLog.length - 1) {
      // 回放结束
      this.stopReplay();
      return;
    }
    
    // 插值计算当前位置
    const current = this.actionLog[this.replayIndex];
    const next = this.actionLog[this.replayIndex + 1];
    
    if (next) {
      const timeDiff = next.time - current.time;
      const progress = timeDiff > 0 ? (elapsed - current.time) / timeDiff : 0;
      
      this.player.x = Phaser.Math.Linear(current.x, next.x, progress);
      this.player.y = Phaser.Math.Linear(current.y, next.y, progress);
    }
  }
  
  updateUI() {
    let status = 'Status: IDLE';
    let timeInfo = '';
    
    if (this.isRecording) {
      const elapsed = this.time.now - this.recordingStartTime;
      const remaining = Math.max(0, this.recordingDuration - elapsed);
      status = 'Status: RECORDING';
      timeInfo = `Time: ${(remaining / 1000).toFixed(1)}s`;
    } else if (this.isReplaying) {
      const elapsed = (this.time.now - this.replayStartTime) * this.playbackSpeed;
      const totalTime = this.actionLog.length > 0 ? 
        this.actionLog[this.actionLog.length - 1].time : 0;
      status = 'Status: REPLAYING';
      timeInfo = `Time: ${(elapsed / 1000).toFixed(1)}s / ${(totalTime / 1000).toFixed(1)}s`;
    } else if (this.actionLog.length > 0) {
      status = 'Status: READY TO REPLAY';
      timeInfo = 'Press SPACE to replay';
    } else {
      status = 'Status: IDLE';
      timeInfo = 'Press SPACE to start recording';
    }
    
    this.statusText.setText(
      `${status}\n${timeInfo}\nPlayback Speed: ${this.playbackSpeed}x`
    );
    
    this.statsText.setText(
      `Actions: ${this.actionCount}\n` +
      `Distance: ${this.totalDistance.toFixed(0)}px\n` +
      `Frames: ${this.actionLog.length}`
    );
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