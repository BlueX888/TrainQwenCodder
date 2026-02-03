class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 状态信号：玩家生命值
    this.isHurt = false; // 受伤状态标记
    this.knockbackSpeed = 360; // 击退速度
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
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocityX(-100); // 敌人向左移动
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 添加说明文字
    this.add.text(16, 550, 'Use Arrow Keys to Move | Collide with Red Enemy to Trigger Hurt Effect', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  handleCollision(player, enemy) {
    // 如果已经在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    // 标记受伤状态
    this.isHurt = true;
    this.health -= 10; // 减少生命值
    this.healthText.setText(`Health: ${this.health}`);
    this.statusText.setText('Status: HURT!');
    this.statusText.setColor('#ff0000');

    // 计算击退方向（从敌人位置指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退距离（基于速度360，击退0.3秒的距离）
    const knockbackDistance = (this.knockbackSpeed * 0.3) / 60; // 转换为像素
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 击退效果（使用Tween）
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Power2'
    });

    // 闪烁效果（1秒内切换alpha值）
    let blinkCount = 0;
    const blinkTimer = this.time.addEvent({
      delay: 100, // 每100ms切换一次
      callback: () => {
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;
        
        // 1秒后停止闪烁（10次切换）
        if (blinkCount >= 10) {
          blinkTimer.remove();
          player.alpha = 1; // 恢复完全可见
          this.isHurt = false; // 解除受伤状态
          this.statusText.setText('Status: Normal');
          this.statusText.setColor('#00ff00');
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    // 玩家移动控制
    if (!this.isHurt) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      } else {
        this.player.setVelocityY(0);
      }
    } else {
      // 受伤时无法控制移动
      this.player.setVelocity(0, 0);
    }

    // 检查生命值
    if (this.health <= 0) {
      this.statusText.setText('Status: GAME OVER');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
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