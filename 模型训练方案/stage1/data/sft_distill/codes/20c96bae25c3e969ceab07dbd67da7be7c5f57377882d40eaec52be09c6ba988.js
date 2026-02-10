class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.gameTime = 0; // 可验证的状态信号
    this.ballMoveCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建一个移动的小球作为游戏运行状态的可视化验证
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    this.ball = this.add.sprite(width / 2, height / 2, 'ball');
    this.ballVelocity = { x: 2, y: 1.5 };

    // 创建暂停覆盖层（绿色半透明背景）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ff00, 0.7);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加游戏时间显示
    this.timeText = this.add.text(10, 10, 'Time: 0.0s', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.timeText.setDepth(50);

    // 添加状态显示
    this.statusText = this.add.text(10, 40, 'Ball Moves: 0', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.statusText.setDepth(50);

    // 添加提示文字
    this.hintText = this.add.text(width / 2, height - 30, 'Click to Pause/Resume', {
      fontSize: '20px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.hintText.setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    console.log('Game started. Click to pause/resume.');
  }

  update(time, delta) {
    // 更新游戏时间（只在未暂停时更新）
    if (!this.isPaused) {
      this.gameTime += delta;
      this.timeText.setText(`Time: ${(this.gameTime / 1000).toFixed(1)}s`);

      // 移动小球
      this.ball.x += this.ballVelocity.x;
      this.ball.y += this.ballVelocity.y;
      this.ballMoveCount++;

      // 边界检测和反弹
      const { width, height } = this.cameras.main;
      if (this.ball.x <= 20 || this.ball.x >= width - 20) {
        this.ballVelocity.x *= -1;
        this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, width - 20);
      }
      if (this.ball.y <= 20 || this.ball.y >= height - 20) {
        this.ballVelocity.y *= -1;
        this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, height - 20);
      }

      // 更新状态显示
      this.statusText.setText(`Ball Moves: ${this.ballMoveCount}`);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      
      // 暂停场景的物理和更新（通过停止时间流逝）
      this.scene.pause();
      
      console.log(`Game PAUSED at ${(this.gameTime / 1000).toFixed(1)}s, Ball moves: ${this.ballMoveCount}`);
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      
      // 恢复场景
      this.scene.resume();
      
      console.log(`Game RESUMED at ${(this.gameTime / 1000).toFixed(1)}s`);
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
  // 禁用物理系统以保持简单
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);