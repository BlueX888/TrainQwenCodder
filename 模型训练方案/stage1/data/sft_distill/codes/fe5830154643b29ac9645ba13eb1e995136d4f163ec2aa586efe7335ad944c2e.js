class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 360;
    this.platformDirection = 1; // 1: 右, -1: 左
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
    this.platformX = 400; // 状态信号：平台X位置
    this.playerX = 400; // 状态信号：玩家X位置
    this.platformBounces = 0; // 状态信号：平台反弹次数
  }

  preload() {
    // 创建红色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 60);
    playerGraphics.generateTexture('player', 40, 60);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys: Move Player\nPlatform moves horizontally', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.platformCollider = this.physics.add.collider(this.player, this.platform, () => {
      // 当玩家站在平台上时
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        // 玩家跟随平台移动
        this.player.body.velocity.x += this.platform.body.velocity.x * 0.02;
      }
    });

    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // 重置平台状态
    if (!this.player.body.touching.down || !this.platform.body.touching.up) {
      this.playerOnPlatform = false;
    }

    // 平台边界检测和速度反转
    if (this.platform.x <= 100) {
      this.platformDirection = 1;
      this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformBounces++;
    } else if (this.platform.x >= 700) {
      this.platformDirection = -1;
      this.platform.body.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformBounces++;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果不在平台上，减速
      if (!this.playerOnPlatform) {
        this.player.setVelocityX(this.player.body.velocity.x * 0.9);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新状态信号
    this.platformX = Math.round(this.platform.x);
    this.playerX = Math.round(this.player.x);

    // 显示状态信息
    this.statusText.setText([
      `Platform X: ${this.platformX}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Player X: ${this.playerX}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform Bounces: ${this.platformBounces}`
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);