class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.recordingDuration = 500; // 0.5秒
    this.operations = []; // 操作记录
    this.isRecording = false;
    this.isReplaying = false;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.recordStartTime = 0;
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 回放玩家状态
    this.replayPlayerX = 400;
    this.replayPlayerY = 300;
    this.replayIndex = 0;
    this.replayStartTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（蓝色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillRect(-15, -15, 30, 30);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建回放玩家（半透明红色方块）
    this.replayPlayer = this.add.graphics();
    this.replayPlayer.fillStyle(0xff0000, 0.5);
    this.replayPlayer.fillRect(-15, -15, 30, 30);
    this.replayPlayer.x = this.replayPlayerX;
    this.replayPlayer.y = this.replayPlayerY;
    this.replayPlayer.visible = false;

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作记录文本
    this.operationsText = this.add.text(10, 50, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 550, 'WASD: 移动玩家 | 移动后自动录制0.5秒 | UP/DOWN: 开始回放(调速)', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 监听方向键开始回放
    this.keys.UP.on('down', () => this.startReplay(1.5));
    this.keys.DOWN.on('down', () => this.startReplay(0.5));

    this.updateStatusText();
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // 处理玩家移动（仅在非回放状态）
    if (!this.isReplaying) {
      let moved = false;
      const moveDistance = this.playerSpeed * deltaSeconds;

      if (this.keys.W.isDown) {
        this.playerY -= moveDistance;
        moved = true;
        this.recordOperation(time, 'W');
      }
      if (this.keys.S.isDown) {
        this.playerY += moveDistance;
        moved = true;
        this.recordOperation(time, 'S');
      }
      if (this.keys.A.isDown) {
        this.playerX -= moveDistance;
        moved = true;
        this.recordOperation(time, 'A');
      }
      if (this.keys.D.isDown) {
        this.playerX += moveDistance;
        moved = true;
        this.recordOperation(time, 'D');
      }

      // 限制玩家在屏幕内
      this.playerX = Phaser.Math.Clamp(this.playerX, 15, 785);
      this.playerY = Phaser.Math.Clamp(this.playerY, 15, 585);

      this.player.x = this.playerX;
      this.player.y = this.playerY;

      // 如果移动了且未在录制，开始录制
      if (moved && !this.isRecording) {
        this.startRecording(time);
      }

      // 检查录制是否超时
      if (this.isRecording && time - this.recordStartTime >= this.recordingDuration) {
        this.stopRecording();
      }
    }

    // 处理回放
    if (this.isReplaying) {
      this.updateReplay(time, deltaSeconds);
    }

    this.updateStatusText();
  }

  recordOperation(time, key) {
    if (this.isRecording) {
      const relativeTime = time - this.recordStartTime;
      if (relativeTime <= this.recordingDuration) {
        this.operations.push({
          time: relativeTime,
          key: key,
          x: this.playerX,
          y: this.playerY
        });
      }
    }
  }

  startRecording(time) {
    this.isRecording = true;
    this.recordStartTime = time;
    this.operations = [];
    console.log('开始录制');
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`录制完成，共 ${this.operations.length} 个操作`);
  }

  startReplay(speed) {
    if (this.operations.length === 0) {
      console.log('没有可回放的操作');
      return;
    }

    if (this.isReplaying) {
      // 如果正在回放，调整速度
      this.replaySpeed = speed;
      console.log(`调整回放速度为 ${speed}x`);
      return;
    }

    this.isReplaying = true;
    this.replaySpeed = speed;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    
    // 设置回放玩家初始位置
    if (this.operations.length > 0) {
      this.replayPlayerX = this.operations[0].x;
      this.replayPlayerY = this.operations[0].y;
    } else {
      this.replayPlayerX = 400;
      this.replayPlayerY = 300;
    }
    
    this.replayPlayer.x = this.replayPlayerX;
    this.replayPlayer.y = this.replayPlayerY;
    this.replayPlayer.visible = true;

    console.log(`开始回放，速度 ${speed}x`);
  }

  updateReplay(time, deltaSeconds) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 执行所有应该执行的操作
    while (this.replayIndex < this.operations.length) {
      const op = this.operations[this.replayIndex];
      
      if (op.time <= elapsedTime) {
        // 执行操作
        const moveDistance = this.playerSpeed * deltaSeconds * this.replaySpeed;
        
        switch (op.key) {
          case 'W':
            this.replayPlayerY -= moveDistance;
            break;
          case 'S':
            this.replayPlayerY += moveDistance;
            break;
          case 'A':
            this.replayPlayerX -= moveDistance;
            break;
          case 'D':
            this.replayPlayerX += moveDistance;
            break;
        }

        this.replayIndex++;
      } else {
        break;
      }
    }

    // 限制回放玩家在屏幕内
    this.replayPlayerX = Phaser.Math.Clamp(this.replayPlayerX, 15, 785);
    this.replayPlayerY = Phaser.Math.Clamp(this.replayPlayerY, 15, 585);

    this.replayPlayer.x = this.replayPlayerX;
    this.replayPlayer.y = this.replayPlayerY;

    // 检查回放是否完成
    if (elapsedTime >= this.recordingDuration) {
      this.stopReplay();
    }
  }

  stopReplay() {
    this.isReplaying = false;
    this.replayPlayer.visible = false;
    console.log('回放完成');
  }

  updateStatusText() {
    let status = '状态: ';
    if (this.isReplaying) {
      status += `回放中 (速度: ${this.replaySpeed}x)`;
    } else if (this.isRecording) {
      const elapsed = this.time.now - this.recordStartTime;
      const remaining = Math.max(0, this.recordingDuration - elapsed);
      status += `录制中 (剩余: ${(remaining / 1000).toFixed(2)}s)`;
    } else {
      status += '空闲';
    }

    this.statusText.setText(status);

    // 显示操作记录信息
    const opsInfo = `已录制操作数: ${this.operations.length}\n` +
                    `玩家位置: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`;
    this.operationsText.setText(opsInfo);
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