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
    // 在右上角创建分数文本（字体大小24）
    // 使用 originX: 1 使文本右对齐，便于放置在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器：每4秒（4000ms）自动加5分
    this.scoreTimer = this.time.addEvent({
      delay: 4000,           // 4秒
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加调试信息（可选）
    console.log('自动加分系统已启动：每4秒 +5分');
  }

  addScore() {
    // 每次加5分
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出日志便于验证
    console.log('分数更新:', this.score);
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
    // 但保留此方法以符合完整的生命周期
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.HEADLESS,  // 无头模式，适合测试
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 如果需要在浏览器中可视化运行，将 type 改为 Phaser.AUTO
// type: Phaser.AUTO