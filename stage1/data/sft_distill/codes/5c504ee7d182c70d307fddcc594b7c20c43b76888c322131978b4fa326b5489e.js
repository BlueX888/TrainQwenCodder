class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
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
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + Math.random() * 200,
        'enemy'
      );
      enemy.setVelocity(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
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

    // 添加说明文本
    this.add.text(10, 10, '使用方向键移动\n碰撞扣1血，0.5秒无敌（橙色闪烁）', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createHealthUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 70, 204, 24);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(220, 70, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量百分比绘制血条
    const healthPercent = this.health / this.maxHealth;
    const barWidth = 200 * healthPercent;
    
    // 血量不同颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent <= 0.25) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.5) {
      color = 0xff6600; // 橙色
    } else if (healthPercent <= 0.75) {
      color = 0xffff00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(12, 72, barWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不扣血
    if (this.isInvincible) {
      return;
    }

    // 扣除血量
    this.health = Math.max(0, this.health - 1);
    
    // 更新UI
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

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

    // 停止之前的闪烁动画（如果存在）
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 创建橙色闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      tint: { from: 0xffffff, to: 0xff8800 }, // 白色到橙色
      duration: 100,
      yoyo: true,
      repeat: 4, // 闪烁5次（0.5秒）
      onComplete: () => {
        this.player.setTint(0xffffff);
        this.isInvincible = false;
      }
    });

    // 备用定时器确保无敌状态结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.player.setTint(0xffffff);
    });
  }

  handleDeath() {
    // 玩家死亡
    this.player.setTint(0x666666);
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, '点击重新开始', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 玩家控制
    if (this.physics.world.isPaused) {
      return;
    }

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

    // 敌人随机改变方向
    this.enemies.children.entries.forEach(enemy => {
      if (Math.random() < 0.01) {
        enemy.setVelocity(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        );
      }
    });

    // 显示无敌状态（调试用）
    if (this.isInvincible && !this.invincibleIndicator) {
      this.invincibleIndicator = this.add.text(400, 550, '无敌中...', {
        fontSize: '20px',
        color: '#ff8800',
        fontStyle: 'bold'
      });
      this.invincibleIndicator.setOrigin(0.5);
    } else if (!this.isInvincible && this.invincibleIndicator) {
      this.invincibleIndicator.destroy();
      this.invincibleIndicator = null;
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