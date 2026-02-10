class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，定位到右上角
    this.scoreText = this.add.text(0, 20, 'Score: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // 设置文本原点为右上角，方便定位
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setPosition(this.cameras.main.width - 20, 20);

    // 创建自动加分定时器：每2秒加3分
    this.autoScoreTimer = this.time.addEvent({
      delay: 2000,           // 2秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示文本
    const hintText = this.add.text(400, 300, 'Auto +3 every 2 seconds', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    hintText.setOrigin(0.5);
  }

  addScore() {
    // 每次调用加3分
    this.score += 3;
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
    // 本示例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);