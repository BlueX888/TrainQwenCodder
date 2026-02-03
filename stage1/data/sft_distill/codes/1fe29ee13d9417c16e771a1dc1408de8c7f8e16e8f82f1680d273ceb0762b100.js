class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // 状态变量
    this.recordingDuration = 3000; // 3秒录制窗口
    this.isReplaying = false;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.operationLog = []; // 操作记录
    this.replayIndex = 0;
    this.replayStartTime = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
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

    // 创建回放时的影子玩家（半透明蓝色方块）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0x0088ff, 0.6);
    this.replayPlayer.fillRect(-16, -16, 32, 32);
    this.replayPlayer.visible = false;

    // 创建键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      speedUp: Phaser.Input.Keyboard.KeyCodes.UP,
      speedDown: Phaser.Input.Keyboard.KeyCodes.DOWN
    });

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });

    // 创建 UI 文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 550, 
      'WASD: Move | Right Click: Replay | ↑↓: Speed', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加速度调节按键监听
    this.cursors.speedUp.on('down', () => {
      if (!this.isReplaying) {
        this.replaySpeed = Math.min(this.replaySpeed + 0.5, 3.0);
      }
    });

    this.cursors.speedDown.on('down', () => {
      if (!this.isReplaying) {
        this.replaySpeed = Math.max(this.replaySpeed - 0.5, 0.5);
      }
    });

    // 初始化操作记录
    this.operationLog = [];
    this.recordingStartTime = this.time.now;
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time, delta);
    } else {
      this.updatePlayer(time, delta);
      this.cleanOldOperations(time);
    }

    this.updateUI();
  }

  updatePlayer(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;
    let dx = 0;
    let dy = 0;

    // 记录按键操作
    if (this.cursors.left.isDown) {
      dx -= this.playerSpeed * deltaSeconds;
      moved = true;
      this.recordOperation(time, 'left');
    }
    if (this.cursors.right.isDown) {
      dx += this.playerSpeed * deltaSeconds;
      moved = true;
      this.recordOperation(time, 'right');
    }
    if (this.cursors.up.isDown) {
      dy -= this.playerSpeed * deltaSeconds;
      moved = true;
      this.recordOperation(time, 'up');
    }
    if (this.cursors.down.isDown) {
      dy += this.playerSpeed * deltaSeconds;
      moved = true;
      this.recordOperation(time, 'down');
    }

    // 更新玩家位置
    if (moved) {
      this.playerX = Phaser.Math.Clamp(this.playerX + dx, 16, 784);
      this.playerY = Phaser.Math.Clamp(this.playerY + dy, 16, 584);
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }
  }

  recordOperation(time, action) {
    // 避免重复记录同一帧的相同操作
    const lastOp = this.operationLog[this.operationLog.length - 1];
    if (lastOp && lastOp.action === action && time - lastOp.time < 16) {
      return;
    }

    this.operationLog.push({
      time: time,
      action: action,
      x: this.playerX,
      y: this.playerY
    });
  }

  cleanOldOperations(currentTime) {
    // 清除超过 3 秒的操作记录
    const cutoffTime = currentTime - this.recordingDuration;
    this.operationLog = this.operationLog.filter(op => op.time >= cutoffTime);
  }

  startReplay() {
    if (this.operationLog.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 设置回放起始位置
    if (this.operationLog.length > 0) {
      const firstOp = this.operationLog[0];
      this.replayPlayer.x = firstOp.x;
      this.replayPlayer.y = firstOp.y;
      this.replayPlayer.visible = true;
    }

    // 记录回放开始时的第一个操作时间
    this.replayBaseTime = this.operationLog[0].time;
  }

  updateReplay(time, delta) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
    
    // 处理所有应该执行的操作
    while (this.replayIndex < this.operationLog.length) {
      const op = this.operationLog[this.replayIndex];
      const opRelativeTime = op.time - this.replayBaseTime;
      
      if (opRelativeTime <= elapsedTime) {
        // 执行操作 - 移动到记录的位置
        this.replayPlayer.x = op.x;
        this.replayPlayer.y = op.y;
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.replayIndex >= this.operationLog.length) {
      this.endReplay();
    }
  }

  endReplay() {
    this.isReplaying = false;
    this.replayPlayer.visible = false;
    this.replayIndex = 0;
  }

  updateUI() {
    const opCount = this.operationLog.length;
    const oldestTime = opCount > 0 ? 
      (this.time.now - this.operationLog[0].time) / 1000 : 0;

    if (this.isReplaying) {
      const progress = ((this.replayIndex / this.operationLog.length) * 100).toFixed(0);
      this.statusText.setText(
        `REPLAYING (${this.replaySpeed}x speed)\n` +
        `Progress: ${progress}%\n` +
        `Operations: ${this.replayIndex}/${opCount}`
      );
    } else {
      this.statusText.setText(
        `RECORDING\n` +
        `Operations: ${opCount}\n` +
        `Window: ${oldestTime.toFixed(1)}s / 3.0s\n` +
        `Replay Speed: ${this.replaySpeed}x`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);