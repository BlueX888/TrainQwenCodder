// 全局变量用于验证
let currentScore = 0;

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
    currentScore = 0;

    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，并留出一些边距
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件：每1秒（1000毫秒）触发一次
    this.timerEvent = this.time.addEvent({
      delay: 1000,              // 1秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,      // 回调函数的作用域
      loop: true                // 循环执行
    });

    // 添加背景以便更好地看到分数
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加提示文本
    this.add.text(400, 300, 'Score auto-increments\nevery second (+12)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#16c79a',
      align: 'center'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次增加12分
    this.score += 12;
    currentScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加一个小的缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
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
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  // 如果需要在 Node.js 环境运行，使用 HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证函数
function getScore() {
  return currentScore;
}

// 如果在 Node.js 环境中，可以导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore };
}