class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.enemySpeed = 80;
    this.playerSpeed = 80 * 1.2; // 96
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理 (绿色方块)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理 (青色圆形)
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.speedText = this.add.text(16, 40, 
      `Player Speed: ${this.playerSpeed} | Enemy Speed: ${this.enemySpeed}`, {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(16, 560, 'Use Arrow Keys to move and avoid the cyan enemy!', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

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
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    if (this.health > 0) {
      this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
    } else {
      this.enemy.setVelocity(0);
    }

    // 更新健康值显示
    this.healthText.setText(`Health: ${this.health}`);
  }

  handleCollision(player, enemy) {
    // 碰撞时减少生命值
    if (this.health > 0) {
      this.health -= 1;
      
      // 击退效果
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      player.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      );

      // 游戏结束检测
      if (this.health <= 0) {
        this.health = 0;
        this.add.text(400, 300, 'GAME OVER!', {
          fontSize: '48px',
          fill: '#ff0000'
        }).setOrigin(0.5);
        player.setTint(0xff0000);
      }
    }
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