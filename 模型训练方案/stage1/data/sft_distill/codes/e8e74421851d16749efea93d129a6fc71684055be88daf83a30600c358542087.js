class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.platformDirection = 1; // 1: 向右, -1: 向左
  }

  preload() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0099ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加信息文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(240 * this.platformDirection);
    
    // 设置平台移动范围（距离边界50像素）
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 设置玩家与平台、地面的碰撞
    this.physics.add.collider(this.player, this.platform, this.onPlayerPlatformCollide, null, this);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 更新信息显示
    this.updateInfo();
  }

  onPlayerPlatformCollide(player, platform) {
    // 当玩家站在平台上时，让玩家跟随平台移动
    if (player.body.touching.down && platform.body.touching.up) {
      // 玩家获得平台的水平速度分量
      const platformVelocityX = platform.body.velocity.x;
      
      // 如果玩家没有主动移动，则完全跟随平台
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        player.setVelocityX(platformVelocityX);
      } else {
        // 如果玩家主动移动，则在平台速度基础上叠加
        const playerInputVelocity = this.cursors.left.isDown ? -160 : 
                                    this.cursors.right.isDown ? 160 : 0;
        player.setVelocityX(platformVelocityX + playerInputVelocity);
      }
    }
  }

  update(time, delta) {
    // 检测平台是否到达边界，如果是则反转方向
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(240 * this.platformDirection);
      this.platformBounces++;
      this.updateInfo();
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(240 * this.platformDirection);
      this.platformBounces++;
      this.updateInfo();
    }

    // 玩家控制（当不在平台上时）
    const onPlatform = this.player.body.touching.down && 
                       this.physics.overlap(this.player, this.platform);
    
    if (!onPlatform) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  updateInfo() {
    this.infoText.setText([
      `Platform Bounces: ${this.platformBounces}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
      `Platform Speed: 240`,
      `Gravity: 400`,
      `Controls: Arrow Keys to Move/Jump`
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);