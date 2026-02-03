class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingTime = 4000; // 4秒录制时间
    this.isRecording = false;
    this.isReplaying = false;
    this.recordedActions = []; // 存储 {time, keys} 格式的操作
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.currentActionIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200; // 像素/秒
    
    // 可验证状态
    this.totalDistance = 0; // 总移动距离
    this.actionCount = 0; // 记录的操作帧数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    
    // 创建录制指示器（红点）
    const recGraphics = this.add.graphics();
    recGraphics.fillStyle(0xff0000, 1);
    recGraphics.fillCircle(0, 0, 8);
    recGraphics.generateTexture('recIndicator', 16, 16);
    recGraphics.destroy();
    
    this.recIndicator = this.add.sprite(50, 50, 'recIndicator');
    this.recIndicator.setVisible(false);

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // 创建UI文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 550, 
      'WASD: Move | Auto-record for 4s | SPACE: Replay | 1/2/3: Speed x1/x2/x4', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.statsText = this.add.text(20, 80, '', {
      fontSize: '14px',
      fill: '#00ffff'
    });

    // 自动开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.currentActionIndex = 0;
    this.actionCount = 0;
    this.totalDistance = 0;
    
    this.recIndicator.setVisible(true);
    
    // 4秒后停止录制
    this.time.delayedCall(this.recordingTime, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.recIndicator.setVisible(false);
    this.actionCount = this.recordedActions.length;
  }

  startReplay() {
    if (this.recordedActions.length === 0 || this.isRecording) {
      return;
    }

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    
    // 重置玩家位置到录制开始位置
    this.playerX = 400;
    this.playerY = 300;
    this.player.setPosition(this.playerX, this.playerY);
    this.totalDistance = 0;
  }

  stopReplay() {
    this.isReplaying = false;
    this.currentActionIndex = 0;
  }

  recordAction(delta) {
    const keyStates = {
      w: this.keys.W.isDown,
      a: this.keys.A.isDown,
      s: this.keys.S.isDown,
      d: this.keys.D.isDown
    };

    // 只在有按键时记录（优化存储）
    if (keyStates.w || keyStates.a || keyStates.s || keyStates.d) {
      const elapsedTime = this.time.now - this.recordStartTime;
      this.recordedActions.push({
        time: elapsedTime,
        keys: keyStates,
        delta: delta
      });
    }
  }

  replayAction() {
    const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;
    
    // 查找当前时间应该执行的操作
    while (this.currentActionIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.currentActionIndex];
      
      if (action.time <= elapsedTime) {
        // 执行该操作
        this.applyMovement(action.keys, action.delta);
        this.currentActionIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.currentActionIndex >= this.recordedActions.length) {
      this.stopReplay();
    }
  }

  applyMovement(keyStates, delta) {
    let dx = 0;
    let dy = 0;

    if (keyStates.w) dy -= 1;
    if (keyStates.s) dy += 1;
    if (keyStates.a) dx -= 1;
    if (keyStates.d) dx += 1;

    // 归一化对角线移动
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    const moveDistance = this.playerSpeed * (delta / 1000);
    const actualDx = dx * moveDistance;
    const actualDy = dy * moveDistance;

    this.playerX += actualDx;
    this.playerY += actualDy;

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

    this.player.setPosition(this.playerX, this.playerY);

    // 计算移动距离
    const distance = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
    this.totalDistance += distance;
  }

  update(time, delta) {
    // 处理速度切换
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) {
      this.replaySpeed = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) {
      this.replaySpeed = 2;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) {
      this.replaySpeed = 4;
    }

    // 处理空格键开始回放
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      if (!this.isRecording && !this.isReplaying) {
        this.startReplay();
      }
    }

    // 录制模式
    if (this.isRecording) {
      this.recordAction(delta);
      
      // 实时移动
      const keyStates = {
        w: this.keys.W.isDown,
        a: this.keys.A.isDown,
        s: this.keys.S.isDown,
        d: this.keys.D.isDown
      };
      this.applyMovement(keyStates, delta);

      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, (this.recordingTime - elapsed) / 1000);
      this.statusText.setText(`🔴 RECORDING... ${remaining.toFixed(1)}s left`);
    }
    // 回放模式
    else if (this.isReplaying) {
      this.replayAction();
      
      const progress = (this.currentActionIndex / this.recordedActions.length * 100).toFixed(0);
      this.statusText.setText(`▶️ REPLAYING (${this.replaySpeed}x speed) - ${progress}%`);
    }
    // 待机模式
    else {
      this.statusText.setText('⏸️ READY - Press SPACE to replay');
    }

    // 更新统计信息
    this.statsText.setText(
      `Actions Recorded: ${this.actionCount}\n` +
      `Distance Traveled: ${this.totalDistance.toFixed(1)}px\n` +
      `Replay Speed: ${this.replaySpeed}x`
    );

    // 录制指示器闪烁
    if (this.isRecording) {
      this.recIndicator.setAlpha(0.5 + Math.sin(time / 200) * 0.5);
    }
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