class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.gameTime = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x222222, 1);
    background.fillRect(0, 0, width, height);

    // 创建移动的游戏对象（用于验证暂停效果）
    this.createMovingBalls();

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 30, 'Click to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  createMovingBalls() {
    const { width, height } = this.cameras.main;
    
    // 创建多个移动的小球
    this.balls = [];
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    
    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillCircle(0, 0, 15);
      graphics.generateTexture(`ball${i}`, 30, 30);
      graphics.destroy();

      const ball = this.add.sprite(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 100),
        `ball${i}`
      );

      // 设置随机速度
      ball.velocityX = Phaser.Math.Between(-200, 200);
      ball.velocityY = Phaser.Math.Between(-200, 200);
      
      // 确保速度不为零
      if (Math.abs(ball.velocityX) < 50) ball.velocityX = 100;
      if (Math.abs(ball.velocityY) < 50) ball.velocityY = 100;

      this.balls.push(ball);
    }
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.resumeGame();
    } else {
      // 暂停游戏
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;

    const { width, height } = this.cameras.main;

    // 创建蓝色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0000ff, 0.6);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(1000);

    // 创建 "PAUSED" 文字
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(1001);

    // 创建提示文本
    this.pauseHintText = this.add.text(width / 2, height / 2 + 60, 'Click to Resume', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.pauseHintText.setOrigin(0.5);
    this.pauseHintText.setDepth(1001);

    console.log('Game Paused at time:', this.gameTime);
  }

  resumeGame() {
    this.isPaused = false;

    // 移除覆盖层和文字
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    if (this.pauseText) {
      this.pauseText.destroy();
      this.pauseText = null;
    }

    if (this.pauseHintText) {
      this.pauseHintText.destroy();
      this.pauseHintText = null;
    }

    console.log('Game Resumed at time:', this.gameTime);
  }

  update(time, delta) {
    // 如果游戏暂停，不更新游戏逻辑
    if (this.isPaused) {
      return;
    }

    // 更新游戏时间（状态信号）
    this.gameTime += delta;

    const { width, height } = this.cameras.main;

    // 更新所有小球的位置
    this.balls.forEach(ball => {
      // 移动小球
      ball.x += ball.velocityX * (delta / 1000);
      ball.y += ball.velocityY * (delta / 1000);

      // 边界碰撞检测
      if (ball.x <= 15 || ball.x >= width - 15) {
        ball.velocityX *= -1;
        ball.x = Phaser.Math.Clamp(ball.x, 15, width - 15);
      }

      if (ball.y <= 15 || ball.y >= height - 15) {
        ball.velocityY *= -1;
        ball.y = Phaser.Math.Clamp(ball.y, 15, height - 15);
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    const seconds = (this.gameTime / 1000).toFixed(2);
    const status = this.isPaused ? 'PAUSED' : 'RUNNING';
    this.statusText.setText([
      `Status: ${status}`,
      `Time: ${seconds}s`,
      `Balls: ${this.balls.length}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);