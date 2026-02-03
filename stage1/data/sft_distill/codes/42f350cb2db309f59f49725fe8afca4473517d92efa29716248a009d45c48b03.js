class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.score = 0;
    this.gameOver = false;
    this.enemiesSpawned = 0;
    this.enemiesDodged = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      gameOver: false,
      enemiesSpawned: 0,
      enemiesDodged: 0,
      playerX: 400,
      playerY: 550
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色方块）
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
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每1秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 分数计时器（每秒增加10分）
    this.scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
          this.updateSignals();
        }
      },
      callbackScope: this,
      loop: true
    });

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    console.log('Game Started:', JSON.stringify(window.__signals__));
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 随机X位置（留出边界）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置速度为360（向下）
    enemy.setVelocityY(360);
    enemy.body.setSize(30, 30);

    this.enemiesSpawned++;
    this.updateSignals();
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText.setVisible(true);

    // 停止计时器
    this.enemyTimer.remove();
    this.scoreTimer.remove();

    this.updateSignals();
    console.log('Game Over:', JSON.stringify(window.__signals__));
  }

  update() {
    if (this.gameOver) return;

    // 玩家移动控制
    const speed = 300;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        this.enemiesDodged++;
        enemy.destroy();
      }
    });

    // 更新信号
    this.updateSignals();
  }

  updateSignals() {
    window.__signals__ = {
      score: this.score,
      gameOver: this.gameOver,
      enemiesSpawned: this.enemiesSpawned,
      enemiesDodged: this.enemiesDodged,
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      enemyCount: this.enemies.countActive(true)
    };
  }
}

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
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);