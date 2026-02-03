class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 受伤次数统计（验证信号）
    this.isInvincible = false; // 无敌状态
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（绿色）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人精灵（红色）
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setVelocity(50, 0); // 敌人向左移动

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示受伤次数
    this.hitText = this.add.text(16, 16, 'Hit Count: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态提示
    this.statusText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffff00'
    });
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 增加受伤计数
    this.hitCount++;
    this.hitText.setText('Hit Count: ' + this.hitCount);

    // 设置无敌状态
    this.isInvincible = true;

    // 计算击退方向（从敌人指向玩家）
    const knockbackSpeed = 120;
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退距离（速度120，持续0.3秒）
    const knockbackDistance = knockbackSpeed * 0.3;
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 限制目标位置在世界边界内
    const clampedX = Phaser.Math.Clamp(targetX, 20, 780);
    const clampedY = Phaser.Math.Clamp(targetY, 20, 580);

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 创建击退动画
    this.tweens.add({
      targets: player,
      x: clampedX,
      y: clampedY,
      duration: 300,
      ease: 'Power2'
    });

    // 实现闪烁效果（1秒，每0.1秒切换）
    let blinkCount = 0;
    const blinkTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        // 1秒后停止闪烁（10次切换）
        if (blinkCount >= 10) {
          player.alpha = 1;
          blinkTimer.remove();
          this.isInvincible = false; // 解除无敌状态
        }
      },
      loop: true
    });

    // 更新状态提示
    this.statusText.setText('Hit! Invincible for 1 second');
    this.time.delayedCall(1000, () => {
      this.statusText.setText('Use Arrow Keys to Move');
    });
  }

  update(time, delta) {
    // 如果不在无敌状态，允许玩家移动
    if (!this.isInvincible) {
      const speed = 160;

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

    // 敌人边界反弹
    if (this.enemy.x <= 20 || this.enemy.x >= 780) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }
    if (this.enemy.y <= 20 || this.enemy.y >= 580) {
      this.enemy.setVelocityY(-this.enemy.body.velocity.y);
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