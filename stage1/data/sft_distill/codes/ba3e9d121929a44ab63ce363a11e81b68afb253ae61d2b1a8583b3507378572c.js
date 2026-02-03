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
    currentScore = this.score;

    // 创建分数文本，放置在右上角
    // 使用 originX: 1 让文本右对齐，便于定位在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '80px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每2秒加10分
    this.scoreTimer = this.time.addEvent({
      delay: 2000,           // 2秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 放到最底层
  }

  addScore() {
    // 每次加10分
    this.score += 10;
    currentScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台便于验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 可选：在这里可以添加其他更新逻辑
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

// 导出分数获取函数供外部验证
function getScore() {
  return currentScore;
}