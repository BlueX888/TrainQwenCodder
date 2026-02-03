class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 受伤次数统计
    this.isInvincible = false; // 无敌状态
  }

  preload() {
    // 创建绿色玩家纹理
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
    // 创建玩家（绿色）
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建敌人（红色）
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);
    
    // 给敌人一个初始速度，让它移动
    this.enemy.setVelocity(150, 100);

    // 设置碰撞检测
    this.physics.add.collider(
      this.player,
      this.enemy,
      this.handleCollision,
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

    // 显示无敌状态
    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 提示信息
    this.add.text(16, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffff00'
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不触发受伤效果
    if (this.isInvincible) {
      return;
    }

    // 增加受伤计数
    this.hitCount++;
    this.hitText.setText('Hit Count: ' + this.hitCount);

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Invincible');

    // 计算击退方向（从敌人到玩家的方向）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退速度为300
    const knockbackSpeed = 300;
    const knockbackVelocityX = Math.cos(angle) * knockbackSpeed;
    const knockbackVelocityY = Math.sin(angle) * knockbackSpeed;

    // 应用击退效果
    player.setVelocity(knockbackVelocityX, knockbackVelocityY);

    // 停止当前所有闪烁动画（防止重复）
    this.tweens.killTweensOf(player);

    // 创建1秒闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，加上初始的一次，总共5个循环，约1秒
      onComplete: () => {
        // 闪烁结束后恢复正常
        player.alpha = 1;
        this.isInvincible = false;
        this.statusText.setText('Status: Normal');
      }
    });

    // 可选：敌人也受到反作用力
    const enemyKnockbackX = Math.cos(angle + Math.PI) * 200;
    const enemyKnockbackY = Math.sin(angle + Math.PI) * 200;
    enemy.setVelocity(enemyKnockbackX, enemyKnockbackY);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

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

    // 显示当前速度（用于调试）
    const velocity = this.player.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 更新状态文本，显示更多信息
    if (!this.isInvincible) {
      this.statusText.setText(
        `Status: Normal | Speed: ${Math.round(currentSpeed)}`
      );
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
      debug: false // 设置为true可以看到碰撞框
    }
  },
  scene: GameScene
};

new Phaser.Game(config);