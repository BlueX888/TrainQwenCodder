class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 160;
    this.platformMinX = 100;
    this.platformMaxX = 600;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建灰色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      platformX: 0,
      platformY: 0,
      platformVelocity: 0,
      playerX: 0,
      playerY: 0,
      playerVelocityX: 0,
      playerVelocityY: 0,
      isOnPlatform: false,
      frameCount: 0
    };

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.body.setImmovable(true);
    this.platform.body.setAllowGravity(false);
    this.platform.setVelocityX(this.platformSpeed);

    // 创建玩家
    this.player = this.physics.add.sprite(300, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面（用于对比）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 550, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.body.setImmovable(true);
    this.ground.body.setAllowGravity(false);

    // 设置碰撞
    this.platformCollider = this.physics.add.collider(
      this.player,
      this.platform,
      this.onPlatformCollision,
      null,
      this
    );

    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  onPlatformCollision(player, platform) {
    // 当玩家站在平台上时，标记状态
    if (player.body.touching.down && platform.body.touching.up) {
      window.__signals__.isOnPlatform = true;
    }
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.setVelocityX(-this.platformSpeed);
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.setVelocityX(this.platformSpeed);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查玩家是否在平台上
    const isOnPlatform = this.player.body.touching.down && 
                         this.physics.overlap(this.player, this.platform);

    // 更新信号
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformY = Math.round(this.platform.y);
    window.__signals__.platformVelocity = this.platform.body.velocity.x;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.playerVelocityX = Math.round(this.player.body.velocity.x);
    window.__signals__.playerVelocityY = Math.round(this.player.body.velocity.y);
    window.__signals__.isOnPlatform = isOnPlatform;

    // 更新调试文本
    this.debugText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Platform: (${window.__signals__.platformX}, ${window.__signals__.platformY}) vel: ${window.__signals__.platformVelocity}`,
      `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `Player Vel: (${window.__signals__.playerVelocityX}, ${window.__signals__.playerVelocityY})`,
      `On Platform: ${window.__signals__.isOnPlatform}`,
      ``,
      `Controls: Arrow Keys to move, UP to jump`
    ]);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        platform: {
          x: window.__signals__.platformX,
          velocity: window.__signals__.platformVelocity
        },
        player: {
          x: window.__signals__.playerX,
          y: window.__signals__.playerY,
          onPlatform: window.__signals__.isOnPlatform
        }
      }));
    }
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);