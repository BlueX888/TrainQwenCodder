class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1 为向右，-1 为向左
    this.platformBounces = 0; // 平台反弹次数
    this.playerOnPlatform = false; // 玩家是否在平台上
    this.totalTime = 0; // 总运行时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff69b4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169e1, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('ground', width, 40);
    groundGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(width / 2, height - 20, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 350, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(80); // 初始速度向右
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = width - 100;

    // 创建玩家
    this.player = this.physics.add.sprite(100, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, this.onPlatformCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(width / 2, 50, '使用方向键移动，跳到粉色平台上体验移动', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  onPlatformCollision(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    this.totalTime += delta;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.setVelocityX(-80);
      this.platformDirection = -1;
      this.platformBounces++;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.setVelocityX(80);
      this.platformDirection = 1;
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测玩家是否在平台上
    const wasOnPlatform = this.playerOnPlatform;
    this.playerOnPlatform = false;

    // 如果玩家在平台上，让玩家跟随平台移动
    if (this.player.body.touching.down && this.platform.body.touching.up) {
      const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.body,
        this.platform.body
      );
      
      if (overlap) {
        this.playerOnPlatform = true;
        // 玩家跟随平台水平移动
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
          // 如果玩家自己在移动，叠加平台速度
          this.player.x += this.platform.body.velocity.x * (delta / 1000);
        } else {
          // 如果玩家静止，完全跟随平台
          this.player.setVelocityX(this.platform.body.velocity.x);
        }
      }
    }

    // 更新信息显示
    this.infoText.setText([
      `平台反弹次数: ${this.platformBounces}`,
      `平台方向: ${this.platformDirection === 1 ? '向右 →' : '向左 ←'}`,
      `玩家在平台上: ${this.playerOnPlatform ? '是 ✓' : '否 ✗'}`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `平台位置: ${Math.floor(this.platform.x)}`,
      `运行时间: ${(this.totalTime / 1000).toFixed(1)}s`
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);