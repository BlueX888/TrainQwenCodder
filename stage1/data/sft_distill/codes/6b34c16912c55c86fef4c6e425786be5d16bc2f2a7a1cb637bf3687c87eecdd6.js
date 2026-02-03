class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    
    // 状态变量
    this.recordBuffer = []; // 操作记录缓冲区
    this.recordStartTime = 0; // 录制开始时间
    this.isRecording = false; // 是否正在录制
    this.isReplaying = false; // 是否正在回放
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0; // 当前回放索引
    this.replayStartTime = 0; // 回放开始时间
    
    // 玩家状态
    this.playerX = 400;
    this.playerY = 300;
    this.playerSpeed = 200;
    
    // 可验证状态
    this.totalMoves = 0; // 总移动次数
    this.recordCount = 0; // 录制次数
    this.replayCount = 0; // 回放次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 创建录制指示器（红色圆圈）
    this.recordIndicator = this.add.graphics();
    this.recordIndicator.fillStyle(0xff0000, 1);
    this.recordIndicator.fillCircle(50, 50, 15);
    this.recordIndicator.setVisible(false);

    // 创建回放指示器（蓝色三角形）
    this.replayIndicator = this.add.graphics();
    this.replayIndicator.fillStyle(0x0000ff, 1);
    this.replayIndicator.fillTriangle(30, 50, 50, 40, 50, 60);
    this.replayIndicator.setVisible(false);

    // UI文本
    this.statusText = this.add.text(100, 30, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.infoText = this.add.text(10, 100, 
      '方向键: 移动并录制(自动录制最近2秒)\n' +
      'WASD: 开始回放录制内容\n' +
      '数字键1-5: 调节回放速度(0.5x-2.5x)\n' +
      'ESC: 停止回放', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.statsText = this.add.text(10, 500, '', {
      fontSize: '16px',
      fill: '#00ffff'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD键用于触发回放
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // ESC键停止回放
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // 数字键调节速度
    this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.fourKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.fiveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);

    // 监听速度调节
    this.oneKey.on('down', () => { this.replaySpeed = 0.5; });
    this.twoKey.on('down', () => { this.replaySpeed = 1.0; });
    this.threeKey.on('down', () => { this.replaySpeed = 1.5; });
    this.fourKey.on('down', () => { this.replaySpeed = 2.0; });
    this.fiveKey.on('down', () => { this.replaySpeed = 2.5; });

    // 监听WASD开始回放
    this.wKey.on('down', () => { this.startReplay(); });
    this.aKey.on('down', () => { this.startReplay(); });
    this.sKey.on('down', () => { this.startReplay(); });
    this.dKey.on('down', () => { this.startReplay(); });

    // 监听ESC停止回放
    this.escKey.on('down', () => { this.stopReplay(); });

    // 开始录制
    this.startRecording();
  }

  update(time, delta) {
    if (this.isReplaying) {
      this.updateReplay(time);
    } else {
      this.updateRecording(time, delta);
    }

    this.updateUI();
  }

  updateRecording(time, delta) {
    let moved = false;
    let direction = null;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      this.playerX -= this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      this.playerX += this.playerSpeed * (delta / 1000);
      moved = true;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      this.playerY -= this.playerSpeed * (delta / 1000);
      moved = true;
      direction = direction ? direction + '+up' : 'up';
    } else if (this.cursors.down.isDown) {
      this.playerY += this.playerSpeed * (delta / 1000);
      moved = true;
      direction = direction ? direction + '+down' : 'down';
    }

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);

    // 更新玩家位置
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 记录操作
    if (moved && this.isRecording) {
      const timestamp = time - this.recordStartTime;
      this.recordBuffer.push({
        time: timestamp,
        direction: direction,
        x: this.playerX,
        y: this.playerY
      });

      this.totalMoves++;

      // 保持2秒窗口，移除超过2000ms的旧记录
      this.recordBuffer = this.recordBuffer.filter(record => 
        timestamp - record.time <= 2000
      );
    }
  }

  updateReplay(time) {
    const elapsedTime = (time - this.replayStartTime) * this.replaySpeed;

    // 查找当前应该执行的操作
    while (this.replayIndex < this.recordBuffer.length) {
      const record = this.recordBuffer[this.replayIndex];
      
      if (record.time <= elapsedTime) {
        // 执行这个操作
        this.playerX = record.x;
        this.playerY = record.y;
        this.player.x = this.playerX;
        this.player.y = this.playerY;
        
        this.replayIndex++;
      } else {
        break;
      }
    }

    // 回放结束
    if (this.replayIndex >= this.recordBuffer.length) {
      this.stopReplay();
    }
  }

  startRecording() {
    this.isRecording = true;
    this.recordStartTime = this.time.now;
    this.recordBuffer = [];
    this.recordCount++;
    this.recordIndicator.setVisible(true);
  }

  startReplay() {
    if (this.recordBuffer.length === 0) {
      return; // 没有录制内容
    }

    if (this.isReplaying) {
      return; // 已在回放中
    }

    this.isRecording = false;
    this.isReplaying = true;
    this.replayIndex = 0;
    this.replayStartTime = this.time.now;
    this.replayCount++;
    
    // 重置玩家到录制开始位置
    if (this.recordBuffer.length > 0) {
      this.playerX = this.recordBuffer[0].x;
      this.playerY = this.recordBuffer[0].y;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
    }

    this.recordIndicator.setVisible(false);
    this.replayIndicator.setVisible(true);
  }

  stopReplay() {
    if (!this.isReplaying) {
      return;
    }

    this.isReplaying = false;
    this.replayIndicator.setVisible(false);
    
    // 重新开始录制
    this.startRecording();
  }

  updateUI() {
    let status = '';
    if (this.isReplaying) {
      status = `回放中 (速度: ${this.replaySpeed}x) - ${this.replayIndex}/${this.recordBuffer.length}`;
    } else if (this.isRecording) {
      status = `录制中 (缓冲: ${this.recordBuffer.length} 操作)`;
    } else {
      status = '空闲';
    }

    this.statusText.setText(status);

    this.statsText.setText(
      `统计信息:\n` +
      `总移动次数: ${this.totalMoves}\n` +
      `录制次数: ${this.recordCount}\n` +
      `回放次数: ${this.replayCount}\n` +
      `当前速度: ${this.replaySpeed}x`
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