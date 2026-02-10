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

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粉色无敌纹理
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0xff69b4, 1);
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
    
    // 创建3个敌人，随机位置和速度
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度
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

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 240, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(20, 60, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建状态文本（用于验证）
    this.statusText = this.add.text(20, 90, 'Status: Normal', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(20, 550, 'Use Arrow Keys to Move | Avoid Red Enemies', {
      fontSize: '16px',
      color: '#ffff00'
    });
  }

  update() {
    // 玩家移动
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

    // 检查游戏结束
    if (this.currentHealth <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.handleGameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.currentHealth = Math.max(0, this.currentHealth - 1);
    
    // 更新UI
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);

    // 进入无敌状态
    this.enterInvincibleState();

    // 添加击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    const knockbackSpeed = 300;
    player.setVelocity(
      Math.cos(angle) * knockbackSpeed,
      Math.sin(angle) * knockbackSpeed
    );

    console.log(`Collision! Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  enterInvincibleState() {
    this.isInvincible = true;
    this.statusText.setText('Status: INVINCIBLE');
    this.statusText.setColor('#ff69b4');

    // 切换到粉色纹理
    this.player.setTexture('playerInvincible');

    // 创建闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 闪烁5次（0.5秒）
      onComplete: () => {
        this.exitInvincibleState();
      }
    });

    // 设置定时器作为备份（确保无敌状态结束）
    this.time.delayedCall(this.invincibleDuration, () => {
      if (this.isInvincible) {
        this.exitInvincibleState();
      }
    });
  }

  exitInvincibleState() {
    this.isInvincible = false;
    this.player.alpha = 1;
    this.player.setTexture('player');
    this.statusText.setText('Status: Normal');
    this.statusText.setColor('#ffffff');
    
    console.log('Invincible state ended');
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据生命值百分比选择颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    let barColor = 0x00ff00; // 绿色
    
    if (healthPercent <= 0.25) {
      barColor = 0xff0000; // 红色
    } else if (healthPercent <= 0.5) {
      barColor = 0xff6600; // 橙色
    } else if (healthPercent <= 0.75) {
      barColor = 0xffff00; // 黄色
    }

    this.healthBar.fillStyle(barColor, 1);
    const barWidth = (this.currentHealth / this.maxHealth) * 240;
    this.healthBar.fillRect(20, 20, barWidth, 30);

    // 绘制分隔线（显示每格血量）
    this.healthBar.lineStyle(2, 0x000000, 0.5);
    for (let i = 1; i < this.maxHealth; i++) {
      const x = 20 + (240 / this.maxHealth) * i;
      this.healthBar.lineBetween(x, 20, x, 50);
    }
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 停止玩家移动
    this.player.setVelocity(0);

    // 停止闪烁动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    console.log('Game Over! Final Health: 0');
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