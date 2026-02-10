class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
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
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.originalTint = 0x00ff00;

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，随机位置
    for (let i = 0; i < 3; i++) {
      const x = 100 + i * 250;
      const y = 100 + Math.random() * 200;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.healthText = this.add.text(16, 16, `血量: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setDepth(100);

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setDepth(100);
    this.statusText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 提示文本
    this.add.text(16, 560, '方向键移动 | 碰撞扣1血 | 无敌时紫色闪烁', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health = Math.max(0, this.health - 1);
    this.updateHealthUI();

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌帧
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 改变颜色为紫色并开始闪烁
    this.player.setTint(0x9900ff);

    // 创建闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 1.5秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.isInvincible = false;

    // 停止闪烁
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复原始颜色和透明度
    this.player.clearTint();
    this.player.setAlpha(1);
  }

  updateHealthUI() {
    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health <= 5) {
      this.healthText.setStyle({ fill: '#ff0000' });
    } else if (this.health <= 10) {
      this.healthText.setStyle({ fill: '#ffaa00' });
    } else {
      this.healthText.setStyle({ fill: '#ffffff' });
    }
  }

  gameOver() {
    // 停止所有物理
    this.physics.pause();

    // 停止无敌闪烁
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 显示游戏结束
    this.statusText.setText('游戏结束！');
    this.statusText.setVisible(true);

    // 玩家变灰
    this.player.setTint(0x888888);
    this.player.setAlpha(1);
  }

  update(time, delta) {
    // 如果游戏结束，不更新
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