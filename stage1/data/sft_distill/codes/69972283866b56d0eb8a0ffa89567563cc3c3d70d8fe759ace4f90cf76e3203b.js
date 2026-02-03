class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.isInvulnerable = false;
    this.blinkTimer = null;
    this.knockbackSpeed = 120;
    this.knockbackDistance = 100; // 与速度120相关的击退距离
  }

  preload() {
    // 创建绿色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建绿色角色
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(16);

    // 创建多个红色敌人
    this.enemies = this.physics.add.group();
    
    // 添加3个敌人在不同位置
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setCircle(16);
      // 敌人随机移动
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本显示状态
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 说明文字
    this.add.text(16, 560, 'Arrow Keys to Move | Collide with red enemies to test damage', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  handleCollision(player, enemy) {
    // 如果正在无敌时间，不触发受伤
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    // 设置无敌状态
    this.isInvulnerable = true;

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退目标位置
    const knockbackX = player.x + Math.cos(angle) * this.knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * this.knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 播放击退动画（使用Tween）
    // 击退时间 = 距离 / 速度 = 100 / 120 ≈ 0.833秒
    const knockbackDuration = (this.knockbackDistance / this.knockbackSpeed) * 1000;
    
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackDuration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 开始闪烁效果（1秒内闪烁）
    this.startBlinking(player, 1000);

    // 更新状态文本
    this.statusText.setText('Status: Damaged!');
    this.statusText.setColor('#ff0000');

    // 1秒后解除无敌状态
    this.time.delayedCall(1000, () => {
      this.isInvulnerable = false;
      this.statusText.setText('Status: Normal');
      this.statusText.setColor('#00ff00');
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  startBlinking(sprite, duration) {
    // 清除之前的闪烁定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    let blinkCount = 0;
    const blinkInterval = 100; // 每100ms切换一次
    const totalBlinks = duration / blinkInterval;

    // 创建闪烁定时器
    this.blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换透明度
        sprite.alpha = sprite.alpha === 1 ? 0.3 : 1;

        // 闪烁结束
        if (blinkCount >= totalBlinks) {
          sprite.alpha = 1; // 恢复完全不透明
          this.blinkTimer.remove();
          this.blinkTimer = null;
        }
      },
      loop: true
    });
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);

    this.statusText.setText('Status: Dead');
    this.statusText.setColor('#ff0000');

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      this.health = 3;
      this.isInvulnerable = false;
    });
  }

  update() {
    // 只有在非无敌状态且游戏未结束时才能移动
    if (!this.isInvulnerable && this.health > 0) {
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

    // 敌人边界反弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.body.blocked.left || enemy.body.blocked.right) {
        enemy.setVelocityX(-enemy.body.velocity.x);
      }
      if (enemy.body.blocked.up || enemy.body.blocked.down) {
        enemy.setVelocityY(-enemy.body.velocity.y);
      }
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