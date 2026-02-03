class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // 操作记录
    this.operations = [];
    this.recordWindow = 1000; // 1秒记录窗口
    
    // 回放状态
    this.isReplaying = false;
    this.replaySpeed = 1; // 回放速度倍数
    this.replayStartTime = 0;
    this.replayIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 统计信息（可验证状态）
    this.totalOperations = 0;
    this.replayCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家（使用Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建录制指示器
    this.recordIndicator = this.add.graphics();
    this.updateRecordIndicator();
    
    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.operationsText = this.add.text(10, 50, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionsText = this.add.text(10, 550, 
      'WASD/方向键: 移动 | 左键: 点击 | 右键: 回放 | 数字1/2/3: 切换速度(1x/2x/4x)',
      {
        fontSize: '14px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 监听键盘按下事件（用于记录）
    this.input.keyboard.on('keydown', (event) => {
      if (!this.isReplaying) {
        this.recordOperation('keydown', event.keyCode);
      }
    });
    
    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isReplaying) {
        this.recordOperation('click', { x: pointer.x, y: pointer.y });
        this.createClickEffect(pointer.x, pointer.y);
      }
      
      // 右键开始回放
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });
    
    // 速度切换键
    this.input.keyboard.on('keydown-ONE', () => this.setReplaySpeed(1));
    this.input.keyboard.on('keydown-TWO', () => this.setReplaySpeed(2));
    this.input.keyboard.on('keydown-THREE', () => this.setReplaySpeed(4));
    
    // 定期清理过期操作
    this.time.addEvent({
      delay: 100,
      callback: this.cleanOldOperations,
      callbackScope: this,
      loop: true
    });
    
    this.updateUI();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
    } else {
      this.updatePlayerMovement(delta);
    }
    
    this.updateUI();
    this.updateRecordIndicator();
  }

  // 记录操作
  recordOperation(type, data) {
    const operation = {
      time: this.time.now,
      type: type,
      data: data
    };
    
    this.operations.push(operation);
    this.totalOperations++;
  }

  // 清理1秒前的操作
  cleanOldOperations() {
    const currentTime = this.time.now;
    const cutoffTime = currentTime - this.recordWindow;
    
    this.operations = this.operations.filter(op => op.time >= cutoffTime);
  }

  // 更新玩家移动（录制模式）
  updatePlayerMovement(delta) {
    const speed = this.playerSpeed * (delta / 1000);
    let moved = false;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.playerX -= speed;
      moved = true;
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.playerX += speed;
      moved = true;
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.playerY -= speed;
      moved = true;
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.playerY += speed;
      moved = true;
    }
    
    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
    
    this.player.x = this.playerX;
    this.player.y = this.playerY;
  }

  // 开始回放
  startReplay() {
    if (this.operations.length === 0) {
      return;
    }
    
    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.replayIndex = 0;
    this.replayCount++;
    
    // 保存当前位置作为回放起点
    this.replayStartX = this.playerX;
    this.replayStartY = this.playerY;
    
    // 复制操作序列（按时间排序）
    this.replayOperations = [...this.operations].sort((a, b) => a.time - b.time);
    
    // 计算相对时间
    if (this.replayOperations.length > 0) {
      const baseTime = this.replayOperations[0].time;
      this.replayOperations = this.replayOperations.map(op => ({
        ...op,
        relativeTime: op.time - baseTime
      }));
    }
  }

  // 更新回放
  updateReplay(time) {
    if (!this.replayOperations || this.replayIndex >= this.replayOperations.length) {
      this.stopReplay();
      return;
    }
    
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
    
    // 执行所有应该执行的操作
    while (this.replayIndex < this.replayOperations.length) {
      const op = this.replayOperations[this.replayIndex];
      
      if (op.relativeTime <= elapsedTime) {
        this.executeOperation(op);
        this.replayIndex++;
      } else {
        break;
      }
    }
  }

  // 执行单个操作
  executeOperation(operation) {
    if (operation.type === 'click') {
      this.createClickEffect(operation.data.x, operation.data.y);
    } else if (operation.type === 'keydown') {
      // 模拟按键效果（视觉反馈）
      this.createKeyEffect(operation.data);
    }
  }

  // 停止回放
  stopReplay() {
    this.isReplaying = false;
    this.replayOperations = null;
  }

  // 设置回放速度
  setReplaySpeed(speed) {
    this.replaySpeed = speed;
  }

  // 创建点击特效
  createClickEffect(x, y) {
    const circle = this.add.graphics();
    circle.lineStyle(3, 0xff0000, 1);
    circle.strokeCircle(x, y, 10);
    
    this.tweens.add({
      targets: circle,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => circle.destroy()
    });
  }

  // 创建按键特效
  createKeyEffect(keyCode) {
    let keyName = '';
    
    // 转换keyCode为可读名称
    if (keyCode === Phaser.Input.Keyboard.KeyCodes.W || 
        keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
      keyName = '↑';
    } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.S || 
               keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
      keyName = '↓';
    } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.A || 
               keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
      keyName = '←';
    } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.D || 
               keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
      keyName = '→';
    }
    
    if (keyName) {
      const text = this.add.text(this.player.x, this.player.y - 40, keyName, {
        fontSize: '24px',
        fill: '#ffff00'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: text,
        y: text.y - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => text.destroy()
      });
    }
  }

  // 更新录制指示器
  updateRecordIndicator() {
    this.recordIndicator.clear();
    
    if (this.isReplaying) {
      // 回放模式：蓝色方块
      this.recordIndicator.fillStyle(0x0000ff, 1);
      this.recordIndicator.fillRect(750, 10, 40, 40);
      this.recordIndicator.fillStyle(0xffffff, 1);
      this.recordIndicator.fillTriangle(760, 20, 760, 40, 775, 30);
      this.recordIndicator.fillTriangle(775, 20, 775, 40, 790, 30);
    } else {
      // 录制模式：红色圆点（闪烁）
      const alpha = Math.sin(this.time.now / 200) * 0.5 + 0.5;
      this.recordIndicator.fillStyle(0xff0000, alpha);
      this.recordIndicator.fillCircle(770, 30, 15);
    }
  }

  // 更新UI文本
  updateUI() {
    const mode = this.isReplaying ? `回放中 (${this.replaySpeed}x)` : '录制中';
    const progress = this.isReplaying ? 
      `${this.replayIndex}/${this.replayOperations?.length || 0}` : 
      `${this.operations.length} 操作`;
    
    this.statusText.setText(
      `状态: ${mode}\n` +
      `进度: ${progress}\n` +
      `速度: ${this.replaySpeed}x`
    );
    
    this.operationsText.setText(
      `总操作数: ${this.totalOperations}\n` +
      `回放次数: ${this.replayCount}\n` +
      `缓存操作: ${this.operations.length}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  input: {
    mouse: {
      preventDefaultWheel: false
    }
  }
};

new Phaser.Game(config);