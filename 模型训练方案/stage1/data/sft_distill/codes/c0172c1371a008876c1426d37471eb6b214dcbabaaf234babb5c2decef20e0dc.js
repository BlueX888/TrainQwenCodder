class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.platformDirection = 1; // 平台移动方向
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建白色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffffff, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面（静态平台）
    const ground = this.physics.add.sprite(400, 550, 'platform');
    ground.setScale(2, 1);
    ground.body.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.body.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(200 * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 200;
    this.platformMaxX = 600;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 50, '使用方向键移动玩家\n站在白色平台上体验移动', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatus();
  }

  update(time, delta) {
    // 更新平台移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(200 * this.platformDirection);
      this.platformBounces++;
      this.updateStatus();
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(200 * this.platformDirection);
      this.platformBounces++;
      this.updateStatus();
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 当玩家站在平台上时，跟随平台移动
    if (this.player.body.touching.down && this.physics.overlap(this.player, this.platform)) {
      // 玩家会自动跟随平台移动，因为平台是immovable的
      // 这里不需要额外代码，Arcade物理引擎会自动处理
    }
  }

  updateStatus() {
    this.statusText.setText(
      `平台反弹次数: ${this.platformBounces}\n` +
      `平台方向: ${this.platformDirection > 0 ? '右' : '左'}\n` +
      `平台位置: ${Math.round(this.platform.x)}`
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);