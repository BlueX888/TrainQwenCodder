class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounceCount = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建白色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffffff, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('playerTex', 40, 50);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('groundTex', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(200); // 初始向右移动
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setGravityY(500); // 设置重力
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, this.onPlayerPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 添加说明文本
    this.add.text(10, 560, '方向键移动，空格跳跃', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方（而不是侧面或下方碰撞）
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台移动
    if (this.platform.x <= this.platformMinX) {
      this.platform.x = this.platformMinX;
      this.platform.setVelocityX(200); // 向右移动
      this.platformBounceCount++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.x = this.platformMaxX;
      this.platform.setVelocityX(-200); // 向左移动
      this.platformBounceCount++;
    }

    // 检测玩家是否仍在平台上
    const wasOnPlatform = this.playerOnPlatform;
    this.playerOnPlatform = false;

    // 如果玩家在平台上，让玩家跟随平台移动
    if (this.physics.overlap(this.player, this.platform)) {
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        // 玩家跟随平台水平移动
        this.player.x += this.platform.body.velocity.x * (delta / 1000);
      }
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，保持平台速度；否则停止
      if (!this.playerOnPlatform) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.body.touching.down) {
        this.player.setVelocityY(-400);
      }
    }

    // 更新信息显示
    this.infoText.setText([
      `Platform Bounces: ${this.platformBounceCount}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Player Y: ${Math.round(this.player.y)}`
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
      gravity: { y: 0 }, // 全局重力设为0，单独给玩家设置
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);