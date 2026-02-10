class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，右上角对齐
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20像素
      20, // 上边距20像素
      'Score: 0',
      {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    // 设置文本右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件，每4秒加5分
    this.scoreTimer = this.time.addEvent({
      delay: 4000, // 4秒 = 4000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 暴露信号用于验证
    window.__signals__ = {
      score: () => this.score,
      timerElapsed: () => this.scoreTimer.elapsed,
      timerDelay: () => this.scoreTimer.delay
    };

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  addScore() {
    // 增加分数
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);

    // 输出日志用于验证
    console.log(JSON.stringify({
      event: 'score_updated',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新信号（确保实时性）
    if (window.__signals__) {
      window.__signals__.score = () => this.score;
      window.__signals__.timerElapsed = () => this.scoreTimer.elapsed;
    }
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