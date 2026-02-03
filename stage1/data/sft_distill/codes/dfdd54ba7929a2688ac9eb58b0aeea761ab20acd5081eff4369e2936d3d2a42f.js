class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
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

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建心形纹理用于血量显示
    const heartGraphics = this.add.graphics();
    heartGraphics.fillStyle(0xff0000, 1);
    heartGraphics.fillRect(0, 0, 20, 20);
    heartGraphics.generateTexture('heart', 20, 20);
    heartGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 250 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

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

    // 添加提示文本
    this.add.text(10, 10, '使用方向键移动玩家', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(10, 550, '碰撞敌人扣1血，0.5秒无敌（橙色闪烁）', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 状态信号文本
    this.statusText = this.add.text(10, 70, '', {
      fontSize: '14px',
      color: '#ffff00'
    });
    this.updateStatusText();
  }

  createHealthUI() {
    this.healthIcons = [];
    const startX = 10;
    const startY = 40;
    const spacing = 25;

    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(startX + i * spacing, startY, 'heart');
      heart.setOrigin(0, 0);
      this.healthIcons.push(heart);
    }
  }

  updateHealthUI() {
    this.healthIcons.forEach((heart, index) => {
      if (index < this.health) {
        heart.setAlpha(1);
      } else {
        heart.setAlpha(0.3);
      }
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health--;
    this.updateHealthUI();
    this.updateStatusText();

    console.log(`碰撞！当前血量: ${this.health}`);

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

    // 橙色闪烁效果
    // 设置橙色tint
    this.player.setTint(0xffa500);

    // 创建闪烁动画（透明度变化）
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共约0.5秒
      onComplete: () => {
        this.endInvincibility();
      }
    });

    // 备用定时器（确保0.5秒后结束无敌）
    this.invincibleTimer = this.time.delayedCall(
      this.invincibleDuration,
      () => {
        if (this.isInvincible) {
          this.endInvincibility();
        }
      }
    );
  }

  endInvincibility() {
    this.isInvincible = false;
    
    // 恢复正常外观
    this.player.clearTint();
    this.player.setAlpha(1);

    // 清理动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 清理定时器
    if (this.invincibleTimer) {
      this.invincibleTimer.remove();
    }

    this.updateStatusText();
    console.log('无敌状态结束');
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `状态: ${invincibleStatus} | 血量: ${this.health}/${this.maxHealth}`
    );
  }

  gameOver() {
    console.log('游戏结束！');
    
    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 370, '点击重启', {
      fontSize: '24px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    // 禁用玩家控制
    this.player.setVelocity(0, 0);
    this.cursors = null;
  }

  update(time, delta) {
    if (!this.cursors || this.health <= 0) {
      return;
    }

    const speed = 200;

    // 玩家移动控制
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

// 创建游戏实例
new Phaser.Game(config);