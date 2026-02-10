// 全局变量用于状态验证
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
    currentScore = 0;

    // 在屏幕右上角创建分数文本
    // 使用右对齐，距离右边缘 20 像素，距离顶部 20 像素
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'right'
    });
    
    // 设置文本原点为右上角，方便右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每 1000ms（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 1秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示文本
    this.add.text(400, 300, 'Score auto increases every second', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次加 20 分
    this.score += 20;
    currentScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 控制台输出用于调试验证
    console.log('Score updated:', this.score);
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

// 导出验证函数（可选，用于测试）
function getScore() {
  return currentScore;
}