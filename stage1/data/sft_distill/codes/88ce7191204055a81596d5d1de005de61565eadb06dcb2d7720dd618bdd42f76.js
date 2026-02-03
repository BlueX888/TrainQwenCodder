class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.hitCount = 0;
    this.isInvincible = false;
  }

  preload() {
    // 使用 Graphics 生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9c27b0, 1); // 紫色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建紫色角色（玩家）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建敌人
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(-100, 0);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);

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

    // 提示文本
    this.add.text(16, 550, 'Use Arrow Keys to Move. Collide with Red Enemy to Test Hit Effect', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 减少健康值
    this.health -= 20;
    this.hitCount++;
    this.isInvincible = true;

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 基于速度240计算击退距离（速度越快，击退越远）
    const knockbackSpeed = 240;
    const knockbackDistance = 100; // 击退距离
    const knockbackDuration = 300; // 击退持续时间（毫秒）

    // 计算击退目标位置
    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前的速度
    player.setVelocity(0, 0);

    // 击退效果（使用 Tween）
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackDuration,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 闪烁效果（2秒）
    const blinkDuration = 2000;
    const blinkInterval = 100; // 每100ms切换一次透明度

    // 创建闪烁 Tween
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: blinkInterval,
      yoyo: true,
      repeat: Math.floor(blinkDuration / (blinkInterval * 2)) - 1,
      onComplete: () => {
        // 闪烁结束，恢复正常
        player.alpha = 1;
        this.isInvincible = false;
      }
    });

    // 更新状态显示
    this.updateStatusText();

    // 如果健康值归零，显示游戏结束
    if (this.health <= 0) {
      this.health = 0;
      this.showGameOver();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Health: ${this.health} | Hit Count: ${this.hitCount} | Invincible: ${this.isInvincible}`
    );
  }

  showGameOver() {
    // 停止所有物理对象
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不更新
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制（仅在非无敌状态或无击退动画时）
    if (!this.isInvincible || this.player.alpha === 1) {
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

    // 更新状态显示
    this.updateStatusText();
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