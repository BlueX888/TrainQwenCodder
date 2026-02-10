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
    // 使用 originX: 1 让文本右对齐
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每 2.5 秒加 8 分
    this.scoreTimer = this.time.addEvent({
      delay: 2500,           // 2.5 秒 = 2500 毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示信息（可选）
    this.add.text(400, 300, 'Score increases by 8 every 2.5 seconds', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 添加视觉反馈 - 背景装饰
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 0.8);
    graphics.fillRoundedRect(10, 10, 200, 60, 10);
    
    // 添加当前时间显示以验证定时器工作
    this.timerText = this.add.text(20, 20, 'Next +8 in: 2.5s', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });

    // 记录开始时间用于倒计时显示
    this.lastScoreTime = 0;
  }

  addScore() {
    // 增加分数
    this.score += 8;
    
    // 更新分数文本
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });

    // 重置倒计时
    this.lastScoreTime = this.time.now;
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.scoreTimer) {
      const elapsed = time - this.lastScoreTime;
      const remaining = Math.max(0, 2.5 - elapsed / 1000);
      this.timerText.setText('Next +8 in: ' + remaining.toFixed(1) + 's');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露 score 用于验证（可在控制台通过 game.scene.scenes[0].score 访问）