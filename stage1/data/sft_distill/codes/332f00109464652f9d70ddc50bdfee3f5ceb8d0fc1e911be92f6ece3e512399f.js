class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    this.recordingDuration = 2500; // 2.5秒
    this.recordedActions = [];
    this.isRecording = false;
    this.isPlayingBack = false;
    this.recordStartTime = 0;
    this.playbackSpeed = 1.0;
    this.playerX = 400;
    this.playerY = 300;
    this.replayX = 400;
    this.replayY = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建回放玩家纹理（绿色半透明方块）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0x00ff88, 0.6);
    replayGraphics.fillRect(0, 0, 40, 40);
    replayGraphics.generateTexture('replayPlayer', 40, 40);
    replayGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建回放精灵（初始隐藏）
    this.replayPlayer = this.add.sprite(this.replayX, this.replayY, 'replayPlayer');
    this.replayPlayer.setVisible(false);

    // 创建网格参考线
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333344, 0.3);
    for (let x = 0; x <= 800; x += 50) {
      gridGraphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      gridGraphics.lineBetween(0, y, 800, y);
    }

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // 状态文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(20, 60, 
      'WASD: Move | 1/2/3: Speed (0.5x/1x/2x) | Left Click: Start Playback',
      {
        fontSize: '16px',
        fill: '#aaaaaa',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    // 计时器文本
    this.timerText = this.add.text(20, 100, '', {
      fontSize: '18px',
      fill: '#ffaa00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 统计信息
    this.statsText = this.add.text(20, 550, '', {
      fontSize: '14px',
      fill: '#00ff88',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isRecording && !this.isPlayingBack && this.recordedActions.length > 0) {
        this.startPlayback();
      }
    });

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    
    // 2.5秒后停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.statusText.setText('Recording Complete! Click to playback.');
  }

  startPlayback() {
    if (this.recordedActions.length === 0) return;

    this.isPlayingBack = true;
    this.replayX = 400;
    this.replayY = 300;
    this.replayPlayer.setPosition(this.replayX, this.replayY);
    this.replayPlayer.setVisible(true);

    let actionIndex = 0;
    const playbackStartTime = this.time.now;

    // 创建回放定时器
    this.playbackTimer = this.time.addEvent({
      delay: 16, // 每帧检查
      loop: true,
      callback: () => {
        const elapsed = (this.time.now - playbackStartTime) * this.playbackSpeed;
        
        // 执行所有应该执行的动作
        while (actionIndex < this.recordedActions.length) {
          const action = this.recordedActions[actionIndex];
          if (action.time <= elapsed) {
            this.executeAction(action);
            actionIndex++;
          } else {
            break;
          }
        }

        // 回放完成
        if (actionIndex >= this.recordedActions.length) {
          this.stopPlayback();
        }
      }
    });
  }

  executeAction(action) {
    const speed = 5;
    switch (action.key) {
      case 'W':
        this.replayY -= speed;
        break;
      case 'A':
        this.replayX -= speed;
        break;
      case 'S':
        this.replayY += speed;
        break;
      case 'D':
        this.replayX += speed;
        break;
    }
    this.replayPlayer.setPosition(this.replayX, this.replayY);
  }

  stopPlayback() {
    this.isPlayingBack = false;
    if (this.playbackTimer) {
      this.playbackTimer.remove();
    }
    this.replayPlayer.setVisible(false);
    this.statusText.setText('Playback Complete! Click to replay.');
  }

  update(time, delta) {
    // 处理速度调节
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) {
      this.playbackSpeed = 0.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) {
      this.playbackSpeed = 1.0;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) {
      this.playbackSpeed = 2.0;
    }

    // 录制状态下的玩家移动和记录
    if (this.isRecording) {
      const speed = 5;
      let moved = false;
      let currentKey = null;

      if (this.keys.W.isDown) {
        this.playerY -= speed;
        moved = true;
        currentKey = 'W';
      }
      if (this.keys.S.isDown) {
        this.playerY += speed;
        moved = true;
        currentKey = 'S';
      }
      if (this.keys.A.isDown) {
        this.playerX -= speed;
        moved = true;
        currentKey = 'A';
      }
      if (this.keys.D.isDown) {
        this.playerX += speed;
        moved = true;
        currentKey = 'D';
      }

      // 边界限制
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
      this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
      this.player.setPosition(this.playerX, this.playerY);

      // 记录操作
      if (moved && currentKey) {
        const elapsedTime = time - this.recordStartTime;
        this.recordedActions.push({
          time: elapsedTime,
          key: currentKey
        });
      }

      // 更新计时器
      const remaining = Math.max(0, this.recordingDuration - (time - this.recordStartTime));
      this.timerText.setText(`Recording: ${(remaining / 1000).toFixed(2)}s`);
      this.statusText.setText(`Recording... Move with WASD`);
    } else if (!this.isPlayingBack) {
      this.timerText.setText('');
    }

    // 回放状态下的边界限制
    if (this.isPlayingBack) {
      this.replayX = Phaser.Math.Clamp(this.replayX, 20, 780);
      this.replayY = Phaser.Math.Clamp(this.replayY, 20, 580);
      this.statusText.setText(`Playing back at ${this.playbackSpeed}x speed`);
    }

    // 更新统计信息
    this.statsText.setText(
      `Actions Recorded: ${this.recordedActions.length} | ` +
      `Playback Speed: ${this.playbackSpeed}x | ` +
      `Player: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordPlaybackScene,
  parent: 'game-container'
};

new Phaser.Game(config);