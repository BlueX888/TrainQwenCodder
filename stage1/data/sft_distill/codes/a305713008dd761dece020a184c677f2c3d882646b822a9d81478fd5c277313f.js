class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 状态信号：受伤次数
    this.isInvulnerable = false; // 无敌状态
  }

  preload() {
    // 创建粉色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff69b4, 1); // 粉色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(20);

    // 创建敌人
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocityX(-100); // 敌人向左移动

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

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文字
    this.add.text(16, 550, '使用方向键移动粉色角色，碰撞红色敌人触发受伤效果', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update() {
    // 更新状态显示
    this.updateStatusText();

    // 角色移动控制（速度160）
    if (!this.isInvulnerable) {
      const speed = 160;
      this.player.setVelocity(0);

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
    }

    // 敌人边界反弹
    if (this.enemy.x <= 20 || this.enemy.x >= 780) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }
  }

  handleHit(player, enemy) {
    // 如果已经在无敌状态，不触发受伤
    if (this.isInvulnerable) {
      return;
    }

    // 记录受伤次数
    this.hitCount++;
    this.isInvulnerable = true;

    // 计算击退方向和距离
    const knockbackSpeed = 160;
    const knockbackDuration = 300; // 击退持续时间（毫秒）
    const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;

    // 计算从敌人到玩家的方向向量
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 归一化方向向量
    const dirX = distance > 0 ? dx / distance : 1;
    const dirY = distance > 0 ? dy / distance : 0;

    // 计算击退目标位置
    const targetX = player.x + dirX * knockbackDistance;
    const targetY = player.y + dirY * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackDuration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        player.setVelocity(0);
      }
    });

    // 闪烁效果（2.5秒）
    const blinkDuration = 2500;
    const blinkCount = 10; // 闪烁次数
    
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: blinkDuration / (blinkCount * 2),
      ease: 'Linear',
      yoyo: true,
      repeat: blinkCount - 1,
      onComplete: () => {
        player.setAlpha(1);
        this.isInvulnerable = false;
      }
    });

    // 在闪烁期间禁用物理交互
    this.time.delayedCall(blinkDuration, () => {
      // 闪烁结束后的额外处理（如果需要）
    });

    // 视觉反馈：屏幕震动
    this.cameras.main.shake(200, 0.005);

    console.log(`Hit #${this.hitCount}: Knockback applied, invulnerable for 2.5s`);
  }

  updateStatusText() {
    this.statusText.setText([
      `受伤次数: ${this.hitCount}`,
      `无敌状态: ${this.isInvulnerable ? '是' : '否'}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
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