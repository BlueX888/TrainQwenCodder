class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    
    // 状态变量（可验证）
    this.recordingFrames = 0;
    this.playbackFrames = 0;
    this.currentState = 'idle'; // idle, recording, waiting, playback
    this.playbackSpeed = 1.0;
    
    // 录制数据
    this.recordedActions = [];
    this.recordDuration = 2500; // 2.5秒
    this.recordStartTime = 0;
    
    // 玩家数据
    this.playerSpeed = 200;
    this.player = null;
    this.playerStartX = 0;
    this.playerStartY = 0;
    
    // 回放数据
    this.playbackIndex = 0;
    this.playbackAccumulator = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
    
    // 创建玩家
    this.playerStartX = width / 2;
    this.playerStartY = height / 2;
    this.player = this.add.sprite(this.playerStartX, this.playerStartY, 'player');
    
    // 创建边界可视化
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(10, 10, width - 20, height - 20);
    
    // 创建 UI 文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(width / 2, height - 40, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
    
    this.speedText = this.add.text(width - 20, 20, '', {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0);
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.currentState = 'recording';
    this.recordedActions = [];
    this.recordingFrames = 0;
    this.recordStartTime = this.time.now;
    
    // 重置玩家位置
    this.player.setPosition(this.playerStartX, this.playerStartY);
    
    this.instructionText.setText('移动玩家！录制中...');
    
    // 2.5秒后结束录制
    this.time.delayedCall(this.recordDuration, () => {
      this.endRecording();
    });
  }

  endRecording() {
    this.currentState = 'waiting';
    this.instructionText.setText('按任意方向键开始回放\n上/下键调节速度 | 空格键重新录制');
    this.updateSpeedText();
  }

  startPlayback() {
    if (this.recordedActions.length === 0) {
      return;
    }
    
    this.currentState = 'playback';
    this.playbackIndex = 0;
    this.playbackFrames = 0;
    this.playbackAccumulator = 0;
    
    // 重置玩家到起始位置
    this.player.setPosition(this.playerStartX, this.playerStartY);
    
    this.instructionText.setText('回放中... 上/下键调节速度');
  }

  endPlayback() {
    this.currentState = 'waiting';
    this.instructionText.setText('回放完成！\n按任意方向键重新回放 | 空格键重新录制');
  }

  updateSpeedText() {
    this.speedText.setText(`速度: ${this.playbackSpeed.toFixed(1)}x`);
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `状态: ${this.currentState}\n` +
      `录制帧: ${this.recordingFrames}\n` +
      `回放帧: ${this.playbackFrames}`
    );
    
    if (this.currentState === 'recording') {
      this.handleRecording(delta);
    } else if (this.currentState === 'waiting') {
      this.handleWaiting();
    } else if (this.currentState === 'playback') {
      this.handlePlayback(delta);
    }
  }

  handleRecording(delta) {
    // 记录当前输入状态
    const action = {
      frame: this.recordingFrames,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      x: this.player.x,
      y: this.player.y
    };
    
    this.recordedActions.push(action);
    this.recordingFrames++;
    
    // 处理玩家移动
    const velocity = this.playerSpeed * (delta / 1000);
    
    if (this.cursors.left.isDown) {
      this.player.x -= velocity;
    }
    if (this.cursors.right.isDown) {
      this.player.x += velocity;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= velocity;
    }
    if (this.cursors.down.isDown) {
      this.player.y += velocity;
    }
    
    // 限制在边界内
    const { width, height } = this.cameras.main;
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, width - 30);
    this.player.y = Phaser.Math.Clamp(this.player.y, 30, height - 30);
  }

  handleWaiting() {
    // 检测方向键开始回放
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.startPlayback();
      return;
    }
    
    // 空格键重新录制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startRecording();
      return;
    }
    
    // 调节回放速度
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.playbackSpeed = Math.min(5.0, this.playbackSpeed + 0.5);
      this.updateSpeedText();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.playbackSpeed = Math.max(0.5, this.playbackSpeed - 0.5);
      this.updateSpeedText();
    }
  }

  handlePlayback(delta) {
    // 调节回放速度（实时）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.playbackSpeed = Math.min(5.0, this.playbackSpeed + 0.5);
      this.updateSpeedText();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.playbackSpeed = Math.max(0.5, this.playbackSpeed - 0.5);
      this.updateSpeedText();
    }
    
    // 应用速度倍率
    const adjustedDelta = delta * this.playbackSpeed;
    this.playbackAccumulator += adjustedDelta;
    
    // 每帧约 16.67ms (60fps)，根据累积时间决定播放多少帧
    const frameTime = 16.67;
    
    while (this.playbackAccumulator >= frameTime && this.playbackIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.playbackIndex];
      
      // 直接设置位置（更精确的回放）
      this.player.setPosition(action.x, action.y);
      
      this.playbackIndex++;
      this.playbackFrames++;
      this.playbackAccumulator -= frameTime;
    }
    
    // 回放结束
    if (this.playbackIndex >= this.recordedActions.length) {
      this.endPlayback();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordPlaybackScene,
  parent: 'game-container'
};

new Phaser.Game(config);