class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformX = 0;
    this.platformDirection = 1; // 1: 右移, -1: 左移
    this.playerOnPlatform = false;
    this.frameCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff69b4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169e1, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建地面（静态平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1); // 棕色
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('groundTex', width, 40);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(width / 2, height - 20, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(80); // 初始速度80向右

    // 设置平台移动范围
    this.platformMinX = 150;
    this.platformMaxX = width - 150;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.platformCollider = this.physics.add.collider(
      this.player,
      this.platform,
      this.onPlayerPlatformCollide,
      null,
      this
    );

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
    this.add.text(width / 2, 50, '使用方向键移动，跳上粉色平台体验移动效果', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否站在平台上（玩家底部接触平台顶部）
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    this.frameCount++;

    // 更新平台移动
    if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-80);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(80);
      this.platformDirection = 1;
    }

    // 记录平台位置
    this.platformX = Math.round(this.platform.x);

    // 检测玩家是否在平台上
    const wasOnPlatform = this.playerOnPlatform;
    this.playerOnPlatform = false;

    if (this.player.body.touching.down && this.platform.body.touching.up) {
      const playerBottom = this.player.y + this.player.height / 2;
      const platformTop = this.platform.y - this.platform.height / 2;
      
      if (Math.abs(playerBottom - platformTop) < 5) {
        this.playerOnPlatform = true;
      }
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.playerOnPlatform) {
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
    this.statusText.setText([
      `Frame: ${this.frameCount}`,
      `Platform X: ${this.platformX}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Platform Speed: ${Math.abs(this.platform.body.velocity.x)}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Player Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);