class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.isInvincible = false;
    this.invincibleTimer = null;
    this.blinkTween = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建敌人组（3个敌人在不同位置移动）
    this.enemies = this.physics.add.group();
    
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocity(100, 50);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 300, 'enemy');
    enemy2.setVelocity(-80, 100);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 100, 'enemy');
    enemy3.setVelocity(120, -70);
    enemy3.setBounce(1);
    enemy3.setCollideWorldBounds(true);

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
      fontStyle: 'bold'
    });

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(20, 60, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 控制说明
    this.add.text(20, 550, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    if (this.health <= 0) {
      // 游戏结束，停止所有移动
      this.player.setVelocity(0, 0);
      this.enemies.children.entries.forEach(enemy => {
        enemy.setVelocity(0, 0);
      });
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0, 0);

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
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 检查是否游戏结束
    if (this.health <= 0) {
      this.health = 0;
      this.gameOverText.setVisible(true);
      return;
    }

    // 进入无敌状态
    this.isInvincible = true;
    this.invincibleText.setText('INVINCIBLE');

    // 创建闪烁效果（1.5秒内快速切换 alpha 值）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 14, // 100ms * 2 * 15 = 1500ms
      onComplete: () => {
        this.player.alpha = 1;
      }
    });

    // 清除之前的计时器（如果存在）
    if (this.invincibleTimer) {
      this.invincibleTimer.remove();
    }

    // 设置1.5秒后解除无敌状态
    this.invincibleTimer = this.time.delayedCall(1500, () => {
      this.isInvincible = false;
      this.invincibleText.setText('');
      this.invincibleTimer = null;
    });
  }

  updateHealthBar() {
    // 清除之前的血量条
    this.healthBar.clear();

    // 计算血量百分比
    const healthPercent = this.health / this.maxHealth;
    const barWidth = 240 * healthPercent;

    // 根据血量选择颜色
    let color;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }

    // 绘制血量条
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 20, barWidth, 30);
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