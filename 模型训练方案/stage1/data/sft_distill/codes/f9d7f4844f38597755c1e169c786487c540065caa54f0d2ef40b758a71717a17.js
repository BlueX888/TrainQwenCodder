class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    // 使用 setOrigin(1, 0) 让文本右对齐
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
      'Score: 0',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每4秒触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score +5 every 4 seconds',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }
    ).setOrigin(0.5);

    // 添加背景色以便观察
    this.cameras.main.setBackgroundColor('#1a1a2e');
  }

  addScore() {
    // 每次调用增加5分
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 控制台输出，便于验证
    console.log('Score updated:', this.score);
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
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);