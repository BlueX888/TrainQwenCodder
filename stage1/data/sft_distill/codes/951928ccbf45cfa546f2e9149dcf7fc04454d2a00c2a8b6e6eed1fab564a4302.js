class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1表示向右，-1表示向左
    this.platformBounces = 0; // 平台反弹次数（状态信号）
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建红色平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(160 * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, this.onPlayerPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 50, '使用方向键控制玩家移动和跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 重置平台状态标记
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(160 * this.platformDirection);
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(160 * this.platformDirection);
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的速度
      if (this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && (this.player.body.touching.down || this.player.body.blocked.down)) {
      this.player.setVelocityY(-400);
    }

    // 更新状态文字
    this.updateStatusText();
  }

  updateStatusText() {
    const onPlatform = this.playerOnPlatform ? 'YES' : 'NO';
    const direction = this.platformDirection === 1 ? 'RIGHT' : 'LEFT';
    this.statusText.setText(
      `Platform Bounces: ${this.platformBounces}\n` +
      `Platform Direction: ${direction}\n` +
      `Player on Platform: ${onPlatform}\n` +
      `Platform X: ${Math.round(this.platform.x)}\n` +
      `Player X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`
    );
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);