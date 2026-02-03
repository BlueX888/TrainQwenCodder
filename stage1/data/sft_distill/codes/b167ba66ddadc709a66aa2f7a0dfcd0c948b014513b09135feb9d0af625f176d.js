// 全局信号对象
window.__signals__ = {
  platformX: 0,
  platformVelocity: 0,
  playerX: 0,
  playerY: 0,
  playerOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platform = null;
    this.player = null;
    this.cursors = null;
    this.platformSpeed = 240;
    this.platformMinX = 100;
    this.platformMaxX = 700;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFFFF00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platformTex', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();

    // 创建地面（静态）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    const ground = this.physics.add.sprite(400, 575, 'groundTex');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('Game initialized:', JSON.stringify({
      platformSpeed: this.platformSpeed,
      platformRange: [this.platformMinX, this.platformMaxX],
      gravity: 600
    }));
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platform.x = this.platformMinX;
      this.platform.setVelocityX(this.platformSpeed);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.x = this.platformMaxX;
      this.platform.setVelocityX(-this.platformSpeed);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测玩家是否在平台上
    const playerOnPlatform = this.physics.overlap(this.player, this.platform) && 
                            this.player.body.touching.down;

    // 更新信号
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformVelocity = this.platform.body.velocity.x;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.playerOnPlatform = playerOnPlatform;

    // 更新显示文本
    this.infoText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Platform X: ${window.__signals__.platformX}`,
      `Platform Velocity: ${window.__signals__.platformVelocity}`,
      `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `On Platform: ${playerOnPlatform ? 'YES' : 'NO'}`,
      '',
      'Controls: Arrow Keys to Move, UP to Jump'
    ]);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log('Status:', JSON.stringify({
        frame: window.__signals__.frameCount,
        platform: {
          x: window.__signals__.platformX,
          velocity: window.__signals__.platformVelocity
        },
        player: {
          x: window.__signals__.playerX,
          y: window.__signals__.playerY,
          onPlatform: playerOnPlatform
        }
      }));
    }
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);