class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.platformsPassed = 0;
    this.currentPlatformIndex = 0;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      jumpCount: 0,
      platformsPassed: 0,
      currentPlatform: 0,
      isGameOver: false,
      playerY: 0,
      timestamp: Date.now()
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
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建8个平台，组成路径
    const platformConfigs = [
      { x: 100, y: 200, moveX: 250, moveY: 200 },
      { x: 250, y: 200, moveX: 400, moveY: 250 },
      { x: 400, y: 250, moveX: 550, moveY: 300 },
      { x: 550, y: 300, moveX: 700, moveY: 350 },
      { x: 700, y: 350, moveX: 650, moveY: 450 },
      { x: 650, y: 450, moveX: 500, moveY: 500 },
      { x: 500, y: 500, moveX: 350, moveY: 480 },
      { x: 350, y: 480, moveX: 200, moveY: 400 }
    ];

    this.platformObjects = [];
    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setAllowGravity(false);
      platform.body.setImmovable(true);
      platform.platformIndex = index;
      
      // 创建往返移动的Tween
      this.tweens.add({
        targets: platform,
        x: config.moveX,
        y: config.moveY,
        duration: 2000,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
        delay: index * 250 // 错开启动时间
      });

      this.platformObjects.push(platform);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加地面（失败区域）
    this.ground = this.add.rectangle(400, 590, 800, 20, 0xff0000);
    this.physics.add.existing(this.ground, true);
    this.physics.add.collider(this.player, this.ground, this.onGameOver, null, this);

    // 检测玩家通过平台
    this.lastPlatformTouched = -1;
  }

  onPlatformCollide(player, platform) {
    // 只有当玩家从上方落到平台时才计数
    if (player.body.touching.down && platform.body.touching.up) {
      const platformIndex = platform.platformIndex;
      
      // 检查是否是新平台
      if (platformIndex !== this.lastPlatformTouched) {
        // 检查是否按顺序通过
        if (platformIndex === (this.lastPlatformTouched + 1) % 8) {
          this.platformsPassed++;
          this.currentPlatformIndex = platformIndex;
          
          // 更新信号
          window.__signals__.platformsPassed = this.platformsPassed;
          window.__signals__.currentPlatform = this.currentPlatformIndex;
          
          console.log(JSON.stringify({
            event: 'platform_passed',
            platformIndex: platformIndex,
            totalPassed: this.platformsPassed,
            timestamp: Date.now()
          }));
        }
        
        this.lastPlatformTouched = platformIndex;
      }
    }
  }

  onGameOver() {
    if (!this.isGameOver) {
      this.isGameOver = true;
      window.__signals__.isGameOver = true;
      
      console.log(JSON.stringify({
        event: 'game_over',
        finalScore: this.platformsPassed,
        totalJumps: this.jumpCount,
        timestamp: Date.now()
      }));

      this.player.setTint(0xff0000);
      this.physics.pause();
    }
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（空格键）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      
      window.__signals__.jumpCount = this.jumpCount;
      
      console.log(JSON.stringify({
        event: 'jump',
        jumpCount: this.jumpCount,
        playerX: Math.round(this.player.x),
        playerY: Math.round(this.player.y),
        timestamp: Date.now()
      }));
    }

    // 更新状态文本
    this.statusText.setText([
      `Jumps: ${this.jumpCount}`,
      `Platforms Passed: ${this.platformsPassed}`,
      `Current Platform: ${this.currentPlatformIndex}`,
      `Use Arrow Keys to move, SPACE to jump`
    ]);

    // 更新信号
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.timestamp = Date.now();

    // 检查是否掉出屏幕
    if (this.player.y > 600) {
      this.onGameOver();
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