class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.platformsPassed = 0;
    this.isAlive = true;
    this.jumps = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      platformsPassed: 0,
      isAlive: true,
      jumps: 0,
      playerY: 0,
      gameTime: 0
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建8个平台，形成路径
    const platformPositions = [
      { x: 100, y: 200, targetX: 100, targetY: 350 },
      { x: 250, y: 350, targetX: 250, targetY: 200 },
      { x: 400, y: 200, targetX: 400, targetY: 400 },
      { x: 550, y: 400, targetX: 550, targetY: 250 },
      { x: 700, y: 250, targetX: 700, targetY: 450 },
      { x: 200, y: 450, targetX: 200, targetY: 300 },
      { x: 350, y: 300, targetX: 350, targetY: 500 },
      { x: 500, y: 500, targetX: 500, targetY: 350 }
    ];

    platformPositions.forEach((pos, index) => {
      const platform = this.platforms.create(pos.x, pos.y, 'platform');
      platform.body.setImmovable(true);
      platform.body.setAllowGravity(false);
      platform.platformIndex = index;
      platform.hasPassed = false;

      // 计算移动距离和时间，确保速度为200px/s
      const distance = Phaser.Math.Distance.Between(pos.x, pos.y, pos.targetX, pos.targetY);
      const duration = (distance / 200) * 1000; // 转换为毫秒

      // 创建循环移动的Tween
      this.tweens.add({
        targets: platform,
        x: pos.targetX,
        y: pos.targetY,
        duration: duration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      });
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示
    this.scoreText = this.add.text(16, 16, 'Platforms Passed: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 46, 'Jumps: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 50, 'SPACE to Jump | Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 初始时间
    this.gameTime = 0;
  }

  onPlatformCollide(player, platform) {
    // 检测是否是新通过的平台
    if (!platform.hasPassed && player.body.touching.down) {
      platform.hasPassed = true;
      this.platformsPassed++;
      this.updateSignals();
    }
  }

  update(time, delta) {
    if (!this.isAlive) return;

    this.gameTime += delta;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.player.setVelocityY(-500);
        this.jumps++;
        this.updateSignals();
      }
    }

    // 检测玩家是否掉落屏幕外
    if (this.player.y > 650) {
      this.isAlive = false;
      this.player.setVelocity(0, 0);
      this.player.setTint(0xff0000);
      
      const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5);

      const finalScoreText = this.add.text(400, 360, `Platforms Passed: ${this.platformsPassed}`, {
        fontSize: '24px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      this.updateSignals();
    }

    // 检测是否通过所有平台
    if (this.platformsPassed >= 8 && this.isAlive) {
      this.isAlive = false;
      
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '48px',
        fill: '#00ff00'
      }).setOrigin(0.5);

      const timeText = this.add.text(400, 360, `Time: ${(this.gameTime / 1000).toFixed(2)}s`, {
        fontSize: '24px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      this.updateSignals();
    }

    // 更新显示
    this.scoreText.setText(`Platforms Passed: ${this.platformsPassed}/8`);
    this.statusText.setText(`Jumps: ${this.jumps}`);

    // 更新信号
    this.updateSignals();
  }

  updateSignals() {
    window.__signals__ = {
      platformsPassed: this.platformsPassed,
      isAlive: this.isAlive,
      jumps: this.jumps,
      playerY: Math.round(this.player.y),
      gameTime: Math.round(this.gameTime),
      timestamp: Date.now()
    };

    // 输出日志JSON
    if (this.platformsPassed !== this.lastLoggedPlatforms || !this.isAlive !== this.lastLoggedAlive) {
      console.log(JSON.stringify(window.__signals__));
      this.lastLoggedPlatforms = this.platformsPassed;
      this.lastLoggedAlive = this.isAlive;
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
  scene: PlatformJumpScene
};

new Phaser.Game(config);