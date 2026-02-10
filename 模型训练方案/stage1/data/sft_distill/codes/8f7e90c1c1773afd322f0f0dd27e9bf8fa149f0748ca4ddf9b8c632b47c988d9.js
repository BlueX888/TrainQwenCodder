class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
    this.invincibleDuration = 4000; // 4秒
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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

    // 创建血量显示
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.updateHealthDisplay();

    // 创建无敌状态显示
    this.invincibleText = this.add.text(16, 60, '', {
      fontSize: '24px',
      fill: '#00ff00',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 创建控制说明
    this.add.text(16, 550, '方向键移动玩家', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 闪烁动画引用
    this.blinkTween = null;
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
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthDisplay();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 更新无敌状态显示
    this.invincibleText.setText('无敌状态');

    // 启动闪烁动画
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限循环
    });

    // 设置定时器，4秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;

    // 停止闪烁动画
    if (this.blinkTween) {
      this.blinkTween.stop();
      this.blinkTween = null;
    }

    // 恢复玩家完全不透明
    this.player.setAlpha(1);

    // 清除无敌状态显示
    this.invincibleText.setText('');
  }

  updateHealthDisplay() {
    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health <= 5) {
      this.healthText.setStyle({ fill: '#ff0000' });
    } else if (this.health <= 10) {
      this.healthText.setStyle({ fill: '#ffff00' });
    } else {
      this.healthText.setStyle({ fill: '#00ff00' });
    }
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 停止闪烁动画
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    // 显示重启提示
    const restartText = this.add.text(400, 380, '点击重启游戏', {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
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