// 初始化可验证信号
window.__signals__ = {
  platformX: 0,
  platformY: 0,
  platformVelocity: 0,
  playerX: 0,
  playerY: 0,
  playerOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 240;
    this.platformMinX = 100;
    this.platformMaxX = 700;
  }

  preload() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1); // 绿色
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.platformCollider = this.physics.add.collider(this.player, this.platform, () => {
      window.__signals__.playerOnPlatform = true;
    });
    
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动玩家，空格键跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 重置平台碰撞状态
    window.__signals__.playerOnPlatform = false;

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
      // 如果玩家在平台上，跟随平台移动
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
        window.__signals__.playerOnPlatform = true;
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新信号
    window.__signals__.platformX = Math.round(this.platform.x);
    window.__signals__.platformY = Math.round(this.platform.y);
    window.__signals__.platformVelocity = Math.round(this.platform.body.velocity.x);
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);

    // 更新调试文本
    this.debugText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Platform: (${window.__signals__.platformX}, ${window.__signals__.platformY})`,
      `Platform Velocity: ${window.__signals__.platformVelocity}`,
      `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `On Platform: ${window.__signals__.playerOnPlatform}`
    ]);

    // 每100帧输出一次日志
    if (window.__signals__.frameCount % 100 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        platform: {
          x: window.__signals__.platformX,
          y: window.__signals__.platformY,
          velocity: window.__signals__.platformVelocity
        },
        player: {
          x: window.__signals__.playerX,
          y: window.__signals__.playerY,
          onPlatform: window.__signals__.playerOnPlatform
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