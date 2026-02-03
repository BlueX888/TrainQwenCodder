class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.distance = 0;
    this.collisionCount = 0;
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

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff6600, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(432, 432); // 速度 360 * 1.2 = 432

    // 创建敌人精灵（随机位置）
    const startX = Phaser.Math.Between(50, 750);
    const startY = Phaser.Math.Between(50, 550);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建状态文本
    this.healthText = this.add.text(16, 16, 'Health: 100', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.distanceText = this.add.text(16, 50, 'Distance: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.collisionText = this.add.text(16, 84, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 580, 'Use Arrow Keys to Move and Escape', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 1);

    // 碰撞冷却时间
    this.collisionCooldown = 0;
  }

  update(time, delta) {
    // 更新碰撞冷却
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= delta;
    }

    // 玩家移动控制
    const playerSpeed = 432;
    this.player.setVelocity(0, 0);

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

    // 敌人追踪玩家
    const enemySpeed = 360;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算距离
    this.distance = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      )
    );

    // 更新状态文本
    this.healthText.setText('Health: ' + this.health);
    this.distanceText.setText('Distance: ' + this.distance);
    this.collisionText.setText('Collisions: ' + this.collisionCount);

    // 游戏结束检测
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 使用冷却时间避免重复碰撞
    if (this.collisionCooldown <= 0) {
      this.health -= 10;
      this.collisionCount += 1;
      this.collisionCooldown = 1000; // 1秒冷却

      // 视觉反馈：玩家闪烁
      this.tweens.add({
        targets: player,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2
      });

      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y
      );
      player.setVelocity(
        Math.cos(angle) * 600,
        Math.sin(angle) * 600
      );
    }
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    const finalText = this.add.text(400, 370, `Survived ${this.collisionCount} collisions`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    finalText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(400, 420, 'Click to Restart', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);

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