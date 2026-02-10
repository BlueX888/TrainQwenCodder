class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态变量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
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
    
    // 设置文本原点为右上角，方便对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每 1000ms (1秒) 执行一次
    this.timerEvent = this.time.addEvent({
      delay: 1000,           // 延迟时间（毫秒）
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调函数的作用域
      loop: true             // 循环执行
    });

    // 添加调试信息（可选）
    console.log('自动加分系统已启动，每秒 +10 分');
  }

  addScore() {
    // 每次调用增加 10 分
    this.score += 10;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台便于验证
    console.log('当前分数:', this.score);
  }

  update(time, delta) {
    // 本示例不需要在 update 中处理逻辑
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