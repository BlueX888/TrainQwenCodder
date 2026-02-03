class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.isInvincible = false;
    this.invincibleDuration = 3000; // 3秒
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组（多个敌人用于测试）
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    const enemy2 = this.enemies.create(400, 100, 'enemy');
    const enemy3 = this.enemies.create(600, 200, 'enemy');

    // 给敌人添加简单的移动行为
    this.enemies.children.iterate((enemy) => {
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

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

    // 创建血量条UI
    this.createHealthBar();

    // 添加提示文本
    this.add.text(10, 10, '使用方向键移动玩家', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(10, 30, '碰撞敌人扣1血，3秒无敌（闪烁）', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '18px',
      color: '#ffff00'
    });
    this.updateStatusText();
  }

  createHealthBar() {
    const barX = 10;
    const barY = 70;
    const barWidth = 200;
    const barHeight = 20;

    // 血量条背景（黑色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    // 血量条（红色）
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(barX + barWidth + 10, barY, '', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.updateHealthText();
  }

  updateHealthBar() {
    const barX = 10;
    const barY = 70;
    const barWidth = 200;
    const barHeight = 20;

    this.healthBar.clear();
    
    // 根据血量百分比计算颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    let color = 0xff0000; // 红色
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    }

    this.healthBar.fillStyle(color, 1);
    const currentBarWidth = (this.currentHealth / this.maxHealth) * barWidth;
    this.healthBar.fillRect(barX, barY, currentBarWidth, barHeight);
  }

  updateHealthText() {
    this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(`状态: ${invincibleStatus} | 血量: ${this.currentHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除1点血量
    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateHealthText();
    this.updateStatusText();

    // 检查是否死亡
    if (this.currentHealth <= 0) {
      this.handlePlayerDeath();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.updateStatusText();

    // 玩家变为粉色（无敌提示色）
    this.player.setTint(0xff69b4);

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 3秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.isInvincible = false;
    this.updateStatusText();

    // 停止闪烁
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复正常外观
    this.player.clearTint();
    this.player.setAlpha(1);
  }

  handlePlayerDeath() {
    // 停止所有敌人移动
    this.enemies.children.iterate((enemy) => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 玩家变灰
    this.player.setTint(0x888888);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, '刷新页面重新开始', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 禁用输入
    this.input.keyboard.enabled = false;
  }

  update(time, delta) {
    // 只有玩家存活且有血量时才能移动
    if (this.currentHealth <= 0) {
      return;
    }

    const speed = 200;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
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