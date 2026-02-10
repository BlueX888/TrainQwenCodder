// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformY: 0,
  platformVelocity: 160,
  isOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platform = null;
    this.player = null;
    this.cursors = null;
    this.platformDirection = 1; // 1为向右，-1为向左
    this.platformMinX = 100;
    this.platformMaxX = 600;
  }

  preload() {
    // 创建灰色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1); // 灰色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0080ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(160 * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(300, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platform, this.onPlatformCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加边界显示（可选，用于调试）
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeRect(this.platformMinX, 0, this.platformMaxX - this.platformMinX, 600);

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    console.log('Game initialized:', JSON.stringify({
      platformSpeed: 160,
      gravity: 800,
      platformRange: [this.platformMinX, this.platformMaxX]
    }));
  }

  onPlatformCollision(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      window.__signals__.isOnPlatform = true;
    }
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 平台边界检测和方向反转
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(160);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(-160);
    }

    // 玩家控制
    const playerSpeed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformY = Math.round(this.platform.y);
    window.__signals__.platformVelocity = this.platform.body.velocity.x;
    window.__signals__.isOnPlatform = this.player.body.touching.down && this.platform.body.touching.up;

    // 更新显示文本
    this.infoText.setText([
      `Platform X: ${window.__signals__.platformX}`,
      `Platform Vel: ${window.__signals__.platformVelocity}`,
      `Player X: ${window.__signals__.playerX}`,
      `Player Y: ${window.__signals__.playerY}`,
      `On Platform: ${window.__signals__.isOnPlatform}`,
      `Frame: ${window.__signals__.frameCount}`,
      '',
      'Controls: Arrow Keys to move, Up to jump'
    ]);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log('Status:', JSON.stringify({
        frame: window.__signals__.frameCount,
        platformX: window.__signals__.platformX,
        platformVel: window.__signals__.platformVelocity,
        playerOnPlatform: window.__signals__.isOnPlatform
      }));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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