class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证的状态信号：存活时间
    this.isGameOver = false;
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

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建敌人组（10个敌人）
    this.enemies = this.physics.add.group();
    
    for (let i = 0; i < 10; i++) {
      // 随机生成敌人位置（避免在玩家附近生成）
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示游戏说明
    this.add.text(400, 50, 'Use Arrow Keys to Move - Avoid Red Enemies!', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间（转换为秒）
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.timeText.setText(`Time: ${seconds}s`);

    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

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
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 每个敌人追踪玩家
    const enemySpeed = 80;
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // 设置敌人朝向玩家的速度
      this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);
    });
  }

  handleCollision(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;

    // 停止所有物理对象
    this.player.setVelocity(0);
    this.enemies.children.entries.forEach(e => e.setVelocity(0));

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 玩家变灰
    this.player.setTint(0x888888);

    // 输出最终状态到控制台（可验证）
    const finalTime = Math.floor(this.survivalTime / 1000);
    console.log(`Game Over! Survival Time: ${finalTime} seconds`);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }
}

// Phaser 游戏配置
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

// 启动游戏
new Phaser.Game(config);