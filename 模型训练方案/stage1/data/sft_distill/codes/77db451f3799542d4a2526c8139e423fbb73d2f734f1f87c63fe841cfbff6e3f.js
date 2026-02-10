class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      lastUpdateTime: 0,
      updateCount: 0
    };

    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20px
      20, // 上边距20px
      'Score: 0',
      {
        fontSize: '64px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本原点为右上角，便于对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每4秒加5分
    this.scoreTimer = this.time.addEvent({
      delay: 4000, // 4秒 = 4000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 输出初始日志
    console.log(JSON.stringify({
      type: 'SCORE_INIT',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  addScore() {
    // 增加分数
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 更新信号对象
    window.__signals__.score = this.score;
    window.__signals__.lastUpdateTime = Date.now();
    window.__signals__.updateCount++;

    // 输出日志供验证
    console.log(JSON.stringify({
      type: 'SCORE_UPDATE',
      score: this.score,
      updateCount: window.__signals__.updateCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 持续更新信号状态
    if (window.__signals__) {
      window.__signals__.currentTime = time;
      window.__signals__.timerElapsed = this.scoreTimer.getElapsed();
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

// 创建游戏实例
new Phaser.Game(config);