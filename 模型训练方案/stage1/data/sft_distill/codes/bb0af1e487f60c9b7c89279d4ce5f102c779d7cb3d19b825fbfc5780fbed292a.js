class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 可验证的状态信号
    this.isInvincible = false;
    this.knockbackSpeed = 240;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建蓝色角色纹理
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（移动的敌人用于测试碰撞）
    this.enemy = this.physics.add.sprite(400, 200, 'enemy');
    this.enemy.setVelocity(100, 100);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

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

    // 显示生命值
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示状态提示
    this.statusText = this.add.text(16, 50, 'Use arrow keys to move', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    // 显示无敌状态
    this.invincibleText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理伤害
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Game Over! Refresh to restart');
      this.physics.pause();
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.invincibleText.setText('Invincible!');

    // 计算击退方向
    const knockbackDirection = new Phaser.Math.Vector2(
      player.x - enemy.x,
      player.y - enemy.y
    ).normalize();

    // 计算击退距离（基于速度240，击退时间0.3秒）
    const knockbackDistance = (this.knockbackSpeed * 0.3) / 60; // 转换为像素
    const knockbackX = player.x + knockbackDirection.x * knockbackDistance;
    const knockbackY = player.y + knockbackDirection.y * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: 300,
      ease: 'Power2'
    });

    // 闪烁效果（0.5秒内闪烁5次）
    let blinkCount = 0;
    const blinkInterval = 50; // 每50ms切换一次，共10次切换（5次闪烁）

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        // 闪烁5次后（10次切换）恢复正常
        if (blinkCount >= 10) {
          player.alpha = 1;
          blinkTimer.destroy();
          this.isInvincible = false;
          this.invincibleText.setText('');
        }
      },
      loop: true
    });

    // 更新状态文本
    this.statusText.setText('Hit! Knockback applied');
    this.time.delayedCall(1000, () => {
      if (this.health > 0) {
        this.statusText.setText('Use arrow keys to move');
      }
    });
  }

  update(time, delta) {
    // 如果游戏结束，不处理输入
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