// 操作记录与回放系统
class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 1500; // 1.5秒
    this.recordings = []; // 记录操作序列
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1; // 回放速度倍率
    this.playerSpeed = 200;
    
    // 验证信号
    window.__signals__ = {
      recordedActions: 0,
      replayedActions: 0,
      currentSpeed: 1,
      recordingComplete: false,
      replayComplete: false,
      playerPosition: { x: 0, y: 0 }
    };
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-15, -15, 30, 30);
    this.player.x = 400;
    this.player.y = 300;
    
    // 创建回放玩家（蓝色方块，初始隐藏）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0x0088ff, 1);
    this.replayPlayer.fillRect(-15, -15, 30, 30);
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.setVisible(false);
    
    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 50, 
      'Arrow Keys: Control player\nSpace: Change speed (1x/2x/0.5x)\nWASD: Start replay after recording',
      {
        fontSize: '14px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    // 空格键切换速度
    this.wasdKeys.space.on('down', () => {
      if (!this.isReplaying) {
        this.cycleSpeed();
      }
    });
    
    // WASD键触发回放
    ['w', 'a', 's', 'd'].forEach(key => {
      this.wasdKeys[key].on('down', () => {
        if (!this.isRecording && !this.isReplaying && this.recordings.length > 0) {
          this.startReplay();
        }
      });
    });
    
    // 开始录制
    this.startRecording();
    
    // 绘制边界
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(50, 100, 700, 400);
  }

  startRecording() {
    this.isRecording = true;
    this.recordings = [];
    this.recordStartTime = this.time.now;
    this.player.x = 400;
    this.player.y = 300;
    
    window.__signals__.recordedActions = 0;
    window.__signals__.recordingComplete = false;
    
    // 1.5秒后停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  stopRecording() {
    this.isRecording = false;
    window.__signals__.recordingComplete = true;
    window.__signals__.recordedActions = this.recordings.length;
    
    console.log('Recording complete:', this.recordings);
  }

  recordAction(action, data) {
    if (!this.isRecording) return;
    
    const timestamp = this.time.now - this.recordStartTime;
    this.recordings.push({
      timestamp,
      action,
      data: { ...data }
    });
  }

  startReplay() {
    if (this.recordings.length === 0) return;
    
    this.isReplaying = true;
    this.replayPlayer.x = 400;
    this.replayPlayer.y = 300;
    this.replayPlayer.setVisible(true);
    
    window.__signals__.replayedActions = 0;
    window.__signals__.replayComplete = false;
    
    let replayIndex = 0;
    const startTime = this.time.now;
    
    // 创建回放更新循环
    const replayUpdate = () => {
      if (!this.isReplaying) return;
      
      const elapsed = (this.time.now - startTime) * this.replaySpeed;
      
      // 执行所有应该执行的操作
      while (replayIndex < this.recordings.length) {
        const record = this.recordings[replayIndex];
        
        if (record.timestamp <= elapsed) {
          this.executeReplayAction(record);
          replayIndex++;
          window.__signals__.replayedActions = replayIndex;
        } else {
          break;
        }
      }
      
      // 检查是否完成
      if (replayIndex >= this.recordings.length) {
        this.stopReplay();
      }
    };
    
    // 使用update事件进行回放
    this.replayUpdateEvent = this.time.addEvent({
      delay: 16, // ~60fps
      callback: replayUpdate,
      loop: true
    });
  }

  executeReplayAction(record) {
    const { action, data } = record;
    
    if (action === 'move') {
      this.replayPlayer.x += data.dx;
      this.replayPlayer.y += data.dy;
      
      // 边界限制
      this.replayPlayer.x = Phaser.Math.Clamp(this.replayPlayer.x, 65, 735);
      this.replayPlayer.y = Phaser.Math.Clamp(this.replayPlayer.y, 115, 485);
    }
  }

  stopReplay() {
    this.isReplaying = false;
    window.__signals__.replayComplete = true;
    
    if (this.replayUpdateEvent) {
      this.replayUpdateEvent.remove();
    }
    
    // 2秒后隐藏回放玩家并重新开始录制
    this.time.delayedCall(2000, () => {
      this.replayPlayer.setVisible(false);
      this.startRecording();
    });
  }

  cycleSpeed() {
    const speeds = [1, 2, 0.5];
    const currentIndex = speeds.indexOf(this.replaySpeed);
    this.replaySpeed = speeds[(currentIndex + 1) % speeds.length];
    window.__signals__.currentSpeed = this.replaySpeed;
  }

  update(time, delta) {
    // 更新状态文本
    let status = '';
    if (this.isRecording) {
      const remaining = Math.max(0, this.recordDuration - (time - this.recordStartTime));
      status = `RECORDING... (${(remaining / 1000).toFixed(1)}s left) | Actions: ${this.recordings.length}`;
    } else if (this.isReplaying) {
      status = `REPLAYING at ${this.replaySpeed}x speed | Actions: ${window.__signals__.replayedActions}/${this.recordings.length}`;
    } else {
      status = `Ready to replay | Recorded: ${this.recordings.length} actions | Speed: ${this.replaySpeed}x`;
    }
    this.statusText.setText(status);
    
    // 玩家控制（仅在录制时）
    if (this.isRecording) {
      let dx = 0;
      let dy = 0;
      const moveAmount = this.playerSpeed * (delta / 1000);
      
      if (this.cursors.left.isDown) {
        dx -= moveAmount;
      }
      if (this.cursors.right.isDown) {
        dx += moveAmount;
      }
      if (this.cursors.up.isDown) {
        dy -= moveAmount;
      }
      if (this.cursors.down.isDown) {
        dy += moveAmount;
      }
      
      // 如果有移动，记录并应用
      if (dx !== 0 || dy !== 0) {
        this.recordAction('move', { dx, dy });
        
        this.player.x += dx;
        this.player.y += dy;
        
        // 边界限制
        this.player.x = Phaser.Math.Clamp(this.player.x, 65, 735);
        this.player.y = Phaser.Math.Clamp(this.player.y, 115, 485);
      }
    }
    
    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
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