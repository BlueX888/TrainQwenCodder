class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.playerX = 0;
    this.playerY = 0;
    this.platformX = 0;
    this.platformDirection = 1; // 1=右移, -1=左移
    this.isPlayerOnPlatform = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理（白色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffffff, 1);
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 350, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(300); // 初始速度向右300

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(16, 16, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(16, 40, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 更新平台移动逻辑
    this.updatePlatformMovement();

    // 玩家控制
    this.updatePlayerControl();

    // 更新状态信号
    this.updateStatus();

    // 更新状态显示
    this.statusText.setText([
      `Player: (${Math.floor(this.playerX)}, ${Math.floor(this.playerY)})`,
      `Platform: ${Math.floor(this.platformX)} | Dir: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `On Platform: ${this.isPlayerOnPlatform}`
    ]);
  }

  updatePlatformMovement() {
    // 平台往返移动逻辑
    const platformLeft = this.platform.x - this.platform.width / 2;
    const platformRight = this.platform.x + this.platform.width / 2;

    // 检测边界并反向
    if (platformRight >= 800 && this.platform.body.velocity.x > 0) {
      this.platform.body.setVelocityX(-300);
      this.platformDirection = -1;
    } else if (platformLeft <= 0 && this.platform.body.velocity.x < 0) {
      this.platform.body.setVelocityX(300);
      this.platformDirection = 1;
    }

    // 更新平台位置状态
    this.platformX = this.platform.x;
  }

  updatePlayerControl() {
    // 检测玩家是否在平台上
    this.isPlayerOnPlatform = this.physics.world.overlap(
      this.player, 
      this.platform
    ) && this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，跟随平台移动
      if (this.isPlayerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  updateStatus() {
    // 更新状态信号变量
    this.playerX = this.player.x;
    this.playerY = this.player.y;
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