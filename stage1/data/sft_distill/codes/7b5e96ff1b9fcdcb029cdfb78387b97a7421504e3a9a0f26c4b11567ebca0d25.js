class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 2000; // 2秒录制时长
    this.recordedActions = [];
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.replayStartTime = 0;
    this.currentReplayIndex = 0;
    
    // 可验证状态
    this.actionCount = 0;
    this.replayCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家角色（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.playerSpeed = 200;
    this.playerVelocity = { x: 0, y: 0 };

    // 创建录制指示器
    const recGraphics = this.add.graphics();
    recGraphics.fillStyle(0xff0000, 1);
    recGraphics.fillCircle(0, 0, 10);
    recGraphics.generateTexture('recIndicator', 20, 20);
    recGraphics.destroy();

    this.recIndicator = this.add.sprite(30, 30, 'recIndicator');
    this.recIndicator.setVisible(false);

    // UI文本
    this.statusText = this.add.text(60, 20, 'Press WASD to move, Mouse to look', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.infoText = this.add.text(10, 60, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.statsText = this.add.text(10, 560, '', {
      fontSize: '14px',
      fill: '#00ffff'
    });

    // 速度控制UI
    this.speedText = this.add.text(600, 20, 'Speed: 1x (1/2/3 to change)', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE
    });

    // 监听按键按下事件
    this.input.keyboard.on('keydown', (event) => {
      if (this.isRecording && !this.isReplaying) {
        const elapsed = Date.now() - this.recordStartTime;
        if (elapsed <= this.recordDuration) {
          this.recordAction('keydown', event.key, elapsed);
        }
      }

      // 速度调节
      if (event.key === '1') this.setReplaySpeed(1);
      if (event.key === '2') this.setReplaySpeed(2);
      if (event.key === '3') this.setReplaySpeed(0.5);
    });

    // 监听按键释放事件
    this.input.keyboard.on('keyup', (event) => {
      if (this.isRecording && !this.isReplaying) {
        const elapsed = Date.now() - this.recordStartTime;
        if (elapsed <= this.recordDuration) {
          this.recordAction('keyup', event.key, elapsed);
        }
      }
    });

    // 监听鼠标移动
    this.input.on('pointermove', (pointer) => {
      if (this.isRecording && !this.isReplaying) {
        const elapsed = Date.now() - this.recordStartTime;
        if (elapsed <= this.recordDuration) {
          this.recordAction('mousemove', { x: pointer.x, y: pointer.y }, elapsed);
        }
      }
    });

    // 监听鼠标左键点击（触发回放）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        if (!this.isReplaying && this.recordedActions.length > 0) {
          this.startReplay();
        }
      }
    });

    // 开始录制
    this.startRecording();

    this.updateStats();
  }

  recordAction(type, data, timestamp) {
    this.recordedActions.push({
      type: type,
      data: data,
      timestamp: timestamp
    });
    this.actionCount++;
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = Date.now();
    this.actionCount = 0;
    this.recIndicator.setVisible(true);
    
    this.statusText.setText('RECORDING... (2 seconds)');
    this.infoText.setText('Move with WASD, move mouse');

    // 2秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recIndicator.setVisible(false);
    this.statusText.setText('Recording complete! Click LEFT MOUSE to replay');
    this.infoText.setText(`Recorded ${this.recordedActions.length} actions`);
  }

  startReplay() {
    if (this.recordedActions.length === 0) return;

    this.isReplaying = true;
    this.currentReplayIndex = 0;
    this.replayStartTime = Date.now();
    this.replayCount++;

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.playerVelocity = { x: 0, y: 0 };

    this.statusText.setText(`REPLAYING at ${this.replaySpeed}x speed...`);
    this.infoText.setText(`Replay #${this.replayCount}`);

    // 清除按键状态
    this.activeKeys = new Set();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay();
    } else if (!this.isRecording) {
      // 正常控制
      this.updatePlayerMovement(delta);
    } else {
      // 录制中也允许移动
      this.updatePlayerMovement(delta);
    }

    // 更新玩家位置
    this.player.x += this.playerVelocity.x * delta / 1000;
    this.player.y += this.playerVelocity.y * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    this.updateStats();
  }

  updateReplay() {
    const elapsed = (Date.now() - this.replayStartTime) * this.replaySpeed;

    // 处理所有应该执行的动作
    while (this.currentReplayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.currentReplayIndex];
      
      if (action.timestamp <= elapsed) {
        this.executeAction(action);
        this.currentReplayIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.currentReplayIndex >= this.recordedActions.length) {
      this.stopReplay();
    }
  }

  executeAction(action) {
    if (action.type === 'keydown') {
      if (!this.activeKeys) this.activeKeys = new Set();
      this.activeKeys.add(action.data.toLowerCase());
    } else if (action.type === 'keyup') {
      if (this.activeKeys) {
        this.activeKeys.delete(action.data.toLowerCase());
      }
    } else if (action.type === 'mousemove') {
      // 可视化鼠标位置（可选）
      const angle = Phaser.Math.Angle.Between(
        this.player.x, this.player.y,
        action.data.x, action.data.y
      );
      this.player.setRotation(angle);
    }

    // 更新速度
    this.updateReplayMovement();
  }

  updateReplayMovement() {
    if (!this.activeKeys) return;

    this.playerVelocity.x = 0;
    this.playerVelocity.y = 0;

    if (this.activeKeys.has('w')) this.playerVelocity.y = -this.playerSpeed;
    if (this.activeKeys.has('s')) this.playerVelocity.y = this.playerSpeed;
    if (this.activeKeys.has('a')) this.playerVelocity.x = -this.playerSpeed;
    if (this.activeKeys.has('d')) this.playerVelocity.x = this.playerSpeed;

    // 归一化对角线速度
    if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
      this.playerVelocity.x *= 0.707;
      this.playerVelocity.y *= 0.707;
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.activeKeys = new Set();
    this.playerVelocity = { x: 0, y: 0 };
    this.statusText.setText('Replay complete! Click LEFT MOUSE to replay again');
  }

  updatePlayerMovement(delta) {
    this.playerVelocity.x = 0;
    this.playerVelocity.y = 0;

    if (this.cursors.W.isDown) this.playerVelocity.y = -this.playerSpeed;
    if (this.cursors.S.isDown) this.playerVelocity.y = this.playerSpeed;
    if (this.cursors.A.isDown) this.playerVelocity.x = -this.playerSpeed;
    if (this.cursors.D.isDown) this.playerVelocity.x = this.playerSpeed;

    // 归一化对角线速度
    if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
      this.playerVelocity.x *= 0.707;
      this.playerVelocity.y *= 0.707;
    }

    // 鼠标朝向
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      pointer.x, pointer.y
    );
    this.player.setRotation(angle);
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    this.speedText.setText(`Speed: ${speed}x (1/2/3 to change)`);
  }

  updateStats() {
    this.statsText.setText(
      `Actions Recorded: ${this.actionCount} | ` +
      `Replay Count: ${this.replayCount} | ` +
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene
};

new Phaser.Game(config);