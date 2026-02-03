class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.recordDuration = 2000; // 2秒
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replaySpeedOptions = [0.5, 1.0, 2.0]; // 可选速度
    this.currentSpeedIndex = 1;
    
    // 操作记录
    this.actionSequence = [];
    this.replayIndex = 0;
    this.replayStartTime = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 初始位置（用于回放重置）
    this.initialX = 400;
    this.initialY = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.setPosition(this.playerX, this.playerY);
    
    // 创建轨迹点容器
    this.trailGraphics = this.add.graphics();
    
    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      speedUp: Phaser.Input.Keyboard.KeyCodes.UP,
      speedDown: Phaser.Input.Keyboard.KeyCodes.DOWN
    });
    
    // 鼠标右键监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });
    
    // 速度调节键监听
    this.cursors.speedUp.on('down', () => {
      this.changeReplaySpeed(1);
    });
    
    this.cursors.speedDown.on('down', () => {
      this.changeReplaySpeed(-1);
    });
    
    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.infoText = this.add.text(10, 50, 
      'WASD: 移动\n右键: 回放\n↑↓: 调节回放速度\n\n操作会自动记录2秒', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.recordingText = this.add.text(400, 10, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
    
    // 开始录制
    this.startRecording();
    
    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
    } else if (this.isRecording) {
      this.updateRecording(time, delta);
    }
    
    this.updateStatusText();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.actionSequence = [];
    this.recordStartTime = this.time.now;
    
    // 记录初始位置
    this.initialX = this.playerX;
    this.initialY = this.playerY;
    
    // 清除轨迹
    this.trailGraphics.clear();
    
    // 2秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`录制完成，共记录 ${this.actionSequence.length} 个操作`);
  }

  updateRecording(time, delta) {
    const elapsed = time - this.recordStartTime;
    
    if (elapsed > this.recordDuration) {
      return;
    }
    
    let moved = false;
    let dx = 0;
    let dy = 0;
    
    // 记录按键状态
    if (this.cursors.left.isDown) {
      dx -= this.playerSpeed * (delta / 1000);
      moved = true;
    }
    if (this.cursors.right.isDown) {
      dx += this.playerSpeed * (delta / 1000);
      moved = true;
    }
    if (this.cursors.up.isDown) {
      dy -= this.playerSpeed * (delta / 1000);
      moved = true;
    }
    if (this.cursors.down.isDown) {
      dy += this.playerSpeed * (delta / 1000);
      moved = true;
    }
    
    if (moved) {
      // 更新位置
      this.playerX += dx;
      this.playerY += dy;
      
      // 边界限制
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
      this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
      
      this.player.setPosition(this.playerX, this.playerY);
      
      // 记录操作
      this.actionSequence.push({
        time: elapsed,
        x: this.playerX,
        y: this.playerY
      });
      
      // 绘制轨迹点
      this.trailGraphics.fillStyle(0x00ff00, 0.3);
      this.trailGraphics.fillCircle(this.playerX, this.playerY, 2);
    }
  }

  startReplay() {
    if (this.actionSequence.length === 0) {
      console.log('没有可回放的操作');
      return;
    }
    
    if (this.isReplaying) {
      console.log('正在回放中');
      return;
    }
    
    this.isRecording = false;
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 重置玩家位置到初始位置
    this.playerX = this.initialX;
    this.playerY = this.initialY;
    this.player.setPosition(this.playerX, this.playerY);
    
    // 改变玩家颜色表示回放
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(-20, -20, 40, 40);
    
    // 清除轨迹
    this.trailGraphics.clear();
    
    console.log(`开始回放，速度: ${this.replaySpeed}x`);
  }

  updateReplay(time) {
    const elapsed = (time - this.replayStartTime) * this.replaySpeed;
    
    // 查找当前时间点应该执行的操作
    while (this.replayIndex < this.actionSequence.length) {
      const action = this.actionSequence[this.replayIndex];
      
      if (action.time <= elapsed) {
        // 执行操作
        this.playerX = action.x;
        this.playerY = action.y;
        this.player.setPosition(this.playerX, this.playerY);
        
        // 绘制回放轨迹
        this.trailGraphics.fillStyle(0xff0000, 0.3);
        this.trailGraphics.fillCircle(this.playerX, this.playerY, 2);
        
        this.replayIndex++;
      } else {
        break;
      }
    }
    
    // 回放完成
    if (this.replayIndex >= this.actionSequence.length) {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    
    // 恢复玩家颜色
    this.player.clear();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    
    console.log('回放完成');
    
    // 自动开始新的录制
    this.time.delayedCall(500, () => {
      this.startRecording();
    });
  }

  changeReplaySpeed(direction) {
    this.currentSpeedIndex += direction;
    
    if (this.currentSpeedIndex < 0) {
      this.currentSpeedIndex = 0;
    }
    if (this.currentSpeedIndex >= this.replaySpeedOptions.length) {
      this.currentSpeedIndex = this.replaySpeedOptions.length - 1;
    }
    
    this.replaySpeed = this.replaySpeedOptions[this.currentSpeedIndex];
    console.log(`回放速度调整为: ${this.replaySpeed}x`);
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, (this.recordDuration - elapsed) / 1000).toFixed(1);
      status = `状态: 录制中 (剩余 ${remaining}s)`;
      this.recordingText.setText(`正在录制... ${this.actionSequence.length} 个操作点`);
    } else if (this.isReplaying) {
      status = `状态: 回放中 (速度: ${this.replaySpeed}x)`;
      this.recordingText.setText(`回放中... ${this.replayIndex}/${this.actionSequence.length}`);
    } else {
      status = `状态: 空闲 (已录制 ${this.actionSequence.length} 个操作点)`;
      this.recordingText.setText('');
    }
    
    status += `\n位置: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`;
    status += `\n回放速度: ${this.replaySpeed}x`;
    
    this.statusText.setText(status);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordReplayScene,
  input: {
    mouse: {
      target: null,
      capture: true
    },
    keyboard: {
      target: null
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);