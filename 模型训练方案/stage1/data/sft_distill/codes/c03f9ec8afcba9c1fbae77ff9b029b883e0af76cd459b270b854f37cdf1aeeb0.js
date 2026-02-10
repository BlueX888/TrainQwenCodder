class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.enemySpeed = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gameOver: false,
      survivalTime: 0,
      enemiesSpawned: 0,
      playerX: 0,
      playerY: 0
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每0.8秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 添加游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 添加存活时间显示
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加敌人计数显示
    this.enemyCountText = this.add.text(16, 48, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度
    enemy.setVelocityY(this.enemySpeed);
    enemy.body.setSize(30, 30);

    // 更新信号
    window.__signals__.enemiesSpawned++;

    console.log(JSON.stringify({
      event: 'enemy_spawned',
      x: x,
      count: window.__signals__.enemiesSpawned,
      timestamp: Date.now()
    }));
  }

  handleCollision(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 停止游戏
    this.physics.pause();
    this.enemyTimer.remove();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: this.survivalTime,
      enemiesSpawned: window.__signals__.enemiesSpawned,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新存活时间
    this.survivalTime += delta / 1000;
    window.__signals__.survivalTime = Math.floor(this.survivalTime * 10) / 10;
    this.timeText.setText(`Time: ${window.__signals__.survivalTime}s`);
    this.enemyCountText.setText(`Enemies: ${window.__signals__.enemiesSpawned}`);

    // 玩家移动控制
    const moveSpeed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新玩家位置信号
    window.__signals__.playerX = Math.floor(this.player.x);
    window.__signals__.playerY = Math.floor(this.player.y);

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }
}

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
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);