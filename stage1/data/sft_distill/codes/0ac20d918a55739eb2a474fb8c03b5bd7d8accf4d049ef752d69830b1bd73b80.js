// 全局变量用于状态验证
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
    gameScore = this.score;

    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，方便定位在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每4秒加10分
    this.scoreTimer = this.time.addEvent({
      delay: 4000,           // 4秒 = 4000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示信息
    this.add.text(400, 300, 'Score will increase by 10\nevery 4 seconds', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 显示计时器进度（可选，用于调试）
    this.timerText = this.add.text(400, 400, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 10;
    gameScore = this.score;
    
    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加视觉反馈：分数增加时短暂放大
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    console.log('Score increased to:', this.score);
  }

  update(time, delta) {
    // 显示定时器进度（可选）
    if (this.scoreTimer) {
      const progress = this.scoreTimer.getProgress();
      const remaining = this.scoreTimer.getRemaining();
      this.timerText.setText(
        'Next score in: ' + (remaining / 1000).toFixed(1) + 's\n' +
        'Progress: ' + (progress * 100).toFixed(0) + '%'
      );
    }
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

// 导出 score 用于验证（在 Node.js 环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => gameScore };
}