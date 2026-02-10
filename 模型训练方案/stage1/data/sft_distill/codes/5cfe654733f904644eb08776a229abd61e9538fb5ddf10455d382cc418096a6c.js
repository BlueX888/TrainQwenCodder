class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.isGameOver = false;
    this.enemyCount = 0;
    this.playerSpeed = 300;
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 1000; // 每1秒生成一个敌人
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色矩形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemyTex', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加游戏说明文本
    this.add.text(10, 10, 'Use Arrow Keys to Move\nAvoid Pink Enemies!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化信号
    this.updateSignals();
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 生成敌人
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 移除超出边界的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
        this.updateSignals();
      }
    });

    // 更新信号
    this.updateSignals();
  }

  spawnEnemy() {
    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemyTex');
    enemy.setVelocityY(160); // 设置下落速度为160
    this.enemyCount++;
    this.updateSignals();
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.isGameOver = true;
    this.physics.pause();
    
    // 玩家变红表示游戏结束
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(400, 360, `Enemies Spawned: ${this.enemyCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.updateSignals();
    
    console.log(JSON.stringify({
      event: 'gameOver',
      enemyCount: this.enemyCount,
      playerX: Math.round(player.x)
    }));
  }

  updateSignals() {
    window.__signals__ = {
      isGameOver: this.isGameOver,
      enemyCount: this.enemyCount,
      activeEnemies: this.enemies ? this.enemies.children.entries.length : 0,
      playerX: this.player ? Math.round(this.player.x) : 0,
      playerY: this.player ? Math.round(this.player.y) : 0
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

// 初始化信号对象
window.__signals__ = {
  isGameOver: false,
  enemyCount: 0,
  activeEnemies: 0,
  playerX: 0,
  playerY: 0
};

console.log(JSON.stringify({
  event: 'gameStart',
  config: {
    width: config.width,
    height: config.height,
    playerSpeed: 300,
    enemySpeed: 160
  }
}));