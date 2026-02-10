class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1表示向右，-1表示向左
    this.playerOnPlatform = false;
    this.platformSpeed = 200;
    this.platformMovementCount = 0; // 记录平台往返次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffffff, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.body.setImmovable(true);
    this.platform.body.setAllowGravity(false);
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 200;
    this.platformMaxX = 600;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面（用于测试）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.body.setImmovable(true);
    this.ground.body.setAllowGravity(false);

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 检查玩家是否在平台上
    this.playerOnPlatform = this.physics.overlap(this.player, this.platform) && 
                            this.player.body.touching.down;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformMovementCount++;
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformMovementCount++;
    }

    // 玩家在平台上时，跟随平台移动
    if (this.playerOnPlatform) {
      // 玩家会自然跟随平台移动（通过物理碰撞）
      // 但需要确保玩家的水平速度与平台同步
      const platformVelocity = this.platform.body.velocity.x;
      
      // 玩家控制
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(platformVelocity - 160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(platformVelocity + 160);
      } else {
        // 不按键时，保持与平台相同的速度
        this.player.setVelocityX(platformVelocity);
      }
    } else {
      // 空中控制
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Cycles: ${Math.floor(this.platformMovementCount / 2)}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`,
      `Use Arrow Keys to Move, Up to Jump`
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);