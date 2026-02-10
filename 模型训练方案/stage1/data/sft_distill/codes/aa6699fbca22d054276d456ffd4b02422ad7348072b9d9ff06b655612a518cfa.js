class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1 = 右, -1 = 左
    this.platformSpeed = 300;
    this.platformMovementCount = 0; // 状态信号：平台移动次数
    this.platformLeftBound = 100;
    this.platformRightBound = 700;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建白色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffffff, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platformTex', 200, 20);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建地面（用于参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 580, 800, 20);
    groundGraphics.generateTexture('groundTex', 800, 20);
    groundGraphics.destroy();

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 590, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, this.ground);

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
    this.add.text(400, 50, '使用方向键左右移动玩家\n站在白色平台上体验移动', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新平台移动
    const platformX = this.platform.x;
    
    // 检测平台边界并反向
    if (platformX <= this.platformLeftBound && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformMovementCount++; // 记录往返次数
    } else if (platformX >= this.platformRightBound && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformMovementCount++; // 记录往返次数
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

    // 更新状态显示
    const onPlatform = this.player.body.touching.down && this.platform.body.touching.up;
    this.statusText.setText([
      `平台往返次数: ${this.platformMovementCount}`,
      `平台位置: ${Math.round(this.platform.x)}`,
      `平台速度: ${this.platform.body.velocity.x}`,
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