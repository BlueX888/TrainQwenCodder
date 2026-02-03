class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    this.recordingDuration = 1500; // 1.5秒
    this.recordedActions = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.recordStartTime = 0;
    this.playbackSpeed = 1.0;
    this.playbackStartTime = 0;
    this.currentPlaybackIndex = 0;
    
    // 状态信号
    this.recordedFrames = 0;
    this.playbackProgress = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家方块（蓝色）
    this.player = {
      x: 200,
      y: 300,
      speed: 200,
      graphics: this.add.graphics()
    };
    this.drawPlayer();

    // 创建回放方块（红色半透明）
    this.playbackPlayer = {
      x: 200,
      y: 300,
      graphics: this.add.graphics()
    };
    this.drawPlaybackPlayer();
    this.playbackPlayer.graphics.setVisible(false);

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

    // 防止空格键重复触发
    this.keys.SPACE.on('down', () => {
      if (!this.isRecording && this.recordedActions.length > 0 && !this.isPlaying) {
        this.startPlayback();
      }
    });

    // 速度调节
    this.keys.UP.on('down', () => {
      this.playbackSpeed = Math.min(2.0, this.playbackSpeed + 0.25);
      this.updateSpeedText();
    });

    this.keys.DOWN.on('down', () => {
      this.playbackSpeed = Math.max(0.5, this.playbackSpeed - 0.25);
      this.updateSpeedText();
    });

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 90, 
      'WASD: Move | SPACE: Playback | UP/DOWN: Speed', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(10, 130, '', {
      fontSize: '14px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.recordedFrames = 0;
    
    this.statusText.setText('Recording... (1.5s)');
    this.updateSpeedText();

    // 1.5秒后停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.statusText.setText(`Recorded ${this.recordedFrames} frames. Press SPACE to playback.`);
    console.log(`Recording complete: ${this.recordedActions.length} actions recorded`);
  }

  startPlayback() {
    if (this.recordedActions.length === 0) return;

    this.isPlaying = true;
    this.currentPlaybackIndex = 0;
    this.playbackStartTime = this.time.now;
    this.playbackProgress = 0;

    // 重置回放玩家位置到初始位置
    this.playbackPlayer.x = 200;
    this.playbackPlayer.y = 300;
    this.playbackPlayer.graphics.setVisible(true);
    this.drawPlaybackPlayer();

    this.statusText.setText(`Playing back... (Speed: ${this.playbackSpeed.toFixed(2)}x)`);
  }

  update(time, delta) {
    // 录制阶段
    if (this.isRecording) {
      const moved = this.handlePlayerMovement(delta);
      
      if (moved) {
        const timestamp = time - this.recordStartTime;
        this.recordedActions.push({
          timestamp: timestamp,
          x: this.player.x,
          y: this.player.y,
          keys: {
            W: this.keys.W.isDown,
            A: this.keys.A.isDown,
            S: this.keys.S.isDown,
            D: this.keys.D.isDown
          }
        });
        this.recordedFrames++;
      }

      this.drawPlayer();
    }

    // 回放阶段
    if (this.isPlaying) {
      const elapsedTime = (time - this.playbackStartTime) * this.playbackSpeed;
      
      // 查找当前应该执行的动作
      while (this.currentPlaybackIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentPlaybackIndex];
        
        if (action.timestamp <= elapsedTime) {
          this.playbackPlayer.x = action.x;
          this.playbackPlayer.y = action.y;
          this.drawPlaybackPlayer();
          this.currentPlaybackIndex++;
          this.playbackProgress = Math.floor((this.currentPlaybackIndex / this.recordedActions.length) * 100);
        } else {
          break;
        }
      }

      // 回放结束
      if (this.currentPlaybackIndex >= this.recordedActions.length) {
        this.isPlaying = false;
        this.playbackPlayer.graphics.setVisible(false);
        this.statusText.setText('Playback complete. Press SPACE to replay.');
        this.playbackProgress = 100;
      }
    }

    // 更新统计信息
    this.updateStats();
  }

  handlePlayerMovement(delta) {
    let moved = false;
    const moveDistance = (this.player.speed * delta) / 1000;

    if (this.keys.W.isDown) {
      this.player.y -= moveDistance;
      moved = true;
    }
    if (this.keys.S.isDown) {
      this.player.y += moveDistance;
      moved = true;
    }
    if (this.keys.A.isDown) {
      this.player.x -= moveDistance;
      moved = true;
    }
    if (this.keys.D.isDown) {
      this.player.x += moveDistance;
      moved = true;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    return moved;
  }

  drawPlayer() {
    this.player.graphics.clear();
    this.player.graphics.fillStyle(0x0000ff, 1);
    this.player.graphics.fillRect(this.player.x - 15, this.player.y - 15, 30, 30);
    
    // 添加方向指示器
    this.player.graphics.fillStyle(0xffffff, 1);
    this.player.graphics.fillCircle(this.player.x, this.player.y, 3);
  }

  drawPlaybackPlayer() {
    this.playbackPlayer.graphics.clear();
    this.playbackPlayer.graphics.fillStyle(0xff0000, 0.6);
    this.playbackPlayer.graphics.fillRect(
      this.playbackPlayer.x - 15, 
      this.playbackPlayer.y - 15, 
      30, 
      30
    );
    
    // 添加方向指示器
    this.playbackPlayer.graphics.fillStyle(0xffff00, 0.8);
    this.playbackPlayer.graphics.fillCircle(this.playbackPlayer.x, this.playbackPlayer.y, 3);
  }

  updateSpeedText() {
    this.speedText.setText(`Playback Speed: ${this.playbackSpeed.toFixed(2)}x`);
  }

  updateStats() {
    const status = this.isRecording ? 'RECORDING' : 
                   this.isPlaying ? 'PLAYING' : 'IDLE';
    this.statsText.setText(
      `Status: ${status} | Frames: ${this.recordedFrames} | Progress: ${this.playbackProgress}%`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordPlaybackScene
};

new Phaser.Game(config);