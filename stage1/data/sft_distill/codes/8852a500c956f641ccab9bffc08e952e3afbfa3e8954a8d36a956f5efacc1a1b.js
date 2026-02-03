class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1为右，-1为左
    this.playerOnPlatform = false; // 玩家是否在平台上
    this.platformMoveCount = 0; // 平台移动次数（用于验证）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建蓝色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platformTex', 200, 20);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建地面（静态平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('groundTex', width, 40);
    groundGraphics.destroy();

    const ground = this.physics.add.sprite(width / 2, height - 20, 'groundTex');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(width / 2, height - 200, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(80 * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = width - 100;

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 检查玩家是否在平台上方
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000'
    });
  }

  update(time, delta) {
    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(80 * this.platformDirection);
      this.platformMoveCount++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(80 * this.platformDirection);
      this.platformMoveCount++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.playerOnPlatform && this.player.body.touching.down) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }

    // 重置平台状态标记
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform Direction: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Move Count: ${this.platformMoveCount}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Use Arrow Keys to Move, Up to Jump`
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);