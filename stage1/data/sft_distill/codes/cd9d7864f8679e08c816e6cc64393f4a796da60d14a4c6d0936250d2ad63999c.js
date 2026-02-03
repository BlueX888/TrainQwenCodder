class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
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
      const enemy = this.enemies.create(
        100 + i * 150,
        100 + Math.sin(i) * 50,
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

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 240, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(270, 25, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建状态文本
    this.statusText = this.add.text(20, 60, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(20, 550, 'Arrow Keys: Move | Avoid red enemies!', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
  }

  update() {
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

    // 更新状态文本
    if (this.isInvincible) {
      this.statusText.setText('INVINCIBLE!');
    } else {
      this.statusText.setText('');
    }

    // 检查游戏结束
    if (this.health <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.handleGameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 触发无敌帧
    this.activateInvincibility();

    // 添加击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    console.log(`Player hit! Health: ${this.health}/${this.maxHealth}`);
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 1.5秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.isInvincible = false;

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复完全不透明
    this.player.setAlpha(1);

    console.log('Invincibility ended');
  }

  updateHealthBar() {
    this.healthBar.clear();

    // 根据生命值百分比选择颜色
    let color;
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffaa00; // 橙色
    } else {
      color = 0xff0000; // 红色
    }

    this.healthBar.fillStyle(color, 1);
    
    const barWidth = 240;
    const currentWidth = (this.health / this.maxHealth) * barWidth;
    this.healthBar.fillRect(20, 20, currentWidth, 30);
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
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