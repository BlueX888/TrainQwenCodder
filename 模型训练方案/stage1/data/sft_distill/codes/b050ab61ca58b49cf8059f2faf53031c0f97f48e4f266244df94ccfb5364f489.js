class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 无需加载外部资源
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
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI
    this.createUI();

    // 添加说明文字
    this.add.text(10, 10, '使用方向键移动玩家\n避开红色敌人', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  createUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 550, 300, 30);

    // 血量条边框
    this.healthBarBorder = this.add.graphics();
    this.healthBarBorder.lineStyle(2, 0xffffff, 1);
    this.healthBarBorder.strokeRect(10, 550, 300, 30);

    // 血量条填充
    this.healthBar = this.add.graphics();

    // 血量文字
    this.healthText = this.add.text(320, 555, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 无敌状态提示
    this.invincibleText = this.add.text(400, 100, '', {
      fontSize: '24px',
      fill: '#ffff00',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.updateHealthBar();
  }

  updateHealthBar() {
    // 清除旧的血量条
    this.healthBar.clear();

    // 计算血量百分比
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 296 * healthPercent;

    // 根据血量设置颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }

    // 绘制血量条
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(12, 552, barWidth, 26);

    // 更新文字
    this.healthText.setText(`${this.currentHealth} / ${this.maxHealth}`);

    // 游戏结束检测
    if (this.currentHealth <= 0) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();

    // 触发无敌状态
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

    // 震动效果
    this.cameras.main.shake(100, 0.005);
  }

  startInvincibility() {
    this.isInvincible = true;

    // 显示无敌提示
    this.invincibleText.setText('无敌状态！');
    this.invincibleText.setVisible(true);

    // 闪烁效果 - 使用黄色调制
    this.player.setTint(0xffff00);
    
    const blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 0.5秒内闪烁5次
      onComplete: () => {
        // 恢复正常状态
        this.player.setAlpha(1);
        this.player.clearTint();
        this.isInvincible = false;
        this.invincibleText.setVisible(false);
      }
    });

    // 0.5秒后确保状态恢复
    this.time.delayedCall(this.invincibleDuration, () => {
      if (this.isInvincible) {
        this.player.setAlpha(1);
        this.player.clearTint();
        this.isInvincible = false;
        this.invincibleText.setVisible(false);
      }
    });
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 重启提示
    this.add.text(400, 400, '点击重新开始', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
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

    // 敌人随机改变方向
    this.enemies.children.entries.forEach(enemy => {
      if (Phaser.Math.Between(0, 100) < 2) {
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