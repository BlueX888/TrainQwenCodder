class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isInvulnerable = false;
    this.knockbackSpeed = 160;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.originalTint = 0x3498db;

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 0);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1, 1);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(16, 50, 'Status: Normal', {
      fontSize: '20px',
      fill: '#fff'
    });

    // 添加提示文本
    this.add.text(16, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#aaa'
    });
  }

  update() {
    // 玩家移动控制
    if (!this.isInvulnerable) {
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
    }

    // 更新状态文本
    this.healthText.setText(`Health: ${this.health}`);
    this.statusText.setText(
      `Status: ${this.isInvulnerable ? 'Invulnerable (Hit!)' : 'Normal'}`
    );
  }

  handleHit(player, enemy) {
    // 如果已经无敌，不再触发受伤
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.health -= 10;
    if (this.health < 0) this.health = 0;

    // 设置无敌状态
    this.isInvulnerable = true;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退距离（基于速度160和击退时间0.3秒）
    const knockbackDistance = this.knockbackSpeed * 0.3;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 闪烁效果（1秒内闪烁）
    let flashCount = 0;
    const flashDuration = 1000; // 1秒
    const flashInterval = 100; // 每100ms切换一次
    const maxFlashes = flashDuration / flashInterval;

    const flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        flashCount++;
        
        // 切换颜色（白色 0xffffff 和原色）
        if (flashCount % 2 === 0) {
          player.setTint(0xffffff); // 白色
        } else {
          player.clearTint(); // 恢复原色
        }

        // 闪烁结束
        if (flashCount >= maxFlashes) {
          player.clearTint();
          this.isInvulnerable = false;
          flashTimer.destroy();
        }
      },
      loop: true
    });

    // 播放击中音效的替代（通过相机震动）
    this.cameras.main.shake(200, 0.005);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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