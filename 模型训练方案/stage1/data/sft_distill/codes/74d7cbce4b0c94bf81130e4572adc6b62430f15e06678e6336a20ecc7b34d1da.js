class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = window.__signals__ || {};
    window.__signals__.score = this.score;

    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，方便定位在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边 20 像素
      20, // 距离顶部 20 像素
      `Score: ${this.score}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每 1.5 秒执行一次
    this.scoreTimer = this.time.addEvent({
      delay: 1500, // 1.5 秒 = 1500 毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加视觉反馈：背景和说明文字
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Auto Score System\n+12 every 1.5 seconds',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#00ff00',
        align: 'center'
      }
    ).setOrigin(0.5);

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  addScore() {
    // 每次增加 12 分
    this.score += 12;

    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新验证信号
    window.__signals__.score = this.score;

    // 输出日志用于验证
    console.log(JSON.stringify({
      event: 'score_update',
      score: this.score,
      timestamp: Date.now()
    }));

    // 添加视觉反馈：分数增加时文本闪烁
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 持续更新验证信号（确保外部可以实时读取）
    window.__signals__.score = this.score;
    window.__signals__.timerProgress = this.scoreTimer.getProgress();
    window.__signals__.elapsed = this.scoreTimer.getElapsed();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  // 可选：使用 HEADLESS 模式进行无渲染测试
  // type: Phaser.HEADLESS,
};

// 启动游戏
const game = new Phaser.Game(config);

// 暴露游戏实例用于调试
window.__game__ = game;