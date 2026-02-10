// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformY: 0,
  platformVelocity: 0,
  playerOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 240;
    this.platformDirection = 1; // 1: 右移, -1: 左移
    this.platformMinX = 100;
    this.platformMaxX = 700;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建平台纹理（绿色长方形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      window.__signals__.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys: Move\nSpace: Jump\nStand on green platform!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加调试信息文字
    this.debugText = this.add.text(10, 100, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 重置平台状态
    window.__signals__.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.physics.overlap(this.player, this.platform) && 
          this.player.body.touching.down) {
        this.player.setVelocityX(this.platform.body.velocity.x);
        window.__signals__.playerOnPlatform = true;
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformY = Math.round(this.platform.y);
    window.__signals__.platformVelocity = Math.round(this.platform.body.velocity.x);

    // 更新调试信息
    this.debugText.setText([
      `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `Platform: (${window.__signals__.platformX}, ${window.__signals__.platformY})`,
      `Platform Vel: ${window.__signals__.platformVelocity}`,
      `On Platform: ${window.__signals__.playerOnPlatform}`,
      `Frame: ${window.__signals__.frameCount}`
    ].join('\n'));

    // 输出日志（每60帧输出一次）
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        playerPos: [window.__signals__.playerX, window.__signals__.playerY],
        platformPos: [window.__signals__.platformX, window.__signals__.platformY],
        platformVel: window.__signals__.platformVelocity,
        onPlatform: window.__signals__.playerOnPlatform
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);