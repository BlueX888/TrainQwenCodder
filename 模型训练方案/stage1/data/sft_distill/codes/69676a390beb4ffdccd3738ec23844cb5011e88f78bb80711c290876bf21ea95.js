class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingDuration = 2500; // 2.5秒
    this.actions = []; // 记录操作序列
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.playerX = 400;
    this.playerY = 300;
    this.playerVelocity = { x: 0, y: 0 };
    this.moveSpeed = 200;
    this.recordingTimeLeft = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-16, -16, 32, 32);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放预览方块（半透明）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.5);
    this.replayPlayer.fillRect(-16, -16, 32, 32);
    this.replayPlayer.setVisible(false);

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(10, 50, 
      'WASD: 移动\n空格: 开始回放\n1/2/3: 回放速度 0.5x/1x/2x\nR: 重新录制', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 回放速度文本
    this.speedText = this.add.text(10, 150, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      R: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };

    // 监听按键事件用于录制
    this.input.keyboard.on('keydown', (event) => {
      if (this.isRecording) {
        this.recordAction(event.keyCode, 'down', this.time.now - this.recordStartTime);
      }
    });

    this.input.keyboard.on('keyup', (event) => {
      if (this.isRecording) {
        this.recordAction(event.keyCode, 'up', this.time.now - this.recordStartTime);
      }
    });

    // 回放速度切换
    this.keys.ONE.on('down', () => {
      this.replaySpeed = 0.5;
      this.updateSpeedText();
    });

    this.keys.TWO.on('down', () => {
      this.replaySpeed = 1;
      this.updateSpeedText();
    });

    this.keys.THREE.on('down', () => {
      this.replaySpeed = 2;
      this.updateSpeedText();
    });

    // 重新录制
    this.keys.R.on('down', () => {
      if (!this.isRecording && !this.isReplaying) {
        this.startRecording();
      }
    });

    // 空格键开始回放
    this.keys.SPACE.on('down', () => {
      if (!this.isRecording && !this.isReplaying && this.actions.length > 0) {
        this.startReplay();
      }
    });

    // 开始录制
    this.startRecording();
    this.updateSpeedText();
  }

  startRecording() {
    this.actions = [];
    this.isRecording = true;
    this.isReplaying = false;
    this.recordStartTime = this.time.now;
    this.recordingTimeLeft = this.recordingDuration;
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    this.playerVelocity = { x: 0, y: 0 };
    this.replayPlayer.setVisible(false);
    
    // 录制期间的按键状态
    this.keyStates = {
      W: false,
      A: false,
      S: false,
      D: false
    };
  }

  recordAction(keyCode, type, timestamp) {
    this.actions.push({
      keyCode: keyCode,
      type: type,
      timestamp: timestamp
    });
  }

  startReplay() {
    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.replayActionIndex = 0;
    
    // 重置回放玩家位置
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.setVisible(true);
    
    // 回放期间的按键状态
    this.replayKeyStates = {
      W: false,
      A: false,
      S: false,
      D: false
    };
    this.replayVelocity = { x: 0, y: 0 };
  }

  update(time, delta) {
    // 录制模式
    if (this.isRecording) {
      this.recordingTimeLeft = this.recordingDuration - (time - this.recordStartTime);
      
      if (this.recordingTimeLeft <= 0) {
        this.isRecording = false;
        this.statusText.setText('录制完成！按空格键回放');
      } else {
        this.statusText.setText(`录制中... 剩余: ${(this.recordingTimeLeft / 1000).toFixed(2)}秒`);
        
        // 更新按键状态
        this.keyStates.W = this.keys.W.isDown;
        this.keyStates.A = this.keys.A.isDown;
        this.keyStates.S = this.keys.S.isDown;
        this.keyStates.D = this.keys.D.isDown;
        
        // 根据按键更新速度
        this.playerVelocity.x = 0;
        this.playerVelocity.y = 0;
        
        if (this.keyStates.W) this.playerVelocity.y = -this.moveSpeed;
        if (this.keyStates.S) this.playerVelocity.y = this.moveSpeed;
        if (this.keyStates.A) this.playerVelocity.x = -this.moveSpeed;
        if (this.keyStates.D) this.playerVelocity.x = this.moveSpeed;
        
        // 更新玩家位置
        this.playerX += this.playerVelocity.x * (delta / 1000);
        this.playerY += this.playerVelocity.y * (delta / 1000);
        
        // 边界限制
        this.playerX = Phaser.Math.Clamp(this.playerX, 16, 784);
        this.playerY = Phaser.Math.Clamp(this.playerY, 16, 584);
        
        this.player.x = this.playerX;
        this.player.y = this.playerY;
      }
    }
    
    // 回放模式
    if (this.isReplaying) {
      const replayElapsed = (time - this.replayStartTime) * this.replaySpeed;
      
      // 处理所有应该执行的动作
      while (this.replayActionIndex < this.actions.length) {
        const action = this.actions[this.replayActionIndex];
        
        if (action.timestamp <= replayElapsed) {
          // 执行动作
          const keyName = this.getKeyName(action.keyCode);
          if (keyName && this.replayKeyStates.hasOwnProperty(keyName)) {
            this.replayKeyStates[keyName] = (action.type === 'down');
          }
          this.replayActionIndex++;
        } else {
          break;
        }
      }
      
      // 更新回放速度
      this.replayVelocity.x = 0;
      this.replayVelocity.y = 0;
      
      if (this.replayKeyStates.W) this.replayVelocity.y = -this.moveSpeed;
      if (this.replayKeyStates.S) this.replayVelocity.y = this.moveSpeed;
      if (this.replayKeyStates.A) this.replayVelocity.x = -this.moveSpeed;
      if (this.replayKeyStates.D) this.replayVelocity.x = this.moveSpeed;
      
      // 更新回放玩家位置（考虑回放速度）
      this.replayPlayer.x += this.replayVelocity.x * (delta / 1000) * this.replaySpeed;
      this.replayPlayer.y += this.replayVelocity.y * (delta / 1000) * this.replaySpeed;
      
      // 边界限制
      this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 16, 784);
      this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 16, 584);
      
      // 检查回放是否结束
      if (replayElapsed >= this.recordingDuration) {
        this.isReplaying = false;
        this.replayPlayer.setVisible(false);
        this.statusText.setText('回放完成！按R重新录制，按空格再次回放');
      } else {
        const replayTimeLeft = (this.recordingDuration - replayElapsed) / 1000;
        this.statusText.setText(`回放中... 剩余: ${replayTimeLeft.toFixed(2)}秒`);
      }
    }
  }

  getKeyName(keyCode) {
    const keyMap = {
      [Phaser.Input.Keyboard.KeyCodes.W]: 'W',
      [Phaser.Input.Keyboard.KeyCodes.A]: 'A',
      [Phaser.Input.Keyboard.KeyCodes.S]: 'S',
      [Phaser.Input.Keyboard.KeyCodes.D]: 'D'
    };
    return keyMap[keyCode];
  }

  updateSpeedText() {
    this.speedText.setText(`回放速度: ${this.replaySpeed}x`);
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