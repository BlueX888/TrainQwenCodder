// 记录操作序列并回放的游戏
class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 记录系统
    this.recordBuffer = [];
    this.maxRecordFrames = 30; // 0.5秒 @ 60fps
    this.isRecording = true;
    this.isReplaying = false;
    this.replayIndex = 0;
    this.replaySpeed = 1; // 1x, 2x, 3x, 4x
    this.replayCounter = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 3;
    
    // 信号输出
    window.__signals__ = {
      recordedFrames: 0,
      replayProgress: 0,
      replaySpeed: 1,
      mode: 'recording',
      operations: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建轨迹显示（用于可视化记录）
    this.trailGraphics = this.add.graphics();
    
    // 创建UI文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 550, 
      'WASD: Move | SPACE: Replay | 1-4: Speed (1x-4x)', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR
    });
    
    // 空格键事件（开始回放）
    this.cursors.space.on('down', () => {
      if (!this.isReplaying && this.recordBuffer.length > 0) {
        this.startReplay();
      }
    });
    
    // 速度切换事件
    this.cursors.one.on('down', () => this.setReplaySpeed(1));
    this.cursors.two.on('down', () => this.setReplaySpeed(2));
    this.cursors.three.on('down', () => this.setReplaySpeed(3));
    this.cursors.four.on('down', () => this.setReplaySpeed(4));
    
    this.updateInfoText();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay();
    } else if (this.isRecording) {
      this.updateRecording();
    }
    
    this.updateInfoText();
  }
  
  updateRecording() {
    // 记录当前输入状态
    const inputState = {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown
    };
    
    // 处理玩家移动
    let moved = false;
    if (inputState.left) {
      this.playerX -= this.playerSpeed;
      moved = true;
    }
    if (inputState.right) {
      this.playerX += this.playerSpeed;
      moved = true;
    }
    if (inputState.up) {
      this.playerY -= this.playerSpeed;
      moved = true;
    }
    if (inputState.down) {
      this.playerY += this.playerSpeed;
      moved = true;
    }
    
    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
    this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);
    
    // 更新玩家位置
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 记录帧数据
    const frameData = {
      frame: this.recordBuffer.length,
      input: inputState,
      x: this.playerX,
      y: this.playerY,
      moved: moved
    };
    
    this.recordBuffer.push(frameData);
    
    // 保持缓冲区大小（循环记录最近0.5秒）
    if (this.recordBuffer.length > this.maxRecordFrames) {
      this.recordBuffer.shift();
    }
    
    // 更新信号
    window.__signals__.recordedFrames = this.recordBuffer.length;
    window.__signals__.mode = 'recording';
    
    // 绘制轨迹点
    if (moved) {
      this.trailGraphics.fillStyle(0x00ff00, 0.3);
      this.trailGraphics.fillCircle(this.playerX, this.playerY, 2);
    }
  }
  
  startReplay() {
    this.isRecording = false;
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayCounter = 0;
    
    // 清除轨迹
    this.trailGraphics.clear();
    
    // 重置玩家到起始位置
    if (this.recordBuffer.length > 0) {
      const firstFrame = this.recordBuffer[0];
      this.playerX = firstFrame.x;
      this.playerY = firstFrame.y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }
    
    // 改变玩家颜色表示回放模式
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(-16, -16, 32, 32);
    
    // 更新信号
    window.__signals__.mode = 'replaying';
    window.__signals__.operations = this.recordBuffer.map(f => ({
      frame: f.frame,
      input: f.input,
      position: { x: f.x, y: f.y }
    }));
    
    console.log('Replay started:', {
      totalFrames: this.recordBuffer.length,
      speed: this.replaySpeed + 'x'
    });
  }
  
  updateReplay() {
    // 根据回放速度更新
    this.replayCounter++;
    
    // 每 (60 / replaySpeed) 帧执行一次回放帧
    const frameInterval = Math.floor(60 / (60 * this.replaySpeed));
    
    if (this.replayCounter >= Math.max(1, frameInterval)) {
      this.replayCounter = 0;
      
      if (this.replayIndex < this.recordBuffer.length) {
        const frameData = this.recordBuffer[this.replayIndex];
        
        // 回放位置
        this.playerX = frameData.x;
        this.playerY = frameData.y;
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        // 绘制回放轨迹
        if (frameData.moved) {
          this.trailGraphics.fillStyle(0xff0000, 0.5);
          this.trailGraphics.fillCircle(this.playerX, this.playerY, 3);
        }
        
        this.replayIndex++;
        
        // 更新信号
        window.__signals__.replayProgress = 
          (this.replayIndex / this.recordBuffer.length * 100).toFixed(1);
      } else {
        // 回放结束
        this.endReplay();
      }
    }
  }
  
  endReplay() {
    this.isReplaying = false;
    this.isRecording = true;
    this.replayIndex = 0;
    
    // 清空记录缓冲区，开始新的记录
    this.recordBuffer = [];
    
    // 恢复玩家颜色
    this.player.clear();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    
    // 清除轨迹
    this.trailGraphics.clear();
    
    // 更新信号
    window.__signals__.mode = 'recording';
    window.__signals__.replayProgress = 0;
    window.__signals__.recordedFrames = 0;
    
    console.log('Replay ended, recording new sequence');
  }
  
  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    window.__signals__.replaySpeed = speed;
    console.log('Replay speed set to:', speed + 'x');
  }
  
  updateInfoText() {
    const mode = this.isReplaying ? 'REPLAYING' : 'RECORDING';
    const frames = this.recordBuffer.length;
    const progress = this.isReplaying ? 
      `${this.replayIndex}/${frames}` : `${frames}/${this.maxRecordFrames}`;
    
    this.infoText.setText([
      `Mode: ${mode}`,
      `Buffer: ${progress} frames`,
      `Speed: ${this.replaySpeed}x`,
      `Position: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene,
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('Game started - Record & Replay System');
console.log('Controls: WASD to move, SPACE to replay, 1-4 to change speed');