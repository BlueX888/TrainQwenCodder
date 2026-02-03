class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordedActions = [];
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0;
    this.replayIndex = 0;
    this.player = null;
    this.ghost = null;
    this.statusText = null;
    this.speedText = null;
    this.recordDuration = 3000; // 3秒
  }

  preload() {
    // 创建玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建幽灵纹理
    const ghostGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ghostGraphics.fillStyle(0x0088ff, 0.5);
    ghostGraphics.fillCircle(16, 16, 16);
    ghostGraphics.generateTexture('ghost', 32, 32);
    ghostGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(1);

    // 创建UI文本
    this.statusText = this.add.text(10, 10, 'Status: Ready', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(10, 45, 'Speed: 1.0x', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    const instructions = this.add.text(10, 80, 
      'Arrow Keys: Move\n' +
      'Auto-record for 3s\n' +
      'WASD: Start Replay\n' +
      '1/2/3: Speed 0.5x/1x/2x', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD键用于开始回放
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 速度控制键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.recordedActions = [];
    this.isRecording = true;
    this.isReplaying = false;
    this.recordStartTime = this.time.now;
    this.player.x = 400;
    this.player.y = 300;
    
    if (this.ghost) {
      this.ghost.destroy();
      this.ghost = null;
    }

    this.statusText.setText('Status: Recording...');
    
    // 3秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.statusText.setText('Status: Ready to Replay (Press WASD)');
    console.log(`Recorded ${this.recordedActions.length} actions`);
  }

  startReplay() {
    if (this.recordedActions.length === 0) {
      return;
    }

    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;

    // 重置玩家位置
    this.player.x = 400;
    this.player.y = 300;

    // 创建幽灵
    if (this.ghost) {
      this.ghost.destroy();
    }
    this.ghost = this.add.sprite(400, 300, 'ghost');
    this.ghost.setAlpha(0.7);

    this.statusText.setText('Status: Replaying...');
  }

  update(time, delta) {
    // 速度调整
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.replaySpeed = 0.5;
      this.speedText.setText('Speed: 0.5x');
    } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.replaySpeed = 1.0;
      this.speedText.setText('Speed: 1.0x');
    } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.replaySpeed = 2.0;
      this.speedText.setText('Speed: 2.0x');
    }

    // 开始回放检测
    if (!this.isRecording && !this.isReplaying) {
      if (Phaser.Input.Keyboard.JustDown(this.wKey) ||
          Phaser.Input.Keyboard.JustDown(this.aKey) ||
          Phaser.Input.Keyboard.JustDown(this.sKey) ||
          Phaser.Input.Keyboard.JustDown(this.dKey)) {
        this.startReplay();
      }
    }

    // 录制模式
    if (this.isRecording) {
      const speed = 200 * (delta / 1000);
      let moved = false;
      let direction = null;

      if (this.cursors.left.isDown) {
        this.player.x -= speed;
        direction = 'left';
        moved = true;
      } else if (this.cursors.right.isDown) {
        this.player.x += speed;
        direction = 'right';
        moved = true;
      }

      if (this.cursors.up.isDown) {
        this.player.y -= speed;
        direction = direction ? direction + '+up' : 'up';
        moved = true;
      } else if (this.cursors.down.isDown) {
        this.player.y += speed;
        direction = direction ? direction + '+down' : 'down';
        moved = true;
      }

      // 记录操作
      if (moved) {
        const timestamp = time - this.recordStartTime;
        this.recordedActions.push({
          timestamp: timestamp,
          x: this.player.x,
          y: this.player.y,
          direction: direction
        });
      }

      // 边界限制
      this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
      this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
    }

    // 回放模式
    if (this.isReplaying && this.ghost) {
      const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

      // 查找当前应该执行的动作
      while (this.replayIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.replayIndex];
        
        if (action.timestamp <= elapsedTime) {
          this.ghost.x = action.x;
          this.ghost.y = action.y;
          this.replayIndex++;
        } else {
          break;
        }
      }

      // 回放结束
      if (this.replayIndex >= this.recordedActions.length) {
        this.isReplaying = false;
        this.statusText.setText('Status: Replay Complete (Press WASD to replay again)');
      }

      // 玩家仍可移动
      const speed = 200 * (delta / 1000);
      if (this.cursors.left.isDown) {
        this.player.x -= speed;
      } else if (this.cursors.right.isDown) {
        this.player.x += speed;
      }
      if (this.cursors.up.isDown) {
        this.player.y -= speed;
      } else if (this.cursors.down.isDown) {
        this.player.y += speed;
      }

      this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
      this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
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