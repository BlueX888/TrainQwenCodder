class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1 = 右, -1 = 左
    this.platformSpeed = 80;
    this.platformMinX = 100;
    this.platformMaxX = 600;
  }

  preload() {
    // 创建平台纹理（蓝色）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（绿色）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(300, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, null, null, this);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态信息
    this.updateInfo();
  }

  update(time, delta) {
    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 玩家在平台上时跟随平台移动
    if (this.player.body.touching.down && this.platform.body.touching.up) {
      // 检查玩家是否在平台上方
      const playerBottom = this.player.y + this.player.height / 2;
      const platformTop = this.platform.y - this.platform.height / 2;
      
      if (Math.abs(playerBottom - platformTop) < 5) {
        this.player.x += this.platform.body.velocity.x * delta / 1000;
      }
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }

    // 更新状态信息
    this.updateInfo();
  }

  updateInfo() {
    const onPlatform = this.player.body.touching.down && 
                       this.platform.body.touching.up;
    
    this.infoText.setText([
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Platform Speed: ${this.platformSpeed}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `On Platform: ${onPlatform ? 'Yes' : 'No'}`,
      `Controls: Arrow Keys to Move, Up to Jump`
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