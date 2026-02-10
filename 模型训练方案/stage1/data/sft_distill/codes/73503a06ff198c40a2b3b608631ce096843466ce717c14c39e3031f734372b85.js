// 全局变量用于验证状态
let gameScore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化分数
    this.score = 0;
    gameScore = 0;

    // 在右上角创建分数文本
    // 设置字体大小为 32，右对齐，距离右边缘 20 像素
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, 
      20, 
      'Score: 0', 
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本原点为右上角，便于右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每 500ms (0.5秒) 执行一次
    this.scoreTimer = this.time.addEvent({
      delay: 500,                    // 延迟 500 毫秒
      callback: this.addScore,       // 回调函数
      callbackScope: this,           // 回调函数的作用域
      loop: true                     // 循环执行
    });

    // 添加背景色以便更好地看到文本
    this.cameras.main.setBackgroundColor('#2d2d2d');
  }

  addScore() {
    // 每次加 12 分
    this.score += 12;
    gameScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 在控制台输出，便于调试验证
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
  scene: GameScene,
  // 如果需要在 Node.js 环境运行，可以使用 Phaser.HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出分数变量供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => gameScore };
}