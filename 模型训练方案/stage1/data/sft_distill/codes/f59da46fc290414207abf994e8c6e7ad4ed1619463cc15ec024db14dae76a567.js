class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    
    // 状态变量
    this.recordDuration = 1500; // 1.5秒录制时长
    this.isRecording = false;
    this.isPlaying = false;
    this.recordStartTime = 0;
    this.playbackStartTime = 0;
    this.playbackSpeed = 1; // 回放速度倍率
    
    // 录制数据
    this.recordedActions = []; // 存储 {time, keys} 的数组
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200; // 像素/秒
    
    // 可验证的状态信号
    this.totalDistance = 0; // 总移动距离
    this.actionCount = 0; // 操作次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
    
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建回放预览方块（半透明）
    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0x00ff00, 0.3);
    ghostGraphics.fillRect(-20, -20, 40, 40);
    ghostGraphics.generateTexture('ghost', 40, 40);
    ghostGraphics.destroy();
    
    this.ghost = this.add.sprite(400, 300, 'ghost');
    this.ghost.setVisible(false);
    
    // 创建UI文字
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 50, 
      'WASD: Move | SPACE: Start Playback | 1/2/3: Speed (0.5x/1x/2x)', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statsText = this.add.text(10, 90, '', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
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
    
    // 速度切换
    this.keys.ONE.on('down', () => { this.playbackSpeed = 0.5; });
    this.keys.TWO.on('down', () => { this.playbackSpeed = 1; });
    this.keys.THREE.on('down', () => { this.playbackSpeed = 2; });
    
    // 空格键开始回放
    this.keys.SPACE.on('down', () => {
      if (!this.isRecording && !this.isPlaying && this.recordedActions.length > 0) {
        this.startPlayback();
      }
    });
    
    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.recordedActions = [];
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    this.totalDistance = 0;
    this.actionCount = 0;
    
    console.log('Recording started...');
  }

  startPlayback() {
    this.isPlaying = true;
    this.playbackStartTime = this.time.now;
    this.ghost.setPosition(400, 300);
    this.ghost.setVisible(true);
    this.playbackIndex = 0;
    
    console.log(`Playback started at ${this.playbackSpeed}x speed`);
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    
    // 录制阶段
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      
      // 检查是否超过录制时长
      if (elapsed >= this.recordDuration) {
        this.isRecording = false;
        console.log(`Recording finished. Captured ${this.recordedActions.length} frames`);
        this.statusText.setText('Status: READY TO PLAYBACK');
        return;
      }
      
      // 记录当前按键状态
      const currentKeys = {
        W: this.keys.W.isDown,
        A: this.keys.A.isDown,
        S: this.keys.S.isDown,
        D: this.keys.D.isDown
      };
      
      // 检查是否有按键按下
      const hasInput = currentKeys.W || currentKeys.A || currentKeys.S || currentKeys.D;
      
      // 记录操作
      this.recordedActions.push({
        time: elapsed,
        keys: { ...currentKeys },
        position: { x: this.playerX, y: this.playerY }
      });
      
      // 移动玩家
      let moved = false;
      const oldX = this.playerX;
      const oldY = this.playerY;
      
      if (currentKeys.W) {
        this.playerY -= this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (currentKeys.S) {
        this.playerY += this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (currentKeys.A) {
        this.playerX -= this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (currentKeys.D) {
        this.playerX += this.playerSpeed * deltaSeconds;
        moved = true;
      }
      
      // 边界检测
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
      this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
      
      // 更新玩家位置
      this.player.setPosition(this.playerX, this.playerY);
      
      // 计算移动距离
      if (moved) {
        const distance = Phaser.Math.Distance.Between(oldX, oldY, this.playerX, this.playerY);
        this.totalDistance += distance;
        if (hasInput) this.actionCount++;
      }
      
      // 更新UI
      const remaining = ((this.recordDuration - elapsed) / 1000).toFixed(2);
      this.statusText.setText(`Status: RECORDING (${remaining}s remaining)`);
      this.statsText.setText(
        `Distance: ${this.totalDistance.toFixed(0)}px | Actions: ${this.actionCount}`
      );
    }
    
    // 回放阶段
    else if (this.isPlaying) {
      const elapsed = (time - this.playbackStartTime) * this.playbackSpeed;
      
      // 查找当前应该执行的动作
      while (this.playbackIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.playbackIndex];
        
        if (action.time <= elapsed) {
          // 执行动作 - 直接设置位置以确保准确性
          this.ghost.setPosition(action.position.x, action.position.y);
          this.playbackIndex++;
        } else {
          break;
        }
      }
      
      // 检查回放是否结束
      if (this.playbackIndex >= this.recordedActions.length) {
        this.isPlaying = false;
        this.ghost.setVisible(false);
        console.log('Playback finished');
        this.statusText.setText('Status: PLAYBACK COMPLETE - Press SPACE to replay');
        this.playbackIndex = 0;
      } else {
        const progress = ((elapsed / this.recordDuration) * 100).toFixed(0);
        this.statusText.setText(
          `Status: PLAYING (${progress}% | Speed: ${this.playbackSpeed}x)`
        );
      }
    }
    
    // 等待回放阶段
    else if (this.recordedActions.length > 0) {
      this.statusText.setText(
        `Status: READY - Press SPACE to playback (Speed: ${this.playbackSpeed}x)`
      );
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordPlaybackScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);