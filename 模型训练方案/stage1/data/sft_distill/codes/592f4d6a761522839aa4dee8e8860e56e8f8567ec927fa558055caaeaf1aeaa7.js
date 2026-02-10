class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5;
    this.maxHealth = 5;
    this.isInvincible = false;
    this.invincibleDuration = 2000; // 2秒
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
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
    
    // 创建3个敌人，随机位置移动
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(50, 300),
        'enemy'
      );
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量显示
    this.createHealthDisplay();

    // 添加说明文字
    this.add.text(10, 10, '方向键移动 | 躲避红色敌人', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加状态文字
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '18px',
      color: '#ffff00'
    });
  }

  createHealthDisplay() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 40, 210, 30);

    // 血量条
    this.healthBar = this.add.graphics();
    
    // 血量文字
    this.healthText = this.add.text(220, 45, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.updateHealthDisplay();
  }

  updateHealthDisplay() {
    // 清除并重绘血量条
    this.healthBar.clear();
    
    // 根据血量选择颜色
    let color = 0x00ff00; // 绿色
    if (this.health <= 2) {
      color = 0xff0000; // 红色
    } else if (this.health <= 3) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.health / this.maxHealth) * 200;
    this.healthBar.fillRect(15, 45, barWidth, 20);

    // 更新文字
    this.healthText.setText(`${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不受伤害
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthDisplay();

    // 显示受伤提示
    this.statusText.setText('受到伤害！无敌中...');

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果（紫色和透明交替）
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff00ff, // 紫色
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 2秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;

    // 停止闪烁
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复正常外观
    this.player.setAlpha(1);
    this.player.setTint(0xffffff);

    // 清除状态文字
    this.statusText.setText('');
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 370, '点击重新开始', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
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