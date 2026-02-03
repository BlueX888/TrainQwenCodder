class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 120;
    this.platformDirection = 1; // 1: 右, -1: 左
    this.platformMinX = 100;
    this.platformMaxX = 700;
    this.playerOnPlatform = false;
    this.score = 0;
    this.platformTravelDistance = 0; // 状态信号：平台移动距离
  }

  preload() {
    // 创建蓝色平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 只有当玩家在平台上方时才跟随
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 5, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '← → 移动  ↑ 跳跃', {
      fontSize: '14px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 更新平台移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platform.x = this.platformMinX;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platform.x = this.platformMaxX;
    }

    // 累计平台移动距离
    this.platformTravelDistance += Math.abs(this.platform.body.velocity.x) * delta / 1000;

    // 玩家跟随平台移动
    if (this.playerOnPlatform && this.player.body.touching.down) {
      this.player.x += this.platform.body.velocity.x * delta / 1000;
    } else {
      this.playerOnPlatform = false;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态显示
    this.statusText.setText([
      `平台位置: ${Math.round(this.platform.x)}`,
      `平台方向: ${this.platformDirection > 0 ? '→' : '←'}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `在平台上: ${this.playerOnPlatform ? '是' : '否'}`,
      `移动距离: ${Math.round(this.platformTravelDistance)}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);