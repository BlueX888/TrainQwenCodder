class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5;
    this.maxHealth = 5;
    this.isInvincible = false;
    this.player = null;
    this.enemy = null;
    this.healthText = null;
    this.invincibleTween = null;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 150, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1, 1);
    this.enemy.setVelocity(150, 150);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量显示
    this.createHealthUI();

    // 添加状态文本（用于验证）
    this.statusText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatusText();
  }

  createHealthUI() {
    // 血量文字
    this.healthText = this.add.text(10, 10, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 血量条容器
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 80, 200, 20);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.health / this.maxHealth;
    
    // 根据血量改变颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent <= 0.6 && healthPercent > 0.3) {
      color = 0xffaa00; // 橙色
    } else if (healthPercent <= 0.3) {
      color = 0xff0000; // 红色
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(10, 80, 200 * healthPercent, 20);
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    this.updateHealthBar();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleDeath();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 停止之前的闪烁动画（如果存在）
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 创建粉色闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff69b4, // 粉色
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，总共1秒（100ms * 2 * 10 = 2000ms，但我们用 timer 控制）
      onComplete: () => {
        // 闪烁完成后恢复
        this.player.setAlpha(1);
        this.player.clearTint();
      }
    });

    // 1秒后解除无敌状态
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      this.player.setAlpha(1);
      this.player.clearTint();
      if (this.invincibleTween) {
        this.invincibleTween.stop();
      }
      this.updateStatusText();
    });

    this.updateStatusText();
  }

  handleDeath() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setTint(0x666666);

    // 显示游戏结束
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    // 停止敌人
    this.enemy.setVelocity(0, 0);

    // 禁用输入
    this.cursors = null;

    this.updateStatusText();
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? 'YES (PINK FLASHING)' : 'NO';
    const aliveStatus = this.health > 0 ? 'ALIVE' : 'DEAD';
    this.statusText.setText(
      `Status: ${aliveStatus} | Invincible: ${invincibleStatus}\n` +
      `Health: ${this.health}/${this.maxHealth}`
    );
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors && this.health > 0) {
      const speed = 200;
      this.player.setVelocity(0, 0);

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