class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 10, // 距离右边缘 10 像素
      10, // 距离顶部 10 像素
      'Score: 0',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    );
    
    // 设置文本右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每 1 秒加 8 分
    this.scoreTimer = this.time.addEvent({
      delay: 1000, // 1000 毫秒 = 1 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便观察
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1);

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 8 every second',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加 8 分
    this.score += 8;
    
    // 更新分数文本
    this.scoreText.setText('Score: ' + this.score);
    
    // 在控制台输出以便验证
    console.log('Current Score:', this.score);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
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