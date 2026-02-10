class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载资源
  }

  create() {
    // 创建分数文本显示在右上角
    // 使用 originX=1 使文本右对齐，并留出边距
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 1.5 秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 1500, // 1.5 秒 = 1500 毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 暴露信号供验证
    this.updateSignals();

    // 添加背景色以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 确保背景在最底层
  }

  addScore() {
    // 每次增加 12 分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 更新信号
    this.updateSignals();
    
    // 输出日志 JSON 供验证
    console.log(JSON.stringify({
      event: 'score_updated',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    // 暴露可验证的信号
    if (typeof window !== 'undefined') {
      window.__signals__ = {
        score: this.score,
        timerDelay: this.timerEvent ? this.timerEvent.delay : 1500,
        timerElapsed: this.timerEvent ? this.timerEvent.elapsed : 0,
        timerRepeatCount: this.timerEvent ? this.timerEvent.repeatCount : -1
      };
    }
  }

  update(time, delta) {
    // 每帧更新信号中的 elapsed 时间
    if (this.timerEvent) {
      this.updateSignals();
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化信号对象
if (typeof window !== 'undefined') {
  window.__signals__ = {
    score: 0,
    timerDelay: 1500,
    timerElapsed: 0,
    timerRepeatCount: -1
  };
}