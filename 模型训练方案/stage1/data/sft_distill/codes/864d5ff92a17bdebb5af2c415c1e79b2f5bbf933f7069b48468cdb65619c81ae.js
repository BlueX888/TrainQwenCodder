class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证状态信号
    this.isInvincible = false; // 无敌状态
    this.blinkTimer = null;
    this.invincibleTimer = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（红色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（移动的敌人）
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 0);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加UI显示
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 添加说明文字
    this.add.text(16, 550, 'Use Arrow Keys to move. Collide with blue enemy to trigger hurt effect.', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，不触发伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`);

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: Game Over!');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
      return;
    }

    // 进入无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Hurt (Invincible)');
    this.statusText.setColor('#ff0000');

    // 计算击退方向
    const knockbackDirection = new Phaser.Math.Vector2(
      player.x - enemy.x,
      player.y - enemy.y
    ).normalize();

    // 击退距离计算（速度120，击退时间0.3秒，距离 = 速度 * 时间）
    const knockbackDistance = 120 * 0.3; // 36像素
    const targetX = player.x + knockbackDirection.x * knockbackDistance;
    const targetY = player.y + knockbackDirection.y * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 执行击退动画
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: 300, // 0.3秒完成击退
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 实现闪烁效果（3秒，每0.1秒切换）
    let blinkCount = 0;
    const maxBlinks = 30; // 3秒 / 0.1秒 = 30次
    
    this.blinkTimer = this.time.addEvent({
      delay: 100, // 0.1秒
      callback: () => {
        blinkCount++;
        // 切换透明度实现闪烁
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 3秒后停止闪烁
        if (blinkCount >= maxBlinks) {
          player.alpha = 1;
          this.isInvincible = false;
          this.statusText.setText('Status: Normal');
          this.statusText.setColor('#00ff00');
          if (this.blinkTimer) {
            this.blinkTimer.remove();
            this.blinkTimer = null;
          }
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 如果游戏结束，不更新
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制（只在非击退状态下可控制）
    if (!this.tweens.isTweening(this.player)) {
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