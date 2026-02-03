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
      this.cameras.main.width - 20, // 右侧边距 20
      20, // 顶部边距 20
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本右对齐（以文本右边缘为锚点）
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每 1000ms (1秒) 执行一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 延迟 1000 毫秒
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调函数的作用域
      loop: true             // 循环执行
    });

    // 添加调试信息（可选）
    console.log('Auto-scoring system started: +12 points per second');
  }

  addScore() {
    // 每次调用增加 12 分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台便于验证
    console.log('Current score:', this.score);
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
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);