class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 500; // 0.5秒 = 500毫秒
    this.recordedActions = []; // 记录操作序列 [{time, key, action}]
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.moveSpeed = 200;
    
    // 可验证状态
    this.totalMoves = 0;
    this.replayCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-15, -15, 30, 30);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建录制指示器（红色圆点）
    this.recordIndicator = this.add.graphics();
    this.recordIndicator.fillStyle(0xff0000, 1);
    this.recordIndicator.fillCircle(0, 0, 8);
    this.recordIndicator.x = 50;
    this.recordIndicator.y = 50;
    this.recordIndicator.setVisible(false);

    // 创建回放指示器（蓝色方块）
    this.replayIndicator = this.add.graphics();
    this.replayIndicator.fillStyle(0x0000ff, 1);
    this.replayIndicator.fillRect(-10, -10, 20, 20);
    this.replayIndicator.x = 50;
    this.replayIndicator.y = 50;
    this.replayIndicator.setVisible(false);

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(10, 100, 
      'Controls:\n' +
      'WASD - Move & Record (0.5s)\n' +
      'UP Arrow - Start Replay (faster)\n' +
      'DOWN Arrow - Start Replay (slower)\n' +
      'LEFT/RIGHT - Adjust replay speed', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 统计文本
    this.statsText = this.add.text(10, 550, '', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
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

    // 监听按键按下事件
    this.input.keyboard.on('keydown', (event) => {
      this.handleKeyDown(event.keyCode);
    });

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
    } else if (!this.isRecording) {
      // 空闲状态，可以开始录制
      if (this.keys.W.isDown || this.keys.A.isDown || 
          this.keys.S.isDown || this.keys.D.isDown) {
        this.startRecording(time);
      }
    } else {
      // 正在录制
      const elapsed = time - this.recordStartTime;
      if (elapsed >= this.recordDuration) {
        this.stopRecording();
      }
    }

    // 录制期间移动玩家
    if (this.isRecording && !this.isReplaying) {
      this.movePlayer(delta);
    }

    this.updateStatusText();
  }

  handleKeyDown(keyCode) {
    const time = this.time.now;

    // 录制期间记录按键
    if (this.isRecording && !this.isReplaying) {
      const relativeTime = time - this.recordStartTime;
      let key = null;

      if (keyCode === Phaser.Input.Keyboard.KeyCodes.W) key = 'W';
      else if (keyCode === Phaser.Input.Keyboard.KeyCodes.A) key = 'A';
      else if (keyCode === Phaser.Input.Keyboard.KeyCodes.S) key = 'S';
      else if (keyCode === Phaser.Input.Keyboard.KeyCodes.D) key = 'D';

      if (key) {
        this.recordedActions.push({
          time: relativeTime,
          key: key,
          action: 'down'
        });
      }
    }

    // 方向键控制回放
    if (!this.isRecording && !this.isReplaying) {
      if (keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
        this.replaySpeed = 1.5;
        this.startReplay(time);
      } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
        this.replaySpeed = 0.5;
        this.startReplay(time);
      }
    }

    // 调整回放速度
    if (this.isReplaying) {
      if (keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
        this.replaySpeed = Math.max(0.25, this.replaySpeed - 0.25);
      } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
        this.replaySpeed = Math.min(3.0, this.replaySpeed + 0.25);
      }
    }
  }

  startRecording(time) {
    this.isRecording = true;
    this.recordStartTime = time;
    this.recordedActions = [];
    this.recordIndicator.setVisible(true);
    
    // 记录初始位置
    this.recordStartX = this.player.x;
    this.recordStartY = this.player.y;
  }

  stopRecording() {
    this.isRecording = false;
    this.recordIndicator.setVisible(false);
  }

  startReplay(time) {
    if (this.recordedActions.length === 0) {
      return; // 没有录制内容
    }

    this.isReplaying = true;
    this.replayStartTime = time;
    this.replayIndex = 0;
    this.replayCount++;
    
    // 重置玩家到录制起始位置
    this.player.x = this.recordStartX;
    this.player.y = this.recordStartY;
    
    this.replayIndicator.setVisible(true);

    // 模拟按键状态
    this.simulatedKeys = {
      W: false,
      A: false,
      S: false,
      D: false
    };
  }

  updateReplay(time) {
    const elapsed = (time - this.replayStartTime) * this.replaySpeed;

    // 处理所有应该触发的动作
    while (this.replayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.replayIndex];
      if (action.time <= elapsed) {
        // 触发动作
        if (action.action === 'down') {
          this.simulatedKeys[action.key] = true;
        }
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 移动玩家（基于模拟按键）
    this.movePlayerSimulated(this.time.now - this.lastTime || 16);
    this.lastTime = this.time.now;

    // 检查回放是否结束
    if (elapsed >= this.recordDuration) {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayIndicator.setVisible(false);
    this.simulatedKeys = null;
  }

  movePlayer(delta) {
    const distance = (this.moveSpeed * delta) / 1000;

    if (this.keys.W.isDown) {
      this.player.y -= distance;
      this.totalMoves++;
    }
    if (this.keys.S.isDown) {
      this.player.y += distance;
      this.totalMoves++;
    }
    if (this.keys.A.isDown) {
      this.player.x -= distance;
      this.totalMoves++;
    }
    if (this.keys.D.isDown) {
      this.player.x += distance;
      this.totalMoves++;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, 785);
    this.player.y = Phaser.Math.Clamp(this.player.y, 15, 585);
  }

  movePlayerSimulated(delta) {
    if (!this.simulatedKeys) return;

    const distance = (this.moveSpeed * delta) / 1000;

    if (this.simulatedKeys.W) {
      this.player.y -= distance;
    }
    if (this.simulatedKeys.S) {
      this.player.y += distance;
    }
    if (this.simulatedKeys.A) {
      this.player.x -= distance;
    }
    if (this.simulatedKeys.D) {
      this.player.x += distance;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, 785);
    this.player.y = Phaser.Math.Clamp(this.player.y, 15, 585);
  }

  updateStatusText() {
    let status = '';
    
    if (this.isReplaying) {
      const elapsed = (this.time.now - this.replayStartTime) * this.replaySpeed;
      const progress = Math.min(100, (elapsed / this.recordDuration) * 100);
      status = `REPLAYING (${this.replaySpeed.toFixed(2)}x speed) - ${progress.toFixed(0)}%`;
    } else if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, this.recordDuration - elapsed);
      status = `RECORDING - ${(remaining / 1000).toFixed(2)}s remaining`;
    } else {
      status = `IDLE - Press WASD to record | Actions: ${this.recordedActions.length}`;
    }

    this.statusText.setText(status);

    this.statsText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Total Moves: ${this.totalMoves}\n` +
      `Replay Count: ${this.replayCount}\n` +
      `Recorded Actions: ${this.recordedActions.length}`
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