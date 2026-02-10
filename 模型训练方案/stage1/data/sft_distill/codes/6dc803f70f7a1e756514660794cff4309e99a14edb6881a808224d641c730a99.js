class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，便于固定在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件：每2秒加8分
    this.timerEvent = this.time.addEvent({
      delay: 2000,           // 2秒 = 2000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加背景色以便于观察
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 确保背景在最底层

    // 添加提示信息
    this.add.text(400, 300, 'Score auto-increases by 8 every 2 seconds', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加8分
    this.score += 8;
    // 更新显示文本
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台便于验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);