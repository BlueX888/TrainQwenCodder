class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
    this.invincibleDuration = 3000; // 3秒无敌
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量条 UI
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 30, '', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);

    // 更新状态显示
    this.updateStatusText();
  }

  createHealthBar() {
    const barX = 50;
    const barY = 50;
    const barWidth = 200;
    const barHeight = 30;

    // 背景（黑色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    // 血量条（红色）
    this.healthBar = this.add.graphics();
    
    // 血量文本
    this.healthText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, '', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateHealthBar();
  }

  updateHealthBar() {
    const barX = 50;
    const barY = 50;
    const barWidth = 200;
    const barHeight = 30;

    this.healthBar.clear();
    
    // 根据当前血量绘制
    const healthPercent = this.health / this.maxHealth;
    const currentWidth = barWidth * healthPercent;

    // 血量颜色（血量低时变黄色）
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.5) {
      color = 0xffff00; // 黄色
    }
    if (healthPercent < 0.25) {
      color = 0xff0000; // 红色
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, currentWidth, barHeight);

    // 更新文本
    this.healthText.setText(`${this.health} / ${this.maxHealth}`);
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? ' [INVINCIBLE]' : '';
    this.statusText.setText(`Health: ${this.health}${invincibleStatus}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不扣血
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthBar();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌帧
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    this.updateStatusText();

    // 停止之前的闪烁动画（如果有）
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 创建粉色闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.3 },
      tint: { from: 0xffffff, to: 0xff00ff }, // 粉色
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 3秒后结束无敌
    if (this.invincibleTimer) {
      this.invincibleTimer.remove();
    }

    this.invincibleTimer = this.time.delayedCall(
      this.invincibleDuration,
      () => {
        this.endInvincibility();
      }
    );
  }

  endInvincibility() {
    this.isInvincible = false;
    this.updateStatusText();

    // 停止闪烁动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复玩家外观
    this.player.setAlpha(1);
    this.player.setTint(0xffffff);
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 停止所有动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 玩家变灰
    this.player.setTint(0x888888);
    this.player.setAlpha(0.5);

    // 添加重启提示
    this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不处理输入
    if (this.health <= 0) {
      return;
    }

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
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);