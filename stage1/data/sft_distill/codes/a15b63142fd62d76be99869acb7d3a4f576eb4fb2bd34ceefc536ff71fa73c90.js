class RecordReplayScene extends Phaser.Scene {
  constructor() {
    super('RecordReplayScene');
    this.recordDuration = 2000; // 2秒录制时间
    this.recordings = []; // 存储录制数据
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTime = 0;
    this.replaySpeed = 1.0; // 回放速度倍率
    this.replayIndex = 0;
    this.operationCount = 0; // 可验证的操作计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建玩家方块（使用 Graphics 生成纹理）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff88, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(width / 2, height / 2, 'playerTex');
    this.player.setInteractive({ draggable: true });

    // 创建录制轨迹显示（幽灵轨迹）
    this.trailGraphics = this.add.graphics();

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(10, 50, 
      '拖动方块移动\n右键开始回放\n数字键1-5调速度(0.5x-2x)\n空格重新录制', {
      fontSize: '14px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 操作计数显示
    this.countText = this.add.text(10, height - 40, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置拖动事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (!this.isReplaying && this.isRecording) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        this.operationCount++;
        this.recordPosition(dragX, dragY);
      }
    });

    // 右键开始回放
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.isReplaying && this.recordings.length > 0) {
        this.startReplay();
      }
    });

    // 数字键调节速度
    this.input.keyboard.on('keydown', (event) => {
      if (event.key >= '1' && event.key <= '5') {
        const speedMap = { '1': 0.5, '2': 0.75, '3': 1.0, '4': 1.5, '5': 2.0 };
        this.replaySpeed = speedMap[event.key];
      } else if (event.key === ' ') {
        // 空格重新开始录制
        this.resetRecording();
      }
    });

    // 开始录制
    this.startRecording();
  }

  startRecording() {
    this.isRecording = true;
    this.isReplaying = false;
    this.recordings = [];
    this.recordStartTime = this.time.now;
    this.operationCount = 0;
    this.trailGraphics.clear();

    // 2秒后自动停止录制
    this.time.delayedCall(this.recordDuration, () => {
      this.stopRecording();
    });
  }

  recordPosition(x, y) {
    if (this.isRecording) {
      const timestamp = this.time.now - this.recordStartTime;
      if (timestamp <= this.recordDuration) {
        this.recordings.push({ x, y, time: timestamp });
        
        // 绘制轨迹点
        this.trailGraphics.fillStyle(0x4444ff, 0.3);
        this.trailGraphics.fillCircle(x, y, 3);
      }
    }
  }

  stopRecording() {
    this.isRecording = false;
  }

  startReplay() {
    if (this.recordings.length === 0) return;

    this.isReplaying = true;
    this.replayIndex = 0;
    
    // 重置玩家位置到录制起点
    if (this.recordings[0]) {
      this.player.x = this.recordings[0].x;
      this.player.y = this.recordings[0].y;
    }

    // 清除旧轨迹，绘制新轨迹
    this.trailGraphics.clear();
    this.trailGraphics.lineStyle(2, 0xff00ff, 0.5);
    this.trailGraphics.beginPath();
    this.recordings.forEach((rec, index) => {
      if (index === 0) {
        this.trailGraphics.moveTo(rec.x, rec.y);
      } else {
        this.trailGraphics.lineTo(rec.x, rec.y);
      }
    });
    this.trailGraphics.strokePath();

    this.replayStartTime = this.time.now;
  }

  resetRecording() {
    this.isReplaying = false;
    this.trailGraphics.clear();
    this.startRecording();
  }

  update(time, delta) {
    // 更新状态文本
    if (this.isRecording) {
      const elapsed = Math.min(this.time.now - this.recordStartTime, this.recordDuration);
      const remaining = ((this.recordDuration - elapsed) / 1000).toFixed(1);
      this.statusText.setText(`录制中... 剩余: ${remaining}s`);
    } else if (this.isReplaying) {
      this.statusText.setText(`回放中 速度: ${this.replaySpeed}x`);
    } else {
      this.statusText.setText(`录制完成 (${this.recordings.length} 个点)`);
    }

    this.countText.setText(`操作计数: ${this.operationCount}`);

    // 回放逻辑
    if (this.isReplaying && this.recordings.length > 0) {
      const elapsedTime = (this.time.now - this.replayStartTime) * this.replaySpeed;
      
      // 找到当前时间对应的录制点
      while (this.replayIndex < this.recordings.length) {
        const record = this.recordings[this.replayIndex];
        
        if (record.time <= elapsedTime) {
          this.player.x = record.x;
          this.player.y = record.y;
          this.replayIndex++;
        } else {
          break;
        }
      }

      // 回放结束
      if (this.replayIndex >= this.recordings.length) {
        this.isReplaying = false;
        this.replayIndex = 0;
        
        // 延迟后可以重新回放
        this.time.delayedCall(500, () => {
          this.statusText.setText(`回放完成 - 右键重新回放`);
        });
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: RecordReplayScene,
  parent: 'game-container'
};

new Phaser.Game(config);