class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.platformSpeed = 120; // 平台移动速度
  }

  preload() {
    // 创建橙色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff8800, 1); // 橙色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('ground', 800, 32);
    groundGraphics.destroy();
  }

  create() {
    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 584, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed);
    
    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 100, '使用方向键移动玩家\n站在橙色平台上体验移动', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新平台移动逻辑（往返运动）
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(this.platformSpeed);
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-this.platformSpeed);
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家站在平台上，保持平台的水平速度
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态显示
    const onPlatform = this.player.body.touching.down && this.platform.body.touching.up;
    this.statusText.setText([
      `平台反弹次数: ${this.platformBounces}`,
      `平台速度: ${Math.round(this.platform.body.velocity.x)}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `站在平台上: ${onPlatform ? '是' : '否'}`
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);