class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.recordDuration = 3000; // 3秒
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayStartTime = 0;
    
    // 操作记录
    this.actionLog = [];
    this.currentReplayIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 记录的初始位置
    this.recordedStartX = 400;
    this.recordedStartY = 300;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家（实时控制的蓝色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建回放玩家（红色方块，回放时显示）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.7);
    this.replayPlayer.fillRect(-16, -16, 32, 32);
    this.replayPlayer.visible = false;
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键开始录制
    this.spaceKey.on('down', () => {
      if (!this.isRecording && !this.isReplaying) {
        this.startRecording();
      }
    });
    
    // 监听鼠标右键开始回放
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.isReplaying && this.actionLog.length > 0) {
        this.startReplay();
      }
    });
    
    // 监听数字键调整回放速度
    this.input.keyboard.on('keydown-ONE', () => { this.replaySpeed = 0.5; });
    this.input.keyboard.on('keydown-TWO', () => { this.replaySpeed = 1.0; });
    this.input.keyboard.on('keydown-THREE', () => { this.replaySpeed = 2.0; });
    
    // UI 文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 50, 
      '按 SPACE 开始录制（3秒）\n' +
      '鼠标右键开始回放\n' +
      '按 1/2/3 调整回放速度（0.5x/1x/2x）\n' +
      'WASD 或方向键移动', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.recordInfoText = this.add.text(10, 550, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 录制模式
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      
      // 检查是否超过 3 秒
      if (elapsed >= this.recordDuration) {
        this.stopRecording();
      } else {
        // 记录玩家操作
        this.recordPlayerInput(time, delta);
        this.updateStatusText();
      }
    }
    
    // 回放模式
    if (this.isReplaying) {
      this.updateReplay(time);
    }
    
    // 正常控制模式（非回放时）
    if (!this.isReplaying) {
      this.handlePlayerMovement(delta);
    }
    
    this.updateStatusText();
  }

  startRecording() {
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.actionLog = [];
    this.recordedStartX = this.player.x;
    this.recordedStartY = this.player.y;
    
    // 记录初始位置
    this.actionLog.push({
      time: 0,
      x: this.player.x,
      y: this.player.y,
      type: 'position'
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recordInfoText.setText(`录制完成！共记录 ${this.actionLog.length} 个动作`);
  }

  recordPlayerInput(time, delta) {
    const relativeTime = time - this.recordStartTime;
    
    // 记录当前位置
    this.actionLog.push({
      time: relativeTime,
      x: this.player.x,
      y: this.player.y,
      type: 'position'
    });
  }

  handlePlayerMovement(delta) {
    const speed = this.playerSpeed * (delta / 1000);
    let moved = false;
    
    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.x -= speed;
      moved = true;
    }
    if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.x += speed;
      moved = true;
    }
    if (this.cursors.up.isDown || this.wKey.isDown) {
      this.player.y -= speed;
      moved = true;
    }
    if (this.cursors.down.isDown || this.sKey.isDown) {
      this.player.y += speed;
      moved = true;
    }
    
    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
  }

  startReplay() {
    if (this.actionLog.length === 0) return;
    
    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentReplayIndex = 0;
    
    // 显示回放玩家
    this.replayPlayer.visible = true;
    this.replayPlayer.x = this.recordedStartX;
    this.replayPlayer.y = this.recordedStartY;
    
    this.recordInfoText.setText('');
  }

  updateReplay(time) {
    const elapsed = (time - this.replayStartTime) * this.replaySpeed;
    
    // 查找当前应该执行的动作
    while (this.currentReplayIndex < this.actionLog.length) {
      const action = this.actionLog[this.currentReplayIndex];
      
      if (action.time <= elapsed) {
        // 执行动作
        if (action.type === 'position') {
          this.replayPlayer.x = action.x;
          this.replayPlayer.y = action.y;
        }
        this.currentReplayIndex++;
      } else {
        break;
      }
    }
    
    // 回放结束
    if (this.currentReplayIndex >= this.actionLog.length) {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.visible = false;
    this.currentReplayIndex = 0;
    this.recordInfoText.setText('回放完成！');
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, (this.recordDuration - elapsed) / 1000).toFixed(1);
      status = `🔴 录制中... 剩余时间: ${remaining}s`;
    } else if (this.isReplaying) {
      status = `▶️ 回放中... 速度: ${this.replaySpeed}x`;
    } else {
      status = `⏸️ 空闲 | 录制数据: ${this.actionLog.length} 个动作`;
    }
    
    this.statusText.setText(status);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);