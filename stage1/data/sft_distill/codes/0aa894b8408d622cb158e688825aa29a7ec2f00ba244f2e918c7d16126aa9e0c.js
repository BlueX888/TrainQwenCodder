class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧，留20像素边距
      20, // 顶部20像素
      'Score: 0',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    // 设置文本原点为右上角，方便定位
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每1.5秒（1500毫秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1500, // 1.5秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 暴露信号用于验证
    window.__signals__ = window.__signals__ || {};
    window.__signals__.score = () => this.score;
    window.__signals__.scoreText = () => this.scoreText.text;
    window.__signals__.timerElapsed = () => this.scoreTimer.elapsed;
    window.__signals__.timerDelay = () => this.scoreTimer.delay;

    // 打印初始日志
    console.log(JSON.stringify({
      type: 'init',
      score: this.score,
      timerDelay: 1500,
      timestamp: Date.now()
    }));
  }

  addScore() {
    // 每次加12分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);

    // 打印日志用于验证
    console.log(JSON.stringify({
      type: 'score_update',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 持续更新信号
    if (window.__signals__) {
      window.__signals__.currentScore = this.score;
      window.__signals__.timerProgress = this.scoreTimer.getProgress();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 全局暴露游戏实例用于测试
window.__game__ = game;