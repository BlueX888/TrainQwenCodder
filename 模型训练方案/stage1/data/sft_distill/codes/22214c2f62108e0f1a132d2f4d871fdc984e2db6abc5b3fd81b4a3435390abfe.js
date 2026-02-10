class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
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

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人（在不同位置移动）
    this.enemies = this.physics.add.group();
    
    // 添加3个敌人
    const enemy1 = this.enemies.create(100, 100, 'enemy');
    enemy1.setVelocity(100, 50);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(700, 500, 'enemy');
    enemy2.setVelocity(-80, -60);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 100, 'enemy');
    enemy3.setVelocity(60, 100);
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

    // 创建血量显示文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.updateHealthText();

    // 创建无敌状态提示文本
    this.statusText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 创建游戏结束文本（隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(16, 560, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update() {
    // 游戏结束后停止更新
    if (this.health <= 0) {
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
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthText();

    // 检查游戏是否结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.statusText.setText('INVINCIBLE');

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果（快速切换alpha值）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们只需要500ms）
      onComplete: () => {
        this.player.alpha = 1; // 确保最终alpha为1
      }
    });

    // 设置定时器，0.5秒后取消无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.statusText.setText('');
      this.player.alpha = 1; // 确保alpha恢复正常
    });
  }

  updateHealthText() {
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health <= 3) {
      this.healthText.setFill('#ff0000'); // 低血量红色
    } else if (this.health <= 6) {
      this.healthText.setFill('#ffaa00'); // 中等血量橙色
    } else {
      this.healthText.setFill('#ffffff'); // 高血量白色
    }
  }

  gameOver() {
    // 停止所有敌人移动
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 停止闪烁动画
    if (this.blinkTween) {
      this.blinkTween.stop();
    }
    this.player.alpha = 0.5;

    // 添加重启提示
    const restartText = this.add.text(400, 360, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });
    restartText.setOrigin(0.5);

    // 添加空格键重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
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