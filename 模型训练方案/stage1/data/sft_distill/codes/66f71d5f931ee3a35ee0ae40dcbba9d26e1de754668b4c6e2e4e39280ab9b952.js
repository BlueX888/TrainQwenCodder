class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20像素
      20, // 上边距20像素
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    // 设置文本右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每2秒加10分
    this.scoreTimer = this.time.addEvent({
      delay: 2000, // 2秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地查看分数
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1);

    // 添加提示文本
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score auto-increments by 10\nevery 2 seconds',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加10分
    this.score += 10;
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);