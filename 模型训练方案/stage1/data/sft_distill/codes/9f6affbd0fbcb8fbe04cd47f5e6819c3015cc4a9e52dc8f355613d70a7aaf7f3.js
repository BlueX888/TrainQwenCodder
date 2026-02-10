class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = [];
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    this.playerX = 400;
    this.playerY = 300;
    this.replayPlayerX = 400;
    this.replayPlayerY = 300;
    this.moveSpeed = 200;
    
    // 状态信号
    this.recordedActionsCount = 0;
    this.currentState = 'IDLE'; // IDLE, RECORDING, REPLAYING
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建回放玩家纹理（蓝色半透明方块）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0x0088ff, 0.6);
    replayGraphics.fillRect(0, 0, 32, 32);
    replayGraphics.generateTexture('replayPlayer', 32, 32);
    replayGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    this.replayPlayer = this.add.sprite(this.replayPlayerX, this.replayPlayerY, 'replayPlayer');
    this.replayPlayer.setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 创建UI文本
    this.stateText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(16, 60, 
      'Arrow Keys: Move & Record\nSPACE: Start Recording\nW/A/S/D: Replay\n1/2/3: Speed (0.5x/1x/2x)', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(16, 180, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听WASD开始回放
    this.wKey.on('down', () => this.startReplay());
    this.aKey.on('down', () => this.startReplay());
    this.sKey.on('down', () => this.startReplay());
    this.dKey.on('down', () => this.startReplay());

    // 监听空格开始录制
    this.spaceKey.on('down', () => this.startRecording());

    // 监听速度调整
    this.oneKey.on('down', () => { this.replaySpeed = 0.5; });
    this.twoKey.on('down', () => { this.replaySpeed = 1.0; });
    this.threeKey.on('down', () => { this.replaySpeed = 2.0; });

    this.updateUI();
  }

  startRecording() {
    if (this.isReplaying || this.isRecording) return;

    this.isRecording = true;
    this.currentState = 'RECORDING';
    this.recordedActions = [];
    this.recordedActionsCount = 0;
    this.recordStartTime = this.time.now;
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);

    // 2.5秒后自动停止录制
    this.time.delayedCall(2500, () => {
      if (this.isRecording) {
        this.stopRecording();
      }
    });

    this.updateUI();
  }

  stopRecording() {
    this.isRecording = false;
    this.currentState = 'IDLE';
    this.updateUI();
  }

  startReplay() {
    if (this.isRecording || this.isReplaying || this.recordedActions.length === 0) return;

    this.isReplaying = true;
    this.currentState = 'REPLAYING';
    this.replayIndex = 0;
    this.replayPlayerX = 400;
    this.replayPlayerY = 300;
    this.replayPlayer.setPosition(this.replayPlayerX, this.replayPlayerY);
    this.replayPlayer.setVisible(true);
    this.replayStartTime = this.time.now;

    this.updateUI();
  }

  recordAction(key, deltaX, deltaY) {
    if (!this.isRecording) return;

    const timestamp = this.time.now - this.recordStartTime;
    if (timestamp <= 2500) {
      this.recordedActions.push({
        time: timestamp,
        key: key,
        deltaX: deltaX,
        deltaY: deltaY
      });
      this.recordedActionsCount = this.recordedActions.length;
    }
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // 玩家控制（录制时）
    if (this.isRecording) {
      let moved = false;
      let deltaX = 0;
      let deltaY = 0;
      let key = '';

      if (this.cursors.left.isDown) {
        deltaX = -this.moveSpeed * deltaSeconds;
        key = 'LEFT';
        moved = true;
      } else if (this.cursors.right.isDown) {
        deltaX = this.moveSpeed * deltaSeconds;
        key = 'RIGHT';
        moved = true;
      }

      if (this.cursors.up.isDown) {
        deltaY = -this.moveSpeed * deltaSeconds;
        key = key ? key + '+UP' : 'UP';
        moved = true;
      } else if (this.cursors.down.isDown) {
        deltaY = this.moveSpeed * deltaSeconds;
        key = key ? key + '+DOWN' : 'DOWN';
        moved = true;
      }

      if (moved) {
        this.playerX += deltaX;
        this.playerY += deltaY;
        this.player.setPosition(this.playerX, this.playerY);
        this.recordAction(key, deltaX, deltaY);
      }
    }

    // 回放逻辑
    if (this.isReplaying) {
      const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;

      // 执行所有应该在当前时间之前的动作
      while (this.replayIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.replayIndex];
        
        if (action.time <= elapsedTime) {
          this.replayPlayerX += action.deltaX;
          this.replayPlayerY += action.deltaY;
          this.replayPlayer.setPosition(this.replayPlayerX, this.replayPlayerY);
          this.replayIndex++;
        } else {
          break;
        }
      }

      // 检查回放是否结束
      if (this.replayIndex >= this.recordedActions.length && elapsedTime >= 2500) {
        this.isReplaying = false;
        this.currentState = 'IDLE';
        this.replayPlayer.setVisible(false);
        this.updateUI();
      }
    }

    this.updateUI();
  }

  updateUI() {
    // 状态文本
    let stateStr = `State: ${this.currentState}`;
    if (this.isRecording) {
      const elapsed = Math.min(this.time.now - this.recordStartTime, 2500);
      stateStr += ` (${(elapsed / 1000).toFixed(2)}s / 2.5s)`;
    }
    this.stateText.setText(stateStr);

    // 统计文本
    this.statsText.setText(
      `Recorded Actions: ${this.recordedActionsCount}\n` +
      `Replay Speed: ${this.replaySpeed}x\n` +
      `Player Pos: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`
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