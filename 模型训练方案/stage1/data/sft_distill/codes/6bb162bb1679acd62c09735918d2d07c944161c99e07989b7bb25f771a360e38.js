class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态信号
    this.recordingState = 'idle'; // idle, recording, replaying
    this.playbackSpeed = 1.0;
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.recordDuration = 2500; // 2.5秒
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.moveSpeed = 200;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建幽灵方块（用于回放）
    this.ghost = this.add.graphics();
    this.ghost.fillStyle(0x0088ff, 0.6);
    this.ghost.fillRect(-20, -20, 40, 40);
    this.ghost.visible = false;
    
    // 创建录制区域边界
    this.boundary = this.add.graphics();
    this.boundary.lineStyle(2, 0xffffff, 1);
    this.boundary.strokeRect(50, 50, 700, 500);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.speedUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.speedDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.resetSpeedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 560, 
      'WASD/方向键: 移动 | 空格: 开始回放 | ↑↓: 调速 | R: 重置速度', {
      fontSize: '14px',
      color: '#cccccc'
    });
    
    this.recordTimerText = this.add.text(400, 10, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
    
    // 开始录制
    this.startRecording();
    
    // 键盘事件监听
    this.spaceKey.on('down', () => {
      if (this.recordingState === 'idle' && this.recordedActions.length > 0) {
        this.startReplay();
      }
    });
    
    this.speedUpKey.on('down', () => {
      this.playbackSpeed = Math.min(this.playbackSpeed + 0.5, 3.0);
      this.updateStatusText();
    });
    
    this.speedDownKey.on('down', () => {
      this.playbackSpeed = Math.max(this.playbackSpeed - 0.5, 0.5);
      this.updateStatusText();
    });
    
    this.resetSpeedKey.on('down', () => {
      this.playbackSpeed = 1.0;
      this.updateStatusText();
    });
    
    this.updateStatusText();
  }

  startRecording() {
    this.recordingState = 'recording';
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    this.updateStatusText();
  }

  startReplay() {
    if (this.recordedActions.length === 0) return;
    
    this.recordingState = 'replaying';
    this.ghost.visible = true;
    this.ghost.x = 400;
    this.ghost.y = 300;
    
    let ghostX = 400;
    let ghostY = 300;
    
    this.updateStatusText();
    
    // 执行回放
    let actionIndex = 0;
    const executeNextAction = () => {
      if (actionIndex >= this.recordedActions.length) {
        // 回放结束
        this.recordingState = 'idle';
        this.ghost.visible = false;
        this.startRecording(); // 重新开始录制
        return;
      }
      
      const action = this.recordedActions[actionIndex];
      const nextAction = this.recordedActions[actionIndex + 1];
      
      // 移动幽灵
      ghostX += action.dx;
      ghostY += action.dy;
      
      // 限制在边界内
      ghostX = Phaser.Math.Clamp(ghostX, 70, 730);
      ghostY = Phaser.Math.Clamp(ghostY, 70, 530);
      
      this.ghost.x = ghostX;
      this.ghost.y = ghostY;
      
      actionIndex++;
      
      // 计算下一个动作的延迟（考虑回放速度）
      if (nextAction) {
        const delay = (nextAction.timestamp - action.timestamp) / this.playbackSpeed;
        this.time.delayedCall(delay, executeNextAction);
      } else {
        this.time.delayedCall(100, executeNextAction);
      }
    };
    
    executeNextAction();
  }

  updateStatusText() {
    const stateStr = this.recordingState === 'recording' ? '录制中' :
                     this.recordingState === 'replaying' ? '回放中' : '空闲';
    const speedStr = `回放速度: ${this.playbackSpeed.toFixed(1)}x`;
    const actionsStr = `操作数: ${this.recordedActions.length}`;
    
    this.statusText.setText(`状态: ${stateStr} | ${speedStr} | ${actionsStr}`);
  }

  update(time, delta) {
    if (this.recordingState === 'recording') {
      // 检查录制时间
      const elapsed = time - this.recordStartTime;
      const remaining = Math.max(0, this.recordDuration - elapsed);
      
      this.recordTimerText.setText(`录制剩余时间: ${(remaining / 1000).toFixed(2)}s`);
      
      if (elapsed >= this.recordDuration) {
        // 录制结束
        this.recordingState = 'idle';
        this.recordTimerText.setText('录制完成！按空格开始回放');
        this.updateStatusText();
        return;
      }
      
      // 记录玩家输入
      let dx = 0;
      let dy = 0;
      
      if (this.cursors.left.isDown) {
        dx = -this.moveSpeed * (delta / 1000);
      } else if (this.cursors.right.isDown) {
        dx = this.moveSpeed * (delta / 1000);
      }
      
      if (this.cursors.up.isDown) {
        dy = -this.moveSpeed * (delta / 1000);
      } else if (this.cursors.down.isDown) {
        dy = this.moveSpeed * (delta / 1000);
      }
      
      // 如果有移动，记录动作
      if (dx !== 0 || dy !== 0) {
        this.playerX += dx;
        this.playerY += dy;
        
        // 限制在边界内
        this.playerX = Phaser.Math.Clamp(this.playerX, 70, 730);
        this.playerY = Phaser.Math.Clamp(this.playerY, 70, 530);
        
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        // 记录操作
        this.recordedActions.push({
          timestamp: time - this.recordStartTime,
          dx: dx,
          dy: dy
        });
        
        this.updateStatusText();
      }
    } else if (this.recordingState === 'idle') {
      this.recordTimerText.setText('录制完成！按空格开始回放');
    } else if (this.recordingState === 'replaying') {
      this.recordTimerText.setText('回放中...');
    }
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