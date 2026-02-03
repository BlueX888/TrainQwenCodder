class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建分数文本对象，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // x坐标：屏幕右侧
      20,                            // y坐标：屏幕顶部
      `Score: ${this.score}`,        // 初始文本
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本锚点为右上角，方便对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件，每1.5秒自动加8分
    this.scoreTimer = this.time.addEvent({
      delay: 1500,           // 延迟1.5秒（1500毫秒）
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调函数的作用域
      loop: true             // 循环执行
    });

    // 添加背景色以便更好地看到文本
    this.cameras.main.setBackgroundColor('#2d2d2d');
    
    // 在控制台输出初始状态
    console.log('Game started. Score:', this.score);
  }

  // 加分方法
  addScore() {
    this.score += 8;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log('Score updated:', this.score); // 便于验证
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
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);