class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.distance = 0; // 玩家与敌人的距离
    this.survived = 0; // 存活时间（秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x888888, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（在中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建敌人精灵（在左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动，躲避灰色敌人！', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 记录开始时间
    this.startTime = this.time.now;
    this.lastCollisionTime = 0;
  }

  update(time, delta) {
    // 更新存活时间
    this.survived = ((time - this.startTime) / 1000).toFixed(1);

    // 玩家移动控制（速度 80 * 1.2 = 96）
    const playerSpeed = 96;
    const velocity = { x: 0, y: 0 };

    if (this.cursors.left.isDown) {
      velocity.x = -playerSpeed;
    } else if (this.cursors.right.isDown) {
      velocity.x = playerSpeed;
    }

    if (this.cursors.up.isDown) {
      velocity.y = -playerSpeed;
    } else if (this.cursors.down.isDown) {
      velocity.y = playerSpeed;
    }

    // 对角线移动时归一化速度
    if (velocity.x !== 0 && velocity.y !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocity.x *= factor;
      velocity.y *= factor;
    }

    this.player.setVelocity(velocity.x, velocity.y);

    // 敌人追踪玩家（速度 80）
    const enemySpeed = 80;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算玩家与敌人的距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新状态显示
    this.updateStatus();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 防止频繁碰撞扣血（每0.5秒最多扣一次）
    const currentTime = this.time.now;
    if (currentTime - this.lastCollisionTime > 500) {
      this.health -= 10;
      this.lastCollisionTime = currentTime;

      // 碰撞闪烁效果
      this.player.setTint(0xff0000);
      this.time.delayedCall(100, () => {
        this.player.clearTint();
      });

      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y
      );
      player.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      );
    }
  }

  updateStatus() {
    const statusLines = [
      `生命值: ${this.health}`,
      `距离: ${Math.floor(this.distance)}`,
      `存活时间: ${this.survived}s`,
      `玩家速度: 96`,
      `敌人速度: 80`
    ];
    this.statusText.setText(statusLines.join('\n'));
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const statsText = this.add.text(400, 380, `存活时间: ${this.survived}秒`, {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 450, '点击重新开始', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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

new Phaser.Game(config);