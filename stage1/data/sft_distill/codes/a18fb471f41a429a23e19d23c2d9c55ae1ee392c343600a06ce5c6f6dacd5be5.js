class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.distanceToEnemy = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 80 * 1.2; // 96

    // 创建敌人精灵（随机位置）
    const enemyX = Phaser.Math.Between(100, 700);
    const enemyY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemySpeed = 80;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      distanceToEnemy: 0,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: enemyX, y: enemyY },
      gameTime: 0
    };

    console.log(JSON.stringify({
      type: 'GAME_START',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 重置玩家速度
    this.player.setVelocity(0);

    // 处理键盘输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(
        normalized.x * this.playerSpeed,
        normalized.y * this.playerSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新显示文本
    this.infoText.setText([
      `碰撞次数: ${this.collisionCount}`,
      `距离敌人: ${Math.round(this.distanceToEnemy)}px`,
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`,
      '',
      '使用方向键移动玩家',
      '躲避蓝色敌人追踪'
    ]);

    // 更新信号对象
    window.__signals__ = {
      collisionCount: this.collisionCount,
      distanceToEnemy: Math.round(this.distanceToEnemy),
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerPosition: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      enemyPosition: { x: Math.round(this.enemy.x), y: Math.round(this.enemy.y) },
      gameTime: Math.round(time / 1000)
    };
  }

  handleCollision(player, enemy) {
    this.collisionCount++;

    // 输出碰撞日志
    console.log(JSON.stringify({
      type: 'COLLISION',
      collisionCount: this.collisionCount,
      playerPosition: { x: Math.round(player.x), y: Math.round(player.y) },
      enemyPosition: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
      timestamp: Date.now()
    }));

    // 重置敌人位置到随机边缘
    const edge = Phaser.Math.Between(0, 3);
    switch (edge) {
      case 0: // 上边
        enemy.setPosition(Phaser.Math.Between(50, 750), 50);
        break;
      case 1: // 右边
        enemy.setPosition(750, Phaser.Math.Between(50, 550));
        break;
      case 2: // 下边
        enemy.setPosition(Phaser.Math.Between(50, 750), 550);
        break;
      case 3: // 左边
        enemy.setPosition(50, Phaser.Math.Between(50, 550));
        break;
    }

    // 停止敌人速度，避免碰撞后立即再次碰撞
    enemy.setVelocity(0);
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);