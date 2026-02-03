class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.recordDuration = 1500; // 1.5秒
    this.recordedActions = []; // 记录的操作序列
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.currentActionIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.moveSpeed = 200;
    
    // 可验证的状态信号
    this.totalDistance = 0; // 总移动距离
    this.actionCount = 0; // 操作次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建回放时的影子玩家（半透明蓝色）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0x0088ff, 0.6);
    this.replayPlayer.fillRect(-16, -16, 32, 32);
    this.replayPlayer.setVisible(false);
    
    // 创建轨迹线
    this.trailGraphics = this.add.graphics();
    
    // 键盘输入
    this.cursors = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // 速度调节键（1-5）
    this.speedKeys = {
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    };
    
    // 鼠标右键监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });
    
    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.infoText = this.add.text(10, 50, 
      'WASD: Move | Right Click: Replay | 1-5: Speed (0.5x-2.5x)', {
      fontSize: '14px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statsText = this.add.text(10, 90, '', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    this.player.setVisible(true);
    this.replayPlayer.setVisible(false);
    this.trailGraphics.clear();
    this.totalDistance = 0;
    this.actionCount = 0;
    
    // 1.5秒后自动停止录制
    this.time.delayedCall(this.recordDuration, () => {
      if (this.isRecording) {
        this.stopRecording();
      }
    });
  }

  stopRecording() {
    this.isRecording = false;
  }

  startReplay() {
    if (this.recordedActions.length === 0 || this.isReplaying) {
      return;
    }
    
    this.isReplaying = true;
    this.isRecording = false;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    
    // 重置回放玩家位置
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.setVisible(true);
    this.player.setVisible(false);
    
    // 清除轨迹
    this.trailGraphics.clear();
  }

  recordAction(keys, deltaX, deltaY) {
    if (!this.isRecording) return;
    
    const elapsedTime = this.time.now - this.recordStartTime;
    if (elapsedTime > this.recordDuration) {
      this.stopRecording();
      return;
    }
    
    this.recordedActions.push({
      time: elapsedTime,
      keys: { ...keys },
      deltaX: deltaX,
      deltaY: deltaY
    });
    
    this.actionCount++;
  }

  update(time, delta) {
    // 速度调节
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.ONE)) {
      this.replaySpeed = 0.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.TWO)) {
      this.replaySpeed = 1.0;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.THREE)) {
      this.replaySpeed = 1.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.FOUR)) {
      this.replaySpeed = 2.0;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.FIVE)) {
      this.replaySpeed = 2.5;
    }
    
    // 录制模式
    if (this.isRecording) {
      const keys = {
        W: this.cursors.W.isDown,
        A: this.cursors.A.isDown,
        S: this.cursors.S.isDown,
        D: this.cursors.D.isDown
      };
      
      let deltaX = 0;
      let deltaY = 0;
      let moved = false;
      
      if (keys.W) {
        deltaY = -this.moveSpeed * (delta / 1000);
        moved = true;
      }
      if (keys.S) {
        deltaY = this.moveSpeed * (delta / 1000);
        moved = true;
      }
      if (keys.A) {
        deltaX = -this.moveSpeed * (delta / 1000);
        moved = true;
      }
      if (keys.D) {
        deltaX = this.moveSpeed * (delta / 1000);
        moved = true;
      }
      
      if (moved) {
        const oldX = this.playerX;
        const oldY = this.playerY;
        
        this.playerX += deltaX;
        this.playerY += deltaY;
        
        // 边界限制
        this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
        this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);
        
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        // 绘制轨迹
        this.trailGraphics.lineStyle(2, 0x00ff00, 0.5);
        this.trailGraphics.lineBetween(oldX, oldY, this.playerX, this.playerY);
        
        // 记录操作
        this.recordAction(keys, deltaX, deltaY);
        
        // 计算距离
        const distance = Phaser.Math.Distance.Between(oldX, oldY, this.playerX, this.playerY);
        this.totalDistance += distance;
      }
      
      const elapsed = time - this.recordStartTime;
      const remaining = Math.max(0, this.recordDuration - elapsed);
      this.statusText.setText(
        `Recording: ${(remaining / 1000).toFixed(2)}s remaining`
      );
    }
    
    // 回放模式
    else if (this.isReplaying) {
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
      
      // 回放所有应该执行的动作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.time <= elapsedTime) {
          const oldX = this.replayPlayer.x;
          const oldY = this.replayPlayer.y;
          
          this.replayPlayer.x += action.deltaX;
          this.replayPlayer.y += action.deltaY;
          
          // 边界限制
          this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 16, 784);
          this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 16, 584);
          
          // 绘制回放轨迹
          this.trailGraphics.lineStyle(2, 0x0088ff, 0.5);
          this.trailGraphics.lineBetween(oldX, oldY, this.replayPlayer.x, this.replayPlayer.y);
          
          this.currentActionIndex++;
        } else {
          break;
        }
      }
      
      // 回放结束
      if (this.currentActionIndex >= this.recordedActions.length) {
        this.time.delayedCall(500, () => {
          this.isReplaying = false;
          this.replayPlayer.setVisible(false);
          this.startRecording(); // 重新开始录制
        });
      }
      
      this.statusText.setText(
        `Replaying: ${this.currentActionIndex}/${this.recordedActions.length} actions (${this.replaySpeed}x speed)`
      );
    }
    
    // 空闲模式
    else {
      this.statusText.setText('Idle - Ready to record');
    }
    
    // 更新统计信息
    this.statsText.setText(
      `Actions: ${this.actionCount} | Distance: ${this.totalDistance.toFixed(1)}px | Recorded: ${this.recordedActions.length}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene
};

new Phaser.Game(config);