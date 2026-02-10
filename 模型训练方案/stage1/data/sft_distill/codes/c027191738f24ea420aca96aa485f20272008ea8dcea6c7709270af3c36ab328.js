class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
    this.invincibleDuration = 4000; // 4秒无敌
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
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
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

    // 创建血量UI
    this.createHealthUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 10, '使用方向键移动\n碰撞扣1血，触发4秒无敌闪烁', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  createHealthUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 550, 204, 24);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(220, 550, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 无敌状态文本
    this.invincibleText = this.add.text(400, 550, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量设置颜色
    let color = 0x00ff00; // 绿色
    if (this.health <= this.maxHealth * 0.3) {
      color = 0xff0000; // 红色
    } else if (this.health <= this.maxHealth * 0.6) {
      color = 0xffaa00; // 橙色
    }

    this.healthBar.fillStyle(color, 1);
    const healthWidth = (this.health / this.maxHealth) * 200;
    this.healthBar.fillRect(12, 552, healthWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
    this.updateHealthBar();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.invincibleText.setText('无敌中！');

    // 创建闪烁效果（使用Tween）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      ease: 'Linear',
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 4秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.isInvincible = false;
    this.invincibleText.setText('');

    // 停止闪烁，恢复完全不透明
    if (this.blinkTween) {
      this.blinkTween.stop();
    }
    this.player.setAlpha(1);
  }

  gameOver() {
    // 停止所有物理
    this.physics.pause();

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 370, '点击重新开始', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.health <= 0) {
      return; // 游戏结束后不更新
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
        enemy.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(-100, 100)
        );
      }
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