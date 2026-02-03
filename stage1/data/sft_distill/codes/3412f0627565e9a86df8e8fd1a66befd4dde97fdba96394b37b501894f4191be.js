class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.gameTime = 0;
    this.isGameOver = false;
    this.currentPlatform = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 100, 20);
    platformGraphics.generateTexture('platform', 100, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setGravity(0, 800);

    // 创建平台组
    this.platforms = this.physics.add.group();

    // 创建椭圆路径（12个平台沿路径移动）
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = 250;
    const radiusY = 180;

    this.path = new Phaser.Curves.Path();
    
    // 创建椭圆路径
    const ellipse = new Phaser.Curves.Ellipse(centerX, centerY, radiusX, radiusY);
    this.path.add(ellipse);

    // 创建12个平台，均匀分布在路径上
    const platformCount = 12;
    this.platformFollowers = [];

    for (let i = 0; i < platformCount; i++) {
      const platform = this.physics.add.sprite(0, 0, 'platform');
      platform.body.setAllowGravity(false);
      platform.body.setImmovable(true);
      this.platforms.add(platform);

      // 创建PathFollower来控制平台沿路径移动
      const startProgress = i / platformCount;
      const follower = {
        platform: platform,
        t: startProgress,
        speed: 360 / this.path.getLength() // 速度转换为路径进度速度
      };

      // 初始化平台位置
      const point = this.path.getPoint(startProgress);
      platform.setPosition(point.x, point.y);

      this.platformFollowers.push(follower);
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏说明
    this.add.text(width / 2, 30, '使用方向键移动，空格跳跃', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 绘制路径（用于调试）
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(2, 0x888888, 0.5);
    this.path.draw(pathGraphics, 128);
  }

  onPlatformCollide(player, platform) {
    // 记录当前站立的平台
    if (this.currentPlatform !== platform && player.body.touching.down) {
      this.currentPlatform = platform;
      this.platformsPassed++;
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;

    this.gameTime += delta;

    // 更新平台沿路径移动
    this.platformFollowers.forEach(follower => {
      follower.t += follower.speed * (delta / 1000);
      
      // 循环路径
      if (follower.t > 1) {
        follower.t -= 1;
      }

      const point = this.path.getPoint(follower.t);
      follower.platform.setPosition(point.x, point.y);
      
      // 更新物理体
      follower.platform.body.updateFromGameObject();
    });

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查玩家是否掉出屏幕
    if (this.player.y > this.cameras.main.height + 50) {
      this.isGameOver = true;
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Over!', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    }

    // 更新状态文本
    this.statusText.setText([
      `平台通过: ${this.platformsPassed}`,
      `游戏时间: ${(this.gameTime / 1000).toFixed(1)}s`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: ${Math.floor(this.player.body.velocity.y)}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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