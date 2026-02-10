class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isInvulnerable = false;
    this.hitCount = 0;
  }

  preload() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9966ff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建紫色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人（多个用于测试）
    this.enemies = this.physics.add.group();
    
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocity(100, 50);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 400, 'enemy');
    enemy2.setVelocity(-80, -60);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 设置无敌状态
    this.isInvulnerable = true;
    this.hitCount++;
    this.health -= 10;

    // 计算击退方向（从敌人指向玩家）
    const knockbackAngle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 基于速度240计算击退距离和时间
    const knockbackSpeed = 240;
    const knockbackDuration = 300; // 毫秒
    const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;

    // 计算击退目标位置
    const knockbackX = player.x + Math.cos(knockbackAngle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(knockbackAngle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackDuration,
      ease: 'Cubic.easeOut'
    });

    // 闪烁效果（2秒，alpha在0.3-1之间循环）
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 19, // 100ms * 20次 = 2000ms = 2秒
      onComplete: () => {
        // 闪烁结束，恢复正常
        player.alpha = 1;
        this.isInvulnerable = false;
      }
    });

    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Health: ${this.health}`,
      `Hit Count: ${this.hitCount}`,
      `Invulnerable: ${this.isInvulnerable}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Use Arrow Keys to Move',
      'Purple Circle = Player',
      'Red Squares = Enemies'
    ]);
  }

  update(time, delta) {
    // 只在非无敌状态下允许移动
    if (!this.isInvulnerable) {
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

    // 更新状态文本（位置信息）
    if (this.statusText && this.player) {
      this.statusText.setText([
        `Health: ${this.health}`,
        `Hit Count: ${this.hitCount}`,
        `Invulnerable: ${this.isInvulnerable}`,
        `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
        '',
        'Use Arrow Keys to Move',
        'Purple Circle = Player',
        'Red Squares = Enemies'
      ]);
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