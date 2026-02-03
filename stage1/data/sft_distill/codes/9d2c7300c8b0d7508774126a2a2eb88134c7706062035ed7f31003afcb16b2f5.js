class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.isHurt = false;
    this.knockbackSpeed = 160;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.originalTint = 0x00ff00;

    // 创建敌人
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setVelocity(-50, 0);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1, 1);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onHit, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生命值
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示说明
    this.add.text(16, 550, 'Arrow keys to move. Collide with red enemy to test hurt effect.', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  onHit(player, enemy) {
    // 如果正在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    // 减少生命值
    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    // 设置受伤状态
    this.isHurt = true;
    this.statusText.setText('Status: HURT!');

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退距离（基于速度160，假设击退时间0.3秒）
    const knockbackTime = 0.3;
    const knockbackDistance = this.knockbackSpeed * knockbackTime;
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackTime * 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 闪烁效果（1秒内白色与原色交替）
    let blinkCount = 0;
    const blinkDuration = 1000; // 1秒
    const blinkInterval = 100; // 每100ms切换一次颜色
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 交替显示白色和绿色
        if (blinkCount % 2 === 0) {
          player.setTint(0xffffff); // 白色
        } else {
          player.clearTint(); // 恢复原色
        }

        // 1秒后停止闪烁
        if (blinkCount >= maxBlinks) {
          player.clearTint();
          this.isHurt = false;
          this.statusText.setText('Status: Normal');
          blinkTimer.destroy();
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: GAME OVER!');
      this.physics.pause();
    }
  }

  update(time, delta) {
    // 只有在非受伤状态下才能控制
    if (!this.isHurt && this.health > 0) {
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