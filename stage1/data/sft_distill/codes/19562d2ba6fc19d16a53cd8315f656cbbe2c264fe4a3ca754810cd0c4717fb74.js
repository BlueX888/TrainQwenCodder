// 全局变量用于验证状态
let gameScore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化分数
    this.score = 0;
    gameScore = 0;

    // 在右上角创建分数文本
    // x: 780 (靠右，留20px边距), y: 20 (顶部留20px边距)
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // 设置文本右对齐（originX: 1 表示以右边为锚点）
    this.scoreText.setOrigin(1, 0);

    // 创建自动加分定时器
    // delay: 1000ms (1秒)
    // loop: true (循环执行)
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: this.addScore,
      callbackScope: this,
      loop: true
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
  }

  addScore() {
    // 每次加20分
    this.score += 20;
    gameScore = this.score;
    
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
  backgroundColor: '#222222',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);