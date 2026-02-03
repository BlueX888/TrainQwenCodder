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
      this.cameras.main.width - 20, // x坐标：屏幕右侧减去边距
      20, // y坐标：屏幕顶部加上边距
      'Score: 0',
      {
        fontSize: '64px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本锚点为右上角，便于对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每1秒（1000ms）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000, // 延迟1000毫秒
      callback: this.updateScore, // 回调函数
      callbackScope: this, // 回调函数的作用域
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 可选：添加一些视觉元素来验证游戏正在运行
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 0.3);
    graphics.fillCircle(100, 100, 50);
  }

  updateScore() {
    // 每次调用增加12分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Current Score:', this.score);
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
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);