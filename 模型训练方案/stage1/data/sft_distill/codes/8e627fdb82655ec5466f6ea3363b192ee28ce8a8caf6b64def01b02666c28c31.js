// 操作记录与回放系统
class RecordingScene extends Phaser.Scene {
  constructor() {
    super('RecordingScene');
    this.recordedActions = [];
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replayStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.currentActionIndex = 0;
    this.playerX = 400;
    this.playerY = 300;
    
    // 可验证的状态信号
    window.__signals__ = {
      recordedActionsCount: 0,
      isRecording: false,
      isReplaying: false,
      replaySpeed: 1.0,
      playerPosition: { x: 400, y: 300 },
      actionLog: []
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放预览方块（半透明）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.5);
    this.replayPlayer.fillRect(-20, -20, 40, 40);
    this.replayPlayer.x = this.playerX;
    this.replayPlayer.y = this.playerY;
    this.replayPlayer.setVisible(false);

    // 创建 UI 文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'WASD: Move | Recording starts automatically for 1 second\nAfter recording: UP/DOWN arrows to start replay and adjust speed',
      {
        fontSize: '14px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    this.replayInfoText = this.add.text(10, 110, '', {
      fontSize: '14px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

    // 开始录制
    this.startRecording();

    // 更新状态文本
    this.updateStatusText();
  }

  startRecording() {
    this.isRecording = true;
    this.recordedActions = [];
    this.recordStartTime = this.time.now;
    this.playerX = 400;
    this.playerY = 300;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    window.__signals__.isRecording = true;
    window.__signals__.recordedActionsCount = 0;
    window.__signals__.actionLog = [];

    // 1 秒后停止录制
    this.time.delayedCall(1000, () => {
      this.stopRecording();
    });

    this.logSignal('RECORDING_STARTED', { timestamp: this.recordStartTime });
  }

  stopRecording() {
    this.isRecording = false;
    window.__signals__.isRecording = false;
    window.__signals__.recordedActionsCount = this.recordedActions.length;
    
    this.logSignal('RECORDING_STOPPED', { 
      actionsCount: this.recordedActions.length,
      duration: 1000
    });
  }

  startReplay() {
    if (this.recordedActions.length === 0 || this.isRecording) {
      return;
    }

    this.isReplaying = true;
    this.replayStartTime = this.time.now;
    this.currentActionIndex = 0;
    
    // 重置回放玩家位置
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.setVisible(true);

    window.__signals__.isReplaying = true;
    
    this.logSignal('REPLAY_STARTED', { 
      speed: this.replaySpeed,
      actionsCount: this.recordedActions.length
    });
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.setVisible(false);
    window.__signals__.isReplaying = false;
    
    this.logSignal('REPLAY_STOPPED', { 
      actionsProcessed: this.currentActionIndex
    });
  }

  adjustReplaySpeed(delta) {
    const speeds = [0.5, 1.0, 2.0];
    let currentIndex = speeds.indexOf(this.replaySpeed);
    
    if (delta > 0) {
      currentIndex = Math.min(currentIndex + 1, speeds.length - 1);
    } else {
      currentIndex = Math.max(currentIndex - 1, 0);
    }
    
    this.replaySpeed = speeds[currentIndex];
    window.__signals__.replaySpeed = this.replaySpeed;
    
    this.logSignal('REPLAY_SPEED_CHANGED', { speed: this.replaySpeed });
  }

  recordAction(key) {
    if (!this.isRecording) return;

    const timestamp = this.time.now - this.recordStartTime;
    this.recordedActions.push({ key, timestamp });
    
    this.logSignal('ACTION_RECORDED', { key, timestamp });
  }

  handlePlayerMovement(delta) {
    const speed = 200 * (delta / 1000);
    let moved = false;

    if (this.keys.W.isDown) {
      this.playerY -= speed;
      moved = true;
      if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
        this.recordAction('W');
      }
    }
    if (this.keys.S.isDown) {
      this.playerY += speed;
      moved = true;
      if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
        this.recordAction('S');
      }
    }
    if (this.keys.A.isDown) {
      this.playerX -= speed;
      moved = true;
      if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
        this.recordAction('A');
      }
    }
    if (this.keys.D.isDown) {
      this.playerX += speed;
      moved = true;
      if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
        this.recordAction('D');
      }
    }

    // 限制在屏幕内
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

    this.player.x = this.playerX;
    this.player.y = this.playerY;

    if (moved) {
      window.__signals__.playerPosition = { 
        x: Math.round(this.playerX), 
        y: Math.round(this.playerY) 
      };
    }
  }

  handleReplayMovement(delta) {
    if (!this.isReplaying) return;

    const adjustedDelta = delta * this.replaySpeed;
    const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;

    // 处理当前应该执行的所有动作
    while (this.currentActionIndex < this.recordedActions.length) {
      const action = this.recordedActions[this.currentActionIndex];
      
      if (action.timestamp <= elapsedTime) {
        // 执行动作
        this.executeReplayAction(action.key, adjustedDelta);
        this.currentActionIndex++;
        
        this.logSignal('REPLAY_ACTION_EXECUTED', { 
          key: action.key, 
          index: this.currentActionIndex - 1 
        });
      } else {
        break;
      }
    }

    // 如果所有动作都已执行完毕
    if (this.currentActionIndex >= this.recordedActions.length) {
      this.stopReplay();
    }
  }

  executeReplayAction(key, delta) {
    const speed = 200 * (delta / 1000);
    
    switch(key) {
      case 'W':
        this.replayPlayer.y -= speed;
        break;
      case 'S':
        this.replayPlayer.y += speed;
        break;
      case 'A':
        this.replayPlayer.x -= speed;
        break;
      case 'D':
        this.replayPlayer.x += speed;
        break;
    }

    // 限制在屏幕内
    this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 20, 780);
    this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 20, 580);
  }

  updateStatusText() {
    let status = '';
    
    if (this.isRecording) {
      const elapsed = Math.min(1000, this.time.now - this.recordStartTime);
      status = `RECORDING: ${(elapsed / 1000).toFixed(2)}s / 1.00s`;
    } else if (this.isReplaying) {
      status = `REPLAYING (${this.replaySpeed}x speed): ${this.currentActionIndex}/${this.recordedActions.length} actions`;
    } else if (this.recordedActions.length > 0) {
      status = `READY TO REPLAY: ${this.recordedActions.length} actions recorded`;
    } else {
      status = 'IDLE';
    }

    this.statusText.setText(status);

    // 更新回放信息
    if (!this.isRecording && this.recordedActions.length > 0) {
      this.replayInfoText.setText(
        `Speed: ${this.replaySpeed}x | UP: Start/Increase Speed | DOWN: Decrease Speed`
      );
    } else {
      this.replayInfoText.setText('');
    }
  }

  logSignal(event, data) {
    const signal = {
      event,
      timestamp: this.time.now,
      data
    };
    window.__signals__.actionLog.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
  }

  update(time, delta) {
    // 处理玩家移动（录制时）
    if (this.isRecording) {
      this.handlePlayerMovement(delta);
    }

    // 处理回放控制
    if (!this.isRecording) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.UP)) {
        if (!this.isReplaying) {
          this.startReplay();
        } else {
          this.adjustReplaySpeed(1);
        }
      }
      
      if (Phaser.Input.Keyboard.JustDown(this.keys.DOWN)) {
        if (this.isReplaying) {
          this.adjustReplaySpeed(-1);
        }
      }
    }

    // 处理回放移动
    this.handleReplayMovement(delta);

    // 更新状态文本
    this.updateStatusText();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: RecordingScene
};

new Phaser.Game(config);