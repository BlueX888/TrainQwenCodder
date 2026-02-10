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
    // 使用 originX: 1 使文本右对齐，便于固定在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20 像素
      20, // 距离顶部 20 像素
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本原点为右上角，方便定位
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件，每 1000ms（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000, // 1 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加视觉反馈：添加背景色便于查看
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    bg.setDepth(-1);

    // 添加提示文本
    const infoText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 10 every second',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }
    );
    infoText.setOrigin(0.5);
  }

  addScore() {
    // 每次增加 10 分
    this.score += 10;
    gameScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加视觉反馈：分数增加时文本闪烁效果
    this.scoreText.setScale(1.2);
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.out'
    });
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
  backgroundColor: '#000000',
  scene: GameScene,
  // 可选：使用 HEADLESS 模式进行测试
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出分数用于验证（在 Node.js 环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => gameScore };
}