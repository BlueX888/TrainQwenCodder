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
    // 使用 originX: 1 让文本右对齐，方便定位到右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 1000ms (1秒) 触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 1秒间隔
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调函数的作用域
      loop: true             // 循环执行
    });

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);
  }

  addScore() {
    // 每次调用增加 8 分
    this.score += 8;
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
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

// 暴露 scene 实例用于验证（可选）
// 可通过 game.scene.scenes[0].score 访问分数