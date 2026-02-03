class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.invincible = false;
    this.invincibleDuration = 3000; // 3秒无敌时间
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
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度
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

    // 创建血量UI
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.updateHealthUI();

    // 创建无敌状态提示
    this.invincibleText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#00ffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 创建说明文本
    this.add.text(16, 560, '方向键移动 | 避开红色敌人 | 碰撞后3秒无敌', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 用于跟踪闪烁tween
    this.blinkTween = null;
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

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.invincible) {
      return;
    }

    // 扣除1点血量
    this.health -= 1;
    this.updateHealthUI();

    console.log(`碰撞！当前血量: ${this.health}/${this.maxHealth}`);

    // 如果还有血量，触发无敌状态
    if (this.health > 0) {
      this.activateInvincibility();
    }
  }

  activateInvincibility() {
    // 设置无敌状态
    this.invincible = true;
    this.invincibleText.setText('无敌中...');

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: -1, // 无限循环
      ease: 'Linear'
    });

    // 3秒后取消无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.invincible = false;
    this.invincibleText.setText('');

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
      this.blinkTween = null;
    }

    // 恢复完全不透明
    this.player.setAlpha(1);

    console.log('无敌状态结束');
  }

  updateHealthUI() {
    // 根据血量变化颜色
    let color = '#00ff00'; // 绿色
    if (this.health <= 4) {
      color = '#ff0000'; // 红色
    } else if (this.health <= 8) {
      color = '#ffff00'; // 黄色
    }

    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);
    this.healthText.setFill(color);
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, '游戏结束！', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // 显示重启提示
    const restartText = this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);

    console.log('游戏结束！血量耗尽。');
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