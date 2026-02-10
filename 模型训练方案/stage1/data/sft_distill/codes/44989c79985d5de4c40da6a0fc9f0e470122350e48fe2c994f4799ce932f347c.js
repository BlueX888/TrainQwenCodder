class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建玩家无敌状态纹理（粉色方块）
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0xff69b4, 1); // 粉色
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('playerInvincible', 40, 40);
    invincibleGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI
    this.createUI();

    // 闪烁计时器引用
    this.blinkTimer = null;
  }

  createUI() {
    // 血量文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.updateHealthDisplay();

    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(16, 50, 204, 24);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 无敌状态指示
    this.invincibleText = this.add.text(16, 85, '', {
      fontSize: '18px',
      fill: '#ff69b4',
      fontFamily: 'Arial'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  updateHealthDisplay() {
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量计算颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    let color = 0x00ff00; // 绿色
    if (healthPercent <= 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.6) {
      color = 0xffaa00; // 橙色
    }

    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.currentHealth / this.maxHealth) * 200;
    this.healthBar.fillRect(18, 52, barWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.currentHealth -= 1;
    this.updateHealthDisplay();
    this.updateHealthBar();

    // 检查是否死亡
    if (this.currentHealth <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    
    // 切换到粉色纹理
    this.player.setTexture('playerInvincible');
    
    // 更新无敌状态文本
    this.invincibleText.setText('INVINCIBLE!');

    // 创建闪烁效果
    let blinkCount = 0;
    const maxBlinks = 10; // 0.5秒内闪烁10次
    
    this.blinkTimer = this.time.addEvent({
      delay: this.invincibleDuration / maxBlinks,
      callback: () => {
        blinkCount++;
        // 切换透明度实现闪烁
        this.player.alpha = this.player.alpha === 1 ? 0.3 : 1;
      },
      repeat: maxBlinks - 1
    });

    // 无敌时间结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;
    
    // 恢复正常纹理
    this.player.setTexture('player');
    this.player.alpha = 1;
    
    // 清除无敌状态文本
    this.invincibleText.setText('');
    
    // 清理闪烁计时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }
  }

  gameOver() {
    // 停止所有物理运动
    this.physics.pause();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 添加重启提示
    const restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);
    
    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不更新
    if (this.currentHealth <= 0) {
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