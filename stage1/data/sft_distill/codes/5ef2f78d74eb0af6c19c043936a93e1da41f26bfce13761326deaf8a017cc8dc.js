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
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

    // 创建无敌状态纹理（黄色方块）
    const invincibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    invincibleGraphics.fillStyle(0xffff00, 1);
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('playerInvincible', 40, 40);
    invincibleGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
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
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.updateDebugInfo();
  }

  createHealthUI() {
    // 血量背景（灰色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x555555, 1);
    this.healthBarBg.fillRect(250, 550, 300, 30);

    // 血量前景（红色）
    this.healthBar = this.add.graphics();

    // 血量文字
    this.healthText = this.add.text(400, 565, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);

    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 计算血量百分比
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 300 * healthPercent;

    // 根据血量显示不同颜色
    let color = 0xff0000; // 红色
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(250, 550, barWidth, 30);

    // 更新文字
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateDebugInfo();

    // 检查游戏结束
    if (this.currentHealth <= 0) {
      this.handleGameOver();
      return;
    }

    // 触发无敌帧
    this.startInvincibility();

    // 击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    this.player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );
  }

  startInvincibility() {
    this.isInvincible = true;

    // 切换到黄色纹理
    this.player.setTexture('playerInvincible');

    // 创建闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 闪烁5次（0.5秒）
      onComplete: () => {
        this.endInvincibility();
      }
    });

    // 备用定时器（确保无敌状态结束）
    this.time.delayedCall(this.invincibleDuration, () => {
      if (this.isInvincible) {
        this.endInvincibility();
      }
    });
  }

  endInvincibility() {
    this.isInvincible = false;
    
    // 恢复正常纹理和透明度
    this.player.setTexture('player');
    this.player.setAlpha(1);

    // 停止闪烁动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    this.updateDebugInfo();
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(400, 370, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    this.updateDebugInfo();
  }

  updateDebugInfo() {
    this.debugText.setText([
      `Health: ${this.currentHealth}/${this.maxHealth}`,
      `Invincible: ${this.isInvincible}`,
      `Status: ${this.currentHealth > 0 ? 'Playing' : 'Game Over'}`
    ]);
  }

  update(time, delta) {
    // 只有游戏进行中才允许移动
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

    // 敌人随机改变方向（每秒有10%概率）
    this.enemies.children.entries.forEach(enemy => {
      if (Math.random() < 0.01) {
        const newVelocityX = Phaser.Math.Between(-150, 150);
        const newVelocityY = Phaser.Math.Between(-150, 150);
        enemy.setVelocity(newVelocityX, newVelocityY);
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