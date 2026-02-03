class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 在右上角创建分数文本
    // 使用 setOrigin(1, 0) 使文本右对齐
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边 20 像素
      20, // 距离顶部 20 像素
      'Score: 0',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 2.5 秒加 8 分
    this.timerEvent = this.time.addEvent({
      delay: 2500, // 2.5 秒 = 2500 毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    this.cameras.main.setBackgroundColor('#333333');

    // 添加一个提示文本说明游戏正在运行
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Auto-scoring System\nScore increases by 8 every 2.5 seconds',
      {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加 8 分
    this.score += 8;
    
    // 更新分数文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Score updated:', this.score);
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
  backgroundColor: '#000000',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);