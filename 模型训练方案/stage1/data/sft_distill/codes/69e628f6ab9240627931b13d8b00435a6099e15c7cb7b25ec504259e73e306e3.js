// 全局变量用于验证
let gameScore = 0;

class ScoreScene extends Phaser.Scene {
  constructor() {
    super('ScoreScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化分数
    this.score = 0;
    gameScore = this.score;

    // 创建分数文本，定位到右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20像素
      20, // 上边距20像素
      'Score: 0',
      {
        fontSize: '64px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本原点为右上角，方便定位
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每4秒加10分
    this.scoreTimer = this.time.addEvent({
      delay: 4000,           // 4秒 = 4000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 添加提示信息（可选）
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 10 every 4 seconds',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 10;
    gameScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 控制台输出用于调试
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ScoreScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出分数供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameScore: () => gameScore };
}