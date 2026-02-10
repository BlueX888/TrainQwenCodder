class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本显示在右上角
    // 使用 setOrigin(1, 0) 使文本右对齐
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 1.5 秒（1500 毫秒）加 10 分
    this.timerEvent = this.time.addEvent({
      delay: 1500,              // 1.5 秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,      // 回调函数的作用域
      loop: true                // 循环执行
    });

    // 添加提示文本（可选）
    this.add.text(400, 300, 'Auto-scoring system\n+10 points every 1.5s', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 输出初始状态到控制台（用于验证）
    console.log('Initial score:', this.score);
  }

  addScore() {
    // 每次调用增加 10 分
    this.score += 10;
    
    // 更新显示文本
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台（用于验证）
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本示例不需要 update 逻辑
    // 但可以在这里添加其他游戏逻辑
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

// 暴露 game 实例以便外部访问和验证
window.game = game;