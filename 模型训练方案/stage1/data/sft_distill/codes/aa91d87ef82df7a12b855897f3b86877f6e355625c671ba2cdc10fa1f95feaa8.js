class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingDuration = 2500; // 2.5秒
    this.recordings = []; // 存储操作记录
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0;
    this.replayStartTime = 0;
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200; // 像素/秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建背景网格
    this.createGrid();

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      '按住 WASD/方向键 移动（自动录制2.5秒）\n鼠标左键：开始回放\n数字键 1-5：调节回放速度(0.5x-2.5x)',
      {
        fontSize: '14px',
        fill: '#ffff00',
        backgroundColor: '#000000aa',
        padding: { x: 5, y: 5 }
      }
    );

    this.recordingIndicator = this.add.text(10, 550, '', {
      fontSize: '16px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 速度调节键
    this.speedKeys = [];
    for (let i = 1; i <= 5; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['ONE'] + i - 1);
      key.on('down', () => {
        this.replaySpeed = i * 0.5;
        this.updateStatusText();
      });
      this.speedKeys.push(key);
    }

    // 鼠标左键回放
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isRecording && this.recordings.length > 0) {
        this.startReplay();
      }
    });

    // 初始化状态
    this.updateStatusText();
  }

  createGrid() {
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      gridGraphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      gridGraphics.lineBetween(0, y, 800, y);
    }
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
      return;
    }

    // 检测是否有按键按下
    const hasInput = this.cursors.left.isDown || this.cursors.right.isDown ||
                     this.cursors.up.isDown || this.cursors.down.isDown ||
                     this.wasd.left.isDown || this.wasd.right.isDown ||
                     this.wasd.up.isDown || this.wasd.down.isDown;

    // 开始录制
    if (hasInput && !this.isRecording) {
      this.startRecording(time);
    }

    // 录制中
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      
      if (elapsed >= this.recordingDuration) {
        this.stopRecording();
      } else {
        this.recordInput(time, delta);
        this.updateRecordingIndicator(elapsed);
      }
    }

    // 更新玩家位置
    this.updatePlayerMovement(delta);
  }

  startRecording(time) {
    this.isRecording = true;
    this.recordStartTime = time;
    this.recordings = [];
    this.playerX = this.player.x;
    this.playerY = this.player.y;
    
    // 记录初始位置
    this.recordings.push({
      time: 0,
      type: 'start',
      x: this.playerX,
      y: this.playerY
    });

    this.updateStatusText();
  }

  stopRecording() {
    this.isRecording = false;
    this.updateStatusText();
    this.recordingIndicator.setText('');
  }

  recordInput(time, delta) {
    const relativeTime = time - this.recordStartTime;
    
    const input = {
      time: relativeTime,
      type: 'move',
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown,
      x: this.player.x,
      y: this.player.y
    };

    this.recordings.push(input);
  }

  updatePlayerMovement(delta) {
    const deltaSeconds = delta / 1000;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = this.playerSpeed;
    }

    this.player.x = Phaser.Math.Clamp(
      this.player.x + velocityX * deltaSeconds,
      16, 784
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y + velocityY * deltaSeconds,
      16, 584
    );
  }

  startReplay() {
    if (this.recordings.length === 0) return;

    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;

    // 重置玩家到初始位置
    const startRecord = this.recordings[0];
    this.player.x = startRecord.x;
    this.player.y = startRecord.y;

    // 改变玩家颜色表示回放中
    this.player.setTint(0xff00ff);

    this.updateStatusText();
  }

  updateReplay(time) {
    const elapsed = (time - this.replayStartTime) * this.replaySpeed;

    // 查找并应用当前时间点的记录
    while (this.replayIndex < this.recordings.length) {
      const record = this.recordings[this.replayIndex];
      
      if (record.time <= elapsed) {
        if (record.type === 'move' || record.type === 'start') {
          this.player.x = record.x;
          this.player.y = record.y;
        }
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.replayIndex >= this.recordings.length) {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayIndex = 0;
    this.player.clearTint();
    this.updateStatusText();
  }

  updateRecordingIndicator(elapsed) {
    const remaining = (this.recordingDuration - elapsed) / 1000;
    this.recordingIndicator.setText(`🔴 录制中... ${remaining.toFixed(1)}秒`);
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      status = '状态: 录制中 (2.5秒)';
    } else if (this.isReplaying) {
      status = `状态: 回放中 (速度: ${this.replaySpeed}x)`;
    } else if (this.recordings.length > 0) {
      status = `状态: 就绪 (已录制 ${this.recordings.length} 帧)`;
    } else {
      status = '状态: 空闲 (等待输入)';
    }

    status += `\n回放速度: ${this.replaySpeed}x`;
    status += `\n玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`;

    this.statusText.setText(status);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: RecordReplayScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);