class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.hitCount = 0;
    this.isInvincible = false;
  }

  preload() {
    // 无需加载外部资源
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
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800, 800); // 添加阻力使击退更自然

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI 文本
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.hitCountText = this.add.text(16, 48, `Hit Count: ${this.hitCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '24px',
      fill: '#00ff00'
    });
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hit Count: ${this.hitCount}`);

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Invincible');
    this.statusText.setColor('#ffff00');

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退速度 300
    const knockbackSpeed = 300;
    const velocityX = Math.cos(angle) * knockbackSpeed;
    const velocityY = Math.sin(angle) * knockbackSpeed;

    // 应用击退速度
    player.setVelocity(velocityX, velocityY);

    // 闪烁效果 - 1 秒内多次闪烁
    const blinkTween = this.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      ease: 'Linear',
      yoyo: true,
      repeat: 9, // 重复 9 次，加上初始执行共 10 次闪烁，总时长 1 秒
      onComplete: () => {
        // 闪烁结束后恢复正常
        player.alpha = 1;
        this.isInvincible = false;
        this.statusText.setText('Status: Normal');
        this.statusText.setColor('#00ff00');

        // 检查游戏是否结束
        if (this.health <= 0) {
          this.statusText.setText('Status: Game Over');
          this.statusText.setColor('#ff0000');
          this.physics.pause();
        }
      }
    });

    // 击退效果渐减（通过阻力自然减速）
    this.time.delayedCall(200, () => {
      // 200ms 后开始减速更明显
      player.setDrag(1200, 1200);
    });

    this.time.delayedCall(500, () => {
      // 500ms 后恢复正常阻力
      player.setDrag(800, 800);
    });
  }

  update(time, delta) {
    // 如果游戏结束，停止更新
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
      // 如果没有按键输入，保持当前速度（用于击退效果）
      if (Math.abs(this.player.body.velocity.x) < 10) {
        this.player.setVelocityX(0);
      }
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      if (Math.abs(this.player.body.velocity.y) < 10) {
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