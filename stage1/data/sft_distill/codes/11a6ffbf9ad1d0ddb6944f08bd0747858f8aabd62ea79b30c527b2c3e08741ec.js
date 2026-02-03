class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建移动的小球（用于验证暂停效果）
    this.balls = [];
    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x16ff00 + i * 0x002200, 1);
      graphics.fillCircle(0, 0, 20);
      graphics.generateTexture(`ball${i}`, 40, 40);
      graphics.destroy();

      const ball = this.add.sprite(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50),
        `ball${i}`
      );
      
      ball.velocityX = Phaser.Math.Between(-200, 200);
      ball.velocityY = Phaser.Math.Between(-200, 200);
      
      this.balls.push(ball);
    }

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建游戏时间显示
    this.timeText = this.add.text(16, 50, 'Time: 0.0s', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 40, 'Press ANY Arrow Key to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    this.hintText.setOrigin(0.5);

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0066cc, 0.7);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文本
    this.pausedText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 创建暂停提示文本
    this.pauseHintText = this.add.text(width / 2, height / 2 + 60, 'Press ANY Arrow Key to Resume', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.pauseHintText.setOrigin(0.5);
    this.pauseHintText.setDepth(101);
    this.pauseHintText.setVisible(false);

    // 创建方向键监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 标记按键是否已按下（防止连续触发）
    this.keyPressed = false;

    // 添加闪烁效果的定时器
    this.pausedTextBlink = null;
  }

  update(time, delta) {
    // 检测方向键按下
    const anyArrowPressed = 
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.cursors.left.isDown ||
      this.cursors.right.isDown;

    if (anyArrowPressed && !this.keyPressed) {
      this.keyPressed = true;
      this.togglePause();
    }

    if (!anyArrowPressed) {
      this.keyPressed = false;
    }

    // 只有在非暂停状态下才更新游戏逻辑
    if (!this.isPaused) {
      // 更新游戏时间
      this.gameTime += delta / 1000;
      this.timeText.setText(`Time: ${this.gameTime.toFixed(1)}s`);

      // 更新小球位置
      const { width, height } = this.cameras.main;
      this.balls.forEach(ball => {
        ball.x += ball.velocityX * delta / 1000;
        ball.y += ball.velocityY * delta / 1000;

        // 边界反弹
        if (ball.x <= 20 || ball.x >= width - 20) {
          ball.velocityX *= -1;
          ball.x = Phaser.Math.Clamp(ball.x, 20, width - 20);
          this.score += 1;
          this.scoreText.setText(`Score: ${this.score}`);
        }
        if (ball.y <= 20 || ball.y >= height - 20) {
          ball.velocityY *= -1;
          ball.y = Phaser.Math.Clamp(ball.y, 20, height - 20);
          this.score += 1;
          this.scoreText.setText(`Score: ${this.score}`);
        }
      });
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      this.pauseHintText.setVisible(true);

      // 添加闪烁效果
      if (this.pausedTextBlink) {
        this.pausedTextBlink.remove();
      }
      this.pausedTextBlink = this.time.addEvent({
        delay: 500,
        callback: () => {
          this.pausedText.setAlpha(this.pausedText.alpha === 1 ? 0.5 : 1);
        },
        loop: true
      });

      console.log('Game PAUSED - Score:', this.score, 'Time:', this.gameTime.toFixed(1));
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      this.pauseHintText.setVisible(false);
      this.pausedText.setAlpha(1);

      // 移除闪烁效果
      if (this.pausedTextBlink) {
        this.pausedTextBlink.remove();
        this.pausedTextBlink = null;
      }

      console.log('Game RESUMED - Score:', this.score, 'Time:', this.gameTime.toFixed(1));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    score: scene.score,
    gameTime: scene.gameTime.toFixed(1)
  };
};