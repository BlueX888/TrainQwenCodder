class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态变量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建分数文本对象，显示在屏幕右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧边距 20px
      20, // 上边距 20px
      'Score: 0',
      {
        fontSize: '80px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本右对齐（相对于锚点）
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每 1000ms（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 延迟 1000ms
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加调试信息（可选）
    console.log('Auto-score system initialized');
  }

  addScore() {
    // 每次触发增加 12 分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出日志便于验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本例不需要 update 逻辑，但保留以符合规范
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
new Phaser.Game(config);