// 完整的 Phaser3 自动加分系统
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本显示，位置在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
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

    // 创建定时器事件：每2.5秒（2500毫秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 2500, // 2.5秒
      callback: this.addScore, // 回调函数
      callbackScope: this, // 回调函数的作用域
      loop: true // 循环执行
    });

    // 添加背景色以便更好地查看效果
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 在控制台输出初始状态
    console.log('Game started. Score:', this.score);
  }

  // 加分函数
  addScore() {
    this.score += 15;
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出当前分数到控制台，便于验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 此场景无需每帧更新逻辑
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 如果需要在无头环境测试，可以改为 Phaser.HEADLESS
  // type: Phaser.HEADLESS
};

// 创建游戏实例
const game = new Phaser.Game(config);