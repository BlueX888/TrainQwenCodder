class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformX = 0;
    this.platformDirection = 1; // 1为右，-1为左
    this.playerOnPlatform = false;
    this.score = 0;
  }

  preload() {
    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff69b4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1); // 绿色玩家
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1); // 棕色地面
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面（静态平台）
    const ground = this.physics.add.sprite(400, 575, 'ground');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(300);
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, this.platform, this.onPlayerPlatformCollide, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 550, 'Arrow Keys: Move & Jump | Platform Speed: 300', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台位置
    this.platformX = this.platform.x;

    // 平台边界检测和速度反转
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(300);
      this.platformDirection = 1;
      this.platform.x = this.platformMinX;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-300);
      this.platformDirection = -1;
      this.platform.x = this.platformMaxX;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
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
      this.player.setVelocityY(-500);
      this.score += 1; // 每次跳跃增加分数
    }

    // 重置平台状态标记
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }

    // 更新状态显示
    this.statusText.setText([
      `Platform X: ${Math.round(this.platformX)}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Jumps: ${this.score}`
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);