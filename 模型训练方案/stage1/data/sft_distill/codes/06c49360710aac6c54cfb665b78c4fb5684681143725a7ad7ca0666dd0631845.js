class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 3;
    this.isInvincible = false;
    this.blinkTimer = null;
    this.collisionCount = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(-100, 0);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.handleCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.collisionText = this.add.text(16, 50, `Collisions: ${this.collisionCount}`, {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 85, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示信息
    this.add.text(400, 550, 'Use Arrow Keys to Move | Collide with Red Enemy', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.playerHealth--;
    this.collisionCount++;
    this.healthText.setText(`Health: ${this.playerHealth}`);
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.statusText.setText('Status: GAME OVER');
      this.statusText.setStyle({ fill: '#ff0000' });
      this.physics.pause();
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Invincible');
    this.statusText.setStyle({ fill: '#ffaa00' });

    // 计算击退方向（从敌人到玩家的向量）
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 击退距离基于速度360（这里假设基础速度为360）
    const knockbackSpeed = 360;
    const knockbackDistance = 100; // 击退100像素
    const knockbackDuration = 200; // 击退持续200ms

    // 计算击退目标位置
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 创建击退Tween
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackDuration,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后可以恢复控制
      }
    });

    // 闪烁效果：1秒内每0.3秒切换alpha
    let blinkCount = 0;
    const maxBlinks = 6; // 1秒内闪烁3次（显示-隐藏-显示-隐藏-显示-隐藏）

    // 清除之前的闪烁定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    // 创建闪烁定时器
    this.blinkTimer = this.time.addEvent({
      delay: 166, // 约1000ms / 6 = 166ms每次切换
      callback: () => {
        blinkCount++;
        // 切换alpha值
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 闪烁完成
        if (blinkCount >= maxBlinks) {
          player.alpha = 1;
          this.isInvincible = false;
          this.statusText.setText('Status: Normal');
          this.statusText.setStyle({ fill: '#00ff00' });
          this.blinkTimer.remove();
          this.blinkTimer = null;
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 只有不在无敌状态时才能移动
    if (!this.isInvincible) {
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

    // 敌人简单AI：边界反弹
    if (this.enemy.body) {
      if (this.enemy.body.blocked.left || this.enemy.body.blocked.right) {
        this.enemy.setVelocityX(-this.enemy.body.velocity.x);
      }
      if (this.enemy.body.blocked.up || this.enemy.body.blocked.down) {
        this.enemy.setVelocityY(-this.enemy.body.velocity.y);
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