class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 15;
    this.maxHealth = 15;
    this.isInvincible = false;
    this.blinkTimer = 0;
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

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 添加多个敌人，随机位置
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
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

    // 创建血量UI
    this.createHealthUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(10, 10, 'Arrow keys to move\nAvoid red enemies!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 游戏状态信号
    this.gameState = {
      health: this.health,
      isInvincible: this.isInvincible,
      collisionCount: 0
    };
  }

  createHealthUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 550, 300, 30);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文字
    this.healthText = this.add.text(320, 555, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量百分比选择颜色
    let color = 0x00ff00; // 绿色
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent <= 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.health / this.maxHealth) * 290;
    this.healthBar.fillRect(15, 555, barWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.gameState.health = this.health;
    this.gameState.collisionCount++;
    
    // 更新UI
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 检查游戏结束
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 启动无敌状态
    this.startInvincibility();

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
  }

  startInvincibility() {
    this.isInvincible = true;
    this.gameState.isInvincible = true;
    this.blinkTimer = 0;

    // 设置玩家为橙色（无敌状态指示）
    this.player.setTint(0xffa500);

    // 1秒后结束无敌状态
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      this.gameState.isInvincible = false;
      this.player.clearTint();
      this.player.setAlpha(1); // 确保完全显示
    });
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const statsText = this.add.text(400, 380, 
      `Total Collisions: ${this.gameState.collisionCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    statsText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  update(time, delta) {
    // 游戏结束后不更新
    if (this.health <= 0) {
      return;
    }

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

    // 无敌状态闪烁效果
    if (this.isInvincible) {
      this.blinkTimer += delta;
      // 每100ms切换一次显示状态
      const blinkInterval = 100;
      const shouldShow = Math.floor(this.blinkTimer / blinkInterval) % 2 === 0;
      this.player.setAlpha(shouldShow ? 1 : 0.3);
    }
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