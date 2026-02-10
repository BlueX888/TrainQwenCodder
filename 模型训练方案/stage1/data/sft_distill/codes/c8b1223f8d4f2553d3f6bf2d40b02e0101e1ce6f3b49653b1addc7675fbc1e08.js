class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量（可验证）
    this.recordedActions = []; // 记录的操作序列
    this.isRecording = true;
    this.isReplaying = false;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.maxRecordDuration = 2000; // 2秒
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
  }

  preload() {
    // 无需预加载资源
  }

  create() {
    // 创建玩家（使用Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建录制轨迹显示
    this.trailGraphics = this.add.graphics();
    this.trailGraphics.lineStyle(2, 0xffff00, 0.5);

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 550, 
      'WASD: 移动 | 右键: 回放 | 1/2/3: 速度 0.5x/1x/2x', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // 鼠标右键输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.startReplay();
      }
    });

    // 速度切换
    this.cursors.ONE.on('down', () => { this.replaySpeed = 0.5; });
    this.cursors.TWO.on('down', () => { this.replaySpeed = 1.0; });
    this.cursors.THREE.on('down', () => { this.replaySpeed = 2.0; });

    // 开始录制
    this.recordStartTime = this.time.now;
    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time, delta);
    } else if (this.isRecording) {
      this.updateRecording(time, delta);
    }

    this.updateStatusText();
  }

  updateRecording(time, delta) {
    const currentTime = time - this.recordStartTime;
    
    // 清理超过2秒的旧记录
    this.recordedActions = this.recordedActions.filter(
      action => currentTime - action.time < this.maxRecordDuration
    );

    // 如果有超过2秒的记录，调整起始时间
    if (this.recordedActions.length > 0 && 
        currentTime - this.recordedActions[0].time >= this.maxRecordDuration) {
      this.recordStartTime = time - this.maxRecordDuration;
    }

    // 记录当前输入状态
    const input = {
      W: this.cursors.W.isDown,
      A: this.cursors.A.isDown,
      S: this.cursors.S.isDown,
      D: this.cursors.D.isDown
    };

    // 只在有输入时记录
    if (input.W || input.A || input.S || input.D) {
      this.recordedActions.push({
        time: currentTime,
        input: { ...input },
        x: this.playerX,
        y: this.playerY
      });
    }

    // 移动玩家
    const velocity = { x: 0, y: 0 };
    if (input.W) velocity.y -= 1;
    if (input.S) velocity.y += 1;
    if (input.A) velocity.x -= 1;
    if (input.D) velocity.x += 1;

    // 归一化对角线移动
    if (velocity.x !== 0 && velocity.y !== 0) {
      const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      velocity.x /= length;
      velocity.y /= length;
    }

    this.playerX += velocity.x * this.playerSpeed * (delta / 1000);
    this.playerY += velocity.y * this.playerSpeed * (delta / 1000);

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 绘制轨迹
    this.drawTrail();
  }

  startReplay() {
    if (this.recordedActions.length === 0) {
      return; // 没有记录可回放
    }

    this.isRecording = false;
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;

    // 重置玩家到起始位置
    if (this.recordedActions.length > 0) {
      this.playerX = this.recordedActions[0].x;
      this.playerY = this.recordedActions[0].y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }

    // 改变玩家颜色表示回放
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillCircle(0, 0, 20);
  }

  updateReplay(time, delta) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 查找当前应该执行的动作
    while (this.replayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.replayIndex];
      
      if (action.time <= elapsedTime) {
        // 执行这个动作
        this.playerX = action.x;
        this.playerY = action.y;
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        this.replayIndex++;
      } else {
        break; // 还没到执行时间
      }
    }

    // 回放结束
    if (this.replayIndex >= this.recordedActions.length) {
      this.endReplay();
    }
  }

  endReplay() {
    this.isReplaying = false;
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.recordedActions = []; // 清空记录，重新开始

    // 恢复玩家颜色
    this.player.clear();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);

    // 清空轨迹
    this.trailGraphics.clear();
  }

  drawTrail() {
    this.trailGraphics.clear();
    this.trailGraphics.lineStyle(2, 0xffff00, 0.5);

    if (this.recordedActions.length > 1) {
      this.trailGraphics.beginPath();
      this.trailGraphics.moveTo(
        this.recordedActions[0].x, 
        this.recordedActions[0].y
      );

      for (let i = 1; i < this.recordedActions.length; i++) {
        this.trailGraphics.lineTo(
          this.recordedActions[i].x, 
          this.recordedActions[i].y
        );
      }

      this.trailGraphics.strokePath();
    }
  }

  updateStatusText() {
    let status = '';
    if (this.isReplaying) {
      const progress = Math.floor((this.replayIndex / this.recordedActions.length) * 100);
      status = `状态: 回放中 (${progress}%) | 速度: ${this.replaySpeed}x`;
    } else if (this.isRecording) {
      const recordTime = Math.min(
        (this.time.now - this.recordStartTime) / 1000, 
        this.maxRecordDuration / 1000
      ).toFixed(1);
      status = `状态: 录制中 | 时长: ${recordTime}s / 2.0s | 操作数: ${this.recordedActions.length}`;
    }

    this.statusText.setText(status);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);