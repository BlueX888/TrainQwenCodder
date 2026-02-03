class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，定位到右上角
    // 使用 setOrigin(1, 0) 使文本右对齐
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 1.5 秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 1500,              // 1.5 秒 = 1500 毫秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,      // 回调函数的作用域
      loop: true                // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 设置为背景层

    // 添加提示信息
    this.add.text(400, 300, 'Auto-scoring system running\nScore increases by 10 every 1.5 seconds', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加 10 分
    this.score += 10;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加简单的缩放动画效果
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
    // 本例中无需每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

const game = new Phaser.Game(config);