class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 3000; // 3秒无敌时间
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（多个敌人在不同位置移动）
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocity(100, 50);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 300, 'enemy');
    enemy2.setVelocity(-80, 70);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 100, 'enemy');
    enemy3.setVelocity(60, 90);
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

    // 创建血量显示
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.updateHealthDisplay();

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#00ffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 创建游戏说明
    this.add.text(400, 550, '使用方向键移动 | 碰撞敌人扣1血 | 无敌时间3秒', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 用于验证的状态信号
    console.log('Initial Health:', this.health);
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

    // 更新无敌状态显示
    if (this.isInvincible) {
      const remainingTime = Math.ceil(this.invincibleTimer.getRemaining() / 1000);
      this.invincibleText.setText(`无敌时间: ${remainingTime}秒`);
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除1点血量
    this.health -= 1;
    this.updateHealthDisplay();

    console.log('Collision! Health:', this.health);

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
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

    // 改变玩家颜色为蓝色（表示无敌）
    this.player.setTint(0x00ffff);

    // 设置定时器，3秒后取消无敌状态
    this.invincibleTimer = this.time.delayedCall(
      this.invincibleDuration,
      this.deactivateInvincibility,
      [],
      this
    );

    console.log('Invincibility activated for 3 seconds');
  }

  deactivateInvincibility() {
    this.isInvincible = false;

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复完全不透明
    this.player.setAlpha(1);

    // 恢复原始颜色
    this.player.clearTint();

    // 清空无敌提示文本
    this.invincibleText.setText('');

    console.log('Invincibility deactivated');
  }

  updateHealthDisplay() {
    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);

    // 根据血量改变颜色
    if (this.health > 8) {
      this.healthText.setFill('#00ff00'); // 绿色
    } else if (this.health > 4) {
      this.healthText.setFill('#ffff00'); // 黄色
    } else {
      this.healthText.setFill('#ff0000'); // 红色
    }
  }

  gameOver() {
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 如果有无敌状态，取消它
    if (this.isInvincible) {
      this.deactivateInvincibility();
      if (this.invincibleTimer) {
        this.invincibleTimer.remove();
      }
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, '游戏结束！', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // 添加重启提示
    this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    console.log('Game Over! Final Health:', this.health);
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

// 创建游戏实例
const game = new Phaser.Game(config);