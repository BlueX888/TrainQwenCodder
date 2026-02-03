class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，放置在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20像素
      20, // 上边距20像素
      'Score: 0',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    // 设置文本锚点为右上角
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每1000ms（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 1秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 暴露信号供验证
    window.__signals__ = window.__signals__ || {};
    window.__signals__.score = () => this.score;
    window.__signals__.scoreText = () => this.scoreText.text;
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'game_started',
      initialScore: this.score,
      timerDelay: 1000,
      scoreIncrement: 5
    }));
  }

  addScore() {
    // 每次增加5分
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出日志记录分数变化
    console.log(JSON.stringify({
      event: 'score_updated',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 持续更新 signals
    if (window.__signals__) {
      window.__signals__.currentScore = this.score;
      window.__signals__.timerProgress = this.scoreTimer.getProgress();
      window.__signals__.timerElapsed = this.scoreTimer.getElapsed();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露游戏实例供外部访问
window.__game__ = game;