class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距 20px
      20, // 上边距 20px
      'Score: 0',
      {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本原点为右上角，方便右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器：每 4 秒加 5 分
    this.scoreTimer = this.time.addEvent({
      delay: 4000, // 4 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 初始化验证信号
    this.updateSignals();

    // 添加视觉反馈：显示定时器进度条（可选）
    this.createProgressBar();

    console.log('Game started - Score will increase by 5 every 4 seconds');
  }

  addScore() {
    // 增加分数
    this.score += 5;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 添加缩放动画效果
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // 更新验证信号
    this.updateSignals();

    // 输出日志
    console.log(JSON.stringify({
      event: 'score_updated',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  createProgressBar() {
    // 创建进度条背景
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x222222, 0.8);
    this.progressBg.fillRect(this.cameras.main.width - 220, 100, 200, 20);

    // 创建进度条填充
    this.progressBar = this.add.graphics();
  }

  update(time, delta) {
    // 更新进度条显示
    if (this.scoreTimer && this.progressBar) {
      const progress = this.scoreTimer.getProgress();
      
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(
        this.cameras.main.width - 220,
        100,
        200 * progress,
        20
      );
    }
  }

  updateSignals() {
    // 暴露验证信号到全局
    window.__signals__ = {
      score: this.score,
      timerDelay: this.scoreTimer ? this.scoreTimer.delay : 4000,
      timerRepeat: this.scoreTimer ? this.scoreTimer.loop : true,
      scoreIncrement: 5,
      lastUpdate: Date.now()
    };
  }
}

// 游戏配置
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

// 初始化全局信号对象
window.__signals__ = {
  score: 0,
  timerDelay: 4000,
  timerRepeat: true,
  scoreIncrement: 5,
  lastUpdate: Date.now()
};

console.log('Phaser game initialized - Check window.__signals__ for verification');