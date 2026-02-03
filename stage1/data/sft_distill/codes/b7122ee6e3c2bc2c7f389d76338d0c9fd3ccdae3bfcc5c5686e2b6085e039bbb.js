class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒无敌时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（3个敌人随机位置）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const x = 100 + i * 250;
      const y = 100 + Math.random() * 400;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量显示
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.healthText.setDepth(100);

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#ffa500',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.invincibleText.setDepth(100);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(16, 560, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    // 游戏状态信号（用于验证）
    this.gameState = {
      health: this.health,
      isInvincible: this.isInvincible,
      collisionCount: 0
    };
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新游戏状态信号
    this.gameState.health = this.health;
    this.gameState.isInvincible = this.isInvincible;
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.healthText.setText(`Health: ${this.health}`);

    // 增加碰撞计数
    this.gameState.collisionCount += 1;

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleDeath();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    this.invincibleText.setText('INVINCIBLE!');

    // 创建闪烁效果（橙色提示）
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们只需要500ms）
      onComplete: () => {
        // 恢复正常透明度
        this.player.alpha = 1;
        this.isInvincible = false;
        this.invincibleText.setText('');
      }
    });

    // 添加橙色闪光效果
    this.tweens.add({
      targets: this.player,
      tint: 0xffa500, // 橙色
      duration: 100,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.player.clearTint();
      }
    });

    // 确保无敌时间准确为0.5秒
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.invincibleText.setText('');
      this.player.alpha = 1;
      this.player.clearTint();
    });
  }

  handleDeath() {
    // 停止所有敌人移动
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    // 显示碰撞次数统计
    const statsText = this.add.text(400, 380, `Total Collisions: ${this.gameState.collisionCount}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    statsText.setOrigin(0.5);
    statsText.setDepth(200);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
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