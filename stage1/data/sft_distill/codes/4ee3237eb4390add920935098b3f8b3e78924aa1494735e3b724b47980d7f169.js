class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1=右移, -1=左移
    this.platformX = 0;
    this.playerOnPlatform = false;
  }

  preload() {
    // 创建紫色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x9933ff, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(200);

    // 设置平台移动范围
    this.platformMinX = 150;
    this.platformMaxX = 650;

    // 创建玩家
    this.player = this.physics.add.sprite(300, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      // 检测玩家是否在平台上方
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加地面参考
    const ground = this.add.graphics();
    ground.fillStyle(0x666666, 1);
    ground.fillRect(0, 580, 800, 20);
  }

  update(time, delta) {
    // 重置平台状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(-200);
    } else if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(200);
    }

    // 记录平台位置
    this.platformX = Math.round(this.platform.x);

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
        this.playerOnPlatform = true;
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform X: ${this.platformX}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Player on Platform: ${this.playerOnPlatform}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      '',
      'Controls: Arrow keys to move, UP to jump'
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);