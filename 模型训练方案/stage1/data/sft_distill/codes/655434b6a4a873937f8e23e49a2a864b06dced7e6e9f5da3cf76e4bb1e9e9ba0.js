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
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧位置
      20, // 上方位置
      'Score: 0',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本锚点为右上角，使其从右侧对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每2秒自动加20分
    this.scoreTimer = this.time.addEvent({
      delay: 2000, // 2秒 = 2000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本（可选）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1); // 设置为背景层
  }

  addScore() {
    // 增加分数
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
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
  backgroundColor: '#222222',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);