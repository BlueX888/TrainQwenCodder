class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.gameTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化验证信号
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      enemyX: this.enemy.x,
      enemyY: this.enemy.y,
      distance: 0,
      collisionCount: 0,
      gameTime: 0,
      playerSpeed: 96,
      enemySpeed: 80
    };

    console.log(JSON.stringify({
      event: 'game_start',
      playerSpeed: 96,
      enemySpeed: 80,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    this.gameTime += delta;

    // 玩家速度：80 * 1.2 = 96
    const playerSpeed = 96;
    
    // 重置玩家速度
    this.player.setVelocity(0, 0);

    // 键盘控制玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = playerSpeed / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 敌人追踪玩家，速度为 80
    const enemySpeed = 80;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新显示信息
    this.infoText.setText([
      `Player Speed: ${playerSpeed}`,
      `Enemy Speed: ${enemySpeed}`,
      `Distance: ${distance.toFixed(1)}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${(this.gameTime / 1000).toFixed(1)}s`,
      '',
      'Use Arrow Keys to Move',
      'Escape from Green Enemy!'
    ]);

    // 更新验证信号
    window.__signals__ = {
      playerX: Math.round(this.player.x * 10) / 10,
      playerY: Math.round(this.player.y * 10) / 10,
      enemyX: Math.round(this.enemy.x * 10) / 10,
      enemyY: Math.round(this.enemy.y * 10) / 10,
      distance: Math.round(distance * 10) / 10,
      collisionCount: this.collisionCount,
      gameTime: Math.round(this.gameTime),
      playerSpeed: playerSpeed,
      enemySpeed: enemySpeed
    };
  }

  handleCollision(player, enemy) {
    this.collisionCount++;
    
    // 碰撞时敌人反弹
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.x = player.x - Math.cos(angle) * 50;
    enemy.y = player.y - Math.sin(angle) * 50;

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      collisionCount: this.collisionCount,
      playerPos: { x: player.x, y: player.y },
      enemyPos: { x: enemy.x, y: enemy.y },
      timestamp: Date.now()
    }));

    // 屏幕闪烁效果
    this.cameras.main.flash(200, 255, 0, 0);
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
  scene: GameScene
};

const game = new Phaser.Game(config);