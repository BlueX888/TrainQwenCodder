class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成3个敌人
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
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

    // 创建血量UI
    this.createHealthUI();

    // 添加调试信息
    this.debugText = this.add.text(10, 550, '', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.updateDebugInfo();
  }

  createHealthUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 10, 240, 30);

    // 血量条
    this.healthBar = this.add.graphics();

    // 血量文字
    this.healthText = this.add.text(260, 15, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 计算血量百分比
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 230 * healthPercent;

    // 根据血量改变颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(15, 15, barWidth, 20);

    // 更新文字
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateDebugInfo();

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

    // 保存原始tint
    const originalTint = this.player.tint;

    // 创建粉色闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff69b4, // 粉色
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们只需要500ms，所以调整）
      onComplete: () => {
        // 恢复正常状态
        this.player.alpha = 1;
        this.player.clearTint();
        this.isInvincible = false;
      }
    });

    // 使用定时器确保无敌时间准确为0.5秒
    this.time.delayedCall(this.invincibleDuration, () => {
      if (this.isInvincible) {
        this.player.alpha = 1;
        this.player.clearTint();
        this.isInvincible = false;
      }
    });
  }

  handlePlayerDeath() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 显示死亡效果
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      angle: 360,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.showGameOver();
      }
    });

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Press SPACE to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  updateDebugInfo() {
    const invincibleStatus = this.isInvincible ? 'YES (Invincible)' : 'NO';
    this.debugText.setText(
      `Health: ${this.currentHealth}/${this.maxHealth} | Invincible: ${invincibleStatus}`
    );
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 更新调试信息
    if (this.debugText) {
      this.updateDebugInfo();
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