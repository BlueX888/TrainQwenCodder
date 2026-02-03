class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.score = 0;
    this.movingBall = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建分数文本
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建游戏状态指示器 - 一个移动的球
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff6b6b, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.movingBall = this.physics.add.sprite(400, 300, 'ball');
    this.movingBall.setVelocity(200, 150);
    this.movingBall.setBounce(1, 1);
    this.movingBall.setCollideWorldBounds(true);

    // 创建一些静态装饰物体
    for (let i = 0; i < 5; i++) {
      const box = this.add.graphics();
      box.fillStyle(0x4ecdc4, 1);
      box.fillRect(100 + i * 140, 500, 80, 80);
    }

    // 添加游戏说明
    this.add.text(400, 50, 'Press ANY Arrow Key to Pause/Resume', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听方向键按下事件
    this.input.keyboard.on('keydown-UP', () => this.togglePause());
    this.input.keyboard.on('keydown-DOWN', () => this.togglePause());
    this.input.keyboard.on('keydown-LEFT', () => this.togglePause());
    this.input.keyboard.on('keydown-RIGHT', () => this.togglePause());

    // 创建定时器增加分数（用于验证暂停效果）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: this.incrementScore,
      callbackScope: this,
      loop: true
    });

    // 游戏状态指示文本
    this.statusText = this.add.text(20, 60, 'Status: Running', {
      fontSize: '20px',
      color: '#00ff00'
    });
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

    // 暂停物理系统
    this.physics.pause();

    // 暂停所有定时器
    this.time.paused = true;

    // 创建蓝色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0066cc, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);

    // 创建 PAUSED 文本
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);

    // 添加提示文本
    this.pauseHintText = this.add.text(400, 380, 'Press any arrow key to resume', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.pauseHintText.setOrigin(0.5);
    this.pauseHintText.setDepth(101);

    // 更新状态文本
    this.statusText.setText('Status: Paused');
    this.statusText.setColor('#ff0000');

    console.log('Game Paused - Score:', this.score);
  }

  resumeGame() {
    this.isPaused = false;

    // 恢复物理系统
    this.physics.resume();

    // 恢复定时器
    this.time.paused = false;

    // 移除覆盖层和文本
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

    // 更新状态文本
    this.statusText.setText('Status: Running');
    this.statusText.setColor('#00ff00');

    console.log('Game Resumed - Score:', this.score);
  }

  incrementScore() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  update(time, delta) {
    // 当游戏未暂停时，可以添加额外的更新逻辑
    if (!this.isPaused) {
      // 游戏运行中的逻辑
    }
  }
}

// Phaser 游戏配置
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
const game = new Phaser.Game(config);