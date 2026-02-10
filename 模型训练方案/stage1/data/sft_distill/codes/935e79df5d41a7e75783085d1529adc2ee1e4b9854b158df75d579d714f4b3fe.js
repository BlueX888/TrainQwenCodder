class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1为右移，-1为左移
    this.playerOnPlatform = false;
    this.platformX = 400;
    this.playerY = 0;
  }

  preload() {
    // 使用Graphics生成纹理，避免外部资源依赖
  }

  create() {
    // 创建红色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platformTex', 200, 32);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();

    // 创建地面（静态平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('groundTex', 800, 32);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 584, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 350, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(200);
    
    // 设置平台移动范围
    this.platformMinX = 150;
    this.platformMaxX = 650;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 更新平台位置状态
    this.platformX = this.platform.x;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.body.setVelocityX(-200);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.body.setVelocityX(200);
      this.platformDirection = 1;
    }

    // 检测玩家是否在平台上
    const onPlatform = this.player.body.touching.down && 
                       this.platform.body.touching.up;
    
    this.playerOnPlatform = onPlatform;

    // 如果玩家在平台上，同步水平速度
    if (onPlatform) {
      // 玩家跟随平台移动
      this.player.body.velocity.x += this.platform.body.velocity.x * delta / 1000;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(200);
    } else if (!onPlatform) {
      // 空中时减速
      this.player.body.setVelocityX(this.player.body.velocity.x * 0.95);
    } else {
      // 在平台上时保持平台速度
      this.player.body.setVelocityX(this.platform.body.velocity.x);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.body.setVelocityY(-400);
    }

    // 更新玩家Y坐标状态
    this.playerY = this.player.y;

    // 更新调试信息
    this.debugText.setText([
      `Platform X: ${Math.round(this.platformX)}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Y: ${Math.round(this.playerY)}`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      '',
      'Controls: Arrow Keys to Move, Up to Jump'
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);