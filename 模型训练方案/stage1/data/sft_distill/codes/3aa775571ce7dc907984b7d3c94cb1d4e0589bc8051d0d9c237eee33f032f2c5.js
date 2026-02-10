class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.isInvincible = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人（移动的障碍物）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(
        100 + i * 150,
        100 + Math.sin(i) * 100,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 304, 34);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(20, 20, 304, 34);

    // 创建血量条前景
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(340, 27, `${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(20, 70, 'Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加无敌状态指示器
    this.invincibleText = this.add.text(400, 550, '', {
      fontSize: '18px',
      color: '#ffa500',
      fontStyle: 'bold'
    });
    this.invincibleText.setOrigin(0.5);
  }

  update(time, delta) {
    // 如果游戏结束，停止更新
    if (this.currentHealth <= 0) {
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

    // 更新无敌状态提示
    if (this.isInvincible) {
      this.invincibleText.setText('INVINCIBLE!');
    } else {
      this.invincibleText.setText('');
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.currentHealth -= 1;
    this.updateHealthBar();

    // 检查游戏是否结束
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果（1秒内在0.3和1之间切换）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始1次共10次，总时长1秒
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
      }
    });

    // 添加橙色闪光效果
    const originalTint = this.player.tint;
    this.player.setTint(0xffa500); // 橙色

    this.time.delayedCall(1000, () => {
      this.player.clearTint();
    });
  }

  updateHealthBar() {
    // 清除之前的血量条
    this.healthBar.clear();

    // 计算血量百分比
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 300 * healthPercent;

    // 绘制血量条（红色背景）
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRect(22, 22, 300, 30);

    // 绘制当前血量（绿色）
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(22, 22, barWidth, 30);

    // 更新血量文本
    this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
  }

  gameOver() {
    // 停止玩家移动
    this.player.setVelocity(0);
    this.physics.pause();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 添加重启提示
    const restartText = this.add.text(400, 370, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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