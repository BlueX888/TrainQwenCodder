class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformX = 0;
    this.platformVelocity = 200;
    this.playerOnPlatform = false;
    this.platformDirection = 1; // 1: 向右, -1: 向左
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF8C00, 1); // 橙色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0080FF, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面（静态）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('ground', 800, 32);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 584, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformVelocity);
    
    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlayerPlatformCollide,
      null,
      this
    );

    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台位置状态
    this.platformX = this.platform.x;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(this.platformVelocity);
      this.platformDirection = 1;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-this.platformVelocity);
      this.platformDirection = -1;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.playerOnPlatform && this.player.body.touching.down) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 重置平台状态标记
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }

    // 更新信息显示
    this.infoText.setText([
      `Platform X: ${Math.round(this.platformX)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `Player on Platform: ${this.playerOnPlatform}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Use Arrow Keys to Move`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);