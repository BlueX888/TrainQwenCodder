class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.isInvulnerable = false;
    this.health = 5;
    this.hitCount = 0;
    this.healthText = null;
    this.statusText = null;
    this.cursors = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
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
    // 创建玩家
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.originalTint = 0x00ff00;

    // 创建敌人（移动的障碍物）
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocityX(-100);
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生命值和状态
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, `Hit Count: ${this.hitCount}`, {
      fontSize: '20px',
      fill: '#ffff00'
    });

    this.add.text(16, 80, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#aaaaaa'
    });

    console.log('Game initialized - Health:', this.health);
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.health -= 1;
    this.hitCount += 1;
    this.healthText.setText(`Health: ${this.health}`);
    this.statusText.setText(`Hit Count: ${this.hitCount}`);

    console.log(`Hit! Health: ${this.health}, Hit Count: ${this.hitCount}`);

    // 设置无敌状态
    this.isInvulnerable = true;

    // 计算击退方向（玩家相对于敌人的方向）
    const knockbackDirection = Math.sign(player.x - enemy.x) || 1;
    const knockbackDistance = 120;
    const knockbackX = player.x + knockbackDirection * knockbackDistance;

    // 限制击退位置在世界边界内
    const targetX = Phaser.Math.Clamp(
      knockbackX,
      20,
      this.physics.world.bounds.width - 20
    );

    // 击退效果（0.3秒移动120像素）
    this.tweens.add({
      targets: player,
      x: targetX,
      duration: 300,
      ease: 'Cubic.easeOut'
    });

    // 闪烁效果（1.5秒）
    this.startFlashEffect(player, 1500);

    // 1.5秒后结束无敌状态
    this.time.delayedCall(1500, () => {
      this.isInvulnerable = false;
      player.clearTint();
      console.log('Invulnerability ended');
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  startFlashEffect(sprite, duration) {
    const flashInterval = 100; // 每100ms切换一次
    const totalFlashes = duration / flashInterval;
    let flashCount = 0;

    // 创建闪烁定时器
    const flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        flashCount++;
        
        // 切换颜色（白色和原色）
        if (flashCount % 2 === 0) {
          sprite.setTint(0xffffff); // 白色
        } else {
          sprite.setTint(sprite.originalTint); // 原色（绿色）
        }

        // 达到闪烁次数后停止
        if (flashCount >= totalFlashes) {
          flashTimer.destroy();
          sprite.clearTint();
        }
      },
      loop: true
    });
  }

  gameOver() {
    console.log('Game Over! Total hits taken:', this.hitCount);
    
    // 停止所有物理运动
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER\nClick to Restart',
      {
        fontSize: '48px',
        fill: '#ff0000',
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 玩家移动控制
    if (!this.physics.world.isPaused) {
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
const game = new Phaser.Game(config);