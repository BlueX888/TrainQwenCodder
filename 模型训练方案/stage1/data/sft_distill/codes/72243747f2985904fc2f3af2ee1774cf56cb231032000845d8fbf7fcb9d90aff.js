class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本显示在右上角
    // 使用 originX: 1 让文本右对齐，方便定位在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 2.5 秒（2500 毫秒）加 5 分
    this.timerEvent = this.time.addEvent({
      delay: 2500,           // 2.5 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加背景以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加提示信息
    this.add.text(400, 300, 'Auto Score System\nScore +5 every 2.5s', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 添加调试信息显示定时器状态
    this.debugText = this.add.text(20, 20, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
  }

  addScore() {
    // 每次调用增加 5 分
    this.score += 5;
    
    // 更新分数文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 可选：添加简单的缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  update(time, delta) {
    // 显示定时器进度（调试用）
    if (this.timerEvent) {
      const progress = this.timerEvent.getProgress();
      const remaining = this.timerEvent.getRemaining();
      this.debugText.setText(
        `Next +5 in: ${(remaining / 1000).toFixed(1)}s\n` +
        `Progress: ${(progress * 100).toFixed(0)}%`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

new Phaser.Game(config);