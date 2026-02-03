class RecordingScene extends Phaser.Scene {
  constructor() {
    super('RecordingScene');
    
    // 状态变量
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.recordDuration = 4000; // 4秒
    this.recordedActions = [];
    this.replaySpeed = 1; // 回放速度倍率
    this.replayStartTime = 0;
    this.currentReplayIndex = 0;
    
    // 玩家状态
    this.playerSpeed = 200;
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.playerStartX = 400;
    this.playerStartY = 300;

    // 创建录制指示器
    this.recordIndicator = this.add.graphics();
    this.updateRecordIndicator();

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      '方向键移动玩家\nR键开始/停止录制(4秒)\n空格键回放\n1/2/3键调速度(0.5x/1x/2x)', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(10, 550, `Score: ${this.score}`, {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 按键事件监听
    this.rKey.on('down', () => this.toggleRecording());
    this.spaceKey.on('down', () => this.startReplay());
    this.key1.on('down', () => this.setReplaySpeed(0.5));
    this.key2.on('down', () => this.setReplaySpeed(1));
    this.key3.on('down', () => this.setReplaySpeed(2));

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
    } else if (this.isRecording) {
      this.updateRecording(time, delta);
    } else {
      this.updatePlayerControl(delta);
    }

    this.updateRecordIndicator();
  }

  updatePlayerControl(delta) {
    const speed = this.playerSpeed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
      this.score++; // 移动增加分数
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
      this.score++;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
      this.score++;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
      this.score++;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    this.scoreText.setText(`Score: ${this.score}`);
  }

  toggleRecording() {
    if (this.isReplaying) return;

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.recordedActions = [];
    this.playerStartX = this.player.x;
    this.playerStartY = this.player.y;
    this.score = 0; // 重置分数
    
    console.log('Recording started...');
    this.updateStatusText();

    // 4秒后自动停止录制
    this.time.delayedCall(this.recordDuration, () => {
      if (this.isRecording) {
        this.stopRecording();
      }
    });
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`Recording stopped. Recorded ${this.recordedActions.length} actions.`);
    this.updateStatusText();
  }

  updateRecording(time, delta) {
    const elapsed = time - this.recordStartTime;
    
    // 记录当前按键状态
    const action = {
      time: elapsed,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    };

    // 只记录有按键的帧
    if (action.left || action.right || action.up || action.down) {
      this.recordedActions.push(action);
    }

    // 正常更新玩家控制
    this.updatePlayerControl(delta);

    // 检查是否超过4秒
    if (elapsed >= this.recordDuration) {
      this.stopRecording();
    }
  }

  startReplay() {
    if (this.isRecording || this.recordedActions.length === 0) return;

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentReplayIndex = 0;

    // 重置玩家位置
    this.player.x = this.playerStartX;
    this.player.y = this.playerStartY;
    this.score = 0; // 重置分数用于验证

    console.log(`Replay started at ${this.replaySpeed}x speed...`);
    this.updateStatusText();
  }

  updateReplay(time) {
    const elapsed = (time - this.replayStartTime) * this.replaySpeed;

    // 处理所有应该执行的动作
    while (this.currentReplayIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.currentReplayIndex];
      
      if (action.time <= elapsed) {
        // 执行动作
        const frameSpeed = this.playerSpeed * (16.67 / 1000) * this.replaySpeed;
        
        if (action.left) {
          this.player.x -= frameSpeed;
          this.score++;
        }
        if (action.right) {
          this.player.x += frameSpeed;
          this.score++;
        }
        if (action.up) {
          this.player.y -= frameSpeed;
          this.score++;
        }
        if (action.down) {
          this.player.y += frameSpeed;
          this.score++;
        }

        // 边界限制
        this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
        this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

        this.currentReplayIndex++;
      } else {
        break;
      }
    }

    this.scoreText.setText(`Score: ${this.score}`);

    // 检查回放是否结束
    if (this.currentReplayIndex >= this.recordedActions.length) {
      this.isReplaying = false;
      console.log('Replay finished.');
      this.updateStatusText();
    }
  }

  setReplaySpeed(speed) {
    this.replaySpeed = speed;
    console.log(`Replay speed set to ${speed}x`);
    this.updateStatusText();
  }

  updateRecordIndicator() {
    this.recordIndicator.clear();
    
    if (this.isRecording) {
      // 录制中 - 红色闪烁圆点
      const alpha = Math.sin(this.time.now / 200) * 0.5 + 0.5;
      this.recordIndicator.fillStyle(0xff0000, alpha);
      this.recordIndicator.fillCircle(750, 30, 15);
    } else if (this.isReplaying) {
      // 回放中 - 蓝色三角形
      this.recordIndicator.fillStyle(0x0000ff, 1);
      this.recordIndicator.fillTriangle(740, 20, 740, 40, 760, 30);
    }
  }

  updateStatusText() {
    let status = 'Status: ';
    if (this.isRecording) {
      const elapsed = Math.min(this.time.now - this.recordStartTime, this.recordDuration);
      status += `RECORDING (${(elapsed / 1000).toFixed(1)}s / 4.0s)`;
    } else if (this.isReplaying) {
      status += `REPLAYING (${this.replaySpeed}x speed)`;
    } else {
      status += `IDLE (${this.recordedActions.length} actions recorded)`;
    }
    status += ` | Speed: ${this.replaySpeed}x`;
    
    this.statusText.setText(status);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordingScene
};

new Phaser.Game(config);