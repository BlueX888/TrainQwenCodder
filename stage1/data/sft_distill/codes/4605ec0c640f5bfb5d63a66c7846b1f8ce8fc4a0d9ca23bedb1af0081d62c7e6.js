class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建移动的球体（使用 Graphics 绘制）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(100, 300, 'ball');
    this.ball.setData('velocityX', 200);
    this.ball.setData('velocityY', 150);

    // 创建边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 添加分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff'
    });

    // 创建暂停覆盖层（白色半透明背景）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0xffffff, 0.8);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fill: '#000000',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加暂停提示文字
    this.add.text(400, 550, 'Press any arrow key to pause/resume', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 标记键是否已按下（防止重复触发）
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update(time, delta) {
    // 检测方向键按下（边缘检测，只在按下瞬间触发）
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.togglePause();
      this.keyPressed.up = true;
    }
    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.togglePause();
      this.keyPressed.down = true;
    }
    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.togglePause();
      this.keyPressed.left = true;
    }
    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.togglePause();
      this.keyPressed.right = true;
    }

    // 重置键状态
    if (!this.cursors.up.isDown) this.keyPressed.up = false;
    if (!this.cursors.down.isDown) this.keyPressed.down = false;
    if (!this.cursors.left.isDown) this.keyPressed.left = false;
    if (!this.cursors.right.isDown) this.keyPressed.right = false;

    // 如果游戏未暂停，更新球体位置
    if (!this.isPaused) {
      const velocityX = this.ball.getData('velocityX');
      const velocityY = this.ball.getData('velocityY');

      this.ball.x += velocityX * delta / 1000;
      this.ball.y += velocityY * delta / 1000;

      // 边界碰撞检测
      if (this.ball.x <= 20 || this.ball.x >= 780) {
        this.ball.setData('velocityX', -velocityX);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
      if (this.ball.y <= 20 || this.ball.y >= 580) {
        this.ball.setData('velocityY', -velocityY);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }

      // 限制球体在边界内
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 显示暂停覆盖层
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      console.log('Game Paused - Score:', this.score);
    } else {
      // 隐藏暂停覆盖层
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      console.log('Game Resumed - Score:', this.score);
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

new Phaser.Game(config);