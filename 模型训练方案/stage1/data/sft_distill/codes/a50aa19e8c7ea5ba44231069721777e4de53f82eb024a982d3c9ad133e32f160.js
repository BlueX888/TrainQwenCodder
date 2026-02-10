class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.currentActionIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 记录时长（毫秒）
    this.recordDuration = 1500;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建轨迹记录（用于可视化）
    this.trailGraphics = this.add.graphics();
    this.trailPoints = [];

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'WASD: 移动\n数字键 1/2/3: 切换回放速度 (0.5x/1x/2x)\n空格: 开始回放', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(10, 550, '', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE
    });

    // 速度切换
    this.cursors.one.on('down', () => {
      this.replaySpeed = 0.5;
      this.updateSpeedDisplay();
    });

    this.cursors.two.on('down', () => {
      this.replaySpeed = 1;
      this.updateSpeedDisplay();
    });

    this.cursors.three.on('down', () => {
      this.replaySpeed = 2;
      this.updateSpeedDisplay();
    });

    // 空格键回放
    this.cursors.space.on('down', () => {
      this.startReplay();
    });

    // 开始录制
    this.startRecording();
    this.updateSpeedDisplay();
  }

  startRecording() {
    if (this.isReplaying) return;

    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.trailPoints = [];
    this.trailGraphics.clear();

    // 重置玩家位置
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 改变玩家颜色表示录制中
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(-20, -20, 40, 40);

    // 1.5秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    
    // 改变玩家颜色表示录制完成
    this.player.clear();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillRect(-20, -20, 40, 40);
  }

  startReplay() {
    if (this.isRecording || this.isReplaying || this.recordedActions.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;

    // 重置玩家位置
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 改变玩家颜色表示回放中
    this.player.clear();
    this.player.fillStyle(0xffff00, 1);
    this.player.fillRect(-20, -20, 40, 40);

    // 清除轨迹
    this.trailGraphics.clear();
    this.trailPoints = [];
  }

  update(time, delta) {
    // 录制阶段
    if (this.isRecording) {
      const moveVector = { x: 0, y: 0 };
      let hasMoved = false;

      if (this.cursors.left.isDown) {
        moveVector.x = -1;
        hasMoved = true;
      } else if (this.cursors.right.isDown) {
        moveVector.x = 1;
        hasMoved = true;
      }

      if (this.cursors.up.isDown) {
        moveVector.y = -1;
        hasMoved = true;
      } else if (this.cursors.down.isDown) {
        moveVector.y = 1;
        hasMoved = true;
      }

      if (hasMoved) {
        // 归一化对角线移动
        const length = Math.sqrt(moveVector.x * moveVector.x + moveVector.y * moveVector.y);
        moveVector.x /= length;
        moveVector.y /= length;

        // 移动玩家
        this.playerX += moveVector.x * this.playerSpeed * (delta / 1000);
        this.playerY += moveVector.y * this.playerSpeed * (delta / 1000);

        // 边界限制
        this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
        this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

        this.player.x = this.playerX;
        this.player.y = this.playerY;

        // 记录操作
        const timestamp = this.time.now - this.recordStartTime;
        this.recordedActions.push({
          time: timestamp,
          moveX: moveVector.x,
          moveY: moveVector.y
        });

        // 绘制轨迹
        this.trailPoints.push({ x: this.playerX, y: this.playerY });
        this.drawTrail();
      }

      const remainingTime = Math.max(0, this.recordDuration - (this.time.now - this.recordStartTime));
      this.statusText.setText(
        `状态: 录制中\n` +
        `剩余时间: ${(remainingTime / 1000).toFixed(2)}s\n` +
        `已记录操作: ${this.recordedActions.length}`
      );
    }
    // 回放阶段
    else if (this.isReplaying) {
      const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;

      // 执行所有应该执行的动作
      while (this.currentActionIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentActionIndex];
        
        if (action.time <= elapsedTime) {
          // 执行动作（这里简化为直接应用移动）
          this.playerX += action.moveX * this.playerSpeed * (delta / 1000);
          this.playerY += action.moveY * this.playerSpeed * (delta / 1000);

          this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
          this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

          this.player.x = this.playerX;
          this.player.y = this.playerY;

          // 绘制轨迹
          this.trailPoints.push({ x: this.playerX, y: this.playerY });
          this.drawTrail();

          this.currentActionIndex++;
        } else {
          break;
        }
      }

      // 检查回放是否结束
      if (this.currentActionIndex >= this.recordedActions.length) {
        this.stopReplay();
      }

      this.statusText.setText(
        `状态: 回放中\n` +
        `进度: ${this.currentActionIndex}/${this.recordedActions.length}\n` +
        `回放速度: ${this.replaySpeed}x`
      );
    }
    // 等待回放阶段
    else {
      this.statusText.setText(
        `状态: 等待回放\n` +
        `已记录操作: ${this.recordedActions.length}\n` +
        `按空格键开始回放`
      );
    }
  }

  stopReplay() {
    this.isReplaying = false;

    // 改变玩家颜色表示回放完成
    this.player.clear();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);

    // 延迟后重新开始录制
    this.time.delayedCall(1000, () => {
      this.startRecording();
    });
  }

  drawTrail() {
    if (this.trailPoints.length < 2) return;

    this.trailGraphics.clear();
    this.trailGraphics.lineStyle(2, 0xffffff, 0.5);
    this.trailGraphics.beginPath();
    this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);

    for (let i = 1; i < this.trailPoints.length; i++) {
      this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
    }

    this.trailGraphics.strokePath();
  }

  updateSpeedDisplay() {
    this.speedText.setText(`当前回放速度: ${this.replaySpeed}x`);
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