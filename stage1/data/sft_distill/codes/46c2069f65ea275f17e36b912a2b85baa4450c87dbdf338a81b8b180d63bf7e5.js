class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.survivalTime = 0;
    this.enemySpawnTimer = null;
    this.scoreText = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
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
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 设置敌人生成定时器（每1秒生成一个）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始化信号输出
    this.initSignals();

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      status: 'running'
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.score = Math.floor(this.survivalTime / 1000);
    this.scoreText.setText('Time: ' + this.score + 's');

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
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为80
    enemy.setVelocityY(80);
    enemy.body.setSize(30, 30);

    console.log('[ENEMY_SPAWN]', JSON.stringify({
      timestamp: Date.now(),
      x: x,
      enemyCount: this.enemies.children.entries.length
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    // 停止敌人生成
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 370, 'Final Time: ' + this.score + 's', {
      fontSize: '32px',
      fill: '#ffffff'
    });
    finalScoreText.setOrigin(0.5);

    // 输出游戏结束信号
    console.log('[GAME_OVER]', JSON.stringify({
      timestamp: Date.now(),
      finalScore: this.score,
      survivalTime: this.survivalTime,
      enemiesSpawned: this.enemies.children.entries.length
    }));

    this.updateSignals();
  }

  initSignals() {
    window.__signals__ = {
      gameState: 'running',
      score: 0,
      survivalTime: 0,
      playerX: 400,
      playerY: 550,
      enemyCount: 0,
      gameOver: false
    };
  }

  updateSignals() {
    window.__signals__ = {
      gameState: this.gameOver ? 'gameover' : 'running',
      score: this.score,
      survivalTime: Math.floor(this.survivalTime),
      playerX: Math.floor(this.player.x),
      playerY: Math.floor(this.player.y),
      enemyCount: this.enemies.children.entries.length,
      gameOver: this.gameOver
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
  scene: DodgeGame
};

const game = new Phaser.Game(config);