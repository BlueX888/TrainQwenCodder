class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.currentActionIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 回放玩家状态
    this.replayPlayerX = 400;
    this.replayPlayerY = 300;
    
    // 可验证状态
    this.totalDistance = 0;
    this.actionCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 创建玩家（实时控制）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.setPosition(this.playerX, this.playerY);
    
    // 创建回放玩家（半透明）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.6);
    this.replayPlayer.fillCircle(0, 0, 20);
    this.replayPlayer.setPosition(this.replayPlayerX, this.replayPlayerY);
    this.replayPlayer.setVisible(false);
    
    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.infoText = this.add.text(10, 50, 
      '方向键: 移动玩家\nW/A/S/D: 开始回放\n1/2/3: 切换速度(0.5x/1x/2x)', {
      fontSize: '14px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statsText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 速度控制键
    this.speedKeys = this.input.keyboard.addKeys({
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE
    });
    
    // 开始录制
    this.startRecording();
    
    this.updateUI();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.actionCount = 0;
    this.totalDistance = 0;
    
    // 2秒后自动停止录制
    this.time.delayedCall(2000, () => {
      if (this.isRecording) {
        this.stopRecording();
      }
    });
    
    this.updateUI();
  }

  stopRecording() {
    this.isRecording = false;
    this.updateUI();
  }

  startReplay() {
    if (this.recordedActions.length === 0) {
      return;
    }
    
    this.isReplaying = true;
    this.isRecording = false;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    
    // 重置回放玩家位置
    this.replayPlayerX = 400;
    this.replayPlayerY = 300;
    this.replayPlayer.setPosition(this.replayPlayerX, this.replayPlayerY);
    this.replayPlayer.setVisible(true);
    
    this.updateUI();
  }

  recordAction(key, isDown) {
    if (!this.isRecording) return;
    
    const timestamp = this.time.now - this.recordStartTime;
    this.recordedActions.push({
      timestamp: timestamp,
      key: key,
      isDown: isDown
    });
    
    this.actionCount++;
  }

  update(time, delta) {
    // 处理速度切换
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.one)) {
      this.replaySpeed = 0.5;
      this.updateUI();
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.two)) {
      this.replaySpeed = 1.0;
      this.updateUI();
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.three)) {
      this.replaySpeed = 2.0;
      this.updateUI();
    }
    
    // 检测WASD键启动回放
    if (!this.isReplaying && !this.isRecording) {
      if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.w) ||
          Phaser.Input.Keyboard.JustDown(this.wasdKeys.a) ||
          Phaser.Input.Keyboard.JustDown(this.wasdKeys.s) ||
          Phaser.Input.Keyboard.JustDown(this.wasdKeys.d)) {
        this.startReplay();
      }
    }
    
    // 实时玩家控制（仅在录制时）
    if (this.isRecording) {
      const oldX = this.playerX;
      const oldY = this.playerY;
      
      // 记录按键状态变化
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.recordAction('left', true);
      }
      if (Phaser.Input.Keyboard.JustUp(this.cursors.left)) {
        this.recordAction('left', false);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.recordAction('right', true);
      }
      if (Phaser.Input.Keyboard.JustUp(this.cursors.right)) {
        this.recordAction('right', false);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        this.recordAction('up', true);
      }
      if (Phaser.Input.Keyboard.JustUp(this.cursors.up)) {
        this.recordAction('up', false);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.recordAction('down', true);
      }
      if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
        this.recordAction('down', false);
      }
      
      // 移动玩家
      if (this.cursors.left.isDown) {
        this.playerX -= this.playerSpeed * delta / 1000;
      }
      if (this.cursors.right.isDown) {
        this.playerX += this.playerSpeed * delta / 1000;
      }
      if (this.cursors.up.isDown) {
        this.playerY -= this.playerSpeed * delta / 1000;
      }
      if (this.cursors.down.isDown) {
        this.playerY += this.playerSpeed * delta / 1000;
      }
      
      // 边界检测
      this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
      this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
      
      // 更新位置
      this.player.setPosition(this.playerX, this.playerY);
      
      // 计算移动距离
      const distance = Phaser.Math.Distance.Between(oldX, oldY, this.playerX, this.playerY);
      this.totalDistance += distance;
    }
    
    // 回放逻辑
    if (this.isReplaying) {
      const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;
      
      // 处理当前时间点应该执行的所有动作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.timestamp <= elapsedTime) {
          // 执行动作（更新按键状态）
          this.currentActionIndex++;
        } else {
          break;
        }
      }
      
      // 根据当前活跃的按键状态移动回放玩家
      const activeKeys = this.getActiveKeysAtTime(elapsedTime);
      
      if (activeKeys.left) {
        this.replayPlayerX -= this.playerSpeed * delta / 1000 * this.replaySpeed;
      }
      if (activeKeys.right) {
        this.replayPlayerX += this.playerSpeed * delta / 1000 * this.replaySpeed;
      }
      if (activeKeys.up) {
        this.replayPlayerY -= this.playerSpeed * delta / 1000 * this.replaySpeed;
      }
      if (activeKeys.down) {
        this.replayPlayerY += this.playerSpeed * delta / 1000 * this.replaySpeed;
      }
      
      // 边界检测
      this.replayPlayerX = Phaser.Math.Clamp(this.replayPlayerX, 20, 780);
      this.replayPlayerY = Phaser.Math.Clamp(this.replayPlayerY, 20, 580);
      
      // 更新位置
      this.replayPlayer.setPosition(this.replayPlayerX, this.replayPlayerY);
      
      // 检查回放是否结束
      if (this.currentActionIndex >= this.recordedActions.length && elapsedTime >= 2000) {
        this.stopReplay();
      }
      
      this.updateUI();
    }
  }

  getActiveKeysAtTime(timestamp) {
    const activeKeys = {
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    // 遍历所有动作，确定当前时间点哪些按键是按下的
    for (const action of this.recordedActions) {
      if (action.timestamp > timestamp) break;
      
      if (action.key in activeKeys) {
        activeKeys[action.key] = action.isDown;
      }
    }
    
    return activeKeys;
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.setVisible(false);
    
    // 可以选择重新开始录制
    this.time.delayedCall(500, () => {
      this.startRecording();
    });
    
    this.updateUI();
  }

  updateUI() {
    let status = '';
    
    if (this.isRecording) {
      const elapsed = Math.min(2000, this.time.now - this.recordStartTime);
      const remaining = 2000 - elapsed;
      status = `🔴 录制中... 剩余: ${(remaining / 1000).toFixed(1)}s`;
    } else if (this.isReplaying) {
      const elapsed = (this.time.now - this.replayStartTime) * this.replaySpeed;
      const progress = Math.min(100, (elapsed / 2000) * 100);
      status = `▶️ 回放中 (${this.replaySpeed}x) - 进度: ${progress.toFixed(0)}%`;
    } else {
      status = '⏸️ 等待回放 - 按 W/A/S/D 开始';
    }
    
    this.statusText.setText(status);
    
    this.statsText.setText(
      `统计: 动作数=${this.actionCount} | 移动距离=${this.totalDistance.toFixed(0)}px | 速度=${this.replaySpeed}x`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordReplayScene
};

new Phaser.Game(config);