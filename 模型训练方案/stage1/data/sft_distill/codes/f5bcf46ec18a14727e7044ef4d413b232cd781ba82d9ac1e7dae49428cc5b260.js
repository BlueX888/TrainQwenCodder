// 操作记录与回放系统
class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordWindow = 500; // 0.5秒记录窗口（毫秒）
    this.operations = []; // 操作记录数组
    this.isReplaying = false; // 是否正在回放
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0; // 当前回放索引
    this.replayStartTime = 0; // 回放开始时间
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200; // 像素/秒
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      operations: [],
      replayEvents: [],
      currentMode: 'recording',
      replaySpeed: 1.0
    };

    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放速度指示器
    this.speedIndicators = [];
    const speeds = [0.5, 1.0, 2.0, 4.0];
    speeds.forEach((speed, index) => {
      const indicator = this.add.graphics();
      indicator.fillStyle(speed === this.replaySpeed ? 0xffff00 : 0x666666, 1);
      indicator.fillCircle(700 + index * 30, 50, 10);
      this.speedIndicators.push({ graphics: indicator, speed: speed });
      
      const text = this.add.text(700 + index * 30, 70, `${speed}x`, {
        fontSize: '12px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
    });

    // UI文本
    this.statusText = this.add.text(10, 10, 'Mode: RECORDING (0.5s window)', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'WASD: Move | SPACE: Replay | 1234: Speed (0.5x/1x/2x/4x)', {
      fontSize: '14px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.operationText = this.add.text(10, 90, 'Operations: 0', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.replayText = this.add.text(10, 130, '', {
      fontSize: '14px',
      color: '#ffff00',
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
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)
    };

    // 速度切换
    this.keys.ONE.on('down', () => this.setReplaySpeed(0.5));
    this.keys.TWO.on('down', () => this.setReplaySpeed(1.0));
    this.keys.THREE.on('down', () => this.setReplaySpeed(2.0));
    this.keys.FOUR.on('down', () => this.setReplaySpeed(4.0));

    // 空格键开始回放
    this.keys.SPACE.on('down', () => {
      if (!this.isReplaying && this.operations.length > 0) {
        this.startReplay();
      }
    });

    // 记录按键按下事件
    ['W', 'A', 'S', 'D'].forEach(key => {
      this.keys[key].on('down', () => {
        if (!this.isReplaying) {
          this.recordOperation(key, 'down');
        }
      });
      this.keys[key].on('up', () => {
        if (!this.isReplaying) {
          this.recordOperation(key, 'up');
        }
      });
    });

    this.recordStartTime = this.time.now;
  }

  recordOperation(key, type) {
    const currentTime = this.time.now;
    const timestamp = currentTime - this.recordStartTime;

    // 移除超过0.5秒窗口的旧操作
    this.operations = this.operations.filter(op => {
      return (timestamp - op.timestamp) <= this.recordWindow;
    });

    // 添加新操作
    const operation = {
      key: key,
      type: type,
      timestamp: timestamp,
      position: { x: this.player.x, y: this.player.y }
    };
    
    this.operations.push(operation);
    
    // 更新信号
    window.__signals__.operations = [...this.operations];
    
    this.operationText.setText(`Operations: ${this.operations.length} (last ${this.recordWindow}ms)`);
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    window.__signals__.replaySpeed = speed;
    
    // 更新速度指示器
    this.speedIndicators.forEach(indicator => {
      if (indicator.speed === speed) {
        indicator.graphics.clear();
        indicator.graphics.fillStyle(0xffff00, 1);
        indicator.graphics.fillCircle(0, 0, 10);
      } else {
        indicator.graphics.clear();
        indicator.graphics.fillStyle(0x666666, 1);
        indicator.graphics.fillCircle(0, 0, 10);
      }
    });
  }

  startReplay() {
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 重置玩家位置到第一个操作的位置
    if (this.operations.length > 0) {
      this.playerX = this.operations[0].position.x;
      this.playerY = this.operations[0].position.y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }

    // 改变玩家颜色表示回放模式
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(-16, -16, 32, 32);

    this.statusText.setText('Mode: REPLAYING');
    window.__signals__.currentMode = 'replaying';
    
    const replayEvent = {
      type: 'replay_start',
      time: this.time.now,
      speed: this.replaySpeed,
      operationCount: this.operations.length
    };
    window.__signals__.replayEvents.push(replayEvent);
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time, delta);
    } else {
      this.updatePlayer(delta);
    }
  }

  updatePlayer(delta) {
    const speed = this.playerSpeed * (delta / 1000);
    
    if (this.keys.W.isDown) {
      this.playerY -= speed;
    }
    if (this.keys.S.isDown) {
      this.playerY += speed;
    }
    if (this.keys.A.isDown) {
      this.playerX -= speed;
    }
    if (this.keys.D.isDown) {
      this.playerX += speed;
    }

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
    this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);

    this.player.x = this.playerX;
    this.player.y = this.playerY;
  }

  updateReplay(time, delta) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;
    
    // 处理当前时间点应该执行的操作
    while (this.replayIndex < this.operations.length) {
      const op = this.operations[this.replayIndex];
      
      if (op.timestamp <= elapsedTime) {
        // 执行操作
        this.executeOperation(op);
        this.replayIndex++;
        
        this.replayText.setText(
          `Replaying: ${this.replayIndex}/${this.operations.length} | ` +
          `Key: ${op.key} ${op.type}`
        );
      } else {
        break;
      }
    }

    // 模拟按键状态进行移动
    const speed = this.playerSpeed * (delta / 1000);
    const activeKeys = this.getActiveKeysAtTime(elapsedTime);
    
    if (activeKeys.W) this.playerY -= speed;
    if (activeKeys.S) this.playerY += speed;
    if (activeKeys.A) this.playerX -= speed;
    if (activeKeys.D) this.playerX += speed;

    this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
    this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);
    
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 回放完成
    if (this.replayIndex >= this.operations.length && 
        elapsedTime > this.operations[this.operations.length - 1].timestamp + 100) {
      this.endReplay();
    }
  }

  getActiveKeysAtTime(timestamp) {
    const activeKeys = { W: false, A: false, S: false, D: false };
    
    // 检查每个按键在当前时间点的状态
    ['W', 'A', 'S', 'D'].forEach(key => {
      let isDown = false;
      
      for (let i = 0; i < this.operations.length; i++) {
        const op = this.operations[i];
        if (op.key === key && op.timestamp <= timestamp) {
          isDown = (op.type === 'down');
        }
      }
      
      activeKeys[key] = isDown;
    });
    
    return activeKeys;
  }

  executeOperation(operation) {
    const event = {
      type: 'operation_executed',
      key: operation.key,
      action: operation.type,
      timestamp: operation.timestamp,
      replayTime: this.time.now - this.replayStartTime
    };
    window.__signals__.replayEvents.push(event);
  }

  endReplay() {
    this.isReplaying = false;
    this.replayText.setText('Replay Complete!');
    
    // 恢复录制模式
    this.player.clear();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    
    this.statusText.setText('Mode: RECORDING (0.5s window)');
    window.__signals__.currentMode = 'recording';
    
    const replayEvent = {
      type: 'replay_end',
      time: this.time.now
    };
    window.__signals__.replayEvents.push(replayEvent);
    
    // 重置录制时间
    this.recordStartTime = this.time.now;
    this.operations = [];
    this.operationText.setText('Operations: 0');
    
    // 延迟清除回放文本
    this.time.delayedCall(2000, () => {
      this.replayText.setText('');
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene
};

new Phaser.Game(config);