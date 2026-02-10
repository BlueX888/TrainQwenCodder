class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（青色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FFFF, 1); // 青色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xFF0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemyTex', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + i * 50,
        'enemyTex'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
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

    // 创建血量显示文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      color: '#00FFFF',
      fontFamily: 'Arial'
    });
    this.updateHealthText();

    // 创建状态提示文本
    this.statusText = this.add.text(16, 56, '', {
      fontSize: '24px',
      color: '#FFFF00',
      fontFamily: 'Arial'
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(16, 560, '方向键移动 | 碰撞扣1血 | 无敌时间1.5秒', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
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

    // 更新状态文本
    if (this.isInvincible) {
      this.statusText.setText('无敌状态中...');
    } else {
      this.statusText.setText('');
    }

    // 检查游戏结束
    if (this.currentHealth <= 0) {
      this.statusText.setText('游戏结束！');
      this.statusText.setColor('#FF0000');
      this.scene.pause();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除1点血量
    this.currentHealth -= 1;
    this.updateHealthText();

    // 进入无敌状态
    this.isInvincible = true;

    // 创建闪烁效果
    this.createBlinkEffect();

    // 1.5秒后解除无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.player.setAlpha(1); // 确保完全显示
      
      // 停止所有闪烁tween
      this.tweens.killTweensOf(this.player);
    });

    // 敌人反弹效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    enemy.setVelocity(
      -Math.cos(angle) * 200,
      -Math.sin(angle) * 200
    );
  }

  createBlinkEffect() {
    // 停止之前的闪烁效果
    this.tweens.killTweensOf(this.player);

    // 创建闪烁动画：在1.5秒内循环闪烁
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      ease: 'Linear',
      yoyo: true,
      repeat: Math.floor(this.invincibleDuration / 300) - 1
    });
  }

  updateHealthText() {
    this.healthText.setText(`血量: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.currentHealth <= 5) {
      this.healthText.setColor('#FF0000'); // 红色警告
    } else if (this.currentHealth <= 10) {
      this.healthText.setColor('#FFFF00'); // 黄色警告
    } else {
      this.healthText.setColor('#00FFFF'); // 青色正常
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);