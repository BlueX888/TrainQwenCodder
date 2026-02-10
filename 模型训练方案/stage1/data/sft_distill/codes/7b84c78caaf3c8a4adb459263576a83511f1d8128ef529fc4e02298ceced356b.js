class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.movingObjects = [];
    this.score = 0;
    this.gameTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建游戏状态显示
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.timeText = this.add.text(10, 40, 'Time: 0s', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建多个移动的游戏对象（用于验证暂停效果）
    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(0, 0, 20);
      graphics.generateTexture(`ball${i}`, 40, 40);
      graphics.destroy();

      const ball = this.physics.add.sprite(
        100 + i * 150,
        100 + i * 80,
        `ball${i}`
      );
      
      // 设置随机速度（使用固定种子确保可重现）
      const velocityX = 100 + (i * 50);
      const velocityY = 80 + (i * 30);
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);

      this.movingObjects.push(ball);
    }

    // 创建玩家角色
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff6b6b, 1);
    playerGraphics.fillRect(0, 0, 50, 50);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 创建暂停提示文本
    this.hintText = this.add.text(400, 570, 'Click Left Mouse Button to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 添加碰撞检测（增加分数）
    this.physics.add.overlap(this.player, this.movingObjects, this.collectBall, null, this);
  }

  update(time, delta) {
    // 如果游戏暂停，不执行更新逻辑
    if (this.isPaused) {
      return;
    }

    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText(`Time: ${Math.floor(this.gameTime)}s`);

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectBall(player, ball) {
    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 重置球的位置
    ball.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 250)
    );
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.showPauseOverlay();
      this.physics.pause();
    } else {
      // 继续游戏
      this.hidePauseOverlay();
      this.physics.resume();
    }
  }

  showPauseOverlay() {
    // 创建半透明蓝色覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0066cc, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(1000);

    // 创建 PAUSED 文本
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(1001);

    // 创建提示文本
    this.resumeHint = this.add.text(400, 380, 'Click to Resume', {
      fontSize: '28px',
      color: '#ffffff'
    });
    this.resumeHint.setOrigin(0.5);
    this.resumeHint.setDepth(1001);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.pauseText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  hidePauseOverlay() {
    // 移除覆盖层和文本
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    if (this.pauseText) {
      this.tweens.killTweensOf(this.pauseText);
      this.pauseText.destroy();
      this.pauseText = null;
    }

    if (this.resumeHint) {
      this.resumeHint.destroy();
      this.resumeHint = null;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);