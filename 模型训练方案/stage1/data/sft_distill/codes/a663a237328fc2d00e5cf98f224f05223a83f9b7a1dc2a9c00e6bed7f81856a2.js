class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.platformDirection = 1; // 平台移动方向
  }

  preload() {
    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1); // 灰色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1); // 绿色玩家
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1); // 棕色地面
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(360 * this.platformDirection);

    // 设置平台移动范围（左右边界）
    this.platformMinX = 150;
    this.platformMaxX = 650;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, this.handlePlatformCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文字
    this.add.text(400, 50, '使用方向键移动玩家\n站在灰色平台上体验移动', {
      fontSize: '16px',
      fill: '#000',
      align: 'center'
    }).setOrigin(0.5);
  }

  handlePlatformCollision(player, platform) {
    // 当玩家在平台上方时，让玩家跟随平台移动
    if (player.body.touching.down && platform.body.touching.up) {
      // 玩家继承平台的水平速度
      const platformVelocity = platform.body.velocity.x;
      
      // 如果玩家没有按左右键，则完全跟随平台
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        player.setVelocityX(platformVelocity);
      } else {
        // 如果玩家按了方向键，则在平台速度基础上叠加
        const playerControl = this.cursors.left.isDown ? -160 : (this.cursors.right.isDown ? 160 : 0);
        player.setVelocityX(platformVelocity + playerControl);
      }
    }
  }

  update(time, delta) {
    // 平台边界检测和速度反转
    if (this.platform.x <= this.platformMinX) {
      this.platform.x = this.platformMinX;
      this.platformDirection = 1;
      this.platform.setVelocityX(360 * this.platformDirection);
      this.platformBounces++;
      this.updateStatusText();
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.x = this.platformMaxX;
      this.platformDirection = -1;
      this.platform.setVelocityX(360 * this.platformDirection);
      this.platformBounces++;
      this.updateStatusText();
    }

    // 玩家控制（仅在不在平台上时或主动控制时）
    if (this.cursors.left.isDown) {
      if (!this.player.body.touching.down || !this.platform.body.touching.up) {
        this.player.setVelocityX(-160);
      }
    } else if (this.cursors.right.isDown) {
      if (!this.player.body.touching.down || !this.platform.body.touching.up) {
        this.player.setVelocityX(160);
      }
    } else {
      // 如果玩家不在平台上且没有按键，则停止水平移动
      if (!this.physics.overlap(this.player, this.platform)) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `平台反弹次数: ${this.platformBounces}\n` +
      `平台速度: ${Math.abs(this.platform.body.velocity.x).toFixed(0)} px/s\n` +
      `平台方向: ${this.platformDirection > 0 ? '右' : '左'}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);