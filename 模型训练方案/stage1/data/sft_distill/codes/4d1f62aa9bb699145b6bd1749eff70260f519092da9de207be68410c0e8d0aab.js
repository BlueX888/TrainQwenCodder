class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 状态信号：生命值
    this.isHurt = false; // 受伤状态标记
    this.knockbackDistance = 80; // 击退距离
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setVelocity(-50, 0); // 敌人向左移动

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.onPlayerHit,
      null,
      this
    );

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生命值文本
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(16, 550, 'Use Arrow Keys to Move. Collide with red enemy to trigger hurt effect.', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update() {
    // 玩家移动控制
    if (!this.isHurt) {
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
    if (this.enemy.x <= 30 || this.enemy.x >= 770) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }
  }

  onPlayerHit(player, enemy) {
    // 如果已经在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    // 设置受伤状态
    this.isHurt = true;
    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`);
    this.statusText.setText('Status: Hurt!');
    this.statusText.setColor('#ff0000');

    // 停止玩家移动
    player.setVelocity(0, 0);

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

    // 限制在世界边界内
    const targetX = Phaser.Math.Clamp(knockbackX, 20, 780);
    const targetY = Phaser.Math.Clamp(knockbackY, 20, 580);

    // 击退效果（使用tween移动）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: 200, // 击退持续0.2秒
      ease: 'Power2'
    });

    // 闪烁效果（1秒内循环）
    const blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100, // 每次闪烁0.1秒
      yoyo: true,
      repeat: 9, // 重复9次，总共1秒（10次 * 0.1秒 = 1秒）
      onComplete: () => {
        // 确保最终alpha为1
        player.alpha = 1;
      }
    });

    // 1秒后恢复正常状态
    this.time.delayedCall(1000, () => {
      this.isHurt = false;
      this.statusText.setText('Status: Normal');
      this.statusText.setColor('#ffffff');

      // 检查生命值
      if (this.health <= 0) {
        this.statusText.setText('Status: Game Over!');
        this.statusText.setColor('#ff0000');
        this.physics.pause();
      }
    });

    // 敌人也产生一点反弹效果
    const enemyAngle = angle + Math.PI;
    enemy.setVelocity(
      Math.cos(enemyAngle) * 100,
      Math.sin(enemyAngle) * 100
    );
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

// 启动游戏
new Phaser.Game(config);