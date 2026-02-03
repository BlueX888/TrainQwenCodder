class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = true;
    this.isReplaying = false;
    this.operationCount = 0;
    this.replaySpeed = 1.0;
    
    // 操作记录
    this.operations = [];
    this.recordStartTime = 0;
    this.recordDuration = 1500; // 1.5秒
    
    // 回放相关
    this.replayStartTime = 0;
    this.replayIndex = 0;
    this.replayPlayer = null;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（实际控制的）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.setPosition(this.playerX, this.playerY);

    // 创建回放玩家（半透明）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff6b6b, 0.7);
    this.replayPlayer.fillCircle(0, 0, 20);
    this.replayPlayer.setPosition(this.playerX, this.playerY);
    this.replayPlayer.setVisible(false);

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 550, 
      'WASD: Move | Right Click: Replay | Mouse Wheel: Speed', {
      fontSize: '14px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作历史显示
    this.historyText = this.add.text(600, 10, '', {
      fontSize: '12px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });

    // 监听鼠标滚轮调整回放速度
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        this.replaySpeed = Math.max(0.25, this.replaySpeed - 0.25);
      } else {
        this.replaySpeed = Math.min(4.0, this.replaySpeed + 0.25);
      }
    });

    // 初始化录制
    this.recordStartTime = this.time.now;
    
    // 禁用右键菜单
    this.input.mouse.disableContextMenu();
  }

  update(time, delta) {
    this.updateStatus();

    if (this.isRecording) {
      this.handleRecording(time, delta);
    }

    if (this.isReplaying) {
      this.handleReplay(time);
    }
  }

  handleRecording(time, delta) {
    const currentTime = time - this.recordStartTime;
    let moved = false;
    let direction = '';

    // 记录移动操作
    if (this.cursors.W.isDown) {
      this.playerY -= this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'W';
    }
    if (this.cursors.S.isDown) {
      this.playerY += this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'S';
    }
    if (this.cursors.A.isDown) {
      this.playerX -= this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'A';
    }
    if (this.cursors.D.isDown) {
      this.playerX += this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'D';
    }

    // 限制边界
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

    // 更新玩家位置
    this.player.setPosition(this.playerX, this.playerY);

    // 记录操作
    if (moved) {
      this.operations.push({
        time: currentTime,
        type: 'move',
        direction: direction,
        x: this.playerX,
        y: this.playerY
      });
      this.operationCount++;
    }

    // 清理超过1.5秒的操作
    this.operations = this.operations.filter(op => 
      currentTime - op.time <= this.recordDuration
    );
  }

  handleReplay(time) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 播放所有应该执行的操作
    while (this.replayIndex < this.operations.length) {
      const op = this.operations[this.replayIndex];
      
      if (op.time <= elapsedTime) {
        // 执行操作
        if (op.type === 'move') {
          this.replayPlayer.setPosition(op.x, op.y);
        }
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.replayIndex >= this.operations.length) {
      this.stopReplay();
    }
  }

  startReplay() {
    if (this.operations.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.isRecording = false;
    this.replayStartTime = this.time.now;
    this.replayIndex = 0;

    // 重置回放玩家位置到第一个操作的位置
    if (this.operations.length > 0) {
      const firstOp = this.operations[0];
      this.replayPlayer.setPosition(firstOp.x, firstOp.y);
    }
    
    this.replayPlayer.setVisible(true);
    this.player.setAlpha(0.3);
  }

  stopReplay() {
    this.isReplaying = false;
    this.isRecording = true;
    this.replayPlayer.setVisible(false);
    this.player.setAlpha(1.0);
    
    // 重置录制时间
    this.recordStartTime = this.time.now;
  }

  updateStatus() {
    const mode = this.isReplaying ? 'REPLAYING' : 'RECORDING';
    const opCount = this.operations.length;
    const bufferPercent = Math.min(100, (opCount / 100) * 100).toFixed(0);
    
    this.statusText.setText([
      `Mode: ${mode}`,
      `Operations: ${this.operationCount}`,
      `Buffer: ${opCount} ops (${bufferPercent}%)`,
      `Replay Speed: ${this.replaySpeed.toFixed(2)}x`,
      `Position: (${Math.floor(this.playerX)}, ${Math.floor(this.playerY)})`
    ]);

    // 显示最近的操作历史
    const recentOps = this.operations.slice(-5);
    const historyLines = ['Recent Operations:'];
    recentOps.forEach((op, i) => {
      historyLines.push(
        `${i + 1}. ${op.direction} @${op.time.toFixed(0)}ms`
      );
    });
    this.historyText.setText(historyLines);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordReplayScene,
  parent: 'game-container'
};

new Phaser.Game(config);