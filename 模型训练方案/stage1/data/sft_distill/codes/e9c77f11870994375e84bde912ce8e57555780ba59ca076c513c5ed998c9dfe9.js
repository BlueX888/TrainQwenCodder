// 完整的 Phaser3 移动平台游戏代码
class MovingPlatformScene extends Phaser.Scene {
  constructor() {
    super('MovingPlatformScene');
    this.platformSpeed = 160;
    this.platformDirection = 1; // 1为右，-1为左
    this.signals = {
      playerX: 0,
      playerY: 0,
      platformX: 0,
      platformY: 0,
      platformDirection: 1,
      isPlayerOnPlatform: false,
      frameCount: 0
    };
  }

  preload() {
    // 使用Graphics生成纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建灰色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1); // 灰色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（深灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x404040, 1);
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
    this.platform = this.physics.add.sprite(400, 350, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 150;
    this.platformMaxX = 650;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, this.onPlayerPlatformCollide, null, this);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys: Move\nStand on the gray platform!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 暴露信号到全局
    window.__signals__ = this.signals;

    // 添加调试信息显示
    this.debugText = this.add.text(10, 70, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 当玩家在平台上时，标记状态
    if (player.body.touching.down && platform.body.touching.up) {
      this.signals.isPlayerOnPlatform = true;
    }
  }

  update(time, delta) {
    this.signals.frameCount++;

    // 平台边界检测和速度反转
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

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

    // 检测玩家是否在平台上（通过位置判断）
    const isOnPlatform = this.player.body.touching.down && 
                         Math.abs(this.player.y - this.platform.y + 24) < 20 &&
                         Math.abs(this.player.x - this.platform.x) < 116;

    // 如果玩家站在平台上，让玩家跟随平台移动
    if (isOnPlatform) {
      this.player.x += this.platform.body.velocity.x * (delta / 1000);
      this.signals.isPlayerOnPlatform = true;
    } else {
      this.signals.isPlayerOnPlatform = false;
    }

    // 更新信号
    this.signals.playerX = Math.round(this.player.x * 100) / 100;
    this.signals.playerY = Math.round(this.player.y * 100) / 100;
    this.signals.platformX = Math.round(this.platform.x * 100) / 100;
    this.signals.platformY = Math.round(this.platform.y * 100) / 100;
    this.signals.platformDirection = this.platformDirection;

    // 更新调试信息
    this.debugText.setText([
      `Player: (${this.signals.playerX}, ${this.signals.playerY})`,
      `Platform: (${this.signals.platformX}, ${this.signals.platformY})`,
      `Direction: ${this.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
      `On Platform: ${this.signals.isPlayerOnPlatform}`,
      `Frame: ${this.signals.frameCount}`
    ]);

    // 每60帧输出一次日志
    if (this.signals.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        timestamp: time,
        frame: this.signals.frameCount,
        player: { x: this.signals.playerX, y: this.signals.playerY },
        platform: { x: this.signals.platformX, y: this.signals.platformY, dir: this.platformDirection },
        onPlatform: this.signals.isPlayerOnPlatform
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
  scene: MovingPlatformScene
};

new Phaser.Game(config);