// 全局变量用于验证状态
let currentScore = 0;

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
    currentScore = this.score;

    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，便于定位在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每2秒触发一次，循环执行
    this.scoreTimer = this.time.addEvent({
      delay: 2000,           // 2秒 = 2000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加背景色以便更好地观察
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 置于底层

    // 添加提示信息
    this.add.text(400, 300, 'Score auto-increments\nevery 2 seconds (+3)', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次加3分
    this.score += 3;
    currentScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加一个简单的缩放动画效果，让加分更明显
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  // 如果需要在 Node.js 环境运行，使用 Phaser.HEADLESS
  // type: Phaser.HEADLESS
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 currentScore 供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, currentScore };
}