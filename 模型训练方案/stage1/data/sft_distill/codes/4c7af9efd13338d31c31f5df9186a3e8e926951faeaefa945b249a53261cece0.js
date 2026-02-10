class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingDuration = 2000; // 2秒录制时间
    this.playbackSpeed = 1; // 回放速度倍率
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      events: [],
      recordingComplete: false,
      replayComplete: false,
      playerPositions: []
    };

    // 创建玩家方块
    this.createPlayer();
    
    // 创建回放用的幽灵方块（初始隐藏）
    this.createGhost();

    // 创建 UI
    this.createUI();

    // 初始化输入
    this.setupInput();

    // 初始化录制系统
    this.initRecording();

    // 记录初始状态
    this.logSignal('game_start', { 
      playerX: this.player.x, 
      playerY: this.player.y 
    });
  }

  createPlayer() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5);

    // 玩家移动速度
    this.playerSpeed = 200;
  }

  createGhost() {
    // 创建幽灵纹理（半透明蓝色）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 0.5);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('ghost', 32, 32);
    graphics.destroy();

    // 创建幽灵精灵
    this.ghost = this.add.sprite(400, 300, 'ghost');
    this.ghost.setOrigin(0.5);
    this.ghost.setVisible(false);
  }

  createUI() {
    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.hintText = this.add.text(400, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 速度控制文本
    this.speedText = this.add.text(10, 560, 'Playback Speed: 1x\n[1]=0.5x  [2]=1x  [3]=2x', {
      fontSize: '14px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 录制进度条背景
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x333333, 1);
    this.progressBg.fillRect(250, 100, 300, 20);

    // 录制进度条
    this.progressBar = this.add.graphics();
  }

  setupInput() {
    // 方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 空格键开始回放
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 速度调节键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
  }

  initRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordingData = [];
    this.recordingStartTime = this.time.now;
    this.recordingEndTime = this.recordingStartTime + this.recordingDuration;

    this.logSignal('recording_start', { startTime: this.recordingStartTime });
  }

  update(time, delta) {
    if (this.isRecording) {
      this.updateRecording(time, delta);
    } else if (this.isReplaying) {
      this.updateReplay(time, delta);
    } else {
      this.updateWaitingForReplay();
    }

    // 速度调节
    this.updateSpeedControl();
  }

  updateRecording(time, delta) {
    // 检查录制是否结束
    if (time >= this.recordingEndTime) {
      this.finishRecording();
      return;
    }

    // 更新进度条
    const progress = (time - this.recordingStartTime) / this.recordingDuration;
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(250, 100, 300 * progress, 20);

    // 更新状态文本
    const remaining = ((this.recordingEndTime - time) / 1000).toFixed(1);
    this.statusText.setText(`Recording... ${remaining}s remaining`);

    // 记录输入状态
    const inputState = {
      timestamp: time - this.recordingStartTime,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    };

    this.recordingData.push(inputState);

    // 移动玩家
    this.movePlayer(delta, inputState);

    // 记录位置
    if (this.recordingData.length % 5 === 0) { // 每5帧记录一次位置
      window.__signals__.playerPositions.push({
        time: time - this.recordingStartTime,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      });
    }
  }

  movePlayer(delta, inputState) {
    const speed = this.playerSpeed * (delta / 1000);

    if (inputState.left) {
      this.player.x -= speed;
    }
    if (inputState.right) {
      this.player.x += speed;
    }
    if (inputState.up) {
      this.player.y -= speed;
    }
    if (inputState.down) {
      this.player.y += speed;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
  }

  finishRecording() {
    this.isRecording = false;
    this.progressBar.clear();
    this.progressBg.clear();

    this.statusText.setText('Recording Complete!');
    this.hintText.setText('Press SPACE to Start Replay');

    window.__signals__.recordingComplete = true;
    this.logSignal('recording_complete', {
      frames: this.recordingData.length,
      finalPosition: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
    });
  }

  updateWaitingForReplay() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startReplay();
    }
  }

  startReplay() {
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;

    // 重置幽灵位置到录制起始位置
    this.ghost.setPosition(400, 300);
    this.ghost.setVisible(true);

    this.statusText.setText(`Replaying at ${this.playbackSpeed}x speed...`);
    this.hintText.setText('Watch the blue ghost replay your moves!');

    this.logSignal('replay_start', { 
      speed: this.playbackSpeed,
      frames: this.recordingData.length 
    });
  }

  updateReplay(time, delta) {
    if (this.replayIndex >= this.recordingData.length) {
      this.finishReplay();
      return;
    }

    const elapsedTime = (time - this.replayStartTime) * this.playbackSpeed;

    // 查找当前应该执行的帧
    while (this.replayIndex < this.recordingData.length) {
      const frame = this.recordingData[this.replayIndex];
      
      if (frame.timestamp > elapsedTime) {
        break;
      }

      // 应用输入状态到幽灵
      const adjustedDelta = delta * this.playbackSpeed;
      this.moveGhost(adjustedDelta, frame);

      this.replayIndex++;
    }
  }

  moveGhost(delta, inputState) {
    const speed = this.playerSpeed * (delta / 1000);

    if (inputState.left) {
      this.ghost.x -= speed;
    }
    if (inputState.right) {
      this.ghost.x += speed;
    }
    if (inputState.up) {
      this.ghost.y -= speed;
    }
    if (inputState.down) {
      this.ghost.y += speed;
    }

    // 边界限制
    this.ghost.x = Phaser.Math.Clamp(this.ghost.x, 16, 784);
    this.ghost.y = Phaser.Math.Clamp(this.ghost.y, 16, 584);
  }

  finishReplay() {
    this.isReplaying = false;
    this.statusText.setText('Replay Complete!');
    this.hintText.setText('Press SPACE to Replay Again');

    window.__signals__.replayComplete = true;
    this.logSignal('replay_complete', {
      finalGhostPosition: { x: Math.round(this.ghost.x), y: Math.round(this.ghost.y) }
    });
  }

  updateSpeedControl() {
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.playbackSpeed = 0.5;
      this.speedText.setText('Playback Speed: 0.5x\n[1]=0.5x  [2]=1x  [3]=2x');
      this.logSignal('speed_change', { speed: 0.5 });
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.playbackSpeed = 1;
      this.speedText.setText('Playback Speed: 1x\n[1]=0.5x  [2]=1x  [3]=2x');
      this.logSignal('speed_change', { speed: 1 });
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.playbackSpeed = 2;
      this.speedText.setText('Playback Speed: 2x\n[1]=0.5x  [2]=1x  [3]=2x');
      this.logSignal('speed_change', { speed: 2 });
    }
  }

  logSignal(eventType, data) {
    const signal = {
      timestamp: this.time.now,
      event: eventType,
      ...data
    };
    window.__signals__.events.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene
};

// 启动游戏
const game = new Phaser.Game(config);