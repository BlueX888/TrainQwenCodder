class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isInvincible = false;
    this.health = 100;
    this.hitCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9933ff, 1); // 紫色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(20);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 200, y: 400 },
      { x: 600, y: 400 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 敌人之间的碰撞
    this.physics.add.collider(this.enemies, this.enemies);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(10, 550, '方向键移动 | 碰撞敌人触发受伤效果', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.hitCount++;
    this.health = Math.max(0, this.health - 10);

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退速度 200
    const knockbackSpeed = 200;
    const knockbackVelocityX = Math.cos(angle) * knockbackSpeed;
    const knockbackVelocityY = Math.sin(angle) * knockbackSpeed;

    // 应用击退效果
    player.setVelocity(knockbackVelocityX, knockbackVelocityY);

    // 创建闪烁效果 - 2.5秒内闪烁
    const blinkDuration = 2500; // 2.5秒
    const blinkInterval = 100; // 每100ms切换一次
    const blinkCount = blinkDuration / blinkInterval;

    // 停止之前的闪烁动画（如果有）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁Tween
    this.blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: blinkInterval / 2,
      yoyo: true,
      repeat: blinkCount - 1,
      onComplete: () => {
        player.alpha = 1;
        this.isInvincible = false;
        this.updateStatusText();
      }
    });

    // 击退效果持续约0.3秒后恢复控制
    this.time.delayedCall(300, () => {
      // 减缓速度，允许玩家重新控制
      player.setVelocity(
        player.body.velocity.x * 0.3,
        player.body.velocity.y * 0.3
      );
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `生命值: ${this.health} | 受击次数: ${this.hitCount} | 状态: ${invincibleStatus}`
    );
  }

  update(time, delta) {
    // 玩家移动控制（只在非击退状态下响应）
    if (!this.isInvincible || time % 100 > 50) {
      const speed = 200;

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      } else if (!this.isInvincible) {
        // 只在非无敌状态下停止水平移动
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      } else if (!this.isInvincible) {
        // 只在非无敌状态下停止垂直移动
        this.player.setVelocityY(0);
      }
    }

    // 游戏结束检测
    if (this.health <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.physics.pause();
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
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