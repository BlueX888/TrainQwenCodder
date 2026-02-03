class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
  }

  preload() {
    // 不需要加载外部资源
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
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + Math.sin(i) * 50,
        'enemy'
      );
      enemy.setVelocity(
        50 + i * 20,
        80 + i * 15
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

    // 创建生命值显示
    this.createHealthDisplay();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 游戏状态文本
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 30, '使用方向键移动 | 避开红色敌人 | 碰撞后绿色闪烁0.5秒无敌', {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  createHealthDisplay() {
    // 创建心形纹理
    const heartGraphics = this.add.graphics();
    heartGraphics.fillStyle(0xff0000, 1);
    // 绘制简单的心形（使用圆形和三角形组合）
    heartGraphics.fillCircle(8, 8, 6);
    heartGraphics.fillCircle(16, 8, 6);
    heartGraphics.fillTriangle(2, 10, 22, 10, 12, 22);
    heartGraphics.generateTexture('heart', 24, 24);
    heartGraphics.destroy();

    // 创建心形容器
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(50 + i * 35, 50, 'heart');
      this.hearts.push(heart);
    }

    // 创建生命值文本
    this.healthText = this.add.text(20, 70, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  updateHealthDisplay() {
    // 更新心形显示
    for (let i = 0; i < this.hearts.length; i++) {
      if (i < this.health) {
        this.hearts[i].setAlpha(1);
      } else {
        this.hearts[i].setAlpha(0.3);
      }
    }

    // 更新文本
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health = Math.max(0, this.health - 1);
    this.updateHealthDisplay();

    // 检查游戏是否结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们设置为500ms）
      onComplete: () => {
        this.player.setAlpha(1);
        this.isInvincible = false;
      }
    });

    // 设置无敌时间（0.5秒）
    this.time.delayedCall(500, () => {
      this.isInvincible = false;
      this.player.setAlpha(1);
    });
  }

  gameOver() {
    // 停止所有敌人移动
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示游戏结束文本
    this.statusText.setText('游戏结束！\n点击重新开始');
    this.statusText.setStyle({ fontSize: '32px', fill: '#ff0000' });

    // 禁用物理
    this.physics.pause();

    // 添加重启功能
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏已结束，不更新
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

    // 显示无敌状态
    if (this.isInvincible) {
      this.statusText.setText('无敌中...');
      this.statusText.setStyle({ fontSize: '20px', fill: '#00ff00' });
    } else {
      this.statusText.setText('');
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