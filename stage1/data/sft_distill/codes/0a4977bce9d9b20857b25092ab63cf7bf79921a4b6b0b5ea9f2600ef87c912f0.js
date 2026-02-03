// 操作录制与回放系统
class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordingDuration = 2000; // 2秒录制时间
    this.playbackSpeed = 1.0; // 回放速度倍率
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      phase: 'recording', // recording, waiting, replaying, completed
      recordedActions: 0,
      playbackProgress: 0,
      playbackSpeed: 1.0,
      playerPosition: { x: 400, y: 300 },
      logs: []
    };

    // 创建玩家方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'playerTex');
    this.player.setOrigin(0.5);
    this.playerSpeed = 200;

    // 录制数据结构
    this.recording = {
      actions: [], // { time, key, pressed }
      startTime: 0,
      isRecording: false,
      isReplaying: false
    };

    // 当前按键状态
    this.currentKeys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // UI文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.speedText = this.add.text(20, 60, '', {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 速度调节键
    this.speedKeys = {
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
    };

    // 开始录制
    this.startRecording();

    this.log('Game started, recording begins');
  }

  startRecording() {
    this.recording.actions = [];
    this.recording.startTime = this.time.now;
    this.recording.isRecording = true;
    this.recording.isReplaying = false;

    window.__signals__.phase = 'recording';
    window.__signals__.recordedActions = 0;

    this.instructionText.setText('Recording... Use arrow keys to move!');
    
    // 2秒后停止录制
    this.time.delayedCall(this.recordingDuration, () => {
      this.stopRecording();
    });

    this.log('Recording started');
  }

  stopRecording() {
    this.recording.isRecording = false;
    window.__signals__.phase = 'waiting';
    window.__signals__.recordedActions = this.recording.actions.length;

    this.instructionText.setText(
      `Recording complete! ${this.recording.actions.length} actions recorded.\n` +
      'Press SPACE to replay | Keys 1-5: Speed (0.5x - 2x)'
    );

    this.log(`Recording stopped, ${this.recording.actions.length} actions captured`);
  }

  startReplay() {
    if (this.recording.actions.length === 0) {
      this.log('No actions to replay');
      return;
    }

    // 重置玩家位置到录制开始位置
    this.player.x = 400;
    this.player.y = 300;

    // 重置按键状态
    this.currentKeys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.recording.isReplaying = true;
    this.recording.replayStartTime = this.time.now;
    this.recording.replayIndex = 0;

    window.__signals__.phase = 'replaying';
    window.__signals__.playbackProgress = 0;

    this.instructionText.setText(
      `Replaying at ${this.playbackSpeed}x speed...\n` +
      'Keys 1-5: Adjust speed | SPACE: Restart replay'
    );

    this.log(`Replay started at ${this.playbackSpeed}x speed`);
  }

  update(time, delta) {
    // 更新状态显示
    this.updateStatusText();
    this.updateSpeedText();

    // 处理速度调节
    this.handleSpeedControl();

    // 录制模式
    if (this.recording.isRecording) {
      this.handleRecording(time);
      this.handlePlayerMovement(delta);
    }

    // 回放模式
    if (this.recording.isReplaying) {
      this.handleReplay(time);
      this.handlePlayerMovement(delta);
    }

    // 等待模式 - 按空格开始回放
    if (!this.recording.isRecording && !this.recording.isReplaying) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.startReplay();
      }
    }

    // 回放中按空格重新开始回放
    if (this.recording.isReplaying && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startReplay();
    }

    // 更新验证信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  handleRecording(time) {
    const elapsed = time - this.recording.startTime;
    
    // 检测按键变化并记录
    const keys = [
      { name: 'up', key: this.cursors.up },
      { name: 'down', key: this.cursors.down },
      { name: 'left', key: this.cursors.left },
      { name: 'right', key: this.cursors.right }
    ];

    keys.forEach(({ name, key }) => {
      const isPressed = key.isDown;
      const wasPressed = this.currentKeys[name];

      if (isPressed !== wasPressed) {
        this.recording.actions.push({
          time: elapsed,
          key: name,
          pressed: isPressed
        });
        this.currentKeys[name] = isPressed;
        
        window.__signals__.recordedActions = this.recording.actions.length;
        this.log(`Recorded: ${name} ${isPressed ? 'down' : 'up'} at ${elapsed.toFixed(0)}ms`);
      }
    });
  }

  handleReplay(time) {
    const elapsed = (time - this.recording.replayStartTime) * this.playbackSpeed;
    const actions = this.recording.actions;

    // 处理所有应该在当前时间触发的动作
    while (this.recording.replayIndex < actions.length) {
      const action = actions[this.recording.replayIndex];
      
      if (action.time <= elapsed) {
        this.currentKeys[action.key] = action.pressed;
        this.log(`Replaying: ${action.key} ${action.pressed ? 'down' : 'up'}`);
        this.recording.replayIndex++;
        
        window.__signals__.playbackProgress = 
          (this.recording.replayIndex / actions.length * 100).toFixed(1);
      } else {
        break;
      }
    }

    // 回放结束
    if (this.recording.replayIndex >= actions.length && elapsed >= this.recordingDuration) {
      this.recording.isReplaying = false;
      this.currentKeys = { up: false, down: false, left: false, right: false };
      
      window.__signals__.phase = 'completed';
      window.__signals__.playbackProgress = 100;
      
      this.instructionText.setText(
        'Replay complete! Press SPACE to replay again'
      );
      
      this.log('Replay completed');
    }
  }

  handlePlayerMovement(delta) {
    const speed = this.playerSpeed * (delta / 1000);
    
    if (this.currentKeys.left) {
      this.player.x -= speed;
    }
    if (this.currentKeys.right) {
      this.player.x += speed;
    }
    if (this.currentKeys.up) {
      this.player.y -= speed;
    }
    if (this.currentKeys.down) {
      this.player.y += speed;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);
  }

  handleSpeedControl() {
    const speedMap = {
      ONE: 0.5,
      TWO: 0.75,
      THREE: 1.0,
      FOUR: 1.5,
      FIVE: 2.0
    };

    Object.entries(speedMap).forEach(([key, speed]) => {
      if (Phaser.Input.Keyboard.JustDown(this.speedKeys[key])) {
        this.playbackSpeed = speed;
        window.__signals__.playbackSpeed = speed;
        this.log(`Playback speed changed to ${speed}x`);
      }
    });
  }

  updateStatusText() {
    const phase = this.recording.isRecording ? 'RECORDING' : 
                  this.recording.isReplaying ? 'REPLAYING' : 'WAITING';
    
    let timeInfo = '';
    if (this.recording.isRecording) {
      const elapsed = this.time.now - this.recording.startTime;
      const remaining = Math.max(0, this.recordingDuration - elapsed);
      timeInfo = `Time left: ${(remaining / 1000).toFixed(1)}s`;
    } else if (this.recording.isReplaying) {
      const progress = (this.recording.replayIndex / this.recording.actions.length * 100).toFixed(0);
      timeInfo = `Progress: ${progress}%`;
    }

    this.statusText.setText(
      `Phase: ${phase}\n` +
      `Actions: ${this.recording.actions.length}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      timeInfo
    );
  }

  updateSpeedText() {
    this.speedText.setText(
      `Playback Speed: ${this.playbackSpeed}x\n` +
      '1:0.5x  2:0.75x  3:1x  4:1.5x  5:2x'
    );
  }

  log(message) {
    const logEntry = {
      time: this.time.now,
      message: message
    };
    window.__signals__.logs.push(logEntry);
    console.log(`[${logEntry.time.toFixed(0)}ms] ${message}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordReplayScene
};

new Phaser.Game(config);