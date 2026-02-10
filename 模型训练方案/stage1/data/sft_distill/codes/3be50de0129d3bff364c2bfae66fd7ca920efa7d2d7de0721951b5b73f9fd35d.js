class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 15;
    this.maxHealth = 15;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
  }

  preload() {
    // 创建玩家纹理（青色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;
      const y = 100 + (i % 2) * 100;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
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

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 304, 24);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(20, 20, 304, 24);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(340, 20, `HP: ${this.playerHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(20, 60, '', {
      fontSize: '18px',
      color: '#00ffff',
      fontStyle: 'bold'
    });

    // 创建操作提示
    this.add.text(20, 550, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 闪烁动画（用于无敌帧）
    this.blinkTween = null;
  }

  update() {
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

    // 检查游戏结束
    if (this.playerHealth <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.handleGameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞伤害
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.playerHealth = Math.max(0, this.playerHealth - 1);
    
    // 更新显示
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.playerHealth}/${this.maxHealth}`);

    // 触发无敌帧
    this.startInvincibility();

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // 相机震动效果
    this.cameras.main.shake(100, 0.005);
  }

  startInvincibility() {
    this.isInvincible = true;
    this.invincibleText.setText('INVINCIBLE!');

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(this.invincibleDuration / 200) - 1
    });

    // 设置定时器结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.player.setAlpha(1);
      this.invincibleText.setText('');
      this.blinkTween = null;
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 计算血量百分比
    const healthPercent = this.playerHealth / this.maxHealth;
    const barWidth = 300 * healthPercent;
    
    // 根据血量选择颜色
    let color;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(22, 22, barWidth, 20);
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.playerHealth = this.maxHealth;
      this.isInvincible = false;
      this.gameOver = false;
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