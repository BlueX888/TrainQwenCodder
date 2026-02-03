class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingDuration = 2500; // 2.5秒
    this.recordedActions = [];
    this.isRecording = true;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    this.replayStartTime = 0;
    
    // 验证信号
    this.totalDistance = 0;
    this.actionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建玩家方块（蓝色）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(-15, -15, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.playerVelocity = { x: 0, y: 0 };
    this.playerSpeed = 200;

    // 创建回放影子（半透明红色）
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0xff0000, 0.5);
    shadowGraphics.fillRect(-15, -15, 30, 30);
    shadowGraphics.generateTexture('shadow', 30, 30);
    shadowGraphics.destroy();

    this.shadow = this.add.sprite(width / 2, height / 2, 'shadow');
    this.shadow.setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 速度调整键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.key5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'Arrow Keys: Move\nSpace: Start Replay\n1-5: Replay Speed (0.5x - 2x)', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(10, height - 60, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始录制
    this.recordStartTime = this.time.now;
    this.recordAction(0, this.player.x, this.player.y, 0, 0);

    // 2.5秒后停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      this.isRecording = false;
      this.updateStatusText();
    });

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isRecording) {
      this.handleRecording(time, delta);
    } else if (this.isReplaying) {
      this.handleReplay(time);
    } else {
      // 录制完成，等待回放
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.startReplay(time);
      }
    }

    // 速度调整
    this.handleSpeedControl();
    this.updateStatusText();
  }

  handleRecording(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;

    // 重置速度
    this.playerVelocity.x = 0;
    this.playerVelocity.y = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      this.playerVelocity.x = -this.playerSpeed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.playerVelocity.x = this.playerSpeed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.playerVelocity.y = -this.playerSpeed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.playerVelocity.y = this.playerSpeed;
      moved = true;
    }

    // 对角线移动归一化
    if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
      const factor = Math.sqrt(2) / 2;
      this.playerVelocity.x *= factor;
      this.playerVelocity.y *= factor;
    }

    // 更新玩家位置
    const oldX = this.player.x;
    const oldY = this.player.y;
    
    this.player.x += this.playerVelocity.x * deltaSeconds;
    this.player.y += this.playerVelocity.y * deltaSeconds;

    // 边界检测
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, width - 15);
    this.player.y = Phaser.Math.Clamp(this.player.y, 15, height - 15);

    // 计算移动距离
    const distance = Phaser.Math.Distance.Between(oldX, oldY, this.player.x, this.player.y);
    this.totalDistance += distance;

    // 记录动作（每帧记录）
    const elapsedTime = time - this.recordStartTime;
    this.recordAction(
      elapsedTime,
      this.player.x,
      this.player.y,
      this.playerVelocity.x,
      this.playerVelocity.y
    );

    if (moved) {
      this.actionCount++;
    }
  }

  recordAction(timestamp, x, y, vx, vy) {
    this.recordedActions.push({
      time: timestamp,
      x: x,
      y: y,
      vx: vx,
      vy: vy
    });
  }

  startReplay(time) {
    if (this.recordedActions.length === 0) return;

    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = time;
    
    // 重置影子到初始位置
    const firstAction = this.recordedActions[0];
    this.shadow.setPosition(firstAction.x, firstAction.y);
    this.shadow.setVisible(true);

    // 隐藏玩家
    this.player.setAlpha(0.3);
  }

  handleReplay(time) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 找到当前时间对应的动作
    while (this.replayIndex < this.recordedActions.length - 1) {
      const nextAction = this.recordedActions[this.replayIndex + 1];
      if (nextAction.time > elapsedTime) {
        break;
      }
      this.replayIndex++;
    }

    // 如果回放结束
    if (this.replayIndex >= this.recordedActions.length - 1) {
      this.stopReplay();
      return;
    }

    // 插值计算当前位置
    const currentAction = this.recordedActions[this.replayIndex];
    const nextAction = this.recordedActions[this.replayIndex + 1];
    
    const t = (elapsedTime - currentAction.time) / (nextAction.time - currentAction.time);
    const clampedT = Phaser.Math.Clamp(t, 0, 1);

    this.shadow.x = Phaser.Math.Linear(currentAction.x, nextAction.x, clampedT);
    this.shadow.y = Phaser.Math.Linear(currentAction.y, nextAction.y, clampedT);

    // 按空格键可以重新开始回放
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startReplay(time);
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.shadow.setVisible(false);
    this.player.setAlpha(1);
  }

  handleSpeedControl() {
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.replaySpeed = 0.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.replaySpeed = 0.75;
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.replaySpeed = 1.0;
    } else if (Phaser.Input.Keyboard.JustDown(this.key4)) {
      this.replaySpeed = 1.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.key5)) {
      this.replaySpeed = 2.0;
    }
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, this.recordingDuration - elapsed);
      status = `RECORDING... ${(remaining / 1000).toFixed(1)}s left`;
    } else if (this.isReplaying) {
      status = `REPLAYING at ${this.replaySpeed}x speed`;
    } else {
      status = `READY - Press SPACE to replay`;
    }

    this.statusText.setText(status);

    // 更新统计信息
    this.statsText.setText(
      `Actions: ${this.recordedActions.length}\n` +
      `Distance: ${this.totalDistance.toFixed(1)}px\n` +
      `Key Presses: ${this.actionCount}`
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