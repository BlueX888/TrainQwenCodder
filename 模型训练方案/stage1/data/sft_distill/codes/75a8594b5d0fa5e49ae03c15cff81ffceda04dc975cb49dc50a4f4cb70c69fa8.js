class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态变量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本显示在右上角
    // 使用 originX: 1 让文本右对齐，方便定位到右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20px
      20, // 距离顶部 20px
      `Score: ${this.score}`,
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件：每 1.5 秒（1500毫秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1); // 确保背景在最底层
  }

  // 加分方法
  addScore() {
    this.score += 8;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 添加简单的缩放动画效果，让加分更明显
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
    // 可以在这里添加其他更新逻辑
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