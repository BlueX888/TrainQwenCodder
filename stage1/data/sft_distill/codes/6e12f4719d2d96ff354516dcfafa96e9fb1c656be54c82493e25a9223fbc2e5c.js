class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本显示在右上角
    // 使用 originX: 1 使文本右对齐，便于固定在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每1秒（1000ms）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 1秒间隔
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加视觉反馈：显示定时器状态的指示器
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 0.3);
    graphics.fillCircle(750, 70, 15);
    
    // 添加说明文字
    this.add.text(400, 300, 'Auto Scoring System', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(400, 340, '+12 points every second', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加12分
    this.score += 12;
    
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
    // 可选：在这里添加其他更新逻辑
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

// 暴露 score 供外部验证（可选）
// 可通过 game.scene.scenes[0].score 访问当前分数