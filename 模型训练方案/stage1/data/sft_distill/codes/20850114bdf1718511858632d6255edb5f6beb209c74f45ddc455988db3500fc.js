class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isInvincible = false;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（白色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
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

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(10, 550, '使用方向键移动玩家，碰到红色敌人触发受伤效果', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible || this.player.body) {
      const speed = 200;
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
    if (this.enemy.x <= 16 || this.enemy.x >= 784) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }
  }

  onPlayerHit(player, enemy) {
    // 如果已经处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 10;
    this.score += 1; // 记录受击次数
    this.updateStatusText();

    // 设置无敌状态
    this.isInvincible = true;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度120
    const knockbackSpeed = 120;
    const knockbackDistance = 80; // 击退距离
    const knockbackDuration = 300; // 击退持续时间（毫秒）

    // 计算击退目标位置
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0);

    // 使用 Tween 实现击退效果
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackDuration,
      ease: 'Power2'
    });

    // 实现闪烁效果（1.5秒）
    const blinkDuration = 1500;
    const blinkInterval = 100; // 每100ms切换一次透明度
    let blinkCount = 0;
    const maxBlinks = blinkDuration / blinkInterval;

    // 创建闪烁定时器
    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换透明度（0.3 和 1.0 之间）
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          player.alpha = 1; // 恢复完全不透明
          this.isInvincible = false; // 解除无敌状态
          blinkTimer.remove();
        }
      },
      loop: true
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Health: ${this.health} | Hits: ${this.score} | Invincible: ${this.isInvincible}`
    );
  }

  gameOver() {
    this.physics.pause();
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000'
    }).setOrigin(0.5);
    
    this.add.text(400, 350, `Total Hits: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
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