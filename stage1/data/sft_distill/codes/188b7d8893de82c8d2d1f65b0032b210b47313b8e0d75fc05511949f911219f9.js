class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.recordDuration = 500; // 录制时长（毫秒）
    this.isRecording = false;
    this.isReplaying = false;
    this.recordedInputs = []; // 记录的输入序列
    this.replaySpeed = 1; // 回放速度倍率
    this.replayIndex = 0;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家（使用Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放玩家（半透明）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.6);
    this.replayPlayer.fillCircle(0, 0, 20);
    this.replayPlayer.visible = false;

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 60, 
      'WASD: 移动并录制\n方向键←→: 开始回放\n方向键↑↓: 调整回放速度', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      LEFT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      RIGHT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    };

    // 监听方向键调整回放速度
    this.keys.UP.on('down', () => {
      if (!this.isReplaying) {
        this.replaySpeed = Math.min(this.replaySpeed * 2, 4);
        this.updateStatus();
      }
    });

    this.keys.DOWN.on('down', () => {
      if (!this.isReplaying) {
        this.replaySpeed = Math.max(this.replaySpeed / 2, 0.5);
        this.updateStatus();
      }
    });

    // 监听左右方向键开始回放
    this.keys.LEFT.on('down', () => this.startReplay());
    this.keys.RIGHT.on('down', () => this.startReplay());

    // 初始化状态显示
    this.updateStatus();
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // 录制模式
    if (!this.isReplaying) {
      let moved = false;
      let dx = 0;
      let dy = 0;

      // 检测WASD输入
      if (this.keys.W.isDown) {
        dy = -this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (this.keys.S.isDown) {
        dy = this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (this.keys.A.isDown) {
        dx = -this.playerSpeed * deltaSeconds;
        moved = true;
      }
      if (this.keys.D.isDown) {
        dx = this.playerSpeed * deltaSeconds;
        moved = true;
      }

      // 如果有移动，开始或继续录制
      if (moved) {
        if (!this.isRecording) {
          this.startRecording(time);
        }

        // 更新玩家位置
        this.playerX += dx;
        this.playerY += dy;

        // 边界限制
        this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
        this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

        this.player.x = this.playerX;
        this.player.y = this.playerY;

        // 记录输入
        const elapsedTime = time - this.recordStartTime;
        if (elapsedTime <= this.recordDuration) {
          this.recordedInputs.push({
            time: elapsedTime,
            dx: dx,
            dy: dy
          });
        }
      }

      // 检查录制是否超时
      if (this.isRecording && (time - this.recordStartTime) > this.recordDuration) {
        this.stopRecording();
      }
    }
    // 回放模式
    else {
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

      // 回放所有应该执行的输入
      while (this.replayIndex < this.recordedInputs.length) {
        const input = this.recordedInputs[this.replayIndex];
        
        if (input.time <= elapsedTime) {
          this.replayPlayer.x += input.dx;
          this.replayPlayer.y += input.dy;
          this.replayIndex++;
        } else {
          break;
        }
      }

      // 回放结束
      if (this.replayIndex >= this.recordedInputs.length) {
        this.stopReplay();
      }
    }

    this.updateStatus();
  }

  startRecording(time) {
    this.isRecording = true;
    this.recordStartTime = time;
    this.recordedInputs = [];
    console.log('开始录制...');
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`录制完成，共记录 ${this.recordedInputs.length} 个输入`);
  }

  startReplay() {
    if (this.recordedInputs.length === 0) {
      console.log('没有可回放的录制');
      return;
    }

    if (this.isReplaying) {
      console.log('正在回放中');
      return;
    }

    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;

    // 重置回放玩家位置到录制起点
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.visible = true;

    console.log(`开始回放，速度: ${this.replaySpeed}x`);
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.visible = false;
    console.log('回放结束');
  }

  updateStatus() {
    let status = '';
    
    if (this.isRecording) {
      const remaining = Math.max(0, this.recordDuration - (this.time.now - this.recordStartTime));
      status = `状态: 录制中 (${(remaining / 1000).toFixed(2)}s 剩余)`;
    } else if (this.isReplaying) {
      status = `状态: 回放中 (速度: ${this.replaySpeed}x)`;
    } else {
      status = `状态: 待机 (录制: ${this.recordedInputs.length} 个输入)`;
    }

    status += `\n回放速度: ${this.replaySpeed}x`;
    
    this.statusText.setText(status);
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