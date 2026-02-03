// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.gameTime = 0;
    this.pauseCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      isPaused: false,
      pauseCount: 0,
      gameTime: 0,
      ballPosition: { x: 0, y: 0 }
    };

    // 创建一个移动的小球用于验证暂停效果
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ball');
    this.ball.setVelocity = (vx, vy) => {
      this.ball.velocityX = vx;
      this.ball.velocityY = vy;
    };
    this.ball.setVelocity(100, 80);

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 添加鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 添加说明文字
    this.add.text(10, 10, 'Click Left Mouse Button to Pause/Resume', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加状态显示文字
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#ffff00'
    });
  }

  createPauseOverlay() {
    // 创建黄色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0xffff00, 0.5);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加暂停信息文字
    this.pauseInfoText = this.add.text(400, 380, 'Click to Resume', {
      fontSize: '24px',
      color: '#000000'
    });
    this.pauseInfoText.setOrigin(0.5);
    this.pauseInfoText.setDepth(101);
    this.pauseInfoText.setVisible(false);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.scene.pause();
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      this.pauseInfoText.setVisible(true);
      this.pauseCount++;

      // 更新信号
      window.__signals__.isPaused = true;
      window.__signals__.pauseCount = this.pauseCount;

      console.log(JSON.stringify({
        event: 'game_paused',
        pauseCount: this.pauseCount,
        gameTime: this.gameTime
      }));
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      this.pauseInfoText.setVisible(false);
      this.scene.resume();

      // 更新信号
      window.__signals__.isPaused = false;

      console.log(JSON.stringify({
        event: 'game_resumed',
        pauseCount: this.pauseCount,
        gameTime: this.gameTime
      }));
    }
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime += delta;

    // 更新小球位置（模拟简单物理）
    this.ball.x += this.ball.velocityX * delta / 1000;
    this.ball.y += this.ball.velocityY * delta / 1000;

    // 边界反弹
    if (this.ball.x <= 20 || this.ball.x >= 780) {
      this.ball.velocityX *= -1;
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
    }
    if (this.ball.y <= 20 || this.ball.y >= 580) {
      this.ball.velocityY *= -1;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
    }

    // 更新状态文字
    this.statusText.setText(
      `Time: ${(this.gameTime / 1000).toFixed(1)}s | Pauses: ${this.pauseCount}`
    );

    // 更新信号
    window.__signals__.gameTime = this.gameTime;
    window.__signals__.ballPosition = {
      x: Math.round(this.ball.x),
      y: Math.round(this.ball.y)
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

// 输出初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  width: config.width,
  height: config.height
}));