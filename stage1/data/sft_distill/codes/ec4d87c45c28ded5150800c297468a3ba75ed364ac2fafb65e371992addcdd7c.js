class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformPosition = 0;
    this.playerOnPlatform = false;
    this.platformDirection = 1; // 1: 向右, -1: 向左
  }

  preload() {
    // 创建紫色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x9966ff, 1); // 紫色
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(240); // 初始向右移动，速度240
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建静态地面用于测试
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 580, 800, 20);
    groundGraphics.generateTexture('ground', 800, 20);
    groundGraphics.destroy();
    
    this.ground = this.physics.add.staticSprite(400, 590, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 重置玩家在平台上的状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-240);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(240);
      this.platformDirection = 1;
    }

    // 记录平台位置
    this.platformPosition = this.platform.x;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测玩家是否在平台上
    if (this.player.body.touching.down && 
        this.physics.overlap(this.player, this.platform)) {
      this.playerOnPlatform = true;
      
      // 让玩家跟随平台移动
      if (this.cursors.left.isUp && this.cursors.right.isUp) {
        this.player.x += this.platform.body.velocity.x * (delta / 1000);
      }
    }

    // 更新信息显示
    this.infoText.setText([
      `Platform Position: ${Math.round(this.platformPosition)}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);