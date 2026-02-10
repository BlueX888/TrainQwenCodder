class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 2000; // 2秒录制窗口
    this.operations = []; // 操作记录数组
    this.isReplaying = false;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replayIndex = 0;
    this.operationCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家角色（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = 400;
    this.player.y = 300;
    this.playerVelocity = { x: 0, y: 0 };
    this.playerSpeed = 200;

    // 创建回放影子（半透明蓝色方块）
    this.replayGhost = this.add.graphics();
    this.replayGhost.fillStyle(0x0088ff, 0.6);
    this.replayGhost.fillRect(-16, -16, 32, 32);
    this.replayGhost.x = 400;
    this.replayGhost.y = 300;
    this.replayGhost.setVisible(false);

    // 创建背景网格
    this.createGrid();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 速度调节键（1-5）
    this.speedKeys = {};
    for (let i = 1; i <= 5; i++) {
      this.speedKeys[i] = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes['ONE'] + i - 1
      );
    }

    // 鼠标左键开始回放
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isReplaying && this.operations.length > 0) {
        this.startReplay();
      }
    });

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 550, 
      'WASD/方向键: 移动 | 鼠标左键: 回放 | 数字1-5: 调速度', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 开始录制
    this.recordStartTime = this.time.now;
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  recordOperation(type, data) {
    const currentTime = this.time.now;
    const relativeTime = currentTime - this.recordStartTime;
    
    // 如果超过2秒，重置录制起点
    if (relativeTime > this.recordDuration) {
      this.recordStartTime = currentTime;
      this.operations = [];
    }

    // 记录操作
    this.operations.push({
      time: this.time.now - this.recordStartTime,
      type: type,
      data: data
    });

    // 只保留2秒内的操作
    this.operations = this.operations.filter(op => 
      op.time <= this.recordDuration
    );

    this.operationCount++;
  }

  startReplay() {
    if (this.operations.length === 0) return;

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.replayIndex = 0;
    
    // 重置回放影子位置到录制开始位置
    this.replayGhost.x = 400;
    this.replayGhost.y = 300;
    this.replayGhost.setVisible(true);
    this.replayVelocity = { x: 0, y: 0 };

    // 排序操作序列（按时间）
    this.operations.sort((a, b) => a.time - b.time);
  }

  update(time, delta) {
    // 更新状态文本
    const mode = this.isReplaying ? 'REPLAYING' : 'RECORDING';
    const recordProgress = Math.min(
      ((time - this.recordStartTime) / this.recordDuration) * 100, 
      100
    ).toFixed(0);
    
    this.statusText.setText(
      `模式: ${mode}\n` +
      `录制进度: ${recordProgress}%\n` +
      `操作记录: ${this.operations.length}\n` +
      `总操作数: ${this.operationCount}\n` +
      `回放速度: ${this.replaySpeed.toFixed(1)}x`
    );

    // 处理速度调节
    for (let i = 1; i <= 5; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.speedKeys[i])) {
        this.replaySpeed = i * 0.5; // 0.5x, 1.0x, 1.5x, 2.0x, 2.5x
      }
    }

    if (this.isReplaying) {
      this.updateReplay(time, delta);
    } else {
      this.updatePlayer(time, delta);
    }
  }

  updatePlayer(time, delta) {
    // 重置速度
    this.playerVelocity.x = 0;
    this.playerVelocity.y = 0;

    // 检测输入并记录
    const inputState = {
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown
    };

    if (inputState.left) {
      this.playerVelocity.x = -1;
      this.recordOperation('move', { direction: 'left' });
    }
    if (inputState.right) {
      this.playerVelocity.x = 1;
      this.recordOperation('move', { direction: 'right' });
    }
    if (inputState.up) {
      this.playerVelocity.y = -1;
      this.recordOperation('move', { direction: 'up' });
    }
    if (inputState.down) {
      this.playerVelocity.y = 1;
      this.recordOperation('move', { direction: 'down' });
    }

    // 归一化对角线速度
    if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
      this.playerVelocity.x *= 0.707;
      this.playerVelocity.y *= 0.707;
    }

    // 更新玩家位置
    this.player.x += this.playerVelocity.x * this.playerSpeed * delta / 1000;
    this.player.y += this.playerVelocity.y * this.playerSpeed * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
  }

  updateReplay(time, delta) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 重置速度
    this.replayVelocity = { x: 0, y: 0 };

    // 处理当前时间点的所有操作
    while (this.replayIndex < this.operations.length) {
      const op = this.operations[this.replayIndex];
      
      if (op.time <= elapsedTime) {
        // 执行操作
        if (op.type === 'move') {
          switch (op.data.direction) {
            case 'left':
              this.replayVelocity.x = -1;
              break;
            case 'right':
              this.replayVelocity.x = 1;
              break;
            case 'up':
              this.replayVelocity.y = -1;
              break;
            case 'down':
              this.replayVelocity.y = 1;
              break;
          }
        }
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 归一化对角线速度
    if (this.replayVelocity.x !== 0 && this.replayVelocity.y !== 0) {
      this.replayVelocity.x *= 0.707;
      this.replayVelocity.y *= 0.707;
    }

    // 更新回放影子位置
    this.replayGhost.x += this.replayVelocity.x * this.playerSpeed * delta / 1000;
    this.replayGhost.y += this.replayVelocity.y * this.playerSpeed * delta / 1000;

    // 边界限制
    this.replayGhost.x = Phaser.Math.Clamp(this.replayGhost.x, 16, 784);
    this.replayGhost.y = Phaser.Math.Clamp(this.replayGhost.y, 16, 584);

    // 回放结束
    if (elapsedTime >= this.recordDuration || this.replayIndex >= this.operations.length) {
      this.isReplaying = false;
      this.replayGhost.setVisible(false);
      
      // 重置录制起点
      this.recordStartTime = this.time.now;
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