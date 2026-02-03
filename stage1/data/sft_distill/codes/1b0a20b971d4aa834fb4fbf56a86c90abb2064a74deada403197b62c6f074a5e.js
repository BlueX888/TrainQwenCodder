class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5;
    this.maxHealth = 5;
    this.isInvincible = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，不依赖外部资源
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
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人（移动的障碍物）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(150 + i * 250, 200 + i * 80, 'enemy');
      enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量显示
    this.createHealthBar();

    // 提示文本
    this.add.text(400, 50, '使用方向键移动，避开红色敌人！', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 状态信号（用于验证）
    this.registry.set('health', this.health);
    this.registry.set('isInvincible', this.isInvincible);
  }

  createHealthBar() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 210, 30);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(30, 27, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercentage = this.health / this.maxHealth;
    const barWidth = 200 * healthPercentage;
    
    // 根据血量变色
    let color = 0x00ff00; // 绿色
    if (healthPercentage < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercentage < 0.6) {
      color = 0xffaa00; // 橙色
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(25, 25, barWidth, 20);

    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，不处理伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除血量
    this.health -= 1;
    this.updateHealthBar();
    this.registry.set('health', this.health);

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.registry.set('isInvincible', true);

    // 粉色闪烁效果
    this.invincibilityTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff00ff, // 粉色
      duration: 100,
      yoyo: true,
      repeat: 9, // 总共闪烁10次（1秒内，每次100ms）
      onUpdate: (tween) => {
        // 在 yoyo 回程时恢复原色
        if (tween.progress > 0.5 && this.player.tint === 0xff00ff) {
          this.player.setTint(0xffffff);
        } else if (tween.progress <= 0.5 && this.player.tint === 0xffffff) {
          this.player.setTint(0xff00ff);
        }
      }
    });

    // 1秒后结束无敌
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      this.registry.set('isInvincible', false);
      this.player.setAlpha(1);
      this.player.clearTint();
    });
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 玩家变灰
    this.player.setTint(0x888888);
    this.player.setAlpha(0.5);

    // 停止所有 Tween
    if (this.invincibilityTween) {
      this.invincibilityTween.stop();
    }
  }

  update(time, delta) {
    // 游戏结束后不更新
    if (this.health <= 0) {
      return;
    }

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
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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