class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20 像素
      20, // 距离顶部 20 像素
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );

    // 设置文本的原点为右上角，这样文本会向左延伸
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每 2 秒触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 2000, // 2000 毫秒 = 2 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加提示信息（可选，用于调试）
    this.add.text(
      20,
      20,
      'Auto-scoring system\n+10 every 2 seconds',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }
    );

    console.log('Auto-scoring system initialized');
  }

  addScore() {
    // 每次增加 10 分
    this.score += 10;

    // 更新显示文本
    this.scoreText.setText('Score: ' + this.score);

    // 输出日志便于验证
    console.log('Score updated:', this.score);

    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);