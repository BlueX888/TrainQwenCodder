// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      isPaused: false,
      score: 0,
      gameTime: 0,
      playerX: 400,
      playerY: 300
    };

    // 创建玩家（使用Graphics绘制）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建一些移动的背景元素来验证暂停效果
    this.particles = [];
    for (let i = 0; i < 10; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        5,
        0xffffff,
        0.5
      );
      particle.velocityX = Phaser.Math.Between(-50, 50);
      particle.velocityY = Phaser.Math.Between(-50, 50);
      this.particles.push(particle);
    }

    // 显示分数和时间
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 50, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示控制提示
    this.add.text(16, 560, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '20px',
      fill: '#ffff00'
    });

    // 监听WASD键
    this.input.keyboard.on('keydown-W', () => this.togglePause());
    this.input.keyboard.on('keydown-A', () => this.togglePause());
    this.input.keyboard.on('keydown-S', () => this.togglePause());
    this.input.keyboard.on('keydown-D', () => this.togglePause());

    // 使用方向键控制玩家移动（验证暂停时不能移动）
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log('[GameScene] Game started');
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText(`Time: ${this.gameTime.toFixed(1)}s`);

    // 玩家移动
    const speed = 200 * (delta / 1000);
    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    // 更新粒子位置
    this.particles.forEach(particle => {
      particle.x += particle.velocityX * (delta / 1000);
      particle.y += particle.velocityY * (delta / 1000);

      // 边界反弹
      if (particle.x < 0 || particle.x > 800) {
        particle.velocityX *= -1;
      }
      if (particle.y < 0 || particle.y > 600) {
        particle.velocityY *= -1;
      }
    });

    // 增加分数（基于时间）
    this.score = Math.floor(this.gameTime * 10);
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.gameTime = parseFloat(this.gameTime.toFixed(1));
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    window.__signals__.isPaused = this.isPaused;

    if (this.isPaused) {
      // 暂停游戏场景
      this.scene.pause();
      // 启动暂停覆盖层场景
      this.scene.launch('PauseScene');
      console.log('[GameScene] Game paused');
    } else {
      // 继续游戏场景
      this.scene.resume();
      // 停止暂停覆盖层场景
      this.scene.stop('PauseScene');
      console.log('[GameScene] Game resumed');
    }
  }
}

// 暂停覆盖层场景
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  preload() {
    // 无需加载资源
  }

  create() {
    // 创建紫色半透明覆盖层
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x800080, 0.7); // 紫色，70%透明度
    this.overlay.fillRect(0, 0, 800, 600);

    // 创建"PAUSED"文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pausedText.setOrigin(0.5);

    // 添加提示文字
    this.hintText = this.add.text(400, 380, 'Press W/A/S/D to Resume', {
      fontSize: '28px',
      fill: '#ffff00'
    });
    this.hintText.setOrigin(0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.pausedText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 监听WASD键继续游戏
    this.input.keyboard.on('keydown-W', () => this.resumeGame());
    this.input.keyboard.on('keydown-A', () => this.resumeGame());
    this.input.keyboard.on('keydown-S', () => this.resumeGame());
    this.input.keyboard.on('keydown-D', () => this.resumeGame());

    console.log('[PauseScene] Pause overlay displayed');
  }

  resumeGame() {
    // 通过游戏场景的togglePause方法恢复
    const gameScene = this.scene.get('GameScene');
    gameScene.togglePause();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: [GameScene, PauseScene],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态日志
console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  config: {
    width: 800,
    height: 600,
    scenes: ['GameScene', 'PauseScene']
  }
}));