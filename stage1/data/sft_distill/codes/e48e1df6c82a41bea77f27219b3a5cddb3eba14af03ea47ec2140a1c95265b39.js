class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.score = 0;
    this.gameOver = false;
    this.scoreText = null;
    this.gameOverText = null;
    
    // 初始化信号对象
    window.__signals__ = {
      gameState: 'playing',
      score: 0,
      playerX: 0,
      playerY: 0,
      enemyCount: 0,
      collisionDetected: false
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色矩形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 定时生成敌人（每1.5秒）
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 定时增加分数（每秒+10）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameOver) {
          this.score += 10;
          this.scoreText.setText('Score: ' + this.score);
          window.__signals__.score = this.score;
        }
      },
      callbackScope: this,
      loop: true
    });

    // 初始化信号
    this.updateSignals();
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 620) {
        enemy.destroy();
      }
    });

    // 更新信号
    this.updateSignals();
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为80
    enemy.setVelocityY(80);
    enemy.body.setSize(30, 30);

    window.__signals__.enemyCount = this.enemies.children.entries.length;
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    this.physics.pause();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '32px',
      fill: '#fff'
    });
    restartText.setOrigin(0.5);

    // 更新信号
    window.__signals__.gameState = 'gameOver';
    window.__signals__.collisionDetected = true;

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.gameOver = false;
      this.score = 0;
      window.__signals__.gameState = 'playing';
      window.__signals__.collisionDetected = false;
      window.__signals__.score = 0;
    });

    // 输出游戏结束日志
    console.log(JSON.stringify({
      event: 'gameOver',
      finalScore: this.score,
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    window.__signals__.gameState = this.gameOver ? 'gameOver' : 'playing';
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.enemyCount = this.enemies.children.entries.length;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGame
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'gameInitialized',
  config: {
    width: config.width,
    height: config.height,
    physics: 'arcade'
  },
  timestamp: Date.now()
}));