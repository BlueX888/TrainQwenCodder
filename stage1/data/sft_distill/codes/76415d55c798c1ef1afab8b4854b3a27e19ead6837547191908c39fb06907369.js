// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformVelocity: 0,
  playerOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.platform = null;
    this.cursors = null;
    this.platformDirection = 1; // 1: 向右, -1: 向左
    this.platformSpeed = 240;
    this.platformMinX = 100;
    this.platformMaxX = 600;
  }

  preload() {
    // 创建绿色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platformTex', 200, 32);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platformTex');
    this.platform.setImmovable(true); // 平台不受碰撞影响
    this.platform.body.allowGravity = false; // 平台不受重力影响
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(300, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加玩家与平台的碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      // 碰撞回调，用于检测玩家是否在平台上
      window.__signals__.playerOnPlatform = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000, 0.5);
    graphics.strokeRect(this.platformMinX - 100, 0, this.platformMaxX - this.platformMinX + 200, 600);

    // 添加文本说明
    this.add.text(10, 10, 'Use Arrow Keys to Move Player', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    this.add.text(10, 30, 'Green Platform moves horizontally', {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  update(time, delta) {
    // 重置平台状态标记
    window.__signals__.playerOnPlatform = false;

    // 检测平台是否到达边界并反转方向
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
      // 如果玩家在平台上，保持平台的水平速度
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
        window.__signals__.playerOnPlatform = true;
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformVelocity = Math.round(this.platform.body.velocity.x);
    window.__signals__.frameCount++;

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        playerPos: { x: window.__signals__.playerX, y: window.__signals__.playerY },
        platformPos: window.__signals__.platformX,
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