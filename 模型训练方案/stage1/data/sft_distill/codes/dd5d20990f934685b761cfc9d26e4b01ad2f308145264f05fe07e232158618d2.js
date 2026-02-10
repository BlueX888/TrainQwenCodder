class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
    this.invincibleTimer = null;
    this.blinkTween = null;
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
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（多个敌人增加难度）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + i * 50,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.createHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(20, 20, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(400, 550, '', {
      fontSize: '20px',
      color: '#ffa500',
      fontStyle: 'bold'
    });
    this.invincibleText.setOrigin(0.5);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(20, 560, 'Arrow Keys to Move', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  createHealthBar() {
    // 血条背景（灰色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 50, 200, 20);

    // 血条前景（红色）
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.health / this.maxHealth;
    const barWidth = 200 * healthPercent;
    
    // 根据血量百分比改变颜色
    let color = 0xff0000; // 红色
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 50, barWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
    this.updateHealthBar();

    // 触发无敌状态
    this.activateInvincibility();

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.invincibleText.setText('INVINCIBLE');

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果（橙色提示通过alpha闪烁实现）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 0.5秒内闪烁5次
      onComplete: () => {
        this.player.alpha = 1;
      }
    });

    // 添加橙色光晕效果
    const glowGraphics = this.add.graphics();
    glowGraphics.lineStyle(4, 0xffa500, 1);
    glowGraphics.strokeRect(
      this.player.x - 22,
      this.player.y - 22,
      44,
      44
    );

    this.tweens.add({
      targets: glowGraphics,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        glowGraphics.destroy();
      }
    });

    // 清除之前的定时器
    if (this.invincibleTimer) {
      this.invincibleTimer.remove();
    }

    // 0.5秒后解除无敌状态
    this.invincibleTimer = this.time.delayedCall(500, () => {
      this.isInvincible = false;
      this.invincibleText.setText('');
      this.invincibleTimer = null;
    });
  }

  gameOver() {
    // 显示游戏结束
    this.gameOverText.setVisible(true);
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 添加重启提示
    const restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不处理更新
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

    // 敌人简单AI：随机改变方向
    this.enemies.children.entries.forEach(enemy => {
      if (Phaser.Math.Between(0, 100) < 2) {
        enemy.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(50, 150)
        );
      }
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