// 完整的 Phaser3 操作录制与回放系统
class RecordPlaybackScene extends Phaser.Scene {
  constructor() {
    super('RecordPlaybackScene');
    
    // 可验证的状态信号
    this.signals = {
      mode: 'recording', // recording, playback, idle
      recordDuration: 1500, // 1.5秒
      recordedActions: [],
      playbackProgress: 0,
      playbackSpeed: 1.0,
      playerPosition: { x: 400, y: 300 },
      totalActionsRecorded: 0,
      totalActionsPlayed: 0
    };
    
    // 暴露到全局用于验证
    window.__signals__ = this.signals;
  }

  preload() {
    // 无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家方块（使用Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-15, -15, 30, 30);
    this.player.x = 400;
    this.player.y = 300;
    
    // 玩家速度
    this.playerSpeed = 200;
    this.playerVelocity = { x: 0, y: 0 };
    
    // 录制相关
    this.recordStartTime = this.time.now;
    this.recordedActions = [];
    this.isRecording = true;
    this.isPlayback = false;
    
    // 回放相关
    this.playbackStartTime = 0;
    this.playbackSpeed = 1.0;
    this.playbackIndex = 0;
    this.playbackInitialPosition = { x: 400, y: 300 };
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // 速度调节键
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    
    // 监听WASD按键开始回放
    this.keyW.on('down', () => this.startPlayback());
    this.keyA.on('down', () => this.startPlayback());
    this.keyS.on('down', () => this.startPlayback());
    this.keyD.on('down', () => this.startPlayback());
    
    // 监听速度调节
    this.key1.on('down', () => this.setPlaybackSpeed(0.5));
    this.key2.on('down', () => this.setPlaybackSpeed(1.0));
    this.key3.on('down', () => this.setPlaybackSpeed(2.0));
    
    // 监听方向键进行录制
    this.cursors.up.on('down', () => this.recordAction('up', true));
    this.cursors.up.on('up', () => this.recordAction('up', false));
    this.cursors.down.on('down', () => this.recordAction('down', true));
    this.cursors.down.on('up', () => this.recordAction('down', false));
    this.cursors.left.on('down', () => this.recordAction('left', true));
    this.cursors.left.on('up', () => this.recordAction('left', false));
    this.cursors.right.on('down', () => this.recordAction('right', true));
    this.cursors.right.on('up', () => this.recordAction('right', false));
    
    // UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, height - 100, 
      'Recording for 1.5s...\nUse Arrow Keys to move\nPress WASD to start playback\nPress 1/2/3 for 0.5x/1x/2x speed', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 录制进度条
    this.progressBar = this.add.graphics();
    
    // 日志输出
    this.logAction('Recording started');
  }

  recordAction(key, isDown) {
    if (!this.isRecording) return;
    
    const currentTime = this.time.now;
    const elapsedTime = currentTime - this.recordStartTime;
    
    if (elapsedTime <= this.signals.recordDuration) {
      const action = {
        key: key,
        isDown: isDown,
        timestamp: elapsedTime
      };
      
      this.recordedActions.push(action);
      this.signals.recordedActions.push(action);
      this.signals.totalActionsRecorded = this.recordedActions.length;
      
      this.logAction(`Recorded: ${key} ${isDown ? 'down' : 'up'} at ${elapsedTime}ms`);
    }
  }

  startPlayback() {
    if (this.isPlayback || this.recordedActions.length === 0) return;
    
    // 停止录制，开始回放
    this.isRecording = false;
    this.isPlayback = true;
    this.signals.mode = 'playback';
    
    // 重置玩家位置到录制起点
    this.playbackInitialPosition = { x: this.player.x, y: this.player.y };
    this.player.x = 400;
    this.player.y = 300;
    
    // 重置速度
    this.playerVelocity = { x: 0, y: 0 };
    
    // 记录回放开始时间
    this.playbackStartTime = this.time.now;
    this.playbackIndex = 0;
    this.signals.playbackProgress = 0;
    this.signals.totalActionsPlayed = 0;
    
    // 改变玩家颜色表示回放模式
    this.player.clear();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(-15, -15, 30, 30);
    
    this.logAction(`Playback started with ${this.recordedActions.length} actions at ${this.playbackSpeed}x speed`);
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = speed;
    this.signals.playbackSpeed = speed;
    this.logAction(`Playback speed set to ${speed}x`);
  }

  update(time, delta) {
    // 更新录制状态
    if (this.isRecording) {
      const elapsed = time - this.recordStartTime;
      
      if (elapsed >= this.signals.recordDuration) {
        this.isRecording = false;
        this.signals.mode = 'idle';
        this.logAction(`Recording finished: ${this.recordedActions.length} actions recorded`);
      }
      
      // 绘制录制进度条
      this.drawProgressBar(elapsed / this.signals.recordDuration);
      
      // 处理玩家移动（录制模式）
      this.handlePlayerMovement(delta);
    }
    
    // 回放模式
    if (this.isPlayback) {
      const playbackElapsed = (time - this.playbackStartTime) * this.playbackSpeed;
      
      // 执行录制的动作
      while (this.playbackIndex < this.recordedActions.length) {
        const action = this.recordedActions[this.playbackIndex];
        
        if (action.timestamp <= playbackElapsed) {
          // 执行动作
          this.executeAction(action);
          this.playbackIndex++;
          this.signals.totalActionsPlayed = this.playbackIndex;
        } else {
          break;
        }
      }
      
      // 处理玩家移动（回放模式）
      this.handlePlayerMovement(delta);
      
      // 更新回放进度
      const totalDuration = this.recordedActions.length > 0 
        ? this.recordedActions[this.recordedActions.length - 1].timestamp 
        : this.signals.recordDuration;
      this.signals.playbackProgress = Math.min(playbackElapsed / totalDuration, 1);
      this.drawProgressBar(this.signals.playbackProgress);
      
      // 回放结束
      if (this.playbackIndex >= this.recordedActions.length && playbackElapsed > totalDuration) {
        this.endPlayback();
      }
    }
    
    // 更新玩家位置
    this.player.x += this.playerVelocity.x * delta / 1000;
    this.player.y += this.playerVelocity.y * delta / 1000;
    
    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 15, this.cameras.main.width - 15);
    this.player.y = Phaser.Math.Clamp(this.player.y, 15, this.cameras.main.height - 15);
    
    // 更新信号
    this.signals.playerPosition = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
    
    // 更新UI
    this.updateStatusText();
  }

  handlePlayerMovement(delta) {
    if (this.isRecording) {
      // 录制模式：使用方向键
      this.playerVelocity.x = 0;
      this.playerVelocity.y = 0;
      
      if (this.cursors.left.isDown) {
        this.playerVelocity.x = -this.playerSpeed;
      } else if (this.cursors.right.isDown) {
        this.playerVelocity.x = this.playerSpeed;
      }
      
      if (this.cursors.up.isDown) {
        this.playerVelocity.y = -this.playerSpeed;
      } else if (this.cursors.down.isDown) {
        this.playerVelocity.y = this.playerSpeed;
      }
    } else if (this.isPlayback) {
      // 回放模式：根据当前按键状态移动
      // 速度不变，已在executeAction中设置
    }
  }

  executeAction(action) {
    // 模拟按键效果
    if (action.isDown) {
      switch (action.key) {
        case 'up':
          this.playerVelocity.y = -this.playerSpeed;
          break;
        case 'down':
          this.playerVelocity.y = this.playerSpeed;
          break;
        case 'left':
          this.playerVelocity.x = -this.playerSpeed;
          break;
        case 'right':
          this.playerVelocity.x = this.playerSpeed;
          break;
      }
    } else {
      switch (action.key) {
        case 'up':
        case 'down':
          this.playerVelocity.y = 0;
          break;
        case 'left':
        case 'right':
          this.playerVelocity.x = 0;
          break;
      }
    }
    
    this.logAction(`Executed: ${action.key} ${action.isDown ? 'down' : 'up'}`);
  }

  endPlayback() {
    this.isPlayback = false;
    this.signals.mode = 'idle';
    this.playerVelocity = { x: 0, y: 0 };
    
    // 恢复玩家颜色
    this.player.clear();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillRect(-15, -15, 30, 30);
    
    this.logAction('Playback finished');
  }

  drawProgressBar(progress) {
    this.progressBar.clear();
    
    const barWidth = 300;
    const barHeight = 20;
    const barX = (this.cameras.main.width - barWidth) / 2;
    const barY = 50;
    
    // 背景
    this.progressBar.fillStyle(0x333333, 1);
    this.progressBar.fillRect(barX, barY, barWidth, barHeight);
    
    // 进度
    const color = this.isRecording ? 0x00ff00 : 0xff0000;
    this.progressBar.fillStyle(color, 1);
    this.progressBar.fillRect(barX, barY, barWidth * progress, barHeight);
    
    // 边框
    this.progressBar.lineStyle(2, 0xffffff, 1);
    this.progressBar.strokeRect(barX, barY, barWidth, barHeight);
  }

  updateStatusText() {
    const mode = this.signals.mode.toUpperCase();
    const actions = this.isPlayback 
      ? `${this.signals.totalActionsPlayed}/${this.signals.totalActionsRecorded}`
      : this.signals.totalActionsRecorded;
    
    this.statusText.setText(
      `Mode: ${mode}\n` +
      `Actions: ${actions}\n` +
      `Speed: ${this.playbackSpeed}