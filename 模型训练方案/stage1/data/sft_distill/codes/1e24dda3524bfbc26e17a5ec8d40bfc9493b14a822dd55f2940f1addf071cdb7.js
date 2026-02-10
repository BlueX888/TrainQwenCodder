class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5;
    this.maxHealth = 5;
    this.isInvincible = false;
    this.invincibleDuration = 1000; // 1秒无敌时间
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人进行测试
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建3个敌人
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 400, y: 450 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量显示文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateHealthDisplay();

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(16, 60, '', {
      fontSize: '24px',
      fill: '#ff00ff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.invincibleText.setVisible(false);

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(16, 550, '使用方向键移动，碰到红色方块会受伤', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 如果游戏结束，停止更新
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
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除1点血量
    this.health -= 1;
    this.updateHealthDisplay();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleDeath();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    this.invincibleText.setVisible(true);
    this.invincibleText.setText('无敌中...');

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建粉色闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff00ff, // 粉色
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始1次共10次闪烁，约1秒
      onComplete: () => {
        // 恢复正常状态
        this.player.setAlpha(1);
        this.player.clearTint();
        this.isInvincible = false;
        this.invincibleText.setVisible(false);
      }
    });

    // 设置1秒后解除无敌状态（双重保险）
    this.time.delayedCall(this.invincibleDuration, () => {
      if (this.isInvincible) {
        this.player.setAlpha(1);
        this.player.clearTint();
        this.isInvincible = false;
        this.invincibleText.setVisible(false);
      }
    });
  }

  updateHealthDisplay() {
    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health <= 1) {
      this.healthText.setColor('#ff0000'); // 红色
    } else if (this.health <= 2) {
      this.healthText.setColor('#ffaa00'); // 橙色
    } else {
      this.healthText.setColor('#ffffff'); // 白色
    }
  }

  handleDeath() {
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

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
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