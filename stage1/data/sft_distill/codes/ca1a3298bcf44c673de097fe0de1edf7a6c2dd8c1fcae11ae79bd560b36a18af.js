// 完整的 Phaser3 自动加分系统
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 初始化分数变量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建分数文本显示，位置在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
      'Score: 0',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本锚点为右上角，便于对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每500毫秒（0.5秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 500, // 延迟时间（毫秒）
      callback: this.addScore, // 回调函数
      callbackScope: this, // 回调函数的作用域
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // 将文本置于最上层
    this.scoreText.setDepth(1);

    // 打印初始状态到控制台
    console.log('Game started. Initial score:', this.score);
  }

  // 加分函数
  addScore() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    
    // 每次加分时打印到控制台，方便验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本例中不需要 update 逻辑，但保留以展示完整生命周期
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  // 可选：如果需要在 Node.js 环境中测试，可以使用 HEADLESS 模式
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 game 实例以便外部访问和验证状态
if (typeof window !== 'undefined') {
  window.game = game;
}