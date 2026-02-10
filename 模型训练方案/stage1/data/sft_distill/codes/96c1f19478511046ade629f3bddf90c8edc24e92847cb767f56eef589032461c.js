class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 3000; // 3秒录制时间
    this.recordedActions = []; // 存储录制的操作
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.currentReplayIndex = 0;
    
    // 状态信号
    this.recordedFrames = 0; // 已录制的帧数
    this.replayedFrames = 0; // 已回放的帧数
    this.totalRecordedTime = 0; // 总录制时间
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

    // 创建录制时的玩家（绿色）
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(1);

    // 创建回放时的玩家纹理（红色）
    const replayGraphics = this.add.graphics();
    replayGraphics.fillStyle(0xff0000, 1);
    replayGraphics.fillCircle(16, 16, 16);
    replayGraphics.generateTexture('replayPlayer', 32, 32);
    replayGraphics.destroy();

    // 创建回放玩家（初始隐藏）
    this.replayPlayer = this.add.sprite(400, 300, 'replayPlayer');
    this.replayPlayer.setVisible(false);

    // 初始玩家位置
    this.playerStartX = 400;
    this.playerStartY = 300;
    this.playerSpeed = 200;

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 速度调节键
    this.speedKeys = {
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    };

    // 鼠标输入（开始回放）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isRecording && !this.isReplaying) {
        this.startReplay();
      }
    });

    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'WASD/方向键: 移动\n鼠标左键: 开始回放\n数字键1-5: 调整回放速度(0.5x-5x)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(10, 550, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.recordedFrames = 0;
    
    // 重置玩家位置
    this.player.setPosition(this.playerStartX, this.playerStartY);
    this.player.setVisible(true);
    this.replayPlayer.setVisible(false);

    // 3秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.totalRecordedTime = this.time.now - this.recordStartTime;
  }

  startReplay() {
    if (this.recordedActions.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentReplayIndex = 0;
    this.replayedFrames = 0;

    // 设置回放玩家初始位置
    this.replayPlayer.setPosition(this.playerStartX, this.playerStartY);
    this.replayPlayer.setVisible(true);
    this.player.setVisible(false);
  }

  update(time, delta) {
    // 处理速度调节
    if (Phaser.Input.Keyboard.JustDown(this.speedKeys.ONE)) {
      this.replaySpeed = 0.5;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.TWO)) {
      this.replaySpeed = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.THREE)) {
      this.replaySpeed = 2;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.FOUR)) {
      this.replaySpeed = 3;
    } else if (Phaser.Input.Keyboard.JustDown(this.speedKeys.FIVE)) {
      this.replaySpeed = 5;
    }

    // 录制模式
    if (this.isRecording) {
      const currentTime = this.time.now - this.recordStartTime;
      
      // 记录当前输入状态
      const inputState = {
        time: currentTime,
        left: this.cursors.left.isDown || this.keys.A.isDown,
        right: this.cursors.right.isDown || this.keys.D.isDown,
        up: this.cursors.up.isDown || this.keys.W.isDown,
        down: this.cursors.down.isDown || this.keys.S.isDown,
        x: this.player.x,
        y: this.player.y
      };

      this.recordedActions.push(inputState);
      this.recordedFrames++;

      // 移动玩家
      let velocityX = 0;
      let velocityY = 0;

      if (inputState.left) velocityX -= this.playerSpeed;
      if (inputState.right) velocityX += this.playerSpeed;
      if (inputState.up) velocityY -= this.playerSpeed;
      if (inputState.down) velocityY += this.playerSpeed;

      // 归一化对角线移动
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      this.player.x += velocityX * (delta / 1000);
      this.player.y += velocityY * (delta / 1000);

      // 边界限制
      this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
      this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

      const remainingTime = Math.max(0, this.recordDuration - currentTime);
      this.statusText.setText(`录制中... 剩余: ${(remainingTime / 1000).toFixed(1)}s`);
    }
    // 回放模式
    else if (this.isReplaying) {
      const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;

      // 查找并应用当前时间点的动作
      while (this.currentReplayIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.currentReplayIndex];
        
        if (action.time <= elapsedTime) {
          // 应用录制的位置
          this.replayPlayer.setPosition(action.x, action.y);
          this.currentReplayIndex++;
          this.replayedFrames++;
        } else {
          break;
        }
      }

      // 回放完成
      if (this.currentReplayIndex >= this.recordedActions.length) {
        this.isReplaying = false;
        this.time.delayedCall(500, () => {
          this.startRecording();
        });
      }

      const progress = (this.currentReplayIndex / this.recordedActions.length * 100).toFixed(1);
      this.statusText.setText(`回放中... 速度: ${this.replaySpeed}x | 进度: ${progress}%`);
    }
    // 待机模式
    else {
      this.statusText.setText(`待机 - 点击鼠标左键开始回放 | 速度: ${this.replaySpeed}x`);
    }

    // 更新统计信息
    this.statsText.setText(
      `状态信号:\n` +
      `录制帧数: ${this.recordedFrames}\n` +
      `回放帧数: ${this.replayedFrames}\n` +
      `总录制时间: ${(this.totalRecordedTime / 1000).toFixed(2)}s\n` +
      `录制动作数: ${this.recordedActions.length}`
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